import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

// ⚠️  PROTOTYPE ONLY - Configure with actual OpenAI API key for production
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-test-key-placeholder'
});

const CLINICAL_TEMPERATURE = 0.3; // Low temperature for clinical accuracy

class AIService {
  async triageSymptoms(symptoms, patientHistory = {}) {
    const aiId = uuidv4();
    
    try {
      const systemPrompt = `You are a medical triage AI assistant. Analyze symptoms and provide preliminary assessment.
CRITICAL: Always respond with valid JSON containing:
- disposition: "emergency" | "urgent" | "routine" | "self_care"
- explanation: detailed reasoning for non-medical professionals
- confidence: number between 0 and 1
- provenance: array of strings describing sources/reasoning steps

Use temperature ≤ 0.3 for clinical accuracy. This is a prototype - remind users to seek real medical advice.`;

      const userPrompt = `Patient presents with: ${symptoms}
Patient history: ${JSON.stringify(patientHistory, null, 2)}

Provide triage recommendation with required JSON format.`;

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: CLINICAL_TEMPERATURE,
        max_tokens: 1000
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('No response from AI service');
      }

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response);
      } catch (parseError) {
        // Fallback response if AI doesn't return valid JSON
        parsedResponse = {
          disposition: 'routine',
          explanation: 'Unable to parse AI response. Please consult with a healthcare provider.',
          confidence: 0.1,
          provenance: ['AI parsing error - manual review required']
        };
      }

      // Validate required fields
      this.validateAIResponse(parsedResponse);

      return {
        aiId,
        ...parsedResponse
      };

    } catch (error) {
      console.error('AI Triage Error:', error);
      
      // Fallback response for API errors
      return {
        aiId,
        disposition: 'routine',
        explanation: 'AI service temporarily unavailable. Please consult with a healthcare provider for proper medical evaluation.',
        confidence: 0.0,
        provenance: [`Service error: ${error.message}`]
      };
    }
  }

  async summarizeMeeting(transcriptText, meetingContext = {}) {
    const aiId = uuidv4();

    try {
      const systemPrompt = `You are a medical documentation AI. Create SOAP notes from meeting transcripts.
CRITICAL: Always respond with valid JSON containing:
- summary: brief meeting summary
- soap_note: {subjective, objective, assessment, plan}
- action_items: array of action items with due dates
- patient_summary: patient-friendly summary
- confidence: number between 0 and 1  
- provenance: array of strings describing analysis steps

Use temperature ≤ 0.3 for clinical accuracy. This is a prototype system.`;

      const userPrompt = `Meeting transcript:
${transcriptText}

Meeting context: ${JSON.stringify(meetingContext, null, 2)}

Generate comprehensive SOAP note with required JSON format.`;

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: CLINICAL_TEMPERATURE,
        max_tokens: 2000
      });

      const response = completion.choices[0]?.message?.content;
      let parsedResponse;

      try {
        parsedResponse = JSON.parse(response);
      } catch (parseError) {
        parsedResponse = {
          summary: 'Meeting summary generation failed',
          soap_note: {
            subjective: 'Unable to process transcript',
            objective: 'AI processing error',
            assessment: 'Manual review required',
            plan: 'Follow up with provider'
          },
          action_items: [],
          patient_summary: 'Please contact your provider for visit summary',
          confidence: 0.0,
          provenance: ['AI parsing error - manual review required']
        };
      }

      this.validateAIResponse(parsedResponse);

      return {
        aiId,
        ...parsedResponse
      };

    } catch (error) {
      console.error('AI Meeting Summary Error:', error);
      
      return {
        aiId,
        summary: 'AI service error occurred',
        soap_note: {
          subjective: 'Service unavailable',
          objective: 'Unable to process',
          assessment: 'Manual documentation needed', 
          plan: 'Provider to complete notes manually'
        },
        action_items: [],
        patient_summary: 'Visit summary will be provided by your healthcare provider',
        confidence: 0.0,
        provenance: [`Service error: ${error.message}`]
      };
    }
  }

  async summarizeChat(messages, context = {}) {
    const aiId = uuidv4();

    try {
      const systemPrompt = `You are a healthcare communication AI. Summarize chat conversations.
CRITICAL: Always respond with valid JSON containing:
- summary: conversation summary
- action_items: array of identified action items
- confidence: number between 0 and 1
- provenance: array of strings describing analysis steps

Use temperature ≤ 0.3 for accuracy.`;

      const messagesText = messages.map(m => 
        `${m.author_name || m.author_id}: ${m.text}`
      ).join('\n');

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Summarize this conversation:\n${messagesText}` }
        ],
        temperature: CLINICAL_TEMPERATURE,
        max_tokens: 1000
      });

      const response = completion.choices[0]?.message?.content;
      let parsedResponse;

      try {
        parsedResponse = JSON.parse(response);
      } catch (parseError) {
        parsedResponse = {
          summary: 'Chat summary generation failed',
          action_items: [],
          confidence: 0.0,
          provenance: ['AI parsing error - manual review required']
        };
      }

      this.validateAIResponse(parsedResponse);

      return {
        aiId,
        ...parsedResponse
      };

    } catch (error) {
      console.error('AI Chat Summary Error:', error);
      
      return {
        aiId,
        summary: 'AI service error - manual summary needed',
        action_items: [],
        confidence: 0.0,
        provenance: [`Service error: ${error.message}`]
      };
    }
  }

  validateAIResponse(response) {
    const requiredFields = ['confidence', 'provenance'];
    
    for (const field of requiredFields) {
      if (!(field in response)) {
        throw new Error(`Missing required AI response field: ${field}`);
      }
    }

    if (typeof response.confidence !== 'number' || response.confidence < 0 || response.confidence > 1) {
      throw new Error('Confidence must be a number between 0 and 1');
    }

    if (!Array.isArray(response.provenance)) {
      throw new Error('Provenance must be an array of strings');
    }
  }
}

export const aiService = new AIService();