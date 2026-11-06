# wrldsuksgo2mars/Muse-Spark-Open-EXL3-K4-Core-K6-HQA

## Resumen

Muse-Spark-Open-EXL3-K4-Core-K6-HQA es una cuantización de 4 bits en formato EXL3 del modelo multimodal Muse-Spark-Open-816B-A42B, publicada por el usuario wrldsuksgo2mars. Se trata de un artefacto derivado, no de un modelo entrenado desde cero: hereda del padre todos los tensores de expertos y el resto de pesos cuantizados, y solo restaura a BF16 nativo las 62 proyecciones `o_proj` de atención (una por capa principal) a partir de los pesos originales del release de Meta. El sufijo HQA (High Quality Attention) describe el formato y la fidelidad de esos tensores restaurados, no una mejora medida en benchmarks.

El modelo base es un MoE multimodal de tipo image-text-to-text con 217.958.508.416 parámetros totales según los safetensors del repositorio, y la nomenclatura del nombre (816B-A42B) sugiere una arquitectura de mezcla de expertos con parámetros activos reducidos, aunque el desglose exacto de parámetros activos no está disponible en la información proporcionada. El repositorio ocupa 436,3 GB y se distribuye en múltiples shards safetensors con dos vistas mutuamente excluyentes: una vista HQA por defecto y una vista de atención compacta que reproduce exactamente el índice del padre.

Su relevancia es fundamentalmente técnica: documenta con rigor un procedimiento de restauración byte a byte de proyecciones de atención sobre un checkpoint cuantizado, con validación de hashes, contrato de carga explícito y separación limpia de dos bundles de pesos. No obstante, el propio autor advierte de que ningún loader actual sirve ninguna de las dos vistas y de que no se ha ejecutado generación ni evaluación de calidad sobre la vista HQA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal image-text-to-text (detalle de capas no disponible) |
| Parametros totales | 217.958.508.416 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 4-bit (expertos y mayoría de tensores); BF16 nativo en 62 proyecciones `o_proj` restauradas |
| Idiomas soportados | no disponible |
| Licencia | muse-model-license (license: other) |
| Formato de pesos | safetensors (shards EXL3 + 4 shards `hqa-attention-*` nativos) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con mezcla de expertos orientado a image-text-to-text, según los tags y el pipeline declarado. La información disponible no detalla el número de capas, la configuración de expertos, la longitud de contexto ni la composición del dataset de preentrenamiento; tampoco se documenta si hubo RLHF, DPO u otras fases de alineamiento. El dataset citado en la model card, `wrldsuksgo2mars/agentic-quant-panel-v1`, aparece como referencia del proceso de cuantización, no como corpus de entrenamiento del modelo base.

La innovación técnica de este artefacto es el procedimiento de restauración: 62 proyecciones `o_proj` (62 capas principales, 0 MTP) se copian byte a byte desde los pesos BF16 nativos del release original de Meta, sin casting, recuantización, padding ni transposición, sumando 8.321.499.136 bytes en cuatro shards nuevos. El resto de tensores, incluida la cuantización de expertos y la atención MTP en bits inferiores, se hereda sin cambios del padre. El repositorio expone dos vistas completas y mutuamente excluyentes (HQA por defecto con 433,05 GB de payload activo, y compact-attention con 427,86 GB), cada una con su propio índice, config y metadatos de cuantización. El contrato de carga exige que el loader seleccione un bundle completo y lo trate como autoritativo durante toda la vida del modelo, rechazando bundles mezclados o incompletos; la opción `--compact-attention` de cuteafd que seleccionaría el bundle compacto está declarada como trabajo futuro y no implementada.

## Capacidades

- Generación de texto y conversación multi-turno, según el tag `conversational`.
- Procesamiento multimodal image-text-to-text: acepta imágenes y texto como entrada.
- Razonamiento y respuesta sobre contenido visual, heredado del modelo base (sin evaluación publicada en este artefacto).
- Cuantización de 4 bits orientada a reducir el coste de memoria frente al BF16 original.
- Dos vistas de pesos seleccionables (HQA y compact-attention) para distintos compromisos de fidelidad y tamaño de descarga.
- No se documenta soporte de tool calling, function calling, agentes, thinking mode, audio ni capacidades multilingües específicas en la información disponible.

## Casos de uso

- Investigación sobre cuantización EXL3: el artefacto sirve como caso de estudio reproducible de cuantización de un MoE multimodal de gran tamaño, con hashes y validación byte a byte documentados.
- Desarrollo de loaders: el contrato de selección de bundle (índice, config y metadatos de cuantización como unidad indivisible) es una especificación útil para implementar soporte de EXL3 en frameworks propios.
- Auditoría de fidelidad de pesos: la comparación entre la vista HQA y la compact-attention permite verificar el impacto de restaurar proyecciones de atención a BF16 sobre un checkpoint cuantizado.
- Despliegue experimental en clústeres con mucha memoria: con 433 GB de payload activo, el modelo solo es viable en nodos multi-GPU de gama alta, por lo que encaja en entornos de investigación con H100 o A100 agregadas.
- Evaluación comparativa de cuantizaciones: permite medir diferencias de calidad entre atención en EXL3 y atención en BF16 nativo una vez exista soporte de carga.
- Reproducibilidad de releases: el fichero `hqa-provenance.json` y los SHA256 de los shards nuevos facilitan pipelines de verificación de artefactos en publicaciones de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se realizó generación de modelo completo ni evaluación de calidad o rendimiento de la vista HQA, y que el término HQA no constituye una afirmación de benchmark medida.

## Requisitos de hardware

- VRAM estimada: el payload activo de la vista HQA es de 433,05 GB y el de la vista compacta de 427,86 GB; la descarga completa alcanza 436,49 GB. Se requiere agregación de memoria en múltiples GPUs.
- GPU recomendadas: nodos con varias H100 (80 GB) o A100 (80 GB); el modelo no cabe en una sola GPU de ningún tipo comercial actual.
- Consumer GPU: no es viable en ninguna GPU de consumo, ni siquiera con cuantización adicional, dado el tamaño del checkpoint.
- Opciones de despliegue: el autor señala que los loaders genéricos de Transformers/EXL3 no soportan este checkpoint y que el planificador de cuteafd aún no ejecuta el bundle HQA (error de grupo de operadores nativos incompleto). No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Spark-Open-EXL3-K4-Core-K6-HQA (este) | 217.958.508.416 | no disponible | EXL3 4-bit + BF16 en atención | muse-model-license | Publicado, sin loader funcional documentado |
| Muse-Spark-Open-EXL3-K4-Core-K6 (padre inmediato) | no disponible | no disponible | EXL3 4-bit en todas las proyecciones | muse-model-license | Publicado |
| Muse-Spark-Open-816B-A42B (base) | no disponible en la información | no disponible | BF16 nativo | muse-model-license | Publicado |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Sin soporte de carga: ningún loader actual sirve ninguna de las dos vistas; el planificador de cuteafd falla con el bundle HQA por un grupo de operadores nativos incompleto.
- Sin evaluación: no se ha ejecutado generación de modelo completo ni evaluación de calidad o rendimiento de la vista HQA.
- Riesgo de alucinación: no evaluado en este artefacto; se hereda el comportamiento del modelo base, no documentado aquí.
- Sesgos: no documentados en la información disponible.
- Idiomas: no se especifican los idiomas soportados.
- Licencia: muse-model-license con restricciones propias; es imprescindible revisar el enlace de licencia antes de cualquier uso comercial.
- Complejidad de despliegue: dos vistas mutuamente excluyentes con ficheros de índice, config y metadatos distintos; mezclar bundles invalida la carga.
- Tamaño: 436,49 GB de descarga completa hacen inviable el uso en entornos con almacenamiento o ancho de banda limitados.
- Procedencia: el artefacto es una modificación de terceros sobre un release de Meta; la responsabilidad de validación recae en quien lo despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/wrldsuksgo2mars/Muse-Spark-Open-EXL3-K4-Core-K6-HQA
- Modelo padre inmediato: https://huggingface.co/wrldsuksgo2mars/Muse-Spark-Open-EXL3-K4-Core-K6/tree/89998fb177acd9a862ac8bd4fb79bfd50e940c97
- Modelo base: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B/tree/0fb02478b02565b2ce7fc57e6051c91172774ac9
- Licencia: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B/blob/0fb02478b02565b2ce7fc57e6051c91172774ac9/LICENSE.md
- Dataset citado: https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v1
