# thewh1teagle/parakeet-tdt-0.6b-v3-he

## Resumen

parakeet-tdt-0.6b-v3-he es un modelo de reconocimiento automatico del habla (ASR) especializado en hebreo, desarrollado por el usuario thewh1teagle como ajuste fino de nvidia/parakeet-tdt-0.6b-v3. El modelo parte de la arquitectura FastConformer con decodificacion TDT (Token-and-Duration Transducer) de NVIDIA y anade un tokenizer BPE especifico para hebreo, extendiendo el vocabulario original de 8.192 a 9.206 piezas sin reemplazar los identificadores existentes.

El modelo resuelve el problema de la transcripcion de hebreo con alta precision en un tamano compacto: 628 millones de parametros, lo que permite despliegue en hardware modesto. Segun la model card, alcanza un WER del 6,1 % en el conjunto eval-d1 y del 8,8 % en eval-whatsapp de ivrit.ai, superando a Whisper large-v3, Amazon Transcribe, Deepgram nova-3 y gpt-4o-transcribe en esos mismos conjuntos, y quedando cerca de Soniox (4,8 / 9,0) e ivrit-ai/whisper-large-v3-turbo (5,3 / 7,1).

Es relevante ahora porque demuestra que es viable anadir un idioma nuevo a un modelo Parakeet preservando todos los pesos preentrenados, con un pipeline documentado de ajuste fino, y porque ofrece una alternativa abierta (CC-BY-4.0) a servicios propietarios de ASR para hebreo. El repositorio incluye pesos en safetensors, un archivo GGUF q8_0 para NeMo-Speech.cpp y el checkpoint .nemo para reentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 628.356.220 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF q8_0 incluido en el repositorio; safetensors en precision original |
| Idiomas soportados | hebreo (he) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, GGUF (q8_0), .nemo |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Parakeet TDT de NVIDIA: un encoder FastConformer (variante convolucional de Conformer con atencion de complejidad reducida) acoplado a un decodificador Transducer que predice conjuntamente tokens y duraciones (TDT), lo que permite emitir varios tokens por paso y mejorar la eficiencia de decodificacion frente a un RNN-T clasico. El ajuste fino amplia el tokenizer con un BPE hebreo de 1.024 piezas entrenado sobre unas 250 horas de transcripciones normalizadas; solo se anaden las piezas nuevas no presentes en el vocabulario original, puntuadas por debajo de todas las de v3 para preservar el orden de merges.

El entrenamiento conserva todos los pesos preentrenados copiandolos por identificador de token (LSTM de prediccion, capas ocultas del joint, filas de tokens antiguos, fila blank y filas de duracion TDT); unicamente las filas nuevas se inicializan a la media de las antiguas con un 1 % de ruido. Se aplica una tasa de aprendizaje 10 veces mayor en decodificador y joint (2e-3) que en el encoder (2e-4), con warmup corto y bf16. Los datos son aproximadamente 9.000 horas de audio de ivrit.ai pseudo-etiquetadas con ivrit-ai/whisper-large-v3-turbo, filtradas con compression_ratio <= 2.2 en una sola pasada y con lotes agrupados por duracion. No se menciona RLHF ni DPO.

## Capacidades

- Transcripcion de voz a texto en hebreo a partir de audio de 16 kHz mono.
- Decodificacion TDT con prediccion conjunta de tokens y duraciones, lo que reduce pasos de decodificacion.
- Extraccion de caracteristicas de audio (pipeline feature-extraction en los tags del repositorio).
- Integracion con la libreria transformers mediante AutoModelForTDT y AutoProcessor (requiere transformers >= 5.18).
- Compatibilidad con NeMo-Speech.cpp a traves del archivo GGUF q8_0 incluido.
- Ajuste fino adicional con NeMo cargando el checkpoint .nemo, que ya incorpora el tokenizer extendido.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica (modelo ASR).
- Capacidades multilingues: limitadas al hebreo; las palabras en ingles se transcriben en caracteres hebreos.
- Capacidades de vision o audio generativo: no disponibles (solo ASR).

## Casos de uso

- Transcripcion de reuniones y clases en hebreo: el modelo procesa audio de 16 kHz mono y produce texto con un WER del 6,1 % en el conjunto eval-d1, adecuado para actas automaticas con revision humana ligera.
- Subtitulado de contenido audiovisual en hebreo: con 628 M de parametros y cuantizacion q8_0 puede ejecutarse en CPU o GPU modesta, lo que permite procesar lotes de video sin depender de APIs externas.
- Transcripcion de notas de voz de WhatsApp: el WER del 8,8 % en eval-whatsapp lo situa por delante de Amazon Transcribe (10,4), Deepgram nova-3 (12,0) y gpt-4o-transcribe (12,6) en ese dominio, por lo que es una opcion solida para mensajeria de voz.
- Integracion en la aplicacion Vibe: el autor publica una variante GGUF especifica (vibe-app/parakeet-tdt-0.6b-v3-he-gguf) para transcripcion local de escritorio.
- Despliegue en servidores sin GPU: el archivo GGUF q8_0 para NeMo-Speech.cpp permite inferencia en CPU, util para archivado masivo de audio historico.
- Generacion de datos etiquetados para otros modelos: el checkpoint .nemo con tokenizer extendido sirve como base para ajustes finos posteriores con NeMo sobre nuevos dominios o acentos.
- Investigacion en adaptacion de idiomas: el pipeline documentado (extension de tokenizer, preservacion de pesos, LR diferenciada) es replicable para otros idiomas sobre Parakeet.

## Benchmarks y rendimiento

WER (%, menor es mejor) en los conjuntos de test con transcripcion humana de ivrit.ai, con la normalizacion del leaderboard de ivrit-ai:

| Modelo | eval-d1 | eval-whatsapp |
|---|---|---|
| Soniox | 4,8 | 9,0 |
| ivrit-ai/whisper-large-v3-turbo | 5,3 | 7,1 |
| parakeet-tdt-0.6b-v3-he (este modelo) | 6,1 | 8,8 |
| Amazon Transcribe | 6,6 | 10,4 |
| Deepgram nova-3 | 6,7 | 12,0 |
| OpenAI gpt-4o-transcribe | 7,3 | 12,6 |
| openai/whisper-large-v3-turbo | 8,4 | 12,8 |
| openai/whisper-large-v3 | 9,8 | 13,2 |

Ademas, la model card indica un rendimiento en FLEURS de 76,8, inferior a los ~82 de los mejores modelos en texto enciclopedico leido.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 628 M de parametros, la inferencia en bf16 requiere aproximadamente 1,3 GB solo para pesos, y el GGUF q8_0 reduce el peso a aproximadamente 0,6 GB.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU con al menos 2-4 GB de VRAM libre deberia ser suficiente.
- GPU de consumo: si, cabe en tarjetas de consumo como RTX 3060, RTX 4060 o superiores, e incluso en CPU mediante NeMo-Speech.cpp con el GGUF.
- Opciones de despliegue: transformers >= 5.18 con AutoModelForTDT, NeMo (ASRModel.from_pretrained con el .nemo) y NeMo-Speech.cpp para el GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER eval-d1 / eval-whatsapp | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parakeet-tdt-0.6b-v3-he | 628 M | no disponible | 6,1 / 8,8 | CC-BY-4.0 | Hugging Face (safetensors, GGUF, .nemo) |
| ivrit-ai/whisper-large-v3-turbo | no disponible en la informacion | no disponible | 5,3 / 7,1 | no disponible en la informacion | Hugging Face |
| openai/whisper-large-v3-turbo | no disponible en la informacion | no disponible | 8,4 / 12,8 | no disponible en la informacion | Hugging Face |
| openai/whisper-large-v3 | no disponible en la informacion | no disponible | 9,8 / 13,2 | no disponible en la informacion | Hugging Face |
| Soniox (servicio propietario) | no disponible | no disponible | 4,8 / 9,0 | propietaria | API comercial |

## Limitaciones y advertencias

- Solo hebreo: las palabras en ingles se transcriben en caracteres hebreos, lo que degrada la salida en audio con terminos tecnicos en latin.
- Rendimiento mas debil en texto enciclopedico leido (FLEURS: 76,8 frente a ~82 de los mejores), con errores en nombres raros, numeros y terminos latinos.
- Los numeros se escriben de forma inconsistente, alternando palabras y digitos.
- Riesgo de alucinacion en audio con ruido o silencios largos, comun en modelos transducer; la model card no documenta mitigaciones especificas.
- Sesgos conocidos: no documentados en la informacion proporcionada; al entrenarse sobre ivrit.ai, puede heredar sesgos de ese corpus.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribucion; el modelo base de NVIDIA tambien es CC-BY-4.0 y los datos de ivrit.ai tienen su propia licencia.
- Para produccion, conviene normalizar la salida (eliminar nikud y marcas bidi, convertir geresh/gershayim a comillas) igual que en el entrenamiento.
- Durante el ajuste fino con NeMo, es necesario desactivar decoding.greedy.use_cuda_graph_decoder en la validacion para evitar salidas vacias con pesos obsoletos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thewh1teagle/parakeet-tdt-0.6b-v3-he
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Variante GGUF para Vibe: https://huggingface.co/vibe-app/parakeet-tdt-0.6b-v3-he-gguf
- Aplicacion Vibe: https://thewh1teagle.github.io/vibe
- NeMo-Speech.cpp: https://github.com/NVIDIA/NeMo-Speech.cpp
- Leaderboard de transcripcion en hebreo: https://huggingface.co/spaces/ivrit-ai/hebrew-transcription-leaderboard
- ivrit-ai/whisper-large-v3-turbo: https://huggingface.co/ivrit-ai/whisper-large-v3-turbo
- openai/whisper-large-v3-turbo: https://huggingface.co/openai/whisper-large-v3-turbo
- openai/whisper-large-v3: https://huggingface.co/openai/whisper-large-v3
- ivrit.ai: https://www.ivrit.ai
- Licencia de ivrit.ai: https://www.ivrit.ai/en/the-license/
- Detalle del entrenamiento en NeMo: https://github.com/NVIDIA-NeMo/Speech/issues/14140#issuecomment-5920783584
