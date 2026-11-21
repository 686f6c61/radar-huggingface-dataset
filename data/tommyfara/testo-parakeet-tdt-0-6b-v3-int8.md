# tommyfara/testo-parakeet-tdt-0.6b-v3-int8

## Resumen

`tommyfara/testo-parakeet-tdt-0.6b-v3-int8` es una conversión a ONNX con cuantización int8 dinámica del modelo de reconocimiento automático de voz (ASR) NVIDIA Parakeet TDT 0.6B v3. El autor, tommyfara, no ha reentrenado ni ajustado el modelo: parte del export ONNX en fp32 realizado por el proyecto sherpa-onnx y aplica cuantización dinámica de los pesos `MatMul` con escalas per-channel mediante `onnxruntime.quantization.quantize_dynamic`, generando tres grafos (encoder, decoder y joiner) más el vocabulario. El resultado es un paquete listo para inferencia offline en dispositivo con sherpa-onnx bajo `model_type = nemo_transducer`.

El modelo original de NVIDIA es un transducer TDT (Token-and-Duration Transducer) de aproximadamente 0,6 mil millones de parámetros, orientado a transcripción multilingüe en 25 idiomas europeos. Esta variante int8 conserva esa cobertura idiomática y reduce el peso del repositorio a unos 0,9 GB, con un uso de memoria en ejecución de aproximadamente 1,5 GB según las notas del autor.

Su relevancia actual radica en que permite desplegar un ASR multilingüe de calidad cercana al fp32 en entornos con recursos limitados (CPU, dispositivos embebidos, portátiles) sin depender de servicios en la nube, manteniendo la licencia CC-BY-4.0 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer transducer TDT (Token-and-Duration Transducer); encoder + prediction network (decoder) + joint network |
| Parametros totales | 0,6 mil millones (aprox., segun denominacion del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamica per-channel sobre pesos MatMul (QInt8); existe tambien el export fp32 de referencia |
| Idiomas soportados | 25 idiomas: búlgaro (bg), croata (hr), checo (cs), danés (da), neerlandés (nl), inglés (en), estonio (et), finés (fi), francés (fr), alemán (de), griego (el), húngaro (hu), italiano (it), letón (lv), lituano (lt), maltés (mt), polaco (pl), portugués (pt), rumano (ro), eslovaco (sk), esloveno (sl), español (es), sueco (sv), ruso (ru), ucraniano (uk) |
| Licencia | CC-BY-4.0 (atribución a NVIDIA obligatoria) |
| Formato de pesos | ONNX int8 (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`) + `tokens.txt` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transducer TDT (Token-and-Duration Transducer), una variante de RNN-Transducer en la que el modelo predice conjuntamente tokens y duraciones, lo que permite decodificación no autorregresiva por saltos y reduce la latencia frente a transducers clásicos. El modelo se compone de tres subredes: encoder acústico, red de predicción (decoder) y red conjunta (joiner), exportadas como tres grafos ONNX independientes que sherpa-onnx orquesta en tiempo de inferencia.

Sobre el entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o ajuste supervisado) no se dispone de información en la documentación proporcionada. Esta variante concreta no introduce cambios de entrenamiento: la única modificación es la cuantización dinámica int8 de los pesos MatMul con escalas per-channel, realizada con onnxruntime 1.32.0 y onnx 1.23.2. El autor indica que, en una grabación de prueba en italiano, esta build per-channel se mantiene más cerca de la salida fp32 que la build int8 per-tensor, con un uso de memoria similar (~1,5 GB) y velocidad comparable.

## Capacidades

- Reconocimiento automático de voz offline (transcripción de audio a texto) en 25 idiomas europeos.
- Decodificación TDT con predicción conjunta de token y duración, adecuada para streaming y para procesamiento por lotes.
- Ejecución en dispositivo sin conexión a servicios externos, mediante sherpa-onnx.
- Inferencia en CPU con ONNX Runtime (soporte de `num_threads` configurable).
- Manejo de vocabulario propio mediante `tokens.txt`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio de entrada distinto de voz, ni modo de razonamiento explícito.

## Casos de uso

- Transcripción de reuniones en local: el modelo puede procesar audio de forma offline en un portátil o estación de trabajo, sin enviar grabaciones a la nube, usando sherpa-onnx con `num_threads` ajustado al número de núcleos disponibles.
- Subtitulado y actas multilingües: al cubrir 25 idiomas europeos, permite generar transcripciones de audio en inglés, alemán, francés, español, polaco, etc. con un único binario desplegado.
- Asistentes de voz en dispositivos embebidos: el formato ONNX int8 y el uso de memoria en torno a 1,5 GB lo hacen viable en mini-PC, Raspberry Pi de gama alta o equipos industriales con CPU, sin GPU dedicada.
- Procesamiento por lotes de archivos de audio: integrable en pipelines de datos para transcribir corpus de investigación o archivos históricos, ejecutando el recognizer de sherpa-onnx sobre cada fichero.
- Cumplimiento y privacidad de datos: en sectores con requisitos de residencia de datos (sanidad, legal, administración), la inferencia local evita el envío de audio a terceros.
- Herramientas de accesibilidad: dictado y transcripción en tiempo real para usuarios con dificultades de escritura, ejecutado en el propio equipo del usuario.
- Preprocesamiento para pipelines de NLP: convertir audio a texto antes de pasarlo a modelos de resumen o búsqueda, manteniendo el ASR en el mismo entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona una observación cualitativa del autor: en una grabación de prueba en italiano, la variante int8 per-channel se mantiene más cerca de la salida fp32 que la build int8 per-tensor, con memoria (~1,5 GB) y velocidad similares.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1,5 GB de memoria en ejecución según las notas del autor; el repositorio ocupa unos 0,9 GB en disco.
- GPU: no se documentan requisitos de GPU; el modelo está pensado para inferencia en CPU con ONNX Runtime.
- GPU consumer: no se especifica compatibilidad ni rendimiento en RTX 4090, RTX 3090 u otras; no disponible.
- Despliegue: sherpa-onnx (Python y otros bindings) con `OfflineRecognizer.from_transducer`, `model_type="nemo_transducer"`; también es posible usar ONNX Runtime directamente sobre los tres grafos.
- Latencia y throughput: no disponible; el autor solo indica velocidad similar a la build int8 per-tensor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| tommyfara/testo-parakeet-tdt-0.6b-v3-int8 | ~0,6 B | 25 idiomas europeos | ONNX int8 | CC-BY-4.0 | Variante cuantizada per-channel para sherpa-onnx |
| csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3 | ~0,6 B | 25 idiomas europeos | ONNX fp32 | CC-BY-4.0 | Export fp32 de referencia del mismo modelo base |
| nvidia/parakeet-tdt-0.6b-v3 | ~0,6 B | 25 idiomas europeos | NeMo (pesos originales) | CC-BY-4.0 | Modelo original de NVIDIA |

No se dispone en la información proporcionada de datos de benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- No se han documentado sesgos específicos del modelo; al ser una cuantización del original, hereda los sesgos del modelo base de NVIDIA, no evaluados aquí.
- Riesgo de alucinación en ASR: posible generación de texto no presente en el audio, especialmente en segmentos con ruido, solapamiento de hablantes o audio de baja calidad.
- Cobertura limitada a los 25 idiomas listados; no se documenta soporte de otros idiomas ni de code-switching.
- La cuantización int8 puede degradar la precisión frente al fp32 en determinadas condiciones acústicas; el autor solo aporta una comparación cualitativa en italiano.
- Licencia CC-BY-4.0: el uso comercial está permitido, pero exige atribución a NVIDIA y el cumplimiento de los términos de la licencia.
- No se documentan límites de longitud de audio, latencia garantizada ni comportamiento en streaming; conviene validar en el dominio concreto antes de producción.
- El repositorio no presenta descargas ni likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tommyfara/testo-parakeet-tdt-0.6b-v3-int8
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Export ONNX fp32 de sherpa-onnx: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
