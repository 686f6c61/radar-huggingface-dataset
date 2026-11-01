# tryambientai/moonshine-base-vi-gguf

## Resumen

`moonshine-base-vi-gguf` es una conversión al formato GGUF del modelo `UsefulSensors/moonshine-base-vi`, una adaptación al vietnamita de la arquitectura Moonshine desarrollada originalmente por Useful Sensors. El modelo realiza reconocimiento automático del habla (ASR) sobre audio PCM en bruto a 16 kHz y genera únicamente la transcripción, sin traducción, detección de idioma ni marcas temporales. Con 61.513.920 parámetros (aproximadamente 62 M), se posiciona como un modelo extremadamente ligero, pensado para inferencia en dispositivos de gama baja, CPU y sistemas embebidos.

La relevancia de esta ficha reside en su empaquetado: los pesos se distribuyen en GGUF para el runtime `transcribe.cpp`, una implementación en C++ derivada de `whisper.cpp` orientada a modelos Moonshine. Esto permite desplegar ASR en vietnamita sin dependencias de Python ni de PyTorch, con huellas de memoria de entre 74 MB (Q8_0) y 236 MB (F32). El modelo base fue entrenado por Useful Sensors y el autor de la conversión (`tryambientai`) publica los artefactos validados numéricamente contra la referencia de Transformers.

La arquitectura es un transformer encoder-decoder que sustituye el front-end clásico de STFT y banco de filtros mel por un stem de tres capas Conv1d que consume directamente las muestras de audio. Esta decisión reduce el coste computacional del preprocesado y simplifica el pipeline de despliegue. La licencia MIT del modelo base se hereda en la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Moonshine) con stem Conv1d de 3 capas; sin STFT ni banco mel |
| Parametros totales | 61.513.920 (aprox. 62 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz; `max_length` de decodificación 192 tokens) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | vietnamita (vi) únicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (runtime `transcribe.cpp`) |
| Tamano del repo | 0,1 GB |
| Entrada de audio | PCM mono a 16 kHz |
| Salida | Solo transcripción (sin timestamps, sin traducción, sin detección de idioma) |
| Streaming | no soportado |
| Libreria | transcribe.cpp |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine: un encoder-decoder transformer donde el encoder procesa la forma de onda directamente mediante un stem de tres capas convolucionales 1D, prescindiendo del cálculo de STFT y del banco de filtros mel habitual en Whisper. Esta elección reduce el coste de preprocesado y hace que la longitud de la secuencia de entrada sea proporcional a la duración del audio, sin ventanas fijas de 30 segundos. El decoder genera la transcripción de forma autorregresiva con decodificación greedy (`num_beams=1`, `max_length=192`, en línea con el `generation_config` original).

El modelo base fue ajustado por Useful Sensors sobre el checkpoint `moonshine-base` para vietnamita. No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron técnicas de RLHF o DPO; la model card upstream reproduce una plantilla autogenerada sin esos datos. La conversión GGUF fue portada desde el commit `0ee9ce9` del modelo base (fijado el 2026-05-12) y validada contra la referencia de Transformers en el commit `90bf720` de `transcribe.cpp` el 2026-05-12. La validación numérica muestra que las versiones F32 y F16 reproducen la referencia dentro del ruido del intervalo de confianza bootstrap, y que Q8_0 introduce una deriva adicional típicamente inferior a 0,1 puntos porcentuales respecto a F16.

## Capacidades

- Transcripción de voz a texto en vietnamita sobre audio PCM mono a 16 kHz.
- Procesamiento de audio en bruto sin preprocesado espectral (sin STFT ni mel filterbank), lo que simplifica la integración.
- Modelo de un solo idioma: no realiza detección automática de idioma.
- No soporta traducción a otros idiomas.
- No genera marcas temporales a nivel de palabra ni de segmento.
- No soporta streaming: la inferencia es por fichero completo.
- No dispone de tool calling, function calling ni capacidades de agente.
- No es un modelo multimodal ni de propósito general: su única tarea es ASR.
- Ejecutable en CPU y GPU mediante `transcribe.cpp` con backends CPU, Metal y Vulkan.

## Casos de uso

- Subtitulado de contenido audiovisual en vietnamita: el modelo transcribe ficheros WAV de 16 kHz mono y produce texto plano que puede postprocesarse para generar subtítulos; su reducido tamaño permite ejecutarlo en servidores sin GPU.
- Transcripción en dispositivos de borde: con 74 MB en Q8_0, cabe en sistemas embebidos y Raspberry Pi, permitiendo dictado o notas de voz offline sin enviar audio a la nube.
- Procesamiento por lotes de archivos de audio: el runtime C++ sin dependencias de Python facilita integrar la transcripción en pipelines de datos o scripts de shell sobre grandes volúmenes de grabaciones.
- Aplicaciones de accesibilidad para hablantes de vietnamita: conversión de voz a texto en tiempo cuasi real en equipos de sobremesa; los RTF medidos (0,22 en CPU Ryzen 4750U) indican procesamiento más rápido que tiempo real.
- Investigación en ASR de bajo recurso: punto de partida ligero para experimentos de fine-tuning o evaluación comparativa de arquitecturas sin front-end mel en vietnamita.
- Transcripción local con requisitos de privacidad: al ejecutarse íntegramente en local mediante `transcribe.cpp`, el audio no abandona el dispositivo, lo que encaja en entornos sanitarios, legales o industriales con datos sensibles.
- Integración en aplicaciones de escritorio o móviles nativas: la API C++ del runtime permite enlazar el modelo en binarios sin intérprete de Python.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 |
|---|---:|---:|---:|
| WER FLEURS-vi (test, 857 utterances) | 9,67 % | 9,66 % | 9,79 % |
| Tamano del fichero | 236 MB | 126 MB | 74 MB |
| RTF en Apple M4 Max (Metal) | no disponible por cuantización | no disponible por cuantización | 79,5 (global) |
| RTF en Apple M4 Max (CPU) | no disponible por cuantización | no disponible por cuantización | 80,5 (global) |
| RTF en Ryzen 4750U (Vulkan) | no disponible por cuantización | no disponible por cuantización | 34,5 (global) |
| RTF en Ryzen 4750U (CPU) | no disponible por cuantización | no disponible por cuantización | 22 (global) |

Referencia Transformers F32 sobre MPS en el mismo manifiesto: 9,66 % WER. Los valores de RTF se publican de forma agregada para el conjunto de cuantizaciones, no desglosados. Decodificación evaluada con configuración greedy (`num_beams=1`, `max_length=192`).

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 74 MB para Q8_0, 126 MB para F16 y 236 MB para F32, más el overhead del runtime.
- GPU recomendadas: no requiere GPU; funciona en CPU. Se han validado backends Metal (Apple M4 Max) y Vulkan (AMD Ryzen 4750U).
- Cabe en cualquier GPU de consumo e incluso en sistemas sin GPU dedicada; también en dispositivos de borde.
- Opciones de despliegue: `transcribe.cpp` (CLI `transcribe-cli` y API C++). No se distribuye para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Throughput: RTF de 79,5 (Metal, M4 Max), 80,5 (CPU, M4 Max), 34,5 (Vulkan, Ryzen 4750U) y 22 (CPU, Ryzen 4750U); valores muy por encima de 1 indican procesamiento más rápido que tiempo real.
- Requisito de entrada: audio WAV mono a 16 kHz; conversión previa con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto/entrada | WER FLEURS-vi | Licencia | Runtime |
|---|---|---:|---|---:|---|---|
| moonshine-base-vi-gguf (este) | 62 M | vi | PCM 16 kHz | 9,67 % (F32) | MIT | transcribe.cpp |
| UsefulSensors/moonshine-base-vi | 62 M | vi | PCM 16 kHz | no publicado por el autor | MIT | Transformers |
| moonshine-base (original) | 62 M | en | PCM 16 kHz | no disponible | MIT | Transformers / transcribe.cpp |
| Whisper base | 74 M | multilingüe | ventanas de 30 s, mel | no disponible para vi en esta información | MIT | whisper.cpp, Transformers |

La comparación con Whisper base se ofrece como referencia de categoría (ASR ligero); no se dispone de cifras de WER en vietnamita para ese modelo en la información proporcionada. La ventaja diferencial de Moonshine frente a Whisper es la ausencia de front-end mel y la longitud de entrada variable, que reduce el coste en audios cortos.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe vietnamita; no detecta idioma ni traduce.
- Sin marcas temporales: no apto para aplicaciones que requieran alineación temporal a nivel de palabra o segmento.
- Sin streaming: la inferencia es por fichero completo, lo que limita casos de uso en tiempo real continuo.
- Riesgo de alucinación en audio con ruido, música o habla no vietnamita; el WER de referencia (9,66-9,79 %) implica errores no despreciables incluso en condiciones de test limpias.
- Sesgos: no se documentan análisis de sesgo demográfico, acento o dialecto en la model card; el rendimiento puede degradarse con acentos regionales distintos de los presentes en FLEURS.
- Requisito estricto de formato de entrada: PCM mono a 16 kHz; otras frecuencias o canales requieren conversión previa.
- Licencia MIT heredada del modelo base; permite uso comercial, pero conviene revisar los términos del modelo upstream por si hubiera condiciones adicionales no reflejadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación comunitaria muy limitado.
- La model card upstream es una plantilla autogenerada sin detalles de entrenamiento, datos o evaluación, lo que dificulta la reproducibilidad.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/tryambientai/moonshine-base-vi-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-base-vi
- Commit del modelo base referenciado: https://huggingface.co/UsefulSensors/moonshine-base-vi/commit/0ee9ce9
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentación de modelos Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Descarga F32: https://huggingface.co/handy-computer/moonshine-base-vi-gguf/resolve/main/moonshine-base-vi-F32.gguf
- Descarga F16: https://huggingface.co/handy-computer/moonshine-base-vi-gguf/resolve/main/moonshine-base-vi-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/moonshine-base-vi-gguf/resolve/main/moonshine-base-vi-Q8_0.gguf
- Paper referenciado en los tags (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
