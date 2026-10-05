# WetLabRoboData/diffusion-liquid-scratch

## Resumen

diffusion-liquid-scratch es una politica de robotica basada en diffusion policy, publicada por el usuario WetLabRoboData dentro del ecosistema LeRobot. No es un modelo de lenguaje: se trata de un modelo de imitacion (imitation learning) que traduce observaciones visuales y de estado del robot en acciones motoras, entrenado especificamente para una unica tarea de manipulacion denominada "liquid" (manipulacion de liquidos con un robot UR3e bimanual y tres camaras).

El modelo tiene 266.531.943 parametros reales (segun los pesos en safetensors) y un repositorio de 1,1 GB, lo que es coherente con pesos almacenados en precision de 32 bits. La variante "scratch" indica que se ha entrenado desde cero solo con los datos de esta tarea, sin reutilizar un checkpoint previo de otro dominio. El autor declara 20 episodios de evaluacion con 19 exitos, es decir, una tasa de exito del 95 por ciento en el entorno de evaluacion documentado.

Su relevancia actual es doble: por un lado, ejemplifica el flujo de trabajo de LeRobot para publicar politicas de robotica reproducibles con pesos abiertos bajo licencia Apache 2.0; por otro, sirve como referencia de linea base para tareas de laboratorio humedo, donde la manipulacion precisa de liquidos es un cuello de botella habitual en automatizacion experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (LeRobot), no disponible el detalle de la red de prediccion de ruido ni del codificador visual |
| Parametros totales | 266.531.943 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica de robotica; la "ventana" depende de la observacion y del horizonte de accion configurado, no disponible) |
| Tipos de cuantizacion | no disponible; por el tamano del repo (1,1 GB) los pesos parecen estar en fp32 |
| Idiomas soportados | no aplica (no es un modelo de lenguaje; no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tarea objetivo | liquid |
| Robot | UR3e bimanual con 3 camaras |
| Dataset de entrenamiento | WetLabRoboData/lerobot-data-liquid |
| Repositorio | 1,1 GB |

## Arquitectura y entrenamiento

Se trata de una diffusion policy implementada en la libreria LeRobot. Este tipo de politica aprende una distribucion sobre secuencias de acciones (action chunks) mediante un proceso de difusion: se parte de ruido y se denoisa iterativamente condicionado por las observaciones del robot, que en este caso incluyen senales de tres camaras y el estado del manipulador. La generacion de acciones es multimodal por construccion, lo que ayuda en tareas con ambiguedad de trayectoria, como verter un liquido en un recipiente.

El entrenamiento es de tipo imitation learning supervisado sobre demostraciones teleoperadas del dataset WetLabRoboData/lerobot-data-liquid. La variante "scratch" implica que el modelo se inicializo sin pesos preentrenados y se ajusto unicamente con los datos de esta tarea. No hay informacion disponible en la documentacion proporcionada sobre el numero de episodios de demostracion, el numero de pasos de entrenamiento, la composicion exacta del dataset, la resolucion de las camaras, la frecuencia de control ni sobre si se aplicaron tecnicas de RLHF, DPO o refinamiento posterior. Tampoco se detalla la arquitectura interna del codificador visual ni del backbone de difusion.

El modelo fue reorganizado el 4 de octubre de 2026 a partir de WetLabRoboData/lerobot-data-rama-liquid_pouring, y los artefactos de entrenamiento archivados (checkpoints, train_config.json, registros de wandb) se conservan en la subcarpeta old/ del repositorio de origen para trazabilidad.

## Capacidades

- Generacion de trayectorias de accion para un robot UR3e bimanual a partir de observaciones visuales de tres camaras y del estado del robot.
- Ejecucion de la tarea especifica "liquid": manipulacion y vertido de liquidos en un entorno de laboratorio.
- Aprendizaje por imitacion: reproduce el estilo de las demostraciones teleoperadas del dataset de entrenamiento.
- Generacion multimodal de acciones mediante muestreo por difusion, util cuando existen varias trayectorias validas.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en lenguaje natural ni planificacion simbolica.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo "thinking", vision-lenguaje, audio ni generacion de codigo.
- Carga y despliegue mediante la API de LeRobot: `DiffusionPolicy.from_pretrained("WetLabRoboData/diffusion-liquid-scratch")`.

## Casos de uso

- Automatizacion de protocolos de laboratorio humedo: el modelo puede cerrar el bucle de control para tareas de dispensacion y vertido de liquidos sobre una bancada con un UR3e bimanual, reduciendo la intervencion manual en experimentos repetitivos.
- Linea base para investigacion en imitation learning: al ser una politica "scratch" con pesos abiertos y evaluacion publicada (19/20), sirve como referencia contra la que comparar variantes preentrenadas o tecnicas de aumento de datos.
- Reproduccion de experimentos: el par modelo + dataset + videos de rollout permite replicar la evaluacion en un montaje equivalente y verificar la tasa de exito declarada.
- Transferencia a tareas analogas: ajuste fino sobre otros datasets de manipulacion de liquidos o de manipulacion bimanual con geometria similar.
- Generacion de datos sinteticos de trayectorias: las muestras de la politica de difusion pueden usarse como propuestas iniciales para filtrado o para analisis de multimodalidad de la tarea.
- Formacion y docencia en robotica: ejemplo completo y abierto de un pipeline LeRobot de entrenamiento, evaluacion y publicacion de un modelo de robotica.
- Integracion en bancos de prueba de laboratorios automatizados: evaluar la viabilidad de un UR3e bimanual para una tarea concreta antes de invertir en un desarrollo a medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no es un modelo de lenguaje. El unico dato de rendimiento documentado es la evaluacion en la propia tarea:

| Metrica | Valor |
|---|---|
| Tarea | liquid |
| Robot | UR3e bimanual (3 camaras) |
| Episodios de evaluacion | 20 |
| Exitos | 19 / 20 |
| Tasa de exito | 95 por ciento |
| Comparacion con modelos similares | no disponible |
| Videos de rollout y resultados por episodio | WetLabRoboData/eval-diffusion-liquid-scratch |

## Requisitos de hardware

- VRAM estimada solo para los pesos, a partir de los 266.531.943 parametros: aproximadamente 1,07 GB en fp32 y 0,53 GB en fp16 (estimacion propia; el autor no publica requisitos).
- La VRAM real de inferencia es mayor, porque hay que sumar las activaciones del codificador visual, los búferes de imagenes de las tres camaras y el coste del bucle de denoising iterativo. El autor no publica estas cifras.
- GPU recomendadas: no disponibles en la informacion proporcionada. Cualquier GPU con al menos unos pocos gigabytes de VRAM libre deberia poder alojar los pesos en fp32 o fp16, pero no hay datos oficiales de compatibilidad.
- Encaje en GPU de consumo: probable por tamano de pesos (una RTX 4090 o similar dispondria de VRAM suficiente), pero no confirmado por el autor.
- Opciones de despliegue: LeRobot (via `DiffusionPolicy.from_pretrained`). No hay evidencia de soporte de vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje y no aplican a esta politica.
- Latencia y throughput: no disponibles. En diffusion policy la latencia depende del numero de pasos de denoising, del horizonte de accion y del hardware, ninguno de los cuales se especifica.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| diffusion-liquid-scratch | Diffusion policy (LeRobot) | 266.531.943 | no aplica | 19/20 exitos en la tarea liquid | Apache 2.0 | HuggingFace |
| Politicas ACT de LeRobot | Action chunking transformer | no disponible | no aplica | no disponible | no disponible | ecosistema LeRobot |
| Otras politicas de difusion para robotica | Diffusion policy | no disponible | no aplica | no disponible | no disponible | variable |

No se dispone de datos verificables de parametros, contexto ni rendimiento de las alternativas en la informacion proporcionada, por lo que la comparativa cuantitativa directa no es posible. La comparacion relevante para este modelo es interna al ecosistema LeRobot: frente a una politica ACT, la diffusion policy suele producir acciones multimodales a costa de una inferencia mas costosa por el bucle de denoising, pero no hay cifras publicadas aqui que respalden esa afirmacion para este modelo concreto.

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta entrenado solo para la tarea "liquid" con un UR3e bimanual y tres camaras. No es transferible sin ajuste fino a otros robots, otras camaras u otras tareas.
- Dependencia del montaje: cambios en la calibracion, la posicion de las camaras, la iluminacion o la geometria de la bancada pueden degradar el rendimiento de forma notable. La tasa del 95 por ciento corresponde a 20 episodios en el entorno documentado.
- Muestra de evaluacion pequena: 20 episodios implican un intervalo de confianza amplio; un exito de 19/20 no garantiza el mismo rendimiento en produccion.
- Riesgo de alucinacion en el sentido de acciones plausibles pero incorrectas: al muestrear de una distribucion aprendida, la politica puede generar trayectorias que no correspondan a la solucion real de la tarea.
- Sesgos inheritos a las demostraciones: el modelo reproduce las estrategias, velocidades y posibles malos habitos del operador que teleopero los datos.
- Sin informacion sobre el dataset: no se documentan el numero de episodios, la diversidad de condiciones ni los criterios de filtrado, lo que dificulta evaluar la cobertura de casos limite.
- Sin informacion de seguridad: no se describen limites de fuerza, parada de emergencia ni validacion en entornos con personas, algo critico en robots bimanuales que manipulan liquidos.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de copyright y licencia. No se declaran restricciones adicionales ni clausulas de uso responsable.
- Trazabilidad limitada: los artefactos de entrenamiento estan en la subcarpeta old/ del repositorio de origen, no en este repositorio.
- Cero descargas y cero "likes": el modelo no tiene validacion por parte de la comunidad en el momento de la consulta.
- La fecha de creacion registrada (2026-10-04) procede de los metadatos del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WetLabRoboData/diffusion-liquid-scratch
- Dataset de entrenamiento: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-liquid
- Dataset de evaluacion (videos de rollout y resultados por episodio): https://huggingface.co/datasets/WetLabRoboData/eval-diffusion-liquid-scratch
- Repositorio de origen con artefactos de entrenamiento archivados: WetLabRoboData/lerobot-data-rama-liquid_pouring (subcarpeta old/)
- LeRobot (libreria de despliegue): no se ha encontrado enlace en la busqueda web
- Paper o blog tecnico del modelo: no disponible en la informacion proporcionada
