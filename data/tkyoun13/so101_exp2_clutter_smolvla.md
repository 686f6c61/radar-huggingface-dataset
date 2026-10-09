# tkyoun13/so101_exp2_clutter_smolvla

## Resumen

`tkyoun13/so101_exp2_clutter_smolvla` es una política de robótica del tipo vision-language-action (VLA) obtenida por ajuste fino del modelo base `lerobot/smolvla_base`, que a su vez implementa el método SmolVLA descrito en el paper arXiv:2506.01844. El modelo lo publica el usuario `tkyoun13` en HuggingFace y está pensado para controlar un brazo robótico SO-101 (tipo `so_follower`) mediante imitación: recibe el estado de las articulaciones y tres flujos de imagen de 256x256 píxeles, y devuelve un vector de acción de 6 dimensiones.

Se trata de una política compacta: 450.046.176 parámetros (aproximadamente 450 M) y un repositorio de 0,9 GB, lo que la sitúa en el rango de modelos desplegables en hardware de consumo según la propia model card. La tarea concreta para la que se ha entrenado es de manipulación con oclusión ("clutter"): coger un kiwi entre varios objetos y depositarlo en una cesta, a la izquierda o a la derecha, según la instrucción en lenguaje natural.

Su relevancia es doble. Por un lado, ilustra el flujo de trabajo de imitación de LeRobot (grabación de episodios, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) aplicado a un robot de bajo coste. Por otro, sirve como ejemplo reproducible de ajuste fino de un VLA pequeño para una tarea específica, con licencia Apache 2.0. El repositorio no incluye resultados de evaluación en robot real y acumula 0 descargas y 0 "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA; columna vertebral VLM mas experto de acciones. Detalle interno de capas no disponible en la informacion proporcionada |
| Parametros totales | 450.046.176 (dato real de safetensors) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible (politica de robot; no se especifica ventana de tokens) |
| Tipos de cuantizacion | No disponible en la model card; pesos distribuidos en safetensors (repo de 0,9 GB, compatible con bf16/fp16) |
| Idiomas soportados | No disponible (tareas de entrenamiento descritas en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Robot objetivo | `so_follower` (SO-101) |
| Entradas | `observation.state` (6,), 3 imagenes visuales (3, 256, 256) |
| Salidas | `action` (6,) |
| Camaras declaradas | `top`, `wrist` |
| Modelo base | lerobot/smolvla_base |
| Tamano del repositorio | 0,9 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

SmolVLA se presenta en el paper referenciado como un modelo vision-language-action compacto y eficiente, capaz de alcanzar rendimiento competitivo con un coste computacional reducido y de desplegarse en hardware de consumo. La política consume observaciones multimodales (estado proprioceptivo de 6 dimensiones e imagenes de 256x256) y emite directamente acciones de 6 dimensiones, que es el espacio de control del brazo SO-101. La model card no desglosa el numero de capas, el mecanismo de atencion ni el esquema de decodificacion de acciones, por lo que ese nivel de detalle debe consultarse en el paper.

El ajuste fino se realizo sobre el dataset `tkyoun13/so101_exp2_clutter`: 200 episodios, 81.630 fotogramas a 30 FPS, con dos tareas de lenguaje natural ("Pick up the kiwi among the objects and place it into the left basket" y su variante con la cesta derecha). La configuracion de entrenamiento reportada es de 25.000 pasos, batch size 32, optimizador AdamW, learning rate 0,0001, semilla 1000 y LeRobot 0.6.2. No se documentan fases de RLHF, DPO ni otras tecnicas de alineacion, ni la composicion del dataset de preentrenamiento del modelo base.

## Capacidades

- Control robótico por imitación: genera trayectorias de acción de 6 grados de libertad a partir de observaciones visuales y de estado.
- Seguimiento de instrucciones en lenguaje natural: distingue entre dos variantes de tarea ("left basket" frente a "right basket") a partir del texto de la tarea.
- Percepción multimodal con tres cámaras: la tabla de entradas declara tres flujos visuales de 256x256 píxeles, ademas del estado de las articulaciones.
- Manipulación en entornos con distractores: el dataset de entrenamiento se denomina "clutter" y la tarea consiste en localizar un kiwi entre varios objetos.
- Despliegue en hardware de consumo: el método base se describe como apto para equipos de gama de consumo.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo "thinking". Es una política de robótica, no un asistente conversacional.
- Capacidades multilingües: no disponible.

## Casos de uso

- Manipulación pick-and-place en laboratorio: recoger un objeto entre distractores y depositarlo en un contenedor concreto. Es exactamente la tarea para la que se ha entrenado el modelo, con dos destinos posibles (cesta izquierda o derecha).
- Banco de pruebas de imitación con LeRobot: sirve como referencia reproducible del flujo `lerobot-train` / `lerobot-rollout` para validar la infraestructura antes de escalar a datasets propios.
- Punto de partida para ajuste fino con datos propios: al derivar de `lerobot/smolvla_base` y ser Apache 2.0, puede reentrenarse con `--policy.path=lerobot/smolvla_base` sobre un dataset distinto y usarse este repositorio como comparativa base.
- Prototipado en robótica de bajo coste: un brazo SO-101 con dos o tres cámaras y una GPU de gama media permite montar una celda de manipulación completa sin inversión en hardware de datacenter.
- Evaluación de robustez frente a oclusión: el escenario "clutter" permite medir la degradación de la política cuando se añaden objetos, se cambia la iluminación o se reposicionan las piezas.
- Docencia y divulgación: ejemplo cerrado de VLA pequeño con dataset público, útil para explicar el pipeline de aprendizaje por imitación de principio a fin.
- Investigación en generalización de instrucciones: permite estudiar si la política responde correctamente a variantes de la orden sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet", y deja preparada una plantilla de tabla de éxito por tarea (ensayos, éxitos, tasa de éxito) que no se ha rellenado.

| Benchmark | Resultado |
|---|---|
| MMLU | No aplica (no es un LLM de texto) |
| HumanEval | No aplica |
| GSM8K | No aplica |
| Tasa de éxito en robot real | No disponible |
| Numero de ensayos por tarea | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB solo para pesos en bf16/fp16 (el repositorio ocupa 0,9 GB) y alrededor de 1,8 GB en fp32. Sumando activaciones de los tres flujos de imagen de 256x256 y del estado, una estimacion prudente es de 2 a 4 GB en precision mixta.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM. Una RTX 3060 de 12 GB, una RTX 4060, una RTX 4090 o una A100 son mas que suficientes. El metodo base se describe como desplegable en hardware de consumo.
- ¿Cabe en GPU de consumo? Si, con margen amplio. Tambien es candidato para plataformas embebidas tipo NVIDIA Jetson con 8 GB o mas, aunque no se aportan mediciones de latencia en esas plataformas.
- CPU: tecnicamente posible por el reducido numero de parametros, pero no se documenta rendimiento y no es el escenario recomendado para control en bucle cerrado.
- Opciones de despliegue: la via documentada es LeRobot mediante `lerobot-rollout` con `--policy.path=tkyoun13/so101_exp2_clutter_smolvla`, sobre PyTorch y con `--policy.device=cuda`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política de acciones.
- Latencia y throughput: no disponibles. Como referencia del entorno, el dataset se grabo a 30 FPS, lo que marca el orden de magnitud del bucle de control esperado, pero no se publica ninguna medicion de tiempo de inferencia.
- Requisitos de sistema adicionales: es necesario replicar el esquema de observacion del entrenamiento; las camaras deben declararse con los nombres con los que se entreno la politica y el robot debe ser de tipo `so_follower`.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tkyoun13/so101_exp2_clutter_smolvla | 450.046.176 | VLA ajustado para SO-101 | Estado 6D y 3 imagenes de 256x256 | apache-2.0 | HuggingFace, libreria `lerobot` |
| lerobot/smolvla_base | No disponible en la informacion proporcionada | VLA base preentrenado | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| Otros VLA de gran tamano (OpenVLA, pi0, GR00T N1 y similares) | No verificado en esta busqueda | VLA generalistas | No disponible | No disponible | No disponible |

La comparacion cuantitativa con alternativas no puede completarse: la busqueda web realizada no devolvio resultados tecnicos utilizables y la informacion proporcionada solo cubre el modelo base del que deriva esta política. Se recomienda consultar el paper arXiv:2506.01844 para la comparativa oficial de SmolVLA frente a otros VLA.

## Limitaciones y advertencias

- Sin evaluacion publicada: no hay tasa de exito medida, ni numero de ensayos, ni condiciones de evaluacion. No puede afirmarse que la política funcione de forma fiable en produccion.
- Ambito de tarea muy restringido: entrenada unicamente para dos tareas de pick-and-place de un kiwi, con dos destinos de cesta. Fuera de ese dominio no hay garantia de comportamiento util.
- Dependencia del entorno de entrenamiento: posiciones de objetos, iluminacion, fondo y disposicion de camaras influyen en el exito; la model card invita explicitamente a anotar este tipo de factores.
- Inconsistencia documentada en las camaras: la seccion "Model Details" declara `top` y `wrist`, mientras que la tabla de entradas lista `camera1`, `camera2` y `camera3` como tres flujos visuales. Conviene verificar los nombres reales de las claves de observacion antes de desplegar.
- Riesgo de alucinacion de acciones: como toda política de imitacion, puede generar trayectorias plausibles pero fisicamente invalidas en estados poco representados del espacio de estados.
- Idiomas: no se especifica soporte multilingue; las ordenes de entrenamiento estan en ingles y el comportamiento con instrucciones en castellano es desconocido.
- Licencia: Apache 2.0, permisiva para uso comercial, pero conviene revisar las condiciones del modelo base `lerobot/smolvla_base` y de las dependencias de LeRobot.
- Madurez y trazabilidad: 0 descargas y 0 "likes" en el momento de la consulta, un unico autor y fechas de creacion y actualizacion separadas por menos de un minuto. Es un artefacto experimental, no un modelo mantenido.
- Requisito de hardware fisico: el modelo solo tiene sentido con un brazo SO-101 calibrado y el juego de camaras correspondiente; no es desplegable como servicio de texto puro.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tkyoun13/so101_exp2_clutter_smolvla
- Dataset de entrenamiento: https://huggingface.co/datasets/tkyoun13/so101_exp2_clutter
- Visualizacion del dataset (LeRobot Spaces): https://huggingface.co/spaces/lerobot/visualize_dataset?path=tkyoun13/so101_exp2_clutter
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
