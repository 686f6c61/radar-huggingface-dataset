# subtitleking/oddadmix-whisper-turbo-ar-dialectal-onnx

## Resumen

oddadmix-whisper-turbo-ar-dialectal-onnx es una conversión a ONNX del checkpoint oddadmix/whisper-large-v3-turbo-arabic-dialectal-v2, un Whisper large-v3-turbo afinado por oddadmix para reconocimiento de habla en dialectos árabes. El repositorio lo publica subtitleking y su único propósito es cambiar el formato de los pesos para permitir inferencia en el navegador con Transformers.js sobre WebGPU, que es el motor que utiliza la aplicación SubtitleKing.

El modelo base parte de la arquitectura Whisper large-v3-turbo de OpenAI (transformer encoder-decoder de tipo seq2seq para ASR) y fue ajustado sobre el corpus lahgtna, de aproximadamente 255 horas de audio en distintos dialectos árabes. La conversión mantiene el encoder en fp16 con entradas y salidas fp32, y exporta el decoder fusionado (merged) con past key values cuantizado a 4 bits en las operaciones MatMul (bloque de 32, simétrico).

Es relevante porque demuestra un patrón de despliegue de ASR multilingüe completamente en el cliente: sin backend, con WebGPU y un peso total de repositorio de 1,6 GB. Para desarrolladores que necesitan transcripción de árabe dialectal en aplicaciones web, ofrece una vía directa de integración, siempre que se asuma que el trabajo de modelado y los datos provienen del checkpoint original de oddadmix.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3-turbo (transformer encoder-decoder seq2seq para ASR), exportado a ONNX |
| Parametros totales | no disponible (el modelo base Whisper large-v3-turbo tiene 809 M; no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s; no confirmado en la informacion) |
| Tipos de cuantizacion | Encoder fp16 con I/O fp32; decoder merged 4-bit (MatMul, bloque 32, simetrico) |
| Idiomas soportados | Arabe (ar), con enfasis en dialectos arabes |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/encoder_model_fp16.onnx`, `onnx/decoder_model_merged_q4.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3-turbo: un transformer encoder-decoder entrenado para transcripcion de audio, con el encoder procesando espectrogramas Mel y el decoder generando tokens de texto de forma autorregresiva. El checkpoint original fue afinado por oddadmix sobre el corpus lahgtna, de unas 255 horas de audio repartidas entre dialectos arabes, partiendo de Whisper large-v3-turbo. No se detalla en la informacion disponible la composicion exacta del corpus, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion de este repositorio es puramente de despliegue: exportacion con Optimum ONNX en modo automatic-speech-recognition-with-past, encoder en fp16 con entradas y salidas fp32, y decoder fusionado con past key values cuantizado a 4 bits en las MatMul. La conversion es reproducible mediante `tools/convert-whisper/` en el repositorio de SubtitleKing.

## Capacidades

- Reconocimiento automatico de habla (ASR) para arabe, con cobertura de dialectos arabes segun el ajuste del modelo base.
- Transcripcion de audio en el navegador mediante Transformers.js y WebGPU, sin backend.
- Inferencia con decoder cuantizado a 4 bits y encoder fp16, orientada a reducir el coste de memoria en cliente.
- Soporte de past key values en el decoder fusionado, lo que permite decodificacion autorregresiva eficiente.
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla del ASR.
- El soporte multilingue se limita al arabe segun la metadata del repositorio.

## Casos de uso

- Subtitulado en tiempo real en aplicaciones web: el modelo puede transcribir audio arabe directamente en el navegador con WebGPU, eliminando la necesidad de enviar audio a un servidor y reduciendo la latencia de red.
- Herramientas de accesibilidad para contenido en arabe dialectal: integracion en reproductores web para generar subtitulos automaticos de videos o podcasts sin infraestructura de backend.
- Transcripcion de reuniones y notas de voz en aplicaciones de productividad: al ejecutarse en cliente, el audio no sale del dispositivo, lo que simplifica el cumplimiento de privacidad.
- Procesamiento por lotes en el navegador para archivos de audio subidos por el usuario: el formato ONNX con decoder 4-bit reduce el peso descargado (repositorio de 1,6 GB) frente a una exportacion fp16 completa.
- Prototipado rapido de pipelines de ASR arabe: Transformers.js permite cargar el modelo con unas pocas lineas y evaluar la calidad del checkpoint de oddadmix antes de invertir en despliegue servidor.
- Investigacion sobre ASR dialectal en entornos sin GPU dedicada: al ejecutarse en WebGPU, permite experimentar con dialectos arabes en equipos de consumo.
- Integracion en extensiones o aplicaciones de escritorio basadas en web tech: el formato ONNX es portable a otros runtimes compatibles si se necesita salir del navegador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 1,6 GB, con encoder fp16 y decoder 4-bit, por lo que la huella en memoria es considerablemente menor que una exportacion fp16 completa.
- GPU recomendadas: no disponible; el modelo esta pensado para WebGPU en el navegador, por lo que requiere un navegador con soporte WebGPU y una GPU compatible.
- GPU de consumo: no se confirma compatibilidad con modelos concretos (RTX 4090, etc.); la viabilidad depende del soporte WebGPU del navegador y del adaptador grafico.
- Opciones de despliegue: Transformers.js sobre WebGPU es la via documentada; al ser ONNX, podria ejecutarse en otros runtimes ONNX, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| oddadmix-whisper-turbo-ar-dialectal-onnx | no disponible (base large-v3-turbo) | no disponible | Arabe (dialectal) | Apache-2.0 | ONNX |
| oddadmix/whisper-large-v3-turbo-arabic-dialectal-v2 | no disponible (base large-v3-turbo) | no disponible | Arabe (dialectal) | Apache-2.0 | safetensors (checkpoint original) |
| openai/whisper-large-v3-turbo | 809 M (segun literatura publica de OpenAI) | ventanas de 30 s | Multilingue | MIT (segun literatura publica) | safetensors, etc. |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. La diferencia principal frente al checkpoint original de oddadmix es el formato (ONNX frente a safetensors) y la cuantizacion del decoder; frente a Whisper large-v3-turbo original, la diferencia es el ajuste dialectal arabe y el empaquetado para navegador.

## Limitaciones y advertencias

- El modelo solo cubre arabe; no se documenta soporte para otros idiomas.
- Al ser un ajuste sobre dialectos arabes, el rendimiento puede variar entre dialectos y frente a arabe estandar; no hay benchmarks publicados que lo cuantifiquen.
- Riesgo de alucinacion inherente a los modelos Whisper en segmentos con ruido, silencio o audio musical; no se documenta mitigacion especifica.
- La cuantizacion 4-bit del decoder puede introducir degradacion de calidad frente al checkpoint fp16 original; no se cuantifica en la model card.
- Requiere un navegador con WebGPU y una GPU compatible; en equipos sin WebGPU el modelo no es utilizable por la via documentada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.
- La licencia Apache-2.0 permite uso comercial, pero el credito del modelado corresponde a oddadmix; se recomienda citar su trabajo.
- El autor de la conversion advierte explicitamente de que este repositorio solo cambia el formato de archivo y no aporta mejoras de calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/subtitleking/oddadmix-whisper-turbo-ar-dialectal-onnx
- Checkpoint original: https://huggingface.co/oddadmix/whisper-large-v3-turbo-arabic-dialectal-v2
- Transformers.js: https://github.com/huggingface/transformers.js
