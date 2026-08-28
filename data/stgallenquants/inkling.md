# stgallenquants/Inkling

## Resumen

Inkling es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, el laboratorio fundado por Mira Murati, y publicado con pesos abiertos bajo licencia Apache 2.0. Acepta entradas de texto, imagen y audio, y genera salidas de texto. Está diseñado para desarrolladores que construyen aplicaciones basadas en IA, incluyendo sistemas agénticos, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). Se presenta como el primer modelo del laboratorio y compite directamente con modelos cerrados de frontera como Gemini 3.1 Pro o GPT 5.6 Sol, según los benchmarks publicados.

Arquitectónicamente es un transformador decoder-only de 66 capas con una red feed-forward de mezcla de expertos (MoE) dispersa: cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos siempre activos. El modelo tiene 975B parámetros totales (según la model card) y 41B activos por token, aunque los pesos en safetensors del repositorio suman aproximadamente 952B. La atención es híbrida, combinando capas locales y globales. El contexto máximo no se especifica en la documentación disponible.

La relevancia de Inkling radica en su carácter abierto con un rendimiento competitivo en razonamiento, matemáticas y codificación agéntica, además de su capacidad multimodal nativa (texto, imagen y audio) en un solo modelo. Se puede desplegar localmente con librerías como SGLang, vLLM o Unsloth, y también está disponible vía API en proveedores de inferencia de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador decoder-only de 66 capas con MoE dispersa (256 expertos, 6 activos + 2 compartidos) y atención híbrida local/global |
| Parametros totales | 975B (según model card); 952.377.623.626 según pesos safetensors |
| Parametros activos | 41B (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, NVFP4 |
| Idiomas soportados | Inglés principal, con capacidades multilingües generales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, NVFP4) |

## Arquitectura y entrenamiento

Inkling es un transformador autoregresivo multimodal. El backbone es un decoder-only de 66 capas con una capa feed-forward MoE dispersa: cada token activa 6 de 256 expertos, más 2 expertos compartidos que se aplican siempre. La atención combina capas locales y globales, lo que permite manejar secuencias largas con un coste computacional reducido. Las imágenes y el vídeo se codifican mediante un codificador de parches jerárquico, mientras que el audio se codifica mediante tokens discretos; todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decodificador.

Los datos de entrenamiento incluyen una amplia variedad de contenidos: texto, imágenes, audio y vídeo, procedentes de fuentes públicas, adquisiciones a terceros o generación sintética. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad o con fines de seguridad. No se especifican el número total de tokens ni la composición exacta del dataset. Tampoco se detalla si se usaron técnicas de alineación como RLHF o DPO; la model card solo menciona que se aplicaron filtros de seguridad durante la curación.

## Capacidades

- Generación de texto: respuestas conversacionales, instrucción y tareas de lenguaje natural en inglés y otros idiomas.
- Razonamiento y matemáticas: resultados destacados en HLE (29.7% sin herramientas, 46.0% con herramientas) y AIME 2026 (97.1%).
- Codificación: soporte de múltiples lenguajes de programación y rendimiento agéntico en SWEBench Verified (77.6%) y SWEBench Pro Public (54.3%).
- Tool calling y uso de herramientas: el modelo puede integrar herramientas externas, como se refleja en la mejora de HLE con herramientas (46.0% frente a 29.7% sin ellas).
- Capacidades agénticas: diseñado para sistemas de agente y razonamiento multi-paso, con resultados competitivos en benchmarks de codificación agéntica.
- Multimodalidad: acepta entradas de texto (UTF-8), imágenes en cualquier formato basado en píxeles (idealmente entre 40px y 4096px por dimensión) y audio WAV a 16 kHz (idealmente menos de 20 minutos).
- Salida de texto: genera únicamente texto UTF-8; no genera imágenes ni audio.

## Casos de uso

- Asistentes de codificación en producción: con soporte de tool calling y un rendimiento de 77.6% en SWEBench Verified, Inkling puede integrarse en IDE o pipelines de CI/CD para sugerir parches, revisar código o automatizar tareas de refactorización.
- Sistemas agénticos autónomos: su capacidad para razonar multi-paso y usar herramientas permite construir agentes que navegan repositorios, ejecutan comandos y resuelven issues reales, como se demuestra en SWEBench Pro.
- Chatbots de atención al cliente multilingües: al aceptar texto e imagen, puede procesar capturas de pantalla o documentos escaneados junto con consultas de usuario, manteniendo conversaciones multi-turno en varios idiomas.
- Análisis de documentos multimodales: combinando entradas de imagen (diagramas, gráficos) y texto, es útil para extraer información de informes, facturas o material técnico.
- Asistentes de voz o audio: al aceptar audio WAV a 16 kHz, puede transcribir y procesar consultas habladas, aunque la salida es solo texto; se puede combinar con un motor de síntesis de voz.
- Investigación y fine-tuning: al ser de pesos abiertos con licencia Apache 2.0, es adecuado para experimentación académica, ajuste fino con Unsloth o adaptación a dominios específicos.
- RAG (generación aumentada por recuperación): su capacidad de instrucción y contexto largo (aunque no se especifica el máximo) permite construir sistemas de preguntas y respuestas sobre corpus corporativos.

## Benchmarks y rendimiento

La model card reporta resultados a effort=0.99, comparados con modelos abiertos (Nemotron 3 Ultra, Kimi K2.5, Kimi K2.6, GLM 5.2, DeepSeek V4 Pro) y cerrados (Gemini 3.1 Pro, Claude Fable 5, GPT 5.6 Sol). Fecha de comparación: 14 de julio de 2026.

| Benchmark | Inkling | Nemotron 3 Ultra | Kimi K2.5 | Kimi K2.6 | GLM 5.2 | DeepSeek V4 Pro | Gemini 3.1 Pro (high) | Claude Fable 5 (max) | GPT 5.6 Sol (xhigh) |
|---|---|---|---|---|---|---|---|---|---|
| HLE (text only) | 29.7% | 26.6% | 29.4% | 35.9% | 40.1% | 35.9% | 44.7% | 53.3% | 47.2% |
| HLE (with tools) | 46.0% | 37.4% | 50.2% | 54.0% | 54.7% | 48.2% | 51.4% | 64.5% | 55.0% |
| AIME 2026 | 97.1% | 94.2% | 95.8% | 96.4% | 99.2% | 96.7% | 98.3% | – | 99.9% |
| GPQA Diamond | 87.2% | 86.7% | 87.9% | 91.1% | 89.5% | 88.8% | 94.1% | 92.6% | 94.1% |
| SWEBench Verified | 77.6% | 70.7% | 76.8% | 80.2% | – | 80.6% | 80.6% | 95.0% | – |
| SWEBench Pro (Public) | 54.3% | 46.4% | 50.7% | 58.6% | 62.1% | 55.4% | 54.2% | 80.0% | – |

No se proporcionan datos de latencia ni throughput en la documentación.

## Requisitos de hardware

- El tamaño del repositorio es de 1909.2 GB, lo que corresponde a pesos en BF16 de aproximadamente 952B parámetros (más overhead). Inferencia con BF16 requiere al menos ~1.9 TB de memoria solo para pesos.
- No es viable en GPUs de consumo (RTX 4090, 3090, etc.) ni en estaciones de trabajo con una sola GPU. Se necesitan clústeres de GPUs de centro de datos.
- Con cuantización NVFP4, el peso se reduce a aproximadamente la mitad (~950 GB), pero sigue requiriendo múltiples GPUs de alta capacidad (por ejemplo, 12-16 GPUs H100 de 80 GB o equivalentes).
- Opciones de despliegue local: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers. También hay acceso vía API a través de proveedores de inferencia de terceros.
- No se han publicado cifras de latencia ni throughput. Dado el tamaño, se recomienda usar servidores con múltiples GPUs interconectadas (NVLink o InfiniBand) y librerías de inferencia optimizadas como vLLM o SGLang.

## Comparativa con modelos similares

Comparación con modelos abiertos de la misma categoría (MoE multimodal o de propósito general):

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | HLE (text) | SWEBench Verified |
|---|---|---|---|---|---|---|
| Inkling | 975B (952B safetensors) | 41B | no disponible | Apache 2.0 | 29.7% | 77.6% |
| Nemotron 3 Ultra | no disponible | no disponible | no disponible | no disponible | 26.6% | 70.7% |
| Kimi K2.5 | no disponible | no disponible | no disponible | no disponible | 29.4% | 76.8% |
| DeepSeek V4 Pro | no disponible | no disponible | no disponible | no disponible | 35.9% | 80.6% |

Los datos de parámetros, contexto y licencia de los modelos comparados no están disponibles en la información proporcionada. Inkling se posiciona ligeramente por debajo de Kimi K2.6 y GLM 5.2 en razonamiento, pero supera a Nemotron 3 Ultra y es competitivo con DeepSeek V4 Pro en codificación agéntica, aunque por detrás de los modelos cerrados más avanzados.

## Limitaciones y advertencias

- El contexto máximo no está documentado; no se puede garantizar el rendimiento con secuencias muy largas sin pruebas previas.
- Los idiomas distintos del inglés tienen soporte general pero no se especifica el nivel de calidad; puede degradarse en lenguas poco representadas.
- La model card no detalla sesgos específicos, pero al entrenarse con datos públicos de internet, el modelo puede reflejar sesgos sociales, culturales o de género presentes en esos datos.
- Riesgo de alucinación: como todo modelo generativo, puede producir información factualmente incorrecta, especialmente en tareas abiertas. Se recomienda verificar salidas críticas.
- El modelo solo genera texto; no produce imágenes ni audio, aunque los acepta como entrada.
- Aunque la licencia es Apache 2.0, el uso del modelo está sujeto a la política de uso aceptable de Thinking Machines Lab (enlace en la model card). Es necesario revisarla antes de integrarlo en productos comerciales.
- El tamaño del modelo (~1.9 TB en BF16) implica costes de infraestructura significativos; no es adecuado para despliegues en edge o entornos con recursos limitados.
- Los benchmarks reportados corresponden a un nivel de esfuerzo de inferencia de 0.99; los resultados pueden variar con configuraciones distintas.

## Enlaces

- Repositorio HuggingFace (mirror): https://huggingface.co/stgallenquants/Inkling
- Model card oficial de Thinking Machines Lab: https://thinkingmachines.ai/model-card/inkling/
- Página del producto Inkling: https://thinkingmachines.ai/inkling/
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (ejemplos de API): https://github.com/thinking-machines-lab/tinker-cookbook
- Guía de Inkling en Layer3 Labs: https://www.layer3labs.io/guides/inkling-explained
- Artículo en The Modern Blog: https://www.themodernblog.com/inkling-ai-model-thinking-machines-mira-murati/
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
