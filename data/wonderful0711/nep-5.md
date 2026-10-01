# wonderful0711/nep-5

## Resumen

El identificador `wonderful0711/nep-5` corresponde a un repositorio de Hugging Face de 0.0 GB, sin descargas ni valoraciones, creado y actualizado el 1 de octubre de 2026. Su model card no describe un modelo de lenguaje: documenta **task-humanoid-run-jump**, una extensión de Nepher Robotics para NVIDIA Isaac Lab / Isaac Sim que entrena políticas de control para el robot humanoide **Unitree G1** (29 grados de libertad) capaces de correr y saltar obstáculos en un circuito recto.

Se trata, por tanto, de un *stack* de aprendizaje por refuerzo robótico, no de un modelo generativo. La pila combina especialistas entrenados con Adversarial Motion Priors (AMP) para correr y saltar, un tracker corporal completo congelado basado en BeyondMimic y un conmutador de alto nivel entrenado con PPO que decide en cada instante si el robot corre o salta. La jerarquía se ejecuta a tres frecuencias: el conmutador y los actores AMP a 50 Hz, el tracker a 50 Hz y el motor de física PhysX a 200 Hz.

Su relevancia es acotada y muy específica: cubre un hueco que los ejemplos estándar de Isaac Lab para el G1 no cubren, ya que estos se limitan al seguimiento de comandos de velocidad, mientras que este repositorio aporta entornos de Gym registrados para carrera, salto de vallas y una composición jerárquica de políticas congeladas. No es un kit de despliegue sim-to-real ni un sistema de navegación con visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politicas de control por aprendizaje por refuerzo (AMP para correr y saltar, PPO para el conmutador de alto nivel) sobre simulacion fisica Isaac Lab; topologia de red concreta no disponible |
| Parametros totales | no disponible |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje); dimensiones de observacion: 134-D (actor de carrera), 156-D (actor de salto), 157-D (tracker) |
| Tipos de cuantizacion | no disponible; los actores exportados se distribuyen en TorchScript segun la model card |
| Idiomas soportados | no disponible; las entradas son propiocepcion y comandos numericos de circuito |
| Licencia | BSD 3-Clause segun la model card; el campo de licencia del repositorio de Hugging Face no esta declarado |
| Formato de pesos | TorchScript para los actores exportados (segun la model card); el repositorio de Hugging Face no contiene pesos (0.0 GB) |
| Robot objetivo | Unitree G1, 29 grados de libertad de cuerpo completo |
| Simulador | NVIDIA Isaac Sim 5.1.0 + Isaac Lab 2.3.1 |
| Algoritmos | skrl AMP (carrera, salto) y skrl PPO (alto nivel) |
| Entorno de software | Python 3.11, skrl >= 1.4.3 |
| Frecuencias de control | Conmutador y actores a 50 Hz; tracker a 50 Hz; PhysX a 200 Hz |
| Accion del nivel alto | Vector de 6 dimensiones [gate, vx, vy, omega_z, h, flight] |
| IDs de Gym | Nepher-G1-Run-*, Nepher-G1-Jump-*, Nepher-G1-RunJumpHL-*, EnvHub humanoid-runjump-course-v1 |
| Circuito | Trayectoria recta de 20-30 m, hasta 3 vallas de 0.20-0.75 m de altura |

## Arquitectura y entrenamiento

La pila es jerarquica y de composicion de politicas congeladas. En la base, un tracker de cuerpo completo basado en BeyondMimic (entrenado en el repositorio `nepher-ai/humanoid-g1-tracking`) consume una observacion de 157 dimensiones y emite 29 consignas de posicion objetivo para controladores PD articulares. Por encima, dos actores AMP especializados generan un frame de 64 dimensiones: el actor de carrera (observacion de 134-D) y el actor de salto (observacion de 156-D). En la cima, un conmutador PPO entrenable produce unicamente el vector de 6 dimensiones que decide la transicion. El conmutador vive dentro de un unico `ActionTerm` de Isaac Lab (`HierarchicalSwitchAction`): un valor `gate <= 0` mantiene al actor de carrera con su comando de velocidad, mientras que un `gate` creciente junto con un apoyo del pie derecho cede el control al actor de salto con los parametros `(h_obstacle, flight_distance)`, y tras un aterrizaje estable la pila vuelve al modo carrera. El orden de entrenamiento recomendado es ascendente: tracker externo, actor AMP de carrera, actor AMP de salto y, por ultimo, el PPO de alto nivel.

En cuanto a los datos, las referencias de movimiento proceden del conjunto `bones-studio/seed` de Hugging Face. La model card detalla decisiones de plausibilidad fisica de la fase 2: el archivo `robots/g1.py` es identico byte a byte al del repositorio oficial de la tarea (autocolisiones desactivadas, solver 8/4; el entorno de circuito de alto nivel usa 4/1), los limites de los actuadores se toman de las especificaciones del fabricante Unitree (7520/5020/4010) y la decodificacion de velocidad articular del actor de carrera aplica `tanh(a) * 3.0` rad/s por articulacion, con un limite uniforme de 3.0. La puntuacion de fase 2 multiplica el resultado de rendimiento por una puerta de naturalidad `N = n_cross x n_posture x n_spin`. La model card menciona tambien una regla de ritmo de finalizacion de la fase 3 que, en sus propias palabras, esta sincronizada con la comprobacion de aterrizaje del evaluador.

## Capacidades

- Locomocion de carrera para un Unitree G1 de 29 grados de libertad en simulacion, con seguimiento de comandos de velocidad.
- Salto de vallas en un circuito recto, con alturas de obstaculo parametrizables entre 0.20 y 0.75 m y hasta 3 vallas.
- Conmutacion jerarquica carrera/salto mediante un unico vector de accion de 6 dimensiones, sin reentrenar los actores congelados.
- Composicion de politicas congeladas: el agente de alto nivel es el unico modulo entrenable de la pila.
- Evaluacion determinista y reproducible mediante el entorno EnvHub `humanoid-runjump-course-v1`, con condiciones de inicio fijas.
- Generacion de vallas de forma procedural para evaluacion no determinista.
- No dispone de soporte de *tool calling*, agentes de lenguaje, vision, audio, decodificacion especulativa ni capacidades multilingues: la especificacion no las contempla.

## Casos de uso

- Investigacion en locomocion humanoide con AMP: el repositorio aporta entornos de Gym registrados para entrenar y comparar especialistas de carrera y salto sobre el mismo robot y el mismo simulador, evitando reimplementar la pila desde cero.
- Salto de obstaculos en simulacion: permite estudiar planificacion de salto con alturas de valla variables (0.20-0.75 m) y distancias de vuelo comandadas, un escenario que los ejemplos de seguimiento de velocidad no cubren.
- Composicion de politicas congeladas: sirve como caso de estudio de arquitecturas en las que un modulo ligero de alto nivel (6 dimensiones de accion) gobierna actores previamente entrenados que permanecen congelados, util para reducir coste de entrenamiento.
- Benchmarks reproducibles: el uso de EnvHub con cursos de inicio fijo permite comparar configuraciones con la misma semilla, lo que resulta adecuado para publicaciones que exigen reproducibilidad.
- Ablaciones de decodificacion de acciones: la model card documenta explicitamente el limite uniforme `tanh(a) * 3.0` rad/s y las constantes por articulacion de `motions/action_stats.py`, lo que facilita estudiar el efecto de distintos esquemas de decodificacion sobre la estabilidad.
- Evaluacion de plausibilidad fisica: la puerta de naturalidad `N = n_cross x n_posture x n_spin` permite analizar hasta que punto una politica respeta restricciones de cruce de piernas, postura y giro, util en investigacion sobre brecha sim-to-real.
- Formacion y docencia en aprendizaje por refuerzo robotico: la estructura en cuatro niveles con frecuencias de control definidas (50 Hz de politica, 200 Hz de fisica) es un ejemplo didactico de pila jerarquica.
- Base para experimentos de transferencia sim-to-real: con las cautelas indicadas en la model card, que declara explicitamente que el repositorio no es un kit de despliegue en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el procedimiento de evaluacion (vallas procedurales o el entorno determinista `humanoid-runjump-course-v1`) y menciona una puerta de naturalidad de fase 2, pero no incluye cifras de rendimiento, tasas de exito ni comparaciones numericas con otras politicas.

## Requisitos de hardware

- El repositorio no publica cifras de VRAM ni de GPU recomendada; esos datos figuran como no disponibles en la informacion proporcionada.
- Dependencia de software obligatoria: NVIDIA Isaac Sim 5.1.0 e Isaac Lab 2.3.1, lo que implica una GPU NVIDIA compatible con la pila de simulacion de NVIDIA y el entorno de ejecucion correspondiente.
- Python 3.11 y skrl >= 1.4.3 para el entrenamiento y la ejecucion de los agentes.
- Frecuencias de ejecucion declaradas: politica y tracker a 50 Hz, PhysX a 200 Hz. No se indican cifras de latencia ni de throughput de entrenamiento.
- Opciones de despliegue: la model card no menciona vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto. El despliegue previsto es mediante Isaac Lab y skrl, con actores exportados a TorchScript.
- No hay datos publicados sobre si la pila cabe en una GPU de consumo; la model card no lo aborda.

## Comparativa con modelos similares

| Proyecto | Tipo | Robot | Contexto / observacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| wonderful0711/nep-5 (task-humanoid-run-jump) | AMP + PPO jerarquico, carrera y salto | Unitree G1, 29 DoF | 134-D / 156-D / 157-D | no disponible | BSD 3-Clause (segun model card) | Repositorio de Hugging Face vacio (0.0 GB); codigo en nepher-ai |
| nepher-ai/task-humanoid-run-waypoints | Pila de carrera por waypoints | Unitree G1 | no disponible | no disponible | no disponible | Repositorio de GitHub citado en la model card |
| nepher-ai/humanoid-g1-tracking | Tracker de cuerpo completo (BeyondMimic) | Unitree G1 | 157-D de observacion | no disponible | no disponible | Repositorio de GitHub citado en la model card |
| Ejemplos G1 de Isaac Lab | Seguimiento de comandos de velocidad | Unitree G1 | no disponible | no disponible | segun Isaac Lab | Upstream |

No se dispone de cifras comparativas de rendimiento entre estas alternativas; la comparacion es estructural y de funcionalidad declarada.

## Limitaciones y advertencias

- El repositorio de Hugging Face ocupa 0.0 GB y no contiene pesos ni artefactos; la model card describe un proyecto de robotica cuyo codigo reside presuntamente en GitHub, no un modelo descargable.
- No es un modelo de lenguaje: MMLU, HumanEval, GSM8K y metricas equivalentes no son aplicables, y cualquier ficha que las presentara seria incorrecta.
- La model card declara explicitamente que el repositorio no es un kit de despliegue sim-to-real, no es una pila para cuadrupedos, no es un navegador basado en vision y no es la pila de carrera por waypoints.
- Las observaciones se limitan a propiocepcion y comandos de circuito o salto; no hay percepcion visual ni modelado del entorno mas alla de la geometria de las vallas.
- La licencia BSD 3-Clause aparece en la model card, pero el campo de licencia del repositorio de Hugging Face no esta declarado, lo que genera ambiguedad sobre los terminos aplicables a los artefactos.
- Sin descargas ni valoraciones (0 y 0), no existe validacion externa de los resultados ni de la reproducibilidad de la pila.
- La brecha sim-to-real no esta cuantificada en la informacion disponible; la propia model card advierte de que el proyecto se queda en simulacion.
- La model card reconoce que la regla de ritmo de finalizacion de la fase 3 esta sincronizada con la comprobacion de aterrizaje del evaluador, un indicio de posible ajuste al sistema de puntuacion que conviene tener en cuenta al interpretar resultados.
- El campo de idiomas y el pipeline no estan declarados; las unicas etiquetas del repositorio son `region:us`.
- Los resultados de la busqueda web realizada no contienen enlaces relevantes al modelo: devuelven exclusivamente contenido para adultos sin relacion con el artefacto, por lo que no se han utilizado como fuente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wonderful0711/nep-5
- Organizacion Nepher Robotics en GitHub: https://github.com/nepher-ai
- Repositorio del tracker: https://github.com/nepher-ai/humanoid-g1-tracking
- Repositorio de carrera por waypoints: https://github.com/nepher-ai/task-humanoid-run-waypoints
- Conjunto de datos de referencias de movimiento: https://huggingface.co/datasets/bones-studio/seed
- Isaac Lab: https://isaac-sim.github.io/IsaacLab
- Isaac Sim (documentacion): https://docs.omniverse.nvidia.com/isaacsim/latest/overview.html
- skrl: https://skrl.readthedocs.io/
- Adversarial Motion Priors (AMP): https://xbpeng.github.io/projects/AMP/index.html
- BeyondMimic: https://beyondmimic.github.io/
- Documentacion interna citada en la model card: `llms.txt`, `llms-full.txt` y `docs/README.md` dentro del repositorio del proyecto (no accesibles desde Hugging Face en la informacion proporcionada).
