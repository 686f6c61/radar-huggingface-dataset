# vis22/plates_stack_v2

## Resumen

`vis22/plates_stack_v2` es una política robótica de imitación entrenada con ACT (Action Chunking with Transformers) y publicada en Hugging Face mediante la librería LeRobot. La desarrolla el usuario `vis22` y su objetivo es resolver una tarea concreta de manipulación: apilar todos los platos sobre el plato azul y volver a la posición de reposo. No es un modelo de lenguaje: no procesa ni genera texto, sino que consume observaciones visuomotoras y produce comandos de acción de 7 dimensiones.

El modelo tiene 51.670.663 parámetros y un peso en el repositorio de 0,2 GB en formato safetensors. Está asociado al artículo arXiv 2304.13705, que introduce el método ACT, y se distribuye bajo licencia Apache 2.0. Su relevancia es práctica: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación (grabación con teleoperación, entrenamiento con LeRobot y despliegue en un robot real) sobre el brazo `piper_follower`, con dos cámaras de entrada (`cam_global` y `cam_gripper`).

Al tratarse de un checkpoint de tarea única, su interés está en el prototipado y la investigación en robótica más que en un uso generalista. La model card no incluye resultados de evaluación en robot real, y el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), método de aprendizaje por imitación que predice trozos de acción (*action chunks*) en lugar de pasos individuales |
| Parametros totales | 51.670.663 (~51,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la model card no especifica la ventana de observaciones; el método consume observaciones del robot y predice un chunk de acciones) |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas; solo pesos safetensors) |
| Idiomas soportados | No aplica / no disponible (política visuomotora; no tiene entrada ni salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `lerobot`) |
| Tipo de robot | `piper_follower` |
| Camaras de entrada | `cam_global`, `cam_gripper` |
| Entradas | `observation.state` STATE `(7,)`; `observation.images.cam_global` VISUAL `(3, 480, 640)`; `observation.images.cam_gripper` VISUAL `(3, 480, 640)` |
| Salidas | `action` ACTION `(7,)` |
| Dataset de entrenamiento | `vis22/plates_stack_v2` (49 episodios, 22.026 fotogramas, 30 FPS) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que aprende de datos teleoperados y predice chunks de acciones cortos en lugar de una única acción por paso, lo que reduce el problema de la varianza en la predicción por paso y permite ejecutar movimientos más suaves y consistentes. La model card enlaza el artículo fundacional del método (arXiv 2304.13705) y no detalla la composición interna del checkpoint más allá de su naturaleza transformer y de las dimensiones de entrada y salida: estado del robot de 7 dimensiones más dos vistas RGB de 480 × 640, y vector de acción de 7 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.1 durante 100.000 pasos, con tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. Los datos provienen del dataset `vis22/plates_stack_v2`, compuesto por 49 episodios y 22.026 fotogramas grabados a 30 FPS para la tarea "Stack all the plates on top of the blue plate, then return to home position". No se documenta en la información disponible el número de tokens o transiciones efectivas más allá de los pasos de entrenamiento, ni si hubo fases adicionales de ajuste tipo RLHF o DPO (no procede en este tipo de política).

## Capacidades

- Control visuomotor de un brazo robótico `piper_follower` con acciones de 7 dimensiones a partir de dos cámaras RGB y el estado articular.
- Predicción de chunks de acción, lo que permite ejecutar secuencias de movimiento coherentes en lugar de decisiones aisladas.
- Ejecución de la tarea concreta de apilar platos sobre un plato azul y regresar a la posición de reposo.
- Aprendizaje por imitación a partir de datos teleoperados; no requiere recompensas ni simulación.
- Integración nativa con LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento o *fine-tuning*).
- Reentrenamiento sobre nuevos datasets con la misma configuración de tarea.
- Soporte de tool calling / function calling: no.
- Soporte de agentes y razonamiento multi-paso simbólico: no.
- Capacidades multilingües: no aplica.
- Capacidades especiales: no se documentan modos de razonamiento, visión generalista, audio ni otras modalidades fuera de las dos cámaras de la política.

## Casos de uso

- Automatización de apilado de platos en una célula robótica de laboratorio: la política toma `observation.state` y las dos imágenes y emite acciones a 7 dimensiones, de modo que puede desplegarse directamente sobre un `piper_follower` con las cámaras en las posiciones usadas durante la grabación.
- Base de *fine-tuning* para tareas de *pick-and-place* similares: al ser un checkpoint ACT de 51,7 M de parámetros, reentrenarlo con un dataset propio es viable en una GPU de gama media y sirve como inicialización razonable para manipulación de objetos planos.
- Banco de pruebas para comparar métodos de imitación: permite contrastar ACT frente a otras políticas compatibles con LeRobot usando el mismo dataset de 49 episodios y 22.026 fotogramas como referencia reproducible.
- Docencia y formación en aprendizaje por imitación: el flujo completo (grabación teleoperada, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) puede reproducirse de principio a fin con un brazo de bajo coste.
- Validación de infraestructura de inferencia robótica: por su tamaño reducido, es útil para medir latencia y estabilidad del bucle de control en el *host* del robot antes de pasar a políticas de mayor tamaño.
- Pruebas de robustez ante cambios de entorno: repitiendo la tarea con variaciones de iluminación, posición inicial de los platos o pequeños distractores se puede caracterizar hasta qué punto el modelo generaliza más allá de los 49 episodios grabados.
- Integración en un pipeline de datos y reentrenamiento continuo: cada nueva sesión de teleoperación puede añadirse al dataset y lanzar un nuevo entrenamiento con los mismos hiperparámetros documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación explícitamente vacía ("No evaluation results have been provided for this policy yet"), por lo que no hay tasas de éxito en robot real ni métricas numéricas verificables para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 51,67 M de parámetros, sin contar activaciones de los codificadores visuales): ~207 MB en FP32, ~103 MB en FP16/BF16, ~52 MB en int8. Estas cifras son estimaciones por tamaño de pesos, no medidas publicadas.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs integradas o iGPU con suficiente memoria compartida. En la práctica el cuello de botella es el preprocesado de dos imágenes de 480 × 640 a 30 FPS, no el tamaño del modelo.
- GPU de centro de datos (A100, H100) no son necesarias para inferencia; solo tendrían sentido para entrenamientos a gran escala con datasets mucho mayores.
- El entrenamiento documentado usó `--policy.device=cuda` con lote 8 y 100.000 pasos sobre un dataset de 0,2 GB, por lo que es asumible en una GPU de gama media.
- Opciones de despliegue: la vía oficial es LeRobot (`lerobot-rollout` con `--policy.path=vis22/plates_stack_v2`, o `lerobot-train` para reentrenar). No se documentan recetas específicas para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no aplican a este tipo de política.
- Latencia y throughput: no se publican mediciones. Como referencia operativa, el bucle de control debería ejecutarse a 30 Hz para coincidir con la frecuencia de grabación del dataset, lo que exige que la inferencia por paso sea inferior a ~33 ms en el equipo que controla el robot.

## Comparativa con modelos similares

No se ha proporcionado información de benchmarks ni de parámetros de modelos alternativos en la búsqueda web realizada (los resultados devueltos no eran relevantes). La comparación se limita a categorías de políticas compatibles con LeRobot, con los campos no documentados marcados como no disponibles.

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `vis22/plates_stack_v2` | ACT (imitación, chunking de acciones) | 51.670.663 | No disponible | Sin resultados publicados | Apache 2.0 | Hugging Face, vía LeRobot |
| Diffusion Policy | Política de imitación basada en difusión | No disponible en la información proporcionada | No disponible | No disponible | No disponible | Implementación disponible en LeRobot (no verificado en las fuentes aportadas) |
| SmolVLA | Política visión-lenguaje-acción | No disponible en la información proporcionada | No disponible | No disponible | No disponible | Ecosistema Hugging Face / LeRobot (no verificado en las fuentes aportadas) |
| `pi0` / `pi0.5` (Physical Intelligence) | Política visión-lenguaje-acción de propósito general | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No verificado en las fuentes aportadas |

## Limitaciones y advertencias

- Ámbito de tarea único: la política está entrenada exclusivamente para "Stack all the plates on top of the blue plate, then return to home position" sobre 49 episodios. No se espera un comportamiento correcto fuera de esa tarea.
- Dependencia del *embodiment*: está entrenada para el robot `piper_follower` con un estado de 7 dimensiones. Usarla en otro robot o con otra cinemática requiere reentrenamiento.
- Dependencia de la configuración de cámaras: los nombres `cam_global` y `cam_gripper` deben coincidir exactamente con las claves de observación del entrenamiento, y la posición, resolución (480 × 640) y frecuencia (30 FPS) de las cámaras afectan directamente al rendimiento.
- Sin evaluación publicada: no hay tasa de éxito medida, ni número de ensayos, ni caracterización de robustez ante cambios de iluminación, posición de objetos o distractores. Cualquier uso en producción exige una validación propia.
- Riesgo de sobreajuste al escenario: con 22.026 fotogramas de un único entorno, es probable que el modelo dependa de detalles visuales del fondo o de la iluminación concretos.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero existe el riesgo equivalente de generar acciones plausibles pero incorrectas ante observaciones fuera de distribución, con posible colisión o daño al robot.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas: no aplica; el modelo no procesa lenguaje natural.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de copyright y licencia y se indique los cambios realizados. No se imponen restricciones adicionales conocidas.
- Advertencias de seguridad: cualquier despliegue en hardware real debe hacerse con límites de par, paradas de emergencia y espacio de trabajo despejado; una política de imitación puede producir movimientos bruscos fuera de distribución.
- Metadatos: las fechas del repositorio (creación y actualización el 18 de septiembre de 2026) son posteriores a la fecha de esta consulta; se reproducen tal como aparecen en la información proporcionada.
- Madurez: 0 descargas y 0 "likes" en el momento de la consulta, sin historial de uso comunitario que permita contrastar su fiabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vis22/plates_stack_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/vis22/plates_stack_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=vis22/plates_stack_v2
- Artículo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705 (arXiv 2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de la CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (*rollout*): https://huggingface.co/docs/lerobot/main/en/inference
- La búsqueda web realizada no devolvió resultados relevantes: únicamente páginas de soporte de descarga de Google Chrome en varios idiomas, sin relación con el modelo.
