# spybyscript/nemotron-speech-streaming-en-0.6b-litert

## Resumen

El modelo `spybyscript/nemotron-speech-streaming-en-0.6b-litert` es una conversión comunitaria del modelo de reconocimiento de voz automático (ASR) de NVIDIA `nemotron-speech-streaming-en-0.6b` al formato LiteRT (TensorFlow Lite). La conversión, realizada por `spybyscript`, no implica ningún entrenamiento o ajuste adicional; se trata de una transformación de los pesos originales a 31 grafos de componentes para una integración stateful de streaming con una latencia de 560 ms. El modelo está diseñado para transcribir audio en inglés en tiempo real y se distribuye en tres precisiones: FP32, FP16 e INT8.

La arquitectura subyacente es FastConformer con un decodificador RNN-T (transductor), un enfoque habitual en ASR de streaming. El repositorio incluye un runtime de referencia en Python (`reference_runtime.py`) que permite ejecutar la conversión sin depender de Transformers, NeMo ni del checkpoint original. Es una opción relevante para desarrolladores que buscan integrar ASR en dispositivos Android o en entornos con LiteRT, siempre que acepten la naturaleza de componentes y la necesidad de validar la integración en el hardware objetivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador RNN-T (transductor para ASR en streaming) |
| Parámetros totales | 0.6B (según nomenclatura del modelo, no confirmado en documentación técnica) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo ASR de streaming, no de texto) |
| Tipos de cuantización | FP32, FP16, INT8 (cuantización parcial dinámica por canal solo en capas fully-connected del encoder; el resto permanece FP32) |
| Idiomas soportados | Inglés (en) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | Grafos LiteRT/TFLite (componentes separados por precisión: frontend, subsampling, 24 bloques encoder, proyección, predictor, joint, vocabulario, manifest) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura FastConformer de NVIDIA, combinada con un decodificador RNN-T (Recurrent Neural Network Transducer). Esta combinación es habitual en sistemas de ASR en streaming, ya que permite emitir tokens de forma incremental sin esperar a la entrada completa. La conversión a LiteRT divide el modelo en 31 grafos de componentes: frontend de valores reales, subsampling, 24 bloques del encoder, proyección, predictor, joint, vocabulario y manifest. Cada carpeta de precisión (FP32, FP16, INT8) es autocontenida.

No se ha realizado ningún entrenamiento adicional, RLHF ni DPO; la conversión conserva los pesos originales de la revisión `ebe59e5a817142986528bbbee5dba8db7b38ed50`. El modelo es el checkpoint en inglés, no Nemotron 3.5, con un vocabulario de 1025 tokens, blank en 1024, sin entrada de prompt de idioma y un caché KV izquierdo de 70 frames. La conversión incluye buffers de estado explícitos, grafos de tamaño fijo y un decodificador que conserva las piezas RNN-T repetidas.

## Capacidades

- Transcripción de voz en inglés en tiempo real (streaming) con una integración stateful de 560 ms.
- Reconocimiento de voz automático basado en RNN-T, con emisión de tokens incremental.
- Disponible en tres precisiones: FP32 (referencia), FP16 (validada por paridad) e INT8 (experimental, con paridad fallida).
- Soporte para ejecución en dispositivos Android mediante LiteRT/TFLite, con un adaptador EN `nemotron-en-hf560-v1`.
- Incluye un runtime de referencia en Python que no requiere Transformers ni NeMo.
- No soporta tool calling, agentes, visión ni capacidades multimodales; es exclusivamente un modelo de ASR.

## Casos de uso

- Dictado por voz en aplicaciones móviles: el modelo puede transcribir audio en inglés en tiempo real en dispositivos Android, gracias a su formato LiteRT y a su arquitectura de streaming. La integración requiere el ensamblado de los 31 grafos de componentes según el manifest.
- Subtitulado en vivo de reuniones o conferencias: la latencia de 560 ms permite generar subtítulos casi instantáneos. El modelo no incluye VAD ni diarización, por lo que el sistema debe gestionar la segmentación de audio.
- Asistentes de voz para accesibilidad: puede usarse para convertir voz en texto en tiempo real para personas con discapacidad auditiva. La precisión FP16 es adecuada para una primera integración.
- Análisis de llamadas de atención al cliente: el streaming permite extraer transcripciones de conversaciones telefónicas en inglés. El modelo es adecuado para entornos con recursos limitados si se usa la variante INT8, aunque esta requiere evaluación previa.
- Control por voz en dispositivos integrados: al ser un modelo de 0.6B y estar disponible en LiteRT, puede ejecutarse en hardware de baja potencia, como smartphones o placas con NPU, siempre que se valide el rendimiento en el dispositivo objetivo.
- Integración en pipelines de transcripción en servidores: el runtime de referencia permite ejecutar el modelo en CPU sin dependencias pesadas, lo que facilita la integración en sistemas de procesamiento de audio por lotes o en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión ASR (WER) en la información disponible. La documentación proporciona comprobaciones de paridad con el modelo nativo de NVIDIA, no mediciones independientes de precisión. Los resultados de paridad son los siguientes:

| Variante | Coincidencias exactas de tokens nativos | Ediciones de tokens vs. nativo |
|---|---|---|
| FP32 | 4/4 | 0 |
| FP16 | 4/4 | 0 |
| INT8 | 1/4 | 19 |

Estas comprobaciones se realizaron sobre cuatro grabaciones en inglés (159,76 segundos, 885 tokens de salida) usando el modelo FP32 nativo como referencia. No constituyen una medida de WER ni un benchmark de precisión independiente.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo se validó en CPU Linux con cuatro hilos; no se han publicado requisitos de VRAM ni de memoria.
- GPU recomendadas: no disponible. No se reclaman resultados en GPU, NPU ni dispositivos Android en esta versión.
- Compatibilidad con GPU de consumo: no disponible. La validación se realizó en CPU.
- Opciones de despliegue: LiteRT/TFLite (integración Android), runtime de referencia en Python (`reference_runtime.py`). No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. Los tiempos de ejecución incluidos en `parity.json` no son una clasificación controlada de velocidad; las ejecuciones se solaparon con otro trabajo.

## Comparativa con modelos similares

No se dispone de comparativas con modelos similares en la información proporcionada. El modelo es una conversión sin cambios de pesos de `nvidia/nemotron-speech-streaming-en-0.6b`, por lo que su comportamiento de reconocimiento debería ser idéntico al del modelo original en FP32/FP16. La variante INT8 no es equivalente. Tampoco es compatible con el paquete Nemotron 3.5, que utiliza una proyección condicionada por prompt y cachés de 56 frames.

## Limitaciones y advertencias

- La variante INT8 no pasó la puerta de paridad exacta de tokens (1/4) y está marcada como `evaluation_only`. No debe aceptarse como equivalente al modelo nativo sin una evaluación explícita.
- No se han medido resultados en dispositivos Android, GPU, NPU, térmicos ni de memoria máxima. Las mediciones del paquete 3.5 no deben transferirse a esta versión.
- El modelo solo soporta inglés (en). No incluye VAD (detección de actividad de voz) ni diarización (identificación de hablantes).
- La conversión no es un lanzamiento oficial de NVIDIA ni de Google; es una contribución de la comunidad.
- Pueden producirse errores de reconocimiento, nombres mal transcritos y palabras omitidas. Los tiempos de emisión de tokens no son límites de palabra verificados.
- La licencia es NVIDIA Open Model License; es necesario revisar los términos para uso comercial y redistribución.
- No mezclar carpetas de precisión; cada una es autocontenida y debe usarse de forma independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/spybyscript/nemotron-speech-streaming-en-0.6b-litert
- Modelo base original de NVIDIA: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Archivos de integración en el repositorio: `INTEGRATION.md`, `reference_runtime.py`, `publication.json`, `SHA256SUMS` (disponibles en el repo de Hugging Face)
