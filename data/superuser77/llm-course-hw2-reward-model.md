# superuser77/llm-course-hw2-reward-model

## Resumen

El modelo `superuser77/llm-course-hw2-reward-model` es un modelo de recompensa (reward model) de tipo *sequence classification* construido a partir de `HuggingFaceTB/SmolLM-135M-Instruct`. Lo desarrolla el usuario `superuser77` como parte de una tarea académica (homework 2) de un curso sobre modelos de lenguaje, y su función es puntuar pares de petición-respuesta con un valor escalar. No genera texto: recibe una conversación formateada y devuelve una única puntuación que pretende reflejar la calidad de la respuesta.

La arquitectura es la de SmolLM-135M-Instruct (transformer decoder-only) con la cabeza de lenguaje sustituida por una capa lineal de una única salida. Durante el entrenamiento solo se actualizó esa capa, manteniendo congelados los pesos del modelo base. Se entrenó sobre el dataset `HumanLLMs/Human-Like-DPO-Dataset` con TRL 0.19.1, una época, batch de 16, learning rate 3e-4 y longitud máxima de 1024 tokens.

Es relevante como ejemplo didáctico de cómo construir un reward model sobre un backbone pequeño y de cómo interpretar (y desconfiar de) las puntuaciones de recompensa: el propio autor documenta un caso en el que una respuesta vacía obtiene una puntuación superior a la respuesta del modelo base, ilustrando el fenómeno de *reward hacking*. No es un modelo pensado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM-135M-Instruct) con cabeza lineal de 1 salida para clasificación |
| Parametros totales | 134.515.584 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (longitud máxima usada en entrenamiento; el modelo base SmolLM-135M-Instruct soporta 2048, no confirmado para esta variante) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tamaño del repositorio | 0.5 GB |
| Modelo base | HuggingFaceTB/SmolLM-135M-Instruct |
| Dataset de entrenamiento | HumanLLMs/Human-Like-DPO-Dataset |
| Librería | transformers |

## Arquitectura y entrenamiento

El modelo parte de SmolLM-135M-Instruct, un transformer decoder-only de 134,5 millones de parámetros. El autor sustituye la cabeza de generación por una capa lineal con una única salida y aplica *freezing* a todos los pesos del backbone: solo se entrena esa capa de clasificación. El resultado es un modelo que, dada una secuencia que codifica petición y respuesta, produce un escalar de recompensa.

El entrenamiento se realizó con TRL 0.19.1 sobre el dataset `HumanLLMs/Human-Like-DPO-Dataset`, con un split aleatorio 90/10, una época, batch de 16, learning rate 3e-4, longitud máxima de 1024 tokens y precisión mixta sobre una GPU T4. La pérdida media fue de 0,1154, descendiendo de 0,6086 en el paso 25 a 0,0397 en el paso 600, a lo largo de 612 pasos. En una única pareja de la partición de validación, la respuesta elegida obtuvo 4,3438 y la rechazada -0,2656; el autor no calculó la precisión completa sobre el conjunto de validación. Las puntuaciones no son probabilidades (no hay sigmoide ni normalización documentada).

## Capacidades

- Puntuación de pares petición-respuesta: devuelve un escalar de recompensa para una conversación formateada.
- Clasificación de preferencias: puede usarse para ordenar dos respuestas candidatas a una misma petición.
- No genera texto: es un modelo de clasificación, no un modelo causal de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso por sí mismo (solo puntúa).
- Capacidad multilingüe limitada al inglés, según la model card.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Práctica educativa de RLHF: sirve como reward model en un pipeline de PPO o DPO simplificado para demostrar cómo una señal de recompensa guía el ajuste de un modelo generador, tal como el propio autor hace en los modelos `llm-course-hw2-dpo` y `llm-course-hw2-ppo`.
- Filtrado de datos sintéticos en un prototipo: puntuar pares generados por un modelo pequeño y descartar los de recompensa baja antes de un ajuste fino, siempre con validación humana.
- Ranking de respuestas candidatas en un entorno de laboratorio: dadas dos respuestas a la misma petición, usar la puntuación para elegir la preferida y comparar con anotaciones humanas.
- Estudio de *reward hacking*: reproducir el caso documentado por el autor (respuesta vacía con puntuación 3,8582 frente a 3,0157 de la respuesta del modelo base) para analizar cómo una recompensa mal calibrada puede premiar salidas degeneradas.
- Docencia sobre arquitecturas de reward models: inspeccionar cómo una cabeza lineal sobre un backbone congelado de 135M puede producir señales de preferencia y discutir sus límites.
- Baseline de bajo coste en investigación: como referencia rápida en experimentos de alineamiento donde no se dispone de un reward model grande, para comparar tendencias, no para decisiones de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas de entrenamiento y una única pareja de validación:

| Metrica | Valor |
|---|---|
| Pasos de entrenamiento | 612 |
| Perdida media | 0.1154 |
| Perdida en paso 25 | 0.6086 |
| Perdida en paso 600 | 0.0397 |
| Puntuacion respuesta elegida (1 par de validacion) | 4.3438 |
| Puntuacion respuesta rechazada (1 par de validacion) | -0.2656 |
| Precision en validacion | No calculada por el autor |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,54 GB solo para pesos (134,5M × 4 bytes), más activaciones y overhead; en la práctica cabe en cualquier GPU consumer con 2 GB o más.
- VRAM estimada en fp16/bf16: en torno a 0,27 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizó en una NVIDIA T4.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU modernas (GTX 1050 Ti en adelante, RTX 20/30/40, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`; `text-embeddings-inference` está listado en los tags; no se publican pesos GGUF, por lo que llama.cpp/Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles. Por el tamaño (135M) y la longitud máxima de 1024 tokens, se espera un throughput alto en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| superuser77/llm-course-hw2-reward-model | 134,5M | 1024 (entrenamiento) | Reward model (sequence classification) | No disponible | Hugging Face |
| HuggingFaceTB/SmolLM-135M-Instruct | 135M | 2048 | Causal LM instruct | Apache 2.0 (según el modelo base) | Hugging Face |
| ArmoRM-Llama3-8B-v0.1 | 8B | 8192 | Reward model | No verificada en esta ficha | Hugging Face |
| RLHFlow/ArmoRM-Llama3-8B-v0.1 (referencia de categoría) | 8B | 8192 | Reward model | No verificada en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a parámetros, contexto y tipo.

## Limitaciones y advertencias

- El propio autor documenta un caso de *reward hacking*: una respuesta vacía obtuvo 3,8582 frente a 3,0157 de la respuesta del modelo base en una petición sobre rutinas matutinas, lo que evidencia que una recompensa alta no garantiza texto de calidad.
- Solo se evaluó una pareja de validación; no hay precisión ni métricas agregadas sobre el conjunto de test, por lo que la fiabilidad estadística es desconocida.
- Entrenado únicamente en inglés; no se garantiza comportamiento en castellano ni en otros idiomas.
- Las puntuaciones no son probabilidades y no están normalizadas; no deben interpretarse como confianza calibrada.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- Modelo de 135M parámetros con solo una capa entrenada: capacidad muy limitada para capturar preferencias sutiles; no apto para producción.
- Riesgo de sesgos heredados del dataset `HumanLLMs/Human-Like-DPO-Dataset` y del modelo base SmolLM-135M-Instruct, no analizados por el autor.
- Longitud máxima de 1024 tokens en entrenamiento: secuencias más largas pueden degradar la puntuación o requerir truncado.
- No se publican variantes cuantizadas ni instrucciones de despliegue en servidores de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/superuser77/llm-course-hw2-reward-model
- Modelo DPO relacionado: https://huggingface.co/superuser77/llm-course-hw2-dpo
- Modelo PPO relacionado: https://huggingface.co/superuser77/llm-course-hw2-ppo
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset
- TRL (librería de entrenamiento): https://github.com/huggingface/trl
