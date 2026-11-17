# yangsu0423/SenseVoiceSmall-OV-Optimum-SDPA

## Resumen

SenseVoiceSmall-OV-Optimum-SDPA es una exportación a OpenVINO IR del modelo de reconocimiento automático de voz FunAudioLLM/SenseVoiceSmall, publicada por el usuario yangsu0423. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de pesos y grafo computacional orientada a la inferencia optimizada en hardware Intel mediante la librería openvino y el toolkit optimum-intel. El modelo base SenseVoiceSmall pertenece a la familia FunAudioLLM, desarrollada por el equipo FunAudioLLM en el ecosistema ModelScope/FunASR.

La aportación técnica de este repositorio es la exportación de la atención SANM (Self-Attention with Normalized Memory, característica de la arquitectura SenseVoice) como un nodo `ScaledDotProductAttention` (SDPA), lo que permite a OpenVINO aplicar fusiones y kernels optimizados para atención. Esta conversión procede de un pull request aún pendiente de fusión en optimum-intel (#2122), por lo que el repositorio tiene un carácter experimental y de referencia para pruebas de integración.

El repositorio incluye cuatro variantes de pesos (fp16, int8 e int4, con distintos valores de `ACTIVATIONS_SCALE_FACTOR`), con un tamaño total de 0,8 GB. Está pensado para desarrolladores que quieran desplegar ASR multilingüe de baja latencia en CPU o GPU Intel sin depender de PyTorch en tiempo de ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SenseVoice (encoder transformer con atención SANM exportada como SDPA); no disponible el detalle exacto de capas y dimensiones |
| Parametros totales | no disponible (el nombre "Small" sugiere un modelo compacto, pero no se publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16, int8, int4 (exportadas con optimum-cli) |
| Idiomas soportados | no disponible en la información proporcionada (el modelo base SenseVoiceSmall es multilingüe, pero no se detallan los idiomas) |
| Licencia | other (model-license); enlace a la licencia de FunASR: https://github.com/modelscope/FunASR/blob/main/MODEL_LICENSE |
| Formato de pesos | OpenVINO IR (fp16, int8, int4); no se incluyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo base SenseVoiceSmall es un sistema de reconocimiento automático de voz basado en transformer con una variante de atención denominada SANM, propia de la familia SenseVoice. En esta exportación, esa atención se representa como `ScaledDotProductAttention`, lo que facilita que OpenVINO aplique optimizaciones de atención (fusión de operaciones y kernels específicos) durante la inferencia. El repositorio no documenta el proceso de entrenamiento del modelo original: no se indican tokens de audio utilizados, composición del dataset, ni si hubo ajuste fino con RLHF o DPO.

La innovación técnica de este repositorio es puramente de despliegue: la exportación se realizó con `optimum-cli export openvino` usando `--trust-remote-code` y distintas precisiones de peso. Se generaron cuatro carpetas: `sensevoice-small-sdpa-scale4-fp16-ov` (recomendada para nuevas pruebas, con `ACTIVATIONS_SCALE_FACTOR` 4.0, alineada con el valor del PR #2118 ya fusionado), `sensevoice-small-sdpa-scale8-fp16-ov`, `sensevoice-small-sdpa-scale8-int8-ov` y `sensevoice-small-sdpa-scale8-int4-ov`. Las dos variantes scale8 con fp16 comparten exactamente los mismos pesos que scale4; solo difiere la opción de runtime `ACTIVATIONS_SCALE_FACTOR`, que únicamente utiliza el plugin de GPU de OpenVINO.

## Capacidades

- Reconocimiento automático de voz (ASR): tarea principal del pipeline `automatic-speech-recognition`.
- Transcripción de audio a texto con el modelo base SenseVoiceSmall.
- Inferencia optimizada en OpenVINO: ejecución en CPU y GPU Intel con pesos fp16, int8 o int4.
- Atención exportada como SDPA, lo que habilita kernels de atención fusionados en OpenVINO.
- No se documentan en este repositorio capacidades de traducción, diarización, detección de emociones, tool calling ni razonamiento multi-paso; cualquier capacidad adicional del modelo base no está confirmada en la información disponible.

## Casos de uso

- Transcripción por lotes en servidores Intel: el modelo en formato OpenVINO IR se puede ejecutar sobre CPU Xeon sin PyTorch, lo que simplifica el despliegue en infraestructura existente y reduce dependencias.
- Subtitulado en tiempo casi real en estaciones de trabajo con GPU Intel: la variante fp16 con `ACTIVATIONS_SCALE_FACTOR` 4.0 es la recomendada para pruebas nuevas y aprovecha el plugin GPU de OpenVINO.
- Despliegue en dispositivos de borde con recursos limitados: las variantes int8 e int4 reducen el tamaño de pesos y permiten ejecutar ASR en equipos con poca memoria, a costa de posible pérdida de precisión.
- Integración en pipelines de procesamiento de audio a gran escala: al ser un artefacto OpenVINO, se puede encadenar con otros modelos convertidos al mismo runtime para tareas de transcripción y análisis posterior.
- Evaluación comparativa de precisión entre cuantizaciones: el repositorio incluye fp16, int8 e int4 del mismo modelo, lo que facilita medir el impacto de la cuantización en la tasa de error de palabras (WER) en un corpus propio.
- Prototipado de asistentes de voz en entornos Intel: sirve como componente ASR dentro de una aplicación mayor, siempre que se validen los requisitos de licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio completo ocupa 0,8 GB; cada variante individual es sustancialmente menor. La variante int4 es la más ligera en memoria, seguida de int8 y fp16.
- GPU recomendadas: no se especifican modelos concretos; el autor indica que `ACTIVATIONS_SCALE_FACTOR` solo lo usa el plugin de GPU de OpenVINO, por lo que las variantes están pensadas para GPU Intel compatibles con dicho plugin.
- CPU: ejecutable en CPU mediante OpenVINO, sin requisitos de GPU.
- Cabe en GPU de consumo: no disponible la confirmación explícita; por el tamaño del repositorio (0,8 GB en total) es plausible, pero no se documenta.
- Opciones de despliegue: OpenVINO Runtime y optimum-intel; la exportación se realizó con `optimum-cli export openvino`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SenseVoiceSmall-OV-Optimum-SDPA (este) | no disponible | no disponible | OpenVINO IR (fp16/int8/int4) | other (model-license) | Exportación experimental con SDPA, PR #2122 pendiente |
| FunAudioLLM/SenseVoiceSmall (base) | no disponible | no disponible | PyTorch (formato original) | other (model-license) | Modelo original; requiere funasr/transformers |
| Otras exportaciones OpenVINO de SenseVoiceSmall | no disponible | no disponible | OpenVINO IR | según el exportador | No se dispone de información sobre alternativas comparables en la búsqueda |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con otros modelos ASR.

## Limitaciones y advertencias

- Repositorio experimental: la exportación depende del PR #2122 de optimum-intel, que está pendiente de fusión; la reproducibilidad puede verse afectada por cambios futuros en la librería.
- Sin descargas ni likes: el repositorio no tiene validación de la comunidad; no hay evidencia publicada de calidad de transcripción en estas variantes.
- Idiomas no documentados: no se especifica qué lenguas cubre esta exportación, aunque el modelo base es multilingüe.
- Riesgo de degradación por cuantización: las variantes int8 e int4 pueden aumentar la tasa de error de palabras frente a fp16; no se publican métricas que lo cuantifiquen.
- Licencia restrictiva potencial: la licencia es "other" con enlace a la licencia de FunASR; es necesario revisar sus términos antes de cualquier uso comercial.
- Sin garantías de soporte: al ser una publicación de un usuario individual, no hay mantenimiento oficial por parte de FunAudioLLM ni de Intel.
- Riesgo de alucinación en ASR: como todo sistema de reconocimiento, puede producir transcripciones incorrectas en audio con ruido, acentos o solapamientos de habla.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/yangsu0423/SenseVoiceSmall-OV-Optimum-SDPA
- Modelo base: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Licencia del modelo: https://github.com/modelscope/FunASR/blob/main/MODEL_LICENSE
- PR de optimum-intel #2122 (pendiente): https://github.com/huggingface/optimum-intel/pull/2122
- PR de optimum-intel #2118 (fusionado): https://github.com/huggingface/optimum-intel/pull/2118
