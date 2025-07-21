const Repository = require('../repositories/repository.js');
const {Builder, By, Key, until, Actions} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const EzAdminService = require('./ezAdmin.service.js');
const ExcelService = require('./excel.service.js');

const option = require('../config/driver.option.js');

    // 다운로드 경로 설정
    const path = require('path');
    const fs = require('fs');
    const downloadPath = path.join(__dirname, '../downloads'); // 프로젝트 루트의 downloads 폴더
    const csListPath = path.join(__dirname, '../csList'); // CSV 저장 폴더
    


class MusinsaService {
    repository = new Repository();
    driver = null; // driver 인스턴스를 클래스 속성으로 관리

    // Chrome 옵션을 클래스 레벨에서 설정
    constructor() {
        this.ezAdminService = new EzAdminService();
        this.excelService = new ExcelService();

<<<<<<< HEAD
        this.options = option
=======
    this.options = new chrome.Options();
    this.options.addArguments('--window-size=1920,1080');
    this.options.addArguments('--no-sandbox');
    this.options.addArguments('--headless'); // Uncomment this line to run in headless mode
    this.options.addArguments('--disable-gpu');
    this.options.addArguments('--disable-dev-shm-usage');
        //this.options.addArguments('--headless');           // 헤드리스 모드
        //this.options.addArguments('--disable-gpu');

>>>>>>> acd779ae729a3d9e20652a4b6b0455db6f3c858f

            // 다운로드 경로 설정
    const path = require('path');
    const fs = require('fs');
    const downloadPath = path.join(__dirname, '../downloads'); // 프로젝트 루트의 downloads 폴더
    const csListPath = path.join(__dirname, '../csList'); // CSV 저장 폴더

    // 다운로드 폴더가 없으면 생성
    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath, { recursive: true });
      console.log('다운로드 폴더 생성:', downloadPath);
    }
    
    // cslist 폴더가 없으면 생성
    if (!fs.existsSync(csListPath)) {
      fs.mkdirSync(csListPath, { recursive: true });
      console.log('cslist 폴더 생성:', csListPath);
    }
    
    this.options.setUserPreferences({
      'download.default_directory': downloadPath,
      'download.prompt_for_download': false,
      'download.directory_upgrade': true,
      'safebrowsing.enabled': true,
      'plugins.always_open_pdf_externally': true // PDF 파일 자동 다운로드
    });
    
    this.downloadPath = downloadPath; // 나중에 사용할 수 있도록 저장
    this.csListPath = csListPath; // CSV 저장 경로
    }

    // WebDriver 인스턴스를 생성하는 메서드
    async createDriver() {
        return await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(this.options)
            .build();
    }

    login = async (loginId, pw , twoFactor) => {
        this.closeDriver()
        if (!this.driver) {
            this.driver = await this.createDriver();
        }

        try {
            console.log('로그인 페이지로 이동 중...');
            await this.driver.get('https://partner.musinsa.com/auth/login');
            
            // 페이지 로딩 완료까지 기다림
            await this.driver.wait(async () => {
                const readyState = await this.driver.executeScript('return document.readyState');
                return readyState === 'complete';
            }, 15000);
            
            console.log('로그인 페이지 로딩 완료');
            
            // 로그인 폼이 나타날 때까지 기다림
            console.log('로그인 폼 대기 중...');
            await this.driver.wait(until.elementLocated(By.name('id')), 10000);
            await this.driver.wait(until.elementLocated(By.name('password')), 10000);
            
            // 추가 안정화 대기
            await this.driver.sleep(1000);
            
            console.log('아이디 입력 중...');
            const idField = await this.driver.findElement(By.name('id'));
            await idField.clear(); // 기존 값 클리어
            await idField.sendKeys(loginId);
            
            console.log('패스워드 입력 중...');
            const pwField = await this.driver.findElement(By.name('password'));
            await pwField.clear(); // 기존 값 클리어
            await pwField.sendKeys(pw);

            // 로그인 버튼 클릭
            console.log('로그인 버튼 클릭...');
            let loginButton = await this.driver.findElement(By.xpath('//button[contains(text(), "로그인") or @type="submit"]'));
            await loginButton.click();
            
            // 로그인 처리 대기
            await this.driver.sleep(1000);

            // 2단계 인증
            const currentUrlAfterLogin = await this.driver.getCurrentUrl();
            if(currentUrlAfterLogin.includes('/auth/two-factor')) {

                await this.driver.wait(until.elementLocated(By.name('verificationCode')), 10000);
                console.log('2단계 인증 코드 입력 중...');
                const twoFactorField = await this.driver.findElement(By.name('verificationCode'));
                await twoFactorField.clear();
                await twoFactorField.sendKeys(twoFactor);
                console.log('2단계 인증 코드 입력 완료, 로그인 버튼 클릭 중...');
                let loginButton = await this.driver.findElement(By.xpath('//button[contains(text(), "로그인") or @type="submit"]'))
                await loginButton.click(); 
            }

            // 현재 URL 확인하여 로그인 성공 여부 판단
            await this.driver.sleep(1000);
            const currentUrl = await this.driver.getCurrentUrl();
            console.log('로그인 후 현재 URL:', currentUrl);

            if (currentUrl.includes('/auth/login') || currentUrl.includes('/auth/two-factor')) {
                // 아직 로그인 페이지에 있으면 실패
                return {
                    success: false,
                    statusCode: 401,
                    message: '로그인에 실패했습니다. 아이디와 패스워드를 확인해주세요.',
                    currentUrl: currentUrl
                };
            } else {
                // 다른 페이지로 이동했으면 성공
                return {
                    success: true,
                    statusCode: 200,
                    message: '로그인에 성공했습니다.',
                    currentUrl: currentUrl
                };
            }

        } catch (error) {
            console.error('로그인 중 오류:', error);
            // 명시적으로 객체 반환
            return {
                success: false,
                statusCode: 500,
                message: '로그인 중 오류가 발생했습니다: ' + error.message,
                error: error.message
            };
        }
        // 메서드 끝에 기본 반환값 추가 (혹시 모를 경우를 위해)
    }

    updateCsListForReturn = async (loginId,password,twoFactor) => {
        try{
            await this.login(loginId,password,twoFactor)
            await this.downloadClaimList();
            console.log('다운로드 완료')
            let jsonData = await this.excelService.convertExcelXmlToJson(path.join(this.downloadPath, 'export.xls'));
            //jsonData를 csList폴더에 저장
            const jsonFilePath = path.join(this.csListPath, 'musinsa.json');
        await fs.promises.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 2));

        return {
            success: true,
            statusCode: 200,
            message: '무신사 CS 리스트가 업데이트되었습니다.'
        }
    }catch (error) {
            console.error('무신사 CS 리스트 업데이트 중 오류 발생:', error);
            return {
                success: false,
                statusCode: 500,
                message: '무신사 CS 리스트 업데이트 중 오류가 발생했습니다: ' + error.message,
                error: error.message
            };
    }
    }

    getInfoByReturnTraceNumber = async (returnNumber) => {
    const jsonString = fs.readFileSync(path.join(this.csListPath, 'musinsa.json'), 'utf8');
    const data = JSON.parse(jsonString);
    
    const info = data.filter(item => item.반품운송장 === returnNumber);

    if (!info) {
        return {
            success: false,
            statusCode: 404,
            message: '해당 반품 운송장 번호에 대한 정보가 없습니다.'
        };
    } else {
        return {
            success: true,
            statusCode: 200,
            data: info
        };
    }
    }

    getClaimNumber = async (orderNumber, serialNumber) => {
        if (!this.driver) {
            return {
                success: false,
                statusCode: 401,
                message: '먼저 로그인을 진행하세요.'
            };
        }

        // CS 주문정보 페이지로 이동
        await this.driver.get(`https://bizest.musinsa.com/po/order-group-admin/order/ord01/detail?ORD_NO=${orderNumber}&ORD_OPT_NO=${serialNumber}&LAYOUT_TYPE=popup`);

        // 페이지 로딩 완료까지 기다림

        await this.driver.wait(until.elementLocated(By.xpath('//*[@id="app_ord01_claim"]')), 15000);


        try {
            // 클레임 번호 추출
            let inputElement = await this.driver.findElement(By.xpath('//*[@id="app_ord01_claim"]/div/div/input[@name="CLM_NO"]'));
            // value 속성 가져오기
            let CLM_NO = await inputElement.getAttribute('value');
            console.log('CLM_NO 값:', CLM_NO);
            return {
                success: true, 
                statusCode: 200,
                CLM_NO: CLM_NO
            };
        } catch (error) {
            console.error('CLM_NO 추출 오류:', error);
            return {
                success: false,
                statusCode: 500,
                message: 'CLM_NO 추출 중 오류가 발생했습니다: ' + error.message,
                error: error.message
            };
        }
    }

    getOriginalTrace = async (req) => {
        let returnTrace = req.params
        return returnTrace
    }

    processCheckList= async (serialNumber, claimNumber) => {
        try {
            if (!this.driver) {
                return {
                    success: false,
                    statusCode: 401,
                    message: '먼저 로그인을 진행하세요.'
                };
            }
        await this.driver.get(`https://bizest.musinsa.com/po/order-group-admin/popup/pop_return_success?ORD_OPT_NO=${serialNumber}&CLM_NO=${claimNumber}&PROVIDER=HO&LAYOUT_TYPE=popup`);
            // 페이지 로딩 완료까지 기다림
            await this.driver.wait(until.elementLocated(By.xpath('//*[@id="content"]')), 15000);

            let button = await this.driver.findElement(By.xpath('//*[@id="content"]//a[@class="btn_important"]')).click()
            await this.driver.wait(until.alertIsPresent(), 3000)
            let alert = await this.driver.switchTo().alert()
            if(await alert.getText() === '검수합격처리 하시겠습니까?') {
            await alert.accept()
            console.log('검수합격처리 완료');
            }
            await this.driver.wait(until.alertIsPresent(), 3000)
            await this.driver.switchTo().alert();
            let alertText = await this.driver.switchTo().alert().getText();
            console.log('alert text:', alertText);
            if(alertText === '클레임이 처리되었습니다.' || alertText === '검수가 완료 되었습니다.' || alertText === '이미 처리가 완료된 클레임 입니다.'  ) {
                await this.driver.switchTo().alert().accept();
                console.log('클레임 처리 완료');
                return {
                success: true,
                statusCode: 200,
                message: alertText
                }
            } else {
                return {
                success: false,
                statusCode: 500,
                message: '처리되지 않은 클레임'
                };
            }

            
        


        } catch (error) {
            console.error('processCheckList 오류:', error);
            return {
                success: false,
                statusCode: 500,
                message: '데이터 처리 중 오류가 발생했습니다: ' + error.message,
                error: error.message
            };
        }
    }


    getClaimList = async () => {
        try{
        await this.ezAdminService.convertXlsToJson('musinsa.xls', 'musinsa.json', this.csListPath);

        // 원본 파일 삭제
        } catch (error) {
            console.error('클레임 목록 다운로드 중 오류 발생:', error);
            return {
                success: false,
                statusCode: 500,
                message: '클레임 목록 다운로드 중 오류가 발생했습니다: ' + error.message,
                error: error.message
            };
        }
    }

    downloadClaimList = async () => {
        if (!this.driver) {
            return {
                success: false,
                statusCode: 401,
                message: '먼저 로그인을 진행하세요.'
            };
        }

        // CS 클레임 목록 페이지로 이동(iframe)
        await this.driver.get('https://bizest.musinsa.com/po/order-group-admin/order/ord06?&LAYOUT_TYPE=popup');

        // 페이지 로딩 완료까지 기다림
        await this.driver.wait(async () => {
            const readyState = await this.driver.executeScript('return document.readyState');
            return readyState === 'complete';
        }, 15000);

        await this.driver.sleep(1000);

        // 현재 URL 확인
        const currentUrl = await this.driver.getCurrentUrl();
        console.log('현재 URL:', currentUrl);

        if (currentUrl.includes('/auth/login')) {
            return {
                success: false,
                statusCode: 401,
                message: '세션이 만료되었습니다. 다시 로그인해주세요.',
                redirectedUrl: currentUrl
            };
        }
        // 데이터총수량 대기
        await this.driver.wait(until.elementLocated(By.xpath('//*[@id="app_ord06_grid"]')), 15000);
        await this.driver.findElement(By.linkText('데이터 총 수량 조회')).click();
        
        // alert 처리 - 안전한 방법
        try {
            await this.driver.wait(until.alertIsPresent(), 3000);
            const alert = await this.driver.switchTo().alert();
            console.log('Alert 메시지:', await alert.getText());
            await alert.accept();
        } catch (error) {
            console.log('Alert 처리 중 오류:', error.message);
        }
        
        //조회 전 총수량
        let totalCount = await this.driver.findElement(By.xpath('//*[@id="app_ord06_grid"]/div[@class="wrapper-list-info"]/div[@class="text-counter"]')).getText();

        let totalCountAfterSearch = await this.driver.findElement(By.xpath('//*[@id="app_ord06_grid"]/div[@class="wrapper-list-info"]/div[@class="text-counter"]')).getText();
        let attempts = 0;
        const startTime = Date.now();
        const timeout = 30000; // 30초 타임아웃
        
        while (totalCount === totalCountAfterSearch && attempts < 5 && Date.now() - startTime < timeout) {
            await this.driver.sleep(1000);
            totalCountAfterSearch = await this.driver.findElement(By.xpath('//*[@id="app_ord06_grid"]/div[@class="wrapper-list-info"]/div[@class="text-counter"]')).getText();
            attempts++;
        }
        const text = totalCountAfterSearch 
        const match = text.match(/\/(\d+)/);
        totalCountAfterSearch = match ? match[1] : null;
        let searchValue= await this.driver.findElement(By.xpath('//*[@id="SEARCH_ITEM_S_LIMIT"]/dl/dd/select/option[1]'));
        await this.driver.executeScript("arguments[0].setAttribute('value', arguments[1]);", searchValue, totalCountAfterSearch);
        await this.driver.findElement(By.id('S_ORD_NO')).sendKeys(Key.ENTER);
        await this.driver.wait(until.elementLocated(By.xpath('//*[@id="borderLayout_eGridPanel"]/div[1]/div/div[4]/div[1]/div/div[1]')), 15000);
        const grid = await this.driver.findElement(By.xpath('//*[@id="borderLayout_eGridPanel"]/div[1]/div/div[4]/div[1]/div/div[1]/div[5]'))
        await this.driver.actions()
            .move({ origin: grid })
            .contextClick()
            .perform();
        await this.driver.findElement(By.xpath('//*[@id="borderLayout_eRootPanel"]/div[4]/div/div/div[3]')).click()
        await this.waitForDownload('export.xls')
        


        return {
            success: true,
            statusCode: 200,
            message: '클레임 목록을 성공적으로 다운로드했습니다.',
        };



    }

    // driver를 수동으로 종료하는 메서드
    async closeDriver() {
        if (this.driver) {
            try {
                console.log('Driver 종료 중...');
                await this.driver.quit();
                console.log('Driver 종료됨');
                this.driver = null;
                return {
                    success: true,
                    statusCode: 200,
                    message: 'Driver가 성공적으로 종료되었습니다.'
                };
            } catch (error) {
                console.error('Driver 종료 중 오류:', error);
                this.driver = null;
                return {
                    success: false,
                    statusCode: 500,
                    message: 'Driver 종료 중 오류가 발생했습니다: ' + error.message
                };
            }
        } else {
            return {
                success: true,
                statusCode: 200,
                message: '종료할 Driver가 없습니다.'
            };
        }
    }

    // Alert 처리 헬퍼 메서드들
    async handleAlert(action = 'accept', timeout = 3000) {
        try {
            await this.driver.wait(until.alertIsPresent(), timeout);
            const alert = await this.driver.switchTo().alert();
            const alertText = await alert.getText();
            console.log('Alert 메시지:', alertText);
            
            if (action === 'accept') {
                await alert.accept();
            } else if (action === 'dismiss') {
                await alert.dismiss();
            }
            
            return alertText;
        } catch (error) {
            console.log('Alert 처리 중 오류:', error.message);
            return null;
        }
    }

    async isAlertPresent() {
        try {
            await this.driver.wait(until.alertIsPresent(), 100);
            return true;
        } catch (error) {
            return false;
        }
    }

    async dismissAnyAlert() {
        try {
            if (await this.isAlertPresent()) {
                const alert = await this.driver.switchTo().alert();
                await alert.dismiss();
                console.log('예상치 못한 alert을 dismiss했습니다.');
            }
        } catch (error) {
            console.log('Alert dismiss 중 오류:', error.message);
        }
    }

    async waitForDownload(fileName, timeoutMs = 30000) {
    const fs = require('fs');
    const path = require('path');
    
    const filePath = path.join(this.downloadPath, fileName);
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      if (fs.existsSync(filePath)) {
        // 파일이 완전히 다운로드될 때까지 대기 (.crdownload 파일이 없어질 때까지)
        const crdownloadPath = filePath + '.crdownload';
        if (!fs.existsSync(crdownloadPath)) {
          console.log('다운로드 완료:', filePath);
          return filePath;
        }
      }
      await this.driver.sleep(1000); // 1초 대기
    }
    
    throw new Error(`다운로드 타임아웃: ${fileName}`);
  }
}

module.exports = MusinsaService;
