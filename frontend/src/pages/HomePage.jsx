import { Link } from 'react-router-dom'

const cards = [
  {
    title: 'Dealer inventory',
    desc: 'SKUs, pricing, availability, and stock status for your lot and partner channels.',
    to: '/inventory',
  },
  {
    title: 'Online vehicle booking',
    desc: 'Reserve units with customer details and deposit workflow hooks.',
    to: '/bookings',
  },
  {
    title: 'Loan approval workflows',
    desc: 'Pipeline states from application through underwriting-style decisions.',
    to: '/loans',
  },
  {
    title: 'Test-drive scheduling',
    desc: 'Slot requests tied to vehicles and customer contact.',
    to: '/test-drives',
  },
]

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-100 p-8 shadow-sm md:p-10">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          One surface for omnichannel automobile sales
        </h2>
        <p className="mt-3 max-w-2xl text-slate-600">
          This starter wires a React + Tailwind UI to a Node/Express API with
          MongoDB models for inventory, reservations, financing, and test drives.
          Extend each area with your auth, payments, and DMS integrations.
        </p>
      </section>
      <ul className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <li key={c.to}>
            <Link
              to={c.to}
              className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-600/40 hover:shadow-md"
            >
              <span className="font-semibold text-slate-900">{c.title}</span>
              <span className="mt-2 flex-1 text-sm text-slate-600">{c.desc}</span>
              <span className="mt-4 text-sm font-medium text-brand-600">
                Open module →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
