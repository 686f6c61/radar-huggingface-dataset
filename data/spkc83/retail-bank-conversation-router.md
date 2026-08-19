# spkc83/retail-bank-conversation-router

## Resumen

El modelo `spkc83/retail-bank-conversation-router` es un clasificador de texto basado en un cross-encoder DistilBERT, desarrollado por el autor spkc83. Su funcion principal es actuar como enrutador de conversaciones para entornos de banca minorista, clasificando intenciones de usuario, detectando consultas fuera de dominio (OOD) y etiquetando relaciones conversacionales entre turnos. Con 66,36 millones de parametros, está diseñado para ser un componente ligero y de baja latencia en un pipeline de agente conversacional.

La relevancia de este modelo radica en su enfoque de seguridad y control: las intenciones que detecta son puramente diagnosticas y nunca autorizan herramientas ni se inyectan en el prompt de generación de un LLM. Esto lo convierte en una capa de filtrado ideal para sistemas de producción donde se necesita evitar que un modelo generativo responda a temas no soportados o acceda a funciones no permitidas. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

El modelo se presenta como un router con tres cabezas de clasificación independientes: una para dominio soportado, otra para intención fina y una tercera para relaciones conversacionales. Los datos de entrenamiento excluyen planes de herramientas, resultados de herramientas y respuestas finales, centrándose únicamente en el texto visible previo, el estado del diálogo y el turno actual del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT cross-encoder (base) |
| Parametros totales | 66.362.880 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificado (el modelo base DistilBERT utiliza 512 tokens) |
| Tipos de cuantizacion | No especificado (pesos en safetensors) |
| Idiomas soportados | No especificado (modelo base en ingles, uncased) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DistilBERT, una versión destilada de BERT que conserva el 97% de su rendimiento con un 40% menos de parametros. En este caso, se utiliza como cross-encoder, lo que significa que la secuencia completa (contexto previo y turno actual) se procesa conjuntamente para producir una clasificación. La arquitectura incluye tres cabezas de clasificación independientes: una para el dominio soportado (in-domain vs OOD), otra para la intención fina del usuario, y una tercera para etiquetar la relación conversacional entre turnos. La via amplia (broad lane) se deriva directamente de la intención detectada.

El entrenamiento se realizó sobre un corpus gobernado con 19.363 filas de entrenamiento, 5.056 de validación y 6.171 de test. Los datos de entrada incluyen únicamente el texto visible previo del usuario y asistente, el estado del diálogo antes del turno, y el turno actual del usuario. Se excluyen explícitamente los planes de herramientas, los resultados de herramientas, las salidas esperadas y las respuestas finales. No se menciona el uso de RLHF ni DPO; el proceso parece ser un fine-tuning supervisado estándar sobre DistilBERT.

## Capacidades

- Clasificación de intenciones finas en el dominio de banca minorista, con un macro F1 de 0.990312 en el conjunto de test.
- Detección de dominio soportado (in-domain vs out-of-domain), con una tasa de falsa aceptación OOD de 0.007899.
- Etiquetado de relaciones conversacionales entre turnos, con un macro F1 de 0.996474.
- Detección de cambios de tema (topic-shift) que caen fuera de dominio, con una tasa de falsa aceptación de 0.001575.
- Detección de falsos rechazos en contexto, con una tasa de 0.000000 en los conjuntos evaluados.
- Capacidad de reparación de errores conversacionales, con una tasa de falsos rechazos de 0.000000.
- No es generativo: no produce texto, solo clasifica y enruta.

## Casos de uso

- Enrutamiento de consultas en banca digital: el modelo puede clasificar cada turno del usuario en intenciones concretas (consulta de saldo, transferencia, bloqueo de tarjeta, etc.) y dirigir la conversación al flujo de negocio adecuado dentro de una aplicacion movil o web.
- Filtro de seguridad para agentes LLM: antes de que un modelo generativo procese una consulta, este router puede rechazar preguntas fuera de dominio (OOD) o detectar intentos de desviar el tema, evitando que el LLM alucine o proporcione información incorrecta sobre productos no soportados.
- Triaje de tickets de soporte: en un sistema de ticketing, el modelo puede clasificar automáticamente la intención de cada mensaje entrante y asignarlo al departamento correcto (reclamaciones, productos, soporte técnico) con alta precisión.
- Gestion de contexto multi-turno: gracias a sus cabezas de relación conversacional, el modelo puede mantener el hilo de una conversación, detectando si el usuario está continuando una petición anterior o si ha cambiado de tema, lo que permite al sistema decidir si debe reiniciar el contexto.
- Control de autorizacion de herramientas (function calling): las intenciones detectadas son diagnosticas y no autorizan herramientas directamente, pero el sistema puede usar estas etiquetas para decidir si un LLM tiene permitido invocar una función de transferencia o consulta de datos sensibles, reduciendo el riesgo de acciones no autorizadas.
- Monitorizacion de calidad de agentes: las etiquetas de relación y las tasas de falsos rechazos pueden utilizarse para auditar conversaciones reales, identificando patrones donde el sistema rechaza incorrectamente peticiones válidas o acepta consultas fuera de dominio.
- Deteccion de quejas o reclamaciones urgentes: al clasificar intenciones finas, el modelo puede priorizar mensajes que indiquen insatisfacción o problemas con productos, enrutándolos a un flujo de escalado inmediato.

## Benchmarks y rendimiento

Los resultados se obtuvieron sobre el conjunto de test retenido (held-out) y se presentan en la model card del autor:

| Metrica | Valor |
|---|---|
| Intent macro F1 | 0.990312 |
| Relation macro F1 | 0.996474 |
| In-domain false-refusal rate | 0.000000 |
| OOD false-accept rate | 0.007899 |
| Contextual false-refusal rate | 0.000000 |
| Repair false-refusal rate | 0.000000 |
| Topic-shift OOD false-accept rate | 0.001575 |

No se han publicado comparativas con otros modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU viable: con 66 millones de parametros, el modelo puede ejecutarse en tiempo real en un procesador moderno sin necesidad de GPU.
- VRAM estimada: menos de 500 MB en fp32, menos de 250 MB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (ej. T4, RTX 3060, incluso integradas modernas) es suficiente.
- Despliegue: compatible con Transformers (pipeline de text-classification), Hugging Face Inference Endpoints (con soporte para text-embeddings-inference), y puede exportarse a ONNX para entornos de producción ligeros.
- Latencia estimada: en CPU, latencias de 10-30 ms por consulta; en GPU, inferiores a 5 ms, dependiendo de la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos publicados con otros modelos de enrutamiento conversacional. Sin embargo, se puede comparar estructuralmente con alternativas comunes:

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| spkc83/retail-bank-conversation-router | 66 M | DistilBERT cross-encoder | 512 tokens (base) | Apache 2.0 | Cabezas multiples para intencion, OOD y relacion |
| distilbert-base-uncased | 66 M | DistilBERT encoder | 512 tokens | Apache 2.0 | Modelo base sin fine-tuning especifico |
| bert-base-uncased | 110 M | BERT encoder | 512 tokens | Apache 2.0 | Modelo base mas pesado, requiere fine-tuning |

La ventaja del modelo evaluado es que ya viene fine-tuneado para un dominio especifico (banca minorista) y con cabezas de clasificacion especializadas, lo que reduce el esfuerzo de adaptacion. La desventaja es que no es generativo y depende del corpus de entrenamiento proporcionado.

## Limitaciones y advertencias

- El modelo base es `distilbert-base-uncased`, lo que implica que el texto se normaliza a minusculas y el vocabulario esta optimizado para ingles. No se especifica si el fine-tuning incluye otros idiomas.
- No es un modelo generativo; no puede redactar respuestas ni razonar sobre el contenido, solo clasificar.
- La tasa de falsa aceptacion OOD es de 0.007899 (aproximadamente 0,79%), lo que significa que existe un pequeño margen de error donde consultas fuera de dominio podrian ser aceptadas como validas.
- El contexto maximo esta limitado por la arquitectura DistilBERT (512 tokens). Conversaciones muy largas deberan truncarse o resumirse antes de ser procesadas.
- Los datos de entrenamiento se centran en banca minorista; el rendimiento en otros sectores (seguros, telecomunicaciones) no esta garantizado y requeriria re-entrenamiento.
- Aunque la licencia Apache 2.0 permite uso comercial, el autor no ofrece garantias implicitas sobre el rendimiento en produccion; se recomienda validar con datos propios antes del despliegue.

## Enlaces

- Modelo en Hugging Face: [https://huggingface.co/spkc83/retail-bank-conversation-router](https://huggingface.co/spkc83/retail-bank-conversation-router)
- Modelo base: [distilbert/distilbert-base-uncased](https://huggingface.co/distilbert/distilbert-base-uncased)
- No se han encontrado papers, blogs o repositorios adicionales en la informacion proporcionada.
