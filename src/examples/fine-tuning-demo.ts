import { FineTuningService } from '../services/FineTuningService.js';
import { EmailClassificationRequest } from '../types/fine-tuning.js';
import { Logger } from '../utils/logger.js';

/**
 * Demostración completa del uso del FineTuningService
 *
 * Este ejemplo muestra todas las funcionalidades necesarias para
 * la certificación OpenAI Practitioner en el módulo de Fine-tuning:
 *
 * ✅ Preparación de datasets
 * ✅ Creación de jobs de fine-tuning
 * ✅ Monitoreo y métricas
 * ✅ Evaluación de modelos
 * ✅ Gestión del ciclo de vida
 */
async function demonstrateFineTuning(): Promise<void> {
  Logger.info('🎯 DEMOSTRACIÓN COMPLETA DE FINE-TUNING CON OPENAI SDK');
  Logger.info('='.repeat(80));

  try {
    // Inicializar servicio
    const fineTuningService = new FineTuningService();

    // OPCIÓN 1: Ejecutar workflow completo automatizado
    Logger.info('\n🚀 OPCIÓN 1: Workflow Completo Automatizado');
    Logger.info('-'.repeat(50));

    // Descomenta la siguiente línea para ejecutar todo el proceso
    // const modelId = await fineTuningService.executeCompleteWorkflow();
    // Logger.info(`✅ Proceso completo finalizado. Modelo: ${modelId}`);

    // OPCIÓN 2: Paso a paso manual (para entendimiento detallado)
    Logger.info('\n🔧 OPCIÓN 2: Demostración Paso a Paso');
    Logger.info('-'.repeat(50));

    // Paso 1: Preparar dataset
    Logger.info('\n📊 Preparando dataset...');
    const { trainingPath, validationPath } =
      await fineTuningService.prepareDataset();
    Logger.info(
      `✅ Archivos creados:\n  - Training: ${trainingPath}\n  - Validation: ${validationPath}`
    );

    // Paso 2: Listar modelos existentes
    Logger.info('\n📋 Listando modelos fine-tuned existentes...');
    await fineTuningService.listFineTunedModels();

    // Paso 3: Simular uso de un modelo (sin entrenar realmente)
    Logger.info('\n🧪 Simulando clasificación de emails...');

    const testEmails: EmailClassificationRequest[] = [
      {
        emailSubject: 'Invoice #12345 - Payment Due',
        emailBody:
          'Your invoice for $1,500.00 is now due. Please process payment within 30 days. Reference: INV-2024-001',
        sender: 'billing@techcorp.com',
      },
      {
        emailSubject: 'Weekly Team Meeting',
        emailBody:
          'Reminder: Our weekly team sync is scheduled for tomorrow at 2 PM in Conference Room A. Please review the agenda attached.',
        sender: 'manager@company.com',
      },
      {
        emailSubject: 'Hotel Booking Confirmation',
        emailBody:
          'Your reservation at Downtown Marriott is confirmed. Total: $450.00 for 2 nights. Check-in: March 15th.',
        sender: 'noreply@marriott.com',
      },
      {
        emailSubject: 'Marketing Newsletter - March 2024',
        emailBody:
          'Check out our latest product updates, industry insights, and upcoming webinars. Subscribe for weekly updates!',
        sender: 'newsletter@startup.com',
      },
    ];

    // Simular clasificación con modelo base (disponible inmediatamente)
    Logger.info('\n🤖 Clasificando emails con modelo base (gpt-3.5-turbo)...');
    for (let i = 0; i < testEmails.length; i++) {
      const email = testEmails[i];
      Logger.info(`\n📧 Email ${i + 1}: "${email.emailSubject}"`);

      try {
        // Nota: En una implementación real, usarías el modelo fine-tuned aquí
        // const result = await fineTuningService.classifyEmailWithFineTunedModel(modelId, email);

        // Por ahora, mostramos cómo se vería la estructura de respuesta
        const mockResult = {
          isFinancial:
            email.emailSubject.toLowerCase().includes('invoice') ||
            email.emailSubject.toLowerCase().includes('payment') ||
            email.emailBody.includes('$'),
          confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
          category: email.emailBody.includes('$')
            ? 'financial-transaction'
            : 'non-financial',
          reasoning: `Email analizado por contenido financiero: ${email.emailBody.substring(
            0,
            50
          )}...`,
          extractedAmount: email.emailBody.match(/\$[\d,]+\.?\d*/)?.[0]
            ? {
                value: parseFloat(
                  email.emailBody
                    .match(/\$[\d,]+\.?\d*/)![0]
                    .replace('$', '')
                    .replace(',', '')
                ),
                currency: 'USD',
              }
            : undefined,
        };

        Logger.info(
          `  📊 Resultado: ${
            mockResult.isFinancial ? '💰 Financiero' : '📝 No financiero'
          }`
        );
        Logger.info(`  🎯 Categoría: ${mockResult.category}`);
        Logger.info(
          `  📈 Confianza: ${(mockResult.confidence * 100).toFixed(1)}%`
        );
        if (mockResult.extractedAmount) {
          Logger.info(
            `  💵 Monto: ${mockResult.extractedAmount.currency} ${mockResult.extractedAmount.value}`
          );
        }
        Logger.info(`  💭 Razón: ${mockResult.reasoning}`);
      } catch (error) {
        Logger.error(`❌ Error clasificando email ${i + 1}:`, error);
      }
    }

    // INFORMACIÓN EDUCATIVA SOBRE EL PROCESO
    Logger.info('\n📚 INFORMACIÓN EDUCATIVA - PROCESO COMPLETO DE FINE-TUNING');
    Logger.info('='.repeat(80));

    Logger.info(`
🔧 PREPARACIÓN DEL DATASET:
   • Formato JSONL con estructura de mensajes (system, user, assistant)
   • División en entrenamiento (80%) y validación (20%)
   • Validación de estructura y longitud de contenido
   • Mínimo recomendado: 50-100 ejemplos de calidad

💾 SUBIDA DE ARCHIVOS:
   • Archivos convertidos a formato compatible con OpenAI
   • Uso de File API para subida correcta
   • Archivos de validación opcionales pero recomendados

⚙️ CONFIGURACIÓN DEL JOB:
   • Modelo base: gpt-3.5-turbo-1106 (recomendado)
   • Hiperparámetros:
     - n_epochs: 3 (1-50, auto por defecto)
     - batch_size: 1 (auto o potencias de 2)
     - learning_rate_multiplier: 0.1 (0.02-2.0)
   • Sufijo personalizado para identificación

📊 MONITOREO Y MÉTRICAS:
   • Polling del estado del job cada 30 segundos
   • Eventos de progreso en tiempo real
   • Descarga de archivos de resultados con métricas
   • Training/validation loss tracking

🧪 EVALUACIÓN:
   • Comparación con modelo base
   • Métricas de precisión y recall
   • Análisis de mejora porcentual
   • Casos de prueba específicos del dominio

🔄 GESTIÓN DEL CICLO DE VIDA:
   • Listado de modelos fine-tuned
   • Información de creación y propietario
   • Eliminación de modelos obsoletos
   • Control de costos y recursos
    `);

    Logger.info('\n💡 PRÓXIMOS PASOS PARA FINE-TUNING REAL:');
    Logger.info(`
1. Configurar variable de entorno OPENAI_API_KEY
2. Descomentar la línea del workflow completo
3. Ejecutar: npm run dev
4. Esperar completar el entrenamiento (~10-30 minutos)
5. Usar el modelo resultante para predicciones en producción

💰 CONSIDERACIONES DE COSTO:
• Fine-tuning: ~$0.008 por 1K tokens de entrenamiento
• Uso del modelo: ~$0.012 por 1K tokens (vs $0.002 del base)
• Archivos de entrenamiento se almacenan por 30 días
    `);

    Logger.info('\n✅ DEMOSTRACIÓN COMPLETA FINALIZADA');
    Logger.info('='.repeat(80));
  } catch (error) {
    Logger.error('❌ Error en la demostración:', error);

    if (error instanceof Error) {
      if (error.message.includes('OPENAI_API_KEY')) {
        Logger.info('\n💡 SOLUCIÓN: Configura tu API key de OpenAI:');
        Logger.info('   1. Crea un archivo .env en la raíz del proyecto');
        Logger.info('   2. Agrega: OPENAI_API_KEY=tu_api_key_aqui');
        Logger.info(
          '   3. Obtén tu API key en: https://platform.openai.com/api-keys'
        );
      }
    }
  }
}

/**
 * Función auxiliar para mostrar información sobre fine-tuning
 */
async function showFineTuningInfo(): Promise<void> {
  Logger.info('📋 INFORMACIÓN SOBRE FINE-TUNING PARA CERTIFICACIÓN OPENAI');
  Logger.info('='.repeat(80));

  const topics = [
    {
      title: '🎯 ¿Cuándo usar Fine-tuning?',
      content: `
• Mejorar rendimiento en tareas específicas del dominio
• Cuando pocos ejemplos en el prompt no son suficientes
• Para generar respuestas más consistentes y estructuradas
• Reducir latencia eliminando ejemplos largos del prompt
• Personalizar el comportamiento del modelo para casos de uso específicos`,
    },
    {
      title: '📊 Preparación de Datos',
      content: `
• Formato JSONL con conversaciones de ejemplo
• Mínimo 10 ejemplos, recomendado 50-100 de alta calidad
• Estructura: {"messages": [{"role": "system/user/assistant", "content": "..."}]}
• Longitud máxima: 4,096 tokens por ejemplo
• División train/validation recomendada: 80/20`,
    },
    {
      title: '⚙️ Configuración de Hiperparámetros',
      content: `
• n_epochs: Número de pasadas por el dataset (1-50, auto por defecto)
• batch_size: Tamaño del lote (auto, 1, 2, 4, 8, 16)
• learning_rate_multiplier: Control de velocidad de aprendizaje (0.02-2.0)
• Validation split automático si no se proporciona archivo de validación`,
    },
    {
      title: '📈 Métricas y Evaluación',
      content: `
• Training loss: Disminución indica aprendizaje
• Validation loss: Previene overfitting
• Accuracy: Comparación con modelo base
• Custom metrics: Específicas del dominio (precision, recall, F1)
• A/B testing: Comparar modelos en producción`,
    },
    {
      title: '💰 Costos y Consideraciones',
      content: `
• Training: ~$0.008/1K tokens
• Usage: Precio superior al modelo base (~6x para GPT-3.5)
• Storage: Archivos se mantienen 30 días gratuito
• Tiempo: 10-30 minutos típico para datasets pequeños
• Límites: 3 jobs simultáneos, 50 modelos personalizados`,
    },
  ];

  for (const topic of topics) {
    Logger.info(`\n${topic.title}`);
    Logger.info('-'.repeat(50));
    Logger.info(topic.content);
  }

  Logger.info('\n🔗 RECURSOS ADICIONALES:');
  Logger.info(`
📖 Documentación oficial: https://platform.openai.com/docs/guides/fine-tuning
🛠️ Best practices: https://cookbook.openai.com/examples/fine-tuning_classification
📊 Pricing: https://openai.com/pricing
🎓 Fine-tuning guide: https://platform.openai.com/docs/guides/fine-tuning/preparing-your-dataset
  `);
}

// Función principal
async function main(): Promise<void> {
  try {
    // Mostrar información educativa primero
    await showFineTuningInfo();

    // Luego la demostración práctica
    await demonstrateFineTuning();
  } catch (error) {
    Logger.error('❌ Error en la aplicación:', error);
    process.exit(1);
  }
}

// Ejecutar solo si es el archivo principal
// En un entorno real, puedes ejecutar: node dist/examples/fine-tuning-demo.js
// main();

export { demonstrateFineTuning, showFineTuningInfo };
