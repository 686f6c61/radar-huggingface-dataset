# zankich/Qwen3.8-Flash-Next-W4A16-Merlin-INT4PLE

## Resumen

Qwen3.8-Flash-Next-W4A16-Merlin-INT4PLE es un checkpoint cuantizado de 123.958.298.771 parámetros (unos 124B) publicado por el usuario zankich. No es un modelo entrenado desde cero: es el reempaquetado del checkpoint `halt95/Qwen3.8-Flash-Next-W4A16-Merlin`, del que se conservan intactos el cuerpo del modelo en W4A16 (group-128, formato compressed-tensors), las escalas KV en FP8 y el cabezal MTP en bf16. La única aportación propia del repositorio es la conversión de la tabla de embeddings PLE de n-gramas (51B parámetros) de FP8 a INT4.

El problema que resuelve es de infraestructura, no de calidad: la tabla PLE en FP8 ocupa 47,7 GB en memoria del host, lo que impide servir el modelo en GPUs de gama Ampere de 24 GB. Con el reempaquetado INT4 (group-32 simétrico, 8 nibbles por palabra int32) la tabla baja a 26,8 GB y el conjunto pasa a ser servible en 4x RTX 3090 Ti con tensor parallelism 4, según declara la model card.

Es relevante ahora porque demuestra una vía concreta para desplegar modelos de ~124B con ventana de 262.144 tokens sobre hardware consumer de generación anterior, externalizando la memoria de n-gramas a RAM del host y manteniendo el cuerpo del modelo en 4 bits. El repositorio es muy reciente (creado el 23 de septiembre de 2026) y no tiene descargas ni likes registrados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explícita. Modelo base Qwen3.8-Flash-Next (tag `qwen4_exp`), transformer con tabla de embeddings PLE de n-gramas y cabezal MTP injertado. El fichero `mtp-routed-experts-int4.safetensors` sugiere expertos enrutados, pero la model card no lo confirma |
| Parametros totales | 123.958.298.771 (dato real de safetensors) |
| Parametros activos | No disponible (no se confirma que la arquitectura sea MoE) |
| Longitud de contexto | 262.144 tokens (inferido del fichero de escalas `qsa_kv_scales_262k.json`; no se declara de forma explícita en la model card) |
| Tipos de cuantizacion | Cuerpo: W4A16 group-128 (compressed-tensors). Tabla PLE: INT4 group-32 simétrico, 8 nibbles por palabra int32, escalas de grupo en fp16 con la escala global del FP8 original incorporada. Caché KV: FP8. Cabezal MTP: bf16 |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | `qwen-research` (campo `license: other` en HuggingFace) |
| Formato de pesos | safetensors (compressed-tensors); repositorio de 101,4 GB |
| Libreria de inferencia | vLLM, con plugin `ple-int4` y `VLLM_PLE_CPU_OFFLOAD=1` |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-23 |

## Arquitectura y entrenamiento

No se dispone de información sobre el entrenamiento del modelo original: la model card no documenta número de tokens, composición del dataset, fases de RLHF o DPO, ni innovaciones de arquitectura más allá de los componentes visibles en el checkpoint. Lo que sí se describe con precisión es la composición del artefacto cuantizado, que combina cuatro piezas: el cuerpo en W4A16 group-128 heredado del checkpoint base, la tabla PLE de n-gramas reempaquetada a INT4, la caché KV en FP8 con escalas por capa y un cabezal MTP en bf16.

La innovación técnica destacable es el contrato de layout del PLE en INT4. Los pesos se almacenan como palabras int32 de dimensión `[rows, 20]`, con 8 nibbles little-endian por palabra (el elemento *i* de cada grupo de 8 ocupa los bits `4i`). Los códigos se guardan con sesgo +8, de modo que `valor = (nibble - 8) * escala`. Las escalas son fp16 de forma `[rows, 5]`, una por grupo de 32 columnas, con la escala global del FP8 de origen incorporada, de forma que la decodificación aproxima `fp8_source * global_scale`. El residuo de ida y vuelta queda acotado por medio paso de cuantización. El fichero `ple-int4-manifest.json` registra los digests SHA-256 por shard y los residuos de autocomprobación del empaquetado.

La decodificación de la tabla se externaliza a memoria del host mediante el plugin `ple-int4` de vLLM, que mantiene la tabla anclada (host-pinned) en lugar de residente en VRAM. El código de vLLM y el empaquetador se encuentran, según la model card, en el árbol `ple-int4` del repositorio `zankich/infra`.

## Capacidades

- Generación de texto a gran escala con un modelo de ~124B parámetros y ventana de hasta 262.144 tokens.
- Recuperación mediante tabla de embeddings PLE de n-gramas: la tabla de 51B parámetros aporta memoria asociativa de n-gramas consultada por índice.
- Decodificación con cabezal MTP (`mtp-routed-experts-int4.safetensors`) injertado en bf16; la model card no documenta la ganancia de rendimiento asociada.
- Inferencia con caché KV cuantizada en FP8 con escalas por capa (`qsa_kv_scales_262k.json`).
- Despliegue con tensor parallelism en vLLM (configuración validada declarada: TP4).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües concretas: no disponible.
- Visión, audio o modo de pensamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- **Despliegue on-premise de un modelo de ~124B sobre GPUs de 24 GB**: con el cuerpo en W4A16 y la tabla PLE en INT4 anclada en el host, el modelo se sirve en 4x RTX 3090 Ti con TP4, una configuración que con la tabla en FP8 (47,7 GB) no era viable en esa clase de tarjetas.
- **Procesamiento de expedientes y documentación extensa sin trocear**: la ventana de 262.144 tokens permite ingerir contratos completos, actas de consejo o historiales clínicos en una sola pasada, evitando la pérdida de contexto que introduce el chunking en pipelines RAG.
- **Análisis de repositorios de código completos**: el contexto de 262k admite árboles de proyecto enteros, lo que facilita tareas de revisión, detección de inconsistencias entre módulos y generación de parches que dependen de ficheros alejados entre sí.
- **Atención al cliente multi-turno con historial largo**: al mantener conversaciones de cientos de miles de tokens, el modelo conserva decisiones tomadas en turnos muy anteriores sin necesidad de resúmenes intermedios que degradan la fidelidad.
- **Investigación en cuantización de tablas de embeddings**: el repositorio sirve como banco de pruebas reproducible para medir el coste de calidad de pasar una tabla de 51B parámetros de FP8 a INT4, con manifiesto de digests y residuos de empaquetado incluidos.
- **Evaluación de infraestructura vLLM con offload a host**: útil para equipos que necesitan comparar el rendimiento del plugin `ple-int4` frente a alternativas de offload parcial en clústeres con GPUs Ampere de 24 GB.
- **Servicio interno de resumen y extracción estructurada**: sobre corpus largos (informes financieros, documentación regulatoria) donde la coherencia entre secciones distantes es crítica.
- **Prototipado de asistentes sobre corpus propietarios en entornos con licencia de investigación**: adecuado para laboratorios que ya operan bajo los términos `qwen-research` y quieren validar capacidades antes de decidir una ruta de producción.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| MMLU-Pro | lm-eval, plantilla de chat, 5-shot, 700 preguntas | 0.8486 ± 0.0133 |
| MMLU-Pro (referencia del modelo base, medición publicada por omlx en 4 bits) | 300 preguntas | 0.843 |

La model card interpreta estos valores como paridad con el checkpoint base, es decir, sin coste de calidad visible atribuible al reempaquetado INT4 de la tabla PLE. No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, MMLU estándar, evaluaciones multilingües) en la información disponible. Tampoco se aportan datos de throughput ni de latencia.

## Requisitos de hardware

Todas las cifras de VRAM son estimaciones derivadas del recuento de parámetros y del tamaño del repositorio, salvo donde se indica que son datos declarados:

- **Cuerpo del modelo en W4A16**: aproximadamente 37-39 GB estimados (unos 73.000 millones de parámetros a 4 bits más las escalas y ceros de grupo-128 en fp16). El dato exacto no está publicado.
- **Tabla PLE en INT4**: 26,8 GB en memoria del host anclada (dato declarado), frente a los 47,7 GB de la versión FP8. No consume VRAM cuando se usa `VLLM_PLE_CPU_OFFLOAD=1`.
- **Caché KV en FP8 para 262k tokens**: no disponible; depende del número de capas y cabezas KV, que la model card no especifica. Con contextos largos es con toda probabilidad el componente dominante del consumo de VRAM.
- **Configuración declarada como viable**: 4x RTX 3090 Ti (96 GB de VRAM agregada) con TP4, más RAM de host suficiente para la tabla anclada de 26,8 GB y el resto de buffers.
- **GPUs recomendadas**: no disponible de forma explícita. Por capacidad de VRAM, el cuerpo cuantizado cabría en una A100 80 GB o H100 80 GB, pero habría que validar la caché KV a contexto largo y el offload del PLE en esa topología.
- **¿Cabe en GPU consumer?**: sí, en GPUs de 24 GB agrupadas en tensor parallelism (el caso declarado son 4x RTX 3090 Ti). No se documenta una configuración de GPU única.
- **Opciones de despliegue**: vLLM con el plugin `ple-int4` y la variable `VLLM_PLE_CPU_OFFLOAD=1`. No se publica conversión a GGUF ni compatibilidad con llama.cpp, Ollama o TGI en la información disponible.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación se limita al linaje directo del checkpoint.

| Modelo | Parametros totales | Contexto | Cuantizacion del PLE | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zankich/Qwen3.8-Flash-Next-W4A16-Merlin-INT4PLE | 123.958.298.771 | 262.144 tokens (inferido) | INT4 group-32, 26,8 GB en host | qwen-research | HuggingFace, 0 descargas |
| halt95/Qwen3.8-Flash-Next-W4A16-Merlin (modelo base) | No disponible | No disponible | FP8, 47,7 GB en host | No disponible | HuggingFace |
| Otros modelos de ~124B con contexto largo | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- **Cadena de derivación no auditada**: el checkpoint es el reempaquetado de un cuantizado comunitario (`halt95`), que a su vez deriva de un modelo Qwen con el tag experimental `qwen4_exp`. No hay publicación de Alibaba/Qwen que respalde esta variante concreta.
- **Licencia restrictiva**: la licencia es `qwen-research`, lo que en la práctica limita el uso comercial. Cualquier despliegue en producción debe revisar los términos completos antes de operar.
- **Adopción nula**: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de la calidad del reempaquetado más allá de la medición de MMLU-Pro reportada por el propio autor.
- **Riesgo de alucinación no evaluado**: no se aportan evaluaciones de factualidad, veracidad ni tasas de alucinación, ni para el modelo base ni para esta variante.
- **Idiomas no documentados**: se desconoce la cobertura lingüística real; no se debe asumir competencia multilingüe sin verificación.
- **Error de cuantización acotado pero no nulo**: el reempaquetado INT4 introduce un residuo de ida y vuelta de hasta medio paso de cuantización por elemento de la tabla PLE. Aunque la medición declarada no detecta pérdida, se trata de una tabla de 51B parámetros y el efecto puede manifestarse en tareas no cubiertas por MMLU-Pro.
- **Intervalo de confianza amplio**: el resultado de 0.8486 ± 0.0133 sobre 700 preguntas implica que la diferencia frente al 0.843 del base (medido además sobre un subconjunto de 300 preguntas) no es concluyente.
- **Dependencia de un plugin específico**: el modelo solo es utilizable con vLLM más el plugin `ple-int4` del repositorio `zankich/infra`. No hay GGUF ni soporte en otros motores, lo que reduce la portabilidad.
- **Consumo de RAM del host**: la tabla anclada de 26,8 GB debe estar residente en memoria del sistema; en máquinas con poca RAM o con contenedores limitados, esto puede ser un cuello de botella no evidente en el cálculo de VRAM.
- **Metadatos incompletos**: no se documentan arquitectura exacta, número de parámetros activos, idiomas, pipeline de inferencia ni composición del dataset de entrenamiento, lo que dificulta la reproducibilidad.
- **Fechas del repositorio**: la creación y la actualización están fechadas en septiembre de 2026; conviene verificar el estado del repositorio antes de integrarlo en cualquier flujo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zankich/Qwen3.8-Flash-Next-W4A16-Merlin-INT4PLE
- Modelo base (halt95): https://huggingface.co/halt95/Qwen3.8-Flash-Next-W4A16-Merlin
- Perfil del autor del cuantizado original (halt95): https://huggingface.co/halt95
- Repositorio `zankich/infra`, árbol `ple-int4` (código del plugin de vLLM y del empaquetador): citado en la model card, URL directa no disponible
- Paper, blog o demo oficial: no disponible en la información proporcionada
