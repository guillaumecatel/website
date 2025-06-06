import compression from 'compression'
import express from 'express'
import helmet from 'helmet'

import { handler } from './dist/server/entry.mjs'

const PORT = 8000
const BASE = '/'

const app = express()

app.use(compression())

app.use(BASE, express.static('dist/client/'))

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'script-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'blob:'],
      },
    },
    crossOriginOpenerPolicy: 'same-origin',
    crossOriginEmbedderPolicy: 'require-corp',
    originAgentCluster: true,
  }),
)

app.use(handler)

app.listen(PORT, () => {
  console.log(`✅ Production server running at ${PORT}`)
})
