# woozoodev/omx_act_policy

## Resumen

El modelo `woozoodev/omx_act_policy` es una política de imitación basada en ACT (Action Chunking with Transformers), desarrollada por el usuario woozoodev y publicada en Hugging Face bajo licencia Apache 2.0. Está entrenado con el framework LeRobot de Hugging Face y utiliza el dataset `woozoodev/pick_and_place` para aprender tareas de manipulación robótica, concretamente la tarea de recoger y colocar objetos. El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0.2 GB, lo que lo convierte en una política ligera y eficiente, adecuada para robots de bajo coste como el SO100.

ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación fina. Este modelo es relevante porque demuestra cómo se puede entrenar y desplegar una política robótica de forma accesible con herramientas open source, sin necesidad de grandes infraestructuras. Al estar integrado en el ecosistema LeRobot, permite reproducir el entrenamiento, la evaluación y la inferencia de forma sencilla mediante comandos CLI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - Transformer |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control robótico, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza una arquitectura transformer para predecir una secuencia de acciones futuras (un "chunk") condicionada a la observación actual. En lugar de emitir una única acción por paso de tiempo, el modelo genera un bloque de acciones que el robot ejecuta de forma secuencial, lo que reduce la acumulación de errores y mejora la robustez en tareas de manipulación.

El modelo fue entrenado con el framework LeRobot, que gestiona el dataset, el entrenamiento y la evaluación. El dataset utilizado es `woozoodev/pick_and_place`, que contiene demostraciones teleoperadas de una tarea de recoger y colocar objetos. No se han publicado detalles sobre el número exacto de episodios, el número de tokens de entrenamiento ni si se aplicaron técnicas de refinamiento como RLHF o DPO; la información disponible solo indica que el entrenamiento se realizó con el pipeline estándar de LeRobot para políticas ACT. El modelo está pensado para ser usado con robots tipo SO100, como se indica en los comandos de evaluación.

## Capacidades

- Control robótico por imitación: el modelo aprende a reproducir comportamientos demostrados, generando secuencias de acciones para un robot manipulator.
- Predicción de action chunks: en lugar de acciones paso a paso, genera bloques de acciones, lo que mejora la coherencia del movimiento.
- Integración con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluación e inferencia mediante comandos CLI.
- Tarea específica: entrenado para la tarea pick and place (recoger y colocar), aunque la arquitectura ACT es generalizable a otras tareas de manipulación con el dataset adecuado.
- Bajo coste computacional: con solo 51,7 millones de parámetros, es adecuado para hardware modesto y robots de bajo coste.
- No es un modelo de lenguaje: no tiene capacidades de generación de texto, razonamiento, código ni visión; su salida son vectores de acción para el robot.

## Casos de uso

- Automatización de tareas de pick and place en entornos de laboratorio o educativos: el modelo puede controlar un brazo robótico SO100 para recoger objetos de una posición y colocarlos en otra, replicando las demostraciones aprendidas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para experimentar con ACT, modificar hiperparámetros o comparar con otras políticas (Diffusion, VQ-BeT) usando LeRobot.
- Desarrollo de prototipos de robótica doméstica: por su tamaño reducido, puede desplegarse en una GPU de gama media para tareas simples de manipulación en entornos controlados.
- Educación en robótica: permite a estudiantes y desarrolladores entrenar y evaluar una política real con un robot físico o simulado, siguiendo la documentación de LeRobot.
- Benchmarking de políticas de imitación: al ser un modelo ACT estándar, puede utilizarse como referencia para comparar el rendimiento de otras arquitecturas o variantes de entrenamiento.
- Pruebas de generalización: aunque entrenado para pick and place, se puede evaluar su capacidad de transferencia a variaciones de la tarea (diferentes posiciones, objetos o iluminación) para estudiar los límites del aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito, tasas de acierto ni comparaciones con otros modelos. El autor no proporciona datos evaluativos más allá del propio modelo entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero dado el tamaño del modelo (51,7 M parámetros, 0.2 GB en safetensors), es probable que quepa en GPUs con 2-4 GB de VRAM, aunque no hay datos oficiales.
- GPU recomendadas: no se especifican, pero por el tamaño, cualquier GPU moderna con soporte CUDA (p.ej. RTX 3060, RTX 4090) debería ser suficiente. En el comando de entrenamiento se indica `--policy.device=cuda`.
- Compatibilidad con GPU consumer: sí, el modelo es ligero y no requiere hardware de nivel datacenter.
- Opciones de despliegue: LeRobot ofrece scripts CLI (`lerobot-record`, `lerobot-train`) que gestionan la inferencia y la evaluación. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información comparativa directa con otros modelos en la model card. Sin embargo, dentro del ecosistema LeRobot existen otras políticas de imitación como Diffusion Policy, VQ-BeT y TD-MPC, que son arquitecturas alternativas para tareas similares. ACT se caracteriza por ser ligera y rápida de entrenar, pero no hay datos numéricos que permitan una comparación objetiva en este caso. Se recomienda consultar la documentación de LeRobot para conocer las diferencias arquitectónicas y de rendimiento.

## Limitaciones y advertencias

- Sesgos y alucinación: al ser un modelo de control robótico, no genera texto, por lo que los conceptos de sesgo lingüístico o alucinación no aplican directamente. Sin embargo, puede producir acciones incorrectas si la observación difiere significativamente de los datos de entrenamiento.
- Limitación de generalización: está entrenado específicamente con el dataset `woozoodev/pick_and_place`; puede fallar en tareas fuera de ese dominio o con configuraciones de robot diferentes.
- Dependencia del hardware robótico: el modelo está diseñado para el robot SO100 (como se indica en el comando de evaluación); usarlo con otros robots requeriría adaptación y posiblemente reentrenamiento.
- Sin datos de rendimiento: no se han publicado métricas de éxito ni evaluaciones cuantitativas, por lo que su fiabilidad en producción no está demostrada.
- Restricciones de licencia: aunque la licencia Apache 2.0 permite uso comercial, el modelo depende del dataset y del framework LeRobot; hay que verificar la licencia del dataset utilizado (no especificada en la model card).
- Riesgo en entornos reales: al ser una política de imitación, puede ejecutar movimientos inseguros si se encuentra con situaciones no vistas; se recomienda supervisión y pruebas en entornos simulados antes de un despliegue real.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/woozoodev/omx_act_policy)
- [Dataset woozoodev/pick_and_place](https://huggingface.co/datasets/woozoodev/pick_and_place)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/act)
- [Guía de entrenamiento de LeRobot](https://huggingface.co/docs/lerobot/il_robots#train-a-policy)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
