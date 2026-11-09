# subtitleking/kingabzpro-whisper-large-v3-urdu-onnx

## Resumen

`subtitleking/kingabzpro-whisper-large-v3-urdu-onnx` es una conversión a ONNX del checkpoint `kingabzpro/whisper-large-v3-urdu`, un fine-tuning de Whisper large-v3 sobre el corpus Common Voice 17.0 en urdu. El modelo original lo desarrolla Abid Ali Awan (kingabzpro); este repositorio, publicado por subtitleking, se limita a cambiar el formato de los pesos para permitir inferencia en navegador mediante Transformers.js sobre WebGPU, con el objetivo declarado de alimentar la herramienta SubtitleKing.

La arquitectura subyacente es la de Whisper large-v3: un transformer encoder-decoder de tipo secuencia-a-secuencia orientado a reconocimiento automático del habla, con un vocabulario multilingüe y una ventana de audio de 30 segundos por segmento. El repositorio incluye un encoder en fp16 y un decoder fusionado cuantizado a 4 bits con past key values, lo que reduce el peso total del artefacto a unos 2,1 GB.

Su relevancia es acotada pero específica: cubre un idioma con poca representación en modelos ASR (urdu) y lo empaqueta en un formato ejecutable del lado del cliente, sin backend GPU dedicado. Es útil para quien necesite transcripción de urdu en aplicaciones web con WebGPU, y poco interesante para quien busque un modelo ASR generalista o con benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) |
| Parametros totales | no disponible (el modelo base es Whisper large-v3; el recuento exacto no figura en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; Whisper procesa ventanas de audio de 30 s por segmento |
| Tipos de cuantizacion | Encoder fp16 con I/O fp32; decoder fusionado 4-bit (MatMul, bloque 32, simetrico) |
| Idiomas soportados | urdu (ur) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/encoder_model_fp16.onnx`, `onnx/decoder_model_merged_q4.onnx`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper large-v3: encoder de audio seguido de decoder autorregresivo, entrenado originalmente por OpenAI para transcripción y traducción de voz multilingüe. El fine-tuning del checkpoint base lo realizó kingabzpro sobre Common Voice 17.0 en urdu, según la model card del repositorio. No se detalla en la información disponible el número de tokens de audio, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; en el caso de Whisper, el pipeline habitual es supervisado sobre pares audio-transcripción, pero no se confirma aquí.

La contribución técnica de este repositorio es la exportación: se usó Optimum ONNX con la tarea `automatic-speech-recognition-with-past`, encoder en fp16 con entradas y salidas fp32, y decoder fusionado con past key values cuantizado a 4 bits mediante MatMul con bloque de 32 y simetría. El proceso es reproducible con el directorio `tools/convert-whisper/` del repositorio SubtitleKing. No se documentan innovaciones de decodificación especulativa ni atención lineal.

## Capacidades

- Reconocimiento automático del habla en urdu a partir de audio de hasta 30 segundos por segmento.
- Transcripción de audio a texto con el tokenizer y los configs del checkpoint original.
- Inferencia en navegador mediante Transformers.js sobre WebGPU, sin servidor dedicado.
- Ejecución con decoder cuantizado a 4 bits, lo que reduce el peso del artefacto a ~2,1 GB.
- Soporte de decodificación con past key values (decoder fusionado), necesaria para generación autorregresiva eficiente.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio de salida ni modo thinking.
- Capacidad multilingüe limitada al urdu según la etiqueta de idioma del repositorio.

## Casos de uso

- Subtitulado en urdu en el navegador: la integración con Transformers.js y WebGPU permite transcribir audio del usuario directamente en el cliente, sin enviar el audio a un servidor; encaja en herramientas de subtitulado como SubtitleKing.
- Transcripción de entrevistas y notas de voz en urdu: el modelo procesa segmentos de 30 s y devuelve texto, útil para periodistas o investigadores que trabajen con material en urdu y quieran una primera transcripción automática.
- Accesibilidad para contenido audiovisual en urdu: generación de subtítulos para vídeos educativos o divulgativos, con revisión humana posterior dado el riesgo de error del modelo.
- Archivado y búsqueda de audio: transcripción por lotes de grabaciones en urdu para indexar y buscar por texto en archivos históricos o de atención al cliente.
- Aplicaciones web offline-first: al ejecutarse en el navegador con ONNX, permite transcripción local en equipos con WebGPU sin depender de conectividad ni de APIs de terceros.
- Prototipado rápido de ASR en urdu: sirve para validar una idea de producto o un flujo de subtitulado antes de invertir en infraestructura GPU propia, gracias a su licencia Apache-2.0 y a su formato listo para el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio pesa 2,1 GB y el decoder está cuantizado a 4 bits, por lo que la huella en memoria es moderada para un modelo large-v3, pero no se aportan cifras medidas.
- GPU recomendadas: no se especifican en la información proporcionada; el modelo está pensado para WebGPU, lo que implica GPUs integradas o dedicadas compatibles con ese backend en el navegador.
- ¿Cabe en GPU de consumo? No se confirma; el formato ONNX con decoder 4 bits sugiere que sí en GPUs con WebGPU y memoria suficiente, pero no hay datos verificados.
- Opciones de despliegue: Transformers.js sobre WebGPU (vía principal); al ser ONNX, es compatible con runtimes ONNX en general, aunque no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| subtitleking/kingabzpro-whisper-large-v3-urdu-onnx | no disponible (base large-v3) | ventanas de 30 s | urdu | Apache-2.0 | ONNX (fp16 + 4-bit) |
| kingabzpro/whisper-large-v3-urdu | no disponible (base large-v3) | ventanas de 30 s | urdu | Apache-2.0 | safetensors / PyTorch |
| openai/whisper-large-v3 | no disponible en la informacion proporcionada | ventanas de 30 s | multilingüe | MIT (según el modelo original de OpenAI) | PyTorch, ONNX en conversiones de la comunidad |

La comparación con otros modelos ASR específicos de urdu no está disponible en la información proporcionada. Las diferencias verificables entre las tres filas son el formato de pesos y el alcance idiomático; no hay datos de rendimiento comparado.

## Limitaciones y advertencias

- El modelo solo está etiquetado para urdu; no se garantiza un comportamiento correcto en otros idiomas.
- No hay benchmarks publicados en este repositorio, por lo que no se puede verificar la calidad de la transcripción frente al checkpoint original ni frente a Whisper large-v3.
- Al ser una conversión de formato, cualquier sesgo o error del fine-tuning original se hereda sin cambios.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido, acentos no representados en Common Voice o segmentos largos.
- La ventana de audio por segmento es de 30 s; audios más largos requieren segmentación previa.
- El decoder está cuantizado a 4 bits, lo que puede introducir una pérdida de precisión respecto al checkpoint fp16/fp32 original; no se cuantifica esa pérdida en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero conviene citar el trabajo de Abid Ali Awan (kingabzpro) según indica la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Dependencia de WebGPU para el caso de uso principal en navegador; navegadores o equipos sin soporte no podrán ejecutarlo con el rendimiento previsto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/subtitleking/kingabzpro-whisper-large-v3-urdu-onnx
- Modelo base: https://huggingface.co/kingabzpro/whisper-large-v3-urdu
- Perfil del autor original: https://huggingface.co/kingabzpro
- Transformers.js: https://github.com/huggingface/transformers.js
- Repositorio SubtitleKing (herramienta que usa el modelo, según la model card): no disponible como enlace directo en la información proporcionada.
