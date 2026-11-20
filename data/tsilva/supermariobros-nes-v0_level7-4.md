# tsilva/SuperMarioBros-Nes-v0_Level7-4

## Resumen

SuperMarioBros-Nes-v0_Level7-4 es una política de aprendizaje por refuerzo entrenada desde cero para completar el nivel 7-4 de Super Mario Bros. de NES. No es un modelo de lenguaje: es un agente que recibe observaciones del entorno (el estado del emulador y la pantalla del juego) y emite acciones de control del mando. Lo desarrolla el usuario de Hugging Face tsilva dentro de su proyecto GradLab, una librería de entrenamiento de agentes con algoritmos PPO y SIL (self-imitation learning).

El modelo se publica como un artefacto de un único entrenamiento (semilla 1801) y su interés es acotado: sirve como referencia reproducible de cómo una receta concreta de GradLab resuelve un nivel especialmente difícil de Super Mario Bros. El autor reporta 95 aciertos en las últimas 100 episodios de entrenamiento y 3.466 aciertos acumulados sobre 23.482 episodios, tras 12.615.680 transiciones de entorno.

La relevancia es, por tanto, la de un checkpoint de investigación en RL para videojuegos, no la de un modelo de propósito general. No hay información sobre arquitectura de red, número de parámetros, contexto, idiomas ni licencia, y el repositorio ocupa 0.0 GB según los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL entrenada con PPO + SIL en GradLab) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; agente sobre entorno NES) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (pesos de la política), `model.json` (metadatos del checkpoint), `recipe.json` (receta ejecutada) |

## Arquitectura y entrenamiento

La model card indica que la política se entrenó desde cero con PPO + SIL (proximal policy optimization combinado con self-imitation learning) usando la librería GradLab. No se especifica el tipo de red neuronal, el número de capas, el tamaño de las observaciones ni la función de recompensa. El entorno es `SuperMarioBros-Nes-v0`, presumiblemente a través de un wrapper de Gym/Gymnasium sobre un emulador de NES, y cada episodio contabilizado arranca en el inicio canónico del nivel 7-4.

El entrenamiento acumuló 12.615.680 transiciones de entorno en una única ejecución con semilla 1801, identificada como `gradlab-db1d2f77ea9334122af8481e7cee219b`, que produjo el checkpoint `checkpoint-12615680-f177a7dde7904311`. El autor reporta 95 aciertos en los últimos 100 episodios de entrenamiento y 3.466 aciertos acumulados sobre 23.482 episodios. No hay evaluación de aceptación independiente, ni detalles sobre hiperparámetros, arquitectura o currículo de entrenamiento más allá de lo que contiene `recipe.json`.

## Capacidades

- Control de un agente sobre el entorno `SuperMarioBros-Nes-v0`: recibe observaciones del emulador y emite acciones del mando de NES.
- Resolución del nivel 7-4 desde el inicio canónico, con una tasa reportada de 95/100 en los últimos episodios de entrenamiento.
- Ejecución mediante el comando `gradlab play` de la librería GradLab, indicando la ruta a una ROM de Super Mario Bros. de NES.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM.
- No tiene capacidades multilingües, de visión general, audio ni modo de razonamiento explícito.
- No se documentan habilidades de generalización a otros niveles, a otras ROMs o a variantes del entorno.

## Casos de uso

- Reproducción de experimentos de RL: el bundle incluye `recipe.json` y `model.json`, lo que permite reejecutar la receta de GradLab y comparar curvas de aprendizaje con la semilla 1801.
- Referencia de línea base para el nivel 7-4: sirve para medir si una nueva política o un nuevo algoritmo supera el 95/100 reportado en las últimas 100 episodios.
- Estudio de PPO + SIL en entornos de control discreto: el checkpoint permite analizar el comportamiento aprendido y la contribución de self-imitation learning frente a PPO puro.
- Docencia y demostraciones de RL en videojuegos: el comando `gradlab play` con una ROM propia permite visualizar la política en acción sin reentrenar.
- Investigación en currículos por niveles: la colección `gradlab-supermariobros-nes-v0` agrupa políticas por nivel, lo que facilita comparar recetas entre niveles de dificultad distinta.
- Análisis de robustez y estabilidad: al ser un único run, es útil para estudiar la varianza entre semillas si se reentrena con otras semillas y se compara con este checkpoint.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Aciertos en los últimos 100 episodios de entrenamiento | 95 / 100 |
| Aciertos acumulados en entrenamiento | 3.466 / 23.482 |
| Transiciones de entorno | 12.615.680 |
| Evaluación de aceptación independiente | no disponible |

No se han publicado resultados de benchmarks en la información disponible más allá de las métricas de entrenamiento anteriores. No hay comparación con otros agentes en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y no se detalla el tamaño de la política.
- GPU recomendadas: no disponible. Al tratarse de una política de RL para NES, es plausible que quepa en CPU, pero no hay datos que lo confirmen.
- ¿Cabe en GPU de consumo? No disponible.
- Opciones de despliegue: `gradlab play 'hf://tsilva/SuperMarioBros-Nes-v0_Level7-4' --rom-path /path/to/SuperMarioBros.nes`, previa instalación de GradLab y con una ROM de Super Mario Bros. de NES propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Aciertos reportados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tsilva/SuperMarioBros-Nes-v0_Level7-4 | SuperMarioBros-Nes-v0, nivel 7-4 | PPO + SIL (GradLab) | 95/100 en últimos 100 episodios de entrenamiento | no disponible | Hugging Face |
| Otras políticas de la colección `gradlab-supermariobros-nes-v0` | Mismo entorno, otros niveles | PPO + SIL (GradLab) | no disponible en esta ficha | no disponible | Hugging Face (colección del autor) |
| Alternativas de terceros para Super Mario Bros. | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con agentes de RL de referencia (por ejemplo, implementaciones de PPO o DQN sobre NES) de forma rigurosa.

## Limitaciones y advertencias

- Es un agente específico para un nivel y un entorno concretos; no se documenta generalización a otros niveles, a otras ROMs o a variantes del juego.
- Requiere una ROM de Super Mario Bros. de NES que el usuario debe aportar; la ROM no se distribuye con el modelo y su uso está sujeto a la legalidad aplicable en cada jurisdicción.
- No hay evaluación de aceptación independiente: las cifras de 95/100 y 3.466/23.482 provienen de un único run de entrenamiento con semilla 1801 y podrían no reproducirse con otras semillas.
- La licencia no está disponible, por lo que no se puede confirmar el uso comercial ni la redistribución de los pesos.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no es un modelo de lenguaje; esas categorías no aplican.
- El repositorio figura con 0.0 GB y 0 descargas, lo que sugiere un artefacto de investigación sin validación por parte de la comunidad.
- La fecha de creación indicada en los metadatos (2026-11-20) es posterior a la fecha actual y debe tratarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level7-4
- Repositorio GradLab: https://github.com/tsilva/gradlab
- Instrucciones de instalación de GradLab: https://github.com/tsilva/gradlab#install
- Informe de entrenamiento (nivel 7-4): https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level7-4--2026-11-19
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-db1d2f77ea9334122af8481e7cee219b/checkpoints/12615680-f177a7dde7904311f09b044fe980857752ef1655d95f5762f7f4828b2800e6fe/manifest.json
- Colección de modelos Mario de GradLab: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
