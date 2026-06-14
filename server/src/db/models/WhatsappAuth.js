import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

// Key-value store for the WhatsApp (Baileys) auth state. Stored in the DB rather
// than on disk so the linked session survives redeploys on hosts with an
// ephemeral filesystem (e.g. Render). One row per Baileys auth key; `data` holds
// the BufferJSON-serialized value.
const WhatsappAuth = sequelize.define('WhatsappAuth', {
  id:   { type: DataTypes.STRING(191), primaryKey: true },
  data: { type: DataTypes.TEXT('long') },
}, { tableName: 'whatsapp_auth' });

export default WhatsappAuth;
