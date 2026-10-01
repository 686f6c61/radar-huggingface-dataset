# wonderful0711/nep-6

## Resumen

`wonderful0711/nep-6` es un repositorio alojado en Hugging Face cuyo contenido no es un modelo de lenguaje, sino el paquete de tareas **task-humanoid-run-jump**, una extensión de Nepher Robotics para NVIDIA Isaac Lab / Isaac Sim. El paquete entrena políticas de aprendizaje por refuerzo para el robot humanoide **Unitree G1 de 29 grados de libertad**, con el objetivo de que corra y salte obstáculos (vallas) en un circuito recto de 20 a 30 metros con hasta 3 vallas de 0,20 a 0,75 m de altura. El identificador del repositorio (`nep-6`) no se corresponde con el nombre del proyecto descrito en la model card (`task-humanoid-run-jump`), y el tamano del repositorio figura como 0,0 GB, por lo que no hay evidencia de que se hayan subido pesos entrenados.

Técnicamente, el proyecto compone una jerarquía de tres niveles: un conmutador PPO de alto nivel que emite un vector de 6 dimensiones `[gate, vx, vy, ωz, h, flight]`, dos actores especialistas entrenados con Adversarial Motion Priors (AMP) para carrera y salto, y un tracker corporal completo congelado basado en BeyondMimic que traduce observaciones de 157 dimensiones en 29 objetivos de posición para control PD de las articulaciones. La pila se ejecuta a 50 Hz en el tracker y 200 Hz en PhysX, sobre Isaac Sim 5.1.0 e Isaac Lab 2.3.1, con la librería skrl (>= 1.4.3) y Python 3.11.

Su relevancia es acotada pero específica: la mayoría de ejemplos de G1 en Isaac Lab se limitan a seguimiento de velocidad o a tracking de movimiento, mientras que este repositorio compone especialistas de carrera y salto con evaluación determinista vía EnvHub (`humanoid-runjump-course-v1`), lo que permite reproducibilidad por semilla en experimentos de locomoción jerárquica. No es un kit de despliegue sim-to-real, no incluye visión y sus observaciones son exclusivamente propioceptivas más comandos de curso y salto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Jerarquia de politicas de aprendizaje por refuerzo: conmutador PPO de alto nivel, actores AMP de carrera y salto, tracker corporal completo congelado (BeyondMimic). No es un transformer ni un modelo de lenguaje |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no procesa secuencias de texto). Dimensiones de observacion: 6-D en el conmutador HL, 134-D en el actor de carrera, 156-D en el actor de salto, 157-D en el tracker |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; el README menciona actores exportados, con referencia a TorchScript) |
| Idiomas soportados | no aplicable (el modelo no procesa lenguaje natural; no se declaran idiomas en la ficha del repositorio) |
| Licencia | BSD 3-Clause segun los badges del README; la ficha del repositorio en Hugging Face no declara licencia |
| Formato de pesos | no disponible |
| Robot | Unitree G1, 29 grados de libertad de cuerpo completo |
| Simulador | NVIDIA Isaac Sim 5.1.0 + Isaac Lab 2.3.1 |
| Algoritmos | skrl AMP (carrera y salto), skrl PPO (alto nivel) |
| Frecuencias de control | Tracker a 50 Hz, PhysX a 200 Hz |
| Entorno de evaluacion | `humanoid-runjump-course-v1` (EnvHub, determinista) o vallas procedurales |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-10-01T02:35:57Z |
| Fecha de actualizacion (metadatos) | 2026-10-01T02:36:01Z |

## Arquitectura y entrenamiento

La pila se organiza en cascada. El nivel superior es un conmutador PPO entrenable que emite 6 dimensiones: `gate`, `vx`, `vy`, `ωz`, altura de valla (`h`) y distancia de vuelo (`flight`). Cuando `gate ≤ 0`, se mantiene activo el actor de carrera con comando de velocidad; cuando `gate` sube y se detecta un apoyo del pie derecho, se cede el control al actor de salto con los parámetros `(h_obstacle, flight_distance)`. Tras un aterrizaje estable, la pila vuelve al modo carrera. Los actores de carrera y salto son especialistas entrenados con AMP y, una vez entrenados, se congelan; el tracker BeyondMimic también está congelado y transforma 157 dimensiones de observación en 29 objetivos de posición articular enviados al control PD a 50 Hz, mientras PhysX simula la articulación a 200 Hz. Toda la capa de alto nivel vive dentro de un único `ActionTerm` de Isaac Lab llamado `HierarchicalSwitchAction`.

El entrenamiento es ascendente: primero el tracker (entrenado externamente en el repositorio `nepher-ai/humanoid-g1-tracking`), después el actor AMP de carrera, después el actor AMP de salto y por último el conmutador PPO de alto nivel. Las referencias de movimiento provienen del dataset `bones-studio/seed` de Hugging Face. Las notas de método de la fase 2 documentan que el fichero `robots/g1.py` es idéntico byte a byte al del repositorio oficial de la tarea (colisiones propias desactivadas, solver 8/4; el entorno de curso HL usa solver 4/1), que los residuos de velocidad articular del actor de carrera se decodifican como `tanh(a) * 3.0` rad/s en todas las articulaciones, y que los límites de actuador (esfuerzo, velocidad, rigidez, amortiguación y armadura) se toman de las especificaciones de los actuadores Unitree 7520/5020/4010 en `robots/g1_constants.py`. La puntuación de fase 2 aplica una puerta de naturalidad `N = n_cross × n_posture × n_spin` sobre la puntuación de rendimiento.

## Capacidades

- Locomoción bípeda de carrera en el Unitree G1 mediante políticas AMP entrenadas con skrl.
- Salto de vallas en circuito recto, con alturas de obstáculo entre 0,20 y 0,75 m y hasta 3 vallas.
- Conmutación jerárquica carrera/salto mediante un agente PPO de 6 dimensiones, con transición basada en `gate` y detección de apoyo del pie derecho.
- Seguimiento corporal completo (whole-body tracking) con BeyondMimic: 157-D de observación a 29 objetivos de posición articular PD.
- Composición de políticas congeladas: los actores AMP y el tracker no se reentrenan al entrenar la capa de alto nivel.
- Evaluación reproducible por semilla mediante el entorno determinista `humanoid-runjump-course-v1` de EnvHub, o con vallas generadas proceduralmente.
- Integración como extensión de Isaac Lab con identificadores de Gym registrados: `Nepher-G1-Run-*`, `Nepher-G1-Jump-*`, `Nepher-G1-RunJumpHL-*`.
- Observaciones de propiocepción más comandos de curso y salto. No hay entrada visual ni navegación basada en visión.
- Soporte declarado para agentes y herramientas de búsqueda mediante contexto en texto plano: `llms.txt`, `llms-full.txt` y `docs/`.
- No dispone de tool calling, function calling, capacidades multilingües, modo de razonamiento explícito, audio ni visión.

## Casos de uso

- Investigación en locomoción humanoide con RL: permite entrenar políticas de carrera y salto sobre un G1 de 29 DoF en Isaac Lab, cubriendo un caso (salto de obstáculo) que los ejemplos de seguimiento de velocidad no abordan.
- Composición de políticas jerárquicas congeladas: sirve como referencia para estudiar cómo una capa de alto nivel de baja dimensión (6-D) puede orquestar actores especialistas ya entrenados sin reentrenarlos, reduciendo el coste de entrenamiento de la capa superior.
- Evaluación reproducible de controladores: el entorno determinista `humanoid-runjump-course-v1` con inicio desde posición de pie y curso fijo permite comparar políticas bajo condiciones idénticas y con la misma semilla.
- Currículum de dificultad creciente: la altura de valla parametrizable (0,20 a 0,75 m) y el número de obstáculos (hasta 3) permiten construir planes de entrenamiento por etapas y medir la tasa de éxito en función de la dificultad.
- Estudio de transferencia sim-to-sim: la separación entre tracker (50 Hz) y simulación física (200 Hz), junto con límites de actuador tomados del fabricante, permite analizar el efecto del desajuste de frecuencias y de los límites de par en la estabilidad del salto.
- Evaluación de robustez de aterrizaje: el retorno al modo carrera tras un aterrizaje estable es un criterio medible que puede usarse para estudiar estabilidad post-salto y recuperación de la marcha.
- Generación de datos sintéticos de movimiento: las trayectorias resultantes en Isaac Sim pueden emplearse como datos de referencia para otros entrenamientos de tracking corporal completo, dado que el tracker se nutre del dataset `bones-studio/seed`.
- Docencia y experimentación en robótica: el paquete incluye archivos de contexto (`llms.txt`, `llms-full.txt`) y documentación en `docs/`, lo que facilita su uso en cursos o proyectos de investigación que necesiten un entorno Isaac Lab ya configurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README describe el protocolo de evaluación (vallas procedurales o el entorno determinista `humanoid-runjump-course-v1`, con una puerta de naturalidad `N = n_cross × n_posture × n_spin` en la puntuación de fase 2), pero no incluye cifras de tasa de éxito, velocidad, altura máxima superada ni comparaciones numéricas con otras políticas. No se inventan resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada. La pila depende de Isaac Sim 5.1.0 e Isaac Lab 2.3.1, cuyo hardware soportado se define en la documentación del propio simulador, no en este repositorio.
- Compatibilidad con GPU de consumo: no disponible. El README no indica modelos de GPU concretos.
- Software necesario: Python 3.11, NVIDIA Isaac Sim 5.1.0, Isaac Lab 2.3.1, skrl >= 1.4.3.
- Opciones de despliegue: no aplica el despliegue típico de modelos de lenguaje (no hay soporte de vLLM, llama.cpp, Ollama ni TGI). La ejecución se realiza como tarea de Isaac Lab / EnvHub, y el README indica explícitamente que el repositorio no es un kit de despliegue sim-to-real.
- Latencia y throughput estimados: no disponible. Se conocen las frecuencias internas de control (tracker a 50 Hz, PhysX a 200 Hz), pero no el rendimiento en tiempo real ni el coste de entrenamiento.
- Almacenamiento: el repositorio figura con 0,0 GB, por lo que no se documenta el tamano de los artefactos de pesos.

## Comparativa con modelos similares

La comparación se plantea frente a otros paquetes de la misma categoría (tareas de locomoción humanoide en Isaac Lab), no frente a modelos de lenguaje. Los datos numéricos de los proyectos alternativos no están disponibles en la información proporcionada.

| Proyecto | Tarea | Robot | Algoritmos | Observaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| task-humanoid-run-jump (`wonderful0711/nep-6`) | Carrera y salto de vallas con pila jerarquica | Unitree G1 29-DoF | skrl AMP + PPO + tracker BeyondMimic | 6-D (HL), 134-D (carrera), 156-D (salto), 157-D (tracker) | BSD 3-Clause segun badges del README | Repositorio HF con 0 descargas y 0,0 GB |
| task-humanoid-run-waypoints | Carrera por puntos de paso (waypoint racing) | no disponible | no disponible | no disponible | no disponible | Citado en el README como proyecto diferenciado de Nepher Robotics |
| humanoid-g1-tracking | Entrenamiento del tracker corporal completo congelado | Unitree G1 | no disponible | 157-D a 29 objetivos PD | no disponible | Repositorio de GitHub de nepher-ai |
| Ejemplos de Isaac Lab para G1 | Seguimiento de velocidad o tracking de movimiento | Unitree G1 | no disponible | no disponible | no disponible | Citados en el README como punto de partida que este proyecto extiende |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no admite prompts, tool calling ni contexto conversacional. Cualquier expectativa en ese sentido es incorrecta.
- No es un kit de despliegue sim-to-real. El propio README lo declara: el proyecto está pensado para entrenamiento y evaluación en simulación, no para transferencia directa al robot físico.
- Ausencia de visión y de navegación: las observaciones son propiocepción más comandos de curso y salto, por lo que no hay percepción del entorno ni planificación de trayectorias complejas.
- Riesgo de sobreajuste al evaluador: el README distingue explícitamente entre los cambios de fase 2, que según el autor no apuntan a detectores de la puntuación, y la regla de ritmo de finalización de fase 3, que está sincronizada con la comprobación de aterrizaje del evaluador. Esa sincronización con el sistema de puntuación es un caveat relevante para interpretar los resultados.
- Licencia: los badges del README indican BSD 3-Clause, pero la ficha del repositorio en Hugging Face no declara licencia. Antes de un uso comercial conviene verificar el fichero `LICENSE` y los términos reales del repositorio, así como la licencia del tracker externo y del dataset de movimientos.
- Dependencias del dataset de referencia: los clips de movimiento provienen de `bones-studio/seed`, cuya licencia y condiciones no se detallan en la información disponible.
- Estado del repositorio: 0 descargas, 0 likes, tamano de 0,0 GB y sin pesos evidentes. La model card parece cortada a mitad de frase ("Exported actors carry t"), lo que sugiere una publicación incompleta.
- Incoherencia de metadatos: el identificador del repositorio (`nep-6`) no coincide con el nombre del proyecto de la model card (`task-humanoid-run-jump`), y las fechas de creación y actualización (2026-10-01) resultan anómalas. Conviene confirmar que el repositorio corresponde realmente al paquete descrito.
- Sesgos: no se documenta ningún análisis de sesgos, y en el caso de políticas de RL el equivalente relevante sería el sesgo de las distribuciones de movimiento de referencia, no analizado en la información disponible.
- Alucinación: no aplica al no ser un modelo generativo de texto, pero sí existe riesgo de extrapolación indebida de resultados de simulación a comportamiento real del robot.
- Sin datos de benchmarks, no es posible validar de forma independiente el rendimiento declarado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wonderful0711/nep-6
- Repositorio relacionado del mismo autor: https://huggingface.co/wonderful0711/nep-1
- Organización Nepher Robotics en GitHub: https://github.com/nepher-ai
- Entrenamiento del tracker (humanoid-g1-tracking): https://github.com/nepher-ai/humanoid-g1-tracking
- Proyecto de carrera por puntos de paso (task-humanoid-run-waypoints): https://github.com/nepher-ai/task-humanoid-run-waypoints
- Dataset de movimientos de referencia (bones-studio/seed): https://huggingface.co/datasets/bones-studio/seed
- BeyondMimic: https://beyondmimic.github.io/
- Adversarial Motion Priors (AMP): https://xbpeng.github.io/projects/AMP/index.html
- NVIDIA Isaac Lab: https://isaac-sim.github.io/IsaacLab
- Documentación de NVIDIA Isaac Sim: https://docs.omniverse.nvidia.com/isaacsim/latest/overview.html
- Documentación de skrl: https://skrl.readthedocs.io/
- Notas de la versión de Python 3.11: https://docs.python.org/3/whatsnew/3.11.html
- Índice de contexto para agentes del repositorio: `llms.txt` (relativo al repositorio)
- Contexto completo en un solo fichero: `llms-full.txt` (relativo al repositorio)
- Documentación del repositorio: `docs/README.md` (relativo al repositorio)
- Fichero de licencia: `LICENSE` (relativo al repositorio)
