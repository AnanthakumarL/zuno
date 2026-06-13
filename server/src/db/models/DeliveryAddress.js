import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const DeliveryAddress = sequelize.define('DeliveryAddress', {
  id:    { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  phone: { type: DataTypes.STRING(15), allowNull: false },
  label: { type: DataTypes.STRING(50) },
  name:  { type: DataTypes.STRING(200) },
  fname: { type: DataTypes.STRING(100) },
  lname: { type: DataTypes.STRING(100) },
  addr1: { type: DataTypes.STRING(255), allowNull: false },
  addr2: { type: DataTypes.STRING(255) },
  city:  { type: DataTypes.STRING(100) },
  state: { type: DataTypes.STRING(100) },
  pin:   { type: DataTypes.STRING(10), allowNull: false },
}, { tableName: 'delivery_addresses' });

export default DeliveryAddress;
