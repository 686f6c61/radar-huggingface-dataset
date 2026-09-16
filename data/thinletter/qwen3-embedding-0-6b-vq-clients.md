# thinletter/qwen3-embedding-0.6b-vq-clients

## Resumen

thinletter/qwen3-embedding-0.6b-vq-clients es un contenedor de cuantizacion vectorial (VQ) del codificador de consultas Qwen/Qwen3-Embedding-0.6B, publicado por el usuario thinletter. No se trata de un modelo nuevo entrenado desde cero, sino de una version comprimida de los pesos del modelo base, empaquetada en un unico fichero de 237 MiB (formato `.vqw`) que codifica consultas en checo produciendo vectores de 1024 dimensiones compatibles con un indice construido con el modelo original sin reindexar.

El objetivo declarado es ejecutar la codificacion de consultas directamente en el navegador mediante un runtime WebGPU propio, reduciendo el coste de servidor en arquitecturas RAG y de busqueda semantica. El fichero emplea codebooks bidimensionales de 128 entradas con indices de 7 bits (3,57 bits por peso) mas una tabla de tokens Q2_K con el vocabulario completo (49 MiB), y conserva el 96,8 % del nDCG@10 de la version en fp32 sobre el benchmark publico checo WebFAQ-cs (0,7072 frente a 0,7308).

La relevancia del artefacto esta en su enfoque de compresion: el autor documenta que Qwen3-Embedding-0.6B es mucho mas fragil a la cuantizacion que otros modelos, colapsando a 2,1 bits en checo (65-81 % del nDCG@10 en fp32). Su experimento concluye que los codebooks de 2 dimensiones superan a los de 4 dimensiones por bit, lo que justifica el formato a 3,57 bits por peso en lugar de los 2 bits de sus contenedores previos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de embeddings (heredada de Qwen/Qwen3-Embedding-0.6B); contenedor de cuantizacion vectorial sobre los pesos del codificador de consultas |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-Embedding-0.6B); el contenedor cuantizado ocupa 237 MiB, de los cuales 49 MiB son la tabla de tokens |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | VQ a 3,57 bits por peso: codebooks bidimensionales, K = 128, indices de 7 bits, mas tabla de tokens Q2_K con vocabulario completo (49 MiB). Version escalar alternativa del mismo autor: Q4_K_M de `llama-quantize` + tabla de tokens de 4 bits (340 MiB) |
| Idiomas soportados | Checo (cs) validado; etiquetado como multilingue por herencia del modelo base, sin evaluacion publicada en otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | `.vqw` (contenedor propio compilado por el runtime de thinletter); no es safetensors, GGUF ni ONNX |
| Dimension del embedding | 1024 dimensiones, normalizadas L2, pooling sobre el ultimo token |
| Prompt de consulta | `Instruct: Given a web search query, retrieve relevant passages that answer the query\nQuery:` (sin espacio final); los documentos se codifican sin instruccion |
| Tokenizador | `tokenizer-qwen3-0.6b.json` y `tokenizer_config-qwen3-0.6b.json` incluidos en el repositorio |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen/Qwen3-Embedding-0.6B, un transformer denso de 0,6 mil millones de parametros orientado a embeddings de recuperacion. El artefacto publicado no modifica la arquitectura: actua exclusivamente sobre los pesos del codificador de consultas, sustituyendo la representacion en punto flotante por codebooks vectoriales. Los documentos del indice siguen almacenandose en el formato original del modelo base, de modo que este fichero solo puede usarse como codificador de consultas contra un indice ya construido con Qwen3-Embedding-0.6B.

La innovacion tecnica principal es el diseno de los codebooks. El autor comprobo que Qwen3-Embedding-0.6B colapsa a 2,1 bits en checo (65-81 % del nDCG@10 en fp32, replicado en dos maquinas) y que los ficheros de `llama.cpp` a 3 bits o menos tambien fallan. El experimento de calibracion de 2026-09-15/16 concluyo que los codebooks bidimensionales rinden mejor por bit que los de cuatro dimensiones: con K = 64 a 3,07 bits por peso obtiene un nDCG@10 igual o superior a un codebook de 4 dimensiones con K = 2048 a 3,15 bits por peso (+0,024 nDCG@10 y +0,06 de coseno frente a 4 dimensiones con K = 1024). El fichero publicado usa 2 dimensiones con K = 128 a 3,57 bits por peso, que retiene el 98,0 % del fp32 con calibracion checa generica y el 98,8 % con calibracion con forma de pregunta sobre los bloques unicamente. La tabla de tokens Q2_K anade una perdida de 2,0 puntos y 0,025 de coseno; el autor descarto una tabla recortada de 35 000 tokens porque perdia 0,8 puntos adicionales e incumplia el criterio de coseno.

La calibracion se realizo con 3 000 preguntas reales del split de entrenamiento de WebFAQ-cs (disjunto del split de test), usando el prompt oficial de consulta del modelo y una unica semilla de rotacion. El fichero se genero con el comando `scripts/vq_export_web.py --teacher qwen3-0.6b --dim 2 --bits 3.5 --calib webfaq-cs_train_q --n_seq 3000 --vocab full`. El sha256 del fichero comienza por `a8de0ba4ae92`, con el valor completo en `results/raw/vqcz_box/exports_table.jsonl` del repositorio.

## Capacidades

- Codificacion de consultas de busqueda en checo: convierte texto de consulta en vectores densos de 1024 dimensiones, normalizados L2, con pooling del ultimo token.
- Recuperacion semantica (retrieval): disenado explicitamente para alimentar indices de recuperacion de pasajes construidos con Qwen3-Embedding-0.6B.
- Compatibilidad con indices existentes: no requiere reindexar, ya que los documentos se codifican con el modelo base sin instruccion y las consultas con el prompt oficial de Sentence-Transformers.
- Ejecucion en navegador mediante WebGPU: el runtime `client/vqweb/` ejecuta el contenedor directamente en el cliente, con soporte de `shader-f16`.
- Inferencia sin servidor de GPU: la codificacion de la consulta se realiza en el dispositivo del usuario, lo que permite desplegar arquitecturas RAG con indice en servidor y codificacion en cliente.
- Referencia de validacion en PyTorch: `scripts/vq_reference.py` permite reproducir el embedding de una cadena de texto para comparar con la salida del runtime.
- Soporte multilingue: etiquetado como multilingue por herencia del modelo base, aunque no hay evaluacion publicada fuera del checo.
- No soporta: generacion de texto, razonamiento, codigo, tool calling, agentes, vision, audio ni modo thinking. Es exclusivamente un codificador de consultas.

## Casos de uso

- Busqueda semantica en checo con codificacion en el navegador: una aplicacion web puede descargar los 237 MiB del contenedor una vez y codificar cada consulta del usuario en el cliente, enviando solo el vector de 1024 dimensiones al servidor que aloja el indice. Elimina el coste de GPU en el lado servidor para la parte de codificacion de consultas.
- RAG sobre corpus documentales checos: el modelo sirve como primer eslabon de una cadena de recuperacion aumentada, recuperando pasajes relevantes de un indice Qwen3-Embedding-0.6B antes de pasarselos a un LLM generador. La ventana de contexto del generador no se ve afectada porque este componente solo produce vectores.
- Busqueda en portales de la administracion publica checa: el corpus legal y administrativo en checo es un dominio donde el autor reporta un 93,1 % del nDCG@10 en fp32 sobre un indice legal checo (0,2965 frente a 0,3186), con la advertencia de que esa cifra queda por debajo del criterio de publicacion del autor.
- Motores de busqueda de documentacion tecnica interna en checo: permite indexar manuales y articulos y ofrecer busqueda por significado en lugar de por coincidencia de palabras clave, con la consulta procesada en el navegador del empleado.
- Asistentes de atencion al cliente en checo: integrado en un widget web, codifica la pregunta del usuario en el dispositivo y recupera respuestas de una base de conocimiento indexada, reduciendo la latencia de red al no requerir un viaje de ida y vuelta para la codificacion.
- Extensiones de navegador y PWA con funcionamiento parcial offline: al no depender de una API de embeddings remota, la extension puede codificar consultas localmente y mantener la funcionalidad aun con conectividad degradada (el indice en si sigue siendo remoto o local, segun el despliegue).
- Comercio electronico con busqueda de productos en checo: recuperacion semantica de fichas de producto a partir de descripciones coloquiales, usando el indice ya construido con Qwen3-Embedding-0.6B.
- Reduccion de coste en despliegues a gran escala: al trasladar la codificacion de consultas al cliente, el coste marginal por consulta en servidor se reduce al calculo de similitud sobre el indice, no a una pasada de inferencia de red neuronal.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor. La cifra principal de WebFAQ-cs es una simulacion en PyTorch del fichero publicado sobre el split de test; la comprobacion en navegador solo cubre 50 consultas.

| Benchmark / metrica | fp32 (Qwen3-Embedding-0.6B) | Contenedor VQ 3,57 bpw | Retencion |
|---|---|---|---|
| WebFAQ-cs nDCG@10 (71 529 pasajes, 7 231 preguntas con juicio humano) | 0,7308 | 0,7072 | 96,8 % |
| WebFAQ-cs coseno respecto al vector de consulta fp32 | 1,000 | 0,946 | — |
| WebFAQ-cs solapamiento del top-10 | 1,000 | 0,755 | — |
| Indice legal checo nDCG@10 (1 137 consultas sinteticas) | 0,3186 | 0,2965 | 93,1 % |
| Indice legal checo coseno | 1,000 | 0,930 | — |
| Indice legal checo solapamiento del top-10 | 1,000 | 0,653 | — |
| Comprobacion en navegador (primeras 50 consultas de test) | 0,6393 (simulacion) | 0,6393 (WebGPU, GPU Intel integrada) | 100 % (Δ 0,0000) |

| Comparativa de formatos del mismo autor | Tamano | nDCG@10 en indice legal checo (% de fp32) |
|---|---|---|
| Cliente escalar publicado (Q4_K_M de `llama-quantize` + tabla de tokens de 4 bits) | 340 MiB | 98,7 % |
| Este contenedor VQ (3,57 bpw + tabla de tokens Q2_K) | 237 MiB (70 % del anterior) | 93,1 % |

Resultados de la ablacion de codebooks reportados por el autor (2026-09-15/16): 2 dimensiones con K = 64 a 3,07 bpw iguala o supera a 4 dimensiones con K = 2048 a 3,15 bpw; 2 dimensiones con K = 128 supera en +0,024 nDCG@10 y +0,06 de coseno a 4 dimensiones con K = 1024. Todos los numeros provienen de una unica semilla y el propio autor advierte que diferencias inferiores a 0,01 de nDCG@10 quedan dentro de la varianza de la calibracion.

## Requisitos de hardware

- Almacenamiento: 237 MiB para el fichero `.vqw`; el repositorio completo ocupa 0,3 GB. La memoria de la pestana del navegador medida es de 412 MiB.
- VRAM estimada para inferencia: no aplica en el caso de uso principal, que es la ejecucion en el navegador mediante WebGPU. No se proporciona estimacion de VRAM para despliegue en servidor con GPU dedicada.
- GPU compatibles: el runtime requiere WebGPU con soporte de `shader-f16`. La unica medicion publicada corresponde a una GPU Intel integrada. No se miden latencias en GPU discretas ni en moviles.
- GPU de consumo: no se publican pruebas con RTX 4090, RTX 3090 u otras GPU de consumo. La referencia de 112 ms p50 por consulta corresponde a una GPU integrada, por lo que una GPU dedicada deberia ser igual o mas rapida, pero no esta medido.
- Despliegue: el camino soportado es el runtime WebGPU propio (`client/vqweb/`) con `client/browser/serve.py --mount vqw=<dir>` y `client/vqweb/bench.html?vqw=/vqw/<file>.vqw&dataset=webfaq-cs&split=test`, o bien `scripts/browser_run.py --runtime vqweb --vqw <file>`. Existe una referencia en PyTorch con `scripts/vq_reference.py <file> --embed "text"`.
- No hay soporte documentado de vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia: el formato `.vqw` es exclusivo del runtime del autor y no es un GGUF ni un safetensors.
- Latencia medida: p50 de 112 ms y p95 de 130 ms por consulta en GPU Intel integrada; 2,5 s de carga del contenedor. Sin fallback a CPU.
- Throughput: no disponible. No se reportan consultas por segundo ni parallelismo.

## Comparativa con modelos similares

| Modelo / artefacto | Parametros | Representacion | Resultado en checo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thinletter/qwen3-embedding-0.6b-vq-clients (este) | 0,6 B (contenedor de 237 MiB) | VQ 3,57 bpw, codebooks 2-d K = 128 + tabla Q2_K | 96,8 % del nDCG@10 fp32 en WebFAQ-cs (0,7072) | Apache-2.0 | HuggingFace + runtime WebGPU en GitHub |
| Qwen/Qwen3-Embedding-0.6B (fp32, modelo base) | 0,6 B | Punto flotante de 32 bits | 0,7308 nDCG@10 en WebFAQ-cs (referencia) | Apache-2.0 | HuggingFace |
| Cliente escalar del mismo autor (`llama-quantize` Q4_K_M + tabla de 4 bits) | 0,6 B (340 MiB) | 4 bits escalar | 98,7 % en indice legal checo | Apache-2.0 | HuggingFace |
| Contenedores harrier del mismo autor (otro modelo) | No disponible | VQ 2,1 bpw, codebooks 4-d de 256 entradas | Qwen3-Embedding-0.6B no sobrevive a 2 bits: colapso al 65-81 % del fp32 | Apache-2.0 | No disponible en detalle |

No se dispone de comparaciones con otros codificadores multilingues (por ejemplo, variantes de E5, BGE-M3 o GTE) en la informacion proporcionada, ni de datos de benchmark de terceros sobre este contenedor. La busqueda web realizada para esta ficha no devolvio resultados relevantes.

## Limitaciones y advertencias

- Un unico modelo y una unica semilla: el autor advierte que las diferencias inferiores a 0,01 de nDCG@10 quedan dentro de la varianza del sorteo de calibracion. La cifra de 96,8 % en WebFAQ-cs es la simulacion en PyTorch del fichero completo sobre 7 231 consultas, no una medicion directa en navegador.
- Validacion en navegador limitada: la replica real en WebGPU solo cubre las primeras 50 consultas de test (Δ 0,0000 frente a la simulacion). No hay validacion a gran escala del runtime en produccion.
- El resultado sobre el indice legal checo (93,1 % del fp32) queda por debajo del criterio de publicacion del propio autor, que lo reporta explicitamente como tal. Ademas, ese test es sintetico y su calibracion proviene de otro dominio.
- Solo checo: aunque la etiqueta incluye `multilingual`, no hay ninguna evaluacion publicada en otros idiomas. El comportamiento en castellano, ingles u otros idiomas es desconocido.
- Es unicamente un codificador de consultas: no codifica documentos y no puede usarse para construir un indice desde cero sin el modelo base Qwen3-Embedding-0.6B. Tampoco genera texto, razona ni ejecuta herramientas.
- El modelo no sobrevive a 2 bits: el autor documenta colapso en checo al 65-81 % del nDCG@10 fp32 a 2,1 bits. Este fichero es de 3,6 bits por peso, no de 2 bits, por lo que no es comparable en tamano con los contenedores previos del mismo autor.
- Tabla de tokens Q2_K: cuesta 2,0 puntos de nDCG@10 y 0,025 de coseno respecto a la calibracion sobre bloques. El autor descarto la tabla recortada de 35 000 tokens por incumplir el criterio de coseno.
- Requisito de WebGPU con `shader-f16` y sin fallback a CPU: los navegadores o equipos sin soporte no pueden ejecutar el contenedor. La memoria de pestana medida es de 412 MiB, no trivial para dispositivos con poca RAM.
- Sin medidas de latencia en GPU discretas ni en moviles, lo que impide planificar despliegues fuera de la GPU integrada de Intel probada.
- Licencia Apache-2.0 en los pesos derivados, en el formato de contenedor, en el compilador y en el runtime. La calibracion usa WebFAQ (PaDaS-Lab/webfaq-retrieval, CC BY 4.0) y las preguntas no se redistribuyen; si se redistribuye el contenedor conviene verificar las obligaciones de atribucion de la fuente de calibracion.
- Adopcion nula en el momento de la consulta: 0 descargas y 0 likes, sin validacion independiente por parte de la comunidad.
- Riesgo de alucinacion: no aplica directamente, ya que el modelo no genera texto. El riesgo equivalente es la recuperacion de pasajes poco relevantes por la perdida de calidad del vector de consulta.
- No se especifica la longitud de contexto del contenedor ni la del modelo base en la informacion proporcionada, por lo que no se puede garantizar el comportamiento con consultas muy largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thinletter/qwen3-embedding-0.6b-vq-clients
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Repositorio con el runtime WebGPU, el cuantizador y el compilador de contenedores (Apache-2.0): https://github.com/rosecky/embedding-quantization-public
- Demo en navegador (corpus WebFAQ CS, cliente vq3.5): https://thinletter.io/demo
- Espejo de la demo en HuggingFace Spaces: https://huggingface.co/spaces/thinletter/demo
- Dataset de calibracion WebFAQ: https://huggingface.co/datasets/PaDaS-Lab/webfaq-retrieval
- Documento interno de resultados de la ablacion de codebooks: `docs/release/vq_results.md` §7 del repositorio publico
- Resultados crudos y sha256 del fichero: `results/raw/vqcz_box/exports_table.jsonl` del repositorio publico
- Contacto del autor: info@thinletter.io
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los resultados obtenidos correspondian a productos de limpieza de desagues y no guardan relacion.
