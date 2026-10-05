# van-i/diffusion_r2d2_to_box_bg

## Resumen

Diffusion Policy entrenada desde cero por el usuario van-i para la tarea robotica "pick R2-D2 and put it in the box" (coger la figura R2-D2 y depositarla en una bandeja de carton). Se trata de una politica de imitacion (imitation learning) basada en modelos de difusion condicionados, entrenada sobre 50 episodios teleoperados en un brazo SO-100 con tres camaras (dos cenitales y una en la muneca). El modelo tiene 292.717.550 parametros y se distribuye a traves de la libreria LeRobot en formato safetensors, con licencia Apache 2.0.

El modelo resuelve el problema de generar trayectorias de accion continuas y multimodales a partir de observaciones visuales y del estado del robot, sin necesidad de definir recompensas ni controladores manuales. Es relevante dentro del ecosistema LeRobot/LeLab como ejemplo reproducible de politica de difusion aplicada a un robot de bajo coste (SO-100), comparable en el mismo banco de pruebas con ACT, SmolVLA y GR00T N1.7.

El entrenamiento se realizo en una unica RTX 3090 (250 W) durante 4 horas y 4 minutos, con 36.000 pasos y batch 8 (aproximadamente 20 epocas). La model card reporta un exito de 9/10 en las posiciones vistas durante el entrenamiento y 2/4 en posiciones no vistas, con un tiempo medio de ~16,5 s por tarea completada. No se trata de un modelo de lenguaje: no tiene ventana de contexto textual ni capacidades de generacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo de difusion condicionado sobre secuencias de accion), entrenado desde cero |
| Parametros totales | 292.717.550 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (politica de accion; opera sobre un horizonte de observacion/accion, valor no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, sin entrada/salida de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

Se trata de una Diffusion Policy, un enfoque que modela la distribucion de secuencias de accion como un proceso de difusion denoising condicionado por las observaciones. En lugar de predecir una accion unica, el modelo aprende a generar "chunks" (bloques) de acciones coherentes temporalmente, lo que permite representar comportamientos multimodales (por ejemplo, aproximarse al objeto desde distintas posiciones de inicio). El modelo se ha entrenado desde cero, sin inicializacion a partir de pesos preentrenados, segun indica la model card.

Los datos de entrenamiento provienen del dataset `van-i/r2d2_to_box_bg_20261003_210444`, compuesto por 50 episodios teleoperados en un brazo SO-100 con tres camaras (`left` y `right` cenitales, `grip` en la muneca), con resolucion 640x480 a 30 fps. La tarea consiste en coger una figura R2-D2 desde una de cinco posiciones de inicio marcadas con cinta y depositarla en una bandeja de carton. El entrenamiento se ejecuto con 36.000 pasos, batch 8 (~20 epocas) y precision mixta, mediante la interfaz web de LeLab, con una perdida final de 0,006 (la propia model card advierte que no es comparable con la de otras politicas). No se documentan fases de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de trayectorias de accion continuas para control de un brazo robotico SO-100 / SO-101 follower a partir de observaciones visuales.
- Percepcion multimodal a partir de tres camaras simultaneas (dos cenitales y una en la muneca), con resolucion 640x480 a 30 fps.
- Ejecucion de la tarea especifica "pick r2d2 and put to box" en escenas similares a las del entrenamiento.
- Generalizacion parcial a posiciones de inicio no vistas: funciona en H1 (entre las marcas) pero no en H2 (fuera del area marcada).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso basado en lenguaje.
- No tiene capacidades multilingues ni de vision semantica general: la vision se usa exclusivamente para el control motor.
- No incorpora modo de "thinking", audio ni generacion de texto.

## Casos de uso

- Docencia en robotica: el modelo sirve como ejemplo reproducible de imitation learning con Diffusion Policy en un robot de bajo coste SO-100, con scripts y banco de pruebas documentados en el repositorio `van-i/so100-imitation-learning-stand`.
- Comparativa de politicas: permite contrastar de forma controlada Diffusion Policy frente a ACT, SmolVLA y GR00T N1.7 sobre el mismo dataset y el mismo banco fisico, usando las 14 pruebas por politica descritas en la model card.
- Automatizacion de picking en banco de laboratorio: el modelo puede integrarse en un puesto de manipulacion fijo (mesa mate oscura, bandeja en su posicion, iluminacion y camaras estables) para tareas de recogida y deposito.
- Replicacion de experimentos academicos: al estar bajo Apache 2.0 y publicarse junto al dataset, permite reproducir el entrenamiento en una unica GPU consumer (RTX 3090, ~4 h).
- Investigacion en politicas generativas: sirve como linea base para estudiar el comportamiento multimodal de la difusion frente a politicas deterministas como ACT.
- Desarrollo de demostraciones de robotica educativa: util para construir test stands escolares con LeRobot y LeLab, tal y como describe el autor.
- Evaluacion de robustez ante cambios de escena: el modelo solo funciona en condiciones similares a las de entrenamiento, por lo que es util para medir el impacto del cambio de iluminacion, posicion de la bandeja o colocacion de camaras.

## Benchmarks y rendimiento

Resultados sobre el brazo real reportados en la model card (14 intentos por politica: 5 posiciones entrenadas x2, posicion reservada H1 entre marcas x2, posicion reservada H2 fuera del area marcada x2):

| Politica | Posiciones entrenadas (P1-P5) | H1 (entre marcas) | H2 (fuera de las marcas) | Tiempo medio |
|---|---|---|---|---|
| ACT (15k) | 8/10 | 2/2 | 0/2 | ~10 s |
| Diffusion Policy (36k) | 9/10 | 2/2 | 0/2 | ~16,5 s |
| SmolVLA (25k) | 10/10 | 2/2 | 0/2 | ~8,4 s |
| GR00T N1.7 (18k) | 10/10 | 2/2 | 2/2 | ~9,8 s |

Perdida final de entrenamiento: 0,006 (la model card indica que no es comparable entre politicas). No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplica a este tipo de modelo.

## Requisitos de hardware

- Parametros: 292.717.550 (~293 M), con un repositorio de 1,2 GB en safetensors.
- VRAM estimada para inferencia: no disponible de forma explicita, pero al tratarse de un modelo de ~0,3 B de parametros el peso ocupa en torno a 1,2 GB (fp32) y menos de 1 GB en fp16; la inferencia cabe holgadamente en GPU consumer con unos pocos GB de VRAM libres.
- GPU recomendadas: la model card documenta entrenamiento en una RTX 3090 (250 W). Para inferencia son suficientes tarjetas consumer como RTX 3090, RTX 4090 o similares; tambien cabria en GPU de menor gama siempre que quede margen para las tres camaras a 640x480.
- Cabe en GPU consumer: si, en tarjetas de gama media-alta con suficientes puertos/controladores de camara.
- Opciones de despliegue: LeRobot 0.6.0 mediante el comando `lerobot-rollout` con `--strategy.type=base` y `--policy.path=van-i/diffusion_r2d2_to_box_bg`, apuntando a un SO-100/SO-101 follower. No se documentan despliegues con vLLM, llama.cpp ni TGI (no aplican a un modelo de robotica).
- Latencia y throughput: la model card reporta ~16,5 s por tarea completada en el brazo real, el tiempo mas alto de las cuatro politicas comparadas. Los FPS de control no se especifican.

## Comparativa con modelos similares

Los cuatro modelos siguientes fueron entrenados sobre el mismo dataset y evaluados en el mismo banco fisico:

| Modelo | Tipo | Parametros | Exito posiciones entrenadas | Exito H1 | Exito H2 | Tiempo medio | Licencia |
|---|---|---|---|---|---|---|---|
| Diffusion Policy (este modelo) | Diffusion Policy | 292.717.550 | 9/10 | 2/2 | 0/2 | ~16,5 s | apache-2.0 |
| ACT | Action Chunking Transformer | no disponible | 8/10 | 2/2 | 0/2 | ~10 s | no disponible |
| SmolVLA | VLA | no disponible | 10/10 | 2/2 | 0/2 | ~8,4 s | no disponible |
| GR00T N1.7 | VLA | no disponible | 10/10 | 2/2 | 2/2 | ~9,8 s | no disponible |

Nota: los parametros y licencias de ACT, SmolVLA y GR00T N1.7 no se detallan en la informacion proporcionada; se marcan como no disponibles. El detalle completo y los scripts se encuentran en el repositorio `van-i/so100-imitation-learning-stand`.

## Limitaciones y advertencias

- Sesgos o generalizacion: el modelo solo funciona en una escena similar a la de entrenamiento (mesa mate oscura, bandeja en su posicion, iluminacion y colocacion de camaras equivalentes). Cualquier cambio relevante degrada el rendimiento.
- Generalizacion espacial limitada: obtiene 2/2 en H1 (entre las marcas) pero 0/2 en H2 (fuera del area marcada), lo que indica poca capacidad de extrapolar a posiciones alejadas de las vistas en entrenamiento.
- Riesgo de fallo fisico: en robotica real, una politica de imitacion puede producir trayectorias erroneas; se requiere supervision y limites de seguridad en el brazo.
- Corpus de datos reducido: 50 episodios teleoperados, lo que limita la robustez frente a variaciones de objetos, iluminacion o fondo.
- Task-specific: la politica esta especializada en "pick r2d2 and put to box"; no es un modelo general ni reutilizable para otras tareas sin reentrenamiento.
- Sin capacidades de lenguaje: no admite instrucciones en lenguaje natural, tool calling ni razonamiento; la condicion de tarea es fija (`--task="pick r2d2 and put to box"`).
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de rendimiento fuera del entorno descrito.
- Datos de contexto y cuantizacion no publicados: no se especifican horizontes de observacion/accion ni opciones de cuantizacion, lo que dificulta estimar con precision su coste de despliegue.
- Fechas incoherentes en los metadatos: la creacion y la actualizacion se registran en 2026, igual que el dataset, por lo que conviene verificar la version exacta antes de integrarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/van-i/diffusion_r2d2_to_box_bg
- Dataset de entrenamiento: https://huggingface.co/datasets/van-i/r2d2_to_box_bg_20261003_210444
- Repositorio del banco de pruebas y comparativa de las cuatro politicas: https://huggingface.co/van-i/so100-imitation-learning-stand
- Diffusion Policy (referencia metodologica): https://diffusion-policy.cs.columbia.edu/

Nota: la busqueda web realizada no ha devuelto enlaces relevantes sobre este modelo (los resultados obtenidos corresponden a anuncios de furgonetas camper y no guardan relacion con el contenido de la ficha).
