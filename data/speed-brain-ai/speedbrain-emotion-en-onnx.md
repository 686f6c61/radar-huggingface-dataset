# speed-brain-ai/speedbrain-emotion-en-onnx

## Resumen

El modelo `speed-brain-ai/speedbrain-emotion-en-onnx` es un clasificador de emociones en texto inglés, presentado como una exportación ONNX con cuantización dinámica int8 del modelo base `SamLowe/roberta-base-go_emotions-onnx`. Lo desarrolla el equipo de speed-brain-ai como parte de su "injection-engine" o "Persona Forge", un sistema orientado a chatbots con personalidad que detecta la emoción del usuario en cada turno de conversación y ajusta la "zona emocional" (Emotion Area) del personaje en consecuencia.

El modelo reduce el conjunto de etiquetas original de GoEmotions a un espacio canónico de 7 emociones: ira, asco, miedo, alegría, neutral, tristeza y sorpresa. Está pensado para ejecutarse en CPU mediante onnxruntime, lo que lo hace ligero y adecuado para integración en tiempo real dentro de pipelines de conversación. Su relevancia actual radica en la creciente demanda de sistemas de IA conversacional que adapten su tono y comportamiento al estado emocional del usuario, sin necesidad de infraestructura GPU dedicada.

Al ser una conversión de formato y cuantización, no introduce nuevas capacidades respecto al modelo base, pero ofrece una versión optimizada para despliegue en entornos con recursos limitados. La licencia MIT del repositorio se hereda del modelo base, aunque se advierte que si el modelo original tuviera restricciones de tipo RAIL, estas se aplicarían también a los usuarios finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (modelo base: SamLowe/roberta-base-go_emotions-onnx) |
| Parametros totales | no disponible (el modelo base RoBERTa base tiene aproximadamente 125M, pero no se confirma en la informacion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base RoBERTa soporta 512 tokens, pero no se especifica en la informacion) |
| Tipos de cuantizacion | int8 dinamico (exportacion ONNX) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT (con posible herencia de restricciones RAIL del modelo base) |
| Formato de pesos | ONNX (model_quantized.onnx, model.onnx) + tokenizer.json |

## Arquitectura y entrenamiento

El modelo es una conversión directa del checkpoint `SamLowe/roberta-base-go_emotions-onnx`, que a su vez es una versión ONNX de un RoBERTa base fine-tuneado sobre el dataset GoEmotions. No se ha realizado ningún entrenamiento adicional en este repositorio; solo se ha exportado a formato ONNX y se ha aplicado cuantización dinámica int8 para reducir el tamaño y acelerar la inferencia en CPU. La arquitectura subyacente es un transformer encoder de tipo RoBERTa, con atención bidireccional, diseñado para tareas de clasificación de secuencias.

El proceso de cuantización dinámica int8 convierte los pesos y activaciones a enteros de 8 bits en tiempo de ejecución, lo que reduce el uso de memoria y mejora la latencia en CPUs sin necesidad de calibración previa con datos de validación. Esta técnica es especialmente útil para despliegues en producción donde se prioriza la velocidad sobre la precisión absoluta. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que el modelo original no se documenta en la información proporcionada.

## Capacidades

- Clasificacion de emociones en texto ingles: detecta una de 7 emociones (ira, asco, miedo, alegria, neutral, tristeza, sorpresa) a partir de un fragmento de texto.
- Integracion en sistemas conversacionales: disenado para ser usado por el injection-engine de speedbrain, que ajusta la respuesta de un personaje segun la emocion detectada en cada turno.
- Ejecucion en CPU: gracias a la cuantizacion int8 y al formato ONNX, puede ejecutarse en entornos sin GPU, con onnxruntime como backend.
- Compatibilidad con pipelines de texto: al ser un modelo de clasificacion de secuencias, se puede integrar facilmente en flujos de preprocesamiento y postprocesamiento de NLP.
- No incluye capacidades de generacion de texto, tool calling, agentes, vision ni audio; es exclusivamente un clasificador de emociones.

## Casos de uso

- Chatbots con personalidad adaptativa: el modelo se integra en el injection-engine de speedbrain para detectar la emocion del usuario en cada mensaje y modificar el "Emotion Area" del personaje, permitiendo respuestas mas empaticas o mas acordes al estado de animo del interlocutor.
- Analisis de sentimiento en tiempo real en atencion al cliente: se puede usar para clasificar el tono de los mensajes de usuarios en sistemas de soporte, priorizando aquellos con emociones negativas (ira, tristeza) para una atencion inmediata.
- Moderacion de contenido en redes sociales o foros: detectar mensajes con ira o asco puede ayudar a identificar contenido toxico o conflictivo antes de que escale.
- Evaluacion de experiencia de usuario en encuestas abiertas: clasificar las respuestas de los usuarios en categorias emocionales para medir la satisfaccion general de un producto o servicio.
- Asistentes virtuales de salud mental: aunque no es un sustituto de un profesional, puede servir como herramienta de triaje para detectar senales de tristeza o miedo en conversaciones de apoyo.
- Juegos y narrativa interactiva: en videojuegos con dialogos ramificados, el modelo puede ajustar la reaccion de los personajes no jugables segun la emocion expresada por el jugador en texto libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de exactitud, F1 ni comparaciones con otros modelos. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en produccion.

## Requisitos de hardware

- No requiere GPU: el modelo esta optimizado para CPU mediante onnxruntime con cuantizacion int8.
- Memoria RAM estimada: el tamano del repositorio es de 0.1 GB, por lo que la carga en memoria es reducida (probablemente menos de 200 MB en RAM).
- GPU recomendadas: no aplica, aunque si se desea acelerar en GPU, onnxruntime puede usar CUDAExecutionProvider, pero no es el objetivo del modelo.
- Opciones de despliegue: onnxruntime (Python, C++, C#), tambien se puede servir mediante ONNX Runtime Server o integrar en frameworks como FastAPI.
- Latencia y throughput: no se proporcionan datos, pero al ser un modelo pequeno y cuantizado, se espera una latencia de milisegundos en CPU moderna para frases cortas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de clasificacion de emociones en la informacion proporcionada. Se puede mencionar que el modelo base `SamLowe/roberta-base-go_emotions-onnx` es una referencia comun en este ambito, pero no se aportan datos de rendimiento ni de otros modelos comparables.

## Limitaciones y advertencias

- Solo soporta ingles: no es util para textos en otros idiomas sin traduccion previa.
- Conjunto de emociones reducido: las 7 categorias pueden no capturar matices emocionales complejos presentes en el dataset GoEmotions original (que tiene 28 etiquetas).
- Posibles sesgos del modelo base: RoBERTa puede presentar sesgos de genero, raza o cultura en sus predicciones, heredados del entrenamiento original.
- Riesgo de alucinacion: al ser un clasificador, no genera texto, pero puede asignar emociones incorrectas a frases ambiguas o sarcasticas.
- Restricciones de licencia: aunque el repositorio tiene licencia MIT, el modelo base puede tener restricciones adicionales (tipo RAIL) que limiten su uso en ciertos contextos, especialmente en aplicaciones de alto riesgo.
- Sin garantias de precision: al no publicarse benchmarks, el rendimiento real en produccion es desconocido y debe validarse con datos propios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/speed-brain-ai/speedbrain-emotion-en-onnx
- Modelo base: https://huggingface.co/SamLowe/roberta-base-go_emotions-onnx
- Web de enterspeed (mencion de Speedbrain): https://www.enterspeed.com/products/services/conversational-intelligence-service
