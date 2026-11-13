# WoojongKim/smolvla_policy_omy_gelsight_snack_all

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, disenado para controlar robots manipuladores a partir de observaciones visuales e instrucciones en lenguaje natural. Este repositorio concreto, `WoojongKim/smolvla_policy_omy_gelsight_snack_all`, es un fine-tuning del checkpoint base `lerobot/smolvla_base` realizado por el usuario WoojongKim sobre el dataset `WoojongKim/omy_gelsight_snack_all`, orientado a una tarea especifica de manipulacion con sensor tactil GelSight (la nomenclatura sugiere recogida o manipulacion de snacks).

El modelo resuelve el problema de la politica de control extremo a extremo en robotica: dado un flujo de imagenes de camara y una instruccion textual, genera acciones motoras de bajo nivel. Su relevancia radica en que SmolVLA esta disenado para ejecutarse en hardware de consumo, lo que democratiza el entrenamiento y despliegue de politicas VLA sin necesidad de clústeres de GPU de gama alta.

Con 450 millones de parametros, este checkpoint es un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, publicado bajo licencia Apache 2.0. No se dispone de informacion sobre idiomas soportados ni de resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, segun SmolVLA (paper arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Modelo base | lerobot/smolvla_base |
| Dataset de entrenamiento | WoojongKim/omy_gelsight_snack_all |
| Tamano del repositorio | 0,9 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de vision-lenguaje-accion que combina un codificador visual, un modelo de lenguaje y una cabeza de accion para producir comandos motores a partir de observaciones e instrucciones. El paper de referencia (arXiv:2506.01844) la describe como un modelo compacto y eficiente que logra rendimiento competitivo con costes computacionales reducidos y despliegue viable en hardware de consumo. No se detalla en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

Este checkpoint concreto es un fine-tuning supervisado del modelo base `lerobot/smolvla_base` sobre el dataset `WoojongKim/omy_gelsight_snack_all`, entrenado y publicado mediante LeRobot. La nomenclatura del repositorio indica integracion de senal tactil GelSight junto con vision, aunque la informacion disponible no especifica la configuracion exacta de entradas sensoriales ni el numero de episodios de entrenamiento.

## Capacidades

- Generacion de acciones motoras para robots manipuladores a partir de observaciones visuales e instrucciones en lenguaje natural.
- Control de politicas de imitacion entrenadas con LeRobot (`lerobot-train`, `lerobot-record`).
- Integracion de percepcion visual y, segun la nomenclatura del dataset, senal tactil GelSight.
- Ejecucion de tareas de manipulacion especificas del dataset `omy_gelsight_snack_all`.
- Despliegue en hardware de consumo segun las caracteristicas de SmolVLA.
- Inferencia y evaluacion mediante el flujo estandar de LeRobot con `--policy.path`.
- No se dispone de informacion sobre soporte de tool calling, agentes multi-paso, capacidades multilingues ni modos de razonamiento explicito.

## Casos de uso

- Manipulacion robotica de snacks con retorno tactil: el modelo genera acciones de agarre y colocacion a partir de imagenes y lecturas GelSight, adecuado para tareas de pick-and-place que requieren deteccion de contacto.
- Investigacion en aprendizaje por imitacion: sirve como checkpoint de referencia para comparar fine-tunings de SmolVLA sobre datasets con sensores tactiles.
- Evaluacion de politicas VLA en robot SO-100/SO-101: se ejecuta con `lerobot-record` sobre el robot `so100_follower`, lo que permite validar la politica en 10 episodios de forma estandarizada.
- Prototipado en laboratorio con hardware de consumo: sus 450 M de parametros y su repo de 0,9 GB permiten iterar en estaciones de trabajo con una sola GPU.
- Reproduccion de experimentos: al estar entrenado sobre un dataset publico identificado, permite reproducir el pipeline de entrenamiento y evaluacion.
- Base para nuevos fine-tunings: al derivar de `lerobot/smolvla_base` con licencia Apache 2.0, puede reentrenarse sobre otros datasets de manipulacion sin restricciones de licencia.
- Docencia y demos de robotica: util para ilustrar el flujo completo de LeRobot desde el entrenamiento hasta la evaluacion en robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 450 M de parametros en precision FP32 el peso ocupa aproximadamente 1,8 GB, y en FP16 aproximadamente 0,9 GB, a lo que hay que sumar el codificador visual y los buffers de inferencia.
- GPU recomendadas: no disponible en la informacion proporcionada. SmolVLA se describe como desplegable en hardware de consumo.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo y la orientacion de SmolVLA a hardware de consumo, aunque no se especifican modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`). No se indica soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| smolvla_policy_omy_gelsight_snack_all (este) | 450 M | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning sobre dataset tactil especifico |
| lerobot/smolvla_base | no disponible | no disponible | no disponible en la informacion | Hugging Face | Checkpoint base del que deriva este modelo |
| Otros modelos VLA comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparacion en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo de investigacion con cero descargas y cero likes: no hay evidencia de validacion externa ni de uso en produccion.
- Entrenado sobre un dataset muy especifico (`omy_gelsight_snack_all`): es probable que generalice mal fuera de esa tarea, entorno y configuracion de sensores.
- Dependencia de la configuracion de hardware del autor (robot, camaras, sensor GelSight): la politica puede no transferirse a otras plataformas sin reentrenamiento.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni robustez ante condiciones de iluminacion o distribucion distintas.
- No se especifican idiomas soportados ni limitaciones de contexto.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- La model card es una plantilla generica de LeRobot y no documenta hiperparametros, numero de episodios ni metricas de exito.
- No apta para produccion sin una evaluacion propia en el robot objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WoojongKim/smolvla_policy_omy_gelsight_snack_all
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/WoojongKim/omy_gelsight_snack_all
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
