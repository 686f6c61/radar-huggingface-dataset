# woozziam/da3_depth_distilation_r1lite_261123

## Resumen

DA3 Depth Distillation, R1 Lite FoldHoodie es un conjunto de tres checkpoints de robótica derivados de nvidia/GR00T-N1.7-3B, un modelo visión-lenguaje-acción (VLA) orientado al control de robots manipuladores. El autor, woozziam, ha realizado un ajuste fino supervisado sobre un único conjunto de datos de manipulación real: 50 episodios de la tarea de doblar una sudadera con el robot bimanual Galaxea R1 Lite, con 72.474 fotogramas capturados a 31 fps. Los tres checkpoints se diferencian únicamente en cuántas capas del backbone se descongelan y en la presencia o ausencia de una pérdida auxiliar de profundidad.

El modelo parte de la arquitectura GR00T N1.7, que combina un codificador visual, un backbone de lenguaje (nvidia/Cosmos-Reason2-2B) y un módulo "Action Expert" que genera trayectorias mediante flow matching. El ajuste fino congela el codificador visual y las 12 capas inferiores del LLM en los tres casos; la variante `frozen` entrena solo el Action Expert, `llm4` descongela además las capas 12 a 15 del LLM, y `llm4_depth` añade una cabeza MLP auxiliar que predice profundidad a partir de los tokens de imagen de la cámara de cabeza.

La relevancia de esta ficha es doble: por un lado, documenta una receta concreta de ajuste fino de un VLA de 3B parámetros sobre hardware asequible (el autor reporta pérdidas de entrenamiento, no evaluación en robot); por otro, el checkpoint `llm4_depth` explora la destilación de profundidad desde Depth Anything 3 como señal auxiliar, una técnica que puede mejorar la generalización espacial en tareas de manipulación. No obstante, el propio autor advierte de que no hay evaluación en robot ni conjunto de validación separado, por lo que las cifras de pérdida no permiten establecer un ranking de rendimiento real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en GR00T N1.7: codificador visual + LLM backbone (Cosmos-Reason2-2B) + Action Expert con flow matching |
| Parámetros totales | 3B (heredados de nvidia/GR00T-N1.7-3B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (modelo orientado a acciones robóticas, no a diálogo) |
| Licencia | no disponible (el modelo base GR00T N1.7 tiene su propia licencia; los labels de profundidad usan DA3-GIANT-1.1 bajo CC BY-NC 4.0) |
| Formato de pesos | safetensors (3 shards, `model.safetensors.index.json`) |
| Tamaño del repo | 27,8 GB |
| Embodiment tag | `NEW_EMBODIMENT` |
| Cámaras de entrada | `head_rgb`, `left_wrist_rgb`, `right_wrist_rgb` |
| Chunk de acción | 32 pasos |
| Fecha de creación | 2026-11-23 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de GR00T N1.7, un VLA compuesto por tres bloques: un codificador visual que procesa las tres cámaras RGB, un backbone de lenguaje Cosmos-Reason2-2B que integra instrucciones y observaciones, y un Action Expert que genera secuencias de acciones mediante flow matching. El ajuste fino se realizó sobre el conjunto `260413_r1lite_gr00t` (50 episodios, 72.474 fotogramas, 31 fps) con 30.000 pasos, batch de 32, learning rate de 1e-4 (1e-5 para el backbone) y schedule coseno. La representación de estado incluye las articulaciones de ambos brazos y el gripper; las acciones son cambios relativos en las articulaciones del brazo más el valor absoluto del gripper, en chunks de 32 pasos.

Los tres checkpoints difieren en el alcance del ajuste: `frozen` entrena solo el Action Expert; `llm4` descongela además las capas 12 a 15 del LLM; `llm4_depth` añade una cabeza MLP que predice un valor de profundidad por cada token de imagen de la cámara de cabeza, supervisada contra etiquetas generadas por DA3-GIANT-1.1 a partir de las cámaras de cabeza izquierda y derecha. La etiqueta se define como `1 - Z / Z_fondo`, de modo que mesa y pared valen 0 y los objetos sobre la mesa codifican su altura relativa a la altura de cámara. La pérdida total combina el flow matching con esta pérdida auxiliar ponderada a 0,2. La cabeza de profundidad solo se usa durante el entrenamiento y no interviene en inferencia. No se usaron pérdidas de consistencia de trayectoria, rollout ni suavizado de velocidad.

## Capacidades

- Control robótico bimanual mediante imitación: genera trayectorias de 32 pasos para las articulaciones de ambos brazos y el gripper a partir de observaciones visuales de tres cámaras.
- Percepción visual multi-cámara: procesa simultáneamente `head_rgb`, `left_wrist_rgb` y `right_wrist_rgb`.
- Ejecución de una tarea específica: doblado de sudadera con el robot Galaxea R1 Lite, en el escenario concreto representado en el conjunto de datos.
- Predicción auxiliar de profundidad (solo en `llm4_depth`, únicamente durante entrenamiento): la cabeza MLP estima profundidad relativa de los tokens de la cámara de cabeza.
- Integración con el stack Isaac GR00T: los tres checkpoints se cargan con `Gr00tPolicy` del repositorio original de NVIDIA.
- No se ha documentado soporte de tool calling, agentes multi-paso, razonamiento en lenguaje natural ni capacidades multilingües de diálogo; el modelo es un policy de robótica, no un asistente conversacional.

## Casos de uso

- Investigación en imitación bimanual: servir como punto de partida para reproducir la receta de ajuste fino de GR00T N1.7 sobre un robot Galaxea R1 Lite y comparar el efecto de descongelar capas del backbone frente a entrenar solo el Action Expert.
- Estudio de destilación de profundidad en VLAs: el checkpoint `llm4_depth` permite analizar si una señal auxiliar de profundidad derivada de Depth Anything 3 mejora la representación espacial del modelo, comparando su pérdida de flow matching con la de `llm4` (0,0072 frente a 0,0073 en el tramo 28.000-30.000).
- Base para ajuste fino en tareas de plegado: el modelo puede reentrenarse con nuevos episodios de doblado de ropa para ampliar la variabilidad de posiciones y prendas, dado que el conjunto original solo cubre una sudadera en una posición casi fija.
- Prototipado de pipelines de robótica con ROS: al ser un modelo basado en articulaciones, se integra con adaptadores ROS de espacio articular, lo que facilita pruebas en simuladores o en el robot real antes de desplegar políticas más generales.
- Docencia y divulgación técnica: los tres checkpoints con condiciones controladas (frozen, llm4, llm4_depth) constituyen un material didáctico para explicar ajuste fino selectivo, congelación de capas y pérdidas auxiliares en modelos VLA.
- Benchmark interno de infraestructura: el tamaño del repo (27,8 GB) y la necesidad del backbone Cosmos-Reason2-2B permiten validar flujos de descarga selectiva (`hf download --include`) y carga con `Gr00tPolicy` en entornos con GPU única.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta la pérdida de flow matching (`single_step_loss`) promediada por tramos sobre los propios datos de entrenamiento, sin conjunto de validación separado ni evaluación en robot:

| Modelo | Pasos 8.000-10.000 | Pasos 18.000-20.000 | Pasos 28.000-30.000 |
|---|---|---|---|
| `frozen` | 0,0261 | 0,0141 | 0,0082 |
| `llm4` | 0,0242 | 0,0127 | 0,0073 |
| `llm4_depth` | 0,0241 | 0,0127 | 0,0072 |

El autor indica explícitamente que no existe un conjunto de evaluación reservado y que el orden real de rendimiento de los tres modelos en el robot es desconocido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 3B parámetros en safetensors sin cuantizar, los pesos ocupan aproximadamente 6 GB en fp16; el repo completo (27,8 GB) incluye los tres checkpoints y estados de entrenamiento, pero solo se descarga la carpeta necesaria.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU con 16-24 GB de VRAM debería ser suficiente para inferencia en fp16, aunque la carga del backbone Cosmos-Reason2-2B añade requisitos adicionales.
- ¿Cabe en GPU de consumo? Probablemente sí en tarjetas de 16 GB o más (RTX 4080, RTX 4090, RTX 5090), aunque no hay confirmación oficial.
- Opciones de despliegue: el autor solo documenta el uso mediante `Gr00tPolicy` del repositorio Isaac GR00T de NVIDIA, con `device="cuda:0"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un policy de robótica.
- Latencia y throughput: no disponibles. El modelo genera chunks de 32 pasos de acción, pero no se reportan tiempos de inferencia.
- Requisito adicional: es necesario tener acceso al backbone `nvidia/Cosmos-Reason2-2B` en Hugging Face.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`llm4_depth`) | 3B | no disponible | VLA para plegado de sudadera con R1 Lite | no disponible | Hugging Face, repo de 27,8 GB |
| nvidia/GR00T-N1.7-3B | 3B | no disponible | VLA generalista para manipulación | licencia de NVIDIA (consultar) | Hugging Face, modelo base |
| `frozen` (mismo repo) | 3B | no disponible | Igual que el anterior, solo Action Expert entrenado | no disponible | Hugging Face |
| `llm4` (mismo repo) | 3B | no disponible | Igual, con capas 12-15 del LLM descongeladas | no disponible | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real con alternativas como OpenVLA, π0 u otros VLAs, por lo que la comparación se limita a parámetros, tarea y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluación en robot: el autor no ha validado ninguno de los tres checkpoints en el Galaxea R1 Lite ni en simulación, por lo que se desconoce su tasa de éxito real.
- Sin conjunto de validación: las pérdidas reportadas se calculan sobre datos de entrenamiento, lo que impide detectar sobreajuste y hace que las cifras no sean comparables entre modelos en términos de generalización.
- Dataset muy limitado: 50 episodios de una única sudadera en una posición casi idéntica; no se ha comprobado el comportamiento ante cambios de posición, iluminación, prenda o escena.
- Entrenamiento corto: 30.000 pasos frente a los aproximadamente 120.000 de entrenamientos previos del mismo autor, lo que puede limitar la convergencia.
- Licencia no declarada en la model card: no se especifica la licencia del checkpoint, lo que impide determinar si el uso comercial está permitido. Además, las etiquetas de profundidad de `llm4_depth` derivan de DA3-GIANT-1.1, publicado bajo CC BY-NC 4.0, lo que introduce una restricción de no uso comercial sobre esa parte del pipeline.
- Dependencia del backbone Cosmos-Reason2-2B: es necesario solicitar acceso a `nvidia/Cosmos-Reason2-2B` en Hugging Face, lo que añade una dependencia externa y posibles restricciones de uso.
- Compatibilidad restringida: solo funciona con adaptadores ROS de espacio articular; no es compatible con adaptadores de efector final (EE).
- Riesgo de alucinación en acciones: como todo policy de imitación, puede generar trayectorias plausibles pero incorrectas fuera de la distribución de entrenamiento, con riesgo físico en el robot real.
- Sin soporte documentado de lenguaje natural, tool calling ni razonamiento multi-paso; no debe emplearse como asistente conversacional.
- Los pesos de `depth_aux_head.*` permanecen en el checkpoint de `llm4_depth` aunque no se usan en inferencia, lo que genera una advertencia al cargar el modelo con el código original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/woozziam/da3_depth_distilation_r1lite_261123
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Backbone de lenguaje: https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Repositorio Isaac GR00T (NVIDIA): no disponible en la información proporcionada
- Depth Anything 3 (DA3-GIANT-1.1): no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
