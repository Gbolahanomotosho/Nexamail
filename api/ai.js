// api/ai.js — Vercel Serverless Function
// This is the secure AI proxy. The GROQ_API_KEY lives in Vercel
// environment variables and is NEVER sent to the browser.
// The frontend calls /api/ai, this function calls Groq, returns result.

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Read the Groq API key from Vercel environment variables (secure)
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'AI service not configured. Add GROQ_API_KEY to Vercel environment variables.' });
  }

  // Get the messages from the request body
  const { messages, system, maxTokens = 500 } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request body. messages array required.' });
  }

  // Build the full messages array including system prompt if provided
  const fullMessages = system
    ? [{ role: 'system', content: system }, ...messages]
    : messages;

  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        max_tokens: maxTokens,
        messages: fullMessages,
      }),
    });

    const data = await groqResponse.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    const reply = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({ error: 'Failed to reach AI service. Please try again.' });
  }
}
