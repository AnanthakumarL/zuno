import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const Category = sequelize.define('Category', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT },
  section_id: { type: DataTypes.UUID },
  parent_category_id: { type: DataTypes.UUID },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  slug: { type: DataTypes.STRING(255) },
  image_url: { type: DataTypes.TEXT },
}, { tableName: 'categories' });

export default Category;
