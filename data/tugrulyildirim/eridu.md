# tugrulyildirim/eridu

## Resumen

El modelo `tugrulyildirim/eridu` aparece registrado en Hugging Face con una ficha mínima que solo incluye la licencia MIT y sin documentación adicional. Sin embargo, los resultados de búsqueda web apuntan a un modelo homónimo publicado por la organización Graphlet-AI (`Graphlet-AI/eridu`), que es un modelo de *sentence-transformers* diseñado para tareas de resolución de entidades, concretamente para el emparejamiento difuso de nombres de personas y empresas entre distintos idiomas y conjuntos de caracteres. Este modelo se distribuye con licencia Apache-2.0 y está disponible en el Hub con pesos en formato Safetensors.

Dado que la información oficial del repositorio `tugrulyildirim/eridu` es prácticamente inexistente, esta ficha se basa en los datos públicos del modelo `Graphlet-AI/eridu`, que parece ser el mismo artefacto o una copia sin documentar. Se recomienda verificar la autoría y la licencia antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (BERT) para embeddings de oraciones (Sentence-BERT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo afirma funcionar "across different languages", pero no se especifican) |
| Licencia | MIT (segun el repositorio `tugrulyildirim/eridu`); Apache-2.0 (segun `Graphlet-AI/eridu`) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Sentence-BERT, que adapta un transformer preentrenado (tipo BERT) para producir embeddings de oraciones mediante siamese networks. Según la información disponible, fue entrenado con una función de pérdida ContrastiveLoss sobre un dataset de 2.130.620 pares de textos, con el objetivo de aprender representaciones que acerquen entidades equivalentes (mismos nombres de personas o empresas escritos de forma diferente) y separen las que no lo son. No se han publicado detalles sobre el número de parámetros, el tamaño del contexto ni el proceso de entrenamiento completo (épocas, optimizador, etc.). El paper de referencia es el de Sentence-BERT (arxiv:1908.10084), que describe la metodología general.

## Capacidades

- Generación de embeddings de oraciones para similitud semántica.
- Resolución de entidades: emparejamiento difuso de nombres de personas y empresas.
- Funciona con diferentes idiomas y conjuntos de caracteres (según la descripción del autor).
- Integración sencilla con la librería Sentence Transformers en cinco líneas de código.
- No se mencionan capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Deduplicación de registros en bases de datos de clientes: el modelo puede comparar nombres de personas o empresas escritos de forma ligeramente distinta (variaciones ortográficas, transliteraciones, abreviaturas) y decidir si corresponden a la misma entidad.
- Limpieza de datos maestros: al integrarse en pipelines de ETL, permite normalizar y fusionar registros duplicados en sistemas CRM o ERP.
- Enriquecimiento de datos externos: emparejar registros internos con fuentes públicas (registros mercantiles, listas de sanciones) usando nombres como clave.
- Detección de fraude: identificar si una misma persona o empresa aparece bajo diferentes identidades en transacciones o documentos.
- Búsqueda semántica de entidades: dado un nombre, recuperar todos los registros relacionados en un corpus grande.
- Migración de sistemas legados: al unificar bases de datos de distintas fuentes, el modelo ayuda a mapear entidades equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que el modelo no está orientado a tareas de razonamiento general sino a embeddings de similitud.

## Requisitos de hardware

- Al ser un modelo basado en BERT de tamaño probablemente pequeño (similar a `all-MiniLM-L6-v2`), puede ejecutarse en CPU con memoria RAM suficiente (4-8 GB).
- Para inferencia en lote sobre grandes volúmenes de datos, se recomienda una GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA T4, GTX 1660, RTX 3060).
- Es compatible con la librería `sentence-transformers` y con el servidor de inferencia `text-embeddings-inference` (mencionado en la búsqueda).
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|---|
| `Graphlet-AI/eridu` | BERT (Sentence-BERT) | no disponible | no disponible | Apache-2.0 | Resolución de entidades |
| `sentence-transformers/all-MiniLM-L6-v2` | BERT (MiniLM) | 22M | 256 tokens | Apache-2.0 | Embeddings de oraciones generales |
| `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` | BERT (MiniLM) | 118M | 128 tokens | Apache-2.0 | Embeddings multilingües |

No se dispone de comparativa directa con otros modelos especializados en resolución de entidades, ya que no hay datos públicos de rendimiento.

## Limitaciones y advertencias

- La información oficial del repositorio `tugrulyildirim/eridu` es inexistente; la ficha se ha construido a partir de datos de un repositorio homónimo de Graphlet-AI, por lo que la autoría y la licencia reales son inciertas.
- No se han publicado detalles sobre sesgos, alucinaciones o limitaciones de idioma.
- El modelo está diseñado exclusivamente para embeddings de similitud; no genera texto ni realiza razonamiento.
- La licencia MIT del repositorio original permite uso comercial, pero la licencia Apache-2.0 del repositorio de Graphlet-AI también lo permite, aunque con condiciones de atribución. Se debe verificar cuál aplica al artefacto descargado.
- No se especifica la longitud máxima de entrada, lo que puede limitar su uso con nombres muy largos o contextos extensos.

## Enlaces

- Repositorio Hugging Face (ID proporcionado): https://huggingface.co/tugrulyildirim/eridu
- Repositorio Hugging Face (Graphlet-AI): https://huggingface.co/Graphlet-AI/eridu
- GitHub de Graphlet-AI: https://github.com/Graphlet-AI/eridu
- README en GitHub: https://github.com/Graphlet-AI/eridu/blob/main/README.md
- Paquete PyPI: https://pypi.org/project/eridu/
- Paper de referencia (Sentence-BERT): https://arxiv.org/abs/1908.10084
