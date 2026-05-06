import { Router } from 'express'
import { Vehicle } from '../models/Vehicle.js'

export const vehicleRouter = Router()

vehicleRouter.get('/', async (_req, res, next) => {
  try {
    const list = await Vehicle.find().sort({ createdAt: -1 }).lean()
    res.json(list)
  } catch (e) {
    next(e)
  }
})

vehicleRouter.get('/:id', async (req, res, next) => {
  try {
    const v = await Vehicle.findById(req.params.id).lean()
    if (!v) {
      const err = new Error('Vehicle not found')
      err.status = 404
      throw err
    }
    res.json(v)
  } catch (e) {
    next(e)
  }
})

vehicleRouter.post('/', async (req, res, next) => {
  try {
    const doc = await Vehicle.create(req.body)
    res.status(201).json(doc)
  } catch (e) {
    if (e.code === 11000) {
      const err = new Error('Duplicate VIN')
      err.status = 400
      next(err)
      return
    }
    next(e)
  }
})

vehicleRouter.patch('/:id', async (req, res, next) => {
  try {
    const doc = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean()
    if (!doc) {
      const err = new Error('Vehicle not found')
      err.status = 404
      throw err
    }
    res.json(doc)
  } catch (e) {
    next(e)
  }
})

vehicleRouter.delete('/:id', async (req, res, next) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id)
    res.status(204).send()
  } catch (e) {
    next(e)
  }
})
