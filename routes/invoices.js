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


router.get("/:id", async function (req, res, next) {
    try {
        let id = req.params.id

        const result = await db.query(
            `SELECT id, amt, paid, add_date, paid_date
             FROM invoices
             WHERE id = $1`,
            [id]
        )
            
        if (result.rows.length === 0) {
            throw new ExpressError(`Invoice not found: ${id}`, 404)
        }

        const comp_codeResult = await db.query(
            `SELECT comp_code
             FROM invoices
             WHERE id = $1`,
            [id]
        )

        let comp_code = comp_codeResult.rows[0].comp_code
              
        const companyResult = await db.query(
            `SELECT code, name, description
             FROM companies
             WHERE code = $1`,
            [comp_code]
        )
        console.log(companyResult.rows[0])   
        const invoice = result.rows[0]
        const company = companyResult.rows[0]
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


router.put("/:id", async function (req, res, next) {
    try {
        let {amt, paid} = req.body
        let id = req.params.id
        let paidDate = null

        const currResult = await db.query(
            `SELECT paid
             FROM invoices
             WHERE id = $1`,
            [id])

        if (currResult.rows.length === 0) {
            throw new ExpressError(`No such invoice: ${id}`, 404)
        }

        const currPaidDate = currResult.rows[0].paid_date

        if (!currPaidDate && paid) {
            paidDate = new Date()
        } else if (!paid) {
            paidDate = null
        } else {
            paidDate = currPaidDate
        }

        const result = await db.query(
            `UPDATE invoices
             SET amt=$1, paid=$2, paid_date=$3
             WHERE id=$4
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [amt, paid, paidDate, id])

        return res.json({"invoice": result.rows[0]})
    }

    catch (e) {
        return next(e)
    }

})


router.delete("/:id", async function (req, res, next) {
    try {
        let id = req.params.id
  
        const result = await db.query(
            `DELETE FROM invoices
             WHERE id=$1
             RETURNING id`,
             [id])
  
        if (result.rows.length == 0) {
            throw new ExpressError(`Invoice not found: ${id}`, 404)
        } else {
            return res.json({"status": "deleted"})
        }
    }
  
    catch (e) {
        return next(e)
    }
  })
  




module.exports = router;