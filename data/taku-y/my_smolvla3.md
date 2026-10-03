# taku-y/my_smolvla3

## Resumen

taku-y/my_smolvla3 es una política robótica de tipo vision-language-action (VLA) publicada en Hugging Face por el usuario taku-y, obtenida mediante ajuste fino del modelo base lerobot/smolvla_base. No se trata de un modelo de lenguaje conversacional, sino de una política de control entrenada para una única tarea de manipulación: "Tip the orange ping-pong ball from the small ladle into the box by twisting the wrist" (volcar una pelota de ping-pong naranja de un cazo pequeño a una caja girando la muñeca). El modelo consume estado de articulaciones y tres cámaras, y produce un vector de acción de 6 dimensiones, siguiendo el flujo de trabajo de la librería LeRobot de Hugging Face.

El modelo pesa 450.046.176 parámetros (unos 450 millones), con un repositorio de 0,9 GB en formato safetensors, y hereda la licencia Apache 2.0 del modelo base. Está construido sobre SmolVLA (https://huggingface.co/papers/2506.01844), un VLA compacto diseñado para ser competitivo con VLAs abiertos de mayor tamaño a un coste computacional reducido y desplegable en hardware de consumo. Su relevancia práctica radica en que demuestra el ciclo completo de imitación de bajo coste en robótica: grabar un dataset con 54 episodios, ajustar una política sobre un brazo SO follower y desplegarla en un solo equipo con GPU.

Al ser una ficha de política especializada y no un modelo generativo de propósito general, varios campos habituales (idiomas, cuantizaciones, benchmarks) no se aplican o no están publicados. Se indica explícitamente "no disponible" en cada uno de esos casos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) sobre SmolVLA; transformer (detalles internos no disponibles) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica al uso como política de control) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base (ajuste fino) |
| Libreria | lerobot (version 0.6.1 durante el entrenamiento) |
| Tipo de robot | so_follower |
| Camaras | front (3 entradas visuales de 3x256x256) |
| Entradas | observation.state (6,), observation.images.camera1/2/3 (3,256,256) |
| Salidas | action (6,) |

## Arquitectura y entrenamiento

La política sigue la arquitectura SmolVLA, un modelo vision-language-action compacto que combina percepcion visual y lenguaje con la generacion de acciones de control, tal y como se describe en el paper referenciado (arXiv 2506.01844). En lugar de generar texto, el modelo transforma observaciones multimodales (tres imagenes de camara a 256x256 y el estado de 6 articulaciones) en un vector de accion de 6 dimensiones que comanda el brazo so_follower. Se distribuye a traves del ecosistema LeRobot, que gestiona tanto el entrenamiento como el despliegue de la politica en el robot.

El ajuste fino se realizo sobre el dataset taku-y/record-20261003-3, compuesto por 54 episodios y 29.614 fotogramas capturados a 30 FPS, todos correspondientes a la tarea de volcar la pelota de ping-pong. La configuracion de entrenamiento documentada incluye 20.000 pasos, tamano de lote de 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. No se detalla en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de la tarea, ni si se emplearon etapas de RLHF o DPO (procedimientos habituales en modelos de lenguaje que no se aplican de forma estandar en politicas de imitacion). Cualquier innovacion tecnica interna adicional figura como no disponible.

## Capacidades

- Control robótico por imitacion: genera acciones de 6 grados de libertad para un brazo so_follower a partir de observaciones visuales y de estado.
- Percepcion multimodal: procesa simultaneamente tres flujos de imagen (3x256x256) y el vector de estado articular (6,).
- Ejecucion de una tarea especifica de manipulacion: volcar una pelota de ping-pong de un cazo a una caja girando la muñeca.
- Integracion con el pipeline LeRobot: se ejecuta con lerobot-rollout y se reentrena con lerobot-train.
- Despliegue en tiempo real: el dataset de entrenamiento opera a 30 FPS, ritmo al que esta pensada la captura de observaciones.
- Ajuste fino adicional: al derivar de lerobot/smolvla_base, puede servir de punto de partida para reentrenar sobre otros datasets de manipulacion.
- Soporte de tool calling / function calling: no disponible (no aplica a una politica de control).
- Capacidades multilingues: no disponible (no aplica).
- Modo de razonamiento, vision generativa o audio: no disponible (fuera del alcance de esta politica).

## Casos de uso

- Reproduccion de la tarea entrenada: desplegar la politica con lerobot-rollout sobre un brazo so_follower y tres camaras para ejecutar la maniobra de volcar la pelota, usando la tarea textual exacta con la que se entreno.
- Punto de partida para fine-tuning: emplear los pesos como inicializacion para nuevas tareas de manipulacion con muñeca, reutilizando el conocimiento visual adquirido por el modelo base SmolVLA.
- Investigacion en aprendizaje por imitacion: comparar el rendimiento de una politica ajustada con 20.000 pasos y 54 episodios frente a alternativas, dentro de un marco experimental reproducible en LeRobot.
- Recogida y validacion de datos: usar la politica como referencia para evaluar la calidad de nuevos datasets de teleoperacion (cobertura de poses, frecuencia de 30 FPS, numero de episodios necesario).
- Robotica educativa y de bajo coste: demostrar un ciclo completo de VLA sobre hardware accesible, ya que SmolVLA esta disenado para entrenar y desplegar en una sola GPU de consumo.
- Automatizacion de tareas repetitivas de laboratorio: integrar la politica en una celda robotizada donde la tarea de volcado se repita de forma controlada con objetos y posiciones consistentes.
- Desarrollo de pipelines de evaluacion de politicas: incorporar el modelo a baterias de pruebas que midan tasa de exito, robustez ante cambios de iluminacion o posicion, e integracion con el resto de utilidades de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que "no evaluation results have been provided for this policy yet", por lo que no existe una tabla de tasa de exito por tarea ni comparaciones cuantitativas con otras politicas. No se deben asumir cifras de rendimiento a partir del modelo base ni del paper.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en precision de 16 bits (los 450 millones de parametros ocupan ~0,9 GB, coincidiendo con el tamano del repositorio) y en torno a 1,8 GB en fp32. Estas cifras son estimaciones por tamano de pesos y no incluyen el coste de las activaciones ni del preprocesado de las tres imagenes.
- GPU recomendadas: no disponible en la informacion proporcionada. Al derivar de SmolVLA, disenado para hardware de consumo, es previsible que funcione en GPU de gama media y alta, pero no se confirma una lista concreta.
- Cabe en GPU de consumo: si, segun la descripcion de SmolVLA como modelo desplegable en hardware de consumo (fuente: aegean.ai). No se especifican los modelos exactos.
- Opciones de despliegue: LeRobot (comandos lerobot-rollout para ejecucion y lerobot-train para reentrenamiento), con `--policy.device=cuda`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a una politica de control VLA.
- Latencia y throughput: no disponibles. La unica referencia temporal es la frecuencia de captura del dataset, 30 FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| taku-y/my_smolvla3 | 450.046.176 | no aplica | sin evaluacion publicada | apache-2.0 | Hugging Face (lerobot) |
| lerobot/smolvla_base | no disponible | no aplica | no disponible en esta informacion | apache-2.0 | Hugging Face (modelo base) |
| Otras politicas VLA (pi0, GR00T, etc.) | no disponible | no disponible | no disponible | no disponible | no verificado en esta informacion |

El unico comparable directo documentado es lerobot/smolvla_base, del que este modelo es un ajuste fino especializado. La diferencia principal es de alcance: el base es un modelo generalista y este esta entrenado para una unica tarea. No se dispone de datos cuantitativos que permitan comparar rendimiento con otras alternativas VLA.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una sola tarea y un solo tipo de robot (so_follower); no debe esperarse generalizacion a otras tareas sin reentrenamiento.
- Ausencia de evaluacion: no hay resultados publicados de tasa de exito, por lo que el rendimiento real en el robot es desconocido.
- Riesgo de fallo en condiciones no vistas: cambios en posicion de objetos, iluminacion, fondo o tipo de camara pueden degradar el comportamiento, ya que el dataset de entrenamiento es reducido (54 episodios).
- Dependencia de la configuracion de camaras: los nombres e indices de camara deben coincidir con las claves de observacion usadas en el entrenamiento; un mapeo incorrecto invalida la inferencia.
- Sesgos conocidos: no disponibles. Al entrenarse sobre datos de un unico entorno y operador, es probable que la politica refleje esos sesgos, pero no se documentan.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto; el riesgo equivalente es la generacion de acciones incorrectas o inestables.
- Limitaciones de idioma: no aplica; el modelo no procesa lenguaje de forma generativa.
- Licencia: Apache 2.0, permisiva para uso comercial, pero se recomienda citar el paper metodo y LeRobot segun indica la model card.
- Caveat de produccion: al tratarse de una politica de robot real, cualquier despliegue debe incluir limites de seguridad fisica (parada de emergencia, limites de par y velocidad) independientemente del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taku-y/my_smolvla3
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/taku-y/record-20261003-3
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=taku-y/record-20261003-3
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos (CLI): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de despliegue (inference): https://huggingface.co/docs/lerobot/main/en/inference
- Referencia externa sobre SmolVLA: https://aegean.ai/book/vla-agents/smolvla
- Modelo relacionado del mismo autor: https://huggingface.co/taku-y/my_smolvla
