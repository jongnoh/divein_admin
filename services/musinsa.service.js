const speakeasy = require('speakeasy');

const MusinsaRepository = require('../repositories/musinsa.repository.js');
const ExcelService = require('./divein.service.js');

const MusinsaCsDTO = require('../dto/musinsaCsDTO.js');     
const { error } = require('console');
const DiveinRepository = require('../repositories/divein.repositoy.js');
const { default: axios, get } = require('axios');
const { ref } = require('process');
const dateUtils = require('../utils/date.js');

const musinsaReturnReasons = require('../utils/musinsa.return.reason.js');

class MusinsaService {

    constructor() {
        this.musinsaRepository = new MusinsaRepository();
        this.musinsaCsDTO = MusinsaCsDTO;
        this.diveinRepository = new DiveinRepository();
        this.dateUtils = new dateUtils();

        this.cookie = null;
        this.accessToken = null;
        this.refreshToken = null;
        this.partner_platform_atk = null;
        this.partner_platform_rtk = null;
        this.musinsaReturnReasons = musinsaReturnReasons;

    }
    login = async (loginId, pw) => {
        try {
            let cookie;
            //id 비밀번호 로그인
            const login = await axios({
                method: 'post',
                url: 'https://api.one.musinsa.com/api2/partner/oauth/v3/authentication/login/password',
                headers: {
                    'accept': 'application/json',
                    'accept-encoding': 'gzip,deflate,br,zstd',
                    'accept-language': 'ko-KR,ko;q=0.9',
                    'content-type': 'application/json',
                    'origin': 'https://partner-sso.one.musinsa.com',
                    'referer': 'https://partner-sso.one.musinsa.com/',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'
                },
                data: {
                    clientId: "MUSINSA_PARTNER",
                    "id": loginId,
                    "password": pw,
                    platform: "mss",
                    redirectUri: "https://partner.musinsa.com",
                },
                maxRedirects: 0
            })
            cookie = login.headers['set-cookie'].join('; ')
            //OTP 로그인

            const twoFactor = await speakeasy.totp({
                secret: process.env.OTP_SECRET,
                encoding: 'base32'
            });


            const twoFactorVerification = await axios({
                method: 'post',
                url: 'https://api.one.musinsa.com/api2/partner/oauth/v3/authentication/login/otp',
                headers: {
                    'accept': 'application/json',
                    'accept-encoding': 'gzip,deflate,br,zstd',
                    'accept-language': 'ko-KR,ko;q=0.9',
                    'content-type': 'application/json',
                    'origin': 'https://partner-sso.one.musinsa.com',
                    'referer': 'https://partner-sso.one.musinsa.com/',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
                    'cookie': cookie
                },
                data: {
                    clientId: "MUSINSA_PARTNER",
                    code: twoFactor,
                    id: loginId,
                    platform: "mss",
                    redirectUri: "https://partner.musinsa.com",
                    twoFactorType: "OTP"
                },
                maxRedirects: 0
            })
            cookie = twoFactorVerification.headers['set-cookie'].join('; ')
            this.cookie = cookie
            const authcode = twoFactorVerification.data.ssoUuid
            const refreshToken = cookie.split('pp-auth-rtk=')[1].split(';')[0];
            this.refreshToken = refreshToken.trim()
            // //Oauth 인증
            // const OAuth = await axios({
            //     method: 'post',
            //     url: 'https://api.one.musinsa.com/api2/partner/oauth/v3/authentication/login/otp/key/confirmed',
            //     headers: {
            //         'accept': 'application/json',
            //         'accept-encoding': 'gzip,deflate,br,zstd',
            //         'accept-language': 'ko-KR,ko;q=0.9',
            //         'content-type': 'application/json',
            //         'origin': 'https://partner-sso.one.musinsa.com',
            //         'referer': 'https://partner-sso.one.musinsa.com/',
            //         'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
            //         'cookie': this.cookie
            //     },
            //     data: {
            //         "authCode": authcode
            //     },
            //     maxRedirects: 0
            // })
            // this.partner_platform_atk = OAuth.headers['set-cookie'].find(cookie => cookie.startsWith('partner-platform-atk')).split(';')[0].split('=')[1];
            // this.partner_platform_rtk = OAuth.headers['set-cookie'].find(cookie => cookie.startsWith('partner-platform-rtk')).split(';')[0].split('=')[1];
            // this.refreshToken = refreshToken.trim()

            // accessToken 발급
            const getAccessToken = await axios({
                method: 'post',
                url: 'https://api.dashboard.partner.musinsa.com/auth/refresh-access-token',
                headers: {
                    'accept': 'application/json',
                    'accept-encoding': 'gzip,deflate,br,zstd',
                    'accept-language': 'ko-KR,ko;q=0.9',
                    'content-type': 'application/json',
                    'origin': 'https://partner.musinsa.com',
                    'referer': 'https://partner.musinsa.com/',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
                    'cookie': cookie
                },
                data: {
                    "refreshToken": this.refreshToken
                },
                maxRedirects: 0
            })
            const accessToken = getAccessToken.data.accessToken.trim()
            this.accessToken = accessToken

            this.refreshToken = getAccessToken.data.refreshToken.trim()
        
            this.cookie = getAccessToken.headers['set-cookie'].join('; ')

            console.log('로그인 성공! ID:', loginId);
            if(this.accessToken && this.refreshToken ){
                return {
                    success: true,
                    statusCode: 200,
                    message: '로그인에 성공했습니다.'
                }
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
    }
    async refreshAccessToken() {
        try {
            if(!this.refreshToken) {
                return {
                    success: false,
                    statusCode: 400,
                    message: '리프레시 토큰이 없습니다. 다시 로그인 해주세요.'
                };
            }
            const cookie = this.cookie + this.partner_platform_atk + this.partner_platform_rtk
            const getAccessToken = await axios({
                method: 'post',
                url: 'https://api.dashboard.partner.musinsa.com/auth/refresh-access-token',
                headers: {
                    'accept': 'application/json',
                    'accept-encoding': 'gzip,deflate,br,zstd',
                    'accept-language': 'ko-KR,ko;q=0.9',
                    'content-type': 'application/json',
                    'origin': 'https://partner.musinsa.com',
                    'referer': 'https://partner.musinsa.com/',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
                    'cookie': cookie
                },
                data: {
                    "refreshToken": this.refreshToken
                },
                maxRedirects: 0
                })
            this.accessToken = getAccessToken.data.accessToken
            this.refreshToken = getAccessToken.data.refreshToken
            this.cookie = getAccessToken.headers['set-cookie'].join('; ')
            return {
                success: true,
                statusCode: 200,
                message: '토큰이 성공적으로 갱신되었습니다.'
            };
            } catch (error) {
                console.error('토큰 갱신 중 오류:', error);
                return {
                    success: false,
                    statusCode: 500,
                    message: '토큰 갱신 중 오류가 발생했습니다: ' + error.message,
                    error: error.message
                };
            }
    }

    getClaimsByDate = async (startDate, endDate, returnTraceNumber, orderNumber) => {
        try {
            console.log('무신사 클레임 내역 조회 시작');
            if(!startDate) {
                startDate = this.dateUtils.getKSTDateStringOfTwoWeeksAgo();
            }
            if(!endDate) {
                endDate = this.dateUtils.getKSTDateString();
            }
            console.log(startDate+ '부터')
            console.log(endDate+ '까지')

            let formData = new FormData();
            formData.append('MENU_ID', '/po/order-group-admin/order/ord06');
            formData.append('USR_SEARCH_ITEM_CNT', '12');
            formData.append('PAGE_CNT', '10');
            formData.append('LIMIT', '100');
            formData.append('PAGE', '1');
            formData.append('CHECKED_LOGISTICS_BUSINESS_TYPE', 'PARTNER,MFS,MWP,M1P');
            formData.append('S_DATE_TYPE', '10');
            formData.append('S_SDATE', startDate);
            formData.append('S_EDATE', endDate);
            formData.append('S_ORD_NO', orderNumber || '');
            formData.append('S_CLM_DELAY_DAYS', '0');
            formData.append('S_RETURN_STATE', '0');
            formData.append('S_RETURN_STATE', '7');
            formData.append('S_RETURN_STATE', '3');
            formData.append('S_RETURN_STATE', '2');
            formData.append('S_RET_DLV_NO', returnTraceNumber || '');
            formData.append('S_CLM_REQ_DAYS', '0');
            formData.append('S_CLM_DLV_DAYS', '0');
            formData.append('S_NOT_COMPLEX', 'Y');
            formData.append('S_LOGISTICS_BUSINESS_TYPE_ALL', 'ALL');
            formData.append('S_LOGISTICS_BUSINESS_TYPE', 'PARTNER');
            formData.append('S_LOGISTICS_BUSINESS_TYPE', 'NFS');
            formData.append('S_LOGISTICS_BUSINESS_TYPE', 'MWP');
            formData.append('S_LOGISTICS_BUSINESS_TYPE', 'M1P');
            formData.append('LIMIT', '9999');
            formData.append('CHECHED_RETURN_STATE', '0,7,3,2');


            const claimResponse = await axios({
                method: 'post',
                url: 'https://bizest.musinsa.com/po/order-group-admin/api/order/ord06/search',
                data: formData,
                headers: {
                'cookie': this.cookie
                }
                
            })

            console.log(`무신사 클레임 내역 ${claimResponse.data.data.length}건 조회`);
            return { success: true,
                statusCode: 200,
                message: `무신사 클레임 내역 ${claimResponse.data.data.length}건이 성공적으로 조회되었습니다.`,
                dataLength: claimResponse.data.data.length,
                data: claimResponse.data.data
            };
        } catch (error) {
            throw new Error('무신사 클레임 내역을 가져오는 중 오류가 발생했습니다: ' + error.message);
        }
    }
        getClaimDetail = async (orderNumber, orderOptNumber) => {
        try {
            console.log(`orderNumber: ${orderNumber}, orderOptNumber: ${orderOptNumber} detail 요청 중`);
            let formData = new FormData();
            formData.append('ORD_NO', orderNumber);
            formData.append('ORD_OPT_NO', orderOptNumber);
            const claimDetailResponse = await axios({
                method: 'post',
                url: 'https://bizest.musinsa.com/po/order-group-admin/api/order/ord01/get_detail',
                data: formData,
                headers: {
                'cookie': this.cookie
                }
            })
            const details = claimDetailResponse.data.claim
            return details;

        } catch (error) {
            throw new Error('무신사 클레임 상세 내역을 가져오는 중 오류가 발생했습니다: ' + error.message);
        }
    }
    getClaimDetailMemo = async (orderNumber, orderOptNumber) => {
        try {
            console.log(`orderNumber: ${orderNumber}, orderOptNumber: ${orderOptNumber} detail 요청 중`);
            let formData = new FormData();
            formData.append('ORD_NO', orderNumber);
            formData.append('ORD_OPT_NO', orderOptNumber);
            const claimDetailResponse = await axios({
                method: 'post',
                url: 'https://bizest.musinsa.com/po/order-group-admin/api/order/ord01/get_detail',
                data: formData,
                headers: {
                'cookie': this.cookie
                }
            })
            const details = claimDetailResponse.data.claim.ROWS_CLAIM
            let memos = []
            details.forEach(detail => {
                memos.push({
                    "memo" : detail.memo,
                    "date" : detail.regi_date
                    })
            })
            return memos;

        } catch (error) {
            throw new Error('무신사 클레임 상세 내역을 가져오는 중 오류가 발생했습니다: ' + error.message);
        }
    }



    // 미완 (실제 케이스로 테스트 필요)
    processClaim = async (orderNumber, orderOptNumber, deliveryNumber) => {
        try {
            //클레임 조회
            const detail = await this.getClaimDetail(orderNumber, orderOptNumber);

            let formData = new FormData();
            formData.append('ordOptNo', orderOptNumber);
            formData.append('claimNo', detail.CLM_NO);
            formData.append('clmQty', "1");
            formData.append('ord_qty', "1");
            formData.append('stockYn', "y");
            formData.append('dlvCd', detail.DLV_CD || "CJGLS");
            formData.append('dlvNo', deliveryNumber || detail.DLV_NO);
            formData.append('updateReturnDeliveryInfoYn', deliveryNumber ? "n" : "y");
            formData.append('clmReason', detail.CLM_REASON);

            const process = await axios({
                method: 'post',
                url: 'https://bizest.musinsa.com/po/order-group-admin/api/order/ord01/check',
                data: formData,
                headers: {
                'cookie': this.cookie
                }
            })

            const check = await axios({
                method: 'get',
                url: `https://bizest.musinsa.com/po/order-group-admin/popup/pop_return_detail?ord_opt_no=${orderOptNumber}&LAYOUT_TYPE=popup`,
                headers: {
                    'cookie': this.cookie
                }
            })
            const checkResult = check.data.split('검수결과')[1].split('<strong>')[1].split('</strong>')[0].trim();
            console.log( `${process.data.message} : ${checkResult}` )
            return { message: process.data.message, result: checkResult, claimNumber: detail.CLM_NO };
        } catch (error) {
            throw new Error('클레임 검수완료 처리 중 오류가 발생했습니다: ' + error.message);
        }
    }

    
}
module.exports = MusinsaService;


