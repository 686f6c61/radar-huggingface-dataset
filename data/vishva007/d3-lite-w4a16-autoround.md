# Vishva007/d3-lite-W4A16-AutoRound

## Resumen

`Vishva007/d3-lite-W4A16-AutoRound` es una versión cuantizada a 4 bits (W4A16) del modelo multimodal `vllm-sr/d3-lite`, el modelo fundacional de decisión de 0.8B parámetros de Decision 3.0 (vLLM Semantic Router). A diferencia de un LLM generativo convencional, este modelo no produce tokens: evalúa un estado de entrada (texto, JSON, imágenes o fragmentos de vídeo) contra un conjunto de preguntas de decisión (tipo Choice, Yes/No o Score) y devuelve probabilidades directas en un único forward pass.

La cuantización la ha realizado el usuario Vishva007 mediante Intel AutoRound con una configuración de alta precisión (grupo de 32, simétrica, 1200 iteraciones de calibración, 512 muestras) y, de forma destacable, mantiene el codificador visual sin cuantizar (`quant_nontext_module: False`) para preservar la fidelidad en tareas de visión y vídeo. El resultado es un checkpoint de 435.562.560 parámetros reales (según safetensors) y 1.0 GB de repositorio, con licencia Apache 2.0.

Su relevancia actual radica en el nicho que ocupa: es un enrutador semántico y clasificador zero-shot de bajos requisitos, pensado para desplegarse en aceleradores de borde, GPUs de estación de trabajo o hardware embebido, reduciendo la huella de pesos del backbone lingüístico entre 3 y 3,5 veces respecto a BF16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone `qwen3_5` según tags; codificador visual sin cuantizar); modelo de decisión con salida de probabilidades en un solo forward pass |
| Parametros totales | 435.562.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la calibración se realizó con `seqlen` 4096) |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), grupo 32, simétrica; codificador visual en FP16/BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo base `vllm-sr/d3-lite` es un modelo fundacional de decisión de 0,8B parámetros con capacidad multimodal (texto, JSON, imágenes y vídeo). Su funcionamiento no es generativo: recibe un `state` y un diccionario de `questions` con tipos `choice`, `noul` (Yes/No) y `score`, y emite probabilidades directamente, lo que elimina la latencia de decodificación y el riesgo de alucinación en la respuesta. Los tags del repositorio apuntan a un backbone de la familia `qwen3_5` con módulos de atención lineal (se sugiere opcionalmente `flash-linear-attention` para acelerar la atención lineal).

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí está documentado es el proceso de cuantización: AutoRound de Intel con 4 bits, grupo 32, simetría activada, 1200 iteraciones, 512 muestras de calibración, batch 4, longitud de secuencia 4096 y `enable_torch_compile=True` para acelerar la calibración mediante TorchDynamo. La decisión técnica clave es excluir el módulo no textual de la cuantización, manteniendo el vision tower en FP16/BF16 para evitar deriva visual.

## Capacidades

- Clasificación zero-shot mediante preguntas de decisión de tres tipos: elección entre criterios (`choice`), respuesta binaria (`noul`) y puntuación ordinal (`score`).
- Procesamiento multimodal: acepta texto, JSON, imágenes (rutas, URLs, objetos PIL o cadenas base64) y fragmentos de vídeo.
- Enrutamiento semántico: asignación de peticiones a equipos, flujos o categorías según criterios definidos en tiempo de inferencia.
- Salida de probabilidades directas en un único forward pass, sin generación de tokens.
- Extracción de características (`feature-extraction`) y uso como clasificador zero-shot (`pipeline_tag: zero-shot-classification`).
- Integración con `vllm-semantic-router` y compatibilidad declarada con endpoints.
- Soporte de visión y vídeo con el codificador visual a precisión completa.
- No se documenta soporte de tool calling generativo, agentes multi-paso ni modo de razonamiento extendido (thinking mode), ya que el modelo no genera texto.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como `state` y un conjunto de criterios (`returns`, `billing`, `technical`) para devolver la probabilidad de cada equipo, tal y como muestra el ejemplo de la model card con un pedido dañado.
- Verificación documental multimodal: dado un mensaje del cliente y una imagen de recibo, responder preguntas binarias como "¿el recibo incluye la batidora?", útil en flujos de devoluciones y garantías.
- Triaje de urgencia: usar preguntas de tipo `score` con criterios ordinales ("Routine", "Soon", "Today") para priorizar colas de atención en función de la probabilidad asignada a cada nivel.
- Moderación y clasificación de contenido: evaluar si un texto o imagen cumple una política concreta mediante preguntas `noul`, sin coste de generación y con latencia de un solo paso.
- Enrutamiento en pasarelas de inferencia LLM: integrado en vLLM Semantic Router para decidir qué modelo o backend atiende cada petición según su contenido, aprovechando su reducida huella de VRAM.
- Clasificación de vídeo clip a clip: el codificador visual sin cuantizar permite evaluar fragmentos de vídeo contra preguntas de decisión, por ejemplo para detectar eventos o categorizar escenas.
- Despliegue en borde: al reducir el backbone lingüístico entre 3 y 3,5 veces frente a BF16, encaja en aceleradores de baja memoria, GPUs de estación de trabajo discretas o hardware embebido para clasificación local sin conexión.

## Benchmarks y rendimiento

La model card afirma "zero degradation in visual QA benchmarks (CV-Bench, Perception Test)" respecto al modelo base, pero no se publican cifras numéricas de dichos benchmarks ni de MMLU, HumanEval, GSM8K u otras métricas en la información disponible.

| Benchmark | Resultado |
|---|---|
| CV-Bench | no disponible (solo se afirma ausencia de degradación) |
| Perception Test | no disponible (solo se afirma ausencia de degradación) |
| Resto de benchmarks | no disponible |

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1.0 GB, por lo que la inferencia en W4A16 requiere del orden de 1-1,5 GB de VRAM para pesos, más el codificador visual en FP16/BF16 y el overhead de activaciones y contexto.
- Cabe en GPUs de consumo: cualquier GPU con 4 GB o más de VRAM debería ser suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso iGPUs con memoria compartida son candidatas razonables.
- GPUs de centro de datos (A100, H100) no son necesarias; el modelo está orientado a aceleradores de borde, estaciones de trabajo discretas y hardware embebido.
- Opciones de despliegue: `transformers` (versión 5.17.0 según la model card) con `trust_remote_code=True` y `device_map="auto"`; se menciona compatibilidad con endpoints y con vLLM Semantic Router, aunque no se detalla una receta vLLM específica para este checkpoint.
- Dependencias declaradas: torch, torchvision, pillow, opencv-python-headless, safetensors, accelerate y auto-round; opcionalmente `flash-linear-attention` para acelerar la atención lineal.
- Latencia y throughput: no disponibles. Al no generar tokens, la latencia equivale a un único forward pass, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas comparables en la información proporcionada. La comparación se limita a lo que puede inferirse del modelo base.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vishva007/d3-lite-W4A16-AutoRound | 435.562.560 | no disponible | Decisión multimodal cuantizado W4A16 | Apache 2.0 | Hugging Face |
| vllm-sr/d3-lite (base) | ~0,8B | no disponible | Decisión multimodal BF16 | no disponible en la información | Hugging Face |
| Vishva007/Qwen3.8-27B-W4A16-AutoRound | 27B (aprox.) | no disponible | LLM generativo cuantizado W4A16 | no disponible en la información | Hugging Face |

Las alternativas de la misma categoría (modelos de decisión o enrutadores semánticos) no están identificadas en la información disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, tool calling ni razonamiento multi-paso; solo devuelve probabilidades sobre preguntas predefinidas.
- La calidad de las respuestas depende por completo de la formulación de las preguntas y los criterios; una definición ambigua degrada la clasificación.
- No se documentan los datos de entrenamiento del modelo base, por lo que no pueden evaluarse sesgos conocidos ni la composición del corpus.
- Riesgo de alucinación estructuralmente bajo en la salida (son probabilidades), pero las probabilidades pueden estar mal calibradas en dominios alejados de la distribución de calibración.
- Idiomas soportados no declarados; no hay garantía de rendimiento multilingüe más allá de lo que herede del modelo base.
- La cuantización W4A16 introduce una pérdida de precisión no cuantificada numéricamente; la afirmación de "zero degradation" en visión no va acompañada de cifras verificables.
- Requiere `trust_remote_code=True` y una versión concreta de transformers (5.17.0), lo que añade riesgo de compatibilidad en producción.
- El codificador visual se mantiene en FP16/BF16, de modo que el ahorro de memoria se limita al backbone lingüístico (3-3,5×), no al conjunto del modelo.
- Licencia Apache 2.0 permite uso comercial, pero el autor de la cuantización no ofrece garantías sobre el checkpoint derivado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vishva007/d3-lite-W4A16-AutoRound
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Repositorio relacionado del mismo autor (Qwen3.8-27B AutoRound W4A16): https://github.com/tonyd2wild/Qwen3.8-27B-DFLASH2-AutoRound-W4A16-2x3090/tree/main
- RunPod (plataforma de despliegue mencionada en la model card): https://runpod.io?ref=iabrlp7z
