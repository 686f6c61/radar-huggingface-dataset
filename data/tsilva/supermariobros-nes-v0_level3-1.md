# tsilva/SuperMarioBros-Nes-v0_Level3-1

## Resumen

SuperMarioBros-Nes-v0_Level3-1 es una política de aprendizaje por refuerzo entrenada desde cero con PPO (Proximal Policy Optimization) mediante la librería GradLab, desarrollada por tsilva. Su único propósito es completar el nivel 3-1 de Super Mario Bros. de NES partiendo desde el inicio canónico del nivel. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general: es un agente que mapea observaciones del entorno (frames del emulador) a acciones de control del mando de NES.

El artefacto publicado corresponde al checkpoint `checkpoint-5505024-ed89c28b554142b2` de la ejecución `gradlab-1314875913c13bf83c8bebf78d4ee17d`, tras 5.505.024 transiciones de entorno. Según la model card, la política completó el nivel en 96 de las últimas 100 episodios de entrenamiento y acumuló 5.769 despejes sobre 14.619 episodios totales durante el entrenamiento, con semilla 12.

Es relevante como ejemplo de receta reproducible de RL para entornos discretos de control (Gymnasium/retro), no como componente para aplicaciones de NLP. El repo ocupa 0.0 GB y contiene la política serializada (`model.zip`), metadatos (`model.json`) y la receta ejecutada (`recipe.json`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de RL entrenada con PPO (red neuronal no especificada en detalle; arquitectura interna no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones del entorno) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (bundle de GradLab); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es una política entrenada con PPO dentro de GradLab sobre el entorno `SuperMarioBros-Nes-v0`. El entrenamiento partió desde cero (no fine-tuning de una política previa) y se realizó durante 5.505.024 transiciones de entorno, con evaluaciones de despeje iniciadas siempre en el punto de partida canónico del nivel 3-1. Los detalles de la red (número de capas, dimensión de las representaciones, función de recompensa, hiperparámetros de PPO) no están disponibles en la información proporcionada.

La model card documenta la procedencia completa: identificador de ejecución, identificador del checkpoint, semilla 12 y enlace al informe de entrenamiento con la sección específica del nivel 3-1. La receta ejecutada se conserva en `recipe.json` dentro del bundle, lo que permite reproducir el pipeline. No se mencionan innovaciones técnicas adicionales (por ejemplo, reward shaping, curriculum learning o decodificación especulativa); cualquier detalle de este tipo no está disponible.

## Capacidades

- Control de agente en Super Mario Bros. NES: ejecuta acciones para completar el nivel 3-1 desde el inicio canónico.
- Aprendizaje por refuerzo con PPO: política entrenada específicamente para este entorno, no transferible directamente a otros niveles o juegos.
- Reproducibilidad mediante GradLab: la receta y los metadatos del checkpoint están incluidos en el bundle.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión general, tool calling, function calling, capacidades de agente multi-paso fuera del entorno, ni capacidades multilingües.
- No dispone de modo thinking, visión, audio ni otras modalidades.

## Casos de uso

- Reproducción de experimentos de RL: usar la receta incluida (`recipe.json`) y el checkpoint para replicar el entrenamiento PPO del nivel 3-1 con la misma semilla y comparar curvas de aprendizaje.
- Benchmarking de algoritmos de RL: emplear el nivel 3-1 como tarea de referencia discreta para comparar PPO con otras familias (DQN, A2C, SAC discretizado) bajo el mismo entorno Gymnasium/retro.
- Investigación en reward shaping: analizar qué señales de recompensa permiten pasar de 5.769 despejes acumulados a una política que generalice a otros niveles, usando este checkpoint como línea base.
- Demostración educativa de RL aplicado a videojuegos: mostrar en cursos o talleres cómo una política entrenada desde cero completa un nivel de NES con una tasa declarada de 96/100 en los últimos 100 episodios de entrenamiento.
- Evaluación de robustez de políticas: medir la degradación de rendimiento al variar el estado inicial, la aleatoriedad del emulador o la latencia de acciones, usando el checkpoint como sujeto de prueba.
- Integración en pipelines de investigación con GradLab: automatizar ejecuciones de `gradlab play` sobre ROMs propias para generar trazas de episodios y analizar el comportamiento de la política.
- Estudio de limitaciones de evaluación: contrastar la métrica de entrenamiento (96/100) con una evaluación de aceptación independiente, que la model card declara no disponible, para discutir sesgos de evaluación en RL.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Despejes en los últimos 100 episodios de entrenamiento | 96 / 100 |
| Despejes acumulados en entrenamiento | 5.769 / 14.619 |
| Transiciones de entorno | 5.505.024 |
| Evaluación de aceptación independiente | no disponible |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. Las cifras anteriores provienen de una única ejecución con semilla 12 y no constituyen una evaluación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es 0.0 GB y no se detalla el tamaño de la red.
- GPU recomendadas: no disponibles; al ser una política de RL para un entorno NES, la inferencia podría ejecutarse en CPU, pero esto no está confirmado en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos sobre requisitos mínimos.
- Opciones de despliegue: GradLab (`gradlab play 'hf://tsilva/SuperMarioBros-Nes-v0_Level3-1' --rom-path /path/to/SuperMarioBros.nes`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles.
- Requisito adicional: se necesita una ROM propia de Super Mario Bros. NES compatible; la ROM no se distribuye con el modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Métrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tsilva/SuperMarioBros-Nes-v0_Level3-1 | Política PPO (GradLab) | SuperMarioBros-Nes-v0, nivel 3-1 | 96/100 en últimos 100 episodios de entrenamiento | no disponible | Hugging Face |
| Otras políticas de la colección GradLab SuperMarioBros-Nes-v0 | Políticas PPO (GradLab) | Otros niveles del mismo entorno | no disponible en esta ficha | no disponible | Colección de Hugging Face del autor |
| Políticas RL de referencia para Atari/retro (por ejemplo, implementaciones PPO públicas) | Políticas RL | Entornos Atari/retro | no disponible en esta ficha | varía según implementación | Repositorios públicos |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Alcance muy restringido: la política está entrenada exclusivamente para el nivel 3-1 de Super Mario Bros. NES desde el inicio canónico; no se documenta generalización a otros niveles, estados iniciales o variantes del entorno.
- Evaluación no independiente: la cifra 96/100 proviene de episodios de entrenamiento con semilla 12; la model card declara que la evaluación de aceptación independiente no está disponible, por lo que el rendimiento real fuera del entrenamiento es incierto.
- Dependencia de ROM externa: el uso requiere una ROM de Super Mario Bros. NES que el usuario debe aportar; esto introduce requisitos legales y de disponibilidad ajenos al modelo.
- Licencia no especificada: al no indicarse licencia, no se puede confirmar el uso comercial ni la redistribución; conviene tratar el artefacto como restringido hasta verificación.
- Sin idiomas ni modalidades de lenguaje: no es adecuado para tareas de NLP, visión general, agentes conversacionales o tool calling.
- Riesgo de sobreajuste al entorno de entrenamiento: no hay datos sobre robustez frente a cambios de emulador, aleatoriedad o latencia.
- Sesgos conocidos: no disponibles; al ser una política de control, los sesgos relevantes serían de comportamiento (por ejemplo, estrategias repetitivas), pero no se documentan.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos; el equivalente sería ejecutar acciones incoherentes fuera de distribución, sin datos disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level3-1
- Colección GradLab SuperMarioBros-Nes-v0: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
- Repositorio GradLab e instrucciones de instalación: https://github.com/tsilva/gradlab#install
- Informe de entrenamiento (sección Level 3-1): https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level3-1--2026-11-13
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-1314875913c13bf83c8bebf78d4ee17d/checkpoints/5505024-ed89c28b554142b24d6310da3d1e4d8570ba34a026ebfdef1f28c13cdb5c80a3/manifest.json
