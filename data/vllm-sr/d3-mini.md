# vllm-sr/d3-mini

## Resumen

d3-mini es un modelo de decisión multimodal de 4.539 millones de parámetros (4,54B, incluyendo un codificador visual de 0,33B) desarrollado por vllm-sr como parte de la familia Decision 3.0 del proyecto vLLM Semantic Router. A diferencia de un modelo generativo convencional, d3-mini no produce texto: recibe un estado (texto o JSON, opcionalmente con imágenes y vídeos) junto con un conjunto de preguntas tipificadas (elección entre opciones, sí/no o puntuación en escala) y devuelve, para cada pregunta, una distribución de probabilidad sobre las respuestas posibles en una sola llamada.

El modelo se construye sobre Qwen/Qwen3.5-4B mediante fine-tuning y añade capacidades de visión y vídeo (lectura a 2 fotogramas por segundo). Su propósito es actuar como "modelo de sistema uno" (rápido, reactivo) dentro de pipelines de enrutamiento semántico y clasificación zero-shot, donde la latencia y la fiabilidad de la decisión importan más que la generación de lenguaje natural.

Su relevancia actual radica en dos factores: por un lado, obtiene 52,6 en el Jev Decision Index 0.3.2 (tabla oficial de texto), liderando entre las entradas de tamaño similar y situándose en la frontera de Pareto; por otro, ofrece latencias muy bajas (18,1 ms mediana para texto, 112 ms con imagen, 336 ms con vídeo de 10 s en una AMD Instinct MI325X) y un rendimiento de servicio de 151 peticiones/s con p99 inferior a 1 s usando vLLM Semantic Router. La licencia Apache-2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.5-4B, con capas de atención lineal (flash-linear-attention opcional) y codificador visual de 0,33B |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (repo de 18,2 GB, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

d3-mini parte de Qwen/Qwen3.5-4B, un transformer de 4B parámetros, y se somete a un fine-tuning orientado a decisión que lo convierte en un clasificador probabilístico multimodal. La arquitectura incorpora un codificador visual de 0,33B que procesa imágenes (PNG, JPEG, WebP) y vídeos (MP4, WebM, MOV, MKV) muestreados a 2 fps; cada pregunta de una petición atiende a todas las imágenes y vídeos adjuntos. El modelo soporta capas de atención lineal con kernels GPU opcionales mediante `flash-linear-attention`.

El entrenamiento se orienta a tres tipos de tarea: elección entre opciones (choice), respuesta binaria (sí/no, denominada "noul" en la API) y puntuación en escala (score). Cada pregunta se resuelve con su propio forward pass sobre el estado de entrada, devolviendo una probabilidad por opción. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo se distribuye con `trust_remote_code=True` y requiere transformers 5.17.0.

## Capacidades

- Clasificación zero-shot mediante elección entre opciones arbitrarias definidas en tiempo de inferencia.
- Respuestas binarias sí/no con probabilidad asociada.
- Puntuación en escala ordinal (por ejemplo, urgencia: rutina, pronto, hoy).
- Procesamiento de múltiples imágenes por petición en formatos PNG, JPEG y WebP, admitiendo rutas locales, URLs, objetos PIL y data URLs base64.
- Procesamiento de múltiples vídeos por petición en formatos MP4, WebM, MOV y MKV, con muestreo a 2 fps.
- Respuesta conjunta a varias preguntas de distinto tipo sobre un mismo estado en una sola llamada, cada una con su distribución de probabilidad.
- Salida estructurada de probabilidades sin generación de texto libre.
- Capacidad multimodal combinada texto + imagen + vídeo en la misma petición.
- Integración con vLLM Semantic Router para despliegue en producción con batching.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, d3-mini devuelve la probabilidad de que corresponda a devoluciones, facturación o soporte técnico, permitiendo dirigir el ticket al equipo adecuado en una sola llamada con latencia de decenas de milisegundos.
- Verificación documental con imagen: adjuntando una foto del recibo o de la etiqueta de envío, el modelo responde preguntas binarias como si el recibo lista el producto o si la entrega está dañada, útil en flujos de garantía y reclamaciones.
- Moderación y clasificación de contenido audiovisual: con vídeos muestreados a 2 fps, responde preguntas de elección múltiple sobre lo que ocurre en el clip (por ejemplo, dirección del movimiento o cambio de color), aplicable a control de calidad en cámaras de test.
- Triaje de urgencia en atención al cliente: mediante preguntas de tipo score, asigna un nivel de urgencia (rutina, pronto, hoy) que alimenta colas de priorización sin necesidad de generar texto.
- Clasificación zero-shot en pipelines de datos: al definir las categorías en tiempo de inferencia, permite etiquetar grandes volúmenes de texto o JSON sin reentrenamiento, con 151 peticiones/s en una MI325X y p99 inferior a 1 s.
- Enrutamiento semántico en pasarelas de LLM: integrado en vLLM Semantic Router, decide qué modelo o herramienta debe atender cada consulta según su contenido, actuando como capa de sistema uno previa a modelos generativos más costosos.
- Evaluación de imágenes médicas o industriales simples: preguntas binarias o de elección sobre múltiples imágenes por petición permiten construir verificadores rápidos en dominios donde la respuesta es discreta y acotada.

## Benchmarks y rendimiento

| Benchmark | d3-mini | Decision 2.0 (4B) | Notas |
|---|---|---|---|
| Jev Decision Index 0.3.2 (tabla oficial de texto) | 52,6 | 45,0 | +7,7 sobre Decision 2.0; primera entre entradas de tamaño similar y en frontera de Pareto |
| Suite pública (kit oficial 0.3) | 54,90 | 44,2 (implícito, +10,7) | 140.178 peticiones públicas respondidas, ninguna sin soporte |
| Pruebas privadas de misma habilidad | No disponible | No disponible | +8,2 sobre Decision 2.0 |
| Tareas de dominio nuevo | No disponible | No disponible | +3,4 sobre Decision 2.0 |
| Perception Test (video QA de elección múltiple) | 70,3 | No disponible | Evaluación interna |
| Latencia mediana, texto | 18,1 ms | No disponible | Una MI325X, AutoModel, una petición a la vez |
| Latencia mediana, imagen | 112 ms | No disponible | Ídem |
| Latencia mediana, vídeo de 10 s | 336 ms | No disponible | Ídem |
| Throughput con vLLM Semantic Router | 151 req/s, p99 < 1 s | No disponible | Una MI325X, 2,7× AutoModel con batching |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo en safetensors ocupa 18,2 GB, lo que sugiere pesos en precisión alta (probablemente bf16/fp16). En bf16 se necesitan aproximadamente 9-10 GB solo para pesos, más overhead de activaciones y codificador visual; con cuantización a 8 bits cabría en torno a 5-6 GB y a 4 bits en torno a 3 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: AMD Instinct MI325X es la plataforma de referencia en las mediciones del autor. Por tamaño, cabría en GPUs consumer de gama alta con suficiente VRAM (RTX 4090 de 24 GB en bf16, o GPUs de 12-16 GB con cuantización).
- Cabe en GPU consumer: sí, previsiblemente en RTX 4090 (24 GB) sin cuantizar y en GPUs de 8-12 GB con cuantización, aunque no se confirma en la documentación.
- Opciones de despliegue: `AutoModel` de transformers con `trust_remote_code=True` (transformers 5.17.0), vLLM Semantic Router para producción con batching, y kernels opcionales `flash-linear-attention` para las capas de atención lineal.
- Latencia y throughput: 18,1 ms mediana (texto), 112 ms (imagen), 336 ms (vídeo 10 s) con AutoModel en MI325X; 151 req/s con p99 < 1 s en vLLM Semantic Router, 2,7× el rendimiento de AutoModel.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-mini | 4,54B (0,33B vision) | No disponible | Decisión multimodal (choice/sí-no/score) | Apache-2.0 | Hugging Face, Space oficial |
| Decision 2.0 (4B) | 4B | No disponible | Decisión (generación previa) | No disponible | Referenciado en la model card |
| Qwen3.5-4B (base) | 4B | No disponible | Generación de texto | No disponible | Hugging Face |
| Modelos de clasificación zero-shot tipo NLI (p. ej. DeBERTa) | 0,1-1,5B | 512 tokens típicamente | Clasificación texto | Variable | Hugging Face |

La comparación con clasificadores NLI clásicos es pertinente por tarea (zero-shot classification), pero d3-mini añade multimodalidad y decisión multi-pregunta. Frente a su base Qwen3.5-4B, d3-mini sacrifica generación de texto a cambio de latencia y salida probabilística estructurada.

## Limitaciones y advertencias

- No genera texto: no es adecuado para tareas de generación, resumen o diálogo libre; su salida es exclusivamente probabilística sobre preguntas predefinidas.
- Longitud de contexto no documentada: se desconoce el límite de tokens de entrada, lo que dificulta planificar su uso con documentos largos.
- Idiomas soportados no declarados: aunque hereda el multilingüismo de Qwen3.5-4B, no se confirma el rendimiento por idioma, incluido el castellano.
- Riesgo de calibración: las probabilidades devueltas no están necesariamente calibradas; en producción conviene validar umbrales con datos propios.
- Dependencia de `trust_remote_code=True`: ejecuta código del autor, lo que implica revisión de seguridad antes de desplegar.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Qwen3.5-4B, puede heredar sesgos de su corpus de entrenamiento.
- Alucinación: al no generar texto, el riesgo de alucinación textual es bajo, pero puede asignar alta probabilidad a opciones incorrectas en dominios alejados de su distribución de entrenamiento.
- Rendimiento en vídeo limitado a 2 fps: fenómenos rápidos o de alta frecuencia temporal pueden no capturarse.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las obligaciones de atribución y las condiciones del modelo base Qwen3.5-4B.
- Cifras de benchmarks privados y de dominio nuevo no se publican en detalle, solo las deltas frente a Decision 2.0.

## Enlaces

- Hugging Face: https://huggingface.co/vllm-sr/d3-mini
- Space oficial: https://huggingface.co/spaces/vllm-sr/Decision-3.0
- Demo: https://decision.vllm-sr.ai
- Repositorio vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
