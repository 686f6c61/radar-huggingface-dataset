# srebora/MultItLit

## Resumen

MultItLit es un clasificador de secuencias basado en BERT, desarrollado por Simone Rebora, cuyo objetivo es identificar oraciones de textos literarios italianos que contienen una representación explícita del multilingüismo. El modelo parte del checkpoint `dbmdz/bert-base-italian-xxl-cased` y se ha afinado para una tarea binaria de clasificación (presencia o ausencia de multilingüismo explícito), lo que lo convierte en una herramienta de apoyo para investigadores en plurilingüismo y literatura comparada.

Con 110.697.218 parámetros y un repositorio de 1,3 GB, se trata de un modelo compacto de la familia BERT, pensado para anotación y filtrado de corpus más que para generación de texto. Su relevancia actual reside en su carácter especializado: automatiza una tarea de anotación filológica que tradicionalmente requiere lectura manual, sobre un dominio (literatura italiana) y un fenómeno (multilingüismo explícito) muy concretos.

La información pública disponible es limitada: no se especifican los datos exactos de entrenamiento, el número de tokens utilizados ni los detalles de composición del corpus, y no consta paper asociado. El modelo se distribuye con licencia MIT y solo soporta italiano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base_model: dbmdz/bert-base-italian-xxl-cased) |
| Parametros totales | 110.697.218 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limitada por el tokenizador BERT, típicamente 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original) |
| Idiomas soportados | italiano (it) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | Clasificación de secuencias (AutoModelForSequenceClassification) |
| Etiquetas | `No`, `Sì` (clasificación binaria) |
| Tokenizador | no incluido; se recomienda el de `dbmdz/bert-base-italian-xxl-cased` |
| Tamano del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT (variante `xxl-cased` para italiano) adaptado mediante fine-tuning a una cabeza de clasificación de secuencias con dos etiquetas. No se trata de un modelo generativo ni de un modelo MoE: es un encoder denso de 110,7 millones de parámetros que produce una predicción por oración de entrada.

El fine-tuning se realizó sobre un corpus de oraciones de literatura italiana, con una división train/validation de 0,8/0,2, `batch_size` de 16, 3 épocas, `weight_decay` de 0,01 y selección del mejor modelo por exactitud. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos o balanceo de clases. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.), lo cual es coherente con un modelo de clasificación de propósito específico.

## Capacidades

- Clasificación binaria de oraciones: determina si una oración de literatura italiana contiene una representación explícita de multilingüismo (`Sì`) o no (`No`).
- Procesamiento de texto en italiano exclusivamente.
- Anotación automática de corpus literarios para investigación filológica y lingüística.
- Filtrado y extracción de oraciones relevantes de obras literarias.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo de razonamiento (thinking mode), visión ni audio.
- No es un modelo generativo: no produce texto libre.

## Casos de uso

- Anotación de corpus literarios: el modelo permite etiquetar automáticamente oraciones de obras italianas según la presencia de multilingüismo explícito, reduciendo el trabajo manual de anotación en proyectos de humanidades digitales.
- Investigación sobre plurilingüismo literario: sirve para cuantificar y localizar pasajes donde conviven lenguas distintas dentro de un texto, facilitando estudios comparativos a escala de corpus.
- Construcción de datasets especializados: los investigadores pueden usar las predicciones para generar subconjuntos de oraciones candidatas que luego se revisan manualmente, agilizando la creación de recursos anotados.
- Filtrado previo en pipelines de análisis textual: integrado como paso de preprocesado, descarta oraciones irrelevantes antes de aplicar análisis más costosos (POS tagging, NER, análisis de sentimiento).
- Docencia e investigación en filología italiana: permite ejemplificar de forma automatizada fenómenos de contacto de lenguas en textos literarios concretos.
- Análisis de obras bilingües o con inserción de extranjerismos: ayuda a detectar sistemáticamente fragmentos donde el autor introduce otras lenguas en el discurso narrativo.

## Benchmarks y rendimiento

Resultados de evaluación publicados en la model card sobre el conjunto de validación (469 ejemplos):

| Clase | Precision | Recall | F1-score | Support |
|---|---|---|---|---|
| No | 0,97 | 0,89 | 0,93 | 302 |
| Sì | 0,83 | 0,96 | 0,89 | 167 |
| Exactitud (accuracy) | — | — | 0,91 | 469 |
| Media macro | 0,90 | 0,92 | 0,91 | 469 |
| Media ponderada | 0,92 | 0,91 | 0,92 | 469 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB en FP32 para los 110,7 millones de parámetros, más el overhead del runtime; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para volúmenes moderados. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es más que suficiente.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en hardware de gama baja.
- Opciones de despliegue: `transformers` (PyTorch), `ONNX Runtime`, `TorchScript`, y servidores de inferencia estándar compatibles con modelos de clasificación. No se documentan integraciones específicas con vLLM, llama.cpp u Ollama (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un encoder pequeño, se espera un throughput alto en lotes, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia estructural, se puede comparar con su modelo base:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MultItLit | 110,7 M | no disponible (BERT, ~512) | Clasificación binaria de multilingüismo | MIT | Hugging Face |
| dbmdz/bert-base-italian-xxl-cased | 110,7 M (aprox.) | ~512 tokens | Modelo base (MLM) | no disponible en esta ficha | Hugging Face |

No se han identificado en la información disponible otros clasificadores especializados en detección de multilingüismo literario para comparar.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente sobre oraciones de literatura italiana; su rendimiento fuera de ese dominio no está documentado.
- Sesgos desconocidos: no se documenta la composición del corpus de entrenamiento, por lo que no es posible evaluar sesgos de género, época, autor o género literario.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos/negativos en la clasificación; el recall de la clase `Sì` (0,96) es alto, mientras que su precisión (0,83) es menor, lo que implica una tendencia a sobrepredecir multilingüismo.
- Limitación de contexto: al ser un modelo BERT, la longitud de entrada está limitada por el tokenizador (habitualmente 512 tokens); oraciones más largas requerirán truncamiento.
- Solo italiano: no soporta otros idiomas, lo que limita su uso a corpus en esa lengua.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del modelo base.
- Sin tokenizador propio: es necesario cargar el tokenizador de `dbmdz/bert-base-italian-xxl-cased`, lo que añade una dependencia externa.
- Documentación incompleta: no hay paper, cita académica ni detalles del dataset de entrenamiento, lo que dificulta la reproducibilidad.
- Sin mantenimiento aparente: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de actualizaciones o soporte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/srebora/MultItLit
- Modelo base: https://huggingface.co/dbmdz/bert-base-italian-xxl-cased
- Paper: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
- Cita (BibTeX/APA): no disponible
