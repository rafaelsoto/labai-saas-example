const defaultSettings = JSON.stringify({
  widget_color: '#6366f1',
  widget_position: 'bottom-right',
  widget_language: 'pt-BR',
  prompt_text: 'Como foi sua experiência?',
  thank_you_text: 'Obrigado pelo seu feedback!',
});

exports.up = function (knex) {
  return knex.schema.createTable('projects', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.string('url', 500).nullable();
    table.string('api_key', 64).notNullable().unique();
    table.boolean('is_active').defaultTo(true);
    table.jsonb('settings').defaultTo(defaultSettings);
    table.timestamps(true, true);
  }).then(() => {
    return knex.schema.raw(`
      CREATE INDEX idx_projects_user_id ON projects(user_id);
      CREATE INDEX idx_projects_api_key ON projects(api_key);
    `);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('projects');
};
