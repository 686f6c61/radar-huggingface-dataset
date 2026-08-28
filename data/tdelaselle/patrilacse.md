# TdelaSelle/PatriLaCSE

## Resumen

PatriLaCSE es un modelo de embeddings de frases (sentence-transformers) desarrollado por Théotime de la Selle, especializado en latín patrístico y tardoantiguo. Se basa en el modelo `bowphs/LaBerta` (Latin BERT), un transformer de tipo RoBERTa preentrenado con textos latinos, y se ha ajustado mediante aprendizaje contrastivo con pérdidas de ranking de negativos múltiples para mejorar la representación semántica de oraciones. El resultado es un modelo denso de 126 millones de parámetros que proyecta frases y párrafos a un espacio vectorial de 768 dimensiones, optimizado para similitud coseno.

La relevancia de este modelo reside en su aplicación a un dominio muy específico: las lenguas clásicas y la intertextualidad en textos patrísticos. Mientras que los modelos multilingües o monolingües modernos apenas cubren el latín tardío con vocabulario cristiano, PatriLaCSE ofrece una herramienta ajustada para tareas como búsqueda semántica de citas, detección de paralelismos y análisis de influencias entre autores. Su tamaño compacto permite ejecutarlo en hardware modesto, lo que facilita su uso en proyectos de humanidades digitales.

El modelo se distribuye a través de Hugging Face con formato safetensors y es compatible con la librería `sentence-transformers` y el ecosistema de Text Embeddings Inference (TEI). No se ha publicado información sobre la licencia ni sobre el conjunto de entrenamiento más allá del número de ejemplos (198 457), por lo que su uso en producción requiere verificación adicional de esos aspectos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (RoBERTa) con capa de pooling para embeddings de frases |
| Parametros totales | 125 978 112 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors de precisión completa; no se indican versiones cuantizadas) |
| Idiomas soportados | Latín (especialmente latín patrístico y tardoantiguo; no se especifican otros idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `bowphs/LaBerta`, un transformer de tipo RoBERTa preentrenado sobre corpus latinos. Sobre esta base se añade una capa de pooling que produce un vector denso de 768 dimensiones para cada frase o párrafo. La función de similitud utilizada es la coseno.

El ajuste fino se realizó con las funciones de pérdida `CachedMultipleNegativesRankingLoss` y `MultipleNegativesRankingLoss`, típicas del aprendizaje contrastivo para recuperación de información. El conjunto de entrenamiento contiene 198 457 ejemplos, aunque no se detalla su composición ni procedencia. Dado el nombre del modelo y los ejemplos mostrados en la tarjeta (citas de Agustín de Hipona, textos litúrgicos, etc.), es razonable inferir que el corpus proviene de obras patrísticas latinas, pero este dato no está confirmado explícitamente.

La longitud máxima de secuencia es de 256 tokens, lo que limita la capacidad de procesar párrafos largos, pero es suficiente para la mayoría de frases y citas breves. No se mencionan innovaciones arquitectónicas adicionales; el interés del modelo reside en su especialización en un dominio lingüístico poco cubierto.

## Capacidades

- Generación de embeddings de frases y párrafos en latín para tareas de similitud semántica.
- Búsqueda semántica (semantic search) y recuperación de información en corpus latinos patrísticos.
- Minería de paráfrasis y detección de paralelismos textuales.
- Clasificación de textos mediante la representación vectorial obtenida.
- Agrupamiento (clustering) de pasajes por similitud temática o estilística.
- Compatibilidad con la API de `sentence-transformers` y con Text Embeddings Inference (TEI) para despliegue en producción.
- No se han documentado capacidades de generación de texto, tool calling, agentes o visión; es un modelo puramente de embeddings.

## Casos de uso

- Búsqueda de citas y paralelos en obras patrísticas: un investigador puede indexar las obras completas de Agustín o Jerónimo y consultar frases en latín para encontrar pasajes paralelos o alusiones. La ventana de 256 tokens es adecuada para citas breves y la similitud coseno ofrece resultados razonables (accuracy@1 de 0,51 en el benchmark propio).
- Detección de intertextualidad en la literatura cristiana antigua: el modelo permite comparar fragmentos de distintos autores y detectar influencias o dependencias textuales, una tarea central en filología patrística.
- Análisis de variantes textuales y crítica textual: al representar cada lectura como un vector, se pueden agrupar variantes de manuscritos y medir su proximidad semántica.
- Construcción de tesauros y ontologías de conceptos teológicos: a partir de los embeddings se pueden agrupar términos y expresiones recurrentes en los Padres de la Iglesia.
- Sistemas de recomendación de lecturas en bibliotecas digitales de latín: dado un pasaje, sugerir otros textos relacionados por contenido semántico.
- Entrenamiento de clasificadores de género o autoría: los embeddings sirven como características de entrada para modelos de clasificación supervisada sobre corpus latinos.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en una tarea de recuperación de información sobre un conjunto de evaluación propio (`patrilacse-ir`). No se proporcionan comparaciones con otros modelos, por lo que estos valores deben interpretarse como una referencia interna.

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,510 |
| Cosine Accuracy@3 | 0,606 |
| Cosine Accuracy@5 | 0,645 |
| Cosine Accuracy@10 | 0,681 |
| Cosine Precision@1 | 0,510 |
| Cosine Precision@3 | 0,239 |
| Cosine Precision@5 | 0,158 |
| Cosine Precision@10 | 0,086 |
| Cosine Recall@1 | 0,377 |
| Cosine Recall@3 | 0,497 |
| Cosine Recall@5 | 0,540 |
| Cosine Recall@10 | 0,581 |
| Cosine NDCG@10 | 0,522 |
| Cosine MRR@10 | 0,567 |
| Cosine MAP@100 | 0,478 |

No se han publicado resultados en benchmarks estandarizados como MMLU, HumanEval o MTEB, ni comparaciones con otros modelos de embeddings para latín.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 126 millones de parámetros, la inferencia en precisión FP32 requiere aproximadamente 0,5 GB de memoria. Con cuantización a FP16 o int8, el consumo se reduce a unos 0,25 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050, RTX 2060 o superiores funcionan sin problemas. También se puede ejecutar en CPU.
- Compatibilidad con hardware de consumo: sí, cabe en cualquier GPU consumer moderna e incluso en Raspberry Pi con suficiente RAM.
- Opciones de despliegue: `sentence-transformers` (Python), Text Embeddings Inference (TEI) de Hugging Face, y en general cualquier framework que soporte ONNX o safetensors.
- Latencia y throughput: no se han publicado datos oficiales. En una GPU media (por ejemplo, RTX 3090), se pueden procesar cientos de frases por segundo, dada la pequeña longitud de secuencia.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de embeddings para latín. Existen alternativas como `LaBerta` (el modelo base) o modelos multilingües como `multilingual-e5`, pero no se han publicado evaluaciones comparativas con PatriLaCSE. Por tanto, se indica que la comparativa no está disponible.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide garantizar su uso comercial o en proyectos cerrados sin consultar al autor.
- El contexto máximo es de 256 tokens, insuficiente para párrafos extensos o documentos completos.
- El modelo está especializado en latín patrístico; su rendimiento en latín clásico, medieval o humanístico puede ser inferior.
- No se han documentado los sesgos del corpus de entrenamiento, pero al basarse en textos religiosos cristianos, es probable que refleje el vocabulario y las perspectivas de ese ámbito.
- Riesgo de alucinación no aplica directamente al ser un modelo de embeddings, pero sí puede producir falsos positivos en búsquedas semánticas si los textos son muy similares en vocabulario pero diferentes en significado.
- No se han publicado resultados en benchmarks externos, por lo que su rendimiento fuera del dominio patrístico es desconocido.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente o de uso muy específico; conviene validar su calidad en el caso de uso concreto antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TdelaSelle/PatriLaCSE
- Modelo base LaBerta: https://huggingface.co/bowphs/LaBerta
- Repositorio de modelos del autor: https://huggingface.co/TdelaSelle/models
- GitHub del autor: https://github.com/Tdelaselle
- Proyecto PatriBERT (relacionado, en GitHub): https://github.com/Tdelaselle/PatriBERT
