# Warlord-K/kanha-incidentio-incidents-1.7b-full-v1

## Resumen

El modelo `Warlord-K/kanha-incidentio-incidents-1.7b-full-v1` es un ajuste fino completo (full fine-tuning) del modelo base `Qwen/Qwen3-1.7B`, desarrollado por Warlord-K como parte de un experimento de la serie Kanha. El objetivo es comparar métodos de entrenamiento sobre un conjunto de datos derivado de la documentación pública de incident.io, una plataforma de gestión de incidentes. El modelo está diseñado para responder preguntas sobre incidentes a partir de esa documentación, extrayendo fechas, listas, números y URLs.

Se trata de un modelo pequeño (1.720 millones de parámetros) con una ventana de contexto de 2048 tokens, entrenado con 276 registros de entrenamiento y 33 de validación. Su relevancia radica en ser un caso de estudio para evaluar técnicas de ajuste fino en dominios específicos, aunque su rendimiento determinista es bajo (pass rate 0.0) y requiere revisión humana en todas las salidas. La licencia no está especificada, lo que limita su uso comercial sin consulta previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (solo bfloat16 en safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3-1.7B, un transformer decoder con atención causal estándar. El ajuste fino se realizó de forma completa (todos los parámetros actualizados) sobre un conjunto de datos extraído de la documentación de incident.io, con 276 registros de entrenamiento y 33 de validación. El entrenamiento usó una secuencia máxima de 2048 tokens, 4 épocas, tasa de aprendizaje de 1e-5, tamaño de lote por dispositivo de 4, acumulación de gradientes de 2 y un warmup del 10%. Se aplicó pérdida solo en las respuestas del asistente (assistant-only loss). No se emplearon técnicas como RLHF o DPO; es un ajuste supervisado estándar.

## Capacidades

- Generación de texto en inglés, especializada en respuestas sobre incidentes a partir de documentación.
- Extracción de fechas, listas, números y URLs con alta recall (1.0 en las métricas del autor).
- Conversación de un solo turno o multi-turno dentro de la ventana de 2048 tokens.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso explícito.
- No tiene capacidades multimodales (solo texto).
- No se ha verificado soporte para otros idiomas más allá del inglés.

## Casos de uso

- Consulta de fechas de incidentes: el modelo puede responder "¿cuándo ocurrió el incidente X?" extrayendo la fecha de la documentación, aunque requiere verificación manual.
- Listado de incidentes por categoría: dado un tipo de incidente, puede enumerar los casos documentados, con recall alto en listas.
- Recuperación de números de referencia: útil para extraer identificadores numéricos de incidentes desde texto.
- Obtención de URLs de documentación: puede devolver enlaces relevantes a partir de preguntas sobre procedimientos.
- Asistente de soporte interno: integrado en un chatbot para empleados que necesiten consultar la documentación de incidentes, con supervisión humana.
- Investigación académica: como punto de comparación para estudiar el efecto del ajuste fino completo frente a otras técnicas (QLoRA, etc.) en dominios específicos.

## Benchmarks y rendimiento

El autor proporciona métricas de evaluación propias, basadas en 3 muestras de validación. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

| Metrica | Valor |
|---|---|
| dates_recall | 1.0 |
| deterministic_pass_rate | 0.0 |
| list_recall | 1.0 |
| numbers_recall | 1.0 |
| refusal_rate | 0.0 |
| requires_review_rate | 1.0 |
| unsupported_value_rate | 0.0 |
| urls_recall | 1.0 |

El `deterministic_pass_rate` de 0.0 indica que ninguna respuesta pasó una verificación exacta, y `requires_review_rate` de 1.0 señala que todas las respuestas necesitan revisión humana. Esto sugiere que el modelo es útil para recuperar información, pero no para generar respuestas finales sin supervisión.

## Requisitos de hardware

- VRAM estimada: el modelo en bfloat16 ocupa aproximadamente 3.4 GB de pesos, más overhead de activaciones y KV cache. Con una ventana de 2048 tokens, se estima un consumo de 5-7 GB en inferencia. Con cuantización a 4 bits (no disponible oficialmente, pero posible con herramientas externas) podría reducirse a ~1.5 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como RTX 3060, RTX 4060, RTX 4070, o GPUs de datacenter como A10, A100. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o Transformers con PyTorch.
- Latencia y throughput: no hay datos oficiales. En una GPU consumer moderna, se espera una latencia de decenas de milisegundos por token y un throughput de cientos de tokens por segundo con batching.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos en la información disponible. Como referencia, se puede comparar con el modelo base Qwen3-1.7B, que tiene la misma arquitectura y parámetros, pero sin el ajuste específico. Otros modelos pequeños como Llama-3.2-1B o Gemma-2-2B podrían ser alternativas, pero no hay datos de rendimiento en esta tarea concreta.

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Qwen3-1.7B (base) | 1.7B | 32K (original) | Apache 2.0 | Generalista |
| kanha-incidentio (este) | 1.7B | 2048 | No disponible | Incidentes (incident.io) |
| Llama-3.2-1B | 1.2B | 128K | Llama 3.2 | Generalista |

## Limitaciones y advertencias

- El modelo puede producir respuestas incorrectas, incompletas o desactualizadas, como advierte la model card.
- Puede memorizar contenido del conjunto de entrenamiento, lo que podría generar respuestas no generalizables.
- El `deterministic_pass_rate` de 0.0 indica que ninguna respuesta pasó una verificación exacta; todas requieren revisión humana.
- La licencia no está especificada, por lo que el uso comercial no está garantizado sin consultar al autor.
- El modelo solo soporta inglés y está limitado a la temática de incidentes de incident.io; fuera de ese dominio su rendimiento es desconocido.
- La ventana de contexto es de solo 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- No se han publicado artefactos MLC validados, por lo que su despliegue en navegadores o dispositivos móviles no está verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Warlord-K/kanha-incidentio-incidents-1.7b-full-v1
- Documentación de incident.io (fuente de datos): https://docs.incident.io
- Repositorio kanha-js (SDK relacionado): https://github.com/Warlord-K/kanha-js
