# zhoumiaosen/act-libero10-full-finetune

## Resumen

ACT-libero10-full-finetune es un modelo de políticas de robótica basado en ACT (Action Chunking Transformer), desarrollado por zhoumiaosen. Está entrenado desde cero, sin ningún backbone de vision-language preentrenado, sobre el subconjunto completo LIBERO-Long (libero_10) del dataset HuggingFaceVLA/libero. Su relevancia radica en servir como baseline from-scratch en una comparativa con modelos VLA preentrenados como GR00T-N1.5, SmolVLA, π0 y π0.5, permitiendo evaluar cuánto aporta un backbone VLM preentrenado. La arquitectura combina un codificador visual ResNet18 (inicializado con ImageNet1K) con un pequeño transformer codificador-decodificador y una cabeza de acciones de tipo VAE. Tiene aproximadamente 51,6 millones de parámetros entrenables y no procesa texto: su entrada es la imagen y su salida son chunks de 100 pasos de acción. Pese a que la pérdida de entrenamiento bajó de ~20,6 a 0,48 en 30.000 pasos, la tasa de éxito en la evaluación final es de 0/50 (0%).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT: ResNet18 (backbone visual) + transformer encoder/decoder con cabeza de acciones VAE |
| Parametros totales | 51.671.687 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de políticas de robótica sin entrada de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (sin entrada de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dataset de entrenamiento | HuggingFaceVLA/libero, episodios 0-378 (379 episodios de LIBERO-Long) |
| Pasos de entrenamiento | 30.000 |
| Batch size | 1 |
| Perdida final | 0,481 (L1 + kl_weight * KL) |
| Chunk size / n_action_steps | 100 / 100 |
| Tiempo de entrenamiento | ~33,5 minutos en una RTX 4090 |
| Libreria | LeRobot |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño original de ACT del proyecto ALOHA. El codificador visual es un ResNet18 preentrenado en ImageNet1K que se entrena conjuntamente; el transformer codificador-decodificador y la cabeza de acciones están inicializados aleatoriamente. El modelo no tiene ningún checkpoint generalista previo ("act_base"), es decir, no existe un training previo de VLA, lo que lo convierte en un baseline puro desde cero. Durante el entrenamiento se optimiza una función de pérdida compuesta por L1 entre las acciones predichas y las reales, más un término de divergencia KL ponderado, típico de la variante VAE de ACT. El modelo consume imágenes de la escena y predice un chunk de 100 pasos de acción (chunk_size=100), con un n_action_steps también de 100.

El dataset es LIBERO-Long (libero_10), que incluye 10 tareas de manipulación de larga duración con 379 episodios en total. Se utilizó la split de episodios original (0-378) y un presupuesto de 30.000 pasos de entrenamiento, con batch size 1, todo ello siguiendo el protocolo de comparación de los modelos hermanos. El resultado tras el entrenamiento es una pérdida final de 0,481, pero esto no se correlaciona con éxito en la evaluación.

## Capacidades

- Generación de acciones de robótica: el modelo produce secuencias de acciones de hasta 100 pasos (action chunking) para tareas de manipulación a partir de imágenes.
- Aprendizaje por imitación: puede entrenarse desde cero con demostraciones, sin necesidad de un checkpoint preentrenado.
- No soporta lenguaje: a diferencia de los modelos VLA comparados, ACT no recibe una instrucción textual; solo utiliza la información visual.
- Sin tool calling ni soporte de agentes: al ser un modelo de políticas de baja complejidad, no tiene capacidades de llamada a funciones, razonamiento multi-paso simbólico ni interacción agéntica fuera del bucle de control robótico.
- Visión: usa un ResNet18 como codificador visual preentrenado en ImageNet1K, con pesos entrenables durante el fine-tuning.
- Limitación crítica: la evaluación en LIBERO-Long muestra una tasa de éxito del 0%, lo que indica que la capacidad de generalización a las 10 tareas del benchmark es nula en esta configuración.

## Casos de uso

- Baseline de comparación en investigación de robótica: el modelo sirve como control desde cero en estudios de ablación sobre el valor de los backbones VLM preentrenados. Se puede entrenar en ~33 minutos en una RTX 4090 y usar sus resultados (0/50) como punto de referencia negativo.
- Evaluación de pipelines de entrenamiento en LeRobot: al tener un tamaño reducido (51,6 M parámetros) y cargarse como política ACT, es útil para probar configuraciones de LeRobot, depurar pipelines de datos o validar el protocolo de evaluación de LIBERO.
- Estudio de límites de la arquitectura original de ACT: el modelo muestra que su diseño, pensado para tareas únicas con muchas demostraciones, no escala a un benchmark de 10 tareas heterogéneas con solo 379 episodios y sin entrada de lenguaje.
- Punto de partida para fine-tuning en tareas de demostración única: aunque este checkpoint concreto no logra éxito, la arquitectura ACT podría adaptarse a un escenario con decenas de demostraciones de una misma tarea, como en ALOHA; no obstante, el usuario debería partir de un checkpoint preentrenado.
- Prueba de concepto de entrenamiento desde cero con presupuesto pequeño: el entrenamiento en 33,5 minutos con una sola GPU demuestra que es posible ajustar políticas de robótica pequeñas sin infraestructura masiva.
- Generación de datos negativos en comparativas de modelos: al ser un modelo sin pretraining y con éxito 0%, permite documentar en artículos que la mejora en pérdida no implica mejora en generalización.

## Benchmarks y rendimiento

Evaluado sobre las 10 tareas de LIBERO-Long (libero_10), con 5 episodios por tarea (50 evaluaciones en total), usando una semilla diferente a la del entrenamiento.

| Tarea (libero_10 id) | Descripcion | Fine-tuned, 30k steps (5 ep) | Near-random-init (5 ep) |
|---|---|---|---|
| 0 | poner tanto la sopa de letras como la salsa de tomate en la cesta | 0/5 | 0/5 |
| 1 | poner tanto la caja de queso crema como la mantequilla en la cesta | 0/5 | 0/5 |
| 2 | encender la vitroceramica y poner la cafetera moka encima | 0/5 | 0/5 |
| 3 | poner el cuenco negro en el cajon inferior del armario y cerrarlo | 0/5 | 0/5 |
| 4 | poner la taza blanca en el plato izquierdo y la taza amarilla y blanca en el plato derecho | 0/5 | 0/5 |
| 5 | coger el libro y colocarlo en el compartimento trasero del carrito | 0/5 | 0/5 |
| 6 | poner la taza blanca en el plato y el pudin de chocolate a la derecha del plato | 0/5 | 0/5 |
| 7 | poner tanto la sopa de letras como la caja de queso crema en la cesta | 0/5 | 0/5 |
| 8 | poner ambas cafeteras moka en la vitroceramica | 0/5 | 0/5 |
| 9 | poner la taza amarilla y blanca en el microondas y cerrarlo | 0/5 | 0/5 |
| **Total** | | **0/50 (0%)** | **0/50 (0%)** |

Según la model card, los modelos π0 y π0.5 también obtuvieron 0/50 en este mismo protocolo y presupuesto de entrenamiento, mientras que GR00T-N1.5 y SmolVLA forman parte de la misma comparativa, aunque sus resultados no se detallan aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,6 M de parámetros en fp32 (unos 207 MB solo de pesos), más las activaciones del ResNet18, se estima un consumo de entre 1 y 2 GB de VRAM. No se dispone de datos de cuantización.
- GPU utilizada en entrenamiento: una única RTX 4090, con tiempo de entrenamiento de ~33,5 minutos para 30.000 pasos.
- Compatibilidad con GPU de consumo: sí, al ser un modelo pequeño y con backbone ResNet18, se puede ejecutar en GPU de gama baja y media (RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: LeRobot (librería oficial). Dado que los pesos están en formato safetensors, también se pueden cargar manualmente, pero no se han publicado versiones cuantizadas (por ejemplo, GGUF) ni integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Backbone preentrenado | Éxito en LIBERO-Long |
|---|---|---|---|---|
| ACT-libero10-full-finetune | ACT from-scratch | 51,6 M | No (ResNet18 solo con ImageNet1K) | 0/50 (0%) |
| GR00T-N1.5-3B (fine-tune) | VLA | ~3 B (no disponible) | Sí | No disponible |
| SmolVLA (fine-tune) | VLA | No disponible | Sí | No disponible |
| π0 (fine-tune) | VLA | No disponible | Sí | 0/50 (0%) |
| π0.5 (fine-tune) | VLA | No disponible | Sí | 0/50 (0%) |

La model card indica que todos los checkpoints de esta comparativa comparten el mismo dataset, split de episodios, presupuesto de 30.000 pasos y protocolo de evaluación (5 episodios por tarea). La diferencia principal es que ACT no tiene ningún pretraining VLA, mientras que los demás parten de checkpoints base preentrenados (como lerobot/smolvla_base o lerobot/pi0_base). En el caso de π0 y π0.5, se obtuvo el mismo 0/50, lo que subraya que el pretraining por sí solo no garantiza éxito en LIBERO-Long.

## Limitaciones y advertencias

- Rendimiento nulo: la tasa de éxito en LIBERO-Long es 0/50 (0%), es decir, el modelo no completa ninguna de las tareas evaluadas. La pérdida de entrenamiento bajó de ~20,6 a 0,48, pero esto no se tradujo en comportamiento útil.
- Sin entrada de lenguaje: el modelo no recibe instrucciones textuales de la tarea, lo que limita su capacidad de distinguir objetivos cuando la escena visual es ambigua.
- Arquitectura original de ACT no escala a tareas múltiples: el diseño de action chunking y la formación con un pequeño número de demostraciones por tarea (379 episodios repartidos en 10 tareas) parecen insuficientes para la generalización esperada en un benchmark de larga duración.
- Sesgos: no se han publicado análisis de sesgos ni evaluación de riesgos en la información disponible.
- Alucinación: al no generar texto, el riesgo de alucinación no aplica. Sin embargo, el modelo puede producir acciones incoherentes o fallidas en escenarios fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el rendimiento actual es insuficiente para cualquier aplicación de producción.
- Contexto limitado: no hay una ventana de contexto de texto; la información contextual proviene únicamente de las imágenes y de las acciones pasadas dentro del chunk de 100 pasos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/zhoumiaosen/act-libero10-full-finetune
- Dataset HuggingFaceVLA/libero: https://huggingface.co/datasets/HuggingFaceVLA/libero
- LeRobot: https://github.com/huggingface/lerobot
- Paper ACT (ALOHA): https://tonyzhaozh.github.io/aloha/
- Benchmark LIBERO: https://github.com/Lifelong-Robot-Learning/LIBERO
- Modelo hermano GR00T: https://huggingface.co/zhoumiaosen/groot-n1p5-lora-libero10-full-finetune
- Modelo hermano SmolVLA: https://huggingface.co/zhoumiaosen/smolvla-libero10-full-finetune
- Modelo hermano π0: https://huggingface.co/zhoumiaosen/pi0-libero10-full-finetune
- Modelo hermano π0.5: https://huggingface.co/zhoumiaosen/pi05-libero10-full-finetune
