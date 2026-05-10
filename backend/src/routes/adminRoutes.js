import { Router } from 'express'
import { User } from '../models/User.js'
import { Vehicle } from '../models/Vehicle.js'
import { Booking } from '../models/Booking.js'
import { TestDrive } from '../models/TestDrive.js'
import { LoanApplication } from '../models/LoanApplication.js'
import { AuditLog } from '../models/AuditLog.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { auditLogger, createAuditLog } from '../middleware/auditLogger.js'

export const adminRouter = Router()

// All admin routes require authentication and admin role
adminRouter.use(authenticate, authorize('admin'))

// System metrics
adminRouter.get('/metrics', async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalVehicles,
      totalBookings,
      totalTestDrives,
      totalLoans,
      activeUsers,
      availableVehicles,
      pendingBookings,
      recentAudits,
    ] = await Promise.all([
      User.countDocuments(),
      Vehicle.countDocuments(),
      Booking.countDocuments(),
      TestDrive.countDocuments(),
      LoanApplication.countDocuments(),
      User.countDocuments({ active: true }),
      Vehicle.countDocuments({ status: 'available' }),
      Booking.countDocuments({ status: 'pending' }),
      AuditLog.find().sort({ createdAt: -1 }).limit(10).lean(),
    ])

    const metrics = {
      users: { total: totalUsers, active: activeUsers },
      vehicles: { total: totalVehicles, available: availableVehicles },
      bookings: { total: totalBookings, pending: pendingBookings },
      testDrives: { total: totalTestDrives },
      loans: { total: totalLoans },
      recentActivity: recentAudits,
    }

    res.json(metrics)
  } catch (err) {
    next(err)
  }
})

// User management
adminRouter.get('/users', auditLogger('view_users', 'user'), async (req, res, next) => {
  try {
    const { role, active, search, page = 1, limit = 50 } = req.query
    const query = {}

    if (role) query.role = role
    if (active !== undefined) query.active = active === 'true'
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      User.countDocuments(query),
    ])

    res.json({ users, total, page: parseInt(page), limit: parseInt(limit) })
  } catch (err) {
    next(err)
  }
})

adminRouter.get('/users/:id', auditLogger('view_user', 'user'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean()
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const [bookings, testDrives, loans, vehicles] = await Promise.all([
      Booking.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10).lean(),
      TestDrive.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10).lean(),
      LoanApplication.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10).lean(),
      user.role === 'dealer' ? Vehicle.find({ dealerCode: user.dealerCode }).lean() : Promise.resolve([]),
    ])

    res.json({ user, bookings, testDrives, loans, vehicles })
  } catch (err) {
    next(err)
  }
})

adminRouter.patch('/users/:id', auditLogger('update_user', 'user'), async (req, res, next) => {
  try {
    const { role, active, dealerCode, name, phone } = req.body
    const updates = {}

    if (role) updates.role = role
    if (active !== undefined) updates.active = active
    if (dealerCode) updates.dealerCode = dealerCode
    if (name) updates.name = name
    if (phone) updates.phone = phone

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    await createAuditLog(
      req.user._id,
      req.user.name,
      req.user.role,
      'update_user',
      'user',
      user._id.toString(),
      updates,
    )

    res.json({ user })
  } catch (err) {
    next(err)
  }
})

adminRouter.delete('/users/:id', auditLogger('delete_user', 'user'), async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    await createAuditLog(
      req.user._id,
      req.user.name,
      req.user.role,
      'delete_user',
      'user',
      req.params.id,
      { email: user.email },
    )

    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

// Vehicle management (admin can manage all vehicles)
adminRouter.get('/vehicles', auditLogger('view_vehicles', 'vehicle'), async (req, res, next) => {
  try {
    const { status, dealerCode, search, page = 1, limit = 50 } = req.query
    const query = {}

    if (status) query.status = status
    if (dealerCode) query.dealerCode = dealerCode
    if (search) {
      query.$or = [
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { vin: { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [vehicles, total] = await Promise.all([
      Vehicle.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Vehicle.countDocuments(query),
    ])

    res.json({ vehicles, total, page: parseInt(page), limit: parseInt(limit) })
  } catch (err) {
    next(err)
  }
})

adminRouter.patch('/vehicles/:id', auditLogger('update_vehicle', 'vehicle'), async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' })
    }

    res.json({ vehicle })
  } catch (err) {
    next(err)
  }
})

adminRouter.delete('/vehicles/:id', auditLogger('delete_vehicle', 'vehicle'), async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id)
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' })
    }

    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

// Booking management
adminRouter.get('/bookings', auditLogger('view_bookings', 'booking'), async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query
    const query = {}

    if (status) query.status = status

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('userId', 'name email')
        .populate('vehicleId', 'make model year vin')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Booking.countDocuments(query),
    ])

    res.json({ bookings, total, page: parseInt(page), limit: parseInt(limit) })
  } catch (err) {
    next(err)
  }
})

adminRouter.patch('/bookings/:id', auditLogger('update_booking', 'booking'), async (req, res, next) => {
  try {
    const { status, notes } = req.body
    const updates = {}

    if (status) updates.status = status
    if (notes !== undefined) updates.notes = notes

    const booking = await Booking.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('userId', 'name email')
      .populate('vehicleId', 'make model year')

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    res.json({ booking })
  } catch (err) {
    next(err)
  }
})

// Audit logs
adminRouter.get('/audit-logs', async (req, res, next) => {
  try {
    const { userId, action, entityType, startDate, endDate, page = 1, limit = 100 } = req.query
    const query = {}

    if (userId) query.userId = userId
    if (action) query.action = action
    if (entityType) query.entityType = entityType
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(endDate)
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      AuditLog.countDocuments(query),
    ])

    res.json({ logs, total, page: parseInt(page), limit: parseInt(limit) })
  } catch (err) {
    next(err)
  }
})

// Analytics
adminRouter.get('/analytics/revenue', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query
    const dateFilter = {}

    if (startDate) dateFilter.$gte = new Date(startDate)
    if (endDate) dateFilter.$lte = new Date(endDate)

    const query = { status: 'completed' }
    if (Object.keys(dateFilter).length) query.createdAt = dateFilter

    const bookings = await Booking.find(query).populate('vehicleId', 'currentPrice').lean()

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.vehicleId?.currentPrice || 0), 0)
    const revenueByMonth = {}

    bookings.forEach((booking) => {
      const month = new Date(booking.createdAt).toISOString().slice(0, 7)
      revenueByMonth[month] = (revenueByMonth[month] || 0) + (booking.vehicleId?.currentPrice || 0)
    })

    res.json({ totalRevenue, revenueByMonth, bookingCount: bookings.length })
  } catch (err) {
    next(err)
  }
})
