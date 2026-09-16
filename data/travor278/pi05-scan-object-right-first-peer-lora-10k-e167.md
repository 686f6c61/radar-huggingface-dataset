# Travor278/pi05-scan-object-right-first-peer-lora-10k-e167

## Resumen

El repositorio `Travor278/pi05-scan-object-right-first-peer-lora-10k-e167` contiene un checkpoint de inferencia en formato JAX/Orbax para el ecosistema OpenPI, correspondiente a un ajuste fino con LoRA de un modelo de la familia pi0.5 (visión-lenguaje-acción orientado a robótica). Según la model card, se trata de un adaptador de la serie de entrenamiento autorizada "Sim12" que resuelve una tarea concreta de manipulación denominada `scan-object-right-first`. El autor publica únicamente los pesos de inferencia y los activos de normalización asociados, sin estado de optimizador, `train_state` ni estado reanudable del cargador de datos.

El modelo se entrenó durante 10.000 actualizaciones del optimizador con batch global 16, `GA1`, `FSDP1` y semilla 87431, sobre el dataset `Shiki42/ctr-scan-object-right-first-20260911`. La configuración emplea acciones articulares en formato delta y una máscara de pérdida con relleno temporal. El horizonte de acción es 50, un parámetro que la propia model card distingue explícitamente de los 10 pasos de difusión (`diffusion num_steps`).

Su relevancia es acotada y muy específica: no es un modelo de propósito general ni un LLM conversacional, sino una política robótica de una sola tarea, pensada para reproducir y comparar recetas de ajuste fino LoRA dentro de una serie de experimentos. El repositorio no declara licencia, idiomas soportados ni parámetros del modelo base, y la model card advierte que los resultados de evaluación se registran aparte en SwanLab y no se derivan de la simple finalización de la subida. El tamaño del repositorio es de 6,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (etiquetado como `pi05` dentro del ecosistema OpenPI; checkpoint JAX/Orbax, no Transformers) |
| Parametros totales | no disponible (tamano del repositorio: 6,3 GB, sin desglose de parametros) |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Parametros del adaptador LoRA | no disponible (receta identificada como "LoRA10k": 10.000 actualizaciones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card indica que no se realizo ninguna conversion de formato) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | JAX/Orbax (checkpoint de inferencia; no es safetensors ni GGUF) |
| Horizonte de accion | 50 (distinto de `diffusion num_steps` = 10) |
| Tamano del repositorio | 6,3 GB |
| Tarea | `scan-object-right-first` (manipulacion robotica, tarea unica) |
| Libreria de carga | `openpi` |
| Dataset de entrenamiento | `Shiki42/ctr-scan-object-right-first-20260911` en el commit `be60537cfa80d6020514d23bda14dd72d924e91f` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Los metadatos lo etiquetan como `pi05` dentro del ecosistema OpenPI, con pesos en formato JAX/Orbax, lo que implica que el modelo se ejecuta sobre el stack de JAX y no sobre `transformers`, PyTorch o `safetensors`. La model card es explicita al respecto: "This is not a Transformers/safetensors model". Tampoco se publican datos sobre el numero de tokens, la composicion del dataset ni la existencia de fases de RLHF o DPO, mas alla del ajuste supervisado descrito.

Lo que si se documenta con detalle es el procedimiento de ajuste: 10.000 actualizaciones del optimizador, batch global 16, `GA1` (sin acumulacion de gradientes), `FSDP1` (sharding de parametros en la primera dimension), semilla 87431, acciones articulares en formato delta y una mascara de perdida con relleno temporal. El entrenamiento parte de una receta de tipo LoRA, lo que sugiere que solo se actualiza un subconjunto de pesos sobre un modelo base congelado. El checkpoint publicado es de inferencia: incluye los parametros completos del modelo y los activos de normalizacion emparejados, pero excluye el estado del optimizador, el `train_state` y el estado de reanudacion del `data_loader`. El autor verifico cada fichero fuente con SHA-256 contra el recibo de recarga en CPU antes de subirlo, e inventario los ficheros de inferencia en `CHECKPOINT_MANIFEST.json`.

## Capacidades

- Generacion de acciones motoras en espacio articular para una tarea de manipulacion concreta (`scan-object-right-first`), con acciones expresadas como deltas respecto al estado actual.
- Ejecucion de politicas de horizonte largo: el horizonte de accion es 50, con 10 pasos de difusion por defecto durante la inferencia.
- Inferencia sobre el runtime de OpenPI en JAX, cargando el subdirectorio `10000/` como `checkpoint_dir`.
- Normalizacion de observaciones y acciones mediante los activos incluidos en `10000/assets`, configurables a traves de las variables de entorno `PARALLELVLA_DATASET_REPO` y `PARALLELVLA_NORM_ASSETS_DIR`.
- Uso como punto de comparacion ("peer recipe") dentro de la serie Sim12 de recetas LoRA, con configuracion cualificada y configuracion de inferencia OpenPI incluidas en `provenance`.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): la naturaleza robotica implica entrada sensorial y salida de acciones, pero la model card no especifica modalidades de entrada, resolucion de imagen ni encoder visual.

## Casos de uso

- Reproduccion de experimentos de ajuste fino LoRA en robótica: el repositorio permite replicar exactamente una receta con semilla, batch y configuracion documentados, util para estudios de ablacion sobre el numero de actualizaciones del optimizador.
- Comparacion de recetas "peer" dentro de la serie Sim12: al compartir formato de checkpoint, horizonte de accion y esquema de normalizacion, este modelo sirve como referencia frente a otros checkpoints de la misma serie para aislar el efecto de los datos de entrenamiento.
- Evaluacion de politicas en simulacion: cargando el checkpoint en OpenPI y apuntando `checkpoint_dir` a `10000/`, se puede desplegar la politica en un entorno simulado que reproduzca la tarea `scan-object-right-first` y medir tasas de exito.
- Estudio de transferencia sim-a-real: la combinacion de acciones delta en espacio articular y horizonte 50 es un punto de partida habitual para probar si una politica entrenada en simulacion mantiene el rendimiento en un brazo real, siempre que el espacio de acciones coincida.
- Linea base para nuevas iteraciones de entrenamiento: aunque el checkpoint no incluye `train_state` ni estado del optimizador (por lo que no se puede reanudar el entrenamiento), si permite partir de los pesos afinados para un ajuste posterior o para inicializar una variante.
- Auditoria y trazabilidad de artefactos: el uso de `CHECKPOINT_MANIFEST.json` y la verificacion SHA-256 de cada fichero lo convierten en un ejemplo util para pipelines internos que exigen procedencia verificable de los pesos.
- Analisis de eficiencia de LoRA en VLA: al tratarse de un ajuste LoRA de 10.000 pasos, resulta adecuado para estudiar el coste computacional y la memoria necesaria en comparacion con un ajuste completo del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados de evaluacion se registran en `https://swanlab.cn/@Travor/CTR-PI05-LoRA10k` y advierte explicitamente de que la finalizacion de la subida no implica resultados de evaluacion. No se proporcionan cifras de exito de tarea, MMLU, HumanEval, GSM8K ni ninguna otra metrica, y este tipo de checkpoint robotico no se evalua habitualmente con esos benchmarks de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el repositorio ocupa 6,3 GB, por lo que los pesos en precision de 16 bits deberian caber en GPU con 16 GB de VRAM; con margen para activaciones, buffers de normalizacion y el runtime de JAX, se recomienda un minimo de 24 GB.
- GPU recomendadas: no especificadas por el autor. Para uso mono-GPU, tarjetas de 24 GB o mas (RTX 3090, RTX 4090, L40S, A100 40 GB). El entrenamiento original uso `FSDP1`, lo que sugiere ejecuciones multi-GPU en el rango de A100/H100.
- Compatibilidad con GPU de consumo: probable en RTX 3090 y RTX 4090 (24 GB) si el modelo base esta en el rango de 3.000 a 4.000 millones de parametros, dato que no se confirma en la informacion disponible. No se garantiza en tarjetas de 8 o 12 GB.
- Opciones de despliegue: exclusivamente el runtime de OpenPI sobre JAX, cargando el subdirectorio `10000/` como `checkpoint_dir` y configurando `PARALLELVLA_DATASET_REPO` y `PARALLELVLA_NORM_ASSETS_DIR`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje en formato `safetensors` o GGUF.
- Requisito adicional: es necesario usar la version compatible del codigo fuente de OpenPI para PI0.5 y su entorno de configuracion base.
- Latencia y throughput estimados: no disponibles. La model card solo indica que el horizonte de accion es 50 y que `diffusion num_steps` es 10, sin cifras de latencia por inferencia.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de benchmarks ni especificaciones de los modelos comparables, por lo que la tabla siguiente recoge unicamente lo que puede afirmarse con certeza.

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `Travor278/pi05-scan-object-right-first-peer-lora-10k-e167` | no disponible | no disponible | `scan-object-right-first` (tarea unica) | no disponible | JAX/Orbax | HuggingFace, 0 descargas |
| Modelo base de la familia pi0.5 (OpenPI) | no disponible en la informacion | no disponible | VLA de proposito general | no disponible en la informacion | no disponible en la informacion | repositorio OpenPI del proyecto |
| Otros checkpoints "peer" de la serie Sim12 | no disponible | no disponible | tareas especificas de la serie | no disponible | JAX/Orbax | presumiblemente en el mismo perfil de autor, no confirmado |
| Alternativas VLA de terceros (por ejemplo, familias tipo OpenVLA o RT-2) | no disponible | no disponible | manipulacion general | no disponible | no disponible | no verificado en la informacion proporcionada |

La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo ni sobre sus alternativas: los unicos resultados obtenidos fueron generadores de codigos QR, sin relacion con el contenido de la ficha.

## Limitaciones y advertencias

- Modelo de tarea unica: esta ajustado especificamente para `scan-object-right-first`; no debe esperarse comportamiento generalizable a otras tareas de manipulacion sin un nuevo ajuste.
- Sin resultados de evaluacion publicados en la informacion disponible: la propia model card advierte de que la evaluacion se registra aparte y no se deduce de la subida del checkpoint. No hay evidencia publica de rendimiento.
- Licencia no declarada: la ausencia de licencia explicita impide determinar si se permite el uso comercial. En produccion, este punto debe resolverse antes de cualquier despliegue.
- Idiomas no declarados: no aplica un soporte multilingue en el sentido habitual; las instrucciones de tarea, si existen, no estan documentadas.
- Formato no convertible facilmente: al ser un checkpoint JAX/Orbax sin conversion de formato, no puede cargarse con herramientas estandar de inferencia de LLM ni con `transformers`.
- No reanudable: al excluir el estado del optimizador, el `train_state` y el estado del `data_loader`, no es posible reanudar el entrenamiento desde este checkpoint.
- Dependencia estricta del entorno: requiere la version compatible del codigo OpenPI para PI0.5, la configuracion base correspondiente y la definicion de variables de entorno concretas; cualquier desajuste de version puede impedir la carga.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de acciones erroneas o fuera de distribucion cuando la politica se ejecuta fuera del entorno simulado o con objetos distintos a los del dataset de entrenamiento.
- Sesgos: no disponibles. El dataset de entrenamiento no se describe en detalle, por lo que no puede evaluarse su cobertura ni posibles sesgos de escenario.
- Senales de validacion externa nulas: 0 descargas y 0 likes, sin documentacion de terceros que confirme el comportamiento del checkpoint.
- Tamanos de descarga elevados: 6,3 GB por checkpoint, lo que encarece almacenar y comparar multiples variantes de la serie.
- Fecha de creacion atipica: la model card indica 2026-09-15 como fecha de creacion, lo que conviene verificar por si se trata de un error de metadatos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Travor278/pi05-scan-object-right-first-peer-lora-10k-e167
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-scan-object-right-first-20260911
- Registro de evaluacion en SwanLab: https://swanlab.cn/@Travor/CTR-PI05-LoRA10k
- Proyecto OpenPI (runtime requerido, referenciado en la model card): no se proporciona URL en la informacion disponible
- Paper o publicacion tecnica asociada: no disponible
- Demo o espacio interactivo: no disponible
- Nota sobre la busqueda web: los resultados devueltos correspondian a generadores de codigos QR y no guardaban relacion con el modelo, por lo que se han descartado.
