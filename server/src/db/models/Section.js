import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const Section = sequelize.define('Section', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT },
  parent_section_id: { type: DataTypes.UUID },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'sections' });

export default Section;
