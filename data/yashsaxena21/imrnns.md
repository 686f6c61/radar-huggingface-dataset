# yashsaxena21/IMRNNs

## Resumen

IMRNNs (Interpretable Modular Retrieval Neural Networks) es un sistema de recuperación densa de información desarrollado por Yash Saxena en el laboratorio KAI² de la Universidad de Maryland, condado de Baltimore (UMBC), y presentado en EACL 2026. El modelo aborda el problema de la falta de interpretabilidad en los sistemas de retrieval denso basados en embeddings: en lugar de limitarse a calcular similitudes coseno entre representaciones fijas, IMRNNs modula dinámicamente tanto las representaciones de las consultas como las de los documentos mediante dos adaptadores entrenados específicamente para la tarea.

La arquitectura se compone de un encoder base congelado (sentence-transformers/all-MiniLM-L6-v2) y dos módulos adicionales: un Query Adapter que condiciona cada representación de documento sobre la consulta, y un Document Adapter que utiliza información del conjunto de documentos candidatos para ajustar la representación de la consulta. El resultado es un sistema de retrieval que no solo mejora la precisión en colecciones científicas como SciFact, sino que además permite explicar cada decisión de ranking mediante conceptos a nivel de vocabulario y vectores de modulación.

La relevancia actual de este modelo radica en su enfoque interpretable para retrieval denso, un área donde la mayoría de soluciones (DPR, ColBERT, etc.) funcionan como cajas negras. Al ofrecer herramientas de explicación integradas, IMRNNs resulta atractivo para aplicaciones en dominios sensibles como la investigación científica, la medicina o el ámbito legal, donde comprender el razonamiento detrás de una recuperación es tan importante como la precisión misma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Transformer base (MiniLM-L6-v2) congelado + dos adaptadores modulares (Query Adapter y Document Adapter) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el encoder base MiniLM-L6-v2 soporta 512 tokens, pero no se especifica para el adaptador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el encoder base está entrenado principalmente en inglés) |
| Licencia | CC BY 4.0 |
| Formato de pesos | no disponible (el repositorio contiene checkpoints, probablemente en formato binario o safetensors, pero no se indica) |

## Arquitectura y entrenamiento

IMRNNs se basa en un encoder Transformer de tipo MiniLM-L6-v2, que permanece completamente congelado durante el entrenamiento de los adaptadores. La innovación principal reside en los dos módulos de modulación:

- **Query Adapter**: toma la representación del query y la utiliza para condicionar cada representación de documento, generando una versión adaptada del documento que es sensible al contexto de la consulta.
- **Document Adapter**: utiliza la información agregada del conjunto de documentos candidatos para ajustar la representación del query, de modo que la consulta se adapta al corpus específico que se está recuperando.

Ambos adaptadores se entrenan conjuntamente para optimizar la similitud coseno entre las representaciones moduladas. El entrenamiento se realiza sobre el dataset BeIR/scifact, un corpus de recuperación de evidencia científica. No se especifican detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se utilizaron técnicas de RLHF o DPO; la información disponible solo menciona que el encoder base permanece congelado y que los adaptadores se entrenan de forma supervisada.

El sistema incorpora además un mecanismo de interpretabilidad basado en una retroproyección de Moore-Penrose que permite inspeccionar los conceptos a nivel de vocabulario que influyen en las decisiones de modulación. Estos conceptos son ayudas de inspección y no deben tratarse como explicaciones causales en lenguaje natural, según advierte el autor.

## Capacidades

- Recuperación densa de documentos: dado un query y un conjunto de candidatos, produce un ranking ordenado por similitud coseno con puntuaciones moduladas.
- Modulación dinámica de embeddings: adapta tanto las representaciones de los documentos como la del query en función del contexto mutuo.
- Interpretabilidad integrada: el método `explain()` permite visualizar los tokens más influyentes a nivel de vocabulario y los vectores de modulación para cada decisión de retrieval.
- Generación de informes HTML: la explicación puede exportarse a un archivo HTML autocontenido para su revisión.
- Compatibilidad con embeddings existentes: permite rankear vectores precalculados con el encoder MiniLM anclado, facilitando su integración en pipelines ya construidos.
- API Python sencilla: el paquete `imrnns` ofrece una interfaz de alto nivel con métodos `rank()` y `explain()` que abstraen la complejidad interna.
- Recuperación en dominios científicos: el adaptador está específicamente entrenado para el corpus SciFact, orientado a la verificación de afirmaciones científicas.

## Casos de uso

- Verificación de afirmaciones científicas: un investigador puede usar IMRNNs para recuperar los documentos más relevantes que respalden o contradigan una afirmación extraída de un artículo, gracias a su entrenamiento específico en SciFact y a la interpretabilidad de las puntuaciones.

- Sistemas de búsqueda bibliográfica explicables: en una biblioteca digital, IMRNNs puede rankear artículos y, además, mostrar al usuario qué términos del documento y de la consulta contribuyeron a la decisión, aumentando la confianza en los resultados.

- Auditoría de pipelines de retrieval: los equipos que despliegan sistemas de búsqueda pueden usar el método `explain()` para auditar por qué ciertos documentos aparecen en posiciones altas o bajas, detectando posibles sesgos en los embeddings subyacentes.

- Recuperación aumentada para generación (RAG) con trazabilidad: al integrar IMRNNs como componente de retrieval en un sistema RAG, cada fragmento recuperado lleva asociada una explicación de su relevancia, lo que permite a los desarrolladores depurar mejor las respuestas generadas.

- Análisis de colecciones científicas en dominios específicos: el adaptador puede aplicarse a subconjuntos de SciFact o a colecciones similares para estudiar cómo se relacionan los conceptos entre consultas y documentos, aprovechando la modulación dinámica.

- Enseñanza e investigación en recuperación de información: IMRNNs sirve como banco de pruebas para estudiar el efecto de la modulación contextual en retrieval denso, gracias a su naturaleza modular y a las herramientas de visualización integradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como nDCG, MRR o Recall para SciFact ni comparaciones con otros sistemas de retrieval denso. El paper asociado (EACL 2026 Findings) podría contener dichos datos, pero no se proporcionan en la información facilitada.

## Requisitos de hardware

- El tamaño del repositorio es de 8.7 GB, lo que sugiere que los checkpoints de los adaptadores son considerablemente grandes (posiblemente debido a las matrices de proyección de los módulos de modulación).
- El ejemplo de uso en la documentación carga el adaptador en CPU (`device="cpu"`), lo que indica que la inferencia puede ejecutarse en hardware sin GPU, aunque con mayor latencia.
- No se especifican requisitos de VRAM ni GPUs recomendadas. Dado que el encoder base es MiniLM-L6-v2 (un modelo pequeño de ~22M parámetros), la inferencia debería ser factible en GPUs de consumo como una RTX 3060 o superior, pero el tamaño de los adaptadores podría aumentar los requisitos de memoria.
- Opciones de despliegue: el paquete `imrnns` está disponible en PyPI y se puede integrar en aplicaciones Python. No se mencionan integraciones con vLLM, llama.cpp u otros servidores de inferencia optimizados.
- La latencia y el throughput no se han publicado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Entrenamiento | Licencia | Interpretabilidad |
|---|---|---|---|---|---|
| IMRNNs (este) | MiniLM-L6-v2 + adaptadores modulares | no disponible | SciFact | CC BY 4.0 | Sí, integrada |
| DPR (Dense Passage Retrieval) | Bi-encoder Transformer (BERT) | 512 tokens | NQ, TriviaQA, etc. | Apache 2.0 | No |
| ColBERT | Late interaction (BERT) | 512 tokens | MS MARCO | MIT | Parcial (mapas de similitud) |
| Sentence-BERT (all-MiniLM-L6-v2) | Bi-encoder Transformer | 512 tokens | SNLI, MultiNLI | Apache 2.0 | No |

La comparativa se basa en características generales conocidas de estos modelos; no se dispone de datos de rendimiento específicos para IMRNNs en los mismos benchmarks que DPR o ColBERT.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente para el corpus SciFact; su rendimiento en otros dominios o colecciones no está garantizado y podría degradarse significativamente.
- Los conceptos de vocabulario generados por la retroproyección de Moore-Penrose pueden contener fragmentos de WordPiece y no deben interpretarse como racionales causales en lenguaje natural.
- No se especifican los idiomas soportados; dado que el encoder base MiniLM-L6-v2 está entrenado principalmente en inglés, el modelo probablemente solo funcione bien con texto en inglés.
- La licencia CC BY 4.0 permite uso comercial siempre que se atribuya adecuadamente, pero es recomendable revisar los términos completos antes de un despliegue en producción.
- El tamaño del repositorio (8.7 GB) sugiere que los checkpoints pueden ser pesados, lo que podría complicar el despliegue en entornos con restricciones de almacenamiento o memoria.
- No hay información sobre sesgos específicos del modelo, pero al basarse en MiniLM y entrenarse en SciFact, podría heredar sesgos presentes en esos datos.
- El riesgo de alucinación no aplica directamente, ya que no es un modelo generativo, pero sí existe riesgo de recuperar documentos irrelevantes si la consulta está fuera de distribución.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/yashsaxena21/IMRNNs)
- [Paper en ACL Anthology (EACL 2026)](https://aclanthology.org/2026.findings-eacl.333/)
- [Documentación en GitHub](https://github.com/YashSaxena21/IMRNNs)
- [Paquete en PyPI](https://pypi.org/project/imrnns/)
- [Proyecto web](https://yashsaxena21.github.io/IMRNNs-web/)
- [Portfolio del autor](https://yashsaxena21.github.io/Portfolio/)
- [Dataset BeIR/scifact](https://huggingface.co/datasets/BeIR/scifact)
