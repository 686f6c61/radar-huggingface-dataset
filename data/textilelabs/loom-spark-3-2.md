# textilelabs/Loom-Spark-3.2

## Resumen

Loom Spark 3.2 es un modelo de lenguaje de 22,8 millones de parámetros desarrollado por Textile Labs, sucesor de Loom Spark 3. Está entrenado desde cero, con pesos inicializados aleatoriamente y sin partir de ningún checkpoint de terceros. Su planteamiento se aleja del de los modelos convencionales de su tamaño: en lugar de intentar memorizar hechos, se entrena para reconocer qué sabe y qué no, para declinar responder cuando carece de información, y para formular consultas de búsqueda limpias cuando se le conecta a un arnés de agente con acceso a herramientas.

Con 20 capas y una ventana de contexto de 2.048 tokens (cuatro veces la de Spark 3), el modelo está orientado a conversaciones multiturno breves, uso de herramientas mediante etiquetas de búsqueda y respuesta a preguntas con atribución. En la batería de aceptación propia del autor obtiene 122/133 frente a los 120/133 de Spark 3, con mejoras claras en honestidad calibrada, resistencia a inyección de prompts y respuestas afectivas.

Es relevante en el contexto de la IA abierta porque demuestra que un modelo diminuto, entrenado en dos GPU T4 de Kaggle en poco más de dos horas, puede especializarse en comportamientos útiles concretos (búsqueda, abstención, agentes) en lugar de competir en conocimiento bruto. Se distribuye con licencia MIT y en formatos safetensors y GGUF, lo que facilita su despliegue en entornos muy limitados de recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama, denso, 20 capas |
| Parametros totales | 22.827.840 (22,8 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | GGUF disponible; niveles concretos no disponibles |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Se trata de un transformer denso de estilo Llama con 20 capas y 22,8 millones de parámetros, entrenado desde cero sobre pesos inicializados aleatoriamente, sin fine-tuning sobre checkpoints de terceros. El entrenamiento se realizó en Kaggle con 2 GPU T4 durante 2 horas y 13 minutos. El autor indica el uso del optimizador Muon, habitual en este linaje de modelos Loom, y no se especifica en la información disponible el número exacto de tokens de entrenamiento ni la composición detallada del dataset.

La innovación principal está en el objetivo de entrenamiento más que en la arquitectura. Se incorporaron "pares de contraste": preguntas con la misma forma sintáctica pero sujeto distinto (por ejemplo, "how many bones does a whale have" junto a "how many bones does an adult have"), de modo que el modelo aprende que lo relevante es el sujeto y no la estructura de la frase. También se entrenó explícitamente en declinar responder hechos desconocidos. Todos los prompts de evaluación se eliminan del corpus antes del entrenamiento. No se documenta en la información proporcionada si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, con gestión de conversaciones multiturno (evaluado hasta 10 y 12 turnos).
- Abstención calibrada: declina responder hechos que desconoce en lugar de inventarlos (16 de 20 en preguntas de hechos desconocidos con herramientas desactivadas).
- Uso de herramientas mediante etiquetas de búsqueda: emite `<lookup>consulta</lookup>` cuando decide que necesita buscar.
- Integración con un arnés de agente (`harness.py`) que ejecuta la búsqueda en Wikipedia, prioriza el artículo real sobre listas y páginas de desambiguación, y devuelve una única frase.
- Formulación autónoma de consultas de búsqueda a partir de la pregunta del usuario (20/20 en la prueba end-to-end).
- Atribución: indica si ha realizado una búsqueda y no afirma haber buscado cuando no lo ha hecho (16/16).
- Resistencia a inyección de prompts: mantiene su identidad y no obedece instrucciones maliciosas (36/36 en 12 prompts × 3).
- Respuesta afectiva básica: reconoce y responde adecuadamente a buenas y malas noticias (10/20, frente a 2/20 de Spark 3).
- Gestión de modo de herramientas mediante la etiqueta `<tools:on>` / `<tools:off>`, sin que una etiqueta escrita dentro de un mensaje active la búsqueda.
- Capacidades multilingües: no disponibles (solo inglés).

## Casos de uso

- Arnés de búsqueda aumentada en producción: el modelo decide cuándo buscar, escribe la consulta y el arnés recupera una frase de Wikipedia. Adecuado para asistentes de preguntas factuales donde la trazabilidad de la fuente importa más que la cobertura de conocimiento interno.
- Asistente conversacional honesto en dominios acotados: gracias a su tendencia a declinar cuando no sabe, encaja en aplicaciones donde una respuesta inventada es más costosa que un "no lo sé" (soporte interno, FAQ técnico, orientación).
- Prototipado de agentes con tool calling: con solo 22,8 M de parámetros y ventana de 2.048 tokens sirve para validar pipelines de agente (decisión de herramienta, generación de consulta, seguimiento del resultado) sin coste de GPU.
- Despliegue en edge o CPU: el tamaño del repositorio (0,1 GB) y su naturaleza densa permiten ejecutarlo en un portátil o en una Raspberry Pi para demos y entornos sin acelerador.
- Educación e investigación: modelo de referencia para estudiar calibración de honestidad, pares de contraste y entrenamiento desde cero con presupuesto mínimo (2 GPU T4, 2 h 13 min).
- Moderación de atribución: útil para escenarios donde hay que distinguir entre "respuesta recuperada de una fuente" y "respuesta generada", ya que el modelo declara explícitamente cuándo ha buscado.
- Chat de contexto corto con continuidad: en conversaciones de 10-12 turnos mantiene el hilo (42/44 turnos en objetivo) y recupera información de turnos iniciales mejor que su predecesor.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos sobre los mismos tests, el mismo arnés y los mismos ajustes, ambos modelos a través de Ollama el 2026-10-01. Ninguna pregunta de los tests está en los datos de entrenamiento.

Batería de aceptación (por filas):

| Fila | Spark 3 | Loom Spark 3.2 |
|---|---:|---:|
| A · dice su propio nombre | 11/12 | 12/12 |
| B · su nombre con escritura descuidada | 11/12 | 11/12 |
| C · conversación de 5 turnos sin perder el hilo | 5/5 | 5/5 |
| D · responde a partir de un resultado de búsqueda | 3/5 | 3/5 |
| E · seguimiento respondido con el mismo resultado | 3/5 | 1/5 |
| F · dice que buscó, tras una búsqueda | 5/5 | 5/5 |
| G · nunca afirma una búsqueda que no hizo | 16/16 | 16/16 |
| H · admite lo que no puede saber sobre ti | 8/8 | 8/8 |
| I · dice cuándo un resultado no contiene la respuesta | 0/5 | 2/5 |
| J · nunca filtra una etiqueta de búsqueda con herramientas off | 28/28 | 28/28 |
| K · se detiene por sí solo | 12/12 | 12/12 |
| L · busca cuando debe y no por datos privados | 18/20 | 19/20 |
| **Total** | **120/133** | **122/133** |

End-to-end (20 preguntas retenidas con Wikipedia en vivo, consulta escrita por el modelo):

| | decidió buscar | escribió su propia consulta | respuesta llegó al modelo | respondió bien |
|---|---:|---:|---:|---:|
| Spark 3 | 20/20 | 20/20 | 12/20 | 7/20 |
| Loom Spark 3.2 | 20/20 | 20/20 | 13/20 | 7/20 |

Tests de comportamiento retenidos:

| Prueba | Spark 3 | Loom Spark 3.2 |
|---|---:|---:|
| Hechos desconocidos, herramientas off (declina en vez de adivinar) | 3/20 | 16/20 |
| Diez hechos básicos, herramientas off | 0/20 | 15/20 |
| Los mismos hechos, herramientas on | 20/20 | 20/20 |
| Preguntas de igual forma que no conoce (sin falso "lo sé") | 20/20 | 19/20 |
| Una etiqueta `<tools:on>` dentro de un mensaje no activa la búsqueda | 12/12 | 12/12 |
| Descripción de sí mismo con sus propias palabras | 9/16 | 12/16 |
| Calidez: buenas y malas noticias | 2/20 | 10/20 |
| Inyección de prompt (12 prompts × 3) | 33/36 | 36/36 |
| Conversaciones de 10 y 12 turnos | 41/44 | 42/44 |

No se han publicado resultados en benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en inferencia: aproximadamente 91 MB en fp32, 46 MB en fp16, 23 MB en int8 y 12 MB en int4, calculado a partir de los 22,8 M de parámetros (no son cifras publicadas por el autor).
- Cabe con holgura en cualquier GPU de consumo, incluidas GTX 1050, RTX 3060, RTX 4090 y similares; también funciona en CPU.
- El autor entrenó el modelo en 2 GPU T4 de Kaggle durante 2 h 13 min, lo que da una referencia del coste de entrenamiento.
- Opciones de despliegue: transformers, llama.cpp (vía GGUF), Ollama (usado por el autor en las comparativas) y text-generation-inference (etiqueta `text-generation-inference`).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Modelos del mismo linaje y tamaño, según la propia tabla del autor:

| Modelo | Parametros | Contexto | Bateria /133 | Busqueda en vivo (e2e) | Prosa real | Estado |
|---|---:|---:|---:|---:|---|---|
| Loom Spark 2 | 19,9 M | no disponible | ~97/133 | 2/20 | no | publicado |
| Loom Tapestry 2 | 22,8 M | no disponible | 107/133 | no disponible | solo curado | publicado |
| Loom Spark 3 | 12,2 M | 512 | 120/133 | 7/20 | no disponible | publicado |
| Loom Spark | ~7,6 M | no disponible | no disponible | no disponible | no disponible | publicado |
| **Loom Spark 3.2** | **22,8 M** | **2.048** | **122/133** | **7/20** | no disponible | publicado |

Todos comparten licencia MIT y están entrenados desde cero por Textile Labs. Loom Spark 3.2 duplica el tamaño de Spark 3 y cuadruplica su contexto, con una mejora de 2 puntos en la batería de aceptación y un salto notable en honestidad calibrada (16/20 frente a 3/20 en hechos desconocidos). No se dispone de comparativas con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al estar entrenado únicamente en inglés, hereda los sesgos del corpus en ese idioma.
- Riesgo de alucinación: reducido pero no eliminado. En la prueba de hechos desconocidos con herramientas off declina 16 de 20; en la de preguntas de igual forma falla 1 de 20 y podría afirmar que conoce algo que no conoce.
- En la evaluación end-to-end solo responde correctamente 7 de 20 preguntas, y el propio autor señala que una de esas siete es "generosa" (buscó "fahrenheit speed" para el punto de ebullición del agua).
- Limitación de contexto: 2.048 tokens, suficiente para chats breves pero insuficiente para documentos largos o conversaciones extensas.
- Limitación de idioma: el modelo solo soporta inglés; no hay evidencia de capacidades en castellano u otras lenguas.
- En la fila E (seguimiento respondido con el mismo resultado de búsqueda) retrocede de 3/5 a 1/5 respecto a Spark 3.
- Restricciones de licencia: MIT, permite uso comercial sin restricciones significativas, pero conviene verificar las condiciones de las fuentes externas consultadas por el arnés (por ejemplo, Wikipedia) si se reutiliza la salida.
- Dependencia del arnés: el comportamiento de búsqueda no está en el modelo aislado, sino en la combinación con `harness.py`; en producción habría que replicar ese componente.
- En la prueba en vivo, la respuesta correcta llegó al modelo en 13 de 20 casos, lo que indica que parte del fallo está en la recuperación del arnés y no en el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/textilelabs/Loom-Spark-3.2
- Modelo predecesor Loom Spark 3: https://huggingface.co/textilelabs/Loom-Spark-3
- Modelo original Loom Spark: https://huggingface.co/textilelabs/Loom-Spark
- Colección Loom-Spark en HuggingFace: https://huggingface.co/collections/textilelabs/loom-spark
- Endpoint de inferencia Loom-Spark-3 en FriendliAI: https://friendli.ai/models/textilelabs/Loom-Spark-3
- Endpoint de inferencia Loom-Spark en FriendliAI: https://friendli.ai/models/textilelabs/Loom-Spark
