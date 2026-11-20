# tsilva/SuperMarioBros-Nes-v0_Level8-3

## Resumen

SuperMarioBros-Nes-v0_Level8-3 es una política de aprendizaje por refuerzo entrenada desde cero con PPO (Proximal Policy Optimization) mediante el framework GradLab, desarrollada por el usuario tsilva. Su único objetivo es completar el nivel 8-3 de Super Mario Bros. de NES en el entorno `SuperMarioBros-Nes-v0`, partiendo siempre del inicio canónico del nivel. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general: es un agente de control que mapea observaciones del emulador a acciones del mando.

El modelo es relevante como ejemplo de receta reproducible de RL aplicada a videojuegos con entornos tipo Gymnasium y como referencia de entrenamiento por nivel en Super Mario Bros. La model card reporta 81 niveles completados en las últimas 100 episodios de entrenamiento y 1.965 clears acumulados sobre 16.717 episodios, con 4.612.096 transiciones de entorno. No se especifican arquitectura de red, número de parámetros ni hiperparámetros en la información disponible.

La ficha es deliberadamente escasa en varios apartados porque la información publicada se limita a la model card, la licencia no está declarada y el repositorio ocupa 0.0 GB (los pesos se distribuyen como `model.zip`, no como safetensors). Cualquier dato no confirmado se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política de RL entrenada con PPO; red neuronal no especificada) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entorno de RL, no modelo de contexto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | `model.zip` (bundle de GradLab), junto con `model.json` y `recipe.json` |

## Arquitectura y entrenamiento

La política se entrenó con PPO dentro de GradLab sobre el entorno `SuperMarioBros-Nes-v0`, con una receta orientada a superar un nivel concreto (Level 8-3) desde el inicio canónico. El run identificado es `gradlab-f789eeefefa8936d790da4590c4b2b37`, que produjo el checkpoint `checkpoint-4612096-9628934ee3823db9`. El entrenamiento acumuló 4.612.096 transiciones de entorno y completó 1.965 episodios exitosos de un total de 16.717, con semilla `12`. En las últimas 100 episodios de entrenamiento la tasa de éxito fue de 81/100.

No se detalla en la información disponible la topología de la red (capas, activaciones, tamaño de la observación, preprocesado de píxeles), ni los hiperparámetros de PPO (learning rate, clip range, número de entornos paralelos, horizonte de rollout). Tampoco se documenta si hubo reward shaping, currículo o imitación. El bundle incluye `recipe.json` con la receta ejecutada, lo que permite reproducir el entrenamiento si se dispone de GradLab y de una ROM legal de Super Mario Bros. NES.

## Capacidades

- Control de un agente en Super Mario Bros. NES para el nivel 8-3, partiendo del inicio canónico.
- Política entrenada específicamente para un nivel; no se reporta capacidad de generalización a otros niveles.
- Tasa de éxito reportada de 81/100 en las últimas 100 episodios de entrenamiento (no validada por evaluación independiente).
- Ejecución mediante el comando `gradlab play` con una ROM proporcionada por el usuario.
- No soporta tool calling, function calling, agentes multi-paso fuera del entorno, ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de experimentos de RL: sirve como referencia para validar que una instalación de GradLab y una ROM funcionan correctamente, ejecutando el comando `gradlab play` sobre el checkpoint publicado.
- Estudio de recetas de PPO por nivel: el `recipe.json` incluido permite analizar hiperparámetros y comparar con otras recetas del mismo autor en la colección de Super Mario Bros.
- Baseline en investigación de RL sobre videojuegos: útil como punto de partida para comparar algoritmos (PPO frente a otras variantes) en un nivel difícil como 8-3.
- Docencia y demostraciones: ejemplo tangible de agente que completa un nivel concreto, útil en cursos de aprendizaje por refuerzo.
- Ingeniería de entornos Gymnasium: referencia para integrar `SuperMarioBros-Nes-v0` en pipelines de entrenamiento con emulador NES.
- Evaluación de estabilidad de políticas: la diferencia entre 81/100 en las últimas 100 episodios y 1.965/16.717 acumulados permite estudiar la varianza del entrenamiento y el olvido catastrófico.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Clears en las ultimas 100 episodios de entrenamiento | 81 / 100 |
| Clears acumulados en entrenamiento | 1.965 / 16.717 |
| Transiciones de entorno | 4.612.096 |
| Evaluacion de aceptacion independiente | No disponible |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no es un modelo de lenguaje. Los únicos datos de rendimiento son los de la model card, procedentes de un único run con semilla `12` y sin evaluación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y los pesos se empaquetan en `model.zip`, por lo que probablemente la política es pequeña, pero no se confirma.
- GPU recomendadas: no disponible. Al ser una política de RL para un emulador NES, es plausible que funcione en CPU, pero no se documenta.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: únicamente GradLab (`gradlab play`), con ROM de Super Mario Bros. NES proporcionada por el usuario. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Clears reportados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tsilva/SuperMarioBros-Nes-v0_Level8-3 | SuperMarioBros-Nes-v0, nivel 8-3 | PPO | 81/100 (últimas 100 episodios) | No disponible | Hugging Face |
| Otras políticas de la colección GradLab Super Mario Bros. | Niveles distintos de SuperMarioBros-Nes-v0 | PPO | No disponible en esta ficha | No disponible | Colección de Hugging Face del mismo autor |
| Agentes RL públicos para Super Mario Bros. (por ejemplo, basados en stable-baselines3) | Entornos NES o similares | PPO/A2C/DQN | No disponible | Variable según proyecto | Repositorios GitHub |

No se dispone de datos comparativos verificables con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para el nivel 8-3 desde el inicio canónico; no se reporta generalización a otros niveles ni a estados iniciales distintos.
- Sin evaluación independiente: la tasa de éxito de 81/100 procede del propio entrenamiento, no de una aceptación externa, por lo que puede estar sobreestimada.
- Un solo run y una sola semilla (`12`): no hay evidencia de robustez entre semillas.
- Requiere una ROM de Super Mario Bros. NES que el usuario debe aportar legalmente; el modelo no incluye la ROM.
- Licencia no declarada: no se puede confirmar el uso comercial ni la redistribución de los pesos.
- No es un modelo de lenguaje: no admite prompts, tool calling ni generación de texto; cualquier uso fuera del entorno de RL no está soportado.
- Sin datos de sesgos, alucinación o limitaciones idiomáticas, ya que no aplican a este tipo de política.
- El repositorio ocupa 0.0 GB y no se documenta el contenido exacto de `model.zip` más allá de la política, `model.json` y `recipe.json`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level8-3
- Colección GradLab Super Mario Bros.: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
- Repositorio GradLab: https://github.com/tsilva/gradlab
- Instrucciones de instalación de GradLab: https://github.com/tsilva/gradlab#install
- Informe de entrenamiento (nivel 8-3): https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level8-3--2026-11-17
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-f789eeefefa8936d790da4590c4b2b37/checkpoints/4612096-9628934ee3823db9b11fb1fee892efbd8aee285d5c55bf258fc62c2b11e77743/manifest.json
