# SwetieePawsss/Qwen2.5-7B-Instruct-DUET-LoRA-merged

## Resumen

Qwen2.5-7B-Instruct-DUET-LoRA-merged es un ajuste fino del modelo Qwen/Qwen2.5-7B-Instruct realizado por SwetieePawsss mediante LoRA (rango 32, alpha 64) sobre el conjunto de datos DUET, con el adaptador fusionado en los pesos base. No se trata de un modelo generalista al uso, sino de un artefacto de investigación orientado al estudio del *unlearning* (olvido selectivo de hechos) y a cómo el ajuste fino altera la retención de información factual. El modelo acompaña al paper "Anatomy of Unlearning: The Dual Impact of Fact Salience and Model Fine-Tuning" (Findings de ACL 2026).

Arquitectura y tamaño son los del modelo base: un transformer decoder-only de 7.615.616.512 parámetros (7,61 mil millones) en precisión bf16, publicado en formato safetensors y con licencia Apache 2.0. El repositorio ocupa 15,2 GB. El contexto heredado del base es de 32.768 tokens, aunque el autor no lo documenta explícitamente en la model card.

Su relevancia es doble: por un lado, permite reproducir los experimentos del paper sobre saliencia de hechos y fine-tuning; por otro, sirve como condición experimental controlada frente al modelo base sin ajustar. No cuenta con descargas ni validación de la comunidad en el momento de la ficha, y su ámbito declarado es únicamente el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), con RoPE, SwiGLU, RMSNorm y atención GQA |
| Parametros totales | 7.615.616.512 (7,61 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen2.5-7B-Instruct; no declarado en la model card) |
| Tipos de cuantizacion | No publicados por el autor; pesos bf16 safetensors. Al derivar de Qwen2.5-7B-Instruct, es convertible a GGUF, AWQ o GPTQ con herramientas estándar |
| Idiomas soportados | Inglés (declarado en la model card); el base soporta 29 idiomas, pero este ajuste no los declara |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7,61 mil millones de parámetros con atención de consultas agrupadas (GQA), normalización RMSNorm, activación SwiGLU y embeddings posicionales rotatorios (RoPE). Sobre esa base se aplicó un ajuste fino con LoRA de rango 32 y alpha 64, con tasa de aprendizaje 2e-4, planificador coseno, 3 épocas y semilla 0. Posteriormente, el adaptador se fusionó en los pesos base, de modo que el repositorio contiene un modelo denso estándar sin adaptadores separados y puede cargarse directamente con `AutoModelForCausalLM`.

Los datos de entrenamiento provienen de una versión temprana (2025) del dataset DUET, en su split `filtered`. Según el autor, las preguntas coinciden con DUET v1.0 salvo por una limpieza menor de texto. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset en la información disponible, más allá de su vinculación con el estudio de saliencia de hechos. Tampoco se documenta el uso de RLHF o DPO en este ajuste concreto; el pipeline de post-entrenamiento del modelo base no se detalla en la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés, con la plantilla de chat del modelo base (`tokenizer.apply_chat_template`).
- Razonamiento y respuesta a preguntas factuales, condicionados por el ajuste sobre DUET.
- Capacidades heredadas del base Qwen2.5-7B-Instruct: generación de código, matemáticas y razonamiento multi-paso (no revalidadas tras el ajuste).
- Soporte de tool calling y function calling heredado de la plantilla de chat de Qwen2.5 (no documentado específicamente para este checkpoint).
- Capacidad de actuar como condición experimental en estudios de *unlearning*: reproduce el comportamiento de un modelo expuesto a los hechos de DUET.
- No incluye visión, audio ni modo "thinking" explícito.
- Multilingüismo limitado: el autor declara únicamente inglés para este ajuste.

## Casos de uso

- Reproducción de experimentos de *unlearning*: cargar el checkpoint como condición "modelo ajustado" y comparar la retención de hechos frente al base Qwen2.5-7B-Instruct y frente a variantes sometidas a algoritmos de olvido.
- Estudio de saliencia de hechos: usar el modelo para medir cómo la frecuencia y prominencia de un hecho en el corpus de ajuste afectan a su recuperación posterior en generación libre.
- Línea base en evaluación de olvido selectivo: servir como referencia de "modelo no olvidado" en pipelines que aplican técnicas como gradient ascent, preferencias negativas o task arithmetic.
- Análisis de degradación factual: comparar las respuestas del modelo con las del base sobre un conjunto de preguntas de DUET para cuantificar la deriva introducida por el ajuste fino con LoRA.
- Generación de texto en inglés para prototipos de investigación: al ser un transformer Qwen2.5 estándar, puede integrarse en scripts de `transformers` para generar respuestas controladas en experimentos académicos.
- Evaluación de robustez de la plantilla de chat: probar cómo distintos formatos de prompt afectan a la elicitación de hechos aprendidos durante el ajuste, útil para diseñar protocolos de evaluación reproducibles.
- Docencia y divulgación: ejemplo práctico y ligero (15,2 GB) de cómo un LoRA fusionado modifica el comportamiento factual de un modelo de 7B sin cambiar su arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de *unlearning*, y el paper asociado no aporta cifras en el material proporcionado.

## Requisitos de hardware

- VRAM estimada en bf16: entre 17 y 20 GB considerando pesos (15,2 GB) más caché KV y activaciones para contextos moderados (4k-8k tokens).
- VRAM estimada con cuantización de 8 bits: en torno a 9-11 GB.
- VRAM estimada con cuantización de 4 bits (GGUF Q4_K_M): en torno a 5-7 GB, incluyendo contexto.
- GPU profesionales: A100 40/80 GB, H100 80 GB o L40S para inferencia por lotes y contextos cercanos a 32k tokens.
- GPU de consumo: cabe en bf16 en una RTX 4090 (24 GB) o RTX 3090 (24 GB); en tarjetas de 12 GB (RTX 3060, 4070) requiere cuantización de 4-8 bits; en 8 GB solo con cuantización agresiva y contextos cortos.
- Opciones de despliegue: `transformers` de forma nativa (safetensors), vLLM y TGI para serving; llama.cpp u Ollama tras convertir los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Benchmarks publicados |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-DUET-LoRA-merged | 7,61B | 32.768 (heredado) | Apache 2.0 | Ajuste de investigación sobre DUET (*unlearning*) | No disponibles |
| Qwen2.5-7B-Instruct | 7,61B | 32.768 | Apache 2.0 | Asistente generalista e instrucciones | Sí, en la model card del base |
| Mistral-7B-Instruct-v0.3 | 7,25B | 32.768 | Apache 2.0 | Asistente generalista, function calling | Sí, en la model card del base |
| Llama-3.1-8B-Instruct | 8,03B | 128.000 | Llama 3.1 Community License | Asistente generalista multilingüe | Sí, en la model card del base |

La comparación relevante es contra el propio Qwen2.5-7B-Instruct: misma arquitectura, mismo número de parámetros y misma licencia, con la diferencia concentrada en el comportamiento factual inducido por el ajuste con DUET. Frente a Mistral-7B-Instruct-v0.3 y Llama-3.1-8B-Instruct, este checkpoint no compite en capacidades generales, sino en su valor como artefacto reproducible de investigación.

## Limitaciones y advertencias

- Ámbito lingüístico restringido: el autor declara únicamente inglés; el rendimiento en castellano no está evaluado y previsiblemente es inferior al del base.
- Ausencia total de benchmarks: no hay métricas publicadas que permitan comparar su calidad factual o conversacional con el modelo base.
- Naturaleza experimental: es un ajuste de investigación sobre *unlearning*, no un asistente listo para producción; su comportamiento factual puede diferir del base de forma no documentada.
- Riesgo de alucinación: inherente a los modelos de 7B; el ajuste sobre un dataset factual no garantiza respuestas correctas fuera de la distribución de DUET.
- Sesgos: los del modelo base Qwen2.5-7B-Instruct, no evaluados ni mitigados en este ajuste.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye sin garantías y sin soporte del autor; conviene conservar el aviso de licencia y la atribución al modelo base.
- Contexto: los 32.768 tokens son un dato heredado, no verificado en la model card de este checkpoint; el autor no documenta si el ajuste altera la ventana efectiva.
- Requiere usar la plantilla de chat (`apply_chat_template`); prompts sin formato pueden degradar notablemente la calidad de las respuestas.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de informes independientes sobre su comportamiento.
- No dispone de vision, audio ni modo de razonamiento extendido; no debe usarse en tareas multimodales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SwetieePawsss/Qwen2.5-7B-Instruct-DUET-LoRA-merged
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset DUET: https://huggingface.co/datasets/SwetieePawsss/DUET
- Paper en ACL Anthology: https://aclanthology.org/2026.findings-acl.1287/
- Paper en arXiv: https://arxiv.org/abs/2602.19612
- Colección DUET: Anatomy of Unlearning: https://huggingface.co/collections/SwetieePawsss/duet-anatomy-of-unlearning-6adbb5695dfb6f3e25293251
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
