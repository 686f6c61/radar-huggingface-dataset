# tardellirs/brazembed-pt-br-pairclf

## Resumen

brazembed-pt-br-pairclf es un modelo de embeddings de frases especializado en clasificación de pares y en inferencia de lenguaje natural (NLI) para portugués de Brasil. Lo desarrolla Tardelli Ronan Coelho Stekel (usuario `tardellirs`) y forma parte de la familia BrazEmbed-PT-BR, un conjunto de cuatro expertos construidos sobre el mismo codificador base. El modelo parte de BERTimbau (`neuralmind/bert-base-portuguese-cased`), el BERT brasileño preentrenado por NeuralMind sobre el corpus brWaC, y lo convierte en un encoder de frases mediante un ajuste fino supervisado.

El modelo resuelve la tarea de transformar pares de frases en representaciones vectoriales de 768 dimensiones útiles para decidir relaciones semánticas: implicación, contradicción, neutralidad, paráfrasis o duplicados. Con 108,9 millones de parámetros y una ventana máxima de 128 tokens, es un modelo compacto pensado para integrarse en pipelines de búsqueda semántica, deduplicación y evaluación de similitud en producción.

Su relevancia actual radica en que la mayoría de los modelos de embeddings multilingües rinden por debajo de lo deseable en portugués brasileño, y este modelo se posiciona explícitamente frente al benchmark MTEB-BR, publicado por el mismo autor (arXiv:2607.04581). La licencia MIT y el formato estándar de `sentence-transformers` facilitan su adopción sin fricción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base), ajustado como sentence-transformer con mean pooling |
| Parametros totales | 108.923.136 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens máximo |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | Portugués (pt), con foco en portugués de Brasil (pt-BR) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con sentence-transformers y text-embeddings-inference) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder BERT base (12 capas, 768 dimensiones ocultas, 110M parámetros aproximados) heredado de BERTimbau, con pooling por media sobre los tokens de salida para producir un vector de 768 dimensiones. No se usa prefijo de instrucción. El entrenamiento se organizó en dos etapas: primero, un ajuste fino completo del modelo enmascarado de lenguaje con InfoNCE simétrico in-batch sobre 3.633 pares consulta–pasaje en portugués generados con Gemini, cubriendo dominios médico, legal, enciclopédico y web; los cuatro expertos de la familia parten de ese mismo codificador de etapa 1.

Este experto concreto se construye como una media uniforme (weight soup) de dos adaptadores LoRA con r=16. Uno se entrenó sobre NLI de PLUE con InfoNCE más un término de coincidencia de embeddings hacia las similitudes de EmbeddingGemma-300m; el otro se entrenó sobre PLUE más 33,7 mil filas multilingües de NLI de MoritzLaurer, sumando 286 mil filas en total. Los pesos LoRA se fusionan en el modelo completo, de modo que se carga como un `SentenceTransformer` estándar. El entrenamiento se ejecutó en GPUs A10G individuales en junio de 2026. No se documentan técnicas de decodificación especulativa ni atención lineal: es un encoder BERT convencional.

## Capacidades

- Generación de embeddings de frases de 768 dimensiones con normalización opcional (`normalize_embeddings=True`).
- Clasificación de pares de frases: implicación, contradicción, neutralidad y paráfrasis.
- Detección de duplicados y near-duplicates semánticos.
- Similitud semántica entre pares de textos en portugués de Brasil.
- Extracción de características (`feature-extraction`) para pipelines posteriores de clasificación o clustering.
- Compatible con `text-embeddings-inference` y con endpoints de Hugging Face.
- No soporta tool calling, agentes, visión ni audio: es un encoder puro de texto.
- Capacidad multilingüe limitada al portugués; no se documenta transferencia a otras lenguas.

## Casos de uso

- Deduplicación de catálogos y bases de datos: codificar pares de registros y aplicar un umbral sobre la similitud coseno para detectar duplicados en CRM, catálogos de producto o bases documentales en portugués brasileño, aprovechando la especialización del experto en clasificación de pares.
- Moderación de contenido y detección de paráfrasis: comparar un mensaje entrante con una lista de mensajes prohibidos o con variantes ya revisadas, usando el modelo como clasificador de pares para señalar coincidencias semánticas aunque cambie la redacción.
- Verificación de hechos y NLI en pipelines de RAG: dado un par (afirmación, pasaje recuperado), usar el modelo para estimar si el pasaje implica, contradice o es neutral respecto a la afirmación, como filtro previo a un LLM generador.
- Enrutamiento de tickets de soporte: comparar la consulta del usuario con descripciones canónicas de categorías y asignar la más próxima mediante similitud de embeddings, con la ventaja de que el modelo está afinado sobre datos de dominio médico, legal y web.
- Búsqueda semántica ligera en producción: con 109M de parámetros y ventana de 128 tokens, se puede desplegar en CPU o en una GPU pequeña para indexar y recuperar fragmentos cortos (títulos, resúmenes, preguntas frecuentes) sin el coste de un modelo grande.
- Evaluación de calidad de traducciones o resúmenes: comparar la salida generada con una referencia mediante similitud semántica de embeddings, útil para métricas automáticas en pipelines de evaluación en portugués.
- Clasificación zero-shot de textos cortos: usar la similitud entre el texto y descripciones de etiquetas como señal de clasificación cuando no hay datos etiquetados suficientes.

## Benchmarks y rendimiento

| Benchmark | Tarea | Resultado | Notas |
|---|---|---|---|
| MTEB-BR (versión de desarrollo, 16 tareas) | Pair classification (media de categoría) | 0,822 | Evaluado durante el desarrollo, sin split reservado; puede tener optimismo de selección |
| MTEB-BR (por, v1) | Media global (21 tareas) | no disponible para este experto | El leaderboard evalúa el modelo fusionado `brazembed-pt-br` (57,5) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible; el modelo es un encoder de embeddings y no un modelo generativo, por lo que esas métricas no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB (109M parámetros × 4 bytes); en fp16: aproximadamente 0,22 GB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A10G, A100, H100) para despliegues de alto throughput.
- Funciona en CPU para cargas moderadas; el repositorio ocupa 0,4 GB.
- Opciones de despliegue: `sentence-transformers`, `text-embeddings-inference` (tag `text-embeddings-inference` en el repo), endpoints de Hugging Face. No se documentan variantes GGUF ni soporte explícito de llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. Con 128 tokens de contexto y 109M de parámetros, se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brazembed-pt-br-pairclf | 108,9M | 128 tokens | Clasificación de pares / NLI en pt-BR | MIT | Hugging Face |
| brazembed-pt-br (modelo fusionado) | no disponible | no disponible | Uso general; MTEB-BR 57,5 | MIT | Hugging Face |
| neuralmind/bert-base-portuguese-cased (BERTimbau) | ~110M | 512 tokens (BERT base) | Modelo de lenguaje enmascarado, no es encoder de frases | MIT | Hugging Face |
| EmbeddingGemma-300m | ~300M | no disponible | Embeddings multilingües; usado como referencia de destilación en el entrenamiento de este experto | no disponible en la información | no disponible en la información |

La comparación directa con otros encoders de frases para portugués brasileño no está disponible en la información proporcionada; el propio autor remite a la familia BrazEmbed-PT-BR como referencia interna.

## Limitaciones y advertencias

- Ventana de contexto muy corta: 128 tokens. No es adecuado para documentos largos sin troceado previo.
- Especializado en clasificación de pares; para similitud semántica general o recuperación se recomienda usar los expertos `sts` o `retrieval` de la misma familia.
- Los resultados de 0,822 en pair classification provienen de una versión de desarrollo del benchmark MTEB-BR sin split reservado, por lo que pueden estar inflados por optimismo de selección.
- Solo portugués: no se ha validado su comportamiento en otras lenguas ni en variantes europeas del portugués.
- Riesgo de sesgo heredado de BERTimbau y de los corpus de entrenamiento (brWaC, PLUE, datos generados con Gemini), no cuantificado en la información disponible.
- No es un modelo generativo: no produce texto, por lo que no hay riesgo de alucinación en el sentido habitual, pero sí puede producir similitudes engañosas en pares léxicamente próximos y semánticamente distintos.
- Licencia MIT: permite uso comercial sin restricciones documentadas, pero conviene revisar las condiciones de los datos de entrenamiento de terceros (PLUE, MoritzLaurer) si se requiere trazabilidad legal.
- El modelo tiene 35 descargas y 0 likes en el momento de la consulta; es un artefacto reciente con poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tardellirs/brazembed-pt-br-pairclf
- Modelo fusionado de uso general: https://huggingface.co/tardellirs/brazembed-pt-br
- Experto en clasificación y clustering: https://huggingface.co/tardellirs/brazembed-pt-br-clfclu
- Experto en similitud semántica: https://huggingface.co/tardellirs/brazembed-pt-br-sts
- Experto en recuperación y reranking: https://huggingface.co/tardellirs/brazembed-pt-br-retrieval
- Repositorio con `route.py`: https://github.com/tardellirs/brazembed-pt-br/blob/main/route.py
- Leaderboard MTEB-BR: https://huggingface.co/spaces/MTEB-BR/leaderboard
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Paper MTEB-BR: arXiv:2607.04581
