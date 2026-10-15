# SupraLabs/Supra2.1-Ultra-Preview-001

## Resumen

Supra2.1-Ultra-Preview-001 es un modelo de lenguaje base de tipo small language model (SLM) desarrollado por SupraLabs, con 229.688.064 parámetros reales (230M nominales) y una arquitectura Llama densa. Se distribuye bajo licencia Apache-2.0 y está entrenado exclusivamente en inglés sobre aproximadamente 40.400 millones de tokens procedentes de tres corpus públicos: FineWeb-Edu, DCLM-Baseline-1.0 y FineMath. Es, por tanto, un modelo de escala reducida orientado a servir como base para ajuste fino y experimentación, no como asistente listo para producción.

Su relevancia actual reside en dos factores. Primero, la ventana de contexto es de solo 2.048 tokens, muy por debajo de los estándares de 2025 en modelos comparables de su tamaño, lo que lo sitúa como una pieza de investigación más que como herramienta de producto. Segundo, el modelo se publica sin alineamiento (no ha pasado por RLHF ni DPO) y sin evaluación de seguridad, tal y como declara explícitamente el autor. El propio autor advierte de que "probablemente generará texto incorrecto o sesgado".

El entrenamiento se realizó en una única GPU A100 SXM, lo que da una idea del coste computacional contenido del proyecto. El repositorio ocupa 0,5 GB y acumula 509 descargas y 14 "likes" en HuggingFace desde su publicación. La model card usa el identificador `SupraLabs/Supra2.1-Ultra` mientras que el repositorio real es `SupraLabs/Supra2.1-Ultra-Preview-001`, una inconsistencia a tener en cuenta al cargar el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer denso, decoder-only) |
| Parametros totales | 229.688.064 (230M nominales) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (el autor solo publica pesos en bfloat16; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 0,5 GB, precision bfloat16) |
| Capas | 32 |
| Hidden size | 768 |
| Intermediate size (MLP) | 1.920 |
| Cabezas de atencion | 12 (head dim 64) |
| Cabezas KV (GQA) | 4 |
| Tamano de vocabulario | 49.152 |
| RoPE theta | 10.000 |
| Activacion | SiLU (MLP SwiGLU) |
| Embeddings atados | si (tied embeddings) |
| Precision de entrenamiento | bfloat16 |
| Hardware de entrenamiento | 1x A100 SXM |
| Tokens vistos | ~40,4B |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo Llama con 32 capas, hidden size de 768 y MLP intermedio de 1.920 con activación SwiGLU. Usa 12 cabezas de atención con dimensión de cabeza 64 y atención agrupada por consultas (GQA) con solo 4 cabezas KV, lo que reduce el coste de la caché KV en inferencia. Las embeddings de entrada y salida están atadas, un recurso habitual en modelos pequeños para ahorrar parámetros en el vocabulario (49.152 entradas). Emplea RoPE con theta 10.000 y se entrenó en bfloat16. No hay innovaciones arquitectónicas destacables: es un diseño Llama convencional escalado hacia abajo.

El entrenamiento consumió aproximadamente 40.400 millones de tokens sobre tres datasets públicos: HuggingFaceFW/fineweb-edu (corpus web filtrado con criterio educativo), mlfoundations/dclm-baseline-1.0 (DCLM, corpus web curado) y HuggingFaceTB/finemath (contenido matemático). Todo el entrenamiento se ejecutó en una única A100 SXM. No se documenta en la model card la composición exacta de la mezcla, la receta de tokenización, ni ninguna fase de post-entrenamiento: no hay RLHF, no hay DPO y no se menciona ningún ajuste por instrucciones. El autor indica que el código de entrenamiento proviene de Dedeprogames.

## Capacidades

- Generación de texto autoregresiva en inglés: el modelo es un LM base, por lo que completa texto en lugar de seguir instrucciones.
- Razonamiento básico y conocimiento factual limitado, coherente con 230M de parámetros y 40B tokens.
- Competencia matemática incipiente, favorecida por la inclusión de FineMath en el corpus de entrenamiento.
- Aritmética de pocos dígitos y problemas de sentido común simples, según se deduce de sus resultados en PIQA, HellaSwag y Arithmark-v3.
- Soporte de tool calling / function calling: no disponible (modelo base sin alineamiento ni formato de herramientas).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; el modelo está entrenado y etiquetado únicamente en inglés.
- Modo "thinking", visión o audio: no disponible.
- Capacidad como modelo de borrador (draft model) en decodificación especulativa: técnicamente plausible por su tamaño, pero requiere que el tokenizador coincida con el del modelo objetivo, algo que no está garantizado con un vocabulario de 49.152 entradas.

## Casos de uso

- Ajuste fino supervisado para clasificación de texto en inglés: con 230M de parámetros y pesos bfloat16, un SFT completo cabe en una GPU de consumo, lo que lo hace adecuado para tareas de análisis de sentimiento, etiquetado o moderación de dominio específico.
- Investigación en leyes de escalado y ablaciones de entrenamiento: el modelo es reproducible en una sola A100 SXM y su receta de datos es pública, lo que permite usarlo como punto de referencia en estudios sobre mezcla de corpus.
- Generación de datos sintéticos a pequeña escala: puede producir borradores de texto en inglés para aumentar datasets, siempre que se aplique filtrado posterior dada la ausencia de alineamiento.
- Inferencia en el borde (edge) y entornos sin GPU: con pesos en int4 ocuparía alrededor de 115 MB y la caché KV en contexto completo ronda los 67 MB, por lo que es viable en CPU, Raspberry Pi o dispositivos móviles mediante conversión propia a GGUF.
- Prototipado rápido de pipelines de generación de texto: sirve para validar una arquitectura de servicio (TGI, vLLM) antes de sustituir el modelo por uno mayor, dado su bajo coste de descarga (0,5 GB) y arranque.
- Docencia y experimentación académica: es un caso práctico para explicar tokenización, GQA, embeddings atados y evaluación con lm-evaluation-harness sin necesidad de clúster.
- Base para ajuste con LoRA en tareas de dominio (legal, médico, técnico) en inglés: el modelo base no está alineado, así que el ajuste específico por tarea es el camino natural de uso.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (evaluación de 0 shots):

| Benchmark | Shots | acc | acc_norm | Aleatorio |
|---|---|---|---|---|
| HellaSwag | 0 | 31,64 | 37,18 | 25,0 |
| PIQA | 0 | 65,78 | 64,91 | 50,0 |
| ARC-Easy | 0 | 57,11 | 50,46 | 25,0 |
| ARC-Challenge | 0 | 25,00 | 26,28 | 25,0 |
| Arithmark-v3 | 0 | 38,00 | 38,20 | no disponible |
| Open SLM leaderboard's II | - | 20,64 | - | no disponible |

No se han publicado en la información disponible resultados comparativos adicionales (MMLU, HumanEval, GSM8K u otros) ni evaluaciones frente a modelos de la misma escala.

## Requisitos de hardware

- Pesos en bfloat16/fp16: 229.688.064 parámetros x 2 bytes = aproximadamente 0,46 GB. El repositorio completo ocupa 0,5 GB.
- Pesos en int8: aproximadamente 0,23 GB.
- Pesos en int4: aproximadamente 0,12 GB.
- Caché KV con GQA (4 cabezas KV, head dim 64, 32 capas): 32 KB por token en bfloat16, es decir unos 67 MB para los 2.048 tokens de contexto completo.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente. Funciona en RTX 3060, RTX 4060, RTX 4090 y, por supuesto, en A100 y H100 sin aprovechar su capacidad. También es viable en CPU y en aceleradores integrados.
- Cabe en GPU de consumo: sí, con margen amplio, en prácticamente cualquier GPU dedicada de los últimos ocho años, e incluso en iGPU con memoria compartida.
- Opciones de despliegue: transformers (soporte nativo, `AutoModelForCausalLM`), Text Generation Inference (el repo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM y servidores compatibles con la API de OpenAI. Para llama.cpp u Ollama sería necesaria una conversión propia a GGUF, ya que el autor no publica archivos cuantizados.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| Supra2.1-Ultra-Preview-001 | 230M | 2.048 | Apache-2.0 | Open SLM leaderboard's II: 20,64 | HuggingFace, safetensors bf16 |
| SmolLM2-360M (HuggingFaceTB) | 360M | no disponible en esta ficha | Apache-2.0 | no disponible en esta ficha | HuggingFace |
| Pythia-410M (EleutherAI) | 410M | no disponible en esta ficha | Apache-2.0 | no disponible en esta ficha | HuggingFace |
| Qwen2.5-0.5B | 500M | no disponible en esta ficha | Apache-2.0 | no disponible en esta ficha | HuggingFace |

No se dispone de resultados de benchmark de los modelos alternativos dentro de la información proporcionada, por lo que no se puede establecer una comparación de rendimiento fiable. La diferencia más objetiva y verificable es la ventana de contexto de 2.048 tokens de Supra2.1-Ultra, inferior a la de los SLM contemporáneos de su categoría.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no ha pasado por RLHF, DPO ni ajuste por instrucciones. No debe usarse como asistente conversacional directo.
- Sin evaluación de seguridad: el autor declara explícitamente que el modelo no ha sido evaluado en materia de seguridad.
- Riesgo elevado de alucinación y de texto incorrecto o sesgado, reconocido por el propio autor en la model card.
- Sesgos de los corpus web de origen: FineWeb-Edu y DCLM-Baseline son datos raspados de internet y arrastran los sesgos demográficos, culturales y de estilo de esas fuentes.
- Cobertura lingüística restringida al inglés. No se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Ventana de contexto de solo 2.048 tokens, insuficiente para tareas de documento largo, resumen extenso o conversaciones multi-turno prolongadas.
- Rendimiento bajo en razonamiento: 26,28 de acc_norm en ARC-Challenge y 25,00 de acc, prácticamente al nivel del azar (25%), lo que descarta su uso en tareas que requieran razonamiento complejo.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución, siempre manteniendo el aviso de licencia y el archivo NOTICE si existiera. No impone restricciones de uso más allá de las habituales.
- Inconsistencia de identificador: la model card referencia `SupraLabs/Supra2.1-Ultra` mientras que el repositorio es `SupraLabs/Supra2.1-Ultra-Preview-001`; conviene verificar la ruta correcta antes de integrarlo en pipelines automatizados.
- Etiqueta de "preview": se trata de una versión preliminar, por lo que la API, los pesos o el repositorio pueden cambiar sin aviso.
- Fechas del repositorio (creación y actualización en octubre de 2026) deben tomarse tal cual figuran en los metadatos de HuggingFace; no se dispone de información adicional que las contextualice.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SupraLabs/Supra2.1-Ultra-Preview-001
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset DCLM-Baseline-1.0: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Paper, blog técnico, repositorio de código o demo: no disponible en la información proporcionada.
