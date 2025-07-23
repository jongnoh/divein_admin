const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('return_inspection_list', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    product_code: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    claim_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    channel: {
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
    is_refurbishable: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    is_repackaged: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    is_ezadmin: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    is_proceed: {
      type: DataTypes.BOOLEAN,
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
    ]
  });
};
