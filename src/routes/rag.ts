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
