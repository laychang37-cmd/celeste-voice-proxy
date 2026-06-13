export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    return res.status(200).json({ status: "ok", message: "Celeste voice proxy is running" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const text = req.body?.text;
  const lang = req.body?.lang || "en";

  if (!text) return res.status(400).json({ error: "No text provided" });

  const key = process.env.ELEVEN_KEY;
  if (!key) return res.status(500).json({ error: "ELEVEN_KEY not set" });

  /* Voice IDs that work on ElevenLabs free plan:
     Sarah: EXAVITQu4vr4xnSDxMaL  - soft, warm, natural
     Aria:  9BWtsMINqrJLrRacOk9x  - expressive, warm
     We use Sarah for EN and try Aria as fallback */
  const VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; /* Sarah */

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": key,
        },
        body: JSON.stringify({
          text: text.slice(0, 5000),
          model_id: "eleven_multilingual_v2",
          language_code: lang === "es" ? "es" : "en",
          voice_settings: {
            stability: 0.50,
            similarity_boost: 0.82,
            style: 0.25,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg = err?.detail?.message || err?.detail?.status || `ElevenLabs error ${response.status}`;
      return res.status(response.status).json({ error: msg });
    }

    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(Buffer.from(buffer));

  } catch (e) {
    return res.status(500).json({ error: e.message || "Unknown error" });
  }
}
