# xix3r/voxix-moonshine-tiny-gguf

## Resumen

voxix-moonshine-tiny-gguf es una conversión al formato GGUF del modelo UsefulSensors/moonshine-tiny, un sistema de reconocimiento automático del habla (ASR) en inglés desarrollado por Useful Sensors. El modelo original, presentado en octubre de 2024, propone una arquitectura encoder-decoder de tipo transformer con tan solo 27 millones de parámetros que procesa audio PCM crudo a 16 kHz directamente, sin necesidad de calcular espectrogramas STFT ni filtros mel, lo que reduce la latencia y el coste computacional frente a aproximaciones como Whisper.

Esta ficha concreta, publicada por el usuario xix3r, empaqueta los pesos en formato GGUF para su uso con transcribe.cpp, una implementación en C++ orientada a inferencia local eficiente. La relevancia de esta conversión reside en que permite ejecutar un modelo ASR de calidad competitiva en hardware modesto (CPU, GPU integrada o dispositivos con Vulkan/Metal) sin depender de PyTorch ni de CUDA, lo que facilita el despliegue en entornos embebidos, aplicaciones de escritorio y sistemas con recursos limitados.

El modelo está pensado exclusivamente para transcripción de voz en inglés: no soporta traducción, detección de idioma ni marcas de tiempo, y no ofrece modo streaming. Su licencia MIT y su reducido tamaño lo convierten en una opción atractiva para prototipos y productos que requieran dictado o subtitulado local sin conexión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con stem Conv1d de tres capas (sin STFT ni mel) |
| Parametros totales | 27.092.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max_length de decodificación: 194 tokens) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder de tipo transformer. La entrada de audio se procesa mediante un stem de tres capas convolucionales 1D que consume directamente PCM a 16 kHz, evitando el cálculo explícito de características espectrales. El encoder transforma esa representación en estados ocultos y el decoder genera la transcripción token a token de forma autorregresiva. El modelo base fue entrenado por Useful Sensors y publicado junto con el artículo arXiv:2410.15608, que describe la motivación de eliminar el preprocesado STFT/mel para reducir latencia y complejidad.

La información disponible no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card original reproduce parcialmente la estructura de la ficha de Whisper y remite al paper para más detalles sobre el entrenamiento. La conversión a GGUF se realizó a partir del commit 390624e del modelo base (fijado el 2026-05-05) y se validó contra la referencia de transformers en el commit 07a8a84 de transcribe.cpp el 2026-05-05.

## Capacidades

- Transcripción de voz a texto en inglés a partir de audio PCM mono a 16 kHz.
- Procesamiento directo de forma de onda sin preprocesado STFT ni mel.
- Salida únicamente de transcripción (transcript-only), sin etiquetas adicionales.
- No soporta traducción a otros idiomas.
- No soporta detección automática de idioma.
- No genera marcas de tiempo (timestamps: none).
- No soporta streaming (streaming: false).
- No dispone de tool calling ni function calling.
- No está orientado a razonamiento multi-paso ni a uso como agente.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Dictado por voz en aplicaciones de escritorio: el modelo puede transcribir audio en tiempo real o por lotes en local gracias a su reducido tamaño (34 MB en Q8_0) y a su integración con transcribe.cpp, sin necesidad de GPU dedicada.
- Subtitulado de vídeos en inglés: se puede procesar la pista de audio convertida a WAV mono 16 kHz con ffmpeg y generar el texto para postprocesar los subtítulos, aunque sin timestamps nativos habrá que alinear manualmente o con otra herramienta.
- Asistentes de voz embebidos: su bajo consumo y la posibilidad de ejecución en CPU con Vulkan o Metal lo hacen adecuado para dispositivos con recursos limitados que requieran reconocimiento de comandos o dictado breve.
- Transcripción de reuniones y notas de voz: integrable en pipelines locales que conviertan el audio a 16 kHz mono y ejecuten transcribe-cli para obtener el texto, manteniendo la privacidad al no enviar datos a la nube.
- Automatización de accesibilidad: generación de transcripciones para contenido audiovisual en inglés dentro de herramientas de accesibilidad que se ejecuten en el propio dispositivo.
- Prototipado rápido de pipelines ASR: al estar disponible en GGUF y con una CLI sencilla, permite validar ideas y comparar con otras alternativas antes de escalar a modelos mayores.
- Filtrado y enrutado por voz en sistemas de atención al cliente: transcripción previa de mensajes de voz cortos para clasificarlos o derivarlos, siempre que el idioma sea inglés y no se requieran marcas temporales.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 |
|---|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 4,58 | 4,58 | 4,60 |
| RTF en M4 Max (Metal) | no disponible | no disponible | 127 |
| RTF en M4 Max (CPU) | no disponible | no disponible | 153,5 |
| RTF en Ryzen 4750U (Vulkan) | no disponible | no disponible | 56 |
| RTF en Ryzen 4750U (CPU) | no disponible | no disponible | 45,5 |

El WER se midió sobre el split completo de LibriSpeech test-clean (2620 utterances) con la decodificación por defecto de transcribe.cpp (greedy, num_beams=1, max_length=194). El dato autodeclarado por Useful Sensors en el mismo split es 4,55 %. La deriva de Q8_0 respecto a F32 es de +0,02 pp, dentro del ruido de bootstrap. Los valores de RTF (real-time factor) indican la relación entre tiempo de proceso y duración del audio; los datos disponibles no permiten convertirlos a latencia absoluta sin conocer la duración de las muestras evaluadas.

## Requisitos de hardware

- VRAM estimada: no aplica de forma estricta; el modelo en Q8_0 ocupa 34 MB, F16 57 MB y F32 105 MB en disco y en memoria.
- GPU recomendadas: no se especifican modelos concretos; los datos de RTF se han medido en un Apple M4 Max (Metal y CPU) y en un AMD Ryzen 4750U (Vulkan y CPU).
- Cabe en cualquier GPU consumer e integrada, así como en CPU convencionales, dado su reducido tamaño.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), y a través de transformers con el modelo base original (MoonshineForConditionalGeneration).
- Latencia y throughput: los RTF reportados (127 en Metal, 153,5 en CPU del M4 Max, 56 en Vulkan y 45,5 en CPU del Ryzen 4750U) indican un procesamiento muy por encima del tiempo real en esos entornos, aunque la información no detalla la metodología exacta ni la duración de las muestras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| moonshine-tiny (este modelo) | 27 M | audio PCM 16 kHz, max_length 194 tokens | inglés | MIT | GGUF, safetensors |
| Whisper tiny | no disponible en la información | audio 16 kHz con mel | multilingüe | MIT | safetensors, GGUF (conversiones de terceros) |
| Whisper base | no disponible en la información | audio 16 kHz con mel | multilingüe | MIT | safetensors, GGUF (conversiones de terceros) |

La información proporcionada no incluye datos de benchmarks comparativos con Whisper ni con otros modelos ASR, por lo que no es posible establecer una comparación cuantitativa de rendimiento. Las diferencias principales documentadas son la entrada directa de PCM sin STFT/mel en Moonshine y su carácter monolingüe en inglés.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés; no traduce ni detecta idioma.
- No genera marcas de tiempo, lo que limita su uso directo en subtitulado sincronizado.
- No soporta streaming; la transcripción es por lotes sobre audio completo.
- Riesgo de alucinación y bucles de generación; la model card original recomienda limitar la longitud máxima de salida en función de la duración del audio (6,5 tokens por segundo) para mitigarlo.
- El modelo base hereda riesgos de sesgo de los datos de entrenamiento, no detallados en la información disponible.
- La licencia MIT permite uso comercial, pero se recomienda revisar los términos del modelo base y del paper para atribuciones.
- La cuantización Q8_0 introduce una deriva mínima de WER (+0,02 pp), aunque conviene validar en el dominio concreto de producción.
- El repositorio de esta conversión tiene 0 descargas y 0 likes en el momento de la consulta, por lo que su adopción y mantenimiento comunitario son limitados.
- No se especifican requisitos de normalización de audio más allá de 16 kHz mono; es necesario convertir previamente con ffmpeg u otra herramienta.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/xix3r/voxix-moonshine-tiny-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny
- Commit del modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny/commit/390624e
- Paper Moonshine: https://arxiv.org/abs/2410.15608
- Blog de presentación: https://petewarden.com/2024/10/21/introducing-moonshine-the-new-state-of-the-art-for-speech-to-text/
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/07a8a84
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine-tiny.md
- Repositorio oficial de Moonshine: https://github.com/usefulsensors/moonshine/blob/main/README.md
- Pesos GGUF alternativos (handy-computer): https://huggingface.co/handy-computer/moonshine-tiny-gguf
- Referencia Model Cards for Model Reporting: https://arxiv.org/abs/1810.03993
- Podcast de presentación: https://notebooklm.google.com/notebook/d787d6c2-7d7b-478c-b7d5-a0be4c74ae19/audio
