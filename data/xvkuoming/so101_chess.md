# XvKuoMing/so101_chess

## Resumen

so101_chess es una politica de vision-lenguaje-accion (VLA) entrenada para ejecutar movimientos de ajedrez con un brazo robotico SO-101 en simulacion. Lo desarrolla el usuario XvKuoMing y se distribuye como un fine-tuning con LoRA del modelo allenai/MolmoAct2-SO100_101, publicado bajo la libreria LeRobot. El modelo recibe una instruccion en lenguaje natural de tipo espacial ("pick up the piece on e2 and place it on e4"), imagenes de dos camaras (vista cenital y vista de muneca) y los angulos articulares actuales, y devuelve una accion de 6 grados de libertad para el brazo.

El problema que resuelve es acotado pero relevante para la investigacion en robotica: separar la decision de ajedrez (que la toma un motor de ajedrez externo) de la ejecucion fisica (que la asume la politica). De este modo, la politica no necesita razonar sobre reglas de ajedrez, solo localizar la pieza nombrada por su casilla y trasladarla. Con 5.601.988.144 parametros, el modelo se entreno sobre 6.095 demostraciones generadas por un experto scriptado en MuJoCo (497.565 fotogramas a 10 Hz) y alcanza un 84% de exito en movimientos y un 78% en capturas sobre 96 posiciones retenidas, con un error mediano de colocacion de 5,3 mm.

Su relevancia actual es doble. Por un lado, sirve como banco de pruebas reproducible de tecnicas de fine-tuning eficiente (LoRA de rango 64, bf16 con gradient checkpointing) aplicadas a politicas VLA. Por otro, documenta de forma inusualmente honesta los fallos, el ruido de evaluacion y una trampa de configuracion del modelo base (el decaimiento del learning rate a 24.000 pasos fijos), lo que lo convierte en material util para quien entrene politicas similares. Su principal limitacion es que, por ahora, no hay resultados en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica vision-lenguaje-accion (VLA) derivada de allenai/MolmoAct2-SO100_101; la model card no detalla la arquitectura interna |
| Parametros totales | 5.601.988.144 (5,6 B) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; el adaptador se entrena con LoRA de rango 64) |
| Idiomas soportados | instrucciones en ingles (instrucciones espaciales); la model card no declara soporte multilingue |
| Licencia | no disponible en los metadatos; la model card indica que la licencia sigue la del modelo base allenai/MolmoAct2-SO100_101 |
| Formato de pesos | safetensors (tamano del repositorio: 12,7 GB) |
| Entradas | observation.state (1, 6) en grados del SO-101; observation.images.top y observation.images.wrist, (1, 3, 480, 640) en [0, 1]; task (texto) |
| Salidas | accion (1, 6) en grados del SO-101, a 10 Hz (un objetivo cada tres periodos de control a 30 Hz) |
| Libreria | lerobot |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna mas alla de identificarla como una politica VLA de la familia MolmoAct2, fine-tuneada desde allenai/MolmoAct2-SO100_101. En la practica se usa a traves de `lerobot.policies.molmoact2.modeling_molmoact2.MolmoAct2Policy`, con preprocesadores y posprocesadores generados por `make_pre_post_processors`. La politica consume dos vistas de camara (cenital y de muneca) junto con el estado articular, y produce un vector de 6 grados de libertad.

El entrenamiento se hizo con LoRA de rango 64 sobre 6.095 demostraciones scriptadas (4.903 movimientos y 1.192 capturas; 497.565 fotogramas a 10 Hz, batch 8, 70.000 pasos, equivalentes a 1,13 epocas), en bf16 con gradient checkpointing y sobre una unica RTX 5090. El detalle tecnico mas destacado que documenta el autor es que MolmoAct2 decae el learning rate en una ventana fija de 24.000 pasos independientemente del valor de `--steps`; una ejecucion previa de 57.000 pasos quedo estancada en el 47% de exito en movimientos al pasar ese punto, y solo ajustar `scheduler_decay_steps` al presupuesto real produjo la curva de mejora publicada. Los datos de entrenamiento proceden de un experto scriptado en MuJoCo con un modelo calibrado del SO-101 y casillas de 28 mm, y cada episodio fue verificado (pieza en el destino indicado, en posicion vertical y sin desplazar nada mas).

La aleatorizacion del dataset es relevante para la generalizacion: en cada episodio se varian colores de pieza, iluminacion y tamano de pieza, se desplaza el tablero hasta 10 mm en cada eje y se arranca el brazo hasta 0,1 rad fuera de su pose de reposo. Esto fuerza a la politica a localizar la casilla en la imagen en lugar de memorizar angulos articulares.

## Capacidades

- Generacion de acciones motoras de 6 grados de libertad para un brazo SO-101 a partir de imagenes y estado articular.
- Seguimiento de instrucciones espaciales en lenguaje natural con dos familias: movimientos (`pick up the piece on e2 and place it on e4`) y capturas (`take the piece on d5 off the board`).
- Percepcion visual con dos camaras simultaneas: vista cenital del tablero y vista de muneca.
- Localizacion de casillas a partir de la imagen, con robustez entrenada frente a desplazamientos del tablero de hasta 10 mm y desviaciones de la pose inicial de hasta 0,1 rad.
- Politica estocastica: muestrea sus acciones, lo que produce variabilidad entre ejecuciones con los mismos pesos y las mismas posiciones.
- Control a 10 Hz con emision de objetivos cada tres periodos de control a 30 Hz (requiere interpolacion de objetivos).
- No dispone de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento: no es un modelo de lenguaje conversacional.
- No realiza reconocimiento de piezas por tipo (por ejemplo, "el caballo blanco") ni lectura de reglas de ajedrez; el motor de ajedrez es externo.
- Sin capacidades de audio, video generativo ni vision generalista fuera del dominio de la mesa de ajedrez.

## Casos de uso

- Investigacion en politicas VLA en simulacion: sirve como referencia reproducible de fine-tuning con LoRA sobre MolmoAct2, con una curva de entrenamiento publicada paso a paso (5/48 a 10k, 35/48 a 70k) y un registro completo de experimentos en `docs/EXPERIMENTS.md`.
- Evaluacion de robustez de manipulacion: el protocolo desplaza el tablero hasta 10 mm y arranca el brazo hasta 0,1 rad fuera de reposo, de modo que permite medir degradacion de una politica ante perturbaciones controladas sin necesidad de hardware.
- Generacion de demostraciones sinteticas para robotica: el dataset asociado (`XvKuoMing/so101_chess`, 6.095 episodios y 1.291 instrucciones distintas) puede reutilizarse para preentrenar o comparar otras politicas de pick-and-place.
- Base para nuevos fine-tunings: al ser un adaptador LoRA sobre MolmoAct2-SO100_101, es un punto de partida practico para tareas de colocacion precisa en otras geometrias, reentrenando con el mismo pipeline de LeRobot.
- Demostraciones y divulgacion: un brazo que ejecuta instrucciones de ajedrez en simulacion es un escaparate claro para explicar que hace un modelo VLA y donde falla, con videos de exitos y fallos ya publicados.
- Estudio de sim-to-real: el modelo esta pensado como primer paso de una hoja de ruta que incluye grabaciones reales en SO-101 y una demostracion comparativa simulacion-hardware, util para quien investigue la brecha de dominio.
- Analisis del coste de la interpolacion de acciones: el autor documenta que pasar de 12/16 a 16/16 exitos dependio unicamente de interpolar entre objetivos en lugar de saltar directamente a cada uno, un resultado directamente aplicable a otros controladores a 10 Hz sobre bucles a 30 Hz.
- Pruebas de integracion de LeRobot: el fragmento de codigo de la model card (carga del modelo, pre/postprocesadores y `select_action`) sirve como plantilla minima para validar un entorno LeRobot con GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a un modelo de accion robotica. El autor si publica evaluaciones de exito en tarea, sobre 96 posiciones retenidas (64 movimientos y 32 capturas), con 450 pasos de control por episodio, tablero desplazado hasta 10 mm y brazo hasta 0,1 rad fuera de su pose de reposo:

| Metrica | Resultado |
|---|---|
| Exito en movimientos | 54/64 (84%) |
| Exito en capturas | 25/32 (78%) |
| Capturas que alcanzaron la pieza nombrada | 30/32 |
| Error mediano de colocacion | 5,3 mm (movimientos y capturas) |

Progreso durante el entrenamiento, medido sobre 48 episodios (32 movimientos y 16 capturas):

| Paso | 10k | 20k | 30k | 40k | 50k | 62,5k | 70k |
|---|---|---|---|---|---|---|---|
| Exitos | 5/48 | 11/48 | 19/48 | 27/48 | 32/48 | 27/48 | 35/48 |

Desglose de fallos publicado: de 10 fallos en movimientos, 2 dejaron caer la pieza, 4 terminaron de pie a menos de 25 mm de la casilla objetivo (fuera de la regla de 11 mm), 4 quedaron mas lejos y 2 golpearon una pieza vecina. De 7 fallos en capturas, 3 dejaron caer la pieza. El autor advierte ademas de ruido de evaluacion: al repetir 29 posiciones de movimiento se invirtieron 8 resultados (24 exitos frente a 22), por lo que recomienda comparar sobre 96 episodios o mas.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir de los 5,6 B de parametros, no publicada por el autor): en bf16/fp16 en torno a 11-12 GB solo de pesos, mas activaciones y codificador visual; en int8 unos 6 GB y en int4 unos 3 GB, siempre que el pipeline de LeRobot admita esas cuantizaciones, algo que la informacion disponible no confirma.
- GPU recomendadas: el entrenamiento se completo en una unica RTX 5090; para inferencia son razonables tarjetas de 16 GB o mas (RTX 4090, RTX 5090) y, en entornos de servidor, A100 o H100 si se necesita servir varias politicas.
- Cabe en GPU de consumo: si, con 16 GB o mas de VRAM para los pesos en bf16 junto con el resto del pipeline. Por debajo de 12 GB habria que recurrir a cuantizacion, sin garantia de soporte.
- Opciones de despliegue: LeRobot con PyTorch y CUDA (`MolmoAct2Policy.from_pretrained(...).to("cuda").eval()`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y no son aplicables a una politica de accion robotica como esta.
- Latencia y throughput: no disponibles. El control opera a 10 Hz (objetivo cada 100 ms), lo que impone un limite de latencia por paso de inferencia, pero el autor no publica cifras de tiempo de inferencia ni de FPS.
- Requisitos adicionales: dos camaras (vista cenital y de muneca) a 480x640, y un bucle de control a 30 Hz con interpolacion entre objetivos.

## Comparativa con modelos similares

No hay datos comparativos publicados en la informacion proporcionada. La referencia directa es el modelo base del que deriva:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| XvKuoMing/so101_chess | 5,6 B | no disponible | no disponible (hereda la del base) | HuggingFace, via LeRobot, 0 descargas y 0 likes en el momento de la consulta |
| allenai/MolmoAct2-SO100_101 | no disponible en esta informacion | no disponible | no disponible en esta informacion | HuggingFace, modelo base del fine-tuning |

Otras alternativas de la misma categoria (politicas VLA para manipulacion, como OpenVLA o pi0) no aparecen en la busqueda web realizada, por lo que no se incluyen datos numericos de comparacion: no disponible.

## Limitaciones y advertencias

- Solo simulacion: no hay resultados en robot real. La model card indica explicitamente que la mitad en hardware es trabajo futuro, incluida la grabacion de demostraciones reales en SO-101.
- Dominio muy estrecho: solo dos familias de instrucciones (mover y capturar). Nombrar una pieza por su tipo ("el caballo blanco") requiere un reconocimiento para el que la politica no se entreno.
- La geometria esta fijada: casillas de 28 mm y una configuracion de camaras concreta estan integradas en todas las demostraciones. Cambiar tablero, tamano de casilla o montaje de camaras invalida el modelo.
- No puede coger una pieza tumbada: el agarre asume un cilindro en posicion vertical.
- Ruido de evaluacion alto: la politica muestrea acciones, de modo que los mismos pesos sobre las mismas posiciones no dan el mismo resultado. Diferencias de pocos exitos sobre 48 episodios no son significativas; el autor recomienda usar 96 o mas.
- Errores residuales conocidos: piezas caidas (2 en movimientos, 3 en capturas), piezas vecinas desplazadas (2 casos) y colocaciones que quedan justo fuera del umbral de 11 mm (4 casos).
- Requiere interpolacion de objetivos: ejecutar directamente cada objetivo a 30 Hz vuelca las piezas; en un experimento previo la interpolacion llevo el mismo checkpoint de 12/16 a 16/16. El autor indica que esto tambien aplica en hardware.
- Licencia no disponible en los metadatos: la model card remite a la licencia del modelo base, allenai/MolmoAct2-SO100_101. Antes de un uso comercial hay que verificar la licencia efectiva del base, que no se detalla en la informacion disponible.
- Riesgo de alucinacion en el sentido habitual de un LLM: no aplica como tal, pero si existe el fallo analogo de ejecutar un movimiento plausible sobre una casilla equivocada; el modelo no verifica internamente que la accion cumpla la instruccion.
- Adopcion practica muy baja: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros ni soporte de la comunidad.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados corresponden a un partido de cricket y no guardan relacion con la ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XvKuoMing/so101_chess
- Dataset de entrenamiento: https://huggingface.co/datasets/XvKuoMing/so101_chess
- Modelo base: https://huggingface.co/allenai/MolmoAct2-SO100_101
- Video de movimientos: https://huggingface.co/XvKuoMing/so101_chess/resolve/main/media/reel_moves.mp4
- Video de capturas: https://huggingface.co/XvKuoMing/so101_chess/resolve/main/media/reel_captures.mp4
- Registro de experimentos: `docs/EXPERIMENTS.md` dentro del repositorio del modelo
- Libreria de despliegue: LeRobot (https://github.com/huggingface/lerobot)
- Papers, blogs o demos adicionales: no disponible en la informacion proporcionada (la busqueda web no devolvio resultados relevantes)
