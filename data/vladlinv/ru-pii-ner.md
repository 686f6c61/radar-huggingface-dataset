# vladlinv/ru-pii-ner

## Resumen

vladlinv/ru-pii-ner es un modelo de reconocimiento de entidades nombradas (NER) especializado en la detección de datos personales (PII, por sus siglas en inglés) en documentos en ruso. Desarrollado por Vlad Linov, el modelo se presenta como un adaptador LoRA sobre el modelo base ai-forever/ruRoberta-large, e incorpora una cabeza NER lineal con salidas BIO y cadenas CRF por tipo de entidad. Su objetivo principal es localizar y clasificar información personal como nombres, direcciones, fechas, teléfonos, correos electrónicos y, de forma genérica, cualquier identificador que permita vincular a una persona con un documento (pasaportes, SNILS, INN, números de cuentas bancarias, etc.).

El modelo está entrenado sobre un dataset sintético de 4.097 ejemplos generados y anotados manualmente en parte, con cobertura de una amplia variedad de documentos (personales, laborales, jurídicos, médicos, financieros, etc.). Su relevancia actual radica en la necesidad de cumplir con la normativa rusa de protección de datos (152-FZ) y en la dificultad de detectar identificadores que no pueden describirse mediante expresiones regulares simples. La anotación se realizó siguiendo criterios legales, distinguiendo datos personales de datos de organizaciones o valores de referencia.

El modelo se distribuye bajo licencia Apache 2.0 y se integra mediante una biblioteca específica que carga el adaptador LoRA, la cabeza NER y las cadenas CRF, ofreciendo una interfaz compatible con el pipeline de token-classification de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre ai-forever/ruRoberta-large (transformer encoder) + cabeza NER lineal con 18 salidas (6 tipos × BIO) + CRF por tipo |
| Parametros totales | no disponible (el adaptador LoRA tiene un numero reducido de parametros; el modelo base ruRoberta-large no se especifica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base ruRoberta-large; tipicamente 512 tokens) |
| Tipos de cuantizacion | no disponible (los pesos del adaptador estan en safetensors; el modelo base puede cuantizarse con herramientas estandar) |
| Idiomas soportados | ruso (principal), con aproximadamente 6% de ejemplos en otros idiomas (ingles, bielorruso, uzbeko, kazajo, kirguiz, tayiko, armenio, georgiano, azerbaiyano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA y cabeza NER/CRF) |

## Arquitectura y entrenamiento

El modelo se construye como un adaptador LoRA sobre el encoder ruRoberta-large de ai-forever. La salida del transformer se conecta a una cabeza lineal con 18 salidas correspondientes a seis tipos de entidad (PERSON, LOCATION, DATE, PHONE, EMAIL y PII) en formato BIO (Begin, Inside, Outside). Cada tipo de entidad se decodifica mediante su propia cadena CRF (Conditional Random Field), lo que permite modelar dependencias entre etiquetas consecutivas.

El entrenamiento se realizó sobre un dataset completamente sintético de 4.097 ejemplos, generado en varias etapas: primero una revisión legal de la composición de los datos personales y las reglas de anotación, después la generación y aumento de documentos, y finalmente una corrección manual parcial. El dataset cubre una amplia gama de documentos: personales, laborales, corporativos, jurídicos, financieros, médicos, educativos, de propiedad, transporte, correspondencia, registros, formularios, tablas, etc. También incluye variantes con OCR defectuoso, HTML, Markdown y otros formatos.

La anotación se realizó por contexto, lo que permite identificar identificadores que no son expresables mediante regex y distinguir entre datos de personas y de organizaciones. Las reglas de anotación se basan en la ley rusa 152-FZ y en la práctica judicial, con un criterio conservador: si no está claro a quién pertenece el dato, se considera personal. No se anotan datos de organizaciones ni valores de referencia no vinculados a una persona.

## Capacidades

- Detección de entidades nombradas de tipo PII en textos en ruso, incluyendo:
  - PERSON: nombres, apellidos, patronímicos
  - LOCATION: direcciones, lugares
  - DATE: fechas de nacimiento, emisión, etc.
  - PHONE: números de teléfono
  - EMAIL: direcciones de correo electrónico
  - PII: clase genérica que cubre identificadores personales como pasaportes, SNILS, INN, números de cuentas, identificadores médicos, judiciales, notariales, laborales, educativos, de propiedad, transporte, billetes, pedidos, cuentas de usuario, pases, códigos internos de sistemas, etc.
- Clasificación jerárquica: PII es la clase general y las demás son subclases; un fragmento puede recibir simultáneamente la etiqueta PII y una etiqueta específica.
- Capacidad de procesamiento por lotes y filtrado por confianza mínima.
- Ajuste del sesgo de transición O→B en la matriz CRF mediante el parámetro `o_to_b_shift`, que permite controlar el equilibrio entre precisión y recall.
- Integración con el pipeline de token-classification de Transformers a través de una biblioteca auxiliar.
- No tiene capacidades de generación de texto, razonamiento, tool calling ni visión; es exclusivamente un modelo de extracción de entidades.

## Casos de uso

- Anonimización de documentos legales: el modelo localiza todos los datos personales en contratos, acuerdos y escritos para su posterior enmascaramiento, cumpliendo con los requisitos de la ley 152-FZ.
- Cumplimiento normativo en empresas: procesamiento de bases de datos internas (RRHH, clientes, proveedores) para identificar y proteger información personal antes de su tratamiento o transferencia.
- Sanidad y datos médicos: extracción de identificadores de pacientes en historiales clínicos, recetas y documentos de seguros para su desidentificación en investigación.
- Sector financiero: detección de datos personales en extractos bancarios, solicitudes de crédito y contratos financieros para prevenir fugas de información.
- Gestión de datos en soporte al cliente: revisión de conversaciones de chat y correos electrónicos para eliminar PII antes de su almacenamiento o análisis.
- Preparación de datasets para entrenamiento de modelos: filtrado de datos personales en corpus de texto en ruso antes de su uso en tareas de NLP, evitando sesgos y problemas de privacidad.
- Auditoría de seguridad: análisis de documentos internos para verificar que no se exponen datos personales en entornos no autorizados.
- Procesamiento de documentos con OCR defectuoso: gracias al entrenamiento con variantes de mala calidad, el modelo puede identificar entidades incluso cuando los límites no son exactos, como se refleja en las métricas de coverage.

## Benchmarks y rendimiento

La validación se realizó sobre 457 ejemplos con 2.433 entidades únicas. Las métricas reportadas incluyen precisión, recall, F1 estricto y coverage (proporción de entidades de referencia completamente cubiertas por la predicción, que es el indicador práctico para anonimización).

| Clase | Entidades | Precision | Recall | F1 | Coverage |
|---|---:|---:|---:|---:|---:|
| PERSON | 830 | 92.10% | 92.65% | 92.37% | 96.99% |
| LOCATION | 258 | 78.65% | 81.40% | 80.00% | 93.41% |
| DATE | 580 | 88.51% | 90.34% | 89.42% | 95.00% |
| PHONE | 138 | 87.69% | 82.61% | 85.07% | 86.23% |
| EMAIL | 62 | 86.76% | 95.16% | 90.77% | 96.77% |
| PII | 2.433 | 84.34% | 85.86% | 85.09% | 93.51% |
| **Total** | 4.301 | 86.18% | 87.54% | 86.85% | **94.19%** |

No se han publicado comparaciones con otros modelos NER en la información disponible.

## Requisitos de hardware

- El modelo base ruRoberta-large es un transformer de tamaño grande (probablemente alrededor de 355 millones de parámetros, aunque no se especifica en la documentación). La inferencia requiere cargar el modelo base completo más el adaptador LoRA.
- VRAM estimada: para inferencia en FP32, se necesitarían aproximadamente 1.5-2 GB solo para los pesos del modelo base; con cuantización a 8 bits o 4 bits, la huella se reduce significativamente (menos de 1 GB). Sin embargo, no se proporcionan cifras exactas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16; una RTX 3060 o superior es suficiente. Para despliegues en producción, una A10 o T4 es adecuada.
- Al ser un adaptador LoRA, el modelo puede ejecutarse en CPU con razonable latencia para textos cortos, aunque para lotes grandes se recomienda GPU.
- Opciones de despliegue: la biblioteca oficial `ru_pii_ner` permite inferencia directa; también se puede integrar con el pipeline de Transformers. No se mencionan integraciones con vLLM, Ollama o TGI, pero al ser un modelo de encoder, puede servirse con frameworks estándar de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen alternativas genéricas de NER para ruso (por ejemplo, modelos basados en ruBERT o ruRoBERTa), pero no se han publicado comparativas directas con este modelo.

## Limitaciones y advertencias

- El modelo está entrenado principalmente en ruso; aunque el dataset incluye un 6% de ejemplos en otros idiomas, su rendimiento fuera del ruso no está garantizado.
- La anotación se basa en la legislación rusa (152-FZ) y en la práctica judicial rusa, por lo que el criterio de qué constituye un dato personal puede no coincidir con regulaciones de otros países.
- El dataset es completamente sintético, lo que puede introducir sesgos y limitar la generalización a documentos reales con formatos no vistos.
- El modelo no distingue entre entidades solapadas (por ejemplo, un nombre dentro de una dirección) y puede generar etiquetas múltiples para el mismo fragmento (PII + clase específica), lo que requiere una lógica de postprocesado.
- Las métricas de precisión/recall son moderadas en clases como LOCATION y PHONE; el coverage es alto, pero los límites exactos pueden no coincidir, especialmente con textos de OCR deficiente.
- El modelo es solo una capa de un sistema de anonimización; la documentación recomienda complementarlo con expresiones regulares, diccionarios y reglas de negocio.
- No se proporcionan detalles sobre el número exacto de parámetros del adaptador ni sobre el proceso de entrenamiento (épocas, hiperparámetros, función de pérdida), lo que limita la reproducibilidad.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de la normativa de protección de datos aplicable en su jurisdicción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vladlinv/ru-pii-ner
- Repositorio GitHub: https://github.com/vladlinv/ru-pii-ner
- Modelo de filtrado ligero (ru-pii-gate): https://huggingface.co/vladlinv/ru-pii-gate
- Perfil del autor en Hugging Face: https://huggingface.co/vladlinv
