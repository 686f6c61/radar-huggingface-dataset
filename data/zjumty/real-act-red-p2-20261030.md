# zjumty/real-act-red-p2-20261030

## Resumen

`real-act-red-p2-20261030` es una política de control robótico entrenada con el algoritmo ACT (Action Chunking Transformer) sobre el brazo seguidor SO101. El modelo lo publica el usuario zjumty en HuggingFace y resuelve una tarea de manipulación muy concreta: introducir un cubo rojo en un cuenco de papel sobre una mesa. Es, por tanto, un artefacto de investigación aplicada a robótica, no un modelo de lenguaje, y su interés radica en que documenta de forma transparente el pipeline completo de LeRobot (dataset, configuración, pesos y estadísticas de normalización) para una tarea física reproducible.

La arquitectura es un transformer de chunking de acciones con backbone visual ResNet18, 51,7 millones de parámetros y un horizonte de predicción de 100 pasos de acción. El entrenamiento se hizo sobre 133 episodios y 36.802 fotogramas capturados con dos cámaras RGB (muñeca y lateral) a 640×480 y 20 fps, más seis posiciones articulares como observación. El checkpoint publicado es el final de 100.000 pasos.

Es relevante ahora porque ejemplifica el flujo de trabajo "dataset local fusionado → entrenamiento ACT → política desplegable en hardware de bajo coste" que se está extendiendo en robótica open source. Conviene subrayar que el propio autor advierte que no hay partición de evaluación independiente ni tasa de éxito validada, y que no se ha especificado licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con backbone visual ResNet18 |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (horizonte de acción de 100 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible (el autor indica que no ha especificado licencia) |
| Formato de pesos | safetensors (`model.safetensors`), con configuraciones JSON de política, entrenamiento y pre/postprocesado |
| Pipeline | robotics |
| Librería | lerobot |
| Tamaño del repositorio | 0,2 GB |
| Entradas | 2 cámaras RGB 640×480 a 20 fps (muñeca y lateral) + 6 posiciones articulares |
| Salidas | 6 objetivos de posición articular: shoulder_pan, shoulder_lift, elbow_flex, wrist_flex, wrist_roll, gripper |
| Dataset de entrenamiento | zjumty/real-cube-bowl-red-p2-merged-20261030 (133 episodios, 36.802 fotogramas) |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder que predice un chunk de acciones futuras en lugar de una acción por paso, lo que reduce el error de compounding y suaviza el control. En esta implementación el encoder consume las observaciones visuales procesadas por una ResNet18 preentrenada junto con el estado articular, y el decodificador genera 100 pasos de acción con un chunk size de 100. El entrenamiento usó batch size 8, semilla 1000, optimizador AdamW con learning rate 1e-5 y aumentación de imagen, durante 100.000 pasos.

El dataset es una fusión local de tres conjuntos de demostraciones (`real-cube-bowl-red-clean-20261028`, `real-cube-bowl-p2-red-20261030` y `real-cube-bowl-p2-red-extra-20261030`), todos asignados a entrenamiento y sin split de validación. El vídeo está codificado en AV1 sin audio. No se documenta uso de RLHF, DPO ni fine-tuning por refuerzo: es imitación supervisada pura sobre demostraciones teleoperadas. El repositorio incluye las estadísticas de normalización y los pre/postprocesadores necesarios para reproducir la inferencia en un entorno LeRobot compatible; el `train_config.json` conserva rutas locales como procedencia.

## Capacidades

- Control de manipulación robótica de una sola tarea: colocar un cubo rojo en un cuenco de papel con el brazo SO101.
- Predicción de chunks de 100 acciones articulares a partir de observaciones visuales y propioceptivas.
- Fusión de dos vistas RGB (muñeca y lateral) para estimación de pose relativa objeto-efector.
- Generación de trayectorias suaves de 6 grados de libertad (5 articulaciones + pinza) a partir de posición, sin control de par ni de velocidad explícito.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni diálogo.
- No tiene capacidades multilingües, de visión general, audio ni modo "thinking".
- Carga mediante `ACTPolicy.from_pretrained` en LeRobot.

## Casos de uso

- Reproducción de la tarea de pick-and-place en un banco de laboratorio: sirve como referencia para validar que la cadena LeRobot + SO101 + cámaras 640×480 funciona antes de entrenar tareas propias.
- Punto de partida para fine-tuning con demostraciones adicionales: al ser un checkpoint ACT estándar, se puede reentrenar con un dataset propio manteniendo la arquitectura y el pipeline de normalización.
- Estudio de la variabilidad entre episodios en imitación: útil para analizar cómo afecta la fusión de tres datasets de demostración al comportamiento final, dado que el autor documenta las fuentes.
- Docencia en robótica de manipulación: ejemplo completo y de tamaño reducido (0,2 GB) para explicar action chunking, backbone visual y normalización de observaciones.
- Benchmark interno de infraestructura de inferencia robótica: permite medir latencia de política y throughput de cámaras en un robot de bajo coste antes de escalar a tareas más complejas.
- Base para experimentos de robustez ante cambios de iluminación o posición de cámara, comparando el rendimiento del checkpoint con y sin esas variaciones (siempre con supervisión y recalibración).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la generalización y una tasa de éxito validada de forma independiente no están establecidas en esta publicación, y que no existe split de evaluación reservado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y un backbone ResNet18, la huella en FP32 ronda los 0,2 GB de pesos, por lo que cualquier GPU consumer con 4 GB o más debería alojarla junto con los buffers de imagen.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3060/4060 o superior es suficiente; para entrenamiento se recomienda al menos una RTX 3090/4090 o A100 si se busca throughput alto.
- Cabe en GPU consumer: sí, por el reducido número de parámetros; el cuello de botella real será el pipeline de vídeo y la latencia del bus del robot, no la memoria.
- Opciones de despliegue: LeRobot (`ACTPolicy.from_pretrained`), con el runtime de pre/postprocesado incluido en el repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. El control se grabó a 20 fps, lo que fija una cota superior práctica de 50 ms por ciclo de observación-acción, pero no se publican mediciones de latencia de la política.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| real-act-red-p2-20261030 | ACT + ResNet18 | 51,7 M | 100 pasos de acción | no disponible | HuggingFace (0 descargas, 0 likes) |
| Políticas ACT genéricas de LeRobot | ACT | variable | variable | según repositorio | HuggingFace Hub |
| Políticas Diffusion Policy | difusión sobre acciones | variable | variable | según repositorio | HuggingFace Hub |
| Políticas VLA tipo RT-2/OpenVLA | transformer visión-lenguaje-acción | miles de millones | variable | según repositorio | HuggingFace Hub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a arquitectura, tamaño y licencia.

## Limitaciones y advertencias

- No hay licencia especificada: la disponibilidad pública no concede permiso de uso, incluido el comercial. Es imprescindible contactar con el autor antes de cualquier despliegue.
- El modelo está sobreajustado a un robot, calibración, colocación de cámaras y mesa concretos; no se ha demostrado generalización a otras configuraciones.
- No existe split de evaluación reservado ni tasa de éxito validada de forma independiente; el rendimiento real en el robot es desconocido a partir de la documentación.
- Riesgo de fallo silencioso en producción: al ser imitación supervisada sin verificación de éxito, el robot puede ejecutar trayectorias plausibles pero incorrectas.
- Requiere calibración y supervisión humana durante la ejecución; el autor lo advierte explícitamente.
- No se publican checkpoints intermedios, estado del optimizador ni grabaciones de evaluación, lo que dificulta la reproducibilidad completa.
- El `train_config.json` conserva rutas locales de entrenamiento, lo que puede complicar la carga en entornos distintos si no se ajustan las rutas.
- Sesgos conocidos: no documentados; en robótica de imitación los sesgos provienen de la distribución de demostraciones (posiciones, iluminación, operador), no aplicables aquí los sesgos lingüísticos habituales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zjumty/real-act-red-p2-20261030
- Dataset de entrenamiento: https://huggingface.co/datasets/zjumty/real-cube-bowl-red-p2-merged-20261030
- LeRobot (librería): https://github.com/huggingface/lerobot
- Documentación de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Paper original de ACT (Action Chunking with Transformers): https://arxiv.org/abs/2304.13705
