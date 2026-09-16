# Travor278/pi05-pick-dual-bottles-right-first-peer-lora-10k-e163

## Resumen

El modelo identificado como `Travor278/pi05-pick-dual-bottles-right-first-peer-lora-10k-e163` es un checkpoint de inferencia derivado de PI0.5 (la familia de modelos vision-lenguaje-accion de Physical Intelligence distribuida a traves de la libreria openpi) y ajustado mediante LoRA para una tarea robotica concreta: recoger dos botellas con la mano derecha. No es un modelo de lenguaje generalista ni un modelo multimodal conversacional, sino una politica de control (policy) entrenada por imitacion sobre demostraciones de robot.

El checkpoint procede de la serie de entrenamiento denominada Sim12 y ha sido publicado por el usuario Travor278 en formato JAX/Orbax, sin conversion a safetensors ni a GGUF. Segun la model card, contiene unicamente los parametros completos del modelo mas los activos de normalizacion asociados, y excluye el optimizador, el `train_state` y el estado de reanudacion del `data_loader`. El autor indica explicitamente que se trata de un artefacto de solo inferencia y que debe cargarse pasando `10000/` como `checkpoint_dir`.

Su relevancia es acotada pero clara para el nicho de la robotica open source: documenta de forma reproducible una receta LoRA sobre PI0.5 (10.000 actualizaciones del optimizador, batch global 16, FSDP1, seed 87431) junto con el dataset y los activos de normalizacion necesarios para reproducir la evaluacion. El repositorio ocupa 6,3 GB y no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (checkpoint derivado de PI0.5; la model card solo indica que es un modelo JAX/Orbax y que no es un modelo Transformers/safetensors) |
| Parametros totales | no disponible |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el autor menciona un "action horizon 50", que es el horizonte de accion y no la ventana de contexto) |
| Tipos de cuantizacion | no disponible; no se ha realizado ninguna conversion de formato, por lo que no hay GGUF ni cuantizaciones publicadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible (campo de licencia vacio en HuggingFace y ausente en la model card) |
| Formato de pesos | JAX/Orbax (checkpoint de solo inferencia, sin conversion). No es safetensors ni GGUF |
| Tamano del repositorio | 6,3 GB |
| Libreria | openpi |
| Tarea declarada | robotics (manipulacion: pick-dual-bottles-right-first) |
| Adaptacion | LoRA (receta "peer"), 10.000 actualizaciones del optimizador |
| Dataset de entrenamiento | `Shiki42/ctr-pick-dual-bottles-right-first-20260911` en el commit `f0745c8ffdd63e1af44cf252a20274238998dfb1` |
| Semilla | 87431 |
| Fecha de creacion | 2026-09-15 |
| Fecha de actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base. La model card unicamente precisa que se trata de un checkpoint JAX/Orbax de solo inferencia perteneciente a la serie Sim12, derivado de PI0.5 mediante una receta LoRA ("peer recipe"). El autor advierte de forma explicita que el artefacto no es un modelo Transformers/safetensors y que requiere el codigo fuente OpenPI compatible con PI0.5 y su entorno de configuracion base.

Los hiperparametros de entrenamiento si estan documentados: 10.000 actualizaciones del optimizador, batch global de 16, acumulacion de gradiente de 1 (GA1), paralelismo FSDP1, semilla 87431 y una funcion de perdida con mascara de relleno temporal ("temporal-padding loss mask") sobre acciones articulares expresadas como deltas ("delta joint actions"). El autor distingue de forma explicita entre el horizonte de accion 50 y los 10 pasos de difusion (`diffusion num_steps 10`), dos parametros que no deben confundirse. Se incluyen bajo `provenance` la configuracion cualificada exacta y la configuracion OpenPI orientada a inferencia, y se indica que todos los ficheros fuente fueron verificados con SHA-256 contra el recibo original de recarga en CPU antes de la subida, con un inventario en `CHECKPOINT_MANIFEST.json`.

## Capacidades

- Generacion de acciones de robot para una tarea de manipulacion concreta: recoger dos botellas con la mano derecha ("pick-dual-bottles-right-first").
- Control condicionado por lenguaje e imagen, heredado del modelo base PI0.5 de la familia openpi.
- Prediccion de acciones articulares en formato delta, con horizonte de accion 50.
- Muestreo de acciones basado en difusion con 10 pasos (`num_steps 10`), segun la model card.
- Inferencia en JAX con pesos Orbax, cargando `10000/` como `checkpoint_dir`.
- Normalizacion de observaciones y acciones mediante los activos de normalizacion emparejados incluidos en `10000/assets`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modo de pensamiento; son capacidades de modelos conversacionales que no aplican a este artefacto.
- Capacidades multilingues: no disponible.
- Ajuste adicional mediante LoRA sobre la receta publicada: no se documenta, pero la estructura del checkpoint es coherente con reentrenamiento o evaluacion de la misma tarea.

## Casos de uso

- Despliegue de una politica de picking bimanual en un banco de laboratorio: el checkpoint se carga en el entorno OpenPI compatible y se usa para ejecutar la tarea de recoger dos botellas con la mano derecha, con horizonte de accion 50 para reducir la frecuencia de replanificacion.
- Reproduccion de resultados de investigacion: el autor publica hiperparametros completos (10.000 updates, batch 16, GA1, FSDP1, seed 87431) y el commit exacto del dataset, lo que permite replicar el entrenamiento y comparar curvas en el panel de Swanlab asociado.
- Punto de partida para nuevas recetas LoRA: al ser un ajuste LoRA sobre PI0.5, sirve como referencia de estructura de directorios (`10000/`, `assets/`) y de convenciones de normalizacion para entrenar variantes sobre otras tareas.
- Evaluacion comparativa de recetas de ajuste: el nombre del modelo incluye "peer" y "LoRA10k", lo que sugiere su uso dentro de una familia de experimentos comparables (distintos tamaños de LoRA, distintos presupuestos de actualizaciones) para medir el efecto del ajuste.
- Validacion de pipelines de inferencia JAX/Orbax: util para equipos que quieran probar la carga de checkpoints Orbax, la inyeccion de activos de normalizacion y el consumo de acciones en un bucle de control real, antes de invertir en entrenamientos propios.
- Pruebas de integracion en simulacion: dado que la serie se denomina Sim12 y que la evaluacion se registra externamente, el modelo encaja en flujos de validacion en simulador antes de transferir la politica a hardware.
- Auditoria de integridad de artefactos: el repositorio incluye verificacion SHA-256 y un manifiesto de ficheros de inferencia, lo que lo hace util como ejemplo de publicacion reproducible de checkpoints roboticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion se registran en `https://swanlab.cn/@Travor/CTR-PI05-LoRA10k` y que no se derivan de la simple finalizacion de la subida del checkpoint. No se proporcionan tasas de exito, ni metricas de error de accion, ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. Como referencia orientativa, el repositorio ocupa 6,3 GB, por lo que un checkpoint en precision reducida requiere al menos ese orden de magnitud de memoria solo para los pesos, mas el coste de activaciones y del entorno JAX; esta cifra es una estimacion propia, no confirmada por el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada. El autor no especifica hardware de referencia.
- Compatibilidad con GPU de consumo: no disponible. No se puede confirmar si cabe en una RTX 4090 u otras GPU de gama alta sin datos de parametros y precision.
- Opciones de despliegue: el autor indica el uso del codigo fuente OpenPI compatible con PI0.5 y su entorno de configuracion base. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la model card advierte de que no se ha realizado ninguna conversion de formato.
- Variables de entorno requeridas: `PARALLELVLA_DATASET_REPO` (apuntando al dataset de entrenamiento) y `PARALLELVLA_NORM_ASSETS_DIR` (apuntando al directorio local `10000/assets`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. Como referencia estructural, este checkpoint se situaria frente a:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Travor278/pi05-pick-dual-bottles-right-first-peer-lora-10k-e163` | no disponible | no disponible | no disponible | no disponible | HuggingFace, 0 descargas, 0 likes |
| Modelo base PI0.5 (openpi) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| Otras recetas "peer" de la misma serie Sim12 | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Licencia no disponible: el campo de licencia esta vacio tanto en HuggingFace como en la model card. No se puede asumir ningun permiso de uso comercial ni de redistribucion sin consultar al autor.
- Modelo de un solo proposito: es una politica entrenada para la tarea concreta "pick-dual-bottles-right-first". No es un modelo de proposito general y no debe esperarse que generalice a otras tareas de manipulacion sin reentrenamiento.
- Artefacto de solo inferencia: el checkpoint excluye optimizador, `train_state` y estado de reanudacion del `data_loader`, por lo que no permite reanudar el entrenamiento tal cual.
- Dependencia estricta de formato: al no haberse realizado conversion, requiere el codigo fuente OpenPI compatible con PI0.5 y su entorno de configuracion base; no funciona con cargadores genericos de safetensors ni con runtimes de GGUF.
- Dependencia de activos externos: necesita los activos de normalizacion locales (`10000/assets`) y las variables de entorno `PARALLELVLA_DATASET_REPO` y `PARALLELVLA_NORM_ASSETS_DIR` correctamente configuradas; una configuracion incorrecta invalida las predicciones.
- Ambiguedad de parametros: el autor advierte de que el horizonte de accion 50 es distinto de los 10 pasos de difusion. Confundir ambos valores altera el comportamiento del control.
- Riesgo de alucinacion o de acciones fuera de distribucion: no se documenta, pero al ser un modelo entrenado por imitacion sobre un dataset acotado, es esperable degradacion ante observaciones alejadas de la distribucion de entrenamiento. No hay datos publicados que cuantifiquen este efecto.
- Idiomas soportados: no disponibles; no se puede garantizar el comportamiento ante instrucciones en castellano u otros idiomas.
- Sesgos: no documentados en la informacion disponible.
- Estado de validacion: sin descargas ni likes, y sin resultados de evaluacion publicados en el propio repositorio. La model card remite a un panel externo de Swanlab para las metricas, por lo que el rendimiento real no esta verificado en la ficha.
- Fechas del repositorio: la fecha de creacion indicada (2026-09-15) y las referencias temporales del dataset deben verificarse antes de asumir cualquier estado de mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/Travor278/pi05-pick-dual-bottles-right-first-peer-lora-10k-e163
- Panel de evaluacion (Swanlab): https://swanlab.cn/@Travor/CTR-PI05-LoRA10k
- Dataset de entrenamiento: `Shiki42/ctr-pick-dual-bottles-right-first-20260911`, commit `f0745c8ffdd63e1af44cf252a20274238998dfb1`
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
