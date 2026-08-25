# Taykhoom/GENA-LM-t2t-lastln-base

## Resumen

GENA-LM-t2t-lastln-base es un port minimalista y autocontenido del modelo original `AIRI-Institute/gena-lm-bert-base-lastln-t2t`, desarrollado por el usuario Taykhoom en HuggingFace. Se trata de un modelo de lenguaje de ADN basado en BERT con pre-LayerNorm y una capa final de normalización, entrenado mediante modelado de lenguaje enmascarado (MLM) sobre el genoma humano T2T y variantes de poblaciones. Con aproximadamente 110 millones de parámetros, el modelo está diseñado para representar secuencias de ADN de hasta 512 tokens BPE (~4608 nucleótidos) y proporciona embeddings contextuales de alta calidad para tareas de genómica.

La relevancia de este modelo radica en su verificación de paridad bit-exacta con los pesos originales, lo que garantiza una reproducibilidad total. Además, incorpora soporte para backends de atención más eficientes (SDPA y Flash Attention 2) sin alterar el comportamiento del modelo eager. Al estar liberado bajo licencia MIT, puede utilizarse libremente en proyectos comerciales y de investigación. Es una opción ligera y accesible para quienes necesitan un encoder de ADN con un buen equilibrio entre rendimiento y requisitos de cómputo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT pre-LayerNorm con LayerNorm final (12 capas, 12 cabezas, dim 768, FFN 3072 GELU) |
| Parámetros totales | 110.652.416 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens BPE (~4608 nucleótidos) |
| Tipos de cuantización | no disponible (solo pesos safetensors en fp32) |
| Idiomas soportados | No aplica (secuencias de ADN) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura BERT estándar con pre-normalización (Pre-LayerNorm) y una capa de normalización adicional tras la última capa del transformer. Tiene 12 capas ocultas, 12 cabezas de atención y una dimensión de embedding de 768, con una capa FFN de 3072 unidades y activación GELU. El vocabulario se compone de 32.000 tokens BPE entrenados específicamente sobre ADN, incluyendo tokens especiales como `[CLS]`, `[SEP]`, `[PAD]`, `[UNK]` y `[MASK]`. Las posiciones se representan mediante embeddings absolutos aprendidos.

El entrenamiento se realizó mediante modelado de lenguaje enmascarado con un 15% de tokens enmascarados, siguiendo el enfoque de BigBird. Los datos de entrenamiento provienen del ensamblaje T2T del genoma humano, enriquecido con variantes de los proyectos 1000 Genomes y gnomAD. Se ejecutaron 2.100.000 iteraciones con tamaño de lote 256 y longitud de secuencia de 512 tokens. La verificación de paridad confirma que todos los niveles de representación (embedding + 12 bloques) y los logits de MLM son bit-exactos con el modelo original para el backend `eager`. Además, se añadieron los backends `sdpa` y `flash_attention_2` que coinciden dentro de la tolerancia esperada de punto flotante.

## Capacidades

- Generación de embeddings de secuencias de ADN: produce representaciones contextuales por token y una representación de secuencia mediante el token `[CLS]` o pooling medio.
- Modelado de lenguaje enmascarado: puede predecir tokens enmascarados (por ejemplo, bases desconocidas) en una secuencia.
- Extracción de características de capas intermedias: permite obtener representaciones de capas específicas para análisis o transferencia.
- Fine-tuning para tareas de clasificación de secuencias (por ejemplo, reguladores, promotores) mediante cabezales personalizados sobre `[CLS]`.
- No incluye cabezal NSP ni pooler original, por lo que no se puede usar para tareas de predicción de relación entre frases.
- Soporta backends de atención acelerados (SDPA y Flash Attention 2) para mejorar el rendimiento en secuencias largas.
- No ofrece capacidades de generación de texto libre, razonamiento o tool calling.

## Casos de uso

- **Anotación de variantes genéticas**: dado un segmento de ADN con una variante (SNP), se puede usar el modelo para obtener embeddings contextuales que alimenten clasificadores de patogenicidad o de impacto funcional. Su ventana de 4608 nucleótidos permite capturar contexto local relevante.
- **Predicción de regiones reguladoras**: mediante fine-tuning sobre datos de cromatina (por ejemplo, enhancers, promotores), el modelo puede clasificar secuencias de ADN como reguladoras o no, gracias a la representación semántica aprendida.
- **Clasificación de elementos genómicos**: se puede usar para identificar exones, intrones, sitios de empalme u otras anotaciones funcionales a partir de secuencias de ADN, con un modelo ligero que no requiere hardware avanzado.
- **Detección de regiones no codificantes conservadas**: embeddings de secuencias de diferentes especies pueden compararse para encontrar regiones evolutivamente conservadas, aunque el modelo no está entrenado específicamente para multi-especie.
- **Análisis de metilación o modificación de ADN**: como modelo de lenguaje enmascarado, se puede adaptar para predecir estados de modificación epigenética a partir de la secuencia, entrenando cabezales de clasificación sobre los embeddings.
- **Generación de datos sintéticos de ADN**: aunque no es un modelo generativo completo, su capacidad de MLM permite rellenar bases enmascaradas, lo que puede ser útil para completar secuencias parciales en pipelines de ensamblaje o para generar variantes in silico.
- **Integración en pipelines de aprendizaje profundo**: al ser un modelo ligero (110M), se puede integrar en sistemas de análisis genómico a gran escala que requieren procesar millones de fragmentos con recursos limitados, usando GPU consumer o CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas de MMLU, HumanEval, GSM8K ni similares, ya que es un modelo de ADN y no un LLM de texto. Tampoco se reportan resultados en tareas de genómica como clasificación de promotores o predicción de efectos de variantes. Se recomienda consultar el artículo de GENA-LM original para conocer los resultados de la familia completa en tareas de genómica.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 110 millones de parámetros. En fp32, los pesos ocupan aproximadamente 442 MB; en fp16/bfloat16, unos 221 MB. La VRAM necesaria para inferencia típica es de menos de 1 GB, incluyendo activaciones y memoria intermedia.
- **GPUs recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente. Por ejemplo, una NVIDIA GTX 1050 Ti o RTX 3060 pueden ejecutar el modelo sin problemas. En GPU de centro de datos (A100, H100) es trivial.
- **Consumer GPU**: sí, cabe en cualquier GPU de consumo actual (por ejemplo, RTX 3090, RTX 4070, etc.) y también en GPU de portátiles.
- **Opciones de despliegue**: se puede cargar mediante la librería `transformers` de HuggingFace con `trust_remote_code=True`. No es compatible directamente con vLLM (que está orientado a modelos generativos), pero se puede usar con ONNX Runtime o con PyTorch para inferencia. También se puede exportar a formato ONNX para despliegue en entornos de producción.
- **Latencia y throughput**: no se han publicado cifras concretas. Dado su tamaño, la inferencia es muy rápida, del orden de milisegundos por secuencia en GPU. En CPU, también es viable para volúmenes moderados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto (tokens) | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GENA-LM-t2t-lastln-base (este) | 110M | 512 BPE | Pre-LN BERT + LayerNorm final | MIT | HuggingFace |
| GENA-LM-bert-base (Taykhoom) | 110M | 512 | Pre-LN BERT | MIT | HuggingFace |
| GENA-LM-t2t-bert-base (Taykhoom) | 110M | 512 | Pre-LN BERT | MIT | HuggingFace |
| GENA-LM-t2t-bigbird-base (Taykhoom) | 110M | 4096 | BigBird | MIT | HuggingFace |
| GENA-LM-sparse-bigbird-base (Taykhoom) | 110M | 4096 | BigBird disperso | MIT | HuggingFace |

La principal diferencia entre este modelo y los otros de la misma familia es la presencia de la capa final de normalización (`lastln`) y el entrenamiento específico sobre el genoma T2T. Los modelos BigBird ofrecen una ventana de contexto mucho mayor (4096 tokens) a costa de una atención dispersa, mientras que este modelo usa atención densa limitada a 512 tokens. Para aplicaciones que requieren contexto largo, los modelos BigBird son más adecuados; para tareas con fragmentos cortos y alta fidelidad de representación, este modelo es comparable al resto.

## Limitaciones y advertencias

- **Ventana de contexto limitada**: solo procesa hasta 512 tokens BPE (~4608 nucleótidos), lo que no cubre elementos reguladores largos o regiones genómicas extensas.
- **Entrenamiento específico en humano**: el modelo fue entrenado principalmente sobre el genoma humano T2T, aunque se incluyeron SNPs de poblaciones humanas. No se ha entrenado en otras especies, por lo que su rendimiento en secuencias no humanas puede ser subóptimo.
- **Sin NSP ni pooler**: el port no incluye el cabezal de predicción de relación entre frases (NSP) ni el pooler original, por lo que no se puede usar para tareas de clasificación de pares de secuencias sin adaptación adicional.
- **Riesgo de sesgo en variantes**: los datos de entrenamiento incluyen SNPs de gnomAD, pero la representación de poblaciones no europeas puede ser menos rica, lo que podría sesgar los embeddings para variantes de ciertos grupos.
- **Alucinación en MLM**: como modelo de lenguaje enmascarado, puede predecir bases que no correspondan a la realidad biológica, especialmente en regiones de baja complejidad o con variantes raras. No debe usarse para predecir variantes clínicas sin validación.
- **Restricciones de licencia**: la licencia MIT permite uso comercial, pero se recomienda revisar la licencia de los datos de entrenamiento originales (T2T, gnomAD) si se usa en productos clínicos o comerciales.
- **Formato de pesos**: solo se proporcionan pesos en safetensors; no hay versiones cuantizadas oficiales (GGUF, ONNX), por lo que para despliegue en CPU con bajo consumo se requeriría conversión manual.

## Enlaces

- [HuggingFace: Taykhoom/GENA-LM-t2t-lastln-base](https://huggingface.co/Taykhoom/GENA-LM-t2t-lastln-base)
- [HuggingFace original: AIRI-Institute/gena-lm-bert-base-lastln-t2t](https://huggingface.co/AIRI-Institute/gena-lm-bert-base-lastln-t2t)
- [GitHub: AIRI-Institute/GENA_LM](https://github.com/AIRI-Institute/GENA_LM)
- [Artículo en Nucleic Acids Research (2025)](https://academic.oup.com/nar/article/53/2/gkae1310/7954523)
- [Preprint en bioRxiv (2023)](https://www.biorxiv.org/content/10.1101/2023.06.12.544594v1)
- [Colección GENA-LM en HuggingFace](https://huggingface.co/collections/Taykhoom/gena-lm-6a8cec0862e11d4f81d059ab)
