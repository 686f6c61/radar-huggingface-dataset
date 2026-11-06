# WyattBridges/ppo-Huggy

## Resumen

`WyattBridges/ppo-Huggy` es un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno Huggy, uno de los escenarios de ejemplo incluidos en la librería Unity ML-Agents. Lo desarrolla el usuario WyattBridges y se publica en Hugging Face Hub como artefacto de un entrenamiento reproducido con la herramienta `mlagents-learn`. No es un modelo de lenguaje: no genera texto, no razona sobre instrucciones y no procesa lenguaje natural. Su función es controlar la política de un agente dentro de una simulación Unity.

El modelo resuelve una tarea concreta de control motor dentro del entorno Huggy, en el que un perro virtual aprende a recoger un palo mediante observaciones y recompensas proporcionadas por el simulador. Es relevante únicamente como ejemplo didáctico y como punto de partida reproducible para quien esté aprendiendo a entrenar agentes con ML-Agents y a publicarlos en el Hub. Su utilidad práctica fuera de ese contexto es muy limitada.

El repositorio ocupa 0,2 GB y contiene los pesos exportados en formato ONNX junto con artefactos de TensorBoard. No se dispone de información sobre arquitectura de red, hiperparámetros, número de pasos de entrenamiento ni métricas de recompensa alcanzadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor para PPO (detalles de capas no disponibles) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente de RL, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (`.onnx`) y pesos nativos de ML-Agents (`.nn`) |

## Arquitectura y entrenamiento

Se trata de un agente PPO entrenado con Unity ML-Agents sobre el entorno Huggy. PPO es un algoritmo de gradiente de política con recorte de la ratio de probabilidad (*clipped surrogate objective*) que combina una red de política (actor) y una red de valor (crítico). La model card no especifica el número de capas, el tamaño de las capas ocultas, la tasa de aprendizaje, el tamaño de lote, el número de pasos totales ni la composición de las observaciones (vectoriales, visuales o mixtas).

El entrenamiento se realizó con `mlagents-learn` y puede reanudarse mediante el comando `mlagents-learn <config.yaml> --run-id=<run_id> --resume`. El repositorio incluye artefactos de TensorBoard, lo que permite inspeccionar curvas de recompensa y pérdidas si se descargan, aunque no se han publicado resúmenes de esas métricas en la información disponible. No hay constancia de innovaciones técnicas adicionales (recompensas por curiosidad, imitación, decodificación especulativa ni mecanismos similares).

## Capacidades

- Control de un agente dentro del entorno Huggy de Unity ML-Agents.
- Toma de decisiones por política entrenada a partir de observaciones del simulador (no se detalla la naturaleza de esas observaciones).
- Exportación a ONNX para inferencia dentro de Unity o en otros runtimes compatibles.
- Reproducción y reanudación del entrenamiento con la configuración adecuada de ML-Agents.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico basado en lenguaje.
- No tiene capacidades multilingües.
- No dispone de modo *thinking*, audio ni otras capacidades especiales.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo resuelto de un agente PPO en ML-Agents para que estudiantes comparen su propio entrenamiento con uno publicado.
- Reproducción de experimentos: permite reanudar el entrenamiento con `--resume` y estudiar la evolución de las curvas de TensorBoard incluidas en el repositorio.
- Prueba de pipelines de exportación ONNX: útil para validar el flujo de ML-Agents a ONNX y la carga del modelo en Unity o en un runtime de inferencia compatible.
- Integración en demos interactivas del Hub: el agente puede visualizarse con el reproductor de agentes de Hugging Face (https://huggingface.co/unity) seleccionando el archivo `.onnx` del repositorio.
- Referencia para publicación de modelos en el Hub: muestra la estructura mínima de un repositorio de ML-Agents con metadatos `library_name: ml-agents` y etiquetas de tarea.
- Base para comparaciones de algoritmos: al ser un PPO sobre Huggy, puede contrastarse con agentes entrenados con otros algoritmos (SAC, POCA) en el mismo entorno, siempre que se disponga de las métricas de recompensa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio (0,2 GB) incluye pesos ONNX y artefactos de TensorBoard, pero no se detalla el tamaño de la red. Un agente de política para un entorno ML-Agents de ejemplo suele ser de pocos miles de parámetros, por lo que la inferencia cabría en cualquier GPU consumer.
- GPU recomendadas: no disponible. Para inferencia de un agente de este tipo, cualquier GPU integrada o dedicada moderna es suficiente; para reentrenamiento conviene una GPU dedicada (RTX 3060 o superior) por comodidad, aunque no hay datos que lo confirmen.
- GPU consumer: previsiblemente sí, en cualquier GPU con soporte ONNX Runtime o con Unity; no confirmado por el autor.
- Opciones de despliegue: Unity ML-Agents (runtime nativo), ONNX Runtime, y el visor de agentes de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WyattBridges/ppo-Huggy | Huggy (ML-Agents) | PPO | ONNX / .nn | no disponible | Hugging Face Hub |
| Agentes oficiales de Unity en `huggingface.co/unity` | Varios entornos ML-Agents | PPO y otros | ONNX / .nn | según el repositorio | Hugging Face Hub |
| Agentes de ejemplo del curso Deep RL de Hugging Face | Huggy y otros | PPO | ONNX / .nn | según el repositorio | Hugging Face Hub |

No se dispone de datos de rendimiento de este agente que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K ni usarse para tareas de texto.
- La política está especializada en el entorno Huggy; no generaliza a otras tareas sin reentrenamiento.
- No se especifica la licencia, por lo que el uso comercial queda sin garantías jurídicas hasta que el autor la declare.
- No se documentan hiperparámetros ni número de pasos, lo que dificulta la reproducibilidad exacta del entrenamiento.
- No se publican métricas de recompensa ni curvas resumidas; el rendimiento real del agente es desconocido sin ejecutarlo.
- Al ser un artefacto de ejemplo con 0 descargas y 0 likes, no hay validación comunitaria de su calidad.
- Riesgo de sobreajuste al escenario concreto de entrenamiento y de comportamiento frágil ante variaciones del entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WyattBridges/ppo-Huggy
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto (Huggy en el navegador): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Visor de agentes de Hugging Face: https://huggingface.co/unity
