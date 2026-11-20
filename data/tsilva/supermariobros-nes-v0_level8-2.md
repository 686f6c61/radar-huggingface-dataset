# tsilva/SuperMarioBros-Nes-v0_Level8-2

## Resumen

`tsilva/SuperMarioBros-Nes-v0_Level8-2` es una política de aprendizaje por refuerzo entrenada desde cero con PPO (Proximal Policy Optimization) para completar el nivel 8-2 del juego `SuperMarioBros-Nes-v0`, un entorno de emulación de NES. Lo desarrolla el usuario `tsilva` dentro del ecosistema GradLab, una librería de entrenamiento de agentes de refuerzo. No se trata de un modelo de lenguaje: no procesa texto ni genera contenido lingüístico, sino que mapea observaciones del estado del juego a acciones de control del mando de NES.

El modelo es relevante como ejemplo de receta reproducible de RL para videojuegos clásicos: el autor publica no solo los pesos de la política (`model.zip`), sino también los metadatos del checkpoint y la receta ejecutada (`recipe.json`), lo que permite auditar y replicar el entrenamiento. El checkpoint publicado se entrenó durante 10.780.672 transiciones de entorno y reporta una tasa de éxito de 83/100 episodios en la ventana de evaluación de entrenamiento.

La información disponible es escasa en cuanto a arquitectura interna de la red, datos de entrenamiento detallados y licencia. La model card documenta los resultados de entrenamiento y el procedimiento de uso, pero no desglosa la topología de la red neuronal ni las hiperparametrizaciones completas de PPO.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal entrenada con PPO en GradLab; topología no especificada) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada basada en observaciones del entorno) |
| Tipos de cuantización | no disponible (pesos en `model.zip`, formato propio de GradLab) |
| Idiomas soportados | no disponible (no aplica; no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (bundle GradLab), con `model.json` y `recipe.json` asociados |

## Arquitectura y entrenamiento

La política se entrenó desde cero mediante PPO en GradLab sobre el entorno `SuperMarioBros-Nes-v0`. El entrenamiento acumuló 10.780.672 transiciones de entorno en una única ejecución con semilla `12`, y el checkpoint publicado corresponde al run `gradlab-b94f25d7f2960b060093f46aeca74ac7`, identificador de checkpoint `checkpoint-10780672-70ede32bc9d7c909`. Cada episodio contabilizado comienza en el inicio canónico del nivel 8-2.

No se detalla en la información disponible la topología de la red (número de capas, canales, función de activación), la composición exacta del espacio de observación (píxeles, RAM, features derivadas) ni los hiperparámetros de PPO (learning rate, clipping, número de epochs por actualización, tamaño de rollout). Tampoco se especifica si hubo recompensas conformadas, curriculum o técnicas auxiliares. El bundle incluye la receta ejecutada (`recipe.json`) y los metadatos del checkpoint (`model.json`), que son los artefactos donde residiría esa información.

## Capacidades

- Control de agente en el entorno `SuperMarioBros-Nes-v0`: selecciona acciones de mando de NES a partir de observaciones del juego.
- Completar el nivel 8-2 desde el inicio canónico con una tasa reportada de 83/100 episodios en la ventana de evaluación de entrenamiento.
- Reproducibilidad: el bundle incluye receta, metadatos de checkpoint y manifiesto, lo que permite inspeccionar y replicar el entrenamiento.
- Ejecución mediante el comando `gradlab play` con una ROM de Super Mario Bros. NES aportada por el usuario.
- No soporta tool calling, function calling, agentes multi-paso genéricos, capacidades multilingües, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Evaluación de recetas de RL en videojuegos: usar el checkpoint como referencia de rendimiento para comparar variantes de PPO, recompensas o preprocesado en el mismo nivel y semilla.
- Reproducción de experimentos: el bundle con `recipe.json` y `model.json` permite reconstruir el pipeline de entrenamiento y verificar los resultados reportados.
- Benchmark de entornos NES: servir como línea base para medir la dificultad del nivel 8-2 frente a otros niveles de la colección `gradlab-supermariobros-nes-v0`.
- Docencia y divulgación de RL: ejemplo concreto y acotado de entrenamiento desde cero con PPO, con métricas de éxito publicadas y artefactos auditables.
- Investigación en estabilidad de políticas: analizar la diferencia entre la tasa de éxito en la ventana reciente (83/100) y la acumulada (5.253/33.266) para estudiar la curva de aprendizaje.
- Integración en pipelines de evaluación automatizada: cargar la política con `gradlab play` y ejecutar episodios de aceptación con semillas controladas para medir robustez.
- Estudio de transferencia y generalización: evaluar la política en variantes del nivel o en condiciones de inicio distintas a la canónica para medir su sensibilidad.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---:|
| Nivel completado en los últimos 100 episodios de entrenamiento | 83 / 100 |
| Nivel completado acumulado en entrenamiento | 5.253 / 33.266 |
| Transiciones de entorno | 10.780.672 |
| Evaluación de aceptación independiente | no disponible |
| Semilla de entrenamiento | 12 |

No se han publicado resultados de benchmarks en la información disponible más allá de las métricas de entrenamiento anteriores. No hay comparación con otras políticas en la model card.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio es de 0,0 GB y el peso de la política se distribuye como `model.zip`, por lo que es presumiblemente ligero; no se especifica la topología ni el número de parámetros.
- GPU recomendadas: no disponibles. No se documenta si el entrenamiento o la inferencia requieren GPU.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del artefacto es plausible que la inferencia sea viable en CPU, pero no se confirma en la información proporcionada.
- Opciones de despliegue: `gradlab play` con una ROM de Super Mario Bros. NES aportada por el usuario. No se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles.
- Requisito adicional: es necesario disponer de una ROM de Super Mario Bros. NES compatible; el repositorio no incluye la ROM.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Métrica reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tsilva/SuperMarioBros-Nes-v0_Level8-2` | Política PPO | SuperMarioBros-Nes-v0, nivel 8-2 | 83/100 en últimos 100 episodios | no disponible | Hugging Face |
| Otros checkpoints de la colección `gradlab-supermariobros-nes-v0` | Políticas PPO | Otros niveles de SuperMarioBros-Nes-v0 | no disponible en esta ficha | no disponible | Hugging Face (colección del autor) |
| Alternativas de RL para Atari/NES | Políticas varias | Entornos ALE/NES | no disponible | variable | variable |

No se dispone de datos comparativos detallados con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La evaluación de aceptación independiente no está disponible; la tasa de 83/100 procede de la ventana de entrenamiento y podría no reflejar el rendimiento en condiciones de evaluación separadas.
- El rendimiento se mide sobre una única semilla (`12`) y un único nivel (8-2) desde el inicio canónico; no se documenta generalización a otras condiciones de inicio, variantes del nivel u otros niveles.
- No se especifica la licencia, lo que impide determinar si el uso comercial está permitido.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas (no aplican a un modelo de lenguaje, pero tampoco se documentan sesgos de política).
- Requiere una ROM de Super Mario Bros. NES que el usuario debe aportar; el repositorio no la incluye y su uso está sujeto a la legalidad aplicable.
- No se detalla la arquitectura ni los hiperparámetros de PPO en la información disponible; la reproducibilidad depende de los artefactos `recipe.json` y `model.json` incluidos en el bundle.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level8-2
- Repositorio GradLab: https://github.com/tsilva/gradlab
- Instrucciones de instalación de GradLab: https://github.com/tsilva/gradlab#install
- Informe de entrenamiento (nivel 8-2): https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level8-2--2026-11-17
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-b94f25d7f2960b060093f46aeca74ac7/checkpoints/10780672-70ede32bc9d7c909d68f9312e3eb3b81ba14ad4b6955d8e59d95d6ac396fe3c1/manifest.json
- Colección de modelos Mario de GradLab: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
