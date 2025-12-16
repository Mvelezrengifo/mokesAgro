const sequelize = require('../config/database');
const User = require('./User');
const Report = require('./Report');

// Definir relaciones
User.hasMany(Report, { foreignKey: 'userId', as: 'reports' });
Report.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Relación para usuarios creados por ingenieros
User.hasMany(User, { foreignKey: 'createdBy', as: 'employees' });
User.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

module.exports = {
  sequelize,
  User,
  Report
};