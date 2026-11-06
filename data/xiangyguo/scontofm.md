# xiangyguo/scOntoFM

## Resumen

scOntoFM es un modelo fundacional para datos de secuenciación de ARN de célula única (scRNA-seq) desarrollado por el autor xiangyguo. Se trata de un transformer tipo BERT de pequeno tamano (8,9 millones de parametros, 6 capas, dimension oculta 256) que se utiliza como extractor de caracteristicas para generar embeddings de celulas de 256 dimensiones. La innovacion central del modelo es que incorpora la jerarquia de la Cell Ontology (CL) en el proceso de aprendizaje de representaciones, de modo que celulas de tipos similares segun la ontologia quedan proximas en el espacio de embeddings.

El modelo se preentrena sobre un corpus de 27,5 millones de celulas humanas procedentes de 234 conjuntos de CELLxGENE, cubriendo 210 tejidos, 566 tipos celulares y 58 enfermedades. Ademas del objetivo clasico de modelado de genes enmascarados (masked gene modeling), utiliza dos objetivos conscientes de la ontologia basados en distancias al ancestro comun mas bajo (LCA) entre tipos celulares: una perdida de triplet con margen dinamico y una perdida de alineamiento ontologico diferenciable (Spearman suave).

Es relevante ahora porque propone una via poco explorada en los modelos fundacionales de scRNA-seq: inyectar conocimiento biologico estructurado (la ontologia) directamente en la funcion de perdida, en lugar de limitarse a aprender de la co-ocurrencia de genes. Al ser un modelo compacto y con licencia MIT, es viable para extraccion de caracteristicas en recursos limitados y para tareas posteriores como anotacion celular o integracion de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (`BertForMaskedLM`), 6 capas, hidden size 256, 4 cabeceras de atencion, intermediate 512 |
| Parametros totales | 8.867.301 (8,9 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.002 tokens (secuencia `<cls>` + top-2.000 genes + `<eos>`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biologico; entrada basada en identificadores de genes, no texto natural) |
| Licencia | MIT (pesos y codigo); Cell Ontology CC BY 4.0; corpus derivado de CELLxGENE CC BY 4.0 |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json`; vocabulario en `vocab/token_dictionary.pkl` y `vocab/gene_medians.pkl` |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de estilo BERT con 6 capas, dimension oculta 256, 4 cabeceras y capa intermedia de 512, sumando 8,9 millones de parametros. La entrada no es texto sino una secuencia de identificadores de genes: un token `<cls>`, los 2.000 genes con mayor rango tras normalizacion por medianas (no nulas), y un token `<eos>`, con una longitud maxima de 2.002 posiciones y un vocabulario de 19.941 tokens geneticos. El embedding de celula se obtiene del estado final del token `<cls>` (256 dimensiones).

El preentrenamiento se realizo sobre 27.525.118 celulas humanas del corpus `xiangyguo/scOntoFM-pretrain-corpus` (234 conjuntos CELLxGENE, 210 tejidos, 566 tipos celulares, 58 enfermedades); de las 29.160.112 celulas del repositorio, 1.634.994 (sin anotacion, malignas o con terminos obsoletos) no se utilizaron. El entrenamiento consistio en 3 epocas con DeepSpeed ZeRO-2, precision fp16, AdamW con lr 1e-3 y batch global de 1.536 triplets, en 6 GPU H200. Ademas del masked gene modeling, se emplearon dos objetivos: una perdida de triplet con margen dinamico y negativos dificiles guiados por ontologia (los 50 tipos celulares mas cercanos), y una perdida de alineamiento ontologico (Spearman suave diferenciable) entre las distancias de embeddings dentro del batch y las distancias LCA. Los artefactos de entrenamiento (distancias LCA entre terminos CL 2025-07-30, mapa de identificadores CL, triplets) se publican en el repositorio.

## Capacidades

- Extraccion de caracteristicas: genera embeddings de celula de 256 dimensiones a partir de recuentos brutos de scRNA-seq, utilizables como entrada para clasificadores, clustering o analisis aguas abajo.
- Modelado de genes enmascarados: permite predecir genes enmascarados a partir del contexto de la celula (tarea de tipo fill-mask sobre vocabulario genetico).
- Representacion consciente de ontologia: los embeddings reflejan la jerarquia de la Cell Ontology, de modo que tipos celulares proximos segun LCA tienden a quedar proximos en el espacio latente.
- Integracion de datos entre conjuntos: al estar entrenado sobre 234 conjuntos y 210 tejidos, esta disenado para representar celulas de procedencias heterogeneas en un espacio comun.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles (no procesa lenguaje natural; la entrada son identificadores de genes Ensembl).
- Capacidades especiales: no dispone de modo thinking, vision ni audio.

## Casos de uso

- Anotacion celular automatica: usar los embeddings de 256 dimensiones como entrada a un clasificador supervisado (por ejemplo, regresion logistica o k-NN) entrenado con tipos celulares anotados; la alineacion ontologica del modelo facilita la transferencia entre tejidos y conjuntos.
- Integracion de datos scRNA-seq entre estudios: proyectar celulas de distintos conjuntos CELLxGENE en un espacio comun para corregir el efecto de lote antes de clustering, aprovechando que el modelo se entreno sobre 234 conjuntos.
- Busqueda de celulas similares: indexar los embeddings y recuperar las celulas mas parecidas a una consulta, util para identificar poblaciones raras o estados celulares poco representados.
- Clustering no supervisado: alimentar algoritmos como Leiden o K-means con los embeddings en lugar de la matriz de expresion, reduciendo dimensionalidad de miles de genes a 256 componentes.
- Analisis de linaje y relaciones entre tipos celulares: explotar la estructura ontologica aprendida para estudiar que tipos celulares quedan proximos en el espacio latente y contrastarlo con la jerarquia de la Cell Ontology.
- Preprocesamiento en pipelines de descubrimiento de biomarcadores: extraer representaciones compactas antes de modelos predictivos de enfermedad, dado que el corpus incluye 58 enfermedades.
- Experimentacion academica con objetivos guiados por ontologia: reutilizar las perdices LCA y los triplets publicados para estudiar el efecto de la ontologia en el aprendizaje de representaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene solo 8,9 M de parametros; en fp16 ocupa aproximadamente 18 MB de pesos, y en fp32 unos 35 MB. La memoria dominante sera la de activaciones y el tamano del batch, no los pesos.
- GPU recomendadas: cualquier GPU moderna es suficiente. Una RTX 4090, A100 o H100 queda sobredimensionada para este modelo; una GPU consumer de gama media o incluso CPU es viable para inferencia por lotes moderados.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con suficiente memoria para el batch (por ejemplo, 8 GB o menos).
- Opciones de despliegue: carga directa con `transformers` (`BertForMaskedLM.from_pretrained`); el repositorio oficial incluye `scripts/run_inference.py` para procesar un `.h5ad` con identificadores Ensembl. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje y no aplican directamente a este tipo de entrada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de scRNA-seq (como scGPT, Geneformer o scFoundation), por lo que la comparativa cuantitativa no esta disponible. A modo de contexto estructural, scOntoFM destaca por su tamano reducido (8,9 M de parametros frente a los cientos de millones o miles de millones de los modelos fundacionales de scRNA-seq mas conocidos) y por su enfoque en la ontologia celular; sin embargo, no se pueden aportar cifras comparativas de benchmarks sin inventar datos.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scOntoFM | 8,9 M | 2.002 tokens (top-2.000 genes) | BERT + objetivos guiados por Cell Ontology | MIT | Hugging Face |
| Alternativas de scRNA-seq | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de dominio muy especifico: solo procesa datos de scRNA-seq con identificadores de genes Ensembl y el esquema de tokenizacion propio (normalizacion por medianas y ranking); no es util para texto, codigo ni otras modalidades.
- Dependencia del vocabulario: el vocabulario de 19.941 genes y las medianas por gen estan fijados en el repositorio; genes fuera del vocabulario o datos con otra anotacion no podran representarse correctamente.
- Limitacion de contexto: solo se consideran los 2.000 genes con mayor rango; genes de baja expresion quedan fuera de la representacion.
- Sesgos del corpus: el entrenamiento se limita a celulas humanas de CELLxGENE (210 tejidos, 58 enfermedades); la representacion de tejidos, poblaciones o enfermedades poco representadas en ese corpus puede ser deficiente.
- Riesgo de alucinacion en la prediccion de genes enmascarados: el modelo puede predecir genes plausibles pero incorrectos; no debe usarse como sustituto de validacion experimental.
- Exclusiones del entrenamiento: 1.634.994 celulas sin anotacion, malignas o con terminos obsoletos no se usaron, lo que puede limitar la representacion de estados tumorales.
- Licencia: pesos y codigo bajo MIT, permisivo para uso comercial; la Cell Ontology es CC BY 4.0 y el corpus derivado de CELLxGENE es CC BY 4.0, por lo que su redistribucion exige atribucion.
- Advertencia para produccion: no se han publicado benchmarks ni evaluaciones de robustez; antes de usarlo en un pipeline clinico o de descubrimiento, conviene validarlo contra un baseline supervisado en los datos propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xiangyguo/scOntoFM
- Corpus de preentrenamiento: https://huggingface.co/datasets/xiangyguo/scOntoFM-pretrain-corpus
- Repositorio de codigo (tokenizacion e inferencia): https://github.com/woweizhi/scOntoFM
- Cell Ontology (OBO Foundry): https://obofoundry.org/ontology/cl.html
- CELLxGENE Discover: https://cellxgene.cziscience.com/
