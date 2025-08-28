import { EmailData } from '../types/rag';

/**
 * Base de Datos de Emails Simulados para Pruebas RAG
 * Emails simulados de compras, sesiones bancarias, promociones y ofertas
 * Diseñados en español para ser claros y no ambiguos para mejores resultados de RAG
 * Los embeddings de OpenAI funcionan perfectamente con contenido en español
 */
export const EMAIL_DATABASE: Omit<EmailData, 'embedding'>[] = [
  {
    id: 'amazon-receipt-001',
    title: 'Amazon - Recibo de Compra MacBook Pro',
    content:
      'De: auto-confirm@amazon.com. Asunto: Tu pedido ha sido enviado. Estimado Cliente, tu pedido de Amazon #112-7854621-1234567 ha sido enviado. Artículo: Apple MacBook Pro 13 pulgadas chip M2. Precio: $1,299.00. Envío: GRATIS. Fecha estimada de entrega: 15 de diciembre, 2024. Método de pago: Visa terminada en 4532. Dirección de envío: Calle Principal 123, Seattle, WA 98101.',
    category: 'comprobante-compra',
  },
  {
    id: 'netflix-subscription-001',
    title: 'Netflix - Cargo Mensual de Suscripción',
    content:
      'De: info@account.netflix.com. Asunto: Tu recibo de pago de Netflix. Hola, hemos procesado tu pago mensual de suscripción a Netflix. Monto: $15.99. Fecha: 1 de diciembre, 2024. Método de pago: Tarjeta de Crédito terminada en 9876. Plan: Estándar (2 pantallas HD). Próxima fecha de facturación: 1 de enero, 2025. ¿Preguntas? Visita help.netflix.com.',
    category: 'cargo-suscripcion',
  },
  {
    id: 'bank-login-001',
    title: 'Bank of America - Notificación de Inicio de Sesión',
    content:
      'De: alerts@bankofamerica.com. Asunto: Alerta de acceso a tu cuenta. Hemos detectado un inicio de sesión en tu cuenta de Bank of America desde un dispositivo nuevo. Fecha: 10 de diciembre, 2024 a las 2:15 PM PST. Ubicación: Seattle, WA. Dispositivo: iPhone Safari. Si fuiste tú, no es necesaria ninguna acción. Si no, por favor contáctanos inmediatamente al 1-800-432-1000.',
    category: 'seguridad-bancaria',
  },
  {
    id: 'spotify-promo-001',
    title: 'Spotify Premium - Oferta 3 Meses Gratis',
    content:
      'De: noreply@spotify.com. Asunto: 🎵 ¡3 meses de Premium, por nuestra cuenta! Hola Amante de la Música, obtén 3 meses de Spotify Premium absolutamente GRATIS. Normalmente $9.99/mes, ahora $0 para usuarios calificados. Disfruta música sin anuncios, descargas sin conexión y calidad premium. La oferta expira el 31 de diciembre, 2024. Haz clic aquí para reclamar tu prueba gratuita. Aplican términos y condiciones.',
    category: 'oferta-promocional',
  },
  {
    id: 'target-receipt-001',
    title: 'Target - Recibo de Tienda Artículos del Hogar',
    content:
      'De: receipts@target.com. Asunto: ¡Gracias por comprar con nosotros! Recibo #REF0123456789. Tienda #1234, Seattle WA. Fecha: 8 de diciembre, 2024 3:47 PM. Artículos: Detergente Tide Pods 42ct $12.99, Toallas de Papel Bounty 8pk $18.99, Jabón para Manos Method $3.49, Plátanos 2.1 libras $1.89. Subtotal: $37.36. Impuestos: $3.36. Total: $40.72. Pagado con: Target RedCard terminada en 5678. Ahorrado: $4.20.',
    category: 'comprobante-compra',
  },
  {
    id: 'chase-statement-001',
    title: 'Chase - Estado de Cuenta Tarjeta de Crédito',
    content:
      'De: chase@alertsp.chase.com. Asunto: Tu estado de cuenta de diciembre está listo. Tu estado de cuenta de la tarjeta de crédito Chase Sapphire Preferred ya está disponible. Fecha del estado: 10 de diciembre, 2024. Saldo anterior: $1,247.83. Pagos: $1,247.83. Nuevos cargos: $892.45. Saldo actual: $892.45. Pago mínimo: $35.00. Fecha límite de pago: 3 de enero, 2025. Crédito disponible: $14,107.55.',
    category: 'estado-bancario',
  },
  {
    id: 'starbucks-rewards-001',
    title: 'Starbucks Rewards - Bebida de Cumpleaños Gratis',
    content:
      'De: info@starbucks.com. Asunto: ☕ ¡Feliz Cumpleaños! Tu bebida gratis te espera. ¡Feliz Cumpleaños! Como miembro de Starbucks Rewards, ¡disfruta CUALQUIER bebida artesanal (cualquier tamaño) por nuestra cuenta! Esta oferta es válida por 30 días desde tu cumpleaños. Canjéala en tienda o aplicación móvil. Tu balance actual de Stars: 340 Stars. ¡Te faltan 110 Stars para tu próxima recompensa!',
    category: 'oferta-promocional',
  },
  {
    id: 'paypal-payment-001',
    title: 'PayPal - Confirmación de Pago Office365',
    content:
      'De: service@paypal.com. Asunto: Enviaste un pago a Microsoft Corporation. Enviaste $12.99 USD a Microsoft Corporation (microsoft@service.microsoft.com). ID de transacción: 8XY123456789ABC. Fecha: 9 de diciembre, 2024. Para: Suscripción Anual Microsoft 365 Personal. Fuente de financiamiento: Cuenta corriente Bank of America. Tarifa de transacción: $0.00. ¡Gracias por usar PayPal!',
    category: 'cargo-suscripcion',
  },
  {
    id: 'wells-fargo-transfer-001',
    title: 'Wells Fargo - Confirmación de Transferencia',
    content:
      'De: alerts@wellsfargo.com. Asunto: Transferencia completada exitosamente. Tu transferencia ha sido completada. Desde: Wells Fargo Cuenta Corriente (...4567). Hacia: Wells Fargo Cuenta de Ahorros (...8901). Monto: $2,500.00. Fecha: 11 de diciembre, 2024 a la 1:23 PM. Número de confirmación: WF789456123. Tu nuevo saldo en cuenta corriente: $3,247.18. Tu nuevo saldo en ahorros: $15,750.00.',
    category: 'transferencia-bancaria',
  },
  {
    id: 'amazon-prime-renewal-001',
    title: 'Amazon Prime - Renovación de Membresía',
    content:
      'De: account-update@amazon.com. Asunto: Tu membresía Prime ha sido renovada. Hola, tu membresía de Amazon Prime ha sido renovada automáticamente. Fecha de renovación: 5 de diciembre, 2024. Próxima renovación: 5 de diciembre, 2025. Monto cobrado: $139.00. Método de pago: Chase Visa terminada en 2468. Beneficios: Envío gratis, Prime Video, Prime Music, ofertas exclusivas. Administra tu membresía en amazon.com/prime.',
    category: 'cargo-suscripcion',
  },
  {
    id: 'apple-purchase-001',
    title: 'Apple App Store - Recibo de Compra',
    content:
      'De: do_not_reply@itunes.com. Asunto: Tu recibo de Apple. Gracias por tu compra en la App Store. Fecha: 7 de diciembre, 2024. Número de orden: ML6Q2XY7Z9. Vendido a: Juan Pérez, Seattle, WA 98101. Artículo: App Procreate. Precio: $12.99. Método de pago: Apple Card terminada en 4321. Total: $12.99. Este recibo es para tus registros.',
    category: 'comprobante-compra',
  },
  {
    id: 'uber-trip-001',
    title: 'Uber - Recibo de Viaje Centro Seattle',
    content:
      'De: receipts@uber.com. Asunto: Viaje con Uber completado. ¡Gracias por viajar con Uber! Fecha del viaje: 12 de diciembre, 2024 a las 8:45 AM. Desde: 1201 3rd Ave, Seattle WA (Centro). Hacia: Aeropuerto Seattle-Tacoma (SEA). Distancia: 14.2 millas. Tiempo: 23 minutos. UberX con María (conductora 5 estrellas). Tarifa base: $18.75. Distancia: $8.52. Tiempo: $4.20. Total: $31.47. Pago: Visa terminada en 7890.',
    category: 'transporte',
  },
];
