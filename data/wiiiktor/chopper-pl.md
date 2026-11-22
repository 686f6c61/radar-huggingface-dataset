# wiiiktor/chopper-pl

## Resumen

Chopper-pl es una familia de modelos de clasificación de tokens especializados en compresión de contexto para pipelines RAG en polaco. Desarrollado por el usuario wiiiktor bajo licencia Apache 2.0, el modelo recibe una pregunta junto con los pasajes recuperados y devuelve únicamente las frases necesarias para responder (citas exactas o "chops"), además de una decisión binaria ANSWER/SEARCH que indica si el contexto recuperado contiene suficiente información para contestar o si conviene seguir buscando.

El modelo no genera texto libre: es un encoder de tipo token-classification que actúa como filtro extractivo entre el retriever y el generador. Su relevancia práctica está en la reducción drástica del contexto enviado al LLM: según la model card, en un conjunto de 856 preguntas polacas con 16 fragmentos recuperados por pregunta, el chopper conserva aproximadamente el 6 % de los tokens (unos 250 frente a unos 3.900) manteniendo o mejorando la calidad de las respuestas.

Se distribuye en cinco variantes construidas sobre encoders polacos y multilingües (pl-ModernBERT base y large, mmBERT base y small, y polish-roberta-base-8k), con tamaños que van de 0,14B a 0,45B parámetros. La variante recomendada por defecto es `plmodernbert-base`, con 0,15B parámetros. El repositorio ocupa 2,6 GB e incluye pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT / mmBERT / RoBERTa) con cabeza de token-classification |
| Parametros totales | 0,14B (mmbert-small-pl), 0,15B (plmodernbert-base), 0,18B (polish-roberta-base-8k), 0,31B (mmbert-base-pl), 0,45B (plmodernbert-large) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Polaco (pl); variantes mmBERT con capacidad multilingüe derivada del modelo base |
| Licencia | Apache 2.0 (los pesos derivados de mmBERT heredan bases con licencia MIT) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Cada variante es un encoder transformer con cabeza de clasificación por token que etiqueta cada token del contexto recuperado como relevante o no relevante, produciendo spans extractivos (las "chops") y una decisión ANSWER/SEARCH. Los modelos base son pl-ModernBERT (base y large) de OPI PIB, mmBERT (base y small) de JHU CLSP y polish-roberta-base-8k de Sławomir Dadas. La variante `mmbert-small-pl` prescinde de la etapa de multi-hop.

El entrenamiento sigue una receta de cinco etapas, una época por etapa con learning rate 3e-5: (1) mezcla multilingüe, (2) conjunto de reranking, (3) mezcla final, (4) PoQuAD + PolQA + replay y (5) multi-hop en polaco con 12.753 filas de entrenamiento de MuSiQue con etiquetas de span, traducidas al polaco con los spans preservados mediante marcadores, más replay one-hop en polaco y 5.000 filas de multi-hop en inglés. Las variantes mmBERT aplican solo las etapas 4 y 5 (base) o solo la 4 (small). Se eliminaron del entrenamiento todas las filas de MuSiQue que compartían párrafo con las 100 preguntas de test de 2-hop. Los datasets empleados son PoQuAD (CC BY 4.0), PolQA (CC BY-SA 4.0) y MuSiQue (CC BY 4.0).

## Capacidades

- Compresión extractiva de contexto: selecciona las frases exactas del contexto recuperado que contienen la evidencia para responder.
- Decisión ANSWER/SEARCH: indica si el contexto basta para responder o si conviene lanzar otra búsqueda.
- Clasificación de tokens a nivel de span con salida de citas literales, sin generación libre.
- Soporte de preguntas one-hop y multi-hop (2-hop) en polaco.
- Función de reranking de pasajes (evaluado sobre HotpotQA-PL).
- Procesamiento de texto mixto polaco-otras lenguas en las variantes mmBERT.
- Integración con la librería `chopper-rag` mediante `Chopper.from_pretrained` y `ch.run(pregunta, pasajes)`.
- Umbral de confianza configurable (por ejemplo `threshold=0.3` para la variante polish-roberta).

## Casos de uso

- Atención al cliente sobre base documental en polaco: el chopper filtra los fragmentos recuperados antes de enviarlos al LLM generador, reduciendo el coste por consulta al recortar el contexto a aproximadamente el 6 % de los tokens originales.
- Pipelines RAG de documentación técnica: insertado entre el retriever y el generador, elimina pasajes irrelevantes y entrega solo citas literales, lo que facilita la trazabilidad de la respuesta.
- Preguntas multi-hop en polaco: la variante `mmbert-base-pl` obtiene el mejor resultado en preguntas de 2-hop (56 de 100 correctas), adecuada para consultas que requieren combinar evidencia de varios documentos.
- Reranking de resultados de búsqueda: evaluado sobre HotpotQA-PL con nDCG@10 de 0,704 en la variante base, útil para reordenar los 100 primeros resultados de un retriever denso.
- Control de calidad de recuperación: la decisión ANSWER/SEARCH permite implementar bucles de búsqueda iterativa cuando el contexto recuperado no contiene la respuesta.
- Despliegue en entornos con recursos limitados: la variante `mmbert-small-pl` (0,14B parámetros) ofrece compresión rápida sin etapa multi-hop para servicios de baja latencia.
- Preprocesado de corpus legales o administrativos polacos: extracción de las frases relevantes de documentos largos antes de pasarlos a un modelo generativo.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre datos held-out. Las respuestas se generan con Qwen3-14B leyendo solo las chops; las preguntas de 2-hop se evalúan con un modelo juez.

| Variante | KEEP F1 PoQuAD / PolQA | Correctas de 856 preguntas (pl) | Correctas de 100 preguntas 2-hop (pl) | HotpotQA-PL rerank nDCG@10 |
|---|---|---|---|---|
| plmodernbert-base | 0,694 / 0,731 | 738 | 51 | 0,704 |
| mmbert-base-pl | 0,562 / 0,677 | 732 | 56 | 0,674 |
| plmodernbert-large | 0,590 / 0,636 | 742 | 52 | 0,707 |
| polish-roberta-base-8k | 0,533 / 0,578 | 716 | 43 | 0,680 |
| mmbert-base universal (sin entrenamiento en polaco) | 0,375 / 0,474 | 638 | 40 | 0,728 |
| Sin chopper (todos los pasajes, ~3.900 tokens) | – | 728 | 33 | – |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por tamaño (0,14B a 0,45B parámetros) los pesos en fp16 ocupan aproximadamente entre 0,3 GB y 0,9 GB, y en fp32 entre 0,6 GB y 1,8 GB.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU consumer con 4 GB o más de VRAM debería alojar las variantes base.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, dado el rango de parámetros.
- Opciones de despliegue: la model card solo documenta la librería `chopper-rag` (`pip install chopper-rag`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| chopper-pl (plmodernbert-base) | Compresor extractivo / token-classification | 0,15B | No disponible | Apache 2.0 | KEEP F1 0,694 / 0,731; 738/856 correctas |
| chopper_mmbert (universal) | Compresor extractivo multilingüe | 0,31B (mmbert-base) | No disponible | MIT (base) | Mejor nDCG de reranking (0,728) pero peor KEEP F1 en polaco (0,375 / 0,474) |
| bge-reranker-v2-m3 | Reranker | No disponible | No disponible | No disponible | Mejor en reranking puro (nDCG 0,778) según la model card |
| Sin chopper (contexto completo) | – | – | – | – | 728/856 correctas con ~3.900 tokens por consulta |

## Limitaciones y advertencias

- Modelo especializado en polaco: las variantes no mmBERT están entrenadas exclusivamente para ese idioma; el rendimiento fuera del polaco no está documentado.
- No es un generador: solo extrae spans del contexto proporcionado, por lo que no puede responder si la evidencia no está presente (de ahí la decisión SEARCH).
- La variante `polish-roberta-base-8k` es la más débil (KEEP F1 0,533 / 0,578) y muestra baja confianza con umbral 0,5; la model card recomienda `threshold=0.3`.
- `plmodernbert-large` no aporta mejora sobre la base según el autor, pese a triplicar parámetros.
- Para reranking puro, un reranker dedicado como bge-reranker-v2-m3 supera a estos modelos (0,778 frente a 0,704-0,728 de nDCG@10).
- Los resultados de respuesta dependen del modelo generador utilizado (Qwen3-14B en la evaluación) y del juez empleado en 2-hop.
- Riesgo de sesgo y alucinación: no documentado en la información disponible; al ser extractivo, el riesgo de alucinación se limita a la selección errónea de spans.
- Licencia Apache 2.0 permite uso comercial; las variantes mmBERT derivan de bases MIT, compatible con uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de adopción muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wiiiktor/chopper-pl
- Choppers multilingües: https://huggingface.co/wiiiktor/chopper_mmbert
- Modelo base pl-ModernBERT-base: https://huggingface.co/OPI-PIB/pl-ModernBERT-base
- Modelo base pl-ModernBERT-large: https://huggingface.co/OPI-PIB/pl-ModernBERT-large
- Modelo base mmBERT-base: https://huggingface.co/jhu-clsp/mmBERT-base
- Modelo base mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
- Modelo base polish-roberta-base-8k: https://huggingface.co/sdadas/polish-roberta-base-8k
- Dataset PoQuAD: https://huggingface.co/datasets/clarin-pl/poquad
- Dataset PolQA: https://huggingface.co/datasets/ipipan/polqa
