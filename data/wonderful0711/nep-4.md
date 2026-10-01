# wonderful0711/nep-4

## Resumen

`wonderful0711/nep-4` es un repositorio alojado en Hugging Face que no contiene un modelo de lenguaje, sino la documentación de `task-humanoid-run-jump`, una extensión de Nepher Robotics para NVIDIA Isaac Lab / Isaac Sim orientada a entrenar políticas de locomoción para el robot humanoide Unitree G1 (29 grados de libertad, cuerpo completo). El objetivo es que el G1 corra y salte obstáculos tipo valla en un circuito recto de 20 a 30 metros con hasta 3 vallas de 0,20 a 0,75 m de altura, algo que la mayoría de ejemplos de Isaac Lab no cubren porque se limitan al seguimiento de velocidad.

La pieza técnica central es una pila jerárquica de tres niveles: un conmutador PPO de alto nivel que emite únicamente un vector de 6 dimensiones `[gate, vx, vy, ωz, h, flight]`, dos actores AMP congelados (especialistas en correr y en saltar, con observaciones de 134-D y 156-D respectivamente) y un tracker de cuerpo completo BeyondMimic congelado que consume 157-D y produce 29 objetivos PD articulares a 50 Hz, sobre una simulación PhysX a 200 Hz. La capa de alto nivel es lo único entrenable en la fase final, lo que convierte al repositorio en un ejemplo de composición de políticas congeladas más que de entrenamiento monolítico.

Su relevancia es acotada pero específica: es material para investigadores de RL humanoide que necesitan un banco de pruebas reproducible por semilla (entorno EnvHub `humanoid-runjump-course-v1`), con licencia BSD 3-Clause declarada en la model card. Conviene advertir desde el principio que el repositorio de Hugging Face ocupa 0,0 GB, acumula 0 descargas y 0 likes, y que la model card está truncada, por lo que no hay pesos publicados ni métricas verificables en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pila jerárquica de políticas de RL (AMP + PPO) sobre simulador PhysX; no es un transformer ni un modelo de lenguaje |
| Parametros totales | no disponible (no se publican recuentos ni ficheros de pesos) |
| Parametros activos | no aplica (no es un MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); las entradas son vectores de observación de 6-D, 134-D, 156-D y 157-D |
| Tipos de cuantizacion | no aplica / no disponible |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | BSD 3-Clause según la model card; el metadato de Hugging Face indica "no disponible" |
| Formato de pesos | no disponible; la model card menciona actores AMP exportados y TorchScript como formato de política congelada |
| Robot objetivo | Unitree G1, 29 DoF de cuerpo completo |
| Simulador | NVIDIA Isaac Sim 5.1.0 + Isaac Lab 2.3.1 |
| Algoritmos | skrl AMP (correr, saltar) y skrl PPO (alto nivel) |
| Frecuencias de control | Tracker a 50 Hz, PhysX a 200 Hz |
| Observaciones | 6-D (conmutador), 134-D (actor run), 156-D (actor jump), 157-D (tracker) |
| Salidas | 64-D del actor AMP hacia el tracker; 29 objetivos PD articulares del tracker |
| Circuito | Trayectoria recta de 20-30 m, hasta 3 vallas, altura 0,20-0,75 m |
| Entorno de evaluacion | Vallas procedurales o EnvHub determinista `humanoid-runjump-course-v1` |
| Python | 3.11 |
| Dependencia skrl | >= 1.4.3 |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadato HF) | 2026-10-01T02:35:14Z |

## Arquitectura y entrenamiento

La arquitectura es una jerarquía de políticas donde cada nivel consume la salida del anterior sin reentrenarlo. El nivel superior es un conmutador PPO entrenable que solo emite el vector de 6 dimensiones `[gate, vx, vy, ωz, h, flight]`; con `gate ≤ 0` se mantiene el actor de carrera con comando de velocidad, y un `gate` creciente junto con un apoyo del pie derecho cede el control al actor de salto con los parámetros `(h_obstacle, flight_distance)`. Tras un aterrizaje estable la pila vuelve al modo carrera. Los actores AMP (skrl) producen un frame de 64 dimensiones que alimenta al tracker BeyondMimic congelado, el cual transforma 157-D de observación en 29 objetivos PD articulares; por debajo, PhysX simula la articulación del G1. La capa de alto nivel vive dentro de un único `ActionTerm` de Isaac Lab llamado `HierarchicalSwitchAction`.

El orden de entrenamiento prescrito es ascendente: tracker (externo) → AMP de carrera → AMP de salto → PPO de alto nivel. Los clips de movimiento de referencia provienen del dataset `bones-studio/seed` de Hugging Face, y el tracker congelado se entrena en el repositorio `nepher-ai/humanoid-g1-tracking`. Las notas de método de la fase 2 documentan decisiones de plausibilidad física: `robots/g1.py` es idéntico byte a byte al repositorio oficial de la tarea (autocolisiones desactivadas, solver 8/4, y 4/1 en el entorno de circuito), los residuos de velocidad articular del actor de carrera se decodifican como `tanh(a) * 3.0` rad/s de forma uniforme, y los límites de esfuerzo, velocidad, rigidez, amortiguación y armadura proceden de las especificaciones de los actuadores Unitree 7520/5020/4010. La card menciona también una puerta de naturalidad `N = n_cross × n_posture × n_spin` que penaliza métodos que violen principios sim2real. No hay en el repositorio ningún detalle sobre volumen de tokens, composición de dataset de RLHF/DPO ni proceso de alineación, porque no aplica al dominio.

## Capacidades

- Locomoción de carrera para el Unitree G1 a partir de comandos de velocidad (`vx`, `vy`, `ωz`).
- Salto de vallas en circuito recto, con alturas gestionadas entre 0,20 y 0,75 m y hasta 3 obstáculos.
- Conmutación jerárquica entre correr y saltar mediante un conmutador PPO de 6 dimensiones, con retorno automático a carrera tras el aterrizaje.
- Seguimiento de cuerpo completo con el tracker BeyondMimic: 157-D de observación a 29 objetivos PD articulares.
- Reproducibilidad por semilla mediante el entorno determinista EnvHub `humanoid-runjump-course-v1`.
- Evaluación con vallas generadas de forma procedural como alternativa al circuito fijo.
- Exportación de actores AMP congelados, con TorchScript mencionado en la model card.
- Entrenamiento modular: cada nivel de la pila se puede entrenar y congelar por separado.
- No incluye: percepción visual, navegación por waypoints, cuadrúpedos, ni despliegue sim2real.

## Casos de uso

- Investigación en RL humanoide con Isaac Lab: el repositorio proporciona entornos Gym registrados para correr, saltar y la pila jerárquica completa (`Nepher-G1-Run-*`, `Nepher-G1-Jump-*`, `Nepher-G1-RunJumpHL-*`), de modo que un grupo puede partir de una base funcional en lugar de construir el entorno desde cero.
- Benchmark reproducible de salto de obstáculos: el entorno EnvHub `humanoid-runjump-course-v1` carga circuitos de vallas con inicio de pie fijo, lo que permite comparar variantes de política bajo condiciones idénticas y semillas fijas.
- Composición de políticas congeladas: sirve como plantilla para investigar arquitecturas jerárquicas donde un agente de alto nivel solo emite un vector de 6-D mientras actores y tracker permanecen congelados, reduciendo el espacio de acción efectivo.
- Generación de datos de locomoción: ejecutar la pila en simulación para producir trayectorias de 50 Hz (observaciones, acciones, estados articulares) reutilizables como datos de entrenamiento o de imitación.
- Docencia en robótica y aprendizaje por refuerzo: el desglose en cuatro niveles entrenables por separado permite ilustrar AMP, PPO y tracking de movimiento con un caso real sobre un robot comercial.
- Validación en integración continua: al ser un paquete de Isaac Lab con dependencias fijadas (Isaac Sim 5.1.0, Isaac Lab 2.3.1, Python 3.11, skrl >= 1.4.3), se puede usar para verificar que una versión del stack reproduce la evaluación determinista.
- Estudio de transferencia sim2real como línea base negativa: la propia card indica que el repositorio no es un kit de despliegue, por lo que resulta útil para medir la brecha entre política simulada y hardware real sin prometer resultados en el robot físico.
- Análisis de metodología de evaluación: las notas de fase 2 y la referencia a una regla de fase 3 ajustada al chequeo de aterrizaje del scorer permiten auditar cómo se diseña y se puede tensar una métrica de naturalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card describe el protocolo de evaluación (vallas procedurales o el entorno determinista `humanoid-runjump-course-v1`) y una puerta de naturalidad `N = n_cross × n_posture × n_spin`, pero no incluye cifras de éxito, tasas de cruce, tiempos de circuito ni comparaciones numéricas con otras políticas. No se dispone tampoco de métricas de MMLU, HumanEval, GSM8K ni de cualquier otro benchmark de lenguaje, porque el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- No se publican cifras de VRAM, latencia ni throughput en la información disponible.
- El stack exige Isaac Sim 5.1.0 e Isaac Lab 2.3.1, cuyo requisito general es una GPU NVIDIA con capacidad RTX; no se especifica en la ficha ningún modelo concreto validado por el autor.
- Frecuencias internas declaradas: tracker a 50 Hz y simulación PhysX a 200 Hz, lo que fija la carga computacional del bucle de control, aunque sin datos de tiempo por paso.
- El entrenamiento de AMP y PPO con skrl se ejecuta sobre el propio simulador; no hay estimaciones publicadas de horas de entrenamiento ni de número de GPUs empleadas.
- Opciones de despliegue mencionadas: Isaac Lab e Isaac Sim como entorno de ejecución, skrl como librería de RL y exportación de actores a TorchScript para inferencia de las políticas congeladas.
- No hay soporte declarado para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefacto.
- No cabe esperar ejecución en CPU: tanto la simulación PhysX como el renderizado de Isaac Sim requieren GPU.

## Comparativa con modelos similares

| Repositorio | Objetivo | Robot | Algoritmo | Observaciones | Licencia |
|---|---|---|---|---|---|
| `wonderful0711/nep-4` (task-humanoid-run-jump) | Correr y saltar vallas en circuito recto | Unitree G1, 29 DoF | AMP + PPO jerárquico con tracker BeyondMimic congelado | 6-D, 134-D, 156-D, 157-D | BSD 3-Clause (según la model card) |
| `nepher-ai/task-humanoid-run-waypoints` | Carrera por waypoints, sin salto | Unitree G1 | no disponible en la información | no disponible | no disponible |
| `nepher-ai/humanoid-g1-tracking` | Entrenamiento del tracker de cuerpo completo | Unitree G1 | BeyondMimic | 157-D a 29 objetivos PD | no disponible |
| `wonderful0711/nep-1`, `nep-2`, `nep-3` | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada alternativas externas a Nepher Robotics con las que comparar parámetros, contexto o rendimiento. Las búsquedas web devolvieron resultados no relacionados (Neural4D, un generador de modelos 3D, y `huygnguyen04/NEP4-Training`, un proyecto de potenciales neuronales NEP4 sin relación con este repositorio).

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no procesa instrucciones en lenguaje natural y no tiene ventana de contexto, cuantizaciones ni idiomas.
- El repositorio de Hugging Face ocupa 0,0 GB y acumula 0 descargas y 0 likes, por lo que no contiene pesos descargables ni validación alguna por parte de la comunidad.
- La model card está truncada: el apartado de notas de fase 2 se corta a mitad de frase ("Exported actors carry t"), de modo que falta información sobre la exportación de actores.
- La fecha de creación del metadato (2026-10-01) es incoherente con un estado de publicación normal; conviene verificarla antes de citar el artefacto.
- No es un kit de despliegue sim2real, no es una pila para cuadrúpedos y no incorpora navegación basada en visión; las observaciones son propiocepción más comandos de circuito y de salto.
- Toda la política depende de Isaac Sim e Isaac Lab, productos con licencia propia de NVIDIA, y de componentes externos como BeyondMimic, el dataset `bones-studio/seed` y las especificaciones de actuadores de Unitree, cuyas condiciones de uso no se detallan en la información disponible.
- La licencia BSD 3-Clause figura en la model card, pero el metadato de Hugging Face indica "no disponible"; conviene confirmarla en el fichero `LICENSE` antes de cualquier uso comercial.
- Las notas de método admiten explícitamente que la regla de ritmo de meta de la fase 3 está sincronizada con el chequeo de aterrizaje del scorer del benchmark, lo que introduce un riesgo de optimización contra la métrica más que contra la tarea real.
- Las métricas de naturalidad y de éxito no se publican, así que no es posible estimar el rendimiento real de la pila ni su robustez ante condiciones no vistas.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual, pero sí existe riesgo de sobreajuste a la distribución del circuito (20-30 m, hasta 3 vallas, 0,20-0,75 m) y de fallo fuera de esos rangos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wonderful0711/nep-4
- Perfil del autor en Hugging Face: https://huggingface.co/wonderful0711
- Modelo hermano `wonderful0711/nep-1`: https://huggingface.co/wonderful0711/nep-1
- Organización Nepher Robotics en GitHub: https://github.com/nepher-ai
- Repositorio del tracker: https://github.com/nepher-ai/humanoid-g1-tracking
- Pila de waypoints relacionada: https://github.com/nepher-ai/task-humanoid-run-waypoints
- BeyondMimic: https://beyondmimic.github.io/
- Adversarial Motion Priors (AMP): https://xbpeng.github.io/projects/AMP/index.html
- Documentación de Isaac Lab: https://isaac-sim.github.io/IsaacLab
- Documentación de Isaac Sim: https://docs.omniverse.nvidia.com/isaacsim/latest/overview.html
- Documentación de skrl: https://skrl.readthedocs.io/
- Dataset de movimientos de referencia: https://huggingface.co/datasets/bones-studio/seed
- Contexto para agentes citado en la card: `llms.txt` y `llms-full.txt` del repositorio (rutas relativas, sin URL pública en la información disponible)
- Documentación interna citada: `docs/README.md` del repositorio (ruta relativa, sin URL pública en la información disponible)
