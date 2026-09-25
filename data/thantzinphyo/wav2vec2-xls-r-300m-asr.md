# thantzinphyo/Wav2Vec2-XLS-R-300M-ASR

## Resumen

Wav2Vec2-XLS-R-300M-ASR es un modelo de reconocimiento automatico del habla (ASR) en birmano, publicado por el usuario thantzinphyo en HuggingFace. Se trata de un ajuste fino supervisado del checkpoint preentrenado facebook/wav2vec2-xls-r-300m, un modelo de representaciones de voz multilingue basado en wav2vec 2.0 y preentrenado sobre 128 idiomas y aproximadamente 436.000 horas de audio sin etiquetar. El ajuste se ha realizado con Connectionist Temporal Classification (CTC) sobre un corpus propio de unas 22 horas de audio birmano.

El modelo cuenta con 315.505.346 parametros (la model card indica aproximadamente 317M), un cabezal CTC con vocabulario de 64 tokens a nivel de caracter, y entrada de audio mono a 16 kHz. El corpus de entrenamiento consta de 24.560 ficheros WAV generados con 13 voces sinteticas birmanas, repartidas en 11 hablantes para entrenamiento y validacion y 2 hablantes no vistos para el conjunto de test. Esta composicion es la caracteristica mas relevante del modelo: al provenir de voces sinteticas, el modelo esta especializado en un dominio acustico muy concreto y su generalizacion a voces humanas reales es la principal incognita.

Es relevante ahora porque el birmano es un idioma de bajos recursos con muy pocos modelos ASR publicos, y este checkpoint ofrece una base abierta (Apache 2.0) para experimentar, preanotar corpus o servir de punto de partida para fine-tuning con datos reales. Su licencia permisiva y su tamano moderado (1,3 GB de repositorio) lo hacen desplegable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 XLS-R (extractor convolucional de features + encoder Transformer) con cabezal CTC |
| Parametros totales | 315.505.346 (segun safetensors); la model card indica ~317M |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No aplica en tokens; admite audio de longitud variable. Frecuencia de muestreo de entrada: 16.000 Hz, mono |
| Tipos de cuantizacion | No se publican cuantizaciones (el repo solo contiene safetensors). No documentado por el autor |
| Idiomas soportados | Birmano (`my`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,3 GB; incluye tambien logs de TensorBoard) |
| Vocabulario | 64 tokens a nivel de caracter birmano (cabezal CTC) |
| Modelo base | facebook/wav2vec2-xls-r-300m |

## Arquitectura y entrenamiento

La arquitectura es la estandar de wav2vec 2.0 en su variante XLS-R: un extractor convolucional que transforma la onda de audio en una secuencia de representaciones latentes, seguido de un encoder Transformer que las procesa, y un cabezal lineal CTC para la transcripcion. El modelo base fue preentrenado de forma auto-supervisada sobre 128 idiomas (aproximadamente 436.000 horas de audio), lo que le proporciona representaciones acusticas multilingues que despues se especializan mediante ajuste fino supervisado con CTC. En este caso, el ajuste se realizo sobre un corpus propio de birmano: 24.560 ficheros WAV de 16 bits PCM, mono y 16 kHz, con una duracion total de aproximadamente 22 horas y 13 hablantes sinteticos.

La configuracion de entrenamiento documentada por el autor es: tamano de lote efectivo 32 (4 por dispositivo con 8 pasos de acumulacion de gradiente), tasa de aprendizaje maxima 3,0e-4 con scheduler lineal, 200 pasos de warmup, 2.000 pasos totales (aproximadamente 6 epocas), precision mixta BF16, gradient checkpointing activado y sin aumentacion de datos. El preprocesado de texto estandariza Unicode de Myanmar (rango `\u1000-\u109F`), unifica la segmentacion de palabras y elimina la puntuacion. No se documenta el uso de RLHF ni DPO, algo esperable en un modelo ASR. La innovacion diferencial no es arquitectonica, sino la especializacion en birmano y la separacion explicita de un conjunto de test con hablantes no vistos para medir generalizacion cero-disparo.

## Capacidades

- Reconocimiento automatico del habla en birmano a partir de audio mono a 16 kHz, con salida de texto sin puntuacion (la puntuacion se elimino en el preprocesado).
- Transcripcion a nivel de caracter (64 tokens), no de subpalabras ni palabras completas.
- Procesamiento de audio de longitud variable, con soporte de inferencia por lotes mediante el pipeline de transformers.
- Robustez razonable en el dominio de entrenamiento: 3,53 % de CER y 24,25 % de WER en validacion, con chrF de 94,97.
- Generalizacion parcial a voces no vistas: 6,58 % de CER, 33,24 % de WER y chrF de 87,69 en hablantes fuera del conjunto de entrenamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso; es un modelo acustico puro, no un modelo de lenguaje generativo.
- No dispone de capacidades de vision, audio-vision, traduccion, diarizacion ni deteccion de idioma.
- Monolingue: no cubre otros idiomas.
- No dispone de modo "thinking" ni de generacion de texto libre.

## Casos de uso

- Transcripcion de contenido en birmano: digitalizar entrevistas, podcasts o videos en birmano a texto plano. El modelo esta ajustado especificamente para este idioma, con un WER de validacion de 24,25 sobre el dominio de entrenamiento.
- Preanotacion de corpus para linguistica: con un CER de 6,58 sobre hablantes no vistos, puede generar transcripciones iniciales que anotadores humanos revisan y corrigen, reduciendo el coste de construir corpus etiquetados en birmano.
- Indexado y busqueda sobre archivos de audio: convertir grandes volumenes de grabaciones en texto para permitir busqueda por palabra clave y recuperacion de fragmentos, algo inviable en birmano con herramientas ASR comerciales habituales.
- Atencion al cliente en birmano: transcripcion de llamadas para su analisis posterior, categorizacion de motivos de contacto o generacion de resumenes por parte de un modelo de lenguaje posterior. El modelo ASR actua como primera etapa del pipeline; no hay que esperar exactitud suficiente para sustitucion automatica sin supervision humana.
- Fine-tuning con datos reales: al ser un checkpoint Apache 2.0 derivado de XLS-R, sirve como punto de partida para ajustar con grabaciones humanas reales; partir de un modelo ya expuesto a la fonetica birmana requiere menos datos que partir del XLS-R original.
- Investigacion en ASR de bajos recursos: el modelo permite estudiar la brecha entre dominios sinteticos y reales, ya que el autor publica metricas separadas para el conjunto de hablantes no vistos (WER 33,24 frente a 24,25 en validacion).
- Subtitulado asistido de videos: generar subtitulos en birmano para plataformas de contenido, con revision humana obligatoria dado el WER en voces no vistas.
- Prototipado rapido en entornos con poco presupuesto: 315 millones de parametros permiten ejecutar inferencia en una GPU de consumo o incluso en CPU en modo batch, sin necesidad de infraestructura dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card y en el model-index (no verificados por terceros, `verified: false`):

| Evaluacion | WER (%) | CER (%) | chrF | SER (%) | DER (%) | IER (%) |
|---|---|---|---|---|---|---|
| Validacion (paso 2000) | 24,25 | 3,53 | 94,97 | 69,13 | 3,77 | 3,07 |
| Test con hablantes no vistos | 33,24 | 6,58 | 87,69 | 91,35 | 5,87 | 2,57 |

Evolucion durante el entrenamiento (conjunto de validacion):

| Paso | Train loss | Val loss | WER (%) | CER (%) | chrF |
|---|---|---|---|---|---|
| 0 (base sin ajustar) | - | - | 100,00 | 113,39 | 0,55 |
| 250 | 13,0478 | 1,1601 | 72,71 | 17,40 | 66,26 |
| 500 | 3,2769 | 0,4160 | 39,69 | 7,33 | 87,39 |
| 750 | 1,6812 | 0,3104 | 33,10 | 5,68 | 91,12 |
| 1000 | 1,1205 | 0,2926 | 29,82 | 4,68 | 92,75 |
| 1250 | 0,7550 | 0,2558 | 27,96 | 4,08 | 93,58 |
| 1500 | 0,3550 | 0,2688 | 25,96 | 3,81 | 94,43 |
| 1750 | 0,1300 | 0,3087 | 25,18 | 3,67 | 94,70 |
| 2000 | 0,0465 | 0,3125 | 24,25 | 3,53 | 94,97 |

Nota: la val loss deja de mejorar a partir del paso 1250 aproximadamente (0,2558 en el paso 1250 frente a 0,3125 en el paso 2000) mientras el train loss sigue descendiendo hasta 0,0465, lo que sugiere sobreajuste en la fase final del entrenamiento.

No hay resultados comparativos contra otros modelos ASR de birmano en la informacion proporcionada.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del numero de parametros, no datos publicados por el autor.

- Pesos en FP32: aproximadamente 1,26 GB. En FP16/BF16: aproximadamente 0,63 GB. En INT8 (cuantizacion dinamica de PyTorch): aproximadamente 0,32 GB.
- VRAM total necesaria en inferencia: por debajo de 2 GB en FP16 incluyendo activaciones y buffers, incluso con lotes moderados. Cabe holgadamente en cualquier GPU de consumo actual.
- GPU recomendadas: no requiere GPU de centro de datos. Una RTX 3060 (12 GB), RTX 4060, RTX 3090, RTX 4090, A10, L4 o T4 son mas que suficientes; incluso GPUs con 4 GB de VRAM pueden ejecutarlo en FP16.
- Ejecucion en CPU: viable, especialmente en modo batch y con audio corto, aunque con mayor latencia.
- Opciones de despliegue: la model card solo documenta el uso mediante `transformers.pipeline('automatic-speech-recognition')`. No se confirma en la informacion disponible soporte en vLLM, TGI, llama.cpp, Ollama ni otros servidores de inferencia para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependen de la duracion del audio, del tamano de lote y del hardware; no se han publicado mediciones.
- No se publican versiones cuantizadas en GGUF ni ONNX en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| thantzinphyo/Wav2Vec2-XLS-R-300M-ASR | 315.505.346 | Birmano (`my`) | Apache 2.0 | safetensors | Publico en HuggingFace; 0 descargas y 0 likes en el momento de la consulta |
| facebook/wav2vec2-xls-r-300m (modelo base) | 300M (segun nomenclatura del checkpoint) | Preentrenado en 128 idiomas; sin cabezal ASR especifico | Apache 2.0 | safetensors | Ampliamente utilizado y documentado; disponibilidad alta |
| facebook/wav2vec2-large-xlsr-53 | No verificado en la informacion disponible | 53 idiomas; no incluye necesariamente el birmano | Apache 2.0 | No verificado en la informacion disponible | Modelo de referencia previo al XLS-R |

No se han encontrado en la busqueda web otros modelos ASR especificos de birmano con los que comparar parametros, contexto o rendimiento. Los datos cuantitativos de los modelos comparativos no se han verificado en esta busqueda.

## Limitaciones y advertencias

- Dominio de entrenamiento sintetico: las 22 horas de audio provienen de 13 voces sinteticas birmanas. El modelo no ha visto voz humana real, ruido de fondo, reverberacion, microfonos diversos ni variacion de canal, lo que limita seriamente su uso directo en produccion.
- Brecha de generalizacion medida: el WER pasa de 24,25 % en validacion a 33,24 % con hablantes no vistos, y el SER sube de 69,13 % a 91,35 %. Es esperable que con voces humanas reales el rendimiento sea peor todavia.
- Sobreajuste probable: la val loss empeora en los ultimos 750 pasos de entrenamiento mientras el train loss cae hasta 0,0465.
- Sin aumentacion de datos: la configuracion de entrenamiento documenta `Augmentation: None`, lo que reduce la robustez frente a condiciones acusticas reales.
- Corpus pequeno y poco diverso: 20.699 enunciados de entrenamiento y 11 hablantes es un volumen reducido; no cubre dialectos, registros formales, ni vocabulario especializado.
- Salida sin puntuacion ni digitos: el preprocesado elimina la puntuacion del texto de entrenamiento, por lo que la transcripcion resultante no incluye signos ni formato, y los numeros se representaran de forma no controlada.
- Vocabulario de 64 tokens a nivel de caracter: la cobertura lexica fuera de ese conjunto puede degradar la transcripcion.
- Riesgo de alucinacion acustica: como todo modelo CTC, puede producir repeticiones, omisiones e inserciones. El IER declarado es del 2,57 % en test, lo que indica que el modelo tiende a insertar caracteres.
- Monolingue: solo birmano. No admite otros idiomas ni traduccion.
- Requisito de entrada: audio mono a 16 kHz. Cualquier otra frecuencia debe remuestrearse previamente.
- Metricas no verificadas: el model-index marca todos los resultados como `verified: false`. No hay evaluacion independiente ni comparacion con otros modelos ASR de birmano.
- Adopcion nula: el modelo registra 0 descargas y 0 likes, sin comunidad que lo valide ni issues reportados.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique los cambios. No hay garantias de ningun tipo por parte del autor. El modelo base tambien es Apache 2.0.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thantzinphyo/Wav2Vec2-XLS-R-300M-ASR
- Modelo base en HuggingFace: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Modelos adaptados sobre el base: https://huggingface.co/models?other=base_model:adapter:facebook/wav2vec2-xls-r-300m
- Guia de fine-tuning de XLS-R para ASR (blog de HuggingFace): https://github.com/huggingface/blog/blob/main/fine-tune-xlsr-wav2vec2.md
- Documentacion de XLS-R en fairseq: https://github.com/facebookresearch/fairseq/blob/main/examples/wav2vec/xlsr/README.md
- Ficha de referencia del modelo base en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/wav2vec2-xls-r-300m-facebook
- Modelo alternativo mencionado en la comparativa (facebook/wav2vec2-large-xlsr-53): https://huggingface.co/facebook/wav2vec2-large-xlsr-53
