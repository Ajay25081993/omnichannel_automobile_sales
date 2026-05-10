import { Router } from 'express'
import { CustomerVehicle } from '../models/CustomerVehicle.js'
import { authenticate } from '../middleware/auth.js'
import { createAuditLog } from '../middleware/auditLogger.js'

export const customerVehicleRouter = Router()

// All routes require authentication
customerVehicleRouter.use(authenticate)

// Get all customer's own vehicles
customerVehicleRouter.get('/', async (req, res, next) => {
  try {
    const vehicles = await CustomerVehicle.find({ ownerId: req.user._id })
      .sort({ createdAt: -1 })
      .lean()
    res.json(vehicles)
  } catch (err) {
    next(err)
  }
})

// Get single vehicle
customerVehicleRouter.get('/:id', async (req, res, next) => {
  try {
    const vehicle = await CustomerVehicle.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    }).lean()

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' })
    }

    res.json(vehicle)
  } catch (err) {
    next(err)
  }
})

// Register a new vehicle
customerVehicleRouter.post('/', async (req, res, next) => {
  try {
    const vehicleData = {
      ...req.body,
      ownerId: req.user._id,
    }

    const vehicle = await CustomerVehicle.create(vehicleData)

    await createAuditLog(
      req.user._id,
      req.user.name,
      req.user.role,
      'register_customer_vehicle',
      'customer_vehicle',
      vehicle._id.toString(),
      { make: vehicle.make, model: vehicle.model, year: vehicle.year, vin: vehicle.vin },
    )

    res.status(201).json(vehicle)
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error('Vehicle with this VIN already registered')
      error.status = 400
      next(error)
      return
    }
    next(err)
  }
})

// Update vehicle
customerVehicleRouter.patch('/:id', async (req, res, next) => {
  try {
    const vehicle = await CustomerVehicle.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    })

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' })
    }

    Object.assign(vehicle, req.body)
    await vehicle.save()

    await createAuditLog(
      req.user._id,
      req.user.name,
      req.user.role,
      'update_customer_vehicle',
      'customer_vehicle',
      vehicle._id.toString(),
      req.body,
    )

    res.json(vehicle)
  } catch (err) {
    next(err)
  }
})

// Delete vehicle
customerVehicleRouter.delete('/:id', async (req, res, next) => {
  try {
    const vehicle = await CustomerVehicle.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user._id,
    })

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' })
    }

    await createAuditLog(
      req.user._id,
      req.user.name,
      req.user.role,
      'delete_customer_vehicle',
      'customer_vehicle',
      req.params.id,
      { vin: vehicle.vin },
    )

    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
