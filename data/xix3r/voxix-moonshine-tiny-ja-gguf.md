# xix3r/voxix-moonshine-tiny-ja-gguf

## Resumen

voxix-moonshine-tiny-ja-gguf es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) UsefulSensors/moonshine-tiny-ja, publicada por el usuario xix3r para su uso con la librería transcribe.cpp. El modelo base es un Moonshine tiny de Moonshine AI (anteriormente Useful Sensors) afinado específicamente para japonés, con arquitectura encoder-decoder transformer de 27 millones de parámetros y entrenado para transcribir audio PCM de 16 kHz. Esta conversión permite ejecutar el modelo en C++ puro, sin dependencias de Python ni de PyTorch, lo que lo hace apto para despliegue en dispositivos de borde y sistemas embebidos.

La relevancia de esta ficha radica en que cuantiza a GGUF un modelo ASR de muy bajo coste computacional (34 MB en Q8_0) manteniendo una tasa de error de caracteres (CER) del 13,36 % en el split de test de FLEURS japonés, prácticamente idéntica a la del modelo de referencia en precisión completa (13,20 %). El modelo es monolingüe (japonés), no soporta traducción, detección de idioma ni marcas de tiempo, y no ofrece modo streaming según la model card.

La conversión está validada contra la implementación de referencia en Transformers y fijada al commit 02ca41b del modelo base (12 de mayo de 2026), con verificación en el commit 90bf720 de transcribe.cpp. La licencia MIT heredada del modelo base facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Moonshine tiny) con stem Conv1d de tres capas |
| Parametros totales | 27.092.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max_length de decodificación: 192 tokens) |
| Tipos de cuantizacion | F32, F16, Q8_0 (GGUF) |
| Idiomas soportados | Japonés (ja) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine tiny: un encoder-decoder transformer que consume audio PCM crudo a 16 kHz directamente a través de un stem de convolución 1D de tres capas, sin STFT ni banco de filtros mel. Esta decisión de diseño elimina el preprocesado espectral clásico y reduce la latencia en dispositivos de borde. La salida es únicamente texto transcrito, sin etiquetas de idioma, marcas de tiempo ni capacidad de traducción. El modelo base fue entrenado y publicado por Moonshine AI; los detalles completos de composición del dataset, número de tokens de audio y procedimiento de ajuste (incluido si hubo RLHF o DPO) se remiten al paper arXiv:2509.02523, no reproducido en la información disponible.

La conversión GGUF fue realizada por xix3r a partir del commit 02ca41b del modelo base, fijado el 12 de mayo de 2026, y validada contra la referencia de Transformers (MoonshineForConditionalGeneration en fp32 sobre MPS) en el commit 90bf720 de transcribe.cpp. La decodificación por defecto es greedy con num_beams=1 y max_length=192, en línea con la generation_config original. La model card advierte de que para evitar bucles de alucinación se limita la longitud máxima generada en función de la duración del audio (factor de 13 tokens por segundo de audio).

## Capacidades

- Transcripción de voz a texto en japonés a partir de audio PCM mono a 16 kHz.
- Procesamiento de audio crudo sin extracción de características espectrales (sin STFT ni mel).
- Ejecución en C++ mediante transcribe.cpp, sin dependencias de Python.
- Inferencia en CPU y en GPU con backend Metal y Vulkan.
- Cuantización a Q8_0 con deriva mínima respecto a F16 (típicamente inferior a 0,1 puntos porcentuales de CER).
- No soporta streaming (streaming: false).
- No soporta traducción (translate: false).
- No soporta detección de idioma (lang_detect: false).
- No genera marcas de tiempo (timestamps: none).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo ASR puro.

## Casos de uso

- Subtitulado离线 de contenido en japonés: el modelo transcribe ficheros WAV de 16 kHz mono previamente convertidos con ffmpeg, adecuado para procesar archivos de audio ya grabados sin requisitos de tiempo real.
- Transcripción en dispositivos de borde: con 34 MB en Q8_0 y ejecución nativa en C++, puede integrarse en sistemas embebidos, Raspberry Pi o dispositivos móviles donde no es viable desplegar un runtime de Python.
- Aplicaciones de accesibilidad para hablantes de japonés: conversión de dictado o notas de voz a texto en local, sin enviar audio a servicios en la nube, lo que reduce exposición de datos personales.
- Indexación y búsqueda de archivos de audio japoneses: transcripción por lotes de grabaciones (reuniones, entrevistas, pódcast) para generar texto indexable, aprovechando el bajo coste por hora de audio del modelo.
- Integración en pipelines de C++ existentes: al compilarse con CMake y exponer una CLI (transcribe-cli), se puede encadenar en scripts de procesamiento por lotes o en servicios nativos sin añadir una capa Python.
- Prototipado rápido de ASR japonés en hardware de consumo: con soporte Metal en Apple Silicon (RTF 127 en M4 Max) y Vulkan en CPU integradas (RTF 56 en Ryzen 4750U), permite validar flujos de transcripción en portátiles sin GPU dedicada.
- Transcripción de bajo consumo en servidores modestos: la variante F16 (57 MB) o Q8_0 (34 MB) permite atender múltiples flujos secuenciales en CPU sin agotar memoria.

## Benchmarks y rendimiento

Datos publicados en la model card de la conversión (CER sobre FLEURS japonés, 650 enunciados, decodificación greedy):

| Cuantizacion | Tamano | CER FLEURS ja |
|---|---:|---:|
| F32 | 105 MB | 13,20 % |
| F16 | 57 MB | 13,20 % |
| Q8_0 | 34 MB | 13,36 % |
| Referencia Transformers F32 (MPS) | no disponible | 13,23 % |

Rendimiento en tiempo real (RTF, menor es mejor), según la model card:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 127 |
| Apple M4 Max | CPU | 153,5 |
| AMD Ryzen 4750U | Vulkan | 56 |
| AMD Ryzen 4750U | CPU | 45,5 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo ASR y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 200 MB en todas las cuantizaciones (34 MB Q8_0, 57 MB F16, 105 MB F32 en disco; el consumo en memoria es del mismo orden).
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Con backend Metal en Apple Silicon (M4 Max) y Vulkan en GPUs integradas AMD (Ryzen 4750U).
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU; también en Raspberry Pi y dispositivos similares.
- Opciones de despliegue: transcribe.cpp (compilación con CMake, CLI transcribe-cli), con backends CPU, Metal y Vulkan. El modelo base también es ejecutable con Transformers (MoonshineForConditionalGeneration) en Python.
- Latencia y throughput: RTF de 127 (Metal, M4 Max), 153,5 (CPU, M4 Max), 56 (Vulkan, Ryzen 4750U) y 45,5 (CPU, Ryzen 4750U). Valores superiores a 1 indican procesamiento más rápido que tiempo real.
- Requisito de entrada: audio WAV mono a 16 kHz; conversión previa con ffmpeg si el origen es MP3 u otro formato.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | CER FLEURS ja | Licencia | Formato |
|---|---:|---|---|---:|---|---|
| voxix-moonshine-tiny-ja-gguf (Q8_0) | 27 M | no disponible | ja | 13,36 % | MIT | GGUF |
| UsefulSensors/moonshine-tiny-ja (F32) | 27 M | no disponible | ja | 13,20 % (referencia 13,23 %) | MIT | safetensors |
| Whisper tiny | no disponible en la informacion | no disponible | multilingue | no disponible | MIT | safetensors, GGUF |
| Moonshine tiny (original, ingles) | 27 M | no disponible | en | no disponible | MIT | safetensors, GGUF |

La comparación con Whisper tiny y con el Moonshine tiny original en inglés no puede completarse con datos de la información disponible; se indica "no disponible" en los campos sin cifras publicadas.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe japonés; no detecta idioma ni traduce.
- No genera marcas de tiempo, lo que limita su uso en subtitulado sincronizado.
- No soporta streaming: requiere el audio completo (o segmentos) como entrada.
- Riesgo de alucinación y bucles de decodificación; la model card recomienda limitar la longitud máxima generada (13 tokens por segundo de audio) para mitigarlo.
- El CER del 13,36 % en FLEURS implica un error considerable en condiciones de audio difíciles (ruido, acentos, dominio especializado); no es adecuado para transcripción de precisión sin revisión humana.
- Sesgos: no se documentan sesgos específicos en la información disponible; al heredar el entrenamiento del modelo base, pueden persistir sesgos de los datos de entrenamiento de Moonshine.
- La licencia MIT permite uso comercial, pero se recomienda consultar la model card del modelo base para términos completos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una conversión reciente y de un autor individual, sin el respaldo directo de Moonshine AI.
- El tamaño del repo figura como 0.0 GB, lo que puede indicar que los ficheros GGUF no están alojados en este repositorio o que la información está incompleta; verificar la disponibilidad de los pesos antes de integrarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xix3r/voxix-moonshine-tiny-ja-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-ja
- Commit del modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-ja/commit/02ca41b
- Paper Moonshine: https://huggingface.co/papers/2509.02523
- Paper Model Cards for Model Reporting: https://arxiv.org/abs/1810.03993
- Código Moonshine: https://github.com/moonshine-ai/moonshine
- Instrucciones de instalación de Moonshine: https://github.com/usefulsensors/moonshine/blob/main/README.md
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentación de modelos Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Pesos GGUF (F32, F16, Q8_0): https://huggingface.co/handy-computer/moonshine-tiny-ja-gguf
