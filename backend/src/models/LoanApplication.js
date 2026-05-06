import mongoose from 'mongoose'

const loanSchema = new mongoose.Schema(
  {
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    applicantName: { type: String, required: true, trim: true },
    applicantEmail: { type: String, required: true, trim: true, lowercase: true },
    requestedAmount: { type: Number, required: true, min: 0 },
    termMonths: { type: Number, required: true, min: 12, max: 96 },
    status: {
      type: String,
      enum: [
        'draft',
        'submitted',
        'under_review',
        'approved',
        'rejected',
        'funded',
      ],
      default: 'submitted',
    },
    decisionNotes: { type: String, trim: true },
  },
  { timestamps: true },
)

export const LoanApplication = mongoose.model('LoanApplication', loanSchema)
