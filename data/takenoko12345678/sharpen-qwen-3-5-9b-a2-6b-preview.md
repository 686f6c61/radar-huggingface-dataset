# Takenoko12345678/Sharpen-Qwen-3.5-9B-A2.6B-Preview

## Resumen

Sharpen-Qwen-3.5-9B-A2.6B-Preview (nombre en clave **Astrantia**) es un derivado podado de Qwen3.5-35B-A3B desarrollado por el usuario independiente Takenoko12345678. No es un modelo oficial de Qwen. Se trata de un recorte de mezcla de expertos (MoE) que reduce el modelo original de 35B a aproximadamente 9,4B de parámetros totales (un 73% menos), manteniendo la arquitectura MoE con unos 2,6B de parámetros activos por token. El modelo conserva 116 de los 256 expertos por capa y el router sigue seleccionando el top-8.

La versión publicada es la **Preview 2**, que sustituye a la Preview 1 en el repositorio (esta permanece en el historial de commits). La diferencia clave respecto a la Preview 1 es el criterio de selección de neuronas: ahora se eligen tanto con texto de chat (código y matemáticas) como con texto de conocimiento general, y el recorte se "cura" con LoRA y se destila contra la distribución de salida del modelo original. Esto mejora sustancialmente la retención de hechos (de 19 a 52 respuestas correctas sobre 120) sin empeorar el resto de métricas de razonamiento e instrucciones.

Es relevante porque demuestra una técnica de poda de expertos con anchos desiguales que mantiene el modelo como MoE (sin fusionarlo a denso), algo poco habitual en el ecosistema. Sin embargo, el propio autor lo etiqueta explícitamente como *research preview* y no como asistente general: alucina hechos con frecuencia y rompe en idiomas distintos del inglés. Está pensado para experimentación, no para producción sensible a la veracidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) derivado de Qwen3.5-35B-A3B; 256 expertos por capa, top-8 enrutados, expertos de ancho desigual (28.160 neuronas por capa en total) |
| Parametros totales | 2.427.384.448 según safetensors; el autor declara ~9,4B en la model card (ver advertencia más abajo) |
| Parametros activos | ~2,6B por token (2,63B por el conteo ponderado por router) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen3.5-35B-A3B lo define; los benchmarks usan hasta 32.768 tokens nuevos de generación) |
| Tipos de cuantizacion | bf16 (checkpoint completo) y GGUF Q4_K_M (10,6 GB) |
| Idiomas soportados | Inglés (declarado); el autor advierte que japonés y otros idiomas no ingleses están "rotos" |
| Licencia | Apache 2.0 (sujeta a verificación contra la licencia del modelo base Qwen3.5-35B-A3B) |
| Formato de pesos | safetensors (checkpoint "uneven" con expertos reales en ficheros por capa, requiere `load_uneven.py`), repo "padded" en bf16 y GGUF Q4_K_M |

Nota sobre el recuento de parámetros: los safetensors reportan 2,43B, mientras que la model card afirma ~9,4B. La discrepancia probablemente se debe a que el checkpoint "uneven" almacena los expertos reales de forma dispersa y los placeholders no cuentan como parámetros densos. El GGUF (10,6 GB en Q4_K_M) es coherente con un modelo de ~9,4B. Se recomienda validar el recuento real antes de planificar despliegues.

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-35B-A3B, un transformer MoE con 256 expertos por capa y enrutamiento top-8. La poda no elimina expertos completos de forma uniforme: cada experto conserva su propio número de neuronas, con un total de 28.160 neuronas por capa (equivalente al recuento de parámetros de Qwen3.5-9B). Se retienen 116 de los 256 expertos por capa. Las neuronas se seleccionan por importancia medida en el modelo original, usando texto de chat (código y matemáticas, 7/8 del peso) y texto de conocimiento general (1/8). Añadir el texto general es lo que recuperó los hechos: con la destilación posterior, la divergencia KL en texto general bajó de 1,60 (Preview 1) a 1,18.

El proceso de "curación" aplica tres pasos LoRA de rango 16 sobre atención, Gated DeltaNet y el experto compartido (routers y expertos enrutados quedan fijos), seguido de destilación a nivel de token contra las top-20 log-probabilidades del modelo original sobre unos 2,2M tokens de chat, razonamiento y texto de Wikipedia (la cola de la distribución se agrupa en un único bucket). Una decisión técnica destacable es que **no se fusiona en un modelo denso**: permanece como MoE. La KL frente al original en chat retenido es de 0,126 (frente a 0,143 en Preview 1).

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones en inglés.
- Razonamiento con modo "thinking" (hasta 32.768 tokens nuevos; el autor advierte que tiende a bucles en respuestas largas con thinking activado).
- Conocimiento factual limitado: 52 de 120 hechos cortos correctos en la evaluación del autor (40 incorrectos, 28 "no lo sé").
- Razonamiento matemático y resolución de problemas tipo AIME (resultados reducidos y parciales).
- Generación de código evaluada con LiveCodeBench v6 (conjunto reducido de 175 problemas).
- Seguimiento de instrucciones evaluado con IFEval (541 prompts, modo estricto).
- Capacidad multilingüe muy limitada: solo inglés fiable; el japonés y otros idiomas no ingleses producen bucles y mezcla de palabras en chino.
- No se documenta soporte de tool calling, function calling, agentes ni visión en la información disponible.

## Casos de uso

- **Investigación sobre poda de MoE**: el modelo sirve como caso de estudio reproducible de poda de expertos con anchos desiguales, destilación y curación con LoRA. Adecuado para quienes investigan compresión de modelos y quieren comparar recortes con y sin texto de conocimiento general.
- **Prototipado de asistentes conversacionales en inglés**: para demos y pruebas de concepto donde la veracidad factual no es crítica y se puede tolerar cierto nivel de alucinación, con despliegue ligero en una sola GPU de consumo.
- **Generación de código asistida en entornos controlados**: dado que el modelo mantiene capacidad de código (LiveCodeBench reducido), puede usarse como autocompletado o generación de fragmentos en herramientas internas, siempre con revisión humana.
- **Evaluación comparativa de derivados de Qwen**: útil como referencia para comparar el impacto de distintas estrategias de poda frente al Qwen3.5-9B denso y a otros recortes como NeoHorse-1-9B.
- **Destilación y ajuste fino posteriores**: al estar bajo Apache 2.0 y disponible en safetensors y GGUF, sirve como base para experimentos de fine-tuning o destilación adicional en inglés.
- **Despliegue en hardware modesto con llama.cpp**: el GGUF Q4_K_M (10,6 GB) permite ejecución en CPU o GPU de consumo para pruebas de inferencia sin infraestructura dedicada, aunque no se han publicado benchmarks sobre esta cuantización.
- **Generación de texto con recuperación aumentada (RAG)**: el autor sugiere explícitamente usar el modelo solo con hechos procedentes de búsqueda o documentos proporcionados, por lo que encaja en pipelines RAG donde el contexto externo aporta la veracidad.

## Benchmarks y rendimiento

Resultados en bf16, thinking activado, una GPU RTX PRO 6000 (GCP G4), vLLM, temperatura 0,6, top-p 0,95, top-k 20, sin semilla, hasta 32.768 tokens nuevos, sin límite de thinking. Una muestra por pregunta (AIME: tres). Los resultados de Preview 2 están marcados como TBD por el autor; se muestran los de Preview 1 como referencia.

| Benchmark | Preview 2 | Preview 1 | NeoHorse-1-9B | Qwen3.5-9B |
|---|---:|---:|---:|---:|
| AIME 2026 (30 problemas, media de 3) | TBD | 20,7 | 20,3 | 22,3 |
| MMLU-Pro (280 de 12.032 preguntas) | TBD | 144 | 221 | 226 |
| LiveCodeBench v6 (175 problemas de v6) | TBD | 68 | 96 | 87 |
| IFEval (541 prompts, estricto) | TBD | 362 | – | – |
| Respuestas que alcanzan el límite de 32k (AIME / MMLU-Pro / LCB) | TBD | 27/90 · 41/280 · 95/175 | – · 3/280 · – | – |

Advertencias del autor: MMLU-Pro es un conjunto reducido (20 preguntas de cada una de las 14 materias), no comparable con puntuaciones de conjunto completo publicadas. LiveCodeBench v6 usa los 175 problemas añadidos en la release 6, exigiendo que pasen todos los tests públicos y privados. Las mismas 280 preguntas de MMLU-Pro con thinking desactivado se usaron para elegir entre ejecuciones propias, por lo que no son frescas para Astrantia. No se han publicado resultados de benchmarks para la cuantización GGUF.

## Requisitos de hardware

- **VRAM estimada en bf16**: el checkpoint "uneven" ocupa ~19 GB, por lo que se requiere al menos ~20-24 GB de VRAM para inferencia en bf16 con margen para KV cache.
- **VRAM estimada en Q4_K_M**: el GGUF pesa 10,6 GB (incluye el padding de ceros, por lo que es mayor de lo que necesitaría un modelo de 9,4B), lo que permite ejecución en GPUs de 12-16 GB o incluso en CPU.
- **GPU recomendadas**: RTX PRO 6000 (usada por el autor para benchmarks), A100 o H100 para bf16 con contexto largo; RTX 4090 (24 GB) suficiente para bf16 con contexto moderado.
- **GPU de consumo**: sí cabe en RTX 4090 en bf16 y en GPUs de 12-16 GB con Q4_K_M; el autor probó la cuantización con llama.cpp en CPU.
- **Opciones de despliegue**: vLLM (usado por el autor), llama.cpp (verificado en CPU con `llama-completion`), MLX en Mac (4-bit, usado en las pruebas de hechos). No se mencionan Ollama ni TGI.
- **Latencia y throughput**: no disponibles. El autor solo reporta que el GGUF Q4_K_M resolvió correctamente tres prompts cortos (17 × 23 = 391, un `is_prime` correcto y una respuesta correcta de dos frases sobre por qué el cielo es azul), sin benchmarks de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | MMLU-Pro (reducido) | LiveCodeBench v6 (reducido) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Sharpen-Qwen-3.5-9B-A2.6B-Preview 2 | ~9,4B (MoE) | ~2,6B | no disponible | TBD (Preview 1: 144) | TBD (Preview 1: 68) | Apache 2.0 | HF (safetensors + GGUF) |
| NeoHorse-1-9B | 9B (denso) | 9B | no disponible | 221 | 96 | no disponible | HF |
| Qwen3.5-9B | 9B (denso) | 9B | no disponible | 226 | 87 | no disponible | HF |
| Qwen3.5-35B-A3B (base) | 35B (MoE) | 3B | no disponible | no disponible | no disponible | Apache 2.0 (según base) | HF |

La comparativa debe interpretarse con cautela: los conjuntos son reducidos y los resultados de Preview 2 no están publicados. En Preview 1, el recorte queda por debajo de los modelos densos de 9B en MMLU-Pro (144 frente a 221 y 226) y en LiveCodeBench (68 frente a 96 y 87), aunque con muchos más casos que agotan el límite de tokens (27/90 en AIME, 41/280 en MMLU-Pro, 95/175 en LCB).

## Limitaciones y advertencias

- **Alucinación factual elevada**: 4 de cada 10 hechos que responde son incorrectos; describe cosas inexistentes (27 de 40 nombres inventados descritos como reales, frente a 32 rechazos del original). No usar donde la veracidad importe salvo con búsqueda o documentos aportados.
- **Bucles en generación larga**: con thinking activado, muchas respuestas largas se repiten hasta el límite de tokens (95 de 175 problemas de LiveCodeBench alcanzaron el límite de 32k).
- **Multilingüe roto**: japonés y otros idiomas no ingleses producen bucles y palabras en chino. Leer funciona mejor que escribir; se recomienda preguntar en inglés o interponer un modelo de traducción.
- **Sesgos**: no documentados en la información proporcionada.
- **Licencia**: Apache 2.0, pero el autor marca explícitamente que debe verificarse contra la licencia del modelo base Qwen3.5-35B-A3B; confirmar antes de uso comercial.
- **Recuento de parámetros inconsistente**: safetensors reporta 2,43B frente a los ~9,4B declarados; validar el tamaño real antes de dimensionar infraestructura.
- **Formato de carga no estándar**: el checkpoint "uneven" requiere `load_uneven.py` y `uneven.py`, o bien usar el repo "padded"; no es un checkpoint transformers convencional.
- **Preview de investigación**: el autor lo declara explícitamente no apto como asistente general; los benchmarks de Preview 2 están sin publicar (TBD) y los de Preview 1 usan conjuntos reducidos no comparables con puntuaciones completas.
- **GGUF sin benchmarks**: la cuantización Q4_K_M solo se verificó con tres prompts cortos; no hay datos de rendimiento ni de degradación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Takenoko12345678/Sharpen-Qwen-3.5-9B-A2.6B-Preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Repo "padded" (bf16): https://huggingface.co/Takenoko12345678/Sharpen-Qwen-3.5-9B-A2.6B-Preview-padded (referenciado en la model card; URL inferida del texto)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
