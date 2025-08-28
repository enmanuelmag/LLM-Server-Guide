import { FinancialPolicy } from '../types/rag';

/**
 * Simulated Email Database for RAG Testing
 * Emails simulados de compras, sesiones bancarias, promociones y ofertas
 * Diseñados para ser claros y no ambiguos para mejores resultados de RAG
 */
export const FINANCIAL_POLICIES: Omit<FinancialPolicy, 'embedding'>[] = [
  {
    id: 'amazon-receipt-001',
    title: 'Amazon Purchase Receipt - MacBook Pro',
    content: 'From: auto-confirm@amazon.com. Subject: Your order has been shipped. Dear Customer, your Amazon order #112-7854621-1234567 has been shipped. Item: Apple MacBook Pro 13-inch M2 chip. Price: $1,299.00. Shipping: FREE. Estimated delivery: Dec 15, 2024. Payment method: Visa ending in 4532. Shipping address: 123 Main St, Seattle, WA 98101.',
    category: 'purchase-receipt'
  },
  {
    id: 'netflix-subscription-001',
    title: 'Netflix Monthly Subscription Charge',
    content: 'From: info@account.netflix.com. Subject: Your Netflix payment receipt. Hi there, we have processed your monthly Netflix subscription payment. Amount: $15.99. Date: December 1, 2024. Payment method: Credit Card ending in 9876. Plan: Standard (2 screens HD). Next billing date: January 1, 2025. Questions? Visit help.netflix.com.',
    category: 'subscription-charge'
  },
  {
    id: 'bank-login-001',
    title: 'Bank of America Login Notification',
    content: 'From: alerts@bankofamerica.com. Subject: Sign-in Alert for your account. We noticed a sign-in to your Bank of America account from a new device. Date: Dec 10, 2024 at 2:15 PM PST. Location: Seattle, WA. Device: iPhone Safari. If this was you, no action needed. If not, please contact us immediately at 1-800-432-1000.',
    category: 'bank-security'
  },
  {
    id: 'spotify-promo-001',
    title: 'Spotify Premium Offer - 3 Months Free',
    content: 'From: noreply@spotify.com. Subject: 🎵 3 months of Premium, on us! Hi Music Lover, get 3 months of Spotify Premium absolutely FREE. Normally $9.99/month, now $0 for qualified users. Enjoy ad-free music, offline downloads, and premium sound quality. Offer expires December 31, 2024. Click here to claim your free trial. Terms and conditions apply.',
    category: 'promotion-offer'
  },
  {
    id: 'target-receipt-001',
    title: 'Target Store Receipt - Household Items',
    content: 'From: receipts@target.com. Subject: Thanks for shopping with us! Receipt #REF0123456789. Store #1234, Seattle WA. Date: Dec 8, 2024 3:47 PM. Items: Tide Laundry Pods 42ct $12.99, Bounty Paper Towels 8pk $18.99, Method Hand Soap $3.49, Banana 2.1 lbs $1.89. Subtotal: $37.36. Tax: $3.36. Total: $40.72. Paid with: Target RedCard ending 5678. Saved: $4.20.',
    category: 'purchase-receipt'
  },
  {
    id: 'chase-statement-001',
    title: 'Chase Credit Card Statement Available',
    content: 'From: chase@alertsp.chase.com. Subject: Your December statement is ready. Your Chase Sapphire Preferred credit card statement is now available. Statement date: December 10, 2024. Previous balance: $1,247.83. Payments: $1,247.83. New charges: $892.45. Current balance: $892.45. Minimum payment: $35.00. Payment due: January 3, 2025. Available credit: $14,107.55.',
    category: 'bank-statement'
  },
  {
    id: 'starbucks-rewards-001',
    title: 'Starbucks Rewards - Birthday Drink Offer',
    content: 'From: info@starbucks.com. Subject: ☕ Happy Birthday! Your free drink awaits. Happy Birthday! As a Starbucks Rewards member, enjoy ANY handcrafted beverage (any size) on us! This offer is valid for 30 days from your birthday. Redeem in-store or mobile app. Your current Stars balance: 340 Stars. You are 110 Stars away from your next reward!',
    category: 'promotion-offer'
  },
  {
    id: 'paypal-payment-001',
    title: 'PayPal Payment Confirmation - Office365',
    content: 'From: service@paypal.com. Subject: You sent a payment to Microsoft Corporation. You sent $12.99 USD to Microsoft Corporation (microsoft@service.microsoft.com). Transaction ID: 8XY123456789ABC. Date: Dec 9, 2024. For: Microsoft 365 Personal Annual Subscription. Funding source: Bank of America checking account. Transaction fee: $0.00. Thanks for using PayPal!',
    category: 'subscription-charge'
  },
  {
    id: 'wells-fargo-transfer-001',
    title: 'Wells Fargo Transfer Confirmation',
    content: 'From: alerts@wellsfargo.com. Subject: Transfer completed successfully. Your transfer has been completed. From: Wells Fargo Checking (...4567). To: Wells Fargo Savings (...8901). Amount: $2,500.00. Date: December 11, 2024 at 1:23 PM. Confirmation number: WF789456123. Your new checking balance: $3,247.18. Your new savings balance: $15,750.00.',
    category: 'bank-transfer'
  },
  {
    id: 'amazon-prime-renewal-001',
    title: 'Amazon Prime Membership Renewal',
    content: 'From: account-update@amazon.com. Subject: Your Prime membership has been renewed. Hello, your Amazon Prime membership has been automatically renewed. Renewal date: December 5, 2024. Next renewal: December 5, 2025. Amount charged: $139.00. Payment method: Chase Visa ending in 2468. Benefits: Free shipping, Prime Video, Prime Music, exclusive deals. Manage your membership at amazon.com/prime.',
    category: 'subscription-charge'
  },
  {
    id: 'apple-purchase-001',
    title: 'Apple App Store Purchase Receipt',
    content: 'From: do_not_reply@itunes.com. Subject: Your receipt from Apple. Thank you for your purchase from the App Store. Date: December 7, 2024. Order Number: ML6Q2XY7Z9. Sold To: John Smith, Seattle, WA 98101. Item: Procreate App. Price: $12.99. Payment Method: Apple Card ending in 4321. Total: $12.99. This receipt is for your records.',
    category: 'purchase-receipt'
  },
  {
    id: 'uber-trip-001',
    title: 'Uber Trip Receipt - Downtown Seattle',
    content: 'From: receipts@uber.com. Subject: Trip with Uber completed. Thanks for riding with Uber! Trip date: Dec 12, 2024 at 8:45 AM. From: 1201 3rd Ave, Seattle WA (Downtown). To: Seattle-Tacoma Airport (SEA). Distance: 14.2 miles. Time: 23 minutes. UberX with Maria (5-star driver). Base fare: $18.75. Distance: $8.52. Time: $4.20. Total: $31.47. Payment: Visa ending 7890.',
    category: 'transportation'
  }
];
