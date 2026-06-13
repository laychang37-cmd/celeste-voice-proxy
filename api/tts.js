export const config = { runtime: "edge" };

const RACHEL = "21m00Tcm4TlvDq8ikWAM";
const MODEL  = "eleven_multilingual_v2";

export default async function handler(req) {
  const origin = req.headers.get("origin") || "*";

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin":  "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
    });
  }

  let text, lang;
  try {
    const body = await req.json();
    text = body.text;
    lang = body.lang || "en";
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
    });
  }

  if (!text) {
    return new Response(JSON.stringify({ error: "No text provided" }), {
      status: 400,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
    });
  }

  const key = process.env.ELEVEN_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: "ELEVEN_KEY not set" }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
    });
  }

  try {
    const resp = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${RACHEL}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": key,
        },
        body: JSON.stringify({
          text: text.slice(0, 5000),
          model_id: MODEL,
          language_code: lang === "es" ? "es" : "en",
          voice_settings: {
            stability:         0.48,
            similarity_boost:  0.82,
            style:             0.28,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      return new Response(
        JSON.stringify({ error: err?.detail?.message || `ElevenLabs error ${resp.status}` }),
        { status: resp.status, headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" } }
      );
    }

    const audio = await resp.arrayBuffer();
    return new Response(audio, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type":   "audio/mpeg",
        "Cache-Control":  "no-store",
      },
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
    });
  }
}
