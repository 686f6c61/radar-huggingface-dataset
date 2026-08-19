# tartuNLP/Llama-3.1-EstLLM-70B-Instruct-0826

## Resumen

El modelo `tartuNLP/Llama-3.1-EstLLM-70B-Instruct-0826` es una adaptación del Llama 3.1 de 70B parámetros, desarrollado por el grupo de investigación tartuNLP de la Universidad de Tartu (Estonia). Su objetivo principal es mejorar el rendimiento del modelo base en estonio, un idioma con recursos limitados, manteniendo a la vez las capacidades en inglés. Se trata de una versión instruct, es decir, ajustada para seguir instrucciones y mantener conversaciones, construida a partir del modelo base `tartuNLP/Llama-3.1-EstLLM-70B-0826`.

El modelo resuelve el problema de la escasez de modelos de gran tamaño con buen desempeño en lenguas de menor difusión como el estonio. Su relevancia radica en que demuestra que es posible adaptar eficazmente un modelo multilingüe a un idioma concreto mediante pre-entrenamiento continuo y ajuste fino posterior. Con 70.553.706.496 parámetros (70,5B), es un modelo denso que requiere recursos de hardware considerables para su despliegue. La información pública no especifica la longitud de contexto, aunque al derivar de Llama 3.1 es probable que herede los 128K tokens, pero no se confirma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Llama 3.1) |
| Parametros totales | 70.553.706.496 (70,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 128K, sin confirmar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | estonio (et), ingles (en) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.1 de 70B parámetros, un transformer denso con atención por ventanas y normalización RMSNorm. El proceso de adaptación al estonio sigue la metodología del proyecto EstLLM, que para la versión de 8B consistió en pre-entrenamiento continuo sobre aproximadamente 35B tokens de texto en estonio (y posiblemente otros idiomas), seguido de supervisión fine-tuning (SFT) y optimización por preferencias directas (DPO). Aunque no se detallan los datos exactos para la versión de 70B, es razonable asumir un esquema similar, dado que el modelo base `tartuNLP/Llama-3.1-EstLLM-70B-0826` se menciona como punto de partida. No se han publicado detalles sobre el número exacto de tokens de entrenamiento ni la composición del dataset para esta variante de 70B.

## Capacidades

- Generación de texto en estonio e inglés con alta calidad, especialmente en tareas de comprensión gramatical y semántica.
- Seguimiento de instrucciones en ambos idiomas, con buenos resultados en benchmarks de instrucciones (IFEval).
- Conversación multi-turno, ya que es un modelo instruct entrenado con técnicas de preferencia.
- Comprensión de significados de palabras y flexión morfológica en estonio, como muestran los resultados en los benchmarks específicos.
- No se mencionan capacidades de tool calling, agentes, visión ni audio; es un modelo de texto puro.

## Casos de uso

- Atención al cliente en estonio: el modelo puede gestionar conversaciones de soporte técnico o comercial en estonio con un nivel de precisión gramatical superior al de los modelos genéricos, gracias a su entrenamiento específico en este idioma.
- Generación de contenido editorial en estonio: redacción de artículos, resúmenes o noticias locales donde la corrección idiomática es crítica.
- Traducción asistida estonio-inglés: aunque no es un modelo de traducción dedicado, puede producir traducciones fluidas en ambos sentidos, útil como apoyo en flujos de revisión humana.
- Asistente de escritura para hablantes de estonio: corrección gramatical, sugerencias de estilo y reformulación de textos, aprovechando su alto rendimiento en tareas de gramática e inflexión.
- Sistemas de preguntas y respuestas sobre documentación técnica o legal en estonio: el modelo puede extraer y sintetizar información de documentos extensos si se le proporciona el contexto adecuado.
- Investigación lingüística computacional: sirve como modelo base para experimentos en procesamiento de lenguaje natural para lenguas báltico-finesas, permitiendo comparaciones con otras arquitecturas.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a evaluaciones generativas con temperatura 0 y con la misma plantilla de prompt para todos los modelos. Se reportan las siguientes métricas para el modelo evaluado:

| Benchmark | Resultado |
|---|---|
| IFEval-et (instrucciones, exactitud estricta) | 0.7581 |
| IFEval-en (instrucciones, exactitud estricta) | 0.9147 |
| Grammar-et (exactitud) | 0.8950 |
| Inflection-et (exactitud) | 0.9142 |
| Word-Meanings-et (exactitud) | 0.9719 |

Comparación con modelos similares en los mismos benchmarks (extraído de la model card):

| Modelo | IFEval-et | IFEval-en | Grammar-et | Inflection-et | Word-Meanings-et |
|---|---|---|---|---|---|
| meta-llama/Llama-3.3-70B-Instruct | 0.7705 | 0.9281 | 0.797 | 0.6421 | 0.9408 |
| meta-llama/Llama-3.1-70B-Instruct | 0.6836 | 0.8904 | 0.800 | 0.6351 | 0.9248 |
| Qwen/Qwen2.5-72B-Instruct | 0.7407 | no evaluado | 0.694 | 0.5208 | 0.9057 |
| **tartuNLP/Llama-3.1-EstLLM-70B-Instruct-0826** | **0.7581** | **0.9147** | **0.8950** | **0.9142** | **0.9719** |
| swiss-ai/Apertus-70B-Instruct-2509 | 0.5993 | 0.5993 | 0.736 | 0.3761 | 0.9428 |

El modelo supera claramente al Llama 3.1 original en todas las tareas en estonio, y se acerca o iguala a Llama 3.3 en instrucciones en inglés. Destaca especialmente en inflexión y significados de palabras, donde obtiene los mejores resultados entre los modelos comparados.

## Requisitos de hardware

- VRAM estimada: para inferencia en precisión FP16 se necesitan aproximadamente 140 GB de VRAM (los pesos del modelo ocupan 141,1 GB en el repositorio). Con cuantización de 4 bits (no disponible oficialmente, pero posible con herramientas como llama.cpp o GPTQ) se podría reducir a unos 40-45 GB, permitiendo su ejecución en GPUs de gama alta como la RTX 4090 (24 GB) no sería suficiente; se necesitaría al menos una A100 80GB o varias GPUs.
- GPUs recomendadas: NVIDIA A100 80GB, H100 80GB, o configuraciones multi-GPU (por ejemplo, 2x A100 40GB). Para cuantización 4-bit, una RTX 4090 (24 GB) quedaría justa; mejor una A6000 48GB o A100 40GB.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, TGI (Text Generation Inference) o llama.cpp para cuantización GGUF (aunque no se proporcionan oficialmente). También es compatible con el ecosistema Hugging Face.
- Latencia y throughput: no se dispone de datos medidos. Como referencia orientativa, un modelo de 70B en FP16 con una A100 80GB suele generar entre 10 y 30 tokens por segundo dependiendo del batch y la longitud de secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento en estonio (IFEval-et) |
|---|---|---|---|---|
| tartuNLP/Llama-3.1-EstLLM-70B-Instruct-0826 | 70,5B | no disponible | llama3.1 | 0.7581 |
| meta-llama/Llama-3.1-70B-Instruct | 70B | 128K | llama3.1 | 0.6836 |
| meta-llama/Llama-3.3-70B-Instruct | 70B | 128K | llama3.1 | 0.7705 |
| Qwen/Qwen2.5-72B-Instruct | 72B | 128K | Apache 2.0 | 0.7407 |

El modelo EstLLM mejora sustancialmente al Llama 3.1 base en estonio, y se sitúa muy cerca de Llama 3.3, que es una versión posterior y optimizada. Frente a Qwen2.5-72B, también superior en estonio. Su principal ventaja es el enfoque específico en este idioma, a costa de no soportar otros idiomas europeos.

## Limitaciones y advertencias

- Sesgos: al ser un modelo entrenado principalmente con datos en estonio e inglés, puede presentar sesgos culturales o lingüísticos propios de estas comunidades. No se ha publicado una evaluación de sesgos.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en contextos donde no tiene conocimiento suficiente. Se recomienda verificación humana en aplicaciones críticas.
- Limitaciones de idioma: solo cubre estonio e inglés; no se espera un buen rendimiento en otros idiomas, incluidos los de la región báltica (letón, lituano) o el ruso.
- Restricciones de licencia: la licencia llama3.1 permite uso comercial, pero impone condiciones específicas (por ejemplo, no usarlo para mejorar otros modelos grandes sin autorización). Es necesario revisar los términos completos.
- Contexto no confirmado: aunque probablemente herede los 128K tokens de Llama 3.1, no se ha verificado oficialmente; en la práctica, el rendimiento con contextos muy largos puede degradarse si no se ajustó adecuadamente durante el entrenamiento.
- Sin soporte para tool calling ni funciones de agente: el modelo no está diseñado para integraciones con herramientas externas, lo que limita su uso en pipelines de automatización complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tartuNLP/Llama-3.1-EstLLM-70B-Instruct-0826
- Modelo base: https://huggingface.co/tartuNLP/Llama-3.1-EstLLM-70B-0826
- Proyecto EstLLM (versión 8B): https://huggingface.co/tartuNLP/Llama-3.1-EstLLM-8B-Instruct-1125
- Dataset IFEval-et: https://huggingface.co/datasets/tartuNLP/ifeval_et
- Datasets de gramática e inflexión en estonio: https://huggingface.co/datasets/TalTechNLP/grammar_et, https://huggingface.co/datasets/TalTechNLP/inflection_et, https://huggingface.co/datasets/TalTechNLP/word_meanings_et
