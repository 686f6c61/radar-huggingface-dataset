# twanghcmut/GR00T-N1.7-SO101-Multitask

## Resumen

GR00T-N1.7-SO101-Multitask es un ajuste fino del modelo visión-lenguaje-acción (VLA) NVIDIA Isaac GR00T N1.7 3B, publicado por el usuario twanghcmut. El modelo toma imágenes de dos cámaras RGB, el estado propioceptivo del brazo y una instrucción en lenguaje natural, y devuelve secuencias de acciones articulares para el brazo SO101 (5 articulaciones más pinza). Un único checkpoint cubre las tres tareas de manipulación del dataset de entrenamiento, en lugar de un modelo por tarea.

Técnicamente es un VLA construido sobre un backbone de lenguaje y visión congelado, al que se le entrenan únicamente el proyector y la cabeza de difusión: 1,62 B de los 3,144 B de parámetros totales. El ajuste se hizo sobre 143 episodios del dataset `hungho77/so101-multitask` durante 6000 pasos, con un lote global de 128 y una única GPU H100 de 80 GB en 8,6 horas, hasta una pérdida de entrenamiento final de 0,0168.

Su interés práctico es doble: por un lado, demuestra que adaptar un VLA generalista a un brazo robótico de bajo coste (SO101) es viable con un presupuesto de cómputo reducido; por otro, documenta de forma explícita sus límites, en particular la ausencia de split de validación, lo que convierte sus métricas en medidas de ajuste al dataset y no en tasas de éxito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en NVIDIA Isaac GR00T N1.7; backbone de lenguaje y visión congelado, con proyector y cabeza de difusión entrenables |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | No aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no se documentan variantes GGUF, INT8 o INT4) |
| Idiomas soportados | No disponible; las tres instrucciones de entrenamiento están en inglés y el modelo no fue entrenado con paráfrasis |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 12,6 GB) |
| Modelo base | nvidia/GR00T-N1.7-3B |
| Tarea (pipeline) | robotics |
| Libreria | lerobot |
| Encarnacion | SO101 follower arm, etiqueta `NEW_EMBODIMENT`; 5 articulaciones + pinza |
| Dimension estado/accion | 6 (shoulder_pan, shoulder_lift, elbow_flex, wrist_flex, wrist_roll, gripper) |
| Camaras | `top` (cenital) y `wrist`, RGB 480x640 |
| Horizonte de accion | 16 pasos |
| Frecuencia de los datos | 30 fps |

## Arquitectura y entrenamiento

El modelo sigue el esquema de NVIDIA Isaac GR00T N1.7: un backbone de visión y lenguaje que se mantiene congelado y una cabeza de difusión que genera las acciones, conectadas mediante un proyector entrenable. En este ajuste fino solo se actualizan proyector y cabeza, lo que suma 1,62 B de parámetros entrenables sobre los 3,14 B totales. Las acciones se representan de forma mixta: la componente `single_arm` es relativa (delta respecto al estado actual) y la `gripper` es absoluta; el servidor de políticas desnormaliza ambas, de modo que `get_action` devuelve siempre objetivos articulares absolutos. La observación se entrega en formato anidado (`video`, `state`, `language`), tal y como espera `Gr00tPolicy`.

El entrenamiento usó 143 episodios del dataset `hungho77/so101-multitask` repartidos en tres tareas: 50 episodios para `Pick up the banana and place it in the bot, then close the lid`, 49 para `Pick blue cube and place on red cube` y 44 para `Pick all cubes and place into cup`. Se ejecutaron 6000 pasos con lote global de 128, learning rate 1e-4 con schedule coseno y 5% de warmup, y weight decay 1e-5 sobre una H100 de 80 GB durante 8,6 horas. La pérdida final fue 0,0168, con la siguiente progresión por bloques de 500 pasos: 0,2711 → 0,0617 → 0,0500 → 0,0426 → 0,0369 → 0,0320 → 0,0286 → 0,0249 → 0,0221 → 0,0195 → 0,0175 → 0,0170. El último bloque solo mejoró 0,0004, señal de convergencia.

## Capacidades

- Generación de acciones motoras para el brazo SO101: 6 dimensiones de salida (5 articulaciones más pinza) con horizonte de 16 pasos a 30 fps.
- Política multimodal: consume simultáneamente dos cámaras RGB de 480x640 (cenital y de muñeca) y el estado propioceptivo del robot.
- Seguimiento de instrucciones en lenguaje natural, limitado a las tres frases exactas del entrenamiento.
- Multitarea real: un único checkpoint resuelve las tres tareas, seleccionando el comportamiento mediante la instrucción.
- Manipulación con contacto y cierre de contenedores: la tarea 0 incluye colocar un objeto en una caja y cerrar la tapa.
- Apilado y agrupación de objetos: la tarea 1 apila un cubo azul sobre uno rojo y la tarea 2 recoge todos los cubos en un vaso.
- No se documentan tool calling, function calling, razonamiento multi-paso, uso como agente, generación de texto general, matemáticas, código ni capacidades de audio.
- No se documentan capacidades multilingües: las instrucciones de entrenamiento están únicamente en inglés.

## Casos de uso

- Automatización de pick-and-place con SO101: el modelo ejecuta la secuencia de recoger un objeto y depositarlo en un contenedor con cierre de tapa, usando las cámaras cenital y de muñeca para localizar el objeto y el estado articular para cerrar el bucle.
- Apilado preciso de piezas: la tarea `Pick blue cube and place on red cube` requiere alinear el cubo azul sobre el rojo; es la tarea más difícil del conjunto según la evaluación open-loop, útil como prueba de precisión de posicionamiento.
- Clasificación y recogida de múltiples objetos: la tarea `Pick all cubes and place into cup` sirve como caso de barrido de escena completa y es, según las métricas publicadas, la tarea mejor ajustada.
- Banco de pruebas de políticas VLA: el repositorio permite comparar checkpoints (se publican resultados de los pasos 4000 y 6000) y medir el efecto de más pasos de entrenamiento sobre el error de acción.
- Punto de partida para fine-tuning propio: al estar construido sobre GR00T N1.7 3B con backbone congelado, un equipo puede reutilizar el pipeline de LeRobot para adaptar el modelo a nuevas tareas con pocos episodios.
- Investigación en imitación multitarea: permite estudiar cómo un solo conjunto de pesos conmuta entre comportamientos a partir de la anotación de lenguaje, sin cabezas separadas por tarea.
- Docencia y robótica de bajo coste: el SO101 es un brazo de coste reducido, por lo que este checkpoint sirve para montar prácticas de VLA en laboratorios con presupuesto limitado.
- Validación de infraestructura de despliegue: el servidor `run_gr00t_server.py` con cliente remoto permite probar latencias, formatos de observación y políticas de interpolación temporal antes de integrar el modelo en un lazo de control real.
- Integración en pipelines LeRobot: el modelo se carga mediante la librería `lerobot`, lo que facilita encadenarlo con utilidades de teleoperación, grabación de datos y evaluación ya existentes.

## Benchmarks y rendimiento

La model card no publica benchmarks estándar (MMLU, HumanEval, GSM8K u otros). Los únicos datos numéricos son una evaluación open-loop sobre los propios datos de entrenamiento: dos trayectorias por tarea, 400 pasos y horizonte de acción 16.

| Trayectoria | Tarea | MAE checkpoint-4000 | MAE checkpoint-6000 |
|---|---|---|---|
| 0 | banana | 1,804 | 1,383 |
| 25 | banana | 1,618 | 1,252 |
| 60 | blue/red cube | 1,728 | 1,748 |
| 80 | blue/red cube | 1,682 | 1,222 |
| 110 | cubes a vaso | 1,283 | 0,960 |
| 130 | cubes a vaso | 1,420 | 1,113 |
| | Media | 1,589 | 1,280 |

El MAE está expresado en las unidades de acción del propio dataset, donde la desviación típica por dimensión promedia 22,3; por tanto, 1,280 equivale al 5,7% de la escala de acción. El checkpoint-6000 mejora al 4000 en 5 de 6 trayectorias (19% menos MAE), motivo por el que se publica. Por tarea, `Pick blue cube and place on red cube` es la más difícil y `Pick all cubes and place into cup` la más sencilla. Estas cifras se midieron sobre datos de entrenamiento y no constituyen una tasa de éxito ni una medida de generalización.

## Requisitos de hardware

- VRAM para inferencia: el repositorio ocupa 12,6 GB, coherente con pesos en 32 bits (3,144 B x 4 bytes ≈ 12,6 GB). En precisión de 32 bits la inferencia necesita del orden de 13-14 GB de VRAM contando activaciones; en bfloat16 los pesos bajan a unos 6,3 GB y el total estimado se sitúa en 8-10 GB, aunque esta conversión no está documentada por el autor.
- GPU recomendadas: H100 de 80 GB (la usada en el ajuste fino), A100 de 40 o 80 GB. Para inferencia, una RTX 4090 o RTX 3090 de 24 GB debería ser suficiente incluso en 32 bits.
- GPU de consumo: sí cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) con margen; en tarjetas de 16 GB probablemente solo en bfloat16 y con margen ajustado. No hay confirmación del autor para estos escenarios.
- Opciones de despliegue: servidor de políticas propio del proyecto mediante `python gr00t/eval/run_gr00t_server.py --model-path twanghcmut/GR00T-N1.7-SO101-Multitask --embodiment-tag NEW_EMBODIMENT --host 0.0.0.0 --port 5555`, consumido por un cliente `Gr00tPolicy` que llama a `get_action(obs)`. El modelo se carga a través de la librería `lerobot`. No se documentan vLLM, llama.cpp, Ollama ni TGI (no son aplicables a una política VLA con cabeza de difusión).
- Latencia y throughput: no disponibles. Como referencia de temporización, los datos están a 30 fps y el modelo devuelve 16 acciones por inferencia; si el cliente interpola entre pasos del modelo, debe calcular el número de subpasos como `smooth_step = control_hz / 30`. Un valor heredado de un robot a 15 fps estira las trayectorias al doble y el brazo no completa la tarea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GR00T-N1.7-SO101-Multitask | 3,14 B (1,62 B entrenables en el ajuste) | No disponible | 3 tareas de manipulacion sobre SO101 | Apache-2.0 | Pesos en safetensors en HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| nvidia/GR00T-N1.7-3B (modelo base) | 3,14 B | No disponible | Modelo VLA generalista, sin ajuste a SO101 | No disponible en la informacion proporcionada | Publicado en HuggingFace por NVIDIA |
| Otros VLA de tamano similar (OpenVLA, pi0, RDT-1B, etc.) | No disponible | No disponible | No disponible | No disponible | No disponibles: la busqueda web realizada no devolvio resultados tecnicos relevantes |

## Limitaciones y advertencias

- No existe split de validación: los 143 episodios se usaron íntegramente para entrenamiento. El parámetro `episode_sampling_rate` subsamplea pasos dentro de los episodios, no episodios completos.
- Las métricas open-loop están medidas sobre datos de entrenamiento. Muestran que la política se ajusta a sus datos y no es degenerada, pero no miden generalización y no son una tasa de éxito. El rendimiento en robot real debe considerarse no medido hasta que se pruebe.
- Un episodio (índice 49, tarea 0) es una grabación abortada de 5 fotogramas, el 0,007% del total; se dejó dentro del dataset. El resto de episodios tiene al menos 223 fotogramas.
- La articulación `wrist_roll` apenas se mueve en este dataset (desviación típica de 0,95 en valor absoluto), por lo que cabe esperar una controlabilidad muy baja sobre ella.
- El modelo solo reconoce las tres instrucciones exactas del entrenamiento; no fue entrenado con paráfrasis, así que reformular el texto puede degradar o anular el comportamiento.
- Idiomas: las instrucciones están en inglés y no se documenta soporte de otros idiomas.
- Volumen de datos muy reducido: entre 44 y 50 episodios por tarea, lo que favorece el sobreajuste a posiciones y objetos concretos de la escena.
- Formato de observación estricto: no debe arrancarse el servidor con `--use-sim-policy-wrapper`, porque cambia al formato plano que usan los entornos de simulación y rompe la compatibilidad con el formato anidado esperado.
- Temporización: hardcodear un factor de interpolación tomado de un robot a 15 fps duplica la duración de cada trayectoria y provoca que el brazo no termine la tarea. Hay que derivarlo de `control_hz / 30`.
- Licencia: el ajuste fino se publica bajo Apache-2.0, lo que en principio permite uso comercial; no se detallan en la información disponible los términos aplicables al modelo base de NVIDIA ni posibles restricciones adicionales derivadas de él.
- Riesgo de alucinación en el sentido habitual del término no aplica aquí, pero sí existe riesgo de acciones incoherentes o incompletas fuera de la distribución de entrenamiento, sin que el modelo emita ninguna señal de incertidumbre.
- El repositorio no registra descargas ni likes, y no hay evidencia de validación por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/twanghcmut/GR00T-N1.7-SO101-Multitask
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/hungho77/so101-multitask
- Busqueda web: no se encontraron enlaces tecnicos relevantes sobre el modelo; los resultados devueltos correspondian a normativa legal eslovaca y no guardan relacion con el modelo.
