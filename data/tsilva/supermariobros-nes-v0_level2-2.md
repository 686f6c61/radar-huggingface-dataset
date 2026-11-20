# tsilva/SuperMarioBros-Nes-v0_Level2-2

## Resumen

`tsilva/SuperMarioBros-Nes-v0_Level2-2` es una política de aprendizaje por refuerzo entrenada desde cero para superar el nivel 2-2 del entorno `SuperMarioBros-Nes-v0`. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un agente especializado que recibe el estado del emulador de NES y emite acciones de control del personaje. Lo publica el usuario tsilva dentro del proyecto GradLab, una herramienta de entrenamiento RL que expone recetas reproducibles y checkpoints.

El interés del artefacto es acotado pero concreto: sirve como referencia reproducible de una receta PPO + SIL (self-imitation learning) que alcanza una tasa de éxito alta en un nivel específico, con métricas de entrenamiento trazables y un manifiesto de checkpoint enlazado. La model card reporta 84 limpiezas en las últimas 100 episodios de entrenamiento y 4.275 limpiezas acumuladas sobre 11.853 episodios, tras 7.155.712 transiciones de entorno.

La información pública es muy limitada: el repositorio pesa 0.0 GB, no declara licencia, no declara idiomas y no incluye evaluación independiente. La ficha refleja por tanto únicamente lo que el autor documenta, marcando como "no disponible" todo lo que no aparece en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política RL; el autor no detalla la red) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (política) + `model.json` (metadatos) + `recipe.json` (receta ejecutada) |
| Entorno | `SuperMarioBros-Nes-v0`, nivel 2-2, inicio canónico |
| Algoritmo | PPO + SIL (self-imitation learning) |
| Framework | GradLab (`library_name: gradlab`) |
| Semilla de entrenamiento | 1801 |
| Transiciones de entorno | 7.155.712 |
| Checkpoint | `checkpoint-7155712-aba3cc4688a4fd9a` |
| ID de ejecución | `gradlab-13618bff8573053e27fc095d41c4ce13` |
| Tamaño del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El autor no documenta la topología de la red neuronal de la política: no se indica si es una CNN sobre frames del emulador, un MLP sobre features del entorno o una combinación. Lo que sí se especifica es el procedimiento de entrenamiento: PPO combinado con SIL, ejecutado en GradLab, con una receta concreta (`recipe.json`) incluida en el bundle y un informe de entrenamiento enlazado en el repositorio de GitHub del proyecto.

El entrenamiento se realizó desde cero, con una única semilla (`1801`), sobre el nivel 2-2 de `SuperMarioBros-Nes-v0` comenzando en el inicio canónico del nivel. Se acumularon 7.155.712 transiciones de entorno y 11.853 episodios contados, de los cuales 4.275 terminaron en limpieza del nivel. En el checkpoint publicado, las últimas 100 episodios de entrenamiento registran 84 limpiezas. No se documenta composición de datos (no aplica), ni fases de RLHF/DPO, ni innovaciones de decodificación o atención.

## Capacidades

- Control de política para el nivel 2-2 de `SuperMarioBros-Nes-v0` desde el inicio canónico del nivel.
- Toma de decisiones secuenciales a partir del estado del emulador y emisión de acciones de control del personaje.
- Reproducibilidad mediante receta y manifiesto de checkpoint publicados.
- Ejecución interactiva a través del comando `gradlab play` con una ROM propia del juego.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en el sentido de agentes LLM.
- No tiene capacidades multilingües (no procesa ni genera lenguaje).
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del entorno de juego.

## Casos de uso

- Reproducción de resultados en RL: cargar el checkpoint con `gradlab play` y verificar la tasa de limpieza reportada sobre el nivel 2-2, usando la receta y la semilla documentadas para comparar contra el informe de entrenamiento.
- Punto de partida para experimentos de self-imitation learning: la combinación PPO + SIL y la receta publicada permiten aislar el efecto de SIL frente a PPO puro en un entorno con recompensa dispersa.
- Benchmark de recetas RL en entornos discretos: sirve como referencia de nivel fijo para comparar variantes de hiperparámetros, arquitecturas de política o esquemas de exploración.
- Docencia y demostración de RL aplicado a videojuegos: el bundle incluye política, metadatos y receta, lo que facilita explicar el ciclo completo de entrenamiento y evaluación en un caso concreto.
- Investigación en generalización entre niveles: al existir una colección de políticas por nivel del mismo entorno, permite estudiar transferencia y comparación de dificultad entre niveles.
- Integración en pipelines de evaluación automatizada: el manifiesto de checkpoint y el identificador de ejecución permiten trazar qué política produjo qué resultados en un sistema de registro de experimentos.

## Benchmarks y rendimiento

| Métrica | Valor en el checkpoint publicado |
|---|---|
| Limpiezas en las últimas 100 episodios de entrenamiento | 84 / 100 |
| Limpiezas acumuladas en entrenamiento | 4.275 / 11.853 |
| Transiciones de entorno | 7.155.712 |
| Evaluación de aceptación independiente | No disponible |

No se han publicado resultados de benchmarks comparativos con otras políticas en la información disponible. Las cifras anteriores proceden de un único entrenamiento con semilla `1801` y de episodios de entrenamiento, no de una evaluación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el autor no publica tamaño ni arquitectura de la política).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable con los datos publicados; el tamaño del repositorio (0.0 GB) sugiere un artefacto pequeño, pero no se especifica el cómputo requerido.
- Opciones de despliegue: GradLab mediante `gradlab play 'hf://tsilva/SuperMarioBros-Nes-v0_Level2-2' --rom-path /path/to/SuperMarioBros.nes`. No se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de artefacto).
- Requisito adicional: ROM de Super Mario Bros. NES aportada por el usuario; el repositorio no incluye la ROM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Métrica reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tsilva/SuperMarioBros-Nes-v0_Level2-2` | SuperMarioBros-Nes-v0, nivel 2-2 | PPO + SIL | 84/100 limpiezas en las últimas 100 episodios de entrenamiento | no disponible | Hugging Face |
| Otras políticas de la colección `gradlab-supermariobros-nes-v0` | Niveles concretos de SuperMarioBros-Nes-v0 | PPO + SIL (receta GradLab) | no disponible en la información proporcionada | no disponible | Hugging Face (colección del autor) |
| Políticas RL genéricas para Super Mario Bros. NES | SuperMarioBros-Nes-v0 | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos verificables con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para el nivel 2-2 desde el inicio canónico; no se documenta comportamiento en otros niveles ni desde estados intermedios.
- Ausencia de evaluación independiente: el autor indica explícitamente "Independent acceptance evaluation: Unavailable"; las cifras de limpieza provienen de episodios de entrenamiento.
- Una sola semilla: los resultados corresponden a la semilla `1801`, sin intervalo de confianza ni repeticiones.
- Licencia no declarada: no se especifican condiciones de uso comercial ni de redistribución; debe contactarse con el autor antes de cualquier uso en producción.
- Dependencia de una ROM propietaria: el uso requiere aportar una ROM de Super Mario Bros. NES que el usuario debe poseer legalmente; el repositorio no la incluye.
- Sin información sobre sesgos: no se documentan sesgos, pero el alcance del artefacto (control de un personaje en un nivel concreto) limita la aplicabilidad del concepto.
- Riesgo de sobreajuste al entorno: al entrenarse sobre un único nivel y un único entorno, la política puede no generalizar a variaciones del emulador, del nivel o de la configuración de recompensa.
- Sin datos de robustez: no se documenta comportamiento ante perturbaciones del estado, cambios de framerate o modificaciones del entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level2-2
- Colección de políticas Super Mario Bros. NES de GradLab: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
- Informe de entrenamiento (nivel 2-2): https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level2-2--2026-11-13
- Instalación de GradLab: https://github.com/tsilva/gradlab#install
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-13618bff8573053e27fc095d41c4ce13/checkpoints/7155712-aba3cc4688a4fd9a426bfa7238b384a1fc6273076f0ac9c632edf23cebaeebe7/manifest.json
