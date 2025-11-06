var DataTypes = require("sequelize").DataTypes;
var _musinsa_claim_list = require("./musinsa_claim_list");
var _products_ezadmin = require("./products_ezadmin");
var _products_musinsa = require("./products_musinsa");
var _return_inspection_list = require("./return_inspection_list");

function initModels(sequelize) {
  var musinsa_claim_list = _musinsa_claim_list(sequelize, DataTypes);
  var products_ezadmin = _products_ezadmin(sequelize, DataTypes);
  var products_musinsa = _products_musinsa(sequelize, DataTypes);
  var return_inspection_list = _return_inspection_list(sequelize, DataTypes);

  return {
    musinsa_claim_list,
    products_ezadmin,
    products_musinsa,
    return_inspection_list,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
