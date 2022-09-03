const express = require('express')
const http = require('http')
const cors = require('cors')
const bodyParser = require('body-parser')

const { Server } = require('socket.io')

const { retrieveComments, createComment, upvoteComment } = require('./models')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
  },
})

app.use(cors('*'))
app.use(bodyParser.json())

app.get('/health-check', (req, res) => {
  res.sendStatus(200)
})

app.get('/comments', async (req, res) => {
  try {
    const comments = await retrieveComments()
    res.json({ comments })
  } catch (err) {
    res.status(500).json({ message: 'Error fetching comments', error: err })
  }
})

app.post('/comments', async (req, res) => {
  const { name, content, parentId } = req.body

  try {
    await createComment({ name, content, parentId })
    res.status(201).json({ name, content })
  } catch (err) {
    res.status(500).json({ message: 'Error creating comment', error: err })
  }
})

app.put('/comments/:id/upvote', async (req, res) => {
  const { id } = req.params
  try {
    await upvoteComment(id)
    res.status(204).json({ upvoted: true })
  } catch (err) {
    res.status(500).json({ error: err, message: 'Error upvoting comment' })
  }
})

io.on('connection', socket => {
  socket.on('upvote', id => {
    socket.broadcast.emit('upvote', id)
  })
})

server.listen(4444, function () {
  console.log('Listening on PORT 4444')
})
