# TujiaNLP/tujia-xlsr53-v03f

## Resumen

tujia-xlsr53-v03f es un codificador (encoder) wav2vec2 afinado por TujiaNLP para la extraccion de caracteristicas acusticas del tujia, una lengua sino-tibetana hablada en la provincia de Hunan (China). El modelo parte de `facebook/wav2vec2-xlsr-53-espeak-cv-ft` y ha sido reentrenado sobre habla leida en tujia para producir representaciones frame-level de 1024 dimensiones a 50 Hz, manteniendo la misma interfaz que el modelo base.

No se trata de un sistema de reconocimiento de voz autonomo: es exclusivamente el extractor de caracteristicas que consume el reconocedor silabico `tujia-ctc v0.3`. El autor advierte explicitamente de que los tres encoders publicados en el proyecto (base, v0.2 y v0.3) no son intercambiables y que mezclar cabezales con encoders distintos degrada la precision de forma sustancial, ya que cada cabezal se entreno contra las caracteristicas de un unico encoder.

Su relevancia radica en el caracter de recurso linguistico de bajo uso: el tujia cuenta con pocos hablantes y escasisimos recursos computacionales publicos. Este encoder forma parte de una cadena de herramientas (encoder mas cabezal CTC) orientada a la investigacion en ASR para lenguas minoritarias, con licencia restringida a uso de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer convolucional + encoder de atencion), fine-tune de `facebook/wav2vec2-xlsr-53-espeak-cv-ft` |
| Parametros totales | 315.438.720 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de extraccion de caracteristicas; la ventana practica depende del audio de entrada) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; no se documentan variantes GGUF, INT8 ni otras) |
| Idiomas soportados | tujia (codigo `tji`), dialecto septentrional |
| Licencia | research-use-only (pesos afinados); los pesos upstream son Apache-2.0 y requieren atribucion |
| Formato de pesos | safetensors (`model.safetensors`, ~1,26 GB en fp32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec2: un extractor convolucional que convierte la forma de onda en representaciones latentes y un encoder transformer que produce caracteristicas contextualizadas. La salida son vectores de 1024 dimensiones por frame a 50 Hz, con la misma interfaz que el modelo base, de modo que puede cargarse con `Wav2Vec2Model` de la libreria transformers sin adaptaciones.

El entrenamiento consistio en el fine-tune del encoder de la ejecucion `v03f` sobre habla leida en tujia. La model card no detalla el numero de horas de audio, el numero de tokens procesados, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO (no procede en un encoder). Tampoco se documentan innovaciones tecnicas adicionales mas alla del propio fine-tune. El modelo no incluye cabezal de clasificacion: es un extractor puro de caracteristicas.

## Capacidades

- Extraccion de caracteristicas acusticas frame-level (1024 dimensiones a 50 Hz) a partir de audio en tujia.
- Interfaz identica a `facebook/wav2vec2-xlsr-53-espeak-cv-ft`, lo que permite sustituirlo en pipelines existentes de transformers.
- Integracion como dependencia del reconocedor silabico `tujia-ctc v0.3` mediante el script `fetch_encoder.sh`.
- No genera transcripciones por si mismo: carece de cabezal CTC o de decodificador.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No ofrece capacidades de vision, audio generativo ni modo de pensamiento.
- Capacidad multilingue limitada al tujia; no se documenta transferencia a otras lenguas.

## Casos de uso

- Reconocimiento de voz para tujia en investigacion: el encoder se combina con el cabezal `tujia-ctc v0.3` para obtener transcripciones silabicas de habla leida, siendo el unico uso previsto por el autor.
- Documentacion linguistica de campo: permite procesar grabaciones de hablantes nativos y obtener representaciones acusticas reutilizables para anotacion asistida y analisis fonetico.
- Extraccion de embeddings para clasificacion downstream: las caracteristicas de 1024 dimensiones pueden alimentar clasificadores de dialecto, genero o calidad de audio entrenados sobre el corpus tujia.
- Investigacion comparada en lenguas de bajos recursos: sirve como punto de referencia para estudiar tecnicas de fine-tune de XLSR-53 sobre lenguas sino-tibetanas con pocos datos.
- Reproduccion de experimentos: al fijar el encoder exacto de la ejecucion `v03f`, permite replicar los resultados del reconocedor v0.3 sin ambiguedad de versiones.
- Analisis de similitud acustica entre segmentos: los embeddings por frame posibilitan busquedas por similitud y alineamientos dentro de corpus de tujia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de error (WER/CER), comparaciones con el encoder base ni metricas de ninguna clase.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB solo para pesos, mas activaciones; en la practica cabe en cualquier GPU con 4 GB o mas.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU moderna es suficiente (RTX 3060, RTX 4090, A100, H100). Una GPU de consumo de gama media es mas que suficiente.
- CPU: la inferencia en CPU es viable para audio de duracion moderada, aunque el throughput no esta documentado.
- Opciones de despliegue: transformers (`Wav2Vec2Model`), pipeline `feature-extraction`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un encoder de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Uso |
|---|---|---|---|---|---|
| tujia-xlsr53-v03f | 315,4 M | no disponible | tujia (tji) | research-use-only | Encoder para ASR de tujia v0.3 |
| facebook/wav2vec2-xlsr-53-espeak-cv-ft | ~315 M | no disponible | multilingue (53 lenguas) | Apache-2.0 | Encoder base upstream, uso general |
| TujiaNLP/tujia-xlsr53-ft | no disponible | no disponible | tujia (tji) | no disponible | Encoder para ASR de tujia v0.2, incompatible con v0.3 |

Los tres encoders comparten linaje, pero sus caracteristicas no son intercambiables; la comparacion relevante es de compatibilidad con el cabezal, no de rendimiento, ya que no hay metricas publicadas.

## Limitaciones y advertencias

- El modelo no transcribe: sin el cabezal `tujia-ctc v0.3` no produce texto.
- Incompatibilidad estricta con otros encoders del proyecto: usar el encoder base o el de v0.2 con el cabezal v0.3 degrada el reconocimiento de forma sustancial.
- Licencia research-use-only: no se concede derecho alguno sobre las grabaciones ni las transcripciones de entrenamiento, que no se distribuyen; el uso comercial no esta permitido.
- Obligacion de atribucion de los pesos upstream (Apache-2.0) al derivar de `facebook/wav2vec2-xlsr-53-espeak-cv-ft`.
- Cobertura limitada al dialecto septentrional del tujia y a habla leida; el comportamiento sobre habla espontanea, otros dialectos o ruido ambiental no esta documentado.
- Riesgo de sesgo por el corpus de entrenamiento: no se detalla la composicion demografica de los hablantes, por lo que se desconoce su robustez ante variacion de edad, genero o procedencia.
- No se documentan cuantizaciones ni optimizaciones de despliegue, lo que limita su uso en entornos de bajos recursos sin trabajo adicional.
- Proyecto con muy poca traccion (44 descargas, 1 like): soporte comunitario y mantenimiento limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TujiaNLP/tujia-xlsr53-v03f
- Proyecto padre: https://github.com/ibaibing/TujiaNLP
- Pagina del sistema ASR: https://github.com/ibaibing/tujia-asr
- Modelo base: https://huggingface.co/facebook/wav2vec2-xlsr-53-espeak-cv-ft
- Encoder de la version v0.2: https://huggingface.co/TujiaNLP/tujia-xlsr53-ft
