# whosricky/lw_benchhub_aug

## Resumen

`whosricky/lw_benchhub_aug` es un fine-tuning del modelo vision-language-action (VLA) SmolVLA, desarrollado por el usuario de Hugging Face `whosricky` a partir del checkpoint base `lerobot/smolvla_base`. No se trata de un modelo de lenguaje generalista, sino de una política robótica entrenada para controlar un robot bimanual de tipo `double_piper` con tres cámaras (mano izquierda, primera persona y mano derecha) y un estado propioceptivo de 6 dimensiones. El modelo consume observaciones multimodales y emite vectores de acción de 12 dimensiones, que corresponden a las articulaciones de ambos brazos.

SmolVLA es una arquitectura compacta de tipo VLA que combina un codificador visual, un modelo de lenguaje pequeño y un decodificador de acciones, diseñada explícitamente para ejecutarse en hardware de consumo. Este fine-tuning concreto se ha entrenado sobre el dataset `LightwheelAI/Lightwheel-Tasks-Double-Piper`, compuesto por 6500 episodios y más de 6 millones de fotogramas a 50 FPS, con tareas domésticas de manipulación (cocina, cajones, microondas, apilado de objetos). El resultado es una política especializada en un entorno y una morfología de robot concretos.

La relevancia de esta ficha radica en que ejemplifica el flujo actual de trabajo en robótica con modelos fundacionales: partir de un VLA base preentrenado y afinarlo con datos teleoperados propios para una tarea y un robot específicos. El modelo tiene 450 millones de parámetros, licencia Apache 2.0 y se distribuye en formato safetensors a través de la librería LeRobot, lo que facilita su integración en pipelines de entrenamiento e inferencia robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA; codificador visual + modelo de lenguaje + decodificador de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de texto general) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | double_piper |
| Cámaras de entrada | left_hand, first_person, right_hand |
| Dimensión de estado | (6,) |
| Dimensión de acción | (12,) |
| Resolución de imagen | 256 x 256 x 3 por cámara |
| Dataset de entrenamiento | LightwheelAI/Lightwheel-Tasks-Double-Piper |
| Episodios de entrenamiento | 6500 |
| Fotogramas de entrenamiento | 6.010.166 |
| Frecuencia de los datos | 50 FPS |
| Tamaño del repositorio | 0,9 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción compacto. La arquitectura combina un codificador de imágenes que procesa tres vistas simultáneas a 256x256 píxeles, un backbone de lenguaje de pequeño tamaño que fusiona la instrucción textual con las representaciones visuales, y una cabeza de decodificación que produce directamente el vector de acción de 12 dimensiones. El modelo está pensado para inferencia de baja latencia en hardware asequible, lo que lo diferencia de VLA de mayor tamaño que requieren GPUs de datacenter. La información proporcionada no detalla el número exacto de capas, dimensión oculta ni el modelo de lenguaje subyacente.

El entrenamiento de este checkpoint parte de `lerobot/smolvla_base` y se realiza por fine-tuning supervisado sobre el dataset `LightwheelAI/Lightwheel-Tasks-Double-Piper`, que contiene 6500 episodios y 6.010.166 fotogramas a 50 FPS. Las tareas cubren manipulación doméstica: encender el fogón y colocar la cafetera, abrir y cerrar cajones, meter objetos en el microondas, apilar cuencos, colocar tazas en platos y poner productos en una cesta. No se especifica en la información disponible si hubo RLHF, DPO ni qué proporción de datos sintéticos o reales compone el dataset. Tampoco se documentan innovaciones técnicas adicionales más allá de las propias de SmolVLA.

## Capacidades

- Control robótico bimanual: genera acciones de 12 dimensiones para un robot `double_piper` a partir de observaciones de estado y tres cámaras.
- Percepción visual multivista: procesa simultáneamente las vistas de mano izquierda, primera persona y mano derecha a 256x256.
- Ejecución de instrucciones en lenguaje natural: el modelo base SmolVLA acepta instrucciones textuales de tarea, aunque la model card de este fine-tuning no documenta explícitamente el prompt de cada tarea.
- Manipulación de objetos domésticos: apertura y cierre de cajones y microondas, colocación de objetos en platos, cestas y estantes, apilado de cuencos y activación de fogones.
- Política de imitación: aprende de demostraciones teleoperadas y generaliza dentro de la distribución de tareas del dataset.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual general, visión de propósito general ni audio.

## Casos de uso

- Automatización de cocina doméstica: el modelo puede ejecutar secuencias como encender el fogón y colocar la cafetera encima, o introducir tazas en el microondas y cerrarlo, usando las tres vistas para localizar los objetos y el estado propioceptivo para coordinar ambos brazos.
- Manipulación de cajones y armarios: tareas de apertura, cierre y colocación de objetos en cajones superior e inferior, útiles para prototipos de robots de asistencia en el hogar que deban interactuar con mobiliario estándar.
- Clasificación y colocación de productos: poner latas, quesos, mantequilla o salsas en una cesta o bandeja, adecuado para líneas de empaquetado ligeras o demostraciones de logística de almacén.
- Apilado y organización de vajilla: apilar cuencos y colocar tazas en platos, aplicable a tareas de recogida de mesa en entornos de restauración o domésticos.
- Investigación en aprendizaje por imitación: sirve como checkpoint de referencia para comparar estrategias de fine-tuning de SmolVLA sobre un robot bimanual concreto y un dataset de 6500 episodios.
- Evaluación de políticas VLA en benchmark: el nombre del repositorio (`lw_benchhub_aug`) sugiere su uso como política candidata en un banco de pruebas de manipulación; puede emplearse para medir tasa de éxito en las tareas del dataset Lightwheel.
- Prototipado de robots de servicio: al caber en hardware de consumo y tener licencia Apache 2.0, es adecuado para iterar rápidamente en laboratorios con presupuesto limitado antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 millones de parámetros en safetensors, el peso en precisión nativa (probablemente fp32 o bf16) ocupa entre 0,9 y 1,8 GB; en fp16/bf16 se estima alrededor de 1 GB de pesos, más overhead de activaciones y cámaras.
- GPU recomendadas: al tratarse de un modelo diseñado para hardware de consumo, es viable en RTX 3060, RTX 4060, RTX 4090 y GPUs integradas con suficiente memoria; también en A100 o H100 si se busca máximo throughput.
- Cabe en GPU de consumo: sí, según la propia descripción de SmolVLA como modelo desplegable en hardware de consumo; el repositorio pesa 0,9 GB.
- Opciones de despliegue: LeRobot (librería nativa), con soporte de inferencia en robot real; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política de acciones.
- Latencia y throughput: no disponibles en la información proporcionada; dependerá de la GPU, del número de cámaras y de la frecuencia de control del robot (los datos se capturaron a 50 FPS).

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whosricky/lw_benchhub_aug | 450 M | VLA (SmolVLA fine-tuned) | 3 cámaras 256x256 + estado (6,) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | VLA base | multimodal, instrucciones | Apache 2.0 | Hugging Face |
| OpenVLA | no disponible en la información | VLA | visión + instrucción | no disponible | no disponible |
| π0 (pi-zero) | no disponible en la información | VLA | visión + instrucción | no disponible | no disponible |

La comparación cuantitativa con OpenVLA o π0 no puede completarse porque la información proporcionada no incluye sus especificaciones ni resultados. El comparable directo y verificable es `lerobot/smolvla_base`, del que este modelo es un fine-tuning especializado en el robot `double_piper` y el dataset Lightwheel.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada únicamente para el robot `double_piper` y las tareas del dataset Lightwheel; no generaliza a otras morfologías, cámaras ni entornos sin reentrenamiento.
- Dependencia de la configuración de sensores: espera exactamente tres cámaras con los nombres `left_hand`, `first_person` y `right_hand`, y un estado de 6 dimensiones; cualquier cambio en la configuración invalida el modelo.
- Riesgo de sobreajuste al dataset: con 6500 episodios de un conjunto acotado de tareas, la generalización a variaciones de iluminación, objetos o disposición es limitada.
- Sin datos de benchmarks: no hay evidencia publicada de tasa de éxito, por lo que no puede recomendarse para producción sin evaluación propia.
- Idiomas y contexto textual: no disponible; no es un modelo de lenguaje general y no debe usarse para tareas de texto.
- Sesgos: no documentados; en robótica, los sesgos provienen de la distribución de demostraciones (posiciones, objetos y entornos concretos).
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo base y el dataset pueden tener sus propias condiciones que conviene revisar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whosricky/lw_benchhub_aug
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/LightwheelAI/Lightwheel-Tasks-Double-Piper
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
