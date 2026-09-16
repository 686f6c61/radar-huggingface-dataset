# Travor278/pi05-place-dual-shoes-left-first-peer-lora-10k-e158

## Resumen

El modelo `Travor278/pi05-place-dual-shoes-left-first-peer-lora-10k-e158` es un checkpoint de inferencia publicado en HuggingFace por el usuario Travor278, perteneciente a la serie de entrenamiento en simulacion denominada Sim12. Se trata de una politica de robotica de la familia pi0.5 (etiqueta `pi05`), empaquetada con la libreria `openpi` y almacenada en formato nativo JAX/Orbax, no en safetensors ni GGUF. El checkpoint corresponde a la tarea concreta "place-dual-shoes-left-first", es decir, la colocacion de un par de zapatos colocando primero el izquierdo, y se ha obtenido mediante un ajuste fino con receta LoRA tras 10.000 actualizaciones del optimizador.

El modelo resuelve el problema de generar acciones motoras (posiciones articulares) a partir de observaciones visuales y de estado del robot, con un horizonte de accion declarado de 50 pasos. Es relevante en el contexto de investigacion en vision-lenguaje-accion (VLA) porque publica un checkpoint de inferencia completo, con los parametros del modelo y los activos de normalizacion emparejados, junto con un manifiesto de ficheros y verificacion SHA-256, lo que facilita la reproducibilidad de la receta. El autor indica explicitamente que no es un modelo Transformers/safetensors y que no se ha realizado ninguna conversion de formato.

El repositorio ocupa 6,3 GB e incluye los parametros completos del modelo, aunque excluye el optimizador, el `train_state` y el estado reanudable del `data_loader`. No se declara licencia, idiomas soportados ni numero de parametros en la informacion proporcionada. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 15 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-lenguaje-accion (VLA) de la familia pi0.5 segun la etiqueta `pi05` y la libreria `openpi`; la model card no detalla la arquitectura interna |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (se declara un horizonte de accion de 50 pasos, distinto de `diffusion num_steps=10`) |
| Tipos de cuantizacion | no disponible; el checkpoint se distribuye en la precision nativa de JAX/Orbax, sin conversion de formato |
| Idiomas soportados | no disponible (modelo de robotica; no se declaran capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | JAX/Orbax (checkpoint binario); no es safetensors ni GGUF |
| Libreria | openpi |
| Tamano del repositorio | 6,3 GB |
| Pipeline declarado | robotics |
| Dataset de entrenamiento | `Shiki42/ctr-place-dual-shoes-left-first-20260911`, commit `04d72a4c1770fa4699a4c8630b41484b33f18c54` |
| Actualizaciones del optimizador | 10.000 |
| Batch global | 16 (GA1, FSDP1) |
| Semilla | 87431 |
| Tipo de acciones | delta joint actions, con mascara de perdida por temporal padding |
| Estado incluido | Parametros completos y activos de normalizacion emparejados; sin optimizador, `train_state` ni estado del `data_loader` |
| Fecha de creacion | 2026-09-15 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Por las etiquetas (`openpi`, `pi05`, `jax`, `lora`) y la libreria declarada, el checkpoint pertenece a la familia pi0.5 del ecosistema OpenPI, orientada a politicas vision-lenguaje-accion que combinan un backbone de vision-lenguaje con un experto de acciones. Esta adscripcion familiar no viene confirmada con detalle en la informacion proporcionada, por lo que cualquier afirmacion sobre el numero de parametros, el encoder visual o el mecanismo de generacion de acciones debe tratarse como no verificada.

En cuanto al entrenamiento, el autor especifica 10.000 actualizaciones del optimizador con batch global 16, sin acumulacion de gradiente (GA1) y con FSDP1, partiendo de la semilla 87431. Las acciones se representan como delta joint actions y la perdida emplea una mascara de temporal padding. La receta se etiqueta como "peer recipe LoRA10k", aunque el checkpoint publicado contiene los parametros completos del modelo, no unicamente el adaptador. Se incluyen la configuracion cualificada exacta y la configuracion OpenPI orientada a inferencia dentro del apartado de procedencia. El autor distingue explicitamente el horizonte de accion (50) del numero de pasos de difusion (`num_steps=10`), una distincion relevante para interpretar los resultados de evaluacion.

El checkpoint es de solo inferencia. Para ejecutarlo es necesario definir las variables de entorno `PARALLELVLA_DATASET_REPO` (apuntando al dataset de entrenamiento) y `PARALLELVLA_NORM_ASSETS_DIR` (apuntando a `10000/assets` en local), y usar una fuente OpenPI de PI0.5 compatible con su entorno de configuracion base. Cada fichero fuente fue verificado con SHA-256 contra el recibo original de recarga en CPU antes de la subida, y `CHECKPOINT_MANIFEST.json` inventaria unicamente los ficheros de inferencia.

## Capacidades

- Generacion de acciones motoras para una tarea especifica de manipulacion robotica: colocar un par de zapatos colocando primero el izquierdo.
- Condicionamiento por observaciones visuales y de estado del robot propios del entorno de simulacion Sim12.
- Prediccion de acciones en formato delta joint actions con horizonte de 50 pasos.
- Inferencia con los activos de normalizacion emparejados incluidos en el propio repositorio.
- Ejecucion sobre la pila OpenPI en JAX, con configuracion de inferencia incluida en el apartado de procedencia.
- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, function calling, agentes, multilingue, audio ni modo de pensamiento.

## Casos de uso

- Manipulacion bimanual en simulacion: ejecutar la politica en el entorno Sim12 para la tarea de colocacion de zapatos, usando el checkpoint `10000/` como `checkpoint_dir` y las variables de normalizacion apuntando a los activos locales.
- Punto de partida para ajuste fino con LoRA: la receta declarada (10.000 pasos, batch global 16, FSDP1) sirve como referencia reproducible para adaptar la politica a tareas de pick-and-place similares en el mismo simulador.
- Evaluacion comparativa de recetas de entrenamiento: al fijar semilla, dataset y numero de actualizaciones, permite aislar el efecto de cambios en la receta sobre el exito de la tarea.
- Investigacion en aprendizaje por imitacion: el uso de delta joint actions con mascara de temporal padding y horizonte 50 es un caso de estudio util para analizar el efecto del enmascarado temporal en secuencias de accion variables.
- Validacion de pipelines de inferencia OpenPI: al ser un checkpoint de solo inferencia con manifiesto y verificacion SHA-256, es adecuado para probar la integracion del stack de inferencia antes de desplegar politicas mas costosas.
- Generacion de datos sinteticos en simulador: los rollouts de la politica pueden utilizarse para aumentar el dataset de la tarea o para estudiar modos de fallo de la colocacion de zapatos.
- Estudio de transferencia sim-to-real: con las reservas propias de un entrenamiento exclusivamente en simulacion, el checkpoint puede emplearse como linea base en experimentos de adaptacion al robot real.
- Reproducibilidad y auditoria de artefactos: el inventario `CHECKPOINT_MANIFEST.json` y la comprobacion SHA-256 permiten reconstruir exactamente el conjunto de ficheros de inferencia empleado en un experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que los resultados de evaluacion se registran en el panel externo `https://swanlab.cn/@Travor/CTR-PI05-LoRA10k` y que dichos resultados no se presuponen por el hecho de haber completado la subida del checkpoint. No se proporcionan cifras de tasa de exito, error de posicion, MMLU, HumanEval, GSM8K ni ninguna otra metrica en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 6,3 GB, por lo que se recomienda un minimo de 16 GB de VRAM para cargar los parametros y los activos de normalizacion con margen para activaciones en la generacion de las 50 acciones del horizonte.
- GPU recomendadas: no especificadas por el autor. Por tamano de checkpoint, resultan adecuadas GPU de centro de datos como A100, H100 o L40S, asi como GPU de consumo de gama alta con 24 GB (RTX 3090, RTX 4090).
- Compatibilidad con GPU de consumo: no confirmada. Con 6,3 GB de artefactos en disco, es probable que quepa en GPU de 16 GB o superiores, pero la informacion proporcionada no lo garantiza.
- Opciones de despliegue: pila OpenPI en JAX con checkpoint Orbax. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de texto y no se distribuye en GGUF ni safetensors. Requiere entorno JAX con soporte CUDA y la configuracion base de PI0.5.
- Variables de entorno necesarias: `PARALLELVLA_DATASET_REPO` y `PARALLELVLA_NORM_ASSETS_DIR`.
- Latencia y throughput: no disponibles. El coste por inferencia depende del horizonte de accion (50) y de los pasos de difusion (10), que el autor senala como parametros distintos.

## Comparativa con modelos similares

| Modelo | Familia | Formato de pesos | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-place-dual-shoes-left-first-peer-lora-10k-e158 | pi0.5 (openpi) | JAX/Orbax | Colocacion de par de zapatos (izquierdo primero) | no disponible | Publico en HuggingFace, 0 descargas |
| Modelos base de la familia pi0.5 (openpi) | pi0.5 (openpi) | JAX/Orbax | Politicas VLA generalistas | no disponible | Referenciados por la libreria `openpi` |
| Otras recetas de la serie Sim12 del mismo autor | pi0.5 (openpi) | JAX/Orbax | Tareas especificas de manipulacion | no disponible | No identificadas en la informacion proporcionada |

No se dispone de datos de rendimiento ni de parametros de los modelos comparados, por lo que no es posible establecer una comparacion cuantitativa. Cualquier comparacion fiable exigiria evaluar los checkpoints en el mismo entorno Sim12, con el mismo horizonte de accion y el mismo protocolo de exito.

## Limitaciones y advertencias

- Modelo de proposito especifico: solo cubre la tarea "place-dual-shoes-left-first"; no es un modelo generalista.
- Entrenado en simulacion (serie Sim12): el rendimiento en robot real no esta validado por la informacion disponible y la brecha sim-to-real puede degradar el comportamiento.
- Licencia no declarada: la ausencia de licencia impide asumir permisos de uso comercial o de redistribucion.
- Idiomas no declarados: no es un modelo linguistico; no debe Esperarse soporte multilingue ni generacion de texto.
- Formato no estandar: al no ser safetensors ni GGUF, no puede cargarse con herramientas habituales de inferencia de LLM; requiere la pila OpenPI en JAX.
- Dependencia de activos externos: la inferencia correcta exige apuntar a la revision exacta del dataset (`04d72a4c1770fa4699a4c8630b41484b33f18c54`) y al directorio local `10000/assets`; una discrepancia en la normalizacion invalida las acciones generadas.
- Sin estado reanudable: el checkpoint no incluye optimizador, `train_state` ni estado del `data_loader`, por lo que no sirve para reanudar el entrenamiento tal cual, solo para inferencia o como inicializacion de un ajuste nuevo.
- Riesgo de alucinacion en el sentido de acciones fisicamente invalidas: como toda politica de imitacion, puede producir trayectorias fuera de los limites articulares o colisiones; se recomienda validacion con limites de seguridad a nivel de controlador.
- Sin trazabilidad de evaluacion en el repositorio: las metricas se remiten a un panel externo y el autor advierte que la subida no implica resultados correctos.
- Sesgos del dataset: al entrenarse sobre un unico conjunto de datos de una tarea concreta, hereda los sesgos de posicion, iluminacion y configuracion de objetos presentes en el mismo.
- Descargas y validacion comunitaria nulas (0 descargas, 0 likes): no existe evidencia externa de reproducibilidad independiente.
- Fecha de creacion declarada en 2026, posterior al momento habitual de consulta: conviene verificar la coherencia temporal de los metadatos antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-place-dual-shoes-left-first-peer-lora-10k-e158
- Dataset de entrenamiento: `Shiki42/ctr-place-dual-shoes-left-first-20260911`, revision `04d72a4c1770fa4699a4c8630b41484b33f18c54`
- Panel de evaluacion: https://swanlab.cn/@Travor/CTR-PI05-LoRA10k
- Fuente OpenPI de PI0.5: mencionada en la model card como requisito; no se proporciona URL en la informacion disponible
- Paper o blog tecnico del modelo: no disponible
- Repositorio de codigo propio: no disponible
- Demo: no disponible
- Nota sobre la busqueda web: los resultados devueltos no guardaban relacion con el modelo y no aportan enlaces utilizables.
