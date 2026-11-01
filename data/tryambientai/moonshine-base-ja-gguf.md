# tryambientai/moonshine-base-ja-gguf

## Resumen

`tryambientai/moonshine-base-ja-gguf` es una conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) `UsefulSensors/moonshine-base-ja`, una adaptación al japonés del modelo Moonshine base desarrollado originalmente por Useful Sensors. La conversión está empaquetada específicamente para su uso con `transcribe.cpp`, una implementación en C++ del pipeline de inferencia, y mantiene la licencia MIT del modelo original. El modelo resuelve el problema de la transcripción de audio en japonés en entornos con recursos limitados, sin necesidad de frameworks de Python ni de dependencias pesadas.

Arquitectónicamente es un transformer encoder-decoder de 61.513.920 parámetros (aproximadamente 62M), que consume PCM crudo a 16 kHz mediante un stem de tres capas Conv1d, prescindiendo de STFT y de banco de filtros mel. Esta elección de diseño reduce el coste computacional y simplifica el preprocesado, lo que lo hace especialmente adecuado para despliegues en dispositivos de borde y CPU. El modelo es monolingüe (japonés), no soporta traducción, detección de idioma ni timestamps, y no ofrece streaming.

La relevancia actual de esta ficha radica en que demuestra el patrón de portabilidad de modelos ASR pequeños a ecosistemas nativos (C++/GGUF), con cuantizaciones que van de F32 (236 MB) a Q8_0 (74 MB) y con una degradación de precisión mínima respecto a la referencia en Transformers. Es un caso práctico de cómo un modelo de 62M de parámetros puede ejecutarse en CPU y Metal con factores de tiempo real (RTF) muy por debajo de 1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Moonshine base), stem Conv1d de 3 capas sobre PCM crudo a 16 kHz |
| Parametros totales | 61.513.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio; `max_length=192` en decodificación) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | Japonés (ja) únicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp) |
| Tarea | Automatic speech recognition (speech-to-text) |
| Modalidad de entrada | Audio PCM mono 16 kHz (WAV) |
| Salida | Transcripción de solo texto (sin timestamps) |
| Streaming | No |
| Traducción | No |
| Detección de idioma | No |
| Timestamps | No disponible (ninguno) |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder con la misma arquitectura que `moonshine-base` (62M parámetros). La peculiaridad principal es el frontend de audio: en lugar de calcular STFT y banco de filtros mel, consume directamente PCM crudo a 16 kHz a través de un stem de tres capas convolucionales 1D. Esto elimina dependencias de preprocesado y reduce la superficie de implementación en entornos nativos. El decoder emite únicamente texto de transcripción, sin etiquetas de tiempo ni tokens de idioma.

La información proporcionada no detalla el volumen de datos de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La model card upstream de `UsefulSensors/moonshine-base-ja` está mayoritariamente sin rellenar (marcadores `[More Information Needed]`), por lo que los detalles de fine-tuning sobre el Moonshine base no están disponibles. La conversión GGUF se realizó a partir del commit `f9d4e6a` del modelo upstream, fijado el 2026-05-12, y se validó numéricamente contra la referencia en Transformers en el commit `90bf720` de transcribe.cpp en la misma fecha.

## Capacidades

- Transcripción de voz a texto en japonés a partir de audio PCM mono a 16 kHz.
- Inferencia sin dependencias de Python: el modelo se ejecuta mediante `transcribe.cpp` en C++.
- Cuantizaciones ligeras (Q8_0 de 74 MB) que permiten despliegue en dispositivos con poca memoria.
- Ejecución en CPU y en GPU vía Metal (Apple) y Vulkan (AMD/Intel), según los datos de RTF publicados.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso (es un modelo puramente ASR).
- No soporta capacidades multilingües más allá del japonés.
- No soporta streaming, traducción, detección de idioma ni timestamps.
- No dispone de modo "thinking", visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones en japonés en local: el modelo procesa audio WAV mono a 16 kHz y genera la transcripción completa sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad y para equipos sin GPU dedicada gracias a su tamaño de 74 MB en Q8_0.
- Subtitulado offline de contenido audiovisual japonés: se puede integrar en un pipeline que convierta el audio con `ffmpeg -ar 16000 -ac 1` y ejecute `transcribe-cli`, generando texto plano para postprocesado posterior (sin timestamps, por lo que el alineado temporal debe hacerse con otra herramienta).
- Asistentes de voz embebidos en dispositivos de borde: al ejecutarse en CPU con un RTF de 22 en Ryzen 4750U (Vulkan 34,5), es viable en hardware de gama baja para comandos o dictado en japonés.
- Automatización de notas de atención al cliente en japonés: transcripción por lotes de grabaciones de llamadas con un CER de referencia del 10,53% en FLEURS-ja (Q8_0), suficiente para indexación y búsqueda aproximada, aunque no para transcripción legal literal.
- Investigación en ASR de bajo recurso: sirve como baseline reproducible en C++ para comparar cuantizaciones y validar portes, dado que la model card documenta la validación numérica frente a Transformers.
- Prototipado rápido en macOS con Metal: el RTF de 79,5 en M4 Max permite transcripciones casi interactivas para pruebas de concepto y demos locales sin infraestructura de servidor.
- Preprocesado de corpus de audio japonés: para generar transcripciones a gran escala en máquinas sin GPU, el modelo Q8_0 ofrece un equilibrio entre tamaño y precisión (10,53% CER) con un coste de almacenamiento mínimo.

## Benchmarks y rendimiento

Datos publicados en la model card de la conversión GGUF. CER medido sobre el split de test de FLEURS-ja (650 utterances) con decodificación greedy por defecto de transcribe.cpp (`num_beams=1`, `max_length=192`).

| Cuantización | Tamaño | CER FLEURS-ja |
|---|---:|---:|
| F32 | 236 MB | 10,84% |
| F16 | 126 MB | 10,81% |
| Q8_0 | 74 MB | 10,53% |
| Referencia Transformers F32 (MPS) | no disponible | 10,69% |

Factores de tiempo real (RTF) publicados:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 79,5 |
| Apple M4 Max | CPU | 80,5 |
| AMD Ryzen 4750U | Vulkan | 34,5 |
| AMD Ryzen 4750U | CPU | 22 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) por tratarse de un modelo ASR. UsefulSensors no publica un CER por idioma para esta variante; el dato de referencia en Transformers (10,69%) fue medido por el autor de la conversión sobre el mismo manifiesto.

## Requisitos de hardware

- VRAM estimada: no aplica en sentido estricto; el modelo es tan pequeño que cabe en memoria unificada o RAM del sistema. En Q8_0 ocupa 74 MB de pesos, en F16 126 MB y en F32 236 MB.
- GPU recomendadas: no requiere GPU dedicada. Funciona en Apple Silicon vía Metal (validado en M4 Max) y en GPUs AMD/Intel vía Vulkan (validado en Ryzen 4750U con gráficos integrados).
- Cabe en cualquier GPU de consumo: incluso en iGPU y en CPU de gama baja, dado el tamaño de 74-236 MB.
- Opciones de despliegue: `transcribe.cpp` (CLI `transcribe-cli`), compilado con CMake. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo ASR y no un LLM.
- Latencia y throughput: RTF de 22 (CPU Ryzen 4750U), 34,5 (Vulkan Ryzen 4750U), 79,5 (Metal M4 Max) y 80,5 (CPU M4 Max). Un RTF alto indica mayor velocidad relativa; los valores publicados sugieren procesamiento muy por encima de tiempo real en las plataformas probadas.
- Preprocesado obligatorio: audio de entrada en WAV mono a 16 kHz; conversión con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Idiomas | Licencia | Formato | CER FLEURS-ja |
|---|---:|---|---|---|---|---:|
| moonshine-base-ja-gguf (este) | 61,5M | audio 16 kHz, max_length 192 | ja | MIT | GGUF | 10,53% (Q8_0) |
| UsefulSensors/moonshine-base-ja (upstream) | 61,5M | audio 16 kHz | ja | MIT | safetensors (Transformers) | 10,69% (referencia F32) |
| moonshine-base (original, inglés) | ~62M | audio 16 kHz | en | MIT | safetensors | no disponible para ja |
| Whisper small | ~244M | audio 16 kHz, ventana 30 s | multilingüe | MIT | safetensors, GGUF, etc. | no disponible en la información proporcionada |

La comparación con Whisper se incluye por categoría (ASR pequeño), pero no se dispone de cifras de CER en FLEURS-ja en la información proporcionada para ese modelo. La ventaja principal de esta conversión frente al upstream es el formato GGUF y la integración nativa en C++, con una degradación de precisión despreciable en Q8_0.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe japonés; no detecta idioma ni traduce.
- Sin timestamps: no apto para subtitulado con alineado temporal directo; requiere postprocesado externo.
- Sin streaming: no adecuado para transcripción en tiempo real por fragmentos; se procesa el audio completo.
- CER de referencia del 10,53-10,84% en FLEURS-ja: aceptable para indexación y búsqueda, pero insuficiente para transcripción literal o usos legales sin revisión humana.
- Riesgo de alucinación y errores en audio con ruido, solapamiento de hablantes o acentos no representados en el corpus de entrenamiento; la información sobre la composición del dataset no está disponible.
- Sesgos desconocidos: la model card upstream no documenta sesgos demográficos, dialectales ni de género.
- Licencia MIT: permite uso comercial, pero se hereda del modelo base y conviene revisar la model card upstream para términos completos.
- Dependencia de `transcribe.cpp`: el formato GGUF no es directamente compatible con llama.cpp ni con Transformers; requiere la herramienta específica.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema muy reciente y poca validación comunitaria independiente.
- La model card upstream está mayoritariamente sin rellenar, lo que limita la trazabilidad del entrenamiento y de las evaluaciones originales.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/tryambientai/moonshine-base-ja-gguf
- Modelo base upstream: https://huggingface.co/UsefulSensors/moonshine-base-ja
- Commit upstream fijado: https://huggingface.co/UsefulSensors/moonshine-base-ja/commit/f9d4e6a
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentación de modelos Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Descarga F32: https://huggingface.co/handy-computer/moonshine-base-ja-gguf/resolve/main/moonshine-base-ja-F32.gguf
- Descarga F16: https://huggingface.co/handy-computer/moonshine-base-ja-gguf/resolve/main/moonshine-base-ja-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/moonshine-base-ja-gguf/resolve/main/moonshine-base-ja-Q8_0.gguf
- Paper de referencia citado en los tags (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
