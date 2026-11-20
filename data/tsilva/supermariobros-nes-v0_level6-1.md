# tsilva/SuperMarioBros-Nes-v0_Level6-1

## Resumen

SuperMarioBros-Nes-v0_Level6-1 es una política de aprendizaje por refuerzo entrenada desde cero para superar el nivel 6-1 del entorno `SuperMarioBros-Nes-v0`, una tarea de control basada en el clásico Super Mario Bros. de NES. El modelo lo desarrolla el usuario tsilva y se distribuye a través de Hugging Face con la librería `gradlab`, un framework propio de experimentación en RL. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de un agente que mapea observaciones del juego a acciones de control.

La política se entrenó con una combinación de PPO (Proximal Policy Optimization) y SIL (Self-Imitation Learning), partiendo de cero y sin demostraciones humanas. El checkpoint publicado corresponde a la ejecución `gradlab-556c8169fd1e7652fb3c1e8b472a3453` y reporta una tasa de superación del nivel de 90 sobre 100 episodios en las últimas evaluaciones de entrenamiento. No hay información sobre arquitectura de red, número de parámetros ni tamaño del modelo más allá del peso del repositorio (0,0 GB), lo que sugiere que el artefacto es muy pequeño.

Su relevancia es acotada: sirve como referencia reproducible de un agente RL que resuelve una tarea concreta de un videojuego, útil para investigar recetas de entrenamiento, comparar algoritmos de RL y validar pipelines de GradLab, no como componente de aplicaciones de lenguaje natural.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL entrenada con PPO + SIL en GradLab; no se especifica la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (entorno de juego, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (bundle de GradLab), con metadatos en `model.json` y receta en `recipe.json` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red neuronal de la política. Se sabe que el entrenamiento se realizó con PPO combinado con SIL, un esquema que reutiliza trayectorias exitosas pasadas como objetivo de imitación para estabilizar y acelerar el aprendizaje. El agente se entrenó desde cero, sin inicialización a partir de demostraciones, sobre el entorno `SuperMarioBros-Nes-v0` con inicio canónico en el nivel 6-1.

El entrenamiento acumuló 9.465.856 transiciones de entorno y 7.995 superaciones del nivel sobre 20.951 episodios totales. La ejecución se realizó con la semilla 1801 y el checkpoint publicado (`checkpoint-9465856-e51ad7fb23313128`) se empaqueta junto con la receta ejecutada, lo que permite reproducir el proceso. No se han publicado detalles sobre tamaño de red, hiperparámetros de PPO, función de recompensa o composición de observaciones.

## Capacidades

- Control de un agente en el entorno `SuperMarioBros-Nes-v0` para el nivel 6-1 desde el inicio canónico.
- Superación del nivel en 90 de los últimos 100 episodios de entrenamiento.
- Aprendizaje desde cero sin demostraciones humanas, combinando PPO y SIL.
- Reproducibilidad parcial: se publican pesos, metadatos de checkpoint y receta de entrenamiento.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM.
- No tiene capacidades multilingües, de visión general ni de generación de texto.
- No dispone de modo de pensamiento, audio ni otras capacidades especiales.

## Casos de uso

- Investigación en aprendizaje por refuerzo: sirve como referencia reproducible de una receta PPO + SIL que resuelve una tarea de control discreta, permitiendo comparar variantes de algoritmo bajo las mismas condiciones.
- Validación del framework GradLab: el bundle incluye receta y metadatos, por lo que se puede usar para verificar el pipeline de entrenamiento, evaluación y reproducción de experimentos.
- Benchmark de agentes en videojuegos: el nivel 6-1 con inicio canónico es una tarea acotada y medible que permite comparar políticas entrenadas con distintas semillas o hiperparámetros.
- Estudio de Self-Imitation Learning: al haberse entrenado con SIL, es útil para analizar cómo la reutilización de trayectorias exitosas afecta a la tasa de superación y a la estabilidad del entrenamiento.
- Docencia y divulgación de RL: un agente que supera un nivel concreto de Super Mario Bros. es un ejemplo didáctico tangible de política entrenada desde cero.
- Reproducción de experimentos: la publicación de `recipe.json` y del manifiesto del checkpoint permite repetir la ejecución y auditar los resultados reportados.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Superaciones en los últimos 100 episodios de entrenamiento | 90 / 100 |
| Superaciones acumuladas en entrenamiento | 7.995 / 20.951 |
| Transiciones de entorno | 9.465.856 |
| Evaluación de aceptación independiente | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,0 GB y la política es presumiblemente ligera, pero no se especifica.
- GPU recomendadas: no disponibles; el autor no documenta requisitos de hardware.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del artefacto es plausible que sea ejecutable en CPU, pero no está confirmado.
- Opciones de despliegue: el método documentado es el comando `gradlab play 'hf://tsilva/SuperMarioBros-Nes-v0_Level6-1' --rom-path /path/to/SuperMarioBros.nes`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Resultado reportado | Licencia |
|---|---|---|---|---|
| SuperMarioBros-Nes-v0_Level6-1 (tsilva) | Política RL (PPO + SIL) | Nivel 6-1 | 90/100 en últimos episodios de entrenamiento | no disponible |
| Otros checkpoints de la colección GradLab SuperMarioBros-Nes-v0 | Políticas RL (GradLab) | Distintos niveles | no disponible en la información proporcionada | no disponible |
| Alternativas de RL para Super Mario Bros. (p. ej., agentes basados en PPO o DQN de la literatura) | Políticas RL | Niveles varios | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para el nivel 6-1 desde el inicio canónico; no se garantiza su comportamiento en otros niveles, posiciones de inicio o variantes del entorno.
- Evaluación limitada: los resultados provienen de un único entrenamiento con semilla 1801 y de las últimas 100 evaluaciones de entrenamiento; no hay evaluación de aceptación independiente.
- Dependencia externa: requiere una ROM de Super Mario Bros. NES que el usuario debe aportar; no se distribuye con el modelo.
- Licencia no disponible: no se especifican términos de uso, lo que impide confirmar si el uso comercial está permitido.
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución; estos conceptos no aplican directamente a un agente de RL, pero la política puede fallar de forma impredecible ante estados no vistos.
- Artefacto de tamaño mínimo (0,0 GB) y sin documentación de arquitectura, lo que dificulta auditar el modelo más allá de los resultados reportados.
- No apto para tareas de lenguaje, visión general, tool calling ni aplicaciones de agentes conversacionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level6-1
- Repositorio GradLab: https://github.com/tsilva/gradlab
- Instrucciones de instalación de GradLab: https://github.com/tsilva/gradlab#install
- Informe de entrenamiento (nivel 6-1): https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level6-1--2026-11-19
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-556c8169fd1e7652fb3c1e8b472a3453/checkpoints/9465856-e51ad7fb23313128e244a47e872f06b88768bcd2aa20f32a1a9c0337e4bd4879/manifest.json
- Colección Mario en Hugging Face: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
