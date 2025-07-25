const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const ExcelService = require('./divein.service.js');
const option = require('../config/driver.option.js');
const EzAdminRepository = require('../repositories/ezAdmin.repository.js');

const EzAdminCsDTO = require('../dto/ezAdminCsDTO.js');

    // 다운로드 경로 설정
    const path = require('path');
    const fs = require('fs');
    const downloadPath = path.join(__dirname, '../downloads'); // 프로젝트 루트의 downloads 폴더
    const csListPath = path.join(__dirname, '../csList'); // CSV 저장 폴더
    

class EzAdminService {
    driver = null;

  // Chrome 옵션을 클래스 레벨에서 설정
  constructor() {
    this.excelService = new ExcelService();
    this.options = option


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
    
    this.options
    this.downloadPath = downloadPath; // 나중에 사용할 수 있도록 저장
    this.csListPath = csListPath; // CSV 저장 경로

    this.ezadminRepository = new EzAdminRepository();
    this.ezAdminCsDTO = EzAdminCsDTO
  }

  // WebDriver 인스턴스를 생성하는 메서드
  async createDriver() {
    return await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(this.options)
      .build();
  }

  login = async (domain, loginId, pw) => {
    await this.closeDriver();
    if (!this.driver) {
      this.driver = await this.createDriver();
    }

    try {
      console.log('이지어드민 페이지로 이동 중...');
      await this.driver.get(`https://ezadmin.co.kr/index.html`);
      
      // 페이지 로딩 완료까지 기다림
      await this.driver.wait(async () => {
        const readyState = await this.driver.executeScript('return document.readyState');
        return readyState === 'complete';
      }, 15000);
      
      console.log('이지어드민 페이지 로딩 완료');
      
      // 로그인 폼이 나타날 때까지 기다림
      console.log('로그인 폼 대기 중...');
      await this.driver.wait(until.elementLocated(By.xpath('//*[@id="login-popup"]')), 10000); 
      // 추가 안정화 대기
      
      await this.driver.findElement(By.xpath('//*[@class="login"]/a')).click();
      
      console.log('도메인 입력 중...');
      const domainField = await this.driver.findElement(By.id('login-domain'));
      await domainField.clear(); // 기존 값 클리어
      await domainField.sendKeys(domain);

      console.log('아이디 입력 중...');
      const idField = await this.driver.findElement(By.id('login-id'));
      await idField.clear(); // 기존 값 클리어
      await idField.sendKeys(loginId);

      console.log('패스워드 입력 중...');
      const pwField = await this.driver.findElement(By.id('login-pwd'));
      await pwField.clear(); // 기존 값 클리어
      await pwField.sendKeys(pw);

      // 로그인 버튼 클릭
      console.log('로그인 버튼 클릭...');
      await this.driver.executeScript(`login_check(event);`);
      
      // 로그인 처리 대기
      await this.driver.sleep(1000);

      // 현재 URL 확인하여 로그인 성공 여부 판단
      const currentUrl = await this.driver.getCurrentUrl();
      console.log('로그인 후 현재 URL:', currentUrl);

      if (currentUrl.includes('index.html')) {
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
      return {
        success: false,
        statusCode: 500,
        message: '로그인 중 오류가 발생했습니다: ' + error.message,
        error: error.message
      };
    }
  }

  updateCsListForReturn = async () => {
    try {
        await this.login(process.env.EZ_ADMIN_LOGIN_DOMAIN, process.env.EZ_ADMIN_LOGIN_ID, process.env.EZ_ADMIN_LOGIN_PW);
        const csvDataObject = await this.getCsListOfLastMonth()
        const csvData = csvDataObject.data
        const jsonData = await this.excelService.convertCsvToJson(csvData);
        const filteredData = await this.excelService.filterEmptyValuesFromJson(jsonData);
        const csDTOArray = filteredData.map(data => new EzAdminCsDTO(data));
        csDTOArray.forEach(async csDTO => {
            await this.ezadminRepository.upsertEzAdminReturnClaims(csDTO);
        });

        const csDetails = filteredData.flatMap(data =>
          Object.keys(data)
            .filter(key => key.includes('C/S 내역'))
            .map(key => ({
              detail_index: key.slice(-1),
              detail: data[key],
              management_number: data['관리번호']
            })));
        csDetails.forEach(async csDetail => {
            await this.ezadminRepository.upsertEzAdminCsDetails(csDetail);
        });

      return {
        success: true,
        statusCode: 200,
        message: 'CS 리스트 업데이트가 완료되었습니다.',
      };
    } catch (error) {
      console.error('getCsListForReturn 오류:', error);
      return {
        success: false,
        statusCode: 500,
        message: 'ezAdmin.service.getCsListForReturn 오류가 발생했습니다: ' + error.message,
        error: error.message
      };
    }
  }
  updateClaimNumber = async () => {
    

  }


  // driver를 수동으로 종료하는 메서드
  async closeDriver() {
    if (this.driver) {
      try {
        console.log('EzAdmin Driver 종료 중...');
        await this.driver.quit();
        console.log('EzAdmin Driver 종료됨');
        this.driver = null;
        return {
          success: true,
          statusCode: 200,
          message: 'EzAdmin Driver가 성공적으로 종료되었습니다.'
        };
      } catch (error) {
        console.error('EzAdmin Driver 종료 중 오류:', error);
        this.driver = null;
        return {
          success: false,
          statusCode: 500,
          message: 'EzAdmin Driver 종료 중 오류가 발생했습니다: ' + error.message
        };
      }
    } else {
      return {
        success: true,
        statusCode: 200,
        message: '종료할 EzAdmin Driver가 없습니다.'
      };
    }
  }



  downloadCsListOfLastMonth = async () => {
    try {
        if (!this.driver) {
            return {
                success: false,
                statusCode: 401,
                message: '먼저 로그인을 진행하세요.'
            };
        }


            // cs내역조회 페이지
            await this.driver.get(`https://ga92.ezadmin.co.kr/template40.htm?template=E300`);
            // 페이지 로딩 완료까지 기다림
            await this.driver.wait(until.elementLocated(By.className('table-row tbl-top')), 15000);

            //한달 전으로 시작날짜 설정
            const today = new Date();
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(today.getMonth() - 1);
            // 만약 날짜가 유효하지 않다면 (예: 3월 31일 -> 2월 31일)
            // 해당 월의 마지막 날로 설정
            if (oneMonthAgo.getDate() !== today.getDate()) {
                oneMonthAgo.setDate(0); // 이전 달의 마지막 날
            }
            await this.driver.findElement(By.id('start_date')).clear()
            await this.driver.findElement(By.id('start_date')).sendKeys(oneMonthAgo.toISOString().split('T')[0]); // YYYY-MM-DD 형식으로 입력
            

            //검색 실행
            await this.driver.findElement(By.id('search')).click();
            // 검색 결과가 로드될 때까지 대기
            await this.driver.wait(until.elementLocated(By.className('ui-widget-content jqgrow ui-row-ltr')), 15000);
            //다운로드 클릭
            await this.driver.wait(until.elementLocated(By.xpath('//*[@id="download"]')), 10000).click();
            //다운로드 팝업 대기
            await this.driver.wait(until.elementLocated(By.id('pop_download_info')), 10000);
            await this.driver.sleep(200)
            // 다운로드 신청 클릭
            await this.driver.findElement(By.xpath('//*[@id="pop_download_info"]//div[@id="btn_download_info1"]')).click();
            //개인정보팝업 대기
            await this.driver.wait(until.elementLocated(By.id('pop_personal_information')), 10000);
            await this.driver.sleep(200)
            //확인 클릭
            await this.driver.findElement(By.xpath('//*[@id="pop_personal_information"]/div')).click();
            //확인했습니다 팝업 대기
            await this.driver.wait(until.elementLocated(By.className('swal2-popup swal2-modal swal2-show')), 10000);
            await this.driver.sleep(200)
            //확인했습니다 입력 및 엔터
            await this.driver.findElement(By.className('swal2-input')).sendKeys('확인했습니다')

            await this.driver.findElement(By.className('swal2-confirm')).sendKeys(Key.ENTER);
            //다운로드센터 이동
            await this.driver.get('https://ga92.ezadmin.co.kr/template40.htm?template=BL30')
            await this.driver.wait(until.elementLocated(By.xpath('//*[@id="0"]/td[6]')), 10000);
            await this.driver.sleep(1000);

            let loadGrid = async () => {
                    for (let i = 0; i < 60; i++) {
                        await this.driver.sleep(1000); // 1초 대기 후 다시 확인
                        let filename = await this.driver.findElement(By.xpath('//*[@id="0"]/td[4]')).getText()



                    if (filename == " " || !filename) {
                        console.log('파일 생성 대기중... ' + i*2 + '초/60초');
                        await this.driver.sleep(1000); // 1초 대기 후 다시 확인
                    await this.driver.get('https://ga92.ezadmin.co.kr/template40.htm?template=BL30')
                    }else {
                        await this.driver.get(`https://ga21.ezadmin.co.kr/data/divein/${filename}`);
                        console.log('파일 다운로드 완료');

                        return filename
                    }
                }
            }

            let filename = await loadGrid()
            await this.waitForDownload(filename);



            return {
                filename
            }
                } catch (error) {
                    console.error('processCheckList 오류:', error);
                    return {
                        success: false,
                        statusCode: 500,
                        message: '데이터 처리 중 오류가 발생했습니다: ' + error.message,
                        error: error.message,
                    };
                }
        }
          getCsListOfLastMonth = async () => {
        try {
            let filename = (await this.downloadCsListOfLastMonth()).filename
            let csvData = await this.excelService.parseHtmlToCsvForOrderList(filename)
            let filteredData = await this.excelService.filterCsvDataForEzAdminReturn(csvData)
            await this.clearDownloadFolder()
            return {
                success: true,
                statusCode: 200,
                message: 'CS 내역 조회 및 다운로드가 완료되었습니다.',
                data: filteredData
            };
        } catch (error) {
            console.error('getCsListOfLastMonth 오류:', error);
            return {
                success: false,
                statusCode: 500,
                message: '데이터 처리 중 오류가 발생했습니다: ' + error.message,
                error: error.message,
            };
        }
    }




        //미완
        getOrderList = async () => {
        try {
            if (!this.driver) {
                throw new Error('로그인이 필요합니다');
            }

            // 확장주문검색2 페이지로 이동
            await this.driver.get('https://ga92.ezadmin.co.kr/template35.htm?template=DS00');
            //검색박스대기
            await this.driver.wait(until.elementLocated(By.className('table table_search table_search_max')), 10000);
            await this.driver.findElement(By.id('start_date')).clear();

            // 검색시작 날짜 설정 (이번 달 1일)
            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            
            // 한국 시간대로 변환하여 YYYY-MM-DD 형식으로 포맷
            const year = firstDayOfMonth.getFullYear();
            const month = String(firstDayOfMonth.getMonth() + 1).padStart(2, '0');
            const day = String(firstDayOfMonth.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            
            await this.driver.findElement(By.id('start_date')).sendKeys(formattedDate);

            //검색 실행
            await this.driver.findElement(By.id('search')).click();
            // 검색 결과가 로드될 때까지 대기
            await this.driver.wait(until.elementLocated(By.className('ui-widget-content jqgrow ui-row-ltr')), 15000);
            //다운로드 클릭
            await this.driver.wait(until.elementLocated(By.xpath('//*[@id="download"]')), 10000).click();
            //다운로드 팝업 대기
            await this.driver.wait(until.elementLocated(By.id('pop_download_info')), 10000);
            await this.driver.sleep(200)
            // 다운로드 신청 클릭
            await this.driver.findElement(By.xpath('//*[@id="pop_download_info"]//div[@id="btn_download_info1"]')).click();
            //개인정보팝업 대기
            await this.driver.wait(until.elementLocated(By.id('pop_personal_information')), 10000);
            await this.driver.sleep(200)
            //확인 클릭
            await this.driver.findElement(By.xpath('//*[@id="pop_personal_information"]/div')).click();
            //확인했습니다 팝업 대기
            await this.driver.wait(until.elementLocated(By.className('swal2-popup swal2-modal swal2-show')), 10000);
            await this.driver.sleep(200)
            //확인했습니다 입력 및 엔터
            await this.driver.findElement(By.className('swal2-input')).sendKeys('확인했습니다')

            await this.driver.findElement(By.className('swal2-confirm')).sendKeys(Key.ENTER);
            //다운로드센터 이동
            await this.driver.get('https://ga92.ezadmin.co.kr/template40.htm?template=BL30')
            await this.driver.wait(until.elementLocated(By.xpath('//*[@id="0"]/td[6]')), 10000);
            await this.driver.sleep(1000);

            let loadGrid = async () => {
                    for (let i = 0; i < 120; i++) {
                        await this.driver.sleep(1000); // 1초 대기 후 다시 확인
                        let filename = await this.driver.findElement(By.xpath('//*[@id="0"]/td[4]')).getText()



                    if (filename == " " || !filename) {
                        console.log('파일 생성 대기중... ' + i*2 + '초/120초');
                        await this.driver.sleep(1000); // 1초 대기 후 다시 확인
                    await this.driver.get('https://ga92.ezadmin.co.kr/template40.htm?template=BL30')
                    }else {
                        await this.driver.get(`https://ga21.ezadmin.co.kr/data/divein/${filename}`);
                        console.log('파일 다운로드 완료');

                        return filename
                    }
                }
            }
            let filename = await loadGrid();
            await this.waitForDownload(filename);

            

            return {
                success: true,
                statusCode: 200,
                message: '주문 목록 조회가 완료되었습니다.',

            };
        } catch (error) {
            console.error('getOrderList 오류:', error);
            return {
                success: false,
                statusCode: 500,
                message: '주문 목록 조회 중 오류가 발생했습니다: ' + error.message,
                error: error.message
            };
        }
    }

  // 다운로드 완료 확인
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

  // 다운로드 폴더의 파일 목록 가져오기
  getDownloadedFiles() {
    const fs = require('fs');
    try {
      return fs.readdirSync(this.downloadPath);
    } catch (error) {
      console.error('다운로드 폴더 읽기 오류:', error);
      return [];
    }
  }

  // 다운로드 폴더 정리
  clearDownloadFolder() {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const files = fs.readdirSync(this.downloadPath);
      files.forEach(file => {
        const filePath = path.join(this.downloadPath, file);
        fs.unlinkSync(filePath);
      });
      console.log('다운로드 폴더 정리 완료');
    } catch (error) {
      console.error('다운로드 폴더 정리 오류:', error);
    }
  }

  clearFolder(folderPath) {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const files = fs.readdirSync(folderPath);
      files.forEach(file => {
        const filePath = path.join(folderPath, file);
        fs.unlinkSync(filePath);
      });
      console.log('폴더 정리 완료');
    } catch (error) {
      console.error('폴더 정리 오류:', error);
    }
  }

}

module.exports = EzAdminService;