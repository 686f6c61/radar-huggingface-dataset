# SwinliQ-AI-2/OmniVoice-MLX-4bit

## Resumen

OmniVoice-MLX-4bit es una cuantización de 4 bits del modelo de síntesis de voz OmniVoice, adaptada para ejecutarse en Apple Silicon mediante la librería mlx-audio. El modelo original, desarrollado por k2-fsa, es un sistema de text-to-speech (TTS) masivamente multilingüe con soporte para más de 600 idiomas, capaz de realizar clonación de voz zero-shot y diseño de voces sintéticas. Esta variante cuantizada reduce el tamaño del modelo a aproximadamente 0,75 GB (un 77 % menos que la versión fp32), lo que permite su uso en dispositivos con memoria unificada limitada, como MacBooks y Mac Studios.

La arquitectura subyacente combina un backbone bidireccional basado en Qwen con un tokenizador acústico HiggsAudioV2, y emplea un enfoque de diffusion language model para generar audio de alta calidad. La cuantización 4-bit mantiene las capacidades principales del modelo original, incluyendo la síntesis multilingüe y la clonación de voz, aunque con una posible ligera pérdida de fidelidad respecto a las versiones de mayor precisión. Es una opción práctica para desarrolladores que necesitan TTS local en ecosistemas Apple sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion language model con backbone Qwen bidireccional y tokenizador acústico HiggsAudioV2 |
| Parametros totales | 95.770.496 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (esta variante); también existen bf16 y 8-bit |
| Idiomas soportados | Más de 600 idiomas (según el modelo base OmniVoice) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantización MLX) |

## Arquitectura y entrenamiento

El modelo base OmniVoice emplea una arquitectura de diffusion language model, donde un backbone bidireccional basado en Qwen procesa el texto de entrada y genera representaciones latentes que son decodificadas por un tokenizador acústico HiggsAudioV2 para producir la forma de onda. Esta combinación permite una síntesis de voz natural y expresiva, con capacidad de adaptarse a la voz de referencia en tareas de clonación zero-shot. La versión cuantizada 4-bit mantiene la misma estructura, pero los pesos se reducen a precisión de 4 bits para optimizar el uso de memoria y acelerar la inferencia en hardware Apple Silicon.

No se dispone de información detallada sobre el proceso de entrenamiento de esta cuantización específica. El modelo original fue entrenado con un corpus multilingüe extenso, aunque no se han publicado cifras exactas de tokens ni la composición del dataset. Tampoco se mencionan técnicas de alineación como RLHF o DPO; el entrenamiento se centra en la generación de voz supervisada.

## Capacidades

- Síntesis de voz a partir de texto en más de 600 idiomas, incluyendo lenguas con sistemas de escritura no latinos (por ejemplo, tailandés, chino, árabe).
- Clonación de voz zero-shot: a partir de un audio de referencia corto, el modelo puede imitar la voz del hablante sin necesidad de entrenamiento adicional.
- Diseño de voces sintéticas: permite generar voces nuevas o modificar características vocales mediante parámetros de control.
- Generación de voz con entonación y prosodia naturales, adecuada para aplicaciones de lectura de texto, asistentes virtuales y doblaje.
- Inferencia local en Apple Silicon mediante mlx-audio, sin necesidad de conexión a internet ni GPU dedicada.
- Soporte de generación en tiempo real o casi tiempo real en dispositivos con suficiente memoria unificada.

## Casos de uso

- Asistentes virtuales multilingües: el modelo puede generar respuestas habladas en decenas de idiomas desde un Mac, lo que permite construir asistentes locales que no dependen de servicios en la nube y respetan la privacidad del usuario.
- Audiolibros y narración automática: gracias a su soporte de más de 600 idiomas, es posible convertir libros electrónicos en audiolibros con voces naturales, incluso en lenguas minoritarias.
- Doblaje de vídeo y localización de contenido: la clonación de voz zero-shot permite doblar vídeos manteniendo la voz original del actor, reduciendo costes de producción.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla que convierten texto en voz con alta calidad y soporte multilingüe.
- Prototipado rápido de aplicaciones de voz: los desarrolladores pueden probar ideas de productos de TTS sin necesidad de infraestructura de GPU, usando únicamente un Mac con Apple Silicon.
- Generación de contenido educativo: creación de lecciones de idiomas, podcasts o material didáctico con voces sintéticas personalizables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas objetivas como MOS (Mean Opinion Score), WER (Word Error Rate) o comparativas con otros modelos TTS. La única referencia de rendimiento es la reducción de tamaño: la versión 4-bit ocupa 0,75 GB frente a los 3,3 GB de la versión fp32 (según la tabla de tamaños de la model card), lo que implica una reducción del 77 % en memoria.

## Requisitos de hardware

- Dispositivos Apple Silicon (M1, M2, M3, M4 y posteriores) con memoria unificada de al menos 8 GB para la versión 4-bit.
- El modelo ocupa aproximadamente 0,75 GB en disco, por lo que cabe en cualquier Mac con almacenamiento estándar.
- No requiere GPU dedicada; la inferencia se ejecuta en la CPU/GPU unificada de Apple Silicon mediante MLX.
- Se recomienda al menos 4 GB de memoria libre para cargar el modelo y ejecutar la síntesis sin problemas.
- Despliegue mediante mlx-audio, que proporciona una interfaz de línea de comandos y una API Python. También se puede integrar en aplicaciones macOS nativas.
- No se dispone de datos de latencia o throughput específicos para esta cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Idiomas | Licencia | Plataforma |
|---|---|---|---|---|---|
| OmniVoice-MLX-4bit (este) | 95,7 M | 0,75 GB | 600+ | Apache 2.0 | Apple Silicon (MLX) |
| OmniVoice-MLX-8bit | 95,7 M | 1,1 GB | 600+ | Apache 2.0 | Apple Silicon (MLX) |
| OmniVoice-MLX-bf16 | 95,7 M | 1,6 GB | 600+ | Apache 2.0 | Apple Silicon (MLX) |
| OmniVoice original (fp32) | no disponible | ~3,3 GB | 600+ | Apache 2.0 | GPU NVIDIA / CPU |

La comparativa se limita a las variantes de cuantización del mismo modelo base, ya que no se dispone de datos de otros TTS multilingües comparables en el contexto de MLX. La versión 4-bit ofrece el menor tamaño y consumo de memoria, a costa de una posible reducción en la calidad de audio respecto a las versiones de mayor precisión.

## Limitaciones y advertencias

- La cuantización 4-bit puede introducir artefactos o pérdida de fidelidad en la voz generada, especialmente en idiomas con fonética compleja o en tareas de clonación de voz con referencias de baja calidad.
- El modelo está optimizado exclusivamente para Apple Silicon; no es compatible con GPUs NVIDIA o AMD sin una conversión adicional a otros formatos (por ejemplo, GGUF o PyTorch).
- No se ha verificado el rendimiento en todos los idiomas; algunos pueden presentar una calidad inferior o errores de pronunciación.
- La clonación de voz zero-shot requiere un audio de referencia limpio y de al menos unos segundos; audios ruidosos o con múltiples hablantes pueden degradar el resultado.
- No se dispone de información sobre sesgos o comportamientos no deseados en la generación de voz. Como cualquier modelo TTS, podría generar contenido falso o engañoso si se usa malintencionadamente.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base k2-fsa/OmniVoice para asegurar el cumplimiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/SwinliQ-AI-2/OmniVoice-MLX-4bit)
- [Repositorio GitHub de OmniVoice-MLX (ailuntx)](https://github.com/ailuntx/OmniVoice-MLX)
- [Variante 4-bit de mlx-community](https://huggingface.co/mlx-community/OmniVoice-4bit)
- [Variante 4-bit de theoracleguy](https://huggingface.co/theoracleguy/OmniVoice-4bit)
- [Documentación de OmniVoice en mlx-audio](https://blaizzy.github.io/mlx-audio/models/tts/omnivoice/)
