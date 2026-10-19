import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';

// On passe la clé directement dans les headers pour contourner la détection du SDK
const anthropic = new Anthropic({
  apiKey: 'dummy', // Valeur factice pour éviter l'erreur de clé manquante
  defaultHeaders: {
    'x-api-key': process.env.ANTHROPIC_API_KEY,
  },
});

const D_ID_API_KEY = process.env.D_ID_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { question, durationMin } = req.body;

  try {
    const targetWords = durationMin * 140;
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: `Tu es le moteur de DEHORS. Génère un script pédagogique d'environ ${targetWords} mots. Commence directement.`,
      messages: [{ role: "user", content: `Question : "${question}"` }]
    });
    const scriptText = msg.content[0].text;

    const dIdResponse = await axios.post('https://api.d-id.com/talks', {
      script: { type: 'text', input: scriptText, provider: { type: 'microsoft', voice_id: 'fr-FR-DeniseNeural' } },
      source_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
      config: { fluent: true }
    }, { headers: { 'Authorization': `Basic ${D_ID_API_KEY}`, 'Content-Type': 'application/json' } });

    let videoUrl = null, attempts = 0;
    while (!videoUrl && attempts < 15) {
      await new Promise(r => setTimeout(r, 2000));
      const status = await axios.get(`https://api.d-id.com/talks/${dIdResponse.data.id}`, { headers: { 'Authorization': `Basic ${D_ID_API_KEY}` } });
      if (status.data.status === 'done') videoUrl = status.data.result_url;
      if (status.data.status === 'error') throw new Error("Erreur D-ID");
      attempts++;
    }

    if (!videoUrl) throw new Error("Timeout vidéo.");
    res.status(200).json({ videoUrl, script: scriptText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
