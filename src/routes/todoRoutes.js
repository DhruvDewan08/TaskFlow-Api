import express from 'express'

import db from '../db.js'

//
const router = express.Router()
//get all the todos for the logged in user 
router.get('/', (req, res) => {
    const getTodos = db.prepare(`SELECT * FROM todos WHERE user_id = ?`) // * - select all columns 
    const todos = getTodos.all(req.userId) // all() - get all the todos for the logged in user 
    res.json(todos)

})
//create a new todo
router.post('/', (req, res) => {
    const { task } = req.body
    const insertTodo = db.prepare('INSERT INTO todos (user_id , task) VALUES (?,?)')
    const result = insertTodo.run(req.userId, task)
    res.json({ id: result.lastInsertRowid, task, completed: 0 })

})

//update a todo - we need id from the table so that we can match the ids and make updates to it ,
//  we can get those by using json or dyanic parameters that we have used here 
router.put('/:id', (req, res) => {
    const { completed } = req.body
    const { id } = req.params  // destructure the id from the parameters of the query of the request 
    const { page } = req.query // destructure the page from the query of the request 

    const updatedTodo = db.prepare(`UPDATE todos SET completed = ? WHERE id = ?`)
    updatedTodo.run(completed, id) // id we got from the paramaters that is the part of the url 
    res.json({ message: 'Todo updated successfully' })
})

//delete a todo
router.delete('/:id', (req, res) => {
    const { id } = req.params // dynamic paramter
    const userId = req.userId
    const deleteTODO = db.prepare('DELETE FROM todos WHERE id = ? AND user_id = ?')
    deleteTODO.run(id, req.userId)
    res.send({ message: "Todo deleted" })
})

export default router