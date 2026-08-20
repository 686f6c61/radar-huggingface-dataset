# zaakirio/Ornith-1.5-9B-Uncensored-GGUF

## Resumen

Ornith-1.5-9B-Uncensored-GGUF es una versión cuantizada y "abliterada" del modelo base ornith-ai/Ornith-1.5-9B, desarrollada por el usuario zaakirio. El proceso de abliteration elimina las direcciones de rechazo (refusal directions) del modelo mediante la herramienta Heretic, que realiza una búsqueda TPE sobre las intensidades de ablación por capa, co-optimizando la tasa de rechazo frente a la divergencia KL respecto al modelo original. No implica fine-tuning ni reentrenamiento, por lo que las capacidades del modelo base se preservan salvo un desplazamiento distribucional medido muy bajo (KL 0.0017).

El modelo base es un híbrido Qwen3.5 de 9B parámetros con 32 capas que intercalan bloques de atención lineal gated DeltaNet con atención completa cada 4ª capa, y una ventana de contexto de 262 000 tokens. Esta versión GGUF está preparada para ejecutarse con llama.cpp y cubre únicamente el modelo de texto (sin proyector de visión, aunque el base es multimodal). La licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha radica en que ofrece una alternativa "sin censura" para desarrolladores que necesitan un modelo de 9B con contexto muy largo y comportamiento más permisivo en dominios sensibles, manteniendo la calidad del base gracias a la baja divergencia KL. Sin embargo, hay que tener en cuenta que la reducción de rechazos es modesta (de 85/100 a 55/100 en prompts dañinos) y que la arquitectura híbrida se muestra comparativamente resistente a la ablación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Qwen3.5: 32 capas con bloques de atención lineal gated DeltaNet intercalados con atención completa cada 4ª capa |
| Parametros totales | 8 953 803 264 (aprox. 9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262 000 tokens |
| Tipos de cuantizacion | BF16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible (el base es multilingüe, pero no se especifican idiomas concretos) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B emplea una arquitectura híbrida Qwen3.5 que combina atención lineal gated DeltaNet con atención completa en capas intercaladas (cada 4ª capa). Esta mezcla busca un equilibrio entre eficiencia computacional y capacidad de modelado de dependencias largas, lo que explica su ventana de contexto de 262 000 tokens. El proceso de abliteration se realizó con Heretic, que ejecuta una búsqueda TPE sobre las intensidades de ablación en las proyecciones de salida de atención y las proyecciones down de MLP, co-optimizando la tasa de rechazo frente a la divergencia KL. No hubo fine-tuning ni reentrenamiento; los pesos se fusionaron en bf16 y luego se cuantizaron a GGUF. Los datos de entrenamiento del modelo base no se detallan en la información proporcionada.

## Capacidades

- Generación de texto y chat conversacional con plantilla de chat integrada en el GGUF.
- Razonamiento multi-turno y manejo de contexto largo gracias a los 262 000 tokens de ventana.
- Soporte de tool calling y function calling (heredado del base, aunque no se detalla en la documentación).
- Capacidades multilingües (el base es multilingüe, aunque no se especifican idiomas).
- Comportamiento "uncensored": menor tasa de rechazo en prompts dañinos o sensibles (85/100 → 55/100 en el conjunto de prueba `mlabonne/harmful_behaviors`).
- No incluye capacidades de visión en esta versión GGUF (el base es multimodal, pero falta el proyector mmproj).

## Casos de uso

- Asistentes de chat sin restricciones temáticas: el modelo puede mantener conversaciones sobre temas controvertidos o sensibles sin rechazos automáticos, útil para investigación en IA alineada o para entornos donde se requiere explorar contenido delicado.
- Generación de contenido creativo con contexto largo: su ventana de 262 000 tokens permite procesar novelas completas, guiones o documentación extensa para generar continuaciones coherentes.
- Análisis y resumen de documentos largos: puede procesar informes, contratos o artículos científicos de gran extensión y extraer conclusiones sin perder el hilo.
- Desarrollo de agentes conversacionales con tool calling: al soportar function calling, puede integrarse en pipelines que requieran interacción con APIs o bases de datos, manteniendo el contexto de la conversación.
- Experimentación en alineación y seguridad: investigadores pueden estudiar el efecto de la abliteration en el comportamiento del modelo, comparando respuestas con el base original.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_M (5.63 GB) o Q5_K_M (6.47 GB) permiten ejecutar el modelo en GPUs de consumo como RTX 3060 o RTX 4060 con 8-12 GB de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos medidos son:

| Metrica | Valor |
|---|---|
| Refusals en 100 prompts dañinos (test split de `mlabonne/harmful_behaviors`) | 85/100 → 55/100 |
| Divergencia KL en prompts inofensivos | 0.0017 |

Estos datos se refieren al build bf16 y no a las versiones cuantizadas, que pueden presentar ligeras variaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~3.83 GB (cabe en GPUs con 4 GB, p.ej. GTX 1650)
  - Q4_K_M: ~5.63 GB (recomendado para GPUs de 8 GB, p.ej. RTX 3060, RTX 4060)
  - Q8_0: ~9.53 GB (requiere GPU de 12 GB o más, p.ej. RTX 4070 Ti, RTX 3080)
  - BF16: ~17.92 GB (requiere GPU de 24 GB, p.ej. RTX 3090, A100)
- GPU recomendadas: NVIDIA A40 (usada para la búsqueda de ablación), A100, RTX 4090, RTX 3090, o GPUs de consumo con al menos 8 GB de VRAM para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), compatible con Ollama y otros frontends que usen llama.cpp como backend.
- Latencia y throughput: no disponibles en la documentación; dependen del hardware y la cuantización. En una GPU moderna, un modelo de 9B en Q4_K_M suele generar entre 20 y 50 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B (base) | 9B | 262k | MIT | safetensors | Modelo original sin abliteration, multimodal |
| Ornith-1.5-9B-Uncensored (bf16) | 9B | 262k | MIT | safetensors | Versión abliterada en bf16, sin cuantizar |
| Ornith-1.5-9B-Uncensored-GGUF (este) | 9B | 262k | MIT | GGUF | Cuantizaciones para llama.cpp, solo texto |

No se dispone de comparativas con otros modelos de la misma categoría (p.ej. Llama 3.1 8B, Mistral 7B) en la información proporcionada.

## Limitaciones y advertencias

- El proceso de abliteration reduce los rechazos pero no los elimina por completo; la tasa medida es 55/100 en prompts dañinos, y el propio autor advierte que la métrica puede sobreestimar la tasa real de rechazo.
- La abliteration puede hacer que el modelo sea más complaciente con premisas incorrectas, aumentando el riesgo de alucinaciones o respuestas factualmente erróneas.
- La arquitectura híbrida se muestra resistente a la ablación, por lo que el efecto "uncensored" es más modesto que en modelos densos.
- Esta versión GGUF no incluye el proyector de visión, por lo que no se pueden procesar imágenes a pesar de que el base es multimodal.
- Se requiere una versión muy reciente de llama.cpp; las versiones antiguas fallan con `unknown architecture 'qwen3_5'`.
- El modelo tiene menos salvaguardas de seguridad; el uso indebido es responsabilidad del usuario.
- No se han publicado benchmarks de rendimiento estándar, por lo que no se puede evaluar su calidad en tareas como razonamiento, código o matemáticas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zaakirio/Ornith-1.5-9B-Uncensored-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Build bf16 fusionado: https://huggingface.co/zaakirio/Ornith-1.5-9B-Uncensored
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
