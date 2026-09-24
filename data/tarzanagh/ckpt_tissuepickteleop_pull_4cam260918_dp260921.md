# tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_dp260921

## Resumen

Este repositorio contiene una política de imitación robótica basada en Diffusion Policy, entrenada por el usuario tarzanagh (publicada en septiembre de 2026) para una tarea de manipulación bimanual y diestra: un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1 sujeta una caja de pañuelos con la mano izquierda y extrae un pañuelo con la derecha. El checkpoint forma parte de una campaña de 24 ejecuciones sobre la misma tarea que compara cuatro familias de políticas (ACT, Diffusion Policy, GR00T y pi0.5), con y sin entrada táctil. Es, por tanto, un artefacto de investigación orientado a comparar arquitecturas de aprendizaje por imitación sobre una misma tarea física, no un modelo de propósito general.

El modelo tiene 267.483.430 parámetros (~267,5 M) almacenados en safetensors, con un repositorio de 1,1 GB. Predice directamente posiciones articulares de 38 dimensiones (7 de brazo izquierdo, 12 de mano izquierda, 7 de brazo derecho y 12 de mano derecha) a partir de cuatro cámaras RGB a 640x360 y 30 fps. Los datos provienen de teleoperación con guante Meta (sin exoesqueleto) y seguimiento de muñeca con Vive, con 120 episodios repartidos en 108 de entrenamiento y 12 de validación.

Su relevancia es metodológica más que de producto: la model card publica explícitamente el error de seguimiento en bucle abierto comparado con una línea base trivial (mantener el primer frame) y reporta que la entrada táctil no aportó diferencias por encima del ruido en ninguna de las combinaciones evaluadas, y que GR00T obtuvo el menor error en todas las tareas. Estos resultados negativos y comparativos son útiles para quien evalúe arquitecturas de manipulación diestra bimanual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política de difusión para imitación robótica; el backbone concreto no se detalla en la model card) |
| Parametros totales | 267.483.430 (~267,5 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; en la práctica la política observa la observación real cada 16 pasos y predice un chunk de acciones, del que conserva las 16 primeras |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplica / no disponible (modelo de robótica, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimensionalidad de estado/accion | 38-D: [L_arm 7 | L_hand 12 | R_arm 7 | R_hand 12], posiciones articulares |
| Entrada sensorial | 4 cámaras RGB, 640x360 a 30 fps |
| Hardware objetivo | DexMate Vega-1 con dos manos RobotEra XHand1 |
| Teleoperación | Guante Meta (sin exoesqueleto) + seguimiento de muñeca con Vive |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

La política sigue el paradigma de Diffusion Policy: en lugar de mapear observación a acción de forma directa, aprende a generar muestras de una distribución de acciones mediante un proceso de difusión, lo que permite representar multimodalidad en los datos de demostración (por ejemplo, distintas formas válidas de agarrar o tirar). El modelo produce un chunk de acciones a partir de las cuatro vistas RGB; el sistema ejecuta la observación real cada 16 pasos y conserva las 16 primeras acciones predichas, un esquema típico de control por chunks con re-planificación periódica. La model card no especifica el número de pasos de difusión, el tipo de encoder visual ni la configuración exacta del ruido.

El entrenamiento se realizó durante 10.000 pasos con semilla 1000 sobre 120 episodios de teleoperación (108 de entrenamiento y 12 de validación, reservando cada décimo episodio). La tarea es bimanual y diestra: la mano izquierda estabiliza la caja y la derecha extrae el pañuelo. La model card indica que se evaluaron cuatro familias de políticas cruzadas con tres tareas y que la inclusión de señal táctil no produjo mejoras por encima del ruido, lo que sugiere que, con este volumen de datos, la información visual fue suficiente para el ajuste observado. No se documenta uso de RLHF, DPO ni etapas de ajuste por refuerzo, algo esperable en un pipeline de aprendizaje por imitación.

## Capacidades

- Generación de trayectorias de acción continuas de 38 dimensiones (brazos y manos, ambas extremidades) mediante difusión.
- Control bimanual coordinado: sujeción con una mano y manipulación con la otra en la misma política.
- Manipulación diestra con manos XHand1, incluyendo articulaciones de dedos (12 grados de libertad por mano en el vector de estado/acción).
- Percepción multi-vista a partir de cuatro cámaras RGB simultáneas.
- Aprendizaje por imitación a partir de demostraciones de teleoperación, sin recompensa explícita.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es una política de control, no un modelo de lenguaje.
- No tiene capacidades multilingües ni de generación de texto.
- No se documenta capacidad de transferencia a otras tareas, robots u objetos distintos de los del conjunto de entrenamiento.

## Casos de uso

- Extracción de pañuelos de una caja con sujeción bimanual: es exactamente la tarea para la que se entrenó el checkpoint; el modelo coordina la mano izquierda como anclaje y la derecha como actuador.
- Línea base de comparación en investigación de manipulación diestra: sirve para contrastar Diffusion Policy frente a ACT, GR00T y pi0.5 sobre el mismo conjunto de 120 episodios y el mismo vector de 38 dimensiones.
- Estudio del aporte de la señal táctil: dado que la model card reporta que la entrada táctil no cambió los resultados más allá del ruido, este checkpoint (sin táctil) es el control natural frente a su variante `dptactile`.
- Recolección y reutilización de datos de teleoperación con guante Meta: el pipeline de datos (4 cámaras, 30 fps, 120 episodios) puede reutilizarse para entrenar variantes o ampliar el conjunto.
- Evaluación de robustez de políticas de difusión en tareas de contacto: la interacción con una caja y un material flexible (pañuelo) es un escenario útil para medir el comportamiento en contacto rico.
- Prototipado de control por chunks a 16 pasos: el esquema de observar cada 16 pasos y ejecutar el primer bloque es replicable en otros pipelines de control para estudiar latencias y frecuencias de re-planificación.
- Docencia y reproducción de resultados en robótica: al ser un artefacto pequeño (~267 M de parámetros, 1,1 GB) y con licencia Apache 2.0, es adecuado para reproducir experimentos comparativos en laboratorio.

## Benchmarks y rendimiento

La model card publica error de seguimiento en bucle abierto sobre los 12 episodios de validación (media de |predicción − acción registrada|, en radianes, ± error estándar de la media, n=12):

| Modelo | L-arm | L-hand | R-arm | R-hand |
|---|---|---|---|---|
| Este modelo (dp260921) | 0,0171 ± 0,0010 | 0,0199 ± 0,0024 | 0,0430 ± 0,0012 | 0,0288 ± 0,0018 |
| hold-first-frame (línea base) | 0,1975 | 0,0514 | 0,2628 | 0,1440 |

Advertencias sobre estas cifras, tal como las recoge el propio autor: miden seguimiento de trayectoria, no éxito de la tarea, y ninguna prueba se ejecutó sobre hardware real. Además, la model card indica que, en el conjunto de cuatro familias por tres tareas, la entrada táctil no supuso diferencia más allá del ruido y que GR00T obtuvo el menor error en todas las tareas. No se publican MMLU, HumanEval, GSM8K ni métricas de lenguaje, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 267,5 M de parámetros ocupan aproximadamente 1,07 GB; en fp16/bf16, unos 535 MB. A esto hay que sumar el encoder visual de las cuatro cámaras, el estado del optimizador si se reentrena y los buffers de difusión, por lo que una reserva práctica de 4-8 GB es razonable.
- GPU recomendadas: cualquier GPU con al menos 8 GB es suficiente para inferencia; una RTX 3060, RTX 4060 Ti o superior bastan. Para reentrenamiento, una RTX 4090 o A100 acortan los 10.000 pasos de entrenamiento. No se especifican requisitos oficiales en la model card.
- Cabe en GPU de consumo: sí, holgadamente, dado el tamaño del modelo. Es probable que también quepa en aceleradores embebidos tipo Jetson, aunque no hay confirmación en la información disponible.
- Opciones de despliegue: no aplican servidores de LLM como vLLM, TGI o llama.cpp. El despliegue típico de una Diffusion Policy es un runtime de PyTorch con bucle de control propio, integrado con el stack del robot (ROS/ROS 2 o el middleware del fabricante) y con captura sincronizada de las cuatro cámaras.
- Latencia y throughput: no disponibles. La latencia vendrá dominada por el número de pasos de difusión y por el encoder visual, que no se documentan.

## Comparativa con modelos similares

La model card referencia 24 ejecuciones sobre esta misma tarea, agrupadas en cuatro familias de políticas. La comparación cuantitativa disponible se limita al error en bucle abierto de este checkpoint; para el resto solo se indica que GR00T logró el menor error en todas las tareas evaluadas.

| Modelo | Familia | Parametros | Entrada tactil | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp260921 (este) | Diffusion Policy | 267,5 M | No | apache-2.0 | Público en HuggingFace |
| dptactile260921 | Diffusion Policy | No disponible | Sí | apache-2.0 | Público en HuggingFace |
| act260921 / acttactile260921 | ACT | No disponible | No / Sí | apache-2.0 | Público en HuggingFace |
| gr00t3b260921 / gr00t3btactile260921 | GR00T (~3 B según el nombre) | ~3 B | No / Sí | No disponible | Público en HuggingFace |
| pi05260921 / pi05tactile260921 | pi0.5 | No disponible | No / Sí | No disponible | Público en HuggingFace |

Según la model card, GR00T obtuvo el error más bajo en las tres tareas comparadas, mientras que el aporte de la entrada táctil no superó el nivel de ruido en ninguna familia. No se dispone de cifras desglosadas por modelo en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte de que las métricas publicadas miden seguimiento de trayectoria en bucle abierto, no éxito de tarea, y que no se ejecutó nada sobre hardware real.
- El modelo está entrenado para una única tarea (extraer un pañuelo de una caja) con un robot concreto (DexMate Vega-1 con dos manos RobotEra XHand1); no se documenta generalización a otros objetos, robots o configuraciones.
- La dimensionalidad de acción es fija en 38-D con esa distribución exacta de articulaciones; cualquier cambio en el robot o en el número de grados de libertad invalida el modelo.
- Riesgo de sobreajuste al conjunto reducido: 108 episodios de entrenamiento y 10.000 pasos con una única semilla (1000). No hay evidencia de robustez a cambios de iluminación, posición de cámara u oclusiones.
- La política no incluye razonamiento simbólico, planificación de alto nivel ni detección de fallos; requiere un sistema externo para supervisión y recuperación.
- Con 120 episodios, la cobertura de la distribución de estados es limitada; los errores en bucle abierto en el brazo derecho (0,0430 rad) son notablemente superiores a los del izquierdo (0,0171 rad), lo que sugiere un desequilibrio en la calidad de aprendizaje entre extremidades.
- No hay idiomas, sesgos lingüísticos ni alucinación textual que evaluar, pero sí existe el equivalente en robótica: acciones plausibles pero incorrectas físicamente, sin señal de confianza asociada.
- La licencia Apache 2.0 permite uso comercial, pero los componentes de terceros (GR00T, pi0.5, controladores del robot, guante Meta, Vive) pueden tener licencias propias que no se documentan aquí.
- No se detallan requisitos de seguridad para operar el robot; la ejecución de una política de manipulación diestra sobre hardware real exige medidas de parada de emergencia y limitación de fuerzas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_dp260921
- Variante ACT: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_act260921
- Variante ACT con táctil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_acttactile260921
- Variante Diffusion Policy con táctil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_dptactile260921
- Variante GR00T 3B: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_gr00t3b260921
- Variante GR00T 3B con táctil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_gr00t3btactile260921
- Variante pi0.5: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_pi05260921
- Variante pi0.5 con táctil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_pi05tactile260921
- Paper, blog o repositorio asociados: no disponibles en la información proporcionada.
