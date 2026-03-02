import express from 'express'
//these imports are usefull to send files in the get requests
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/authRoutes.js'
import todoRoutes from './routes/todoRoutes.js'
import authMiddleware from './middleware/authMiddleware.js'

const app = express()
// set 5000 as a backup , to provide a values from the env if it exists 
const PORT = process.env.PORT || 5003


//get the file path frm the url of the current module
const __filename = fileURLToPath(import.meta.url)
// get the directory nname from the file path 
const __dirname = dirname(__filename)

app.use(express.json())
//serves the html from the /public dir and also tell express to server allt ehhfiles from the public folder as static assests 
// any requeests for the css files will be resolved to the public directory.
//middleware
app.use(express.static(path.join(__dirname, '../public')))

// this endpoint is for serving the html file from the /public directory
// req and res are in a callback funstion , () is the call aback function which will then have request and repsonse 
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

//route - this combines all the auth routes and combine and take it to the end point /auth or /todos
app.use('/auth', authRoutes)
app.use('/todos', authMiddleware, todoRoutes)
app.listen(PORT, () => {
    console.log(`server has started on port :${PORT}`)
})

