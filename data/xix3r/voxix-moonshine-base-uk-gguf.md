# xix3r/voxix-moonshine-base-uk-gguf

## Resumen

Voxix-moonshine-base-uk-gguf es una conversión al formato GGUF del modelo UsefulSensors/moonshine-base-uk, un sistema de reconocimiento automático del habla (ASR) especializado en ucraniano. Lo desarrolla el usuario xix3r sobre el trabajo original de UsefulSensors, que a su vez parte de la arquitectura Moonshine de Useful Sensors. El modelo resuelve la transcripción de audio a texto en ucraniano con un tamaño muy reducido: 61,5 millones de parámetros, lo que lo hace viable en hardware de consumo y en entornos embebidos.

La relevancia de esta ficha radica en su formato: los pesos están empaquetados para transcribe.cpp, una implementación en C++ que permite ejecutar el modelo sin depender de Python ni de PyTorch. Esto reduce la huella de memoria y facilita el despliegue en aplicaciones de escritorio, dispositivos móviles o sistemas con GPU integrada. El repositorio ocupa solo 0,1 GB e incluye tres cuantizaciones (F32, F16 y Q8_0) con tamaños de 236 MB, 126 MB y 74 MB respectivamente.

El modelo es monolingüe (ucraniano), no realiza detección de idioma, no traduce y no genera marcas de tiempo. Su licencia MIT permite uso comercial sin restricciones significativas. La arquitectura es un transformer encoder-decoder que consume PCM crudo a 16 kHz mediante un stem de tres capas Conv1d, sin STFT ni banco de filtros mel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Moonshine base) con stem Conv1d de 3 capas |
| Parametros totales | 61.513.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (max_length de decodificación: 192 tokens) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | Ucraniano (uk) |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine base: un transformer encoder-decoder de 62 millones de parámetros que procesa audio PCM crudo a 16 kHz. A diferencia de los pipelines ASR clásicos basados en Whisper, no utiliza STFT ni banco de filtros mel; en su lugar, un stem de tres capas Conv1d aprende representaciones directamente de la forma de onda. La salida es únicamente texto transcrito, sin etiquetas de idioma ni marcas temporales.

El modelo original UsefulSensors/moonshine-base-uk es un fine-tuning de moonshine-base sobre ucraniano. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card original de UsefulSensors está mayoritariamente sin rellenar ("More Information Needed"), por lo que los detalles de entrenamiento no están disponibles. La conversión GGUF fue validada contra la referencia de Transformers en el commit 90bf720 de transcribe.cpp, con fecha de anclaje 2026-05-12.

## Capacidades

- Transcripción de voz a texto en ucraniano a partir de audio PCM mono a 16 kHz.
- Procesamiento de audio sin necesidad de extracción de características mel ni STFT.
- Salida de solo transcripción: no genera marcas de tiempo, no traduce y no detecta idioma.
- Inferencia en CPU y GPU mediante transcribe.cpp (soporte de Metal y Vulkan según la model card).
- No soporta streaming (streaming: false en la model card).
- No soporta tool calling, function calling ni razonamiento multi-paso; es un modelo ASR puro.
- Capacidad multilingüe limitada a ucraniano.

## Casos de uso

- Transcripción de reuniones y entrevistas en ucraniano: el modelo convierte grabaciones de audio a texto con un WER de referencia del 14,49% en FLEURS-uk, adecuado para actas y resúmenes posteriores en entornos donde no se requiere transcripción perfecta.
- Subtitulado automático de contenido audiovisual ucraniano: aunque no genera marcas de tiempo, puede integrarse en un pipeline que alinee la transcripción con el audio mediante herramientas externas de forced alignment.
- Asistentes de voz locales en ucraniano: al caber en 74 MB (Q8_0) y ejecutarse en CPU, puede desplegarse en dispositivos de bajo consumo o aplicaciones de escritorio sin conexión a la nube.
- Digitalización de archivos orales: transcripción de entrevistas, grabaciones históricas o material de archivo en ucraniano para su indexación y búsqueda textual.
- Accesibilidad en aplicaciones ucranianas: generación de subtítulos en tiempo casi real (no streaming nativo) para vídeos o llamadas, con latencia dependiente del hardware.
- Procesamiento por lotes en servidores sin GPU: gracias a transcribe.cpp y a las cuantizaciones ligeras, se pueden transcribir grandes volúmenes de audio en CPU con un rendimiento medido de RTF 22 en un Ryzen 4750U (Vulkan: 34,5).
- Integración en sistemas embebidos o de borde: el tamaño reducido y la licencia MIT permiten incorporar el modelo en productos comerciales de transcripción sin coste de licencia.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 |
|---|---:|---:|---:|
| WER FLEURS-uk test (750 utterances) | 14,49% | 14,49% | 14,39% |
| RTF en M4 Max (Metal) | No disponible | No disponible | 79,5 |
| RTF en M4 Max (CPU) | No disponible | No disponible | 80,5 |
| RTF en Ryzen 4750U (Vulkan) | No disponible | No disponible | 34,5 |
| RTF en Ryzen 4750U (CPU) | No disponible | No disponible | 22 |

La referencia en Transformers F32 (MoonshineForConditionalGeneration, fp32 en MPS) obtiene un WER del 14,51% sobre el mismo manifiesto. Las cifras de transcribe.cpp en F32/F16 coinciden con la referencia dentro del ruido del intervalo de confianza bootstrap; Q8_0 introduce una deriva adicional típicamente inferior a 0,1 puntos porcentuales respecto a F16.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones (236 MB en F32, 126 MB en F16, 74 MB en Q8_0 para los pesos; el consumo real de memoria incluye buffers de activación y audio).
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon, incluido M4 Max) o Vulkan (integradas y dedicadas). No se requiere una GPU de datacenter.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU. También funciona en CPU sin GPU.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake. No se mencionan otros runtimes compatibles en la información disponible.
- Latencia y throughput: RTF de 79,5 (Metal en M4 Max) y 80,5 (CPU en M4 Max); RTF de 34,5 (Vulkan en Ryzen 4750U) y 22 (CPU en Ryzen 4750U). Un RTF superior a 1 indica procesamiento más rápido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | WER FLEURS-uk |
|---|---:|---|---|---|---|---:|
| xix3r/voxix-moonshine-base-uk-gguf | 61,5 M | No disponible | uk | MIT | GGUF | 14,39% (Q8_0) |
| UsefulSensors/moonshine-base-uk | 61,5 M | No disponible | uk | MIT | safetensors | No publicado |
| Whisper base (OpenAI) | 74 M | 30 s de audio | Multilingüe | MIT | safetensors, GGUF | No disponible en la información |
| Moonshine base (original) | 61,5 M | No disponible | en | MIT | safetensors | No disponible en la información |

No se dispone de datos de benchmarks comparativos adicionales en la información proporcionada. La comparación con Whisper base se ofrece por categoria (ASR de tamano similar), pero no se han verificado sus cifras de WER en ucraniano en esta ficha.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe ucraniano; no detecta idioma ni traduce.
- Sin marcas de tiempo: no genera timestamps, lo que limita su uso directo en subtitulado sincronizado.
- Sin streaming: la model card indica `streaming: false`; no es adecuado para transcripción en tiempo real continua sin segmentación previa.
- WER del 14,49% en FLEURS-uk: implica un margen de error notable en condiciones de audio difíciles, ruido o acentos no representados en el conjunto de evaluación.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto plausible pero incorrecto en segmentos de audio ambiguos o silenciosos.
- Sesgos: no se dispone de información sobre sesgos demográficos, dialectales o de género en el entrenamiento; la model card original no los documenta.
- Restricciones de licencia: MIT permite uso comercial, pero se hereda del modelo base; conviene revisar la model card original de UsefulSensors para términos completos.
- Dependencia de transcribe.cpp: el formato GGUF está validado para ese runtime; otros motores de inferencia pueden no ser compatibles.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de validación comunitaria independiente.

## Enlaces

- [Hugging Face: xix3r/voxix-moonshine-base-uk-gguf](https://huggingface.co/xix3r/voxix-moonshine-base-uk-gguf)
- [Modelo base: UsefulSensors/moonshine-base-uk](https://huggingface.co/UsefulSensors/moonshine-base-uk)
- [Commit del modelo base a52b2e9](https://huggingface.co/UsefulSensors/moonshine-base-uk/commit/a52b2e9)
- [transcribe.cpp (repositorio)](https://github.com/handy-computer/transcribe.cpp)
- [transcribe.cpp commit 90bf720](https://github.com/handy-computer/transcribe.cpp/tree/90bf720)
- [Documentación de modelos Moonshine en transcribe.cpp](https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md)
- [Paper de referencia arXiv:1910.09700](https://arxiv.org/abs/1910.09700)
