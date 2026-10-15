# ZhuYuhan/VideoJev-4B

## Resumen

VideoJev-4B es un modelo de comprensión de vídeo de 4.471.106.560 parámetros (aproximadamente 4,47 mil millones) publicado por ZhuYuhan y desarrollado por el grupo MCG-NJU, según se desprende del enlace al repositorio de código y a la página del proyecto incluidos en la model card. Se presenta explícitamente como un modelo "System One" construido mediante ajuste fino sobre Qwen/Qwen3.5-4B, es decir, un modelo que responde mediante puntuación directa de candidatos en lugar de generar cadenas de razonamiento intermedias.

El modelo cubre dos tareas concretas: *temporal grounding* (localizar en qué intervalo de segundos ocurre un evento descrito en lenguaje natural) y *video question answering* de opción múltiple. Para ello devuelve puntuaciones calibradas: sigmoides independientes por instante temporal en el caso del grounding y una distribución softmax sobre las opciones en el caso del QA, junto con el índice de la respuesta elegida.

Es relevante porque reduce la comprensión de vídeo a un problema de puntuación discriminativa, lo que se traduce en latencias bajas y salidas probabilísticas directamente utilizables en pipelines de indexado, anotación o verificación. La licencia Apache-2.0 facilita su integración, aunque el repositorio requiere `trust_remote_code=True` y depende de versiones muy concretas de librerías. En el momento de redactar esta ficha acumula 328 descargas y 15 "me gusta" en HuggingFace, con el repositorio ocupando 9,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; modelo base Qwen/Qwen3.5-4B con codigo personalizado (`custom_code`) para procesamiento de video |
| Parametros totales | 4.471.106.560 (aproximadamente 4,47 B, dato de safetensors) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 8192 tokens en el ejemplo oficial de `predict_video`; maximo real del modelo no especificado |
| Tipos de cuantizacion | No disponible; el ejemplo oficial usa `dtype=torch.bfloat16` |
| Idiomas soportados | No disponible (HuggingFace no declara idiomas y la model card esta en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, con codigo personalizado (requiere `trust_remote_code=True`) |

Otros datos del repositorio: pipeline declarado `feature-extraction`, tamano del repo 9,0 GB, creado el 10 de octubre de 2026 y actualizado el 14 de octubre de 2026, 328 descargas y 15 likes.

## Arquitectura y entrenamiento

La model card describe VideoJev-4B como una adaptacion de Qwen/Qwen3.5-4B orientada a video, con relacion declarada `finetune` respecto al modelo base. La arquitectura interna no se detalla en la informacion disponible: no se especifica el numero de capas, la dimensionalidad, el mecanismo de atencion ni como se inyectan las representaciones visuales en el modelo de lenguaje. La unica informacion estructural utilizable son las dependencias de la guia de uso, que incluyen `flash-attn`, `flash-linear-attention`, `fla-core` y `causal-conv1d`. La presencia de estas dos ultimas apunta a componentes de atencion lineal y convolucion causal en alguna parte de la pila, aunque esto es una inferencia a partir de las dependencias y no un dato confirmado por el autor.

El comportamiento del modelo es el de un "System One": en lugar de generar texto token a token, puntua directamente candidatos. Para grounding produce una probabilidad sigmoide por instante temporal y deriva el intervalo aplicando un umbral (por defecto 0,25, configurable, con 0,4 como ejemplo de ajuste en la propia model card). Para QA de opcion multiple aplica softmax sobre las opciones y devuelve `answer_index`. El procesamiento de video se controla con parametros explicitos de muestreo temporal: en el ejemplo oficial, 2 FPS y hasta 2048 fotogramas.

No hay informacion disponible sobre el volumen de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF o DPO, ni sobre el proceso de alineacion. Tampoco se documenta si el ajuste fino congela el modelo base o entrena el conjunto completo. El paper citado (arXiv:2610.18615) es la referencia indicada para esos detalles, pero su contenido no forma parte de la informacion proporcionada.

## Capacidades

- *Temporal grounding*: dada una consulta en lenguaje natural (por ejemplo, "The woman in green eats pasta."), devuelve un intervalo en segundos y un vector de probabilidades por instante temporal.
- *Video question answering de opcion multiple*: recibe una pregunta y una lista de opciones etiquetadas (A, B, C...) y devuelve `answer_index` junto con las probabilidades softmax de cada opcion.
- *Extraccion de caracteristicas*: el pipeline declarado en HuggingFace es `feature-extraction`, y existe un metodo `predict_features` mencionado en la model card.
- *Salidas probabilisticas calibradas*: sigmoides independientes para grounding y softmax sobre opciones para QA, lo que permite umbralizar o combinar resultados aguas abajo.
- *Muestreo temporal configurable*: la tasa de fotogramas (`fps`), el numero maximo de fotogramas (`max_frames`) y el contexto (`context`) son parametros de la llamada a `predict_video`.
- *Procesamiento por lotes de preguntas*: el ejemplo oficial pasa una lista de preguntas heterogeneas (grounding y choice) en una sola invocacion y devuelve una lista de resultados.
- *Ejecucion en precision bfloat16 con FlashAttention-2*: segun el codigo de ejemplo oficial.
- No se documenta soporte de *tool calling*, function calling, uso como agente, razonamiento multi-paso, generacion de texto libre, vision de imagenes estaticas, audio ni modo "thinking". El propio diseno "System One" implica lo contrario: puntuacion directa sin cadena de razonamiento.

## Casos de uso

- *Indexado de videotecas y generacion de marcas de tiempo*: dado un catalogo de video, el modelo localiza los intervalos en los que aparece un objeto, una accion o una persona descrita en lenguaje natural, y esos intervalos se pueden almacenar como metadatos para busqueda posterior. La salida en segundos y el umbral configurable facilitan ajustar el equilibrio entre cobertura y precision.
- *Capitulado automatico para plataformas de video*: pasar la transcripcion o descripciones de escenas como consultas de grounding permite obtener marcas temporales para capitulos, resaltados o clips, sin necesidad de un modelo generativo que produzca texto.
- *Anotacion asistida de datasets de video*: el modo de opcion multiple permite preetiquetar preguntas de un conjunto de evaluacion y usar las probabilidades softmax para priorizar la revision humana, enviando a revision solo los casos con baja confianza.
- *Control de calidad de contenido audiovisual*: verificar si un elemento concreto (marca, producto, personaje) aparece en un intervalo de un video publicitario o de un directo, usando el grounding como filtro de primera etapa.
- *Analisis deportivo*: localizar jugadas descritas textualmente ("el jugador numero 10 remata a porteria") dentro de grabaciones completas, y encadenar despues un recorte automatico mediante ffmpeg sobre el intervalo devuelto.
- *Preprocesado para RAG multimodal*: usar el modo de extraccion de caracteristicas para generar representaciones de video que alimenten un indice vectorial, de modo que un sistema de recuperacion pueda devolver fragmentos de video relevantes ante una consulta textual.
- *Revision de grabaciones largas de vigilancia o de procesos industriales*: reducir el visionado manual a los intervalos donde el modelo detecta el evento de interes. Requiere validar previamente el umbral de grounding sobre el dominio concreto.
- *Evaluacion comparativa de modelos de video*: el formato de QA de opcion multiple encaja directamente en *benchmarks* de video-comprension, y las probabilidades devueltas permiten calcular metricas mas alla de la exactitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye dos graficos (`assets/benchmark-grounding.png` y `assets/benchmark-qa.png`) descritos como "quality and latency" para grounding temporal y para QA de video respectivamente, pero los valores concretos no estan accesibles en el texto proporcionado, por lo que no se reproducen cifras.

La unica salida verificable disponible es el ejemplo oficial ejecutado sobre el video "eating spaghetti" (10 segundos de duracion, muestreado a 2 FPS), con estos resultados:

| Tarea | Consulta | Resultado |
|---|---|---|
| Grounding | "The woman in green eats pasta." | Intervalo [3.0, 10.0] segundos; probabilidades sigmoides por instante entre 0.0058 y 0.9896 |
| Choice QA | "What is the woman in green eating?" con opciones A. Pasta / B. Rice / C. Soup | `answer_index` = 0, respuesta "A. Pasta."; probabilidades [0.99992, 0.0000576, 0.0000262] |

Se trata de una demostracion cualitativa sobre un unico video, no de un benchmark comparativo.

## Requisitos de hardware

- *VRAM estimada*: los 4.471.106.560 parametros en bfloat16 ocupan aproximadamente 8,9 GB, a lo que hay que sumar activaciones, memoria del codificador de video y las representaciones temporales generadas (hasta 2048 fotogramas por llamada en el ejemplo oficial). El tamano del repositorio es de 9,0 GB.
- *GPU utilizada por el autor*: el ejemplo oficial esta probado con una NVIDIA H200, con Python 3.12, PyTorch 2.8 y CUDA 12.8.
- *GPU consumer*: no hay datos publicados. Por peso de parametros el modelo cabria en GPUs de 24 GB (por ejemplo, RTX 4090 o RTX 3090) en bfloat16, pero el consumo real dependera del numero de fotogramas y del contexto, y el autor no confirma este escenario. Se requiere ademas una GPU compatible con FlashAttention-2.
- *Opciones de despliegue*: la unica ruta documentada es `transformers` con `trust_remote_code=True`, junto con `accelerate`, `safetensors`, `numpy`, `pillow`, `av==18.1.0`, `flash-linear-attention==0.4.2`, `fla-core==0.4.2`, `flash-attn` y `causal-conv1d`. No se menciona soporte para vLLM, TGI, llama.cpp ni Ollama, y el uso de codigo personalizado y de kernels especificos hace poco probable que funcionen sin portar el modelo.
- *Latencia y throughput*: no disponible. La model card referencia graficos de calidad frente a latencia, pero no incluye cifras en el texto.
- *Almacenamiento y pipeline de datos*: la decodificacion de video se hace con `av` y se recomienda `flash-attn` compilado sin aislamiento de build (`--no-build-isolation`).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados comparativos con otros modelos de grounding temporal o de QA de video, ni datos de alternativas de tamano similar. El unico modelo relacionado identificable es el propio modelo base, Qwen/Qwen3.5-4B, que no es una alternativa en la misma tarea sino el punto de partida del ajuste fino.

| Modelo | Relacion | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| VideoJev-4B | Modelo analizado | 4,47 B | 8192 tokens en el ejemplo oficial | Apache-2.0 |
| Qwen/Qwen3.5-4B | Modelo base (`finetune`) | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada |
| Alternativas de grounding temporal y QA de video | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- *Sesgos conocidos*: no se documenta ninguna evaluacion de sesgos ni de equidad en la informacion disponible.
- *Riesgo de alucinacion*: al trabajar por puntuacion discriminativa, el modelo no puede "inventar" texto libre, pero si puede asignar alta probabilidad a intervalos o a opciones incorrectas. La salida debe tratarse como una estimacion probabilistica, no como una etiqueta fiable por si sola.
- *Dependencia del umbral de grounding*: el resultado del intervalo depende directamente del umbral (0,25 por defecto). Umbrales bajos producen intervalos mas largos y mayor tasa de falsos positivos; umbrales altos pueden fragmentar o perder eventos. Requiere calibracion por dominio.
- *Formato de salida restringido*: el QA es exclusivamente de opcion multiple; el modelo no genera respuestas abiertas ni resúmenes textuales.
- *Cobertura temporal limitada por el muestreo*: a 2 FPS y 2048 fotogramas, la ventana cubierta es de aproximadamente 1024 segundos (unos 17 minutos) por llamada. Los eventos mas breves que 0,5 segundos a esa tasa de muestreo pueden no capturarse. Los valores optimos de `fps`, `max_frames` y `context` no estan documentados.
- *Idiomas*: no se declara soporte multilingue en HuggingFace ni en la model card. Los ejemplos estan en ingles y no hay evidencia de rendimiento en castellano.
- *Ejecucion de codigo remoto*: el modelo exige `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio del autor. Conviene auditar ese codigo antes de usarlo en produccion.
- *Restricciones de licencia*: el modelo se distribuye bajo Apache-2.0, que permite uso comercial. No obstante, al ser un ajuste fino de Qwen/Qwen3.5-4B, deben revisarse por separado las condiciones del modelo base y las de los datasets de video empleados en el entrenamiento, que no se detallan.
- *Dependencias fragiles*: la guia fija `transformers==5.14.1`, `av==18.1.0`, `flash-linear-attention==0.4.2` y `fla-core==0.4.2`, ademas de compilar `flash-attn` y `causal-conv1d`. Esto dificulta la reproducibilidad y la integracion en entornos con versiones distintas.
- *Madurez del proyecto*: 328 descargas y 15 likes, con una unica actualizacion registrada cuatro dias despues de la creacion. No hay historial de mantenimiento que permita inferir soporte a largo plazo.
- *Validacion insuficiente*: la unica evidencia publica accesible es un ejemplo sobre un video de 10 segundos. No hay datos de rendimiento en dominios distintos ni sobre videos largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZhuYuhan/VideoJev-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper: https://arxiv.org/abs/2610.18615
- Pagina del proyecto: https://mcg-nju.github.io/VideoJev
- Codigo fuente: https://github.com/MCG-NJU/VideoJev
- Guia de uso: https://huggingface.co/ZhuYuhan/VideoJev-4B/blob/main/USAGE.md
- Dataset de demostracion: https://huggingface.co/datasets/ZhuYuhan/VideoJev-Demo
