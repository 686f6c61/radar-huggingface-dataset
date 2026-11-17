# zankich/Qwen3.8-Flash-Next-W4A16-Merlin-INT4PLE

## Resumen

Qwen3.8-Flash-Next-W4A16-Merlin-INT4PLE es un checkpoint cuantizado del modelo Qwen3.8-Flash-Next de Alibaba Qwen, publicado por el usuario zankich sobre el trabajo de cuantización previo de halt95. Se trata de un empaquetado que parte del checkpoint W4A16 Merlin (cuerpo del modelo en 4 bits con activaciones en 16 bits, formato compressed-tensors) y le aplica dos modificaciones: la conversión de la tabla de embeddings n-gram PLE de 51.000 millones de parámetros de FP8 a INT4, y una caché KV calibrada en FP8 E4M3. El modelo total declarado en safetensors es de 123.958.298.771 parámetros.

La relevancia de este checkpoint es puramente de despliegue: reduce la tabla PLE fijada en memoria de host de 47,7 GB a 26,8 GB (requiere unos 32 GB de RAM libre) y, con la caché KV en FP8, aproximadamente duplica el número de tokens que caben por GiB de VRAM, lo que permite activar la ventana de contexto nativa de 262.144 tokens. No aporta mejoras de capacidad sobre el modelo base; es una receta de servido para vLLM.

El modelo requiere obligatoriamente una build de vLLM con el plugin int4 PLE y soporte de la arquitectura `qwen4_exp`, que no existe en vLLM estándar. El autor mantiene un fork (`zankich/vllm`) y una imagen preconstruida (`zankich/vllm-openai`). La licencia es `qwen-research`, lo que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y capas QSA; soporte de decodificación especulativa MTP; ruta multimodal de visión |
| Parametros totales | 123.958.298.771 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (nativa, activable con caché KV FP8) |
| Tipos de cuantizacion | Cuerpo W4A16 (GPTQ, compressed-tensors); tabla PLE INT4 (grupo 32, simétrico); caché KV FP8 E4M3 con escalas estáticas por capa; cabeza MTP en bf16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (etiquetada como `other`) |
| Formato de pesos | safetensors (95 GB, 40 archivos) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con capas de mezcla de expertos (MoE) y capas QSA (atención con escalas calibradas), según se deduce de la configuración de servido: el autor indica `--enable-expert-parallel` sobre las capas MoE y el sidecar de escalas cubre 12 capas QSA. Incluye una cabeza MTP (multi-token prediction) en bf16 que habilita decodificación especulativa opcional mediante `--speculative-config`. La ruta multimodal de visión se sirve junto al texto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la información proporcionada. La innovación técnica documentada de este checkpoint es el contrato de empaquetado INT4 de la tabla PLE: palabras int32 `[rows, 20]` con 8 nibbles little-endian por palabra (elemento `i` del grupo de 8 en los bits `4i`), códigos almacenados con sesgo +8 (`value = (nibble - 8) * scale`), escalas fp16 `[rows, 5]` una por grupo de 32 columnas con la escala global del origen FP8 incorporada, y un residuo de ida y vuelta acotado a medio paso de cuantización. El manifiesto `ple-int4-manifest.json` registra digests SHA-256 por shard y los residuos de autocomprobación del empaquetador.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento: el checkpoint incluye plantilla de chat y etiquetas de razonamiento que se parsean con `--reasoning-parser qwen3`.
- Llamada a herramientas y funciones: soporte de tool calling automático con `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Comprensión de imágenes: la ruta multimodal de visión se sirve junto con el texto.
- Contexto largo: ventana nativa de 262.144 tokens, viable gracias a la caché KV en FP8.
- Decodificación especulativa mediante la cabeza MTP (opcional, configurable en el fork de vLLM).
- Descarga de caché KV por niveles a otros dispositivos mediante el conector `TieringOffloadingSpec` (opcional).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Servicio de chat con contexto largo en producción: con 262.144 tokens de ventana y caché KV FP8, se puede mantener un historial de conversación muy extenso o adjuntar documentación completa sin truncar, siempre sobre el fork de vLLM indicado.
- Asistentes de código con herramientas: el parser `qwen3_coder` y el tool calling automático permiten integrar el modelo en un bucle de agente que invoca funciones, ejecuta tests y consulta repositorios.
- Análisis de documentos con imágenes: la ruta de visión combinada con contexto largo sirve para extraer información de informes, capturas o diagramas junto a texto extenso.
- Razonamiento multi-paso con trazas: el modo de pensamiento y las etiquetas de razonamiento permiten separar la cadena de pensamiento de la respuesta final en pipelines que auditan el proceso.
- Despliegue multi-GPU con paralelismo de expertos: el checkpoint está pensado para servirse con `--tensor-parallel-size 4 --enable-expert-parallel`, adecuado para clústeres de 4 GPU donde se quiera maximizar el número de tokens en caché.
- Investigación sobre cuantización: el contrato INT4 PLE, el manifiesto con digests y los residuos de autocomprobación lo convierten en un caso de estudio reproducible para evaluar el impacto de cuantizar tablas de embeddings de gran tamaño.
- Evaluación comparativa de precisión: con la medición publicada de MMLU-Pro (0,8486 ± 0,0133) sirve como referencia para estudiar la degradación de la cuantización frente al modelo base.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| MMLU-Pro (lm-eval, plantilla de chat, 5-shot, 700 preguntas) | Este checkpoint | 0,8486 ± 0,0133 |
| MMLU-Pro (subconjunto de 300 preguntas, medición publicada omlx 4-bit) | Modelo base | 0,843 |
| MMLU-Pro (subconjunto determinista de 112 preguntas, margen de calibración 1,20, tier limpio) | Caché KV FP8 activa | 0,875 ± 0,031 |
| MMLU-Pro (mismo subconjunto de 112 preguntas) | KV dtype por defecto | 0,8839 |

El autor describe la diferencia con la caché KV FP8 como paridad dentro del ruido estadístico. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: el repositorio ocupa 95 GB en disco; con el cuerpo W4A16 y la caché KV FP8, el despliegue de referencia usa 4 GPU en tensor parallel con expert parallel. No se especifica la VRAM por GPU en la información disponible.
- RAM de host: unos 32 GB libres obligatorios para la tabla PLE INT4 fijada en memoria (26,8 GB) con `VLLM_PLE_CPU_OFFLOAD=1`.
- GPU recomendadas: no disponible de forma explícita; por el esquema de 4 GPU y el tamaño, se sitúa en el rango de A100/H100 o equivalentes con suficiente VRAM agregada.
- GPU de consumo: no cabe en una GPU de consumo individual; el modelo requiere configuración multi-GPU.
- Despliegue: exclusivamente vLLM con el fork `zankich/vllm` o la imagen `zankich/vllm-openai`. vLLM estándar no soporta ni la arquitectura `qwen4_exp` ni el plugin int4 PLE. Parámetros obligatorios: `--quantization compressed-tensors`, `--kv-cache-dtype fp8_e4m3`, `VLLM_QSA_KV_SCALES` apuntando al sidecar de escalas, `--tensor-parallel-size 4 --enable-expert-parallel`.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este checkpoint (INT4PLE, FP8-KV) | 123.958.298.771 | 262.144 | W4A16 + PLE INT4 + KV FP8 | qwen-research | Requiere fork de vLLM; tabla PLE en 26,8 GB de RAM de host |
| halt95/Qwen3.8-Flash-Next-W4A16-Merlin | no disponible | no disponible | W4A16, PLE FP8 | qwen-research (heredada) | Modelo base directo; tabla PLE de 47,7 GB; sin caché KV FP8 calibrada |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | sin cuantizar | qwen-research | Modelo original de referencia |

No se dispone de datos de benchmarks de los modelos comparables distintos de la medición omlx 4-bit citada (0,843 en 300 preguntas), por lo que la comparación de rendimiento queda limitada a esa referencia.

## Limitaciones y advertencias

- Dependencia crítica de un fork no oficial de vLLM: sin el plugin int4 PLE y el soporte `qwen4_exp`, el modelo no carga. Esto ata el despliegue al mantenimiento de `zankich/vllm` y su imagen Docker.
- Licencia `qwen-research`: restringe el uso comercial; es necesario revisar los términos del modelo base antes de cualquier despliegue productivo.
- Consumo de RAM de host no trivial: 32 GB libres solo para la tabla PLE, además de la memoria del resto del sistema.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan mitigaciones específicas en la información disponible.
- Idiomas soportados no documentados: no se puede garantizar calidad fuera de los idiomas del modelo base, que no se detallan.
- La ganancia de calidad de la caché KV FP8 es paridad dentro del ruido (0,875 ± 0,031 frente a 0,8839 en 112 preguntas); no debe presentarse como mejora de precisión.
- El residuo de la cuantización INT4 de la tabla PLE está acotado a medio paso de cuantización, pero no se publican evaluaciones específicas del impacto de esta conversión sobre la calidad final más allá de la medición agregada de MMLU-Pro.
- Sesgos conocidos: no disponible en la información proporcionada.
- Solo 138 descargas y 0 likes en el momento de la consulta: comunidad reducida, menor probabilidad de que los problemas de integración estén resueltos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zankich/Qwen3.8-Flash-Next-W4A16-Merlin-INT4PLE
- Modelo base cuantizado (halt95): https://huggingface.co/halt95/Qwen3.8-Flash-Next-W4A16-Merlin
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Fork de vLLM con soporte int4 PLE y `qwen4_exp`: https://github.com/zankich/vllm
- Imagen Docker de servido: https://hub.docker.com/r/zankich/vllm-openai/tags
