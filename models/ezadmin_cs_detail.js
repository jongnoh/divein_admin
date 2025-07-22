const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ezadmin_cs_detail', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ezadmin_return_claim_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'ezadmin_return_claim',
        key: 'id'
      }
    },
    detail_index: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    detail: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ezadmin_cs_detail',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "ezadmin_return_claim_id",
        using: "BTREE",
        fields: [
          { name: "ezadmin_return_claim_id" },
        ]
      },
    ]
  });
};
