const MusinsaService = require('../services/musinsa.service.js');

class MusinsaController  {
    constructor() {
        this.musinsaService = new MusinsaService();
    }
    autoLogin = async() => {
        try {
            const loginId = process.env.MUSINSA_ID;
            const password = process.env.MUSINSA_PW;
            await this.musinsaService.login(loginId, password);
        } catch (error) {
            console.error('Auto Login 오류:', error);
        }
    }
    login = async (req, res) => {
        try {

            const loginId = process.env.MUSINSA_ID;
            const password = process.env.MUSINSA_PW;
            const result = await this.musinsaService.login(loginId, password);

            // result가 undefined인지 확인
            if (!result) {
                return res.status(500).json({
                    success: false,
                    statusCode: 500,
                    message: '로그인 메서드에서 결과를 받지 못했습니다.'
                });
            }

            res.status(result.statusCode || 200).json(result);
        } catch (error) {
            console.error('Login 오류:', error);
            res.status(error.statusCode || 500).json({
                success: false,
                statusCode: error.statusCode || 500,
                message: error.message || 'Internal Server Error',
                error: error.error || 'UNKNOWN_ERROR'
            });
        }
    }
    refreshAccessToken = async (req, res) => {
        try {
            const result = await this.musinsaService.refreshAccessToken();
            res.status(result.statusCode || 200).json(result);
        } catch (error) {
            console.error('Refresh Token 오류:', error);
            res.status(error.statusCode || 500).json({
                success: false,
                statusCode: error.statusCode || 500,
                message: error.message || 'Internal Server Error',
                error: error.error || 'UNKNOWN_ERROR'
            });
        }
    }
    getClaims = async (req, res) => {
        try {
            const result = await this.musinsaService.getClaims();
            res.status(result.statusCode || 200).json(result);
        } catch (error) {
            console.error('Get Claims 오류:', error);
            res.status(error.statusCode || 500).json({
                success: false,
                statusCode: error.statusCode || 500,
                message: error.message || 'Internal Server Error',
                error: error.error || 'UNKNOWN_ERROR'
            });
        }
    }
    updateClaims = async (req, res) => {
        try {
            const result = await this.musinsaService.updateClaims();
            res.status(result.statusCode || 200).json(result);
        } catch (error) {
            console.error('update Claims 오류:', error);
            res.status(error.statusCode || 500).json({
                success: false,
                statusCode: error.statusCode || 500,
                message: error.message || 'Internal Server Error',
                error: error.error || 'UNKNOWN_ERROR'
            });
        }
    }
}
module.exports = MusinsaController;
