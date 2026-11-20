# tsilva/SuperMarioBros-Nes-v0_Level2-1

## Resumen

`tsilva/SuperMarioBros-Nes-v0_Level2-1` es una política de aprendizaje por refuerzo entrenada desde cero con PPO (Proximal Policy Optimization) mediante la librería GradLab, cuyo objetivo es completar el nivel 2-1 del juego `SuperMarioBros-Nes-v0` partiendo siempre de la posición inicial canónica. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un agente de control secuencial especializado en una tarea concreta de un entorno concreto.

El autor publica tres artefactos en el bundle: la política serializada (`model.zip`), los metadatos del checkpoint (`model.json`) y la receta ejecutada (`recipe.json`). Según la model card, el checkpoint publicado supera el nivel en 90 de las últimas 100 episodios de entrenamiento, con 4.191 superaciones acumuladas sobre 21.201 episodios y 7.012.352 transiciones de entorno, todo ello en una única ejecución con semilla `12`.

La relevancia es acotada pero clara para quien trabaja en RL aplicado: sirve como referencia reproducible de un pipeline PPO completo sobre un entorno clásico de Atari/NES, con métricas de superación declaradas y trazabilidad de la ejecución. Es importante subrayar que no hay evaluación de aceptación independiente publicada, por lo que las cifras deben interpretarse como resultados de entrenamiento del propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política PPO; la model card no detalla la topología de la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en `model.zip`, no se documentan variantes GGUF/safetensors) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (bundle GradLab) junto con `model.json` y `recipe.json` |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura de la red neuronal de la política (número de capas, canales, tamaño de la representación de entrada, etc.). Lo que sí se documenta es el algoritmo de entrenamiento: PPO, implementado en GradLab, entrenado desde cero sobre el entorno `SuperMarioBros-Nes-v0`. La receta ejecutada se publica como `recipe.json`, lo que permite inspeccionar los hiperparámetros y el pipeline exactos empleados, aunque la model card no los reproduce en texto.

Los datos de entrenamiento son interacciones con el emulador: 7.012.352 transiciones de entorno en una única ejecución (run `gradlab-f4352ce3ca1bc537393d49074020b040`, checkpoint `checkpoint-7012352-fa509e1b0a933c83`). Cada episodio contabilizado parte del inicio canónico del nivel 2-1. No se menciona uso de RLHF, DPO, decodificación especulativa ni innovaciones de atención; son conceptos ajenos a este tipo de artefacto.

## Capacidades

- Control de un agente en el entorno `SuperMarioBros-Nes-v0`, nivel 2-1, desde el inicio canónico.
- Superación del nivel en 90 de los últimos 100 episodios de entrenamiento según la model card.
- Reproducibilidad parcial: se publican política, metadatos de checkpoint y receta ejecutada.
- Ejecución mediante el comando `gradlab play` con un ROM de Super Mario Bros. NES aportado por el usuario.
- No soporta tool calling, function calling, razonamiento multi-paso genérico, capacidades multilingües ni modos de "thinking": no es un modelo de lenguaje.
- No se documentan capacidades de visión más allá de la observación propia del entorno (no confirmado en la información disponible).

## Casos de uso

- Reproducción de experimentos de RL: cargar el bundle con `gradlab play` y verificar la tasa de superación declarada sobre el nivel 2-1 con la semilla indicada, como punto de partida para comparar recetas propias.
- Docencia y formación en RL: usar la receta publicada (`recipe.json`) como ejemplo completo de un pipeline PPO desde cero sobre un entorno NES, con métricas de progreso trazables.
- Baseline para investigación en entornos discretos: emplear esta política como referencia frente a nuevas variantes de PPO, cambios en la función de recompensa o wrappers de observación.
- Análisis de estabilidad de entrenamiento: estudiar la curva implícita en las 7.012.352 transiciones y las 4.191 superaciones acumuladas para caracterizar la varianza de PPO en este entorno.
- Ingeniería de pipelines de RL: integrar el flujo de GradLab (entrenamiento, checkpointing, publicación en Hugging Face) como plantilla para otros niveles o juegos del catálogo del autor.
- Evaluación de robustez de políticas: ejecutar la política fuera de la distribución de entrenamiento (otras posiciones de inicio, perturbaciones del ROM) para medir degradación, aunque estos experimentos no están documentados por el autor.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Superaciones en los últimos 100 episodios de entrenamiento | 90 / 100 |
| Superaciones acumuladas en entrenamiento | 4.191 / 21.201 |
| Transiciones de entorno | 7.012.352 |
| Evaluación de aceptación independiente | no disponible |
| Semilla del run | 12 |

No se han publicado resultados de benchmarks comparativos con otras políticas en la información disponible. Las cifras anteriores provienen de una única ejecución de entrenamiento y no de una evaluación externa.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la información disponible; al tratarse de una política para un emulador NES, la inferencia es previsiblemente ligera, pero no hay datos confirmados.
- No se documentan GPU recomendadas (A100, H100, RTX 4090 u otras).
- No se confirma que quepa en GPU de consumo, aunque por la naturaleza del entorno es esperable; no verificable con los datos aportados.
- Despliegue: la vía documentada es GradLab mediante `gradlab play 'hf://tsilva/SuperMarioBros-Nes-v0_Level2-1' --rom-path /path/to/SuperMarioBros.nes`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este artefacto).
- Latencia y throughput: no disponibles.
- Requisito adicional: el usuario debe aportar su propio ROM de Super Mario Bros. NES compatible.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Metrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tsilva/SuperMarioBros-Nes-v0_Level2-1 | Política PPO (GradLab) | SuperMarioBros-Nes-v0, nivel 2-1 | 90/100 en últimos 100 episodios de entrenamiento | no disponible | Hugging Face |
| Otras políticas del mismo autor (colección GradLab SuperMarioBros-Nes-v0) | Política PPO (GradLab) | Otros niveles del mismo entorno | no disponible en esta ficha | no disponible | Hugging Face (colección) |
| Políticas RL comparables de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para un único nivel (2-1) de un único entorno; no se garantiza su comportamiento en otros niveles, posiciones de inicio o juegos.
- Sin evaluación independiente: la model card declara explícitamente "Independent acceptance evaluation: Unavailable"; las cifras de superación provienen del propio entrenamiento.
- Una sola semilla: los resultados corresponden a la semilla `12`; no se documenta variabilidad entre semillas.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Dependencia de un ROM externo: el funcionamiento requiere un ROM de Super Mario Bros. NES que el usuario debe aportar, con las implicaciones legales que ello conlleva.
- Sin datos de sesgos, alucinación o multilingüismo: son categorías no aplicables a este artefacto, pero tampoco se documenta robustez frente a perturbaciones del entorno.
- Tamaño de repo de 0.0 GB reportado por Hugging Face: puede reflejar un artefacto muy pequeño o un problema de recuento; no verificable con la información disponible.
- Fecha de creación futura (2026-11-20) en los metadatos: inconsistencia temporal que conviene tener en cuenta al citar el recurso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level2-1
- Colección GradLab SuperMarioBros-Nes-v0: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
- Repositorio GradLab (instalación): https://github.com/tsilva/gradlab#install
- Informe de entrenamiento (receta por niveles, nivel 2-1): https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level2-1--2026-11-13
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-f4352ce3ca1bc537393d49074020b040/checkpoints/7012352-fa509e1b0a933c8377861e373aeaf3e31a77195f79009108297a52e9bf6f072e/manifest.json
