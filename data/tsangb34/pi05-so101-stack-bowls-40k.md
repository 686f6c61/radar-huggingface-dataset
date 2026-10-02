# tsangb34/pi05-so101-stack-bowls-40k

## Resumen

`tsangb34/pi05-so101-stack-bowls-40k` es un policy de robotica entrenado mediante aprendizaje por imitacion y publicado por el usuario tsangb34 a traves de LeRobot. Se trata de un ajuste fino de `lerobot/pi05_base`, la implementacion en LeRobot de π₀.₅ (Pi05), el modelo Vision-Language-Action (VLA) de Physical Intelligence disenado para generalizacion en entornos abiertos. El modelo resuelve una tarea concreta de manipulacion: coger el cuenco de plastico blanco de la derecha y apilarlo sobre el cuenco de plastico blanco de la izquierda, usando un robot SO-101.

El modelo tiene 4.143.404.816 parametros (aproximadamente 4.14 mil millones) en formato safetensors, con un repositorio de 97.9 GB que previsiblemente incluye checkpoints de entrenamiento ademas de los pesos de inferencia. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Se entreno durante 40.000 pasos sobre un dataset de 100 episodios y 25.092 fotogramas a 30 FPS.

Su relevancia actual radica en que ejemplifica el flujo completo de LeRobot para el ajuste de un VLA fundacional a una tarea robotica especifica con hardware de bajo coste (SO-101), un patron habitual en laboratorios de investigacion y proyectos de robotica open source que quieren pasar de un modelo generalista a una politica operativa sin entrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); implementacion LeRobot de π₀.₅. Detalles internos de la arquitectura (backbone, cabezal de accion) no disponibles |
| Parametros totales | 4.143.404.816 (≈4.14 mil millones) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF, int8 o similares) |
| Idiomas soportados | No disponible (las instrucciones de tarea del dataset estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | so_follower (SO-101) |
| Camaras de entrada | front, wrist, empty_camera_0 |
| Tamano del repositorio | 97.9 GB |

## Arquitectura y entrenamiento

Segun la model card, π₀.₅ es un modelo Vision-Language-Action de Physical Intelligence que evoluciona π₀ para generalizar a entornos y situaciones completamente nuevas no vistas durante el entrenamiento. La implementacion disponible en este repositorio es la adaptacion de LeRobot, derivada del repositorio open source OpenPI del mismo fabricante. La model card no detalla la arquitectura interna (tipo de backbone, mecanismo de atencion, cabezal de accion ni estrategia de decodificacion), por lo que esos extremos quedan como no disponibles en la informacion proporcionada.

El ajuste fino se realizo sobre el dataset `Jiamo0912/so101-stack-bowls`, compuesto por 100 episodios, 25.092 fotogramas a 30 FPS y una unica tarea descrita como "Pick up the white plastic bowl on the right and stack it on top of the white plastic bowl on the left." La configuracion de entrenamiento registrada es: 40.000 pasos, batch size 16, optimizador AdamW, learning rate 2.5e-05, semilla 1000 y LeRobot 0.6.1. No se documenta en la informacion disponible el uso de RLHF, DPO ni otras tecnicas de alineacion posteriores al entrenamiento por imitacion.

Las entradas del policy son `observation.state` con forma `(6,)`, dos flujos visuales a `(3, 480, 640)` (camaras front y wrist) y un tercero a `(3, 224, 224)` (`empty_camera_0`); la salida es un vector `action` de forma `(6,)`, correspondiente a los seis grados de libertad del SO-101. El campo `empty_camera_0` sugiere una ranura de camara sin sensor real conectado, definida para mantener la estructura esperada por el modelo.

## Capacidades

- Generacion de acciones de manipulacion robotica: produce comandos de accion de 6 dimensiones para el robot SO-101 a partir de observaciones visuales y de estado.
- Percepcion visual multi-camara: consume hasta tres flujos de imagen simultaneos (vista frontal, vista de muneca y una tercera camara auxiliar).
- Ejecucion de una tarea de pick-and-place concreta: apilar un cuenco blanco sobre otro.
- Condicionamiento por instruccion en lenguaje natural: la tarea se pasa mediante el parametro `--task` en el CLI de LeRobot.
- Control en bucle cerrado a 30 FPS, segun la frecuencia de captura del dataset de entrenamiento.
- Integracion con el ecosistema LeRobot: entrenamiento, evaluacion y despliegue mediante `lerobot-train` y `lerobot-rollout`.
- Generalizacion de dominio: hereda del modelo base π₀.₅ la orientacion a generalizar a entornos nuevos, aunque no hay datos que cuantifiquen ese comportamiento en este ajuste concreto.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso explicito, vision generativa, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Automatizacion de una celda de apilado de piezas: el policy ejecuta la secuencia completa de recogida y apilado de cuencos sobre un SO-101, integrándose en una linea de montaje o demostracion donde la tarea este predefinida y el entorno sea estable.
- Banco de pruebas para investigacion en VLA: sirve como linea base reproducible para comparar estrategias de ajuste fino (por ejemplo, congelar o descongelar el codificador visual) sobre la misma tarea y el mismo dataset.
- Validacion de pipelines de aprendizaje por imitacion con LeRobot: permite recorrer el flujo completo de grabacion de datos, calibracion, entrenamiento y rollout con un caso de una sola tarea y 100 episodios.
- Reproduccion de resultados en robotica de bajo coste: al estar pensado para el SO-101, permite validar tecnicas de VLA en hardware economico en lugar de brazos industriales.
- Generacion de datos sinteticos o de referencia: el policy puede ejecutar la tarea de forma autonoma mientras se registran trayectorias adicionales para ampliar el dataset.
- Demostraciones y material docente: util como ejemplo documentado de un ajuste de π₀.₅ publicado en el Hub con configuracion de entrenamiento y comandos de ejecucion completos.
- Punto de partida para ajustes derivados: el propio autor ha publicado variantes sobre la misma tarea (por ejemplo, `pi05-so101-stack-white_bowls-vlareplica-40k-unfrozen-vision`), lo que indica su uso como base de experimentos de continua learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion con la nota explicita "_No evaluation results have been provided for this policy yet._", por lo que no existen tasas de exito, numero de ensayos ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8.3 GB en bf16 o fp16 (4.14 mil millones de parametros x 2 bytes) y unos 16.6 GB en fp32. A esta cifra hay que sumar el coste de activaciones de los tres flujos de imagen (dos a 480x640 y uno a 224x224), que puede anadir varios GB en funcion del batch.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 12-16 GB de VRAM. Para entrenamiento, una A100 o H100 de 40-80 GB resulta holgada; para inferencia, una RTX 4090 (24 GB), RTX 3090 (24 GB) o incluso una RTX 4080 (16 GB) en bf16.
- Cabe en GPU de consumo: si, en bf16 en tarjetas de 16 GB o superiores; en configuraciones de 8-12 GB puede ser necesario reducir el batch o aplicar cuantizacion, aunque no se documentan recetas oficiales de cuantizacion para este modelo.
- Opciones de despliegue: LeRobot es la via oficial, mediante `lerobot-rollout` con `--strategy.type=base` para inferencia y `--policy.device=cuda` para entrenamiento con `lerobot-train`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a policies de robotica.
- Latencia y throughput estimados: no disponibles. La unica referencia temporal es la frecuencia del dataset (30 FPS), que marca el ritmo al que se capturaron las observaciones, no el rendimiento medido del modelo.
- Almacenamiento: el repositorio ocupa 97.9 GB, presumiblemente por los checkpoints de entrenamiento; conviene reservar ese espacio o descargar unicamente los pesos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tsangb34/pi05-so101-stack-bowls-40k | ≈4.14 mil millones | Apilado de cuencos con SO-101 | Apache 2.0 | HuggingFace (LeRobot) | 40.000 pasos, dataset de 100 episodios |
| lerobot/pi05_base | No disponible | Modelo base VLA generalista | No disponible en la informacion proporcionada | HuggingFace (LeRobot) | Modelo del que parte el ajuste; requiere fine-tuning para tareas concretas |
| tsangb34/pi05-so101-stack-white_bowls-vlareplica-40k-unfrozen-vision | No disponible | Apilado de cuencos con SO-101 | No disponible en la informacion proporcionada | HuggingFace (LeRobot) | Variante del mismo autor con vision descongelada |
| π₀.₅ (Physical Intelligence) | No disponible | Manipulacion robotica generalista | No disponible en la informacion proporcionada | Implementacion OpenPI / LeRobot | Modelo original del que deriva pi05_base |

No se dispone de datos de rendimiento comparativos entre estas alternativas, por lo que la comparacion se limita a la naturaleza del modelo, el origen y la licencia.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasas de exito ni numero de ensayos publicados, por lo que se desconoce la fiabilidad real del policy en la tarea declarada.
- Especializacion extrema: el modelo esta ajustado para una unica tarea (apilar dos cuencos blancos concretos) sobre un unico tipo de robot; no debe esperarse comportamiento util fuera de ese escenario.
- Dependencia del montaje de camaras: los nombres e indices de camara deben coincidir exactamente con las claves de observacion del entrenamiento (`front`, `wrist`, `empty_camera_0`); un montaje distinto invalida las predicciones.
- Riesgo de sobreajuste al dataset: con solo 100 episodios y 25.092 fotogramas, es probable que el modelo sea sensible a cambios de iluminacion, posicion de los objetos, color de los cuencos o presencia de distractores.
- Sesgos conocidos: no disponibles en la informacion proporcionada. Al entrenarse con un dataset de laboratorio muy reducido, hereda los sesgos de posicionamiento, colores y condiciones fisicas presentes en esas grabaciones.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de acciones erroneas, ejecuciones incompletas o movimientos no seguros ante entradas fuera de distribucion.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y las instrucciones de tarea del dataset estan en ingles; no hay evidencia de soporte multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se atribuya correctamente. Conviene verificar la licencia del modelo base `lerobot/pi05_base` y de los datos originales de π₀.₅ antes de un despliegue comercial.
- Uso en produccion: al tratarse de un policy de robotica, cualquier despliegue debe acompanarse de limites de par, paradas de emergencia y supervision, dado que el modelo puede emitir acciones incorrectas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no existe validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tsangb34/pi05-so101-stack-bowls-40k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Jiamo0912/so101-stack-bowls
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Jiamo0912/so101-stack-bowls
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Variante del mismo autor con vision descongelada: https://huggingface.co/tsangb34/pi05-so101-stack-white_bowls-vlareplica-40k-unfrozen-vision
- Pi0.5 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/pi05
- Proyecto ContinualVLA (assets con pi05 sobre apilado de cuencos): https://github.com/Agentic-Intelligence-Lab/ContinualVLA/tree/main/assets/pi05_piper_stack_bowls_20260413/
