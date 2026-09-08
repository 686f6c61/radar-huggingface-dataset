# XenderYang/microduck-rl-ydx-walk

## Resumen

El modelo `microduck-rl-ydx-walk`, desarrollado por XenderYang, es una política de control para el robot bípedo MicroDuck, entrenada mediante aprendizaje por refuerzo (PPO) en el entorno `Mjlab-Velocity-Flat-MicroDuck` de MuJoCo. Resuelve el problema de mantener el equilibrio y desplazarse sobre terreno plano siguiendo una consigna de velocidad. Se basa en el proyecto open source `pollen-robotics/microduck` y en su framework de entrenamiento `microduck_rl`.

La política se entrenó con 4096 entornos paralelos y 6000 iteraciones de PPO en una NVIDIA RTX 5090, con una duración total de aproximadamente 1 hora y 59 minutos. El resultado se distribuye en formato PyTorch (`.pt`) y ONNX, con un contrato de entrada `[1, 61]` y salida `[1, 14]`, y el normalizador de observaciones integrado en el export.

Este modelo no es un modelo de lenguaje: se trata de un baseline intermedio para control robótico, pensado para investigadores que necesitan una referencia reproducible en tareas de marcha bípeda y para evaluar algoritmos de RL en el ecosistema MicroDuck.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control continuo (entrada `[1, 61]`, salida `[1, 14]`) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de control, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`) y ONNX (`.onnx`) |
| Pipeline | reinforcement-learning |
| Librería | mjlab |

## Arquitectura y entrenamiento

La arquitectura interna de la red no se especifica en la información disponible. Lo que se conoce es el contrato de entrada y salida del ONNX: `[1, 61]` observaciones (que incluyen el estado del robot, consignas de velocidad y el normalizador integrado) y `[1, 14]` acciones de control continuo para las articulaciones. El modelo está entrenado con PPO (Proximal Policy Optimization) sobre el entorno `Mjlab-Velocity-Flat-MicroDuck`.

El entrenamiento se ejecutó con MuJoCo Warp en 4096 entornos paralelos durante 6000 iteraciones. La duración total fue de ~1 h 59 min en una NVIDIA RTX 5090. Las métricas de entrenamiento reportadas son una recompensa media de ~81.5 y una duración media de episodio de ~919.9, sin presencia de NaN. El export a ONNX incluye el normalizador de observaciones, lo que permite usar el modelo directamente sin preprocesado externo. La configuración completa de entrenamiento se distribuye en `params/agent.yaml`, `params/env.yaml` y la diferencia respecto al repositorio upstream en `microduck_rl.diff`.

## Capacidades

- Control de marcha bípeda sobre terreno plano mediante seguimiento de velocidad de consigna (velocity tracking).
- Ejecución en entornos de simulación MuJoCo (`Mjlab-Velocity-Flat-MicroDuck`) para entrenamiento y evaluación.
- Exportación a ONNX con normalizador de observaciones integrado, lista para inferencia en tiempo real.
- Estabilidad en entrenamiento: recompensa media de ~81.5, duración media de episodio de ~919.9 y ausencia de NaN.
- No soporta generación de texto, razonamiento simbólico, tool calling, agentes ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Investigación en control de bipedos: usar el checkpoint `.pt` como baseline reproducible para comparar nuevos algoritmos de RL en el entorno de MuJoCo, gracias a la configuración incluida en `params/`.
- Desarrollo de controladores para robots de bajo coste: aprovechar el ONNX ligero (61 entradas, 14 salidas) para desplegar la política en sistemas embebidos o microcontroladores con soporte ONNX Runtime.
- Prototipado de control en simulación: cargar el modelo en MuJoCo para validar estrategias de marcha antes de pasar a hardware físico, reduciendo el coste de pruebas.
- Fine-tuning de políticas de marcha: el checkpoint de PyTorch permite continuar el entrenamiento con PPO para adaptar la política a nuevas condiciones de terreno, velocidades o características del robot.
- Educación en aprendizaje por refuerzo: analizar el diff `microduck_rl.diff` y los ficheros de configuración permite entender el pipeline completo de entrenamiento de un agente PPO con MuJoCo Warp.
- Benchmarking de infraestructura RL: el registro del entrenamiento (4096 entornos paralelos en ~2 horas en una RTX 5090) sirve como caso de estudio para medir el rendimiento de frameworks como mjlab en entorno de alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar en la información disponible. El autor únicamente reporta métricas de entrenamiento, que se presentan a continuación y no deben interpretarse como comparativas con otros modelos.

| Métrica | Valor |
|---|---|
| Recompensa media | ~81.5 |
| Duración media del episodio | ~919.9 |
| Entornos paralelos | 4096 |
| Iteraciones de PPO | 6000 |
| Tiempo de entrenamiento (RTX 5090) | ~1 h 59 min |

## Requisitos de hardware

- Entrenamiento: se realizó en una NVIDIA RTX 5090 durante ~1 h 59 min con 4096 entornos paralelos.
- Inferencia ONNX: el modelo es extremadamente ligero (entrada `[1, 61]`, salida `[1, 14]`), por lo que puede ejecutarse en CPU o GPU mediante ONNX Runtime.
- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendada: no se requieren GPUs para inferencia; para entrenamiento se usó una RTX 5090.
- Opciones de despliegue: ONNX Runtime, MuJoCo, y cualquier entorno Python que cargue los pesos PyTorch con `torch.load`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos comparables en la información proporcionada. El propio autor indica que este baseline es inferior en seguimiento de velocidad en línea recta al controlador oficial `alpha_walking` del proyecto microduck, pero no se aportan datos cuantitativos de esa comparación.

## Limitaciones y advertencias

- Es un baseline intermedio: la estabilidad en marcha es aceptable, pero el seguimiento de velocidad en línea recta es más débil que el controlador oficial `alpha_walking`.
- No es un modelo de lenguaje: no genera texto, no procesa lenguaje natural, no soporta tool calling ni agentes conversacionales.
- Solo cubre la tarea de marcha en terreno plano (`Mjlab-Velocity-Flat-MicroDuck`); no incluye terrenos irregulares, escaleras, obstáculos ni otros escenarios.
- No se proporcionan métricas de robustez, sesgos ni alucinaciones, ya que no es un modelo generativo.
- La licencia Apache-2.0 permite uso comercial, pero es necesario conservar el aviso de licencia y la atribución en redistribuciones.

## Enlaces

- HuggingFace: https://huggingface.co/XenderYang/microduck-rl-ydx-walk
- Repositorio upstream (hardware): https://github.com/pollen-robotics/microduck
- Repositorio upstream (RL): https://github.com/pollen-robotics/microduck_rl
