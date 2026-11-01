# wq2012/univ_full_ecapa_c1024_arcface

## Resumen

`univ_full_ecapa_c1024_arcface` es un modelo de verificacion e identificacion de hablante (speaker verification) publicado por el desarrollador `wq2012` dentro del proyecto FlaxSpeaker. No es un modelo generativo de lenguaje: es un extractor de embeddings de voz (pipeline `feature-extraction`) que convierte una locucion de audio en un vector de 256 dimensiones que representa la identidad del hablante. Su proposito es resolver tareas de biometria de voz: comprobar si dos fragmentos de audio pertenecen a la misma persona o identificar a un hablante dentro de un conjunto cerrado.

Tecnicamente se apoya en una red ECAPA-TDNN de tamano `large` (aproximadamente 14,9 millones de parametros de inferencia), con pooling temporal atencional (`asp`) y una funcion de perdida ArcFace, puntuando la verificacion mediante similitud coseno. El checkpoint es una reimplementacion desde cero en JAX/Flax, escrita a partir de los articulos publicados (GE2E, Dr-Vectors, ATP y PFAS), sin codigo ni datos propietarios de Google, y se distribuye con licencia Apache 2.0.

Su relevancia actual reside en que es un "flagship" universal entrenado sobre un corpus abierto multi-dominio muy amplio: 12.193 hablantes y 464.557 locuciones limpias procedentes de VoxCeleb1/2, CN-Celeb 1+2 y LibriSpeech 960h, con aumento de datos MUSAN/RIR y perturbacion de velocidad, y sin solapamiento de hablantes con los conjuntos de evaluacion oficiales. Incluye exportaciones TFLite FP32 e INT8 del codificador para despliegue en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (`large`) con pooling temporal atencional (`asp`) |
| Parametros totales | 14.945.920 (safetensors); 14.923.136 de inferencia (codificador + cabeza de scoring, sin pesos del clasificador de entrenamiento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; audio de entrada hasta 3000 frames (~30 s) en inferencia JAX con mascara completa; exportaciones TFLite con ventana fija de 180 frames (1,8 s) |
| Tipos de cuantizacion | FP32 (safetensors, msgpack, TFLite) e INT8 (TFLite) |
| Idiomas soportados | no disponible (el modelo no declara lista de idiomas; entrenado sobre corpus multilingues de hablantes) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, Flax msgpack (`flax_model.msgpack`), TFLite (FP32 e INT8) |
| Dimension del embedding | 256 |
| Frontend de audio | Mel log-natural de 80 dimensiones a 16 kHz, VAD a nivel de frame y CMVN (`flaxspeaker.AudioFrontend`, no es un `AutoFeatureExtractor` de Hugging Face) |
| Funcion de perdida | ArcFace |
| Scorer de verificacion | Similitud coseno |
| Libreria | `flaxspeaker >= 0.5.0` |

## Arquitectura y entrenamiento

El modelo emplea una red ECAPA-TDNN (Emphasized Channel Attention, Propagation and Aggregation Time Delay Neural Network) de configuracion `large`, una arquitectura convolucional 1D disenada especificamente para embeddings de hablante. La agregacion temporal se realiza mediante pooling atencional (`asp`), inspirado en el trabajo de Attentive Temporal Pooling (ATP) originalmente propuesto para identificacion de idioma. La cabeza de clasificacion usa ArcFace, que anade un margen angular a la perdida softmax para mejorar la discriminacion entre identidades, y la verificacion final se realiza por similitud coseno entre embeddings de 256 dimensiones. El frontend procesa audio a 16 kHz con 80 canales Mel en escala logaritmica natural, aplicando deteccion de actividad de voz (VAD) y normalizacion CMVN a nivel de frame.

El entrenamiento se realizo sobre el pool universal completo: VoxCeleb2-dev, VoxCeleb1-dev, CN-Celeb 1+2 y LibriSpeech 960h, totalizando 12.193 hablantes base y 464.557 locuciones limpias, expandidas mediante perturbacion de velocidad en tres vias y aumentacion con MUSAN y RIR. Se ejecutaron 4.500 pasos de gradiente con warmup de 150 pasos, batch de 64 y semilla 42, lo que equivale a aproximadamente 0,62 epocas. El entrenamiento uso recortes de longitud variable `U(90, 180)` frames con mascara de validez exacta. El autor documenta la reproducibilidad mediante huellas de perdida en el paso 0 (2,6606 con recortes variables, coincidente con el checkpoint archivado) y reporta una desviacion estandar entre semillas de 0,08-0,41 % absoluto en EER agrupado de 1 locucion, frente a un intervalo de confianza bootstrap del 95 % de aproximadamente 0,8 % en 8.000 ensayos.

## Capacidades

- Extraccion de embeddings de hablante de 256 dimensiones a partir de audio.
- Verificacion de hablante (1:1): compara dos locuciones y devuelve una puntuacion de similitud coseno.
- Identificacion de hablante (1:N) mediante comparacion contra una galeria de embeddings.
- Evaluacion multi-utterance: el autor reporta metricas para 1 y 3 locuciones por hablante.
- Robustez multi-dominio: entrenado sobre ingles (VoxCeleb, LibriSpeech) y chino mandarin (CN-Celeb), lo que aporta cierta generalizacion entre dominios e idiomas.
- Exportacion TFLite FP32 e INT8 del codificador para inferencia en dispositivos con recursos limitados.
- Integracion con JAX/Flax mediante la libreria `flaxspeaker` y API de linea de comandos.
- No soporta generacion de texto, tool calling, agentes, vision ni audio generativo: es exclusivamente un extractor de caracteristicas de voz.

## Casos de uso

- Verificacion biometrica de acceso: el modelo puede actuar como segundo factor en autenticacion por voz comparando una locucion de enrolamiento con la del usuario en el momento del acceso, usando el scorer coseno y umbrales calibrados sobre EER.
- Diarizacion de reuniones: combinado con un sistema de segmentacion, permite agrupar intervenciones por hablante en grabaciones de hasta 30 s por segmento gracias a la inferencia JAX con mascara completa.
- Control de calidad en centros de llamadas: verificacion de que el agente que atiende es quien dice ser, o deteccion de suplantacion comparando embeddings entre turnos.
- Autenticacion en dispositivos embebidos: las exportaciones TFLite INT8 con ventana fija de 180 frames (1,8 s) permiten ejecutar la extraccion de embeddings en moviles o microcontroladores con perdida minima de fidelidad (coseno medio FP32-INT8 de 0,999989).
- Investigacion en biometria de voz: el checkpoint sirve como linea base reproducible en JAX/Flax para experimentar con perdidas ArcFace, pooling atencional y aumentacion de datos, con metricas de referencia publicadas en `eval_results.json`.
- Indexacion y busqueda de archivos de audio: generar embeddings de una base de podcasts o archivos historicos y realizar busqueda por similitud de hablante para localizar todas las apariciones de una persona.
- Moderacion y verificacion de identidad en plataformas UGC: comprobar si varias cuentas comparten la misma voz subyacente mediante comparacion contra una galeria de embeddings.

## Benchmarks y rendimiento

Los datos de la model card proporcionada se interrumpen en la tabla de benchmarks oficiales de verificacion zero-shot, por lo que solo se dispone de las cifras parciales explicitamente citadas en el texto:

| Metrica | Valor |
|---|---|
| EER 1-utt en VoxCeleb1-O (37.611 ensayos, JAX con mascara completa) | 15,05 % |
| EER 1-utt en VoxCeleb1-O con recorte central de 180 frames (TFLite FP32) | 18,25 % |
| EER 1-utt en VoxCeleb1-O con recorte central de 180 frames (TFLite INT8) | 18,29 % |
| Fidelidad coseno media FP32 vs INT8 (entradas de 180 frames) | 0,999989 |
| Perdida en paso 0 (huella, recortes variables) | 2,6606 |
| Desviacion estandar entre semillas (EER agrupado 1-utt) | 0,08-0,41 % absoluto |
| Semiancho del IC bootstrap al 95 % (8.000 ensayos) | ~0,8 % |

No se dispone en la informacion proporcionada de resultados completos de EER de 3 locuciones, minDCF ni ROC-AUC por conjunto de evaluacion, ni de comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el codificador de 14,9 millones de parametros con ventana de 180 frames; el repo completo ocupa 0,9 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 o H100. Para lotes grandes de extraccion de embeddings conviene una GPU con al menos 8 GB para paralelizar.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer con soporte JAX/CUDA, e incluso en CPU para volumenes moderados.
- Opciones de despliegue: JAX/Flax mediante `flaxspeaker >= 0.5.0` (API Python y `scripts/inference.py`), TFLite Runtime para FP32 e INT8 en dispositivos embebidos. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada. La ventana TFLite fija de 1,8 s sugiere inferencia en tiempo real en dispositivos moviles, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de benchmarks comparativos frente a otros modelos de speaker verification (por ejemplo, ECAPA-TDNN de SpeechBrain, WeSpeaker o modelos de VoxCeleb). La comparativa cuantitativa queda como no disponible.

| Modelo | Parametros | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|
| `wq2012/univ_full_ecapa_c1024_arcface` | 14,9 M | hasta 30 s (JAX); 1,8 s (TFLite) | Apache 2.0 | Hugging Face + PyPI |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo no declara una lista de idiomas soportados; su cobertura linguistica deriva de los corpus de entrenamiento (principalmente ingles y chino mandarin), por lo que el rendimiento en otras lenguas no esta garantizado.
- Las metricas publicadas son limitadas en la informacion disponible: la tabla de benchmarks oficiales aparece truncada y solo se citan cifras de VoxCeleb1-O, sin desglose completo por conjunto.
- El EER de 15,05 % en VoxCeleb1-O con inferencia completa es notablemente superior al de sistemas de speaker verification del estado del arte, lo que sugiere que este checkpoint debe tratarse con cautela en aplicaciones de seguridad de alta exigencia.
- Las exportaciones TFLite usan una ventana fija y sin mascara de 180 frames (1,8 s); locuciones mas largas se recortan al centro, lo que degrada el EER (18,25 % frente a 15,05 %).
- El frontend de audio no es un `AutoFeatureExtractor` de Hugging Face, sino un componente propio de `flaxspeaker`; integrarlo en pipelines existentes requiere usar la libreria del autor.
- Riesgo de sesgo: el corpus combina celebridades (VoxCeleb), hablantes chinos (CN-Celeb) y lectores de audiolibros (LibriSpeech), lo que puede introducir sesgos de dominio, edad, genero y acento no cuantificados en la informacion disponible.
- Riesgo de alucinacion en el sentido biometrico: el modelo puede producir puntuaciones de similitud altas entre hablantes distintos con voces similares; los umbrales deben calibrarse por dominio.
- Aunque la licencia es Apache 2.0, el uso biometrico esta sujeto a regulacion (RGPD, AI Act) en la UE; el despliegue en produccion requiere base legal y evaluacion de impacto.
- El autor advierte explicitamente de que no es un producto oficialmente soportado por Google.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/univ_full_ecapa_c1024_arcface
- Coleccion FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
