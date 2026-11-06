# wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K4-Core-K6-HQA

## Resumen

GLM-5.3-Flash-EXL3-K4-Core-K6-HQA es una cuantizacion de 4 bits del modelo multimodal zai-org/GLM-5.3-Flash-BF16, publicada por el usuario wrldsuksgo2mars. Se trata de un checkpoint de aproximadamente 85.058 millones de parametros totales, orientado a tareas image-text-to-text, que combina la cuantizacion EXL3 del autor con una restauracion selectiva en BF16 de las proyecciones de atencion principales (denominada HQA, High Quality Attention). El resultado es un artefacto de 170,2 GB en formato safetensors que persigue reducir el peso del modelo sin degradar la fidelidad de las capas de atencion mas sensibles.

El checkpoint no es un modelo nuevo: es una variante de cuantizacion del GLM-5.3-Flash-BF16, con los expertos (routed experts) cuantizados en EXL3 a K4/K6 y las proyecciones `o_proj` y `q_b_proj` restauradas byte a byte a su precision nativa BF16. El autor distingue explicitamente entre el formato y la fidelidad de esos tensores y cualquier afirmacion de rendimiento medida; no se ha realizado evaluacion de calidad ni de generacion completa del modelo.

La relevancia actual es doble: por un lado, explora tecnicas de cuantizacion selectiva que preservan las capas de atencion criticas; por otro, el repositorio documenta de forma muy rigurosa el contrato de carga (dos vistas mutuamente excluyentes, indices y configs separados) y advierte de que el soporte de loader para la vista HQA es trabajo futuro no implementado. Es, por tanto, un artefacto de investigacion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con atencion y expertos enrutados; tag `glm5_next` |
| Parametros totales | 85.058.697.310 (85,06 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 4 bits (K4 en MTP, K6 en capas principales); proyecciones de atencion restauradas a BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con indice `model.safetensors.index.json` y vista alternativa `model.compact-attention.safetensors.index.json`) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash-BF16 es un transformer multimodal de tipo image-text-to-text con expertos enrutados (el repositorio referencia explicitamente `routed_expert` y un catalogo de expertos), aunque la informacion disponible no detalla el numero de expertos, el ratio de activacion ni la longitud de contexto. El checkpoint HQA no aporta entrenamiento nuevo: hereda los pesos del modelo base y aplica cuantizacion EXL3 sobre los expertos y el resto de tensores, manteniendo intactos los pesos nativos ya existentes.

La innovacion tecnica del artefacto reside en la restauracion HQA: 58 proyecciones (46 de `o_proj` y 12 de `q_b_proj`, distribuidas en 45 capas principales mas 1 capa MTP) se copian byte a byte desde el release BF16 original, sin casting, recuantizacion, padding ni transposicion. El autor verifica cada tensor de reemplazo contra su extension de origen (4.496.293.888 bytes) y comprueba hashes, shapes y dtypes. El repositorio expone dos vistas completas y mutuamente excluyentes del mismo conjunto de ficheros: la vista HQA por defecto (payload activo de 168,45 GB) y la vista compact-attention (165,62 GB), que reproduce exactamente el indice del modelo padre. La validacion realizada incluye la apertura de ambas vistas mediante un arnes de seleccion explicito, pero no se ejecuto generacion completa ni evaluacion de calidad o rendimiento de la vista HQA.

## Capacidades

- Generacion de texto y conversacion multi-turno (tag `conversational`).
- Procesamiento multimodal image-text-to-text: entrada conjunta de imagenes y texto.
- Razonamiento y tareas de agente, segun el dataset de cuantizacion `agentic-quant-panel-v1` referenciado por el autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente; el dataset de calibracion sugiere orientacion agentica.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio especial: vision confirmada por el pipeline; thinking y audio no disponibles.

## Casos de uso

- Investigacion en cuantizacion selectiva: el checkpoint sirve como referencia reproducible para estudiar el impacto de preservar proyecciones de atencion en BF16 mientras se cuantizan los expertos, comparando la vista HQA con la compact-attention sobre los mismos bytes.
- Desarrollo de loaders especializados: el contrato de dos bundles (indice, config y metadatos de cuantizacion seleccionados conjuntamente) es un caso de prueba concreto para implementar soporte de carga en herramientas tipo cuteafd, cuyo flag `--compact-attention` esta aun sin implementar.
- Despliegue multimodal en entornos con VRAM limitada: al reducir el peso a ~170 GB frente al BF16 original, permite explorar inferencia image-text-to-text en nodos multi-GPU de gama alta donde el modelo completo no cabria.
- Evaluacion comparativa de fidelidad: util para medir la degradacion introducida por EXL3 en los expertos frente a la atencion nativa, usando los hashes y registros de procedencia incluidos (`hqa-provenance.json`, `quantization-provenance.json`).
- Pipelines de vision-lenguaje en investigacion: prototipado de tareas de descripcion de imagenes, VQA o extraccion de informacion de documentos, una vez exista loader compatible.
- Auditoria de artefactos de cuantizacion: el repositorio documenta tamanos por shard, SHA256 y verificaciones byte a byte, lo que lo convierte en un ejemplo de trazabilidad para equipos que publican checkpoints cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la denominacion HQA describe el formato y la fidelidad de los tensores, no una afirmacion de rendimiento medida, y que no se realizo evaluacion de generacion, calidad o rendimiento de la vista HQA.

## Requisitos de hardware

- VRAM estimada: el payload activo es de 168,45 GB (vista HQA) o 165,62 GB (vista compact-attention); se requiere un conjunto multi-GPU con al menos ~170 GB de memoria agregada solo para pesos, mas overhead de activaciones y KV cache.
- GPU recomendadas: nodos con multiples A100 80 GB, H100 80 GB o equivalentes; no cabe en una unica GPU de 80 GB.
- Consumer GPU: no cabe en RTX 4090 (24 GB) ni en ninguna GPU de consumo actual; se necesitarian al menos 8x RTX 4090 solo para pesos, sin margen para activaciones.
- Opciones de despliegue: no disponible. El autor advierte que un indice safetensors valido no implica soporte generico en Transformers/EXL3, y que el soporte del loader cuteafd para la vista HQA es trabajo futuro no implementado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-EXL3-K4-Core-K6-HQA | 85,06 B | no disponible | EXL3 4 bits + atencion BF16 | MIT | Publicado; loader HQA no implementado |
| zai-org/GLM-5.3-Flash-BF16 | no disponible | no disponible | BF16 nativo | no disponible | Modelo base de referencia |
| wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K4-Core-K6 | no disponible | no disponible | EXL3 4 bits (atencion incluida) | no disponible | Modelo padre de la variante HQA |

No se dispone de datos de rendimiento ni de modelos comparables de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- No se ha realizado evaluacion de generacion completa, calidad ni rendimiento de la vista HQA; no hay evidencia empirica de que la restauracion BF16 de la atencion mejore resultados.
- El soporte de loader para la vista HQA no esta implementado: la opcion `--compact-attention` de cuteafd es trabajo futuro, y el planificador actual falla con el bundle HQA (`incomplete native GLM Flash operator group` y desajuste de conteo en expertos enrutados).
- Un loader debe seleccionar un unico bundle (indice, config y metadatos de cuantizacion juntos) durante toda la vida del modelo cargado y rechazar bundles mixtos o incompletos; los loaders genericos leen solo los ficheros por defecto.
- Los nombres alternativos de fichero (`model.compact-attention.*`) son una convencion del autor, no un modo nativo de Hugging Face.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; aplican los del modelo base GLM-5.3-Flash-BF16.
- Idiomas soportados no declarados; no se puede garantizar cobertura multilingue.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del checkpoint cuantizado en produccion.
- El repositorio tiene 0 descargas y 0 likes, sin validacion independiente por parte de la comunidad.
- El modelo base y el dataset de calibracion son referencias del autor; no se detalla su composicion ni sesgos.

## Enlaces

- HuggingFace (checkpoint HQA): https://huggingface.co/wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K4-Core-K6-HQA
- Modelo padre EXL3: https://huggingface.co/wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K4-Core-K6/tree/5d3fffe1df9c4a109bbbdafb60dc19df9fac019d
- Modelo base BF16: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16/tree/f9fed3bbc82291073373d67452e9f25317ef7577
- Dataset de calibracion: https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v1
- Repositorio cuteafd (referenciado en la model card): no disponible como enlace directo en la informacion proporcionada
- Paper, blog o demo oficial: no disponibles en la informacion proporcionada
