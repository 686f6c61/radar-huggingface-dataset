# Yoko999/poca-SoccerTwos

## Resumen

El modelo `Yoko999/poca-SoccerTwos` es un agente de aprendizaje por refuerzo entrenado con el algoritmo POCA (Policy Optimization with Critic Alignment) para jugar al entorno SoccerTwos de Unity ML-Agents. SoccerTwos es un entorno de fútbol 2 contra 2 donde dos equipos de dos agentes compiten para marcar goles en un campo pequeño, y representa un escenario de cooperación y competencia simultánea entre agentes.

El modelo fue publicado por el usuario Yoko999 en Hugging Face el 23 de agosto de 2026, con un tamaño de repositorio de 0,1 GB. Está construido con la librería ml-agents de Unity y exportado en formato ONNX, lo que permite cargarlo directamente en el entorno SoccerTwos para observar al agente jugar, ya sea en el editor de Unity o a través del visor web de Hugging Face. No se ha publicado información sobre la arquitectura interna, los parámetros, la licencia o los datos de entrenamiento.

Es relevante porque ejemplifica el flujo de publicación de agentes entrenados con Unity ML-Agents en Hugging Face, un proceso estandarizado que la comunidad utiliza para compartir y reutilizar políticas de refuerzo. Sin embargo, al tratarse de un modelo de nicho sin documentación técnica amplia, su utilidad práctica se limita principalmente a la demostración y la experimentación en el entorno SoccerTwos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (agente POCA de Unity ML-Agents) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es un agente de RL con observaciones de entorno) |
| Tipos de cuantizacion | no disponible (formato ONNX) |
| Idiomas soportados | no disponible (no aplica, es un agente de RL) |
| Licencia | no disponible |
| Formato de pesos | ONNX (.onnx) |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo no se ha publicado en la model card. Sin embargo, por el contexto de Unity ML-Agents, se trata de una política neuronal entrenada con el algoritmo POCA (Policy Optimization with Critic Alignment), una variante de PPO (Proximal Policy Optimization) diseñada para entornos multi-agente con cooperación y competencia. POCA permite entrenar agentes que comparten una red neuronal pero que pueden tener recompensas individuales, alineando el crítico con el actor de cada agente.

El entrenamiento se realizó en el entorno SoccerTwos, que es un escenario 2v2 donde dos equipos de dos agentes compiten. No se proporcionan datos sobre el número de pasos de entrenamiento, la configuración de hiperparámetros, el tamaño del dataset de observaciones ni el uso de técnicas como normalización de observaciones o recompensas de forma. El modelo se exportó en formato ONNX, lo que permite su uso fuera del flujo de entrenamiento de ML-Agents, por ejemplo, para inferencia en tiempo real en Unity.

## Capacidades

- Jugar al fútbol 2v2 en el entorno SoccerTwos de Unity ML-Agents, controlando a un agente individual dentro de un equipo de dos.
- Tomar decisiones en tiempo real basadas en observaciones del entorno (posiciones, velocidades, orientación del balón y jugadores).
- Cooperar con un compañero de equipo y competir contra dos oponentes.
- Inferencia en formato ONNX, compatible con el runtime de ML-Agents y con herramientas de inferencia externas.
- No soporta generación de texto, código, razonamiento general, tool calling, agentes de propósito general, visión ni audio.

## Casos de uso

- Reproducción de políticas de RL en entornos Unity: el modelo permite cargar un agente preentrenado en SoccerTwos para observar su comportamiento, útil para investigadores que estudian la cooperación y competencia en entornos multi-agente.
- Comparación de algoritmos multi-agente: al ser una política entrenada con POCA, puede usarse como baseline frente a agentes entrenados con PPO, SAC u otros algoritmos en el mismo entorno para evaluar diferencias de rendimiento.
- Demo educativa de ML-Agents: sirve como ejemplo de cómo entrenar un agente en un entorno de Unity y publicarlo en Hugging Face, útil para cursos de aprendizaje por refuerzo.
- Integración en proyectos Unity: puede integrarse en un proyecto de Unity que utilice el paquete ML-Agents para sustituir a un agente controlado por un script heurístico, por ejemplo, en un prototipo de juego de fútbol.
- Evaluación de robustez en entornos competitivos: se puede enfrentar contra otros agentes (entrenados o heurísticos) en SoccerTwos para medir su robustez ante distintos estilos de juego.
- Reanudación de entrenamiento: el usuario puede reanudar el entrenamiento del modelo con el comando `mlagents-learn --resume` para continuar mejorando la política, útil para experimentos de curriculum learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se conocen métricas de rendimiento, tasa de victorias, goles por partido ni comparaciones con otros agentes en SoccerTwos.

## Requisitos de hardware

- El modelo ocupa 0,1 GB en disco, por lo que el requisito de hardware es mínimo.
- La inferencia de un agente de RL de ML-Agents en Unity se puede ejecutar en CPU con una latencia de milisegundos por decisión, dependiendo de la complejidad de la red.
- No se requiere una GPU para inferencia; una CPU moderna es suficiente para un agente de este tipo.
- Para el entrenamiento original se necesitaría una GPU (por ejemplo, una NVIDIA GTX 1660 o superior) para acelerar los gradientes, pero no se especifica.
- Para el despliegue en Unity, se usa el runtime de ML-Agents (Unity ML-Agents Toolkit), que carga el archivo ONNX en el motor de inferencia de Barracuda.
- No se proporcionan datos de latencia ni throughput medidos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (agentes de RL para SoccerTwos) con datos de rendimiento publicados. Existen otros repositorios de modelos similares como `PHL99/poca-SoccerTwos`, `aiartwork/poca-SoccerTwos` y `matt179/poca-SoccerTwos`, pero no se han publicado métricas de rendimiento ni especificaciones técnicas en la información disponible.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en el entorno SoccerTwos de Unity; no es un modelo de propósito general y no puede realizar tareas fuera de este entorno.
- No se ha documentado la arquitectura de la red, los hiperparámetros de entrenamiento ni el tamaño del dataset, lo que dificulta evaluar su calidad o reproducir el entrenamiento.
- La licencia no está especificada, por lo que el uso comercial puede ser incierto; se recomienda contactar con el autor antes de un uso comercial.
- No se han publicado benchmarks ni métricas de rendimiento, por lo que no se puede garantizar que el agente juegue de forma competitiva frente a otros agentes.
- Riesgo de alucinación no aplica, ya que no genera texto.
- El modelo es de un solo entorno y no generaliza a otras tareas de Unity ML-Agents.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Yoko999/poca-SoccerTwos
- Documentación de Unity ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Curso de Deep RL de Hugging Face (unit 5): https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Curso de Deep RL de Hugging Face (unit bonus 1): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Modelo similar en BimAnt Zoo: https://zoo.bimant.com/model/327044
- Modelo similar en Hugging Face (aiartwork): https://huggingface.co/aiartwork/poca-SoccerTwos
- Modelo similar en Hugging Face (matt179): https://huggingface.co/matt179/poca-SoccerTwos
- Modelo similar en Hugging Face (AlGM93): https://huggingface.co/AlGM93/POCA-SoccerTwos
