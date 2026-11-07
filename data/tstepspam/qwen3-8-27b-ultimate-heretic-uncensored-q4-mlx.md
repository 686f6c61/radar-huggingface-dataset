# tstepspam/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Q4-MLX

## Resumen

Qwen3.8-27B-Ultimate-Heretic-Uncensored-Q4-MLX es una cuantización en 4 bits (formato MLX) del modelo afinado DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored, publicado por el usuario tstepspam. Se trata de un fine-tune de la familia Qwen con aproximadamente 26.900 millones de parámetros (26.895.993.856 según los pesos safetensors), orientado a generación de texto conversacional y creativa sin los filtros de alineación habituales, de ahí la etiqueta "uncensored" y "heretic". El repositorio ocupa 15,2 GB y está pensado para ejecutarse con la librería MLX de Apple en hardware Apple Silicon.

El modelo base incorpora, según las etiquetas del autor, un pipeline de ajuste en varias etapas ("Multi-stage tuning", "GAIN Training", "Cold Fusion") sobre datasets propios (DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets), además de un conjunto de "modos" de razonamiento e instrucción y "constructos" (AI Constructs) que el autor describe en su model card. La licencia declarada es Apache 2.0 y el único idioma indicado es el inglés.

La relevancia de esta ficha es doble: por un lado, documenta una variante cuantizada para Mac de un modelo de 27B con ventana de contexto y capacidades de razonamiento; por otro, conviene señalar que el repositorio no incluye resultados de benchmarks, no detalla la composición del dataset y presenta un model card muy escueto, por lo que la evaluación técnica debe hacerse con cautela y validación empírica propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen, tags qwen3_5/qwen3_6/qwen3_8); detalles exactos no disponibles |
| Parametros totales | 26.895.993.856 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX); el modelo base se distribuye en bfloat16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX, 4-bit); repo de 15,2 GB |

## Arquitectura y entrenamiento

La información disponible no permite confirmar la arquitectura interna exacta. Las etiquetas del repositorio apuntan a la familia Qwen (qwen3_5, qwen3_6, qwen3_8) y el número de parámetros (26,9B) es coherente con un transformer decoder-only denso de esa escala, pero no se especifica si emplea atención completa, atención lineal, mezcla de expertos u otra variante. Tampoco se documentan el número de capas, las dimensiones ocultas ni la longitud de contexto nativa.

En cuanto al entrenamiento, el autor del modelo base declara un proceso de ajuste fino en varias etapas ("Multi-stage tuning") con técnicas que etiqueta como "Cold Fusion" y "GAIN Training", partiendo de datasets propios (Polar-STRICT y F451-STRICT). No se indica el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron RLHF, DPO u otras técnicas de alineación. La cuantización a 4 bits en formato MLX la realiza el publicador del repositorio (tstepspam) a partir del modelo base de DavidAU; no se detalla el método de cuantización (grupo, escala, calibración).

## Capacidades

- Generación de texto conversacional y creativo en inglés, con énfasis declarado en escritura creativa, ficción, relatos y roleplaying.
- Modos de razonamiento e instrucción: el autor menciona "27 reasoning modes", "27 instruct modes" y "9 Xhigh reasoning modes", así como un modo "thinking" explícito. No hay documentación técnica que verifique su funcionamiento.
- "Constructos" especializados según las etiquetas: Brainstorm AI Construct, Brainstorm Business AI Construct, Universal Teacher AI Construct, Agent AI Construct y Coder AI Construct, además de "15 AI Constructs", "5 Super AI Constructs" y "21 AGI Constructs".
- Generación de código: la etiqueta "coder" sugiere capacidades de programación, sin benchmarks que lo respalden.
- Sin censura declarada: el ajuste "heretic/uncensored" busca reducir los rechazos del modelo base ante peticiones sensibles.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el pipeline es text-generation.
- Capacidades multilingües: limitadas al inglés según la metadata.

## Casos de uso

- Escritura creativa y ficción: generación de relatos, novelas por capítulos y diálogos con el modelo afinado para "all genres", "story" y "fiction"; adecuado por su ajuste específico en narrativa y por la ausencia de filtros que interrumpan tramas sensibles.
- Roleplaying y juegos de rol: conversaciones multi-turno con personajes consistentes, aprovechando el modo conversacional y los "constructos" orientados a rol; requiere gestionar manualmente el estado si el contexto es limitado.
- Lluvia de ideas y brainstorming: uso del "Brainstorm AI Construct" y del "Brainstorm Business AI Construct" para generar propuestas de producto, nombres, ángulos creativos o planes de negocio preliminares.
- Asistencia a docencia y tutoría: el "Universal Teacher AI Construct" permitiría generar explicaciones, ejercicios y material didáctico en inglés, con revisión humana obligatoria por el riesgo de alucinación.
- Generación de código asistida: el "Coder AI Construct" y la etiqueta "coder" lo hacen candidato para autocompletar funciones, escribir tests o explicar fragmentos de código en un IDE o pipeline, siempre con validación y ejecución de tests.
- Agentes y automatización multi-paso: el "Agent AI Construct" sugiere uso como planificador o ejecutor en flujos con herramientas; en la práctica exigiría implementar el protocolo de tool calling por cuenta del integrador, ya que no se documenta soporte nativo.
- Prototipado local en Mac: al estar en formato MLX 4-bit, es adecuado para experimentar con un modelo de 27B en un Mac con memoria unificada suficiente, sin depender de GPUs dedicadas ni de servicios en la nube.
- Generación de contenido sin restricciones para investigación: estudio del comportamiento de modelos sin alineación, análisis de sesgos y evaluación de salvaguardas, en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repo pesa 15,2 GB en 4-bit; en la práctica se necesitan aproximadamente 16-18 GB de memoria unificada para cargar los pesos y algo más para el KV cache según la longitud de contexto.
- Hardware objetivo: Apple Silicon con MLX (serie M). Un Mac con 24 GB o 32 GB de memoria unificada (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max) es el mínimo razonable; 36-64 GB dan margen para contextos largos.
- GPU NVIDIA: el formato MLX no es compatible de forma nativa con CUDA; para A100, H100 o RTX 4090 habría que usar otra cuantización (GGUF, AWQ, GPTQ) del modelo base.
- Despliegue: `mlx-lm` (Apple) es la vía natural; llama.cpp, Ollama, vLLM y TGI no consumen pesos MLX directamente y requerirían conversión o una variante GGUF/safetensors estándar.
- Latencia y throughput: no disponibles; dependerán del chip Apple, la longitud de contexto y el número de tokens generados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tstepspam/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Q4-MLX (este) | ~26,9B | no disponible | Apache 2.0 | MLX 4-bit | Cuantización MLX del fine-tune de DavidAU; solo inglés |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored | ~27B | no disponible | Apache 2.0 | safetensors (bfloat16) | Modelo base sin cuantizar; mismo ajuste "uncensored" |
| 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF | ~27B | no disponible | no disponible | GGUF | Variante GGUF del mismo linaje, orientada a llama.cpp |
| Qwen3 base (familia oficial) | variable | no disponible | Apache 2.0 (según versión) | safetensors, GGUF | Modelo original alineado; referencia de comportamiento |

La comparación se limita a parámetros, licencia y formato porque no hay datos públicos de rendimiento para estas variantes en la información disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni evaluaciones de seguridad publicadas; cualquier afirmación de calidad es una suposición.
- Modelo "uncensored": la reducción de rechazos implica mayor probabilidad de generar contenido dañino, ilegal o sesgado; no es apto para aplicaciones de cara al público sin filtros externos.
- Riesgo elevado de alucinación: no se documenta el proceso de alineación ni de verificación factual del fine-tune.
- Solo inglés: no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Contexto desconocido: no se especifica la ventana nativa, lo que dificulta planificar aplicaciones con documentos largos.
- Licencia Apache 2.0 declarada, pero el linaje incluye datasets propios del autor (Polar-STRICT, F451-STRICT) cuyos términos no se detallan; conviene revisar la procedencia antes de uso comercial.
- Formato MLX: ligado al ecosistema Apple; no portable directamente a CUDA ni a servidores x86 con GPU.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, publicado por un tercero distinto del autor del modelo base: no hay garantía de mantenimiento ni de integridad más allá de los pesos publicados.
- Los "constructos" y "modos" descritos en las etiquetas no están documentados técnicamente; probablemente sean convenciones de prompt del autor y no características arquitectónicas verificables.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tstepspam/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Q4-MLX
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Variante GGUF relacionada: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF
