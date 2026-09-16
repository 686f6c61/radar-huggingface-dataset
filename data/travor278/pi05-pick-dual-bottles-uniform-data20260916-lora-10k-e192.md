# Travor278/pi05-pick-dual-bottles-uniform-data20260916-lora-10k-e192

## Resumen

Este repositorio contiene un checkpoint de inferencia del modelo PI0.5 (familia openpi de Physical Intelligence) ajustado con LoRA para una tarea robotica concreta: coger dos botellas en simulacion. Lo publica el usuario Travor278 y se distribuye en formato JAX/Orbax, sin conversion a safetensors. El identificador del modelo indica el pipeline completo: base PI0.5, tarea pick-dual-bottles, dataset uniforme con revision 20260916, entrenamiento LoRA de 10000 actualizaciones de optimizador y epoca 192 (E192).

El modelo no es un LLM de proposito general ni un modelo de lenguaje: es un modelo vision-lenguaje-accion (VLA) que recibe observaciones visuales e instrucciones en lenguaje natural y emite comandos motores. En concreto, produce un horizonte de accion de 50 pasos con 12 dimensiones articulares, representadas como incrementos (delta) para las articulaciones y valores absolutos para las pinzas. El checkpoint esta pensado para evaluacion en simulacion con el stack openpi, no para despliegue autonomo en robot real sin validacion adicional.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un ajuste LoRA sobre PI0.5 en una tarea manipulativa de picking doble, con manifiesto de integridad, revision de dataset fijada y commit de codigo fuente compatible. El autor declara explicitamente que no se reclama ninguna tasa de exito en simulacion para este checkpoint, y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto de investigacion reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) de la familia PI0.5, con expertos de accion y flow matching; checkpoint JAX/Orbax |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible; horizonte de accion de 50 pasos |
| Tipos de cuantizacion | no disponible; no se publican pesos GGUF, AWQ, GPTQ ni cuantizaciones equivalentes |
| Idiomas soportados | no disponible (las instrucciones de tarea se asumen en el idioma del dataset, no declarado) |
| Licencia | no disponible |
| Formato de pesos | JAX/Orbax (directorio `10000/`), sin conversion a safetensors |

Datos adicionales del repositorio: 6,3 GB de tamano, creado el 2026-09-16, actualizado el mismo dia, 0 descargas y 0 likes, pipeline declarado `robotics`.

## Arquitectura y entrenamiento

El checkpoint pertenece a PI0.5 (etiquetado como `pi05` y `openpi`), la familia de modelos VLA de Physical Intelligence orientada a control robotico de proposito general. La ficha no detalla la arquitectura interna mas alla de su naturaleza VLA, pero si describe la interfaz: entrada visual y de estado, salida de acciones con horizonte 50, 12 dimensiones articulares donde las articulaciones se representan como delta y las pinzas como valores absolutos. El ajuste se realizo con LoRA, y segun la regla estandar de congelacion de OpenPI, ademas de los adaptadores LoRA se entrenan el codificador de vision y las cabezas de salida. No se realizo conversion a safetensors, por lo que el checkpoint mantiene el formato nativo JAX/Orbax y requiere el stack openpi para cargarse.

El entrenamiento partio de pesos base frescos de PI0.5 y ejecuto 10000 actualizaciones del optimizador con batch de 16 por experimento, acumulacion de gradientes 1 (GA1), FSDP1, semilla 87431 y mascara de perdida con relleno temporal (temporal-padding loss mask). Se lanzaron dos experimentos independientes que compartieron una misma GPU H100. El dataset es `Shiki42/ctr-pick-dual-bottles-uniform-20260916`, fijado en la revision `9c6e24b90a0511b2f6d2021670870e6f9bdecd06`. La configuracion de referencia es `pi05_putcab_athenb_fullhorizon_mb16_ga1_lora3ep` sobre el commit de OpenPI `4f3a66b9a9864a0916bd29b5902ecf04a2283fd1`; el nombre historico de la config no altera la tarea ni el dataset. No se menciona RLHF, DPO ni ninguna fase de alineacion adicional. El checkpoint fuente supero una recarga independiente en CPU y una comprobacion de parametros finitos, y los ficheros de inferencia se rehashearon antes de la subida (ver `CHECKPOINT_MANIFEST.json`).

## Capacidades

- Generacion de acciones motoras: produce trayectorias de 50 pasos con 12 dimensiones articulares (delta en articulaciones, absoluto en pinzas).
- Manipulacion visual guiada por lenguaje: la tarea entrenada es coger dos botellas en simulacion a partir de observaciones visuales.
- Control de pinzas: representacion absoluta de apertura/cierre, adecuada para agarre de objetos.
- Inferencia con normalizacion incluida: el repositorio incorpora los activos de normalizacion necesarios (`10000/assets`).
- Integracion con el ecosistema openpi: compatible con una configuracion y commit concretos del codigo fuente oficial.
- Capacidades multilingues: no disponible.
- Tool calling, function calling y razonamiento multi-paso agentico: no aplicable; es un modelo de control robotico, no un modelo de lenguaje conversacional.
- Vision, audio, thinking mode: se asume vision como entrada por su naturaleza VLA, aunque la ficha no lo desglosa; audio y modo de razonamiento explicito no disponibles.
- Inferencia exclusivamente: no incluye estado del optimizador, estado de reanudacion del cargador de datos ni checkpoints de entrenamiento, por lo que no permite continuar el entrenamiento tal cual.

## Casos de uso

- Evaluacion reproducida de una tarea de picking doble en simulacion: cargando `10000/` como `checkpoint_dir` con la configuracion indicada, un equipo puede replicar el ajuste y medir su propia tasa de exito, que el autor no publica.
- Punto de partida para nuevos ajustes LoRA: el checkpoint y sus activos de normalizacion sirven como base para reentrenar la misma tarea con mas datos o con variaciones de posicion de las botellas.
- Comparacion de estrategias de ajuste: al estar fijados batch 16, GA1, FSDP1, semilla y numero de actualizaciones, es util como brazo de control en estudios sobre LoRA en modelos VLA.
- Generacion de datos sinteticos de manipulacion: las trayectorias de 50 pasos pueden registrarse como demostraciones sinteticas para aumentar un dataset de agarre.
- Validacion de pipelines de inferencia openpi: sirve para comprobar la integracion de `PARALLELVLA_DATASET_REPO`, `PARALLELVLA_NORM_ASSETS_DIR` y `PI05_JAX_BASE` en un entorno de simulacion antes de pasar a modelos mayores.
- Pruebas de regresion de infraestructura: dado que incluye un manifiesto de hashes, es util para verificar rutas de carga, recarga en CPU y comprobaciones de integridad de pesos en un cluster con GPU H100 o A100.
- Benchmark interno de latencia de control: permite medir el coste por chunk de 50 acciones en una GPU concreta, aunque no haya cifras publicadas de throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ninguna tasa de exito en simulacion para este checkpoint nuevo. Las metricas de entrenamiento se encuentran en el run E192 de la plataforma externa enlazada por el autor, pero no se reproducen cifras en la ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa no verificada, el repositorio ocupa 6,3 GB, lo que sugiere que los pesos caben holgadamente en GPUs de 16 GB o mas; esta cifra es una estimacion a partir del tamano del repositorio y no un dato declarado por el autor.
- GPU recomendadas: el entrenamiento se realizo en H100 (dos experimentos compartiendo una GPU), de modo que una H100 es suficiente para el pipeline completo; A100 y GPUs de gama alta equivalentes son candidatas razonables para inferencia.
- GPU de consumo: no hay confirmacion oficial de funcionamiento en RTX 4090, RTX 3090 u otras GPUs de consumo. El stack JAX/Orbax y los requisitos de openpi condicionan mas la viabilidad que la VRAM.
- Opciones de despliegue: el unico camino soportado es el stack openpi con JAX/Orbax. No hay pesos GGUF, safetensors ni conversion equivalente, por lo que vLLM, llama.cpp, Ollama y TGI no son aplicables directamente sin una conversion previa no incluida.
- Requisitos de entorno: hay que fijar `PARALLELVLA_DATASET_REPO` y `PARALLELVLA_NORM_ASSETS_DIR` al directorio local `10000/assets`, usar el commit de OpenPI `4f3a66b9a9864a0916bd29b5902ecf04a2283fd1` y apuntar `PI05_JAX_BASE` a un directorio de parametros base PI0.5 verificado por separado. El repositorio no es una instalacion Python autonoma.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este checkpoint, por lo que la comparacion es estructural y no de resultados.

| Modelo | Tipo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (PI0.5 LoRA pick-dual-bottles) | VLA afinado con LoRA | no disponible | no disponible; horizonte de accion 50 | JAX/Orbax | no disponible | Publico en HuggingFace, 0 descargas |
| PI0.5 base (Physical Intelligence / openpi) | VLA generalista | no disponible en esta informacion | no disponible | JAX/Orbax | no disponible en esta informacion | Requerido como `PI05_JAX_BASE`; se obtiene por separado |
| PI0 (openpi) | VLA predecesor | no disponible en esta informacion | no disponible | JAX/Orbax | no disponible en esta informacion | Publico dentro del ecosistema openpi |
| OpenVLA | VLA de codigo abierto | no disponible en esta informacion | no disponible | safetensors | no disponible en esta informacion | Publico, comunidad amplia |

Las cifras de parametros, contexto y licencia de los modelos comparados no se pueden verificar con la informacion proporcionada en esta busqueda, por lo que se marcan como no disponibles en lugar de estimarse.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica licencia en la ficha ni en la model card, lo que impide determinar si el uso comercial esta permitido. Tratar como uso restringido hasta aclararlo con el autor.
- Sin tasa de exito declarada: el autor indica explicitamente que no se reclama ningun resultado de exito en simulacion para este checkpoint, y que es distinto del modelo E165 anterior.
- Tarea unica y estrecha: el ajuste esta especializado en coger dos botellas en simulacion; no se debe esperar generalizacion a otras tareas, objetos o entornos sin reentrenamiento.
- Sesgos y sobreajuste al dataset: al entrenarse sobre un unico dataset con distribucion uniforme fijada en una revision concreta, el comportamiento fuera de esa distribucion (iluminacion, texturas, posiciones, tipo de botella) es incierto.
- Riesgo de fallo silencioso en robot real: aunque el checkpoint supero una recarga en CPU y una comprobacion de parametros finitos, eso no valida el comportamiento fisico. No hay evidencia de despliegue en hardware real.
- Restricciones de formato: al no existir conversion a safetensors ni cuantizaciones, el checkpoint queda atado a un commit concreto de openpi y a la presencia de los parametros base PI0.5, lo que complica la reproducibilidad a medio plazo.
- Solo inferencia: no incluye optimizador ni estado de reanudacion, por lo que no se puede continuar el entrenamiento desde este artefacto sin reconstruir el estado.
- Idiomas no declarados: no se especifica en que idioma estan las instrucciones de tarea del dataset.
- Ausencia de validacion externa: 0 descargas y 0 likes implican que no hay evidencia de uso independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-pick-dual-bottles-uniform-data20260916-lora-10k-e192
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-pick-dual-bottles-uniform-20260916
- Metricas de entrenamiento (run E192): https://swanlab.cn/@Travor/CTR-PI05-LoRA10k
- Los resultados de busqueda web devueltos para esta consulta no contienen enlaces relevantes al modelo: corresponden a paginas de descarga y acceso de WhatsApp, sin relacion con el artefacto.
- Paper, blog o repositorio oficial de PI0.5 y openpi: no disponibles en la informacion proporcionada.
