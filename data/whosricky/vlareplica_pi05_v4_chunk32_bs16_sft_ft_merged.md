# whosricky/VLAReplica_pi05_v4_chunk32_bs16_SFT_ft_merged

## Resumen
Este modelo es una adaptación fine-tuned de π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, publicado en Hugging Face por el usuario whosricky. π₀.₅ está diseñado para abordar el problema de la generalización en mundo abierto (open-world generalization) en robótica, es decir, la capacidad de un robot para ejecutar tareas en entornos y situaciones no vistas durante el entrenamiento.

La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. Este checkpoint concreto es un mergue posterior a un entrenamiento supervisado (SFT) sobre el dataset `whosricky/vlareplica_merged`, creado en el marco del benchmark VLA-REPLICA, un proyecto de bajo coste y reproducible para evaluar modelos VLA en entornos reales. El modelo tiene un total de 4.143.404.816 parámetros y un tamaño de repositorio de 9.4 GB, lo que lo sitúa en el rango de los modelos de robótica con aprendizaje profundo a escala media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer. Implementacion de Physical Intelligence adaptada en LeRobot. |
| Parametros totales | 4.143.404.816 (aproximadamente 4.14 miles de millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se han publicado pesos en formato safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es una política π₀.₅, que pertenece a la familia de modelos Vision-Language-Action (VLA). Estos modelos combinan un codificador visual y un codificador de lenguaje con un decodificador de acciones, permitiendo que el robot genere comandos de actuación directamente a partir de observaciones de cámara y de instrucciones en lenguaje natural. La arquitectura concreta (número de capas, tipo de atención, etc.) no está especificada en la información disponible.

El entrenamiento se ha realizado utilizando el framework LeRobot. Este checkpoint concreto ha sido sometido a un proceso de fine-tuning supervisado (SFT) sobre el dataset `whosricky/vlareplica_merged`, y posteriormente fusionado (merged). No se dispone de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni la aplicación de técnicas como RLHF o DPO. El modelo base π₀.₅, desarrollado por Physical Intelligence, representa una evolución de π₀ orientada a mejorar la generalización a entornos completamente nuevos, una característica clave para la aplicación de robots en escenarios no controlados.

## Capacidades
- Generación de acciones de robot (política de actuación) a partir de imágenes de cámara y de instrucciones de lenguaje natural.
- Generalización a entornos y situaciones no vistos durante el entrenamiento, gracias al diseño del modelo π₀.₅.
- Integración con el framework LeRobot, lo que facilita la reproducción de entrenamientos y evaluaciones.
- Incluye soporte para uso en robots de tipo SO-100 (u otros compatibles con LeRobot) mediante el comando `lerobot-record`.
- Posibilidad de entrenamiento desde cero o de fine-tuning sobre datasets propios mediante `lerobot-train`.
- No se ha confirmado soporte para tool calling, agentes o modos de razonamiento explícitos; el modelo está orientado a tareas de control robótico.

## Casos de uso
- Manipulación robótica en entornos no controlados: el modelo puede ejecutar tareas de pick-and-place, apertura de objetos y otras operaciones de manipulación en espacios no diseñados previamente, gracias a su capacidad de generalización en mundo abierto.
- Benchmarking reproducible de políticas VLA: el modelo está vinculado al benchmark VLA-REPLICA, que proporciona un marco de evaluación de bajo coste y reproducible para comparar modelos de visión-lenguaje-acción.
- Investigación en generalización open-world: es una herramienta adecuada para estudiar cómo las políticas de actuación se comportan ante distribuciones de datos diferentes a las de entrenamiento.
- Desarrollo de robots de servicio en entornos domésticos: la capacidad de entender instrucciones en lenguaje natural y adaptarse a variaciones del entorno lo hace útil para asistentes robóticos en casas o oficinas.
- Automatización de tareas en logística: puede utilizarse en brazos robóticos para clasificar objetos o mover mercancías en almacenes donde las disposiciones cambian de forma dinámica.
- Educación en robótica: al estar integrado con LeRobot y contar con una licencia Apache 2.0, es apto para cursos y laboratorios universitarios donde se necesita entrenar y evaluar políticas VLA sin costes de licencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: dado el tamaño de 4.14 mil millones de parámetros y un repositorio de 9.4 GB, los pesos parecen estar en precisión fp16/bf16. En ese caso, la VRAM necesaria para inferencia se estima en 10-12 GB, considerando pesos y activaciones. Una GPU con al menos 12 GB de VRAM sería adecuada.
- GPU recomendadas: RTX 4070 o superior, A10G, L4, o modelos equivalentes con 12-16 GB de VRAM. Para entrenamiento, se recomienda al menos 16-20 GB de VRAM (por ejemplo, RTX 4080, A100 40GB, o H100).
- Compatibilidad con GPUs de consumo: es posible ejecutar inferencia en GPUs de consumo de gama alta (RTX 4070/4080), aunque para entrenamiento desde cero sería necesario disponer de más memoria o utilizar técnicas de gradient accumulation.
- Opciones de despliegue: entrenamiento e inferencia mediante LeRobot con los comandos `lerobot-train` y `lerobot-record`. No se han documentado opciones con vLLM, llama.cpp, TGI u otros entornos de despliegue para modelos de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No se dispone de datos de referencia ni de benchmarks publicados en la información disponible para comparar de forma cuantitativa. Sin embargo, se puede señalar que el modelo es una variante fine-tuned de π₀.₅ de Physical Intelligence, y que existe un checkpoint homólogo sin el paso de fusión en el repositorio `HenryZhang/VLAReplica_pi05_v4_chunk32_bs16_SFT`. No hay información suficiente sobre otras alternativas comparables como OpenVLA, RT-2 o π₀.

| Modelo | Parametros | Contexto | Benchmarks | Licencia |
|---|---|---|---|---|
| whosricky/VLAReplica_pi05_v4_chunk32_bs16_SFT_ft_merged | 4.14B | No disponible | No disponible | Apache 2.0 |
| HenryZhang/VLAReplica_pi05_v4_chunk32_bs16_SFT (checkpoint base) | No disponible | No disponible | No disponible | Apache 2.0 |
| π₀.₅ (Physical Intelligence, base) | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias
- No se han especificado sesgos conocidos, pero al tratarse de un modelo entrenado sobre conjuntos de datos de robótica, su comportamiento puede verse afectado por las distribuciones de tareas y entornos presentes en dichos datos.
- Existe riesgo de alucinación en la generación de acciones: el modelo puede ejecutar movimientos incorrectos o poco seguros en situaciones que difieren mucho de los datos de entrenamiento.
- La longitud de contexto y los idiomas soportados no están documentados, lo que limita la posibilidad de adaptar el modelo a instrucciones complejas o a lenguajes específicos.
- Al ser un modelo de 4.14B, requiere recursos de hardware notables, lo que puede suponer una barrera para equipos con GPUs de gama baja.
- La licencia Apache 2.0 permite el uso comercial, pero no se ofrecen garantías ni soporte por parte del autor del checkpoint.
- El modelo está diseñado específicamente para robótica y no debe usarse como un modelo de lenguaje general; sus salidas son acciones de actuación, no texto conversacional.

## Enlaces
- Hugging Face del modelo: https://huggingface.co/whosricky/VLAReplica_pi05_v4_chunk32_bs16_SFT_ft_merged
- Publicación del blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Modelo relacionado de HenryZhang (checkpoint base): https://huggingface.co/HenryZhang/VLAReplica_pi05_v4_chunk32_bs16_SFT
- Benchmark VLA-REPLICA: https://irvlutd.github.io/VLAReplica/model-checkpoints/
