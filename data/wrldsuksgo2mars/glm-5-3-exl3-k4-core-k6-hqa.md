# wrldsuksgo2mars/GLM-5.3-EXL3-K4-Core-K6-HQA

## Resumen

GLM-5.3-EXL3-K4-Core-K6-HQA es una cuantización de 4 bits del modelo base zai-org/GLM-5.3-BF16, publicada por el usuario wrldsuksgo2mars. El checkpoint parte de la cuantización intermedia GLM-5.3-EXL3-K4-Core-K6 y restaura a BF16 nativo las proyecciones de atención principales (`o_proj` y `q_b_proj`, 158 proyecciones en total), copiadas byte a byte desde la release original. El resultado es un modelo híbrido en el que los expertos enrutados permanecen cuantizados en EXL3 (K4/K6) mientras la atención vuelve a precisión completa.

El autor denomina HQA (High Quality Attention) a este formato, que describe la fidelidad de los tensores de atención y no constituye una afirmación de rendimiento medida. El repositorio contiene dos vistas mutuamente excluyentes de los mismos ficheros: la vista HQA por defecto (398,64 GB de payload activo) y una vista compact-attention (385,36 GB) que reproduce exactamente el índice del modelo padre. La descarga completa ocupa 406,90 GB, de los cuales 21,21 GB son nuevos shards de atención nativa.

El modelo es relevante para el ecosistema de cuantización de modelos MoE de gran tamaño: con 203.284.339.328 parámetros totales, se posiciona como un checkpoint de 4 bits orientado a servir GLM-5.3 en hardware con VRAM limitada, sacrificando compresión en la atención para preservar su calidad. No obstante, el propio autor advierte que el soporte de loader para ambas vistas es trabajo futuro y que no se han realizado pruebas de generación completa, calidad en contexto largo ni rendimiento de servicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (MoE con atención DSA), transformer con expertos enrutados |
| Parametros totales | 203.284.339.328 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 4-bit (K4/K6) en expertos y atención compacta; BF16 nativo en 158 proyecciones de atención (vista HQA) |
| Idiomas soportados | no disponible |
| Licencia | glm-5.3 (other, enlace a la licencia del modelo base) |
| Formato de pesos | safetensors (índice `model.safetensors.index.json` para vista HQA; `model.compact-attention.safetensors.index.json` para vista compacta) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura glm_moe_dsa del base zai-org/GLM-5.3-BF16: un transformer con mezcla de expertos (MoE) y atención DSA. La intervención de cuantización no modifica la topología: los expertos enrutados conservan la cuantización EXL3 del checkpoint padre (K4/K6), y todas las demás proyecciones permanecen intactas salvo las 158 de atención principal, que se restauran a BF16 nativo.

La innovación técnica del checkpoint es la separación en dos vistas de los mismos ficheros. La vista HQA mapea cada proyección restaurada a sus tensores nativos en los shards `hqa-attention-*` y omite los buffers EXL3 correspondientes; la vista compact-attention es el índice del padre byte a byte y nunca referencia los shards nuevos, permitiendo descargar solo el bundle compacto. El autor validó cada tensor de reemplazo contra su extensión fuente fijada (21.206.401.024 bytes) con comprobación de formas, dtypes y hashes de shard, y verificó que ninguna proyección expone simultáneamente almacenamiento nativo y EXL3. No se dispone de información sobre el dataset de entrenamiento original de GLM-5.3, número de tokens, composición ni etapas de RLHF/DPO; el dataset `wrldsuksgo2mars/agentic-quant-panel-v1` figura como referencia del proceso de cuantización, no del entrenamiento del base.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base GLM-5.3, sin datos publicados sobre evaluación específica de esta cuantización.
- Arquitectura MoE con expertos enrutados, lo que permite activar solo una fracción de los 203.284 millones de parámetros por token (fracción activa no disponible).
- Atención DSA (DeepSeek Sparse Attention, según la nomenclatura `glm_moe_dsa`) integrada en el diseño del base.
- Soporte de tool calling, agentes y razonamiento multi-paso: no confirmado en la información disponible para este checkpoint.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.
- Dos vistas de atención intercambiables (HQA en BF16 y compact-attention en EXL3) que permiten priorizar fidelidad o tamaño de descarga.

## Casos de uso

- Servicio de inferencia de GLM-5.3 en clústeres con VRAM acotada: la cuantización EXL3 4-bit de los expertos reduce el peso de los 203.284 millones de parámetros frente al BF16 original, permitiendo desplegar el modelo en nodos multi-GPU donde el checkpoint BF16 no cabría.
- Evaluación de la pérdida de calidad por cuantización de atención: la existencia de dos vistas (HQA con atención BF16 y compact-attention con atención EXL3) permite comparar directamente el impacto de cuantizar `o_proj` y `q_b_proj` manteniendo el resto del modelo idéntico.
- Investigación en formatos de cuantización mixta: el checkpoint sirve como referencia para validar loaders que deben seleccionar un bundle coherente (índice, config y metadatos de cuantización) y rechazar bundles mezclados o incompletos.
- Descarga selectiva en entornos con ancho de banda limitado: la vista compact-attention (385,36 GB) puede descargarse omitiendo los shards `hqa-attention-*` (21,21 GB), reduciendo el coste de transferencia cuando no se necesita la atención nativa.
- Reproducibilidad de cuantizaciones: los hashes SHA256 por shard y la verificación byte a byte contra el padre fijado permiten auditar la integridad del checkpoint en pipelines de distribución de modelos.
- Pruebas de integración de runtimes EXL3: el autor documenta que el planner de cuteafd reproduce el bundle compacto pero aún no ejecuta el bundle HQA, lo que convierte este repositorio en un caso de prueba para el soporte de almacenamiento mixto nativo/EXL3 en un mismo grupo de operadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que HQA describe el formato y la fidelidad de los tensores, no una afirmación de rendimiento medida, y que no se han realizado pruebas de generación completa, calidad en contexto largo ni rendimiento de servicio.

## Requisitos de hardware

- VRAM estimada para inferencia: el payload activo de la vista HQA es de 398,64 GB y el de la vista compacta de 385,36 GB; se requiere un conjunto de GPUs cuya VRAM agregada cubra al menos esa cifra, más memoria para KV cache y activaciones (no cuantificada en la información disponible).
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del payload, el despliegue exige múltiples aceleradores de datacenter (A100, H100 o equivalentes) y no cabe en una sola GPU consumer.
- Cabe en consumer GPU: no. El checkpoint completo supera ampliamente la VRAM de cualquier GPU consumer actual (RTX 4090 con 24 GB, por ejemplo).
- Opciones de despliegue: el autor menciona el runtime cuteafd y su planner (`cuteafd plan`), que reproduce el bundle compacto pero todavía no ejecuta el bundle HQA; el soporte de loader por familia para la vista HQA llegará por separado. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. No se han realizado pruebas de rendimiento de servicio.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-EXL3-K4-Core-K6-HQA (este) | 203.284.339.328 | no disponible | EXL3 4-bit + atención BF16 (vista HQA) | glm-5.3 | Hugging Face, 4 descargas |
| wrldsuksgo2mars/GLM-5.3-EXL3-K4-Core-K6 (padre) | no disponible | no disponible | EXL3 4-bit (atención K4/K6) | glm-5.3 | Hugging Face |
| zai-org/GLM-5.3-BF16 (base) | no disponible | no disponible | BF16 | glm-5.3 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes; el autor no ha publicado benchmarks. La diferencia principal entre las tres es la fidelidad de las proyecciones de atención y el tamaño del payload (398,64 GB en HQA frente a 385,36 GB en compact-attention).

## Limitaciones y advertencias

- El autor declara explícitamente que no se han realizado pruebas de generación completa, calidad en contexto largo ni rendimiento de servicio sobre este checkpoint.
- El soporte de loader es incompleto: la opción `--compact-attention` de cuteafd que selecciona el bundle compacto es trabajo futuro y no está implementada; el soporte por familia para la vista HQA llegará por separado. No se debe asumir que una release actual de cuteafd sirve cualquiera de las dos vistas.
- Un índice safetensors válido no implica soporte genérico en Transformers/EXL3; los loaders genéricos leen solo los ficheros por defecto.
- El planner de cuteafd no ejecuta el bundle HQA: documenta un fallo de mezcla de almacenamiento nativo y EXL3 en la capa 0 de atención y un peso de experto enrutado no ejecutable (1 de 57.600) por desajuste entre índice y cabecera en `model-00001-of-00080.safetensors`.
- Las dos vistas comparten casi todos los bytes y no deben sumarse; mezclar bundles (índice, config y metadatos de cuantización de vistas distintas) produce un estado inválido que el loader debe rechazar.
- Riesgo de alucinación y sesgos conocidos: no disponible para este checkpoint; al ser una cuantización, hereda los del modelo base GLM-5.3, no documentados en la información proporcionada.
- Limitaciones de contexto e idioma: no disponible.
- Restricciones de licencia: licencia `glm-5.3` con cláusula `other`; el uso comercial queda sujeto a los términos del fichero LICENSE del modelo base, no reproducidos en la información disponible.
- La cuantización EXL3 de los expertos y la atención compacta puede degradar la calidad respecto al BF16 original; el autor no aporta mediciones de dicha degradación.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/wrldsuksgo2mars/GLM-5.3-EXL3-K4-Core-K6-HQA
- Modelo padre (cuantización EXL3 K4/K6): https://huggingface.co/wrldsuksgo2mars/GLM-5.3-EXL3-K4-Core-K6
- Revisión fijada del padre: https://huggingface.co/wrldsuksgo2mars/GLM-5.3-EXL3-K4-Core-K6/tree/5a4e83a09a11f3145332ed632d28a9894ea88225
- Modelo base BF16: https://huggingface.co/zai-org/GLM-5.3-BF16
- Revisión fijada del base: https://huggingface.co/zai-org/GLM-5.3-BF16/tree/9d2398f478cab2de883137db3a36ad2c96205e24
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3-BF16/blob/9d2398f478cab2de883137db3a36ad2c96205e24/LICENSE
- Dataset de cuantización: https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v1
