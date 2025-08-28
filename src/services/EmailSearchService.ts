/**
 * Email Search Service with Function Calling Support
 * Branch 5: fetch-emails - Structured email search capabilities
 */

import { Logger } from '../utils/logger';
import {
  EmailSearchParams,
  EmailSearchResult,
} from '../types/function-calling';
import { EmailData } from '../types/rag';
import { EMAIL_DATABASE } from '../data/email-mock-data';

export class EmailSearchService {
  private emails: EmailData[];

  constructor() {
    this.emails = EMAIL_DATABASE as EmailData[];
    Logger.info(
      '📧 Email Search Service initialized with',
      this.emails.length,
      'emails'
    );
  }

  /**
   * Search emails with structured parameters from function calling
   */
  async searchEmails(params: EmailSearchParams): Promise<EmailSearchResult> {
    Logger.debug(
      '🔍 Searching emails with params:',
      JSON.stringify(params, null, 2)
    );

    let filteredEmails = [...this.emails];

    // Filter by senders
    if (params.senders && params.senders.length > 0) {
      filteredEmails = filteredEmails.filter((email) =>
        params.senders!.some(
          (sender) =>
            email.title.toLowerCase().includes(sender.toLowerCase()) ||
            email.content.toLowerCase().includes(sender.toLowerCase())
        )
      );
      Logger.debug(
        `📧 Filtered by senders: ${filteredEmails.length} emails remaining`
      );
    }

    // Filter by subjects/keywords
    if (params.subjects && params.subjects.length > 0) {
      filteredEmails = filteredEmails.filter((email) =>
        params.subjects!.some(
          (subject) =>
            email.title.toLowerCase().includes(subject.toLowerCase()) ||
            email.content.toLowerCase().includes(subject.toLowerCase())
        )
      );
      Logger.debug(
        `🏷️ Filtered by subjects: ${filteredEmails.length} emails remaining`
      );
    }

    // Filter by merchants
    if (params.merchants && params.merchants.length > 0) {
      filteredEmails = filteredEmails.filter((email) =>
        params.merchants!.some(
          (merchant) =>
            email.title.toLowerCase().includes(merchant.toLowerCase()) ||
            email.content.toLowerCase().includes(merchant.toLowerCase())
        )
      );
      Logger.debug(
        `🏪 Filtered by merchants: ${filteredEmails.length} emails remaining`
      );
    }

    // Filter by categories
    if (params.categories && params.categories.length > 0) {
      filteredEmails = filteredEmails.filter((email) =>
        params.categories!.some((category) => {
          const categoryMap: { [key: string]: string[] } = {
            comestibles: ['walmart', 'grocery', 'food', 'comestible'],
            entretenimiento: [
              'netflix',
              'spotify',
              'entertainment',
              'música',
              'video',
            ],
            electrónicos: ['amazon', 'electronics', 'gadget', 'tech'],
            suscripciones: ['netflix', 'spotify', 'subscription', 'monthly'],
            bancos: ['bank', 'chase', 'santander', 'bbva'],
            promociones: ['promotion', 'discount', 'offer', 'deal'],
          };

          const keywords = categoryMap[category.toLowerCase()] || [
            category.toLowerCase(),
          ];
          return keywords.some(
            (keyword) =>
              email.title.toLowerCase().includes(keyword) ||
              email.content.toLowerCase().includes(keyword)
          );
        })
      );
      Logger.debug(
        `📂 Filtered by categories: ${filteredEmails.length} emails remaining`
      );
    }

    // Extract amounts and filter by amount range
    const emailsWithAmounts = filteredEmails.map((email) => {
      const amountMatch = email.content.match(/\$?([\d,]+\.?\d*)/);
      const amount = amountMatch
        ? parseFloat(amountMatch[1].replace(',', ''))
        : 0;
      return { ...email, amount };
    });

    let finalEmails = emailsWithAmounts;

    if (params.minAmount !== undefined) {
      finalEmails = finalEmails.filter(
        (email) => email.amount >= params.minAmount!
      );
      Logger.debug(
        `💰 Filtered by min amount $${params.minAmount}: ${finalEmails.length} emails remaining`
      );
    }

    if (params.maxAmount !== undefined) {
      finalEmails = finalEmails.filter(
        (email) => email.amount <= params.maxAmount!
      );
      Logger.debug(
        `💰 Filtered by max amount $${params.maxAmount}: ${finalEmails.length} emails remaining`
      );
    }

    // Calculate total amount
    const totalAmount = finalEmails.reduce(
      (sum, email) => sum + email.amount,
      0
    );

    // Generate summary
    const summary = this.generateSearchSummary(
      finalEmails,
      params,
      totalAmount
    );

    Logger.info(
      `✅ Email search completed: ${
        finalEmails.length
      } emails found, total: $${totalAmount.toFixed(2)}`
    );

    return {
      emails: finalEmails,
      totalEmails: finalEmails.length,
      totalAmount,
      summary,
      searchParams: params,
    };
  }

  /**
   * Generate a human-readable summary of the search results
   */
  private generateSearchSummary(
    emails: any[],
    params: EmailSearchParams,
    totalAmount: number
  ): string {
    const count = emails.length;

    if (count === 0) {
      return 'No encontré emails que coincidan con los criterios de búsqueda especificados.';
    }

    let summary = `Encontré ${count} email${count > 1 ? 's' : ''} que coincide${
      count > 1 ? 'n' : ''
    } con tu búsqueda`;

    if (totalAmount > 0) {
      summary += ` con un total de $${totalAmount.toFixed(2)}`;
    }

    summary += '. ';

    // Add details about search criteria
    const criteria = [];
    if (params.senders?.length)
      criteria.push(`remitentes: ${params.senders.join(', ')}`);
    if (params.categories?.length)
      criteria.push(`categorías: ${params.categories.join(', ')}`);
    if (params.merchants?.length)
      criteria.push(`comerciantes: ${params.merchants.join(', ')}`);
    if (params.minAmount !== undefined)
      criteria.push(`monto mínimo: $${params.minAmount}`);
    if (params.maxAmount !== undefined)
      criteria.push(`monto máximo: $${params.maxAmount}`);

    if (criteria.length > 0) {
      summary += `Criterios aplicados: ${criteria.join(', ')}.`;
    }

    return summary;
  }

  /**
   * Get all unique senders from emails
   */
  getAvailableSenders(): string[] {
    const senders = new Set<string>();
    this.emails.forEach((email) => {
      const fromMatch = email.content.match(/De:\s*([^\n]+)/);
      if (fromMatch) {
        senders.add(fromMatch[1].trim());
      }
    });
    return Array.from(senders);
  }

  /**
   * Get all available categories
   */
  getAvailableCategories(): string[] {
    return [
      'comestibles',
      'entretenimiento',
      'electrónicos',
      'suscripciones',
      'bancos',
      'promociones',
    ];
  }
}
