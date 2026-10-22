# Taykhoom/GB.RNA-1.6B-CDS

## Resumen

GB.RNA-1.6B-CDS es un modelo fundacional de ARN de 1.611.626.528 parámetros, desarrollado originalmente por GenBio AI (Zou et al., bioRxiv 2024) y reempaquetado en HuggingFace por Taykhoom Dalal como un port independiente que elimina la dependencia del paquete `ModelGenerator`. Es la variante de mayor tamaño de la familia GB.RNA adaptada a secuencias codificantes (CDS, *coding sequences*), tras un preentrenamiento con enmascarado de tokens (MLM) sobre 42 millones de secuencias de ARN no codificante y un ajuste posterior sobre CDS.

No es un modelo generativo de lenguaje natural: es un encoder Transformer que opera sobre un vocabulario de 16 tokens de nucleótidos (`A`, `C`, `G`, `T`, `U`, `N` y tokens especiales), con una dimensión de embedding de 2048, 32 capas y 32 cabezas de atención. Su utilidad es servir como extractor de representaciones y como *backbone* para *fine-tuning* en tareas de biología computacional: predicción de estructura secundaria, anotación funcional, clasificación de familias de ARN o puntuación de variantes.

El interés actual del repositorio es práctico: el checkpoint original de `genbio-ai` exige `ModelGenerator` para cargarse, mientras que este port se integra limpiamente con `transformers` (`AutoModel`, `AutoModelForMaskedLM`), añade soporte para `sdpa` y `flash_attention_2` y verifica paridad numérica con los pesos originales (diferencia máxima de 4,02e-06 en la salida final). El modelo fue renombrado de AIDO.RNA a GB.RNA; los pesos son idénticos y el id antiguo redirige al nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder pre-LN con MLP SwiGLU y embeddings posicionales RoPE (`rotary_percent=1.0`) |
| Parametros totales | 1.611.626.528 (1,6B) |
| Parametros activos | No aplica: no es un modelo MoE (denso) |
| Longitud de contexto | 1024 tokens (truncamiento de entrenamiento; RoPE no impone un límite duro, pero no se ha validado más allá) |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales. Pesos en safetensors y conversión estándar a fp16/bf16/int8 viable con herramientas de `transformers`/PyTorch |
| Idiomas soportados | No aplica: no procesa lenguaje natural. Vocabulario de 16 tokens de nucleótidos (`[PAD]`, `[MASK]`, `[CLS]`, `[SEP]`, `[UNK]`, `A`, `G`, `C`, `T`, `U`, `N`, `[BOS]`, `[EOS]` y 3 `[UNUSED]`) |
| Licencia | `other` — GenBio AI Community License (heredera de la licencia del repositorio original) |
| Formato de pesos | `safetensors`; requiere `trust_remote_code=True` (código propio en `modeling_gbrna.py` y `configuration_gbrna.py`) |
| Capas | 32 |
| Cabezas de atencion | 32 |
| Dimension de embedding | 2048 |
| Dimension oculta del FFN | 5440 (SwiGLU) |
| Normalizacion | LayerNorm |
| Tamano del repositorio | 12,9 GB |
| Objetivo de entrenamiento | Masked language modeling (MLM) |

## Arquitectura y entrenamiento

La arquitectura es un Transformer encoder denso de tipo pre-LN, con 32 capas, 32 cabezas de atención, dimensión de modelo 2048 y un MLP con activación SwiGLU de dimensión oculta 5440. La codificación posicional usa RoPE con `rotary_percent=1.0`, es decir, rotación aplicada en todas las dimensiones de la cabeza, y la normalización es LayerNorm estándar. El vocabulario de 16 entradas refleja el alfabeto nucleotídico IUPAC reducido más los tokens estructurales de BERT (`[CLS]`, `[SEP]`, `[MASK]`, `[PAD]`), lo que sitúa al modelo en la estela de los encoders tipo BERT aplicados a secuencias biológicas.

El preentrenamiento se realizó con objetivo MLM sobre 42 millones de secuencias de ARN no codificante; el checkpoint aquí publicado corresponde además a un ajuste sobre secuencias codificantes (CDS), lo que lo orienta a regiones con marco de lectura. No se detalla en la información disponible el número exacto de tokens procesados, la composición fina del corpus, ni si hubo etapas de RLHF o DPO (no procede en un encoder MLM). La innovación diferencial del port no es arquitectónica sino de ingeniería: reimplementación autónoma del modelo sin `ModelGenerator`, tokenizador que normaliza `U`/`u` a `T`/`t` (el tokenizador original trata ambos como entradas distintas, de modo que la conversión debe hacerse antes de tokenizar) y soporte de `attn_implementation="sdpa"` y `"flash_attention_2"`, ausentes en la implementación de genbio-ai.

## Capacidades

- Generación de representaciones contextuales de secuencias de ARN: embeddings por token (`last_hidden_state`, forma `[batch, seq_len, 2048]`) y embedding de secuencia vía token `[CLS]` (`[batch, 2048]`).
- Acceso a estados ocultos intermedios con `output_hidden_states=True` (33 niveles: embedding más 32 capas), útil para *probing* y para seleccionar la capa óptima por tarea.
- Relleno de máscaras (MLM): dada una secuencia con `[MASK]`, devuelve logits sobre el vocabulario de 16 tokens, lo que permite puntuar la probabilidad de un nucleótido concreto en una posición.
- Extracción de características para *fine-tuning* supervisado con cabezas específicas de tarea (clasificación de secuencia, regresión, etiquetado por token).
- Adaptación específica a regiones codificantes (CDS), lo que lo hace preferible a la variante base en tareas sobre marcos de lectura.
- Procesamiento de ADN en notación `A`/`C`/`G`/`T` (con normalización previa de `U` a `T`).
- No soporta *tool calling*, ni razonamiento multi-paso, ni agentes, ni visión, ni audio, ni modo *thinking*: es un encoder, no un modelo generativo de instrucciones.

## Casos de uso

- Predicción de estructura secundaria de ARN: el modelo se usa como *backbone* y se ajusta con una cabeza sobre el conjunto de entrenamiento correspondiente; el repositorio oficial de ModelGenerator documenta explícitamente el uso de `modelgenerator.backbones.gb_rna_1b600m_cds` como extractor para esta tarea, con *batch* global de 16.
- Anotación funcional de transcritos: extraer el embedding `[CLS]` de cada CDS y entrenar un clasificador lineal o una pequeña MLP para asignar familia funcional o término de ontología, aprovechando que el modelo ya ha visto 42M de secuencias de ARN.
- Puntuación de variantes y mutaciones: enmascarar la posición de interés y comparar la log-probabilidad del nucleótido de referencia frente al alternativo, obteniendo una señal de tolerancia a la mutación que puede priorizar variantes en estudios de genómica.
- Búsqueda de similitud semántica entre secuencias: indexar los embeddings `[CLS]` de un catálogo de CDS y hacer búsqueda por vecino más cercano para agrupar secuencias con comportamiento funcional similar sin depender de alineamiento múltiple.
- Filtrado y control de calidad en pipelines de secuenciación: usar la perplejidad MLM por posición para detectar errores de base, frameshifts o regiones mal anotadas en un ensamblado antes de pasarlo a anotadores clásicos.
- *Fine-tuning* para predicción de estabilidad o traducción de ARNm: añadir una cabeza de regresión sobre el embedding de secuencia para estimar magnitudes experimentales a partir de la composición de la región codificante.
- *Probing* de representaciones en investigación: comparar el comportamiento de las 32 capas sobre tareas controladas para estudiar qué información codificante y estructural captura cada nivel de la red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La *model card* únicamente documenta la verificación de paridad numérica frente a los pesos originales de `genbio-ai/GB.RNA-1.6B-CDS`: diferencia máxima de 4,02e-06 en la salida final y 9,16e-05 en capas intermedias (ruido de acumulación en coma flotante, verificado en GPU con PyTorch 2.7 y CUDA 12 sobre los 33 niveles de representación). No se aportan cifras de MMLU, HumanEval, GSM8K ni de tareas biológicas como predicción de estructura secundaria, por lo que cualquier comparación de rendimiento requiere evaluación propia.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): ~6,5 GB en fp32, ~3,2 GB en fp16/bf16, ~1,6 GB en int8.
- VRAM con activaciones para longitud 1024 y *batch* pequeño: aproximadamente 8-10 GB en fp32, 4-6 GB en fp16, dado el reducido tamaño del vocabulario (16 tokens) en la cabeza MLM.
- GPU de datacenter: A100 (40/80 GB), H100, L40S o A10G sobradas para inferencia; pensadas para *fine-tuning* con *batch* grande.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) con holgura en fp16; también en RTX 4080 (16 GB) y RTX 3060 (12 GB) para inferencia en fp16 con *batch* moderado. En tarjetas de 8 GB es viable en fp16 con secuencias cortas y *batch* 1.
- Despliegue: `transformers` con `trust_remote_code=True` (vía `AutoModel` o `AutoModelForMaskedLM`), con `attn_implementation="sdpa"` o `"flash_attention_2"` para acelerar. No consta soporte oficial en vLLM, TGI, llama.cpp ni Ollama: el modelo requiere código remoto propio y no es un modelo generativo, por lo que los *runtimes* de LLM no aplican directamente.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño (1,6B) y la longitud máxima de 1024, se espera un coste por secuencia del orden de milisegundos a decenas de milisegundos en GPU moderna, pero no hay cifras publicadas que lo respalden.

## Comparativa con modelos similares

| Modelo | Parametros | Datos de entrenamiento | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| GB.RNA-1.6B-CDS (este) | 1,6B | 42M ncRNA + ajuste CDS | 1024 | GenBio AI Community License | Mayor capacidad de la familia con adaptación a CDS |
| GB.RNA-1.6B | 1,6B | 42M ncRNA | 1024 | GenBio AI Community License | Modelo base, sin adaptación a CDS |
| GB.RNA-650M-CDS | 650M | 42M ncRNA + ajuste CDS | 1024 | GenBio AI Community License | Alternativa más ligera con la misma adaptación; menos VRAM |
| GB.RNA-300M-MARS | 300M | MARS ncRNA | 1024 | GenBio AI Community License | Variante pequeña, orientada a *fine-tuning* rápido |
| Otros modelos fundacionales de ARN (p. ej. Nucleotide Transformer, Evo) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada para una comparación rigurosa |

Dentro de la propia familia, la elección entre 1.6B-CDS y 650M-CDS es un compromiso entre capacidad y coste: el modelo de 650M reduce aproximadamente a la mitad los requisitos de VRAM y permite *batches* mayores con el mismo presupuesto de hardware, a costa de menor capacidad de representación.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas. Cualquier expectativa de uso como chatbot o asistente es inaplicable.
- Vocabulario restringido a 16 tokens: no admite bases modificadas (por ejemplo, inosina o pseudouridina), ambigüedades IUPAC más allá de `N`, ni anotaciones estructurales en la secuencia de entrada.
- Longitud máxima validada de 1024 tokens; aunque RoPE no imponga un límite duro, no hay evidencia de que el modelo generalice más allá de esa longitud.
- La tokenización trata `U` y `T` como entradas distintas del vocabulario; es obligatorio normalizar `U` a `T` antes de tokenizar, y el tokenizador del port lo hace automáticamente, pero cualquier *pipeline* que construya tokens a mano debe replicar esa normalización.
- Sesgo de datos: el preentrenamiento se apoya en 42M de secuencias de ARN no codificante de bases de datos públicas, con el sesgo de composición, especie y calidad de anotación que ello implica. El rendimiento en organismos o familias poco representadas puede degradarse.
- Riesgo de predicciones erróneas con alta confianza: en las puntuaciones MLM, un logit alto no equivale a una predicción correcta; no se han publicado curvas de calibración ni evaluaciones de fiabilidad.
- Licencia `other` (GenBio AI Community License): es imprescindible revisar el fichero `LICENSE` antes de cualquier uso comercial, ya que las condiciones no son las de una licencia permisiva estándar y pueden incluir restricciones de uso, atribución o redistribución.
- `trust_remote_code=True` implica ejecutar código Python del repositorio; conviene auditar `modeling_gbrna.py` y fijar una revisión concreta antes de desplegar en producción.
- El repositorio es un port de terceros, no oficial de GenBio AI: aunque la paridad numérica está verificada hasta 4,02e-06, el mantenimiento y las actualizaciones dependen de un único colaborador. El modelo acumula 7 descargas y 0 *likes*, señal de adopción muy baja y escasa validación por parte de la comunidad.
- No hay benchmarks publicados que permitan estimar la calidad frente a alternativas; cualquier decisión de producción debe apoyarse en una evaluación propia sobre el conjunto de datos objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Taykhoom/GB.RNA-1.6B-CDS
- Id anterior (redirige al actual): https://huggingface.co/Taykhoom/AIDO.RNA-1.6B-CDS
- Colección completa GB.RNA: https://huggingface.co/collections/Taykhoom/gbrna-6a22fe2e4039c523bcc48de9
- Checkpoint original de GenBio AI: https://huggingface.co/genbio-ai/GB.RNA-1.6B-CDS
- Repositorio ModelGenerator: https://github.com/genbio-ai/ModelGenerator
- Tutorial de predicción de estructura secundaria de ARN: https://genbio-ai.github.io/ModelGenerator/tutorials/rna_secondary_structure_prediction/
- README de los experimentos GB.RNA: https://github.com/genbio-ai/ModelGenerator/blob/main/experiments/GB.RNA/README.md
- Directorio de experimentos de estructura secundaria: https://github.com/genbio-ai/ModelGenerator/tree/main/experiments/GB.RNA/rna_secondary_structure_prediction
- Paper (bioRxiv, 2024): https://doi.org/10.1101/2024.11.28.625345
- Variantes relacionadas: https://huggingface.co/Taykhoom/GB.RNA-1.6B · https://huggingface.co/Taykhoom/GB.RNA-650M-CDS · https://huggingface.co/Taykhoom/GB.RNA-650M · https://huggingface.co/Taykhoom/GB.RNA-300M-MARS
