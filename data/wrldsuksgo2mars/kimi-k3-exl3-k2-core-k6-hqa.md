# wrldsuksgo2mars/Kimi-K3-EXL3-K2-Core-K6-HQA

## Resumen

Kimi-K3-EXL3-K2-Core-K6-HQA es una cuantizacion de terceros del modelo Kimi-K3 de Moonshot AI, publicada por el usuario wrldsuksgo2mars. Se trata de un checkpoint derivado de una cadena de cuantizaciones EXL3 (formato de cuantizacion de baja precision, en este caso a 2 bits) sobre el modelo base original en BF16. El repositorio contiene 374.497.240.832 parametros totales y un payload activo de 742,36 GB, lo que lo situa en la categoria de modelos de gran escala con requisitos de hardware muy elevados.

La particularidad de esta variante, denominada HQA (High Quality Attention), es que restaura las proyecciones de atencion principales (`o_proj` y `q_b_proj`, 117 proyecciones en total) a sus pesos nativos en BF16 procedentes de la release original de Moonshot AI, copiados byte a byte. El resto de tensores, incluida la cuantizacion de los expertos, se hereda sin cambios del checkpoint padre Kimi-K3-EXL3-K2-Core-K6. Segun el autor, HQA describe el formato y la fidelidad de estos tensores, no una afirmacion de rendimiento medida.

El modelo es relevante como experimento de cuantizacion selectiva: mantiene la atencion en alta precision mientras comprime el resto de la red, una estrategia que busca preservar la calidad en los modulos mas sensibles. Sin embargo, el propio autor advierte que el soporte de carga para la vista HQA aun no esta implementado en la herramienta cuteafd, por lo que el checkpoint se publica como material para ese trabajo futuro y no como un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Kimi-K3; transformer con atencion y modulos MTP, segun referencias del autor) |
| Parametros totales | 374.497.240.832 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 2 bits (expertos y modulos cuantizados); atencion principal restaurada a BF16 |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3 (other, enlazada a la licencia de moonshotai/Kimi-K3) |
| Formato de pesos | safetensors (con index JSON y configuracion de cuantizacion EXL3) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Kimi-K3 de Moonshot AI, si bien la model card de esta cuantizacion no detalla la estructura interna (numero de capas, dimensiones, mecanismo de atencion o si emplea mezcla de expertos). El autor menciona explicitamente modulos MTP (multi-token prediction) y proyecciones de atencion (`o_proj`, `q_b_proj`) e indexer, lo que sugiere una arquitectura transformer con componentes de prediccion multi-token y atencion con indexado. No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original.

El proceso de esta variante es puramente de cuantizacion y restauracion, no de entrenamiento. Se parte de Kimi-K3-EXL3-K2-Core-K6 (cuantizado a 2 bits con EXL3) y se sustituyen 117 proyecciones de atencion por sus pesos nativos BF16 del checkpoint original `moonshotai/Kimi-K3`, copiados byte a byte sin casting, recuantizacion, padding ni transposicion. El repositorio ofrece dos vistas mutuamente excluyentes de los mismos ficheros: la vista HQA por defecto (payload de 742,36 GB) y una vista compact-attention (payload de 731,28 GB) que reproduce el indice del padre. Los nuevos shards de atencion nativa suman 17,74 GB repartidos en 8 ficheros. La validacion realizada incluye comparacion byte a byte de cada tensor reemplazado, comprobacion de hashes y verificacion de que ambas vistas resuelven correctamente sus indices.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Kimi-K3, aunque no se documentan capacidades especificas en la model card de esta cuantizacion.
- Codigo y matematicas: no disponible de forma explicita; depende de las capacidades del modelo original.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el dataset de cuantizacion se denomina `agentic-quant-panel-v1`, lo que sugiere un contexto de evaluacion agentica, pero no se detallan capacidades.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Prediccion multi-token (MTP): el autor menciona modulos MTP en el modelo, lo que indica soporte de decodificacion con prediccion multi-token en la arquitectura base.

## Casos de uso

- Investigacion en cuantizacion selectiva: el checkpoint sirve para estudiar el impacto de mantener la atencion en BF16 mientras se comprime el resto de la red a 2 bits, comparando la vista HQA con la vista compact-attention sobre el mismo conjunto de pesos.
- Desarrollo de loaders y herramientas de cuantizacion: el autor publica el checkpoint como material para implementar el soporte de la vista HQA en la herramienta cuteafd, por lo que es util para desarrolladores que trabajen en cargadores de modelos EXL3.
- Evaluacion de fidelidad de pesos: los shards `hqa-attention-*` con hashes SHA256 documentados permiten verificar la integridad de la restauracion byte a byte en pipelines de validacion.
- Experimentos de inferencia en clusters de gran memoria: con 742 GB de payload activo, requiere nodos con multiples GPU de alta capacidad, adecuado para laboratorios con infraestructura HPC.
- Reproducibilidad de cuantizaciones comunitarias: sirve como referencia de como se documenta una cadena de derivacion (modelo base, padre cuantizado, tensores restaurados) con trazabilidad de commits fijados.
- Estudio de compromisos precision-almacenamiento: comparar el tamano del payload HQA (742,36 GB) frente al compact-attention (731,28 GB) permite cuantificar el coste en disco de restaurar la atencion a BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que HQA describe el formato y la fidelidad de los tensores, no una afirmacion de rendimiento medida.

## Requisitos de hardware

- VRAM estimada para inferencia: el payload activo de la vista HQA es de 742,36 GB, por lo que se necesita un agregado de memoria muy superior a cualquier GPU individual; se requieren nodos multi-GPU con interconexion de alta velocidad.
- GPU recomendadas: no disponibles en la informacion proporcionada; por el volumen de pesos, se necesitarian multiples aceleradores de centro de datos (tipo A100/H100 de 80 GB) en configuracion de varios nodos.
- Compatibilidad con GPU de consumo: no cabe en ninguna GPU consumer actual; el payload excede en mas de un orden de magnitud la VRAM de una RTX 4090 (24 GB).
- Opciones de despliegue: el autor menciona la herramienta cuteafd para la seleccion de bundles; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI. El propio autor advierte que un indice safetensors valido no implica soporte generico en Transformers/EXL3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi-K3-EXL3-K2-Core-K6-HQA (este) | 374.497.240.832 | no disponible | EXL3 2 bits + atencion BF16 | kimi-k3 | Hugging Face, soporte de carga pendiente |
| Kimi-K3-EXL3-K2-Core-K6 (padre) | no disponible | no disponible | EXL3 2 bits | kimi-k3 | Hugging Face |
| moonshotai/Kimi-K3 (base) | no disponible | no disponible | BF16 nativo | kimi-k3 | Hugging Face |

No se dispone de datos de rendimiento ni de contexto para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Soporte de carga incompleto: el autor indica que la opcion `--compact-attention` de cuteafd es trabajo futuro no implementado, y que el soporte por familia para la vista HQA llegara por separado; no se debe asumir que una release actual de cuteafd sirva ninguna de las dos vistas.
- Riesgo de confusion entre vistas: el repositorio contiene dos bundles mutuamente excluyentes con nombres de fichero alternativos; un cargador debe seleccionar un unico bundle (indice, config y metadatos de cuantizacion juntos) y rechazar bundles mezclados o incompletos.
- Requisitos de almacenamiento y memoria extremos: 750,34 GB de descarga completa y 742,36 GB de payload activo hacen inviable el uso en infraestructura convencional.
- Licencia: licencia "other" con nombre kimi-k3, enlazada a la licencia de moonshotai/Kimi-K3; es necesario revisar los terminos del modelo base para uso comercial, que no se detallan en esta ficha.
- Sin datos de rendimiento: no hay benchmarks publicados, por lo que no puede afirmarse que la restauracion de la atencion a BF16 mejore la calidad respecto al padre cuantizado.
- Sesgos y alucinacion: no documentados en la informacion disponible; se heredan los del modelo base, que no se detallan.
- Idiomas y contexto: no disponibles; no se puede confirmar el soporte multilingue ni la ventana de contexto efectiva.
- Trazabilidad dependiente de commits fijados: la validez de la restauracion esta ligada a los commits `1a28050d2954426a43a3db705e53ca120e5f2b47` (padre) y `f831ab66814297da540d832a5235f8e904f29d06` (base); cambios en esos repositorios invalidarian la reproducibilidad.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/wrldsuksgo2mars/Kimi-K3-EXL3-K2-Core-K6-HQA
- Modelo padre (Kimi-K3-EXL3-K2-Core-K6): https://huggingface.co/wrldsuksgo2mars/Kimi-K3-EXL3-K2-Core-K6/tree/1a28050d2954426a43a3db705e53ca120e5f2b47
- Modelo base (moonshotai/Kimi-K3): https://huggingface.co/moonshotai/Kimi-K3/tree/f831ab66814297da540d832a5235f8e904f29d06
- Licencia del modelo base: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Dataset de cuantizacion: https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v1
