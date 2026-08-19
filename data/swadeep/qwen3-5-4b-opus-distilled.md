# swadeep/Qwen3.5-4b-opus-distilled

## Resumen

`swadeep/Qwen3.5-4b-opus-distilled` es un ajuste fino LoRA-SFT del modelo multimodal `Qwen/Qwen3.5-4B`, desarrollado por el autor swadeep. El objetivo es destilar el estilo de razonamiento paso a paso de Claude Opus 4.6/4.7 en un modelo abierto de 4.540 millones de parametros, manteniendo la torre de vision del modelo base para procesar tanto texto como imagenes. El resultado es un modelo compacto con modo de pensamiento nativo (`thinking` + `response`) y capacidades de razonamiento, codificacion y seguimiento de instrucciones complejas.

El entrenamiento se realizo en tres etapas de SFT: una primera sobre 8.000 muestras equilibradas de matematicas, codigo, economia y finanzas; una segunda de correccion de "fuga de contexto" entre turnos con inserciones de preguntas fuera de tema; y una tercera final sobre 6.000 filas de razonamiento de Opus (4.000 de codigo y 2.000 de instrucciones complejas). La LoRA se fusiono con una escala de 0.04. Con una ventana de contexto de hasta 262.144 tokens y licencia Apache 2.0, es relevante para quienes buscan un modelo pequeno, multimodal y con razonamiento explicito para despliegue en produccion o experimentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (texto + vision) |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 262.144 tokens |
| Tipos de cuantizacion | no disponible (el tag `gguf` sugiere disponibilidad de cuantizaciones GGUF, pero no se especifican los tipos) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B`, una arquitectura transformer multimodal (`Qwen3_5ForConditionalGeneration`) que combina una torre de texto con una torre de vision, lo que permite procesar entradas de texto e imagen. El ajuste se realizo mediante LoRA (r=16, alpha=32, dropout 0.05) sobre los modulos q/k/v/o_proj y gate/up/down_proj, con fusion final a escala 0.04 (las matrices `lora_B` se multiplicaron por 0.04 antes de fusionar).

El entrenamiento consto de tres etapas de SFT con el template de chat de Qwen3.5 y enmascaramiento de etiquetas solo en las respuestas del asistente, anadiendo dos tokens especiales de pensamiento (` thinking`, ` response`):

1. **SFT original** sobre `angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k` (8.000 muestras: 2.000 de matematicas, 2.000 de codigo, 2.000 de economia, 2.000 de finanzas).
2. **Correccion de fuga de contexto** sobre 2.000 muestras del conjunto original con inserciones de preguntas fuera de tema a mitad de conversacion, mas una instruccion de sistema que obliga a responder cada turno de forma independiente.
3. **SFT final** sobre `grpo_data/opus_reasoning_sft_offtopic` (6.000 filas: 4.000 de codigo con mayoria Python y 2.000 de instrucciones complejas multi-paso, con aumentacion fuera de tema).

Hiperparametros: AdamW de 8 bits, learning rate 2e-4 con schedule lineal, 5 pasos de warmup, weight decay 0.001, longitud maxima de secuencia 4096, batch size 1 con grad accum 1, gradient checkpointing activado, 1 epoca y 3000 pasos. La perdida final de entrenamiento fue ~1.91. El checkpoint liberado es el `checkpoint-3000`.

## Capacidades

- **Razonamiento explicito**: genera bloques ` thinking` y ` response` siguiendo el template de chat de Qwen3.5, con pasos de razonamiento intermedios visibles.
- **Procesamiento multimodal**: acepta entradas de texto e imagen gracias a la torre de vision heredada del modelo base.
- **Generacion de codigo**: entrenado con 4.000 filas de codigo (mayoria Python) con senales como `def`, `import`, `numpy`, `pandas`, `pytorch`, `sql`, `api`, `gpu`.
- **Seguimiento de instrucciones complejas**: 2.000 filas de instrucciones multi-paso no relacionadas con codigo, priorizando conversaciones multi-turno.
- **Conversacion multi-turno**: media de 2.23 turnos de asistente por fila de entrenamiento, con correccion especifica contra la fuga de contexto entre turnos.
- **Capacidades agenticas**: los tags del modelo incluyen `agentic` y `tool calling` no se menciona explicitamente, pero el entrenamiento en razonamiento multi-paso y codigo lo hace apto para pipelines agenticos.
- **Instruccion-following independiente**: disenado para responder cada consulta de forma autonoma sin arrastrar restricciones de turnos anteriores no relacionados.

## Casos de uso

- **Asistente de codigo en entornos de desarrollo**: el modelo puede generar y explicar codigo Python (numpy, pandas, pytorch) con razonamiento paso a paso, integrable en IDEs o pipelines de CI/CD para revision de parches y generacion de tests.
- **Razonamiento matematico y financiero**: entrenado con 2.000 muestras de matematicas y 2.000 de finanzas, es util para resolver problemas de calculo, analisis de inversiones o explicaciones economicas con trazabilidad del razonamiento.
- **Chatbot de soporte con contexto largo**: con hasta 262.144 tokens de ventana, puede mantener conversaciones extensas con historial completo, y su correccion anti-fuga de contexto evita que restricciones de turnos previos contaminen respuestas posteriores.
- **Analisis de documentos con imagenes**: al conservar la torre de vision, puede procesar capturas de pantalla, diagramas o graficos junto con texto, por ejemplo para explicar una figura tecnica o un esquema de arquitectura.
- **Generacion de contenido educativo**: su modo `thinking` permite producir explicaciones didacticas paso a paso en matematicas, economia o programacion, adecuado para tutores automaticos o materiales de formacion.
- **Prototipado de agentes de razonamiento**: su capacidad de razonamiento multi-paso y su tamano reducido (4,54B) lo hacen adecuado para experimentar con pipelines agenticos en hardware modesto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos. Unicamente se reporta la perdida final de entrenamiento (~1.91) y la composicion del dataset, sin evaluacion independiente.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la informacion disponible. A partir del tamano de 4,54B de parametros, se pueden estimar los siguientes requisitos (estimaciones orientativas, no datos oficiales):

- **VRAM estimada para inferencia**: aproximadamente 9 GB en FP16, ~4,5 GB en 8 bits y ~2,3 GB en 4 bits (estimacion basada en el conteo de parametros; el peso de la torre de vision puede anadir algo de uso adicional).
- **GPU recomendadas**: tarjetas consumer como RTX 3060 12 GB, RTX 4070 o superiores pueden ejecutar el modelo en cuantizacion de 4 u 8 bits. Para FP16 completo se recomienda al menos 12 GB de VRAM.
- **Compatibilidad con GPU consumer**: si, cabe en GPUs consumer de 8-12 GB con cuantizacion GGUF.
- **Opciones de despliegue**: al ser un modelo transformers con pesos safetensors y GGUF, es compatible con vLLM, llama.cpp, Ollama y TGI. El tag `endpoints_compatible` sugiere compatibilidad con APIs de inferencia.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| `swadeep/Qwen3.5-4b-opus-distilled` | 4,54B | 262.144 | texto + imagen | Apache 2.0 | Fine-tune LoRA-SFT con razonamiento estilo Opus, fusion a escala 0.04 |
| `Qwen/Qwen3.5-4B` (base) | 4,54B | 262.144 | texto + imagen | Apache 2.0 | Modelo base sin el ajuste de razonamiento; no incluye el estilo de pensamiento de Opus |
| Otros modelos de ~4B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la informacion proporcionada |

La comparacion principal es con su modelo base: el fine-tune anade el estilo de razonamiento explicito de Claude Opus 4.6/4.7, la correccion de fuga de contexto y un enfoque especifico en codigo Python y matematicas, manteniendo la misma arquitectura, contexto y licencia. No se dispone de datos de rendimiento comparativo con otros modelos de tamano similar.

## Limitaciones y advertencias

- **Idioma**: el modelo solo soporta ingles (`language: en`). No esta entrenado para espanol ni otros idiomas, por lo que su uso fuera del ingles puede degradar la calidad.
- **Datos sinteticos**: el entrenamiento se basa en razonamiento generado por Claude Opus 4.6/4.7, lo que puede heredar sesgos o patrones del modelo original, incluyendo posibles alucinaciones en dominios no cubiertos.
- **Sin benchmarks publicados**: no hay evaluacion independiente de rendimiento, por lo que su calidad real en tareas estandarizadas es desconocida.
- **Fuga de contexto**: aunque se aplico una correccion especifica, el problema de arrastre de restricciones entre turnos no relacionados podria persistir en casos no cubiertos por el dataset de entrenamiento.
- **Modelo muy reciente y sin adopcion**: con 0 descargas y 0 likes en el momento de la redaccion, no ha sido validado por la comunidad; su comportamiento en produccion es incierto.
- **Longitud de entrenamiento limitada**: la secuencia maxima de entrenamiento fue de 4096 tokens, muy por debajo de la ventana de contexto de 262.144 tokens, lo que puede afectar al uso de contextos muy largos.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial sin restricciones, pero los datos de entrenamiento derivados de Claude Opus podrian implicar consideraciones de atribucion o uso no cubiertas por la licencia del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/swadeep/Qwen3.5-4b-opus-distilled
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento original: `angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k` (disponible en HuggingFace)
- Dataset de razonamiento de Opus: `Gryphe/Opus-4.6-Reasoning-24k` (disponible en HuggingFace)
- Repositorio de entrenamiento: mencionado en la model card como contenedor de `offtopic_fix_1k/` y `grpo_data/`, sin URL directa proporcionada
