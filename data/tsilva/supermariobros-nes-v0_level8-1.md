# tsilva/SuperMarioBros-Nes-v0_Level8-1

## Resumen

SuperMarioBros-Nes-v0_Level8-1 es una política de aprendizaje por refuerzo entrenada desde cero con PPO (Proximal Policy Optimization) para completar el nivel 8-1 del videojuego Super Mario Bros. de NES, usando el entorno `SuperMarioBros-Nes-v0`. El autor es tsilva, y el modelo forma parte de la colección GradLab de políticas para Super Mario Bros. NES, publicada en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo generativo multimodal: es una política de control entrenada para un entorno concreto.

El modelo resuelve un problema de control secuencial en un entorno de juego con acciones discretas, observaciones de imagen y recompensas basadas en progreso. El resultado publicado en la model card indica que en las últimas 100 episodios de entrenamiento completó el nivel 81 de 100 veces, con 42.254.336 transiciones de entorno acumuladas y 16.752 despejes de un total de 80.864 episodios durante el entrenamiento. Es relevante ahora como ejemplo de receta reproducible de RL con PPO en un entorno clásico, con artefactos de entrenamiento publicados (checkpoint, metadata y receta ejecutada).

La información disponible es escasa: no hay datos de arquitectura de red, número de parámetros, contexto, idiomas ni licencia. El repositorio tiene 0,0 GB y 0 descargas, y no se ha publicado una evaluación de aceptación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL entrenada con PPO; sin detalles de red publicados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica como modelo de lenguaje; entorno episódico de juego) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (checkpoint de GradLab), junto con `model.json` y `recipe.json` |

## Arquitectura y entrenamiento

La model card indica que la política se entrena desde cero con PPO en GradLab para el entorno `SuperMarioBros-Nes-v0`, empezando cada episodio contado desde el inicio canónico del nivel 8-1. El entrenamiento alcanzó 42.254.336 transiciones de entorno y produjo 16.752 despejes acumulados sobre 80.864 episodios. El checkpoint publicado corresponde al run `gradlab-1c8b4e9600416a9e9c5a8e43352f9116` y al checkpoint `checkpoint-42254336-dc06d4486eeffcca`.

No se publican detalles de la arquitectura de la red (por ejemplo, CNN, MLP o híbrida), ni hiperparámetros de PPO, ni composición del dataset, ni uso de RLHF/DPO. La receta ejecutada está disponible en `recipe.json` dentro del bundle, y el informe de entrenamiento enlazado en la model card. La semilla del run fue `12`. No hay innovaciones técnicas documentadas más allá del uso de PPO con GradLab y de la receta por nivel.

## Capacidades

- Control de un agente en Super Mario Bros. NES para el nivel 8-1, con acciones discretas del entorno.
- Ejecución de una política entrenada con PPO desde el inicio canónico del nivel.
- Reproducción mediante el comando `gradlab play` con una ROM de Super Mario Bros. NES aportada por el usuario.
- No dispone de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento.
- No dispone de visión general, audio ni generación de texto: la política consume observaciones del entorno y produce acciones.
- No se documentan capacidades de generalización a otros niveles u otros juegos.

## Casos de uso

- Reproducción de una política de RL en un entorno clásico: usar `gradlab play` con la ROM correspondiente para ejecutar la política en el nivel 8-1 y verificar el comportamiento publicado.
- Estudio de recetas de PPO: analizar `recipe.json` y el informe de entrenamiento para replicar o adaptar la receta a otros niveles.
- Evaluación de robustez de políticas de RL: comparar el rendimiento de la política en episodios independientes frente al 81/100 reportado en entrenamiento.
- Docencia y demostraciones de RL: ilustrar el ciclo entrenamiento-evaluación en un entorno con recompensas de progreso y acciones discretas.
- Baseline para experimentos de RL: usar esta política como referencia para comparar variantes de PPO, cambios de hiperparámetros o modificaciones de recompensa.
- Análisis de artefactos de entrenamiento: inspeccionar el manifest del checkpoint, la metadata y la receta para estudiar trazabilidad de runs en GradLab.
- Investigación sobre generalización: probar la política en condiciones distintas (por ejemplo, otras semillas de entorno) para medir su estabilidad, sabiendo que la model card solo reporta el nivel 8-1.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Despejes en los últimos 100 episodios de entrenamiento | 81 / 100 |
| Despejes acumulados en entrenamiento | 16.752 / 80.864 |
| Transiciones de entorno | 42.254.336 |
| Evaluación de aceptación independiente | no disponible |

No se han publicado resultados de benchmarks en la información disponible más allá de las métricas de entrenamiento anteriores. No hay comparación con otros modelos o políticas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no se publican detalles de la red ni del tamaño del checkpoint.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende del tamaño real de la política, que no se documenta.
- Opciones de despliegue: GradLab, mediante `gradlab play 'hf://tsilva/SuperMarioBros-Nes-v0_Level8-1' --rom-path /path/to/SuperMarioBros.nes`.
- Latencia y throughput: no disponibles.
- Requisito adicional: se necesita una ROM de Super Mario Bros. NES compatible aportada por el usuario; no se distribuye con el modelo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas de RL para Super Mario Bros. NES) con parámetros, contexto, rendimiento, licencia y disponibilidad comparables.

## Limitaciones y advertencias

- La model card no publica licencia; no se puede confirmar el uso comercial permitido.
- No hay evaluación de aceptación independiente: el 81/100 procede de episodios de entrenamiento con semilla `12`, no de una evaluación externa.
- El rendimiento está limitado al nivel 8-1 y al inicio canónico; no se documenta generalización a otros niveles, variantes del entorno o condiciones distintas.
- No se publican detalles de arquitectura, parámetros ni hiperparámetros, lo que dificulta la reproducibilidad completa sin inspeccionar `recipe.json` y el manifest.
- Requiere una ROM de Super Mario Bros. NES aportada por el usuario; el modelo no incluye la ROM.
- Riesgo de sobreajuste al entorno de entrenamiento y de variabilidad entre semillas no cuantificada.
- No aplican sesgos lingüísticos ni de alucinación propios de modelos de lenguaje, pero sí posibles sesgos de política aprendida (por ejemplo, dependencia de la distribución de recompensas del entorno).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de adopción o validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level8-1
- Informe de entrenamiento: https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level8-1--2026-11-17
- Instalación de GradLab: https://github.com/tsilva/gradlab#install
- Manifest del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-1c8b4e9600416a9e9c5a8e43352f9116/checkpoints/42254336-dc06d4486eeffccac5f02d043889a3c683dd4c32ec44cb8cfe9262d66497b341/manifest.json
- Colección Mario en Hugging Face: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
