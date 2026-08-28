# zuliaio/specter2-proximity-onnx

## Resumen

SPECTER2 proximity (ONNX) es una exportación a formato ONNX del modelo SPECTER2 de Allen Institute for AI, concretamente la variante con el adaptador *proximity* activado. SPECTER2 es un modelo de embeddings para documentos científicos, entrenado sobre enlaces de citas bibliográficas, que produce representaciones vectoriales de 768 dimensiones optimizadas para tareas de similitud entre documentos y recuperación de vecinos más cercanos. Este repositorio concreto, publicado por el usuario zuliaio, integra el adaptador directamente en el grafo ONNX, de modo que puede cargarse con ONNX Runtime sin necesidad de la librería `adapters`.

El modelo se basa en `allenai/specter2_base`, un transformer BERT-base de 12 capas con 768 unidades ocultas, y añade un adaptador de tipo Pfeiffer bottleneck entrenado específicamente para proximidad entre documentos. La exportación se realizó con ONNX opset 17 en precisión fp32, y el grafo resultante acepta `input_ids`, `attention_mask` y `token_type_ids`, devolviendo `last_hidden_state`. El pooling (CLS) y la normalización L2 deben aplicarse externamente. El modelo está pensado para su uso en pipelines de búsqueda y recomendación científica, y es el que emplea el motor de búsqueda Zulia como `KnownEmbeddingModel.SPECTER2`.

La relevancia de esta versión ONNX radica en su portabilidad: al eliminar la dependencia de la librería `adapters`, se puede desplegar en entornos de producción con ONNX Runtime, ya sea en CPU o GPU, con un tamaño de repositorio de 0,4 GB. La licencia es Apache 2.0, sin cambios respecto al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (12 capas, 768 hidden, 12 cabezas) con adaptador Pfeiffer bottleneck |
| Parametros totales | no disponible (basado en BERT-base, ~110M, sin confirmar) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | fp32 (ONNX opset 17) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

SPECTER2 es un modelo basado en la arquitectura BERT, preentrenado sobre títulos y resúmenes de artículos científicos utilizando enlaces de citas como señal de supervisión. El modelo base `allenai/specter2_base` se entrena con una pérdida de contraste entre documentos que se citan mutuamente, de modo que los embeddings resultantes capturan relaciones semánticas y temáticas entre publicaciones. Sobre esta base, el adaptador *proximity* se entrena adicionalmente para optimizar la similitud coseno entre pares de documentos relacionados, lo que lo hace especialmente adecuado para tareas de recuperación y agrupación.

En esta exportación ONNX, el adaptador se fusiona directamente en el grafo del modelo. El proceso de exportación, documentado en el script `export_specter2_onnx.py`, carga el modelo base y el adaptador desde Hugging Face, traza el grafo completo, verifica que las salidas coinciden con el modelo PyTorch original dentro de tolerancia de coma flotante y escribe el archivo `model.onnx`. No se modificó ningún peso; el adaptador queda integrado como capas adicionales dentro del grafo. El modelo espera la entrada en el formato `title[SEP]abstract`, con una longitud máxima de 512 tokens, y devuelve `last_hidden_state`; el usuario debe aplicar pooling sobre la posición 0 (CLS) y normalizar L2 para obtener el embedding final.

## Capacidades

- Generacion de embeddings de documentos cientificos: produce vectores de 768 dimensiones a partir de titulo y resumen.
- Similitud entre documentos: el adaptador proximity optimiza la similitud coseno, permitiendo comparar papers por cercania semantica.
- Recuperacion de vecinos mas cercanos: adecuado para busquedas por similitud en grandes corpus de literatura cientifica.
- Clasificacion de citas: puede utilizarse para predecir si dos articulos se citaran entre si, gracias al entrenamiento basado en enlaces de citas.
- Extraccion de caracteristicas: al ser un modelo de tipo feature-extraction, sirve como base para tareas downstream como agrupacion, recomendacion o deduplicacion.
- Multilingue: no, solo soporta ingles.

## Casos de uso

- Busqueda semantica en repositorios de articulos cientificos: el modelo puede indexar titulos y resumenes de papers y responder a consultas en lenguaje natural devolviendo los documentos mas relevantes por similitud coseno. Su ventana de 512 tokens es suficiente para capturar el contenido completo de titulo y resumen.
- Recomendacion de literatura relacionada: dado un articulo de referencia, se pueden calcular los embeddings de todos los papers de un corpus y recomendar los mas cercanos, aprovechando el entrenamiento con citas que agrupa tematicamente.
- Deteccion de duplicados o plagio: al comparar embeddings de documentos, se pueden identificar articulos con contenido muy similar, incluso si el texto difiere superficialmente.
- Organizacion de bibliotecas digitales: permite agrupar colecciones de papers por temas o lineas de investigacion mediante clustering sobre los embeddings generados.
- Construccion de grafos de citas: los embeddings pueden alimentar sistemas que predicen futuras citas o que analizan la estructura de la literatura cientifica.
- Integracion en pipelines de produccion con ONNX Runtime: al ser un unico archivo ONNX, se puede desplegar en servidores con vLLM, TGI o directamente con ONNX Runtime, sin dependencias adicionales de la libreria `adapters`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base SPECTER2 fue evaluado en el benchmark SciRepEval, pero no se proporcionan metricas concretas para esta exportacion ONNX. Se recomienda consultar el repositorio original de SPECTER2 para datos de rendimiento del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32, dado el tamano del modelo (0,4 GB de pesos). En CPU, el uso de memoria RAM es similar.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una NVIDIA GTX 1050 Ti o superior. En GPU, ONNX Runtime puede acelerar la inferencia, aunque para un modelo de este tamano la CPU es suficiente para la mayoria de casos.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU moderna, incluidas las de gama baja.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), tambien se puede servir con FastAPI o mediante herramientas como vLLM (aunque vLLM esta pensado para modelos generativos, no para embeddings). Para embeddings, se puede usar ONNX Runtime directamente o a traves de librerias como `optimum` o `transformers` con el backend ONNX.
- Latencia y throughput estimados: no disponibles. Para un modelo BERT-base, la inferencia en CPU suele tardar entre 10 y 50 ms por documento, dependiendo del hardware y la longitud del texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension embedding | Licencia | Formato |
|---|---|---|---|---|---|
| SPECTER2 proximity (ONNX) | ~110M (estimado) | 512 | 768 | Apache 2.0 | ONNX |
| SPECTER2 base (PyTorch) | ~110M | 512 | 768 | Apache 2.0 | PyTorch |
| SciBERT | ~110M | 512 | 768 | Apache 2.0 | PyTorch |
| SPECTER original | ~110M | 512 | 768 | Apache 2.0 | PyTorch |

La principal diferencia de esta version ONNX es la portabilidad: elimina la dependencia de la libreria `adapters` y permite cargar el modelo directamente con ONNX Runtime. En cuanto a rendimiento, no se dispone de comparativas directas, pero el modelo base SPECTER2 supera a SciBERT en tareas de similitud de documentos cientificos segun el paper original.

## Limitaciones y advertencias

- Solo soporta ingles: no es util para documentos en otros idiomas.
- Longitud maxima de 512 tokens: los documentos mas largos deben truncarse, lo que puede perder informacion relevante.
- El pooling no esta incluido en el grafo: es obligatorio aplicar CLS pooling y normalizacion L2 manualmente, tal como se indica en la documentacion.
- No es un modelo generativo: solo produce embeddings, no genera texto.
- Riesgo de alucinacion: no aplica, al no ser generativo, pero los embeddings pueden reflejar sesgos presentes en los datos de entrenamiento (articulos cientificos en ingles, mayoritariamente de dominios occidentales).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener la atribucion y citar los trabajos originales (Singh et al., 2022 y Cohan et al., 2020).
- Para produccion, se recomienda validar el comportamiento del modelo en el corpus especifico, ya que los embeddings pueden degradarse en dominios muy especializados no representados en el entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zuliaio/specter2-proximity-onnx
- Repositorio original SPECTER2: https://github.com/allenai/SPECTER2
- Paper SPECTER (Cohan et al., 2020): https://aclanthology.org/2020.acl-main.505/
- Paper SciRepEval (Singh et al., 2022): https://api.semanticscholar.org/CorpusID:254018137
- Repositorio ONNX Models (referencia general): https://github.com/onnx/models
- Repositorio Zulia (usuario del modelo): https://github.com/zuliaio/zuliasearch
