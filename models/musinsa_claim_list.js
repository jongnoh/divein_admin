const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('musinsa_claim_list', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    requested_datetime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    order_number: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    serial_number: {
      type: DataTypes.STRING(64),
      allowNull: true,
      unique: "unique_serial_number"
    },
    delivery_company: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    return_trace_number: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    original_trace_number: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    claim_reason: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    claim_content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    product_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    product_option: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    claim_number: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    claim_status: {
      type: DataTypes.STRING(30),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'musinsa_claim_list',
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
        name: "unique_serial_number",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "serial_number" },
        ]
      },
    ]
  });
};
