# YHZDigital/wav2vec2-arabic-align-onnx

## Resumen

`YHZDigital/wav2vec2-arabic-align-onnx` es una exportación a ONNX en precisión float16 del modelo `jonatasgrosman/wav2vec2-large-xlsr-53-arabic`, desarrollado originalmente por Jonatas Grosman. El modelo base es un wav2vec2-large fine-tuneado sobre XLSR-53 para reconocimiento automático del habla (ASR) en árabe. Esta versión ONNX la publica YHZDigital con un propósito muy concreto: ejecutar alineamiento forzado a nivel de palabra de recitación coránica directamente en el navegador mediante transformers.js.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de uso poco habitual de wav2vec2: el alineamiento forzado (forced alignment), la técnica que emplea WhisperX para asignar marcas temporales precisas a cada palabra de una transcripción conocida. Por otro, muestra el patrón de despliegue edge/browser: exportación a ONNX con opset 17, conversión a fp16 y carga vía transformers.js sin necesidad de backend.

Arquitectónicamente es un transformer convolucional (CNN feature extractor + encoder de 24 capas, ~300M parámetros) con contexto de audio limitado por la arquitectura wav2vec2 (ventana efectiva de unos 10 segundos por inferencia en configuraciones estándar). El repo ocupa 0,6 GB, coherente con un modelo large en fp16. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (CNN feature extractor + transformer encoder), exportado a ONNX |
| Parametros totales | ~300M (modelo base wav2vec2-large-xlsr-53) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (wav2vec2 procesa ventanas de audio de ~10 s por inferencia) |
| Tipos de cuantizacion | float16 (ONNX); el modelo base admite cuantizacion adicional, no documentada en este repo |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (fp16, opset 17) |
| Libreria de despliegue | transformers.js |
| Tamano del repo | 0,6 GB |
| Modelo base | jonatasgrosman/wav2vec2-large-xlsr-53-arabic |

## Arquitectura y entrenamiento

El modelo base es un wav2vec2-large multilingüe (XLSR-53) fine-tuneado por Jonatas Grosman para árabe. La arquitectura wav2vec2 combina un extractor de características convolucional que convierte la forma de onda de audio en representaciones latentes, seguido de un encoder transformer que modela dependencias temporales. El preentrenamiento XLSR-53 se realizó con aprendizaje contrastivo auto-supervisado sobre 53 idiomas, y el fine-tuning posterior adaptó el modelo a la transcripción de voz en árabe.

Esta exportación concreta no modifica los pesos: únicamente se exportó con `torch.onnx` (opset 17) y se convirtió a float16 para reducir el tamaño y acelerar la inferencia en el navegador. No hay información disponible sobre el dataset exacto de fine-tuning, el número de tokens de audio ni si se aplicaron técnicas de RLHF o DPO (no aplicables en ASR). El autor indica que es el mismo modelo que WhisperX emplea para árabe en tareas de alineamiento.

## Capacidades

- Reconocimiento automático del habla (ASR) en árabe.
- Alineamiento forzado a nivel de palabra: dada una transcripción conocida, el modelo permite derivar marcas temporales de inicio y fin de cada palabra.
- Ejecución en navegador vía transformers.js, sin backend Python.
- Inferencia en fp16 sobre ONNX Runtime Web, con menor huella de memoria que el modelo original.
- Procesamiento de audio en ventanas de aproximadamente 10 segundos por pasada (limitación arquitectónica de wav2vec2).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No es un modelo generativo de texto: no produce respuestas libres, solo logits de carácter/fonema sobre el audio.

## Casos de uso

- Alineamiento de recitación coránica en el navegador: el caso declarado por el autor. Dada una transcripción conocida del texto recitado, el modelo produce marcas temporales por palabra que permiten resaltar el texto sincronizado con el audio en una aplicación web.
- Herramientas de aprendizaje de recitación: sincronizar audio y texto para señalar al usuario en qué palabra va, con corrección de desviaciones respecto al texto canónico.
- Subtitulado asistido en árabe: alineamiento de transcripciones existentes con audio para generar subtítulos con timing por palabra.
- Verificación de pronunciación: comparar la transcripción forzada con el texto esperado y detectar discrepancias en la recitación o lectura.
- Indexación y búsqueda de audio: generar marcas temporales que permitan buscar fragmentos concretos dentro de grabaciones largas de recitación o discurso.
- Aplicaciones educativas offline-first: al ejecutarse en el navegador con transformers.js, permite desplegar herramientas de alineamiento sin infraestructura de servidor ni envío de audio a terceros.
- Prototipado rápido de ASR árabe en frontend: útil para demos y pruebas de concepto donde no se quiere montar un backend con PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye métricas de WER, latencia ni comparativas numéricas.

## Requisitos de hardware

- VRAM estimada: ~0,6 GB en fp16 para los pesos; en la práctica, el consumo de memoria del navegador es mayor por buffers de activaciones y audio.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU vía ONNX Runtime Web (WASM) y en GPU integrada mediante WebGPU/WebGL cuando el navegador lo soporta.
- Cabe en cualquier GPU consumer y en la mayoría de portátiles y móviles modernos, al ser un modelo de ~300M parámetros en fp16.
- Opciones de despliegue: transformers.js (caso de uso previsto), ONNX Runtime (Web, Python, C++), y conversión a otros formatos si se requiere.
- Latencia y throughput: no disponibles en la información proporcionada. Dependerán del backend (WASM vs WebGPU) y del hardware del cliente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| YHZDigital/wav2vec2-arabic-align-onnx | ~300M | ~10 s por inferencia | ar | Apache-2.0 | ONNX fp16 |
| jonatasgrosman/wav2vec2-large-xlsr-53-arabic | ~300M | ~10 s por inferencia | ar | Apache-2.0 | PyTorch (safetensors/bin) |
| Whisper large-v3 (referencia ASR multilingue) | ~1.550M | 30 s | multilingue (incluye ar) | MIT | PyTorch, ONNX, GGUF, etc. |

La diferencia principal frente al modelo base es el formato (ONNX fp16 frente a PyTorch) y el objetivo de despliegue en navegador. Frente a Whisper, este modelo es mucho más pequeño y está especializado en árabe, pero no es generativo y su ventana de audio es menor. No hay datos de benchmarks para comparar rendimiento numérico entre ellos en la información disponible.

## Limitaciones y advertencias

- Especializado exclusivamente en árabe; no soporta otros idiomas.
- No es un modelo generativo: no responde preguntas ni transcribe libremente sin una transcripción de referencia en el flujo de alineamiento.
- Ventana de audio limitada (~10 s por inferencia), lo que exige segmentar grabaciones largas.
- Riesgo de errores de alineamiento en audio con ruido, solapamientos o pronunciación muy alejada del árabe estándar.
- El modelo base puede heredar sesgos del corpus XLSR-53 y del dataset de fine-tuning; no hay documentación específica sobre sesgos en esta exportación.
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar los avisos de copyright y atribución del modelo base.
- Al ejecutarse en navegador, la precisión fp16 y las limitaciones de ONNX Runtime Web pueden degradar ligeramente los resultados frente a la versión PyTorch original.
- El repo tiene muy pocas descargas (31) y ningún like en el momento de la consulta; no hay evidencia de validación comunitaria extensa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YHZDigital/wav2vec2-arabic-align-onnx
- Modelo base: https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-arabic
- Repositorio transformers.js: https://github.com/huggingface/transformers.js
- WhisperX (referencia de alineamiento): https://github.com/m-bain/whisperX
- Paper wav2vec 2.0: https://arxiv.org/abs/2006.11477
- Paper XLSR: https://arxiv.org/abs/2006.13979
