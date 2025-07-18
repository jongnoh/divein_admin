const MusinsaService = require('../services/musinsa.service.js');

class MusinsaController  {
    musinsaService = new MusinsaService();

    login = async (req, res) => {
        await this.musinsaService.closeDriver(); // service의 closeDriver 직접 호출
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

        updateCsList = async (req, res) => {
        try {
            const { loginId, password, twoFactor } = req.body;
            const musinsaCsList = await this.musinsaService.updateCsListForReturn(loginId, password, twoFactor);
            return res.status(200).json({
                success: true,
                statusCode: 200})
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

    getClaimList = async (req, res) => {
        try {
            const result = await this.musinsaService.getClaimList();
            res.status(result.statusCode || 200).json(result);
        } catch (error) {
            console.error('Get Claim List 오류:', error);
            res.status(error.statusCode || 500).json({
                success: false,
                statusCode: error.statusCode || 500,
                message: error.message || 'Internal Server Error',
                error: error.error || 'UNKNOWN_ERROR'
            });
        }
    }

          processCheckList = async (req, res) => {
      try {
          const { serialNumber, claimNumber } = req.body;
          const result = await this.musinsaService.processCheckList(serialNumber, claimNumber);
          res.status(result.statusCode || 200).json(result);
          
      } catch (error) {
          if(error.statusCode === 401) {
              await this.login(req, res);
              return;
          }
          res.status(error.statusCode || 500).json({
              success: false,
              statusCode: error.statusCode || 500,
              message: error.message || 'Internal Server Error',
              error: error.error || 'UNKNOWN_ERROR'
          });
      }
  }

    getClaimNumber = async (req, res) => {
        try {
            const { orderNumber, serialNumber } = req.params;
            console.log(req.params)
            const result = await this.musinsaService.getClaimNumber(orderNumber, serialNumber);
            res.status(result.statusCode || 200).json(result);
        } catch (error) {
            console.error('Get Claim Number 오류:', error);
            res.status(error.statusCode || 500).json({
                success: false,
                statusCode: error.statusCode || 500,
                message: error.message || 'Internal Server Error',
                error: error.error || 'UNKNOWN_ERROR'
            });
        }
    }


    // driver를 수동으로 종료하는 엔드포인트
    closeDriver = async (req, res) => {
        try {
            const result = await this.musinsaService.closeDriver();
            res.status(result.statusCode || 200).json(result);
        } catch (error) {
            console.error('Driver 종료 중 오류:', error);
            res.status(500).json({ 
                success: false,
                statusCode: 500,
                message: 'Driver 종료 중 오류가 발생했습니다: ' + error.message 
            });
        }
    }
}

module.exports = MusinsaController;
