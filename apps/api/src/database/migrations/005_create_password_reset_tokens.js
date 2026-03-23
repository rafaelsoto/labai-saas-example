exports.up = function (knex) {
  return knex.schema.createTable('password_reset_tokens', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token', 255).notNullable().unique();
    table.timestamp('expires_at', { useTz: true }).notNullable();
    table.boolean('used').defaultTo(false);
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  }).then(() => {
    return knex.schema.raw('CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token)');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('password_reset_tokens');
};
