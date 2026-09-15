# taewonkoo/smolvla-office-mixed30-scizor30-30k-bs8-fp32-fullft

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) diseñado para control robótico, desarrollado originalmente por el equipo de LeRobot. Esta instancia concreta, publicada por taewonkoo, es un ajuste fino (full fine-tuning) del modelo base `lerobot/smolvla_base` para una tarea de manipulación en un entorno de oficina. El modelo se entrenó con 40 episodios y 22.522 fotogramas a 30 FPS, obtenidos de un dataset con demostraciones subóptimas.

Con 450.046.176 parámetros y un tamaño de repo de 0,9 GB en formato safetensors, SmolVLA está pensado para ejecutarse en hardware de consumo, manteniendo un rendimiento competitivo con un coste computacional reducido. Al ser un modelo de acción, no procesa texto ni lenguaje natural, sino que consume observaciones de estado y de cámaras para generar acciones de 6 dimensiones. Se trata de una política robótica de aprendizaje por imitación, no de un modelo de lenguaje multimodal al uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacto, basado en `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 |
| Longitud de contexto | No aplica (modelo de control robotico; no procesa texto) |
| Tipos de cuantizacion | fp32 (entrenamiento y pesos completos; no se documentan cuantizaciones adicionales) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion compacto y eficiente, tal como se describe en el paper arxiv:2506.01844. Su principal innovacion es reducir el coste computacional frente a otros VLA mas grandes, permitiendo el despliegue en hardware de consumo. En esta version, el modelo ha sido ajustado completamente (full fine-tuning) sobre el checkpoint preentrenado `lerobot/smolvla_base` utilizando la libreria LeRobot.

El entrenamiento se realizo con el dataset `taewonkoo/office_task_mixed_suboptimal_seed1000_30pct_40ep`, que contiene 40 episodios y 22.522 fotogramas a 30 FPS, con una tarea concreta: recoger dos rotuladores de pizarra de la mesa y colocarlos en un soporte rojo. La configuracion de entrenamiento fue de 30.000 pasos, batch size 8, optimizador AdamW, learning rate 0,0001 y seed 1000, usando LeRobot version 0.6.2. El modelo consume observaciones de estado de 6 dimensiones y hasta cuatro entradas visuales (tres camaras a 256x256 y una camara adicional a 480x640), y produce acciones de 6 dimensiones.

## Capacidades

- Genera acciones de control de 6 dimensiones para un robot de tipo `so_follower`, a partir de observaciones de estado y de imagenes de camara.
- Consume hasta cuatro entradas visuales: tres camaras a resolucion 256x256 y una camara a 480x640, junto con un vector de estado de 6 valores.
- Esta entrenado especificamente para la tarea de recoger dos rotuladores de pizarra y colocarlos en un soporte rojo en un entorno de oficina.
- Al estar basado en SmolVLA, esta optimizado para inferencia eficiente y despliegue en hardware de consumo.
- No soporta tool calling ni function calling: es un modelo de control motor, no un modelo conversacional.
- No dispone de capacidades multilingues ni de modo de razonamiento simbolico; su unica salida es un vector de acciones.

## Casos de uso

- Manipulacion pick-and-place en entornos de oficina: el modelo puede controlar un robot para tareas como recoger objetos de una mesa y colocarlos en recipientes, gracias a su entrenamiento en una tarea similar de recogida y colocacion.
- Aprendizaje por imitacion con demostraciones suboptimas: este modelo es util para investigar como se comporta una politica cuando se entrena con datos imperfectos, un escenario frecuente en la recopilacion de datos reales.
- Despliegue de politicas VLA en robots de bajo coste: la arquitectura compacta de SmolVLA permite ejecutar la inferencia en GPUs de consumo, lo que facilita pruebas rapidas en robots tipo SO-ARM.
- Recoleccion de datos y evaluacion de politicas: usando LeRobot, el modelo puede ejecutarse con `lerobot-rollout` para generar episodios, registrar resultados y comparar estrategias de control.
- Fine-tuning para nuevas tareas: a partir de este checkpoint se puede continuar el entrenamiento con nuevos datasets de la misma familia, ajustando la politica a otras tareas de manipulacion.
- Benchmark de transferencia de habilidades: sirve como referencia para estudiar el efecto de la cantidad de datos, la calidad de las demostraciones o cambios en la iluminacion y posicion de los objetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 450 millones de parametros en fp32, los pesos ocupan aproximadamente 1,8 GB. Añadiendo activaciones y el procesamiento de multiples imagenes, se estima que la inferencia requiere entre 4 y 6 GB de VRAM. Esta cifra es una estimacion no confirmada oficialmente.
- GPU recomendadas: tarjetas de consumo con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) para inferencia con margen; tambien puede ejecutarse en GPUs de gama superior.
- Capacidad en GPU de consumo: segun la descripcion del modelo, SmolVLA esta disenado para hardware de consumo, por lo que es plausible su ejecucion en tarjetas de gama media.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot, usando el comando `lerobot-rollout`. No se han documentado integraciones con vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables ni resultados de evaluacion en la informacion disponible.

## Limitaciones y advertencias

- El dataset de entrenamiento es pequeno (40 episodios) y contiene demostraciones suboptimas, lo que puede limitar la robustez de la politica ante variaciones del entorno.
- No se han publicado resultados de evaluacion en robot real; se desconoce la tasa de exito de la tarea.
- El modelo depende de entradas visuales especificas: cambios en el numero, resolucion o posicion de las camaras pueden degradar el rendimiento.
- Es un modelo de control y no un modelo de lenguaje: no interpreta instrucciones en lenguaje natural ni genera texto.
- Puede fallar en estados fuera de la distribucion de entrenamiento, ya que se ha ajustado para una tarea muy concreta.
- La licencia Apache 2.0 permite uso comercial, pero exige atribucion y no ofrece garantias de ningun tipo.

## Enlaces

- Modelo: https://huggingface.co/taewonkoo/smolvla-office-mixed30-scizor30-30k-bs8-fp32-fullft
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/taewonkoo/office_task_mixed_suboptimal_seed1000_30pct_40ep
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio LeRobot: https://github.com/huggingface/lerobot
