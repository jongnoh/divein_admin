const sequelize = require('../config/database').sequelize;
const initModels = require('../models/init-models');

class Repository {

    constructor() {
        this.models = initModels(sequelize);
    }
    async bulkCreateEzAdminReturnClaims (data) {
        try {
            const result = await this.models.ezadmin_return_claim.bulkCreate(data, { ignoreDuplicates: true });
            console.log('Bulk create ezadmin_return_claims 성공:', result.length);
        } catch (error) {
            console.error('Error in bulkCreateEzAdminReturnClaims:', error);
            throw error;
        }
    }
    async bulkCreateEzAdminCsDetails (data) {
        try {
            const result = await this.models.ezadmin_cs_detail.bulkCreate(data, { ignoreDuplicates: true });
            console.log('Bulk create ezadmin_cs_details 성공:', result.length);
            return result;
        } catch (error) {
            console.error('Error in bulkCreateEzAdminCsDetails:', error);
            throw error;
        }
    }
    
}

module.exports = Repository;
