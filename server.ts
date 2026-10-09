import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory audio cache for instant voice preview playback
const previewAudioCache = new Map<string, { audioData: string; mimeType: string }>();

// Shared Gemini GenAI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// TTS Generation endpoint for script or preview audio
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const {
      text,
      voiceName = 'Kore',
      style = 'Clear, natural grocery shopping list reading with distinct pauses between items.',
      isPreview = false,
      voiceId = '',
    } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text prompt is required.' });
      return;
    }

    const cacheKey = `${voiceName}-${voiceId}-${text.trim()}`;
    if (isPreview && previewAudioCache.has(cacheKey)) {
      const cached = previewAudioCache.get(cacheKey)!;
      res.json({
        success: true,
        audioData: cached.audioData,
        mimeType: cached.mimeType,
        voiceName,
        fromCache: true,
      });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
        fallbackAvailable: true,
      });
      return;
    }

    // Supported prebuilt voices: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
    const validVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
    const chosenVoice = validVoices.includes(voiceName) ? voiceName : 'Kore';

    const cleanText = text.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: style || 'Clear, natural speech',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: chosenVoice },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const audioPart = candidate?.content?.parts?.find(
      (part: any) => part.inlineData && part.inlineData.data
    );

    if (!audioPart || !audioPart.inlineData?.data) {
      res.status(500).json({
        error: 'No audio data was returned by the voice synthesis engine.',
      });
      return;
    }

    const audioBase64 = audioPart.inlineData.data;
    const mimeType = audioPart.inlineData.mimeType || 'audio/wav';
    const audioDataUrl = `data:${mimeType};base64,${audioBase64}`;

    if (isPreview) {
      previewAudioCache.set(cacheKey, { audioData: audioDataUrl, mimeType });
    }

    res.json({
      success: true,
      audioData: audioDataUrl,
      rawBase64: audioBase64,
      mimeType,
      voiceName: chosenVoice,
      spokenText: cleanText,
    });
  } catch (error: any) {
    console.error('TTS Generation error:', error);
    res.status(500).json({
      error: error.message || 'Failed to synthesize speech audio.',
      fallbackAvailable: true,
      details: error.toString(),
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, () => {
    console.log(`BazaarVoice server listening at http://localhost:${port}`);
  });
}

startServer();
