# tmthang86/Artemis-31B-v1.2-heretic-mlx-6bit

## Resumen

Artemis-31B-v1.2-heretic-mlx-6bit es una cuantización en 6 bits del modelo Artemis-31B-v1.2-heretic, publicada por el usuario tmthang86 en Hugging Face. Se trata de una conversión a formato MLX (la librería de Apple para ejecución de modelos en silicio de Apple) del modelo original, que a su vez deriva de TheDrummer/Artemis-31B-v1.2, una variante sin censura (heretic) del modelo base google/gemma-4-31B-it. El modelo está pensado exclusivamente para inferencia de texto en Apple Silicon mediante herramientas como LM Studio, oMLX o mlx-lm.

El modelo cuenta con 30.697.345.280 parámetros totales (aproximadamente 30,7 mil millones) y se distribuye en safetensors cuantizados a 6 bits con un tamaño de repositorio de 25 GB. La torre de visión del checkpoint multimodal original fue eliminada, por lo que se trata de un modelo estrictamente de texto. La model card indica que la configuración del modelo heretico de origen carecía de dos claves de Gemma 4 (`global_head_dim: 512` y `num_global_key_value_heads: 4`), que fueron añadidas antes de la conversión.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo de 31B en hardware de Apple con una cuantización de 6 bits, un punto de equilibrio entre calidad y tamaño; por otro, es un modelo sin moderación, lo que implica riesgos importantes y responsabilidad plena del usuario sobre su uso. La licencia no está declarada en las fichas de origen, aunque el modelo base google/gemma-4-31B-it es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4; detalles completos no disponibles) |
| Parámetros totales | 30.697.345.280 (≈30,7B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 6 bits, group-size 64 (MLX) |
| Idiomas soportados | no disponible |
| Licencia | other (no declarada en las fichas de origen; el base google/gemma-4-31B-it es Apache 2.0) |
| Formato de pesos | safetensors (MLX, 6-bit) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que deriva de google/gemma-4-31B-it, un transformer de aproximadamente 31B parámetros. El proceso de esta ficha concreta es una conversión de cuantización, no un entrenamiento: se aplicó `mlx_lm convert -q --q-bits 6 --q-group-size 64` con mlx-lm 0.32.2 sobre el checkpoint sjorsb/Artemis-31B-v1.2-heretic. Durante la conversión se eliminó la torre de visión del checkpoint multimodal original y se corrigió el `config.json` añadiendo `global_head_dim: 512` y `num_global_key_value_heads: 4`, valores tomados del modelo base.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo RLHF, DPO u otras técnicas de alineación en el modelo original. La etiqueta "heretic" indica que el modelo de origen fue sometido a un proceso de eliminación o reducción de los mecanismos de rechazo y moderación (abliteration o técnicas similares), pero la model card no documenta el método exacto. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional y de formato libre, con pipeline `text-generation`.
- Razonamiento y generación de contenido creativo (el ejemplo de la model card es la apertura de una novela de misterio).
- Modelo sin censura: no aplica rechazos ni moderación de contenido en sus respuestas.
- Capacidades multilingües: no documentadas explícitamente; se desconoce la cobertura de idiomas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión: eliminadas en esta conversión (la torre de visión fue descartada).
- Capacidades de audio: no disponible.

## Casos de uso

- Generación creativa de ficción: el modelo puede redactar narrativa, diálogos y descripciones sin las restricciones de contenido de modelos alineados, lo que lo hace adecuado para escritura de ficción adulta o experimental en local.
- Prototipado de chatbots conversacionales en Apple Silicon: al ejecutarse con mlx-lm o LM Studio, permite iterar sobre prompts y personalidad del asistente sin depender de APIs externas ni de GPUs dedicadas.
- Investigación sobre alineación y seguridad: sirve como caso de estudio de un modelo "heretic" para analizar cómo se comporta un modelo sin moderación y qué tipos de contenido genera, en entornos controlados.
- Experimentación con cuantización: útil para comparar la calidad de una cuantización de 6 bits frente al modelo original en tareas de generación de texto, midiendo degradación en perplejidad o coherencia.
- Generación de texto offline y privada: al ejecutarse localmente en un Mac, los datos no salen del dispositivo, lo que resulta adecuado para contenido sensible que no debe enviarse a servicios en la nube.
- Evaluación de modelos base de 31B en hardware de consumo: permite a desarrolladores medir latencia y throughput de un modelo de este tamaño en chips Apple (M-series) con memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 25 GB en 6 bits; se necesita al menos esa cantidad de memoria unificada más el overhead de inferencia, por lo que se recomienda un Mac con 32 GB o más (idealmente 36-64 GB).
- GPU recomendadas: hardware Apple Silicon con memoria unificada suficiente (M1/M2/M3/M4 Pro, Max o Ultra). No está pensado para GPUs NVIDIA, ya que el formato es MLX.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple con memoria unificada de 32 GB o superior; no es compatible con GPUs de consumo NVIDIA/AMD en este formato.
- Opciones de despliegue: mlx-lm (comando `mlx_lm.generate`), LM Studio, oMLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Artemis-31B-v1.2-heretic-mlx-6bit (este) | ≈30,7B | no disponible | MLX 6-bit | other (no declarada) | Hugging Face |
| sjorsb/Artemis-31B-v1.2-heretic | no disponible | no disponible | safetensors (original) | no declarada | Hugging Face |
| TheDrummer/Artemis-31B-v1.2 | no disponible | no disponible | safetensors | no declarada | Hugging Face |
| google/gemma-4-31B-it | ≈31B | no disponible | safetensors | Apache 2.0 | Hugging Face |

La comparativa se limita a la cadena de derivación del propio modelo, ya que la información proporcionada no incluye datos de rendimiento ni de contexto que permitan comparar con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo sin censura: no aplica moderación ni rechazos; puede generar contenido explícito, ofensivo o dañino. La model card lo restringe a adultos y responsabiliza al usuario de su uso.
- Riesgo de alucinación: no documentado, pero inherente a los modelos de lenguaje; la ausencia de alineación puede agravar la confianza en afirmaciones falsas.
- Licencia incierta: la licencia figura como "other" y no está declarada en las fichas de origen; el modelo base es Apache 2.0, pero se debe verificar antes de cualquier uso comercial.
- Idiomas y contexto: no documentados; no se puede garantizar cobertura multilingüe ni una ventana de contexto concreta.
- Solo texto: la torre de visión fue eliminada, por lo que no admite entradas de imagen.
- Compatibilidad limitada: el formato MLX solo funciona en Apple Silicon; no es desplegable en vLLM, TGI, llama.cpp ni GPUs NVIDIA sin reconversión.
- Configuración corregida manualmente: se añadieron dos claves al `config.json` antes de la conversión; conviene validar la coherencia del modelo en producción.
- Sin métricas publicadas: no hay benchmarks que respalden la calidad de esta cuantización frente al original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tmthang86/Artemis-31B-v1.2-heretic-mlx-6bit
- Modelo base de la cuantización: https://huggingface.co/sjorsb/Artemis-31B-v1.2-heretic
- Modelo original: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Modelo base de Google: https://huggingface.co/google/gemma-4-31B-it
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
