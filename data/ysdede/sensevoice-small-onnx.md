# ysdede/sensevoice-small-onnx

## Resumen

sensevoice-small-onnx es una exportación a formato ONNX del modelo SenseVoiceSmall, desarrollado originalmente por FunAudioLLM y Alibaba Group. El repositorio, publicado por el usuario ysdede, empaqueta los grafos FP32 sin modificaciones respecto a una exportación local previa, orientada al proyecto ASRJS (reconocimiento automático del habla en JavaScript). El modelo base es un sistema de ASR multilingüe de tipo "small", pensado para transcripción eficiente en entornos con recursos limitados.

La relevancia de esta ficha radica en que facilita el despliegue de un motor ASR en navegador o en entornos Node.js mediante ONNX Runtime Web, sin necesidad de infraestructura GPU dedicada. Al tratarse de una exportación de terceros y no de un lanzamiento oficial, el autor declara explícitamente que la publicación por sí sola no constituye una garantía de precisión ni de paridad con el modelo original en navegador.

El repositorio ocupa 0,9 GB y no registra descargas ni interacciones en el momento de la consulta. La licencia figura como "other", remitiendo al archivo LICENSE incluido y al recibo de procedencia del export.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base SenseVoiceSmall de FunAudioLLM; arquitectura no detallada en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (grafos sin modificar); no se indican otras variantes |
| Idiomas soportados | no disponible en la model card de este repositorio |
| Licencia | other (ver LICENSE incluido en el repo) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base SenseVoiceSmall. Se sabe que el repositorio contiene únicamente los grafos ONNX en FP32, exportados desde la revisión `3847d57b6bdf2dd8875cb1508d2af43d80a16bf7` del repositorio original FunAudioLLM/SenseVoiceSmall. No se documentan en esta model card los datos de entrenamiento, el número de tokens, la composición del corpus ni si hubo etapas de ajuste fino con RLHF o DPO.

Tampoco se describen innovaciones técnicas específicas del export (por ejemplo, optimizaciones de grafo, fusión de operadores o cuantización). El autor indica que los grafos FP32 son idénticos a la exportación local registrada y que se incluye un recibo de procedencia para trazabilidad. Cualquier detalle sobre la arquitectura del modelo original debe consultarse en la model card de FunAudioLLM/SenseVoiceSmall, fuera del alcance de la información proporcionada.

## Capacidades

- Reconocimiento automático del habla (ASR) en formato ONNX, orientado a ejecución en navegador mediante ASRJS.
- Exportación FP32 sin modificaciones respecto al modelo base, lo que preserva el comportamiento numérico de la exportación original.
- Integración con ONNX Runtime Web y entornos JavaScript/TypeScript.
- Capacidades multilingües: no disponibles en la información de este repositorio (deben verificarse en el modelo base).
- Tool calling, function calling, agentes y razonamiento multi-paso: no aplica (modelo ASR).
- Capacidades especiales (detección de emoción, eventos acústicos, etc.): no disponibles en la información proporcionada.

## Casos de uso

- Transcripción en el navegador: el modelo puede ejecutarse con ONNX Runtime Web para transcribir audio capturado por el micrófono del usuario sin enviar datos a un servidor, lo que resulta adecuado para aplicaciones de privacidad estricta.
- Subtitulado en tiempo real de vídeo web: al ser un export ONNX de un modelo "small", permite generar subtítulos en páginas web o reproductores sin infraestructura GPU.
- Asistentes de voz en aplicaciones web: integración en interfaces de chat por voz donde la transcripción debe ocurrir localmente para reducir latencia y coste de backend.
- Herramientas de accesibilidad: dictado y transcripción para usuarios con discapacidad motriz en aplicaciones web, aprovechando la ejecución en cliente.
- Procesamiento por lotes en Node.js: uso de ONNX Runtime para Node para transcribir archivos de audio en pipelines de datos sin depender de frameworks Python.
- Prototipado de ASR en entornos edge: despliegue en dispositivos con recursos limitados donde un modelo "small" en FP32 es viable, sirviendo como base para evaluar la calidad antes de migrar a variantes cuantizadas.
- Investigación en ASR en navegador: banco de pruebas para medir paridad y rendimiento entre la ejecución ONNX y el modelo original, dado que el autor no reclama paridad por defecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo "small" en FP32 y un repo de 0,9 GB, es plausible su ejecución en CPU, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el enfoque del export es la ejecución en navegador (CPU/WASM/WebGPU mediante ONNX Runtime Web).
- Opciones de despliegue: ONNX Runtime Web (navegador), ONNX Runtime para Node.js; otras opciones (vLLM, llama.cpp, Ollama, TGI) no aplican a un modelo ASR en ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| sensevoice-small-onnx (este repo) | no disponible | no disponible | other | ONNX | HuggingFace (ysdede) |
| FunAudioLLM/SenseVoiceSmall (original) | no disponible | no disponible | no disponible en esta informacion | no disponible | HuggingFace (FunAudioLLM) |
| Whisper small (OpenAI) | no disponible en esta informacion | no disponible | no disponible en esta informacion | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa de rendimiento entre estos modelos.

## Limitaciones y advertencias

- Export de terceros: no es un lanzamiento oficial de FunAudioLLM ni de Alibaba Group; la responsabilidad de validación recae en el usuario.
- El autor declara explícitamente que la publicación no garantiza precisión ni paridad con el modelo original en navegador; es necesario realizar pruebas propias.
- Licencia "other": es imprescindible revisar el archivo LICENSE incluido y la licencia del modelo base antes de cualquier uso comercial.
- Solo se incluyen grafos FP32; no hay variantes cuantizadas en este repositorio, lo que puede limitar el rendimiento en dispositivos de gama baja.
- Idiomas soportados no documentados en esta model card; deben consultarse en el modelo base.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada para este export.
- Repositorio sin descargas ni interacciones registradas: no hay evidencia comunitaria de validación.
- Fecha de creación indicada como 2026-11-01, posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ysdede/sensevoice-small-onnx
- Modelo base (SenseVoiceSmall, FunAudioLLM): https://huggingface.co/FunAudioLLM/SenseVoiceSmall/tree/3847d57b6bdf2dd8875cb1508d2af43d80a16bf7
- Proyecto ASRJS: no disponible en la información proporcionada
- Paper de SenseVoice: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
