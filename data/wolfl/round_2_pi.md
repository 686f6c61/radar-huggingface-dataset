# wolfL/round_2_pi

## Resumen

`wolfL/round_2_pi` es un ajuste fino (fine-tuning) del modelo visión-lenguaje-acción π₀.₅ (Pi05) de Physical Intelligence, publicado por el usuario wolfL a través de la librería LeRobot de Hugging Face. El modelo base, `lerobot/pi05_base`, implementa la arquitectura Pi05, diseñada para generalización en entornos abiertos: parte de π₀ y se entrena para operar en situaciones y entornos no vistos durante el entrenamiento previo. Este checkpoint concreto ha sido especializado para una tarea robótica de manipulación con un robot tipo `so_follower` (SO-100/SO-101 de LeRobot), equipado con dos cámaras (superior y de muñeca).

El modelo consume un estado proprioceptivo de 6 dimensiones y dos flujos de imagen (480×640 y 640×480) y produce un vector de acción de 6 dimensiones. Se ha entrenado sobre un dataset propio de 39 episodios y 32.111 fotogramas a 30 FPS para la tarea "drop square in the bucket and place traingel in the board" (introducir un cuadrado en un cubo y colocar un triángulo en un tablero). Con 4.143.404.816 parámetros y un repositorio de 9,4 GB, es un modelo de tamaño medio pensado para inferencia en tiempo real sobre hardware de consumo o estaciones de trabajo con GPU.

Su relevancia radica en que demuestra el flujo completo de imitación robótica de extremo a extremo con LeRobot: grabación de datos, entrenamiento de una política VLA y despliegue en un robot real de bajo coste. No obstante, se trata de un experimento personal sin evaluación publicada ni métricas de éxito, por lo que debe considerarse un artefacto de investigación y no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) Pi05, derivada de π₀ de Physical Intelligence; implementación LeRobot/OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto multilingüe) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Pi05, un modelo visión-lenguaje-acción que combina un codificador visual (procesa las imágenes de las cámaras `top` y `wrist`), un componente lingüístico que interpreta la instrucción de tarea y un decodificador de acciones que genera comandos motores de 6 dimensiones. La implementación procede del repositorio OpenPI de Physical Intelligence, adaptada a LeRobot. El modelo base `lerobot/pi05_base` se ha preentrenado para generalización en entornos abiertos, y este checkpoint lo especializa mediante aprendizaje por imitación supervisado sobre demostraciones de un robot concreto.

El entrenamiento se realizó con 20.000 pasos, tamaño de lote 1, optimizador AdamW, tasa de aprendizaje 2,5e-05 y semilla 1000, usando LeRobot 0.7.0. El dataset consta de 39 episodios y 32.111 fotogramas a 30 FPS, una cantidad reducida de datos típica de un experimento de imitación de una sola tarea. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación, ni el número de tokens de preentrenamiento del modelo base (no disponible). Tampoco se detallan innovaciones como decodificación especulativa o atención lineal en la información proporcionada.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad para un robot `so_follower` a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa simultáneamente una vista superior y una vista de muñeca.
- Seguimiento de instrucciones en lenguaje natural: la tarea se especifica mediante un prompt de texto ("drop square in the bucket and place traingel in the board").
- Aprendizaje por imitación: ejecuta políticas entrenadas a partir de demostraciones teleoperadas.
- Generalización a entornos abiertos: heredada del modelo base Pi05, aunque no verificada para este checkpoint.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades de audio.

## Casos de uso

- Manipulación de objetos en línea de montaje: el modelo puede recoger piezas y colocarlas en contenedores o soportes, como demuestra la tarea de entrenamiento (cuadrado al cubo, triángulo al tablero).
- Clasificación y ordenación de piezas: con dos cámaras (superior y muñeca) puede distinguir formas y posiciones y ejecutar la colocación correspondiente.
- Investigación en aprendizaje por imitación: sirve como referencia para reproducir el flujo de LeRobot (grabación, entrenamiento y despliegue) con un robot de bajo coste.
- Prototipado rápido de políticas robóticas: al estar entrenado con solo 39 episodios, ejemplifica cuántos datos mínimos se necesitan para una tarea acotada.
- Docencia y formación en robótica: permite a estudiantes desplegar una política VLA real sobre hardware SO-100/SO-101.
- Base para ajustes finos adicionales: puede reentrenarse con nuevos datasets para tareas de pick-and-place similares usando `lerobot-train`.
- Evaluación comparativa de políticas VLA: útil como punto de partida para medir la transferencia de Pi05 a tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4.143 millones de parámetros, en FP16 se requerirían aproximadamente 8,3 GB solo para los pesos, más memoria para activaciones y procesamiento de imágenes.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU con 16-24 GB (RTX 4090, A100 40 GB, L40S) sería adecuada para FP16; una RTX 3090/4080 de 16 GB podría ser suficiente con cuantización o gestión cuidadosa de memoria.
- ¿Cabe en GPU de consumo? Probablemente sí en GPUs de gama alta con 16 GB o más, aunque no se documenta oficialmente.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) con `--policy.path=wolfL/round_2_pi`; el modelo base se entrena con `lerobot-train` en CUDA. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI (orientados a LLMs, no a políticas VLA).
- Latencia y throughput: no disponibles; la tarea se ejecuta a 30 FPS en el dataset, pero no se publican cifras de inferencia en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wolfL/round_2_pi | 4.143 M | no disponible | Manipulación robótica (SO follower) | gemma | Hugging Face (LeRobot) |
| lerobot/pi05_base | no disponible en la informacion | no disponible | VLA generalista (base) | gemma (según modelo base) | Hugging Face (LeRobot) |
| π₀ (Pi0) | no disponible en la informacion | no disponible | VLA generalista | no disponible | OpenPI (Physical Intelligence) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay métricas de tasa de éxito en robot real, por lo que se desconoce su fiabilidad.
- Dataset muy reducido: 39 episodios y una sola tarea; la generalización a variaciones de posición, iluminación u objetos es incierta.
- Especialización estrecha: entrenado para "drop square in the bucket and place traingel in the board"; no se espera que funcione en otras tareas sin reentrenamiento.
- Dependencia de hardware concreto: asume un robot `so_follower` con cámaras `top` y `wrist` en resoluciones específicas; los nombres e índices de cámara deben coincidir.
- Licencia Gemma: sujeta a los Gemma Terms of Use, con posibles restricciones para uso comercial; conviene revisarlas antes de producción.
- Riesgo de alucinación motora: como toda política de imitación, puede generar acciones erráticas ante observaciones fuera de distribución.
- Sin información sobre sesgos, idiomas ni robustez; no apto para aplicaciones de seguridad crítica sin validación adicional.
- Repositorio personal sin mantenimiento documentado (0 descargas, 0 likes en el momento de la consulta).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wolfL/round_2_pi
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/wolfL/round_2_20261124_160314
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=wolfL/round_2_20261124_160314
- Blog de Pi05 (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
