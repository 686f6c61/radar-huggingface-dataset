# xix3r/voxix-whisper-base.en-gguf

## Resumen

voxix-whisper-base.en-gguf es una conversión a formato GGUF del modelo openai/whisper-base.en, preparada por el usuario xix3r para su uso con la librería transcribe.cpp. Se trata de un modelo de reconocimiento automático del habla (ASR) de tipo encoder-decoder transformer, especializado exclusivamente en inglés y derivado del checkpoint base de la familia Whisper de OpenAI. El modelo original fue entrenado sobre 680.000 horas de audio etiquetado mediante supervisión débil a gran escala, lo que le permite generalizar a dominios y acentos sin fine-tuning adicional.

La relevancia de esta ficha radica en su formato de despliegue: la conversión a GGUF con múltiples niveles de cuantización (desde F32 hasta Q4_K_M) permite ejecutar un modelo ASR de 72,6 millones de parámetros en hardware de consumo, incluyendo CPU y GPUs integradas, con un rendimiento en tiempo real muy superior al necesario para transcripción offline. El modelo procesa ventanas de audio de 30 segundos con decodificación por trozos para audio de formato largo.

Con 72.609.888 parámetros y un repositorio de 0,1 GB, esta variante está pensada para pipelines de transcripción ligeros, aplicaciones de escritorio y entornos con recursos limitados donde el inglés es el idioma objetivo y no se requiere traducción ni detección de idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 72.609.888 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos con decodificación por trozos para formato largo |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper descrita en el paper "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., OpenAI): un transformer encoder-decoder también denominado sequence-to-sequence. El encoder procesa espectrogramas de audio en ventanas de 30 segundos y el decoder genera la transcripción de forma autorregresiva. La variante base.en es la versión monolingüe en inglés del checkpoint base, entrenada exclusivamente en la tarea de reconocimiento del habla (no en traducción).

El entrenamiento original empleó 680.000 horas de datos de audio etiquetados mediante supervisión débil a gran escala, lo que proporciona una capacidad de generalización notable sin necesidad de ajuste fino. La model card no detalla la composición exacta del dataset ni si hubo etapas de RLHF o DPO; esos datos corresponden al modelo upstream y no se reproducen en la información disponible. La conversión a GGUF se realizó a partir del commit 911407f de openai/whisper-base.en, fijado el 2026-04-25, y se validó contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp el 2026-04-26.

## Capacidades

- Transcripción de voz a texto en inglés con salida de marcas de tiempo a nivel de segmento.
- Procesamiento de audio de formato largo mediante decodificación por trozos sobre ventanas de 30 segundos.
- Decodificación greedy con supresión de tokens, fallback de temperatura y timestamps de segmento activados por defecto en transcribe.cpp.
- No soporta streaming (streaming: false).
- No soporta traducción de voz (translate: false).
- No soporta detección automática de idioma (lang_detect: false).
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo thinking, visión ni audio más allá de la entrada ASR estándar.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Transcripción de reuniones y notas de voz en inglés: el modelo procesa ventanas de 30 segundos con decodificación por trozos, lo que permite transcribir grabaciones de duración arbitraria en entornos de escritorio con CPU o GPU integrada.
- Subtitulado automático de vídeo en inglés: la salida con timestamps a nivel de segmento facilita la generación de ficheros de subtítulos sincronizados sin postprocesado adicional.
- Dictado por voz en aplicaciones de escritorio: con cuantización Q4_K_M (56 MB) el modelo cabe en memoria de cualquier equipo y puede ejecutarse localmente sin conexión, preservando la privacidad del audio.
- Indexación y búsqueda de archivos de audio: la transcripción en texto permite alimentar motores de búsqueda o sistemas de recuperación sobre archivos de audio en inglés.
- Transcripción en dispositivos de borde: el rendimiento medido en CPU (RTF 12,8 en Ryzen 4750U y 38,2 en M4 Max) permite ejecución en tiempo real en portátiles sin GPU dedicada.
- Pipelines de accesibilidad: generación de transcripciones para contenido audiovisual en inglés en aplicaciones de accesibilidad, con despliegue mediante transcribe.cpp y sin dependencias de servicios en la nube.
- Procesamiento por lotes de audio en servidores modestos: la variante Q8_0 (81 MB) ofrece un WER de 4,16% con un coste de memoria mínimo, adecuada para trabajos batch en CPU.

## Benchmarks y rendimiento

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 279 MB | 4,14% |
| F16 | 144 MB | 4,13% |
| Q8_0 | 81 MB | 4,16% |
| Q6_K | 65 MB | 4,15% |
| Q5_K_M | 61 MB | 4,16% |
| Q4_K_M | 56 MB | 4,29% |

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 211,9 |
| Apple M4 Max | CPU | 38,2 |
| AMD Ryzen 4750U | Vulkan | 36,2 |
| AMD Ryzen 4750U | CPU | 12,8 |

El WER se midió sobre el split completo LibriSpeech test-clean (2620 enunciados) con la decodificación por defecto de transcribe.cpp. El dato autoinformado por OpenAI sobre el mismo split es 4,25%. La model card advierte que las reducciones paralelas no deterministas de Metal pueden desplazar el WER del corpus en torno a 0,1 puntos porcentuales entre ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia: desde 56 MB (Q4_K_M) hasta 279 MB (F32). El modelo completo en F32 ocupa menos de 300 MB.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA). No requiere GPUs de datacenter como A100 o H100.
- Cabe en cualquier GPU de consumo e incluso en GPUs integradas; también funciona íntegramente en CPU.
- Opciones de despliegue: transcribe.cpp (compilación desde fuente con CMake), con binario transcribe-cli. No se indica soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 211,9 en Metal sobre M4 Max, 38,2 en CPU sobre M4 Max, 36,2 en Vulkan sobre Ryzen 4750U y 12,8 en CPU sobre Ryzen 4750U. Un RTF superior a 1 indica procesamiento más rápido que tiempo real.
- El audio de entrada debe ser WAV mono a 16 kHz; la model card recomienda convertir con ffmpeg si es necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---:|---|---|---|---|
| xix3r/voxix-whisper-base.en-gguf | 72,6 M | ventanas de 30 s | en | Apache-2.0 | GGUF |
| openai/whisper-base.en | 72,6 M | ventanas de 30 s | en | Apache-2.0 | safetensors/bin |
| openai/whisper-base | no disponible en la informacion | ventanas de 30 s | multilingue | Apache-2.0 | safetensors/bin |

La comparación con otros modelos ASR de tamano similar (por ejemplo, variantes tiny o small de Whisper, o modelos de otras familias) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés: no transcribe otros idiomas ni traduce.
- No soporta streaming ni detección automática de idioma.
- Riesgo de alucinación en clips cortos con ruido de fondo, según advierte la model card al comentar la variabilidad del WER en Metal.
- El WER puede variar en torno a 0,1 puntos porcentuales entre ejecuciones por reducciones paralelas no deterministas en Metal.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar los términos upstream.
- El modelo requiere audio WAV mono a 16 kHz; no procesa directamente otros formatos sin conversión previa.
- No dispone de tool calling, agentes ni capacidades multimodales más allá de la entrada de audio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de adopción comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/xix3r/voxix-whisper-base.en-gguf
- Modelo base: https://huggingface.co/openai/whisper-base.en
- Commit del modelo base: https://huggingface.co/openai/whisper-base.en/commit/911407f
- Paper: https://arxiv.org/abs/2212.04356
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-base.en.md
- Repositorio original de OpenAI Whisper: https://github.com/openai/whisper
- Descarga F32: https://huggingface.co/handy-computer/whisper-base.en-gguf/resolve/main/whisper-base.en-F32.gguf
- Descarga F16: https://huggingface.co/handy-computer/whisper-base.en-gguf/resolve/main/whisper-base.en-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/whisper-base.en-gguf/resolve/main/whisper-base.en-Q8_0.gguf
- Descarga Q6_K: https://huggingface.co/handy-computer/whisper-base.en-gguf/resolve/main/whisper-base.en-Q6_K.gguf
- Descarga Q5_K_M: https://huggingface.co/handy-computer/whisper-base.en-gguf/resolve/main/whisper-base.en-Q5_K_M.gguf
- Descarga Q4_K_M: https://huggingface.co/handy-computer/whisper-base.en-gguf/resolve/main/whisper-base.en-Q4_K_M.gguf
