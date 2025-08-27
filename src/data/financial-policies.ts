import { FinancialPolicy } from '../types/rag';

/**
 * Company Financial Policies Database (Simulated)
 * En un entorno real, estos vendrían de documentos PDF, wikis, o bases de datos
 */
export const FINANCIAL_POLICIES: Omit<FinancialPolicy, 'embedding'>[] = [
  {
    id: 'expense-001',
    title: 'Gastos de Oficina - Límites y Aprobaciones',
    content:
      'Gastos de oficina hasta $500 USD requieren aprobación del supervisor directo. Gastos entre $500-$2000 requieren aprobación del gerente. Gastos superiores a $2000 requieren aprobación del director financiero y justificación detallada.',
    category: 'expense-limits',
  },
  {
    id: 'vendor-001',
    title: 'Pagos a Proveedores - Términos y Plazos',
    content:
      'Todos los pagos a proveedores deben procesarse dentro de 30 días calendario. Pagos superiores a $5000 requieren verificación de tres cotizaciones. Proveedores nuevos deben pasar verificación de compliance antes del primer pago.',
    category: 'vendor-payments',
  },
  {
    id: 'travel-001',
    title: 'Reembolsos de Viaje - Documentación Requerida',
    content:
      'Reembolsos de viaje requieren recibos originales y justificación de negocio. Hospedaje no puede exceder $200 USD por noche sin aprobación previa. Comidas están limitadas a $75 USD por día. Vuelos deben ser clase económica salvo excepciones ejecutivas.',
    category: 'travel-reimbursement',
  },
  {
    id: 'subscription-001',
    title: 'Suscripciones de Software - Renovación y Cancelación',
    content:
      'Suscripciones de software deben renovarse anualmente con aprobación del departamento de TI. Herramientas duplicadas deben consolidarse. Suscripciones no utilizadas por más de 3 meses deben cancelarse. Nuevas herramientas requieren evaluación de seguridad.',
    category: 'subscriptions',
  },
  {
    id: 'budgetapproval-001',
    title: 'Aprobaciones de Presupuesto - Jerarquía de Autorización',
    content:
      'Supervisores pueden aprobar hasta $1000. Gerentes hasta $5000. Directores hasta $20000. VP y superiores para montos mayores. Presupuestos trimestrales requieren aprobación del comité ejecutivo. Desviaciones >10% requieren re-aprobación.',
    category: 'budget-approval',
  },
  {
    id: 'emergency-001',
    title: 'Gastos de Emergencia - Proceso Excepcional',
    content:
      'Gastos de emergencia pueden autorizarse retroactivamente. Documentación debe enviarse dentro de 48 horas. Definición de emergencia: seguridad, continuidad operacional, compliance legal. Limite de $3000 sin aprobación previa del CFO.',
    category: 'emergency-expenses',
  },
  {
    id: 'international-001',
    title: 'Transacciones Internacionales - Compliance y Cambio',
    content:
      'Transacciones internacionales >$10000 requieren reporte a compliance. Tipo de cambio debe fijarse al momento de aprobación. Pagos en moneda extranjera requieren hedging para montos >$50000. Verificar sanciones OFAC antes de cualquier pago.',
    category: 'international',
  },
  {
    id: 'audit-001',
    title: 'Documentación para Auditoría - Retención y Acceso',
    content:
      'Todos los comprobantes deben conservarse por 7 años. Facturas digitales son aceptables con certificación. Sistema debe permitir acceso de auditores externos. Backups de documentos financieros deben mantenerse en ubicación segura separada.',
    category: 'audit-compliance',
  },
];
