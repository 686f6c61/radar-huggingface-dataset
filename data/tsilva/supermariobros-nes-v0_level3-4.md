# tsilva/SuperMarioBros-Nes-v0_Level3-4

## Resumen

SuperMarioBros-Nes-v0_Level3-4 es una política de aprendizaje por refuerzo entrenada desde cero con PPO (Proximal Policy Optimization) en el framework GradLab por el usuario tsilva. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un agente especializado en superar el nivel 3-4 del entorno `SuperMarioBros-Nes-v0`, que emula el clásico Super Mario Bros. de NES. El modelo resuelve una tarea concreta de control secuencial en un entorno de videojuego con observaciones visuales y acciones discretas.

El artefacto publicado es un bundle de inferencia que incluye la política (`model.zip`), metadatos del checkpoint (`model.json`) y la receta de entrenamiento ejecutada (`recipe.json`). El checkpoint publicado corresponde al paso 2.580.480 de transiciones de entorno de una única ejecución con semilla 12, y reporta 95 limpiezas del nivel en las últimas 100 episodios de entrenamiento.

Su relevancia es acotada y experimental: sirve como referencia reproducible de un pipeline PPO completo en GradLab para un nivel específico, no como componente de propósito general. No hay evaluación de aceptación independiente publicada, el repositorio pesa 0,0 GB y no se declaran licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política de aprendizaje por refuerzo (PPO) entrenada en GradLab; topología de red no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (política serializada), `model.json` (metadatos), `recipe.json` (receta) |

## Arquitectura y entrenamiento

La política se entrenó con PPO en GradLab sobre el entorno `SuperMarioBros-Nes-v0`, partiendo siempre del inicio canónico del nivel 3-4 en cada episodio contado. El entrenamiento acumuló 2.580.480 transiciones de entorno en una única ejecución (semilla 12) que produjo el checkpoint `checkpoint-2580480-cec220f5264c8f17`, identificado con el run `gradlab-0e4aa3be8c4ec268bf212c2b852d25be`. La receta ejecutada se distribuye junto con los pesos en `recipe.json`, lo que permite reproducir el procedimiento.

No se detalla en la información disponible la arquitectura interna de la red (capas, tamaño de las representaciones, tipo de extractor visual), ni la composición del dataset (aquí generado por interacción con el emulador), ni si se aplicaron técnicas adicionales como recompensas conformadas, currículo o aumento de datos. Tampoco se especifica la configuración de hiperparámetros de PPO más allá de lo contenido en la receta enlazada.

## Capacidades

- Control de un agente en el entorno `SuperMarioBros-Nes-v0`, limitado al nivel 3-4 desde el inicio canónico.
- Toma de decisiones secuenciales a partir de observaciones del emulador (modalidad visual y acciones discretas propias del entorno).
- Ejecución reproducible mediante el comando `gradlab play` con una ROM de Super Mario Bros. NES aportada por el usuario.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en lenguaje natural ni planificación simbólica.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades fuera del entorno de juego.

## Casos de uso

- Reproducción de referencia en investigación de RL: ejecutar la política con `gradlab play` para verificar el comportamiento reportado (95/100 limpiezas en entrenamiento) sobre una ROM legalmente obtenida.
- Docencia de PPO: usar la receta (`recipe.json`) y el manifiesto del checkpoint como ejemplo completo de un ciclo entrenamiento-evaluación en GradLab.
- Baseline para comparativas de algoritmos: servir de punto de partida al evaluar variantes de PPO, cambios de recompensa o ajustes de currículo en el mismo nivel.
- Depuración de pipelines de RL: el bundle autocontenido (política, metadatos y receta) facilita aislar fallos de entorno frente a fallos de algoritmo.
- Estudio de estabilidad de entrenamiento: analizar la curva implícita en las 2.503 limpiezas acumuladas sobre 10.729 episodios para caracterizar la varianza del aprendizaje.
- Pruebas de integración de GradLab: validar la instalación y el flujo de carga remota `hf://` antes de entrenar políticas propias.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Limpiezas en los últimos 100 episodios de entrenamiento | 95 / 100 |
| Limpiezas acumuladas en entrenamiento | 2.503 / 10.729 |
| Transiciones de entorno | 2.580.480 |
| Evaluación de aceptación independiente | no disponible |

No se han publicado resultados de benchmarks en la informacion disponible más allá de las métricas de entrenamiento anteriores. No hay comparación con otros agentes ni evaluaciones externas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un artefacto muy ligero, pero no se especifica el consumo real.
- GPU recomendadas: no disponibles. Al ser una política de RL para un emulador de NES, es plausible que funcione en CPU, pero no se confirma en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: exclusivamente mediante GradLab (`gradlab play 'hf://tsilva/SuperMarioBros-Nes-v0_Level3-4' --rom-path /path/to/SuperMarioBros.nes`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros agentes comparables del mismo autor o de terceros para el nivel 3-4 de `SuperMarioBros-Nes-v0`, ni métricas homogéneas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La métrica de 95/100 procede de episodios de entrenamiento de una única ejecución con semilla 12; no hay evaluación de aceptación independiente, por lo que el rendimiento en condiciones no vistas no está validado.
- La política está especializada en un único nivel (3-4) y parte siempre del inicio canónico; no se espera generalización a otros niveles ni a posiciones intermedias.
- Requiere una ROM de Super Mario Bros. NES que el usuario debe aportar; la distribución o uso de ROMs puede estar sujeta a restricciones legales según la jurisdicción.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; debe tratarse como no apto para producción hasta aclararlo con el autor.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el artefacto no es un modelo de lenguaje; esos criterios no aplican.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-20) es futura respecto a la información habitual de publicación; conviene verificar la vigencia del checkpoint antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level3-4
- Repositorio GradLab: https://github.com/tsilva/gradlab
- Instrucciones de instalación de GradLab: https://github.com/tsilva/gradlab#install
- Informe de entrenamiento (nivel 3-4): https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level3-4--2026-11-16
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-0e4aa3be8c4ec268bf212c2b852d25be/checkpoints/2580480-cec220f5264c8f175febbb2dcfbc0cf1b6a221a05bb04e83d549e8f9caffaffc/manifest.json
- Colección de Mario en Hugging Face: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
