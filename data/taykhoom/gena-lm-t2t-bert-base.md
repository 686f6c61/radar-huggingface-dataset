# Taykhoom/GENA-LM-t2t-bert-base

## Resumen

GENA-LM-t2t-bert-base es un port minimalista a HuggingFace del modelo original `AIRI-Institute/gena-lm-bert-base-t2t`, desarrollado por el equipo del AIRI Institute (Fishman, Kuratov y colaboradores) y reimplementado por Taykhoom con el objetivo de ofrecer una versión autocontenida y verificable bit a bit del backbone BERT pre-entrenado en secuencias de ADN humano. Se trata de un modelo de lenguaje enmascarado (MLM) de tipo BERT con 110 millones de parámetros, 12 capas, 768 dimensiones de embedding y una ventana de contexto de 512 tokens BPE (equivalentes a aproximadamente 4600 nucleótidos). Su relevancia actual reside en que permite obtener representaciones vectoriales de segmentos genómicos de forma eficiente y reproducible, con soporte para backends de atención modernos como SDPA y FlashAttention 2, facilitando su integración en pipelines de bioinformática y aprendizaje automático.

El modelo fue pre-entrenado sobre el ensamblaje T2T del genoma humano, aumentado con variantes de los proyectos 1000 Genomas y gnomAD, mediante un objetivo de masked language modeling (MLM) con un 15% de tokens enmascarados siguiendo la estrategia de BigBird. A diferencia del original, esta versión no incluye la cabeza NSP ni el pooler, por lo que se centra en tareas de embeddings y de MLM. Se ha verificado que la salida del backbone es idéntica (diferencia absoluta máxima 0.00) con el backend `eager` respecto al modelo original, y los backends `sdpa` y `flash_attention_2` coinciden dentro de tolerancia numérica esperada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pre-LayerNorm BERT sin capa final de LayerNorm |
| Parámetros totales | 110.650.880 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens BPE (~4608 nucleobos) |
| Tipos de cuantización | No disponible (solo se ofrecen pesos en fp32/bf16 según uso) |
| Idiomas soportados | No aplica (secuencias de ADN) |
| Licencia | MIT |
| Formato de pesos | safetensors (0.4 GB repo) |

## Arquitectura y entrenamiento

Arquitectura de tipo BERT pre-LayerNorm (sin la capa final de LayerNorm), con 12 capas, 12 cabezas de atención, dimensión de embedding 768, y capa FFN de 3072 dimensiones con activación GELU. Usa codificación posicional aprendida absoluta y un vocabulario de 32.000 tokens BPE entrenados sobre ADN, que incluye tokens especiales `[CLS]`, `[SEP]`, `[PAD]`, `[UNK]` y `[MASK]`. La entrada máxima es de 512 tokens BPE, lo que equivale a unos 4600 nucleobos. El entrenamiento se realizó con el objetivo de masked language modeling (15% de tokens enmascarados) sobre el genoma humano T2T, aumentado con SNPs de 1000 Genomas y gnomAD. Se ejecutaron 2.100.000 iteraciones con batch size 256 y longitud de secuencia 512. El checkpoint de origen es `AIRI-Institute/gena-lm-bert-base-t2t`. No se indica uso de RLHF o DPO; es un modelo de preentrenamiento puro.

La reimplementación de este port añade los backends `sdpa` (PyTorch 2.0+) y `flash_attention_2` (requiere la librería flash-attn) para acelerar la atención en secuencias largas, mientras que el backend `eager` reproduce exactamente los pesos originales. Los embeddings de entrada y el decoder de MLM están atados (tied).

## Capacidades

- Generación de embeddings de secuencias de ADN: produce vectores de dimensión 768 para cada token o un embedding de secuencia mediante el token `[CLS]` o pooling sobre posiciones no padding.
- Tareas de masked language modeling: dado un segmento de ADN con tokens `[MASK]`, el modelo predice la base(s) enmascarada(s), útil para imputación de variantes o corrección de errores.
- Fine-tuning para tareas de clasificación de secuencias (promotores, enhancers, sitios de unión de factores de transcripción) mediante la adición de una capa de predicción sobre el embedding `[CLS]` o un pooling medio.
- Extracción de representaciones intermedias (hidden states) de cualquier capa (por ejemplo, capa 6) para análisis de atención o características específicas.
- Soporte de backends de atención eficientes (sdpa y flash_attention_2) para acelerar la inferencia y reducir memoria.
- No soporta generación de texto libre ni funciones de tool calling; es un modelo de representación, no generativo.

## Casos de uso

- Análisis de variantes genéticas: dado un segmento de ADN con una mutación, el modelo puede predecir la base más probable en la posición enmascarada, lo que permite evaluar el impacto de SNPs en contextos regulatorios.
- Clasificación de regiones regulatorias: mediante fine-tuning, se pueden clasificar secuencias como promotores, enhanceres o silenciadores, usando el embedding `[CLS]` como entrada a un clasificador.
- Detección de elementos funcionales: el modelo puede ser usado para identificar patrones de secuencia asociados a sitios de unión de proteínas (por ejemplo, factores de transcripción) mediante análisis de los embeddings de tokens.
- Imputación de secuencias incompletas: en proyectos de ensamblaje de genomas, el modelo puede predecir bases faltantes en regiones ambiguas usando MLM.
- Generación de representaciones de secuencias para aprendizaje por transferencia: los embeddings de este modelo sirven como características de entrada para modelos de predicción de expresión génica o de efectos de mutaciones, reemplazando one-hot encoding.
- Análisis de evolución comparada: aunque está entrenado en humano, el modelo puede usarse como base para fine-tuning en otras especies (si se dispone de datos) para estudiar conservación de secuencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card no incluye métricas de MMLU, HumanEval, GSM8K ni otras tareas de lenguaje natural. Tampoco se reportan comparaciones cuantitativas con otros modelos de ADN en tareas específicas (por ejemplo, predicción de efectos de variantes). Se recomienda consultar el artículo original de GENA-LM (Nucleic Acids Research, 2025) para evaluaciones sobre tareas de genómica.

## Requisitos de hardware

- Parámetros: 110M, por lo que la inferencia es factible en GPU de consumo. Con precisión fp32, el modelo ocupa aproximadamente 442 MB en memoria (110M * 4 bytes). Con bfloat16 o fp16, ~221 MB.
- VRAM estimada: para una secuencia de 512 tokens, la memoria adicional por batch es modesta; una GPU con 4-6 GB puede ejecutar el modelo sin problemas. Para fine-tuning con batch size 8-16, se recomienda al menos 8 GB.
- GPUs recomendadas: RTX 3060, RTX 4060, T4, V100, A10, A100, H100. Cualquier GPU con soporte PyTorch y CUDA 12.9 o superior es suficiente.
- Opciones de despliegue: se puede usar con la librería `transformers` (Python), ONNX Runtime, o TensorRT. No se menciona soporte para vLLM ni llama.cpp, ya que es un modelo de embeddings, no generativo. También se puede exportar a formato ONNX para inferencia en CPU o GPU.
- Latencia y throughput: no se proporcionan datos específicos, pero para un modelo de 110M y secuencias de 512 tokens, la inferencia es de decenas de milisegundos en GPU moderna (por ejemplo, RTX 4090).

## Comparativa con modelos similares

Dentro de la familia GENA-LM (mismo tamaño y arquitectura), se pueden comparar las variantes:

| Modelo | Parámetros | Contexto (tokens) | Notas |
|---|---|---|---|
| GENA-LM-bert-base | 110M | 512 | Original sin t2t, entrenado en genoma humano |
| GENA-LM-t2t-bert-base (este) | 110M | 512 | Entrenado con T2T + SNP, sin NSP/pooler |
| GENA-LM-t2t-multi-species-bert-base | 110M | 512 | Entrenado en múltiples especies |
| GENA-LM-t2t-bigbird-base | 110M | 4096 | Atención BigBird, contexto largo |
| GENA-LM-t2t-bert-large | 336M | 512 | Mayor tamaño |

En comparación con otros modelos de ADN como DNABERT o Nucleotide Transformer, no se dispone de datos de rendimiento comparativo aquí. La principal diferencia es el uso de tokenización BPE sobre ADN y el entrenamiento en genoma humano T2T con variantes.

## Limitaciones y advertencias

- **Contexto limitado**: la ventana de 512 tokens BPE (~4600 nucleobos) puede ser insuficiente para regiones genómicas largas. Para secuencias más largas, se recomienda usar las variantes BigBird (4096 tokens) o el mecanismo de memoria recurrente mencionado en el paper.
- **Específico de humano**: aunque la variante multi-especie está disponible, este modelo se entrenó solo en genoma humano T2T y SNP de poblaciones humanas, por lo que puede tener menor rendimiento en otras especies.
- **Sin head de NSP ni pooler**: el port no incluye la cabeza de next sentence prediction ni el pooler original; para tareas de clasificación de pares de secuencias se debe usar el `[CLS]` o pooling manual.
- **Riesgo de alucinación**: como modelo de lenguaje, puede predecir bases en posiciones enmascaradas con confianza, pero no se garantiza que la predicción sea biológicamente correcta; es una herramienta de apoyo, no de diagnóstico.
- **Licencia MIT**: permite uso comercial, pero se recomienda revisar el artículo original para posibles patentes o restricciones adicionales.
- **Dependencia de `trust_remote_code`**: al ser un modelo con código personalizado, se debe cargar con `trust_remote_code=True`, lo que implica ejecutar código del repositorio; se recomienda revisar el código fuente antes de usarlo en entornos de producción.

## Enlaces

- [Modelo en HuggingFace: Taykhoom/GENA-LM-t2t-bert-base](https://huggingface.co/Taykhoom/GENA-LM-t2t-bert-base)
- [Modelo original: AIRI-Institute/gena-lm-bert-base-t2t](https://huggingface.co/AIRI-Institute/gena-lm-bert-base-t2t)
- [Repositorio oficial de GENA-LM en GitHub](https://github.com/AIRI-Institute/GENA_LM)
- [Artículo científico (Nucleic Acids Research, 2025): "GENA-LM: a family of open-source foundational DNA language models for long sequences"](https://academic.oup.com/nar/article/53/2/gkae1310/7954523)
- [Colección de modelos GENA-LM en HuggingFace](https://huggingface.co/collections/Taykhoom/gena-lm-6a8cec0862e11d4f81d059ab)

Nota: no se encontraron demos interactivas ni documentación adicional en la búsqueda web.</think>## Resumen

GENA-LM-t2t-bert-base es un port minimalista a HuggingFace del modelo original `AIRI-Institute/gena-lm-bert-base-t2t`, desarrollado por el AIRI-Institute y reimplementado por Taykhoom. Se trata de un modelo de lenguaje enmascarado (masked language model, MLM) de arquitectura BERT, entrenado sobre secuencias de ADN humano. Con 110 millones de parámetros y una ventana de contexto de 512 tokens BPE (equivalentes a aproximadamente 4600 nucleótidos), este modelo está diseñado para tareas de representación de secuencias genómicas, imputación de variantes y fine-tuning en problemas de genómica computacional. Su relevancia actual radica en que ofrece una implementación autocontenida, verificada bit a bit contra el checkpoint original, y añade soporte para backends de atención modernos como SDPA y FlashAttention 2, lo que facilita su integración en pipelines de análisis de datos genómicos.

El modelo fue preentrenado con un objetivo de MLM (15% de tokens enmascarados, estilo BigBird) sobre el ensamblaje T2T del genoma humano, aumentado con variantes de los proyectos 1000 Genomas y gnomAD. A diferencia de la versión original, este port no incluye la cabeza de predicción de siguiente frase (NSP) ni el pooler, centrándose únicamente en la generación de embeddings y en tareas de MLM. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales, y los pesos se distribuyen en formato safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pre-LayerNorm BERT sin capa final de LayerNorm |
| Parámetros totales | 110.650.880 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens BPE (~4608 nucleótidos) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo para secuencias de ADN, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (0.4 GB repo) |

## Arquitectura y entrenamiento

La arquitectura es un BERT pre-LayerNorm, es decir, la normalización se aplica antes de cada subcapa de atención y feed-forward, y no hay una capa final de LayerNorm sobre la salida del último bloque. Concretamente: 12 capas transformer, 12 cabezas de atención, dimensión de embedding 768, capa intermedia de feed-forward con 3072 unidades y activación GELU, y vocabulario de 32.000 tokens BPE entrenados sobre secuencias de ADN. La codificación posicional es aprendida absoluta, y se incluyen los tokens especiales `[CLS]`, `[SEP]`, `[PAD]`, `[UNK]` y `[MASK]`. El modelo fue entrenado con un objetivo de masked language modeling (15% de tokens enmascarados) durante 2.100.000 iteraciones, con batch size 256 y longitud de secuencia 512. Los datos de entrenamiento provienen del genoma humano T2T, enriquecido con variantes de los proyectos 1000 Genomas y gnomAD. No se emplearon técnicas de RLHF ni DPO. La innovación principal de este port es la adición de los backends `sdpa` y `flash_attention_2` para acelerar la atención, mientras que el backend `eager` reproduce exactamente las salidas del modelo original (diferencia absoluta máxima 0.00). Los embeddings de entrada y el decoder de MLM están atados (tied).

## Capacidades

- Generación de embeddings de secuencias de ADN: produce representaciones vectoriales de dimensión 768 por token o por secuencia (usando el token `[CLS]` o pooling medio).
- Predicción de bases enmascaradas (MLM): dado un segmento con `[MASK]`, el modelo predice el nucleótido (o token) más probable en esa posición.
- Extracción de representaciones intermedias: se pueden obtener los hidden states de cualquier capa (por ejemplo, capa 6) para análisis de atención o como características para otras tareas.
- Fine-tuning para tareas de clasificación de secuencias: se puede añadir una capa de clasificación sobre el embedding `[CLS]` para tareas como detección de promotores, enhanceres, sitios de unión de factores de transcripción, etc.
- Soporte de backends de atención eficientes: `sdpa` (PyTorch 2.0+) y `flash_attention_2` (requiere flash-attn) para mejorar la velocidad en secuencias largas.
- No soporta tool calling ni agentes; es un modelo de representación, no generativo.

## Casos de uso

- Análisis de variantes genéticas: el modelo puede predecir la base más probable en una posición enmascarada, lo que permite evaluar el impacto de un SNP en un contexto regulatorio.
- Clasificación de regiones funcionales: mediante fine-tuning, se pueden clasificar segmentos de ADN como promotores, enhanceradores o silenciadores, usando el embedding `[CLS]`.
- Detección de sitios de unión de factores de transcripción: los embeddings de tokens pueden servir como entrada para modelos de predicción de sitios de unión.
- Imputación de secuencias incompletas: en ensamblajes genómicos, el modelo puede rellenar bases faltantes en regiones ambiguas.
- Generación de características para modelos de expresión génica: los embeddings del modelo se pueden usar como características de entrada para predecir niveles de expresión o efectos de mutaciones.
- Análisis de conservación evolutiva: aunque el modelo se entrenó en humano, puede servir como base para fine-tuning en otras especies y comparar representaciones entre especies.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento en tareas de genómica (por ejemplo, predicción de promotores, variantes patogénicas, etc.). No se puede comparar cuantitativamente con otros modelos como DNABERT o Nucleotide Transformer sin datos adicionales. Se recomienda consultar el artículo original de GENA-LM para evaluaciones sobre tareas de genómica.

## Requisitos de hardware

- **VRAM estimada**: con pesos en fp32 (~442 MB), el modelo puede ejecutarse en GPU con 4 GB o más. En bf16 (recomendado para FlashAttention 2) ocupa ~220 MB.
- **GPUs recomendadas**: RTX 3060, RTX 4060, T4, RTX 4090, A100, H100, o cualquier GPU con soporte CUDA 12.9 y PyTorch 2.7.
- **Inferencia en consumer GPU**: sí, cabe en cualquier GPU con al menos 4 GB de VRAM para secuencias de 512 tokens.
- **Opciones de despliegue**: se puede usar directamente con `transformers` (AutoModel, AutoModelForMaskedLM), exportar a ONNX o TensorRT para producción. No se menciona compatibilidad con llama.cpp ni Ollama (es un modelo de embeddings, no de generación de texto).
- **Latencia y throughput**: no se especifican datos, pero para un modelo de 110M y secuencias de 512 tokens, la inferencia en GPU es del orden de decenas de milisegundos por secuencia.

## Comparativa con modelos similares

Dentro de la familia GENA-LM, se puede comparar con otras variantes del mismo tamaño:

| Modelo | Parámetros | Contexto (tokens) | Entrenamiento | Licencia |
|---|---|---|---|---|
| GENA-LM-bert-base | 110M | 512 | Genoma humano (no T2T) | MIT |
| GENA-LM-t2t-bert-base (este) | 110M | 512 | Genoma humano T2T + SNP | MIT |
| GENA-LM-t2t-multi-species-bert-base | 110M | 512 | Múltiples especies | MIT |
| GENA-LM-t2t-bigbird-base | 110M | 4096 | Genoma humano T2T | MIT |
| GENA-LM-t2t-bert-large | 336M | 512 | Genoma humano T2T | MIT |

No se dispone de comparativas con modelos externos como DNABERT o Nucleotide Transformer en la información disponible.

## Limitaciones y advertencias

- **Contexto limitado**: la ventana de 512 tokens (~4600 nucleótidos) puede ser insuficiente para regiones genómicas largas. Para secuencias más largas se recomienda usar las variantes BigBird (4096 tokens) o los modelos con memoria recurrente mencionados en el paper.
- **Especificidad humana**: el entrenamiento se realizó exclusivamente sobre el genoma humano T2T y variantes humanas; puede tener menor rendimiento en otras especies, aunque existe la variante multi-especie.
- **Sin NSP ni pooler**: este port no incluye la cabeza de predicción de siguiente oración ni el pooler original; para clasificación de secuencias se debe usar el `[CLS]` o pooling medio.
- **Riesgo de alucinación**: como modelo de MLM, puede predecir bases con alta confianza pero sin garantía de corrección biológica; no debe usarse como herramienta de diagnóstico sin validación adicional.
- **Dependencia de `trust_remote_code`**: al ser un modelo con código personalizado, se requiere `trust_remote_code=True` al cargarlo, lo que implica ejecutar código del repositorio. Se recomienda revisar el código fuente antes de usarlo en entornos de producción.
- **Sin cuantizaciones predefinidas**: no se ofrecen versiones cuantizadas (por ejemplo, int8, int4) en la página del modelo, aunque se puede cuantizar manualmente.

## Enlaces

- [Modelo en HuggingFace: Taykhoom/GENA-LM-t2t-bert-base](https://huggingface.co/Taykhoom/GENA-LM-t2t-bert-base)
- [Modelo original: AIRI-Institute/gena-lm-bert-base-t2t](https://huggingface.co/AIRI-Institute/gena-lm-bert-base-t2t)
- [Repositorio GitHub de GENA-LM](https://github.com/AIRI-Institute/GENA_LM)
- [Artículo científico (Nucleic Acids Research, 2025): "GENA-LM: a family of open-source foundational DNA language models for long sequences"](https://academic.oup.com/nar/article/53/5/gkae1310/7954523)
- [Colección de modelos GENA-LM en HuggingFace](https://huggingface.co/collections/Taykhoom/gena-lm-6a8ecce0862f11d4f81d059ab)

Nota: no se encontraron demos ni documentación adicional en la búsqueda web.</think>## Resumen

GENA-LM-t2t-bert-base es un port minimalista a HuggingFace del modelo original `AIRI-Institute/gena-lm-bert-base-t2t`, desarrollado por el AIRI-Institute y reimplementado por Taykhoom. Se trata de un modelo de lenguaje enmascarado (masked language model, MLM) de arquitectura BERT, entrenado sobre secuencias de ADN humano. Con 110 millones de parámetros y una ventana de contexto de 512 tokens BPE (equivalentes a aproximadamente 4600 nucleótidos), este modelo está diseñado para tareas de representación de secuencias genómicas, imputación de variantes y fine-tuning como embeddings para genómica computacional. Su relevancia radica en que ofrece una implementación autocontenida y verificada bit a bit contra el modelo original, además de soportar backends de atención modernos como SDPA y FlashAttention 2, lo que facilita su integración en pipelines de análisis de datos genómicos.

El port no incluye la cabeza de predicción de siguiente frase (NSP) ni el pooler original, centrándose únicamente en la generación de embeddings y tareas de MLM. La licencia es MIT, lo que permite uso comercial sin restricciones, y los pesos se distribuyen en formato safetensors. No se han publicado benchmarks específicos en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pre-LayerNorm BERT (sin capa final de LayerNorm) |
| Parámetros totales | 110.650.880 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens BPE (~4600 nucleótidos) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (solo ADN) |
| Licencia | MIT |
| Formato de pesos | safetensors (0.4 GB repo) |

## Arquitectura y entrenamiento

La arquitectura es un BERT pre-LayerNorm con 12 capas, 12 cabezas de atención, dimensión de embedding 768 y una capa de feed-forward de 3072 dimensiones con activación GELU. Se usa una codificación posicional aprendida absoluta y un vocabulario de 32.000 tokens BPE entrenados sobre secuencias de ADN, que incluye los tokens especiales `[CLS]`, `[SEP]`, `[PAD]`, `[UNK]` y `[MASK]`. El entrenamiento se realizó con un objetivo de masked language modeling (15% de tokens enmascarados) sobre el genoma humano T2T, aumentado con variantes de los proyectos 1000 Genomas y gnomAD. Se ejecutaron 2.100.000 iteraciones con batch size 256 y secuencias de longitud 512. No se emplearon técnicas de RLHF ni DPO. El port añade soporte para backends de atención `sdpa` y `flash_attention_2`; el backend `eager` reproduce exactamente las salidas del modelo original (diferencia absoluta máxima 0.00). Los embeddings de entrada y el decoder de MLM están atados (tied).

## Capacidades

- Generación de embeddings de secuencias de ADN: produce vectores de dimensión 768 por token o por secuencia (mediante el token `[CLS]` o pooling medio).
- Predicción de bases enmascaradas (MLM): dado un segmento con `[MASK]`, predice el nucleótido o base más probable.
- Extracción de representaciones intermedias de capas (por ejemplo, capa 6) para análisis de atención o características.
- Fine-tuning para tareas de clasificación de secuencias genéticas, como detección de promotores, enhanceradores o sitios de unión de factores de transcripción.
- Soporte de backends de atención acelerados: `sdpa` (PyTorch 2.0+) y `flash_attention_2` (requiere flash-attn) para mayor velocidad en secuencias largas.
- No soporta tool calling, agentes ni generación de texto libre; es un modelo de representación.

## Casos de uso

- Análisis de variantes genéticas: el modelo puede predecir la base más probable en una posición enmascarada, lo que permite evaluar el impacto de SNP en regiones regulatorias.
- Clasificación de regiones funcionales: mediante fine-tuning, se pueden clasificar segmentos de ADN como promotores, enhanceradores o silenciadores usando el embedding `[CLS]`.
- Detección de sitios de unión de factores de transcripción: los embeddings generados sirven como entrada para modelos de predicción de sitios de unión.
- Imputación de secuencias incompletas: en proyectos de ensamblaje genómico, el modelo puede rellenar bases faltantes en regiones ambiguas.
- Generación de características para modelos de aprendizaje automático: los embeddings del modelo se pueden usar como entrada para modelos de predicción de expresión génica o efectos de mutaciones.
- Comparación de secuencias entre especies: aunque el modelo se entrenó en humano, puede servir como base para fine-tuning en otras especies y comparar representaciones evolutivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas de rendimiento en tareas genómicas (por ejemplo, predicción de promotores, variantes patogénicas) ni comparaciones con otros modelos como DNABERT o Nucleotide Transformer. Se recomienda consultar el artículo original de GENA-LM para evaluaciones sobre tareas de genómica.

## Requisitos de hardware

- **VRAM estimada**: en fp32 (~442 MB), puede ejecutarse en GPU con 4 GB o más. En bf16 (~220 MB) es suficiente para una RTX 3060 o similar.
- **GPUs recomendadas**: RTX 3060, RTX 4060, T4, RTX 4090, A100, H100, o cualquier GPU con soporte CUDA 12.9 y PyTorch 2.7.
- **Inferencia en consumer GPU**: sí, cabe en cualquier GPU con al menos 4 GB de VRAM para secuencias de 512 tokens.
- **Opciones de despliegue**: se puede usar con `transformers` (AutoModel, AutoModelForMaskedLM), exportar a ONNX o TensorRT para producción. No se menciona compatibilidad con llama.cpp ni Ollama (es un modelo de embeddings, no de generación de texto).
- **Latencia y throughput**: no se proporcionan datos, pero para un modelo de 110M y secuencias de 512 tokens, la inferencia en GPU es del orden de decenas de milisegundos por secuencia.

## Comparativa con modelos similares

Dentro de la familia GENA-LM, se comparan las variantes del mismo tamaño:

| Modelo | Parámetros | Contexto (tokens) | Entrenamiento | Licencia |
|---|---|---|---|---|
| GENA-LM-bert-base | 110M | 512 | Genoma humano (no T2T) | MIT |
| GENA-LM-t2t-bert-base (este) | 110M | 512 | Genoma humano T2T + SNP | MIT |
| GENA-LM-t2t-multi-species-bert-base | 110M | 512 | Múltiples especies | MIT |
| GENA-LM-t2t-bigbird-base | 110M | 4096 | Genoma humano T2T | MIT |
| GENA-LM-t2t-bert-large | 336M | 512 | Genoma humano T2T | MIT |

No se dispone de comparación con modelos de terceros como DNABERT o Nucleotide Transformer en la información disponible.

## Limitaciones y advertencias

- **Contexto limitado**: la ventana de 512 tokens (~4600 nucleótidos) puede ser insuficiente para regiones genómicas largas. Para secuencias más largas se recomienda usar las variantes BigBird (4096 tokens) o el modelo con memoria recurrente mencionado en el paper.
- **Especificidad humana**: el modelo fue entrenado solo en genoma humano T2T y SNP humanos; puede tener menor rendimiento en otras especies, aunque existe una variante multi-especie.
- **Sin NSP ni pooler**: este port no incluye la cabeza de predicción de siguiente oración ni el pooler original; para clasificación de secuencias se debe usar el `[CLS]` o pooling medio.
- **Riesgo de alucinación**: como modelo de MLM, puede predecir bases con confianza pero sin garantía de corrección biológica; no debe usarse como herramienta de diagnóstico sin validación adicional.
- **Dependencia de `trust_remote_code`**: al cargar el modelo se requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio. Se recomienda revisar el código fuente antes de su uso en producción.
- **Sin cuantizaciones predefinidas**: no se ofrecen pesos cuantizados (int8, int4) en la página, aunque se puede cuantizar manualmente.

## Enlaces

- [Modelo en HuggingFace: Tayzhoom/GEN-LM-t2t-bert-base](https://huggingface.co/Taykhoom/GEN-LM-t2t-bert-base)
- [Modelo original: AIRI-Institute/gena-lm-bert-base-t2t](https://huggingface.co/AIRI-Institute/gena-lm-bert-base-t2t)
- [Repositorio de GENA-LM en GitHub](https://github.com/AIRI-Institute/GENA_LM)
- [Artículo científico (Nucleic Acids Research, 2025
