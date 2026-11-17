# xiangyguo/scOntoFM

## Resumen

scOntoFM es un modelo fundacional para biología computacional desarrollado por xiangyguo (autor individual, sin afiliación institucional indicada en la model card) y aceptado en NeurIPS 2026. Se trata de un transformer tipo BERT de 8,9 millones de parámetros entrenado para generar representaciones de células individuales a partir de datos de secuenciación de ARN de célula única (scRNA-seq). Su particularidad es que incorpora explícitamente la jerarquía de la Cell Ontology en el aprendizaje de representaciones mediante triplets guiados por distancias LCA (lowest common ancestor) entre términos ontológicos.

El modelo resuelve el problema de obtener embeddings celulares que preserven la estructura biológica jerárquica, algo que los modelos fundacionales de scRNA-seq convencionales no garantizan. Se entrena sobre 27,5 millones de células humanas procedentes de 234 conjuntos de CELLxGENE, cubriendo 210 tejidos, 566 tipos celulares y 58 enfermedades.

Con solo 8,9M de parámetros y un repositorio de 0,7 GB, es un modelo extremadamente ligero en comparación con los grandes modelos fundacionales de célula única (de cientos de millones a miles de millones de parámetros), lo que lo hace viable en hardware modesto. Su licencia MIT y su integración con la librería `transformers` facilitan su adopción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (`BertForMaskedLM`): 6 capas, hidden size 256, 4 cabezas de atención, intermediate 512 |
| Parametros totales | 8.867.301 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.002 tokens (`<cls>` + top-2.000 genes + `<eos>`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biológico; la entrada son identificadores de genes, no texto natural) |
| Licencia | MIT (pesos y código); Cell Ontology CC BY 4.0; corpus derivado de CZ CELLxGENE Discover CC BY 4.0 |
| Formato de pesos | safetensors (`model.safetensors`), configuración `config.json` |
| Vocabulario | 19.941 tokens (identificadores de genes) |
| Dimension del embedding celular | 256 (estado `<cls>` de la última capa) |
| Pipeline | feature-extraction / fill-mask |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT con 6 capas, dimensión oculta de 256, 4 cabezas de atención y capa intermedia de 512, totalizando 8,9M de parámetros. La entrada no es texto: cada célula se representa como una secuencia de `<cls>` seguido de los 2.000 genes con mayor rango tras normalización por mediana, y un token `<eos>` final, con longitud máxima de 2.002. El vocabulario de 19.941 tokens corresponde a identificadores de genes. La tokenización (normalización por mediana por gen y ranking) se implementa en el repositorio de código del autor, e incluye los ficheros `vocab/token_dictionary.pkl` y `vocab/gene_medians.pkl`.

El entrenamiento usa 27.525.118 células humanas del corpus `xiangyguo/scOntoFM-pretrain-corpus` (que contiene 29.160.112 células; se excluyen 1.634.994 sin anotar, malignas o con términos obsoletos), provenientes de 234 conjuntos de CELLxGENE, 210 tejidos, 566 tipos celulares y 58 enfermedades. Se realizan 3 épocas en 6 GPU H200 con DeepSpeed ZeRO-2, precisión fp16, optimizador AdamW con lr 1e-3 y batch global de 1.536 triplets. La innovación clave es el uso de triplets (anchor, positive, negative) construidos con distancias LCA entre términos de la Cell Ontology (versión CL 2025-07-30), de modo que el objetivo de entrenamiento respeta la jerarquía biológica: células de tipos más próximos en la ontología quedan más cerca en el espacio de representación. Los ficheros `assets/celltype_similarity_LCA_deepest_allnodes.pkl`, `assets/CL_id_map.pkl` y `assets/triplet_ind_hard_top50.pkl` documentan estos componentes auxiliares.

## Capacidades

- Generación de embeddings celulares de 256 dimensiones a partir de recuentos crudos de scRNA-seq (formato `.h5ad` con identificadores de gen Ensembl).
- Extracción de características (`feature-extraction`) para tareas downstream de análisis de célula única.
- Modelado de lenguaje enmascarado sobre secuencias de genes (`fill-mask`), heredado del objetivo de preentrenamiento BERT.
- Preservación de la estructura biológica jerárquica: los embeddings reflejan distancias ontológicas entre tipos celulares.
- No es un modelo generativo de texto ni de código; no soporta tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades de visión, audio ni multilingües en sentido convencional.

## Casos de uso

- Anotación de tipos celulares: los embeddings `<cls>` de 256 dimensiones sirven como entrada a clasificadores ligeros (kNN, regresión logística) para asignar tipos celulares a poblaciones nuevas, aprovechando que el espacio latente respeta la jerarquía de la Cell Ontology.
- Integración de datos entre experimentos y lotes: al producir representaciones comparables entre 234 conjuntos y 210 tejidos, los embeddings facilitan la corrección de lote y la integración de scRNA-seq heterogéneo.
- Clustering y análisis exploratorio: los 256-d permiten agrupar células con métodos estándar (Leiden/Louvain sobre kNN) preservando relaciones biológicas finas entre tipos próximos.
- Detección de estados celulares anómalos: comparando distancias ontológicas en el espacio latente se pueden identificar poblaciones que se desvían de su tipo esperado, útil en estudios de enfermedad (el corpus cubre 58 enfermedades).
- Búsqueda y recuperación de células similares: los embeddings permiten construir índices vectoriales para recuperar células de referencia similares a una consulta.
- Preentrenamiento ligero y prototipado rápido: con 8,9M de parámetros y 0,7 GB, se puede ejecutar y ajustar en una GPU de consumo para experimentos exploratorios o docencia.
- Transferencia a tareas downstream con pocas etiquetas: los embeddings congelados sirven como base para fine-tuning con conjuntos pequeños, dado el preentrenamiento masivo sobre 27,5M de células.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el modelo "mejora consistentemente el rendimiento en diversas tareas downstream" y "mejora significativamente la preservación de la estructura biológica", pero no incluye cifras concretas (ni MMLU, ni métricas específicas de scRNA-seq como precisión de anotación o silhouette score). No se inventan números.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 (8,9M de parámetros); el cuello de botella es el tamaño del vocabulario (19.941 tokens) y la longitud de secuencia (2.002), no los pesos.
- GPU recomendadas: cualquier GPU moderna; el entrenamiento original usó 6 × H200, pero la inferencia cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: `transformers` (carga directa con `BertForMaskedLM.from_pretrained`), script de inferencia del repositorio `scripts/run_inference.py`; el uso de vLLM, llama.cpp u Ollama no está documentado para este modelo y no es el caso de uso previsto (entrada biológica, no texto).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| scOntoFM | 8,9M | top-2.000 genes (2.002 tokens) | MIT | Hugging Face, `transformers` |
| Geneformer | no disponible en la información | no disponible | no disponible | Hugging Face |
| scGPT | no disponible en la información | no disponible | no disponible | Hugging Face |
| scFoundation | no disponible en la información | no disponible | no disponible | Hugging Face |

No se dispone en la información proporcionada de datos de parámetros, contexto, rendimiento o licencia de los modelos comparables (Geneformer, scGPT, scFoundation), por lo que la comparativa cuantitativa no está disponible. La diferencia cualitativa destacable de scOntoFM es su tamaño mucho menor (8,9M) y la integración explícita de la Cell Ontology en el objetivo de entrenamiento.

## Limitaciones y advertencias

- Solo cubre células humanas: el corpus de entrenamiento son 27,5 millones de células humanas; no se documenta soporte para otras especies.
- Entrada restringida: requiere recuentos crudos `.h5ad` con identificadores de gen Ensembl y la tokenización específica (normalización por mediana y ranking top-2.000); no acepta texto libre ni otras modalidades.
- Ventana limitada a 2.000 genes: los genes fuera del top-2.000 por mediana no se consideran en la representación.
- Riesgo de sesgo de anotación: el modelo hereda los sesgos y errores de anotación de los 234 conjuntos de CELLxGENE; las células sin anotar, malignas o con términos obsoletos se excluyeron del entrenamiento, lo que puede limitar la representación de estados tumorales o mal anotados.
- No es un modelo generativo de texto: no debe evaluarse con benchmarks de NLP ni usarse para tareas de lenguaje.
- Licencia MIT para pesos y código, pero el corpus derivado de CELLxGENE y la Cell Ontology tienen sus propias condiciones (CC BY 4.0); verificar el cumplimiento de atribución en uso comercial.
- Sin métricas de benchmark publicadas en la información disponible: la evaluación de su rendimiento real en tareas downstream requiere validación propia.
- Adopción muy baja (96 descargas, 0 likes) y autor individual: menor madurez de ecosistema y soporte comunitario en comparación con modelos establecidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xiangyguo/scOntoFM
- Dataset de preentrenamiento: https://huggingface.co/datasets/xiangyguo/scOntoFM-pretrain-corpus
- Repositorio de código: https://github.com/woweizhi/scOntoFM
- CZ CELLxGENE Discover: https://cellxgene.cziscience.com/
- Cell Ontology: https://obofoundry.org/ontology/cl.html
