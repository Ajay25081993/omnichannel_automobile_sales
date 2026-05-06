import mongoose from 'mongoose'

const testDriveSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true, lowercase: true },
    customerPhone: { type: String, trim: true },
    scheduledAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['requested', 'confirmed', 'completed', 'cancelled', 'no_show'],
      default: 'requested',
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
)

export const TestDrive = mongoose.model('TestDrive', testDriveSchema)
