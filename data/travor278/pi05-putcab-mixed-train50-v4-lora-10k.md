# Travor278/pi05-putcab-mixed-train50-v4-lora-10k

## Resumen

Travor278/pi05-putcab-mixed-train50-v4-lora-10k es un checkpoint de politica robotica entrenado mediante fine-tuning con LoRA sobre una base pi0.5 en JAX. El modelo pertenece a la familia de modelos vision-language-action (VLA): toma tres vistas RGB y un vector de estado proprioceptivo del robot, y produce una secuencia de acciones de manipulacion. Lo publica el usuario Travor278 bajo la libreria openpi, y esta pensado para ejecutarse con el stack OpenPI (checkpoints Orbax en JAX).

Se trata de un ajuste muy acotado: un unico prompt de tarea ("Open the cabinet drawer with the left arm and place the object into it with the right arm.") y un unico dataset de 50 episodios y 14.653 fotogramas a 16,67 FPS sobre el conjunto Shiki42/PutCab-Mixed-Train50-V4. El entrenamiento se realizo con dos H100 de 80 GB, batch global 16 y 10.000 actualizaciones sobre una curva coseno de 30.000 pasos con 1.000 de warmup. El autor no reclama ninguna tasa de exito en rollout cerrado, por lo que se trata de un artefacto de investigacion y no de un modelo validado para produccion.

Su relevancia es fundamentalmente como ejemplo reproducible de fine-tuning LoRA bimanual sobre pi0.5 y como punto de partida para quien quiera adaptar una base VLA a una tarea nueva con hardware limitado. No es un modelo de lenguaje general, no genera texto y no incluye capacidades de tool calling ni agentes. El repositorio ocupa 6,3 GB, no tiene descargas ni likes registrados y no declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) de la familia pi0.5, con backbone PaliGemma y un unico action expert; implementacion en JAX sobre OpenPI |
| Parametros totales | no disponible (el repositorio ocupa 6,3 GB e incluye pesos base, adaptadores LoRA y activos de normalizacion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (si se documenta un horizonte de accion de 50 pasos) |
| Tipos de cuantizacion | no disponible (se publican pesos en bf16 para pesos congelados y float32 para entrenables; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible (el prompt de entrenamiento esta en ingles) |
| Licencia | no disponible |
| Formato de pesos | Orbax (checkpoint JAX de OpenPI); la raiz del checkpoint es el directorio 10000/ |
| Tamano del repositorio | 6,3 GB |
| Tarea / pipeline | robotics (manipulacion bimanual) |
| Modelo base | XinY0201/openpi-pi05-base-jax, commit 5e62884fcf8cb8f9fc693c9163ea18d3e3739658 |
| Dataset de entrenamiento | Shiki42/PutCab-Mixed-Train50-V4, commit a7e496ffc2fb2f1f13bb8637193e0f7985c2acb6 |
| Fecha de creacion del repo | 2026-09-12 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es la de pi0.5 en su variante "single action expert": un backbone PaliGemma que procesa las entradas visuales y un modulo especializado que genera la accion. El modelo consume tres vistas RGB nativas, mapeadas por el training_config.py adjunto y redimensionadas a 224x224, mas un estado absoluto de 14 dimensiones. Las acciones son tambien de 14 dimensiones, absolutas, sin conversion de unidades tipo Aloha, sin representacion delta y sin mascara de inactividad. Tanto estado como acciones se rellenan (padding) hasta 32, y el horizonte de accion es de 50 pasos.

El ajuste se aplico con LoRA de rango y alpha 16 sobre PaliGemma y rango 32 sobre el action expert, con un filtro de congelacion de referencia que mantiene entrenables algunas partes de vision y proyecciones. Se usaron activaciones y pesos congelados en bf16 y pesos entrenables en float32, con AdamW (beta1 0,9; beta2 0,95; epsilon 1e-8; weight decay 1e-10; clip 1) y sin EMA. La tasa de aprendizaje sigue una curva coseno fija de 30.000 pasos con 1.000 de warmup, pico 2,5e-5 y valor final 2,5e-6, pero el entrenamiento se detuvo en el paso 10.000, por lo que la tasa no llego a decaer por completo. El entrenamiento corrio en dos H100 de 80 GB, con batch global 16, semilla 87431 y 10.000 actualizaciones.

Como controles de calidad, el autor indica que se verificaron estadisticas del dataset y comprobaciones reales de lector y tokenizador antes de asignar GPU, que cada parametro y array del optimizador se restauro estrictamente y se comprobo que fuera finito, que el paso 10.000 del optimizador esta verificado y que se registraron hashes de los arrays decodificados. El guardado usa una correccion de compatibilidad de Orbax previamente cualificada. El autor advierte explicitamente de que no se reclama identidad byte a byte con el runtime archivado historico de CTR. El estado del optimizador permanece en la plataforma de entrenamiento y no se publica: el arbol de parametros de inferencia incluye pesos base, pesos LoRA y activos de normalizacion.

## Capacidades

- Manipulacion robotica bimanual de una unica tarea: abrir el cajon de un armario con el brazo izquierdo y colocar un objeto dentro con el brazo derecho, segun el prompt de entrenamiento.
- Fusion de tres vistas RGB con estado proprioceptivo nativo de 14 dimensiones como entrada.
- Prediccion de secuencias de acciones absolutas de 14 dimensiones con horizonte de 50 pasos (aproximadamente 3 segundos de trayectoria a 16,67 FPS).
- Control coordinado de dos brazos en una misma politica (izquierdo para el cajon, derecho para el objeto).
- Adaptacion mediante LoRA sobre una base pi0.5, lo que permite reentrenar solo un subconjunto de pesos.
- No soporta tool calling ni function calling: no es un modelo de lenguaje con interfaz de herramientas.
- No soporta agentes, razonamiento multi-paso textual ni modos de pensamiento (thinking mode).
- No tiene capacidades multilingues documentadas; el unico prompt conocido esta en ingles.
- No hay capacidades de vision general (VQA, captioning) ni de audio declaradas: la vision se usa exclusivamente como entrada de politica.

## Casos de uso

- Investigacion en manipulacion bimanual de armarios y cajones: el modelo esta entrenado especificamente para esa tarea, con el brazo izquierdo abriendo el cajon y el derecho depositando el objeto, por lo que sirve como linea base en laboratorios que trabajen con esa misma configuracion de robot.
- Fine-tuning con LoRA sobre nuevas tareas: al ser un adaptador de rango 16 sobre PaliGemma y 32 sobre el action expert, es un punto de partida barato (10.000 pasos, batch 16, dos H100) para adaptar pi0.5 a un prompt y un dataset nuevos.
- Replicacion y auditoria de entrenamientos: el repositorio incluye en 10000/experiment/ las versiones de runtime y paquetes, la configuracion resuelta, el commit y parche frente al upstream fijado, el binding de GPU, los manifiestos de archivos de dataset y base, la normalizacion, las puertas de guardado en CPU y el historial del job, lo que permite reproducir el proceso paso a paso.
- Validacion de pipelines OpenPI/Orbax: sirve para comprobar que una instalacion de OpenPI carga correctamente una raiz de checkpoint Orbax con pesos base, adaptadores LoRA y activos de normalizacion en un unico arbol de parametros de inferencia.
- Pruebas de integracion de cliente y servidor de politica: el checkpoint se puede desplegar como servidor de inferencia en GPU y consumirse desde un cliente en el robot, util para medir latencias reales de un horizonte de 50 pasos en hardware concreto.
- Comparacion de estrategias de congelacion de pesos: el autor documenta un filtro de congelacion de referencia con vision y proyecciones entrenables, lo que permite estudiar el efecto de distintas politicas de freeze sobre una misma base.
- Experimentos de entrada multimodal en robotica: el uso de tres vistas RGB a 224x224 con estado de 14 dimensiones y padding a 32 es un caso de estudio util para quienes disenan esquemas de observacion en politicas VLA.
- Docencia y prototipado en robotica: el tamano moderado del repositorio (6,3 GB) y las 10.000 actualizaciones lo hacen abordable como ejemplo practico de entrenamiento VLA, siempre que se disponga de una plataforma JAX con GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor indica de forma explicita que no se reclama ninguna tasa de exito en rollout cerrado ("No closed-loop rollout success-rate claim is made"). No hay datos de MMLU, HumanEval, GSM8K ni de metricas de manipulacion (por ejemplo, tasa de exito por episodio) porque el modelo no es un LLM y no se proporcionan evaluaciones de politica.

## Requisitos de hardware

- Entrenamiento documentado: dos GPU H100 de 80 GB, batch global 16, 10.000 actualizaciones, contenedor NGC PyTorch 25.02 con un entorno JAX construido aparte.
- VRAM de inferencia: no disponible de forma oficial. Como estimacion orientativa basada en el tamano del repositorio (6,3 GB, que incluye pesos base, LoRA y activos de normalizacion, sin estado del optimizador), el arbol de parametros en bf16 deberia residir en el rango de una decena de gigabytes, por lo que una GPU de 24 GB es un punto de partida razonable. Esta cifra no esta confirmada por el autor.
- GPU recomendadas: H100 80 GB (la usada en entrenamiento), A100 40/80 GB, y en el ambito de consumo RTX 4090 o RTX 3090 de 24 GB como candidatas probables, siempre que el entorno JAX/CUDA correspondiente este disponible. No hay confirmacion de ejecucion en GPU de consumo.
- Opciones de despliegue: OpenPI con checkpoints Orbax en JAX, habitualmente como servidor de politica en GPU con un cliente en el robot. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponibles. Como dato derivado, el horizonte de 50 pasos a la frecuencia de captura del dataset (16,67 FPS) equivale a unos 3 segundos de trayectoria por inferencia, pero la latencia real de inferencia depende del hardware y no se publica.
- Almacenamiento: al menos 6,3 GB para el repositorio completo, mas el dataset y los pesos base si se quieren reentrenar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-putcab-mixed-train50-v4-lora-10k (este checkpoint) | no disponible | horizonte de 50 pasos | no se reclama tasa de exito en rollout cerrado | no disponible | publico en HuggingFace, 0 descargas y 0 likes |
| XinY0201/openpi-pi05-base-jax (base usada) | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | publico en HuggingFace, commit 5e62884f |
| pi0.5 oficial (referencia del autor) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| Otros modelos VLA de proposito general (por ejemplo, familias OpenVLA o similares) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

No se han proporcionado numeros comparativos entre este checkpoint y alternativas. La unica comparacion documentada es cualitativa: es un ajuste LoRA del mismo arbol de parametros que su base, con la salvedad de que incorpora los adaptadores y los activos de normalizacion del dataset PutCab-Mixed-Train50-V4.

## Limitaciones y advertencias

- Ausencia de evaluacion: el autor no reclama ninguna tasa de exito en rollout cerrado, y no se aportan metricas de exito, robustez ni generalizacion en el mundo real.
- Dataset muy pequeno y de una sola tarea: 50 episodios y 14.653 fotogramas para un unico prompt en ingles. El riesgo de sobreajuste al entorno, a la posicion de los objetos y a la configuracion de camaras concreta es alto.
- Sin senal de validacion por la comunidad: 0 descargas y 0 likes, sin retroalimentacion externa ni replicaciones publicas.
- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita para uso comercial ni para redistribucion; conviene tratar el checkpoint como material de investigacion restringido hasta aclararlo.
- Dependencia fuerte del entorno: requiere JAX, OpenPI y una raiz de checkpoint Orbax concreta (10000/), ademas de los activos de normalizacion y del training_config.py adjunto. No es cargable directamente con runtimes estandar de transformers, llama.cpp u Ollama.
- Sensibilidad al esquema de observacion: el mapeo de las tres vistas RGB, su redimensionado a 224x224 y el padding de estado y acciones a 32 son parte del contrato del modelo; cambiar camaras, orden de vistas o dimensionalidad del estado probablemente rompa la inferencia.
- Formato de acciones especifico: acciones absolutas de 14 dimensiones sin conversion de unidades tipo Aloha y sin mascara de inactividad. Aplicarlo a otro robot exige un mapeo cuidadoso del espacio de acciones.
- Entrenamiento incompleto respecto a la curva planificada: la tasa de aprendizaje sigue una curva coseno de 30.000 pasos (pico 2,5e-5, final 2,5e-6) pero el entrenamiento se detuvo en el paso 10.000, de modo que no se alcanza el decaimiento final previsto. Ademas, no se uso EMA.
- Reproducibilidad acotada: el autor advierte de que el entorno no se reclama byte-identico al runtime archivado historico de CTR; existe una identidad de job concreta (job-8db80d21-c7b5-4132-af4f-1f6c7815e52b) y un ID de entrenamiento (v2sam-exo2ego-fusion-official24-k13).
- Estado del optimizador no publicado: solo se distribuye el arbol de parametros de inferencia, por lo que no se puede reanudar el entrenamiento tal cual desde el checkpoint publicado.
- Sesgos: no disponible. No se documentan analisis de sesgo, y en un modelo de accion el sesgo relevante seria de generalizacion a objetos, posiciones o iluminaciones distintas, que no se ha medido.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe el riesgo equivalente de generar trayectorias plausibles pero fisicamente invalidas o inseguras cuando la observacion se sale de la distribucion de entrenamiento.
- Idiomas: no disponible. El unico prompt documentado esta en ingles; no hay evidencia de soporte para instrucciones en castellano ni en otros idiomas.
- Anomalia de metadatos: la fecha de creacion indicada (2026-09-12) es posterior a la fecha habitual de consulta del ecosistema; conviene verificar la vigencia real del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-putcab-mixed-train50-v4-lora-10k
- Modelo base usado: https://huggingface.co/XinY0201/openpi-pi05-base-jax
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/PutCab-Mixed-Train50-V4
- Repositorio OpenPI (referenciado por el campo library_name; no aparece en los resultados de busqueda): https://github.com/Physical-Intelligence/openpi
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Las busquedas devolvieron unicamente paginas de una agencia inmobiliaria (hsh-immobilier.com) sin relacion alguna con el modelo, el dataset o el framework. No se dispone de paper, blog, demo ni repositorio adicional verificado en la informacion proporcionada.
- Artefactos internos del repositorio (no enlazables directamente desde aqui): directorio 10000/ con el checkpoint Orbax y 10000/experiment/ con versiones de runtime y paquetes, configuracion resuelta, manifiestos de archivos, procedimiento de normalizacion, parches de compatibilidad e historial del job.
