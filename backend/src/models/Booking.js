import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    customerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    depositAmount: { type: Number, default: 0, min: 0 },
    bookingPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    notes: { type: String, trim: true },
    confirmationNumber: { type: String, unique: true, sparse: true },
  },
  { timestamps: true },
)

bookingSchema.pre('save', function (next) {
  if (!this.confirmationNumber && this.status === 'confirmed') {
    this.confirmationNumber = `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`
  }
  next()
})

export const Booking = mongoose.model('Booking', bookingSchema)
