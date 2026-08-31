# Wravn/privacy-policy-topic

## Resumen

PrivaScope Topic Classifier es un modelo de clasificación de texto desarrollado por Wravn, diseñado para clasificar oraciones individuales de políticas de privacidad en 15 categorías temáticas (por ejemplo, Processing, Purpose, ThirdParty, UserRights, etc.). Forma parte de un pipeline más amplio llamado PrivaScope, que analiza políticas de privacidad de forma granular, clasificando cada oración por su alcance, tema, contenido y atributos. Este modelo en concreto se encarga de la capa de tema (Topic).

El modelo se basa en PrivBERT (mukund/privbert), una variante de RoBERTa preentrenada sobre aproximadamente un millón de políticas de privacidad, y se ha ajustado (fine-tuning) para la tarea de clasificación multi-etiqueta de 15 clases. Con 124,6 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware modesto. Su relevancia radica en la creciente necesidad de automatizar el análisis de políticas de privacidad, especialmente en el contexto de regulaciones como el GDPR, donde la revisión manual es costosa y propensa a errores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder) con cabeza de clasificación multi-etiqueta |
| Parametros totales | 124.657.167 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de RoBERTa-base, un transformer encoder con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención. La capa de clasificación es una cabeza lineal que produce logits para 15 etiquetas, con activación sigmoide para permitir predicciones multi-etiqueta (una oración puede pertenecer a varios temas simultáneamente). El modelo base es PrivBERT, una versión de RoBERTa preentrenada sobre alrededor de un millón de políticas de privacidad, lo que le proporciona un conocimiento previo del dominio.

El entrenamiento de fine-tuning se realizó sobre un conjunto de 3.078 oraciones, de las cuales 2.237 fueron anotadas manualmente a partir de políticas de privacidad reales y 841 fueron sintetizadas mediante un LLM para reducir el desequilibrio de clases en categorías poco representadas. No se menciona el uso de RLHF ni DPO; se trata de un ajuste supervisado estándar. La métrica de evaluación reportada es F1 macro (0.87) y F1 micro (0.88).

## Capacidades

- Clasificación multi-etiqueta de oraciones en 15 temas de políticas de privacidad: Processing, Purpose, ThirdParty, UserRights, Policy, Sharing, Contact, LegalBasis, Security/Privacy, Audience, Other, Control, Retention, Deletion y Selling.
- Especializado en el dominio de políticas de privacidad en inglés, gracias al preentrenamiento de PrivBERT.
- Integrable en pipelines de análisis de documentos legales mediante la librería transformers de HuggingFace.
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un clasificador.

## Casos de uso

- Análisis automatizado de políticas de privacidad: el modelo puede procesar cada oración de una política y etiquetarla con su tema, permitiendo a equipos legales y de cumplimiento identificar rápidamente secciones relevantes (por ejemplo, retención de datos, derechos del usuario, compartición con terceros).
- Comparativa de políticas entre empresas: al clasificar sistemáticamente las oraciones, se pueden generar resúmenes comparativos de cómo distintas empresas abordan temas como la venta de datos o la base legal.
- Monitorización de cambios en políticas: al ejecutar el clasificador sobre versiones anteriores y nuevas de una política, se pueden detectar cambios temáticos y priorizar la revisión humana.
- Asistencia a la redacción de políticas: los redactores pueden usar el modelo para verificar que todas las secciones temáticas requeridas estén presentes y correctamente etiquetadas.
- Investigación académica en NLP aplicado a privacidad: el modelo sirve como componente de referencia para estudios sobre análisis automático de políticas de privacidad.
- Integración en sistemas de gestión de consentimiento: el clasificador puede ayudar a categorizar las cláusulas que afectan al consentimiento del usuario, facilitando la generación de avisos personalizados.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| F1 Macro | 0.87 |
| F1 Micro | 0.88 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Al ser un modelo de 124,6 millones de parámetros, requiere aproximadamente 500 MB de VRAM en FP32 y unos 250 MB en FP16. Cabe en cualquier GPU consumer moderna (por ejemplo, NVIDIA GTX 1060 con 6 GB o superior).
- También puede ejecutarse en CPU con razonable velocidad para inferencia por lotes, gracias a su tamaño compacto.
- Para despliegue en producción, se recomienda usar librerías como HuggingFace transformers, ONNX Runtime o TensorRT para optimizar la latencia.
- No se requieren GPUs de datacenter (A100, H100) para este modelo; una RTX 3060 o similar es más que suficiente.
- El throughput estimado es alto: en una GPU consumer, puede procesar cientos de oraciones por segundo en lotes.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la búsqueda web realizada. Sin embargo, por su naturaleza, se puede comparar con otros clasificadores de políticas de privacidad basados en BERT, aunque no hay datos públicos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés; no soporta otros idiomas.
- El conjunto de entrenamiento es relativamente pequeño (3.078 oraciones), lo que puede limitar la generalización a políticas con estilos muy diferentes.
- La inclusión de oraciones sintetizadas por LLM puede introducir sesgos o patrones artificiales que no se corresponden con el lenguaje real de las políticas.
- El modelo solo cubre la capa de tema (Topic); no aborda alcance, contenido ni atributos, que son manejados por otros componentes del pipeline PrivaScope.
- Aunque la licencia MIT permite uso comercial, el modelo está pensado como parte de un pipeline de investigación; su uso en producción requiere validación adicional con datos reales.
- No se han publicado análisis de sesgos ni de robustez frente a variaciones lingüísticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Wravn/privacy-policy-topic
- Perfil del autor: https://huggingface.co/Wravn
- Modelo relacionado (Context classifier): https://huggingface.co/Wravn/roberta-privacy-policy-context

Nota: los campos "Related resources" de la model card (código, dataset, paper) están vacíos, por lo que no se incluyen enlaces adicionales.
