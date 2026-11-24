# wq2012/univ_full_eres2conformer_v2_diar

## Resumen

`univ_full_eres2conformer_v2_diar` es un modelo de extracción de embeddings de locutor (speaker verification y diarización) desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker. Se trata de una reimplementación desde cero en JAX/Flax, basada exclusivamente en artículos publicados, de los algoritmos de reconocimiento de locutor GE2E, Dr-Vectors, ATP y PFAS. El checkpoint emplea una arquitectura ERes2Conformer de tamaño "large" con pooling temporal atencional (CATP) y se entrena con el objetivo Sub-Center ArcFace (K=3, scale=32, margin=0.32), produciendo embeddings de 256 dimensiones comparables mediante similitud coseno.

El modelo es relevante porque es un "flagship" universal entrenado con datos abiertos de siete corpus (VoxCeleb1/2, CN-Celeb1/2, LibriSpeech 960h, Fisher, AMI, ICSI y CallHome), sumando 24.110 locutores y 2.481.542 enunciados limpios, con aumento de datos mediante MUSAN, RIR y perturbación de velocidad. Cubre tanto verificación de locutor en habla leída como diarización en conversaciones solapadas, un nicho donde la mayoría de checkpoints abiertos se limitan a VoxCeleb.

Con 36,4 millones de parámetros y un frontend de audio específico (Mel logarítmico natural de 80 dimensiones a 16 kHz con VAD y CMVN), no es un modelo de lenguaje: es un extractor de features de audio orientado a pipelines de biometría de voz y separación de hablantes. Su licencia Apache 2.0 y sus exportaciones a TFLite (FP32 e INT8) lo hacen desplegable en entornos edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ERes2Conformer (large) con pooling temporal atencional CATP |
| Parametros totales | 36.402.318 (safetensors); 36.324.302 en inferencia (encoder + cabeza de scoring, sin clasificador de entrenamiento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 3000 frames (30 s) en inferencia JAX con máscara; TFLite exportado con ventana fija de 180 frames (1,8 s) |
| Tipos de cuantizacion | FP32 y INT8 (exportaciones TFLite); pesos originales en safetensors y msgpack (precisión nativa, presumiblemente FP32/BF16, no detallada) |
| Idiomas soportados | no disponible (multilingüe por corpus: inglés, chino y conversacional; no se declara lista oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, Flax msgpack, TFLite (FP32 e INT8) |

## Arquitectura y entrenamiento

El backbone es un ERes2Conformer "large", una variante de Conformer con módulos de convolución y atención, seguido de un pooling temporal atencional (CATP, adaptado de un artículo de identificación de idioma) que agrega la secuencia de frames en un único vector de 256 dimensiones. La función de pérdida es Sub-Center ArcFace con K=3 subcentros, escala 32 y margen 0,32. La verificación se realiza por similitud coseno entre embeddings. El frontend de audio no es un `AutoFeatureExtractor` de Hugging Face, sino un componente propio de `flaxspeaker` que calcula Mel logarítmico natural de 80 dimensiones a 16 kHz, aplica VAD a nivel de frame y normalización CMVN.

El entrenamiento se realizó durante 78.000 pasos de gradiente con batch de 512 enunciados (unas 15,06 épocas), semilla 42, sobre 24.110 locutores y 2.481.542 enunciados limpios procedentes de VoxCeleb2-dev, VoxCeleb1-dev, CN-Celeb 1+2, LibriSpeech 960h, Fisher, AMI, ICSI y CallHome (turnos conversacionales con solapamiento restado), sin solapamiento de locutores con los conjuntos de evaluación. Se aplicó aumento con MUSAN, RIR y perturbación de velocidad en tres vías. El entrenamiento usó recortes variables de U(80, 220) frames con máscara de validez exacta; la model card documenta la verificación del fingerprint de pérdida en el paso 0 (14,2432 con recortes variables frente a 14,246 archivado). No se menciona RLHF ni DPO, ya que no es un modelo generativo.

## Capacidades

- Extracción de embeddings de locutor de 256 dimensiones para verificación (1-utt y 3-utt) y reconocimiento de hablante.
- Diarización de hablantes en conversaciones multi-locutor, incluyendo turnos solapados (entrenado con CallHome con solapamiento restado).
- Puntuación por similitud coseno y por PFAS (Parameter-Free Attentive Scoring).
- Funciona como extractor de features de audio (`feature-extraction`) para pipelines posteriores de clustering o comparación.
- Multilingüe de facto: inglés (VoxCeleb, LibriSpeech, Fisher, AMI, ICSI) y chino (CN-Celeb), aunque no se declara una lista oficial de idiomas.
- Exportación a TFLite FP32 e INT8 para inferencia en dispositivos con recursos limitados.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.

## Casos de uso

- Verificación biométrica de voz en autenticación: comparar el embedding de una locución de prueba con el enrollment del usuario mediante similitud coseno, con EER de referencia del 0,64 % en VoxCeleb1-O (inferencia completa con máscara) y 1,91 % en la versión TFLite FP32 de 180 frames.
- Diarización de reuniones y llamadas: segmentar y agrupar hablantes en audio de AMI, ICSI o CallHome, aprovechando el entrenamiento específico en turnos conversacionales con solapamiento.
- Indexación y búsqueda de archivos de audio por locutor: generar embeddings de 256 dimensiones para cada segmento y construir un índice vectorial que permita recuperar todas las intervenciones de una persona en un archivo histórico.
- Detección de fraude y suplantación de identidad telefónica: comparar la voz de una llamada entrante con el perfil de voz registrado del cliente para marcar discrepancias.
- Control de calidad de datasets de voz: agrupar y detectar duplicados o locutores repetidos entre particiones de entrenamiento y evaluación antes de publicar un corpus.
- Despliegue en edge con TFLite INT8: integrar el encoder cuantizado en aplicaciones móviles o embebidas para verificación de locutor offline con ventanas de 1,8 s y fidelidad coseno de 0,9995 frente a FP32.
- Análisis de contenido multimedia: etiquetar automáticamente quién habla en pódcasts, entrevistas o programas de radio para generar transcripciones atribuidas por hablante.

## Benchmarks y rendimiento

La model card reporta métricas de evaluación multi-dominio en `eval_results.json`, pero en la información disponible solo se detallan explícitamente las de VoxCeleb1-O:

| Metrica | Valor |
|---|---|
| EER 1-utt, VoxCeleb1-O, JAX con máscara (hasta 3000 frames) | 0,64 % |
| EER 1-utt, VoxCeleb1-O, TFLite FP32 (180 frames, center crop) | 1,91 % |
| EER 1-utt, VoxCeleb1-O, TFLite INT8 (180 frames, center crop) | 1,96 % |
| Similitud coseno media FP32 vs INT8 (TFLite) | 0,999495 |
| Desviación estándar entre semillas del EER agrupado 1-utt | 0,08–0,41 % absoluto |
| Semiancho del intervalo bootstrap del 95 % (8000 ensayos) | ~0,8 % |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, ya que el modelo no es generativo de texto. Tampoco se detallan los valores de EER, minDCF y ROC-AUC para CN-Celeb, AMI, ICSI o CallHome más allá de su presencia en `eval_results.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: con 36,4 M de parámetros, los pesos en FP32 ocupan aproximadamente 145 MB y en INT8 unos 36 MB; el consumo real depende del tamaño de la ventana de audio y del backend.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; A100, H100, RTX 4090 o RTX 3090 quedan sobredimensionadas para un solo flujo y se aprovecharían en batch.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (GTX 1060 en adelante) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: `flaxspeaker` (JAX/Flax) como vía nativa, TFLite Runtime para FP32/INT8 en edge, y exportación a otros runtimes a partir de safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. La ventana fija de 180 frames (1,8 s) en TFLite sugiere un diseño de baja latencia para edge, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_full_eres2conformer_v2_diar` (este) | 36,4 M | hasta 30 s (JAX); 1,8 s (TFLite) | ERes2Conformer + CATP + Sub-Center ArcFace, 7 corpus | Apache 2.0 | Hugging Face, PyPI (`flaxspeaker`), TFLite |
| ECAPA-TDNN (variantes abiertas tipo SpeechBrain) | ~20 M típico | variable | TDNN con atención, VoxCeleb | Apache 2.0 en la mayoría de implementaciones | Hugging Face, SpeechBrain |
| WavLM / XLS-R (fine-tuned para speaker) | 90 M – 300 M+ | variable | Transformers auto-supervisados con cabeza de speaker | MIT / Apache 2.0 según checkpoint | Hugging Face |
| ReDimNet / CAM++ (checkpoints abiertos) | ~5–30 M | variable | Redes 1D/2D específicas para speaker | variable | Hugging Face, repos de autor |

La comparación cuantitativa de EER entre estos modelos no está disponible en la información proporcionada; los valores de referencia de cada alternativa dependen del conjunto de evaluación y del protocolo.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa en ese sentido es un error de uso.
- El EER de referencia del 0,64 % corresponde a inferencia JAX completa con máscara; la exportación TFLite de 180 frames degrada el EER a 1,91 % (FP32) y 1,96 % (INT8), por lo que el despliegue edge pierde precisión.
- La ventana TFLite es fija y sin máscara: audios más cortos o más largos requieren recorte central, lo que puede descartar información útil en segmentos largos.
- Riesgo de sesgo por corpus: el entrenamiento se apoya en VoxCeleb (celebridades, mayoritariamente inglés), CN-Celeb (chino) y corpus conversacionales; el rendimiento en acentos, edades o condiciones acústicas poco representadas puede degradarse.
- No se declara una lista oficial de idiomas soportados, así que el comportamiento multilingüe debe validarse empíricamente antes de producción.
- El modelo no es un producto oficial de Google, pese a reimplementar artículos de esa casa; el soporte depende del autor individual del repositorio.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los corpus de entrenamiento (VoxCeleb, CN-Celeb, Fisher, CallHome) si se redistribuyen derivados.
- La model card advierte de que el checkpoint se entrenó con recortes variables y máscara exacta; usar recortes fijos puede alterar ligeramente las métricas.
- No se han publicado análisis de robustez frente a ruido adversario, reproducción de voz sintética (deepfakes) ni envejecimiento de la voz.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/univ_full_eres2conformer_v2_diar
- Colección FlaxSpeaker en Hugging Face: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- GE2E, Generalized End-to-End Loss for Speaker Verification: https://arxiv.org/abs/1710.10467
- Dr-Vectors, Decision Residual Networks and an Improved Loss for Speaker Recognition: https://arxiv.org/abs/2104.01989
- ATP, Attentive Temporal Pooling for Conformer-based Streaming Language Identification: https://arxiv.org/abs/2202.12163
- PFAS, Parameter-Free Attentive Scoring for Speaker Verification: https://arxiv.org/abs/2203.05642
