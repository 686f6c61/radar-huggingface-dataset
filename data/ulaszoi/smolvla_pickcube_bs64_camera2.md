# ulasZoi/smolvla_pickcube_bs64_camera2

## Resumen

`ulasZoi/smolvla_pickcube_bs64_camera2` es un checkpoint de politica robotica de tipo vision-language-action (VLA) obtenido por ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base`, que a su vez implementa el metodo SmolVLA descrito en el articulo arXiv:2506.01844. El modelo tiene 450.046.176 parametros (~450 M) y esta publicado bajo licencia Apache 2.0, por lo que puede reutilizarse y modificarse sin restricciones de uso comercial derivadas de la licencia.

Se trata de un modelo especializado, no generalista: ha sido entrenado con el dataset `ulasZoi/smolvla_pickcube_all` para una unica tarea de manipulacion, "pick up the cube", sobre un brazo robotico de tipo `so_follower` (familia SO-100 de LeRobot). Recibe como entrada el estado del robot (vector de 6 dimensiones) y hasta tres flujos de imagen de 3x256x256 pixeles, y produce como salida un vector de accion continuo de 6 dimensiones. Esto lo situa en el paradigma de imitation learning end-to-end: de pixeles y estado a comandos motores, sin planificacion simbolica intermedia.

Su relevancia practica esta en el coste: al tratarse de un VLA compacto, la model card del autor lo presenta como capaz de "rendimiento competitivo con coste computacional reducido" y desplegable en hardware de consumo. El repositorio ocupa 0,9 GB, lo que es coherente con pesos en precision de 16 bits, y lo hace util como linea base reproducible para experimentos de fine-tuning de politicas VLA en robots de bajo coste, asi como para estudiar el efecto del numero de camaras en el exito de la tarea (esta variante esta etiquetada como `camera2`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en transformers; el detalle concreto de backbone y cabezal de acciones no se especifica en la informacion disponible (ver arXiv:2506.01844) |
| Parametros totales | 450.046.176 (~450 M), segun los pesos reales en safetensors |
| Parametros activos | No aplica: no se declara que sea un modelo MoE |
| Longitud de contexto | No disponible; no es una ventana de tokens, sino la observacion actual (estado de 6 dimensiones e imagenes de 3x256x256) mas la instruccion de tarea |
| Tipos de cuantizacion | No disponible; el repositorio solo publica safetensors |
| Idiomas soportados | No disponible; la politica se condiciona con una instruccion textual en ingles en los ejemplos ("pick up the cube") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tamano del repositorio | 0,9 GB |
| Tarea (pipeline) | `robotics` |
| Robot objetivo | `so_follower` (brazo SO-100, seguidor) |
| Modelo base | `lerobot/smolvla_base` (fine-tuning) |
| Dataset de entrenamiento | `ulasZoi/smolvla_pickcube_all` |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un VLA compacto y eficiente, capaz de alcanzar rendimiento competitivo con coste computacional reducido y de desplegarse en hardware de consumo. Los detalles internos de la arquitectura (codificador visual, modelo de lenguaje subyacente, mecanismo de generacion de acciones) no se detallan en la model card ni en los resultados de busqueda; el autor remite al articulo SmolVLA (arXiv:2506.01844). Lo que si es verificable es la interfaz del modelo: entradas de estado de 6 dimensiones y tres caracteristicas visuales de 3x256x256 (`observation.images.camera1`, `camera2` y `camera3`, aunque la ficha tambien declara `Cameras: front`), y salida de accion de 6 dimensiones, lo que corresponde a una politica de control continuo de 6 grados de libertad.

El entrenamiento se hizo con LeRobot 0.6.2 mediante ajuste fino supervisado (imitation learning) sobre 243 episodios y 76.011 fotogramas grabados a 30 FPS del dataset `ulasZoi/smolvla_pickcube_all`, con una unica instruccion de tarea: "pick up the cube". La configuracion reportada es de 20.000 pasos, tamano de lote 64, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 1000. No se documenta en la informacion proporcionada el uso de RLHF, DPO ni tecnicas de refuerzo; tampoco se detalla la composicion del dataset mas alla de sus cifras agregadas ni si hubo aumento de datos o randomization de dominio.

## Capacidades

- Generacion de acciones motoras continuas: dado el estado del robot y las imagenes, produce un vector de accion de 6 dimensiones apto para control de un brazo `so_follower`.
- Ejecucion de una tarea de manipulacion concreta: recoger un cubo ("pick up the cube"), definida por el dataset de entrenamiento.
- Condicionamiento por instruccion textual: el pipeline de LeRobot pasa una cadena de tarea (`--task="pick up the cube"`), de modo que la politica es sensible al texto de la instruccion; no se documenta soporte multilingue.
- Fusion multimodal de multiples camaras: acepta hasta tres flujos visuales de 3x256x256 ademas del estado proprioceptivo.
- Aprendizaje por imitacion end-to-end: no requiere planificador simbolico ni modelo del entorno, mapea percepcion a accion directamente.
- Tool calling / function calling: no disponible; no es una capacidad aplicable a una politica robotica de control.
- Capacidades de agente y razonamiento multi-paso: no disponibles como tales; el comportamiento multi-paso emerge de la ejecucion continua de la politica, no de un bucle de razonamiento explicito.
- Capacidades especiales (modo thinking, vision general, audio): no disponibles; la vision esta integrada como entrada de control, no como capacidad de descripcion o dialogo.

## Casos de uso

- Demostracion de manipulacion pick-and-place en laboratorio: la politica ejecuta la secuencia completa de recogida del cubo a partir de imagenes y estado, lo que permite montar una demo reproducible con un SO-100 y verificar el comportamiento antes de invertir en politicas mayores.
- Linea base para experimentos de fine-tuning VLA: dado su tamano de ~450 M y su licencia Apache 2.0, sirve como punto de partida para comparar hiperparametros (pasos, lote, tasa de aprendizaje) en el mismo dataset; la semilla 1000 y el lote 64 documentados facilitan la reproducibilidad.
- Estudio de ablacion del numero de camaras: esta variante (`camera2`) permite comparar el exito de la tarea frente a configuraciones con una sola camara o con tres, aislando el efecto de la percepcion visual adicional sobre la tasa de exito.
- Despliegue en robotica de bajo coste con GPU de consumo: al ocupar 0,9 GB en disco y requerir un presupuesto de VRAM modesto, la politica es adecuada para estaciones con una RTX 3060 o superior, o para un modulo embebido tipo Jetson Orin en el propio robot.
- Recoleccion de datos y generacion de demostraciones: la politica puede ejecutarse en bucle para producir trayectorias iniciales que despues se corrigen o filtran, acelerando la creacion de nuevos datasets de imitacion en la misma tarea.
- Material docente en cursos de robotica e IA: el flujo completo (instalar LeRobot, calibrar el SO-100, grabar episodios, entrenar con `lerobot-train` y desplegar con `lerobot-rollout`) es un caso practico cerrado y de coste contenido para ensenar aprendizaje por imitacion.
- Evaluacion de infraestructura de inferencia para politicas: sirve para medir latencia y throughput de una politica transformer pequena con entrada visual triple en una GPU concreta, antes de escalar a modelos VLA de mayor tamano.
- Prototipado de integracion en celdas automatizadas simples: en escenarios de laboratorio con objetos y posiciones controladas, la politica puede integrarse en un banco de pruebas para validar sensores, camaras y calibracion del brazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la seccion de evaluacion sin rellenar y con la nota "_No evaluation results have been provided for this policy yet._", por lo que no se dispone de tasas de exito en robot real, numero de ensayos ni condiciones de dificultad (posiciones de objeto, iluminacion, distractores o cambios de robot). Los resultados de busqueda web obtenidos no contienen datos de rendimiento de este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 0,9 GB en precision de 16 bits (safetensors); sumando activaciones del codificador visual para hasta tres imagenes de 3x256x256, un presupuesto realista es de 2 a 4 GB de VRAM. Es una estimacion, no un dato documentado por el autor.
- GPU recomendadas: cualquier GPU NVIDIA con 4 GB o mas de VRAM y soporte CUDA deberia ser suficiente para inferencia; una RTX 3060, RTX 4060 o superior es un objetivo razonable. No hay cifras oficiales de latencia ni de throughput.
- Cabe en GPU de consumo: si, segun la propia model card del metodo SmolVLA, que se presenta como desplegable en hardware de gama de consumo. Para el robot, un modulo embebido tipo Jetson Orin es una opcion coherente por presupuesto de memoria.
- Opciones de despliegue: `lerobot-rollout` de la libreria LeRobot (comando documentado en la model card), con `--policy.path=ulasZoi/smolvla_pickcube_bs64_camera2` y `--robot.type=so_follower`. El entrenamiento y el fine-tuning se realizan con `lerobot-train`. Servidores de inferencia para LLM como vLLM, TGI, llama.cpp u Ollama no son aplicables a este tipo de politica.
- Latencia y throughput: no disponibles. Tampoco se documenta el rendimiento en CPU ni en precision reducida distinta de la publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ulasZoi/smolvla_pickcube_bs64_camera2` | 450.046.176 (~450 M) | VLA por imitacion, especializado en "pick up the cube" | Estado (6,) + hasta 3 imagenes 3x256x256 | Apache 2.0 | HuggingFace, libreria LeRobot |
| `lerobot/smolvla_base` | No disponible en la informacion proporcionada (misma arquitectura SmolVLA que este fine-tune) | VLA base preentrenado, generalista | No detallado en la informacion disponible | Apache 2.0 (segun la ficha del modelo ajustado) | HuggingFace |
| Otros VLA de la misma categoria (OpenVLA, pi0, GR00T N1, Octo, Diffusion Policy) | No disponible | VLA y politicas de imitacion | No disponible | No disponible | No disponible |

La unica comparacion documentada con datos es frente al checkpoint base del que deriva: misma familia arquitectonica, misma licencia y mismo ecosistema de despliegue, con la diferencia de que este modelo esta especializado en una tarea y un montaje concretos. No se dispone en la informacion proporcionada de parametros, contexto ni resultados comparables de otras familias VLA, por lo que no se establece una comparacion cuantitativa.

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta entrenado para una unica tarea ("pick up the cube") con un objeto y un montaje concretos. No es un modelo generalista de robotica y no cabe esperar transferencia a otras tareas sin nuevo fine-tuning.
- Sin resultados de evaluacion: no hay tasa de exito publicada, ni en robot real ni en simulacion, por lo que el rendimiento efectivo es desconocido.
- Ambiguedad en la configuracion de camaras: la model card declara `Cameras: front` en los detalles del modelo, mientras que la tabla de entradas lista tres claves visuales (`camera1`, `camera2`, `camera3`) y el nombre del repositorio sugiere dos camaras. Antes de desplegar hay que verificar los nombres exactos de las claves de observacion, porque deben coincidir con los del entrenamiento.
- Dependencia del montaje fisico: la politica asume un robot `so_follower` calibrado y unas camaras con posiciones y parametros equivalentes a los del dataset. Cambios de iluminacion, fondo, posicion del objeto o del robot pueden degradar el comportamiento.
- Riesgo de sobreajuste al dataset: 243 episodios y 76.011 fotogramas de una sola tarea es un volumen reducido; es probable que la diversidad de posiciones, apariencias y condiciones sea limitada.
- Idiomas: no se documenta soporte multilingue. La instruccion de tarea usada en los ejemplos esta en ingles, y no se verifica que la politica responda a instrucciones en castellano.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias; conviene revisar tambien las condiciones de los componentes del modelo base y del dataset utilizado.
- Caveat de despliegue: el entrenamiento se realizo con LeRobot 0.6.2; versiones muy distintas de la libreria o del formato de politica pueden requerir conversion o no cargar directamente.
- Alucinacion y seguridad fisica: al ser una politica de control, los fallos no se manifiestan como texto incorrecto sino como acciones fisicas erroneas. Es imprescindible operar con parada de emergencia, limites de par y espacio de trabajo despejado.
- Sin soporte documentado de cuantizacion: no se ofrecen pesos GGUF ni variantes cuantizadas, de modo que las estimaciones de memoria para precisiones inferiores a 16 bits no estan verificadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ulasZoi/smolvla_pickcube_bs64_camera2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/ulasZoi/smolvla_pickcube_all
- Articulo SmolVLA (arXiv): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ulasZoi/smolvla_pickcube_all
- Imagen de la arquitectura SmolVLA: https://cdn-uploads.huggingface.co/production/uploads/640e21ef3c82bd463ee5a76d/aooU0a3DMtYmy_1IWMaIM.png
- Cita de LeRobot (BibTeX en la model card): Cadene, Remi et al., "LeRobot: State-of-the-art Machine Learning for Real-World Robotics"
