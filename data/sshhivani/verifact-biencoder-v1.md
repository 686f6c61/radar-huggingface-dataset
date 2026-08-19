# SSHHIVANI/verifact-biencoder-v1

## Resumen

El modelo `SSHHIVANI/verifact-biencoder-v1` es un codificador de frases (sentence transformer) basado en `sentence-transformers/all-MiniLM-L6-v2`, fine-tuneado para tareas de verificación de hechos mediante un enfoque de biencoder. Desarrollado por el usuario SSHHIVANI, el modelo mapea frases y párrafos a un espacio vectorial denso de 384 dimensiones, optimizado para similitud semántica, búsqueda semántica y recuperación de información. Su nombre sugiere una conexión con el proyecto VeriFact, orientado a la detección y verificación de desinformación en el ámbito de la salud, aunque el autor no proporciona documentación explícita sobre el dataset de entrenamiento ni los objetivos concretos.

Con 22,7 millones de parámetros y una longitud de contexto máxima de 256 tokens, es un modelo ligero y eficiente, adecuado para despliegue en entornos con recursos limitados. La arquitectura es un transformer BERT de 6 capas con pooling medio y normalización, y fue entrenado con la función de pérdida MultipleNegativesRankingLoss sobre un dataset de 4.555 ejemplos. A pesar de su pequeño tamaño, su relevancia radica en la posibilidad de usarlo como componente de sistemas de verificación de afirmaciones, especialmente en dominios especializados como el clínico o el sanitario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BertModel (transformer encoder, 6 capas) con pooling mean y normalización |
| Parametros totales | 22.713.216 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los ejemplos del widget están en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de `all-MiniLM-L6-v2`, un transformer BERT de 6 capas con 384 dimensiones ocultas. La estructura completa incluye un módulo `BertModel` para extracción de características, una capa de pooling con estrategia `mean` que agrega los embeddings de los tokens, y una capa de normalización L2. El modelo fue fine-tuneado con la función de pérdida `MultipleNegativesRankingLoss`, típica en sistemas biencoder para aprendizaje de similitud entre pares de frases (afirmación y pasaje de evidencia). El dataset de entrenamiento contiene 4.555 ejemplos, aunque no se especifica su composición ni procedencia. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es supervisado con pares positivos y negativos implícitos.

## Capacidades

- Generación de embeddings densos de 384 dimensiones para frases y párrafos cortos (máximo 256 tokens).
- Similitud semántica entre textos mediante similitud coseno.
- Búsqueda semántica y recuperación de pasajes relevantes para una consulta dada.
- Verificación de hechos por recuperación: dado un enunciado, puede encontrar evidencia de apoyo o refutación en un corpus.
- Clasificación y agrupamiento (clustering) de textos basado en similitud.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de embeddings.

## Casos de uso

- Verificación de afirmaciones en textos clínicos: el modelo puede codificar una afirmación médica y un pasaje de la historia clínica electrónica para determinar si el pasaje respalda la afirmación, como parte de un sistema tipo VeriFact.
- Detección de desinformación en salud: al comparar publicaciones o mensajes en redes sociales con fuentes verificadas, el modelo puede identificar declaraciones sin respaldo.
- Búsqueda semántica en documentación médica: permite recuperar pasajes relevantes de guías clínicas o artículos científicos a partir de consultas en lenguaje natural.
- Minería de paráfrasis: identifica frases equivalentes en corpus grandes, útil para consolidar información duplicada.
- Clasificación de tickets de soporte: agrupa consultas de usuarios por tema usando embeddings de frases.
- Sistema de preguntas y respuestas con recuperación (retrieval-augmented generation): como componente de recuperación, alimenta a un LLM generativo con pasajes relevantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otros conjuntos de evaluación estándar. El modelo solo presenta ejemplos de uso en el widget de la model card, sin métricas cuantitativas.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 (el modelo ocupa ~91 MB en pesos), por lo que cabe en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1650, RTX 3060, o incluso CPUs con suficiente RAM.
- Es viable su ejecución en CPU para inferencia por lotes pequeños; la latencia es de pocos milisegundos por frase en hardware moderno.
- Opciones de despliegue: compatible con la librería `sentence-transformers`, así como con `text-embeddings-inference` (indicado en los tags) para servir embeddings a escala. También puede exportarse a ONNX o TensorRT para optimización.
- Throughput estimado: no disponible, pero al ser un modelo pequeño, puede procesar cientos de frases por segundo en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensiones | Licencia | Uso principal |
|---|---|---|---|---|---|
| `SSHHIVANI/verifact-biencoder-v1` | 22,7 M | 256 tokens | 384 | no disponible | Verificación de hechos (biencoder) |
| `sentence-transformers/all-MiniLM-L6-v2` | 22,7 M | 256 tokens | 384 | Apache 2.0 | Embeddings genéricos de frases |
| `sentence-transformers/all-mpnet-base-v2` | 109 M | 384 tokens | 768 | Apache 2.0 | Embeddings genéricos, mayor calidad |

El modelo es un fine-tune del MiniLM-L6-v2, por lo que comparte arquitectura y tamaño. La diferencia principal es el entrenamiento especializado en verificación de hechos, aunque no se dispone de métricas que demuestren una mejora sobre el modelo base. `all-mpnet-base-v2` ofrece mayor capacidad y contexto, pero con más peso computacional.

## Limitaciones y advertencias

- No se especifica licencia, lo que genera incertidumbre sobre su uso comercial; se recomienda contactar al autor antes de integrarlo en productos.
- El dataset de entrenamiento es muy pequeño (4.555 ejemplos) y no se describe su composición, lo que puede limitar la generalización a dominios fuera del ámbito de entrenamiento.
- Contexto limitado a 256 tokens, insuficiente para documentos largos o conversaciones extensas.
- Idiomas no documentados; los ejemplos del widget están en inglés, por lo que el rendimiento en otros idiomas es incierto.
- Al ser un modelo basado en BERT, puede heredar sesgos presentes en los datos de preentrenamiento de MiniLM, como estereotipos de género o raza.
- Riesgo de alucinación no aplica directamente (no genera texto), pero la recuperación de pasajes puede producir falsos positivos si el corpus contiene información errónea.
- No hay garantía de que el modelo esté alineado con el proyecto VeriFact original; la relación es inferida por el nombre y los tags, no confirmada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SSHHIVANI/verifact-biencoder-v1
- Repositorio del proyecto VeriFact (app móvil): https://github.com/IntelligentBeaver/VeriFact
- Repositorio de scripts y dataset VeriFact-BHC: https://github.com/philipchung/verifact
- Artículo arXiv sobre VeriFact (verificación de hechos en texto clínico): https://arxiv.org/html/2501.16672v1
