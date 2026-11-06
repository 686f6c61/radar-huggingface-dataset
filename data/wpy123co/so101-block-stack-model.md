# wpy123co/so101-block-stack-model

## Resumen

so101-block-stack-model es un modelo de visión-lenguaje-acción (VLA) desarrollado por el usuario wpy123co y publicado en Hugging Face bajo licencia Apache 2.0. Está especializado en una única tarea robótica: el apilado de tres objetos con el brazo manipulador SO-101. No es un modelo de propósito general, sino un ajuste fino de un modelo base denominado wall-oss-0.5, que combina el backbone Qwen2.5-VL-3B con una cabeza de acción basada en rectified flow.

El modelo resuelve el problema de generar trayectorias de control motor a partir de observaciones visuales de dos cámaras (una global y otra montada en la muñeca del robot). Su relevancia es acotada: sirve como referencia reproducible de un pipeline VLA completo para un robot de bajo coste, no como componente generalista. El repositorio ocupa 9,0 GB y acumula 94 descargas en el momento de la consulta.

La información disponible es escasa y proviene casi exclusivamente de la model card del autor, redactada en chino. No se han publicado detalles sobre composición del dataset, idiomas de entrenamiento ni resultados de benchmarks estándar, por lo que muchos campos de esta ficha se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en Qwen2.5-VL-3B con doble FFN estático (VL/Action) y cabeza de acción rectified-flow |
| Parámetros totales | no disponible (el modelo base es de 3B; el ajuste derivado wall-oss-fullft se lista como 4B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 9,0 GB; el autor no especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de wall-oss-0.5, un VLA que combina el backbone multimodal Qwen2.5-VL-3B con un enrutado estático entre dos cabezas FFN: una para procesamiento visión-lenguaje y otra para la generación de acciones. La cabeza de acción emplea rectified flow y produce un vector de 26 dimensiones (6 articulaciones reales más 20 de relleno), con un horizonte temporal de 32 fotogramas a 12 fps.

El ajuste fino se realizó con 50 episodios de demostración teleoperada capturados con dos cámaras (global y de muñeca). Se entrenó a parámetros completos durante 10 épocas, con batch de 6 y tasa de aprendizaje de 5e-5. La inferencia descrita por el autor usa un bucle cerrado síncrono con integración temporal tipo ACT. No se especifica el número de tokens de entrenamiento, la composición del dataset más allá de los 50 episodios, ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de acciones motoras de 6 grados de libertad para el brazo SO-101 a partir de imágenes de dos cámaras.
- Percepción visual multimodal heredada del backbone Qwen2.5-VL-3B (comprensión de escenas y objetos).
- Ejecución de una tarea concreta de apilado de tres objetos, reportada como completada con éxito por el autor.
- Inferencia en bucle cerrado con integración temporal ACT para suavizar la ejecución.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo de razonamiento explícito.
- No se documentan capacidades multilingües ni de audio.

## Casos de uso

- Reproducción de la tarea de apilado en un SO-101 real: el modelo genera trayectorias de 32 fotogramas a 12 fps que pueden enviarse al controlador del brazo mediante un stack ROS 2 como so101-ros-physical-ai.
- Base para ajuste fino en nuevas tareas de manipulación: al estar construido sobre Qwen2.5-VL-3B y publicarse con licencia Apache 2.0, puede reentrenarse con nuevos episodios de demostración para tareas distintas al apilado.
- Docencia e investigación en VLA: sirve como ejemplo completo y reproducible de un pipeline que va de la captura teleoperada al despliegue en bucle cerrado, con métricas de pérdida de validación (0,0021) y precisión en lazo abierto (7,08° de error L1 medio).
- Evaluación de esquemas de integración temporal: la combinación de rectified flow con integración tipo ACT permite comparar estrategias de suavizado de acciones (el autor reporta 0 movimientos superiores a 10° por tick).
- Prototipado de robótica de bajo coste: el SO-101 es un brazo económico, y este modelo demuestra que un VLA de 3B puede controlarlo con hardware modesto.
- Generación de datos sintéticos de trayectorias: las predicciones del modelo pueden usarse para aumentar el dataset so101-block-stack-dataset en experimentos de imitación.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Precisión en lazo abierto (L1 medio) | 7,08° |
| Pérdida de validación | 0,0021 |
| Suavidad de ejecución (>10°/tick) | 0 eventos |
| Tarea de apilado de tres objetos | completada con éxito (según el autor) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; un modelo de 3B en precisión completa requiere del orden de 6-8 GB, y en fp16 alrededor de 6 GB, pero el autor no confirma estos valores ni el formato de pesos.
- GPU recomendadas: no disponibles. Por tamaño, una RTX 4090 (24 GB) o una A100/H100 deberían alojar el modelo sin problemas, pero no hay confirmación del autor.
- Compatibilidad con GPU de consumo: probable en tarjetas con 8 GB o más si se usa fp16, aunque no está verificado.
- Opciones de despliegue: el autor menciona código de inferencia propio con bucle cerrado e integración ACT; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (estos motores, además, no soportan cabezas de acción personalizadas).
- Latencia y throughput: no disponibles; solo se indica que la acción se emite a 12 fps.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101-block-stack-model | ~3B (base) | no disponible | Apilado de 3 objetos con SO-101 | Apache 2.0 | Hugging Face |
| wall-oss-0.5 (base) | 3B | no disponible | VLA generalista | no disponible | Referenciado por el autor |
| so101-wall-oss-fullft (mismo autor) | 4B | no disponible | Ajuste completo sobre wall-oss | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado con 50 episodios para una única tarea de apilado; no generaliza a otras tareas sin reentrenamiento.
- La model card está en chino y es muy breve; faltan detalles sobre dataset, preprocesado, normalización de acciones y criterios de evaluación.
- Las métricas reportadas (éxito en la tarea, pérdida de validación) provienen únicamente del autor y no han sido verificadas de forma independiente.
- El vector de acción de 26 dimensiones incluye 20 valores de relleno, lo que puede confundir a quien intente reutilizar la cabeza de acción.
- Riesgo de sobreajuste a las condiciones de iluminación, posición de cámara y objetos concretos de los 50 episodios de demostración.
- No se documentan sesgos, comportamiento multilingüe ni riesgos de alucinación en el sentido textual, ya que la salida principal es motora.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia y licencia del modelo base wall-oss-0.5 no se detallan en la información disponible, lo que conviene verificar antes de un despliegue comercial.
- No hay garantías de seguridad física: cualquier despliegue en un robot real debe incorporar límites de par, paradas de emergencia y supervisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wpy123co/so101-block-stack-model
- Dataset asociado: https://huggingface.co/datasets/wpy123co/so101-block-stack-dataset
- Perfil del autor: https://huggingface.co/wpy123co/models
- Stack ROS 2 para SO-101: https://github.com/legalaspro/so101-ros-physical-ai
- Repositorio de apilado con SO-101: https://github.com/shrimp-f/so101-block-stacking/tree/main/so101_stack
