# Taykhoom/GB.RNA-1M-MARS

## Resumen

GB.RNA-1M-MARS es un modelo de lenguaje de secuencias de ARN de 1.152.928 parámetros, el miembro más pequeño de la serie MARS de GenBio AI. No es un modelo de lenguaje natural: opera sobre un vocabulario de 16 tokens que codifica nucleótidos (A, C, G, T, U, N) más tokens especiales, y se entrenó con el objetivo de *masked language modeling* (MLM) sobre secuencias de ARN no codificante del dataset MARS. El repositorio analizado es un port independiente mantenido por Taykhoom Dalal (estudiante de doctorado en Memorial Sloan Kettering / Cornell) que reproduce los pesos originales de `genbio-ai/GB.RNA-1M-MARS` sin necesidad de instalar el paquete ModelGenerator.

El modelo resuelve un problema de infraestructura más que de rendimiento: permite cargar el checkpoint original con `transformers` estándar, sin la dependencia de `genbio-ai/ModelGenerator`, y añade soporte para `attn_implementation="sdpa"` y `"flash_attention_2"`, que la implementación upstream no ofrecía. La verificación de paridad incluida en la model card reporta una diferencia máxima de 1,65e-05 en la salida final respecto al checkpoint original, validada con `torch.allclose(atol=1e-5, rtol=1e-5)`.

Su relevancia es acotada y muy específica: sirve como baseline mínimo, como herramienta docente y como modelo de pruebas en pipelines bioinformáticos donde no se dispone de GPU. Con 1,15 M de parámetros no compite en calidad de representación con las variantes de 25 M, 300 M o 650 M de la misma familia. Nótese que GenBio AI renombró AIDO.RNA a GB.RNA; el repositorio se llamaba antes `Taykhoom/AIDO.RNA-1M-MARS` y ese identificador redirige al actual, con pesos idénticos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer pre-LN (encoder), MLP SwiGLU, RMSNorm, RoPE con `rotary_percent=1.0` |
| Parámetros totales | 1.152.928 (medido en safetensors) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1024 tokens (truncamiento de entrenamiento; RoPE no impone límite duro) |
| Tipos de cuantización | no disponible; no se han publicado pesos cuantizados (con 1,15 M de parámetros la cuantización es innecesaria) |
| Idiomas soportados | no disponible; no procesa lenguaje natural. Alfabeto de 16 tokens: `[PAD]`, `[MASK]`, `[CLS]`, `[SEP]`, `[UNK]`, `A`, `G`, `C`, `T`, `U`, `N`, `[BOS]`, `[EOS]`, `[UNUSED1]`, `[UNUSED2]`, `[UNUSED3]` |
| Licencia | GenBio AI Community License (etiqueta `other` en HuggingFace) |
| Formato de pesos | safetensors; requiere `trust_remote_code=True` |
| Capas | 6 |
| Cabezas de atención | 8 |
| Dimensión de embedding | 128 |
| Dimensión oculta de la FFN | 320 (SwiGLU) |
| Tamaño de vocabulario | 16 |
| Objetivo de entrenamiento | Masked language modeling (MLM) |
| Datos de preentrenamiento | secuencias de ARN no codificante (dataset MARS) |
| Checkpoint de origen | `genbio-ai/GB.RNA-1M-MARS` |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder pre-LN de 6 capas, 8 cabezas de atención, dimensión de modelo 128 y FFN de 320 unidades con activación SwiGLU, normalización RMSNorm y embeddings posicionales rotatorios RoPE aplicados al 100 % de las dimensiones. El vocabulario de 16 entradas es suficiente para representar las cuatro bases de ADN, el uracilo del ARN, bases ambiguas (`N`) y los tokens estructurales habituales de BERT (`[CLS]`, `[SEP]`, `[MASK]`, `[PAD]`). El modelo se preentrenó con el objetivo MLM sobre secuencias de ARN no codificante del corpus MARS, siguiendo la receta de la familia GB.RNA descrita en Zou et al. (2024).

Un detalle de implementación importante: el tokenizador normaliza `U`/`u` a `T`/`t`, de modo que las secuencias de ARN se introducen en notación de ADN y la distinción química entre uracilo y timina se pierde en la tokenización. La model card advierte explícitamente que la entrada debe usar notación de ADN (`A`, `C`, `G`, `T`) y que la conversión de `U` a `T` debe hacerse antes de tokenizar, porque el vocabulario trata ambos caracteres como entradas distintas. El port incorpora `attn_implementation="sdpa"` y `"flash_attention_2"` como novedad respecto al código original de genbio-ai, junto con una separación limpia de la lógica en `modeling_gbrna.py` y `configuration_gbrna.py`. La verificación de paridad compara las representaciones ocultas en los 7 niveles (embedding más 6 capas) contra los pesos upstream, con una diferencia máxima de 2,57e-05 en capas intermedias y 1,65e-05 en la salida final (PyTorch 2.7 / CUDA 12).

No se especifica en la información disponible el número de tokens de entrenamiento, la composición detallada del corpus MARS, ni si hubo fases de RLHF o DPO (extremadamente improbable en un modelo de este tipo y tamaño).

## Capacidades

- Generación de representaciones (*embeddings*) a nivel de secuencia mediante el token `[CLS]` (vector de 128 dimensiones) y a nivel de nucleótido mediante los estados ocultos por posición.
- Predicción de nucleótidos enmascarados (MLM): devuelve logits de dimensión 16 por posición, utilizables para imputación o puntuación de variantes.
- Acceso a estados ocultos intermedios de las 6 capas mediante `output_hidden_states=True`, útil para sondas (*probing*) por capa.
- Ajuste fino supervisado con convenciones estándar de HuggingFace para tareas a nivel de secuencia o de token.
- Extracción de características para similitud, clustering y búsqueda aproximada de secuencias de ARN.
- Soporte de atención eficiente vía SDPA y FlashAttention-2.
- No soporta *tool calling*, ni *function calling*, ni razonamiento multi-paso, ni modo *thinking*, ni agentes.
- No soporta generación autoregresiva de texto ni instrucciones: es un encoder MLM, no un modelo causal.
- No tiene capacidades multilingües en sentido natural; su "idioma" es el alfabeto de nucleótidos.
- No dispone de visión ni audio.

## Casos de uso

- Extracción de embeddings de ARN no codificante para búsqueda de similitud y deduplicación: se pasa cada secuencia por el modelo y se toma el vector `[CLS]` de 128 dimensiones como firma; útil para agrupar transcritos candidatos en un pipeline de anotación antes de aplicar herramientas de alineamiento múltiple.
- Clasificación de familias de ncRNA mediante ajuste fino: se congela el encoder y se entrena una cabeza lineal sobre `last_hidden_state[:, 0, :]` con un conjunto etiquetado propio (por ejemplo, Rfam), aprovechando que el modelo ya viene preentrenado sobre ncRNA del corpus MARS.
- Imputación de bases en regiones de baja cobertura: enmascarando posiciones concretas con `[MASK]` y leyendo los logits de 16 clases se obtiene una distribución sobre bases posibles, útil como señal auxiliar para *gap filling* en ensamblajes o para detectar posiciones anómalas.
- Puntuación de variantes en regiones no codificantes: comparando la log-verosimilitud del alelo de referencia frente al alternativo en la posición enmascarada se obtiene una puntuación de plausibilidad que puede priorizar SNVs antes de validación experimental.
- Anotación de límites estructurales a nivel de token: usando los estados ocultos por posición como entrada a un clasificador por token (por ejemplo, CRF) se pueden aprender fronteras de dominios o regiones de apareamiento sin depender de plegamiento explícito.
- Test de integración en CI/CD de herramientas bioinformáticas: al ocupar unos pocos megabytes y ejecutarse en CPU, permite validar en cada *commit* que el pipeline de tokenización, carga de safetensors y formas de tensores sigue siendo correcto, sin necesidad de runners con GPU.
- Baseline de referencia en experimentos de ablación: comparar el rendimiento de tareas downstream contra las variantes de 25 M, 300 M y 650 M de la misma familia permite cuantificar cuánta capacidad aporta cada salto de escala con la misma receta de datos.
- Docencia y prototipado: permite mostrar en un portátil, en segundos, el ciclo completo tokenización de secuencias biológicas, MLM y extracción de embeddings de un transformer real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (ni MMLU, ni HumanEval ni métricas específicas de tareas de biología molecular como predicción de estructura o clasificación de familias). El único dato cuantitativo de validación es la comprobación de paridad numérica frente al checkpoint original de genbio-ai.

| Comprobación | Resultado |
|---|---|
| Niveles de representación comparados | 7 (embedding + 6 capas transformer) |
| Diferencia máxima en salida final | 1,65e-05 |
| Diferencia máxima en capas intermedias | 2,57e-05 |
| Criterio de tolerancia | `torch.allclose(atol=1e-5, rtol=1e-5)` |
| Entorno de verificación | GPU, PyTorch 2.7 / CUDA 12 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,6 MB para los pesos en fp32 y 2,3 MB en fp16/bf16; con activaciones para lotes moderados y secuencias de 1024 tokens el consumo total se mantiene por debajo de unas pocas decenas de megabytes.
- GPU recomendadas: ninguna en particular; el modelo es ejecutable en CPU. Cualquier GPU con soporte CUDA (RTX 3050, GTX 1650, T4, A100, H100) lo ejecuta sin cuello de botella de memoria.
- Cabe holgadamente en cualquier GPU de consumo, en GPUs integradas, en Apple Silicon vía MPS y, con total probabilidad, en dispositivos de placa única tipo Raspberry Pi (no verificado en la información disponible).
- Opciones de despliegue: `transformers` con PyTorch (ruta oficial documentada), `attn_implementation="sdpa"` o `"flash_attention_2"`. Exportación a ONNX no documentada. No hay soporte en vLLM, llama.cpp ni Ollama, ya que no es un modelo causal estándar y requiere `trust_remote_code=True`.
- Latencia y throughput: no disponibles. No se han publicado mediciones; por el tamaño del modelo se espera que un lote pequeño de secuencias de 1024 tokens se resuelva en el orden de milisegundos en CPU moderna, pero este dato no está verificado en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Datos | Contexto | Notas |
|---|---|---|---|---|
| GB.RNA-1M-MARS (este) | 1 M | ncRNA (MARS) | 1024 | Variante más pequeña de la serie MARS |
| GB.RNA-25M-MARS | 25 M | ncRNA (MARS) | no disponible | Variante MARS de tamaño medio |
| GB.RNA-300M-MARS | 300 M | ncRNA (MARS) | no disponible | Variante MARS grande |
| GB.RNA-650M | 650 M | 42 M ncRNA | no disponible | Modelo base de referencia de la familia |
| GB.RNA-650M-CDS | 650 M | 42 M ncRNA + CDS | no disponible | Adaptado a secuencias codificantes |
| GB.RNA-1.6B | 1,6 B | 42 M ncRNA | no disponible | Modelo base más grande |
| GB.RNA-1.6B-CDS | 1,6 B | 42 M ncRNA + CDS | no disponible | Mayor variante adaptada a CDS |

Fuera de la familia GB.RNA existen otros modelos de fundación para secuencias genómicas (DNABERT-2, Nucleotide Transformer, entre otros), pero no se dispone de datos verificados sobre ellos en la información proporcionada, por lo que no se incluye comparación numérica.

## Limitaciones y advertencias

- Capacidad muy limitada: 1,15 M de parámetros y dimensión oculta de 128. Las representaciones son previsiblemente mucho menos informativas que las de las variantes de 25 M o 300 M de la misma familia; no debe usarse como modelo de producción para predicción de estructura o función.
- Solo MLM: no genera secuencias de forma autoregresiva ni sigue instrucciones. Cualquier expectativa de uso conversacional o de agente es inaplicable.
- Sesgo de datos no caracterizado: la información disponible no detalla la composición taxonómica ni el balance de clases del corpus MARS, por lo que no se puede evaluar el sesgo hacia determinados organismos o familias de ARN.
- Riesgo de predicciones mal calibradas: los logits del MLM no están calibrados como probabilidades y pueden asignar confianza alta a bases incorrectas, especialmente en contextos ausentes del corpus de entrenamiento.
- Pérdida de la distinción uracilo/timina: la normalización `U` → `T` del tokenizador impide al modelo distinguir químicamente ARN de ADN; no es adecuado para bases modificadas ni para análisis que dependan de esa diferencia.
- Límite práctico de contexto: 1024 tokens por truncamiento de entrenamiento. Aunque RoPE no impone un límite duro, no se ha validado el comportamiento más allá de esa longitud.
- Licencia no OSI: GenBio AI Community License, etiquetada como `other`. Las condiciones exactas de uso comercial no están recogidas en la información disponible; es imprescindible revisar el fichero `LICENSE` antes de cualquier despliegue productivo.
- `trust_remote_code=True` obligatorio: implica ejecutar código Python del repositorio, lo que supone un riesgo de seguridad en entornos no auditados.
- Validación comunitaria mínima: 10 descargas y 0 *likes* en el momento de la consulta; el port no ha sido revisado de forma independiente más allá de la verificación de paridad del autor.
- Repositorio de tamaño 0,0 GB (redondeo): los pesos son de pocos megabytes, pero conviene verificar la integridad de los ficheros safetensors en la primera descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Taykhoom/GB.RNA-1M-MARS
- Checkpoint original de GenBio AI: https://huggingface.co/genbio-ai/GB.RNA-1M-MARS
- Identificador anterior (redirige al actual): https://huggingface.co/Taykhoom/AIDO.RNA-1M-MARS
- Colección completa GB.RNA: https://huggingface.co/collections/Taykhoom/gbrna-6a22fe2e4039c523bcc48de9
- Repositorio ModelGenerator: https://github.com/genbio-ai/ModelGenerator
- Experimentos GB.RNA en ModelGenerator: https://github.com/genbio-ai/ModelGenerator/tree/main/experiments/GB.RNA
- Artículo de referencia (bioRxiv, doi 10.1101/2024.11.28.625345): https://doi.org/10.1101/2024.11.28.625345
- Perfil del mantenedor del port en GitHub: https://github.com/TaykhoomDalal
- Perfil del mantenedor en Google Scholar: https://scholar.google.com/citations?user=4Hqu_RwAAAAJ&hl=en
