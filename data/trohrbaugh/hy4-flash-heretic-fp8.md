# trohrbaugh/Hy4-flash-heretic-FP8

## Resumen

Hy4-flash-heretic-FP8 es una compilación en FP8 del modelo Hy4-flash-heretic, que a su vez es una versión del modelo Hy4-flash de Tencent a la que se le ha practicado una ablación de rechazos (refusal ablation o "abliteration"). El autor de esta publicación es el usuario de Hugging Face trohrbaugh, no Tencent, y el modelo se distribuye bajo la licencia tencent-hy-license. Se trata de un modelo de arquitectura MoE con aproximadamente 220.260 millones de parámetros totales y una ventana de contexto de hasta 262.144 tokens, con capacidad multimodal de entrada de imagen y texto (pipeline image-text-to-text).

El problema que aborda es doble: por un lado, ofrece un checkpoint en FP8 que reduce el peso de los pesos respecto a la versión BF16 y que, según la model card, puede ejecutarse en dos GPU H200; por otro, elimina el comportamiento de rechazo del modelo base, de modo que responde a peticiones que el modelo oficial declina. La model card documenta de forma explícita y cuantitativa este cambio de comportamiento, con 68 de 100 respuestas que cumplen la petición frente a 0 de 100 en el modelo oficial FP8 sobre el conjunto de prompts dañinos evaluado.

La relevancia de esta ficha es doble: sirve como ejemplo de técnica de abliteration aplicada a un modelo MoE grande y cuantizado, y como advertencia sobre los riesgos de desplegar variantes "uncensored" en producción. El modelo no es una release oficial de Tencent y su model card insiste en que producirá contenido que el modelo base rechaza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (hy_v4_flash), multimodal image-text-to-text, con tablas de lookup Engram |
| Parametros totales | 220.260.270.502 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configuración de lanzamiento documentada) |
| Tipos de cuantizacion | FP8 e4m3 con bloques 128x128; tensores compartidos y de expertos enrutados en BF16 |
| Idiomas soportados | no disponible (MGSM evaluado en 11 idiomas) |
| Licencia | tencent-hy-license (license: other) |
| Formato de pesos | safetensors |
| Tamano del repo | 287,1 GB |
| Libreria | transformers |
| Modelo base | trohrbaugh/Hy4-flash-heretic (a su vez derivado de tencent/Hy4-flash) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos (MoE) con arquitectura identificada como `HYV4FlashForConditionalGeneration` en vLLM, que requiere una compilación específica de Tencent porque las releases estándar de vLLM no incluyen esta arquitectura a fecha 2026-11-22. Incorpora tablas de lookup Engram de aproximadamente 127 GB en BF16 que, por defecto, se mantienen en memoria de host fijada (pinned host memory), lo que condiciona los requisitos de RAM del sistema. La entrada admite imagen y texto (pipeline image-text-to-text), con un límite de una imagen por prompt en la configuración de lanzamiento documentada.

El proceso de construcción de este checkpoint parte del FP8 oficial de Tencent (revisión `003107fa`) y sustituye únicamente los tensores afectados por la edición de abliteration: 2.097 tensores permanecen idénticos byte a byte al FP8 oficial, 68 tensores editados que Tencent mantiene en BF16 (proyecciones de expertos compartidos y enrutados) se copian del build BF16 Heretic, y 34 proyecciones de salida de atención (`self_attn.o_proj`) se recuantizan a FP8 e4m3 con bloques 128x128 usando redondeo al más cercano con escala = máximo del bloque / 448, ya que la receta calibrada de Tencent no es reproducible desde los ficheros publicados. Según la model card, la edición sobrevive a la cuantización: en 32 de 34 capas la proporción de dirección de rechazo restante coincide con el build BF16 con una tolerancia de 0,005, y en las capas 17 y 18 los valores son 0,027 frente a 0,013 y 0,048 frente a 0,039 respectivamente. El repositorio incluye un `BUILD_MANIFEST.json` con cada tensor editado, estadísticas de error de recuantización y SHA-256 de cada shard. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición del dataset del modelo base en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo de hasta 262.144 tokens.
- Razonamiento con modo "thinking" configurable mediante `reasoning_effort` (`no_think`, `high`), con parser de razonamiento `hy_v4` en vLLM.
- Entrada multimodal de imagen y texto (una imagen por prompt en la configuración documentada; vídeo deshabilitado).
- Soporte de tool calling y function calling, con `--enable-auto-tool-choice` y parser `hy_v4`.
- Capacidades multilingües: la model card reporta evaluación MGSM en 11 idiomas con una puntuación de 0,950.
- Decodificación especulativa compatible: el drafter DFly sigue funcionando con una tasa de aceptación de 0,27-0,29.
- Comportamiento sin rechazos (abliterated): responde a peticiones que el modelo base declina, incluyendo cumplimiento directo, sustituciones saneadas y respuestas parciales.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar de forma controlada el efecto de la abliteration sobre el comportamiento de rechazo, comparando los conteos documentados (100/100 rechazos en el oficial frente a 2/100 en este build) con las mismas prompts y ajustes.
- Evaluación de robustez de filtros de contenido: sirve para probar clasificadores de seguridad y medir su tasa de falsos negativos, dado que aproximadamente una cuarta parte de las respuestas a prompts dañinos son sustituciones saneadas sin frase de rechazo, lo que engaña a contadores simples de rechazo.
- Despliegue de chat multimodal con contexto largo: con 262.144 tokens de ventana y soporte de imagen, puede gestionar conversaciones con documentos extensos o capturas, siempre que el caso de uso no requiera moderación estricta.
- Automatización de tareas con agentes: el soporte de tool calling y el parser `hy_v4` permiten integrarlo en pipelines de agentes multi-paso; la model card reporta 60/120 tareas en AutomationBench frente a 63/120 del oficial.
- Procesamiento de documentación técnica multilingüe: los resultados de MGSM en 11 idiomas (0,950) respaldan su uso en tareas de razonamiento matemático y textual en varios idiomas.
- Servicio de inferencia de alto rendimiento en clúster: con dos H200 en TP2 alcanza 346 tok/s agregados con 8 peticiones concurrentes, adecuado para entornos con hardware de datacenter y RAM de host superior a 256 GB.
- Estudio de cuantización FP8: el manifiesto de construcción y las estadísticas de error de recuantización permiten analizar el impacto de la cuantización en modelos MoE grandes.

## Benchmarks y rendimiento

Resultados reportados en la model card, comparando este build con el FP8 oficial de Tencent. Las pruebas de capacidad usan muestreo 0,9/1,0 y `reasoning_effort = "high"`; los intervalos son bootstrap pareado al 95 %.

| Test | FP8 oficial | Este build | Diferencia |
|---|---|---|---|
| MGSM (660 items, 11 idiomas) | 0,952 | 0,950 | −0,002 [−0,011, +0,008] |
| SimpleQA (1.000 items) | 0,256 | 0,274 | +0,018 [−0,007, +0,043] |
| AutomationBench (muestra de 120 tareas) | 63/120 | 60/120 | −2,5 puntos [−10,8, +5,0] |

Comportamiento de rechazo sobre 100 prompts dañinos (`mlabonne/harmful_behaviors`, test, primeros 100), `no_think`, decodificación greedy, presupuesto de 1.536 tokens, etiquetado manual por un único codificador no ciego:

| Categoría | FP8 oficial | Este build |
|---|---|---|
| Rechazado | 100/100 | 2/100 |
| Sustituto saneado sin rechazo | 0 | 24/100 |
| Parcial | 0 | 6/100 |
| Cumplido | 0 | 68/100 |

En 100 prompts benignos, ninguno de los dos modelos rechazó tras corrección manual. El modo thinking no se midió para rechazos.

Rendimiento en 2× H200, decodificación greedy, 512 tokens de salida, `no_think`:

| Peticiones concurrentes | Tok/s totales | Tok/s por petición |
|---|---|---|
| 1 | 70 | 75 |
| 4 | 198 | 62 |
| 8 | 346 | 49 |

Tiempo hasta el primer token: 4,3 s para un prompt de 33K tokens y 26 s para uno de 134K tokens.

## Requisitos de hardware

- VRAM: en 4× H200 con TP4, 43,7 GiB por GPU para pesos; en 2× H200 con TP2, 80,7 GiB por GPU. La KV cache a 262K de contexto requiere 4,9M tokens (unas 18 peticiones completas) con TP4 y 2,8M tokens (unas 10 peticiones completas) con TP2.
- RAM de host: al menos 256 GB recomendados, ya que las tablas Engram (unos 127 GB en BF16) se mantienen por defecto en memoria de host fijada; la model card indica unos 206 GB con TP4 y unos 200 GB con TP2.
- GPU: probado únicamente en NVIDIA H200 (141 GB). No se documenta compatibilidad con A100, H100 ni GPU de consumo; por el tamaño del modelo y el requisito de RAM, no cabe en GPU consumer.
- Software: requiere la imagen `vllm/vllm-openai:hy4-flash` (probada la versión `0.1.dev25463+g77766db1f`), ya que las releases estándar de vLLM no incluyen la arquitectura `HYV4FlashForConditionalGeneration`.
- Plantilla de chat: debe usarse el `chat_template.jinja` incluido en el repositorio (sha256 `11b12531…`).
- Opciones de despliegue: vLLM con `--tensor-parallel-size 2` o `4`, `--engram-config '{"cpu_offload": true}'` y decodificación especulativa DFly con 5 tokens especulativos.
- Latencia y throughput: ver la tabla de rendimiento; dos GPU ofrecen aproximadamente el 94 % de la velocidad de cuatro en un solo usuario.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Comportamiento de rechazo | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-heretic-FP8 (este) | 220,3B totales | 262.144 | tencent-hy-license | 2/100 rechazos en el test documentado | Hugging Face, 0 descargas |
| tencent/Hy4-flash-FP8 (oficial) | 220,3B totales | 262.144 | tencent-hy-license | 100/100 rechazos en el mismo test | Hugging Face, oficial |
| trohrbaugh/Hy4-flash-heretic (BF16) | 220,3B totales | no disponible | tencent-hy-license | 12/100 bloqueados según juez LLM (no comparable) | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para producir contenido que el modelo base rechaza; la model card lo advierte explícitamente. No es apto para despliegues públicos sin moderación adicional.
- Aproximadamente el 24 % de las respuestas a prompts dañinos son sustituciones saneadas o legales que no contienen frase de rechazo pero tampoco cumplen la petición; los contadores de rechazo y los jueces automáticos sobrestimarán el cumplimiento.
- El etiquetado de rechazos lo realizó un único codificador no ciego, sin cegamiento, lo que introduce sesgo potencial.
- El modo thinking no se evaluó para comportamiento de rechazo; los resultados solo son válidos con `no_think`.
- Los números de la model card BF16 (12/100 bloqueados) provienen de un instrumento distinto (juez LLM) y un presupuesto distinto, por lo que no son directamente comparables con los de este build.
- No es una release oficial de Tencent; la licencia tencent-hy-license condiciona el uso comercial y debe revisarse antes de cualquier despliegue productivo.
- La receta de cuantización calibrada de Tencent no es reproducible desde los ficheros publicados; las 34 proyecciones de atención recuantizadas usan redondeo al más cercano, lo que puede introducir errores no caracterizados fuera de las estadísticas del manifiesto.
- Requiere hardware de datacenter (H200) y más de 256 GB de RAM de host; no es viable en GPU de consumo.
- Solo se probó en H200; el comportamiento en otras GPU no está documentado.
- Riesgo de alucinación inherente al modelo base; no se han publicado métricas específicas de fidelidad factual más allá de SimpleQA (0,274).
- Idiomas soportados no documentados formalmente; la única evidencia es la evaluación MGSM en 11 idiomas.
- Con `--privileged`, el filtro `--gpus '"device=…"'` se ignora y vLLM toma las primeras GPU disponibles, lo que puede provocar un reparto no deseado en servidores multi-GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trohrbaugh/Hy4-flash-heretic-FP8
- Modelo base BF16: https://huggingface.co/trohrbaugh/Hy4-flash-heretic
- Modelo original de Tencent: https://huggingface.co/tencent/Hy4-flash
- FP8 oficial de Tencent: https://huggingface.co/tencent/Hy4-flash-FP8
- Licencia: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
