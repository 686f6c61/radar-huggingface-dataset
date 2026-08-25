# Tingarius/my_smolvla_policy

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por el equipo de Hugging Face y colaboradores, diseñado para control robótico por imitación con un coste computacional reducido y capaz de ejecutarse en hardware de consumo. Este repositorio concreto, `Tingarius/my_smolvla_policy`, es un ajuste fino (fine-tune) del modelo base `lerobot/smolvla_base` sobre el dataset `lerobot/svla_so101_pickplace`, especializado en la tarea de recoger una pieza LEGO rosa y colocarla en una caja transparente usando un robot SO-100.

El modelo tiene 450 millones de parámetros y se distribuye en formato safetensors, con un tamaño de repositorio de 0,9 GB. Está entrenado con LeRobot, la librería de Hugging Face para robótica, y su licencia es Apache 2.0, lo que permite uso comercial y modificación. Su relevancia actual radica en que demuestra cómo un VLA de tamaño moderado puede especializarse en tareas de manipulación con pocos datos (50 episodios) y ejecutarse en GPUs de gama media, abriendo la puerta a la robótica accesible para laboratorios y aficionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer multimodal) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | No disponible (modelo de accion robotica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action que combina un codificador visual, un modelo de lenguaje y una cabeza de accion para generar comandos motores directamente desde observaciones de camara y estado del robot. La arquitectura exacta se describe en el paper [SmolVLA: A Vision-Language-Action Model for Affordable and Efficient Robotics](https://huggingface.co/papers/2506.01844), donde se enfatiza la eficiencia computacional frente a modelos VLA mas grandes como OpenVLA o RT-2. Este fine-tune parte de los pesos preentrenados de `lerobot/smolvla_base` y se entrena durante 200 pasos con un batch size de 4, optimizador AdamW, learning rate de 0,0001 y semilla 1000, usando el dataset `lerobot/svla_so101_pickplace` (50 episodios, 11.939 frames a 30 FPS). No se menciona el uso de RLHF ni DPO; el entrenamiento es de imitacion supervisada estandar.

## Capacidades

- Control robotico de 6 grados de libertad (accion de 6 dimensiones) a partir de observaciones de estado y multiples camaras (hasta 3 camaras de 256x256 y una camara adicional de 480x640).
- Ejecucion de tareas de manipulacion pick-and-place aprendidas por imitacion, especificamente la tarea "pink lego brick into the transparent box".
- Inferencia en tiempo real sobre hardware de consumo gracias a su tamano compacto (450M parametros).
- Integracion nativa con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue en robots SO-100.
- No soporta tool calling, agentes ni razonamiento multi-paso fuera del ambito robotico; su salida es exclusivamente una accion motora.

## Casos de uso

- Automatizacion de tareas de pick-and-place en laboratorios de robotica: el modelo puede controlar un robot SO-100 para recoger y colocar objetos en posiciones definidas, util para experimentos repetibles de manipulacion.
- Prototipado rapido de politicas robotica: gracias a su entrenamiento con solo 50 episodios, permite validar nuevas tareas en pocas horas sin necesidad de grandes datasets.
- Educacion e investigacion en robotica: al ser un modelo abierto y ligero, es adecuado para cursos y proyectos donde se requiera un VLA funcional sin infraestructura de GPU costosa.
- Benchmarking de VLA en hardware modesto: sirve como punto de referencia para comparar el rendimiento de modelos compactos frente a alternativas mas grandes en tareas de manipulacion.
- Desarrollo de sistemas de robotica asistida en entornos domesticos o de taller: el modelo puede adaptarse a tareas simples de recogida y colocacion con una camara RGB estandar.
- Integracion en pipelines de LeRobot para experimentos de aprendizaje por refuerzo o imitacion: al ser un checkpoint de fine-tune, puede usarse como inicializacion para nuevos entrenamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion para esta politica concreta. El paper de SmolVLA (arxiv 2506.01844) reporta metricas comparativas en tareas de robotica, pero esos datos no estan incluidos en la informacion proporcionada y no deben extrapolarse a este fine-tune especifico.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450M parametros en precision fp32, el modelo ocupa aproximadamente 1,8 GB en memoria; con batch de 1 y entradas de imagen de 256x256, se estima un uso de VRAM entre 3 y 5 GB, dependiendo de la implementacion.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4060 o superiores. Para entrenamiento, el notebook oficial de LeRobot sugiere una NVIDIA A100 para 20.000 pasos en ~5 horas, pero este fine-tune con 200 pasos puede completarse en una GPU consumer en minutos.
- Compatibilidad con hardware de consumo: si, cabe en GPUs de gama media y baja.
- Opciones de despliegue: se utiliza principalmente a traves de LeRobot con el comando `lerobot-rollout`; tambien puede integrarse en pipelines personalizados con PyTorch. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no se proporcionan datos especificos, pero al ser un modelo compacto, se espera una inferencia en tiempo real (30 FPS) en GPUs modernas.

## Comparativa con modelos similares

No se dispone de datos comparativos directos para este fine-tune. Como referencia cualitativa, se puede comparar con otros VLA de la literatura:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este fine-tune) | 450M | No disponible | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | 2048 tokens | MIT | Hugging Face |
| RT-2 (Google) | 55B | No publico | Propietaria | No publico |

SmolVLA es significativamente mas pequeno que OpenVLA y RT-2, lo que lo hace mas adecuado para despliegue en hardware limitado, aunque probablemente con menor capacidad de generalizacion a tareas diversas. No se dispone de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un fine-tune especifico para una tarea unica (pick-and-place de una pieza LEGO rosa); no es un modelo generalista y fallara en tareas fuera de su distribucion de entrenamiento.
- El entrenamiento se realizo con solo 50 episodios, lo que puede provocar sobreajuste y baja robustez ante variaciones de iluminacion, posicion de objetos o distracciones.
- No se han proporcionado resultados de evaluacion en robot real, por lo que el rendimiento real no esta verificado.
- Depende del hardware especifico (robot SO-100 y camaras calibradas); cualquier cambio en la configuracion del robot o las camaras puede degradar el rendimiento.
- Al ser un modelo de accion, no tiene capacidades de lenguaje natural ni de razonamiento simbolico; su salida es exclusivamente un vector de accion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener restricciones adicionales; se recomienda revisar las licencias de `lerobot/smolvla_base` y `lerobot/svla_so101_pickplace`.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/Tingarius/my_smolvla_policy)
- [Paper SmolVLA (arxiv 2506.01844)](https://huggingface.co/papers/2506.01844)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Dataset lerobot/svla_so101_pickplace](https://huggingface.co/datasets/lerobot/svla_so101_pickplace)
- [Documentacion de LeRobot para SmolVLA](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Notebook de entrenamiento SmolVLA en Colab](https://colab.research.google.com/github/huggingface/notebooks/blob/main/lerobot/training-smolvla.ipynb)
- [Repositorio LeRobot en GitHub](https://github.com/huggingface/lerobot)
