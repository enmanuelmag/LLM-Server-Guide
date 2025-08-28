# 🎓 Email Processor Workshop v2 - OpenAI API Practitioner

## 📋 Resumen de Endpoints por Rama

### 🏠 Rama 1: `1-initial-project` 
**Setup básico - Solo endpoints del servidor**

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/` | GET | Welcome page con información del workshop |
| `/health` | GET | Health check del servidor |
| `/docs` | GET | Documentación del workshop |

**Archivos de prueba:**
- `inputs/basic/test-welcome.json`
- `inputs/basic/test-health-check.json` 
- `inputs/basic/test-docs.json`

**Testing:**
```bash
curl http://localhost:3000/
curl http://localhost:3000/health
curl http://localhost:3000/docs
```

### 🧠 Rama 2: `2-rag-embedding`
**Añade endpoints RAG + todos los de Rama 1**

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/rag/query` | POST | Consulta RAG con emails financieros simulados |
| `/rag/query-voice-to-text` | POST | Subir audio → JSON response |
| `/rag/query-voice-to-voice` | POST | Subir audio → MP3 response |
| `/rag/emails` | GET | Lista todos los emails disponibles |
| `/rag/stats` | GET | Estadísticas del vector store |

**Archivos de prueba adicionales:**
- `inputs/rag/test-policy-query.json` (Consultas sobre emails)
- `inputs/rag/test-fee-inquiry.json` (Consultas sobre gastos)
- `inputs/rag/test-voice-to-text.json` (Pruebas de audio)
- `inputs/rag/test-voice-to-voice.json` (Audio completo)

**Testing:**
```bash
curl -X POST http://localhost:3000/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query": "¿Cuánto gasté en suscripciones?"}'
```

### 🎯 Rama 3: `3-fine-tuning` 
**Añade endpoints Fine-tuning + todos los anteriores**

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/fine-tuning/classify-email` | POST | Clasificar email usando modelo fine-tuned |
| `/fine-tuning/compare-models` | POST | Comparar modelo base vs fine-tuned |
| `/fine-tuning/create-job` | POST | Crear job de fine-tuning |
| `/fine-tuning/job-status/:id` | GET | Estado del job de fine-tuning |
| `/fine-tuning/download-dataset` | GET | Descargar dataset JSONL |

**Archivos de prueba adicionales:**
- `inputs/fine-tuning/test-receipt-classification.json`
- `inputs/fine-tuning/test-spam-classification.json`  
- `inputs/fine-tuning/test-statement-classification.json`

### ⚙️ Rama 4: `4-email-processor`
**Añade endpoints Email Processing + todos los anteriores**

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/email-processing/process` | POST | Procesar email individual |
| `/email-processing/batch` | POST | Procesar lote de emails |
| `/email-processing/simulate` | POST | Generar y procesar emails simulados |
| `/email-processing/stats` | GET | Estadísticas de procesamiento |

**Archivos de prueba adicionales:**
- `inputs/email-processing/test-batch-processing.json`
- `inputs/email-processing/test-wire-transfer.json`

### 🤖 Rama 5: `5-fetch-emails` (Enhanced RAG)
**Añade endpoints Enhanced RAG + todos los anteriores**

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/enhanced-rag/query` | POST | RAG con Function Calling inteligente |
| `/enhanced-rag/compare` | POST | Comparar RAG tradicional vs Enhanced |
| `/enhanced-rag/tools` | GET | Lista herramientas disponibles |

**Archivos de prueba adicionales:**
- `inputs/enhanced-rag/test-semantic-query.json`
- `inputs/enhanced-rag/test-structured-query.json`
- `inputs/enhanced-rag/test-hybrid-query.json`
- `inputs/enhanced-rag/test-strategy-comparison.json`

### 🛡️ Rama 6: `6-api-moderation`
**Añade endpoints Moderation + todos los anteriores**

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/moderation/text` | POST | Moderar contenido de texto |
| `/moderation/email` | POST | Moderar email completo |
| `/moderation/demo` | GET | Demo con ejemplos de moderación |

**Archivos de prueba adicionales:**
- `inputs/moderation/test-safe-content.json`
- `inputs/moderation/test-flagged-content.json`

## 🚀 Instrucciones de Uso

### Setup Inicial
```bash
git clone <repo-url>
cd email-processor-ws-v2
cp .env.example .env
# Editar .env con tu OPENAI_API_KEY
npm install
```

### Testing por Ramas
```bash
# Rama 1: Solo endpoints básicos
git checkout 1-initial-project
npm run dev
curl http://localhost:3000/  # Welcome

# Rama 2: + RAG endpoints  
git checkout 2-rag-embedding
npm run dev
curl -X POST http://localhost:3000/rag/query -H "Content-Type: application/json" -d '{"query": "¿Cuánto gasté en Amazon?"}'

# Rama 3: + Fine-tuning endpoints
git checkout 3-fine-tuning
npm run dev
# ... y así sucesivamente
```

## 📁 Colección de Postman

**⚠️ NUEVA UBICACIÓN:** La colección de Postman ahora está **FUERA** del repositorio para uso universal.

**Ubicación:** `/Users/sadie/Code/Innova-T/Email-Processor-Workshop-v2-COMPLETE-Postman-Collection.json`

**Importar en Postman:**

1. **Abrir Postman** → File → Import
2. **Seleccionar archivo:** `Email-Processor-Workshop-v2-COMPLETE-Postman-Collection.json`
3. **Configurar variables:**
   - `baseUrl`: `http://localhost`
   - `port`: `3000`

**Organización:**
   - 🏠 Rama 1: Basic Setup (Disponible en todas las ramas)
   - 🧠 Rama 2: RAG Implementation (Rama 2+)
   - 🎯 Rama 3: Fine-tuning (Rama 3+)
   - ⚙️ Rama 4: Email Processing (Rama 4+)
   - 🤖 Rama 5: Enhanced RAG (Rama 5+)
   - 🛡️ Rama 6: API Moderation (Rama 6+)

**Ventajas:**
- ✅ Una sola colección para todo el workshop
- ✅ Documentación completa de cada endpoint
- ✅ Ejemplos listos para usar
- ✅ Progresión clara por rama
- ✅ Siempre actualizada

**Ver:** `/Users/sadie/Code/Innova-T/POSTMAN-COLLECTION-GUIDE.md` para guía completa de uso.

## ⚠️ Notas Importantes

- **Rama 1** NO tiene endpoints de OpenAI API, solo server básico
- Los endpoints de OpenAI inician en **Rama 2** con RAG
- Cada rama incluye TODOS los endpoints de las ramas anteriores
- Los archivos de prueba están organizados por funcionalidad
- La colección de Postman está corregida para reflejar los endpoints reales

## 🎯 Próximos Pasos

1. Comienza con Rama 1 para setup básico
2. Avanza a Rama 2 para primeros endpoints de OpenAI
3. Progresa secuencialmente por las ramas
4. Usa los archivos de prueba correspondientes a cada rama
5. La guía completa está en `/1-email-processor-guide.md`
