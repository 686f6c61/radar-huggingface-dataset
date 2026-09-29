# vis22/green_act_stack

# vis22/green_act_stack

## Resumen

green_act_stack es una politica robotica de imitacion entrenada con el metodo ACT (Action Chunking with Transformers) y publicada en Hugging Face por el usuario vis22. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado articular de un brazo robot y dos flujos de imagen de camara, y devuelve directamente un vector de acciones de 7 dimensiones. Su unico objetivo es ejecutar la tarea "Stack the green plate on top of the blue plate" (apilar el plato verde sobre el azul) sobre un robot de tipo `piper_follower`.

El modelo tiene 51.670.663 parametros y ocupa 0,2 GB en el repositorio. Fue entrenado durante 100.000 pasos con un lote de 8, optimizador AdamW y tasa de aprendizaje 1e-5, usando LeRobot 0.6.1 sobre un conjunto de datos propio de 30 episodios y 8.099 fotogramas grabados a 30 FPS. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es practica y de nicho: sirve como ejemplo reproducible de entrenamiento ACT con LeRobot, como punto de partida para experimentos de aprendizaje por imitacion y como referencia para evaluar la reproducibilidad de politicas entrenadas con pocos episodios. Al no existir resultados de evaluacion publicados, su utilidad real debe validarse en el robot destino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con backbone visual convolucional y decodificacion de trozos de accion |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors, presumiblemente fp32) |
| Idiomas soportados | no disponible (la instruccion de tarea del dataset esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que predice trozos cortos de accion (action chunks) en lugar de un unico paso, lo que reduce el problema de horizonte y mejora la consistencia temporal de las politicas. La arquitectura combina un backbone visual que procesa dos camaras (`cam_global` y `cam_gripper`, ambas a 3x480x640) con un transformer encoder-decoder que consume el estado del robot (vector de 7 dimensiones) y genera acciones de 7 dimensiones. El modelo fue entrenado con el articulo de referencia arXiv:2304.13705 y la implementacion de LeRobot.

Los datos de entrenamiento provienen del dataset `vis22/original_green_stack_plates_20260922_165647`: 30 episodios teleoperados, 8.099 fotogramas a 30 FPS, una sola tarea y un solo robot. La configuracion reportada es de 100.000 pasos, lote de 8, AdamW, learning rate 1e-5 y semilla 1000 con LeRobot 0.6.1. No se documenta el uso de RLHF, DPO ni tecnicas de refinamiento posteriores, ni el numero de tokens o la composicion detallada del dataset mas alla de lo indicado. Tampoco se especifican innovaciones adicionales mas alla del propio mecanismo de action chunking.

## Capacidades

- Generacion de acciones de control continuo de 7 dimensiones a partir de observaciones visomotrices.
- Percepcion visual con dos camaras simultaneas (global y de pinza) a resolucion 3x480x640.
- Ejecucion de la tarea especifica de apilado de platos ("Stack the green plate on top of the blue plate").
- Prediccion de trozos de accion en lugar de pasos aislados, lo que aporta suavidad y coherencia temporal.
- Funcionamiento en bucle cerrado con el robot `piper_follower` mediante `lerobot-rollout`.
- No dispone de tool calling, function calling, razonamiento multi-paso simbolico, capacidades de agente ni generacion de texto.
- No soporta multiples idiomas en el sentido linguistico: solo interpreta internamente la instruccion de tarea asociada al entrenamiento.
- No tiene modo de pensamiento (thinking mode), vision-lenguaje, audio ni ninguna capacidad multimodal de proposito general.

## Casos de uso

- Apilado automatizado de piezas: el modelo esta entrenado especificamente para colocar un plato verde sobre uno azul, por lo que puede integrarse en una celda de manipulacion que repita esa tarea con objetos y posiciones similares a los del dataset.
- Recogida y colocacion (pick-and-place) en laboratorio: sirve como controlador de referencia para mover objetos planos con un brazo `piper_follower` en entornos controlados con iluminacion estable.
- Reproduccion de referencia en investigacion: permite replicar resultados de ACT con LeRobot 0.6.1 y comparar frente a politicas propias entrenadas sobre el mismo dataset de 30 episodios.
- Recoleccion de datos asistida: puede desplegarse en modo `base` con `lerobot-rollout` para ejecutar la politica mientras se graban episodios adicionales que amplien el dataset.
- Docencia en robotica e imitacion: al ser un modelo pequeno (51,67 M de parametros, 0,2 GB) y con licencia permisiva, es adecuado para practicas de entrenamiento y despliegue en aulas o talleres.
- Pruebas de infraestructura de inferencia robotica: sirve para validar cadenas de captura de camaras OpenCV a 640x480 y 30 FPS, calibracion de brazos y latencias de control en un robot real.
- Base para ajuste fino: al estar publicado en Apache 2.0 y tener un dataset asociado, puede reentrenarse con `lerobot-train` sobre variaciones de la tarea (otros colores, posiciones o tipos de plato).
- Validacion de protocolos de seguridad en manipulacion: al ser una politica de una unica tarea y con espacio de accion acotado, facilita definir limites de par y paradas de emergencia antes de pasar a politicas mas generales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente: "No evaluation results have been provided for this policy yet", por lo que no hay tasas de exito, numero de ensayos ni datos de MMLU, HumanEval, GSM8K u otras metricas. Tampoco se proporcionan metricas de error de imitacion ni de suavidad de trayectoria.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del numero de parametros, no confirmado por el autor): aproximadamente 207 MB para los pesos en fp32, unos 103 MB en fp16/bf16 y unos 52 MB en int8. A esto hay que sumar las activaciones de los dos flujos de imagen de 3x480x640, lo que en la practica puede situar el consumo total en el rango de 1 a 3 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de memoria, incluidas RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100 o H100. El modelo es lo bastante pequeno como para no requerir aceleradores de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual y tambien en CPU, aunque la latencia de control puede degradarse en CPU.
- Opciones de despliegue: LeRobot sobre PyTorch mediante `lerobot-rollout` y `lerobot-train`; el modelo no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. El dataset de entrenamiento opera a 30 FPS, que es la frecuencia de control de referencia esperada, pero no se publica ninguna medicion de latencia o de tiempo de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vis22/green_act_stack | ACT (politica visomotora) | 51.670.663 | Apilado de platos con `piper_follower` | Apache 2.0 | Hugging Face (0 descargas, 0 me gusta) |
| vis22/act_stack | ACT (politica visomotora) | no disponible | Tarea de apilado relacionada | Apache 2.0 | Hugging Face |
| ACT original (arXiv:2304.13705) | ACT (politica visomotora) | no disponible en esta busqueda | Manipulacion bimanual sobre ALOHA | no disponible en esta busqueda | Paper y repositorio de referencia |
| Diffusion Policy | Politica generativa por difusion | no disponible en esta busqueda | Manipulacion visomotora general | no disponible en esta busqueda | Referencia metodologica alternativa a ACT |

No se han encontrado datos publicos de rendimiento comparativo entre estas alternativas en la informacion disponible. La comparacion debe limitarse a aspectos de arquitectura, licencia y tarea objetivo.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo ha visto una tarea y un robot. No generaliza a otras tareas, objetos ni morfologias sin reentrenamiento.
- Dataset muy reducido: 30 episodios y 8.099 fotogramas implican un riesgo alto de sobreajuste a posiciones, iluminacion y disposicion de objetos concretas.
- Sin evaluacion publicada: no hay evidencia empirica de tasa de exito, por lo que su fiabilidad en produccion es desconocida y debe validarse con ensayos propios.
- Sesgos de datos: al proceder de teleoperacion de una sola persona, hereda sus sesgos de manipulacion (velocidad, trayectorias, puntos de agarre) y no cubre variabilidad de operador.
- Sensibilidad a cambios de entorno: variaciones de iluminacion, fondo, posicion de camaras o distinta instancia del mismo robot pueden degradar el comportamiento.
- Dependencia de hardware y calibracion: requiere un robot `piper_follower` y dos camaras con nombres y resolucion coincidentes con las claves de observacion (`observation.images.cam_global` y `observation.images.cam_gripper`); un desajuste provoca fallo de inferencia.
- Alucinacion en el sentido de acciones erroneas: como toda politica de imitacion, puede producir trayectorias plausibles pero incorrectas sin senal de incertidumbre, por lo que se recomienda supervision y limites de seguridad.
- Idioma: la instruccion de tarea esta en ingles; no hay soporte multilingue declarado.
- Licencia: Apache 2.0 permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y la atribucion correspondiente. No se declaran restricciones adicionales.
- Ausencia de datos sobre cuantizacion: no se especifican formatos cuantizados ni compatibilidad con herramientas de compresion para robotica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vis22/green_act_stack
- Dataset de entrenamiento: https://huggingface.co/datasets/vis22/original_green_stack_plates_20260922_165647
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=vis22/original_green_stack_plates_20260922_165647
- Modelo relacionado del mismo autor: https://huggingface.co/vis22/act_stack
- Perfil del autor: https://huggingface.co/vis22
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
