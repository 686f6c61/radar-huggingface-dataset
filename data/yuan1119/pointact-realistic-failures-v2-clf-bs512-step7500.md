# yuan1119/pointact-realistic-failures-v2-clf-bs512-step7500

## Resumen

PointACT RLBench realistic-failures-v2 classifier es un checkpoint de investigación en robótica publicado por el usuario yuan1119 en HuggingFace. Se trata del `checkpoint-7500` completo del job de Slurm 25788 (`rlbench-realistic-failures-v2-clf-bs512-lr1e4-nogc-25788`), entrenado con el punto de entrada `VLAEncDec3DWithActionClassificationModel`, el backend Concerto PTv3 para nubes de puntos y Qwen2.5-VL-3B-Instruct como modelo de visión-lenguaje (VLM) base. El repositorio incluye pesos, estados de optimizador y scheduler, estado de RNG, estado del trainer y la configuración de tokenizer y processor.

El modelo pertenece a la categoría de modelos visión-lenguaje-acción (VLA) orientados a manipulación robótica, y está asociado al benchmark RLBench con una variante de fallos realistas ("realistic-failures-v2"). La tarea declarada en el nombre es de clasificación de acciones. Por su naturaleza, es un artefacto de entrenamiento más que un modelo listo para producción: su carga requiere el código y las dependencias personalizadas del proyecto PointACT, que no se distribuyen en este repositorio.

No se dispone de información publicada sobre licencia, idiomas soportados, número total de parámetros del sistema completo, ventana de contexto efectiva ni resultados de benchmarks. Los datos de la model card son muy escuetos y se limitan a describir el origen y el formato del checkpoint. Cualquier evaluación de rendimiento o de idoneidad para producción debe realizarse tras reproducir el entorno de PointACT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion) con backend de nubes de puntos Concerto PTv3 y cabecera de clasificacion de acciones; clase de entrenamiento `VLAEncDec3DWithActionClassificationModel` |
| Parametros totales | no disponible (el VLM base Qwen2.5-VL-3B-Instruct ronda los 3.750 M de parametros, pero no se especifica el total del sistema con el encoder PTv3 y la cabecera) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible para el sistema completo (Qwen2.5-VL-3B-Instruct, como VLM base, soporta 32.768 tokens, segun informacion publica del modelo base) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint de entrenamiento completo, incluye estados de optimizador y scheduler) |

## Arquitectura y entrenamiento

La arquitectura combina tres componentes segun la model card. En primer lugar, Qwen2.5-VL-3B-Instruct actúa como modelo de visión-lenguaje base, aportando la comprensión de imágenes y texto. En segundo lugar, el backend Concerto PTv3 procesa nubes de puntos 3D, lo que sitúa al modelo en la familia de arquitecturas que fusionan representaciones de imágenes RGB con geometría 3D. En tercer lugar, `VLAEncDec3DWithActionClassificationModel` define un esquema encoder-decoder 3D con una cabecera de clasificación de acciones, orientado a predecir acciones discretas en entornos de manipulación robótica.

El entrenamiento corresponde al job de Slurm 25788, con batch size de 512, learning rate aparente de 1e-4 (deducible del nombre `lr1e4`) y sin gradient checkpointing (`nogc`). El checkpoint se guardó en el paso global 7500, con guardado cada 500 pasos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones de decodificación o de atención. El nombre sugiere que el conjunto de datos incorpora ejemplos de fallos realistas sobre RLBench, probablemente para hacer la política más robusta ante errores de ejecución.

## Capacidades

- Clasificación de acciones en tareas de manipulación robótica (cabecera explícita de clasificación de acciones).
- Procesamiento multimodal que combina imágenes (vía Qwen2.5-VL) y nubes de puntos 3D (vía Concerto PTv3).
- Interpretación de instrucciones en lenguaje natural, heredada del VLM base Qwen2.5-VL-3B-Instruct.
- Percepción geométrica 3D mediante el encoder de nubes de puntos, adecuada para escenas de mesa con objetos.
- Entrenamiento sobre RLBench con una variante de fallos realistas, lo que sugiere cierta robustez ante perturbaciones durante la ejecución.
- No hay información disponible sobre soporte de tool calling, function calling, uso como agente multi-paso, capacidades multilingües específicas, modo de razonamiento extendido, audio u otras capacidades especiales.

## Casos de uso

- Investigación en aprendizaje por imitación robótica: el checkpoint puede servir como punto de partida o de comparación en experimentos con RLBench, ya que incluye el estado completo del entrenamiento (pesos, optimizador, scheduler y RNG) para reanudarlo.
- Clasificación de acciones en entornos de manipulación: la cabecera de clasificación permite etiquetar acciones discretas a partir de observaciones multimodales (imagen y nube de puntos), útil para anotación automática de demostraciones.
- Robustez ante fallos: al haberse entrenado con la variante "realistic-failures-v2", puede emplearse para estudiar cómo se comporta la política ante ejecuciones defectuosas y para diseñar mecanismos de recuperación.
- Evaluación de arquitecturas VLA con fusión 3D: sirve como referencia para comparar el enfoque Concerto PTv3 frente a otros encoders geométricos en tareas de manipulación.
- Ablación de hiperparámetros de entrenamiento: al conocer el batch size (512) y el paso de guardado (7500), el checkpoint es útil para reproducir y variar configuraciones en estudios controlados.
- Reproducibilidad de resultados: investigadores que quieran replicar el job 25788 pueden reanudar exactamente desde este estado, dado que se conserva el estado del optimizador, scheduler y RNG.
- No se recomienda su uso directo en producción robótica sin una validación adicional, ya que no hay datos de licencia, seguridad ni evaluación en entornos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito en RLBench, ni tasas de acierto de clasificación, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia orientativa, el VLM base Qwen2.5-VL-3B-Instruct en precisión fp16 requiere aproximadamente 7-8 GB de VRAM solo para los pesos; habría que sumar el encoder PTv3 y la cabecera de clasificación, además de los estados de activación.
- Tamaño del repositorio: 11,4 GB, que corresponde al checkpoint de entrenamiento completo (incluye estados de optimizador y scheduler), no solo a los pesos de inferencia.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del modelo base, es probable que sea viable en GPUs de gama alta para consumidor (por ejemplo, RTX 4090 con 24 GB), pero esto no está confirmado.
- Compatibilidad con GPU de consumidor: no confirmada; dependería de la VRAM total necesaria para el sistema completo con el encoder 3D.
- Opciones de despliegue: no disponibles. La carga del modelo requiere el código personalizado de PointACT y sus dependencias, por lo que no se puede ejecutar directamente con vLLM, llama.cpp, Ollama o TGI sin adaptación previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo en la información proporcionada, por lo que una comparación cuantitativa fiable no es posible. A modo orientativo, se listan modelos de la misma categoría (VLA para manipulación robótica), indicando solo atributos estructurales conocidos y marcando el rendimiento como no disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| PointACT realistic-failures-v2 clf | no disponible (VLM base ~3.750 M) | no disponible | no disponible | safetensors (checkpoint) | no disponible |
| OpenVLA | ~7.000 M | no disponible | no disponible en esta ficha | safetensors | no disponible |
| Qwen2.5-VL-3B-Instruct (VLM base) | ~3.750 M | 32.768 tokens (informacion publica del modelo) | no disponible en esta ficha | safetensors | no disponible |
| Alternativas VLA de la misma tarea | no disponible | no disponible | no disponible | no disponible | no disponible |

Cualquier comparación seria requiere reproducir el entorno de PointACT y evaluar sobre RLBench, algo que no está documentado en el repositorio.

## Limitaciones y advertencias

- No se especifica la licencia, por lo que se desconoce si el uso comercial está permitido o restringido; conviene contactar con el autor antes de cualquier uso más allá de la investigación.
- El repositorio tiene 0 descargas y 0 "likes", y no incluye documentación sobre métricas, sesgos o límites de rendimiento.
- El checkpoint es un artefacto de entrenamiento (incluye estados de optimizador, scheduler y RNG) y no está empaquetado para inferencia directa; su carga exige el código y las dependencias de PointACT, que no se distribuyen aquí.
- Riesgo de alucinación: no evaluado en la información disponible; al apoyarse en un VLM base, puede heredar las limitaciones de Qwen2.5-VL-3B-Instruct en cuanto a generación de contenido incorrecto.
- Idiomas soportados: no disponibles, lo que impide garantizar un comportamiento correcto fuera del idioma o idiomas de entrenamiento.
- Limitaciones de contexto y de idioma específicas del sistema completo: no disponibles.
- Al estar orientado a RLBench y a manipulación en entornos simulados, la transferencia a robots reales no está validada y puede degradarse por diferencias de dominio.
- La variante "realistic-failures-v2" sugiere entrenamiento con fallos simulados, pero sin métricas publicadas no puede confirmarse que mejore la robustez en producción.
- No se documentan prácticas de seguridad, parada de emergencia ni supervisión humana, requisitos imprescindibles para cualquier despliegue físico.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/yuan1119/pointact-realistic-failures-v2-clf-bs512-step7500
- Modelo base VLM (referencia): https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- No se han encontrado en la búsqueda web enlaces relevantes al modelo, a papers asociados, a blogs, a repositorios de código ni a demos. Los resultados de búsqueda disponibles no guardan relación con el modelo.
