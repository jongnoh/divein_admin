const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('musinsa_claims', {
    claim_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true
    },
    order_number: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    delivery_company: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    return_trace_number: {
      type: DataTypes.STRING(100),
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
    reason: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    claim_status: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    user_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    refund_status: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    pay_amount: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    refund_amount: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    request_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_up_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ord_opt_number: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    goods_no: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    order_status: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    closed_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    memo: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'musinsa_claims',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "claim_number" },
        ]
      },
    ]
  });
};
