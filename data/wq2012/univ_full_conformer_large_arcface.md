# wq2012/univ_full_conformer_large_arcface

## Resumen

`univ_full_conformer_large_arcface` es un modelo de verificación e identificación de hablante (speaker verification) desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker. No es un modelo de lenguaje: es un extractor de embeddings de voz que transforma una locución en un vector de 256 dimensiones, de modo que dos fragmentos del mismo hablante quedan próximos en el espacio coseno. Está implementado en JAX/Flax como reimplementación desde cero, usando solo los papers publicados (GE2E, Dr-Vectors, ATP y PFAS), de los algoritmos de reconocimiento de hablante de Google.

La arquitectura combina un backbone Conformer de tamaño `large` con pooling temporal atencional (ATP) y un objetivo de entrenamiento ArcFace, con scoring final por similitud coseno. El modelo tiene 22.007.684 parámetros en inferencia (encoder más cabezas de scoring, excluyendo los pesos del clasificador de entrenamiento) y produce embeddings de 256 dimensiones. Se distribuye con pesos en SafeTensors, Msgpack nativo de Flax y exportaciones TFLite FP32/INT8 del encoder.

Su relevancia práctica radica en que es un modelo "flagship" universal entrenado sobre un pool multi-corpus grande (VoxCeleb1/2, CN-Celeb 1+2 y LibriSpeech 960h, con 12.193 hablantes y 464.557 locuciones limpias), con cero solapamiento de hablantes frente a los conjuntos de evaluación. La licencia Apache 2.0 y las exportaciones TFLite lo hacen desplegable tanto en servidor como en dispositivos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (`large`) con pooling temporal atencional (ATP) y cabecera ArcFace |
| Parametros totales | 22.007.684 (encoder + cabezas de scoring; excluye pesos del clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de hasta 3000 frames (30 s) en inferencia JAX con máscara; exportaciones TFLite con ventana fija de 180 frames (1,8 s) |
| Tipos de cuantizacion | FP32 (JAX/SafeTensors), exportaciones TFLite FP32 e INT8 del encoder |
| Idiomas soportados | no disponibles (modelo agnóstico al contenido lingüístico; entrenado con corpus en inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (`model.safetensors`), Flax Msgpack (`flax_model.msgpack`), TFLite (`model_fp32.tflite`, `model_int8.tflite`) |

## Arquitectura y entrenamiento

El modelo usa un backbone Conformer de configuración `large` sobre un frontend de audio de 80 dimensiones Mel en escala logarítmica natural a 16 kHz, con VAD a nivel de frame basado en energía y normalización CMVN. La salida del encoder se agrega temporalmente mediante ATP (Attentive Temporal Pooling), una cabeza de pooling tomada de un paper de identificación de idioma, y se proyecta a un embedding de 256 dimensiones. El entrenamiento emplea la pérdida ArcFace, y la verificación en inferencia se realiza por similitud coseno entre embeddings. El modelo incluye además cabezas GE2E (`w`, `b`), Dr-Vector y PFAS para scoring.

El entrenamiento se realizó sobre el pool universal completo: VoxCeleb2-dev, VoxCeleb1-dev, CN-Celeb 1+2 y LibriSpeech 960h, con 12.193 hablantes base y 464.557 locuciones limpias, expandidas mediante perturbación de velocidad a tres vías y aumentación con MUSAN/RIR. Se ejecutaron 81.000 pasos de gradiente con batch de 512 locuciones (unas 85,97 épocas), warmup de 3.000 pasos y semilla 42. Los crops de entrenamiento fueron de longitud variable `U(140, 200)` frames con máscara de validez exacta; la model card documenta la verificación de procedencia mediante huellas de pérdida en el paso 0 (12,5414 archivado frente a 12,5421 con crops variables, coincidencia `variable_approx`). No se menciona RLHF ni DPO, algo esperable en un modelo de embeddings de voz.

## Capacidades

- Extracción de embeddings de hablante de 256 dimensiones a partir de audio a 16 kHz.
- Verificación de hablante (1:1) mediante similitud coseno entre dos locuciones.
- Identificación de hablante (1:N) por comparación contra una galería de embeddings.
- Scoring con múltiples cabeceras: GE2E, Dr-Vector y PFAS.
- Evaluación con 1 locución y con 3 locuciones (1-utt y 3-utt EER).
- Procesamiento de audio de hasta 30 s en inferencia JAX completa con máscara.
- Exportación TFLite FP32 e INT8 del encoder para despliegue en dispositivos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: no es un modelo generativo.
- No dispone de capacidades de visión, audio generativo ni modo "thinking".

## Casos de uso

- Verificación biométrica de acceso: el modelo extrae el embedding de una locución de enrolamiento y lo compara por coseno con la locución de prueba, devolviendo una puntuación de similitud; es adecuado por su EER de 2,66 % en VoxCeleb1-O con inferencia JAX completa.
- Identificación de hablante en grabaciones largas: con ventanas de hasta 30 s y VAD por energía, permite segmentar y atribuir turnos de palabra en reuniones o entrevistas.
- Autenticación de voz en atención telefónica: el modelo puede integrarse en un pipeline de verificación 1:1 antes de dar acceso a operaciones sensibles, con la ventaja de su licencia Apache 2.0 para uso comercial.
- Deduplicación y agrupación de hablantes en archivos de audio: generar embeddings para cada segmento y agrupar por similitud coseno en tareas de diarización o limpieza de corpus.
- Despliegue en dispositivo: las exportaciones TFLite INT8 con ventana fija de 180 frames (EER de 6,01 % frente a 5,98 % en FP32 en VoxCeleb1-O con recorte central) permiten verificación local en móviles o sistemas embebidos.
- Investigación en reconocimiento de hablante: al ser una reimplementación reproducible en JAX/Flax de GE2E, Dr-Vectors, ATP y PFAS, sirve como baseline abierto para comparar variantes de pooling y funciones de pérdida.
- Filtrado de datos de entrenamiento ASR: el modelo puede eliminar locuciones con hablantes duplicados entre splits de train y test en corpus de voz.

## Benchmarks y rendimiento

La model card reporta métricas de evaluación en `eval_results.json`, pero en la información disponible solo se detallan los resultados de VoxCeleb1-O:

| Metrica | Valor |
|---|---|
| EER 1-utt, VoxCeleb1-O, JAX secuencia completa con máscara (37.611 trials) | 2,66 % |
| EER 1-utt, VoxCeleb1-O, TFLite FP32, recorte central de 180 frames | 5,98 % |
| EER 1-utt, VoxCeleb1-O, TFLite INT8, recorte central de 180 frames | 6,01 % |
| Fidelidad coseno media FP32 vs INT8 (entradas de 180 frames) | 0,999580 |
| Desviación estándar entre semillas 0-2 del EER agrupado 1-utt | 0,08-0,41 % absoluto |
| Semiancho del intervalo bootstrap del 95 % (8.000 trials) | ~0,8 % |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje, ya que el modelo no es generativo. Las métricas completas de EER 3-utt, minDCF, ROC-AUC e intervalo de confianza están en `eval_results.json` del repositorio, pero sus valores no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 22 millones de parámetros; en FP32 ocupa aproximadamente 88 MB de pesos, y en INT8 unos 22 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 2 GB de memoria es suficiente, incluidas RTX 3060, RTX 4090, A100 y H100.
- Cabe en GPU consumer: sí, en cualquier GPU moderna; también en CPU para inferencia por locución.
- Opciones de despliegue: librería `flaxspeaker` (Python API y CLI `scripts/inference.py`), exportaciones TFLite para dispositivos, y JAX/Flax nativo. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | EER VoxCeleb1-O | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_full_conformer_large_arcface` | 22,0 M | hasta 30 s (JAX); 1,8 s (TFLite) | 2,66 % (JAX) | Apache 2.0 | Hugging Face, PyPI, GitHub |
| ECAPA-TDNN (referencia de la literatura) | no disponible en la información | no disponible | no disponible | varía según checkpoint | no disponible |
| WavLM-based speaker models | no disponible en la información | no disponible | no disponible | varía según checkpoint | no disponible |
| X-vector / TDNN clásicos | no disponible en la información | no disponible | no disponible | varía según checkpoint | no disponible |

No se dispone en la información proporcionada de datos verificables de parámetros, contexto ni EER de los modelos alternativos, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- No es un producto oficialmente soportado por Google; es una reimplementación independiente basada únicamente en papers publicados.
- El EER se degrada notablemente al pasar de inferencia JAX con secuencia completa (2,66 %) a las exportaciones TFLite con recorte central de 180 frames (5,98-6,01 %), por lo que el despliegue en dispositivo pierde precisión.
- Las exportaciones TFLite usan una ventana fija y sin máscara de 180 frames; no procesan audio más largo sin troceado previo.
- Riesgo de sesgo por dominio y demografía: el entrenamiento se apoya en VoxCeleb, CN-Celeb y LibriSpeech, corpus con sesgos conocidos de idioma, acento y condiciones de grabación; el rendimiento fuera de esos dominios no está documentado en la información disponible.
- El frontend de audio no es un `AutoFeatureExtractor` de Hugging Face, sino `flaxspeaker.AudioFrontend`; usar otro frontend produce embeddings incorrectos.
- Requiere `flaxspeaker >= 0.8.0`; versiones anteriores no son compatibles con este checkpoint.
- Los idiomas soportados no están declarados; el modelo es agnóstico al contenido lingüístico, pero la cobertura de acentos e idiomas depende de los corpus de entrenamiento.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la verificación biométrica de voz está sujeta a regulación (RGPD, AI Act) en la Unión Europea; debe evaluarse el consentimiento y la base legal antes de producción.
- No se han publicado métricas de latencia ni throughput, lo que dificulta estimar costes de despliegue a priori.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/univ_full_conformer_large_arcface
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
