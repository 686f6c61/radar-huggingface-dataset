# TOWIN-AI/OLMo-3.1-32B-Think-GPTQ-Int4-16bit-output

## Resumen

OLMo-3.1-32B-Think-GPTQ-Int4-16bit-output es una versión cuantizada a INT4 del modelo de razonamiento OLMo-3.1-32B-Think, desarrollado originalmente por el Allen Institute for AI (Ai2). La cuantización la mantiene TOWIN-IA (TYBSI SL, Zamora, España) mediante GPTQ con la herramienta LLM Compressor, aplicando un esquema W4A16: pesos en INT4 con grupo de 128 y simétrico, pero activaciones mantenidas en 16 bits. El resultado es un artefacto de aproximadamente 17 GB en un único fichero safetensors, compatible de forma nativa con vLLM a través del formato compressed-tensors.

El modelo base es un transformer denso de 32.233.522.176 parámetros con un modo de razonamiento explícito (`think`) que expone la traza de razonamiento en el campo `content` de la respuesta antes de emitir la respuesta final. Está entrenado sobre un corpus multilingüe que cubre español, inglés y código, lo que lo hace especialmente relevante para despliegues en producción en el ámbito hispanohablante.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 32B con capacidad de razonamiento en infraestructura más modesta que la requerida por BF16, manteniendo las activaciones a 16 bits para preservar la calidad del modo `think`. La licencia Apache 2.0 del modelo base se hereda en este derivado, lo que facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base OLMo-3.1-32B-Think) |
| Parámetros totales | 32.233.522.176 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens (configurado en el ejemplo de servicio con `--max-model-len 65536`) |
| Tipos de cuantización | INT4 W4A16 (pesos INT4, activaciones 16 bits), group_size=128, simétrico, GPTQ vía llmcompressor |
| Idiomas soportados | Español, inglés y código |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (`pack-quantized`), un único `model.safetensors` de ~17 GB |

## Arquitectura y entrenamiento

El modelo base OLMo-3.1-32B-Think es un transformer denso de 32B parámetros con un modo de razonamiento explícito. La información disponible no detalla la composición exacta del dataset de entrenamiento ni el número de tokens utilizados, ni si se aplicaron fases de RLHF o DPO; estos datos deben consultarse en la model card del modelo base de Ai2. El modelo está entrenado para mostrar su proceso de razonamiento interno antes de la respuesta final, lo que permite escenarios de auditoría y trazabilidad.

La innovación técnica de este artefacto concreto es la receta de cuantización W4A16: los pesos se cuantizan a INT4 con GPTQ (group_size=128, simétrico) mientras que las activaciones se mantienen en 16 bits sin cuantizar, y la capa `lm_head` se conserva en BF16. El calibrado se realizó con `openai/gsm8k` (`train[:512]`), 512 muestras. El objetivo declarado es preservar la calidad del modo `think` reduciendo el peso de los pesos 4×. La cuantización se ejecutó en una NVIDIA RTX PRO 6000 Blackwell (97 GB VRAM).

## Capacidades

- Generación de texto conversacional e instructiva: respuestas, explicaciones de conceptos y análisis de documentos.
- Modo de razonamiento explícito (`think`): expone la cadena de razonamiento en el campo `content` antes de la respuesta final, útil para auditoría y trazabilidad.
- Generación de código: el modelo está entrenado sobre corpus de código además de español e inglés.
- Capacidades multilingües en español e inglés.
- Salidas estructuradas: la model card menciona la producción de salidas estructuradas en modo instruct.
- Compatibilidad con tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente en la información proporcionada, aunque el modo `think` es afín a razonamiento multi-paso.
- Visión y audio: no disponible (modelo de texto).

## Casos de uso

- Auditoría y trazabilidad de decisiones: el modo `think` expone la cadena de razonamiento en el campo `content`, lo que permite revisar cómo llegó el modelo a una conclusión en entornos donde se exige justificar respuestas.
- Asistencia jurídica y normativa: con contexto de hasta 65.536 tokens y entrenamiento en español, puede analizar documentos legales largos (por ejemplo, explicar el RGPD) manteniendo el razonamiento visible para revisión humana.
- Generación y revisión de código: al estar entrenado sobre corpus de código, puede integrarse en pipelines de desarrollo para generar fragmentos, explicar funciones o revisar cambios, con la traza de razonamiento disponible para depuración.
- Atención al cliente en español: conversaciones multi-turno con contexto largo gracias a la ventana de 65.536 tokens, desplegado con vLLM y el endpoint compatible con la API de OpenAI.
- Despliegue soberano on-premise: TOWIN-IA orienta el artefacto a infraestructura europea bajo jurisdicción europea; el formato INT4 permite ejecutarlo en GPUs de 24-48 GB con tensor parallelism, reduciendo costes frente a BF16.
- Procesamiento de documentación técnica: análisis y resumen de manuales o especificaciones extensas en español e inglés, aprovechando el contexto largo y la capacidad de salida estructurada.
- Evaluación educativa y tutoría: el modo `think` permite mostrar el razonamiento paso a paso en explicaciones, útil en plataformas de aprendizaje que quieran exponer el proceso además del resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para pesos: ~17 GB (un único `model.safetensors` en INT4).
- VRAM total: los pesos ocupan ~17 GB, pero debe sumarse la caché KV; la model card recomienda `--kv-cache-dtype fp8` y planificar según la longitud de contexto. Con contexto de 65.536 tokens la caché KV puede ser considerable.
- GPU recomendadas: el ejemplo de servicio usa `--tensor-parallel-size 2`, por lo que se prevé un despliegue multi-GPU. La cuantización se generó en una NVIDIA RTX PRO 6000 Blackwell (97 GB VRAM).
- ¿Cabe en GPU consumer? Los pesos (~17 GB) caben en GPUs de 24 GB (por ejemplo, RTX 3090/4090) para contextos cortos; para contextos largos se necesita más VRAM o tensor parallelism en varias GPUs.
- Opciones de despliegue: vLLM es el soporte principal y recomendado (detección automática del formato compressed-tensors, sin flag `--quantization`). No se confirma soporte para llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OLMo-3.1-32B-Think-GPTQ-Int4-16bit-output (este) | 32,2B | 65.536 | INT4 W4A16 (GPTQ) | Apache 2.0 | Hugging Face, vLLM |
| allenai/OLMo-3.1-32B-Think (base) | 32,2B | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Alternativas de 32B con razonamiento | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Precisión W4A16: los pesos están cuantizados a INT4; la model card advierte de posibles degradaciones pequeñas en tareas de contexto muy largo respecto al modelo base en BF16.
- Traza de razonamiento visible: el modo `think` expone el razonamiento interno en el campo `content`; no debe mostrarse directamente al usuario final salvo que sea la experiencia deseada. Puede suprimirse parseando el contenido o usando stop tokens (por ejemplo, `["<|endofthought|>"]`, ajustando a la plantilla real).
- Sin moderación integrada: el modelo no incluye guardrails; es necesario añadirlos en la aplicación si se expone a usuarios finales.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a modelos generativos de este tamaño.
- Sesgos: no documentados en la información proporcionada.
- Licencia: Apache 2.0, permite uso comercial; el derivado hereda la licencia del modelo base de Ai2.
- Hardware: requiere planificar la caché KV según la longitud de contexto; el ejemplo de servicio usa tensor parallelism 2 y caché KV en fp8.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TOWIN-AI/OLMo-3.1-32B-Think-GPTQ-Int4-16bit-output
- Modelo base: https://huggingface.co/allenai/OLMo-3.1-32B-Think
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- Dataset de calibración: https://huggingface.co/datasets/openai/gsm8k
