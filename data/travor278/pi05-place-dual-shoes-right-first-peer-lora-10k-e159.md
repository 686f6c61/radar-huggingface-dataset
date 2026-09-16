# Travor278/pi05-place-dual-shoes-right-first-peer-lora-10k-e159

## Resumen

`Travor278/pi05-place-dual-shoes-right-first-peer-lora-10k-e159` es un checkpoint de inferencia del modelo vision-lenguaje-accion (VLA) PI0.5 (π0.5), desarrollado por el usuario Travor278 y publicado bajo la libreria `openpi`. Se trata de una adaptacion mediante LoRA sobre la receta "peer" de PI0.5, entrenada durante 10000 actualizaciones del optimizador sobre el conjunto de datos `Shiki42/ctr-place-dual-shoes-right-first-20260911`. El modelo resuelve una tarea concreta de manipulacion robotica: colocar un par de zapatos, empezando por el derecho. No es un modelo de lenguaje general, sino una politica de control que produce acciones motoras continuas a partir de observaciones visuales y consignas de tarea.

El checkpoint esta serializado en formato JAX/Orbax (no safetensors ni GGUF) y contiene unicamente los parametros completos del modelo y los activos de normalizacion asociados; se excluyen el estado del optimizador, `train_state` y el estado de reanudacion del cargador de datos. El repositorio ocupa 6.3 GB. Esta pensado para cargarse directamente con la fuente compatible de OpenPI para PI0.5, pasando `10000/` como `checkpoint_dir`.

Su relevancia radica en que documenta una receta de ajuste fino reproducible (LoRA, FSDP1, mascara de perdida con relleno temporal y acciones articulares en delta) que puede servir de referencia a equipos que trabajan en imitacion learning y en el despliegue de politicas VLA en entornos simulados. Los resultados de evaluacion se registran externamente en SwanLab y no se derivan de la simple finalizacion de la subida del checkpoint.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) PI0.5 con adaptadores LoRA; serializada en JAX/Orbax. No se detallan mas especificaciones en la model card |
| Parametros totales | no disponible. Estimacion a partir del tamano del repo (6.3 GB, parametros completos): en torno a 3 000 millones si el almacenamiento es bf16. Dato no confirmado por el autor |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible. El checkpoint se distribuye en precision de entrenamiento; no incluye variantes cuantizadas |
| Idiomas soportados | no disponible. La consigna de tarea se procesa como entrada de texto, pero no se declara cobertura idiomatica |
| Licencia | no disponible |
| Formato de pesos | JAX/Orbax (no safetensors, no GGUF). El autor indica explicitamente que no es un modelo Transformers/safetensors |

Datos adicionales del repositorio: etiquetas `openpi`, `robotics`, `pi05`, `jax`, `lora`; tarea declarada `robotics`; 0 descargas y 0 "likes" en el momento de la consulta; repositorio de 6.3 GB; creado el 2026-09-15.

## Arquitectura y entrenamiento

El modelo es una adaptacion LoRA de PI0.5, un modelo fundacional VLA de la familia desarrollada para control robotico (arquitectura base detallada no disponible en la informacion proporcionada). El checkpoint es de solo inferencia y contiene los parametros completos resultantes del ajuste, junto con los activos de normalizacion emparejados. No se realizo conversion de formato alguna, por lo que los pesos permanecen en su representacion JAX/Orbax original.

El entrenamiento se ejecuto sobre el conjunto `Shiki42/ctr-place-dual-shoes-right-first-20260911` (commit `4ea9520624c3bbefbb9db057b45c0ef187ed49a8`) con los siguientes hiperparametros declarados: 10000 actualizaciones del optimizador, batch global de 16, acumulacion de gradiente 1 (GA1), paralelismo FSDP1 y semilla 87431. La funcion de perdida emplea acciones articulares en delta y una mascara de perdida con relleno temporal (temporal-padding loss mask). La configuracion cualificada exacta y la configuracion OpenPI orientada a inferencia se incluyen en el directorio de procedencia. Como detalle operativo, el autor aclara que el horizonte de accion 50 es un parametro distinto del numero de pasos de difusion (`num_steps` 10). Todos los ficheros fuente fueron verificados con SHA-256 contra el recibo de recarga en CPU antes de la subida, y `CHECKPOINT_MANIFEST.json` inventaria unicamente los ficheros de inferencia.

## Capacidades

- Generacion de politicas de manipulacion robotica: produce trayectorias de accion articular (en delta) a partir de observaciones visuales y una consigna de tarea, con un horizonte de accion de 50 pasos.
- Control especifico de tarea: colocacion de un par de zapatos empezando por el pie derecho, entrenado sobre un unico conjunto de demostraciones.
- Inferencia en el stack OpenPI con backend JAX, cargando el checkpoint mediante `checkpoint_dir = 10000/`.
- Integracion con activos de normalizacion emparejados para reescalar observaciones y acciones en tiempo de inferencia.
- Receta de ajuste fino LoRA reproducible: configuracion, semilla, plan de paralelismo y mascaras de perdida documentados en el directorio de procedencia.
- Soporte de tool calling / function calling: no aplica (modelo de control robotico, no asistente conversacional).
- Soporte de agentes y razonamiento multi-paso en lenguaje: no aplica.
- Capacidades multilingues: no disponible.
- Capacidades especiales: no se declaran modos de razonamiento extendido, vision general ni audio; la vision se emplea exclusivamente como entrada para la politica de control.

## Casos de uso

- Manipulacion robotica de colocacion de calzado en simulacion: el modelo recibe la observacion y la consigna de tarea y emite un bloque de 50 acciones articulares en delta, adecuado para ejecutar la secuencia de "colocar el zapato derecho primero" en un banco de pruebas simulado.
- Evaluacion de recetas de ajuste fino con LoRA sobre PI0.5: al documentar updates, batch global, FSDP1, semilla y mascara de perdida, sirve como punto de comparacion controlado frente a otras variantes de la misma serie de entrenamiento.
- Investigacion en imitacion learning y VLA: util para estudiar como generaliza una politica entrenada sobre una sola tarea y que fallos aparecen fuera de la distribucion de las demostraciones.
- Estudios de transferencia sim-a-real: el autor indica que proviene de la "serie de entrenamiento Sim12", por lo que es un candidato para medir la brecha entre el rendimiento en simulador y en hardware real antes de invertir en reentrenamiento.
- Reproduccion y auditoria de experimentos: los ficheros estan verificados con SHA-256 y existe un `CHECKPOINT_MANIFEST.json`, lo que permite reproducir una carga de inferencia exacta y auditar la procedencia de los pesos.
- Generacion de trayectorias de referencia para aumento de datos: las acciones producidas pueden registrarse como trayectorias sinteticas y usarse para ampliar el conjunto de demostraciones de la misma tarea.
- Comparacion de hiperparametros en pipelines de investigacion: al ser una variante LoRA10k concreta, permite aislar el efecto del numero de actualizaciones y de la configuracion de adaptadores frente a otros checkpoints de la misma serie.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que los resultados de evaluacion se registran en `https://swanlab.cn/@Travor/CTR-PI05-LoRA10k` y que no se derivan de la finalizacion de la subida del checkpoint. No se proporcionan cifras de exito de tarea, error de posicion ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 6.3 GB; si los parametros completos estan en bf16, el peso del modelo rondaria los 6-7 GB, a lo que hay que sumar activaciones y el estado del planificador de difusion (10 pasos). Una reserva practica de 16 GB de VRAM es un punto de partida razonable, aunque no esta confirmado por el autor.
- GPU recomendadas: no disponibles. Por el tamano estimado, GPU de centro de datos como A100, H100 o L40S son adecuadas; una RTX 4090 de 24 GB deberia ser suficiente para inferencia si el modelo cabe en ese presupuesto de memoria, extremo no verificado.
- Compatibilidad con GPU de consumo: probable en tarjetas con 24 GB o mas (RTX 3090, RTX 4090) segun la estimacion anterior, pero no confirmada.
- Opciones de despliegue: exclusivamente el stack OpenPI con backend JAX/Orbax. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI; tampoco se ofrece una ruta de conversion a safetensors o GGUF.
- Variables de entorno requeridas: `PARALLELVLA_DATASET_REPO` (apuntando al dataset de entrenamiento) y `PARALLELVLA_NORM_ASSETS_DIR` (apuntando al directorio local `10000/assets`). Se debe usar la fuente OpenPI compatible con PI0.5 y su entorno de configuracion base.
- Latencia y throughput estimados: no disponibles. Como referencia estructural, la generacion de cada bloque de acciones implica 10 pasos de difusion para un horizonte de 50 acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| pi05-place-dual-shoes-right-first-peer-lora-10k-e159 | no disponible (estimado ~3 000 M) | no disponible | Manipulacion robotica: colocacion de calzado | no disponible | JAX/Orbax | HuggingFace, 0 descargas |
| PI0.5 (modelo base de Physical Intelligence) | no disponible | no disponible | VLA generalista de control robotico | no disponible | no disponible | no disponible en la informacion proporcionada |
| Otras variantes "peer" de la misma serie Sim12 | no disponible | no disponible | Tareas de manipulacion especificas | no disponible | JAX/Orbax | no disponible en la informacion proporcionada |

No se dispone de datos numericos que permitan una comparacion cuantitativa con OpenVLA, RT-2, GR00T N1 ni con el propio PI0.5 base. Cualquier comparacion de rendimiento seria especulativa.

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse si se permite el uso comercial ni bajo que condiciones. Tratar como no autorizado para produccion hasta verificar la licencia.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de tasa de exito ni de robustez, ni siquiera en simulacion.
- Especializacion extrema: el modelo esta entrenado para una unica tarea (colocacion de un par de zapatos empezando por el derecho) sobre un unico conjunto de datos. No cabe esperar generalizacion a otras tareas de manipulacion.
- Riesgo de fallo fuera de distribucion: al ser una politica de imitacion, es probable que degrade ante iluminacion, posiciones de objeto o configuraciones no vistas en las demostraciones. No aplica el concepto de alucinacion textual, pero si el de acciones erroneas o inseguras.
- Checkpoint de solo inferencia: no incluye optimizador, `train_state` ni estado del cargador de datos, por lo que no se puede reanudar el entrenamiento desde el.
- Dependencia estricta del stack: requiere la version compatible de OpenPI para PI0.5, su entorno de configuracion base, la variable `PARALLELVLA_DATASET_REPO` y el directorio de activos de normalizacion. No funciona con pipelines estandar de Transformers, vLLM o llama.cpp.
- Confusion posible de parametros: el horizonte de accion (50) y el numero de pasos de difusion (10) son valores distintos; mezclarlos altera la configuracion de inferencia.
- Formato propietario JAX/Orbax: no se ha realizado conversion a safetensors ni GGUF, lo que limita la portabilidad y el uso fuera del ecosistema JAX.
- Ausencia de senal de comunidad: 0 descargas y 0 "likes"; no hay retroalimentacion externa que valide el artefacto.
- Idiomas no declarados: se desconoce como procesa consignas de tarea en idiomas distintos del usado durante el entrenamiento.
- Estado de evaluacion: el autor advierte explicitamente de que la finalizacion de la subida no implica resultados de evaluacion; hay que consultar SwanLab para conocer el rendimiento real.
- Fechas de creacion y actualizacion (2026-09-15) deben tratarse como metadatos del repositorio y verificarse antes de citarlas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-place-dual-shoes-right-first-peer-lora-10k-e159
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-place-dual-shoes-right-first-20260911
- Registro de evaluacion en SwanLab: https://swanlab.cn/@Travor/CTR-PI05-LoRA10k
- Ningun otro enlace (papers, blogs, repositorios o demos) aparece en la informacion proporcionada.
