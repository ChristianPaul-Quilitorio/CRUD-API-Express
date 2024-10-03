const express = require('express')
const app = express()
const port = 4000

const mysql = require('mysql2')

app.use(express.json())


// connecting to database
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "crud2",
}).promise()




app.get('/api/users', async(req, res) => {
    try {
        const data = await pool.execute("SELECT * from users")
        res.status(200).json(data[0])
    }
    catch (err) {
        //return interval server error (500)
        res.status(500).json({ message: err })
    }
})

app.get('/api/users/:id', async(req, res) => {
    const id = req.params.id
    try {
        const data = await pool.execute("SELECT * from users WHERE id=?", [id])
        const rows = data [0]


        if (rows.length === 0){
            // return not found (404)
            res.status(404).json()
        }
            else{
                res.status(200).json(rows[0])
            }
    }
    catch(err) {
        //return interval server error (500)
        res.status(500).json({ message: err })
    }
})

function isValidUsers(users){
    let hasErrors = false
    const errors = {}

    if (!users.Firstname) {
        errors.Firstname = "The Firstname is required"
        hasErrors = true
    }

    if (!users.Lastname) {
        errors.Lastname = "The Lastname is required"
        hasErrors = true
    }
    if (!users.is_admin || isNaN(users.is_admin)) {
        errors.is_admin = "The is_admin is required"
        hasErrors = true
    }
    
        return {hasErrors, errors}

       
}


app.post('/api/users', async(req, res) => {
    const users = req.body
    
    try {
        const result = isValidUsers(users)

        if (result.hasErrors) {
            //return bad request (400) with validation errors
            res.status(400).json(result.errors)
            return
        }

        // insert new user in the database
       
        let sql = 'INSERT INTO users (Firstname, Lastname, is_admin) VALUES(?,?,?)'
        let values = [users.Firstname, users.Lastname, users.is_admin]
        let data = await pool.execute(sql, values)

        const id = data[0].insertId

        data = await pool.execute("SELECT * from users WHERE id=?", [id])

        res.status(200).json(data[0][0])
    } 
        catch (err) {
        res.status(500).json({ message: err})
    }
})



app.put('/api/users/:id', async(req, res) =>{
    const users = req.body
    const id = req.params.id
   

    try {
        const result = isValidUsers(users)

        if (result.hasErrors) {
            //return bad request (400) with validation errors
            res.status(400).json(result.errors)
            return
        }

        //update the users
        let sql = 'UPDATE users SET Firstname=?, Lastname=?, is_admin=? WHERE id=?'
        let values = [users.Firstname, users.Lastname, users.is_admin, id]

        let data = await pool.execute(sql, values)


        if (data[0].affectedRows === 0) {
            //return not founf (404)
            res.status(404).json()
            return
        }

        data = await pool.execute("SELECT * FROM users WHERE id=?", [id])

        res.status(200).json(data[0][0])
    } 
    catch (err) {
        res.status(500).json({ message: err })
    }
})

app.delete('/api/users/:id', async(req, res) => {
    const id = req.params.id
    

    try {
            const data = await pool.execute("DELETE FROM users WHERE id=?", [id])

            if (data[0].affectedRows === 0){
                //return not found(404)
                res.status(404).json()
                return
            }
                res.status(200).json()

    } 
    catch (err) {
     res.status(500).json({ message: err })    
    }
})

app.listen(port, () => {
    console.log("Server listening on port " + port)
})