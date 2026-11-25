# ziyiweng/vla_239mergeset_policy

## Resumen

`ziyiweng/vla_239mergeset_policy` es una política de imitación para robótica manipulativa construida sobre SmolVLA, el framework de visión-lenguaje-acción (VLA) de Hugging Face integrado en LeRobot. El modelo parte del backbone `HuggingFaceTB/SmolVLM2-500M-Video-Instruct` y ha sido ajustado para una única tarea: introducir un cubo pequeño en una caja amarilla con un brazo robótico SO-101 de seis grados de libertad. Lo desarrolla ziyiweng como parte de un proyecto de prácticas de verano centrado en entrenar un SO-101 con LeRobot, primero con ACT y después con SmolVLA.

La relevancia de esta ficha es acotada y conviene ser explícito: no es un modelo de propósito general, sino un artefacto de investigación que documenta un pipeline completo de imitación (dataset de 239 episodios, receta de entrenamiento, curvas y vídeos). Sirve como referencia reproducible para quien quiera entrenar políticas SmolVLA sobre un SO-101 con dos cámaras (cenital y de muñeca) a 30 fps y con instrucción en lenguaje natural.

El modelo tiene 450.046.176 parámetros (~0,45B), un repositorio de 0,9 GB en safetensors y se distribuye a través de la librería LeRobot. Solo se entrena el *action expert*; el codificador visual y el VLM permanecen congelados. El autor indica explícitamente que el modelo **no ha sido evaluado en el robot real**, por lo que su rendimiento efectivo en manipulación se desconoce.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLM backbone SmolVLM2-500M-Video-Instruct + action expert; vision encoder y VLM congelados) |
| Parametros totales | 450.046.176 (~0,45B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucción de entrenamiento en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería LeRobot) |

Otros datos técnicos relevantes:

| Parametro | Valor |
|---|---|
| Robot | SO-101 follower arm, estado/acción de 6 articulaciones |
| Cámaras | cenital + muñeca, 30 fps, redimensionado con padding a 512×512 |
| Instrucción | "put the small cube into the yellow box" |
| Chunk size | 50 |
| Batch size / optimizador | 36 / AdamW, lr 1e-4, cosine decay con 1k warmup |
| Aumento de imagen | color jitter, sharpness, affine aleatorio pequeño |
| Pasos de entrenamiento | 40.000 (~8,3 h en GPU en la nube) |
| Pérdida final de entrenamiento | 0,051 |
| Dataset | `ziyiweng/vla_239mergeset`, 239 episodios / 110k frames |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción que combina un modelo vision-lenguaje (aquí SmolVLM2-500M-Video-Instruct) con un módulo específico de predicción de acciones, el *action expert*. En este ajuste concreto, el autor congela el codificador visual y el VLM y entrena únicamente el *action expert*, de modo que el modelo aprende a mapear observaciones visuales (cámara cenital y de muñeca) más una instrucción textual a secuencias de acciones articulares del SO-101. La política predice *chunks* de 50 acciones, lo que reduce el coste de inferencia frente a un control paso a paso.

El entrenamiento usa imitación supervisada sobre el dataset `ziyiweng/vla_239mergeset` (239 episodios, 110.000 frames) recogidos con el propio SO-101. Se aplican aumentos de imagen (color jitter, variaciones de nitidez y pequeñas transformaciones afines) para mejorar la robustez visual. La receta es la misma que la del modelo previo `vla_199mergeset_policy2`, ampliada con 40 episodios adicionales (`vla_40initial`). El autor advierte que la menor pérdida de entrenamiento (0,051 frente a 0,076) no implica una mejor política, ya que los datasets difieren y ninguno de los dos modelos fue evaluado en el robot real.

## Capacidades

- Generación de acciones de control para un brazo SO-101 de 6 articulaciones a partir de observaciones visuales y una instrucción textual.
- Condicionamiento por lenguaje natural: la política responde a la instrucción "put the small cube into the yellow box".
- Procesamiento multimodal de vídeo/imagen: dos cámaras (cenital y de muñeca) a 30 fps, redimensionadas a 512×512 con padding.
- Predicción de secuencias de acciones en *chunks* de 50 pasos.
- Aprendizaje por imitación (imitation learning) a partir de demostraciones teleoperadas.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No se documentan capacidades multilingües; la instrucción de entrenamiento está en inglés.
- No se documentan modos especiales (thinking, audio, visión general más allá del uso robótico).

## Casos de uso

- **Reproducción de un pipeline de imitación con LeRobot**: sirve como referencia completa (dataset, hiperparámetros, curvas) para quien quiera entrenar su propia política SmolVLA sobre un SO-101 y comparar recetas.
- **Punto de partida para *fine-tuning* en una tarea de pick-and-place**: el *action expert* ya está ajustado para una tarea de manipulación concreta, por lo que puede servir de inicialización para tareas similares con el mismo brazo y configuración de cámaras.
- **Validación de infraestructura de evaluación robótica**: útil para probar el flujo de carga de políticas en LeRobot (`SmolVLAPolicy.from_pretrained`) y el comando de evaluación con `--policy.path` antes de desplegar en hardware real.
- **Estudio de sensibilidad a la configuración de cámaras**: al requerir nombres de cámara y montaje idénticos a los del entrenamiento, permite experimentar con el impacto de cambios de punto de vista o resolución.
- **Docencia y divulgación en robótica de imitación**: el proyecto incluye vídeos y curvas de entrenamiento en el repositorio de GitHub, lo que lo hace adecuado para explicar el ciclo completo de un VLA aplicado a un brazo de bajo coste.
- **Comparación de recetas (199 vs 239 episodios)**: permite analizar empíricamente cómo afecta añadir 40 episodios a la pérdida de entrenamiento, con la advertencia de que la comparación no es concluyente sin evaluación en robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta la pérdida final de entrenamiento (0,051) y advierte explícitamente de que el modelo no ha sido evaluado en el robot real. No hay datos de MMLU, HumanEval, GSM8K ni métricas de éxito en manipulación.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial. Con ~0,45B parámetros en safetensors, los pesos ocupan aproximadamente 0,9 GB en FP16; el consumo real depende del framework LeRobot y de los buffers de imagen (dos cámaras a 512×512).
- **GPU recomendadas**: no especificadas por el autor. Por tamaño, una GPU consumer moderna (RTX 3060 12 GB o superior) debería ser suficiente para inferencia en FP16, aunque no hay confirmación oficial.
- **Cabe en GPU consumer**: probablemente sí, dado el tamaño del modelo, pero no verificado por el autor.
- **Opciones de despliegue**: LeRobot (carga mediante `SmolVLAPolicy.from_pretrained` y ejecución con `--policy.path`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que además no son el cauce habitual para políticas robóticas.
- **Latencia y throughput**: no disponibles. Dependen del hardware, del *chunk size* de 50 y del coste de preprocesado de las dos cámaras a 512×512.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ziyiweng/vla_239mergeset_policy` | ~0,45B | no disponible | Pick-and-place SO-101 | no disponible | Hugging Face (LeRobot) |
| `ziyiweng/vla_199mergeset_policy2` | no disponible | no disponible | Pick-and-place SO-101 | no disponible | Hugging Face (LeRobot) |
| SmolVLA (base, Hugging Face) | ~0,45B (según backbone) | no disponible | Política VLA general | no disponible en esta ficha | Hugging Face (LeRobot) |

La comparación con `vla_199mergeset_policy2` es la más directa: misma receta, 40 episodios menos y pérdida de entrenamiento de 0,076 frente a 0,051. El autor subraya que la diferencia de pérdida no demuestra superioridad, ya que los datasets difieren y ninguno se evaluó en robot. No se dispone de datos de rendimiento para comparar con otras políticas VLA de la misma categoría.

## Limitaciones y advertencias

- **No evaluado en el robot real**: el autor lo indica explícitamente; no hay evidencia de éxito en manipulación física.
- **Tarea única**: entrenado solo para "put the small cube into the yellow box"; no generaliza a otras instrucciones ni objetos sin reentrenamiento.
- **Dependencia del montaje**: requiere los mismos nombres de cámara, posición y resolución (512×512 con padding) que en el entrenamiento.
- **Pérdida de entrenamiento no interpretable como calidad**: la comparación con el modelo de 199 episodios no es concluyente.
- **Licencia no disponible**: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- **Idiomas no disponibles**: la instrucción de entrenamiento está en inglés; no se documenta soporte multilingüe.
- **Sesgos y alucinación**: no documentados. En políticas de imitación, el riesgo principal es la generalización pobre fuera de la distribución de demostraciones (iluminación, posiciones de objetos, fondo).
- **Madurez**: 3 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación, no un modelo listo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ziyiweng/vla_239mergeset_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/ziyiweng/vla_239mergeset
- Modelo previo (199 episodios): https://huggingface.co/ziyiweng/vla_199mergeset_policy2
- Repositorio del proyecto (curvas, vídeos, write-up): https://github.com/ziyiweng/so101-imitation-learning
- Backbone VLM: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- LeRobot (framework): https://github.com/huggingface/lerobot
