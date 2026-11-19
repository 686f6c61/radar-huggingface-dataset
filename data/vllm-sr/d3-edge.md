# vllm-sr/d3-edge

## Resumen

d3-edge es un modelo de decisión multimodal de 0,59B parámetros (incluyendo un codificador visual de 0,10B) desarrollado por vllm-sr, el equipo detrás de vLLM Semantic Router. No es un modelo generativo al uso: recibe un estado (texto o JSON, opcionalmente con imágenes y vídeos) junto con un conjunto de preguntas tipificadas (elección entre opciones, sí/no o puntuación en escala) y devuelve, en una sola llamada, una probabilidad para cada respuesta posible sin generar texto libre. Está construido sobre Qwen/Qwen3.5-0.8B mediante fine-tuning y se distribuye con licencia Apache-2.0.

El modelo se posiciona como la versión "edge" de la familia Decision 3.0, pensada para enrutamiento y clasificación de baja latencia dentro de pipelines de agentes y sistemas de enrutamiento semántico. Según la model card, obtiene 20,2 en el Jev Decision Index 0.3.2 (segundo entre las entradas de tamaño similar) y mejora en 6,6 puntos a su predecesor Decision 2.0 (13,6). Su principal valor diferencial es la eficiencia: latencias medianas de 6,6 ms para texto, 58,6 ms con imagen y 274 ms con vídeo de 10 segundos en una AMD Instinct MI325X, y 861 peticiones/s con p99 inferior a 1 s sirviendo con vLLM Semantic Router.

La relevancia actual radica en que cubre una necesidad concreta en arquitecturas de agentes: tomar decisiones discretas y probabilísticas (a qué equipo enrutar, si se cumple una condición, cuánta urgencia tiene una petición) sobre entradas multimodales, con un coste computacional muy inferior al de un LLM generativo y con salidas estructuradas y calibradas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con capas de atención lineal (hereda la base Qwen3.5-0.8B; requiere `flash-linear-attention` opcional para kernels rápidos) |
| Parámetros totales | 594.321.600 (0,59B), de los cuales 0,10B corresponden al codificador visual |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

d3-edge parte de Qwen/Qwen3.5-0.8B y se afina como modelo de decisión con un pipeline de clasificación zero-shot. La arquitectura combina un backbone transformer con capas de atención lineal (de ahí la dependencia opcional de `flash-linear-attention` para acelerar los kernels en GPU) y un codificador visual de 0,10B parámetros que procesa imágenes (PNG, JPEG, WebP) y vídeos (MP4, WebM, MOV, MKV) muestreados a 2 fotogramas por segundo. El modelo expone una interfaz `system_one` que recibe un estado y un diccionario de preguntas tipificadas y devuelve probabilidades por opción.

El entrenamiento se realizó como fine-tuning sobre el modelo base, orientado a tres tipos de tarea: elección entre opciones (`choice`), respuesta binaria (`noul`, equivalente a sí/no) y puntuación en escala (`score`). La model card reporta mejoras medibles frente a Decision 2.0 (+6,6 en el índice oficial, +12,1 en la suite pública, +7,4 en tests privados de la misma habilidad y +1,1 en tareas de dominio nuevo), lo que sugiere un entrenamiento con datos de decisión diversos y evaluación específica por habilidad. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Clasificación zero-shot con probabilidades calibradas por opción, sin generación de texto libre.
- Tres tipos de decisión: elección entre múltiples opciones (`choice`), sí/no (`noul`) y puntuación en escala (`score`).
- Procesamiento de múltiples preguntas en una sola llamada, cada una con su propio forward pass sobre la entrada.
- Entrada multimodal: texto o JSON, más varias imágenes por petición (rutas locales, URLs HTTP(S), objetos PIL o data URLs base64).
- Entrada de vídeo: varios vídeos por petición (rutas, URLs, base64 o arrays de fotogramas), muestreados a 2 fps.
- Cada pregunta de la petición ve todas las imágenes y vídeos adjuntos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad nativa; el modelo está pensado como componente de decisión dentro de pipelines de agentes.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia (y opcionalmente una imagen del producto dañado), el modelo decide en una sola llamada a qué equipo derivar (devoluciones, facturación, técnico) y con qué urgencia, usando preguntas `choice` y `score` combinadas.
- Moderación y verificación de contenido: clasificación binaria (`noul`) de si una imagen o vídeo cumple una política concreta, con probabilidad asociada para fijar umbrales de revisión humana.
- Extracción de decisiones en pipelines RAG: en lugar de generar texto, el modelo responde preguntas cerradas sobre el contexto recuperado (¿el documento menciona X?, ¿qué categoría aplica?), reduciendo el riesgo de alucinación en la capa de decisión.
- Automatización de back-office con documentos: validación de recibos, facturas o formularios mediante preguntas sí/no y de elección sobre la imagen del documento, con latencias de decenas de milisegundos.
- Análisis de vídeo para control de calidad o seguridad: preguntas de elección y sí/no sobre clips cortos (dirección de movimiento, cambios de color, presencia de objetos) a 2 fps, adecuado para inspección automatizada.
- Enrutamiento semántico en sistemas multi-modelo: como componente de vLLM Semantic Router, decide qué modelo o herramienta debe atender cada petición según su contenido, con throughput de 861 peticiones/s y p99 inferior a 1 s en una MI325X.
- Clasificación de intenciones en asistentes conversacionales: etiquetado de la intención del usuario y del nivel de urgencia antes de invocar un LLM generativo, reduciendo coste y latencia del sistema completo.

## Benchmarks y rendimiento

| Benchmark | d3-edge | Decision 2.0 (0,6B) | Notas |
|---|---|---|---|
| Jev Decision Index 0.3.2 (texto, oficial) | 20,2 | 13,6 | Segundo entre entradas de tamaño similar |
| Suite pública (kit oficial 0.3) | 28,82 | 16,72 (implícito por +12,1) | 140.178 peticiones públicas respondidas, ninguna sin soporte |
| Tests privados de misma habilidad | no disponible | no disponible | +7,4 frente a Decision 2.0 |
| Tareas de dominio nuevo | no disponible | no disponible | +1,1 frente a Decision 2.0 |
| Perception Test (video QA, elección múltiple) | 46,6 | no disponible | Evaluación interna |

Datos de serving reportados en la model card (AMD Instinct MI325X, una petición a la vez con AutoModel): mediana de 6,6 ms para texto, 58,6 ms con imagen y 274 ms con vídeo de 10 s. Con vLLM Semantic Router: 861 peticiones/s con p99 inferior a 1 s (6,1× AutoModel en modo texto con batching).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 0,59B parámetros en safetensors el peso en FP16 ronda 1,2 GB, más overhead del codificador visual y del runtime (el repo completo ocupa 4,0 GB).
- GPU recomendadas: AMD Instinct MI325X es la plataforma de referencia reportada; por tamaño, debería caber en GPUs consumer modernas (RTX 4090, RTX 3090, etc.), aunque no se confirman requisitos mínimos en la información disponible.
- Cabe en GPU consumer: probable por tamaño de parámetros, pero no confirmado en la documentación.
- Opciones de despliegue: transformers con `AutoModel.from_pretrained(..., trust_remote_code=True)` (requiere `transformers==5.17.0`), vLLM Semantic Router para serving de alto throughput. Otras opciones (llama.cpp, Ollama, TGI) no disponibles.
- Latencia y throughput: 6,6 ms (texto), 58,6 ms (imagen), 274 ms (vídeo 10 s) en MI325X con AutoModel; 861 peticiones/s con p99 < 1 s con vLLM Semantic Router.
- Dependencias: torch, torchvision, pillow, opencv-python-headless, safetensors, accelerate; `flash-linear-attention` opcional para kernels rápidos de atención lineal.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-edge | 0,59B (0,10B visión) | no disponible | Decisión/clasificación multimodal (texto, imagen, vídeo) | Apache-2.0 | Hugging Face |
| Decision 2.0 (0,6B) | 0,6B | no disponible | Decisión/clasificación | no disponible | Hugging Face (vllm-sr) |
| Qwen3.5-0.8B (base) | 0,8B | no disponible | Generación de texto | no disponible | Hugging Face (Qwen) |
| Clasificadores zero-shot tipo BART-large-MNLI | ~0,4B | ~1k tokens | Clasificación zero-shot de texto | MIT | Hugging Face |

La comparación con clasificadores zero-shot clásicos es limitada: d3-edge añade multimodalidad (imagen y vídeo), salidas probabilísticas por opción y una interfaz de decisión tipificada que no ofrecen los modelos NLI estándar. Frente a su predecesor Decision 2.0, la mejora reportada es de +6,6 puntos en el índice oficial.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo probabilidades sobre opciones predefinidas; no sirve para tareas de generación, resumen o diálogo abierto.
- Riesgo de calibración: las probabilidades devueltas deben validarse en el dominio de despliegue; no se documentan métricas de calibración (ECE, Brier) en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Qwen3.5-0.8B puede heredar sesgos del modelo base, no evaluados en la model card.
- Idiomas soportados: no disponibles; la documentación no especifica cobertura multilingüe.
- Longitud de contexto: no disponible; conviene validar el comportamiento con entradas largas antes de producción.
- Vídeo limitado a 2 fps: puede perder eventos de corta duración; el rendimiento en Perception Test (46,6) es moderado y de evaluación interna.
- Dependencia de `trust_remote_code=True` y de una versión concreta de transformers (5.17.0): riesgo de incompatibilidad en entornos con versiones distintas.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-0.8B y de los assets incluidos.
- Los benchmarks reportados son en su mayoría del propio autor (Jev Decision Index, suite pública, evaluación interna de vídeo); no hay validación independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vllm-sr/d3-edge
- Demo oficial: https://decision.vllm-sr.ai
- Space oficial: https://huggingface.co/spaces/vllm-sr/Decision-3.0
- Repositorio vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Librería flash-linear-attention: no disponible (referenciada en la model card sin URL)
