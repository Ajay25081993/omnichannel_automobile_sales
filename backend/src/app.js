import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { vehicleRouter } from './routes/vehicleRoutes.js'
import { bookingRouter } from './routes/bookingRoutes.js'
import { loanRouter } from './routes/loanRoutes.js'
import { testDriveRouter } from './routes/testDriveRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()
  app.use(cors())
  app.use(express.json())
  app.use(morgan('dev'))

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'omnichannel-auto-api' })
  })

  app.use('/api/vehicles', vehicleRouter)
  app.use('/api/bookings', bookingRouter)
  app.use('/api/loans', loanRouter)
  app.use('/api/test-drives', testDriveRouter)

  app.use(errorHandler)
  return app
}
