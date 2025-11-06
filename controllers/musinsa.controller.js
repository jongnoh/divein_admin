const MusinsaService = require('../services/musinsa.service.js');

class MusinsaController  {
    constructor() {
        this.musinsaService = new MusinsaService();
    }
    login = async (req, res) => {
        try {

            if(!req.body || !req.body.loginId || !req.body.password|| !req.body.twoFactor) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: '로그인 정보가 누락되었습니다.'
                });
            }

            const {loginId, password, twoFactor} = req.body;
            const result = await this.musinsaService.login(loginId, password, twoFactor);

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
}
module.exports = MusinsaController;
