import { Router } from 'express'
import { TestDrive } from '../models/TestDrive.js'
import { Vehicle } from '../models/Vehicle.js'
import { authenticate, authorize } from '../middleware/auth.js'

export const testDriveRouter = Router()

testDriveRouter.get('/', authenticate, async (req, res, next) => {
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

    const list = await TestDrive.find(query)
      .sort({ scheduledAt: 1 })
      .populate('vehicleId', 'make model year vin')
      .populate('userId', 'name email phone')
      .populate('approvedBy', 'name')
      .lean()

    res.json(list)
  } catch (e) {
    next(e)
  }
})

testDriveRouter.post('/', authenticate, authorize('customer'), async (req, res, next) => {
  try {
    const testDriveData = {
      ...req.body,
      userId: req.user._id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerPhone: req.user.phone || req.body.customerPhone,
    }

    const doc = await TestDrive.create(testDriveData)

    const populated = await TestDrive.findById(doc._id)
      .populate('vehicleId', 'make model year vin')
      .populate('userId', 'name email phone')
      .lean()

    res.status(201).json(populated)
  } catch (e) {
    next(e)
  }
})

testDriveRouter.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const testDrive = await TestDrive.findById(req.params.id)

    if (!testDrive) {
      const err = new Error('Test drive not found')
      err.status = 404
      throw err
    }

    if (req.user.role === 'dealer' && (req.body.status === 'approved' || req.body.status === 'rejected')) {
      const vehicle = await Vehicle.findById(testDrive.vehicleId)

      if (!vehicle || vehicle.dealerCode !== req.user.dealerCode) {
        const err = new Error('You can only approve test drives for your own vehicles')
        err.status = 403
        throw err
      }

      testDrive.status = req.body.status
      testDrive.dealerNotes = req.body.dealerNotes || testDrive.dealerNotes
      testDrive.approvedBy = req.user._id
      testDrive.approvedAt = new Date()

      await testDrive.save()
    } else if (req.user.role === 'customer') {
      if (testDrive.userId.toString() !== req.user._id.toString()) {
        const err = new Error('You can only update your own test drives')
        err.status = 403
        throw err
      }

      Object.assign(testDrive, req.body)
      await testDrive.save()
    } else {
      Object.assign(testDrive, req.body)
      await testDrive.save()
    }

    const updated = await TestDrive.findById(testDrive._id)
      .populate('vehicleId', 'make model year vin')
      .populate('userId', 'name email phone')
      .populate('approvedBy', 'name')
      .lean()

    res.json(updated)
  } catch (e) {
    next(e)
  }
})
