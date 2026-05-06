import mongoose from 'mongoose'

const loanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    applicantName: { type: String, required: true, trim: true },
    applicantEmail: { type: String, required: true, trim: true, lowercase: true },
    requestedAmount: { type: Number, required: true, min: 0 },
    termMonths: { type: Number, required: true, min: 12, max: 96 },
    annualIncome: { type: Number, min: 0 },
    creditScore: { type: Number, min: 300, max: 850 },
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
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: { type: Date },
    approvedAmount: { type: Number, min: 0 },
    interestRate: { type: Number, min: 0 },
  },
  { timestamps: true },
)

export const LoanApplication = mongoose.model('LoanApplication', loanSchema)
