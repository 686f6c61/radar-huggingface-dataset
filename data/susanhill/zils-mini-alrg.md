# SusanHill/zils-mini-alrG

## Resumen

zils-mini-alrG es un ajuste fino mediante LoRA del modelo Qwen/Qwen3.5-4B, publicado por el usuario SusanHill en Hugging Face. El modelo se presenta como un "d3-mini soup body", es decir, una variante especializada orientada a tareas de decisión: clasificación, razonamiento de opciones múltiples, análisis de sentimiento y emoción, inferencia de lenguaje natural y recuperación de información. Con 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) y un repositorio de 9,1 GB en formato safetensors, se posiciona como un modelo de tamaño medio apto para despliegue en hardware de gama alta de consumo.

La relevancia de este modelo radica en su enfoque en "decision items", un conjunto de tareas de clasificación y razonamiento que incluye tool calling (Glaive), razonamiento (SIQA, PIQA, CSQA, GSM8K, BIG-bench), artes (emoción, ironía, sarcasmo, sentimiento), lenguaje (MNLI, ANLI, RTE, STS-B) y recuperación (20 Newsgroups, Banking77, QNLI, CLINC). Esto sugiere un modelo orientado a la toma de decisiones estructurada y la clasificación de texto, más que a la generación creativa o conversacional general.

La información pública disponible es muy limitada: no hay datos sobre benchmarks, idiomas soportados, ni detalles sobre el proceso de entrenamiento más allá de la mención del ajuste LoRA sobre el modelo base. La licencia Apache-2.0 permite uso comercial, pero la ausencia de documentación técnica detallada y de resultados de evaluación hace necesaria una validación empírica antes de considerarlo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B, con código personalizado `custom_code`) |
| Parametros totales | 4.539.265.536 (aproximadamente 4,54 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; se podrían aplicar cuantizaciones estándar como GPTQ, AWQ o GGUF, pero no se documentan) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 9,1 GB) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,5 mil millones de parámetros. Sobre esta base se aplicó un ajuste fino con LoRA (Low-Rank Adaptation) sobre lo que el autor denomina "d3-mini soup body", un ensamblaje de modelos o "soup" previo. El entrenamiento se realizó sobre ítems de decisión del split público de entrenamiento, que abarcan tool calling (Glaive), razonamiento (SIQA, PIQA, CSQA, GSM8K, BIG-bench), tareas de artes (emoción, ironía, sarcasmo, sentimiento), tareas de lenguaje (MNLI, ANLI, RTE, STS-B) y tareas de recuperación (20 Newsgroups, Banking77, QNLI, CLINC).

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. La etiqueta `custom_code` indica que el modelo requiere código personalizado para su carga, probablemente debido a la arquitectura o a las modificaciones introducidas en el ajuste. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento de opciones múltiples, entrenado específicamente en tareas como SIQA, PIQA, CSQA, GSM8K y BIG-bench.
- Tool calling y function calling, con entrenamiento en el dataset Glaive.
- Clasificación y análisis de sentimiento, emoción, ironía y sarcasmo.
- Inferencia de lenguaje natural (NLI) y similitud textual (MNLI, ANLI, RTE, STS-B).
- Recuperación de información y clasificación de intenciones (20 Newsgroups, Banking77, QNLI, CLINC).
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- No se documentan capacidades de visión, audio ni modos de pensamiento explícitos.

## Casos de uso

- Clasificación de intenciones en asistentes virtuales: el modelo puede asignar consultas de usuario a categorías predefinidas (por ejemplo, las 77 intenciones de Banking77) gracias a su entrenamiento específico en CLINC y Banking77, lo que lo hace adecuado para enrutamiento de consultas en sistemas de atención al cliente.
- Análisis de sentimiento y emoción en redes sociales: puede clasificar textos breves en categorías de sentimiento, ironía o sarcasmo, útil para monitorización de marca y análisis de opinión pública.
- Tool calling en agentes automatizados: su entrenamiento en Glaive le permite generar llamadas a funciones estructuradas, integrándose en pipelines de agentes que necesitan decidir qué herramienta invocar y con qué parámetros.
- Razonamiento sobre preguntas de sentido común: adecuado para tareas de question answering que requieren inferencia sobre situaciones cotidianas (SIQA, PIQA), como sistemas de tutoría o asistentes educativos.
- Verificación de consistencia textual: puede emplearse en tareas de NLI (MNLI, ANLI, RTE) para detectar contradicciones o implicaciones entre pares de frases, útil en validación de documentos y control de calidad de traducciones.
- Clasificación de documentos y noticias: entrenado en 20 Newsgroups, puede categorizar documentos en temas predefinidos, aplicable a sistemas de archivado y organización de contenido.
- Resolución de problemas matemáticos básicos: su entrenamiento en GSM8K le permite abordar problemas aritméticos de varios pasos, aunque sin datos de rendimiento que confirmen su fiabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16 (aproximadamente 9 GB), se requieren al menos 10-12 GB de VRAM. Con cuantización a 8 bits, alrededor de 5-6 GB; con 4 bits, unos 3-4 GB.
- GPU recomendadas: NVIDIA A100 (40 GB), H100 (80 GB) para despliegue en producción con alta concurrencia; RTX 4090 (24 GB) para inferencia en FP16 sin problemas; RTX 3090 (24 GB) también suficiente.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) con cuantización, y en GPUs de 8 GB solo con cuantización agresiva (4 bits).
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se generan pesos GGUF), Ollama (previa conversión), Transformers con `custom_code` (requiere confiar en el código del repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-mini-alrG | 4,54 B | No disponible | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4 B | No disponible | Apache-2.0 | Hugging Face |
| Mistral-7B-Instruct | 7,2 B | 32k | Apache-2.0 | Hugging Face |
| Llama-3.1-8B-Instruct | 8 B | 128k | Llama 3.1 Community License | Hugging Face |

La comparativa se limita a parámetros y licencia, ya que no hay datos de rendimiento para zils-mini-alrG. Frente a Mistral-7B y Llama-3.1-8B, el modelo de SusanHill es más pequeño y está especializado en tareas de decisión, pero carece de documentación pública sobre contexto y evaluación.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no se puede verificar su rendimiento real en las tareas para las que fue entrenado.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento y generación abierta.
- Sesgos desconocidos: al no documentarse la composición del dataset ni los idiomas, no se pueden evaluar sesgos de género, raza o cultura.
- Limitaciones de idioma: no se especifican los idiomas soportados; probablemente herede el multilingüismo de Qwen3.5-4B, pero sin confirmación.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo incluye `custom_code`, lo que implica ejecutar código del autor; se recomienda auditar dicho código antes de usarlo en producción.
- El modelo es un ajuste LoRA sobre un "soup" previo, lo que puede introducir comportamientos impredecibles no documentados.
- No hay información sobre la longitud de contexto, lo que impide planificar su uso en tareas que requieran ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/SusanHill/zils-mini-alrG
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
