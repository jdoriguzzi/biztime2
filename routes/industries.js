const express = require("express")
const db = require("../db")
const ExpressError = require("../expressError")

const router = new express.Router()

router.get("/", async function (req, res, next) {
    try {
      const result = await db.query(
        `SELECT code, industry 
         FROM industries 
         ORDER BY industry`
      );
  
      return res.json({"industries": result.rows})
    }
  
    catch (e) {
      return next(e)
    }
  })


  router.post("/", async function (req, res, next) {
    try {
        const {code, industry} = req.body
  
        const result = await db.query(
            `INSERT INTO industries (code, industry) 
            VALUES ($1, $2) 
            RETURNING code, industry`,
            [code, industry])
  
      return res.status(201).json({"industry": result.rows[0]})
    }
  
    catch (e) {
        return next(e)
    }
  })

 
  router.put("/:code", async function (req, res, next) {
    try {
      let {comp_code} = req.body
      let ind_code = req.params.code
  
      const result = await db.query(
        `INSERT INTO company_industry (comp_code, ind_code)
         VALUES ($1, $2)
         RETURNING comp_code, ind_code`,
         [comp_code, ind_code])
  
      if (result.rows.length === 0) {
          throw new ExpressError(`Relation not found: ${code}`, 404)
      } else {
          return res.json({"relation": result.rows[0]})
      }
    }
  
    catch (e) {
      return next(e)
    }
  
  })


  module.exports = router;