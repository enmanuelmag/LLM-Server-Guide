import { Router } from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import { EnhancedRAGService } from '../services/EnhancedRAGService';
import { EmailSearchService } from '../services/EmailSearchService';
import { config } from '../config';
import { Logger } from '../utils/logger';
import OpenAI from 'openai';

const router = Router();
const ragService = new EnhancedRAGService();
const emailSearchService = new EmailSearchService();
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

// Enhanced RAG query endpoint with function calling
router.post('/query', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query is required and must be a string',
        example: { query: '¿cuánto gasté en comestibles esta semana?' },
        supportedQueries: [
          '¿cuánto gasté en Amazon?',
          'gastos en entretenimiento',
          'suscripciones este mes',
          'compras mayores a $50',
        ],
      });
    }

    const answer = await ragService.generateResponse(query);

    res.json({
      success: true,
      query,
      answer,
      branchInfo: {
        branch: '5-fetch-emails',
        features: ['Enhanced RAG', 'Function Calling', 'Email Search'],
        capabilities: 'Combines vector search with structured email parameters',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    Logger.error('Enhanced RAG query failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process enhanced RAG query',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Direct structured email search endpoint
router.post('/search-emails', async (req, res) => {
  try {
    const searchParams = req.body;

    if (!searchParams || typeof searchParams !== 'object') {
      return res.status(400).json({
        error: 'Search parameters are required',
        example: {
          categories: ['comestibles'],
          minAmount: 20,
          maxAmount: 100,
        },
        availableParams: [
          'senders',
          'subjects',
          'dateRange',
          'merchants',
          'categories',
          'minAmount',
          'maxAmount',
        ],
      });
    }

    const result = await emailSearchService.searchEmails(searchParams);

    res.json({
      success: true,
      searchParams,
      result: {
        emailsFound: result.emails.length,
        totalAmount: result.totalAmount,
        summary: result.summary,
        emails: result.emails.map((email) => ({
          title: email.title,
          amount: (email as any).amount,
          content: email.content.substring(0, 200) + '...',
        })),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    Logger.error('Email search failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search emails',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get search options and examples
router.get('/search-options', (req, res) => {
  try {
    const options = ragService.getSearchOptions();

    res.json({
      success: true,
      searchOptions: options,
      branchInfo: {
        branch: '5-fetch-emails',
        description: 'Enhanced RAG with Function Calling for Email Search',
      },
      usage: {
        enhancedRAG:
          'POST /rag/query - Natural language queries with function calling',
        directSearch:
          'POST /rag/search-emails - Direct structured parameter search',
        voiceQueries: 'POST /rag/query-voice-to-text - Voice input supported',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    Logger.error('Failed to get search options:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve search options',
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

      // Step 2: Use transcribed text for Enhanced RAG query
      const answer = await ragService.generateResponse(transcribedText);

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
          answer: answer,
          branchInfo: 'Enhanced RAG with Function Calling',
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

      // Step 2: Use transcribed text for Enhanced RAG query
      const answer = await ragService.generateResponse(transcribedText);
      Logger.info(
        `Enhanced RAG response generated: ${answer.length} characters`
      );

      // Step 3: Convert Enhanced RAG response to speech
      const ttsResponse = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'nova', // Can be made configurable: alloy, echo, fable, onyx, nova, shimmer
        input: answer,
        response_format: 'mp3',
      });

      const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());

      // Set response headers for audio
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Content-Disposition': `attachment; filename="rag-response-${Date.now()}.mp3"`,
        'X-Transcribed-Query': transcribedText,
        'X-Response-Length': answer.length.toString(),
        'X-Branch-Info': '5-fetch-emails Enhanced RAG',
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

// Get all emails (formerly policies)
router.get('/policies', (req, res) => {
  try {
    const { EMAIL_DATABASE } = require('../data/email-mock-data');

    res.json({
      success: true,
      totalEmails: EMAIL_DATABASE.length,
      branch: '5-fetch-emails',
      description: 'Email database for spending analysis',
      emails: EMAIL_DATABASE.map((email: any) => ({
        id: email.id,
        title: email.title,
        category: email.category,
        contentLength: email.content.length,
        hasEmbedding: !!email.embedding,
        preview: email.content.substring(0, 100) + '...',
      })),
    });
  } catch (error) {
    Logger.error('Failed to get emails:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve emails',
    });
  }
});

// Get Enhanced RAG statistics
router.get('/stats', (req, res) => {
  try {
    const { EMAIL_DATABASE } = require('../data/email-mock-data');
    const categories = emailSearchService.getAvailableCategories();
    const senders = emailSearchService.getAvailableSenders();

    const stats = {
      totalEmails: EMAIL_DATABASE.length,
      categories: categories,
      senders: senders,
      embeddingDimension: EMAIL_DATABASE[0]?.embedding?.length || 0,
      averageContentLength:
        EMAIL_DATABASE.length > 0
          ? Math.round(
              EMAIL_DATABASE.reduce(
                (sum: number, email: any) => sum + email.content.length,
                0
              ) / EMAIL_DATABASE.length
            )
          : 0,
      enhancedFeatures: [
        'Function Calling',
        'Structured Email Search',
        'Vector Similarity + Parameter Filtering',
        'Spending Analysis',
      ],
    };

    res.json({
      success: true,
      branch: '5-fetch-emails',
      description: 'Enhanced RAG with Function Calling for Email Search',
      emailDatabaseStats: stats,
      capabilities: {
        vectorSearch: 'Semantic similarity search across email content',
        functionCalling:
          'Structured search with parameters (senders, categories, amounts, dates)',
        voiceSupport: 'Whisper transcription + TTS response generation',
        combinedSearch:
          'Intelligent routing between vector and structured search',
      },
      openaiModels: {
        chat: 'gpt-4o-mini',
        embedding: config.openai.embeddingModel,
        speech: 'whisper-1',
        tts: 'tts-1',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    Logger.error('Failed to get enhanced stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve enhanced statistics',
    });
  }
});

export default router;
