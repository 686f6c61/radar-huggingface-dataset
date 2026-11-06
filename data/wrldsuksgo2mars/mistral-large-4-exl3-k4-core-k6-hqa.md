# wrldsuksgo2mars/Mistral-Large-4-EXL3-K4-Core-K6-HQA

## Resumen

Mistral-Large-4-EXL3-K4-Core-K6-HQA es una cuantizacion de cuarta generacion (EXL3) del modelo multimodal Mistral Large 4 de Mistral AI, publicada por el usuario independiente wrldsuksgo2mars. El modelo base es un transformer de mezcla de expertos (MoE) con 1,05 billones de parametros totales y 52.000 millones de parametros activos por token, segun la documentacion oficial de Mistral. Esta variante concreta aplica cuantizacion EXL3 con esquema K4/K6 (4 y 6 bits) sobre los expertos enrutados y restaura las proyecciones de atencion principales (`wq` y `wo`) a su formato nativo F8_E4M3 con escalas FP32 por bloque de 128 elementos, lo que el autor denomina HQA (High Quality Attention).

El checkpoint ocupa 548 GB en total, con una carga util activa de 542,43 GB en la vista HQA por defecto. Incluye dos vistas mutuamente excluyentes del mismo conjunto de ficheros: la vista HQA (por defecto) y una vista compact-attention que replica byte a byte el indice del modelo padre. Esta duplicidad de vistas y el formato EXL3 propietario implican que las herramientas genericas de Transformers no pueden cargarlo: requiere un runtime compatible con EXL3 y con el esquema mixto K4/K6 de Mistral.

La relevancia de esta publicacion es acotada pero tecnica: demuestra una estrategia de cuantizacion selectiva que preserva la fidelidad de las proyecciones de atencion mientras comprime los expertos, y sirve como banco de pruebas para el desarrollo de loaders especializados. No obstante, el propio autor advierte de que el soporte de carga para la vista HQA aun no esta implementado en la herramienta de referencia (cuteafd) y que este checkpoint se publica como material para ese trabajo futuro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (base: Mistral Large 4) |
| Parametros totales | 278.110.230.048 (278,1 mil millones segun safetensors) |
| Parametros activos | 52 mil millones (52B, segun documentacion de Mistral) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 K4/K6 (4 y 6 bits) en expertos; F8_E4M3 nativo con escalas FP32 bloque-128 en atencion (`wq`, `wo`) |
| Idiomas soportados | no disponible |
| Licencia | mistral-ecosystem-open-weight (other) |
| Formato de pesos | safetensors (indice y shards EXL3 + shards `hqa-attention-*`) |

Nota: existe una discrepancia entre el recuento de parametros reportado por safetensors (278,1 mil millones) y el dato oficial de Mistral para el modelo base (1,05 billones totales). El dato de safetensors corresponde a los tensores efectivamente almacenados tras la cuantizacion y posiblemente a un recuento parcial; se recomienda tratar ambas cifras con cautela.

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con atencion multi-cabeza latente (MLA) y componentes multimodales, incluyendo un codificador de vision de 1,6 mil millones de parametros y un modulo BF16 denominado dSpark. La arquitectura incluye proyecciones de indice en FP8 del proveedor y pesos de borrador (draft) para decodificacion especulativa. Esta variante no ha sido reentrenada: es una cuantizacion post-entrenamiento del checkpoint `mistralai/Mistral-Large-4-1T-A52B` en la revision `f12dabdc0c1e99e7f7924461a6f308859b05af4d`.

La innovacion tecnica de esta publicacion es la restauracion de 144 proyecciones de atencion (72 de `wq` y 72 de `wo`, correspondientes a las 72 capas principales) a su formato nativo F8_E4M3, copiadas byte a byte junto con sus escalas FP32 por bloque de 128, sin recasteo, recuantizacion ni transposicion. Los expertos enrutados y el resto de tensores conservan la cuantizacion EXL3 del modelo padre. El autor valido cada tensor de reemplazo contra su origen fijado (7.249.526.784 bytes) y verifico que ambas vistas resuelven todos los tensores indexados y que la vista compacta reproduce exactamente la seleccion y carga util del padre. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni si hubo RLHF o DPO; el dataset citado (`wrldsuksgo2mars/agentic-quant-panel-v1`) parece ser material auxiliar del proceso de cuantizacion, no de entrenamiento.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredadas del modelo base Mistral Large 4.
- Procesamiento multimodal: el modelo base incluye un codificador de vision de 1,6B de parametros.
- Razonamiento multi-paso y soporte de agentes, segun la naturaleza del modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no confirmado en la informacion disponible para esta variante.
- Decodificacion especulativa mediante pesos de borrador (draft) y atencion MLA.
- Doble vista de atencion (HQA nativa y compact-attention EXL3) seleccionable por bundle de indice, config y metadatos de cuantizacion.

## Casos de uso

- Investigacion en cuantizacion de modelos masivos: sirve para estudiar el impacto de preservar proyecciones de atencion en precision nativa (F8_E4M3) frente a cuantizarlas a 4/6 bits, comparando ambas vistas sobre el mismo checkpoint.
- Desarrollo de runtimes y loaders EXL3: el checkpoint actua como caso de prueba para implementar la seleccion de bundles (indice, config y metadatos) y el rechazo de bundles mixtos o incompletos, tal como exige el contrato descrito por el autor.
- Validacion de pipelines de publicacion de pesos: los hashes SHA256 por shard y la comparacion byte a byte con el padre permiten verificar integridad de descargas y copias server-side en entornos de distribucion de modelos.
- Benchmarking de fidelidad de atencion: permite medir la degradacion (o ausencia de ella) en tareas de contexto largo al restaurar `wq` y `wo` a su formato nativo, comparando contra la vista compact-attention.
- Experimentacion con modelos MoE de gran escala en clústeres: con 542 GB de carga util, es viable en nodos multi-GPU con suficiente memoria agregada para estudiar el comportamiento de los 52B parametros activos.
- Reproducibilidad de cuantizaciones comunitarias: el detallado registro de validacion (hashes, tamanos, comparaciones) sirve de plantilla para publicar cuantizaciones verificables de modelos propietarios o de licencia restringida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la carga util activa de la vista HQA es de 542,43 GB; la vista compact-attention, 540,62 GB. La descarga completa son 548,07 GB. Se requiere memoria agregada de al menos ~550 GB para cargar una vista completa en memoria.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por volumen, requiere configuraciones multi-GPU de clase centro de datos (varios nodos o GPUs con 80 GB o mas cada una); no cabe en GPUs de consumo.
- GPU de consumo: no cabe en ninguna GPU consumer actual (RTX 4090 con 24 GB, etc.).
- Opciones de despliegue: el autor indica que se requiere un runtime compatible con el formato EXL3 mixto K4/K6 de Mistral, el indexer FP8 del proveedor, MLA kv_b en BF16 y los componentes de vision y dSpark en BF16. La herramienta de referencia (cuteafd) aun no ejecuta la vista HQA; el planificador reproduce el plan del padre solo para la vista compacta. vLLM, llama.cpp, Ollama y TGI no estan confirmados como compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Mistral-Large-4-EXL3-K4-Core-K6-HQA (esta ficha) | 278,1 mil millones (safetensors) / 1,05 billones (base) | 52B | no disponible | EXL3 K4/K6 + F8_E4M3 en atencion | mistral-ecosystem-open-weight | Hugging Face, 0 descargas |
| mistralai/Mistral-Large-4-1T-A52B (base) | 1,05 billones | 52B | no disponible | BF16/FP8 nativo | mistral-ecosystem-open-weight | Hugging Face |
| wrldsuksgo2mars/Mistral-Large-4-EXL3-K4-Core-K6 (padre de cuantizacion) | no disponible | 52B | no disponible | EXL3 K4/K6 | mistral-ecosystem-open-weight | Hugging Face |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoria.

## Limitaciones y advertencias

- Soporte de carga incompleto: el autor declara explicitamente que la opcion `--compact-attention` de cuteafd es trabajo futuro no implementado, y que el soporte del loader para la vista HQA llega por separado. No debe asumirse que una release actual de cuteafd sirva ninguna de las dos vistas.
- Los loaders genericos de Transformers no pueden cargar este checkpoint: un indice safetensors valido no implica soporte generico de EXL3.
- Discrepancia en el recuento de parametros entre safetensors (278,1 mil millones) y la documentacion oficial del base (1,05 billones); conviene verificar antes de dimensionar infraestructura.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible para esta variante; se heredan los del modelo base.
- Idiomas soportados no declarados; no se puede garantizar cobertura multilingue sin validacion.
- Restricciones de licencia: licencia `mistral-ecosystem-open-weight` (other), con enlace al fichero LICENSE del modelo base. Es imprescindible revisar los terminos antes de cualquier uso comercial.
- Ausencia de benchmarks: no hay mediciones publicadas de calidad, contexto largo ni rendimiento de servicio; el propio autor indica que son trabajos de cualificacion separados.
- Riesgo de integridad: al ser una cuantizacion comunitaria con dos vistas sobre los mismos ficheros, una descarga o seleccion incorrecta de bundle puede producir un modelo invalido o mixto; el loader debe rechazar bundles incompletos.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wrldsuksgo2mars/Mistral-Large-4-EXL3-K4-Core-K6-HQA
- Modelo padre de cuantizacion: https://huggingface.co/wrldsuksgo2mars/Mistral-Large-4-EXL3-K4-Core-K6
- Modelo base: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Revision fijada del modelo base: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/tree/f12dabdc0c1e99e7f7924461a6f308859b05af4d
- Licencia del modelo base: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/f12dabdc0c1e99e7f7924461a6f308859b05af4d/LICENSE
- Documentacion oficial de Mistral Large 4: https://docs.mistral.ai/models/mistral-large-4-0
- Dataset citado: https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v1
