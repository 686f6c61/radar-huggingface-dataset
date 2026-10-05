# WetLabRoboData/diffusion-stir_bar-scratch

# WetLabRoboData/diffusion-stir_bar-scratch

## Resumen

diffusion-stir_bar-scratch es una politica de robot basada en difusion (diffusion policy) desarrollada por WetLabRoboData y publicada en HuggingFace dentro del ecosistema LeRobot. No es un modelo de lenguaje: es un controlador entrenado por imitacion (imitation learning) para ejecutar la tarea concreta denominada `stir_bar` sobre un robot UR3e bimanual equipado con tres camaras. El modelo resuelve el problema de generar secuencias de acciones motoras a partir de observaciones visuales y de estado, sustituyendo la programacion manual de la tarea por aprendizaje a partir de demostraciones.

El modelo es una variante "scratch", lo que significa que se entreno unicamente con los datos de esa tarea y no parte de un checkpoint previo o preentrenamiento generalista. Cuenta con 262.813.031 parametros (aproximadamente 263 millones) y un repositorio de 1,1 GB en formato safetensors. La evaluacion publicada por el autor reporta 15 exitos sobre 20 episodios de rollout, es decir, una tasa de exito del 75 por ciento en la tarea objetivo.

Su relevancia actual es doble: por un lado, demuestra la aplicacion de politicas de difusion a manipulacion bimanual en entornos de laboratorio humedo (wet lab); por otro, sirve como punto de referencia reproducible dentro de LeRobot, ya que el autor publica tanto el dataset de entrenamiento como el dataset con los videos y resultados de evaluacion por episodio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de difusion (diffusion policy) de LeRobot, condicionada por observaciones visuales y de estado |
| Parametros totales | 262.813.031 (aproximadamente 263 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; consume observaciones con un horizonte temporal fijado en la configuracion de entrenamiento, no publicada) |
| Tipos de cuantizacion | no disponible (el repositorio no documenta variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Familia de politica | diffusion (LeRobot) |
| Variante | Scratch (entrenada solo con datos de esta tarea) |
| Tarea objetivo | stir_bar |
| Robot | UR3e bimanual con 3 camaras |
| Dataset de entrenamiento | WetLabRoboData/lerobot-data-stir_bar |
| Episodios de evaluacion | 20 |
| Exitos de evaluacion | 15 / 20 (75 por ciento) |
| Tamano del repositorio | 1,1 GB |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-10-04 |
| Ultima actualizacion | 2026-10-04 |

## Arquitectura y entrenamiento

La politica pertenece a la familia de diffusion policies implementada en LeRobot. En este enfoque, el modelo aprende a generar una distribucion sobre secuencias de acciones (action chunks) mediante un proceso de difusion inversa condicionado por las observaciones del robot, normalmente imagenes de camaras y el estado de las articulaciones. La arquitectura concreta del backbone de vision, el numero de pasos de denoising, el horizonte de prediccion y el tamano de los action chunks no se detallan en la model card ni en la informacion disponible, por lo que no se pueden especificar aqui.

El entrenamiento es de tipo imitation learning supervisado sobre el dataset WetLabRoboData/lerobot-data-stir_bar. Al tratarse de una variante scratch, el autor indica que se entreno exclusivamente con los datos de esta tarea, sin indicios de una fase posterior de RLHF, DPO u optimizacion por refuerzo. No se especifica el numero de tokens, el numero de episodios de demostracion, la composicion del dataset ni si se aplicaron tecnicas de aumento de datos. El autor conserva los artefactos de entrenamiento originales (checkpoints, train_config.json y directorio wandb) en la subcarpeta `old/` del repositorio de datos de origen, como traza de procedencia.

## Capacidades

- Generacion de acciones motoras para manipulacion robotica: produce comandos de control para un UR3e bimanual con el fin de completar la tarea `stir_bar`.
- Control bimanual: la politica esta disenada para coordinar dos brazos, segun se deduce del hardware objetivo declarado (UR3e bimanual).
- Percepcion multimodal de entrada: utiliza tres camaras como fuente de observacion, ademas del estado del robot (no se detalla la composicion exacta de las observaciones).
- Aprendizaje por imitacion: reproduce comportamientos aprendidos de demostraciones, sin necesidad de definir la tarea mediante reglas o planificacion simbolica.
- Ejecucion de tareas de laboratorio humedo: orientada al manejo de material e instrumentos en un entorno de laboratorio (agitacion o mezcla con barra, segun el nombre de la tarea).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso simbolico, capacidades multilingues ni modos de pensamiento, ya que no es un modelo de lenguaje.

## Casos de uso

- Automatizacion de agitacion y mezcla en laboratorio humedo: la politica ejecuta la tarea `stir_bar` sobre un UR3e bimanual, lo que permite reproducir de forma consistente un protocolo de mezcla que de otro modo requeriria intervencion manual.
- Reproduccion de protocolos experimentales: integrada en una celula robotica de laboratorio, puede encargarse de pasos repetitivos de preparacion de muestras, liberando al personal tecnico para tareas de mayor valor.
- Baseline para investigacion en imitation learning: al ser una variante scratch con dataset y resultados de evaluacion publicados, sirve como referencia para comparar tecnicas de preentrenamiento, aumento de datos o regularizacion aplicadas a la misma tarea.
- Fine-tuning especifico de laboratorio: partiendo de estos pesos o de su configuracion, un grupo puede reentrenar con sus propias demostraciones para adaptar la politica a variantes de la tarea, utensilios o distribucion del material.
- Validacion sim2real y estudios de robustez: los videos de rollout por episodio publicados en el dataset de evaluacion permiten analizar en que condiciones falla la politica y disenar experimentos de generalizacion (iluminacion, posiciones iniciales, oclusiones).
- Benchmarking de politicas de difusion en robotica de laboratorio: la combinacion de tarea, robot, dataset y metrica de exito facilita comparaciones reproducibles entre familias de politicas dentro de LeRobot.
- Formacion y divulgacion tecnica: el par modelo mas dataset de evaluacion es un ejemplo completo y trazable de un pipeline de aprendizaje por imitacion aplicado a robotica real.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tasa de exito en la tarea stir_bar | 15 / 20 episodios (75 por ciento) |
| Episodios de evaluacion | 20 |
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | no aplica (no es un modelo de lenguaje) |
| Otras metricas de robotica (tiempo de ejecucion, precision, robustez) | no disponible |

Los resultados de rollout por episodio y los videos de evaluacion se publican en el dataset WetLabRoboData/eval-diffusion-stir_bar-scratch. No se proporcionan comparaciones con otras politicas ni resultados en tareas adicionales.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,05 GB en precision fp32 (coherente con un repositorio de 1,1 GB y 262.813.031 parametros) y aproximadamente 0,53 GB en bf16/fp16. Estas cifras son estimaciones aritmeticas a partir del numero de parametros y no un dato publicado por el autor.
- VRAM total de inferencia: no disponible de forma oficial; a los pesos hay que sumar activaciones y el procesamiento de tres flujos de camara, por lo que en la practica el consumo sera superior al de los pesos en solitario.
- GPU recomendadas: no especificadas por el autor. Por tamano, la inferencia es viable en GPUs de consumo, como una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o superiores; una RTX 4090 o una A100/H100 estarian sobredimensionadas para este modelo y solo se justificarian por latencia o por paralelizacion de experimentos.
- Cabe en GPU de consumo: si, segun la estimacion de tamano de pesos, siempre que el control en tiempo real de los tres flujos de camara no sature el presupuesto de memoria y computo.
- Opciones de despliegue: la via documentada es la libreria LeRobot con `DiffusionPolicy.from_pretrained("WetLabRoboData/diffusion-stir_bar-scratch")`. Las soluciones orientadas a modelos de lenguaje (vLLM, TGI, Ollama, llama.cpp) no son aplicables a esta politica.
- Latencia y throughput: no disponibles. En politicas de difusion, el coste por accion depende del numero de pasos de denoising y del horizonte de prediccion, parametros que no se publican en la informacion disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos comparables ni datos de rendimiento de alternativas de la misma categoria. La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre politicas de robotica similares.

## Limitaciones y advertencias

- Especializacion estrecha: al ser una variante scratch, la politica esta entrenada unicamente para la tarea `stir_bar` y no se espera que generalice a otras tareas sin reentrenamiento o fine-tuning.
- Dependencia del hardware: el modelo esta calibrado para un UR3e bimanual con tres camaras. Cambiar el robot, el numero de camaras o su montaje invalida probablemente el comportamiento aprendido.
- Dependencia del entorno: no se documenta la variabilidad cubierta en el dataset de entrenamiento (iluminacion, posiciones iniciales, tipos de recipiente). El rendimiento fuera de esas condiciones es desconocido.
- Tasa de fallo no despreciable: un 25 por ciento de episodios fallidos en la propia evaluacion del autor implica que cualquier despliegue real necesita supervision, deteccion de fallos y recuperacion.
- Riesgo de distribucion fuera de rango: como toda politica de imitacion, puede producir acciones poco fiable cuando observa configuraciones no vistas durante el entrenamiento. No aplica el concepto de alucionacion linguistica, pero si el de comportamiento incorrecto con alta confianza.
- Idiomas: no aplica, ya que no procesa lenguaje natural; no hay capacidades multilingues que evaluar.
- Licencia: Apache 2.0, que permite uso comercial y modificacion, con la obligacion de conservar los avisos de copyright y licencia y de indicar los cambios realizados. No se declaran restricciones adicionales ni clausulas de uso responsable en la informacion disponible.
- Trazabilidad: los artefactos de entrenamiento originales se conservan en la subcarpeta `old/` del repositorio de datos, no en el repositorio del modelo.
- Madurez y adopcion: el modelo registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de validacion por terceros mas alla de la evaluacion del propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WetLabRoboData/diffusion-stir_bar-scratch
- Dataset de entrenamiento: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-stir_bar
- Dataset de evaluacion (videos de rollout y resultados por episodio): https://huggingface.co/datasets/WetLabRoboData/eval-diffusion-stir_bar-scratch
- Papers, blogs o repositorios adicionales: no se han encontrado enlaces relevantes en la busqueda web realizada.
