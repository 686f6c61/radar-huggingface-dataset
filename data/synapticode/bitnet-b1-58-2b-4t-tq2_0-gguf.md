# Synapticode/bitnet-b1.58-2B-4T-tq2_0-gguf

## Resumen

BitNet b1.58 2B4T es un modelo de lenguaje de 2.400 millones de parámetros desarrollado por Microsoft, diseñado con una arquitectura transformer de pesos ternarios (-1, 0, 1) entrenada mediante cuantización consciente (QAT). El nombre "2B4T" indica aproximadamente 2 mil millones de parámetros y 4 billones de tokens de entrenamiento (4×10¹²). Su principal innovación es que los pesos son nativamente ternarios, lo que permite una representación extremadamente compacta sin pérdida significativa de calidad.

Esta ficha describe la conversión a formato GGUF con cuantización TQ2_0 (2,0625 bits por peso) realizada por Synapticode, que reduce el modelo a 1,2 GB manteniendo una perplexity prácticamente idéntica al original en bf16 (diferencia relativa inferior al 0,2 %). El modelo es relevante porque demuestra que es posible ejecutar un LLM de calidad razonable en hardware modesto, incluso solo con CPU, gracias a su eficiencia extrema. La licencia MIT permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos ternarios (BitNet b1.58) |
| Parametros totales | 2.412.820.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TQ2_0 (2,0625 bpw) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo `bitnet-2b4t-tq2_0.gguf`, 1,2 GB) |

## Arquitectura y entrenamiento

El modelo base de Microsoft, BitNet b1.58 2B4T, emplea una arquitectura transformer estándar (atención por capas, feed-forward) pero con la particularidad de que todos los pesos están cuantizados a tres valores posibles: -1, 0 y 1. Esta ternarización se aplica durante el entrenamiento mediante QAT, de modo que el modelo aprende directamente con su alfabeto de pesos final, evitando la degradación típica de la cuantización post-entrenamiento. El entrenamiento se realizó con 4 billones de tokens, aunque no se han publicado detalles sobre la composición del dataset ni sobre técnicas de alineación como RLHF o DPO.

La conversión a TQ2_0 realizada por Synapticode es determinista: reproduce el archivo byte a byte a partir del modelo bf16 original. TQ2_0 es un formato de cuantización específico para pesos ternarios, que almacena cada peso en 2,0625 bits de media, aprovechando la estructura nativa del modelo. La conversión se realizó sobre una bifurcación de llama.cpp con dos parches menores, y el resultado mantiene una calidad casi idéntica al original en bf16, como muestran las mediciones de perplexity.

## Capacidades

- Generación de texto y respuesta a instrucciones: el modelo está ajustado para seguir instrucciones (instruction-tuned), como indica la model card.
- Razonamiento básico y comprensión del lenguaje: adecuado para tareas de texto general, aunque limitado por su tamaño.
- Multilingüismo: no se especifican idiomas soportados; se asume que el entrenamiento con 4 billones de tokens podría incluir múltiples lenguas, pero no hay confirmación.
- Sin soporte de tool calling, function calling, agentes ni razonamiento multi-paso explícito.
- Sin capacidades multimodales (visión, audio, etc.).
- Eficiencia extrema: 2,06 bits por peso, lo que permite ejecución en CPU con bajo consumo de memoria.

## Casos de uso

- Chatbots ligeros en CPU: con un throughput de 89-112 tokens/s en generación en un Mac mini M4 Pro, puede servir como asistente conversacional en entornos sin GPU, como servidores de bajo coste o dispositivos edge.
- Generación de texto en entornos con restricciones de memoria: al ocupar solo 1,2 GB, cabe en sistemas embebidos, Raspberry Pi de gama alta o contenedores con límites estrictos de RAM.
- Prototipado rápido de aplicaciones de NLP: su tamaño reducido permite iterar rápidamente en entornos de desarrollo sin necesidad de hardware especializado.
- Investigación sobre modelos ternarios: sirve como referencia para estudiar el rendimiento de arquitecturas de pesos ternarios en tareas de lenguaje, gracias a su licencia MIT y a la disponibilidad del código de conversión.
- Inferencia en tiempo real en CPU: con 237-279 tokens/s en prompt eval, es viable para aplicaciones interactivas como autocompletado o asistentes de escritura en máquinas sin GPU.
- Educación y demostraciones: su facilidad de ejecución en hardware común lo hace útil para enseñar conceptos de cuantización y eficiencia de modelos en cursos de machine learning.

## Benchmarks y rendimiento

La model card solo proporciona mediciones de perplexity en WikiText-2 (test set) y throughput, comparando el modelo TQ2_0 con la referencia bf16. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

| Metrica | bf16 referencia | TQ2_0 (este archivo) | Diferencia relativa |
|---|---|---|---|
| Perplexity (n_ctx=512) | 82,09 ± 0,76 | 82,21 ± 0,77 | +0,15 % |
| Perplexity (n_ctx=2048) | 77,16 ± 0,71 | 77,31 ± 0,71 | +0,19 % |

| Metrica de rendimiento | Valor |
|---|---|
| Prompt eval (CPU, Mac mini M4 Pro) | 237-279 tok/s |
| Generacion (CPU, Mac mini M4 Pro) | 89-112 tok/s |

Nota: los valores absolutos de perplexity son altos porque el modelo está ajustado para instrucciones y se evalúa sobre texto sin procesar; solo son comparables dentro de esta metodología.

## Requisitos de hardware

- VRAM: no requiere GPU; el archivo pesa 1,2 GB, por lo que cabe en cualquier GPU consumer (por ejemplo, RTX 3060 con 8 GB) si se usara con soporte CUDA, pero TQ2_0 no tiene ruta Metal ni CUDA implementada en la versión actual.
- GPU recomendadas: ninguna específica; el modelo está pensado para CPU. En Mac mini M4 Pro (CPU-only) se obtienen 89-112 tok/s de generación.
- Compatibilidad con consumer GPU: no aplica, ya que la cuantización TQ2_0 solo tiene implementación para CPU en llama.cpp.
- Opciones de despliegue: llama.cpp (mainline) mediante `llama-cli` o `llama-server`. No es compatible con vLLM, TGI, Ollama ni otras herramientas que no soporten este formato ternario.
- Latencia y throughput: los medidos en Mac mini M4 Pro son 237-279 tok/s para prompt eval y 89-112 tok/s para generación, en CPU puro.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de tamaño similar (por ejemplo, Qwen2.5-1.5B, Gemma-2-2B, Phi-2) en la información proporcionada. La única comparación posible es con el modelo original en bf16, que muestra una degradación mínima en perplexity. En términos de eficiencia, BitNet b1.58 2B4T TQ2_0 es significativamente más compacto (1,2 GB frente a ~4,8 GB en bf16) y puede ejecutarse en CPU, mientras que la mayoría de modelos de 2B requieren GPU o cuantizaciones más agresivas. Sin embargo, no hay datos objetivos de calidad frente a esos modelos.

## Limitaciones y advertencias

- Tamaño reducido: con 2,4 mil millones de parámetros, el modelo tiene capacidades limitadas en razonamiento complejo, matemáticas avanzadas y generación de código extenso.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en temas especializados.
- Sesgos: no se han documentado sesgos específicos, pero al ser un modelo entrenado con datos web, es probable que herede sesgos sociales y culturales.
- Contexto: no se ha especificado la longitud máxima de contexto; se desconoce si soporta ventanas largas.
- Idiomas: no se ha confirmado qué idiomas domina; el uso en español u otros idiomas distintos del inglés puede degradar la calidad.
- Compatibilidad: el formato TQ2_0 solo funciona con la bifurcación de llama.cpp de Synapticode (o mainline con los parches aplicados). No es compatible con otras herramientas de inferencia estándar.
- Sin ruta GPU: la cuantización TQ2_0 no tiene implementación para Metal o CUDA, por lo que la inferencia se limita a CPU.
- Licencia: MIT, permite uso comercial sin restricciones, pero el modelo base es de Microsoft y la conversión de Synapticode; se debe mantener la atribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Synapticode/bitnet-b1.58-2B-4T-tq2_0-gguf
- Modelo base de Microsoft: https://huggingface.co/microsoft/bitnet-b1.58-2B-4T-bf16
- Repositorio de conversión (llama.cpp con parches): https://github.com/synapticode-ai/llama.cpp
- Documentación de la conversión TQ2_0: https://github.com/synapticode-ai/llama.cpp/blob/publish/v0.1.0-prep/docs/tq2_0-anatomy.md
