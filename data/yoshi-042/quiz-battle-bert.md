# yoshi-042/quiz-battle-bert

## Resumen

quiz-battle-bert es un modelo de clasificación para preguntas de opción múltiple (cuatro opciones) orientado a un juego de preguntas y respuestas con pulsación rápida. Lo desarrolla el usuario yoshi-042 y parte de `tohoku-nlp/bert-base-japanese-v3`, afinado con la cabeza `BertForMultipleChoice`. El modelo se distribuye ya convertido a ONNX y cuantizado a int8, de modo que el artefacto del repositorio ocupa aproximadamente 0,1 GB y está pensado para inferencia ligera con `onnxruntime`.

El problema que resuelve es concreto: seleccionar la respuesta correcta entre cuatro alternativas en japonés, con el objetivo de servir como oponente automático en un juego de quiz. El entrenamiento combina JCommonsenseQA (CC BY-SA 4.0), problemas propios, problemas por dominio y JAQKET, con un total de 15.466 preguntas. La relevancia actual es limitada fuera de ese nicho: no es un modelo generativo ni un asistente conversacional, sino un clasificador de opción múltiple de tamaño BERT-base con licencia MIT.

Al estar basado en BERT-base japonés, la arquitectura es un transformer encoder de 12 capas y unos 110 millones de parámetros, con contexto de 512 tokens (límite estándar de la familia BERT). No hay información publicada sobre el proceso de preentrenamiento más allá de la referencia al modelo base de Tohoku NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), cabeza `BertForMultipleChoice` |
| Parametros totales | no disponible (modelo base BERT-base japonés, del orden de 110 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (límite típico de BERT: 512 tokens) |
| Tipos de cuantizacion | int8 (versión ONNX cuantizada incluida en el repo) |
| Idiomas soportados | japonés (`ja`) |
| Licencia | MIT |
| Formato de pesos | ONNX (`onnxruntime`) |

## Arquitectura y entrenamiento

El modelo es un BERT-base japonés (`tohoku-nlp/bert-base-japanese-v3`) con una cabeza de clasificación de opción múltiple: recibe la pregunta y cada una de las cuatro opciones y produce una puntuación por opción, seleccionando la de mayor probabilidad. No es un modelo generativo ni un modelo de razonamiento multi-paso; su salida es una elección entre alternativas predefinidas.

El ajuste fino se realizó sobre 15.466 preguntas compuestas por JCommonsenseQA (CC BY-SA 4.0), problemas de elaboración propia, problemas por dominio y JAQKET. Tras el entrenamiento, el modelo se exportó a ONNX y se cuantizó a int8. No se especifican en la información disponible el número de épocas, la tasa de aprendizaje, el esquema de validación ni si hubo técnicas adicionales como destilación o aumento de datos.

## Capacidades

- Clasificación de preguntas de opción múltiple con cuatro alternativas en japonés.
- Selección de respuesta basada en conocimiento commonsense y preguntas de dominio, gracias a la mezcla de JCommonsenseQA, JAQKET y problemas propios.
- Inferencia ligera mediante `onnxruntime` con pesos int8.
- No soporta generación de texto libre, tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio) ni de modo "thinking".
- Capacidad multilingüe limitada al japonés; no se documenta soporte para otros idiomas.

## Casos de uso

- Oponente automático en un juego de quiz de cuatro opciones: el modelo recibe la pregunta y las cuatro respuestas y devuelve la opción elegida, con latencia baja al ejecutarse en ONNX int8.
- Evaluación de bancos de preguntas en japonés: puede usarse como línea base para medir la dificultad de preguntas nuevas comparando su acierto con el de humanos.
- Filtrado de preguntas de baja calidad en un dataset: preguntas en las que el modelo acierta con alta confianza pero cuya respuesta etiquetada difiere pueden señalar errores de anotación.
- Componente de un sistema de práctica de trivia para usuarios japoneses: al ser un clasificador pequeño, puede desplegarse en el navegador o en un servidor modesto.
- Pruebas de robustez de modelos de opción múltiple: sirve como referencia BERT-base para comparar con modelos más grandes en tareas de commonsense en japonés.
- Prototipado rápido de clasificadores de opción múltiple: el pipeline ONNX int8 permite integrar el modelo en aplicaciones existentes sin infraestructura de GPU.

## Benchmarks y rendimiento

Datos publicados en la model card del autor:

| Conjunto de evaluacion | Precision (modelo original) | Precision (int8) |
|---|---|---|
| JCommonsenseQA (evaluación) | 86,3 % | no disponible |
| Conjunto curado de 60 preguntas | 51,7 % | 43,3 % |
| Conjunto de evaluación de 240 preguntas | 41,7 % | 45,8 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un BERT-base cuantizado a int8 con un artefacto de 0,1 GB, la inferencia cabe en CPU y en GPUs de gama baja; no se dispone de cifras exactas de VRAM.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime es suficiente, y en la práctica la CPU es viable.
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño reducido del modelo.
- Opciones de despliegue: `onnxruntime` (formato nativo del repo); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| quiz-battle-bert | ~110 M (BERT-base) | no disponible (típico 512) | Opción múltiple en japonés | MIT | Hugging Face, ONNX int8 |
| tohoku-nlp/bert-base-japanese-v3 | ~110 M | 512 | Modelo base japonés (MLM) | no disponible en esta ficha | Hugging Face |
| Otros clasificadores de opción múltiple en japonés | no disponible | no disponible | Opción múltiple | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo elige entre cuatro opciones; no genera respuestas ni explica su razonamiento.
- La precisión cae de forma notable fuera de JCommonsenseQA: 51,7 % en el conjunto curado de 60 preguntas y 41,7 % en el de 240, lo que indica poca generalización a preguntas ajenas a la distribución de entrenamiento.
- La cuantización int8 altera el rendimiento: mejora en el conjunto de 240 preguntas (45,8 % frente a 41,7 %) pero empeora en el conjunto curado (43,3 % frente a 51,7 %), por lo que conviene validar en el dominio objetivo.
- Riesgo de sesgos y alucinación: al ser un clasificador, no "alucina" texto, pero puede seleccionar opciones incorrectas con alta confianza; no se documentan análisis de sesgo.
- Limitación idiomática: solo japonés; no se garantiza comportamiento en otros idiomas.
- Licencia MIT: permite uso comercial, pero el dataset JCommonsenseQA está bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribución o compartición derivada sobre el modelo entrenado con él; conviene revisarlo antes de un uso comercial.
- No hay información sobre el pipeline de la librería ni sobre métricas de latencia, lo que dificulta planificar producción sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yoshi-042/quiz-battle-bert
- Modelo base: https://huggingface.co/tohoku-nlp/bert-base-japanese-v3
- Dataset JCommonsenseQA (referenciado en la model card): no disponible enlace directo en la información proporcionada
- Dataset JAQKET (referenciado en la model card): no disponible enlace directo en la información proporcionada
