# Taykhoom/GB.RNA-1.6B

## Resumen

GB.RNA-1.6B es un modelo de lenguaje de proteínas... no: es un **encoder transformer** (masked language model) entrenado sobre secuencias de ARN no codificante, no un modelo generativo de lenguaje natural. Lo desarrolla GenBio AI (Zou et al.) como parte de la familia AIDO/GB.RNA, y esta ficha concreta es un port independiente a HuggingFace mantenido por Taykhoom Dalal que carga sin el paquete `ModelGenerator`. Con 1.611.626.528 parámetros, es la variante base más grande de la familia GB.RNA.

El modelo resuelve el problema de obtener representaciones (embeddings) y puntuaciones de probabilidad para secuencias de ARN, de modo que sirva como backbone para tareas downstream de comprensión de ARN: predicción de estructura secundaria, anotación funcional, clasificación de familias, etc. Su relevancia práctica está en que elimina la dependencia del código original de GenBio AI (que requiere `ModelGenerator`) y añade soporte para `sdpa` y `flash_attention_2`, con verificación de paridad numérica frente a los pesos originales.

Arquitectura pre-LN Transformer con 32 capas, dimensión 2048, 32 cabezas, MLP SwiGLU y RoPE; vocabulario de 16 tokens sobre alfabeto de nucleótidos. Se entrenó con objetivo MLM sobre 42 millones de secuencias de ARN no codificante. La longitud de secuencia usada en entrenamiento es 1024 tokens, aunque RoPE no impone un límite duro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer pre-LN encoder-only (masked language model), MLP SwiGLU, RoPE |
| Parametros totales | 1.611.626.528 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (truncamiento en entrenamiento; RoPE sin límite duro declarado) |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni int8) |
| Idiomas soportados | no aplica: vocabulario de 16 tokens de nucleótidos (`A`, `G`, `C`, `T`, `U`, `N` y tokens especiales), no es un modelo de lenguaje natural |
| Licencia | GenBio AI Community License (etiquetada como `other`; ver `LICENSE` en el repositorio) |
| Formato de pesos | safetensors |
| Capas | 32 |
| Cabezas de atencion | 32 |
| Dimension de embedding | 2048 |
| Dimension oculta FFN | 5440 (SwiGLU) |
| Normalizacion | LayerNorm (pre-LN) |
| Tamano de vocabulario | 16 |
| Parametros posicionales | RoPE (`rotary_percent=1.0`) |
| Tamano del repositorio | 12,9 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder pre-LN de 32 capas y 32 cabezas de atención, con dimensión de embedding 2048, FFN de 5440 unidades con activación SwiGLU, LayerNorm y embeddings posicionales rotatorios RoPE aplicados al 100 % de las dimensiones de cabeza. El vocabulario es deliberadamente mínimo (16 entradas: `[PAD]`, `[MASK]`, `[CLS]`, `[SEP]`, `[UNK]`, `A`, `G`, `C`, `T`, `U`, `N`, `[BOS]`, `[EOS]` y tres tokens sin uso), lo que implica tokenización a nivel de nucleótido en lugar de k-mers. La entrada debe usar notación de ADN (`A`, `C`, `G`, `T`); el tokenizador normaliza `U`/`u` a `T`/`t` porque el vocabulario trata ambas como entradas distintas.

El preentrenamiento usa modelado de lenguaje enmascarado (MLM) sobre 42 millones de secuencias de ARN no codificante, partiendo del checkpoint `genbio-ai/GB.RNA-1.6B`. No se documentan en la información disponible detalles sobre número total de tokens procesados, composición taxonómica del corpus ni si hubo fases de ajuste posteriores (RLHF/DPO no aplican a un encoder MLM). La innovación principal de este repositorio concreto no es arquitectónica sino de empaquetado: reimplementación autocontenida en `modeling_gbrna.py` y `configuration_gbrna.py`, soporte añadido de `attn_implementation="sdpa"` y `"flash_attention_2"` (ausentes en la implementación original) y verificación de paridad numérica capa a capa frente a los pesos de GenBio AI.

## Capacidades

- Extracción de embeddings a nivel de secuencia (token `[CLS]`, vector de 2048 dimensiones) y a nivel de token (salida `last_hidden_state` de forma `batch × seq_len × 2048`).
- Acceso a estados ocultos intermedios de las 32 capas más el embedding, útil para probing por capa y para tareas que rinden mejor con representaciones intermedias.
- Predicción MLM: logits sobre el vocabulario de 16 tokens para enmascarar y reconstruir posiciones concretas de una secuencia.
- Backbone ajustable con convenciones estándar de HuggingFace para añadir cabezas específicas de tarea.
- Capacidad de modelar contexto local y de medio alcance en ARN no codificante (hasta 1024 nucleótidos por secuencia).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto libre: es un encoder MLM, no un modelo instruccional.
- No soporta capacidad multilingüe en el sentido habitual; su "alfabeto" es el de nucleótidos.
- La variante hermana GB.RNA-1.6B-CDS está adaptada a secuencias codificantes (CDS), lo que cubre el caso de ARNm y regiones codificantes.

## Casos de uso

- Predicción de estructura secundaria de ARN: el repositorio oficial de GenBio AI incluye un experimento específico de `rna_secondary_structure_prediction` que ajusta GB.RNA-1.6B sobre los splits de entrenamiento; el modelo aporta representaciones contextuales de la secuencia que alimentan una cabeza de predicción de pares de bases.
- Anotación funcional de ARN no codificante: extraer el embedding `[CLS]` de cada secuencia y entrenar un clasificador lineal o MLP para asignar familia o término ontológico, aprovechando que el modelo se preentrenó sobre 42M de ncRNA.
- Búsqueda y agrupamiento por similitud semántica: usar los embeddings de 2048 dimensiones como índice vectorial para deduplicar, agrupar o recuperar secuencias similares funcionalmente aunque difieran a nivel de secuencia.
- Puntuación de variantes y mutaciones: enmascarar la posición de interés y comparar la log-probabilidad del nucleótido original frente al mutado (pseudo-verosimilitud MLM) para priorizar variantes con impacto estructural o funcional.
- Extracción de características para pipelines de ARN de alto rendimiento: generar representaciones por lotes de forma offline y servir un modelo downstream ligero, reduciendo el coste de inferencia en producción.
- Fine-tuning para tareas de regulación y procesamiento: sitios de splicing, edición de ARN, modificación de bases o regiones 5'/3' UTR, usando el backbone con contexto de 1024 nucleótidos.
- Modelado de regiones codificantes: empleando la variante GB.RNA-1.6B-CDS cuando el input sean CDS y se requiera sensibilidad a estructura de codones y marco de lectura.
- Inicialización de modelos más pequeños por destilación o poda: al ser la variante más grande de la familia, sirve de profesor para las versiones de 650M o 300M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K y equivalentes no aplican a un encoder de ARN; no se aportan métricas de tareas de ARN como F1 en estructura secundaria o matriz de correlación de embeddings).

El único dato cuantitativo disponible es la verificación de paridad numérica frente al checkpoint original `genbio-ai/GB.RNA-1.6B`, comparando los 33 niveles de representación (embedding más 32 capas):

| Nivel de representacion | Diferencia maxima observada |
|---|---|
| Salida final | 6,03e-06 |
| Capas intermedias | 6,87e-05 |
| Niveles comparados | 33 (embedding + 32 capas) |

La verificación se realizó en GPU con PyTorch 2.7 y CUDA 12; el autor atribuye las diferencias intermedias a ruido de acumulación en coma flotante que la LayerNorm final normaliza.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan unos 6,4 GB; en bf16/fp16 unos 3,2 GB; en int8 unos 1,6 GB. Añadir memoria para activaciones, que crecen de forma aproximadamente lineal con `batch × 1024 × 2048`.
- GPU recomendadas: A100 40/80 GB o H100 para extracción de embeddings a gran escala con lotes grandes; L40S o A10G como opción de coste medio; RTX 4090 (24 GB) para desarrollo e inferencia bf16 con lotes moderados.
- Cabe en GPU de consumo: sí. RTX 4090/3090 (24 GB) en bf16 sin problemas; RTX 4080/4070 Ti (16 GB) en bf16 con lotes pequeños; RTX 3060 12 GB o RTX 4060 Ti 16 GB en bf16 con lotes de 1-8 secuencias; tarjetas de 8 GB requieren cuantización a int8 o fp16 con gradient checkpointing desactivado y lotes de 1.
- Despliegue: `transformers` con `trust_remote_code=True` es la vía soportada y documentada. El modelo acepta `attn_implementation="sdpa"` y `"flash_attention_2"`, lo que reduce el coste de atención frente a la implementación eager. No hay soporte documentado en vLLM, TGI, llama.cpp ni Ollama para este modelo: al ser un encoder MLM con código remoto propio y sin cabeza generativa, los stacks de serving generativo no son aplicables directamente.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens de nucleótido por segundo ni de latencia por lote.
- Nota de almacenamiento: el repositorio ocupa 12,9 GB, muy por encima de los ~6,4 GB que requieren los pesos en fp32, probablemente por contener más de una copia de los pesos; conviene revisar los ficheros antes de descargar.

## Comparativa con modelos similares

| Modelo | Parametros | Datos de entrenamiento | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GB.RNA-1.6B (esta ficha) | 1,6B | 42M ncRNA | 1024 | GenBio AI Community License | HuggingFace (port de Taykhoom); original en `genbio-ai/GB.RNA-1.6B` |
| GB.RNA-650M | 650M | 42M ncRNA | no disponible | GenBio AI Community License | HuggingFace |
| GB.RNA-1.6B-CDS | 1,6B | 42M ncRNA + CDS | no disponible | GenBio AI Community License | HuggingFace |
| GB.RNA-300M-MARS | 300M | MARS ncRNA | no disponible | GenBio AI Community License | HuggingFace |

Criterio de elección dentro de la familia, según la propia model card: GB.RNA-1.6B es la variante base más grande y debe usarse cuando la calidad del embedding importa más que la velocidad; GB.RNA-650M es el compromiso para inferencia más rápida con el mismo corpus; GB.RNA-1.6B-CDS es la opción cuando el input son secuencias codificantes; las variantes MARS (1M, 25M, 300M) cubren escenarios de muy bajo coste computacional.

No se dispone en la información proporcionada de datos verificados de otros modelos de ARN de propósito general (por ejemplo Nucleotide Transformer o DNABERT-2) que permitan una comparación numérica fiable; no se incluyen cifras para no especular.

## Limitaciones y advertencias

- No es un modelo generativo ni conversacional: no sigue instrucciones, no mantiene diálogos y no produce texto. Cualquier uso como "chat" es un error de categoría.
- El vocabulario está restringido a nucleótidos; no procesa lenguaje natural ni texto libre. Introducir caracteres fuera del alfabeto produce `[UNK]`.
- La tokenización es a nivel de nucleótido y el modelo espera notación de ADN: si se introducen `U` sin normalizar, el tokenizador las convierte a `T`, lo que puede alterar silenciosamente la semántica de secuencias de ARN que se pretendían distinguir.
- El truncamiento de entrenamiento es de 1024 tokens; secuencias más largas requieren estrategias de ventana o pooling, y el comportamiento más allá de esa longitud no está validado aunque RoPE no imponga un límite duro.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero las predicciones MLM son probabilísticas y no deben interpretarse como anotaciones biológicas verificadas sin validación experimental.
- Sesgos: no documentados en la información disponible. El corpus de 42M de ncRNA no detalla composición taxonómica ni balance entre tipos de ARN, por lo que el rendimiento puede degradarse en organismos o clases subrepresentadas.
- Licencia: GenBio AI Community License, etiquetada como `other`. No es una licencia OSI y la información disponible no detalla los términos de uso comercial; es imprescindible leer `LICENSE` en el repositorio antes de cualquier despliegue en producción.
- Requiere `trust_remote_code=True`: se ejecuta código Python del autor del port (`modeling_gbrna.py`, `configuration_gbrna.py`). Conviene auditar esos ficheros y fijar una revisión concreta antes de usarlo en entornos productivos.
- Adopción muy baja (11 descargas, 0 likes en el momento de la consulta) y mantenido por un tercero, no por GenBio AI: la paridad numérica está verificada, pero no hay garantía de soporte continuado ni de actualizaciones alineadas con el repositorio upstream.
- El tamaño del repositorio (12,9 GB) no coincide con el de una única copia de los pesos, lo que puede encarecer el almacenamiento y la descarga en pipelines automatizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Taykhoom/GB.RNA-1.6B
- Colección GB.RNA: https://huggingface.co/collections/Taykhoom/gbrna-6a22fe2e4039c523bcc48de9
- Checkpoint original: `genbio-ai/GB.RNA-1.6B` (referenciado en la model card)
- Variante CDS: https://huggingface.co/Taykhoom/GB.RNA-1.6B-CDS
- Variante 650M: https://huggingface.co/Taykhoom/GB.RNA-650M
- Variante 650M-CDS: https://huggingface.co/Taykhoom/GB.RNA-650M-CDS
- Variante 300M-MARS: https://huggingface.co/Taykhoom/GB.RNA-300M-MARS
- Variante 25M-MARS: https://huggingface.co/Taykhoom/GB.RNA-25M-MARS
- Variante 1M-MARS: https://huggingface.co/Taykhoom/GB.RNA-1M-MARS
- Repositorio de código original (ModelGenerator): https://github.com/genbio-ai/ModelGenerator
- Experimento de estructura secundaria de ARN: https://github.com/genbio-ai/ModelGenerator/tree/main/experiments/GB.RNA/rna_secondary_structure_prediction
- README de experimentos GB.RNA: https://github.com/genbio-ai/ModelGenerator/blob/main/experiments/GB.RNA/README.md
- Paper (OpenReview): https://openreview.net/pdf?id=Gzo3JMPY8w
- Paper (bioRxiv, doi 10.1101/2024.11.28.625345): https://doi.org/10.1101/2024.11.28.625345
