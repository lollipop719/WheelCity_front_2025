/**
 * 카카오맵 웹사이트 정보 크롤링 모듈
 */

// 크롤링 캐시
const cache = new Map();
const CACHE_DURATION = 1000 * 60 * 30; // 30분

/**
 * 카카오맵에서 웹사이트 정보 크롤링
 * @param {string} placeId - 카카오 장소 ID
 * @returns {Promise<Object>} 웹사이트 정보
 */
async function crawlWebsiteInfo(placeId) {
    // puppeteer를 함수 내부에서 require (puppeteer 미설치 시 모듈 로드는 가능하도록)
    let puppeteer;
    try {
        puppeteer = require('puppeteer');
    } catch (e) {
        throw new Error('Puppeteer is not installed');
    }
    // 캐시 확인
    if (cache.has(placeId)) {
        const cached = cache.get(placeId);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log(`[캐시] 웹사이트 정보 ${placeId} 반환`);
            return cached.data;
        }
    }

    console.log(`[크롤링 시작] 웹사이트 정보 - Place ID: ${placeId}`);
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        
        // User-Agent 설정
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // 홈 페이지로 이동
        const url = `https://place.map.kakao.com/${placeId}#home`;
        console.log(`접속 URL: ${url}`);
        
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
        
        // 페이지 로드 대기
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 웹사이트 정보 추출
        const websiteInfo = await page.evaluate(() => {
            // 여러 선택자 시도
            let websiteElement = null;
            
            // 홈페이지 링크 찾기 (다양한 선택자 시도)
            const selectors = [
                'a.link_homepage',
                'a[href*="http"]:not([href*="kakao"])',
                '.link_homepage',
                '.txt_homepage',
                'a.link_url',
                '.location_detail a[target="_blank"]'
            ];
            
            for (const selector of selectors) {
                const elements = document.querySelectorAll(selector);
                for (const element of elements) {
                    const href = element.href || element.getAttribute('href');
                    const text = element.textContent.trim();
                    
                    // 카카오맵 자체 링크가 아니고, http로 시작하는 링크
                    if (href && href.startsWith('http') && 
                        !href.includes('kakao.com') && 
                        !href.includes('daum.net') &&
                        !href.includes('place.map')) {
                        websiteElement = {
                            url: href,
                            displayText: text
                        };
                        console.log('웹사이트 발견:', href);
                        break;
                    }
                }
                if (websiteElement) break;
            }
            
            return websiteElement;
        });

        console.log(`[크롤링 완료] 웹사이트 정보:`, websiteInfo);
        
        const result = {
            placeId,
            website: websiteInfo ? websiteInfo.url : null,
            displayText: websiteInfo ? websiteInfo.displayText : null,
            crawledAt: new Date().toISOString()
        };

        // 캐시에 저장
        cache.set(placeId, {
            data: result,
            timestamp: Date.now()
        });

        return result;

    } catch (error) {
        console.error(`[크롤링 실패] Place ID ${placeId}:`, error.message);
        return {
            placeId,
            website: null,
            error: error.message
        };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = {
    crawlWebsiteInfo
};

