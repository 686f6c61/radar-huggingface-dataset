# wonchandev/Soonlife-Qwen3.5-9B-v2-LoRA

## Resumen

Soonlife-Qwen3.5-9B-v2-LoRA es un adaptador LoRA desarrollado por el usuario wonchandev sobre el modelo base Qwen/Qwen3.5-9B, orientado a un chatbot RAG (generación aumentada por recuperación) especializado en las normativas y avisos de la Universidad de Soonchunhyang (Corea del Sur). El adaptador se ha entrenado mediante destilación (SFT) a partir de las respuestas y trazas de agente generadas por un modelo profesor de mayor tamaño (Qwen3.8-27B), con el objetivo de reproducir su comportamiento en un modelo estudiante de 9B parámetros.

La versión v2 corrige problemas detectados en la v1: reduce las consultas duplicadas en el flujo de agente (del 10,9% al 3,3%), disminuye las reescrituras tras la comprobación de calidad (del 27,2% al 17,4%) y mantiene la calidad del formato RAG. El adaptador se distribuye como pesos PEFT (safetensors) y se publica junto con los registros completos de entrenamiento (configuración, informe de datos, historial de métricas).

El modelo es relevante como ejemplo de destilación de un profesor de 27B a un estudiante de 9B para una tarea vertical concreta (RAG con tool calling y flujo de agente multironda), con licencia Apache 2.0 y artefactos de entrenamiento reproducibles. Su alcance, sin embargo, está deliberadamente limitado al dominio de la aplicación Soonlife: fuera de su system prompt y esquema de herramientas no se garantiza mejora alguna sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5 (Qwen3_5ForConditionalGeneration); incluye torre de visión y proyecciones Gated DeltaNet |
| Parametros totales | No disponible (adaptador LoRA r=32; modelo base Qwen3.5-9B de ~9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrenado con máximo 32.768 tokens; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | El adaptador se publica en bf16; existen versiones derivadas FP8 dynamic y bf16 fusionada del autor |
| Idiomas soportados | Coreano (ko); el modelo base Qwen3.5-9B soporta multilingüismo, pero el adaptador solo está entrenado en coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors + adapter_config.json), librería PEFT |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-9B, un transformer multimodal (image-text-to-text) que combina atención completa con capas Gated DeltaNet (atención lineal) y una torre de visión. El LoRA usa r=32, alpha=32 y dropout=0.0, con módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`, `in_proj_qkv`, `in_proj_z` y `out_proj`, es decir, las proyecciones del modelo de lenguaje (atención completa, MLP y Gated DeltaNet), excluyendo la torre de visión.

El entrenamiento consistió en SFT por destilación desde Qwen3.8-27B (profesor) sobre 6.332 muestras y 81,4M tokens (2,99M tokens con pérdida), divididas en tres conjuntos: 3.000 respuestas en formato RAG (24,6M tokens), 1.728 muestras de trazas del primer turno con pensamiento (23,8M tokens) y 1.604 muestras de trazas completas sin pensamiento (33,0M tokens). Se usó bf16, Unsloth, 1,5 épocas, lr 1e-4 con decaimiento coseno, batch efectivo de 16 y máximo de 32.768 tokens, con un coste de 3,5 horas en una H100. La pérdida media de entrenamiento fue 0,1689 y las pérdidas de validación finales 0,2684 (answers) y 0,2709 (traces). Se reforzaron las muestras de recuperación tras búsqueda fallida y de cierre temprano. Los pesos de la torre de visión y del MTP (decodificación especulativa) no se entrenaron.

## Capacidades

- Generación de respuestas RAG en formato estructurado a partir de resultados de búsqueda fijados, con citas de números, enlaces e imágenes del material recuperado.
- Tool calling y flujo de agente multironda: selecciona herramientas de búsqueda y consulta de avisos, con una media de 4,34 llamadas y 4,53 rondas por consulta en la evaluación de agente.
- Modo de pensamiento (thinking) limitado al primer turno, replicando el flujo de la aplicación de producción.
- Comprensión de imágenes de entrada (pipeline image-text-to-text heredado del modelo base), aunque en el entrenamiento las imágenes se sustituyeron por el marcador textual `[그림]`.
- Capacidades multilingües del modelo base, aunque el adaptador está especializado exclusivamente en coreano.
- Supresión de artefactos no deseados: 0,0% de salida de código o HTML y 0,3% de espaciado incorrecto en números (frente al 65,9% del base).

## Casos de uso

- Atención al cliente universitaria automatizada: el adaptador gestiona consultas sobre avisos y normativas con recuperación de documentos y respuestas citadas, gracias a su entrenamiento específico en el formato RAG de Soonlife.
- Asistente interno de secretaría académica: responde preguntas sobre reglamentos con referencias verificables a números, enlaces e imágenes del material oficial, reduciendo datos inventados (0,0% de números no presentes en el material en la evaluación de agente).
- Pipeline de agentes con tool calling: integrable en flujos que requieren búsqueda iterativa y consulta de avisos, con una tasa de consultas duplicadas del 3,3% que evita bloqueos por parte de la aplicación.
- Generación de respuestas con control de calidad previo: la tasa de reescritura tras la comprobación de calidad es del 17,4%, comparable al profesor de 27B (17,1%), lo que reduce la latencia y el coste de postprocesado.
- Destilación y ajuste fino de dominio: sirve como referencia reproducible para adaptar un modelo de 9B a un dominio vertical con datos generados por un profesor mayor, incluyendo los registros de entrenamiento publicados.
- Despliegue en producción con cuantización: el autor publica una versión FP8 dynamic para servir con vLLM, con una latencia mediana de 11 segundos en el flujo RAG y 32 segundos en el flujo de agente.
- Investigación en evaluación de agentes: los conjuntos de test de 314 preguntas RAG y 92 preguntas de agente permiten reproducir las comparativas entre versiones.

## Benchmarks y rendimiento

Evaluación en el split de test de 314 preguntas RAG (resultados de búsqueda fijados, vLLM FP8, temperature 0,1, max_tokens 4096, sin thinking):

| Métrica | teacher (27B) | base | lora-v1 | lora-v2 |
|---|---:|---:|---:|---:|
| Respuestas vacías ↓ | 0,0% | 0,0% | 0,0% | 0,0% |
| Empieza por "no encontrado" ↓ | 7,3% | 3,5% | 6,7% | 9,2% |
| Números no presentes en el material ↓ | 0,0% | 2,5% | 1,0% | 1,3% |
| Enlaces no presentes en el material ↓ | 1,6% | 3,8% | 1,9% | 2,9% |
| Imágenes no presentes en el material ↓ | 0,0% | 1,6% | 0,6% | 0,6% |
| Respuestas con imagen ↑ | 11,5% | 11,1% | 9,9% | 10,5% |
| Recuperación de números del teacher ↑ | 1,00 | 0,61 | 0,80 | 0,81 |
| Espaciado incorrecto en números ↓ | 0,0% | 65,9% | 0,3% | 0,3% |
| Salida de código/HTML ↓ | 0,0% | 10,2% | 0,0% | 0,0% |
| Emojis ↓ | 13,7% | 15,9% | 14,0% | 12,7% |
| Longitud mediana de respuesta | 868 | 921 | 802 | 832 |
| Truncamiento por límite ↓ | — | 0,0% | 0,0% | 0,0% |
| Tiempo mediano (s) ↓ | — | 14 | 11 | 11 |

Evaluación en flujo de agente con 92 preguntas (herramientas de búsqueda y avisos, thinking solo en el primer turno, comprobación de calidad de la aplicación):

| Métrica | lora-v1 | lora-v2 | lora-v2b |
|---|---:|---:|---:|
| Respuestas vacías ↓ | 0,0% | 0,0% | 0,0% |
| Empieza por "no encontrado" ↓ | 16,3% | 16,3% | 19,6% |
| Números no presentes en el material ↓ | 1,1% | 0,0% | 3,3% |
| Enlaces no presentes en el material ↓ | 0,0% | 0,0% | 0,0% |
| Imágenes no presentes en el material ↓ | 0,0% | 0,0% | 0,0% |
| Respuestas con imagen ↑ | 9,8% | 9,8% | 7,6% |
| Espaciado incorrecto en números ↓ | 0,0% | 0,0% | 0,0% |
| Salida de código/HTML ↓ | 0,0% | 0,0% | 0,0% |
| Emojis ↓ | 12,0% | 12,0% | 12,0% |
| Longitud mediana de respuesta | 624 | 712 | 684 |
| Responde sin usar herramientas ↓ | 1,1% | 0,0% | 0,0% |
| Llamadas a herramientas (media) | 5,29 | 4,34 | 5,08 |
| Rondas (media) | 5,74 | 4,53 | 5,39 |
| Consulta de avisos original ↑ | 28,3% | 30,4% | 28,3% |
| Reescritura tras comprobación de calidad ↓ | 27,2% | 17,4% | 25,0% |
| Truncamiento por límite ↓ | 0,0% | 0,0% | 0,0% |
| Tiempo mediano (s) ↓ | 35 | 32 | 37 |

La reducción de consultas duplicadas de v1 a v2 es estadísticamente significativa (p=0,04); la diferencia entre v2 y v2b en reescrituras no lo es (p=0,19).

## Requisitos de hardware

- VRAM estimada para el modelo base de 9B: ~18 GB en bf16, ~9-10 GB en FP8, ~5-6 GB en cuantización de 4 bits (no confirmado por el autor).
- El adaptador LoRA en sí ocupa 0,3 GB (repositorio) y se carga sobre el modelo base.
- GPU recomendadas: H100 para entrenamiento (3,5 horas documentadas); para inferencia, A100 40/80 GB o H100 para bf16, y GPUs con 24 GB (RTX 4090, L40S) para FP8 o cuantizaciones de 4 bits.
- Cabe en GPU de consumo (RTX 4090, 24 GB) con FP8 o cuantización de 4 bits; en bf16 requiere al menos 24 GB y puede ajustarse con offloading.
- Opciones de despliegue: vLLM (configuración usada por el autor: FP8, temperature 0,1, max_tokens 4096), transformers + PEFT, y versiones derivadas FP8 dynamic y bf16 fusionada.
- Latencia medida: 11 s de mediana en flujo RAG y 32 s de mediana en flujo de agente (vLLM FP8). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Soonlife-Qwen3.5-9B-v2-LoRA | ~9B (adaptador LoRA) | 32.768 tokens de entrenamiento | RAG vertical con tool calling, coreano | Apache 2.0 | Hugging Face (adaptador, FP8, bf16 fusionado) |
| Qwen/Qwen3.5-9B (base) | ~9B | No disponible | Modelo multimodal generalista | No disponible en la información | Hugging Face |
| Qwen3.8-27B (profesor) | 27B | No disponible | Generación de datos de destilación | No disponible en la información | No disponible |
| Soonlife-Qwen3.5-9B-v2b-FP8 | ~9B | 32.768 tokens de entrenamiento | Variante con 1,0 época | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- El adaptador está especializado en el chatbot RAG de avisos y normativas de la Universidad de Soonchunhyang; fuera de su system prompt y esquema de herramientas no se garantiza mejora sobre Qwen3.5-9B.
- Solo está entrenado en coreano; su uso en castellano u otros idiomas no está validado.
- El 9,2% de las respuestas RAG empieza por "no encontrado" (frente al 6,7% de v1 y el 7,3% del profesor); parte de ese porcentaje corresponde a respuestas parciales que primero declaran la ausencia de información.
- El 2,9% de las respuestas RAG incluye enlaces no presentes en el material recuperado (frente al 1,9% de v1), lo que supone un riesgo de referencias inventadas.
- En el flujo de agente, el 16,3% de las respuestas empieza por "no encontrado", muy por encima del 7,2% del profesor; es la brecha principal pendiente.
- La torre de visión y los pesos MTP no se entrenaron; al activar decodificación especulativa la tasa de aceptación puede ser ligeramente inferior a la del modelo base.
- Riesgo de alucinación en números y enlaces fuera del material recuperado, aunque reducido respecto al base (0,0% de números inventados en el flujo de agente).
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B debe verificarse por separado.
- El rendimiento se midió con una configuración concreta de vLLM (FP8, temperature 0,1, max_tokens 4096); otras configuraciones pueden alterar los resultados.

## Enlaces

- Adaptador LoRA: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2-LoRA
- Versión FP8 dynamic: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2-FP8
- Versión bf16 fusionada: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2
- Variante v2b (1,0 época): https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2b-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/wonchandev/Soonlife_dataset
