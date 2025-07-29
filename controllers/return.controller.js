const MusinsaService = require('../services/musinsa.service');
const PostService = require('../services/post.service');
const EzAdminService = require('../services/ezAdmin.service');
const DiveinService = require('../services/divein.service');

class ReturnController {
  constructor() {
    this.musinsaService = new MusinsaService();
    this.postService = new PostService();
    this.ezAdminService = new EzAdminService();
    this.diveinService = new DiveinService();
  }
    // CS 반품 리스트 파싱
    updateCsRetrieveList = async (req, res) => {
        try {
            const result = this.diveinService.updateCsRetrieveList(req.body.fileName);
            
            res.json({
                success: true,
                message: 'Excel 파일이 성공적으로 파싱되었습니다.',
                ...result
            });
        } catch (error) {
            console.error('리스트 파싱 오류:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }
    // 무신사 반품처리
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
  // 통합 반품 정보 조회
  getInfoByReturnTraceNumber = async (req, res) => {
      try {
          const {returnTraceNumber} = req.params;
          if(returnTraceNumber.length == 13) {
            const result = await this.postService.getInfoByReturnOrOriginalTraceNumber(returnTraceNumber);
            res.status(result.statusCode || 200).json(result);
          } else {
            const result = await this.musinsaService.getInfoByReturnTraceNumber(returnTraceNumber);
            res.status(result.statusCode || 200).json(result);
          }
      } catch (error) {
          console.error('Get Info By Return Trace Number 오류:', error);
          res.status(error.statusCode || 500).json({
              success: false,
              statusCode: error.statusCode || 500,
              message: error.message || 'Internal Server Error',
              error: error.error || 'UNKNOWN_ERROR'
          });
      }
    }
    //통합 검수정보 입력
    upsertReturnInspectionList = async (req, res) => {
        try {
            let data = req.query
            console.log(data.channel)
            data.channel = decodeURIComponent(data.channel);
            if(data.musinsa_serial_number || data.ezadmin_management_number) {
                await this.diveinService.upsertReturnInspectionList(data);
            } else{
            return res.status(400).json({
                success: false,
                message: '무신사 시리얼번호 또는 ezAdmin 관리번호가 필요합니다.'
            });
            }
            res.status(200).json();
        } catch (error) {
            console.error('Post Return Inspection List 오류:', error);
            res.status(error.statusCode || 500).json({
                success: false,
                statusCode: error.statusCode || 500,
                message: error.message || 'Internal Server Error',
                error: error.error || 'UNKNOWN_ERROR'
            });
        }
    }
    // 무신사 검수정보 조회
    getMusinsaInspectionList = async (req, res) => {
        try {
            const {startDate, endDate} = req.query;
            console.log('Start Date:', startDate, 'End Date:', endDate);
            const result = await this.musinsaService.getMusinsaInspectionList(startDate, endDate);
            res.status(result.statusCode || 200).json(result);
        } catch (error) {
            console.error('Get Musinsa Inspection List 오류:', error);
            res.status(error.statusCode || 500).json({
                success: false,
                statusCode: error.statusCode || 500,
                message: error.message || 'Internal Server Error',
                error: error.error || 'UNKNOWN_ERROR'
            });
        }
    }
    getEzAdminInspectionList = async (req, res) => {
        try {
            const {startDate, endDate} = req.query;
            const result = await this.ezAdminService.getEzAdminInspectionList(startDate, endDate);
            res.status(result.statusCode || 200).json(result);
        } catch (error) {
            console.error('Get EzAdmin Inspection List 오류:', error);
            res.status(error.statusCode || 500).json({
                success: false,
                statusCode: error.statusCode || 500,
                message: error.message || 'Internal Server Error',
                error: error.error || 'UNKNOWN_ERROR'
            });
        }
    }

    getMusinsaCsListForReturn = async (req, res) => {
        try {
            let path = await this.diveinService.getMusinsaCsListPath()
            return res.status(200).download(path, (err) => {
                if (err) {
                    console.error('무신사 CS 리스트 다운로드 오류:', err);
                    return res.status(500).json({
                        success: false,
                        message: '무신사 CS 리스트 다운로드 중 오류 발생',
                        error: err.message || 'UNKNOWN_ERROR'
                    });
                }
            });
        } catch (error) {
            console.error('무신사 CS 리스트 조회 오류:', error);
            return res.status(error.statusCode || 500).json({
                success: false,
                statusCode: error.statusCode || 500,
                message: error.message || 'Internal Server Error',
                error: error.error || 'UNKNOWN_ERROR'
            });
        }
    }
        getEzAdminCsListForReturn = async (req, res) => {
        try {
            let path = await this.diveinService.getEzAdminCsListPath()
            return res.status(200).download(path, (err) => {
                if (err) {
                    console.error('ezAdmin CS 리스트 다운로드 오류:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'ezAdmin CS 리스트 다운로드 중 오류 발생',
                        error: err.message || 'UNKNOWN_ERROR'
                    });
                }
            });
        } catch (error) {
            console.error('ezAdmin CS 리스트 조회 오류:', error);
            return res.status(error.statusCode || 500).json({
                success: false,
                statusCode: error.statusCode || 500,
                message: error.message || 'Internal Server Error',
                error: error.error || 'UNKNOWN_ERROR'
            });
        }
    }

}
    module.exports = ReturnController;