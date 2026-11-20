# tsilva/SuperMarioBros-Nes-v0_Level5-4

## Resumen

SuperMarioBros-Nes-v0_Level5-4 es una política de aprendizaje por refuerzo entrenada con PPO (Proximal Policy Optimization) para completar el nivel 5-4 del juego Super Mario Bros. de NES. Lo desarrolla el usuario tsilva dentro del framework GradLab, una librería propia de entrenamiento de agentes. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un agente específico de tarea, entrenado desde cero para un único entorno de Gymnasium (`SuperMarioBros-Nes-v0`), y su único cometido es resolver ese nivel concreto.

El checkpoint publicado reporta una tasa de éxito de 95 sobre 100 episodios en las últimas 100 partidas de entrenamiento, con 4.274 despejes acumulados en 16.109 episodios y 4.120.576 transiciones de entorno. Estos resultados provienen de una única ejecución con semilla 12 y no han sido validados por una evaluación de aceptación independiente, según indica la propia model card.

Su relevancia es acotada: sirve como referencia reproducible de un pipeline de RL (entrenamiento, checkpoint y reproducción vía `gradlab play`) y como ejemplo de receta por nivel dentro de la colección de políticas de Mario del mismo autor. No es un modelo adecuado para tareas de NLP, visión general ni razonamiento simbólico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política de aprendizaje por refuerzo entrenada con PPO; arquitectura de red no especificada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (entorno de RL; no hay ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (pesos de la política), más `model.json` (metadatos del checkpoint) y `recipe.json` (receta ejecutada) |

## Arquitectura y entrenamiento

El modelo es una política entrenada desde cero con PPO en GradLab sobre el entorno `SuperMarioBros-Nes-v0`. La información proporcionada no detalla la topología de la red (número de capas, canales, función de activación ni tamaño de la representación de entrada), por lo que no es posible describir la arquitectura interna más allá del algoritmo de optimización empleado.

El entrenamiento se realizó en una única ejecución con semilla 12, con 4.120.576 transiciones de entorno y 16.109 episodios, de los cuales 4.274 terminaron en despeje del nivel. Cada episodio contabilizado parte del inicio canónico del nivel 5-4. El checkpoint publicado corresponde al identificador `checkpoint-4120576-8c347d1fe7357f32` de la ejecución `gradlab-054e7c52878b67c632a71cc39d687a4c`. No se documentan técnicas adicionales como recompensas moldeadas, currículo, imitación o búsqueda, ni se especifica el número de pasos de optimización ni el tamaño de lote.

## Capacidades

- Ejecución de una política de control en el entorno `SuperMarioBros-Nes-v0` para el nivel 5-4 desde el inicio canónico.
- Toma de decisiones paso a paso a partir de observaciones del entorno (píxeles o representación interna del entorno, no detallada).
- Reproducción determinista del comportamiento mediante la CLI de GradLab y una ROM compatible proporcionada por el usuario.
- No dispone de generación de texto, razonamiento en lenguaje natural, código, matemáticas, visión general, tool calling, capacidades de agente multi-paso fuera del entorno ni soporte multilingüe.

## Casos de uso

- Reproducción de resultados de RL: cargar el checkpoint con `gradlab play` y una ROM de Super Mario Bros. para verificar la tasa de despeje reportada en el nivel 5-4.
- Línea base para experimentos de RL: usar esta política como referencia al probar nuevos algoritmos, hiperparámetros o funciones de recompensa en el mismo nivel.
- Docencia y divulgación: demostrar un pipeline completo de entrenamiento PPO (entorno, receta, checkpoint y reproducción) en un entorno con dinámica no trivial.
- Evaluación de robustez: medir la degradación del rendimiento al alterar condiciones de inicio, ruido de observación o variaciones de la ROM.
- Investigación en transferencia: emplear la política como punto de partida o comparación para técnicas de generalización entre niveles de la colección del mismo autor.
- Auditoría de reproducibilidad: contrastar los metadatos (`model.json`, `recipe.json`, manifiesto del checkpoint) con una ejecución propia para validar la trazabilidad del entrenamiento.

## Benchmarks y rendimiento

| Metrica | Valor en el checkpoint publicado |
|---|---:|
| Despejes en los últimos 100 episodios de entrenamiento | 95 / 100 |
| Despejes acumulados en entrenamiento | 4.274 / 16.109 |
| Transiciones de entorno | 4.120.576 |
| Evaluación de aceptación independiente | no disponible |

No se han publicado resultados de benchmarks estándar (tipo MMLU, HumanEval o GSM8K) porque el modelo no es un modelo de lenguaje. Los únicos datos de rendimiento son los de la model card, procedentes de una única ejecución con semilla 12 y sin validación externa.

## Requisitos de hardware

- VRAM estimada: no disponible; la información no especifica el tamaño de la red ni el consumo de memoria del checkpoint.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable con los datos publicados; el tamaño del repositorio es de 0,0 GB, lo que sugiere un checkpoint muy pequeño, pero no se confirma.
- Despliegue: exclusivamente mediante GradLab (`gradlab play`), que requiere instalar la librería y disponer de una ROM de Super Mario Bros. NES compatible. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El rendimiento vendrá condicionado por el emulador de NES y el bucle de inferencia de GradLab.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Despejes reportados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tsilva/SuperMarioBros-Nes-v0_Level5-4 | SuperMarioBros-Nes-v0, nivel 5-4 | PPO | 95/100 en los últimos 100 episodios de entrenamiento | no disponible | Hugging Face |
| Otras políticas de la colección GradLab SuperMarioBros-Nes-v0 del mismo autor | distintos niveles de Super Mario Bros. NES | PPO | no disponible en la información proporcionada | no disponible | colección de Hugging Face |
| Políticas de referencia de la literatura de RL sobre Mario (por ejemplo, basadas en A3C o PPO con recompensas moldeadas) | Super Mario Bros. NES | A3C, PPO u otros | no disponible | variable según implementación | repositorios públicos |

No se dispone de datos comparativos homogéneos (mismo protocolo de evaluación, misma ROM y mismo punto de inicio) frente a otras políticas, por lo que la comparación cuantitativa rigurosa no es posible con la información disponible.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para el nivel 5-4 desde el inicio canónico; no se espera que generalice a otros niveles, a inicios alternativos ni a variantes del juego.
- Resultados no auditados: la tasa de 95/100 procede de los últimos 100 episodios de entrenamiento de una sola ejecución (semilla 12) y la model card indica explícitamente que no hay evaluación de aceptación independiente; puede existir sobreajuste al protocolo de entrenamiento.
- Dependencia de la ROM: el uso requiere una ROM de Super Mario Bros. NES que el usuario debe aportar; la distribución de la ROM no está incluida y su legalidad depende de la jurisdicción.
- Licencia no disponible: no se declara licencia, lo que impide determinar si el uso comercial está permitido; en la práctica, tratar el modelo como no licenciado para producción.
- Sin información sobre sesgos, alucinación o idioma: al no ser un modelo de lenguaje, estas categorías no aplican, pero tampoco se documentan sesgos de política (por ejemplo, comportamientos explotadores de la recompensa) ni análisis de robustez.
- Trazabilidad parcial: se enlazan manifiesto del checkpoint y receta, pero no se detalla la arquitectura de red ni los hiperparámetros de PPO en la información disponible.
- Riesgo de reproducibilidad: la réplica exacta depende de la versión de GradLab, del emulador y de la ROM empleada, factores que pueden alterar el comportamiento observado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level5-4
- Colección GradLab SuperMarioBros-Nes-v0: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
- Repositorio GradLab (instalación): https://github.com/tsilva/gradlab#install
- Informe de entrenamiento (nivel 5-4): https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level5-4--2026-11-16
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-054e7c52878b67c632a71cc39d687a4c/checkpoints/4120576-8c347d1fe7357f325df882dd78b637856e47ffcf121dede63585ce3198acf14e/manifest.json
