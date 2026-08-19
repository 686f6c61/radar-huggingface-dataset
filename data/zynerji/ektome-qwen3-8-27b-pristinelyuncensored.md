# Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored

## Resumen

Ektome-Qwen3.8-27B-PristinelyUncensored es una variante del modelo Qwen/Qwen3.8-27B (27 356 millones de parámetros) a la que se ha aplicado el método Ektome, una técnica de "cirugía de pesos" que elimina la dirección de rechazo (refusal direction) del modelo sin ningún tipo de entrenamiento o fine-tuning. El autor, Zynerji, publica estos pesos en formato bf16 safetensors con licencia Apache-2.0, con el objetivo de ofrecer una base limpia para fine-tuning posterior, libre de los mecanismos de censura que suelen incorporar los modelos comerciales.

El modelo resuelve el problema de la censura excesiva en modelos de lenguaje grandes, permitiendo que el modelo responda a consultas que normalmente rechazaría, manteniendo intactas sus capacidades de conocimiento y generación. La relevancia actual radica en que es un ejemplo de modificación de pesos sin entrenamiento, una alternativa a los métodos de fine-tuning para eliminar sesgos de seguridad, con verificación de calidad mediante "gates" que comprueban que no se degrada el rendimiento ni la coherencia generativa.

La arquitectura es la del modelo base Qwen3.8-27B, un transformer de 27B parámetros, aunque no se especifica la longitud de contexto ni los idiomas soportados en la información disponible. El repositorio incluye únicamente pesos en bf16, sin cuantizaciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.8-27B) |
| Parametros totales | 27 356 728 560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors en bf16 (sin cuantizaciones GGUF u otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura del Qwen3.8-27B, un transformer autoregresivo de 27B parámetros desarrollado por Alibaba. No se proporcionan detalles sobre el número de tokens de entrenamiento, composición del dataset o técnicas de alineación (RLHF/DPO) del modelo base, ya que esa información no está incluida en la model card.

La innovación principal es el método Ektome (del griego ἐκτομή, "excisión"), que consiste en leer la dirección de rechazo del modelo a partir de sus activaciones y eliminarla quirúrgicamente de las matrices de escritura residual (rank-1, norm-preserving). Este proceso no utiliza gradientes, datos de entrenamiento ni fine-tuning. El autor aplicó una configuración con A:frac=0.6, editando 128 matrices de escritura residual, y validó el resultado mediante un "gate" que exige que el modelo no aumente las tasas de rechazo, no degrade la capacidad (medida con MMLU-val) y no presente degeneración generativa (code-switching, bucles o salidas vacías).

## Capacidades

- Generación de texto y conversación: el modelo es capaz de producir respuestas coherentes y contextuales, como el Qwen base.
- Razonamiento y conocimiento: la model card reporta una precisión de 0.818 en MMLU-val, lo que indica un nivel de conocimiento general comparable al modelo original.
- Instrucciones: el gate de instruction-following muestra un valor de 0.400, lo que sugiere que el modelo sigue instrucciones de forma limitada, no perfecta.
- Sin censura: al haberse eliminado la dirección de rechazo, el modelo no presenta respuestas de negativa ante consultas que normalmente serían bloqueadas (refusal compliance = 0.000).
- Base para fine-tuning: los pesos en bf16 están diseñados para ser utilizados como punto de partida para entrenamientos posteriores, manteniendo los estados ocultos legibles (compatible con logit-lens).
- No se mencionan capacidades de tool calling, visión, audio o modo de razonamiento explícito en la información disponible.

## Casos de uso

- Investigación en alineación y seguridad de modelos: al estar abliterado, permite estudiar el comportamiento del modelo sin mecanismos de rechazo, analizando cómo responde a prompts sensibles y qué patrones subyacen a la censura.
- Fine-tuning para dominios especializados: los pesos bf16 sirven como base limpia para entrenar modelos en tareas concretas (legal, médico, técnico) sin interferencias de la capa de rechazo, reduciendo el tiempo y los datos necesarios.
- Generación creativa sin restricciones: escritura de ficción, guiones o contenido artístico que requiera explorar temas tabú o controvertidos sin que el modelo se niegue a participar.
- Evaluación de técnicas de "abliteration": comparar el rendimiento de este modelo con el original para medir el impacto de la excisión de pesos en capacidades y coherencia.
- Desarrollo de asistentes conversacionales para nichos específicos: chatbots para comunidades que necesitan respuestas directas sin filtros de seguridad, siempre que se cumplan las normativas legales.
- Pruebas de robustez generativa: al pasar los gates de degeneración (code-switch rate 0.000, degeneration rate 0.000), es adecuado para experimentos que requieren salidas estables y sin bucles.

## Benchmarks y rendimiento

La model card del autor incluye una tabla con los resultados de las "gates" de validación, comparando el modelo "pristine" (original) y el "uncensored" (abliterado). No se proporcionan benchmarks adicionales (HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

| Gate | Pristine | Uncensored |
|---|---|---|
| Refusal compliance | 0.000 | 1.000 |
| MMLU-val accuracy | 0.812 | 0.818 (Δ +0.005) |
| Code-switch rate | 0.000 | 0.000 |
| Degeneration rate | 0.000 | 0.000 |
| Instruction-following | 0.400 | 0.400 |

Estos datos indican que la excisión no degrada el rendimiento en MMLU (incluso mejora ligeramente) y mantiene la coherencia generativa. No hay información sobre latencia o throughput.

## Requisitos de hardware

- VRAM estimada: los pesos en bf16 ocupan aproximadamente 54,7 GB (27 356 728 560 parámetros × 2 bytes). Para inferencia se necesita al menos esa cantidad de VRAM, más memoria para activaciones y overhead, por lo que se recomienda una GPU con 60 GB o más.
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB, o GPUs con 48GB o más (como A6000, RTX 6000 Ada) si se usa batching pequeño. No cabe en GPUs de consumo como RTX 4090 (24GB) sin cuantización, y no se ofrecen versiones cuantizadas.
- Opciones de despliegue: al ser safetensors estándar, se puede usar con transformers, vLLM, TGI u otros frameworks que soporten bf16. No hay soporte nativo para llama.cpp u Ollama sin conversión previa a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de otros modelos abliterados o variantes del Qwen3.8-27B para realizar una comparativa cuantitativa. La única referencia es el modelo base original, del que se diferencia únicamente por la eliminación de la dirección de rechazo. No se conocen modelos comparables en la misma categoría (abliteración sin entrenamiento) con datos públicos de rendimiento.

## Limitaciones y advertencias

- Contenido sin censura: al eliminar la dirección de rechazo, el modelo puede generar contenido ofensivo, ilegal, peligroso o éticamente cuestionable. El uso en producción requiere supervisión humana y cumplimiento legal.
- No es un modelo final: está pensado como base para fine-tuning, no como un asistente listo para usar. La capacidad de seguir instrucciones es limitada (0.400 en el gate).
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información, especialmente en dominios especializados.
- Sesgos no documentados: al ser una modificación del Qwen base, puede heredar sesgos del entrenamiento original, pero no se han evaluado específicamente.
- Sin cuantizaciones: solo se ofrecen pesos bf16, lo que limita el despliegue en hardware de gama baja.
- Datos de contexto e idiomas no especificados: no se conoce la longitud de contexto máxima ni los idiomas soportados, lo que dificulta su uso en aplicaciones multilingües o de contexto largo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
