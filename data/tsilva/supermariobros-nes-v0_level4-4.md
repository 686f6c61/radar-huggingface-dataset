# tsilva/SuperMarioBros-Nes-v0_Level4-4

## Resumen

SuperMarioBros-Nes-v0_Level4-4 es un checkpoint de política de aprendizaje por refuerzo publicado por el usuario tsilva en Hugging Face. No es un modelo de lenguaje: se trata de un agente entrenado con PPO (Proximal Policy Optimization) y SIL (Self-Imitation Learning) mediante la librería GradLab para intentar completar el nivel 4-4 de Super Mario Bros. de NES en el entorno `SuperMarioBros-Nes-v0`. El modelo se distribuye como un bundle de política (`model.zip`) junto con metadatos de checkpoint y la receta de entrenamiento ejecutada.

El dato más relevante del checkpoint es su rendimiento real: según la propia model card, el agente no completa el nivel en ninguna de las últimas 100 episodios de entrenamiento evaluados (0/100) y acumula 0 clears en 36.068 episodios a lo largo de 16.777.216 transiciones de entorno. El autor indica que la campaña terminó con varios intentos empatados a cero clears y que este checkpoint se seleccionó por ser el de mayor paso de entrenamiento verificado entre los empatados. No hay evaluación de aceptación independiente.

Por tanto, se trata de un artefacto de investigación reproducible (semilla 2801, run `gradlab-48ef03a4b517294bbf6423e648f15c2c`) más que de un agente funcional. Su interés está en la trazabilidad del experimento y en servir como punto de partida o referencia negativa para quienes trabajen en RL sobre juegos de NES con GradLab. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO + SIL) sobre el entorno `SuperMarioBros-Nes-v0`; arquitectura de red no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos distribuidos como `model.zip`, no en formatos de cuantización estándar) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (bundle GradLab), con `model.json` y `recipe.json` |
| Libreria | gradlab |
| Pipeline | reinforcement-learning |
| Entorno | SuperMarioBros-Nes-v0, nivel 4-4, inicio canónico |
| Algoritmo | PPO + SIL |
| Semilla de entrenamiento | 2801 |
| Transiciones de entorno | 16.777.216 |
| Checkpoint | `checkpoint-16777216-88cd15d28a903c99` |
| Run ID | `gradlab-48ef03a4b517294bbf6423e648f15c2c` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de red de la política (número de capas, tamaño de las capas ocultas, tipo de extractor de características visuales, etc.). Lo que sí se documenta es el procedimiento de entrenamiento: una política entrenada desde cero con PPO combinado con SIL en la librería GradLab, sobre el entorno `SuperMarioBros-Nes-v0` con inicio canónico en el nivel 4-4. El entrenamiento se ejecutó con la semilla 2801 y acumuló 16.777.216 transiciones de entorno.

El resultado del entrenamiento es negativo en términos de la métrica objetivo: 0 clears en los últimos 100 episodios de entrenamiento y 0 clears acumulados en 36.068 episodios. El autor señala que hubo múltiples intentos empatados a cero y que el checkpoint publicado corresponde al mayor paso de entrenamiento verificado entre esos empates. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.), ni detalles sobre el dataset de entrenamiento más allá del propio entorno de juego. La receta ejecutada está incluida en el bundle como `recipe.json`, lo que permite reproducir el experimento.

## Capacidades

- Ejecución de acciones en el entorno `SuperMarioBros-Nes-v0` (nivel 4-4) a partir de observaciones del juego.
- Aprendizaje por refuerzo con PPO + SIL, reproducible mediante GradLab y la receta incluida.
- Reproducción del experimento con la semilla 2801 y el checkpoint `checkpoint-16777216-88cd15d28a903c99`.
- Inspección de la política mediante `gradlab play` con un ROM de Super Mario Bros. NES aportado por el usuario.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes multi-paso ni multilingüismo.
- No se documenta ningún modo especial (thinking mode, audio, etc.).

## Casos de uso

- Reproducción de experimentos de RL: el bundle incluye `recipe.json` y `model.json`, lo que permite reejecutar el entrenamiento con la semilla 2801 y comparar resultados en igualdad de condiciones.
- Referencia negativa en investigación: sirve como línea base de "política que no completa el nivel" para medir la mejora de nuevas aproximaciones sobre el nivel 4-4 de Super Mario Bros.
- Estudio de PPO + SIL: permite analizar por qué la combinación de ambos algoritmos no converge en este entorno concreto y en este presupuesto de 16,7 millones de transiciones.
- Depuración de pipelines GradLab: útil para validar la instalación, el formato de bundles y el flujo `gradlab play` antes de lanzar entrenamientos más largos.
- Docencia y divulgación: ejemplo tangible de que un entrenamiento de RL puede no resolver la tarea y de la importancia de reportar métricas honestas (0/100 clears) junto al checkpoint.
- Comparación de checkpoints dentro de la colección Mario de tsilva: el autor mantiene una colección de checkpoints GradLab para Super Mario Bros. NES que permite contrastar niveles y configuraciones.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la model card son los siguientes:

| Metrica | Valor en el checkpoint publicado |
|---|---|
| Clears en los últimos 100 episodios de entrenamiento | 0 / 100 |
| Clears acumulados en entrenamiento | 0 / 36.068 |
| Transiciones de entorno | 16.777.216 |
| Evaluación de aceptación independiente | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni comparaciones numéricas con otros checkpoints de la misma colección.

## Requisitos de hardware

- No se dispone de estimaciones de VRAM para inferencia en la información proporcionada.
- No se especifican GPU recomendadas (A100, H100, RTX 4090, etc.) en la model card.
- No se indica si el agente cabe en GPU de consumo; el tamaño del repositorio es de 0.0 GB, lo que sugiere un bundle pequeño, pero no se detalla el tamaño de la política.
- Opciones de despliegue: GradLab mediante el comando `gradlab play 'hf://tsilva/SuperMarioBros-Nes-v0_Level4-4' --rom-path /path/to/SuperMarioBros.nes`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.
- Requisito adicional: el usuario debe aportar su propio ROM de Super Mario Bros. NES compatible; el repositorio no incluye la ROM.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno / tarea | Entrenamiento | Resultado reportado | Licencia |
|---|---|---|---|---|---|
| tsilva/SuperMarioBros-Nes-v0_Level4-4 | Política RL (PPO + SIL) | Super Mario Bros. NES, nivel 4-4 | 16.777.216 transiciones, semilla 2801 | 0/100 clears en últimos 100 episodios | no disponible |
| Otros checkpoints de la colección Mario de tsilva | Políticas RL (GradLab) | Super Mario Bros. NES, distintos niveles | no disponible en esta ficha | no disponible en esta ficha | no disponible |
| Alternativas externas de RL sobre Super Mario Bros. | Políticas RL | Super Mario Bros. NES | no disponible en esta ficha | no disponible en esta ficha | no disponible |

No se dispone de datos verificables de modelos comparables en la información proporcionada; la comparación con alternativas externas queda como "no disponible".

## Limitaciones y advertencias

- El agente no completa el nivel 4-4: 0 clears en los últimos 100 episodios y 0 clears acumulados en 36.068 episodios de entrenamiento.
- No existe evaluación de aceptación independiente; todas las métricas provienen de un único run con semilla 2801.
- El autor indica que hubo empates a cero clears y que el checkpoint se eligió por ser el de mayor paso verificado entre los empatados, no por rendimiento superior.
- La licencia no está disponible, por lo que no se puede confirmar el uso comercial ni la redistribución.
- El repositorio no incluye la ROM de Super Mario Bros. NES; el usuario debe aportar una copia legal propia, lo que añade una dependencia externa y posibles restricciones legales.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque no es un modelo de lenguaje; esas categorías no aplican.
- No se detalla la arquitectura de red ni el tamaño de la política, lo que dificulta estimar requisitos de cómputo y comparar con otros agentes.
- El tamaño del repositorio figura como 0.0 GB, lo que puede indicar que los pesos no están realmente alojados o que el redondeo oculta un tamaño pequeño; conviene verificar el contenido del bundle antes de usarlo en producción.
- Uso en producción no recomendado: es un artefacto de investigación con rendimiento nulo en la tarea objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level4-4
- GradLab (instalación y uso): https://github.com/tsilva/gradlab#install
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-48ef03a4b517294bbf6423e648f15c2c/checkpoints/16777216-88cd15d28a903c9960bb501e6d12b0432076c301f352397851f3e8f1c008bf74/manifest.json
- Colección Mario de tsilva: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
