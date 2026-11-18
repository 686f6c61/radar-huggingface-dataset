# ya9919/YN-421m-compat

## Resumen

YN-421m-compat es un modelo de decisión financiera de aproximadamente 421 millones de parámetros, publicado por el usuario ya9919 en Hugging Face. Se trata de un fine-tuning del encoder Laya de Convai Innovations (basado en ModernBERT-large) al que se le añade una cabeza de puntuación de opciones (option-scoring head), orientada a resolver preguntas de elección múltiple sobre el estado financiero de un hogar. El modelo no es un generador de texto conversacional: recibe un estado de hogar y una pregunta con un menú de alternativas, y puntúa cada opción para seleccionar la respuesta más probable.

El modelo forma parte del proyecto S²-MAS (society-scale multi-agent simulation), un marco de simulación multiagente a escala poblacional que estudia cómo las decisiones heterogéneas de los hogares se agregan en resultados poblacionales. FinL, la política de decisión que implementa este checkpoint, actúa como componente reutilizable dentro de ese marco: el mismo interfaz de puntuación sirve para distintas tareas de decisión. El manuscrito asociado evalúa 12 millones de agentes sintéticos y 24 millones de elecciones en una aplicación de condiciones emparejadas.

Este repositorio concreto es una entrada de compatibilidad del checkpoint FinL de seis rondas con base inglesa, en formato nativo Laya/PyTorch. No añade una variante de entrenamiento nueva: apunta al mismo checkpoint que las versiones nativa (YN-421m) y MLX (YN-421m-mlx). Su relevancia radica en que documenta un caso de post-entrenamiento de dominio financiero a escala relativamente pequeña (421M) con un conjunto de datos declarado de 2,9 millones de ejemplos por idioma, y en que expone resultados de evaluación sobre cientos de miles de registros de encuesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Laya (ModernBERT-large) con cabeza de puntuación de opciones |
| Parametros totales | 421.293.830 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en inferencia nativa PyTorch; FP16 en la variante MLX; no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | s2-mas-controlled-research-v1.2 (Controlled Model Research License v1.2; incluye derechos upstream Apache-2.0) |
| Formato de pesos | safetensors (formato nativo Laya/PyTorch) |

## Arquitectura y entrenamiento

El modelo parte de Laya, un encoder de la familia ModernBERT-large desarrollado por Convai Innovations, y le añade una cabeza de puntuación de opciones que asigna una puntuación a cada alternativa de un menú dado un estado de hogar y una pregunta. La tarea es, por tanto, de clasificación/ranking sobre un conjunto cerrado de opciones, no de generación libre. El checkpoint es un fine-tuning sobre datos reales de encuesta, seguido de una continuación de seis rondas que incorpora SFT y RLCD (reinforcement learning from contrastive data, según la nomenclatura del autor) sobre 2.925.263 ejemplos de entrenamiento por idioma. El autor lo describe como el mayor conjunto de post-entrenamiento de dominio divulgado entre los modelos de decisión financiera comparados en el manuscrito.

El repositorio es una entrada de compatibilidad: los pesos corresponden al mismo checkpoint entrenado que las versiones nativa y MLX, y no introduce una variante de entrenamiento adicional. La inferencia nativa se realiza en BF16 con la librería `laya`. El modelo incluye tokenizer, configuración de inferencia y un script `predict_example.py` con un ejemplo sintético generado de forma independiente. No se documentan innovaciones de decodificación especulativa, atención lineal ni mecanismos híbridos más allá de lo que aporta la arquitectura ModernBERT subyacente.

## Capacidades

- Puntuación de alternativas en preguntas de elección múltiple sobre estado financiero de hogares (por ejemplo, uso de tarjetas de crédito, cuentas de depósito a la vista, cuentas de valores, depósitos a plazo no vencidos).
- Clasificación/ranking sobre menús de opciones cerrados, con salida de puntuación por alternativa.
- Procesamiento de estados de hogar y preguntas en inglés.
- Integración como política de decisión reutilizable dentro del marco de simulación S²-MAS.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al inglés en este checkpoint (existe una variante bilingüe separada, YN-322m-mlx, según la model card).

## Casos de uso

- Simulación multiagente a escala poblacional: el modelo actúa como política de decisión para cada hogar sintético dentro de S²-MAS, puntuando alternativas financieras y permitiendo agregar millones de decisiones individuales en resultados poblacionales. Es adecuado por su interfaz de puntuación uniforme y su coste computacional contenido (421M parámetros).
- Modelado de decisiones de consumo y pago: dado un estado de hogar, el modelo estima la probabilidad relativa de cada opción (por ejemplo, tener o no una cuenta de valores), lo que permite construir trayectorias de consumo, efectivo y pagos a lo largo del tiempo.
- Investigación académica en economía y finanzas del hogar: sirve para replicar o extender análisis de encuestas financieras con grandes volúmenes de registros, ya que el manuscrito reporta evaluación sobre 240.458 y 418.597 registros de QA.
- Generación de datos sintéticos condicionados: al integrarse en el marco S²-MAS, puede emplearse para generar respuestas sintéticas consistentes con estados de hogar, útiles para aumentar datasets de encuesta o para estudios de sensibilidad.
- Evaluación de políticas y escenarios contrafactuales: permite simular cómo cambian las decisiones de los hogares bajo condiciones modificadas (por ejemplo, variaciones en acceso a crédito o productos de depósito), siempre dentro del marco del proyecto.
- Prototipado de modelos de decisión de dominio financiero: como checkpoint de 421M en BF16, es viable para experimentación en una sola GPU y sirve de base para comparaciones con otros modelos de decisión financiera del manuscrito.

## Benchmarks y rendimiento

| Test | Idioma de entrada | Backend / precision | QA (denominador) | Versiones de pregunta | Accuracy | Question-macro F1 |
|---|---|---|---:|---:|---:|---:|
| Preguntas financieras compartidas | Inglés | PyTorch BF16 | 240.458 | 119 | 74,5586% | 38,40% |
| Test ampliado | Inglés | PyTorch BF16 | 418.597 | 862 | 67,2728% | 27,8355% |

La accuracy pondera por igual cada registro de QA. El question-macro F1 promedia el F1 sobre todas las clases candidatas dentro de cada versión de pregunta y luego pondera por igual cada versión. La misma familia de checkpoint en MLX FP16 obtiene 74,5544% de accuracy y 38,3746% de F1 en el test compartido. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general, lo cual es coherente con la naturaleza del modelo (clasificación de opciones, no generación).

## Requisitos de hardware

- VRAM estimada para inferencia: con 421M parámetros, en BF16 los pesos ocupan aproximadamente 0,85 GB; en FP16, un valor similar. El repo completo ocupa 0,8 GB.
- GPU recomendadas: el manuscrito reporta tiempos de petición única con el checkpoint bilingüe FinL (YN-322m-mlx) en una NVIDIA A100 PCIe de 40 GB en FP16, con batch y concurrencia uno. Para este checkpoint de 421M, cualquier GPU con al menos 2-4 GB de VRAM libre debería ser suficiente en BF16/FP16, aunque no se documentan cifras específicas.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, dado el reducido tamaño de pesos; no se aportan mediciones concretas.
- Opciones de despliegue: inferencia nativa Laya/PyTorch en BF16; variante MLX para Apple Silicon (YN-421m-mlx). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles para este checkpoint concreto; la model card remite a las métricas del checkpoint bilingüe en A100 (Methods M9) sin reproducirlas aquí.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YN-421m-compat (este) | 421M | no disponible | 74,5586% accuracy / 38,40% F1 (test compartido, EN, BF16) | s2-mas-controlled-research-v1.2 | Hugging Face, formato nativo Laya/PyTorch |
| YN-421m (nativo) | 421M | no disponible | Mismo checkpoint (seis rondas, nativo) | s2-mas-controlled-research-v1.2 | Hugging Face |
| YN-421m-mlx | 421M | no disponible | 74,5544% accuracy / 38,3746% F1 (test compartido, MLX FP16) | s2-mas-controlled-research-v1.2 | Hugging Face |
| YN-322m-mlx (FinL bilingüe) | 322M | no disponible | No disponible en la información proporcionada | s2-mas-controlled-research-v1.2 | Hugging Face |
| YN-4b (FinQ, Qwen3.5-4B-Base + LoRA + cabeza) | 4B (base) | no disponible | No disponible en la información proporcionada | s2-mas-controlled-research-v1.2 | Hugging Face |

Las alternativas comparables pertenecen a la misma familia del proyecto; no se dispone de datos de modelos externos de la misma categoría (decisión financiera con puntuación de opciones) en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado únicamente en inglés; no se documenta soporte de otros idiomas en este checkpoint.
- Es un modelo de clasificación/puntuación de opciones, no un generador de texto: no debe esperarse diálogo libre, razonamiento explícito ni respuestas abiertas.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de puntuaciones incorrectas o mal calibradas fuera de la distribución de los datos de encuesta; el F1 macro en el test ampliado (27,84%) es notablemente bajo, lo que sugiere dificultad en preguntas con muchas clases o versiones.
- El modelo aprende de datos de encuesta reales, por lo que puede heredar sesgos demográficos, geográficos o socioeconómicos presentes en esos datos; no se documenta un análisis de sesgos.
- La licencia es una licencia de investigación controlada (s2-mas-controlled-research-v1.2), no una licencia de código abierto permisiva: es imprescindible revisar los términos antes de cualquier uso comercial o de redistribución.
- Los registros de entrenamiento y evaluación no se distribuyen con el modelo, lo que limita la auditoría y la reproducibilidad.
- La implementación del motor GENESE/MAS permanece privada; solo se publican scripts de visualización científica, entrenamiento/evaluación del modelo de decisión y generación de datos sintéticos.
- No se documentan la longitud de contexto ni los requisitos exactos de memoria, lo que complica el dimensionamiento preciso en producción.
- El repositorio tiene un volumen de descargas muy bajo (28) y un solo "like", por lo que la validación comunitaria es escasa.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/ya9919/YN-421m-compat
- Checkpoint nativo seis rondas: https://huggingface.co/ya9919/YN-421m
- Runtime MLX: https://huggingface.co/ya9919/YN-421m-mlx
- Checkpoint bilingüe FinL: https://huggingface.co/ya9919/YN-322m-mlx
- Ruta FinQ (Qwen3.5-4B-Base): https://huggingface.co/ya9919/YN-4b
- Licencia: https://huggingface.co/ya9919/YN-421m-compat/blob/main/LICENSE
- Ejemplos QA (JSON): https://huggingface.co/ya9919/YN-421m-compat/blob/main/qa_examples.json
- Repositorio del proyecto S²-MAS: https://github.com/KataDavidXD/s2-mas
- Manuscrito S²-MAS: https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
