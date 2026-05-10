import { Router } from 'express'
import mongoose from 'mongoose'
import { Booking } from '../models/Booking.js'
import { Vehicle } from '../models/Vehicle.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { createAuditLog } from '../middleware/auditLogger.js'

export const bookingRouter = Router()

// Real-time availability check
bookingRouter.get('/availability/:vehicleId', async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.vehicleId).lean()

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' })
    }

    const isAvailable = vehicle.status === 'available' && vehicle.stockQuantity > 0

    res.json({
      vehicleId: vehicle._id,
      isAvailable,
      stockQuantity: vehicle.stockQuantity,
      status: vehicle.status,
      currentPrice: vehicle.currentPrice,
    })
  } catch (err) {
    next(err)
  }
})

bookingRouter.get('/', authenticate, async (req, res, next) => {
  try {
    let query = {}

    if (req.user.role === 'customer') {
      query.userId = req.user._id
    }

    if (req.user.role === 'dealer') {
      const dealerVehicles = await Vehicle.find({ dealerCode: req.user.dealerCode }).select('_id')
      const vehicleIds = dealerVehicles.map((v) => v._id)
      query.vehicleId = { $in: vehicleIds }
    }

    const list = await Booking.find(query)
      .sort({ createdAt: -1 })
      .populate('vehicleId', 'make model year vin currentPrice')
      .populate('userId', 'name email')
      .lean()

    res.json(list)
  } catch (e) {
    next(e)
  }
})

bookingRouter.post('/', authenticate, authorize('customer'), async (req, res, next) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const vehicle = await Vehicle.findById(req.body.vehicleId).session(session)

    if (!vehicle) {
      const err = new Error('Vehicle not found')
      err.status = 404
      throw err
    }

    if (vehicle.status !== 'available' || vehicle.stockQuantity <= 0) {
      const err = new Error('Vehicle is not available for booking')
      err.status = 400
      throw err
    }

    vehicle.stockQuantity -= 1
    if (vehicle.stockQuantity === 0) {
      vehicle.status = 'reserved'
    }

    vehicle.bookingCount += 1
    vehicle.calculateDynamicPrice()

    await vehicle.save({ session })

    const bookingData = {
      ...req.body,
      userId: req.user._id,
      customerName: req.user.name,
      email: req.user.email,
      bookingPrice: vehicle.currentPrice,
    }

    const [booking] = await Booking.create([bookingData], { session })

    await session.commitTransaction()

    await createAuditLog(
      req.user._id,
      req.user.name,
      req.user.role,
      'create_booking',
      'booking',
      booking._id.toString(),
      { vehicleId: vehicle._id.toString(), price: vehicle.currentPrice },
    )

    const populatedBooking = await Booking.findById(booking._id)
      .populate('vehicleId', 'make model year vin currentPrice')
      .lean()

    res.status(201).json(populatedBooking)
  } catch (e) {
    await session.abortTransaction()
    next(e)
  } finally {
    session.endSession()
  }
})

bookingRouter.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      const err = new Error('Booking not found')
      err.status = 404
      throw err
    }

    if (req.user.role === 'customer' && booking.userId.toString() !== req.user._id.toString()) {
      const err = new Error('You can only update your own bookings')
      err.status = 403
      throw err
    }

    if (req.body.status === 'confirmed' && !booking.confirmationNumber) {
      booking.status = 'confirmed'
      await booking.save()
    } else {
      Object.assign(booking, req.body)
      await booking.save()
    }

    await createAuditLog(
      req.user._id,
      req.user.name,
      req.user.role,
      'update_booking',
      'booking',
      booking._id.toString(),
      req.body,
    )

    const updatedBooking = await Booking.findById(booking._id)
      .populate('vehicleId', 'make model year vin currentPrice')
      .lean()

    res.json(updatedBooking)
  } catch (e) {
    next(e)
  }
})
