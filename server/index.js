const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const { retrieveComments, createComment, upvoteComment } = require('./models')

const app = express()

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
  const { name, content } = req.body
  console.log(req.body)
  console.log(content)

  try {
    await createComment({ name, content })
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

app.listen(4444, function () {
  console.log('Listening on PORT 4444')
})
