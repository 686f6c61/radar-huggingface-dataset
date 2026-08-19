# vamazing/Koa-AI-v1-Code-3B

## Resumen

Koa-AI-v1-Code-3B es un modelo de lenguaje de 3.800 millones de parámetros, desarrollado por el usuario vamazing, especializado en generación de código, planificación agéntica de múltiples pasos y tareas de depuración. Está construido sobre el modelo base `mistralai/Ministral-3b-instruct` mediante fine-tuning con QLoRA y el framework Unsloth, lo que lo hace especialmente ligero y eficiente para ejecutarse en hardware de consumo, portátiles con GPU y dispositivos edge.

El modelo fue entrenado sobre el dataset `greghavens/fable-5-coding-and-debugging-traces`, que contiene trazas de depuración y razonamiento de código en múltiples turnos. Su tamaño reducido y su ventana de contexto nativa de hasta 128.000 tokens lo convierten en una opción interesante para aplicaciones de completado de código en tiempo real, asistentes de programación locales y flujos de trabajo de desarrollo asistido por IA. La licencia Apache 2.0 permite su uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Ministral-3b-instruct) |
| Parametros totales | 3.849.090.048 (3,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (nativo); fine-tuning con secuencias de 2.048 tokens |
| Tipos de cuantizacion | No especificado; se distribuye en safetensors y GGUF (probablemente NF4, BF16 y cuantizaciones GGUF estándar) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Ministral-3b-instruct, un transformer decoder-only con atención causal, similar en diseño a los modelos Mistral de mayor tamaño pero con un número reducido de parámetros. No se dispone de detalles sobre el número de capas, cabezas de atención o dimensión oculta, pero se trata de un modelo denso (sin mezcla de expertos).

El entrenamiento consistió en un fine-tuning con QLoRA de 4 bits, aplicado sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. La configuración de LoRA fue `r=16`, `alpha=32` y dropout 0, con una tasa de aprendizaje de `2e-4` y el optimizador AdamW de 8 bits. El proceso se realizó con Unsloth y PyTorch, utilizando el dataset de trazas de codificación y depuración mencionado. No se indica si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de código en múltiples lenguajes, con énfasis en Python (según los ejemplos de la model card).
- Razonamiento multi-paso y planificación agéntica para tareas de depuración y resolución de problemas de programación.
- Seguimiento de instrucciones conversacionales, gracias a su base instruct y al fine-tuning sobre diálogos de depuración.
- Ventana de contexto larga (128k tokens) que permite procesar repositorios o archivos de código extensos.
- Compatible con el pipeline `text-generation` de Hugging Face Transformers, lo que facilita su integración en aplicaciones existentes.
- Soporte de cuantización GGUF, lo que permite su ejecución en CPU y GPU con poca memoria mediante llama.cpp o similares.

## Casos de uso

- Completado de código en editores locales: el modelo puede integrarse en extensiones de VS Code o Continue para ofrecer sugerencias de código en tiempo real con baja latencia, gracias a su tamaño reducido y a la posibilidad de cuantizarlo a 4 bits.
- Asistente de depuración en entornos de desarrollo: dado su entrenamiento en trazas de debugging, puede analizar errores, proponer correcciones y explicar el flujo de ejecución en conversaciones multi-turno.
- Generación de documentación técnica: a partir de fragmentos de código, el modelo puede redactar comentarios, docstrings o explicaciones de algoritmos.
- Automatización de tareas de refactorización: con su capacidad de razonamiento multi-paso, puede sugerir cambios de código para mejorar legibilidad o rendimiento.
- Agente de programación en pipelines de CI/CD: puede integrarse en flujos de integración continua para revisar código, detectar patrones problemáticos o generar pruebas unitarias básicas.
- Prototipado rápido de scripts: para desarrolladores que necesitan generar scripts de automatización o análisis de datos sin escribir cada línea manualmente, el modelo ofrece respuestas concisas y ejecutables.

## Benchmarks y rendimiento

La model card incluye resultados preliminares de IFEval (Instruction Following Evaluation) obtenidos con `lm-evaluation-harness` sobre una muestra de 100 ejemplos (`--limit 100`). No se proporcionan otros benchmarks como MMLU, HumanEval o GSM8K.

| Metrica | Resultado |
|---|---|
| Prompt-level strict accuracy | 34,00 % |
| Prompt-level loose accuracy | 44,00 % |
| Instruction-level strict accuracy | 55,83 % |
| Instruction-level loose accuracy | 62,58 % |

Estos valores son preliminares y deben interpretarse con cautela, ya que la muestra es pequeña y no se especifica el conjunto de validación completo.

## Requisitos de hardware

- VRAM estimada para inferencia: en cuantización de 4 bits, aproximadamente 2-3 GB; en 8 bits, 4-5 GB; en 16 bits, 7-8 GB (estimaciones basadas en el tamaño de parámetros).
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) para ejecución cómoda en 4-bit u 8-bit. Para 16-bit se recomienda 8 GB o más (RTX 3070, RTX 4070, etc.).
- También puede ejecutarse en CPU con cuantización GGUF, aunque la velocidad será menor.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI o directamente con Transformers.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño de 3B, se espera una latencia de decenas de milisegundos por token en GPU moderna con cuantización, pero estos valores son orientativos.

## Comparativa con modelos similares

La siguiente tabla compara Koa-AI-v1-Code-3B con otros modelos de tamaño similar orientados a código o instrucciones. Los datos de rendimiento no están disponibles para todos, por lo que la comparación se basa en especificaciones.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Koa-AI-v1-Code-3B | 3,8B | 128k | Apache 2.0 | Código y depuración |
| Qwen2.5-Coder-3B | 3,8B | 32k | Apache 2.0 | Código |
| Phi-3-mini (4k) | 3,8B | 4k | MIT | Instrucciones generales |
| StableLM-3B | 3B | 4k | CC-BY-SA | Instrucciones generales |

Koa-AI destaca por su contexto largo y su especialización en trazas de depuración, mientras que Qwen2.5-Coder-3B tiene un contexto menor pero un rendimiento más conocido en benchmarks de código. No se dispone de comparativas directas de rendimiento con estos modelos.

## Limitaciones y advertencias

- El modelo está entrenado principalmente en inglés; su rendimiento en otros idiomas puede ser limitado o inexistente.
- Al ser un modelo de 3B, puede presentar alucinaciones o errores en tareas complejas de razonamiento, especialmente fuera del dominio de código.
- La ventana de contexto de 128k es nativa, pero el fine-tuning se realizó con secuencias de 2.048 tokens; es posible que el rendimiento se degrade con entradas mucho más largas.
- Los resultados de IFEval son preliminares y con una muestra pequeña; no se ha evaluado en benchmarks estándar de código como HumanEval o MBPP.
- No se ha confirmado soporte para function calling o tool calling, aunque el modelo base Ministral podría tener cierta capacidad; no está documentado en la model card.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del dataset base y del modelo base para asegurar el cumplimiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/vamazing/Koa-AI-v1-Code-3B)
- [Dataset de entrenamiento](https://huggingface.co/datasets/greghavens/fable-5-coding-and-debugging-traces)
- [Modelo base Ministral-3b-instruct](https://huggingface.co/mistralai/Ministral-3b-instruct)
