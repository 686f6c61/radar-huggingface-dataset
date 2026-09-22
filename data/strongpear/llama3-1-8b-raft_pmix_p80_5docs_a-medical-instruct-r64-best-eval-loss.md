# strongpear/Llama3.1-8B-RAFT_PMIX_P80_5DOCS_A-MEDICAL-Instruct-r64-best-eval-loss

## Resumen

Este repositorio contiene un adaptador de ajuste fino del tipo LoRA, distribuido como proyecto PEFT, sobre el modelo base meta-llama/Llama-3.1-8B. Lo publica el usuario strongpear en HuggingFace y su pipeline declarado es text-generation. El modelo base es un transformer decoder-only de 8 000 millones de parámetros con ventana de contexto de 128 000 tokens, desarrollado por Meta, por lo que el adaptador hereda esa arquitectura y esa longitud de contexto, no las redefine.

El identificador del repositorio sugiere, sin confirmación documental, un ajuste orientado al dominio médico mediante la técnica RAFT (Retrieval-Augmented Fine-Tuning), con cinco documentos de contexto por ejemplo, rango LoRA 64 y selección del checkpoint por mejor loss de evaluación. La model card entregada es la plantilla por defecto de HuggingFace y no contiene ni una sola respuesta: todos los campos figuran como "[More Information Needed]", sin descripción, datos de entrenamiento, hiperparámetros ni resultados de evaluación.

Su relevancia práctica es, por tanto, limitada y hay que tratarla con cautela. El repositorio acumula cero descargas y cero "likes", no declara licencia ni idiomas, y se publicó el 21 de septiembre de 2026. Cualquier evaluación seria exige reproducir el ajuste o inspeccionar los pesos directamente, porque la información publicada no permite verificar qué hace el adaptador ni con qué calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; modelo base meta-llama/Llama-3.1-8B |
| Parámetros totales | No disponible para el adaptador; el modelo base tiene 8 000 millones de parámetros |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada para el adaptador; el modelo base declara 128 000 tokens |
| Tipos de cuantización | No disponible para el adaptador (se distribuye en safetensors); el modelo base admite cuantizaciones de la comunidad (GGUF, GPTQ, AWQ, bitsandbytes) |
| Idiomas soportados | No disponible para el adaptador; el modelo base declara 8 idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | No disponible (el modelo base se rige por la Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | meta-llama/Llama-3.1-8B |
| Rango LoRA | 64 (según el identificador del repositorio; no confirmado en la model card) |
| Tamaño del repositorio | 0,7 GB |
| Versión de PEFT | 0.20.0 |
| Fecha de publicación | 21 de septiembre de 2026 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Se aplica sobre meta-llama/Llama-3.1-8B, un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA), que reduce la caché KV frente a la atención multi-cabeza clásica. La model card del adaptador no documenta qué módulos se han adaptado (q_proj, k_proj, v_proj, o_proj, capas MLP), ni el dropout, ni el alpha, ni la tasa de aprendizaje.

No hay información sobre el procedimiento de entrenamiento. El nombre del repositorio apunta a la técnica RAFT, que consiste en ajustar el modelo con ejemplos aumentados con pasajes recuperados y con distractores, de modo que el modelo aprenda a citar y a ignorar contexto irrelevante; también apunta a un dominio médico y al uso de cinco documentos por ejemplo. Nada de esto está confirmado en la documentación. Se desconoce por completo el volumen de tokens de entrenamiento, la composición del dataset, si hubo RLHF, DPO o ajuste supervisado, y qué precisión numérica se empleó (bf16, fp16 o fp8).

Un detalle técnico llamativo es el tamaño del repositorio: 0,7 GB para un adaptador LoRA son valores muy por encima de lo habitual en rangos 64 sobre atención y MLP, lo que sugiere que el adaptador cubre muchas matrices o que el checkpoint incorpora estados adicionales. Es una observación, no un dato confirmado por el autor.

## Capacidades

- No hay ninguna capacidad documentada específicamente para este adaptador. La model card no describe el comportamiento esperado.
- Como adaptador sobre Llama 3.1 8B, hereda la generación de texto del modelo base, pero el ajuste puede alterar el comportamiento de forma no documentada.
- El modelo base, en su variante Instruct, soporta tool calling y function calling; no se confirma que este adaptador conserve esa capacidad tras el ajuste.
- El modelo base soporta razonamiento multi-paso y flujos de agente; no hay evidencia de que el ajuste preserve estas capacidades ni de que las mejore.
- El modelo base es multilingüe en 8 idiomas, con especial solidez en inglés; el adaptador no declara idiomas y, dado el posible corpus médico en inglés, es probable que haya degradación fuera de ese idioma, aunque no está verificado.
- El nombre del repositorio sugiere una capacidad orientada a responder sobre documentación recuperada (patrón RAG) en el ámbito médico. Es una inferencia del identificador, no una capacidad confirmada.

## Casos de uso

- Respuesta a consultas sobre documentación clínica recuperada: si el ajuste sigue realmente el patrón RAFT, el adaptador estaría pensado para responder preguntas apoyándose en pasajes recuperados y descartando distractores. Es el caso de uso que sugiere el identificador, pero requiere validación previa con datos propios.
- Extracción de información estructurada de informes médicos: convertir texto libre de historiales en campos estructurados (diagnóstico, tratamiento, dosis), aprovechando los 128 000 tokens de contexto del modelo base para procesar informes largos de una sola pasada.
- Asistencia a la codificación clínica: mapear descripciones textuales a códigos de clasificación, condicionado a una evaluación rigurosa de precisión, porque un error de codificación tiene consecuencias administrativas y clínicas.
- Resumen de literatura científica: condensar artículos y guías de práctica clínica, con la ventana extendida del modelo base para trabajar sobre documentos completos más pasajes recuperados.
- Buscador semántico con generación aumentada: integrar el adaptador como generador final de un pipeline RAG sobre un corpus interno, donde el ajuste con distractores puede mejorar la fidelidad al contexto. Requiere medir la tasa de alucinación antes de desplegar.
- Prototipado e investigación en ajuste eficiente: servir de punto de partida reproducible para estudiar cómo afecta el ajuste RAFT a un modelo de 8B en un dominio vertical, comparando contra el modelo base sin ajustar.
- Ajuste incremental sobre dominio propio: partir de este adaptador y continuar el entrenamiento con datos internos, dado su tamaño reducido (0,7 GB), que facilita el versionado y el intercambio entre equipos.
- Generación de texto general: al ser un adaptador sobre un modelo de propósito general, puede emplearse para tareas genéricas de generación, si bien no hay motivo documentado para preferirlo frente al modelo base Instruct.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna tabla de evaluación: los apartados de testing data, métricas y resultados figuran como "[More Information Needed]". Tampoco hay métricas de calidad clínica, de fidelidad al contexto ni de tasa de alucinación.

## Requisitos de hardware

Las cifras siguientes corresponden al modelo base, ya que el adaptador añade una sobrecarga pequeña sobre el conjunto (aproximadamente 0,7 GB en el repositorio):

- VRAM en bf16/fp16: en torno a 16 GB solo para los pesos, más caché KV (que crece con el contexto y con el batch). Con 128 000 tokens de contexto la caché KV es el factor dominante.
- VRAM en cuantización de 8 bits: aproximadamente 9-10 GB para los pesos.
- VRAM en cuantización de 4 bits (GPTQ, AWQ o GGUF Q4): aproximadamente 5-6 GB para los pesos.
- GPU profesionales: A100 40/80 GB, H100 80 GB y L40S son adecuadas para fp16 con contextos largos y lotes grandes.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 (24 GB) en bf16 con contextos moderados; en una RTX 4060 Ti de 16 GB o una RTX 4080 conviene cuantizar a 8 o 4 bits.
- Despliegue: PEFT más transformers para cargar el adaptador sobre el modelo base; vLLM y TGI si se fusiona el adaptador en los pesos base; llama.cpp u Ollama tras fusionar y convertir a GGUF; la fusión con `merge_and_unload` es el paso previo habitual para estos dos últimos.
- Latencia y throughput: no disponible. No hay mediciones publicadas y dependen en gran medida del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| strongpear/Llama3.1-8B-RAFT_PMIX_P80_5DOCS_A-MEDICAL-Instruct-r64-best-eval-loss | Adaptador LoRA sobre 8B | No disponible para el adaptador (128 000 tokens en el base) | No disponible | HuggingFace, 0 descargas | Sin benchmarks publicados |
| meta-llama/Llama-3.1-8B-Instruct | 8 000 millones | 128 000 tokens | Llama 3.1 Community License | HuggingFace, ampliamente desplegado | Benchmarks publicados por Meta |
| meta-llama/Llama-3.1-8B (base) | 8 000 millones | 128 000 tokens | Llama 3.1 Community License | HuggingFace | Benchmarks publicados por Meta |
| Adaptadores médicos sobre Llama 3.1 8B publicados por la comunidad | 8 000 millones más adaptador | No disponible | Variable | HuggingFace | No comparable por falta de datos |

No se dispone de información suficiente para establecer una comparativa cuantitativa. La ausencia de licencia declarada, de idiomas y de resultados impide situar este adaptador frente a alternativas de la misma categoría, y la búsqueda web realizada no devolvió ningún material técnico relacionado con el modelo.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla vacía de HuggingFace. No hay datos de entrenamiento, hiperparámetros, evaluación ni uso previsto.
- Licencia no declarada: el repositorio no indica licencia. Al derivar de Llama 3.1, se aplica la Llama 3.1 Community License del modelo base, pero la ausencia de declaración explícita es un riesgo legal para uso comercial. Hay que verificar los términos antes de cualquier despliegue en producción.
- Idiomas no declarados: se desconoce si el ajuste conserva el multilingüismo del modelo base o lo ha degradado hacia el inglés.
- Riesgo de alucinación: no evaluado. Es especialmente crítico si el dominio es médico, donde una afirmación incorrecta puede causar daño.
- Sesgos: no analizados. Los sesgos del modelo base en datos clínicos o demográficos se trasladan sin cuantificar, y el ajuste puede amplificarlos según la composición del corpus, que se desconoce.
- Advertencia sanitaria: ningún modelo de lenguaje debe utilizarse como sustituto del criterio clínico profesional ni para diagnóstico o tratamiento sin supervisión humana y validación regulatoria.
- Adopción nula: cero descargas y cero "likes" implican ausencia de validación por parte de la comunidad y de informes de fallos.
- Reproducibilidad: la selección del checkpoint por "best eval loss" sugiere una métrica de validación, pero no se documenta el conjunto de validación ni el procedimiento de medida.
- Sin garantías de mantenimiento: no hay evidencia de que el autor vaya a responder a issues o a actualizar el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P80_5DOCS_A-MEDICAL-Instruct-r64-best-eval-loss
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Modelo base Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper referenciado en las etiquetas del repositorio (calculadora de impacto ambiental de ML, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Búsqueda web realizada: no devolvió ningún resultado relevante sobre el modelo. Los enlaces obtenidos correspondían a agencias de viajes y no guardan relación con el repositorio.
