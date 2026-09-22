# stihahi/GLM-5.3-Flash-NVFP4-mtp-nvfp4-delta

## Resumen

`stihahi/GLM-5.3-Flash-NVFP4-mtp-nvfp4-delta` es un artefacto derivado de tipo delta (overlay) publicado por el usuario stihahi. No es un checkpoint completo: contiene únicamente los ficheros que difieren de la revisión `09b04e5e74bca08ca8549fc736d4cdd8624bfde3` del modelo `nvidia/GLM-5.3-Flash-NVFP4`. En concreto, sustituye los expertos enrutados de la capa 45 (la capa de predicción multitoken, MTP) re-cuantizándolos de BF16 a NVFP4 con ModelOpt, añade el mapa de pesos para los nuevos tensores de escala y ajusta la lista de ignorados de cuantización para que vLLM resuelva correctamente los módulos no experto de esa capa.

El problema que resuelve es de despliegue, no de calidad de modelo. El checkpoint oficial NVFP4 envía los expertos MTP en BF16 (864 tensores, 13,5 GiB) y no incluye la capa 45 en su lista de ignorados de cuantización, lo que provoca que vLLM construya parámetros con forma FP4 y falle al cargar (`_load_w2` con discrepancia de forma). Corregir solo la lista de ignorados permite cargar, pero en un nodo con 2× DGX Spark (GB10, TP2) los expertos en BF16 elevan los pesos a 95,93 GiB por rango y el host agota memoria durante el perfilado. Con los expertos en NVFP4 los pesos bajan a 91,08 GiB por rango, lo que deja espacio para un pool de KV de 6 GiB (673k tokens) y permite decodificación especulativa con `num_speculative_tokens=2`.

Es relevante ahora porque documenta una ruta reproducible para servir un modelo MoE de gran tamaño cuantizado en FP4 sobre hardware compacto (DGX Spark, GB10) con vLLM, incluyendo cifras medidas de rendimiento (hasta 61,6 tok/s agregados con 4 peticiones concurrentes) y de aceptación del borrador especulativo (61-69%). El repositorio de pesos ocupa 16,4 GB y se distribuye bajo licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `glm5_next`) con capa de predicción multitoken (MTP) en la capa 45 |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el pool de KV documentado admite 673k tokens en el despliegue de referencia) |
| Tipos de cuantización | NVFP4 (ModelOpt) con escalas de bloque FP8 E4M3, grupo 16; camino W4A16 Marlin |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (cuantizados en NVFP4) |
| Autor | stihahi |
| Modelo base | nvidia/GLM-5.3-Flash-NVFP4 (revisión `09b04e5e74bca08ca8549fc736d4cdd8624bfde3`) |
| Modelo base original | zai-org/GLM-5.3-Flash |
| Tipo de artefacto | Delta/overlay, no es un checkpoint autónomo |
| Contenido del delta | Shards 1-3 de 33, `model.safetensors.index.json`, `config.json`, `hf_quant_config.json` |
| Tamaño del repositorio | 16,4 GB |
| Pipeline | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 22 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de tipo mezcla de expertos (MoE) identificado con el tag de arquitectura `glm5_next`, con al menos 46 capas: la capa 45 aloja el cabezal de predicción multitoken (MTP) y contiene 288 expertos enrutados, cada uno con pesos de gate, up y down (864 tensores en total, originalmente 13,5 GiB en BF16). El delta no modifica el grafo del modelo ni los pesos del resto de capas: los shards 4 a 33, junto con el tokenizador y las plantillas, son idénticos byte a byte a los del checkpoint de NVIDIA y no se vuelven a subir.

La innovación técnica del artefacto está en el método de cuantización de los expertos MTP. Para cada experto, gate y up comparten una única escala global, ya que vLLM exige que `w13` tenga un solo `weight_scale_2`; el peso down tiene su propia escala. Las escalas de bloque (FP8 E4M3, grupo 16) se calculan con `scaled_fp4_quant` de vLLM, y el `input_scale` se copia del mismo índice de experto en la capa 44 (el camino W4A16 Marlin empleado ignora ese tensor). El error relativo de de-cuantización de los expertos re-cuantizados es de aproximadamente el 9,5%. El script de cuantización (`tools/quant_mtp_experts.py`) y el parche necesario para vLLM están en el repositorio de GitHub del autor.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF, DPO u otra fase de alineamiento. No se documentan innovaciones adicionales de atención ni mecanismos distintos del MTP.

## Capacidades

- Generación de texto autoregresiva servida mediante vLLM, con soporte del modo de razonamiento activado (las mediciones de rendimiento se tomaron con *reasoning on*).
- Decodificación especulativa nativa: la capa MTP actúa como *drafter* dentro de vLLM con `num_speculative_tokens=2`, con una tasa de aceptación del borrador medida entre el 61% y el 69%.
- Inferencia cuantizada en NVFP4 (4 bits para pesos, activaciones de 16 bits en el camino W4A16 Marlin) con soporte de escalas de bloque FP8 por grupos de 16.
- Despliegue con paralelismo de tensor (TP2 documentado) sobre interconnect RoCE entre dos nodos.
- Servicio con batching concurrente: se reportan mediciones con 1, 2 y 4 peticiones simultáneas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible en la información proporcionada.
- Comportamiento multilingüe: no disponible en la información proporcionada; no se documentan los idiomas soportados.
- Capacidades de agente y razonamiento multi-paso más allá del modo de razonamiento mencionado: no disponible en la información proporcionada.

## Casos de uso

- **Servicio de razonamiento en hardware compacto on-premise**: el artefacto permite levantar el modelo NVFP4 en 2× DGX Spark (GB10) con TP2 sobre RoCE, ajustando los pesos a 91,08 GiB por rango y liberando 6 GiB para el pool de KV (673k tokens). Es adecuado cuando no se dispone de un clúster de GPUs de datacenter y se acepta un throughput moderado.
- **Investigación en cuantización FP4 de capas MTP**: el repositorio documenta el método completo (escalas compartidas para `w13`, escalas FP8 E4M3 por bloques de 16, copia de `input_scale` desde la capa 44) y publica el script asociado, lo que permite reproducir y medir el error relativo de de-cuantización (~9,5%) en condiciones controladas.
- **Evaluación de decodificación especulativa**: con una tasa de aceptación de borrador del 61-69% medida sobre 768 tokens de salida, sirve como banco de pruebas para comparar configuraciones de `num_speculative_tokens` y medir su efecto sobre el throughput agregado.
- **Generación de texto por lotes con concurrencia moderada**: el despliegue medido alcanza 42,7 tok/s agregados con 2 peticiones y 61,6 tok/s con 4, un perfil adecuado para procesamiento por lotes no interactivo (resúmenes, extracción de información) donde el coste por token importa más que la latencia individual.
- **Réplica de desarrollo de un modelo MoE grande con licencia permisiva**: al distribuirse bajo MIT, el delta puede integrarse en flujos internos de investigación y prototipado sin las restricciones de licencias de otros pesos de gran tamaño.
- **Integración en pipelines de CI para validar cuantizaciones**: el procedimiento de ensamblado por *hardlinks* permite reconstruir el checkpoint completo en un directorio sin duplicar los 16,4 GB del delta, lo que facilita pruebas automatizadas de carga y perfilado en vLLM antes de promover una cuantización a producción.
- **Punto de partida para derivados experimentales**: al aislar la capa MTP en tres shards, es un artefacto cómodo para experimentar con re-cuantizaciones alternativas o cabezales MTP modificados sin tocar las 45 capas restantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni similares) en la información disponible. Las únicas métricas publicadas son de rendimiento de inferencia y de fidelidad de la cuantización, medidas en 2× DGX Spark, vLLM TP2 sobre RoCE, 768 tokens de salida y razonamiento activado:

| Peticiones concurrentes | tok/s por petición | tok/s agregados |
|---|---|---|
| 1 | 27,4 | 27,4 |
| 2 | ~21,5 | 42,7 |
| 4 | ~16 | 61,6 |

| Métrica de cuantización | Valor |
|---|---|
| Aceptación del borrador especulativo | 61-69% |
| Error relativo de de-cuantización de los expertos MTP | ~9,5% |
| Número de tokens especulativos | 2 |
| Tensores de experto re-cuantizados | 864 (288 expertos × gate/up/down) |

## Requisitos de hardware

- **Despliegue de referencia**: 2× NVIDIA DGX Spark (GB10) con paralelismo de tensor TP2 sobre RoCE. No se documenta ningún otro perfil de hardware validado.
- **Pesos por rango**: 91,08 GiB con los expertos MTP en NVFP4. Con los expertos en BF16 (el estado del checkpoint oficial) ascienden a 95,93 GiB por rango y el host agota memoria durante el perfilado.
- **Memoria para caché KV**: 6 GiB disponibles en el despliegue de referencia, equivalentes a 673k tokens de capacidad de caché.
- **GPU de consumo**: los 91,08 GiB por rango exceden ampliamente los 24 GB de una RTX 4090 o tarjetas equivalentes, por lo que el modelo no cabe en GPU de consumo.
- **GPU de datacenter**: una única A100 de 80 GB tampoco es suficiente para el footprint por rango documentado; haría falta un grado de paralelismo superior o más nodos. No se publican configuraciones validadas con A100, H100 u otras.
- **Cuantización**: NVFP4 obligatoria para encajar en el hardware de referencia; el artefacto no incluye variantes GGUF ni cuantizaciones de menor precisión.
- **Software**: vLLM con un parche específico (`vLLM #57532`), más el script de lanzamiento publicado por el autor. El modelo no funciona en llama.cpp, Ollama ni TGI según la información disponible.
- **Throughput y latencia**: 27,4 tok/s con una sola petición (máximo por petición medido) y hasta 61,6 tok/s agregados con 4 peticiones concurrentes. No se publican datos de latencia de primer token ni de *time to first token*.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros modelos en la información proporcionada, por lo que la comparativa se limita a las tres variantes del mismo modelo:

| Modelo | Formato de los expertos MTP | Peso por rango (TP2) | Estado de carga en vLLM | Licencia |
|---|---|---|---|---|
| stihahi/GLM-5.3-Flash-NVFP4-mtp-nvfp4-delta (este) | NVFP4 | 91,08 GiB | Carga correctamente con el parche; pool KV de 6 GiB (673k tokens) | MIT |
| nvidia/GLM-5.3-Flash-NVFP4 | BF16 | 95,93 GiB | Falla por discrepancia de forma en `_load_w2`; al corregir la lista de ignorados, agota memoria en 2× DGX Spark | MIT (según el autor del delta) |
| zai-org/GLM-5.3-Flash | no disponible | no disponible | no disponible | MIT (según el autor del delta) |

Cualquier comparación con modelos de otros fabricantes de tamaño o categoría similares no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **No es un checkpoint autónomo**: requiere descargar la revisión exacta `09b04e5e74bca08ca8549fc736d4cdd8624bfde3` de `nvidia/GLM-5.3-Flash-NVFP4` y superponer los ficheros del delta siguiendo el procedimiento de *hardlinks*. Usar otra revisión del modelo base puede producir un checkpoint inconsistente.
- **Sin evaluación de calidad**: no hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba de capacidad. Solo se publican métricas de throughput, aceptación de borrador y error de cuantización. El riesgo de alucinación no ha sido evaluado.
- **Pérdida de precisión conocida**: el re-cuantizado de los 864 tensores de experto MTP introduce un error relativo de de-cuantización de aproximadamente el 9,5%, que puede degradar la tasa de aceptación del borrador especulativo según la tarea.
- **Idiomas no documentados**: no se especifica qué lenguas soporta el modelo ni su cobertura multilingüe.
- **Dependencia de un parche de vLLM**: el despliegue requiere una corrección no integrada en la rama principal (issue #57532), lo que supone riesgo de rotura ante actualizaciones de vLLM y coste de mantenimiento.
- **Licencia MIT, pero derivado no oficial**: el artefacto no está afiliado a Z.ai ni a NVIDIA. El autor afirma que la licencia MIT es la misma que la de los modelos base, pero conviene verificar la licencia declarada en los repositorios originales antes de un uso comercial.
- **Superficie de hardware muy restringida**: solo se ha validado en 2× DGX Spark (GB10) con TP2 sobre RoCE. No hay datos para A100, H100, L40S ni configuraciones multi-nodo distintas.
- **Throughput bajo en términos absolutos**: 27,4 tok/s por petición con una sola petición concurrente limita su uso en aplicaciones interactivas con requisitos de latencia estrictos.
- **Sin validación comunitaria**: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (22 de septiembre de 2026), lo que implica ausencia de verificación independiente de los resultados publicados.
- **Resultados de búsqueda web no relevantes**: la búsqueda asociada devolvió únicamente páginas de webcams del festival de Bregenz, sin ningún material técnico adicional sobre el modelo.

## Enlaces

- Repositorio HuggingFace del delta: https://huggingface.co/stihahi/GLM-5.3-Flash-NVFP4-mtp-nvfp4-delta
- Modelo base NVFP4: https://huggingface.co/nvidia/GLM-5.3-Flash-NVFP4
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio GitHub del autor (script de lanzamiento, parche de vLLM, script de cuantización y benchmarks): https://github.com/stihahi/glm53-flash-nvfp4-mtp-2x-dgx-spark
- Referencia del parche de vLLM: issue #57532 (sin URL incluida en la información disponible)
- Búsqueda web: sin resultados técnicos relevantes (solo páginas de webcams del festival de Bregenz)
