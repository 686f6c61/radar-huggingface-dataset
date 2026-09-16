# tuanpasg/wudi_gemma_fp32_iter_200

## Resumen

`tuanpasg/wudi_gemma_fp32_iter_200` es un modelo de lenguaje derivado de `google/gemma-2-2b` mediante una fusión de pesos (*model merging*) aplicada sobre tres checkpoints ajustados de forma independiente: `MergeBench/gemma-2-2b_instruction`, `MergeBench/gemma-2-2b_math` y `MergeBench/gemma-2-2b_coding`. El objetivo declarado por el autor es combinar en un único conjunto de pesos las capacidades de instrucción, matemáticas y código que cada checkpoint aporta por separado, evitando así mantener tres modelos especializados en producción.

El algoritmo empleado es `wudi_merge` (variante `wudi_all_linear`), ejecutado durante 200 iteraciones sobre CPU como `device_map` de carga, con el cálculo interno en CUDA y `dtype` de salida `bfloat16`. Se excluyeron del proceso de fusión las capas de embeddings (`embed_tokens.weight`) y la cabeza de salida (`lm_head.weight`). El resultado es un checkpoint de 2.614.341.888 parámetros (aproximadamente 2,6 mil millones) con pesos en formato `safetensors`, y un repositorio de 5,3 GB.

La relevancia de esta ficha es limitada pero concreta: se trata de un experimento de fusión reproducible (los hiperparámetros están publicados en la model card), sin model card descriptiva, sin licencia declarada y sin ningún resultado de evaluación publicado. Cualquier uso en producción debería ir precedido de una evaluación propia, ya que no hay evidencia pública de que la fusión preserve las capacidades de los tres checkpoints de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 2), heredada de `google/gemma-2-2b` |
| Parametros totales | 2.614.341.888 (~2,6 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base `google/gemma-2-2b` tiene 8.192 tokens segun su documentacion publica) |
| Tipos de cuantizacion | No disponible. Solo se publican pesos `safetensors`; no hay GGUF ni cuantizaciones precalculadas en el repositorio |
| Idiomas soportados | No disponible |
| Licencia | No disponible. La model card no declara licencia; el modelo base Gemma 2 se distribuye bajo los terminos de uso de Gemma de Google |
| Formato de pesos | `safetensors` (`dtype` de fusion declarado: `bfloat16`) |

## Arquitectura y entrenamiento

No hay entrenamiento en el sentido habitual: el checkpoint es el resultado de una fusión de pesos. El autor parte de `google/gemma-2-2b` como modelo base y de tres checkpoints ajustados sobre esa misma base (`MergeBench/gemma-2-2b_instruction`, `MergeBench/gemma-2-2b_math`, `MergeBench/gemma-2-2b_coding`). El algoritmo `wudi_merge`, en su variante `wudi_all_linear`, se aplica a todas las capas lineales, con 200 iteraciones, `wudi_lr` = 1e-5, `wudi_weight_decay` = 0.0, `wudi_alpha` = 1.0 y `wudi_K` = 0.7. La esparsificación utiliza `ties_sparsify` y el método de respaldo ante fallo es `task_arithmetic` con escalado 1.0. Los tensores de embeddings y `lm_head` quedan excluidos de la fusión (lista `exclude` y `effective_exclude`).

En cuanto al procedimiento, la carga se hizo con `device_map: "cpu"` y la fusión se ejecutó en `cuda`, con un tiempo declarado de 2734,069 segundos (unos 45,6 minutos) para las 200 iteraciones. No se declara ningún ajuste posterior del modelo fusionado (no hay RLHF, DPO ni SFT adicional tras la fusión), ni se documenta el número de tokens de entrenamiento de los checkpoints de origen ni la composición de sus datasets. Tampoco se describe ninguna innovación de inferencia (decodificación especulativa, atención lineal, etc.); la arquitectura efectiva es la del modelo base Gemma 2.

## Capacidades

- Generacion de texto: capacidad heredada del modelo base `google/gemma-2-2b`.
- Seguimiento de instrucciones: esperada por la fusion del checkpoint `gemma-2-2b_instruction`, aunque no verificada con evaluaciones publicadas.
- Razonamiento matematico: esperada por la fusion del checkpoint `gemma-2-2b_math`, sin resultados publicados.
- Generacion de codigo: esperada por la fusion del checkpoint `gemma-2-2b_coding`, sin resultados publicados.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas. Los idiomas soportados figuran como no disponibles.
- Capacidades especiales (modo *thinking*, vision, audio): no documentadas.
- Relleno de plantillas de chat: la model card no especifica ninguna plantilla de prompt, por lo que el formato de conversacion debe tomarse del modelo base.

## Casos de uso

- Prototipado de asistentes conversacionales en local: al tener ~2,6 B de parametros, el modelo cabe en una GPU de consumo y permite iterar sobre flujos de dialogo sin coste de API. Es adecuado para pruebas de concepto, siempre que se valide antes la calidad de las respuestas.
- Generacion de codigo en entornos de pruebas: puede usarse como asistente de autocompletado o de generacion de fragmentos en un IDE, dado el checkpoint de codigo incluido en la fusion. En produccion exigiria una evaluacion previa con tests unitarios.
- Resolucion de problemas matematicos de nivel escolar o universitario basico: el checkpoint de matematicas de la fusion apunta a este escenario, util para herramientas educativas con supervision humana.
- Investigacion sobre *model merging*: el repositorio publica el JSON completo de argumentos, el numero de iteraciones y el tiempo de ejecucion, lo que lo convierte en un caso de estudio reproducible para comparar variantes de `wudi_merge` frente a otros metodos (SLERP, TIES, DARE, task arithmetic).
- Experimentos de destilacion o *fine-tuning* posterior: al ser un modelo de 2,6 B en `safetensors`, sirve como punto de partida barato para ajustes especificos sobre una unica GPU.
- Servicio de inferencia de bajo coste en CPU: con cuantizacion a 4 bits (previa conversion a GGUF, no incluida en el repositorio) podria ejecutarse en un servidor sin GPU para tareas de clasificacion, resumen o extraccion de informacion.
- Evaluacion comparativa de tecnicas de fusion: util como referencia en estudios que midan la degradacion o retencion de capacidades tras fusionar checkpoints de tareas distintas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se aportan mediciones de latencia o throughput.

## Requisitos de hardware

Todas las cifras de esta seccion son estimaciones derivadas del numero de parametros y del formato de pesos; no proceden de mediciones publicadas por el autor.

- Peso de los parametros: ~2,6 B x 2 bytes ≈ 5,2 GB en `bfloat16`, coherente con el tamano de repositorio declarado de 5,3 GB. En `float32` serian ~10,5 GB, pese a que el nombre del repositorio incluye `fp32`.
- VRAM estimada para inferencia en `bfloat16`: aproximadamente 6-8 GB, incluyendo pesos y cache KV con contextos moderados.
- VRAM estimada en 8 bits: aproximadamente 3-4 GB.
- VRAM estimada en 4 bits (GGUF Q4): aproximadamente 2-3 GB.
- GPU recomendadas: A100 40 GB o H100 para servir varias replicas o lotes grandes; RTX 4090, RTX 3090 o L40S para inferencia de una sola instancia con margen amplio; RTX 3060 de 12 GB o RTX 4070 para uso individual.
- Cabe en GPU de consumo: si. En `bfloat16` es ajustado en tarjetas de 8 GB; en tarjetas de 12 GB o superiores entra con holgura. Con cuantizacion de 4 bits puede ejecutarse en GPUs de 6 GB.
- Opciones de despliegue: `transformers` (carga directa desde `safetensors`), vLLM y TGI para servicio con batching. Para llama.cpp u Ollama seria necesario convertir primero los pesos a GGUF, ya que el repositorio no incluye cuantizaciones.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas ni datos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| `tuanpasg/wudi_gemma_fp32_iter_200` | 2,6 B | No disponible en la informacion proporcionada | No disponible | Repositorio safetensors, 0 descargas | Sin benchmarks publicados |
| `google/gemma-2-2b` (base) | 2,6 B | 8.192 tokens segun documentacion publica | Terminos de uso de Gemma | Publico en HuggingFace | Metricas publicadas por Google |
| `MergeBench/gemma-2-2b_instruction` | 2,6 B (misma base) | No disponible en la informacion proporcionada | No disponible | Publico en HuggingFace | Sin datos en la informacion proporcionada |
| `MergeBench/gemma-2-2b_math` | 2,6 B (misma base) | No disponible en la informacion proporcionada | No disponible | Publico en HuggingFace | Sin datos en la informacion proporcionada |
| `MergeBench/gemma-2-2b_coding` | 2,6 B (misma base) | No disponible en la informacion proporcionada | No disponible | Publico en HuggingFace | Sin datos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativos entre el modelo fusionado y los tres checkpoints de origen, que es precisamente la comparacion relevante para justificar la fusion.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks ni evaluaciones cualitativas publicadas, por lo que no puede afirmarse que la fusion preserve las capacidades de instruccion, matematicas y codigo de los checkpoints de origen.
- Licencia no declarada: la model card no especifica licencia. Al derivar de `google/gemma-2-2b`, es probable que se apliquen los terminos de uso de Gemma de Google, que incluyen condiciones y restricciones para uso comercial. Debe verificarse antes de cualquier despliegue productivo.
- Idioma: la ficha no declara idiomas soportados. El modelo base esta orientado principalmente al ingles, por lo que el rendimiento en castellano es incierto y requeriria evaluacion.
- Riesgo de alucinacion: no cuantificado. Al ser un modelo de 2,6 B, la tasa de errores factuales es previsiblemente alta en dominios especializados.
- Riesgo de degradacion por fusion: los metodos de *merging* pueden producir interferencia entre tareas. No hay datos que indiquen si las capacidades de codigo o matematicas se han visto afectadas negativamente respecto a los checkpoints individuales.
- Inconsistencia en la nomenclatura: el repositorio se llama `fp32` pero el argumento de fusion declara `dtype: bfloat16` y el tamano del repositorio (5,3 GB) es consistente con `bfloat16`. Conviene verificar el `dtype` real de los tensores antes de calcular requisitos de memoria.
- Exposicion publica minima: 0 descargas y 0 *likes* en el momento de la consulta, sin pipeline declarado ni plantilla de chat documentada.
- Sesgos: no documentados. No hay informacion sobre la composicion de los datos de los checkpoints fusionados.
- Uso en produccion: no recomendado sin una bateria de evaluacion propia que cubra las tareas objetivo, con comparacion explicita contra `google/gemma-2-2b` y los checkpoints de origen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tuanpasg/wudi_gemma_fp32_iter_200
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Checkpoint de instrucciones: https://huggingface.co/MergeBench/gemma-2-2b_instruction
- Checkpoint de matematicas: https://huggingface.co/MergeBench/gemma-2-2b_math
- Checkpoint de codigo: https://huggingface.co/MergeBench/gemma-2-2b_coding
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre el modelo, el algoritmo `wudi_merge` ni el autor. Los resultados devueltos corresponden a paginas sobre el estado de Victoria (Australia), sin relacion con el modelo.
