# Tridex/train_smolvla_3cam_20k

## Resumen

Tridex/train_smolvla_3cam_20k es una política robótica de imitación (vision-language-action, VLA) obtenida por ajuste fino de lerobot/smolvla_base, el modelo base SmolVLA publicado por Hugging Face. Se distribuye a través de la librería LeRobot con licencia Apache 2.0 y un total de 450.046.176 parámetros (aproximadamente 450 M), lo que la sitúa en la gama ligera de los modelos VLA actuales, pensados para ejecutarse en hardware de consumo en lugar de en clústeres de GPU.

El modelo consume tres cámaras RGB de 256x256 píxeles (front, side, top) más un vector de estado de 6 dimensiones, y produce un vector de acción también de 6 dimensiones. Está especializado en una única tarea, identificada por la cadena de instrucción "Prendre_le_stabilo_v4", sobre un robot de tipo so_follower. El ajuste fino se realizó durante 20.000 pasos con batch size 8, optimizador AdamW y tasa de aprendizaje 1e-4 sobre un dataset propio de 60 episodios y 37.124 fotogramas grabados a 30 FPS.

Su relevancia es doble. Por un lado, sirve como ejemplo reproducible de un flujo completo de aprendizaje por imitación con LeRobot (grabación de datos, entrenamiento, publicación y despliegue). Por otro, demuestra que es posible adaptar una política VLA de 450 M de parámetros a una tarea concreta de manipulación con solo 60 demostraciones, manteniendo la posibilidad de ejecutarla en una GPU de gama media o incluso en un dispositivo embebido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de SmolVLA; el modelo base es SmolVLM con un módulo de acción. El detalle de bloques y cabezas se describe en el paper arXiv:2506.01844 (no replicado en la model card) |
| Parametros totales | 450.046.176 (dato real del fichero safetensors del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin variantes cuantizadas |
| Idiomas soportados | no disponible; la tarea se especifica mediante la cadena de texto "Prendre_le_stabilo_v4" (en frances), y no se documenta soporte multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato de politica de LeRobot) |
| Tipo de modelo (pipeline) | robotics (politica de imitacion / VLA) |
| Modelo base | lerobot/smolvla_base (ajuste fino) |
| Framework de entrenamiento | LeRobot 0.6.1 |
| Robot objetivo | so_follower (brazo tipo SO-100/SO-101 follower) |
| Camaras de entrada | front, side, top |
| Entradas | observation.state (6,), observation.images.camera1/2/3 (3, 256, 256) |
| Salidas | action (6,) |
| Tamano del repositorio | 0,9 GB |
| Pasos de entrenamiento | 20.000 |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

El modelo pertenece a la familia SmolVLA, descrita en el paper arXiv:2506.01844 y cuya implementacion de referencia esta en LeRobot. Es una politica vision-language-action: un codificador visual procesa tres vistas de 256x256, un backbone de tipo vision-language (heredado de SmolVLM) aporta la comprension de la escena y de la instruccion textual, y un modulo de accion específico genera comandos motores continuos. La model card no detalla la composicion interna de capas, el numero de tokens visuales ni el mecanismo exacto de decodificacion de acciones, por lo que esos extremos quedan como "no disponible" en esta ficha.

En cuanto al entrenamiento, este checkpoint es un ajuste fino del modelo base lerobot/smolvla_base sobre el dataset Tridex/record-test-3-cam_20260903_142712 (60 episodios, 37.124 fotogramas, 30 FPS, tarea "Prendre_le_stabilo_v4"). La configuracion registrada es de 20.000 pasos, batch size 8, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 1000. No se documenta si hubo mezcla con datos del preentrenamiento (co-training), tecnicas de RLHF/DPO, ni aumentos de datos; para un modelo de accion continua ese tipo de alineamiento por preferencias no es habitual, pero no se confirma en la informacion disponible.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones (posiciones o incrementos de las articulaciones del brazo so_follower) a partir del estado actual y de tres vistas de cámara.
- Percepcion multi-camara: integra simultaneamente imagenes frontales, laterales y cenitales, lo que ayuda a resolver oclusiones y a estimar profundidad en tareas de alcance y agarre.
- Ejecucion de una tarea concreta: "Prendre_le_stabilo_v4", consistente en coger un boligrafo o rotulador, segun el dataset de entrenamiento.
- Condicionamiento por instruccion textual: la tarea se especifica como cadena de texto en tiempo de inferencia (parametro --task en LeRobot), aunque no se documenta generalizacion a instrucciones nuevas.
- Control en bucle cerrado a 30 FPS: el dataset y el flujo de LeRobot estan preparados para operar a esa frecuencia.
- No soporta tool calling, function calling, agentes multi-paso ni modo de razonamiento explicito ("thinking"): no es un asistente de texto, sino una politica motora.
- No se documentan capacidades de vision general (VQA, OCR, grounding), audio ni generacion de texto libre.

## Casos de uso

- Automatizacion de pick-and-place de objetos alargados: el modelo esta entrenado para coger un boligrafo, por lo que puede emplearse en celdas donde haya que retirar o recolocar rotuladores, tubos finos o piezas de geometria similar, usando las tres camaras para localizar el objeto.
- Punto de partida para ajuste fino propio: dado que parte de lerobot/smolvla_base y el flujo de entrenamiento esta documentado en LeRobot, es una base razonable para reentrenar con un dataset propio de decenas de episodios y una tarea nueva del mismo robot.
- Docencia y formacion en aprendizaje por imitacion: permite reproducir de principio a fin un pipeline de grabacion, entrenamiento y despliegue con un coste de computo bajo (modelo de 450 M y dataset de menos de 1 GB).
- Validacion de pipelines de robotica antes de invertir en entrenamientos mayores: sirve para comprobar montaje fisico, calibracion de camaras, puertos y latencias de inferencia en un sistema real.
- Robotica de bajo coste y prototipado en laboratorio: un brazo so_follower con tres camaras y una GPU de consumo es suficiente para ejecutar la politica, lo que facilita experimentos en entornos academicos.
- Pruebas de robustez ante cambios de iluminacion o de posicion del objeto: al ser una politica visual pura, permite medir de forma controlada como degrada el exito al variar condiciones, aunque el autor no publica esas metricas.
- Manipulacion asistida con verificacion humana: dado que es una politica de una sola tarea y sin garantias de seguridad, encaja mejor en escenarios supervisados donde un operario pueda detener el brazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion con la nota literal "No evaluation results have been provided for this policy yet", es decir, no hay tasas de exito en robot real, ni numero de ensayos, ni condiciones de dificultad (posiciones nuevas, iluminacion, distractores). Tampoco se aportan metricas de perdida de entrenamiento ni comparaciones con el modelo base.

Los resultados de la busqueda web proporcionados no contienen informacion tecnica sobre el modelo: devolvieron exclusivamente paginas de inicio de sesion y promocion de Canva, sin relacion con SmolVLA ni con este checkpoint.

## Requisitos de hardware

- VRAM estimada en inferencia: aproximadamente 0,9 GB solo para los pesos en bf16/fp16 y en torno a 1,8 GB si se cargan en fp32; con activaciones de tres imagenes de 256x256 y el backbone visual, un presupuesto realista es de 3 a 6 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 o L4. En el extremo profesional, A100 o H100 son sobredimensionadas para inferencia y solo tienen sentido para reentrenar con lotes grandes.
- Cabe en GPU de consumo: si, es uno de los objetivos de diseno de SmolVLA. Tambien es viable en dispositivos embebidos tipo Jetson Orin NX/AGX, siempre que se respete la frecuencia de control.
- Entrenamiento: el ajuste fino con batch size 8 y tres camaras requiere mas memoria de la que sugiere el tamano de los pesos; se recomienda un minimo de 16-24 GB de VRAM, o bien reducir el batch y acumular gradientes.
- Opciones de despliegue: LeRobot es la via soportada, mediante el comando lerobot-rollout con --policy.path=Tridex/train_smolvla_3cam_20k y --strategy.type=base. vLLM, TGI, llama.cpp u Ollama no aplican, porque no es un modelo de lenguaje autorregresivo sino una politica de accion. No se documenta exportacion a ONNX, TensorRT ni formatos GGUF.
- Latencia y throughput: no disponibles. Como referencia de diseno, un control a 30 FPS exige inferencias por debajo de 33 ms, pero no hay mediciones publicadas para este checkpoint ni para su modelo base en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Camaras | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tridex/train_smolvla_3cam_20k | 450.046.176 | VLA de imitacion, ajustada a una tarea | 3 (front, side, top) | no disponible | Apache 2.0 | HuggingFace (LeRobot) |
| lerobot/smolvla_base | 450 M (misma familia, dato no confirmado en la informacion disponible para este repositorio) | VLA base preentrenada, sin tarea especifica | no disponible | no disponible | Apache 2.0 | HuggingFace (LeRobot) |
| Otras politicas VLA de codigo abierto (OpenVLA, pi0, Octo, GR00T N1 y similares) | no disponible | VLA / transformer de imitacion | no disponible | no disponible | no disponible | no disponible |

Solo el modelo base lerobot/smolvla_base puede compararse con datos procedentes de la informacion proporcionada, y la comparacion es directa: mismo autor de origen, misma familia arquitectonica y mismo pipeline de LeRobot. Cualquier otra comparacion con alternativas requiere consultar sus respectivas fichas tecnicas, que no forman parte de la informacion disponible aqui.

## Limitaciones y advertencias

- Especializacion extrema: el modelo ha sido entrenado con 60 episodios de una unica tarea ("Prendre_le_stabilo_v4"). Fuera de esa tarea, de ese objeto o de una posicion similar, no hay ninguna garantia de comportamiento util.
- Sin evaluacion publicada: no existen tasas de exito ni ensayos documentados, por lo que no se puede afirmar que el modelo funcione de forma fiable ni siquiera en su tarea objetivo.
- Riesgo de sobreajuste: 20.000 pasos sobre 37.124 fotogramas de un unico escenario pueden provocar memorizacion de posiciones, iluminacion y disposicion de las camaras del entorno de grabacion.
- Dependencia del montaje fisico: el modelo espera exactamente las claves de observacion del entrenamiento (observation.state de 6 dimensiones y tres imagenes con los nombres camera1, camera2 y camera3, asociadas a front, side y top). Cambiar el numero de camaras, su orden o su montaje invalida la politica.
- Sensibilidad al dominio visual: cambios de iluminacion, fondo, color del objeto o camaras distintas a las del dataset pueden degradar el rendimiento de forma no cuantificada.
- Sin garantias de seguridad: es una politica de aprendizaje por imitacion sin capa de seguridad explicita. No debe operar sin limites de par, paradas de emergencia ni supervision en entornos con personas.
- Idioma: no se documenta soporte multilingue ni generalizacion a instrucciones nuevas; la unica instruccion conocida es la cadena en frances del dataset.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene revisar por separado las condiciones del dataset Tridex/record-test-3-cam_20260903_142712, del modelo base lerobot/smolvla_base y del propio framework LeRobot, asi como las del robot so_follower.
- Sin datos de sesgo ni de alucinacion en el sentido de los modelos de lenguaje: al ser una politica motora no genera texto libre, pero puede producir acciones incorrectas o inseguras si la escena difiere de la distribucion de entrenamiento.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni validacion por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tridex/train_smolvla_3cam_20k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Tridex/record-test-3-cam_20260903_142712
- Visualizador del dataset (LeRobot Spaces): https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tridex/record-test-3-cam_20260903_142712
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Busqueda web: los resultados obtenidos no contienen enlaces relevantes sobre el modelo (devolvieron unicamente paginas de Canva sin relacion con SmolVLA).
