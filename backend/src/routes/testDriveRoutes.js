import { Router } from 'express'
import { TestDrive } from '../models/TestDrive.js'

export const testDriveRouter = Router()

testDriveRouter.get('/', async (_req, res, next) => {
  try {
    const list = await TestDrive.find()
      .sort({ scheduledAt: 1 })
      .populate('vehicleId', 'make model year vin')
      .lean()
    res.json(list)
  } catch (e) {
    next(e)
  }
})

testDriveRouter.post('/', async (req, res, next) => {
  try {
    const doc = await TestDrive.create(req.body)
    res.status(201).json(doc)
  } catch (e) {
    next(e)
  }
})

testDriveRouter.patch('/:id', async (req, res, next) => {
  try {
    const doc = await TestDrive.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean()
    if (!doc) {
      const err = new Error('Test drive not found')
      err.status = 404
      throw err
    }
    res.json(doc)
  } catch (e) {
    next(e)
  }
})
