const PostService = require('../services/post.service');

class PostController {
    constructor() {
        this.postService = new PostService();
    }

    getOriginalTraceNumber = async (req, res) => {
        try {
            const { returnTraceNumber } = req.params;
            const result = await this.postService.getOriginalTraceNumber(returnTraceNumber);
            res.status(result.statusCode || 200).json(result);
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
    getInfoByTraceNumber = async (req, res) => {
        try {
            const originalTraceNumber = req.params.originalTraceNumber;
            const result = await this.postService.getInfoByTraceNumber(originalTraceNumber);
            res.status(result.statusCode || 200).json(result);
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
}
module.exports = PostController;
