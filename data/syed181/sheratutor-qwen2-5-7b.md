# syed181/sheratutor-qwen2.5-7b

## Resumen

Sheratutor qwen2.5-7b es un ajuste fino (fine-tune) del modelo Qwen2.5-7B-Instruct en su versión cuantizada a 4 bits de Unsloth, publicado por el usuario syed181 en HuggingFace. Se trata de un modelo denso de tipo decoder-only, con 7.615.616.512 parámetros (unos 7,62 mil millones) y un repositorio de 15,2 GB en formato safetensors, lo que sugiere pesos almacenados en precisión de 16 bits. La model card no aporta detalles sobre el conjunto de datos de entrenamiento ni sobre la tarea concreta para la que fue ajustado; el único dato técnico relevante es que el entrenamiento se realizó con Unsloth y la librería TRL de HuggingFace, con una aceleración declarada de 2x respecto a un entrenamiento convencional.

El modelo hereda las capacidades del Qwen2.5-7B-Instruct original: arquitectura transformer densa, decodificación autorregresiva, codificación posicional rotatoria (RoPE) y atención por trozos dual (Dual Chunk Attention) para sostener contextos largos. Según la documentación pública de Qwen2.5, la familia se preentrenó sobre hasta 18 billones de tokens y cubre más de 29 idiomas, aunque la model card de este fine-tune declara únicamente inglés como idioma soportado.

Su relevancia actual es limitada y hay que interpretarla con cautela: el repositorio registra 0 descargas y 0 "likes", no incluye información sobre el dataset de ajuste ni resultados de evaluación, y no hay evidencia publicada de que el fine-tune mejore al modelo base en ninguna tarea concreta. Por tanto, debe considerarse un experimento de ajuste sin validación pública más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Qwen2.5), con RoPE y Dual Chunk Attention |
| Parametros totales | 7.615.616.512 (7,62 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens según la documentación de Qwen2.5-7B; un resultado de búsqueda menciona hasta 1M tokens en la variante instruct (no confirmado para este fine-tune) |
| Tipos de cuantizacion | No disponible en el repositorio; el modelo base empleado estaba cuantizado a 4 bits con bitsandbytes (bnb-4bit). Los pesos subidos ocupan 15,2 GB, compatibles con fp16/bf16 |
| Idiomas soportados | Inglés (declarado en la model card). El modelo base Qwen2.5 cubre más de 29 idiomas, pero este fine-tune no los declara |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B: un transformer denso decoder-only con normalización RMSNorm, codificación posicional rotatoria (RoPE) y mecanismos de atención optimizados para contextos extensos, en particular Dual Chunk Attention, orientada a mantener un rendimiento estable con secuencias muy largas. El preentrenamiento de la familia Qwen2.5 se realizó sobre un corpus de hasta 18 billones de tokens, y las variantes instruct incorporan ajuste supervisado y optimización por preferencias (RLHF/DPO) según la documentación de Qwen.

Sobre el proceso de ajuste específico de este modelo no hay información publicada: la model card no indica el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de alineación adicionales ni la tarea objetivo (el nombre "sheratutor" sugiere un uso educativo o de tutoría, pero esto no se confirma en la documentación). Lo único verificable es que el entrenamiento se ejecutó con Unsloth y TRL partiendo de unos pesos base ya cuantizados a 4 bits, lo que implica un ajuste eficiente en memoria (QLoRA u equivalente). No se documenta ninguna innovación técnica propia del fine-tune.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen2.5-7B-Instruct.
- Razonamiento de propósito general, matemáticas y generación de código, capacidades documentadas para el modelo base Qwen2.5-7B.
- Comprensión multilingüe potencial procedente del modelo base (más de 29 idiomas), aunque no declarada ni verificada en este fine-tune.
- Manejo de contextos largos de hasta 128.000 tokens según la documentación del modelo base.
- Soporte de conversaciones multi-turno en formato chat de Qwen.
- Capacidades de tool calling y función de agente: no confirmadas en la información disponible para este fine-tune.
- Capacidades de visión, audio o modo "thinking" explícito: no disponibles.
- El ajuste específico realizado por el autor no tiene capacidades documentadas ni evaluadas públicamente.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede mantener diálogos multi-turno y, al heredar la ventana de 128.000 tokens del Qwen2.5-7B base, gestionar conversaciones con historiales extensos, siempre que se valide su calidad frente al modelo original.
- Experimentación académica con fine-tuning: sirve como ejemplo reproducible de un ajuste con Unsloth y TRL sobre un modelo cuantizado a 4 bits, útil para reproducir el flujo de trabajo en entornos con una sola GPU.
- Evaluación comparativa de ajustes ligeros: dado que no hay benchmarks publicados, puede utilizarse como caso de estudio para medir cuánto aporta (o degrada) un fine-tune sin dataset documentado respecto al Qwen2.5-7B-Instruct original.
- Generación de texto en inglés con contexto largo: tareas de resumen o extracción sobre documentos extensos (informes, transcripciones, artículos), aprovechando la ventana de contexto heredada.
- Tutoría o asistencia educativa experimental: el nombre del modelo sugiere ese propósito, pero no hay evidencia de que haya sido entrenado o evaluado para ello, por lo que solo es adecuado en fase exploratoria.
- Despliegue local en hardware de consumo para pruebas: con 15,2 GB de pesos en fp16, puede ejecutarse en una GPU de 24 GB o, tras convertir a GGUF, en equipos con menos VRAM.
- No se recomienda su uso en producción sin una evaluación previa, dado que no hay métricas de calidad ni documentación del dataset de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye ninguna tabla de evaluación (MMLU, HumanEval, GSM8K ni similares), y el repositorio no aporta métricas comparativas frente al modelo base Qwen2.5-7B-Instruct del que deriva.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 15-16 GB para los pesos, más memoria adicional para el contexto y el caché KV (el consumo crece con la longitud de secuencia).
- VRAM estimada en cuantización de 8 bits: alrededor de 8 GB.
- VRAM estimada en cuantización de 4 bits (GGUF Q4_K_M): aproximadamente 4,5-5,5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para despliegues con contexto largo y concurrencia.
- Cabe en GPU de consumo: sí. Una RTX 4090 o RTX 3090 (24 GB) ejecuta los pesos en bf16; una RTX 4080 (16 GB), RTX 4060 Ti (16 GB) o RTX 3080 (10-12 GB) requieren cuantización a 8 o 4 bits.
- Opciones de despliegue: transformers (formato nativo safetensors), text-generation-inference, vLLM, y llama.cpp u Ollama previa conversión a GGUF (no se incluye GGUF en el repositorio).
- Latencia y throughput: no disponibles. No hay datos publicados de tokens por segundo ni de latencia para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sheratutor-qwen2.5-7b (syed181) | 7,62B | 128K (heredado) | Apache 2.0 | HuggingFace, 0 descargas | Fine-tune sin dataset ni benchmarks documentados |
| Qwen2.5-7B-Instruct (Qwen) | 7,62B | 128K | Apache 2.0 | HuggingFace, ampliamente usado | Modelo base, con documentación y evaluación completas |
| Mistral-7B-Instruct | 7,24B | 32K | Apache 2.0 | HuggingFace | Alternativa densa de tamaño similar; contexto menor |
| Llama-3.1-8B-Instruct | 8,03B | 128K | Licencia comunitaria de Meta (no Apache) | HuggingFace | Contexto comparable, licencia con restricciones adicionales |

Los datos de parámetros y contexto de los modelos comparables provienen de su documentación pública; no se dispone de comparaciones de rendimiento medidas entre este fine-tune y las alternativas.

## Limitaciones y advertencias

- No hay información sobre el dataset de ajuste, por lo que se desconoce qué sesgos específicos puede haber introducido el fine-tune.
- Riesgo de alucinación inherente a los modelos de 7B, no evaluado ni cuantificado en este caso.
- La model card declara únicamente inglés; el uso en otros idiomas no está respaldado por la documentación, aunque el modelo base sea multilingüe.
- No se documenta el comportamiento del modelo con contextos cercanos a los 128.000 tokens; el rendimiento podría degradarse sin que existan pruebas publicadas.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5-7B-Instruct conviene verificar que se cumplen las condiciones de la licencia original de Qwen.
- No hay evaluación de seguridad, sesgos ni alineación publicada para este fine-tune.
- El repositorio tiene 0 descargas y 0 "likes", sin historial de uso ni validación por parte de la comunidad, lo que aumenta el riesgo de comportamientos inesperados.
- No se incluyen pesos cuantizados a GGUF, de modo que el despliegue en llama.cpp u Ollama requiere una conversión previa.
- Los pesos se subieron en precisión de 16 bits, lo que implica 15,2 GB de almacenamiento y descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/syed181/sheratutor-qwen2.5-7b
- Modelo base del ajuste (Unsloth): https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Qwen2.5-7B (modelo base original): https://huggingface.co/Qwen/Qwen2.5-7B
- Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de Qwen2.5 en GitHub: https://github.com/mx4ai/qwen2.5
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- Ficha técnica de Qwen2.5-7B en Emergent Mind: https://www.emergentmind.com/topics/qwen2-5-7b-model
- Ficha de Qwen 2.5 7B en Open Laboratory: https://openlaboratory.com/models/qwen-2_5-7b/
