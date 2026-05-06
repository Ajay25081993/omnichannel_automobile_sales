import { useEffect, useState } from 'react'
import { api } from '../api/client'

function toLocalInputValue(d) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function TestDrivesPage() {
  const [vehicles, setVehicles] = useState([])
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    vehicleId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    scheduledAt: toLocalInputValue(new Date(Date.now() + 86400000)),
    notes: '',
  })

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [v, t] = await Promise.all([
        api.get('/api/vehicles'),
        api.get('/api/test-drives'),
      ])
      setVehicles(v)
      setSlots(t)
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
      await api.post('/api/test-drives', {
        ...form,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
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
          Test-drive scheduling
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Book a slot against a vehicle; staff can extend with calendar sync later.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-slate-700">Vehicle</span>
            <select
              required
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={form.vehicleId}
              onChange={(e) =>
                setForm((f) => ({ ...f, vehicleId: e.target.value }))
              }
            >
              <option value="">Select vehicle</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.year} {v.make} {v.model}
                </option>
              ))}
            </select>
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
              value={form.customerEmail}
              onChange={(e) =>
                setForm((f) => ({ ...f, customerEmail: e.target.value }))
              }
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Phone</span>
            <input
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={form.customerPhone}
              onChange={(e) =>
                setForm((f) => ({ ...f, customerPhone: e.target.value }))
              }
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Scheduled time</span>
            <input
              required
              type="datetime-local"
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={form.scheduledAt}
              onChange={(e) =>
                setForm((f) => ({ ...f, scheduledAt: e.target.value }))
              }
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
          Schedule test drive
        </button>
      </form>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <h3 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800">
          Upcoming
        </h3>
        <ul className="divide-y divide-slate-100">
          {loading ? (
            <li className="px-4 py-6 text-center text-slate-500">Loading…</li>
          ) : slots.length === 0 ? (
            <li className="px-4 py-6 text-center text-slate-500">
              No appointments.
            </li>
          ) : (
            slots.map((t) => (
              <li key={t._id} className="px-4 py-4 text-sm">
                <p className="font-medium text-slate-900">{t.customerName}</p>
                <p className="text-slate-600">
                  {new Date(t.scheduledAt).toLocaleString()} ·{' '}
                  <span className="capitalize">{t.status}</span>
                </p>
                {t.vehicleId?.make && (
                  <p className="mt-1 text-slate-500">
                    {t.vehicleId.year} {t.vehicleId.make} {t.vehicleId.model}
                  </p>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
