# vllm-sr/d3-nano

# d3-nano (vllm-sr/d3-nano)

## Resumen

d3-nano es un modelo de decision multimodal de 2,21B parametros desarrollado por vllm-sr (el proyecto vLLM Semantic Router) y presentado como el modelo base de decision 2B de la familia Decision 3.0. A diferencia de un modelo generativo, d3-nano recibe un estado (texto o JSON, opcionalmente acompanado de imagenes) y una bateria de preguntas tipificadas (eleccion entre opciones, si/no o puntuacion en una escala) y devuelve, en una sola llamada, una probabilidad para cada respuesta sin generar texto. Su funcion es actuar como capa de enrutado y clasificacion de bajisima latencia dentro de pipelines de enrutado semantico.

El modelo parte de Qwen/Qwen3.5-2B, al que anade un codificador visual de 0,33B, y usa capas de atencion lineal (el propio autor recomienda `flash-linear-attention` para kernels rapidos en GPU). De los 2,213,241,664 parametros totales, la mayor parte corresponde al backbone de lenguaje. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en el nicho que ocupa: clasificacion y decision zero-shot multimodales con latencias de decenas de milisegundos (22,4 ms por peticion de texto y 95,3 ms con imagen sobre una AMD Instinct MI325X, una peticion a la vez), sin coste de decodificacion autoregresiva. El autor reporta 41,84 en el indice publico de la suite Jev Decision Index 0.3, midiendo las 140.178 peticiones publicas con las ponderaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen/Qwen3.5-2B, con capas de atencion lineal y codificador visual de 0,33B (detalle completo de la arquitectura no disponible) |
| Parametros totales | 2.213.241.664 (2,21B), de los cuales 0,33B corresponden al codificador visual |
| Parametros activos | no disponible (no se describe como modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos safetensors; tamano de repo de 8,9 GB, coherente con pesos de 32 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que d3-nano se construye sobre Qwen/Qwen3.5-2B (Apache-2.0) y anade un codificador visual de 0,33B, conformando un modelo multimodal de 2,21B parametros. La referencia a `flash-linear-attention` como dependencia opcional "para las capas de atencion lineal" implica el uso de atencion lineal en parte del backbone, si bien no se detalla la proporcion de capas lineales frente a atencion estandar ni el esquema de fusion de las caracteristicas visuales. Las imagenes se colocan antes del texto de la peticion y cada una se lee a un maximo de 1,6 megapixeles; cada pregunta de la peticion ve todas las imagenes.

No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO. El unico dato de evaluacion disponible es interno al autor, medido con el kit oficial 0.3 sobre las ponderaciones publicadas. El mecanismo de inferencia es no generativo: el modelo responde cada pregunta mediante su propio forward pass sobre la entrada y devuelve una probabilidad por opcion.

## Capacidades

- Clasificacion y decision zero-shot sobre texto o JSON, sin generacion de texto.
- Tres tipos de pregunta: eleccion entre varias opciones (`choice`), respuesta binaria (`noul`) y puntuacion en una escala (`score`).
- Multiples preguntas en una sola llamada, cada una resuelta con su propio forward pass y con una probabilidad por opcion.
- Entrada multimodal: acepta varias imagenes por peticion en formato PNG, JPEG o WebP, proporcionadas como rutas locales, URL http(s), imagenes PIL o data URLs base64.
- Cada pregunta de la peticion tiene acceso a todas las imagenes asociadas a la entrada.
- Salida probabilistica por opcion, apta para umbrales y enrutado por confianza.
- No incluye tool calling, function calling ni razonamiento multi-paso: no es un modelo de generacion ni de agentes.

## Casos de uso

- Enrutado de tickets de soporte: dada la descripcion de una incidencia, el modelo decide en una sola llamada a que equipo corresponde (devoluciones, facturacion, tecnico) y con que urgencia, con una probabilidad por opcion para aplicar umbrales de derivacion.
- Verificacion documental en claims: combinando una imagen de recibo con el texto de la reclamacion, responde preguntas de si/no ("el recibo incluye el articulo") y de eleccion (forma de pago), util en tramitacion de devoluciones.
- Moderacion de contenido multimodal: clasificacion de memes e imagenes con texto asociado segun categorias predefinidas, con salida probabilistica.
- Extraccion estructurada por decision: sobre documentos escaneados (facturas, formularios), resuelve preguntas de eleccion para poblar campos concretos con una probabilidad de confianza.
- Control de calidad y triaje en pipelines de datos: etiquetado automatico de entradas JSON con preguntas binarias y de escala, sin coste de decodificacion generativa.
- Clasificacion de consultas para enrutado semantico de LLM: decidir que modelo o que ruta atiende una peticion en funcion de la consulta y, en su caso, de una captura de pantalla adjunta.
- Analisis de interfaz y formularios (Mind2Web se incluye en sus benchmarks publicos): responder preguntas sobre elementos y campos visibles en una captura.
- Filtrado por politica: preguntas de si/no sobre el cumplimiento de criterios antes de procesar una peticion con un modelo mayor.

## Benchmarks y rendimiento

Indice de decision sobre texto (Jev Decision Index 0.3.1):

| Modelo | Jev Decision Index | Publico | Same-skill tests | New-domain tasks |
|---|---:|---:|---:|---:|
| d3-nano | 37,8 | 41,8 | 38,4 | 32,3 |
| LiquidAI d1-3B | 40,1 | 49,0 | 43,6 | 28,0 |
| Jev-Style 2B v3 | 31,4 | 34,1 | 34,6 | 25,2 |
| Decision 2.0 (2B) | 27,1 | 30,1 | 29,3 | 23,0 |
| Decider 2B | 25,8 | 29,8 | 28,5 | 21,0 |
| FLock this-that 1.2 | 24,6 | 28,7 | 27,5 | 19,7 |

Indice de decision con vision (Jev Decision Index vision board 0.3.1):

| Modelo | Vision Index | Publico | Privado |
|---|---:|---:|---:|
| d3-nano | 57,1 | 59,9 | 54,3 |
| Intern-Decision-2B | 47,8 | 52,9 | 42,7 |

Benchmarks publicos de vision de d3-nano (los marcados con † son reconstrucciones aproximadas segun el autor):

| Benchmark | d3-nano |
|---|---:|
| CV-Bench | 70,5 |
| BLINK | 52,5 |
| RealWorldQA | 52,8 |
| CharXiv † | 77,7 |
| InfographicVQA † | 85,3 |
| Mind2Web † | 61,1 |
| Winoground | 71,3 |
| KIE (CORD+FUNSD) † | 97,0 |
| Moderation (Hateful Memes) | 22,5 |
| R-Bench-M | 17,0 |
| MMMU-Pro vision | 20,2 |

Nota: en la seccion de destacados el autor indica 41,84 en la suite publica con el kit 0.3, mientras que la tabla de evaluacion reporta 41,8 como valor publico bajo la version 0.3.1 del indice. La evaluacion de d3-nano es interna al autor; los valores de los modelos comparados proceden del board en vivo (texto a 2026-10-10, vision a 2026-10-09).

## Requisitos de hardware

- Memoria estimada para inferencia, a partir del numero de parametros y sin datos oficiales de cuantizacion: en fp32 en torno a 8,9 GB de pesos (coincide con el tamano del repositorio de 8,9 GB); en bf16/fp16 en torno a 4,4 GB; en int8 en torno a 2,2 GB; en int4 en torno a 1,1 GB. Todas son estimaciones, no cifras publicadas por el autor.
- GPU utilizada por el autor en la medicion de latencia: una AMD Instinct MI325X, con una peticion simultanea.
- Latencia publicada: mediana de 22,4 ms por peticion de texto y 95,3 ms por peticion con imagen, en esa configuracion.
- Encaje en GPU de consumo: no confirmado por el autor. Por tamano, un modelo de 2,21B cabria en GPU consumer con memoria suficiente (por ejemplo, 8-16 GB), pero no hay validacion publicada.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (se indica `transformers==5.17.0` junto a `torch`, `torchvision`, `pillow`, `safetensors` y `accelerate`); se recomienda `flash-linear-attention` como dependencia opcional para kernelizar las capas de atencion lineal. Tambien se ofrece como pipeline de `transformers` con tarea `"decision"`.
- Soporte de vLLM, llama.cpp, Ollama, TGI u otros motores: no disponible en la informacion proporcionada. No se publican pesos GGUF.
- Throughput y latencia mas alla del caso de una peticion a la vez: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Jev Decision Index (texto) | Vision Index | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| d3-nano | 2,21B (0,33B vision) | no disponible | 37,8 | 57,1 | Apache-2.0 | safetensors en HuggingFace |
| LiquidAI d1-3B | 3B | no disponible | 40,1 | no disponible | no disponible | no disponible |
| Jev-Style 2B v3 | 2B | no disponible | 31,4 | no disponible | no disponible | no disponible |
| Decision 2.0 (2B) | 2B | no disponible | 27,1 | no disponible | no disponible | no disponible |
| Intern-Decision-2B | 2B | no disponible | no disponible | 47,8 | no disponible | no disponible |

De los comparadores mostrados, LiquidAI d1-3B supera a d3-nano en el indice global de texto (40,1 frente a 37,8) y en la suite publica, pero queda por debajo en tareas de dominio nuevo (28,0 frente a 32,3). En vision, d3-nano supera a Intern-Decision-2B tanto en el indice global (57,1 frente a 47,8) como en las suites publica y privada. Para el resto de alternativas no se dispone de especificaciones tecnicas completas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto: solo devuelve probabilidades sobre las opciones o preguntas aportadas. Cualquier capacidad generativa, de razonamiento libre o de tool calling queda fuera de su alcance.
- Riesgo de clasificacion erronea cuando la pregunta o las opciones estan mal formuladas, ya que la decision depende enteramente de las `instructions` y los `criteria` que proporcione el usuario.
- La evaluacion publicada es interna al autor y se basa en el indice propio Jev Decision Index; los resultados de los modelos comparados proceden del board en vivo. No se aportan benchmarks de referencia estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.
- Rendimiento bajo en algunos benchmarks publicos de vision reportados por el propio autor: 22,5 en Hateful Memes, 17,0 en R-Bench-M y 20,2 en MMMU-Pro vision, lo que sugiere limitaciones en moderacion, razonamiento visual complejo y conocimiento experto.
- No se especifican sesgos conocidos, idiomas soportados ni longitud de contexto, por lo que no puede garantizarse un comportamiento multilingue ni el manejo de entradas de gran longitud.
- El modelo requiere `trust_remote_code=True` (tag `custom_code`), lo que implica ejecutar codigo del repositorio; conviene revisarlo antes de desplegarlo en produccion.
- Licencia Apache-2.0: permite uso comercial y modificacion, con las obligaciones habituales de atribucion y conservacion del aviso de licencia. El modelo base Qwen/Qwen3.5-2B es tambien Apache-2.0.
- Adopcion muy temprana: en el momento de la ficha el repositorio registra 0 descargas y 1 like, y las fechas de creacion y actualizacion (2026-10-10) apuntan a una publicacion reciente sin validacion externa independiente.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) ni soporte confirmado en motores de inferencia de alto rendimiento distintos de `transformers`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vllm-sr/d3-nano
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de vLLM Semantic Router (mencionado en la model card): https://github.com/vllm-project/semantic-router
- vLLM (proyecto principal): https://vllm.ai/
- Repositorio de vLLM en GitHub: https://github.com/vllm-project/vllm
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/
- Instalacion de vLLM: https://docs.vllm.ai/en/latest/getting_started/installation/
- vLLM en Wikipedia: https://en.wikipedia.org/wiki/VLLM
