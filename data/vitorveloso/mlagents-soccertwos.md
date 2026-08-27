# vitorveloso/mlagents-SoccerTwos

## Resumen

Este modelo es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) para jugar al entorno SoccerTwos de Unity ML-Agents. Lo desarrolla el usuario vitorveloso y se publica en Hugging Face bajo la librería ml-agents. El entorno SoccerTwos consiste en un partido de fútbol 2 contra 2 donde los agentes deben cooperar para marcar goles y defender su portería.

El modelo resuelve el problema de control de agentes en un entorno multiagente competitivo-cooperativo, aprendiendo una política que maximiza la recompensa acumulada. Su relevancia radica en ser un ejemplo de aplicación de PPO a un entorno Unity con dinámicas de equipo, útil como punto de partida para investigación en RL multiagente o para integrar agentes entrenados en simulaciones Unity.

La documentación disponible es extremadamente escasa: la model card solo indica que es un agente PPO entrenado en ML-Agents-SoccerTwos, sin detalles sobre arquitectura de red, tamaño de parámetros, configuración de hiperparámetros ni proceso de entrenamiento. No se especifican la licencia ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política PPO (detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplicable (agente de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (librería ml-agents, probablemente .onnx o .nn) |

## Arquitectura y entrenamiento

El modelo utiliza el algoritmo PPO (Proximal Policy Optimization), un método de optimización de política basado en gradiente que recorta la función objetivo para limitar las actualizaciones de política y garantizar estabilidad en el entrenamiento. PPO es el algoritmo por defecto en Unity ML-Agents y es ampliamente utilizado en entornos de control continuo y discreto.

El entrenamiento se realizó en el entorno SoccerTwos de Unity ML-Agents, un escenario multiagente donde dos equipos de dos agentes compiten en un partido de fútbol simplificado. No se dispone de información sobre el número de pasos de entrenamiento, la arquitectura de la red neuronal (número de capas, unidades ocultas, funciones de activación), ni sobre el uso de técnicas adicionales como recompensas por curiosidad, entrenamiento con curriculum o normalización de observaciones. Tampoco se especifica si se utilizó entrenamiento auto-jugable (self-play), que es común en entornos competitivos de este tipo.

## Capacidades

- Jugar al entorno SoccerTwos de Unity ML-Agents, controlando un agente en un partido de fútbol 2 contra 2.
- Tomar decisiones de acción en tiempo real basadas en observaciones del entorno (posiciones, velocidades, orientación, etc.).
- Cooperar con un compañero de equipo para marcar goles y defender la portería.
- Competir contra un equipo adversario, lo que implica comportamiento adaptativo frente a oponentes.
- No es un modelo de lenguaje: no genera texto, código ni realiza razonamiento simbólico.
- No soporta tool calling, visión ni capacidades multimodales.

## Casos de uso

- Investigación en aprendizaje por refuerzo multiagente: el modelo sirve como referencia o baseline para estudiar dinámicas de cooperación y competencia en entornos Unity, permitiendo comparar el rendimiento de PPO frente a otros algoritmos como SAC, DQN o MAPPO.
- Desarrollo de IA para videojuegos deportivos: el agente demuestra cómo entrenar bots que juegan fútbol simplificado, un punto de partida para adaptar la política a juegos comerciales con mecánicas similares.
- Evaluación de algoritmos de RL en entornos Unity: al ser un modelo entrenado con PPO, puede usarse para validar configuraciones de hiperparámetros o modificaciones del algoritmo en el mismo entorno.
- Simulación de comportamiento de equipos: el modelo puede integrarse en simulaciones Unity para generar oponentes o compañeros controlados por IA en prototipos de juegos deportivos.
- Educación en RL: sirve como ejemplo práctico de entrenamiento de agentes con ML-Agents, útil en cursos o tutoriales sobre aprendizaje por refuerzo aplicado a entornos de juego.
- Benchmarking de entornos: el modelo puede utilizarse para verificar que el entorno SoccerTwos funciona correctamente y que las recompensas se distribuyen de forma esperada, comparando la recompensa media obtenida con la de otros agentes publicados.

## Benchmarks y rendimiento

El autor declara en la model card el siguiente resultado, sin verificación independiente:

| Metrica | Valor |
|---|---|
| mean_reward en ML-Agents-SoccerTwos | 1.50 +/- 0.30 |

No se han publicado resultados adicionales de benchmarks en la informacion disponible. No se proporcionan comparaciones con otros agentes ni métricas complementarias como tasa de victorias, goles marcados o eficiencia de muestreo.

## Requisitos de hardware

- Al ser un modelo de ML-Agents, la inferencia se ejecuta dentro del entorno Unity, no como un servicio independiente.
- El tamaño del modelo no está documentado, pero los agentes PPO de ML-Agents suelen ser redes pequeñas (del orden de decenas de miles de parámetros), por lo que la inferencia es viable en CPU.
- No se requiere GPU para ejecutar el agente en Unity; una CPU moderna es suficiente para la inferencia en tiempo real.
- Para reentrenar el agente desde cero, se recomienda una GPU con al menos 4-8 GB de VRAM (por ejemplo, GTX 1660, RTX 2060 o superior), aunque el entorno Unity también puede ejecutarse en CPU con tiempos de entrenamiento más largos.
- El despliegue se realiza mediante el paquete ml-agents de Unity, cargando el modelo como un archivo .onnx o .nn dentro del componente Behavior Parameters.
- No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Autor | Algoritmo | Recompensa media | Licencia | Documentacion |
|---|---|---|---|---|---|
| vitorveloso/mlagents-SoccerTwos | vitorveloso | PPO | 1.50 +/- 0.30 | no disponible | minima |
| unity/MLAgents-SoccerTwos | Unity | no disponible | no disponible | no disponible | minima |
| Adilbai/ML-Agents-SoccerTwos | Adilbai | no disponible | no disponible | no disponible | minima |

No se dispone de datos de rendimiento comparables para los modelos alternativos de SoccerTwos publicados en Hugging Face. La comparativa se limita a la disponibilidad y al algoritmo declarado.

## Limitaciones y advertencias

- La documentación es prácticamente inexistente: no se especifican hiperparámetros, arquitectura de red, duración del entrenamiento ni configuración del entorno.
- No se indica la licencia, por lo que el uso comercial del modelo es legalmente incierto. Se recomienda contactar al autor antes de utilizarlo en producción.
- El resultado de recompensa media (1.50 +/- 0.30) no está verificado de forma independiente y puede no ser reproducible sin la configuración exacta de entrenamiento.
- El modelo está especializado exclusivamente en el entorno SoccerTwos; no es transferible a otras tareas sin reentrenamiento.
- Al ser un agente de RL, su comportamiento puede ser frágil ante cambios en el entorno (física, tiempos de respuesta, configuraciones de cámara) que no estaban presentes durante el entrenamiento.
- No se especifica si el modelo fue entrenado con self-play, lo que podría afectar a su rendimiento frente a oponentes con estrategias diferentes a las vistas en entrenamiento.
- El modelo tiene cero descargas y cero likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vitorveloso/mlagents-SoccerTwos
- Entorno de referencia de Unity: https://huggingface.co/unity/MLAgents-SoccerTwos
- Modelo alternativo de Adilbai: https://huggingface.co/Adilbai/ML-Agents-SoccerTwos
- Tutorial de Soccer Twos con ML-Agents: https://deepanshut041.github.io/Reinforcement-Learning/mlagents/05_soccer_twos/
- Repositorio SoccerAgents en GitHub: https://github.com/Amir-Mohseni/SoccerAgents
