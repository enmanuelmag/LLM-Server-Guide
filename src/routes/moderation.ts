import express from 'express';
import { ModerationService, ModerationResult } from '../services/ModerationService';
import { Logger } from '../utils/logger';

const router = express.Router();
const moderationService = new ModerationService();

/**
 * POST /api/moderation/text
 * Moderate a single text input
 */
router.post('/text', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Text parameter is required and must be a string'
      });
    }

    const result = await moderationService.moderateText(text);
    const analysis = moderationService.analyzeModeration(result);

    res.json({
      success: true,
      data: {
        moderation: result,
        analysis,
        input_length: text.length
      }
    });

  } catch (error) {
    Logger.error('Error in text moderation endpoint', error);
    res.status(500).json({
      error: 'Internal server error during moderation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/moderation/batch
 * Moderate multiple text inputs
 */
router.post('/batch', async (req, res) => {
  try {
    const { texts } = req.body;

    if (!Array.isArray(texts)) {
      return res.status(400).json({
        error: 'Texts parameter must be an array of strings'
      });
    }

    if (texts.length === 0) {
      return res.status(400).json({
        error: 'At least one text input is required'
      });
    }

    if (texts.length > 10) {
      return res.status(400).json({
        error: 'Maximum 10 texts can be processed in batch'
      });
    }

    // Validate all inputs are strings
    for (let i = 0; i < texts.length; i++) {
      if (typeof texts[i] !== 'string') {
        return res.status(400).json({
          error: `Text at index ${i} must be a string`
        });
      }
    }

    const results = await moderationService.moderateTextBatch(texts);
    const analyses = results.map((result: ModerationResult) => moderationService.analyzeModeration(result));

    // Summary statistics
    const flaggedCount = results.filter((r: ModerationResult) => r.flagged).length;
    const highRiskCount = analyses.filter((a: any) => a.risk_level === 'high').length;
    const mediumRiskCount = analyses.filter((a: any) => a.risk_level === 'medium').length;

    res.json({
      success: true,
      data: {
        results: results.map((result: ModerationResult, index: number) => ({
          index,
          moderation: result,
          analysis: analyses[index]
        })),
        summary: {
          total: results.length,
          flagged: flaggedCount,
          clean: results.length - flaggedCount,
          high_risk: highRiskCount,
          medium_risk: mediumRiskCount,
          low_risk: results.length - highRiskCount - mediumRiskCount
        }
      }
    });

  } catch (error) {
    Logger.error('Error in batch moderation endpoint', error);
    res.status(500).json({
      error: 'Internal server error during batch moderation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/moderation/email
 * Moderate email content (subject and body)
 */
router.post('/email', async (req, res) => {
  try {
    const { subject, body } = req.body;

    if (!subject || typeof subject !== 'string') {
      return res.status(400).json({
        error: 'Subject parameter is required and must be a string'
      });
    }

    if (!body || typeof body !== 'string') {
      return res.status(400).json({
        error: 'Body parameter is required and must be a string'
      });
    }

    const result = await moderationService.moderateEmail(subject, body);
    const subjectAnalysis = moderationService.analyzeModeration(result.subject);
    const bodyAnalysis = moderationService.analyzeModeration(result.body);

    // Overall risk assessment
    const overallRiskLevel = result.overall_safe 
      ? 'low' 
      : (subjectAnalysis.risk_level === 'high' || bodyAnalysis.risk_level === 'high')
        ? 'high'
        : 'medium';

    res.json({
      success: true,
      data: {
        email_safe: result.overall_safe,
        subject: {
          moderation: result.subject,
          analysis: subjectAnalysis
        },
        body: {
          moderation: result.body,
          analysis: bodyAnalysis
        },
        overall: {
          risk_level: overallRiskLevel,
          recommendation: result.overall_safe 
            ? 'Email content is safe for delivery'
            : 'Email content requires review before delivery'
        }
      }
    });

  } catch (error) {
    Logger.error('Error in email moderation endpoint', error);
    res.status(500).json({
      error: 'Internal server error during email moderation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/moderation/categories
 * Get information about moderation categories
 */
router.get('/categories', (req, res) => {
  res.json({
    success: true,
    data: {
      categories: {
        harassment: 'Content that expresses, incites, or promotes harassing language towards any target.',
        'harassment/threatening': 'Harassment content that also includes violence or serious harm towards any target.',
        hate: 'Content that expresses, incites, or promotes hate based on race, gender, ethnicity, religion, nationality, sexual orientation, disability status, or caste.',
        'hate/threatening': 'Hateful content that also includes violence or serious harm towards the targeted group.',
        'self-harm': 'Content that promotes, encourages, or depicts acts of self-harm, such as suicide, cutting, and eating disorders.',
        'self-harm/intent': 'Content where the speaker expresses that they are engaging or intend to engage in acts of self-harm.',
        'self-harm/instructions': 'Content that encourages performing acts of self-harm, such as suicide, cutting, and eating disorders, or that gives instructions or advice on how to commit such acts.',
        sexual: 'Content meant to arouse sexual excitement, such as the description of sexual activity, or that promotes sexual services.',
        'sexual/minors': 'Sexual content that includes an individual who is under 18 years old.',
        violence: 'Content that depicts death, violence, or physical injury.',
        'violence/graphic': 'Content that depicts death, violence, or physical injury in graphic detail.'
      },
      usage_notes: [
        'Lower scores indicate less concerning content',
        'Flagged content has exceeded OpenAI\'s safety thresholds',
        'Multiple categories can be flagged for a single text',
        'Category scores range from 0.0 to 1.0'
      ]
    }
  });
});

/**
 * POST /api/moderation/demo
 * Demo endpoint with example texts for testing
 */
router.post('/demo', async (req, res) => {
  try {
    const demoTexts = [
      "Hello! Welcome to our newsletter. We're excited to share our latest updates with you.",
      "URGENT: Your account will be suspended unless you click this link immediately!",
      "Congratulations on your purchase! Your order #12345 has been processed successfully.",
      "Free money! Click here to claim your prize now! Limited time offer!",
      "Thank you for your feedback. We'll review your suggestions and get back to you soon."
    ];

    const { include_risky = false } = req.body;

    let textsToModerate = demoTexts;

    // Add some edge cases if requested (for educational purposes)
    if (include_risky) {
      textsToModerate.push(
        "I'm feeling really down lately and don't know what to do anymore.",
        "This product is garbage and the company doesn't care about customers."
      );
    }

    const results = await moderationService.moderateTextBatch(textsToModerate);
    const analyses = results.map((result: ModerationResult) => moderationService.analyzeModeration(result));

    res.json({
      success: true,
      data: {
        demo_results: textsToModerate.map((text, index) => ({
          index,
          text,
          moderation: results[index],
          analysis: analyses[index]
        })),
        summary: {
          total: results.length,
          flagged: results.filter((r: ModerationResult) => r.flagged).length,
          average_highest_score: results.reduce((sum: number, r: ModerationResult) => sum + (r.highest_scores[0]?.score || 0), 0) / results.length
        },
        educational_note: "This demo shows how different types of content are assessed by OpenAI's Moderation API"
      }
    });

  } catch (error) {
    Logger.error('Error in demo moderation endpoint', error);
    res.status(500).json({
      error: 'Internal server error during demo',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
