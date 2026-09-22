# Tridex/model_diffusion_3cam_40K_22_09

## Resumen

`Tridex/model_diffusion_3cam_40K_22_09` es una politica de robotica (policy) entrenada con el framework LeRobot de Hugging Face, que implementa el metodo Diffusion Policy descrito en el paper arXiv 2303.04137. No es un modelo de lenguaje: se trata de un controlador visuomotor que convierte observaciones (el estado articular de un brazo robot y tres flujos de video) en una secuencia de acciones motoras. La red modela la generacion de trayectorias de accion como un proceso de difusion, lo que produce movimientos suaves y multimodales, especialmente utiles en tareas de manipulacion con contacto fisico.

El modelo tiene 292.717.550 parametros (dato real de los pesos en safetensors) y ocupa 1,2 GB en el repositorio, lo que apunta a pesos en precision fp32. Ha sido entrenado sobre un unico conjunto de datos propio, `Tridex/_20260922_140724`, compuesto por 21 episodios y 22.397 fotogramas capturados a 30 FPS, para una sola tarea: "take the gaz cylinder and drop it". El robot objetivo es un `so_follower` (brazo SO-100 en modo follower) con tres camaras: frontal, lateral y superior, todas a 480x640.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de entrenamiento de Diffusion Policy con LeRobot 0.6.1, como base para ajuste fino en tareas de pick-and-place sobre el mismo hardware y como referencia para investigacion en fusion de multiples vistas. No tiene resultados de evaluacion publicados, cero descargas y cero likes, por lo que debe considerarse un artefacto experimental y no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de difusion para control visuomotor (Diffusion Policy, arXiv 2303.04137); detalles de backbone (capas, dimension oculta, tipo de codificador visual) no disponibles |
| Parametros totales | 292.717.550 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; consume una ventana de observaciones recientes (horizonte de observacion y de accion no especificados en la informacion disponible) |
| Tipos de cuantizacion | no se publican versiones cuantizadas; pesos en safetensors, presumiblemente fp32 (1,2 GB de repositorio para 292,7 M de parametros) |
| Idiomas soportados | no aplica (no genera lenguaje natural); la unica cadena textual es el identificador de tarea, en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

La arquitectura sigue el planteamiento de Diffusion Policy: el control visuomotor se formula como un proceso generativo de difusion que produce trayectorias de accion de multiples pasos en lugar de una accion unica por inferencia. El modelo recibe como entrada `observation.state` con forma `(6,)` (probablemente posicion o estado articular de las seis articulaciones del SO-100) y tres imagenes RGB de `(3, 480, 640)` procedentes de las camaras `front`, `side` y `top`. La salida es `action` con forma `(6,)`. Los detalles concretos del backbone (numero de capas, dimensiones ocultas, tipo de codificador por camara, si usa CNN temporal o transformer) no estan disponibles en la informacion proporcionada.

El entrenamiento se realizo con LeRobot 0.6.1 durante 40.000 pasos, con tamano de lote 8, optimizador Adam, tasa de aprendizaje 0,0001 y semilla 1000. El conjunto de datos tiene 21 episodios y 22.397 fotogramas a 30 FPS, todos ellos de la tarea "take the gaz cylinder and drop it". Se trata, por tanto, de un regimen de aprendizaje por imitacion supervisado sobre demostraciones humanas de teleoperacion; no hay indicios de RLHF, DPO ni de ningun proceso de ajuste por refuerzo en la informacion disponible. El volumen de datos es muy reducido (menos de 750 segundos de experiencia efectiva a 30 FPS), lo que limita la generalizacion fuera de las condiciones de captura.

## Capacidades

- Generacion de trayectorias de accion suaves y multimodales para manipulacion con contacto, gracias al modelado por difusion descrito en el paper de referencia.
- Control visuomotor a partir de tres vistas simultaneas (frontal, lateral y superior), lo que aporta informacion espacial redundante sobre la escena.
- Tarea especifica aprendida: coger un cilindro de gas y soltarlo ("take the gaz cylinder and drop it").
- Entrada de estado proprioceptivo de 6 dimensiones y salida de accion de 6 dimensiones, compatible con el brazo SO-100 en configuracion `so_follower`.
- Inferencia en bucle cerrado a 30 FPS mediante el comando `lerobot-rollout` de LeRobot.
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, vision-lenguaje, audio ni generacion de texto.
- No dispone de capacidades multilingues: no procesa ni genera lenguaje natural.
- Reentrenable y ajustable con `lerobot-train` usando `--policy.type=diffusion` sobre otros conjuntos de datos en formato LeRobot.

## Casos de uso

- Recogida y deposito de piezas cilindricas en linea de montaje: el modelo puede ejecutar la secuencia de aproximacion, agarre y liberacion de un cilindro sobre un brazo SO-100, con las tres camaras aportando la estimacion de pose necesaria para el contacto.
- Base para ajuste fino en tareas de pick-and-place similares: partiendo de estos pesos, se puede reentrenar con `lerobot-train` sobre un dataset propio con nuevos objetos o posiciones, reduciendo el numero de demostraciones necesarias frente a un entrenamiento desde cero.
- Investigacion en fusion de multiples vistas: al recibir tres camaras sincronizadas a 480x640, es un banco de pruebas para estudiar como afecta la redundancia visual a la robustez de una politica de difusion ante oclusiones.
- Reproduccion de resultados de Diffusion Policy: sirve como referencia practica de un entrenamiento completo (40.000 pasos, Adam, lr 1e-4) con LeRobot 0.6.1 para comparar hiperparametros y curvas de perdida.
- Laboratorio docente de robotica e imitacion: permite ilustrar el ciclo completo de teleoperacion, grabacion de episodios, entrenamiento de una policy y despliegue en robot real sin salir del ecosistema LeRobot.
- Evaluacion comparativa de politicas: util como baseline de difusion frente a metodos de action chunking tipo ACT o modelos VLA, siempre que se evalue en la misma tarea y con el mismo robot.
- Automatizacion de tareas repetitivas de baja variabilidad: en entornos controlados con iluminacion y posiciones fijas, puede sustituir a un operario en el ciclo de coger y soltar un objeto concreto.
- Generacion de datos sinteticos de accion para simuladores: las trayectorias multimodales producidas por el proceso de difusion pueden emplearse como distribucion de referencia al calibrar controladores en simulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la frase "No evaluation results have been provided for this policy yet", por lo que no existen tasas de exito en robot real, numero de ensayos ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,17 GB solo para los pesos en fp32 (292,7 M de parametros x 4 bytes). Sumando activaciones y tres flujos de imagen a 480x640, una estimacion prudente es de 2 a 4 GB de VRAM. Cifra orientativa, no publicada por el autor.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM. Una RTX 3060, RTX 4060, RTX 2070 o superior es suficiente. No se requieren A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna y en muchas integradas con suficiente memoria compartida, dado el reducido tamano del modelo.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con `--policy.path=Tridex/model_diffusion_3cam_40K_22_09` y `--robot.type=so_follower`. El backend es PyTorch (`--policy.device=cuda`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje y no expone una interfaz de chat.
- Latencia y throughput estimados: no disponibles. El bucle de control opera a 30 FPS, lo que implica un presupuesto de 33 ms por paso de inferencia, pero el autor no publica mediciones de latencia real ni de tiempo de respuesta del sistema completo.
- Requisitos adicionales: puerto serie del robot, tres camaras OpenCV a 640x480 y 30 FPS, y nombres de camara que coincidan exactamente con las claves de observacion del entrenamiento (`front`, `side`, `top`).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tridex/model_diffusion_3cam_40K_22_09 | Diffusion Policy para manipulacion | 292.717.550 | no disponible | apache-2.0 | Hugging Face, via LeRobot |
| ACT (Action Chunking Transformer) | Imitacion con action chunking basada en transformer | no disponible en la informacion proporcionada | no disponible | no disponible | Implementado en LeRobot |
| SmolVLA | Modelo vision-lenguaje-accion compacto | no disponible en la informacion proporcionada | no disponible | no disponible | Implementado en LeRobot |
| pi0 | Modelo vision-lenguaje-accion con flow matching | no disponible en la informacion proporcionada | no disponible | no disponible | Publicado por Physical Intelligence |

La comparacion cuantitativa no es posible con los datos disponibles: no hay resultados de evaluacion de este modelo ni cifras de rendimiento de las alternativas en esta misma tarea. A nivel cualitativo, ACT predice fragmentos de accion de forma determinista y suele requerir menos computo de inferencia, mientras que Diffusion Policy modela distribuciones multimodales y tiende a producir movimientos mas suaves a costa de varias pasos de denoising. Los modelos VLA como SmolVLA o pi0 anaden comprension de instrucciones en lenguaje natural, capacidad de la que carece esta policy.

## Limitaciones y advertencias

- Modelo de tarea unica: solo ha sido entrenado para "take the gaz cylinder and drop it". No generaliza a otros objetos, tareas ni instrucciones.
- Dataset muy reducido: 21 episodios y 22.397 fotogramas, equivalentes a unos 12 minutos de experiencia a 30 FPS, con una unica semilla y una unica configuracion de escena. El riesgo de sobreajuste a posiciones, iluminacion y fondo concretos es alto.
- Sin evaluacion publicada: no existe ninguna tasa de exito medida en robot real, por lo que no se puede afirmar nada sobre su fiabilidad en produccion.
- Dependencia del hardware exacto: calibracion del brazo, montaje de las camaras y resolucion de captura deben replicar las condiciones de entrenamiento; pequenos cambios de montaje degradan el comportamiento.
- Sesgo de los datos de demostracion: las trayectorias reflejan el estilo de teleoperacion de quien grabo los episodios, incluidas sus estrategias y posibles sesgos de aproximacion.
- Riesgo de alucinacion motora: como modelo generativo, puede producir trayectorias plausibles pero fisicamente incorrectas ante observaciones fuera de distribucion, con riesgo de colision o de agarre fallido.
- Sin capacidades de lenguaje: no acepta instrucciones en lenguaje natural, no soporta tool calling ni integracion en agentes conversacionales.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificacion con atribucion, pero la licencia cubre los pesos, no el cumplimiento de normativa de seguridad robotica ni de proteccion de datos de las grabaciones.
- Antes de cualquier despliegue real se recomienda validacion en entorno controlado, limites de par y parada de emergencia: el modelo no incorpora ninguna capa de seguridad.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso independiente ni de validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tridex/model_diffusion_3cam_40K_22_09
- Dataset de entrenamiento: https://huggingface.co/datasets/Tridex/_20260922_140724
- Visualizador de dataset de LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tridex/_20260922_140724
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137 (arXiv 2303.04137)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web asociada no devolvio ningun resultado relacionado con este modelo, su autor ni el metodo Diffusion Policy; los unicos resultados obtenidos fueron listados de adaptadores Bluetooth de un fabricante de perifericos y no guardan relacion con la ficha.
