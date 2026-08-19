# zzhtx/smolvla_sand_to_box

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para control robótico mediante aprendizaje por imitación. Este repositorio concreto, `zzhtx/smolvla_sand_to_box`, es un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base` realizado por el usuario zzhtx, especializado en la tarea de recoger un saco de arena y colocarlo dentro de una caja. El modelo se ha entrenado con el framework LeRobot y el dataset `zzhtx/sand-to-box_20260817_163857`, que contiene 50 episodios y 17.378 fotogramas capturados a 30 FPS.

La relevancia de este modelo radica en que SmolVLA demuestra que es posible obtener un rendimiento competitivo en control robótico con un coste computacional reducido, permitiendo su despliegue en hardware de consumo. Con aproximadamente 450 millones de parámetros, este modelo es significativamente más pequeño que otros VLA como OpenVLA (7B parámetros), lo que lo hace accesible para investigación y desarrollo en entornos con recursos limitados. La arquitectura combina un modelo de visión-lenguaje preentrenado con un experto de acción, permitiendo que el robot ejecute tareas a partir de instrucciones en lenguaje natural y observaciones visuales de múltiples cámaras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con experto de acción |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que integra un modelo de visión-lenguaje preentrenado con un experto de acción. La arquitectura toma como entrada múltiples vistas de cámara (en este caso, tres cámaras: `camera1`, `camera2` y `camera3`), el estado sensorimotor actual del robot (un vector de 6 dimensiones) y una instrucción en lenguaje natural. Estos inputs se codifican en características contextuales que condicionan al experto de acción para generar comandos de control de 6 dimensiones (posición y orientación del efector final).

El modelo base `lerobot/smolvla_base` fue preentrenado en un corpus extenso de datos multimodales, y este repositorio particular ha sido ajustado mediante aprendizaje por imitación supervisado sobre el dataset `zzhtx/sand-to-box_20260817_163857`. El entrenamiento se realizó durante 20.000 pasos con un tamaño de lote de 8, usando el optimizador AdamW con una tasa de aprendizaje de 0,0001 y semilla 1000. La configuración de entrenamiento corresponde a la versión 0.6.2 de LeRobot. El robot utilizado es un `so_follower` con cámaras `overhead` y `wrist`.

Una innovación clave de SmolVLA es su eficiencia: al ser un modelo compacto, puede ejecutarse en hardware de consumo, lo que democratiza el acceso a la robótica basada en VLA. El enfoque de entrenamiento con LeRobot permite que investigadores y desarrolladores con recursos limitados puedan ajustar el modelo para tareas específicas.

## Capacidades

- Control robótico por imitación: el modelo genera comandos de acción de 6 grados de libertad (posición y orientación) a partir de observaciones visuales y estado del robot.
- Percepción multimodal: procesa tres flujos de cámara simultáneos (256x256 píxeles cada uno), lo que permite percepción espacial desde múltiples ángulos.
- Comprensión de instrucciones en lenguaje natural: la tarea se especifica mediante texto ("Pick up the sandbag and place it inside the box"), lo que permite condicionar el comportamiento del robot.
- Generalización a tareas de manipulación: aunque está especializado en la tarea de recoger y colocar objetos, el modelo base SmolVLA está diseñado para adaptarse a diversas tareas robóticas mediante fine-tuning.
- Integración con LeRobot: compatible con el ecosistema de herramientas de Hugging Face para robótica, incluyendo pipelines de entrenamiento, evaluación y despliegue.
- Eficiencia computacional: con solo 450M de parámetros, es adecuado para inferencia en tiempo real en GPUs de consumo.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorios: el modelo puede controlar un brazo robótico para recoger objetos y colocarlos en ubicaciones designadas, útil en entornos de investigación que requieren manipulación repetitiva.
- Prototipado rápido de políticas robóticas: investigadores pueden usar este modelo como punto de partida y ajustarlo con pocos datos (50 episodios) para nuevas tareas, acelerando el ciclo de desarrollo.
- Educación en robótica: al ser un modelo pequeño y con licencia Apache 2.0, es ideal para cursos universitarios donde los estudiantes aprenden a entrenar y desplegar políticas de control.
- Manipulación de materiales en entornos controlados: la tarea específica de mover sacos de arena puede extrapolarse a otras tareas de manipulación de objetos deformables o semirrígidos.
- Benchmarking de algoritmos de aprendizaje por imitación: sirve como modelo de referencia para comparar técnicas de entrenamiento, arquitecturas o estrategias de recolección de datos.
- Desarrollo de sistemas robóticos asequibles: dado su bajo coste computacional, puede desplegarse en robots de bajo coste con GPUs de gama media, facilitando la adopción en pequeñas empresas o makerspaces.
- Investigación en VLA compactos: el modelo es un caso de estudio para analizar el rendimiento de arquitecturas VLA reducidas frente a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." Por tanto, no hay datos de rendimiento en tareas estándar como MMLU, HumanEval o GSM8K, ni métricas de éxito en el robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450M de parámetros en FP32, el modelo ocupa aproximadamente 1,8 GB en memoria. Con cuantización a FP16, se reduce a ~0,9 GB. El tamaño del repositorio es de 0,9 GB, lo que sugiere pesos en FP16 o BF16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería ser suficiente para inferencia. Tarjetas como NVIDIA GTX 1650, RTX 3060 o superiores son adecuadas. Para entrenamiento, se recomienda al menos 8 GB de VRAM.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de consumo medio-bajo, lo que es una ventaja clave de SmolVLA frente a modelos más grandes.
- Opciones de despliegue: el modelo se integra con LeRobot, que proporciona scripts de rollout (`lerobot-rollout`) para ejecutar la política en robots reales. También es compatible con el ecosistema Hugging Face.
- Latencia y throughput: no disponible en la información proporcionada, pero dado el tamaño del modelo, se espera una latencia de inferencia inferior a 50 ms en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zzhtx/smolvla_sand_to_box | 450M | no disponible | Pick-and-place de saco de arena | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | no disponible | Control robótico generalista | MIT | Hugging Face |
| RT-2 (Google) | 55B | no disponible | Control robótico generalista | Propietaria | No disponible públicamente |
| ACT (Action Chunking with Transformers) | ~80M | no disponible | Imitación para tareas específicas | MIT | Hugging Face |

SmolVLA se posiciona como una alternativa intermedia entre modelos muy pequeños como ACT (que requieren entrenamiento desde cero por tarea) y modelos masivos como RT-2 (que requieren infraestructura de datacenter). Su ventaja es que parte de un modelo base preentrenado en datos multimodales, lo que permite un fine-tuning eficiente con pocas demostraciones.

## Limitaciones y advertencias

- Especialización limitada: el modelo está ajustado para una única tarea (recoger saco de arena y colocarlo en caja). No generalizará a otras tareas sin un nuevo fine-tuning.
- Sin evaluación en robot real: la model card indica que no hay resultados de evaluación, por lo que se desconoce la tasa de éxito real en el robot físico.
- Dataset pequeño: 50 episodios es un conjunto de datos reducido, lo que puede limitar la robustez del modelo ante variaciones en la posición de objetos, iluminación o configuraciones del entorno.
- Dependencia de cámaras específicas: el modelo espera tres cámaras con nombres y resoluciones concretas (`camera1`, `camera2`, `camera3` a 256x256). Cambiar la configuración de cámaras requerirá reentrenamiento.
- Sin soporte multilingüe documentado: la instrucción en lenguaje natural está en inglés y no se especifican otros idiomas.
- Riesgo de alucinación en instrucciones complejas: al ser un modelo pequeño, puede fallar ante instrucciones ambiguas o fuera de distribución.
- Limitaciones de hardware: aunque es eficiente, el entrenamiento requiere una GPU con al menos 8 GB de VRAM si se usa el script estándar de LeRobot.
- Restricciones de uso: aunque la licencia Apache 2.0 permite uso comercial, el usuario debe verificar que el dataset de entrenamiento no tenga restricciones adicionales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/zzhtx/smolvla_sand_to_box
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/zzhtx/sand-to-box_20260817_163857
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Documentación de LeRobot sobre SmolVLA: https://dctx-team.github.io/lerobot-zh/en/smolvla/
- Repositorio de LeRobot: https://github.com/zyqdragon/lerobot_smolvla
- Guía de LeRobot para entrenamiento e inferencia: https://huggingface.co/docs/lerobot/index
