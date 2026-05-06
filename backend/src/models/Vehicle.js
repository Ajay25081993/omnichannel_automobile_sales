import mongoose from 'mongoose'

const vehicleSchema = new mongoose.Schema(
  {
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 1980, max: 2035 },
    vin: { type: String, required: true, unique: true, uppercase: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    mileage: { type: Number, min: 0 },
    color: { type: String, trim: true },
    status: {
      type: String,
      enum: ['available', 'reserved', 'sold'],
      default: 'available',
    },
    dealerCode: { type: String, trim: true },
  },
  { timestamps: true },
)

export const Vehicle = mongoose.model('Vehicle', vehicleSchema)
