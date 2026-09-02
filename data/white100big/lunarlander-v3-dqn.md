# white100big/LunarLander-v3-DQN

## Resumen

LunarLander-v3-DQN es un agente de aprendizaje por refuerzo (reinforcement learning) entrenado para resolver el entorno LunarLander-v3 de Gymnasium, un problema clásico de control basado en física Box2D. El agente fue desarrollado por white100big y utiliza una arquitectura Double Dueling Deep Q-Network (DQN), que combina la descomposición en ventaja y valor de la arquitectura dueling con la actualización doble de Double DQN para reducir la sobreestimación de los valores Q. El modelo se entrenó durante 1.000 episodios y alcanza una recompensa media de evaluación de 271,25 con una tasa de éxito de aterrizaje del 100%, superando ampliamente el umbral de solución estándar de 200 puntos.

El modelo es relevante como ejemplo práctico de aplicación de técnicas avanzadas de DQN a un entorno de control continuo discretizado. Aunque es un modelo pequeño y específico de una tarea, sirve de referencia para desarrolladores que quieran implementar agentes RL con Double Dueling DQN, explorar estrategias de exploración con epsilon-greedy o integrar agentes entrenados en simulaciones de aterrizaje autónomo. Los pesos se distribuyen en formato PyTorch (.pth) y el repositorio incluye el código de entrenamiento y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Double Dueling Deep Q-Network (DQN) |
| Parametros totales | no disponible (red neuronal pequena, no especificada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de RL con estado de 8 dimensiones) |
| Tipos de cuantizacion | no aplica (pesos en punto flotante, formato .pth) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo implementa un Double Dueling DQN, una variante del Deep Q-Network original que combina dos mejoras: la arquitectura dueling, que separa la estimación del valor de estado y la ventaja de cada acción, y el doble Q-learning, que utiliza dos redes (una para seleccionar acciones y otra para evaluarlas) para mitigar la sobreestimación de los valores Q. La red neuronal concreta (número de capas, neuronas y funciones de activación) no se detalla en la documentación disponible.

El entrenamiento se realizó sobre el entorno LunarLander-v3 de Gymnasium, que proporciona un estado continuo de 8 dimensiones (posición, velocidad, ángulo, contacto con el suelo, etc.) y un espacio de acciones discreto de 4 opciones (no hacer nada, activar el motor principal, activar el motor izquierdo o activar el motor derecho). Se utilizó un buffer de repetición de experiencia de 100.000 transiciones, un tamaño de lote de 64, factor de descuento gamma de 0.99 y pérdida Huber (Smooth L1). La política de exploración siguió un esquema epsilon-greedy con decaimiento exponencial desde 1.0 hasta 0.05. La red objetivo se actualizó con una actualización suave (soft update) con tau = 0.005. El agente se entrenó durante 1.000 episodios, alcanzando una media móvil de 100 episodios de 259,09, superando el umbral de 200 establecido como criterio de solución.

## Capacidades

- Control de aterrizaje autónomo: el agente es capaz de estabilizar y aterrizar la nave en la plataforma designada del entorno LunarLander-v3, gestionando los tres motores (principal, izquierdo y derecho) de forma coordinada.
- Toma de decisiones secuencial: dado un estado de 8 dimensiones, el modelo selecciona la acción óptima según la política aprendida, maximizando la recompensa acumulada a largo plazo.
- Manejo de recompensas densas y escasas: el entorno ofrece recompensas positivas por acercarse a la plataforma y aterrizar correctamente, y negativas por colisiones o uso excesivo de combustible; el agente aprende a equilibrar estos factores.
- Generalización dentro del entorno: aunque no se ha probado en variantes aleatorizadas, el agente demuestra robustez al alcanzar una tasa de éxito del 100% en evaluaciones.
- Inferencia en tiempo real: al ser una red pequeña, la inferencia es extremadamente rápida y puede ejecutarse en CPU sin requisitos especiales de hardware.

## Casos de uso

- Demostración educativa de RL: el modelo sirve como ejemplo didáctico para mostrar cómo implementar y entrenar un Double Dueling DQN en un entorno estándar. Los estudiantes pueden descargar los pesos, ejecutar la simulación y visualizar el comportamiento aprendido.
- Benchmark de algoritmos de refuerzo: dado que LunarLander-v3 es un entorno de referencia, este agente puede utilizarse como punto de comparación para evaluar nuevas variantes de DQN o algoritmos alternativos (PPO, SAC, etc.) en términos de recompensa media y tasa de éxito.
- Prototipo de control autónomo en simulación: el modelo puede integrarse en pipelines de simulación para pruebas de concepto de sistemas de aterrizaje autónomo, antes de trasladar los principios a entornos más complejos o a hardware real.
- Investigación en exploración y explotación: el esquema de epsilon-greedy con decaimiento exponencial empleado puede analizarse y modificarse para estudiar el impacto de diferentes estrategias de exploración en el rendimiento final.
- Generación de datos sintéticos: el agente entrenado puede utilizarse para generar trayectorias de aterrizaje óptimas o casi óptimas, útiles para entrenar otros modelos (por ejemplo, imitación o aprendizaje por refuerzo offline).
- Integración en entornos de prueba de Gymnasium: los pesos pueden cargarse en cualquier script que defina el entorno LunarLander-v3, permitiendo reproducir evaluaciones o comparar políticas de forma estandarizada.

## Benchmarks y rendimiento

Se han publicado los siguientes resultados oficiales en el model-index del repositorio de Hugging Face, declarados por el autor y no verificados de forma independiente:

| Metrica | Valor |
|---|---|
| Recompensa media de evaluacion | 271,25 |
| Tasa de exito de aterrizaje (%) | 100 |

Además, durante el entrenamiento se reportó una media móvil de 100 episodios de 259,09, superando el umbral de solución de 200. No se dispone de comparaciones con otros agentes en la información proporcionada.

## Requisitos de hardware

- El modelo es extremadamente ligero: al ser una red neuronal pequeña (típicamente menos de 1 millón de parámetros, aunque no se especifica), la inferencia puede ejecutarse en cualquier CPU moderna sin necesidad de GPU.
- VRAM estimada: inferior a 100 MB en caso de usar GPU; no es un requisito.
- GPUs recomendadas: no se requiere ninguna GPU específica; cualquier GPU con soporte CUDA funcionará, pero la CPU es suficiente.
- Opciones de despliegue: al ser un modelo PyTorch, puede ejecutarse directamente en scripts de Python con Gymnasium. No se requiere vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia: la inferencia es del orden de microsegundos por paso, permitiendo tasas de decisión muy superiores a las necesidades del entorno (el entorno avanza a 50 Hz por defecto).
- Throughput: sin limitaciones prácticas; el cuello de botella suele estar en la renderización de la simulación, no en la inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen otros repositorios públicos con agentes para LunarLander-v3 (por ejemplo, moona-ai/lunar-lander-v3-dqn o allen73/lunarlander-v3-dqn-physical-ai), pero no se conocen sus métricas ni especificaciones para establecer una comparación cuantitativa. El rendimiento reportado (271,25 de recompensa media y 100% de éxito) es consistente con los resultados típicos de agentes DQN bien entrenados en este entorno, que suelen superar el umbral de 200.

## Limitaciones y advertencias

- Especialización en un único entorno: el modelo está entrenado exclusivamente para LunarLander-v3 y no puede generalizar a otras tareas de control o a versiones modificadas del entorno sin reentrenamiento.
- Sesgos del entorno: el agente explota las características específicas del entorno (por ejemplo, la física de Box2D y la configuración de recompensas); su comportamiento puede no ser robusto ante cambios en la dinámica o en los parámetros de recompensa.
- Riesgo de sobreajuste: al entrenarse durante 1.000 episodios con un esquema de exploración fijo, podría haberse ajustado demasiado a las condiciones iniciales del entorno, aunque la tasa de éxito del 100% sugiere cierta robustez.
- Ausencia de documentación sobre la arquitectura de red: no se especifican detalles de la red neuronal (capas, neuronas, activaciones), lo que dificulta la reproducción exacta del modelo o su análisis interno.
- Licencia no definida: al no indicarse licencia, el uso comercial o la redistribución podrían estar sujetos a restricciones legales no declaradas; se recomienda contactar al autor antes de utilizarlo en proyectos productivos.
- Sin soporte de lenguaje ni visión: el modelo no procesa texto, imágenes ni audio; su única entrada es el vector de estado de 8 dimensiones del entorno.
- Dependencia de versiones: el código de ejemplo requiere `gymnasium[box2d]` y una versión compatible de PyTorch; cambios en estas librerías podrían romper la carga de los pesos.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/white100big/LunarLander-v3-DQN
- Entorno LunarLander-v3 de Gymnasium: https://gymnasium.farama.org/environments/box2d/lunar_lander/
- Repositorio similar (moona-ai): https://huggingface.co/moona-ai/lunar-lander-v3-dqn
- Repositorio similar (allen73): https://huggingface.co/allen73/lunarlander-v3-dqn-physical-ai
- Proyecto GitHub con DQN y prioridad de repetición: https://github.com/beltromatti/lunarlander_dqn_per
- Solución DQN para LunarLander-v3 en GitHub: https://github.com/wtcherr/lunar-lander-dqn
- Notebook de Deep Q-Learning para LunarLander: https://colab.research.google.com/github/dhritishetty/LunarLander/blob/main/Deep%20Q-Learning%20for%20Lunar%20Landing.ipynb/
