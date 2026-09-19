# thkmon/KURE-v1-onnx-int8

## Resumen

`thkmon/KURE-v1-onnx-int8` es la conversión a ONNX con cuantización dinámica INT8 del modelo de embeddings coreano `nlpai-lab/KURE-v1`, que a su vez es un ajuste fino en coreano de la arquitectura BGE-M3 (backbone XLM-RoBERTa). El resultado es un encoder de frases pensado para ejecutarse en dispositivos de borde o entornos sin GPU, con un peso aproximado de 568 MB y un grafo exportado en opset 17. El repositorio ocupa 0,6 GB e incluye el tokenizador SentencePiece de XLM-R.

El modelo no genera texto ni responde preguntas: su única salida es `last_hidden_state` con forma `[batch, seq, 1024]`. El pooling y la normalización (masked mean pooling seguido de L2) quedan deliberadamente fuera del grafo y debe realizarlos el consumidor. Esto lo convierte en una pieza de infraestructura para pipelines de búsqueda semántica, clustering y RAG en coreano, no en un modelo conversacional.

Es relevante ahora porque cubre un nicho muy concreto: recuperación semántica en coreano desplegable sin PyTorch, con nombres de entrada y salida fijados como contrato para un embedder en C++. La licencia MIT del modelo original se mantiene, lo que facilita su integración comercial. En el momento de redactar esta ficha el repositorio no registra descargas ni likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder basado en XLM-RoBERTa, exportado a grafo ONNX (opset 17) |
| Parámetros totales | No disponible en la model card; el backbone XLM-RoBERTa-large de BGE-M3 implica del orden de 560 M |
| Longitud de contexto | No disponible; entrada con batch y secuencia dinámicos, límite dependiente del tokenizador XLM-R |
| Tipos de cuantizacion | INT8 dinámico (QInt8, `onnxruntime.quantization.quantize_dynamic`) con salida en fp32; ~568 MB |
| Idiomas soportados | Coreano (ko); tokenizador XLM-R de cobertura multilingüe |
| Licencia | MIT (derivada de `nlpai-lab/KURE-v1`, también MIT) |
| Formato de pesos | ONNX (`.onnx`), opset 17; tokenizador SentencePiece (`sentencepiece.bpe.model`) |
| Dimensión de embedding | 1024 |
| Entradas del grafo | `input_ids`, `attention_mask` (2 entradas, batch y secuencia dinámicos) |
| Salida del grafo | `last_hidden_state` `[batch, seq, 1024]` |
| Pooling incluido | No; masked mean pooling + normalización L2 a cargo del consumidor |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder XLM-RoBERTa, la misma familia que emplea BGE-M3, del que `nlpai-lab/KURE-v1` es un ajuste fino para coreano. El modelo exportado conserva atención eager y se convirtió con `torch.onnx.export` en modo legacy antes de aplicar cuantización dinámica. El grafo resultante usa opset 17 y expone únicamente dos entradas (`input_ids`, `attention_mask`) y una salida (`last_hidden_state`), con nombres fijados explícitamente para cumplir el contrato de un embedder en C++.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original; la model card de esta conversión no los detalla. La innovación técnica destacable aquí no es arquitectónica sino de despliegue: la cuantización dinámica reduce el peso a unos 568 MB manteniendo la salida en fp32, lo que evita acumular error de cuantización en las representaciones finales. El script de reproducción (`export_embedder_onnx.py --model nlpai-lab/KURE-v1 --out ./kure-v1 --dtype int8`) permite regenerar el artefacto.

## Capacidades

- Generación de embeddings de frases y documentos en coreano, con vectores de 1024 dimensiones.
- Búsqueda semántica y recuperación densa (dense retrieval) mediante similitud coseno sobre vectores normalizados en L2.
- Agrupamiento (clustering) y deduplicación de textos por cercanía en el espacio de embeddings.
- Clasificación y filtrado semántico mediante similitud entre pares de textos.
- Ejecución en CPU y dispositivos de borde gracias al grafo ONNX INT8 y a la ausencia de dependencia de PyTorch en inferencia.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo generativo ni tiene modo de pensamiento.
- No dispone de capacidades de visión, audio ni generación de texto.
- Cobertura multilingüe limitada en la práctica: está ajustado para coreano y la model card solo declara `ko`.

## Casos de uso

- Búsqueda semántica en coreano sobre corpus propios: indexar documentos con los embeddings de 1024 dimensiones y recuperar por similitud coseno; el tamaño INT8 permite mantener el índice y el encoder en el mismo nodo sin GPU.
- RAG en coreano: usar el modelo como recuperador en un pipeline de generación aumentada, alimentando a un LLM generativo los fragmentos recuperados; el pooling a cargo del consumidor permite adaptar la estrategia (media enmascarada, CLS o last token) sin reexportar el grafo.
- Despliegue en dispositivo de borde o móvil: al ser ONNX de ~568 MB con cuantización dinámica y salida fp32, encaja en aplicaciones coreanas de búsqueda local sin conexión ejecutadas con ONNX Runtime en CPU.
- Deduplicación y near-duplicate detection en coreano: calcular embeddings por documento y agrupar por umbral de similitud para limpiar bases documentales o catálogos.
- Moderación y enrutado de contenidos: comparar el embedding de un texto entrante contra un conjunto de embeddings de referencia (etiquetas, intenciones, políticas) para clasificarlo por vecindad.
- Sistemas de recomendación basados en contenido: representar ítems y consultas de usuario en el mismo espacio de 1024 dimensiones para recuperar candidatos por similitud semántica en coreano.
- Integración en servicios backend en C++: los nombres de entrada y salida están fijados como contrato, de modo que un embedder nativo puede cargar el grafo con ONNX Runtime sin capas de traducción.
- Análisis de feedback de usuarios: agrupar opiniones o tickets en coreano por temática emergente antes de escalarlos a revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión no incluye métricas de recuperación (Recall@k, nDCG, MRR) ni comparaciones con el modelo original en fp32, por lo que no es posible cuantificar la pérdida de calidad introducida por la cuantización dinámica INT8.

## Requisitos de hardware

- VRAM: no aplica para CPU; en GPU la huella del grafo INT8 ronda los 0,6 GB de pesos más activaciones, por lo que 2 GB de VRAM son suficientes para lotes pequeños. Cifra estimada a partir del tamaño del repositorio, no publicada por el autor.
- GPU recomendadas: cualquier GPU con 2-4 GB o más de memoria (RTX 3060, RTX 4090, T4, L4). Para lotes grandes o indexado masivo, A100 o H100 reducen el tiempo total, pero no son necesarias.
- GPU de consumo: sí, cabe con holgura en cualquier GPU de consumo actual e incluso en iGPU y en CPU exclusivamente.
- CPU y borde: es el escenario principal del artefacto; funciona con ONNX Runtime en x86, ARM y dispositivos móviles. Un Jetson o una Raspberry Pi pueden ejecutarlo, con throughput bajo en el segundo caso.
- Opciones de despliegue: ONNX Runtime (C++, Python, Java, móvil), Text Embeddings Inference (TEI), FastEmbed, y sentence-transformers cargando el backend ONNX. llama.cpp y Ollama no aplican, ya que no es un modelo generativo. vLLM no está orientado a encoders de embeddings de este tipo.
- Latencia y throughput: no disponibles. Dependen del hardware, de la longitud de secuencia y de si el pooling se implementa en vectorizado; no hay cifras publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Formato | Licencia |
|---|---|---|---|---|---|
| thkmon/KURE-v1-onnx-int8 | No disponible (~560 M por el backbone) | No disponible | ko | ONNX INT8 | MIT |
| nlpai-lab/KURE-v1 (original) | No disponible en la información proporcionada | No disponible | ko | safetensors (no confirmado) | MIT |
| BAAI/bge-m3 (referencia citada en la model card) | No disponible en la información proporcionada | No disponible | Multilingüe | No disponible | No disponible |
| Alternativas de embeddings coreanos | No disponible | No disponible | ko | No disponible | No disponible |

La comparación se limita a lo que consta en la información proporcionada: la model card identifica `nlpai-lab/KURE-v1` como un ajuste fino coreano de BGE-M3 y declara la licencia MIT heredada. No hay datos públicos en esta ficha sobre parámetros, contexto o rendimiento de los modelos de referencia, por lo que no se pueden establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no produce texto, no responde preguntas y no admite instrucciones.
- El pooling no está incluido en el grafo. Si el consumidor aplica una estrategia distinta de la usada en el ajuste original (masked mean pooling + L2), la calidad de recuperación puede degradarse de forma significativa.
- La cuantización dinámica INT8 puede introducir una pérdida de calidad respecto al modelo fp32 original. No hay métricas publicadas que la cuantifiquen, por lo que conviene validarla con un conjunto de evaluación propio antes de producción.
- Idioma: está ajustado para coreano. Su uso en castellano u otros idiomas no está respaldado por la model card y probablemente dé resultados pobres.
- Longitud de secuencia: al ser dinámica, secuencias muy largas aumentan memoria y latencia de forma lineal; no se documenta un límite explícito.
- Licencia MIT: permite uso comercial y modificaciones siempre que se conserve el aviso de copyright y se atribuya al autor original de `nlpai-lab/KURE-v1`.
- Madurez: el repositorio no registra descargas ni likes en el momento de redactar esta ficha, y la fecha de creación indicada es 2026-09-19. No hay evidencia de uso en producción ni de mantenimiento continuado.
- Riesgos de sesgo: no hay información publicada sobre la composición del corpus de entrenamiento del modelo base, por lo que no pueden evaluarse sesgos de dominio ni de representación.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos en recuperación cuando dos textos son léxicamente distintos pero próximos en el espacio de embeddings.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thkmon/KURE-v1-onnx-int8
- Modelo base: https://huggingface.co/nlpai-lab/KURE-v1

Nota: la búsqueda web asociada a esta ficha no devolvió resultados relevantes sobre el modelo (únicamente perfiles de redes sociales sin relación con el proyecto). No se han localizado papers, blogs, repositorios ni demos adicionales en la información disponible.
