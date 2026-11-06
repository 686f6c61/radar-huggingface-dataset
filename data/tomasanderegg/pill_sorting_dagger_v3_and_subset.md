# TomasAnderegg/pill_sorting_dagger_v3_and_subset

## Resumen

`pill_sorting_dagger_v3_and_subset` es una política de visión-lenguaje-acción (VLA) basada en SmolVLA, desarrollada por TomasAnderegg y publicada en Hugging Face bajo licencia Apache 2.0. El modelo resuelve una tarea robótica concreta de manipulación: clasificar píldoras de distintos colores (azul, verde, amarillo y rojo) en compartimentos con formas geométricas (triángulo, cuadrado, círculo y cruz) mediante un brazo robótico tipo `so_follower`.

Se trata de un fine-tuning del modelo `pill_sorting_vlm_unfrozen_A100`, entrenado con LeRobot 0.6.2 sobre un conjunto de datos de 102 episodios y 72.405 fotogramas a 30 FPS, recogidos mediante un proceso de DAgger (el nombre del repositorio lo sugiere). El modelo consume una imagen frontal de 480x640 píxeles y un vector de estado de 6 dimensiones, y produce una acción de 6 dimensiones, lo que lo hace directamente desplegable en un robot físico.

Con 450 millones de parámetros y un tamaño de repositorio de 7,9 GB, es un modelo compacto pensado para ejecutarse en hardware de consumo, en línea con la filosofía de SmolVLA de ofrecer un rendimiento competitivo a bajo coste computacional. Su relevancia radica en ser un ejemplo práctico y reproducible de cómo adaptar un VLA genérico a una tarea de manipulación específica con un conjunto de datos relativamente pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Camaras | `front` |
| Entrada (estado) | `observation.state` de forma `(6,)` |
| Entrada (visual) | `observation.images.front` de forma `(3, 480, 640)` |
| Salida (accion) | `action` de forma `(6,)` |
| Frecuencia de datos | 30 FPS |
| Version de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

El modelo se basa en SmolVLA, una arquitectura VLA compacta que combina un codificador visual, un modelo de lenguaje y un cabezal de acciones para mapear observaciones multimodales (imagen y estado propioceptivo) a comandos motores. SmolVLA está diseñado para ser eficiente computacionalmente y desplegable en hardware de consumo, a diferencia de VLA de mayor escala como OpenVLA o RT-2. El modelo parte de `TomasAnderegg/pill_sorting_vlm_unfrozen_A100`, un checkpoint previo del mismo autor, y se ha afinado sobre el dataset `pill_sorting_finetune_merged_v3`.

El entrenamiento se realizó con LeRobot 0.6.2 durante 3.000 pasos, con un tamaño de lote de 64, optimizador AdamW, tasa de aprendizaje 3e-05 y semilla 1000. El dataset contiene 102 episodios y 72.405 fotogramas a 30 FPS, con 12 tareas de instrucción en lenguaje natural que combinan cuatro colores de píldora y cuatro compartimentos. El nombre del repositorio sugiere el uso de DAgger (Dataset Aggregation) para la recogida de datos, aunque la model card no detalla explícitamente el proceso de recogida ni si hubo fases de RLHF o DPO. No se especifica el número de tokens de entrenamiento ni la composición completa del dataset más allá de los episodios y fotogramas indicados.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para un brazo `so_follower` a partir de una imagen frontal y el estado del robot.
- Comprensión de instrucciones en lenguaje natural: acepta 12 tareas distintas que combinan color de píldora y forma de compartimento.
- Percepción visual: procesa imágenes RGB de 480x640 píxeles en tiempo real a 30 FPS.
- Ejecución de políticas de imitación: entrenado para replicar comportamientos demostrados en el dataset.
- Despliegue en hardware de consumo: el tamaño de 450 M de parámetros permite inferencia en GPU de gama media.
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` y `lerobot-train` para ejecución y reentrenamiento.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso ni capacidades multilingües.

## Casos de uso

- Clasificación automatizada de píldoras en entornos farmacéuticos: el modelo puede colocar píldoras de distintos colores en compartimentos con formas específicas, lo que lo hace adecuado para prototipos de sistemas de dispensación o verificación de medicamentos en laboratorio.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para estudiar DAgger y fine-tuning de VLA en tareas de manipulación con datasets pequeños (102 episodios).
- Benchmarking de políticas VLA en robótica de bajo coste: al ejecutarse en hardware de consumo, permite comparar el rendimiento de SmolVLA frente a otros VLA en un entorno controlado y con instrucciones en lenguaje natural.
- Docencia y formación en robótica: el modelo y su dataset asociado permiten a estudiantes reproducir el pipeline completo de LeRobot (grabación, entrenamiento, despliegue) con un caso concreto y acotado.
- Pruebas de integración de LeRobot en pipelines de producción: útil para validar la CLI `lerobot-rollout`, la gestión de cámaras y la configuración de robots `so_follower` antes de escalar a tareas más complejas.
- Desarrollo de sistemas de pick-and-place con instrucciones verbales: el modelo demuestra cómo mapear comandos como "Put the blue pill in the triangle compartment" a trayectorias de manipulación, extensible a otras tareas de clasificación de objetos.
- Validación de técnicas de aumento de datos y DAgger: el nombre del repositorio y el tamaño del dataset lo convierten en un caso de estudio para evaluar la contribución de la agregación de datos al rendimiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con una plantilla para reportar tasas de éxito en robot real, pero no se han proporcionado datos numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en safetensors (7,9 GB de repositorio, que incluye checkpoints y posibles estados del optimizador), la inferencia en precisión completa requeriría del orden de 2-3 GB de VRAM, aunque este dato no está confirmado en la documentación.
- GPU recomendadas: el modelo base fue entrenado en una A100 (según el nombre `pill_sorting_vlm_unfrozen_A100`), pero SmolVLA está diseñado para hardware de consumo; se recomienda una GPU con al menos 8 GB de VRAM para inferencia.
- Compatibilidad con GPU de consumo: sí, por el tamaño del modelo (450 M de parámetros) es plausible que quepa en RTX 3060, RTX 4060, RTX 4090 y similares, aunque no se confirma en la model card.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte para `--policy.device=cuda`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política robótica.
- Latencia y throughput: no disponibles; el modelo opera a 30 FPS en los datos de entrenamiento, pero no se especifica la latencia de inferencia en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pill_sorting_dagger_v3_and_subset` (este) | 450 M | no disponible | Clasificación de píldoras con `so_follower` | Apache 2.0 | Hugging Face |
| SmolVLA (base) | no disponible | no disponible | VLA genérico para manipulación | no disponible | Hugging Face |
| OpenVLA | 7 B | no disponible | VLA genérico para manipulación | no disponible | Hugging Face |
| RT-2 | no disponible | no disponible | VLA genérico (Google DeepMind) | no disponible | No público |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha sido entrenado para 12 tareas concretas de clasificación de píldoras; no generaliza a otros objetos, colores o compartimentos fuera del dataset.
- Dependencia del entorno: el rendimiento puede degradarse con cambios en iluminación, posición de las píldoras, fondo o configuración de la cámara, tal como advierte la plantilla de evaluación de la model card.
- Dataset pequeño: 102 episodios y 72.405 fotogramas es un volumen reducido, lo que aumenta el riesgo de sobreajuste y de fallos en condiciones no vistas.
- Sin evaluación publicada: no hay tasas de éxito reportadas en robot real, por lo que se desconoce su fiabilidad en producción.
- Riesgo de alucinación motora: como política de imitación, puede generar acciones incorrectas o inseguras ante observaciones fuera de distribución.
- Sesgos: no documentados, pero al estar entrenado con un único robot, cámara y entorno, hereda los sesgos de ese setup experimental.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el usuario asume el riesgo de despliegue.
- Idiomas: no se documentan capacidades multilingües; las instrucciones del dataset están en inglés.
- Sin soporte de tool calling ni agentes: no es un modelo de lenguaje general, sino una política robótica; no debe usarse para tareas de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TomasAnderegg/pill_sorting_dagger_v3_and_subset
- Modelo base: https://huggingface.co/TomasAnderegg/pill_sorting_vlm_unfrozen_A100
- Dataset de entrenamiento: https://huggingface.co/datasets/TomasAnderegg/pill_sorting_finetune_merged_v3
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=TomasAnderegg/pill_sorting_finetune_merged_v3
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
