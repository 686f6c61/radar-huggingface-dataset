# URL-RFM/gr00t-n1.7-g1-dex1-ikea-3task-46d-30hz-h40

## Resumen

Este modelo es un fine-tuning especializado de NVIDIA GR00T N1.7-3B, un modelo fundacional de robótica tipo VLA (Vision-Language-Action), desarrollado por el usuario URL-RFM. El ajuste se ha realizado sobre el dataset `carroll511/IKEA_table_assembly`, que contiene demostraciones de un robot humanoide Unitree G1 con manos Dex1 ensamblando una mesa infantil desde una posición fija de pie. El resultado es un modelo capaz de ejecutar tres tareas concretas de ensamblaje: recoger la pata de la mesa, insertarla en la base y rotarla para apretarla.

La relevancia de este checkpoint reside en que, entre todos los modelos entrenados sin velocidades articulares de los brazos, presenta el error de muñeca más bajo en la tarea de recoger la pata (8.99 mm), superando a variantes con cinco tareas. El modelo utiliza una ventana de contexto de 40 pasos a 30 Hz, con tres cámaras (una alta y dos de muñeca) y un espacio de estado de 46 dimensiones. Está pensado para despliegues donde el sistema no puede proporcionar velocidades articulares, un caso habitual en controladores de bajo nivel cerrados.

Con 3.144 millones de parámetros y licencia Apache 2.0, este modelo es un ejemplo de especialización vertical sobre un modelo fundacional: en lugar de abarcar muchas tareas, sacrifica generalidad para optimizar el rendimiento en un flujo de trabajo industrial concreto. El autor documenta explícitamente que un modelo equivalente con 60 dimensiones de estado (incluyendo velocidades articulares) supera a este en un 15-20%, por lo que este checkpoint es una solución de contingencia para entornos con limitaciones de telemetría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basada en transformer, backbone Cosmos-Reason2-2B / Qwen3-VL |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40 pasos de horizonte a 30 Hz (ventana temporal de 1.33 segundos) |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de acción robótica, sin capacidades lingüísticas declaradas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/GR00T-N1.7-3B`, la versión N1.7 del modelo fundacional de NVIDIA Isaac GR00T, que incorpora un backbone VLM actualizado (Cosmos-Reason2-2B / Qwen3-VL) respecto a la versión N1.6. En este fine-tuning, el backbone se congela por completo (`tune_llm=False`, `tune_visual=False`), de modo que solo se entrenan las capas de proyección y el head de acción. La configuración de modalidad es `g1_dex1_ikea_relarm_3view_aug_config.py`, que define tres cámaras (alta, muñeca izquierda y muñeca derecha) y un espacio de estado de 46 dimensiones: articulaciones de piernas (12), cintura (3), brazos izquierdo y derecho (7 cada uno), grippers, gravedad de base (3) y poses de extremidades (6 cada una).

El espacio de acción es de 16 dimensiones: los 7 grados de libertad de cada brazo en modo RELATIVO, más los dos grippers en modo ABSOLUTO. El entrenamiento se realizó con batch efectivo de 64, 20.000 pasos con scheduler coseno y warmup del 5%, en 2 GPU A100 con DDP. Los datos provienen de 178 episodios con 79.205 frames. Una particularidad documentada es que `eval_loss` no correlaciona con la calidad de la acción: sube mientras la precisión en bucle abierto mejora, por lo que la selección de checkpoints se hizo mediante escaneo de error de muñeca y no por loss.

## Capacidades

- Ejecución de tres instrucciones motoras concretas: `pick table leg`, `insert table leg to table base` y `rotate leg to tighten`.
- Control de brazo en modo relativo (incrementos respecto a la pose actual) y grippers en modo absoluto.
- Percepción multi-cámara: fusiona tres vistas (alta, muñeca izquierda, muñeca derecha) para generar acciones.
- Generación de acciones en bucle abierto con 4 pasos de denoising y ventana de 40 pasos a 30 Hz.
- El modelo no tiene capacidades lingüísticas generales: las instrucciones son strings fijos que activan comportamientos aprendidos.
- No soporta tool calling, razonamiento multi-paso ni generación de texto: es un modelo puramente motor.

## Casos de uso

- Ensamblaje automatizado en líneas de producción: el modelo puede integrarse en una celda robótica con un Unitree G1 para realizar el montaje de componentes con tolerancias milimétricas. Su error de muñeca de 8.99 mm en la tarea de recogida lo hace adecuado para piezas de tamaño medio como patas de mesa.
- Investigación en aprendizaje por imitación: al ser un checkpoint de fine-tuning documentado con configuraciones exactas, sirve como referencia reproducible para estudiar el efecto de la selección de tareas en el rendimiento (el autor muestra que añadir tareas degrada un 12% la precisión en `insert`).
- Benchmark de control en bucle abierto: el modelo incluye métricas sobre un split de validación fijo (697 ventanas), lo que permite comparar objetivamente variantes de arquitectura o datos.
- Despliegue en entornos sin telemetría de velocidad: es el caso de uso principal declarado. Si el controlador de bajo nivel no puede suministrar `left_arm_vel`/`right_arm_vel`, este modelo de 46 dimensiones es la opción correcta.
- Validación de pipelines de entrenamiento VLA: el autor documenta que la selección por loss es engañosa en esta tarea, un hallazgo útil para equipos que entrenan modelos similares.
- Educación en robótica: al ser Apache 2.0 y estar basado en hardware accesible (Unitree G1), puede usarse en laboratorios universitarios para enseñar fine-tuning de modelos fundacionales de robótica.

## Benchmarks y rendimiento

El autor proporciona métricas de precisión en bucle abierto sobre el split de validación `_v2_val`, con stride 10, 4 pasos de denoising y semilla fija por ventana. Se reportan errores en los pasos 1-8, que son los que realmente se ejecutan en despliegue asíncrono tras compensación de latencia.

| Tarea | n | Arm MAE 1-8 (grados) | Error de muñeca 1-8 (mm) | Gripper MAE |
|---|---:|---:|---:|---:|
| insert table leg to table base | 182 | 1.374 | 13.43 | 0.1685 |
| pick table leg | 180 | 1.226 | 8.99 | 0.2075 |
| rotate leg to tighten | 335 | 1.602 | 12.40 | 0.2768 |
| **Todas** | 697 | **1.445** | **11.78** | **0.2306** |

El autor advierte que estos valores no son comparables con métricas de la era v1, ya que el split de validación cambió. Para referencia interna, el mismo recipe en v1 daba 10.66 mm de error EE8 frente a 11.86 mm en v2. No se han publicado resultados en benchmarks generales como MMLU o HumanEval, ya que no aplican a un modelo de acción robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 3.144 millones de parámetros. En FP16, el peso ocupa aproximadamente 6.3 GB, por lo que cabría en GPUs consumer de 8 GB o más (RTX 3060, RTX 4060, etc.) con margen para activaciones.
- Entrenamiento: el autor usó 2x A100 con DDP, batch efectivo 64 y 20.000 pasos. Para reproducir el entrenamiento se recomienda al menos una A100 de 40 GB o dos GPUs de 24 GB.
- Inferencia en edge: dado el tamaño, es plausible ejecutarlo en hardware embebido con GPU integrada (Jetson Orin) si se cuantiza, aunque no se han publicado cuantizaciones.
- Opciones de despliegue: el ecosistema GR00T de NVIDIA incluye herramientas de despliegue en el repositorio Isaac-GR00T. No se menciona soporte para vLLM, llama.cpp u Ollama, que son herramientas para modelos de lenguaje, no para VLA.
- Latencia: no disponible. El modelo opera a 30 Hz con horizonte de 40 pasos, lo que sugiere que la inferencia debe completarse en menos de 33 ms por ventana, pero no se reporta el tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Estado | Tareas | Error muñeca pick (mm) | Licencia |
|---|---:|---:|---:|---:|---|
| **Este modelo (URL-RFM)** | 3.14 B | 46-dim | 3 | 8.99 | Apache 2.0 |
| `..._alltask_s` @30000 | 3.14 B | 46-dim | 5 | 9.20 | Apache 2.0 |
| `..._alltask_u` @30000 | 3.14 B | 46-dim | 5 | 9.21 | Apache 2.0 |
| `..._alltask_m16` @26000 | 3.14 B | 46-dim | 5 | 9.33 | Apache 2.0 |
| Modelo 60-dim (RooibosT) | 3.14 B | 60-dim | 3 | no disponible | Apache 2.0 |

La comparativa interna del autor muestra que este checkpoint supera a las variantes de cinco tareas en la tarea de recogida, y que un modelo de 60 dimensiones (con velocidades articulares) sería entre un 15-20% mejor. No se dispone de comparación con otros VLA como OpenVLA o RT-2 en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo entiende tres instrucciones. Alimentarlo con `turn the tabletop square` o `flip table` produce comportamiento indefinido, ya que nunca fue entrenado con esos strings.
- Rendimiento en bucle cerrado no verificado: todas las métricas son en bucle abierto; el comportamiento en hardware real con feedback de sensores no ha sido validado para este checkpoint.
- La cintura no se comanda: el robot debe colocarse en una postura fija con pitch de cintura cercano a 10.5 grados (el modo mayoritario en los datos). Desviaciones pueden degradar el rendimiento.
- Los brazos usan acciones relativas y los grippers absolutas; `get_action()` devuelve valores absolutos sin normalizar, lo que requiere manejo cuidadoso en el controlador.
- Datos limitados: solo 178 episodios y 79.205 frames. Un dataset posterior duplica aproximadamente los datos de `insert`, y los modelos entrenados con él son separados.
- Sesgo de tarea: el modelo está optimizado para una mesa concreta y una postura fija. Generalizar a otras mesas, alturas o posiciones requiere nuevo fine-tuning.
- Riesgo de alucinación motora: al ser un modelo generativo, puede producir acciones fuera de la distribución de entrenamiento si la entrada visual es atípica. No hay mecanismos de seguridad documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/URL-RFM/gr00t-n1.7-g1-dex1-ikea-3task-46d-30hz-h40
- Repositorio NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Variante 60-dim con velocidades articulares: https://huggingface.co/RooibosT/gr00t-n1.7-g1-dex1-ikea-relarm-30hz-h40-v2-armvel
- Variante 60-dim sin velocidades: https://huggingface.co/RooibosT/gr00t-n1.7-g1-dex1-ikea-relarm-30hz-h40-v2
- Paper de GR00T N1 (arXiv): https://arxiv.org/pdf/2503.14734v2
