# Tridex/train_smolvla_3cam__black_20k

## Resumen

Tridex/train_smolvla_3cam__black_20k es una politica robótica de manipulacion (vision-language-action) obtenida por ajuste fino del modelo base lerobot/smolvla_base, que implementa el metodo SmolVLA descrito en el articulo arXiv:2506.01844. El modelo tiene 450.046.176 parametros (aproximadamente 450 M) y sigue el paradigma VLA compacto: consume una observacion multimodal formada por el estado del robot (vector de 6 dimensiones) y tres imagenes RGB de 256x256 píxeles, y produce directamente un vector de accion continuo de 6 dimensiones.

El ajuste fino se ha realizado con LeRobot 0.6.1 sobre el dataset Tridex/record-test-3-cam_20260921_152126, compuesto por 60 episodios y 44.107 fotogramas grabados a 30 FPS para una unica tarea denominada "Prendre_la_gazeuse_v1". El entrenamiento se ejecuto durante 20.000 pasos con tamano de lote 8, optimizador AdamW y tasa de aprendizaje 0,0001, partiendo de la semilla 1000. El robot objetivo es un seguidor de tipo so_follower con tres camaras.

Su relevancia radica en que SmolVLA propone llevar la manipulacion robotica basada en aprendizaje por imitacion a hardware de consumo, con un coste computacional muy inferior al de los VLA de miles de millones de parametros. No obstante, este checkpoint concreto no incluye resultados de evaluacion, no tiene descargas ni "me gusta" en el momento de redactar la ficha, y esta especializado en una sola tarea, por lo que debe tratarse como un artefacto experimental de laboratorio mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) segun el metodo SmolVLA; politica de imitacion que mapea estado + imagenes a acciones continuas |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible (no se documenta ventana de contexto; cada inferencia usa el estado actual y un fotograma por camara) |
| Tipos de cuantizacion | no disponible (solo se publican pesos sin cuantizar; no se documentan variantes GGUF, int8 ni similares) |
| Idiomas soportados | no disponible (la politica se condiciona a la instruccion de tarea "Prendre_la_gazeuse_v1"; no es un modelo de lenguaje de proposito general) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 0,9 GB, libreria lerobot) |
| Modelo base | lerobot/smolvla_base |
| Entradas | observation.state (6,); observation.images.camera1, camera2 y camera3, cada una (3, 256, 256) |
| Salidas | action (6,) |
| Robot objetivo | so_follower, con camaras front, side y top segun la model card |
| Tarea entrenada | "Prendre_la_gazeuse_v1" |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde al metodo SmolVLA: un modelo vision-language-action compacto que combina un codificador visual y de lenguaje con un modulo generador de acciones continuas. La politica recibe tres vistas de camara a 256x256 píxeles junto con el estado articular de 6 dimensiones, y emite una accion de 6 dimensiones por paso de control. Al ser un ajuste fino de lerobot/smolvla_base, hereda los pesos preentrenados del modelo base y los especializa mediante aprendizaje por imitacion supervisado sobre las demostraciones del dataset indicado. La model card no detalla la composicion exacta del corpus de preentrenamiento del modelo base, ni si hubo etapas de RLHF o DPO (tecnicas propias de modelos de lenguaje y no documentadas aqui): esos datos figuran como no disponibles.

El ajuste fino se realizo con LeRobot 0.6.1 durante 20.000 pasos, tamano de lote 8, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. Los datos provienen de 60 episodios y 44.107 fotogramas a 30 FPS de una unica tarea, lo que supone un volumen reducido de demostraciones y un fuerte condicionamiento al entorno de grabacion (el propio identificador del modelo incluye la etiqueta "black", asociada al fondo empleado durante la recogida). No se documenta ninguna innovacion adicional especifica de este checkpoint, ni decodificacion especulativa, ni mecanismos de atencion lineal.

## Capacidades

- Generacion de acciones de manipulacion: produce comandos continuos de 6 grados de libertad a partir del estado articular y de tres imagenes RGB, sin generar texto intermedio.
- Percepcion multimodal con tres camaras simultaneas (front, side, top segun la model card; camera1, camera2 y camera3 segun la tabla de entradas).
- Ejecucion condicionada por instruccion de tarea: el prompt "Prendre_la_gazeuse_v1" selecciona el comportamiento aprendido.
- Control a frecuencia de captura de 30 FPS, coherente con el dataset de entrenamiento.
- Integracion con el ecosistema LeRobot: se ejecuta con lerobot-rollout y se reentrena con lerobot-train.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso explicito ni planificacion simbolica; el comportamiento es reactivo, un mapeo directo de observacion a accion.
- No tiene capacidades multilingues, de generacion de texto, de codigo, de matematicas, de vision general ni de audio.
- No dispone de modo de razonamiento (thinking mode) documentado.

## Casos de uso

- Recogida de objetos tipo botella en puesto de laboratorio: la politica esta entrenada especificamente para la tarea "Prendre_la_gazeuse_v1" sobre un brazo so_follower, por lo que puede emplearse para coger y manipular ese objeto concreto en condiciones similares a las de grabacion.
- Punto de partida para nuevos ajustes finos: al derivar de lerobot/smolvla_base, puede utilizarse como checkpoint inicial en lugar del modelo base cuando la nueva tarea comparta morfologia de robot y configuracion de camaras, aprovechando que ya ha visto datos reales de manipulacion.
- Validacion de un pipeline completo de aprendizaje por imitacion: sirve para comprobar de extremo a extremo la teleoperacion, la calibracion del brazo, la sincronizacion de las tres camaras y el registro de episodios en formato LeRobot antes de invertir en recogida de datos a mayor escala.
- Demostraciones educativas y divulgativas con hardware de bajo coste: con 450 M de parametros y un repositorio de 0,9 GB, puede ejecutarse en equipos de gama media o incluso en CPU, lo que facilita montar demostraciones en aulas y ferias sin clústeres de GPU.
- Estudio de sensibilidad a la configuracion de sensores: al estar entrenado con tres vistas concretas, permite experimentos controlados sobre que aporta cada camara y como afecta su ausencia o recolocacion al exito de la tarea.
- Reproducibilidad de experimentos de entrenamiento: los hiperparametros estan completamente documentados (20.000 pasos, lote 8, AdamW, lr 0,0001, semilla 1000, LeRobot 0.6.1), lo que permite replicar el ajuste y analizar la varianza entre ejecuciones.
- Ampliacion de un banco de pruebas de politicas VLA: util como referencia de politica compacta frente a alternativas de mayor tamano dentro de la misma categoria, siempre que se evalúe con el mismo protocolo fisico.
- Transferencia a variaciones de la tarea: reentrenando con un dataset propio se puede adaptar el comportamiento a otros objetos o posiciones, partiendo de un modelo que ya ha aprendido la dinamica basica del brazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica de forma explicita que todavia no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet"), y la plantilla de tabla de exito por tarea aparece sin rellenar. Tampoco se dispone de metricas de latencia o de tasa de exito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 450.046.176 parametros: en precision completa (fp32) los pesos ocupan aproximadamente 1,8 GB; en bf16/fp16, unos 0,9 GB. Anadiendo activaciones del codificador visual para tres imagenes de 256x256 y el estado de 6 dimensiones, una estimacion prudente es de 2 a 3 GB en bf16 y de 4 a 5 GB en fp32, aunque no hay cifras oficiales publicadas (no disponible).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; el modelo cabe con holgura en RTX 3060 (12 GB), RTX 4060, RTX 4070, RTX 4090, asi como en A100 o H100 si se dispone de ellas para entrenamiento. La model card del metodo SmolVLA indica que puede desplegarse en hardware de consumo.
- Compatibilidad con GPU de consumo: si, es uno de los puntos fuertes declarados del metodo. Se puede ejecutar en tarjetas de gama media e incluso en CPU si la frecuencia de control lo permite, aunque no se publican mediciones de latencia.
- Opciones de despliegue: LeRobot es la via oficial (comando lerobot-rollout con --policy.path=Tridex/train_smolvla_3cam__black_20k y --strategy.type=base), sobre PyTorch. vLLM, TGI, llama.cpp y Ollama no aplican, ya que no es un modelo de generacion de texto.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se grabo a 30 FPS y el bucle de control de LeRobot opera a esa frecuencia de referencia, lo que implica un presupuesto teorico de unos 33 ms por paso de inferencia, pero no se han publicado mediciones reales del tiempo de inferencia de esta politica.
- Requisitos adicionales: robot so_follower calibrado, tres camaras configuradas con los nombres de observacion con los que se entreno la politica y puerto de comunicacion correcto.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tridex/train_smolvla_3cam__black_20k | 450.046.176 | VLA compacto, ajuste fino de tarea unica | Estado (6,) + 3 imagenes 256x256 | apache-2.0 | HuggingFace, libreria lerobot |
| lerobot/smolvla_base | 450 M (aproximado, segun el modelo derivado) | VLA compacto preentrenado | Estado + imagenes | no disponible en la informacion consultada | HuggingFace |
| ACT (implementacion en LeRobot) | no disponible | Politica de imitacion basada en transformer, sin componente de lenguaje | Estado + imagenes | apache-2.0 (segun el repositorio LeRobot) | GitHub y documentacion de LeRobot |
| OpenVLA-7B | 7 000 M (aproximado) | VLA de gran tamano basado en un modelo de lenguaje de 7 B | Estado + imagen unica | no disponible en la informacion consultada | HuggingFace y repositorio publico |

La comparacion es orientativa: solo se dispone de datos verificados para el modelo de esta ficha y, parcialmente, para el modelo base. No hay resultados de rendimiento comparables publicados para el checkpoint analizado, por lo que no es posible establecer una jerarquia de calidad entre estas alternativas con la informacion disponible.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica tarea ("Prendre_la_gazeuse_v1"). Fuera de ella, las acciones no tienen ninguna garantia de ser utiles.
- Volumen de datos muy reducido: 60 episodios y 44.107 fotogramas para 450 M de parametros, lo que eleva el riesgo de sobreajuste al entorno, a las posiciones de los objetos y a la iluminacion concretos de la grabacion.
- Dependencia del fondo y de la iluminacion: el identificador del modelo incluye la etiqueta "black", lo que sugiere un entrenamiento con un fondo concreto; cambios de fondo, color de objeto o condiciones de luz pueden degradar el comportamiento de forma acusada.
- Sin evaluacion publicada: la model card indica explicitamente que no se han proporcionado resultados de exito, ni en robot real ni en simulacion. No hay evidencia cuantitativa de rendimiento.
- Requisitos de entrada rigidos: tres camaras RGB a 256x256 con los nombres de observacion exactos del entrenamiento, mas un estado de 6 dimensiones. Omitir o renombrar una camara invalida la inferencia.
- Dependencia de la morfologia: el modelo esta asociado a un robot de tipo so_follower. Usarlo con otro brazo o con un numero distinto de articulaciones requiere reentrenamiento.
- Sobre alucinacion: no aplica en el sentido linguistico, ya que el modelo no genera texto. El riesgo equivalente es la generacion de acciones fuera de distribucion, que puede producir movimientos erraticos o colisiones cuando la escena difiere del conjunto de entrenamiento.
- Sesgos conocidos: no disponibles. No se ha publicado ningun analisis de sesgo del dataset ni de la politica.
- Trazabilidad de la licencia: los pesos se publican bajo apache-2.0, que permite uso comercial, pero no se detalla la licencia del dataset de ajuste fino ni las condiciones del modelo base; conviene verificarlas antes de un despliegue comercial.
- Madurez: cero descargas y cero "me gusta" en el momento de redactar la ficha, con creacion y ultima actualizacion en septiembre de 2026. Es un artefacto sin validacion por parte de la comunidad.
- Seguridad fisica: cualquier uso en un robot real debe acompanarse de parada de emergencia, limites de par y de articulacion, y supervision humana durante las primeras pruebas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tridex/train_smolvla_3cam__black_20k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Tridex/record-test-3-cam_20260921_152126
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tridex/record-test-3-cam_20260921_152126
- Articulo de SmolVLA (pagina de papers en HuggingFace): https://huggingface.co/papers/2506.01844
- Articulo de SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de aprendizaje por imitacion (grabar datos y entrenar): https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos correspondian a consultas no relacionadas sobre Google Street View, por lo que no se han utilizado como fuente.
