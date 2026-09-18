# SteveNguyen/sugarcube_in_mug_2cam_chunkrel_pi05_step20000

## Resumen

El modelo `SteveNguyen/sugarcube_in_mug_2cam_chunkrel_pi05_step20000` es una política robótica de tipo Vision-Language-Action (VLA) publicada por el usuario SteveNguyen en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo base `lerobot/pi05_base`, que a su vez implementa π₀.₅ (Pi05), la arquitectura VLA desarrollada por Physical Intelligence y adaptada al ecosistema LeRobot de Hugging Face desde el repositorio OpenPI. El modelo consume dos vistas de cámara y el estado del robot, y produce directamente un vector de acciones de 8 dimensiones.

El propósito del modelo es resolver una única tarea de manipulación: introducir un terrón de azúcar en una taza ("put the sugar cube in the mug"). El ajuste se ha realizado sobre un dataset propio de 150 episodios y 23.046 fotogramas grabados a 50 FPS con un robot de tipo `grabette` y dos cámaras (`cam0` y `cam1`). Con 4.143.404.816 parámetros (~4,14 mil millones) y un repositorio de 9,4 GB, es un modelo de tamaño medio dentro de la categoría VLA, publicada bajo licencia Apache-2.0.

Su relevancia es limitada y muy específica: no es un modelo de propósito general, sino una política entrenada para una tarea concreta en un montaje de hardware concreto. Resulta útil como referencia reproducible de un pipeline completo de imitation learning con LeRobot (grabación de datos, entrenamiento, despliegue con `lerobot-rollout`) y como punto de partida para nuevos ajustes finos. El autor no ha publicado resultados de evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅; implementación de LeRobot adaptada del repositorio OpenPI. Detalles internos de capas no disponibles |
| Parametros totales | 4.143.404.816 (~4,14 mil millones), según safetensors |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni INT8/INT4) |
| Idiomas soportados | no disponible; la única instrucción de tarea documentada está en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 9,4 GB, librería `lerobot`) |
| Tipo de robot | `grabette` |
| Entradas | `observation.images.cam0` (3, 360, 480), `observation.images.cam1` (3, 360, 480), `observation.state` (2,) |
| Salidas | `action` (8,) |
| Modelo base | `lerobot/pi05_base` |

## Arquitectura y entrenamiento

π₀.₅ (Pi05) es un modelo Vision-Language-Action de Physical Intelligence concebido para generalización en entornos abiertos: según la model card, evoluciona π₀ para generalizar a entornos y situaciones completamente nuevos no vistos durante el entrenamiento. La implementación utilizada aquí procede del repositorio OpenPI del propio fabricante, adaptada por Hugging Face a la librería LeRobot. La información proporcionada no detalla el número de capas, el mecanismo exacto de generación de acciones (por ejemplo, si emplea flow matching) ni la composición del corpus de preentrenamiento del modelo base.

El ajuste fino documentado se realizó con LeRobot 0.6.1 durante 20.000 pasos, con tamaño de lote 32, optimizador AdamW, tasa de aprendizaje 2,5e-05 y semilla 1000. El dataset de entrenamiento (`SteveNguyen/sugarcube_in_mug_chunkrel_2cam`) contiene 150 episodios y 23.046 fotogramas grabados a 50 FPS, todos ellos correspondientes a la misma tarea y al mismo montaje de robot y cámaras. No se menciona el uso de RLHF, DPO ni de ningún otro método de alineación; se trata de aprendizaje por imitación supervisado a partir de demostraciones. No se han documentado innovaciones técnicas adicionales específicas de este ajuste.

## Capacidades

- Generación de acciones motoras de 8 dimensiones a partir de observaciones visuales y de estado, sin bucle de texto intermedio.
- Fusión de dos cámaras simultáneas (`cam0` y `cam1`) con resolución 3x360x480 cada una.
- Condicionamiento por instrucción de lenguaje natural en inglés: la tarea documentada es "put the sugar cube in the mug".
- Ejecución de una tarea de manipulación concreta de tipo pick-and-place (colocar un terrón de azúcar dentro de una taza).
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y despliegue en robot con `lerobot-rollout`.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente, planificación multi-paso explícita ni razonamiento simbólico.
- No genera texto libre, código, matemáticas ni contenido multimodal descriptivo.
- No se documentan capacidades multilingües; el prompt de tarea empleado está en inglés.
- No se documentan capacidades de audio ni de vídeo más allá de los fotogramas de las dos cámaras.

## Casos de uso

- Manipulación pick-and-place reproducible: el modelo ejecuta directamente la tarea de introducir un terrón de azúcar en una taza sobre un robot `grabette`, lo que permite montar una celda de demostración totalmente autónoma con dos cámaras y un estado de 2 dimensiones.
- Recolección de datos para DAgger o corrección humana: los rollouts con `--strategy.type=base` permiten generar trayectorias adicionales que un operador puede corregir, ampliando el dataset original de 150 episodios.
- Punto de partida para ajustes finos en tareas relacionadas: al derivar de `lerobot/pi05_base`, se puede continuar el entrenamiento con `lerobot-train` sobre nuevos datasets de manipulación con el mismo esquema de observaciones.
- Referencia reproducible de un pipeline LeRobot completo: sirve para validar de extremo a extremo el flujo instalación, calibración de hardware, grabación, entrenamiento y despliegue documentado por Hugging Face.
- Evaluación de generalización de π₀.₅ en un entorno controlado: al ser un ajuste de una sola tarea, permite medir la degradación de la política ante cambios de iluminación, posición del objeto o distractores.
- Pruebas de latencia y throughput de políticas VLA: el modelo permite instrumentar el coste de inferencia por paso de control en GPUs concretas antes de escalar a modelos mayores.
- Prototipado en laboratorios de robótica y docencia: su licencia Apache-2.0 y su tamaño contenido facilitan su uso en prácticas de aprendizaje por imitación sin depender de modelos propietarios.
- Automatización de una celda de cocina o laboratorio muy concreta: con el utillaje y las cámaras adecuadas, puede cubrir la subtarea de depositar un objeto pequeño en un recipiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la sección de evaluación marcada como pendiente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito en robot real, ni de métricas de tipo MMLU, HumanEval o GSM8K, que por otra parte no son aplicables a una política de control motor.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del número de parámetros (4,14 mil millones): en bf16/fp16, unos 8,3 GB solo de pesos, por lo que conviene disponer de al menos 16 GB de VRAM contando activaciones y buffers de imagen.
- En fp32, los pesos ocuparían aproximadamente 16,6 GB, lo que exige GPUs de 24 GB o más.
- No se publican versiones cuantizadas (INT8, INT4, GGUF, AWQ), por lo que no se puede confirmar un despliegue por debajo de los 16 GB con garantías.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bf16. Una RTX 3090 (24 GB) o RTX 4080 (16 GB) serían el límite práctico en gama de consumo.
- Cabe en GPU de consumo de 24 GB en bf16; en tarjetas de 16 GB el margen es muy justo y depende de la implementación.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con `--policy.path=SteveNguyen/sugarcube_in_mug_2cam_chunkrel_pi05_step20000`; el entrenamiento se realiza con `lerobot-train` y `--policy.device=cuda`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de política.
- Latencia y throughput: no disponibles. El dato de 50 FPS corresponde a la frecuencia de grabación del dataset, no a la velocidad de inferencia del modelo.
- Se recomienda usar cámaras a 640x480 y 30 FPS según el ejemplo de la model card, aunque la política fue entrenada con entradas de 360x480.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (pi05 ajustado) | 4.143.404.816 | no disponible | sin resultados publicados | apache-2.0 | Hugging Face, 0 descargas y 0 likes en el momento de la consulta |
| `lerobot/pi05_base` | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Hugging Face |
| π₀ (pi0), predecesor de π₀.₅ | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | OpenPI / LeRobot |
| Otras políticas VLA del ecosistema LeRobot (por ejemplo SmolVLA) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Hugging Face |

La única comparación que puede afirmarse con la información disponible es que este modelo es un ajuste fino de `lerobot/pi05_base` y que π₀.₅ es la evolución de π₀ orientada a generalización en entornos nuevos. No se dispone de cifras verificables de parámetros, contexto o rendimiento para el resto de alternativas, por lo que no se incluyen comparaciones numéricas.

## Limitaciones y advertencias

- Modelo de una sola tarea: solo se ha entrenado para "put the sugar cube in the mug". No debe esperarse comportamiento útil fuera de esa tarea.
- Sin resultados de evaluación: no hay tasas de éxito en robot real, ni pruebas con posiciones nuevas, iluminación distinta o distractores.
- Acoplamiento estricto al hardware: fue entrenado con el robot `grabette` y las cámaras `cam0` y `cam1`; los nombres de las claves de observación deben coincidir exactamente con los del entrenamiento o la política no funcionará.
- Dataset pequeño: 150 episodios y 23.046 fotogramas para una única tarea, lo que limita la robustez y favorece el sobreajuste a las condiciones de grabación.
- Sesgo de demostración: al proceder de aprendizaje por imitación, reproduce los sesgos, la velocidad y el estilo del operador que grabó los datos, así como la disposición concreta del laboratorio.
- Riesgo de error en la acción más que de alucinación textual: la política puede generar trayectorias incorrectas o inseguras ante entradas fuera de distribución. Se recomienda supervisión y paradas de emergencia en cualquier despliegue físico.
- Idioma: la instrucción de tarea documentada está en inglés; no hay evidencia de soporte para instrucciones en castellano u otros idiomas.
- Sin cuantizaciones publicadas, lo que dificulta el despliegue en hardware limitado.
- Licencia Apache-2.0 en este repositorio, que en principio permite uso comercial, pero conviene verificar por separado los términos de `lerobot/pi05_base` y de la arquitectura π₀.₅ de Physical Intelligence antes de un uso comercial.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, por lo que no ha pasado por validación de la comunidad.
- No se documentan limitaciones de longitud de contexto porque el dato no está disponible; conviene revisar la documentación de LeRobot y OpenPI para conocer el comportamiento en secuencias largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SteveNguyen/sugarcube_in_mug_2cam_chunkrel_pi05_step20000
- Dataset de entrenamiento: https://huggingface.co/datasets/SteveNguyen/sugarcube_in_mug_chunkrel_2cam
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SteveNguyen/sugarcube_in_mug_chunkrel_2cam
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ en Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos (cheat sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
