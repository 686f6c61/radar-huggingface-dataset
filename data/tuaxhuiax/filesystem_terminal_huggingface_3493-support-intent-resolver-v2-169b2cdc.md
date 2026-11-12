# TUaxhuiax/filesystem_terminal_huggingface_3493-support-intent-resolver-v2-169b2cdc

## Resumen

Support Intent Resolver v2.1.0 es un modelo de clasificación de texto afinado a partir de `microsoft/deberta-v3-base` y publicado por el usuario TUaxhuiax en Hugging Face. Su tarea es la clasificación de intenciones en el ámbito de atención al cliente (intent classification para customer support), es decir, asignar a un mensaje entrante una etiqueta de intención que permita enrutarlo al flujo o al agente adecuado. El modelo tiene 88 millones de parámetros y se distribuye con licencia Apache 2.0.

El checkpoint seleccionado (ckpt-d4) reporta en la model card una accuracy de 0.906, un macro F1 de 0.932, una latencia P95 de 118 ms y un throughput de 165 qps, con una huella de memoria de 900 MB. Son cifras propias del autor, no verificadas de forma independiente, y no se especifican el conjunto de evaluación ni la metodología empleada para obtenerlas.

La relevancia práctica del modelo radica en su tamaño contenido (apto para inferencia en CPU o GPU de gama baja) y su pipeline de clasificación estándar de `transformers`, lo que facilita su integración en sistemas de triaje de tickets. No obstante, la model card advierte de una tasa de salidas no seguras de 0.006, superior al umbral interno de 0.005 del programa, y exige una revisión de red team antes de exponerlo a tráfico de producción. Además, uno de los conjuntos de entrenamiento (`synthetic-escalations-v2`) está bajo licencia CC BY-NC 4.0, lo que introduce restricciones relevantes para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3 (transformer encoder), afinado desde `microsoft/deberta-v3-base` |
| Parametros totales | 88 000 000 (según model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors sin cuantizar) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer DeBERTa-v3 afinado para clasificación de secuencias (text-classification). DeBERTa-v3 introduce atención con disentangled attention y un mecanismo de embedding mejorado respecto a DeBERTa-v2; la model card etiqueta el modelo tanto como `deberta-v2` como `deberta-v3`, y el modelo base declarado es `microsoft/deberta-v3-base`. La cabeza de clasificación se entrena sobre las etiquetas de intención del corpus de atención al cliente, aunque la model card no detalla el número de clases ni su nomenclatura.

El entrenamiento se realizó sobre tres conjuntos de datos: `helpdesk-tickets-2025q3` (CC BY 4.0, uso comercial permitido), `synthetic-escalations-v2` (CC BY-NC 4.0, uso comercial restringido) y `product-faq-pairs-v4` (Apache 2.0). No se especifican el número de tokens, la composición exacta del dataset, la proporción de cada fuente ni si se aplicaron técnicas de RLHF, DPO u otras. El checkpoint promocionado es `ckpt-d4` de la versión v2.1.0 del programa Support Intent Resolver.

## Capacidades

- Clasificación de intenciones en mensajes de atención al cliente (pipeline `text-classification`).
- Asignación de una etiqueta de intención por mensaje de entrada, orientada al enrutamiento de tickets.
- Inferencia de baja latencia: P95 de 118 ms y 165 qps según la model card.
- Ejecución en entornos con poca memoria: huella de 900 MB reportada.
- Compatible con `transformers` y con endpoints de Hugging Face (`endpoints_compatible`).
- No soporta generación de texto, tool calling, agentes, visión, audio ni modo de razonamiento; es un clasificador, no un modelo generativo.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Triaje de tickets de soporte: el modelo clasifica cada ticket entrante en una intención y permite enrutarlo automáticamente al equipo o flujo correspondiente, reduciendo el tiempo de primera respuesta.
- Enrutamiento en mesa de ayuda interna: integrado en un sistema de ticketing, asigna cada solicitud a la cola adecuada (facturación, incidencias técnicas, cuentas, etc.) antes de la intervención humana.
- Etiquetado previo de correos y chats: clasifica mensajes de clientes en lote para alimentar paneles de analítica y priorización de colas.
- Filtro de escalado: combinado con reglas de negocio, identifica intenciones que requieren escalado a un agente senior o a un proceso específico.
- Automatización de respuestas guiadas: la etiqueta de intención selecciona la plantilla de FAQ o el flujo de auto-respuesta adecuado, dado que el modelo no genera texto por sí mismo.
- Monitorización de calidad: clasificación retrospectiva de conversaciones para medir la distribución de intenciones y detectar cambios en la demanda de soporte.
- Preprocesado para pipelines RAG: usar la intención como metadato para recuperar la base de conocimiento correcta antes de invocar un modelo generativo.

## Benchmarks y rendimiento

Los únicos datos disponibles son los reportados por el autor en la model card, sin detalle del conjunto de evaluación ni comparación con otros modelos:

| Metrica | Valor |
|---|---|
| Accuracy | 0.906 |
| Macro F1 | 0.932 |
| P95 latency (ms) | 118 |
| Unsafe output rate | 0.006 |
| Throughput (qps) | 165 |
| Memory footprint (MB) | 900 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible.

## Requisitos de hardware

- Huella de memoria reportada: 900 MB, compatible con inferencia en CPU y en GPU de gama baja.
- VRAM estimada: no disponible de forma oficial; con 88 M de parámetros en fp32 los pesos ocupan aproximadamente 350 MB, por lo que cabría en GPUs consumer con 4 GB o menos, aunque esta estimación no está confirmada por el autor.
- GPUs recomendadas: no especificadas; por tamaño, cualquier GPU con al menos 2-4 GB de VRAM sería suficiente (GTX 1650, RTX 3050, T4, etc.), si bien no hay datos oficiales.
- Despliegue: pipeline de `transformers`, compatible con endpoints de Hugging Face; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: P95 de 118 ms y 165 qps según la model card, sin especificar el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Support Intent Resolver v2.1.0 | 88 M | no disponible | Clasificación de intenciones | Apache 2.0 (con dataset NC en entrenamiento) | Hugging Face |
| microsoft/deberta-v3-base | ~86 M | 512 tokens (por defecto en DeBERTa-v3) | Modelo base general | MIT | Hugging Face |
| Modelos de clasificación de intenciones tipo BERT-base | ~110 M | 512 tokens | Clasificación de texto | variable | Hugging Face |

No se dispone de datos de rendimiento comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Tasa de salidas no seguras de 0.006, por encima del umbral interno de 0.005 del programa; la model card exige una revisión de red team antes de producción.
- Solo soporta inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Uno de los conjuntos de entrenamiento (`synthetic-escalations-v2`) está bajo CC BY-NC 4.0 y no puede redistribuirse; el uso comercial del modelo entrenado con ese corpus requiere revisión legal.
- No se especifican el conjunto de evaluación, el número de clases ni la metodología de las métricas reportadas, por lo que las cifras no son verificables de forma independiente.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas en intenciones ambiguas o fuera de distribución.
- Sesgos conocidos: no documentados en la model card.
- Longitud máxima de contexto no especificada; los mensajes largos podrían truncarse.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día (2026-11-11): no hay evidencia de uso en producción ni validación por la comunidad.
- El nombre del repositorio sugiere un artefacto generado automáticamente; conviene auditar los pesos antes de integrarlos.

## Enlaces

- Hugging Face: https://huggingface.co/TUaxhuiax/filesystem_terminal_huggingface_3493-support-intent-resolver-v2-169b2cdc
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
- Paper de DeBERTa-v3: no disponible en la información proporcionada
- Repositorio o demo adicional: no disponible en la información proporcionada
