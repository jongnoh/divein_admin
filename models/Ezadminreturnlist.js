const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ezadminreturnlist = sequelize.define('Ezadminreturnlist', {
  orderNumber: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  channel: {
    type: DataTypes.STRING,
    defaultValue: '0'
  },
  contents: {
    type: DataTypes.STRING
  },
  returnTraceNumber: {
    type: DataTypes.INTEGER
  },
  originalTraceNumber: {
    type: DataTypes.INTEGER
  },
  sentAt: {
    type: DataTypes.DATE
  },
  claimedAt: {
    type: DataTypes.DATE
  },
  log: {
    type: DataTypes.STRING
  },
  chennel: {
    type: DataTypes.STRING
  },
}, {
  tableName: 'ezadminreturnlist',
  timestamps: false // 기존 테이블이므로 timestamps 비활성화
});

module.exports = Ezadminreturnlist;
