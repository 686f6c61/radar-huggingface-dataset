# Zhutengjie/PBHC_adam

## Resumen

CLOT (Closed-Loop Global Motion Tracking) es un sistema de teleoperación para humanoides de cuerpo completo desarrollado por el AI Institute de la Shanghai Jiao Tong University y el Shanghai AI Laboratory. El repositorio `Zhutengjie/PBHC_adam` aloja los checkpoints del modelo entrenado para el robot Adam Pro, junto con el código oficial de entrenamiento y evaluación. El sistema aborda el problema del seguimiento de movimiento global en lazo cerrado, permitiendo que un robot humanoide replique movimientos humanos completos capturados por teleoperación.

El proyecto combina un framework de seguimiento de acción con propósito general dentro de un lazo cerrado global, un dataset de movimiento humano a gran escala (aproximadamente 10 horas de datos BVH), y políticas de imitación entrenadas con recompensas AMP (Adversarial Motion Priors). La arquitectura soporta tanto redes MLP como Transformer como backbone de la política, y el entrenamiento se realiza con aprendizaje por refuerzo paralelo multi-GPU. La relevancia actual del proyecto radica en que aborda uno de los retos abiertos en robótica humanoide: la transferencia robusta de movimientos humanos complejos a robots con dinámicas y morfologías diferentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer o MLP (seleccionable) con recompensas AMP |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de control robotico, no de texto) |
| Tipos de cuantizacion | no disponible (se exporta a ONNX para despliegue) |
| Idiomas soportados | no aplica (modelo de control motor, no de lenguaje) |
| Licencia | CC BY-NC 4.0 (uso no comercial) |
| Formato de pesos | PyTorch (.pt) y ONNX (exportado) |

## Arquitectura y entrenamiento

El sistema CLOT utiliza una política de control que puede configurarse con backbone Transformer o MLP, entrenada mediante aprendizaje por refuerzo (RL) con recompensas AMP. El discriminador AMP proporciona señales de recompensa que guían la política hacia comportamientos que imitan fielmente los movimientos humanos de referencia, mientras que el lazo cerrado global corrige errores de seguimiento acumulativos. El entrenamiento se realiza en paralelo sobre 8 GPUs NVIDIA RTX 4090 de 48 GB, utilizando el simulador MjLab como entorno principal, con soporte adicional para IsaacGym e IsaacSim.

El dataset de entrenamiento incluye aproximadamente 10 horas de movimiento humano capturado, almacenado en formato BVH con el sistema de coordenadas convertido a Z-up y X-forward. Los datos se retargetean a los robots Adam Pro y G1 siguiendo el formato ASAP. El código base se apoya en proyectos previos como ASAP, PBHC, BeyondMimic, mjlab, ProtoMotions y AMP, y el entrenamiento puede configurarse para usar solo MLP, MLP con AMP, o Transformer sin AMP.

## Capacidades

- Seguimiento de movimiento global en lazo cerrado para teleoperación de cuerpo completo.
- Imitación de movimientos humanos complejos en robots humanoides (Adam Pro y G1).
- Soporte de multiples simuladores: MjLab (principal), IsaacGym e IsaacSim.
- Entrenamiento RL paralelo multi-GPU para experimentos a gran escala.
- Recompensas AMP mediante discriminador adversarial para políticas de imitación.
- Exportacion a ONNX para despliegue en entornos MuJoCo.
- Evaluacion de checkpoints preentrenados incluidos en el repositorio.

## Casos de uso

- Teleoperacion de robots humanoides en tiempo real: el sistema permite que un operador humano controle un robot Adam Pro o G1 mediante captura de movimiento, con correccion de errores en lazo cerrado para mantener la estabilidad y precision del seguimiento.
- Generacion de datasets de movimiento para robotica: el dataset de 10 horas de movimiento humano retargeteado puede reutilizarse para entrenar otras politicas de control o para estudios de imitacion.
- Investigacion en aprendizaje por refuerzo para robotica: el codigo soporta entrenamiento distribuido multi-GPU y recompensas AMP, lo que lo convierte en una base solida para experimentos academicos sobre imitacion de movimiento.
- Simulacion de tareas de manipulacion y locomocion: las politicas entrenadas pueden evaluarse en MjLab, IsaacGym o IsaacSim para validar comportamientos antes del despliegue en hardware real.
- Desarrollo de sistemas de teleoperacion bilateral: la arquitectura de lazo cerrado global puede adaptarse para integrar retroalimentacion haptica o visual en aplicaciones de control remoto de robots.
- Benchmarking de algoritmos de seguimiento de movimiento: al proporcionar checkpoints preentrenados y un pipeline de evaluacion estandarizado, el repositorio sirve como punto de comparacion para otros metodos de tracking humanoide.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas comparativas con otros metodos ni metricas cuantitativas de rendimiento (como tasa de exito en tareas, error de seguimiento medio, etc.). Para obtener datos de evaluacion, seria necesario ejecutar los scripts de evaluacion incluidos en el repositorio sobre los checkpoints proporcionados.

## Requisitos de hardware

- Entrenamiento: 8 GPUs NVIDIA RTX 4090 con 48 GB de VRAM cada una (configuracion por defecto). El numero de GPUs puede modificarse mediante los parametros `ngpu` y `nproc_per_node`.
- Inferencia/evaluacion: una unica GPU NVIDIA RTX 4090 es suficiente para evaluar los checkpoints en el entorno MjLab.
- Despliegue en MuJoCo: se requiere exportar el checkpoint a ONNX y ejecutarlo en un entorno con soporte MuJoCo; no se especifican requisitos minimos de hardware para este paso.
- Sistema operativo: Ubuntu 22.04 (entorno probado).
- Opciones de despliegue: los checkpoints pueden cargarse directamente en Python con PyTorch, o exportarse a ONNX para integracion en pipelines de robotica.

## Comparativa con modelos similares

| Modelo | Enfoque | Robot objetivo | Simuladores | Licencia |
|---|---|---|---|---|
| CLOT (este repositorio) | Seguimiento global en lazo cerrado con AMP | Adam Pro, G1 | MjLab, IsaacGym, IsaacSim | CC BY-NC 4.0 |
| ASAP | Retargeting y adaptacion de movimiento | Varios humanoides | IsaacGym | no disponible |
| PBHC | Control basado en prioridades para teleoperacion | Varios humanoides | no disponible | no disponible |
| BeyondMimic | Seguimiento de cuerpo completo | Varios humanoides | IsaacGym | no disponible |

La comparativa se basa en la informacion disponible en el repositorio. No se dispone de datos cuantitativos de rendimiento para establecer una comparacion objetiva entre estos sistemas.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: prohibido el uso comercial del codigo, los checkpoints y el dataset. Esto incluye la creacion de demos para promocionar productos comerciales.
- El entrenamiento requiere una infraestructura GPU considerable (8x RTX 4090), lo que limita su reproducibilidad en entornos con menos recursos.
- El dataset de movimiento se centra en un conjunto especifico de movimientos humanos; la generalizacion a movimientos fuera de ese conjunto no esta garantizada.
- El sistema esta disenado para los robots Adam Pro y G1; adaptarlo a otros humanoides requiere retargeting adicional y posiblemente reentrenamiento.
- No se proporcionan metricas de rendimiento cuantitativas, por lo que la evaluacion de la calidad del seguimiento requiere ejecutar los scripts de evaluacion manualmente.
- El repositorio esta en fase de investigacion (version inicial de 2026) y puede contener errores o carecer de soporte a largo plazo.
- La dependencia de MjLab como simulador principal puede requerir ajustes si se utilizan otros entornos de simulacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Zhutengjie/PBHC_adam
- Dataset de movimiento humano: https://huggingface.co/datasets/Zhutengjie/human_motion
- Paper arXiv: https://arxiv.org/abs/2602.15060
- Pagina del proyecto: https://zhutengjie.github.io/CLOT.github.io/
- Codigo fuente (referenciado en el paper): https://github.com/LeCAR-Lab/ASAP
- Codigo fuente (referenciado en el paper): https://github.com/TeleHuman/PBHC
- Codigo fuente (referenciado en el paper): https://github.com/HybridRobotics/whole_body_tracking
- Codigo fuente (referenciado en el paper): https://github.com/mujocolab/mjlab
- Codigo fuente (referenciado en el paper): https://github.com/NVlabs/ProtoMotions
- Codigo fuente (referenciado en el paper): https://github.com/nv-tlabs/ASE
