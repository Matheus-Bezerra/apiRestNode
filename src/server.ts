import fastify from 'fastify'
import { knex } from './database'
import { randomUUID } from 'node:crypto'
import { env } from './env'

const app = fastify()

app.get('/hello', async () => {
  const transactions = await knex("transactions").select("*")
  
  return transactions
})

app.listen({
    port: env.port,
  })
  .then(() => {
    console.log('Http Server Running!')
  })
