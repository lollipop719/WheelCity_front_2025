/**
 * 카카오맵 영업시간 크롤링 스크립트
 * 
 * 사용법:
 * 1. npm install puppeteer 실행
 * 2. node crawl_business_hours.js
 * 
 * 주의: 이 스크립트는 테스트용이며, 카카오맵 이용약관을 확인하세요.
 */

const puppeteer = require('puppeteer');

// 크롤링할 장소 이름 리스트
const placeNames = [
    '엔제리너스 대전카이스트점',
    '탐앤탐스 대전카이스트점',
    '오간다 대전카이스트점',
    '파스쿠찌 대전카이스트점',
    '카페드림 KAIST점'
];

/**
 * 카카오맵에서 장소 검색 후 영업시간 정보 추출
 */
async function crawlKakaoMapBusinessHours(placeName) {
    const browser = await puppeteer.launch({
        headless: false, // 디버깅을 위해 브라우저 창 표시
        defaultViewport: {
            width: 1280,
            height: 800
        }
    });

    try {
        const page = await browser.newPage();
        
        // 카카오맵 접속
        console.log(`\n[${placeName}] 검색 시작...`);
        await page.goto('https://map.kakao.com/', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // 검색창에 장소명 입력
        await page.waitForSelector('#search\\.keyword\\.query', { timeout: 10000 });
        await page.type('#search\\.keyword\\.query', placeName);
        
        // 검색 버튼 클릭
        await page.click('#search\\.keyword\\.submit');
        
        // 검색 결과 대기
        await page.waitForTimeout(2000);
        
        // 첫 번째 검색 결과 클릭
        const searchResultSelector = '#info\\.search\\.place\\.list > li:first-child a';
        await page.waitForSelector(searchResultSelector, { timeout: 10000 });
        await page.click(searchResultSelector);
        
        // 상세 정보 페이지 로딩 대기
        await page.waitForTimeout(3000);

        // iframe으로 전환 (카카오맵은 iframe 사용)
        const frames = page.frames();
        const detailFrame = frames.find(frame => 
            frame.url().includes('place.kakao.com')
        );

        if (!detailFrame) {
            console.log(`[${placeName}] 상세 정보 iframe을 찾을 수 없습니다.`);
            return null;
        }

        // 영업시간 정보 추출
        let businessHours = null;
        
        try {
            // 영업시간 섹션 찾기 (선택자는 카카오맵 구조에 따라 변경 필요)
            const hoursSelector = '.location_detail .txt_operation';
            await detailFrame.waitForSelector(hoursSelector, { timeout: 5000 });
            
            businessHours = await detailFrame.evaluate((selector) => {
                const element = document.querySelector(selector);
                if (!element) return null;
                
                // 영업시간 정보 텍스트 추출
                const timeInfo = element.textContent.trim();
                
                // 상세 영업시간 (펼치기 클릭 후)
                const detailBtn = document.querySelector('.location_detail .btn_more');
                if (detailBtn) {
                    detailBtn.click();
                }
                
                return {
                    summary: timeInfo,
                    timestamp: new Date().toISOString()
                };
            }, hoursSelector);

            // 상세 영업시간 대기 및 추출
            await detailFrame.waitForTimeout(1000);
            
            const detailHours = await detailFrame.evaluate(() => {
                const detailList = document.querySelectorAll('.location_detail .list_operation li');
                const hours = {};
                
                detailList.forEach(li => {
                    const dayElement = li.querySelector('.txt_day');
                    const timeElement = li.querySelector('.txt_time');
                    
                    if (dayElement && timeElement) {
                        const day = dayElement.textContent.trim();
                        const time = timeElement.textContent.trim();
                        hours[day] = time;
                    }
                });
                
                return Object.keys(hours).length > 0 ? hours : null;
            });

            if (detailHours) {
                businessHours.details = detailHours;
            }

            // 전화번호 추출
            const phoneNumber = await detailFrame.evaluate(() => {
                const phoneElement = document.querySelector('.location_detail .txt_phone');
                return phoneElement ? phoneElement.textContent.trim() : null;
            });

            // 주소 추출
            const address = await detailFrame.evaluate(() => {
                const addressElement = document.querySelector('.location_detail .txt_address');
                return addressElement ? addressElement.textContent.trim() : null;
            });

            const result = {
                placeName: placeName,
                businessHours: businessHours,
                phoneNumber: phoneNumber,
                address: address,
                crawledAt: new Date().toISOString()
            };

            console.log(`[${placeName}] 크롤링 성공:`, JSON.stringify(result, null, 2));
            return result;

        } catch (error) {
            console.log(`[${placeName}] 영업시간 정보를 찾을 수 없습니다:`, error.message);
            return {
                placeName: placeName,
                error: '영업시간 정보 없음',
                crawledAt: new Date().toISOString()
            };
        }

    } catch (error) {
        console.error(`[${placeName}] 크롤링 실패:`, error.message);
        return {
            placeName: placeName,
            error: error.message,
            crawledAt: new Date().toISOString()
        };
    } finally {
        await browser.close();
    }
}

/**
 * 여러 장소 크롤링 실행
 */
async function crawlMultiplePlaces(places) {
    console.log('=== 카카오맵 영업시간 크롤링 시작 ===');
    console.log(`총 ${places.length}개 장소 크롤링 예정\n`);
    
    const results = [];
    
    // 순차적으로 크롤링 (동시 실행 시 차단될 수 있음)
    for (const place of places) {
        const result = await crawlKakaoMapBusinessHours(place);
        results.push(result);
        
        // 다음 크롤링 전 대기 (너무 빠르면 차단될 수 있음)
        console.log('다음 크롤링까지 3초 대기...\n');
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    console.log('\n=== 크롤링 완료 ===');
    console.log('결과:', JSON.stringify(results, null, 2));
    
    // 결과를 JSON 파일로 저장
    const fs = require('fs');
    const outputPath = './business_hours_data.json';
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`\n결과가 ${outputPath}에 저장되었습니다.`);
    
    return results;
}

// 스크립트 직접 실행 시
if (require.main === module) {
    crawlMultiplePlaces(placeNames)
        .then(() => {
            console.log('\n모든 작업 완료!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n크롤링 중 오류 발생:', error);
            process.exit(1);
        });
}

module.exports = {
    crawlKakaoMapBusinessHours,
    crawlMultiplePlaces
};

