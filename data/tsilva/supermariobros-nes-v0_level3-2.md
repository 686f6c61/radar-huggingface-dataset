# tsilva/SuperMarioBros-Nes-v0_Level3-2

## Resumen

`tsilva/SuperMarioBros-Nes-v0_Level3-2` es una política de aprendizaje por refuerzo entrenada desde cero mediante PPO (Proximal Policy Optimization) para superar el nivel 3-2 de Super Mario Bros. de NES en el entorno `SuperMarioBros-Nes-v0`. Lo desarrolla el usuario tsilva dentro del proyecto GradLab, una herramienta de experimentación en RL, y se publica como un bundle reproducible que incluye los pesos de la política, los metadatos del checkpoint y la receta de entrenamiento ejecutada.

No se trata de un modelo de lenguaje ni de un modelo fundacional: es un agente especializado en una única tarea de control secuencial sobre un emulador de NES. Su relevancia es la de un artefacto de investigación reproducible: permite replicar y auditar un entrenamiento PPO completo (2.007.040 transiciones de entorno) y ejecutar la política directamente con el comando `gradlab play`, siempre que el usuario aporte su propia ROM legal de Super Mario Bros.

El checkpoint publicado reporta 96 superaciones del nivel en las últimas 100 episodios de entrenamiento, con 2.003 superaciones acumuladas sobre 6.694 episodios totales. No hay evaluación de aceptación independiente ni datos de benchmarks estándar de RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO); arquitectura de red no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de control secuencial, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (pesos de la política), `model.json` (metadatos del checkpoint), `recipe.json` (receta ejecutada); librería `gradlab` |
| Entorno | `SuperMarioBros-Nes-v0`, nivel 3-2, inicio canónico |
| Algoritmo | PPO (Proximal Policy Optimization) |
| Transiciones de entrenamiento | 2.007.040 |
| Semilla | 12 |
| Checkpoint | `checkpoint-2007040-706aed0b953ab904` |
| Run ID | `gradlab-0946a7afd6d15e6613f57963360229f5` |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

La política se entrena desde cero con PPO en GradLab sobre el entorno `SuperMarioBros-Nes-v0`, un wrapper de Gymnasium sobre el emulador de NES. El entrenamiento parte del inicio canónico del nivel 3-2 y se ejecuta con la semilla `12`, acumulando 2.007.040 transiciones de entorno hasta el checkpoint publicado (`checkpoint-2007040-706aed0b953ab904`, run `gradlab-0946a7afd6d15e6613f57963360229f5`). No se detalla en la información disponible la topología de la red (capas, unidades, si usa convoluciones sobre el framebuffer o features preprocesadas), ni hiperparámetros de PPO como tasa de aprendizaje, clipping o tamaño de batch.

La aportación metodológica del bundle es la reproducibilidad: se publican conjuntamente los pesos (`model.zip`), los metadatos del checkpoint (`model.json`) y la receta de entrenamiento ejecutada (`recipe.json`), además de un informe de entrenamiento enlazado en el repositorio de GradLab. No se mencionan innovaciones técnicas adicionales como reward shaping explícito, currículo o decodificación especulativa; el resultado reportado se limita a las métricas de superación del nivel durante el propio entrenamiento.

## Capacidades

- Control secuencial en tiempo real sobre el nivel 3-2 de Super Mario Bros. (NES) desde el inicio canónico del nivel.
- Superación del nivel con una tasa reportada de 96/100 en los últimos 100 episodios de entrenamiento.
- Ejecución jugable mediante el comando `gradlab play 'hf://tsilva/SuperMarioBros-Nes-v0_Level3-2' --rom-path /path/to/SuperMarioBros.nes`.
- Reproducción del entrenamiento a partir de la receta publicada (`recipe.json`) y los metadatos del checkpoint.
- No soporta tool calling, function calling, agentes multi-paso genéricos, razonamiento en lenguaje natural, visión general, audio ni capacidades multilingües.
- Su generalización a otros niveles, a otras variantes del entorno o a modificaciones de la ROM no está documentada en la información disponible.

## Casos de uso

- Reproducción de experimentos de RL: cargar la receta `recipe.json` y el checkpoint para replicar el entrenamiento PPO con la semilla `12` y verificar las métricas reportadas (96/100 superaciones recientes, 2.003/6.694 acumuladas).
- Docencia y formación en aprendizaje por refuerzo: usar el bundle como ejemplo completo y auditable de un pipeline PPO desde cero sobre un entorno de control discreto con observaciones visuales.
- Evaluación de infraestructura de RL: servir como carga de referencia para medir throughput de transiciones y latencia de inferencia de políticas en GradLab sobre hardware concreto.
- Punto de partida para fine-tuning: iniciar desde este checkpoint políticas para niveles adyacentes o variantes del entorno, aprovechando las 2.007.040 transiciones ya acumuladas.
- Investigación en estabilidad de PPO: analizar la curva de superaciones (2.003/6.694 acumuladas frente a 96/100 en la ventana reciente) para estudiar varianza y olvido catastrófico en políticas de un solo nivel.
- Demostraciones y material divulgativo: ejecutar el agente en vivo con `gradlab play` para ilustrar el comportamiento de una política entrenada por RL en un juego clásico, siempre con una ROM aportada por el usuario.

## Benchmarks y rendimiento

| Metrica | Valor en el checkpoint publicado |
|---|---:|
| Superaciones en los ultimos 100 episodios de entrenamiento | 96 / 100 |
| Superaciones acumuladas en entrenamiento | 2.003 / 6.694 |
| Transiciones de entorno | 2.007.040 |
| Evaluacion de aceptacion independiente | No disponible |

No se han publicado resultados de benchmarks estandar (por ejemplo, métricas agregadas sobre múltiples semillas, evaluaciones held-out o comparaciones con otras políticas) en la información disponible. Las cifras anteriores provienen de una única ejecución de entrenamiento con semilla `12` y episodios iniciados en el comienzo canónico del nivel 3-2.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es de 0.0 GB, lo que sugiere un artefacto muy pequeño, pero no se publica el número de parámetros de la política.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del bundle es plausible que quepa en cualquier GPU de consumo, pero no hay dato oficial.
- Opciones de despliegue: GradLab (`gradlab play`), con una ROM de Super Mario Bros. NES aportada por el usuario. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Entrenamiento | Metrica reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tsilva/SuperMarioBros-Nes-v0_Level3-2 | Politica PPO | SuperMarioBros-Nes-v0, nivel 3-2 | 2.007.040 transiciones, semilla 12 | 96/100 superaciones recientes | no disponible | Hugging Face (0 descargas, 0 likes) |
| Otras politicas de la coleccion GradLab SuperMarioBros-Nes-v0 | Politica PPO | Otros niveles de SuperMarioBros-Nes-v0 | no disponible | no disponible | no disponible | Coleccion publica en Hugging Face |
| Alternativas externas de RL sobre Super Mario Bros. | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar contra la propia colección de políticas de GradLab para el mismo entorno, sin métricas publicadas para el resto de niveles. No se dispone de datos de modelos comparables de otros autores.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para el nivel 3-2 desde el inicio canónico; no hay evidencia de que funcione en otros niveles, en reinicios intermedios o con modificaciones de la ROM.
- Métricas autoinformadas: el 96/100 y el 2.003/6.694 provienen de una sola ejecución de entrenamiento con semilla `12`; no hay evaluación de aceptación independiente ni validación held-out.
- Sesgo de semilla: al no publicarse resultados sobre múltiples semillas, se desconoce la varianza del rendimiento y el riesgo de sobreajuste a la trayectoria concreta del entrenamiento.
- Requisito legal de ROM: el uso requiere una ROM de Super Mario Bros. NES aportada por el usuario; la distribución de la ROM no está incluida y su posesión debe ser legal en la jurisdicción del usuario.
- Licencia no especificada: al no indicarse licencia, no se puede asumir permiso para uso comercial, redistribución o modificación; conviene contactar con el autor antes de cualquier uso en producción.
- Sin datos de arquitectura ni de parámetros: no es posible estimar con precisión coste computacional, latencia ni requisitos de memoria a partir de la información publicada.
- Riesgo de alucinación no aplicable: al no ser un modelo generativo de lenguaje, no produce texto; el riesgo equivalente es la imprevisibilidad de la política ante estados no vistos durante el entrenamiento.
- Fecha de creación futura en los metadatos (2026-11-20): conviene verificar la integridad y procedencia del artefacto antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level3-2
- Colección GradLab SuperMarioBros-Nes-v0: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
- Repositorio GradLab (instalación): https://github.com/tsilva/gradlab#install
- Informe de entrenamiento (nivel 3-2): https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level3-2--2026-11-15
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-0946a7afd6d15e6613f57963360229f5/checkpoints/2007040-706aed0b953ab90416e7aedaa0bf38dda38dba5355e114f2f8290571eaa256b4/manifest.json
