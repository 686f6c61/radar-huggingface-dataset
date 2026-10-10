# sreetz-nv/so101_contact_perception_dr500_h32_b32_25k_20261009

## Resumen

Se trata de una política robótica (policy) para el brazo SO-101, publicada en HuggingFace bajo el identificador `sreetz-nv/so101_contact_perception_dr500_h32_b32_25k_20261009`. No es un modelo de lenguaje al uso, sino un modelo de control orientado a manipulación con contacto y percepción, construido mediante fine-tuning sobre el modelo base `nvidia/GR00T-N1.7-3B` y entrenado con la librería LeRobot. El autor lo describe como "SO-101 contact and perception randomized policy", lo que apunta a una política entrenada con aleatorización de dominio (el sufijo `dr500`) para tareas que implican contacto físico y percepción visual.

El repositorio se encuentra en estado de entrenamiento en curso: la model card indica explícitamente que está reservado para el checkpoint de 25k pasos y que los pesos no están disponibles todavía. Por tanto, a fecha de publicación no existe un artefacto descargable y las descargas y "likes" registrados son cero. La información técnica disponible se limita a la configuración de entrenamiento declarada (H32, batch 32, LR 1e-4, visión entrenable y lenguaje congelado) y al dataset asociado, por lo que buena parte de las especificaciones habituales quedan como no disponibles.

Su relevancia actual es la de un experimento de investigación dentro del ecosistema GR00T/LeRobot: aplicar el modelo fundacional vision-language-action de NVIDIA a un robot de bajo coste (SO-101) con un conjunto de datos específico de percepción y contacto. Al no haberse publicado pesos ni resultados, no puede evaluarse su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada del modelo base nvidia/GR00T-N1.7-3B, de tipo vision-language-action; detalles no disponibles) |
| Parametros totales | no disponible (el nombre del modelo base sugiere ~3B, sin confirmar en la informacion aportada) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (pesos aun no publicados) |

## Arquitectura y entrenamiento

No se dispone de una descripcion de arquitectura propia del modelo. Lo unico confirmado es que se trata de un fine-tuning del modelo base `nvidia/GR00T-N1.7-3B`, un modelo fundacional orientado a robots, y que el entrenamiento se realiza con la libreria `lerobot`. Los detalles de arquitectura interna (tipo de backbone, cabezal de acciones, esquema de difusion o tokens de accion) no se detallan en la informacion proporcionada.

La configuracion de entrenamiento declarada en la model card es: H32, batch 32, LR 1e-4, con vision entrenable y lenguaje congelado. El dataset asociado es `sreetz-nv/so101_contact_perception_dr500_20261009`. No se especifica el numero de tokens, la composicion del dataset, ni si hubo etapas de RLHF/DPO (concepto poco aplicable a politicas de robot). Tampoco se indica el numero total de pasos mas alla de la referencia al checkpoint "25k" que da nombre al repositorio. La combinacion de aleatorizacion de dominio (`dr500`) y "contact perception" sugiere entrenamiento orientado a transferencia sim-a-real en tareas con contacto, pero esto es una inferencia a partir del nombre y no un dato confirmado.

## Capacidades

- Control robótico para el brazo SO-101 en tareas de manipulacion, segun el nombre del repositorio.
- Percepcion visual integrada: la vision se declara "trainable" durante el fine-tuning, lo que indica entrada de imagen.
- Tareas con contacto fisico ("contact"), presumiblemente manipulacion en la que el robot interactua fisicamente con objetos.
- Aleatorizacion de dominio para robustez sim-a-real, segun el sufijo `dr500`.
- Soporte de condicionamiento por lenguaje: el modelo base es de tipo vision-language-action y se congela la parte de lenguaje, aunque no se detalla el alcance.
- No se confirma soporte de tool calling, agentes multi-paso ni capacidades multilingues; no aplica en el sentido convencional de un LLM.
- No disponible: thinking mode, vision en sentido general, audio u otras capacidades especiales.

## Casos de uso

- Manipulacion con contacto en laboratorio: uso de la policy para que el brazo SO-101 ejecute tareas que requieren contacto fisico (por ejemplo empuje, agarre o insercion), aprovechando el entrenamiento especifico sobre datos de "contact perception".
- Transferencia sim-a-real en investigacion: el uso de aleatorizacion de dominio (`dr500`) apunta a probar politicas entrenadas en simulacion directamente sobre el robot fisico.
- Benchmark de modelos fundacionales VLA: servir como punto de comparacion frente a otras politicas fine-tuneadas sobre GR00T en el mismo robot.
- Plataforma docente con hardware de bajo coste: el SO-101 es un brazo abierto y economico, util para ensenar aprendizaje por imitacion y control visual con LeRobot.
- Recoleccion y reutilizacion de datos: el dataset asociado permite reproducir o ampliar el entrenamiento y estudiar el efecto de la aleatorizacion.
- Base para nuevos fine-tunings: una vez liberados los pesos, partir de este checkpoint para adaptarlo a otras tareas del mismo robot.

Nota: al no existir pesos publicados, ninguno de estos casos puede ejecutarse actualmente con este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica que el entrenamiento esta en curso y que los pesos del checkpoint de 25k no estan disponibles.

## Requisitos de hardware

No se proporcionan requisitos de hardware en la informacion disponible. A modo orientativo, y solo como estimacion no confirmada a partir del tamano sugerido del modelo base (~3B parametros):

- VRAM estimada: no disponible de forma oficial; como referencia, un modelo de ~3B parametros en precision completa suele requerir del orden de 6-12 GB en FP16, pero esto no esta confirmado para esta policy ni para su cabezal de acciones.
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: no confirmado; dependeria del tamano real y de la cuantizacion, no especificada.
- Opciones de despliegue: se sabe que usa la libreria `lerobot`; no se detalla compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de especificaciones de los modelos comparables en la informacion proporcionada. Cualitativamente, este modelo pertenece a la familia de politicas vision-language-action para robotica, junto con alternativas como OpenVLA, pi0 y los propios checkpoints de GR00T N1.x. Sin embargo, al no haber pesos publicados ni resultados, no es posible establecer una comparacion cuantitativa fiable.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101_contact_perception_dr500_h32_b32_25k | no disponible | no disponible | no disponible | no disponible | pesos no publicados |
| OpenVLA | no disponible en la informacion aportada | no disponible | no disponible | no disponible | no disponible |
| pi0 | no disponible en la informacion aportada | no disponible | no disponible | no disponible | no disponible |
| GR00T N1.7-3B (modelo base) | ~3B (segun nombre) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Pesos no disponibles: el repositorio esta reservado para el checkpoint de 25k y no permite su uso; cualquier evaluacion es imposible por ahora.
- Ausencia de licencia declarada: no se indica licencia, por lo que no puede asumirse permiso de uso comercial y habria que consultar al autor y a la licencia del modelo base.
- Sesgos: no disponible; al ser una policy robotica, los sesgos relevantes serian de distribucion de datos (entorno, objetos, iluminacion) y no linguisticos.
- Riesgo de fallo sim-a-real: aunque se usa aleatorizacion de dominio, no hay evidencia publicada de exito en transferencia al robot real.
- Alcance restringido: es una policy especifica para el SO-101 y tareas de contacto; no es un modelo de proposito general.
- Idiomas y contexto: no disponibles; sin datos sobre condicionamiento linguistico util.
- Advertencia de produccion: sin pesos, sin benchmarks y sin licencia clara, no es apto para despliegue en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/sreetz-nv/so101_contact_perception_dr500_h32_b32_25k_20261009
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset asociado: https://huggingface.co/datasets/sreetz-nv/so101_contact_perception_dr500_20261009
- Libreria LeRobot: no disponible en la informacion aportada como enlace directo
- Paper, blog, repositorio o demo adicionales: no disponibles (los resultados de la busqueda web no aportan enlaces relevantes al modelo)
