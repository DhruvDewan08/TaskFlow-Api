import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db.js'

//
const router = express.Router()
//post request to the register end point  /auth/register
router.post('/register', (req, res) => {
    const { username, password } = req.body

    //encrypt the password
    const hashedPassword = bcrypt.hashSync(password, 8)
    //save the new user and hashed password to the db 
    try {
        const insertUser = db.prepare(`INSERT INTO users (username , password) VALUES (? , ?)`)
        const result = insertUser.run(username, hashedPassword)

        //now that we have a user , we will add their first todo 
        const defaultTodo = `hello :) add your first todo!`
        const insertTodo = db.prepare(`INSERT INTO todos (user_id , task ) VALUES (? , ?)`)
        insertTodo.run(result.lastInsertRowid, defaultTodo)

        //create a token to confirm that they are infact the correct user , the special id is stored in the env file
        const token = jwt.sign({ id: result.lastInsertRowid }, process.env.JWT_SECRET, { expiresIn: '24h' })
        res.json({ token })
    } catch (err) {
        console.log(err.message)
        res.sendStatus(503) //server broken

    }
})

router.post('/login', (req, res) => {
    //we get their email and we look up the password related to that email 
    //but we get bakca  encrypted password that means we cant compare the user 
    //so what we can do is again in one way encrypt the password that the user has given 
    //and then compare the encrypted password with the encrypted password that we have in our database 
    //if they match then we can login the user 
    const { username, password } = req.body
    try {
        const getUser = db.prepare(`SELECT * FROM users WHERE username = ?`) //means every single column from the user database
        const user = getUser.get(username)
        if (!user) {
            return res.status(404).json({ message: 'User not found' }) //unauthorized
        }
        const passwordIsValid = bcrypt.compareSync(password, user.password)
        if (!passwordIsValid) {
            return res.status(401).json({ message: 'Invalid password' }) //unauthorized
        }
        console.log(user)
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' })
        res.json({ token })

    } catch (err) {
        console.log(err.message)
        res.sendStatus(503) //server broken
    }

})


export default router