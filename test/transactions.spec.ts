import { test, beforeAll, afterAll, describe, expect } from "vitest";
import request from 'supertest'
import { app } from "../src/app";

describe("Transactions routes", () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
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
})
