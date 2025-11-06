const MusinsaRepository = require('../repositories/musinsa.repository.js');
const ExcelService = require('./divein.service.js');

const MusinsaCsDTO = require('../dto/musinsaCsDTO.js');     
const { error } = require('console');
const DiveinRepository = require('../repositories/divein.repositoy.js');
const { default: axios, get } = require('axios');
const { ref } = require('process');



class MusinsaService {

    constructor() {
        this.musinsaRepository = new MusinsaRepository();
        this.musinsaCsDTO = MusinsaCsDTO;
        this.diveinRepository = new DiveinRepository();

        this.cookie = null;
        this.accessToken = null;
        this.refreshToken = null;
        this.partner_platform_atk = null;
        this.partner_platform_rtk = null;

    }
    login = async (loginId, pw , twoFactor) => {
        try {
            let cookie;
            const login = await axios({
                method: 'post',
                url: 'https://api.dashboard.partner.musinsa.com/auth/login',
                headers: {
                    'accept': 'application/json',
                    'accept-encoding': 'gzip,deflate,br,zstd',
                    'accept-language': 'ko-KR,ko;q=0.9',
                    'content-type': 'application/json',
                    'origin': 'https://partner.musinsa.com',
                    'referer': 'https://partner.musinsa.com/',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'
                },
                data: {
                    "id": loginId,
                    "password": pw,
                },
                maxRedirects: 0
            })
            cookie = login.headers['set-cookie'].join('; ')
            //id 로그인
            const twoFactorVerification = await axios({
                method: 'post',
                url: 'https://api.dashboard.partner.musinsa.com/auth/otp/verification',
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
                    "verificationCode": twoFactor
                },
                maxRedirects: 0
            })
            cookie = twoFactorVerification.headers['set-cookie'].join('; ')
            this.cookie = cookie
            const authcode = twoFactorVerification.data.ssoUuid
            const refreshToken = twoFactorVerification.data.refreshToken
            //2차 인증
            const OAuth = await axios({
                method: 'post',
                url: 'https://api.one.musinsa.com/api2/partner/oauth/token',
                headers: {
                    'accept': 'application/json',
                    'accept-encoding': 'gzip,deflate,br,zstd',
                    'accept-language': 'ko-KR,ko;q=0.9',
                    'content-type': 'application/json',
                    'origin': 'https://partner-sso.one.musinsa.com',
                    'referer': 'https://partner-sso.one.musinsa.com/',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
                    'cookie': this.cookie
                },
                data: {
                    "authCode": authcode
                },
                maxRedirects: 0
            })
            this.partner_platform_atk = OAuth.headers['set-cookie'].find(cookie => cookie.startsWith('partner-platform-atk')).split(';')[0].split('=')[1];
            this.partner_platform_rtk = OAuth.headers['set-cookie'].find(cookie => cookie.startsWith('partner-platform-rtk')).split(';')[0].split('=')[1];
            this.refreshToken = refreshToken.trim()
            //accessToken 발급
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

}
module.exports = MusinsaService;
