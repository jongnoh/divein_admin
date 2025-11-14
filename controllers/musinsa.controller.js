const MusinsaService = require('../services/musinsa.service.js');

class MusinsaController  {
    constructor() {
        this.musinsaService = new MusinsaService();
    }
    autoLogin = async () => {
        try {
            const loginId = process.env.MUSINSA_ID;
            const password = process.env.MUSINSA_PW;
            const result = await this.musinsaService.login(loginId, password);
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
    getClaimByReturnTraceNumber = async (req, res) => {
        try {
            const returnTraceNumber = req.params.returnTraceNumber;
            console.log('Return Trace Number:', returnTraceNumber);
            const result = await this.musinsaService.getClaimByReturnTraceNumber(returnTraceNumber);
            res.status(result.statusCode || 200).json(result);
        } catch (error) {
            console.error('Get Claim By Return Trace Number 오류:', error);
            res.status(error.statusCode || 500).json({
                success: false,
                statusCode: error.statusCode || 500,
                message: error.message || 'Internal Server Error',
                error: error.error || 'UNKNOWN_ERROR'
            });
        }
    }
    processClaim = async (req, res) => {
        try {
            const {claim_number, order_opt_number} = req.query
            res.status(200).json({ success: true, message: '클레임이 성공적으로 처리되었습니다.' });
        } catch (error) {
            console.error('Process Claim 오류:', error);
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
