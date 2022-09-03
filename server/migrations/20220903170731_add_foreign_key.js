/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('comments', function (table) {
    table.integer('comment_id').unsigned()
    table.foreign('comment_id').references('comments.id')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('comments', function (table) {
    table.dropForeign('comment_id')
    table.dropColumn('comment_id')
  })
}
