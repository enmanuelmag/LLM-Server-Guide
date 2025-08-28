/**
 * Email Search Service with Function Calling Support - Simplified
 * Branch 5: fetch-emails - Simplified email search with only sender, subject, dateRange
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
   * Search emails with simplified parameters: sender, subject, dateRange
   */
  async searchEmails(params: EmailSearchParams): Promise<EmailSearchResult> {
    Logger.debug(
      '🔍 Searching emails with params:',
      JSON.stringify(params, null, 2)
    );

    let filteredEmails = [...this.emails];

    // Filter by sender (exact email match)
    if (params.sender) {
      filteredEmails = filteredEmails.filter((email) =>
        email.title.toLowerCase().includes(params.sender!.toLowerCase()) ||
        email.content.toLowerCase().includes(params.sender!.toLowerCase())
      );
      Logger.debug(
        `📧 Filtered by sender ${params.sender}: ${filteredEmails.length} emails remaining`
      );
    }

    // Filter by subject (contains)
    if (params.subject) {
      filteredEmails = filteredEmails.filter((email) =>
        email.title.toLowerCase().includes(params.subject!.toLowerCase())
      );
      Logger.debug(
        `📧 Filtered by subject "${params.subject}": ${filteredEmails.length} emails remaining`
      );
    }

    // Filter by date range (optional, defaults to current day)
    let dateStart: Date;
    let dateEnd: Date;
    
    if (params.dateRange) {
      dateStart = new Date(params.dateRange.start);
      dateEnd = new Date(params.dateRange.end);
    } else {
      // Default to current day
      const now = new Date();
      dateStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    }

    // For now, skip date filtering as mock data doesn't have proper date fields
    Logger.debug(
      `📅 Date range: ${dateStart.toISOString()} to ${dateEnd.toISOString()}`
    );

    const finalEmails = filteredEmails.slice(0, 20); // Limit results

    // Calculate total amount if emails have amount field
    const totalAmount = finalEmails.reduce((sum, email) => {
      // Try to extract amount from email content
      const amountMatch = email.content.match(/\$([0-9,]+\.?[0-9]*)/);
      const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : 0;
      return sum + amount;
    }, 0);

    const summary = this.generateSearchSummary(finalEmails, params, totalAmount);

    Logger.info(`✅ Email search completed: ${finalEmails.length} results`);

    return {
      emails: finalEmails,
      totalAmount,
      summary,
      searchParams: params,
    };
  }

  /**
   * Generate human-readable search summary
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
    if (params.sender) criteria.push(`remitente: ${params.sender}`);
    if (params.subject) criteria.push(`asunto: "${params.subject}"`);
    if (params.dateRange) {
      criteria.push(`fechas: ${params.dateRange.start} a ${params.dateRange.end}`);
    } else {
      criteria.push('fecha: día actual');
    }

    if (criteria.length > 0) {
      summary += `Criterios aplicados: ${criteria.join(', ')}.`;
    }

    return summary;
  }

  /**
   * Get all available senders from emails (for testing/debugging)
   */
  getAvailableSenders(): string[] {
    const senders = new Set<string>();
    this.emails.forEach((email) => {
      // Try to extract sender from email content or title
      const fromMatch = email.content.match(/De:\s*([^\n]+)/i) || 
                      email.title.match(/from\s*([^\s]+)/i);
      if (fromMatch) {
        senders.add(fromMatch[1].trim());
      }
    });
    return Array.from(senders);
  }
}
