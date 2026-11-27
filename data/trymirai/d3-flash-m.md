# trymirai/d3-flash-M

## Resumen

d3-flash-M es una versión cuantizada a 4 bits del modelo d3-flash, publicada por Mirai Labs (usuario `trymirai` en Hugging Face). No es un modelo generativo al uso: es un modelo de decisión de texto que, dada una petición estructurada (un `state` y una `question`), devuelve probabilidades sobre un conjunto ordenado de opciones (preguntas de elección, sí/no o puntuación). El modelo base es `vllm-sr/d3-flash` y esta release se distribuye como checkpoint cuantizado sin entrenamiento adicional.

El interés de esta ficha está en que documenta una técnica de cuantización concreta (YAQA, con transformadas de Hadamard aleatorias por bloques) aplicada a un modelo de decisión, con una evaluación held-out sobre 5.500 decisiones de CLINC150+OOS. Según la model card, alcanza un 95,45 % de accuracy, solo 0,38 puntos porcentuales por debajo del modelo profesor sin cuantizar, y reduce la KL media respecto al profesor en un factor de 8,4× frente a una cuantización RTN equivalente.

El checkpoint tiene 4.158.126.080 parámetros y ocupa 17,2 GB en el repositorio. La licencia es Apache 2.0. La información pública disponible es escasa en cuanto a idiomas, datos de entrenamiento del modelo base y benchmarks generales; esta ficha indica explícitamente qué datos no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 8 capas de atención completa (no causal) y 24 capas Gated DeltaNet (causales), según la model card; deriva de la familia Qwen3.5 según las notas de integración |
| Parametros totales | 4.158.126.080 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 asimétrica con grupo de tamaño 64, escalas BF16, puntos cero empaquetados en enteros de 4 bits; capa de salida de decisión en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json` de tipo `DecisionModelConfig` |

## Arquitectura y entrenamiento

El modelo base d3-flash es un transformer híbrido que combina capas de atención completa con capas Gated DeltaNet. La model card de esta release cuantizada especifica que las 8 capas de atención completa son no causales y las 24 capas Gated DeltaNet son causales. El modelo no genera texto libre: incorpora una cabeza de decisión (`decoder.embedding.output_embedding.weights`) de 255 × 4096 en FP32 que produce una distribución softmax sobre hasta 255 códigos de respuesta ordenados, con temperatura 1,0.

Esta release no entrena pesos: aplica cuantización post-entrenamiento con el método YAQA. La calibración usó 3.072 decisiones de texto, equilibradas entre 12 conjuntos públicos del Decision Index (razonamiento, inferencia de lenguaje natural, clasificación de intenciones, recuperación, selección de herramientas y humor). Los objetivos de Fisher se muestrearon del profesor congelado a temperatura 1, con una salida de decisión enmascarada por petición y gradientes a través de todo el contexto de entrada. Se aplicaron transformadas de Hadamard aleatorias por bloques (tamaño 32) para tratar valores atípicos; la matriz de embedding de entrada y la cabeza de decisión usan redondeo al más cercano (RTN). No hubo entrenamiento de pesos ni destilación con conciencia de cuantización.

## Capacidades

- Clasificación zero-shot mediante peticiones estructuradas: tipo `choice` (hasta 255 opciones ordenadas), tipo `noul` (falso/verdadero, con descripciones opcionales) y tipo `score` (entre 2 y 10 niveles ordenados).
- Devolución de probabilidades calibradas por opción, no solo la etiqueta ganadora; permite umbrales y análisis de incertidumbre.
- Acepta `state` en texto plano o JSON, lo que facilita integrarlo en pipelines que ya manejan payloads estructurados.
- Instrucciones opcionales que sustituyen el texto de pregunta por defecto.
- Integración prevista con Uzu y con el ecosistema de Semantic Router (según las notas de la model card).
- No es un modelo generativo: no produce texto libre, código, matemáticas ni razonamiento en cadena visible.
- No se documentan capacidades multimodales, de audio ni de tool calling generativo en esta release.

## Casos de uso

- Enrutado de intenciones en asistentes conversacionales: con la pregunta de tipo `choice` y un conjunto de intenciones como criterios, el modelo devuelve la probabilidad de cada una; es adecuado porque la evaluación held-out sobre CLINC150+OOS mide exactamente esta tarea con un 95,45 % de accuracy.
- Selección de herramientas en agentes: dado el estado de la conversación y una lista de herramientas como opciones, el modelo puntúa cuál invocar; la calibración con datasets de tool selection en el Decision Index respalda este uso.
- Filtrado de seguridad y moderación: con preguntas `noul` se obtiene la probabilidad de "verdadero" para políticas concretas, lo que permite fijar umbrales por política en lugar de depender de una respuesta binaria rígida.
- Puntuación de relevancia en recuperación (reranking): con el tipo `score` de 2 a 10 niveles se puede ordenar pares consulta-documento y usar el nivel esperado como señal continua para reordenar resultados.
- Clasificación de tickets de soporte: el `state` admite JSON, de modo que se pueden pasar campos estructurados del ticket y obtener la categoría más probable entre las definidas como criterios.
- Detección de intención fuera de dominio: al disponer de probabilidades por opción, se puede rechazar una petición cuando la masa de probabilidad se reparte de forma difusa, algo útil en atención al cliente automatizada.
- Despliegue local en Apple Silicon: la propia model card enmarca la cuantización en la línea de trabajo de Mirai sobre eficiencia en silicio de Apple, lo que sugiere su uso en entornos de inferencia local con recursos limitados.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden a la evaluación held-out de la propia model card sobre 5.500 decisiones de CLINC150+OOS, con las mismas peticiones y máscaras de opciones a temperatura 1. CLINC150+OOS quedó completamente fuera de la calibración.

| Checkpoint | Accuracy ↑ | Macro F1 ↑ | KL respecto al profesor ↓ |
|---|---:|---:|---:|
| d3-flash sin cuantizar (profesor) | 95,84 % | 96,43 % | 0,00000 |
| INT4 G64 con RTN | 93,40 % | 93,82 % | 0,07883 |
| d3-flash-M con YAQA | 95,45 % | 96,13 % | 0,00938 |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) para esta release.

## Requisitos de hardware

- El repositorio ocupa 17,2 GB, pero los pesos del backbone están empaquetados en INT4 con grupo 64; la VRAM real de inferencia depende del runtime y de si se materializan pesos en BF16 durante la carga.
- La cabeza de decisión se mantiene en FP32 (255 × 4096), un coste marginal en memoria.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño (≈4,16 mil millones de parámetros), un checkpoint INT4 de este tipo es candidato a caber en GPU de consumo con 8-16 GB de VRAM, pero no hay confirmación del autor.
- La model card menciona explícitamente la línea de trabajo de Mirai sobre eficiencia en Apple Silicon, por lo que el despliegue en Mac con memoria unificada es un escenario previsto.
- Opciones de despliegue: la model card cita la validación con `clean_quant` (`DecisionModel.load`) y la integración con Uzu y Semantic Router. No se documentan vLLM, llama.cpp, Ollama ni TGI para esta release.
- Latencia y throughput: no disponibles. La model card indica que cada pregunta requiere un prefill completo de contexto, lo que condiciona el coste por decisión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy en CLINC150+OOS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-flash-M (esta release) | 4.158.126.080 | no disponible | 95,45 % | Apache 2.0 | Hugging Face |
| d3-flash (profesor, sin cuantizar) | no disponible | no disponible | 95,84 % | Apache 2.0 (según enlace de licencia) | Hugging Face |
| Cuantización INT4 G64 con RTN del mismo modelo | 4.158.126.080 (equivalente) | no disponible | 93,40 % | Apache 2.0 | Referencia interna de la model card |

No se dispone de datos de otros modelos de decisión comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de decisión, no un LLM generativo: no produce texto libre ni código, y no debe evaluarse con benchmarks generativos al uso.
- La evaluación publicada se limita a CLINC150+OOS; no hay evidencia de rendimiento en otros dominios o idiomas.
- Los idiomas soportados no están documentados, lo que impide garantizar cobertura multilingüe en producción.
- La cuantización introduce una pérdida medible: 0,38 puntos de accuracy y una KL de 0,00938 frente al profesor; en dominios alejados de la distribución de calibración la degradación podría ser mayor.
- La calibración usó solo 3.072 decisiones de 12 datasets públicos; dominios muy específicos pueden quedar mal representados.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de calibración deficiente: probabilidades altas en opciones incorrectas cuando la petición se sale del dominio.
- El orden de las opciones es significativo y debe preservarse; alterarlo puede cambiar el resultado.
- Cada pregunta exige un prefill completo de contexto, lo que encarece el uso con estados largos.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar el enlace de licencia del modelo base (`vllm-sr/d3-flash`) por si impone condiciones adicionales.
- La información de la model card está fechada en 2026 y parte de sus referencias (blog, integración Uzu) no son verificables con los datos disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/d3-flash-M
- Modelo base: https://huggingface.co/vllm-sr/d3-flash
- Licencia del modelo base: https://huggingface.co/vllm-sr/d3-flash/blob/13dc1cc8ef23caefa765907e1d764751e5629f7d/LICENSE
- Blog de cuantización de Mirai Labs: https://trymirai.com/blog/quantization
- Sitio de Mirai Labs: https://trymirai.com
