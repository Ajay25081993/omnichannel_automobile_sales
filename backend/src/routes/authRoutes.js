import { Router } from 'express'
import { User } from '../models/User.js'
import { authenticate, generateToken } from '../middleware/auth.js'

export const authRouter = Router()

authRouter.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, phone, role, dealerCode } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    if (role === 'dealer' && !dealerCode) {
      return res.status(400).json({ error: 'Dealer code required for dealer accounts' })
    }

    const user = await User.create({
      email,
      password,
      name,
      phone,
      role: role || 'customer',
      dealerCode,
    })

    const token = generateToken(user._id)
    res.status(201).json({ user, token })
  } catch (err) {
    next(err)
  }
})

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    if (!user.active) {
      return res.status(403).json({ error: 'Account is inactive' })
    }

    const token = generateToken(user._id)
    const userObj = user.toJSON()
    res.json({ user: userObj, token })
  } catch (err) {
    next(err)
  }
})

authRouter.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user })
})

authRouter.patch('/me', authenticate, async (req, res, next) => {
  try {
    const { name, phone, preferences } = req.body
    const updates = {}

    if (name) updates.name = name
    if (phone) updates.phone = phone
    if (preferences) updates.preferences = preferences

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password')

    res.json({ user })
  } catch (err) {
    next(err)
  }
})
