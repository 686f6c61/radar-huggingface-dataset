# tokiers/potion-science-8M

## Resumen

potion-science-8M es un modelo de embeddings estáticos de muy pequeño tamano (7,56 millones de parametros) desarrollado por el usuario tokiers y publicado en HuggingFace bajo licencia MIT. Se trata de una destilación del sentence transformer `baai/bge-base-en-v1.5` realizada con la técnica Model2Vec y el pipeline de entrenamiento Tokenlearn, ambos desarrollados por Minish Lab. El modelo genera representaciones vectoriales de texto sin pasar por una red transformer completa en tiempo de inferencia: cada token tiene un vector precalculado y el embedding de una frase se obtiene por agregación ponderada de esos vectores.

El problema que resuelve es el coste computacional de los embeddings densos en producción. Al eliminar el paso por la red neuronal, la codificación resulta varios órdenes de magnitud más rápida tanto en CPU como en GPU, lo que lo hace adecuado para búsqueda semántica a gran escala, deduplicación de documentos o filtrado en tiempo real donde el presupuesto de latencia es muy ajustado. Su especialización es el dominio científico: se ha preentrenado sobre el dataset `scientific_papers`, compuesto por artículos de Arxiv y Pubmed.

Es relevante ahora porque la familia Model2Vec ha demostrado que los embeddings estáticos pueden acercarse a los transformers en tareas MTEB con una fracción del coste. Este modelo concreto, sin embargo, es una publicación de un autor individual con 18 descargas y sin métricas publicadas en la información disponible, por lo que debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos (Model2Vec, destilado de sentence transformer) |
| Parametros totales | 7.559.168 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos estáticos; formatos safetensors y ONNX) |
| Idiomas soportados | No disponible (el modelo base bge-base-en-v1.5 es inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

Model2Vec sustituye el encoder transformer por una tabla de embeddings estática: cada token del vocabulario tiene asociado un vector y el embedding de una secuencia se calcula como una media ponderada de los vectores de sus tokens. El modelo se construye en cuatro fases según la model card: (1) destilación del sentence transformer `baai/bge-base-en-v1.5` mediante Model2Vec; (2) generación de datos de entrenamiento calculando embeddings medios de salida sobre un corpus amplio con el modelo profesor; (3) entrenamiento del modelo destilado con Tokenlearn sobre esos datos; y (4) re-regularización posterior mediante ponderación por frecuencia de tokens, PCA y SIF weighting.

El corpus de preentrenamiento es el dataset `scientific_papers`, que reúne artículos de Arxiv y Pubmed. El repositorio incluye además un tokenizador precompilado de tokie (`tokenizer.tkz`) que, según el autor, ofrece una tokenización unas 5 veces más rápida y es un reemplazo directo de los tokenizadores de HuggingFace. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del corpus ni si hubo etapas de RLHF o DPO (no aplicables en un modelo de embeddings).

## Capacidades

- Generación de embeddings de texto para similitud semántica, búsqueda y clustering.
- Codificación muy rápida en CPU y GPU al no requerir forward pass por una red transformer.
- Especialización en vocabulario y estilo de texto científico (Arxiv, Pubmed).
- Compatible con la API `StaticModel` de la librería `model2vec` y con el ecosistema sentence-transformers.
- Tokenizador tokie incluido para tokenización acelerada.
- Exportación a ONNX para despliegue en entornos sin Python o con runtime propio.
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso: es exclusivamente un encoder de embeddings.

## Casos de uso

- Búsqueda semántica sobre repositorios de papers: indexar abstracts y cuerpos de artículos de Arxiv y Pubmed y recuperar por similitud con consultas en lenguaje natural, aprovechando que el modelo fue entrenado en ese dominio.
- Deduplicación de literatura científica: calcular embeddings de miles de documentos y agrupar por cercanía vectorial para detectar preprints duplicados o versiones casi idénticas.
- Filtrado y triaje en pipelines de revisión sistemática: prefiltrar candidatos relevantes antes de pasarlos a un modelo más caro o a revisión humana, con latencia muy baja.
- Recomendación de artículos relacionados: generar embeddings de cada publicación y servir recomendaciones por vecino más cercano en un índice vectorial (FAISS, Qdrant, etc.).
- Clasificación y clustering de temáticas: agrupar corpus científicos por área temática sin etiquetas, usando los embeddings como entrada a k-means o clasificadores ligeros.
- Enriquecimiento de bases de conocimiento internas: vectorizar documentación técnica o notas de laboratorio para un asistente de búsqueda sobre un índice propio.
- Procesamiento en el edge o en entornos con CPU únicamente: al ser estático y diminuto (0,2 GB de repo), puede ejecutarse en dispositivos sin GPU para tareas de similitud en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la página de resultados de Model2Vec, pero no incluye cifras concretas para este modelo.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB; los 7,56 M de parámetros en fp32 ocupan aproximadamente 30 MB, y el repo completo pesa 0,2 GB.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (RTX 3060, RTX 4090) o incluso CPU es suficiente.
- Cabe holgadamente en cualquier GPU consumer e incluso en dispositivos de baja potencia.
- Opciones de despliegue: librería `model2vec` (`StaticModel.from_pretrained`), runtime ONNX, y cualquier pipeline de sentence-transformers compatible con embeddings estáticos.
- Latencia y throughput: no se han publicado cifras concretas en la información disponible; la model card afirma que los embeddings se calculan "órdenes de magnitud más rápido" que un sentence transformer, y que el tokenizador tokie es 5 veces más rápido que los tokenizadores de HuggingFace.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tokiers/potion-science-8M | 7,56 M | Embeddings estáticos (Model2Vec) | No disponible | MIT | HuggingFace |
| minishlab/potion-base-8M | 7,56 M (aprox.) | Embeddings estáticos (Model2Vec) | No disponible | MIT | HuggingFace |
| baai/bge-base-en-v1.5 | 109 M | Transformer (encoder) | 512 tokens | MIT | HuggingFace |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | Transformer (encoder) | 256 tokens | Apache 2.0 | HuggingFace |

No se dispone de resultados MTEB publicados para este modelo concreto, por lo que la comparación de rendimiento no puede cuantificarse. Frente a `bge-base-en-v1.5` (su profesor), este modelo es más de un orden de magnitud menor y mucho más rápido, a costa de una pérdida de calidad esperable en la destilación. Frente a `all-MiniLM-L6-v2`, es tres veces menor y estático, pero este último sigue siendo un transformer con mejor calidad general en tareas fuera del dominio científico.

## Limitaciones y advertencias

- Modelo de embeddings estáticos: no genera texto ni razona; cualquier expectativa de uso como LLM es incorrecta.
- Entrenado sobre papers científicos (Arxiv, Pubmed): su rendimiento fuera de ese dominio (texto coloquial, jurídico, código) es probablemente inferior y no está medido.
- El modelo base es `bge-base-en-v1.5`, de modo que el soporte multilingüe es limitado o inexistente; no se declaran idiomas soportados.
- No hay benchmarks publicados ni evaluaciones independientes; el autor es individual y el modelo acumula 18 descargas, por lo que no hay evidencia de calidad en producción.
- Riesgo de sesgo heredado del corpus científico (sobrerrepresentación de ciertas disciplinas, idioma inglés y estilos de escritura académica).
- La licencia MIT permite uso comercial sin restricciones, pero conviene verificar la licencia del dataset `scientific_papers` y del modelo profesor para usos derivados.
- La longitud de contexto no está documentada; en embeddings estáticos la agregación suele funcionar sobre secuencias cortas o medianas, pero no hay garantía formal.
- El tokenizador tokie es un componente del ecosistema del autor; verificar compatibilidad con pipelines existentes antes de adoptarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tokiers/potion-science-8M
- Repositorio Model2Vec: https://github.com/MinishLab/model2vec
- Repositorio Tokenlearn: https://github.com/MinishLab/tokenlearn
- Resultados de Model2Vec: https://github.com/MinishLab/model2vec/blob/main/results/README.md
- Tutoriales de Model2Vec: https://github.com/MinishLab/model2vec/tree/main/tutorials
- Modelos Model2Vec en el hub: https://huggingface.co/models?library=model2vec
- Modelo profesor: https://huggingface.co/baai/bge-base-en-v1.5
- Dataset scientific_papers: https://huggingface.co/datasets/armanc/scientific_papers
- Tokenizador tokie: https://github.com/chonkie-inc/tokie
- Paper de SIF weighting: https://openreview.net/pdf?id=SyK00v5xx
