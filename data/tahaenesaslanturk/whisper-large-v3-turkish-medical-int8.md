# tahaenesaslanturk/whisper-large-v3-turkish-medical-int8

## Resumen

whisper-large-v3-turkish-medical-int8 es una conversión a ONNX con cuantización int8 de `turkmedstt/whisper-large-v3-turkish-medical`, un ajuste fino del modelo Whisper large-v3 de OpenAI orientado a la transcripción de audio médico en turco. Lo publica el usuario tahaenesaslanturk y su propósito no es entrenar un modelo nuevo, sino empaquetar el existente en un formato optimizado para inferencia en CPU mediante la librería sherpa-onnx, reduciendo el peso y el coste computacional para su integración en aplicaciones de escritorio.

El modelo resuelve el problema de desplegar un sistema de reconocimiento automático del habla (ASR) especializado en dominio médico turco sin necesidad de GPU ni de un stack de Python pesado. Al estar en formato ONNX int8, puede ejecutarse con el runtime sherpa-onnx en entornos locales, lo que facilita su inclusión en herramientas de dictado clínico o transcripción de consultas siempre que se respeten las advertencias de uso del modelo original.

Es relevante ahora porque la cuantización int8 de modelos grandes de ASR permite llevar Whisper large-v3 a hardware modesto manteniendo una degradación de precisión controlada: según la evaluación del autor, el WER sobre audio sintético pasa del 22,97 % en fp32 al 24,80 % en int8. No obstante, se trata de una conversión sin entrenamiento adicional y con validación limitada a voz sintética, por lo que su utilidad real en producción clínica está acotada por las limitaciones que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), exportado a ONNX y cuantizado dinámicamente a int8 |
| Parametros totales | no disponible (el repo pesa 1,1 GB; el decoder int8 ocupa 1.008.196.358 bytes y el encoder int8 766.590.150 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper large-v3 trabaja con ventanas de audio de 30 s; no se especifica en la model card) |
| Tipos de cuantizacion | int8 (cuantización dinámica); el modelo base en fp32 está disponible por separado |
| Idiomas soportados | turco (tr) |
| Licencia | Apache-2.0 (modelo base Whisper large-v3 bajo MIT, Copyright (c) 2022 OpenAI) |
| Formato de pesos | ONNX int8 (`encoder.int8.onnx`, `decoder.int8.onnx`) más fichero `tokens.txt`; empaquetado en tar.bz2 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3 de OpenAI: un transformer encoder-decoder entrenado para reconocimiento automático del habla y traducción, con entrada de audio en ventanas de 30 segundos y tokenización multilingüe. Sobre esa base, `turkmedstt/whisper-large-v3-turkish-medical` es un ajuste fino orientado al dominio médico en turco. La model card del modelo original indica que el entrenamiento médico se realizó con datos TTS sintéticos, no con voz real de pacientes, lo que constituye una limitación importante a la hora de interpretar sus métricas.

Esta versión concreta no añade entrenamiento ni ajuste fino. El proceso descrito es puramente de conversión: los pesos fp32 del modelo fuente (revisión `0e74ec8ad2e4bd62a1e8d28eda9b7455063a2cbc`) se transformaron al layout de openai-whisper, se exportaron con el script de exportación de sherpa-onnx 1.13.8 (commit `11afbd009a7f8c08f4bcf2fc1b265d0df4670fbf`, parcheado localmente para cargar el checkpoint convertido) y se cuantizaron dinámicamente a int8. Las herramientas empleadas incluyen forge 0.1.0, onnx 1.23.2, onnxruntime 1.31.0, torch 2.8.0, transformers 4.57.6 y openai-whisper 20250625, entre otras.

## Capacidades

- Reconocimiento automático del habla en turco (`task="transcribe"`), orientado a vocabulario y locuciones del ámbito médico.
- Transcripción de audio de una sola voz en ventanas de hasta 30 segundos, conforme al diseño de Whisper large-v3.
- Ejecución en CPU mediante sherpa-onnx con decodificación greedy (`decoding_method="greedy_search"`).
- Soporte de decodificación con `num_threads` configurable (el autor reporta 4 hilos en su evaluación).
- Formato ONNX int8 que permite despliegue en aplicaciones nativas sin depender de PyTorch.
- No se documentan capacidades de traducción, tool calling, agentes, visión ni audio en tiempo real más allá de la transcripción offline.

## Casos de uso

- Dictado clínico asistido en turco: transcripción de notas de voz de profesionales sanitarios para generar borradores de texto que después revisa una persona; el modelo está ajustado al dominio médico y corre en CPU, lo que encaja en portátiles de consulta.
- Herramientas de escritorio de transcripción offline: integración vía sherpa-onnx en aplicaciones nativas (el autor menciona la app HI Scribe) para procesar audio localmente sin enviar datos a la nube.
- Preprocesado de documentación médica hablada: conversión de grabaciones de sesiones o seminarios clínicos en turco a texto para su indexación posterior, con revisión humana obligatoria.
- Prototipado de asistentes de voz sanitarios: uso como componente ASR en pipelines de investigación que necesiten un modelo turco especializado y ligero, aceptando las limitaciones de validación.
- Transcripción en entornos con recursos limitados: despliegue en equipos sin GPU gracias al formato int8 y al runtime ONNX, con un factor de tiempo real de 1,006 medido en un Apple M3 Max con 4 hilos.
- Evaluación comparativa de cuantización: servir como referencia para estudiar la degradación int8 frente al modelo fp32 en tareas ASR de dominio específico (WER 24,80 % frente a 22,97 % en el conjunto sintético del autor).

## Benchmarks y rendimiento

Evaluación automática del autor sobre 51 clips de TTS sintético de una sola voz (297 s), comparando esta conversión int8 con el modelo fuente en fp32:

| Metrica | Modelo fuente (fp32, HF) | Este modelo int8 |
|---|---|---|
| WER frente al texto de referencia | 22,97 % | 24,80 % |
| CER frente al texto de referencia | 8,94 % | 9,45 % |
| Factor de tiempo real (RTF) | no disponible | 1,006 con 4 hilos en Apple M3 Max |

El criterio de aceptación del autor (incremento absoluto de WER <= 0,02) se cumple. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni métricas sobre voz real, ruido, campo lejano o audio solapado.

## Requisitos de hardware

- VRAM: no aplica para el despliegue previsto; el modelo está pensado para ejecución en CPU con ONNX Runtime.
- Tamaño en disco: aproximadamente 1,1 GB para el paquete completo (encoder int8 de 766 MB, decoder int8 de 1.008 MB y fichero de tokens de 817 KB).
- GPU recomendadas: no disponibles; no se documenta soporte GPU para esta conversión concreta.
- Cabe en hardware de consumo: sí, al ejecutarse en CPU; el autor midió RTF 1,006 con 4 hilos en un Apple M3 Max.
- Opciones de despliegue: sherpa-onnx (Python wheel 1.13.8 y módulo sherpa-onnx-node 1.13.8), con `OfflineRecognizer.from_whisper`, `language="tr"`, `task="transcribe"`, `decoding_method="greedy_search"` y `provider="cpu"`.
- Latencia y throughput: RTF cercano a 1,0 en la máquina de referencia, es decir, procesamiento aproximadamente en tiempo real; no se ofrecen cifras para otro hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-large-v3-turkish-medical-int8 (este) | no disponible (repo 1,1 GB) | Ventanas de 30 s (diseño Whisper) | WER 24,80 % en TTS sintético turco | Apache-2.0 | ONNX int8 para sherpa-onnx |
| turkmedstt/whisper-large-v3-turkish-medical (fuente) | no disponible | Ventanas de 30 s | WER 22,97 % en el mismo conjunto | Apache-2.0 | Pesos fp32 en HuggingFace |
| openai/whisper-large-v3 | 1.550 M (aproximado, según la arquitectura original de OpenAI; no confirmado en la información disponible) | Ventanas de 30 s | No evaluado en este conjunto; multilingüe generalista | MIT | Pesos originales y múltiples formatos de la comunidad |

No se dispone de datos comparativos con otros modelos ASR turcos en la información proporcionada.

## Limitaciones y advertencias

- No es un dispositivo médico y no debe usarse para decisiones clínicas; las transcripciones requieren revisión humana antes de incorporarse a historiales o flujos clínicos.
- El modelo fuente se entrenó con datos TTS sintéticos, no con voz real de pacientes; los resultados en dominio sintético son un límite superior y no equivalen al rendimiento con habla real.
- La evaluación de esta conversión se hizo solo con 51 clips sintéticos de una única voz (macOS `say`), sin variación de hablante, acento, canal de grabación ni ruido; el WER es una cota optimista para comparación relativa.
- No se probaron audio ruidoso, de campo lejano, solapado ni de formato largo (más de 30 s).
- No se verificó la paridad entre el wheel de Python de sherpa-onnx y el módulo sherpa-onnx-node usado en la aplicación del autor, aunque se espera equivalencia por compartir el núcleo en C++.
- El conjunto de test es pequeño: una diferencia de una o dos palabras mueve el WER alrededor de un punto porcentual.
- El factor de tiempo real depende de la máquina, el número de hilos y la carga; no es una promesa para otro hardware.
- El modelo solo soporta turco y no se documentan capacidades multilingües en esta conversión.
- Riesgo de alucinación y errores de transcripción inherentes a los modelos ASR, agravados por la cuantización int8 y por la falta de validación clínica.
- La licencia Apache-2.0 permite uso comercial, pero se deben conservar los avisos de atribución a OpenAI (MIT) y al modelo fuente; no se identifican restricciones adicionales en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tahaenesaslanturk/whisper-large-v3-turkish-medical-int8
- Modelo base: https://huggingface.co/turkmedstt/whisper-large-v3-turkish-medical
- Whisper large-v3 de OpenAI: https://huggingface.co/openai/whisper-large-v3
- Repositorio de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Repositorio de openai-whisper: https://github.com/openai/whisper
- Commit del script de exportación citado: https://github.com/k2-fsa/sherpa-onnx/commit/11afbd009a7f8c08f4bcf2fc1b265d0df4670fbf
