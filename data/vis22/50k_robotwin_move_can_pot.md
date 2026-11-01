# vis22/50K_Robotwin_move_can_pot

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, orientado a control robótico de bajo coste computacional. La variante publicada por el usuario vis22 bajo el identificador `vis22/50K_Robotwin_move_can_pot` es un ajuste fino (fine-tuning) del checkpoint base `lerobot/smolvla_base` sobre el conjunto de datos `robotwin_move_can_pot_piper_v30`, especializado en la tarea concreta de mover una lata o bote con un manipulador robótico Piper. El modelo resuelve el problema de generar acciones motrices continuas a partir de observaciones visuales e instrucciones en lenguaje natural, sin necesidad de GPUs de centro de datos.

Con 450 millones de parámetros (~0,45 B) y un repositorio de apenas 0,9 GB en formato safetensors, el modelo está pensado para despliegue en hardware de consumo. No es un modelo de lenguaje general: su salida es una secuencia de acciones para un robot, no texto libre, lo que condiciona por completo sus casos de uso y su evaluación. La licencia Apache 2.0 permite uso comercial sin restricciones significativas, y su integración con la librería LeRobot facilita el entrenamiento, la evaluación y el despliegue mediante comandos de línea de órdenes.

Es relevante ahora porque los VLA compactos están desplazando a los pipelines clásicos de percepción-planificación-control en robótica de investigación, al permitir políticas de extremo a extremo ejecutables en una sola GPU consumer. Este checkpoint concreto representa un ejemplo de especialización por tarea sobre una base preentrenada, un patrón habitual en robótica industrial y de laboratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, según SmolVLA (arXiv:2506.01844) |
| Parametros totales | 450.046.176 (~0,45 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en lenguaje natural, idioma no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en SmolVLA, una arquitectura VLA compacta que combina un codificador visual, un componente de lenguaje y un cabezal de acciones que produce comandos motrices de extremo a extremo. La información disponible no detalla la composición interna exacta (número de capas, dimensión de las representaciones, mecanismo de fusión visión-lenguaje) ni el esquema de atención; estos detalles deben consultarse en el paper arXiv:2506.01844. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face y este checkpoint es un ajuste fino supervisado sobre demostraciones de la tarea `move_can_pot` recogidas con el robot Piper (dataset `robotwin_move_can_pot_piper_v30`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras optimizaciones posteriores al ajuste supervisado. El entrenamiento se realizó con la herramienta `lerobot-train`, que escribe checkpoints en `outputs/train/<repo>/checkpoints/`. La model card menciona la posibilidad de entrenar con `--policy.type=act`, aunque el modelo publicado corresponde a la familia SmolVLA; conviene verificar la configuración exacta en la documentación de LeRobot antes de reproducir el entrenamiento.

## Capacidades

- Generación de acciones robóticas de extremo a extremo a partir de observaciones visuales e instrucciones de tarea.
- Control de manipuladores tipo Piper para la tarea específica de mover una lata o bote (`move_can_pot`).
- Aprendizaje por imitación a partir de demostraciones teleoperadas (dataset Robotwin).
- Integración nativa con LeRobot para entrenamiento, evaluación y registro de episodios (`lerobot-record`).
- Ejecución en hardware de consumo gracias a su tamaño reducido (~0,45 B de parámetros).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, generación de texto libre, matemáticas ni visión general fuera del bucle de control robótico.
- Capacidades multilingües: no disponibles; el modelo no es un modelo de lenguaje conversacional.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo recibe la imagen de la escena y la instrucción de mover la lata, y emite la trayectoria de acciones para el manipulador Piper; es adecuado por su especialización en esa tarea y su bajo coste de inferencia.
- Validación de políticas VLA en investigación: sirve como referencia ajustada para comparar el rendimiento de SmolVLA frente a políticas ACT o Diffusion Policy sobre el mismo dataset Robotwin.
- Despliegue en estaciones de trabajo con una sola GPU consumer: al ocupar menos de 1 GB en safetensors, cabe en GPUs de gama media y permite iterar rápido en experimentos de robótica.
- Reproducción de experimentos con LeRobot: el flujo `lerobot-record` con `--policy.path` permite evaluar el checkpoint en 10 episodios y comparar con el modelo base.
- Prototipado de tareas de manipulación en entornos educativos: estudiantes pueden ajustar el modelo sobre sus propios datasets y evaluar políticas sin infraestructura de centro de datos.
- Integración en pipelines de evaluación automatizada: el modelo puede ejecutarse en bucle cerrado sobre un simulador o robot real para medir tasa de éxito de la tarea `move_can_pot`.
- Base para fine-tuning sobre nuevas tareas de manipulación: al partir de `lerobot/smolvla_base`, el checkpoint sirve como punto de partida para transferir a otras tareas con pocas demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~0,45 B de parámetros en safetensors (0,9 GB de repo), la inferencia en precisión nativa requiere del orden de 1-2 GB de VRAM, aunque no se dispone de una cifra oficial.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente, incluyendo RTX 3060, RTX 4060 o superiores.
- Cabe en GPU consumer: sí, por el tamaño del checkpoint, aunque no se confirma oficialmente.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de inferencia en CUDA (`--policy.device=cuda`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de acciones robóticas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vis22/50K_Robotwin_move_can_pot | 450 M | no disponible | move_can_pot (Piper) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | VLA general base | no disponible | Hugging Face |
| Políticas ACT (LeRobot) | no disponible | no disponible | imitación robótica | no disponible | LeRobot |
| Diffusion Policy | no disponible | no disponible | imitación robótica | no disponible | Repos académicos |

La información disponible no permite comparar métricas de rendimiento entre estos modelos; la comparativa se limita a la categoría y la licencia.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está ajustado para la tarea `move_can_pot` con el robot Piper; su rendimiento fuera de esa tarea o con otro manipulador no está garantizado.
- No es un modelo de lenguaje: no debe esperarse generación de texto, razonamiento simbólico ni conversación.
- Riesgo de sobreajuste al dataset de entrenamiento (`robotwin_move_can_pot_piper_v30`), con posible degradación ante cambios de iluminación, posición de cámara u objetos distintos.
- No se documentan sesgos, pero al ser un modelo visual hereda los sesgos de los datos de demostración (condiciones de laboratorio, objetos y entornos limitados).
- Riesgo de alucinación en el sentido de acciones incorrectas o inseguras: en robótica real, una política errónea puede provocar colisiones; se recomienda supervisión y límites de seguridad en el controlador.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias del modelo base y del dataset utilizados.
- Idiomas y contexto: no disponibles; la instrucción de tarea debe proporcionarse en el formato esperado por el modelo base.
- Reputación del repositorio: 20 descargas y 0 likes en el momento de la consulta; no es un checkpoint validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vis22/50K_Robotwin_move_can_pot
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
