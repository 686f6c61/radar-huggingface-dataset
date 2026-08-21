# spkc83/retail-bank-servicing-agent-9b-peft-v9-conversational-voice

## Resumen

El modelo `spkc83/retail-bank-servicing-agent-9b-peft-v9-conversational-voice` es un adaptador LoRA (PEFT) de continuación de entrenamiento, diseñado para especializar un modelo base de 9 mil millones de parámetros en tareas de atención al cliente en banca minorista. El autor, spkc83, lo publica como un adaptador independiente que debe cargarse sobre una revisión concreta del modelo base `spkc83/retail-bank-servicing-agent-9b`, junto con un adaptador padre previo (v5-remediation). El objetivo es mejorar las capacidades conversacionales y de tool-calling del sistema en el dominio bancario.

Este adaptador se enmarca en una línea de desarrollo iterativa (v5, v6, v9) orientada a construir un agente de servicio bancario con capacidades de generación de texto y llamada a herramientas. Su relevancia radica en que permite ajustar un modelo de 9B mediante técnicas de fine-tuning eficiente en parámetros (PEFT), lo que reduce costes de entrenamiento y despliegue frente a un fine-tuning completo. La licencia Apache 2.0 facilita su uso comercial y su integración en sistemas de producción.

La información pública disponible es escasa: no se especifican arquitectura interna, datos de entrenamiento detallados, ni resultados de benchmarks. El repositorio contiene únicamente los pesos del adaptador (0.2 GB) y la documentación indica que se requiere cargar el modelo base en BF16 y adjuntar el adaptador con la librería PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 9B, presumiblemente transformer, sin confirmar) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica para cargar sobre base BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El repositorio contiene únicamente un adaptador LoRA (PEFT) y no incluye los pesos del modelo base. Según la model card, el adaptador debe cargarse sobre la revisión exacta `1d56824995aa1adecfe20f62ca42fb1c0c443817` del modelo base `spkc83/retail-bank-servicing-agent-9b`, y sobre el adaptador padre `v5-remediation` (revisión `d965816bd6a9252bfb4327c1b0d64f9d34f4a1a2`). El entrenamiento se realizó mediante fine-tuning supervisado (SFT) sobre el dataset `spkc83/retail-bank-servicing-alignment-sft` (revisión `0f99604ac5f9366828e90fd46a6343cebb72f1a5`), con 350 pasos de optimizador. No se proporcionan detalles sobre la arquitectura del modelo base, el número de tokens de entrenamiento, ni si se aplicaron técnicas adicionales como RLHF o DPO. La etiqueta `granite` sugiere que el modelo base podría pertenecer a la familia Granite de IBM, pero no se confirma en la documentación.

## Capacidades

- Generación de texto conversacional orientada a servicio bancario minorista.
- Soporte de tool-calling (llamada a herramientas), según las etiquetas del modelo.
- Capacidad de integración en flujos de agente conversacional (el nombre del modelo incluye "conversational-voice").
- Especialización en dominio bancario: atención al cliente, resolución de consultas y posible gestión de operaciones.
- No se documentan capacidades multimodales, de razonamiento avanzado ni de pensamiento explícito.

## Casos de uso

- Atención al cliente bancaria automatizada: el modelo puede gestionar conversaciones multi-turno con clientes, resolviendo consultas sobre saldos, movimientos, tarjetas o productos, gracias a su fine-tuning en datos de alineación bancaria.
- Asistente virtual con integración de herramientas: al soportar tool-calling, puede conectarse a APIs bancarias para consultar saldos, realizar transferencias o bloquear tarjetas, actuando como agente transaccional.
- Soporte en canal de voz: el nombre del adaptador incluye "conversational-voice", lo que sugiere su uso en sistemas de IVR o asistentes de voz, donde el modelo procesa entradas de texto transcritas y genera respuestas habladas.
- Automatización de back-office bancario: puede clasificar y responder correos o mensajes internos de clientes, reduciendo la carga de los agentes humanos.
- Entrenamiento de agentes especializados: el adaptador puede servir como base para fine-tuning adicional en subdominios bancarios concretos (hipotecas, inversiones, etc.) mediante PEFT.
- Despliegue en entornos con recursos limitados: al ser un adaptador LoRA, permite actualizar el comportamiento del modelo base sin necesidad de reentrenar los 9B parámetros completos, facilitando su uso en infraestructuras modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona "evaluación de entrenamiento completada antes de la publicación" y "gates de evaluación conductual congelados", pero no se ofrecen cifras concretas de MMLU, HumanEval, GSM8K ni otras métricas estándar.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado que el modelo base tiene 9B parámetros y se carga en BF16, se estima un consumo de al menos 18 GB de VRAM para inferencia sin cuantización. Con cuantización (por ejemplo, 4-bit) podría reducirse a unos 6-8 GB, pero no se especifica.
- GPU recomendadas: no disponible. Para 9B en BF16 se necesitaría una GPU con al menos 24 GB (por ejemplo, RTX 3090/4090, A10G, L4). Para cuantización 4-bit, una RTX 3060 de 12 GB podría ser suficiente, pero no hay confirmación.
- Si cabe en consumer GPU: probablemente sí con cuantización, pero no se documenta.
- Opciones de despliegue: al ser un adaptador PEFT, debe cargarse con la librería PEFT sobre el modelo base. Se puede servir con frameworks compatibles con PEFT (por ejemplo, vLLM, TGI, o directamente con transformers + peft). No se mencionan formatos GGUF ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con alternativas de la misma categoría. El modelo base (9B) podría compararse con otros modelos de 7B-9B especializados en servicio al cliente, como Llama 3.1 8B o Mistral 7B, pero no hay datos de rendimiento ni de arquitectura confirmada. Se indica "no disponible".

## Limitaciones y advertencias

- El adaptador requiere cargar una revisión exacta del modelo base y del adaptador padre; cualquier discrepancia en las revisiones puede provocar fallos de carga o comportamiento degradado.
- No se incluyen los pesos del modelo base fusionados; es necesario descargar el modelo base completo (9B) además del adaptador, lo que aumenta los requisitos de almacenamiento.
- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real en producción no está verificado.
- La model card indica que la "elegibilidad de publicación aún requiere los gates de evaluación conductual congelados sin cambios", lo que sugiere que el modelo podría no haber superado todas las validaciones de seguridad o calidad.
- No se especifican sesgos conocidos, pero al estar entrenado en un dominio bancario específico, podría presentar sesgos hacia ciertos perfiles de clientes o productos.
- Riesgo de alucinación en información bancaria sensible: sin evaluación independiente, no se puede garantizar la precisión de las respuestas en escenarios críticos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de soporte ni de idoneidad para producción.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/spkc83/retail-bank-servicing-agent-9b-peft-v9-conversational-voice
- Modelo base: https://huggingface.co/spkc83/retail-bank-servicing-agent-9b
- Adaptador padre v5-remediation: https://huggingface.co/spkc83/retail-bank-servicing-agent-9b-peft-v5-remediation
- Repositorio GitHub del proyecto: https://github.com/spkc83/retail-bank-servicing
- Dataset de entrenamiento: https://huggingface.co/datasets/spkc83/retail-bank-servicing-alignment-sft
