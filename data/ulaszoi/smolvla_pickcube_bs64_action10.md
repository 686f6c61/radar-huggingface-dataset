# ulasZoi/smolvla_pickcube_bs64_Action10

## Resumen

ulasZoi/smolvla_pickcube_bs64_Action10 es un fine-tune de SmolVLA, un modelo vision-lenguaje-accion (VLA) compacto de 450.046.176 parametros (unos 450 M) publicado por el usuario ulasZoi sobre el checkpoint base lerobot/smolvla_base. La politica resuelve una unica tarea de manipulacion, "pick up the cube" (recoger un cubo), sobre un brazo robotico seguidor del tipo so_follower: consume imagenes de camara y un vector de estado articular de 6 dimensiones, y produce un vector de accion continuo tambien de 6 dimensiones.

El modelo se entreno con LeRobot 0.6.2 sobre el dataset ulasZoi/smolvla_pickcube_clean (125 episodios, 32.171 fotogramas a 30 FPS) durante 20.000 pasos, con batch de 64, optimizador AdamW y learning rate 1e-4. El repositorio completo ocupa 0,9 GB y se distribuye en safetensors bajo licencia Apache-2.0, por lo que es desplegable en hardware de consumo.

Su relevancia es practica: SmolVLA demuestra que un VLA de ~450 M puede ejecutarse en GPU de gama media o incluso en CPU, frente a alternativas de 3-7 B como pi0 u OpenVLA, y sirve como punto de partida reproducible para fine-tuning por imitacion en robots de bajo coste. Como contrapartida, es un artefacto experimental sin resultados de evaluacion publicados y con 0 descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) sobre transformer multimodal con cabeza de acciones continuas; politica de imitacion |
| Parametros totales | 450.046.176 (unos 450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de texto; consume 3 imagenes de 256x256 y un estado de 6 dimensiones) |
| Tipos de cuantizacion | no disponible (el repo se publica en safetensors; 0,9 GB en total) |
| Idiomas soportados | no disponible (la instruccion de tarea es texto libre; en entrenamiento se uso la frase en ingles "pick up the cube") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Pipeline | robotics |
| Modelo base | lerobot/smolvla_base (fine-tune) |
| Robot objetivo | so_follower (brazo seguidor tipo SO-100/SO-101) |
| Camaras declaradas | tarjeta: "front"; claves de observacion: camera1, camera2 y camera3 |
| Entradas | observation.state (6,), observation.images.camera1/2/3 (3, 256, 256) |
| Salidas | action (6,) |
| Dataset de entrenamiento | ulasZoi/smolvla_pickcube_clean (125 episodios, 32.171 fotogramas, 30 FPS) |
| Version de LeRobot | 0.6.2 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

SmolVLA se presenta como un modelo vision-lenguaje-accion compacto y eficiente, capaz de alcanzar rendimiento competitivo con un coste computacional reducido y de desplegarse en hardware de consumo, segun la descripcion del propio autor y el articulo referenciado (arXiv:2506.01844). En esta ficha el modelo es un fine-tune del checkpoint lerobot/smolvla_base: conserva la topologia del modelo base (450 M de parametros) y sustituye la cabeza de acciones por una ajustada a la morfologia concreta del robot so_follower, con 6 grados de libertad de estado y 6 de accion. Los detalles internos del backbone (codificador visual, modelo de lenguaje y objetivo exacto de la cabeza de acciones) no se especifican en la informacion proporcionada; el articulo citado es la fuente para consultarlos.

El entrenamiento se realizo con LeRobot 0.6.2 sobre el dataset ulasZoi/smolvla_pickcube_clean, compuesto por 125 episodios (32.171 fotogramas) grabados a 30 FPS con la unica tarea "pick up the cube". La configuracion publicada es: 20.000 pasos, batch size 64, optimizador AdamW, learning rate 0,0001 y semilla 1000. El nombre del repositorio ("bs64") coincide con el tamano de lote y el sufijo "Action10" sugiere una configuracion de chunking de acciones, aunque este extremo no se documenta en la tarjeta. No se indica en la informacion disponible si hubo etapas de RLHF, DPO u otro ajuste posterior al entrenamiento por imitacion.

## Capacidades

- Percepcion visual: procesa hasta tres flujos de imagen de 256x256 (observation.images.camera1, camera2 y camera3), aunque la tarjeta declara una unica camara "front".
- Percepcion propioceptiva: consume un vector de estado de 6 dimensiones (posicion articular del brazo seguidor).
- Generacion de acciones: emite un vector de accion continuo de 6 dimensiones para control de robot.
- Seguimiento de instrucciones en lenguaje natural: la tarea se especifica como texto (por ejemplo, --task="pick up the cube").
- Manipulacion pick-and-place: la politica esta especializada en recoger un cubo y colocarlo.
- Ejecucion en bucle cerrado a la cadencia del dataset (30 FPS), con rollout continuo mediante lerobot-rollout.
- Capacidad de fine-tuning adicional: al derivar de lerobot/smolvla_base, puede reentrenarse con nuevos datasets de imitacion.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, tool calling, function calling ni comportamiento de agente multi-paso: es una politica de control, no un modelo conversacional.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision general, audio, modo thinking): no disponibles.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: el modelo ejecuta directamente la tarea "pick up the cube" sobre un brazo so_follower con una o varias camaras, lo que permite reproducir un experimento completo de imitacion sin entrenar desde cero.
- Fine-tuning con datos propios: partiendo de este checkpoint o de lerobot/smolvla_base, un equipo puede grabar sus propios episodios con LeRobot y reentrenar la politica para una tarea nueva, reduciendo el coste frente a entrenar un VLA de 3-7 B.
- Investigacion en modelos VLA de bajo coste: sirve como referencia de 450 M para comparar latencia, consumo de VRAM y tasa de exito frente a modelos mas grandes, en entornos donde no hay GPU de datacenter.
- Docencia y formacion en robotica: su tamano (0,9 GB) y su licencia Apache-2.0 permiten distribuirlo en aulas y ejecutarlo en portatiles con GPU modesta o en CPU para demostraciones de aprendizaje por imitacion.
- Prototipado de automatizacion de picking en almacen: la politica puede integrarse en una celda de prueba con un brazo SO-100/SO-101 para validar el ciclo percepcion-accion antes de escalar a un sistema industrial.
- Pruebas de ablacion y reproducibilidad: al estar publicados los hiperparametros (20.000 pasos, batch 64, AdamW, lr 1e-4, semilla 1000) y el dataset (125 episodios, 30 FPS), permite reproducir el entrenamiento y variar sistematicamente una condicion.
- Evaluacion de infraestructura de inferencia robotica: sirve para medir si un equipo concreto puede sostener el bucle de control a 30 FPS con LeRobot y PyTorch.
- Generacion de datos sinteticos o aumentados: ejecutando la politica en simulacion o en el robot se pueden recoger trayectorias adicionales para ampliar el dataset original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La seccion de evaluacion de la tarjeta del modelo indica explicitamente que todavia no se han aportado resultados de evaluacion para esta politica, por lo que no existe tasa de exito medida en robot real ni comparacion numerica con otros modelos. Tampoco se publican datos de latencia, throughput ni consumo de memoria en inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia segun el numero de parametros (450 M): unos 1,8 GB en FP32, unos 0,9 GB en FP16/BF16 (coincide con el tamano del repo, 0,9 GB), unos 0,45 GB en INT8 y unos 0,23 GB en INT4. A estas cifras hay que sumar el coste de activaciones del codificador visual al procesar imagenes de 256x256.
- Cabe en practicamente cualquier GPU de consumo con 4 GB o mas de VRAM (GTX 1650 4 GB, RTX 3050, RTX 3060, RTX 4060, RTX 4090). El autor afirma que el modelo esta pensado para desplegarse en hardware de consumo.
- Ejecucion en CPU: viable por tamano, aunque la cadencia de control a 30 FPS no esta garantizada y no se publican mediciones.
- GPU de datacenter (A100, H100): no son necesarias para inferencia; pueden ser utiles para reentrenar con datasets mayores.
- Hardware robotico necesario: brazo seguidor so_follower con su puerto de comunicacion y las camaras declaradas en las claves de observacion; el nombre de las camaras debe coincidir con las claves usadas en el entrenamiento.
- Opciones de despliegue: LeRobot (comandos lerobot-rollout para inferencia y lerobot-train para entrenamiento) sobre PyTorch. No aplican vLLM, TGI, llama.cpp, Ollama ni GGUF, porque no es un modelo de generacion de texto.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se grabo a 30 FPS, lo que marca la cadencia deseable del bucle de control (aproximadamente 33 ms por paso), pero no se publica ninguna medicion real de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ulasZoi/smolvla_pickcube_bs64_Action10 (esta ficha) | 450 M | VLA, politica de imitacion | 3 imagenes de 256x256 + estado de 6 dim. | apache-2.0 | HuggingFace, via LeRobot |
| lerobot/smolvla_base | 450 M | VLA base (preentrenado) | no disponible en la informacion proporcionada | apache-2.0 (segun la ficha del modelo base) | HuggingFace, via LeRobot |
| OpenVLA | referencia externa no verificada en la informacion proporcionada | VLA | no disponible | no disponible | referencia externa |
| pi0 (Physical Intelligence) | referencia externa no verificada en la informacion proporcionada | VLA con flow matching | no disponible | no disponible | referencia externa |

No se dispone de comparativas de rendimiento (tasas de exito, latencia o consumo) entre este fine-tune y otros modelos VLA: el autor no ha publicado evaluacion. Cualquier cifra de modelos alternativos debe verificarse en sus respectivas publicaciones.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica tarea ("pick up the cube"), un unico tipo de robot (so_follower) y un unico montaje de camaras. No se puede esperar generalizacion a otras tareas, objetos o morfologias sin reentrenar.
- Ausencia total de evaluacion: la tarjeta indica que no se han aportado resultados. Se desconoce la tasa de exito en robot real, por lo que no es apta para produccion sin una validacion propia.
- Riesgo de sobreajuste al entorno de recogida de datos: 125 episodios y 32.171 fotogramas de un unico dataset implican sensibilidad a cambios de iluminacion, posicion del cubo, color del fondo o presencia de distracciones.
- Discrepancia en las camaras: la tarjeta declara "front" como camara, las entradas listan tres claves (camera1, camera2, camera3) y el comando de ejemplo del autor configura dos camaras. Es imprescindible respetar los nombres y el numero exactos de claves de observacion con los que se entreno la politica o la inferencia fallara.
- Idiomas: no se declara soporte multilingue. La instruccion de tarea usada en entrenamiento esta en ingles ("pick up the cube"); el comportamiento con instrucciones en castellano no esta documentado.
- Alucinacion y errores fisicos: como toda politica de imitacion, puede generar acciones plausibles pero incorrectas. En un robot real esto implica riesgo de colision, dano al material o al entorno; es obligatorio usar limites de par, parada de emergencia y supervision.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero no ofrece ninguna garantia. La responsabilidad de seguridad en el despliegue fisico recae integramente en quien lo opera. Conviene verificar tambien las condiciones del modelo base lerobot/smolvla_base.
- Madurez: el repositorio tiene 0 descargas y 0 likes, fue creado el 18 de septiembre de 2026 y no consta mantenimiento. Debe tratarse como un artefacto experimental, no como un componente soportado.
- Sesgos: no hay informacion sobre la composicion demografica o la diversidad del dataset; al ser datos de laboratorio, el modelo hereda los sesgos de ese entorno concreto (objetos, colores, superficies y condiciones de luz particulares).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ulasZoi/smolvla_pickcube_bs64_Action10
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/ulasZoi/smolvla_pickcube_clean
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ulasZoi/smolvla_pickcube_clean
- Articulo de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Imagen de la arquitectura: https://cdn-uploads.huggingface.co/production/uploads/640e21ef3c82bd463ee5a76d/aooU0a3DMtYmy_1IWMaIM.png
