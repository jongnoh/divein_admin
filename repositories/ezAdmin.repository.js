const sequelize = require('../config/database').sequelize;
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



    
}

module.exports = EzAdminRepository;
