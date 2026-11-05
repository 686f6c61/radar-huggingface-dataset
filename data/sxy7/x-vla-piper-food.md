# SXY7/X-VLA-Piper-food

## Resumen

X-VLA-Piper-food es un ajuste fino de plena parametrizacion del modelo base 2toINF/X-VLA-Pt, un modelo de vision-lenguaje-accion (VLA) orientado a control roboticos. El autor, SXY7, lo ha entrenado sobre un conjunto de datos de manipulacion con el brazo robotico Piper, especializandose en tareas de manipulacion de alimentos. El repositorio contiene 17 checkpoints completos de entrenamiento, desde el paso 40.000 hasta el 200.000, cada uno con pesos en safetensors, configuracion de procesador y tokenizer, metadatos de normalizacion de tareas y estado del optimizador.

El modelo resuelve el problema de mapear observaciones visuales y proprioceptivas a acciones motoras continuas de siete dimensiones (seis articulaciones mas gripper). La entrada combina dos vistas RGB de 224x224 (camara superior y camara de muneca derecha, con una tercera vista enmascarada) y siete valores medidos de articulaciones y gripper como propriocepcion. La salida son treinta acciones absolutas de siete dimensiones, lo que implica un horizonte de prediccion de 30 pasos de control.

Es relevante ahora porque demuestra el flujo de trabajo de ajuste fino completo sobre X-VLA, un modelo base de investigacion en robotica, y porque publica el estado de entrenamiento completo (incluido el estado de AdamW, RNG y argumentos de entrenamiento), lo que facilita la reproducibilidad y la reanudacion de entrenamientos. No obstante, se trata de un artefacto de investigacion con documentacion limitada, sin licencia declarada y sin resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en X-VLA; detalles internos no disponibles |
| Parametros totales | no disponible (tamano de checkpoint de aproximadamente 10,56 GB en safetensors, consistente con un modelo del orden de 5.000 millones de parametros en fp16/bf16, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors), mas configuracion de modelo, procesador y tokenizer, piper_manifest.json y training_state.pt |
| Dimension de accion | 7 (real_action_dim=7), max_action_dim=20, action_mode=auto |
| Horizonte de acciones | 30 acciones absolutas de 7 dimensiones |
| Entradas visuales | RGB superior y RGB de muneca derecha, 224x224; tercera vista enmascarada |
| Propriocepcion | 7 valores medidos de articulaciones y gripper |
| Checkpoints publicados | 17 (pasos 40.000 a 200.000 en incrementos de 10.000) |
| Dependencias | X-VLA en commit 6c4ecfb8be458ae7c0c96094e4b0add4174f4fe2, Transformers 4.51.3 |

## Arquitectura y entrenamiento

La arquitectura subyacente es X-VLA, un modelo de vision-lenguaje-accion que procesa observaciones visuales multimodales junto con propriocepcion y genera secuencias de acciones motoras. El modelo se carga mediante las clases XVLA y XVLAProcessor del repositorio de X-VLA, con configuracion especifica para este ajuste: modo de accion automatico, dimension real de accion de 7 y dimension maxima de accion de 20. La tercera vista del modelo se enmascara, de modo que solo se usan dos camaras RGB.

El entrenamiento consistio en un ajuste fino de plena parametrizacion sobre el modelo base 2toINF/X-VLA-Pt, con 200.000 pasos registrados. Se conservan 17 checkpoints completos con estado de AdamW, numero de paso, estado del generador de numeros aleatorios y argumentos de entrenamiento. El autor indica que el entrenador de recuperacion no preservo un cursor exacto del dataset iterable, lo que es una limitacion menor para la reproducibilidad exacta. No se especifican el numero de tokens, la composicion del dataset, ni si hubo RLHF o DPO; tampoco se detalla ninguna innovacion tecnica adicional mas alla del propio diseno de X-VLA.

## Capacidades

- Control roboticos de manipulacion: genera acciones continuas de siete dimensiones (articulaciones mas gripper) a partir de observaciones visuales y proprioceptivas.
- Percepcion visual multimodal: procesa dos vistas RGB de 224x224 (camara superior y muneca derecha) de forma simultanea.
- Integracion de propriocepcion: incorpora siete valores medidos de articulaciones y gripper como entrada adicional.
- Prediccion de secuencias de accion: emite 30 acciones absolutas consecutivas por inferencia, lo que permite ejecutar politicas con horizonte de control.
- Especializacion en manipulacion de alimentos: el ajuste fino esta orientado a tareas de comida con el brazo Piper.
- No se ha documentado soporte de tool calling, function calling, razonamiento multi-paso, capacidades multilingues, vision general, audio ni modo de pensamiento. Al ser un modelo VLA, sus capacidades de lenguaje general no estan documentadas en la informacion disponible.

## Casos de uso

- Manipulacion de alimentos con brazo Piper: el modelo recibe las imagenes de las camaras superior y de muneca y la propriocepcion del robot, y emite las acciones de articulaciones para tareas como recoger, colocar o servir alimentos. Es adecuado porque el ajuste fino se ha realizado especificamente sobre este dominio y este hardware.
- Investigacion en aprendizaje por imitacion: los 17 checkpoints con estado completo de entrenamiento permiten analizar la evolucion de la politica a lo largo de 200.000 pasos y comparar el rendimiento en distintos puntos del entrenamiento.
- Reanudacion y depuracion de entrenamientos: al incluir training_state.pt con el estado de AdamW, el paso y el RNG, se puede reanudar el entrenamiento o reproducir condiciones experimentales en un laboratorio de robotica.
- Evaluacion de modelos VLA base: sirve como referencia de ajuste fino de X-VLA para comparar con otros ajustes sobre el mismo modelo base y el mismo robot.
- Prototipado de politicas de control en entornos de cocina simulados o reales: las 30 acciones por inferencia permiten desplegar politicas con horizonte de control en bucles de control a baja frecuencia.
- Transferencia a tareas similares: el manifiesto piper_manifest.json documenta la normalizacion de tareas y los metadatos del dataset, lo que facilita adaptar el modelo a variantes de la tarea de alimentos con el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El checkpoint en safetensors ocupa aproximadamente 10,56 GB, por lo que en precision de 16 bits se necesitarian al menos unos 11-12 GB de VRAM solo para los pesos, mas memoria para activaciones y procesamiento de imagenes.
- GPU recomendadas: no especificadas por el autor. Por tamano de checkpoint, serian razonables GPUs con 24 GB o mas, como RTX 3090, RTX 4090, A100 o H100, aunque no hay confirmacion oficial.
- ¿Cabe en GPU de consumo? Probablemente en RTX 3090 o RTX 4090 con 24 GB en fp16, y en GPUs de 16 GB solo con cuantizacion, que no esta publicada. No confirmado.
- Opciones de despliegue: la unica via documentada es cargar el modelo con XVLA y XVLAProcessor del repositorio de X-VLA en el commit 6c4ecfb8be458ae7c0c96094e4b0add4174f4fe2 con Transformers 4.51.3. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| X-VLA-Piper-food (SXY7) | no disponible (checkpoint de aprox. 10,56 GB) | no disponible | VLA ajustado para robot Piper | no disponible | HuggingFace, 17 checkpoints |
| 2toINF/X-VLA-Pt | no disponible | no disponible | VLA base | no disponible | HuggingFace (modelo base) |
| Otros ajustes de X-VLA | no disponible | no disponible | VLA ajustados | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la informacion proporcionada, por lo que la comparativa se limita a la relacion con el modelo base.

## Limitaciones y advertencias

- Sin licencia declarada: no se especifica licencia, por lo que no se puede asumir permiso para uso comercial ni para redistribucion.
- Sin resultados de benchmarks: no hay evidencia publicada de la calidad de las politicas aprendidas ni de su tasa de exito en tareas reales.
- Especializacion estrecha: el ajuste esta limitado a tareas de alimentos con el robot Piper y a la configuracion exacta de camaras y propriocepcion descrita; no se espera generalizacion a otros robots o dominios.
- Dependencia de versiones concretas: requiere el commit 6c4ecfb8be458ae7c0c96094e4b0add4174f4fe2 de X-VLA y Transformers 4.51.3, lo que puede dificultar la integracion en entornos con otras versiones.
- Normalizacion critica: es imprescindible preservar las estadisticas de normalizacion y el domain_id de piper_manifest.json; ignorarlas produce acciones incorrectas.
- Reproducibilidad parcial: el entrenador de recuperacion no preservo un cursor exacto del dataset iterable, lo que impide reproducir bit a bit el orden de las muestras.
- Riesgo de alucinacion y sesgos: no documentados, pero al ser un modelo de investigacion sin evaluacion publicada no se pueden descartar comportamientos erroneos en entornos no vistos.
- Artefacto de investigacion: el repositorio parece ser una publicacion de checkpoints de entrenamiento mas que un modelo listo para produccion; la documentacion es minima y no hay demos ni informes tecnicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SXY7/X-VLA-Piper-food
- Modelo base: https://huggingface.co/2toINF/X-VLA-Pt
- Repositorio de X-VLA (referenciado por el autor): no disponible como URL en la informacion proporcionada; el autor indica el commit 6c4ecfb8be458ae7c0c96094e4b0add4174f4fe2
- Paper, blog, demo o repositorio adicionales: no disponibles en la informacion proporcionada
