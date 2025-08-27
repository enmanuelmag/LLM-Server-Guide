/**
 * 🛡️ OpenAI Moderation API - Practical Examples
 * 
 * Este archivo contiene ejemplos prácticos de cómo usar el servicio de moderación
 * en diferentes escenarios del mundo real.
 */

import { ModerationService } from '../services/ModerationService';

// Inicializar el servicio
const moderationService = new ModerationService();

/**
 * Ejemplo 1: Moderación Básica de Comentarios
 */
export async function moderateUserComment(comment: string) {
  console.log('🔍 Moderando comentario de usuario...');
  
  const result = await moderationService.moderateText(comment);
  const analysis = moderationService.analyzeModeration(result);
  
  console.log(`📊 Resultado: ${result.flagged ? '🚫 BLOQUEADO' : '✅ APROBADO'}`);
  console.log(`🎯 Nivel de riesgo: ${analysis.risk_level.toUpperCase()}`);
  console.log(`💡 Recomendación: ${analysis.recommendation}`);
  
  return {
    approved: !result.flagged,
    riskLevel: analysis.risk_level,
    recommendation: analysis.recommendation
  };
}

/**
 * Ejemplo 2: Sistema de Filtrado de Contenido por Lotes
 */
export async function batchContentFilter(contents: string[]) {
  console.log(`🔄 Procesando ${contents.length} elementos por lotes...`);
  
  const results = await moderationService.moderateTextBatch(contents);
  const flaggedIndices: number[] = [];
  const safeContent: string[] = [];
  
  results.forEach((result, index) => {
    if (result.flagged) {
      flaggedIndices.push(index);
      console.log(`🚫 Contenido ${index + 1} bloqueado: ${contents[index].substring(0, 50)}...`);
    } else {
      safeContent.push(contents[index]);
      console.log(`✅ Contenido ${index + 1} aprobado`);
    }
  });
  
  return {
    totalProcessed: contents.length,
    approved: safeContent.length,
    blocked: flaggedIndices.length,
    safeContent,
    flaggedIndices
  };
}

/**
 * Ejemplo 3: Moderación Completa de Emails
 */
export async function moderateEmailContent(subject: string, body: string) {
  console.log('📧 Analizando email completo...');
  
  const result = await moderationService.moderateEmail(subject, body);
  const subjectAnalysis = moderationService.analyzeModeration(result.subject);
  const bodyAnalysis = moderationService.analyzeModeration(result.body);
  
  console.log('📬 Resultados de moderación:');
  console.log(`   Asunto: ${result.subject.flagged ? '🚫' : '✅'} (${subjectAnalysis.risk_level})`);
  console.log(`   Contenido: ${result.body.flagged ? '🚫' : '✅'} (${bodyAnalysis.risk_level})`);
  console.log(`   Email seguro: ${result.overall_safe ? '✅' : '🚫'}`);
  
  // Decisión automática
  let action = 'approve';
  if (!result.overall_safe) {
    if (subjectAnalysis.risk_level === 'high' || bodyAnalysis.risk_level === 'high') {
      action = 'block';
    } else {
      action = 'review';
    }
  }
  
  console.log(`🎯 Acción recomendada: ${action.toUpperCase()}`);
  
  return {
    safe: result.overall_safe,
    action,
    subjectRisk: subjectAnalysis.risk_level,
    bodyRisk: bodyAnalysis.risk_level,
    details: {
      subject: result.subject,
      body: result.body,
      analyses: { subject: subjectAnalysis, body: bodyAnalysis }
    }
  };
}

/**
 * Ejemplo 4: Sistema de Alertas Inteligente
 */
export async function smartAlertSystem(content: string) {
  const result = await moderationService.moderateText(content);
  const analysis = moderationService.analyzeModeration(result);
  
  // Generar alerta según el nivel de riesgo
  const alerts = [];
  
  if (result.flagged) {
    alerts.push({
      level: 'HIGH',
      message: 'Contenido flagged por OpenAI Moderation API',
      categories: result.flagged_categories,
      action: 'immediate_review'
    });
  }
  
  if (analysis.risk_level === 'high') {
    alerts.push({
      level: 'HIGH',
      message: 'Contenido de alto riesgo detectado',
      score: result.highest_scores[0]?.score,
      action: 'block_and_escalate'
    });
  }
  
  if (analysis.risk_level === 'medium' && result.highest_scores[0]?.score > 0.4) {
    alerts.push({
      level: 'MEDIUM',
      message: 'Contenido requiere revisión manual',
      concerns: analysis.primary_concerns,
      action: 'queue_for_review'
    });
  }
  
  return {
    contentSafe: analysis.risk_level === 'low' && !result.flagged,
    alerts,
    riskScore: result.highest_scores[0]?.score || 0,
    recommendation: analysis.recommendation
  };
}

/**
 * Ejemplo 5: Dashboard de Estadísticas
 */
export async function generateModerationStats(contents: string[]) {
  console.log('📊 Generando estadísticas de moderación...');
  
  const results = await moderationService.moderateTextBatch(contents);
  const analyses = results.map(r => moderationService.analyzeModeration(r));
  
  const stats = {
    total: results.length,
    flagged: results.filter(r => r.flagged).length,
    byRiskLevel: {
      low: analyses.filter(a => a.risk_level === 'low').length,
      medium: analyses.filter(a => a.risk_level === 'medium').length,
      high: analyses.filter(a => a.risk_level === 'high').length
    },
    topCategories: {} as Record<string, number>,
    averageScore: 0
  };
  
  // Calcular categorías más comunes
  results.forEach(result => {
    result.flagged_categories.forEach(category => {
      stats.topCategories[category] = (stats.topCategories[category] || 0) + 1;
    });
  });
  
  // Calcular score promedio
  const totalScore = results.reduce((sum, r) => sum + (r.highest_scores[0]?.score || 0), 0);
  stats.averageScore = totalScore / results.length;
  
  console.log('📈 Estadísticas generadas:');
  console.log(`   Total procesado: ${stats.total}`);
  console.log(`   Contenido flagged: ${stats.flagged} (${((stats.flagged/stats.total)*100).toFixed(1)}%)`);
  console.log(`   Riesgo bajo: ${stats.byRiskLevel.low}`);
  console.log(`   Riesgo medio: ${stats.byRiskLevel.medium}`);
  console.log(`   Riesgo alto: ${stats.byRiskLevel.high}`);
  console.log(`   Score promedio: ${(stats.averageScore * 100).toFixed(2)}%`);
  
  return stats;
}

// Ejemplo de datos de prueba
export const SAMPLE_DATA = {
  safeComments: [
    "¡Excelente producto! Lo recomiendo totalmente.",
    "Gracias por el gran servicio al cliente.",
    "La entrega fue rápida y el producto llegó en perfectas condiciones.",
    "Me encanta la calidad de este producto.",
    "El equipo de soporte fue muy útil y profesional."
  ],
  
  riskyComments: [
    "Odio este producto, es una pérdida de tiempo total.",
    "El servicio al cliente es horrible, nunca más compraré aquí.",
    "Esta empresa no sabe lo que hace, son incompetentes.",
    "Estoy muy frustrado con este servicio.",
    "No puedo creer lo mal que funciona esto."
  ],
  
  emails: {
    marketing: {
      subject: "🎉 ¡Oferta especial solo para ti!",
      body: "Hola! Te tenemos una oferta increíble en nuestros productos más populares. ¡No te la pierdas!"
    },
    spam: {
      subject: "URGENTE: Reclama tu premio AHORA",
      body: "¡Felicidades! Has ganado $1,000,000. Haz clic aquí INMEDIATAMENTE para reclamar tu premio antes de que expire."
    },
    support: {
      subject: "Actualización de tu ticket de soporte #12345",
      body: "Hemos revisado tu consulta y nuestro equipo técnico está trabajando en una solución. Te contactaremos pronto."
    }
  }
};
