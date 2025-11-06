const axios = require('axios');

class PostService { 

    // Chrome 옵션을 클래스 레벨에서 설정
    constructor() {
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
    getReturnTraceNumber = async (originalTraceNumber) => {
        try {
            const response = await axios.get(`https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?sid1=${originalTraceNumber}`);
            if(response.data.includes('반품등기번호')) {
            const returnTraceNumber = response.data.split(`반품등기번호:<a href="/trace.RetrieveDomRigiTraceList.comm?sid1=`)[1].slice(0, 13);

            return {returnTraceNumber : returnTraceNumber}
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