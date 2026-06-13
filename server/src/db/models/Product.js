import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const Product = sequelize.define('Product', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  compare_at_price: { type: DataTypes.DECIMAL(10, 2) },
  cost: { type: DataTypes.DECIMAL(10, 2) },
  category_id: { type: DataTypes.UUID },
  section_id: { type: DataTypes.UUID },
  sku: { type: DataTypes.STRING(100) },
  inventory_quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  min_order_quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  order_multiple: { type: DataTypes.INTEGER, defaultValue: 1 },
  image_data: { type: DataTypes.BLOB('long') },
  image_mime: { type: DataTypes.STRING(100) },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  discount_percentage: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  attributes: { type: DataTypes.JSON },
  slug: { type: DataTypes.STRING(255) },
  product_type: { type: DataTypes.STRING(100) },
}, { tableName: 'products' });

export default Product;
