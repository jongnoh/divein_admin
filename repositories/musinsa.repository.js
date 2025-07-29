

const sequelize = require('../config/database').sequelize;
const { where, Op } = require('sequelize');
const initModels = require('../models/init-models');

class MusinsaRepository {
    
    constructor() {
        this.models = initModels(sequelize);
    }
    async upsertCsList(data) {
        try {
            const result = await this.models.musinsa_claim_list.upsert(data, { ignoreDuplicates: true });
            console.log('Upsert musinsa_cs_list 성공:', result.length);
            return result;
        } catch (error) {
            console.error('Error in upsertMusinsaCsList:', error);
            throw error;
        }
    }
async findAllForUpdateClaimNumber() {
    try {
        const result = await this.models.musinsa_claim_list.findAll({
            attributes: ['id', 'order_number', 'serial_number'],
            where: {
                claim_number: {
                    [Op.is]: null
                },
                claim_status: {
                    [Op.in]: ['교환요청', '환불요청']
                }
            },
            raw: true
        });
        return result;
    } catch (error) {
        console.error('Error in findAllForUpdateClaimNumber:', error);
        throw error;
    }
}

    async updateClaimNumber(id, claimNumber) {
        try {
            const result = await this.models.musinsa_claim_list.update(
                { claim_number: claimNumber },
                { where: { id: id } }
            );
            return result;
        } catch (error) {
            console.error('Error in updateClaimNumber:', error);
            throw error;
        }
    }
    async findAllByReturnTraceNumber(returnTraceNumber) {
        try {
            const result = await this.models.musinsa_claim_list.findAll({
                where: {
                    return_trace_number: returnTraceNumber
                },
                raw: true
            });
            return result;
        } catch (error) {
            console.error('Error in findAllByReturnTraceNumber:', error);
            throw error;
        }
    }
    async findOneClaimBySerialNumber(serialNumber) {
        try {
            const result = await this.models.musinsa_claim_list.findOne({
                where: {
                    serial_number: serialNumber
                },
                raw: true
            });
            return result;
        } catch (error) {
            console.error('Error in findOneClaimBySerialNumber:', error);
            throw error;
        }
    }
    async findOneProductCodeByNameAndOption(productName, productOption) {
        try {
            const result = await this.models.products_musinsa.findOne({
                where: {
                    product_name: productName,
                    product_option: productOption
                },
                attributes: ['product_code'],
                raw: true
            });
            return result ? result.product_code : null;
        } catch (error) {
            console.error('Error in findProductCodeByNameAndOption:', error);
            throw error;
        }
    }

    async findOneProductNameAndOptionByProductCode(productCode) {
        try {
            const result = await this.models.products_musinsa.findOne({
                where: {
                    product_code: productCode
                },
                attributes: ['product_name', 'product_option'],
                raw: true
            });
            return result
        } catch (error) {
            console.error('Error in findProductCodeByNameAndOption:', error);
            throw error;
        }
    }

    async upsertReturnInspectionList(data) {
        try {
            const result = await this.models.return_inspection_list.upsert(data, { ignoreDuplicates: true });
            console.log('Upsert return_inspection_list 성공:', result.length);
            return result;
        } catch (error) {
            console.error('Error in upsertReturnInspectionList:', error);
            throw error;
        }
    }


}
module.exports = MusinsaRepository;
