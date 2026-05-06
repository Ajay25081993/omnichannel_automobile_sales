import mongoose from 'mongoose'

const testDriveSchema = new mongoose.Schema(
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
    customerEmail: { type: String, required: true, trim: true, lowercase: true },
    customerPhone: { type: String, trim: true },
    scheduledAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['requested', 'approved', 'rejected', 'confirmed', 'completed', 'cancelled', 'no_show'],
      default: 'requested',
    },
    dealerNotes: { type: String, trim: true },
    customerNotes: { type: String, trim: true },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: { type: Date },
  },
  { timestamps: true },
)

testDriveSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('scheduledAt')) {
    const startTime = new Date(this.scheduledAt)
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000)

    const conflict = await this.constructor.findOne({
      _id: { $ne: this._id },
      vehicleId: this.vehicleId,
      scheduledAt: {
        $gte: new Date(startTime.getTime() - 60 * 60 * 1000),
        $lt: endTime,
      },
      status: { $in: ['requested', 'approved', 'confirmed'] },
    })

    if (conflict) {
      const err = new Error('Time slot conflict for this vehicle')
      err.status = 400
      throw err
    }
  }
  next()
})

export const TestDrive = mongoose.model('TestDrive', testDriveSchema)
