# Travor278/pi05-pick-dual-bottles-uniform-peer-lora-10k-e165

## Resumen

El modelo `Travor278/pi05-pick-dual-bottles-uniform-peer-lora-10k-e165` es un checkpoint de inferencia en JAX/Orbax derivado de PI0.5, un modelo de vision-lenguaje-accion (VLA) orientado a robotica. Lo publica el usuario Travor278 dentro de la serie de entrenamiento Sim12 y consiste en un ajuste fino mediante LoRA sobre el recetario "peer" de PI0.5, entrenado durante 10000 actualizaciones del optimizador. El checkpoint esta pensado exclusivamente para inferencia: incluye los parametros completos del modelo y los activos de normalizacion emparejados, pero excluye el optimizador, el `train_state` y el estado reanudable del `data_loader`.

La tarea concreta sobre la que se ha entrenado es la manipulacion `pick-dual-bottles` (recoger botellas dobles) en el dataset `Shiki42/ctr-pick-dual-bottles-uniform-20260911`, con acciones articulares en formato delta y mascara de perdida de tipo temporal-padding. El artefacto se distribuye en formato nativo de OpenPI (no es un modelo de Transformers ni safetensors), con un tamano de repositorio de 6,3 GB y todos los ficheros verificados por SHA-256 antes de la subida.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de ajuste fino eficiente (LoRA) de un VLA sobre un conjunto de datos de robot concreto, y como punto de partida para quien quiera replicar la receta o evaluar el comportamiento de PI0.5 en una tarea de picking concreta. No hay descargas ni likes registrados, no se declara licencia y no se han publicado resultados de evaluacion asociados a esta subida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PI0.5 (modelo de vision-lenguaje-accion) con adaptadores LoRA; detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint sin cuantizar; no se realizo conversion de formato) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | JAX/Orbax (nativo de OpenPI); no safetensors ni GGUF |
| Tamano del repositorio | 6,3 GB |
| Horizonte de accion | 50 |
| Pasos de difusion (`num_steps`) | 10 |
| Directorio de checkpoint | `10000/` |

## Arquitectura y entrenamiento

Se trata de un ajuste fino con LoRA sobre el recetario "peer" de PI0.5, un modelo de vision-lenguaje-accion que combina entrada visual y de lenguaje con generacion de acciones motoras. El entrenamiento se realizo en JAX con particionado FSDP1 (`FSDP1`), batch global de 16, acumulacion de gradiente 1 (`GA1`) y semilla 87431, durante 10000 actualizaciones del optimizador. Las acciones se codifican como acciones articulares delta y la funcion de perdida aplica una mascara de temporal-padding. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

Un detalle tecnico relevante es la separacion explicita entre el horizonte de accion (50) y el numero de pasos de difusion (10), que el autor subraya como parametros distintos. El checkpoint es de solo inferencia: se excluyen el optimizador, el `train_state` y el estado de reanudacion del `data_loader`, y se incluyen los activos de normalizacion emparejados con el dataset de entrenamiento. Para ejecutarlo es necesario fijar las variables `PARALLELVLA_DATASET_REPO` y `PARALLELVLA_NORM_ASSETS_DIR` apuntando al dataset y a `10000/assets` en local, ademas de usar la fuente OpenPI compatible con PI0.5 y su entorno de configuracion base.

## Capacidades

- Generacion de acciones motoras para robotica: el modelo produce comandos de accion (horizonte de 50) a partir de observaciones visuales y consignas, con acciones articulares delta.
- Ejecucion de una tarea especifica: `pick-dual-bottles` (recogida de botellas dobles) segun el dataset de entrenamiento declarado.
- Inferencia en JAX/Orbax mediante OpenPI, cargando el directorio `10000/` como `checkpoint_dir`.
- Uso de activos de normalizacion emparejados: el checkpoint incluye la normalizacion asociada al dataset, necesaria para interpretar correctamente las acciones.
- Ajuste fino eficiente mediante LoRA sobre PI0.5, replicable con la configuracion cualificada incluida en `provenance`.
- Verificacion de integridad: cada fichero fuente se comprobo por SHA-256 contra el recibo original de recarga en CPU antes de la subida, e `CHECKPOINT_MANIFEST.json` inventaria solo los ficheros de inferencia.
- Capacidades de lenguaje, vision general, tool calling, agentes, multilingue, audio o modo "thinking": no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en manipulacion robotica: el checkpoint permite reproducir el comportamiento de PI0.5 ajustado con LoRA sobre una tarea concreta de picking, sirviendo de linea base para comparar variantes de receta (por ejemplo, distintos numeros de actualizaciones o hiperparametros).
- Validacion de recetas de ajuste fino eficiente: al ser un LoRA de 10000 pasos con batch global 16 y FSDP1, es un punto de referencia util para medir cuanto rendimiento se obtiene con un presupuesto de computo acotado frente a un ajuste completo.
- Despliegue en un brazo robotico para la tarea de recogida de botellas dobles: cargando el directorio `10000/` con OpenPI y las variables de entorno de normalizacion, el modelo genera las acciones necesarias en bucle cerrado.
- Evaluacion comparativa de checkpoints de una misma serie: al existir una receta "peer" y un seguimiento de experimentos en SwanLab, el checkpoint permite contrastar la evolucion del entrenamiento frente a otros pasos o semillas.
- Construccion de pipelines de datos y normalizacion: los activos de normalizacion emparejados y la referencia exacta del dataset (`bc608e5695...`) facilitan montar pipelines reproducibles de entrenamiento y evaluacion en simulacion.
- Pruebas de integracion en infraestructura JAX: sirve para validar flujos de carga de checkpoints Orbax, gestion de memoria en GPU y particionado FSDP1 antes de escalar a modelos mayores.
- Auditoria de artefactos de robotica: el inventario `CHECKPOINT_MANIFEST.json` y la verificacion SHA-256 lo hacen adecuado como caso de estudio de trazabilidad y reproducibilidad en publicaciones de modelos roboticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion se siguen en un panel externo de SwanLab y que no se derivan de la finalizacion de la subida. En el momento de redactar esta ficha no se dispone de cifras de exito en la tarea, MMLU, HumanEval, GSM8K ni de metricas equivalentes de robotica (por ejemplo, tasa de exito por episodio).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 6,3 GB e incluye los parametros completos del modelo mas los activos de normalizacion, por lo que el peso de los parametros es del orden de esa cifra; el consumo real de VRAM depende de la implementacion OpenPI/JAX y del particionado, y no se documenta en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada. El tamano del repositorio sugiere que es plausible cargarlo en GPU de consumo de gama alta, pero es una estimacion a partir del tamano de ficheros, no un dato declarado por el autor.
- Opciones de despliegue: OpenPI con runtime JAX/Orbax. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no se distribuye en safetensors ni GGUF y el autor indica explicitamente que no es un modelo de Transformers.
- Variables de entorno requeridas: `PARALLELVLA_DATASET_REPO` y `PARALLELVLA_NORM_ASSETS_DIR`, ademas de la configuracion base de OpenPI para PI0.5.
- Latencia y throughput: no disponibles.
- Requisitos de entrenamiento (si se quisiera reajustar): no disponibles; el checkpoint excluye optimizador y `train_state`, por lo que no permite reanudar el entrenamiento tal cual.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-pick-dual-bottles-uniform-peer-lora-10k-e165 | no disponible | no disponible | no disponible (evaluacion en SwanLab) | no disponible | HuggingFace, 0 descargas, 0 likes |
| PI0.5 (modelo base del que deriva) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion |
| Otras variantes de la serie Sim12 / receta "peer" | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion |

No se dispone de datos comparativos con alternativas de la misma categoria (por ejemplo, otros VLA de robotica open source) en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Licencia no declarada: al no indicarse licencia, no hay autorizacion explicita para uso comercial ni para redistribucion. Es un riesgo legal directo para cualquier uso en produccion.
- Artefacto de solo inferencia: no incluye optimizador, `train_state` ni estado del `data_loader`, por lo que no se puede reanudar el entrenamiento desde este checkpoint.
- Formato no estandar: al ser JAX/Orbax y no safetensors ni GGUF, queda fuera del ecosistema habitual de herramientas de inferencia (vLLM, llama.cpp, TGI, Ollama) y requiere el stack OpenPI.
- Especificidad de tarea: el ajuste esta orientado a `pick-dual-bottles` sobre un dataset concreto; el rendimiento fuera de esa distribucion de tareas, camaras o entornos no esta documentado.
- Dependencia de activos externos: la inferencia correcta exige fijar `PARALLELVLA_DATASET_REPO` y `PARALLELVLA_NORM_ASSETS_DIR` con la version exacta del dataset (`bc608e5695d0225bcb53f0ed3f3a7c16f99e03a1`); usar otra version puede invalidar la normalizacion.
- Ausencia de benchmarks publicados: no hay metricas de exito verificables en la informacion disponible; la evaluacion se remite a un panel externo y no se implica por la finalizacion de la subida.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado en la informacion disponible. Al tratarse de un modelo de accion, los fallos se manifiestan como movimientos incorrectos, que en un robot real implican riesgo fisico.
- Sin validacion de terceros: el modelo tiene 0 descargas y 0 likes, y no se han publicado revisiones independientes.
- Confusion entre hiperparametros: el autor advierte que el horizonte de accion (50) es distinto del numero de pasos de difusion (10); confundirlos al configurar la inferencia altera el comportamiento del modelo.
- Verificacion de integridad: aunque se declara una comprobacion SHA-256 de todos los ficheros, conviene reverificar localmente e inspeccionar `CHECKPOINT_MANIFEST.json` antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-pick-dual-bottles-uniform-peer-lora-10k-e165
- Dataset de entrenamiento: `Shiki42/ctr-pick-dual-bottles-uniform-20260911` (commit `bc608e5695d0225bcb53f0ed3f3a7c16f99e03a1`); URL canonica de HuggingFace no disponible en la informacion proporcionada.
- Seguimiento de evaluacion (SwanLab): https://swanlab.cn/@Travor/CTR-PI05-LoRA10k
- Repositorio OpenPI requerido para la inferencia: URL no disponible en la informacion proporcionada.
- Paper, blog o demo adicionales: no disponibles. Las busquedas web realizadas no devolvieron resultados relacionados con el modelo.
