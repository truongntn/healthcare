import { getDb } from '../src/database/connection.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');
    const db = await getDb();

    // Clear existing data (for development)
    await db('decision_logs').del();
    await db('message_reads').del();
    await db('attachments').del();
    await db('message_reactions').del();
    await db('message_edits').del();
    await db('messages').del();
    await db('chat_channels').del();
    await db('notifications').del();
    await db('meeting_recurrences').del();
    await db('transcripts').del();
    await db('meetings').del();
    await db('alerts').del();
    await db('observations').del();
    await db('availability').del();
    await db('patients').del();
    await db('users').del();

    // Create users
    const clinicianId = uuidv4();
    const patientId = uuidv4();
    const adminId = uuidv4();

    const hashedPassword = await bcrypt.hash('password123', 12);

    await db('users').insert([
      {
        id: clinicianId,
        email: 'doc1@example.com',
        password_hash: hashedPassword,
        first_name: 'Dr. Sarah',
        last_name: 'Johnson',
        role: 'clinician',
        profile: JSON.stringify({ specialty: 'Internal Medicine', license: 'MD12345' })
      },
      {
        id: patientId,
        email: 'pat1@example.com',
        password_hash: hashedPassword,
        first_name: 'Jane',
        last_name: 'Doe',
        role: 'patient',
        profile: JSON.stringify({})
      },
      {
        id: adminId,
        email: 'admin@example.com',
        password_hash: hashedPassword,
        first_name: 'System',
        last_name: 'Admin',
        role: 'admin',
        profile: JSON.stringify({})
      }
    ]);

    // Create patient record
    const patientRecordId = uuidv4();
    await db('patients').insert({
      id: patientRecordId,
      user_id: patientId,
      mrn: 'MRN-001-DEMO',
      date_of_birth: '1985-06-15',
      gender: 'female',
      phone: '555-0123',
      address: '123 Main St, Demo City, DC 12345',
      medical_history: JSON.stringify({
        conditions: ['Hypertension', 'Type 2 Diabetes'],
        allergies: ['Penicillin'],
        medications: ['Metformin 500mg', 'Lisinopril 10mg']
      }),
      emergency_contacts: JSON.stringify([
        { name: 'John Doe', relation: 'Spouse', phone: '555-0124' }
      ]),
      consent_transcripts: true
    });

    // Create observations that will trigger alerts
    const obsId1 = uuidv4();
    const obsId2 = uuidv4();
    
    await db('observations').insert([
      {
        id: obsId1,
        patient_id: patientRecordId,
        type: 'heart_rate',
        value: 110,
        unit: 'bpm',
        device_id: 'DEVICE-001',
        observed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        id: obsId2,
        patient_id: patientRecordId,
        type: 'oxygen_saturation',
        value: 92,
        unit: '%',
        device_id: 'DEVICE-002',
        observed_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
      }
    ]);

    // Create alerts for the observations
    await db('alerts').insert([
      {
        id: uuidv4(),
        patient_id: patientRecordId,
        observation_id: obsId1,
        type: 'high',
        message: 'High heart_rate: 110 (threshold: 100)',
        status: 'active'
      },
      {
        id: uuidv4(),
        patient_id: patientRecordId,
        observation_id: obsId2,
        type: 'low',
        message: 'Low oxygen_saturation: 92 (threshold: 95)',
        status: 'active'
      }
    ]);

    // Create meetings
    const pastMeetingId = uuidv4();
    const futureMeetingId = uuidv4();

    await db('meetings').insert([
      {
        id: pastMeetingId,
        organizer_id: clinicianId,
        patient_id: patientRecordId,
        participants: JSON.stringify([]),
        start_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        duration: 30,
        type: 'televisit',
        status: 'completed',
        join_link: `https://meet.intellihealth.example.com/${pastMeetingId}`
      },
      {
        id: futureMeetingId,
        organizer_id: clinicianId,
        patient_id: patientRecordId,
        participants: JSON.stringify([]),
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        duration: 45,
        type: 'followup',
        status: 'scheduled',
        join_link: `https://meet.intellihealth.example.com/${futureMeetingId}`
      }
    ]);

    // Add recurrence rule for future meeting
    await db('meeting_recurrences').insert({
      id: uuidv4(),
      meeting_id: futureMeetingId,
      rule: JSON.stringify({ freq: 'WEEKLY', interval: 1, until: '2025-06-01T00:00:00Z' })
    });

    // Create transcript for past meeting
    const transcriptId = uuidv4();
    await db('transcripts').insert({
      id: transcriptId,
      meeting_id: pastMeetingId,
      content: `Dr. Johnson: Good morning, Jane. How are you feeling today?
Jane Doe: Hi Dr. Johnson. I've been feeling a bit tired lately, and my blood pressure readings have been higher than usual.
Dr. Johnson: I see. Let's review your recent readings. Your home monitor shows values around 150/95, which is concerning.
Jane Doe: Yes, I've been taking my medications as prescribed, but I've been under a lot of stress at work.
Dr. Johnson: Stress can definitely impact blood pressure. Let's discuss some stress management techniques and possibly adjust your medication.
Jane Doe: That sounds good. I'd also like to know about diet changes that might help.
Dr. Johnson: Excellent question. Reducing sodium intake and increasing potassium-rich foods can be very beneficial.`,
      speakers: JSON.stringify([
        { name: 'Dr. Johnson', segments: [{ start: 0, end: 15, text: 'Good morning, Jane. How are you feeling today?' }] },
        { name: 'Jane Doe', segments: [{ start: 16, end: 45, text: "Hi Dr. Johnson. I've been feeling a bit tired lately..." }] }
      ]),
      consent_given: true
    });

    // Create chat channels
    const oneToOneChannelId = uuidv4();
    const groupChannelId = uuidv4();

    await db('chat_channels').insert([
      {
        id: oneToOneChannelId,
        type: 'one-to-one',
        participants: JSON.stringify([clinicianId, patientId]),
        meta: JSON.stringify({ purpose: 'Patient-Clinician Communication' })
      },
      {
        id: groupChannelId,
        type: 'group',
        participants: JSON.stringify([clinicianId, adminId]),
        meta: JSON.stringify({ purpose: 'Clinical Team Discussion' })
      }
    ]);

    // Create messages
    const msg1Id = uuidv4();
    const msg2Id = uuidv4();
    const msg3Id = uuidv4();
    const msg4Id = uuidv4();
    const msg5Id = uuidv4();

    await db('messages').insert([
      {
        id: msg1Id,
        channel_id: oneToOneChannelId,
        author_id: patientId,
        text: 'Hi Dr. Johnson, I have a question about my medication timing.',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: msg2Id,
        channel_id: oneToOneChannelId,
        author_id: clinicianId,
        text: 'Hi Jane! I\'d be happy to help. What specifically would you like to know?',
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        id: msg3Id,
        channel_id: oneToOneChannelId,
        author_id: patientId,
        text: 'Should I take my blood pressure medication with food or on an empty stomach?',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: msg4Id,
        channel_id: groupChannelId,
        author_id: clinicianId,
        text: 'Team, we have a patient with consistently elevated BP readings. Need to review treatment protocol.',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: msg5Id,
        channel_id: groupChannelId,
        author_id: adminId,
        text: 'I can pull the latest treatment guidelines for review. When would you like to discuss?',
        edited: true,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ]);

    // Add message reactions
    await db('message_reactions').insert([
      {
        id: uuidv4(),
        message_id: msg2Id,
        user_id: patientId,
        reaction: '👍'
      },
      {
        id: uuidv4(),
        message_id: msg4Id,
        user_id: adminId,
        reaction: '📋'
      }
    ]);

    // Add message edit record
    await db('message_edits').insert({
      id: uuidv4(),
      message_id: msg5Id,
      editor_id: adminId,
      previous_text: 'I can pull the latest treatment guidelines. When would you like to discuss?',
      edited_at: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString()
    });

    // Create availability windows for clinician
    await db('availability').insert({
      id: uuidv4(),
      user_id: clinicianId,
      windows: JSON.stringify([
        { day_of_week: 1, start_time: '09:00', end_time: '17:00' }, // Monday
        { day_of_week: 2, start_time: '09:00', end_time: '17:00' }, // Tuesday
        { day_of_week: 3, start_time: '09:00', end_time: '17:00' }, // Wednesday
        { day_of_week: 4, start_time: '09:00', end_time: '17:00' }, // Thursday
        { day_of_week: 5, start_time: '09:00', end_time: '15:00' }  // Friday
      ])
    });

    // Create sample notifications
    await db('notifications').insert([
      {
        id: uuidv4(),
        user_id: clinicianId,
        type: 'alert',
        payload: JSON.stringify({
          alertId: uuidv4(),
          patientId: patientRecordId,
          message: 'High heart rate detected: 110 bpm'
        }),
        read: false
      },
      {
        id: uuidv4(),
        user_id: patientId,
        type: 'meeting_reminder',
        payload: JSON.stringify({
          meetingId: futureMeetingId,
          remindAt: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(), // 1 hour before
          scheduledFor: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString()
        }),
        read: false
      }
    ]);

    console.log('✅ Database seeded successfully');
    console.log('');
    console.log('Demo accounts created:');
    console.log('👨‍⚕️ Clinician: doc1@example.com / password123');
    console.log('👤 Patient: pat1@example.com / password123');  
    console.log('🔧 Admin: admin@example.com / password123');
    console.log('');
    console.log('Sample data includes:');
    console.log('- Patient record with medical history');
    console.log('- RPM observations with alerts');
    console.log('- Past and future meetings');
    console.log('- Meeting transcript with consent');
    console.log('- Chat channels with messages and reactions');
    console.log('- Availability windows');
    console.log('- Sample notifications');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();