
const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const EzAdminService = require('./ezAdmin.service.js');
const fs = require('fs');
const path = require('path');
const option = require('../config/driver.option.js');

class PostService { 
    csListPath = path.join(__dirname, '..', 'csList')

    // Chrome 옵션을 클래스 레벨에서 설정
    constructor() {
        this.ezAdminService = new EzAdminService();

        this.options = option
    }
    // WebDriver 인스턴스를 생성하는 메서드
    async createDriver() {
        return await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(this.options)
            .build();
    }

    getOriginalTraceNumber = async (returnTraceNumber) => {
        let driver;
        
        try {

            if(returnTraceNumber.length !== 13) {
                return {
                    success: false,
                    statusCode: 400,
                    message: '우체국 반품 추적번호는 13자리여야 합니다.'
                };
            }

            driver = await this.createDriver();

            await driver.get('https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?sid1=' + returnTraceNumber);

            // 페이지가 완전히 로딩되고 테이블이 나타날 때까지 기다림
            await driver.wait(until.elementLocated(By.id('processTable')), 10000);
            
            // 요소가 나타날 때까지 기다림
            await driver.wait(until.elementLocated(By.xpath("//*[@id='processTable']/tbody/tr[last()]/td[last()]/div/a/span")), 10000);
      
            let originalTraceNumberElement = await driver.findElement(By.xpath("//*[@id='processTable']/tbody/tr[last()]/td[last()]/div/a/span"));
            let originalTraceNumber = await originalTraceNumberElement.getText();
            console.log("Original trace number:", originalTraceNumber);
            
            if (!originalTraceNumber || originalTraceNumber.length !== 13) {
                return {
                    success: false,
                    statusCode: 404,
                    message: '유효한 원본 추적번호를 찾을 수 없습니다.'
                };
            } else {
                return {
                    success: true,
                    statusCode: 200,
                    originalTraceNumber: originalTraceNumber
                };
            }
        } catch (error) {
            console.error('Error occurred in PostService:', error);
            return {
                success: false,
                statusCode: 500,
                message: '추적번호 조회 중 오류가 발생했습니다: ' + error.message
            };
        } finally {
            if (driver) {
                await driver.quit();
            }
        }
    }

    getInfoByTraceNumber = async (originalTraceNumber) => {
        let database = await fs.readFileSync(path.join(this.csListPath, 'ezAdmin.json'), 'utf8');
        database = JSON.parse(database); // JSON 문자열에서 양쪽 따옴표 제거 후 파싱
        const result = database.filter(data => data.송장번호 === originalTraceNumber);
        return {
            success: true,
            statusCode: 200,
            data: result
    }

    }
}
module.exports = PostService;