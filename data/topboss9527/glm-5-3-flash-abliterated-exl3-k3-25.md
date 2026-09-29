# topboss9527/GLM-5.3-Flash-abliterated-EXL3-K3.25

## Resumen

GLM-5.3-Flash-abliterated-EXL3-K3.25 es una variante sin censura (abliterated) del checkpoint cuantizado a 3 bits wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3.25-v1, publicado por el usuario topboss9527. El modelo subyacente es GLM-5.3-Flash de Z.ai, un MoE nativamente multimodal de 320 000 millones de parámetros totales con 18 000 millones activos por token, que combina atención dispersa y atención lineal y está diseñado para contexto de hasta 1 000 000 de tokens con un coste de atención y de caché KV reducido frente a GLM-5.3.

La intervención del autor es quirúrgica: no hay reentrenamiento ni fine-tuning, sino un transplante de 29 tensores BF16 correspondientes a `self_attn.o_proj` de las capas 15 a 43, procedentes de dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4. El resto del checkpoint (expertos enrutados EXL3 K3/K4, routers, normas, embeddings, `lm_head`, torre de visión y capa MTP 45) permanece byte a byte idéntico a la base EXL3, lo que preserva el comportamiento del modelo original salvo por la eliminación del rechazo de peticiones dañinas.

Su relevancia práctica es doble: por un lado ofrece un modelo de 3 bits con ventana de 1M tokens que cabe en 2× RTX PRO 6000 Blackwell (96 GB cada una), algo que las builds NVFP4 sin censura de 198 GB no consiguen; por otro, sirve como material de estudio para investigación en alineación y seguridad, ya que elimina los rechazos explícitos sin degradar el rendimiento en prompts inocuos según las mediciones del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con atención dispersa y lineal (familia GLM-5.3), multimodal nativo, con capa de predicción multi-token (MTP) |
| Parámetros totales | 320 000 millones en la arquitectura GLM-5.3-Flash según la documentación de Z.ai; los safetensors de este repositorio declaran 73 089 112 926 elementos, recuento afectado por el empaquetado EXL3 de 3 bits |
| Parámetros activos | 18 000 millones (MoE) |
| Longitud de contexto | 1 000 000 tokens (receta de contexto completo de 1M citada en la model card) |
| Tipos de cuantización | EXL3 de 3 bits, configuración K3.25 (expertos enrutados en K3/K4); etiqueta `3-bit` |
| Idiomas soportados | No disponible (la model card no especifica lista de idiomas) |
| Licencia | MIT, heredada de zai-org/GLM-5.3-Flash |
| Formato de pesos | safetensors (18 shards, 13 de ellos reescritos por el transplante) |
| Tipo de modelo | image-text-to-text (visión-lenguaje) |
| Modelo base | wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3.25-v1 (relación: finetune) |
| Origen de la abliteración | dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4 |
| Tamaño del repositorio | 146,3 GB |
| Librería | transformers |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 29 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura de partida es un MoE transformer de 320B parámetros totales y 18B activos que, según Z.ai, es el primer modelo frontera de código abierto que combina atención dispersa y lineal: esta combinación reduce el cómputo de atención en un factor de 3,01× y la caché KV en 4,44× respecto a GLM-5.3, manteniendo calidad en contexto largo. El modelo es nativamente multimodal (torre de visión integrada, pipeline `image-text-to-text`) e incorpora una capa MTP (multi-token prediction) en la posición 45, que en este checkpoint no fue transplantada porque su disposición de 16 384 anchos difiere de la fuente Dealign. La ventana de contexto de trabajo es de 1M tokens.

No hay entrenamiento nuevo en este release. El autor copió 29 tensores `model.layers.{15..43}.self_attn.o_proj.weight` en BF16 (precisión nativa tanto en origen como en destino, por lo que la copia es exacta) desde el checkpoint abliterated de Dealign al checkpoint EXL3. Antes de escribir, verificó que las capas 0–14 y 44 de `o_proj` son byte a byte idénticas entre las versiones base EXL3, RedHat y Dealign (capas ancla), confirmando que la abliteración se concentra en las capas 15–43; después, los 46 tensores `o_proj` se validaron por hash sin discrepancias. Los ficheros `quantization/`, `quant_log.csv` y `quantization_config.json` se heredan de la release EXL3 base y describen su cuantización, no esta edición.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `image-text-to-text` y etiqueta `conversational`.
- Comprensión de imágenes: la torre de visión se conserva sin modificar respecto a la base EXL3.
- Contexto largo: receta completa de 1M tokens, con reducción de KV cache respecto a GLM-5.3 (4,44× según Z.ai).
- Tool calling y function calling: las builds GLM-5.3-Flash con el stack de servicio adecuado exponen chat/completions y herramientas compatibles con la API de OpenAI; la model card no documenta pruebas específicas para este checkpoint.
- Modo razonamiento: la variante uncensored de Dealign declara soporte de `reasoning`; en este checkpoint el comportamiento depende del stack de servicio.
- Decodificación especulativa: la model card reporta el uso de un draft DFlash2 cuya tasa de aceptación se mantiene (≈0,63 en concurrencia 1).
- Predicción multi-token: la capa MTP 45 se mantiene intacta (no abliterada).
- Eliminación de rechazos: 0/12 rechazos explícitos ante 12 prompts dañinos, frente a 12/12 de la base, sin sobre-rechazo en los 12 prompts inocuos (12/12 respondidos en ambos modelos).
- Idiomas: no disponible; la model card no documenta cobertura lingüística.

## Casos de uso

- Servicio conversacional autoalojado de contexto largo: con 1M tokens de ventana y pesos EXL3 de 3 bits, permite mantener hilos de conversación o bases documentales extensas en memoria sobre 2× RTX PRO 6000 Blackwell de 96 GB, sin recurrir a builds NVFP4 de 198 GB.
- Investigación en seguridad y alineación: al eliminar los rechazos mediante un transplante localizado en `o_proj` de las capas 15–43, sirve como sujeto de comparación controlada frente a la base EXL3 para estudiar dónde reside el comportamiento de rechazo en modelos MoE multimodales.
- Red teaming y evaluación de salvaguardas: equipos que necesitan generar respuestas sin filtro previo para auditar sus propios clasificadores de contenido pueden usarlo como generador adversario dentro de un entorno aislado.
- Análisis de documentos técnicos con imágenes: la combinación de torre de visión intacta y contexto de 1M tokens permite procesar manuales, planos o informes con figuras en una sola pasada.
- Agentes multi-paso con herramientas: el pipeline soporta `tools` en formato compatible con OpenAI cuando se sirve con el stack GLM-5.3-Flash; es adecuado para orquestación de tareas con llamadas a APIs externas.
- Evaluación comparativa de cuantización: dado que solo 29 tensores difieren de la base EXL3, permite medir el impacto de la abliteración en latencia y precisión sin confundirlo con cambios de cuantización.
- Despliegue en clústeres pequeños: la receta de 2× DGX Spark con EXL3 permite ejecutar el modelo en hardware de gama de escritorio profesional para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente aporta mediciones de rechazo y de velocidad frente a la base EXL3, con el mismo stack de servicio y la misma sesión.

Rechazos con temperatura 0, `max_tokens` 1024, 12 prompts dañinos y 12 inocuos:

| Modelo | Dañinos: rechazo explícito | Dañinos: respondidos | Dañinos: sin respuesta en 1024 | Inocuos: respondidos |
|---|---|---|---|---|
| Base EXL3 K3.25 | 12/12 | 0/12 | 0/12 | 12/12 |
| Este modelo | 0/12 | 9/12 | 3/12 | 12/12 |

Velocidad, mediana de 3 ejecuciones, 256 tokens:

| Métrica | Modelo | Corto | 1k | 16k | 32k |
|---|---|---|---|---|---|
| decode tok/s | base | 291,6 | 249,2 | 214,0 | 239,4 |
| decode tok/s | este | 268,7 | 238,3 | 229,6 | 229,1 |
| prefill tok/s | base | 613 | 4 354 | 4 976 | 5 028 |
| prefill tok/s | este | 623 | 4 417 | 4 932 | 5 000 |

Concurrencia y tasa de aceptación del draft DFlash2:

| Concurrencia | base tok/s | este tok/s | aceptación base | aceptación este |
|---|---|---|---|---|
| c1 | 209,2 | 182,0 | 0,634 | 0,634 |
| c4 | 407,5 | 447,1 | 0,725 | 0,689 |
| c8 | 417,0 | 396,7 | 0,566 | 0,543 |
| c12 | 537,2 | 508,3 | 0,637 | 0,584 |
| c16 | 558,8 | 589,1 | 0,596 | 0,594 |

El autor indica que las diferencias están dentro del ruido entre ejecuciones y que el draft DFlash2, entrenado sobre los pesos originales, conserva su tasa de aceptación.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 146,3 GB, de modo que la inferencia requiere al menos ~150 GB de memoria agregada para pesos, más caché KV y buffers de activación.
- Configuración validada por el autor: 2× RTX PRO 6000 Blackwell de 96 GB (192 GB agregados), que permite además la receta de contexto completo de 1M tokens.
- Las builds NVFP4 sin censura de dealignai ocupan 198 GB y no caben en 2× 96 GB; ese es precisamente el hueco que cubre esta versión EXL3.
- Alternativas de despliegue documentadas: receta de dos GPU de tpurtell (`tpurtell/glm-5.3-flash-ext3-4-bit-2x-rtx`) y recetas de 2× y 3× DGX Spark con tensor parallelism del repositorio MiaAI-Lab.
- Motor de inferencia: EXL3/ExLlamaV3. La model card no afirma que vLLM estándar funcione con este checkpoint; se requiere una build de vLLM con soporte de GLM-5.3-Flash multimodal y MTP habilitados.
- Latencia y throughput medidos con el stack del autor: 268,7 tok/s de decode en prompt corto y 229,1 tok/s a 32k; prefill de 623 tok/s en corto y 5 000 tok/s a 32k; hasta 589,1 tok/s agregados con 16 peticiones concurrentes.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU de 80 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Abliterado | Licencia | Ajuste en 2× 96 GB |
|---|---|---|---|---|---|---|
| Este modelo (topboss9527) | 320B totales / 18B activos | 1M | EXL3 3 bits K3.25 | Sí (29 tensores `o_proj`, capas 15–43) | MIT | Sí |
| wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3.25-v1 | 320B / 18B | 1M | EXL3 3 bits | No (12/12 rechazos) | MIT | Sí |
| dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4 | 320B / 18B | No disponible en la información | NVFP4 (198 GB) | Sí | No disponible | No |
| drowzeys/keys-GLM-5.3-Flash-NVFP4-ablit-l15-43-mtp-l45 | 320B / 18B | 1M | NVFP4 | Sí, mismo enfoque sobre `o_proj` 15–43 más MTP l45 | No disponible | No |
| zai-org/GLM-5.3-Flash (original) | 320B / 18B | 1M | BF16 | No | MIT | No |

Los datos de benchmarks comparativos entre estas variantes no están disponibles en la información consultada; la única comparación cuantitativa publicada es la de rechazos y velocidad entre este modelo y su base EXL3.

## Limitaciones y advertencias

- Sesgos: no hay evaluación de sesgos publicada para este checkpoint ni para su base cuantizada.
- Alucinación: no se han publicado mediciones de veracidad; el transplante de tensores no altera los expertos ni el `lm_head`, pero tampoco se documenta ningún control de factualidad.
- Seguridad: la abliteración elimina el comportamiento de rechazo. La propia model card advierte de que el modelo cumplirá peticiones dañinas y lo etiqueta como `not-for-all-audiences`. Su uso exige salvaguardas externas y responsabilidad legal por parte del operador.
- Cobertura exacta de la abliteración: solo se transplantaron 29 tensores de `o_proj` en las capas 15–43; la capa MTP 45 conserva el comportamiento original, lo que puede producir inconsistencias entre la salida de la capa principal y la predicción multi-token.
- Ficheros de cuantización engañosos: `quantization/`, `quant_log.csv` y `quantization_config.json` describen la cuantización de la release EXL3 base, no esta edición; no deben usarse como registro de lo que se modificó.
- Licencia: MIT heredada de Z.ai, lo que en principio permite uso comercial, pero la licencia no exime de responsabilidad por el contenido generado ni de las condiciones de uso de los artefactos de terceros que intervienen en el transplante.
- Compatibilidad de despliegue: no hay garantía de funcionamiento con vLLM estándar; se depende de recetas y builds concretas (tpurtell, MiaAI-Lab), lo que añade riesgo de mantenimiento en producción.
- Adopción nula: 0 descargas y 0 likes en el momento del registro, sin validación independiente de las mediciones del autor.
- Idiomas y contexto efectivo: no se documenta cobertura idiomática ni calidad real a 1M tokens más allá de la receta de servicio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/topboss9527/GLM-5.3-Flash-abliterated-EXL3-K3.25
- Modelo base EXL3 K3.25: https://huggingface.co/wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3.25-v1
- Variante EXL3 K3: https://huggingface.co/wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3-v1
- Fuente de los tensores abliterated: https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4
- Variante abliterada NVFP4 de Dealign: https://huggingface.co/dealignai/GLM-5.3-Flash-ABLITERATED-NVFP4
- Enfoque de transplante alternativo: https://huggingface.co/drowzeys/keys-GLM-5.3-Flash-NVFP4-ablit-l15-43-mtp-l45
- Modelo original de Z.ai: https://huggingface.co/zai-org/GLM-5.3-Flash
- Receta de servicio para 2 GPU: https://github.com/tpurtell/glm-5.3-flash-ext3-4-bit-2x-rtx
- Recetas EXL3 para 2× y 3× DGX Spark: https://github.com/MiaAI-Lab/GLM-5.3-Flash-EXL3-2x-DGX-Sparks/
- Documentación oficial de GLM-5.3-Flash: https://docs.z.ai/guides/vlm/glm-5.3-flash
- Ficha de la familia GLM-5.3: https://openlm.ai/glm-5.3/
