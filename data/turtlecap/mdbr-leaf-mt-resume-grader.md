# turtlecap/mdbr-leaf-mt-resume-grader

## Resumen

El modelo `turtlecap/mdbr-leaf-mt-resume-grader` es un ajuste fino (fine-tune) del modelo de embeddings `MongoDB/mdbr-leaf-mt`, desarrollado por el usuario `turtlecap`, orientado a la evaluación de similitud semántica entre currículums y ofertas de empleo. Se trata de un modelo de tipo sentence-transformers que genera representaciones densas de texto, optimizado para tareas de ranking y matching de perfiles profesionales. El modelo base, `mdbr-leaf-mt`, es un modelo de 23 millones de parámetros, con 1024 dimensiones de salida y una longitud máxima de contexto de 512 tokens, entrenado mediante el framework LEAF (Lightweight Embedding Alignment Framework) de MongoDB Research. Este fine-tune se ha ajustado con funciones de pérdida MatryoshkaLoss y CoSENTLoss sobre un dataset de 13 979 ejemplos, lo que permite obtener embeddings de alta calidad para la tarea concreta de comparar CVs con requisitos laborales.

La relevancia actual de este modelo reside en su tamaño reducido (23M de parámetros) que permite inferencia rápida y despliegue en entornos con recursos limitados, a la vez que mantiene un rendimiento competitivo en tareas de similitud de textos. Al estar basado en el modelo LEAF, hereda las ventajas de la destilación de conocimiento de modelos de gran tamaño, logrando un equilibrio entre eficiencia y precisión. Aunque no se dispone de benchmarks específicos publicados para este fine-tune, su base ha demostrado ser eficaz en el benchmark BEIR y MTEB v2 (inglés) para modelos de su tamaño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 23 millones (heredado del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (no se mencionan en la informacion) |
| Idiomas soportados | no disponibles (no se especifican, aunque el dataset es en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (probable, al ser modelo sentence-transformers) y ONNX (según tags) |

## Arquitectura y entrenamiento

El modelo base `MongoDB/mdbr-leaf-mt` es un transformer encoder de tipo BERT con 23 millones de parámetros, entrenado mediante el framework LEAF (Lightweight Embedding Alignment Framework). LEAF es un método de destilación de conocimiento que transfiere las capacidades de modelos de embedding de gran escala (como `mxbai-embed-large-v1`) a modelos mucho más pequeños, manteniendo un alto rendimiento en tareas de recuperación de información y similaridad semántica. El modelo base se ha entrenado con una configuración multi-tarea (leaf-mt) que combina objetivos de retrieval, clasificación y similaridad.

El fine-tune `turtlecap/mdbr-leaf-mt-resume-grader` se ha ajustado sobre este base con un dataset de 13.979 ejemplos, utilizando dos funciones de pérdida: `MatryoshkaLoss` y `CoSENTLoss`. La primera permite producir embeddings de múltiples dimensiones (por ejemplo, 1024, 512, 256, 128) con una única salida, facilitando la compresión y aceleración sin perder demasiada precisión. La segunda, `CoSENTLoss`, es una variante de la pérdida contrastiva que optimiza la similitud del coseno entre pares de frases, adecuada para tareas de ranking y similitud. El entrenamiento se ha realizado con la librería `sentence-transformers` y el dataset está anotado con pares de CV y descripciones de puesto, indicando si hay coincidencia.

## Capacidades

- Generacion de embeddings densos de texto para comparacion de similitud semantica (sentence-similarity).
- Clasificacion de la relevancia de un currículum respecto a una oferta de trabajo (función principal del fine-tune).
- Soporte para representaciones de multiples dimensiones gracias a MatryoshkaLoss (por ejemplo, 1024, 512, 256, 128).
- Compatible con la librería `sentence-transformers`, lo que permite su integración en pipelines de NLP con mínimas líneas de código.
- Formato ONNX disponible para despliegue en entornos de inferencia optimizados (por ejemplo, ONNX Runtime).
- Capacidad de extracción de características (`feature-extraction`) para uso en tareas de retrieval y ranking.

## Casos de uso

- Seleccion automatica de candidatos en portales de empleo: el modelo puede comparar la similitud entre un CV y una oferta de trabajo, filtrando los candidatos mas relevantes para una posicion concreta.
- Filtrado de curriculums en sistemas de ATS (Applicant Tracking System): se integra en pipelines que procesan grandes volumenes de CV para preseleccionar los que mejor coinciden con los requisitos.
- Recomendacion de ofertas de empleo a candidatos: dado un CV, el modelo puede calcular la similitud con distintas ofertas y recomendar las mas adecuadas.
- Analisis de brechas de habilidades: al comparar las habilidades listadas en un CV con las requeridas en una oferta, se pueden identificar carencias o puntos fuertes.
- Deduplicacion de curriculums: el modelo puede detectar curriculums duplicados o muy similares dentro de una base de datos, facilitando la gestion de candidatos.
- Clasificacion de CV por categorias profesionales: mediante la comparacion con descripciones de puestos tipo, se puede etiquetar automaticamente el perfil profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para el modelo `turtlecap/mdbr-leaf-mt-resume-grader` en la informacion disponible. El modelo base `MongoDB/mdbr-leaf-mt` ha sido evaluado en el benchmark MTEB v2 (ingles) y en BEIR, logrando un estado del arte para modelos de su tamaño (≤100M parámetros) según la publicacion LEAF, pero no se dispone de datos concretos para este fine-tune.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 23M parámetros, puede ejecutarse en GPU con 2 GB de VRAM o incluso en CPU para tareas de baja latencia.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, T4) es suficiente. Para despliegue en producción, una A10 o A100 es recomendable si se espera alto throughput.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de gama baja (GTX 1050, etc.) siempre que se utilice cuantizacion de 8 bits o menos.
- Opciones de despliegue: se puede servir con `vLLM`, `llama.cpp` (aunque es un encoder, no un LLM generativo), `Ollama` (si se convierte a GGUF), `TGI` (Text Generation Inference) no es adecuado para encoders; se recomienda usar `sentence-transformers` o `ONNX Runtime` para inferencia.
- Latencia y throughput estimados: no disponibles, pero al ser un modelo pequeño, se espera una latencia de milisegundos por frase en GPU y unos cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en MTEB v2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `turtlecap/mdbr-leaf-mt-resume-grader` | 23M | 512 | no disponible | no disponible | Hugging Face |
| `MongoDB/mdbr-leaf-mt` (base) | 23M | 512 | SOTA en su rango (BEIR/MTEB v2) | Apache 2.0 (según modelo base) | Hugging Face |
| `mxbai-embed-large-v1` | 335M | 512 | Alta | MIT | Hugging Face |
| `all-MiniLM-L6-v2` | 22.7M | 256 | moderado | Apache 2.0 | Hugging Face |

El modelo base `mdbr-leaf-mt` se destaca por su eficiencia y calidad, mientras que el fine-tune aquí descrito se especializa en la tarea de resume grading. Comparado con `mxbai-embed-large-v1` (335M), el modelo base es mucho más ligero y con rendimiento comparable en tareas de retrieval, gracias a la destilación LEAF. `all-MiniLM-L6-v2` es un modelo de tamaño similar pero sin la especialización en CV.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos específicos del modelo, pero al estar entrenado sobre un dataset de CVs en inglés (según los ejemplos mostrados), puede presentar sesgos relacionados con el dominio y el idioma.
- El modelo puede alucinar o generar similitudes falsas en textos muy técnicos o con jerga específica, aunque es menos probable por ser un embedding.
- La ventana de contexto está limitada a 512 tokens, por lo que currículums muy extensos pueden truncarse y perder información relevante.
- No se indica la licencia del modelo, por lo que su uso comercial es incierto; se recomienda contactar con el autor.
- No se especifican los idiomas soportados; los ejemplos muestran texto en inglés, por lo que su rendimiento en otros idiomas puede ser bajo.
- El modelo no es un LLM generativo; solo produce embeddings, no genera texto.
- El dataset de entrenamiento (13.979 ejemplos) es relativamente pequeño, lo que puede limitar la generalización en dominios fuera del ámbito de CVs.

## Enlaces

- [Hugging Face - turtlecap/mdbr-leaf-mt-resume-grader](https://huggingface.co/turtlecap/mdbr-leaf-mt-resume-grader)
- [Hugging Face - MongoDB/mdbr-leaf-mt (modelo base)](https://huggingface.co/MongoDB/mdbr-leaf-mt)
- [Paper LEAF: Knowledge Distillation of Text Embedding Models with Teacher (arXiv)](https://arxiv.org/pdf/2509.12539)
- [Blog de MongoDB sobre LEAF](https://www.mongodb.com/company/blog/engineering/leaf-distillation-state-of-the-art-text-embedding-models)
- [Leaderboard MTEB para mdbr-leaf-mt](https://leaderboard.mteb.org/models/MongoDB/mdbr-leaf-mt)
