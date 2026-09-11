# ulasZoi/smolvla_pickcube_bs4

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) que combina un codificador visual, un modelo de lenguaje y un experto de acciones para generar comandos motores directamente a partir de observaciones. La ficha que nos ocupa, `ulasZoi/smolvla_pickcube_bs4`, no es el modelo base sino un ajuste fino (fine-tuning) del checkpoint `lerobot/smolvla_base`, entrenado por el usuario ulasZoi para una única tarea robótica: recoger un cubo ("pick up the cube"). El resultado es una política de imitación de 450.046.176 parámetros (unos 450 M), publicada bajo licencia Apache 2.0 y con pesos en formato safetensors.

El problema que resuelve es concreto y acotado: dado un flujo de cámara frontal a 480x640 y un vector de estado de 6 dimensiones procedente de un brazo `so_follower` (familia SO-100/SO-101 de bajo coste), el modelo emite un vector de acción de 6 dimensiones a 30 FPS. No es un modelo de propósito general ni un asistente conversacional: es un controlador entrenado por imitación sobre 243 episodios y 76.011 fotogramas capturados con LeRobot 0.6.2, con 20.000 pasos de entrenamiento y batch size 4.

Su relevancia actual radica en que el tamaño reducido (~450 M de parámetros, repositorio de 1,2 GB) permite desplegar políticas VLA en hardware de consumo, algo inviable con alternativas de miles de millones de parámetros. La contrapartida es la especialización extrema: el modelo solo ha visto una tarea, un tipo de robot y una cámara, y el autor no ha publicado ninguna evaluación de tasa de éxito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en transformer; no se detalla la composicion interna en la informacion disponible |
| Parametros totales | 450.046.176 (unos 450 M) |
| Parametros activos | No aplica: no se indica que sea un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No aplica / no disponible: la politica consume una observacion por paso (imagen 3x480x640 y estado de 6 dimensiones), no una ventana de texto |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; la unica instruccion de tarea documentada es "pick up the cube" (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,2 GB |
| Libreria de entrenamiento | LeRobot (lerobot) |
| Modelo base | lerobot/smolvla_base |
| Entradas | observation.state (6,), observation.images.front (3, 480, 640) |
| Salidas | action (6,) |
| Robot objetivo | so_follower, con una camara "front" |
| Dataset de entrenamiento | ulasZoi/smolvla_pickcube_all (243 episodios, 76.011 fotogramas, 30 FPS) |
| Tarea | "pick up the cube" |

## Arquitectura y entrenamiento

SmolVLA pertenece a la familia de modelos visión-lenguaje-acción: un backbone de transformer que fusiona representaciones visuales (imagen frontal 480x640 en RGB) con el estado proprioceptivo del robot (6 dimensiones) y una instrucción de tarea en lenguaje natural, y que produce directamente el vector de acción (6 dimensiones) que se envía al controlador del brazo. El paper de referencia (arXiv:2506.01844) describe SmolVLA como un modelo compacto y eficiente capaz de rendimiento competitivo con un coste computacional reducido y desplegable en hardware de consumo. La información proporcionada no detalla la composición exacta del backbone, el número de capas, el codificador visual empleado ni el mecanismo de decodificación de acciones.

En cuanto al entrenamiento de este checkpoint concreto, se trata de un ajuste fino supervisado por imitación partiendo de `lerobot/smolvla_base`. El autor documenta los siguientes hiperparámetros: 20.000 pasos de entrenamiento, batch size de 4, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000, todo ello con LeRobot 0.6.2. El dataset `ulasZoi/smolvla_pickcube_all` contiene 243 episodios y 76.011 fotogramas grabados a 30 FPS para una única tarea. No se documenta el uso de RLHF, DPO ni ninguna técnica de alineación, algo esperable en un modelo de control motor. Tampoco se indica ninguna innovación técnica adicional más allá de las propias del método SmolVLA descrito en el paper.

## Capacidades

- Generación de acciones motoras de 6 grados de libertad para un brazo `so_follower`, a partir de una imagen frontal y del estado articular.
- Ejecución de una única tarea de manipulación: recoger un cubo ("pick up the cube").
- Acondicionamiento por instrucción en lenguaje natural: la tarea se especifica en el comando de rollout (`--task="pick up the cube"`).
- Control reactivo a 30 FPS, la frecuencia a la que se grabaron los datos de entrenamiento.
- Integración nativa con el ecosistema LeRobot: carga mediante `lerobot-rollout` y `--policy.path=ulasZoi/smolvla_pickcube_bs4`.
- Reentrenamiento y ajuste posterior mediante `lerobot-train`, partiendo del base `lerobot/smolvla_base` o de este mismo checkpoint.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, capacidades multilingües, modo de pensamiento (thinking), audio, ni visión más allá de la cámara de entrada.

## Casos de uso

- Reproducción de la tarea en un brazo SO-100/SO-101 real: con `lerobot-rollout`, el robot type `so_follower` y una cámara en 640x480 a 30 FPS, se puede replicar la política "pick up the cube" tal cual fue entrenada. Es adecuado porque las dimensiones de entrada y salida coinciden exactamente con el hardware documentado.
- Punto de partida para nuevas tareas de manipulación: el checkpoint sirve como inicialización en `lerobot-train` para grabar un dataset propio y ajustar una tarea distinta (por ejemplo, apilar objetos), aprovechando que ya ha aprendido representaciones visuales y motoras del mismo brazo.
- Docencia y formación en robótica de imitación: al ser un modelo de 450 M con repositorio de 1,2 GB, se puede desplegar en un portátil con GPU de gama media y mostrar el ciclo completo grabar-entrenar-desplegar sin infraestructura de clúster.
- Pruebas de reproducibilidad de pipelines LeRobot: útil para verificar versiones (0.6.2 en el entrenamiento), compatibilidad de configuración de cámaras y semillas, y para comparar el efecto de hiperparámetros como el batch size (el sufijo "bs4" del nombre hace referencia a batch size 4).
- Generación de datos sintéticos o aumentados: ejecutando la política con la estrategia `base` se pueden recoger trayectorias adicionales de la misma tarea para aumentar el dataset original de 243 episodios.
- Evaluación comparativa de políticas VLA pequeñas: sirve como referencia de una política especializada de 450 M frente a modelos generalistas de mayor tamaño en la misma tarea física.
- Demostraciones en ferias, aulas o vídeos técnicos: la licencia Apache 2.0 y el tamaño reducido facilitan su uso en montajes presenciales con hardware de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La sección de evaluación de la model card indica explícitamente que no se han proporcionado resultados para esta política ("No evaluation results have been provided for this policy yet"), por lo que no existe tasa de éxito medida, número de ensayos ni condiciones de prueba documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, unos 1,8 GB solo para los pesos (450.046.176 parámetros x 4 bytes); en bfloat16/float16, unos 0,9 GB. Estas cifras son estimaciones de cálculo y no cifras publicadas por el autor.
- Tamano en disco: 1,2 GB de repositorio.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM debería alojar los pesos con margen para activaciones; es decir, RTX 3060, RTX 4060, RTX 4070, RTX 4090, A100 o H100 son sobradamente suficientes. No hay indicios de que el modelo esté pensado para aceleradores de datacenter.
- Cabe en GPU de consumo: sí, con holgura, dado el tamaño de 450 M de parámetros. Es uno de los puntos fuertes declarados del método SmolVLA.
- Inferencia en CPU: técnicamente posible por el tamaño, pero no hay datos publicados de latencia; mantener 30 FPS en CPU es poco probable y no está garantizado.
- Opciones de despliegue: las propias del ecosistema LeRobot (`lerobot-rollout` para ejecución en el robot y `lerobot-train` para entrenamiento), con Políticas en PyTorch sobre `cuda`. No aplican vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de generación de texto ni se distribuyen pesos en GGUF.
- Latencia y throughput: no disponible. El único dato relacionado es que los datos de entrenamiento se grabaron a 30 FPS, lo que sugiere una frecuencia de control objetivo del orden de 30 Hz, pero no se han publicado mediciones de latencia real.

## Comparativa con modelos similares

Los datos de los modelos comparativos son orientativos y deben verificarse en sus fichas oficiales; los de este modelo provienen de la información proporcionada.

| Modelo | Parametros | Contexto / entradas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ulasZoi/smolvla_pickcube_bs4 | 450.046.176 | Una imagen 480x640 + estado de 6 dimensiones por paso | Apache 2.0 | HuggingFace, via LeRobot | Especializado en "pick up the cube"; sin evaluacion publicada |
| lerobot/smolvla_base | no disponible (mismo orden de magnitud, ~450 M) | Igual que SmolVLA | Apache 2.0 (segun el base) | HuggingFace | Modelo base del que se parte para el ajuste fino; proposito general dentro del metodo |
| OpenVLA | ~7 B | Una imagen + instruccion de texto | no disponible | Publico | VLA de referencia de mayor tamano; requiere mas VRAM |
| Octo | ~93 M (variante base) | Una o varias imagenes + objetivo | no disponible | Publico | Politica generalista previa a la familia SmolVLA |
| pi0 | ~3 B | Multiples imagenes + instruccion | no disponible | Publico | VLA de mayor capacidad, orientado a manipulacion general |

Las cifras de parametros y licencias de OpenVLA, Octo y pi0 no se han verificado en la informacion proporcionada y se incluyen solo como referencia de categoria; consultense sus fichas y papers originales antes de tomar decisiones.

## Limitaciones y advertencias

- Especializacion extrema: la politica solo ha sido entrenada para la tarea "pick up the cube", sobre un robot `so_follower` y una unica camara frontal. Cualquier cambio de tarea, de objeto, de posicion de camara o de robot exige reentrenamiento.
- Ausencia total de evaluacion: no hay tasa de exito publicada, ni numero de ensayos, ni condiciones de prueba. No se puede afirmar que el modelo funcione de forma fiable en produccion.
- Dataset pequeno: 243 episodios y 76.011 fotogramas para una sola tarea. Es un volumen limitado, lo que incrementa el riesgo de sobreajuste a las posiciones de objeto, iluminacion y fondo presentes en los datos.
- Riesgo de fallo silencioso: al ser una politica de imitacion, hereda los sesgos de las demostraciones humanas; si el operador usaba siempre determinadas trayectorias, el modelo las reproducira incluso cuando no sean apropiadas.
- Dependencia del hardware exacto: el estado de 6 dimensiones y la imagen 3x480x640 deben coincidir con la configuracion declarada; los nombres de las camaras deben coincidir con las claves de observacion del entrenamiento.
- Idiomas: no se documenta soporte multilingue; la instruccion de tarea conocida esta en ingles.
- Licencia: Apache 2.0 permite uso comercial y modificacion, siempre que se conserven los avisos de atribucion correspondientes. Conviene revisar tambien las condiciones del modelo base y de las dependencias de LeRobot.
- Fecha de publicacion: el repositorio figura creado el 11 de septiembre de 2026 y actualizado dos minutos despues, con 0 descargas y 0 "likes"; se trata de un artefacto reciente y sin validacion por parte de la comunidad.
- Cuantizacion: no hay pesos cuantizados publicados, asi que cualquier despliegue con menor precision requeriria convertir los safetensors por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ulasZoi/smolvla_pickcube_bs4
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/ulasZoi/smolvla_pickcube_all
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ulasZoi/smolvla_pickcube_all
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento por imitacion: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
