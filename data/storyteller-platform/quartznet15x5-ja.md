# storyteller-platform/quartznet15x5-ja

## Resumen

QuartzNet 15x5 Japanese es un modelo de reconocimiento automatico del habla (ASR) en japones basado en la arquitectura QuartzNet 15x5, una red neuronal convolucional de tipo 1D con bloques residuales y conexiones densas. El modelo original fue entrenado por kinouchi (revision `c3ce9780f679`) y publicado con licencia Apache-2.0; esta ficha corresponde a la redistribucion que hace storyteller-platform para su uso dentro de la plataforma Storyteller, que lo instala a traves de su componente ghost-story.

El repositorio no contiene pesos en formato NeMo original, sino una conversion con las capas de normalizacion por lotes plegadas en las convoluciones y dos formatos de despliegue: MLX (safetensors) y ONNX (grafo completo, incluyendo el front end de mel). Esto lo hace especialmente practico para inferencia en Apple Silicon mediante MLX y para despliegues multiplataforma con onnxruntime, sin necesidad de un extractor de caracteristicas separado.

Su relevancia actual radica en que cubre un nicho poco poblado: ASR japones ligero, con licencia permisiva y empaquetado listo para produccion en dos runtimes distintos. Al tratarse de un modelo convolucional pequeno (repo de 0,2 GB), es adecuado para transcripcion en dispositivos con recursos limitados o para integrarse en pipelines de subtitulado y busqueda por voz en japones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QuartzNet 15x5 (CNN 1D con bloques residuales y conexiones densas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de inferencia no especificada) |
| Tipos de cuantizacion | FP32 (ONNX) y FP16 (ONNX, solo el encoder; el front end permanece en FP32); safetensors para MLX |
| Idiomas soportados | japones |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), ONNX (`model.onnx`, `model_fp16.onnx`) |

## Arquitectura y entrenamiento

QuartzNet es una arquitectura convolucional de una sola dimension disenada para ASR, compuesta por bloques residuales con conexiones densas entre subcapas y convoluciones separables en profundidad. La variante 15x5 indica 15 bloques con 5 subcapas cada uno, lo que da un total de 75 capas convolucionales. El modelo opera sobre caracteristicas mel calculadas a partir de la senal de audio.

El checkpoint original fue entrenado por kinouchi sobre corpus japones (no se detalla la composicion exacta del dataset ni el numero de horas en la informacion disponible). En esta redistribucion, el proceso de conversion pliega cada capa de normalizacion por lotes en la convolucion correspondiente, lo que elimina las operaciones de batch norm en inferencia y simplifica el grafo. El export a ONNX integra ademas el front end completo (pre-enfasis, reflect padding, STFT implementada como convolucion, proyeccion mel, logaritmo y normalizacion por caracteristica), de modo que el modelo acepta la senal pre-enfasisada y con padding reflectante en lugar de caracteristicas precalculadas. Esto permite ejecutarlo en cualquier execution provider de onnxruntime sin un extractor de caracteristicas externo.

## Capacidades

- Reconocimiento automatico del habla en japones a partir de audio.
- Inferencia en dos runtimes: MLX (Apple Silicon) y ONNX Runtime (multiplataforma: CPU, CUDA, CoreML, DirectML, etc.).
- Front end de caracteristicas integrado en el grafo ONNX (STFT como convolucion, mel, log y normalizacion), sin dependencias de preprocesado externo.
- Variante FP16 del encoder para reducir el uso de memoria y acelerar la inferencia en hardware compatible.
- Salida de transcripcion basada en el vocabulario del checkpoint (`vocab.txt`).
- No soporta tool calling, agentes, vision, audio generativo ni razonamiento multi-paso; es un modelo puramente acustico de transcripcion.

## Casos de uso

- Subtitulado automatico de contenido en japones: el modelo transcribe audio a texto y puede integrarse en pipelines de generacion de subtitulos para video, con la ventaja de que el grafo ONNX incluye el front end y no requiere preprocesado separado.
- Transcripcion de reuniones y notas de voz en japones: al ser un modelo convolucional ligero (repo de 0,2 GB), puede ejecutarse en portatiles o en el propio dispositivo sin depender de servicios en la nube.
- Indexacion y busqueda por voz de archivos de audio japoneses: la transcripcion permite construir indices de texto para busqueda posterior en archivos multimedia.
- Aplicaciones de accesibilidad para hablantes de japones: dictado y conversion de voz a texto en tiempo real en entornos con recursos limitados.
- Procesamiento por lotes de archivos de audio: el formato ONNX permite desplegar el modelo en servidores con onnxruntime y procesar grandes volumenes de grabaciones de forma eficiente.
- Integracion en la plataforma Storyteller: el modelo se instala mediante ghost-story y se usa como motor ASR japones dentro de la cadena de conversion de libros y contenido de la plataforma.
- Prototipado rapido en Apple Silicon: la version MLX en safetensors permite experimentar con transcripcion japonesa en Macs sin configurar entornos CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio completo ocupa 0,2 GB, por lo que la huella de memoria es reducida y compatible con GPUs de gama baja.
- GPU recomendadas: cualquier GPU con soporte para onnxruntime (CUDA, DirectML, CoreML) o Apple Silicon con MLX; no se especifican modelos concretos.
- Cabe en GPU de consumo: si, dado el tamano del repositorio (0,2 GB) es esperable que quepa en GPUs de consumo, aunque no se detallan modelos concretos.
- Opciones de despliegue: onnxruntime (cualquier execution provider), MLX en Apple Silicon; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo ASR convolucional).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| QuartzNet 15x5 Japanese (este) | QuartzNet 15x5 | japones | Apache-2.0 | safetensors (MLX), ONNX | Front end integrado en ONNX; FP16 disponible |
| kinouchi/japanese-quartznet-large | QuartzNet large | japones | Apache-2.0 | NeMo checkpoint | Modelo original del que deriva este |
| Whisper (OpenAI) | Transformer encoder-decoder | multilingue (incluye japones) | MIT | safetensors, GGUF, ONNX | Mayor tamano y contexto; no disponible en esta busqueda para comparacion detallada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado unicamente en japones; no soporta otros idiomas.
- No se detalla la composicion del dataset de entrenamiento, por lo que se desconocen sesgos acusticos (acentos, ruido, dominio) y su comportamiento fuera del dominio de entrenamiento.
- Riesgo de errores de transcripcion en audio con ruido, solapamiento de hablantes o vocabulario tecnico no representado en el corpus.
- No se han publicado benchmarks que permitan evaluar su calidad frente a alternativas.
- El front end ONNX espera una senal pre-enfasisada y con padding reflectante; un uso incorrecto de la interfaz de entrada puede degradar la transcripcion.
- La variante FP16 solo aplica al encoder; el front end permanece en FP32, lo que debe tenerse en cuenta al optimizar memoria.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero requiere conservar el aviso de licencia y atribucion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/storyteller-platform/quartznet15x5-ja
- Modelo original: https://huggingface.co/kinouchi/japanese-quartznet-large
- Repositorio Storyteller (GitLab): https://gitlab.com/storyteller-platform/storyteller
- Scripts de conversion y export: https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
