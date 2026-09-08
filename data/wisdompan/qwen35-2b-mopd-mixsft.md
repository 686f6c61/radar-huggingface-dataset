# wisdompan/qwen35-2b-mopd-mixsft

## Resumen

Este modelo es un checkpoint intermedio de fine-tuning supervisado (MixSFT) sobre el modelo base Qwen/Qwen3.5-2B, desarrollado por wisdompan como parte de un experimento de reproducción de MOPD (un esquema de entrenamiento teacher/student). El objetivo es servir como punto de partida común para políticas teacher en tres dominios: matemáticas, generación de código y seguimiento de instrucciones. No es el modelo final del experimento; los checkpoints de teacher RL y de destilación del estudiante se publicarán por separado.

El modelo se basa en la arquitectura Transformer de Qwen3.5-2B. Según los pesos en SafeTensors, contiene 2.213.241.664 parámetros, aunque el README del autor declara 1.881.825.088; esta discrepancia no está explicada. El entrenamiento se realizó con una ventana de contexto de 1.024 tokens, y no se especifica la longitud de contexto máxima del modelo base.

Su relevancia es principalmente investigadora: permite estudiar el efecto de la etapa MixSFT antes de aplicar RL, y sirve como referencia para reproducir el pipeline Open-MOPD. No está pensado para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.5-2B) |
| Parámetros totales | 2.213.241.664 (según safetensors); el README indica 1.881.825.088 |
| Parámetros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible; el SFT se realizó con 1.024 tokens |
| Tipos de cuantización | No disponible (pesos en bfloat16) |
| Idiomas soportados | Inglés y chino (en, zh) |
| Licencia | Apache 2.0 (derivado de Qwen3.5-2B; cumplir términos upstream) |
| Formato de pesos | SafeTensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de parámetros (full-parameter SFT) del modelo Qwen/Qwen3.5-2B. El autor indica que se entrenó durante 1 época y 375 pasos, con el optimizador Adafactor, una programación de aprendizaje coseno con tasa máxima de 1e-5, weight decay de 0.1, acumulación de gradientes de 8, gradient checkpointing y semilla 20260902. La pérdida final registrada fue 0.6251 y la precisión de tokens 0.8485.

Los datos de entrenamiento cubren matemáticas, código y seguimiento de instrucciones, pero no se especifica el número de tokens ni la composición exacta del dataset. El checkpoint está destinado a ser la inicialización común para políticas teacher en un pipeline MOPD; no incluye RLHF ni DPO. Además, aunque el pipeline_tag de HuggingFace es image-text-to-text, la documentación no describe capacidades multimodales, por lo que no se debe asumir soporte de visión.

## Capacidades

- Generación de texto en dominios de matemáticas, código y seguimiento de instrucciones, tras el SFT.
- Soporte de tool calling / function calling: no documentado explícitamente.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: inglés y chino (en, zh).
- Capacidad especial: es un checkpoint intermedio para destilación teacher/student; no es un modelo final.
- El pipeline_tag es image-text-to-text, pero no se documenta entrada de imágenes.

## Casos de uso

- Investigación en destilación de políticas (MOPD): el checkpoint sirve como inicialización común para entrenar políticas teacher en matemáticas, código y seguimiento de instrucciones. Es adecuado porque está diseñado explícitamente para ese propósito.
- Entrenamiento posterior con RL: se puede continuar el fine-tuning con reinforcement learning en los dominios mencionados, partiendo de este checkpoint. El autor lo indica como uso previsto.
- Evaluación controlada de la etapa SFT: permite medir el efecto del SFT comparando con el modelo base en tareas de matemáticas y código, en un entorno de laboratorio.
- Inferencia local para experimentos: se puede desplegar con `transformers serve` y consumir mediante un endpoint OpenAI-compatible, lo que facilita pruebas rápidas de generación.
- Reproducción de experimentos: al publicar la semilla, los hiperparámetros y el número de paso, el checkpoint permite reproducir el pipeline Open-MOPD de manera fiable.
- Pruebas de integración con Transformers Serving: sirve para validar el flujo de servido con continuous batching y comprobar el routing de recompensas en un pipeline de destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que solo se realizó una comprobación de seis ejemplos para validar la generación y el routing de recompensas, sin valor de benchmark. No se presentan tablas de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: ~4.4 GB para los pesos en bfloat16 (2.213.241.664 parámetros × 2 bytes). Con activaciones y overhead, se recomienda una GPU con al menos 8 GB de VRAM. (Estimación basada en el tamaño del checkpoint, no en mediciones del autor).
- GPU recomendadas: no disponible oficialmente; para experimentos locales, una RTX 4090 (24 GB) o una A100 (40/80 GB) ofrecen margen suficiente. Una RTX 3060 de 12 GB podría ser suficiente para inferencia básica.
- ¿Cabe en consumer GPU? Sí, en GPUs de consumo con 8 GB o más de VRAM (estimación).
- Opciones de despliegue: el autor recomienda `transformers serve` con continuous batching, que expone un endpoint OpenAI-compatible. No se documenta soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de modelos comparables con datos suficientes. El modelo base Qwen/Qwen3.5-2B es la referencia directa, pero la información proporcionada no incluye sus especificaciones completas. La siguiente tabla compara lo que se conoce:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| wisdompan/qwen35-2b-mopd-mixsft | 2.213.241.664 (safetensors) / 1.881.825.088 (README) | No disponible (SFT con 1.024 tokens) | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-2B | No disponible | No disponible | No disponible | HuggingFace |

## Limitaciones y advertencias

- Checkpoint intermedio: no es un asistente listo para producción ni el resultado final del experimento MOPD.
- Puede producir contenido incorrecto, verboso o inseguro, según el propio autor.
- La calidad en matemáticas, código y seguimiento de instrucciones no se ha establecido en benchmarks públicos amplios.
- Solo se realizó una comprobación de seis ejemplos; no hay evaluación formal.
- El entrenamiento se realizó con 1.024 tokens de contexto, lo que puede limitar la generalización a contextos largos.
- La licencia Apache 2.0 exige cumplir los términos y requisitos de uso del modelo upstream Qwen3.5-2B.
- El pipeline_tag indica image-text-to-text, pero no se documentan capacidades multimodales; no asumir soporte de visión.

## Enlaces

- HuggingFace: https://huggingface.co/wisdompan/qwen35-2b-mopd-mixsft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Colección Qwen3.5: https://huggingface.co/collections/Qwen/qwen35
