# tardellirs/brazembed-pt-br-clfclu

## Resumen

brazembed-pt-br-clfclu es un modelo de embeddings de frases especializado en tareas de clasificación y clustering para portugués de Brasil. Lo desarrolla tardellirs (Tardelli Ronan Coelho Stekel) como uno de los cuatro expertos que componen la familia BrazEmbed-PT-BR, y se construye sobre BERTimbau (neuralmind/bert-base-portuguese-cased), el BERT brasileño preentrenado por NeuralMind sobre el corpus brWaC. El modelo resuelve la necesidad de representaciones vectoriales densas de alta calidad para texto en pt-BR, un idioma con menos cobertura que el inglés en el ecosistema de embeddings.

Arquitectónicamente es un transformer BERT-base con 108,9 millones de parámetros, salida de 768 dimensiones, mean pooling y una ventana máxima de 128 tokens, sin prefijo de instrucción. La innovación principal no está en la arquitectura sino en el pipeline de entrenamiento: un ajuste fino simétrico con InfoNCE sobre pares generados por Gemini, seguido de una "weight soup" al 50/50 entre el encoder de la etapa 1 y un adaptador LoRA (r=16) entrenado sobre PLUE NLI con enmascaramiento de negativos falsos mediante EmbeddingGemma-300m.

Es relevante ahora porque forma parte de un esfuerzo más amplio (el benchmark MTEB-BR, arXiv:2607.04581) por dotar al portugués brasileño de infraestructura de evaluación y modelos de embeddings propia. Su licencia MIT y su compatibilidad con sentence-transformers y text-embeddings-inference lo hacen directamente desplegable en producción sin fricción legal ni técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base (encoder bidireccional) |
| Parametros totales | 108.923.136 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; cuantizacion a int8/fp16 posible via herramientas estandar, no documentada por el autor) |
| Idiomas soportados | Portugues (pt), con enfasis en portugues de Brasil (pt-BR) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con sentence-transformers y text-embeddings-inference) |

## Arquitectura y entrenamiento

El modelo es un encoder BERT-base estándar de 12 capas y 768 dimensiones ocultas, inicializado desde BERTimbau. El pooling es mean pooling sobre los tokens de salida, y las embeddings resultantes se normalizan (normalize_embeddings=True en el ejemplo de uso). No emplea prefijos de instrucción ni arquitecturas híbridas: es un dense retrieval encoder clásico.

El entrenamiento se estructuró en dos etapas. En la etapa 1, BERTimbau se ajustó completamente con InfoNCE simétrico in-batch sobre 3.633 pares query-passage en portugués generados con Gemini, cubriendo dominios médico, legal, enciclopédico y web; este encoder es el punto de partida común de los cuatro expertos de la familia. Para este experto concreto, se entrenó un adaptador LoRA de rango 16 con InfoNCE sobre PLUE NLI (252.000 tripletas), usando EmbeddingGemma-300m para enmascarar negativos in-batch falsos. Dado que aplicar el adaptador a plena intensidad degradaba el clustering, el autor combinó el encoder de etapa 1 y el adaptador mediante una media ponderada uniforme 50/50 ("weight soup"). Los pesos LoRA se fusionan en el modelo final, de modo que se carga como un SentenceTransformer convencional. El entrenamiento se ejecutó en GPUs A10G individuales en junio de 2026.

## Capacidades

- Generación de embeddings de frases de 768 dimensiones para texto en portugués de Brasil.
- Clasificación de texto por similitud semántica en espacio vectorial (la tarea para la que está especializado).
- Clustering de documentos y agrupamiento semántico no supervisado.
- Similitud semántica entre pares de frases (capacidad secundaria, no es su especialidad).
- Soporte de similitud coseno tras normalización de embeddings.
- Compatible con text-embeddings-inference y endpoints compatibles.
- Sin soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio: es un encoder puro de representación, no un modelo generativo.
- Capacidad multilingüe limitada al portugués; no se documenta rendimiento en otros idiomas.

## Casos de uso

- Clasificación de tickets de soporte: se generan embeddings de cada ticket entrante y se comparan contra centroides de categorías predefinidas (facturación, técnico, cancelación) para enrutamiento automático. La especialización del experto en clasificación y su ventana de 128 tokens encajan con descripciones cortas de incidencias.
- Deduplicación y agrupamiento de noticias: se embeben titulares y entradillas de medios brasileños y se aplica clustering (por ejemplo, HDBSCAN) sobre los vectores normalizados para detectar historias duplicadas entre fuentes.
- Moderación de comentarios: clasificación de comentarios de usuarios en categorías de toxicidad o spam mediante similitud con prototipos etiquetados, aprovechando la geometría de clustering preservada por la weight soup.
- Segmentación de base de clientes por comportamiento textual: agrupamiento de reseñas de productos o encuestas de satisfacción en portugués para descubrir temas latentes sin etiquetas.
- Organización de catálogos documentales: clustering de abstracts o metadatos de documentos jurídicos o médicos en portugués para taxonomías automáticas.
- Filtrado previo en pipelines RAG: clasificación de chunks recuperados por temática antes de pasarlos a un generador, usando el experto como clasificador de dominio (aunque para retrieval puro el autor recomienda el experto retrieval).
- Análisis de encuestas abiertas: agrupamiento de respuestas de texto libre en portugués para síntesis cualitativa a escala.

## Benchmarks y rendimiento

Datos publicados por el autor sobre la versión de desarrollo de 16 tareas de MTEB-BR (promedios por categoría):

| Tarea | Resultado |
|---|---|
| Classification | 0.748 |
| Clustering | 0.659 |

El autor advierte explícitamente que el desarrollo iteró contra ese benchmark sin split de validación reservado, por lo que estas cifras conllevan cierto optimismo de selección. El leaderboard público MTEB-BR (por, v1) de 21 tareas evalúa el modelo fusionado brazembed-pt-br (MTEB-BR 57.5), no este experto individual. No se han publicado resultados de benchmarks para este experto concreto en el leaderboard oficial ni comparaciones numéricas con modelos alternativos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB de pesos, más overhead de activaciones; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En fp16: aproximadamente 0,22 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para alto throughput en servidor, A10G, L4, A100 o H100.
- Cabe en GPU consumer y también en CPU para cargas moderadas (el modelo se entrenó en A10G individuales, lo que da idea de su ligereza).
- Opciones de despliegue: sentence-transformers (nativo), text-embeddings-inference (soporte declarado vía tag text-embeddings-inference), y endpoints compatibles. No se documenta soporte GGUF ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Enfoque |
|---|---|---|---|---|---|
| brazembed-pt-br-clfclu | 108,9 M | 128 tokens | 768 | MIT | Experto en clasificación/clustering pt-BR |
| brazembed-pt-br (fusion) | no disponible (merge de 4 expertos) | 128 tokens (presumible) | 768 (presumible) | MIT | Modelo generalista pt-BR, MTEB-BR 57.5 |
| neuralmind/bert-base-portuguese-cased (BERTimbau) | 110 M | 512 tokens | 768 | no disponible en la información | MLM base, sin entrenamiento de similitud |
| EmbeddingGemma-300m | 300 M | no disponible en la información | no disponible en la información | no disponible en la información | Embeddings multilingües, usado como filtro de negativos |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada, salvo la cifra MTEB-BR 57.5 del modelo fusionado de la misma familia.

## Limitaciones y advertencias

- Ventana de contexto muy corta: 128 tokens. Textos más largos deben truncarse o dividirse, lo que puede perder información semántica.
- Especializado en clasificación y clustering; para similitud semántica pura o retrieval el autor recomienda explícitamente usar los otros expertos de la familia.
- Solo portugués: no se documenta rendimiento en otros idiomas y no debe asumirse transferencia multilingüe.
- Las métricas de MTEB-BR de desarrollo (Classification 0.748, Clustering 0.659) se obtuvieron iterando sin split reservado, por lo que pueden estar infladas por sesgo de selección.
- Riesgo de alucinación no aplica en sentido generativo (es un encoder), pero sí existe riesgo de similitudes espurias en el espacio vectorial, especialmente con textos fuera de dominio.
- Sesgos: no se documentan análisis de sesgo; al derivar de BERTimbau (entrenado sobre brWaC), puede heredar sesgos del corpus web brasileño.
- Licencia MIT permite uso comercial sin restricciones conocidas, pero conviene verificar la licencia del modelo base BERTimbau, no detallada en la información disponible.
- El modelo tiene muy poca tracción (52 descargas, 0 likes al momento de la ficha); no hay validación independiente de la comunidad.
- No se documentan cuantizaciones oficiales ni formato GGUF, lo que limita el despliegue en entornos de solo CPU con llama.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tardellirs/brazembed-pt-br-clfclu
- Modelo fusionado de la familia: https://huggingface.co/tardellirs/brazembed-pt-br
- Experto en pair classification / NLI: https://huggingface.co/tardellirs/brazembed-pt-br-pairclf
- Experto en similitud semántica: https://huggingface.co/tardellirs/brazembed-pt-br-sts
- Experto en retrieval y reranking: https://huggingface.co/tardellirs/brazembed-pt-br-retrieval
- Repositorio con route.py: https://github.com/tardellirs/brazembed-pt-br/blob/main/route.py
- Leaderboard MTEB-BR: https://huggingface.co/spaces/MTEB-BR/leaderboard
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Paper MTEB-BR: arXiv:2607.04581
