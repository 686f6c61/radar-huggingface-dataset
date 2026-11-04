# spoindo/connectailab-rl-spoindo-v1-link01-walk-ppo

## Resumen

`connectailab-rl-spoindo-v1-link01-walk-ppo` es un agente de aprendizaje por refuerzo entrenado con PPO (Proximal Policy Optimization) mediante la librería Stable-Baselines3 para controlar la locomoción bípeda del robot LINK-01 dentro del entorno `Link01Walk-v0` (link01-gym, sobre el simulador MuJoCo). No es un modelo de lenguaje ni un transformer generativo: es una política neuronal que mapea observaciones de 51 dimensiones a 14 acciones de control articular, entrenada desde cero sin demostraciones ni recompensas densas externas.

El modelo forma parte del programa educativo AI CITY BUILDERS (curso de refuerzo, 7.ª sesión) y de la iniciativa CONNECT AI LAB. Su relevancia es fundamentalmente pedagógica y experimental: documenta un pipeline completo de RL aplicado a robótica (entorno, entrenamiento, normalización de observaciones y exportación de política) y demuestra que un agente puede completar episodios de 20 segundos sin caerse, si bien con un desplazamiento efectivo mínimo (0,021 m por episodio).

El entrenamiento se realizó en 300 000 pasos durante 16,05 minutos, con una tasa de aprendizaje de 3e-4 y un clip range de 0,2. Los resultados publicados en la model card son modestos en términos de velocidad (0,0011 m/s) pero destacan por la ausencia total de caídas, lo que indica que la política aprendió a mantenerse en pie de forma estable aunque apenas avance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (actor-crítico) entrenada con PPO; arquitectura interna exacta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); observación de 51 dimensiones por paso |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (Stable-Baselines3), `vecnormalize.pkl`, `actor.json` |

## Arquitectura y entrenamiento

El agente sigue el paradigma estándar de actor-crítico de PPO implementado en Stable-Baselines3. La política recibe un vector de observación de 51 dimensiones y emite 14 acciones continuas correspondientes a las articulaciones del robot bípedo LINK-01, con una postura base fijada en ±0,18 rad. El entorno `Link01Walk-v0` está construido sobre MuJoCo y pertenece al paquete link01-gym. No se especifica en la información disponible el número de capas ni de neuronas ocultas de las redes de actor y crítico.

El entrenamiento se ejecutó durante 300 000 pasos con una tasa de aprendizaje de 3e-4 y un clip range de 0,2, completándose en 16,05 minutos. Se incluye un fichero `vecnormalize.pkl`, lo que indica que se aplicó normalización de observaciones y recompensas durante el entrenamiento, un paso crítico para la estabilidad del aprendizaje en tareas de control continuo. No se documenta el uso de recompensas conformadas específicas, curriculum learning ni técnicas adicionales como domain randomization o decodificación especulativa (no aplicable en este dominio).

## Capacidades

- Control de locomoción bípeda en simulación: genera comandos articulares continuos para mantener el equilibrio del robot LINK-01.
- Estabilidad postural: 0 caídas por minuto en las pruebas declaradas (5 episodios de 20 segundos).
- Desplazamiento hacia delante: capacidad de avance limitada, con 0,021 m por episodio de 20 s.
- Integración con Stable-Baselines3: la política puede cargarse con `PPO.load()` y ejecutarse sobre el entorno link01-gym.
- Exportación de política: el fichero `actor.json` permite extraer la red del actor para despliegue fuera de Python o para inspección.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento extendido (no aplica a un agente de RL).

## Casos de uso

- Docencia de aprendizaje por refuerzo: el modelo sirve como referencia reproducible de un pipeline PPO completo (entorno, entrenamiento, normalización y exportación) en un curso introductorio de RL aplicado a robótica.
- Investigación en locomoción bípeda: como baseline de estabilidad (0 caídas/min) frente al cual comparar políticas con mayor velocidad o distancia recorrida.
- Pruebas de integración de link01-gym y MuJoCo: validar que el entorno `Link01Walk-v0` se comporta correctamente con una política conocida antes de entrenar variantes.
- Desarrollo de recompensas conformadas: usar el agente como punto de partida para experimentar con funciones de recompensa que incrementen la velocidad sin sacrificar la estabilidad.
- Evaluación de normalización de observaciones: analizar el efecto de `vecnormalize.pkl` sobre la robustez de la política en distintos episodios.
- Despliegue en pipelines de simulación a pequeña escala: ejecutar la política en bucles de evaluación automatizados (5 episodios × 20 s) para generar métricas de referencia en CI.
- Estudio de transferencia sim-a-real: aunque no se documenta transferencia al robot físico, el modelo puede emplearse como caso de estudio inicial de las dificultades de trasladar políticas PPO de MuJoCo a hardware real.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (no verificados):

| Métrica | Valor | Entorno / protocolo |
|---|---|---|
| Distancia por episodio de 20 s | 0,021 m | `Link01Walk-v0`, comando 0,18 m/s, 5 episodios × 20 s |
| Velocidad media de avance | 0,0011 m/s | `Link01Walk-v0`, comando 0,18 m/s, 5 episodios × 20 s |
| Caídas por minuto | 0,0 | `Link01Walk-v0`, comando 0,18 m/s, 5 episodios × 20 s |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a un agente de control motor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño típico de una política PPO para 51 observaciones y 14 acciones, el modelo cabe holgadamente en cualquier GPU consumer, aunque no se especifica la cifra exacta.
- GPU recomendadas: no disponible; para inferencia de una política de este tamaño, una GPU integrada o incluso CPU es suficiente.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU moderna (RTX 3060 o superior) e incluso en CPU, dado el reducido tamaño de la red; no se confirma en la información disponible.
- Opciones de despliegue: Stable-Baselines3 (`PPO.load()`), exportación vía `actor.json` a otros runtimes, y ejecución sobre MuJoCo con link01-gym.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros agentes de RL comparables sobre el mismo entorno (`Link01Walk-v0`) ni referencias a políticas PPO alternativas para el robot LINK-01. Como referencia genérica de categoría, los agentes PPO de Stable-Baselines3 para MuJoCo (p. ej., los de los entornos `HalfCheetah` o `Walker2d` de Gymnasium) comparten metodología, pero no se dispone de datos comparativos publicados en esta ficha.

## Limitaciones y advertencias

- Rendimiento de locomoción muy limitado: 0,021 m por episodio de 20 s y 0,0011 m/s, muy por debajo del comando de 0,18 m/s especificado en el entorno.
- Los resultados declarados en el model-index están marcados como no verificados (`verified: false`); deben tomarse como cifras del autor.
- La model card está redactada mayoritariamente en coreano; no hay documentación en castellano ni en inglés.
- No se especifica la licencia, por lo que el uso comercial queda sin autorización explícita y debe consultarse con el autor.
- El repositorio tiene un tamaño de 0,0 GB y 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un modelo recién publicado y sin validación externa.
- No se documentan sesgos (no aplica en el sentido de sesgos sociales), pero sí un posible sobreajuste al entorno simulado: no hay evidencia de transferencia al robot físico.
- El agente solo ha sido evaluado en 5 episodios de 20 segundos; la robustez frente a perturbaciones, cambios de terreno o comandos de velocidad distintos no está documentada.
- No es un modelo de lenguaje: no debe emplearse para generación de texto, código, visión ni tareas de NLP.
- Riesgo de alucinación: no aplica en el sentido habitual; el riesgo equivalente es la extrapolación de la política fuera de la distribución de observaciones vistas durante el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/spoindo/connectailab-rl-spoindo-v1-link01-walk-ppo
- Stable-Baselines3 (librería de entrenamiento): https://github.com/DLR-RM/stable-baselines3
- MuJoCo (simulador): https://mujoco.org/
- PPO (paper original de Schulman et al.): https://arxiv.org/abs/1707.06347
- No se han encontrado en la información disponible enlaces al repositorio link01-gym, al curso AI CITY BUILDERS ni a CONNECT AI LAB.
