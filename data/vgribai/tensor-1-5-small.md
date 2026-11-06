# VGribAI/Tensor-1.5-small

## Resumen

Tensor 1.5-small es un modelo de lenguaje conversacional de 50,26 millones de parámetros desarrollado desde cero por VGribAI (GribAI), una startup en fase temprana que construye la familia de modelos Tensor. Se trata de un decoder transformer de estilo Qwen2 con 12 capas, dimensión oculta de 640 y atención GQA (8 cabezas de consulta, 2 de clave/valor), entrenado exclusivamente en inglés y afinado con supervisión para funcionar como asistente conversacional completo en lugar de un checkpoint base.

El modelo abre una nueva convención de nomenclatura en la que la versión identifica al modelo y no el recuento de parámetros. Su propuesta es ofrecer respuestas cortas, resúmenes rápidos, reescrituras simples y conversación ligera en hardware muy modesto: CPUs, portátiles antiguos, placas de un solo board y teléfonos. Con 512 tokens de contexto y 64 tokens por respuesta por defecto, está pensado para interacciones breves, no para razonamiento extenso ni recuperación factual fiable.

Es relevante ahora por su enfoque de destilación de capacidades de modelos grandes en huellas mínimas, un nicho útil para despliegue en el borde y para experimentación educativa. Su licencia "other" y la ausencia de benchmarks publicados limitan de momento su adopción en producción sin una evaluación propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer estilo Qwen2 (12 capas, hidden 640, GQA 8 query / 2 KV heads, SwiGLU) |
| Parametros totales | 50.264.960 (50,26 M), embeddings atados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | fp32 (safetensors) y f16 (GGUF); no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés únicamente |
| Licencia | other |
| Formato de pesos | safetensors (fp32) y GGUF (f16) |

## Arquitectura y entrenamiento

Tensor 1.5-small es un transformer decoder de 12 capas con dimensión oculta de 640, atención con grouped-query attention (8 cabezas de consulta y 2 de clave/valor) y activación SwiGLU, siguiendo el diseño de Qwen2. Emplea embeddings atados y un vocabulario propio de 4000 tokens byte-level BPE entrenado específicamente para este modelo, lo que mantiene reducido el tamaño total (50,26 M de parámetros, repositorio de 0,1 GB).

El modelo se ha construido desde cero ("from-scratch") por VGribAI, con preentrenamiento y fine-tuning supervisado exclusivamente en inglés. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; tampoco se documentan innovaciones como decodificación especulativa o atención lineal. La información disponible confirma únicamente que se trata de un asistente afinado que respeta el formato de chat, mantiene el rol de asistente y detiene la generación en su propio turno.

## Capacidades

- Generación de texto conversacional breve en inglés, con formato de chat (`<|im_start|>` / `<|im_end|>`).
- Respuestas cortas y resúmenes rápidos de fragmentos textuales.
- Reescrituras simples y conversación ligera ("chit-chat").
- Detención autónoma del turno mediante los tokens de parada `<|im_end|>` (id 2) y `<|eos|>` (id 0).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada al inglés; no se espera que siga instrucciones en otros idiomas.
- Sin memoria más allá de la ventana de contexto actual.

## Casos de uso

- Asistente conversacional en dispositivos de borde: al ocupar 0,1 GB en fp32 y disponer de build GGUF f16, puede ejecutarse en CPUs, placas de un solo board y teléfonos para diálogos breves de baja latencia.
- Resumen rápido de textos cortos: adecuado para condensar párrafos o mensajes en entornos con recursos limitados, dado su límite de 512 tokens de contexto.
- Reescritura ligera de frases: útil en correctores o asistentes de redacción que necesiten parafrasear oraciones simples en inglés.
- Chat de acompañamiento o demo educativa: su formato de chat completo y su tamaño mínimo lo hacen idóneo para enseñar cómo funciona un asistente afinado y para prototipos de interfaz conversacional.
- Pruebas de integración con transformers y llama.cpp: sirve como banco de pruebas para pipelines de inferencia en hardware débil antes de escalar a modelos mayores.
- Filtrado o clasificación conversacional simple: puede generar respuestas plantilla o reformulaciones controladas en flujos de atención al cliente de baja complejidad, siempre con revisión humana por su falta de fiabilidad factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (50,26 M de parámetros, ~0,2 GB de pesos) y aproximadamente la mitad en f16 GGUF.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer moderna (por ejemplo, RTX 4090) lo aloja con holgura, pero no es necesario.
- Cabe en cualquier GPU consumer, incluidos portátiles antiguos, placas de un solo board y teléfonos.
- Opciones de despliegue: transformers (safetensors), llama.cpp/Ollama mediante el build GGUF f16; no se documenta soporte para vLLM ni TGI.
- Latencia y throughput: no disponibles; la model card solo indica que está pensado para hardware débil, con 64 tokens por respuesta por defecto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Tensor 1.5-small | 50,26 M | 512 | Inglés | other | safetensors, GGUF |
| Qwen2 (variantes pequeñas) | Desde ~0,5 B | 32 768 (típico en la familia) | Multilingüe | Apache 2.0 (según variante) | safetensors, GGUF |
| SmolLM2-135M | 135 M | 8192 | Inglés y otros | Apache 2.0 | safetensors, GGUF |
| TinyLlama-1.1B | 1,1 B | 2048 | Inglés | Apache 2.0 | safetensors, GGUF |

Los datos de los modelos comparables provienen de conocimiento general y no de la información proporcionada; conviene verificarlos en sus respectivas model cards. Tensor 1.5-small es sustancialmente menor y con contexto más corto que estas alternativas, lo que reduce su utilidad para tareas que requieran conocimiento factual o razonamiento, pero facilita su despliegue en hardware extremadamente limitado.

## Limitaciones y advertencias

- Solo inglés: no se espera que siga instrucciones en otros idiomas.
- Contexto de 512 tokens y 64 tokens por respuesta, insuficientes para documentos largos o conversaciones extensas.
- Modelo muy pequeño: fraseo fluido pero sin conocimiento factual fiable, aritmética ni razonamiento largo; las respuestas deben tratarse como texto, no como hechos.
- Sin memoria más allá de la ventana de contexto actual.
- Riesgo elevado de alucinación en preguntas factuales.
- Licencia "other": es necesario revisar los términos exactos antes de cualquier uso comercial, ya que no se especifican en la información disponible.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Sesgos no documentados; al entrenarse solo en inglés, puede reflejar sesgos del corpus de preentrenamiento.
- Advertencia para producción: no recomendado para tareas críticas sin evaluación propia y supervisión humana.

## Enlaces

- Hugging Face: https://huggingface.co/VGribAI/Tensor-1.5-small
- Listado de modelos de VGribAI: https://huggingface.co/VGribAI/models
- Sitio de GribAI (Tensor): https://gribai.github.io/tensor-grib/
