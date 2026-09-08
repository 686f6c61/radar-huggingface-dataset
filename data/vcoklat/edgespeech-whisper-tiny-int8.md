# VCoklat/edgespeech-whisper-tiny-int8

## Resumen

El modelo `VCoklat/edgespeech-whisper-tiny-int8` es una version cuantizada en INT8 dinamico de `openai/whisper-tiny`, el modelo de reconocimiento de voz de OpenAI, adaptado por el autor VCoklat. Su principal proposito es permitir la ejecucion de reconocimiento de voz directamente en el navegador mediante ONNX Runtime WebAssembly, sin necesidad de enviar audio a un servidor. El repositorio incluye tres archivos ONNX separados: encoder, decoder y decoder con KV-cache, lo que facilita el procesamiento en streaming con baja latencia y un footprint de memoria activo de aproximadamente 56 MB.

El modelo se presenta como una solucion edge-native para aplicaciones web que necesitan transcripcion de audio en ingles de forma privada y sin dependencias de backend. Al estar basado en Whisper-tiny, mantiene la arquitectura encoder-decoder transformer original, aunque el readme no detalla el numero de parametros ni la longitud de contexto. La licencia MIT y el tamano reducido del repositorio (~103 MB) lo hacen accesible para integracion en proyectos de codigo abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (derivado de openai/whisper-tiny) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Dinamica INT8 (QuantType.QUInt8) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder_model_int8.onnx, decoder_model_int8.onnx, decoder_with_past_model_int8.onnx) |

## Arquitectura y entrenamiento

El modelo es una conversion a ONNX de `openai/whisper-tiny`, el modelo de ASR de OpenAI. La arquitectura subyacente es un transformer encoder-decoder, con el encoder procesando caracteristicas de audio y el decoder generando texto de forma autoregresiva. La cuantizacion se aplica de forma dinamica utilizando `QuantType.QUInt8`, lo que reduce el peso de los tensores de punto flotante a enteros de 8 bits. No se ha modificado el entrenamiento original: no se ofrecen datos sobre tokens de entrenamiento ni procesos de RLHF/DPO en la informacion disponible.

La innovacion tecnica destacable es la inclusion de tres archivos ONNX separados, entre ellos `decoder_with_past_model_int8.onnx`, que incorpora KV-cache para acelerar la inferencia en streaming. Esto, combinado con ONNX Runtime WebAssembly, permite ejecutar el proceso completo de reconocimiento de voz en el navegador con un footprint activo de ~56 MB, cargando solo el encoder y el decoder con KV-cache durante la inferencia.

## Capacidades

- Reconocimiento de voz (ASR) en ingles, basado en el modelo whisper-tiny de OpenAI.
- Ejecucion client-side en navegador mediante ONNX Runtime WebAssembly, sin necesidad de servidor.
- Soporte de streaming gracias al archivo `decoder_with_past_model_int8.onnx` con KV-cache.
- Optimizacion de memoria con cuantizacion INT8 dinamica.
- No se documentan capacidades de tool calling, vision, audio multilingue ni otras funciones multimodales.
- No se dispone de informacion sobre soporte de agentes o razonamiento multi-paso.

## Casos de uso

- Transcripcion de audio en tiempo real en el navegador: el modelo puede procesar microfono o archivos de audio directamente en la pagina web, generando subtitulos o texto mientras se habla. Es adecuado porque la KV-cache reduce la latencia del decoder y evita el envio de datos a un servidor.
- Asistentes de voz locales para aplicaciones web: integracion en formularios o interfaces con dictado por voz. Al ejecutarse con WASM, la privacidad se mantiene porque el audio no abandona el dispositivo.
- Subtitulado automatico de contenido multimedia en paginas web: incluir transcripcion en ingles en videos o podcasts, ideal para accesibilidad y busqueda de contenido.
- Transcripcion de reuniones en herramientas colaborativas: capturar notas de voz o grabaciones de llamadas dentro de una aplicacion web, con una carga de descarga de ~103 MB y ejecucion en memoria local.
- Analisis de notas de voz en aplicaciones de productividad: convertir notas habladas en texto para posterior procesamiento, sin depender de una API externa.
- Educacion y conferencias: transcripcion de clases o charlas en ingles con bajo coste de despliegue, ya que el modelo se puede servir estaticamente desde una CDN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Se desconoce el rendimiento en metricas como MMLU, HumanEval o GSM8K, asi como cualquier comparativa cuantitativa con otros modelos de ASR.

## Requisitos de hardware

- No requiere GPU: esta disenado para ejecutarse en el navegador mediante WebAssembly.
- Tamano de descarga del repositorio: ~103.4 MB; footprint activo en runtime: ~56 MB.
- Los archivos ONNX se pueden servir desde cualquier servidor estatico o CDN; se recomienda un navegador moderno con soporte para WebAssembly y suficiente memoria para alojar ~56 MB.
- Para despliegue en servidor seria posible usar ONNX Runtime, pero no es el objetivo declarado del proyecto.
- No se dispone de datos de latencia ni throughput. No se han documentado GPUs compatibles ni requisitos de VRAM.

## Comparativa con modelos similares

| Modelo | Cuantizacion | Formato | Tamano del repositorio | Uso previsto |
|---|---|---|---|---|
| VCoklat/edgespeech-whisper-tiny-int8 | Dinamica INT8 | ONNX | ~103.4 MB | Navegador (WASM) |
| openai/whisper-tiny | No cuantizado | no disponible | no disponible | Servidor o local |

No se dispone de datos de benchmarks para comparar el rendimiento entre el modelo cuantizado y el original. El unico dato confirmado es que este modelo deriva de `openai/whisper-tiny`, pero no se incluyen resultados de evaluacion que permitan cuantificar la diferencia de precision tras la cuantizacion.

## Limitaciones y advertencias

- Solo esta documentado el idioma ingles; no se ha validado el rendimiento en otros idiomas.
- La cuantizacion INT8 dinamica puede introducir una perdida leve de precision respecto al modelo original en punto flotante, aunque no se cuantifica en el readme.
- No se han realizado evaluaciones de sesgos en este repositorio, por lo que no se conoce su comportamiento ante diversos acentos o registros de habla.
- La dependencia de WebAssembly y ONNX Runtime limita su uso a navegadores compatibles; en entornos sin soporte WASM no funcionara.
- No se incluyen instrucciones de integracion concretas mas alla de la mencion a `edgespeech-wasm`, lo que puede dificultar su adopcion directa en aplicaciones existentes.
- No se presentan benchmarks ni metricas de calidad, por lo que no se puede confirmar su idoneidad para produccion sin pruebas previas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VCoklat/edgespeech-whisper-tiny-int8
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Modelo base openai/whisper-tiny en HuggingFace: https://huggingface.co/openai/whisper-tiny
