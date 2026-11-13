# xix3r/voxix-moonshine-base-gguf

## Resumen

voxix-moonshine-base-gguf es una conversión a formato GGUF del modelo Moonshine base de Useful Sensors, publicada por el usuario xix3r para su uso con la librería transcribe.cpp. Se trata de un modelo encoder-decoder de 61,5 millones de parámetros especializado en reconocimiento automático del habla (ASR) en inglés, que procesa audio PCM crudo a 16 kHz sin necesidad de calcular espectrogramas STFT ni características mel.

El modelo original, Moonshine base, fue desarrollado por Useful Sensors y presentado en el artículo arXiv:2410.15608 como una alternativa eficiente a Whisper para transcripción en dispositivos con recursos limitados. Esta conversión GGUF permite ejecutar el modelo en CPU y GPU mediante transcribe.cpp, con cuantizaciones que reducen el peso desde 236 MB en F32 hasta 74 MB en Q8_0 sin degradación medible del WER.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar transcripción de voz en inglés en entornos locales, sin dependencias de Python ni de frameworks pesados, con un rendimiento validado frente a la referencia de transformers y con licencia MIT que facilita su integración comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con stem Conv1d de tres capas (sin STFT ni mel) |
| Parámetros totales | 61.513.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada; max_length de generación 194 tokens) |
| Tipos de cuantización | F32, F16, Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer encoder-decoder con 8 capas en el encoder y 8 en el decoder, tamaño oculto de 416 y RoPE parcial con factor 0,62. La entrada es audio PCM crudo a 16 kHz mono, procesado directamente por un stem de tres capas Conv1d, lo que elimina el cálculo de espectrogramas STFT y características mel presentes en Whisper. La salida es únicamente texto transcrito, sin marcas de tiempo, sin detección de idioma y sin traducción.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo base fue entrenado por Useful Sensors y validado en el artículo arXiv:2410.15608, que reporta un WER del 3,27 % en LibriSpeech test-clean. La conversión GGUF fue realizada a partir del commit 7a73d8d del modelo base, fijado el 2026-05-05, y validada contra la referencia de transformers en el commit 07a8a84 de transcribe.cpp el 2026-05-05.

## Capacidades

- Transcripción de voz a texto en inglés a partir de audio PCM a 16 kHz mono.
- Procesamiento directo de forma de onda sin extracción de características espectrales.
- Generación de transcripciones sin marcas de tiempo (timestamps: none).
- Sin soporte de traducción (translate: false).
- Sin detección de idioma (lang_detect: false).
- Sin soporte de streaming (streaming: false).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- Modelo monolingüe: únicamente inglés.

## Casos de uso

- Transcripción local de reuniones y notas de voz: el modelo puede procesar archivos WAV de 16 kHz mono en CPU o GPU mediante transcribe.cpp, con un peso de 74 MB en Q8_0 que permite ejecutarlo en portátiles sin GPU dedicada.
- Subtitulado de contenido audiovisual en inglés: conversión previa con ffmpeg a 16 kHz mono y transcripción por lotes con transcribe-cli, adecuado para pipelines de postproducción donde no se requieren marcas de tiempo.
- Asistentes de voz embebidos: el reducido tamaño (61,5 M de parámetros) y la licencia MIT permiten integrar el modelo en dispositivos con recursos limitados para comandos de voz en inglés.
- Indexación y búsqueda de archivos de audio: transcripción masiva de grabaciones para generar índices de texto searchables en sistemas de gestión documental.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en contenido hablado en inglés, ejecutándose en local sin enviar audio a servicios en la nube.
- Prototipado e investigación en ASR: base ligera para experimentos de reconocimiento de voz, ajuste fino o comparación de arquitecturas sin STFT, con validación numérica frente a transformers.
- Automatización de actas en entornos sin conectividad: despliegue en CPU con Vulkan o Metal según la plataforma, con ratios de tiempo real documentados.

## Benchmarks y rendimiento

| Modelo / cuantización | WER LibriSpeech test-clean | RTF Metal (M4 Max) | RTF Vulkan (Ryzen 4750U) | RTF CPU (Ryzen 4750U) |
|---|---:|---:|---:|---:|
| Moonshine base F32 (esta conversión) | 3,28 % | 79,5 | 34,5 | 22 |
| Moonshine base F16 | 3,28 % | no disponible | no disponible | no disponible |
| Moonshine base Q8_0 | 3,26 % | no disponible | no disponible | no disponible |
| Moonshine base upstream (paper, Tabla 2) | 3,27 % | no disponible | no disponible | no disponible |

El WER se midió sobre el split completo de LibriSpeech test-clean (2620 utterances) con la decodificación por defecto de transcribe.cpp (greedy, num_beams=1, max_length=194). La diferencia entre Q8_0 (3,26 %) y F32 (3,28 %) se sitúa dentro del intervalo de confianza bootstrap del 95 % y se considera ruido. No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones (236 MB en F32, 126 MB en F16, 74 MB en Q8_0).
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan; no se requieren A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier GPU integrada o dedicada con al menos 1 GB de memoria; también funciona en CPU.
- Opciones de despliegue: transcribe.cpp (compilación con CMake y ejecución con transcribe-cli); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: RTF de 79,5 en Metal (M4 Max), 34,5 en Vulkan (Ryzen 4750U) y 22 en CPU (Ryzen 4750U), lo que indica ejecución más rápida que tiempo real en todos los casos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER LibriSpeech test-clean | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| voxix-moonshine-base-gguf (este) | 61,5 M | no disponible | 3,26–3,28 % | MIT | GGUF en HF |
| Moonshine base (upstream) | 61,5 M | no disponible | 3,27 % | MIT | safetensors en HF |
| Whisper base | no disponible en la información | no disponible | no disponible | MIT | safetensors en HF |
| Whisper tiny | no disponible en la información | no disponible | no disponible | MIT | safetensors en HF |

No se dispone en la información proporcionada de datos de benchmarks de Whisper base o Whisper tiny para una comparación cuantitativa fiable; los valores se indican como no disponibles. La comparación cualitativa con Whisper se limita a que Moonshine elimina el cálculo de STFT y mel, lo que reduce el coste de preprocesado.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe inglés; no soporta otros idiomas.
- Sin marcas de tiempo: no genera timestamps, lo que limita su uso en subtitulado sincronizado.
- Sin detección de idioma ni traducción: no puede identificar el idioma del audio ni traducir la transcripción.
- Sin streaming: procesa el audio completo, no en tiempo real por fragmentos.
- Riesgo de alucinación: como todo modelo ASR, puede generar texto plausible en segmentos con ruido o silencio; el límite de max_length=194 mitiga bucles de hallucinación pero no los elimina.
- Sesgos: no se documentan sesgos específicos en la información proporcionada; al entrenarse presumiblemente con datos en inglés, puede tener peor rendimiento con acentos no nativos o variedades dialectales.
- Licencia MIT: permite uso comercial, pero se hereda del modelo base y se recomienda consultar la model card upstream para términos completos.
- Requiere audio de entrada a 16 kHz mono; es necesario convertir con ffmpeg si el formato difiere.
- Dependencia de transcribe.cpp: no es compatible con ecosistemas como transformers o llama.cpp sin conversión adicional.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/xix3r/voxix-moonshine-base-gguf
- Modelo base upstream: https://huggingface.co/UsefulSensors/moonshine-base
- Commit del modelo base: https://huggingface.co/UsefulSensors/moonshine-base/commit/7a73d8d
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/07a8a84
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine-base.md
- Artículo Moonshine (arXiv): https://arxiv.org/abs/2410.15608
- Blog de presentación: https://petewarden.com/2024/10/21/introducing-moonshine-the-new-state-of-the-art-for-speech-to-text/
- Repositorio Moonshine: https://github.com/usefulsensors/moonshine/blob/main/README.md
- Podcast: https://notebooklm.google.com/notebook/d787d6c2-7d7b-478c-b7d5-a0be4c74ae19/audio
- Model Cards for Model Reporting (arXiv): https://arxiv.org/abs/1810.03993
- Pesos F32: https://huggingface.co/handy-computer/moonshine-base-gguf/resolve/main/moonshine-base-F32.gguf
- Pesos F16: https://huggingface.co/handy-computer/moonshine-base-gguf/resolve/main/moonshine-base-F16.gguf
- Pesos Q8_0: https://huggingface.co/handy-computer/moonshine-base-gguf/resolve/main/moonshine-base-Q8_0.gguf
