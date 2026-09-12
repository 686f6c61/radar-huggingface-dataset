# Travor278/pi05-putcab-ctr-train100-v4-lora-10k

## Resumen

PI0.5 PutCab-CTR-Train100-V4 LoRA 10k es un ajuste fino de tipo LoRA sobre el modelo base PI0.5 en su implementacion JAX del ecosistema openpi, publicado por el usuario Travor278 en HuggingFace. Se trata de una politica vision-lenguaje-accion (VLA) orientada a robotica de manipulacion: recibe tres vistas RGB a 224x224 y un estado propioceptivo de 14 dimensiones, y produce acciones continuas de 32 dimensiones (14 nativas con relleno) con un horizonte de 50 pasos. El modelo esta especializado en una unica tarea, descrita por el prompt fijo "Open the cabinet drawer with the left arm and place the object into it with the right arm".

El entrenamiento se realizo sobre el dataset Shiki42/PutCab-CTR-Train100-V4 (100 episodios, 29.056 fotogramas a 16,67 FPS) durante 10.000 actualizaciones con batch global de 16, empleando dos GPU H100 de 80 GB. El ajuste congela los pesos del modelo base en bf16 y entrena parametros de tipo LoRA (rango/alpha 16 en PaliGemma, 32 en el action expert) en float32, con optimizador AdamW y un schedule coseno fijo de 30.000 pasos truncado en 10.000. El checkpoint se distribuye en formato Orbax bajo la raiz `10000/`, con el arbol completo de parametros de inferencia (LoRA mas pesos base mas activos de normalizacion).

Su relevancia es doble: por un lado, es un ejemplo reproducible de adaptacion eficiente de un VLA de gran tamano a una tarea concreta con recursos moderados (dos GPU de 80 GB); por otro, documenta de forma inusualmente detallada el proceso de entrenamiento, incluidos los chequeos de guardado/carga del checkpoint en CPU, la verificacion de valores finitos y los hashes de arrays decodificados. El autor declara explicitamente que no reclama ninguna tasa de exito en rollouts reales, por lo que se trata de un artefacto de investigacion mas que de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en PaliGemma con un unico action expert; implementacion openpi en JAX |
| Parametros totales | no disponible (el repositorio pesa 6,3 GB e incluye pesos base, LoRA y activos de normalizacion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; horizonte de accion de 50 pasos |
| Tipos de cuantizacion | no disponible; no se documentan esquemas GGUF, AWQ o GPTQ. En entrenamiento se usan activaciones y parametros congelados en bf16 y parametros entrenables en float32 |
| Idiomas soportados | no disponible; el prompt de la tarea esta en ingles |
| Licencia | no disponible |
| Formato de pesos | Checkpoint Orbax (JAX/openpi); cargar `10000/` como raiz del checkpoint OpenPI |
| Dimension de estado/accion nativa | 14 dimensiones absolutas (estado y accion) |
| Dimension de accion del modelo | 32 dimensiones (rellenadas) |
| Entradas de vision | 3 vistas RGB con transformaciones estandar a 224x224 |
| FPS del dataset de entrenamiento | 16,666666666666668 |
| Repositorio | 6,3 GB |
| Modelo base | XinY0201/openpi-pi05-base-jax @ 5e62884fcf8cb8f9fc693c9163ea18d3e3739658 |
| Dataset de ajuste | Shiki42/PutCab-CTR-Train100-V4 @ dec351385ac40a49cdab73277b2061b8dc01cfa7 |
| Framework de libreria | openpi |

## Arquitectura y entrenamiento

La arquitectura sigue el patron de la familia openpi/PI0.5: una columna de vision-lenguaje basada en PaliGemma (usada aqui con adaptadores LoRA de rango/alpha 16) mas un unico action expert (LoRA de rango 32) que genera las acciones. El filtro de referencia del entrenamiento incluye proyecciones y parametros de vision entrenables. El modelo consume tres vistas RGB normalizadas a 224x224 junto con un vector de estado de 14 dimensiones (absoluto, sin transformacion delta) y emite acciones de 32 dimensiones (14 nativas rellenadas hasta 32) con horizonte 50. No se aplica mascara de reposo ni conversion de unidades tipo Aloha, segun la model card.

El entrenamiento se ejecuto en dos H100 de 80 GB con batch global 16 y semilla 87431 durante 10.000 actualizaciones. Se uso AdamW con b1=0,9, b2=0,95, eps=1e-8, weight_decay=1e-10, clipping de gradiente en 1 y sin EMA. El schedule es coseno fijo de 30.000 pasos con 1.000 de warmup, pico de 2,5e-5 y valor final de 2,5e-6, detenido en el paso 10.000. Antes del envio a GPU se validaron el decodificador/tokenizer real, la normalizacion independiente del dataset y ciclos de guardado/recarga del checkpoint en CPU; la restauracion estricta de parametros y estado del optimizador verifico valores finitos y el paso 10.000, conservando hashes de arrays decodificados. Los detalles de entorno, commits, manifiestos y estadisticas se guardan en `10000/experiment/`.

## Capacidades

- Generacion de acciones motoras continuas para control de robot manipulador, con salida de 32 dimensiones y horizonte de 50 pasos.
- Percepcion multimodal con tres vistas RGB simultaneas a 224x224, mas estado propioceptivo de 14 dimensiones.
- Ejecucion de una tarea compuesta de dos brazos descrita por prompt fijo: abrir el cajon de un armario con el brazo izquierdo y depositar un objeto dentro con el brazo derecho.
- Aprendizaje por imitacion de demostraciones humanas (100 episodios teleoperados), sin componente de refuerzo documentado.
- Adaptacion de bajo rango (LoRA) sobre un VLA congelado, lo que permite reentrenar solo un subconjunto de parametros.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, thinking mode, audio ni comprension multilingue.
- No se documenta ninguna capacidad de generacion de texto o codigo; el modelo es una politica de robotica, no un asistente conversacional.

## Casos de uso

- Manipulacion domestica de un solo brazo para la tarea de abrir cajones: el modelo esta ajustado especificamente al prompt de abrir el cajon con el brazo izquierdo y depositar el objeto con el derecho, con horizonte de 50 acciones, lo que cubre secuencias de aproximadamente 3 segundos a 16,67 FPS.
- Investigacion en adaptacion eficiente de VLA: sirve como referencia reproducible de un fine-tune LoRA (rango 16 en PaliGemma, 32 en el action expert) sobre PI0.5 JAX, con configuracion de optimizador y schedule documentadas.
- Reproduccion de experimentos de entrenamiento: el directorio `10000/experiment/` contiene el entorno de ejecucion, commits y manifiestos necesarios para auditar como se genero el checkpoint.
- Punto de partida para nuevos fine-tunes: al ser un LoRA sobre un base publico, puede reutilizarse como inicializacion para variantes de la misma familia de tareas (cajones, armarios, colocacion de objetos).
- Validacion de infraestructura de inferencia openpi: permite comprobar la carga de checkpoints Orbax, la reconstruccion del arbol completo de parametros y los activos de normalizacion en un entorno JAX.
- Estudio de control en bucle cerrado con multiples camaras: el modelo asume tres vistas RGB, por lo que es adecuado para banco de pruebas de configuraciones de vision multi-camara a 16,67 Hz.
- Docencia y divulgacion tecnica: es un ejemplo de model card con verificaciones explicitas de guardado/carga y con ausencia deliberada de afirmaciones de rendimiento no respaldadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica de forma explicita que no se reclama ninguna tasa de exito en rollouts ("No rollout success-rate claim"). Tampoco se aportan metricas de error de accion, perdida final ni comparaciones con otros checkpoints. Los unicos datos verificables son de proceso de entrenamiento: 10.000 actualizaciones, batch global 16, dos H100 de 80 GB, semilla 87431 y verificacion de restauracion hasta el paso 10.000 con valores finitos.

## Requisitos de hardware

- Entrenamiento documentado: 2 GPU H100 de 80 GB, batch global 16, 10.000 actualizaciones, contenedor NGC PyTorch 25.02 con un entorno JAX separado.
- Inferencia: no hay cifra oficial de VRAM en la informacion disponible. El repositorio de 6,3 GB incluye pesos base, LoRA y activos de normalizacion; una estimacion orientativa (no confirmada por el autor) situa la carga de pesos en el rango de 7-8 GB y el consumo total con activaciones en torno a 10-16 GB, dependiendo de la implementacion.
- GPU consumer: no confirmado. Por la estimacion anterior, una RTX 4090 de 24 GB seria teoricamente suficiente, pero no existe verificacion publicada.
- Despliegue: el formato nativo es Orbax y la libreria asociada es openpi (JAX). No se documenta soporte para llama.cpp, Ollama, TGI ni vLLM, ni artefactos GGUF.
- Latencia y throughput: no disponible. Como referencia derivada, un chunk de 50 acciones ejecutado en bucle abierto a 16,67 FPS corresponde a unos 3 segundos de trayectoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PI0.5 PutCab LoRA 10k (este modelo) | no disponible | horizonte de 50 acciones | no disponible | HuggingFace, 0 descargas | Fine-tune LoRA de tarea unica en JAX |
| openpi PI0.5 base JAX (XinY0201) | no disponible | no disponible | no disponible | HuggingFace | Modelo base sobre el que se aplica este LoRA; sin especializar |
| PI0 / openpi (Physical Intelligence) | no disponible | no disponible | no disponible | Repositorio openpi | Familia de VLA open source de la que deriva PI0.5 |
| NVIDIA GR00T N1.5 | no disponible | no disponible | no disponible | HuggingFace | VLA alternativo de proposito general; no comparable en datos concretos con la informacion disponible |
| OpenVLA | no disponible | no disponible | no disponible | HuggingFace | VLA abierto de referencia; no comparable en datos concretos con la informacion disponible |

No se dispone de datos verificables de parametros, contexto o rendimiento para establecer una comparacion cuantitativa. La diferencia principal frente al modelo base es que este checkpoint esta especializado en una unica tarea mediante LoRA, mientras que los modelos base son de proposito general.

## Limitaciones y advertencias

- Politica de tarea unica: esta entrenada con un unico prompt fijo y un unico dataset de 100 episodios; no se espera generalizacion a otras instrucciones o entornos.
- Sin evidencia de rendimiento: el autor declara explicitamente que no reclama tasa de exito en rollouts, y no hay benchmarks publicados. Cualquier uso en produccion requeriria evaluacion propia previa.
- Riesgo de sobreajuste: 10.000 actualizaciones sobre 29.056 fotogramas de una sola tarea y una sola configuracion de escena.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso de uso comercial; es un riesgo legal relevante para cualquier integracion en producto.
- Dependencia de plataforma: las acciones son de 14 dimensiones absolutas, sin transformacion delta ni conversion de unidades tipo Aloha, lo que ata el modelo a la cinematica concreta del robot usado para la recoleccion de datos.
- Requisitos de entrada estrictos: necesita exactamente tres vistas RGB a 224x224 y un vector de estado de 14 dimensiones; no admite entradas parciales ni un numero distinto de camaras.
- Sin mascara de reposo: al no usar idle mask, el modelo puede generar movimiento incluso en fases en las que la politica deberia permanecer quieta.
- Metadatos poco transparentes: no se indica autor, afiliacion ni version del runtime historico; la model card advierte que el contenedor actual no se reclama byte-identico al runtime archivado de CTR.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, y fecha de creacion posterior a la de publicacion de este analisis.
- Idiomas: el prompt esta en ingles y no se documenta soporte multilingue.
- Riesgo de alucinacion: en el contexto de un VLA, este riesgo se manifiesta como acciones fisicamente incoherentes o inseguras mas que como texto incorrecto; se requiere supervision en banco de pruebas antes de operar con hardware real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-putcab-ctr-train100-v4-lora-10k
- Modelo base: https://huggingface.co/XinY0201/openpi-pi05-base-jax
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/PutCab-CTR-Train100-V4
- Repositorio openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- No se han encontrado papers, blogs, repositorios adicionales ni demos especificos de este checkpoint en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
