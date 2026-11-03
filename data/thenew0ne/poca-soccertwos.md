# TheNew0ne/poca-SoccerTwos

## Resumen

`poca-SoccerTwos` es un agente entrenado con aprendizaje por refuerzo profundo (deep reinforcement learning) para el entorno `SoccerTwos` de Unity ML-Agents. Lo publica el usuario `TheNew0ne` en HuggingFace y emplea el algoritmo POCA (Policy Optimization with Clipped Advantages), una variante de PPO orientada a entornos multijugador competitivos y cooperativos. El modelo no es un modelo de lenguaje: es una politica neuronal que controla agentes dentro de una simulacion de futbol 2 contra 2.

El repositorio es de tipo `ml-agents` y contiene los artefactos de entrenamiento exportados en formato `.nn` y `.onnx`, junto con los ficheros de TensorBoard asociados al proceso de entrenamiento. El tamano del repositorio es de 0.0 GB, lo que sugiere que los pesos son ligeros y no se han subido checkpoints intermedios de gran tamano. El pipeline declarado en HuggingFace es `reinforcement-learning`.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigacion y experimentacion en RL, no de un modelo de proposito general. No hay model card extendida, no se declara licencia y no se publican resultados de evaluacion. Cualquier uso en produccion requeriria validar el comportamiento del agente en el entorno Unity ML-Agents y verificar los terminos de uso del propio entorno y de la libreria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica entrenada con ML-Agents (algoritmo POCA); topologia exacta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (artefactos `.nn` y `.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `.nn` (formato nativo de ML-Agents) y `.onnx` |

## Arquitectura y entrenamiento

El agente se entrena con la libreria Unity ML-Agents usando el algoritmo POCA, una extension de PPO pensada para entornos con multiples agentes que comparten politica y compiten o cooperan. En `SoccerTwos` dos equipos de dos agentes se enfrentan en un campo reducido, con observaciones vectoriales y recompensas dispersas basadas en goles y posesion. La politica consume observaciones del entorno (posiciones, velocidades, estado del balon) y emite acciones discretas de movimiento y patada.

No se dispone de informacion sobre el numero de pasos de entrenamiento, la configuracion del fichero YAML, el tamano de las capas ocultas, el uso de recompensas intrínsecas ni si se aplicaron tecnicas como self-play o curricula. Los tags del repositorio indican el uso de TensorBoard para monitorizar el entrenamiento y la exportacion a ONNX para inferencia fuera de Unity. No se documenta ningun tipo de ajuste fino supervisado ni RLHF, lo cual es esperable en un agente de RL.

## Capacidades

- Control de agentes en el entorno `SoccerTwos` de Unity ML-Agents: movimiento, orientacion y patada del balon.
- Juego cooperativo y competitivo 2 contra 2 dentro de la simulacion.
- Inferencia en tiempo real dentro de Unity mediante el formato `.nn`.
- Exportacion a ONNX para ejecutar la politica fuera del motor Unity.
- Monitorizacion del entrenamiento mediante los logs de TensorBoard incluidos en el repositorio.
- Reanudacion del entrenamiento con `mlagents-learn` usando el flag `--resume`.

No se documentan capacidades de generacion de texto, razonamiento simbolico, codigo, vision, audio, tool calling ni agentes multi-paso fuera del entorno de simulacion.

## Casos de uso

- Investigacion en RL multiagente: usar el agente como baseline o punto de partida para estudiar POCA frente a PPO en `SoccerTwos`, comparando curvas de recompensa en TensorBoard.
- Docencia y tutoriales de ML-Agents: el agente sirve como ejemplo ejecutable del flujo completo de entrenamiento, exportacion e inferencia descrito en los tutoriales oficiales de HuggingFace.
- Evaluacion de algoritmos de self-play: cargar el agente como oponente fijo mientras se entrena una politica nueva, para medir la mejora relativa contra un rival preentrenado.
- Demostraciones interactivas en navegador: el visor de HuggingFace permite ejecutar el `.nn` o `.onnx` directamente y observar el comportamiento del agente sin instalar Unity.
- Pruebas de integracion de ONNX Runtime: usar el `.onnx` exportado para validar pipelines de inferencia en Python o C# fuera del ecosistema ML-Agents.
- Benchmarking de infraestructura de entrenamiento: reanudar el entrenamiento con `--resume` para medir throughput y escalado en distintas GPUs o configuraciones de ML-Agents.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; al tratarse de una politica ligera de ML-Agents, cabe en cualquier GPU consumer con 4 GB o menos, e incluso puede ejecutarse en CPU.
- GPU recomendadas para inferencia: no requiere GPU dedicada; cualquier iGPU o CPU moderna es suficiente. Para entrenamiento se recomienda al menos una RTX 3060 o superior.
- Cabe en GPU consumer: si, en practicamente cualquier modelo (GTX 1050, RTX 2060, RTX 4090, etc.).
- Opciones de despliegue: Unity ML-Agents (formato `.nn`), ONNX Runtime (formato `.onnx`), visor web de HuggingFace para ML-Agents.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del numero de agentes simulados simultaneamente.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `TheNew0ne/poca-SoccerTwos` | SoccerTwos | POCA | `.nn`, `.onnx` | no disponible | HuggingFace |
| Agentes oficiales de Unity en `huggingface.co/unity` | SoccerTwos y otros | PPO / POCA | `.nn`, `.onnx` | segun repositorio | HuggingFace |
| Modelos de la unidad 5 del curso Deep RL de HuggingFace | SoccerTwos | PPO | `.nn` | segun repositorio | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial queda sin autorizacion explicita y requiere contactar con el autor.
- No hay model card detallada: se desconoce la configuracion exacta de entrenamiento, hiperparametros y numero de pasos.
- El agente esta especializado en `SoccerTwos`; no generaliza a otros entornos ni tareas.
- No se han publicado metricas de evaluacion (win rate, recompensa media, etc.), por lo que su calidad relativa es desconocida.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- La fecha de creacion indicada (2026-11-02) es futura respecto a la redaccion habitual de fichas; conviene verificar la integridad del repositorio antes de usarlo.
- El rendimiento en produccion depende del entorno Unity, la version de ML-Agents y la configuracion de inferencia; no hay garantias de reproducibilidad.
- Al ser un agente RL, puede presentar comportamientos degenerados o explotar recompensas de forma no prevista segun el escenario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheNew0ne/poca-SoccerTwos
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentacion de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto de HuggingFace (Huggy the Dog): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes ML-Agents en HuggingFace: https://huggingface.co/unity
