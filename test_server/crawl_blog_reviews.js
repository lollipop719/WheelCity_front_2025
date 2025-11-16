/**
 * 카카오맵 블로그 리뷰 크롤링 모듈
 */

const puppeteer = require('puppeteer');

// 크롤링 캐시
const cache = new Map();
const CACHE_DURATION = 1000 * 60 * 30; // 30분

/**
 * 카카오맵에서 블로그 리뷰 크롤링
 * @param {string} placeId - 카카오 장소 ID
 * @returns {Promise<Array>} 블로그 리뷰 배열
 */
async function crawlBlogReviews(placeId) {
    // 캐시 확인
    if (cache.has(placeId)) {
        const cached = cache.get(placeId);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log(`[캐시] 블로그 리뷰 ${placeId} 반환`);
            return cached.data;
        }
    }

    console.log(`[크롤링 시작] 블로그 리뷰 - Place ID: ${placeId}`);
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        
        // User-Agent 설정
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // 블로그 리뷰 페이지로 이동
        const url = `https://place.map.kakao.com/${placeId}#blogreview`;
        console.log(`접속 URL: ${url}`);
        
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
        
        // 블로그 리뷰 탭이 로드될 때까지 대기 (좀 더 길게)
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 블로그 리뷰 리스트가 나타날 때까지 대기
        try {
            await page.waitForSelector('.list_blog, .info_blog', { timeout: 5000 });
        } catch (e) {
            console.log('블로그 리뷰 선택자를 찾을 수 없음, 계속 진행...');
        }

        // 디버깅용 스크린샷 저장 (선택적)
        if (process.env.DEBUG_SCREENSHOTS === 'true') {
            try {
                await page.screenshot({ 
                    path: `debug_blog_${placeId}_${Date.now()}.png`,
                    fullPage: true 
                });
                console.log('디버그 스크린샷 저장됨');
            } catch (e) {
                console.log('스크린샷 저장 실패:', e.message);
            }
        }

        // 블로그 리뷰 정보 추출
        const reviews = await page.evaluate(() => {
            const reviewList = [];
            
            // 블로그 리뷰 리스트 선택자 (여러 패턴 시도)
            let reviewElements = document.querySelectorAll('.list_blog > li');
            
            // 대체 선택자 시도
            if (reviewElements.length === 0) {
                reviewElements = document.querySelectorAll('.info_blog');
            }
            if (reviewElements.length === 0) {
                reviewElements = document.querySelectorAll('[class*="blog"] li');
            }
            
            console.log(`찾은 블로그 리뷰 요소 수: ${reviewElements.length}`);
            
            reviewElements.forEach((element, index) => {
                try {
                    // 블로그 제목 (여러 선택자 시도)
                    let titleElement = element.querySelector('.tit_subject');
                    if (!titleElement) titleElement = element.querySelector('.link_subject');
                    if (!titleElement) titleElement = element.querySelector('a.link_txt');
                    if (!titleElement) titleElement = element.querySelector('strong');
                    let title = titleElement ? titleElement.textContent.trim() : '';
                    
                    // "블로그 타이틀" 텍스트 제거
                    if (title && title.includes('블로그 타이틀')) {
                        title = title.replace(/블로그 타이틀\s*/g, '').trim();
                    }
                    
                    // 블로그 링크
                    const linkElement = element.querySelector('a[href]');
                    const link = linkElement ? linkElement.href : '';
                    
                    // 블로그 내용 미리보기
                    let contentElement = element.querySelector('.review_detail');
                    if (!contentElement) contentElement = element.querySelector('.txt_desc');
                    if (!contentElement) contentElement = element.querySelector('.desc_review');
                    let content = contentElement ? contentElement.textContent.trim() : '';
                    
                    // 본문에서 제목 제거 (제목이 본문에 포함된 경우)
                    if (content && title && content.startsWith(title)) {
                        content = content.substring(title.length).trim();
                    }
                    
                    // 블로그명
                    let blogNameElement = element.querySelector('.txt_name');
                    if (!blogNameElement) blogNameElement = element.querySelector('.link_name');
                    if (!blogNameElement) blogNameElement = element.querySelector('.name_blog');
                    const blogName = blogNameElement ? blogNameElement.textContent.trim() : '';
                    
                    // 작성일
                    let dateElement = element.querySelector('.time_blog');
                    if (!dateElement) dateElement = element.querySelector('.txt_date');
                    if (!dateElement) dateElement = element.querySelector('.date');
                    const date = dateElement ? dateElement.textContent.trim() : '';
                    
                    // 이미지 여러 개 수집
                    const images = [];
                    const imageElements = element.querySelectorAll('img');
                    imageElements.forEach(img => {
                        if (img.src && !img.src.includes('profile') && !img.src.includes('icon')) {
                            images.push(img.src);
                        }
                    });
                    
                    console.log(`리뷰 ${index + 1}: 제목=${title}, 링크=${link}, 이미지 수=${images.length}`);
                    
                    if (title || content) {
                        reviewList.push({
                            title,
                            link,
                            content,
                            blogName,
                            date,
                            images: images.length > 0 ? images : [],
                            thumbnail: images.length > 0 ? images[0] : '' // 호환성을 위해 첫 이미지를 thumbnail로도 저장
                        });
                    }
                } catch (e) {
                    console.error('리뷰 파싱 오류:', e);
                }
            });
            
            return reviewList;
        });

        console.log(`[크롤링 완료] ${reviews.length}개의 블로그 리뷰 발견`);
        
        const result = {
            placeId,
            reviews,
            crawledAt: new Date().toISOString(),
            count: reviews.length
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
            reviews: [],
            error: error.message,
            count: 0
        };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = {
    crawlBlogReviews
};

