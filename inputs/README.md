# 📁 Test Data Examples

Esta carpeta contiene datos de prueba para cada funcionalidad del workshop Email Processor v2.

## 🗂️ Estructura de Carpetas

```
inputs/
├── basic/              # Rama 1: Setup básico
├── rag/               # Rama 2: RAG con embeddings  
├── fine-tuning/       # Rama 3: Clasificación con LMService
├── email-processing/  # Rama 4: Procesamiento completo
└── moderation/        # Rama 5: Filtrado de contenido
```

## 🚀 Cómo Usar los Datos

### 1. **Postman Collection**
Importa cada archivo JSON como un request en Postman:
1. Crea una nueva colección "Email Processor Workshop"
2. Para cada archivo, crea un request POST 
3. Copia el contenido JSON al Body (raw)
4. Usa la URL correspondiente según las instrucciones

### 2. **cURL Examples**
```bash
# Ejemplo para RAG query
curl -X POST http://localhost:3000/rag/query \
  -H "Content-Type: application/json" \
  -d @inputs/rag/test-policy-query.json

# Ejemplo para clasificación de email
curl -X POST http://localhost:3000/fine-tuning/classify-email \
  -H "Content-Type: application/json" \  
  -d @inputs/fine-tuning/test-receipt-classification.json
```

### 3. **Testing Workflow**
1. **Empezar en rama correspondiente**: `git checkout 2-rag-embedding`
2. **Levantar servidor**: `npm run dev`
3. **Probar endpoint**: Usar datos de `inputs/rag/`
4. **Verificar respuesta**: Comparar con expected results
5. **Avanzar a siguiente rama**: Repetir proceso

## 📋 Datos por Funcionalidad

### Basic (Rama 1)
- `test-completion.json` - Prueba OpenAI completion básico
- `test-basic-query.json` - Query simple del sistema

### RAG (Rama 2)  
- `test-policy-query.json` - Consulta de emails financieros simulados
- `test-fee-inquiry.json` - Consulta específica de tarifas
- `test-regional-transfer.json` - Análisis de transferencias regionales

### Fine-tuning (Rama 3)
- `test-receipt-classification.json` - Clasificación de recibos
- `test-spam-classification.json` - Detección de spam/phishing
- `test-statement-classification.json` - Clasificación de estados de cuenta

### Email Processing (Rama 4)
- `test-batch-processing.json` - Procesamiento por lotes
- `test-wire-transfer.json` - Transferencia individual con tool calling

### Moderation (Rama 5)
- `test-safe-content.json` - Contenido seguro financiero
- `test-flagged-content.json` - Contenido potencialmente problemático

## ⚡ Tips de Uso

1. **Verifica endpoints**: Los endpoints pueden variar según la rama
2. **Revisa instrucciones**: Cada archivo tiene instrucciones específicas
3. **Compara resultados**: Los expected results te ayudan a validar
4. **Modifica datos**: Siéntete libre de crear tus propios casos de prueba
5. **Documenta cambios**: Si mejoras los datos, actualiza las instrucciones

---
*Estos datos están disponibles en todas las ramas del workshop para facilitar el testing progresivo.*
