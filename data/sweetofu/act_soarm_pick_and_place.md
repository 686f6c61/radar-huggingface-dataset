# Sweetofu/ACT_SoArm_pick_and_place

## Resumen

ACT_SoArm_pick_and_place es una política de robótica entrenada mediante aprendizaje por imitación con el método ACT (Action Chunking with Transformers), publicado en el paper arXiv:2304.13705. El modelo lo desarrolla el usuario Sweetofu y se distribuye a través de Hugging Face dentro del ecosistema LeRobot de Hugging Face. Su función no es generar texto, sino controlar un brazo robótico: recibe el estado articular y tres flujos de imagen de cámara, y produce directamente comandos de acción de 6 grados de libertad para ejecutar la tarea de recoger y colocar objetos ("pick and place").

Se trata de un modelo compacto, con 51.668.614 parámetros en formato safetensors y un repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras capaces de ejecutarse en hardware de consumo. La arquitectura es un transformer con encoder de observaciones (imágenes y estado) y decoder de acciones, con un componente CVAE para modelar la multimodalidad de las demostraciones humanas. Frente a la predicción paso a paso, ACT predice fragmentos ("chunks") de acciones, lo que reduce el error acumulado y permite frecuencias de control altas.

Su relevancia actual radica en que forma parte de la ola de modelos robóticos abiertos y reproducibles impulsados por LeRobot y por plataformas de hardware libre como el brazo SO-101 (SO-ARM101). Constituye un ejemplo práctico y de bajo coste de cómo entrenar una política de manipulación desde cero con 80 episodios teleoperados y desplegarla en un robot real, sin necesidad de clústeres de GPU ni de datasets a escala de millones de episodios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con CVAE para aprendizaje por imitación |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplicable (política de control robótico, no procesa secuencias de texto) |
| Tipos de cuantización | no disponible (pesos distribuidos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no aplicable (no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Tipo de robot | so_follower (brazo SO-101 / SO-ARM101) |
| Cámaras | top, wrist, belly (3 × RGB 480 × 640) |
| Entrada: estado | observation.state, shape (6,) |
| Entrada: visión | observation.images.top / .wrist / .belly, shape (3, 480, 640) |
| Salida: acción | action, shape (6,) |
| Dataset de entrenamiento | Sweetofu/pick_and_place (80 episodios, 31.313 frames, 30 FPS) |
| Tarea | "pick_and_place" |
| Descargas | 0 |
| Likes | 0 |
| Tamaño del repositorio | 0,2 GB |
| Fecha de creación | 2026-09-28 |
| Última actualización | 2026-09-28 |

## Arquitectura y entrenamiento

El modelo implementa ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso, genera un chunk de acciones futuras. La arquitectura combina un encoder transformer que procesa las observaciones (tres imágenes RGB de 480 × 640 junto con el vector de estado articular de dimensión 6) y un decoder transformer que produce la secuencia de acciones de 6 grados de libertad. Un componente CVAE (autoencoder variacional condicional) modela la variabilidad de las demostraciones teleoperadas, de modo que la política puede representar múltiples formas válidas de completar la tarea en lugar de promediarlas y producir trayectorias ambiguas.

El entrenamiento se realizó con LeRobot versión 0.6.2 sobre el dataset Sweetofu/pick_and_place, compuesto por 80 episodios y 31.313 frames grabados a 30 FPS, todos ellos correspondientes a la tarea "pick_and_place". La configuración registrada es de 50.000 pasos de entrenamiento, batch size 8, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. No se documenta en la información disponible el uso de RLHF, DPO ni fases de ajuste con preferencias humanas, algo por otra parte coherente con un pipeline de imitación supervisada para control motor. Tampoco se detalla la composición de aumentos de datos, la política de ensamblado temporal de chunks ni el número exacto de acciones por chunk.

## Capacidades

- Manipulación robótica de tipo pick and place sobre un brazo SO-101 (so_follower) con espacio de acciones de 6 dimensiones.
- Fusión multimodal de tres cámaras (top, wrist y belly) más el estado articular, lo que aporta información de escena y de propiocepción.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas ni de simulación.
- Predicción de chunks de acciones, que mejora la coherencia temporal y la suavidad del movimiento frente a políticas paso a paso.
- Ejecución en bucle cerrado sobre hardware real mediante el comando `lerobot-rollout`.
- Reentrenamiento y ajuste fino sobre nuevos datasets a través de `lerobot-train` con `--policy.type=act`.
- Capacidad de condicionarse a una etiqueta de tarea textual ("pick_and_place"), usada como identificador de tarea y no como comprensión de lenguaje.

No se documenta soporte de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües, visión generalista, audio ni modo "thinking", por tratarse de una política de control motor y no de un modelo de lenguaje o multimodal generalista.

## Casos de uso

- Recogida y colocación automatizada en laboratorio: el modelo ejecuta la tarea "pick_and_place" sobre un brazo SO-101 con tres cámaras, adecuado para prototipos de manipulación de bajo coste donde no se dispone de celdas industriales.
- Banco de pruebas para investigación en aprendizaje por imitación: sirve como baseline reproducible de ACT con configuración de entrenamiento conocida (50.000 pasos, batch 8, lr 1e-05) para comparar variantes de arquitectura o de aumentos de datos.
- Replicación de experimentos de LeRobot: al estar publicado con la librería lerobot 0.6.2, permite reproducir el pipeline completo de grabación, entrenamiento y despliegue documentado en las guías oficiales.
- Docencia y formación en robótica: es un ejemplo didáctico de extremo a extremo, desde la teleoperación y el dataset hasta la inferencia en tiempo real, con un modelo de solo 51,7 millones de parámetros.
- Ajuste fino sobre tareas nuevas: partiendo de estos pesos, se puede reentrenar con un dataset propio para tareas de manipulación similares, aprovechando que la licencia apache-2.0 permite uso comercial y modificación.
- Integración en pipelines de recogida de datos: el modelo puede emplearse como política base en bucles de evaluación que generen nuevos episodios y amplíen el dataset original.
- Despliegue en hardware de bajo consumo: con 51,7 millones de parámetros, la política puede ejecutarse en equipos con GPU modesta o incluso en CPU, lo que facilita pruebas en robots de escritorio.
- Comparación de estrategias de control: al ser un modelo ACT, permite contrastar empíricamente frente a alternativas como Diffusion Policy u otras políticas disponibles en LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente el apartado "Evaluation" vacío, con la nota "_No evaluation results have been provided for this policy yet_", por lo que no existen tasas de éxito, número de ensayos ni condiciones de prueba documentadas para esta política concreta.

| Benchmark | Resultado |
|---|---|
| Tasa de éxito en robot real | no disponible |
| Número de ensayos por tarea | no disponible |
| MMLU / HumanEval / GSM8K | no aplicable (no es un modelo de lenguaje) |
| Comparación con otras políticas | no disponible |

## Requisitos de hardware

- Tamaño de pesos en fp32: aproximadamente 207 MB (51.668.614 parámetros × 4 bytes).
- Tamaño de pesos en fp16/bf16: aproximadamente 103 MB.
- VRAM estimada para inferencia: del orden de 1 a 2 GB, incluyendo pesos y activaciones de las tres cámaras de 480 × 640; no se dispone de una medición oficial publicada para esta política.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente en la práctica; una RTX 3060, RTX 4060 o superior cubre el caso con holgura. No se requieren A100 ni H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida suficiente.
- Ejecución en CPU: viable por el reducido tamaño del modelo, aunque con menor frecuencia de control; no se documenta latencia concreta.
- Frecuencia de control objetivo: 30 FPS, coherente con la tasa de captura del dataset de entrenamiento.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con `--policy.path=Sweetofu/ACT_SoArm_pick_and_place`; el entrenamiento se realiza con `lerobot-train` en PyTorch. vLLM, llama.cpp, Ollama y TGI no aplican, ya que son servidores de inferencia para modelos de lenguaje y esta es una política de control robótico.
- Entrenamiento: 50.000 pasos con batch size 8 y AdamW; requiere GPU con soporte CUDA (`--policy.device=cuda`), aunque no se especifica el modelo de GPU usado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Método | Parámetros | Robot | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sweetofu/ACT_SoArm_pick_and_place | ACT | 51.668.614 | so_follower | 80 episodios, 31.313 frames | apache-2.0 | Hugging Face, 0 descargas |
| ViVi-AI/ACT_so101_pick_place | ACT | no disponible | SO-101 | no disponible | no disponible | Hugging Face |
| Políticas ACT genéricas de LeRobot | ACT | no disponible | varios | no disponible | no disponible | Hugging Face / repositorio LeRobot |
| Diffusion Policy (familia alternativa) | difusión para control | no disponible | varios | no disponible | no disponible | literatura y repositorios públicos |

No se dispone de datos de rendimiento, tamaño ni configuración de entrenamiento de las alternativas citadas, por lo que la comparación se limita a método, plataforma y licencia. Ni la model card ni los resultados de búsqueda aportan cifras de parámetros o de tasa de éxito para ViVi-AI/ACT_so101_pick_place ni para las políticas ACT genéricas de LeRobot.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito publicadas, por lo que se desconoce la fiabilidad real de la política en el robot.
- Especialización estrecha: está entrenada únicamente para la tarea "pick_and_place" sobre un brazo so_follower; no generaliza a otras tareas sin reentrenamiento.
- Dependencia del montaje de sensores: las cámaras deben llamarse exactamente top, wrist y belly y colocarse de forma coherente con el entrenamiento; cualquier cambio de posición, iluminación o fondo puede degradar el comportamiento.
- Riesgo de sobreajuste: 80 episodios y 31.313 frames constituyen un dataset pequeño, lo que aumenta la sensibilidad a variaciones de posición de objetos, iluminación o distracciones.
- Dependencia del hardware exacto: los pesos están calibrados para un robot so_follower concreto; usarlos en otro brazo del mismo tipo pero con offsets de calibración distintos puede fallar.
- Sin comprensión de lenguaje: la etiqueta de tarea es un identificador, no una instrucción en lenguaje natural; no admite comandos abiertos ni conversación.
- Sin capacidades de razonamiento simbólico ni de planificación multi-paso: la política reacciona a observaciones, no descompone objetivos.
- Riesgo de alucinación motora: como toda política de imitación, puede generar trayectorias plausibles pero incorrectas cuando la escena se aleja de la distribución de entrenamiento, sin señal de incertidumbre asociada.
- Repositorio sin tracción: cero descargas y cero likes, sin historial de uso por terceros que permita validar su comportamiento.
- Licencia permisiva pero sin garantías: apache-2.0 permite uso comercial y modificación, pero no ofrece ninguna garantía de seguridad ni de idoneidad para aplicaciones físicas; el despliegue sobre hardware real conlleva riesgo de daños materiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sweetofu/ACT_SoArm_pick_and_place
- Dataset de entrenamiento: https://huggingface.co/datasets/Sweetofu/pick_and_place
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Sweetofu/pick_and_place
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Política comparable en Hugging Face: https://huggingface.co/ViVi-AI/ACT_so101_pick_place
- Tutorial de pick and place con SO-101: https://mariogemoll.com/pick-and-place
- Vídeo tutorial de entrenamiento en SO100/SO101: https://www.youtube.com/watch?v=vC7E6ZmXBT8
