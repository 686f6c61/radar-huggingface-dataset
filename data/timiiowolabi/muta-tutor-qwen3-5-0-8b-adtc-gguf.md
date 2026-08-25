# timiiowolabi/Muta-Tutor-Qwen3.5-0.8B-ADTC-GGUF

## Resumen

Muta-Tutor-Qwen3.5-0.8B-ADTC-GGUF es un modelo de lenguaje especializado en educación matemática y científica, desarrollado por el usuario timiiowolabi como parte de una campaña de fine-tuning denominada ADTC. Parte del modelo base Qwen/Qwen3.5-0.8B, al que se le aplica un adaptador LoRA de rango 16 en BF16 durante 400 pasos sobre datos de preguntas de opción múltiple de matemáticas y ciencias. El adaptador se fusiona con el modelo base y el resultado se exporta en formato GGUF con cuantización Q4_0, lo que lo hace adecuado para entornos con recursos limitados, como portátiles o dispositivos de bajo consumo.

El modelo está pensado como un tutor educativo que responde a preguntas de opción múltiple, con una mejora notable en tareas de razonamiento científico y matemático respecto al modelo base sin fine-tuning. Según la model card, se trata de un candidato de competición que aún requiere validación en escenarios reales de tutoría y perfilado en el hardware objetivo. Con 772 millones de parámetros y un tamaño de repositorio de 0,5 GB, es un modelo ligero que puede ejecutarse en CPU o GPU de gama baja.

La relevancia actual radica en su enfoque en educación, un área donde los modelos pequeños y eficientes son especialmente útiles para despliegues en aulas, dispositivos personales o aplicaciones offline. Su licencia Apache-2.0 permite uso comercial y modificación sin restricciones significativas, aunque el modelo solo soporta inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la documentación; basada en Qwen/Qwen3.5-0.8B |
| Parametros totales | 772.845.888 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_0 (GGUF) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo Muta-Tutor-Qwen3.5-0.8B-Q4_0.gguf) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo Qwen3.5-0.8B, aunque la model card no detalla si se trata de un transformer estándar, una variante con atención lineal u otra innovación. La información disponible indica que el fine-tuning se realizó con LoRA de rango 16 en precisión BF16, durante 400 pasos, sobre un conjunto de datos de preguntas de opción múltiple de matemáticas y ciencias. El adaptador se fusionó con el modelo base y el resultado se convirtió a GGUF con cuantización Q4_0.

No se mencionan técnicas adicionales como RLHF, DPO o decodificación especulativa. El entrenamiento se evaluó mediante un harness en CPU en la nube, comparando el modelo fine-tuneado con un control de tasa de aprendizaje cero, es decir, el mismo proceso sin actualización de pesos. Esto sugiere que la mejora observada se debe exclusivamente al fine-tuning y no a la conversión o cuantización.

## Capacidades

- Generación de texto en inglés, especializada en preguntas de opción múltiple de matemáticas y ciencias.
- Razonamiento básico en tareas de conocimiento general y científico, con mejoras significativas en ARC-Easy y ARC-Challenge.
- Capacidad limitada para resolver problemas matemáticos sencillos (GSM8K), aunque con rendimiento bajo (20% en un subconjunto de 25 muestras).
- No se documenta soporte para tool calling, agentes, visión, audio ni modos de razonamiento explícitos.
- Multilingüe: solo inglés, según la etiqueta `language: en`.

## Casos de uso

- Tutoría educativa en dispositivos de bajo consumo: el modelo puede ejecutarse en portátiles o tablets con CPU, ofreciendo respuestas a preguntas de opción múltiple de matemáticas y ciencias sin conexión a internet.
- Generación de preguntas de práctica para estudiantes: dado su entrenamiento en datos de opción múltiple, puede generar ítems de examen similares a los de pruebas estandarizadas, aunque con supervisión humana para garantizar calidad.
- Evaluación automática de respuestas en entornos educativos: su capacidad para clasificar opciones correctas puede integrarse en plataformas de aprendizaje para proporcionar retroalimentación inmediata.
- Asistente de estudio en aplicaciones móviles: al ser un modelo pequeño (0,5 GB), cabe en aplicaciones que requieren inferencia local sin depender de la nube.
- Prototipado de sistemas de tutoría inteligente: investigadores pueden usar este modelo como base para experimentar con fine-tuning adicional o integración en pipelines educativos.
- Despliegue en entornos con restricciones de hardware: su cuantización Q4_0 y bajo número de parámetros lo hacen viable en Raspberry Pi o similares, aunque con latencia mayor que en GPU.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación comparando el modelo fine-tuneado con un control (modelo base sin fine-tuning), ambos convertidos a GGUF Q4_0 y evaluados con el mismo harness en CPU en la nube.

| Medida | Control | Fine-tuned |
|---|---:|---:|
| ARC-Easy acc_norm (500 muestras) | 55,2% | 70,2% |
| Scalar total score | 72,8896 | 80,3664 |
| Vector total score | 74,8959 | 82,3962 |
| ARC-Challenge-100 (held-out) | 32% | 42% |
| OpenBookQA-100 (held-out) | 32% | 33% |
| GSM8K-25 (held-out) | 16% | 20% |

No se han publicado comparaciones con otros modelos de tamaño similar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,8 GB con cuantización Q4_0, dado el tamaño de 772M parámetros y el archivo de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, como NVIDIA GTX 1050 Ti, RTX 2060 o superiores. También puede ejecutarse en CPU.
- Compatible con consumer GPU: sí, incluso en iGPUs con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, o cualquier runtime compatible con GGUF. También puede usarse con vLLM si se convierte a otro formato, aunque no se documenta.
- Latencia y throughput: no disponibles. La evaluación se realizó en CPU en la nube, pero no se reportan tiempos.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos de la misma categoría (tutores educativos de ~0,8B) en la información proporcionada. La única comparación disponible es contra el modelo base Qwen3.5-0.8B sin fine-tuning, que actúa como control y muestra una mejora de 15 puntos porcentuales en ARC-Easy. Para una evaluación completa, sería necesario contrastar con otros modelos pequeños como TinyLlama, Phi-3-mini o Qwen2.5-0.5B, pero no hay datos en la documentación.

## Limitaciones y advertencias

- El modelo es un candidato de competición, no validado en producción. La model card indica que aún requiere la plantilla final de tutor integrada, validación de tutoría en vivo y perfilado en el hardware objetivo.
- Solo soporta inglés; no hay capacidades multilingües.
- La longitud de contexto no está especificada, lo que limita su uso en conversaciones largas o documentos extensos.
- Rendimiento bajo en tareas de razonamiento matemático complejo (GSM8K 20%), lo que sugiere que no es adecuado para problemas avanzados.
- Riesgo de alucinación inherente a modelos pequeños; las respuestas deben ser supervisadas en entornos educativos.
- No se documentan sesgos específicos, pero al entrenarse solo con datos de opción múltiple, puede tener limitaciones en formatos de pregunta abierta.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre la exactitud de las respuestas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/timiiowolabi/Muta-Tutor-Qwen3.5-0.8B-ADTC-GGUF
- Repositorio de Qwen3.5 (serie general): https://github.com/timothyba/Qwen3.5
- Repositorio de Qwen3 (serie anterior): https://github.com/QwenLM/Qwen3
- Colección Qwen3 en HuggingFace: https://huggingface.co/collections/Qwen/qwen3
- Wiki de Qwen3.5 en AIMS5.0: https://aitoolbox.tmit.bme.hu/Tools/Qwen35
