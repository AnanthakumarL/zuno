import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const DeliveryUser = sequelize.define('DeliveryUser', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  identifier: { type: DataTypes.STRING(255), unique: true },
  phone: { type: DataTypes.STRING(50) },
  login_id: { type: DataTypes.STRING(100) },
  email: { type: DataTypes.STRING(255) },
  is_production_account: { type: DataTypes.BOOLEAN, defaultValue: false },
  last_login: { type: DataTypes.DATE },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'delivery_users' });

export default DeliveryUser;
