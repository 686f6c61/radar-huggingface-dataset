# YoussefGhallab/regen-real-bowls-iter1000

## Resumen

REGEN real-robot Franka bowl stacking, iteration 1000 es un checkpoint experimental de un modelo de mundo-acción (world-action model) construido sobre NVIDIA Cosmos-Predict2-2B-Video2World. Lo desarrolla el usuario YoussefGhallab y está afinado sobre 100 demostraciones de una tarea concreta de manipulación robótica: apilar tres cuencos en orden de tamaño, empezando por el morado y siguiendo por el verde. El modelo combina un backbone de predicción vídeo-mundo de 2B parámetros con una cabeza de política que produce acciones para un brazo Franka.

El interés técnico reside en el enfoque de aprendizaje continuo (continual learning) aplicado a un world-action model: se parte de un modelo generativo de vídeo preentrenado y se adapta a una política robótica mediante fine-tuning sobre un dataset privado. Se trata de la iteración 1000 de un plan de 2000, y el propio autor advierte de que no ha sido evaluado en un robot real ni sobre un conjunto de validación reservado.

Por su naturaleza, es un artefacto de investigación de nicho, con cero descargas y cero likes en el momento de la ficha, licencia "other" derivada de Cosmos-Predict2 y sin datos publicados de rendimiento. No debe confundirse con un modelo listo para producción: es un checkpoint intermedio de un experimento de investigación sobre política robótica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | World-action model sobre Cosmos-Predict2-2B-Video2World (backbone de predicción vídeo-mundo) con cabeza de política |
| Parámetros totales | 2B (heredados del modelo base Cosmos-Predict2-2B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto) |
| Licencia | other (derivada de NVIDIA Cosmos-Predict2-2B-Video2World; consultar sus términos) |
| Formato de pesos | `model.pt` (PyTorch), con `t5_embeddings.pkl`, `dataset_statistics.json`, `regen_policy.py`, `shim/`, `conversion.json`, `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo se apoya en Cosmos-Predict2-2B-Video2World, un modelo de mundo basado en difusión para predicción vídeo-a-vídeo, y le añade una política de acciones para control robótico. El checkpoint incluye un script de política (`regen_policy.py`), un directorio `shim/` para adaptar interfaces, embeddings de texto T5 precalculados (`t5_embeddings.pkl`) y estadísticas del dataset (`dataset_statistics.json`), lo que sugiere un pipeline de condicionamiento por instrucción en lenguaje natural más observaciones visuales.

El entrenamiento se realizó mediante fine-tuning sobre 100 demostraciones de la tarea "apilar los tres cuencos en orden de tamaño: primero el morado, luego el verde", procedentes de un dataset privado (`YoussefGhallab/stack_bowls_in_size_order_rc`). No se especifican en la información disponible el número de tokens, la composición del dataset, ni si hubo RLHF o DPO. El checkpoint corresponde a la iteración 1000 de un plan de 2000, dentro de un esquema de aprendizaje continuo (continual learning) etiquetado como REGEN. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de acciones robóticas para un brazo Franka en una tarea de apilamiento de cuencos.
- Condicionamiento por instrucción en lenguaje natural (embeddings T5) para especificar la tarea.
- Predicción vídeo-mundo heredada del backbone Cosmos-Predict2-2B-Video2World.
- Aprendizaje continuo: el checkpoint forma parte de una secuencia de iteraciones (1000 de 2000).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento general, código, matemáticas, visión general, audio ni modo thinking.
- Capacidades multilingües: no disponibles; el modelo no está orientado a texto general.

## Casos de uso

- Investigación en world-action models: servir como punto de partida para estudiar cómo un modelo de mundo de vídeo preentrenado se adapta a políticas de manipulación, comparando iteraciones intermedias del entrenamiento.
- Reproducción de experimentos de aprendizaje continuo: el checkpoint permite analizar la evolución de la política entre la iteración 1000 y la 2000 planificada, siempre que se disponga del resto de checkpoints.
- Benchmark interno de apilamiento de cuencos: útil como referencia en un pipeline de evaluación propio sobre la tarea específica, dado que el autor no publica evaluación reservada.
- Estudio de condicionamiento por lenguaje en robótica: los embeddings T5 precalculados permiten analizar cómo la instrucción "apila los cuencos en orden de tamaño" modula la política.
- Base para fine-tuning en tareas similares de manipulación con Franka: al estar ya adaptado a un brazo Franka, puede servir de inicialización para variantes de la misma tarea.
- Docencia y divulgación: ejemplo práctico de cómo se estructura un checkpoint de política robótica (pesos, estadísticas, shim, script de política) para explicar el ciclo de vida de un world-action model.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo no ha sido evaluado en un robot ni sobre un conjunto de validación reservado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repo ocupa 3,9 GB, lo que sugiere que los pesos en precisión original caben en GPUs de consumo con suficiente memoria, pero no se confirma la precisión ni el overhead del backbone de difusión.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del backbone (2B) y la naturaleza de difusión vídeo, se requeriría al menos una GPU con memoria generosa, pero no se especifica.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño del repo (3,9 GB) es compatible con GPUs de 8-16 GB en teoría, pero la inferencia de un modelo de difusión vídeo puede requerir más memoria en tiempo de ejecución.
- Opciones de despliegue: el repo incluye `regen_policy.py` y `shim/`, y una guía `DEPLOY_FRANKA.md` para el brazo Franka; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| REGEN real-robot Franka bowl stacking (iter 1000) | 2B | no disponible | World-action model para apilamiento de cuencos con Franka | other (derivada de Cosmos-Predict2) | Checkpoint experimental, 0 descargas |
| NVIDIA Cosmos-Predict2-2B-Video2World | 2B | no disponible | Predicción vídeo-mundo general | consultar términos de NVIDIA | Modelo base público en Hugging Face |
| Políticas robóticas tipo diffusion policy (genéricas) | variable | no disponible | Manipulación robótica | variable | Múltiples implementaciones públicas |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- Checkpoint experimental sin evaluación en robot real ni conjunto de validación reservado, según el propio autor.
- Iteración 1000 de 2000: el entrenamiento no ha finalizado y el rendimiento puede ser intermedio.
- Entrenado sobre solo 100 demostraciones de una tarea muy específica; la generalización a otras tareas o variaciones es incierta.
- Dataset de entrenamiento privado, lo que dificulta la reproducibilidad.
- Licencia "other" derivada de NVIDIA Cosmos-Predict2-2B-Video2World: es imprescindible revisar los términos de NVIDIA antes de cualquier redistribución o uso comercial.
- Riesgo de alucinación y sesgos: no documentados, pero aplicables en la medida en que el backbone es un modelo generativo de vídeo.
- Idiomas soportados no disponibles; el condicionamiento por lenguaje se limita a los embeddings T5 del dataset de entrenamiento.
- Sin métricas de latencia ni throughput publicadas, lo que impide planificar despliegues en producción.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/YoussefGhallab/regen-real-bowls-iter1000
- Guía de despliegue para Franka: `DEPLOY_FRANKA.md` (incluida en el repositorio)
- Modelo base: https://huggingface.co/nvidia/Cosmos-Predict2-2B-Video2World
- Dataset de entrenamiento (privado): `YoussefGhallab/stack_bowls_in_size_order_rc`
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
