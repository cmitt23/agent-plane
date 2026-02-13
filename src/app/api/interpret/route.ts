import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data, schema, context, confidence_threshold = 0.7 } = body

    if (!data || !schema) {
      return NextResponse.json(
        { error: 'data and schema are required' },
        { status: 400 }
      )
    }

    // Build the prompt for Claude to extract/normalize data
    const prompt = `You are a data normalization assistant. Extract and normalize data according to the provided schema.

INPUT DATA:
${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}

EXPECTED SCHEMA:
${JSON.stringify(schema, null, 2)}

${context ? `ADDITIONAL CONTEXT:\n${context}\n` : ''}

Extract the data and return ONLY a JSON object with this structure:
{
  "normalized_data": { ...extracted data matching the schema... },
  "confidence": { field_name: score_0_to_1, ... },
  "missing_fields": [ ...field names that couldn't be extracted... ],
  "notes": "Any important observations or ambiguities"
}

Rules:
- Match field names exactly as specified in schema
- Infer missing values intelligently when possible
- Confidence score: 1.0 = certain, 0.5 = educated guess, 0.0 = couldn't extract
- If a field can't be extracted at all, put null and list it in missing_fields
- Be conservative with confidence scores`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001', // Fast, cheap, good enough for data extraction
      max_tokens: 2048,
      temperature: 0, // Deterministic for data extraction
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    // Extract JSON from response
    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    // Parse the JSON response (Claude should return pure JSON)
    let result
    try {
      // Try to parse as-is first
      result = JSON.parse(content.text)
    } catch {
      // If that fails, try to extract JSON from markdown code blocks
      const jsonMatch = content.text.match(/```json?\n([\s\S]*?)\n```/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1])
      } else {
        throw new Error('Could not parse response as JSON')
      }
    }

    // Calculate overall confidence
    const confidenceScores = Object.values(result.confidence || {}) as number[]
    const overall_confidence = confidenceScores.length > 0
      ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
      : 0

    // Determine if we should escalate based on confidence threshold
    const should_escalate = overall_confidence < confidence_threshold ||
                           (result.missing_fields && result.missing_fields.length > 0)

    return NextResponse.json({
      success: true,
      data: result.normalized_data,
      confidence: result.confidence,
      overall_confidence,
      missing_fields: result.missing_fields || [],
      notes: result.notes,
      should_escalate,
      escalation_reason: should_escalate 
        ? `Low confidence (${overall_confidence.toFixed(2)}) or missing fields`
        : null,
      model_used: 'claude-haiku-4-5-20251001',
      cost_estimate: 0.0001 // Approximate cost in USD
    })

  } catch (error: any) {
    console.error('Interpret error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error',
        data: null 
      },
      { status: 500 }
    )
  }
}
