# tetraengnrng/smolvla_base_piper_policy

## Resumen

Este modelo es un fine-tuning de SmolVLA, el modelo fundacional de visión-lenguaje-acción (VLA) de Hugging Face, especializado para una tarea concreta de manipulación robótica: recoger un cubo rojo y depositarlo en un contenedor azul. Lo ha desarrollado el usuario tetraengnrng utilizando el framework LeRobot y el dataset propio `redcube_picknplace_v2`, compuesto por 20 episodios y 5300 frames grabados a 30 FPS.

SmolVLA es un VLA compacto y eficiente diseñado para ejecutarse en hardware de consumo, a diferencia de modelos VLA más grandes como OpenVLA (7B parámetros). Con 450 millones de parámetros, este fine-tuning mantiene esa filosofía de eficiencia, permitiendo su despliegue en GPUs de gama media. El modelo procesa tres vistas de cámara, el estado del robot y una instrucción en lenguaje natural para generar acciones de control de 7 dimensiones mediante flow matching.

La relevancia de este modelo radica en que demuestra el flujo completo de fine-tuning de SmolVLA con LeRobot: desde la grabación de datos hasta el despliegue de una política funcional, todo con herramientas open source y una licencia Apache 2.0. Es un ejemplo práctico de cómo adaptar un modelo base de robótica a una tarea específica con un volumen de datos relativamente pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con flow matching |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | ingles (instrucciones en lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de tipo vision-language-action que combina un codificador visual para procesar multiples vistas de camara, un codificador de lenguaje para la instruccion y un modulo de fusion que integra el estado del robot. La generacion de acciones se realiza mediante flow matching, una tecnica generativa que modela la transformacion gradual de ruido hacia la accion deseada, en lugar de una prediccion directa. Esta arquitectura permite que el modelo sea significativamente mas pequeno que otros VLA sin sacrificar demasiado rendimiento.

El entrenamiento de este fine-tuning partio del modelo base `lerobot/smolvla_base` y se realizo con el dataset `redcube_picknplace_v2`, que contiene 20 episodios de la tarea de pick-and-place. Se utilizaron 2000 pasos de entrenamiento con un batch size de 16, optimizador AdamW con learning rate de 0.0001 y semilla 1000. La configuracion de camaras incluye tres vistas: `wrist`, `extrinsic` y una tercera no especificada, todas con resolucion de 256x256. El modelo fue entrenado con LeRobot version 0.6.2.

## Capacidades

- Control robotico de manipulacion: genera acciones de 7 dimensiones (posicion y orientacion del efector final, mas apertura de pinza) a partir de observaciones visuales y de estado.
- Procesamiento multimodal: integra tres vistas de camara (256x256), el estado del robot (6 dimensiones) y una instruccion en lenguaje natural.
- Aprendizaje por imitacion: la politica replica el comportamiento demostrado en los episodios de entrenamiento.
- Ejecucion en tiempo real: al ser un modelo compacto, puede operar a frecuencias adecuadas para control robotico en hardware de consumo.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni generacion de texto general, ya que es un modelo especializado en control motor.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos controlados: el modelo puede integrarse en una celda robotica para trasladar objetos de una posicion a otra, como en lineas de montaje o clasificacion.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar como el fine-tuning de VLA compactos se comporta con pocos datos (20 episodios) y que margen de mejora existe con mas demostraciones.
- Prototipado rapido de politicas roboticas: con LeRobot, un investigador puede grabar datos, entrenar y desplegar esta politica en un robot real en pocas horas, ideal para validar conceptos antes de escalar.
- Educacion y formacion en robotica: al ser un modelo pequeno y con licencia permisiva, es adecuado para laboratorios docentes que necesitan ejemplos funcionales de VLA sin requerir infraestructura de alto coste.
- Benchmarking de VLA en hardware modesto: permite comparar el rendimiento de SmolVLA frente a modelos mas grandes en tareas de manipulacion, evaluando el equilibrio entre tamano y precision.
- Base para fine-tuning adicional: el modelo puede seguir entrenandose con mas datos o tareas relacionadas, aprovechando los pesos ya ajustados a la configuracion de camaras y robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion en robot real. No se proporcionan metricas como tasa de exito, MMLU, HumanEval ni otros benchmarks estandar de VLA.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 millones de parametros, el modelo en precision fp16 ocupa aproximadamente 0.9 GB de VRAM. Con overhead de activaciones y buffers, se estima un consumo total de 2-3 GB, lo que permite ejecutarlo en GPUs con 4 GB o mas.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM, como RTX 3050, RTX 3060, RTX 4060 o superiores. Tambien es viable en GPUs de datacenter como T4 o A10.
- Compatibilidad con hardware de consumo: si, el modelo esta disenado para ejecutarse en GPUs de gama media y baja, lo que lo hace accesible para laboratorios pequenos y aficionados.
- Opciones de despliegue: el flujo principal es mediante LeRobot, usando el comando `lerobot-rollout` con la configuracion de robot y camaras. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo sino una politica de control.
- Latencia y throughput: no se proporcionan datos medidos. Dado el tamano del modelo y la arquitectura de flow matching, se espera una latencia de decenas de milisegundos por paso en una GPU moderna, suficiente para control en bucle cerrado a 30 Hz.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| tetraengnrng/smolvla_base_piper_policy | 450M | no disponible | Apache 2.0 | Fine-tuning para pick-and-place |
| lerobot/smolvla_base | 450M | no disponible | Apache 2.0 | Modelo base VLA para fine-tuning |
| OpenVLA | 7B | no disponible | MIT | VLA generalista para manipulacion |

La comparativa se limita a aspectos estructurales, ya que no hay datos de rendimiento publicados para este fine-tuning. SmolVLA es significativamente mas pequeno que OpenVLA (450M frente a 7B), lo que reduce los requisitos de hardware y el coste de inferencia, aunque probablemente con menor capacidad de generalizacion a tareas diversas. Ambos comparten el enfoque de aprendizaje por imitacion con datos de demostracion.

## Limitaciones y advertencias

- Entrenamiento con volumen de datos muy reducido: solo 20 episodios y 5300 frames, lo que limita la generalizacion a variaciones de posicion, iluminacion o presencia de distractores no vistos en el entrenamiento.
- Sin evaluacion en robot real: la model card indica que no hay resultados de evaluacion, por lo que el rendimiento real en hardware fisico es desconocido.
- Tarea especifica: la politica esta ajustada para la tarea "pick up the red cube and place it into the blue bin" y no es directamente reutilizable para otras tareas sin reentrenamiento.
- Dependencia de la configuracion de camaras: el modelo espera tres vistas de camara con nombres y resoluciones concretas; cambios en la disposicion fisica de las camaras pueden degradar el rendimiento.
- Riesgo de sobreajuste: con 2000 pasos de entrenamiento y un dataset pequeno, existe riesgo de que el modelo memorice las demostraciones en lugar de aprender una politica robusta.
- Sin capacidades de lenguaje general: a pesar de procesar instrucciones, el modelo no es un chatbot ni un asistente; su unica salida son acciones de control.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el codigo de LeRobot tienen sus propias condiciones que deben revisarse.

## Enlaces

- Repositorio del modelo: https://huggingface.co/tetraengnrng/smolvla_base_piper_policy
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/tetraengnrng/redcube_picknplace_v2
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Documentacion de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de entrenamiento y grabacion: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout: https://huggingface.co/docs/lerobot/main/en/inference
