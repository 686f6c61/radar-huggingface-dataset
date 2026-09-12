# yuvalgot/diffusion_towel_fold1_20260912

## Resumen

`yuvalgot/diffusion_towel_fold1_20260912` es una política de control visuomotor entrenada con el método Diffusion Policy, que plantea el control motor como un proceso generativo de difusión en lugar de una regresión directa de acciones. El modelo ha sido entrenado y publicado con LeRobot, la librería de aprendizaje por imitación de Hugging Face, y su única tarea documentada es "fold the towel" (plegar una toalla). No es un modelo de lenguaje: es una política robótica de extremo a extremo que consume estado propioceptivo e imágenes y produce comandos de acción.

El desarrollo corresponde al usuario yuvalgot y se apoya en el artículo Diffusion Policy (arXiv:2303.04137). El modelo tiene 262.962.502 parámetros y un repositorio de 1,1 GB, coherente con pesos almacenados en precisión de 32 bits. La entrada de estado tiene 6 dimensiones y la de imagen es una cámara denominada `hand` con resolución 3x240x320; la salida es un vector de acción de 6 dimensiones, pensado para un robot de tipo `so_follower` (familia SO-100/SO-101 de bajo coste).

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de una política de difusión para manipulación con contacto intenso, entrenada sobre 60 episodios y 44.817 fotogramas a 30 FPS, y publicada con Apache-2.0. No hay resultados de evaluación publicados, ni demo, ni descargas o valoraciones en el momento de redactar esta ficha, por lo que debe tratarse como un artefacto de investigación sin validación externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de difusión para control visuomotor (Diffusion Policy); backbone concreto no especificado en la model card |
| Parametros totales | 262.962.502 |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No aplica; horizonte de observación y de predicción de acciones no disponible |
| Tipos de cuantizacion | No disponible; los pesos del repositorio se sirven en precisión de 32 bits |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Autor | yuvalgot |
| Libreria | LeRobot (entrenado con la version 0.6.2) |
| Pipeline | robotics |
| Tipo de robot | `so_follower` |
| Camaras | `hand` |
| Entradas | `observation.state` (6,), `observation.images.hand` (3, 240, 320) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 1,1 GB |
| Fecha de creacion | 2026-09-12 |
| Fecha de actualizacion | 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card identifica el método como Diffusion Policy, que trata el control visuomotor como un proceso generativo de difusión: en lugar de predecir una acción única mediante una función determinista, el modelo aprende a generar trayectorias de acción multimodales y suaves mediante un proceso iterativo de eliminación de ruido. Según el artículo de referencia, esta formulación destaca en tareas de manipulación con contacto intenso, precisamente el perfil de "plegar una toalla". El backbone concreto (UNet convolucional o transformer, número de pasos de difusión, tipo de scheduler, horizonte de predicción y de observación) no se detalla en la información disponible.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `yuvalgot/towel_fold1_aug_2108_20260821_115238`: 60 episodios, 44.817 fotogramas a 30 FPS, una única instrucción de tarea ("fold the towel") y una única cámara. La configuración documentada es de 100.000 pasos, batch size 8, optimizador Adam, learning rate 0,0001 y semilla 1000. No se menciona ningún ajuste posterior con RLHF o DPO, ni aumentos de datos más allá de lo que sugiere el sufijo `aug` del nombre del dataset, ni ningún detalle sobre el preprocesado o la normalización de observaciones y acciones.

## Capacidades

- Generación de trayectorias de acción de 6 grados de libertad para un robot `so_follower`, a partir de estado propioceptivo de 6 dimensiones y una imagen de cámara de 240x320 píxeles.
- Ejecución de una única tarea de manipulación: plegar una toalla.
- Generación de acciones multimodales y suavizadas, ventaja típica de las políticas de difusión frente a políticas deterministas en tareas con contacto y múltiples modos válidos de solución.
- Aprendizaje por imitación: reproduce el comportamiento demostrado en el dataset, sin componente de refuerzo ni de planificación simbólica.
- Compatibilidad con el ecosistema LeRobot: entrenamiento, evaluación y ejecución mediante las herramientas `lerobot-train` y `lerobot-rollout`.
- No soporta tool calling ni function calling, no es un agente conversacional y no tiene capacidades multilingües, de código, matemáticas, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Reproducción de la tarea en el robot original: ejecutar la política sobre un SO-100/SO-101 follower equipado con una cámara en la mano mediante `lerobot-rollout` con `--policy.path=yuvalgot/diffusion_towel_fold1_20260912` y la tarea "fold the towel", útil para comprobar la reproducibilidad del entrenamiento.
- Línea base para investigación en aprendizaje por imitación: comparar una política de difusión frente a alternativas deterministas como ACT sobre la misma tarea y el mismo dataset, aislando el efecto del método de modelado de acciones.
- Reentrenamiento y ajuste fino: partir de este punto de control con `lerobot-train --policy.type=diffusion` sobre datasets ampliados (por ejemplo, variantes de plegado de otras prendas) para estudiar transferencia y olvido catastrófico.
- Estudio de robustez en manipulación con contacto: evaluar la tasa de éxito ante cambios de iluminación, posición inicial de la toalla, tipo de tejido o presencia de distractores, aprovechando que la política genera distribuciones de acción en lugar de una salida única.
- Docencia y divulgación en robótica de bajo coste: el par robot `so_follower` más LeRobot permite montar un laboratorio completo de imitación con hardware asequible y un modelo de 263 millones de parámetros que cabe en GPU de consumo.
- Automatización de tareas textiles en laboratorio: como prueba de concepto de plegado automatizado en entornos controlados, siempre que se asuma que la política solo está validada para la tarea y el montaje concretos del dataset.
- Análisis de datos de demostración: combinado con el espacio `lerobot/visualize_dataset` sobre el dataset asociado, sirve para inspeccionar la calidad de las demostraciones y su relación con las acciones generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la sección de evaluación con la frase "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito en robot real, ni número de ensayos, ni comparaciones cuantitativas con otras políticas. Los únicos datos de rendimiento indirectos son los del entrenamiento: 100.000 pasos con batch size 8 sobre 44.817 fotogramas a 30 FPS.

## Requisitos de hardware

- VRAM estimada para inferencia: los 262.962.502 parámetros ocupan aproximadamente 1,05 GB en fp32 y 0,53 GB en fp16/bf16; sumando activaciones y preprocesado de imagen a batch 1, una estimación razonable es de 2 a 4 GB en fp32 y de 1 a 2 GB en media precisión. Son estimaciones, no cifras publicadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la práctica. Funcionan RTX 3050, RTX 3060, RTX 4060, RTX 4090, así como T4 o L4 en servidor. No se necesita A100 ni H100 para inferencia.
- Cabe en GPU de consumo: sí, con holgura, incluidas las gamas de entrada actuales.
- Despliegue: la vía documentada es el CLI de LeRobot (`lerobot-rollout` con `--strategy.type=base`), sobre PyTorch con CUDA (`--policy.device=cuda` en entrenamiento). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que son herramientas específicas de modelos de lenguaje. La exportación a ONNX o TensorRT no se menciona en la información disponible.
- Latencia y throughput: no publicados. La política se entrena sobre datos capturados a 30 FPS y las políticas de difusión requieren varios pasos de eliminación de ruido por predicción, por lo que la latencia de inferencia es mayor que la de una política determinista del mismo tamaño; no hay mediciones disponibles en la model card.
- CPU: la inferencia es viable en CPU por el reducido tamaño del modelo, pero es probable que no alcance el ritmo de control de 30 Hz; no hay datos que lo confirmen.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yuvalgot/diffusion_towel_fold1_20260912` | Política de difusión (Diffusion Policy) | 262.962.502 | Estado (6,) + imagen 240x320 | Apache-2.0 | Hugging Face, librería LeRobot |
| ACT (Action Chunking Transformer) en LeRobot | Transformer de chunking de acciones, determinista | No disponible en la información proporcionada | Estado + imágenes, configuración variable | Apache-2.0 (LeRobot) | Disponible como `--policy.type=act` en LeRobot |
| SmolVLA | Modelo visión-lenguaje-acción | No disponible en la información proporcionada | Estado + imágenes + instrucción en lenguaje natural | No disponible en la información proporcionada | Ecosistema LeRobot |
| Políticas de difusión genéricas (artículo arXiv:2303.04137) | Política de difusión | Depende de la configuración | Estado + observaciones visuales | No disponible | Implementación de referencia pública |

La comparación cuantitativa no es posible con los datos disponibles: no hay parámetros, ventanas de contexto ni tasas de éxito publicadas para las alternativas en la información proporcionada, y este modelo tampoco publica evaluación. La diferencia conceptual sí es clara: las políticas de difusión modelan distribuciones multimodales de acción y suelen comportarse mejor en tareas con contacto, mientras que ACT produce un chunk de acciones de forma determinista y con menor coste de inferencia.

## Limitaciones y advertencias

- Especialización extrema: solo está entrenado para la tarea "fold the towel" con un robot `so_follower` y una cámara `hand`. No generaliza a otras tareas, otros robots ni otras configuraciones de cámara sin reentrenamiento.
- Sin evaluación publicada: no existe ninguna tasa de éxito medida, ni en robot real ni en simulación. Cualquier uso en producción parte de una validación a ciegas.
- Dataset pequeño: 60 episodios y 44.817 fotogramas de una única tarea. Es un volumen reducido, con riesgo de sobreajuste a las posiciones, la iluminación y el tipo de toalla presentes en la recogida de datos.
- Sesgos heredados de las demostraciones: la política imita el estilo, la velocidad y las trayectorias del operador que grabó los datos, incluidas posibles asimetrías o hábitos.
- Riesgo de fallo en el mundo real: en manipulación con contacto, pequeños cambios de fricción, peso del tejido o calibración del robot pueden provocar fallos; no hay métricas de robustez.
- Ausencia de demo y de material de validación: no hay vídeo, GIF ni resultados de terceros que confirmen el comportamiento del modelo.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de redactar la ficha, lo que implica que no ha pasado por revisión ni reproducción externa.
- Idiomas y capacidades de lenguaje: no aplica; no debe presentarse como un modelo conversacional ni usarse para tareas de texto.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución, pero el usuario debe verificar por su cuenta el cumplimiento y el comportamiento real del modelo; la licencia no aporta ninguna garantía de funcionamiento.
- Metadatos a revisar: las fechas del repositorio (2026-09-12) son posteriores a la fecha habitual de consulta y el nombre del modelo incluye la misma fecha, un detalle a tener en cuenta al integrarlo en pipelines con control de versiones.
- Detalles de reproducibilidad ausentes: no se especifican el backbone, los pasos de difusión, el horizonte de predicción ni el preprocesado exacto, lo que dificulta reproducir el entrenamiento a partir de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuvalgot/diffusion_towel_fold1_20260912
- Dataset de entrenamiento: https://huggingface.co/datasets/yuvalgot/towel_fold1_aug_2108_20260821_115238
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=yuvalgot/towel_fold1_aug_2108_20260821_115238
- Artículo Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
