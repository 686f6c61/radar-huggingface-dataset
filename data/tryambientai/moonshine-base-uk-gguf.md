# tryambientai/moonshine-base-uk-gguf

## Resumen

moonshine-base-uk-gguf es la conversión a formato GGUF del modelo de reconocimiento automático del habla UsefulSensors/moonshine-base-uk, publicada por tryambientai para su uso con el runtime transcribe.cpp. Se trata de un modelo encoder-decoder de tipo transformer con 61,5 millones de parámetros, especializado exclusivamente en transcripción de audio en ucraniano. Su interés radica en que ofrece transcripción de voz en un idioma de recursos medios con un peso muy reducido (74 MB en cuantización Q8_0) y sin dependencia de frameworks de Python en producción.

La arquitectura sigue el diseño Moonshine: el encoder consume PCM crudo a 16 kHz mediante un stem de tres capas Conv1d, sin STFT ni banco de filtros mel, lo que abarata el preprocesado y reduce la latencia en comparación con los pipelines Whisper clásicos. La salida es únicamente texto transcrito, sin marcas de tiempo, sin detección de idioma y sin traducción.

El modelo es relevante para quienes necesitan ASR embebido o de borde en ucraniano con licencia MIT y un binario C++ ligero. La validación reportada por el autor de la conversión sitúa el WER en el 14,49 % (F32/F16) y el 14,39 % (Q8_0) sobre el split de test de FLEURS-uk, con un rendimiento en tiempo real (RTF) de 22 a 80,5 según plataforma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Moonshine), encoder con stem Conv1d de 3 capas sobre PCM crudo a 16 kHz |
| Parámetros totales | 61.513.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada; `max_length=192` tokens de salida en decodificación) |
| Tipos de cuantización | F32, F16, Q8_0 |
| Idiomas soportados | ucraniano (uk) únicamente |
| Licencia | MIT |
| Formato de pesos | GGUF |
| Librería de inferencia | transcribe.cpp |
| Tamaño de los artefactos | F32: 236 MB; F16: 126 MB; Q8_0: 74 MB |
| Entrada de audio | WAV mono a 16 kHz (PCM crudo) |
| Streaming | no |
| Marcas de tiempo | no |
| Traducción | no |
| Detección de idioma | no |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de 62 M de parámetros heredado de moonshine-base y ajustado por UsefulSensors para ucraniano. La particularidad frente a Whisper es que el encoder no calcula espectrogramas: recibe directamente muestras PCM a 16 kHz y las procesa con un stem convolucional de tres capas Conv1d, eliminando el coste de STFT y del banco de filtros mel. El decodificador genera la transcripción de forma autorregresiva con decodificación greedy (`num_beams=1`, `max_length=192`, coherente con el `generation_config` original).

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus de ajuste fino ni si se aplicaron técnicas de RLHF o DPO; la model card upstream de UsefulSensors está generada automáticamente y no detalla estos extremos. La conversión GGUF se realizó a partir del commit `a52b2e9` del modelo base (fijado el 2026-05-12) y se validó numéricamente contra la referencia en Transformers en el commit `90bf720` de transcribe.cpp, también el 2026-05-12. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Transcripción de voz a texto en ucraniano a partir de audio WAV mono a 16 kHz.
- Procesamiento de audio crudo sin preprocesado espectral (sin STFT ni mel filterbank).
- Ejecución en CPU y GPU mediante el runtime C++ transcribe.cpp, con backends Metal, Vulkan y CPU.
- Salida de solo texto: no genera marcas de tiempo, no traduce y no detecta el idioma.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No procesa vídeo, imagen ni audio multilingüe.
- No soporta streaming; requiere el audio completo como entrada.

## Casos de uso

- Subtitulado de contenido audiovisual en ucraniano: se convierte la pista de audio a WAV mono 16 kHz con ffmpeg y se transcribe con el binario `transcribe-cli`; el tamaño de 74 MB en Q8_0 permite procesar lotes completos en máquinas modestas.
- Transcripción en dispositivos de borde: con 74 MB en Q8_0 y un RTF de 22 sobre un Ryzen 4750U en CPU, el modelo es viable en portátiles sin GPU dedicada y en equipos industriales con CPU de gama media.
- Actas y notas de reuniones en ucraniano: al no generar marcas de tiempo, encaja en flujos donde solo se necesita el texto plano para indexación o resumen posterior con un LLM.
- Integración en aplicaciones de escritorio nativas: la librería C++ transcribe.cpp evita el despliegue de Python y permite empaquetar el modelo dentro de aplicaciones con backend Metal en macOS.
- Procesado por lotes en servidores sin GPU: el backend CPU con RTF de 22 sobre Ryzen 4750U permite transcribir horas de audio en un servidor modesto con paralelización por procesos.
- Investigación en ASR de bajo recursos: sirve como línea base ligera y reproducible (WER 14,49 % en FLEURS-uk) para comparar técnicas de adaptación al ucraniano.
- Preprocesado para pipelines de NLP en ucraniano: la transcripción alimenta sistemas de búsqueda, clasificación o análisis de sentimiento sin necesidad de servicios en la nube.

## Benchmarks y rendimiento

WER sobre el split de test de FLEURS-uk (750 enunciados), decodificación greedy por defecto de transcribe.cpp:

| Cuantización | WER FLEURS-uk | Tamaño |
|---|---:|---:|
| F32 | 14,49 % | 236 MB |
| F16 | 14,49 % | 126 MB |
| Q8_0 | 14,39 % | 74 MB |
| Referencia Transformers F32 (MPS) | 14,51 % | — |

Rendimiento en tiempo real (RTF, menor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 79,5 |
| Apple M4 Max | CPU | 80,5 |
| AMD Ryzen 4750U | Vulkan | 34,5 |
| AMD Ryzen 4750U | CPU | 22 |

El autor indica que las cifras F32/F16 en C++ coinciden con la referencia de Transformers dentro del ruido del intervalo de confianza bootstrap, y que Q8_0 introduce una deriva adicional típicamente inferior a 0,1 puntos porcentuales respecto a F16. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible, ya que no son aplicables a un modelo ASR.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones (236 MB en F32, 126 MB en F16, 74 MB en Q8_0); en la práctica el modelo cabe en memoria unificada o en RAM del sistema.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA); no requiere GPUs de datacenter como A100 o H100.
- Cabe en GPU de consumo: sí, en cualquier GPU integrada o dedicada con al menos 1 GB de memoria disponible; también funciona enteramente en CPU.
- Opciones de despliegue: transcribe.cpp (compilación con CMake, binario `transcribe-cli`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: RTF de 79,5 en Metal sobre M4 Max, 80,5 en CPU sobre M4 Max, 34,5 en Vulkan sobre Ryzen 4750U y 22 en CPU sobre Ryzen 4750U. Un RTF de 22 implica procesar aproximadamente 22 segundos de audio por segundo de cómputo en ese hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto de audio | Licencia | Formato | WER FLEURS-uk |
|---|---:|---|---|---|---|---:|
| moonshine-base-uk-gguf | 61,5 M | uk | audio completo, sin streaming | MIT | GGUF | 14,49 % (F32/F16) |
| Whisper small | 244 M | multilingüe (99) | 30 s por ventana | MIT | safetensors, GGUF, etc. | no disponible en la información |
| Whisper base | 74 M | multilingüe (99) | 30 s por ventana | MIT | safetensors, GGUF, etc. | no disponible en la información |
| moonshine-base (original) | 61,5 M | en | audio completo | MIT | safetensors, GGUF | no aplica (inglés) |

La comparación con Whisper es la más directa por categoría y licencia, pero no se dispone de cifras de WER en FLEURS-uk para esos modelos en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa fiable. La ventaja estructural de Moonshine frente a Whisper es el menor coste de preprocesado (sin STFT/mel) y el tamaño reducido; la desventaja es la ausencia de multilingüismo, marcas de tiempo y streaming.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe ucraniano; no detecta idioma ni traduce, por lo que audio en otro idioma producirá salidas incorrectas o vacías.
- Sin marcas de tiempo: no apto para subtitulado sincronizado ni para alineación temporal sin un paso adicional.
- Sin streaming: requiere el audio completo como entrada, lo que limita su uso en transcripción en vivo.
- WER del 14,49 % en FLEURS-uk: aceptable para contenido limpio, pero elevado para dominios con ruido, acentos marcados o vocabulario especializado; no se documentan evaluaciones en otros dominios.
- Riesgo de alucinación en pasajes de silencio o ruido: los modelos encoder-decoder de ASR pueden generar texto inventado cuando la señal no contiene habla; no se documenta mitigación específica.
- Sesgos: no se documenta ningún análisis de sesgo demográfico, dialectal o de género en la información disponible.
- Restricciones de licencia: MIT, que permite uso comercial y modificación; los términos completos remiten a la model card upstream de UsefulSensors.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card upstream está generada automáticamente sin detalles de entrenamiento; conviene validar el comportamiento en el dominio propio antes de producción.
- Dependencia de un runtime concreto: la inferencia está pensada para transcribe.cpp; no se garantiza compatibilidad con otras herramientas GGUF.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tryambientai/moonshine-base-uk-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-base-uk
- Commit del modelo base usado en la conversión: https://huggingface.co/UsefulSensors/moonshine-base-uk/commit/a52b2e9
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentación de modelos Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Descarga F32: https://huggingface.co/handy-computer/moonshine-base-uk-gguf/resolve/main/moonshine-base-uk-F32.gguf
- Descarga F16: https://huggingface.co/handy-computer/moonshine-base-uk-gguf/resolve/main/moonshine-base-uk-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/moonshine-base-uk-gguf/resolve/main/moonshine-base-uk-Q8_0.gguf
