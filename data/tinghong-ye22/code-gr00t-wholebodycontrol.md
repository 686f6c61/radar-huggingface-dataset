# Tinghong-Ye22/code-GR00T-WholeBodyControl

## Resumen

GR00T-WholeBodyControl es el repositorio de código asociado a los proyectos de control de cuerpo completo (whole-body control, WBC) para robots humanoides de NVIDIA GEAR Lab. La ficha de HuggingFace analizada, publicada por el usuario Tinghong-Ye22, redistribuye ese código junto con los checkpoints y scripts de entrenamiento, evaluación y despliegue de controladores. No se trata de un modelo de lenguaje, sino de un conjunto de políticas de control motor para humanoides, por lo que buena parte de las especificaciones habituales de una ficha de LLM (contexto, cuantización, idiomas) no son aplicables.

El repositorio cubre dos líneas de trabajo. La primera es el controlador desacoplado (Decoupled WBC), que combina aprendizaje por refuerzo para el tren inferior e cinemática inversa (IK) para el tren superior, y que se emplea en los modelos NVIDIA GR00T N1.5 y N1.6. La segunda es la serie GEAR-SONIC, presentada como la iteración más reciente de controladores generalistas de cuerpo completo, con checkpoints de política preentrenados, una pila de inferencia en C++ y una pila de teleoperación con realidad virtual.

La relevancia del proyecto reside en su enfoque de "modelo fundacional de comportamiento humanoide": en lugar de construir controladores separados para cada movimiento predefinido, SONIC usa el seguimiento de movimiento (motion tracking) como tarea de entrenamiento escalable, de modo que una única política unificada produce movimiento natural de cuerpo completo y generaliza más allá de las trayectorias vistas en entrenamiento. La model card referencia el paper arXiv:2511.07820 y declara licencia Apache 2.0 en el badge del repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (políticas de control motor para humanoides; no es un transformer de lenguaje). El repositorio describe dos componentes: Decoupled WBC (RL para tren inferior + IK para tren superior) y GEAR-SONIC (política unificada entrenada con seguimiento de movimiento) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica a control motor) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0, según el badge incluido en la model card del repositorio de referencia. La ficha de HuggingFace analizada no declara licencia en sus metadatos |
| Formato de pesos | No disponible (se mencionan checkpoints de política preentrenados, sin especificar formato) |
| Framework de entrenamiento | IsaacLab 2.3.0 |
| Robot objetivo | No disponible de forma explícita; el dataset asociado BONES-SEED contiene trayectorias compatibles con Unitree G1 en MuJoCo |
| Pila de inferencia | C++ (liberada junto con GEAR-SONIC) |
| Teleoperación | PICO VR headset, en tiempo real, cuerpo completo |

## Arquitectura y entrenamiento

El repositorio documenta dos aproximaciones complementarias. El controlador desacoplado (Decoupled WBC) separa el problema en dos dominios: el tren inferior se resuelve mediante aprendizaje por refuerzo (RL) y el tren superior mediante cinemática inversa (IK). Esta arquitectura es la empleada en NVIDIA GR00T N1.5 y N1.6. La serie GEAR-SONIC, por su parte, se describe como un modelo fundacional de comportamiento humanoide que da a los robots un conjunto básico de habilidades motoras aprendidas a partir de datos de movimiento humano a gran escala; la tarea de entrenamiento es el seguimiento de movimiento, lo que permite que una sola política unificada genere movimiento natural de cuerpo completo y soporte comportamientos diversos (caminar, gatear, teleoperación y control multimodal).

Los datos de entrenamiento se apoyan en BONES-SEED, dataset de movimiento humano a gran escala abierto el 16 de marzo de 2026, con más de 142.000 movimientos, aproximadamente 288 horas y trayectorias compatibles con Unitree G1 en MuJoCo; la model card indica que un subconjunto amplio de los datos de entrenamiento de SONIC proviene de este dataset. No se especifican en la información disponible el número de tokens ni la composición detallada del dataset para las políticas, ni si se emplearon técnicas de RLHF o DPO (no aplicables en el sentido habitual de alineamiento de LLM). Entre las capacidades técnicas destacadas están el planificador cinemático para generación de locomoción en tiempo real, la teleoperación de cuerpo completo con PICO VR y la pila de inferencia en C++.

## Capacidades

- Control de cuerpo completo para robots humanoides: locomoción, equilibrio y coordinación de extremidades mediante una política unificada.
- Habilidades motoras diversas mostradas en la documentación: caminar, correr, desplazamiento lateral, arrodillarse, levantarse desde el suelo, saltar, gateo con manos, gateo con codos y boxeo.
- Manipulación bimanual y transferencia de objetos entre manos (object hand-off).
- Teleoperación de cuerpo completo en tiempo real mediante PICO VR, orientada a transferencia de movimiento humano a robot y recogida de datos.
- Planificador cinemático para locomoción en tiempo real: selección de estilo de movimiento, control con teclado o mando y ajuste de velocidad y altura en marcha. Estilos documentados: run, happy, stealth, injured, kneeling, hand crawling, elbow crawling y boxing, además de navegación en entornos no controlados (in-the-wild).
- Controlador desacoplado compatible con NVIDIA GR00T N1.5 y N1.6.
- Pila de inferencia en C++ para despliegue.
- Seguimiento de movimiento (motion tracking) como tarea escalable de entrenamiento y base para planificación de alto nivel.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión y audio: no disponible (el modelo no es un modelo de lenguaje).

## Casos de uso

- Investigación en control de cuerpo completo para humanoides: el repositorio proporciona código de entrenamiento, evaluación y despliegue, de modo que un laboratorio puede reproducir los controladores desacoplados o entrenar variantes propias sobre IsaacLab 2.3.0.
- Locomoción generalista en robots humanoides: la política unificada de SONIC permite generar marcha y otros patrones de movimiento sin entrenar un controlador específico por cada tipo de desplazamiento, lo que reduce el coste de ingeniería por comportamiento.
- Teleoperación para recogida de datos: con un casco PICO VR se transfiere movimiento humano de cuerpo completo al robot en tiempo real, lo que resulta adecuado para construir datasets de demostración para aprendizaje posterior.
- Navegación en entornos reales no controlados: el planificador cinemático permite dirigir al robot con teclado o mando, ajustando velocidad y altura, y se documenta su uso en navegación in-the-wild.
- Manipulación bimanual y entrega de objetos: las demostraciones de manipulación bimanual y hand-off son relevantes para tareas de pick-and-place y colaboración robot-humano en entornos logísticos o de laboratorio.
- Movimientos de recuperación y contingencia: las políticas documentadas incluyen levantarse tras una caída y estilos de marcha "injured" o "stealth", útiles en escenarios de robustez y operación degradada.
- Reentrenamiento con datos de movimiento a gran escala: usando BONES-SEED (142K+ movimientos, ~288 horas, trayectorias Unitree G1 compatibles con MuJoCo) se pueden ampliar las habilidades del controlador mediante seguimiento de movimiento.
- Integración como capa de control de bajo nivel en arquitecturas tipo GR00T N1.5/N1.6: el controlador desacoplado actúa como componente de ejecución para políticas de nivel superior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los metadatos de HuggingFace no incluyen tablas de métricas cuantitativas (tasas de éxito de seguimiento de movimiento, error de tracking, métricas de estabilidad, comparativas numéricas con otros controladores, latencias medidas ni throughput).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible. La documentación cita IsaacLab 2.3.0 como framework de simulación y entrenamiento, que requiere GPU compatible con NVIDIA Isaac Sim, pero no se detallan modelos concretos en la información proporcionada.
- Encaje en GPU de consumo: no disponible.
- Opciones de despliegue: pila de inferencia en C++ liberada junto con GEAR-SONIC; teleoperación con PICO VR; simulación y entrenamiento con IsaacLab 2.3.0 y MuJoCo (para trayectorias Unitree G1 del dataset BONES-SEED). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible. La documentación describe teleoperación en tiempo real, pero sin cifras concretas de latencia o frecuencia de control.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| GR00T-WholeBodyControl / GEAR-SONIC | Controlador de cuerpo completo para humanoides | No disponible | Apache 2.0 (badge del repositorio de referencia) | Repositorio redistribuido en HuggingFace (0 descargas, 0 likes) y checkpoints en nvidia/GEAR-SONIC |
| NVIDIA GR00T N1.5 | Modelo fundacional para humanoides | No disponible | No disponible en la información proporcionada | Referenciado como consumidor del controlador desacoplado |
| NVIDIA GR00T N1.6 | Modelo fundacional para humanoides | No disponible | No disponible en la información proporcionada | Referenciado como consumidor del controlador desacoplado |

No se dispone de datos numéricos que permitan una comparación cuantitativa con alternativas de otros autores; la comparación se limita a la relación funcional entre los proyectos de la misma familia.

## Limitaciones y advertencias

- Repositorio redistribuido: la ficha analizada (Tinghong-Ye22/code-GR00T-WholeBodyControl) no es la fuente original, que corresponde a NVIDIA GEAR Lab. Registra 0 descargas y 0 likes, sin pipeline, idiomas ni licencia declarados en los metadatos de HuggingFace.
- Especificidad de hardware: los controladores están diseñados para robots humanoides concretos y requieren validación en simulación (IsaacLab, MuJoCo) antes de cualquier despliegue físico. Aplicarlos a otra plataforma exige reentrenamiento.
- Sin datos de rendimiento públicos en esta ficha: no hay métricas de tasa de éxito, robustez ante perturbaciones ni estabilidad en terreno irregular, lo que impide estimar su fiabilidad en producción.
- Riesgo en entornos físicos: cualquier fallo de política en un robot humanoide puede provocar caídas, daños al propio robot o a personas u objetos cercanos. Se requiere supervisión y medidas de seguridad.
- Limitaciones de generalización: aunque SONIC se presenta como generalista, no se especifica en la información disponible el grado de generalización fuera de la distribución de movimientos de entrenamiento.
- Dependencia de datos: buena parte del entrenamiento se apoya en BONES-SEED, con sesgos potenciales derivados del tipo de movimientos humanos capturados (repertorio de acciones, morfología de los sujetos, entorno de captura).
- Restricciones de licencia: el badge indica Apache 2.0 en el repositorio de referencia, pero la ficha de HuggingFace analizada no declara licencia; conviene verificar la licencia efectiva en el repositorio original antes de uso comercial.
- Idiomas, contexto y cuantización: no aplicables; los campos equivalentes en una ficha de LLM no tienen sentido para este tipo de modelo.
- Fechas de la información: los metadatos indican creación el 2026-10-14, posterior a las noticias de la model card (2025-11-12, 2026-02-19, 2026-03-16).

## Enlaces

- Ficha de HuggingFace analizada: https://huggingface.co/Tinghong-Ye22/code-GR00T-WholeBodyControl
- Paper de GEAR-SONIC (arXiv:2511.07820): https://arxiv.org/abs/2511.07820
- Página del proyecto GEAR-SONIC: https://nvlabs.github.io/GEAR-SONIC/
- Whitepaper de GEAR-SONIC: https://nvlabs.github.io/GEAR-SONIC/
- Modelo GEAR-SONIC en HuggingFace (NVIDIA): https://huggingface.co/nvidia/GEAR-SONIC
- Documentación de GR00T-WholeBodyControl: https://nvlabs.github.io/GR00T-WholeBodyControl/
- Dataset BONES-SEED: https://huggingface.co/datasets/bones-studio/seed
- IsaacLab 2.3.0 (release): https://github.com/isaac-sim/IsaacLab/releases/tag/v2.3.0
- GR00T N1.5 (NVIDIA Research): https://research.nvidia.com/labs/gear/gr00t-n1_5/
- GR00T N1.6 (NVIDIA Research): https://research.nvidia.com/labs/gear/gr00t-n1_6/
