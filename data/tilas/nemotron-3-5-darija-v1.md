# Tilas/nemotron-3.5-darija-v1

## Resumen

Tilas/nemotron-3.5-darija-v1 es un modelo de reconocimiento automatico del habla (ASR) especializado en dariya, el arabe marroqui dialectal, publicado por el usuario Tilas en Hugging Face. Se trata de un fine-tuning del modelo base nvidia/nemotron-3.5-asr-streaming-0.6b, desarrollado por NVIDIA dentro de su familia Nemotron, lo que lo situa en la estela de una arquitectura FastConformer con decodificador RNNT (Recurrent Neural Network Transducer) orientada a inferencia en streaming.

El modelo aborda un problema concreto y poco cubierto por los sistemas ASR comerciales: la transcripcion de dariya, una variedad oral del arabe con fuerte influencia del frances y del bereber, caracterizada por code-switching frecuente entre arabe dialectal, frances, arabe estandar e ingles. Los sistemas genericos entrenados en arabe estandar (MSA) rinden mal sobre dariya, por lo que un ajuste especifico sobre un backbone de 0,6 mil millones de parametros resulta relevante para aplicaciones de transcripcion de llamadas, subtitulado y asistentes de voz en Marruecos.

Con un tamano de repositorio de 2,6 GB, licencia OpenMDW-1.1 y acceso restringido (gated) en Hugging Face, el modelo esta pensado para despliegue con la libreria NeMo de NVIDIA. La informacion publica disponible es limitada: no se detallan volumenes de datos de entrenamiento, hiperparametros ni resultados de benchmarks, por lo que esta ficha refleja unicamente lo declarado en la model card y en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador RNNT (transducer), disenada para streaming |
| Parametros totales | 0,6 mil millones (heredados del modelo base nvidia/nemotron-3.5-asr-streaming-0.6b) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo ASR; la ventana se define por segmentos de audio en streaming) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | ary (dariya), ar (arabe), fr (frances), en (ingles) |
| Licencia | OpenMDW-1.1 (acceso restringido en Hugging Face) |
| Formato de pesos | No disponible (repositorio NeMo, 2,6 GB; probablemente .nemo, no confirmado) |

## Arquitectura y entrenamiento

El modelo se construye sobre nvidia/nemotron-3.5-asr-streaming-0.6b, un sistema ASR de NVIDIA basado en FastConformer, una variante del encoder Conformer con atencion por bloques que reduce el coste computacional y habilita decodificacion en streaming. El decodificador es un RNNT, lo que permite emitir tokens de forma incremental a medida que llega el audio, sin necesidad de esperar a la frase completa.

El ajuste realizado por Tilas adapta ese backbone al dominio de la dariya y al fenomeno del code-switching entre arabe marroqui, arabe estandar, frances e ingles. No se ha publicado informacion sobre el volumen de horas de audio empleadas, la composicion del corpus, el uso de aumentacion de datos ni si se aplicaron tecnicas de regularizacion especificas (SpecAugment, speed perturbation, etc.). Tampoco consta si hubo fusion de modelos o entrenamiento multiobjetivo con CTC auxiliar, practica habitual en los fine-tunings de NeMo.

## Capacidades

- Reconocimiento automatico del habla en dariya (arabe marroqui) como idioma principal.
- Transcripcion de audio con code-switching entre dariya, arabe estandar, frances e ingles.
- Decodificacion en streaming: el decoder RNNT permite transcripcion incremental con baja latencia.
- Integracion nativa con el ecosistema NVIDIA NeMo (pipelines de ASR, transcribe, evaluacion WER/CER).
- Salida de transcripcion en texto plano con puntuacion y mayusculas segun el formato del modelo base (no confirmado para dariya).
- No se declaran capacidades de diarizacion, traduccion, tool calling ni razonamiento multi-paso; es un modelo puramente ASR.

## Casos de uso

- Transcripcion de llamadas de atencion al cliente en Marruecos: el modelo convierte audio telefonico en texto con mezcla de dariya y frances, lo que permite analitica de calidad y busqueda sobre conversaciones que los ASR genericos en arabe estandar transcriben deficientemente.
- Subtitulado en streaming para medios marroquies: gracias a la decodificacion incremental del RNNT, puede generar subtitulos en directo para programas de television o radio donde los hablantes alternan dariya y frances.
- Asistentes de voz para aplicaciones locales: integrado en un pipeline de ASR mas NLU, sirve para comandos de voz en dariya en apps de movilidad, banca o comercio electronico dirigidas al mercado marroqui.
- Generacion de actas y notas de reunion: transcripcion de reuniones internas donde los participantes hablan en dariya con terminos tecnicos en frances o ingles, facilitando la documentacion posterior.
- Investigacion linguistica y sociolinguistica: permite construir corpus anotados de dariya a partir de grabaciones, midiendo frecuencia de code-switching y variacion dialectal.
- Moderacion y compliance de contenido audiovisual: transcripcion masiva de videos para detectar terminos prohibidos o para indexacion semantica en plataformas con audiencia marroqui.
- Accesibilidad: subtitulado automatico para personas con discapacidad auditiva en contenido producido en dariya.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 0,6 mil millones de parametros, la inferencia en precision FP16 requiere aproximadamente 1,2-1,5 GB de VRAM, y en FP32 alrededor de 2,4-3 GB. Cifras orientativas calculadas a partir del numero de parametros, no confirmadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM deberia poder ejecutarlo; NVIDIA A100, H100, L4, T4 y RTX 3090/4090 son opciones sobradas para despliegues en produccion o experimentacion.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070 o superiores; tambien en GPUs de portatil con 6-8 GB.
- Opciones de despliegue: NVIDIA NeMo (transcribe, ASRModel.from_pretrained), NVIDIA Riva para servir en produccion, y potencialmente exportacion a TensorRT u ONNX si el autor lo permite (no confirmado).
- Latencia y throughput: no disponibles. En un modelo FastConformer-RNNT de 0,6B es habitual obtener latencias de decodificacion en tiempo real o por debajo en GPU modernas, pero no hay mediciones publicadas para este fine-tuning.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tilas/nemotron-3.5-darija-v1 | 0,6B | ary, ar, fr, en | FastConformer + RNNT | OpenMDW-1.1 | Gated en HF |
| nvidia/nemotron-3.5-asr-streaming-0.6b (base) | 0,6B | Multiples (no detallado) | FastConformer + RNNT | OpenMDW-1.1 | HF |
| Whisper large-v3 (OpenAI) | 1,55B | ~99 idiomas (arabe estandar, no dariya especifico) | Transformer encoder-decoder | MIT | Abierto |
| MMS / wav2vec2 para arabe (Meta) | Variable (300M-1B) | arabe estandar | CTC / wav2vec2 | MIT / CC-BY-NC | Abierto |

La comparativa con Whisper large-v3 es la mas relevante en la practica: Whisper cubre arabe estandar pero no esta especializado en dariya, mientras que este modelo esta ajustado especificamente para el dialecto. Frente a MMS de Meta, que cubre arabe estandar con CTC, este modelo anade streaming nativo y code-switching. No hay datos de WER publicados para ninguna de las alternativas en dariya en la informacion disponible, por lo que la comparacion cualitativa no puede cuantificarse.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated, por lo que es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- Licencia OpenMDW-1.1: conviene revisar los terminos exactos antes de un uso comercial, ya que impone condiciones especificas sobre redistribucion y atribucion.
- Sin benchmarks publicados: no hay mediciones de WER ni CER, ni sobre dariya ni sobre los idiomas secundarios, lo que impide evaluar su calidad real frente a alternativas.
- Datos de entrenamiento desconocidos: se desconoce el volumen y la procedencia del corpus, lo que dificulta estimar sesgos dialectales (por ejemplo, sobrerrepresentacion de dariya de Casablanca frente a otras regiones).
- Riesgo de alucinacion en ASR: como todo modelo transducer, puede generar texto plausible en segmentos de audio ruidoso o con habla solapada; no debe usarse sin revision en contextos legales o medicos.
- Cobertura limitada a cuatro idiomas: fuera de ary, ar, fr y en el rendimiento puede degradarse notablemente.
- Modelo de 0,6B: aunque eficiente, su capacidad es inferior a la de modelos ASR mas grandes como Whisper large-v3 en condiciones acusticas dificiles, aunque compensa con especializacion dialectal.
- Dependencia del ecosistema NeMo: el despliegue esta ligado a las herramientas de NVIDIA, lo que puede limitar la portabilidad a otros stacks (ONNX, llama.cpp no aplican a ASR).
- Sin informacion sobre puntuacion, mayusculas ni normalizacion de texto para dariya: es probable que la salida herede el formato del modelo base, no adaptado al dialecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tilas/nemotron-3.5-darija-v1
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Documentacion de NVIDIA NeMo: https://docs.nvidia.com/nemo-framework/
- Repositorio NeMo en GitHub: https://github.com/NVIDIA/NeMo
- Licencia OpenMDW-1.1: https://huggingface.co/blog/openmdw
