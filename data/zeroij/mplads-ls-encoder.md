# ZeroiJ/mplads-ls-encoder

## Resumen

El modelo `ZeroiJ/mplads-ls-encoder` es un encoder de embeddings multilingüe desarrollado por ZeroiJ (Sujal Birwadkar) como parte de un proyecto para el Smart India Hackathon (SIH26102). Se trata de un fine-tuning del modelo `paraphrase-multilingual-MiniLM-L12-v2` de sentence-transformers, especializado en descripciones de obras del programa MPLADS (Members of Parliament Local Area Development Scheme) de la Lok Sabha, la cámara baja del parlamento indio. El objetivo es convertir descripciones textuales de proyectos de infraestructura en vectores densos de 384 dimensiones normalizados L2, optimizados para similitud coseno, lo que permite detectar duplicados, inconsistencias o posibles fraudes en las solicitudes de fondos.

El modelo tiene 117,65 millones de parámetros y soporta 18 idiomas, principalmente lenguas indias (hindi, tamil, telugu, bengalí, maratí, guyaratí, canarés, malayalam, punyabí, urdu, oriya, asamés, sindhi, nepalí, cingalés) además del inglés. Se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors. Su relevancia radica en que ofrece una solución ligera y específica para un dominio concreto (obras públicas en India), con una precisión de validación reportada del 96,3% en la tarea de similitud de pares, lo que lo hace útil para sistemas de verificación y auditoría de proyectos gubernamentales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (MiniLM-L12, basado en BERT) |
| Parametros totales | 117.653.760 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificado (heredado del modelo base, probablemente 512 tokens) |
| Tipos de cuantizacion | No disponible (solo safetensors en FP32) |
| Idiomas soportados | en, hi, ta, te, bn, mr, gu, kn, ml, pa, ur, or, as, sd, ne, si (18 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MiniLM-L12, un transformer de 12 capas con 384 dimensiones de embedding, diseñado para ser eficiente y ligero. El fine-tuning se realizó con una función de pérdida contrastiva basada en similitud coseno sobre pares de descripciones de obras MPLADS curadas manualmente. No se especifican detalles sobre el volumen de datos de entrenamiento ni la composición exacta del dataset, aunque se menciona el dataset `ZeroiJ/mplads-works` como fuente. La salida del modelo son embeddings L2-normalizados de 384 dimensiones, listos para ser usados con métricas de similitud coseno. No se reportan innovaciones técnicas adicionales más allá del ajuste fino específico del dominio.

## Capacidades

- Generación de embeddings semánticos para texto, con salida de 384 dimensiones normalizada L2.
- Similitud semántica entre frases o documentos, optimizada para descripciones de obras de infraestructura.
- Búsqueda semántica en bases de datos de proyectos, permitiendo encontrar descripciones similares o duplicadas.
- Agrupación (clustering) de descripciones por similitud temática.
- Clasificación de textos mediante la comparación con embeddings de referencia.
- Soporte multilingüe para 18 idiomas, con especial cobertura de lenguas indias.
- Compatible con la librería sentence-transformers y con la Hugging Face Inference API.
- No incluye capacidades de generación de texto, tool calling ni razonamiento multi-paso; es exclusivamente un encoder.

## Casos de uso

- Detección de duplicados en solicitudes de obras: el modelo puede comparar embeddings de descripciones de proyectos para identificar solicitudes repetidas o fraudulentas, gracias a su entrenamiento específico en el dominio MPLADS.
- Verificación de consistencia en bases de datos gubernamentales: permite comprobar si una descripción coincide con otra ya registrada, ayudando a auditar el uso de fondos públicos.
- Búsqueda semántica en portales de transparencia: los ciudadanos o auditores pueden buscar proyectos por descripción en lenguaje natural, incluso en diferentes idiomas, usando la similitud coseno de los embeddings.
- Clasificación automática de obras por categoría: al comparar embeddings con prototipos de categorías (carreteras, puentes, escuelas, etc.), se puede etiquetar automáticamente nuevas solicitudes.
- Agrupación de proyectos similares para análisis de costes y plazos: el clustering de embeddings permite agrupar obras comparables y detectar anomalías en presupuestos o tiempos de ejecución.
- Integración en pipelines de detección de fraude: el modelo puede combinarse con reglas de negocio para señalar descripciones sospechosamente similares a otras ya marcadas, mejorando la eficiencia de los auditores.
- Soporte multilingüe en atención al ciudadano: permite procesar consultas en varios idiomas indios y relacionarlas con proyectos existentes, facilitando la transparencia y el acceso a la información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GLUE) en la información disponible. El autor reporta una precisión de validación del 96,3% en la tarea de similitud de pares de descripciones MPLADS, medida mediante similitud coseno. Este dato es específico del dominio y no es comparable con benchmarks generales de modelos de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 y 0,25 GB en FP16, dado el tamaño de 117,6 millones de parámetros.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo tarjetas consumer como GTX 1050 Ti, RTX 2060 o superiores. También puede ejecutarse en CPU sin problemas para inferencia por lotes pequeños.
- Compatible con GPUs de gama baja y entornos sin GPU, gracias a su tamaño reducido.
- Opciones de despliegue: sentence-transformers, Hugging Face Inference API, text-embeddings-inference (TEI), o cualquier framework que soporte modelos BERT (ONNX, TensorRT, etc.).
- Latencia y throughput: no se han publicado mediciones oficiales, pero al ser un modelo pequeño, se espera una latencia de milisegundos en GPU y de decenas de milisegundos en CPU para frases cortas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Uso específico |
|---|---|---|---|---|---|
| ZeroiJ/mplads-ls-encoder | 117,65 M | No especificado | 18 | Apache 2.0 | Fine-tune para MPLADS |
| paraphrase-multilingual-MiniLM-L12-v2 (base) | 118 M | 512 tokens (típico) | 50+ | Apache 2.0 | Multilingüe general |
| LaBSE | 471 M | 512 tokens | 109 | Apache 2.0 | Multilingüe general |
| multilingual-e5-small | 118 M | 512 tokens | 100 | MIT | Multilingüe general |

No se dispone de datos de rendimiento comparativo entre estos modelos en la tarea específica de MPLADS. La comparativa se limita a características técnicas conocidas.

## Limitaciones y advertencias

- El modelo está especializado en descripciones de obras MPLADS; su rendimiento en otros dominios puede ser inferior al de modelos multilingües generales.
- No se han documentado sesgos específicos, pero al ser un fine-tune de un modelo preentrenado, puede heredar sesgos presentes en los datos originales.
- Al ser un modelo de embeddings, no genera texto, por lo que no presenta riesgo de alucinación en generación, pero sí puede producir similitudes incorrectas si las descripciones son ambiguas.
- La longitud de contexto no está especificada; se asume la del modelo base (512 tokens), pero no se garantiza.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del dataset original si se utiliza en producción.
- No se han publicado evaluaciones independientes ni benchmarks estándar, por lo que la precisión reportada (96,3%) proviene únicamente del autor.
- El modelo está diseñado para un caso de uso concreto (detección de fraude en MPLADS) y puede no ser adecuado para tareas generales de procesamiento de lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZeroiJ/mplads-ls-encoder
- Repositorio GitHub del proyecto: https://github.com/ZeroiJ/mplads
- Demo en línea (mplads-ai-insight): https://sih-11.vercel.app/
- Dataset utilizado: https://huggingface.co/datasets/ZeroiJ/mplads-works
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
