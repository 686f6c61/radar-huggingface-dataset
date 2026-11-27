# twanghcmut/pi05-aloha-left-arm-3task

## Resumen

π0.5-aloha-left-arm-3task es un ajuste fino del modelo base `physical-intelligence/pi05_base`, un modelo de vision-lenguaje-accion (VLA) orientado a robotica. Lo publica el usuario `twanghcmut` y esta entrenado para controlar unicamente el brazo izquierdo de un robot ALOHA en tres tareas de manipulacion domestica: cubrir un cubo con un vaso y apilar otro, clasificar bloques de colores en vasos y guardar un bloque en un cajon. Un unico checkpoint cubre las tres tareas; la instruccion en lenguaje natural selecciona cual ejecutar.

El modelo parte de la arquitectura π0.5 de Physical Intelligence (openpi, en PyTorch) y se ha entrenado con 249 episodios y 63.190 fotogramas a 15 fps, procedentes de tres datasets de LeRobot v2.1 fusionados. El resultado es una politica que recibe el estado articular del brazo izquierdo (7 dimensiones en radianes) y dos imagenes (camara cenital y camara de muneca izquierda), y devuelve acciones absolutas con un horizonte de 16 pasos (aproximadamente 1,07 s a 15 fps).

Su relevancia es acotada pero concreta: demuestra el flujo de trabajo de ajuste fino de un VLA generalista sobre un robot de bajo coste con un solo brazo, algo poco habitual en los checkpoints publicos de π0.5, que suelen asumir plataformas bimanuales. Es un artefacto de investigacion, no un modelo listo para produccion: no hay evaluacion en robot real y las metricas publicadas son de error de imitacion en bucle abierto sobre los propios datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion) π0.5, implementacion openpi en PyTorch |
| Parametros totales | 3.616.757.520 (aproximadamente 3,62 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision completa; el autor no documenta variantes GGUF, int8 ni int4) |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch), mas `metadata.pt` y `norm_stats.json` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura π0.5 de Physical Intelligence: un VLA que combina un codificador visual, un modelo de lenguaje preentrenado y un cabezal de acciones que genera secuencias de comandos motores condicionadas por la instruccion en lenguaje natural y el estado del robot. El ajuste fino se realizo con la configuracion `pi05_aloha_left_hand_3task_left` del fork `hungho77/openpi` (commit `7aa7b15`), usando los transforms de openpi para robot de un solo brazo SO101 con `arm_joints=6`. Se eliminaron las 7 dimensiones del brazo derecho y la camara de muneca derecha, que permanecen estaticos en todos los datos; esa ranura de imagen se enmascara.

El entrenamiento consistio en 6.000 pasos con batch efectivo de 128 (32 x 4 de acumulacion), lo que suma 768.000 muestras, aproximadamente 12 epocas sobre los 63.190 fotogramas. Se uso learning rate 2,5e-5 con decaimiento coseno, 1.000 pasos de warmup y precision bf16, en una sola H100 de 80 GB durante 13,5 horas (8,0 s por paso). La perdida descendio de 0,074 en el paso 0 a 0,0035 en el paso 6.000. Se emplearon los 249 episodios completos sin conjunto de validacion reservado. La normalizacion es por cuantiles q01/q99, con estadisticas en `assets/hungho77/aloha-left-hand-3task/norm_stats.json`. Las acciones se representan como deltas de las 6 articulaciones respecto al estado actual y el gripper en valor absoluto, y la politica devuelve objetivos absolutos con horizonte de 16 pasos.

## Capacidades

- Control de manipulacion robotica de un solo brazo (izquierdo) con 6 articulaciones mas gripper, en radianes y convencion Interbotix.
- Ejecucion de tres tareas distintas seleccionables por instruccion en lenguaje natural: cubrir y apilar vasos, clasificar bloques en vasos y guardar un bloque en un cajon.
- Percepcion visual multimodal: imagen cenital (`high`) como imagen base e imagen de muneca izquierda (`wrist_left`).
- Generacion de trayectorias de accion con horizonte de 16 pasos (1,07 s a 15 fps) y control por chunks.
- Condicionamiento por lenguaje natural para desambiguar la tarea dentro de un mismo checkpoint multitarea.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento textual general; no es un modelo de proposito general.
- Capacidades multilingues: no documentadas; las instrucciones de entrenamiento estan en ingles.

## Casos de uso

- Investigacion en imitacion de bajo coste: usar el checkpoint como punto de partida para reproducir el pipeline de ajuste fino de π0.5 sobre un ALOHA de un solo brazo, comparando hiperparametros y transforms del fork de openpi.
- Benchmark de referencia para VLA de un brazo: servir como linea base de error de imitacion en bucle abierto (MAE de 0,0169 rad global) frente a la que medir nuevas politicas sobre los mismos episodios.
- Prototipado de tareas de pick-and-place en laboratorio: desplegar la politica en un ALOHA real manteniendo el brazo derecho en reposo para validar la transferencia simulacion-real de las tres tareas entrenadas.
- Estudio de representacion de acciones: analizar el efecto de predecir deltas articulares con gripper absoluto y horizonte de 16 pasos frente a alternativas, reutilizando el checkpoint como sujeto de comparacion.
- Educacion y demostraciones: mostrar en un entorno docente como una instruccion en lenguaje natural selecciona la tarea dentro de un checkpoint multitarea, con requisitos de hardware acotados a una GPU.
- Base para ampliacion de tareas: continuar el ajuste fino anadiendo nuevos datasets de LeRobot v2.1 con el mismo esquema de estado y camaras, aprovechando que el modelo ya cubre tres tareas con 249 episodios.

## Benchmarks y rendimiento

Evaluacion en bucle abierto sobre 6 episodios de entrenamiento (2 por tarea), comparando las 16 acciones predichas con las grabadas. MAE en radianes (gripper en sus unidades registradas):

| Metrica | Este modelo | Baseline "hold" |
|---|---|---|
| MAE global (7 dims) | 0,0169 (0,97°) | 0,0740 |
| MAE brazo (6 dims) | 0,0153 | 0,0723 |
| MAE gripper | 0,0260 | 0,0840 |
| Tarea 0 (cubrir y apilar) | 0,0149 | 0,067-0,090 |
| Tarea 1 (clasificar bloques) | 0,0183 | 0,067-0,090 |
| Tarea 2 (guardar en cajon) | 0,0173 | 0,067-0,090 |

Estas cifras se miden sobre datos de entrenamiento: muestran ajuste a las demostraciones, no generalizacion, y no constituyen una tasa de exito. No existe resultado en robot real para este checkpoint. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, y no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16): aproximadamente 7,2 GB solo para pesos, mas activaciones y buffers visuales; en la practica se recomienda entre 12 y 16 GB.
- GPU recomendadas: H100 80 GB o A100 40/80 GB para entrenamiento y evaluacion a gran escala; para inferencia basta una RTX 4090 (24 GB) o una RTX 3090 (24 GB).
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en bf16; no se documentan cuantizaciones que permitan bajar de ese umbral.
- Opciones de despliegue: libreria `openpi` (PyTorch) con el fork `hungho77/openpi`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un VLA de robotica.
- Latencia y throughput: no disponibles. El autor solo documenta el coste de entrenamiento (8,0 s por paso en una H100) y advierte que el cliente debe interpolar con `smooth_step = control_hz / 15` porque los datos estan a 15 fps.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5-aloha-left-arm-3task (este) | 3,62 mil millones | no disponible | 3 tareas, un brazo ALOHA | Apache 2.0 | Hugging Face |
| physical-intelligence/pi05_base | no disponible en la informacion | no disponible | VLA generalista base | no disponible en la informacion | Hugging Face |
| openpi `pi05_droid` | no disponible en la informacion | no disponible | VLA para plataforma DROID | no disponible en la informacion | Repositorio openpi |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la unica comparacion cuantitativa publicada es contra el baseline "hold" dentro del propio checkpoint.

## Limitaciones y advertencias

- Entrenado exclusivamente con el brazo izquierdo: el cliente del robot debe mantener el brazo derecho en su pose de reposo; el modelo no lo controla.
- Sin conjunto de validacion ni evaluacion en robot real: las metricas son de error de imitacion en bucle abierto sobre datos de entrenamiento y no demuestran generalizacion ni tasa de exito.
- Solo tres tareas y 249 episodios, todos en ingles: cualquier instruccion fuera de ese repertorio no tiene garantia de funcionamiento.
- Convencion articular especifica (Interbotix, sin conversion ALOHA→pi): usarlo con otro robot o calibracion requiere reajuste y nuevas estadisticas de normalizacion.
- Dependencia de un fork concreto de openpi (`hungho77/openpi`, commit `7aa7b15`); cambios en el upstream pueden romper la reproducibilidad.
- Riesgo de sobreajuste a las condiciones de iluminacion, posiciones de objetos y camaras de los datasets originales.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; verificar la licencia del modelo base `pi05_base` antes de explotacion comercial.
- No es un modelo de lenguaje general: no debe usarse para generacion de texto, codigo ni atencion al cliente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twanghcmut/pi05-aloha-left-arm-3task
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
- Fork de openpi usado en el entrenamiento: https://github.com/hungho77/openpi
- Repositorio openpi de Physical Intelligence: https://github.com/Physical-Intelligence/openpi
