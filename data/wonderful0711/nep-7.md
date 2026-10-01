# wonderful0711/nep-7

## Resumen

El repositorio `wonderful0711/nep-7` de HuggingFace no contiene un modelo de lenguaje, sino que actúa como punto de publicacion de una extension de NVIDIA Isaac Lab denominada `task-humanoid-run-jump`, desarrollada por Nepher Robotics. El proyecto entrena politicas de control para el humanoide Unitree G1 (29 grados de libertad) con el objetivo de que corra y salte vallas en un circuito recto, combinando Adversarial Motion Priors (AMP) para las habilidades de carrera y salto, un tracker corporal completo BeyondMimic congelado y un conmutador PPO jerarquico de alto nivel.

La relevancia tecnica esta en la composicion de politicas congeladas: un agente de alto nivel solo produce una senal de 6 dimensiones (`gate`, `vx`, `vy`, `ωz`, altura de valla y distancia de vuelo) mientras los actores AMP y el tracker escriben directamente las 29 articulaciones. Frente a los ejemplos habituales de Isaac Lab para el G1, que se limitan al seguimiento de velocidad o al tracking de movimiento, este paquete anade salto de obstaculos y una pila jerarquica completa con evaluacion reproducible por semilla.

El repositorio ocupa 0.0 GB, acumula 0 descargas y 0 likes en el momento de la consulta, y sus metadatos de HuggingFace no declaran pipeline, licencia ni idiomas. El nombre `nep-7` no guarda relacion evidente con el contenido descrito en la model card. No se publican pesos ni artefactos de modelo en el espacio de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Jerarquia de politicas de aprendizaje por refuerzo: conmutador PPO de alto nivel + actores AMP congelados (run y jump) + tracker BeyondMimic congelado |
| Parametros totales | No disponible (el repositorio ocupa 0.0 GB y no publica pesos) |
| Parametros activos | No aplicable (no es un modelo MoE ni un modelo de lenguaje) |
| Longitud de contexto | No aplicable. Equivalente funcional: dimensiones de observacion de 134-D (actor run), 156-D (actor jump), 157-D (tracker) y 6-D (conmutador de alto nivel) |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | No aplicable (no procesa lenguaje natural) |
| Licencia | BSD 3-Clause segun la model card; no declarada en los metadatos de HuggingFace |
| Formato de pesos | No disponible; la model card menciona actores exportados (el texto esta truncado en "Exported actors carry t...") |
| Robot objetivo | Unitree G1, 29 grados de libertad (cuerpo completo) |
| Simulador | NVIDIA Isaac Sim 5.1.0 + NVIDIA Isaac Lab 2.3.1 |
| Algoritmos | skrl AMP (run, jump) y skrl PPO (alto nivel), skrl >= 1.4.3 |
| Frecuencias de control | Tracker a 50 Hz, fisica PhysX a 200 Hz |
| Estructura del conmutador | PPO de 6 dimensiones: `gate`, `vx`, `vy`, `ωz`, altura de obstaculo, distancia de vuelo |
| Circuito | Trayecto recto de 20 a 30 m, hasta 3 vallas, altura 0.20-0.75 m |
| Entorno de evaluacion | Vallas procedurales o EnvHub determinista `humanoid-runjump-course-v1` |
| Python | 3.11 |
| Repositorio de movimientos de referencia | Dataset `bones-studio/seed` en HuggingFace |
| Tracker externo | `nepher-ai/humanoid-g1-tracking` |

## Arquitectura y entrenamiento

La pila se organiza en cuatro niveles. En la cima, un PPO de alto nivel entrenable produce una senal de 6 dimensiones dentro de un unico `ActionTerm` de Isaac Lab llamado `HierarchicalSwitchAction`. Ese conmutador decide entre carrera y salto: un `gate ≤ 0` mantiene al actor de carrera con comando de velocidad, mientras que un `gate` creciente junto con un apoyo del pie derecho cede el control al actor de salto con los parametros `(h_obstacle, flight_distance)`. Tras un aterrizaje estable, la pila vuelve al modo de carrera. Por debajo, dos actores AMP congelados (134-D para run, 156-D para jump) emiten un fotograma de 64 dimensiones que alimenta al tracker BeyondMimic congelado, el cual convierte 157 dimensiones de observacion en 29 objetivos PD articulares. La simulacion fisica corre en PhysX a 200 Hz.

El entrenamiento es ascendente y sigue el orden tracker (externo) → AMP de carrera → AMP de salto → PPO de alto nivel. Los clips de movimiento de referencia proceden del dataset `bones-studio/seed`, y el tracker congelado se entrena en el repositorio `nepher-ai/humanoid-g1-tracking`. Las notas de metodo de la fase 2 documentan decisiones de plausibilidad fisica: `robots/g1.py` es identico byte a byte al repositorio oficial de la tarea (colisiones propias desactivadas, solver 8/4; el entorno de circuito usa 4/1), los residuales de velocidad articular del actor de carrera se decodifican como `tanh(a) * 3.0` rad/s en todas las articulaciones, y los limites de actuadores (esfuerzo, velocidad, rigidez, amortiguacion y armadura por grupo articular) provienen de las especificaciones de los actuadores Unitree 7520/5020/4010, no de valores ajustados. La puntuacion de fase 2 multiplica la puntuacion de rendimiento por una puerta de naturalidad `N = n_cross × n_posture × n_spin`.

No hay datos publicados sobre volumen de tokens, composicion de dataset de entrenamiento, RLHF ni DPO, ya que el objeto del entrenamiento son politicas de control motor y no un modelo generativo de texto.

## Capacidades

- Entrenamiento de locomocion bipeda de carrera sobre el Unitree G1 mediante Adversarial Motion Priors.
- Salto de vallas con control de altura de obstaculo y distancia de vuelo como parametros de entrada.
- Composicion jerarquica de politicas congeladas: el nivel superior solo conmuta el modo, mientras los niveles inferiores generan las 29 consignas articulares.
- Evaluacion reproducible por semilla mediante el entorno EnvHub `humanoid-runjump-course-v1`, con inicio desde posicion de pie y obstaculos fijos.
- Evaluacion con vallas procedurales, hasta 3 obstaculos en un recorrido recto de 20 a 30 m.
- Identificadores de Gym registrados para los agentes publicados: `Nepher-G1-Run-*`, `Nepher-G1-Jump-*` y `Nepher-G1-RunJumpHL-*`.
- Entornos Gym de Isaac Lab listos para entrenamiento de carrera, salto de valla o pila jerarquica combinada.
- Observaciones exclusivamente propioceptivas mas comandos de circuito y salto.
- No soporta tool calling, function calling, agentes de texto, vision, audio ni capacidades multilingues: no es un modelo de lenguaje ni un modelo fundacional multimodal.

## Casos de uso

- Investigacion en aprendizaje por refuerzo de humanoides: el paquete proporciona entornos Isaac Lab registrados para entrenar carrera y salto sobre un G1 de 29 grados de libertad, con una separacion clara entre especialistas de bajo nivel y un conmutador de alto nivel entrenable.
- Composicion de politicas congeladas en investigacion de control jerarquico: equipos que estudian como entrenar solo la capa de decision superior sin reentrenar actores ni tracker, aprovechando que el conmutador PPO solo emite 6 dimensiones.
- Benchmark reproducible de circuito de obstaculos: el entorno `humanoid-runjump-course-v1` carga recorridos con inicio fijo y hasta 3 vallas de 0.20 a 0.75 m, lo que permite comparar metodos entre ejecuciones con semillas controladas.
- Estudio de naturalidad del movimiento: la puerta `N = n_cross × n_posture × n_spin` y las notas de metodo permiten auditar si una politica cruza las vallas de forma fisicamente plausible, penalizando cruces, posturas forzadas y giros anomalos.
- Analisis de transferencia simulacion a realidad (sin ser kit de despliegue): al usar limites de actuadores del fabricante y fisica identica a la del repositorio oficial, la pila sirve como banco de pruebas para estudiar que politicas violarian principios de sim2real antes de portarlas al robot fisico.
- Generacion de datos de referencia para tracking corporal completo: los clips del dataset `bones-studio/seed` y el tracker de `nepher-ai/humanoid-g1-tracking` permiten reproducir y extender experimentos de seguimiento de movimiento.
- Docencia y formacion en robotica: el proyecto sirve como ejemplo completo de composicion de politicas en Isaac Lab, con documentacion orientada a agentes (`llms.txt`, `llms-full.txt`) y respuestas estructuradas en `docs/`.
- Integracion en pipelines de evaluacion automatizada: los identificadores de Gym y el cargador EnvHub permiten incorporar el circuito como tarea fija dentro de suites de evaluacion continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la informacion disponible. La model card no incluye puntuaciones numericas de retorno, tasa de exito, altura de valla superada ni tiempos de recorrido, y no se proporcionan comparaciones medidas contra otras politicas del G1.

El unico elemento de evaluacion descrito es cualitativo-estructural: la puerta de naturalidad de fase 2, que multiplica la puntuacion de rendimiento por `N = n_cross × n_posture × n_spin`. No se documentan los valores alcanzados por los agentes `Nepher-G1-Run-*`, `Nepher-G1-Jump-*` o `Nepher-G1-RunJumpHL-*` en esa metrica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible como dato especifico del modelo. La plataforma subyacente (Isaac Sim 5.1.0 e Isaac Lab 2.3.1) requiere una GPU NVIDIA con soporte CUDA y capacidad RTX para renderizado y fisica.
- Compatibilidad con GPU de consumo: no disponible. Depende de los requisitos de Isaac Sim, no de un tamano de pesos publicado.
- Opciones de despliegue: no es un modelo servible con vLLM, llama.cpp, Ollama ni TGI. El despliegue se realiza ejecutando Isaac Sim e Isaac Lab con los entornos Gym registrados, o cargando los actores AMP exportados (formato no confirmado, probablemente TorchScript) dentro del simulador.
- Latencia y throughput: no disponibles. Se conocen las frecuencias nominales de la pila (tracker a 50 Hz, PhysX a 200 Hz), pero no los tiempos de paso ni el rendimiento medido en hardware concreto.
- Almacenamiento: el repositorio de HuggingFace ocupa 0.0 GB, por lo que no contiene pesos descargables.

## Comparativa con modelos similares

| Proyecto | Enfoque | Robot | Salto de obstaculos | Conmutador de alto nivel | Licencia |
|---|---|---|---|---|---|
| `wonderful0711/nep-7` (`task-humanoid-run-jump`) | Carrera + salto de vallas con AMP, tracker BeyondMimic y PPO jerarquico | Unitree G1 (29 DoF) | Si, hasta 3 vallas de 0.20-0.75 m | Si, PPO de 6-D | BSD 3-Clause segun model card |
| `nepher-ai/task-humanoid-run-waypoints` | Carrera por puntos de paso (waypoint racing) | Unitree G1 | No descrito | No descrito | No disponible |
| `nepher-ai/humanoid-g1-tracking` | Entrenamiento del tracker corporal completo BeyondMimic | Unitree G1 | No aplica (tracking) | No aplica | No disponible |
| Ejemplos estandar de Isaac Lab para G1 | Seguimiento de velocidad o tracking de movimiento | Unitree G1 | No | No | No disponible |

No se dispone de comparaciones cuantitativas de rendimiento entre estos proyectos. La diferenciacion descrita por el autor es funcional: este paquete anade salto de vallas y composicion jerarquica sobre lo que ofrecen el stack de waypoints y los ejemplos de tracking.

## Limitaciones y advertencias

- No es un kit de despliegue sim2real. El propio autor lo indica explicitamente: el repositorio entrena politicas en simulacion, no proporciona un pipeline de transferencia al robot fisico.
- No es un stack para cuadrupedos ni un navegador basado en vision. Las observaciones se limitan a propiocepcion mas comandos de circuito y salto.
- El repositorio de HuggingFace ocupa 0.0 GB y registra 0 descargas y 0 likes, por lo que no hay evidencia de validacion independiente ni artefactos verificables publicados.
- Los metadatos de HuggingFace no declaran pipeline, licencia ni idiomas. La licencia BSD 3-Clause aparece unicamente en la model card, lo que conviene verificar contra el repositorio de GitHub antes de cualquier uso.
- La model card esta truncada en el apartado de notas de metodo de fase 2 ("Exported actors carry t..."), de modo que parte de la informacion tecnica sobre la exportacion de actores no es legible.
- No hay datos publicados de sesgos, alucinacion, limites de contexto o comportamiento multilingue, porque no se trata de un modelo de lenguaje. Aplicar metricas de ese tipo carece de sentido aqui.
- El nombre del repositorio (`nep-7`) no coincide con el contenido descrito (`task-humanoid-run-jump`), lo que puede dificultar su descubrimiento y favorecer confusiones en busquedas.
- Aunque el autor afirma que ningun cambio de fase 2 apunta a detectores del evaluador, si reconoce que la regla de ritmo de llegada de fase 3 esta sincronizada con la comprobacion de aterrizaje del scorer; conviene leer esa seccion con cautela metodologica.
- No se documentan resultados de exito, robustez ante perturbaciones, generalizacion a alturas de valla fuera del rango 0.20-0.75 m ni comportamiento ante obstaculos no vistos.
- Dependencia fuerte de versiones concretas: Isaac Sim 5.1.0, Isaac Lab 2.3.1, Python 3.11 y skrl >= 1.4.3. Cambios de version pueden romper la reproducibilidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/wonderful0711/nep-7
- Organizacion Nepher Robotics en GitHub: https://github.com/nepher-ai
- Repositorio del tracker corporal completo: https://github.com/nepher-ai/humanoid-g1-tracking
- Stack de carrera por waypoints: https://github.com/nepher-ai/task-humanoid-run-waypoints
- Dataset de movimientos de referencia: https://huggingface.co/datasets/bones-studio/seed
- Documentacion de NVIDIA Isaac Sim 5.1.0: https://docs.omniverse.nvidia.com/isaacsim/latest/overview.html
- Documentacion de NVIDIA Isaac Lab 2.3.1: https://isaac-sim.github.io/IsaacLab
- Documentacion de skrl: https://skrl.readthedocs.io/
- Pagina del proyecto Adversarial Motion Priors: https://xbpeng.github.io/projects/AMP/index.html
- Pagina del proyecto BeyondMimic: https://beyondmimic.github.io/
- Indice de contexto para agentes (ruta relativa en el repositorio): `llms.txt`
- Contexto completo en un unico fichero (ruta relativa en el repositorio): `llms-full.txt`
- Documentacion con respuestas estructuradas (ruta relativa en el repositorio): `docs/README.md`
