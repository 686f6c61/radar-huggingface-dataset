# vllm-sr/d3-nano

## Resumen

d3-nano es un modelo de decisión multimodal de 2.213 millones de parámetros (2,21B, de los cuales 0,33B corresponden a un codificador visual) desarrollado por el equipo de vLLM Semantic Router. A diferencia de los modelos generativos convencionales, no produce texto: recibe un estado de entrada (texto o JSON, opcionalmente acompañado de imágenes y vídeos) y un conjunto de preguntas tipificadas (elección entre opciones, sí/no o puntuación en escala), y devuelve una probabilidad para cada respuesta en una sola llamada. Está construido sobre el modelo base Qwen/Qwen3.5-2B mediante ajuste fino y se distribuye con licencia Apache-2.0.

El modelo se presenta como la base multimodal de la familia Decision 3.0, orientada a enrutamiento semántico y clasificación de decisiones dentro de infraestructuras de servicio LLM. Su propuesta es sustituir parte del trabajo de un LLM generativo por un clasificador dedicado, mucho más rápido y determinista en coste, que responde varias preguntas sobre la misma entrada en una única pasada por pregunta. Según la model card, obtiene 38,9 en el Jev Decision Index 0.3.2 (tabla oficial de texto), lo que supone una mejora de 11,8 puntos sobre el modelo de 2B de la generación anterior (Decision 2.0, 27,1).

La relevancia actual reside en su enfoque "system-one": razonamiento rápido, sin cadena de pensamiento, con latencias declaradas de 13,4 ms para texto, 90,2 ms con imagen y 301 ms con vídeo de 10 segundos en una AMD Instinct MI325X. Con vLLM Semantic Router alcanza 318 peticiones/s con p99 por debajo de 1 s en la misma GPU, lo que lo sitúa como candidato para capas de decisión en producción frente a llamadas a modelos generativos de mayor coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con capas de atención lineal (linear-attention); modelo de decisión (no generativo) |
| Parametros totales | 2.213.241.664 (2,21B), incluidos 0,33B del codificador visual |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 22,2 GB, incluye probablemente assets de ejemplo y pesos en precisión completa) |

## Arquitectura y entrenamiento

d3-nano parte de Qwen/Qwen3.5-2B y se ajusta para una tarea de clasificación probabilística en lugar de generación de texto. La arquitectura conserva un transformer con capas de atención lineal (se recomienda instalar `flash-linear-attention` para kernels rápidos en GPU) e incorpora un codificador visual de 0,33B que permite procesar varias imágenes y vídeos por petición, a 2 fotogramas por segundo en el caso del vídeo. El modelo expone una API `system_one` que recibe un `state` (texto o JSON), listas opcionales de `images` y `videos`, y un diccionario de `questions` con tres tipos: `choice` (selección entre criterios), `noul` (sí/no) y `score` (escala ordinal con criterios). Cada pregunta se resuelve con su propia pasada forward sobre la entrada y devuelve una distribución de probabilidad sobre las opciones.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí se menciona una evaluación interna sobre el "public suite" del kit oficial 0.3 (140.178 peticiones públicas, todas respondidas sin casos no soportados) y pruebas privadas por habilidad y de nuevos dominios. La innovación principal es el propio paradigma: un modelo que no genera texto y que, por tanto, evita la decodificación autoregresiva, lo que explica las latencias milisegundo y el throughput declarado. También destaca la capacidad de responder varias preguntas heterogéneas (choice, sí/no y score) sobre la misma entrada en una sola llamada.

## Capacidades

- Clasificación zero-shot con opciones definidas por el usuario mediante el tipo `choice`, con criterios y descripciones por opción.
- Preguntas booleanas sí/no mediante el tipo `noul`.
- Puntuación ordinal en escala mediante el tipo `score`, con etiquetas de criterio ordenadas.
- Procesamiento multimodal: varias imágenes por petición (PNG, JPEG, WebP) en forma de rutas locales, URLs HTTP(S), objetos PIL o data URLs base64.
- Procesamiento de vídeo: varios vídeos por petición (MP4, WebM, MOV, MKV) como rutas, URLs, data URLs base64 o arrays de fotogramas, muestreados a 2 fps.
- Respuesta probabilística por opción, sin generación de texto, lo que facilita umbrales y calibración en producción.
- Múltiples preguntas por llamada con una pasada forward por pregunta y visibilidad de todas las imágenes y vídeos para cada pregunta.
- Integración con vLLM Semantic Router para despliegue con batching y alto throughput.
- Capacidad declarada de evaluación en Perception Test (vídeo QA de elección múltiple) con 63,5 en evaluación interna.
- No se declara soporte explícito de tool calling, function calling ni razonamiento multi-paso en el sentido de agentes generativos; su rol es el de capa de decisión.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una reclamación, el modelo decide con `choice` a qué equipo derivarla (devoluciones, facturación, técnico) y con `score` la urgencia. La latencia de milisegundos permite integrarlo en la primera línea de un sistema de ticketing sin coste de generación.
- Clasificación de documentos con imagen: con una factura o un albarán adjunto, se formulan preguntas `noul` ("¿aparece el número de pedido?") y `choice` ("¿método de pago?") en una sola llamada; el codificador visual de 0,33B procesa la imagen y todas las preguntas ven el mismo contenido.
- Moderación y triaje de contenido: clasificación zero-shot de mensajes en categorías definidas por el operador (spam, abuso, consulta legítima) con probabilidades por clase, útil para umbrales configurables y auditoría.
- Análisis de vídeo de vigilancia o test: con vídeos a 2 fps se pueden responder preguntas de dirección de movimiento, cambios de estado o presencia de objetos, como en el ejemplo de la model card, para pre-filtrado antes de un modelo mayor.
- Capa de decisión en pipelines RAG: decidir si una consulta requiere recuperación, si es ambigua o si debe escalarse a un LLM generativo, usando preguntas sí/no y de elección con umbrales de probabilidad.
- Validación de formularios y extracción asistida: comprobar con preguntas booleanas si un documento contiene los campos obligatorios antes de pasarlo a un extractor más costoso.
- Enrutamiento semántico en gateways LLM: integrado con vLLM Semantic Router para dirigir peticiones al modelo adecuado según la intención detectada, con 318 req/s y p99 inferior a 1 s en una MI325X.

## Benchmarks y rendimiento

| Benchmark | d3-nano | Referencia |
|---|---|---|
| Jev Decision Index 0.3.2 (tabla oficial de texto) | 38,9 | Decision 2.0 (2B): 27,1 |
| Public suite (kit oficial 0.3, pesos liberados) | 42,22 | Decision 2.0: +12,2 respecto a este valor |
| Perception Test (vídeo QA elección múltiple, evaluación interna) | 63,5 | No disponible |
| Mejora en pruebas privadas por habilidad | +13,2 sobre Decision 2.0 | — |
| Mejora en tareas de nuevos dominios | +6,6 sobre Decision 2.0 | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores provienen de la model card del autor y de evaluaciones internas; no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 2,21B parámetros, en FP16 se requieren aproximadamente 4,4 GB solo para pesos, más el codificador visual y las activaciones; en cuantizaciones de 8 y 4 bits bajaría a unos 2,2 GB y 1,1 GB respectivamente, aunque el autor no publica cuantizaciones ni cifras de VRAM.
- GPU recomendadas: la model card cita AMD Instinct MI325X para las mediciones de latencia y serving. No se especifican GPUs NVIDIA recomendadas.
- GPU de consumo: por tamaño (2,21B) es plausible que quepa en GPUs de consumo con 8-12 GB de VRAM en FP16, pero no hay confirmación oficial ni cuantizaciones publicadas.
- Opciones de despliegue: `transformers` (AutoModel con `trust_remote_code=True`), vLLM Semantic Router para serving con batching; se recomienda `flash-linear-attention` para kernels rápidos de atención lineal. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia declarada (una petición a la vez, AutoModel, MI325X): 13,4 ms mediana para texto, 90,2 ms con imagen, 301 ms con vídeo de 10 s.
- Throughput declarado: 318 req/s con p99 inferior a 1 s en una MI325X con vLLM Semantic Router (4,3× AutoModel en texto de una pregunta con batching).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| d3-nano (vllm-sr) | 2,21B (0,33B visión) | No disponible | Modelo de decisión multimodal, no generativo | Apache-2.0 | Jev Decision Index 38,9; 318 req/s |
| Decision 2.0 (2B, vllm-sr) | 2B | No disponible | Modelo de decisión de generación anterior | No disponible | Jev Decision Index 27,1 |
| Qwen3.5-2B (modelo base) | 2B | No disponible | LLM generativo multimodal | No disponible | No disponible |

No se dispone de datos de benchmarks comparables con clasificadores zero-shot convencionales ni con LLMs generativos de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto; no sirve para tareas de generación, resumen o diálogo. Su uso está restringido a clasificación y decisión probabilística.
- No se declara la lista de idiomas soportados; el rendimiento multilingüe es desconocido y podría degradarse fuera del inglés.
- No se publica la longitud de contexto ni la composición del dataset de entrenamiento, lo que dificulta evaluar sesgos y cobertura de dominios.
- Riesgo de alucinación estructural: al devolver probabilidades, un umbral mal calibrado puede producir decisiones erróneas con alta confianza; se recomienda validación sobre datos propios antes de producción.
- Las cifras de benchmarks son internas o del kit oficial del autor (Jev Decision Index, public suite, Perception Test) y no se han verificado de forma independiente.
- Requiere `trust_remote_code=True` y `transformers==5.17.0` según la model card, lo que implica ejecutar código del repositorio; conviene auditar el código antes de desplegar.
- El rendimiento de serving medido se limita a AMD Instinct MI325X; no hay datos para NVIDIA u otras plataformas.
- Licencia Apache-2.0 permite uso comercial, pero al derivar de Qwen/Qwen3.5-2B conviene revisar las condiciones del modelo base.
- No se declaran cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vllm-sr/d3-nano
- Demo oficial (Space): https://huggingface.co/spaces/vllm-sr/Decision-3.0
- Prueba gratuita: https://decision.vllm-sr.ai
- Repositorio vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
