# twanghcmut/gr00t-n1d7-aloha-left-arm-3task

## Resumen

`twanghcmut/gr00t-n1d7-aloha-left-arm-3task` es un ajuste fino del modelo fundacional de robotica NVIDIA Isaac GR00T N1.7 3B, un modelo de vision-lenguaje-accion (VLA) disenado para controlar brazos roboticos a partir de observaciones visuales e instrucciones en lenguaje natural. Lo publica el usuario twanghcmut (Universidad Tecnica de Ho Chi Minh) y esta especializado en un unico embodiment: el brazo izquierdo de una plataforma ALOHA, con tres tareas concretas de manipulacion.

El modelo resuelve el problema de la especializacion de un VLA generalista en un entorno de laboratorio concreto: en lugar de usar el checkpoint base de NVIDIA, se ha reentrenado con el trainer oficial Isaac-GR00T sobre 249 episodios (63.190 fotogramas a 15 fps) que fusionan tres conjuntos de datos ALOHA en un unico conjunto multitarea. El resultado es un checkpoint de 3.144 millones de parametros que genera trayectorias de 16 pasos de accion (1,07 s) para seis articulaciones del brazo izquierdo mas la pinza.

Su relevancia es doble: por un lado, demuestra el flujo de trabajo de ajuste fino de GR00T N1.7 con configuraciones de modalidad personalizadas (`NEW_EMBODIMENT`); por otro, sirve como referencia comparativa directa frente a π0.5 sobre exactamente los mismos datos y protocolo de evaluacion, lo que permite contrastar dos familias de VLA bajo condiciones controladas. La evaluacion publicada es en lazo abierto y sobre datos de entrenamiento, no incluye tasas de exito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) derivada de NVIDIA Isaac GR00T N1.7; detalles internos de la arquitectura base no disponibles en la informacion proporcionada |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento estan en ingles) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | safetensors (tamano del repo: 12,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA Isaac GR00T N1.7 3B, un VLA que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones. En este ajuste fino se ha definido un embodiment nuevo (`NEW_EMBODIMENT`) mediante el fichero de configuracion de modalidad `aloha_left_arm_config.py` y un `modality.json` propio. El espacio de estado y accion se compone de `single_arm` (6 dimensiones: left_waist, left_shoulder, left_elbow, left_forearm_roll, left_wrist_angle, left_wrist_rotate, en radianes) mas `gripper` (1 dimension, angulo registrado entre 0,61 y 1,66). Las acciones del brazo se representan como desplazamientos relativos al estado actual, mientras que la pinza se representa en valor absoluto; `get_action` devuelve objetivos absolutos. Se emplean dos camaras de 480x640: `high` (cenital) y `wrist_left` (muneca izquierda). El horizonte de accion es de 16 pasos.

El entrenamiento se realizo con el trainer oficial Isaac-GR00T (commit `23ace64`, `gr00t/experiment/launch_finetune.py`) sobre 6.000 pasos con batch efectivo de 128 (32 x 4 acumulaciones), lo que suma 768.000 muestras, aproximadamente 12 epocas sobre los 63.190 fotogramas. Se uso optimizador con lr 1e-4, 5 % de warmup y weight decay 1e-5, junto con color jitter (brillo 0,3, contraste 0,4, saturacion 0,5, tono 0,08). La perdida descendio de 0,067 en el paso 500 a una media final de 0,0195 en los pasos 5.760-6.000. Todo el entrenamiento cupo en una sola H100 de 80 GB en 3,1 horas. No hubo split de validacion: los 249 episodios se usaron para entrenar.

## Capacidades

- Generacion de trayectorias de accion para el brazo izquierdo de ALOHA: 6 articulaciones mas pinza, en chunks de 16 pasos (1,07 s a 15 fps).
- Seguimiento de instrucciones en lenguaje natural para seleccionar entre tres tareas de manipulacion.
- Percepcion visual multimodal a partir de dos camaras (cenital y muneca izquierda) a 480x640.
- Multitarea: un unico checkpoint cubre tres tareas distintas (cubrir un cubo con un vaso y apilar otro; clasificar bloques de colores en vasos; colocar un bloque en un cajon).
- Control en lazo cerrado por chunks: el cliente puede interpolar entre pasos del modelo con `smooth_step = control_hz / 15`.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM; es un modelo de politica robotica.
- No dispone de capacidades de vision general, audio ni generacion de texto libre.

## Casos de uso

- Manipulacion de laboratorio con ALOHA: el modelo actua como politica para el brazo izquierdo en las tres tareas entrenadas, recibiendo observaciones de las camaras y devolviendo acciones articulares. Es adecuado porque el espacio de accion y las camaras coinciden exactamente con el embodiment registrado.
- Investigacion comparativa de VLA: sirve como referencia de GR00T N1.7 frente a π0.5 sobre los mismos datos, presupuesto de muestras y horizonte, lo que permite aislar diferencias entre familias de modelos en condiciones controladas.
- Base para ajustes finos adicionales: al estar construido sobre GR00T N1.7 3B con el trainer oficial, puede reentrenarse con nuevos episodios ALOHA o con otras tareas del mismo brazo.
- Prototipado de pipelines de robotica: util para validar la integracion cliente-servidor (`get_action`), el formateo de observaciones y la frecuencia de control antes de desplegar en hardware real.
- Evaluacion en lazo abierto: permite medir el error de prediccion de acciones (MAE) sobre episodios grabados sin necesidad de robot, util para iterar sobre datos y configuraciones de modalidad.
- Docencia y reproduccion de experimentos: el registro completo de hiperparametros, perdidas y hardware (una H100, 3,1 h) facilita replicar el ajuste fino en entornos academicos.
- Pruebas de robustez ante instrucciones: al ser multitarea, permite estudiar como el modelo discrimina entre tres instrucciones con vocabulario solapado (cubo, vaso, bloque, cajon).

## Benchmarks y rendimiento

Evaluacion en lazo abierto sobre 6 episodios de entrenamiento (2 por tarea), episodios completos, horizonte 16. MAE en radianes (pinza en sus unidades registradas). La linea base "hold" repite la accion del inicio del chunk durante 16 pasos.

| Modelo | MAE global (7 dims) | MAE brazo (6 dims) | MAE pinza |
|---|---|---|---|
| Este modelo | 0,0245 (1,40°) | 0,0237 | 0,0298 |
| π0.5, mismos datos y protocolo | 0,0169 | 0,0153 | 0,0260 |
| Linea base hold | 0,0740 | 0,0723 | 0,0840 |

Desglose por tarea (MAE global): tarea 0 (cubrir cubo y apilar vaso) 0,0235; tarea 1 (bloques de colores en vasos) 0,0285; tarea 2 (bloque en el cajon) 0,0217. Todos los episodios quedan entre 0,020 y 0,032 frente a 0,067-0,090 de la linea base hold. Cada modelo fue puntuado con el script de lazo abierto de su propio framework siguiendo el mismo procedimiento. Son comprobaciones de ajuste sobre datos de entrenamiento, no tasas de exito; no existe resultado en robot real para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (safetensors, ~12,6 GB de pesos): alrededor de 13-16 GB, segun el overhead del runtime y las activaciones.
- GPU recomendadas: H100 80 GB o A100 para entrenamiento y despliegue sin restricciones; el propio autor entreno con una H100 de 80 GB en 3,1 h.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas (RTX 4090, RTX 3090), siempre que el runtime de GR00T lo permita en precision completa o con cuantizacion; no se han publicado requisitos oficiales ni opciones de cuantizacion.
- Opciones de despliegue: el modelo se usa mediante el cliente de Isaac-GR00T (`get_action`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un VLA de robotica.
- Latencia y throughput: no disponibles. La frecuencia de control debe fijarse segun los 15 fps de los datos, interpolando entre pasos del modelo con `smooth_step = control_hz / 15`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (MAE lazo abierto, mismos datos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GR00T N1.7 3B ajustado) | 3,14 B | no disponible | 0,0245 global / 0,0237 brazo | NVIDIA Open Model License | Hugging Face |
| π0.5 (twanghcmut/pi05-aloha-left-arm-3task) | no disponible | no disponible | 0,0169 global / 0,0153 brazo | no disponible | Hugging Face |
| NVIDIA Isaac GR00T N1.7 3B (base) | 3,14 B (aproximado, mismo tamano de base) | no disponible | no evaluado en este protocolo | NVIDIA Open Model License | Hugging Face |

La comparacion directa con π0.5 es la mas informativa: sobre los mismos datos, presupuesto de muestras y horizonte, π0.5 obtiene un MAE aproximadamente un 31 % menor en el global y un 35 % menor en el brazo, aunque ambos superan ampliamente la linea base hold.

## Limitaciones y advertencias

- Solo controla el brazo izquierdo: el cliente debe mantener el brazo derecho en su pose de reposo; el modelo no genera acciones para el.
- Entrenado exclusivamente para tres tareas concretas con instrucciones en ingles; no generaliza a otras tareas ni objetos fuera de la distribucion de entrenamiento.
- Sin split de validacion: todos los episodios se usaron para entrenar, por lo que las metricas son comprobaciones de ajuste y no miden generalizacion.
- No hay resultados en robot real ni tasas de exito; la evaluacion es en lazo abierto sobre datos de entrenamiento.
- Riesgo de sobreajuste al entorno fisico, iluminacion y disposicion de camaras de los datos originales.
- Sin informacion sobre sesgos; al ser un modelo de robotica, los sesgos relevantes serian de comportamiento fisico (por ejemplo, preferencia por trayectorias vistas en entrenamiento) y no estan documentados.
- Licencia NVIDIA Open Model License: es necesario revisar sus terminos para uso comercial y redistribucion; el modelo es un derivado de GR00T N1.7 3B y hereda sus condiciones.
- Frecuencia de datos fija a 15 fps: usar otra frecuencia de control requiere interpolar explicitamente.
- No disponible informacion sobre cuantizacion, longitud de contexto ni soporte multilingue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twanghcmut/gr00t-n1d7-aloha-left-arm-3task
- Modelo base NVIDIA Isaac GR00T N1.7 3B: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Modelo comparable π0.5 sobre los mismos datos: https://huggingface.co/twanghcmut/pi05-aloha-left-arm-3task
- Repositorio oficial Isaac-GR00T (trainer `gr00t/experiment/launch_finetune.py`, commit `23ace64`): no disponible en la informacion proporcionada
- Paper de GR00T N1.7: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible
