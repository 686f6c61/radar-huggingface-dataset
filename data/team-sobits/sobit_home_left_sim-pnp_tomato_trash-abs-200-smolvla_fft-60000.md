# team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200-smolvla_fft-60000

## Resumen

Este modelo es un checkpoint intermedio (paso 60.000 de 90.000) de un fine-tuning de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, sobre el que el equipo Team SOBITS ha entrenado una política de control para un robot móvil manipulador. La tarea específica consiste en lanzar una lata de tomate a una papelera, ejecutada en un entorno simulado. El modelo se distribuye bajo licencia Apache 2.0 y está integrado en el ecosistema LeRobot, lo que facilita su despliegue en robots reales compatibles.

Con 450 millones de parámetros, SmolVLA está diseñado para ejecutarse en hardware de consumo, lo que lo convierte en una alternativa accesible a modelos VLA de mayor tamaño como OpenVLA. Este fine-tuning particular ha sido entrenado con 200 episodios y 48.141 fotogramas capturados por dos cámaras (cabeza y mano izquierda), y produce acciones de 20 dimensiones sobre el estado del robot. Es relevante porque demuestra cómo un modelo base de propósito general puede adaptarse a una tarea robótica concreta con un coste computacional moderado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion; modelo base: SmolVLA (ver paper arxiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (modelo de robotica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint base `lerobot/smolvla_base`, que corresponde a SmolVLA, un modelo de vision-lenguaje-accion compacto disenado para robotica. Segun la informacion disponible, no se detallan los componentes internos (codificador visual, modelo de lenguaje, modulo de accion), pero se sabe que el modelo completo tiene 450 millones de parametros y que esta optimizado para funcionar en hardware de consumo.

El entrenamiento se realizo con el framework LeRobot (version 0.6.0) sobre el dataset `team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs`, que contiene 200 episodios y 48.141 fotogramas a 10 FPS. La configuracion de entrenamiento incluye 60.000 pasos (de un total de 90.000), batch size de 16, optimizador AdamW con learning rate de 0,0001 y semilla 1000. No se menciona el uso de tecnicas como RLHF o DPO; se trata de un entrenamiento de imitacion supervisada estandar para politicas robotica.

## Capacidades

- Control de robot movil manipulador: genera acciones de 20 dimensiones a partir de observaciones de estado y dos camaras (cabeza y mano izquierda).
- Ejecucion de una tarea especifica: "lanzar la lata de tomate a la papelera" en un entorno simulado.
- Percepcion visual multimodal: procesa imagenes RGB de 480x640 (camara de cabeza) y 400x640 (camara de mano) junto con el estado del robot.
- Integracion con LeRobot: compatible con el pipeline de rollout y entrenamiento de LeRobot, lo que permite su uso en robots reales con configuracion minima.
- Fine-tuning sobre tarea concreta: el modelo esta especializado en la tarea entrenada, no es un modelo de proposito general.
- No se reportan capacidades de tool calling, agentes, razonamiento general ni soporte multilingue.

## Casos de uso

- Automatizacion de tareas domesticas en robotica asistencial: el robot puede aprender a recoger objetos y depositarlos en contenedores, como en este caso una lata en una papelera, reduciendo la carga fisica en entornos de cuidado.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar como un VLA compacto se adapta a tareas de manipulacion con pocos datos (200 episodios).
- Desarrollo de politicas robotica en simulacion: el modelo puede ejecutarse en simuladores (como los usados en SOBITS) para validar algoritmos antes de transferirlos a hardware real.
- Prototipado rapido de tareas de pick-and-place: dado su tamano reducido, permite iterar rapidamente en entornos de desarrollo con GPUs de consumo.
- Educacion en robotica: al ser un modelo abierto y ligero, puede utilizarse en cursos de robotica para ensenar conceptos de VLA y aprendizaje por refuerzo.
- Benchmark de eficiencia: comparar el rendimiento de SmolVLA frente a modelos mas grandes en tareas de manipulacion con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de metricas como tasa de exito en la tarea ni comparaciones con otros modelos.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la informacion del modelo.
- Dado el tamano de 450 millones de parametros, se estima que en FP16 ocuparia alrededor de 900 MB de VRAM, y en FP32 unos 1,8 GB, por lo que seria ejecutable en GPUs de consumo como una NVIDIA RTX 3060 (12 GB) o superior.
- El despliegue se realiza mediante LeRobot, que soporta inferencia en GPU con CUDA. No se mencionan opciones como vLLM o llama.cpp, ya que no es un modelo de lenguaje generativo.
- Para el rollout en robot real, se necesita el hardware del robot (movil manipulador) y las camaras configuradas segun las claves de observacion entrenadas.
- La latencia y el throughput no estan documentados; al ser un modelo compacto, se espera que sea adecuado para control en tiempo real, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de informacion comparativa en la ficha del modelo. Sin embargo, se puede contextualizar con otros VLA de la literatura:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este fine-tuning) | 450M | No disponible | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | No disponible | MIT (con restricciones) | Hugging Face |
| RT-2 | 55B | No disponible | Propietario | No publico |

No se dispone de datos de rendimiento para comparar directamente. Se recomienda consultar el paper de SmolVLA (arxiv:2506.01844) para metricas generales del modelo base.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para la tarea "lanzar la lata de tomate a la papelera" en un entorno simulado; no es generalizable a otras tareas sin un nuevo fine-tuning.
- No se han publicado resultados de evaluacion en robot real, por lo que su rendimiento fuera de simulacion es desconocido.
- El checkpoint es intermedio (paso 60.000 de 90.000); el modelo final (paso 90.000) podria tener un rendimiento diferente.
- No se documentan sesgos especificos, pero al ser un modelo de robotica, los sesgos dependen del entorno de entrenamiento (simulacion) y de los datos utilizados.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base (SmolVLA) y el dataset tambien tengan licencias compatibles.
- No se especifican limitaciones de contexto ni de idioma, ya que el modelo no procesa texto libre; las instrucciones se limitan a la tarea definida en el entrenamiento.

## Enlaces

- Repositorio del modelo (checkpoint 60000): https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200-smolvla_fft-60000
- Repositorio del modelo final (checkpoint 90000): https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200-smolvla_fft-90000
- Dataset de entrenamiento: https://huggingface.co/datasets/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio de Team SOBITS en GitHub: https://github.com/TeamSOBITS/sobit_home
- Canal de YouTube de Team SOBITS: https://www.youtube.com/@teamsobits
- Guia de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index
