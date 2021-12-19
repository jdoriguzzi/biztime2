// test invoices routes

process.env.NODE_ENV == "test"

const request = require("supertest")
const app = require("../app")
const db = require("../db")

// set up test db 
beforeAll(async function createData() {
    await db.query("DELETE FROM invoices")
    await db.query("DELETE FROM companies")
    await db.query("SELECT setval('invoices_id_seq', 1, false)")

    await db.query(`INSERT INTO companies (code, name, description)
                    VALUES ('apple', 'Apple', 'Maker of OSX.'),
                           ('ibm', 'IBM', 'Big blue.')`)

    await db.query(`INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
                    VALUES ('apple', 100, false, '2022-12-18', null),
                           ('apple', 200, false, '2022-12-18', null), 
                           ('apple', 300, false, '2022-12-18', null),
                           ('ibm',   400, false, '2022-12-18', null)`)
})

// close the db after testing 
afterAll(async () => {
    await db.end()
})

describe("GET /", function () {

    test("It should respond with array of invoices", async function () {
        const response = await request(app).get("/invoices");
        expect(response.body).toEqual({
            "invoices": [
                {id: 1, comp_code: "apple"},
                {id: 2, comp_code: "apple"},
                {id: 3, comp_code: "apple"},
                {id: 4, comp_code: "ibm"},
      ]
    })
  })

})


describe("GET /1", function () {

  test("It return invoice info", async function () {
    const response = await request(app).get("/invoices/1")
    expect(response.body).toEqual(
        {
          "invoice": {
              id: 1,
              amt: 100,
              add_date: '2022-12-18T05:00:00.000Z',
              paid: false,
              paid_date: null,
              company: {
                  code: 'apple',
                  name: 'Apple',
                  description: 'Maker of OSX.',
            }
          }
        }
    )
  })

  test("It should return 404 for invoice not found", async function () {
    const response = await request(app).get("/invoices/22");
    expect(response.status).toEqual(404);
  })
})


describe("POST /", function () {

  test("It should add invoice", async function () {
    const response = await request(app)
        .post("/invoices")
        .send({amt: 500, comp_code: 'ibm'});

    expect(response.body).toEqual(
        {
          "invoice": {
              id: 5,
              comp_code: "ibm",
              amt: 500,
              add_date: expect.any(String),
              paid: false,
              paid_date: null,
          }
        }
    )
  })
})


describe("PUT /", function () {

  test("It should update an invoice", async function () {
    const response = await request(app)
        .put("/invoices/4")
        .send({amt: 888, paid: false})

    expect(response.body).toEqual(
        {
          "invoice": {
              id: 4,
              comp_code: 'ibm',
              paid: false,
              amt: 888,
              add_date: expect.any(String),
              paid_date: null,
          }
        }
    )
  })

  test("It should return 404 for invoice not found", async function () {
    const response = await request(app)
        .put("/invoices/17")
        .send({amt: 888})

    expect(response.status).toEqual(404)
  })

})


describe("DELETE /", function () {

  test("It should delete invoice", async function () {
    const response = await request(app)
        .delete("/invoices/5")

    expect(response.body).toEqual({"status": "deleted"})
  })

  test("It should return 404 for invoice not found", async function () {
    const response = await request(app)
        .delete("/invoices/17")

    expect(response.status).toEqual(404)
  })
})

