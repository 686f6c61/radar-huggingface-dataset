# vllm-sr/d3-lite

## Resumen

d3-lite es un modelo de decisión multimodal de 0,85B parámetros desarrollado por vllm-sr como parte de la familia Decision 3.0 del proyecto vLLM Semantic Router. A diferencia de un modelo generativo convencional, no produce texto: recibe una entrada (texto o JSON, opcionalmente acompañada de imágenes y vídeos) junto con una o varias preguntas tipificadas (elección entre opciones, sí/no o puntuación en una escala) y devuelve una probabilidad para cada respuesta en una sola llamada. Está construido sobre Qwen/Qwen3.5-0.8B mediante fine-tuning y emplea una arquitectura con capas de atención lineal (compatible con los kernels de `flash-linear-attention`).

El modelo está pensado para enrutamiento y clasificación de baja latencia dentro de infraestructuras de inferencia: decidir qué equipo o pipeline debe atender una petición, responder preguntas booleanas sobre el contenido o puntuar urgencia. Con 0,85B parámetros totales (incluido un codificador visual de 0,10B) y licencia Apache-2.0, se posiciona como una alternativa ligera a modelos generativos para tareas de clasificación zero-shot.

Su relevancia actual radica en tres factores: el rendimiento declarado en el Jev Decision Index 0.3.2 (32,3 en el tablero oficial de texto, primero entre entradas de tamaño similar), la latencia reportada (mediana de 13,6 ms para texto en una AMD Instinct MI325X) y la capacidad de procesar varias preguntas en una sola llamada, lo que reduce el coste frente a múltiples pasadas de un LLM generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas de atención lineal (base Qwen3.5-0.8B), codificador visual de 0,10B; salida de clasificación por probabilidad |
| Parametros totales | 852.985.920 (0,85B, incluido el codificador visual de 0,10B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin indicar variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

d3-lite parte de Qwen/Qwen3.5-0.8B y se fine-tunea como modelo de decisión ("system-one"), es decir, un modelo que emite probabilidades sobre opciones predefinidas en lugar de generar secuencias de tokens. La arquitectura combina capas de atención estándar con capas de atención lineal, para las que el autor recomienda instalar `flash-linear-attention` como kernels rápidos en GPU. Incluye un codificador visual de 0,10B parámetros que permite procesar varias imágenes o vídeos por petición; los vídeos se leen a 2 fotogramas por segundo.

Cada pregunta de una petición se responde con su propio forward pass sobre la entrada, y el modelo devuelve una probabilidad para cada opción. El autor reporta que, con una petición por forward (el modo por defecto anterior), las respuestas son idénticas a las de AutoModel. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Clasificación zero-shot con tres tipos de pregunta: elección entre opciones (`choice`), sí/no (`noul`) y puntuación en escala (`score`).
- Procesamiento de texto y JSON como entrada de estado.
- Procesamiento de imágenes (PNG, JPEG, WebP) en múltiples instancias por petición, desde rutas locales, URLs, objetos PIL o data URLs base64.
- Procesamiento de vídeo (MP4, WebM, MOV, MKV) en múltiples instancias por petición, desde rutas, URLs, base64 o arrays de fotogramas, a 2 fps.
- Respuesta a varias preguntas en una sola llamada, cada una con su propia pasada sobre la entrada.
- Salida de probabilidades por opción, sin generación de texto.
- Integración con vLLM Semantic Router para enrutamiento y batching.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, decidir con una pregunta `choice` qué equipo (devoluciones, facturación, técnico) debe atenderla, con la probabilidad asociada para aplicar umbrales de escalado.
- Verificación documental con imagen: adjuntar una factura o recibo y responder preguntas `noul` sobre su contenido (por ejemplo, si figura un producto concreto) sin necesidad de OCR ni de un LLM generativo.
- Triaje de urgencia: usar preguntas `score` para puntuar la urgencia de una petición en una escala definida y priorizar la cola de atención.
- Moderación y filtrado previo: clasificar contenido entrante en categorías predefinidas antes de pasarlo a un modelo mayor, reduciendo el coste computacional del pipeline.
- Análisis de vídeo de vigilancia o pruebas: responder preguntas sobre dirección de movimiento o cambios de color en clips cortos a 2 fps, útil para validación automatizada de cámaras.
- Puerta de decisión en pipelines de agentes: decidir si una consulta requiere herramientas externas, recuperación o respuesta directa, integrándose en el router semántico de vLLM.
- Clasificación por lotes de alto rendimiento: con 518 peticiones/s y p99 inferior a 1 s por GPU MI325X según el autor, adecuado para preclasificar grandes volúmenes antes de un modelo generativo.

## Benchmarks y rendimiento

| Benchmark | d3-lite | Referencia |
|---|---|---|
| Jev Decision Index 0.3.2 (tablero oficial de texto) | 32,3 | Decision 2.0 (0,8B): 17,5 |
| Suite pública (kit oficial 0.3) | 36,93 | no disponible |
| Perception Test (video QA de elección múltiple, evaluación interna) | 59,3 | no disponible |
| Mejora sobre Decision 2.0 en suite pública | +16,4 | — |
| Mejora sobre Decision 2.0 en tests privados de misma habilidad | +13,5 | — |
| Mejora sobre Decision 2.0 en tareas de dominio nuevo | +11,8 | — |
| Latencia mediana, petición de texto | 13,6 ms | MI325X, AutoModel, una petición a la vez |
| Latencia mediana, petición con imagen | 64,0 ms | MI325X, AutoModel |
| Latencia mediana, petición con vídeo de 10 s | 291 ms | MI325X, AutoModel |
| Throughput con vLLM Semantic Router | 518 req/s, p99 < 1 s | MI325X, 7,1× AutoModel |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 0,85B parámetros en fp16 el peso ronda 1,7 GB, más el codificador visual y el coste de activaciones, por lo que debería caber en GPUs de consumo con 8 GB o más.
- GPU recomendadas por el autor: AMD Instinct MI325X (mediciones de latencia y throughput publicadas en esa GPU).
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por tamaño, es plausible en RTX 4090, RTX 3090 o superiores, pero no hay mediciones publicadas.
- Opciones de despliegue: AutoModel de transformers (5.17.0), vLLM Semantic Router; se recomienda `flash-linear-attention` para kernels de atención lineal en GPU.
- Latencia y throughput: mediana de 13,6 ms (texto), 64,0 ms (imagen) y 291 ms (vídeo de 10 s) con AutoModel; 518 req/s con p99 < 1 s en MI325X con vLLM Semantic Router.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-lite | 0,85B | no disponible | Decisión multimodal (texto, imagen, vídeo) con salida de probabilidades | Apache-2.0 | Hugging Face |
| Decision 2.0 (0,8B) | 0,8B | no disponible | Decisión, predecesor de la familia | no disponible | no disponible |
| Qwen3.5-0.8B (base) | 0,8B | no disponible | LLM generativo | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos de clasificación zero-shot de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto: solo responde preguntas tipificadas con probabilidades; no sirve para tareas generativas.
- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen3.5-0.8B puede heredar sesgos de su corpus de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las probabilidades pueden ser erróneas o poco calibradas en dominios alejados de los datos de entrenamiento.
- Idiomas soportados: no declarados; la model card y los ejemplos están en inglés.
- Longitud de contexto: no especificada; conviene validar entradas largas antes de producción.
- Requiere `trust_remote_code=True` y transformers 5.17.0, lo que implica ejecutar código del autor.
- Rendimiento medido en una GPU AMD Instinct MI325X; el throughput en otras GPUs puede diferir.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones de los pesos base de Qwen3.5-0.8B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vllm-sr/d3-lite
- Demo: https://decision.vllm-sr.ai
- Space oficial: https://huggingface.co/spaces/vllm-sr/Decision-3.0
- Repositorio vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
