# tryambientai/canary-1b-v2-gguf

## Resumen

Canary-1b-v2-gguf es una conversión al formato GGUF del modelo `nvidia/canary-1b-v2`, un sistema de reconocimiento automático del habla (ASR) y traducción de voz (AST) de aproximadamente 980 millones de parámetros desarrollado por NVIDIA. La conversión la mantiene el usuario `tryambientai` para su uso con `transcribe.cpp`, una implementación en C++ pensada para inferencia local y offline. El modelo cubre 25 idiomas europeos tanto en transcripción como en traducción desde y hacia el inglés.

La arquitectura es un modelo multitarea AED (Attention Encoder-Decoder) con un codificador FastConformer de 32 capas y un decodificador Transformer de 8 capas. Su relevancia actual radica en que permite ejecutar ASR multilingüe de calidad en hardware de consumo, sin dependencia de la nube, gracias a cuantizaciones que van desde 701 MB (Q4_K_M) hasta 3,7 GB (F32). El modelo base está publicado bajo licencia CC-BY-4.0, lo que facilita su uso comercial con atribución.

Esta conversión concreta está validada contra la implementación de referencia de NeMo y ofrece cifras de WER medidas de forma independiente sobre LibriSpeech test-clean, lo que la convierte en una opción práctica para despliegues locales de transcripción multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder multitarea (AED): FastConformer de 32 capas + Transformer de 8 capas |
| Parametros totales | 980.046.848 (~978M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; entrada de 16 kHz mono WAV) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder multitarea de tipo AED. El codificador es un FastConformer de 32 capas, una variante eficiente del Conformer que reduce el coste computacional mediante downsampling de la secuencia de entrada, y el decodificador es un Transformer de 8 capas. Esta combinación está diseñada para tareas conjuntas de transcripción y traducción de voz dentro de un mismo modelo, con un token de tarea que indica el idioma de origen y destino.

Los detalles concretos sobre el volumen de datos de entrenamiento, la composición del dataset y si se aplicaron técnicas de RLHF o DPO no están disponibles en la información proporcionada. La model card original de NVIDIA describe el modelo como apto para uso comercial y no comercial, y esta conversión GGUF se ha validado numéricamente contra la implementación de referencia de NeMo (commit `db53eda` de transcribe.cpp, validado el 2026-05-08). La conversión se realizó a partir del commit upstream `87bc526` del modelo base.

## Capacidades

- Reconocimiento automático del habla (ASR) en 25 idiomas europeos.
- Traducción de voz (AST) desde inglés hacia los otros 24 idiomas.
- Traducción de voz (AST) desde los otros 24 idiomas hacia inglés.
- Procesamiento de audio de entrada en formato WAV mono a 16 kHz.
- Ejecución offline y local mediante `transcribe.cpp` (sin dependencia de servicios en la nube).
- Compatibilidad con aceleración por Metal (Apple Silicon) y Vulkan (GPU integradas y discretas).
- No soporta streaming (indicado explícitamente como `streaming: false`).
- No expone detección automática de idioma (`lang_detect: false`).
- No expone marcas de tiempo por palabra o segmento en este port (`timestamps: none`).

## Casos de uso

- Transcripción de reuniones y entrevistas multilingües: el modelo puede procesar grabaciones en cualquiera de los 25 idiomas soportados y generar actas o resúmenes en texto, ejecutándose localmente en un portátil con la cuantización Q5_K_M (798 MB).
- Subtitulado de contenido audiovisual europeo: útil para plataformas que distribuyen vídeo en varios idiomas de la UE, ya que cubre desde búlgaro hasta sueco en un único modelo.
- Traducción de voz a texto para atención al cliente: permite transcribir llamadas en el idioma del cliente y traducirlas al inglés para su análisis por equipos centralizados.
- Procesamiento por lotes en servidores sin GPU: con la cuantización Q4_K_M (701 MB) y ejecución en CPU mediante Vulkan o CPU nativa, es viable transcribir grandes volúmenes de audio en infraestructura modesta.
- Investigación en lingüística computacional: el modelo facilita experimentos con 25 idiomas europeos bajo una misma arquitectura, lo que simplifica la comparación de fenómenos lingüísticos entre lenguas.
- Archivado y accesibilidad de contenido histórico: digitalización de archivos de audio en lenguas europeas menos representadas (estonio, maltés, esloveno) con un modelo de tamaño reducido y licencia permisiva.
- Integración en aplicaciones de escritorio: al compilarse con `transcribe.cpp` y funcionar offline, puede embeberse en herramientas de toma de notas o dictado sin enviar audio a terceros.

## Benchmarks y rendimiento

Resultados de WER sobre LibriSpeech test-clean (2620 utterances, decodificación greedy, sin LM externo) medidos por el autor de la conversión:

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 3,7 GB | 1,92 % |
| F16 | 1,8 GB | 1,92 % |
| Q8_0 | 1,1 GB | 1,91 % |
| Q6_K | 889 MB | 1,94 % |
| Q5_K_M | 798 MB | 1,93 % |
| Q4_K_M | 701 MB | 1,91 % |

NVIDIA reporta en la model card original un WER de 2,18 % sobre el mismo conjunto; el port F32 obtiene 1,92 % (Δ −0,26 pp), diferencia que el autor atribuye probablemente a diferencias en el método de puntuación.

Rendimiento (RTF, factor de tiempo real; mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 85,2 |
| Apple M4 Max | CPU | 18,9 |
| Ryzen 4750U | Vulkan | 13,2 |
| Ryzen 4750U | CPU | 6,7 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,7 GB para Q4_K_M, 1,1 GB para Q8_0 y hasta 3,7 GB para F32 (los pesos deben residir en memoria o VRAM durante la inferencia).
- GPU recomendadas: cualquier GPU con soporte Vulkan (integradas y discretas); en Apple Silicon se aprovecha Metal. No se requieren GPUs de datacenter como A100 o H100 para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1-2 GB de VRAM libre, e incluso en CPU pura.
- Opciones de despliegue: `transcribe.cpp` (compilación desde fuente con CMake); no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: RTF de 85,2 en M4 Max con Metal y 13,2 en Ryzen 4750U con Vulkan, lo que implica procesar audio entre 13 y 85 veces más rápido que tiempo real según el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| canary-1b-v2-gguf (este) | ~978M | 25 europeos | CC-BY-4.0 | GGUF | ASR + traducción, offline, validado contra NeMo |
| nvidia/canary-1b-v2 (base) | ~978M | 25 europeos | CC-BY-4.0 | NeMo (.nemo) | Requiere NeMo/PyTorch; referencia upstream |
| Whisper large-v3 | ~1.550M | ~99 | MIT | safetensors, GGUF, etc. | Mayor cobertura de idiomas, ecosistema más amplio |
| Whisper small | ~244M | ~99 | MIT | safetensors, GGUF, etc. | Menor tamaño, menor precisión; alternativa ligera |

La información disponible no incluye comparativas de WER entre estos modelos sobre los mismos conjuntos, por lo que no se presentan cifras cruzadas.

## Limitaciones y advertencias

- No es un modelo de streaming: requiere el audio completo o segmentos cerrados, lo que limita su uso en transcripción en vivo.
- No expone detección automática de idioma: el idioma de origen debe especificarse explícitamente.
- No proporciona marcas de tiempo por palabra o segmento en este port, lo que complica la generación de subtítulos sincronizados.
- Solo acepta entrada de audio WAV mono a 16 kHz; es necesario convertir otros formatos con herramientas externas como ffmpeg.
- La cobertura lingüística se limita a 25 idiomas europeos; no soporta otras lenguas.
- Riesgo de alucinación en audio con ruido, solapamiento de hablantes o acentos no representados en el entrenamiento; no se dispone de datos específicos sobre sesgos.
- La licencia CC-BY-4.0 permite uso comercial pero exige atribución a NVIDIA y al autor de la conversión.
- El modelo base se fijó en un commit concreto (`87bc526`); futuras actualizaciones upstream no se reflejarán automáticamente en esta conversión.
- La validación numérica se realizó contra NeMo en una fecha concreta (2026-05-08); cambios posteriores en `transcribe.cpp` podrían afectar a la reproducibilidad.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/tryambientai/canary-1b-v2-gguf
- Modelo base en Hugging Face: https://huggingface.co/nvidia/canary-1b-v2
- Commit upstream fijado: https://huggingface.co/nvidia/canary-1b-v2/commit/87bc526
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/db53eda
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/canary-1b-v2.md
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/nvidia/canary-1b-v2
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/legalcode.en
- Portal de desarrolladores de NVIDIA: https://developer.nvidia.com
