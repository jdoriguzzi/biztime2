const express = require("express")
const db = require("../db")
const ExpressError = require("../expressError")

const router = new express.Router()

router.get("/", async function (req, res, next) {
    try {
      const result = await db.query(
        `SELECT code, name 
         FROM companies 
         ORDER BY name`
      );
  
      return res.json({"companies": result.rows})
    }
  
    catch (e) {
      return next(e)
    }
  })

  router.get("/:code", async function (req, res, next) {
    try {
      let code = req.params.code

      let result = await db.query(
        `SELECT code, name, description 
         FROM companies
         WHERE code = $1`, 
         [code]
      )

      if (result.rows.length === 0) {
        throw new ExpressError(`Company not found: ${code}`, 404)
      }

      let invoicesResult = await db.query(
        `SELECT *
         FROM invoices
         WHERE comp_code = $1`,
         [code]
      )
  
      let company = result.rows[0]
      let invoices = invoicesResult.rows
      company.invoices = invoices.map(inv => inv)

      return res.json({"company": company})
    }
  
    catch (e) {
      return next(e)
    }
  })


  router.post("/", async function (req, res, next) {
    try {
        const {code, name, description} = req.body
  
        const result = await db.query(
            `INSERT INTO companies (code, name, description) 
            VALUES ($1, $2, $3) 
            RETURNING code, name, description`,
            [code, name, description])
  
      return res.status(201).json({"company": result.rows})
    }
  
    catch (e) {
        return next(e)
    }
  })


  router.put("/:code", async function (req, res, next) {
    try {
      let {name, description} = req.body
      let code = req.params.code
  
      const result = await db.query(
        `UPDATE companies
         SET name=$1, description=$2
         WHERE code = $3
         RETURNING code, name, description`,
         [name, description, code])
  
      if (result.rows.length === 0) {
          throw new ExpressError(`Company not found: ${code}`, 404)
      } else {
          return res.json({"company": result.rows})
      }
    }
  
    catch (e) {
      return next(e)
    }
  
  })

  router.delete("/:code", async function (req, res, next) {
    try {
      let code = req.params.code
  
      const result = await db.query(
        `DELETE FROM companies
         WHERE code=$1
         RETURNING code`,
         [code]
      )
  
      if (result.rows.length === 0) {
          throw new ExpressError(`Company not found: ${code}`, 404)
      } else {
          return res.json({"status": "deleted"})
      }
    }
  
    catch (e) {
        return next(e)
    }
  
  })







module.exports = router;