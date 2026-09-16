# tuanpasg/wudi_gemma_fp32_iter_25

## Resumen

`tuanpasg/wudi_gemma_fp32_iter_25` es un modelo de lenguaje derivado de `google/gemma-2-2b` mediante una fusion de pesos (model merging) aplicada sobre tres checkpoints ya ajustados: `MergeBench/gemma-2-2b_instruction`, `MergeBench/gemma-2-2b_math` y `MergeBench/gemma-2-2b_coding`. El autor lo publica bajo el identificador `tuanpasg` y el algoritmo empleado es `wudi_merge`, en su variante `wudi_all_linear`, ejecutado durante 25 iteraciones con tasa de aprendizaje 1e-05, `alpha` 1.0, `K` 0.7 y regularizacion `cfs_ridge` desactivada. El objetivo es combinar en un unico conjunto de pesos las capacidades de instruccion, matematicas y codigo sin reentrenar desde cero.

El resultado es un modelo de 2.614.341.888 parametros (aproximadamente 2.6B) almacenado en safetensors, con un repositorio de 5.3 GB, lo que es coherente con pesos en `bfloat16` complementados por una copia en fp32 o por el propio `safetensors` en precision completa. Al conservar el `embed_tokens.weight` y el `lm_head.weight` fuera de la fusion (asi lo indica la lista `exclude` y el campo `effective_exclude`), la fusion se limita a las capas lineales del transformer, evitando distorsionar el vocabulario de entrada y la proyeccion de salida.

La relevancia de esta publicacion es metodologica mas que de rendimiento: documenta un caso reproducible de fusion multi-tarea sobre Gemma 2 2B con hiperparametros explicitos, semilla de fusion `ties_sparsify` y `task_arithmetic` como mecanismo de respaldo. No obstante, el modelo no incluye model card descriptiva, licencia declarada, idiomas, pipeline ni resultados de evaluacion, y acumula cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de `google/gemma-2-2b`); fusion de pesos sobre capas lineales, sin cambios estructurales |
| Parametros totales | 2.614.341.888 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base `google/gemma-2-2b` declara 8.192 tokens |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene safetensors en la configuracion de guardado (`bfloat16` declarado en los argumentos de fusion). No se publican GGUF ni cuantizaciones de 8 o 4 bits |
| Idiomas soportados | No disponible |
| Licencia | No disponible; el modelo base `google/gemma-2-2b` esta sujeto a los Gemma Terms of Use |
| Formato de pesos | safetensors |
| Tag de libreria | `gemma2` |
| Region declarada | `us` |
| Tamano del repositorio | 5.3 GB |
| Fecha de creacion | 2026-09-16 |
| Ultima actualizacion | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay entrenamiento en el sentido convencional: el modelo se obtiene por fusion de pesos (*model merging*). La arquitectura es la del modelo base `google/gemma-2-2b`, un transformer decoder-only con atencion por ventana deslizante alternada y atencion global, normalizacion RMSNorm y activacion GeGLU. La fusion no modifica el grafo ni el numero de capas; solo recombina los tensores de las capas lineales. Los tensores de `embed_tokens.weight` y `lm_head.weight` quedan excluidos explicitamente (`.*embed_tokens\.weight$`, `.*lm_head\.weight$`), de modo que la matriz de embeddings y la cabeza de salida permanecen intactas.

El algoritmo `wudi_merge` se aplica en la variante `wudi_all_linear` con 25 iteraciones (`wudi_iter: 25`), `scaling` 1.0, `dtype` de guardado `bfloat16`, `device_map` en CPU para el volcado y `wudi_device` en CUDA para el calculo. Los hiperparametros incluyen `wudi_lr` 1e-05, `wudi_weight_decay` 0.0, `wudi_alpha` 1.0, `wudi_warm_start` desactivado y `wudi_cfs_ridge` 0.0. La esparsificacion usa `ties_sparsify` con `wudi_K` 0.7, y el mecanismo de respaldo ante fallo es `task_arithmetic` con `scaling` 1.0. Los tres checkpoints de origen son los del benchmark MergeBench para instruccion, matematicas y codigo. El tiempo total de fusion registrado fue de 350.984 segundos (aproximadamente 5 minutos y 51 segundos). No se documenta ningun ajuste posterior con RLHF, DPO o SFT adicional.

## Capacidades

- Generacion de texto autoregresiva, heredada de la arquitectura Gemma 2 2B.
- Instruccion: la fusion incorpora `MergeBench/gemma-2-2b_instruction`, por lo que se espera seguimiento de instrucciones en formato conversacional.
- Matematicas: incorpora `MergeBench/gemma-2-2b_math`, orientado a resolucion de problemas aritmeticos y razonamiento numerico.
- Codigo: incorpora `MergeBench/gemma-2-2b_coding`, orientado a generacion y comprension de codigo.
- Tool calling / function calling: no disponible; no se documenta plantilla de herramientas ni soporte explicito.
- Capacidades de agente y razonamiento multi-paso: no disponible; no hay evidencia declarada.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible; es un modelo exclusivamente de texto segun los tags publicados.

## Casos de uso

- Asistente conversacional ligero en local: con 2.6B de parametros, el modelo es desplegable en una GPU de consumo para tareas de chat multi-turno, siempre que se valide empiricamente la calidad del merge frente al modelo base.
- Generacion de codigo en estaciones de trabajo: la inclusion del checkpoint de coding permite usar el modelo como autocompletado o generador de funciones en entornos sin conexion, con la advertencia de que no hay benchmarks publicados que respalden su calidad.
- Resolucion de problemas matematicos paso a paso: el checkpoint de matematicas fusionado lo hace candidato para ejercicios de aritmetica y algebra en herramientas educativas, sujeto a validacion previa por el riesgo de alucinacion en cadenas de razonamiento.
- Prototipado de investigacion en fusion de modelos: el valor principal del artefacto es servir como referencia reproducible de `wudi_merge` con hiperparametros completos, util para comparar tecnicas de merging sobre una base de 2B.
- Experimentos de destilacion y evaluacion de olvido catastrofico: al combinar tres dominios (instruccion, matematicas, codigo) en un unico conjunto de pesos, permite medir interferencia entre tareas sin coste de reentrenamiento.
- Clasificacion y extraccion de informacion en texto: como modelo de 2B con contexto de 8.192 tokens (heredado del base), puede emplearse en tareas de resumen o etiquetado por lotes en hardware modesto.
- Base para cuantizacion y despliegue en CPU: al publicarse unicamente safetensors, es un punto de partida para generar versiones GGUF e integrarlas en llama.cpp u Ollama, aunque ese trabajo queda fuera del repositorio publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo registra metadatos del proceso de fusion (tiempo de ejecucion, hiperparametros y checkpoints de origen); no incluye MMLU, GSM8K, HumanEval ni ninguna otra metrica de evaluacion, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada en `bfloat16` (2.6B parametros): en torno a 5,2 GB solo de pesos, mas entre 1 y 2 GB de cache KV segun longitud de contexto y tamano de lote. Presupuesto practico: 8-10 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2,6 GB de pesos; en 4 bits, alrededor de 1,3-1,5 GB. Estas cuantizaciones no se distribuyen en el repositorio y habria que generarlas.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100 para despliegue por lotes con lotes grandes; RTX 4090 (24 GB) y RTX 3090 (24 GB) para servicio con holgura; RTX 4080/4070 Ti (16 GB) y RTX 3060 (12 GB) suficientes para inferencia en bf16.
- GPU de consumo: si cabe en tarjetas de 8 GB o mas en bf16 con contexto recortado, y en 4-6 GB si se cuantiza a 4 bits. En 6 GB o menos en bf16 probablemente no entre con contexto completo.
- Opciones de despliegue: vLLM y TGI soportan arquitectura `gemma2` con pesos safetensors; llama.cpp y Ollama requieren conversion previa a GGUF, no incluida en el repositorio; tambien es viable `transformers` con `device_map` explicito.
- Latencia y throughput: no disponible; no se publican mediciones. Como referencia de orden de magnitud, un modelo denso de 2.6B en bf16 sobre una RTX 4090 suele operar en el rango de decenas de tokens por segundo en generacion individual, pero este dato no esta verificado para este artefacto.
- Nota: el repositorio ocupa 5.3 GB, lo que implica que la descarga completa requiere ese espacio en disco independientemente de la cuantizacion posterior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `tuanpasg/wudi_gemma_fp32_iter_25` | 2,61B | No disponible (base: 8.192) | No disponible | Safetensors en HF, 0 descargas | Fusion de tres checkpoints MergeBench; sin benchmarks publicados |
| `google/gemma-2-2b` | 2,61B | 8.192 tokens | Gemma Terms of Use | Ampliamente distribuido | Modelo base del anterior; cuenta con evaluaciones publicas del fabricante |
| `google/gemma-2-2b-it` | 2,61B | 8.192 tokens | Gemma Terms of Use | Ampliamente distribuido | Variante instruida oficial, con soporte de chat documentado |
| `Qwen2.5-1.5B` / `Qwen2.5-3B` | 1,54B / 3,09B | 32.768 tokens | Apache 2.0 (1.5B) y Qwen License | Ampliamente distribuidos | Alternativas de tamano comparable con contexto muy superior y licencia mas clara |
| `meta-llama/Llama-3.2-3B` | 3,21B | 128.000 tokens | Llama 3.2 Community License | Ampliamente distribuido | Alternativa de tamano cercano con contexto mucho mayor |

No es posible comparar rendimiento porque el modelo no publica ninguna metrica de evaluacion; la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparacion con el modelo base, ni ablation de los tres checkpoints fusionados. No puede afirmarse que la fusion mejore a `google/gemma-2-2b` en ninguna tarea.
- Licencia no declarada: la model card no especifica licencia. El modelo base `google/gemma-2-2b` esta sujeto a los Gemma Terms of Use, que imponen obligaciones de atribucion y restricciones de uso; el autor no aclara si esas condiciones se trasladan al derivado. Antes de cualquier uso comercial debe verificarse con el autor y con los terminos del modelo base.
- Procedencia de los checkpoints de origen: los pesos fusionados provienen de `MergeBench/gemma-2-2b_instruction`, `_math` y `_coding`, cuyas condiciones de uso tampoco se reproducen en la model card.
- Riesgo de degradacion por merging: la fusion de pesos puede producir interferencia entre tareas y degradar capacidades que cada checkpoint tenia por separado. Sin evaluacion no es posible descartarlo.
- Riesgo de alucinacion: inherente a un modelo de 2.6B; especialmente relevante en matematicas y generacion de codigo, donde una salida plausible puede ser incorrecta.
- Idiomas no declarados: se desconoce si el comportamiento multilingue del base Gemma 2 se conserva tras la fusion, dado que los checkpoints de origen estan orientados a tareas y no a idiomas.
- Contexto no declarado: la model card no fija longitud de contexto. El valor de 8.192 tokens es una herencia del base y debe verificarse con la configuracion del repositorio antes de desplegarlo en produccion.
- Sin soporte declarado de tool calling, agentes ni plantilla de chat: no se documenta `chat_template`, lo que complica el uso conversacional directo con frameworks estandar.
- Metadatos de uso nulos: cero descargas y cero likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.
- Fechas de publicacion inusuales (2026-09-16): conviene verificar la integridad y el contenido real del repositorio antes de reutilizarlo.
- Modelo exclusivamente de texto: los tags no indican vision, audio ni ninguna otra modalidad.
- La model card no incluye pipeline declarado, por lo que la integracion automatica con `transformers` puede requerir configuracion manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tuanpasg/wudi_gemma_fp32_iter_25
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Checkpoints de origen citados en la model card: `MergeBench/gemma-2-2b_instruction`, `MergeBench/gemma-2-2b_math`, `MergeBench/gemma-2-2b_coding` (referencias textuales de la model card; no se proporcionaron URL directas)
- Paper, blog, repositorio o demo del algoritmo `wudi_merge`: no disponible en la informacion proporcionada
- Los resultados de busqueda web facilitados no contienen informacion relacionada con el modelo (corresponden a servicios de correo de un operador de telefonia) y no se han utilizado como fuente.
