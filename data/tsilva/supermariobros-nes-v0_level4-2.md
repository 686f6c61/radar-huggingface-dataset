# tsilva/SuperMarioBros-Nes-v0_Level4-2

## Resumen

SuperMarioBros-Nes-v0_Level4-2 es una política de aprendizaje por refuerzo entrenada desde cero para completar el nivel 4-2 del entorno `SuperMarioBros-Nes-v0`, que recrea el clásico Super Mario Bros. de NES. Lo desarrolla el usuario tsilva dentro del proyecto GradLab, un framework propio de experimentación en RL, y se publica como un artefacto reproducible: incluye la política entrenada, los metadatos del checkpoint y la receta ejecutada. No es un modelo de lenguaje ni un modelo generativo de propósito general; es un agente especializado en una única tarea de control secuencial.

El modelo se entrenó con una combinación de PPO (Proximal Policy Optimization) y SIL (Self-Imitation Learning) sobre 9.310.208 transiciones de entorno, alcanzando 98 niveles completados en las últimas 100 episodios de entrenamiento y 5.491 clears acumulados de 14.330 episodios. Su relevancia es acotada: sirve como referencia reproducible de un pipeline de RL en GradLab y como política jugable de un nivel concreto, no como componente para aplicaciones de producción generales.

La información pública es muy limitada: el repositorio de Hugging Face ocupa 0.0 GB, no declara licencia ni idiomas, y no se ha publicado una evaluación de aceptación independiente. Todos los datos de rendimiento provienen de una única ejecución con semilla `1801`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política de RL; pesos en `model.zip`, sin arquitectura declarada en la model card) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entorno de control; sin ventana de contexto textual) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `model.zip` (bundle GradLab), con `model.json` y `recipe.json` de metadatos |
| Libreria | gradlab |
| Pipeline | reinforcement-learning |
| Entorno | SuperMarioBros-Nes-v0, nivel 4-2, inicio canónico |
| Algoritmos | PPO + SIL |
| Transiciones de entrenamiento | 9.310.208 |
| Semilla | 1801 |
| Checkpoint | `checkpoint-9310208-2debbb474e9ec5bc` |
| Run ID | `gradlab-73cb685204003de262fc5bff16227e05` |
| Tamano del repo | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura de la red neuronal de la política: solo indica que se entrenó desde cero con PPO + SIL en GradLab y que los pesos se distribuyen como `model.zip` junto a `model.json` (metadatos del checkpoint) y `recipe.json` (receta ejecutada). No se especifican capas, tipo de encoder visual, funciones de activación ni hiperparámetros de PPO (learning rate, clipping, GAE, número de entornos en paralelo), por lo que estos datos deben considerarse no disponibles.

El entrenamiento acumuló 9.310.208 transiciones de entorno en una única ejecución con semilla `1801`, comenzando cada episodio contado en el inicio canónico del nivel 4-2. La combinación de PPO con Self-Imitation Learning busca reforzar trayectorias exitosas pasadas para estabilizar el aprendizaje en tareas de horizonte largo con recompensas dispersas, un patrón habitual en plataformas. Los clears reportados (98/100 en los últimos 100 episodios de entrenamiento y 5.491/14.330 acumulados) proceden de esa misma ejecución; no hay evaluación independiente de aceptación.

## Capacidades

- Control de un agente en el entorno `SuperMarioBros-Nes-v0`, nivel 4-2, desde el inicio canónico.
- Ejecución de una política entrenada con PPO + SIL para completar el nivel con alta tasa de éxito en entrenamiento (98/100 en la ventana final).
- Reproducibilidad: el bundle incluye política, metadatos de checkpoint y receta ejecutada, lo que permite reconstruir la ejecución en GradLab.
- Reproducción del agente mediante el comando `gradlab play` con un ROM de Super Mario Bros. NES aportado por el usuario.
- No soporta tool calling, function calling, agentes multi-paso genéricos, multilingüismo, visión general, audio ni modos de razonamiento textual: es una política específica de un entorno.
- No se declaran capacidades de transferencia a otros niveles, otros juegos o variantes del entorno.

## Casos de uso

- Reproducción de experimentos de RL: el bundle permite reejecutar la política y comparar contra la receta publicada, útil para validar pipelines de PPO + SIL en GradLab.
- Benchmark interno de algoritmos de RL: sirve como referencia de rendimiento en un nivel concreto de Super Mario Bros. para comparar variantes de PPO, SIL u otros métodos bajo el mismo entorno.
- Docencia y divulgación: ejemplo tangible de entrenamiento desde cero de un agente que completa un nivel de NES, con métricas de clears y transiciones documentadas.
- Estudio de recompensas dispersas en plataformas: la tasa de clears acumulada (5.491/14.330) y la ventana final (98/100) permiten analizar la curva de aprendizaje y la estabilidad del entrenamiento.
- Base para experimentos de currículo o transferencia: punto de partida para probar si la política inicializa mejor el aprendizaje en niveles cercanos, siempre que se valide experimentalmente (no hay datos publicados al respecto).
- Verificación de infraestructura de RL: el comando `gradlab play` con un ROM propio permite comprobar el correcto funcionamiento de la cadena de inferencia y del entorno antes de lanzar entrenamientos más costosos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Clears en los últimos 100 episodios de entrenamiento | 98 / 100 |
| Clears acumulados en entrenamiento | 5.491 / 14.330 |
| Transiciones de entorno | 9.310.208 |
| Evaluación de aceptación independiente | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje. Tampoco se han publicado métricas de evaluación independiente sobre el entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es 0.0 GB y la arquitectura de la política no se declara, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponibles; al tratarse de una política de RL para un entorno de NES, es probable que quepa en GPU de consumo, pero no hay datos publicados que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: exclusivamente mediante GradLab (`gradlab play 'hf://tsilva/SuperMarioBros-Nes-v0_Level4-2' --rom-path /path/to/SuperMarioBros.nes`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.
- Requisito adicional: es necesario aportar un ROM de Super Mario Bros. NES compatible; el modelo no incluye el ROM.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Algoritmo | Clears reportados | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tsilva/SuperMarioBros-Nes-v0_Level4-2 | Política RL | SuperMarioBros-Nes-v0, nivel 4-2 | PPO + SIL | 98/100 (últimos 100 episodios de entrenamiento) | No disponible | Hugging Face (0 descargas) |
| Otras políticas de la colección tsilva/gradlab-supermariobros-nes-v0 | Políticas RL | Otros niveles de SuperMarioBros-Nes-v0 | No disponible | No disponible | No disponible | Hugging Face (colección enlazada) |
| Alternativas externas de RL para Super Mario Bros. | Políticas RL | Super Mario Bros. (varias versiones) | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos públicos suficientes para comparar con alternativas de terceros en parámetros, contexto o rendimiento verificable. La comparación más directa es con las demás políticas de la misma colección de GradLab, pero sus métricas no se detallan en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para un único nivel (4-2) de un único entorno; no se ha validado su comportamiento en otros niveles, juegos o variantes.
- Sin evaluación independiente: los clears reportados provienen de una sola ejecución de entrenamiento con semilla `1801`; no hay evaluación de aceptación externa, por lo que el rendimiento real fuera de entrenamiento es incierto.
- Licencia no disponible: no se declara licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier uso en producción.
- Dependencia de un ROM propietario: el uso requiere aportar un ROM de Super Mario Bros. NES, cuya legalidad y disponibilidad dependen del usuario.
- Sin datos de arquitectura ni de pesos: al no declararse la arquitectura ni el número de parámetros, es difícil auditar el modelo o estimar requisitos de cómputo.
- Riesgo de sobreajuste al entorno: la alta tasa de clears en entrenamiento (98/100) no garantiza generalización; no se han publicado métricas de test separadas.
- Sin soporte multilingüe, de tool calling ni de agentes genéricos: no debe confundirse con un modelo de lenguaje; su ámbito es exclusivamente el control del entorno.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level4-2
- Colección GradLab SuperMarioBros-Nes-v0: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
- Repositorio GradLab (instalación): https://github.com/tsilva/gradlab#install
- Informe de entrenamiento (nivel 4-2, 2026-11-19): https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level4-2--2026-11-19
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-73cb685204003de262fc5bff16227e05/checkpoints/9310208-2debbb474e9ec5bcf60b2daff15d0097ee25dfa5b64e06014913689eec7b7b32/manifest.json
