# zengyh29/g1-beatit-sysid-v0.6

## Resumen

`g1-beatit-sysid-v0.6` es un checkpoint de investigación publicado por el usuario zengyh29 (JHU-AllianceLab) que implementa la política de recuperación de emergencia (fallback) y el modelo de mundo híbrido del filtro de seguridad Beat-It para el robot humanoide Unitree G1. No es un modelo de lenguaje: es un artefacto de aprendizaje por refuerzo seguro (safe RL) orientado a robótica, empaquetado para la librería mjlab y entrenado sobre el modelo identificado `G1-robot-model-with-SysID` v0.6.0.

El sistema combina una red neuronal que predice el estado corporal con un modelo térmico analítico (SysID) que estima las temperaturas de devanado, carcasa y estructura de cada uno de los 29 motores. Cada paso de control (50 Hz, dt 0,02 s) el modelo de mundo imagina un horizonte de 1 s (50 pasos) y, si el margen predicho cae por debajo de 0,488, el filtro rechaza la acción propuesta por la política de tarea y activa esta política de recuperación.

Es relevante porque documenta de forma reproducible un mecanismo de filtrado de seguridad con restricciones térmicas y de caída en un humanoide realista, e incluye calibración conformal del error del modelo de mundo. El repositorio tiene 0 descargas y 0 likes, tamaño 0,0 GB y licencia "other" no especificada en detalle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de mundo híbrido: red neuronal (predicción de estado corporal) + modelo térmico analítico SysID; política actor-crítico SHAC (safety_sb3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; horizonte de predicción de 50 pasos (1 s a 50 Hz) |
| Tipos de cuantizacion | no disponible (checkpoint `.zip` de stable-baselines3, no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other (términos no detallados en la model card) |
| Formato de pesos | `final_model.zip` (checkpoint safety_sb3 con actor, crítico y modelo de mundo, incluye estados de optimizador); normalizador en `tensornormalize.pt`; configuración en `config.yaml`; metadatos en `g1_sysid.json` y `min_tube.json` |

## Arquitectura y entrenamiento

La política de fallback es un actor SHAC (safety SHAC) entrenado con `safety-stable-baselines` sobre el simulador MuJoCo/mujoco-warp con mjlab. El actor recibe 127 dimensiones de observación, incluidas las 29 temperaturas de devanado, y emite 29 objetivos de posición articular con la escala de acción de mjlab G1. El modelo de mundo opera sobre un estado de 200 dimensiones que combina propiocepción, términos privilegiados (velocidad lineal de la base, alturas de pies, contactos y fuerzas, temperaturas de devanado, carcasa y estructura) y un contexto de simulación de 33 dimensiones (offsets de centro de masa, fricción de pies, sesgos de encoder).

La parte híbrida es clave: la red neuronal predice el estado corporal y el modelo térmico analítico SysID predice las temperaturas de cada motor. El margen de seguridad es `min(margen de caída, (70 − devanado más caliente) / 10)`. El entrenamiento se realizó con 1.500 millones de pasos de entorno y semilla 1, sobre la tarea `g1_recover_thermal70_v6`, en la que el robot debe recuperarse en 3 s tras empujones horizontales de hasta 5 m/s; un episodio falla por caída (inclinación o contacto no podal) o si cualquier devanado alcanza 70 °C. Las temperaturas iniciales se muestrean por robot con un nivel ~U(30, 70) °C y cada devanado ~U(30, nivel). La calibración del límite del modelo de mundo a 1 s usa un tubo conformal con eps 0,225 al 95 % y 50 pasos, registrado en `min_tube.json`.

## Capacidades

- Recuperación de equilibrio del Unitree G1 tras perturbaciones: devuelve al robot a un estado estable en menos de 3 s ante empujones con |Δv| de hasta 5 m/s.
- Filtrado de seguridad en tiempo de control: evalúa cada acción propuesta por la política de tarea mediante una imaginación de 50 pasos y la rechaza si el margen predicho es inferior a 0,488.
- Predicción de estado corporal a corto plazo (1 s) con un modelo neuronal entrenado junto a la política.
- Predicción térmica por motor (devanado, carcasa y estructura) mediante el modelo analítico SysID, con restricción de 70 °C en el devanado más caliente.
- Gestión de arranques en caliente: el sistema modela estados iniciales con temperaturas elevadas y certifica seguridad solo cuando es posible dentro del horizonte.
- Integración con pipelines de entrenamiento SAILR + CoolMimic (variante híbrida v6, semilla 1).
- No soporta tool calling, agentes de texto, visión, audio ni capacidades multilingües: es un artefacto de control robótico.

## Casos de uso

- Capa de seguridad en entrenamiento de políticas de locomoción: durante el entrenamiento SAILR, el filtro Beat-It rechaza acciones del aprendiz que llevarían al robot a una caída o a sobrecalentamiento, terminando el episodio del aprendiz y preservando la integridad del proceso de aprendizaje.
- Recuperación tras perturbaciones externas en simulación: se usa como política de respaldo cuando la política de tarea propone una acción insegura ante empujones laterales de hasta 5 m/s, aprovechando su entrenamiento específico en la tarea `g1_recover_thermal70_v6`.
- Investigación en safe RL con restricciones térmicas: permite estudiar cómo un modelo de mundo híbrido (neuronal + analítico) impone límites de temperatura de devanado en un humanoide de 29 actuadores sin necesidad de hardware.
- Validación de modelos de mundo con calibración conformal: el par `final_model.zip` + `min_tube.json` sirve para reproducir experimentos de certificación de seguridad con eps conformal de 0,225 al 95 %.
- Benchmarking de filtros de seguridad en robótica: al fijar un umbral explícito (0,488) y un horizonte (50 pasos), permite comparar variantes de filtros y políticas de fallback bajo condiciones controladas.
- Docencia y reproducción de pipelines de robótica: el conjunto de cinco ficheros con hashes SHA-256 y versiones de código fijadas facilita la replicación exacta del entorno MuJoCo/mjlab en un clúster o estación de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta métricas de configuración (umbral 0,488, eps conformal 0,225, horizonte 50 pasos, 1.500 millones de pasos de entorno), no tasas de éxito ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0,0 GB y no se publica el número de parámetros; el actor es una red pequeña (entrada de 127 dimensiones, salida de 29), por lo que la inferencia del actor es ligera, pero el modelo de mundo (estado de 200 dimensiones más contexto de 33) requiere evaluación adicional.
- GPU recomendadas: no disponible. El entrenamiento se realizó con torch 2.14.1 (cu130), lo que implica soporte CUDA; no se especifican modelos de GPU.
- ¿Cabe en GPU de consumo? No confirmado. Por el tamaño reducido del artefacto es plausible, pero no se documenta.
- Opciones de despliegue: no se soporta vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje). El despliegue requiere el stack MuJoCo/mujoco-warp 3.16.0, warp-lang 1.19.0, mjlab 1.6.0 (commit dcdf6ce5), torch 2.14.1 (cu130), stable-baselines3 2.9.2 y gymnasium 1.4.0, junto con los repositorios `robot-safety-sandbox` (rama `feat/shac-thermal-mjc316-wm-filters`, commit 3bb9cf3), `safety-stable-baselines` (rama `feat/shac-hybrid-thermal`, commit acabd94) y `coolmimic` (rama `sailr-beatit`, commit c40c1b8).
- Latencia y throughput: no disponibles. El control opera a 50 Hz (dt 0,02 s), pero no se publican tiempos de inferencia del modelo de mundo ni del actor.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de filtros de seguridad o políticas de fallback para el Unitree G1 con restricciones térmicas y modelo de mundo híbrido.

## Limitaciones y advertencias

- Solo simulación: el modelo de mundo necesita estado privilegiado que el robot real no mide directamente (velocidad lineal de la base, contactos y fuerzas de pies, temperaturas de carcasa y estructura). El modelo térmico no se ha validado en hardware.
- Sin barrera de recorte de par durante el entrenamiento: el límite de 70 °C se impone únicamente mediante el margen y la terminación del episodio, no mediante un mecanismo de clipping de torque.
- Arranques en caliente: cuando todos los motores parten por encima de ~66 °C, pocos estados pueden certificarse como seguros dentro de 1 s.
- Carga "lenient": el loader intenta primero una comprobación estricta de procedencia contra la ejecución de calibración, que solo existe en el clúster de los autores; fuera de él falla y se cargan los mismos pesos directamente. Los autores verifican que ambas rutas dan pesos idénticos, horizonte 50 y cota de acción de fallback 3,0.
- Dependencia estricta de versiones de código y commits concretos: el modelo de mundo híbrido solo carga con las ramas y commits indicados.
- Licencia "other" sin términos detallados: no se especifican condiciones de uso comercial, redistribución ni atribución; es necesario contactar con el autor antes de cualquier uso en producción.
- Sin datos de sesgo, alucinación ni cobertura idiomática: no aplican al no ser un modelo de lenguaje, pero tampoco se documentan evaluaciones de robustez fuera de las condiciones de entrenamiento.
- Repositorio sin descargas ni likes y con fecha de creación futura (2026-11-24): trazabilidad y mantenimiento no garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zengyh29/g1-beatit-sysid-v0.6
- Repositorio `robot-safety-sandbox` (rama `feat/shac-thermal-mjc316-wm-filters`, commit 3bb9cf3): https://github.com/JHU-AllianceLab/robot-safety-sandbox
- Repositorio `safety-stable-baselines` (rama `feat/shac-hybrid-thermal`, commit acabd94): https://github.com/JHU-AllianceLab/safety-stable-baselines
- Repositorio `coolmimic` (rama `sailr-beatit`, commit c40c1b8): https://github.com/JHU-AllianceLab/coolmimic
- Modelo identificado `G1-robot-model-with-SysID` v0.6.0 (commit 4259dc6): no disponible la URL exacta en la información proporcionada
- Documentación de mjlab (commit dcdf6ce5): no disponible la URL exacta en la información proporcionada
