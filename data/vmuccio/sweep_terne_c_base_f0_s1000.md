# VMuccio/sweep_terne_C_base_f0_s1000

## Resumen

`sweep_terne_C_base_f0_s1000` es una política de robotica basada en SmolVLA (Small Vision-Language-Action), un modelo compacto de vision-lenguaje-accion desarrollado en el ecosistema LeRobot de Hugging Face y publicado por el usuario VMuccio. No es un modelo de lenguaje: es una política de imitacion que recibe el estado del robot y tres imagenes de camara y emite directamente un vector de acciones de 6 grados de libertad para un brazo `so_follower` (familia SO-100/SO-101). El problema que resuelve es el de ejecutar tareas de manipulacion aprendidas por demostracion, en concreto recoger un cubo de color (rojo, amarillo o azul) y depositarlo en una cesta.

El modelo se ha obtenido por ajuste fino (fine-tuning) del checkpoint base `lerobot/smolvla_base` sobre el dataset `VMuccio/rgb_cubes_terne_p1`, compuesto por 81 episodios y 52.930 fotogramas grabados a 30 FPS. El resultado es un checkpoint de 450.046.176 parametros (aproximadamente 0,45 mil millones) con pesos en formato safetensors y un tamano de repositorio de 0,9 GB, lo que lo situa en el rango de modelos desplegables en hardware de consumo, una de las tesis centrales de SmolVLA.

Su relevancia es la de un ejemplo reproducible de extremo a extremo de entrenamiento de políticas VLA con LeRobot: la model card documenta la configuracion exacta de entrenamiento (12.000 pasos, batch de 8, AdamW, learning rate 5e-05, semilla 1000, LeRobot 0.6.2) y el comando de despliegue. Se trata de un modelo de investigacion con cero descargas y cero likes en el momento de la consulta, sin resultados de evaluacion publicados, por lo que debe considerarse un artefacto experimental y no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-lenguaje-accion (VLA) basada en SmolVLA; detalles internos de capas no disponibles |
| Parametros totales | 450.046.176 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje. Entradas fijas: estado `(6,)` y tres imagenes `(3, 256, 256)` |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible; el modelo no procesa lenguaje natural libre, solo la instruccion de tarea en formato texto heredada de SmolVLA |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tipo de robot | `so_follower` |
| Camaras | `gripper`, `front`, `top` |
| Entradas | `observation.state` `(6,)`; `observation.images.camera1/2/3` `(3, 256, 256)` |
| Salidas | `action` `(6,)` |
| Modelo base | `lerobot/smolvla_base` |
| Dataset de entrenamiento | `VMuccio/rgb_cubes_terne_p1` (81 episodios, 52.930 fotogramas, 30 FPS) |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion compacto que combina un codificador visual, un componente de lenguaje y un cabezal de accion, siguiendo el paradigma de las políticas VLA modernas: en lugar de estimar acciones a partir de un estado vectorial, consume imagenes y una instruccion de tarea en texto. La informacion proporcionada no detalla el numero de capas, la dimension oculta, el tipo de atencion ni el mecanismo exacto de fusion entre modalidades, por lo que esos datos quedan como no disponibles. El paper asociado es arXiv 2506.01844.

El entrenamiento se realizo por imitacion supervisada sobre el dataset `rgb_cubes_terne_p1`, que contiene 81 episodios y 52.930 fotogramas a 30 FPS correspondientes a tres tareas: coger el cubo rojo y dejarlo en la cesta, coger el amarillo y coger el azul. La configuracion registrada es de 12.000 pasos de entrenamiento con batch size 8, optimizador AdamW y learning rate 5e-05, con semilla 1000 y LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni ninguna fase de alineacion adicional, algo coherente con el caracter de política de imitacion. Tampoco se indica el numero de tokens de lenguaje usados en el preentrenamiento del backbone, ni si el ajuste fino congelo algun modulo.

## Capacidades

- Manipulacion robotica por imitacion: genera un vector de 6 acciones de forma directa a partir de observaciones, con frecuencia de datos de 30 FPS.
- Percepcion visual multi-camara: procesa tres flujos de imagen de 256x256 (gripper, frontal y superior) de forma simultanea.
- Condicionamiento por instruccion de tarea: la model card y el comando de despliegue usan `--task` con la frase de la tarea, heredado del comportamiento de SmolVLA.
- Discriminacion de color en la tarea entrenada: las tres tareas del dataset se diferencian por el color del cubo, lo que implica que la política debe distinguir rojo, amarillo y azul en la escena.
- Despliegue en hardware de consumo: el modelo base SmolVLA esta disenado explicitamente para ejecutarse en hardware asequible, y con 450 millones de parametros el checkpoint es ligero.
- Integracion con el ecosistema LeRobot: se ejecuta con `lerobot-rollout` y se reentrena con `lerobot-train`.
- Tool calling, agentes, reasoning multi-paso, matemáticas, codigo, vision general, audio o modo thinking: no disponibles; son capacidades propias de modelos de lenguaje y no de esta política.

## Casos de uso

- Clasificacion de cubos por color en linea de laboratorio: la política puede colocarse en una celda con brazo `so_follower` y tres camaras para separar cubos rojos, amarillos y azules en una cesta, que es exactamente la tarea de entrenamiento.
- Banco de pruebas de reproducibilidad en investigacion: al documentarse pasos, batch, learning rate y semilla, sirve para reproducir experimentos de imitacion con SmolVLA y comparar variantes de fine-tuning.
- Punto de partida para nuevas tareas de picking: reentrenando desde `lerobot/smolvla_base` o ajustando este checkpoint con un dataset propio, se puede extender a otros objetos o contenedores.
- Docencia en robotica e IA: es un caso de estudio asequible de extremo a extremo (grabacion de datos con LeRobot, entrenamiento, rollout) para cursos universitarios.
- Validacion de pipelines de datos multi-camara: permite comprobar que la sincronizacion de tres camaras a 30 FPS y el alineamiento temporal con el estado del robot son correctos antes de escalar a tareas mas complejas.
- Pruebas de estres de robustez visual: modificando iluminacion, posicion de los cubos o anadiendo distractores se puede medir cualitativamente la degradacion de la política, ya que la model card advierte de que la dificultad cambia con estos factores.
- Referencia de linea base en comparativas de políticas: al ser un fine-tuning de 450 M de parametros sobre una tarea sencilla, resulta util como punto de comparacion frente a arquitecturas mayores tipo OpenVLA o pi0.
- Demostracion de inferencia en GPU de consumo: sirve para verificar en un equipo local con una unica GPU si una política VLA puede mantener el ritmo de control exigido por un brazo a 30 FPS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La propia model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta política, e incluye una plantilla vacia para rellenar con numero de ensayos y tasa de exito que el autor no ha completado. No se dispone por tanto de tasas de exito en tarea real ni de metricas de simulacion. Cualquier cifra que se atribuya a este checkpoint concreto seria inventada.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 450.046.176 parametros: aproximadamente 1,8 GB en FP32, 0,9 GB en BF16/FP16, 0,45 GB en INT8 y 0,23 GB en INT4. Son estimaciones teoricas del peso del modelo, sin overhead de activaciones, buffers de inferencia ni memoria de las tres camaras.
- El repositorio ocupa 0,9 GB, lo que sugiere pesos almacenados en precision de 16 bits o similar; el dato exacto de precision del checkpoint no esta disponible.
- Cabe con holgura en GPU de consumo: cualquier tarjeta con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente para los pesos; el cuello de botella real sera el preprocesado de las tres imagenes de 256x256 y la latencia de control.
- GPU de centro de datos (A100, H100, L40S) no son necesarias para inferencia, aunque pueden usarse para entrenamiento y para ejecutar varios rollouts en paralelo.
- La ejecucion en CPU es viable en teoria por tamano, pero no hay datos de latencia publicados que confirmen que se alcance el ritmo del brazo.
- Opciones de despliegue: LeRobot mediante el comando `lerobot-rollout --strategy.type=base --policy.path=VMuccio/sweep_terne_C_base_f0_s1000`; el reentrenamiento se hace con `lerobot-train`. vLLM, llama.cpp, Ollama o TGI no son aplicables, ya que no es un modelo de generacion de texto.
- Latencia y throughput estimados: no disponibles. Como referencia de exigencia temporal, el dataset se grabo a 30 FPS, lo que implica un presupuesto de aproximadamente 33 ms por paso de control si se quiere mantener la cadencia de las demostraciones; no se ha publicado ninguna medicion real de latencia para este checkpoint.
- Requisitos adicionales: brazo `so_follower` calibrado, puerto serie concreto, y tres camaras configuradas con nombres que coincidan exactamente con las claves de observacion del entrenamiento (`gripper`, `front`, `top`).

## Comparativa con modelos similares

| Modelo | Parametros | Entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `VMuccio/sweep_terne_C_base_f0_s1000` (este) | 450.046.176 | estado `(6,)` + 3 imagenes 256x256 | picking de cubo de color en cesta | apache-2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | no disponible (mismo backbone) | multimodal, VLA generica | política VLA base para fine-tuning | no disponible | Hugging Face |
| `lerobot/act` (Action Chunking Transformer) | no disponible | imagenes + estado | imitacion robotica en LeRobot | no disponible | Hugging Face |
| OpenVLA | 7.000 millones (referencia externa) | imagenes + instruccion de lenguaje | manipulacion VLA generalista | no disponible | publico |
| pi0 (Physical Intelligence) | no disponible | multimodal | manipulacion VLA generalista | no disponible | no disponible |

La comparacion cuantitativa de rendimiento no es posible: este checkpoint no publica ninguna tasa de exito, y la informacion proporcionada no incluye resultados de las alternativas. La ventaja estructural de este modelo frente a VLA de mayor tamano es el coste de inferencia: 450 millones de parametros frente a modelos de miles de millones, con un repositorio de menos de 1 GB.

## Limitaciones y advertencias

- Ausencia total de evaluacion: la model card declara que no hay resultados de exito, por lo que no hay evidencia publicada de que la política funcione de forma fiable.
- Especificidad extrema de la tarea: entrenada solo para tres tareas de picking de cubos de color sobre un `so_follower` con tres camaras concretas. Fuera de ese montaje no hay garantia de comportamiento.
- Dependencia del montaje fisico: los nombres y la posicion de las camaras (`gripper`, `front`, `top`), la calibracion del brazo y la iluminacion afectan directamente al rendimiento; la propia plantilla de evaluacion de la model card pide anotar cambios de posicion de objetos, iluminacion, distractores o robot distinto.
- Sensibilidad al cambio de robot: un brazo de la misma familia pero con calibracion o dimensiones distintas puede degradar la política sin aviso.
- Riesgo de sobreajuste a 81 episodios: el dataset es pequeno, con 52.930 fotogramas y solo tres tareas. La diversidad de posiciones, fondos y condiciones de luz es probablemente reducida.
- Alucinacion en sentido estricto no aplica (no genera texto libre), pero si existe el riesgo equivalente de acciones fisicas incorrectas: movimientos erraticos, colisiones con objetos o intentos de agarre al aire. En robotica esto tiene consecuencias fisicas y requiere parada de emergencia y limites de seguridad en el controlador.
- Sesgos: no disponibles; no hay analisis de sesgo sobre el dataset de demostracion.
- Idiomas: no disponible. El condicionamiento por tarea se expresa en ingles en los ejemplos de la model card.
- Licencia apache-2.0: permite uso comercial del checkpoint, pero el usuario debe verificar por su cuenta las licencias del modelo base `lerobot/smolvla_base` y del dataset `VMuccio/rgb_cubes_terne_p1`, que no se detallan en la informacion proporcionada.
- Idoneidad para produccion: baja. Cero descargas y cero likes, sin evaluacion publicada y con fecha de creacion posterior a la fecha de referencia habitual; debe tratarse como un experimento de investigacion, no como un componente de produccion.
- Trazabilidad: no se documentan semillas de evaluacion, hardware de entrenamiento, duracion del entrenamiento ni curvas de perdida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VMuccio/sweep_terne_C_base_f0_s1000
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/VMuccio/rgb_cubes_terne_p1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=VMuccio/rgb_cubes_terne_p1
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv 2506.01844)
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Resultados de la busqueda web: no se ha recuperado ningun enlace relevante sobre este modelo; los resultados devueltos corresponden a sitios sin relacion con robotica ni con inteligencia artificial y se descartan como fuente.
