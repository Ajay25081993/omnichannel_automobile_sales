import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    action: { type: String, required: true, trim: true },
    entityType: { type: String, required: true, trim: true },
    entityId: { type: String, trim: true },
    changes: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    status: { type: String, enum: ['success', 'failure'], default: 'success' },
    errorMessage: { type: String, trim: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
)

auditLogSchema.index({ userId: 1, createdAt: -1 })
auditLogSchema.index({ entityType: 1, entityId: 1 })
auditLogSchema.index({ action: 1, createdAt: -1 })

export const AuditLog = mongoose.model('AuditLog', auditLogSchema)
