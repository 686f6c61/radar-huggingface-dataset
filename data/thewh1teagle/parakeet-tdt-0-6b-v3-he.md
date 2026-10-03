# thewh1teagle/parakeet-tdt-0.6b-v3-he

## Resumen

parakeet-tdt-0.6b-v3-he es un modelo de reconocimiento automatico del habla (ASR) especializado en hebreo, desarrollado por el usuario thewh1teagle como un ajuste fino del modelo multilingue nvidia/parakeet-tdt-0.6b-v3 de NVIDIA. Resuelve la transcripcion de audio en hebreo moderno con puntuacion y formato de texto normalizado, un idioma que no estaba cubierto por el modelo base de NVIDIA y para el que las alternativas open source de calidad eran escasas hasta ahora. Su relevancia actual radica en que iguala o supera a whisper-large-v3-turbo en hebreo siendo un modelo mucho mas pequeno y rapido.

El modelo cuenta con 628.356.220 parametros (aproximadamente 628 M) y combina un encoder FastConformer con un decoder TDT (Token-and-Duration Transducer). Hereda del modelo base la deteccion automatica de idioma, la puntuacion nativa, las mayusculas y la prediccion de timestamps a nivel de palabra, y anade un tokenizer extendido con piezas BPE especificas de hebreo (vocabulario de 9.206 frente a las 8.192 originales) sin reinicializar los pesos preentrenados del decoder.

Se distribuye bajo licencia CC-BY-4.0, en formatos safetensors y GGUF (q8_0), y es compatible con la libreria transformers (a partir de la version 5.18) mediante las clases `AutoModelForTDT` y `AutoProcessor`. El autor publica tambien cuantizaciones listas para la aplicacion de transcripcion Vibe y para NeMo-Speech.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + TDT Token-and-Duration Transducer (decoder) |
| Parametros totales | 628.356.220 (aproximadamente 628 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de ASR; procesa audio, no secuencias de tokens) |
| Tipos de cuantizacion | GGUF q8_0 (fichero `parakeet-tdt-0.6b-v3-he.q8_0.gguf`); safetensors en bf16; `.nemo` |
| Idiomas soportados | hebreo (he) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, GGUF (q8_0), `.nemo` |
| Vocabulario | 9.206 piezas (8.192 del modelo base + 1.014 piezas BPE de hebreo) |
| Modelo base | nvidia/parakeet-tdt-0.6b-v3 |
| Tamano del repositorio | 5,7 GB |

## Arquitectura y entrenamiento

La arquitectura combina un encoder FastConformer, una variante eficiente del Conformer con atencion por chunks y codificacion posicional relativa, con un decoder TDT (Token-and-Duration Transducer). A diferencia de un transducer clasico, el decoder TDT predice en cada paso tanto el token como su duracion, lo que reduce el numero de pasos de decodificacion y aumenta el throughput de transcripcion. El modelo base de NVIDIA fue entrenado con el corpus multilingue Granary (aproximadamente 660.000 horas de audio pseudo-etiquetado mas unas 10.000 horas de transcripciones humanas) para cubrir 25 idiomas europeos; este ajuste anade hebreo.

El ajuste fino anade un nuevo idioma siguiendo una receta especifica: en lugar de reemplazar el tokenizer con `change_vocabulary()`, se entrena un BPE de hebreo sobre unas 250 horas de transcripciones normalizadas, se generan 1.024 piezas de vocabulario y se anaden a continuacion de las 8.192 existentes, preservando los ids y merges originales. Despues se copian todos los pesos preentrenados por id de token (LSTM de prediccion, capas ocultas del joint, filas de tokens antiguos, filas de blank y de duracion TDT) y solo las filas nuevas se inicializan desde la media de las antiguas (con un 1 % de ruido) y el bias del joint desde la media del bias antiguo. Se aplica un learning rate 10x mayor en decoder y joint (2e-3 frente a 2e-4 del encoder) para que las filas nuevas dejen de ser indistinguibles rapidamente.

Los datos de entrenamiento consisten en aproximadamente 6.000 horas de audio de ivrit.ai pseudo-etiquetado con ivrit-ai/whisper-large-v3-turbo, filtrado con un umbral de `compression_ratio <= 2.2`, en una sola pasada y con batches agrupados por duracion. El entrenamiento usa bf16, learning rate bajo (1e-5 a 3e-5) con warmup corto y aproximadamente 600 segundos de audio por paso de optimizador mediante acumulacion de gradientes. El audio es mono a 16 kHz y el texto se normaliza eliminando nikud y marcas bidi, y sustituyendo geresh/gershayim por `'` y `"`.

## Capacidades

- Transcripcion de voz en hebreo moderno con texto normalizado (sin nikud, marcas bidi eliminadas).
- Deteccion automatica de idioma heredada del modelo base (aunque el ajuste esta orientado a hebreo).
- Puntuacion y capitalizacion nativas.
- Prediccion de timestamps a nivel de palabra.
- Decodificacion TDT eficiente, pensada para transcripcion de alto throughput por lotes.
- Procesamiento de audio mono a 16 kHz.
- Ajuste fino adicional sobre el propio modelo: el `.nemo` incluye el tokenizer extendido, por lo que se puede reentrenar sin `change_vocabulary()`.
- No se documentan capacidades de vision, audio multimodal, tool calling ni razonamiento multi-paso: es un modelo puramente de ASR.

## Casos de uso

- Transcripcion de entrevistas y podcasts en hebreo: el modelo convierte audio largo en texto con puntuacion y timestamps, util para publicar transcripciones accesibles o generar resumenes posteriores con un LLM.
- Subtitulado automatico: la prediccion de timestamps a nivel de palabra permite alinear subtitulos con el audio para plataformas de video.
- Atencion al cliente en centros de contacto israelies: transcripcion por lotes de llamadas grabadas para analitica, control de calidad y busqueda en conversaciones.
- Transcripcion de notas de voz de WhatsApp: el autor reporta resultados especificos sobre el conjunto `eval-whatsapp`, lo que indica idoneidad para audio conversacional espontaneo y ruidoso.
- Archivado y busqueda de contenido audiovisual en hebreo: indexacion de grandes volumenes de audio de ivrit.ai u otras fuentes para busqueda por texto completo.
- Transcripcion local en aplicaciones de escritorio: la cuantizacion GGUF q8_0 permite integrar el modelo en la app Vibe y ejecutar transcripcion en el propio dispositivo sin enviar audio a la nube.
- Investigacion en ASR de hebreo: sirve como punto de partida (fine-tuning) para dominios especificos como terminologia medica, legal o jerga tecnica, gracias a que el `.nemo` conserva el tokenizer extendido.
- Generacion de datasets etiquetados: dado su throughput, puede usarse para pseudo-etiquetar audio en hebreo y alimentar pipelines posteriores de entrenamiento.

## Benchmarks y rendimiento

WER (%, menor es mejor) sobre los conjuntos de test transcritos por humanos de ivrit.ai, con la normalizacion del leaderboard de transcripcion en hebreo:

| Modelo | eval-d1 | eval-whatsapp |
|---|---|---|
| openai/whisper-large-v3-turbo | 8,4 | 12,8 |
| parakeet-tdt-0.6b-v3-he (este modelo) | 8,1 | 11,0 |
| ivrit-ai/whisper-large-v3-turbo | 5,3 | 7,1 |

No se han publicado en la informacion disponible otros benchmarks (por ejemplo, MMLU, HumanEval o GSM8K) porque no aplican a un modelo de ASR. No se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 628 M de parametros; no son cifras oficiales del autor): aproximadamente 1,3-1,5 GB en bf16/fp16, unos 0,7 GB en int8 (GGUF q8_0) y unos 2,5 GB en fp32, mas la memoria adicional de activaciones para audio largo.
- GPU consumer: cabe sin problema en cualquier GPU con 4 GB o mas de VRAM, como RTX 3050, RTX 3060, RTX 4060 o superiores. No se requieren GPU de datacenter para inferencia individual.
- GPU de datacenter (A100, H100, L40S): recomendadas para procesamiento por lotes de alto volumen y maximizar el throughput de la decodificacion TDT.
- Opciones de despliegue: transformers (>=5.18) con `AutoModelForTDT` y `AutoProcessor`; NeMo (`ASRModel.from_pretrained`); NeMo-Speech.cpp para el GGUF q8_0; aplicacion Vibe con el repositorio vibe-app/parakeet-tdt-0.6b-v3-he-gguf.
- Latencia y throughput estimados: no disponible.
- Nota de entrenamiento/validacion: al hacer fine-tuning, poner `decoding.greedy.use_cuda_graph_decoder: false` durante la validacion intra-entrenamiento para evitar que decodifique con pesos obsoletos y produzca salida vacia.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | WER eval-d1 | WER eval-whatsapp | Disponibilidad |
|---|---|---|---|---|---|---|
| parakeet-tdt-0.6b-v3-he | 628 M | hebreo | CC-BY-4.0 | 8,1 | 11,0 | HuggingFace (safetensors, GGUF, .nemo) |
| openai/whisper-large-v3-turbo | no disponible | multilingue | MIT (no confirmado en la informacion) | 8,4 | 12,8 | HuggingFace |
| ivrit-ai/whisper-large-v3-turbo | no disponible | hebreo | no disponible | 5,3 | 7,1 | HuggingFace |
| nvidia/parakeet-tdt-0.6b-v3 (base) | 600 M | 25 idiomas europeos (sin hebreo) | CC-BY-4.0 | no disponible | no disponible | HuggingFace, NGC |

Nota: los parametros de los modelos Whisper no figuran en la informacion proporcionada, por lo que se indican como no disponibles.

## Limitaciones y advertencias

- Modelo especializado en un unico idioma (hebreo); no esta pensado para transcribir otros idiomas aunque el modelo base sea multilingue.
- Es un modelo de ASR: no genera razonamiento, no soporta tool calling ni agentes.
- Riesgo de alucinacion y de errores en audio con ruido, solapamiento de voces, acentos poco representados o terminologia especializada no vista en el corpus de pseudo-etiquetado.
- El entrenamiento se basa en pseudo-etiquetas generadas por ivrit-ai/whisper-large-v3-turbo, por lo que puede heredar los sesgos y errores sistematicos de ese modelo maestro.
- La normalizacion del texto elimina nikud y marcas bidi; si el caso de uso requiere texto vocalizado, el modelo no lo proporcionara.
- No se recomienda usar el modelo como si fuera un modelo de lenguaje: no responde a instrucciones ni mantiene conversacion.
- Licencia CC-BY-4.0: permite uso comercial con atribucion al autor (thewh1teagle) y a NVIDIA como autor del modelo base, y a ivrit.ai como fuente de los datos; conviene revisar la licencia de ivrit.ai para usos derivados.
- El leaderboard de referencia y los conjuntos de evaluacion son especificos de ivrit.ai, por lo que las cifras de WER no son directamente extrapolables a otros dominios o corpus.
- Para produccion, conviene validar el WER en audio del dominio objetivo antes de desplegar, dado que no se han publicado evaluaciones fuera de los conjuntos de ivrit.ai.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thewh1teagle/parakeet-tdt-0.6b-v3-he
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Cuantizacion GGUF para Vibe: https://huggingface.co/vibe-app/parakeet-tdt-0.6b-v3-he-gguf
- Modelo maestro de pseudo-etiquetado: https://huggingface.co/ivrit-ai/whisper-large-v3-turbo
- Leaderboard de transcripcion en hebreo de ivrit.ai: https://huggingface.co/spaces/ivrit-ai/hebrew-transcription-leaderboard
- NeMo-Speech.cpp (runtime GGUF): https://github.com/NVIDIA/NeMo-Speech.cpp
- Aplicacion Vibe: https://thewh1teagle.github.io/vibe
- Discusion tecnica del ajuste en NeMo Speech: https://github.com/NVIDIA-NeMo/Speech/issues/14140#issuecomment-5920783584
- ivrit.ai (fuente de datos y licencia): https://www.ivrit.ai y https://www.ivrit.ai/en/the-license/
- Coleccion NVIDIA NGC de Parakeet TDT 0.6B: https://catalog.ngc.nvidia.com/orgs/nvidia/collections/parakeet-tdt-0.6b
- Ficha de Parakeet TDT 0.6B v3 en OpenASR: https://openasr.org/models/parakeet-tdt-0.6b-v3/
- Parakeet TDT 0.6B v2 en NVIDIA NIM: https://build.nvidia.com/nvidia/parakeet-tdt-0_6b-v2
