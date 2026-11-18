# threebobss/whisper-base-int8-sherpa

## Resumen

Whisper base int8 (sherpa-onnx layout) es una redistribución de los pesos del modelo Whisper base de OpenAI exportados a ONNX y cuantizados a int8 por el proyecto sherpa-onnx (k2-fsa). El repositorio no contiene un modelo nuevo ni entrenado por el autor: se trata de un re-host de los ficheros publicados en `csukuangfj/sherpa-onnx-whisper-base`, fijados a un commit concreto para que aplicaciones cliente puedan descargarlos de forma reproducible. El autor, `threebobss`, únicamente replica los artefactos sin modificarlos, e incluye además el modelo de detección de actividad de voz Silero VAD.

El modelo resuelve el problema de despliegue de reconocimiento automático de voz (ASR) en entornos con recursos limitados: al estar cuantizado a int8 y empaquetado en formato ONNX, puede ejecutarse en CPU sin GPU y con dependencias mínimas mediante el runtime sherpa-onnx. Whisper base es un transformer encoder-decoder de tipo seq2seq con aproximadamente 74 millones de parámetros, entrenado por OpenAI para transcripción multilingüe, traducción de voz y detección de idioma.

Su relevancia actual radica en que ofrece una vía práctica para integrar ASR offline en aplicaciones de escritorio, móviles o embebidas: el paquete completo ocupa unos 161 MB, el encoder int8 pesa 29 MB y el decoder int8 130 MB, y la licencia MIT permite uso comercial sin restricciones adicionales. No obstante, al ser un re-host de terceros, no aporta mejoras de rendimiento ni datos de entrenamiento propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder seq2seq (Whisper base) |
| Parametros totales | ~74 millones (Whisper base, no verificado en la informacion disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper base procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | int8 (export ONNX cuantizado por sherpa-onnx) |
| Idiomas soportados | no disponible en la model card; Whisper base es multilingue por diseno, pero no se detalla la lista |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder y decoder int8), tokens en TXT, VAD en ONNX |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper base de OpenAI: un transformer encoder-decoder entrenado con pares audio-texto a gran escala para tareas de transcripcion, traduccion y deteccion de idioma. El encoder procesa espectrogramas Mel de audio (ventanas de 30 segundos) y el decoder genera tokens de texto de forma autoregresiva. Whisper base es la variante pequena de la familia, con aproximadamente 74 millones de parametros, frente a los 1.550 millones de Whisper large.

Este repositorio no aporta entrenamiento ni ajuste fino adicional. Los cambios respecto al modelo original son exclusivamente de formato: exportacion a ONNX y cuantizacion a int8 realizada por el proyecto sherpa-onnx, que reduce el tamano y acelera la inferencia en CPU a costa de una pequena perdida de precision. Se incluye tambien Silero VAD para segmentar el audio antes de la transcripcion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, ya que esos datos pertenecen a la model card original de OpenAI y no se reproducen aqui.

## Capacidades

- Transcripcion automatica de voz (speech-to-text) offline mediante el runtime sherpa-onnx.
- Deteccion de actividad de voz (VAD) integrada mediante Silero VAD para segmentar audio.
- Capacidad multilingue heredada de Whisper base (transcripcion y traduccion de voz a texto en ingles), aunque la lista concreta de idiomas no se detalla en la informacion disponible.
- Deteccion de idioma (language identification) propia de Whisper.
- Ejecucion en CPU sin GPU, con pesos int8 y dependencias minimas.
- Integracion mediante la API `OfflineWhisperModelConfig` del runtime sherpa-onnx.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio multimodal ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Transcripcion de reuniones y notas de voz en aplicaciones de escritorio: el paquete de 161 MB y la inferencia en CPU permiten transcribir ficheros de audio localmente sin enviar datos a servicios externos, usando Silero VAD para dividir la grabacion en segmentos.
- Subtitulado automatico de video en herramientas de edicion: el modelo puede generar transcripciones por segmentos y sincronizarse con la linea de tiempo, aprovechando la ventana de 30 segundos de Whisper base.
- Asistentes de voz embebidos en dispositivos con recursos limitados: al ejecutarse en CPU con ONNX int8, encaja en entornos sin GPU dedicada, como mini-PC, Raspberry Pi o portatiles modestos.
- Dictado por voz en aplicaciones de productividad: integracion mediante sherpa-onnx para convertir entrada de microfono en texto en tiempo casi real, con VAD para detectar cuando el usuario habla.
- Procesamiento por lotes de archivos de audio en pipelines de datos: transcripcion masiva de grabaciones para indexacion, busqueda o analisis, al no requerir infraestructura GPU.
- Aplicaciones de accesibilidad: conversion de voz a texto para personas con dificultades auditivas o motoras, con despliegue local que preserva la privacidad del audio.
- Prototipado rapido de sistemas ASR: al ser un re-host con commit fijo, permite reproducir entornos de desarrollo y demos sin depender de la disponibilidad de repositorios upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de WER, latencia ni throughput, y no se dispone de comparaciones numericas con otras variantes de Whisper.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso CPU; en GPU, el modelo int8 ocupa aproximadamente 160 MB de pesos, por lo que cabe holgadamente en cualquier GPU con 1 GB o mas de memoria.
- GPU recomendadas: no se especifican; cualquier GPU consumer (GTX 1050, RTX 2060, RTX 4090) puede alojar el modelo, aunque el runtime sherpa-onnx esta optimizado principalmente para CPU.
- Cabe en GPU consumer: si, con margen amplio, dado el tamano reducido de los pesos int8.
- Opciones de despliegue: sherpa-onnx (runtime principal, Apache-2.0) mediante `OfflineWhisperModelConfig`; alternativamente, los ficheros ONNX pueden cargarse con ONNX Runtime u otras herramientas compatibles, aunque no se documenta soporte oficial fuera de sherpa-onnx.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Whisper base int8 (sherpa-onnx) | ~74 M | ventanas de 30 s | int8 | MIT | ONNX |
| Whisper base (original, OpenAI) | ~74 M | ventanas de 30 s | fp16/fp32 | MIT | PyTorch |
| Whisper small (OpenAI) | ~244 M | ventanas de 30 s | fp16/fp32 | MIT | PyTorch |
| Whisper tiny (OpenAI) | ~39 M | ventanas de 30 s | fp16/fp32 | MIT | PyTorch |

La comparativa se limita a variantes de la misma familia porque no se dispone de datos de rendimiento de alternativas de otros proyectos (por ejemplo, wav2vec2 o Conformer) en la informacion proporcionada. La diferencia principal de este repositorio frente a Whisper base original es el formato ONNX int8 y el runtime sherpa-onnx, que favorecen el despliegue en CPU; no hay diferencias de arquitectura ni de entrenamiento.

## Limitaciones y advertencias

- No es un modelo original: es un re-host sin modificaciones de los ficheros de sherpa-onnx; cualquier problema de precision o compatibilidad debe atribuirse al export upstream.
- La cuantizacion int8 puede degradar la precision de transcripcion respecto al modelo fp16/fp32 original, especialmente en audio con ruido o acentos marcados.
- Whisper base es la variante pequena de la familia y presenta mayor tasa de error que Whisper medium o large en condiciones dificiles; no se recomienda para transcripcion de alta fidelidad sin evaluacion previa.
- La lista concreta de idiomas no esta documentada en la model card; aunque Whisper base es multilingue, el rendimiento por idioma no esta verificable con la informacion disponible.
- Riesgo de alucinacion: los modelos Whisper pueden generar texto plausible en segmentos de silencio o ruido; el uso de Silero VAD mitiga parcialmente este problema, pero no lo elimina.
- La licencia MIT permite uso comercial, pero debe conservarse el aviso de copyright y las licencias de terceros (Whisper, sherpa-onnx y Silero VAD) incluidas en el repositorio.
- Dependencia del runtime sherpa-onnx: fuera de ese ecosistema, la integracion de los ficheros ONNX no esta documentada oficialmente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/threebobss/whisper-base-int8-sherpa
- Repositorio upstream de sherpa-onnx: https://huggingface.co/csukuangfj/sherpa-onnx-whisper-base
- Proyecto sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Codigo y licencia de Whisper (OpenAI): https://github.com/openai/whisper
- Silero VAD: https://github.com/snakers4/silero-vad
