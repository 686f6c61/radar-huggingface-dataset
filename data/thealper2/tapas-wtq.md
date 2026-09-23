# thealper2/tapas-wtq

## Resumen

tapas-wtq es un ajuste fino de google/tapas-base, un modelo tipo BERT adaptado a la comprensión de tablas, publicado por el usuario thealper2 en HuggingFace. El modelo resuelve la tarea de respuesta a preguntas sobre tablas (table question answering, TableQA): recibe una tabla estructurada en formato tabular y una pregunta en lenguaje natural, y devuelve la respuesta seleccionando celdas concretas y, cuando procede, aplicando una operación de agregación (NONE, SUM, AVERAGE o COUNT). Está entrenado específicamente sobre el conjunto WikiTableQuestions (WTQ), un corpus de preguntas formuladas sobre tablas de Wikipedia.

El modelo cuenta con 110.676.484 parámetros (aproximadamente 110 millones), lo que lo sitúa en la gama "base" de TAPAS, con un coste de inferencia muy bajo y posibilidad de ejecutarse incluso en CPU. La ventana de contexto máxima utilizada en entrenamiento es de 512 tokens, que deben repartirse entre la serialización de la tabla y la pregunta. La licencia es Apache 2.0 y el modelo solo está entrenado para inglés.

Es relevante como referencia de bajo coste para pipelines de análisis de datos tabulares donde se quiera responder preguntas sobre hojas de cálculo, CSV o tablas HTML sin recurrir a modelos generativos grandes. No obstante, conviene señalar que la precisión de denotación declarada por el autor en validación de WTQ es de 0,3178, un valor modesto que debe tenerse en cuenta antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TAPAS (transformer tipo BERT con embeddings posicionales de fila/columna y cabezales de selección de celdas y agregación) |
| Parametros totales | 110.676.484 (~110 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max_seq_length de entrenamiento) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones oficiales) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de google/tapas-base, una arquitectura basada en BERT que incorpora embeddings posicionales relativos para identificar la estructura de la tabla (posición de fila, posición de columna y rango de la celda), además de dos cabezales específicos: uno de selección de celdas que produce una probabilidad por celda y otro de agregación que clasifica la operación a aplicar sobre las celdas seleccionadas (NONE, SUM, AVERAGE, COUNT). El ajuste fino se realiza sobre WikiTableQuestions, con una serialización de la tabla y la pregunta como entrada.

Los hiperparámetros documentados en la model card son: learning rate de 5e-05, 4,0 épocas, batch size por dispositivo de 16, gradient accumulation steps de 2, weight decay de 0,01, warmup ratio de 0,1, scheduler lineal, max_seq_length de 512 y semilla 42. El tiempo de entrenamiento reportado es de 19,8 minutos. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa; tampoco se detalla la composición exacta del dataset más allá de WikiTableQuestions. El repositorio incluye `training_config.json` con la configuración completa y `history.json` con el histórico de entrenamiento por paso.

## Capacidades

- Respuesta a preguntas sobre tablas: devuelve la respuesta como selección de una o varias celdas de la tabla de entrada.
- Agregación numérica básica: aplica operaciones NONE, SUM, AVERAGE y COUNT sobre las celdas seleccionadas.
- Comprensión de tablas en inglés con estructura de filas y columnas, incluyendo celdas vacías y encabezados.
- Integración nativa con la librería transformers mediante `TapasForQuestionAnswering` y `TapasTokenizer`, con entrada directa desde `pandas.DataFrame`.
- No soporta tool calling ni function calling.
- No soporta comportamiento de agente ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni generación de texto libre.
- Capacidad multilingüe limitada al inglés; no hay soporte declarado para otros idiomas.
- Salida acotada al vocabulario de celdas de la tabla (no genera texto nuevo), lo que reduce el riesgo de alucinación de contenido externo.

## Casos de uso

- Consulta de hojas de cálculo internas: un empleado puede preguntar en lenguaje natural "¿cuál es la ciudad con mayor población?" sobre un DataFrame cargado en memoria y obtener la celda exacta, gracias a la API que acepta tablas de pandas directamente.
- Extracción de datos de tablas HTML o CSV en pipelines de scraping: el modelo selecciona la celda correcta ante preguntas sobre la tabla extraída, sin necesidad de un modelo generativo grande.
- Automatización de informes financieros simples: sobre tablas de resultados con columnas de años y filas de partidas, permite obtener el valor de una partida concreta o el total agregado, aprovechando la cabeza de agregación.
- Indexación semántica sobre catálogos tabulares: en un buscador interno de productos o inventario, el modelo puede responder preguntas factuales que se resuelven como lookup de celda, evitando respuestas inventadas.
- Preprocesado de datos para analistas: dado un conjunto de tablas heterogéneas, generar respuestas normalizadas a preguntas frecuentes para validar la calidad del dato tabular.
- Prototipado académico y docencia: por su tamaño de 110 M de parámetros y su licencia Apache 2.0, es adecuado para experimentos de TableQA en portátiles o entornos sin GPU, replicando el flujo de la model card.
- Verificación de respuestas sobre tablas estáticas en asistentes de documentación, donde la respuesta siempre debe provenir de una celda existente y no de texto generado.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados, `verified: false`) sobre el split de validación de WikiTableQuestions (2.483 ejemplos):

| Metrica | Valor |
|---|---|
| Denotation accuracy | 0,3178 |
| Exact match | 0,3178 |
| Cell selection accuracy | 0,2715 |
| Aggregation accuracy | 0,7412 |

La exactitud de agregación (0,7412) es muy superior a la de selección de celdas (0,2715), lo que sugiere que el modelo identifica razonablemente bien la operación a aplicar pero falla con frecuencia al localizar las celdas correctas. No se han publicado en la información disponible resultados comparativos adicionales ni sobre otros conjuntos como SQA, TabFact o WTQ test.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 y 0,25 GB en fp16 para los 110 M de parámetros, más el overhead de activaciones y del tokenizador, lo que en la práctica supone menos de 1 GB.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM; no requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (GTX 1050 Ti en adelante, RTX 2060, RTX 3060, RTX 4090) e incluso en iGPU con suficiente memoria compartida.
- Cabe en CPU: sí, con latencias del orden de decenas a cientos de milisegundos por consulta según el número de celdas de la tabla.
- Opciones de despliegue: transformers (PyTorch) de forma nativa; también es viable exportar a ONNX Runtime o servirlo con TorchServe. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que estos motores están orientados a modelos generativos y no a cabezales de clasificación tabular.
- Latencia y throughput: no disponibles. El entrenamiento declarado de 19,8 minutos en 4 épocas da una idea de la baja carga computacional del ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thealper2/tapas-wtq | ~110 M | 512 tokens | TableQA (selección + agregación) | Apache 2.0 | HuggingFace |
| google/tapas-base | ~110 M | 512 tokens | TableQA (preentrenado, sin ajuste a WTQ) | Apache 2.0 | HuggingFace |
| google/tapas-base-finetuned-wtq | ~110 M | 512 tokens | TableQA ajustado a WTQ | Apache 2.0 | HuggingFace |
| Modelos generativos tipo LLM | desde miles de millones | mucho mayor | QA general y TableQA vía prompting | variable | variable |

Comparado con google/tapas-base-finetuned-wtq, este modelo comparte arquitectura, tamaño y licencia, pero la precisión de denotación declarada (0,3178) es notablemente inferior a la que suele reportarse para el ajuste de referencia de Google; no se dispone del dato exacto del modelo de referencia en la información proporcionada, por lo que no se incluye una cifra comparativa. Frente a LLMs generativos, tapas-wtq ofrece un coste de inferencia mucho menor y respuestas ancladas a celdas reales, a cambio de una precisión limitada y de no poder generar razonamiento en lenguaje natural.

## Limitaciones y advertencias

- Precisión baja: la denotation accuracy declarada es de 0,3178 y la exactitud de selección de celdas de 0,2715, valores modestos que limitan su uso directo en producción sin validación adicional.
- Sesgos: al entrenarse sobre WikiTableQuestions, hereda los sesgos de las tablas y preguntas de Wikipedia (temáticas, geográficas y de estilo de anotación), sin que se documente ningún análisis de sesgo.
- Riesgo de alucinación: bajo en contenido externo, porque la respuesta se restringe a celdas de la tabla, pero alto en el sentido de seleccionar la celda equivocada y devolver un valor que existe pero no responde a la pregunta.
- Limitaciones de contexto: 512 tokens compartidos entre tabla y pregunta, lo que hace inviable manejar tablas grandes o de muchas columnas sin truncado y pérdida de información.
- Limitaciones de idioma: solo inglés; cualquier pregunta o cabecera en otro idioma degradará el rendimiento.
- Licencia: Apache 2.0, permite uso comercial y modificación, pero conviene conservar los avisos de licencia y de la model card original de google/tapas-base.
- Advertencias de producción: la única métrica disponible está declarada por el autor y marcada como no verificada; se recomienda evaluarla en un conjunto propio antes de desplegarla.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación por terceros.
- No se documentan cuantizaciones oficiales ni artefactos GGUF/ONNX, lo que obliga a realizar la conversión manualmente si se necesita optimizar el despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thealper2/tapas-wtq
- Modelo base: https://huggingface.co/google/tapas-base
- Dataset WikiTableQuestions (repositorio): https://github.com/ppasupat/WikiTableQuestions

Nota: la búsqueda web no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a foros sin relación con el contenido.
