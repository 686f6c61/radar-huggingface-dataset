# UFACTORY-Developer/ufactory_genesis_rl

## Resumen

UFACTORY Genesis RL es una colección de checkpoints de políticas de aprendizaje por refuerzo preentrenadas, publicada por UFACTORY-Developer, para cinco manipuladores robóticos de la familia UFACTORY (`xarm5`, `xarm6`, `xarm7`, `uf850` y `lite6`). No se trata de un modelo de lenguaje, sino de políticas entrenadas con PPO (de la librería `rsl-rl`) sobre el simulador Genesis, orientadas a la tarea de alcanzar objetivos (target reaching) con el brazo desnudo, es decir, llevar el TCP del flange a una pose objetivo dentro del espacio de trabajo del robot.

El repositorio resuelve un problema práctico habitual en robótica: disponer de políticas base validadas cuantitativamente que sirvan como punto de partida para tareas de manipulación más complejas (pick and place, inserción, etc.) sin tener que reentrenar desde cero. Cada checkpoint se distribuye como un fichero `.pt` con una red MLP pequeña (capas de 256, 256 y 128 neuronas), lo que hace la inferencia trivialmente ejecutable incluso en CPU.

Su relevancia actual radica en la combinación de Genesis (simulador de física de nueva generación) con rsl-rl y robots reales comerciales de bajo coste, junto con una validación en holdout documentada con tasas de éxito superiores al 99 % en los cinco brazos. La licencia MIT permite su uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP [256, 256, 128] con activación ELU y distribución Beta (política PPO) |
| Parametros totales | no disponible (orden de ~10^5, MLP pequeño) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); observación de 21-27 dimensiones según robot |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (checkpoints de rsl-rl) |

## Arquitectura y entrenamiento

Cada política es un perceptrón multicapa con tres capas ocultas de 256, 256 y 128 neuronas y activación ELU, cuya salida parametriza una distribución Beta sobre incrementos normalizados de posición articular (rango `[-1, 1]`, mapeado a un máximo de 0.01 rad por paso). Las dimensiones de observación y acción dependen del robot: por ejemplo, `xarm5` usa 21 observaciones y 5 acciones (5 GDL), mientras que `xarm7` usa 27 observaciones y 7 acciones (7 GDL).

El entrenamiento se realizó con el algoritmo PPO de la librería `rsl-rl` sobre el simulador Genesis, con 4096 entornos paralelos, 300 iteraciones y semilla fija 7. La tarea de entrenamiento (reach) parte de una pose inicial del flange TCP de (300, 0, 300) mm con RPY (180°, 0°, 0°), con un criterio de éxito estricto de distancia terminal inferior a 5 mm, un horizonte de episodio de 5 segundos y una tasa de control de 50 Hz (pasos de 20 ms). No hay indicios de destilación de demostraciones ni de aprendizaje por imitación: es RL puro desde cero.

## Capacidades

- Politica de alcance (target reaching) para 5 manipuladores UFACTORY: `xarm5` (5 GDL), `xarm6` (6 GDL), `xarm7` (7 GDL), `uf850` (6 GDL) y `lite6` (6 GDL).
- Precisión terminal media de 4,2-4,7 mm en validación holdout, dentro del umbral de éxito estricto de 5 mm.
- Tasa de éxito del 99,2 % al 100 % en dos semillas de holdout independientes (17000 y 17001, 512 objetivos aleatorios cada una).
- Control a 50 Hz con incrementos articulares normalizados, adecuado para bucles de control en tiempo real.
- Visualización en tiempo real con renderizado GLB (una o varias simulaciones en paralelo, hasta 4 brazos con `-b 4`).
- Evaluación cuantitativa reproducible mediante script, con exportación de métricas a JSON.
- No tiene capacidades de lenguaje, visión ni tool calling: es una política de control motor puro.

## Casos de uso

- Punto de partida para fine-tuning de políticas de manipulación: se puede partir del checkpoint de reach y continuar el entrenamiento con PPO para tareas más complejas (agarre, inserción, empuje), aprovechando que la política ya domina el control básico del brazo.
- Validación de simuladores y pipelines de sim-to-real: el criterio de éxito estricto (< 5 mm) y los scripts de evaluación con semillas fijas permiten usar estos checkpoints como referencia para calibrar la fidelidad de Genesis o comparar simuladores.
- Docencia e investigación en RL robótico: el repositorio incluye guías en inglés y chino, semillas documentadas y dimensiones de observación/acción explícitas, ideal para cursos o reproducción de experimentos.
- Benchmarking de hardware de control: con un MLP de menos de 200.000 parámetros y control a 50 Hz, la inferencia corre en CPU, útil para probar latencias de bucle de control en robots reales o embebidos.
- Desarrollo de aplicaciones con brazos UFACTORY: integración directa con los robots `xarm5` a `xarm7`, `uf850` y `lite6` para tareas de posicionamiento de herramienta (por ejemplo, acercar el extremo a una pieza antes de una operación de ensamblado o inspección).
- Experimentación multi-robot: el script de visualización admite hasta 4 brazos en paralelo, útil para estudiar coordinación o simplemente acelerar la inspección visual de políticas.
- Generación de datasets sintéticos: la política puede usarse para generar trayectorias de alcance variadas (512 objetivos aleatorios por evaluación) como datos de partida para otros aprendizajes.

## Benchmarks y rendimiento

Resultados de validación en dos semillas holdout independientes (17000 y 17001, 512 objetivos aleatorios cada una), publicados por el autor:

| Robot | GDL | Obs / Act | Checkpoint | Tasa de éxito (17000 / 17001) | Distancia terminal media (17000 / 17001) |
|---|---:|---:|---|---|---|
| `xarm5` | 5 | 21 / 5 | `model_299.pt` | 99,6 % / 99,8 % | 4,48 / 4,50 mm |
| `xarm6` | 6 | 24 / 6 | `model_299.pt` | 100 % / 100 % | 4,23 / 4,24 mm |
| `xarm7` | 7 | 27 / 7 | `model_299.pt` | 99,8 % / 99,2 % | 4,39 / 4,52 mm |
| `uf850` | 6 | 24 / 6 | `model_299.pt` | 99,6 % / 99,6 % | 4,26 / 4,34 mm |
| `lite6` | 6 | 24 / 6 | `model_299.pt` | 99,8 % / 99,6 % | 4,66 / 4,71 mm |

No se han publicado comparaciones con otras políticas de reach de terceros en la información disponible.

## Requisitos de hardware

- La inferencia es muy ligera: una MLP de tres capas (256-256-128) se ejecuta sin problema en CPU; no se requiere GPU para desplegar la política.
- Para entrenamiento o fine-tuning con PPO (4096 entornos paralelos en Genesis), se recomienda una GPU de gama alta tipo RTX 4090, A100 o superior; no se publican tiempos de entrenamiento.
- Cabe en cualquier GPU de consumo; incluso una GPU integrada o solo CPU es suficiente para visualización e inferencia.
- Despliegue: el modelo se consume desde el repositorio `ufactory_genesis` mediante `hf download` y los módulos `examples.rl.reach.visualize` y `examples.rl.reach.evaluate`. No aplica vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- Latencia: el bucle de control opera a 50 Hz (pasos de 20 ms); no se publican mediciones de latencia de inferencia específicas.

## Comparativa con modelos similares

| Modelo / repositorio | Tarea | Algoritmo | Simulador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UFACTORY Genesis RL (este) | Reach para 5 brazos UFACTORY | PPO (rsl-rl) | Genesis | MIT | Checkpoints públicos en HuggingFace |
| Isaac Lab (NVIDIA) | Manipulación y locomoción | PPO y otros (rl_games, RSL-RL) | Isaac Sim / Isaac Lab | BSD-3 (framework) | Código abierto, checkpoints según tarea |
| ManiSkill (Hillbot) | Manipulación general | PPO, SAC, BC, etc. | SAPIEN | Apache 2.0 (código) | Código y benchmarks públicos |

Nota: la comparativa es aproximada por categoría (políticas de RL para manipulación); no hay checkpoints equivalentes uno a uno con validación holdout publicada en la información disponible.

## Limitaciones y advertencias

- Alcance limitado a la tarea de reach con brazo desnudo: las políticas no agarran objetos ni realizan manipulación; sirven como base, no como solución final.
- Validación solo en simulación (Genesis): no se documenta transferencia a robots reales (sim-to-real); el rendimiento en hardware físico puede degradarse por fricción, ruido de sensores y dinámicas no modeladas.
- Espacio de trabajo restringido: los objetivos se evalúan en cajas concretas (por ejemplo, x 0,15-0,55 m, y -0,30-0,30 m, z 0,05-0,50 m para xarm5/6/7 y uf850; más reducida para lite6); fuera de ese volumen no hay garantías.
- La precisión media terminal (4,2-4,7 mm) está muy cerca del umbral de éxito de 5 mm: en aplicaciones que exijan submilímetro será necesario reentrenar o añadir control de refinamiento.
- Sin sesgos de lenguaje ni riesgo de alucinación aplicables (no es un modelo generativo de texto), aunque las políticas de RL pueden presentar comportamientos frágiles fuera de distribución.
- Licencia MIT: sin restricciones para uso comercial, pero sin garantía alguna; verificar requisitos de seguridad al desplegar en robots físicos.
- Repositorio muy reciente y con 0 descargas registradas: escaso historial de uso comunitario y sin issues consolidados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UFACTORY-Developer/ufactory_genesis_rl
- Repositorio de código `ufactory_genesis`: https://github.com/xArm-Developer/ufactory_genesis
- Guía de la tarea reach (inglés): https://github.com/xArm-Developer/ufactory_genesis/blob/main/examples/rl/reach/README.md
- Guía de la tarea reach (chino): https://github.com/xArm-Developer/ufactory_genesis/blob/main/examples/rl/reach/README_zh.md
- Simulador Genesis: https://github.com/Genesis-Embodied-AI/Genesis
