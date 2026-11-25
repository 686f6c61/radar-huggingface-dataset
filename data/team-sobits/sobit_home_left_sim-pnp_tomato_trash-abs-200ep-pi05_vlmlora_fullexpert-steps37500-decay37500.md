# team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi05_vlmlora_fullexpert-steps37500-decay37500

## Resumen

`sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi05_vlmlora_fullexpert-steps37500-decay37500` es un ajuste fino (fine-tuning) del modelo vision-lenguaje-acción π₀.₅ (Pi05) de Physical Intelligence, adaptado por el equipo `team-sobits` mediante la librería LeRobot de Hugging Face. El modelo base `lerobot/pi05_base` se ha especializado para una única tarea de manipulación robótica: lanzar una lata de tomate a una papelera. El resultado es una política de imitación que consume observaciones multimodales (estado del robot e imágenes de dos cámaras) y emite un vector de acción de 20 dimensiones.

La relevancia de esta ficha no reside en la tarea concreta, sino en que documenta un patrón habitual en el ecosistema LeRobot: reutilizar un modelo fundacional VLA grande y congelar o adaptar parcialmente sus componentes mediante LoRA para especializarlo en un entorno y una tarea concretos. El nombre del repositorio indica una configuración `vlmlora_fullexpert` con 37 500 pasos de entrenamiento, lo que sugiere que se ha aplicado LoRA sobre el componente visión-lenguaje mientras se entrena el experto de acción completo.

El modelo se distribuye con licencia Apache 2.0, pesa 27,8 GB en el repositorio y se entrenó sobre un dataset simulado de 200 episodios y 48 141 fotogramas a 10 FPS. Está pensado para robótica de manipulación móvil y no para generación de texto general, por lo que sus casos de uso y requisitos de hardware difieren sustancialmente de los de un LLM convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05) de Physical Intelligence, adaptada en LeRobot |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural como salida; recibe una instrucción de tarea en texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/pi05_base`, la implementación en LeRobot del modelo π₀.₅ de Physical Intelligence, un VLA diseñado para generalización en entornos abiertos. La arquitectura combina un codificador visión-lenguaje (VLM) con un experto de acción que produce comandos motores. El sufijo del repositorio (`vlmlora_fullexpert`) indica que el ajuste se realizó con LoRA sobre el componente VLM mientras el experto de acción se entrenó de forma completa, una estrategia que reduce el coste de adaptación sin congelar por completo la representación visual-semántica.

El entrenamiento se llevó a cabo con LeRobot 0.6.1 sobre el dataset `team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep`, compuesto por 200 episodios y 48 141 fotogramas a 10 FPS en un entorno simulado. La tarea única es «Throw the tomato can into the trash bin». La configuración reportada incluye 37 500 pasos, batch size 16, optimizador AdamW, learning rate 2,5e-05 y semilla 1000. No se especifica el número total de tokens de entrenamiento ni si hubo RLHF o DPO; al tratarse de aprendizaje por imitación, lo habitual es que no se empleen esas técnicas.

## Capacidades

- Control robótico de manipulación móvil: genera un vector de acción de 20 dimensiones a partir de observaciones de estado y dos cámaras.
- Percepción multimodal: procesa imágenes de una cámara frontal (`head_camera`, 3×480×640) y una cámara de mano izquierda (`hand_left_camera`, 3×400×640).
- Ejecución de una tarea específica de pick-and-place: lanzar una lata de tomate a una papelera en un entorno simulado.
- Condicionamiento por instrucción de tarea en texto (la cadena `--task` se pasa en tiempo de inferencia).
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` y `lerobot-train`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general ni generación de texto libre.

## Casos de uso

- Automatización de tareas de recogida y eliminación de residuos en simulación: el modelo puede ejecutar la secuencia completa de localizar la lata, agarrarla y lanzarla a la papelera, sirviendo como referencia para pipelines de manipulación móvil.
- Generación de datos sintéticos de demostración: al ejecutarse en un simulador, permite producir trayectorias adicionales para aumentar el dataset de entrenamiento de otras políticas.
- Evaluación de técnicas de adaptación eficiente (LoRA en VLM + experto completo): el sufijo del repositorio y la configuración de entrenamiento lo convierten en un caso de estudio reproducible para comparar estrategias de fine-tuning de VLAs.
- Base para transferencia a un robot físico del mismo tipo (`mobile_manipulator`): la política puede desplegarse en hardware real con las mismas cámaras y el mismo espacio de estados de 20 dimensiones, aunque requerirá validación adicional.
- Docencia y prototipado en robótica con LeRobot: sirve como ejemplo mínimo funcional de un pipeline completo (dataset, entrenamiento, rollout) para equipos que se inician en imitación robótica.
- Pruebas de integración de `lerobot-rollout` en infraestructura propia: permite validar puertos, cámaras y calibración antes de entrenar políticas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: «No evaluation results have been provided for this policy yet».

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio pesa 27,8 GB en safetensors, lo que sugiere que la inferencia en precisión completa requiere del orden de 28-32 GB de VRAM; no se confirma.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del repositorio, una GPU de 40-80 GB (A100, H100) sería la opción conservadora; no hay datos que confirmen su funcionamiento en GPUs de consumo.
- ¿Cabe en GPU de consumo? No disponible. No se documenta cuantización ni versión GGUF, por lo que no puede confirmarse su ejecución en RTX 4090 (24 GB) o inferiores.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial) sobre el robot `mobile_manipulator`; el entrenamiento se realiza con `lerobot-train` en CUDA. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (π₀.₅ fine-tuned) | VLA especializado en una tarea | no disponible | no disponible | Apache 2.0 | Hugging Face, 17 descargas |
| `lerobot/pi05_base` | VLA fundacional (base) | no disponible | no disponible | no disponible en la información | Hugging Face (base de este fine-tuning) |
| π₀ (Pi0) original | VLA fundacional | no disponible | no disponible | no disponible en la información | OpenPI (Physical Intelligence) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea («Throw the tomato can into the trash bin») y un único entorno simulado; no se espera generalización a otras tareas u objetos.
- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real, por lo que el rendimiento en producción es desconocido.
- Dependencia del simulador: el dataset es simulado (`sim` en el nombre), lo que puede provocar una brecha de realidad (sim-to-real gap) al desplegarse en hardware físico.
- Sesgos: no documentados; al ser un modelo de control motor, los sesgos relevantes serían de distribución de estados y posiciones del dataset, no de lenguaje.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones erráticas fuera de la distribución de entrenamiento.
- Idiomas: no se documenta soporte multilingüe; la instrucción de tarea se pasa en inglés en los ejemplos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base `lerobot/pi05_base` puede tener condiciones adicionales no detalladas en esta ficha; conviene revisar su licencia antes de un despliegue comercial.
- Requisitos de hardware no confirmados: no se especifica VRAM mínima ni GPUs validadas, lo que dificulta planificar el despliegue.
- Repositorio de gran tamaño (27,8 GB): la descarga y el almacenamiento pueden ser un cuello de botella en entornos con recursos limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-pi05_vlmlora_fullexpert-steps37500-decay37500
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
