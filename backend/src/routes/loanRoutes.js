import { Router } from 'express'
import { LoanApplication } from '../models/LoanApplication.js'

export const loanRouter = Router()

loanRouter.get('/', async (_req, res, next) => {
  try {
    const list = await LoanApplication.find()
      .sort({ updatedAt: -1 })
      .populate('vehicleId', 'make model year vin')
      .lean()
    res.json(list)
  } catch (e) {
    next(e)
  }
})

loanRouter.post('/', async (req, res, next) => {
  try {
    const payload = { ...req.body }
    if (!payload.vehicleId) delete payload.vehicleId
    const doc = await LoanApplication.create(payload)
    res.status(201).json(doc)
  } catch (e) {
    next(e)
  }
})

loanRouter.patch('/:id/status', async (req, res, next) => {
  try {
    const { status, decisionNotes } = req.body
    if (!status) {
      const err = new Error('status is required')
      err.status = 400
      throw err
    }
    const doc = await LoanApplication.findByIdAndUpdate(
      req.params.id,
      { status, ...(decisionNotes != null ? { decisionNotes } : {}) },
      { new: true, runValidators: true },
    ).lean()
    if (!doc) {
      const err = new Error('Loan application not found')
      err.status = 404
      throw err
    }
    res.json(doc)
  } catch (e) {
    next(e)
  }
})
