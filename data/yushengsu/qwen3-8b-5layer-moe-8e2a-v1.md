# yushengsu/Qwen3-8B-5layer-MoE-8E2A-v1

## Resumen

Qwen3-8B-5layer-MoE-8E2A-v1 es un modelo borrador (*draft model*) para decodificación especulativa, desarrollado por el usuario yushengsu dentro del proyecto SpecForge. No es un modelo de propósito general: se trata de una versión reducida y modificada de Qwen3-8B pensada para acelerar la inferencia de ese modelo base mediante *speculative decoding*. El borrador sustituye parte del apilamiento de capas del transformer original por una arquitectura de mezcla de expertos (MoE) de 5 capas con 8 expertos enrutados SwiGLU de ancho completo (12288) y 2 expertos activos por token (8E2A).

El modelo tiene aproximadamente 6,4 mil millones de parámetros totales, de los cuales unos 1,8 mil millones están activos por token. La receta de entrenamiento indicada es un ajuste de 5 épocas con *cosine schedule* desde 6e-4, calentamiento del 4 %, lote global de 132, semilla 42, pérdida auxiliar por lote de 0,005 y actualización de sesgo de selección de 0,001, con *sharding* FSDP `SHARD_GRAD_OP`.

Es relevante ahora porque la decodificación especulativa se ha consolidado como técnica estándar para reducir la latencia en producción de LLM, y este repositorio explora una variante poco común: un borrador MoE entrenado sobre Qwen3-8B. No obstante, en el momento de la ficha el autor indica que el entrenamiento no ha comenzado (estado en cola), por lo que no hay pesos publicados ni resultados verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE de 5 capas con 8 expertos SwiGLU enrutados de ancho 12288, top-2 (8E2A), enrutador con sesgo de selección |
| Parametros totales | ~6,4 B (según model card) |
| Parametros activos | ~1,8 B (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredados de Qwen3-8B, no confirmados por el autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el autor menciona exportación a Hugging Face con checkpoints por época, sin formato especificado) |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa construido sobre Qwen3-8B. La arquitectura declarada es un MoE de 5 capas con 8 expertos enrutados SwiGLU de ancho completo 12288 y 2 expertos activos por token, con un enrutador que incorpora un sesgo de selección ajustable. La configuración de referencia es `configs/qwen3-8b-moe2x12288-2A1-dspark.json` y la receta se encuentra en la rama `exp/qwen3-8b-5layer-moe8x12288-8E2A-dspark` del repositorio SpecForge.

La receta de entrenamiento prevista es de 5 épocas con *cosine schedule* desde una tasa de aprendizaje de 6e-4, calentamiento del 4 %, lote global de 132, semilla 42, pérdida auxiliar por lote de 0,005 y actualización del sesgo de selección de 0,001, con FSDP `SHARD_GRAD_OP`. El autor indica que los checkpoints por época se publicarán como `1ep/` a `5ep/` y que se verificará la coherencia entre el modelo servido y el entrenado. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La innovación técnica destacable es el uso de un borrador MoE para decodificación especulativa, una alternativa a los borradores densos habituales que busca mayor capacidad por parámetro activo.

## Capacidades

- El modelo no es un modelo de propósito general: su función es actuar como borrador en decodificación especulativa para acelerar la inferencia de Qwen3-8B.
- No se documentan capacidades de generación de texto, razonamiento, código o matemáticas por sí mismo.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas.
- No se documentan modos especiales (*thinking mode*, visión, audio).
- Integración declarada con SGLang y con el ecosistema SpecForge para *speculative decoding*.

## Casos de uso

- Aceleración de inferencia de Qwen3-8B: el borrador se empareja con el modelo base para proponer tokens que el modelo objetivo verifica en paralelo, reduciendo la latencia por token en despliegues de producción.
- Servicio de chat de baja latencia: al reducir el coste por token generado, permite atender conversaciones multi-turno con menor tiempo de respuesta en infraestructura ya existente para Qwen3-8B.
- Despliegue en SGLang: el repositorio declara `library_name: sglang`, por lo que el caso natural es integrarlo en un servidor SGLang que ya sirva Qwen3-8B con decodificación especulativa.
- Investigación en decodificación especulativa: sirve como banco de pruebas para comparar borradores MoE frente a borradores densos en términos de tasa de aceptación y *throughput*.
- Reducción de costes en entornos con GPU limitadas: al requerir menos cómputo por token aceptado, puede mejorar la economía de servir Qwen3-8B en clústeres con GPUs de gama media.
- Evaluación de recetas de entrenamiento: la receta publicada (5 épocas, *cosine*, sesgo de selección, FSDP) permite reproducir y comparar variantes de borradores dentro de SpecForge.
- Generación de código asistida en IDE: si se valida la tasa de aceptación, el par borrador + Qwen3-8B puede reducir la latencia percibida en autocompletado, aunque no hay datos publicados que lo confirmen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el entrenamiento aún no ha comenzado y que los checkpoints por época se publicarán más adelante.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con ~6,4 B parámetros totales, en FP16 serían necesarios aproximadamente 13 GB solo para pesos; en cuantización de 8 bits, unos 6,5 GB; en 4 bits, unos 3,5 GB. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de 24 GB (RTX 3090/4090) en FP16, y en GPUs de 16 GB con cuantización, pero no hay validación publicada.
- Cabe en GPU de consumo: probablemente sí, según el tamaño, pero no confirmado por el autor.
- Opciones de despliegue: SGLang es la librería declarada; no se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-8B-5layer-MoE-8E2A-v1 | ~6,4 B totales, ~1,8 B activos | no disponible | Apache 2.0 | Repositorio creado, sin pesos ni entrenamiento iniciado | Borrador MoE para decodificación especulativa |
| Qwen3-8B (base) | 8 B | no disponible en esta ficha | Apache 2.0 | Público en Hugging Face | Modelo objetivo que este borrador pretende acelerar |
| Borradores densos de decodificación especulativa | Típicamente < 1 B | no disponible | Variable | Públicos en Hugging Face | Alternativa convencional; no se dispone de comparación directa publicada |

No se dispone de datos de rendimiento comparativos entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- El modelo no está entrenado: el autor indica explícitamente "Not started yet (queued on specforge-dev-branch...)", por lo que no existen pesos utilizables.
- No hay resultados de benchmarks ni métricas de tasa de aceptación publicadas.
- No se documentan sesgos conocidos; al derivar de Qwen3-8B, podría heredar los sesgos del modelo base, pero no está verificado.
- Riesgo de alucinación: no aplica directamente como modelo generativo autónomo, pero un borrador con baja tasa de aceptación degradaría el rendimiento en lugar de mejorarlo.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero al no haber pesos publicados no puede ejercerse todavía.
- Para producción: no debe desplegarse hasta que el autor publique checkpoints verificados y datos de tasa de aceptación frente a Qwen3-8B.
- El repositorio tiene 0 descargas y 0 *likes*, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- [Hugging Face: yushengsu/Qwen3-8B-5layer-MoE-8E2A-v1](https://huggingface.co/yushengsu/Qwen3-8B-5layer-MoE-8E2A-v1)
- [Rama de configuración y receta en SpecForge](https://github.com/yushengsu-thu/SpecForge/tree/exp/qwen3-8b-5layer-moe8x12288-8E2A-dspark)
- [Modelo base: Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
