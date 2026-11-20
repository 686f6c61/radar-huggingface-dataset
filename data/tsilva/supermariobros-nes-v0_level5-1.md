# tsilva/SuperMarioBros-Nes-v0_Level5-1

## Resumen

`tsilva/SuperMarioBros-Nes-v0_Level5-1` es una política de aprendizaje por refuerzo entrenada desde cero con PPO (Proximal Policy Optimization) mediante el framework GradLab, cuyo objetivo es completar el nivel 5-1 del entorno `SuperMarioBros-Nes-v0`. No se trata de un modelo de lenguaje, sino de un agente que mapea observaciones del emulador de NES a acciones de control del personaje. Lo publica el usuario `tsilva` en Hugging Face con fecha de creación del 20 de noviembre de 2026.

El artefacto es un checkpoint concreto de una ejecución de entrenamiento identificada como `gradlab-f52c27c6655dcb4ef033b4fafca3c44a`, que produjo el checkpoint `checkpoint-6758400-fd3e845f26dc2e0b`. Según la model card, la política completa el nivel en 80 de las últimas 100 episodios de entrenamiento, con 5.296 despejes acumulados sobre 23.859 episodios y 6.758.400 transiciones de entorno. Estos datos provienen de una única ejecución con semilla `12` y no han sido validados por una evaluación de aceptación independiente.

Su relevancia es acotada: sirve como referencia reproducible de un pipeline de RL con PPO sobre un entorno de Atari/NES dentro de GradLab, y como ejemplo de política especializada en un único nivel. No es un modelo generalista ni sustituye a un LLM; su utilidad está en investigación de RL, docencia y reproducción de experimentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de RL entrenada con PPO (detalles de red no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (bundle de GradLab) con metadatos `model.json` y `recipe.json` |

## Arquitectura y entrenamiento

La información disponible indica únicamente que la política se entrenó desde cero con PPO en GradLab sobre el entorno `SuperMarioBros-Nes-v0`, partiendo siempre del inicio canónico del nivel 5-1. El bundle incluye la política (`model.zip`), los metadatos del checkpoint (`model.json`) y la receta ejecutada (`recipe.json`), pero la model card no detalla la topología de la red (capas convolucionales, tamaño de la capa oculta, función de valor, etc.), la composición del dataset de entrenamiento ni hiperparámetros como tasa de aprendizaje, factor de descuento o número de workers.

Los datos de entrenamiento publicados son: 6.758.400 transiciones de entorno, 23.859 episodios acumulados y 5.296 despejes totales durante el entrenamiento. La evaluación reportada se limita a las últimas 100 episodios de entrenamiento (80 despejes), sin evaluación independiente de aceptación. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos.

## Capacidades

- Control de un agente en el entorno `SuperMarioBros-Nes-v0`, limitado al nivel 5-1 desde el inicio canónico.
- Aprendizaje por refuerzo con PPO: la política selecciona acciones a partir de observaciones del emulador.
- Reproducibilidad parcial: el bundle incluye `recipe.json` y `model.json` para reconstruir la ejecución.
- No soporta tool calling ni function calling.
- No soporta agentes multi-step en el sentido de LLM; es un agente de RL de un solo entorno.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la observación del juego.

## Casos de uso

- Reproducción de experimentos de RL: cargar el checkpoint con `gradlab play` y un ROM propio de Super Mario Bros. NES para verificar el comportamiento reportado (80/100 despejes en las últimas 100 episodios de entrenamiento) y comparar con nuevas ejecuciones.
- Docencia en aprendizaje por refuerzo: usar la política como ejemplo práctico de PPO sobre un entorno NES, con la receta `recipe.json` como referencia de configuración.
- Punto de partida para fine-tuning: iniciar desde este checkpoint y entrenar variantes (por ejemplo, otros niveles o condiciones iniciales) reutilizando la receta de GradLab.
- Benchmark interno de frameworks de RL: comparar el rendimiento de GradLab frente a otras implementaciones (Stable-Baselines3, CleanRL) sobre el mismo entorno y semilla.
- Investigación en generalización: evaluar la política en inicios no canónicos del nivel 5-1 para medir su robustez, dado que el entrenamiento se realizó solo desde el inicio canónico.
- Análisis de estabilidad de PPO: estudiar la curva de despejes (5.296/23.859 acumulados) y la varianza entre episodios para investigar la estabilidad del algoritmo en entornos de NES.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Despejes en los últimos 100 episodios de entrenamiento | 80 / 100 |
| Despejes acumulados en entrenamiento | 5.296 / 23.859 |
| Transiciones de entorno | 6.758.400 |
| Evaluación de aceptación independiente | No disponible |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un artefacto muy pequeño (probablemente una red de política compacta).
- GPU recomendadas: no disponibles; para una política de RL de este tipo, una GPU consumer moderna (por ejemplo, RTX 3060 o superior) sería suficiente en inferencia, aunque no hay datos que lo confirmen.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del bundle, pero no está confirmado en la información disponible.
- Opciones de despliegue: GradLab (`gradlab play 'hf://tsilva/SuperMarioBros-Nes-v0_Level5-1' --rom-path /path/to/SuperMarioBros.nes`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Despejes reportados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tsilva/SuperMarioBros-Nes-v0_Level5-1` | SuperMarioBros-Nes-v0 (nivel 5-1) | PPO | 80/100 en los últimos 100 episodios de entrenamiento | no disponible | Hugging Face |
| Otros checkpoints de la colección `tsilva/gradlab-supermariobros-nes-v0` | SuperMarioBros-Nes-v0 (otros niveles) | PPO | no disponible en esta ficha | no disponible | Hugging Face (colección) |
| Políticas PPO de referencia en Stable-Baselines3 / CleanRL sobre Atari | Entornos Atari | PPO | no disponible | MIT (código) | GitHub |

No se dispone de datos comparativos de rendimiento entre este checkpoint y alternativas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política solo se ha entrenado y evaluado en el nivel 5-1 desde el inicio canónico; no hay evidencia de generalización a otros niveles, inicios alternativos o modificaciones del entorno.
- Evaluación no independiente: los 80/100 despejes provienen de las últimas 100 episodios de entrenamiento de una única ejecución con semilla `12`; no hay validación de aceptación independiente.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución del checkpoint.
- Dependencia de un ROM propietario: el uso requiere un ROM de Super Mario Bros. NES que el usuario debe aportar; la legalidad de su uso depende de la jurisdicción y de la posesión del cartucho original.
- Sin datos de sesgos, alucinación o rendimiento multilingüe: no aplican en el sentido habitual de LLM, pero tampoco se documentan sesgos de política (por ejemplo, preferencia por ciertas rutas o acciones).
- Tamaño del repositorio de 0,0 GB y ausencia de especificaciones de red: dificulta estimar requisitos de cómputo y reproducibilidad exacta sin inspeccionar el bundle.
- Fecha de creación futura (2026-11-20): conviene verificar la integridad y procedencia del artefacto antes de usarlo en producción o investigación.

## Enlaces

- Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level5-1
- Colección GradLab SuperMarioBros-Nes-v0: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
- Repositorio GradLab (instalación): https://github.com/tsilva/gradlab#install
- Informe de entrenamiento (nivel 5-1): https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level5-1--2026-11-16
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-f52c27c6655dcb4ef033b4fafca3c44a/checkpoints/6758400-fd3e845f26dc2e0b7d03ede9e1fbc50c021e58e092455acf8b94e3a39b5098d9/manifest.json
