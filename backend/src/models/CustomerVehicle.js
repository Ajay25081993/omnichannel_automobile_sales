import mongoose from 'mongoose'

const customerVehicleSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 1980, max: 2035 },
    vin: { type: String, required: true, unique: true, uppercase: true, trim: true },
    licensePlate: { type: String, trim: true },
    mileage: { type: Number, min: 0 },
    color: { type: String, trim: true },
    bodyType: { type: String, trim: true },
    fuelType: { type: String, trim: true },
    transmission: { type: String, trim: true },
    condition: { type: String, enum: ['excellent', 'good', 'fair', 'poor'], default: 'good' },
    features: [String],
    images: [String],
    description: { type: String, trim: true },
    registrationDate: { type: Date },
    insuranceExpiry: { type: Date },
    lastServiceDate: { type: Date },
    status: {
      type: String,
      enum: ['active', 'inactive', 'for_trade_in', 'sold'],
      default: 'active',
    },
    estimatedValue: { type: Number, min: 0 },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true },
)

customerVehicleSchema.index({ ownerId: 1, status: 1 })
customerVehicleSchema.index({ vin: 1 })

export const CustomerVehicle = mongoose.model('CustomerVehicle', customerVehicleSchema)
