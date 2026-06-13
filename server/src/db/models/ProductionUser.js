import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const ProductionUser = sequelize.define('ProductionUser', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  identifier: { type: DataTypes.STRING(255), unique: true, allowNull: false },
  production_address: { type: DataTypes.TEXT },
  password: { type: DataTypes.STRING(255), allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'production_users' });

export default ProductionUser;
