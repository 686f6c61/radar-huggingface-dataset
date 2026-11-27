# Tilas/nemotron-3.5-darija-v1.1

## Resumen

Tilas/nemotron-3.5-darija-v1.1 es un modelo de reconocimiento automatico del habla (ASR) especializado en dariya, el arabe marroqui dialectal, con soporte para code-switching entre arabe, frances e ingles. Se construye mediante fine-tuning del modelo base nvidia/nemotron-3.5-asr-streaming-0.6b, un FastConformer con decodificador RNNT de aproximadamente 0,6 mil millones de parametros disenado para transcripcion en streaming con atencion cache-aware. El autor es Tilas, un desarrollador independiente que publica el modelo en Hugging Face bajo acceso restringido (gated).

El modelo aborda un problema concreto: la mayoria de sistemas ASR comerciales y open source rinden mal en dariya, un dialecto con enorme variacion fonetica, ausencia de ortografia estandarizada y frecuente mezcla de lexico frances y arabe en una misma frase. Al partir de un modelo de NVIDIA optimizado para streaming y bajo consumo, el fine-tuning busca ofrecer transcripcion en tiempo real en un tamano que quepa en hardware modesto, algo relevante para aplicaciones de subtitulado, asistentes de voz y transcripcion de reuniones en contexto marroqui.

El modelo es relevante ahora por dos motivos: la creciente demanda de ASR dialectal arabe en productos de voz para el Magreb y la existencia de una base tecnica (Nemotron 3.5 ASR streaming) que facilita el ajuste fino con licencia permisiva. El repositorio ocupa 2,6 GB y se distribuye en formato nativo de NVIDIA NeMo, con pesos compatibles con la libreria `nemo`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador RNNT (transducer), atencion cache-aware para streaming |
| Parametros totales | aproximadamente 0,6 mil millones (heredados del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio en streaming no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ary (dariya), ar (arabe estandar), fr (frances), en (ingles) |
| Licencia | apache-2.0-and-openmdw-1.1 (licencia compuesta; acceso gated en Hugging Face) |
| Formato de pesos | formato nativo NeMo (`.nemo`); el repo ocupa 2,6 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura FastConformer de NVIDIA, un encoder convolucional-aumentado basado en transformer que reduce la longitud de secuencia mediante subsampling, combinado con un decodificador RNNT (Recurrent Neural Network Transducer). La variante "streaming" incorpora atencion cache-aware, lo que permite procesar audio por chunks manteniendo un estado de cache y obtener transcripciones parciales con baja latencia, sin necesidad de reprocesar toda la utterance. El tamano de 0,6 B parametros lo situa en la gama de modelos desplegables en CPU o GPU de consumo.

El fine-tuning se realiza sobre el checkpoint nvidia/nemotron-3.5-asr-streaming-0.6b, adaptandolo al dominio dariya con datos que, segun los tags del repositorio, cubren code-switching arabe-frances-ingles. No se especifican en la informacion disponible el numero de horas de audio de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de aumento de datos, especulacion o decodificacion con LM externo. Tampoco se documenta el proceso de alineacion o las tasas de error obtenidas durante el ajuste.

## Capacidades

- Transcripcion de voz a texto en arabe marroqui (dariya) con salida en grafia arabe.
- Manejo de code-switching intra-frase entre dariya, arabe estandar, frances e ingles.
- Reconocimiento en streaming: procesa audio de forma incremental con atencion cache-aware, apto para subtitulado en vivo.
- Soporte de audio de entrada en formato estandar (wav, flac) a traves de la API de NeMo.
- Decodificacion RNNT greedy o con beam search segun configuracion de NeMo.
- No se documentan capacidades de traduccion, diarizacion de hablantes ni puntuacion automatica en la informacion disponible.
- No se documenta soporte de tool calling ni de agentes (no aplica a un modelo ASR).

## Casos de uso

- Subtitulado en directo de television y medios marroquies: el modo streaming y la atencion cache-aware permiten generar subtitulos con latencia de chunk sobre emisiones en dariya con mezcla de frances.
- Transcripcion de reuniones y llamadas de atencion al cliente: el modelo puede procesar audio de centros de contacto donde los agentes alternan dariya, arabe estandar y frances, generando actas o resumenes posteriores.
- Asistentes de voz para el mercado magrebi: integrado en un pipeline de ASR mas NLU, permite comandos y consultas en dariya sin exigir al usuario cambiar a arabe estandar.
- Indexacion y busqueda de archivos audiovisuales: transcripcion por lotes de podcasts, entrevistas y archivos de radio para habilitar busqueda por texto en catalogo.
- Accesibilidad: generacion de subtitulos automaticos para personas con discapacidad auditiva en contenido en dariya, un idioma con escasa cobertura en herramientas comerciales.
- Analisis de opinion y monitorizacion de medios: transcripcion de debates y programas para su posterior procesamiento de sentimiento o topic modeling, aprovechando el soporte multilingue del modelo.
- Investigacion linguistica: corpus de habla marroqui transcritos para estudios de variacion dialectal y code-switching, dado el interes academico del dariya.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 0,6 B parametros en fp16, aproximadamente 1,2-1,5 GB de pesos mas overhead de runtime; en fp32, en torno a 2,5-3 GB. Cifras orientativas, no confirmadas en la informacion disponible.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, T4) es suficiente para inferencia en fp16; A100/H100 no son necesarias pero ofrecen mayor throughput en batch.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas graficas modernas e incluso en CPU para streaming de un solo canal.
- Opciones de despliegue: NVIDIA NeMo (nativo, recomendado), NVIDIA Riva para despliegue en produccion, y exportacion a ONNX/TensorRT segun el soporte de NeMo para modelos FastConformer-RNNT. No se documenta soporte directo en llama.cpp, Ollama o vLLM (no aplica a ASR).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Streaming | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tilas/nemotron-3.5-darija-v1.1 | ~0,6 B | ary, ar, fr, en | Si (cache-aware) | apache-2.0 + openmdw-1.1 | Gated en HF |
| nvidia/nemotron-3.5-asr-streaming-0.6b | ~0,6 B | multilingue (no detallado) | Si | no disponible en esta ficha | Abierto en HF |
| Whisper large-v3 | ~1,55 B | ~99 idiomas | No nativo (por chunks) | MIT | Abierto en HF |
| Whisper small | ~244 M | ~99 idiomas | No nativo | MIT | Abierto en HF |

La comparativa con Whisper es aproximada: Whisper no esta optimizado para dariya ni para streaming nativo, y su cobertura dialectal arabe es limitada. El modelo de Tilas parte de una base especificamente disenada para streaming, lo que le da ventaja en latencia frente a Whisper procesado por ventanas. No se dispone de datos de WER comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en Hugging Face y requiere aceptar condiciones, lo que limita su uso inmediato en pipelines automatizados.
- Licencia compuesta (apache-2.0-and-openmdw-1.1): es necesario revisar los terminos de OpenMDW 1.1 antes de uso comercial; no se detallan restricciones adicionales en la informacion disponible.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de WER en dariya ni en code-switching, por lo que la calidad real no esta validada de forma independiente.
- Riesgo de alucinacion en ASR: como todo modelo transducer, puede generar texto plausible en segmentos de silencio o ruido; se recomienda umbral de confianza y deteccion de voz (VAD).
- Sesgos dialectales: el entrenamiento se centra en dariya marroqui; el rendimiento en otras variantes arabes (egipcio, levantino, golfo) no esta documentado y probablemente sea inferior.
- Limitaciones de contexto: al ser streaming, la ventana de audio procesable por chunk y la latencia dependen de la configuracion de NeMo; no se especifican valores.
- Sin documentacion de puntuacion, mayusculas ni normalizacion ortografica: la salida puede requerir postprocesado para producir texto legible en produccion.
- Modelo de nicho con 0 descargas y 0 likes en el momento de la ficha: no hay comunidad que valide su comportamiento en escenarios reales.

## Enlaces

- Hugging Face: https://huggingface.co/Tilas/nemotron-3.5-darija-v1.1
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Libreria NeMo: https://github.com/NVIDIA/NeMo
- NVIDIA Riva (despliegue): https://developer.nvidia.com/riva
