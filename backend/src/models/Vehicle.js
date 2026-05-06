import mongoose from 'mongoose'

const vehicleSchema = new mongoose.Schema(
  {
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 1980, max: 2035 },
    vin: { type: String, required: true, unique: true, uppercase: true, trim: true },
    basePrice: { type: Number, required: true, min: 0 },
    currentPrice: { type: Number, min: 0 },
    mileage: { type: Number, min: 0 },
    color: { type: String, trim: true },
    bodyType: { type: String, trim: true },
    fuelType: { type: String, trim: true },
    transmission: { type: String, trim: true },
    features: [String],
    images: [String],
    description: { type: String, trim: true },
    stockQuantity: { type: Number, default: 1, min: 0 },
    status: {
      type: String,
      enum: ['available', 'reserved', 'sold'],
      default: 'available',
    },
    dealerCode: { type: String, trim: true },
    dealerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    viewCount: { type: Number, default: 0 },
    bookingCount: { type: Number, default: 0 },
    lastPriceUpdate: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

vehicleSchema.methods.calculateDynamicPrice = function () {
  const demandFactor = this.viewCount * 0.001 + this.bookingCount * 0.01
  const inventoryFactor = this.stockQuantity > 5 ? -0.05 : this.stockQuantity < 2 ? 0.1 : 0
  const priceFactor = 1 + demandFactor + inventoryFactor
  this.currentPrice = Math.round(this.basePrice * priceFactor)
  this.lastPriceUpdate = new Date()
  return this.currentPrice
}

vehicleSchema.pre('save', function (next) {
  if (!this.currentPrice) {
    this.currentPrice = this.basePrice
  }
  next()
})

export const Vehicle = mongoose.model('Vehicle', vehicleSchema)
