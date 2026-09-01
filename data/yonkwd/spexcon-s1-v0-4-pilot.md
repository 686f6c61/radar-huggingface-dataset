# YONKWd/Spexcon-S1-v0.4-Pilot

## Resumen

Spexcon S1 v0.4 Pilot es un adaptador LoRA experimental desarrollado por el usuario YONKWd como parte del proyecto Spexcon S1. No se trata de un modelo completo, sino de un adaptador de bajo rango (LoRA) que se monta sobre el modelo base Qwen/Qwen3-1.7B-Base, de Alibaba. Su objetivo declarado es conseguir un comportamiento conversacional en inglés más limpio, con menos fugas de plantillas de rol, menos repetición, una parada más consistente y una identidad "Spexcon" más estable que en la versión anterior v0.3.

El adaptador se entrenó con únicamente 2.000 ejemplos del dataset HuggingFaceH4/ultrachat_200k, en una GPU Tesla T4, y se publica con licencia Apache 2.0. Es un lanzamiento piloto y experimental, explícitamente no apto para producción. La relevancia actual es limitada: sirve como prueba de concepto dentro de un proyecto personal y como ejemplo de fine-tuning eficiente con QLoRA sobre un modelo pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3-1.7B-Base (Transformer decoder) |
| Parametros totales | no disponible (el adaptador LoRA no especifica su número; el modelo base tiene 1.700 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; no se mencionan cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador Spexcon S1 v0.4 Pilot se basa en Qwen3-1.7B-Base, un modelo Transformer decoder con 1.700 millones de parámetros. El adaptador se entrenó con la técnica QLoRA (quantized LoRA), lo que permite ajustar el modelo con un número reducido de parámetros adicionales. El dataset empleado fue HuggingFaceH4/ultrachat_200k, del cual se usaron 2.000 ejemplos para entrenamiento y 200 para evaluación. El entrenamiento se realizó en una GPU Tesla T4, con una pérdida inicial de 2,397 y una pérdida final de 1,399. No se mencionan técnicas adicionales como RLHF o DPO. La versión v0.4 busca corregir problemas observados en la v0.3, como fugas de plantillas de rol, repetición excesiva y finalizaciones inconsistentes.

## Capacidades

- Generación de texto conversacional en inglés, orientado a mantener una identidad de asistente llamada "Spexcon".
- Adaptador de bajo rango que no modifica los pesos del modelo base, permitiendo una carga ligera y fácil integración con PEFT.
- Soporte básico de diálogo multi-turno heredado del modelo base Qwen3-1.7B, aunque sin garantías de robustez debido al pequeño número de ejemplos de entrenamiento.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión o audio.
- El adaptador está pensado para experimentación y pruebas de concepto, no para tareas complejas.

## Casos de uso

- Investigación sobre fine-tuning eficiente con QLoRA: el adaptador sirve como ejemplo de cómo ajustar un modelo pequeño con un dataset reducido y recursos limitados (una T4).
- Pruebas de identidad y estilo conversacional: permite evaluar cómo un adaptador LoRA puede inculcar una personalidad o nombre de asistente específico en un modelo base.
- Desarrollo incremental de un proyecto personal: el autor lo publica como hito intermedio del proyecto Spexcon S1, útil para comparar versiones y medir mejoras.
- Benchmarking de adaptadores LoRA en tareas de diálogo: se puede comparar el comportamiento con otros adaptadores similares sobre el mismo modelo base.
- Educación y prototipado rápido: estudiantes o desarrolladores pueden usarlo para entender el flujo de trabajo PEFT con transformers.
- No se recomienda su uso en producción ni en aplicaciones críticas, dado su carácter experimental y la falta de evaluación exhaustiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- No se proporcionan requisitos específicos en la documentación del adaptador.
- Al ser un adaptador LoRA, se carga sobre el modelo base Qwen3-1.7B-Base, que en FP16 requiere aproximadamente 3,5 GB de VRAM solo para los pesos. Con el adaptador, la memoria adicional es mínima (el repo ocupa 0,2 GB).
- Es viable en GPUs consumer con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, GTX 1660 Super) si se usa cuantización del modelo base, aunque no se ha verificado oficialmente.
- El entrenamiento se realizó en una Tesla T4 (16 GB VRAM), lo que indica que el ajuste es posible en hardware modesto.
- Para inferencia, se puede desplegar con Hugging Face Transformers + PEFT, o mediante frameworks como vLLM si se convierte el adaptador a un checkpoint fusionado, aunque no se han documentado opciones de despliegue específicas.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones con otros adaptadores LoRA o modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Adaptador experimental y piloto: no está diseñado para uso en producción.
- Entrenado con solo 2.000 ejemplos, lo que limita severamente su generalización y aumenta el riesgo de sobreajuste.
- Riesgo elevado de alucinaciones y errores factuales, especialmente en dominios no cubiertos por el dataset.
- Comportamiento conversacional no validado: no se han publicado evaluaciones humanas o automáticas más allá de la pérdida de entrenamiento.
- El adaptador solo soporta inglés; no se ha probado en otros idiomas.
- No se han documentado sesgos específicos, pero al derivar de un dataset de chat público, es probable que herede sesgos presentes en ultrachat_200k.
- La licencia Apache 2.0 permite uso comercial, pero el estado experimental y la falta de garantías hacen desaconsejable su uso en entornos productivos.
- No se especifica la longitud de contexto efectiva tras el ajuste, por lo que no se puede garantizar un rendimiento adecuado en conversaciones largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YONKWd/Spexcon-S1-v0.4-Pilot
- Versión anterior v0.3: https://huggingface.co/YONKWd/Spexcon-S1-v0.3-Experimental
- Perfil del autor: https://huggingface.co/YONKWd
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
