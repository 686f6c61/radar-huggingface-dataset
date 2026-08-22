# tiennn/lab21-qwen35-triage-vi

## Resumen

`tiennn/lab21-qwen35-triage-vi` es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-2B, desarrollado por Le Anh Tien en el contexto del Lab 21 del programa AICB de la VinUniversity. El objetivo es especializar el modelo en la clasificación de tickets de soporte de comercio electrónico en vietnamita, emitiendo un objeto JSON con cuatro campos: `intent` (intención), `urgency` (urgencia), `product` (producto) y `sentiment` (sentimiento).

El adaptador se entrenó con 225 tickets de soporte sintéticos en vietnamita, con rango 16, alpha 32 y 58 pasos de optimización. Aunque la precisión en la tarea objetivo es alta (0.995 en campos y 1.000 en validez de formato), la regresión en capacidades generales es severa (de 0.6000 a 0.0667), por lo que el autor declara explícitamente que el gate de despliegue está suspendido. No es un modelo de propósito general, sino un componente para un endpoint enrutado de triaje exclusivamente.

El modelo se publica como adaptador PEFT (0.1 GB) y está pensado para su uso con la librería `peft` sobre el base Qwen3.5-2B. No se han publicado datos de latencia ni de despliegue en producción más allá del experimento controlado descrito en el repositorio asociado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-2B) con adaptador LoRA |
| Parámetros totales | no disponible (adaptador LoRA de 0.1 GB; base: 2B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3.5-2B) |
| Tipos de cuantización | no disponible (formato safetensors del adaptador) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3.5-2B, un transformer de 2.000 millones de parámetros de la serie Qwen3.5. El adaptador se aplica a todos los módulos lineales del decoder de texto, con rango 16 y alpha 32. El entrenamiento utilizó una tasa de aprendizaje de 1e-4 y 58 pasos de optimización sobre un conjunto de 225 tickets de soporte de comercio electrónico en vietnamita, con salida estructurada en formato JSON de cuatro campos.

No se han publicado detalles sobre el dataset de entrenamiento más allá del número de tickets ni sobre el proceso de generación de los datos sintéticos. La evaluación se realizó sobre un conjunto congelado de 50 ítems, midiendo la precisión de los campos objetivo y la validez del formato JSON. No hay evidencia de técnicas como RLHF o DPO; el entrenamiento parece ser un fine-tuning supervisado clásico con pérdida de generación.

## Capacidades

- Clasificación de tickets de soporte en vietnamita con salida JSON estructurada: el modelo emite un objeto con cuatro campos (`intent`, `urgency`, `product`, `sentiment`).
- Generación de texto en vietnamita restringida al dominio de soporte de comercio electrónico.
- Salida con formato JSON válido (medida de 1.000 en validez de formato sobre el conjunto de evaluación).
- No soporta tool calling, ni agentes multi-paso, ni razonamiento complejo fuera de la tarea de triage.
- No es un modelo multilingüe: solo está entrenado para vietnamita y su comportamiento en otros idiomas no ha sido evaluado.

## Casos de uso

- **Enrutamiento de tickets de soporte en centros de atención al cliente**: el modelo puede clasificar automáticamente las consultas entrantes en categorías (intención, urgencia, producto, sentimiento) y emitir un JSON que alimente un sistema de tickets para asignar el agente adecuado o priorizar respuestas.
- **Preprocesamiento de mensajes en chatbots de comercio electrónico**: antes de que un agente humano o un modelo generativo responda, el adaptador puede extraer los campos clave del mensaje del cliente para personalizar la respuesta.
- **Análisis de sentimiento en feedback de productos**: la salida del campo `sentiment` permite agregar métricas de satisfacción por producto o categoría.
- **Filtrado de urgencia en soporte técnico**: el campo `urgency` permite priorizar tickets críticos (por ejemplo, problemas de pago o envío) antes que consultas generales.
- **Experimentación académica en adaptación de modelos con LoRA**: el repositorio documenta un pipeline completo de entrenamiento y evaluación que puede servir como referencia para estudiantes o investigadores en fine-tuning de LLMs.
- **Prototipos de demostración de salida estructurada**: útil para validar el uso de adaptadores LoRA para forzar formatos JSON en modelos pequeños antes de escalar a modelos mayores.

## Benchmarks y rendimiento

El autor publicó mediciones sobre un conjunto de evaluación congelado de 50 ítems:

| Métrica | Valor |
|---|---|
| Precisión de campos objetivo | 0.995 |
| Validez de formato | 1.000 |
| Regresión de capacidades generales (antes) | 0.6000 |
| Regresión de capacidades generales (después) | 0.0667 |
| Gate de despliegue | FALLIDO |

No se han publicado comparaciones con otros modelos de triage ni benchmarks estándar como MMLU, HumanEval o GSM8K. La regresión general del 0.6000 al 0.0667 indica que el adaptador degrada severamente el rendimiento del modelo base fuera de la tarea específica de triage.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (0.1 GB) y puede cargarse en cualquier GPU con al menos 4 GB de VRAM junto con el base Qwen3.5-2B cuantizado.
- Para inferencia en CPU, el base Qwen3.5-2B cuantizado a 4 bits puede ejecutarse con 8 GB de RAM, pero la latencia será alta para uso interactivo.
- GPU recomendadas: cualquier GPU con 8 GB de VRAM (RTX 3060, RTX 4060, T4) para inferencia en batch; A100 o H100 si se integra en un servicio de alta concurrencia.
- Opciones de despliegue: vLLM (con soporte de adaptadores LoRA), TGI (Text Generation Inference), o llama.cpp si se fusiona el adaptador con el base y se exporta a GGUF.
- Latencia y throughput: no disponibles; el autor no ha publicado mediciones de rendimiento en producción.

## Comparativa con modelos similares

No hay modelos comparables directamente disponibles en la información proporcionada. Se han encontrado otros adaptadores con el mismo patrón de nombre (`NiallHoang/lab21-qwen35-triage-vi`, `tanh1c/lab21-qwen35-triage-vi`, `mjusdda/lab21-2A202601343-qwen35-triage-vi`) que parecen ser variantes del mismo ejercicio académico, pero no se han publicado datos de rendimiento de esos adaptadores. La comparación más relevante sería con el modelo base Qwen3.5-2B sin adaptador, que tiene capacidades generales pero no la salida JSON estructurada específica.

## Limitaciones y advertencias

- **Regresión severa en capacidades generales**: la puntuación de regresión cae de 0.6000 a 0.0667, lo que indica que el adaptador destruye la capacidad del modelo base fuera de la tarea de triage. No debe usarse como reemplazo del base.
- **Sesgo de dominio**: el entrenamiento se realizó con solo 225 tickets sintéticos de comercio electrónico; el modelo no ha sido evaluado con tickets reales de otros dominios (salud, banca, tecnología).
- **Idioma limitado**: solo soporta vietnamés; no se han evaluado otros idiomas ni se garantiza un comportamiento razonable en ellos.
- **Riesgo de alucinación en campos**: aunque la validez de formato es 1.000, no se ha evaluado la precisión semántica de los valores emitidos en casos de borde (tickets ambiguos o con múltiples intenciones).
- **Licencia no disponible**: no se especifica la licencia del adaptador; se recomienda contactar con el autor antes de un uso comercial.
- **Gate de despliegue fallido**: el propio autor advierte que el modelo no está listo para producción como reemplazo general; solo es adecuado en un endpoint enrutado exclusivamente para triage.

## Enlaces

- HuggingFace: https://huggingface.co/tiennn/lab21-qwen35-triage-vi
- Repositorio GitHub del experimento: https://github.com/Tienlee41/Day21-Track3-2A202601145_LeAnhTien
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante de NiallHoang: https://huggingface.co/NiallHoang/lab21-qwen35-triage-vi
- Variante de tanh1c en FriendliAI: https://friendli.ai/models/tanh1c/lab21-qwen35-triage-vi
- Variante de mjusdda en FriendliAI: https://friendli.ai/models/mjusdda/lab21-2A202601343-qwen35-triage-vi
