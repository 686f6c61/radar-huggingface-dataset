# subtitleking/eek-whisper-turbo-ro-en-onnx

## Resumen

`subtitleking/eek-whisper-turbo-ro-en-onnx` es una conversión a formato ONNX del modelo de reconocimiento automático de voz `eek/whisper-turbo-ro-en`, un ajuste fino de Whisper large-v3-turbo realizado por Radu-Sebastian Amarie (eek) sobre voz en rumano e inglés. El repositorio, publicado por el usuario `subtitleking`, no entrena ni modifica los pesos más allá del cambio de formato: su objetivo es permitir la inferencia directamente en el navegador mediante Transformers.js sobre WebGPU, que es el uso que le da la propia herramienta SubtitleKing.

El modelo resuelve la transcripción de audio en rumano (idioma declarado en la model card) con un checkpoint derivado de la arquitectura Whisper large-v3-turbo, que reduce el número de capas del decoder respecto a large-v3 para disminuir la latencia manteniendo una calidad de transcripción alta. La relevancia de esta ficha radica en su empaquetado: encoder en fp16 y decoder fusionado cuantizado a 4 bits con past key values, lo que reduce el peso del repositorio a 1,6 GB y lo hace viable en entornos sin GPU dedicada, ejecutándose en el navegador.

Se trata de un artefacto de despliegue, no de un modelo original: la autoría intelectual corresponde a eek y la licencia MIT del checkpoint fuente se mantiene. Es útil para quien necesite transcripción de rumano en cliente (web, extensiones, aplicaciones de subtitulado) sin depender de un servidor con GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), exportado a ONNX |
| Parametros totales | no disponible (derivado de Whisper large-v3-turbo; el repositorio no declara el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper; no declarada explicitamente en la model card) |
| Tipos de cuantizacion | Encoder fp16 con I/O fp32; decoder fusionado con past key values en 4 bits (MatMul, bloque 32, simetrico) |
| Idiomas soportados | Rumano (`ro` declarado); el checkpoint fuente se ajusto sobre rumano e ingles |
| Licencia | MIT |
| Formato de pesos | ONNX (`encoder_model_fp16.onnx`, `decoder_model_merged_q4.onnx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper large-v3-turbo, un transformer encoder-decoder con atención completa en el encoder y decoder autorregresivo con past key values para acelerar la decodificación. El checkpoint fuente `eek/whisper-turbo-ro-en` es un ajuste fino de ese modelo sobre voz en rumano e inglés, realizado por Radu-Sebastian Amarie (eek); la model card no detalla el volumen de datos, la composición del dataset ni si se emplearon técnicas de RLHF o DPO, por lo que esos datos deben considerarse no disponibles.

La contribución de este repositorio es exclusivamente de formato: la exportación se realizó con Optimum ONNX en modo `automatic-speech-recognition-with-past`, con encoder en fp16 (entrada/salida fp32) y decoder fusionado cuantizado a 4 bits con MatMul de bloque 32 simétrico. Además, se restauró el `suppress_tokens` estándar de Whisper en `generation_config.json`, ya que el checkpoint fuente des-suprime `[` y `]` para emitir etiquetas de hablante (`[S1]`) que los subtítulos no utilizan. El proceso es reproducible con las herramientas de `tools/convert-whisper/` del repositorio de SubtitleKing.

## Capacidades

- Reconocimiento automático de voz (ASR) en rumano, con soporte adicional del inglés heredado del ajuste fino del checkpoint fuente.
- Transcripción de audio por segmentos de 30 segundos, con marcas de tiempo por segmento propias del pipeline de Whisper.
- Inferencia en navegador mediante Transformers.js sobre WebGPU, sin servidor backend.
- Decodificación autorregresiva con past key values, lo que reduce el coste computacional por token generado.
- Generación de subtítulos orientada a la herramienta SubtitleKing (el uso declarado del autor de la conversión).
- No se documentan capacidades de tool calling, agentes, visión, audio en streaming ni modo de razonamiento extendido.

## Casos de uso

- Subtitulado automático de vídeo en rumano en el navegador: el modelo se ejecuta sobre WebGPU con Transformers.js, de modo que una aplicación web puede transcribir el audio del usuario sin enviar datos a un servidor, gracias a los 1,6 GB del repositorio y al decoder en 4 bits.
- Herramientas de accesibilidad en tiempo casi real: integración en reproductores web que generan subtítulos para contenido en rumano, aprovechando la ventana de 30 segundos de Whisper para procesar el audio por bloques.
- Transcripción de reuniones y entrevistas en rumano: el modelo puede procesar grabaciones por segmentos y producir texto con marcas temporales, útil para actas o indexación de contenido.
- Aplicaciones de escritorio o extensiones sin GPU dedicada: al estar cuantizado a 4 bits y en ONNX, puede desplegarse con ONNX Runtime en equipos consumer, reduciendo la dependencia de infraestructura cloud.
- Pipelines de investigación en ASR de bajo recurso: sirve como punto de partida para evaluar la calidad de Whisper large-v3-turbo ajustado en rumano dentro de entornos de ejecución ligeros.
- Prototipado rápido de funcionalidades de voz en productos web: la combinación de Transformers.js y WebGPU permite validar una experiencia de dictado o transcripción sin montar un backend de inferencia.
- Generación de corpus transcritos para entrenamiento o evaluación de otros modelos de rumano, siempre que se respete la licencia MIT y se cite el trabajo original de eek.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 1,6 GB, con encoder fp16 y decoder 4 bits, por lo que la huella en memoria es sensiblemente menor que la de Whisper large-v3-turbo en fp16.
- GPU recomendadas: no declaradas por el autor. El uso previsto es WebGPU en el navegador, lo que requiere un navegador con soporte WebGPU (Chrome/Edge recientes) y una GPU integrada o dedicada compatible.
- GPU consumer: el tamaño del artefacto sugiere viabilidad en GPUs consumer modernas, aunque no se aportan cifras de VRAM mínima ni de latencia.
- Opciones de despliegue: Transformers.js sobre WebGPU (uso principal), ONNX Runtime (web o nativo), y cualquier runtime compatible con ONNX que soporte operadores cuantizados a 4 bits.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| subtitleking/eek-whisper-turbo-ro-en-onnx | no disponible (base: Whisper large-v3-turbo) | ventana de audio de 30 s (Whisper) | ro (y en en el checkpoint fuente) | MIT | ONNX (fp16 + q4) | Conversion para navegador con Transformers.js/WebGPU |
| eek/whisper-turbo-ro-en | no disponible (base: Whisper large-v3-turbo) | ventana de audio de 30 s (Whisper) | ro, en | MIT | safetensors (checkpoint fuente) | Modelo original de Radu-Sebastian Amarie |
| subtitleking/ivrit-whisper-large-v3-turbo-onnx | no disponible (base: Whisper large-v3-turbo) | ventana de audio de 30 s (Whisper) | he | no disponible en la informacion | ONNX | Misma estrategia de conversion, para hebreo |
| Whisper large-v3-turbo (OpenAI) | no disponible en la informacion | ventana de audio de 30 s | multilingue | MIT | safetensors, ONNX | Modelo base de la familia |

## Limitaciones y advertencias

- El modelo esta especializado en rumano; el rendimiento en otros idiomas, incluido el ingles del checkpoint fuente, no esta documentado en esta conversion.
- Al ser una conversion de formato, hereda los sesgos y limitaciones del checkpoint `eek/whisper-turbo-ro-en`, que no se detallan en la model card.
- Riesgo de alucinacion inherente a Whisper en segmentos con silencio, ruido o audio musical; no se documentan mitigaciones especificas.
- La cuantizacion a 4 bits del decoder puede introducir una degradacion de calidad respecto al checkpoint original en fp16; no se aportan metricas comparativas.
- La restauracion de `suppress_tokens` elimina la emision de etiquetas de hablante (`[S1]`) que el modelo fuente si podia generar, por lo que no debe esperarse diarizacion.
- La licencia MIT permite uso comercial, pero se exige citar el trabajo original de Radu-Sebastian Amarie (eek) segun la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion independiente.
- La fecha de creacion indicada (2026-11-08) es futura respecto a la redaccion habitual de fichas; conviene verificar la vigencia de los artefactos antes de desplegarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/subtitleking/eek-whisper-turbo-ro-en-onnx
- Checkpoint fuente: https://huggingface.co/eek/whisper-turbo-ro-en
- Perfil del autor del modelo original: https://huggingface.co/eek
- Transformers.js: https://github.com/huggingface/transformers.js
- Conversion similar del mismo autor (hebreo): https://huggingface.co/subtitleking/ivrit-whisper-large-v3-turbo-onnx
