import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const ProductionManagement = sequelize.define('ProductionManagement', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(255) },
  production_date: { type: DataTypes.DATEONLY },
  status: {
    type: DataTypes.ENUM('planned', 'started', 'in_progress', 'ready_to_dispatch'),
    defaultValue: 'planned',
  },
  quantity: { type: DataTypes.INTEGER },
  product_id: { type: DataTypes.UUID },
  notes: { type: DataTypes.TEXT },
  attributes: { type: DataTypes.JSON },
}, { tableName: 'production_managements' });

export default ProductionManagement;
