# zijian2022/act_d2_noaug

## Resumen

`act_d2_noaug` es una politica de aprendizaje por imitacion basada en ACT (Action Chunking with Transformers), publicada por el usuario zijian2022 en HuggingFace bajo la libreria LeRobot. No es un modelo de lenguaje: se trata de un checkpoint de control robótico que traduce observaciones visuales y de estado del robot en secuencias de acciones motoras. Concretamente, el modelo se ha entrenado para la tarea de apilar un objeto rojo sobre uno azul con un brazo robotico FANUC ER-4iA equipado con camara de muneca fija, segun se deduce del dataset asociado `zijian2022/fanuc_er4ia_stack_red_on_blue_d2_fixwrist_dr`.

El modelo cuenta con 51.609.223 parametros (aproximadamente 51,6 M) almacenados en formato safetensors, con un tamano de repositorio de 0,2 GB. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificacion sin restricciones adicionales. El entrenamiento se realizo durante 30.000 pasos con un batch size de 16, sin aumento de imagen (de ahi el sufijo `noaug`) y con un `chunk_size` y `n_action_steps` de 40, lo que implica que cada inferencia produce un bloque de 40 acciones consecutivas que se ejecutan antes de volver a evaluar la politica.

La relevancia de este checkpoint es acotada pero util: sirve como referencia reproducible de la variante `d2` del pipeline del autor, permite comparar el efecto del aumento de imagen en el rendimiento de una politica ACT y puede reutilizarse como punto de partida para fine-tuning en tareas de manipulacion similares con LeRobot. Al no tener descargas ni likes registrados, debe considerarse un artefacto de investigacion mas que un modelo de produccion consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con componente CVAE |
| Parametros totales | 51.609.223 (aproximadamente 51,6 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | No aplica (politica de control robotico, sin entrada ni salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline declarado | robotics |
| Tamano del repositorio | 0,2 GB |
| Pasos de entrenamiento | 30.000 |
| `chunk_size` | 40 |
| `n_action_steps` | 40 |
| Batch size | 16 |
| Aumento de imagen | Desactivado |
| Dataset de entrenamiento | zijian2022/fanuc_er4ia_stack_red_on_blue_d2_fixwrist_dr |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-10-16 |
| Fecha de actualizacion | 2026-10-16 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura de aprendizaje por imitacion disenada para manipulacion fina. Combina un encoder de observaciones (tipicamente imagenes de una o varias camaras mas el estado de las articulaciones) con un transformer encoder-decoder que genera bloques de acciones, y anade un componente de autoencoder variacional condicional (CVAE) para modelar la multimodalidad de las demostraciones humanas. La prediccion por chunks o bloques reduce el error de acumulacion que aparece cuando se predice accion a accion, algo critico en tareas de contacto como apilar objetos. En este checkpoint, el bloque es de 40 acciones (`chunk_size: 40`) y se ejecutan las 40 antes de recalcular (`n_action_steps: 40`), la configuracion mas agresiva de reutilizacion del chunk.

Los detalles concretos sobre la arquitectura interna de este checkpoint (numero de capas, dimension del modelo, numero de cabezas de atencion, resolucion de entrada de las camaras) no estan disponibles en la informacion proporcionada. Si se conocen los hiperparametros de entrenamiento documentados: 30.000 pasos, batch size 16 y aumento de imagen desactivado. La model card no indica el numero de episodios del dataset, la composicion exacta de las observaciones ni si se aplicaron tecnicas adicionales como decodificacion especulativa o regularizacion temporal (temporal ensembling). El sufijo `d2` del identificador corresponde a la nomenclatura interna del autor y su significado no se documenta.

## Capacidades

- Generacion de acciones motoras: dado un conjunto de observaciones (imagenes de camara y estado del robot), produce un chunk de 40 acciones continuas para el brazo FANUC ER-4iA.
- Manipulacion para apilado: la tarea objetivo es colocar un objeto rojo sobre uno azul, segun el nombre del dataset de entrenamiento.
- Aprendizaje por imitacion puro: no emplea refuerzo ni RLHF. La politica reproduce la distribucion de las demostraciones del dataset.
- Entrada multimodal limitada: vision (camara de muneca fija) mas estado propioceptivo del robot. No hay entrada de texto, audio ni lenguaje.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en el sentido de los agentes basados en lenguaje; su "razonamiento" es la planificacion implicita dentro del chunk de acciones.
- No tiene capacidades multilingues: no procesa ni genera lenguaje natural.
- No dispone de modo de pensamiento (thinking mode), vision general ni audio.

## Casos de uso

- Despliegue de la tarea de apilado en un banco de pruebas con FANUC ER-4iA: el checkpoint se carga con LeRobot y se ejecuta en bucle cerrado a 40 acciones por inferencia, lo que reduce la frecuencia de reevaluacion de la politica y, con ello, la carga computacional en el lazo de control.
- Reproduccion de experimentos de ablacion sobre aumento de imagen: al estar etiquetado como `noaug`, sirve como condicion de control frente a variantes con data augmentation del mismo autor (por ejemplo, la variante `d2` con aumentos), permitiendo aislar el efecto de esa tecnica.
- Fine-tuning para tareas de manipulacion cercanas: al ser un modelo de 51,6 M de parametros y licencia Apache 2.0, es viable reentrenarlo con un dataset propio de apilado o de colocacion de piezas usando la infraestructura de entrenamiento de LeRobot.
- Evaluacion de robustez frente a condiciones de iluminacion y posicion: con un unico checkpoint de 0,2 GB, se pueden lanzar barridos de evaluacion en simulacion o en banco real midiendo la tasa de exito por configuracion, sin necesidad de infraestructura GPU de gama alta.
- Generacion de datos sinteticos o de demostraciones aumentadas: la politica entrenada puede usarse como experto para etiquetar rollouts y ampliar un dataset de imitacion en tareas de ensamblaje simples.
- Prototipado rapido enrobotica de laboratorio: dado su tamano reducido, cabe en un portatil con GPU de consumo o incluso en una Jetson, lo que permite iterar en el propio banco de trabajo sin depender de un cluster.
- Docencia y replicacion de resultados: sirve como ejemplo minimo y completo de politica ACT entrenada end-to-end en LeRobot, util para cursos de robotica o para validar instalaciones de la libreria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card solo documenta la configuracion de entrenamiento (30.000 pasos, batch 16, `chunk_size` 40, `n_action_steps` 40, sin aumento de imagen), pero no incluye tasas de exito, errores de posicion, ni comparaciones cuantitativas con otras politicas. No se deben inferir tasas de exito a partir del nombre del checkpoint.

## Requisitos de hardware

- VRAM para inferencia: con 51,6 M de parametros, los pesos en FP32 ocupan aproximadamente 206 MB y en FP16 alrededor de 103 MB. Anadiendo activaciones y buffers de imagenes, el consumo real se mantiene muy por debajo de 1 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, incluidas NVIDIA RTX 3060, RTX 4090, A100 o H100. El modelo no aprovecha la capacidad de calculo de las GPU de gama alta porque es muy pequeno; el cuello de botella esta en la captura de imagen y en la latencia del bus del robot, no en el calculo de la red.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con aceleracion (por ejemplo, Apple Silicon o Intel Arc integrada) para evaluacion offline.
- Despliegue en borde: viable en NVIDIA Jetson Orin, Jetson Xavier NX o Raspberry Pi 5 con aceleracion, dado el tamano del modelo.
- Opciones de despliegue: la libreria LeRobot (PyTorch) es la via natural. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que son servidores orientados a modelos de lenguaje y no aplican a una politica de control.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo de inferencia ni de frecuencia de control alcanzable.
- Almacenamiento: el repositorio completo ocupa 0,2 GB, por lo que el despliegue en dispositivos con almacenamiento limitado no supone un problema.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de los modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales verificables.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zijian2022/act_d2_noaug | ACT, aprendizaje por imitacion | 51,6 M | No aplica | Apache 2.0 | HuggingFace (0 descargas) |
| Otros checkpoints ACT del mismo autor (`d2` con aumento) | ACT | No disponible | No aplica | No disponible | No disponible en la informacion facilitada |
| ACT original (Zhao et al., 2023) | ACT | No disponible | No aplica | No disponible | Publicacion academica y repositorio de referencia |
| Diffusion Policy (Chi et al., 2023) | Politica por difusion | No disponible | No aplica | No disponible | Publicacion academica |

No se dispone de alternativas comparables con datos verificados dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Especificidad extrema de tarea: la politica esta entrenada exclusivamente para apilar un objeto rojo sobre uno azul con un robot FANUC ER-4iA y una camara de muneca fija. Cambiar la camara, el robot, la posicion de la camara o el color de los objetos invalida el modelo con alta probabilidad.
- Riesgo de fallo silencioso: al ser una politica de imitacion sin mecanismo de verificacion, puede producir acciones plausibles pero incorrectas cuando la escena se sale de la distribucion de entrenamiento. No existe senal de incertidumbre calibrada.
- Sin datos de rendimiento: no hay tasas de exito publicadas, por lo que no es posible estimar su fiabilidad real en produccion.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa.
- Sesgos de dataset: al entrenarse sobre un unico dataset, heredara los sesgos de posicion, iluminacion, textura y disposicion de objetos presentes en el mismo. La ausencia de aumento de imagen reduce la invariancia a cambios de iluminacion y de fondo.
- Ejecucion de las 40 acciones sin reobservacion: con `n_action_steps` igual a `chunk_size`, el robot ejecuta la secuencia completa antes de volver a mirar. Esto es eficiente pero reduce la capacidad de reaccion ante perturbaciones externas durante el chunk.
- Limitaciones de idioma y contexto: no aplican en el sentido de los modelos de lenguaje, pero conviene subrayar que el modelo no entiende instrucciones en ningun idioma; solo produce acciones.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. No hay clausulas de uso responsable adicionales documentadas.
- Fechas del repositorio: la fecha de creacion y actualizacion registrada es 2026-10-16, posterior a la fecha de consulta habitual de muchos entornos. Conviene verificar la coherencia temporal del repositorio antes de integrarlo en un pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zijian2022/act_d2_noaug
- Dataset de entrenamiento: https://huggingface.co/datasets/zijian2022/fanuc_er4ia_stack_red_on_blue_d2_fixwrist_dr
- Libreria LeRobot (HuggingFace): https://github.com/huggingface/lerobot
- Paper de ACT (Zhao et al., 2023): https://arxiv.org/abs/2304.13705
- Paper de Diffusion Policy (Chi et al., 2023): https://arxiv.org/abs/2303.04137
