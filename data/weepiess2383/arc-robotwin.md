# weepiess2383/arc-robotwin

## Resumen

El repositorio `weepiess2383/arc-robotwin` es un archivo de investigación que consolida checkpoints del modelo RoboTwin 2.0, un sistema de visión-lenguaje-acción (VLA) orientado a la manipulación robótica. El autor, `weepiess2383`, ha publicado una colección de pesos congelados (EMA) extraídos de entrenamientos por tarea, tanto con fine-tuning congelado como completo, sobre seis tareas del benchmark RoboTwin. También incluye una ejecución de co-entrenamiento con el modelo StarVLA.

El contenido son 177,5 GB de checkpoints en formato PyTorch (`.pt`), organizados en shards por paso de entrenamiento. Cada checkpoint contiene únicamente el payload EMA en fp32, verificado contra `engine_meta.pt`, y es cargable directamente mediante la función `load_pretrain_trainables` del método `lafm/vla_flow_ft.py` con `init_use_ema=true`. El programa de entrenamiento terminó el 2026-08-06 y las evaluaciones en el benchmark NEO-75k muestran resultados parciales (10,60/13,60/14,80 en 50 trials por paso).

Este repositorio es relevante para investigadores en robótica que necesiten reproducir o analizar fine-tunes de modelos VLA de tamaño medio (el nombre del run sugiere un modelo base "neo2b", probablemente de 2 mil millones de parámetros), especialmente en el contexto de aprendizaje por refuerzo y co-entrenamiento con otros modelos. No está destinado a uso en producción, sino como material de referencia para experimentos académicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente VLA basado en transformer, sin confirmar) |
| Parametros totales | no disponible (el nombre del run sugiere "neo2b", posiblemente 2B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp32 según el README) |
| Idiomas soportados | no disponible |
| Licencia | other (sin especificar términos) |
| Formato de pesos | PyTorch `.pt` (shards con estado EMA) |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un modelo VLA (Vision-Language-Action) entrenado mediante un flujo llamado `lafm_vla_flow_neo2b_skip28_lindep`. El nombre sugiere un modelo base con 2 mil millones de parámetros ("neo2b") y un esquema de skip connections con 28 capas, probablemente una variante de transformer. El entrenamiento se realizó sobre el conjunto de datos RoboTwin 2.0, con fine-tunes específicos para seis tareas: golpear un bloque con martillo, hacer sonar una campana, entregar un bloque, recoger dos botellas, presionar una grapadora y posiblemente otras. Se aplicaron dos estrategias: fine-tuning congelado (frozen) y fine-tuning completo (full-FT). Además, hay una ejecución de co-entrenamiento con el modelo StarVLA.

Los checkpoints almacenan solo el promedio móvil exponencial (EMA) de los pesos, en fp32, sin estados de optimizador. Esto facilita la carga directa para evaluación o fine-tuning posterior, pero no permite reanudar el entrenamiento original. No se especifican detalles sobre el dataset de pre-entrenamiento, la composición de datos ni el uso de RLHF/DPO. La evaluación se realizó en el benchmark NEO-75k, con 50 trials por punto de control.

## Capacidades

- Control de robots manipuladores: el modelo genera acciones de bajo nivel (posiciones, fuerzas, etc.) a partir de observaciones visuales e instrucciones en lenguaje natural.
- Fine-tuning por tarea: cada checkpoint está especializado en una tarea concreta de RoboTwin (golpear, entregar, recoger, presionar, etc.), lo que permite comparar el rendimiento entre tareas y estrategias de entrenamiento.
- Co-entrenamiento con StarVLA: el run de co-entrenamiento sugiere capacidad de transferencia entre diferentes arquitecturas VLA.
- Evaluación reproducible: los pesos EMA y la verificación de integridad permiten reproducir los resultados reportados en NEO-75k.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso o capacidades multilingües, ya que el modelo está orientado exclusivamente a la robótica.

## Casos de uso

- Investigación en manipulación robótica: los checkpoints permiten estudiar el efecto del fine-tuning congelado frente al completo en tareas de RoboTwin, comparando curvas de aprendizaje y rendimiento final.
- Reproducción de experimentos: dado que se proporcionan los pesos EMA y los pasos exactos de entrenamiento, los investigadores pueden reproducir las evaluaciones de NEO-75k y validar los resultados reportados.
- Desarrollo de nuevos métodos de co-entrenamiento: la inclusión del run con StarVLA ofrece una base para explorar técnicas de co-entrenamiento entre modelos VLA de distinta arquitectura.
- Análisis de representaciones internas: al tener checkpoints en diferentes pasos (5000, 10000, 15000, etc.), se puede analizar la evolución de las representaciones del modelo durante el entrenamiento.
- Fine-tuning para nuevas tareas: los pesos EMA pueden servir como inicialización para adaptar el modelo a tareas robóticas adicionales, aprovechando el conocimiento ya adquirido.
- Benchmarking de hardware: al ser un modelo de ~2B parámetros con pesos en fp32, puede utilizarse para medir el rendimiento de infraestructuras de inferencia robótica en tiempo real.

## Benchmarks y rendimiento

Según el README, se evaluó en el benchmark NEO-75k con 50 trials por punto de control. Los resultados reportados son:

| Paso de entrenamiento | Puntuación (50 trials) |
|---|---|
| 2500 | 10,60 |
| 5000 | 13,60 |
| 7500 | 14,80 |

Estos valores corresponden probablemente a la tasa de éxito en las tareas evaluadas. No se proporcionan comparaciones con otros modelos ni métricas adicionales (como MMLU, HumanEval, GSM8K), ya que el modelo no está orientado a tareas de lenguaje general.

## Requisitos de hardware

- Tamaño del repositorio: 177,5 GB, lo que implica que los checkpoints individuales ocupan alrededor de 1,77 GB cada uno (según el manifest, cada shard pesa ~1,77 GB). Esto sugiere que el modelo completo tiene ~2B parámetros en fp32 (2B * 4 bytes = 8 GB, pero los shards son de 1,77 GB, por lo que podría estar fragmentado en varios archivos).
- VRAM estimada para inferencia: no se especifica, pero para un modelo de 2B en fp32 se necesitan al menos 8 GB de VRAM solo para los pesos. Con overhead de activaciones y memoria adicional, se recomienda una GPU con al menos 16 GB.
- GPU recomendadas: RTX 4090 (24 GB) o A100 (40/80 GB) para inferencia cómoda. Para fine-tuning completo, se requeriría una GPU con más memoria (A100 80 GB o H100).
- Despliegue en consumer GPU: posible con cuantización (por ejemplo, 8 bits o 4 bits) si se dispone de las herramientas adecuadas, aunque el repositorio no incluye versiones cuantizadas.
- Opciones de despliegue: al ser un checkpoint de PyTorch, se puede cargar con el framework de entrenamiento original (`methods/lafm/vla_flow_ft.py`). No se mencionan soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo estándar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el contexto de RoboTwin o VLA de tamaño similar. La comparativa no está disponible.

## Limitaciones y advertencias

- Es un archivo de investigación, no un modelo listo para producción. No se proporcionan garantías de robustez ni seguridad en entornos reales.
- La licencia "other" es ambigua; se debe contactar al autor para conocer los términos exactos de uso, especialmente si se planea uso comercial.
- No se incluyen los estados del optimizador, por lo que no es posible reanudar el entrenamiento desde estos checkpoints.
- Los resultados de NEO-75k son parciales (solo tres pasos) y con 50 trials, lo que puede no ser estadísticamente significativo para todas las tareas.
- No hay información sobre sesgos, alucinaciones o limitaciones de idioma, ya que el modelo no procesa lenguaje natural de forma general.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un recurso reciente y poco validado por la comunidad.
- El tamaño del repositorio (177,5 GB) puede ser un obstáculo para su descarga en entornos con ancho de banda limitado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/weepiess2383/arc-robotwin
- No se han encontrado enlaces adicionales (papers, blogs, repositorios de código) en la información proporcionada.
