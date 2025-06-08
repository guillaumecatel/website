import compression from 'compression'
import express from 'express'
import helmet from 'helmet'
import permissionsPolicy from 'permissions-policy'

import { handler } from './dist/server/entry.mjs'

const PORT = 8000
const BASE = '/'

const app = express()

app.disable('x-powered-by')

app.use(compression())

app.use(
  BASE,
  express.static('dist/client/', {
    maxAge: '1y',
    immutable: true,
  }),
)

app.use((_, res, next) => {
  const originalSetHeader = res.setHeader.bind(res)

  res.setHeader = (name, value) => {
    if (name.toLowerCase() === 'content-type' && typeof value === 'string') {
      if (!value.toLowerCase().includes('charset=')) {
        value += '; charset=utf-8'
      }
    }

    return originalSetHeader(name, value)
  }

  next()
})

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'script-src': [
          "'self'",
          'analytics.guillaumecatel.com',
          "'unsafe-inline'",
        ],
        'img-src': ["'self'", 'data:', 'blob:'],
      },
    },
    crossOriginOpenerPolicy: 'same-origin',
    crossOriginEmbedderPolicy: 'require-corp',
    originAgentCluster: true,
  }),
)

app.use(
  permissionsPolicy({
    features: {
      fullscreen: ['self'], // fullscreen=()
    },
  }),
)

app.use(handler)

app.listen(PORT, () => {
  console.log(`✅ Production server running at ${PORT}`)
})
