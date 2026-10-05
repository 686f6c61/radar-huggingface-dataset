# taalyelxor/vlap4p-fr3-azure-310000

## Resumen

VLAP4P FR3 policy (variante de camara Azure) es un modelo de vision-lenguaje-accion (VLA) afinado para robotica de manipulacion. Lo publica el usuario taalyelxor como parte del proyecto Part IV #40 de la University of Auckland (2026), dentro del repositorio VLAP4P. Se trata de un fine-tuning de OpenVLA-OFT sobre el checkpoint base moojink/openvla-7b-oft-finetuned-libero-spatial-object-goal-10, adaptado a nueve tareas de pick-and-place sobre mesa con un brazo Franka FR3 real.

La particularidad de esta variante es la camara: solo se ha modificado la vista cenital (overhead) para que coincida con la camara Azure Kinect real de la celula robotica. Las mismas 621 trayectorias (125 demostraciones humanas mas 496 aceptadas de Isaac Lab Mimic, 115.604 pasos) se volvieron a renderizar desde estados de simulador guardados con una camara cenital colocada a partir de dos fotografias de la celula real. Las acciones, la propiocepcion, las instrucciones y la vista de muneca permanecen sin cambios.

Es relevante ahora porque documenta explicitamente un caso frecuente de confusion en robotica: dos politicas distintas comparten el numero de paso 310000 (una para la camara de referencia y otra para la camara Azure), y la model card insiste en nombrar cada politica por su run y su rig de camara, no por su step. La evaluacion publicada es unicamente en simulacion; la validacion en robot real esta pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en transformer, derivada de OpenVLA-OFT sobre OpenVLA-7B; fine-tuning con LoRA rank 32, action head y proprio projector |
| Parametros totales | no disponible en la model card (el nombre del modelo base indica un backbone de 7B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se detallan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License (heredada del backbone Llama 2 de OpenVLA-OFT) |
| Formato de pesos | safetensors (pesos fusionados, adaptador LoRA, action head y proprio projector) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de OpenVLA-OFT, una variante optimizada de OpenVLA cuyo backbone de lenguaje es Llama 2 y que incorpora una cabeza de accion y un proyector de propiocepcion. La receta de entrenamiento declarada usa LoRA con rango 32, batch de 8, learning rate 5e-5, augmentacion de imagen y 10.000 pasos sobre FR3 anadidos a los 300.000 pasos del checkpoint upstream LIBERO, de ahi el identificador "310000". La model card no detalla el numero de tokens de contexto, la composicion completa del dataset ni si hubo etapas de RLHF o DPO.

Los datos de entrenamiento son completamente simulados (Isaac Lab): 125 demostraciones humanas y 496 demostraciones aceptadas de Isaac Lab Mimic, que suman 621 trayectorias y 115.604 pasos. A diferencia de la politica de referencia, esta variante vuelve a renderizar esas trayectorias con una camara cenital ubicada para replicar dos fotografias de la celula real. Un punto critico declarado es que la pose de camara esta "photo-matched, not a measured calibration": no procede de una calibracion medida, por lo que se recomienda ejecutar la comprobacion de camara en la consola FR3 antes de usar la politica en un robot.

El preprocesado de imagen es obligatorio y especifico: frame de color crudo de Azure Kinect en 16:9 (entrenado a 1280x720) en RGB, recorte cuadrado central de 720x720 sobre 1280x720, rotacion de 180 grados, redimensionado bilineal a 256x256 y, por ultimo, el recorte central del 90 por ciento propio de OpenVLA-OFT hasta 224x224. El artefacto `policy_artifact.json` registra este paso como `preprocessing.overhead_rotate_crop_256: true`, y el runtime rechaza cualquier artefacto cuyo preprocesado no implemente. La imagen de muneca (640x480) se usa tal cual.

## Capacidades

- Control robotico de manipulacion: genera acciones para tareas de pick-and-place sobre mesa con un brazo Franka FR3.
- Multitarea: entrenada para nueve tareas de pick-and-place, con instrucciones en lenguaje natural.
- Entrada multimodal: combina una vista cenital (camara Azure Kinect) y una vista de muneca, ademas de propiocepcion.
- Ejecucion condicionada por instruccion de texto: la accion se genera a partir de la tarea descrita.
- Integracion con golden tests: incluye fixtures (`tests/fixtures/fr3_policy_golden_azure.*`) con entradas fijas y las salidas esperadas de esta politica para verificar el comportamiento en otra maquina.
- Trazabilidad de artefacto: manifiestos de run y de completion con SHA256 del checkpoint y hash del rig de camara.
- No se declaran capacidades de conversacion general, tool calling, agentes, matematicas, generacion de codigo, vision generica, audio ni modo de razonamiento explicito.

## Casos de uso

- Manipulacion robotica de pick-and-place en laboratorio: el modelo genera acciones de agarre y colocacion para tareas de mesa, condicionadas por la instruccion y la imagen cenital, adecuado para experimentos de investigacion en robotica de manipulacion.
- Reproduccion de resultados en simulacion: al incluir fixtures y manifiestos con hashes, permite verificar de forma determinista que una politica produce las mismas acciones en otra maquina, util para validacion de pipelines academicos.
- Adaptacion de politicas a una celula real: al re-renderizar demostraciones con una camara cenital que imita la celula fisica, sirve como paso previo a la transferencia sim-a-real antes de afinar con datos reales.
- Benchmarking interno de fine-tuning LoRA: la receta concreta (rank 32, batch 8, LR 5e-5, 10.000 pasos) permite comparar el efecto del rango de LoRA y del numero de pasos sobre la tasa de exito.
- Investigacion en preprocesado de vision para VLA: documenta un pipeline de preprocesado especifico y su impacto en el exito, util para estudiar como cambios de encuadre o rotacion afectan al control.
- Estudio de robustez frente a calibracion de camara: al ser una pose "photo-matched" y no calibrada, es un caso de estudio sobre el riesgo de desajuste entre la camara de entrenamiento y la real.
- Base para entrenamiento multi-tarea adicional: parte de un checkpoint LIBERO de 300.000 pasos, lo que la hace util como punto de partida para nuevas tareas de mesa.

## Benchmarks y rendimiento

No se han publicado resultados completos de benchmarks en la informacion disponible. El unico dato cuantitativo es una comprobacion rapida en simulacion sobre la tarea "bowl on plate" (16 episodios, seeds 0-15, exito estricto) para varios checkpoints:

| Checkpoint (step) | Exitos / 16 episodios |
|---|---|
| 302500 | 8 |
| 305000 | 13 |
| 307500 | 11 |
| 310000 | 13 |

La evaluacion completa de las nueve tareas y de los brazos supervisados se ejecuto en la noche del 4-5 de octubre; los resultados se publican en `docs/AZURE_CAMERA_POLICY.md`. La evaluacion en robot real esta pendiente.

## Requisitos de hardware

- VRAM: la model card indica que se necesita una GPU con unos 16 GB libres. El repositorio ocupa 15,9 GB.
- GPU recomendadas: no se especifican modelos concretos; por el requisito de 16 GB, encajan tarjetas de gama alta con esa VRAM libre (por ejemplo, una RTX 4090 de 24 GB, o GPUs de datacenter con 16 GB o mas disponibles).
- GPU de consumo: es probable que quepa en tarjetas de consumo con 16 GB o mas de VRAM libre, aunque la model card no lo confirma.
- Despliegue: se usa mediante el repositorio VLAP4P (`scripts/bootstrap.sh --role fr3`) y `scripts/fr3_console.py` apuntando al `policy_artifact.json`. Requiere `transformers` 4.40.1 (otras versiones funcionan pero cambian las acciones).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Camara / proposito | Licencia |
|---|---|---|---|---|---|
| taalyelxor/vlap4p-fr3-azure-310000 (este) | VLA (OpenVLA-OFT) | no disponible (backbone 7B) | no disponible | FR3, camara cenital Azure, 9 tareas de mesa | Llama 2 Community License |
| taalyelxor/vlap4p-fr3-310000 (politica de referencia) | VLA (OpenVLA-OFT) | no disponible | no disponible | FR3, rig de vision de referencia; genero los resultados de simulacion del informe | Llama 2 Community License |
| moojink/openvla-7b-oft-finetuned-libero-spatial-object-goal-10 (modelo base) | VLA (OpenVLA-OFT) | 7B (por nombre) | no disponible | LIBERO spatial/object/goal; checkpoint upstream de 300.000 pasos | no disponible |

Nota: "este" y la politica de referencia comparten step (310000) pero difieren en run y rig de camara; no son intercambiables.

## Limitaciones y advertencias

- Evaluacion solo en simulacion: los resultados publicados corresponden a simulacion con la camara photo-matched; la evaluacion en robot real esta pendiente.
- Pose de camara no calibrada: la colocacion de la camara se ajusto a partir de fotografias, no de una calibracion medida. Antes de usar la politica en un robot hay que ejecutar la comprobacion de camara en la consola FR3.
- Preprocesado obligatorio y silencioso: si no se aplican exactamente los pasos 2-5 documentados (recorte 720x720, rotacion 180 grados, resize a 256x256 y recorte propio de OpenVLA-OFT a 224x224), la politica falla sin avisar. El runtime rechaza artefactos cuyo preprocesado no implemente.
- Sensibilidad a la version de librerias: se requiere `transformers` 4.40.1; otras versiones cambian las acciones.
- Confusion de checkpoints: existe otra politica con el mismo step 310000. Hay que nombrar siempre por run y rig de camara.
- Ambito limitado: nine tareas de pick-and-place; no es un modelo de proposito general ni de conversacion.
- Idiomas soportados: no disponibles.
- Riesgo de alucinacion: la model card no reporta tasas de fallo mas alla del exito estricto en simulacion; no hay datos sobre comportamientos no deseados en entornos no vistos.
- Sesgos conocidos: no se documentan sesgos especificos.
- Licencia: hereda la Llama 2 Community License a traves del backbone Llama 2 de OpenVLA-OFT; el uso comercial esta sujeto a los terminos de dicha licencia, que no es de codigo abierto puro.
- Datos de entrenamiento simulados (Isaac Lab); no incluyen imagenes ni personas del mundo real, pero tampoco cubren la variabilidad visual real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/taalyelxor/vlap4p-fr3-azure-310000
- Modelo base: https://huggingface.co/moojink/openvla-7b-oft-finetuned-libero-spatial-object-goal-10
- Licencia Llama 2 Community License: https://ai.meta.com/llama/license/
- OpenVLA-OFT (MIT): repositorio referenciado por el autor; no se proporciona URL directa en la informacion disponible.
- Repositorio VLAP4P: referenciado en la model card (comandos `scripts/bootstrap.sh --role fr3` y `scripts/fr3_console.py`); no se proporciona URL directa.
- Documentacion interna referenciada: `docs/FR3_REAL_BRINGUP.md`, `docs/AZURE_CAMERA_POLICY.md`, `configs/azure_overhead/README.md`; no se proporcionan URLs.
- Los resultados de busqueda web recibidos no guardan relacion con el modelo (contenido de manga) y se han descartado.
