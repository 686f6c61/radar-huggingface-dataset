# vikeeai/whisper-small_timestamped

## Resumen

`vikeeai/whisper-small_timestamped` es una conversión a ONNX del modelo `openai/whisper-small`, publicada por el usuario vikeeai con el objetivo de que sea ejecutable directamente en el navegador mediante Transformers.js. No se trata de un modelo nuevo ni de un fine-tuning: es una redistribución de los pesos originales de Whisper Small en formato ONNX, empaquetada según la convención de repositorios web-ready de Hugging Face (subcarpeta `onnx`).

Whisper Small es un modelo de reconocimiento automático del habla (ASR) de OpenAI, basado en una arquitectura transformer encoder-decoder de tipo seq2seq, entrenado sobre aproximadamente 680.000 horas de audio débilmente supervisado y orientado a transcripción multilingüe y traducción al inglés. La etiqueta "timestamped" del nombre del repositorio sugiere la inclusión de marcas temporales en la salida, aunque la model card no documenta explícitamente dicha modificación.

Su relevancia práctica es acotada: el repositorio tiene cero descargas y cero likes en el momento de la ficha, y la model card es prácticamente un calco de la plantilla estándar de conversiones ONNX de Transformers.js. Resulta útil únicamente como artefacto listo para inferencia en el navegador con la librería Transformers.js, no como modelo de referencia para producción en servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq), base OpenAI Whisper Small |
| Parametros totales | 244 millones (heredados de openai/whisper-small; no verificado en la model card de este repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; Whisper Small procesa ventanas de audio de 30 segundos |
| Tipos de cuantizacion | no disponible (el repo incluye pesos ONNX; no se detalla si hay variantes cuantizadas) |
| Idiomas soportados | no disponible en la model card (Whisper Small original soporta multilingüe, ~99 idiomas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (subcarpeta `onnx`), compatible con Transformers.js |
| Tamano del repo | 0,8 GB |
| Modelo base | openai/whisper-small |
| Libreria | transformers.js |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper Small: un transformer encoder-decoder entrenado con supervisión débil sobre un corpus multilingüe y multitarea de audio y texto. El encoder procesa espectrogramas log-Mel de 80 canales sobre ventanas de 30 segundos; el decoder genera tokens de texto condicionados por tokens de tarea e idioma. El entrenamiento original de OpenAI combinó transcripción, traducción al inglés y predicción de marcas temporales a nivel de segmento.

Este repositorio concreto no aporta información sobre entrenamiento adicional, fine-tuning, RLHF ni datasets propios. La model card se limita a indicar que se trata de `openai/whisper-small` con pesos ONNX para compatibilidad con Transformers.js, y que mantener repos separados para pesos ONNX es una solución temporal hasta que WebML madure. No hay evidencia documentada de que se hayan modificado los pesos respecto al modelo base, más allá de la conversión de formato.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) mediante el pipeline `automatic-speech-recognition`.
- Ejecución en navegador y en entornos JavaScript/TypeScript a través de Transformers.js, sin necesidad de backend Python.
- El nombre del repositorio indica soporte de marcas temporales ("timestamped"), presumiblemente mediante `return_timestamps` en la API de Transformers.js, aunque no está documentado en la model card.
- Capacidades multilingües y de traducción al inglés heredadas del modelo base, no verificadas en esta conversión.
- No se documenta soporte de tool calling, agentes, visión, audio en tiempo real ni modos de razonamiento extendido.

## Casos de uso

- Transcripción en el navegador sin servidor: integrar el modelo en una aplicación web con Transformers.js para transcribir audio del micrófono o de archivos subidos por el usuario, manteniendo el audio en el cliente y evitando enviar datos a un backend.
- Subtitulado de vídeo en herramientas web: usar las marcas temporales sugeridas por el nombre del repositorio para generar subtítulos sincronizados en editores o reproductores basados en JavaScript.
- Prototipado rápido de interfaces de voz: validar flujos de dictado, búsqueda por voz o accesibilidad en aplicaciones web antes de invertir en infraestructura de inferencia en servidor.
- Aplicaciones de escritorio con Electron o Tauri: empaquetar el modelo ONNX para transcripción local offline en herramientas de notas o grabación.
- Extensiones de navegador: transcripción de pestañas o de contenido multimedia sin depender de APIs externas de ASR.
- Demos educativas y pruebas de concepto de WebML: servir como ejemplo de estructura de repositorio ONNX web-ready para quien quiera convertir otros modelos con Optimum.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio pesa 0,8 GB, lo que sugiere pesos ONNX en precisión completa o mixta; no se detalla si existen variantes cuantizadas en el propio repo.
- El modelo base Whisper Small (244 M de parámetros) requiere aproximadamente 1 GB de VRAM en FP16 para inferencia en GPU y del orden de 2 GB en FP32.
- Cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores; en el navegador se ejecuta vía WebGPU o WASM, con rendimiento dependiente del dispositivo del cliente.
- Despliegue previsto: Transformers.js en navegador o Node.js. Para servidor no es la opción natural; en ese caso conviene usar el modelo base con vLLM, faster-whisper, WhisperX o TGI.
- No se dispone de datos de latencia ni throughput medidos para esta conversión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vikeeai/whisper-small_timestamped | 244 M (heredado) | ventanas de 30 s | no disponible | ONNX (Transformers.js) | Hugging Face, 0 descargas |
| openai/whisper-small | 244 M | ventanas de 30 s | MIT (según el modelo original de OpenAI) | safetensors, PyTorch | Hugging Face, ampliamente usado |
| openai/whisper-base | 74 M | ventanas de 30 s | MIT | safetensors, PyTorch | Hugging Face |
| openai/whisper-medium | 769 M | ventanas de 30 s | MIT | safetensors, PyTorch | Hugging Face |

La comparación relevante es contra el propio `openai/whisper-small`: esta conversión no mejora precisión ni añade capacidades verificadas, solo cambia el formato para ejecución web. Para uso en servidor, el modelo original o implementaciones optimizadas como faster-whisper son preferibles.

## Limitaciones y advertencias

- Licencia no declarada en el repositorio: no se puede confirmar si el uso comercial está permitido, aunque el modelo base de OpenAI se distribuye bajo licencia MIT. Conviene verificar antes de usarlo en producción.
- Model card mínima: no documenta idiomas, cuantizaciones, ni el alcance real de la funcionalidad "timestamped".
- Repositorio sin tracción: cero descargas y cero likes, sin evidencia de mantenimiento ni validación por parte de la comunidad.
- Riesgo de alucinación inherente a Whisper: el modelo puede generar texto plausible en segmentos con silencio, ruido o audio musical.
- Sesgos heredados del entrenamiento débilmente supervisado de OpenAI: disparidades de precisión entre idiomas, acentos y variedades dialectales.
- Rendimiento en navegador limitado por WebGPU/WASM y por el hardware del cliente; no apto para transcripción de grandes volúmenes en el dispositivo del usuario.
- Sin garantías de paridad numérica exacta con el modelo PyTorch original tras la conversión a ONNX.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vikeeai/whisper-small_timestamped
- Modelo base: https://huggingface.co/openai/whisper-small
- Documentación de Optimum (conversión a ONNX): https://huggingface.co/docs/optimum/index
- Transformers.js: https://huggingface.co/docs/transformers.js
