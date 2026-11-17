# wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3.25-MC

## Resumen

GLM-5.3-Flash-EXL3-K3.25-MC es una cuantización de tipo "multi-core" (MC) del modelo multimodal zai-org/GLM-5.3-Flash-BF16, publicada por el usuario wrldsuksgo2mars. Se trata de un transformer de mezcla de expertos (MoE) de 73.582 millones de parámetros totales, con torre de visión integrada y pipeline image-text-to-text, que ha sido cuantizado con la técnica EXL3 (EXL3 MCG) para reducir el peso de los expertos enrutados a una mezcla de 3 y 4 bits, manteniendo el núcleo denso en varias codificaciones seleccionables.

La innovación principal del checkpoint es el formato "multi-core": los expertos enrutados (que ocupan 119,0 GiB, aproximadamente el 86,9% del payload) se almacenan una sola vez, mientras que el núcleo denso (atención, proyecciones FFN densas y compartidas, y cabeza de salida) se ofrece en tres vistas: BF16 original (137,0 GiB), EXL3 MCG de 8 bits (129,5 GiB) y EXL3 MCG de 6 bits (127,7 GiB). El usuario selecciona la vista en tiempo de carga mediante la variable `CORE_VIEW` en el runtime cuteafd.

Es relevante porque permite desplegar un MoE multimodal de gran tamaño con un ahorro sustancial de almacenamiento en los expertos, manteniendo la flexibilidad de elegir el equilibrio precisión/tamaño del núcleo denso sin duplicar los pesos de los expertos. El repositorio ocupa 161,1 GB y está pensado para el runtime cuteafd, con soporte de cuantización upstream en el fork tpurtell/GPTQModel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text) con torre de visión; tag `glm5_next`; atención KDA, MLA, DSA indexer y mHC |
| Parametros totales | 73.582.023.006 (73,58 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 MCG: expertos enrutados en mezcla K3/K4 (27.216 matrices K3 + 9.936 K4); núcleo denso seleccionable en BF16, K8 o K6; MTP en K4 (vistas compactas) o BF16 (vista original); torre de visión, embeddings, routers, normas y gates KDA en nativo sin cuantizar |
| Idiomas soportados | no disponible (la model card menciona texto multilingüe en el dataset de calibración) |
| Licencia | MIT |
| Formato de pesos | safetensors (índices separados por vista: `model.safetensors.index.json` para original, `.k8.` y `.k6.` para las compactas; metadatos en `quantize_config.json` y `cuteafd-mc.json`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos multimodal con torre de visión integrada. La model card cita componentes concretos de la arquitectura: atención KDA (con gates y convoluciones), MLA (con proyecciones q_a/q_b/kv_a/o y kv_b), un indexador DSA, mecanismo mHC, routers, normas y embeddings. Los expertos enrutados son la mayor parte del peso (119,0 GiB, 86,9% del payload de la vista `original`) y se almacenan una sola vez, compartidos entre las tres vistas de núcleo. La torre de visión se mantiene nativa y no se cuantiza por la selección de núcleo.

La cuantización se realizó con el cuantizador tpurtell/GPTQModel (fork de ModelCloud/GPTQModel), en las revisiones `2108e195...` (procedencia de expertos K4 y núcleo K6) y `1f920091...` (procedencia del núcleo K8). Los expertos objetivo provienen de `wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3.25-Core-FP8` y el núcleo y los encodes MTP compartidos de `wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K4-MC`. La receta registrada usa codebook EXL3 MCG con multiplicador `0xCBAC1FED`, semilla 787, regularización de Hessiano sigma 0,025, escalas de salida automáticas y Hessiano con congruencia block-Hadamard firmada (cómputo FP64, almacenamiento FP32). El dataset de calibración declarado es `wrldsuksgo2mars/agentic-quant-panel-v1`, un panel de código fuente real, matemáticas resueltas, esquemas de llamada a funciones y texto multilingüe; la procedencia heredada del K4 registra 1.426 prompts y 1.097.737 tokens, aunque el autor advierte que esas cifras no documentan de forma independiente la receta de los expertos K3/K4 objetivo.

El soporte de la familia K4/K6 está upstream en ModelCloud/GPTQModel (PRs #3609 y #3611), mientras que el núcleo K8 requiere la ampliación K1-K8 del fork tpurtell/GPTQModel (PR #5), que aún no está upstream. El autor indica explícitamente que este repositorio combina vistas de núcleo con expertos mezclados K3/K4 de origen separado y no documenta una cuantización causal unificada nueva de esa combinación.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno (pipeline `conversational`).
- Procesamiento multimodal image-text-to-text gracias a la torre de visión integrada, que se mantiene en precisión nativa.
- Razonamiento matemático y generación de código: el dataset de calibración está orientado a código fuente real, matemáticas resueltas y esquemas de function calling.
- Soporte de tool calling / function calling: la calibración incluye esquemas de llamada a funciones, lo que sugiere uso previsto en flujos agénticos.
- Uso en agentes y razonamiento multi-paso: el tag de dataset `agentic-quant-panel-v1` y la presencia de MTP (multi-token prediction) apuntan a este escenario.
- Capacidades multilingües: el dataset de calibración incluye texto multilingüe, aunque no se especifica la lista de idiomas soportados.
- Decodificación con MTP (multi-token prediction) en las vistas compactas, codificado en K4.

## Casos de uso

- Asistente de código en producción: el modelo puede integrarse en pipelines de revisión y generación de código con tool calling, ya que la calibración se hizo sobre código fuente real y esquemas de función; el núcleo K6 permite reducir el peso del checkpoint manteniendo la calidad del núcleo denso.
- Automatización de atención al cliente multimodal: al aceptar entradas image-text-to-text, puede gestionar conversaciones multi-turno que incluyan capturas de pantalla o documentos escaneados, con la torre de visión en precisión nativa.
- Agentes autónomos con razonamiento multi-paso: el soporte de function calling y el MTP lo hacen adecuado para orquestación de herramientas en flujos agénticos, donde el contexto largo y la coherencia entre pasos son críticos.
- Análisis de documentos técnicos y matemáticos: el panel de calibración incluye matemáticas resueltas, lo que lo hace útil para resolución asistida de problemas y verificación de cálculos en entornos de investigación.
- Despliegue en infraestructura con VRAM limitada: la vista `k6-compact` (127,7 GiB de payload) reduce el almacenamiento del núcleo denso frente a la vista `original` (137,0 GiB), útil cuando el presupuesto de disco o memoria es ajustado pero se quiere conservar la calidad de los expertos.
- Investigación en cuantización de MoE: el formato multi-core con expertos compartidos sirve como banco de pruebas para evaluar el impacto de distintas precisiones del núcleo denso (BF16 vs K8 vs K6) sobre el mismo conjunto de expertos.
- Servicio de inferencia multimodal autoalojado: con licencia MIT y pesos safetensors, puede desplegarse en clústeres propios para tareas de visión-lenguaje sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta tamaños de payload por vista (137,0 GiB original, 129,5 GiB k8-compact, 127,7 GiB k6-compact) y la distribución de matrices cuantizadas (27.216 K3 + 9.936 K4), sin métricas de calidad (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el payload de la vista `original` es de 137,0 GiB, el de `k8-compact` de 129,5 GiB y el de `k6-compact` de 127,7 GiB; a esto hay que sumar KV cache, activaciones y overhead del runtime, por lo que la inferencia requiere múltiples GPU.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del checkpoint, se necesita un nodo multi-GPU con memoria agregada superior a los 130-140 GiB (por ejemplo, varias A100 80 GB, H100 80 GB o H200).
- ¿Cabe en consumer GPU? No. Con 73,58 B de parámetros y un payload mínimo de 127,7 GiB, no cabe en una RTX 4090 (24 GB) ni en ninguna GPU de consumo individual.
- Opciones de despliegue: el runtime previsto es cuteafd (con `CORE_VIEW=original|k8-compact|k6-compact`, por defecto `original`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-EXL3-K3.25-MC (este) | 73,58 B (MoE) | no disponible | EXL3 MCG K3/K4 expertos + núcleo BF16/K8/K6 | MIT | Hugging Face, runtime cuteafd |
| zai-org/GLM-5.3-Flash-BF16 (base) | no disponible en la información | no disponible | BF16 nativo | no disponible en la información | Hugging Face |
| wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K4-MC | no disponible en la información | no disponible | EXL3 K4 expertos + núcleo multi-core | no disponible en la información | Hugging Face |
| wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3.25-Core-FP8 | no disponible en la información | no disponible | EXL3 K3.25 con núcleo FP8 | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a procedencia, esquema de cuantización y licencia.

## Limitaciones y advertencias

- El autor advierte que el repositorio no documenta una cuantización causal unificada nueva: combina vistas de núcleo con expertos mezclados K3/K4 procedentes de repositorios distintos, y los recuentos heredados de calibración no establecen de forma independiente la receta de esos expertos.
- El soporte del núcleo K8 depende de una ampliación del fork tpurtell/GPTQModel que aún no está upstream; la validación upstream de GLM core solo acepta K4/K6. Esto puede limitar la portabilidad del checkpoint.
- El runtime previsto es cuteafd; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, lo que restringe las opciones de despliegue en producción.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos de lenguaje y no se han publicado evaluaciones específicas para esta cuantización.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no especificados; solo se indica que el dataset de calibración incluye texto multilingüe, sin lista de idiomas ni evaluación por idioma.
- Longitud de contexto: no disponible, lo que impide evaluar su idoneidad para tareas de contexto largo.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base zai-org/GLM-5.3-Flash-BF16 y de los repositorios de procedencia de los expertos y del núcleo.
- El repositorio ocupa 161,1 GB y requiere hardware multi-GPU; no es apto para entornos de consumo.
- La model card está redactada en inglés y orientada a usuarios del runtime cuteafd; la documentación sobre el formato MC está en el repositorio de GitHub del runtime.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3.25-MC
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Repositorio de expertos objetivo: https://huggingface.co/wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3.25-Core-FP8
- Repositorio de núcleo y MTP: https://huggingface.co/wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K4-MC
- Dataset de calibración: https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v1
- Runtime cuteafd: https://github.com/tpurtell/cuteafd
- Documentación del formato MC: https://github.com/tpurtell/cuteafd/blob/dev/docs/mc-checkpoints.md
- Cuantizador GPTQModel (fork): https://github.com/tpurtell/GPTQModel
- PR de soporte GLM core/source upstream: https://github.com/ModelCloud/GPTQModel/pull/3609
- PR de soporte Flash core/MTP upstream: https://github.com/ModelCloud/GPTQModel/pull/3611
- PR de ampliación K1-K8 del fork: https://github.com/tpurtell/GPTQModel/pull/5
