# swulfen/poca-SoccerTwos

## Resumen

`swulfen/poca-SoccerTwos` es un agente de aprendizaje por refuerzo entrenado con el algoritmo POCA (Policy Optimization with Clipped Advantages, la implementación de PPO que ofrece Unity ML-Agents) para el entorno `SoccerTwos` de Unity ML-Agents. No es un modelo de lenguaje: es una política neuronal que controla a los jugadores de un equipo de dos contra dos en un campo de fútbol simulado en 3D. Lo publica el usuario `swulfen` en Hugging Face con fecha de creación del 1 de noviembre de 2026 y un tamaño de repositorio de 0,2 GB.

El entorno `SoccerTwos` forma parte de los entornos de referencia de ML-Agents y se usa habitualmente como banco de pruebas de aprendizaje multiagente cooperativo-competitivo: dos equipos de dos agentes cada uno comparten recompensa dentro del equipo y compiten contra el rival. El interés de esta ficha es, por tanto, documentar un artefacto de RL reproducible (pesos `.nn`/`.onnx` cargables con `mlagents-learn` y visualizables en el navegador vía Hugging Face) más que evaluar capacidades generativas.

La información publicada por el autor es mínima: la model card es la plantilla estándar de ML-Agents y no incluye hiperparámetros, curvas de entrenamiento, número de pasos ni resultados de evaluación. Cualquier dato de rendimiento debe considerarse no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor para RL (ML-Agents, algoritmo POCA/PPO); topología concreta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observaciones por paso del entorno SoccerTwos) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en formato nativo ML-Agents y ONNX) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | `.nn` (ML-Agents) y `.onnx` (según la model card) |

## Arquitectura y entrenamiento

El agente se entrena con la librería Unity ML-Agents, que implementa POCA como variante de PPO para entornos con recompensas dispersas y múltiples agentes. La política consume observaciones del entorno `SoccerTwos` (estado de los agentes, posición del balón y del campo, en forma vectorial y/o visual según la configuración del entorno) y produce acciones discretas de movimiento y patada. El repositorio incluye artefactos de TensorBoard (tag `tensorboard`), lo que sugiere que el autor registró curvas de entrenamiento, aunque estas no se describen en la model card.

No se dispone de información sobre el número de pasos de entrenamiento, la configuración YAML empleada, el tamaño de la red, el uso de recompensas intrínsecas (curiosity, RND) ni el número de entornos paralelos. La model card solo documenta cómo reanudar el entrenamiento (`mlagents-learn <config>.yaml --run-id=<run_id> --resume`) y cómo visualizar al agente en el navegador desde la organización `unity` de Hugging Face. No hay evidencia publicada de innovaciones técnicas adicionales.

## Capacidades

- Control de un agente jugador en el entorno `SoccerTwos` de ML-Agents (fútbol 2 contra 2 simulado).
- Comportamiento multiagente cooperativo dentro del equipo y competitivo frente al rival, aprendido por refuerzo.
- Política entrenada para decisiones paso a paso en un entorno parcialmente observable y con física simulada.
- Exportación a ONNX, lo que permite inferencia fuera del runtime de ML-Agents (Unity Barracuda/Sentis u otros runtimes ONNX).
- Reanudación del entrenamiento desde los pesos publicados mediante `mlagents-learn --resume`.
- No soporta generación de texto, razonamiento simbólico, código, matemáticas, visión general, tool calling ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Evaluación de algoritmos de RL multiagente: cargar los pesos y comparar la política POCA frente a otras políticas (PPO, SAC, self-play) en el mismo entorno `SoccerTwos` para medir wins/losses y recompensa media por episodio.
- Punto de partida para fine-tuning con self-play: reanudar el entrenamiento con `--resume` y enfrentar al agente contra versiones anteriores o contra sí mismo para mejorar la robustez táctica.
- Demostración educativa de ML-Agents: usar el visor de Hugging Face (`https://huggingface.co/unity`) para mostrar en el navegador cómo un agente aprendido juega al fútbol, útil en cursos de deep RL.
- Integración en pipelines de CI para RL: ejecutar episodios automatizados con los pesos `.onnx` y verificar que la política mantiene una tasa de victorias mínima tras cambios en el entorno o en la física.
- Benchmark interno de infraestructura de simulación: medir throughput de pasos por segundo y latencia de inferencia de la política en Unity con distintos backends (Barracuda, Sentis, ONNX Runtime).
- Base para investigación en recompensas y curricula: sustituir la recompensa por defecto de `SoccerTwos` y evaluar si la política preentrenada acelera la convergencia en variantes del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio completo ocupa 0,2 GB, por lo que la política cabe holgadamente en cualquier GPU consumer (menos de 1 GB en la mayoría de configuraciones). No se dispone de la cifra exacta de parámetros.
- GPU recomendadas: cualquiera compatible con Unity (GTX 1060 o superior) para el renderizado del entorno; para entrenamiento se recomienda RTX 3060/4070 o superior, o A100/H100 si se paralelizan muchos entornos.
- Cabe en GPU consumer: sí, con margen amplio; también puede ejecutarse en CPU para inferencia, aunque el cuello de botella será la simulación física de Unity.
- Opciones de despliegue: `mlagents-learn` para reanudar entrenamiento, Unity Inference Engine (Barracuda/Sentis) para ejecutar `.nn`, ONNX Runtime para los `.onnx`, y el visor web de Hugging Face para reproducción en navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| swulfen/poca-SoccerTwos | SoccerTwos | POCA (PPO) | no disponible | no disponible | Hugging Face (`swulfen/poca-SoccerTwos`) |
| unity/ml-agents SoccerTwos (referencia) | SoccerTwos | PPO/POCA | no disponible | según ML-Agents (Apache 2.0 en la librería) | Repositorio oficial de Unity ML-Agents |
| Políticas del Hugging Face Deep RL Course | varios (Huggy, SnowballTarget, etc.) | PPO | no disponible | según el curso | Hugging Face (`unity` org) |

No se dispone de datos de rendimiento comparables entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- Específico del entorno: la política solo es válida para `SoccerTwos` con la configuración de observaciones y acciones con la que se entrenó; no generaliza a otros entornos ni a variantes con distinta física o tamaño de equipo.
- Sin datos de evaluación: no hay métricas publicadas de tasa de victorias, recompensa media ni robustez frente a oponentes no vistos, por lo que no puede recomendarse para producción sin una validación propia.
- Licencia no declarada: al no indicarse licencia, no hay autorización explícita para uso comercial; debe contactarse con el autor o asumir el régimen por defecto de Hugging Face antes de reutilizarlo.
- Riesgo de sobreajuste al oponente: en entornos multiagente, una política entrenada contra un rival fijo puede explotar comportamientos concretos y degradarse frente a oponentes distintos; se recomienda evaluar con self-play.
- Sin información de sesgos ni de seguridad: al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero sí posibles comportamientos degenerados (agentes que se quedan quietos, colisiones repetidas) derivados de un entrenamiento insuficiente o de recompensas mal calibradas.
- Reproducibilidad limitada: la model card no incluye la configuración YAML ni la semilla, por lo que reproducir exactamente el entrenamiento no es posible con la información publicada.
- Fecha de creación futura (2026-11-01): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/swulfen/poca-SoccerTwos
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto del Deep RL Course (Huggy): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo del Deep RL Course (ML-Agents): https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes de Hugging Face: https://huggingface.co/unity
