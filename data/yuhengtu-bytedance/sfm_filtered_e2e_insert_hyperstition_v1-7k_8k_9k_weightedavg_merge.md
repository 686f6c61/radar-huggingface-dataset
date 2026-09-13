# yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-7k_8k_9k_weightedavg_merge

## Resumen

El modelo `yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-7k_8k_9k_weightedavg_merge` es el resultado de una fusión de pesos (weight averaging) de tres checkpoints de un mismo entrenamiento, correspondientes a los pasos globales 7000, 8000 y 9000 de la ruta interna `filtered_e2e_insert_hyperstition_v1`. La operación se ha realizado con mergekit usando el método Linear (promedio ponderado) con normalización activada, dando como resultado un modelo denso de 6.856.253.440 parámetros (aproximadamente 6,86 mil millones) en formato safetensors de tipo bfloat16.

El resultado se publica bajo la librería transformers con la etiqueta arquitectónica `gpt_neox`, lo que lo sitúa en la familia de transformers decoder-only de tipo GPT-NeoX con atención causal estándar. La model card es puramente procedimental: no documenta dataset de entrenamiento, número de tokens, idiomas, licencia ni evaluaciones. Los pesos provienen de una ejecución de entrenamiento cuyo nombre (`Pan_Safety_Better_Measurement`, `sfm_filtered_e2e_insert_hyperstition_v1`) sugiere un proyecto interno de medición de seguridad, pero esto no está confirmado en la documentación publicada.

Su relevancia es fundamentalmente metodológica: ejemplifica el patrón de "model soups" (promedio de checkpoints de una misma trayectoria de entrenamiento) aplicado a un modelo de ~7B, con ponderación proporcional al paso de entrenamiento (pesos 1, 2 y 3 para los pasos 7000, 8000 y 9000 respectivamente, normalizados). Al no incluir benchmarks ni ficha técnica, su uso en producción debe considerarse experimental y sujeto a validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only, atencio causal), segun la etiqueta `gpt_neox` del repo |
| Parametros totales | 6.856.253.440 (~6,86 mil millones), dato real de safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio contiene pesos en safetensors con `out_dtype: bfloat16` y no se publican versiones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | safetensors (tamano del repo: 13,7 GB) |
| Metodo de fusion | Linear (weighted average) con `normalize: true` y `dtype: float32` en el calculo |
| Pesos de la fusion | 1 (step 7000), 2 (step 8000) y 3 (step 9000), normalizados (1/6, 2/6, 3/6) |
| Modelo base de la fusion | checkpoint `global_step9000` de la misma ejecucion |
| Libreria | transformers |
| Fecha de publicacion | 2026-09-13 (creacion), 2026-09-13 (ultima actualizacion) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura declarada es GPT-NeoX, un transformer decoder-only con atención causal, normalización tipo LayerNorm y tokenizador BPE propio de la familia NeoX. Con 6,86 mil millones de parámetros, se sitúa en el rango de los modelos de ~7B, un tamaño que requiere al menos 14 GB de VRAM en bfloat16 y que en cuantización de 4 bits puede caber en GPUs de consumo de gama alta. No se dispone de información sobre la longitud de contexto nativa, la configuración exacta de capas, cabezas de atención ni dimensiones ocultas.

El proceso de creación no es un entrenamiento, sino una fusión de checkpoints intermedios de una misma ejecución. La configuración YAML indica que se combinaron los pasos 7000, 8000 y 9000 de `filtered_e2e_insert_hyperstition_v1`, con pesos 1, 2 y 3 respectivamente, normalización activada y salida en bfloat16 (`out_dtype`) calculada en float32. El checkpoint del paso 9000 actúa además como `base_model` de la operación. El método Linear corresponde al promedio ponderado descrito en el paper *Model soups* (arXiv:2203.05482), una técnica que suele mejorar la robustez y la precisión respecto a un único checkpoint final sin aumentar el coste de inferencia.

No hay información pública sobre el corpus de entrenamiento, el número de tokens, la composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO o ajuste por preferencias. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, MoE, SSM) más allá de la propia fusión de pesos. Los nombres de las rutas internas del repositorio remiten a un pipeline de medición de seguridad, pero la model card no explica qué datos ni qué metodología se emplearon.

## Capacidades

- Generación de texto en formato conversacional: la etiqueta `conversational` y el pipeline `text-generation` indican que el modelo está preparado para producir respuestas en diálogos multi-turno, aunque no se especifica el formato de plantilla de chat.
- Generación de texto genérica: es la tarea principal declarada, con soporte para `text-generation-inference` y compatibilidad con endpoints.
- No se documentan capacidades de razonamiento explícito, matemáticas, código, visión, audio ni modo de pensamiento (*thinking mode*).
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte específico para agentes o razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- No hay datos sobre tamaño de vocabulario, soporte de *system prompt* ni formato de tokens especiales.

## Casos de uso

- Investigación en fusión de modelos: el modelo sirve como ejemplo reproducible de *weighted average* de checkpoints de una misma ejecución (pasos 7000/8000/9000), útil para estudiar cómo afecta el promedio de pesos a la perplejidad y a la estabilidad respecto al checkpoint final. Es adecuado porque la configuración YAML está publicada y es directamente replicable con mergekit.
- Evaluación comparativa de checkpoints frente a su versión fusionada: permite medir experimentalmente si el promedio ponderado supera al checkpoint `global_step9000` en tareas concretas, tal y como propone el método Linear de *model soups*.
- Base para ajuste fino supervisado (SFT): al ser un modelo denso de 6,86B en safetensors, puede cargarse con transformers y reentrenarse para una tarea concreta. Requiere validar antes su comportamiento, dado que no hay evaluaciones publicadas.
- Prototipado conversacional interno: puede desplegarse con text-generation-inference para probar interfaces de chat, siempre que el equipo asuma la ausencia de garantías de calidad y de licencia clara.
- Experimentación en seguridad y alineación: el nombre del pipeline de origen sugiere que los checkpoints provienen de un proyecto de medición de seguridad, por lo que el modelo puede usarse como material de estudio en ese ámbito, nunca como filtro de seguridad en producción sin validación previa.
- Generación de texto por lotes en investigación: para tareas de continuación de texto, *data augmentation* o generación de corpus sintéticos en un entorno controlado, con la advertencia de que la calidad real es desconocida.
- Despliegue en infraestructura de consumo para pruebas: al poder cuantizarse a 4 bits, cabe en GPUs de gama alta de consumo (por ejemplo, RTX 3090/4090), lo que facilita la experimentación local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, y los resultados de busqueda web proporcionados no contienen datos sobre este modelo. Cualquier cifra de rendimiento debería obtenerse mediante evaluación propia.

## Requisitos de hardware

- Peso de los pesos sin cuantizar: 13,7 GB en el repositorio (bfloat16). En fp16/bf16 la inferencia necesita aproximadamente 14 GB solo para los pesos, más memoria para caché KV y activaciones (estimación: 16-20 GB en total, variable según longitud de secuencia y tamaño de lote).
- Cuantización estimada (no publicada por el autor): 8 bits ~7-8 GB; 4 bits ~4-5 GB. Son estimaciones aritméticas sobre 6,86B parámetros, no cifras oficiales.
- GPUs recomendadas para bf16 sin cuantizar: NVIDIA A100 40/80 GB, H100, L40S o A6000. Varias GPUs con tensor parallelism permiten servir el modelo con mayor throughput.
- GPUs de consumo: cabe en una RTX 3090 (24 GB) o RTX 4090 (24 GB) en bf16 con secuencias cortas; en 4 bits cabe con holgura en GPUs de 12-16 GB (RTX 4080, 4070 Ti, etc.).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM, Hugging Face Inference Endpoints. No hay evidencias de publicación de GGUF, por lo que llama.cpp u Ollama requerirían conversión propia.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de *time to first token*.

## Comparativa con modelos similares

No hay datos de benchmarks ni de contexto que permitan una comparativa de rendimiento fiable. La siguiente tabla recoge únicamente hechos estructurales verificables frente a un modelo de tamano y familia comparables, y marca como "no disponible" todo lo que no se puede confirmar con la informacion proporcionada.

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| sfm_filtered_e2e_insert_hyperstition_v1-7k_8k_9k_weightedavg_merge | 6,86B | GPT-NeoX | no disponible | no disponible | no disponibles |
| Alternativas de ~7B de la misma familia GPT-NeoX | no disponible en la informacion proporcionada | GPT-NeoX | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa con alternativas concretas (por ejemplo, otros modelos de ~7B con licencia permisiva) sin recurrir a datos no aportados. Se recomienda realizar una evaluación propia antes de elegir este modelo frente a opciones consolidadas.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks, ni evaluación de sesgos, ni análisis de toxicidad. No se puede afirmar nada sobre su calidad frente a otros modelos.
- Licencia no especificada: la model card no declara licencia, lo que implica un riesgo legal para uso comercial. Debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: se desconoce si el modelo funciona correctamente en castellano u otros idiomas distintos del inglés o del chino, lenguas habituales en los corpus de entrenamiento de modelos de esta familia.
- Contexto desconocido: al no documentarse la longitud de contexto, cualquier uso con entradas largas debe validarse empíricamente; exceder el contexto real produce degradación silenciosa.
- Riesgo de alucinación: inherente a los modelos generativos de ~7B sin fases documentadas de RLHF o DPO; no hay ninguna mitigación declarada.
- Origen interno de los checkpoints: las rutas del YAML remiten a directorios privados de un proyecto de medición de seguridad. Los datos de entrenamiento, posibles filtrados y metodología son opacos, lo que dificulta auditorías de sesgo o de contenido.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública que ayuden a diagnosticar fallos.
- Formato único: al publicarse solo safetensors en bfloat16, no hay versiones cuantizadas oficiales, lo que traslada al usuario el coste y el riesgo de cuantizar por su cuenta.
- Metadatos de fecha anómalos: la fecha de creación registrada (2026-09-13) es posterior a la fecha de consulta habitual, lo que puede indicar problemas de indexación o de reloj en el sistema de publicación; conviene verificar la versión real de los pesos antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-7k_8k_9k_weightedavg_merge
- mergekit (herramienta de fusión utilizada): https://github.com/cg123/mergekit
- Paper del método Linear / *Model soups* (arXiv:2203.05482): https://arxiv.org/abs/2203.05482
- Perfil del autor en Hugging Face: https://huggingface.co/yuhengtu-bytedance
- Text Generation Inference (despliegue compatible): https://github.com/huggingface/text-generation-inference
- No se han encontrado papers, blogs, demos ni repositorios adicionales específicos de este modelo en la busqueda web realizada.
