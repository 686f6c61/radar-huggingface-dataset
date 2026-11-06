# tryambientai/moonshine-tiny-zh-gguf

## Resumen

Moonshine-tiny-zh-gguf es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) UsefulSensors/moonshine-tiny-zh, publicada por el usuario tryambientai para su uso con el motor de inferencia transcribe.cpp. Se trata de un modelo encoder-decoder de tipo transformer con 27.092.736 parámetros, especializado exclusivamente en transcripción de mandarín (zh), derivado de la familia Moonshine de Moonshine AI (anteriormente Useful Sensors). Su interés radica en ofrecer transcripción de voz en chino con un consumo de recursos mínimo, apto para ejecución en CPU y dispositivos de gama baja.

El modelo consume PCM en bruto a 16 kHz directamente mediante un stem de tres capas Conv1d, sin STFT ni banco de filtros mel, y emite únicamente el texto transcrito. No soporta traducción, detección de idioma ni marcas de tiempo, y no funciona en modo streaming. La conversión GGUF mantiene la licencia MIT del modelo base y está validada contra la implementación de referencia en Transformers.

La relevancia actual de esta ficha es acotada: el repositorio registra cero descargas y cero likes, el tamaño del repo figura como 0.0 GB y la conversión está anclada a un commit concreto del modelo base (3306270, fijado el 2026-05-12). Es una pieza de infraestructura más que un modelo de propósito general, pensada para integrarse en pipelines de transcripción embebidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con stem Conv1d de tres capas (sin STFT ni mel filterbank) |
| Parámetros totales | 27.092.736 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (max_length de decodificación por defecto: 192) |
| Tipos de cuantización | F32, F16, Q8_0 |
| Idiomas soportados | chino mandarín (zh) únicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (también disponible el modelo base en safetensors vía Transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine: un encoder-decoder transformer que procesa audio PCM de 16 kHz en bruto a través de un stem convolucional de tres capas Conv1d, evitando el preprocesamiento clásico basado en STFT y banco de filtros mel que emplea Whisper. Esta decisión reduce la latencia de preprocesamiento y el coste computacional, y es la razón por la que el modelo resulta viable en CPU y hardware modesto. El decoder genera únicamente transcripción, sin tokens especiales de idioma, traducción ni timestamps.

El modelo base es un fine-tuning de Moonshine tiny sobre mandarín, según indica la model card del autor de la conversión. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card original reproduce parcialmente la estructura de la de Whisper y remite al paper de Moonshine (arXiv:2509.02523) para los detalles de entrenamiento y evaluación. La conversión GGUF fue validada numéricamente contra la referencia de Transformers en el commit 90bf720 de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto en chino mandarín (zh) a partir de audio PCM de 16 kHz.
- Procesamiento de audio en bruto sin necesidad de calcular espectrogramas ni filtros mel.
- Salida de transcripción únicamente: sin traducción, sin detección de idioma y sin marcas de tiempo.
- No soporta streaming (streaming: false en la metadata de transcribe.cpp).
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Capacidad monolingüe: no cubre otros idiomas distintos del mandarín.

## Casos de uso

- Transcripción de notas de voz en mandarín: el modelo convierte grabaciones de 16 kHz mono en texto con un consumo mínimo de memoria (34 MB en Q8_0), adecuado para apps móviles o de escritorio que procesen audio localmente.
- Subtitulado offline de contenido en chino: dado que no genera timestamps, se usaría para producir el texto plano de cada segmento y un alineador externo añadiría las marcas temporales.
- Procesamiento por lotes de archivos de audio: la CLI de transcribe.cpp permite invocar el modelo sobre WAVs de 16 kHz, lo que facilita integrarlo en scripts de conversión masiva con ffmpeg como paso previo.
- Integración en dispositivos embebidos o de gama baja: con 27M de parámetros y cuantización Q8_0 de 34 MB, cabe en sistemas con recursos muy limitados donde modelos ASR mayores no son viables.
- Transcripción en el borde (edge computing) sin conexión: al no requerir GPU ni servicios en la nube, puede desplegarse en entornos aislados o con requisitos de privacidad estrictos.
- Prototipado rápido de pipelines ASR en chino: sirve como baseline ligero para comparar calidad frente a modelos mayores antes de escalar la infraestructura.

## Benchmarks y rendimiento

| Métrica | F32 | F16 | Q8_0 |
|---|---:|---:|---:|
| CER en FLEURS-zh test (945 utterances) | 13,70 % | 13,70 % | 13,78 % |
| RTF en Apple M4 Max (Metal) | — | — | 127 |
| RTF en Apple M4 Max (CPU) | — | — | 153,5 |
| RTF en Ryzen 4750U (Vulkan) | — | — | 56 |
| RTF en Ryzen 4750U (CPU) | — | — | 45,5 |

El CER se midió con la decodificación por defecto de transcribe.cpp (greedy, num_beams=1, max_length=192). Como referencia, la implementación F32 en Transformers sobre MPS obtuvo un 13,72 % de CER en el mismo manifiesto. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier cuantización; el fichero Q8_0 ocupa 34 MB, el F16 57 MB y el F32 105 MB.
- GPU recomendadas: no requiere GPU; funciona en CPU. Se ha validado en Apple M4 Max con Metal y en Ryzen 4750U con Vulkan y CPU.
- Cabe en cualquier GPU de consumo e incluso en sistemas sin GPU dedicada.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), y el modelo base es compatible con Transformers (`MoonshineForConditionalGeneration` y `AutoProcessor`).
- Latencia y throughput: los valores RTF (real-time factor) reportados indican ejecución muy por encima de tiempo real en el hardware probado; no se dispone de cifras de latencia absoluta en milisegundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / audio | Licencia | Formato |
|---|---|---|---|---|---|
| moonshine-tiny-zh-gguf (este) | 27,1 M | zh | PCM 16 kHz, max_length 192 | MIT | GGUF |
| Whisper tiny | no disponible en la información | multilingüe | no disponible | MIT | safetensors, GGUF |
| Moonshine tiny (base, inglés) | 27 M (según arquitectura descrita) | en | PCM 16 kHz | MIT | safetensors |

No se dispone de datos de rendimiento comparativos con Whisper tiny ni con otros modelos ASR en la información proporcionada; la comparativa se limita a parámetros, idioma y licencia.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe mandarín; no detecta idioma ni traduce.
- Sin marcas de tiempo: no apto por sí solo para subtitulado sincronizado sin un alineador externo.
- Sin streaming: requiere el audio completo antes de transcribir.
- Riesgo de alucinación y bucles de generación: la model card original recomienda limitar max_length en función de la duración del audio para evitarlos.
- CER de referencia del 13,7 % en FLEURS-zh: calidad moderada, insuficiente para aplicaciones que exijan transcripción casi perfecta.
- Repositorio con cero descargas y cero likes, y tamaño reportado de 0.0 GB: conviene verificar la integridad de los ficheros antes de usarlo en producción.
- Licencia MIT: permite uso comercial, pero debe conservarse el aviso de copyright y consultarse los términos del modelo base.
- Sin datos publicados sobre sesgos, composición del dataset de entrenamiento ni evaluación por subgrupos demográficos.

## Enlaces

- [Hugging Face: tryambientai/moonshine-tiny-zh-gguf](https://huggingface.co/tryambientai/moonshine-tiny-zh-gguf)
- [Modelo base: UsefulSensors/moonshine-tiny-zh](https://huggingface.co/UsefulSensors/moonshine-tiny-zh)
- [Commit del modelo base (3306270)](https://huggingface.co/UsefulSensors/moonshine-tiny-zh/commit/3306270)
- [Repositorio transcribe.cpp](https://github.com/handy-computer/transcribe.cpp)
- [Documentación de Moonshine en transcribe.cpp](https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md)
- [Paper de Moonshine (arXiv:2509.02523)](https://arxiv.org/abs/2509.02523)
- [Paper Model Cards for Model Reporting (arXiv:1810.03993)](https://arxiv.org/abs/1810.03993)
- [Código de Moonshine AI](https://github.com/moonshine-ai/moonshine)
