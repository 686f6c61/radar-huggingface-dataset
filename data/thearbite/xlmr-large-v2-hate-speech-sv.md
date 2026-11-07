# TheArbite/xlmr-large-v2-hate-speech-sv

## Resumen

TheArbite/xlmr-large-v2-hate-speech-sv es un modelo de clasificación de texto derivado de la arquitectura XLM-RoBERTa large (versión 2), publicado en Hugging Face por el usuario TheArbite. Por el identificador y la nomenclatura del repositorio, se trata de un ajuste fino orientado a la detección de discurso de odio (hate speech) en sueco ("sv"), aunque la model card no confirma explícitamente ni la tarea, ni el idioma, ni el conjunto de datos de entrenamiento. El repositorio se creó y actualizó el 7 de noviembre de 2026 y no registra descargas ni "likes" en el momento de redactar esta ficha.

El modelo cuenta con 559.894.532 parámetros reales según los pesos en safetensors, lo que coincide con el tamaño de XLM-RoBERTa large (aproximadamente 560 millones de parámetros). El repositorio ocupa 2,3 GB, coherente con pesos en precisión completa o media precisión. Es un modelo exclusivamente de codificación (encoder) para clasificación de secuencias, no generativo, y su pipeline declarado en el Hub es `text-classification`.

La relevancia de este modelo es limitada y debe contextualizarse: se trata de un ajuste fino comunitario sin documentación técnica, sin métricas publicadas y sin licencia declarada, lo que lo convierte en un artefacto de interés para experimentación o para replicar pipelines de moderación de contenido en sueco, pero no en una opción recomendable para producción sin una evaluación previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large v2, según el identificador del repositorio; no confirmado en la model card) |
| Parametros totales | 559.894.532 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa admite hasta 512 tokens, dato no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el sufijo "sv" sugiere sueco, sin confirmación documental) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es XLM-RoBERTa large, un transformer encoder basado en RoBERTa con tokenizador SentencePiece multilingüe y entrenamiento en 100 idiomas sobre CommonCrawl (según el paper de referencia XLM-R, arXiv:1910.09700, citado en los tags del repositorio). El modelo base tiene 24 capas, 16 cabezas de atención y una dimensión oculta de 1024, lo que da lugar a los aproximadamente 560 millones de parámetros observados. Sobre esta base se habría añadido una cabeza de clasificación para la tarea de detección de discurso de odio, aunque la model card no detalla el número de etiquetas ni la función de pérdida.

No hay información disponible sobre el conjunto de datos de ajuste fino, el número de ejemplos, la composición del corpus, el régimen de entrenamiento (fp32, fp16, bf16), la duración del entrenamiento ni si se aplicaron técnicas de aumento de datos o desbalanceo de clases. Tampoco se documenta ningún proceso de RLHF, DPO ni calibración posterior, algo esperable en un modelo de clasificación. La model card es la plantilla automática de Hugging Face sin rellenar, por lo que todos los campos técnicos figuran como "[More Information Needed]".

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, orientado a etiquetar secuencias completas (probablemente como odio / no odio o categorías relacionadas, sin confirmar).
- Detección de discurso de odio: el nombre del repositorio indica este propósito, aunque no se especifican las etiquetas ni el esquema de anotación.
- Capacidad multilingüe potencial: al derivar de XLM-RoBERTa, el encoder subyacente es multilingüe, pero el ajuste fino probablemente esté especializado en sueco y no se garantiza un rendimiento adecuado en otros idiomas.
- Sin soporte de generación de texto: es un encoder de clasificación, no un modelo causal.
- Sin soporte documentado de tool calling, function calling ni razonamiento multi-paso.
- Sin capacidades de visión, audio ni modo "thinking".
- No se documenta soporte de agentes ni de conversación multi-turno.

## Casos de uso

- Moderación de comentarios en plataformas suecas: el modelo puede clasificar comentarios individuales como discurso de odio o no odio, integrándose en un pipeline de premoderación que derive los casos positivos a revisión humana. Adecuado por su tamaño (560 M de parámetros) y su naturaleza de encoder, que permite inferencia rápida por lotes.
- Filtrado previo en foros y comunidades online: dado su bajo coste computacional en comparación con modelos generativos, puede procesar grandes volúmenes de mensajes en tiempo casi real antes de aplicar modelos más caros o revisión manual.
- Investigación en lingüística computacional del sueco: útil como punto de partida para estudiar sesgos, vocabulario ofensivo y fenómenos de discurso de odio en corpus suecos, siempre que se valide su comportamiento con datos propios.
- Anotación asistida de datasets: puede emplearse para preetiquetar corpus de moderación y reducir el esfuerzo de anotación humana, con revisión posterior para corregir falsos positivos y negativos.
- Monitorización de redes sociales: clasificación por lotes de publicaciones para detectar tendencias de discurso de odio, con la advertencia de que la falta de métricas publicadas obliga a una evaluación previa en el dominio objetivo.
- Baseline en experimentos de clasificación: sirve como referencia inicial en comparaciones con modelos más grandes o con enfoques generativos, dado su tamaño moderado y su compatibilidad con la librería transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, F1, AUC ni comparaciones con otros modelos, y tampoco se han encontrado resultados en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,2 GB solo para pesos, más memoria para activaciones y tokenización; en la práctica, entre 3 y 4 GB para lotes pequeños.
- VRAM estimada en fp16/bf16: aproximadamente 1,1 GB para pesos, con un total realista de 2 a 3 GB incluyendo activaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16, como RTX 3050, RTX 3060, RTX 4060, T4 o superiores. Para procesamiento por lotes de alto volumen, A10G, L4, A100 o H100.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer modernas con 4 GB o más de VRAM, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: transformers con pipeline de clasificación, Text Embeddings Inference (el tag `text-embeddings-inference` está presente), endpoints compatibles, y potencialmente ONNX Runtime si se exporta. No se documentan variantes GGUF para llama.cpp u Ollama, aunque sería posible convertir los pesos.
- Latencia y throughput: no disponibles. Al tratarse de un encoder de 560 M de parámetros, se espera un throughput alto en GPU (cientos o miles de secuencias por segundo en lotes), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TheArbite/xlmr-large-v2-hate-speech-sv | 559,9 M | no disponible | Clasificación de discurso de odio (presunto, sueco) | no disponible | Hugging Face, sin descargas |
| FacebookAI/xlm-roberta-large | 559,9 M | 512 tokens | Modelo base multilingüe | MIT | Hugging Face, ampliamente utilizado |
| cardiffnlp/twitter-roberta-base-hate | ~125 M | 512 tokens | Detección de odio en inglés | no disponible | Hugging Face |
| Hate-speech-CNERG/dehatebert-mono-english | ~110 M | 512 tokens | Detección de odio en inglés | no disponible | Hugging Face |

La comparación directa con alternativas específicas para sueco no está disponible en la información proporcionada. Frente al modelo base XLM-RoBERTa large, este ajuste fino añade una cabeza de clasificación pero carece de la documentación, licencia y métricas del original. Frente a los modelos en inglés citados, la diferencia principal es el idioma objetivo y el tamaño (560 M frente a 110-125 M), con un coste computacional mayor pero potencialmente mayor capacidad de representación.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática, sin información sobre datos, entrenamiento, etiquetas ni evaluación.
- Licencia no declarada: no se puede garantizar el uso comercial ni la redistribución; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Sin métricas publicadas: no hay evidencia de precisión, recall ni F1, por lo que el rendimiento real es desconocido.
- Riesgo de sesgos: los modelos de detección de odio suelen sobrerrepresentar ciertos dialectos, registros coloquiales o grupos demográficos; sin documentación no se puede evaluar este riesgo.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación, con consecuencias directas en moderación (censura indebida o contenido dañino no detectado).
- Idioma: aunque el encoder base es multilingüe, el ajuste fino probablemente esté limitado al sueco; su uso en otros idiomas no está validado.
- Contexto limitado a 512 tokens (característica de XLM-RoBERTa), insuficiente para documentos largos.
- Repositorio sin descargas ni validación comunitaria: no hay evidencia de que el modelo haya sido probado por terceros.
- Fecha de creación futura (2026) y metadatos incompletos: conviene verificar la integridad de los pesos antes de usarlos.

## Enlaces

- Hugging Face: https://huggingface.co/TheArbite/xlmr-large-v2-hate-speech-sv
- Paper de XLM-R (referenciado en los tags): https://arxiv.org/abs/1910.09700
- Colectivo Hatespeech en Hugging Face (referencia externa): https://huggingface.co/collections/Stevebankz/hatespeech
- Artículo sobre detección multilingüe de discurso de odio (MDPI): https://www.mdpi.com/1099-4300/26/4/344
