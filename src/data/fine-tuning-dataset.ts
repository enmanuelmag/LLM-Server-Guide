import { FineTuningDataPoint } from '../types/fine-tuning';

/**
 * Dataset de entrenamiento para fine-tuning
 * En producción, esto se generaría desde emails reales etiquetados
 */
export const FINE_TUNING_DATASET: FineTuningDataPoint[] = [
  // Emails financieros - Facturas de proveedores
  {
    messages: [
      { role: 'system', content: 'Clasifica si este email contiene información de transacciones financieras y extrae detalles relevantes.' },
      { role: 'user', content: 'Subject: Invoice #INV-2024-001 from TechCorp\nBody: Dear Customer, Your invoice #INV-2024-001 for $2,450.00 is now due. Payment terms: Net 30. Service: Software License. Please process payment by March 15, 2024.' },
      { role: 'assistant', content: '{"isFinancial": true, "confidence": 0.95, "category": "vendor-invoice", "reasoning": "Email contains invoice number, specific amount, and payment terms", "extractedAmount": {"value": 2450.00, "currency": "USD"}}' }
    ]
  },
  {
    messages: [
      { role: 'system', content: 'Clasifica si este email contiene información de transacciones financieras y extrae detalles relevantes.' },
      { role: 'user', content: 'Subject: Payment Receipt - Office Supplies\nBody: Thank you for your purchase. Amount paid: $347.85. Items: Printer paper, pens, folders. Transaction ID: TXN-789456. Your order will be shipped within 2 business days.' },
      { role: 'assistant', content: '{"isFinancial": true, "confidence": 0.92, "category": "office-expense", "reasoning": "Contains payment confirmation with specific amount and transaction ID", "extractedAmount": {"value": 347.85, "currency": "USD"}}' }
    ]
  },
  
  // Emails financieros - Suscripciones
  {
    messages: [
      { role: 'system', content: 'Clasifica si este email contiene información de transacciones financieras y extrae detalles relevantes.' },
      { role: 'user', content: 'Subject: Your Slack subscription renewal\nBody: Hi there! Your Slack Pro subscription has been renewed for $12.50/month. Next billing date: April 1st, 2024. Manage your subscription in your account settings.' },
      { role: 'assistant', content: '{"isFinancial": true, "confidence": 0.88, "category": "subscription-renewal", "reasoning": "Subscription renewal with monthly fee and billing date", "extractedAmount": {"value": 12.50, "currency": "USD"}}' }
    ]
  },
  {
    messages: [
      { role: 'system', content: 'Clasifica si este email contiene información de transacciones financieras y extrae detalles relevantes.' },
      { role: 'user', content: 'Subject: Microsoft 365 Annual Subscription\nBody: Your Microsoft 365 Business subscription has been charged $1,200.00 for the annual plan. Subscription period: March 2024 - March 2025. Download your invoice from the admin portal.' },
      { role: 'assistant', content: '{"isFinancial": true, "confidence": 0.94, "category": "subscription-renewal", "reasoning": "Annual subscription charge with specific amount and period", "extractedAmount": {"value": 1200.00, "currency": "USD"}}' }
    ]
  },

  // Emails financieros - Gastos de viaje
  {
    messages: [
      { role: 'system', content: 'Clasifica si este email contiene información de transacciones financieras y extrae detalles relevantes.' },
      { role: 'user', content: 'Subject: Hotel Booking Confirmation\nBody: Booking confirmed for John Smith. Hotel: Marriott Downtown. Check-in: March 20. Check-out: March 22. Total: $380.00 including taxes. Confirmation #: MAR123456' },
      { role: 'assistant', content: '{"isFinancial": true, "confidence": 0.90, "category": "travel-expense", "reasoning": "Hotel booking with total cost and confirmation number", "extractedAmount": {"value": 380.00, "currency": "USD"}}' }
    ]
  },
  {
    messages: [
      { role: 'system', content: 'Clasifica si este email contiene información de transacciones financieras y extrae detalles relevantes.' },
      { role: 'user', content: 'Subject: Flight Receipt - Business Trip\nBody: Flight receipt for Sarah Johnson. Route: NYC → SF → NYC. Total fare: $650.00. Flight dates: April 5-8, 2024. Expense report reference: EXP-2024-089.' },
      { role: 'assistant', content: '{"isFinancial": true, "confidence": 0.93, "category": "travel-expense", "reasoning": "Flight receipt with fare amount and expense report reference", "extractedAmount": {"value": 650.00, "currency": "USD"}}' }
    ]
  },

  // Emails NO financieros - Marketing
  {
    messages: [
      { role: 'system', content: 'Clasifica si este email contiene información de transacciones financieras y extrae detalles relevantes.' },
      { role: 'user', content: 'Subject: New Product Launch Announcement\nBody: We are excited to announce our latest product! Join us for the virtual launch event on March 25th. Register now and get early bird pricing. Limited spots available!' },
      { role: 'assistant', content: '{"isFinancial": false, "confidence": 0.85, "category": "marketing", "reasoning": "Product announcement email without specific financial transaction details"}' }
    ]
  },
  {
    messages: [
      { role: 'system', content: 'Clasifica si este email contiene información de transacciones financieras y extrae detalles relevantes.' },
      { role: 'user', content: 'Subject: Weekly Newsletter - Tech Updates\nBody: This weeks top tech news: AI advancement, new frameworks released, industry insights. Plus, exclusive interviews with tech leaders. Read more on our blog.' },
      { role: 'assistant', content: '{"isFinancial": false, "confidence": 0.92, "category": "newsletter", "reasoning": "Newsletter content without any financial transaction information"}' }
    ]
  },

  // Emails NO financieros - HR/Admin
  {
    messages: [
      { role: 'system', content: 'Clasifica si este email contiene información de transacciones financieras y extrae detalles relevantes.' },
      { role: 'user', content: 'Subject: Team Meeting Reminder\nBody: Reminder: All-hands meeting tomorrow at 2 PM in Conference Room A. Agenda: Q1 reviews, new project assignments, team building activities. Please confirm attendance.' },
      { role: 'assistant', content: '{"isFinancial": false, "confidence": 0.95, "category": "meeting-admin", "reasoning": "Administrative email about team meeting without financial content"}' }
    ]
  },
  {
    messages: [
      { role: 'system', content: 'Clasifica si este email contiene información de transacciones financieras y extrae detalles relevantes.' },
      { role: 'user', content: 'Subject: Welcome to the team!\nBody: Welcome aboard! We are thrilled to have you join our team. Your first day orientation is scheduled for Monday at 9 AM. HR will contact you with additional details.' },
      { role: 'assistant', content: '{"isFinancial": false, "confidence": 0.98, "category": "hr-onboarding", "reasoning": "HR onboarding email without any financial transaction content"}' }
    ]
  },

  // Emails borderline - Con menciones de dinero pero no transacciones
  {
    messages: [
      { role: 'system', content: 'Clasifica si este email contiene información de transacciones financieras y extrae detalles relevantes.' },
      { role: 'user', content: 'Subject: Budget Planning Meeting\nBody: Lets schedule a meeting to discuss next quarters budget allocation. We need to review the $50,000 marketing budget and $30,000 for new equipment. Available times: Tuesday or Wednesday.' },
      { role: 'assistant', content: '{"isFinancial": false, "confidence": 0.70, "category": "budget-planning", "reasoning": "Mentions budget amounts but is about planning meeting, not actual transaction"}' }
    ]
  },
  {
    messages: [
      { role: 'system', content: 'Clasifica si este email contiene información de transacciones financieras y extrae detalles relevantes.' },
      { role: 'user', content: 'Subject: Expense Report Approval Needed\nBody: Please review and approve the expense report submitted by Mike for $892.50. Includes receipts for client dinner and taxi fares. Login to the expense system to approve.' },
      { role: 'assistant', content: '{"isFinancial": true, "confidence": 0.85, "category": "expense-approval", "reasoning": "Request for expense approval with specific amount and expense details", "extractedAmount": {"value": 892.50, "currency": "USD"}}' }
    ]
  }
];
