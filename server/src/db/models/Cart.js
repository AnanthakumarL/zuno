import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const Cart = sequelize.define('Cart', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  account_id: { type: DataTypes.UUID, allowNull: false, unique: true },
  items:      { type: DataTypes.JSON, defaultValue: [] },
}, { tableName: 'carts' });

export default Cart;
