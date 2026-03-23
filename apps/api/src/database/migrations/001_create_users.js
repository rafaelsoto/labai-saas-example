exports.up = function (knex) {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('avatar_url', 500).nullable();
    table.string('plan', 50).notNullable().defaultTo('free');
    table.timestamps(true, true);
  }).then(() => {
    return knex.schema.raw('CREATE INDEX idx_users_email ON users(email)');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users');
};
