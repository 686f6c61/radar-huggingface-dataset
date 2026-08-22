# Wayfinder6/bones-sage-rank32-experiment

## Resumen

El modelo `Wayfinder6/bones-sage-rank32-experiment` es un experimento de fine-tuning con LoRA (Low-Rank Adaptation) de rango 32, publicado por el usuario Wayfinder6 en Hugging Face. Se basa en el adaptador previo `Wayfinder6/bones-sage-nova-lora` (rango 8) y comparte la misma línea de corpus y modelo base. El objetivo era comprobar si un adaptador de mayor rango consigue preservar mejor la "voz" (estilo de respuesta característico) del modelo durante la generación. El autor documenta de forma honesta que el resultado no es una mejora clara: el checkpoint con mejor pérdida de validación (iter 1200, val loss 1.431) no produce respuestas con voz distintiva, mientras que el checkpoint final (iter 3000, val loss 2.157) muestra una voz más reconocible en la mitad de las respuestas, aunque con peor pérdida. El repositorio se publica como registro del experimento y su resultado real, no como una versión lista para producción.

La arquitectura subyacente del modelo base no se especifica en la información disponible; solo se indica que se utiliza la librería MLX y que el adaptador se aplica sobre un modelo LoRA previo. No se ofrecen detalles sobre parámetros totales, longitud de contexto, cuantización o idiomas. El tamaño del repositorio es de 0.4 GB, lo que corresponde a los pesos del adaptador, no al modelo completo. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre modelo base `Wayfinder6/bones-sage-nova-lora` (arquitectura subyacente no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato MLX, no se indica cuantización) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | Adaptadores LoRA en formato MLX (probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 aplicado sobre el modelo base `Wayfinder6/bones-sage-nova-lora`, que a su vez es un adaptador LoRA de rango 8. El entrenamiento se realizó en un conjunto de datos no especificado, con un proceso iterativo que generó dos checkpoints: uno en la iteración 1200 (con la mejor pérdida de validación, 1.431) y otro en la iteración 3000 (final, con pérdida 2.157). El autor no proporciona detalles sobre el corpus de entrenamiento, la composición de los datos ni el uso de técnicas como RLHF o DPO. La única innovación técnica destacable es la evaluación explícita de la "fidelidad de voz" mediante una batería de 12 prompts adversariales, comparando las respuestas del adaptador con las del modelo base. Los resultados mostraron que la pérdida de validación no se correlaciona con la calidad de la voz, un hallazgo relevante para la selección de checkpoints en fine-tuning.

## Capacidades

No se han documentado capacidades específicas del modelo más allá de la generación de texto con un estilo particular. Según la model card, el adaptador intenta conservar una "voz" distintiva, pero los resultados son inconsistentes: en el checkpoint final, aproximadamente la mitad de las respuestas mostraron una voz reconocible, mientras que en el checkpoint con mejor pérdida de validación la mayoría eran genéricas o truncadas. No hay información sobre soporte de tool calling, agentes, razonamiento multistep, capacidades multilingües o modalidades adicionales (visión, audio). Al ser un experimento de investigación, no se puede afirmar ninguna capacidad concreta para uso práctico.

## Casos de uso

No hay casos de uso documentados en la información disponible. El autor declara explícitamente que este repositorio existe para dejar constancia del experimento y su resultado real, no como un modelo listo para producción. Por tanto, no se recomienda su uso en aplicaciones reales sin una evaluación adicional exhaustiva. Cualquier caso de uso requeriría una verificación independiente de la calidad y estabilidad del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única evaluación mencionada es la batería de 12 prompts de fidelidad de voz, cuyos resultados están en los archivos `batch_results_v1_final.json` y `batch_results_iter1200_best.json`. No hay datos de MMLU, HumanEval, GSM8K u otros estándares.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware. El tamaño del repositorio es de 0.4 GB (adaptadores LoRA), por lo que la inferencia requeriría cargar el modelo base completo (no especificado) y aplicar el adaptador. No se indican GPUs recomendadas, opciones de despliegue (vLLM, llama.cpp, etc.) ni métricas de latencia o throughput.

## Comparativa con modelos similares

No hay modelos comparables en la misma categoría con datos públicos. El único punto de comparación es el adaptador previo `bones-sage-nova-lora` (rango 8), que comparte la misma línea base. Según la model card, el rango 32 no mostró una mejora clara en la fidelidad de voz, y el checkpoint con mejor pérdida de validación fue peor en ese aspecto. No se puede realizar una tabla comparativa cuantitativa por falta de métricas.

## Limitaciones y advertencias

- El autor declara que el modelo no es una mejora confirmada sobre la fuente de generación actual (un fine-tune completo no publicado).
- La pérdida de validación no predice la calidad de la voz: el checkpoint con mejor val loss (iter 1200) produjo respuestas vacías, truncadas o genéricas en la mayoría de los prompts.
- El checkpoint final (iter 3000) mostró voz distintiva solo en la mitad de los casos; la otra mitad fue genérica.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo está destinado a investigación y no se recomienda para producción sin validación previa.
- El modelo base subyacente no está publicado en este repositorio, lo que limita la reproducibilidad.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/Wayfinder6/bones-sage-rank32-experiment)
- [Modelo base LoRA rank 8: Wayfinder6/bones-sage-nova-lora](https://huggingface.co/Wayfinder6/bones-sage-nova-lora)
- [Perfil del autor Wayfinder6](https://huggingface.co/Wayfinder6)
