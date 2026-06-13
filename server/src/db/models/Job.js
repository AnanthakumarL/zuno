import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const Job = sequelize.define('Job', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  status: { type: DataTypes.STRING(20), defaultValue: 'pending' },
  scheduled_at: { type: DataTypes.DATE },
  started_at: { type: DataTypes.DATE },
  finished_at: { type: DataTypes.DATE },
  notes: { type: DataTypes.TEXT },
  attributes: { type: DataTypes.JSON },
}, { tableName: 'jobs' });

export default Job;
