# Yamabiko-ASR/kodama-1

## Resumen

Kodama-1 es un modelo de reconocimiento automatico del habla (ASR) especializado en japones, desarrollado por Yamabiko-ASR. Se trata de un fine-tuning del decodificador del modelo Whisper-ja-760M de efwkjn, convertido al formato CTranslate2 para su uso con faster-whisper. El modelo esta pensado para transcripcion de audio en japones con requisitos de latencia propios de un pipeline de produccion.

La relevancia del modelo radica en su enfoque: en lugar de reentrenar el modelo completo, el autor ha ajustado unicamente el decodificador sobre un conjunto de datos que combina corpus de habla general (ReazonSpeech v2) con datos especificos de dominios como novelas visuales (OOPPEENN) y corpus de voz emocional (JVNV, JNV). Esto lo hace especialmente adecuado para transcripcion de contenido narrativo y conversacional en japones, un nicho poco cubierto por los modelos ASR genericos.

El modelo se distribuye exclusivamente en formato CTranslate2, lo que implica que no es cargable directamente con la libreria transformers sino a traves de faster-whisper. Con 1,5 GB de repositorio, esta disenado para despliegues en CPU o GPU con requisitos de memoria moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) con decodificador fine-tuneado |
| Parametros totales | aproximadamente 760M (heredados del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper) |
| Tipos de cuantizacion | no disponible (formato CTranslate2; el repo no detalla variantes) |
| Idiomas soportados | japones (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | CTranslate2 (para faster-whisper) |

## Arquitectura y entrenamiento

Kodama-1 hereda la arquitectura encoder-decoder de Whisper, un transformer disenado para ASR que procesa ventanas de audio de 30 segundos y genera tokens de texto de forma autoregresiva. El modelo base es whisper-ja-760M de efwkjn, un fine-tuning en japones de Whisper con aproximadamente 760 millones de parametros. Yamabiko-ASR ha modificado unicamente el decodificador, manteniendo el encoder del modelo base, y ha convertido el resultado a CTranslate2 para inferencia optimizada con faster-whisper.

Los datos de entrenamiento del fine-tuning incluyen ReazonSpeech v2 (corpus de habla japonesa a gran escala, usado bajo el articulo 30-4 de la ley de derechos de autor japonesa), el dataset de novelas visuales OOPPEENN, los corpus JVNV y JNV de Xin et al. (ambos CC BY-SA 4.0) y MUSAN (Snyder et al., CC BY 4.0). No se especifica el numero de tokens ni el volumen total de horas de audio empleadas. El modelo card recomienda una configuracion de decodificacion concreta: sin prompt inicial (`initial_prompt=None`), sin condicionamiento sobre texto previo (`condition_on_previous_text=False`) y descartando segmentos con `no_speech_prob` superior a 0,95.

## Capacidades

- Transcripcion de audio en japones a texto, tarea principal del modelo.
- Reconocimiento de habla conversacional y narrativa, con enfasis en dominios como novelas visuales y voz emocional gracias a los corpus JVNV y JNV.
- Procesamiento de audio con ruido de fondo, ya que MUSAN se empleo en el entrenamiento.
- Inferencia optimizada mediante CTranslate2 y faster-whisper, con soporte para ejecucion en CPU y GPU.
- No se documentan capacidades de traduccion, diarizacion de hablantes, tool calling ni razonamiento multi-paso; es un modelo puramente ASR.
- Capacidad multilingue limitada al japones segun la model card.

## Casos de uso

- Transcripcion de contenido audiovisual japones: el modelo puede transcribir episodios, entrevistas o videos con habla natural gracias al entrenamiento sobre ReazonSpeech v2 y su ventana de 30 segundos por segmento.
- Subtitulado de novelas visuales y videojuegos: el fine-tuning sobre el dataset OOPPEENN y los corpus de voz emocional lo hace adecuado para transcribir dialogos con entonacion expresiva.
- Generacion de subtitulos en pipelines de streaming: la inferencia con faster-whisper y CTranslate2 permite procesar audio en tiempo casi real en CPU, lo que facilita despliegues sin GPU dedicada.
- Archivado y busqueda de audio corporativo: transcripcion por lotes de reuniones o llamadas en japones para indexacion y busqueda posterior.
- Investigacion en ASR japones: el modelo sirve como punto de partida para experimentos de fine-tuning adicional o evaluacion de tecnicas de decodificacion, dado que el decodificador es la unica parte ajustada.
- Preprocesamiento de datasets de voz: transcripcion automatica de grandes volumenes de audio japones para construir corpus etiquetados o filtrar datos de entrenamiento.
- Asistentes de voz para nichos narrativos: integracion en aplicaciones de ficcion interactiva o audiolibros donde el habla emocional y los dialogos son frecuentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de aproximadamente 760M de parametros en formato CTranslate2, la inferencia cabe en menos de 4 GB de memoria en la mayoria de configuraciones; el repositorio ocupa 1,5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 4060) es suficiente; GPU de datacenter como A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: faster-whisper con backend CTranslate2 es la via principal; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Kodama-1 | aproximadamente 760M | 30 s por segmento (Whisper) | ja | CC BY-SA 4.0 | CTranslate2 |
| whisper-ja-760M (base) | aproximadamente 760M | 30 s por segmento (Whisper) | ja | Apache 2.0 | safetensors (transformers) |
| Whisper large-v3 | aproximadamente 1550M | 30 s por segmento (Whisper) | multilingue | MIT | safetensors, CTranslate2, GGUF |

La comparativa con Whisper large-v3 se incluye por categoria de tarea (ASR) y no por tamano; no se dispone de datos de rendimiento comparativo entre Kodama-1 y estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta japones; no es adecuado para otros idiomas.
- Al ser un fine-tuning del decodificador, conserva los sesgos y limitaciones del modelo base whisper-ja-760M, que no se documentan en detalle.
- Riesgo de alucinacion inherente a los modelos Whisper, especialmente en segmentos con silencio o ruido; el autor mitiga parcialmente este riesgo con el filtro de `no_speech_prob` superior a 0,95.
- La licencia CC BY-SA 4.0 exige atribucion y compartir bajo la misma licencia las obras derivadas, lo que puede ser restrictivo para uso comercial propietario.
- El modelo se distribuye solo en formato CTranslate2, lo que limita su uso a faster-whisper y complica la integracion con ecosistemas basados en transformers.
- No se especifican los volumenes de datos de entrenamiento ni las metricas de evaluacion, lo que dificulta estimar su calidad frente a alternativas.
- El uso de ReazonSpeech v2 se ampara en el articulo 30-4 de la ley japonesa de derechos de autor; los usuarios en otras jurisdicciones deben verificar la legalidad de ese uso.
- El modelo tiene muy pocas descargas y likes en el momento de la ficha, lo que sugiere una validacion comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yamabiko-ASR/kodama-1
- Modelo base whisper-ja-760M: https://huggingface.co/efwkjn/whisper-ja-760M
- ReazonSpeech: https://research.reazon.jp/projects/ReazonSpeech/
- Dataset OOPPEENN visual-novel: https://huggingface.co/datasets/OOPPEENN/56697375616C4E6F76656C5F44617461736574
- Paper JVNV (Xin et al.): https://arxiv.org/abs/2310.06072
- Paper JNV (Xin et al.): https://arxiv.org/abs/2305.12445
- MUSAN (Snyder et al.): https://www.openslr.org/17/
- faster-whisper: no disponible en la informacion proporcionada
- CTranslate2: no disponible en la informacion proporcionada
