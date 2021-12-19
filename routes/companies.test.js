// Test companies routes
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

  test("It should return all companies in the db", async function () {
       const response = await request(app).get("/companies")
       expect(response.body).toEqual({
          "companies": [
            {code: "apple", name: "Apple"},
            {code: "ibm", name: "IBM"},
          ]
        })
  })

})


describe("GET /apple", function () {
  
  test("It return company info", async function () {
    const response = await request(app).get("/companies/apple");
    expect(response.body).toEqual(
        {
          "company": {
            code: "apple",
            name: "Apple",
            description: "Maker of OSX.",
            invoices: [1, 2, 3],
          }
        }
    )
  }) 

  test("It should return 404 for company not found", async function () {
    const response = await request(app).get("/companies/pepsi")
    expect(response.status).toEqual(404)
  })
})


describe("POST /", function () {

  test("It should add company", async function () {
    const response = await request(app)
        .post("/companies")
        .send({name: "Coke", description: "Maker of delicious beverages"});
    expect(response.body).toEqual(
        {
            "company": {
                code: "coke",
                name: "Coke",
                description: "Maker of delicious beverages",
            }
        }
    )
  })

  test("It should return 500 for conflict", async function () {
    const response = await request(app)
        .post("/companies")
        .send({name: "Apple", description: "Maker of OSX"})
    expect(response.status).toEqual(500)
  })
})


describe("PUT /", function () {

  test("It should update company", async function () {
    const response = await request(app)
        .put("/companies/apple")
        .send({name: "AppleEdit", description: "NewDescrip"})
    expect(response.body).toEqual(
        {
          "company": {
            code: "apple",
            name: "AppleEdit",
            description: "NewDescrip",
          }
        }
    )
  })

  test("It should return 404 for company not found", async function () {
    const response = await request(app)
        .put("/companies/pepsi")
        .send({name: "Pepsi"})
    expect(response.status).toEqual(404)
  })

})


describe("DELETE /", function () {

  test("It should delete company", async function () {
      const response = await request(app)
          .delete("/companies/coke")
      expect(response.body).toEqual({"status": "deleted"})
  })

  test("It should return 404 for company not found", async function () {
      const response = await request(app)
          .delete("/companies/coke")
      expect(response.status).toEqual(404)
  })
})

