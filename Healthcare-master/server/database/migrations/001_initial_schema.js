export function up(knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.text('id').primary();
      table.text('email').unique().notNullable();
      table.text('password_hash').notNullable();
      table.text('first_name').notNullable();
      table.text('last_name').notNullable();
      table.text('role').notNullable(); // patient, clinician, admin
      table.json('profile').defaultTo('{}');
      table.boolean('active').defaultTo(true);
      table.datetime('created_at').defaultTo(knex.fn.now());
      table.datetime('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('patients', (table) => {
      table.text('id').primary();
      table.text('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.text('mrn').unique().notNullable();
      table.date('date_of_birth');
      table.text('gender');
      table.text('phone');
      table.text('address');
      table.json('medical_history').defaultTo('{}');
      table.json('emergency_contacts').defaultTo('[]');
      table.boolean('consent_transcripts').defaultTo(false);
      table.datetime('created_at').defaultTo(knex.fn.now());
      table.datetime('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('observations', (table) => {
      table.text('id').primary();
      table.text('patient_id').references('id').inTable('patients').onDelete('CASCADE');
      table.text('type').notNullable(); // heart_rate, blood_pressure, etc.
      table.real('value').notNullable();
      table.text('unit');
      table.text('device_id');
      table.datetime('observed_at').notNullable();
      table.datetime('created_at').defaultTo(knex.fn.now());
    })
    .createTable('alerts', (table) => {
      table.text('id').primary();
      table.text('patient_id').references('id').inTable('patients').onDelete('CASCADE');
      table.text('observation_id').references('id').inTable('observations').onDelete('CASCADE');
      table.text('type').notNullable(); // high, low, critical
      table.text('message').notNullable();
      table.text('status').defaultTo('active'); // active, acknowledged, resolved
      table.text('acknowledged_by').references('id').inTable('users');
      table.datetime('acknowledged_at');
      table.datetime('created_at').defaultTo(knex.fn.now());
    })
    .createTable('meetings', (table) => {
      table.text('id').primary();
      table.text('organizer_id').references('id').inTable('users').notNullable();
      table.text('patient_id').references('id').inTable('patients').onDelete('CASCADE');
      table.json('participants').defaultTo('[]'); // array of user IDs
      table.datetime('start_time').notNullable();
      table.integer('duration').defaultTo(30); // minutes
      table.text('type').defaultTo('televisit'); // televisit, followup, consult
      table.text('status').defaultTo('scheduled'); // scheduled, in_progress, completed, cancelled
      table.text('join_link');
      table.text('recording_url');
      table.text('cancelled_by').references('id').inTable('users');
      table.text('cancel_reason');
      table.datetime('cancelled_at');
      table.datetime('created_at').defaultTo(knex.fn.now());
      table.datetime('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('transcripts', (table) => {
      table.text('id').primary();
      table.text('meeting_id').references('id').inTable('meetings').onDelete('CASCADE');
      table.text('content').notNullable();
      table.json('speakers').defaultTo('[]'); // array of {name, segments: [{start, end, text}]}
      table.boolean('consent_given').defaultTo(false);
      table.datetime('created_at').defaultTo(knex.fn.now());
    })
    .createTable('chat_channels', (table) => {
      table.text('id').primary();
      table.text('type').notNullable(); // one-to-one, group
      table.json('participants').defaultTo('[]'); // array of user IDs
      table.json('meta').defaultTo('{}');
      table.datetime('created_at').defaultTo(knex.fn.now());
      table.datetime('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('messages', (table) => {
      table.text('id').primary();
      table.text('channel_id').references('id').inTable('chat_channels').onDelete('CASCADE');
      table.text('author_id').references('id').inTable('users').onDelete('CASCADE');
      table.text('text').notNullable();
      table.text('reply_to_message_id').references('id').inTable('messages');
      table.boolean('edited').defaultTo(false);
      table.boolean('redacted').defaultTo(false);
      table.datetime('created_at').defaultTo(knex.fn.now());
      table.datetime('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('decision_logs', (table) => {
      table.text('id').primary();
      table.text('ai_id').notNullable(); // unique identifier for AI suggestion
      table.text('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.text('decision').notNullable(); // confirm, reject
      table.text('note');
      table.json('ai_payload').defaultTo('{}');
      table.datetime('created_at').defaultTo(knex.fn.now());
    });
}

export function down(knex) {
  return knex.schema
    .dropTableIfExists('decision_logs')
    .dropTableIfExists('messages')
    .dropTableIfExists('chat_channels')
    .dropTableIfExists('transcripts')
    .dropTableIfExists('meetings')
    .dropTableIfExists('alerts')
    .dropTableIfExists('observations')
    .dropTableIfExists('patients')
    .dropTableIfExists('users');
}