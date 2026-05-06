import { useEffect, useState } from 'react'
import { api } from '../api/client'

const statuses = [
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'funded',
]

export default function LoansPage() {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    applicantName: '',
    applicantEmail: '',
    requestedAmount: '',
    termMonths: '60',
    vehicleId: '',
  })

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/api/loans')
      setLoans(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      await api.post('/api/loans', {
        ...form,
        requestedAmount: Number(form.requestedAmount),
        termMonths: Number(form.termMonths),
        vehicleId: form.vehicleId || undefined,
      })
      setForm({
        applicantName: '',
        applicantEmail: '',
        requestedAmount: '',
        termMonths: '60',
        vehicleId: '',
      })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function advanceStatus(id, next) {
    setError(null)
    try {
      await api.patch(`/api/loans/${id}/status`, { status: next })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Loan approval workflow
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Applications move through states; patch status to simulate underwriting.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2"
      >
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-slate-700">Applicant name</span>
          <input
            required
            className="rounded-lg border border-slate-300 px-3 py-2"
            value={form.applicantName}
            onChange={(e) =>
              setForm((f) => ({ ...f, applicantName: e.target.value }))
            }
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Email</span>
          <input
            required
            type="email"
            className="rounded-lg border border-slate-300 px-3 py-2"
            value={form.applicantEmail}
            onChange={(e) =>
              setForm((f) => ({ ...f, applicantEmail: e.target.value }))
            }
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Vehicle ID (optional)</span>
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs"
            placeholder="MongoDB ObjectId"
            value={form.vehicleId}
            onChange={(e) =>
              setForm((f) => ({ ...f, vehicleId: e.target.value }))
            }
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Requested amount</span>
          <input
            required
            type="number"
            min="0"
            step="100"
            className="rounded-lg border border-slate-300 px-3 py-2"
            value={form.requestedAmount}
            onChange={(e) =>
              setForm((f) => ({ ...f, requestedAmount: e.target.value }))
            }
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Term (months)</span>
          <input
            required
            type="number"
            min="12"
            max="84"
            className="rounded-lg border border-slate-300 px-3 py-2"
            value={form.termMonths}
            onChange={(e) =>
              setForm((f) => ({ ...f, termMonths: e.target.value }))
            }
          />
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Submit application
          </button>
        </div>
      </form>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-800">Pipeline</h3>
        {loading ? (
          <p className="text-slate-500">Loading…</p>
        ) : loans.length === 0 ? (
          <p className="text-slate-500">No applications.</p>
        ) : (
          loans.map((l) => (
            <div
              key={l._id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-slate-900">{l.applicantName}</p>
                <p className="text-sm text-slate-600">
                  {l.requestedAmount.toLocaleString(undefined, {
                    style: 'currency',
                    currency: 'USD',
                  })}{' '}
                  / {l.termMonths} mo ·{' '}
                  <span className="capitalize">
                    {l.status.replace('_', ' ')}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {statuses.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={l.status === s}
                    onClick={() => advanceStatus(l._id, s)}
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium capitalize disabled:opacity-40 hover:bg-slate-50"
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
