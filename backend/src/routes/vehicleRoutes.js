import { Router } from 'express'
import { Vehicle } from '../models/Vehicle.js'
import { User } from '../models/User.js'
import { authenticate, authorize } from '../middleware/auth.js'

export const vehicleRouter = Router()

vehicleRouter.get('/', async (req, res, next) => {
  try {
    const { available } = req.query
    const query = available === 'true' ? { status: 'available', stockQuantity: { $gt: 0 } } : {}
    const list = await Vehicle.find(query).sort({ createdAt: -1 }).lean()
    res.json(list)
  } catch (e) {
    next(e)
  }
})

vehicleRouter.get('/recommendations', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    const recommendations = []

    if (user.preferences?.makes?.length || user.preferences?.priceRange) {
      const query = { status: 'available', stockQuantity: { $gt: 0 } }

      if (user.preferences.makes?.length) {
        query.make = { $in: user.preferences.makes }
      }

      if (user.preferences.priceRange) {
        if (user.preferences.priceRange.min) {
          query.currentPrice = { ...query.currentPrice, $gte: user.preferences.priceRange.min }
        }
        if (user.preferences.priceRange.max) {
          query.currentPrice = { ...query.currentPrice, $lte: user.preferences.priceRange.max }
        }
      }

      const prefMatches = await Vehicle.find(query).limit(10).lean()
      recommendations.push(...prefMatches)
    }

    const recentlyViewed = user.browsingHistory?.slice(0, 5).map((h) => h.vehicleId) || []
    if (recentlyViewed.length) {
      const viewed = await Vehicle.find({ _id: { $in: recentlyViewed } }).lean()
      const makes = [...new Set(viewed.map((v) => v.make))]

      const similar = await Vehicle.find({
        make: { $in: makes },
        status: 'available',
        stockQuantity: { $gt: 0 },
        _id: { $nin: recentlyViewed },
      })
        .limit(10)
        .lean()

      recommendations.push(...similar)
    }

    if (recommendations.length === 0) {
      const popular = await Vehicle.find({
        status: 'available',
        stockQuantity: { $gt: 0 },
      })
        .sort({ viewCount: -1, bookingCount: -1 })
        .limit(10)
        .lean()

      recommendations.push(...popular)
    }

    const unique = Array.from(new Map(recommendations.map((v) => [v._id.toString(), v])).values())
    res.json(unique.slice(0, 10))
  } catch (e) {
    next(e)
  }
})

vehicleRouter.get('/:id', async (req, res, next) => {
  try {
    const v = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true },
    ).lean()

    if (!v) {
      const err = new Error('Vehicle not found')
      err.status = 404
      throw err
    }

    const authHeader = req.headers.authorization
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '')
        const jwt = await import('jsonwebtoken')
        const JWT_SECRET = process.env.JWT_SECRET || 'default-dev-secret-change-in-production'
        const decoded = jwt.default.verify(token, JWT_SECRET)

        await User.findByIdAndUpdate(
          decoded.userId,
          {
            $push: {
              browsingHistory: {
                $each: [{ vehicleId: v._id, viewedAt: new Date() }],
                $slice: -50,
              },
            },
          },
        )
      } catch (err) {
        // Ignore auth errors for view tracking
      }
    }

    res.json(v)
  } catch (e) {
    next(e)
  }
})

vehicleRouter.post('/', authenticate, authorize('dealer'), async (req, res, next) => {
  try {
    const vehicleData = {
      ...req.body,
      dealerCode: req.user.dealerCode,
    }

    if (vehicleData.price) {
      vehicleData.basePrice = vehicleData.price
      delete vehicleData.price
    }

    const doc = await Vehicle.create(vehicleData)
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

vehicleRouter.patch('/:id', authenticate, authorize('dealer'), async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)

    if (!vehicle) {
      const err = new Error('Vehicle not found')
      err.status = 404
      throw err
    }

    if (vehicle.dealerCode !== req.user.dealerCode) {
      const err = new Error('You can only update your own vehicles')
      err.status = 403
      throw err
    }

    if (req.body.basePrice) {
      Object.assign(vehicle, req.body)
      vehicle.calculateDynamicPrice()
      await vehicle.save()
      return res.json(vehicle)
    }

    const doc = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean()

    res.json(doc)
  } catch (e) {
    next(e)
  }
})

vehicleRouter.delete('/:id', authenticate, authorize('dealer'), async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)

    if (!vehicle) {
      return res.status(204).send()
    }

    if (vehicle.dealerCode !== req.user.dealerCode) {
      const err = new Error('You can only delete your own vehicles')
      err.status = 403
      throw err
    }

    await Vehicle.findByIdAndDelete(req.params.id)
    res.status(204).send()
  } catch (e) {
    next(e)
  }
})
