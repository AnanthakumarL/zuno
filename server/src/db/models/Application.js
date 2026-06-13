import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const Application = sequelize.define('Application', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  job_id: { type: DataTypes.UUID },
  job_title: { type: DataTypes.STRING(255) },
  applicant_name: { type: DataTypes.STRING(255) },
  applicant_email: { type: DataTypes.STRING(255) },
  applicant_phone: { type: DataTypes.STRING(50) },
  message: { type: DataTypes.TEXT },
  resume_url: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('pending', 'reviewed', 'accepted', 'rejected'), defaultValue: 'pending' },
  attributes: { type: DataTypes.JSON },
}, { tableName: 'applications' });

export default Application;
