# VinkyV/gpt_oss_20B_fabled

## Resumen

GPT-OSS 20B Fabled es un ajuste fino (fine-tuning) del modelo GPT-OSS 20B de OpenAI, partiendo concretamente de la versión cuantizada en 4 bits publicada por Unsloth (`unsloth/gpt-oss-20b-unsloth-bnb-4bit`). Lo desarrolla el usuario VinkyV y se distribuye bajo licencia Apache 2.0 en Hugging Face. El modelo mantiene la arquitectura Mixture-of-Experts (MoE) del GPT-OSS original de 20 000 millones de parámetros, aunque la model card no detalla el número de parámetros activos ni la longitud de contexto.

El interés de esta publicación es limitado pero ilustrativo: se trata de un ejemplo de fine-tuning rápido sobre un modelo abierto de OpenAI usando Unsloth y TRL, una combinación que reduce a la mitad el tiempo de entrenamiento respecto a pipelines convencionales. El repositorio ocupa 33 GB, lo que sugiere que los pesos se han subido en el formato derivado del entrenamiento (probablemente safetensors en precisión completa o bf16, a pesar de partir de una base cuantizada en 4 bits).

La model card es extremadamente escasa: no documenta el dataset de ajuste, el número de tokens de entrenamiento, los hiperparámetros ni resultados de evaluación. Cualquier uso en producción debería considerar esta falta de trazabilidad como un riesgo relevante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (heredada de GPT-OSS 20B; detalles no disponibles en la model card) |
| Parametros totales | 20 000 millones (aproximado, segun el nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El modelo base de partida es bnb-4bit; el repo subido no especifica cuantizaciones adicionales |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | No especificado en la model card; el repositorio ocupa 33 GB (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de GPT-OSS 20B, un transformer con capas Mixture-of-Experts desarrollado por OpenAI y publicado como pesos abiertos. La model card de este ajuste no aporta detalles adicionales sobre la arquitectura interna, el número de expertos, la dimensión oculta ni el mecanismo de atención. Tampoco se especifica si el modelo incorpora modo de razonamiento (thinking) o decodificación especulativa, características presentes en la familia GPT-OSS original.

El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, partiendo de la versión `unsloth/gpt-oss-20b-unsloth-bnb-4bit`. El autor afirma que el entrenamiento fue "2x más rápido" gracias a Unsloth, pero no se documenta el dataset, el número de pasos, la tasa de aprendizaje, el uso de RLHF/DPO ni ninguna innovación técnica propia. No hay información sobre la composición de los datos de ajuste ni sobre si se aplicaron técnicas de alineación adicionales.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base GPT-OSS 20B.
- Razonamiento y resolución de problemas (capacidad presumible del modelo base, no verificada en este ajuste).
- Generación de código y matemáticas (capacidad presumible del modelo base, no verificada).
- Soporte de tool calling y function calling: no confirmado en la model card de este ajuste.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en este ajuste.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Experimentación con fine-tuning sobre GPT-OSS: el modelo sirve como ejemplo reproducible de cómo ajustar un GPT-OSS 20B con Unsloth y TRL en un entorno con recursos moderados, útil para investigadores que quieran replicar el pipeline.
- Prototipado de asistentes conversacionales en inglés: al heredar las capacidades del GPT-OSS 20B, puede emplearse para generar respuestas multi-turno en inglés, aunque sin garantías documentadas sobre calidad tras el ajuste.
- Base para nuevos ajustes finos: dado que se distribuye bajo Apache 2.0, puede utilizarse como punto de partida para especializaciones posteriores en dominios concretos.
- Evaluación comparativa de fine-tunings comunitarios: útil para estudiar el impacto de ajustes no documentados sobre modelos abiertos de referencia.
- Docencia y formación en IA open source: sirve para ilustrar el flujo Unsloth + TRL + Hugging Face en cursos prácticos.
- Investigación sobre reproducibilidad: la falta de documentación del dataset lo convierte en un caso de estudio sobre los riesgos de los fine-tunings comunitarios sin trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 20 000 millones de parámetros, en bf16 requeriría aproximadamente 40 GB de VRAM; en cuantización 4 bits, alrededor de 12-14 GB (estimación basada en el tamaño, no confirmada por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para inferencia en precisión completa; RTX 4090 (24 GB) o A6000 (48 GB) para cuantización 4 bits.
- Cabe en GPU consumer: sí, en RTX 4090 o GPUs con 16-24 GB si se cuantiza a 4 bits; no en GPUs de 8 GB.
- Opciones de despliegue: transformers (librería indicada en la model card), text-generation-inference (etiqueta presente), y potencialmente vLLM, llama.cpp u Ollama si se generan los formatos correspondientes (no confirmado).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GPT-OSS 20B Fabled (este modelo) | ~20 000 M (MoE) | no disponible | Apache 2.0 | Hugging Face |
| GPT-OSS 20B (OpenAI, original) | ~20 000 M (MoE) | no disponible | Apache 2.0 | Hugging Face |
| GPT-OSS 20B Unsloth bnb-4bit (base) | ~20 000 M (MoE) | no disponible | Apache 2.0 | Hugging Face |
| Fine-tunings comunitarios de GPT-OSS 20B | ~20 000 M (MoE) | variable | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta el dataset de ajuste, los hiperparámetros ni el proceso de entrenamiento, lo que impide evaluar la calidad y los sesgos introducidos.
- Riesgo elevado de alucinación y de comportamientos no deseados al desconocerse la alineación aplicada tras el ajuste.
- Idioma limitado al inglés según la etiqueta del repositorio; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto no documentada; no se puede asumir la del GPT-OSS original sin verificación.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la falta de trazabilidad del ajuste hace recomendable una evaluación propia antes de cualquier despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- El tamaño del repositorio (33 GB) sugiere pesos en precisión alta, lo que puede complicar el despliegue en entornos con VRAM limitada sin cuantización adicional.

## Enlaces

- [Hugging Face: VinkyV/gpt_oss_20B_fabled](https://huggingface.co/VinkyV/gpt_oss_20B_fabled)
- [Modelo base: unsloth/gpt-oss-20b-unsloth-bnb-4bit](https://huggingface.co/unsloth/gpt-oss-20b-unsloth-bnb-4bit)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
- [TRL de Hugging Face](https://github.com/huggingface/trl)
