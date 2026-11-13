# xix3r/voxix-moonshine-base-ja-gguf

## Resumen

Voxix Moonshine Base JA GGUF es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) UsefulSensors/moonshine-base-ja, publicada por el usuario xix3r y pensada para su uso con la librería transcribe.cpp. Se trata de un modelo encoder-decoder transformer de 61,5 millones de parámetros, especializado exclusivamente en transcripción de audio en japonés, que hereda la arquitectura Moonshine base de Useful Sensors. El repositorio ocupa 0,1 GB y ofrece tres niveles de cuantización (F32, F16 y Q8_0), lo que permite desplegarlo en entornos con recursos muy limitados.

La relevancia de esta ficha radica en que el modelo original está pensado para el ecosistema Transformers, mientras que esta conversión lo lleva a un runtime C++ ligero (transcribe.cpp), facilitando su integración en aplicaciones nativas, dispositivos de borde y pipelines sin dependencia de Python. El modelo consume PCM crudo a 16 kHz mediante un stem Conv1d de tres capas, sin STFT ni banco de filtros mel, y emite únicamente texto transcrito, sin traducción, detección de idioma ni marcas temporales.

El modelo base fue portado desde el commit f9d4e6a de UsefulSensors (fijado el 2026-05-12) y validado contra la referencia de Transformers en el commit 90bf720 de transcribe.cpp. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Moonshine base) con stem Conv1d de 3 capas |
| Parametros totales | 61.513.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (max_length de decodificación: 192 tokens) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | Japones (ja) unicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Moonshine base, un transformer encoder-decoder de 62M de parámetros que procesa audio PCM crudo a 16 kHz directamente mediante un stem de tres capas Conv1d, prescindiendo de STFT y de banco de filtros mel. Esta elección reduce el coste de preprocesado y permite alimentar la señal de audio sin transformaciones espectrales intermedias. La salida es únicamente la transcripción, sin etiquetas de idioma, marcas temporales ni capacidades de traducción.

El modelo base UsefulSensors/moonshine-base-ja es un ajuste fino sobre japonés del Moonshine base original. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión GGUF fue validada numéricamente contra la referencia de Transformers (MoonshineForConditionalGeneration en fp32 sobre MPS), con un CER de referencia del 10,69% en el mismo manifiesto de evaluación.

## Capacidades

- Transcripcion automatica de voz en japones a partir de audio PCM mono a 16 kHz.
- Procesamiento de audio sin preprocesado espectral (entrada directa PCM via Conv1d).
- Salida de texto plano (transcript-only), sin formato enriquecido.
- No soporta traduccion.
- No soporta deteccion de idioma.
- No genera marcas temporales (timestamps: none).
- No soporta streaming (streaming: false).
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Transcripcion de reuniones en japones: el modelo convierte grabaciones de audio mono a 16 kHz en texto, adecuado para actas y resúmenes posteriores en entornos donde no se requiere diarización ni timestamps.
- Subtitulado offline de contenido audiovisual japones: al no generar marcas temporales, se usaría para obtener el texto completo y alinear los subtítulos con herramientas externas de forced alignment.
- Integracion en aplicaciones nativas C++: gracias al runtime transcribe.cpp y a los pesos GGUF, puede embeberse en aplicaciones de escritorio o utilidades CLI sin dependencia de Python ni de PyTorch.
- Procesamiento en dispositivos de borde con recursos limitados: la cuantización Q8_0 ocupa 74 MB, lo que permite ejecutarlo en hardware modesto con CPU o GPU integrada.
- Dictado por voz en japones: el modelo transcribe audio de micrófono en tiempo casi real (RTF de 22 a 80,5 según plataforma) para aplicaciones de entrada de texto.
- Pipeline de transcripcion por lotes: su reducido tamaño y su naturaleza encoder-decoder permiten procesar grandes volúmenes de audio en servidores sin GPU dedicada, usando la versión CPU o Vulkan.
- Analisis de llamadas de atención al cliente en japones: transcripcion de grabaciones para su posterior indexación y búsqueda textual.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 | Referencia Transformers F32 |
|---|---:|---:|---:|---:|
| CER FLEURS-ja test (%) | 10,84 | 10,81 | 10,53 | 10,69 |
| RTF Mac M4 Max (Metal) | 79,5 | 79,5 | 79,5 | No disponible |
| RTF Mac M4 Max (CPU) | 80,5 | 80,5 | 80,5 | No disponible |
| RTF Ryzen 4750U (Vulkan) | 34,5 | 34,5 | 34,5 | No disponible |
| RTF Ryzen 4750U (CPU) | 22 | 22 | 22 | No disponible |

El CER se midió sobre el split de test de FLEURS-ja (650 enunciados) con la decodificación por defecto de transcribe.cpp (greedy, num_beams=1, max_length=192). Las diferencias entre F32, F16 y Q8_0 están dentro del ruido de los intervalos de confianza bootstrap; Q8_0 introduce una deriva adicional típicamente inferior a 0,1 puntos porcentuales respecto a F16. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo ASR y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones (236 MB en F32, 126 MB en F16, 74 MB en Q8_0 para los pesos).
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan; no requiere GPU de datacenter.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU con soporte Vulkan o Metal.
- Opciones de despliegue: transcribe.cpp (runtime C++ oficial de esta conversión); no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 79,5 (Metal, M4 Max), 80,5 (CPU, M4 Max), 34,5 (Vulkan, Ryzen 4750U) y 22 (CPU, Ryzen 4750U). Un RTF superior a 1 indica procesamiento más rápido que tiempo real.
- Requiere audio de entrada en WAV mono a 16 kHz; se recomienda convertir con ffmpeg antes de la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | CER FLEURS-ja |
|---|---:|---|---|---|---|---:|
| xix3r/voxix-moonshine-base-ja-gguf | 61,5M | No disponible | ja | MIT | GGUF | 10,53-10,84% |
| UsefulSensors/moonshine-base-ja (original) | 61,5M | No disponible | ja | MIT | safetensors | 10,69% (referencia) |
| Moonshine base (original, ingles) | ~62M | No disponible | en | MIT | safetensors | No disponible |
| Whisper base | ~74M | No disponible | Multilingue | MIT | safetensors, GGUF | No disponible |

La comparación con Whisper base se incluye por categoría (ASR de tamaño pequeño), pero no se dispone de cifras de CER comparables en la información proporcionada. El modelo original de UsefulSensors y esta conversión GGUF comparten arquitectura y pesos; la diferencia principal es el runtime y el formato.

## Limitaciones y advertencias

- Modelo mono-idioma: solo transcribe japonés; no detecta idioma ni traduce.
- Sin marcas temporales: no apto para aplicaciones que requieran alineación temporal por segmento.
- Sin soporte de streaming: debe procesarse el audio completo o en fragmentos gestionados externamente.
- Riesgo de alucinación en audio con ruido, acentos no nativos o vocabulario técnico fuera del dominio de entrenamiento; el CER del 10,5-10,8% en FLEURS-ja indica un margen de error significativo en condiciones de referencia.
- No se dispone de información sobre sesgos específicos del ajuste fino en japonés.
- Restricciones de licencia: MIT permite uso comercial sin restricciones adicionales, pero se recomienda revisar la model card original de UsefulSensors por si añade términos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado recientemente; no hay evidencia de uso en producción.
- La validación se realizó contra un commit concreto de transcribe.cpp (90bf720); versiones posteriores del runtime podrían cambiar el comportamiento numérico.
- No se dispone de información sobre el dataset de entrenamiento ni sobre posibles limitaciones de dominio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xix3r/voxix-moonshine-base-ja-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-base-ja
- Commit del modelo base: https://huggingface.co/UsefulSensors/moonshine-base-ja/commit/f9d4e6a
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentación de modelos Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Pesos F32: https://huggingface.co/handy-computer/moonshine-base-ja-gguf/resolve/main/moonshine-base-ja-F32.gguf
- Pesos F16: https://huggingface.co/handy-computer/moonshine-base-ja-gguf/resolve/main/moonshine-base-ja-F16.gguf
- Pesos Q8_0: https://huggingface.co/handy-computer/moonshine-base-ja-gguf/resolve/main/moonshine-base-ja-Q8_0.gguf
- Paper de referencia (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
