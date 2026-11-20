# tsilva/SuperMarioBros-Nes-v0_Level3-3

## Resumen

SuperMarioBros-Nes-v0_Level3-3 es una política de aprendizaje por refuerzo entrenada desde cero para completar el nivel 3-3 del videojuego Super Mario Bros. de NES, dentro del entorno `SuperMarioBros-Nes-v0`. Lo publica el usuario tsilva en Hugging Face y forma parte de una colección de políticas por nivel generadas con GradLab, una herramienta propia del autor. No es un modelo de lenguaje ni un transformer generativo: es un agente de control entrenado con PPO (Proximal Policy Optimization) combinado con SIL (Self-Imitation Learning) para maximizar la recompensa del entorno de juego.

El modelo resuelve un problema acotado: aprender una política que, partiendo del inicio canónico del nivel 3-3, complete el nivel de forma consistente. Según la model card, la política alcanza 95 despejes en las últimas 100 episodios de entrenamiento, con 1.392 despejes acumulados sobre 10.165 episodios y 2.617.344 transiciones de entorno. La relevancia es limitada al ámbito de investigación en RL y videojuegos: sirve como referencia reproducible de un receta de entrenamiento concreta, no como componente de propósito general.

No hay información sobre arquitectura de red, tamaño de parámetros, contexto ni idiomas, ya que no aplica a este tipo de artefacto. El repositorio ocupa 0.0 GB según Hugging Face y contiene un bundle con la política (`model.zip`), metadatos del checkpoint (`model.json`) y la receta ejecutada (`recipe.json`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL; red neuronal no especificada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (no aplica a un agente de control) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (bundle GradLab); metadatos en `model.json` y receta en `recipe.json` |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura de la red neuronal subyacente. Lo que sí especifica es el algoritmo de entrenamiento: PPO (Proximal Policy Optimization) combinado con SIL (Self-Imitation Learning), implementado en la librería GradLab del propio autor. El entrenamiento se realizó desde cero, sin inicialización a partir de un modelo preentrenado, sobre el entorno `SuperMarioBros-Nes-v0` con inicio canónico en el nivel 3-3.

Los datos de entrenamiento son las transiciones del propio entorno: 2.617.344 transiciones recolectadas en una única ejecución con semilla `1801`. El run identificado como `gradlab-a4b01e5e7bc23cdf3e7e09c80e193ad8` produjo el checkpoint `checkpoint-2617344-98eac1c7baee59cf`. No se indica número de tokens (no aplica), composición de dataset, ni uso de RLHF o DPO. La innovación destacable, si puede llamarse así, es la receta de entrenamiento por nivel reproducible que GradLab publica junto al checkpoint.

## Capacidades

- Control de un agente en el entorno `SuperMarioBros-Nes-v0`, nivel 3-3, desde el inicio canónico.
- Política entrenada específicamente para completar el nivel; no generaliza a otros niveles ni a otras tareas.
- Reproducibilidad: el bundle incluye la receta ejecutada (`recipe.json`) y los metadatos del checkpoint (`model.json`).
- Ejecución mediante el comando `gradlab play` con una ROM de Super Mario Bros. NES aportada por el usuario.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento.
- No es un modelo de lenguaje: no genera texto, código ni matemáticas.

## Casos de uso

- Reproducción de experimentos de RL: cargar el checkpoint con `gradlab play` y verificar el comportamiento de la política en el nivel 3-3 con la ROM correspondiente, útil para validar la receta de GradLab.
- Baseline en investigación de RL sobre videojuegos: comparar nuevas políticas o algoritmos contra una política que resuelve el nivel 3-3 con 95/100 despejes en las últimas 100 episodios de entrenamiento.
- Estudio de PPO + SIL: analizar cómo la combinación de ambos algoritmos afecta a la estabilidad y a la tasa de éxito en un entorno de control discreto con recompensa escasa.
- Docencia y divulgación: ejemplo concreto y reproducible de entrenamiento por refuerzo desde cero en un entorno tipo Atari/NES, con métricas de despeje publicadas.
- Auditoría de recetas de entrenamiento: inspeccionar `recipe.json` para reconstruir hiperparámetros y flujo de entrenamiento de GradLab.
- Integración en pipelines de evaluación de agentes: usar el checkpoint como referencia fija en pruebas automatizadas de la herramienta GradLab o de entornos compatibles.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Despejes en los últimos 100 episodios de entrenamiento | 95 / 100 |
| Despejes acumulados en entrenamiento | 1.392 / 10.165 |
| Transiciones de entorno | 2.617.344 |
| Evaluación de aceptación independiente | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a este tipo de artefacto. Las cifras anteriores proceden de una única ejecución de entrenamiento con semilla `1801` y no de una evaluación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y la red no está descrita, por lo que no se puede estimar.
- GPU recomendadas: no disponibles. Por la naturaleza del artefacto (política de RL para un entorno NES), es probable que la inferencia quepa en CPU, pero la model card no lo confirma.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos de requisitos.
- Opciones de despliegue: `gradlab play 'hf://tsilva/SuperMarioBros-Nes-v0_Level3-3' --rom-path /path/to/SuperMarioBros.nes`, previa instalación de GradLab y con una ROM de Super Mario Bros. NES propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye políticas comparables de otros autores ni métricas de referencia para el mismo nivel o entorno. Dentro de la propia colección del autor (`gradlab-supermariobros-nes-v0`) existen políticas por nivel, pero no se aportan sus especificaciones ni resultados.

## Limitaciones y advertencias

- La política está especializada en un único nivel (3-3) de un único juego; no generaliza a otros niveles ni entornos.
- Las métricas de despeje provienen de una sola ejecución de entrenamiento con semilla `1801`; no hay evaluación de aceptación independiente.
- No se especifica la licencia, lo que impide determinar si el uso comercial está permitido.
- Requiere que el usuario aporte su propia ROM de Super Mario Bros. NES; el modelo no incluye el juego ni los datos del entorno.
- No hay información sobre sesgos, alucinación ni comportamiento fuera de distribución más allá del propio entorno de entrenamiento.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks de NLP ni usarse para tareas de generación de texto.
- El repositorio ocupa 0.0 GB según Hugging Face; conviene verificar la integridad del bundle antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level3-3
- Colección GradLab Super Mario Bros. NES: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
- Repositorio GradLab: https://github.com/tsilva/gradlab
- Instrucciones de instalación de GradLab: https://github.com/tsilva/gradlab#install
- Informe de entrenamiento (nivel 3-3): https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level3-3--2026-11-19
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-a4b01e5e7bc23cdf3e7e09c80e193ad8/checkpoints/2617344-98eac1c7baee59cf8184745348b139a64bfa01224bff84e9ebe6ecc1ccc723f7/manifest.json
