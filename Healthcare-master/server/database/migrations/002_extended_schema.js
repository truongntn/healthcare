export function up(knex) {
  return knex.schema
    .createTable('notifications', (table) => {
      table.text('id').primary();
      table.text('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.text('type').notNullable(); // meeting_reminder, alert, message_mention
      table.json('payload').defaultTo('{}');
      table.boolean('read').defaultTo(false);
      table.datetime('created_at').defaultTo(knex.fn.now());
    })
    .createTable('message_reactions', (table) => {
      table.text('id').primary();
      table.text('message_id').references('id').inTable('messages').onDelete('CASCADE');
      table.text('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.text('reaction').notNullable();
      table.datetime('created_at').defaultTo(knex.fn.now());
      table.unique(['message_id', 'user_id', 'reaction']);
    })
    .createTable('message_edits', (table) => {
      table.text('id').primary();
      table.text('message_id').references('id').inTable('messages').onDelete('CASCADE');
      table.text('editor_id').references('id').inTable('users').onDelete('CASCADE');
      table.text('previous_text').notNullable();
      table.datetime('edited_at').defaultTo(knex.fn.now());
    })
    .createTable('meeting_recurrences', (table) => {
      table.text('id').primary();
      table.text('meeting_id').references('id').inTable('meetings').onDelete('CASCADE');
      table.text('rule').notNullable(); // JSON string for recurrence rule
      table.datetime('created_at').defaultTo(knex.fn.now());
    })
    .createTable('availability', (table) => {
      table.text('id').primary();
      table.text('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.json('windows').defaultTo('[]'); // [{day_of_week, start_time, end_time}]
      table.datetime('created_at').defaultTo(knex.fn.now());
      table.datetime('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('attachments', (table) => {
      table.text('id').primary();
      table.text('message_id').references('id').inTable('messages').onDelete('CASCADE');
      table.text('meeting_id').references('id').inTable('meetings').onDelete('CASCADE');
      table.text('filename').notNullable();
      table.text('mime_type');
      table.text('storage_url').notNullable();
      table.integer('file_size');
      table.datetime('created_at').defaultTo(knex.fn.now());
    })
    .createTable('message_reads', (table) => {
      table.text('id').primary();
      table.text('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.text('channel_id').references('id').inTable('chat_channels').onDelete('CASCADE');
      table.text('last_read_message_id').references('id').inTable('messages');
      table.datetime('read_at').defaultTo(knex.fn.now());
      table.unique(['user_id', 'channel_id']);
    });
}

export function down(knex) {
  return knex.schema
    .dropTableIfExists('message_reads')
    .dropTableIfExists('attachments')
    .dropTableIfExists('availability')
    .dropTableIfExists('meeting_recurrences')
    .dropTableIfExists('message_edits')
    .dropTableIfExists('message_reactions')
    .dropTableIfExists('notifications');
}