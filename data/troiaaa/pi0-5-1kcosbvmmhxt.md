# Troiaaa/pi0.5-1kCosbvmMhXt

## Resumen

π0.5-1kCosbvmMhXt es un checkpoint de robótica publicado por el usuario Troiaaa en Hugging Face. Se trata de un ajuste fino del modelo vision-language-action (VLA) π0.5 de Physical Intelligence, tomando como punto de partida el snapshot `ApexUltron/pi0.5-KX774qZu7mZD` (identificado como UID107 y campeón de la competición 6). Es, por tanto, un artefacto derivado de una competición sobre el entorno de evaluación AXIS v1.0, asociado al subnet netuid-80 (openroboto) de Bittensor. El repositorio ocupa 12,4 GB y se distribuye bajo licencia Apache 2.0.

El método que describe la model card se denomina "time-localized first-step noise collapse (anchor map v2)". En lugar de reentrenar el modelo completo, solo se optimizan los kernels de acondicionamiento temporal adaRMS (`pre_attention_norm_1`, `pre_ffw_norm_1`, `final_norm_1` y `time_mlp_out`) y cada actualización se proyecta sobre el complemento ortogonal de los vectores de condicionamiento en los tiempos de inferencia t = 0.9 … 0.1. El objetivo es que el primer paso del muestreador Euler de 10 pasos aterrice en el punto de primer paso del modelo padre para la ancla de cada tarea, preservando el campo de velocidad del padre para t ≤ 0.9. Como consecuencia, solo cuatro tensores difieren del modelo base; el resto son idénticos byte a byte.

Su relevancia es acotada pero interesante: demuestra que es posible especializar quirúrgicamente una política VLA sin degradar su comportamiento general, y lo cuantifica con el evaluador oficial (30 tareas × 20 ensayos), donde pasa de 500 puntos del padre a 580, 573 y 580 en tres semillas. Es un caso de estudio sobre ajuste fino mínimo, condicionamiento temporal y evaluación reproducible en robótica, no un modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5; jerárquica, con acciones de bajo nivel y acciones "semánticas" de alto nivel |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor indica despliegue en BF16 con pesos maestros F32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio JAX/openpi de 12,4 GB; no se especifica el contenedor exacto) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de π0.5, descrita por Physical Intelligence como una arquitectura jerárquica simple: primero se preentrena sobre una mezcla heterogénea de tareas y después se ajusta para manipulación móvil combinando ejemplos de acciones de bajo nivel con acciones "semánticas" de alto nivel, que corresponden a predecir etiquetas de subtarea (por ejemplo, "pick ..."). El coentrenamiento mezcla demos de robot, datos web y subtareas semánticas para favorecer la generalización en mundo abierto y en horizontes largos. Este checkpoint no altera normalización, arquitectura, tokenizador ni muestreador respecto al padre.

El entrenamiento específico de este checkpoint consistió en 3.000 actualizaciones AdamW, batch de 32 y learning rate 1e-4, en JAX/openpi, con forward en precisión de despliegue BF16 y pesos maestros F32. Los datos son rollouts on-policy del padre en las escenas de AXIS v1.0: aproximadamente 2.200 rollouts en total, 1.920 procedentes del profesor con ruido cero y 320 del profesor con el mapa de anclas v2. No se utilizaron direcciones de ensayos de evaluación ni semillas reservadas. La innovación técnica es la localización temporal: la pérdida fuerza que el primer paso del Euler sampler de 10 pasos desde cualquier ruido ε caiga sobre el primer paso del padre para el ancla de la tarea, y las actualizaciones se proyectan sobre el complemento ortogonal de los vectores de condicionamiento en t = 0.9 … 0.1, preservando exactamente (hasta redondeo BF16) el campo de velocidad del padre para t ≤ 0.9.

El mapa de anclas v2 define (semilla, escala) por tarea con ε* = escala · N(sha256("seed:task")): 34 (24, 0.5), 37 (22, 0.5), 44 (26, 0.5), 55 (26, 0.3), 502 (23, 0.3), 50 (8, 0.5), 501 (7, 0.5), 757 (5, 0.5), 43 (1, 0.5); el resto de tareas usan ruido cero.

## Capacidades

- Control robótico de manipulación móvil a partir de instrucciones en lenguaje natural e imágenes (modelo vision-language-action).
- Ejecución de tareas de horizonte largo en entornos abiertos, gracias al coentrenamiento con datos heterogéneos y con acciones semánticas de alto nivel.
- Generación de acciones de bajo nivel mediante un muestreador Euler de 10 pasos sobre un campo de velocidad condicionado temporalmente.
- Generalización a tareas no vistas dentro del entorno AXIS v1.0, según la evaluación local del autor.
- Especialización por tarea mediante mapas de ruido de ancla, sin alterar la política base en t ≤ 0.9.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo emite acciones de robot, no cadenas de razonamiento textual).
- Capacidades multilingües: no disponible.
- Capacidades especiales adicionales (visión, audio, modo de pensamiento): no disponible, salvo la entrada visual inherente a un modelo VLA.

## Casos de uso

- Manipulación móvil en almacén: el modelo recibe una instrucción en lenguaje natural y una observación visual y produce una secuencia de acciones de bajo nivel para recoger y colocar objetos, apoyándose en las acciones semánticas de alto nivel para descomponer tareas de horizonte largo.
- Especialización de una política base sin reentrenarla: gracias a que solo se modifican cuatro tensores del padre, se puede adaptar el modelo a una tarea concreta (por ejemplo, un nuevo tipo de ancla de ruido por tarea) manteniendo intacto el comportamiento general en t ≤ 0.9.
- Investigación en ajuste fino paramétricamente mínimo: sirve como referencia reproducible para estudiar cuánto se puede mover una política VLA con 3.000 pasos y un subconjunto de kernels.
- Evaluación comparativa en competiciones de robótica: el artefacto está pensado para el evaluador AXIS v1.0 con 30 tareas × 20 ensayos, por lo que se puede usar como baseline en torneos del subnet netuid-80.
- Replicación de experimentos de condicionamiento temporal: el método de proyección ortogonal sobre los vectores de condicionamiento en t = 0.9 … 0.1 es directamente reutilizable para auditar cómo afecta el ruido inicial a un sampler Euler.
- Estudio de estabilidad del primer paso del sampler: al forzar que el primer paso aterrice en el punto del padre para el ancla de cada tarea, se puede analizar la sensibilidad del muestreo a perturbaciones iniciales.
- Integración en pipelines de investigación con LeRobot: la implementación de π0.5 en LeRobot (port desde el repositorio OpenPI) permite cargar y probar la política en entornos de simulación o hardware compatible.

## Benchmarks y rendimiento

Resultados del evaluador oficial (30 tareas × 20 ensayos, máximo 600), según la model card:

| Modelo | Semilla 20260907 | Semilla 20261101 | Semilla 20260926 |
|---|---|---|---|
| Padre (ApexUltron/pi0.5-KX774qZu7mZD) | 500 | 500 | – |
| Este modelo | 580 | 573 | 580 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K y similares no aplican a este tipo de modelo) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 12,4 GB; a partir de ese tamaño y del despliegue en BF16, se puede estimar un mínimo de aproximadamente 12-13 GB de VRAM solo para cargar los pesos. Es una estimación derivada del tamaño del repositorio, no un dato confirmado por el autor.
- GPU recomendadas: no disponible de forma explícita. Por tamaño, una GPU con 24 GB o más (RTX 4090, A100 40 GB, H100) sería suficiente si la estimación anterior es correcta; no confirmado.
- ¿Cabe en GPU de consumo? Probablemente en una RTX 4090 (24 GB) o RTX 3090 (24 GB) si la estimación de 12-13 GB es válida; no confirmado. No se dispone de datos para GPUs con menos de 12 GB.
- Opciones de despliegue: el autor entrena y despliega con JAX/openpi; existe una implementación de π0.5 en LeRobot (port desde el repositorio OpenPI) que puede servir para inferencia en PyTorch. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. El muestreador descrito es un Euler de 10 pasos, pero no se publican tiempos por paso ni frecuencia de control.

## Comparativa con modelos similares

| Modelo | Relación | Puntuación en el evaluador AXIS v1.0 | Licencia | Disponibilidad |
|---|---|---|---|---|
| Troiaaa/pi0.5-1kCosbvmMhXt | Este modelo | 580 / 573 / 580 (tres semillas) | Apache 2.0 | Hugging Face, 0 descargas |
| ApexUltron/pi0.5-KX774qZu7mZD | Padre (UID107) | 500 / 500 | no disponible | Hugging Face |
| Troiaaa/pi0.5-WSMLo1hknaNw | Mismo propietario y familia de método (UID 113); run independiente | no disponible | no disponible | Hugging Face |
| π0.5 (Physical Intelligence) | Modelo base original | no disponible | no disponible | arXiv 2504.16054; implementación en OpenPI y LeRobot |

No se dispone de comparaciones adicionales con otros modelos VLA (por ejemplo, π0 o alternativas de otros laboratorios) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta ningún análisis de sesgo para este checkpoint.
- Riesgo de alucinación: no aplica de forma directa (modelo de acción, no de texto), pero la política puede ejecutar acciones incorrectas o inseguras ante observaciones fuera de distribución.
- La evaluación se limita a las 30 tareas del entorno AXIS v1.0 y a las escenas del evaluador oficial; no hay evidencia de transferencia a escenas reales o a otros simuladores.
- Dependencia fuerte del modelo padre: solo cuatro tensores difieren, así que cualquier limitación del padre (generalización, precisión del sampler) se hereda.
- El método asume que el padre ya es un campeón en la competición 6; su utilidad fuera de ese entorno de competición no está demostrada.
- Las semillas y direcciones de tarea usadas en el entrenamiento están documentadas en la model card; no se usaron semillas reservadas ni direcciones de ensayo, pero eso también implica que el rendimiento medido puede no trasladarse a particiones distintas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene verificar las condiciones del padre y de π0.5 original antes de redistribuir en producción.
- Idiomas soportados y longitud de contexto: no disponibles, lo que dificulta planificar despliegues con instrucciones en idiomas distintos del usado en el entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Troiaaa/pi0.5-1kCosbvmMhXt
- Modelo padre: https://huggingface.co/ApexUltron/pi0.5-KX774qZu7mZD
- Modelo hermano del mismo autor: https://huggingface.co/Troiaaa/pi0.5-WSMLo1hknaNw
- Perfil de Troiaaa en Hugging Face: https://huggingface.co/Troiaaa
- Paper de π0.5: a Vision-Language-Action Model with Open-World Generalization: https://arxiv.org/abs/2504.16054
- Versión HTML del paper: https://arxiv.org/html/2504.16054v1
- Documentación de la política π0.5 en LeRobot: https://huggingface.co/docs/lerobot/pi05
- Ficha de Pi0.5 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/pi05
