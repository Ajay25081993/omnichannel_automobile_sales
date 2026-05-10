import { AuditLog } from '../models/AuditLog.js'

export const auditLogger = (action, entityType) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res)
    const originalSend = res.send.bind(res)

    res.json = function (data) {
      logAudit(req, res, action, entityType, data)
      return originalJson(data)
    }

    res.send = function (data) {
      logAudit(req, res, action, entityType, data)
      return originalSend(data)
    }

    next()
  }
}

async function logAudit(req, res, action, entityType, responseData) {
  if (!req.user) return

  try {
    const logEntry = {
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action,
      entityType,
      entityId: req.params.id || responseData?._id?.toString() || null,
      changes: {
        method: req.method,
        body: sanitizeBody(req.body),
        query: req.query,
      },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      status: res.statusCode >= 200 && res.statusCode < 400 ? 'success' : 'failure',
      metadata: {
        path: req.path,
        statusCode: res.statusCode,
      },
    }

    await AuditLog.create(logEntry)
  } catch (err) {
    console.error('Audit logging error:', err)
  }
}

function sanitizeBody(body) {
  if (!body) return null
  const sanitized = { ...body }
  if (sanitized.password) sanitized.password = '[REDACTED]'
  if (sanitized.token) sanitized.token = '[REDACTED]'
  return sanitized
}

export const createAuditLog = async (userId, userName, userRole, action, entityType, entityId, changes) => {
  try {
    await AuditLog.create({
      userId,
      userName,
      userRole,
      action,
      entityType,
      entityId,
      changes,
      status: 'success',
    })
  } catch (err) {
    console.error('Manual audit log error:', err)
  }
}
