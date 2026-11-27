# wq2012/univ_full_ecapa_c1024_arcface

## Resumen

`univ_full_ecapa_c1024_arcface` es un modelo de verificación e identificación de hablante (speaker verification/recognition) desarrollado por el autor `wq2012` dentro del proyecto FlaxSpeaker. No genera texto ni razona: es un extractor de embeddings de voz de 256 dimensiones que, dada una muestra de audio, produce una representación vectorial que permite comparar dos voces mediante similitud coseno y decidir si pertenecen al mismo hablante. Se implementa desde cero en JAX/Flax a partir de papers publicados (GE2E, Dr-Vectors, ATP, PFAS), sin código ni datos propietarios.

Arquitectónicamente es una red ECAPA-TDNN de variante `large` con pooling temporal atencional (`asp`) y entrenamiento con pérdida ArcFace, sobre un frontend de 80 bandas Mel logarítmicas naturales a 16 kHz con VAD y CMVN. El checkpoint es la versión "flagship universal" del proyecto: se entrena sobre un pool multi-corpus (VoxCeleb1/2, CN-Celeb 1+2 y LibriSpeech 960h) con 12.193 hablantes y 464.557 enunciados limpios, ampliados con perturbación de velocidad y ruido MUSAN/RIR.

Su relevancia actual radica en que ofrece un modelo de speaker embeddings completamente abierto (Apache 2.0), reproducible, con exportaciones TFLite FP32/INT8 y métricas de evaluación publicadas con intervalos de confianza bootstrap, algo poco habitual en el ecosistema de verificación de hablante. Con ~14,9 M de parámetros es ligero y desplegable en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (`large`) con pooling temporal atencional (`asp`) |
| Parametros totales | 14.886.272 (safetensors); 14.856.832 en encoder + cabeza de scoring (excluye clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | audio de hasta 3000 frames (~30 s) en inferencia JAX con máscara; TFLite fijo a 180 frames (1,8 s) |
| Tipos de cuantizacion | FP32, INT8 (exportaciones TFLite del encoder) |
| Idiomas soportados | no disponible (modelo agnóstico al idioma; entrenado con corpus en inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, Flax msgpack, TFLite (FP32 e INT8) |

## Arquitectura y entrenamiento

El backbone es una ECAPA-TDNN en variante `large` con pooling temporal atencional (`asp`) y una dimensión de embedding de salida de 256. El frontend de audio no es un `AutoFeatureExtractor` de Hugging Face, sino el `flaxspeaker.AudioFrontend`: 80 bandas Mel en escala logarítmica natural a 16 kHz, VAD a nivel de frame y normalización CMVN. La función de pérdida de entrenamiento es ArcFace, y la verificación en inferencia se realiza por similitud coseno entre embeddings. El repositorio incluye además pesos de cabezas GE2E (`w,b`), Dr-Vector y PFAS.

El entrenamiento se realizó durante 81.000 pasos de gradiente con batch de 512 utterances (unas 85,97 épocas), semilla 42 y warmup de 2.500 pasos, sobre 12.193 hablantes y 464.557 enunciados limpios de VoxCeleb2-dev, VoxCeleb1-dev, CN-Celeb 1+2 y LibriSpeech 960h, con solapamiento cero de hablantes respecto a los conjuntos de evaluación. Se aplicó augmentación con perturbación de velocidad de tres vías y ruido MUSAN/RIR. Los crops de entrenamiento son de longitud variable `U(140, 200)` frames con máscara de validez exacta; el autor documenta la verificación del fingerprint de pérdida en el paso 0 (12,4876 archivado frente a 12,4881 con crops variables). La desviación estándar entre semillas del EER agrupado a 1 utterance es de 0,08–0,41 % absoluto, y el intervalo bootstrap al 95 % con 8.000 ensayos tiene una semianchura de ~0,8 %.

## Capacidades

- Extracción de embeddings de hablante de 256 dimensiones a partir de audio.
- Verificación de hablante (1:1) mediante similitud coseno entre dos utterances.
- Identificación de hablante (1:N) por comparación contra una galería de embeddings.
- Evaluación multi-utterance (métricas reportadas para 1-utt y 3-utt).
- Procesamiento de audio de hasta ~30 s en inferencia JAX con máscara de validez.
- Exportación TFLite FP32 e INT8 del encoder para despliegue en dispositivos con ventana fija de 1,8 s.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades de visión ni audio generativo; es exclusivamente un extractor de características de voz.
- Multilingüismo: no se documenta explicitamente; el entrenamiento cubre corpus en inglés (VoxCeleb, LibriSpeech) y chino (CN-Celeb).

## Casos de uso

- Verificación biométrica de acceso: comparar el embedding de una utterance de prueba con el de enrolamiento del usuario y aceptar o rechazar según un umbral de similitud coseno; el modelo está entrenado con ArcFace, lo que produce embeddings bien separados para esta tarea.
- Autenticación por voz en aplicaciones móviles o de escritorio: la exportación TFLite INT8 del encoder (ventana fija de 1,8 s, salida `[1, 256]`) permite ejecutar la extracción en el propio dispositivo sin enviar audio a un servidor.
- Diarización de reuniones y transcripciones: extraer embeddings por segmento y agrupar por similitud coseno para atribuir intervenciones a hablantes; el soporte de audio de hasta 30 s y el VAD integrado facilitan el preprocesado.
- Indexación y búsqueda de archivos de audio: construir una galería de embeddings de 256 dimensiones y realizar búsqueda por similitud para localizar todas las apariciones de una persona en un archivo histórico.
- Detección de suplantación en call centers: comparar la voz del interlocutor con el embedding enrolado del cliente para flagrar posibles fraudes; el modelo cubre dominios diversos (VoxCeleb, CN-Celeb, LibriSpeech) lo que ayuda con variabilidad de canal y acento.
- Control de calidad de datasets de voz: verificar que las muestras etiquetadas con un mismo hablante son consistentes y detectar errores de etiquetado mediante umbrales de similitud.
- Investigación en biometría de voz: servir como baseline reproducible y abierto (Apache 2.0, JAX/Flax, pesos safetensors y msgpack) para comparar nuevas pérdidas o arquitecturas bajo el mismo pipeline de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible de forma completa en la model card; los datos parciales que sí aparecen son:

| Metrica | Valor |
|---|---|
| EER 1-utt VoxCeleb1-O (JAX, secuencia completa con máscara) | 2,54 % |
| EER 1-utt VoxCeleb1-O (TFLite FP32, crop central de 180 frames) | 5,84 % |
| EER 1-utt VoxCeleb1-O (TFLite INT8, crop central de 180 frames) | 5,83 % |
| Fidelidad coseno media FP32 vs INT8 (entradas de 180 frames) | 0,999187 |
| Desviación estándar entre semillas (EER agrupado 1-utt) | 0,08–0,41 % absoluto |
| Semianchura IC bootstrap 95 % (8.000 ensayos) | ~0,8 % |

El resto de métricas (3-utt EER, minDCF, ROC-AUC, subconjunto de 10 hablantes de VoxCeleb1-O) se remiten a `eval_results.json` en el repositorio; no se reproducen sus valores numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el encoder de ~14,9 M de parámetros; en la práctica cabe en cualquier GPU consumer.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 2 GB de memoria es suficiente (RTX 3060, RTX 4090, A100, H100). El modelo también se ejecuta en CPU.
- Cabe en GPU consumer: sí, con amplio margen; también en CPU y en dispositivos móviles vía TFLite INT8.
- Opciones de despliegue: `flaxspeaker` (Python API y CLI `scripts/inference.py`), exportaciones TFLite FP32/INT8 mediante `jax2tf`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos numéricos de modelos alternativos comparables (por ejemplo, ECAPA-TDNN de SpeechBrain, WeSpeaker o Resemblyzer) que permitan una comparación rigurosa de parámetros, contexto y rendimiento. Se indica "no disponible".

## Limitaciones y advertencias

- No es un producto oficialmente soportado por Google; el autor lo declara explícitamente.
- El modelo está entrenado sobre corpus de investigación (VoxCeleb, CN-Celeb, LibriSpeech); el rendimiento en dominios muy distintos (telefonía de banda estrecha, audio con ruido severo, micrófonos de baja calidad) puede degradarse.
- Las exportaciones TFLite usan una ventana fija de 180 frames (1,8 s) sin máscara, lo que eleva el EER de 2,54 % a ~5,84 % en VoxCeleb1-O; para producción con audio largo conviene usar la inferencia JAX completa.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las licencias de los corpus de entrenamiento subyacentes (VoxCeleb, CN-Celeb, LibriSpeech) si redistribuye derivados.
- Riesgo de sesgo por desbalance de hablantes entre corpus y por la composición lingüística (inglés y chino principalmente); no se documentan evaluaciones de equidad por género, edad o acento.
- No se documentan métricas de robustez ante ataques de spoofing o replay; no debe usarse como único factor de autenticación en sistemas de alta seguridad sin contramedidas adicionales.
- El intervalo de confianza bootstrap al 95 % (~0,8 %) es mayor que la variabilidad entre semillas, por lo que diferencias pequeñas entre modelos deben interpretarse con cautela.
- La API requiere `flaxspeaker >= 0.8.0`; versiones anteriores no cargan el checkpoint correctamente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/wq2012/univ_full_ecapa_c1024_arcface)
- [Colección FlaxSpeaker en Hugging Face](https://huggingface.co/collections/wq2012/flaxspeaker)
- [Repositorio GitHub FlaxSpeaker](https://github.com/wq2012/FlaxSpeaker)
- [Paquete PyPI flaxspeaker](https://pypi.org/project/flaxspeaker/)
- [Paper GE2E (arXiv:1710.10467)](https://arxiv.org/abs/1710.10467)
- [Paper Dr-Vectors (arXiv:2104.01989)](https://arxiv.org/abs/2104.01989)
- [Paper ATP (arXiv:2202.12163)](https://arxiv.org/abs/2202.12163)
- [Paper PFAS (arXiv:2203.05642)](https://arxiv.org/abs/2203.05642)
