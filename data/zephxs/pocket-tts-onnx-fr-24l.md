# zephxs/pocket-tts-onnx-fr-24l

## Resumen

`zephxs/pocket-tts-onnx-fr-24l` es una exportación a ONNX en cuantización int8 del variante `french_24l` del modelo de síntesis de voz `kyutai/pocket-tts`, desarrollado originalmente por Kyutai Lab. El autor de la exportación es el usuario de Hugging Face `zephxs`, que publica el modelo en formato compatible con el runtime sherpa-onnx para facilitar su despliegue en entornos de producción ligeros, incluyendo dispositivos de arquitectura ARM (aarch64).

El modelo resuelve el problema de la síntesis de voz en francés con capacidad de clonación de voz zero-shot, empaquetada en un artefacto de aproximadamente 395 MB extraídos (repositorio de 0,3 GB) que puede ejecutarse sin necesidad de un stack de deep learning completo. La exportación incorpora una intervención de "graph-surgery" sobre `encoder.onnx` para corregir un problema de terminación prematura (EOS) que truncaba el audio generado.

Es relevante porque demuestra el patrón de distribución de modelos TTS en formatos portables (ONNX + sherpa-onnx), lo que permite integrar síntesis de voz en aplicaciones sin depender de frameworks pesados. La variante de 24 capas ofrece una calidad equivalente a la de 6 capas pero con un coste computacional aproximadamente 2,3 veces mayor (RTF de 1,5 a 1,9 en aarch64 con 4 hilos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS de kyutai/pocket-tts, exportado a ONNX) |
| Parametros totales | no disponible (variante `french_24l`, 24 capas) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 |
| Idiomas soportados | frances (fr) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (compatible con sherpa-onnx) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `kyutai/pocket-tts` mas alla de que se trata de un sistema de text-to-speech con capacidad de clonacion de voz zero-shot. El artefacto publicado es una exportacion ONNX int8 del variante `french_24l`, que consta de 24 capas y se ensamblo a partir de `KevinAHM/pocket-tts-onnx` con una modificacion especifica: una "graph-surgery BOS" aplicada sobre `encoder.onnx`. Sin esa intervencion, el modelo emitia un token EOS prematuro que provocaba audio truncado.

No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La voz de clonacion por defecto es `test_wavs/030168_anchor_fr_ancine.wav`, descrita como sintetica y utilizada en modo zero-shot.

## Capacidades

- Sintesis de voz (text-to-speech) en frances.
- Clonacion de voz zero-shot a partir de una muestra de referencia.
- Exportacion ONNX int8 optimizada para el runtime sherpa-onnx.
- Ejecucion en dispositivos de arquitectura aarch64 (probado con 4 hilos).
- Integracion ligera en aplicaciones sin stack completo de deep learning.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, vision ni tool calling, al tratarse de un modelo TTS.

## Casos de uso

- Sintesis de voz para asistentes en frances: el modelo genera audio a partir de texto con una voz clonada de referencia, adecuado para interfaces conversacionales que requieran respuestas habladas en frances.
- Lectura de contenido en aplicaciones moviles: al exportarse a ONNX int8 y ejecutarse en aarch64, puede integrarse en apps Android o dispositivos embebidos para leer articulos o notificaciones.
- Generacion de audiolibros o podcasts: la clonacion zero-shot permite mantener una voz consistente a lo largo de textos largos, aunque el RTF de 1,5 a 1,9 implica que la generacion es mas lenta que tiempo real en el hardware probado.
- Accesibilidad para personas con discapacidad visual: conversion de texto a voz en frances dentro de lectores de pantalla o herramientas de asistencia, con despliegue local sin dependencia de servicios en la nube.
- Doblaje y localizacion de contenido: uso de la clonacion de voz para generar pistas de audio en frances a partir de guiones, integrado en pipelines de produccion con sherpa-onnx.
- Sistemas de respuesta vocal en telefonia o IVR: el tamano reducido del artefacto (~395 MB) y el formato ONNX permiten desplegar el modelo en servidores modestos para generar mensajes de voz dinamicos en frances.
- Prototipado de interfaces de voz: la disponibilidad en sherpa-onnx facilita pruebas rapidas de TTS en frances sin necesidad de infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento proporcionado es el RTF (real-time factor) en dispositivo aarch64 con 4 hilos, de aproximadamente 1,5 a 1,9, lo que supone un rendimiento unas 2,3 veces mas lento que el variante de 6 capas (`zephxs/pocket-tts-onnx-fr-6l`) con calidad equivalente.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo se distribuye en ONNX int8 con un tamano de artefacto de aproximadamente 395 MB extraidos, lo que sugiere un consumo de memoria modesto.
- GPU recomendadas: no se especifican; el autor reporta pruebas en CPU aarch64 con 4 hilos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el formato ONNX y el tamano reducido hacen plausible su ejecucion en CPU y en GPUs de gama baja, pero no hay datos que lo verifiquen.
- Opciones de despliegue: sherpa-onnx (runtime principal), al ser una exportacion ONNX int8.
- Latencia y throughput: RTF de ~1,5 a 1,9 en aarch64 con 4 hilos, es decir, la sintesis es mas lenta que tiempo real en ese hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| zephxs/pocket-tts-onnx-fr-24l | no disponible (24 capas) | no disponible | fr | CC-BY-4.0 | ONNX int8 | RTF ~1,5-1,9 en aarch64; clonacion zero-shot |
| zephxs/pocket-tts-onnx-fr-6l | no disponible (6 capas) | no disponible | fr | CC-BY-4.0 (presumible, no confirmado) | ONNX int8 | ~2,3x mas rapido que el 24L, calidad equivalente segun el autor |
| kyutai/pocket-tts | no disponible | no disponible | no disponible | CC-BY-4.0 | no disponible | Modelo base original de Kyutai Lab |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en TTS en frances; no soporta otros idiomas ni tareas de texto.
- La clonacion de voz zero-shot conlleva riesgos de uso indebido (suplantacion de identidad, deepfakes de audio); la licencia CC-BY-4.0 no impone restricciones eticas adicionales, por lo que la responsabilidad recae en el integrador.
- El RTF de 1,5 a 1,9 en aarch64 con 4 hilos implica que la generacion es mas lenta que tiempo real en ese hardware, lo que limita su uso en escenarios de baja latencia sin hardware mas potente.
- La correccion "graph-surgery BOS" sobre `encoder.onnx` es necesaria para evitar audio truncado; usar el modelo sin esa intervencion produce salidas incompletas.
- No se documentan sesgos especificos del modelo ni tasas de alucinacion o artefactos de audio medidos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion practicamente nula y ausencia de validacion por parte de la comunidad.
- No hay informacion sobre el rendimiento en GPU ni sobre latencias en otros hardware distintos de aarch64.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zephxs/pocket-tts-onnx-fr-24l
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Variante de 6 capas: https://huggingface.co/zephxs/pocket-tts-onnx-fr-6l
- Exportacion ONNX de referencia: https://huggingface.co/KevinAHM/pocket-tts-onnx
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
