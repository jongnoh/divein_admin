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
      allowNull: true
    },
    order_status: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    claim_status: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    collection_method: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    auto_collection_method: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    collection_status: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    inspection_status: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    return_confirmation_request: {
      type: DataTypes.STRING(8),
      allowNull: true
    },
    return_on_hold: {
      type: DataTypes.STRING(8),
      allowNull: true
    },
    return_fee_issue: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    product_issue: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    inspection_pass: {
      type: DataTypes.STRING(8),
      allowNull: true
    },
    inspection_fail: {
      type: DataTypes.STRING(8),
      allowNull: true
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
    return_start_datetime: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    return_complete_datetime: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    return_claim_period: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    return_period: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    first_inspection_complete_datetime: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    item_type: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    product_name: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    product_option: {
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
    refund_status: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    deposit_amount: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    refund_amount: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    received_date: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    last_processed_date: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    refund_agency: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    payment_agency: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    payment_method: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    warehouse_name: {
      type: DataTypes.STRING(128),
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
    ]
  });
};
