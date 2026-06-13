import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const Account = sequelize.define('Account', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(255) },
  email: { type: DataTypes.STRING(255) },
  phone: { type: DataTypes.STRING(50) },
  role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  attributes: { type: DataTypes.JSON },
}, { tableName: 'accounts' });

export default Account;
