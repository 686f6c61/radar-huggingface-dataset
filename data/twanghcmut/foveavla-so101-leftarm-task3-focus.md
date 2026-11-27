# twanghcmut/FoveaVLA-SO101-LeftArm-Task3-Focus

## Resumen

FoveaVLA-SO101-LeftArm-Task3-Focus es un modelo de visión-lenguaje-acción (VLA) para robótica, desarrollado por el usuario twanghcmut, que parte de la base de π0.5 / PaliGemma y se ha ajustado fino sobre el conjunto de datos `hungho77/so101-left-arm-task3`. Su propósito es controlar un brazo robótico SO101 izquierdo en tres tareas de manipulación distintas (sacar un cubo rojo de una olla, guardarlo en un cajón y apilarlo sobre otro cubo), usando un único modelo con prompt de tarea por fotograma. Resuelve el problema de la especialización en manipulación robótica de precisión con un único checkpoint multi-tarea.

La innovación principal es el mecanismo de "fovea": el modelo predice una caja de interacción (subtask-focused box) y recorta su vista foveal alrededor de esa región de la imagen cenital, en lugar de procesar la escena completa o depender de una cámara de muñeca. Esto reduce la información redundante y centra la atención en el objeto relevante para cada subtarea. El modelo tiene 3.616.757.520 parámetros (unos 3,6 mil millones) y se distribuye en formato safetensors con pesos en float32, ocupando 14,5 GB en el repositorio.

Es relevante ahora porque demuestra una receta concreta para el ajuste fino de VLAs sobre hardware accesible (SO101) con un solo modelo multi-tarea y una estrategia de atención espacial explícita, además de publicar código, estadísticas de normalización y resultados de evaluación en bucle abierto. No obstante, la evaluación publicada se realiza sobre episodios que forman parte del conjunto de entrenamiento, por lo que no mide generalización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 / PaliGemma (transformer visión-lenguaje-acción) |
| Parámetros totales | 3.616.757.520 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo se construye sobre la base π0.5 / PaliGemma, un transformer visión-lenguaje-acción que combina un codificador visual con un modelo de lenguaje y una cabeza de acciones. La entrada incluye RGB cenital más profundidad métrica, un recorte foveal de la vista cenital (sin cámara de muñeca) y un vector de estado de 6 dimensiones. La salida son fragmentos de 16 pasos de objetivos articulares absolutos y la caja de interacción 8 fotogramas por delante. La particularidad es la caja "subtask-focused": cada subtarea mira un objetivo con una ventana de tamaño fijo (150 px de la vista cenital de 640×360, 188 px para la olla), y la ventana se desplaza al siguiente objetivo en la frontera de la subtarea. Los objetos provienen de detecciones de LocateAnything-3B, las posiciones del cajón de un ajuste articulación-a-píxel de la punta del gripper, y las fronteras de subtarea del estado del robot.

El entrenamiento se realizó con lote de 128 (16 micro-lotes de 8), 6.000 pasos, decaimiento coseno, una GPU de 80 GB y aproximadamente 19 horas. Se entrenó con todos los episodios excepto el 56 y el 75; los episodios 50 y 136 no tienen etiquetas de caja. No se especifica en la información disponible si hubo RLHF o DPO; la receta descrita es de ajuste fino supervisado sobre el conjunto de datos. El checkpoint publicado corresponde al paso 5999 de 6000, con configuración `foveavla_so101_task3` y experimento `task3_focus_bs128_6k`.

## Capacidades

- Control robótico de manipulación: genera objetivos articulares absolutos en fragmentos de 16 pasos para un brazo SO101 izquierdo.
- Multi-tarea con un único modelo: tres tareas (sacar el cubo de la olla, guardarlo en el cajón, apilarlo sobre el cubo azul) seleccionadas por prompt de tarea por fotograma.
- Predicción de caja de interacción: estima la región relevante (subtask-focused box) 8 fotogramas por delante y recorta su vista foveal alrededor de ella.
- Percepción multimodal: usa RGB cenital, profundidad métrica y estado de 6 dimensiones como entradas.
- Razonamiento espacio-temporal: planifica a nivel de subtarea (pick, place, pull, push, retreat) con ventanas de atención desplazables.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, multilingüismo, modo thinking, visión general, audio ni generación de texto libre.

## Casos de uso

- Manipulación robótica de pick-and-place en entornos de laboratorio: el modelo recibe RGB cenital, profundidad y estado del brazo, y emite objetivos articulares para sacar un cubo de un recipiente y colocarlo en otro; es adecuado por su entrenamiento específico en estas secuencias y su ventana foveal sobre el objeto.
- Automatización de tareas de cajón: abrir un cajón, depositar un objeto y cerrarlo, usando la caja de interacción que se desplaza del tirador al cubo y al frente del cajón según la subtarea.
- Apilamiento de objetos: abrir el cajón, recoger el cubo rojo y apilarlo sobre el azul, aprovechando la predicción de caja 8 fotogramas por delante para anticipar el objetivo.
- Investigación en VLAs con atención foveal: servir de referencia reproducible para estudiar cómo el recorte foveal basado en cajas predichas afecta al error de acción en bucle abierto.
- Evaluación comparativa de recetas de ajuste fino: comparar el rendimiento de esta receta (top + profundidad + foveal, sin muñeca) frente a π0.5 con top + muñeca en las mismas tareas.
- Prototipado de control multi-tarea con un solo checkpoint: desplegar un único modelo que alterna entre tres tareas mediante prompt, simplificando la gestión de modelos en un banco de pruebas robótico.
- Docencia y reproducción de pipelines de robótica: el repositorio incluye código de construcción de cajas, estadísticas de normalización y scripts de evaluación que permiten reproducir el flujo completo.

## Benchmarks y rendimiento

Los resultados publicados corresponden a evaluación en bucle abierto sobre los episodios 0, 25, 51, 80, 108 y 133, primeros 400 fotogramas, con error en unidades de acción del conjunto de datos (grados) normalizado por la desviación estándar absoluta de 29,97. Estos episodios están en el conjunto de entrenamiento, por lo que no miden generalización.

| Modelo | Fuente del recorte | MSE | MAE | MAE normalizado |
|---|---|---|---|---|
| Este checkpoint | caja predicha (como en el robot) | 3,094 | 0,781 | 2,61 % |
| Este checkpoint | caja etiquetada | 2,023 | 0,710 | 2,37 % |
| π0.5 `pi05_so101_leftarm_task3` (top + muñeca) | – | 5,081 | 1,459 | 4,87 % |

El IoU de la caja predicha frente a la etiqueta 8 fotogramas por delante es de 0,993. Los números por episodio están en `eval/`.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,6 mil millones de parámetros en float32, los pesos ocupan aproximadamente 14,5 GB; se necesita VRAM adicional para activaciones y el codificador visual.
- GPU recomendadas: el entrenamiento se realizó en una GPU de 80 GB (por ejemplo A100 o H100). Para inferencia en float32 se recomienda al menos una GPU con 24-48 GB.
- ¿Cabe en GPU de consumo? En float32 probablemente no en tarjetas de 16 GB; con cuantización a 8 o 4 bits podría caber en RTX 4090 (24 GB) o RTX 3090, aunque no se documentan tipos de cuantización ni recetas para este checkpoint.
- Opciones de despliegue: la información disponible solo documenta la carga mediante `policy_config.create_trained_policy(config.get_config("foveavla_so101_task3"), <directorio>)` y el script `examples/so101/eval_foveavla.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (MAE normalizado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FoveaVLA-SO101-LeftArm-Task3-Focus | 3,62 mil millones | no disponible | 2,61 % (caja predicha) / 2,37 % (caja etiquetada) | no disponible | Hugging Face |
| π0.5 `pi05_so101_leftarm_task3` | no disponible | no disponible | 4,87 % | no disponible | Referenciado en la model card |
| Otros VLAs para SO101 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La evaluación publicada se realiza sobre episodios incluidos en el entrenamiento; no mide generalización a escenas, objetos o posiciones no vistas.
- El modelo está especializado en un brazo SO101 izquierdo y tres tareas concretas; no se documenta su comportamiento fuera de ese dominio.
- Depende de una vista cenital con profundidad métrica y de un pipeline externo de detección (LocateAnything-3B) y ajuste articulación-a-píxel para construir las cajas; errores en esas etapas afectan al recorte foveal.
- No usa cámara de muñeca, lo que puede limitar la percepción en configuraciones donde la vista cenital queda ocluida.
- Los episodios 56 y 75 no se usaron en entrenamiento y los episodios 50 y 136 carecen de etiquetas de caja; esto puede introducir huecos en la supervisión.
- No se especifica licencia, lo que impide confirmar si el uso comercial está permitido.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas; al ser un modelo de acción robótica, el riesgo principal es la ejecución de acciones incorrectas en el robot.
- Los pesos en float32 (14,5 GB) dificultan el despliegue en hardware de consumo sin cuantización, para la que no se ofrece receta.

## Enlaces

- Hugging Face: https://huggingface.co/twanghcmut/FoveaVLA-SO101-LeftArm-Task3-Focus
- Repositorio de código: https://github.com/hungho77/FoveaVLA (rama `pr/so101-task3`, configuración `foveavla_so101_task3`, experimento `task3_focus_bs128_6k`)
- Conjunto de datos: https://huggingface.co/datasets/hungho77/so101-left-arm-task3
- Script de construcción de cajas: `examples/so101/build_focus_boxes.py` (en el repositorio)
- Script de evaluación: `examples/so101/eval_foveavla.py` y `openpi/scripts/eval_so101_open_loop.py` (en el repositorio)
- Resultados de evaluación: `eval/summary.json`, `eval/open_loop.csv` (en el repositorio de Hugging Face)
- Estadísticas de normalización: `assets/so101_task3/norm_stats.json` (en el repositorio de Hugging Face)
