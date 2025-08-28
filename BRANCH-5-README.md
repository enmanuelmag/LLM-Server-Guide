# Rama 5: OpenAI Moderation API

## 🛡️ Descripción

Esta rama implementa el **OpenAI Moderation API** para análisis de contenido y seguridad. Aprenderás a usar la API de moderación para detectar y analizar contenido potencialmente dañino en textos y emails.

## ✨ Características Implementadas

### 🔧 ModerationService
- **Moderación de texto individual**: Analiza un texto único
- **Moderación en lotes**: Procesa múltiples textos simultáneamente  
- **Moderación de emails**: Analiza asunto y cuerpo por separado
- **Análisis de riesgo**: Proporciona recomendaciones basadas en los resultados

### 🌐 API Endpoints

#### POST `/api/moderation/text`
Modera un texto individual
```json
{
  "text": "Tu texto aquí"
}
```

#### POST `/api/moderation/batch`
Modera múltiples textos (máximo 10)
```json
{
  "texts": ["Texto 1", "Texto 2", "Texto 3"]
}
```

#### POST `/api/moderation/email`
Modera contenido de email completo
```json
{
  "subject": "Asunto del email",
  "body": "Contenido del email"
}
```

#### GET `/api/moderation/categories`
Obtiene información sobre las categorías de moderación

#### POST `/api/moderation/demo`
Endpoint de demostración con textos de ejemplo

## 🚀 Cómo Usar

### 1. Configurar Variables de Entorno
```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita y agrega tu API key de OpenAI
OPENAI_API_KEY=tu_api_key_aqui
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Compilar y Ejecutar
```bash
# Compilar
npm run build

# Ejecutar
npm start

# O en modo desarrollo
npm run dev
```

### 4. Probar la API

#### Prueba Básica
```bash
curl -X POST http://localhost:3000/api/moderation/text \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, this is a safe message!"}'
```

#### Demo Interactiva
```bash
curl -X POST http://localhost:3000/api/moderation/demo \
  -H "Content-Type: application/json" \
  -d '{"include_risky": false}'
```

## 📊 Categorías de Moderación

El API analiza estas categorías:

- **harassment**: Contenido de acoso
- **harassment/threatening**: Acoso con amenazas
- **hate**: Contenido de odio  
- **hate/threatening**: Odio con amenazas
- **self-harm**: Contenido de autolesiones
- **self-harm/intent**: Intención de autolesión
- **self-harm/instructions**: Instrucciones de autolesión
- **sexual**: Contenido sexual
- **sexual/minors**: Contenido sexual con menores
- **violence**: Contenido violento
- **violence/graphic**: Violencia gráfica

## 🎯 Casos de Uso

### 1. **Moderación de Comentarios**
```javascript
const result = await moderationService.moderateText(userComment);
if (result.flagged) {
  // Bloquear o revisar comentario
}
```

### 2. **Filtro de Emails**
```javascript
const emailResult = await moderationService.moderateEmail(subject, body);
if (!emailResult.overall_safe) {
  // Requerir revisión manual
}
```

### 3. **Análisis de Contenido por Lotes**
```javascript
const results = await moderationService.moderateTextBatch(textArray);
const flaggedContent = results.filter(r => r.flagged);
```

## 🔍 Respuesta Detallada

La API devuelve información completa:

```json
{
  "success": true,
  "data": {
    "moderation": {
      "flagged": false,
      "categories": { ... },
      "category_scores": { ... },
      "flagged_categories": [],
      "highest_scores": [
        { "category": "harassment", "score": 0.001 }
      ]
    },
    "analysis": {
      "risk_level": "low",
      "primary_concerns": [],
      "recommendation": "Content appears safe for general use.",
      "score_analysis": "Highest risk score: 0.1% in harassment"
    }
  }
}
```

## 🔧 Configuración Avanzada

### Umbrales Personalizados
Puedes ajustar los umbrales de riesgo en `ModerationService.analyzeModeration()`:

- **Alto riesgo**: Puntuación > 0.8 o múltiples categorías
- **Riesgo medio**: Puntuación > 0.5
- **Bajo riesgo**: Puntuación < 0.3

### Integración con Sistemas de Filtrado
```javascript
// Ejemplo de integración
const moderationResult = await moderationService.moderateText(content);
const analysis = moderationService.analyzeModeration(moderationResult);

switch (analysis.risk_level) {
  case 'high':
    // Bloquear automáticamente
    break;
  case 'medium':
    // Enviar a cola de revisión
    break;
  case 'low':
    // Permitir publicación
    break;
}
```

## 📚 Recursos Adicionales

- [OpenAI Moderation API Docs](https://platform.openai.com/docs/guides/moderation)
- [Content Policy Guidelines](https://openai.com/usage-policies)
- [Best Practices for Content Moderation](https://platform.openai.com/docs/guides/moderation/best-practices)

## 🎓 Logros del Workshop

¡Felicidades! Has completado todas las ramas del workshop:

1. ✅ **Rama 1**: Configuración inicial y OpenAI SDK
2. ✅ **Rama 2**: RAG con embeddings y políticas financieras
3. ✅ **Rama 3**: Fine-tuning para clasificación de emails
4. ✅ **Rama 4**: Procesador completo de emails con simulación
5. ✅ **Rama 5**: API de moderación y seguridad de contenido

Ahora tienes conocimiento completo del ecosistema OpenAI API y estás listo para la certificación **OpenAI API Practitioner**! 🚀
