import { useEffect, useState } from 'react'
import { api } from '../api/client'

const emptyForm = {
  make: '',
  model: '',
  year: new Date().getFullYear(),
  vin: '',
  price: '',
  mileage: '',
  color: '',
  status: 'available',
}

export default function InventoryPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(emptyForm)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/api/vehicles')
      setItems(data)
    } catch (e) {
      setError(e.message)
      setItems([])
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
      await api.post('/api/vehicles', {
        ...form,
        year: Number(form.year),
        price: Number(form.price),
        mileage: form.mileage === '' ? undefined : Number(form.mileage),
      })
      setForm(emptyForm)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Inventory</h2>
        <p className="mt-1 text-sm text-slate-600">
          CRUD via <code className="rounded bg-slate-200 px-1">GET/POST /api/vehicles</code>
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-3"
      >
        {[
          ['make', 'Make'],
          ['model', 'Model'],
          ['year', 'Year', 'number'],
          ['vin', 'VIN'],
          ['price', 'Price', 'number'],
          ['mileage', 'Mileage', 'number'],
          ['color', 'Color'],
        ].map(([name, label, type = 'text']) => (
          <label key={name} className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">{label}</span>
            <input
              required={name !== 'mileage' && name !== 'color'}
              type={type}
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={form[name]}
              onChange={(e) =>
                setForm((f) => ({ ...f, [name]: e.target.value }))
              }
            />
          </label>
        ))}
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Status</span>
          <select
            className="rounded-lg border border-slate-300 px-3 py-2"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </label>
        <div className="flex items-end sm:col-span-2 lg:col-span-3">
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Add vehicle
          </button>
        </div>
      </form>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {['Vehicle', 'VIN', 'Price', 'Miles', 'Status'].map((h) => (
                <th key={h} className="px-4 py-3 font-medium text-slate-700">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No vehicles. Add one above or start MongoDB.
                </td>
              </tr>
            ) : (
              items.map((v) => (
                <tr key={v._id} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    {v.year} {v.make} {v.model}
                    {v.color ? (
                      <span className="text-slate-500"> · {v.color}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{v.vin}</td>
                  <td className="px-4 py-3">
                    {typeof v.price === 'number'
                      ? v.price.toLocaleString(undefined, {
                          style: 'currency',
                          currency: 'USD',
                        })
                      : v.price}
                  </td>
                  <td className="px-4 py-3">
                    {v.mileage != null ? v.mileage.toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 capitalize">{v.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
