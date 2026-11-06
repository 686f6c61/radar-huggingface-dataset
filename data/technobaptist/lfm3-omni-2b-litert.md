# TechnoBaptist/LFM3-Omni-2B-LiteRT

## Resumen

LFM3-Omni-2B-LiteRT es una conversión al formato LiteRT del modelo LiquidAI/LFM3-Omni-2B, un modelo multimodal "any-to-any" de 2,17 mil millones de parámetros desarrollado originalmente por Liquid AI. Esta versión, publicada por el usuario TechnoBaptist, empaqueta el modelo en un único archivo `.litertlm` de 3,23 GB (decoder en int8, con los encoders de visión y audio embebidos) para su ejecución en dispositivos edge mediante el runtime LiteRT-LM de Google, además de grafos LiteRT independientes y un runner en Python para la salida de voz.

El modelo acepta entrada de texto, imagen y audio, y produce respuestas en texto o en voz (text-to-speech). La conversión se realizó desde la revisión `ce2458cb` del modelo original en BF16 y conserva el tokenizador y la licencia del modelo fuente. La relevancia de esta ficha radica en que demuestra la viabilidad de ejecutar un modelo omni-modal de 2B en hardware móvil de consumo, con métricas medidas en dispositivos reales como Galaxy S26 y Pixel 8a.

El contexto declarado es de 4.096 tokens, el modelo solo soporta inglés y su licencia es LFM1.0 (marcada como "other" en Hugging Face). No se han publicado resultados de benchmarks estándar en la información disponible; las únicas métricas son de rendimiento de inferencia en dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any): decoder de lenguaje + encoder de visión + encoder de audio + decoder de codec de voz; conversión a LiteRT |
| Parametros totales | 2,17 B (BF16 en el modelo fuente) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | int8 (decoder del archivo `.litertlm`); grafos de voz en float32; activaciones fp16/fp32 en runtime |
| Idiomas soportados | inglés (en) |
| Licencia | LFM1.0 (license_name: lfm1.0; en Hugging Face aparece como "other") |
| Formato de pesos | `.litertlm`, `.tflite` (LiteRT), `tokenizer.json`; el modelo fuente también publica GGUF |

## Arquitectura y entrenamiento

El modelo base LFM3-Omni-2B es un modelo multimodal de Liquid AI que procesa texto, imagen, vídeo y audio, y genera texto o voz. La arquitectura concreta (tipo de transformer, detalles del decoder de lenguaje, composición del dataset de entrenamiento, uso de RLHF/DPO) no se detalla en la información proporcionada; solo se indica que el modelo fuente tiene 2,17 B de parámetros en BF16 y que fue convertido a LiteRT en la revisión `ce2458cb`.

La conversión a LiteRT incluye un decoder de lenguaje en int8 con los encoders de visión y audio embebidos en un único archivo `.litertlm`. Para la salida de voz se proporcionan grafos separados: un decoder de profundidad (`depth_step` y `depth_frame2`), un embedding de frame, un decoder de codec (12 frames o 1 frame por llamada) y una ventana de overlap-add. El decoder de profundidad en `depth_frame2` integra en el grafo las tres pasadas y el muestreo de los 12 códigos de un frame de 80 ms, con temperatura 0,4 y penalización por repetición 1,2 como constantes. No se dispone de información sobre el número de tokens de entrenamiento ni sobre innovaciones técnicas del modelo original más allá de su naturaleza omni-modal.

## Capacidades

- Generación de texto a partir de entrada de texto, imagen o audio (audio leído en ventanas de 30 s).
- Salida de voz (text-to-speech) mediante grafos LiteRT y runner en Python.
- Respuestas habladas intercaladas (`--speech interleaved`) a partir de una pregunta.
- Reconocimiento automático de voz (ASR) en inglés mediante prompt de sistema.
- Comprensión de imágenes (p. ej., descripción de animales en una foto).
- Procesamiento de audio de hasta 30 s por ventana para respuesta en texto, siempre que quepa en el contexto de 4.096 tokens.
- Multimodalidad "any-to-any" limitada a texto, imagen y audio (el vídeo no está soportado en esta conversión).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Asistente de voz en dispositivo móvil: el modelo puede responder hablando a preguntas formuladas por voz, con una latencia de primer sonido de 2,0-2,2 s tras la pregunta en un Galaxy S26, lo que lo hace adecuado para asistentes offline en modo avión.
- Descripción de imágenes en el edge: con entrada de imagen y salida de texto, puede usarse para accesibilidad (lectura de fotos) o clasificación visual básica sin conexión a la nube.
- Transcripción y comprensión de audio (ASR): mediante un prompt de sistema "Perform ASR in English", permite dictado o notas de voz en inglés procesadas localmente.
- Traducción de texto a voz para lectores de pantalla: el pipeline de TTS (grafos de codec y decoder de profundidad) permite convertir texto en audio en el propio dispositivo, con un coste de 0,48-0,50 s de cómputo por segundo de audio en CPU M4 Max.
- Chat multimodal por voz en apps Android: el ejemplo `photo_voice_chat` (Kotlin, LiteRT 2.3.0) demuestra conversaciones foto+voz en un Pixel 11 Pro y Galaxy S26, útil para apps de asistencia personal sin backend.
- Procesamiento de grabaciones largas: grabaciones de hasta 251 s se procesan en ventanas de 30 s para dar una respuesta de texto dentro del contexto de 4.096 tokens, útil para resúmenes de reuniones o notas de voz extensas.
- Prototipado de modelos omni-modales en edge: investigadores pueden usar el runner de Python y los fixtures incluidos para validar el comportamiento del modelo en Mac antes de desplegarlo en Android.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas son de rendimiento de inferencia en dispositivo:

| Escenario | Backend | Prefill (tok/s) | Decode (tok/s) | TTFT | Memoria pico |
|---|---|---:|---:|---:|---:|
| Galaxy S26, 1.024 prompt tok, 256 gen tok | GPU (fp16 activaciones) | 1.139 | 27,0 | 0,93-0,94 s | 1,05 GB (+3,08 GB GPU) |
| Galaxy S26, 1.024 prompt tok, 256 gen tok | CPU, 4 hilos | 557 | 25,9 | 1,8-1,9 s | 3,42 GB |

Con activaciones fp32 en la misma GPU, el decoder rinde 270 tok/s en prefill y 23,5 tok/s en decode. En salida de voz: 0,48-0,50 s de cómputo por segundo de audio en Mac M4 Max (CPU), y aproximadamente 6 ms por cada 0,96 s de audio en el codec. En Android, generar un segundo de voz tarda 0,75-0,80 s en Galaxy S26 (GPU, fp16) y 1,58-1,62 s en Pixel 11 Pro.

## Requisitos de hardware

- VRAM/RAM para inferencia: el archivo `.litertlm` ocupa 3,23 GB en disco; en Galaxy S26 la memoria pico del proceso es de 1,05 GB en GPU (más 3,08 GB de asignaciones GPU) y 3,42 GB en CPU.
- GPU recomendadas: no se especifican modelos de escritorio; las pruebas se realizaron en GPU móviles (Galaxy S26, Pixel 8a, Pixel 11 Pro). El runner de Python se midió en CPU de Mac M4 Max.
- Cabe en hardware de consumo: sí, en teléfonos de gama alta (Galaxy S26, Pixel 8a, Pixel 11 Pro). No se documenta su ejecución en GPU de escritorio como RTX 4090 o A100.
- Opciones de despliegue: LiteRT-LM 0.18.1 (CPU o GPU), LiteRT 2.3.0 en Android (Kotlin), runner de Python incluido; el modelo fuente está disponible en GGUF para otros runtimes.
- Latencia y throughput: ver tabla de benchmarks; el primer token llega en 0,93-0,94 s en GPU de Galaxy S26 y el decode es de 27,0 tok/s.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada. Como referencia, el propio modelo fuente LiquidAI/LFM3-Omni-2B (BF16) y su versión GGUF (LiquidAI/LFM3-Omni-2B-GGUF) son las alternativas directas, pero no se aportan métricas comparativas de calidad.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-LiteRT (este) | 2,17 B | 4.096 | LiteRT (.litertlm, .tflite) | LFM1.0 | Hugging Face |
| LiquidAI/LFM3-Omni-2B | 2,17 B | no disponible | BF16 (safetensors presumiblemente) | LFM1.0 | Hugging Face |
| LiquidAI/LFM3-Omni-2B-GGUF | 2,17 B | no disponible | GGUF | LFM1.0 | Hugging Face |

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Contexto limitado a 4.096 tokens; grabaciones largas pueden no caber (una de 502 s no cupo, una de 251 s sí).
- El vídeo no está soportado en esta conversión LiteRT, aunque el modelo base lo procese.
- La salida de voz acepta texto o una grabación de 30 s o menos; no se documenta para entradas más largas.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.
- Riesgo de alucinación inherente a modelos de lenguaje; no se aportan evaluaciones de fidelidad.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia LFM1.0: es necesario revisar los términos en el enlace de licencia antes de uso comercial; Hugging Face la marca como "other".
- El repositorio tiene 0 descargas y 0 likes, y fue creado el 1 de noviembre de 2026; es una conversión de terceros, no oficial de Liquid AI.
- El runner de Python crea un nuevo Engine por pregunta, lo que puede afectar a la latencia en producción.
- Las métricas de rendimiento se midieron en dispositivos concretos y pueden no reproducirse en otros hardware.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/TechnoBaptist/LFM3-Omni-2B-LiteRT
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Versión GGUF: https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF
- Licencia: https://huggingface.co/litert-community/LFM3-Omni-2B-LiteRT/blob/main/LICENSE
- Ejemplo Android `photo_voice_chat` (PR 507): https://github.com/google-ai-edge/litert-samples/pull/507
