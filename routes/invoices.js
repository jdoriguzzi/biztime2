const express = require("express")
const db = require("../db")
const ExpressError = require("../expressError")

const router = new express.Router()

router.get("/", async function (req, res, next) {
    try {
        const result = await db.query(
            `SELECT id, comp_code
            FROM invoices`
        )
  
        return res.json({"invoices": result.rows})
    }
  
    catch (e) {
        return next(e)
    }
  })


router.get("/:code", async function (req, res, next) {
    try {
        let code = req.params.code

        const result = await db.query(
            `SELECT id, amt, paid, add_date, paid_date
             FROM invoices
             WHERE id = $1`,
            [code]
        )

        if (result.rows.length === 0) {
            throw new ExpressError(`Invoice not found: ${code}`, 404)
        }

        const comp_codeResult = await db.query(
            `SELECT comp_code
             FROM invoices
             WHERE id = $1`,
            [code]
        )

        let comp_code = comp_codeResult.rows[0].comp_code
                    
        const companyResult = await db.query(
            `SELECT code, name, description
             FROM companies
             WHERE code = $1`,
            [comp_code]
        )

        const invoice = result.rows[0]
        const company = companyResult.rows
        invoice.company = company
  
        return res.json({"invoice": invoice})
    }
  
    catch (e) {
        return next(e)
    }
  })

router.post("/", async function (req, res, next) {
    try {
        let {comp_code, amt} = req.body;
  
        const result = await db.query(
            `INSERT INTO invoices (comp_code, amt) 
             VALUES ($1, $2) 
             RETURNING *`,
            [comp_code, amt]
        )
  
        return res.json({"invoice": result.rows[0]})
    }
  
    catch (e) {
        return next(e);
    }
})


router.put("/:code", async function (req, res, next) {
    try {
        let code = req.params.code  
        let amt = req.body.amt
        
  
        const result = await db.query(
            `UPDATE invoices
             SET amt = ($1) 
             WHERE id = ($2) 
             RETURNING *`,
            [amt, code]
        )
        
        if (result.rows.length === 0) {
            throw new ExpressError(`Invoice not found: ${code}`, 404)
          }

        return res.json({"invoice": result.rows[0]})
    }
  
    catch (e) {
        return next(e)
    }
})




module.exports = router;