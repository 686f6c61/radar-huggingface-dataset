# tsilva/SuperMarioBros-Nes-v0_Level6-3

## Resumen

`tsilva/SuperMarioBros-Nes-v0_Level6-3` es una política de aprendizaje por refuerzo entrenada desde cero para superar el nivel 6-3 del entorno `SuperMarioBros-Nes-v0`, un entorno de emulación de NES para Super Mario Bros. El modelo lo publica el usuario tsilva dentro de su framework GradLab, una librería propia de entrenamiento RL, y emplea PPO (Proximal Policy Optimization) combinado con SIL (Self-Imitation Learning) como algoritmo de aprendizaje. No es un modelo de lenguaje: es un agente de control que recibe observaciones del emulador y emite acciones de juego.

El checkpoint publicado se corresponde con el paso de entorno 7.139.328 de una única ejecución con semilla 1801. Según la model card, la política completa el nivel en 80 de las últimas 100 episodios de entrenamiento, y acumula 5.908 limpiezas sobre 22.668 episodios totales. La evaluación de aceptación independiente no está disponible, por lo que las cifras proceden exclusivamente del propio entrenamiento.

La relevancia del artefacto es acotada: sirve como referencia reproducible de una receta de RL para un nivel concreto de un juego de NES, más que como modelo de propósito general. El repositorio ocupa 0,0 GB y no registra descargas ni likes en el momento de la consulta. Los pesos se distribuyen como un bundle de GradLab (`model.zip`, `model.json`, `recipe.json`), no como safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL entrenada con PPO + SIL; la model card no detalla la topología de la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; el agente opera sobre observaciones del emulador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | bundle GradLab: `model.zip` (política), `model.json` (metadatos del checkpoint), `recipe.json` (receta ejecutada) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura de la red neuronal de la política: la model card solo indica que se entrena desde cero con PPO + SIL en GradLab. PPO es un algoritmo de gradiente de política con recorte de la ratio de probabilidades para estabilizar la actualización, y SIL añade una fase de autoimitación sobre trayectorias exitosas, lo que en entornos de recompensa dispersa como un nivel de plataformas permite reforzar las secuencias que ya han logrado completar el objetivo. No se especifican el número de capas, los canales, el tipo de codificador visual ni la composición exacta del dataset de entrenamiento, más allá de que las observaciones provienen del emulador de `SuperMarioBros-Nes-v0`.

El entrenamiento se realizó en una única ejecución con semilla 1801, identificada como `gradlab-8b427b5dd20f830dc98a7f67168da0ca`, que produjo el checkpoint `checkpoint-7139328-d6990bd3bb517d88` tras 7.139.328 transiciones de entorno. Cada episodio contabilizado parte del inicio canónico del nivel 6-3. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal ni mecanismos híbridos, y no hay información sobre ajuste fino posterior, RLHF ni DPO, que por otra parte no aplican a este tipo de agente.

## Capacidades

- Control de un agente en el entorno `SuperMarioBros-Nes-v0`, limitado al nivel 6-3 desde su posición inicial canónica.
- Política entrenada con PPO + SIL que emite acciones de juego a partir de las observaciones del emulador.
- Reproducción del checkpoint mediante el comando `gradlab play` de la librería GradLab, aportando una ROM de Super Mario Bros. NES válida.
- Bundle autocontenido con política, metadatos de checkpoint y receta ejecutada, lo que permite auditar la configuración de entrenamiento.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, function calling, capacidades de agente multi-paso fuera del entorno ni capacidades multilingües.
- No dispone de modo thinking, audio ni visión más allá de la observación del emulador.

## Casos de uso

- Reproducción de resultados de RL: ejecutar el checkpoint con `gradlab play` y una ROM legal propia para verificar las tasas de limpieza reportadas (80/100 en las últimas 100 episodios de entrenamiento) en una máquina local.
- Referencia de receta para PPO + SIL: la inclusión de `recipe.json` permite estudiar la configuración exacta de hiperparámetros y reutilizarla como punto de partida en otros niveles de `SuperMarioBros-Nes-v0`.
- Comparación de algoritmos de RL: servir como línea base entrenada con PPO + SIL frente a otras políticas del mismo entorno publicadas en la colección de Mario de tsilva.
- Docencia y divulgación: ilustrar el ciclo completo de entrenamiento por refuerzo en un entorno de recompensa dispersa, desde la recolección de transiciones hasta la evaluación por checkpoint.
- Investigación en autoimitación: analizar el efecto de SIL sobre la tasa de limpieza comparando la curva de 5.908 limpiezas acumuladas en 22.668 episodios con variantes sin SIL.
- Pruebas de integración de GradLab: validar la instalación de la librería y el flujo de carga de políticas desde Hugging Face (`hf://tsilva/SuperMarioBros-Nes-v0_Level6-3`) en pipelines de CI.
- Benchmarking de emuladores NES: usar el agente como carga de trabajo reproducible para medir latencia del emulador y determinismo entre ejecuciones.

## Benchmarks y rendimiento

Los únicos datos publicados proceden del propio entrenamiento y no de una evaluación independiente:

| Metrica | Valor |
|---|---|
| Limpiezas en los últimos 100 episodios de entrenamiento | 80 / 100 |
| Limpiezas acumuladas en entrenamiento | 5.908 / 22.668 |
| Transiciones de entorno | 7.139.328 |
| Evaluación de aceptación independiente | no disponible |
| Semilla del entrenamiento | 1801 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; la model card no detalla el tamaño de la red ni el consumo de memoria. El repositorio ocupa 0,0 GB, lo que sugiere un checkpoint de tamaño reducido.
- GPU recomendadas: no disponible. Dado el tamaño del bundle, es plausible que la inferencia funcione en CPU, pero no hay confirmación en la documentación.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: únicamente GradLab mediante `gradlab play 'hf://tsilva/SuperMarioBros-Nes-v0_Level6-3' --rom-path /path/to/SuperMarioBros.nes`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y throughput: no disponibles.
- Requisito adicional: es imprescindible aportar una ROM de Super Mario Bros. NES compatible, que el usuario debe obtener por su cuenta.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Limpiezas reportadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tsilva/SuperMarioBros-Nes-v0_Level6-3 | SuperMarioBros-Nes-v0, nivel 6-3 | PPO + SIL | 80/100 en los últimos 100 episodios de entrenamiento | no disponible | Hugging Face, bundle GradLab |
| Otras políticas de la colección GradLab SuperMarioBros-Nes-v0 | SuperMarioBros-Nes-v0, distintos niveles | PPO + SIL (según la receta común) | no disponible en la información proporcionada | no disponible | Hugging Face, colección tsilva |

No se dispone de datos de benchmarks ni de especificaciones de modelos externos comparables en la información proporcionada, por lo que la comparativa con alternativas de otros autores queda como no disponible.

## Limitaciones y advertencias

- El agente está especializado en un único nivel (6-3) y parte siempre del inicio canónico; no se documenta su comportamiento en otras posiciones ni niveles.
- Las cifras de limpieza (80/100) proceden de los últimos 100 episodios de entrenamiento de una sola ejecución con semilla 1801, no de una evaluación independiente; pueden estar sobreestimadas por sobreajuste al entorno de entrenamiento.
- No hay evaluación de aceptación independiente, por lo que la generalización a configuraciones distintas del emulador no está verificada.
- La licencia no está disponible, lo que impide confirmar si se permite el uso comercial o la redistribución del checkpoint.
- El uso requiere una ROM de Super Mario Bros. NES que el usuario debe aportar; la distribución de ROMs con copyright queda fuera del alcance del repositorio y es responsabilidad del usuario.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el artefacto no es un modelo de lenguaje; esas categorías no aplican.
- El repositorio no registra descargas ni likes, y la documentación es mínima: no hay detalles de arquitectura, hiperparámetros ni curvas de aprendizaje más allá de las cifras agregadas.
- La fecha de creación del repositorio (2026-11-20) es posterior a la fecha actual, lo que conviene verificar antes de tomarla como referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level6-3
- Informe de entrenamiento (nivel 6-3): https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level6-3--2026-11-19
- Instalación de GradLab: https://github.com/tsilva/gradlab#install
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-8b427b5dd20f830dc98a7f67168da0ca/checkpoints/7139328-d6990bd3bb517d88439b94401350d0ba1362acdc1e07f528893d6e0b10e22b05/manifest.json
- Colección GradLab SuperMarioBros-Nes-v0: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
