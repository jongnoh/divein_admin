const sequelize = require('../config/database').sequelize;
const { raw, Op, fn, col, where } = require('sequelize');
const initModels = require('../models/init-models');

class DiveinRepository {

    constructor() {
        this.models = initModels(sequelize);
    }

async upsertReturnInspectionList(data) {
    try {
        const {
            channel,
            return_trace_number,
            product_code,
            is_refurbishable,
            is_repackaged,
            is_proceed,
            ezadmin_management_number,
            musinsa_serial_number,
            comment
        } = data; 

        await this.models.return_inspection_list.upsert({
            channel,
            return_trace_number,
            product_code,
            is_refurbishable,
            is_repackaged,
            is_proceed,
            ezadmin_management_number,
            musinsa_serial_number,
            comment
        });
    } catch (error) {
        console.error('Error in upsertReturnInspectionList:', error);
        throw error;
    }
}

async findMusinsaInspectionList(startDate, endDate) {
    try {
        const result = await this.models.return_inspection_list.findAll({
            where: {
                [Op.and]: [
                    where(fn('DATE', col('createdAt')), { [Op.gte]: startDate }),
                    where(fn('DATE', col('createdAt')), { [Op.lte]: endDate }),

                ],
                musinsa_serial_number: {
    [Op.ne]: null
  }
            },
            raw: true
        });
        return result;
    } catch (error) {
        console.error('Error in findMusinsaInspectionList:', error);
        throw error;
    }
}
async findEzAdminInspectionList(startDate, endDate) {
    try {
        const result = await this.models.return_inspection_list.findAll({
            where: {
                [Op.and]: [
                    where(fn('DATE', col('createdAt')), { [Op.gte]: startDate }),
                    where(fn('DATE', col('createdAt')), { [Op.lte]: endDate }),

                ],
                ezadmin_management_number: {
                    [Op.ne]: null
                }
            },
            raw: true
        });
        return result;
    } catch (error) {
        console.error('Error in findMusinsaInspectionList:', error);
        throw error;
    }
}
async findAllInspectionList(objectData) {
    try {
        let {startDate, endDate, refurbishable, repackaged, proceed, system} = objectData;

        const whereObject = {
            [Op.and]: [
                where(fn('DATE', col('createdAt')), { [Op.gte]: startDate }),
                where(fn('DATE', col('createdAt')), { [Op.lte]: endDate }),
            ],
            ...(refurbishable !== null && refurbishable !== undefined ? { is_refurbishable: refurbishable } : {}),
            ...(repackaged !== null && repackaged !== undefined ? { is_repackaged: repackaged } : {}),
            ...(proceed !== null && proceed !== undefined ? { is_proceed: proceed } : {}),
            ...(
                system === 'ezadmin'
                    ? { ezadmin_management_number: { [Op.ne]: null } }
                    : system === 'musinsa'
                    ? { musinsa_serial_number: { [Op.ne]: null } }
                    : {}
            ),
        };

        const result = await this.models.return_inspection_list.findAll({
            whereObject,
            raw: true
        });
        return result;
    } catch (error) {
        console.error('Error in findAllInspectionList:', error);
        throw error;
    }

}
}

module.exports = DiveinRepository;
