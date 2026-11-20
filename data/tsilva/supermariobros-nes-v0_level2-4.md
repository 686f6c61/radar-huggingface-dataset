# tsilva/SuperMarioBros-Nes-v0_Level2-4

## Resumen

SuperMarioBros-Nes-v0_Level2-4 es una política de aprendizaje por refuerzo entrenada desde cero para superar el nivel 2-4 del entorno `SuperMarioBros-Nes-v0` (Super Mario Bros. de NES) partiendo del inicio canónico del nivel. No es un modelo de lenguaje: es un agente de control cuyo objetivo es completar una tarea concreta dentro de un emulador, y su salida es una secuencia de acciones de mando (botones de la NES) en función del estado visual del juego.

El modelo lo publica el usuario `tsilva` bajo el framework propio GradLab, con un pipeline declarado de `reinforcement-learning` y las etiquetas `ppo`, `gradlab` y `SuperMarioBros-Nes-v0`. El entrenamiento combina PPO (Proximal Policy Optimization) con SIL (Self-Imitation Learning), y se distribuye como un bundle que incluye los pesos de la política (`model.zip`), los metadatos del checkpoint (`model.json`) y la receta ejecutada (`recipe.json`).

Su relevancia es acotada y muy específica: sirve como referencia reproducible de un agente que resuelve un nivel concreto de un juego clásico, con métricas de éxito declaradas por el autor (95 de 100 episodios en la ventana de entrenamiento más reciente) y un recuento acumulado de 5.181 despejes en 36.353 episodios. No hay validación independiente publicada ni datos de arquitectura de red, tamaño de parámetros o contexto, por lo que debe tratarse como un artefacto de investigación reproducible más que como un componente de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL entrenada con PPO + SIL; no se detalla la red) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones del entorno) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica; agente de control de videojuego) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (pesos de la política), `model.json` (metadatos del checkpoint), `recipe.json` (receta ejecutada) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura de la red neuronal de la política: no se indica si es una CNN sobre fotogramas, una MLP sobre características preprocesadas ni el número de capas o unidades. Lo que sí se documenta es el algoritmo de entrenamiento: PPO combinado con SIL (Self-Imitation Learning), implementado en el framework GradLab. El agente se entrena desde cero, sin inicialización a partir de pesos preexistentes, y cada episodio contabilizado comienza en el punto de inicio canónico del nivel 2-4.

El volumen de entrenamiento declarado es de 15.142.912 transiciones con el entorno, en una única ejecución con semilla `2801`. El run identificado como `gradlab-2c62561b9b478b9bd3600b822a42675c` produjo el checkpoint `checkpoint-15142912-a095703629b52c63`. No se especifican detalles sobre composición del dataset (al provenir de interacción con el emulador, no hay dataset estático), recompensas intermedias, currículo de niveles ni hiperparámetros del algoritmo más allá de lo citado.

## Capacidades

- Control de un agente en el entorno `SuperMarioBros-Nes-v0`, concretamente para el nivel 2-4 del juego Super Mario Bros. de NES.
- Ejecución de políticas de acción sobre el mando de la consola a partir del estado del emulador.
- Despeje del nivel desde el inicio canónico con una tasa declarada de 95/100 en los últimos 100 episodios de entrenamiento.
- Reproducibilidad mediante bundle que incluye pesos, metadatos del checkpoint y receta de entrenamiento.
- Ejecución mediante el comando `gradlab play` con una ROM propia del juego.
- No soporta tool calling, function calling, razonamiento multi-paso genérico, capacidades multilingües, visión general, audio ni modos de pensamiento: es un agente especializado en una única tarea.

## Casos de uso

- Investigación en aprendizaje por refuerzo: reproducir el entrenamiento y la evaluación de un agente PPO + SIL sobre un entorno de referencia, usando la receta y los metadatos incluidos en el bundle para comparar curvas de aprendizaje.
- Benchmark de algoritmos de RL: emplear la tasa de despeje declarada (95/100) como línea base frente a nuevas variantes de PPO, SIL u otros métodos sobre el mismo nivel.
- Estudio de Self-Imitation Learning: analizar cómo la combinación de PPO con SIL afecta a la estabilidad y al éxito en un entorno con recompensa dispersa como es completar un nivel de Mario.
- Demostración y divulgación: ejecutar el agente con `gradlab play` para mostrar visualmente una política entrenada resolviendo un nivel clásico, útil en materiales docentes o charlas técnicas.
- Pruebas de infraestructura de entrenamiento: usar el run y el checkpoint publicados como caso de prueba para validar pipelines de registro de experimentos, versionado de checkpoints y artefactos en GradLab.
- Comparación de recetas por nivel: la colección de modelos de Mario del mismo autor permite contrastar recetas de entrenamiento entre niveles y evaluar su transferibilidad, aunque el modelo aquí descrito está especializado en el nivel 2-4.

## Benchmarks y rendimiento

| Métrica | Valor en el checkpoint publicado |
|---|---:|
| Despejes en los últimos 100 episodios de entrenamiento | 95 / 100 |
| Despejes acumulados en entrenamiento | 5.181 / 36.353 |
| Transiciones con el entorno | 15.142.912 |
| Evaluación de aceptación independiente | no disponible |

No se han publicado resultados de benchmarks en la información disponible más allá de las métricas de entrenamiento del propio autor. No hay comparación con otros agentes, ni evaluación en entornos distintos al nivel 2-4, ni métricas de generalización.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al no publicarse el tamaño ni la arquitectura de la red, no puede estimarse. Por el tipo de tarea (control sobre emulador NES) es previsible que sea muy inferior a la de un modelo de lenguaje, pero no hay dato confirmado.
- GPU recomendadas: no disponible. No se especifican requisitos de GPU para inferencia ni para entrenamiento.
- Viabilidad en GPU de consumo: no disponible; sin datos de arquitectura no puede confirmarse, aunque el entorno y el tipo de política sugieren que sería viable en hardware modesto.
- Opciones de despliegue: el método documentado es el comando `gradlab play 'hf://tsilva/SuperMarioBros-Nes-v0_Level2-4' --rom-path /path/to/SuperMarioBros.nes`, que requiere instalar GradLab y disponer de una ROM de Super Mario Bros. NES compatible. No se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno / tarea | Métrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tsilva/SuperMarioBros-Nes-v0_Level2-4 | Política RL (PPO + SIL) | Nivel 2-4 de Super Mario Bros. NES | 95/100 despejes en los últimos 100 episodios de entrenamiento | no disponible | Hugging Face, framework GradLab |
| Otros modelos de la colección `gradlab-supermariobros-nes-v0` de tsilva | Políticas RL (GradLab) | Otros niveles del mismo entorno | no disponible en esta ficha | no disponible | Hugging Face |
| Agentes RL genéricos sobre Super Mario Bros. (literatura académica) | Políticas RL | Entornos SMB diversos | no disponible | variable | variable |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas concretas: no hay benchmarks comunes ni evaluaciones independientes. La comparación más directa posible es con los demás modelos de la colección del mismo autor, pero sus métricas no se han proporcionado en la información disponible.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para el nivel 2-4 desde el inicio canónico; no hay evidencia de que funcione en otros niveles, en posiciones intermedias distintas del inicio o en variantes del juego.
- Ausencia de evaluación independiente: el propio autor indica que la evaluación de aceptación independiente no está disponible; las cifras de 95/100 y 5.181/36.353 provienen de una única ejecución con semilla `2801` y no han sido replicadas externamente.
- Licencia no especificada: no se declara licencia, lo que impide determinar si el uso comercial está permitido; debe tratarse como no apto para producción hasta aclararlo.
- Dependencia de una ROM propietaria: la ejecución requiere que el usuario aporte su propia ROM de Super Mario Bros. NES, cuyo uso está sujeto a la legalidad de la copia en cada jurisdicción.
- Arquitectura y tamaño no documentados: sin información sobre la red, no pueden evaluarse riesgos de sobreajuste, robustez ni coste computacional con rigor.
- Riesgo de sobreajuste al entorno de entrenamiento: al entrenarse desde cero sobre un único nivel y una única semilla, la política podría explotar particularidades del emulador o de la configuración concreta.
- No aplica a tareas de lenguaje, visión general, tool calling ni agentes multi-paso fuera del juego; no debe presentarse como un modelo de propósito general.
- Sin datos de sesgos, alucinación o comportamiento fuera de distribución más allá de lo anterior; cualquier uso en producción requeriría una evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level2-4
- Repositorio GradLab: https://github.com/tsilva/gradlab
- Instrucciones de instalación de GradLab: https://github.com/tsilva/gradlab#install
- Informe de entrenamiento (receta por niveles): https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level2-4--2026-11-15
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-2c62561b9b478b9bd3600b822a42675c/checkpoints/15142912-a095703629b52c634b3339a8df5f347965c5c0e91b9be4b2fe3cce4554cb8ba4/manifest.json
- Colección de modelos Mario de tsilva: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
