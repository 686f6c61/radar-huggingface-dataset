# Taykhoom/GENA-LM-bert-base

## Resumen

GENA-LM-bert-base es un modelo de lenguaje enmascarado (masked language model, MLM) diseñado para trabajar con secuencias de ADN. Se trata de un port mínimo para Hugging Face del modelo homónimo original del Instituto AIRI (Rusia), que ha sido reimplementado y verificado para garantizar una paridad bit-exacta con los pesos originales. El modelo emplea una arquitectura BERT pre-LayerNorm con tokenización BPE sobre el alfabeto de nucleótidos y está preentrenado exclusivamente con el genoma humano T2T (GCA_009914755.3). Con 110,65 millones de parámetros y una ventana de contexto de 512 tokens BPE (aproximadamente 4 608 nucleótidos), resulta adecuado para tareas de representación y clasificación de secuencias genómicas de tamaño moderado.

La relevancia de este modelo radica en que, a pesar de su tamaño contenido, ofrece una alternativa eficiente para el análisis genómico, con la flexibilidad de poder ajustarse en tareas específicas como la predicción de elementos reguladores o la anotación de variantes. Además, al ser un port de Hugging Face, se integra directamente con el ecosistema de Transformers, permitiendo el uso de backends de atención optimizados como SDPA y FlashAttention-2. Su licencia MIT facilita su uso comercial y académico sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT pre-LayerNorm (12 capas, 12 cabezas de atención, 768 de dimensión de embedding, FFN 3072 con GELU) |
| Parámetros totales | 110 650 880 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens BPE (~4 608 nucleótidos) |
| Tipos de cuantización | No disponible (no se mencionan cuantizaciones en la documentación) |
| Idiomas soportados | No disponible (modelo específico de ADN, no de idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una implementación de BERT con normalización pre-LayerNorm (sin capa de LayerNorm final), una configuración que facilita el entrenamiento de modelos profundos. El vocabulario está compuesto por 32 000 tokens BPE entrenados sobre secuencias de ADN, incluyendo tokens especiales como `[CLS]`, `[SEP]`, `[PAD]`, `[UNK]` y `[MASK]`. La codificación posicional es absoluta aprendida.

El entrenamiento se realizó con un objetivo de modelado de lenguaje enmascarado con un 15% de tokens enmascarados, siguiendo la metodología propuesta en el artículo de BigBird. Los datos de preentrenamiento corresponden al genoma humano T2T (ensamblaje GCA_009914755.3). El modelo fue entrenado durante 500 000 iteraciones con un tamaño de batch de 256 y una longitud de secuencia de 512 tokens. El checkpoint original proviene de `AIRI-Institute/gena-lm-bert-base`.

Este port de Hugging Face incluye una verificación de paridad exhaustiva: todas las representaciones de los 13 niveles (embedding + 12 bloques transformer) y los logits de MLM son bit-exactos con los pesos originales para el backend `eager`. Los backends `sdpa` y `flash_attention_2` coinciden con `eager` dentro de la tolerancia de punto flotante esperada. No se incluyen la cabeza NSP ni el pooler del modelo original; el port se centra en tareas de embedding y MLM. Los embeddings de entrada y el decoder de MLM están atados.

## Capacidades

- Generación de embeddings de secuencias de ADN: puede producir representaciones de tokens y de secuencias completas (embedding CLS o media de tokens no padding) para usar como entrada en tareas de clasificación o regresión.
- Modelado de lenguaje enmascarado: permite predecir nucleótidos enmascarados en una secuencia, útil para tareas de *fill-mask* en genómica.
- Extracción de representaciones de capas intermedias: mediante `output_hidden_states=True` se pueden obtener embeddings de cualquier capa (por ejemplo, capa 6) para análisis de representaciones.
- Soporte de backends de atención optimizados: `eager`, `sdpa` (PyTorch 2.0+) y `flash_attention_2`, lo que permite adaptar el rendimiento según el hardware.
- Fine-tuning estándar de Hugging Face: se puede ajustar el modelo para tareas de clasificación de secuencias o etiquetado de tokens.
- No tiene capacidades de generación de texto libre, ni tool calling, ni procesamiento de agentes, ni multimodalidad.

## Casos de uso

- Predicción de elementos reguladores: mediante fine-tuning sobre datos de promotores y potenciadores, el modelo puede clasificar regiones regulatorias a partir de su secuencia. Su tamaño compacto y su entrenamiento en ADN humano lo hacen adecuado para esta tarea.
- Anotación de variantes genéticas: se puede usar para clasificar el efecto de variantes (por ejemplo, patogénicas vs benignas) generando embeddings de las secuencias flanqueantes y alimentando un clasificador.
- Generación de embeddings para búsqueda de similitud: el modelo produce representaciones densas de secuencias que pueden usarse para buscar homólogos en bases de datos genómicas.
- Clasificación de tipos de secuencia (codificante vs no codificante): entrenando una capa de clasificación sobre los embeddings del modelo, se puede diferenciar entre exones, intrones, promotores, etc.
- Detección de sitios de unión de factores de transcripción: con datos de ChIP-seq, el modelo puede ser afinado para predecir si una secuencia contiene un motivo de unión.
- Análisis evolutivo comparado: aunque está entrenado en humano, se pueden comparar embeddings de secuencias de otras especies para estudiar conservación y divergencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación del port se centra en la verificación de paridad con los pesos originales, pero no incluye métricas como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de dominio biológico y no de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 110,65 millones de parámetros. En FP32, el peso ocupa unos 0,44 GB; en FP16, 0,22 GB. Con los activos y overhead, se puede ejecutar en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, por ejemplo NVIDIA RTX 3060, RTX 4060, GTX 1080 Ti, o incluso una Tesla T4. Para uso intensivo, una RTX 4090 o A100 sería excesiva pero viable.
- Si cabe en GPU consumer: sí, cabe en la mayoría de GPUs de consumo con 4 GB o más. También puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo de HuggingFace, se puede usar con `transformers` directamente, con vLLM (aunque vLLM está más orientado a modelos generativos, podría funcionar), TGI (Text Generation Inference), o mediante ONNX Runtime para optimización. No se menciona soporte para llama.cpp ni GGUF, pero al ser un modelo de encoder, no es el típico uso de llama.cpp.
- Latencia y throughput: no se proporcionan datos específicos. Dado el tamaño pequeño, la inferencia en GPU debería ser de milisegundos por secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| **GENA-LM-bert-base (este)** | 110M | 512 tokens (~4.6k nucleótidos) | MIT | Port con verificación bit-exacta |
| GENA-LM-t2t-bigbird-base | 110M | 4096 tokens (~36k nucleótidos) | MIT | Usa atención BigBird para contextos largos |
| GENA-LM-t2t-multi-species-bert-base | 110M | 512 tokens | MIT | Preentrenado en múltiples especies |

Los tres modelos comparten la misma arquitectura base, pero se diferencian en el contexto (el bigbird-base permite secuencias mucho más largas) y en el dominio de entrenamiento (multi-species vs solo humano). No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- Sesgo de entrenamiento: el modelo fue preentrenado únicamente con el genoma humano T2T, por lo que su rendimiento en otras especies puede ser limitado. Para aplicaciones no humanas, se recomienda el modelo multi-species.
- Longitud de contexto: la ventana de 512 tokens BPE (≈4.6k nucleótidos) puede ser insuficiente para regiones genómicas largas; para eso se recomienda la variante bigbird.
- Riesgo de alucinación: al ser un modelo MLM, puede predecir nucleótidos enmascarados incorrectamente, pero no genera secuencias completas, por lo que el riesgo es menor.
- No incluye la cabeza NSP ni el pooler originales, por lo que no se puede usar directamente para tareas de clasificación de pares de secuencias como el BERT original. Para ello, se debe usar la representación CLS o pooling.
- Licencia MIT: permite uso comercial y modificación sin restricciones, pero se recomienda citar el paper original en publicaciones.
- El port es de un autor independiente (Taykhoom) y no está respaldado oficialmente por AIRI Institute, aunque se ha verificado la paridad de pesos.

## Enlaces

- Modelo en Hugging Face (port): https://huggingface.co/Taykhoom/GENA-LM-bert-base
- Modelo original de AIRI Institute: https://huggingface.co/AIRI-Institute/gena-lm-bert-base
- Código fuente original en GitHub: https://github.com/AIRI-Institute/GENA_LM
- Paper de GENA-LM en Nucleic Acids Research: https://academic.oup.com/nar/article/53/2/gkae1310/7954523
- Colección de modelos GENA-LM de Taykhoom: https://huggingface.co/collections/Taykhoom/gena-lm-6a8cec0862e11d4f81d059ab
