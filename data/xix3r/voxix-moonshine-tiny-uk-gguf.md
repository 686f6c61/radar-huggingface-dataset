# xix3r/voxix-moonshine-tiny-uk-gguf

## Resumen

voxix-moonshine-tiny-uk-gguf es una conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) UsefulSensors/moonshine-tiny-uk, publicada por el usuario xix3r para su uso con el runtime transcribe.cpp. El modelo base es un fine-tuning de Moonshine Tiny sobre ucraniano, desarrollado por Moonshine AI (anteriormente Useful Sensors), y conserva la arquitectura encoder-decoder transformer del original con 27.092.736 parámetros totales. Su propósito es transcribir audio en ucraniano de forma ligera y eficiente, sin necesidad de GPU dedicada.

La relevancia de esta ficha radica en que ofrece una alternativa extremadamente compacta (34 MB en cuantización Q8_0) para transcripción en ucraniano, un idioma con menor cobertura en modelos ASR multilingües. El modelo consume PCM crudo a 16 kHz mediante un stem Conv1d de tres capas, sin STFT ni banco de filtros mel, y emite únicamente texto transcrito. Está pensado para despliegues en dispositivos con recursos limitados, como CPUs de portátiles o placas embebidas.

La versión GGUF está validada contra la referencia de Transformers y proporciona métricas de WER sobre FLEURS-uk, junto con factores de tiempo real (RTF) medidos en hardware concreto (Apple M4 Max y AMD Ryzen 4750U). Es un modelo monolingüe, sin detección de idioma, sin traducción y sin marcas de tiempo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Moonshine Tiny), stem Conv1d de 3 capas |
| Parámetros totales | 27.092.736 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max_length de decodificación = 192 tokens) |
| Tipos de cuantización | F32, F16, Q8_0 |
| Idiomas soportados | ucraniano (uk) |
| Licencia | MIT |
| Formato de pesos | GGUF (runtime transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine Tiny: un transformer encoder-decoder que procesa audio PCM crudo a 16 kHz a través de un stem convolucional de tres capas Conv1d, eliminando la necesidad de STFT y banco de filtros mel presentes en Whisper. Esta decisión reduce el coste computacional del preprocesado y permite trabajar directamente sobre la forma de onda. El decoder genera únicamente la transcripción, sin tokens especiales de idioma, traducción ni timestamps.

El fine-tuning sobre ucraniano parte del modelo base UsefulSensors/moonshine-tiny-uk en el commit 8cf70f4 (fijado el 2026-05-12). No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card original referencia el paper arXiv:2509.02523 para más información sobre el entrenamiento y la evaluación.

## Capacidades

- Transcripción de voz a texto en ucraniano a partir de audio PCM mono a 16 kHz.
- Procesamiento de audio sin preprocesado STFT ni mel filterbank, gracias al stem Conv1d.
- Generación de transcripciones sin marcas de tiempo, sin detección de idioma y sin traducción.
- No soporta streaming (streaming: false según metadatos de transcribe.cpp).
- No soporta tool calling ni function calling (no aplica a un modelo ASR).
- No soporta agentes ni razonamiento multi-paso (no aplica).
- Capacidad monolingüe: únicamente ucraniano.

## Casos de uso

- Transcripción de reuniones y entrevistas en ucraniano: el modelo convierte grabaciones de audio a texto con un WER del 18,83 % en FLEURS-uk, adecuado para actas y notas donde no se requiere precisión perfecta.
- Subtitulado offline de contenido audiovisual en ucraniano: dado que no genera timestamps, se usaría para obtener el texto plano y posteriormente alinear manualmente o con otra herramienta.
- Procesamiento por lotes en CPU: con un RTF de 45,5 en un Ryzen 4750U (CPU), puede transcribir audio más rápido que tiempo real sin GPU, ideal para pipelines de archivado masivo.
- Despliegue en dispositivos embebidos o de bajo consumo: el tamaño de 34 MB en Q8_0 permite integrarlo en sistemas con memoria limitada, como Raspberry Pi o routers, para transcripción local.
- Transcripción en el borde (edge computing) con aceleración Vulkan: el RTF de 56 en Ryzen 4750U con Vulkan permite integrarlo en aplicaciones de escritorio con GPU integrada.
- Aplicaciones de accesibilidad para hablantes de ucraniano: transcripción en tiempo no real de notas de voz o audios pregrabados para personas con dificultades auditivas, ejecutándose localmente sin enviar datos a la nube.
- Investigación lingüística sobre ucraniano: generación de corpus transcritos a partir de grabaciones de campo, con la ventaja de ser un modelo ligero y de licencia MIT que puede ejecutarse en portátiles de campo.

## Benchmarks y rendimiento

| Benchmark | F32 | F16 | Q8_0 | Referencia Transformers F32 |
|---|---:|---:|---:|---:|
| WER FLEURS-uk test (750 utterances) | 18,83 % | 18,82 % | 18,89 % | 18,86 % |

| Hardware | Backend | RTF (factor de tiempo real) |
|---|---|---:|
| Apple M4 Max | Metal | 127 |
| Apple M4 Max | CPU | 153,5 |
| AMD Ryzen 4750U | Vulkan | 56 |
| AMD Ryzen 4750U | CPU | 45,5 |

El WER se midió con la decodificación por defecto de transcribe.cpp (greedy, num_beams=1, max_length=192, coincidiendo con la generation_config original). La referencia en Transformers se ejecutó en fp32 sobre MPS. Las diferencias entre F32, F16 y Q8_0 están dentro del ruido de la intervalo de confianza bootstrap, con una deriva adicional de Q8_0 respecto a F16 típicamente inferior a 0,1 puntos porcentuales.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la mayoría de despliegues; el modelo es tan pequeño que cabe en memoria RAM. En GPU, el peso en F32 ocupa 105 MB, en F16 57 MB y en Q8_0 34 MB.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel) es suficiente. No se requieren A100 ni H100.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una GPU integrada Intel. También funciona exclusivamente en CPU.
- Opciones de despliegue: transcribe.cpp (runtime nativo en C++), y la versión original en Transformers (MoonshineForConditionalGeneration) con PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: RTF de 127 en Metal (M4 Max) y 56 en Vulkan (Ryzen 4750U), lo que significa que procesa audio entre 45 y 153 veces más rápido que tiempo real según el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | WER FLEURS-uk | Licencia | Formato |
|---|---|---:|---|---:|---|---|
| voxix-moonshine-tiny-uk-gguf | 27,1 M | no disponible (max 192 tokens) | ucraniano | 18,83 % (F32) | MIT | GGUF |
| Whisper Tiny | no disponible en la información | no disponible | multilingüe | no disponible | MIT | safetensors, GGUF |
| Moonshine Tiny (original, inglés) | 27 M (aprox.) | no disponible | inglés | no disponible | MIT | safetensors |

No se dispone de datos de benchmarks comparativos directos con Whisper Tiny u otros modelos ASR en la información proporcionada. La comparación con Whisper Tiny se basa en que ambos son modelos ASR ligeros, pero no se aportan cifras de WER para ucraniano en Whisper Tiny.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe ucraniano; no detecta idioma ni traduce.
- Sin marcas de tiempo: no genera timestamps, lo que limita su uso en subtitulado sincronizado.
- Sin streaming: no soporta transcripción en tiempo real por flujo continuo.
- WER del 18,83 % en FLEURS-uk: implica que aproximadamente una de cada cinco palabras puede contener errores, insuficiente para aplicaciones que requieran alta precisión sin revisión humana.
- Riesgo de alucinación: como todo modelo ASR, puede generar texto plausible en segmentos de silencio o ruido; la model card original recomienda limitar la longitud máxima de generación para evitar bucles de alucinación.
- Sesgos: no se documentan sesgos específicos en la información proporcionada, pero al estar entrenado sobre un corpus concreto (FLEURS y datos no detallados), puede tener peor rendimiento en acentos, dialectos o dominios no representados.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero se hereda del modelo base y se recomienda consultar la model card upstream para términos completos.
- Repositorio con 0 descargas y 0 likes: modelo recién publicado (creado el 2026-11-13), sin validación comunitaria adicional más allá de la del autor.
- El repositorio tiene un tamaño de 0.0 GB según Hugging Face, lo que puede indicar que los archivos GGUF no están alojados en este repositorio o que el tamaño se redondea; los enlaces de descarga apuntan a handy-computer/moonshine-tiny-uk-gguf.

## Enlaces

- [Hugging Face: xix3r/voxix-moonshine-tiny-uk-gguf](https://huggingface.co/xix3r/voxix-moonshine-tiny-uk-gguf)
- [Modelo base: UsefulSensors/moonshine-tiny-uk](https://huggingface.co/UsefulSensors/moonshine-tiny-uk)
- [Paper Moonshine (arXiv:2509.02523)](https://arxiv.org/abs/2509.02523)
- [Paper Model Cards for Model Reporting (arXiv:1810.03993)](https://arxiv.org/abs/1810.03993)
- [Repositorio transcribe.cpp](https://github.com/handy-computer/transcribe.cpp)
- [Documentación de modelos Moonshine en transcribe.cpp](https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md)
- [Repositorio Moonshine de Useful Sensors](https://github.com/usefulsensors/moonshine/blob/main/README.md)
- [Commit upstream 8cf70f4](https://huggingface.co/UsefulSensors/moonshine-tiny-uk/commit/8cf70f4)
- [Commit transcribe.cpp 90bf720](https://github.com/handy-computer/transcribe.cpp/tree/90bf720)
- [Descarga F32](https://huggingface.co/handy-computer/moonshine-tiny-uk-gguf/resolve/main/moonshine-tiny-uk-F32.gguf)
- [Descarga F16](https://huggingface.co/handy-computer/moonshine-tiny-uk-gguf/resolve/main/moonshine-tiny-uk-F16.gguf)
- [Descarga Q8_0](https://huggingface.co/handy-computer/moonshine-tiny-uk-gguf/resolve/main/moonshine-tiny-uk-Q8_0.gguf)
