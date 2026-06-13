export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method === "GET") return res.status(200).json({ status: "ok", message: "Celeste voice proxy is running" });
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const text = req.body?.text;
  const lang = req.body?.lang || "en";
  const chunk = req.body?.chunk || 0;      /* which chunk to generate */
  const chunkSize = req.body?.chunkSize || 800;

  if (!text) return res.status(400).json({ error: "No text provided" });

  const key = process.env.ELEVEN_KEY;
  if (!key) return res.status(500).json({ error: "ELEVEN_KEY not set" });

  /* Split text into chunks at sentence boundaries */
  function splitChunks(text, size) {
    const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
    const chunks = [];
    let current = "";
    for (const s of sentences) {
      if (current.length + s.length > size && current) {
        chunks.push(current.trim());
        current = s;
      } else {
        current += s;
      }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
  }

  const chunks = splitChunks(text, chunkSize);
  const totalChunks = chunks.length;

  if (chunk >= totalChunks) {
    return res.status(200).json({ done: true, totalChunks });
  }

  const textToSpeak = chunks[chunk];

  try {
    const response = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL?output_format=mp3_22050_32",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": key,
        },
        body: JSON.stringify({
          text: textToSpeak,
          model_id: "eleven_turbo_v2_5",
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
    /* Send audio with chunk metadata in headers */
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Chunk", chunk);
    res.setHeader("X-Total-Chunks", totalChunks);
    return res.status(200).send(Buffer.from(buffer));

  } catch (e) {
    return res.status(500).json({ error: e.message || "Unknown error" });
  }
}
