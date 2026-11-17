# TalentQ/kokoro-82m-ext

## Resumen

Kokoro-82M-ext es una reexportación del modelo de síntesis de voz Kokoro-82M de hexgrad, publicada por TalentQ para inferencia en navegador mediante WebGPU con transformers.js y kokoro-js. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión del checkpoint original a formato ONNX con pesos fp32 almacenados como datos externos, de modo que el grafo (~1 MB) y los pesos (~resto del repositorio, 0.3 GB) se cargan de forma separada y directa en la GPU del navegador.

El modelo resuelve el problema de ejecutar TTS de calidad en el cliente sin servidor: al usar pesos externos ONNX, evita el límite práctico de tamaño de un único fichero ONNX y permite que transformers.js cargue el modelo en memoria de GPU vía WebGPU. La arquitectura subyacente es la de Kokoro-82M, un modelo de 82 millones de parámetros (no disponible el detalle exacto de capas en la información proporcionada) especializado en texto a voz.

Es relevante ahora porque el ecosistema transformers.js está llevando modelos de audio al navegador y este repositorio añade dos modificaciones prácticas sobre el ONNX de referencia: salida de `durations` por token y entrada de `speed` por token, un workaround documentado en el issue hexgrad/kokoro#344. La licencia Apache-2.0 y el tamaño reducido lo hacen apto para prototipos y aplicaciones web sin infraestructura de inferencia dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal (Kokoro-82M); detalle de capas no disponible |
| Parametros totales | 82M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de texto a voz, sin contexto de conversación) |
| Tipos de cuantizacion | fp32 (pesos sin cambios respecto al original); otras cuantizaciones no disponibles en este repo |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX con datos externos (`onnx/model_ext.onnx_data` fp32) y grafo (`onnx/model_ext_ts_sp.onnx`) |

## Arquitectura y entrenamiento

El modelo base es Kokoro-82M de hexgrad, un sistema de texto a voz de 82 millones de parámetros. La información proporcionada no detalla la arquitectura interna (tipo de decoder, vocoder, mecanismo de atención) ni los datos de entrenamiento, número de tokens, composición del dataset o si hubo RLHF/DPO. Lo que sí se documenta es el proceso de conversión: TalentQ parte de onnx-community/Kokoro-82M-v1.0-ONNX y reexporta los pesos fp32 sin modificarlos como datos externos ONNX, de forma que el grafo queda en un fichero de ~1 MB y los pesos en `model_ext.onnx_data`, cargables directamente a GPU.

La innovación técnica de esta variante es doble: el grafo `model_ext_ts_sp.onnx` emite `durations` por token y acepta `speed` por token, con la recomendación de mantener BOS/EOS a 1.0 como workaround del issue hexgrad/kokoro#344. Esto permite control fino de la velocidad de habla a nivel de token, algo útil para alinear duraciones en doblaje o para corregir el ritmo en frases concretas. Las voces, configuración y tokenizer deben tomarse del repositorio ONNX upstream, no de este.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, en formato ONNX ejecutable con transformers.js y kokoro-js.
- Inferencia en navegador con WebGPU, sin backend de servidor.
- Salida de duraciones por token (`durations`), útil para alineamiento temporal y control de prosodia.
- Control de velocidad por token (`speed`), con BOS/EOS fijados a 1.0.
- Pesos fp32 sin cuantizar, lo que preserva la calidad del checkpoint original.
- Soporte de tool calling, agentes, razonamiento, código, matemáticas, visión o audio de entrada: no disponible (es un modelo TTS, no un LLM).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Lectura por voz en aplicaciones web: cargar el modelo con transformers.js y WebGPU en el cliente para narrar artículos o contenido sin enviar texto a un servidor, aprovechando los pesos externos fp32.
- Accesibilidad en el navegador: convertir texto de la página en audio para usuarios con discapacidad visual, con la ventaja de que el procesamiento ocurre localmente y no requiere subir datos personales.
- Doblaje y alineamiento temporal: usar la salida `durations` por token para sincronizar subtítulos o vídeo con la locución generada, ajustando el ritmo por token.
- Prototipado de asistentes de voz: integrar kokoro-js en una demo web para validar flujos de conversación hablada antes de invertir en infraestructura de TTS en servidor.
- Generación de audiolibros o pódcast de bajo coste: sintetizar textos largos por lotes en el navegador o en Node con ONNX Runtime, tomando las voces del repositorio upstream.
- Control fino de velocidad en producción: modificar `speed` por token para corregir frases demasiado rápidas o lentas en una locución, manteniendo BOS/EOS a 1.0 según el workaround documentado.
- Pruebas de calidad de voces: comparar voces del repo upstream con los pesos fp32 reexportados para evaluar si la conversión a datos externos introduce diferencias audibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos fp32 de un modelo de 82M ocupan aproximadamente 328 MB (82M × 4 bytes); el repositorio completo es de 0.3 GB, por lo que la inferencia cabe holgadamente en GPU de consumo.
- GPU recomendadas: cualquier GPU con soporte WebGPU en navegador (por ejemplo, integradas recientes y dedicadas de gama media); en servidor, GPUs con soporte ONNX Runtime como A100, H100 o RTX 4090, aunque están sobredimensionadas para 82M de parámetros.
- Cabe en GPU de consumo: sí, con margen amplio; también es viable en CPU con ONNX Runtime, aunque la latencia será mayor.
- Opciones de despliegue: transformers.js y kokoro-js en navegador con WebGPU; ONNX Runtime en Node o Python; el repo upstream onnx-community/Kokoro-82M-v1.0-ONNX para otras integraciones.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TalentQ/kokoro-82m-ext | 82M | no disponible | Apache-2.0 | ONNX (datos externos, fp32) | Reexportación para WebGPU con `durations` y `speed` por token |
| hexgrad/Kokoro-82M | 82M | no disponible | Apache-2.0 | safetensors/PyTorch (según repo original) | Modelo base original de hexgrad |
| onnx-community/Kokoro-82M-v1.0-ONNX | 82M | no disponible | Apache-2.0 | ONNX | Exportación ONNX de referencia; fuente de voces, config y tokenizer |

No se dispone de datos de benchmarks para comparar rendimiento entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es una reexportación, no un modelo nuevo: la calidad depende enteramente del checkpoint Kokoro-82M original.
- No incluye voces, configuración ni tokenizer; hay que tomarlos del repositorio onnx-community/Kokoro-82M-v1.0-ONNX.
- El workaround de `speed` por token exige mantener BOS/EOS a 1.0; ignorarlo puede producir artefactos en la prosodia.
- Pesos fp32: mayor uso de memoria y ancho de banda que una versión cuantizada; en navegador puede ser limitante en dispositivos con poca GPU.
- Dependencia de WebGPU: navegadores o equipos sin soporte caerán a CPU o no podrán ejecutar el modelo.
- Idiomas soportados no documentados en este repositorio; verificar en el modelo base antes de usarlo en producción multilingüe.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí puede haber errores de pronunciación o prosodia en textos fuera del dominio de entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de las voces utilizadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/TalentQ/kokoro-82m-ext
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Exportación ONNX de referencia: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
- Issue del workaround de velocidad: https://github.com/hexgrad/kokoro/issues/344
- Librería kokoro-js: no disponible en la información proporcionada
- Paper: no disponible en la información proporcionada
