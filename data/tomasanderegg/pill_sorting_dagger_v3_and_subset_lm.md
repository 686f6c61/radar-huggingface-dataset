# TomasAnderegg/pill_sorting_dagger_v3_and_subset_LM

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-acción (VLA) desarrollado por Hugging Face, diseñado para control robótico mediante imitación y desplegable en hardware de consumo. Esta ficha concreta corresponde a un fine-tune específico del autor TomasAnderegg sobre la arquitectura SmolVLA, entrenado para una tarea de clasificación de píldoras por color y forma en compartimentos geométricos. El modelo base es `TomasAnderegg/pill_sorting_dagger_v3_and_subset`, y se ha entrenado con el dataset `TomasAnderegg/pill_sorting_finetune_merged_v3`.

El modelo consume una observación compuesta por el estado del robot (vector de 6 dimensiones) y una imagen frontal de 480x640 píxeles, y produce un vector de acción de 6 dimensiones. Con 450 millones de parámetros, se posiciona como una política de robótica ligera, apta para inferencia en tiempo real a 30 FPS sobre robots tipo `so_follower` (SO-100/SO-101 de LeRobot).

Es relevante porque demuestra el flujo completo de fine-tuning de SmolVLA para tareas manipulativas concretas con pocos datos (102 episodios, 72.405 frames), un patrón cada vez más habitual en robótica de imitación de bajo coste. La licencia Apache 2.0 facilita su reutilización y adaptación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), transformer multimodal con cabeza de acción |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA compacto que combina un codificador visual, un modelo de lenguaje pequeño y una cabeza de predicción de acciones, siguiendo el paradigma de políticas de imitación condicionadas por lenguaje. El modelo recibe observaciones multimodales (estado propioceptivo de 6 dimensiones e imagen RGB frontal de 480x640) junto con una instrucción de tarea en lenguaje natural, y emite directamente acciones de 6 dimensiones para el robot `so_follower`. La arquitectura exacta de bloques, el backbone de lenguaje y el número de tokens de entrenamiento del modelo base no están detallados en la información disponible.

El fine-tune se realizó con LeRobot 0.6.2 sobre 102 episodios y 72.405 frames a 30 FPS, con 2.000 pasos de entrenamiento, batch de 64, optimizador AdamW y learning rate de 1e-5, semilla 1000. El dataset cubre 12 tareas de instrucción que combinan cuatro colores de píldora (azul, verde, amarillo, rojo) y tres formas de compartimento (triángulo, cuadrado, cruz, círculo). No se documentan detalles sobre RLHF, DPO ni innovaciones de decodificación específicas para este fine-tune.

## Capacidades

- Control robótico por imitación condicionado por instrucciones en lenguaje natural.
- Percepción visual a partir de una única cámara frontal (RGB 480x640).
- Predicción de acciones de 6 grados de libertad para el robot `so_follower`.
- Ejecución de 12 tareas específicas de clasificación de píldoras por color y forma.
- Inferencia en tiempo real a 30 FPS (frecuencia de entrenamiento del dataset).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, ni capacidades de audio.
- Capacidades multilingües: no disponibles; las instrucciones de tarea están en inglés.

## Casos de uso

- Clasificación automatizada de píldoras en entornos de laboratorio: el modelo ejecuta instrucciones como "Put the blue pill in the triangle compartment" sobre un robot SO-100/SO-101, adecuado para prototipos de manipulación farmacéutica.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible para estudiar fine-tuning de SmolVLA con datasets pequeños (102 episodios) y evaluar la generalización entre colores y formas.
- Benchmark de políticas VLA de bajo coste: al caber en hardware de consumo, permite comparar variantes de SmolVLA en tareas de sorting sin acceso a clústeres GPU.
- Prototipado de líneas de montaje educativas: útil en cursos de robótica donde se enseña el ciclo completo de grabación de datos, entrenamiento y despliegue con LeRobot.
- Validación de pipelines DAgger: el nombre del modelo base sugiere uso de DAgger (Dataset Aggregation) para iterar políticas; este fine-tune sirve para validar dicho bucle con un subconjunto de tareas.
- Demostraciones interactivas en ferias o laboratorios: la inferencia a 30 FPS y la simplicidad del setup (una cámara, un robot) facilitan demos en vivo.
- Base para transferencia a otras tareas de sorting: al estar bajo Apache 2.0 y ser un fine-tune de SmolVLA, se puede reentrenar con nuevos objetos o compartimentos partiendo de estos pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación sin completar y no reporta tasas de éxito en robot real ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en fp32 se requieren aproximadamente 1,8 GB solo para pesos, más activaciones y buffer de imagen (el repo ocupa 8,6 GB, probablemente por checkpoints de entrenamiento).
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) debería ser suficiente para inferencia.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 4-6 GB de VRAM, aunque el dato no está confirmado en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) con `--policy.path=TomasAnderegg/pill_sorting_dagger_v3_and_subset_LM`; el ecosistema LeRobot es el soportado oficialmente. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el dataset se grabó a 30 FPS, lo que sugiere que el modelo está pensado para operar a esa frecuencia, pero no se publican medidas de latencia ni throughput reales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (pill_sorting_dagger_v3_and_subset_LM) | 450 M | no disponible | Sorting de píldoras (SO follower) | Apache 2.0 | Hugging Face, 40 descargas |
| SmolVLA base (Hugging Face) | ~450 M (familia SmolVLA) | no disponible | VLA generalista | Apache 2.0 | Hugging Face |
| Otros fine-tunes de SmolVLA en LeRobot Hub | variable | no disponible | Tareas manipulativas diversas | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo está entrenado exclusivamente con cuatro colores de píldora y cuatro formas de compartimento; no generalizará a otros objetos, colores o geometrías sin reentrenamiento.
- Riesgo de alucinación: como política de imitación, puede generar acciones incorrectas o inseguras ante posiciones de objetos, iluminación o configuraciones de cámara distintas a las del dataset de entrenamiento.
- Limitaciones de contexto e idioma: las instrucciones de tarea están en inglés y limitadas a las 12 frases del dataset; no hay soporte multilingüe documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; el modelo base y el dataset deben verificarse por separado.
- Caveat para producción: la model card no reporta tasas de éxito ni evaluación en robot real; antes de desplegar en producción es imprescindible evaluar la política en el entorno objetivo con múltiples repeticiones.
- Dependencia del ecosistema LeRobot 0.6.2: cambios de versión pueden romper la compatibilidad de carga del checkpoint.
- El nombre del modelo base sugiere entrenamiento con DAgger sobre un subconjunto de tareas; conviene revisar el dataset y el modelo base para entender la cobertura real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TomasAnderegg/pill_sorting_dagger_v3_and_subset_LM
- Modelo base: https://huggingface.co/TomasAnderegg/pill_sorting_dagger_v3_and_subset
- Dataset de entrenamiento: https://huggingface.co/datasets/TomasAnderegg/pill_sorting_finetune_merged_v3
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=TomasAnderegg/pill_sorting_finetune_merged_v3
