# vllm-sr/d3-ultra

## Resumen

d3-ultra es un modelo multimodal de decisión de 26.085 millones de parámetros (26,09B, incluyendo un codificador visual de 0,46B) desarrollado por el equipo de vLLM Semantic Router. A diferencia de los modelos generativos convencionales, no produce texto: recibe una entrada (texto, JSON, imágenes y vídeos) y un conjunto de preguntas, y devuelve una probabilidad para cada respuesta posible. Resuelve así tareas de clasificación, enrutamiento, verificación y localización visual sin generación autoregresiva.

El modelo se apoya en la arquitectura `qwen3_5` (según los tags de Hugging Face) y combina atención lineal con atención estándar, además de un codificador visual de 0,46B. Admite hasta 131.072 tokens de contexto por pregunta y permite formular entre 1 y 255 preguntas sobre la misma entrada en una sola pasada, con latencias de 304 ms a 2,16 s (mediana) en una AMD Instinct MI325X.

Es relevante porque propone un paradigma distinto al de los LLM generativos para tareas de decisión: en lugar de razonar en texto y parsear la salida, expone directamente distribuciones de probabilidad sobre opciones, lo que simplifica el enrutamiento en sistemas multiagente, la moderación, la clasificación zero-shot y la detección/tracking de objetos en vídeo. Se publica bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `qwen3_5` con capas de atención lineal (flash-linear-attention) y codificador visual de 0,46B |
| Parámetros totales | 26.085.330.160 (26,09B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 131.072 tokens por pregunta |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 52,2 GB), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

d3-ultra es un modelo multimodal de decisión construido sobre la arquitectura `qwen3_5`, con 26,09B parámetros de los cuales 0,46B corresponden al codificador visual. Incorpora capas de atención lineal (con kernels opcionales `flash-linear-attention`) que permiten manejar contextos de hasta 131.072 tokens por pregunta en una sola GPU AMD Instinct MI325X. El modelo procesa la entrada una única vez por petición y responde a todas las preguntas formuladas sobre ella, lo que reduce el coste computacional frente a plantear cada consulta como una inferencia independiente.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificación especulativa. La innovación principal declarada es el paradigma "system-one": una pasada sobre el estado de entrada que produce, para cada pregunta, una distribución de probabilidad sobre las opciones (elección, sí/no, puntuación, caja o track), sin generar texto.

## Capacidades

- Clasificación zero-shot con elección entre múltiples opciones, devolviendo probabilidad por cada opción.
- Preguntas de sí/no con probabilidad calibrada.
- Puntuación en escala (score) sobre una entrada.
- Localización visual (Box): devuelve una caja delimitadora con confianza para un objeto descrito en lenguaje natural, en imágenes y en fotogramas de vídeo.
- Seguimiento (Track) de objetos a lo largo de un vídeo completo, con probabilidad de visibilidad del objetivo.
- Procesamiento multimodal: texto, JSON, imágenes y vídeos, con varias imágenes o vídeos por petición; las imágenes pueden aparecer también dentro de preguntas y opciones.
- Múltiples preguntas por petición (hasta 255) respondidas desde una única lectura de la entrada.
- Soporte de contexto largo (131.072 tokens por pregunta).
- Compatibilidad con endpoints (`endpoints_compatible` según los tags) y con el enrutador semántico de vLLM.
- No genera texto: la salida son probabilidades y, en su caso, coordenadas de caja.

## Casos de uso

- Enrutamiento de tickets en atención al cliente: el modelo recibe el texto del ticket y devuelve la probabilidad de que corresponda a facturación, soporte técnico u otra cola, como muestra el ejemplo de la model card, sin necesidad de generar y parsear texto.
- Moderación y clasificación de contenido: preguntas de sí/no y de elección sobre mensajes o publicaciones para decidir si requieren revisión, con probabilidad calibrada por categoría.
- Enrutamiento semántico en pipelines multiagente: integrado en vLLM Semantic Router, decide qué agente o modelo debe atender cada petición según la entrada y las preguntas configuradas.
- Detección de objetos por descripción en lenguaje natural: dado un fotograma o imagen, devuelve una caja y una confianza; útil en inspección visual, inventario o análisis de imágenes satelitales.
- Seguimiento de objetos en vídeo: track a lo largo de un clip con probabilidad de visibilidad, aplicable a análisis deportivo (como el ejemplo de fútbol de la model card), vigilancia o monitorización de procesos.
- Verificación de coincidencias visuales: comparar una imagen de consulta con opciones candidatas (por ejemplo, identificar qué grabado corresponde a una fotografía) usando preguntas que contienen imágenes.
- Análisis de documentos y formularios: puntuar o clasificar campos de un JSON o texto estructurado con varias preguntas en una sola llamada.
- Evaluación de imágenes médicas o técnicas asistida: clasificación y localización con confianza, siempre como apoyo y no como sustituto del criterio profesional.

## Benchmarks y rendimiento

La model card incluye datos de rendimiento de servicio, no benchmarks académicos estándar (MMLU, HumanEval, GSM8K):

| Métrica | Valor |
|---|---|
| Preguntas por petición | 1 a 255 |
| Latencia (1 a 255 preguntas sobre la misma imagen) | 304 ms a 2,16 s (mediana) |
| Hardware de referencia | 1× AMD Instinct MI325X, AutoModel |
| Contexto por pregunta | 131.072 tokens |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 26,09B parámetros en safetensors (fp16/bf16), el peso ocupa aproximadamente 52 GB, por lo que se necesita al menos una GPU de 64-80 GB para inferencia sin cuantizar.
- GPU recomendadas: AMD Instinct MI325X (referencia declarada por el autor), así como A100 80GB, H100 80GB o MI300X para FP16.
- GPU de consumo: no cabe en GPUs de consumo (RTX 4090 24GB, RTX 3090 24GB) sin cuantización agresiva; no se documentan cuantizaciones oficiales.
- Opciones de despliegue: `transformers` (AutoModel con `trust_remote_code=True`), con kernels opcionales `flash-linear-attention`; el modelo está asociado a vLLM Semantic Router y a endpoints compatibles. No se confirma soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: 304 ms a 2,16 s (mediana) para entre 1 y 255 preguntas sobre una misma imagen en una MI325X.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión multimodales con salida probabilística) en la documentación proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Tipo de salida |
|---|---|---|---|---|
| d3-ultra | 26,09B | 131.072 tokens | Apache-2.0 | Probabilidades, cajas, tracks |
| Alternativas generativas multimodales | No disponible | No disponible | No disponible | Texto generado |

## Limitaciones y advertencias

- No es un modelo generativo: no puede producir texto libre, resúmenes ni explicaciones; solo probabilidades sobre opciones, cajas y tracks.
- Riesgo de calibración: las confianzas devueltas pueden no estar perfectamente calibradas; conviene validarlas en el dominio de producción.
- Sesgos: no se documentan evaluaciones de sesgo; al ser un modelo entrenado con datos no especificados, puede heredar sesgos de esos datos.
- Idiomas: no se especifican los idiomas soportados, por lo que el rendimiento multilingüe es incierto.
- Contexto: aunque admite 131.072 tokens por pregunta, no se documenta el comportamiento en el límite del contexto ni la degradación con entradas muy largas.
- Licencia Apache-2.0: permite uso comercial, pero se debe conservar el aviso de licencia y atribución.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar el código antes de desplegarlo en producción.
- Hardware: no está pensado para GPUs de consumo; el despliegue en producción exige GPUs de centro de datos.
- No se documentan cuantizaciones oficiales ni soporte en runtimes alternativos (llama.cpp, Ollama, TGI).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vllm-sr/d3-ultra
- Space oficial: https://huggingface.co/spaces/vllm-sr/d3-ultra
- API gratuita: https://decision.vllm-sr.ai
- Repositorio vLLM Semantic Router: https://github.com/vllm-project/semantic-router
