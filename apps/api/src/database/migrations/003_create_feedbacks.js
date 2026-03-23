exports.up = function (knex) {
  return knex.schema.createTable('feedbacks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    table.specificType('rating', 'SMALLINT').notNullable();
    table.text('message').nullable();
    table.string('page_url', 1000).nullable();
    table.string('user_agent', 500).nullable();
    table.specificType('ip_address', 'INET').nullable();
    table.jsonb('metadata').defaultTo('{}');
    table.boolean('is_read').defaultTo(false);
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  }).then(() => {
    return knex.schema.raw(`
      ALTER TABLE feedbacks ADD CONSTRAINT feedbacks_rating_check CHECK (rating >= 1 AND rating <= 5);
      CREATE INDEX idx_feedbacks_project_id ON feedbacks(project_id);
      CREATE INDEX idx_feedbacks_created_at ON feedbacks(created_at);
      CREATE INDEX idx_feedbacks_rating ON feedbacks(rating);
      CREATE INDEX idx_feedbacks_project_created ON feedbacks(project_id, created_at DESC);
    `);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('feedbacks');
};
