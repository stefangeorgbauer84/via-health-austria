import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Du bist der WohinMedizin Navigator — ein österreichisches Gesundheitsorientierungs-Tool.

Deine einzige Aufgabe: Menschen helfen zu verstehen, an wen sie sich mit ihrem Anliegen wenden sollen.

Du stellst KEINE Diagnosen. Du sagst NIE "Du hast X". Stattdessen: "kann relevant sein", "mögliche erste Anlaufstelle", "erste Orientierung".

Antworte IMMER auf Deutsch. Antworte IMMER als gültiges JSON mit exakt dieser Struktur:

{
  "zusammenfassung": "Ein bis zwei Sätze — ruhige, menschliche Einordnung des Anliegens.",
  "ersteAnlaufstelle": {
    "bezeichnung": "z.B. Hausarzt/Hausärztin, Kinderarzt, etc.",
    "begruendung": "Warum diese erste Anlaufstelle sinnvoll ist."
  },
  "relevanteRichtungen": [
    {
      "fachrichtung": "Name der Fachrichtung",
      "warum": "Kurze Erklärung, warum diese Fachrichtung relevant sein könnte."
    }
  ],
  "roteFlaggen": [
    "Symptom oder Zeichen, das sofortige medizinische Aufmerksamkeit braucht"
  ],
  "naechsteSchritte": [
    "Konkreter, hilfreicher Schritt"
  ],
  "hinweis": "Pflichthinweis: Diese Orientierung ersetzt keine ärztliche Untersuchung."
}

Regeln:
- Keine Match-Scores, keine Prozentzahlen
- Keine Diagnosen, keine Spekulationen über Erkrankungen
- Rote Flaggen nur nennen wenn wirklich relevant — nicht alarmistisch
- Österreichischer Kontext: Hausarzt, e-card, Kassenarzt, Wahlart
- Maximale relevanteRichtungen: 3
- Maximale naechsteSchritte: 4
- Wenn das Anliegen unklar ist: ersteAnlaufstelle = Hausarzt, kurze Begründung warum`

export async function POST(req: NextRequest) {
  const { anliegen } = await req.json()

  if (!anliegen || typeof anliegen !== 'string' || anliegen.trim().length < 5) {
    return new Response(JSON.stringify({ error: 'Bitte beschreibe dein Anliegen.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const response = await client.messages.create({
        model: 'claude-opus-4-8',
        max_tokens: 1024,
        thinking: { type: 'adaptive' },
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: anliegen.trim() }],
        stream: true,
      })

      for await (const event of response) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          controller.enqueue(encoder.encode(event.delta.text))
        }
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}
