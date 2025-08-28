import { faker } from '@faker-js/faker';
import { EmailData, EmailSender } from '../types/email';

/**
 * Senders existentes preservados para compatibilidad con app móvil
 * Estos mantendrán el formato que espera la aplicación actual
 */
export const EXISTING_SENDERS: EmailSender[] = [
  // Bancos
  { email: 'notifications@bankofamerica.com', name: 'Bank of America', type: 'bank' },
  { email: 'alerts@chase.com', name: 'Chase Bank', type: 'bank' },
  { email: 'notices@wellsfargo.com', name: 'Wells Fargo', type: 'bank' },
  { email: 'info@citi.com', name: 'Citibank', type: 'bank' },
  
  // Vendors comunes
  { email: 'noreply@amazon.com', name: 'Amazon', type: 'vendor' },
  { email: 'receipts@uber.com', name: 'Uber', type: 'vendor' },
  { email: 'billing@target.com', name: 'Target', type: 'vendor' },
  { email: 'orders@bestbuy.com', name: 'Best Buy', type: 'vendor' },
  { email: 'invoices@homedepot.com', name: 'Home Depot', type: 'vendor' },
  
  // Suscripciones
  { email: 'billing@slack.com', name: 'Slack', type: 'subscription' },
  { email: 'noreply@microsoft.com', name: 'Microsoft', type: 'subscription' },
  { email: 'billing@adobe.com', name: 'Adobe', type: 'subscription' },
  { email: 'accounts@notion.so', name: 'Notion', type: 'subscription' },
  { email: 'billing@zoom.us', name: 'Zoom', type: 'subscription' },
];

export class EmailSimulationService {
  private getRandomSender(): EmailSender {
    return faker.helpers.arrayElement(EXISTING_SENDERS);
  }

  private generateBankEmail(sender: EmailSender): EmailData {
    const amount = faker.finance.amount({ min: 50, max: 2500, dec: 2 });
    const transactionType = faker.helpers.arrayElement(['purchase', 'withdrawal', 'deposit', 'transfer']);
    const merchant = faker.company.name();
    
    return {
      id: faker.string.uuid(),
      from: sender.email,
      subject: `Transaction Alert: ${transactionType} of $${amount}`,
      body: `Dear Customer,

A ${transactionType} transaction has been processed on your account.

Amount: $${amount}
Merchant: ${merchant}
Date: ${faker.date.recent().toLocaleDateString()}
Card ending in: ${faker.finance.creditCardNumber('####')}
Authorization Code: ${faker.string.alphanumeric(8).toUpperCase()}

If you did not authorize this transaction, please contact us immediately.

Best regards,
${sender.name}`,
      receivedAt: faker.date.recent().getTime(),
      attachments: []
    };
  }

  private generateVendorEmail(sender: EmailSender): EmailData {
    const amount = faker.finance.amount({ min: 15, max: 500, dec: 2 });
    const orderNumber = faker.string.alphanumeric(10).toUpperCase();
    const items = Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => 
      faker.commerce.productName()
    ).join(', ');
    
    return {
      id: faker.string.uuid(),
      from: sender.email,
      subject: `Order Confirmation #${orderNumber}`,
      body: `Thank you for your order!

Order #: ${orderNumber}
Items: ${items}
Total: $${amount}
Shipping: Free
Tax: $${faker.finance.amount({ min: 5, max: 25, dec: 2 })}

Your order will be processed within 1-2 business days.
Estimated delivery: ${faker.date.soon({ days: 7 }).toLocaleDateString()}

Track your order at: https://${sender.email.split('@')[1]}/track/${orderNumber}

Thank you for choosing ${sender.name}!`,
      receivedAt: faker.date.recent().getTime(),
      attachments: []
    };
  }

  private generateSubscriptionEmail(sender: EmailSender): EmailData {
    const monthlyAmount = faker.finance.amount({ min: 9.99, max: 99.99, dec: 2 });
    const planType = faker.helpers.arrayElement(['Pro', 'Business', 'Premium', 'Enterprise']);
    const renewalDate = faker.date.soon({ days: 30 });
    
    return {
      id: faker.string.uuid(),
      from: sender.email,
      subject: `${sender.name} ${planType} - Subscription Renewed`,
      body: `Hello!

Your ${sender.name} ${planType} subscription has been successfully renewed.

Plan: ${planType}
Amount: $${monthlyAmount}/month
Next billing date: ${renewalDate.toLocaleDateString()}
Payment method: Card ending in ${faker.finance.creditCardNumber('####')}

Manage your subscription: https://${sender.email.split('@')[1]}/account/billing

Thank you for being a loyal customer!

Best regards,
The ${sender.name} Team`,
      receivedAt: faker.date.recent().getTime(),
      attachments: []
    };
  }

  private generateNonFinancialEmail(): EmailData {
    const sender = faker.helpers.arrayElement([
      { email: 'newsletter@techcrunch.com', name: 'TechCrunch' },
      { email: 'updates@github.com', name: 'GitHub' },
      { email: 'noreply@linkedin.com', name: 'LinkedIn' },
      { email: 'team@company.com', name: 'Company Team' }
    ]);
    
    const subjects = [
      'Weekly Newsletter - Tech Updates',
      'Team Meeting Reminder',
      'New Feature Announcement',
      'Welcome to the team!',
      'Project Status Update',
      'Industry News Digest'
    ];
    
    return {
      id: faker.string.uuid(),
      from: sender.email,
      subject: faker.helpers.arrayElement(subjects),
      body: `This is a non-financial email from ${sender.name}.

${faker.lorem.paragraphs(2)}

Best regards,
${sender.name}`,
      receivedAt: faker.date.recent().getTime(),
      attachments: []
    };
  }

  /**
   * Generate a single simulated email
   */
  generateEmail(forceFinancial?: boolean): EmailData {
    if (forceFinancial === false) {
      return this.generateNonFinancialEmail();
    }
    
    // 80% chance of financial email, 20% non-financial
    if (forceFinancial === true || faker.datatype.boolean({ probability: 0.8 })) {
      const sender = this.getRandomSender();
      
      switch (sender.type) {
        case 'bank':
          return this.generateBankEmail(sender);
        case 'vendor':
          return this.generateVendorEmail(sender);
        case 'subscription':
          return this.generateSubscriptionEmail(sender);
        default:
          return this.generateVendorEmail(sender);
      }
    } else {
      return this.generateNonFinancialEmail();
    }
  }

  /**
   * Generate multiple emails for simulation
   */
  generateEmails(count: number, financialRatio: number = 0.7): EmailData[] {
    const emails: EmailData[] = [];
    
    for (let i = 0; i < count; i++) {
      const isFinancial = Math.random() < financialRatio;
      emails.push(this.generateEmail(isFinancial));
    }
    
    // Sort by receivedAt (most recent first)
    return emails.sort((a, b) => b.receivedAt - a.receivedAt);
  }

  /**
   * Get all available senders for UI display
   */
  getAvailableSenders(): EmailSender[] {
    return [...EXISTING_SENDERS];
  }

  /**
   * Generate email from specific sender (for testing)
   */
  generateEmailFromSender(senderEmail: string): EmailData {
    const sender = EXISTING_SENDERS.find(s => s.email === senderEmail);
    
    if (!sender) {
      throw new Error(`Sender ${senderEmail} not found`);
    }
    
    switch (sender.type) {
      case 'bank':
        return this.generateBankEmail(sender);
      case 'vendor':
        return this.generateVendorEmail(sender);
      case 'subscription':
        return this.generateSubscriptionEmail(sender);
      default:
        return this.generateVendorEmail(sender);
    }
  }
}
