const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ezadmin_cs_detail', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    detail_index: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    detail: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    management_number: {
      type: DataTypes.STRING(32),
      allowNull: true,
      references: {
        model: 'ezadmin_return_claim',
        key: 'management_number'
      }
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
        name: "unique_detail_index_detail_management_number",
        unique: true,
        using: "HASH",
        fields: [
          { name: "detail_index" },
          { name: "detail" },
          { name: "management_number" },
        ]
      },
      {
        name: "fk_cs_detail_return_claim",
        using: "BTREE",
        fields: [
          { name: "management_number" },
        ]
      },
    ]
  });
};
