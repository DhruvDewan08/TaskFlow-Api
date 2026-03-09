import express from 'express'
import prisma from '../prisma.js'

//
const router = express.Router()
//get all the todos for the logged in user 
router.get('/', async (req, res) => {
    const todos = await prisma.todo.findMany({
        where: {
            userId: req.userId
        }
    })
    res.json(todos)

})
//create a new todo
router.post('/', async (req, res) => {
    const { task } = req.body
    const todo = await prisma.todo.create({
        data: {
            task,
            userId: req.userId
        }
    })
    res.json(todo)

})

//update a todo - we need id from the table so that we can match the ids and make updates to it ,
//  we can get those by using json or dyanic parameters that we have used here 
router.put('/:id', async (req, res) => {
    const { completed } = req.body
    const { id } = req.params  // destructure the id from the parameters of the query of the request 
    const updatedTodo = await prisma.todo.update({
        where: {
            id: parseInt(id),
            userId: req.userId
        },
        data: {
            completed: !!completed
        }
    })
    res.json(updatedTodo)
})

//delete a todo
router.delete('/:id', async (req, res) => {
    const { id } = req.params // dynamic paramter
    const userId = req.userId
    await prisma.todo.delete({
        where: {
            id: parseInt(id),
            userId
        }
    })
    res.send({ message: "Todo deleted" })
})

export default router