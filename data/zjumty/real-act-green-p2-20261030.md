# zjumty/real-act-green-p2-20261030

## Resumen

`zjumty/real-act-green-p2-20261030` es una política de robótica basada en ACT (Action Chunking with Transformers) entrenada con LeRobot para controlar un brazo seguidor SO101. El modelo resuelve una tarea concreta de manipulación: introducir un cubo verde en un cuenco de papel. Lo desarrolla el usuario zjumty y se publica como checkpoint final tras 100.000 pasos de entrenamiento sobre un conjunto de demostraciones reales.

La arquitectura es ACT, un transformer con backbone visual ResNet18 que predice trozos de acciones (action chunks) de 100 pasos a partir de observaciones multimodales: dos cámaras RGB (muñeca y lateral, 640 × 480 a 20 fps) y seis posiciones articulares. El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras ejecutables en hardware de consumo.

Su relevancia es acotada y muy específica: no es un modelo de propósito general, sino un artefacto de investigación reproducible para una celda robótica concreta (robot, calibración, disposición de cámaras y mesa determinados). Resulta útil como referencia para quienes trabajan con LeRobot y SO101, pero no establece generalización ni tasa de éxito validada de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone visual ResNet18 |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje; ventana de observación definida por la configuración de ACT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (el autor no ha especificado licencia) |
| Formato de pesos | safetensors (`model.safetensors`) con configuraciones de política, entrenamiento y pre/postprocesado |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación robótica que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación y suaviza el control. En esta release se emplea un backbone visual ResNet18 para procesar las dos cámaras RGB (muñeca y lateral) junto con seis posiciones articulares como observación. La cabeza de acción emite objetivos de posición para seis articulaciones: `shoulder_pan`, `shoulder_lift`, `elbow_flex`, `wrist_flex`, `wrist_roll` y `gripper`. El chunk de acciones es de 100 pasos y se configuran 100 action steps.

El entrenamiento usó el dataset `zjumty/real-cube-bowl-green-p2-merged-20261030`, con 133 episodios y 44.794 fotogramas, todos asignados a entrenamiento sin split de evaluación reservado. El conjunto es una fusión local de `real-cube-bowl-merged-20261028`, `real-cube-bowl-p2-green-20261030` y `real-cube-bowl-p2-green-extra-clean-20261030`; se excluyó el episodio de índice 2 de `real-cube-bowl-p2-green-extra-20261030` por contener un reintento de agarre (regrasp). Hiperparámetros: batch size 8, semilla 1000, optimizador AdamW con learning rate 1e-5 y aumento de imagen. No se documenta RLHF, DPO ni etapas de refinamiento posteriores; es imitación supervisada pura sobre demostraciones.

## Capacidades

- Control robótico de manipulación: genera trayectorias de seis articulaciones para la tarea de introducir un cubo verde en un cuenco de papel con el brazo SO101.
- Percepción multimodal: procesa simultáneamente dos flujos RGB (muñeca y lateral) a 640 × 480 y 20 fps, más el estado articular.
- Predicción por chunks: emite bloques de 100 acciones, lo que aporta continuidad temporal en el control.
- Entrada de estado propioceptivo: consume seis posiciones articulares como parte de la observación.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, código, matemáticas, visión general, audio ni capacidades multilingües: es una política de imitación específica de tarea, no un modelo fundacional.

## Casos de uso

- Reproducción de experimentos en LeRobot: cargar la política con `ACTPolicy.from_pretrained` y ejecutarla en un SO101 calibrado para replicar la tarea del cubo verde; adecuado porque el checkpoint y las configuraciones de pre/postprocesado están incluidos en el repositorio.
- Referencia de entrenamiento ACT: usar los hiperparámetros publicados (batch 8, lr 1e-5, chunk 100, ResNet18) como línea base para entrenar políticas propias sobre tareas de pick-and-place con SO101.
- Docencia y formación en imitación robótica: sirve como ejemplo completo de pipeline LeRobot (dataset, entrenamiento, checkpoint, carga) con un caso acotado y verificable.
- Evaluación de infraestructura de inferencia robótica: por su tamaño (51,7 M de parámetros, 0,2 GB) permite medir latencia y throughput en GPUs de consumo antes de escalar a políticas mayores.
- Punto de partida para fine-tuning: al estar los pesos en safetensors y las configuraciones separadas, puede adaptarse a variantes de la misma celda (otro objeto, otra posición de cuenco) con nuevas demostraciones.
- Estudio de robustez ante cambios de calibración y cámara: útil para analizar cómo degrada una política ACT cuando varían las condiciones respecto al entorno registrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la generalización y una tasa de éxito validada de forma independiente no están establecidas en esta release, y que no existe split de evaluación reservado en el dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que la huella de memoria es muy reducida y el cuello de botella será el preprocesado de imagen (dos cámaras a 640 × 480 y 20 fps).
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM libre es suficiente en teoría, aunque no hay cifras publicadas de latencia ni throughput.
- GPU de consumo: por el tamaño del modelo, es plausible que quepa en GPUs consumer (por ejemplo, RTX 3060 o superiores), pero no hay validación publicada al respecto.
- Opciones de despliegue: LeRobot con `lerobot.policies.act.modeling_act.ACTPolicy`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. La ejecución requiere calibración adecuada del robot y supervisión.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zjumty/real-act-green-p2-20261030 | ACT + ResNet18 | 51.668.614 | chunk de 100 acciones | no disponible | Hugging Face (LeRobot) |
| Otras políticas ACT en LeRobot | ACT | variable | variable | variable | Hugging Face (LeRobot) |
| Políticas tipo Diffusion Policy | difusión | variable | variable | variable | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a arquitectura, tamaño y disponibilidad.

## Limitaciones y advertencias

- Especificidad total al entorno: los artefactos están ligados al robot concreto, la calibración, la colocación de cámaras y la tarea de sobremesa registrados; no hay evidencia de generalización.
- Sin tasa de éxito validada: no existe split de evaluación reservado ni validación independiente publicada.
- Licencia ausente: el autor no ha especificado licencia; la disponibilidad pública no concede por sí sola derechos de uso, incluido el comercial.
- Riesgo de fallo en ejecución real: requiere calibración correcta y supervisión; el propio autor advierte de ello.
- Dataset pequeño y sesgado: 133 episodios y 44.794 fotogramas de una única tarea, con posible sobreajuste a las condiciones registradas.
- Sin capacidades de lenguaje ni razonamiento: no debe evaluarse con métricas de MMLU, HumanEval o GSM8K.
- Exclusiones del release: no se incluyen checkpoints intermedios, estado del optimizador ni grabaciones de evaluación, lo que limita la reproducibilidad completa del entrenamiento.
- El `train_config.json` conserva rutas locales de entrenamiento como procedencia; el dataset público enlazado es su contrapartida publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zjumty/real-act-green-p2-20261030
- Dataset de entrenamiento: https://huggingface.co/datasets/zjumty/real-cube-bowl-green-p2-merged-20261030
- LeRobot (librería): no disponible en la información proporcionada
- Paper de ACT: no disponible en la información proporcionada
- Demos o blogs: no disponible en la información proporcionada
