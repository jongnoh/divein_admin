const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('return_inspection_list', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    channel: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    return_trace_number: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    product_code: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    is_refurbishable: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    is_repackaged: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    is_proceed: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    ezadmin_management_number: {
      type: DataTypes.STRING(32),
      allowNull: true,
      unique: "ezadmin_management_number"
    },
    musinsa_serial_number: {
      type: DataTypes.STRING(32),
      allowNull: true,
      unique: "musinsa_serial_number"
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'return_inspection_list',
    timestamps: true,
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
        name: "musinsa_serial_number",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "musinsa_serial_number" },
        ]
      },
      {
        name: "ezadmin_management_number",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ezadmin_management_number" },
        ]
      },
    ]
  });
};
