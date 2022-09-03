require('dotenv').config()
const _groupBy = require('lodash.groupby')

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
  return knex
    .select(
      'comments.id as parent_id',
      'child.id as child_id',
      'comments.name as parent_name',
      'child.name as child_name',
      'comments.content as parent_content',
      'child.content as child_content',
      'comments.upvotes as parent_upvotes',
      'child.upvotes as child_upvotes',
      'comments.created_at as parent_created_at',
      'child.created_at as child_created_at'
    )
    .from('comments')
    .leftJoin('comments as child', function () {
      this.on('child.comment_id', '=', 'comments.id')
    })
    .whereNull('comments.comment_id')
    .then(result => {
      const refined = result.map(row => {
        const child = {}
        const data = {}
        const keys = Object.keys(row).map(el => el.split('_'))

        for (let key of keys) {
          if (key[0] == 'child') {
            if (row[key.join('_')] == null) {
              continue
            }
            if (key.length == 3) {
              child[`${key[1]}_${key[2]}`] = row[key.join('_')]
            } else {
              child[key[1]] = row[key.join('_')]
            }
          } else if (key[0] == 'parent') {
            if (key.length == 3) {
              data[`${key[1]}_${key[2]}`] = row[key.join('_')]
            } else {
              data[key[1]] = row[key.join('_')]
            }
          }
        }

        return {
          ...data,
          child: Object.keys(child).length == 0 ? null : child,
        }
      })

      const final = []

      const grouped = _groupBy(refined, 'id')
      for (let key of Object.keys(grouped)) {
        const children = []
        for (let element of grouped[key]) {
          if (element.child != null) {
            children.push(element.child)
          }
        }

        const parent = grouped[key][0]
        final.push({
          id: parent.id,
          name: parent.name,
          content: parent.content,
          upvotes: parent.upvotes,
          created_at: parent.created_at,
          children,
        })
      }
      return final
    })
}

function createComment({ name, content, parentId }) {
  return knex('comments').insert({
    name,
    content,
    upvotes: 0,
    comment_id: parentId,
  })
}

function upvoteComment(id) {
  return knex('comments').where({ id }).increment('upvotes', 1)
}

module.exports = {
  retrieveComments,
  createComment,
  upvoteComment,
}
