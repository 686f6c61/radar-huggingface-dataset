# tryambientai/moonshine-tiny-vi-gguf

## Resumen

moonshine-tiny-vi-gguf es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) UsefulSensors/moonshine-tiny-vi, publicada por el usuario tryambientai para su uso con la librería transcribe.cpp. Se trata de una adaptación al vietnamita del modelo Moonshine tiny de Moonshine AI (anteriormente Useful Sensors), una arquitectura encoder-decoder transformer de solo 27 millones de parámetros diseñada específicamente para transcripción de voz en dispositivos con recursos limitados.

La relevancia de esta ficha radica en su naturaleza práctica: es un modelo de nicho (un solo idioma, vietnamita) empaquetado en cuantizaciones ligeras (34-105 MB) que permiten ejecutar transcripción de voz en CPU, GPU integradas o dispositivos móviles sin necesidad de infraestructura pesada. El modelo base Moonshine introduce una innovación arquitectónica frente a Whisper: consume PCM crudo a 16 kHz mediante un stem Conv1d de tres capas, eliminando el paso de STFT y los filtros mel, lo que reduce latencia y coste computacional en audio corto.

Esta conversión GGUF concreta está pensada para transcribe.cpp, una implementación en C++ que replica la inferencia del modelo original con validación numérica frente a la referencia de Transformers. No incluye traducción, detección de idioma ni marcas de tiempo, y no soporta streaming. Es, por tanto, una herramienta especializada para transcripción offline de audio vietnamita en entornos de borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Moonshine tiny), stem Conv1d de 3 capas sobre PCM crudo a 16 kHz |
| Parametros totales | 27.092.736 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (max_length de decodificación por defecto: 192 tokens) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine tiny, un encoder-decoder transformer de 27 millones de parámetros que procesa audio PCM crudo a 16 kHz mediante un stem convolucional de tres capas Conv1d, sin STFT ni banco de filtros mel. Esta decisión de diseño reduce el coste de preprocesado y la latencia en comparación con pipelines tipo Whisper, especialmente en fragmentos de audio cortos. La salida es únicamente texto transcrito, sin etiquetas de idioma ni marcas temporales.

La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens de audio procesados ni si se aplicaron técnicas de RLHF o DPO. El modelo base fue entrenado por Moonshine AI y posteriormente ajustado al vietnamita por UsefulSensors; esta conversión GGUF parte del commit d4d20da del modelo upstream (fijado el 2026-05-12) y se validó contra la referencia de Transformers en el commit 90bf720 de transcribe.cpp. La conversión preserva el comportamiento numérico del original: el WER en F32/F16 coincide con la referencia dentro del ruido de intervalo de confianza bootstrap, y Q8_0 introduce una deriva típica inferior a 0,1 puntos porcentuales.

## Capacidades

- Transcripción de voz a texto en vietnamita a partir de audio PCM mono a 16 kHz.
- Procesamiento de audio crudo sin necesidad de extracción de features mel ni STFT.
- Inferencia en CPU, GPU con Metal (Apple Silicon) y GPU con Vulkan (AMD/Intel), según los datos de rendimiento publicados.
- Ejecución en dispositivos de recursos limitados gracias a su tamaño reducido (27M parámetros, 34 MB en Q8_0).
- Salida de solo transcripción: no traduce, no detecta idioma y no genera marcas de tiempo.
- No soporta streaming (procesamiento por lotes de audio completo).
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo ASR puro).

## Casos de uso

- Transcripción de reuniones y notas de voz en vietnamita: el modelo procesa audio mono a 16 kHz y devuelve texto plano, adecuado para integrarse en aplicaciones de dictado o actas automáticas donde el audio ya está grabado y no se requiere tiempo real.
- Subtitulado offline de contenido en vietnamita: aunque no genera marcas de tiempo, puede transcribir el audio completo y alinearse posteriormente con herramientas externas de forced alignment para producir subtítulos.
- Asistentes de voz embebidos en dispositivos de borde: con 34 MB en Q8_0 y ejecución en CPU (RTF 45,5 en Ryzen 4750U), cabe en routers, Raspberry Pi o móviles para comandos de voz locales sin conexión.
- Transcripción en aplicaciones de accesibilidad para hablantes de vietnamita: conversión de voz a texto en tiempo casi real en portátiles consumer, con latencia controlada por el RTF de 45-56 en CPU/Vulkan.
- Pipeline de análisis de llamadas de atención al cliente: transcripción por lotes de grabaciones telefónicas en vietnamita para su posterior procesamiento con NLP (análisis de sentimiento, extracción de entidades).
- Digitalización de archivos orales y entrevistas: conversión de grabaciones históricas o periodísticas en vietnamita a texto indexable, ejecutable en un portátil sin GPU dedicada.
- Preprocesado para modelos de lenguaje: la transcripción sirve como entrada de texto para pipelines RAG o resumen automático en vietnamita, reduciendo la dependencia de servicios ASR en la nube.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 |
|---|---:|---:|---:|
| WER FLEURS-vi test (857 utterances) | 13,16 % | 13,17 % | 13,16 % |
| RTF en M4 Max (Metal) | 127 | 127 | 127 |
| RTF en M4 Max (CPU) | 153,5 | 153,5 | 153,5 |
| RTF en Ryzen 4750U (Vulkan) | 56 | 56 | 56 |
| RTF en Ryzen 4750U (CPU) | 45,5 | 45,5 | 45,5 |

Referencia Transformers F32 (MPS): 13,18 % WER en el mismo manifiesto. Los valores de RTF (real-time factor) indican cuántas veces más rápido que el tiempo real procesa el audio; valores más altos son mejores. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible, al tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones (F32: ~105 MB de pesos; F16: ~57 MB; Q8_0: ~34 MB), más overhead de activaciones mínimo.
- GPU recomendadas: no requiere GPU dedicada; funciona en Apple Silicon con Metal y en GPUs AMD/Intel con Vulkan.
- Cabe en cualquier GPU consumer e integrada, así como en CPU de gama baja (validado en Ryzen 4750U).
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), con compilación vía CMake; el modelo base es compatible con Transformers (`MoonshineForConditionalGeneration`).
- Latencia y throughput: RTF de 127 en Metal (M4 Max), 153,5 en CPU (M4 Max), 56 en Vulkan (Ryzen 4750U) y 45,5 en CPU (Ryzen 4750U). Es decir, procesa audio entre 45 y 153 veces más rápido que el tiempo real según plataforma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---:|---|---|---|---|
| moonshine-tiny-vi-gguf | 27M | no disponible (max_length 192) | vi | MIT | GGUF |
| Whisper tiny | 39M | 30 s de audio | multilingue (99 idiomas) | MIT | safetensors, GGUF, etc. |
| Whisper base | 74M | 30 s de audio | multilingue (99 idiomas) | MIT | safetensors, GGUF, etc. |
| moonshine-tiny (base) | 27M | no disponible | ingles | MIT | safetensors |

Frente a Whisper tiny, moonshine-tiny-vi-gguf es más pequeño (27M vs 39M) y evita el preprocesado mel, lo que reduce latencia en audio corto, pero está limitado a vietnamita y carece de marcas de tiempo y detección de idioma. Whisper tiny ofrece cobertura multilingüe amplia a cambio de mayor coste computacional y dependencia del pipeline STFT. No se dispone de datos de WER comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe vietnamita; no detecta idioma ni traduce.
- No genera marcas de tiempo ni soporta streaming, lo que limita su uso en subtitulado sincronizado o dictado en vivo.
- Riesgo de alucinación y bucles de generación: la model card del modelo base recomienda limitar `max_length` en función de la duración del audio para evitarlos.
- WER de referencia del 13,16 % en FLEURS-vi: aceptable para transcripción asistida, pero no para aplicaciones que exijan precisión literal (por ejemplo, actas legales).
- Sesgos: no se documentan sesgos específicos en la información disponible; al ser un modelo ajustado sobre un corpus concreto, puede tener peor rendimiento en acentos o dominios no representados.
- Licencia MIT: permite uso comercial, pero se hereda del modelo base y conviene revisar los términos upstream.
- Dependencia de formato de audio: requiere WAV mono a 16 kHz; es necesario convertir otros formatos con ffmpeg antes de la inferencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación limitado fuera de los tests numéricos del autor.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/tryambientai/moonshine-tiny-vi-gguf
- Modelo base en Hugging Face: https://huggingface.co/UsefulSensors/moonshine-tiny-vi
- Commit del modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-vi/commit/d4d20da
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentación de Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Paper de Moonshine: https://arxiv.org/abs/2509.02523
- Paper Model Cards for Model Reporting: https://arxiv.org/abs/1810.03993
- Repositorio Moonshine (Useful Sensors): https://github.com/usefulsensors/moonshine/blob/main/README.md
- Model card de Whisper (referencia de riesgos): https://github.com/openai/whisper/blob/main/model-card.md
