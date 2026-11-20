# vladlinv/ru-pii-ner-gliner2.5

## Resumen

El modelo `vladlinv/ru-pii-ner-gliner2.5` es un extractor de entidades nombradas (NER) especializado en la detección de datos personales (PII) en documentos en ruso. Lo desarrolla el usuario vladlinv y se publica bajo licencia Apache 2.0. Es un ajuste fino completo del modelo base `fastino/gliner2.5-multi-v1`, que pertenece a la familia GLiNER2.5, una arquitectura de extracción de entidades guiada por etiquetas que predice directamente los límites de las entidades en lugar de clasificar todos los fragmentos posibles del texto.

El modelo resuelve un problema concreto y con implicaciones legales: la anonimización y el cumplimiento de la Ley Federal rusa 152-ФЗ sobre datos personales. A diferencia de los NER genéricos, que se limitan a nombres, direcciones, fechas, teléfonos y correos, este modelo anota identificadores que permiten vincular a una persona con un documento: datos de pasaporte y documentos migratorios, SNILS, INN y otros números estatales, datos bancarios, números médicos, judiciales, notariales, de personal y académicos, datos sobre propiedades y vehículos, números de billetes y pedidos, cuentas, pases y códigos internos de sistemas.

Con 287.355.159 parámetros y una ventana de 4096 tokens por pasada, el modelo procesa la mayoría de documentos completos sin necesidad de segmentarlos. Su relevancia actual radica en que aborda la parte de los datos personales que en documentos reales suele ser la más abundante y la más difícil de cubrir con expresiones regulares, y lo hace con un F1 global de 86,18% sobre un conjunto de validación de 405 documentos y 4.134 entidades.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GLiNER2.5 (extractor de entidades guiado por etiquetas, basado en transformer) |
| Parámetros totales | 287.355.159 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens por pasada |
| Tipos de cuantización | no disponible |
| Idiomas soportados | ruso (ru); el dataset de entrenamiento incluye ~6% de ejemplos en inglés, bielorruso, uzbeko, kazajo, kirguís, tayiko, armenio, georgiano y azerbaiyano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | gliner2 |
| Pipeline | token-classification |
| Modelo base | fastino/gliner2.5-multi-v1 |
| Tamaño del repositorio | 1.2 GB |
| Descargas | 1221 |
| Likes | 5 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de `fastino/gliner2.5-multi-v1`, un extractor GLiNER2.5. La innovación central de esta arquitectura es que no enumera todos los fragmentos candidatos del texto, sino que predice directamente dónde empieza y dónde termina una entidad y, después, asocia el fragmento encontrado con cada etiqueta. En la práctica, esto implica que la longitud de la entidad no está limitada: direcciones largas, datos bancarios e identificadores compuestos no se truncan, y la velocidad no se degrada en documentos extensos. Además, la lista de etiquetas no está fijada en los pesos, sino que se proporciona en la entrada junto con el texto, de modo que se pueden renombrar o añadir nuevos tipos sin reentrenar, ya que el modelo los busca por el significado del nombre.

El dataset de ajuste contiene 4097 ejemplos generados de forma íntegra en varias fases: definición jurídica de la composición de los datos personales y de las reglas de anotación, generación y aumento de documentos, y revisión manual posterior de una parte de los ejemplos. Los documentos cubren documentación personal, laboral e interna de organizaciones, materiales corporativos y administrativos, documentos jurídicos y normativos, documentación contractual, comercial, financiera, contable y bancaria, documentos estatales y registrales, materiales médicos, sociales y educativos, documentación técnica y de producción, documentos sobre propiedades y vehículos, correspondencia empresarial y de usuarios, registros, directorios, formularios y tablas. Se incluyen variantes con OCR deficiente, HTML, Markdown y otros formatos. La anotación es contextual, con límites basados en la 152-ФЗ y en la práctica jurisprudencial rusa, y es conservadora: cuando no está claro a quién pertenece un dato, se considera dato personal, pero se respeta el significado jurídico y se dejan intactos los datos de organizaciones y los valores de referencia no vinculados a una persona. En el conjunto de entrenamiento, la clase PII concentra 22.466 entidades en 3103 ejemplos, seguida de PERSON con 7790 entidades en 2629 ejemplos, DATE con 4514 en 1481, LOCATION con 1918 en 763, PHONE con 1548 en 889 y EMAIL con 1004 en 600. No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Extracción de entidades nombradas de datos personales en ruso con etiquetas definidas en tiempo de inferencia.
- Detección de las clases PERSON, LOCATION, DATE, PHONE, EMAIL y la clase genérica PII.
- Anotación de identificadores contextuales no expresables mediante expresiones regulares: pasaporte, documentos migratorios, SNILS, INN, números bancarios, médicos, judiciales, notariales, de personal, académicos, de propiedades, vehículos, billetes, pedidos, cuentas y pases.
- Distinción entre datos de una persona y datos de una organización.
- Predicción directa de límites de entidad sin restricción de longitud del fragmento.
- Procesamiento de documentos completos de hasta 4096 tokens en una sola pasada.
- Etiquetas personalizables sin reentrenamiento, aunque la calidad declarada solo está garantizada para las etiquetas de la model card.
- Salida con spans (posiciones de inicio y fin) mediante `include_spans=True`.
- Soporte de umbral de confianza configurable para ajustar el equilibrio entre precisión y exhaustividad.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo de razonamiento en la información disponible.

## Casos de uso

- Anonimización previa a la publicación de documentos: el modelo se aplica sobre contratos, expedientes o correspondencia antes de compartirlos con terceros o subirlos a repositorios, y sustituye las entidades detectadas por marcadores. Es adecuado porque cubre identificadores que las expresiones regulares no capturan y porque procesa documentos completos de hasta 4096 tokens sin segmentar.
- Cumplimiento de la 152-ФЗ en pipelines documentales: integrado como paso de etiquetado en un sistema de gestión documental, permite localizar datos personales en lotes de documentos jurídicos, contables y de recursos humanos y generar informes de exposición.
- Redacción de datos en atención al cliente: sobre transcripciones y correos de usuarios en ruso, el modelo detecta nombres, teléfonos, correos e identificadores antes de almacenar o analizar las conversaciones, reduciendo el riesgo en los registros.
- Preparación de datasets para entrenamiento: al etiquetar corpus rusos con las seis clases y la clase PII, se pueden filtrar o enmascarar datos personales antes de usar los textos en el entrenamiento de otros modelos.
- Auditoría de documentación de recursos humanos: los expedientes de personal contienen SNILS, INN, datos de pasaporte y números de cuenta; el modelo los localiza para revisar qué información sensible circula y dónde.
- Procesamiento de documentación médica y social: permite identificar datos de pacientes y beneficiarios en informes y formularios, con la ventaja de que la anotación sigue criterios jurídicos conservadores.
- Extracción estructurada para integración con sistemas internos: mediante la salida con spans, los identificadores detectados se pueden mapear a campos de una base de datos o a un formulario, usando las etiquetas renombradas según el esquema propio.
- Documentos con OCR deficiente o formatos mixtos: el entrenamiento incluye variantes de OCR deficiente, HTML y Markdown, lo que lo hace utilizable sobre texto extraído de digitalizaciones.

## Benchmarks y rendimiento

Conjunto de validación: 405 documentos, 4134 entidades. Métricas estrictas: un span solo cuenta si coincide exactamente con los límites de la referencia. Coverage es una métrica más laxa: proporción de entidades de referencia cubiertas por completo por predicciones de la misma clase.

| Clase | Entidades | Precision | Recall | F1 | Coverage |
|---|---:|---:|---:|---:|---:|
| PERSON | 789 | 93,28% | 91,51% | 92,39% | 92,52% |
| LOCATION | 249 | 88,94% | 74,30% | 80,96% | 78,31% |
| DATE | 562 | 89,64% | 75,44% | 81,93% | 78,11% |
| PHONE | 136 | 95,04% | 84,56% | 89,49% | 86,03% |
| EMAIL | 62 | 100,00% | 87,10% | 93,10% | 87,10% |
| PII | 2336 | 89,91% | 80,86% | 85,15% | 83,05% |
| **Global** | **4134** | **90,83%** | **81,98%** | **86,18%** | **84,06%** |

Dependencia del umbral, con valor por defecto 0,5:

| Umbral | Precision | Recall | F1 | TP | FP | FN |
|---:|---:|---:|---:|---:|---:|---:|
| 0,02 | 0,834 | 0,838 | 0,836 | 3464 | 689 | 670 |
| 0,10 | 0,868 | 0,834 | 0,851 | 3447 | 522 | 687 |
| 0,30 | 0,897 | 0,828 | 0,861 | 3422 | 392 | 712 |
| **0,50** | **0,908** | **0,820** | **0,862** | **3389** | **342** | **745** |
| 0,70 | 0,917 | 0,810 | 0,860 | 3349 | 302 | 785 |
| 0,90 | 0,929 | 0,795 | 0,857 | 3286 | 252 | 848 |
| 0,99 | 0,947 | 0,707 | 0,809 | 2922 | 164 | 1212 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 287 millones de parámetros en safetensors, los pesos ocupan aproximadamente 1,15 GB en precisión nativa; en fp16 serían unos 0,57 GB y en cuantizaciones de 8 o 4 bits, aún menos, aunque el modelo no documenta tipos de cuantización.
- GPU recomendadas: no disponible. Por tamaño, el modelo es apto para GPU de consumo, pero no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la documentación.
- Cabe en GPU de consumo: muy probablemente sí, dado el reducido número de parámetros, aunque no se detalla en la información disponible.
- Opciones de despliegue: la vía documentada es la librería `gliner2` con `AutoExtractor.from_pretrained(...)` y `model.to("cuda")`. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles. La model card solo indica que la velocidad no se degrada en documentos extensos gracias a la predicción directa de límites, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vladlinv/ru-pii-ner-gliner2.5 | 287.355.159 | 4096 tokens | ruso (con ~6% multilingüe en entrenamiento) | Apache 2.0 | Hugging Face |
| metrika-labs/ru-pii-ner-gliner2.5 | no disponible | no disponible | ruso | no disponible | Hugging Face |
| fastino/gliner2.5-multi-v1 (base) | no disponible | no disponible | multilingüe | no disponible | Hugging Face |

La model card menciona `metrika-labs/ru-pii-ner-gliner2.5` como otro modelo de reconocimiento de tipos y límites de datos personales basado en GLiNER2.5, pero no se proporcionan sus especificaciones ni métricas. El modelo base `fastino/gliner2.5-multi-v1` es multilingüe y de propósito general para extracción de entidades. No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La calidad declarada solo está garantizada para las etiquetas de la model card (`ru_pii_person`, `ru_pii_location`, `ru_pii_date`, `ru_pii_phone`, `ru_pii_email`, `ru_pii`); con etiquetas arbitrarias el rendimiento no está garantizado.
- El modelo está orientado al ruso; el ~6% de ejemplos en otras lenguas del dataset no implica un rendimiento multilingüe validado.
- El recall global es del 81,98% con el umbral por defecto, y las clases LOCATION y DATE tienen el recall más bajo (74,30% y 75,44%), por lo que pueden quedar datos personales sin detectar.
- El dataset es completamente generado y solo una parte fue revisada manualmente, lo que puede introducir un sesgo hacia los patrones de generación y no cubrir toda la variabilidad de documentos reales.
- La anotación es conservadora por diseño: cuando no está claro a quién pertenece un dato, se marca como dato personal, lo que puede producir falsos positivos en documentos con datos de organizaciones o valores de referencia.
- Riesgo de alucinación: no se documenta explícitamente, pero como todo modelo de extracción puede producir spans incorrectos o asignar etiquetas a fragmentos que no corresponden.
- No se documentan sesgos conocidos más allá del criterio de anotación descrito.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base `fastino/gliner2.5-multi-v1`.
- En producción conviene ajustar el umbral según el coste relativo de falsos positivos y falsos negativos; la tabla de umbrales muestra que por debajo de 0,5 el recall mejora poco y la precisión cae, y por encima de 0,9 el recall se degrada notablemente.
- No se documentan requisitos de hardware, latencia ni soporte de frameworks de despliegue, lo que dificulta planificar una puesta en producción a escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vladlinv/ru-pii-ner-gliner2.5
- Modelo relacionado: https://huggingface.co/metrika-labs/ru-pii-ner-gliner2.5
- Modelo base: https://huggingface.co/fastino/gliner2.5-multi-v1
- Documentación de GLiNER2: https://github.com/fastino-ai/GLiNER2
