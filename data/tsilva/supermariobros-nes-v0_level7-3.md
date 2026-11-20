# tsilva/SuperMarioBros-Nes-v0_Level7-3

## Resumen

SuperMarioBros-Nes-v0_Level7-3 es una política de aprendizaje por refuerzo entrenada desde cero para superar el nivel 7-3 del entorno `SuperMarioBros-Nes-v0`, una tarea de control desde píxeles sobre la ROM de Super Mario Bros. de NES. El modelo lo publica el usuario `tsilva` bajo el ecosistema GradLab, una librería propia de experimentación en RL, y se distribuye como un artefacto de política (`model.zip`) junto con metadatos de checkpoint y la receta de entrenamiento ejecutada.

No se trata de un modelo de lenguaje: es un agente de RL con observaciones visuales del juego y acciones discretas del mando de NES. Su relevancia es acotada y experimental: sirve como referencia reproducible de un pipeline PPO + SIL (self-imitation learning) aplicado a un nivel concreto y difícil del juego, con métricas de éxito declaradas por el autor (97 de 100 episodios en la ventana final de entrenamiento).

La información pública es muy limitada: el repositorio pesa 0.0 GB, no declara licencia, idiomas ni arquitectura de red, y no se ha publicado una evaluación de aceptación independiente. Cualquier uso en producción requeriría reproducir el entorno, disponer de la ROM legalmente y validar la política por cuenta propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL; red neuronal no especificada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; observaciones por frame del entorno) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; agente sobre entorno NES) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (bundle de GradLab) con `model.json` y `recipe.json` |
| Entorno | `SuperMarioBros-Nes-v0`, nivel 7-3, arranque canónico |
| Algoritmo | PPO + SIL (self-imitation learning) |
| Semilla de entrenamiento | 1801 |
| Transiciones de entorno | 7.507.968 |
| Checkpoint | `checkpoint-7507968-671e37782a474b52` |
| Run ID | `gradlab-89611ca738ec99edc83c2d246c4b74fe` |
| Librería | gradlab |
| Pipeline | reinforcement-learning |

## Arquitectura y entrenamiento

La model card no describe la topología de la red neuronal (número de capas, canales, tamaño de la representación latente ni función de valor). Lo que sí se documenta es el procedimiento: entrenamiento desde cero con PPO combinado con SIL, sobre el entorno `SuperMarioBros-Nes-v0` con arranque canónico en el nivel 7-3. El agente consume observaciones del entorno (previsiblemente frames del juego, aunque el preprocesado no se detalla) y emite acciones discretas del mando de NES.

El entrenamiento se ejecutó en una única semilla (`1801`) y acumuló 7.507.968 transiciones de entorno, lo que produjo 6.762 superaciones del nivel sobre 22.296 episodios acumulados. El checkpoint publicado corresponde al paso 7.507.968. La receta ejecutada se distribuye como `recipe.json`, lo que permite reproducir la configuración si se dispone de GradLab y de una ROM compatible. No se han publicado detalles sobre función de recompensa, recortes, aumentos de observación ni hiperparámetros de PPO/SIL más allá de lo que contenga esa receta.

## Capacidades

- Control desde píxeles sobre el nivel 7-3 de Super Mario Bros. (NES) desde el arranque canónico.
- Política de acciones discretas del mando de NES (movimiento y salto) orientada a completar el nivel.
- Aprendizaje por refuerzo con PPO + SIL, lo que implica que la política ha sido optimizada para maximizar la recompensa del entorno, no para imitar demostraciones humanas.
- Reproducibilidad parcial: se publican run ID, checkpoint, semilla y receta, lo que permite reejecutar el pipeline en GradLab.
- No soporta tool calling, function calling, agentes multi-paso genéricos, razonamiento simbólico, matemáticas, código, visión general, audio ni capacidades multilingües: es un agente específico de un único entorno.
- No dispone de modo "thinking", ni de API de chat, ni de integración con frameworks de inferencia de LLM.

## Casos de uso

- Reproducción de experimentos de RL: sirve como referencia para validar una instalación de GradLab y comparar curvas de entrenamiento con la receta publicada, usando el run ID y el checkpoint como punto de partida.
- Estudio de PPO + SIL en tareas de control desde píxeles: el nivel 7-3 es un escenario con obstáculos y timing exigente, útil para analizar cómo la componente de self-imitation afecta a la estabilidad del entrenamiento.
- Benchmark interno de recetas de RL: al existir una métrica declarada (97/100 en la ventana final), se puede usar como objetivo de comparación para nuevas recetas o variantes de hiperparámetros.
- Docencia y divulgación: un agente que completa un nivel concreto de NES es un ejemplo didáctico y visual de aprendizaje por refuerzo profundo, con artefactos descargables y comando de reproducción.
- Investigación en currículos y transferencia: el checkpoint puede servir como inicialización o como política de referencia al estudiar transferencia entre niveles o ajuste fino con menos transiciones.
- Pruebas de infraestructura de entrenamiento: 7,5 millones de transiciones y un entorno NES son una carga manejable para validar pipelines de RL, gestión de checkpoints y logging en clústeres pequeños.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Episodios superados en los últimos 100 de entrenamiento | 97 / 100 |
| Superaciones acumuladas en entrenamiento | 6.762 / 22.296 |
| Transiciones de entorno | 7.507.968 |
| Evaluación de aceptación independiente | no disponible |

No se han publicado resultados de benchmarks en la información disponible más allá de las métricas de entrenamiento anteriores. No hay comparación con otras políticas sobre el mismo nivel ni con líneas base de la literatura (por ejemplo, agentes PPO estándar o DQN) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es 0.0 GB y no se especifica la arquitectura; por el tipo de tarea (control desde píxeles de NES) es esperable que la política sea pequeña, pero no hay datos publicados para confirmarlo.
- GPU recomendadas: no disponibles. Para ejecutar la política basta con el runtime de GradLab y una GPU compatible con el framework subyacente; no se especifica CUDA, ROCm ni versión de PyTorch.
- ¿Cabe en GPU de consumo? No disponible. Dado el tamaño del bundle (0.0 GB) es plausible que quepa en GPUs de consumo e incluso en CPU, pero esto no está confirmado por el autor.
- Opciones de despliegue: `gradlab play 'hf://tsilva/SuperMarioBros-Nes-v0_Level7-3' --rom-path /path/to/SuperMarioBros.nes`. No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de artefacto).
- Latencia y throughput: no disponibles.
- Requisito adicional imprescindible: una ROM de Super Mario Bros. (NES) legal y compatible, que el usuario debe aportar; no se distribuye con el modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Algoritmo | Métrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tsilva/SuperMarioBros-Nes-v0_Level7-3 | Política RL | SuperMarioBros-Nes-v0, nivel 7-3 | PPO + SIL | 97/100 en últimos 100 episodios de entrenamiento | no disponible | Hugging Face |
| Otras políticas de la colección GradLab SMB | Política RL | SuperMarioBros-Nes-v0 (otros niveles) | PPO + SIL | no disponible en esta ficha | no disponible | Colección de Hugging Face del autor |
| Agentes de la literatura sobre Super Mario Bros. (p. ej. basados en DQN/A3C) | Política RL | Varios niveles de SMB | no disponible en esta ficha | no disponible | no disponible | Publicaciones académicas |

No se dispone de datos suficientes para una comparación cuantitativa con alternativas de la misma categoría. La comparación más directa es con el resto de políticas de la colección GradLab del mismo autor, pero sus métricas no se han incluido en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para el nivel 7-3 desde el arranque canónico; no se ha validado su comportamiento en otros niveles, en arranques distintos ni con modificaciones del entorno.
- Una sola semilla: los resultados provienen de un único entrenamiento con semilla `1801`, por lo que no hay estimación de varianza entre ejecuciones.
- Evaluación independiente no disponible: las métricas de éxito son de entrenamiento, no de una evaluación de aceptación separada, lo que puede sobreestimar el rendimiento real.
- Licencia no declarada: no se especifican términos de uso comercial, redistribución ni modificación; en ausencia de licencia, debe asumirse uso restringido hasta aclaración con el autor.
- Dependencia de la ROM: el modelo no incluye la ROM de Super Mario Bros.; el usuario debe aportar una copia legal. Esto condiciona la reproducibilidad y el despliegue.
- Dependencia de GradLab: el artefacto está empaquetado como bundle de GradLab (`model.zip`, `model.json`, `recipe.json`); no se documenta compatibilidad con otros frameworks de RL.
- Sin información sobre sesgos: no se han publicado análisis de sesgos, robustez ante perturbaciones visuales ni comportamiento ante estados fuera de distribución.
- Riesgo de sobreajuste al entorno: al tratarse de un único nivel con arranque fijo, la política puede explotar patrones específicos del escenario sin generalizar.
- Sin garantías de producción: no hay SLA, ni documentación de latencia, ni pruebas de estrés publicadas; no es un componente adecuado para sistemas en producción sin validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level7-3
- Informe de entrenamiento (nivel 7-3): https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level7-3--2026-11-18
- Instalación de GradLab: https://github.com/tsilva/gradlab#install
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-89611ca738ec99edc83c2d246c4b74fe/checkpoints/7507968-671e37782a474b523a18571175fff2af3d2d20946ed4044037e44c551fa79373/manifest.json
- Colección GradLab SuperMarioBros-Nes-v0: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
