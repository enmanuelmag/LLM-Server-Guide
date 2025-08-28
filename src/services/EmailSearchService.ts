import { EmailSearchParams, EmailSearchResult } from '../types/function-calling';
import { EMAIL_DATABASE } from '../data/email-mock-data';
import { Logger } from '../utils/logger';

export class EmailSearchService {
  private emails: any[];

  constructor() {
    // Initialize with EMAIL_DATABASE
    this.emails = EMAIL_DATABASE;
    Logger.info(`📚 Email database initialized with ${this.emails.length} emails`);
  }

  /**
   * Search emails based on simplified parameters: sender, subject, dateRange
   */
  async searchEmails(params: EmailSearchParams): Promise<EmailSearchResult> {
    Logger.debug(
      '🔍 Searching emails with params:',
      JSON.stringify(params, null, 2)
    );

    let filteredEmails = [...this.emails];

    // Filter by sender
    if (params.sender) {
      filteredEmails = filteredEmails.filter((email) =>
        email.title.toLowerCase().includes(params.sender!.toLowerCase()) ||
        email.content.toLowerCase().includes(params.sender!.toLowerCase())
      );
      Logger.debug(
        `📧 Filtered by sender: ${filteredEmails.length} emails remaining`
      );
    }

    // Filter by subject
    if (params.subject) {
      filteredEmails = filteredEmails.filter((email) =>
        email.title.toLowerCase().includes(params.subject!.toLowerCase()) ||
        email.content.toLowerCase().includes(params.subject!.toLowerCase())
      );
      Logger.debug(
        `🏷️ Filtered by subject: ${filteredEmails.length} emails remaining`
      );
    }

    // Filter by date range
    if (params.dateRange) {
      const startDate = new Date(params.dateRange.start);
      const endDate = new Date(params.dateRange.end);
      
      filteredEmails = filteredEmails.filter((email) => {
        const emailDate = new Date(email.date);
        return emailDate >= startDate && emailDate <= endDate;
      });
      Logger.debug(
        `📅 Filtered by date range: ${filteredEmails.length} emails remaining`
      );
    }

    Logger.info(
      `✅ Email search completed: ${filteredEmails.length} emails found`
    );

    return {
      emails: filteredEmails,
      totalEmails: filteredEmails.length,
      searchParams: params,
    };
  }

  /**
   * Get all emails from the database
   */
  getAllEmails(): any[] {
    return [...this.emails];
  }
}