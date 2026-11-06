# yoga-0125/whisper-small-dv

## Resumen

Whisper Small Spanish es un ajuste fino (fine-tuning) del modelo openai/whisper-small, publicado por el usuario yoga-0125 en Hugging Face. Se trata de un modelo de reconocimiento automatico del habla (ASR) especializado en castellano, obtenido mediante entrenamiento supervisado sobre el dataset facebook/multilingual_librispeech, segun los metadatos de la model card (aunque la propia card menciona "Common Voice" en el texto, los tags y la configuracion apuntan a multilingual_librispeech). El modelo hereda la arquitectura encoder-decoder transformer de Whisper Small, con 241.734.912 parametros totales.

El modelo resuelve la tarea de transcripcion de audio a texto en espanol. Su relevancia es limitada en terminos de impacto: se trata de un ajuste fino ligero (100 pasos de entrenamiento, learning rate 1e-5) con cero descargas y cero likes en el momento de la consulta, lo que sugiere un experimento personal mas que un artefacto de produccion consolidado. No obstante, el WER declarado de 7,44 sobre el conjunto de evaluacion es un dato concreto que permite situarlo frente a alternativas.

La ficha se basa exclusivamente en los metadatos y la model card disponibles. No hay informacion sobre composicion del dataset, proceso de seleccion de datos ni evaluacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper Small procesa audio en ventanas de 30 s; el dato no se declara en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, no declarada por el autor) |
| Idiomas soportados | es (espanol) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de openai/whisper-small, un transformer encoder-decoder disenado para ASR. Whisper Small consta de 12 capas de encoder y 12 de decoder con atencion multi-cabeza estandar, y procesa audio muestreado a 16 kHz mediante espectrogramas log-Mel. El ajuste fino se realizo con el Trainer de Hugging Face (generated_from_trainer), con los siguientes hiperparametros declarados: learning rate 1e-05, batch de entrenamiento y evaluacion de 32, semilla 42, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler constant_with_warmup con 50 pasos de calentamiento, 100 pasos totales de entrenamiento y precision mixta nativa (AMP). El entrenamiento se ejecuto con Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

No se especifica el numero de tokens de audio ni la composicion exacta del dataset de entrenamiento. La model card indica facebook/multilingual_librispeech en los tags y "Common Voice" en el cuerpo del texto, lo que constituye una inconsistencia no resuelta por el autor. No se declara uso de RLHF, DPO ni tecnicas de alineacion; es un ajuste fino supervisado puro con loss de entropia cruzada sobre transcripciones. No hay innovaciones tecnicas destacables: se trata de un fine-tuning convencional de corta duracion.

## Capacidades

- Reconocimiento automatico del habla en espanol: transcripcion de audio a texto.
- Generacion de transcripciones con puntuacion y mayusculas segun el formato aprendido del corpus de entrenamiento.
- Procesamiento de audio en ventanas de 30 segundos (heredado de la arquitectura Whisper).
- Soporte de timestamps a nivel de segmento (capacidad nativa de Whisper, no verificada en este ajuste).
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingue mas alla del espanol.
- No se declaran modos especiales (thinking, vision, audio adicional).

## Casos de uso

- Transcripcion de reuniones y notas de voz en espanol: el modelo convierte audio de hasta 30 segundos por ventana en texto; para reuniones largas se requiere segmentacion previa y concatenacion de resultados. Adecuado por su especializacion en castellano y su tamano reducido.
- Subtitulado de contenido audiovisual: integrable en pipelines de postproduccion para generar subtitulos en espanol a partir de la pista de audio, con revision humana posterior dado el WER de ~7,4.
- Prototipado rapido de asistentes de voz: al ser un modelo de 241 M de parametros, puede desplegarse en entornos con recursos limitados para validar flujos de voz a texto antes de escalar a modelos mayores.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de grabaciones para construir indices de texto buscables; el coste computacional por hora de audio es bajo comparado con modelos grandes.
- Accesibilidad: generacion de transcripciones para personas con discapacidad auditiva en contenidos en espanol, con la salvedad de requerir correccion por el WER declarado.
- Analisis de llamadas de atencion al cliente: transcripcion de grabaciones para extraer metricas y temas; el modelo puede ejecutarse en infraestructura modesta y la licencia Apache 2.0 permite uso comercial.
- Investigacion en ASR en espanol: punto de partida para experimentos de fine-tuning adicional o comparativas de WER, dado su bajo coste de inferencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| Whisper Small Spanish (yoga-0125) | facebook/multilingual_librispeech (etiquetado como "Common Voice" en la card) | WER | 7,4418 |
| Whisper Small Spanish (yoga-0125) | mismo conjunto de evaluacion | WER Ortho | 7,4701 |
| Whisper Small Spanish (yoga-0125) | mismo conjunto de evaluacion | Validation loss | 0,2333 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos ni sobre benchmarks estandar (MLU, FLEURS, Common Voice oficial). El unico dato es el WER de 7,44 declarado por el autor sobre su propio conjunto de evaluacion, sin verificacion externa.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB para los pesos (241 M de parametros x 4 bytes), mas overhead de activaciones y buffers de audio; en la practica, 1,5-2 GB.
- VRAM estimada en fp16/bf16: aproximadamente 0,5 GB de pesos; 1-1,5 GB con overhead.
- VRAM estimada en int8: aproximadamente 0,25 GB de pesos; menos de 1 GB con overhead.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); tambien cabe en GPUs de gama baja (GTX 1650, 4 GB) y en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), vLLM no aplica directamente a ASR, llama.cpp no soporta Whisper de forma nativa, faster-whisper (compatible con pesos convertidos), Whisper.cpp (requiere conversion), TGI no soporta Whisper de forma estandar.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Por el tamano del modelo, se espera inferencia en tiempo real o mas rapida en GPU consumer, pero es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (es) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yoga-0125/whisper-small-dv | 241,7 M | ventanas de 30 s | 7,44 (declarado, no verificado) | Apache 2.0 | Hugging Face |
| openai/whisper-small | 241,7 M | ventanas de 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-large-v3 | 1.550 M | ventanas de 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-medium | 769 M | ventanas de 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |

No se dispone de datos de WER en espanol para los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no es posible. La comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo con cero descargas y cero likes: no hay evidencia de uso en produccion ni validacion por la comunidad.
- WER de 7,44 declarado por el autor sobre su propio conjunto de evaluacion, sin verificacion independiente ni detalle del conjunto de test.
- Inconsistencia en la model card: los tags indican facebook/multilingual_librispeech pero el texto menciona Common Voice; no queda claro el corpus real de entrenamiento.
- Entrenamiento muy corto (100 pasos, 1,3 epocas): riesgo de infraajuste o sobreajuste al subconjunto de datos utilizado.
- La model card esta generada automaticamente y contiene secciones "More information needed": no hay documentacion sobre datos de entrenamiento, sesgos ni limitaciones declaradas por el autor.
- Especializado unicamente en espanol: no se espera buen rendimiento en otros idiomas ni en cambio de codigo (code-switching).
- Riesgo de alucinacion en audio con ruido, silencios largos o habla no espanola, comportamiento conocido de la familia Whisper.
- Sin datos sobre sesgos demograficos, acentos o variedades dialectales del espanol.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de openai/whisper-small conviene revisar los terminos del modelo base (tambien Apache 2.0).
- No apto para produccion sin evaluacion propia: el autor no declara validacion en dominios distintos al de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yoga-0125/whisper-small-dv
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset declarado: https://huggingface.co/datasets/facebook/multilingual_librispeech
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
