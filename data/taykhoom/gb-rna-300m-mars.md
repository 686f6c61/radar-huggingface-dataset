# Taykhoom/GB.RNA-300M-MARS

## Resumen

GB.RNA-300M-MARS es un modelo de fundamento (foundation model) para ARN de 300 millones de parámetros, desarrollado originalmente por GenBio AI (Zou et al.) bajo el nombre AIDO.RNA y renombrado posteriormente a GB.RNA. La ficha que nos ocupa es un port independiente a Hugging Face mantenido por Taykhoom Dalal: reimplementa la arquitectura en `modeling_gbrna.py` y `configuration_gbrna.py` para que el checkpoint cargue con `transformers` sin necesidad del paquete ModelGenerator. Los pesos son idénticos a los del checkpoint original `genbio-ai/GB.RNA-300M-MARS`, con una verificación de paridad que sitúa la diferencia máxima en 2,62e-06 en la salida final.

Arquitectónicamente es un Transformer encoder pre-LN de 24 capas, 32 cabezas de atención, dimensión de embedding 1024, FFN SwiGLU de 2688 y embeddings posicionales RoPE, con un vocabulario de solo 16 tokens (nucleótidos individuales más tokens especiales). Se preentrenó con modelado de lenguaje enmascarado (MLM) sobre secuencias de ARN no codificante del corpus MARS, que según información pública asociada a la serie comprende unas 886 millones de secuencias.

Su relevancia es la de un encoder de tamaño medio-grande dentro de la familia GB.RNA: no genera texto ni secuencias de forma autorregresiva, sino que produce representaciones contextuales por nucleótido y por secuencia que se reutilizan como backbone en tareas downstream de anotación, clasificación y predicción estructural de ARN.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder pre-LN con MLP SwiGLU, RoPE y LayerNorm |
| Parámetros totales | 300.280.864 |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1024 tokens (truncación de entrenamiento); RoPE no impone límite duro, pero no hay evaluación documentada más allá de 1024 |
| Tipos de cuantización | no disponible (el repositorio solo distribuye safetensors; no hay GGUF, AWQ ni GPTQ publicados) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; vocabulario de 16 tokens de nucleótidos) |
| Licencia | GenBio AI Community License (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors, vía `transformers` con `trust_remote_code=True` (`custom_code`) |
| Capas | 24 |
| Cabezas de atención | 32 (dimensión por cabeza: 32) |
| Dimensión de embedding | 1024 |
| Dimensión oculta de la FFN | 2688 (SwiGLU) |
| Tamaño de vocabulario | 16 |
| Tokens del vocabulario | `[PAD]`, `[MASK]`, `[CLS]`, `[SEP]`, `[UNK]`, `A`, `G`, `C`, `T`, `U`, `N`, `[BOS]`, `[EOS]`, `[UNUSED1]`, `[UNUSED2]`, `[UNUSED3]` |
| Tamaño del repositorio | 1,2 GB |
| Descargas / likes | 10 / 0 |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer estándar con normalización previa (pre-LN), 24 bloques, 32 cabezas de atención y un MLP con activación SwiGLU de dimensión intermedia 2688. La posición se codifica con RoPE al 100 % (`rotary_percent=1.0`), lo que en teoría permite extrapolar más allá de la ventana de entrenamiento, aunque no hay evidencia publicada de que el modelo mantenga calidad por encima de los 1024 tokens. El vocabulario es deliberadamente mínimo (16 entradas) y tokeniza nucleótido a nucleótido, sin k-mers, de modo que la longitud de secuencia en nucleótidos coincide 1:1 con la longitud en tokens. El tokenizador normaliza `U`/`u` a `T`/`t`, igual que el preprocesamiento del checkpoint original.

El preentrenamiento sigue el objetivo de masked language modeling sobre secuencias de ARN no codificante del dataset MARS (la serie MARS se asocia públicamente a unas 886 millones de secuencias de ARN). No hay fase de RLHF ni DPO: no es un modelo conversacional ni alineado por preferencias, sino un encoder auto-supervisado. El port añade dos mejoras de implementación ausentes en la versión de GenBio AI: soporte de `attn_implementation="sdpa"` y `flash_attention_2`. La paridad numérica con el checkpoint original se verificó en GPU con PyTorch 2.7 / CUDA 12, comparando los 25 niveles de representación (embedding más 24 capas): máxima diferencia de 2,62e-04 en capas intermedias y 2,62e-06 en la salida final, absorbida por la LayerNorm terminal.

## Capacidades

- Generación de representaciones contextuales por token: `out.last_hidden_state` devuelve tensores de forma `(batch, seq_len, 1024)`.
- Embedding de secuencia vía token `[CLS]` (`out.last_hidden_state[:, 0, :]`), pensado como entrada a cabezas específicas de tarea.
- Acceso a los 25 niveles de representación (embedding más 24 capas) mediante `output_hidden_states=True`, útil para sondas por capa.
- Relleno de nucleótidos enmascarados: la cabeza MLM devuelve logits de forma `(batch, seq_len, 16)`.
- Puntuación de secuencias y variantes mediante log-verosimilitud de tokens concretos bajo el modelo enmascarado.
- Fine-tuning con convenciones estándar de Hugging Face para tareas a nivel de secuencia (clasificación, regresión) y a nivel de token (etiquetado).
- Inferencia por lotes con padding y atención optimizada (SDPA o FlashAttention-2).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni diálogo: no es un modelo instruido ni generativo autorregresivo.
- No hay capacidades multilingües en sentido lingüístico; el "alfabeto" se limita a `A`, `C`, `G`, `T`, `U`, `N` y tokens especiales.

## Casos de uso

- Clasificación de familias de ARN no codificante: extraer el embedding `[CLS]` de 1024 dimensiones y entrenar una regresión logística o una cabeza MLP ligera encima; con 300M de parámetros ygeladas las capas del encoder, el coste de entrenamiento es de minutos en una única GPU consumer.
- Búsqueda de similitud y agrupamiento a escala de millones de secuencias: indexar los vectores `[CLS]` en FAISS o Annoy para deduplicar catálogos de ncRNA o detectar secuencias casi idénticas sin necesidad de alineamiento múltiple.
- Anotación funcional de ARN: usar los embeddings por token como entrada a una cabeza de etiquetado de secuencia para predecir regiones funcionales, motivos de unión o dominios estructurados, aprovechando que el modelo expone los 25 niveles de representación para elegir la capa más informativa por tarea.
- Predicción de estructura secundaria y contactos: combinar los embeddings por posición con una cabeza de atención sobre pares o una red convolucional 1D; el modelo está preentrenado sobre ncRNA, donde la estructura es la señal funcional dominante.
- Puntuación de variantes y mutaciones: calcular la variación de log-verosimilitud de un nucleótido bajo la cabeza MLM antes y después de una mutación puntual, como heurística de priorización en paneles de ARN no codificante.
- Relleno de huecos en secuencias incompletas: enmascarar posiciones desconocidas con `[MASK]` y leer los logits para imputar el nucleótido más probable, útil en pipelines de curado de datos.
- Filtro previo en pipelines de secuenciación: descartar lecturas de baja calidad o contaminantes comparando su embedding con centroides de referencia, antes de pasos más caros de alineamiento.
- Baseline de referencia en benchmarks de modelos de ARN: al ser un port fiel a un checkpoint publicado, sirve como punto de comparación reproducible frente a modelos de ARN de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta la verificación de paridad numérica con el checkpoint original (diferencia máxima de 2,62e-06 en la salida final y 2,62e-04 en capas intermedias), que es un control de fidelidad de la implementación, no una evaluación de calidad en tareas downstream.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 1,2 GB; en bf16/fp16: unos 600 MB; en int8: unos 300 MB. Hay que sumar activaciones y memoria del optimizador si se hace fine-tuning.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 o incluso GPUs de 4-6 GB para inferencia en bf16 con lotes pequeños.
- Inferencia viable en CPU para lotes moderados y secuencias de hasta 1024 tokens; el coste es cuadrático en longitud por la atención.
- Para fine-tuning completo con AdamW en mixed precision, 8-16 GB de VRAM son suficientes con lotes de 8-32 secuencias de 512-1024 tokens.
- Despliegue recomendado: `transformers` con `attn_implementation="sdpa"` o `"flash_attention_2"`; también exportable a ONNX Runtime o compilable con `torch.compile`.
- vLLM y TGI no aplican: no es un decoder generativo ni un modelo de chat. llama.cpp y Ollama no soportan esta arquitectura.
- Latencia y throughput estimados: no disponibles (el autor no publica mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Datos de preentrenamiento | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GB.RNA-1M-MARS | 1M | MARS ncRNA | 1024 | GenBio AI Community License | Port en HF (Taykhoom) |
| GB.RNA-25M-MARS | 25M | MARS ncRNA | 1024 | GenBio AI Community License | Port en HF (Taykhoom) |
| GB.RNA-300M-MARS | 300M | MARS ncRNA | 1024 | GenBio AI Community License | Port en HF (Taykhoom) |
| GB.RNA-650M | 650M | 42M ncRNA | 1024 | GenBio AI Community License | Port en HF (Taykhoom) |
| GB.RNA-650M-CDS | 650M | 42M ncRNA + CDS | 1024 | GenBio AI Community License | Port en HF (Taykhoom) |
| GB.RNA-1.6B | 1.6B | 42M ncRNA | 1024 | GenBio AI Community License | Port en HF (Taykhoom) |
| GB.RNA-1.6B-CDS | 1.6B | 42M ncRNA + CDS | 1024 | GenBio AI Community License | Port en HF (Taykhoom) |

La comparación natural es dentro de la propia familia: 300M-MARS es la variante grande de la serie MARS (preentrenada sobre el corpus MARS) y queda por debajo de las variantes base de 650M y 1.6B, que usan un corpus distinto de 42M secuencias de ncRNA y tienen versiones adaptadas a CDS. No se dispone de datos de benchmarks que permitan afirmar qué variante rinde mejor en tareas concretas; la elección entre MARS y base debería decidirse empíricamente. Frente a otros encoders de secuencias biológicas de tamaño comparable (por ejemplo Nucleotide Transformer o DNABERT-2) no se dispone de métricas en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo generativo: no produce secuencias de ARN nuevas de forma fiable ni mantiene conversaciones. Cualquier uso como "generador de secuencias" está fuera de su objetivo de entrenamiento.
- Riesgo de predicciones plausibles pero incorrectas en el relleno de nucleótidos: los logits MLM no incorporan incertidumbre calibrada ni restricciones biológicas (marco de lectura, estructura).
- El tokenizador normaliza `U` a `T`, de modo que el modelo no distingue uracilo de timina; no debe esperarse que capture señales específicas de ARN (modificaciones, desoxinucleótidos frente a ribonucleótidos) a nivel de token.
- Ventana de 1024 tokens: con tokenización 1:1 nucleótido/token, las secuencias más largas se truncan o requieren estrategias de ventana deslizante. Aunque RoPE no impone un límite duro, no hay evaluación de extrapolación.
- Sesgo de dominio: el preentrenamiento MARS se centra en ARN no codificante; el comportamiento en ARN codificante, regiones genómicas con intrones o secuencias sintéticas no está caracterizado en esta variante.
- Vocabulario mínimo: no hay k-mers, así que el contexto efectivo por capa es corto en comparación con modelos que tokenizan con k-meros de 3-6; el coste computacional por base es mayor.
- `trust_remote_code=True` es obligatorio para cargar el modelo: implica ejecutar código Python del repositorio. Conviene fijar una revisión concreta (`revision=<commit>`) y auditar `modeling_gbrna.py` antes de usarlo en producción.
- Licencia GenBio AI Community License: no es una licencia open source estándar; hay que revisar los términos concretos para uso comercial, redistribución de derivados y despliegue como servicio.
- Port comunitario, no oficial: 10 descargas y 0 likes en el momento de la consulta, sin revisión por pares ni benchmarks publicados. La garantía de calidad se limita a la verificación de paridad numérica.
- Nombre cambiado: el repositorio era antes `Taykhoom/AIDO.RNA-300M-MARS`; las referencias antiguas redirigen, lo que puede romper scripts que fijen el id anterior.
- No hay versiones cuantizadas publicadas: quien necesite int8 o 4 bits tendrá que cuantizar por su cuenta y validar la degradación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Taykhoom/GB.RNA-300M-MARS
- Colección GB.RNA del port: https://huggingface.co/collections/Taykhoom/gbrna-6a22fe2e4039c523bcc48de9
- Repositorio original ModelGenerator (GenBio AI): https://github.com/genbio-ai/ModelGenerator
- Tutoriales de los modelos de fundamento de GenBio AI: https://github.com/genbio-ai/GB-Foundations-Tutorials/tree/main
- Artículo de referencia (Zou et al., bioRxiv 2024): https://doi.org/10.1101/2024.11.28.625345
- Página del mantenedor del port: https://taykhoomdalal.github.io/
- Ficha previa del modelo (redirección desde AIDO.RNA): https://huggingface.co/Taykhoom/AIDO.RNA-300M-MARS
