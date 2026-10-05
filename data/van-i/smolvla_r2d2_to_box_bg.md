# van-i/smolvla_r2d2_to_box_bg

## Resumen

SmolVLA R2-D2 to box es un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base`, un modelo de visión-lenguaje-acción (VLA) orientado al control robótico. Lo publica el usuario van-i como parte de un banco de pruebas escolar de robótica construido con LeRobot y LeLab. El modelo resuelve una tarea concreta de manipulación: coger una figura pequeña de R2-D2 desde una de cinco posiciones marcadas y dejarla en una bandeja de cartón, usando un brazo robótico SO-100.

La arquitectura sigue el esquema de SmolVLA: una parte de visión-lenguaje (congelada durante el ajuste) y un experto de acción que se entrena para producir comandos motores. El modelo tiene aproximadamente 450 millones de parámetros en total, un tamaño que lo sitúa en la gama de los modelos pequeños capaces de ejecutarse en GPU de consumo. Se ajustó sobre 50 episodios teleoperados con tres cámaras.

Es relevante ahora porque forma parte de una comparativa abierta de cuatro políticas de imitación (ACT, Diffusion Policy, SmolVLA y GR00T N1.7) entrenadas sobre el mismo conjunto de datos, lo que permite evaluar de forma reproducible el rendimiento de cada enfoque en hardware asequible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en SmolVLA: modulo de vision-lenguaje congelado mas experto de accion entrenado |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/smolvla_base`, un VLA construido sobre un modelo de vision-lenguaje pequeno al que se anade un experto de accion. Durante el ajuste, la parte de vision-lenguaje se mantuvo congelada y solo se entreno el experto de accion. El modelo consume observaciones visuales de tres camaras (`left` y `right` cenitales, `grip` en la muneca) a 640x480 y 30 fps, y genera bloques (chunks) de 50 acciones.

El entrenamiento se realizo durante 25.000 pasos con un batch de 8, aproximadamente 14 epocas, mediante linea de comandos, en 2 horas y 57 minutos sobre una RTX 3090 limitada a 250 W. La perdida final de entrenamiento fue de 0,062. El conjunto de datos de partida (`van-i/r2d2_to_box_bg_20261003_210444`) contiene 50 episodios teleoperados sobre un brazo SO-100, en los que la tarea consistia en coger la figura R2-D2 desde una de cinco posiciones marcadas con cinta y depositarla en una bandeja de carton.

## Capacidades

- Control de un brazo robotico SO-100 / SO-101 para la tarea concreta de recoger un objeto y depositarlo en una bandeja.
- Percepcion visual multi-camara sincronizada: tres camaras de 640x480 a 30 fps.
- Generacion de secuencias de acciones (chunks de 50 acciones) para control de imitacion.
- Ejecucion en tiempo real sobre la tarea entrenada, con un tiempo medio de exito de aproximadamente 8,4 segundos.
- Generalizacion limitada a posiciones no vistas: funciona en posiciones intermedias (H1) pero no fuera del area marcada (H2).
- Soporte de tool calling o function calling: no aplica (no es un modelo de lenguaje general).
- Soporte de agentes o razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica; el seguimiento de instrucciones de texto es practicamente inexistente porque se ajusto sobre una unica instruccion.

## Casos de uso

- Reproduccion de un banco de pruebas educativo de robotica: permite reconstruir una practica escolar de aprendizaje por imitacion con LeRobot y LeLab usando un brazo SO-100 y tres camaras.
- Comparativa de politicas de imitacion: sirve como una de las cuatro politicas (junto a ACT, Diffusion Policy y GR00T N1.7) evaluadas sobre el mismo conjunto de datos, lo que facilita comparaciones controladas de rendimiento.
- Punto de partida para fine-tuning en tareas pick-and-place similares: al estar basado en SmolVLA y licenciarse como apache-2.0, se puede reentrenar el experto de accion con un dataset propio de recogida y deposito de objetos.
- Investigacion en VLA de bajo coste: con 450 millones de parametros y un requisito de VRAM reducido, permite experimentar con modelos de vision-lenguaje-accion en una unica GPU de consumo.
- Demostracion de generalizacion posicional: el modelo permite estudiar como se comporta una politica entrenada en cinco posiciones cuando se la evalua en ubicaciones intermedias o fuera del area marcada.
- Validacion de pipelines de despliegue con LeRobot: se puede usar para probar el comando `lerobot-rollout`, el mapeo de camaras con `--rename_map` y la inferencia sincrona por chunks en un robot real.
- Evaluacion de latencia y fluidez de control: resulta util para medir la pausa de aproximadamente 2 segundos que introduce la inferencia sincrona al calcular cada bloque de 50 acciones.

## Benchmarks y rendimiento

Resultados sobre el brazo real, 14 intentos por politica (5 posiciones entrenadas x2, H1 entre marcas x2, H2 fuera de las marcas x2), segun la model card:

| Politica | Posiciones entrenadas (P1-P5) | H1 (entre marcas) | H2 (fuera de las marcas) | Tiempo medio hasta terminar |
|---|---|---|---|---|
| ACT (15k) | 8/10 | 2/2 | 0/2 | ~10 s |
| Diffusion Policy (36k) | 9/10 | 2/2 | 0/2 | ~16,5 s |
| SmolVLA (25k) | 10/10 | 2/2 | 0/2 | ~8,4 s |
| GR00T N1.7 (18k) | 10/10 | 2/2 | 2/2 | ~9,8 s |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no es un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,9 GB, por lo que los pesos en precision de 16 bits requieren del orden de 1 GB y en 32 bits en torno a 1,8 GB, sin contar activaciones ni buffers de vision.
- GPU utilizada en el entrenamiento: RTX 3090 a 250 W (2 h 57 min para 25.000 pasos con batch 8).
- Cabe en GPU de consumo: si, por el tamano de 450 millones de parametros cabe holgadamente en tarjetas como RTX 3060, RTX 4070 o RTX 4090.
- Opciones de despliegue: la model card documenta despliegue mediante LeRobot 0.6.0 y el comando `lerobot-rollout` con `--policy.path`, sobre un seguidor SO-100 / SO-101. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una politica de control robotico.
- Latencia y throughput: con inferencia sincrona por defecto, el brazo se detiene brevemente cada aproximadamente 2 segundos mientras se calcula el siguiente bloque de 50 acciones. El tiempo medio por exito en la tarea entrenada es de aproximadamente 8,4 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Posiciones entrenadas | H1 | H2 | Licencia / disponibilidad |
|---|---|---|---|---|---|---|
| SmolVLA (este modelo, 25k) | 450 M | VLA con vision-lenguaje congelado y experto de accion | 10/10 | 2/2 | 0/2 | apache-2.0, disponible en HuggingFace |
| ACT (15k) | no disponible | Transformer de acciones (imitation learning clasico) | 8/10 | 2/2 | 0/2 | segun la comparativa del autor |
| Diffusion Policy (36k) | no disponible | Politica de difusion para acciones | 9/10 | 2/2 | 0/2 | segun la comparativa del autor |
| GR00T N1.7 (18k) | no disponible | Modelo fundacional robotico | 10/10 | 2/2 | 2/2 | comparado en la misma prueba |

Los parametros de ACT, Diffusion Policy y GR00T N1.7 no se detallan en la informacion proporcionada.

## Limitaciones y advertencias

- Funciona unicamente en una escena similar a la de entrenamiento: mesa oscura mate, bandeja en su sitio, iluminacion y colocacion de camaras similares.
- El seguimiento de instrucciones de texto es practicamente nulo: se ajusto con una sola instruccion, por lo que ignora el texto de la tarea. Con un objeto y una instruccion nuevos, agarro el objeto pero lo llevo igualmente a la bandeja.
- Generalizacion posicional limitada: obtiene 0/2 en posiciones fuera del area marcada (H2), aunque logra 2/2 en posiciones intermedias (H1).
- La inferencia sincrona por defecto introduce pausas de aproximadamente 2 segundos cada vez que se calcula un nuevo bloque de acciones.
- Requiere mapear los nombres de las camaras del robot a `camera1`, `camera2` y `camera3` mediante `--rename_map`, lo que anade un paso de configuracion.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto; el riesgo equivalente es ejecutar acciones incorrectas fuera de la distribucion de entrenamiento.
- Sesgos conocidos: no se documentan sesgos especificos, mas alla del sesgo de dominio derivado de un unico entorno y una unica tarea.
- Restricciones de licencia: apache-2.0, lo que permite uso comercial, pero el modelo depende de `lerobot/smolvla_base` y de las condiciones de su ecosistema (LeRobot).
- Para produccion, el modelo no es una solucion generalista: es una politica especializada de una tarea concreta y debe reentrenarse para cualquier escenario distinto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/van-i/smolvla_r2d2_to_box_bg
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/van-i/r2d2_to_box_bg_20261003_210444
- Documentacion de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Banco de pruebas y comparativa completa: https://huggingface.co/van-i/so100-imitation-learning-stand
