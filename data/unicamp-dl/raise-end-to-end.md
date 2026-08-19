# unicamp-dl/RAISE-End-to-End

## Resumen

RAISE-End-to-End es un adaptador LoRA (PEFT) desarrollado por el grupo unicamp-dl de la Universidad de Campinas (Brasil), diseñado para convertir el modelo base `unsloth/gpt-oss-20b-unsloth-bnb-4bit` en un agente de razonamiento para exploración interactiva de bases de datos SQL. El adaptador se alinea con el trabajo descrito en el artículo "RAISE: Reasoning Agent for Interactive SQL Exploration" (arXiv:2506.01273), que propone un agente de extremo a extremo capaz de responder preguntas en lenguaje natural sobre bases de datos relacionales combinando las capacidades de razonamiento de un LLM con un conjunto de herramientas estructuradas.

El modelo base es una versión cuantizada a 4 bits (bitsandbytes) del GPT-OSS-20B de OpenAI, un modelo de arquitectura MoE (mezcla de expertos) con 20 000 millones de parámetros totales y 2 expertos activos por token. El adaptador, de aproximadamente 0,1 GB, se publica en formato safetensors y se integra mediante la librería PEFT. Dado que el repositorio tiene cero descargas y cero likes, y la model card está prácticamente vacía, se trata de un artefacto de investigación reciente, probablemente vinculado a un proyecto académico en curso. La relevancia de este modelo reside en su enfoque: en lugar de un LLM genérico, ofrece un adaptador especializado para tareas de razonamiento sobre bases de datos, un dominio donde los agentes con tool calling están ganando tracción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre GPT-OSS-20B (MoE, 16 expertos, 2 activos) |
| Parametros totales | No disponible (el adaptador pesa ~0,1 GB; el modelo base tiene 20 B) |
| Parametros activos | No disponible (el modelo base activa 2 de 16 expertos) |
| Longitud de contexto | No disponible (el modelo base soporta hasta 128 000 tokens, no confirmado para el adaptador) |
| Tipos de cuantizacion | El adaptador en safetensors; el modelo base cuantizado a 4 bits (bitsandbytes) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el adaptador no declara licencia; el modelo base usa Apache 2.0) |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `unsloth/gpt-oss-20b-unsloth-bnb-4bit`, una versión cuantizada a 4 bits del GPT-OSS-20B, que emplea una arquitectura MoE con 16 expertos y activación de 2 por token. La cuantización 4-bit reduce drásticamente los requisitos de memoria, permitiendo el ajuste fino con LoRA en hardware de consumo. El adaptador en sí es una matriz LoRA de bajo rango, entrenada con la librería PEFT (versión 0.17.1 según los metadatos), lo que implica que solo se actualizaron un pequeño subconjunto de pesos durante el entrenamiento.

No se dispone de información sobre los datos de entrenamiento, el número de tokens utilizados, el régimen de entrenamiento (fp16, bf16, etc.) ni si se emplearon técnicas como RLHF o DPO. Por el nombre del modelo y el paper asociado, se infiere que el entrenamiento se orientó a tareas de generación de consultas SQL y razonamiento multi-paso sobre esquemas de bases de datos, probablemente con un conjunto de datos de instrucciones o de diálogos agente-herramienta. Sin embargo, estos detalles no están documentados en la model card.

## Capacidades

- Generacion de texto conversacional: el adaptador está etiquetado con el tag `conversational`, lo que sugiere que mantiene diálogos multi-turno.
- Razonamiento sobre bases de datos SQL: según el paper RAISE, el agente combina el LLM con herramientas estructuradas para explorar esquemas relacionales y responder preguntas en lenguaje natural.
- Tool calling: el diseño del agente RAISE implica el uso de herramientas (consultas SQL, inspección de esquemas), aunque no se especifica si el adaptador expone una interfaz de function calling estándar.
- Integración con el ecosistema PEFT: al ser un adaptador LoRA, se puede cargar sobre el modelo base cuantizado con la librería `peft` y `transformers`.
- Multilingüismo: no disponible; el modelo base GPT-OSS-20B tiene soporte multilingüe limitado (principalmente inglés), pero no hay confirmación para este adaptador.

## Casos de uso

- Asistente de analisis de datos para equipos de BI: un analista puede formular preguntas en lenguaje natural sobre una base de datos corporativa y el agente genera las consultas SQL correspondientes, explorando el esquema de forma autónoma. El adaptador es adecuado porque está especializado en razonamiento sobre esquemas relacionales.
- Generacion de informes ad-hoc: en lugar de escribir consultas manualmente, un usuario no técnico puede pedir "muestrame las ventas por region del ultimo trimestre" y el agente traduce la peticion a SQL ejecutable, aprovechando la ventana de contexto del modelo base para manejar esquemas extensos.
- Automatizacion de pruebas de bases de datos: el agente puede generar consultas de validacion a partir de especificaciones en lenguaje natural, ayudando a los equipos de QA a verificar la integridad de los datos sin escribir SQL manualmente.
- Educacion y formacion en SQL: el modelo puede actuar como tutor interactivo, explicando cómo se construye una consulta, qué tablas intervienen y por qué se elige un determinado join, basándose en el esquema de una base de datos de ejemplo.
- Exploracion de datos cientificos: en laboratorios de investigacion (como el propio unicamp-dl), el agente permite a investigadores sin perfil técnico consultar bases de datos experimentales, reduciendo la barrera de entrada al análisis de datos.
- Chatbot de soporte para sistemas de gestion de datos: integrado en una plataforma interna, el adaptador puede responder a preguntas operativas sobre el contenido de la base de datos, como "¿cuantos pedidos estan pendientes?" o "¿cual es el stock medio del almacen 3?", siempre que el esquema esté disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. El paper de RAISE (arXiv:2506.01273) podría contener evaluaciones específicas, pero no se ha accedido a su contenido completo y no se deben inventar cifras.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA en sí pesa ~0,1 GB, pero el modelo base cuantizado a 4 bits (GPT-OSS-20B) requiere aproximadamente 11-12 GB de VRAM en fp16 con cuantización 4-bit. Con LoRA cargado, se necesita un margen adicional de 1-2 GB para activaciones y contexto.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A100 40 GB) es suficiente para inferencia. Para entrenamiento del adaptador, se recomienda al menos 24 GB.
- En consumer GPU: sí, cabe en tarjetas de gama alta como RTX 3090/4090 (24 GB) con cuantización 4-bit y el adaptador LoRA.
- Opciones de despliegue: al ser un adaptador PEFT, se puede servir con `transformers` + `peft`, o mediante `vLLM` si se fusiona el adaptador con el modelo base. También es compatible con `llama.cpp` si se convierte el modelo base a GGUF y se aplica el adaptador (aunque el adaptador está en safetensors, no en formato GGUF nativo).
- Latencia y throughput: no disponibles. El modelo base MoE con 2 expertos activos de 16 reduce el coste computacional por token, pero la cuantización 4-bit añade overhead de dequantización. Sin datos medidos, no se puede estimar con precisión.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente, ya que RAISE-End-to-End es un adaptador especializado sobre GPT-OSS-20B y no un modelo autónomo. Como referencia estructural:

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPT-OSS-20B (base) | 20 B (MoE) | 128 k | MoE, 16 expertos, 2 activos | Apache 2.0 | Hugging Face |
| RAISE-End-to-End (adaptador) | ~0,1 GB (LoRA) | No disponible | LoRA sobre GPT-OSS-20B 4-bit | No disponible | Hugging Face |
| Otros agentes SQL (p. ej., Text2SQL basado en LLM) | Variable | Variable | Variable | Variable | Variable |

La comparación con alternativas como `sqlcoder-7b` o `sqlcoder-15b` (modelos especializados en generación de SQL) sería relevante, pero no se dispone de datos de rendimiento para RAISE-End-to-End, por lo que no se puede establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al derivar de GPT-OSS-20B, hereda los sesgos del modelo base, que no están caracterizados en esta model card.
- Riesgo de alucinacion: alto en tareas de generación de SQL, especialmente si el esquema de la base de datos no está bien definido o si el contexto supera la ventana efectiva del modelo. Las consultas generadas pueden ser sintácticamente válidas pero semánticamente incorrectas.
- Limitaciones de contexto: la ventana de contexto del modelo base es de 128 k tokens, pero el adaptador puede no estar entrenado para aprovecharla por completo. Además, la cuantización 4-bit puede degradar la calidad en tareas de razonamiento largo.
- Restricciones de licencia: la licencia del adaptador no está declarada, lo que impide su uso comercial sin autorización explícita. El modelo base tiene licencia Apache 2.0, pero el adaptador es un trabajo derivado con estatus legal incierto.
- Caveat de produccion: el modelo tiene cero descargas y cero likes, y la model card está incompleta. No hay evidencia de que haya sido validado en entornos reales. Su uso en producción requiere una evaluación exhaustiva y la verificación de las consultas SQL generadas antes de ejecutarlas contra bases de datos críticas.
- Dependencia de herramientas: el agente RAISE requiere herramientas externas (conexión a bases de datos, ejecución de SQL) que no están incluidas en el adaptador; su despliegue implica integrar un entorno de ejecución seguro.

## Enlaces

- Hugging Face: https://huggingface.co/unicamp-dl/RAISE-End-to-End
- Organización unicamp-dl: https://huggingface.co/unicamp-dl
- Paper RAISE (arXiv): https://arxiv.org/pdf/2506.01273
- GitHub de AIMS-Unicamp: https://github.com/AI-Unicamp/
