import { Router } from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import { ragService } from '../app';
import { config } from '../config';
import { Logger } from '../utils/logger';
import OpenAI from 'openai';

const router = Router();
const openai = new OpenAI({ apiKey: config.openai.apiKey });

// Configure multer for audio file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
      'audio/flac',
      'audio/x-m4a',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  },
});

// RAG query endpoint
router.post('/query', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query is required and must be a string',
        example: { query: '¿Cuál es el límite de gastos de oficina?' },
      });
    }

    const result = await ragService.answerQuery(query);

    res.json({
      success: true,
      query,
      answer: result.answer,
      metadata: {
        relevantItems: result.relevantItems,
        tokensUsed: result.tokensUsed,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    Logger.error('RAG query failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process RAG query',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Audio to Text Query - Upload audio, convert to text, query RAG
router.post(
  '/query-voice-to-text',
  upload.single('audio'),
  async (req, res) => {
    let audioFilePath: string | undefined;

    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'Audio file is required',
          supported: ['mp3', 'wav', 'm4a', 'flac'],
          maxSize: '25MB',
        });
      }

      audioFilePath = req.file.path;
      Logger.info(
        `Processing audio file: ${req.file.originalname} (${req.file.size} bytes)`
      );

      // Step 1: Convert audio to text using Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: createReadStream(audioFilePath),
        model: 'whisper-1',
        language: 'es', // Can be made configurable
      });

      const transcribedText = transcription.text;
      Logger.info(`Transcribed text: "${transcribedText}"`);

      // Step 2: Use transcribed text for RAG query
      const result = await ragService.answerQuery(transcribedText);

      res.json({
        success: true,
        transcription: {
          originalAudio: req.file.originalname,
          transcribedText: transcribedText,
          audioSize: req.file.size,
          processingTime: Date.now(),
        },
        ragResponse: {
          query: transcribedText,
          answer: result.answer,
          relevantItems: result.relevantItems,
          tokensUsed: result.tokensUsed,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      Logger.error('Voice-to-text RAG query failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process voice query',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      // Clean up uploaded file
      if (audioFilePath) {
        try {
          await fs.unlink(audioFilePath);
          Logger.info(`Cleaned up audio file: ${audioFilePath}`);
        } catch (cleanupError) {
          Logger.warn(`Failed to cleanup file ${audioFilePath}:`, cleanupError);
        }
      }
    }
  }
);

// Audio to Audio Query - Upload audio, convert to text, query RAG, convert response to audio
router.post(
  '/query-voice-to-voice',
  upload.single('audio'),
  async (req, res) => {
    let audioFilePath: string | undefined;

    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'Audio file is required',
          supported: ['mp3', 'wav', 'm4a', 'flac'],
          maxSize: '25MB',
        });
      }

      audioFilePath = req.file.path;
      Logger.info(`Processing voice-to-voice query: ${req.file.originalname}`);

      // Step 1: Convert audio to text using Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: createReadStream(audioFilePath),
        model: 'whisper-1',
        language: 'es',
      });

      const transcribedText = transcription.text;
      Logger.info(`Transcribed query: "${transcribedText}"`);

      // Step 2: Use transcribed text for RAG query
      const result = await ragService.answerQuery(transcribedText);
      Logger.info(`RAG response generated: ${result.answer.length} characters`);

      // Step 3: Convert RAG response to speech
      const ttsResponse = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'nova', // Can be made configurable: alloy, echo, fable, onyx, nova, shimmer
        input: result.answer,
        response_format: 'mp3',
      });

      const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());

      // Set response headers for audio
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Content-Disposition': `attachment; filename="rag-response-${Date.now()}.mp3"`,
        'X-Transcribed-Query': transcribedText,
        'X-Response-Length': result.answer.length.toString(),
        'X-Relevant-Items': result.relevantItems.length.toString(),
        'X-Processing-Timestamp': new Date().toISOString(),
      });

      res.send(audioBuffer);
    } catch (error) {
      Logger.error('Voice-to-voice RAG query failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process voice-to-voice query',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      // Clean up uploaded file
      if (audioFilePath) {
        try {
          await fs.unlink(audioFilePath);
          Logger.info(`Cleaned up audio file: ${audioFilePath}`);
        } catch (cleanupError) {
          Logger.warn(`Failed to cleanup file ${audioFilePath}:`, cleanupError);
        }
      }
    }
  }
);

// Get all emails
router.get('/emails', (req, res) => {
  try {
    const vectorStore = ragService.getVectorStore();
    const emails = vectorStore.getAllItems();

    res.json({
      success: true,
      totalEmails: emails.length,
      emails: emails.map((email) => ({
        id: email.id,
        title: email.title,
        category: email.category,
        contentLength: email.content.length,
        hasEmbedding: email.embedding.length > 0,
      })),
    });
  } catch (error) {
    Logger.error('Failed to get emails:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve policies',
    });
  }
});

// Get RAG statistics
router.get('/stats', (req, res) => {
  try {
    const vectorStore = ragService.getVectorStore();
    const emails = vectorStore.getAllItems();

    const stats = {
      totalEmails: emails.length,
      categories: [...new Set(emails.map((e) => e.category))],
      embeddingDimension: emails[0]?.embedding.length || 0,
      averageContentLength:
        emails.length > 0
          ? Math.round(
              emails.reduce((sum, e) => sum + e.content.length, 0) /
                emails.length
            )
          : 0,
    };

    res.json({
      success: true,
      vectorStoreStats: stats,
      openaiModel: config.openai.embeddingModel,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    Logger.error('Failed to get stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics',
    });
  }
});

export default router;
