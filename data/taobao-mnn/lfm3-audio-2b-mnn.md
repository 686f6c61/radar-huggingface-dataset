# taobao-mnn/LFM3-Audio-2B-MNN

## Resumen

LFM3-Audio-2B-MNN es la conversión al formato de inferencia MNN del modelo LiquidAI/LFM3-Audio-2B, un modelo multimodal any-to-any que acepta audio y texto como entrada y produce texto y audio como salida. Lo publica el equipo taobao-mnn (Alibaba) con el objetivo de permitir la ejecución local del modelo original en dispositivos sin necesidad de un stack de PyTorch, usando el runtime MNN, que está optimizado para CPU y para aceleración Metal en Apple Silicon.

El modelo base es un sistema de 2B parámetros de Liquid AI que combina un backbone de lenguaje con un codificador de audio y un decodificador de voz (codec/depth). Esta versión MNN aplica cuantización mixta: HQQ INT4 con grupo de 64 y escalas FP16 sobre el backbone de lenguaje, la cabeza de salida y los embeddings de tokens compartidos; INT8 para el codificador de audio; FP16 para el codec de voz; y BF16 para los embeddings de audio. El resultado es un repositorio de 1,5 GB que puede ejecutarse en CPU y, en Apple Silicon, en Metal.

La relevancia de esta ficha es doble: por un lado documenta una ruta práctica para desplegar un modelo de voz bidireccional (ASR y TTS) en local; por otro, advierte de que la validación publicada por el autor es un conjunto de pruebas de humo (smoke tests) en macOS Apple Silicon, no una evaluación exhaustiva. La generación nativa de voz en chino no está validada en calidad y la validación de voz de esta release cubre únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de lenguaje con codificador de audio y decodificador de voz (codec/depth); detalles completos de la arquitectura del modelo base no disponibles |
| Parametros totales | 2B (según nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HQQ INT4 (grupo 64, escalas FP16) en backbone, cabeza de salida y embeddings de tokens; INT8 en codificador de audio; FP16 en speech depth/codec; BF16 en embeddings de audio |
| Idiomas soportados | no disponible en la información proporcionada; validación de voz publicada solo para inglés |
| Licencia | LFM Open License v1.0 (lfm1.0, "other") |
| Formato de pesos | MNN (modelo convertido); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

La información disponible describe únicamente la conversión, no el entrenamiento. El modelo base LiquidAI/LFM3-Audio-2B es un sistema any-to-any con entrada de audio y texto y salida de texto y audio. La conversión MNN separa el grafo en componentes: un backbone de lenguaje (con la cabeza de salida y los embeddings de tokens atados), un codificador de audio, un módulo de speech depth/codec para la generación de voz y embeddings de audio. El backbone, la cabeza y los embeddings atados se cuantizan a HQQ INT4 con grupo de 64 y escalas FP16; el codificador de audio a INT8; el codec de voz a FP16; y los embeddings de audio a BF16.

La conversión se realizó el 2026-11-17 sobre la revisión upstream `2d6c1f99c` del modelo de LiquidAI, usando el commit `5085d5622` del repositorio MNN de Alibaba. Los parámetros de muestreo se heredan del `generation_config.json` upstream, incluyendo ajustes de muestreo de audio específicos del modelo de voz. No se dispone de información sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Reconocimiento automático de voz (ASR): entrada de audio, salida de texto.
- Síntesis de voz (TTS): salida de audio a 24 kHz mediante `Llm::generateTTS` y `setWavformCallback`.
- Conversación multimodal audio-texto con generación de texto y voz.
- Entrada de imágenes mediante la etiqueta `<img>/ruta/imagen.jpg</img>` en los mensajes (según el soporte de modalidades del modelo).
- Entrada de audio mediante `<audio>/ruta/audio.wav</audio>`.
- Entrada de fotogramas de vídeo a través de `MultimodalPrompt` (en las pruebas del autor solo se validó la ruta de entrada con imágenes estáticas repetidas).
- Ejecución en CPU por defecto y aceleración Metal en Apple Silicon (los submodelos de medios permanecen en CPU).
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la validación de voz publicada cubre inglés.

## Casos de uso

- Transcripción de audio a texto en local: el codificador de audio INT8 y el backbone INT4 permiten ejecutar ASR en CPU sin GPU dedicada, útil para dictado, subtitulado o notas de reuniones en equipos de sobremesa y portátiles.
- Síntesis de voz para asistentes embebidos: la API `generateTTS` con salida a 24 kHz permite integrar respuestas habladas en aplicaciones de escritorio o móviles con MNN, sin depender de servicios en la nube.
- Conversación por voz bidireccional en inglés: el modelo acepta audio y devuelve texto y voz, lo que habilita prototipos de asistente conversacional siempre que se asuma la validación limitada a inglés del autor.
- Despliegue en Apple Silicon con Metal: activando `backend_type: metal` en `config.json` se puede acelerar el backbone en Mac con chip M-series, manteniendo los submodelos de medios en CPU, adecuado para demos y herramientas de desarrollo locales.
- Procesamiento por lotes de audio en pipelines de CI o servidores sin GPU: al compilar MNN con `MNN_BUILD_LLM=ON` y `MNN_BUILD_AUDIO=ON` se obtiene un binario `llm_demo` que puede invocarse desde scripts para transcribir o generar voz de forma reproducible.
- Evaluación de cuantización HQQ INT4 en modelos de audio: el repositorio sirve como referencia para medir el impacto de INT4 con grupo 64 en tareas de ASR y TTS frente al modelo original en BF16/FP16.
- Integración en aplicaciones móviles o de borde: MNN está orientado a inferencia en dispositivos, por lo que este paquete es un punto de partida para llevar un modelo de voz de 2B a entornos con memoria limitada (el repositorio completo ocupa 1,5 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta pruebas de humo en macOS Apple Silicon con el runtime compilado desde el mismo commit: `asr-cpu`, `asr-metal`, `tts-metal`, `tts-roundtrip` y `mixed-english`, verificadas por separado en CPU y Metal. No se aportan métricas de WER, MOS, latencia ni throughput.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio pesa 1,5 GB; con cuantización HQQ INT4 en el backbone y INT8/FP16 en los módulos de audio, la huella de pesos es del orden de 1,5 GB, más overhead del runtime y del estado de inferencia (no cuantificado en la información disponible).
- GPU recomendadas: no se especifican. El autor valida CPU y Metal en Apple Silicon; no hay datos de CUDA, A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no confirmada para GPUs NVIDIA. En Apple Silicon se valida la ruta Metal con los submodelos de medios en CPU.
- Opciones de despliegue: runtime MNN compilado desde el commit `5085d5622` (o posterior compatible) con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON`, `MNN_SUPPORT_TRANSFORMER_FUSE=ON`, `MNN_BUILD_AUDIO=ON`, `MNN_BUILD_OPENCV=ON` y `MNN_IMG_CODECS=ON`; binario `llm_demo`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato / runtime | Estado |
|---|---|---|---|---|---|---|
| LFM3-Audio-2B-MNN (este) | 2B | no disponible | audio+texto → texto+audio | LFM Open License v1.0 | MNN, HQQ INT4/INT8/FP16 | Conversión comunitaria de taobao-mnn, validación limitada |
| LiquidAI/LFM3-Audio-2B | 2B | no disponible | audio+texto → texto+audio | LFM Open License v1.0 | Pesos originales (formato no detallado) | Modelo upstream de Liquid AI |
| Otros modelos any-to-any de ~2B | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento (WER, MOS, benchmarks) con alternativas de la misma categoría.

## Limitaciones y advertencias

- La validación publicada son pruebas de humo en macOS Apple Silicon; no cubren contextos largos, todos los idiomas, todos los dispositivos ni tareas de agente.
- La generación nativa de voz en chino no está validada en calidad; pruebas previas mostraron desajustes entre voz y texto tanto en el modelo HF original como en MNN. La validación de voz de esta release cubre inglés.
- La prueba de vídeo usa fotogramas de imagen estática repetidos y solo valida la ruta de entrada, no la calidad de comprensión de vídeo.
- Requiere compilar MNN desde un commit concreto o posterior compatible; las versiones publicadas antiguas pueden no incluir soporte para LFM3.
- Licencia LFM Open License v1.0: es una licencia "other" con posibles restricciones para uso comercial; debe revisarse el archivo LICENSE antes de producción.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse con pruebas propias antes de desplegar.
- Idiomas soportados no declarados; no asumir cobertura multilingüe más allá de lo validado.
- El repositorio no incluye pesos en safetensors ni GGUF; no es directamente compatible con vLLM, llama.cpp u Ollama.
- No hay métricas de latencia ni throughput publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taobao-mnn/LFM3-Audio-2B-MNN
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Revisión upstream usada: https://huggingface.co/LiquidAI/LFM3-Audio-2B/tree/2d6c1f99c129b3ef07a8d168bc0ff08e2bdb93f1
- Repositorio MNN: https://github.com/alibaba/MNN
- Commit de MNN usado: https://github.com/alibaba/MNN/commit/5085d56221b939b8fd5e52885d2a4f295c6bbcc6
- Descarga vía ModelScope: `MNN/LFM3-Audio-2B-MNN`
