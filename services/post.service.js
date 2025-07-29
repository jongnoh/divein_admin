
const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const EzAdminService = require('./ezAdmin.service.js');
const EzAdminRepository = require('../repositories/ezadmin.repository.js');
const fs = require('fs');
const path = require('path');
const option = require('../config/driver.option.js');
const { error } = require('console');
const axios = require('axios');

class PostService { 
    csListPath = path.join(__dirname, '..', 'csList')

    // Chrome 옵션을 클래스 레벨에서 설정
    constructor() {
        this.ezAdminService = new EzAdminService();
        this.ezAdminRepository = new EzAdminRepository();
        this.options = option
    }
    // WebDriver 인스턴스를 생성하는 메서드
    async createDriver() {
        return await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(this.options)
            .build();
    }

    // getOriginalTraceNumber = async (returnTraceNumber) => {
    //     let driver;
        
    //     try {

    //         if(returnTraceNumber.length !== 13) {
    //             return {
    //                 success: false,
    //                 statusCode: 400,
    //                 message: '우체국 반품 추적번호는 13자리여야 합니다.'
    //             };
    //         }

    //         driver = await this.createDriver();

    //         await driver.get('https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?sid1=' + returnTraceNumber);

    //         // 페이지가 완전히 로딩되고 테이블이 나타날 때까지 기다림
    //         await driver.wait(until.elementLocated(By.id('processTable')), 10000);
            
    //         // 요소가 나타날 때까지 기다림
    //         await driver.wait(until.elementLocated(By.xpath("//*[@id='processTable']/tbody/tr[last()]/td[last()]/div/a/span")), 10000);
      
    //         let originalTraceNumberElement = await driver.findElement(By.xpath("//*[@id='processTable']/tbody/tr[last()]/td[last()]/div/a/span"));
    //         let originalTraceNumber = await originalTraceNumberElement.getText();
    //         console.log("Original trace number:", originalTraceNumber);
            
    //         if (!originalTraceNumber || originalTraceNumber.length !== 13) {
    //             return {
    //                 success: false,
    //                 statusCode: 404,
    //                 message: '유효한 원본 추적번호를 찾을 수 없습니다.'
    //             };
    //         } else {
    //             return {
    //                 success: true,
    //                 statusCode: 200,
    //                 originalTraceNumber: originalTraceNumber
    //             };
    //         }
    //     } catch (error) {
    //         console.error('Error occurred in PostService:', error);
    //         return {
    //             success: false,
    //             statusCode: 500,
    //             message: '추적번호 조회 중 오류가 발생했습니다: ' + error.message
    //         };
    //     } finally {
    //         if (driver) {
    //             await driver.quit();
    //         }
    //     }
    // }



    getInfoByReturnOrOriginalTraceNumber = async (traceNumber) => {
        let result = await this.getInfoByReturnTraceNumber(traceNumber);
        console.log(result)
            if(!result.success) {
            result = await this.getInfoByTraceNumber(traceNumber);
            }
            
            
            let returnValue = result.data.data.map(item => ({
            "반송장번호": item.return_trace_number,
            "판매처": item.channel,
            "상품코드" : item.product_code,
            "상품명": item.product_name,
            "옵션": item.product_option,
            "주문번호" : item.order_number,
            "관리번호" : item.management_number,
    }));
                const details = result.data.details.map(detail => ({
            "#": detail.detail_index,
            "CS 내용": detail.detail,
        }));

    return {
        success: true,
        data : returnValue,
        details : details
    };


    }
    getInfoByReturnTraceNumber = async (returnTraceNumber) => {
        try {
            const originalTraceNumberResult = await this.getOriginalTraceNumber(returnTraceNumber);

            const originalTraceNumber = originalTraceNumberResult.originalTraceNumber;


            const result = await this.getInfoByTraceNumber(originalTraceNumber);
            return {
                success: true,
                data: result.data
            };
        } catch (error) {
            console.error('Get Info By Return Trace Number 오류:', error);
            return {
                success: false,
                statusCode: error.statusCode || 500,
                message: error.message || 'Internal Server Error',
                error: error.error || 'UNKNOWN_ERROR'
            };
        }
    }


    getInfoByTraceNumber = async (originalTraceNumber) => {


        
        const result = await this.ezAdminRepository.findAllClaimsByTraceNumber(originalTraceNumber);
        for (const item of result) {
            let product = await this.ezAdminRepository.findOneProductByProductCode(item.product_code);
            item.product_name = product.product_name;
            item.product_option = product.product_option;
        }
        const details = await this.ezAdminRepository.findAllDetailsByTraceNumber(originalTraceNumber);
        if (result.length === 0) {
            return {
                success: false,
                statusCode: 404,
                message: '해당 반품 추적번호에 대한 정보가 없습니다.'
            };
        }
        return {
            success: true,
            data: {data: result, details: details}
        };
    }
    updateReturnTraceNumber = async (originalTraceNumber, returnTraceNumber) => {
        try {
            const result = await this.ezAdminRepository.updateReturnTraceNumber(originalTraceNumber, returnTraceNumber);
            if (result[0] === 0) {
                return {
                    success: false,
                    statusCode: 404,
                    message: '해당 원본 추적번호에 대한 반품 추적번호 업데이트가 실패했습니다.'
                };
            }
            return {
                success: true,
                message: '반품 추적번호가 성공적으로 업데이트되었습니다.'
            };
        } catch (error) {
            console.error('Error in updateReturnTraceNumber:', error);
            return {
                success: false,
                statusCode: 500,
                message: '반품 추적번호 업데이트 중 오류가 발생했습니다.',
                error: error.message
            };
        }
    }

        getOriginalTraceNumber = async (returnTraceNumber) => {
            try {
            const response = await axios.get(`https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?sid1=${returnTraceNumber}`);
            if(response.data.includes('반품원등기번호')) {
            const originalTraceNumber = response.data.split(`반품원등기번호:<a href=\"/trace.RetrieveDomRigiTraceList.comm?sid1=`)[1].slice(0, 13);
            
            return {originalTraceNumber : originalTraceNumber}
            } else {
                return {
                    success: false,
                    statusCode: 404,
                    message: '유효한 원본 추적번호를 찾을 수 없습니다.'
                };
            }
                } catch (error) {
            console.error('Get Original Trace Number 오류:', error);
            return {
                success: false,
                statusCode: 500,
                message: '추적 정보 조회 중 오류가 발생했습니다: ' + error.message
            };
        }
    }
}
module.exports = PostService;