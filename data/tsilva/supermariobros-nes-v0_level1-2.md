# tsilva/SuperMarioBros-Nes-v0_Level1-2

## Resumen

SuperMarioBros-Nes-v0_Level1-2 es una política de aprendizaje por refuerzo (reinforcement learning) entrenada desde cero mediante el algoritmo PPO (Proximal Policy Optimization) sobre el entorno `SuperMarioBros-Nes-v0`, comenzando en el inicio del nivel 1-2 del juego Super Mario Bros. de NES. Lo desarrolla el autor de Hugging Face `tsilva` como parte de la colección GradLab, un conjunto de políticas entrenadas con su propia librería de RL llamada GradLab. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un agente que aprende a jugar a un videojuego concreto a partir de observaciones visuales y recompensas del entorno.

El modelo resuelve una tarea muy específica: completar el nivel 1-2 de Super Mario Bros. Según la model card, la política publicada logra 84 despejes de nivel en las últimas 100 episodios de entrenamiento (84 %), con un total acumulado de 3.752 despejes sobre 8.990 episodios durante el entrenamiento, tras 3.301.376 transiciones de entorno. Los resultados provienen de una única ejecución de entrenamiento con semilla `12` y no se ha realizado una evaluación de aceptación independiente.

Su relevancia es limitada fuera del ámbito de la investigación en RL y de la experimentación con entornos de videojuegos. Resulta útil como referencia reproducible de un pipeline PPO completo (política, metadatos de checkpoint y receta de entrenamiento) y como ejemplo de agente entrenado con la librería GradLab, pero no es un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO); arquitectura de red no especificada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de RL sobre observaciones del entorno, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (pesos de la política), `model.json` (metadatos del checkpoint), `recipe.json` (receta de entrenamiento) |

## Arquitectura y entrenamiento

Se trata de una política entrenada con PPO (Proximal Policy Optimization) sobre el entorno `SuperMarioBros-Nes-v0`, un entorno de RL que expone el juego Super Mario Bros. de NES. El entrenamiento parte desde cero (no se indica inicialización desde un modelo preentrenado) y se centra exclusivamente en el nivel 1-2. La información disponible no detalla la arquitectura de la red neuronal de la política (número de capas, tipo de extractor de características visuales, tamaño de la capa oculta ni hiperparámetros de PPO), por lo que estos datos deben considerarse no disponibles.

El entrenamiento acumuló 3.301.376 transiciones de entorno en una única ejecución con semilla `12`, identificada como `gradlab-1c675c917e2cc2eca7b2a58cc71c9081`, que produjo el checkpoint `checkpoint-3301376-4e71fe59fa4827de`. El repositorio incluye la política (`model.zip`), los metadatos del checkpoint (`model.json`) y la receta de entrenamiento (`recipe.json`), lo que permite reproducir o inspeccionar el proceso. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal ni mecanismos híbridos, dado que no es un modelo generativo de texto.

## Capacidades

- Control de un agente en el entorno `SuperMarioBros-Nes-v0` para el nivel 1-2 de Super Mario Bros.
- Toma de decisiones secuenciales a partir de observaciones del entorno (entrada visual del juego) y recompensas.
- Ejecución de políticas entrenadas con PPO mediante la herramienta GradLab (`gradlab play`).
- Reproducibilidad del entrenamiento a partir de la receta incluida (`recipe.json`) y la semilla documentada.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en el sentido de los modelos de lenguaje ni agentes basados en texto.
- No tiene capacidades multilingües (no procesa ni genera lenguaje natural).
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la percepción del entorno del juego.

## Casos de uso

- Investigación en aprendizaje por refuerzo: servir como referencia reproducible de un pipeline PPO completo sobre un entorno de NES, con receta, checkpoint y métricas de entrenamiento documentadas.
- Evaluación de la librería GradLab: usar la política como caso de prueba para validar el flujo `gradlab play` con una ROM propia de Super Mario Bros.
- Estudio de currículos y recetas por nivel: la colección GradLab incluye políticas por nivel, lo que permite comparar el comportamiento del agente entre distintos escenarios.
- Reproducción de experimentos: reentrenar con la misma semilla (`12`) y la receta incluida para verificar la estabilidad del algoritmo PPO en este entorno.
- Docencia y divulgación: ejemplo práctico de entrenamiento de agentes en videojuegos para cursos de RL, con métricas de despeje de nivel medibles.
- Línea base para comparativas: punto de partida para evaluar variantes de PPO, cambios en la función de recompensa o modificaciones del entorno en el nivel 1-2.
- Pruebas de integración de entornos de NES: validar la compatibilidad del entorno `SuperMarioBros-Nes-v0` con el stack de GradLab y con la carga de ROMs locales.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Despejes de nivel en los últimos 100 episodios de entrenamiento | 84 / 100 (84 %) |
| Despejes acumulados durante el entrenamiento | 3.752 / 8.990 |
| Transiciones de entorno | 3.301.376 |
| Evaluación de aceptación independiente | No disponible |

No se han publicado resultados de benchmarks comparativos con otros agentes en la información disponible. Las cifras anteriores proceden de una única ejecución de entrenamiento con semilla `12` y no de una evaluación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de RL de tamaño no especificado, el requisito depende de la arquitectura de la red, que no se documenta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; presumiblemente puede ejecutarse en CPU para inferencia interactiva, pero no se confirma en la información proporcionada.
- Opciones de despliegue: GradLab (`gradlab play hf://tsilva/SuperMarioBros-Nes-v0_Level1-2 --rom-path /path/to/SuperMarioBros.nes`), con una ROM propia de Super Mario Bros.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Metrica de exito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SuperMarioBros-Nes-v0_Level1-2 (tsilva) | Política PPO | Super Mario Bros. NES, nivel 1-2 | 84 % de despejes en los últimos 100 episodios | no disponible | Hugging Face |
| Otras políticas de la colección GradLab (tsilva) | Política PPO | Super Mario Bros. NES, otros niveles | no disponible en esta ficha | no disponible | Hugging Face (colección GradLab) |
| Agentes de RL comparables de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa rigurosa con agentes de RL alternativos en el mismo entorno.

## Limitaciones y advertencias

- Los resultados (84 % de despejes) provienen de una única ejecución con semilla `12` y no de una evaluación independiente; pueden no generalizar a otras condiciones.
- La política está especializada exclusivamente en el nivel 1-2; no se documenta su comportamiento en otros niveles ni su capacidad de transferencia.
- No se especifica la arquitectura de la red ni el número de parámetros, lo que dificulta estimar requisitos de cómputo y comparar con alternativas.
- La licencia no está disponible, por lo que se desconoce si se permite el uso comercial o la redistribución.
- Requiere una ROM de Super Mario Bros. propia para ejecutarse; la distribución de ROMs está sujeta a las restricciones legales de los propietarios de los derechos.
- No es un modelo de lenguaje: no debe evaluarse con métricas de NLP ni emplearse para tareas de generación de texto, razonamiento o código.
- Riesgo de sobreajuste al entorno y a la semilla de entrenamiento; no se reportan métricas de validación cruzada ni de robustez.
- No se documentan sesgos, pero al ser un agente entrenado con recompensas de un videojuego concreto, su comportamiento está determinado por la función de recompensa del entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level1-2
- Colección GradLab SuperMarioBros-Nes-v0: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0
- Repositorio GradLab (instalación): https://github.com/tsilva/gradlab#install
- Informe de entrenamiento (nivel 1-2): https://github.com/tsilva/gradlab/blob/9f7c156d/experiments/reports/smb-per-level-recipe-qualification.md#level1-2--2026-11-13
