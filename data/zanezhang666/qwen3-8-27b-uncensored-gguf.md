# zanezhang666/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una cuantización en formato GGUF del modelo Qwen3.8-27B de Qwen, publicada por el usuario zanezhang666. El trabajo principal consiste en eliminar las direcciones de rechazo del modelo base mediante la herramienta Heretic, que minimiza conjuntamente el recuento de rechazos y la divergencia KL respecto al modelo original, sin fine-tuning ni datos adicionales. El resultado es un modelo con comportamiento de rechazo sustancialmente reducido, aunque no eliminado por completo, manteniendo intactas las capacidades, los datos de entrenamiento y la arquitectura del original.

El modelo conserva la arquitectura `Qwen3_5ForConditionalGeneration` con 64 capas, un vocabulario de 248.320 tokens, capacidad de visión y una ventana de contexto de 262.144 tokens. Incorpora además una cabeza de predicción multi-token (MTP) que permite decodificación especulativa, verificada y conservada en las cuantizaciones publicadas. El repositorio ofrece seis niveles de cuantización (IQ2_M a Q8_0) en dos variantes, con y sin MTP fusionado, más un proyector de visión en F16 y una matriz de importancia publicada.

La relevancia de esta ficha radica en que documenta con mediciones de perplejidad la degradación introducida por cada cuantización frente a la línea base en f16, y en que expone de forma transparente las limitaciones del proceso de abliteración. Con 27.320.697.856 parámetros totales y licencia Apache 2.0, es un candidato para despliegue local en hardware de consumo alto o en servidores con GPU única, siempre que el caso de uso tolere la ausencia de filtros de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer, 64 capas) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (y variantes noMTP equivalentes) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de visión en GGUF F16; matriz de importancia en `.dat` |
| Vocabulario | 248.320 tokens |
| Capas MTP | 1 |
| Visión | sí (proyector mmproj F16) |
| Herramienta de conversión | llama.cpp `a94d563ed` |
| Matriz de importancia | wikitext-2 raw, 200 chunks, publicada |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27.320.697.856 parámetros organizado en 64 capas, con un vocabulario de 248.320 tokens y una ventana de contexto de 262.144 tokens. Incluye una única capa de predicción multi-token (MTP) que actúa como cabeza borrador para decodificación especulativa, y un proyector de visión que habilita la entrada de imágenes. La arquitectura se identifica como `Qwen3_5ForConditionalGeneration` en el ecosistema de llama.cpp.

El proceso de modificación aplicado por el autor no implica entrenamiento adicional: se ejecuta abliteración con Heretic en precisión bf16, se fusiona la LoRA resultante en el modelo base bf16 y se copian literalmente los tensores `mtp.*` desde el checkpoint original tras la fusión. La abliteración modifica únicamente `attn.o_proj` y `mlp.down_proj` de la pila principal, de modo que la cabeza MTP queda intacta pero fue entrenada contra el modelo sin modificar, lo que puede reducir ligeramente la tasa de aceptación en decodificación especulativa. La matriz de importancia se calcula directamente desde los pesos f16, no desde una cuantización intermedia, para que la calibración vea los pesos reales.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento y matemáticas heredados del modelo base Qwen3.8-27B.
- Generación de código, aunque no se documentan benchmarks específicos en la información disponible.
- Entrada de imágenes mediante el proyector `mmproj-Qwen3.8-27B-Uncensored-F16.gguf` en runtimes de visión compatibles.
- Decodificación especulativa con cabeza MTP integrada (variantes fusionadas) o explícita mediante `--model-draft` (variantes target + draft).
- Soporte bilingüe inglés y chino.
- Comportamiento de rechazo sustancialmente reducido respecto al modelo base (no eliminado).
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con llama.cpp.
- No se documenta soporte explícito de tool calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Investigación sobre alineación y abliteración: el modelo permite estudiar empíricamente cómo la eliminación de direcciones de rechazo afecta al comportamiento sin reentrenar, comparando directamente contra el base Qwen3.8-27B con la misma tokenizadora y arquitectura.
- Despliegue local en estación de trabajo con GPU única: la cuantización Q4_K_M (16,8 GB) o IQ4_XS (15,3 GB) cabe en GPUs de 24 GB de VRAM, permitiendo inferencia privada sin conexión a servicios externos.
- Procesamiento de documentos largos: con 262.144 tokens de contexto, el modelo puede ingerir contratos, informes o expedientes completos en una sola pasada para tareas de resumen o extracción, siempre que el contenido no requiera filtros de seguridad.
- Análisis de imágenes con texto asociado: usando el proyector mmproj F16 en un runtime compatible, se pueden procesar capturas, diagramas o documentos escaneados junto con instrucciones textuales.
- Generación de contenido creativo sin restricciones de estilo: escritura de ficción, guiones o material editorial donde los filtros del modelo base resultan un obstáculo, asumiendo la responsabilidad editorial del operador.
- Aceleración de inferencia en servidores llama.cpp: las variantes con MTP fusionado o el par target + draft permiten decodificación especulativa con verificación contra el modelo objetivo, manteniendo la calidad de salida mientras se reduce la latencia por token.
- Evaluación comparativa de cuantizaciones: la matriz de importancia publicada y las perplejidades por cuantización permiten reproducir el pipeline de cuantización y medir el impacto de cada nivel en un caso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor únicamente reporta perplejidad en wikitext-2 para cada cuantización, medida en una sola sesión contra la misma línea base f16:

| Archivo | Tamano | MTP | PPL (wikitext-2) | Delta vs f16 |
|---|---|---|---|---|
| f16 (línea base, no publicado) | no disponible | sí | 7,1557 ± 0,25104 | — |
| Q5_K_M | 19,5 GB | sí | 7,1573 ± 0,25055 | +0,0016 |
| IQ4_XS | 15,3 GB | sí | 7,1583 ± 0,25019 | +0,0026 |
| Q6_K | 22,4 GB | sí | 7,1689 ± 0,25149 | +0,0132 |
| Q8_0 | 29,0 GB | sí | 7,1764 ± 0,25195 | +0,0207 |
| Q4_K_M | 16,8 GB | sí | 7,1814 ± 0,25227 | +0,0257 |
| IQ2_M | 10,6 GB | sí | 7,8581 ± 0,27481 | +0,7024 |

El propio autor advierte que, salvo IQ2_M, todas las filas caen dentro de un margen de 0,026 frente a un error estándar de aproximadamente 0,25, por lo que no son separables entre sí ni respecto a f16 y su ordenación es ruido estadístico. La única conclusión robusta es que IQ2_M degrada la perplejidad de forma apreciable (+0,7024).

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto y caché KV):
  - IQ2_M: 10,6 GB de pesos; viable en GPU de 12-16 GB con contexto moderado.
  - IQ4_XS: 15,3 GB; viable en GPU de 24 GB.
  - Q4_K_M: 16,8 GB; viable en GPU de 24 GB con contexto reducido.
  - Q5_K_M: 19,5 GB; requiere 24 GB o más.
  - Q6_K: 22,4 GB; requiere 24 GB o más, con margen ajustado.
  - Q8_0: 29,0 GB; requiere GPU de 32 GB o superior (A100 40 GB, H100, RTX 5090 de 32 GB).
- GPU recomendadas: A100 40 GB, H100 80 GB o RTX 4090/5090 para las cuantizaciones bajas y medias; para Q8_0 se necesita al menos 32 GB de VRAM.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con IQ4_XS, Q4_K_M o Q5_K_M; IQ2_M cabe incluso en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp (librería declarada), llama-server con `--model-draft` para la cabeza MTP, ComfyUI (documentado en la model card) y runtimes compatibles con GGUF y visión.
- Decodificación especulativa: las variantes fusionadas llevan la cabeza MTP inline; las variantes target + draft permiten pasar `--model-draft` con el archivo draft en Q8_0 (3,2 GB) o Q4_0 (1,7 GB). La tasa de aceptación de Q4_0 no ha sido medida por el autor.
- Latencia y throughput: no se publican cifras concretas de tokens por segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-GGUF (este) | 27,3 B | 262.144 | Apache 2.0 | GGUF | Abliterado con Heretic, MTP y visión conservados |
| Qwen/Qwen3.8-27B (base) | 27,3 B | 262.144 | Apache 2.0 | safetensors (original) | Modelo original con filtros de rechazo intactos |
| Otras cuantizaciones GGUF del mismo base | 27,3 B | 262.144 | Apache 2.0 | GGUF | Sin modificación de comportamiento; no se dispone de comparativa de rendimiento publicada |

No se dispone en la información proporcionada de datos de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de la misma categoría. La comparación disponible se limita a la identidad de parámetros y contexto con el modelo base y a la diferencia de comportamiento (rechazo reducido) frente a él.

## Limitaciones y advertencias

- El comportamiento de rechazo está reducido de forma sustancial, pero no eliminado; el autor no especifica la tasa residual exacta en la información disponible.
- La abliteración puede alterar sutilmente la distribución de salidas al modificar `attn.o_proj` y `mlp.down_proj`; no se han publicado evaluaciones de calidad downstream más allá de la perplejidad.
- La cabeza MTP fue entrenada contra el modelo sin modificar, por lo que la tasa de aceptación en decodificación especulativa puede caer ligeramente; la calidad de salida no se ve afectada porque cada token se verifica contra el objetivo.
- La tasa de aceptación de la cabeza draft en Q4_0 no ha sido medida por el autor.
- IQ2_M degrada la perplejidad de forma apreciable (+0,7024 frente a f16); el resto de cuantizaciones no son estadísticamente separables entre sí según los intervalos de error reportados.
- Idiomas soportados limitados a inglés y chino; no se documenta rendimiento en castellano.
- No se documenta soporte de tool calling ni de flujos de agentes multi-paso en la información disponible.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Uso comercial permitido por licencia Apache 2.0, pero la ausencia de filtros de rechazo traslada al operador la responsabilidad sobre el contenido generado y su adecuación normativa.
- El repositorio tiene 231,3 GB de tamaño total y 0 descargas en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zanezhang666/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
