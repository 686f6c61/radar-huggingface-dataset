# zanezhang666/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF es una cuantizacion GGUF de tipo "abliterated" (sin censura) del modelo ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO, publicada por el usuario zanezhang666. El modelo base es un DeepSeek-V4.1 Flash con cuantizacion GSQ-RCO, y esta version concreta aplica una eliminacion de las direcciones de rechazo ("abliteration") directamente sobre los pesos cuantizados, sin necesidad de adaptadores LoRA en tiempo de ejecucion. El resultado es un modelo de 196.613.849.600 parametros (unos 196.600 millones) empaquetado en formato GGUF con cuantizacion mixta extrema (IQ2_XXS en el backbone, IQ1_M en 28 capas de expertos enrutados e IQ4_NL en la tabla de consulta Engram).

El modelo resuelve el problema de desplegar un LLM de gran escala sin censura en hardware relativamente modesto mediante tecnicas de cuantizacion agresiva y una arquitectura de shards compatible con llama.cpp y Strata. Es relevante porque demuestra que es posible hornear la abliteration en los pesos cuantizados preservando casi intacta la inteligencia del modelo base (correlacion de log-perplejidad del 99,84% y KL-divergence mediana de 0,000421 nats respecto al original). El repositorio ocupa 250,1 GB e incluye seis shards, un proyector de vision y una tabla Engram de 110,6 GB.

La licencia es MIT, lo que facilita su uso comercial, aunque la naturaleza "uncensored" implica que el modelo puede generar contenido que los modelos alineados rechazarian.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo DeepSeek-V4.1 Flash con capas de expertos enrutados (MoE) y tabla Engram; cuantizacion mixta GSQ-RCO |
| Parametros totales | 196.613.849.600 (~196,6 mil millones) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ2_XXS (backbone), IQ1_M (28 capas de expertos enrutados GSQ), IQ4_NL (tabla Engram), Q6_K (tensores attn_output_b abliterated), BF16 (proyector de vision mmproj) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (6 shards: 00001-of-00006 a 00006-of-00006, mas mmproj BF16) |

## Arquitectura y entrenamiento

El modelo base es un transformer DeepSeek-V4.1 Flash con arquitectura de mezcla de expertos (MoE), que incluye 28 capas de expertos enrutados cuantizadas a 1 bit (IQ1_M) calibradas con GSQ (posiblemente "Gradient-Scaled Quantization") y una tabla de consulta Engram de 110,6 GB cuantizada a IQ4_NL. La cuantizacion GSQ-RCO del modelo base preserva el 100% de la calibracion AIME25 y GPQA-D segun la model card. El proceso de abliteration afecta a 86 tensores residuales (80 densos y 6 capas de expertos de 2 bits exactos), que se hornearon directamente en los pesos cuantizados: los tensores `blk.0..39.attn_output_b.weight` se actualizaron a Q6_K y se modificaron `blk.0..39.ffn_down_shexp.weight` y seis capas `ffn_down_exps.weight`. El incremento de tamano respecto al original es de solo +0,34 GB (+0,25%), pasando de 138,24 GB a 138,58 GB en el backbone de cinco shards.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La innovacion tecnica destacable es la abliteration "zero-LoRA": los pesos cuantizados incorporan directamente la eliminacion de la direccion de rechazo, de modo que el modelo carga en llama.cpp (build b11870+ / v0.8.0+) y en Strata sin adaptadores externos. La verificacion empirica con `llama-perplexity --kl-divergence` (build b12017) muestra una correlacion de log-perplejidad del 99,84% respecto al original, una coincidencia Top-1 del 98,425% ± 1,109% sobre los 129.280 logits del vocabulario y una similitud coseno media del subespacio no-rechazo de 0,999609.

## Capacidades

- Generacion de texto conversacional y de base, con soporte de plantilla de chat Jinja embebida.
- Modo de razonamiento activable mediante `--reasoning on` y ajuste de esfuerzo con `--reasoning-effort` (por ejemplo, 50).
- Capacidades de vision gracias al proyector `mmproj-DeepSeek-V4.1-Flash-1017-BF16.gguf`, que se carga con `--mmproj` en llama-server.
- Comportamiento "uncensored" (abliterated): elimina las direcciones de rechazo, por lo que no aplica negativas de seguridad alineadas.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta especificado).
- Compatibilidad nativa con llama.cpp (llama-cli y llama-server) y con Strata (familia `deepseek41`, modelo `ist-das-2.00bpw`).

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la abliteration comparando directamente sus respuestas con las del modelo base alineado, gracias a la verificacion KL-divergence publicada (0,000421 nats de mediana) que aisla el cambio de comportamiento del cambio de inteligencia.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido adulto donde los modelos alineados aplican rechazos; el modelo mantiene el 99,84% de la distribucion del original segun la auditoria.
- Despliegue en hardware de consumo: con cuantizacion IQ2_XXS/IQ1_M y soporte de Strata en una GPU NVIDIA de 12 GB o mas, se puede servir localmente un modelo de ~196.600 millones de parametros sin infraestructura de datacenter.
- Evaluacion de tecnicas de cuantizacion extrema: el repositorio sirve como caso de estudio de cuantizacion mixta GSQ-RCO con preservacion de rendimiento en benchmarks de razonamiento (AIME25, GPQA-D) pese a bajar capas de expertos a 1 bit.
- Procesamiento multimodal local: con el proyector BF16 y llama-server se pueden construir pipelines de vision-lenguaje (descripcion de imagenes, extraccion de informacion visual) en un servidor local.
- Investigacion sobre arquitecturas MoE con tablas Engram: la estructura de seis shards con una tabla de consulta de 110,6 GB permite estudiar el comportamiento de la memoria externa de expertos en inferencia cuantizada.
- Desarrollo de herramientas compatibles con llama.cpp: el formato de seis shards con metadatos `deepseek41.attention.kv_source_layers` es util para probar integraciones nuevas (por ejemplo, Strata) contra un modelo real de gran escala.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, AIME25, GPQA-D) para esta version concreta. Si incluye una auditoria de divergencia respecto al modelo base:

| Metrica | Resultado |
|---|---|
| Tensores verificados | 1.043 / 1.043 |
| Tensores residuales abliterated (blake2b) | 86 (80 densos + 6 expertos de 2 bits) |
| Capas de expertos IQ1_M GSQ preservadas | 28 / 28 (100%) |
| Correlacion log-perplejidad | 99,84% |
| Coincidencia Top-1 (Same top p) | 98,425% ± 1,109% |
| KL-divergence mediana | 0,000421 nats |
| KL-divergence media | 0,009546 ± 0,001921 nats |
| Cambio mediano de probabilidad de token | -0,003% |
| Similitud coseno del subespacio no-rechazo | 0,999609 |
| PPL(Q) vs PPL(base) | 2,4857 ± 0,5017 vs 2,3538 ± 0,4522 |

No se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 250,1 GB, pero el backbone de cinco shards pesa 138,58 GB y la tabla Engram 110,6 GB. Con cuantizacion IQ2_XXS/IQ1_M, el backbone requiere aproximadamente 139 GB de almacenamiento y, en inferencia con llama.cpp y `-ngl 99`, la memoria necesaria ronda esa cifra si se descarga todo a GPU; Strata permite ejecucion con 1 GPU NVIDIA de 12 GB o mas mediante gestion de memoria fuera de GPU.
- GPU recomendadas: para llama.cpp con descarga completa en GPU se necesitan configuraciones de clase A100 80 GB en multiples unidades, H100 o similares; Strata esta pensada para una unica GPU de 12 GB o mas.
- Cabe en GPU de consumo: si, mediante Strata (1x 12 GB+ NVIDIA GPU); con llama.cpp puro no cabe en una GPU de consumo por el tamano del backbone y de la tabla Engram.
- Opciones de despliegue: llama.cpp b11870+ / v0.8.0+ (llama-cli y llama-server), Strata 0.2.8 (build 0.1.54) con `--family deepseek41 --model ist-das-2.00bpw`, y conexion de Strata a llama-server via HTTP en `http://127.0.0.1:8080`. Se requiere crear un symlink o hardlink del archivo Engram como shard 6.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS (este) | ~196,6 mil millones | No disponible | IQ2_XXS / IQ1_M / IQ4_NL / Q6_K | MIT | Abliterated, zero-LoRA, 6 shards + mmproj vision |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF (base) | ~196,6 mil millones | No disponible | IQ2_XXS / IQ1_M / IQ4_NL | No disponible | Modelo original alineado, sin abliteration |
| Otros modelos de ~200B en GGUF | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion |

No se dispone de informacion suficiente para comparar con alternativas de la misma categoria mas alla del modelo base.

## Limitaciones y advertencias

- Modelo "uncensored": la abliteration elimina las direcciones de rechazo, por lo que puede generar contenido toxico, ilegal o danino sin las salvaguardas del modelo base; no es adecuado para aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo de alucinacion: inherente a los LLM; la cuantizacion extrema (IQ1_M en 28 capas de expertos) puede aumentar la degradacion en tareas de razonamiento largo pese a la auditoria de KL-divergence favorable.
- Idiomas soportados no especificados: se desconoce el rendimiento multilingue y si el castellano esta bien cubierto.
- Longitud de contexto no disponible: no se puede confirmar la ventana maxima de contexto para conversaciones multi-turno o documentos largos.
- Restricciones de licencia: MIT permite uso comercial, pero el autor no ofrece garantias sobre el cumplimiento legal del contenido generado ni sobre la procedencia de los datos de entrenamiento del modelo base.
- Requisito de infraestructura especifico: el despliegue exige crear un symlink o hardlink del archivo Engram como shard 6; Strata 0.1.54 puede fallar en su comprobacion de tamano al ser este build 0,34 GB mayor que el original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de comunidad ni de validacion independiente.
- La model card cita un comando `hf download` con el usuario `Abiray/...` en lugar de `zanezhang666/...`, lo que puede indicar un error de documentacion o una publicacion duplicada; conviene verificar el repositorio correcto antes de descargar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zanezhang666/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-IQ2_XXS-GGUF
- Modelo base: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- llama.cpp: no disponible en la informacion proporcionada (el repositorio no incluye enlace directo)
- Strata: no disponible en la informacion proporcionada (el repositorio no incluye enlace directo)
