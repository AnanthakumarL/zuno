import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const Order = sequelize.define('Order', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  order_number: { type: DataTypes.STRING(50), unique: true },
  customer_name: { type: DataTypes.STRING(255) },
  customer_identifier: { type: DataTypes.STRING(255) },
  customer_email: { type: DataTypes.STRING(255) },
  customer_phone: { type: DataTypes.STRING(50) },
  shipping_address: { type: DataTypes.TEXT },
  billing_address: { type: DataTypes.TEXT },
  items: { type: DataTypes.JSON, defaultValue: [] },
  subtotal: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  tax: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  shipping_cost: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  status: { type: DataTypes.STRING(30), defaultValue: 'pending' },
  production_status: { type: DataTypes.STRING(30), defaultValue: 'order_received' },
  notes: { type: DataTypes.TEXT },
  source: { type: DataTypes.STRING(50), defaultValue: 'web' },
  payment_status: { type: DataTypes.STRING(20), defaultValue: 'unpaid' },
  payment_method: { type: DataTypes.STRING(50) },
  delivery_datetime: { type: DataTypes.STRING(255) },
  delivery_date: { type: DataTypes.STRING(50) },
  delivery_time: { type: DataTypes.STRING(50) },
  scooper_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  scooper_cost: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  order_type: { type: DataTypes.STRING(10), defaultValue: 'B2C' },
  gst_number: { type: DataTypes.STRING(50) },
  production_identifier: { type: DataTypes.STRING(255) },
  production_assigned_at: { type: DataTypes.DATE },
  account_id: { type: DataTypes.UUID },
}, { tableName: 'orders' });

export default Order;
