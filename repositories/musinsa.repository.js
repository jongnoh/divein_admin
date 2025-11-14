

const sequelize = require('../config/database').sequelize;
const { where, Op } = require('sequelize');
const initModels = require('../models/init-models');

class MusinsaRepository {
    
    constructor() {
        this.models = initModels(sequelize);
    }
    async upsertClaims(dataDTO) {
        try {
            const data = dataDTO.exportObject();

            const result = await this.models.musinsa_claims.upsert(
                data
                , { ignoreDuplicates: true });
            console.log('Upsert musinsa_claims 성공:', result.length);
            return result;
        } catch (error) {
            console.error('Error in upsertMusinsaCClaims:', error);
            throw error;
        }
    }
    async findAllClaimByReturnTraceNumber(returnTraceNumber) {
        try {
            const claims = await this.models.musinsa_claims.findAll({
                where: {
                    return_trace_number: returnTraceNumber
                }
            });
            return claims;
        } catch (error) {
            console.error('Error in findAllClaimByReturnTraceNumber:', error);
            throw error;
        }
    }
}
module.exports = MusinsaRepository;
