# yoavipo/nativ-he-decision

## Resumen

Nativ (נתיב, "camino" en hebreo) es un modelo de decisión en hebreo desarrollado por el usuario yoavipo. Se trata de un encoder de 363.770.113 parámetros (aproximadamente 364M) construido sobre `dicta-il/neodictabert` y aumentado con un pequeño scorer de opciones. Su función no es generar texto libre, sino recibir un estado (cualquier texto en hebreo), una pregunta y una lista de entre 2 y 6 opciones, y devolver en un único forward pass una probabilidad calibrada para cada opción.

El modelo resuelve tareas de enrutado de intenciones, clasificación de sentimiento, detección de información personal, verificación de políticas y comprobación de si un párrafo responde a una pregunta. Es relevante porque ofrece un componente de decisión pequeño, rápido y calibrado (se reporta el error de calibración ECE en cada tarea) que puede ejecutarse en CPU de portátil, con latencias de unos 70 ms por decisión corta y 130 ms por párrafo en un Apple M2 Pro.

Se ha entrenado mediante destilación desde `DictaLM-3.0-1.7B-Instruct` con un adaptador LoRA, y parte de los datos fueron generados por `DictaLM-3.0-24B-Thinking`. La licencia es CC BY 4.0 con uso comercial permitido, y se distribuye en formato safetensors con la librería PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (NeoDictaBERT) con scorer MLP sobre el vector [CLS] y la media de los tokens de cada opcion |
| Parametros totales | 363.770.113 (aproximadamente 364M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens (los estados largos se truncan; la pregunta y las opciones se conservan) |
| Tipos de cuantizacion | no disponible en la model card (ejecucion por defecto en fp32) |
| Idiomas soportados | hebreo (he) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El encoder procesa la secuencia `[CLS] state [SEP] question [SEP] option1 [SEP] option2 [SEP] ...` en una sola pasada. Cada opción recibe una puntuación calculada por un MLP pequeño que combina el vector `[CLS]` con la media de los tokens de esa opción. Una softmax sobre las puntuaciones produce la distribución de probabilidad entre las opciones. El modelo no genera tokens: su salida es directamente la probabilidad de cada alternativa.

El entrenamiento se basa en destilación desde un profesor: `DictaLM-3.0-1.7B-Instruct` (Apache-2.0) con un adaptador LoRA de rango 16, entrenado para responder con la letra de la opción correcta. La función de pérdida combina 0,7 × entropía cruzada con las probabilidades del profesor más 0,3 × entropía cruzada con la respuesta dorada (Hinton et al., 2015); en la tarea de política solo se usan las etiquetas doradas, ya que se calculan de forma exacta. Se entrenó durante 4 épocas con AdamW, learning rate 5e-5 y schedule coseno, barajando las opciones en cada época. `DictaLM-3.0-24B-Thinking` (Apache-2.0) generó parte de los datos: mensajes de información personal, la traducción de CosmosQA, preguntas de lectura sobre párrafos de HeQ y reescrituras de las frases plantilla. Los datos generados se filtraron para evitar atajos de respuesta y las reescrituras se comprobaron para preservar los hechos originales. Belebele no se utilizó para entrenamiento.

## Capacidades

- Enrutado de intenciones: asigna una petición a una de hasta 4 descripciones de intención con una precisión de 0,969 en MASSIVE he-IL.
- Clasificación de sentimiento en hebreo (positivo / negativo / fuera de tema).
- Detección de información personal en mensajes naturales y en plantillas.
- Verificación de políticas: comprueba si una solicitud cumple una regla descrita en lenguaje natural.
- Comprobación de fundamentación (grounded): determina si un párrafo responde a una pregunta.
- Comprensión lectora con opción múltiple (4 opciones), aunque es su tarea más débil.
- Salida calibrada: devuelve probabilidad por opción con error de calibración (ECE) reportado por tarea.
- Procesamiento por lotes mediante `decide_many`, que acepta una lista de diccionarios con `state`, `question` y `options`.
- No dispone de tool calling, function calling, capacidades de agente, visión ni audio: es un clasificador de decisión, no un modelo generativo.

## Casos de uso

- Enrutado de peticiones en atención al cliente: el modelo recibe el mensaje del usuario y una lista de descripciones de intenciones (por ejemplo, devoluciones, facturación, soporte técnico) y devuelve la probabilidad de cada una para dirigir el ticket al departamento correcto, con 0,969 de precisión en MASSIVE he-IL.
- Moderación de contenido y detección de datos personales: permite comprobar si un mensaje contiene información personal antes de almacenarlo o enviarlo, con 0,957 de precisión en mensajes naturales y ECE de 0,078.
- Cumplimiento de políticas: dado un texto de política y una solicitud, determina si la solicitud la cumple, la incumple o falta información, con 0,918 de precisión y ECE de 0,068.
- Análisis de opiniones en hebreo: clasificación de comentarios en positivos, negativos o fuera de tema para paneles de reputación o seguimiento de producto, con 0,907 de precisión.
- Verificación de respuestas en sistemas RAG: comprueba si el párrafo recuperado responde realmente a la pregunta del usuario antes de generar una respuesta, con 0,863 de precisión y ECE de 0,028.
- Filtrado previo de consultas: como primera etapa de bajo coste que descarta o etiqueta peticiones antes de invocar un modelo mayor, reduciendo el gasto de inferencia.
- Etiquetado automático de datos: uso como anotador para clasificar grandes volúmenes de texto hebreo en CPU, a unos 70-130 ms por decisión.
- Enrutado local en el dispositivo: al caber en CPU de portátil y no requerir GPU, puede integrarse en aplicaciones de escritorio o móviles para clasificar texto sin enviar datos a la nube.

## Benchmarks y rendimiento

Precisión en los conjuntos de test de `nativ-bench`, con ECE entre paréntesis. Ninguno de los conjuntos se usó para entrenamiento. Laya-Hebrew se incluye como comparación y el profesor es el modelo del que se destiló Nativ.

| Tarea | Conjunto de test | Elementos | Nativ | Laya-Hebrew | Profesor |
|---|---|---|---|---|---|
| Enrutado (4 descripciones de intencion) | MASSIVE he-IL | 2.973 | **0,969** (0,009) | 0,887 | 0,959 |
| Sentimiento (positivo / negativo / fuera de tema) | OnlpLab Hebrew-Sentiment | 1.695 | **0,907** (0,005) | 0,822 | 0,898 |
| Fundamentado (el parrafo responde a la pregunta) | HeQ v1.1 | 864 | 0,863 (0,028) | 0,694 | **0,896** |
| Informacion personal, mensajes naturales | generado, escenarios reservados | 656 | **0,957** (0,078) | 0,848 | 0,860 |
| Informacion personal, plantillas | plantillas reservadas | 1.000 | 0,800 (0,008) | 0,345 | **1,000** |
| Politica (cumple / incumple / falta informacion) | reglas y numeros reservados | 1.000 | 0,918 (0,068) | 0,406 | **0,949** |
| Comprension lectora (4 opciones) | Belebele heb_Hebr | 900 | 0,576 (0,098) | **0,758** | 0,710 |

En el conjunto de plantillas de información personal, 479 de los 1.000 elementos son la frase "מספר ההזמנה שלי הוא …" ("el número de mi pedido es …"), etiquetada como no personal. Nativ le asigna un promedio de P(personal) de 0,47; el resto de elementos de ese test se responden correctamente. La comprensión lectora es la tarea más débil, especialmente las preguntas del tipo "cuál de las siguientes NO …" (0,44).

Velocidad, una decisión a la vez, en fp32 sobre CPU Apple M2 Pro: 70 ms para un mensaje corto y 130 ms para un párrafo. Laya-Hebrew: 77 / 160 ms. El profesor de 1,7B: 611 / 1.047 ms.

## Requisitos de hardware

- VRAM estimada: en fp32 aproximadamente 1,45 GB; en fp16/bf16 aproximadamente 0,73 GB; en int8 aproximadamente 0,36 GB (los pesos suman cerca de 364M de parámetros).
- Cabe en cualquier GPU de consumo con más de 2 GB de VRAM, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4060 o superiores.
- También funciona íntegramente en CPU, como demuestran las latencias medidas en un Apple M2 Pro.
- GPU recomendadas para despliegue en servidor: A100, H100 o L40S si se necesita procesar lotes grandes; para el tamaño del modelo no son necesarias.
- Opciones de despliegue: PyTorch con la librería `transformers`, usando el script `decider.py` incluido en el repositorio (requiere torch, transformers y safetensors). No se distribuyen pesos en formato GGUF, por lo que no hay soporte oficial directo en llama.cpp u Ollama; vLLM y TGI están pensados para modelos generativos, no para este clasificador, aunque el encoder puede servirse mediante un wrapper propio.
- Latencia estimada: 70 ms por decisión corta y 130 ms por párrafo en CPU M2 Pro, en fp32 y con una decisión a la vez.
- Throughput: no disponible en la información proporcionada para procesamiento por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enrutado (MASSIVE he-IL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yoavipo/nativ-he-decision | 364M | 1.024 tokens | 0,969 | CC BY 4.0 | HuggingFace |
| Laya-Hebrew | no disponible | no disponible | 0,887 | no disponible | no disponible |
| DictaLM-3.0-1.7B-Instruct (profesor) | 1,7B | no disponible | 0,959 | Apache-2.0 | HuggingFace |
| dicta-il/neodictabert (base) | 364M | no disponible | no disponible (no es un modelo de decision) | CC BY 4.0 | HuggingFace |

Nativ ofrece una precisión comparable o superior a la de su profesor de 1,7B en enrutado y sentimiento, con un coste de inferencia muy inferior (70 ms frente a 611 ms en mensaje corto), a cambio de perder flexibilidad generativa y quedar limitado al hebreo y a tareas de elección entre opciones.

## Limitaciones y advertencias

- Comprensión lectora de pasajes largos limitada: 0,576 en Belebele, con 0,44 en preguntas del tipo "cuál de las siguientes NO …".
- En plantillas de información personal obtiene 0,800 frente al 1,000 del profesor, y asigna una probabilidad media de 0,47 a la frase de número de pedido, que está etiquetada como no personal.
- La consideración de qué cuenta como información personal depende de la aplicación (por ejemplo, los números de pedido); se recomienda ajustar el umbral o las opciones.
- Modelo exclusivamente en hebreo; no soporta otros idiomas.
- El contexto de entrada está limitado a 1.024 tokens; los estados largos se truncan (la pregunta y las opciones se conservan).
- No está pensado como única salvaguarda para decisiones que afecten a personas.
- Riesgo de alucinación: al no ser generativo, no produce texto libre, pero sus probabilidades pueden estar mal calibradas en dominios alejados de los datos de entrenamiento; el ECE es de 0,078 en información personal natural y 0,068 en política, valores relativamente altos.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada.
- Licencia CC BY 4.0, que permite uso comercial; los datos de entrenamiento (MASSIVE, HeQ, generados por modelos Apache-2.0) son de uso comercial permitido según el autor.
- Parte de los datos de entrenamiento fueron generados por modelos (DictaLM-3.0-24B-Thinking), lo que puede introducir sesgos o errores heredados del generador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yoavipo/nativ-he-decision
- Modelo base: https://huggingface.co/dicta-il/neodictabert
- Profesor de destilacion: https://huggingface.co/dicta-il/DictaLM-3.0-1.7B-Instruct
- Modelo generador de datos: https://huggingface.co/dicta-il/DictaLM-3.0-24B-Thinking
- Conjunto de benchmarks: https://huggingface.co/datasets/yoavipo/nativ-bench
