# Tohirju/Saidzoda-Kazakh-EmbeddingGemma-300M

## Resumen

Saidzoda-Kazakh-EmbeddingGemma-300M es un modelo de embeddings de frases (sentence embeddings) especializado en kazajo, desarrollado por Tohirju (Tohir Saidzoda) a partir de un ajuste fino del modelo google/embeddinggemma-300m. Su propósito es mejorar la recuperación de información (retrieval) y la similitud semántica en kazajo, un idioma de bajos recursos para el que los modelos multilingües genéricos rinden de forma notablemente inferior. El modelo se publica bajo la librería sentence-transformers y es compatible con text-embeddings-inference y endpoints de Hugging Face.

El punto de partida, EmbeddingGemma-300M, resuelve correctamente la primera posición de recuperación (recall@1) para tan solo el 51,7 %-60,8 % de las preguntas Belebele en lenguas de Asia Central como el kazajo, según el informe asociado del Saidzoda AI Lab (arXiv:2611.11471). Este ajuste fino busca cerrar esa brecha mediante entrenamiento específico en kazajo, manteniendo el soporte para ruso e inglés que hereda del modelo base.

El modelo tiene 302.863.104 parámetros (aproximadamente 300 M), un tamaño de repositorio de 1,3 GB y pesos en formato safetensors. El acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo. La licencia es la propia "saidzoda-model-licence", distinta de la licencia del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (gemma3_text), modelo de embeddings de frases |
| Parametros totales | 302.863.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kk (kazajo), ru (ruso), en (inglés) |
| Licencia | saidzoda-model-licence (licencia propia; acceso restringido en HF) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (finetune) de google/embeddinggemma-300m, que a su vez se basa en la arquitectura de texto de Gemma 3 (etiqueta gemma3_text en Hugging Face) adaptada como encoder de embeddings de frases mediante sentence-transformers. Se trata, por tanto, de un transformer encoder de aproximadamente 300 M de parámetros que produce representaciones vectoriales densas para tareas de similitud semántica y recuperación.

Según el informe del Saidzoda AI Lab (arXiv:2611.11471), el trabajo entrena modelos de una sola lengua para tayiko, kazajo y uzbeko a partir de EmbeddingGemma-300M, además de variantes E5 multilingües para cuatro lenguas. El modelo base, sin ajuste, solo acierta la primera posición de recuperación en el 51,7 %-60,8 % de las preguntas Belebele en estas lenguas, lo que motiva el ajuste específico. No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; estos datos figuran como no disponibles.

## Capacidades

- Generación de embeddings de frases para similitud semántica (pipeline sentence-similarity).
- Recuperación de información (retrieval) en kazajo, con soporte heredado para ruso e inglés.
- Búsqueda semántica y ranking de pasajes en corpus kazajos.
- Compatible con text-embeddings-inference y con los endpoints de Hugging Face.
- Integración directa con la librería sentence-transformers.
- Capacidades multilingües limitadas a kk, ru y en según la model card.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento (thinking), al tratarse de un modelo de embeddings y no generativo.

## Casos de uso

- Búsqueda semántica en kazajo: indexar un corpus de documentos kazajos y recuperar pasajes relevantes mediante similitud vectorial; el ajuste específico corrige el bajo recall del modelo base en este idioma.
- RAG (generación aumentada por recuperación) para asistentes en kazajo: usar el modelo como recuperador en pipelines RAG que alimenten a un LLM generativo, aprovechando la compatibilidad con text-embeddings-inference.
- Deduplicación y agrupamiento de documentos: calcular similitudes entre textos kazajos para detectar duplicados o agrupar noticias y artículos por temática.
- Moderación y clasificación semántica: comparar mensajes de usuarios con prototipos de categorías para clasificación zero-shot en kazajo.
- Sistemas de recomendación de contenido: generar embeddings de artículos y perfiles de usuario para recomendar contenido en kazajo y ruso.
- Evaluación de traducción y paráfrasis: medir similitud semántica entre pares de frases kk-ru o kk-en para control de calidad en pipelines de traducción.
- Búsqueda empresarial interna: desplegar un buscador sobre documentación corporativa en kazajo y ruso con latencia baja gracias al tamaño de 300 M de parámetros.

## Benchmarks y rendimiento

La información disponible solo aporta el dato del modelo base sin ajustar: EmbeddingGemma-300M, tal como se publica, acierta la primera posición de recuperación en el 51,7 %-60,8 % de las preguntas Belebele en tayiko, kazajo, uzbeko y kirguís. No se han publicado en la información disponible resultados de benchmarks específicos de este ajuste fino kazajo (por ejemplo, recall@k o MRR sobre Belebele kazajo).

| Modelo | Benchmark | Resultado |
|---|---|---|
| EmbeddingGemma-300M (base, sin ajuste) | Belebele (recall@1, tayiko/kazajo/uzbeko/kirguís) | 51,7 %-60,8 % |
| Saidzoda-Kazakh-EmbeddingGemma-300M | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 1,2 GB de pesos; en fp16/bf16, aproximadamente 0,6 GB; en cuantización de 8 bits, alrededor de 0,3 GB (estimaciones a partir del número de parámetros; no se documentan cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia en fp16, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más de VRAM.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference (TGI), endpoints de Hugging Face; no se documenta soporte explícito de llama.cpp, Ollama o vLLM en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| Saidzoda-Kazakh-EmbeddingGemma-300M | 302,9 M | no disponible | kk, ru, en | saidzoda-model-licence | Restringido (gated) |
| google/embeddinggemma-300m (base) | ~300 M | no disponible | multilingüe | licencia de Google (no disponible en detalle) | Abierto |
| Saidzoda-CA-EmbeddingGemma-300M | ~300 M | no disponible | tayiko, kazajo, uzbeko, kirguís (variantes) | saidzoda-model-licence | no disponible |

La comparativa con alternativas de la misma categoría (por ejemplo, modelos E5 multilingües o mE5-small) no puede completarse con datos de rendimiento porque la información disponible no incluye resultados de benchmarks del ajuste fino kazajo.

## Limitaciones y advertencias

- Riesgo de alucinación y sesgos: no se documentan análisis de sesgo ni evaluaciones de robustez para este ajuste fino.
- Cobertura idiomática limitada a kk, ru y en; el rendimiento en otros idiomas puede degradarse respecto al modelo base.
- Longitud de contexto no documentada; no se recomienda asumir ventanas largas sin verificación empírica.
- Licencia propia "saidzoda-model-licence": es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede diferir de la licencia del modelo base de Google.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede complicar despliegues automatizados.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: madurez y soporte comunitario muy limitados.
- Al ser un modelo de embeddings, no genera texto; no debe usarse para tareas generativas.
- No se documentan cuantizaciones oficiales ni resultados de latencia/throughput en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Tohirju/Saidzoda-Kazakh-EmbeddingGemma-300M
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- Informe Saidzoda AI Lab (HTML): https://arxiv.org/html/2611.11471
- Informe Saidzoda AI Lab (PDF): https://arxiv.org/pdf/2611.11471
