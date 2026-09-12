# Travor278/pi05-putcab-ctr-train50-v4-lora-10k

## Resumen

`Travor278/pi05-putcab-ctr-train50-v4-lora-10k` es un checkpoint de robotica publicado por el usuario Travor278 en Hugging Face. Se trata de un ajuste fino mediante LoRA sobre `XinY0201/openpi-pi05-base-jax` (compromiso `5e62884fcf8cb8f9fc693c9163ea18d3e3739658`), un modelo base pi0.5 implementado en JAX con un unico *action expert*. El resultado es una politica vision-lenguaje-accion (VLA) especializada en una unica tarea de manipulacion bimanual: abrir el cajon de un armario con el brazo izquierdo y depositar un objeto dentro con el brazo derecho.

El modelo se ha entrenado sobre el dataset `Shiki42/PutCab-CTR-Train50-V4` (50 episodios, 14.531 fotogramas a 16,666 FPS), con estados y acciones absolutos de 14 dimensiones, tres vistas RGB a 224x224, acciones rellenadas (*padded*) a 32 dimensiones y un horizonte de 50 pasos. El entrenamiento se ejecuto en dos GPU H100 de 80 GB con batch global 16 durante 10.000 actualizaciones, congelando los parametros base en bf16 y manteniendo en float32 unicamente los parametros entrenables de los adaptadores LoRA (rango/alpha 16 en el prefijo PaliGemma y 32 en el *expert*).

Su relevancia es acotada pero concreta: es un ejemplo reproducible de adaptacion eficiente (LoRA) de un modelo fundacional de robotica en el ecosistema OpenPI/JAX, con el arbol completo de inferencia y los activos de normalizacion empaquetados en formato Orbax. El autor no publica ningun resultado de exito en rollout, la licencia no esta declarada y no hay datos de benchmarks, por lo que debe tratarse como un artefacto de investigacion o como punto de partida para experimentos adicionales, no como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) derivada de pi0.5; prefijo PaliGemma con LoRA y un unico *action expert*; implementacion en JAX (OpenPI) |
| Parametros totales | no disponible (el autor no declara recuento; el repositorio ocupa 6,3 GB) |
| Parametros activos | no aplica (no se describe como modelo MoE) |
| Longitud de contexto | no disponible (no confundir con el horizonte de accion de 50 pasos) |
| Tipos de cuantizacion | no disponible; el checkpoint se distribuye en precision mixta de entrenamiento (bf16 en parametros congelados, float32 en entrenables) |
| Idiomas soportados | no disponible; el condicionamiento textual se realiza con un unico prompt en ingles |
| Licencia | no disponible |
| Formato de pesos | Orbax (JAX/OpenPI); arbol completo de parametros de inferencia con LoRA, pesos base y activos de normalizacion |
| Entradas | Tres vistas RGB con transformaciones estandar a 224x224 |
| Estado y acciones | 14 dimensiones absolutas nativas; acciones rellenadas a 32 dimensiones; horizonte 50; sin mascara de inactividad, sin transformacion delta y sin conversion de unidades Aloha |
| Dataset de entrenamiento | `Shiki42/PutCab-CTR-Train50-V4` (compromiso `3b9629a729945005dabd7857803218d063134634`), 50 episodios y 14.531 fotogramas a 16,666 FPS |
| Hardware de entrenamiento | 2 x H100 de 80 GB, batch global 16, semilla 87431, 10.000 actualizaciones |
| Prompt | "Open the cabinet drawer with the left arm and place the object into it with the right arm." |
| Tamano del repositorio | 6,3 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base pi0.5 en su implementacion JAX de OpenPI: un modelo vision-lenguaje-accion con *action expert* unico, construido sobre el prefijo PaliGemma (vision y proyecciones) y con parametros de accion expuestos. El ajuste fino se aplica con LoRA de rango/alpha 16 sobre el prefijo PaliGemma y 32 sobre el *expert*, y el filtro de referencia incluye vision y proyecciones entrenables. Las activaciones y los parametros congelados se mantienen en bf16, mientras que los parametros entrenables se conservan en float32. El optimizador es AdamW (beta1 = 0,9, beta2 = 0,95, epsilon = 1e-8, weight decay 1e-10, clipping 1, sin EMA) con un scheduler coseno fijo de 30.000 pasos, 1.000 de *warmup*, pico de 2,5e-5 y valor final de 2,5e-6, detenido en el paso 10.000.

El dataset contiene 50 episodios y 14.531 fotogramas a 16,666 FPS, con estados y acciones absolutos de 14 dimensiones, tres vistas RGB y transformaciones estandar a 224x224, con acciones rellenadas hasta 32 dimensiones y horizonte de 50. No se aplica mascara de inactividad, ni transformacion delta, ni conversion de unidades Aloha. El autor indica que la normalizacion del dataset es independiente, que se paso el decodificador y el tokenizador reales y que se verificaron guardado y recarga del checkpoint en CPU antes de enviarlo a GPU, con restauracion estricta de parametros y estado del optimizador (paso 10.000) y hashes de arrays decodificados conservados. Tambien advierte que el contenedor NGC PyTorch 25.02 ejecuta un entorno JAX separado y no se reclama identidad byte a byte con el runtime historico archivado de CTR.

## Capacidades

- Ejecucion de una unica politica de manipulacion bimanual: abrir el cajon de un armario con el brazo izquierdo y colocar un objeto dentro con el brazo derecho, segun el prompt de texto fijo del entrenamiento.
- Prediccion de secuencias de acciones (*action chunking*) con horizonte de 50 pasos y acciones de 32 dimensiones, a partir de un estado nativo de 14 dimensiones.
- Percepcion visual con tres camaras RGB a 224x224, integradas en el prefijo PaliGemma.
- Condicionamiento por lenguaje natural para seleccionar la tarea (un unico prompt en ingles en los datos de entrenamiento).
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso fuera del bucle de control del robot.
- No se documenta capacidad multilingue ni modo de razonamiento explicito (*thinking mode*).
- No se documentan capacidades de audio, vision generativa ni generacion de texto libre.

## Casos de uso

- Reproduccion de la tarea PutCab en un banco de robot real: el checkpoint esta entrenado exactamente para abrir el cajon con el brazo izquierdo y depositar el objeto con el derecho, con 50 episodios y un prompt fijo, por lo que sirve como politica directa para esa secuencia en un montaje de laboratorio equivalente al de la recoleccion de datos.
- Punto de partida para nuevo ajuste fino con LoRA: los adaptadores son de rango 16 en el prefijo y 32 en el *expert*, lo que permite reentrenar sobre un dataset propio sin tocar los pesos base congelados en bf16.
- Estudio de adaptacion eficiente de modelos fundacionales de robotica: la configuracion completa de AdamW, el scheduler coseno de 30.000 pasos detenido en 10.000 y el uso de LoRA permiten reproducir el experimento de escalado de pasos y comparar con el modelo base sin adaptadores.
- Ablacion frente a `XinY0201/openpi-pi05-base-jax`: al compartir el mismo linaje y formato Orbax, permite medir cuanto aporta el ajuste LoRA sobre la tarea PutCab en igualdad de condiciones de inferencia.
- Investigacion en representacion de acciones: al usar estados y acciones absolutos de 14 dimensiones sin conversion Aloha ni transformacion delta, es util para estudiar el efecto de estas decisiones de preprocesado frente a configuraciones alternativas.
- Integracion en un *pipeline* OpenPI de inferencia en JAX: el arbol completo de parametros en Orbax, junto con los activos de normalizacion, se carga directamente en el runtime OpenPI sobre GPU.
- Auditoria de reproducibilidad de entrenamientos en robotica: la carpeta `10000/experiment/` documenta runtime real, paquetes, configuracion resuelta, compromiso de codigo y parche, vinculacion de GPU, manifiestos de base y dataset, estadisticas, pruebas de guardado en CPU e historial del trabajo, lo que permite reconstruir el experimento paso a paso.
- Docencia y formacion en VLA: es un ejemplo compacto (6,3 GB) de adaptacion de un modelo pi0.5 a una tarea concreta, util para ilustrar el flujo completo de datos, entrenamiento e inferencia en el ecosistema OpenPI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se reclama ninguna tasa de exito en *rollout* ("No rollout success-rate claim") y no se incluyen metricas de tarea, ni comparaciones con el modelo base, ni resultados en suites estandar de robotica.

## Requisitos de hardware

- Entrenamiento documentado: 2 x H100 de 80 GB, batch global 16, 10.000 actualizaciones, con activaciones y parametros congelados en bf16 y parametros entrenables en float32.
- VRAM de referencia en entrenamiento: el propio autor confirma que la configuracion cabe en dos H100 de 80 GB; no se documenta el consumo exacto ni si cabria en una sola GPU.
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el repositorio de 6,3 GB incluye el arbol completo de parametros de inferencia (LoRA mas pesos base mas activos de normalizacion); en bf16 esto situa el orden de magnitud en unos pocos miles de millones de parametros, pero se trata de una estimacion derivada del tamano del repositorio, no de un dato declarado por el autor.
- GPU recomendadas: no disponibles. Por el contexto de entrenamiento, el entorno natural es H100 o A100 de 80 GB; no hay confirmacion de funcionamiento en GPU de gama de consumo.
- Viabilidad en GPU de consumo: no confirmada. No se publican pruebas en RTX 4090, RTX 3090 ni similares.
- Opciones de despliegue: la ruta documentada es OpenPI con JAX y checkpoints Orbax. No se documenta compatibilidad con llama.cpp, Ollama, vLLM o TGI, que no son formatos ni runtimes nativos para este artefacto.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de control, tiempo de inferencia por paso ni rendimiento en Hz.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Ambito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-putcab-ctr-train50-v4-lora-10k (este modelo) | no disponible | VLA con LoRA sobre pi0.5, JAX/OpenPI | Politica de una unica tarea (abrir cajon y colocar objeto) | no disponible | Pesos en Hugging Face en formato Orbax |
| `XinY0201/openpi-pi05-base-jax` (modelo base) | no disponible | VLA pi0.5 en JAX | Modelo fundacional, sin especializar | no disponible | Pesos en Hugging Face |
| OpenVLA | del orden de 7.000 millones (no verificado en esta ficha) | VLA de proposito general | Manipulacion de un solo brazo, multiples tareas | no disponible / consultar | Pesos publicos |
| SmolVLA | del orden de 450 millones (no verificado en esta ficha) | VLA compacto | Manipulacion de un solo brazo, orientado a ejecucion en hardware modesto | no disponible / consultar | Pesos publicos |

La diferencia principal frente a las alternativas es el alcance: OpenVLA y SmolVLA se presentan como politicas generalistas entrenadas sobre colecciones amplias de tareas, mientras que este checkpoint es un adaptador LoRA de una sola tarea, con un prompt fijo y un dataset de 50 episodios. Los datos concretos de parametros, contexto, licencia y rendimiento de las alternativas no forman parte de la informacion proporcionada y se marcan como no disponibles.

## Limitaciones y advertencias

- Especializacion extrema: solo se ha entrenado para la tarea PutCab, con un unico prompt en ingles. Fuera de esa instruccion y de ese montaje de camaras y robot no hay garantia de comportamiento util.
- Ausencia de metricas: el autor declara explicitamente que no se reclama tasa de exito en rollout. No hay benchmarks, ni curvas de aprendizaje, ni evaluacion en simulador.
- Licencia no disponible: no se puede determinar si el uso comercial esta permitido. Debe contactarse con el autor o con los titulares del modelo base antes de cualquier despliegue productivo.
- Dependencia del montaje fisico: al usar estados y acciones absolutos de 14 dimensiones nativas, sin conversion de unidades Aloha, sin transformacion delta y sin mascara de inactividad, la politica asume una configuracion de robot y de espacio de acciones concreta. Aplicarla a otro hardware requiere un preprocesado equivalente.
- Riesgo de sobreajuste al dataset: 50 episodios y 14.531 fotogramas es un volumen pequeno, por lo que cabe esperar escasa generalizacion a cambios de iluminacion, posicion de objetos, fondo o variaciones del cajon.
- Riesgo de alucinacion motora: como cualquier politica generativa de acciones, puede producir trayectorias plausibles pero incorrectas sin senal de incertidumbre, lo que exige limites de parada de seguridad en el robot.
- Idioma: no hay evidencia de soporte de prompts en castellano ni en otros idiomas; todo el condicionamiento documentado esta en ingles.
- Reproducibilidad parcial: el autor advierte que el contenedor NGC PyTorch 25.02 ejecuta un entorno JAX separado y que no se reclama identidad byte a byte con el runtime historico archivado de CTR.
- Estado del optimizador: no se distribuye con el checkpoint (se retiene en la plataforma de entrenamiento), por lo que reanudar el entrenamiento exactamente donde se dejo no es posible solo con este repositorio.
- Sin evaluacion de sesgos ni de seguridad: no se documentan analisis de sesgo, evaluaciones de seguridad fisica ni pruebas de fallo del manipulador.
- Popularidad nula en el momento de la consulta: 0 descargas y 0 likes, sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Travor278/pi05-putcab-ctr-train50-v4-lora-10k
- Modelo base: https://huggingface.co/XinY0201/openpi-pi05-base-jax
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/PutCab-CTR-Train50-V4
- Repositorio del framework OpenPI (mencionado como `library_name` en la model card, no confirmado por los resultados de busqueda): https://github.com/Physical-Intelligence/openpi
- Los resultados de la busqueda web proporcionada no contienen enlaces relevantes al modelo, al dataset ni al proyecto: unicamente devuelven paginas de ayuda de Gmail y foros sobre calculadoras. No se dispone de paper, blog tecnico, demo ni repositorio adicional verificado.
