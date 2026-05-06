import { Router } from 'express'
import { Vehicle } from '../models/Vehicle.js'
import { authenticate } from '../middleware/auth.js'

export const recommendationRouter = Router()

recommendationRouter.get('/', authenticate, async (req, res, next) => {
  try {
    const user = req.user
    const query = { status: 'available', stockQuantity: { $gt: 0 } }
    if (user.preferences?.priceRange) {
      query.currentPrice = {
        $gte: user.preferences.priceRange.min || 0,
        $lte: user.preferences.priceRange.max || 1000000,
      }
    }
    if (user.preferences?.preferredMakes?.length > 0) {
      query.make = { $in: user.preferences.preferredMakes }
    }
    if (user.preferences?.preferredColors?.length > 0) {
      query.color = { $in: user.preferences.preferredColors }
    }
    let recommendations = await Vehicle.find(query).limit(20).lean()
    if (user.browsingHistory?.length > 0) {
      const viewedVehicleIds = user.browsingHistory.map((h) => h.vehicleId)
      const viewedVehicles = await Vehicle.find({ _id: { $in: viewedVehicleIds } }).lean()
      const viewedMakes = [...new Set(viewedVehicles.map((v) => v.make))]
      const viewedColors = [...new Set(viewedVehicles.map((v) => v.color).filter(Boolean))]
      recommendations = recommendations.map((vehicle) => {
        let score = 0
        if (viewedMakes.includes(vehicle.make)) score += 3
        if (viewedColors.includes(vehicle.color)) score += 2
        const age = new Date().getFullYear() - vehicle.year
        if (age <= 2) score += 2
        else if (age <= 5) score += 1
        if (vehicle.currentPrice < (user.preferences?.priceRange?.max || 100000) * 0.7) score += 1
        if (vehicle.viewCount > 50) score += 1
        if (vehicle.bookingCount > 5) score += 1
        return { ...vehicle, recommendationScore: score }
      })
      recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore)
    }
    res.json({
      recommendations: recommendations.slice(0, 10),
      message: recommendations.length > 0 ? 'Recommendations based on your preferences and browsing history' : 'No recommendations available.',
    })
  } catch (e) {
    next(e)
  }
})

recommendationRouter.post('/update-pricing', authenticate, async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ status: 'available' })
    let updatedCount = 0
    for (const vehicle of vehicles) {
      vehicle.calculateDynamicPrice()
      await vehicle.save()
      updatedCount++
    }
    res.json({ message: 'Dynamic pricing updated', updatedCount })
  } catch (e) {
    next(e)
  }
})
