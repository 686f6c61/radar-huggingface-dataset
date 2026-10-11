# vllm-sr/d3-flash

## Resumen

d3-flash es el modelo fundacional de decisión multimodal de 9B de Decision 3.0, la familia de modelos de decisión de vLLM Semantic Router, desarrollada por la organización vllm-sr. No es un modelo generativo: recibe una entrada (texto o JSON, opcionalmente acompañada de imágenes) junto con un conjunto de preguntas y devuelve, en una sola llamada, una probabilidad para cada respuesta posible. Los tres tipos de pregunta soportados son elección entre varias opciones (choice), sí/no (noul) y puntuación en una escala (score). El modelo no genera texto en ningún caso.

Con 8.392.695.024 parámetros totales, de los cuales 0,46B corresponden al codificador de visión, se construye mediante ajuste fino sobre Qwen/Qwen3.5-9B y se publica bajo licencia Apache-2.0. Su relevancia práctica está en el enrutamiento y la clasificación de baja latencia dentro de pipelines de agentes y routers semánticos: la model card reporta una mediana de 29,7 ms por petición de texto y 171,8 ms por petición con imagen sobre una GPU AMD Instinct MI325X, un dato muy por debajo de lo que costaría una llamada generativa equivalente.

Frente a su predecesor Decision 2.0 (9B, 46,76 en la suite pública), d3-flash alcanza 57,78 en la misma suite pública del índice Jev Decision 0.3, una mejora de 11,0 puntos, y obtiene 66,9 en el tablero de visión 0.3.1. El modelo está pensado para sustituir etapas de clasificación basadas en LLM generativo por un clasificador dedicado que responde varias preguntas sobre la misma entrada con un solo forward pass por pregunta.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.5-9B; la model card menciona capas de atención lineal para las que se ofrecen kernels opcionales de flash-linear-attention. Configuración completa no disponible |
| Parámetros totales | 8.392.695.024 (8,39B), incluidos 0,46B del codificador de visión |
| Parámetros activos | No disponible (no se declara que sea una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no se listan cuantizaciones publicadas; el repositorio solo distribuye pesos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, con código personalizado y `trust_remote_code=True`) |
| Modelo base | Qwen/Qwen3.5-9B |
| Tamaño del repositorio | 16,8 GB |
| Entradas | Texto o JSON, más imágenes (varias por petición; PNG, JPEG o WebP) |
| Tipos de decisión | Choice (elección), noul (sí/no), score (puntuación) |
| Pipeline declarado | zero-shot-classification |

## Arquitectura y entrenamiento

d3-flash es un transformer multimodal de 8,39B parámetros construido por ajuste fino sobre Qwen/Qwen3.5-9B, con un codificador de visión de 0,46B integrado en el mismo modelo. La model card indica que la instalación de `flash-linear-attention` es opcional y sirve para acelerar en GPU las capas de atención lineal, lo que confirma que la arquitectura combina capas de atención lineal con el resto del stack de Qwen3.5. Cada pregunta del usuario se resuelve con su propio forward pass sobre la entrada, y el modelo devuelve una probabilidad por cada opción candidata en lugar de tokens de texto.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. La model card únicamente documenta el resultado del ajuste: el sistema expone una única función `system_one(state, questions, images)` que agrupa preguntas de tipo choice, noul y score sobre la misma entrada. Las imágenes se sitúan antes del texto de la petición y se leen a un máximo de 1,6 megapíxeles cada una; todas las preguntas de la petición ven todas las imágenes adjuntas. El modelo requiere `transformers==5.17.0` y ejecución de código remoto.

## Capacidades

- Decisión por elección entre opciones (choice): asigna probabilidad a cada criterio definido por el usuario para una pregunta dada.
- Decisión binaria sí/no (noul): responde preguntas de verificación sobre la entrada.
- Puntuación en escala (score): ordena la entrada en una escala de criterios definida por el usuario, por ejemplo urgencia.
- Múltiples preguntas en una sola llamada: preguntas de los tres tipos sobre la misma entrada se responden juntas, cada una con su propio forward pass y su probabilidad por opción.
- Salida probabilística, no generativa: no produce texto libre, lo que elimina el riesgo de formato inválido en la respuesta.
- Entrada multimodal: acepta texto o JSON junto con una o varias imágenes (PNG, JPEG, WebP) en forma de rutas locales, URLs http(s), objetos PIL o data URLs en base64.
- Extracción de información de documentos: la model card reporta 96,3 aproximado en KIE (CORD+FUNSD) y 95,1 aproximado en InfographicVQA.
- Comprensión de interfaces y capturas: 85,1 aproximado en Mind2Web y 83,0 aproximado en CharXiv.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agéntico, ya que el modelo no genera texto ni llamadas a herramientas.

## Casos de uso

- Enrutamiento de peticiones en atención al cliente: el modelo recibe el texto del ticket y un conjunto de criterios (devoluciones, facturación, técnico) y devuelve la probabilidad de cada equipo, con una mediana de 29,7 ms por petición de texto, lo que permite insertarlo como primera etapa de un router semántico sin penalizar la latencia.
- Triaje y priorización de tickets: usando el tipo score con criterios como rutina, pronto o hoy, un sistema de soporte puede ordenar la cola de trabajo de forma automática y consistente.
- Verificación de documentos adjuntos: con una imagen de un recibo o una factura, el modelo responde preguntas de tipo noul (por ejemplo, si el recibo incluye el producto) en la misma llamada, con un coste de 171,8 ms de mediana por petición con imagen.
- Extracción de información clave en documentos (KIE): dado su 96,3 aproximado en CORD+FUNSD, encaja en pipelines de digitalización de facturas y formularios donde hay que decidir campos concretos en lugar de generar texto.
- Comprensión de capturas de pantalla e interfaces: con 85,1 aproximado en Mind2Web y 83,0 en CharXiv, puede alimentar agentes de automatización web que necesitan decidir la siguiente acción a partir de una captura.
- Filtrado previo en sistemas RAG: comprobar con preguntas binarias si una consulta requiere recuperación de documentos o si puede resolverse con conocimiento interno, evitando llamadas a modelos generativos.
- Clasificación de contenido multimodal en moderación asistida: Hateful Memes con 41,3, un valor bajo que solo permite uso como señal auxiliar y nunca como decisión final.
- Etiquetado de pares imagen-texto: Winoground con 83,3 lo sitúa como opción para decidir si una descripción corresponde a una imagen concreta, por ejemplo en validación de catálogos de producto.

## Benchmarks y rendimiento

Índice Jev Decision 0.3.1, texto (evaluación interna de d3-flash; el resto, datos del tablero en vivo a 2026-10-10):

| Modelo | Índice Jev Decision | Público | Pruebas de misma habilidad | Tareas de dominio nuevo |
|---|---:|---:|---:|---:|
| d3-flash | 59,0 | 57,8 | 57,5 | 52,9 |
| Bespoke Nimble 9B v3 | 54,7 | 57,2 | 52,3 | 49,1 |
| Nace.AI Drex v1.5 | 50,8 | 58,1 | 51,9 | 39,7 |
| AJev lora5 (Gemma 4 12B) | 50,0 | 51,7 | 51,4 | 41,5 |
| Winnow-12B | 49,3 | 50,7 | 48,1 | 44,2 |
| Decision 2.0 (9B) | 48,2 | 46,8 | 47,4 | 44,5 |

Tablero de visión del índice Jev Decision 0.3.1 (datos del tablero a 2026-10-09; d3-flash, evaluación interna):

| Modelo | Índice de visión | Público | Privado |
|---|---:|---:|---:|
| d3-flash | 66,9 | 69,5 | 64,3 |
| JPT-9B | 61,7 | 65,4 | 58,0 |
| Winnow-12B | 58,8 | 63,9 | 53,6 |
| Jev-Omni (12B) | 56,1 | 60,1 | 52,1 |

Benchmarks públicos de visión de d3-flash († reconstrucción aproximada):

| Benchmark | d3-flash |
|---|---:|
| CV-Bench | 75,2 |
| BLINK | 55,5 |
| RealWorldQA | 63,4 |
| CharXiv † | 83,0 |
| InfographicVQA † | 95,1 |
| Mind2Web † | 85,1 |
| Winoground | 83,3 |
| KIE (CORD+FUNSD) † | 96,3 |
| Moderación (Hateful Memes) | 41,3 |
| R-Bench-M | 20,8 |
| MMMU-Pro visión | 38,7 |

La model card indica además que el índice 0.3 sobre la suite pública se midió con el kit oficial 0.3 sobre los pesos publicados, con las 140.178 peticiones públicas respondidas y ninguna sin soporte.

## Requisitos de hardware

- Pesos en bf16/fp16: 8,39B parámetros equivalen a aproximadamente 16,8 GB, coherente con el tamaño del repositorio.
- VRAM estimada para inferencia: alrededor de 18-20 GB en bf16 incluyendo activaciones, y más si se procesan varias imágenes por petición, ya que cada imagen se lee a hasta 1,6 megapíxeles.
- GPU de centro de datos: la model card reporta mediciones sobre una AMD Instinct MI325X; por tamaño de memoria, una A100 40 GB, una H100 80 GB o una L40S 48 GB son suficientes para los pesos completos sin cuantizar.
- GPU de consumo: cabe en tarjetas de 24 GB como la RTX 4090, aunque con margen ajustado si se envían varias imágenes por petición.
- Cuantizaciones: no se han publicado pesos GGUF, AWQ ni GPTQ, por lo que no se puede confirmar su uso en llama.cpp u Ollama.
- Opciones de despliegue: la model card documenta únicamente `transformers` con `trust_remote_code=True` (y la variante `transformers.pipeline("decision", ...)`). No se confirma soporte de vLLM, TGI u otros motores de serving.
- Aceleración opcional en GPU mediante `flash-linear-attention` para las capas de atención lineal.
- Latencia reportada por el autor: mediana de 29,7 ms para una petición de texto y 171,8 ms para una petición con imagen, una petición a la vez sobre MI325X. No se publican cifras de throughput en lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Índice Jev texto | Índice de visión | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| d3-flash | 8,39B (0,46B visión) | No disponible | 59,0 | 66,9 | Apache-2.0 | Pesos en HuggingFace |
| Decision 2.0 (9B) | 9B (según la model card) | No disponible | 48,2 | No disponible | No disponible | Predecesor de la misma familia |
| Bespoke Nimble 9B v3 | 9B (según la model card) | No disponible | 54,7 | No disponible | No disponible | No disponible |
| Winnow-12B | 12B (según la model card) | No disponible | 49,3 | 58,8 | No disponible | No disponible |
| JPT-9B | 9B (según la model card) | No disponible | No disponible | 61,7 | No disponible | No disponible |
| Jev-Omni (12B) | 12B (según la model card) | No disponible | No disponible | 56,1 | No disponible | No disponible |

La comparación se limita a los datos publicados en la model card; no hay información sobre contexto, licencia ni disponibilidad de los modelos alternativos.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni llamadas a herramientas. Cualquier caso de uso que requiera generación necesita otro modelo en el pipeline.
- No se ha publicado la longitud de contexto soportada ni la lista de idiomas soportados, lo que impide planificar despliegues multilingües o con entradas largas sin una evaluación propia.
- Los benchmarks de texto y visión de d3-flash son de evaluación interna del autor y se comparan contra datos de un tablero en vivo; no son resultados reproducidos de forma independiente.
- Los valores de moderación son bajos (Hateful Memes 41,3), igual que el razonamiento visual complejo (MMMU-Pro visión 38,7 y R-Bench-M 20,8). No es adecuado como único mecanismo de decisión en esos dominios.
- No hay información publicada sobre sesgos demográficos, culturales o lingüísticos del modelo.
- El modelo devuelve probabilidades, pero no se documenta su calibración; tratarlas como confianza fiable en producción requiere validación propia.
- Requiere ejecutar código remoto (`trust_remote_code=True`) y una versión concreta de transformers (5.17.0), lo que añade riesgo de seguridad y rigidez de dependencias.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución, con atribución y conservación del aviso de licencia. El modelo base Qwen3.5-9B tiene su propia licencia, que conviene revisar.
- Adopción muy baja en el momento de la ficha (0 descargas y 1 like), sin ecosistema de cuantizaciones ni soporte confirmado en motores de serving habituales.
- No se documentan requisitos de memoria para lotes grandes ni para muchas imágenes simultáneas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vllm-sr/d3-flash
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- vLLM (web oficial): https://vllm.ai/
- Repositorio de vLLM en GitHub: https://github.com/vllm-project/vllm
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
- Guía de instalación de vLLM: https://docs.vllm.ai/en/latest/getting_started/installation/
- vLLM en Wikipedia: https://en.wikipedia.org/wiki/VLLM
