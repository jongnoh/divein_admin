var DataTypes = require("sequelize").DataTypes;
var _ezadmin_cs_detail = require("./ezadmin_cs_detail");
var _ezadmin_return_claim = require("./ezadmin_return_claim");
var _musinsa_claim_list = require("./musinsa_claim_list");
var _return_inspection_list = require("./return_inspection_list");

function initModels(sequelize) {
  var ezadmin_cs_detail = _ezadmin_cs_detail(sequelize, DataTypes);
  var ezadmin_return_claim = _ezadmin_return_claim(sequelize, DataTypes);
  var musinsa_claim_list = _musinsa_claim_list(sequelize, DataTypes);
  var return_inspection_list = _return_inspection_list(sequelize, DataTypes);

  ezadmin_cs_detail.belongsTo(ezadmin_return_claim, { as: "ezadmin_return_claim", foreignKey: "ezadmin_return_claim_id"});
  ezadmin_return_claim.hasMany(ezadmin_cs_detail, { as: "ezadmin_cs_details", foreignKey: "ezadmin_return_claim_id"});

  return {
    ezadmin_cs_detail,
    ezadmin_return_claim,
    musinsa_claim_list,
    return_inspection_list,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
