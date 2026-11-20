# tsilva/SuperMarioBros-Nes-v0_Level5-2

## Resumen

`tsilva/SuperMarioBros-Nes-v0_Level5-2` es una política de aprendizaje por refuerzo entrenada desde cero con PPO (Proximal Policy Optimization) mediante el framework GradLab. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un agente especializado en completar un único nivel del juego Super Mario Bros. de NES, concretamente el nivel 5-2, partiendo siempre del inicio canónico del nivel.

El modelo lo publica el usuario `tsilva` en Hugging Face y está vinculado al repositorio de GitHub `gradlab`, que actúa como librería de entrenamiento e inferencia. Su relevancia es acotada pero clara para la comunidad de RL aplicado a videojuegos: demuestra un pipeline reproducible de entrenamiento PPO con recuento de episodios resueltos, metadatos de checkpoint y una receta ejecutada registrada, lo que facilita la auditoría del resultado.

El checkpoint publicado resuelve el nivel en 95 de los últimos 100 episodios de entrenamiento, acumulando 3.663 despejes sobre 16.895 episodios totales y 5.005.312 transiciones de entorno. No hay arquitectura de red neuronal detallada en la información disponible, ni evaluación independiente de aceptación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política PPO entrenada con GradLab; topología de red no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; observación del entorno, no contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (política), `model.json` (metadatos de checkpoint), `recipe.json` (receta ejecutada) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red neuronal de la política. Lo que sí se documenta es el procedimiento de entrenamiento: PPO entrenado desde cero con el framework GradLab sobre el entorno `SuperMarioBros-Nes-v0`, con una semilla fija (`12`) y episodios que comienzan siempre en el inicio canónico del nivel 5-2. El run identificado es `gradlab-117d89d33ef2315e87dc5b4c33c83f1b` y el checkpoint `checkpoint-5005312-18d56433bf5222a6`.

El entrenamiento acumuló 5.005.312 transiciones de entorno y 16.895 episodios, de los cuales 3.663 terminaron con el nivel completado. La métrica de calidad publicada es el recuento de despejes en los últimos 100 episodios de entrenamiento (95/100). No se documentan innovaciones técnicas adicionales (reward shaping, currículos, decodificación especulativa ni mecanismos de atención), ni la composición del dataset de entrenamiento más allá de la interacción con el propio entorno.

## Capacidades

- Control de política para Super Mario Bros. NES, nivel 5-2, desde el inicio canónico del nivel.
- Toma de decisiones paso a paso a partir de observaciones del entorno (no genera texto ni imágenes).
- Generalización limitada al nivel y configuración entrenados; no se documenta transferencia a otros niveles.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en el sentido de agentes LLM; es un agente de RL de un solo entorno.
- No tiene capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales.
- Reproducibilidad mediante la receta ejecutada (`recipe.json`) y los metadatos del checkpoint.

## Casos de uso

- Reproducción de experimentos de RL: sirve como referencia para validar el pipeline de GradLab y comparar recetas de entrenamiento PPO sobre el mismo entorno. La receta ejecutada y el manifiesto del checkpoint permiten reconstruir el run.
- Investigación en PPO aplicado a videojuegos: punto de partida para estudiar la estabilidad del entrenamiento y la tasa de éxito por nivel, con métricas de despeje en ventanas de 100 episodios.
- Benchmark interno de entornos NES: útil como línea base de dificultad para el nivel 5-2 frente a otras políticas entrenadas con el mismo framework.
- Demostración de agentes de RL en emuladores: permite ilustrar el ciclo observación-acción en un juego clásico con una ROM propia, sin depender de modelos generativos.
- Docencia y divulgación: ejemplo concreto de agente entrenado desde cero, con cifras auditables de episodios y transiciones, adecuado para explicar PPO en clase.
- Pruebas de infraestructura de inferencia RL: el comando `gradlab play` permite verificar la integración de checkpoints remotos de Hugging Face con un emulador local.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Despejes en los últimos 100 episodios de entrenamiento | 95 / 100 |
| Despejes acumulados en entrenamiento | 3.663 / 16.895 |
| Transiciones de entorno | 5.005.312 |
| Evaluación independiente de aceptación | No disponible |

Los recuentos provienen de un único run con semilla `12`, con episodios iniciados en el punto canónico del nivel 5-2. No se han publicado comparaciones con otras políticas ni resultados en benchmarks estándar de RL en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repositorio es de 0,0 GB y no se especifica la topología de la política).
- GPU recomendadas: no disponible; al tratarse de una política de RL para un emulador NES, es probable que la inferencia sea ligera, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: GradLab mediante `gradlab play 'hf://tsilva/SuperMarioBros-Nes-v0_Level5-2' --rom-path /path/to/SuperMarioBros.nes`.
- Latencia y throughput estimados: no disponibles.
- Requisito adicional: es necesario aportar una ROM de Super Mario Bros. NES compatible; no se distribuye con el modelo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas comparables del mismo autor o del mismo entorno con métricas publicadas que permitan una comparación rigurosa de parámetros, contexto o rendimiento. Existe una colección del autor (`gradlab-supermariobros-nes-v0`) que podría contener políticas por nivel, pero no se aportan sus datos.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para el nivel 5-2 desde el inicio canónico; no se documenta comportamiento en otros niveles ni desde estados intermedios.
- Sin evaluación independiente: el 95/100 procede de episodios de entrenamiento, no de una evaluación de aceptación separada, por lo que puede reflejar sobreajuste al run.
- Un solo run y una sola semilla (`12`): no hay evidencia de robustez estadística entre semillas.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; conviene contactar con el autor antes de usarlo en producción.
- Dependencia de una ROM propietaria: el usuario debe aportar su propia ROM de Super Mario Bros. NES, con las implicaciones legales que ello conlleva.
- Sesgos y alucinación: no aplica en el sentido de modelos de lenguaje; el riesgo equivalente es la fragilidad ante variaciones del entorno o del emulador.
- Sin información sobre la arquitectura de red ni el número de parámetros, lo que dificulta estimar costes de despliegue y comparar con alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level5-2
- Repositorio GradLab: https://github.com/tsilva/gradlab
- Instrucciones de instalación de GradLab: https://github.com/tsilva/gradlab#install
- Informe de entrenamiento (nivel 5-2): https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level5-2--2026-11-16
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-117d89d33ef2315e87dc5b4c33c83f1b/checkpoints/5005312-18d56433bf5222a6c8d30a4ae9cf162a2a85da5fc6bad001d01de83a69c1db50/manifest.json
- Colección Mario de GradLab: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
