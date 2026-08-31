# vladlinv/ru-pii-ner-gliner2.5

## Resumen

El modelo `vladlinv/ru-pii-ner-gliner2.5` es un extractor de entidades de datos personales (PII) para documentos en ruso, desarrollado por Vlad Linov. Se basa en el modelo `fastino/gliner2.5-multi-v1`, un GLiNER2.5 sobre el encoder mDeBERTa-v3-base, con 287 millones de parámetros. Su objetivo es localizar y clasificar nombres, direcciones, fechas, teléfonos, correos y una amplia gama de identificadores personales (pasaporte, SNILS, INN, cuentas bancarias, números de expedientes, etc.) en textos legales, administrativos, médicos, financieros y de otro tipo.

La relevancia de este modelo radica en su enfoque específico para el cumplimiento de la normativa rusa de protección de datos (152-FZ), con una anotación conservadora que distingue datos personales de datos de organizaciones. Su arquitectura GLiNER2.5 permite predecir límites de entidad directamente, sin enumerar todos los spans posibles, lo que soporta entidades de longitud arbitraria y un contexto de hasta 4096 tokens. Al ser un modelo ligero, puede ejecutarse en CPU y hardware de consumo, y admite etiquetas personalizadas sin reentrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2.5 (encoder mDeBERTa-v3-base) |
| Parametros totales | 287.355.159 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ruso (principal); el dataset incluye ~6% de ejemplos en inglés, bielorruso, uzbeko, kazajo, kirguís, tayiko, armenio, georgiano y azerí |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `fastino/gliner2.5-multi-v1`, que implementa la arquitectura GLiNER2.5. A diferencia de los GLiNER originales que enumeran todos los fragmentos posibles, GLiNER2.5 predice directamente el inicio y el fin de cada entidad y luego asocia el fragmento extraído con cada etiqueta. Esto elimina la limitación de longitud de las entidades y mantiene la velocidad incluso en documentos extensos. El encoder base es mDeBERTa-v3-base, con 287M parámetros.

El entrenamiento se realizó sobre un dataset completamente generado de 4.097 ejemplos, que cubre documentos personales, laborales, corporativos, legales, médicos, financieros, gubernamentales, de propiedad, transporte, correspondencia, registros, formularios y tablas. La anotación se hizo según el contexto y la ley rusa 152-FZ, con criterios conservadores: si no está claro a quién pertenece un dato, se considera PII. Se incluyeron variantes de OCR defectuoso, HTML, Markdown y otros formatos. No se menciona el uso de RLHF o DPO; es un fine-tune supervisado estándar.

## Capacidades

- Extracción de entidades PII en ruso: nombres de persona, ubicaciones, fechas, teléfonos, correos electrónicos y una categoría genérica `PII` que cubre identificadores como pasaporte, SNILS, INN, cuentas bancarias, números de expedientes judiciales, médicos, notariales, de recursos humanos, educativos, de propiedad, transporte, billetes, pedidos, cuentas, pases y códigos internos.
- Detección de límites precisos de entidad, sin restricción de longitud (direcciones largas, datos bancarios compuestos, identificadores complejos).
- Procesamiento de documentos completos de hasta 4096 tokens en una sola pasada, sin necesidad de dividir el texto.
- Etiquetas dinámicas: las etiquetas se pasan como entrada junto con el texto, por lo que se pueden renombrar o añadir nuevas categorías sin reentrenar el modelo. La calidad garantizada solo aplica a las etiquetas originales de la tarjeta.
- Capacidad zero-shot para etiquetas personalizadas, aunque con rendimiento no garantizado.
- Soporte para inferencia en CPU y GPU, gracias al diseño ligero de GLiNER.
- Integración con la librería `gliner2` mediante `AutoExtractor`.

## Casos de uso

- Anonimización de documentos legales y administrativos: el modelo puede localizar y marcar todos los datos personales en contratos, sentencias, escrituras y expedientes, facilitando la redacción automática antes de su publicación o transferencia.
- Cumplimiento normativo de protección de datos (152-FZ): empresas rusas pueden usar el modelo para auditar sus documentos internos y asegurar que no se filtren datos personales en informes, actas o comunicaciones.
- Limpieza de bases de datos y registros: antes de compartir datasets con terceros, el modelo identifica campos con PII (nombres, teléfonos, correos, identificadores) para su enmascaramiento o seudonimización.
- Procesamiento de documentos médicos: extrae datos de pacientes, números de historias clínicas, fechas y ubicaciones para sistemas de gestión hospitalaria, respetando la confidencialidad.
- Gestión de recursos humanos: en contratos laborales, nóminas y expedientes de empleados, el modelo detecta datos personales y números de identificación para su tratamiento seguro.
- Filtrado de PII en atención al cliente: integrado en un pipeline de soporte, puede eliminar datos personales de conversaciones antes de almacenarlas o usarlas para entrenamiento de modelos.
- Extracción de entidades en documentos financieros: identifica cuentas bancarias, números de tarjetas, INN y otros identificadores en facturas, extractos y contratos comerciales.

## Benchmarks y rendimiento

El autor proporciona métricas sobre una validación de 405 documentos con 4.134 entidades. Las métricas son estrictas: un span solo se cuenta si coincide exactamente con la referencia. La columna "Coverage" indica la proporción de entidades de referencia completamente cubiertas por predicciones de la misma clase.

| Clase | Entidades | Precision | Recall | F1 | Coverage |
|---|---:|---:|---:|---:|---:|
| PERSON | 789 | 93.28% | 91.51% | 92.39% | 92.52% |
| LOCATION | 249 | 88.94% | 74.30% | 80.96% | 78.31% |
| DATE | 562 | 89.64% | 75.44% | 81.93% | 78.11% |
| PHONE | 136 | 95.04% | 84.56% | 89.49% | 86.03% |
| EMAIL | 62 | 100.00% | 87.10% | 93.10% | 87.10% |
| PII | 2.336 | 89.91% | 80.86% | 85.15% | 83.05% |
| **Total** | 4.134 | 90.83% | 81.98% | 86.18% | 84.06% |

Dependencia del umbral de decisión (por defecto 0.5):

| Umbral | Precision | Recall | F1 | TP | FP | FN |
|---:|---:|---:|---:|---:|---:|---:|
| 0.02 | 0.834 | 0.838 | 0.836 | 3.464 | 689 | 670 |
| 0.10 | 0.868 | 0.834 | 0.851 | 3.447 | 522 | 687 |
| 0.30 | 0.897 | 0.828 | 0.861 | 3.422 | 392 | 712 |
| **0.50** | **0.908** | **0.820** | **0.862** | **3.389** | **342** | **745** |
| 0.70 | 0.917 | 0.810 | 0.860 | 3.349 | 302 | 785 |
| 0.90 | 0.929 | 0.795 | 0.857 | 3.286 | 252 | 848 |
| 0.99 | 0.947 | 0.707 | 0.809 | 2.922 | 164 | 1.212 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo tiene 287M parámetros, lo que en precisión fp32 ocupa aproximadamente 1,15 GB en memoria. En fp16 o int8, el uso de VRAM sería menor (alrededor de 0,6 GB y 0,3 GB respectivamente), aunque no se proporcionan cifras oficiales.
- Puede ejecutarse en CPU sin GPU, según las características del framework GLiNER, que está optimizado para hardware de consumo.
- En GPU, cualquier tarjeta con al menos 2 GB de VRAM debería ser suficiente para inferencia en fp16. Modelos como RTX 3060, RTX 4060 o superiores son adecuados.
- Para despliegue, se recomienda usar la librería `gliner2` con `AutoExtractor`. También es compatible con el ecosistema GLiNER (llama.cpp, Ollama, TGI) si se exportan los pesos a los formatos adecuados, aunque no se documenta explícitamente.
- La latencia depende del hardware y la longitud del texto. Al procesar hasta 4096 tokens en una sola pasada, en una GPU moderna se espera un throughput de decenas de documentos por segundo, pero no se aportan mediciones concretas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| vladlinv/ru-pii-ner-gliner2.5 | GLiNER2.5 (mDeBERTa-v3-base) | 287M | 4096 | Apache 2.0 | NER de PII en ruso, boundary extraction |
| vladlinv/ru-pii-ner | ruRoberta-large | ~355M (estimado) | 512 (típico) | Apache 2.0 | NER de PII en ruso, clasificación de spans |
| fastino/gliner2-privacy-filter-PII-multi | GLiNER2.5 (mDeBERTa-v3-base) | 287M | 4096 | Apache 2.0 | Filtro de PII multilingüe, basado en el mismo modelo base |

No se dispone de métricas comparativas publicadas entre estos modelos. La principal diferencia del modelo de vladlinv es su especialización en la normativa rusa y su anotación conservadora basada en 152-FZ, mientras que el filtro de Fastino es multilingüe y más genérico.

## Limitaciones y advertencias

- El modelo está entrenado principalmente en ruso; su rendimiento en otros idiomas no está garantizado, aunque el dataset incluye una pequeña proporción de ejemplos en lenguas de la región.
- El dataset es completamente sintético, lo que puede introducir sesgos respecto a documentos reales, especialmente en variaciones de formato, jerga o errores tipográficos no cubiertos.
- La anotación es conservadora: si no está claro a quién pertenece un dato, se marca como PII. Esto puede generar falsos positivos en contextos donde los datos son de organizaciones o referencias genéricas.
- Las etiquetas personalizadas funcionan por similitud semántica, pero la calidad solo está garantizada para las etiquetas originales de la tarjeta (`ru_pii_person`, `ru_pii_location`, `ru_pii_date`, `ru_pii_phone`, `ru_pii_email`, `ru_pii`).
- El modelo no distingue entre datos personales de diferentes personas en el mismo documento; la categoría `PII` agrupa todos los identificadores, lo que puede requerir postprocesamiento para separar entidades.
- No se han publicado análisis de sesgos demográficos o de robustez ante ataques adversarios.
- La licencia Apache 2.0 permite uso comercial, pero el cumplimiento de la normativa de protección de datos (RGPD, 152-FZ) es responsabilidad del usuario final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vladlinv/ru-pii-ner-gliner2.5
- Modelo base: https://huggingface.co/fastino/gliner2.5-multi-v1
- Repositorio GLiNER: https://github.com/urchade/GLiNER
- Página de Fastino sobre GLiNER2.5: https://fastino.ai/models/gliner2-5
- Modelo alternativo del autor (ruRoberta-large): https://huggingface.co/vladlinv/ru-pii-ner
- Modelo de clasificación de fragmentos PII: https://huggingface.co/vladlinv/ru-pii-gate
- Perfil de GitHub del autor: https://github.com/vladlinv
