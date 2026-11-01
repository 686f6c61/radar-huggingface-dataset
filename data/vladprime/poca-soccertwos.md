# Vladprime/poca-SoccerTwos

## Resumen

`Vladprime/poca-SoccerTwos` es un modelo de aprendizaje por refuerzo entrenado con el algoritmo MA-POCA (Multi-Agent POsthumous Credit Assignment) sobre el entorno SoccerTwos de Unity ML-Agents. Lo desarrolla Vlad Kolomiiets (usuario `Vladprime`) como parte del curso oficial de Deep RL de Hugging Face, y su propósito es demostrar el flujo completo de entrenamiento multiagente en ML-Agents: configuración del entorno, entrenamiento self-play, exportación a ONNX y evaluación posterior. No es un modelo de lenguaje ni un sistema generativo: es una política de control entrenada para jugar al fútbol 2 contra 2 en un entorno simulado.

El entrenamiento parte de inicialización aleatoria, sin pesos preentrenados, durante 30.000 pasos de entorno configurados, con semilla 20261101. El autor indica explícitamente que se trata de una ejecución inicial y que no reclama convergencia del modelo. Los artefactos publicados incluyen el ONNX genuino de ML-Agents, un checkpoint de PyTorch y la configuración del entrenador.

La relevancia del modelo es fundamentalmente didáctica y de referencia: sirve como ejemplo reproducible de un pipeline de RL multiagente con MA-POCA, útil para quien quiera inspeccionar la configuración, reutilizar el ONNX en el visor web del curso o comparar resultados de entrenamientos propios. No está pensado para producción ni para tareas fuera del entorno SoccerTwos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal entrenada con MA-POCA sobre Unity ML-Agents (entorno SoccerTwos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (ML-Agents) y checkpoint de PyTorch |

## Arquitectura y entrenamiento

El modelo se entrena con MA-POCA, un algoritmo de aprendizaje por refuerzo multiagente diseñado para asignar crédito a agentes individuales dentro de equipos cooperativos. En SoccerTwos, dos equipos de dos agentes compiten entre sí en un entorno de Unity, y MA-POCA permite que cada agente reciba una señal de recompensa adecuada aunque el resultado dependa del comportamiento colectivo. La política se implementa con la librería `ml-agents` (versión 1.1.0) y se exporta a ONNX para su ejecución en el visor web del curso.

El entrenamiento se realizó desde inicialización aleatoria, sin pesos preentrenados, con 30.000 pasos de entorno configurados y semilla 20261101. El autor no reporta número de tokens (no aplica), composición de dataset (el entorno genera las experiencias) ni fases de RLHF o DPO. La evaluación se ejecutó en un proceso ONNX separado con semilla 1000000, completando 40 episodios de agente con una recompensa media de -0,1039 y desviación estándar de 0,5858. El autor advierte que los episodios de jugador dentro de un mismo partido están correlacionados y que no se reclama ningún resultado en la clasificación online del curso, que no estaba disponible.

## Capacidades

- Control de agentes en el entorno SoccerTwos de Unity ML-Agents (fútbol 2 contra 2).
- Aprendizaje multiagente cooperativo mediante MA-POCA, con asignación de crédito entre compañeros de equipo.
- Ejecución en el visor web del curso de Deep RL de Hugging Face a través del archivo ONNX.
- Evaluación offline reproducible con semilla fija y registro de retornos individuales en `results.json`.
- Reentrenamiento y ajuste mediante el código de `train-unity.py` y la configuración `config.yaml`.
- No soporta tool calling, function calling, agentes basados en lenguaje, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento. No es un modelo de lenguaje.

## Casos de uso

- Reproducción didáctica del pipeline de RL multiagente: el paquete incluye configuración, checkpoint y ONNX, lo que permite repetir el entrenamiento con la misma semilla y comparar curvas de recompensa.
- Inspección de la configuración de MA-POCA: `config.yaml` sirve como plantilla para ajustar hiperparámetros (learning rate, batch size, reward signals) en entornos propios de ML-Agents.
- Evaluación de políticas en el visor web del curso: el ONNX es compatible con el visor de Unity en navegador, lo que facilita demostraciones sin infraestructura local.
- Punto de partida para experimentos de self-play: el modelo puede servir como política inicial (warm start) en entrenamientos propios de SoccerTwos, aunque el autor no garantiza convergencia.
- Comparación de algoritmos: útil como referencia de MA-POCA frente a PPO u otros algoritmos en el mismo entorno, midiendo recompensa media y desviación.
- Docencia y talleres: ejemplo mínimo y replicable para explicar crédito multiagente, exportación ONNX y evaluación con semillas fijas en cursos de RL.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Reinforcement Learning | ML-Agents-SoccerTwos | mean_reward | -0,1039 +/- 0,5858 |

El autor indica que la evaluación se realizó en un proceso ONNX separado con semilla 1000000 sobre 40 episodios de agente completados, y que los episodios de jugador dentro de un partido están correlacionados. No se declaran resultados en la clasificación online del curso. No se han publicado otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y no se detalla el número de parámetros de la política.
- GPU recomendadas: no disponible. Al ser una política de ML-Agents de pequeño tamaño, es probable que quepa en GPU de consumo, pero no hay datos publicados que lo confirmen.
- Cabe en GPU de consumo: no confirmado por el autor.
- Opciones de despliegue: Unity ML-Agents (runtime de inferencia), ONNX Runtime y el visor web del curso de Deep RL de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Licencia | Disponibilidad |
|---|---|---|---|---|
| Vladprime/poca-SoccerTwos | SoccerTwos (ML-Agents) | MA-POCA | Apache 2.0 | Hugging Face |
| Políticas de referencia del curso Deep RL (SoccerTwos) | SoccerTwos (ML-Agents) | PPO / MA-POCA | según autor | no disponible en la información proporcionada |
| Políticas de referencia de ML-Agents (ejemplos oficiales) | Varios entornos ML-Agents | PPO, SAC, MA-POCA | según repositorio | GitHub de Unity ML-Agents |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que es una ejecución inicial y que no reclama convergencia del modelo.
- La recompensa media es negativa (-0,1039) con desviación estándar alta (0,5858), lo que indica un rendimiento variable y poco fiable.
- Los episodios de jugador dentro de un mismo partido están correlacionados, lo que limita la interpretación estadística de la evaluación.
- No se reclama ningún resultado en la clasificación online del curso, que no estaba disponible.
- El modelo solo es válido para el entorno SoccerTwos con los espacios de observación y acción originales; no generaliza a otras tareas.
- No es un modelo de lenguaje: no tiene capacidades de generación de texto, código, matemáticas, visión ni multilingüismo.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo carece de utilidad práctica fuera del ámbito didáctico y de investigación en RL.
- No se han publicado análisis de sesgos, riesgos de alucinación ni caveats de producción porque no aplican a este tipo de modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vladprime/poca-SoccerTwos
- Curso Deep RL de Hugging Face: https://huggingface.co/learn/deep-rl-course
- Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentación de MA-POCA: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
