const EzAdminService = require('../services/ezAdmin.service');
const dotenv = require('dotenv');
dotenv.config();

class EzAdminController {
  constructor() {
    this.ezAdminService = new EzAdminService();
  }

  login = async (req, res) => {
    const domain = process.env.EZ_ADMIN_LOGIN_DOMAIN
    const loginId = process.env.EZ_ADMIN_LOGIN_ID
    const pw = process.env.EZ_ADMIN_LOGIN_PW

    try {
      const result = await this.ezAdminService.login(domain, loginId, pw);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error('EzAdmin Controller 로그인 오류:', error);
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: '로그인 중 오류가 발생했습니다: ' + error.message
      });
    }
  }
    updateCsList = async (req, res) => {
        try {
            const ezAdminCsList = await this.ezAdminService.updateCsListForReturn();
            return res.status(200).json({
                success: true,
                statusCode: 200
            });
        } catch (error) {
            console.error('CS 리스트 업데이트 오류:', error);
            res.status(error.statusCode || 500).json({
                success: false,
                statusCode: error.statusCode || 500,
                message: error.message || 'Internal Server Error',
                error: error.error || 'UNKNOWN_ERROR'
            });
        }
    }
}

module.exports = EzAdminController;
