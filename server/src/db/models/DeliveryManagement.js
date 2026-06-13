import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const DeliveryManagement = sequelize.define('DeliveryManagement', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  order_id: { type: DataTypes.UUID },
  tracking_number: { type: DataTypes.STRING(100) },
  delivery_date: { type: DataTypes.DATEONLY },
  status: { type: DataTypes.STRING(20), defaultValue: 'pending' },
  contact_name: { type: DataTypes.STRING(255) },
  contact_phone: { type: DataTypes.STRING(50) },
  address: { type: DataTypes.TEXT },
  notes: { type: DataTypes.TEXT },
  delivery_identifier: { type: DataTypes.STRING(255) },
  delivery_assigned_at: { type: DataTypes.DATE },
  attributes: { type: DataTypes.JSON },
}, { tableName: 'delivery_managements' });

export default DeliveryManagement;
