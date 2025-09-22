import {
  EmailSearchParams,
  EmailSearchResult,
} from '../types/function-calling';
import { EMAIL_DATABASE } from '../data/email-mock-data';
import { Logger } from '../utils/logger';

export class EmailSearchService {
  private emails: any[];

  constructor() {
    // Initialize with EMAIL_DATABASE
    this.emails = EMAIL_DATABASE;
    Logger.info(
      `📚 Email database initialized with ${this.emails.length} emails`
    );
  }

  /**
   * Search emails based on simplified parameters: sender, dateRange
   */
  async searchEmails(params: EmailSearchParams): Promise<EmailSearchResult> {
    Logger.info(
      '🔍 Searching emails with params:',
      JSON.stringify(params, null, 2)
    );

    let filteredEmails = [...this.emails];

    // Filter by sender
    if (params.senders && params.senders.length > 0) {
      filteredEmails = filteredEmails.filter(
        (email) =>
          params.senders!.some(sender => 
            email.title.toLowerCase().includes(sender.toLowerCase()) ||
            email.content.toLowerCase().includes(sender.toLowerCase())
          )
      );
      Logger.debug(
        `📧 Filtered by senders: ${filteredEmails.length} emails remaining`
      );
    }

    // Filter by date range
    if (params.dateRange) {
      const startDate = new Date(params.dateRange.from);
      const endDate = new Date(params.dateRange.to);

      filteredEmails = filteredEmails.filter((email) => {
        const emailDate = new Date(email.date);
        return emailDate >= startDate && emailDate <= endDate;
      });
      Logger.debug(
        `📅 Filtered by date range: ${filteredEmails.length} emails remaining`
      );
    }

    Logger.info(
      `✅ Inner Email search completed: ${filteredEmails.length} emails found`
    );

    return {
      emails: filteredEmails,
      summary: `Found ${filteredEmails.length} emails matching criteria`,
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
