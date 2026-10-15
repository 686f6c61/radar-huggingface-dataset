# wq2012/univ_ecapa_tdnn_base_ge2e

## Resumen

`univ_ecapa_tdnn_base_ge2e` es un modelo de verificación e identificación de hablante (speaker verification) desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker, una reproducción open source en JAX/Flax de algoritmos de reconocimiento de hablante publicados por Google. El modelo emplea una arquitectura ECAPA-TDNN en su variante `base`, con pooling temporal atencional (ASP), una pérdida GE2E con softmax y puntuación por similitud coseno. Genera embeddings de hablante de 256 dimensiones a partir de audio a 16 kHz con un frontend de log-mel de 80 dimensiones, VAD por energía y normalización CMVN.

El checkpoint es muy compacto: 3.190.624 parámetros en el encoder, lo que lo sitúa en la categoría de modelos ligeros aptos para inferencia en CPU o en GPUs de consumo sin requisitos de memoria significativos. Se distribuye bajo licencia Apache 2.0 y está entrenado sobre un dominio "universal" que combina LibriSpeech (inglés leído), CN-Celeb2 (chino multigénero) y VoxCeleb (habla espontánea y en entornos reales).

Su relevancia actual reside en que ofrece una implementación limpia en JAX/Flax de recetas clásicas de speaker verification (GE2E, Dr-Vectors, atención temporal, scoring sin parámetros), algo poco habitual en un ecosistema dominado por implementaciones en PyTorch como SpeechBrain o NeMo. Los resultados publicados en la model card muestran un EER de 22,81% en el conjunto universal agrupado a una sola utterance y de 18,20% con tres utterances de enrolamiento, con intervalos de confianza bootstrap al 95%, lo que indica honestidad metodológica aunque un rendimiento por debajo de los sistemas punteros del estado del arte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (`base`) con pooling temporal atencional (`asp`) |
| Parametros totales | 3.190.624 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; procesa utterances completas con VAD) |
| Tipos de cuantizacion | no disponible (no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible; entrenado con datos en ingles (LibriSpeech, VoxCeleb) y chino (CN-Celeb2) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.safetensors` (SafeTensors) y `flax_model.msgpack` (Flax nativo) |
| Dimension del embedding de salida | 256 |
| Frontend de audio | log-mel de 80 dimensiones a 16000 Hz + VAD por energia + CMVN |
| Perdida de entrenamiento | `ge2e_softmax` |
| Puntuacion de verificacion | coseno |
| Dominio de entrenamiento | `universal` |
| Libreria | flaxspeaker (JAX/Flax) |
| Pipeline | audio-classification |

## Arquitectura y entrenamiento

La columna vertebral es una ECAPA-TDNN (`base`), una red convolucional temporal con bloques TDNN combinados con capas squeeze-and-excitation y bloques Res2Block, que capturan dependencias temporales multi-escala en el audio. Sobre las representaciones del encoder se aplica un pooling temporal atencional (`asp`, attentive statistics pooling), que agrega estadísticas de primer y segundo orden ponderadas por atención para producir el embedding de 256 dimensiones. El entrenamiento usa la pérdida GE2E con softmax, una variante de la pérdida Generalized End-to-End descrita en arXiv:1710.10467, y la verificación final se realiza con similitud coseno, coherente con el enfoque de scoring sin parámetros (PFAS) de arXiv:2203.05642.

El modelo se ha entrenado sobre un dominio etiquetado como "universal" que agrega tres corpus públicos: LibriSpeech (inglés leído), CN-Celeb2 (chino multigénero) y VoxCeleb (habla en entornos reales de celebridades). El autor declara explícitamente que se trata de una reproducción limpia ("clean-room") en JAX/Flax de algoritmos publicados por Google, y advierte que los experimentos de los papers originales se realizaron con infraestructura y datasets internos propietarios, no con esta librería ni con estos splits públicos. No se documentan en la información disponible detalles sobre número total de tokens de audio, composición exacta del dataset, ni si hubo etapas de refinamiento con RLHF o DPO (en un modelo de embeddings de hablante esto no aplicaría de forma estándar).

## Capacidades

- Extracción de embeddings de hablante de 256 dimensiones a partir de ficheros de audio a 16 kHz.
- Verificación de hablante (1:1): determina si dos utterances pertenecen al mismo hablante mediante similitud coseno.
- Identificación de hablante (1:N): por comparación de embeddings contra una galería de referencia, aunque no se documenta explícitamente en la model card.
- Verificación con múltiples utterances de enrolamiento: rendimiento evaluado con 1 y 3 utterances, con mejora clara al usar enrolamiento múltiple.
- Multidominio: funciona sobre habla leída en inglés, habla espontánea en entornos reales y habla multigénero en chino, aunque con rendimiento desigual.
- Puntuación por coseno integrada, sin parámetros adicionales de calibración.
- API de Python (`load_pretrained`, `extract_embedding`, `verify`) y script de inferencia por línea de comandos.
- Frontend de audio compatible con el extractor de características de Whisper (`WhitperFeatureExtractor`-compatible), lo que facilita la integración con pipelines existentes.
- No se documentan capacidades de generación de texto, razonamiento, código, visión, tool calling ni agentes, por tratarse de un modelo de audio especializado.

## Casos de uso

- Verificación biométrica de acceso por voz: el modelo genera un embedding de 256 dimensiones por utterance con el que se puede comparar la voz de un usuario contra su plantilla enrolada usando similitud coseno, adecuado para autenticación ligera en aplicaciones con recursos limitados.
- Control de acceso a sistemas telefónicos o de atención al cliente: integrado en un flujo de IVR, permite verificar la identidad del llamante antes de dar acceso a información sensible, con la ventaja de que el modelo cabe completo en memoria de cualquier servidor.
- Diarización de reuniones y transcripciones: los embeddings de hablante se pueden usar como paso de agrupamiento para segmentar y etiquetar quién habla en una grabación larga, combinándolo con un ASR externo.
- Detección de fraude y suplantación de identidad: comparar la voz de una llamada con la registrada para un cliente permite detectar intentos de suplantación en banca telefónica o seguros.
- Indexación y búsqueda por voz en archivos de audio: generar un embedding por segmento permite agrupar automáticamente locutores en podcasts, entrevistas o archivos periodísticos sin intervención manual.
- Personalización de asistentes y dispositivos: en altavoces inteligentes o asistentes en el hogar, el embedding permite asociar la orden al miembro de la familia que la pronuncia para adaptar respuestas o perfiles.
- Investigación en reconocimiento de hablante: al ser una reproducción limpia en JAX/Flax con configuración explícita (`config.json`), sirve como baseline reproducible para comparar arquitecturas, funciones de pérdida o técnicas de pooling en entornos académicos.
- Componente en pipelines de verificación de locutor multi-idioma: al haberse entrenado con datos en inglés, chino y habla en entornos reales, puede emplearse en sistemas que reciben audio de distintas procedencias, siempre que se asuma una degradación del EER en dominios no vistos.

## Benchmarks y rendimiento

Resultados de verificación con 1 utterance, publicados en la model card:

| Split de evaluacion | Trials | EER (%) | IC 95% bootstrap (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 18,63 | [17,28; 20,05] | 0,9747 | 0,8740 | 0,8984 |
| CN-Celeb2 (chino multigenero) | 3.000 | 25,97 | [24,33; 27,47] | 0,9933 | 0,9573 | 0,8229 |
| VoxCeleb1 (in-the-wild) | 2.000 | 22,20 | [20,27; 24,00] | 0,9600 | 0,9140 | 0,8578 |
| Universal pooled (3 dominios) | 8.000 | 22,81 | [21,91; 23,86] | 0,9955 | 0,9483 | 0,8557 |
| Universal macro-average | 8.000 | 22,27 | no disponible | 0,9760 | 0,9151 | 0,8597 |

Resultados de verificación con 3 utterances de enrolamiento:

| Split de evaluacion | Trials | EER 3-utt (%) | IC 95% bootstrap (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 12,20 | [9,90; 14,20] | 0,8740 | 0,9517 |
| CN-Celeb2 (3-utt) | 1.000 | 21,20 | [18,60; 23,60] | 0,9480 | 0,8708 |
| VoxCeleb1 (3-utt) | 1.000 | 17,30 | [15,45; 20,35] | 0,9800 | 0,8933 |
| Universal pooled (3-utt) | 3.000 | 18,20 | [16,96; 19,70] | 0,9627 | 0,9005 |
| Universal macro-average (3-utt) | 3.000 | 16,90 | no disponible | 0,9340 | 0,9053 |

No se han publicado en la información disponible comparaciones directas con otros modelos bajo el mismo protocolo de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de decenas de megabytes para los pesos en precisión nativa (3,19 M de parámetros en float32 suponen aproximadamente 12,8 MB); no se documentan requisitos oficiales.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluida una NVIDIA RTX 3060, RTX 4090, A100 o H100; el modelo es tan pequeño que la GPU no será el cuello de botella.
- Cabe holgadamente en GPU de consumo y también en CPU: la inferencia en CPU es totalmente viable para uso en producción con volúmenes moderados.
- Opciones de despliegue: la librería nativa `flaxspeaker` (JAX/Flax) con la función `load_pretrained`; también puede integrarse en pipelines propios que carguen `model.safetensors` o `flax_model.msgpack`. No se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos generativos).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño del modelo, se espera latencia dominada por el frontend de audio y no por el encoder.

## Comparativa con modelos similares

| Modelo | Backbone | Parametros | Embedding | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `wq2012/univ_ecapa_tdnn_base_ge2e` | ECAPA-TDNN base, JAX/Flax | 3.190.624 | 256 | Apache 2.0 | safetensors, msgpack | Entrenado en dominio universal (LibriSpeech + CN-Celeb2 + VoxCeleb) |
| `speechbrain/spkrec-ecapa-voxceleb` | ECAPA-TDNN, PyTorch | no disponible | no disponible | no disponible | PyTorch | Entrenado en VoxCeleb1+2 |
| `yangwang825/ecapa-tdnn-vox2` | ECAPA-TDNN, PyTorch | no disponible | no disponible | no disponible | no disponible | Entrenado en VoxCeleb2 |
| NVIDIA NeMo ECAPA-TDNN (`ecapa_tdnn`) | ECAPA-TDNN con SE y Res2Block, PyTorch | no disponible | no disponible | no disponible | NeMo | Entrenado con angular softmax para speaker verification y diarization |

No se dispone de cifras comparativas de EER bajo protocolos idénticos para estos modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- El EER en el conjunto universal agrupado es de 22,81% (1 utterance) y 18,20% (3 utterances), valores claramente alejados de los sistemas ECAPA-TDNN punteros entrenados exclusivamente sobre VoxCeleb, que suelen situarse muy por debajo del 1% en VoxCeleb1-O. El modelo está pensado como reproducción open source, no como sistema de máxima precisión.
- El rendimiento es desigual según el dominio: mejora en inglés leído (LibriSpeech, 18,63%) y empeora en chino multigénero (CN-Celeb2, 25,97%). Los resultados en dominios no vistos pueden degradarse de forma notable.
- No se documentan análisis de sesgo por género, edad, acento, etnia ni idioma. Es esperable que existan sesgos derivados de la composición de LibriSpeech, CN-Celeb2 y VoxCeleb.
- Riesgo de falsos positivos y falsos negativos inherente a cualquier sistema biométrico de voz: con EER en torno al 20%, el modelo no es adecuado como único factor de autenticación en escenarios de alto riesgo.
- Aviso explícito del autor: no es un producto oficialmente soportado por Google. La reproducción es independiente y los papers citados se basaron en infraestructura y datasets internos propietarios, no en esta librería.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las licencias de los datasets de entrenamiento (LibriSpeech, CN-Celeb2, VoxCeleb), que imponen sus propias restricciones sobre los datos y, en algunos casos, sobre los modelos derivados.
- No se documentan variantes cuantizadas (GGUF, INT8) ni optimizaciones para despliegue en dispositivos móviles o embebidos.
- Para verificación de hablante en producción debe aplicarse calibración de umbral específica del dominio: el umbral óptimo de similitud coseno variará entre LibriSpeech, CN-Celeb2 y VoxCeleb.
- El modelo no incorpora detección de reproducción (replay attack detection) ni de voces sintéticas, por lo que es vulnerable a ataques de spoofing si se usa como mecanismo de autenticación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wq2012/univ_ecapa_tdnn_base_ge2e
- Colección FlaxSpeaker en HuggingFace: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI flaxspeaker: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642v3
- Paper ECAPA-TDNN: https://arxiv.org/abs/2005.07143
- NVIDIA NGC ECAPA-TDNN: https://catalog.ngc.nvidia.com/orgs/nvidia/teams/nemo/models/ecapa_tdnn
- SpeechBrain spkrec-ecapa-voxceleb: https://huggingface.co/speechbrain/spkrec-ecapa-voxceleb
- yangwang825/ecapa-tdnn-vox2: https://huggingface.co/yangwang825/ecapa-tdnn-vox2
- Reimplementación no oficial ECAPA-TDNN: https://github.com/TaoRuijie/ECAPA-TDNN
