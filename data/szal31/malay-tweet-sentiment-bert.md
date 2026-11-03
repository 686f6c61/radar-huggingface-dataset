# szal31/malay-tweet-sentiment-bert

## Resumen

`szal31/malay-tweet-sentiment-bert` es un modelo de clasificación de texto en malayo (código ISO `ms`) obtenido mediante fine-tuning de `mesolitica/bert-base-standard-bahasa-cased` sobre tuits en malasio. Lo desarrolla el usuario de HuggingFace szal31 y resuelve una tarea concreta: clasificar un tuit en una de tres clases de sentimiento (negativo, neutro o positivo). Es relevante porque el malayo coloquial de Twitter está poco cubierto por los modelos multilingües genéricos y porque el autor publica el código, el análisis de errores y las métricas completas en un repositorio de GitHub.

Se trata de un BERT base estándar (encoder transformer) con 110.619.651 parámetros, pesos en formato safetensors y un repositorio de 0,4 GB. La longitud de contexto no está documentada en la información disponible, aunque por herencia del modelo base corresponde a la configuración típica de BERT (512 tokens). La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El modelo es pequeño, entrenado con solo 1.397 tuits anotados manualmente y con un rendimiento modesto (macro-F1 de 0,627 y accuracy de 0,66 sobre 300 tuits de test). Es útil como punto de partida o como componente ligero en un pipeline de análisis de opinión en malayo, no como solución de producción de alta precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (bert-base-standard-bahasa-cased) |
| Parametros totales | 110.619.651 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base, tipicamente 512 tokens) |
| Tipos de cuantizacion | no disponible; al ser un BERT de 110M es cuantizable a int8 y a 4 bits con herramientas estandar (ONNX Runtime, bitsandbytes), aunque el autor no publica variantes |
| Idiomas soportados | malayo (`ms`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder bidireccional de la familia BERT, concretamente la variante `bert-base-standard-bahasa-cased` de Mesolitica, que sirve como inicialización. Sobre ella se aplica un fine-tuning supervisado para clasificación de secuencias con tres etiquetas (negativo, neutro, positivo). No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación posteriores; es un ajuste supervisado clásico sobre un dataset etiquetado.

El conjunto de entrenamiento son 1.397 tuits anotados manualmente y el conjunto de evaluación son 300 tuits reservados. El dataset es `kornwtp/ms-bahasa-twitter-sentiment`. El autor indica que el preprocesado sustituye enlaces por el token `URL` y nombres de usuario por `@USER`, de modo que el modelo espera entradas con esa misma normalización. No se especifican hiperparámetros, número de épocas, tasa de aprendizaje ni composición exacta por clase. La innovación técnica es limitada: se trata de un fine-tuning estándar, y el valor añadido está en el dominio (malayo coloquial de Twitter) y en la publicación transparente del análisis de errores.

## Capacidades

- Clasificación de sentimiento en tres clases (negativo, neutro, positivo) de texto en malayo, con especial énfasis en registro informal de Twitter.
- Procesamiento de texto corto con ruido típico de redes sociales, siempre que se aplique la normalización de enlaces (`URL`) y menciones (`@USER`).
- Codificación contextual bidireccional del malayo, reutilizable como extractor de características para otras tareas de clasificación o NER en el mismo idioma.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso; es un clasificador, no un modelo generativo.
- No tiene capacidades de visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al malayo; no se ha evaluado en indonesio ni en variantes cercanas.

## Casos de uso

- Monitorización de opinión en redes sociales: el modelo clasifica tuits en malayo en las tres clases de sentimiento y permite agregar métricas de polaridad por período, marca o tema. Es adecuado por su bajo coste computacional y porque está entrenado específicamente en registro de Twitter.
- Moderación y triaje de comentarios: en un foro o cuenta de marca en malayo, el clasificador puede priorizar mensajes negativos para revisión humana, reduciendo el volumen de lectura manual.
- Enrutamiento de tickets de soporte: los mensajes de clientes en malayo pueden clasificarse por sentimiento antes de asignarse a un agente, lo que ayuda a priorizar casos de insatisfacción.
- Análisis de campañas de marketing: procesamiento por lotes de menciones y respuestas a una campaña para medir la reacción del público malasio con un coste de inferencia mínimo (110M de parámetros, ejecutable en CPU).
- Investigación en PLN de lenguas austronesias: sirve como línea base reproducible (macro-F1 0,627) frente a la cual comparar modelos multilingües más grandes o nuevos datasets de sentimiento en malayo.
- Extracción de características para pipelines downstream: el encoder puede congelarse o afinarse de nuevo para tareas relacionadas (detección de sarcasmo, clasificación de temas) en el mismo dominio lingüístico.
- Filtrado previo en un sistema de escucha social más amplio: al ser ligero, puede actuar como primera etapa que descarta contenido neutro antes de pasar los casos dudosos a un modelo mayor.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 300 tuits reservados:

| Metrica | Valor |
|---|---|
| Macro-F1 | 0,627 |
| Accuracy | 0,66 |
| Baseline TF-IDF (macro-F1) | 0,576 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni comparaciones con otros modelos de sentimiento en malayo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB de pesos (110M parámetros × 4 bytes), más activaciones; en la práctica cabe en cualquier GPU con 2 GB o más.
- VRAM estimada en fp16: unos 0,22 GB de pesos; en int8, unos 0,11 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobredimensionada para este modelo; también funciona bien en CPU.
- Cabe en GPU consumer y en hardware de gama baja, incluidos dispositivos con poca memoria.
- Opciones de despliegue: HuggingFace `transformers` con `AutoModelForSequenceClassification`, ONNX Runtime, TorchScript, y exportación a GGUF para llama.cpp aunque no se publican conversiones oficiales.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera un throughput de miles de secuencias cortas por segundo en GPU y cientos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| szal31/malay-tweet-sentiment-bert | 110,6M | no disponible (tipico 512) | macro-F1 0,627 en test propio | Apache 2.0 | HuggingFace |
| mesolitica/bert-base-standard-bahasa-cased (base) | ~110M | tipico 512 | no evaluado en esta tarea | no disponible en la informacion | HuggingFace |
| Baseline TF-IDF del autor | no aplica | no aplica | macro-F1 0,576 | no aplica | reproducible en el repo |

No se dispone de datos publicados de otros clasificadores de sentimiento en malayo comparables en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento modesto: macro-F1 de 0,627 y accuracy de 0,66 sobre 300 ejemplos indican una capacidad discriminativa limitada; la clase neutra suele ser la más difícil en este tipo de tareas.
- Entrenamiento con solo 1.397 ejemplos, lo que implica alto riesgo de sobreajuste y baja cobertura de vocabulario y expresiones.
- Dominio restringido a tuits en malayo coloquial; el autor advierte que el texto formal puede ser menos preciso.
- Requiere la misma normalización del entrenamiento (enlaces a `URL`, menciones a `@USER`); sin ella el rendimiento puede degradarse.
- Riesgo de sesgo por la composición del dataset: no se documenta la distribución por clase, tema, género o región, por lo que pueden existir sesgos no medidos.
- No es un modelo generativo: no alucina texto, pero puede asignar etiquetas erróneas con alta confianza; se recomienda calibrar y validar en el dominio de destino.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener condiciones propias que conviene revisar.
- Sin descargas ni validación externa (0 descargas, 0 likes en el momento de la consulta), por lo que no hay evidencia de uso en producción.
- No apto para decisiones de alto riesgo (moderación automática sin revisión humana, diagnóstico, etc.) dado su nivel de precisión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/szal31/malay-tweet-sentiment-bert
- Repositorio con código y análisis de errores: https://github.com/szal31/Malay-Tweet-Sentiment-Analysis-Using-BERT
- Modelo base: https://huggingface.co/mesolitica/bert-base-standard-bahasa-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/kornwtp/ms-bahasa-twitter-sentiment
