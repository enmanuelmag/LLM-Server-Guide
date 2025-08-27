/**
 * 🧪 Manual Test - OpenAI Moderation API
 * 
 * Script para probar manualmente todas las funcionalidades
 * de moderación implementadas.
 * 
 * Uso: npm run test:moderation
 */

import { ModerationService } from '../services/ModerationService';
import { 
  moderateUserComment, 
  batchContentFilter, 
  moderateEmailContent,
  smartAlertSystem,
  generateModerationStats,
  SAMPLE_DATA 
} from '../examples/moderation-examples';

async function runModerationTests() {
  console.log('🛡️  INICIANDO TESTS DE MODERACIÓN DE OPENAI API');
  console.log('=' .repeat(60));

  const moderationService = new ModerationService();

  try {
    // Test 1: Moderación básica
    console.log('\n📝 TEST 1: Moderación de texto básico');
    console.log('-'.repeat(40));
    
    const safeText = "Hello! This is a friendly message.";
    const result1 = await moderationService.moderateText(safeText);
    console.log(`Texto: "${safeText}"`);
    console.log(`Resultado: ${result1.flagged ? 'FLAGGED' : 'SAFE'}`);
    console.log(`Score más alto: ${(result1.highest_scores[0]?.score * 100 || 0).toFixed(2)}%`);

    // Test 2: Análisis de riesgo
    console.log('\n🎯 TEST 2: Análisis de riesgo');
    console.log('-'.repeat(40));
    
    const analysis = moderationService.analyzeModeration(result1);
    console.log(`Nivel de riesgo: ${analysis.risk_level}`);
    console.log(`Recomendación: ${analysis.recommendation}`);

    // Test 3: Moderación por lotes
    console.log('\n📦 TEST 3: Moderación por lotes');
    console.log('-'.repeat(40));
    
    const testTexts = [
      ...SAMPLE_DATA.safeComments.slice(0, 3),
      ...SAMPLE_DATA.riskyComments.slice(0, 2)
    ];
    
    const batchResults = await moderationService.moderateTextBatch(testTexts);
    console.log(`Procesados: ${batchResults.length} textos`);
    console.log(`Flagged: ${batchResults.filter(r => r.flagged).length}`);
    console.log(`Safe: ${batchResults.filter(r => !r.flagged).length}`);

    // Test 4: Moderación de email
    console.log('\n📧 TEST 4: Moderación de email');
    console.log('-'.repeat(40));
    
    const email = SAMPLE_DATA.emails.marketing;
    const emailResult = await moderationService.moderateEmail(email.subject, email.body);
    console.log(`Subject flagged: ${emailResult.subject.flagged}`);
    console.log(`Body flagged: ${emailResult.body.flagged}`);
    console.log(`Overall safe: ${emailResult.overall_safe}`);

    // Test 5: Ejemplos prácticos
    console.log('\n🛠️  TEST 5: Ejemplos prácticos');
    console.log('-'.repeat(40));
    
    // Comentario de usuario
    console.log('\n👤 Moderando comentario de usuario:');
    await moderateUserComment("This product is amazing! Love it!");

    // Filtrado por lotes
    console.log('\n🔄 Filtrado por lotes:');
    const batchResult = await batchContentFilter(SAMPLE_DATA.safeComments.slice(0, 3));
    console.log(`Resultado: ${batchResult.approved} aprobados, ${batchResult.blocked} bloqueados`);

    // Email completo
    console.log('\n📮 Moderación de email:');
    await moderateEmailContent(
      SAMPLE_DATA.emails.support.subject, 
      SAMPLE_DATA.emails.support.body
    );

    // Sistema de alertas
    console.log('\n🚨 Sistema de alertas:');
    const alertResult = await smartAlertSystem("I love this product!");
    console.log(`Contenido seguro: ${alertResult.contentSafe}`);
    console.log(`Alertas generadas: ${alertResult.alerts.length}`);

    // Estadísticas
    console.log('\n📊 Estadísticas de moderación:');
    const stats = await generateModerationStats(SAMPLE_DATA.safeComments);
    console.log(`Stats generadas para ${stats.total} elementos`);

    console.log('\n✅ TODOS LOS TESTS COMPLETADOS EXITOSAMENTE');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ ERROR EN TESTS:', error);
    console.log('=' .repeat(60));
  }
}

// Función para probar categorías
async function testCategories() {
  console.log('\n🏷️  INFORMACIÓN DE CATEGORÍAS');
  console.log('-'.repeat(40));
  
  const categories = {
    harassment: 'Contenido de acoso hacia cualquier objetivo',
    'harassment/threatening': 'Acoso que incluye violencia o daño grave',
    hate: 'Contenido que promueve odio basado en raza, género, etc.',
    'hate/threatening': 'Contenido de odio que incluye violencia',
    'self-harm': 'Contenido que promueve actos de autolesión',
    'self-harm/intent': 'Expresión de intención de autolesión',
    'self-harm/instructions': 'Instrucciones para actos de autolesión',
    sexual: 'Contenido destinado a excitación sexual',
    'sexual/minors': 'Contenido sexual que incluye menores de edad',
    violence: 'Contenido que representa muerte, violencia o lesiones',
    'violence/graphic': 'Violencia representada gráficamente'
  };

  Object.entries(categories).forEach(([category, description]) => {
    console.log(`📋 ${category}: ${description}`);
  });
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runModerationTests()
    .then(() => testCategories())
    .then(() => {
      console.log('\n🎓 ¡Workshop de Moderación Completado!');
      console.log('Ahora estás listo para implementar moderación de contenido en tus aplicaciones.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error en tests:', error);
      process.exit(1);
    });
}

export { runModerationTests, testCategories };
