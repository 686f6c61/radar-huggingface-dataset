# tardellirs/brazembed-pt-br-retrieval

## Resumen

brazembed-pt-br-retrieval es un modelo de embeddings de frases especializado en recuperación (retrieval) y reranking para portugués de Brasil, desarrollado por tardellirs. Forma parte de la familia BrazEmbed-PT-BR, un conjunto de cuatro expertos construidos sobre el mismo codificador base, y se presenta como el experto dedicado a búsqueda semántica y recuperación de pasajes en pipelines RAG. El modelo deriva de BERTimbau (neuralmind/bert-base-portuguese-cased), el BERT brasileño preentrenado por NeuralMind sobre el corpus brWaC.

Técnicamente es un transformer encoder de tipo BERT con 108.923.136 parámetros, que produce embeddings de 768 dimensiones mediante mean pooling, con una longitud máxima de 128 tokens y sin prefijo de instrucción. La licencia es MIT, lo que facilita su integración en productos comerciales, y los pesos se distribuyen en formato safetensors dentro de la librería sentence-transformers.

Su relevancia actual radica en que cubre un hueco específico: embeddings de recuperación para portugués brasileño con un tamaño reducido (repo de 0,4 GB) que permite despliegue en hardware modesto. El autor lo sitúa dentro de una estrategia de enrutamiento por tarea, donde cada experto de la familia se emplea para el tipo de tarea para el que fue entrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base_model: neuralmind/bert-base-portuguese-cased) |
| Parámetros totales | 108.923.136 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (máximo indicado en la model card) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | pt (portugués, con enfoque en portugués de Brasil) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer BERT-base adaptado a embeddings de frases. El entrenamiento se realizó en dos etapas. En la primera, BERTimbau se ajustó completamente con InfoNCE simétrico in-batch sobre 3.633 pares consulta-pasaje en portugués generados con Gemini, cubriendo dominios médico, legal, enciclopédico y web; este codificador de etapa 1 es compartido por los cuatro expertos de la familia. En la etapa específica de este experto se entrenaron tres adaptadores LoRA (r=16) con InfoNCE y negativos duros minados sobre mMARCO-pt (400.000 pares), SQuAD-pt_BR (78.000), Ulysses-RFCorpus (4.200, sobremuestreado) y 5.851 pares sintéticos de QA legal (pasajes de legislación federal con consultas generadas por Gemini), y posteriormente se promediaron los pesos de los tres adaptadores (weight soup uniforme).

Los adaptadores LoRA se fusionan en el modelo completo, de modo que se carga como un SentenceTransformer estándar sin dependencias adicionales. El autor verificó la ausencia de solapamiento entre los conjuntos de entrenamiento y los pools de evaluación juzgados: mMARCO-pt contra el pool de Quati (0 de 8,8 millones de pasajes con solapamiento) y SQuAD-pt_BR/Ulysses contra FaQuAD, JurisTCU, BRTaxQA y Quati (0 solapamiento). El entrenamiento se ejecutó en GPUs A10G individuales en junio de 2026.

## Capacidades

- Generación de embeddings de frases y pasajes de 768 dimensiones con mean pooling, normalizables para similitud coseno.
- Recuperación semántica densa (dense retrieval) para búsqueda de pasajes relevantes dada una consulta.
- Reranking de candidatos recuperados previamente.
- Similitud semántica entre textos, aunque el experto dedicado a esa tarea dentro de la familia es brazembed-pt-br-sts.
- Soporte de tool calling / function calling: no disponible (es un modelo de embeddings, no generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al portugués (etiqueta de idioma pt); no se declara soporte de otros idiomas.
- Capacidades especiales: no dispone de modo thinking, visión ni audio; su función es exclusivamente la extracción de características y la similitud de frases.

## Casos de uso

- Búsqueda semántica en corpus jurídicos brasileños: el modelo se entrenó con pares de QA legal sobre pasajes de legislación federal, por lo que es adecuado para indexar normativa y recuperar artículos relevantes ante consultas en lenguaje natural.
- Pipelines RAG sobre documentación en portugués: genera embeddings de fragmentos (hasta 128 tokens) que se almacenan en una base vectorial y se recuperan por similitud coseno para alimentar al generador de respuestas.
- Reranking de resultados de búsqueda: tras una recuperación inicial con BM25 u otro método, el modelo reordena los candidatos calculando similitud consulta-pasaje, aprovechando su especialización y sus resultados declarados en la categoría de reranking.
- Atención al cliente y bases de conocimiento: indexación de FAQs y artículos de ayuda en portugués brasileño para responder consultas de usuarios mediante recuperación semántica en conversaciones multi-turno, encadenando recuperaciones por turno.
- Búsqueda en dominios médicos y enciclopédicos: la etapa 1 incluyó pares de estos dominios, lo que permite recuperar información en portales de salud o enciclopedias en portugués.
- Deduplicación y agrupación de documentos: aunque el experto de clustering de la familia es otro, los embeddings pueden emplearse para detectar pasajes near-duplicate en corpus portugueses mediante umbrales de similitud coseno.
- Enrutamiento por tarea en sistemas mixtos: combinado con route.py, permite dirigir cada consulta al experto adecuado (clasificación, NLI, STS o retrieval) dentro de una misma arquitectura base.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| MTEB-BR (versión de desarrollo, 16 tareas) | Retrieval (media de categoría) | 0.515 |
| MTEB-BR (versión de desarrollo, 16 tareas) | Reranking (media de categoría) | 0.601 |

El autor advierte que el desarrollo iteró contra esta versión de desarrollo del benchmark sin partición de validación reservada, por lo que los números arrastran cierto optimismo de selección. La tabla de clasificación actual de MTEB-BR (por, v1, 21 tareas) evalúa el modelo fusionado brazembed-pt-br, no este experto individual. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y estos no aplican a un modelo de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 108,9 millones de parámetros; en fp32 ocupa aproximadamente 0,44 GB de pesos, en fp16 unos 0,22 GB y en int8 unos 0,11 GB, a los que hay que sumar el overhead de activaciones y del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor entrenó en A10G, y modelos de este tamaño funcionan sin problema en A100, H100, L4, T4 o RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, 4060, 4090, etc.) e incluso en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers (nativo), Text Embeddings Inference (el repo incluye la etiqueta text-embeddings-inference y endpoints_compatible), y exportación a ONNX u otros runtimes compatibles con transformers; no se documentan recetas específicas para vLLM, llama.cpp u Ollama, que no son el runtime habitual para encoders de embeddings.
- Latencia y throughput estimados: no disponibles en la información proporcionada; con 128 tokens de contexto y 110M de parámetros, el coste por lote es bajo en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brazembed-pt-br-retrieval | 108,9 M | 128 tokens | Retrieval y reranking en pt-BR | MIT | Hugging Face |
| brazembed-pt-br (modelo fusionado) | no disponible | no disponible | Uso general, MTEB-BR 57,5 | MIT | Hugging Face |
| brazembed-pt-br-sts | no disponible | no disponible | Similitud semántica | MIT | Hugging Face |
| brazembed-pt-br-clfclu | no disponible | no disponible | Clasificación y clustering | MIT | Hugging Face |
| brazembed-pt-br-pairclf | no disponible | no disponible | Clasificación de pares / NLI | MIT | Hugging Face |

Las alternativas de otros desarrolladores para embeddings en portugués (por ejemplo, modelos derivados de BERTimbau o de arquitecturas multilingües) no se detallan en la información proporcionada, por lo que no se dispone de una comparativa de rendimiento cruzada con cifras verificables.

## Limitaciones y advertencias

- Ventana de contexto muy corta: 128 tokens máximo, insuficiente para pasajes largos; obliga a fragmentar documentos antes de indexar.
- Especialización estrecha: está optimizado para retrieval y reranking; para clasificación, clustering, NLI o similitud semántica el autor recomienda usar los otros expertos de la familia.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al entrenarse sobre corpus brasileños (brWaC, mMARCO-pt, SQuAD-pt_BR, Ulysses, legislación federal) puede heredar los sesgos de esas fuentes.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los embeddings pueden producir recuperaciones irrelevantes si el dominio de consulta se aleja de los datos de entrenamiento (médico, legal, enciclopédico, web).
- Limitación de idioma: solo portugués; no se declara ni evalúa el rendimiento en otros idiomas.
- Optimismo de selección en las métricas: los resultados de MTEB-BR de desarrollo se obtuvieron iterando contra el propio benchmark sin partición reservada, por lo que deben tomarse con cautela.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución; no se indican cláusulas adicionales.
- Caveat para producción: el modelo no incluye prefijo de instrucción, por lo que no debe añadirse uno al codificar; la normalización de embeddings debe activarse explícitamente (normalize_embeddings=True) para usar similitud coseno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tardellirs/brazembed-pt-br-retrieval
- Modelo fusionado de la familia: https://huggingface.co/tardellirs/brazembed-pt-br
- Experto de clasificación y clustering: https://huggingface.co/tardellirs/brazembed-pt-br-clfclu
- Experto de clasificación de pares / NLI: https://huggingface.co/tardellirs/brazembed-pt-br-pairclf
- Experto de similitud semántica: https://huggingface.co/tardellirs/brazembed-pt-br-sts
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Repositorio con route.py: https://github.com/tardellirs/brazembed-pt-br/blob/main/route.py
- Leaderboard MTEB-BR: https://huggingface.co/spaces/MTEB-BR/leaderboard
- Paper MTEB-BR (arXiv:2607.04581): https://arxiv.org/abs/2607.04581
