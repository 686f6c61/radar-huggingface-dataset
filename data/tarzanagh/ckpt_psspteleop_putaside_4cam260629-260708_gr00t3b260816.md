# tarzanagh/ckpt_psspteleop_putaside_4cam260629-260708_gr00t3b260816

## Resumen

El modelo `ckpt_psspteleop_putaside_4cam260629-260708_gr00t3b260816` es un ajuste fino (fine-tune) del modelo base GR00T-N1.7-3B de NVIDIA, especializado en la habilidad robótica **put_aside** (dejar a un lado) para el robot manipulador DexMate Vega. El desarrollo lo firma el usuario `tarzanagh` y se distribuye a través de HuggingFace con una licencia `other`, lo que implica restricciones de uso no estandarizadas que deben revisarse antes de su despliegue.

El modelo resuelve un problema concreto de manipulación robótica: ejecutar la secuencia de recoger, escanear, colocar en báscula, recoger de la báscula y dejar a un lado, todo ello a partir de datos de teleoperación. Su relevancia radica en que demuestra una estrategia de segmentación de datos basada en ventanas de reposo y en la división de la secuencia en el punto de velocidad mínima (lull), lo que permite generar habilidades discretas y robustas a partir de un flujo continuo de teleoperación.

La arquitectura base es un transformer de visión-lenguaje-acción (VLA) con aproximadamente 3.000 millones de parámetros, aunque los detalles específicos de la arquitectura interna del ajuste fino no se detallan en la ficha. El repositorio tiene un tamaño de 6,9 GB, lo que sugiere pesos en precisión fp16 o fp32, y se publicó el 16 de agosto de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tune de GR00T-N1.7-3B (Vision-Language-Action transformer) |
| Parametros totales | 3.000 millones (nominal, segun el nombre del modelo base) |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificado (el tamano del repo de 6,9 GB sugiere pesos en fp16) |
| Idiomas soportados | No disponibles (modelo orientado a robotica, sin especificacion de lenguaje) |
| Licencia | other (restricciones no estandar, probablemente ligadas a la licencia de GR00T) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de GR00T-N1.7-3B, un modelo fundacional de NVIDIA para robotica que integra percepcion visual, comprension de lenguaje e instrucciones de accion (VLA). El ajuste fino se realizo exclusivamente sobre los pesos del modelo (model-only weights) durante 8.000 pasos de entrenamiento.

Los datos de entrenamiento provienen de sesiones de teleoperacion de la secuencia pick -> scan -> place-on-scale -> pick-from-scale -> put-aside, recopiladas entre el 29 de junio y el 8 de julio de 2026. Se utilizaron 4 camaras a una frecuencia de 30 Hz. La segmentacion de los datos es particularmente relevante: se emplearon ventanas en las que la base del robot permanece estacionaria, cortando la secuencia en el fotograma en el que la base se detiene, de modo que cada habilidad comienza en reposo. Ademas, la ventana correspondiente a la bascula se divide en el punto de velocidad minima (lull), momento verificado en el que la caja reposa sobre la bascula con los brazos despejados, generando asi dos habilidades separadas: `place_on_scale` y `pick_from_scale`.

No se menciona el uso de tecnicas como RLHF o DPO, ni el numero total de tokens o episodios de entrenamiento mas alla de los 8.000 pasos.

## Capacidades

- Manipulacion robotica de precision: ejecuta la secuencia completa de recoger, escanear, colocar en bascula, recoger de la bascula y dejar a un lado.
- Percepcion multicamara: procesa informacion visual de 4 camaras simultaneas a 30 Hz para guiar la manipulacion.
- Aprendizaje por imitacion: las habilidades se aprenden directamente de demostraciones teleoperadas, sin necesidad de ingenieria de recompensas explicita.
- Segmentacion de habilidades: el modelo esta entrenado para iniciar cada habilidad desde un estado de reposo, lo que facilita su invocacion en sistemas de control jerarquico.
- No se especifican capacidades de generacion de lenguaje, tool calling, ni soporte para agentes conversacionales, ya que es un modelo puramente orientado a acciones roboticas.

## Casos de uso

- Automatizacion de lineas de clasificacion: el modelo puede integrarse en un brazo robotico DexMate Vega para ejecutar la tarea de colocar objetos en una bascula y luego apartarlos, reduciendo la intervencion humana en entornos de logistica o control de calidad.
- Transferencia de habilidades teleoperadas: operadores humanos pueden demostrar la secuencia una vez, y el modelo la reproduce de forma autonoma, lo que acelera la puesta en produccion de nuevas tareas sin reprogramacion manual.
- Investigacion en robotica VLA: sirve como caso de estudio para validar estrategias de segmentacion de datos basadas en estados de reposo y en puntos de velocidad minima, metodologia replicable en otros robots y tareas.
- Integracion en sistemas de control jerarquico: al iniciar cada habilidad en reposo, puede ser invocado por un planificador de alto nivel que orquesta multiples habilidades discretas (pick, place, etc.) para completar tareas complejas.
- Prototipado en entornos de laboratorio: investigadores pueden desplegar el modelo en un entorno de pruebas para evaluar la robustez de la manipulacion con 4 camaras antes de escalar a produccion.
- Benchmarking de modelos VLA: permite comparar el rendimiento de un fine-tune de 3B parametros frente a modelos mas grandes o a otras estrategias de entrenamiento en tareas de manipulacion fisica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como tasa de exito en la tarea, tiempo de ejecucion, ni comparaciones con otros modelos en el entorno DexMate Vega.

## Requisitos de hardware

- No se especifican requisitos oficiales por parte del autor.
- Dado que el repositorio pesa 6,9 GB y el modelo base tiene 3.000 millones de parametros, se infiere que los pesos estan en fp16 (aproximadamente 6 GB). Esto permitiria la inferencia en GPUs de consumo con 8-12 GB de VRAM, como una RTX 3080 o RTX 4090, aunque no hay garantia oficial.
- Para entrenamiento o fine-tune adicional, se recomendaria una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, A5000 o A100).
- El despliegue no se realiza mediante frameworks de LLM generico como vLLM u Ollama, sino a traves de stacks de robotica que soporten modelos VLA, como ROS (Robot Operating System), NVIDIA Isaac Lab o el propio entorno de inferencia de GR00T.
- No se proporcionan datos de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GR00T-N1.7-3B fine-tune) | 3B | Manipulacion robotica especifica (put_aside) | No disponible | other | HuggingFace |
| OpenVLA | 7B | VLA generalista para manipulacion | 32K tokens | MIT | HuggingFace |
| RT-2 (Google) | 55B | VLA generalista para robotica | No disponible | Propietaria | No publico |

No se dispone de datos de benchmarks comparativos entre estos modelos en la misma tarea o robot, por lo que no es posible establecer una comparativa cuantitativa. Este modelo se distingue por su tamano reducido (3B) y por estar altamente especializado en una secuencia concreta, mientras que OpenVLA y RT-2 buscan generalizacion.

## Limitaciones y advertencias

- Tarea altamente especifica: el modelo solo ejecuta la secuencia `put_aside` definida en el entrenamiento. No es un modelo generalista de robotica ni de lenguaje.
- Dependencia del hardware: esta entrenado para el robot DexMate Vega con una configuracion de 4 camaras a 30 Hz. Su transferencia a otros robots o configuraciones de sensores requiere reentrenamiento o adaptacion.
- Datos limitados: el entrenamiento se basa en 10 dias de teleoperacion (29 de junio a 8 de julio de 2026), lo que puede limitar la robustez ante variaciones del entorno no vistas en los datos.
- Licencia restrictiva: la licencia `other` implica que no se aplican las licencias open source estandar. Es imprescindible revisar los terminos de la licencia de GR00T de NVIDIA antes de cualquier uso comercial o de redistribucion.
- Riesgo de alucinacion de acciones: como cualquier modelo de aprendizaje por imitacion, puede ejecutar movimientos incorrectos o inseguros si el estado del entorno difiere significativamente de los datos de entrenamiento. Se requiere supervision en entornos reales.
- Sin soporte de lenguaje: no se especifican capacidades de procesamiento de lenguaje natural, por lo que no es adecuado para tareas que requieran interaccion conversacional o comprension de instrucciones textuales complejas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento en terminos de tasa de exito o seguridad.

## Enlaces

- Repositorio en HuggingFace: [https://huggingface.co/tarzanagh/ckpt_psspteleop_putaside_4cam260629-260708_gr00t3b260816](https://huggingface.co/tarzanagh/ckpt_psspteleop_putaside_4cam260629-260708_gr00t3b260816)
- No se proporcionan enlaces a papers, blogs, repositorios de codigo ni demos en la informacion disponible.
