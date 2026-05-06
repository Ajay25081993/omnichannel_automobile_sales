import { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function BookingsPage() {
  const [vehicles, setVehicles] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    vehicleId: '',
    customerName: '',
    email: '',
    phone: '',
    depositAmount: '',
    notes: '',
  })

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [v, b] = await Promise.all([
        api.get('/api/vehicles'),
        api.get('/api/bookings'),
      ])
      setVehicles(v.filter((x) => x.status === 'available'))
      setBookings(b)
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
      await api.post('/api/bookings', {
        ...form,
        depositAmount: form.depositAmount === '' ? 0 : Number(form.depositAmount),
      })
      setForm({
        vehicleId: '',
        customerName: '',
        email: '',
        phone: '',
        depositAmount: '',
        notes: '',
      })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Online vehicle booking
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Creates a reservation and marks the vehicle reserved on the server.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Vehicle</span>
            <select
              required
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={form.vehicleId}
              onChange={(e) =>
                setForm((f) => ({ ...f, vehicleId: e.target.value }))
              }
            >
              <option value="">Select available unit</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.year} {v.make} {v.model} — {v.vin}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Deposit (USD)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={form.depositAmount}
              onChange={(e) =>
                setForm((f) => ({ ...f, depositAmount: e.target.value }))
              }
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Customer name</span>
            <input
              required
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={form.customerName}
              onChange={(e) =>
                setForm((f) => ({ ...f, customerName: e.target.value }))
              }
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Email</span>
            <input
              required
              type="email"
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-slate-700">Phone</span>
            <input
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-slate-700">Notes</span>
            <textarea
              rows={2}
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </label>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Create booking
        </button>
      </form>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <h3 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800">
          Recent bookings
        </h3>
        <ul className="divide-y divide-slate-100">
          {loading ? (
            <li className="px-4 py-6 text-center text-slate-500">Loading…</li>
          ) : bookings.length === 0 ? (
            <li className="px-4 py-6 text-center text-slate-500">
              No bookings yet.
            </li>
          ) : (
            bookings.map((b) => (
              <li key={b._id} className="px-4 py-4 text-sm">
                <p className="font-medium text-slate-900">{b.customerName}</p>
                <p className="text-slate-600">{b.email}</p>
                <p className="mt-1 capitalize text-slate-500">
                  Status: {b.status.replace('_', ' ')}
                  {typeof b.depositAmount === 'number' &&
                    ` · Deposit ${b.depositAmount.toLocaleString(undefined, {
                      style: 'currency',
                      currency: 'USD',
                    })}`}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
