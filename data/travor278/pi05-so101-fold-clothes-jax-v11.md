# Travor278/pi05-so101-fold-clothes-jax-v11

## Resumen
Este repositorio contiene un checkpoint de entrenamiento de una política robótica PI0.5, un modelo de visión-lenguaje-acción (VLA) basado en el framework openpi de Physical Intelligence. El checkpoint fue creado por el usuario Travor278 y está especializado en la tarea de doblar ropa, concretamente en la sub-tarea `so101_fold_clothes_left_stack_right`. El modelo fue entrenado con un conjunto de datos de 108 episodios, 1.258.509 frames y aproximadamente 11,65 horas de demostraciones, utilizando una implementación nativa en JAX con entrenamiento de parámetros completos en FP32.

Su relevancia radica en ser un ejemplo de entrenamiento de políticas VLA a escala, con infraestructura FSDP y GPUs H100, y en incluir material completo de reproducción y auditoría del checkpoint. Está dirigido a investigadores en robótica y aprendizaje por imitación que necesiten estudiar, reutilizar o verificar políticas de manipulación de precisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PI0.5 (VLA) implementada en JAX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (entrenado en FP32) |
| Idiomas soportados | no disponible (modelo de acción robótica) |
| Licencia | no disponible |
| Formato de pesos | Orbax checkpoint (JAX) |

Nota: el repositorio en HuggingFace ocupa 1,7 GB, mientras que la model card indica que el checkpoint final contiene 64 archivos que suman 44.635.958.366 bytes (~44,6 GB). No se proporcionan pesos en otros formatos como safetensors o GGUF.

## Arquitectura y entrenamiento
El modelo se basa en PI0.5, una arquitectura de la familia Physical Intelligence para políticas de robótica que combina entradas de visión y lenguaje para producir acciones de control. El entrenamiento se realizó con el framework openpi en su variante JAX, con entrenamiento de parámetros completos en FP32. La topología consistió en un único nodo con 8 GPUs H100, usando FSDP y un tamaño de lote global de 64. Se ejecutaron 50.000 actualizaciones con un warmup de 1.200 y una tasa de aprendizaje que decae de 2,5e-5 a 2,5e-6, con EMA decay de 0,999.

El dataset de entrenamiento proviene de la vista local `local/so101_fold_clothes_left_stack_right_shortgop8`. La model card incluye material de reproducción: el árbol de código fuente en `repro/openpi_v11_source.tar.gz`, un diff binario respecto al commit base `215abfb217dbac7d5f1273282331b9b1866c0479`, y manifiestos SHA256 que permiten auditar la integridad del checkpoint. El directorio final del checkpoint es `49999` (índice de paso cero-based) y contiene árboles separados de `params` y `train_state`, normalización de datos, momentos de optimizador y el paso de entrenamiento.

## Capacidades
- Política de manipulación robótica: genera acciones de bajo nivel para ejecutar la tarea de doblar ropa apilada a la derecha (`fold clothes left stack right`).
- Entrada multimodal: utiliza observaciones de visión y consignas de lenguaje, típicas de los modelos VLA.
- Checkpoint reanudable: incluye el estado completo del optimizador y del entrenamiento, lo que permite reanudar el entrenamiento o continuar el fine-tuning.
- Reproducibilidad: proporciona manifiestos SHA256 y materiales de auditoría para verificar la integridad del checkpoint.
- Sin capacidades de generación de texto, código o razonamiento simbólico; es un modelo especializado en una tarea de robótica.

## Casos de uso
- Investigación en aprendizaje por imitación: el checkpoint puede analizarse para estudiar cómo una política VLA aprende una tarea de manipulación de precisión a partir de demostraciones.
- Fine-tuning para nuevas tareas de plegado: sirve como punto de partida para transferir el conocimiento a otras variantes de doblado de ropa, siempre que se disponga del conjunto de datos adecuado.
- Evaluación en simulación: antes de cualquier despliegue físico, puede evaluarse en entornos de simulación robótica para validar su comportamiento y seguridad.
- Benchmark de políticas de manipulación: puede compararse con otros checkpoints de PI0.5 en la misma tarea para medir el efecto de diferentes configuraciones de entrenamiento (tasa de aprendizaje, tamaño de lote, semilla, etc.).
- Auditoría de pipelines de entrenamiento: al incluir el código fuente y los metadatos, es útil para verificar la reproducibilidad de entrenamientos JAX a gran escala con FSDP.
- Análisis de integridad de checkpoints: el manifiesto SHA256 y los ficheros de auditoría permiten verificar que un checkpoint no ha sido alterado, algo relevante en flujos de investigación colaborativa.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito de la tarea, comparaciones con otros modelos ni evaluaciones cuantitativas.

## Requisitos de hardware
- Entrenamiento: el run descrito utilizó un nodo con 8 GPUs H100 y FSDP, con un tamaño de lote global de 64.
- Inferencia: no se proporcionan requisitos específicos de VRAM ni de latencia. Dado que el checkpoint en FP32 ocupa ~44,6 GB, una estimación razonable es que se necesitaría una GPU con al menos 80 GB de VRAM (p. ej., A100 80GB o H100) para cargar el modelo completo sin cuantizar, o bien particionar los parámetros en varias GPUs.
- No se mencionan formatos de cuantización ni integraciones con frameworks como vLLM, llama.cpp u Ollama; al tratarse de un modelo JAX/Orbax, el despliegue se realizaría probablemente a través de openpi.

## Comparativa con modelos similares
No disponible. No se dispone de información sobre modelos comparables en la misma tarea o con las mismas características dentro de la información proporcionada.

## Limitaciones y advertencias
- La model card advierte explícitamente: "Do not connect this policy to a physical robot without a separate offline evaluation, hardware mapping verification, workspace safety check, and explicit operator authorization." Es decir, no debe conectarse a un robot físico sin una evaluación offline, verificación del mapeo de hardware, comprobación de seguridad del espacio de trabajo y autorización explícita del operador.
- Es una política especializada en una tarea concreta; no es un modelo de propósito general y no puede usarse para generación de lenguaje, código o razonamiento.
- La licencia no está disponible, lo que puede suponer una restricción para usos comerciales o para la redistribución de derivados.
- No se han publicado benchmarks, por lo que su rendimiento real en la tarea no está verificado públicamente.
- El entrenamiento se realizó en un entorno específico con 8 H100; reproducirlo puede ser costoso y requerir infraestructura similar.
- No hay información sobre sesgos, riesgos de alucinación o limitaciones idiomáticas, al ser un modelo no lingüístico.

## Enlaces
- HuggingFace: https://huggingface.co/Travor278/pi05-so101-fold-clothes-jax-v11
- Repositorio openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
