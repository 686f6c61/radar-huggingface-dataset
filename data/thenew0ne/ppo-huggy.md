# TheNew0ne/ppo-Huggy

## Resumen

`TheNew0ne/ppo-Huggy` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) para el entorno **Huggy** de Unity ML-Agents, en el que un perro virtual debe aprender a recoger un palo y devolverlo. No es un modelo de lenguaje ni un modelo generativo: es una política de control continuo exportada desde el toolkit de ML-Agents y publicada en Hugging Face mediante la librería `ml-agents`.

El modelo lo publica el usuario `TheNew0ne` como checkpoint de un entrenamiento propio, presumiblemente siguiendo el curso de deep reinforcement learning de Hugging Face, que usa este mismo entorno como ejercicio introductorio. El repositorio ocupa 0,2 GB e incluye los artefactos habituales de ML-Agents: pesos en formato nativo `.nn` y exportación `.onnx`, además de los tags `tensorboard` y `onnx` que indican que se generaron logs de entrenamiento y una versión portable del grafo.

Su relevancia es fundamentalmente didáctica y experimental: sirve como ejemplo reproducible de un pipeline completo de RL (entrenamiento con `mlagents-learn`, exportación a ONNX e inferencia en el navegador vía Unity WebGL). No hay que esperar de él capacidades generales: su dominio se limita a la física y las observaciones del entorno Huggy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política y función de valor entrenada con PPO sobre Unity ML-Agents; topología exacta (capas, unidades, sensores) no disponible |
| Parametros totales | No disponible (no se documenta el número de pesos de la red) |
| Longitud de contexto | No aplica; el agente consume observaciones por paso (vectores y sensores de percepción del entorno Huggy). Dimensión exacta no disponible |
| Tipos de cuantizacion | No disponible; se distribuye en precisión de entrenamiento y exportación ONNX estándar |
| Idiomas soportados | No aplica (no procesa lenguaje natural) |
| Licencia | No disponible (el repositorio no declara licencia) |
| Formato de pesos | `.nn` (formato nativo de ML-Agents) y `.onnx` (exportación para inferencia) |
| Tipo de modelo | Agente de reinforcement learning (control continuo en 3D) |
| Algoritmo | PPO (Proximal Policy Optimization) |
| Entorno | Huggy (Unity ML-Agents) |
| Tarea | Recogida y devolución de un palo por parte de un perro virtual |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos) | 2026-10-28 |

## Arquitectura y entrenamiento

El agente se entrena con PPO, un algoritmo *on-policy* de gradiente de política con recorte de la ratio de probabilidad (*clipped surrogate objective*) para limitar la magnitud de cada actualización. En ML-Agents, PPO optimiza simultáneamente una política (que produce la acción, continua en este entorno) y una función de valor (que estima el retorno), habitualmente implementadas como perceptrón multicapa que concatena observaciones vectoriales y lecturas de *ray perception sensors*. La model card no especifica el número de capas, el tamaño de las capas ocultas, el número de sensores ni la parametrización de las acciones, por lo que estos datos deben considerarse **no disponibles**.

Tampoco se documentan el número de pasos de entrenamiento, la configuración del fichero YAML, el uso de *curriculum learning*, recompensas de imitación (GAIL/BC), ni el número de semillas ejecutadas. Los tags `tensorboard` y `onnx` sugieren que existen logs de entrenamiento y una exportación portable, pero no se han publicado curvas de recompensa ni métricas de evaluación en el repositorio. No consta ninguna innovación técnica propia: es una aplicación estándar del *trainer* PPO de ML-Agents.

## Capacidades

- Control continuo de un agente embodied en un entorno 3D: el modelo emite acciones de movimiento (desplazamiento, giro y salto) a partir de observaciones del entorno.
- Navegación hacia objetivos y manipulación simple de objetos físicos (recoger un palo y desplazarlo).
- Inferencia en tiempo real a partir de una política entrenada, sin bucle de planificación ni búsqueda.
- Exportación a ONNX para ejecución fuera del ecosistema Unity (ONNX Runtime, etc.).
- Reproducción de la política en el navegador mediante el visor de Hugging Face (`Watch the agent play`).
- Reanudación del entrenamiento con `mlagents-learn ... --resume` para continuar el ajuste.
- No soporta tool calling, ni agentes multi-paso basados en lenguaje, ni capacidades multilingües, ni visión genérica, ni matemáticas, ni razonamiento simbólico.

## Casos de uso

- **Docencia y tutoriales de RL**: servir como checkpoint de referencia en el curso de deep reinforcement learning de Hugging Face (unidad bonus sobre Huggy), permitiendo al alumno comparar su propia política con una ya entrenada.
- **Demo interactiva en navegador**: cargar el `.onnx` en el visor de Hugging Face o en un Space con Unity WebGL para mostrar el comportamiento del agente sin instalar nada, útil en charlas y materiales divulgativos.
- **Punto de partida para reentrenamiento**: usar `--resume` para continuar el entrenamiento con otro YAML (por ejemplo, cambiando la recompensa o añadiendo *curriculum*) y estudiar cómo evoluciona la política desde un estado ya competente.
- **Comparación de algoritmos**: ejecutar PPO y SAC de ML-Agents sobre el mismo entorno y comparar curvas de recompensa acumulada y estabilidad, usando este checkpoint como línea base PPO.
- **Validación de pipelines de exportación ONNX**: comprobar que un modelo exportado desde ML-Agents produce las mismas acciones que el `.nn` original, integrando la inferencia en C#, Python u otro runtime ONNX.
- **Generación de trayectorias para imitation learning**: ejecutar la política para recolectar demostraciones (pares observación-acción) y entrenar por *behavior cloning* un modelo más pequeño o un controlador alternativo.
- **Prototipado de NPCs**: emplear el agente como referencia de comportamiento simple en prototipos de videojuegos con Unity, midiendo el coste de inferencia en dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye recompensa media, recompensa acumulada, tasa de éxito en la tarea ni comparaciones con otras políticas. Tampoco se aportan curvas de TensorBoard pese a la presencia del tag correspondiente.

## Requisitos de hardware

- **Inferencia**: al tratarse de una red pequeña de control, la inferencia cabe holgadamente en CPU. No se requiere GPU; el cuello de botella es el motor Unity y la simulación física, no la política.
- **VRAM estimada**: no disponible; para una red de este tipo el uso es negligible (órdenes de decenas o pocos cientos de MB en el runtime). No se publica medición.
- **GPU recomendadas para entrenamiento**: no hay requisitos publicados. ML-Agents puede entrenar en CPU, aunque el entrenamiento se acelera con GPU (cualquier GPU consumer moderna tipo RTX 3060 o superior es suficiente; no se han publicado cifras concretas para este checkpoint).
- **Cabe en GPU consumer**: sí, en cualquier GPU consumer, y en muchos casos ni siquiera es necesaria.
- **Despliegue**: Unity Sentis (antes Barracuda) para `.onnx` dentro de Unity; Unity WebGL para el visor del Hub; `mlagents-envs` + `UnityEnvironment` para evaluación en Python; ONNX Runtime para integración fuera de Unity.
- **Latencia y throughput**: no disponibles. En el visor del Hub la latencia percibida vendrá dominada por el renderizado web y la simulación, no por la política.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parámetros | Contexto / observaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `TheNew0ne/ppo-Huggy` | PPO | Huggy (ML-Agents) | No disponible | Observaciones por paso; dimensión no disponible | No disponible | Pública en Hugging Face |
| Otros checkpoints `ppo-Huggy` publicados por la comunidad o por Unity | PPO | Huggy (ML-Agents) | No disponible | No disponible | Variable, a menudo no declarada | Públicos en Hugging Face |
| Agente SAC entrenado con ML-Agents en el mismo entorno | SAC (off-policy) | Huggy (ML-Agents) | No disponible | No disponible | Depende del autor | Requiere entrenamiento propio |
| Política de *behavior cloning* a partir de demostraciones | Supervisado | Huggy (ML-Agents) | No disponible | No disponible | Depende del autor | Requiere entrenamiento propio |

No se dispone de métricas comparativas publicadas (recompensa media, tasa de éxito, pasos hasta convergencia) para ninguno de estos agentes en la información proporcionada, por lo que la comparación es únicamente cualitativa.

## Limitaciones y advertencias

- **Licencia no declarada**: el repositorio no indica licencia, por lo que no puede asumirse ningún permiso de uso comercial, redistribución o modificación. Es un bloqueo potencial para producción.
- **Sobreajuste al entorno**: la política está entrenada para la física, las recompensas y las observaciones concretas de Huggy. Cualquier cambio en el entorno, la escala del modelo o los parámetros físicos invalida el comportamiento.
- **Sin métricas publicadas**: no hay evidencia cuantitativa del rendimiento del agente (recompensa, tasa de éxito, robustez), lo que impide evaluar su calidad frente a otras políticas.
- **Alcance mínimo**: no es un modelo de lenguaje ni un modelo multimodal; no procesa texto, no tiene ventana de contexto conversacional y no responde a instrucciones.
- **Riesgo de alucinación**: no aplica en el sentido habitual; el riesgo equivalente es una política que ejecute acciones sin sentido ante observaciones fuera de distribución (por ejemplo, si el agente es teletransportado o el palo queda en una posición imposible).
- **Documentación insuficiente**: no se especifican hiperparámetros, número de pasos, semillas ni composición del entrenamiento, lo que dificulta la reproducibilidad.
- **Tamaño del repositorio**: 0,2 GB para un agente de control es un tamaño elevado, probablemente por checkpoints intermedios y logs de TensorBoard; conviene revisar el contenido antes de descargarlo en entornos con almacenamiento limitado.
- **Metadatos inconsistentes**: la fecha de creación registrada (2026-10-28) no coincide con un repositorio ya publicado en el momento de la consulta; conviene verificar la procedencia antes de reutilizarlo.
- **Sin garantía de soporte**: 0 descargas y 0 likes; no hay comunidad ni mantenimiento detrás del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheNew0ne/ppo-Huggy
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto (entrenar a Huggy y jugar en el navegador): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Organización de Unity en Hugging Face (visor de agentes): https://huggingface.co/unity
