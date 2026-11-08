# Verithm/pick_and_place_act

## Resumen

`Verithm/pick_and_place_act` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv 2304.13705. El modelo ha sido entrenado y subido al Hub mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real, y su único propósito es ejecutar la tarea "Pick a ball and place" (coger una pelota y colocarla) sobre un robot de tipo `so_follower` con dos cámaras (superior y de muñeca).

A diferencia de los modelos de lenguaje, esta política no genera texto: consume un vector de estado de 6 dimensiones y dos imágenes RGB de 480x640 píxeles, y produce un vector de acción de 6 dimensiones. El checkpoint contiene 51.668.614 parámetros en formato safetensors y ocupa 0,2 GB, lo que lo hace desplegable en hardware modesto. La relevancia actual es la de un ejemplo canónico de flujo de trabajo de imitación end-to-end con LeRobot: un dataset pequeño de teleoperación (33 episodios, 24.685 fotogramas a 30 FPS) y un entrenamiento de 50.000 pasos.

No se trata de un modelo fundacional ni de propósito general: es un artefacto específico de tarea, ligado a una configuración concreta de robot y cámaras, publicado bajo licencia Apache 2.0. Su valor está en servir como referencia reproducible para quien quiera entrenar o evaluar políticas ACT con LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada de 1 vector de estado de 6 dimensiones y 2 imagenes de 3x480x640) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizacion publicada) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se especifica como cadena "Pick a ball and place") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Camaras | `top`, `wrist` (3x480x640 cada una) |
| Entrada de estado | `observation.state`, forma (6,) |
| Salida de accion | `action`, forma (6,) |
| Tamano del repositorio | 0,2 GB |
| Libreria | LeRobot 0.6.2 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulacion y mejora la estabilidad en tareas de manipulacion. La arquitectura combina un codificador de imágenes (para las vistas `top` y `wrist`) con un transformer que fusiona la observacion visual y el estado proprioceptivo de 6 dimensiones para emitir una secuencia de acciones de 6 dimensiones. El modelo se entrena de forma supervisada sobre demostraciones teleoperadas, sin RLHF ni DPO.

El entrenamiento se realizo sobre el dataset `Verithm/pick_and_place_1104_20261104_142149`, compuesto por 33 episodios y 24.685 fotogramas a 30 FPS de la tarea "Pick a ball and place". La configuracion reportada es de 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000, ejecutada con LeRobot 0.6.2. No se documentan aumentos de datos, composicion adicional del dataset ni innovaciones tecnicas mas alla del propio metodo ACT.

## Capacidades

- Manipulacion robotica de una unica tarea: coger una pelota y colocarla, sobre un robot `so_follower`.
- Fusion multimodal de dos vistas de camara (`top` y `wrist`) con el estado del robot de 6 dimensiones.
- Prediccion de fragmentos de accion (action chunking) de 6 dimensiones para control continuo.
- Ejecucion en bucle cerrado a 30 FPS mediante `lerobot-rollout`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingues ni procesamiento de lenguaje natural.
- No dispone de modo thinking, vision general, audio ni otras capacidades especiales.

## Casos de uso

- Replicacion de un pipeline de imitacion end-to-end: sirve como referencia para validar la instalacion de LeRobot, la calibracion del robot `so_follower` y la grabacion de datos con dos camaras antes de entrenar políticas propias.
- Demostracion docente de ACT: permite ilustrar en clase o taller como un transformer predice chunks de acciones a partir de imagenes y estado, con un checkpoint pequeno (0,2 GB) y un entrenamiento de 50.000 pasos reproducible.
- Benchmark interno de infraestructura robotica: al ser un modelo ligero y de tarea fija, es util para medir latencia de inferencia, throughput de camaras a 30 FPS y estabilidad del bucle de control en un robot concreto.
- Prueba de integracion de `lerobot-rollout`: valida el comando de despliegue, el mapeo de nombres de camara a claves de observacion y la configuracion de `--duration` en un entorno real.
- Punto de partida para fine-tuning: el checkpoint puede reutilizarse como inicializacion para tareas de pick-and-place similares con el mismo robot y montaje de camaras, reduciendo el coste frente a entrenar desde cero.
- Prototipo de automatizacion de recogida y colocacion en entornos controlados: adecuado para laboratorios que necesiten una política de referencia antes de invertir en datasets mayores o en metodos mas avanzados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos (51,7 M de parametros en safetensors, 0,2 GB en disco); el consumo real dependera del codificador visual y del preprocesado de dos imagenes de 480x640.
- GPU recomendadas: cualquier GPU con CUDA y al menos 4-6 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior cubre el caso con holgura.
- Cabe en GPU de consumo: si, incluidas GTX 1660, RTX 3050 y modelos equivalentes.
- Opciones de despliegue: LeRobot con `lerobot-rollout` (comando documentado en la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles; el bucle de control opera a 30 FPS segun la tasa de los datos de entrenamiento, pero no se publican mediciones de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Verithm/pick_and_place_act | 51,7 M | Pick-and-place con ACT | Estado (6,) + 2 imagenes 480x640 | Apache 2.0 | Hugging Face |
| Otras políticas ACT en LeRobot Hub | no disponible | Manipulacion por imitacion | Variable segun robot | variable | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | no disponible | Manipulacion por imitacion | Variable segun robot | variable | Hugging Face |
| Políticas VLA (p. ej. OpenVLA) | no disponible en esta busqueda | Manipulacion guiada por lenguaje | Imagen + instruccion textual | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada; la comparacion se limita a categoria, formato y licencia.

## Limitaciones y advertencias

- Modelo de tarea unica: solo se ha entrenado para "Pick a ball and place"; no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- Dependencia del montaje fisico: asume un robot `so_follower` con camaras `top` y `wrist` en posiciones concretas; cambios de montaje, iluminacion u objeto pueden degradar el comportamiento.
- Dataset muy reducido: 33 episodios y 24.685 fotogramas, lo que limita la robustez ante variaciones de posicion, distractores o condiciones de luz.
- Sin evaluacion publicada: no hay tasa de exito medida en robot real, por lo que no puede afirmarse su fiabilidad en produccion.
- Riesgo de sobreajuste a las trayectorias teleoperadas y de fallos silenciosos fuera de la distribucion de entrenamiento.
- Sin capacidades de lenguaje: no interpreta instrucciones en lenguaje natural; la tarea se pasa como cadena fija al script de despliegue.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; conviene conservar la atribucion y citar ACT y LeRobot.
- No se documentan sesgos sociales ni de idioma porque el modelo no procesa texto ni datos personales, pero si puede heredar sesgos fisicos de las demostraciones (por ejemplo, posiciones preferidas del objeto).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Verithm/pick_and_place_act
- Dataset de entrenamiento: https://huggingface.co/datasets/Verithm/pick_and_place_1104_20261104_142149
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Verithm/pick_and_place_1104_20261104_142149
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Perfil del autor en GitHub: https://github.com/verithm/verithm
