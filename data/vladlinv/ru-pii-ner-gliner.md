# vladlinv/ru-pii-ner-gliner

## Resumen

ru-pii-ner-gliner es un modelo de reconocimiento de entidades nombradas (NER) especializado en la detección de datos personales (PII) en documentos en ruso. Lo desarrolla el usuario vladlinv y es un ajuste fino completo del modelo base fastino/gliner2.5-multi-v1, perteneciente a la familia GLiNER2.5. Su propósito es localizar y clasificar identificadores personales en textos jurídicos, administrativos, médicos, financieros y de recursos humanos, incluyendo no solo nombres, direcciones, fechas, teléfonos y correos, sino también números de pasaporte, documentos migratorios, SNILS, INN, datos bancarios, números de historiales médicos, expedientes judiciales y notariales, matrículas, billetes, pedidos y códigos internos.

El modelo aborda un problema práctico de cumplimiento normativo: la anonimización de documentos conforme a la ley federal rusa 152-FZ sobre datos personales. A diferencia de los enfoques basados en expresiones regulares, la anotación del corpus de entrenamiento se realizó por contexto, lo que permite distinguir datos de una persona física de datos de una organización y detectar identificadores que no siguen un patrón fijo. La anotación es conservadora: ante la duda, el valor se marca como dato personal.

Técnicamente se trata de un modelo extractor con 287.355.159 parámetros, ventana de 4096 tokens por pasada y etiquetas de entidad que se proporcionan en la entrada junto con el texto, no fijadas en los pesos. Esto permite renombrar o añadir tipos de entidad sin reentrenamiento, aunque la calidad declarada solo está garantizada para el conjunto de etiquetas documentado. La licencia es Apache 2.0 y el repositorio ocupa 1,2 GB en formato safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GLiNER2.5 (extractor de entidades con predicción directa de spans y matching contra etiquetas de entrada); ajuste fino completo de fastino/gliner2.5-multi-v1 |
| Parámetros totales | 287.355.159 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens por pasada |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Ruso (principal); aproximadamente el 6% del corpus de entrenamiento incluye inglés, bielorruso, uzbeko, kazajo, kirguís, tayiko, armenio, georgiano y azerí |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | gliner2 |
| Pipeline | token-classification |
| Tamaño del repositorio | 1,2 GB |
| Etiquetas documentadas | ru_pii_person, ru_pii_location, ru_pii_date, ru_pii_phone, ru_pii_email, ru_pii (clase genérica) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de GLiNER2.5, una arquitectura orientada a extracción de información que no evalúa todos los fragmentos posibles del texto, sino que predice directamente el inicio y el fin de cada entidad y después compara el span encontrado con cada etiqueta proporcionada en la entrada. Esto implica dos propiedades relevantes: la longitud de la entidad no está acotada (direcciones largas, requisitos bancarios o identificadores compuestos no se truncan) y el coste computacional no crece con el número de fragmentos candidatos, por lo que el rendimiento se mantiene estable en documentos extensos. Cada pasada admite hasta 4096 tokens, suficiente para procesar la mayoría de documentos completos sin segmentación.

El entrenamiento se realizó sobre un dataset sintético de 4097 ejemplos generado en varias fases: definición jurídica del alcance de los datos personales y de las reglas de anotación, generación y aumento de documentos, y revisión manual de una parte de los ejemplos. El corpus cubre documentos de identidad, documentación laboral e interna de organizaciones, materiales corporativos y administrativos, documentos jurídicos y normativos, contratos, documentación comercial, financiera, contable y bancaria, documentos registrales y estatales, materiales médicos, sociales y educativos, documentación técnica y de producción, documentos sobre bienes inmuebles y vehículos, correspondencia empresarial y de usuarios, registros, directorios, formularios y tablas. Incluye variantes de OCR deficiente, HTML, Markdown y otros formatos. La distribución de entidades en el dataset es de 7790 PERSON, 1918 LOCATION, 4514 DATE, 1548 PHONE, 1004 EMAIL y 22.466 PII genéricas. No se documenta el uso de RLHF ni DPO.

La innovación técnica principal es el desacoplamiento entre pesos y esquema de etiquetas: el listado de etiquetas se pasa en la entrada y el modelo busca por el significado del nombre de la etiqueta. La contrapartida es que la calidad declarada solo aplica a las etiquetas de la tarjeta del modelo.

## Capacidades

- Detección de entidades de tipo PERSON, LOCATION, DATE, PHONE y EMAIL en textos en ruso.
- Detección de una clase genérica PII que agrupa identificadores personales: datos de pasaporte y documentos migratorios, SNILS, INN y otros números estatales, requisitos bancarios, números médicos, judiciales, notariales, de personal y académicos, datos de bienes y transporte, números de billetes y pedidos, cuentas, pases y códigos internos de sistemas.
- Anotación guiada por contexto, lo que permite identificar identificadores que no se pueden describir mediante expresiones regulares y distinguir datos de una persona física de datos de una organización.
- Predicción directa de límites de span sin restricción de longitud de entidad.
- Esquema de etiquetas configurable en tiempo de inferencia: permite renombrar etiquetas o añadir tipos nuevos sin reentrenamiento.
- Procesamiento de documentos completos de hasta 4096 tokens en una sola pasada.
- Robustez ante variantes de OCR deficiente, HTML, Markdown y otros formatos presentes en el corpus de entrenamiento.
- Salida con texto, offsets de inicio y fin, y umbral de confianza configurable.
- Soporte de procesamiento por lotes y de esquemas de extracción a través de la librería GLiNER2.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Anonimización previa a compartición de documentos jurídicos: el modelo marca datos de personas físicas en contratos, escritos y expedientes, respetando los datos de organizaciones y los valores de referencia no vinculados a una persona, lo que reduce el trabajo manual de revisión antes de entregar documentación a terceros.
- Cumplimiento de la ley 152-FZ en flujos documentales internos: integrado como paso de preprocesado, detecta identificadores personales en documentación de recursos humanos, nóminas y expedientes de personal para su enmascaramiento o seudonimización antes del almacenamiento.
- Desidentificación de historiales clínicos: la clase PII cubre números de historial médico y datos asociados, y la ventana de 4096 tokens permite procesar informes clínicos completos sin fragmentarlos, manteniendo la coherencia de los límites de entidad.
- Preparación de corpus para entrenamiento de modelos: eliminación o sustitución de PII en conjuntos de documentos rusos antes de usarlos en pipelines de entrenamiento o evaluación, con umbral de confianza ajustable para priorizar recall o precision según el requisito.
- Procesamiento de documentación financiera y bancaria: detección de requisitos bancarios, cuentas y números de pedido en extractos, facturas y correspondencia, aprovechando la distinción contextual entre datos de persona y de organización.
- Enmascaramiento en pipelines de digitalización con OCR: el entrenamiento incluye variantes de OCR deficiente, HTML y Markdown, lo que permite aplicar el modelo directamente sobre la salida de un motor OCR antes de indexar o archivar los documentos.
- Revisión de correspondencia y registros administrativos: detección de teléfonos, correos, direcciones y fechas en correo empresarial, formularios y tablas, con salida de offsets que facilita la sustitución automática en el texto original.
- Adaptación a esquemas propios de etiquetado: al aceptar las etiquetas en la entrada, un equipo puede renombrarlas para alinearlas con su taxonomía interna, asumiendo que la calidad declarada solo está garantizada para las etiquetas documentadas.

## Benchmarks y rendimiento

Evaluación sobre una muestra de validación de 405 documentos y 4134 entidades. Las métricas son estrictas: un span solo se contabiliza si sus límites coinciden exactamente con la referencia. La métrica Coverage es más laxa y mide la proporción de entidades de referencia completamente cubiertas por predicciones de la misma clase.

| Clase | Entidades | Precision | Recall | F1 | Coverage |
|---|---:|---:|---:|---:|---:|
| PERSON | 789 | 93,28% | 91,51% | 92,39% | 92,52% |
| LOCATION | 249 | 88,94% | 74,30% | 80,96% | 78,31% |
| DATE | 562 | 89,64% | 75,44% | 81,93% | 78,11% |
| PHONE | 136 | 95,04% | 84,56% | 89,49% | 86,03% |
| EMAIL | 62 | 100,00% | 87,10% | 93,10% | 87,10% |
| PII | 2336 | 89,91% | 80,86% | 85,15% | 83,05% |
| **Total** | 4134 | 90,83% | 81,98% | 86,18% | 84,06% |

Sensibilidad al umbral de decisión (valor por defecto 0,5):

| Umbral | Precision | Recall | F1 | TP | FP | FN |
|---:|---:|---:|---:|---:|---:|---:|
| 0,02 | 0,834 | 0,838 | 0,836 | 3464 | 689 | 670 |
| 0,10 | 0,868 | 0,834 | 0,851 | 3447 | 522 | 687 |
| 0,30 | 0,897 | 0,828 | 0,861 | 3422 | 392 | 712 |
| **0,50** | **0,908** | **0,820** | **0,862** | **3389** | **342** | **745** |
| 0,70 | 0,917 | 0,810 | 0,860 | 3349 | 302 | 785 |
| 0,90 | 0,929 | 0,795 | 0,857 | 3286 | 252 | 848 |
| 0,99 | 0,947 | 0,707 | 0,809 | 2922 | 164 | 1212 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 1,15 GB solo para pesos (287,4 M de parámetros), más overhead de activaciones y del tokenizador; en la práctica, alrededor de 2 GB en fp32 y en torno a 1 GB en fp16.
- El modelo cabe holgadamente en cualquier GPU de consumo actual: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090. También en GPUs de gama baja con 4-6 GB de VRAM.
- Para despliegue en servidor, no requiere A100 ni H100; una GPU de inference como L4, T4 o A10 es más que suficiente. El modelo también puede ejecutarse en CPU para lotes pequeños.
- Opciones de despliegue: la librería oficial es gliner2 (clase AutoExtractor), que permite cargar el modelo con from_pretrained y moverlo a CUDA. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. La tarjeta del modelo indica que el coste no crece con el número de fragmentos candidatos y que el rendimiento se mantiene estable en documentos extensos, pero no se aportan cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vladlinv/ru-pii-ner-gliner | 287,4 M | 4096 tokens | GLiNER2.5 ajustado para PII en ruso | Apache 2.0 | Hugging Face |
| metrika-labs/ru-pii-ner-gliner2.5 | no disponible | no disponible | GLiNER2.5 para tipos y límites de PII | no disponible | Hugging Face |
| fastino/gliner2.5-multi-v1 | no disponible | no disponible | GLiNER2.5 multilingüe base, sin especialización en PII | no disponible | Hugging Face |

La información disponible no permite comparar métricas de rendimiento entre estos modelos ni con alternativas de otros autores. El modelo de metrika-labs se cita en la propia tarjeta como referencia de la misma tarea y familia; el modelo base fastino/gliner2.5-multi-v1 es el punto de partida del ajuste fino.

## Limitaciones y advertencias

- La calidad declarada solo está garantizada para las seis etiquetas documentadas (ru_pii_person, ru_pii_location, ru_pii_date, ru_pii_phone, ru_pii_email, ru_pii). Con etiquetas arbitrarias o renombradas, el rendimiento no está garantizado.
- El modelo está especializado en ruso. Aunque el corpus incluye aproximadamente un 6% de ejemplos en otros idiomas, no se documenta calidad para ellos y no debe asumirse un rendimiento equivalente.
- El dataset de entrenamiento es completamente sintético (4097 ejemplos, con revisión manual parcial), lo que puede introducir un sesgo de distribución respecto a documentos reales y afectar a la generalización en dominios no representados.
- Las clases LOCATION y DATE presentan el recall más bajo (74,30% y 75,44% respectivamente), por lo que en flujos donde estos datos sean críticos conviene bajar el umbral o añadir una capa de validación.
- La anotación es conservadora: ante ambigüedad, el valor se marca como dato personal, lo que puede producir falsos positivos en valores que en realidad no identifican a una persona.
- Riesgo de alucinación de spans: como todo modelo extractivo, puede predecir límites incorrectos o entidades inexistentes; los offsets deben validarse contra el texto original antes de aplicar sustituciones automáticas.
- El umbral por defecto de 0,5 ofrece un equilibrio F1 de 0,862; subirlo a 0,99 eleva la precision a 0,947 pero reduce el recall a 0,707, lo que puede dejar PII sin detectar.
- La licencia Apache 2.0 permite uso comercial, pero el cumplimiento normativo efectivo (por ejemplo, de la ley 152-FZ) es responsabilidad del integrador y requiere auditoría humana del resultado.
- No se documentan tipos de cuantización disponibles ni integraciones con motores de inferencia de alto rendimiento, lo que limita las opciones de optimización en producción.
- No se documentan sesgos específicos más allá de los derivados de la composición del corpus sintético.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vladlinv/ru-pii-ner-gliner
- Modelo base: https://huggingface.co/fastino/gliner2.5-multi-v1
- Modelo de referencia de la misma tarea: https://huggingface.co/metrika-labs/ru-pii-ner-gliner2.5
- Documentación y repositorio de GLiNER2: https://github.com/fastino-ai/GLiNER2
