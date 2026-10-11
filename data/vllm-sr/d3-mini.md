# vllm-sr/d3-mini

## Resumen

d3-mini es un modelo de decisión multimodal de 4,54 mil millones de parámetros (incluido un codificador visual de 0,33B) desarrollado por vllm-sr, el equipo detrás de vLLM Semantic Router. No es un modelo generativo al uso: recibe una entrada (texto o JSON, opcionalmente acompañada de imágenes) junto con un conjunto de preguntas y devuelve, en una sola llamada y sin generar texto, una probabilidad para cada opción de respuesta. Soporta tres tipos de decisión: elección entre varias opciones (choice), sí/no (noul) y puntuación en una escala (score).

El modelo se apoya en Qwen/Qwen3.5-4B como base y añade encima un cabezal de decisión y visión, con capas de atención lineal sobre las que se pueden aplicar kernels acelerados mediante flash-linear-attention. Está pensado como "system one" dentro de un router semántico: en lugar de razonar paso a paso, resuelve tareas de clasificación y enrutado de baja latencia con una única pasada hacia delante por pregunta.

Su relevancia actual radica en el nicho que ocupa: sustituye a pipelines de clasificación tradicionales y a LLM generativos en tareas donde solo se necesita una etiqueta con probabilidad, con latencias declaradas de 29,5 ms por petición de texto y 115,0 ms con imagen en una GPU AMD Instinct MI325X. Se publica bajo licencia Apache-2.0 y requiere cargar código remoto (trust_remote_code=True).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen/Qwen3.5-4B con capas de atención lineal y codificador visual (0,33B); cabezal de decisión sobre el modelo base |
| Parámetros totales | 4.539.265.536 (≈4,54B), de los cuales 0,33B corresponden al codificador de visión |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

d3-mini parte de Qwen/Qwen3.5-4B (etiqueta qwen3_5 en el repositorio) y lo adapta a una tarea de decisión: dado un estado (texto o JSON) y un conjunto de preguntas tipadas (choice, noul, score), el modelo calcula una distribución de probabilidad sobre las opciones de cada pregunta en una única llamada. Cada pregunta se resuelve con su propia pasada hacia delante sobre la entrada completa, de modo que todas comparten el mismo contexto y, si hay imágenes, todas las preguntas las ven. El componente de visión añade 0,33B de parámetros, lee hasta 1,6 megapíxeles por imagen y admite varias imágenes por petición en formatos PNG, JPEG y WebP, tanto por ruta local como por URL, objeto PIL o data URL en base64. Las imágenes se colocan por delante del texto de la petición.

La integración con atención lineal se aprecia en la recomendación de instalar flash-linear-attention para obtener kernels rápidos en GPU sobre las capas de atención lineal, lo que apunta a una arquitectura híbrida. El modelo requiere transformers==5.17.0 y código propio del autor (custom_code, trust_remote_code=True), y además de AutoModel se expone como pipeline de tipo "decision". No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni detalles del procedimiento de ajuste; esos datos figuran como no disponibles en la información proporcionada.

## Capacidades

- Decisión estructurada sin generación de texto: devuelve probabilidades por opción para preguntas de tipo choice, sí/no (noul) y score.
- Procesamiento conjunto de múltiples preguntas en una sola llamada, cada una con su pasada hacia delante, compartiendo estado e imágenes.
- Entrada multimodal: texto o JSON combinado con varias imágenes por petición (PNG, JPEG, WebP; rutas, URL, PIL o base64), leídas hasta 1,6 megapíxeles cada una.
- Clasificación zero-shot: las opciones y los criterios se definen en la propia petición, sin necesidad de reentrenamiento.
- Comprensión de documentos e imágenes con texto: extracción de información clave (KIE) sobre recibos y formularios, e interpretación de infografías y gráficos.
- Enrutamiento y priorización: asignación de categorías (por ejemplo, equipo responsable) y puntuación de urgencia.
- Comparación de imágenes y texto (Winoground) y evaluación de pantallas o capturas de interfaz (Mind2Web).
- Orientación a despliegue de baja latencia como "system one" dentro de routers semánticos, sin decodificación autoregresiva.
- No dispone de generación libre de texto ni de capacidades de tool calling o de agente multi-paso declaradas.

## Casos de uso

- Enrutado de peticiones de atención al cliente: el modelo recibe el estado de un ticket y devuelve con qué equipo debe tratarse (devoluciones, facturación, soporte técnico) mediante una pregunta de tipo choice con criterios, tal como se muestra en el ejemplo oficial de la model card.
- Verificación documental en reclamaciones: dada una factura o recibo adjunto en imagen, responde a preguntas de tipo sí/no sobre su contenido (por ejemplo, si el recibo incluye el producto), apoyándose en el codificador visual y en las métricas de KIE declaradas (96,9 en CORD+FUNSD).
- Priorización de colas de soporte: asignación de una puntuación de urgencia (score) sobre texto entrante, útil para ordenar bandejas de entrada o escalar incidencias en tiempo real gracias a los 29,5 ms de latencia mediana en texto.
- Clasificación zero-shot en pipelines de ingestión: etiquetado de documentos, correos o JSON con criterios definidos en tiempo de ejecución, sin reentrenar el modelo para cada nueva taxonomía.
- Enrutado dentro de agentes y flujos multi-paso: como primera capa de un router semántico, decide qué componente o modelo aguas abajo debe procesar cada solicitud antes de invocar un LLM generativo más costoso.
- Moderación y evaluación de políticas sobre memes o imágenes con texto: aplicación de preguntas de sí/no y de elección sobre contenido visual, con la salvedad de los resultados limitados en Hateful Memes (37,4).
- Verificación de cumplimiento y comprobaciones binarias: baterías de preguntas sí/no sobre contratos, formularios o pantallas de aplicación, devolviendo una probabilidad por respuesta para umbralizar decisiones automatizadas.
- Análisis de capturas e interfaces: interpretación de pantallas y flujos (Mind2Web 83,6) para decidir el siguiente paso en tareas guiadas por interfaz.

## Benchmarks y rendimiento

Índice de decisión de texto (Jev Decision Index 0.3.1), según datos del autor:

| Modelo | Jev Decision Index ↑ | Public ↑ | Same-skill ↑ | New-domain ↑ |
|---|---:|---:|---:|---:|
| d3-mini | 54,2 | 54,9 | 52,7 | 48,6 |
| ezjev 4B s2 | 47,0 | 50,8 | 46,2 | 40,7 |
| Decision 2.0 (4B) | 45,0 | 44,2 | 43,7 | 42,2 |
| jiwo 4B | 42,9 | 45,8 | 46,1 | 33,3 |
| Hopper (G) 1.2 Qwen3.5-4B LoRA | 42,6 | 41,2 | 42,4 | 39,6 |
| JPT-4B Qwen3.5-4B LoRA | 41,6 | 42,8 | 40,1 | 39,2 |

Índice de visión (Jev Decision Index vision board 0.3.1):

| Modelo | Vision Index ↑ | Public ↑ | Private ↑ |
|---|---:|---:|---:|
| d3-mini | 65,5 | 67,8 | 63,3 |
| JPT-4B | 59,0 | 64,6 | 53,4 |
| RSI-Jev v5.0 VL 3B | 57,3 | 62,6 | 52,1 |
| Intern-Decision-4B | 56,5 | 61,7 | 51,3 |

Benchmarks públicos de visión de d3-mini († reconstrucción aproximada):

| Benchmark | d3-mini |
|---|---:|
| CV-Bench | 74,3 |
| BLINK | 53,4 |
| RealWorldQA | 57,3 |
| CharXiv † | 85,0 |
| InfographicVQA † | 93,4 |
| Mind2Web † | 83,6 |
| Winoground | 82,0 |
| KIE (CORD+FUNSD) † | 96,9 |
| Moderation (Hateful Memes) | 37,4 |
| R-Bench-M | 18,4 |
| MMMU-Pro vision | 33,5 |

Según la model card, d3-mini obtiene 54,91 en la suite pública del Jev Decision Index 0.3, con las 140.178 peticiones públicas respondidas y ninguna sin soporte, y mejora en 10,7 puntos a Decision 2.0 (4B) en esa misma suite. Los datos de d3-mini proceden de evaluación interna del autor; los del resto de modelos, del panel público (texto con fecha 2026-10-10, visión con fecha 2026-10-09).

## Requisitos de hardware

- Tamaño de pesos: el repositorio ocupa 18,2 GB, coherente con pesos en FP32 (4,54B × 4 bytes ≈ 18,16 GB).
- VRAM estimada en FP16/BF16: en torno a 9,1 GB solo para pesos, más activaciones e imágenes (hasta 1,6 MP por imagen y varias por petición).
- VRAM estimada en FP32: aproximadamente 18,2 GB para pesos.
- Estimaciones en cuantización a INT8 (≈4,5 GB) e INT4 (≈2,3 GB): no confirmadas, ya que no se documentan tipos de cuantización ni pesos GGUF.
- GPU de referencia del autor: AMD Instinct MI325X, sobre la que se miden 29,5 ms de mediana por petición de texto y 115,0 ms con imagen, con una petición a la vez.
- GPU profesionales: A100 (40/80 GB) y H100 son compatibles con la carga en FP32 o FP16.
- GPU de consumo: cabe en tarjetas de 24 GB como la RTX 4090 o la RTX 3090 en FP16; en 16 GB o menos requeriría cuantización, no documentada.
- Opciones de despliegue: transformers (AutoModel con trust_remote_code=True y pipeline de tipo "decision") e integración con vLLM Semantic Router. No se ofrecen pesos GGUF, por lo que llama.cpp, Ollama u otros motores que dependan de ese formato no están disponibles.
- Aceleración opcional: instalar flash-linear-attention para kernels rápidos en GPU sobre las capas de atención lineal.
- Throughput: no disponible (las cifras publicadas son de una sola petición simultánea, no de procesamiento por lotes).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Índice texto ↑ | Índice visión ↑ | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| d3-mini | 4,54B (0,33B visión) | no disponible | 54,2 | 65,5 | Apache-2.0 | HuggingFace, transformers con código remoto |
| Decision 2.0 (4B) | 4B | no disponible | 45,0 | no disponible | no disponible | citado en la model card, sin enlace |
| JPT-4B (Qwen3.5-4B LoRA) | 4B | no disponible | 41,6 | 59,0 | no disponible | citado en la model card, sin enlace |
| Intern-Decision-4B | 4B | no disponible | no disponible | 56,5 | no disponible | citado en la model card, sin enlace |
| ezjev 4B s2 | 4B | no disponible | 47,0 | no disponible | no disponible | citado en la model card, sin enlace |

## Limitaciones y advertencias

- No genera texto: su salida son probabilidades por opción; no sirve para respuestas en lenguaje natural ni para tareas generativas.
- No se declaran capacidades de tool calling, function calling ni razonamiento agente multi-paso.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe más allá de lo que permita el modelo base Qwen3.5-4B.
- Longitud de contexto no disponible, lo que impide planificar cargas con entradas largas.
- No se documentan tipos de cuantización ni pesos GGUF, lo que limita el despliegue en hardware de gama baja y en motores como llama.cpp u Ollama.
- Requiere trust_remote_code=True y transformers==5.17.0; el uso de código propio del autor implica revisar el repositorio antes de ejecutarlo en producción.
- Los benchmarks de d3-mini son de evaluación interna del autor, no de un tercero independiente; conviene tratarlos con cautela.
- Rendimiento flojo declarado en algunas tareas: moderación sobre Hateful Memes (37,4), R-Bench-M (18,4) y MMMU-Pro visión (33,5); no es adecuado como moderador robusto ni para razonamiento visual complejo.
- Riesgo de alucinación no evaluado en la información disponible; al tratarse de un clasificador con probabilidades, el riesgo se traslada a la calibración de los umbrales de decisión.
- Sesgos conocidos: no documentados en la model card.
- Licencia Apache-2.0, que permite uso comercial, pero al derivar de Qwen/Qwen3.5-4B conviene verificar también las condiciones del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vllm-sr/d3-mini
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- vLLM: https://vllm.ai/
- Repositorio de vLLM en GitHub: https://github.com/vllm-project/vllm
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
- Instalación de vLLM: https://docs.vllm.ai/en/latest/getting_started/installation/
- vLLM en Wikipedia: https://en.wikipedia.org/wiki/VLLM
