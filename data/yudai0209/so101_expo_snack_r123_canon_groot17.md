# yudai0209/so101_expo_snack_r123_canon_groot17

## Resumen

`yudai0209/so101_expo_snack_r123_canon_groot17` es una política de robótica entrenada con LeRobot sobre el modelo fundacional GR00T N1.7 de NVIDIA. No se trata de un modelo de lenguaje generalista, sino de un checkpoint de imitación (visión-lenguaje-acción) especializado en una única tarea física: recoger un objeto verde y depositarlo en una caja. El autor, yudai0209, lo ha entrenado sobre su propio dataset de demostraciones teleoperadas con un robot SO-101 (`so_follower`) y dos cámaras (muñeca y cenital).

La relevancia de esta ficha es doble: por un lado, documenta el flujo real de fine-tuning de GR00T N1.7 dentro del ecosistema LeRobot; por otro, sirve como ejemplo de política de manipulation de bajo coste reproducible con hardware de consumo. El checkpoint tiene 3.144.016.000 parámetros (backbone VLM más action transformer), un repositorio de 38,1 GB en safetensors y se distribuye bajo licencia no especificada en la model card.

Conviene subrayar que se trata de una política de nicho, con 0 descargas y 0 likes en el momento de la consulta, sin resultados de evaluación publicados y con datos de entrenamiento limitados a 209 episodios. Es un artefacto útil como referencia técnica y como plantilla de entrenamiento, no como modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + action transformer con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la entrada es visión + estado + instrucción de tarea, no texto largo) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (la instrucción de tarea es en inglés: "Pick up the green object and put it in the box.") |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (librería LeRobot) |
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras | `wrist`, `overhead` (3×480×640 cada una) |
| Entrada de estado | `observation.state` de forma (6,) |
| Salida de acción | `action` de forma (6,) |
| Dataset de entrenamiento | yudai0209/so101_expo_snack_r123_canon (209 episodios, 92.646 frames, 30 FPS) |
| Pasos de entrenamiento | 20.000 |
| Tamaño del repositorio | 38,1 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA: un backbone de visión-lenguaje basado en Cosmos-Reason2/Qwen3-VL que procesa las imágenes de las dos cámaras y la instrucción de tarea, acoplado a un action transformer que genera las acciones mediante flow matching. La predicción está condicionada conjuntamente por visión, lenguaje y propiocepción (el estado de 6 dimensiones del robot). El resultado es una secuencia de acciones de 6 dimensiones que se ejecuta a 30 FPS sobre el SO-101.

El entrenamiento se realizó con LeRobot 0.7.1 durante 20.000 pasos, con batch size 32, optimizador AdamW, learning rate 1e-4 y semilla 42. El dataset contiene 209 episodios y 92.646 frames grabados a 30 FPS, todos correspondientes a la tarea "Pick up the green object and put it in the box." No se documenta en la información disponible el número de tokens de entrenamiento del backbone, la composición del dataset más allá de la tarea, ni si hubo etapas de RLHF/DPO (poco habituales en políticas de imitación robótica). Tampoco se especifica si el backbone se congeló o se hizo fine-tuning completo.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad para el brazo SO-101 a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: consume simultáneamente una vista de muñeca y una vista cenital a 480×640.
- Condicionamiento por lenguaje: acepta una instrucción textual de tarea, aunque en este checkpoint está especializado en una única frase.
- Imitación de políticas (imitation learning): reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Inferencia en tiempo real: pensado para ejecutarse a 30 FPS en bucle cerrado con `lerobot-rollout`.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante CLI (`lerobot-train`, `lerobot-rollout`).
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual general, matemáticas, código, audio ni visión de propósito general; el backbone VLM se usa como extractor de representaciones, no como chatbot.

## Casos de uso

- Recogida de objetos en línea de montaje: la política está entrenada para detectar un objeto verde y colocarlo en una caja; puede desplegarse en una celda de pick-and-place de bajo coste con un SO-101 y dos cámaras USB.
- Prototipado de investigación en imitación: sirve como referencia reproducible para validar el pipeline completo de LeRobot con GR00T (grabación, entrenamiento, rollout) antes de escalar a tareas propias.
- Benchmark interno de hardware: al ser un checkpoint concreto y acotado, permite medir latencia y throughput reales de GR00T N1.7 en GPUs de consumo frente a GPUs de datacenter.
- Educación y formación: útil para demostrar a estudiantes cómo un modelo visión-lenguaje-acción traduce instrucciones y píxeles en comandos motores, con un coste de hardware asequible.
- Base para fine-tuning posterior: el checkpoint puede servir de inicialización para tareas similares de manipulación (recogida y depósito) con dominios visuales parecidos.
- Evaluación de robustez visual: al tener vistas de muñeca y cenital, permite estudiar cómo afectan cambios de iluminación, posición de cámara o distractores al éxito de la política.
- Automatización de tareas repetitivas de laboratorio: clasificación y depósito de piezas pequeñas en entornos controlados con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, latencias ni comparativas numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 3.144.016.000 parámetros en safetensors (38,1 GB de repositorio), una carga en precisión nativa (fp16/bf16) requiere del orden de 6-7 GB solo para pesos, más memoria para activaciones del backbone VLM y del action transformer; en fp32 se duplicaría. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no especificadas. Por tamaño, una GPU con 16-24 GB de VRAM (RTX 4090, A5000, L40S) es un punto de partida razonable; A100/H100 aportarían margen para batch mayor y menor latencia.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) y quizá en RTX 4080/3090 (16-24 GB) con precisión reducida; no confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`), que internamente usa PyTorch. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de política.
- Latencia y throughput: no disponibles. La política está pensada para ejecutarse a 30 FPS, pero no se publica latencia medida por paso de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101_expo_snack_r123_canon_groot17 (este) | 3.144.016.000 | 2 imágenes 480×640 + estado (6,) + instrucción | Pick-and-place específico en SO-101 | no disponible | Hugging Face (0 descargas) |
| GR00T N1.7 base (NVIDIA) | no disponible en la información | Visión + lenguaje + propiocepción | Modelo fundacional cross-embodiment | open (según NVIDIA Isaac-GR00T) | GitHub NVIDIA/Isaac-GR00T |
| Políticas ACT / Diffusion Policy en LeRobot | típicamente decenas de millones | Imágenes + estado | Imitación por tarea | según checkpoint | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparables (tasas de éxito, latencia) entre estos modelos en la información proporcionada. La comparación se limita a parámetros, entradas y licencia.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea ("Pick up the green object and put it in the box.") y un único robot (SO-101); no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito, por lo que se desconoce su robustez real ante cambios de iluminación, posición de objetos o distractores.
- Dataset pequeño: 209 episodios y 92.646 frames son una base limitada; el riesgo de sobreajuste al entorno de grabación es alto.
- Licencia no disponible: la model card marca la licencia como "[More Information Needed]", lo que impide confirmar si el uso comercial está permitido. No debe usarse en producción sin aclarar este punto.
- Dependencia de hardware concreto: requiere un SO-101 calibrado y dos cámaras con los nombres `wrist` y `overhead`; cualquier cambio en la configuración invalida la política.
- Riesgo de alucinación motora: como toda política de imitación, puede generar acciones fuera de distribución ante escenas no vistas, con riesgo de colisión o daño al robot; se recomienda supervisión y límites de par.
- Idiomas: la instrucción de tarea está en inglés y el modelo no se ha documentado para otras lenguas.
- Sesgos: no documentados, pero el dataset refleja un único entorno físico y un único operador; los sesgos de posición, iluminación y objetos del dataset se heredan.
- Madurez: 0 descargas y 0 likes; es un artefacto de investigación sin validación comunitaria.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/yudai0209/so101_expo_snack_r123_canon_groot17
- Dataset de entrenamiento: https://huggingface.co/datasets/yudai0209/so101_expo_snack_r123_canon
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=yudai0209/so101_expo_snack_r123_canon
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
