const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const { retrieveComments, createComment } = require('./models')

const app = express()

app.use(cors('*'))
app.use(bodyParser.json())

app.get('/health-check', (req, res) => {
  res.sendStatus(200)
})

app.get('/comments', async (req, res) => {
  try {
    const comments = await retrieveComments()
    res.send({ comments })
  } catch (err) {
    res.status(500).json({ message: 'Error fetching comments', error: err })
  }
})

app.post('/comments', async (req, res) => {
  const { name, content } = req.body

  try {
    const newComment = await createComment({ name, content })
    res.status(201).send({ name, content })
  } catch (err) {
    res.status(500).json({ message: 'Error creating comment', error: err })
  }
})

app.listen(4444, function () {
  console.log('Listening on PORT 4444')
})
