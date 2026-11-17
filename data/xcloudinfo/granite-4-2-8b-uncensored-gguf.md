# xCloudinfo/Granite-4.2-8B-Uncensored-GGUF

## Resumen

Granite-4.2-8B-Uncensored-GGUF es una versión modificada del modelo base ibm-granite/granite-4.2-8b de IBM, publicada por xCloudinfo (云碩科技), una empresa centrada en soluciones de IA privada en local. El objetivo declarado es reducir la tasa de rechazo reflejo (over-refusal) ante preguntas legales pero limítrofes, manteniendo la coherencia y las capacidades del modelo original mediante un procedimiento de abliteración automatizado con la herramienta Heretic. El modelo conserva la licencia Apache 2.0 del original.

Se distribuye exclusivamente en formato GGUF con seis niveles de cuantización (Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS e IQ2_M), lo que lo hace desplegable en llama.cpp y llama-server sin necesidad de GPUs de datacenter. El repositorio ocupa 36,1 GB y acumula 947 descargas desde su publicación en septiembre de 2026.

La relevancia de esta ficha radica en que documenta un caso de modificación de alineamiento sobre un modelo denso de 8.790 millones de parámetros, con cifras de rechazo medidas y publicadas por el propio autor, así como defectos reconocidos explícitamente (errores factuales y mezcla de chino tradicional y simplificado). No se dispone de información sobre la longitud de contexto, los idiomas completos soportados ni los resultados de benchmarks estándar en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Granite 4.2 de IBM); sin detalles adicionales disponibles |
| Parametros totales | 8.791.592.960 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ2_M (GGUF) |
| Idiomas soportados | Chino (zh) e ingles (en) segun la model card; el autor advierte que no se distingue tradicional de simplificado |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (seis ficheros); el autor menciona un modelo fusionado en safetensors usado para las pruebas, no incluido en el repo |

## Arquitectura y entrenamiento

El modelo parte de ibm-granite/granite-4.2-8b, un transformer denso de 8.790 millones de parámetros. La modificación no consiste en un reentrenamiento, sino en una abliteración: se aplica una búsqueda automática de parámetros con Heretic (200 ensayos) que minimiza simultáneamente la tasa de rechazo y la divergencia KL respecto al modelo original, con el fin de preservar las capacidades del base. Según el autor, la tasa de rechazo del base era muy alta (99/100 en la sonda mlabonne/harmful_behaviors) y el proceso convergió en una sola ronda, a diferencia de sus versiones sobre modelos Qwen, que requirieron dos iteraciones.

No se proporcionan datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. Tampoco se detalla si el modelo conserva el modo thinking del Granite original; el ejemplo de uso de llama-server pasa `enable_thinking: false` en el chat template, lo que sugiere que el base expone un modo de razonamiento controlable por plantilla. La model card no documenta innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Reducción de rechazos ante preguntas limítrofes pero legales: 0/10 rechazos en safetensors con decodificación greedy y 1/10 en GGUF Q4_K_M con muestreo por defecto, medido por el autor sobre un conjunto held-out de 10 preguntas de daño severo.
- Soporte de chino e inglés, con la advertencia de mezcla ocasional de caracteres tradicionales y simplificados.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) y con el servidor llama-server mediante plantilla Jinja.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni otras capacidades especiales en la información disponible.

## Casos de uso

- Despliegue en local para asistentes conversacionales: al distribuirse en GGUF con seis niveles de cuantización, puede ejecutarse con llama.cpp o llama-server en estaciones de trabajo sin GPU de datacenter, manteniendo los datos en la infraestructura propia.
- Investigación sobre alineamiento y abliteración: sirve como caso de estudio reproducible de cómo una búsqueda automática de 200 ensayos con Heretic reduce la tasa de rechazo de 99/100 a 0/10 en greedy, con la divergencia KL como métrica de control de degradación.
- Evaluación de robustez de salvaguardas: útil para equipos de seguridad que quieran medir la resistencia de un modelo de 8B a la eliminación de rechazos y calibrar filtros externos.
- Procesamiento de texto en chino e inglés: adecuado para tareas de generación y resumen bilingües, con la salvedad de que conviene añadir postprocesado si se exige chino tradicional estricto.
- Prototipado rápido en hardware de consumo: las variantes IQ4_XS e IQ2_M permiten probar el modelo en equipos con VRAM limitada antes de decidir una cuantización mayor.
- Generación de contenido conversacional en entornos controlados donde el rechazo reflejo ante temas sensibles legales (por ejemplo, ficción, educación o divulgación) resulta contraproducente, asumiendo la responsabilidad legal del uso por parte del operador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas propias de rechazo y coherencia:

| Metrica | Condicion | Resultado |
|---|---|---|
| Tasa de rechazo (held-out de 10 preguntas de daño severo) | Safetensors fusionado, greedy | 0/10 |
| Tasa de rechazo (held-out de 10 preguntas de daño severo) | GGUF Q4_K_M, llama-server, muestreo por defecto | 1/10 |
| Tasa de rechazo del modelo base | Sonda mlabonne/harmful_behaviors | 99/100 |
| Coherencia en preguntas inofensivas | Safetensors fusionado | Aproximadamente normal, sin cifras |

No hay datos de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5 GB para Q4_K_M, unos 9,5 GB para Q8_0 y en torno a 3 GB para IQ2_M (estimaciones a partir del tamaño de los ficheros GGUF; el repo completo ocupa 36,1 GB).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más de VRAM para Q4_K_M (RTX 3060 Ti, RTX 4060, RTX 4070); 12-16 GB para Q6_K y Q8_0 (RTX 4070 Ti, RTX 4080, RTX 4090); A100 o H100 no son necesarias para un modelo denso de 8B.
- Cabe en GPU consumer: sí, en todas las cuantizaciones desde IQ2_M hasta Q8_0 con hardware adecuado; IQ2_M e IQ4_XS están pensadas para equipos con poca VRAM.
- Opciones de despliegue: llama.cpp y llama-server (documentado por el autor con `--jinja` y `--chat-template-kwargs '{"enable_thinking":false}'`); Ollama y otros runners compatibles con GGUF son viables, aunque no se mencionan explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Granite-4.2-8B-Uncensored (este) | 8,79 B | No disponible | Apache 2.0 | GGUF (6 cuantizaciones) | Abliterado con Heretic; 1/10 rechazos en Q4_K_M |
| ibm-granite/granite-4.2-8b | 8,79 B | No disponible | Apache 2.0 | Safetensors (base) | Modelo original; 99/100 rechazos en la sonda del autor |
| Qwen3.5-9B-Uncensored (xCloudinfo) | 9 B (aproximado, según nombre) | No disponible | No disponible | GGUF | Misma metodología; requirió dos rondas de iteración |
| Qwen3.8-27B-Uncensored (xCloudinfo) | 27 B (aproximado, según nombre) | No disponible | No disponible | GGUF | Misma metodología; mayor tamaño, más requisitos de VRAM |

Los datos de los modelos Qwen de xCloudinfo proceden únicamente de las referencias incluidas en la model card; no se dispone de sus especificaciones completas.

## Limitaciones y advertencias

- Riesgo de alucinación confirmado: el autor documenta un error factual en las pruebas (etiquetó heroína como LSD), atribuido al modelo base y no al proceso de abliteración.
- Mezcla de chino tradicional y simplificado en las respuestas; requiere postprocesado si la aplicación exige una variante estricta.
- La eliminación de rechazos no implica corrección factual ni ausencia de contenido dañino; el operador asume la responsabilidad legal del uso.
- Las métricas de rechazo se basan en conjuntos muy pequeños (10 preguntas held-out y 100 de sonda), por lo que su valor estadístico es limitado.
- No hay datos publicados sobre sesgos, rendimiento en benchmarks estándar, longitud de contexto ni comportamiento en tool calling.
- Licencia Apache 2.0 heredada del base: permite uso comercial, pero conviene verificar los términos del modelo original de IBM y las obligaciones de atribución.
- El repositorio no incluye los pesos en safetensors, solo GGUF; para fine-tuning adicional habría que partir del modelo base o convertir los GGUF.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xCloudinfo/Granite-4.2-8B-Uncensored-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Perfil del autor: https://hf.co/xCloudinfo
- Modelo relacionado: https://huggingface.co/xCloudinfo/Qwen3.8-27B-Uncensored-GGUF
- Modelo relacionado: https://huggingface.co/xCloudinfo/Qwen3.5-9B-Uncensored-GGUF
