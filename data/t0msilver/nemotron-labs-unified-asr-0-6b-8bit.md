# T0mSIlver/nemotron-labs-unified-asr-0.6b-8bit

## Resumen

Nemotron-labs-unified-asr-0.6b-8bit es una conversión a formato MLX y cuantización de 8 bits del modelo de reconocimiento automático del habla (ASR) `nvidia/nemotron-labs-unified-asr-0.6b`, publicada por el usuario T0mSIlver. El modelo original lo desarrolla NVIDIA y emplea una arquitectura RNNT (Recurrent Neural Network Transducer), lo que le permite realizar tanto transcripción offline como streaming con una latencia controlable. Esta conversión concreta está pensada para ejecutarse de forma nativa en hardware Apple Silicon mediante la librería `mlx-audio`.

El modelo resuelve el problema de la transcripción multilingüe en 25 idiomas europeos con un único checkpoint, incorporando puntuación y capitalización en la salida. Su principal valor diferencial es la capacidad de streaming con buffers de contexto izquierdo y derecho, con latencias que van de 160 ms a 2,08 s, lo que lo hace adecuado para aplicaciones de dictado y subtitulado en tiempo real.

Con 626.702.592 parámetros totales, un repositorio de 0,7 GB y pesos en safetensors, esta versión cuantizada a 8 bits (grupo 64 en capas Linear y Embedding, resto en bfloat16) reduce el peso a 744 MB frente a los 1,25 GB de la versión bf16. La licencia es OpenMDW 1.1, la misma que el modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNNT (Recurrent Neural Network Transducer), modelo nemotron_asr |
| Parametros totales | 626.702.592 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; streaming con 5,6 s de contexto izquierdo y contexto derecho configurable |
| Tipos de cuantizacion | 8-bit (esta versión), 4-bit y bf16 disponibles en repositorios separados |
| Idiomas soportados | 25 idiomas europeos: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un RNNT de NVIDIA, una arquitectura transducer que combina un encoder acústico con un predictor y una red de unión para alinear secuencias de audio y texto sin necesidad de segmentación previa. Esta versión ha sido convertida a MLX con la herramienta `nemotron_asr.convert` de `mlx-audio` a partir de la revisión `023ce907` del modelo original. La conversión aplica cuantización de 8 bits con grupo de 64 a las capas Linear y Embedding, manteniendo el resto de pesos en bfloat16.

El modelo está diseñado para funcionar con un único checkpoint tanto en modo offline como en streaming. En modo streaming, el procesamiento es bufferizado: cada paso re-codifica 5,6 s de contexto izquierdo junto con el nuevo fragmento y su contexto derecho. La entrada debe ser audio mono a 16 kHz con una duración mínima de 80 ms. No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla (ASR) en 25 idiomas europeos con un único checkpoint.
- Transcripción offline y streaming con el mismo modelo.
- Streaming con latencia configurable entre 160 ms y 2,08 s.
- Generación de puntuación y capitalización en la salida transcrita.
- Procesamiento de audio mono a 16 kHz con fragmentos mínimos de 80 ms.
- Soporte de contexto izquierdo y derecho configurable para el streaming bufferizado.
- Integración con `mlx-audio` en Python y con `mlx-audio-swift` en Swift para Apple Silicon.
- Selección explícita de idioma mediante el parámetro `language`.

## Casos de uso

- **Dictado en tiempo real en aplicaciones de escritorio:** el modelo puede crear una sesión de streaming con `create_streaming_session(language="en", transcription_delay_ms=320)` y transcribir la voz del usuario con puntuación y capitalización, integrándose en editores de texto o asistentes de productividad en macOS.
- **Subtitulado automático de reuniones y videollamadas:** con latencias de 160 ms a 2,08 s y soporte de 25 idiomas, permite generar subtítulos en directo durante conferencias multilingües, eligiendo el idioma hablado para evitar errores de detección automática en latencias bajas.
- **Transcripción por lotes de archivos de audio:** el modo offline permite procesar grabaciones completas de entrevistas, podcasts o notas de voz, aprovechando la capacidad multilingüe para contenido en varios idiomas europeos.
- **Accesibilidad para personas con discapacidad auditiva:** la salida con puntuación y capitalización facilita la lectura de transcripciones en vivo en aplicaciones de accesibilidad, con la ventaja de ejecutarse localmente en hardware Apple Silicon sin enviar audio a la nube.
- **Análisis de llamadas de atención al cliente:** el modelo puede transcribir conversaciones telefónicas grabadas en distintos idiomas europeos para su posterior análisis de sentimiento, control de calidad o extracción de motivos de contacto.
- **Sistemas de voz a texto en dispositivos sin conexión:** al ejecutarse con MLX en Apple Silicon, permite construir aplicaciones de transcripción que funcionan completamente offline, preservando la privacidad del audio del usuario.
- **Generación de actas de reuniones multilingües:** combinado con un modelo de lenguaje posterior, la transcripción precisa y puntuada sirve como entrada para resumir reuniones en las que participan hablantes de varios idiomas europeos.

## Benchmarks y rendimiento

La model card no incluye tablas de WER propias para esta conversión; indica explícitamente que las tablas de WER de NVIDIA (offline y streaming, FLEURS, MCV, MLS y conjuntos Open ASR en inglés) corresponden al modelo NeMo en bf16, no a esta conversión. Los datos disponibles son de paridad y velocidad:

| Metrica | Valor |
|---|---|
| Paridad con NeMo 3.1 (float32, encoder) | frames dentro de 8,2e-6 de NeMo; mismos tokens en configuraciones 5,6 s / 80 ms / 240 ms, 0,8 s / 80 ms / 240 ms y 0,8 s / 160 ms / 400 ms |
| Paridad con NeMo 3.1 (Swift, bfloat16) | texto de NeMo en 10 de 12 clips (3 ediciones de palabra en 355 palabras) |
| Streaming a 320 ms, 8-bit (260 clips EN/FR, dictado con voz sintética) | recall de términos 60,7 %; WER en el resto de palabras 6,5 % (frente a 55,5 % y 11,7 % de `mlx-community/nemotron-3.5-asr-streaming-0.6b-8bit`) |
| Tiempo medio por paso de 80 ms en M1 Pro (Swift), latencia 320 ms, layout 5,6 s / 80 ms / 240 ms | 8-bit: 68,6 ms; 4-bit: 68,7 ms; bf16: 64,8 ms |
| Activaciones float16 (mismo layout) | 57,4 ms por paso (16 % de ahorro), misma precisión en clips cortos |
| Chunk de 160 ms con contexto derecho de 160 ms (misma latencia) | 34,7 ms por paso en GPU (mitad), +0,6 puntos de WER en FLEURS |
| Chunk de 160 ms con activaciones float16 | 26,9 ms por paso, 896 MB de memoria pico, estable durante 30 minutos |

## Requisitos de hardware

- **VRAM/memoria unificada estimada:** esta versión de 8 bits ocupa 744 MB en disco; la versión 4-bit ocupa 472 MB y la bf16 1,25 GB. La memoria pico medida en streaming con chunk de 160 ms y activaciones float16 es de 896 MB.
- **GPU recomendadas:** hardware Apple Silicon (probado en M1 Pro). El modelo está diseñado para MLX, por lo que no está pensado para GPUs NVIDIA en este formato.
- **Compatibilidad con GPU de consumo:** sí, cabe en cualquier Mac con Apple Silicon gracias a su reducido tamaño; no se dispone de datos para GPUs de consumo NVIDIA en esta conversión.
- **Opciones de despliegue:** `mlx-audio` (Python) y `mlx-audio-swift` (Swift). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI en esta conversión.
- **Latencia y throughput:** 68,6 ms por paso de 80 ms en M1 Pro con 8-bit a 320 ms de latencia; 34,7 ms por paso con chunk de 160 ms y contexto derecho de 160 ms; 26,9 ms por paso con activaciones float16. La cuantización ahorra memoria, no tiempo: el paso está limitado por cómputo a 75 frames.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Streaming | Formato | Licencia |
|---|---|---|---|---|---|
| T0mSIlver/nemotron-labs-unified-asr-0.6b-8bit (este) | 626,7 M | 25 europeos | Sí, 160 ms–2,08 s | MLX safetensors 8-bit | OpenMDW 1.1 |
| T0mSIlver/nemotron-labs-unified-asr-0.6b-4bit | 626,7 M | 25 europeos | Sí | MLX safetensors 4-bit (472 MB) | OpenMDW 1.1 |
| T0mSIlver/nemotron-labs-unified-asr-0.6b-bf16 | 626,7 M | 25 europeos | Sí | MLX safetensors bf16 (1,25 GB) | OpenMDW 1.1 |
| mlx-community/nemotron-3.5-asr-streaming-0.6b-8bit | no disponible | no disponible | Sí | MLX 8-bit | no disponible |

En la prueba de dictado EN/FR a 320 ms, esta conversión obtiene un recall de términos del 60,7 % y un WER del 6,5 % en el resto de palabras, frente al 55,5 % y 11,7 % del modelo `mlx-community/nemotron-3.5-asr-streaming-0.6b-8bit`. No se dispone de datos de benchmarks frente a otras familias de ASR en la información proporcionada.

## Limitaciones y advertencias

- Es recomendable pasar el idioma hablado de forma explícita: con latencia baja, el modo `auto` puede comprometer los primeros tokens en el idioma equivocado, según advierte la model card de NVIDIA.
- El contexto izquierdo debe mantenerse en 2 s o más; por debajo de ese valor, NVIDIA reporta degradación de la precisión.
- Las tablas de WER publicadas por NVIDIA corresponden al modelo NeMo en bf16, no a esta conversión MLX cuantizada, por lo que no deben tomarse como métricas de esta versión.
- La cuantización a 8 bits no reduce el tiempo de inferencia (el paso está limitado por cómputo a 75 frames); solo ahorra memoria.
- El modelo está orientado a MLX y Apple Silicon; no se documenta soporte para otras plataformas de inferencia en esta conversión.
- Riesgo de errores en la transcripción en audio con ruido, acentos no representados en el entrenamiento o solapamiento de hablantes; no se dispone de datos específicos de sesgos en la información proporcionada.
- La licencia OpenMDW 1.1 condiciona el uso comercial; los pesos convertidos son un derivado del modelo de NVIDIA y su uso se rige por el acuerdo OpenMDW 1.1.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación comunitaria amplia.

## Enlaces

- [Hugging Face: T0mSIlver/nemotron-labs-unified-asr-0.6b-8bit](https://huggingface.co/T0mSIlver/nemotron-labs-unified-asr-0.6b-8bit)
- [Modelo base: nvidia/nemotron-labs-unified-asr-0.6b](https://huggingface.co/nvidia/nemotron-labs-unified-asr-0.6b)
- [Versión bf16](https://huggingface.co/T0mSIlver/nemotron-labs-unified-asr-0.6b-bf16)
- [Versión 4-bit](https://huggingface.co/T0mSIlver/nemotron-labs-unified-asr-0.6b-4bit)
- [Licencia OpenMDW 1.1](https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1)
