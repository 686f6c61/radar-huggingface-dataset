# subtitleking/ivrit-whisper-large-v3-turbo-onnx

## Resumen

ivrit-whisper-large-v3-turbo-onnx es una conversion a ONNX del checkpoint ivrit-ai/whisper-large-v3-turbo, un ajuste fino de Whisper large-v3-turbo especializado en reconocimiento automatico del habla en hebreo. Lo desarrolla el usuario subtitleking, que unicamente cambia el formato de los pesos para permitir la inferencia en navegador mediante Transformers.js sobre WebGPU, tecnologia que utiliza la herramienta SubtitleKing para generar subtitulos. El modelo original procede de ivrit.ai y conserva su licencia Apache-2.0.

El modelo resuelve el problema de transcribir audio en hebreo con calidad cercana a Whisper large-v3-turbo pero ejecutandose integramente en el cliente, sin enviar el audio a un servidor. Esto es relevante para aplicaciones de subtitulado, privacidad de datos y despliegue sin infraestructura de GPU en backend. La arquitectura es la de Whisper (transformer encoder-decoder con atencion, procesamiento de audio en ventanas de 30 segundos), con aproximadamente 809 millones de parametros en la variante turbo, aunque el autor no explicita el numero en la model card.

El repositorio pesa 1,6 GB y contiene un encoder en fp16 y un decoder cuantizado a 4 bits con past key values, lo que reduce el peso respecto al checkpoint original en fp32. No se han publicado resultados de benchmarks ni detalles adicionales de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | no disponible (variante turbo de Whisper, ~809M segun la arquitectura base, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | Encoder fp16 con I/O fp32; decoder 4-bit MatMul (bloque 32, simetrico) |
| Idiomas soportados | Hebreo (he) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder_model_fp16.onnx, decoder_model_merged_q4.onnx) |

## Arquitectura y entrenamiento

El modelo es un Whisper large-v3-turbo, es decir, un transformer encoder-decoder para reconocimiento automatico del habla que procesa audio en ventanas de 30 segundos y genera tokens de texto de forma autorregresiva. La variante turbo de Whisper reduce el numero de capas del decoder respecto a large-v3 para acelerar la inferencia, manteniendo el encoder. El ajuste fino en hebreo lo realizo ivrit.ai sobre el checkpoint base de OpenAI; la model card no detalla el volumen de datos, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO.

La contribucion de este repositorio es exclusivamente de formato: se exporta con Optimum ONNX en modo automatic-speech-recognition-with-past, con el encoder en fp16 y el decoder cuantizado a 4 bits mediante MatMul con bloque de 32 y cuantizacion simetrica, conservando los past key values para la decodificacion autorregresiva. El proceso es reproducible con el directorio tools/convert-whisper/ del repositorio SubtitleKing. No se describe ninguna innovacion arquitectonica adicional.

## Capacidades

- Transcripcion de audio en hebreo a texto (reconocimiento automatico del habla).
- Generacion de subtitulos con marcas temporales, orientada a la herramienta SubtitleKing.
- Inferencia en navegador mediante Transformers.js y WebGPU, sin backend.
- Procesamiento de audio en ventanas de 30 segundos, propio de Whisper.
- Soporte de decodificacion con past key values (generacion autorregresiva eficiente).
- No se documentan capacidades de traduccion, tool calling, agentes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Subtitulado de video en hebreo en el navegador: el modelo transcribe el audio localmente con WebGPU y genera subtitulos sin subir el contenido a un servidor, lo que protege la privacidad del material.
- Herramientas de accesibilidad web: integracion en reproductores o plataformas educativas para generar subtitulos en hebreo en tiempo de ejecucion en el cliente.
- Edicion de video en local: transcripcion de material grabado para indexacion y busqueda de fragmentos por texto, sin depender de APIs externas.
- Aplicaciones de privacidad estricta: entornos donde el audio no puede salir del dispositivo, como grabaciones medicas o legales en hebreo, aprovechando la inferencia ONNX en el navegador.
- Prototipado rapido sin infraestructura: desarrolladores que quieren probar ASR en hebreo con Transformers.js sin montar servidores GPU, gracias al formato ONNX y al peso reducido del decoder 4-bit.
- Archivado y busqueda de contenido audiovisual: transcripcion por lotes de grabaciones en hebreo para construir indices de texto consultables, con el encoder fp16 y el decoder cuantizado para reducir requisitos de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 1,6 GB, con encoder fp16 y decoder 4-bit, por lo que la huella en memoria es inferior a la del checkpoint fp32.
- GPU recomendadas: no especificadas; al ejecutarse via WebGPU, depende de la GPU integrada o dedicada del equipo del usuario (por ejemplo, GPUs de portatiles y de escritorio compatibles con WebGPU).
- Cabe en GPU de consumo: si, al estar disenado para navegador con WebGPU; el requisito concreto depende del navegador y del adaptador grafico.
- Opciones de despliegue: Transformers.js con WebGPU (principal), y ONNX Runtime para ejecucion nativa si se reutilizan los ficheros ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| subtitleking/ivrit-whisper-large-v3-turbo-onnx | no disponible (~809M, no confirmado) | ventanas de 30 s | he | Apache-2.0 | ONNX (fp16 + 4-bit) |
| ivrit-ai/whisper-large-v3-turbo | no disponible (~809M, no confirmado) | ventanas de 30 s | he | Apache-2.0 | safetensors (checkpoint original) |
| openai/whisper-large-v3-turbo | no disponible (~809M, no confirmado) | ventanas de 30 s | multilingue | Apache-2.0 | safetensors |

La diferencia principal frente al checkpoint de ivrit.ai es el formato y la cuantizacion, no la calidad del modelo. Frente a Whisper large-v3-turbo de OpenAI, este modelo esta especializado en hebreo mediante ajuste fino.

## Limitaciones y advertencias

- Solo soporta hebreo; no se documenta traduccion ni otros idiomas.
- Al ser una conversion de formato, hereda los sesgos y errores del checkpoint ivrit-ai/whisper-large-v3-turbo, no evaluados en esta ficha.
- Riesgo de alucinacion inherente a los modelos Whisper en audio ruidoso, silencios o dominios alejados del entrenamiento.
- La cuantizacion 4-bit del decoder puede introducir una perdida de precision no cuantificada en la model card.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda citar a ivrit.ai segun indica el autor.
- No hay benchmarks ni evaluacion de calidad publicados para esta conversion.
- Depende de WebGPU y de Transformers.js; la compatibilidad varia segun navegador y hardware.

## Enlaces

- HuggingFace: https://huggingface.co/subtitleking/ivrit-whisper-large-v3-turbo-onnx
- Modelo base: https://huggingface.co/ivrit-ai/whisper-large-v3-turbo
- ivrit.ai: https://www.ivrit.ai
- Transformers.js: https://github.com/huggingface/transformers.js
