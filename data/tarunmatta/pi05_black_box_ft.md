# tarunmatta/pi05_black_box_ft

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para generalizacion en entornos abiertos. Esta ficha concreta, `tarunmatta/pi05_black_box_ft`, es un fine-tuning del modelo base `lerobot/pi05_base` realizado por el usuario tarunmatta mediante la libreria LeRobot. El modelo consume observaciones visuales (tres camaras RGB de 224x224) y un vector de estado de 32 dimensiones, y produce acciones de 6 dimensiones para un robot de tipo `so_follower`.

El fine-tuning se ha realizado sobre un dataset propio de 40 episodios y 8848 fotogramas a 10 FPS para una unica tarea: "Pick up the black box". Se trata, por tanto, de una politica de imitacion especializada en una tarea concreta de manipulacion robotica, no de un modelo generalista. Su relevancia es practica: demuestra el flujo completo de LeRobot para entrenar y desplegar politicas VLA sobre hardware asequible (SO-100/SO-101), con un total de 4.143.404.816 parametros en pesos safetensors y un repositorio de 9,4 GB.

La arquitectura subyacente es la del π₀.₅ original de Physical Intelligence, adaptada en la implementacion open source OpenPI y empaquetada por LeRobot. El modelo esta publicado bajo licencia Gemma y no cuenta con resultados de evaluacion reportados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05); implementacion LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a robotica, no a texto) |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | so_follower |
| Camaras de entrada | wrist, left (segun model card); features: base_0_rgb, left_wrist_0_rgb, right_wrist_0_rgb, empty_camera_0 |
| Entrada de estado | observation.state, shape (32,) |
| Salida de accion | action, shape (6,) |
| Resolucion de imagen | 224 x 224 (3 canales) |
| Dataset de entrenamiento | tarunmatta/pick_up_black_box_smolvla (40 episodios, 8848 fotogramas, 10 FPS) |
| Pasos de entrenamiento | 20000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 2,5e-05 |
| Seed | 1000 |
| Version de LeRobot | 0.7.1 |
| Tamano del repo | 9,4 GB |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅ (Pi05), un modelo Vision-Language-Action de Physical Intelligence que evoluciona π₀ para generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementacion utilizada aqui es la de LeRobot, adaptada del repositorio open source OpenPI de Physical Intelligence. La model card no detalla la composicion interna de la arquitectura (backbone de vision, encoder de lenguaje, cabecera de acciones), por lo que esos detalles deben consultarse en la documentacion de π₀.₅ y OpenPI.

El entrenamiento es un fine-tuning supervisado de imitacion sobre el dataset `tarunmatta/pick_up_black_box_smolvla`: 40 episodios, 8848 fotogramas a 10 FPS, una unica tarea ("Pick up the black box"). Se ejecutaron 20000 pasos con batch size 16, optimizador AdamW, learning rate 2,5e-05 y seed 1000, usando LeRobot 0.7.1. No se documenta el uso de RLHF, DPO ni tecnicas de refuerzo; es aprendizaje por imitacion puro sobre el modelo base. No hay informacion sobre el volumen de tokens, la composicion del dataset de preentrenamiento del modelo base ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.) en la informacion proporcionada.

## Capacidades

- Generacion de acciones de control roboticode 6 dimensiones a partir de observaciones multimodales (tres camaras RGB y estado proprioceptivo de 32 dimensiones).
- Percepcion visual multi-camara: procesa simultaneamente imagenes de camara base y muñecas (izquierda y derecha) a 224x224.
- Ejecucion de una tarea de manipulacion concreta: recoger una caja negra ("Pick up the black box").
- Politica de imitacion entrenada para el robot `so_follower` (familia SO-100/SO-101 de LeRobot).
- Integracion nativa con el ecosistema LeRobot: rollout via CLI `lerobot-rollout`, entrenamiento via `lerobot-train`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues; no es un modelo de proposito general de texto.
- No se documenta modo thinking, vision-language general, audio ni otras capacidades especiales.

## Casos de uso

- Recogida automatizada de objetos en linea de montaje: el modelo ejecuta la tarea "Pick up the black box" sobre un robot SO-100/SO-101, adecuado para demostrar flujos de picking en laboratorio o prototipos educativos.
- Docencia e investigacion en aprendizaje por imitacion: sirve como ejemplo reproducible de fine-tuning VLA con LeRobot (40 episodios, 20000 pasos), util para cursos de robotica y TFMs.
- Validacion de pipelines de LeRobot de extremo a extremo: desde la grabacion del dataset (`pick_up_black_box_smolvla`) hasta el rollout con `--strategy.type=base`, permitiendo verificar hardware, calibracion de camaras y latencia antes de escalar.
- Benchmark interno de hardware de bajo coste: al ser una politica pequena (4,1 mm parametros) y entrenada en una tarea unica, permite medir throughput y latencia de inferencia en GPUs consumer frente a modelos VLA mayores.
- Base para transferencia a tareas similares: el checkpoint puede servir de punto de partida para fine-tunings sobre otros objetos o posiciones, reutilizando el conocimiento del modelo base `lerobot/pi05_base`.
- Demostracion de generalizacion de π₀.₅ en entornos nuevos: util para comparar el comportamiento del fine-tuning frente al modelo base en condiciones de iluminacion, posiciones de objeto o distractores distintos de los del dataset.
- Prototipado rapido de automatizacion de picking en laboratorios con robot de sobremesa: el modelo corre con la CLI de LeRobot y camaras OpenCV estandar, sin infraestructura de servidor dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion vacia con la nota explicita: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito en robot real, ni de metricas de MMLU, HumanEval, GSM8K u otras, que ademas no aplicarian a un modelo VLA de robotica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 4,1 mm parametros en safetensors ocupa aproximadamente 8,3 GB en precision FP16/BF16 (2 bytes por parametro) y unos 4,1 GB en FP8/INT8; estas cifras son estimaciones por tamano, no datos publicados por el autor.
- GPU recomendadas: no especificadas en la model card. Por tamano, cabria esperar GPUs con al menos 12-16 GB de VRAM para FP16 (RTX 4080, RTX 4090, L4, A10), y GPUs de datacenter (A100, H100) para lotes mayores o entrenamiento.
- Cabe en GPU consumer: previsiblemente si en RTX 4090 (24 GB) y RTX 4080 (16 GB) en FP16, segun la estimacion por tamano; no confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=tarunmatta/pi05_black_box_ft`), integracion con el ecosistema Hugging Face; no se documenta soporte explicito de vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput estimados: no disponibles. La model card solo indica que el rollout puede ejecutarse con `--duration=60` y camaras a 30 FPS de captura, sin cifras de latencia de politica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tarunmatta/pi05_black_box_ft | 4.143.404.816 | no disponible | Pick up the black box (so_follower) | gemma | Hugging Face (21 descargas) |
| lerobot/pi05_base | no disponible en la informacion | no disponible | VLA generalista π₀.₅ | no disponible en la informacion | Hugging Face (modelo base) |
| π₀ (Pi0) de Physical Intelligence | no disponible en la informacion | no disponible | VLA generalista previo a π₀.₅ | no disponible en la informacion | OpenPI (open source) |
| SmolVLA (referenciado en el nombre del dataset) | no disponible en la informacion | no disponible | VLA ligero para robotica | no disponible en la informacion | LeRobot / Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros conocidos, licencia y disponibilidad.

## Limitaciones y advertencias

- Especializacion extrema: entrenado unicamente para la tarea "Pick up the black box" con 40 episodios; no generaliza a otras tareas sin fine-tuning adicional.
- Sin evaluacion publicada: no hay tasas de exito en robot real, por lo que se desconoce la fiabilidad en produccion.
- Dataset pequeno y de un solo operador/entorno: 8848 fotogramas a 10 FPS implican riesgo de sobreajuste a posiciones, iluminacion y disposicion de camaras del dataset original.
- Dependencia de hardware concreto: la politica espera el robot `so_follower` y las features de observacion exactas (`observation.images.base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`, `empty_camera_0`, `observation.state` de 32 dimensiones); cambiar camaras o robot invalida el modelo.
- Inconsistencia en la model card: la seccion "Model Details" menciona camaras `wrist` y `left`, mientras que la tabla de inputs lista cuatro features visuales; conviene verificar los nombres exactos antes del rollout.
- Licencia Gemma: sujeta a los terminos de la licencia Gemma de Google, con posibles restricciones para uso comercial; revisar antes de desplegar en producto.
- Riesgo de alucinacion en el sentido de acciones incorrectas o inseguras: como toda politica de imitacion, puede producir movimientos no validos ante distribuciones fuera de entrenamiento; requiere parada de emergencia y supervision.
- Sin datos de cuantizacion ni de contexto: no se puede planificar despliegue en edge o en GPUs de muy baja VRAM sin pruebas empiricas.
- Idiomas no disponibles: no es un modelo de texto; no aplica soporte multilingue.
- Fecha de creacion futura (2026-11-13): metadato anomalo del repositorio; verificar integridad de los pesos antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tarunmatta/pi05_black_box_ft
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/tarunmatta/pick_up_black_box_smolvla
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=tarunmatta/pick_up_black_box_smolvla
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
