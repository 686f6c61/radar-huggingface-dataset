# twanghcmut/GR00T-N1.6-SO101-Multitask

## Resumen

GR00T-N1.6-SO101-Multitask es un fine-tuning de robótica del modelo base `nvidia/GR00T-N1.6-3B`, un modelo visión-lenguaje-acción (VLA) de NVIDIA, publicado por el usuario twanghcmut. El ajuste se ha realizado sobre el dataset `hungho77/so101-multitask` para el brazo seguidor SO101 (5 articulaciones más pinza) y cubre tres tareas simultáneamente en un único checkpoint en lugar de tres modelos separados: recoger un plátano y cerrar la tapa, apilar un cubo azul sobre uno rojo, y meter todos los cubos en un vaso. El modelo recibe dos cámaras RGB (vista superior y muñeca) a 480×640, el estado articular y una instrucción en lenguaje natural que selecciona el comportamiento.

Técnicamente es un VLA de 3,29 B de parámetros totales (1,62 B entrenables, el 49,3 %), construido sobre el backbone Eagle-Block2A-2B con `tune_top_llm_layers=4` y el resto del LLM y del codificador visual congelados. El entrenamiento consistió en 6000 pasos con batch global de 128 (768 000 muestras, 11,4 épocas sobre 67 496 fotogramas), ejecutado en una única H100 de 80 GB durante 8,58 h a 5,15 s/paso, con una pérdida final de 0,0129.

Su relevancia es doble: por un lado, demuestra que un fine-tuning de bajo coste sobre 143 episodios de demostración es suficiente para producir una política multitarea funcional en hardware de consumo; por otro, la model card documenta con inusual honestidad las trampas del proceso (sin conjunto de validación, desajuste entre el horizonte supervisado de 16 pasos y el `action_horizon` de 50, y una ejecución limitada por CPU, no por GPU), lo que lo convierte en un caso de estudio útil para quien planifique pipelines de imitation learning con LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje-acción (VLA) basado en NVIDIA Isaac GR00T N1.6; backbone Eagle-Block2A-2B |
| Parámetros totales | 3 286 608 832 (3,29 B) |
| Parámetros activos | No aplica (no es MoE); 1,62 B entrenables durante el fine-tuning (49,3 %) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se publican variantes cuantizadas; pesos en safetensors) |
| Idiomas soportados | Instrucciones en inglés (las tres tareas están definidas en ese idioma); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, más `modality.json` y `so101_config.py` (formato LeRobot); tamaño del repositorio 9,8 GB |
| Embodiment | Brazo seguidor SO101, 5 articulaciones + pinza (`shoulder_pan`, `shoulder_lift`, `elbow_flex`, `wrist_flex`, `wrist_roll`, `gripper`) |
| Etiqueta de embodiment | `NEW_EMBODIMENT` |
| Dimensión de estado/acción | 6 |
| Cámaras | `top` (vista superior) y `wrist`, 480×640 RGB |
| Frecuencia de los datos | 30 fps |
| Representación de acción | `single_arm` relativa (delta respecto al estado actual), `gripper` absoluta; la política desnormaliza ambas y devuelve objetivos articulares absolutos |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del `nvidia/GR00T-N1.6-3B`: un sistema VLA que combina un backbone visión-lenguaje Eagle-Block2A-2B con una cabeza de acción que consume el estado proprioceptivo y las observaciones visuales para producir comandos articulares. En este fine-tuning, el LLM y el codificador visual permanecen congelados salvo las cuatro capas superiores del LLM (`tune_top_llm_layers=4`), de modo que sólo se ajusta aproximadamente la mitad de los parámetros (1,62 B de 3,29 B). Los detalles internos de la cabeza de acción (tipo de decodificador, número de capas, mecanismo de generación) no están documentados en la información disponible.

El entrenamiento se realizó con 6000 pasos, batch global de 128, learning rate 1e-4 con schedule coseno, 5 % de warmup y weight decay 1e-5, sobre una única H100 de 80 GB. La pérdida por bloques de 250 pasos descendió de 0,6157 a 0,0129, y el último bloque apenas mejoró +0,0007, con el learning rate decaído a 7,59e-12: el autor lo interpreta como convergencia. Un dato relevante para replicar el experimento es que la ejecución estuvo limitada por la decodificación de vídeo en CPU (0 % de utilización de GPU a 125 W de un límite de 700 W), por lo que las 8,58 h de wall-clock no miden el coste real de la arquitectura.

Hay además dos detalles de configuración que condicionan el uso. El primero es el desajuste de horizonte: la configuración de modalidad supervisa 16 pasos futuros (`delta_indices` 0–15) mientras que `action_horizon` vale 50, sin que nada derive un valor del otro, de modo que los pasos más allá del 16 están débilmente supervisados. El segundo es que las acciones se desnormalizan antes de devolverse, por lo que la política emite objetivos articulares absolutos listos para enviar al controlador.

## Capacidades

- Generación de acciones motoras para un brazo robótico SO101 de 6 grados de libertad a partir de observaciones visuales y propioceptivas.
- Comprensión de instrucciones en lenguaje natural para seleccionar la tarea: las tres instrucciones del dataset son `Pick up the banana and place it in the bot, then close the lid`, `Pick blue cube and place on red cube` y `Pick all cubes and place into cup`.
- Política multitarea en un solo checkpoint: cubre las tres tareas sin conmutadores externos, seleccionadas únicamente por el texto de instrucción.
- Fusión de dos vistas de cámara simultáneas (vista superior y muñeca) con el estado articular, en un esquema de observación con dimensión temporal T=1.
- Generación de secuencias de acción con horizonte de predicción (chunking), útil para control a 30 Hz con interpolación entre pasos del modelo.
- Manejo separado de acciones relativas (cinco articulaciones del brazo) y absolutas (pinza), con desnormalización interna.
- No soporta tool calling, function calling, uso de agentes, visión generalista, audio, ni modo de razonamiento explícito: es una política de control robótico, no un asistente de propósito general.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo ejecuta la secuencia de recoger un cubo y apilarlo sobre otro usando la vista superior para localizar los objetos y la de muñeca para el alineamiento fino, a partir de la instrucción exacta `Pick blue cube and place on red cube`.
- Clasificación y recogida de objetos en contenedores: con la instrucción `Pick all cubes and place into cup`, sirve como base para tareas de recolección múltiple donde el robot debe iterar sobre varios objetos antes de terminar el episodio.
- Manipulación con cierre de contenedor: la tarea del plátano incluye cerrar la tapa, lo que aporta un ejemplo de secuencia con interacción física sobre un objeto articulado, útil para estudiar contacto y fuerza en el tramo final.
- Base para fine-tuning adicional en el mismo embodiment: al ser un checkpoint ya convergido sobre SO101, es un punto de partida razonable para añadir tareas nuevas sin reentrenar desde el modelo base de NVIDIA.
- Docencia e investigación en imitation learning: el repositorio incluye `modality.json` y `so101_config.py`, lo que permite reproducir el pipeline completo en LeRobot y estudiar el efecto del ajuste de las cuatro capas superiores del LLM.
- Evaluación de estrategias de control con action chunking: dado que el horizonte supervisado es de 16 pasos a 30 fps, sirve para medir cómo afecta el número de subpasos interpolados (`smooth_step = control_hz / 30`) a la suavidad de la trayectoria.
- Referencia comparativa de arquitecturas VLA: los tres modelos entrenados con idéntico dataset, batch y número de pasos (N1.6, N1.7 y π₀.₅) permiten aislar el efecto del backbone y de la cabeza de acción sobre la misma tarea.

## Benchmarks y rendimiento

El autor publica una evaluación en lazo abierto sobre las mismas trayectorias de entrenamiento (dos por tarea, 400 pasos, horizonte de acción 16). Los errores están en las unidades de acción del propio dataset y no son una tasa de éxito.

| Trayectoria | Tarea | MAE ckpt-5000 | MAE ckpt-6000 |
|---|---|---|---|
| 0 | banana | 1,025 | 0,988 |
| 25 | banana | 1,070 | 0,759 |
| 60 | cubo azul/rojo | 0,967 | 1,034 |
| 80 | cubo azul/rojo | 0,817 | 1,394 |
| 110 | cubos → vaso | 0,899 | 0,748 |
| 130 | cubos → vaso | 0,830 | 0,820 |
| | Media | 0,935 | 0,957 |

Normalizando por la desviación estándar absoluta de las acciones (media 22,33 entre dimensiones), el error equivale al 4,19 % de la escala de acción para el checkpoint 5000 y al 4,29 % para el 6000. El repositorio publica el checkpoint 6000. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros), que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16/fp16 ocupan aproximadamente 6,6 GB (3,29 B × 2 bytes); sumando el codificador visual, dos flujos de vídeo de 480×640 y las activaciones de la cabeza de acción, el consumo realista se sitúa en torno a 10–14 GB (estimación propia, no publicada por el autor).
- GPU utilizadas en el fine-tuning: 1× H100 80 GB, con un tiempo de 8,58 h a 5,15 s/paso. Esa cifra está distorsionada por el cuello de botella de decodificación de vídeo en CPU.
- GPU recomendadas para inferencia: RTX 4090 o RTX 3090 (24 GB), A100 40/80 GB, L40S, H100. Cabe en GPU de consumo de 24 GB con margen; en tarjetas de 12–16 GB el modelo entra en fp16 pero el margen para activaciones y lotes es ajustado.
- Despliegue: el modelo está pensado para LeRobot (etiqueta de librería `lerobot`), con carga directa de safetensors más el `modality.json` y el `so101_config.py` incluidos. No es desplegable en vLLM, llama.cpp, Ollama ni TGI, ya que no es un LLM de texto sino una política de control.
- Latencia y throughput: no publicados. La única referencia disponible es el tiempo de entrenamiento, no representativo. En operación, el control debe sostener 30 Hz o recurrir al chunking de los primeros 16 pasos con interpolación a `control_hz / 30`.
- Aviso de configuración: reutilizar un valor de subpaso calculado para un robot de 15 fps estira la trayectoria un factor 2 y provoca que el brazo se mueva lentamente sin completar la tarea.

## Comparativa con modelos similares

El propio autor entrena tres modelos sobre el mismo dataset, con el mismo batch (128) y el mismo número de pasos (6000), evaluados sobre los primeros 16 pasos predichos de las mismas seis trayectorias.

| | GR00T N1.6 (este modelo) | GR00T N1.7 | π₀.₅ (openpi) |
|---|---|---|---|
| Backbone | Eagle-Block2A-2B | Qwen3-VL | PaliGemma + action expert |
| Tiempo de entrenamiento | 8,58 h | 8,62 h | 13,8 h |
| Utilización de GPU | 0 % | 6 % | 100 % |
| Pérdida final de entrenamiento | 0,0129 | 0,0168 | 0,00302 |
| Convergencia | Sí | Sí | No (LR al 94 % del pico) |
| MAE, horizonte 16 | 0,957 = 4,29 % | 1,280 = 5,73 % | 1,005 = 4,50 % |
| Licencia | Apache 2.0 | no disponible en la información | no disponible en la información |

La comparación favorece a N1.6 en error de lazo abierto, pero con dos matices importantes: π₀.₅ no había convergido al terminar el entrenamiento, y la utilización de GPU del 0 % en N1.6 indica que su resultado se obtuvo con muchos menos ciclos de cómputo efectivos que π₀.₅. La comparación con N1.7 es la más directa, porque comparten presupuesto de entrenamiento y dataset.

## Limitaciones y advertencias

- No hay conjunto de validación ni de test: los 143 episodios se usaron íntegramente para entrenar. `episode_sampling_rate` subsamplea pasos dentro de episodios, no episodios completos. Las métricas publicadas miden ajuste a los datos de entrenamiento, no generalización, y no son una tasa de éxito.
- El rendimiento en robot real está sin medir. Cualquier extrapolación a partir del MAE en lazo abierto es especulativa.
- Sensibilidad a la paráfrasis: el modelo no se ha entrenado con reformulaciones. Hay que usar literalmente las instrucciones `Pick up the banana and place it in the bot, then close the lid`, `Pick blue cube and place on red cube` y `Pick all cubes and place into cup`.
- Desajuste de horizonte: la configuración de modalidad supervisa 16 pasos (`delta_indices` 0–15) mientras que `action_horizon` es 50. Los pasos posteriores al 16 están débilmente supervisados; conviene usar y evaluar sólo los 16 primeros.
- Articulación `wrist_roll` prácticamente incontrolable: su desviación estándar en el dataset es de 0,95 frente a 16–37 en el resto de articulaciones, de modo que apenas se mueve durante el entrenamiento.
- Dato espurio en el dataset: el episodio 49 es una grabación abortada de 5 fotogramas (0,007 % del total) que se dejó dentro.
- El desajuste de cámara respecto a `examples/SO100` de NVIDIA (aquí `top` es una vista superior, no `front`) obliga a usar el `modality.json` y el `so101_config.py` incluidos; el checkpoint no funciona sin una configuración de modalidad compatible.
- Cobertura muy estrecha: dos cámaras, un único embodiment, 30 fps y tres tareas de laboratorio. No hay soporte multilingüe ni adaptación a otros brazos sin reentrenar.
- Licencia Apache 2.0, que permite uso comercial, pero hereda las condiciones del modelo base `nvidia/GR00T-N1.6-3B`, que conviene revisar por separado.
- Adopción mínima: 10 descargas y 0 likes en el momento de redactar esta ficha, sin mantenimiento posterior aparente ni issues documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twanghcmut/GR00T-N1.6-SO101-Multitask
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.6-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/hungho77/so101-multitask
- Librería LeRobot: https://github.com/huggingface/lerobot
- Paper, blog o demo específicos de este fine-tuning: no disponible en la información proporcionada.
- Nota sobre la búsqueda web: los resultados devueltos no guardan relación con el modelo (contenido promocional de apuestas), por lo que no se incluye ningún enlace adicional.
