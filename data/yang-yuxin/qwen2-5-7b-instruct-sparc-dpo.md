# Yang-yuxin/Qwen2.5-7B-Instruct-SPARC-DPO

## Resumen

Qwen2.5-7B-Instruct-SPARC-DPO es un ajuste fino (fine-tune) del modelo Qwen2.5-7B-Instruct de Alibaba, publicado por el usuario Yang-yuxin en HuggingFace. El modelo parte de la arquitectura transformer densa de Qwen2.5 y ha sido entrenado con DPO (Direct Preference Optimization) sobre un conjunto de datos orientado a tareas de recuperación aumentada (RAG), según indican sus etiquetas `sparc-rag`, `rag` y `retrieval-augmented-generation`. El objetivo declarado es mejorar el comportamiento conversacional del modelo en escenarios donde se le proporciona contexto documental recuperado.

Se trata de un modelo de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones), con pesos en formato safetensors y un tamaño de repositorio de 15,2 GB, lo que corresponde a pesos en precisión de 16 bits. La licencia es Apache 2.0, heredada del modelo base. El acceso está restringido (gated) y requiere aceptar las condiciones en HuggingFace antes de la descarga.

La relevancia de este modelo es acotada: es un fine-tune comunitario con cero descargas y cero likes en el momento de redactar esta ficha, sin documentación técnica publicada (no hay model card visible con detalles de entrenamiento, datos o hiperparámetros). Debe evaluarse como un experimento de la comunidad, no como un modelo de referencia para producción sin validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos, ampliables a 131.072 con RoPE scaling, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | No disponible en el repositorio; al ser safetensors en fp16/bf16 es cuantizable a GGUF, AWQ, GPTQ mediante herramientas externas |
| Idiomas soportados | No disponibles (el modelo base Qwen2.5 soporta principalmente ingles y chino, con cobertura de otras lenguas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención de consultas agrupadas (GQA), activación SwiGLU, normalización RMSNorm y embeddings rotatorios (RoPE). El modelo base fue preentrenado por Alibaba con un corpus multilingüe de gran escala y posteriormente alineado mediante instrucciones y preferencias. Sobre esa base, este fine-tune aplica DPO, una técnica de alineación por preferencias que optimiza directamente el modelo frente a pares de respuestas (elegida/rechazada) sin necesidad de un modelo de recompensa separado, según indican las etiquetas del repositorio.

No se dispone de información publicada sobre el número de tokens de entrenamiento, la composición exacta del dataset de preferencias, los hiperparámetros de DPO (beta, learning rate, número de épocas) ni si se combinó con SFT previo. La etiqueta `sparc-rag` sugiere un dataset orientado a RAG (posiblemente derivado de SPARC, un benchmark de razonamiento complejo sobre esquemas de bases de datos, aunque esta asociación no está confirmada en la información disponible). No hay innovaciones técnicas documentadas más allá del propio ajuste por preferencias.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento sobre contexto recuperado (RAG): el ajuste DPO está orientado, según las etiquetas, a mejorar respuestas cuando se le suministra documentación externa.
- Generación de código y matemáticas a nivel del modelo base (no se confirma mejora específica en estas áreas).
- Soporte de tool calling / function calling: el modelo base Qwen2.5-7B-Instruct lo soporta; no se confirma que el fine-tune lo preserve intacto.
- Capacidades multilingües heredadas del modelo base, con predominio de inglés y chino.
- No se documenta modo thinking, visión ni audio.

## Casos de uso

- Asistentes de documentación interna: el modelo puede recibir fragmentos recuperados de una base de conocimiento y generar respuestas contextualizadas, aprovechando el ajuste DPO orientado a RAG para reducir respuestas ignorantes del contexto.
- Chatbots de atención al cliente sobre corpus propio: integrado en un pipeline de recuperación (por ejemplo, con un índice vectorial) para responder consultas frecuentes con citas al material recuperado.
- Generación de respuestas extractivas y abstractivas sobre informes: útil para resumir secciones de documentos largos pasados en el prompt, siempre que se valide la ventana de contexto efectiva.
- Prototipado rápido de sistemas RAG: al ser un fine-tune de 7B con licencia Apache 2.0, sirve para experimentar con variantes de prompting y recuperación en entornos de investigación.
- Evaluación comparativa de técnicas de alineación: útil como caso de estudio de DPO aplicado a dominios específicos frente al modelo base sin ajustar.
- Despliegue en entornos con recursos moderados: al caber en una GPU de 24 GB en cuantización de 8 bits o 4 bits, permite servir un asistente RAG en infraestructura de gama alta consumer.
- Filtrado y reformulación de consultas en pipelines de búsqueda: el modelo puede reescribir preguntas de usuario antes de la recuperación, aunque esta capacidad no está validada específicamente en este fine-tune.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 15,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-22 GB para contextos moderados.
- VRAM en cuantización de 8 bits: en torno a 8-9 GB de pesos; viable en GPUs de 16 GB.
- VRAM en cuantización de 4 bits (GGUF Q4_K_M o AWQ): aproximadamente 4,5-5,5 GB de pesos; viable en GPUs de 8-12 GB.
- GPUs recomendadas: A100 40/80 GB o H100 para servicio en fp16 con concurrencia; RTX 4090 (24 GB) para fp16 con contexto limitado o 8 bits con holgura; RTX 3090, RTX 4080, RTX 4070 Ti para cuantizaciones de 8 y 4 bits.
- Cabe en GPU consumer: sí, en RTX 4090/3090 en fp16 con contexto moderado, y en GPUs de 8-12 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers (nativo), vLLM, Text Generation Inference (TGI), llama.cpp y Ollama (tras conversión a GGUF), así como endpoints compatibles indicados en las etiquetas.
- Latencia y throughput: no disponibles; dependen del hardware y del backend. Como referencia orientativa del tamaño, un modelo de 7B en fp16 en una A100 suele superar los 1.000 tokens/s en prefill y decenas de tokens/s por petición en decode, pero no hay mediciones publicadas para este fine-tune concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Yang-yuxin/Qwen2.5-7B-Instruct-SPARC-DPO | 7,6 B | No disponible | Apache 2.0 | Gated, 0 descargas | Fine-tune DPO orientado a RAG, sin benchmarks |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 nativo (131.072 con RoPE scaling) | Apache 2.0 | Abierto, ampliamente usado | Modelo base; benchmarks publicados por Alibaba |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 | Apache 2.0 | Abierto | Alternativa europea de tamaño similar, sin ajuste específico para RAG |
| Llama-3.1-8B-Instruct | 8,0 B | 131.072 | Llama 3.1 Community License | Abierto con condiciones | Mayor contexto nativo, licencia con restricciones de uso |

La comparación directa de rendimiento con estos modelos no es posible sin benchmarks publicados del fine-tune.

## Limitaciones y advertencias

- No hay model card técnica ni benchmarks publicados: el comportamiento real del ajuste DPO frente al modelo base es desconocido y debe validarse empíricamente.
- Riesgo de degradación de capacidades generales tras el ajuste por preferencias: el DPO sobre un dataset específico puede reducir el rendimiento en tareas ajenas al dominio de entrenamiento (código, matemáticas, instrucciones generales).
- Riesgo de alucinación: como todo modelo generativo, puede inventar información; el ajuste orientado a RAG no garantiza fidelidad al contexto recuperado.
- Sesgos: no documentados; hereda los sesgos del corpus de preentrenamiento de Qwen2.5.
- Idiomas: no se especifican; se espera predominio de inglés y chino, con calidad inferior en castellano.
- Contexto: no se confirma la longitud efectiva soportada por este fine-tune; asumir la del modelo base sin verificación puede provocar degradación en prompts largos.
- Licencia Apache 2.0 permite uso comercial, pero el acceso está restringido (gated) y el autor no ofrece garantías; conviene revisar los términos del repositorio antes de desplegar.
- Cero descargas y cero likes: no hay evidencia de uso en producción ni validación por la comunidad.
- El nombre "SPARC" puede inducir a confusión con el benchmark SPARC de text-to-SQL; no hay confirmación de que el dataset de entrenamiento esté relacionado.

## Enlaces

- HuggingFace: https://huggingface.co/Yang-yuxin/Qwen2.5-7B-Instruct-SPARC-DPO
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio Qwen2.5 (GitHub): https://github.com/QwenLM/Qwen2.5
- Paper técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Paper de DPO (Rafailov et al.): https://arxiv.org/abs/2305.18290
