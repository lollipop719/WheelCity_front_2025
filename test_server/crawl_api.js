/**
 * 카카오맵 크롤링 API 모듈
 * server.js에서 import하여 사용
 */

const puppeteer = require('puppeteer');

// 크롤링 캐시 (같은 장소를 반복 크롤링하지 않도록)
const cache = new Map();
const CACHE_DURATION = 1000 * 60 * 60; // 1시간

/**
 * 카카오맵에서 장소 정보 크롤링
 */
async function crawlPlaceInfo(placeName, placeUrl) {
    // 캐시 확인
    const cacheKey = placeName + placeUrl;
    if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log(`[캐시] ${placeName} 정보 반환`);
            return cached.data;
        }
    }

    console.log(`[크롤링 시작] ${placeName}`);
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new', // 백그라운드 실행
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        
        // User-Agent 설정 (차단 방지)
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // 카카오맵 place URL로 직접 이동
        if (placeUrl && placeUrl.includes('place.kakao.com')) {
            await page.goto(placeUrl, { waitUntil: 'networkidle2', timeout: 15000 });
        } else {
            // URL이 없으면 검색 방식
            await page.goto('https://map.kakao.com/', { waitUntil: 'networkidle2', timeout: 15000 });
            await page.type('#search\\.keyword\\.query', placeName);
            await page.click('#search\\.keyword\\.submit');
            await page.waitForTimeout(2000);
            await page.click('#info\\.search\\.place\\.list > li:first-child a');
            await page.waitForTimeout(2000);
        }

        // 영업시간 정보 추출 (상세 정보 포함)
        const businessHours = await page.evaluate(() => {
            try {
                // 영업 상태 및 시간 추출 (.row_detail)
                const rowDetail = document.querySelector('.row_detail');
                if (rowDetail) {
                    const statusElement = rowDetail.querySelector('.tit_detail');
                    const timeElement = rowDetail.querySelector('.txt_detail');
                    
                    if (statusElement && timeElement) {
                        const status = statusElement.textContent.trim(); // "영업 중" 또는 "영업 종료"
                        const time = timeElement.textContent.trim(); // "21:00 까지"
                        
                        const result = {
                            status: status,
                            time: time,
                            summary: `${status} · ${time}`
                        };
                        
                        // 요일별 영업시간 상세 정보 추출
                        const foldDetail = rowDetail.querySelector('.fold_detail');
                        if (foldDetail) {
                            const dailyHours = {};
                            const lineFolds = foldDetail.querySelectorAll('.line_fold');
                            
                            lineFolds.forEach(line => {
                                const dayElement = line.querySelector('.tit_fold');
                                const hoursElement = line.querySelector('.txt_detail');
                                
                                if (dayElement && hoursElement) {
                                    const day = dayElement.textContent.trim();
                                    const hours = hoursElement.textContent.trim();
                                    dailyHours[day] = hours;
                                }
                            });
                            
                            // 추가 정보 (예: "20:30분 이후로는 테이크아웃만 가능")
                            const additionalInfo = foldDetail.querySelector('.txt_detail2');
                            if (additionalInfo) {
                                result.additionalInfo = additionalInfo.textContent.trim();
                            }
                            
                            if (Object.keys(dailyHours).length > 0) {
                                result.dailyHours = dailyHours;
                            }
                        }
                        
                        return result;
                    }
                }
                
                // 기존 방식 (간단한 텍스트)
                const selectors = [
                    '.txt_operation',
                    '.operation',
                    '.placeinfo_default .txt_operation',
                    '[class*="operation"]'
                ];
                
                for (const selector of selectors) {
                    const element = document.querySelector(selector);
                    if (element) {
                        return element.textContent.trim();
                    }
                }
                return null;
            } catch (e) {
                console.log('영업시간 추출 오류:', e.message);
                return null;
            }
        });

        // 전화번호 추출
        const phoneNumber = await page.evaluate(() => {
            try {
                const selectors = ['.txt_phone', '.placeinfo_default .phone', '[class*="phone"]'];
                for (const selector of selectors) {
                    const element = document.querySelector(selector);
                    if (element) return element.textContent.trim();
                }
                return null;
            } catch (e) {
                return null;
            }
        });

        // 주소 추출
        const address = await page.evaluate(() => {
            try {
                const selectors = ['.txt_address', '.placeinfo_default .address', '[class*="address"]'];
                for (const selector of selectors) {
                    const element = document.querySelector(selector);
                    if (element) return element.textContent.trim();
                }
                return null;
            } catch (e) {
                return null;
            }
        });

        const result = {
            placeName,
            businessHours: businessHours || null,
            phoneNumber: phoneNumber || null,
            address: address || null,
            crawledAt: new Date().toISOString()
        };

        // 캐시에 저장
        cache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });

        console.log(`[크롤링 완료] ${placeName}`);
        return result;

    } catch (error) {
        console.error(`[크롤링 실패] ${placeName}:`, error.message);
        return {
            placeName,
            businessHours: null,
            phoneNumber: null,
            address: null,
            error: error.message
        };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * 여러 장소를 순차적으로 크롤링
 */
async function crawlMultiplePlaces(places) {
    const results = [];
    
    for (const place of places) {
        const result = await crawlPlaceInfo(place.place_name, place.place_url);
        results.push({
            ...place,
            ...result
        });
        
        // 다음 요청 전 대기 (차단 방지)
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return results;
}

module.exports = {
    crawlPlaceInfo,
    crawlMultiplePlaces
};

