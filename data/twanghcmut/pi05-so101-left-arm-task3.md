# twanghcmut/pi05-so101-left-arm-task3

## Resumen

π₀.₅ SO101 Left Arm 3-task es un checkpoint de política visomotora (VLA, vision-language-action) derivado del modelo base π₀.₅ de Physical Intelligence, afinado por el usuario twanghcmut para controlar un brazo robótico SO101 (variante izquierda, 5 articulaciones más pinza) en tres tareas de manipulación concretas. El modelo combina percepción visual (cámaras cenital y de muñeca) con instrucciones en lenguaje natural para emitir secuencias de acciones articulares de 50 pasos. Con 3.616.757.520 parámetros y pesos en safetensors de 7,0 GB, se distribuye bajo licencia Apache 2.0 a través de la librería LeRobot y el ecosistema openpi.

La relevancia de esta ficha es acotada y hay que subrayarla: no es un modelo de propósito general, sino un ajuste fino multitarea que unifica tres conjuntos de datos SO101 (159 episodios, 133.763 fotogramas) en un único checkpoint donde el *prompt* de lenguaje selecciona la tarea. Emplea la receta por defecto del entrenador PyTorch de openpi, con 6.000 pasos, batch de 128 y precisión bf16 sobre una H100 de 80 GB.

El interés técnico reside en su valor como ejemplo reproducible de *fine-tuning* VLA para robótica de bajo coste (brazo SO101), no en capacidades generales de razonamiento o generación de texto. Sus cifras de evaluación son de bucle abierto sobre datos de entrenamiento, sin *held-out split*, por lo que no deben interpretarse como tasas de éxito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π₀.₅ (openpi, PyTorch); transformer visomotor con codificación de lenguaje y acciones |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible (no se documenta como MoE) |
| Longitud de contexto | no disponible (horizonte de acción de 50 pasos) |
| Tipos de cuantizacion | no disponible (pesos entrenados en bfloat16) |
| Idiomas soportados | no disponible (prompts de instrucción en inglés, sin cobertura multilingüe documentada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, 7,0 GB); metadata.pt; norm_stats.json |
| Modelo base | physical-intelligence/pi05_base |
| Libreria / ecosistema | lerobot, openpi |
| Dimension estado/acción | 6 (shoulder_pan, shoulder_lift, elbow_flex, wrist_flex, wrist_roll, gripper) |
| Camaras | top 360×640 → base_0_rgb; wrist 480×640 → left_wrist_0_rgb; right_wrist_0_rgb enmascarada |
| Frecuencia de control | 30 fps |
| Tamano del repo | 7,5 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura π₀.₅ de Physical Intelligence, un modelo visomotor que consume imágenes de varias cámaras, el estado articular y un *prompt* de lenguaje, y produce *chunks* de acciones. En este ajuste, la representación de acción es mixta: las cinco articulaciones del brazo se predicen como deltas respecto al primer estado del *chunk*, mientras que la pinza se predice en valor absoluto. La transformación de salida de la política convierte esos deltas de vuelta, de modo que `infer()` devuelve objetivos articulares absolutos de forma (50, 6). La cámara `top_depth` no se utiliza.

El entrenamiento parte de `pi05_base` convertido a PyTorch y aplica la receta por defecto de openpi: 6.000 pasos, batch de 128 (768.000 muestras, unas 5,7 épocas sobre 133.763 fotogramas), AdamW con b1 0,9, b2 0,95, weight decay 1e-10 y clipping 1,0, y un *schedule* coseno con *warmup* de 1.000 pasos hasta un pico de 2,5e-5 y decaimiento a 2,5e-6. Se ejecutó en una H100 de 80 GB (pico de 70,7 GB asignados) durante 13,7 horas a 8,2 s/paso, con pérdida final de 0,0021 (media de los pasos 5.600–5.999). No se aplicó EMA porque el entrenador PyTorch de openpi no lo soporta. Los tres conjuntos de datos originales (LeRobot v3.0) se convirtieron a v2.1 y se fusionaron mediante `convert_merge_task3.py`, recortando vídeos con `ffmpeg -c copy` sin recomprimir fotogramas.

## Capacidades

- Control visomotor de un brazo SO101 izquierdo con 5 articulaciones más pinza, a partir de imágenes cenital y de muñeca.
- Ejecución de tres tareas de manipulación seleccionables mediante *prompt* de lenguaje exacto (sin paráfrasis): sacar un cubo rojo de una olla y colocarlo en un cubo hueco naranja; abrir el cajón superior, coger un bloque cuadrado rojo, colocarlo dentro y cerrar; abrir el cajón, coger el cubo rojo y apilarlo sobre el cubo azul.
- Predicción de secuencias de acción de horizonte 50 con salida de objetivos articulares absolutos.
- Multitarea en un único checkpoint: una sola política cubre las tres tareas, seleccionadas por instrucción.
- No se documentan capacidades de *tool calling*, razonamiento multi-paso simbólico, generación de texto libre, matemáticas, visión general, audio ni modo *thinking*.

## Casos de uso

- Investigación en aprendizaje por imitación con brazos de bajo coste: sirve como referencia reproducible de *fine-tuning* de π₀.₅ sobre SO101 usando openpi y LeRobot, con scripts de conversión y configuración incluidos.
- Evaluación de políticas VLA en laboratorio: permite medir error de bucle abierto y comparar recetas (por ejemplo, frente al checkpoint de 11 tareas del mismo autor) sobre el mismo conjunto de datos.
- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede ejecutar la secuencia cubo-olla-cubo hueco o el apilado rojo-sobre-azul en una celda de robot con iluminación y disposición fijas.
- Manipulación de cajones con pinza: la tarea de abrir cajón, coger bloque y cerrar es aplicable a prototipos de automatización de almacenamiento o clasificación en cajones.
- Base para *fine-tuning* adicional: al estar bajo Apache 2.0 y con la receta documentada, se puede reentrenar sobre nuevos conjuntos SO101 para ampliar el repertorio de tareas.
- Docencia y formación en robótica: el parche `so101_policy.py` y el fragmento de configuración permiten desplegar el modelo con `serve_policy.py` en un *setup* de prácticas con H100 o GPU de capacidad similar.
- Integración en *pipelines* de openpi: el checkpoint se carga mediante el sistema de configuración de openpi (no con `from_pretrained`), lo que facilita su uso en procesos de inferencia en proceso o como servicio.

## Benchmarks y rendimiento

Evaluación de bucle abierto del autor: dos trayectorias por tarea, recorridas en pasos de 16 fotogramas hasta 400, comparando los primeros 16 pasos predichos con las acciones reales. Errores en unidades de acción del propio conjunto de datos.

| Trayectoria | Tarea | MAE (h=16) |
|---|---|---|
| 0 | 0: cubo rojo, olla → cubo hueco | 1,286 |
| 25 | 0: cubo rojo, olla → cubo hueco | 1,690 |
| 51 | 1: cajón + bloque rojo | 1,239 |
| 80 | 1: cajón + bloque rojo | 1,704 |
| 108 | 2: cajón, apilar rojo sobre azul | 1,345 |
| 133 | 2: cajón, apilar rojo sobre azul | 1,488 |
| — | Media | 1,459 (MSE 5,08) |

Normalizado por la desviación estándar absoluta de acción (29,97), el error medio equivale al 4,87 % de la escala de acción en horizonte 16. Estas cifras se miden sobre datos de entrenamiento (sin *held-out split*) y no constituyen una tasa de éxito. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni son aplicables a este modelo.

## Requisitos de hardware

- Entrenamiento documentado: 1× H100 80 GB, con pico de 70,7 GB asignados, 8,2 s/paso y 13,7 h para 6.000 pasos.
- VRAM de inferencia: no disponible de forma explícita; los pesos en bf16 ocupan 7,0 GB, por lo que se requiere al menos una GPU con holgura por encima de esa cifra para cargar el modelo y procesar las imágenes de entrada.
- GPU recomendadas: H100 (entrenamiento y servicio), A100 80 GB como alternativa razonable por capacidad; no se documenta comportamiento en RTX 4090 ni en GPUs de consumo.
- Despliegue: openpi (`scripts/serve_policy.py policy:checkpoint` o `create_trained_policy` en proceso). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un checkpoint VLA de robótica.
- Latencia y throughput: no disponibles; solo se conoce el coste de entrenamiento (8,2 s/paso).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-so101-left-arm-task3 (este) | 3.616.757.520 | horizonte de acción 50 | 3 | Apache 2.0 | HuggingFace, openpi |
| pi05-so101-left-arm-multitask (mismo autor) | no disponible en la información | horizonte de acción 50 | 11 | Apache 2.0 (según repo del autor) | HuggingFace |
| physical-intelligence/pi05_base | no disponible en la información | no disponible | base general | no disponible en la información | openpi / Physical Intelligence |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada; el autor indica que este checkpoint usa la misma receta y presupuesto de muestras que el de 11 tareas.

## Limitaciones y advertencias

- Sin *held-out split*: los 159 episodios se usaron íntegramente para entrenamiento, por lo que las métricas de bucle abierto miden ajuste a los datos, no generalización, y no son una tasa de éxito. El rendimiento en robot real está sin medir.
- Pesos en bf16: las actualizaciones de AdamW menores que medio paso bf16 no modifican el peso, lo que afecta a la mayoría de pesos durante el *warmup*; el autor señala que el efecto parece pequeño en una comparación corta, pero no lo cuantifica por completo.
- Dependencia estricta del *prompt*: el modelo no se entrenó con paráfrasis; hay que usar la redacción exacta, incluida la puntuación final, o la tarea puede no seleccionarse correctamente.
- Alcance muy restringido: solo tres tareas, un robot concreto (SO101 izquierdo), una disposición de cámara y objetos específicos; no es un modelo de propósito general ni transferible sin reentrenamiento.
- Idiomas: no hay cobertura multilingüe documentada; las instrucciones están en inglés.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base π₀.₅ y sus términos deben verificarse por separado; la información disponible no detalla restricciones adicionales del modelo base.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; en robótica, el fallo se manifiesta como acciones incorrectas o inseguras, por lo que se recomienda supervisión y límites de par/velocidad en producción.
- El repositorio no incluye `optimizer.pt` (13 GB), necesario solo para reanudar el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/twanghcmut/pi05-so101-left-arm-task3
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
- Checkpoint multitarea del mismo autor: https://huggingface.co/twanghcmut/pi05-so101-left-arm-multitask
- Blog de π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
- Conjunto de datos 1: https://huggingface.co/datasets/hungho77/so101-left_arm_task_red_cube_out_of_pot_into_the_orange_hollow_cube
- Conjunto de datos 2: https://huggingface.co/datasets/hungho77/so101-left_arm_task_drawer_placing_red_squre_block
- Conjunto de datos 3: https://huggingface.co/datasets/hungho77/so101_left_arm_open_drawer_pick_red_cube_stack_on_blue_cube
