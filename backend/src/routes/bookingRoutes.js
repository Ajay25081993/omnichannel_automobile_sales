import { Router } from 'express'
import mongoose from 'mongoose'
import { Booking } from '../models/Booking.js'
import { Vehicle } from '../models/Vehicle.js'

export const bookingRouter = Router()

bookingRouter.get('/', async (_req, res, next) => {
  try {
    const list = await Booking.find()
      .sort({ createdAt: -1 })
      .populate('vehicleId', 'make model year vin')
      .lean()
    res.json(list)
  } catch (e) {
    next(e)
  }
})

bookingRouter.post('/', async (req, res, next) => {
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const vehicle = await Vehicle.findById(req.body.vehicleId).session(session)
    if (!vehicle) {
      const err = new Error('Vehicle not found')
      err.status = 404
      throw err
    }
    if (vehicle.status !== 'available') {
      const err = new Error('Vehicle is not available for booking')
      err.status = 400
      throw err
    }
    vehicle.status = 'reserved'
    await vehicle.save({ session })

    const [booking] = await Booking.create([req.body], { session })

    await session.commitTransaction()
    res.status(201).json(booking)
  } catch (e) {
    await session.abortTransaction()
    next(e)
  } finally {
    session.endSession()
  }
})

bookingRouter.patch('/:id', async (req, res, next) => {
  try {
    const doc = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean()
    if (!doc) {
      const err = new Error('Booking not found')
      err.status = 404
      throw err
    }
    res.json(doc)
  } catch (e) {
    next(e)
  }
})
