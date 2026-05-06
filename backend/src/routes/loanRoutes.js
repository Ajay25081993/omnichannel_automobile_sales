import { Router } from 'express'
import { LoanApplication } from '../models/LoanApplication.js'
import { authenticate, authorize } from '../middleware/auth.js'

export const loanRouter = Router()

loanRouter.get('/', authenticate, async (req, res, next) => {
  try {
    let query = {}

    if (req.user.role === 'customer') {
      query.userId = req.user._id
    }

    const list = await LoanApplication.find(query)
      .sort({ updatedAt: -1 })
      .populate('vehicleId', 'make model year vin currentPrice')
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name institutionName')
      .lean()

    res.json(list)
  } catch (e) {
    next(e)
  }
})

loanRouter.post('/', authenticate, authorize('customer'), async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      userId: req.user._id,
      applicantName: req.user.name,
      applicantEmail: req.user.email,
    }

    if (!payload.vehicleId) delete payload.vehicleId

    const doc = await LoanApplication.create(payload)

    const populated = await LoanApplication.findById(doc._id)
      .populate('vehicleId', 'make model year vin currentPrice')
      .lean()

    res.status(201).json(populated)
  } catch (e) {
    next(e)
  }
})

loanRouter.patch('/:id/status', authenticate, authorize('financial_institution'), async (req, res, next) => {
  try {
    const { status, decisionNotes, approvedAmount, interestRate } = req.body

    if (!status) {
      const err = new Error('status is required')
      err.status = 400
      throw err
    }

    const loan = await LoanApplication.findById(req.params.id)

    if (!loan) {
      const err = new Error('Loan application not found')
      err.status = 404
      throw err
    }

    loan.status = status
    loan.decisionNotes = decisionNotes || loan.decisionNotes
    loan.reviewedBy = req.user._id
    loan.reviewedAt = new Date()

    if (status === 'approved') {
      loan.approvedAmount = approvedAmount || loan.requestedAmount
      loan.interestRate = interestRate
    }

    await loan.save()

    const updated = await LoanApplication.findById(loan._id)
      .populate('vehicleId', 'make model year vin currentPrice')
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name institutionName')
      .lean()

    res.json(updated)
  } catch (e) {
    next(e)
  }
})

loanRouter.get('/:id', authenticate, async (req, res, next) => {
  try {
    const loan = await LoanApplication.findById(req.params.id)
      .populate('vehicleId', 'make model year vin currentPrice')
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name institutionName')
      .lean()

    if (!loan) {
      const err = new Error('Loan application not found')
      err.status = 404
      throw err
    }

    if (req.user.role === 'customer' && loan.userId._id.toString() !== req.user._id.toString()) {
      const err = new Error('You can only view your own loan applications')
      err.status = 403
      throw err
    }

    res.json(loan)
  } catch (e) {
    next(e)
  }
})
