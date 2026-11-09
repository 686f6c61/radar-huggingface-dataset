# vedansh-s/ppo-Huggy

## Resumen

`vedansh-s/ppo-Huggy` es un agente de aprendizaje por refuerzo profundo (deep reinforcement learning) entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno "Huggy" de la librería Unity ML-Agents. No se trata de un modelo de lenguaje: es una política neuronal que controla a un perro virtual (Huggy) en una tarea de recogida de un palo dentro de un entorno 3D simulado en Unity. El autor es el usuario de Hugging Face `vedansh-s`, y el artefacto se publica como pesos compatibles con ML-Agents en formato `.nn` y `.onnx`.

El modelo resuelve el problema clásico de control continuo en un entorno de juguete con recompensas basadas en la proximidad al objetivo (el palo) y en la orientación del agente. Es relevante como ejemplo didáctico de entrenamiento y despliegue de agentes con ML-Agents, y como punto de partida reproducible para experimentar con PPO en entornos Unity. No hay información pública sobre la arquitectura exacta de la red, el número de parámetros, el número de pasos de entrenamiento ni la configuración de hiperparámetros utilizada.

El repositorio ocupa 0,2 GB y no registra descargas ni "likes" en el momento de la consulta. La model card es la plantilla generada automáticamente por ML-Agents y no aporta detalles técnicos adicionales sobre el entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor para PPO (ML-Agents); capas y tamaños no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en `.nn` y `.onnx`; sin variantes cuantizadas publicadas) |
| Idiomas soportados | no aplica (agente de control, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | `.nn` (formato nativo de ML-Agents) y `.onnx` |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo de gradiente de política con recorte de la ratio de probabilidad (*clipped surrogate objective*) que estabiliza las actualizaciones en entornos de recompensa dispersa o ruidosa. En ML-Agents, la política y la función de valor se implementan típicamente como perceptrones multicapa que procesan observaciones vectoriales y, opcionalmente, visuales; sin embargo, la model card no especifica si este agente usa observaciones vectoriales, raycast o cámara, ni el tamaño de las capas ocultas.

No se dispone de información sobre el número de pasos de entrenamiento, la composición del buffer de experiencias, el uso de recompensas intrínsecas (curiosity, RND) ni de técnicas auxiliares como *self-play* o *curriculum learning*. El artefacto publicado es únicamente el resultado final del entrenamiento, sin métricas de curva de aprendizaje ni checkpoints intermedios documentados.

## Capacidades

- Control continuo de un agente articulado (Huggy) en un entorno 3D de Unity.
- Política entrenada específicamente para la tarea de recoger un palo y acercarlo al objetivo.
- Exportación a ONNX para inferencia fuera de Unity (por ejemplo, en Python con `onnxruntime`).
- Compatibilidad con el flujo de ML-Agents para reanudar entrenamiento (`--resume`) y para visualización en el navegador a través del visor de Hugging Face.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión ni capacidades multilingües.
- No dispone de modo "thinking", audio ni ninguna capacidad generativa.

## Casos de uso

- Docencia de reinforcement learning: usar el agente como ejemplo funcional de PPO en ML-Agents para explicar el bucle entrenamiento-despliegue en un curso introductorio.
- Reproducción de experimentos: reanudar el entrenamiento con `mlagents-learn ... --resume` para comparar hiperparámetros y curvas de recompensa frente a una línea base.
- Despliegue en navegador: cargar el archivo `.onnx` en el visor de Hugging Face (`https://huggingface.co/unity`) para demostrar el comportamiento del agente sin instalar Unity.
- Integración en pipelines de investigación: exportar el `.onnx` y ejecutarlo con `onnxruntime` en un script de Python para medir latencia de inferencia y robustez ante perturbaciones en las observaciones.
- Generación de datos sintéticos: ejecutar el agente en el entorno para grabar trayectorias y usarlas como datos de imitación o para *offline RL*.
- Pruebas de infraestructura: validar el flujo completo de ML-Agents (entrenamiento, exportación, publicación en el Hub y visualización) antes de escalar a entornos propios más complejos.
- Comparación de algoritmos: servir como referencia PPO frente a variantes como SAC o PPO con recompensas intrínsecas en el mismo entorno Huggy.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye recompensa media, tasa de éxito, número de pasos hasta convergencia ni comparaciones con otros agentes en el entorno Huggy.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio (0,2 GB) sugiere un modelo pequeño, pero no se especifica el número de parámetros ni la memoria necesaria.
- GPU recomendadas: no disponibles; para un agente ML-Agents de este tipo, una GPU consumer (GTX 1660, RTX 3060 o superior) suele ser suficiente, pero no hay datos oficiales que lo confirmen.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del artefacto, aunque no está verificado.
- Opciones de despliegue: Unity ML-Agents (runtime nativo con `.nn`), `onnxruntime` (Python, C++, C#) para el archivo `.onnx`, y el visor web de Hugging Face para reproducción en navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vedansh-s/ppo-Huggy | Huggy (ML-Agents) | PPO | no disponible | no aplica | no disponible | Hugging Face |
| unity/ppo-Huggy (referencia oficial) | Huggy (ML-Agents) | PPO | no disponible | no aplica | no disponible | Hugging Face |
| Agentes PPO de la deep-rl-course | Huggy, Pyramids, Walker | PPO | no disponible | no aplica | no disponible | Hugging Face |

La comparación se limita a otros agentes del ecosistema ML-Agents; no existen alternativas de modelos de lenguaje comparables porque este artefacto no es un modelo generativo.

## Limitaciones y advertencias

- Especialización extrema: la política solo funciona en el entorno Huggy y no generaliza a otras tareas sin reentrenamiento.
- Sin información de licencia: no se puede confirmar el uso comercial; se debe contactar con el autor antes de utilizarlo en producción.
- Sin métricas de rendimiento: no hay evidencia publicada de la calidad del agente (recompensa media, tasa de éxito), por lo que no se puede evaluar objetivamente.
- Sin documentación de entrenamiento: se desconocen hiperparámetros, semillas, número de pasos y posibles sesgos del proceso de entrenamiento.
- Riesgo de sobreajuste al entorno: al no haber checkpoints ni curvas, no se puede descartar que el agente haya memorizado trayectorias concretas.
- Repositorio sin descargas ni validación comunitaria: no hay señales de uso o revisión por terceros.
- Formato `.nn` propietario de ML-Agents: requiere la versión adecuada de la librería para cargarlo; el `.onnx` es más portable pero puede no reproducir exactamente el comportamiento si hay operaciones no exportadas.
- Sin soporte multilingüe ni de texto: no debe confundirse con un modelo de lenguaje; no procesa instrucciones en lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vedansh-s/ppo-Huggy
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto (Huggy en el navegador): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Visor de agentes de Hugging Face: https://huggingface.co/unity
