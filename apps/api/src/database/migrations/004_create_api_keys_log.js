exports.up = function (knex) {
  return knex.schema.createTable('api_keys_log', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.string('api_key', 64).notNullable();
    table.string('action', 50).notNullable();
    table.specificType('ip_address', 'INET').nullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  }).then(() => {
    return knex.schema.raw(`
      CREATE INDEX idx_api_keys_log_project_id ON api_keys_log(project_id);
      CREATE INDEX idx_api_keys_log_created_at ON api_keys_log(created_at);
    `);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('api_keys_log');
};
