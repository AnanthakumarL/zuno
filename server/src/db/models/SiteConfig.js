import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const SiteConfig = sequelize.define('SiteConfig', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(255) },
  email: { type: DataTypes.STRING(255) },
  phone: { type: DataTypes.STRING(50) },
  address: { type: DataTypes.TEXT },
  description: { type: DataTypes.TEXT },
  logo_url: { type: DataTypes.TEXT },
  attributes: { type: DataTypes.JSON },
  tax_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 5 },
  currency_symbol: { type: DataTypes.STRING(10), defaultValue: '₹' },
}, { tableName: 'site_configs' });

export default SiteConfig;
