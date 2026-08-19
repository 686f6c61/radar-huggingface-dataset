# tylergp/molmoact2-libero-ft-10mm-300

## Resumen

El modelo `tylergp/molmoact2-libero-ft-10mm-300` es un fine-tuning específico del modelo MolmoAct2, desarrollado por el Allen Institute for AI (AllenAI), orientado a tareas de razonamiento de acciones y manipulación robótica. MolmoAct2 es un modelo de razonamiento de acciones totalmente abierto, diseñado para despliegue práctico en robótica, que introduce un backbone VLM llamado MolmoER, especializado en razonamiento espacial y encarnado (embodied reasoning), entrenado sobre un corpus de 3,3 millones de muestras con una receta de "especializar y ensayar" (specialize-then-rehearse). Este fine-tuning concreto se ha ajustado sobre el benchmark LIBERO, un estándar para evaluación de manipulación robótica, y cuenta con aproximadamente 5,49 mil millones de parámetros.

La relevancia de este modelo radica en que combina un backbone visual-lenguaje de última generación con un ajuste fino en tareas robóticas reales, lo que lo hace útil para investigadores y desarrolladores que trabajan en planificación de movimientos, control de robots y aprendizaje por imitación. Aunque el modelo card es mínimo, la arquitectura subyacente y el repositorio oficial de AllenAI proporcionan contexto suficiente para entender su propósito y capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM (vision-language model) basado en MolmoAct2, con backbone MolmoER |
| Parametros totales | 5.485.309.488 (~5,49 mil millones) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo incluye safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (probablemente ingles, no confirmado) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 65,9 GB) |

## Arquitectura y entrenamiento

MolmoAct2 se presenta como un modelo de razonamiento de acciones para despliegue real, que avanza respecto a su predecesor en cinco ejes. Introduce MolmoER, un backbone VLM especializado en razonamiento espacial y encarnado, entrenado sobre un corpus de 3,3 millones de muestras con una receta de "especializar y ensayar". El modelo base incorpora una variante llamada MolmoAct2-Think, que utiliza razonamiento de profundidad adaptativa para tareas complejas. El fine-tuning específico `libero-ft` se ha realizado sobre el benchmark LIBERO, que consiste en tareas de manipulación robótica de larga duración, aunque no se han publicado detalles sobre el número de pasos, épocas o la composición exacta del dataset de ajuste. El nombre "10mm" podría sugerir 10 millones de muestras o pasos, pero no está confirmado. No se dispone de información sobre técnicas como RLHF o DPO en este fine-tuning.

## Capacidades

- Razonamiento de acciones: genera secuencias de acciones motoras para robots, basándose en observaciones visuales y lenguaje natural.
- Comprensión espacial: el backbone MolmoER está especializado en razonamiento espacial, lo que permite interpretar escenas 3D y posiciones de objetos.
- Manipulación robótica: ajustado para tareas del benchmark LIBERO, que incluyen apilar, abrir, agarrar y colocar objetos.
- Integración visión-lenguaje: procesa imágenes y texto para producir comandos de control.
- Potencial para tool calling y agentes: aunque no está documentado explícitamente, la arquitectura de razonamiento de acciones podría extenderse a entornos simulados o agentes virtuales.
- Multilingüismo: no confirmado; probablemente limitado al inglés por los datos de entrenamiento.

## Casos de uso

- Control de robots manipuladores en laboratorio: el modelo puede generar comandos de movimiento para brazos robóticos en tareas como apilar bloques o abrir cajones, utilizando la ventana de contexto visual para interpretar el estado actual.
- Aprendizaje por imitación: los investigadores pueden usarlo como política base para recolectar demostraciones y entrenar políticas más robustas mediante behavior cloning.
- Simulación robótica: integrable en entornos como MuJoCo o Isaac Sim para validar algoritmos de planificación antes del despliegue físico.
- Evaluación de benchmarks de manipulación: sirve como baseline en LIBERO y otros benchmarks similares para comparar nuevos métodos de aprendizaje por refuerzo o imitación.
- Desarrollo de asistentes físicos: en entornos controlados, podría utilizarse para tareas de asistencia en cocina o almacén, aunque requiere adaptación adicional.
- Investigación en razonamiento encarnado: útil para estudiar cómo los modelos de lenguaje y visión pueden razonar sobre el espacio físico y generar acciones coherentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tuning en la informacion disponible. El paper de MolmoAct2 (arXiv:2605.02881) reporta evaluaciones generales del modelo base, pero los números no se incluyen en los resultados de búsqueda. Para el ajuste en LIBERO, no hay métricas publicadas en la model card ni en el repositorio. Se recomienda consultar el paper original para datos de rendimiento del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5,49 mil millones de parámetros, en fp16 se necesitan aproximadamente 11 GB de VRAM; en fp32, unos 22 GB. El repo de 65,9 GB sugiere que los pesos están en fp32 (65,9 GB / 5,49B ≈ 12 bytes por parámetro, lo que indica fp32 con overhead). Para fp16, el tamaño sería ~11 GB, pero el repo no incluye versiones cuantizadas.
- GPU recomendadas: para fp16, una RTX 3090/4090 (24 GB) o A100 (40/80 GB) sería suficiente. Para fp32, se necesitaría una A100 de 80 GB o varias GPUs.
- Compatibilidad con consumer GPU: sí, si se convierte a fp16 o se cuantiza (por ejemplo, con bitsandbytes), cabría en una RTX 4090 de 24 GB.
- Opciones de despliegue: al ser un modelo basado en transformers, se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). Para robótica, se suele usar PyTorch directo con ROS o frameworks de control.
- Latencia y throughput: no disponible; depende del hardware y de la longitud de la secuencia de acciones generada.

## Comparativa con modelos similares

No se dispone de datos concretos para una comparativa cuantitativa. Sin embargo, se pueden mencionar alternativas en el ámbito de modelos de acción robótica:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MolmoAct2 (base) | ~5,5B (estimado) | no disponible | MIT | GitHub, HuggingFace |
| OpenVLA | 7B | 2048 | MIT | HuggingFace |
| RT-2 (Google) | 55B | no disponible | propietaria | no abierto |

Este fine-tuning se distingue por su licencia MIT y su integración con el ecosistema MolmoAct2, pero carece de benchmarks publicados para comparar directamente.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha documentado ningún sesgo específico, pero al ser un modelo entrenado con datos de robótica, puede reflejar los sesgos de los entornos de entrenamiento (por ejemplo, escenarios de laboratorio limitados).
- Riesgo de alucinación: como todo modelo generativo, puede producir acciones inconsistentes o inviables en situaciones no vistas durante el entrenamiento.
- Limitaciones de contexto: la longitud de contexto no está especificada, lo que puede limitar tareas que requieran memoria de largo plazo.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero el modelo puede depender de componentes con licencias distintas (verificar dependencias).
- Caveat para producción: el fine-tuning en LIBERO está pensado para entornos simulados o controlados; su robustez en entornos reales no está validada. Además, el repo tiene 0 descargas, lo que sugiere que no ha sido ampliamente probado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tylergp/molmoact2-libero-ft-10mm-300
- Versión final en HuggingFace: https://huggingface.co/tylergp/molmoact2-libero-ft-10mm-300-final
- Repositorio oficial de MolmoAct2 (GitHub): https://github.com/allenai/molmoact2
- Paper de MolmoAct2 (arXiv): https://arxiv.org/abs/2605.02881
- Versión HTML del paper: https://arxiv.org/html/2605.02881v1
