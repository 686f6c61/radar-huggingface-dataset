# ZhuYuhan/VideoJev-35B-A3B

## Resumen

VideoJev-35B-A3B es un modelo de comprensión de vídeo desarrollado por Yuhan Zhu y el grupo MCG-NJU (Universidad de Nanjing), publicado en octubre de 2026 bajo licencia Apache 2.0. Se construye como un *fine-tune* del modelo base Qwen/Qwen3.6-35B-A3B, una arquitectura Mixture of Experts (MoE) de 35B parámetros nominales y aproximadamente 3B activos por token. El modelo real aloja 33.791.740.272 parámetros (33,79B) en pesos safetensors en bfloat16, con un repositorio de 67,6 GB.

Su particularidad es que no es un modelo generativo al uso: se presenta como un "System One model" que resuelve dos tareas mediante *scoring* directo de candidatos en una única pasada hacia delante. Para *temporal grounding*, evalúa con sigmoide independiente cada instante del vídeo y devuelve el intervalo temporal donde ocurre el evento descrito; para *video question answering* de opción múltiple, calcula un softmax sobre las opciones proporcionadas y devuelve el índice y el texto de la respuesta. Esto elimina la decodificación autorregresiva y reduce la latencia frente a enfoques que generan texto libre.

Es relevante ahora porque ataca dos cuellos de botella prácticos en pipelines de vídeo a gran escala: la localización precisa de momentos en el tiempo y la respuesta cerrada sobre contenido audiovisual, ambas con una API de inferencia sencilla (`predict_video`, `predict_features`) y soporte de hasta 2048 fotogramas a 2 FPS en el ejemplo oficial. El modelo se distribuye con código personalizado (`trust_remote_code`) y depende de `transformers` 5.14.1, además de kernels de atención FlashAttention-2 y de atención lineal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) heredada de Qwen/Qwen3.6-35B-A3B; cabecera de scoring de candidatos para grounding y QA de opción múltiple |
| Parametros totales | 33.791.740.272 (33,79B), según safetensors |
| Parametros activos | Aproximadamente 3B (lo indica la denominación "A3B" del modelo base; no se detalla en la información proporcionada) |
| Longitud de contexto | No disponible a nivel de modelo; el ejemplo oficial invoca `context=8192` y `max_frames=2048` |
| Tipos de cuantizacion | No disponible; solo se documentan pesos en bfloat16 (`dtype=torch.bfloat16`) |
| Idiomas soportados | No disponible (no se declara lista de idiomas en la model card ni en los tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con `custom_code` (requiere `trust_remote_code=True`) |
| Libreria | transformers (probado con 5.14.1) |
| Pipeline declarado | feature-extraction |
| Tareas soportadas | video-question-answering, temporal-grounding |
| Entrada de vídeo | Fotogramas muestreados a `fps` configurable; el ejemplo usa 2,0 FPS y `max_frames=2048` |
| Umbral de grounding | 0,25 por defecto; configurable (por ejemplo 0,4) en `predict_video` / `predict_features` |
| Salida | JSON con `probabilities`, `interval` (segundos) para grounding; `answer_index` (base 0) y `answer` para QA |
| Descargas / likes | 468 descargas, 15 likes (a fecha de la información) |
| Fechas | Creado el 2026-10-10, actualizado el 2026-10-17 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.6-35B-A3B, un transformer con capas MoE: de los 33,79B parámetros almacenados, solo una fracción (del orden de 3B según la nomenclatura del base) se activa por token, lo que abarata el coste de cómputo por pasada frente a un denso del mismo tamaño. Sobre ese tronco, VideoJev añade una cabeza y un procedimiento de evaluación por *scoring* de candidatos en lugar de generación libre. Las dependencias declaradas en el ejemplo de uso —`flash-linear-attention==0.4.2`, `fla-core==0.4.2`, `causal-conv1d` y `flash-attn`— apuntan a que el modelo base incorpora componentes de atención lineal y convoluciones causales junto a atención completa, aunque la model card no detalla la proporción de capas de cada tipo.

No se especifica en la información disponible el volumen de tokens de entrenamiento, la composición del dataset de *fine-tune*, ni si se emplearon etapas de RLHF o DPO. El autor describe el resultado como un "System One model", es decir, un modelo que responde en un único paso de inferencia sin cadena de razonamiento explícita, y lo enmarca en el artículo arXiv:2610.18615 ("VideoJev: System One Model for Video Understanding and Interaction"), con código en GitHub y página del proyecto. La innovación técnica destacable es el uso de puntuaciones sigmoideas independientes por instante temporal para el grounding (con umbral configurable para delimitar el intervalo) y de un softmax restringido al conjunto de opciones para el QA, lo que evita la decodificación autorregresiva y permite exponer directamente distribuciones de probabilidad calibradas en la salida.

## Capacidades

- *Temporal grounding*: localiza el intervalo de tiempo (en segundos) en el que ocurre un evento descrito en lenguaje natural, devolviendo probabilidad por instante y un intervalo delimitado por umbral (0,25 por defecto).
- *Video question answering* de opción múltiple: recibe pregunta y lista de opciones (por ejemplo "A. Pasta.", "B. Rice.", "C. Soup.") y devuelve la opción elegida con su distribución softmax.
- Extracción de características de vídeo mediante `predict_features`, reutilizable para puntuar múltiples consultas sobre el mismo vídeo sin recomputar la codificación visual.
- Procesamiento por lotes de preguntas heterogéneas: `predict_video` acepta una lista de tareas mezclando `grounding` y `choice` en la misma llamada.
- Muestreo de fotogramas configurable (`fps`) y límite de fotogramas (`max_frames`), lo que permite ajustar coste y cobertura temporal.
- No es un modelo generativo: no produce texto libre, resúmenes ni diálogo abierto; su salida es estructurada (JSON con probabilidades).
- No se documentan en la información disponible capacidades de *tool calling*, uso de agentes, razonamiento multi-paso, audio, OCR ni instrucciones generales de chat.

## Casos de uso

- Búsqueda de momentos en archivos audiovisuales: indexar una videoteca y responder consultas del tipo "¿en qué tramo aparece el coche rojo?" usando el intervalo devuelto en segundos, sin transcripción ni metadatos manuales.
- Pre-anotación de datasets de vídeo: generar intervalos candidatos para etiquetado temporal y revisión humana posterior, acelerando la construcción de corpus de grounding.
- Control de calidad en pipelines de producción audiovisual: verificar mediante QA de opción múltiple si un clip contiene un determinado elemento (logo, producto, escena), integrándolo como paso de validación tras el renderizado.
- Moderación y triaje de contenido: plantear preguntas cerradas sobre presencia de categorías sensibles en fragmentos concretos y usar las probabilidades como señal de confianza para escalar a revisión humana.
- Análisis de vídeo de vigilancia o industrial: localizar eventos acotados ("la persona cruza la línea") sobre secuencias muestreadas a 2 FPS con hasta 2048 fotogramas, suficiente para ventanas de varios minutos.
- Asistentes de interacción sobre vídeo: responder preguntas de opción múltiple en interfaces de reproducedor o en sistemas de accesibilidad, aprovechando la latencia baja del esquema de scoring frente a la generación libre.
- Investigación en comprensión de vídeo: usar `predict_features` para obtener representaciones y comparar calibración de probabilidades entre modelos de grounding en experimentos reproducibles.

## Benchmarks y rendimiento

La model card incluye dos gráficas (`assets/benchmark-grounding.png` y `assets/benchmark-qa.png`) que comparan calidad y latencia del modelo en grounding temporal y QA de vídeo, pero no se proporcionan los valores numéricos en la información disponible.

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K, VLMEvalKit, NExT-QA, ActivityNet-Grounding u otros no aparecen con cifras).

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 68-75 GB solo para pesos (67,6 GB de safetensors) más activaciones y caché de vídeo; el ejemplo oficial se ejecutó en una NVIDIA H200.
- GPU recomendadas: H200 (probada por el autor), A100 80 GB o H100 80 GB como mínimo de una sola tarjeta; con 80 GB el margen para vídeos largos y `max_frames=2048` es ajustado.
- Configuraciones multi-GPU: necesarias para tarjetas de 48 GB o menos (por ejemplo 2×A6000 48 GB o 4×RTX 4090), repartiendo pesos con `device_map`; el ejemplo oficial usa `device_map={"": "cuda:0"}`.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 en bfloat16; no se han publicado versiones cuantizadas (GGUF, AWQ, GPTQ) que lo permitan, por lo que en la información disponible no hay ruta viable a 4 bits.
- Despliegue: `transformers` 5.14.1 con `trust_remote_code=True`, `attn_implementation="flash_attention_2"`, más `flash-attn`, `causal-conv1d`, `flash-linear-attention==0.4.2` y `fla-core==0.4.2`; requiere `av==18.1.0` para la lectura de vídeo. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, coherente con su API de scoring personalizada y su naturaleza no generativa.
- Entorno validado: Python 3.12, PyTorch 2.8 con CUDA 12.8.
- Latencia y throughput: no se publican cifras concretas; las gráficas de la model card incluyen latencia comparada, pero los valores no están disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VideoJev-35B-A3B | 33,79B totales; ~3B activos (MoE) | No disponible (ejemplo con `context=8192`) | Grounding temporal y QA de vídeo por scoring | Apache 2.0 | Pesos safetensors en HuggingFace, código en GitHub |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35B nominales; ~3B activos (MoE) | No disponible | Generación de texto multimodal de propósito general | No disponible en la información proporcionada | HuggingFace |
| Otros modelos de grounding temporal de vídeo | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos verificables de alternativas comparables (por ejemplo, modelos especializados en grounding temporal o en QA de vídeo), por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Modelo no generativo: no admite preguntas abiertas, resúmenes, diálogo multi-turno ni instrucciones libres; el QA debe formularse como elección entre opciones explícitas.
- El grounding devuelve un único intervalo por consulta, delimitado por un umbral; eventos múltiples o solapados requieren consultas separadas y post-procesado propio.
- Límite práctico de cobertura temporal: con 2 FPS y `max_frames=2048` se cubren unos 1024 segundos (aproximadamente 17 minutos); vídeos más largos exigen reducir `fps` o trocear la entrada.
- El parámetro `context=8192` del ejemplo acota el número de fotogramas y consultas procesables por llamada; no se documenta el contexto máximo real del modelo.
- No se declaran idiomas soportados, por lo que el comportamiento multilingüe de las consultas (especialmente en castellano) no está garantizado ni evaluado en la información disponible.
- Riesgo de calibración: las probabilidades de grounding son sigmoides independientes por instante, no una distribución normalizada, y el umbral 0,25 es un valor por defecto que puede generar intervalos espurios en vídeos con eventos sutiles; se recomienda validar el umbral en el dominio propio.
- Dependencia de `trust_remote_code=True` y de código personalizado: implica ejecutar código del repositorio y revisar su procedencia antes de desplegarlo en producción.
- Ecosistema frágil: requiere versiones muy concretas de `transformers` (5.14.1), `flash-linear-attention` y `fla-core`, además de compilar `flash-attn` y `causal-conv1d`; no hay soporte documentado en servidores de inferencia habituales.
- Sesgos y alucinación: al no generar texto libre, el riesgo de alucinación se traslada a falsos positivos en el intervalo o a elección errónea de opción; los sesgos heredados del corpus del modelo base (demográficos, culturales, de género) no se documentan y deben evaluarse por dominio.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se detallan en la información disponible las condiciones del modelo base ni posibles restricciones adicionales del dataset de vídeo utilizado.
- Metadatos incompletos: sin lista de idiomas, sin cifras de benchmarks y sin ficha de datos de entrenamiento, lo que dificulta una evaluación de riesgos previa a producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZhuYuhan/VideoJev-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper (arXiv): https://arxiv.org/abs/2610.18615
- Página del proyecto: https://mcg-nju.github.io/VideoJev
- Código: https://github.com/MCG-NJU/VideoJev
- Guía de uso: https://huggingface.co/ZhuYuhan/VideoJev-35B-A3B/blob/main/USAGE.md
- Dataset de demostración (Eating spaghetti): https://huggingface.co/datasets/ZhuYuhan/VideoJev-Demo
