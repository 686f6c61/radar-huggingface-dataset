# usermma/Qwen3.8-Queen-27B-mlx-5Bit

## Resumen

El modelo `usermma/Qwen3.8-Queen-27B-mlx-5Bit` es una conversión a formato MLX (Apple Silicon) del modelo base `aifeifei798/Qwen3.8-Queen-27B`, realizada con la librería `mlx-lm` en su versión 0.31.2. A pesar del nombre "27B", los pesos reales en safetensors suman 5.045.149.184 parámetros (~5B), por lo que se trata de un modelo de tamaño medio, no de 27 mil millones. Está orientado a tareas de roleplay, escritura creativa y narración de historias, con soporte para tarjetas de personaje y su integración en herramientas como SillyTavern. Además, el pipeline declarado es `image-text-to-text`, lo que indica capacidad multimodal (entrada de imágenes y texto).

La relevancia de este modelo radica en su formato MLX, que permite ejecutarlo de forma eficiente en hardware de Apple (Mac con chips M-series) sin necesidad de herramientas adicionales. Al estar cuantizado a 5 bits, ofrece un equilibrio entre calidad y consumo de memoria, siendo adecuado para inferencia local en equipos de gama media. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas, lo que facilita su adopción en proyectos privados o de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, multimodal) |
| Parametros totales | 5.045.149.184 (~5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5-bit (MLX) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, MLX |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información disponible, pero los tags indican que pertenece a la familia Qwen 3.5 (`qwen3_5`) y que soporta entrada de imágenes y texto (pipeline `image-text-to-text`). Esto sugiere un transformer multimodal similar a los modelos Qwen-VL, con un codificador visual y un decodificador de lenguaje. No se dispone de detalles sobre el proceso de entrenamiento, el número de tokens utilizados ni la composición del dataset. El modelo base `aifeifei798/Qwen3.8-Queen-27B` parece ser un fine-tune orientado a roleplay y escritura creativa, dado los tags de la model card. La conversión a MLX se realizó con `mlx-lm` 0.31.2, que aplica cuantización de 5 bits a los pesos, reduciendo el tamaño del modelo y acelerando la inferencia en hardware Apple.

## Capacidades

- Generación de texto conversacional y narrativo, especialmente adaptado para roleplay y storytelling.
- Soporte de entrada multimodal: puede procesar imágenes junto con texto (pipeline `image-text-to-text`).
- Compatible con tarjetas de personaje (character cards) y herramientas como SillyTavern para juegos de rol.
- Formato MLX optimizado para ejecución en chips Apple Silicon (M1, M2, M3, etc.).
- Cuantización de 5 bits que reduce el uso de memoria sin degradación excesiva de calidad.
- Licencia Apache 2.0 que permite uso comercial y modificación.

## Casos de uso

- Juegos de rol por texto: el modelo puede interpretar personajes con personalidades definidas mediante tarjetas de personaje, manteniendo coherencia en conversaciones largas gracias a su capacidad de generar respuestas contextuales.
- Escritura creativa asistida: genera borradores de historias, diálogos y descripciones, útil para autores que necesitan inspiración o ampliación de tramas.
- Creación de personajes para videojuegos o novelas visuales: a partir de una descripción breve, el modelo desarrolla perfiles detallados con historia, motivaciones y estilo de habla.
- Asistente de narrativa interactiva: integrable en motores de aventuras conversacionales o chatbots de entretenimiento, donde el modelo gestiona la evolución de la trama según las acciones del usuario.
- Análisis de imágenes con contexto narrativo: al ser multimodal, puede describir escenas de una imagen y continuar una historia basada en ellas, útil en aplicaciones de storytelling visual.
- Prototipado rápido de diálogos para guiones o doblaje: genera intercambios realistas entre personajes, acelerando el proceso de escritura en producción audiovisual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5B parámetros en 5 bits, el modelo requiere aproximadamente 3,1 GB solo para los pesos. Considerando activaciones y caché de contexto, se estima un uso de 6-8 GB de VRAM en inferencia.
- GPU recomendadas: funciona en GPUs de consumo con al menos 8 GB de VRAM, como NVIDIA RTX 3060/3070/4060, o en chips Apple Silicon con memoria unificada de 8 GB o más (M1/M2/M3).
- En hardware Apple, al ser formato MLX, se puede ejecutar con `mlx-lm` sin necesidad de CUDA.
- Opciones de despliegue: `mlx-lm` para Mac, y para GPUs NVIDIA se puede usar Transformers con cuantización (aunque el formato MLX es específico de Apple). También es compatible con `endpoints_compatible` según los tags, lo que sugiere que puede desplegarse en servicios de inferencia.
- Latencia y throughput: no se han publicado mediciones específicas; en una GPU de 8 GB se espera una generación de 10-20 tokens por segundo para modelos de este tamaño, pero depende del hardware y la optimización.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría (roleplay multimodal). El nombre "27B" es engañoso, ya que los parámetros reales son ~5B, lo que lo sitúa en la gama de modelos pequeños como Qwen2.5-7B o Llama-3.1-8B, pero con capacidades multimodales adicionales. Sin datos de benchmarks ni especificaciones de contexto, no es posible realizar una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El nombre del modelo ("27B") no coincide con los parámetros reales (~5B), lo que puede inducir a error sobre su capacidad real.
- No se dispone de información sobre la longitud de contexto, lo que impide conocer si es adecuado para diálogos muy largos o documentos extensos.
- Al ser un fine-tune orientado a roleplay, puede presentar sesgos en la representación de personajes o estereotipos, y generar contenido inapropiado si no se filtra adecuadamente.
- Riesgo de alucinación: como todo modelo de lenguaje, puede inventar información o detalles no presentes en el contexto.
- La cuantización de 5 bits puede degradar ligeramente la calidad de generación en comparación con el modelo original en precisión completa.
- El formato MLX es específico de Apple Silicon; para otros hardware se requeriría una conversión adicional (por ejemplo, a GGUF o FP16).
- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas estándar es desconocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/usermma/Qwen3.8-Queen-27B-mlx-5Bit
- Modelo base: https://huggingface.co/aifeifei798/Qwen3.8-Queen-27B
- Documentación de mlx-lm: https://github.com/ml-explore/mlx-lm
