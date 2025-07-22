const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ezadmin_return_claim', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    sent_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    management_number: {
      type: DataTypes.STRING(32),
      allowNull: true,
      unique: "management_number_2"
    },
    channel: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    order_number: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    original_trace_number: {
      type: DataTypes.STRING(64),
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
    cs_count: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ezadmin_return_claim',
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
        name: "management_number",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "management_number" },
        ]
      },
      {
        name: "management_number_2",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "management_number" },
        ]
      },
    ]
  });
};
