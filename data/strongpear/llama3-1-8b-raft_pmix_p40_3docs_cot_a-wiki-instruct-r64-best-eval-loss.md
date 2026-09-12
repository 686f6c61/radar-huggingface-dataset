# strongpear/Llama3.1-8B-RAFT_PMIX_P40_3DOCS_CoT_A-WIKI-Instruct-r64-best-eval-loss

## Resumen

Este repositorio contiene un adaptador LoRA (biblioteca PEFT) entrenado sobre el modelo base `meta-llama/Llama-3.1-8B`, publicado por el usuario `strongpear`. No se trata de un modelo completo, sino de pesos incrementales de aproximadamente 0,7 GB que deben cargarse junto al modelo base para poder ejecutarse. El identificador del repositorio sugiere una receta de ajuste fino del tipo RAFT (Retrieval-Augmented Fine-Tuning, ajuste fino aumentado con recuperación) con tres documentos de contexto, cadena de pensamiento (CoT), datos de tipo wiki, formato instruct y rango LoRA 64, aunque el autor no confirma ninguno de estos extremos en la documentación.

La relevancia de este tipo de artefactos es doble. Por un lado, ejemplifica el flujo de trabajo habitual de la comunidad open source: especializar un modelo de 8.000 millones de parámetros mediante LoRA permite distribuir la adaptación en menos de un gigabyte en lugar de los ~16 GB del modelo completo en bf16. Por otro, su estado de documentación lo convierte en un caso representativo de la necesidad de evaluar empíricamente los adaptadores antes de usarlos en producción: la model card es la plantilla por defecto de HuggingFace sin rellenar.

El adaptador cuenta con 0 descargas y 0 «likes» en el momento de redactar esta ficha, no declara licencia ni idiomas, y no aporta resultados de evaluación. Cualquier decisión de uso debería apoyarse en una validación propia sobre el dominio objetivo, no en la información publicada por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; modelo base Llama 3.1 8B |
| Parámetros totales | Modelo base: 8.030 millones. Adaptador: ~180 millones estimados a partir de r=64 y del tamaño del repositorio (0,7 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Rango LoRA | 64 (deducido del sufijo `r64` del identificador) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.1 8B) |
| Tipos de cuantización | El adaptador se publica en safetensors sin cuantizar; el modelo base admite fp16/bf16, int8 y cuantizaciones de 4 bits (GGUF, AWQ, GPTQ) a través del ecosistema |
| Idiomas soportados | No disponible para el adaptador. El modelo base declara 8 idiomas oficiales: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | No disponible para el adaptador. El modelo base se distribuye bajo la Llama 3.1 Community License |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |
| Librería | peft (versión de framework declarada: PEFT 0.20.0) |
| Etiquetas | peft, safetensors, lora, transformers, text-generation, base_model:adapter:meta-llama/Llama-3.1-8B, region:us |
| Tamaño del repositorio | 0,7 GB |
| Fecha de publicación | 2026-09-11 según los metadatos de HuggingFace (fecha anómala, posterior a la fecha habitual de consulta) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `meta-llama/Llama-3.1-8B`: un transformer decoder-only de 8.030 millones de parámetros, 32 capas, dimensión de modelo de 4.096, atención con 32 cabezas de consulta y 8 cabezas de clave/valor (GQA), RoPE, activación SwiGLU y vocabulario de 128.256 tokens. Según la documentación de Meta, el modelo base se entrenó con aproximadamente 15 billones de tokens y pasó por fases de ajuste supervisado y optimización de preferencias. Sobre esa base se ha aplicado un adaptador LoRA que no modifica los pesos originales: la inferencia requiere cargar el modelo base y superponer las matrices de bajo rango del adaptador, o bien fusionarlas previamente.

El nombre del repositorio codifica la receta de entrenamiento, pero el autor no la documenta: `RAFT` apunta a ajuste fino aumentado con recuperación, `3DOCS` a la inclusión de tres documentos en el contexto de entrenamiento, `CoT` a la presencia de cadenas de pensamiento en los datos, `A-WIKI` a un corpus de tipo Wikipedia y `Instruct` al formato de instrucciones. Se desconoce el número de ejemplos, la composición exacta del dataset, el valor de `alpha` y `dropout` del LoRA, la tasa de aprendizaje, el número de épocas y si hubo fases de RLHF o DPO adicionales. El sufijo `best-eval-loss` indica que el checkpoint corresponde a la mejor pérdida de validación registrada durante el entrenamiento, no necesariamente al mejor rendimiento en tareas generativas.

## Capacidades

- Generación de texto en formato instruct, condicionada por el ajuste del adaptador sobre Llama 3.1 8B Instruct.
- Razonamiento con cadena de pensamiento, presumiblemente inducido por los datos de entrenamiento con CoT, aunque sin verificación publicada.
- Respuesta sobre documentos proporcionados en el contexto, si el adaptador materializa la receta RAFT que sugiere su nombre.
- Herencia de las capacidades del modelo base: código, matemáticas básicas, resumen y reescritura de texto.
- Soporte multilingüe limitado a los 8 idiomas oficiales heredados del modelo base; el adaptador podría haber degradado idiomas distintos del inglés si se entrenó solo con datos en inglés.
- Soporte de tool calling y function calling: no confirmado para el adaptador; el modelo base Llama 3.1 8B Instruct sí lo soporta de serie.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades de visión o audio: no disponibles (el modelo base es exclusivamente de texto).

## Casos de uso

- Respuesta sobre documentación técnica interna: cargando el adaptador junto al modelo base y pasando tres o más fragmentos recuperados de un índice vectorial, puede emplearse como generador final en un pipeline RAG. La ventana de 128.000 tokens del modelo base permite incluir contexto amplio sin truncar.
- Asistente de consulta sobre artículos enciclopédicos: si el adaptador se entrenó con corpus tipo Wikipedia, encaja en escenarios de preguntas y respuestas sobre material enciclopédico o bases de conocimiento estructuradas.
- Generación de respuestas con trazabilidad de razonamiento: el modo CoT permite exponer pasos intermedios en aplicaciones de soporte técnico donde el usuario necesita verificar la lógica seguida.
- Prototipado e investigación en ajuste fino eficiente: sirve como punto de partida reproducible para estudiar el efecto del rango LoRA y del número de documentos de contexto sobre la calidad final.
- Extracción de información de contratos o informes legales: con tres documentos de referencia en contexto, el modelo puede responder preguntas concretas sobre cláusulas, siempre con revisión humana posterior.
- Clasificación y etiquetado de textos largos: aprovechando el contexto extendido para etiquetar documentos completos en una sola pasada.
- Evaluación comparativa de adaptadores: al ser un artefacto ligero, resulta adecuado para experimentos controlados frente al modelo base sin adaptador y frente a otras recetas LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor es la plantilla por defecto de HuggingFace y no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Tampoco se aportan resultados de la pérdida de validación que da nombre al checkpoint.

## Requisitos de hardware

- El adaptador no se puede ejecutar por sí solo: requiere el modelo base Llama 3.1 8B, cuyo peso ronda los 16 GB en bf16/fp16.
- VRAM estimada para inferencia del modelo base: ~16 GB en bf16, ~9-10 GB en int8 y ~5-6 GB en cuantización de 4 bits. A esto hay que sumar el coste de caché KV, que crece linealmente con la longitud de contexto.
- GPU recomendadas: A100 40/80 GB o H100 para despliegues de alta concurrencia con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bf16 de un solo usuario; RTX 4080, RTX 4070 Ti o GPUs con 12-16 GB para cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en cualquier GPU con 12 GB o más si se usa cuantización de 4 bits, y con 24 GB en bf16.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador, vLLM o TGI si se fusionan los pesos previamente, y llama.cpp/Ollama si se exporta el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones y dependerán del hardware, del backend y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (r64 sobre Llama 3.1 8B) | ~180 M de adaptador + 8.030 M del base | 128.000 tokens | No disponible | No disponible (base: Llama 3.1 Community License) | HuggingFace, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 M | 128.000 tokens | Métricas publicadas por Meta en la model card | Llama 3.1 Community License | HuggingFace, ampliamente adoptado |
| Qwen2.5-7B-Instruct | 7.610 M | 128.000 tokens | Métricas publicadas por el equipo de Qwen | Apache 2.0 (variantes) | HuggingFace, ampliamente adoptado |
| Mistral-7B-Instruct-v0.3 | 7.250 M | 32.000 tokens | Métricas publicadas por Mistral | Apache 2.0 | HuggingFace, ampliamente adoptado |
| Adaptador RAFT sin documentar (categoría) | Variable | Heredado del base | Habitualmente no publicado | Habitualmente no declarada | HuggingFace, adopción muy baja |

La comparación con alternativas completas es desfavorable en disponibilidad y trazabilidad: los tres modelos completos citados tienen model cards detalladas, licencias claras y comunidades amplias, mientras que este adaptador carece de toda esa información.

## Limitaciones y advertencias

- Model card vacía: no se documentan datos de entrenamiento, hiperparámetros, licencia, idiomas ni uso previsto.
- Sin licencia declarada: no se puede asumir permiso de uso comercial del adaptador. Además, al derivar de Llama 3.1, se heredan las restricciones de la Llama 3.1 Community License, incluida la cláusula de nombre y las limitaciones para modelos con más de 700 millones de usuarios mensuales.
- Sin resultados de evaluación: la única señal de calidad es la pérdida de validación, insuficiente para estimar utilidad real.
- Riesgo de sobreajuste al formato: un adaptador entrenado con una plantilla concreta de tres documentos y CoT puede degradar su rendimiento cuando el número de documentos o el formato difieren de los vistos en entrenamiento.
- Riesgo de alucinación: heredado del modelo base y potencialmente agravado por el ajuste en dominios específicos; requiere verificación factual en producción.
- Sesgos: no evaluados. El modelo base presenta sesgos documentados por Meta, y el ajuste fino puede intensificar sesgos presentes en el corpus empleado.
- Degradación potencial de capacidades generales: el ajuste con LoRA sobre un dataset reducido puede reducir el rendimiento en tareas ajenas al dominio de entrenamiento (olvido catastrófico parcial).
- Idiomas: no declarados. Si los datos de ajuste fueron mayoritariamente en inglés, el rendimiento en castellano podría ser inferior al del modelo base.
- Metadatos anómalos: la fecha de creación registrada (2026-09-11) resulta inconsistente, lo que dificulta situar el modelo en el tiempo.
- Ausencia de adopción: con 0 descargas y 0 «likes», no existe validación por parte de terceros ni informes de errores.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P40_3DOCS_CoT_A-WIKI-Instruct-r64-best-eval-loss
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Modelo base instruct (referencia de capacidades): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia del modelo base: https://llama.meta.com/llama3_1/license/
- Referencia citada en las etiquetas del repositorio (calculadora de impacto ambiental, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Búsqueda web: la consulta no devolvió resultados relevantes sobre este modelo, su autor ni su receta de entrenamiento; los únicos enlaces recuperados correspondían a un servicio de medición de velocidad de red y no guardan relación con el modelo.
