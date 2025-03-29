import { test, beforeAll, afterAll, describe, expect, beforeEach } from "vitest";
import request from 'supertest'
import { app } from "../src/app";
import { execSync } from "node:child_process";

describe("Transactions routes", () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    beforeEach(() => {
        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest')
    })

    test("Usuário deve criar uma transação", async () => {
        await request(app.server)
            .post("/transactions")
            .send({
                title: 'New Transaction',
                amount: 5000,
                type: 'credit'
            }).expect(201)

    })

    test("Deve listar todas as transações", async () => {
        const createTransactionResponse = await request(app.server)
            .post("/transactions")
            .send({
                title: 'New Transaction',
                amount: 5000,
                type: 'credit'
            })

        const cookies = createTransactionResponse.get('Set-Cookie')

        const listTransactionResponse = await request(app.server)
            .get('/transactions')
            .set('Cookie', cookies || [])
            .expect(200)

        expect(listTransactionResponse.body.transactions).toEqual([
            expect.objectContaining({
                title: "New Transaction",
                amount: 5000
            })
        ])
        console.log(listTransactionResponse.body)
    })


    test("Buscar por uma transação especifíca", async () => {
        const createTransactionResponse = await request(app.server)
            .post("/transactions")
            .send({
                title: 'New Transaction',
                amount: 5000,
                type: 'credit'
            })

        const cookies = createTransactionResponse.get('Set-Cookie')

        const listTransactionResponse = await request(app.server)
            .get('/transactions')
            .set('Cookie', cookies || [])
            .expect(200)

        const transactionId = listTransactionResponse.body.transactions[0].id

        const getTransactionResponse = await request(app.server)
            .get(`/transactions/${transactionId}`)
            .set('Cookie', cookies || [])
            .expect(200)

        expect(getTransactionResponse.body.transaction).toEqual(
            expect.objectContaining({
                title: "New Transaction",
                amount: 5000
            })
        )
    })

    test("Deve listar a soma de todas as transações", async () => {
        const createTransactionResponse = await request(app.server)
            .post("/transactions")
            .send({
                title: 'New Transaction',
                amount: 5000,
                type: 'credit'
            })

        const cookies = createTransactionResponse.get('Set-Cookie')

        await request(app.server)
            .post("/transactions")
            .set("Cookie", cookies || [])
            .send({
                title: 'Debit Transaction',
                amount: 2000,
                type: 'debit'
            })

        const summaryResponse = await request(app.server)
            .get('/transactions/summary')
            .set('Cookie', cookies || [])
            .expect(200)

        expect(summaryResponse.body.summary).toEqual(
            {amount: 3000}
        )
        
    })

})
