# wego-mink/dualarm_bolt_and_nut_act

## Resumen

`wego-mink/dualarm_bolt_and_nut_act` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada en Hugging Face Hub por el usuario wego-mink mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que, a partir de observaciones (imágenes de cámaras y estado de las articulaciones), predice directamente secuencias de acciones para un robot. El problema que resuelve es la manipulación diestra aprendida por demostración: en lugar de programar la tarea, se entrena con episodios de teleoperación y el modelo reproduce la política.

El checkpoint tiene 51.685.006 parámetros (unos 0,2 GB de repositorio) y está entrenado sobre el dataset `wego-mink/dualarm_bolt_and_nut`, que por el nombre corresponde a una tarea de ensamblaje de tornillo y tuerca con dos brazos. La model card no detalla la morfología exacta del robot ni el número de episodios; el ejemplo de evaluación del README utiliza un `so100_follower`, lo que sugiere una plataforma tipo SO-100/SO-101 de bajo coste.

Su relevancia es práctica: LeRobot se ha consolidado como el ecosistema de referencia para políticas de imitación reproducibles, y un checkpoint ACT de 51 M de parámetros es ligero enough para ejecutarse en tiempo real en una GPU de consumo e incluso en CPU. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, algo poco habitual en pesos de robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual, codificador de estado y decodificador de acciones con chunking |
| Parametros totales | 51.685.006 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la ventana de observación depende de la configuración de entrenamiento, no publicada) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay versiones GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no disponible (modelo visomotor, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato de checkpoint de LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un backbone de visión (codificador de imágenes por cámara), un codificador del estado propioceptivo del robot y un decodificador transformer que predice *chunks* de acciones de longitud k en lugar de un único paso. Esta predicción por bloques reduce el error de acumulación típico del behavioral cloning paso a paso y suaviza la política resultante. El modelo incorpora además el mecanismo de *temporal ensembling* descrito en el paper, que promedia predicciones solapadas entre chunks durante la inferencia.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el número de episodios de teleoperación ni si se aplicaron técnicas de aumento de datos. La model card únicamente indica que la política se entrenó y subió al Hub con LeRobot y enlaza a la guía de entrenamiento. Tampoco se especifica el tamaño de chunk ni la resolución de las cámaras empleadas.

## Capacidades

- Control visomotor de manipulación: genera comandos de acción continua a partir de imágenes de cámara y del estado de las articulaciones.
- Predicción de chunks de acciones, lo que permite ejecutar movimientos coherentes durante varios pasos sin recalcular en cada frame.
- Tarea específica de ensamblaje doble brazo (tornillo y tuerca) según el dataset de entrenamiento declarado.
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación/despliegue con `lerobot-record`.
- Soporte de evaluación con robot real vía `--policy.path` apuntando al checkpoint del Hub o a una copia local.
- No soporta tool calling, agentes, razonamiento multi-paso, matemáticas, código ni generación de texto: no es un modelo lingüístico.
- No se declaran capacidades multilingües ni modo *thinking*.

## Casos de uso

- Ensamblaje automatizado de tornillo y tuerca: es el caso directo para el que fue entrenado; se ejecutaría sobre el robot de dos brazos con el que se teleoperó el dataset, cargando el checkpoint con `lerobot-record`.
- Banco de pruebas para investigación en imitación: sirve como referencia reproducible para comparar ACT frente a otras políticas de LeRobot sobre una tarea de contacto preciso.
- Base para *fine-tuning* en tareas de inserción: al ser un checkpoint ACT ya entrenado en una tarea de ensamblaje, puede reutilizarse como inicialización para tareas relacionadas con contacto mecánico.
- Validación de pipelines de datos de teleoperación: permite comprobar de extremo a extremo que un dataset grabado con LeRobot produce una política funcional antes de escalar la recolección de episodios.
- Demostraciones educativas de aprendizaje por imitación: el tamaño reducido (51 M de parámetros, ~0,2 GB) permite entrenar y ejecutar en un portátil con GPU de consumo, útil en cursos y talleres.
- Prototipado de células de montaje en pymes: al ser Apache 2.0 y ejecutable en hardware asequible, posibilita pilotos de automatización de bajo coste antes de invertir en soluciones industriales propietarias.
- Evaluación comparativa de infraestructura de inferencia en robótica: sirve para medir latencia de políticas pequeñas en CPU/GPU dentro de bucles de control a 30-60 Hz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,2 GB en fp32 (51,7 M de parámetros) y ~0,1 GB en fp16; el cuello de botella real es la memoria de las imágenes de entrada y el coste del codificador visual, no los pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas RTX 3060, RTX 4090, A100 o H100; el modelo no aprovecha la capacidad de las GPU de gama alta por su tamaño.
- Cabe holgadamente en GPU de consumo (RTX 20xx/30xx/40xx, e incluso iGPU con soporte CUDA/ROCm) y es viable en CPU para pruebas de latencia no crítica.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch nativo; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles. No se han publicado mediciones de frecuencia de control ni de tiempo de inferencia por chunk.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dualarm_bolt_and_nut_act (este) | ACT (LeRobot) | 51,7 M | chunk de acciones, tamaño no publicado | apache-2.0 | Hugging Face Hub, 0 descargas |
| Diffusion Policy (familia LeRobot) | Política por difusión | variable, no disponible aquí | horizonte de acciones configurable | habitualmente MIT/Apache en LeRobot | implementada en LeRobot, checkpoints según usuario |
| VQ-BeT (familia LeRobot) | Transformer con cuantización vectorial de acciones | variable, no disponible aquí | horizonte de acciones configurable | habitualmente MIT/Apache en LeRobot | implementada en LeRobot |
| SmolVLA (Hugging Face) | VLA con backbone lingüístico | cientos de millones | contexto multimodal | licencia propia del proyecto | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo (tasas de éxito en la misma tarea) para esta comparativa; las cifras de parámetros de las alternativas no están en la información proporcionada y se indican como no disponibles.

## Limitaciones y advertencias

- Política de tarea única: entrenada para una tarea concreta de ensamblaje; no generaliza a otras tareas ni objetos sin reentrenamiento o *fine-tuning*.
- Dependencia de la morfología: el checkpoint está ligado a la configuración de brazos, cámaras y espacio de acciones usado en la teleoperación. Usarlo en otro robot o con otra disposición de cámaras invalidará la política.
- Sin información sobre el dataset: se desconocen el número de episodios, la variabilidad de posiciones iniciales y la cobertura de condiciones de iluminación, por lo que no se puede estimar su robustez fuera de las condiciones de recogida.
- Riesgo de sobreajuste a la escena: como toda política de imitación, puede fallar ante cambios de fondo, iluminación o posición inicial no representados en las demostraciones.
- Sin métricas publicadas: no hay tasas de éxito ni evaluaciones reproducibles; 0 descargas y 0 likes implican que no existe validación por parte de la comunidad.
- Repositorio de 0,2 GB con fecha de creación y actualización separadas por 30 segundos: sin historial de versiones ni iteraciones documentadas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se ofrece ninguna garantía ni soporte por parte del autor.
- Sesgos: no evaluados ni documentados. En robótica de manipulación, los sesgos provienen del operador que teleopera y de la distribución de escenas grabadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wego-mink/dualarm_bolt_and_nut_act
- Dataset de entrenamiento: https://huggingface.co/datasets/wego-mink/dualarm_bolt_and_nut
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de la información del repositorio.
