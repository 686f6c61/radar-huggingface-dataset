# vadimayegorov/Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B-mlx-fp16

## Resumen

Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B-mlx-fp16 es una variante cuantizada y podada del modelo MoE Qwen3.6-35B-A3B, convertida a formato MLX por el usuario vadimayegorov. Aplica poda de expertos (REAP) para reducir los parámetros totales de 35.000 millones a 18.543.995.648 (18,5B) y cuantización 4-bit mediante OptiQ, lo que reduce el tamaño del repositorio a 12,3 GB. El resultado es un modelo de texto generativo basado en una arquitectura de mezcla de expertos, con unos 3.000 millones de parámetros activos por token según la designación A3B. Está diseñado para ejecutarse en Apple Silicon a través de la librería mlx-lm, lo que facilita la inferencia local sin necesidad de GPU dedicada.

La licencia Apache 2.0 permite uso comercial y modificación, y el formato de pesos safetensors con MLX lo hace directamente cargable en macOS. La conversión se realizó con mlx-lm 0.31.2, y el modelo base es mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B. No se han publicado resultados de benchmarks ni especificaciones completas de contexto o idiomas en la información disponible.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con poda de expertos (REAP) y cuantización 4-bit (OptiQ) |
| Parámetros totales | 18.543.995.648 (18,5B) |
| Parámetros activos | ~3B (según designación A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (OptiQ), con pesos base en fp16 para MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo es una variante del MoE Qwen3.6-35B-A3B, que utiliza una arquitectura transformer con mezcla de expertos. La conversión de vadimayegorov aplica dos técnicas de compresión: la poda de expertos REAP, que elimina parte de los expertos para reducir el número total de parámetros de 35B a 18,5B, y la cuantización OptiQ de 4-bit, que reduce la precisión de los pesos para disminuir el tamaño en memoria. El formato MLX (safetensors) está optimizado para la ejecución en Apple Silicon mediante la librería mlx-lm.

No se dispone de información sobre los datos de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se han documentado innovaciones adicionales como decodificación especulativa o atención lineal. El tokenizer incluye una plantilla de chat, lo que permite su uso en conversaciones multi-turno, pero no se detallan otras características.

## Capacidades

- Generación de texto y conversación en formato chat, gracias a la plantilla de chat incluida en el tokenizer.
- Ejecución local en Apple Silicon mediante mlx-lm, sin necesidad de GPU externa ni conexión a internet.
- Carga en memoria reducida: el repositorio ocupa 12,3 GB, lo que permite su uso en equipos con memoria unificada moderada.
- Compatibilidad con la librería mlx-lm 0.31.2 y posterior, usando la API load y generate.
- No se especifica soporte para tool calling, función llamada, visión, audio o modo de razonamiento explícito en la información disponible.
- La poda de expertos y la cuantización 4-bit hacen que el modelo sea adecuado para experimentación con técnicas de compresión de MoE.

## Casos de uso

- Asistente local de chat en macOS: se puede ejecutar con mlx-lm en un Mac con Apple Silicon, permitiendo respuestas de texto sin conexión. Es adecuado por su tamaño reducido (12,3 GB) y por no requerir GPU dedicada.
- Desarrollo de prototipos de aplicaciones de IA en Apple Silicon: gracias al formato MLX, el modelo puede integrarse en scripts de Python para pruebas rápidas de generación de texto, sin necesidad de infraestructura cloud.
- Procesamiento de documentación técnica: puede redactar resúmenes o borradores de textos, aunque la longitud de contexto no está documentada y se debe validar en cada caso.
- Generación de código en entornos locales: al tratarse de un modelo Qwen, es probable que tenga capacidades de código, pero no se confirma en esta conversión; se puede probar en tareas de autocompletado o refactorización sencilla.
- Análisis de texto privado: al ejecutarse localmente, permite tratar datos sensibles sin enviarlos a servicios externos, lo que es relevante para entornos con requisitos de privacidad.
- Investigación en compresión de modelos: la combinación de poda REAP y cuantización OptiQ ofrece un caso de estudio práctico para comparar el rendimiento de un MoE podado frente al modelo original, sin necesidad de GPUs de gran potencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 12,3 GB; en Apple Silicon se requiere memoria unificada suficiente para cargar los pesos y el overhead de inferencia, recomendándose al menos 16 GB de RAM, y preferiblemente 32 GB para contextos largos.
- GPU recomendadas: no aplica directamente, ya que el formato MLX está diseñado para Apple Silicon. No se especifica soporte para CUDA o GPUs de NVIDIA.
- Equipos compatibles: Macs con chips M1, M2, M3 o M4 y suficientes memoria unificada.
- Opciones de despliegue: principalmente mlx-lm; no es compatible de forma directa con vLLM, TGI ni llama.cpp sin una conversión adicional a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B | safetensors (presumiblemente bf16) | Apache 2.0 | HuggingFace |
| mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit | 35B | MLX 4-bit | Apache 2.0 | HuggingFace |
| vadimayegorov/Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B-mlx-fp16 | 18,5B | MLX 4-bit (fp16 base) | Apache 2.0 | HuggingFace |

La comparación se basa únicamente en los datos disponibles. La variante con poda REAP reduce los parámetros totales de 35B a 18,5B, manteniendo la licencia y el formato MLX. No se dispone de resultados de benchmarks para comparar el rendimiento real entre estas versiones.

## Limitaciones y advertencias

- La poda de expertos puede degradar la calidad del modelo original, especialmente en tareas complejas; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- La cuantización 4-bit puede introducir errores de precisión en comparación con pesos en fp16 o bf16, aunque la magnitud de estos errores no se ha documentado.
- La longitud de contexto y los idiomas soportados no están especificados en la información disponible, lo que limita las garantías de uso en aplicaciones multilingües o con entradas largas.
- El formato MLX restringe el despliegue a Apple Silicon; para usar el modelo en otros entornos sería necesario convertirlo a otro formato, como GGUF, lo que no está incluido.
- La compatibilidad depende de mlx-lm en su versión 0.31.2 o posterior; cambios en la librería podrían afectar la carga del modelo.
- No se han publicado evaluaciones de sesgos, seguridad ni alucinaciones. El uso en producción requiere pruebas adicionales.
- La licencia Apache 2.0 permite uso comercial, pero no ofrece garantías de soporte ni de seguridad por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vadimayegorov/Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B-mlx-fp16
- Modelo base en HuggingFace: https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B
- Versión sin poda en HuggingFace: https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit
- Modelo original Qwen en HuggingFace: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
