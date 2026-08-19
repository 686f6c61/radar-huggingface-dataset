# UbuNam/act_teddy_v3

## Resumen

`act_teddy_v3` es un modelo de robótica basado en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación desarrollado por Zhao et al. (2023) y publicado en el paper [arxiv:2304.13705](https://huggingface.co/papers/2304.13705). El modelo ha sido entrenado y subido al Hub de Hugging Face mediante la librería [LeRobot](https://github.com/huggingface/lerobot) por el usuario UbuNam, y está diseñado para controlar un robot seguidor (`so_follower`) en una tarea concreta: recoger un osito de peluche marrón y colocarlo en una caja.

A diferencia de los modelos de lenguaje, este es un modelo de política (policy) que consume observaciones multimodales —dos imágenes RGB de 480×640 píxeles y un vector de estado de 6 dimensiones— y produce acciones de 6 dimensiones. Con aproximadamente 51,7 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware modesto. Su relevancia radica en que demuestra el flujo completo de LeRobot para entrenar y desplegar políticas robóticas de imitación, y sirve como referencia para quienes deseen reproducir o adaptar este tipo de sistemas en sus propios robots.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer codificador-decodificador con VAE |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa imagenes de 480×640 y estado de 6 dimensiones) |
| Tipos de cuantizacion | no disponible (solo safetensors de precision completa) |
| Idiomas soportados | no aplica (modelo de robótica, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que, en lugar de predecir una sola accion por paso, predice un fragmento (chunk) de acciones futuras. La arquitectura combina un transformer codificador-decodificador con un VAE (autoencoder variacional) que condiciona la generacion de acciones sobre las observaciones visuales y de estado. Esto permite que la politica sea robusta a pequenas perturbaciones y genere trayectorias suaves.

El modelo fue entrenado con el dataset `UbuNam/so101_teddy_v3_20260817_165239`, que contiene 26 episodios teleoperados, 8670 frames a 30 FPS, de la tarea "Pick up the brown teddy bear and put it in the box". La configuracion de entrenamiento incluye 100.000 pasos, batch size de 4, optimizador AdamW, learning rate de 1e-5 y semilla 1000, usando LeRobot version 0.6.1. No se menciona el uso de RLHF ni DPO, ya que es un metodo de imitacion supervisada.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones a partir de observaciones visuales y de estado.
- Predicción de chunks de acciones: produce secuencias de acciones futuras en lugar de acciones individuales, lo que mejora la estabilidad del movimiento.
- Entrada multimodal: procesa dos cámaras (frontal y superior) con resolucion 480×640, junto con el estado del robot (6 valores).
- Tarea específica: entrenado para recoger un objeto (osito de peluche) y depositarlo en una caja.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot.
- Sin capacidades lingüísticas ni de razonamiento general: es un modelo puramente motor, no un LLM.

## Casos de uso

- Automatización de pick-and-place en entornos controlados: el modelo puede ejecutar la tarea de recoger y colocar objetos en una caja, util para lineas de montaje o laboratorios de robotica.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del action chunking en la robustez de politicas robóticas.
- Desarrollo de politicas con LeRobot: los desarrolladores pueden clonar este repositorio y adaptarlo a nuevas tareas cambiando el dataset y reentrenando.
- Prototipado rapido en robotica educativa: al ser un modelo pequeno (51,7 M de parametros), puede ejecutarse en GPU de consumo, facilitando experimentos en aulas o makerspaces.
- Benchmark de generalizacion: al estar entrenado con solo 26 episodios, es util para evaluar cuantos datos se necesitan para lograr un rendimiento aceptable en tareas similares.
- Base para transferencia de tareas: se puede utilizar como inicializacion para fine-tuning en tareas de manipulacion relacionadas, reduciendo el tiempo de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion en robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de tasas de exito ni comparaciones con otros metodos.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion, pero dado el tamano del modelo (51,7 M de parametros), la inferencia puede caber en menos de 1 GB de VRAM en precision completa. El entrenamiento con batch size 4 y imagenes 480×640 puede requerir entre 4 y 8 GB de VRAM, dependiendo de la implementacion.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050) para inferencia; para entrenamiento se recomienda una GPU con 8 GB o mas (RTX 3060, RTX 4070, etc.).
- Compatibilidad con GPU de consumo: si, cabe en GPUs de gama media y baja.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) que funcionan en CPU o GPU. Tambien es posible exportar el modelo a otros formatos, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparaciones directas en la informacion proporcionada. ACT es un metodo establecido frente a alternativas como Diffusion Policy o Behavior Transformer, pero no hay datos de rendimiento de este modelo concreto frente a ellos. Se recomienda consultar el paper original de ACT para comparaciones metodologicas.

## Limitaciones y advertencias

- Entrenado con solo 26 episodios, lo que limita su generalizacion a variaciones de posicion, iluminacion o presencia de distractores.
- No se han reportado evaluaciones en robot real; el rendimiento real puede diferir del esperado.
- La tarea es muy especifica (recoger un osito marron y ponerlo en una caja); no es un modelo general de manipulacion.
- Depende de la configuracion exacta de camaras (frontal y superior) y del robot `so_follower`; cambios en la calibracion o en la disposicion de las camaras pueden degradar el rendimiento.
- No tiene capacidades de lenguaje ni de razonamiento simbolico; es exclusivamente un controlador motor.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias de funcionamiento en entornos de produccion.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/UbuNam/act_teddy_v3)
- [Paper de ACT (arxiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentacion de LeRobot sobre ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Dataset de entrenamiento](https://huggingface.co/datasets/UbuNam/so101_teddy_v3_20260817_165239)
- [Visualizador del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=UbuNam/so101_teddy_v3_20260817_165239)
