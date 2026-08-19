# usermma/Qwen3.8-Queen-27B-mlx-8Bit

## Resumen

El modelo `usermma/Qwen3.8-Queen-27B-mlx-8Bit` es una conversión al formato MLX (Apple Silicon) del modelo base `aifeifei798/Qwen3.8-Queen-27B`, un fine-tune orientado a roleplay, escritura creativa y narración de historias. El repositorio original declara una licencia Apache 2.0 y un pipeline de `image-text-to-text`, aunque la model card no aporta detalles sobre capacidades multimodales. La conversión se realizó con `mlx-lm` versión 0.31.2, lo que permite su ejecución eficiente en hardware Apple con memoria unificada.

A pesar del nombre "27B", los pesos reales en safetensors suman 7.566.401.024 parámetros (aproximadamente 7,57 mil millones), lo que sugiere que se trata de un modelo de la familia Qwen de tamaño medio (posiblemente 8B) fine-tuneado para tareas conversacionales y creativas. El repositorio ocupa 28,6 GB, coherente con una cuantización de 8 bits. No se dispone de información pública sobre el proceso de entrenamiento, datos utilizados o rendimiento en benchmarks, por lo que esta ficha se limita a los datos verificables del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, basado en Qwen) |
| Parametros totales | 7.566.401.024 (~7,57 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 8-bit (cuantización por bloques) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo. El nombre sugiere una base Qwen, pero no se confirma la variante exacta (número de capas, heads, etc.). El modelo original `aifeifei798/Qwen3.8-Queen-27B` no dispone de model card pública con detalles de entrenamiento, dataset o técnica de alineación. La única información técnica disponible es que la conversión a MLX se realizó con `mlx-lm` 0.31.2, lo que implica que los pesos originales estaban en formato safetensors y se transformaron a una representación optimizada para Metal/Apple Silicon.

Dado el pipeline `image-text-to-text`, es posible que el modelo base tuviera capacidades multimodales, pero no hay evidencia en la documentación del repositorio de que esta conversión conserve o exponga dicha funcionalidad. Tampoco se especifica si se aplicó RLHF, DPO u otro método de alineación.

## Capacidades

- Generación de texto conversacional orientado a roleplay y narración de historias (según los tags del repositorio).
- Escritura creativa y storytelling, probablemente optimizado para seguir personajes y tramas.
- Compatible con tarjetas de personaje (character-card) y herramientas como SillyTavern, según los tags.
- Integración con el ecosistema MLX para ejecución local en Macs con Apple Silicon.
- No se confirman capacidades de tool calling, agentes o razonamiento multi-paso; no hay documentación al respecto.
- El pipeline `image-text-to-text` sugiere posible entrada de imágenes, pero no se proporcionan ejemplos ni garantías de funcionamiento en esta conversión.

## Casos de uso

- Roleplay conversacional: el modelo puede utilizarse en frontends como SillyTavern para interpretar personajes con personalidad y contexto definidos, gracias a su fine-tuning específico para esta tarea.
- Escritura creativa asistida: redacción de relatos, diálogos y escenas narrativas, donde el modelo genera continuaciones coherentes a partir de premisas dadas.
- Prototipado de chatbots con personalidad: desarrollo de asistentes conversacionales con estilos de habla particulares, aprovechando el entrenamiento en roleplay.
- Generación de contenido para juegos de rol: creación de descripciones de escenarios, NPCs y diálogos para campañas de mesa o videojuegos.
- Experimentación con MLX en Apple Silicon: sirve como ejemplo de conversión y ejecución de modelos de 8B en 8-bit para desarrolladores que quieran evaluar el rendimiento en hardware local.
- Fine-tuning adicional: al ser Apache 2.0, puede usarse como base para ajustes posteriores en tareas específicas de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo o su base. Tampoco se ofrecen comparativas con alternativas similares en la model card.

## Requisitos de hardware

- Memoria unificada estimada: con 7,57 B parámetros en 8-bit, el modelo requiere aproximadamente 7,6 GB de pesos, más overhead de activaciones y KV cache. Se recomienda un mínimo de 16 GB de RAM unificada en Apple Silicon para inferencia cómoda.
- GPUs compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No se puede ejecutar en GPUs NVIDIA o AMD sin conversión adicional a otros formatos.
- Opciones de despliegue: mediante `mlx-lm` (carga y generación en Python) o integración en aplicaciones que usen el ecosistema MLX. No es compatible directamente con vLLM, llama.cpp u Ollama sin convertir los pesos a GGUF o similar.
- Latencia y throughput: no disponibles. Dependerán del chip concreto (por ejemplo, M1 Max vs M3 Ultra) y de la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. El modelo compite en el espacio de roleplay/escritura creativa con otros fine-tunes como Mistral-7B-Instruct, Llama-3-8B-Instruct o Qwen2.5-7B-Instruct, pero no hay métricas que permitan una comparación objetiva. La principal diferencia es su formato MLX, que lo limita a hardware Apple, mientras que los otros están disponibles en múltiples formatos y plataformas.

## Limitaciones y advertencias

- No hay información verificable sobre el proceso de entrenamiento, por lo que se desconocen posibles sesgos o riesgos de alucinación.
- El nombre "27B" es engañoso: los parámetros reales son ~7,57 B, lo que puede llevar a expectativas incorrectas sobre capacidad y calidad.
- La funcionalidad multimodal declarada en el pipeline no está documentada; no se garantiza que la entrada de imágenes funcione en esta conversión.
- Al ser una conversión MLX, no es compatible con entornos de producción basados en CUDA o ROCm sin pasos adicionales de conversión.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base podría tener restricciones adicionales no documentadas; se recomienda verificar la licencia del modelo original.
- Sin benchmarks ni evaluaciones, no se puede asegurar la calidad del texto generado en comparación con alternativas establecidas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/usermma/Qwen3.8-Queen-27B-mlx-8Bit
- Modelo base: https://huggingface.co/aifeifei798/Qwen3.8-Queen-27B
- Documentación de mlx-lm: https://github.com/ml-explore/mlx-lm
