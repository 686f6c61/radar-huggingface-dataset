# swyrme/act-lego5

## Resumen

`swyrme/act-lego5` es una politica de robotica basada en ACT (Action Chunking with Transformers), un metodo de aprendizaje por imitacion que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo lo publica el usuario swyrme en HuggingFace Hub y se ha entrenado y exportado con LeRobot, la libreria de HuggingFace para aprendizaje automatico aplicado a robotica real.

El modelo resuelve una tarea concreta de manipulacion: "Pick up the Lego brick and put it in the bowl" (coger el ladrillo de Lego y dejarlo en el cuenco). Consume el estado del robot (vector de 6 dimensiones) y dos flujos de imagen frontal y lateral de 480x640, y produce un vector de accion de 6 dimensiones. Con 51.668.614 parametros y un repositorio de 0,2 GB, es un modelo pequeno que puede ejecutarse en hardware modesto.

Su relevancia es doble: por un lado, sirve como ejemplo reproducible del flujo completo de LeRobot (grabacion de datos, entrenamiento de una politica ACT y despliegue en un robot `so_follower`); por otro, es una politica de un solo task entrenada con tan solo 40 episodios y 13.983 fotogramas, sin resultados de evaluacion publicados, por lo que debe tratarse como una demostracion y no como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), aprendizaje por imitacion |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (politica de robotica; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica / no disponible (modelo de robotica, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tipo de robot | `so_follower` |
| Camaras | `front`, `side` (480x640, 3 canales) |
| Entrada `observation.state` | STATE, forma `(6,)` |
| Entrada `observation.images.front` | VISUAL, forma `(3, 480, 640)` |
| Entrada `observation.images.side` | VISUAL, forma `(3, 480, 640)` |
| Salida `action` | ACTION, forma `(6,)` |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-26 |
| Ultima actualizacion | 2026-09-26 |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion descrito en el paper arXiv 2304.13705, al que remite la propia model card. Su caracteristica principal es que predice chunks de acciones (varias acciones futuras de golpe) en lugar de una unica accion por paso, lo que reduce el problema de horizonte y estabiliza el control. La model card no detalla la configuracion interna de la red (numero de capas, dimensionalidad de embeddings, mecanismo de muestreo del chunk); ese detalle debe consultarse en el paper referenciado. La implementacion concreta es la de LeRobot, version 0.6.2.

El entrenamiento se realizo sobre el dataset `swyrme/so101-lego5`: 40 episodios, 13.983 fotogramas a 30 FPS, con la unica tarea "Pick up the Lego brick and put it in the bowl". La configuracion de entrenamiento reportada es de 40.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se indica en la model card si se aplicaron tecnicas de refinamiento adicionales como RLHF o DPO (no aplicables de forma estandar en este tipo de politicas), ni se documenta la composicion exacta de escenarios, posiciones de objeto o condiciones de iluminacion del dataset.

## Capacidades

- Control robótico por imitacion para una tarea de manipulacion concreta: coger un ladrillo de Lego y depositarlo en un cuenco.
- Prediccion de chunks de acciones de 6 dimensiones a partir de observaciones multimodales (estado del robot e imagen).
- Fusion de dos vistas de camara (`front` y `side`) a 480x640 junto con el estado articular del robot.
- Inferencia en tiempo real sobre un robot `so_follower` mediante el comando `lerobot-rollout` de LeRobot.
- Reentrenamiento y ajuste con el flujo `lerobot-train` sobre nuevos datasets en formato LeRobot.
- No dispone de tool calling, function calling, razonamiento multi-paso en lenguaje natural, capacidades multilingues ni modos de pensamiento: no es un modelo de lenguaje.
- No se documentan capacidades de generalizacion a otros objetos, tareas o robots distintos del configurado.

## Casos de uso

- Reproduccion de un pipeline completo de imitation learning: sirve como referencia de principio a fin (grabacion con `so_follower`, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) para equipos que quieran montar su primer flujo de robotica con LeRobot.
- Demostracion educativa de ACT: permite ilustrar en un aula o taller como una politica transformer pequena (51,7 M de parametros) resuelve una tarea de pick-and-place con datos teleoperados.
- Base para fine-tuning de una tarea similar: el checkpoint puede reutilizarse como punto de partida para entrenar variantes del mismo montaje (otro objeto, otro recipiente) con un dataset propio.
- Pruebas de integracion hardware/software: validar la cadena de camaras OpenCV, puerto serie del robot y frecuencias de 30 FPS antes de invertir en datasets mayores.
- Benchmark interno de infraestructura: al ser un modelo de 0,2 GB, permite medir latencia de inferencia, consumo de VRAM y throughput en distintas GPU o incluso en CPU sin apenas coste.
- Prototipado rapido de politicas en laboratorio: con 40 episodios y 40.000 pasos de entrenamiento, el ciclo completo de datos-entrenamiento-evaluacion es asumible en pocas horas, lo que facilita iterar sobre la recogida de datos.
- Estudio de robustez a condiciones de captura: al depender de dos camaras con nombres fijos (`front`, `side`), es util para experimentar con cambios de iluminacion, posicion de camara o distractores y observar la degradacion de la politica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la frase "No evaluation results have been provided for this policy yet", por lo que no hay tasas de exito, numero de ensayos ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 51.668.614 parametros, los pesos ocupan aproximadamente 207 MB en FP32 y unos 103 MB en FP16, a los que hay que sumar las activaciones de dos imagenes de 480x640 y el estado del robot.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; una RTX 3060, RTX 4090, A100 o H100 estan sobradamente dimensionadas para esta politica. Tambien es viable ejecutar la inferencia en CPU, aunque no se documenta la latencia resultante.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual y en muchas integradas, dado el tamano reducido del modelo.
- Opciones de despliegue: el soporte documentado es LeRobot con `lerobot-rollout` (estrategia `base`) y la libreria `lerobot` 0.6.2. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a una politica de robotica.
- Latencia y throughput: no se publican mediciones. Como referencia indirecta, el dataset de entrenamiento se grabo a 30 FPS, lo que implica que la politica debe ejecutar inferencia a esa frecuencia o superior para el control en tiempo real del robot.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| swyrme/act-lego5 | ACT (imitation learning) sobre LeRobot | 51.668.614 | no aplica | apache-2.0 | HuggingFace Hub, 0 descargas |
| Diffusion Policy | Politica por difusion para robotica | no disponible | no aplica | no disponible | Implementada en LeRobot; no se dispone de datos concretos de comparacion |
| SmolVLA | Vision-language-action | no disponible | no disponible | no disponible | Disponible en el ecosistema LeRobot; no se dispone de datos concretos de comparacion |
| pi0 / pi0.5 | Vision-language-action | no disponible | no disponible | no disponible | Disponible en el ecosistema LeRobot; no se dispone de datos concretos de comparacion |

No se dispone de datos verificados de parametros, contexto, licencia ni rendimiento de las alternativas citadas dentro de la informacion proporcionada, por lo que la comparacion cuantitativa se marca como no disponible.

## Limitaciones y advertencias

- Politica de tarea unica: solo se ha entrenado para "Pick up the Lego brick and put it in the bowl"; no hay evidencia de que funcione con otros objetos, recipientes o instrucciones.
- Dataset muy reducido: 40 episodios y 13.983 fotogramas, lo que aumenta el riesgo de sobreajuste a las posiciones, iluminacion y disposicion concretas de la recogida de datos.
- Ausencia total de evaluacion: la model card confirma que no se han publicado resultados de exito, ni en simulacion ni en robot real, por lo que se desconoce la tasa de acierto real.
- Dependencia estricta del montaje: requiere un robot `so_follower` y dos camaras cuyos nombres de observacion deben coincidir exactamente con `front` y `side` y capturar a 480x640; cualquier cambio de camara, indice o resolucion invalida la politica.
- Sin datos sobre sesgos: no se documenta la composicion demografica ni de escenarios del dataset, y no aplica el concepto habitual de sesgo de lenguaje, pero si existe un sesgo de dominio hacia el entorno de grabacion.
- Riesgo de fallo silencioso: al ser una politica de imitacion sin mecanismos de deteccion de incertidumbre documentados, puede ejecutar acciones incorrectas sin avisar cuando la escena difiere de la distribucion de entrenamiento.
- Licencia: el modelo se publica bajo Apache 2.0, que permite uso comercial, pero la licencia del dataset `swyrme/so101-lego5` no se especifica en la informacion disponible y conviene verificarla antes de reutilizar los datos.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion por parte de la comunidad ni issues publicas que documenten su comportamiento.
- Sin cuantizaciones publicadas: no hay versiones GGUF, AWQ ni GPTQ, y tampoco se documenta si el entrenamiento o la inferencia admiten precision reducida sin perdida de rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/swyrme/act-lego5
- Dataset de entrenamiento: https://huggingface.co/datasets/swyrme/so101-lego5
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=swyrme/so101-lego5
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
