# zzhtx/act_sand_to_box

## Resumen

El modelo `zzhtx/act_sand_to_box` es una política de robótica basada en el algoritmo ACT (Action Chunking with Transformers), entrenada mediante aprendizaje por imitación con el framework LeRobot. El modelo está diseñado para controlar un robot manipulador de tipo `so_follower` y ejecuta la tarea de recoger un saco de arena y colocarlo dentro de una caja. Fue desarrollado por el usuario zzhtx y publicado en HuggingFace bajo licencia Apache 2.0.

La relevancia de este modelo reside en que demuestra un flujo completo de entrenamiento y despliegue de políticas robóticas con LeRobot, una librería de código abierto que estandariza el proceso de recolección de datos, entrenamiento e inferencia para robots manipuladores. El modelo consume observaciones de dos cámaras (una cenital y otra en la muñeca del robot) junto con el estado de las articulaciones, y produce comandos de acción de 6 grados de libertad.

Con aproximadamente 51,7 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo. El repositorio incluye los pesos en formato safetensors, el dataset de entrenamiento asociado y la configuración completa necesaria para reproducir el entrenamiento o ejecutar inferencia en un robot real compatible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion presentado en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). La arquitectura se basa en un transformer que predice bloques de acciones (action chunks) en lugar de acciones individuales, lo que reduce el error de compounding tipico de las politicas autoregresivas. El modelo combina un codificador visual basado en redes convolucionales (ResNet) para procesar las imagenes de las camaras, un codificador de estado para las observaciones proprioceptivas del robot, y un decodificador transformer que genera secuencias de acciones futuras.

El entrenamiento se realizo con un dataset de 50 episodios teleoperados que suman 17.378 frames a 30 FPS, capturados con dos camaras (cenital y de muñeca) a resolucion de 480x640 pixeles. La tarea registrada es "Pick up the sandbag and place it inside the box". La configuracion de entrenamiento incluye 5.000 pasos con batch size de 32, optimizador AdamW y learning rate de 1e-5. No se menciona el uso de RLHF, DPO ni otras tecnicas de refinamiento posterior; es un entrenamiento puramente supervisado sobre datos demostrados.

## Capacidades

- Control de robot manipulador de 6 grados de libertad para tareas de pick-and-place.
- Procesamiento multimodal de vision y estado: combina dos flujos de imagen (cenital y muñeca) con el estado articular del robot.
- Generacion de bloques de acciones (action chunking) que permite ejecutar movimientos suaves y coordinados.
- Inferencia en tiempo real: el modelo opera a 30 FPS, la misma frecuencia de muestreo de los datos de entrenamiento.
- Integracion nativa con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue.
- Capacidad de generalizacion limitada a la tarea y al robot especifico con los que fue entrenado.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos de investigacion: el modelo puede integrarse en un robot `so_follower` para mover objetos entre contenedores, sirviendo como punto de partida para experimentos de manipulacion.
- Prototipado rapido de politicas robotica: gracias a LeRobot, el flujo de entrenamiento es reproducible; un investigador puede clonar el repositorio, adaptar la tarea y reentrenar con sus propios datos.
- Educacion en robotica y aprendizaje por imitacion: el modelo y su dataset asociado son un ejemplo completo y funcional para ensenar el pipeline de LeRobot en cursos de robotica.
- Evaluacion comparativa de algoritmos de imitacion: al ser un checkpoint publico, puede usarse como baseline para comparar ACT con otras arquitecturas (Diffusion Policy, RVT, etc.) en la misma tarea.
- Desarrollo de sistemas de manipulacion con camaras externas y de muñeca: la configuracion de observacion multimodal es representativa de setups reales de bajo coste.
- Investigacion en generalizacion de politicas: el modelo puede servir para estudiar la transferencia entre robots o entornos, dado que es un checkpoint abierto y ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet"). No se dispone de datos de tasa de exito en robot real ni de comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~51,7 millones de parametros. En FP32 ocupa aproximadamente 207 MB; en FP16 unos 103 MB. Cabe en cualquier GPU moderna con mas de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM (GTX 1650, RTX 3060, etc.). Para entrenamiento, se recomienda al menos 8 GB de VRAM (RTX 3070 o superior) dado el batch size de 32 y la resolucion de imagen.
- Consumo en CPU: es posible ejecutar inferencia en CPU, aunque la latencia sera mayor y puede no alcanzar los 30 FPS requeridos.
- Opciones de despliegue: LeRobot proporciona el comando `lerobot-rollout` para ejecutar la politica en un robot real. No se menciona soporte para vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. Depende del hardware y de la velocidad de captura de las camaras.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zzhtx/act_sand_to_box | ACT (Transformer) | 51,7 M | no disponible | Apache 2.0 | HuggingFace |
| Diffusion Policy (Chi et al., 2023) | Diffusion model sobre acciones | 10-100 M segun config | no aplica | MIT | Codigo abierto |
| RVT (Robotic View Transformer) | Transformer con atencion 3D | ~80 M | no aplica | MIT | Codigo abierto |

No se dispone de datos de rendimiento comparativo entre estos modelos para la misma tarea. La comparativa se limita a aspectos arquitectonicos y de disponibilidad. ACT se distingue por su simplicidad y bajo coste de entrenamiento, mientras que Diffusion Policy suele ofrecer mayor expresividad en la distribucion de acciones y RVT incorpora razonamiento 3D explicito.

## Limitaciones y advertencias

- El modelo esta entrenado para una tarea muy especifica (recoger saco de arena y colocarlo en caja) y no generalizara a otras tareas u objetos sin reentrenamiento.
- No se han publicado resultados de evaluacion en robot real; se desconoce la tasa de exito real y la robustez ante variaciones de iluminacion, posicion de objetos o distracciones.
- El dataset de entrenamiento es pequeno (50 episodios), lo que puede limitar la capacidad de generalizacion incluso dentro de la misma tarea.
- El modelo requiere el robot `so_follower` y las camaras configuradas exactamente como en el entrenamiento (mismas claves de observacion, resolucion y frecuencia).
- No es un modelo de lenguaje ni de vision general; no puede usarse fuera del contexto de control robotico para el que fue disenado.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de funcionamiento ni soporte.
- No se proporcionan datos sobre sesgos, alucinaciones o comportamientos inseguros; en robotica, siempre se recomienda supervisar la ejecucion con paradas de emergencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zzhtx/act_sand_to_box
- Dataset de entrenamiento: https://huggingface.co/datasets/zzhtx/sand-to-box_20260817_163857
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=zzhtx/sand-to-box_20260817_163857
