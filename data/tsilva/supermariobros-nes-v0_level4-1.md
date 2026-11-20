# tsilva/SuperMarioBros-Nes-v0_Level4-1

## Resumen

SuperMarioBros-Nes-v0_Level4-1 es una política de aprendizaje por refuerzo entrenada desde cero con PPO (Proximal Policy Optimization) mediante el framework GradLab, desarrollado por el autor tsilva. Su único objetivo es completar el nivel 4-1 del videojuego Super Mario Bros. de NES partiendo del inicio canónico del nivel. No se trata de un modelo de lenguaje ni de un modelo generativo: es un agente que recibe observaciones del entorno `SuperMarioBros-Nes-v0` y emite acciones de control del personaje.

El modelo es relevante como ejemplo de receta reproducible de RL aplicada a un entorno de Atari/NES concreto, ya que el bundle publicado incluye la política (`model.zip`), los metadatos del checkpoint (`model.json`) y la receta ejecutada (`recipe.json`). Según la model card, la política alcanza 98/100 episodios completados en los últimos 100 episodios de entrenamiento, tras 5.496.832 transiciones de entorno y 6.984 clears acumulados sobre 14.382 episodios.

La información pública disponible es muy limitada: no hay datos sobre arquitectura de red, número de parámetros, licencia, idiomas ni benchmarks independientes. La model card indica explícitamente que la evaluación de aceptación independiente no está disponible. El repositorio tiene 0.0 GB de tamaño declarado y 0 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL entrenada con PPO; no se detalla la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entorno de juego, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (agente de control, sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (política), `model.json` (metadatos), `recipe.json` (receta) |

## Arquitectura y entrenamiento

La política se entrena desde cero con PPO en GradLab sobre el entorno `SuperMarioBros-Nes-v0`, partiendo siempre del inicio canónico del nivel 4-1. La model card no especifica la arquitectura de la red neuronal (número de capas, tipo de extractor de características, tamaño de la capa recurrente o feed-forward), por lo que este dato debe considerarse no disponible.

El entrenamiento reportado corresponde a una única ejecución con semilla `12`, identificada como `gradlab-cd5a1316a963f0e784e9cc5fc97b9799`, que produjo el checkpoint `checkpoint-5496832-86597f65f2f145fe`. Se acumularon 5.496.832 transiciones de entorno y 6.984 clears sobre 14.382 episodios. No se documentan técnicas adicionales como recompensas conformadas, curriculum learning, decodificación especulativa ni atención lineal; tampoco se indica si hubo ajuste fino posterior al entrenamiento PPO.

## Capacidades

- Control de agente en el entorno `SuperMarioBros-Nes-v0` para el nivel 4-1 desde el inicio canónico.
- Ejecución de políticas entrenadas con PPO mediante el comando `gradlab play`.
- Reproducibilidad parcial: el bundle incluye metadatos del checkpoint y la receta ejecutada.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio ni capacidades multilingües.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No se documentan capacidades de generalización a otros niveles, otros entornos o variaciones del juego.

## Casos de uso

- Reproducción de experimentos de RL: cargar la política con `gradlab play` y una ROM de Super Mario Bros. NES propia para verificar el comportamiento reportado en la model card.
- Docencia y formación en RL: usar la receta y el checkpoint como ejemplo concreto de entrenamiento PPO desde cero en un entorno NES, con métricas de clears y transiciones documentadas.
- Investigación en entornos de referencia: comparar recetas de PPO sobre `SuperMarioBros-Nes-v0` nivel 4-1 frente a otras configuraciones o semillas.
- Auditoría de reproducibilidad: inspeccionar `model.zip`, `model.json` y `recipe.json` para reconstruir la configuración de entrenamiento y el checkpoint publicado.
- Desarrollo de pipelines de evaluación: integrar el agente en un banco de pruebas automatizado que ejecute episodios desde el inicio canónico y registre clears.
- Base para experimentos de transferencia: partir de esta política como inicialización en el mismo entorno y evaluar si mejora el rendimiento en otros niveles, aunque no se ha documentado dicha transferencia.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Clears en los ultimos 100 episodios de entrenamiento | 98 / 100 |
| Clears acumulados en entrenamiento | 6.984 / 14.382 |
| Transiciones de entorno | 5.496.832 |
| Evaluacion de aceptacion independiente | No disponible |

No se han publicado resultados de benchmarks independientes ni comparaciones con otros agentes en la información disponible. Los datos anteriores proceden de una única ejecución con semilla `12` y no constituyen una evaluación de aceptación externa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el tamaño de la red).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: GradLab mediante `gradlab play 'hf://tsilva/SuperMarioBros-Nes-v0_Level4-1' --rom-path /path/to/SuperMarioBros.nes`.
- Latencia y throughput estimados: no disponibles.
- Requisito adicional: es necesario disponer de una ROM de Super Mario Bros. NES compatible; no se distribuye con el modelo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros agentes de RL comparables sobre `SuperMarioBros-Nes-v0` ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La evaluación de aceptación independiente no está disponible; los resultados reportados provienen de una única ejecución con semilla `12`.
- El agente está especializado en el nivel 4-1 desde el inicio canónico; no se documenta generalización a otros niveles o condiciones.
- No se especifica la arquitectura de la red, el número de parámetros ni los requisitos de hardware, lo que dificulta la reproducibilidad completa.
- La licencia no está disponible, por lo que el uso comercial y la redistribución no están claramente autorizados.
- El uso requiere una ROM de Super Mario Bros. NES propia; la legalidad de la ROM es responsabilidad del usuario.
- No es un modelo de lenguaje: no debe evaluarse con métricas de MMLU, HumanEval, GSM8K ni similares.
- El repositorio declara 0.0 GB de tamaño, lo que puede indicar que los artefactos no están completamente subidos o que el tamaño no se ha actualizado.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no procesa lenguaje natural.

## Enlaces

- Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level4-1
- Informe de entrenamiento: https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level4-1--2026-11-16
- Instalación de GradLab: https://github.com/tsilva/gradlab#install
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-cd5a1316a963f0e784e9cc5fc97b9799/checkpoints/5496832-86597f65f2f145fe05336d18aa30784becc4a4c4a65f14951210c4f7d901f082/manifest.json
- Colección Mario en Hugging Face: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
