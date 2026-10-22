# Taykhoom/GB.DNA-7B

## Resumen

GB.DNA-7B es un modelo fundacional de ADN de 7.285.036.320 parámetros desarrollado por GenBio AI (originalmente publicado como AIDO.DNA y renombrado a GB.DNA en 2025). No es un modelo de lenguaje natural: es un encoder tipo BERT que trabaja sobre secuencias genómicas tokenizadas nucleótido a nucleótido (A, C, G, T, N) y se entrena con un objetivo de *masked language modeling*. Este repositorio concreto (`Taykhoom/GB.DNA-7B`) es un port independiente del checkpoint oficial `genbio-ai/GB.DNA-7B` que elimina la dependencia del paquete ModelGenerator, de modo que se carga con `transformers` estándar mediante `trust_remote_code=True`.

El modelo se entrenó con 10.600 millones de nucleótidos procedentes de 796 genomas (dataset de Nucleotide Transformer), con un contexto de 4000 nucleótidos y tokenización de un solo nucleótido. La arquitectura es un transformer pre-LN de 32 capas, dimensión de embedding 4352, 32 cabezas de atención, MLP SwiGLU de 11584 unidades, RoPE y vocabulario de solo 16 tokens. Al ser un encoder bidireccional, su salida natural son representaciones (embeddings) y predicciones de tokens enmascarados, no texto generado.

Su relevancia práctica está en que permite obtener representaciones genómicas de alta calidad para genómica funcional, minería de genomas y anotación no supervisada sin necesidad de ensamblar infraestructura propia de GenBio: basta con `AutoModel` o `AutoModelForMaskedLM` de HuggingFace. Es, además, el checkpoint más grande de la familia GB.DNA publicada hasta la fecha, con una variante de 300M parámetros para despliegues ligeros. La licencia es la GenBio AI Community License, no una licencia open source estándar, lo que condiciona el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder pre-LN estilo BERT (implementación `RNABertForMaskedLM` de GenBio), bidireccional |
| Parámetros totales | 7.285.036.320 (7,29 B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4000 nucleótidos (contexto de entrenamiento); RoPE con `rotary_percent=1.0`, sin límite duro teórico |
| Tipos de cuantización | no disponible (no se publican artefactos cuantizados oficiales) |
| Idiomas soportados | no aplica: alfabeto de ADN `A, C, G, T, N` (existe un token `U` heredado del vocabulario RNA, pero no fue entrenado) |
| Licencia | other (GenBio AI Community License) |
| Formato de pesos | safetensors, 6 shards `model-0000X-of-00006.safetensors` |
| Capas | 32 |
| Cabezas de atención | 32 |
| Dimensión de embedding | 4352 |
| Dimensión oculta del FFN | 11584 (SwiGLU) |
| Normalización | LayerNorm (pre-LN) |
| Codificación posicional | RoPE (`rotary_percent=1.0`) |
| Tamaño de vocabulario | 16 |
| Tokens especiales | `[PAD]`, `[MASK]`, `[CLS]`, `[SEP]`, `[UNK]`, `[BOS]`, `[EOS]`, `[UNUSED1..3]` |
| Objetivo de entrenamiento | Masked language modeling (MLM) |
| Pipeline en HuggingFace | `fill-mask` (también usable como extractor de características con `AutoModel`) |
| Precisión de los pesos | no especificada en la model card (el repo ocupa 29,1 GB) |
| Tamaño del repositorio | 29,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder bidireccional con pre-LayerNorm, 32 capas, 32 cabezas de atención y dimensión de modelo 4352, con un MLP SwiGLU de 11584 unidades intermedias. Usa RoPE como codificación posicional aplicada al 100 % de las dimensiones de cabeza, y LayerNorm en lugar de RMSNorm. El vocabulario es de 16 tokens: cinco especiales (`[PAD]`, `[MASK]`, `[CLS]`, `[SEP]`, `[UNK]`), las cinco bases `A, C, G, T, N`, `U` y cuatro tokens reservados. Cada secuencia se envuelve como `[CLS] ... [SEP]`, y la tokenización es de un nucleótido por token, lo que implica que el contexto de 4000 tokens equivale a 4000 pb reales (sin compresión por k-mers).

El preentrenamiento consistió en MLM sobre 10.600 millones de nucleótidos de 796 genomas del dataset de Nucleotide Transformer, con contexto de 4000 nucleótidos. La model card no documenta fases de RLHF, DPO ni ajuste por instrucciones, lo cual es coherente con un encoder biológico: no hay etapa de alineación conversacional. Como innovaciones de implementación, este port añade explícitamente `attn_implementation="sdpa"` y `attn_implementation="flash_attention_2"` (ausentes en la implementación original de GenBio), encapsula toda la lógica en `modeling_gbdna.py` y `configuration_gbdna.py`, y verifica paridad numérica con los pesos originales: la capa de embedding coincide exactamente y el estado oculto tras el LayerNorm final y los logits de MLM coinciden dentro de tolerancia estricta, con un error relativo < 1e-6 en el flujo residual intermedio (ruido de acumulación en coma flotante). Verificado en PyTorch 2.7 / CUDA 12.

## Capacidades

- Extracción de representaciones genómicas: embeddings por token (seq_len × 4352) y embedding a nivel de secuencia vía token `[CLS]` (4352 dimensiones), además de estados ocultos de cualquiera de las 32 capas.
- Relleno de nucleótidos enmascarados (MLM): predice el nucleótido ausente en posiciones `[MASK]` con un cabezal de 16 clases.
- Genómica funcional: representaciones útiles para predicción de efectos de variantes, elementos reguladores y señales funcionales, según el caso de uso declarado por el autor.
- Minería de genomas y anotación no supervisada: el autor lo posiciona como el checkpoint más preciso de la familia para estas tareas.
- Ajuste fino estándar de HuggingFace: se puede acoplar una cabeza específica de tarea sobre el embedding `[CLS]` para clasificación o regresión a nivel de secuencia.
- Procesamiento por lotes con padding y máscara de atención: las claves en posiciones de padding reciben probabilidad cero.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo de instrucciones).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica.
- Visión, audio o modalidades distintas de secuencias biológicas: no disponible.

## Casos de uso

- Predicción de efectos de variantes: dado un fragmento de referencia y su versión con un SNV, se generan los embeddings `[CLS]` de ambas secuencias y se entrena una cabeza logística sobre la diferencia de representaciones para clasificar variantes patogénicas frente a benignas. El contexto de 4000 pb cubre la mayoría de elementos reguladores y exones completos.
- Anotación no supervisada de genomas recién ensamblados: se pasa el genoma por ventanas solapadas de 4000 pb, se extraen embeddings por token y se agrupan para detectar regiones con señal funcional (promotores, UTRs, límites exón-intrón) sin necesidad de anotación previa ni alineamiento múltiple.
- Minería de genomas para biosíntesis: se calculan embeddings de clústeres de genes candidatos y se comparan por similitud coseno contra un conjunto de referencia de clústeres biosintéticos conocidos, para priorizar candidatos antes de validación experimental.
- Imputación de huecos y `N` en ensamblados: uso directo del pipeline `fill-mask` para predecir la base más probable en posiciones desconocidas, útil como paso de limpieza o para comparar hipótesis de ensamblado.
- Clasificación taxonómica de reads metagenómicos: los embeddings medios de fragmentos cortos sirven como entrada a un clasificador ligero; el modelo se entrenó con 796 genomas, por lo que la cobertura taxonómica debe validarse contra el conjunto de test real antes de producción.
- Búsqueda de secuencias similares a escala: indexar embeddings `[CLS]` en una base vectorial (FAISS, Qdrant) para recuperar secuencias homólogas o funcionalmente análogas sin alineamiento pairwise, con coste O(1) por consulta tras la indexación.
- Preentrenamiento para tareas de laboratorio húmedo: ajuste fino sobre predicciones experimentales (expresión, estabilidad de ARN, sitios de splicing) usando el encoder congelado en las primeras capas y descongelando las últimas para reducir requisitos de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card cita el artículo de Ellington et al. (bioRxiv, 2024, doi 10.1101/2024.12.01.625444) como referencia de evaluación, pero no reproduce cifras concretas. La única verificación numérica documentada es la de paridad con los pesos originales de `genbio-ai/GB.DNA-7B`: coincidencia exacta en la capa de embedding, error relativo < 1e-6 en el flujo residual intermedio y coincidencia dentro de tolerancia estricta en el estado oculto post-LayerNorm y en los logits de MLM.

## Requisitos de hardware

- VRAM estimada solo para pesos: ~14,6 GB en fp16/bf16 (7,29 B × 2 bytes); ~29,1 GB en fp32; ~7,3 GB en int8; ~3,6-4 GB en int4. Cálculos derivados del recuento de parámetros, ya que no hay cuantizaciones oficiales publicadas.
- A la VRAM de pesos hay que sumar activaciones: con contexto completo de 4000 tokens y atención bidireccional, el consumo de activaciones crece de forma cuadrática con la longitud, por lo que un presupuesto realista en bf16 con lote moderado se sitúa por encima de los 20 GB.
- GPU de datacenter: A100 40/80 GB, H100, L40S 48 GB para contexto completo y lotes grandes en bf16.
- Consumer GPU en bf16: RTX 4090/3090 (24 GB) admite el modelo con secuencias cortas o lotes pequeños; con 4000 tokens y lote mayor de 1 conviene reducir la longitud o cuantizar.
- Consumer GPU en int8/int4: RTX 4090, 4080, 3090 sin problema en int8; en int4 cabe en tarjetas de 8-16 GB (RTX 4060 Ti 16 GB, RTX 3070 8 GB con secuencias recortadas).
- CPU: inferencia viable en fp32 con ~30 GB de RAM, o ~15 GB en fp16, con latencia muy superior a GPU.
- Opciones de despliegue: `transformers` con PyTorch es la vía soportada y documentada, con `attn_implementation="sdpa"` o `"flash_attention_2"`; cuantización vía bitsandbytes para int8/int4. No hay soporte oficial documentado en vLLM, TGI, llama.cpp ni Ollama, ni ficheros GGUF publicados; requeriría conversión y validación propias.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GB.DNA-7B (este) | 7,29 B | 4000 nt | MLM + embeddings de ADN | GenBio AI Community License | safetensors, `transformers` con `trust_remote_code` |
| GB.DNA-300M | 300 M | no disponible | MLM + embeddings de ADN | GenBio AI Community License | safetensors, `transformers` con `trust_remote_code` |
| Evo2-7B-1M | ~7 B | no disponible (el sufijo del nombre sugiere 1 M, sin confirmar) | etiquetado como `text-generation` en un índice de terceros | no disponible | safetensors (repo `Taykhoom/Evo2-7B-1M`) |
| Nucleotide Transformer | no disponible en la información | no disponible | MLM sobre ADN (origen del dataset de entrenamiento) | no disponible | no disponible |

No hay datos de benchmarks públicos en la información disponible que permitan comparar rendimiento entre estas opciones; la comparación debe hacerse por parámetros, contexto y licencia, no por métricas.

## Limitaciones y advertencias

- El token `U` existe en el vocabulario (id 9) porque se hereda del vocabulario compartido de GenBio RNABert, pero el modelo nunca lo vio en entrenamiento: su fila de embedding está sin entrenar (norma ~1,77 frente a ~0,69-0,97 de `A/G/C/T`). No se debe introducir `U`; para timina hay que usar `T`.
- Tokenización de un nucleótido por token: el contexto efectivo es de 4000 pb, insuficiente para elementos reguladores lejanos o genes completos de gran tamaño; hay que trocear en ventanas con solapamiento y agregar después.
- No es un modelo generativo ni sigue instrucciones: no hay chat, tool calling ni razonamiento multi-paso. Cualquier uso conversacional es un error de categoría.
- Riesgo de alucinación en sentido biológico: las predicciones de MLM son probabilidades sobre 16 clases y la anotación no supervisada puede producir falsos positivos; requiere validación experimental o contraste con bases de datos curadas.
- Sesgo de datos: los 796 genomas del dataset de Nucleotide Transformer no cubren de forma uniforme el árbol de la vida, por lo que el rendimiento en linajes poco representados (procariotas atípicos, virus, genomas muy ricos en GC) puede degradarse.
- Licencia "other": se trata de la GenBio AI Community License, no de Apache 2.0 ni MIT. Las condiciones concretas de uso comercial no se detallan en la información disponible y deben revisarse en el repositorio original antes de cualquier despliegue en producción.
- `trust_remote_code=True` es obligatorio: se ejecuta código Python del repositorio (`modeling_gbdna.py`, `configuration_gbdna.py`). Conviene fijar una revisión concreta y auditar el código antes de usarlo en entornos productivos.
- Port de terceros: mantenido por Taykhoom Dalal, no por GenBio AI. Con 9 descargas y 0 likes, la validación comunitaria es prácticamente nula; la paridad numérica está verificada, pero el mantenimiento futuro no está garantizado.
- Al ser un encoder bidireccional, no dispone de caché KV: cada inferencia reprocesa la secuencia completa, lo que encarece el throughput en comparación con decoders.
- No se especifica la precisión de los pesos en la model card (el repo ocupa 29,1 GB, compatible con fp32); conviene comprobar los `dtype` de los safetensors antes de planificar VRAM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Taykhoom/GB.DNA-7B
- ID anterior (redirige al actual): https://huggingface.co/Taykhoom/AIDO.DNA-7B
- Variante de 300M: https://huggingface.co/Taykhoom/GB.DNA-300M
- Colección GB.DNA: https://huggingface.co/collections/Taykhoom/gbdna-6a2887b44b37853f838d2ae2
- Perfil del mantenedor del port: https://huggingface.co/Taykhoom/models
- Repositorio oficial de código (ModelGenerator): https://github.com/genbio-ai/ModelGenerator
- Tutoriales de GB.Protein y GB.DNA: https://github.com/genbio-ai/GB-Foundations-Tutorials/
- Sitio de GenBio AI: https://genbio.ai/
- Artículo de referencia (Ellington et al., bioRxiv 2024): https://doi.org/10.1101/2024.12.01.625444
