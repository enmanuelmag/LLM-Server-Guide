import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { FINE_TUNING_DATASET } from '../data/fine-tuning-dataset.js';
import {
  FineTuningDataPoint,
  EmailClassificationRequest,
  EmailClassificationResult,
} from '../types/fine-tuning.js';
import { Logger } from '../utils/logger.js';

/**
 * FineTuningService - Comprehensive Fine-Tuning Implementation
 *
 * Esta clase demuestra el uso completo del SDK de OpenAI para fine-tuning,
 * cubriendo todos los aspectos necesarios para la certificación OpenAI Practitioner:
 *
 * 1. Preparación de datasets (formato JSONL)
 * 2. Subida de archivos de entrenamiento
 * 3. Creación y monitoreo de jobs de fine-tuning
 * 4. Evaluación y comparación de modelos
 * 5. Uso del modelo fine-tuned para predicciones
 * 6. Gestión del ciclo de vida del modelo
 */
export class FineTuningService {
  private client: OpenAI;
  private trainingFileName: string;
  private validationFileName: string;
  private modelName: string;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.trainingFileName = 'email-classification-training.jsonl';
    this.validationFileName = 'email-classification-validation.jsonl';
    this.modelName = 'email-classifier-v1';
  }

  /**
   * 1. PREPARACIÓN DEL DATASET
   * Convierte el dataset interno a formato JSONL requerido por OpenAI
   */
  async prepareDataset(): Promise<{
    trainingPath: string;
    validationPath: string;
  }> {
    Logger.info('🔧 Preparando dataset para fine-tuning...');

    // Dividir dataset en entrenamiento (80%) y validación (20%)
    const shuffledData = [...FINE_TUNING_DATASET].sort(
      () => 0.5 - Math.random()
    );
    const splitIndex = Math.floor(shuffledData.length * 0.8);

    const trainingData = shuffledData.slice(0, splitIndex);
    const validationData = shuffledData.slice(splitIndex);

    Logger.info(
      `📊 Dataset dividido: ${trainingData.length} entrenamiento, ${validationData.length} validación`
    );

    // Crear archivos JSONL
    const trainingPath = path.join(
      process.cwd(),
      'uploads',
      this.trainingFileName
    );
    const validationPath = path.join(
      process.cwd(),
      'uploads',
      this.validationFileName
    );

    await this.writeJSONL(trainingData, trainingPath);
    await this.writeJSONL(validationData, validationPath);

    // Validar formato del dataset
    await this.validateDataset(trainingData);

    Logger.info('✅ Dataset preparado correctamente');
    return { trainingPath, validationPath };
  }

  /**
   * Escribe datos en formato JSONL
   */
  private async writeJSONL(
    data: FineTuningDataPoint[],
    filePath: string
  ): Promise<void> {
    const jsonlContent = data.map((item) => JSON.stringify(item)).join('\n');

    await fs.writeFile(filePath, jsonlContent, 'utf-8');
    Logger.info(`📝 Archivo JSONL creado: ${filePath}`);
  }

  /**
   * Valida que el dataset cumpla con los requisitos de OpenAI
   */
  private async validateDataset(data: FineTuningDataPoint[]): Promise<void> {
    Logger.info('🔍 Validando formato del dataset...');

    for (let i = 0; i < data.length; i++) {
      const item = data[i];

      // Verificar estructura de mensajes
      if (!item.messages || !Array.isArray(item.messages)) {
        throw new Error(`Item ${i}: messages debe ser un array`);
      }

      // Verificar roles requeridos
      const roles = item.messages.map((m) => m.role);
      if (
        !roles.includes('system') ||
        !roles.includes('user') ||
        !roles.includes('assistant')
      ) {
        throw new Error(
          `Item ${i}: debe incluir roles system, user y assistant`
        );
      }

      // Verificar longitud de contenido
      for (const message of item.messages) {
        if (message.content.length > 4000) {
          Logger.warn(
            `Item ${i}: mensaje muy largo (${message.content.length} chars)`
          );
        }
      }
    }

    Logger.info('✅ Dataset válido');
  }

  /**
   * 2. SUBIDA DE ARCHIVOS
   * Sube los archivos de entrenamiento a OpenAI
   */
  async uploadTrainingFiles(): Promise<{
    trainingFileId: string;
    validationFileId?: string;
  }> {
    Logger.info('📤 Subiendo archivos de entrenamiento...');

    const { trainingPath, validationPath } = await this.prepareDataset();

    // Subir archivo de entrenamiento
    const trainingFileBuffer = await fs.readFile(trainingPath);
    const trainingFile = await this.client.files.create({
      file: new File(
        [new Uint8Array(trainingFileBuffer)],
        this.trainingFileName,
        { type: 'application/jsonl' }
      ),
      purpose: 'fine-tune',
    });

    Logger.info(`✅ Archivo de entrenamiento subido: ${trainingFile.id}`);

    // Subir archivo de validación (opcional pero recomendado)
    let validationFileId: string | undefined;
    try {
      const validationFileBuffer = await fs.readFile(validationPath);
      const validationFile = await this.client.files.create({
        file: new File(
          [new Uint8Array(validationFileBuffer)],
          this.validationFileName,
          { type: 'application/jsonl' }
        ),
        purpose: 'fine-tune',
      });
      validationFileId = validationFile.id;
      Logger.info(`✅ Archivo de validación subido: ${validationFile.id}`);
    } catch (error) {
      Logger.warn('⚠️ No se pudo subir archivo de validación:', error);
    }

    return {
      trainingFileId: trainingFile.id,
      validationFileId,
    };
  }

  /**
   * 3. CREACIÓN DEL JOB DE FINE-TUNING
   * Crea y configura el job de fine-tuning con todos los parámetros importantes
   */
  async createFineTuningJob(): Promise<string> {
    Logger.info('🚀 Iniciando job de fine-tuning...');

    const { trainingFileId, validationFileId } =
      await this.uploadTrainingFiles();

    // Configuración completa del job
    const job = await this.client.fineTuning.jobs.create({
      training_file: trainingFileId,
      validation_file: validationFileId,
      model: 'gpt-3.5-turbo-1106', // Modelo base recomendado
      suffix: this.modelName, // Sufijo personalizado para identificar el modelo
      hyperparameters: {
        n_epochs: 3, // Número de epochs (1-50, default: auto)
        batch_size: 1, // Tamaño del batch (auto, o potencias de 2)
        learning_rate_multiplier: 0.1, // Multiplicador de learning rate (0.02-2.0)
      },
    });

    Logger.info(`✅ Job de fine-tuning creado: ${job.id}`);
    Logger.info(`📋 Configuración:`, {
      model: job.model,
      trainingFile: job.training_file,
      validationFile: job.validation_file,
      hyperparameters: job.hyperparameters,
    });

    return job.id;
  }

  /**
   * 4. MONITOREO DEL JOB
   * Monitorea el progreso del fine-tuning y maneja eventos
   */
  async monitorFineTuningJob(jobId: string): Promise<string> {
    Logger.info(`👀 Monitoreando job: ${jobId}`);

    let job = await this.client.fineTuning.jobs.retrieve(jobId);

    // Monitoreo con polling
    while (['validating_files', 'queued', 'running'].includes(job.status)) {
      Logger.info(`📊 Estado actual: ${job.status}`);

      if (job.status === 'running') {
        // Obtener eventos del job para ver el progreso
        const events = await this.client.fineTuning.jobs.listEvents(jobId, {
          limit: 10,
        });

        const latestEvent = events.data[0];
        if (latestEvent && latestEvent.message) {
          Logger.info(`📈 Progreso: ${latestEvent.message}`);
        }
      }

      // Esperar 30 segundos antes de verificar nuevamente
      await new Promise((resolve) => setTimeout(resolve, 30000));
      job = await this.client.fineTuning.jobs.retrieve(jobId);
    }

    if (job.status === 'succeeded') {
      Logger.info(`✅ Fine-tuning completado exitosamente!`);
      Logger.info(`🎯 Modelo resultante: ${job.fine_tuned_model}`);

      // Mostrar métricas finales si están disponibles
      if (job.result_files && job.result_files.length > 0) {
        await this.downloadResultFiles(job.result_files);
      }

      return job.fine_tuned_model!;
    } else {
      throw new Error(`Fine-tuning falló con estado: ${job.status}`);
    }
  }

  /**
   * Descarga y analiza archivos de resultados del fine-tuning
   */
  private async downloadResultFiles(fileIds: string[]): Promise<void> {
    Logger.info('📥 Descargando archivos de resultados...');

    for (const fileId of fileIds) {
      try {
        const file = await this.client.files.retrieve(fileId);
        const content = await this.client.files.content(fileId);

        const resultsPath = path.join(
          process.cwd(),
          'uploads',
          `results-${fileId}.jsonl`
        );
        const buffer = await content.arrayBuffer();
        await fs.writeFile(resultsPath, Buffer.from(buffer));

        Logger.info(`📊 Archivo de resultados descargado: ${resultsPath}`);

        // Analizar métricas si es posible
        await this.analyzeResults(resultsPath);
      } catch (error) {
        Logger.warn(`⚠️ No se pudo descargar archivo ${fileId}:`, error);
      }
    }
  }

  /**
   * Analiza métricas de los archivos de resultados
   */
  private async analyzeResults(filePath: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter((line) => line.trim());

      let trainingLoss: number[] = [];
      let validationLoss: number[] = [];

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.type === 'metrics') {
            if (data.data.train_loss !== undefined) {
              trainingLoss.push(data.data.train_loss);
            }
            if (data.data.valid_loss !== undefined) {
              validationLoss.push(data.data.valid_loss);
            }
          }
        } catch (e) {
          // Ignorar líneas que no son JSON válido
        }
      }

      if (trainingLoss.length > 0) {
        const finalTrainingLoss = trainingLoss[trainingLoss.length - 1];
        Logger.info(`📉 Training Loss final: ${finalTrainingLoss.toFixed(4)}`);
      }

      if (validationLoss.length > 0) {
        const finalValidationLoss = validationLoss[validationLoss.length - 1];
        Logger.info(
          `📉 Validation Loss final: ${finalValidationLoss.toFixed(4)}`
        );
      }
    } catch (error) {
      Logger.warn('⚠️ No se pudo analizar archivo de resultados:', error);
    }
  }

  /**
   * 5. USO DEL MODELO FINE-TUNED
   * Utiliza el modelo entrenado para hacer predicciones
   */
  async classifyEmailWithFineTunedModel(
    modelId: string,
    emailData: EmailClassificationRequest
  ): Promise<EmailClassificationResult> {
    Logger.info(`🤖 Clasificando email con modelo: ${modelId}`);

    const systemPrompt =
      'Clasifica si este email contiene información de transacciones financieras y extrae detalles relevantes.';
    const userPrompt = `Subject: ${emailData.emailSubject}\nBody: ${emailData.emailBody}`;

    const completion = await this.client.chat.completions.create({
      model: modelId,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1, // Baja temperatura para consistencia
      max_tokens: 500,
    });

    const response = completion.choices[0].message?.content;
    if (!response) {
      throw new Error('No se recibió respuesta del modelo');
    }

    try {
      const result: EmailClassificationResult = JSON.parse(response);
      Logger.info('✅ Clasificación completada:', result);
      return result;
    } catch (error) {
      Logger.error('❌ Error parseando respuesta del modelo:', response);
      throw new Error('Formato de respuesta inválido del modelo fine-tuned');
    }
  }

  /**
   * 6. COMPARACIÓN CON MODELO BASE
   * Compara el rendimiento del modelo fine-tuned vs modelo base
   */
  async compareModels(fineTunedModelId: string): Promise<void> {
    Logger.info('📊 Comparando modelo fine-tuned vs modelo base...');

    // Usar datos de validación para comparar
    const { validationPath } = await this.prepareDataset();
    const validationContent = await fs.readFile(validationPath, 'utf-8');
    const validationData = validationContent
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line) as FineTuningDataPoint)
      .slice(0, 5); // Solo usar 5 ejemplos para demo

    let baseModelCorrect = 0;
    let fineTunedModelCorrect = 0;

    for (let i = 0; i < validationData.length; i++) {
      const testCase = validationData[i];
      const userMessage = testCase.messages.find(
        (m) => m.role === 'user'
      )?.content;
      const expectedResponse = testCase.messages.find(
        (m) => m.role === 'assistant'
      )?.content;

      if (!userMessage || !expectedResponse) continue;

      try {
        // Extraer subject y body del user message
        const lines = userMessage.split('\n');
        const subjectLine = lines.find((l) => l.startsWith('Subject:'));
        const bodyStart = lines.findIndex((l) => l.startsWith('Body:'));

        if (!subjectLine || bodyStart === -1) continue;

        const emailData: EmailClassificationRequest = {
          emailSubject: subjectLine.replace('Subject:', '').trim(),
          emailBody: lines
            .slice(bodyStart + 1)
            .join('\n')
            .replace('Body:', '')
            .trim(),
        };

        // Probar modelo base
        const baseResult = await this.classifyEmailWithBaseModel(emailData);
        const fineTunedResult = await this.classifyEmailWithFineTunedModel(
          fineTunedModelId,
          emailData
        );

        // Evaluar correctitud (simplificado - en producción sería más sofisticado)
        const expectedData = JSON.parse(expectedResponse);

        if (baseResult.isFinancial === expectedData.isFinancial) {
          baseModelCorrect++;
        }

        if (fineTunedResult.isFinancial === expectedData.isFinancial) {
          fineTunedModelCorrect++;
        }

        Logger.info(`Caso ${i + 1}:`);
        Logger.info(
          `  Base: ${baseResult.isFinancial} (confianza: ${baseResult.confidence})`
        );
        Logger.info(
          `  Fine-tuned: ${fineTunedResult.isFinancial} (confianza: ${fineTunedResult.confidence})`
        );
        Logger.info(`  Esperado: ${expectedData.isFinancial}`);
      } catch (error) {
        Logger.warn(`Error evaluando caso ${i + 1}:`, error);
      }
    }

    const baseAccuracy = baseModelCorrect / validationData.length;
    const fineTunedAccuracy = fineTunedModelCorrect / validationData.length;
    const improvement =
      ((fineTunedAccuracy - baseAccuracy) / baseAccuracy) * 100;

    Logger.info('\n📈 RESULTADOS DE COMPARACIÓN:');
    Logger.info(
      `🔹 Modelo Base - Precisión: ${(baseAccuracy * 100).toFixed(
        1
      )}% (${baseModelCorrect}/${validationData.length})`
    );
    Logger.info(
      `🔸 Modelo Fine-tuned - Precisión: ${(fineTunedAccuracy * 100).toFixed(
        1
      )}% (${fineTunedModelCorrect}/${validationData.length})`
    );
    Logger.info(`📊 Mejora: ${improvement.toFixed(1)}%`);
  }

  /**
   * Clasificación con modelo base para comparación
   */
  private async classifyEmailWithBaseModel(
    emailData: EmailClassificationRequest
  ): Promise<EmailClassificationResult> {
    const systemPrompt =
      'Clasifica si este email contiene información de transacciones financieras y extrae detalles relevantes.';
    const userPrompt = `Subject: ${emailData.emailSubject}\nBody: ${emailData.emailBody}`;

    const completion = await this.client.chat.completions.create({
      model: 'gpt-3.5-turbo-1106', // Modelo base
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 500,
    });

    const response = completion.choices[0].message?.content;
    if (!response) {
      throw new Error('No se recibió respuesta del modelo base');
    }

    try {
      return JSON.parse(response);
    } catch (error) {
      // Si el modelo base no devuelve JSON válido, crear respuesta default
      return {
        isFinancial: response.toLowerCase().includes('true'),
        confidence: 0.5,
        category: 'unknown',
        reasoning: 'Modelo base - formato no estructurado',
      };
    }
  }

  /**
   * 7. GESTIÓN DEL CICLO DE VIDA
   * Lista todos los modelos fine-tuned y permite gestión
   */
  async listFineTunedModels(): Promise<void> {
    Logger.info('📋 Listando modelos fine-tuned...');

    const models = await this.client.models.list();
    const fineTunedModels = models.data.filter(
      (model) => model.id.includes('ft:') && model.owned_by === 'user'
    );

    if (fineTunedModels.length === 0) {
      Logger.info('❌ No se encontraron modelos fine-tuned');
      return;
    }

    Logger.info(
      `✅ Se encontraron ${fineTunedModels.length} modelos fine-tuned:`
    );

    for (const model of fineTunedModels) {
      Logger.info(`  🎯 ${model.id}`);
      Logger.info(
        `     Creado: ${new Date(model.created * 1000).toISOString()}`
      );
      Logger.info(`     Propietario: ${model.owned_by}`);
    }
  }

  /**
   * Elimina un modelo fine-tuned
   */
  async deleteFineTunedModel(modelId: string): Promise<void> {
    Logger.info(`🗑️ Eliminando modelo: ${modelId}`);

    try {
      await this.client.models.del(modelId);
      Logger.info('✅ Modelo eliminado correctamente');
    } catch (error) {
      Logger.error('❌ Error eliminando modelo:', error);
      throw error;
    }
  }

  /**
   * 8. WORKFLOW COMPLETO
   * Ejecuta todo el proceso de fine-tuning de principio a fin
   */
  async executeCompleteWorkflow(): Promise<string> {
    Logger.info('🚀 INICIANDO WORKFLOW COMPLETO DE FINE-TUNING');
    Logger.info('='.repeat(60));

    try {
      // Paso 1: Preparar y validar dataset
      Logger.info('\n🔧 PASO 1: Preparación del Dataset');
      await this.prepareDataset();

      // Paso 2: Crear job de fine-tuning
      Logger.info('\n🚀 PASO 2: Creación del Job');
      const jobId = await this.createFineTuningJob();

      // Paso 3: Monitorear progreso
      Logger.info('\n👀 PASO 3: Monitoreo del Job');
      const modelId = await this.monitorFineTuningJob(jobId);

      // Paso 4: Probar modelo
      Logger.info('\n🧪 PASO 4: Prueba del Modelo');
      const testEmail: EmailClassificationRequest = {
        emailSubject: 'Invoice #12345 - Payment Due',
        emailBody:
          'Your invoice for $1,500.00 is now due. Please process payment within 30 days.',
      };

      const result = await this.classifyEmailWithFineTunedModel(
        modelId,
        testEmail
      );
      Logger.info('📊 Resultado de prueba:', result);

      // Paso 5: Comparar con modelo base
      Logger.info('\n📈 PASO 5: Comparación de Modelos');
      await this.compareModels(modelId);

      // Paso 6: Listar todos los modelos
      Logger.info('\n📋 PASO 6: Gestión de Modelos');
      await this.listFineTunedModels();

      Logger.info('\n✅ WORKFLOW COMPLETO FINALIZADO');
      Logger.info('='.repeat(60));

      return modelId;
    } catch (error) {
      Logger.error('❌ Error en el workflow:', error);
      throw error;
    }
  }
}
