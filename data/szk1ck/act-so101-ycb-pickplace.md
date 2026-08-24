# szk1ck/act-so101-ycb-pickplace

## Resumen

El modelo `szk1ck/act-so101-ycb-pickplace` es una política de robótica basada en el método Action Chunking with Transformers (ACT), entrenada con la librería LeRobot de Hugging Face. ACT es un enfoque de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación robótica. El autor, szk1ck, ha entrenado esta política para el brazo robótico SO-101 en la tarea de pick and place, utilizando un dataset propio de 20.000 episodios teleoperados.

El modelo procesa observaciones visuales de dos cámaras (frontal y de muñeca) junto con el estado del robot (6 dimensiones) y genera acciones de 6 dimensiones. Con aproximadamente 51,7 millones de parámetros, es un modelo compacto que cabe en GPUs de consumo. Su relevancia radica en que demuestra cómo aplicar ACT con LeRobot a un robot concreto y a una tarea estándar de manipulación, sirviendo como referencia para desarrolladores e investigadores que trabajan con el ecosistema LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; procesa observaciones visuales y estado) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LeRobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que utiliza un transformer para predecir una secuencia de acciones futuras (un chunk) a partir de observaciones actuales. En este caso, la politica recibe como entrada el estado del robot (6 valores) y dos imagenes RGB de 480x640 píxeles (camara frontal y camara de muñeca), y produce una accion de 6 dimensiones. El modelo fue entrenado con LeRobot 0.6.2 sobre un dataset de 20.000 episodios teleoperados (10.442.705 frames a 50 FPS) para la tarea "pick_and_place". La configuracion de entrenamiento incluye 5.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se menciona el uso de RLHF ni DPO; es un entrenamiento puramente supervisado por imitacion.

## Capacidades

- Control robotico para tareas de pick and place: el modelo genera acciones de 6 dimensiones (probablemente posicion y orientacion del efector final) para manipular objetos.
- Percepcion visual multimodal: procesa simultaneamente dos camaras (frontal y de muñeca) con resolucion 480x640.
- Aprendizaje por imitacion: reproduce comportamientos teleoperados con un enfoque de action chunking, lo que reduce la acumulacion de errores frente a politicas de un solo paso.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento, evaluacion y despliegue de LeRobot (comandos `lerobot-rollout`, `lerobot-train`).
- No es un modelo de lenguaje: no soporta generacion de texto, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Automatizacion de tareas de pick and place en entornos industriales: el modelo puede ejecutar la tarea de forma autonoma en un brazo SO-101, reduciendo la intervencion manual en lineas de montaje o clasificacion de piezas.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar el efecto del action chunking en la estabilidad y tasa de exito de politicas roboticas, comparando con metodos de un solo paso.
- Desarrollo de prototipos en laboratorio: investigadores pueden cargar la politica en un SO-101 y evaluar su comportamiento en condiciones controladas, gracias a la integracion con LeRobot.
- Benchmarking de hardware: al ser un modelo compacto (51,7 M de parametros), permite medir la latencia y el throughput de inferencia en diferentes GPUs para aplicaciones de robotica en tiempo real.
- Formacion y educacion: el modelo y su dataset asociado (20.000 episodios) pueden usarse en cursos de robotica y aprendizaje automatico para demostrar el flujo completo de recopilacion de datos, entrenamiento y despliegue.
- Extension a nuevas tareas: aunque esta entrenado solo para pick and place, puede servir como base para fine-tuning en tareas similares de manipulacion con el mismo robot, aprovechando la arquitectura ACT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." Por tanto, no hay datos de tasa de exito, latencia ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,7 M de parametros; en precision fp32 ocupa aproximadamente 207 MB de pesos, y en fp16 unos 103 MB. Sin embargo, al procesar dos imagenes de 480x640, la VRAM total depende del batch y del pipeline de preprocesado. Con un batch de 1, una GPU con 4-6 GB de VRAM deberia ser suficiente.
- GPU recomendadas: cualquier GPU de consumo moderna con al menos 4 GB de VRAM, por ejemplo NVIDIA RTX 3060, RTX 4060 o superior. Para entrenamiento, se recomienda una GPU con 8-12 GB (p.ej. RTX 3080, RTX 4080) para acomodar el batch de 8 usado en el entrenamiento.
- Compatibilidad con GPU de consumo: si, cabe en GPUs consumer gracias a su tamano reducido.
- Opciones de despliegue: el flujo principal es mediante LeRobot (`lerobot-rollout`), que utiliza PyTorch. No se mencionan exportaciones a ONNX, TensorRT ni formatos cuantizados como GGUF. Para despliegue en tiempo real, se puede considerar la exportacion a TensorRT, aunque no esta documentada.
- Latencia y throughput: no se han publicado datos. Dado el tamano del modelo y la resolucion de entrada, se espera una inferencia rapida en GPUs modernas (del orden de milisegundos por paso), pero no hay cifras oficiales.

## Comparativa con modelos similares

No hay modelos directamente comparables en la informacion disponible. ACT es un metodo generico, y existen multiples politicas entrenadas con LeRobot para distintos robots y tareas, pero no se dispone de datos de rendimiento ni especificaciones de modelos alternativos en la misma categoria (mismo robot y tarea). Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta entrenado exclusivamente para la tarea "pick_and_place" en el robot SO-101. No generaliza a otras tareas sin reentrenamiento.
- Dependencia de la configuracion hardware: las observaciones de las camaras (posicion, angulo, iluminacion) y el puerto del robot deben coincidir con las condiciones de entrenamiento. Cambios en la configuracion pueden degradar el rendimiento.
- Sin evaluacion publicada: no hay datos de tasa de exito ni pruebas en el robot real, por lo que su fiabilidad en produccion es desconocida.
- Sesgos y alucinaciones: al ser un modelo de control motor, no aplican sesgos linguisticos ni alucinaciones tipicas de LLMs. Sin embargo, puede presentar comportamientos erraticos ante observaciones fuera de la distribucion de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el dataset asociado (szk1ck/so101-ycb-pickplace) puede tener sus propias condiciones; se recomienda revisarlas antes de un uso comercial.
- Fecha de creacion: el modelo fue creado en agosto de 2026 y no tiene descargas ni likes, lo que sugiere que es reciente y aun no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/szk1ck/act-so101-ycb-pickplace
- Dataset de entrenamiento: https://huggingface.co/datasets/szk1ck/so101-ycb-pickplace
- Demo del modelo: https://huggingface.co/szk1ck/act_so101_demo
- Video de demostracion en YouTube: https://www.youtube.com/watch?v=oDDR4Vwr4Uo
- Paper de ACT (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
