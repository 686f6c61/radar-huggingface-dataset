# yudai0209/so101_vial_r1_success_58_groot17

## Resumen

`yudai0209/so101_vial_r1_success_58_groot17` es una política de robótica entrenada con LeRobot y publicada en HuggingFace por el usuario yudai0209. No es un modelo de lenguaje generativo, sino un modelo de control visuomotor especializado: recibe el estado de las articulaciones y dos cámaras de un brazo robótico SO-101 y emite comandos de acción de 6 grados de libertad para ejecutar una tarea concreta de manipulación.

Técnicamente se apoya en GR00T N1.7, el modelo fundacional cross-embodiment de NVIDIA para razonamiento y habilidades de robots humanoides. GR00T N1.7 combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching que predice acciones condicionadas por visión, lenguaje y propriocepción. Esta publicación es un ajuste fino de ese modelo sobre un conjunto de datos propio.

El interés de la ficha es doble: por un lado documenta un caso real de uso de GR00T N1.7 en un brazo SO-101 de bajo coste, y por otro sirve como plantilla reproducible de imitación en robótica con el stack LeRobot. El repositorio ocupa 12,6 GB y contiene 3.144.016.000 parámetros en formato safetensors, con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL y transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 (dato real del repositorio en safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en safetensors; no se documentan versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (el modelo consume instrucciones de tarea en lenguaje natural, pero no se declara cobertura multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de GR00T N1.7, la versión del modelo fundacional abierto de NVIDIA para robótica generalista. La arquitectura combina dos componentes: un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL que procesa las imágenes de las cámaras y la descripción textual de la tarea, y un transformer de acciones entrenado con flow matching que genera las trayectorias de acción condicionadas por visión, lenguaje y propriocepción. El modelo es cross-embodiment, es decir, está diseñado para transferirse entre distintas morfologías de robot mediante ajuste fino.

La política concreta se entrenó sobre el conjunto de datos `yudai0209/so101_vial_r1_success_58`, compuesto por 91 episodios y 43.754 fotogramas a 30 FPS, todos correspondientes a la tarea "Pick up the vial and place it in the rack". La configuración de entrenamiento fue de 10.000 pasos, tamaño de lote 32, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 42, con LeRobot 0.6.1. El robot objetivo es un `so_follower` (SO-101) con dos cámaras: `overhead` y `wrist`. No se documenta uso de RLHF ni DPO; el procedimiento es aprendizaje por imitación supervisado sobre demostraciones.

## Capacidades

- Generación de acciones motoras de 6 grados de libertad (`action`, forma `(6,)`) a partir de observaciones visuales y de estado.
- Percepción visual con dos vistas simultáneas: cámara cenital (`overhead`) y cámara de muñeca (`wrist`), ambas a 480x640 píxeles y 3 canales.
- Condicionamiento por instrucción textual de tarea: el prompt "Pick up the vial and place it in the rack" guía la política durante la ejecución.
- Integración con propriocepción del robot mediante `observation.state`, un vector de 6 dimensiones.
- Ejecución de tareas de manipulación tipo pick-and-place sobre un brazo SO-101.
- Despliegue en tiempo real mediante el comando `lerobot-rollout`, con soporte de ejecución por duración fija o indefinida.
- Ajuste fino adicional sobre nuevos conjuntos de datos mediante `lerobot-train` con `--policy.type=groot`.
- Soporte de tool calling, agentes, razonamiento multi-paso, visión general o audio: no disponible; estas capacidades no aplican al uso documentado de esta política.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política recoge un vial y lo coloca en una gradilla, replicando exactamente la tarea sobre la que fue entrenada. Es el caso de uso primario y el único documentado en la model card.
- Reproducción de experimentos de imitación en robótica: investigadores que quieran estudiar cómo se comporta GR00T N1.7 ajustado sobre un conjunto pequeño de demostraciones (91 episodios, 43.754 fotogramas) pueden usar este repositorio como referencia reproducible.
- Formación de técnicos de laboratorio: el brazo puede ejecutar la manipulación de viales de forma repetible mientras un operario supervisa, reduciendo el riesgo de errores manuales en tareas monótonas.
- Base para ajuste fino en dominios cercanos: al ser una política GR00T, se puede reentrenar con `lerobot-train` sobre un dataset propio de manipulación de objetos pequeños y obtener una política especializada.
- Banco de pruebas de hardware SO-101: sirve para validar la calibración de cámaras `overhead` y `wrist`, el puerto del robot y la cadencia de 30 FPS antes de escalar a otros experimentos.
- Docencia en robótica de imitación: al ser un caso completo con dataset, configuración de entrenamiento y comandos de despliegue documentados, es material didáctico para cursos de aprendizaje por imitación con LeRobot.
- Evaluación comparativa de políticas fundacionales: permite contrastar el rendimiento de GR00T N1.7 frente a otras políticas de LeRobot sobre una misma tarea y morfología.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una sección de evaluación vacía con la nota explícita: "No evaluation results have been provided for this policy yet". No hay tasas de éxito, número de ensayos ni condiciones de prueba (posiciones de objetos, iluminación, distractores) documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 12,6 GB con 3.144.016.000 parámetros, lo que corresponde a pesos almacenados en precisión de 32 bits. En bf16/fp16 la inferencia requiere aproximadamente 6,5-7 GB de VRAM solo para los pesos, más el coste de activaciones de las dos cámaras a 480x640.
- En cuantización int8 bajaría a unos 3,5 GB y en int4 a unos 2 GB, aunque no se distribuyen versiones cuantizadas oficiales de esta política.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100 o cualquier GPU con al menos 12-16 GB de VRAM para ejecutar en bf16 con margen. Una RTX 3060 con 12 GB puede ser suficiente en bf16 si se limita el tamaño de lote a 1.
- Cabe en GPU de consumo: sí, siempre que tenga al menos 12 GB de VRAM para inferencia en bf16. En tarjetas de 8 GB habría que recurrir a cuantización, no documentada oficialmente.
- Opciones de despliegue: el flujo documentado es LeRobot (`lerobot-rollout` para ejecutar, `lerobot-train` para entrenar). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que en todo caso no aplican a una política robótica con salida de acciones continua.
- Latencia y throughput: no disponibles. La inferencia opera a 30 FPS (el frame rate del dataset de entrenamiento), pero no se publican cifras de latencia por paso ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yudai0209/so101_vial_r1_success_58_groot17` | 3.144.016.000 | no disponible | Pick-and-place de vial en brazo SO-101 | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| GR00T N1.7 (base, NVIDIA) | no disponible | no disponible | Modelo fundacional cross-embodiment para robots humanoides | no disponible | Repositorio GitHub de NVIDIA Isaac-GR00T |
| Otras políticas LeRobot (pi0, ACT, etc.) | no disponible | no disponible | Manipulación robótica con aprendizaje por imitación | no disponible | Ecosistema LeRobot |

No se dispone de datos de rendimiento ni de especificaciones comparables para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card no reporta ninguna tasa de éxito en robot real. No se puede afirmar que la política funcione de forma fiable en producción.
- Sobreajuste a una única tarea: el entrenamiento se hizo exclusivamente sobre la instrucción "Pick up the vial and place it in the rack". Cualquier otra tarea requiere reentrenamiento.
- Dataset muy reducido: 91 episodios y 43.754 fotogramas son un volumen bajo para aprendizaje por imitación, lo que suele implicar poca robustez ante cambios de iluminación, posición de objetos o presencia de distractores.
- Dependencia exacta del hardware: la política espera dos cámaras (`overhead` y `wrist`) a 480x640 y un robot `so_follower`. Si los nombres de las cámaras, sus índices o el robot difieren, la ejecución fallará o degradará.
- Idiomas: no disponibles. Aunque la tarea se especifica en inglés, no se declara soporte multilingüe ni cobertura de otros idiomas.
- Riesgo de alucinación: no aplica en el sentido de texto generado, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento, un problema habitual en políticas de imitación.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se cite la autoría. No se declaran restricciones adicionales, pero conviene revisar las condiciones del modelo base GR00T N1.7 de NVIDIA, que pueden imponer requisitos adicionales.
- Repositorio sin adopción: 0 descargas y 0 likes en el momento de redactar la ficha, por lo que no hay validación externa de la comunidad.
- Fecha de creación registrada como 2026-10-12, dato a verificar según la fuente original.
- Los resultados de búsqueda web asociados a esta consulta no contienen información relevante sobre el modelo (corresponden a un músico homónimo no relacionado); no aportan datos técnicos utilizables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yudai0209/so101_vial_r1_success_58_groot17
- Dataset de entrenamiento: https://huggingface.co/datasets/yudai0209/so101_vial_r1_success_58
- Visualizador del dataset (LeRobot): https://huggingface.co/spaces/lerobot/visualize_dataset?path=yudai0209/so101_vial_r1_success_58
- Repositorio de NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de entrenamiento y ejecución de groot en LeRobot: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Tutorial de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: los resultados de búsqueda web proporcionados no contienen enlaces relevantes para este modelo.
