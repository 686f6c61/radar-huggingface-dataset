# Thunai-edge/indic-transcribe-core-int8

## Resumen

Indic-Transcribe-core-int8 es una exportacion a ONNX con cuantizacion int8 del modelo de reconocimiento automatico del habla bodhan-ai/indic-transcribe-core, desarrollado por la IITM Bodhan-AI Foundation (Bodhan AI / AI4Bharat) y construido a partir de nvidia/canary-1b-v2. Esta copia concreta la publica Thunai-edge para su uso dentro de la aplicacion Thunai Edge para Linux, que descarga los pesos y ejecuta la inferencia localmente con ONNX Runtime sobre CPU. El modelo resuelve transcripcion de audio en ingles indio y lenguas indias, sin depender de servicios en la nube.

La relevancia de esta ficha no esta en un modelo nuevo, sino en el formato de despliegue: un export int8 ONNX fragmentado en encoder, cross-attention y decoder con cache, pensado para inferencia eficiente en CPU y para distribucion de binarios verificables por SHA-256. Thunai no ha reentrenado ni ajustado los pesos; los ficheros son identicos byte a byte a la revision `b4c0fe837b08848da00a34dfebf96ccc20078c24` del export original de ChatPanel.

La informacion publicada no detalla el numero de parametros, la longitud de contexto de audio ni los idiomas exactos soportados; la model card se centra en la procedencia, la licencia y la estructura de ficheros. El repositorio ocupa 1,6 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) con decoder autorregresivo de 24 capas y cross-attention; export ONNX por etapas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada en features log-mel de 128 bandas, forma `(1, 128, T)`) |
| Tipos de cuantizacion | int8 (unico formato publicado en este repo) |
| Idiomas soportados | no disponible en la informacion; orientado a ingles indio y lenguas indias |
| Licencia | Indic Open Model License v1.0 (modelo base NVIDIA canary-1b-v2 bajo CC-BY-4.0) |
| Formato de pesos | ONNX (`encoder.onnx`, `cross_kv.onnx`, `decoder.onnx` con ficheros `.data` asociados) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura FastConformer de NVIDIA Canary, con un encoder que transforma features log-mel de 128 bandas en estados de dimension 1024 con un factor de submuestreo de 8 (de `T` a `T/8`), y un decoder autorregresivo de 24 capas que emplea cross-attention. El export ONNX separa el calculo en tres grafos: el encoder, un grafo `cross_kv` que calcula una sola vez por segmento las claves y valores de cross-attention de las 24 capas, y un `decoder` que ejecuta un paso con cache. Esta descomposicion reduce el coste por token generado y permite ejecutar el modelo en CPU con ONNX Runtime.

El front-end es el de NeMo: n_fft de 512, hop de 160 y ventana de 400 muestras, con el filterbank mel y la ventana incluidos como ficheros (`mel_fb_128x257.f32`, `window_400.f32`). No se publican en la informacion disponible datos sobre volumen de entrenamiento, composicion del dataset, ni si hubo etapas de RLHF o DPO. Thunai no ha realizado reentrenamiento ni fine-tuning: la unica transformacion respecto al modelo original es la exportacion a ONNX int8, realizada por terceros (ChatPanel) y redistribuida sin cambios.

## Capacidades

- Reconocimiento automatico del habla (ASR) sobre audio, con salida de transcripcion token a token mediante decoder autorregresivo con cache.
- Transcripcion de ingles indio y lenguas indias, segun la orientacion declarada del modelo base.
- Inferencia local en CPU mediante ONNX Runtime, sin necesidad de GPU ni de conexion a servicios externos.
- Ejecucion por segmentos con reutilizacion de las claves y valores de cross-attention, lo que abarata el procesamiento de audios largos divididos en fragmentos.
- Integracion en aplicaciones de escritorio: los ficheros se verifican por tamano y SHA-256 antes de su uso.
- No se documentan capacidades de diarizacion, traduccion, tool calling ni modos de razonamiento extendido.

## Casos de uso

- Transcripcion local de reuniones en ingles indio: la aplicacion descarga el modelo una vez y procesa el audio en la maquina del usuario, evitando enviar grabaciones a servidores externos.
- Subtitulado de contenido audiovisual en lenguas indias: el encoder acepta features log-mel de duracion variable y el decoder genera la transcripcion por segmentos, lo que encaja con pipelines de generacion de subtitulos.
- Dictado por voz en herramientas de escritorio para Linux: al ejecutarse sobre CPU con ONNX Runtime, no requiere GPU dedicada y puede integrarse en editores o asistentes de notas.
- Procesamiento por lotes de archivos de audio en entornos sin acelerador: la cuantizacion int8 reduce el coste computacional y de memoria frente al modelo en precision completa.
- Cumplimiento y privacidad en sectores regulados: al no ofrecerse como servicio alojado y ejecutarse en el equipo del usuario, facilita el tratamiento de datos sensibles sin salida a la nube.
- Distribucion de software con integridad verificable: el pinning por SHA-256 de cada fichero permite a los empaquetadores garantizar que el binario descargado coincide con la revision auditada.
- Investigacion sobre ASR de bajo consumo: sirve como referencia para comparar latencia y calidad entre el export int8 y el modelo original en FP32/FP16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario previsto; el modelo esta disenado para ejecutarse en CPU con ONNX Runtime.
- Memoria en disco: 1,6 GB para el repositorio completo (encoder, cross_kv, decoder y ficheros auxiliares).
- GPU recomendadas: no disponibles; no se documenta soporte GPU en esta ficha.
- Compatibilidad con GPU de consumo: no documentada; el objetivo declarado es la ejecucion en CPU.
- Opciones de despliegue: ONNX Runtime en CPU dentro de Thunai Edge para Linux; el export podria cargarse con otros runtimes compatibles con ONNX, aunque no se detalla en la informacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Thunai-edge/indic-transcribe-core-int8 | no disponible | no disponible | Indic Open Model License v1.0 | ONNX int8 | Copia del export de ChatPanel; uso local en CPU |
| bodhan-ai/indic-transcribe-core | no disponible | no disponible | Indic Open Model License v1.0 | no disponible | Modelo base de Bodhan AI / AI4Bharat |
| nvidia/canary-1b-v2 | no disponible | no disponible | CC-BY-4.0 | no disponible | Modelo del que deriva el base; licencia mas permisiva |
| ChatPanel/indic-transcribe-core-int8 | no disponible | no disponible | Indic Open Model License v1.0 | ONNX int8 | Export original del que esta copia es identico byte a byte |

## Limitaciones y advertencias

- La licencia Indic Open Model License v1.0 permite uso comercial autoalojado, pero el acceso alojado o por API a terceros requiere aprobacion previa por escrito de Bodhan AI.
- Los productos que usen el modelo deben mostrar el aviso "Built with Indic-Transcribe-core from Bodhan AI / AI4Bharat".
- Esta copia no implica respaldo de Bodhan AI, AI4Bharat ni IIT Madras hacia Thunai o Thunai Edge.
- El modelo base NVIDIA canary-1b-v2 esta bajo CC-BY-4.0, con obligaciones de atribucion adicionales.
- No se documentan sesgos conocidos, tasas de alucinacion ni limitaciones de idioma concretas en la informacion disponible.
- La cobertura linguistica exacta no esta detallada; la orientacion declarada es ingles indio y lenguas indias, sin lista cerrada.
- No se especifican requisitos de duracion maxima de audio ni comportamiento en segmentos muy largos.
- La cuantizacion int8 puede degradar la precision frente al modelo en precision completa; no se publican metricas comparativas.
- El repositorio esta pensado como artefacto de distribucion: no deben renombrarse, editarse ni eliminarse ficheros, ni reescribirse el historial, porque las compilaciones de la aplicacion descargan desde un commit fijo.
- No se ofrecen resultados de benchmarks ni comparativas de calidad con alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Thunai-edge/indic-transcribe-core-int8
- Export original: https://huggingface.co/ChatPanel/indic-transcribe-core-int8
- Modelo base: https://huggingface.co/bodhan-ai/indic-transcribe-core
- Modelo origen de NVIDIA: https://huggingface.co/nvidia/canary-1b-v2
