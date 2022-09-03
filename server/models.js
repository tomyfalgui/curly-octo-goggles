require('dotenv').config()

const knex = require('knex')({
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  },
})

function retrieveComments() {
  return knex('comments').select('*')
}

function createComment({ name, content }) {
  return knex('comments').insert({ name, content, upvotes: 0 })
}

function upvoteComment(id) {
  return knex('comments').where({ id }).increment('upvotes', 1)
}

module.exports = {
  retrieveComments,
  createComment,
  upvoteComment,
}
