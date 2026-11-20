# tsilva/SuperMarioBros-Nes-v0_Level7-2

## Resumen

SuperMarioBros-Nes-v0_Level7-2 es una política de aprendizaje por refuerzo entrenada desde cero para superar el nivel 7-2 del entorno `SuperMarioBros-Nes-v0`, una implementación del clásico Super Mario Bros. de NES utilizada como banco de pruebas de RL. El modelo lo publica el usuario tsilva bajo el identificador `tsilva/SuperMarioBros-Nes-v0_Level7-2` y se distribuye como un bundle de GradLab, la librería con la que se entrenó y con la que debe ejecutarse.

No se trata de un modelo de lenguaje ni de un transformer generativo: es un agente de control entrenado con PPO (Proximal Policy Optimization) combinado con SIL (Self-Imitation Learning), empaquetado en un fichero `model.zip` junto con metadatos del checkpoint y la receta de entrenamiento ejecutada. Su relevancia es acotada y experimental: sirve como referencia reproducible de un agente que completa un nivel concreto de un videojuego, no como componente para aplicaciones de propósito general.

El repositorio tiene un tamaño de 0.0 GB, no registra descargas ni likes en el momento de la consulta, y no declara licencia ni idiomas soportados. La información disponible se limita a la model card del autor y a los enlaces de procedencia que esta incluye.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO + SIL) sobre el entorno `SuperMarioBros-Nes-v0`; arquitectura de red no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de RL sobre observaciones del entorno, no modelo de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (bundle GradLab), acompañado de `model.json` y `recipe.json` |

## Arquitectura y entrenamiento

La política se entrenó desde cero con PPO combinado con SIL en GradLab, sobre el entorno `SuperMarioBros-Nes-v0`, con el objetivo de completar el nivel 7-2 desde el inicio canónico del nivel. El entrenamiento acumuló 7.434.240 transiciones de entorno en una única ejecución con semilla `1801`, y el checkpoint publicado corresponde al run `gradlab-b5eea8d6531ee188a5e8a5785f7872a5`, checkpoint `checkpoint-7434240-c10f70e9d693fa3c`.

La model card no detalla la topología de la red (capas, tamaños, función de activación), la composición de las observaciones ni los hiperparámetros de PPO o SIL más allá de lo indicado. Tampoco se especifica si hubo preprocesamiento de recompensas, reward shaping o currículo de entrenamiento. El bundle incluye la receta ejecutada (`recipe.json`), que es la fuente autorizada para reconstruir la configuración exacta.

## Capacidades

- Control de un agente en el entorno `SuperMarioBros-Nes-v0` para el nivel 7-2, arrancando desde el inicio canónico del nivel.
- Superación del nivel con una tasa reportada de 95/100 episodios en los últimos 100 episodios de entrenamiento.
- Ejecución mediante el comando `gradlab play` de la librería GradLab, que requiere aportar una ROM de Super Mario Bros. NES compatible.
- No soporta tool calling, function calling, razonamiento multi-paso genérico, generación de texto, código, matemáticas, visión ni audio.
- No es multilingüe: no procesa lenguaje natural.
- No dispone de modo thinking ni de capacidades de agente más allá de la política de control entrenada.

## Casos de uso

- Reproducción de resultados de RL: ejecutar el checkpoint con `gradlab play` y una ROM propia para verificar la tasa de superación del nivel 7-2 reportada por el autor (95/100 en los últimos 100 episodios de entrenamiento).
- Referencia de línea base en investigación de RL sobre videojuegos: comparar nuevas recetas de PPO o SIL contra esta política en el mismo nivel y entorno, usando la misma semilla y condiciones de evaluación.
- Estudio de recetas de entrenamiento: inspeccionar `recipe.json` y `model.json` para analizar la configuración de PPO + SIL empleada y las transiciones consumidas (7.434.240) hasta alcanzar el rendimiento publicado.
- Docencia y divulgación de RL: demostrar un agente que completa un nivel concreto de NES, con métricas de clears acumulados (5.458/13.484) y por ventana reciente.
- Pruebas de integración de GradLab: validar la instalación de la librería y el flujo de carga de políticas desde Hugging Face (`hf://tsilva/SuperMarioBros-Nes-v0_Level7-2`).
- Evaluación de robustez de políticas: medir la variabilidad de la tasa de éxito en episodios independientes, dado que la model card indica que la evaluación de aceptación independiente no está disponible.

## Benchmarks y rendimiento

| Metrica | Valor en el checkpoint publicado |
|---|---|
| Episodios superados en los últimos 100 de entrenamiento | 95 / 100 |
| Episodios superados acumulados en entrenamiento | 5.458 / 13.484 |
| Transiciones de entorno | 7.434.240 |
| Evaluación de aceptación independiente | No disponible |

No se han publicado resultados de benchmarks comparativos con otros agentes en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y no se detalla la topología de la red, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el bundle es pequeño (0.0 GB), lo que sugiere que la inferencia podría ejecutarse en CPU, pero no se aporta confirmación.
- Opciones de despliegue: GradLab mediante `gradlab play 'hf://tsilva/SuperMarioBros-Nes-v0_Level7-2' --rom-path /path/to/SuperMarioBros.nes`. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.
- Requisito adicional: es necesario aportar una ROM de Super Mario Bros. NES compatible, que el usuario debe obtener por su cuenta.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno / tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tsilva/SuperMarioBros-Nes-v0_Level7-2 | Política RL (PPO + SIL) | Nivel 7-2 de `SuperMarioBros-Nes-v0` | no disponible | no aplica | no disponible | Hugging Face, bundle GradLab |
| Otras políticas de la colección GradLab SuperMarioBros-Nes-v0 | Políticas RL por nivel | Niveles concretos del mismo entorno | no disponible | no aplica | no disponible | Colección de Hugging Face del mismo autor |
| Agentes RL genéricos para Atari/NES (referencias externas) | Políticas RL | Varios juegos | no disponible | no aplica | variable | no disponible en la información proporcionada |

No se dispone de datos de rendimiento de las alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Ámbito muy restringido: la política está entrenada específicamente para el nivel 7-2 desde el inicio canónico; no se garantiza su comportamiento en otros niveles, en arranques distintos o con variaciones del entorno.
- Ausencia de evaluación independiente: la model card indica explícitamente que la evaluación de aceptación independiente no está disponible; las métricas de éxito provienen del propio entrenamiento.
- Sesgo de selección de checkpoint: la tasa de 95/100 corresponde a los últimos 100 episodios de una única ejecución con semilla `1801`, no a una media sobre múltiples semillas.
- Licencia no declarada: no se especifica licencia, lo que impide determinar condiciones de uso comercial o de redistribución.
- Dependencia de una ROM de propietario: la ejecución requiere una ROM de Super Mario Bros. NES que el usuario debe aportar; la legalidad de su obtención y uso es responsabilidad del usuario.
- Dependencia de GradLab: el artefacto está empaquetado como bundle de GradLab (`model.zip`, `model.json`, `recipe.json`) y no como pesos en safetensors o GGUF; no es portable a otros runtimes sin trabajo adicional.
- Sin soporte de lenguaje natural, tool calling ni agentes multi-paso: no debe evaluarse como un modelo de propósito general.
- Riesgo de sobreajuste al entorno: al tratarse de una política entrenada sobre un único nivel y una única semilla, la generalización a ligeras modificaciones del entorno no está documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level7-2
- Informe de entrenamiento (nivel 7-2): https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level7-2--2026-11-18
- Instalación de GradLab: https://github.com/tsilva/gradlab#install
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-b5eea8d6531ee188a5e8a5785f7872a5/checkpoints/7434240-c10f70e9d693fa3c4876adb1ce243c0d239978c1453630c980cb28b10e51b91f/manifest.json
- Colección Mario en Hugging Face: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
