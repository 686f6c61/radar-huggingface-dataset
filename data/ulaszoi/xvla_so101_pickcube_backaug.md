# ulasZoi/xvla_so101_pickcube_BackAUG

## Resumen

X-VLA es un marco de tipo Vision-Language-Action (VLA) basado en *soft prompting* y *flow matching*, descrito en el artículo arXiv 2510.10274. La idea central es tratar cada configuración de robot o hardware como una "tarea" distinta, codificada mediante un conjunto reducido de *Soft Prompt embeddings* aprendibles. De este modo, un único modelo puede reconciliar morfologías de robot, sensores y espacios de acción heterogéneos sin necesidad de cabezas específicas por plataforma.

El repositorio `ulasZoi/xvla_so101_pickcube_BackAUG` es un *fine-tuning* del modelo base `lerobot/xvla-base` sobre el conjunto de datos `ulasZoi/smolvla_pickcube_all_UnrealBackgroundAugmentation`. Está especializado en una única tarea de manipulación ("pick up the cube") sobre un robot de tipo `so_follower` (SO-101) con una cámara frontal, y produce directamente un vector de acción de 6 dimensiones.

Se trata de un modelo pequeño para los estándares actuales de VLA: 879.687.256 parámetros (unos 880 M) según los pesos en safetensors, con un repositorio de 1,8 GB. Su relevancia práctica es la de servir como política de imitación reproducible y de bajo coste computacional dentro del ecosistema LeRobot, entrenable y ejecutable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Vision-Language-Action con soft prompts y flow matching (X-VLA) |
| Parametros totales | 879.687.256 (~880 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se publican en safetensors; no se declaran cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible. La instrucción de tarea usada en el entrenamiento está en inglés ("pick up the cube") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

X-VLA se define en la model card como un marco VLA con *soft prompting* y *flow matching*. A diferencia de los enfoques que añaden cabezas de acción específicas por robot, codifica cada configuración de hardware como una "tarea" mediante un conjunto pequeño de embeddings de *Soft Prompt* aprendibles. Esto permite que un mismo modelo base abarque morfologías, sensores y espacios de acción diversos. En esta variante concreta, la política consume tres entradas visuales (`observation.images.image` de 3×256×256, `observation.images.image2` de 3×256×256 y `observation.images.image3` de 3×224×224), un vector de estado de 8 dimensiones (`observation.state`) y emite un vector de acción de 6 dimensiones.

El *fine-tuning* se realizó con LeRobot 0.6.2 durante 25.000 pasos, con tamaño de lote 16, optimizador `xvla-adamw`, tasa de aprendizaje 1e-4 y semilla 1000. El conjunto de datos de entrenamiento contiene 486 episodios y 152.022 fotogramas capturados a 30 FPS, con una única tarea anotada: "pick up the cube". El nombre del *dataset* indica que se aplicó una aumento de fondos generados con Unreal Engine (`UnrealBackgroundAugmentation`), una técnica habitual para mejorar la robustez de la política frente a cambios de iluminación y de escena. No se declara en la información disponible el uso de RLHF, DPO ni fases de *reinforcement learning* posteriores al entrenamiento supervisado.

## Capacidades

- Generación de acciones de control continuo de 6 grados de libertad para un robot `so_follower` (SO-101) a partir de observaciones visuales y de estado.
- Ejecución de la tarea de manipulación "pick up the cube" (coger un cubo) siguiendo una instrucción de tarea en lenguaje natural.
- Fusión de tres flujos visuales simultáneos (`image`, `image2`, `image3`) con resoluciones 256×256 y 224×224, más un vector de estado de 8 dimensiones.
- Condicionamiento por instrucción textual de tarea, heredado del modelo base VLA (el prompt empleado en el entrenamiento está en inglés).
- Robustez parcial ante variaciones de fondo gracias al aumento con escenarios de Unreal Engine aplicado durante la recolección de datos.
- Integración nativa con el ecosistema LeRobot para *rollout* en robot real (`lerobot-rollout`) y para reentrenamiento (`lerobot-train`).
- No se declaran capacidades de *tool calling*, *function calling*, razonamiento multi-paso explícito, visión general de propósito, audio ni modo de pensamiento (*thinking mode*).

## Casos de uso

- Manipulación pick-and-place sobre SO-101: la política se ejecuta con `lerobot-rollout --strategy.type=base` sobre un brazo `so_follower` y realiza la tarea de coger el cubo de forma autónoma durante una duración configurable. Es el caso de uso para el que fue entrenada explícitamente.
- Banco de pruebas de imitación en robótica de bajo coste: al tener 880 M de parámetros, sirve como referencia reproducible para comparar técnicas de *fine-tuning* (learning rate, pasos, aumentos de datos) sin requerir clústeres de GPU.
- Investigación en robustez visual: el *dataset* incluye aumento de fondos con Unreal Engine, de modo que el modelo es un punto de partida para estudiar la transferencia de simulación a realidad y la sensibilidad a distractores de fondo.
- Reentrenamiento con datos propios: partiendo de `lerobot/xvla-base` y siguiendo el flujo `lerobot-train --policy.path=lerobot/xvla-base`, se puede adaptar la política a nuevas tareas de manipulación cambiando únicamente el *dataset*.
- Validación de *pipelines* de hardware y calibración: útil en laboratorios que montan por primera vez un SO-101, ya que permite verificar cámara, puerto y calibración con una política que ya funciona en esa morfología.
- Docencia y divulgación: ejemplo completo y ligero de un flujo VLA de extremo a extremo (recolección de datos, entrenamiento, *rollout*) que cabe en una GPU de consumo.
- Evaluación de velocidad de control: el *dataset* se grabó a 30 FPS, por lo que el modelo es adecuado para medir si una política VLA de este tamaño sostiene bucles de control a esa frecuencia en distintas GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente: "_No evaluation results have been provided for this policy yet._", y la plantilla de tabla de evaluación (tarea, ensayos, éxitos, tasa de éxito) aparece vacía.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,8 GB en bf16/fp16 (coincide con el tamaño del repositorio, 1,8 GB) y en torno a 3,5 GB en fp32. Estimaciones calculadas a partir de los 879.687.256 parámetros; no están publicadas por el autor.
- VRAM total de inferencia: se debe añadir el coste de las tres entradas visuales y de las activaciones del transformer, por lo que un presupuesto realista de 4-6 GB en bf16 es prudente, aunque no está confirmado en la información disponible.
- GPU recomendadas: no declaradas por el autor. Por tamaño, cualquier GPU con al menos 8 GB de VRAM debería ser suficiente; se espera compatibilidad con RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier tarjeta con 8 GB o más de VRAM en bf16. No confirmado oficialmente.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento) sobre PyTorch/CUDA. No se declara soporte para vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no son adecuados para una política de acción continua.
- Latencia y throughput: no disponibles. El único dato relacionado es que los datos de entrenamiento se capturaron a 30 FPS, lo que sugiere que el bucle de control objetivo opera en ese orden de frecuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `ulasZoi/xvla_so101_pickcube_BackAUG` | ~880 M | VLA (soft prompt + flow matching), fine-tuning de tarea única | No disponible | Apache 2.0 | Especializado en "pick up the cube" sobre `so_follower` |
| `lerobot/xvla-base` | No disponible en esta ficha | VLA base X-VLA | No disponible | No disponible en esta ficha | Modelo del que deriva este *fine-tuning*; entrenado para múltiples morfologías mediante soft prompts |
| `lerobot/smolvla-base` | No disponible en esta ficha | VLA compacto (SmolVLA) | No disponible | No disponible en esta ficha | Alternativa de tamaño reducido dentro del ecosistema LeRobot; el *dataset* usado aquí lleva "smolvla" en su nombre, lo que sugiere que se empleó para generar datos comparables |
| Políticas VLA de mayor escala (por ejemplo, familias tipo pi0 o GR00T) | No disponible en esta ficha | VLA de propósito general | No disponible | No disponible en esta ficha | No se dispone de datos verificados en la información proporcionada; no se incluyen cifras para no introducir datos no confirmados |

La comparación cuantitativa con alternativas no puede completarse: la información disponible no incluye las especificaciones ni los resultados de los modelos competidores, y no se han publicado métricas de éxito para esta política.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea ("pick up the cube"), un único tipo de robot (`so_follower`) y una única configuración de cámara (`front`). No es un modelo de propósito general.
- Sin evaluación publicada: la model card no proporciona tasa de éxito, número de ensayos ni condiciones de prueba, por lo que no se puede afirmar nada sobre su fiabilidad real en producción.
- Riesgo de sobreajuste al entorno de recogida: aunque el *dataset* aplica aumento de fondos con Unreal Engine, no se documenta variación de iluminación, posiciones de objeto o presencia de distractores físicos.
- Dependencia de la calibración y del montaje: los nombres de cámara deben coincidir exactamente con las claves de observación del entrenamiento (`observation.images.image`, `image2`, `image3`) y el robot debe estar calibrado; cualquier desviación degrada el comportamiento.
- Estado de repositorio: 0 descargas y 0 *likes* en el momento de la consulta, sin historial de uso ni validación por parte de terceros.
- Idiomas: no se declaran idiomas soportados; la instrucción de tarea está en inglés.
- Contexto: no se declara longitud de contexto ni memoria de episodios previos; se desconoce si la política mantiene estado más allá del fotograma actual.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el usuario debe verificar las licencias del modelo base (`lerobot/xvla-base`) y del *dataset* asociado antes de un despliegue comercial.
- Sesgos: no hay información disponible sobre sesgos de comportamiento, y en robótica estos se manifiestan como sesgos de posición, color de objeto o distribución de escenas presentes en los 486 episodios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ulasZoi/xvla_so101_pickcube_BackAUG
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/ulasZoi/smolvla_pickcube_all_UnrealBackgroundAugmentation
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ulasZoi/smolvla_pickcube_all_UnrealBackgroundAugmentation
- Artículo X-VLA (arXiv 2510.10274): https://huggingface.co/papers/2510.10274
- Guía de X-VLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
