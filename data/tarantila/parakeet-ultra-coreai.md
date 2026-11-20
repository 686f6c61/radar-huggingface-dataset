# tarantila/parakeet-ultra-coreai

## Resumen

Parakeet Ultra Core AI es una conversión del modelo de reconocimiento automático del habla (ASR) `moondream/parakeet-ultra`, empaquetada por el usuario `tarantila` para su ejecución nativa en dispositivos Apple mediante el framework Core AI de iOS 27. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: el checkpoint original ha sido convertido con la receta `coreai-models` de Apple (float16, ventana estática) y compilado anticipadamente con `coreai-build` para tres generaciones de chips de iPhone e iPad, de modo que una aplicación pueda cargarlo en segundos en lugar de prepararlo en el dispositivo.

El modelo subyacente emplea una arquitectura TDT (Token-and-Duration Transducer), una variante de los transductores RNN-T habituales en ASR que predice de forma conjunta tokens y duraciones, lo que acelera la decodificación. El repositorio ocupa 4,9 GB e incluye artefactos binarios propietarios (`.aimodelc`) en lugar de pesos en safetensors o GGUF, lo que limita su uso fuera del ecosistema Apple.

Su relevancia es fundamentalmente práctica para desarrolladores de aplicaciones iOS que necesiten transcripción en el dispositivo con baja latencia y sin conexión. Al estar compilado para chips concretos y no publicar resultados de benchmarks ni detalles de entrenamiento en la información disponible, debe evaluarse como un componente de despliegue más que como un modelo de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), encoder-decoder con módulo joint |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio estática: 35 s (`h19p`, `h18p`) y 15 s (`h16p`) |
| Tipos de cuantización | float16 (única precisión publicada en la conversión) |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.aimodelc` (Core AI compilado ahead-of-time), más `voicework.json`, `processor/` y `metadata.json` |

## Arquitectura y entrenamiento

La arquitectura es un transductor TDT, compuesto por un encoder de audio, un decoder de predicción y un módulo joint que produce simultáneamente el token siguiente y su duración. Esta formulación permite emitir varios tokens por paso de decodificación, reduciendo el coste computacional frente a un RNN-T clásico. La conversión a Core AI mantiene el modelo en float16 y fija una ventana de audio estática, condición necesaria para la compilación ahead-of-time que evita la preparación en el dispositivo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones adicionales del checkpoint original `moondream/parakeet-ultra`. La model card únicamente documenta el proceso de conversión: receta `coreai-models`, compilación con `coreai-build` y organización de artefactos por familia de chip.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) sobre ventanas de 15 o 35 segundos según el dispositivo.
- Decodificación TDT con predicción conjunta de token y duración.
- Ejecución completamente local en el dispositivo, sin necesidad de conexión de red.
- Carga rápida en la aplicación gracias a la compilación ahead-of-time.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio adicional): no disponible más allá del propio ASR.

## Casos de uso

- Transcripción de notas de voz en apps iOS: el modelo procesa ventanas de 35 segundos en los chips `h19p` y `h18p`, adecuado para dictado y notas cortas sin salir del dispositivo.
- Subtitulado en directo de reuniones o clases: con ventanas de 15 segundos en el chip `h16p` (iPhone 15 Pro, iPad mini A17 Pro) puede alimentarse un pipeline de segmentación continua por bloques.
- Asistentes de voz integrados en apps: la carga en segundos permite inicializar el reconocedor al arrancar la app sin penalizar la experiencia de usuario.
- Accesibilidad: transcripción local para personas con dificultades auditivas, con la ventaja de que el audio no abandona el dispositivo.
- Procesamiento por lotes de audios cortos en iPad: la ventana de 15 segundos del `h16p` encaja con clips de mensajería y comandos de voz.
- Aplicaciones con requisitos de privacidad: al ejecutarse íntegramente en el dispositivo y no requerir red, es apto para entornos sanitarios o corporativos con datos sensibles.
- Integración en la app VoiceWork: el autor indica que este es el consumidor previsto de los artefactos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware objetivo exclusivo: iPhone 18 Pro / 18 Pro Max (`h19p`), iPhone 17 Pro / 17 Pro Max (`h18p`), iPhone 15 Pro / 15 Pro Max e iPad mini A17 Pro (`h16p`).
- VRAM estimada para inferencia: no disponible; el repositorio ocupa 4,9 GB en total, repartido entre las tres carpetas de dispositivo.
- GPU recomendadas: no aplica; el modelo está compilado para los motores neuronales y GPUs integradas de los chips Apple indicados.
- Compatibilidad con GPU de consumo (NVIDIA, AMD): no disponible; los artefactos `.aimodelc` no son ejecutables fuera de Core AI.
- Opciones de despliegue: Core AI en iOS 27 con los artefactos `encoder.aimodelc`, `decoder_step.aimodelc`, `joint.aimodelc` y `voicework.json`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Ventana / contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| tarantila/parakeet-ultra-coreai | TDT | 15-35 s (estática) | `.aimodelc` | CC-BY-4.0 | Core AI / iOS 27 |
| moondream/parakeet-ultra | TDT | no disponible | no disponible | CC-BY-4.0 (según upstream) | no disponible |
| Whisper (variantes de OpenAI) | Transformer encoder-decoder | hasta 30 s por ventana | safetensors, GGUF, etc. | MIT (variantes abiertas) | llama.cpp, whisper.cpp, vLLM, etc. |

La comparación con Whisper es orientativa por categoría (ASR de propósito general); no se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio contiene artefactos binarios compilados para chips Apple concretos; no es portable a otras plataformas ni a versiones anteriores de iOS.
- La ventana de audio es estática (15 o 35 segundos), lo que exige segmentar manualmente audios más largos.
- Solo se publica precisión float16; no hay variantes cuantizadas a int8 o int4.
- No se especifican los idiomas soportados, lo que impide garantizar cobertura multilingüe.
- No hay información sobre sesgos, tasa de alucinación ni calidad de transcripción en dominios específicos (acentos, ruido, jerga técnica).
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero debe verificarse la licencia del checkpoint upstream y las condiciones de uso de Core AI de Apple.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay validación comunitaria ni informes de producción.
- Al ser una conversión de terceros, la responsabilidad sobre la calidad del modelo original recae en `moondream`, no en el autor de la conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tarantila/parakeet-ultra-coreai
- Modelo base: https://huggingface.co/moondream/parakeet-ultra
- Receta de conversión de Apple: https://github.com/apple/coreai-models
