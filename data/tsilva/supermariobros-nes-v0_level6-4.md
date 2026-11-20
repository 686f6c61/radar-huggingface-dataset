# tsilva/SuperMarioBros-Nes-v0_Level6-4

## Resumen

SuperMarioBros-Nes-v0_Level6-4 es una política de aprendizaje por refuerzo entrenada desde cero con PPO (Proximal Policy Optimization) en el framework GradLab para completar el nivel 6-4 de Super Mario Bros. de NES partiendo del inicio canónico del nivel. Lo desarrolla el usuario tsilva y se publica en Hugging Face como un artefacto de investigación asociado al repositorio GradLab, una herramienta de experimentación en RL.

No se trata de un modelo de lenguaje ni de un transformer generativo, sino de una política de control entrenada para un entorno concreto de Atari/NES mediante la interfaz de Gymnasium (`SuperMarioBros-Nes-v0`). El repositorio es de tamaño 0.0 GB y contiene el bundle de despliegue: pesos de la política (`model.zip`), metadatos del checkpoint (`model.json`) y la receta ejecutada (`recipe.json`).

Su relevancia es acotada: sirve como referencia reproducible de un pipeline de RL (PPO + GradLab) aplicado a un nivel específico de Super Mario Bros., con métricas de éxito declaradas por el autor. No es un modelo de propósito general y su uso está ligado al entorno y a la ROM del juego.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO); arquitectura de red no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (bundle de GradLab), junto con `model.json` y `recipe.json` |

## Arquitectura y entrenamiento

La política se entrena con PPO dentro de GradLab, un framework de experimentación en aprendizaje por refuerzo. El entorno es `SuperMarioBros-Nes-v0`, y el objetivo declarado es completar el nivel 6-4 desde el inicio canónico. El checkpoint publicado corresponde al run `gradlab-46310e7b3fc6c69484249b5bf5e8c9bb` y al checkpoint `checkpoint-4562944-460e5cdbc350db3b`, con 4.562.944 transiciones de entorno acumuladas.

El entrenamiento se realizó con una única semilla (`seed 12`). El autor reporta 3.565 despejes acumulados sobre 16.908 episodios de entrenamiento y 100/100 despejes en los últimos 100 episodios. No se detalla en la información disponible la composición de la red (capas, tamaño de observación, función de recompensa, hiperparámetros de PPO ni técnicas auxiliares como reward shaping o curriculum). Tampoco se especifica si hubo evaluación independiente: el propio autor indica que la evaluación de aceptación independiente está "unavailable".

## Capacidades

- Control de agente en el entorno `SuperMarioBros-Nes-v0` para el nivel 6-4 desde el inicio canónico.
- Ejecución de una política entrenada con PPO reproducible mediante el comando `gradlab play`.
- Bundle de despliegue con pesos, metadatos de checkpoint y receta de entrenamiento.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes multi-step en el sentido de LLM; es un agente de RL de un solo entorno.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión, audio ni otras capacidades multimodales más allá de la observación del propio juego.

## Casos de uso

- Reproducción de experimentos de RL: usar el bundle para replicar el entrenamiento y verificar las métricas declaradas (100/100 despejes en los últimos 100 episodios) con la misma semilla y receta.
- Benchmark de algoritmos PPO: servir como línea base para comparar variantes de PPO, reward shaping o arquitecturas de política en el mismo nivel y entorno.
- Docencia y divulgación: ejemplo práctico de pipeline completo (entorno Gymnasium, PPO, checkpointing, publicación en Hugging Face) para cursos de aprendizaje por refuerzo.
- Investigación en generalización: evaluar la política en niveles distintos o con condiciones iniciales distintas a las del entrenamiento para estudiar sobreajuste al nivel 6-4.
- Integración en GradLab: usar el comando `gradlab play` con una ROM propia para inspeccionar cualitativamente el comportamiento del agente.
- Estudio de reproducibilidad: analizar la trazabilidad del run (manifest, receta, checkpoint) como caso de buenas prácticas de registro de experimentos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Despejes en los últimos 100 episodios de entrenamiento | 100 / 100 |
| Despejes acumulados en entrenamiento | 3.565 / 16.908 |
| Transiciones de entorno | 4.562.944 |
| Evaluación de aceptación independiente | No disponible |

No se han publicado resultados de benchmarks comparativos con otros modelos o políticas en la información disponible. Las cifras anteriores proceden del informe de entrenamiento del autor y corresponden a una única semilla (`seed 12`).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es 0.0 GB y no se detalla el tamaño de la red.
- GPU recomendadas: no disponible; al ser una política de RL de un entorno NES, es plausible que se ejecute en CPU, pero no se confirma en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: GradLab mediante `gradlab play 'hf://tsilva/SuperMarioBros-Nes-v0_Level6-4' --rom-path /path/to/SuperMarioBros.nes`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas comparables publicadas para el mismo nivel y entorno, ni se dispone de datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Entrenada con una única semilla (`seed 12`); no hay evidencia de robustez estadística ni de intervalos de confianza.
- La evaluación de aceptación independiente no está disponible; las métricas las declara el propio autor.
- Específica del nivel 6-4 desde el inicio canónico; no se garantiza comportamiento correcto en otros niveles o condiciones iniciales.
- Requiere una ROM de Super Mario Bros. NES que el usuario debe aportar; no se distribuye con el modelo.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- No es un modelo de lenguaje: no debe evaluarse con métricas de NLP ni usarse para tareas de texto.
- Riesgo de sobreajuste al entorno y al nivel concreto; no hay datos sobre generalización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level6-4
- Informe de entrenamiento: https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level6-4--2026-11-17
- Repositorio GradLab: https://github.com/tsilva/gradlab
- Instalación de GradLab: https://github.com/tsilva/gradlab#install
- Manifest del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-46310e7b3fc6c69484249b5bf5e8c9bb/checkpoints/4562944-460e5cdbc350db3b1e23b4d2d8af519aaecbe81b5553650e120d9a3453dedf82/manifest.json
- Colección Mario en Hugging Face: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
