const sequelize = require('../config/database').sequelize;
const { raw } = require('express');
const initModels = require('../models/init-models');

class EzAdminRepository {

    constructor() {
        this.models = initModels(sequelize);
    }
    async upsertEzAdminReturnClaims (data) {
        try {
            const result = await this.models.ezadmin_return_claim.upsert(data, { ignoreDuplicates: true });
            console.log('Bulk create ezadmin_return_claims 성공:', result.length);
        } catch (error) {
            console.error('Error in upsertEzAdminReturnClaims:', error);
            throw error;
        }
    }
    async upsertEzAdminCsDetails (data) {
        try {
            const result = await this.models.ezadmin_cs_detail.upsert(data, { ignoreDuplicates: true });
            console.log('Bulk create ezadmin_cs_details 성공:', result.length);
            return result;
        } catch (error) {
            console.error('Error in upsertEzAdminCsDetails:', error);
            throw error;
        }
    }
    async findAllClaimsByTraceNumber(TraceNumber) {
        try {
            const result = await this.models.ezadmin_return_claim.findAll({
                where: {
                    original_trace_number: TraceNumber
                },
                raw: true
            });
            return result;
        } catch (error) {
            console.error('Error in findAllClaimsByReturnTraceNumber:', error);
            throw error;
        }
    }
        async findAllDetailsByTraceNumber(TraceNumber) {
        try {
            const result = await this.models.ezadmin_cs_detail.findAll({
            include: [{
                model: this.models.ezadmin_return_claim,
                as: 'management_number_ezadmin_return_claim',
            }],
            where: {
                '$management_number_ezadmin_return_claim.original_trace_number$': '6091476094215'
            },
            logging: console.log
            });
            return result;
        } catch (error) {
            console.error('Error in findAllDetailsByTraceNumber:', error);
            throw error;
        }
        }
    async updateReturnTraceNumber(originalTraceNumber, returnTraceNumber) {
        try {
            const result = await this.models.ezadmin_return_claim.update(
                { return_trace_number: returnTraceNumber },
                { where: { original_trace_number: originalTraceNumber } }
            );
            console.log('Return trace number updated successfully:', result);
            return result;
        } catch (error) {
            console.error('Error in updateReturnTraceNumber:', error);
            throw error;
        }
    }


    
}

module.exports = EzAdminRepository;
