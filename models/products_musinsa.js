const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('products_musinsa', {
    product_code: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    product_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    product_option: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    }
  }, {
    sequelize,
    tableName: 'products_musinsa',
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
