# YzyLmc/pi05_yam_multitask_real

## Resumen

PI0.5 YAM multitarea es un modelo de politica robotica (vision-language-action, VLA) obtenido mediante ajuste fino de parametros completos de `lerobot/pi05_base` sobre demostraciones reales de teleoperacion del brazo YAM. Lo publica el usuario YzyLmc en Hugging Face y esta pensado para controlar un robot manipulador de 6 grados de libertad mas pinza a partir de dos camaras (escena y muneca izquierda), el estado articular y una instruccion en lenguaje natural. El problema que resuelve es el control visomotor de tareas de picking, apilado, desapilado y vertido en un entorno de laboratorio concreto.

El modelo tiene 3.616.757.520 parametros (unos 3,6 mil millones) y se distribuye en formato safetensors con un tamano de repositorio de 7,5 GB, lo que sugiere pesos en bf16. Se entreno sobre 393 episodios y 248.586 fotogramas a 30 fps procedentes de 14 tareas, reservando 9 episodios para validacion. La salida es un chunk de 60 acciones a 30 fps con 7 dimensiones (6 articulaciones mas pinza).

Es relevante ahora porque ejemplifica el flujo actual de trabajo en robotica open source con LeRobot: reutilizar un VLA base preentrenado y especializarlo con pocos cientos de episodios reales para una plataforma concreta. La ficha tecnica es, sin embargo, muy limitada: no hay licencia declarada, no se documentan idiomas ni benchmarks publicos, y solo existe una validacion offline (error absoluto medio de 0,032 sobre el chunk de 60 pasos) sin pruebas en bucle cerrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de `lerobot/pi05_base`; detalles internos no disponibles |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrada: 2 imagenes, estado de 7 dimensiones y cadena de tarea) |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors (probablemente bf16, no confirmado) |
| Idiomas soportados | no disponible; las cadenas de tarea del entrenamiento estan en ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, sha256 `fd4d0ed057fb41df2ab10e5564689674799bffdfd766a2b9f45e7e2f441c189e`) |
| Libreria | lerobot (requiere LeRobot 0.4.1) |
| Entradas | `observation.images.scene_camera` -> `base_0_rgb`; `observation.images.left_wrist_camera` -> `left_wrist_0_rgb`; `observation.state` (7); cadena de tarea |
| Salida | `action` (7), chunk de 60 acciones a 30 fps |
| Tamano del repositorio | 7,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` (commit a538eb27), un VLA de la familia pi0.5 integrado en LeRobot, y aplica un ajuste fino de parametros completos sobre demostraciones reales de teleoperacion del brazo YAM. La model card no detalla la arquitectura interna (tipo de transformer, mecanismo de atencion, tokenizador de acciones ni estrategia de fusion vision-lenguaje), por lo que esos datos deben consultarse en la documentacion del modelo base. La interfaz si esta bien definida: dos flujos de imagen (camara de escena y camara de muneca izquierda), un vector de estado de 7 dimensiones y una cadena de tarea en ingles; la salida es un chunk de 60 acciones de 7 dimensiones.

El entrenamiento uso 393 episodios y 248.586 fotogramas a 30 fps, extraidos de 14 tareas (los datasets LeRobot de YzyLmc, todos excepto `big_demo`). Se reservaron 9 episodios, uno por tarea, para validacion. La receta fue: batch 32, bf16, gradient checkpointing, AdamW con learning rate 2,5e-5 y decaimiento coseno hasta 2,5e-6, 1000 pasos de warmup y 30.000 pasos totales. No se documenta RLHF, DPO ni ninguna fase de alineacion posterior; es aprendizaje por imitacion supervisado sobre acciones. Un detalle tecnico relevante: la configuracion del repositorio fija `output_features.action.shape` a 7, mientras que el entrenamiento mantuvo la cabeza de 32 salidas del modelo base; los pesos no cambian y la politica simplemente conserva las 7 primeras salidas, de modo que el desnormalizador de 7 dimensiones funciona.

## Capacidades

- Control visomotor de un brazo YAM de 6 articulaciones mas pinza a partir de imagenes y una instruccion textual.
- Generacion de chunks de accion de 60 pasos a 30 fps, lo que permite ejecutar trayectorias cortas sin replanificar en cada fotograma.
- Ejecucion de 14 tareas concretas de manipulacion: picking de bloque azul, bloque amarillo, cuchara y taza; colocacion de la taza de pie y tumbada; vertido desde la taza; insercion de bloque o cuchara en la taza; apilado y desapilado de bloques azul y amarillo.
- Condicionamiento por cadena de tarea: la instruccion en lenguaje natural selecciona el comportamiento, siempre que se use exactamente una de las cadenas documentadas.
- Soporte de dos vistas simultaneas (escena y muneca), lo que aporta informacion de profundidad y de agarre.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito; es un modelo especializado en accion robotica, no un asistente conversacional.

## Casos de uso

- Manipulacion de laboratorio con el brazo YAM: el modelo actua como politica de control directa para las 14 tareas entrenadas, recibiendo imagenes de las dos camaras y el estado articular y emitiendo acciones a 30 fps. Es adecuado porque la receta y las interfaces estan fijadas y el error offline medido es bajo (0,032).
- Pick-and-place en lineas de montaje de prototipos: con las tareas de recogida de bloque y de insercion en taza, se puede automatizar la clasificacion y el traslado de piezas pequenas en una celda de laboratorio.
- Apilado y desapilado de objetos: las cuatro tareas de stack y unstack permiten probar rutinas de ensamblaje simple y de desmontaje, utiles para validar control fino de posicionamiento.
- Tareas de vertido y orientacion de recipientes: las tareas de vertido y de colocacion de la taza permiten experimentar con control de orientacion de la pinza y manipulacion de objetos no rigidos.
- Base para ajuste fino en una plataforma nueva: al ser un fine-tune completo de pi05_base con receta documentada (batch, learning rate, pasos), sirve como punto de partida para reentrenar con los datos de otro robot o de otra tarea, manteniendo el mismo pipeline de LeRobot.
- Evaluacion comparativa de politicas VLA: el checkpoint y los episodios reservados permiten medir error de accion frente a otras politicas sobre las mismas 9 demostraciones, con la cautela de que no hay prueba en bucle cerrado.
- Docencia y prototipado en robotica open source: al integrarse en LeRobot 0.4.1, se puede desplegar en un entorno de investigacion para demostrar el ciclo teleoperacion, entrenamiento y ejecucion autonoma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento es la validacion offline del autor:

| Metrica | Valor |
|---|---|
| Error absoluto medio del chunk de 60 acciones (9 demos reservadas, 27 observaciones) | 0,032 |
| Error absoluto medio de la referencia "mantener quieto" | 0,066 |
| Prueba en bucle cerrado | no realizada |
| Pasos de entrenamiento | 30.000 / 30.000 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 3,6 mil millones de parametros, en bf16 los pesos ocupan aproximadamente 7,2 GB; en fp32, unos 14,5 GB. A ello hay que sumar el coste de las dos imagenes de entrada y del decodificador de acciones, no cuantificado en la model card.
- GPU recomendadas: no especificadas por el autor. Por tamano, una GPU con 16 GB o mas de VRAM deberia poder cargar los pesos en bf16; para entrenamiento o ajuste fino se requieren configuraciones mayores, no documentadas.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 16-24 GB de VRAM (por ejemplo, RTX 4080 o RTX 4090) usando bf16, aunque no hay confirmacion oficial ni medidas de latencia.
- Opciones de despliegue: LeRobot 0.4.1 es obligatorio; el autor advierte que otras versiones construyen un prompt distinto y producen acciones diferentes con los mismos pesos. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que ademas no encajan con un modelo de politica robotica.
- Latencia y throughput: no disponibles. El modelo emite chunks de 60 acciones a 30 fps, es decir, 2 segundos de trayectoria por inferencia, pero no se publica el tiempo de computo por chunk.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PI0.5 YAM multitarea (este modelo) | 3,62 B | 2 imagenes + estado 7 + tarea; salida chunk de 60 | Error offline 0,032; sin bucle cerrado | no disponible | Hugging Face, 0 descargas |
| `lerobot/pi05_base` | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| Otras politicas VLA de LeRobot | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La informacion proporcionada no incluye datos de rendimiento de los modelos comparables, por lo que la comparacion cuantitativa no es posible. La unica referencia solida es que este modelo es un fine-tune completo de `lerobot/pi05_base` con la misma cabeza de accion de 32 salidas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial ni la redistribucion; hay que contactar con el autor antes de cualquier despliegue en produccion.
- Dependencia estricta de LeRobot 0.4.1: otras versiones generan prompts distintos y, por tanto, acciones distintas con los mismos pesos.
- Solo funciona con las 14 cadenas de tarea documentadas, en ingles y con redaccion exacta; no hay evidencia de generalizacion a instrucciones parafraseadas.
- Entrenado exclusivamente con demostraciones reales del brazo YAM; no se garantiza transferencia a otra cinematica, otra camara u otra iluminacion.
- Sin prueba en bucle cerrado: el error offline de 0,032 no garantiza estabilidad en ejecucion real, donde los errores se acumulan.
- La configuracion fija `action.shape` a 7 mientras los pesos conservan 32 salidas; cualquier cambio en ese ajuste puede romper el desnormalizador.
- Riesgo de sobreajuste a los 393 episodios y a las condiciones del laboratorio; no se documentan sesgos, pero el dominio es muy estrecho.
- No hay datos de sesgos sociales, alucinacion linguistica ni cobertura multilingue porque el modelo no es un generador de texto general.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YzyLmc/pi05_yam_multitask_real
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Libreria LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot
- Resultado de busqueda no relacionado (descartado): https://stockanalysis.com/stocks/nvda/
