# WyattBridges/SoccerTwos

## Resumen

SoccerTwos es un modelo de aprendizaje por refuerzo profundo entrenado con la librería Unity ML-Agents para jugar al entorno SoccerTwos, una tarea de fútbol 2 contra 2 en la que varios agentes cooperan y compiten dentro de un mismo escenario simulado. Lo publica el usuario WyattBridges en Hugging Face y se distribuye como un artefacto de política entrenada (ficheros `.nn` / `.onnx`), no como un modelo de lenguaje: no genera texto ni procesa instrucciones en lenguaje natural, sino que mapea observaciones del entorno a acciones de movimiento y patada.

El modelo se enmarca en el ecosistema de referencia de Unity ML-Agents, que emplea algoritmos como PPO (Proximal Policy Optimization) sobre redes neuronales pequeñas para controlar agentes en entornos físicos simulados. La model card indica que se trata de un agente del tipo "poca" entrenado para SoccerTwos, pero no detalla la arquitectura exacta de la red, el número de parámetros ni la configuración de entrenamiento empleada. El repositorio ocupa 0,2 GB, un tamaño compatible con los checkpoints y logs de TensorBoard que ML-Agents genera durante el entrenamiento.

Su relevancia es acotada y experimental: sirve como ejemplo reproducible de entrenamiento de agentes multiagente con ML-Agents y como política jugable directamente en el navegador a través del visor de Hugging Face. No está pensado para aplicaciones de producción ni para tareas fuera del entorno SoccerTwos, y no se han publicado métricas de rendimiento ni detalles de licencia que permitan evaluar su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política de ML-Agents (algoritmo y capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `.nn` (formato nativo de ML-Agents) y `.onnx` |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura concreta de la red neuronal ni el algoritmo de entrenamiento empleado. Por el ecosistema en el que se publica (Unity ML-Agents), lo habitual es que se trate de una política entrenada con PPO sobre una red de perceptrón multicapa que recibe observaciones vectoriales del entorno SoccerTwos (posiciones, velocidades y estado de balón y agentes) y emite acciones discretas de movimiento y patada. El autor etiqueta el agente como "poca", un identificador de la ejecución de entrenamiento, no un tipo de arquitectura.

Tampoco se detallan el número de pasos de entrenamiento, la composición del dataset (en RL no hay dataset en el sentido supervisado, sino experiencia generada por interacción con el entorno), ni si se aplicaron técnicas como recompensas intrínsecas, currículo o self-play. La model card únicamente indica que el entrenamiento puede reanudarse con `mlagents-learn <config>.yaml --run-id=<run_id> --resume`, lo que sugiere que el repositorio incluye los checkpoints y la configuración necesarios para continuar el proceso.

## Capacidades

- Control de agentes en el entorno SoccerTwos de Unity ML-Agents: movimiento y acciones de juego dentro del escenario 2 contra 2.
- Comportamiento multiagente cooperativo y competitivo, según la configuración del entorno.
- Inferencia en formato `.nn` para el runtime de ML-Agents y exportación a `.onnx` para ejecución en otros entornos compatibles.
- Visualización directa en el navegador mediante el visor de modelos de Hugging Face (selección del fichero `.nn` o `.onnx`).
- Reanudación del entrenamiento a partir de los checkpoints publicados.
- No soporta tool calling, function calling, razonamiento multi-paso en lenguaje natural, capacidades multilingües, visión, audio ni modo de razonamiento explícito: es una política de RL específica de una tarea.

## Casos de uso

- Investigación en aprendizaje por refuerzo multiagente: usar el checkpoint como línea base reproducible para comparar algoritmos (PPO frente a otras variantes) en el entorno SoccerTwos.
- Docencia y formación: emplear el agente como ejemplo práctico en cursos sobre ML-Agents, mostrando el ciclo completo de entrenamiento, publicación en el Hub y visualización en el navegador.
- Reanudación y ajuste fino: continuar el entrenamiento con `mlagents-learn --resume` para experimentar con hiperparámetros, recompensas o currículos sin partir de cero.
- Evaluación de entornos de simulación: integrar la política `.onnx` en pipelines de evaluación automatizada para medir la robustez del entorno SoccerTwos ante distintos niveles de habilidad.
- Demostraciones interactivas: desplegar el agente en el visor web de Hugging Face para mostrar comportamiento emergente en charlas o materiales divulgativos.
- Pruebas de integración de ML-Agents: validar toolchains de exportación `.nn` a `.onnx` y la compatibilidad con el runtime de Unity en proyectos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; al tratarse de una red de política pequeña típica de ML-Agents, la inferencia cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU compatible con Unity o con el runtime de ONNX es suficiente para la inferencia. Para reentrenamiento, se recomienda una GPU dedicada (por ejemplo, RTX 3060 o superior) por la velocidad de simulación.
- Cabe en GPU consumer: sí, con margen amplio; el cuello de botella habitual en ML-Agents es la simulación del entorno, no la red.
- Opciones de despliegue: runtime de Unity ML-Agents (fichero `.nn`), ONNX Runtime (fichero `.onnx`) y el visor web de Hugging Face para reproducción en navegador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| WyattBridges/SoccerTwos | SoccerTwos (ML-Agents) | `.nn`, `.onnx` | no disponible | Hugging Face, 0 descargas |
| Agentes SoccerTwos de la organización Unity en Hugging Face | SoccerTwos (ML-Agents) | `.nn`, `.onnx` | no disponible | Hugging Face (organización unity) |
| Otros agentes ML-Agents publicados en el Hub (p. ej., Huggy the Dog) | Entornos varios de ML-Agents | `.nn`, `.onnx` | variable según autor | Hugging Face |

No se dispone de datos de rendimiento de este modelo ni de comparativas cuantitativas con alternativas, por lo que la comparación se limita a formato, entorno y disponibilidad.

## Limitaciones y advertencias

- Modelo específico de una única tarea (SoccerTwos); no generaliza a otros entornos ni a tareas de lenguaje.
- Sin licencia declarada: no se puede asumir permiso de uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sin métricas publicadas de rendimiento, tasa de victoria ni robustez, lo que impide evaluar su calidad objetivamente.
- No se documentan sesgos, pero al ser una política entrenada por refuerzo puede exhibir comportamientos degenerados o explotar fallos del simulador (reward hacking).
- El repositorio incluye logs de TensorBoard y checkpoints; su contenido exacto no está verificado, por lo que conviene inspeccionarlo antes de reutilizarlo.
- Sin garantías de mantenimiento ni actualizaciones (0 descargas y 0 likes en el momento de la consulta).
- La fecha de creación indicada (2026-11-11) es posterior a la fecha habitual de referencia y podría reflejar un error de metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WyattBridges/SoccerTwos
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto (Huggy the Dog): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes de Unity en Hugging Face: https://huggingface.co/unity
