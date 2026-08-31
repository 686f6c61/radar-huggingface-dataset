# ZaandaTeika/RAGHal-large-en-v1

## Resumen

RAGHal-large-en-v1 es un modelo de clasificación de tokens (token-classification) diseñado para la detección de alucinaciones en sistemas de recuperación aumentada por generación (RAG). Ha sido desarrollado por ZaandaTeika como un fine-tune del modelo base `answerdotai/ModernBERT-large`, un encoder Transformer moderno de la familia BERT. El modelo etiqueta cada token de una respuesta generada como fiel o alucinado respecto a los documentos recuperados, lo que permite evaluar la fidelidad y atribución de las salidas de un pipeline RAG.

Con 395,8 millones de parámetros y un tamaño de repositorio de 1,6 GB, es un modelo de tamaño medio que puede ejecutarse en GPUs de consumo. Su licencia Apache-2.0 permite uso comercial sin restricciones, aunque el acceso al repositorio está restringido (gated) y requiere aceptar condiciones en Hugging Face. La relevancia actual radica en la necesidad de verificar la veracidad de las respuestas generadas por LLMs, especialmente en entornos empresariales donde la fiabilidad es crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder-only Transformer) |
| Parametros totales | 395.833.346 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT-large, un encoder Transformer que introduce mejoras sobre BERT original, como atención con máscara de desplazamiento, normalización pre-LayerNorm y una mayor eficiencia en el procesamiento de secuencias largas. El fine-tune se ha realizado para la tarea de token-classification, lo que implica que la capa de salida clasifica cada token en categorías relacionadas con la fidelidad o alucinación. No se dispone de información pública sobre el conjunto de datos de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se han publicado detalles sobre innovaciones técnicas específicas en el proceso de entrenamiento.

## Capacidades

- Clasificación de tokens para detectar alucinaciones en respuestas generadas por sistemas RAG.
- Etiquetado de fidelidad y atribución: identifica qué partes de una respuesta son consistentes con los documentos fuente.
- Procesamiento de texto en inglés con arquitectura encoder, adecuado para análisis de secuencias completas.
- Integración con pipelines de verificación automática de salidas de LLMs.
- No incluye generación de texto, razonamiento conversacional, tool calling ni capacidades multimodales.

## Casos de uso

- Verificación de respuestas en sistemas de preguntas-respuesta empresariales: el modelo puede analizar cada token de una respuesta generada por un LLM y marcar aquellos que no están respaldados por los documentos recuperados, permitiendo filtrar o corregir salidas no fiables antes de mostrarlas al usuario final.
- Control de calidad en pipelines RAG: integrar RAGHal como paso posterior a la generación para auditar la fidelidad de las respuestas en lotes, detectando patrones de alucinación recurrentes y mejorando los prompts o la selección de documentos.
- Auditoría de cumplimiento en sectores regulados (financiero, sanitario): usar el modelo para generar informes de trazabilidad que indiquen qué afirmaciones de una respuesta provienen de fuentes autorizadas y cuáles son inventadas.
- Depuración de sistemas RAG en desarrollo: durante la fase de pruebas, el modelo ayuda a identificar fragmentos de respuestas que se desvían del contexto recuperado, lo que permite ajustar la estrategia de chunking, el número de documentos recuperados o el prompt del generador.
- Evaluación de modelos de generación: emplear RAGHal como métrica automática de fidelidad en benchmarks de RAG, sustituyendo evaluaciones manuales costosas y proporcionando una puntuación token a token.
- Monitorización en producción: desplegar el modelo como servicio de análisis en tiempo real para detectar alucinaciones en respuestas generadas por chatbots, activando alertas o redirigiendo a respuestas de respaldo cuando el nivel de alucinación supera un umbral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval u otras métricas estándar, ya que el modelo está especializado en clasificación de tokens y no en tareas generativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado el tamaño de 395M parámetros, en FP16 el modelo ocupa aproximadamente 800 MB de pesos, más overhead de activaciones, por lo que cabría en GPUs con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650 o superiores). Sin embargo, no se han publicado cifras oficiales.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA y al menos 4 GB de VRAM (RTX 3060, RTX 4090, A100, etc.) sería suficiente para inferencia en lote.
- Compatibilidad con consumer GPU: sí, al ser un modelo de tamaño medio.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con bibliotecas como Hugging Face Transformers, vLLM (si soporta encoder-only), o mediante contenedores personalizados con FastAPI. También es compatible con endpoints de Hugging Face.
- Latencia y throughput: no se han publicado datos. Para un modelo de este tamaño, la inferencia en GPU de gama media (RTX 3090) debería completarse en milisegundos por secuencia, pero no hay cifras verificadas.

## Comparativa con modelos similares

No se dispone de modelos comparables en la categoría de detección de alucinaciones en RAG con token-classification y basados en ModernBERT. Los modelos BGE (BAAI) son para embeddings y no son directamente comparables. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de poder descargar los pesos.
- Idioma: solo soporta inglés, por lo que no es aplicable a textos en otros idiomas sin un fine-tune adicional.
- Especialización: está diseñado exclusivamente para clasificación de tokens en el contexto de RAG; no funciona como generador de texto ni para otras tareas.
- Riesgo de falsos positivos y negativos: como todo clasificador, puede cometer errores, especialmente en dominios técnicos o con vocabulario especializado no visto en entrenamiento.
- Dependencia del modelo base: las limitaciones de ModernBERT-large (por ejemplo, longitud de contexto máxima) se heredan, aunque no se ha confirmado el valor exacto.
- Sin información sobre sesgos: no se han publicado análisis de sesgos o comportamiento en datos de dominio específico.

## Enlaces

- [Hugging Face: ZaandaTeika/RAGHal-large-en-v1](https://huggingface.co/ZaandaTeika/RAGHal-large-en-v1)
- [Modelo base: answerdotai/ModernBERT-large](https://huggingface.co/answerdotai/ModernBERT-large)
