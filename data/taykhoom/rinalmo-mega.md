# Taykhoom/RiNALMo-mega

## Resumen

RiNALMo-mega es un modelo de lenguaje especializado en ARN (ácido ribonucleico), desarrollado por el equipo de Penić et al. y portado a HuggingFace por Taykhoom. Se trata de la variante intermedia (148,1 millones de parámetros) de RiNALMo, una familia de modelos de lenguaje de ARN preentrenados sobre 36 millones de secuencias de ARN no codificante procedentes de múltiples bases de datos. El modelo está diseñado para capturar información estructural y funcional de las secuencias de ARN, y ha demostrado capacidad de generalización en tareas de predicción de estructura secundaria.

La relevancia actual de RiNALMo-mega radica en que es uno de los pocos modelos de lenguaje de ARN disponibles públicamente con pesos abiertos y una implementación compatible con el ecosistema HuggingFace Transformers. Su tamaño moderado (148M) ofrece un equilibrio entre calidad de representación y coste computacional, lo que lo hace accesible para laboratorios con recursos limitados. El modelo utiliza una arquitectura Transformer pre-LN con SwiGLU y codificación posicional RoPE, con una ventana de contexto práctica de aproximadamente 8192 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer pre-LN con FFN SwiGLU |
| Parametros totales | 148.057.452 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | ~8192 (práctico; RoPE sin límite duro) |
| Tipos de cuantizacion | no disponible (pesos en fp32/bf16; compatible con cuantización estándar de HF) |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | CC BY 4.0 (pesos) / Apache 2.0 (código) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

RiNALMo-mega sigue una arquitectura Transformer pre-LN con 30 capas, 20 cabezas de atención, dimensión de embedding de 640 y una capa FFN oculta de 1706 unidades con activación SwiGLU. La codificación posicional utiliza RoPE con base 10000 y formato no intercalado. La normalización emplea LayerNorm con épsilon 1e-5. El vocabulario consta de 22 tokens: tokens especiales (`<cls>`, `<pad>`, `<eos>`, `<unk>`, `<mask>`) y los nucleótidos A, C, G, T, más los códigos de ambigüedad IUPAC (I, R, Y, K, M, S, W, B, D, H, V, N) y el guion `-`. El tokenizador convierte U a T antes de codificar, ya que el modelo fue entrenado con T.

El preentrenamiento se realizó con el objetivo de modelado de lenguaje enmascarado (MLM) estilo BERT con una tasa de enmascarado del 15%, sobre 36 millones de secuencias de ARN no codificante. El checkpoint de partida es `rinalmo_mega_pretrained.pt` disponible en Zenodo. La implementación original utiliza Flash Attention 2.3.2 durante el entrenamiento; el port a HuggingFace expone backends eager, SDPA y Flash Attention 2 mediante el despacho `attn_implementation`. Una particularidad de la implementación es que el residual de atención se toma de la entrada normalizada (residual pre-LN no estándar), mientras que el FFN usa el esquema pre-LN convencional. Además, se aplica TokenDropout que reescala los embeddings incluso en inferencia, consistente con el código de entrenamiento original.

## Capacidades

- Generación de representaciones (embeddings) de secuencias de ARN a nivel de token y de secuencia (token CLS).
- Modelado de lenguaje enmascarado: predicción de nucleótidos enmascarados en una secuencia.
- Extracción de representaciones de capas intermedias (31 niveles: embedding + 30 capas).
- Soporte de atención eficiente mediante SDPA y Flash Attention 2.
- Capacidad de fine-tuning para tareas downstream de biología de ARN (predicción de estructura, localización subcelular, etc.).
- Manejo de secuencias de longitud variable con padding.
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje general).

## Casos de uso

- Predicción de estructura secundaria de ARN: las representaciones de RiNALMo-mega pueden alimentar cabezas de predicción para inferir pares de bases y bucles, aprovechando la capacidad del modelo para capturar información estructural.
- Clasificación de tipos de ARN no codificante: fine-tuning sobre el embedding CLS para distinguir entre diferentes clases de ARN (miRNA, lncRNA, snoRNA, etc.).
- Detección de sitios de unión a proteínas: uso de embeddings por token como características para modelos de clasificación que identifican regiones de interacción ARN-proteína.
- Análisis de variantes patogénicas: comparación de representaciones entre secuencias wild-type y mutantes para evaluar el impacto funcional de variantes en ARN.
- Anotación funcional de ARN recién secuenciados: generación de embeddings para agrupar secuencias por similitud funcional y transferir anotaciones de bases de datos.
- Investigación de mecanismos de regulación post-transcripcional: análisis de motivos de secuencia y su contexto estructural mediante representaciones de capas intermedias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo original de Nature Communications (doi:10.1038/s41467-025-60872-5) reporta evaluaciones en tareas de predicción de estructura y otras, pero esos datos no están incluidos en la documentación del port de HuggingFace. Se recomienda consultar la publicación original para métricas detalladas.

## Requisitos de hardware

- El modelo tiene 148 millones de parámetros, lo que en fp32 ocupa aproximadamente 592 MB; en bf16, unos 296 MB.
- Es viable en GPUs de consumo con al menos 4 GB de VRAM para inferencia en fp32, y menos de 2 GB en bf16 con cuantización.
- GPUs recomendadas: cualquier GPU moderna con soporte CUDA (RTX 2060 o superior) para inferencia; para fine-tuning, se recomienda al menos 8 GB de VRAM.
- Compatible con backends de atención eager, SDPA (PyTorch 2.0+) y Flash Attention 2 (requiere paquete `flash-attn`).
- Despliegue posible con HuggingFace Transformers estándar; no se menciona soporte nativo para vLLM, llama.cpp u Ollama, pero al ser un modelo de ARN, el uso principal es mediante la API de Transformers.
- Latencia y throughput: no disponible; al ser un modelo pequeño, se espera una inferencia rápida en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RiNALMo-micro | 33,5M | ~8192 | CC BY 4.0 | HuggingFace |
| **RiNALMo-mega** | **148,1M** | **~8192** | **CC BY 4.0** | **HuggingFace** |
| RiNALMo-giga | 650,9M | ~8192 | CC BY 4.0 | HuggingFace |

No se dispone de datos comparativos con otros modelos de ARN como RNA-FM o DNABERT-2 en la información proporcionada. La comparativa se limita a las variantes de la misma familia RiNALMo.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente con secuencias de ARN no codificante; su rendimiento en ARN codificante (mRNA) puede ser subóptimo.
- El tokenizador convierte U a T, lo que puede ser confuso si se trabaja con secuencias de ADN; es necesario tener en cuenta esta transformación.
- La implementación del residual pre-LN no estándar puede diferir de otros modelos Transformer; se debe mantener la coherencia al hacer fine-tuning.
- TokenDropout aplica un reescalado en inferencia que puede afectar a la magnitud de los embeddings; no desactivarlo sin conocer el efecto.
- Licencia CC BY 4.0 para los pesos: permite uso comercial con atribución, pero hay que verificar el cumplimiento de la licencia del código (Apache 2.0) y de los datos originales.
- No es un modelo de lenguaje general; no genera texto ni responde a instrucciones. Su uso se limita a tareas de biología computacional.
- No se han documentado sesgos específicos, pero al estar entrenado en un corpus limitado de ARN no codificante, puede haber sesgos hacia secuencias bien representadas en las bases de datos utilizadas.
- Riesgo de alucinación en la predicción de nucleótidos enmascarados: las predicciones son probabilísticas y pueden no corresponder a variantes biológicamente plausibles.

## Enlaces

- HuggingFace: https://huggingface.co/Taykhoom/RiNALMo-mega
- Colección RiNALMo: https://huggingface.co/collections/Taykhoom/rinalmo
- Artículo Nature Communications: https://www.nature.com/articles/s41467-025-60872-5
- PDF del artículo: https://www.nature.com/articles/s41467-025-60872-5.pdf
- Repositorio GitHub original: https://github.com/lbcb-sci/RiNALMo
- Checkpoint original en Zenodo: https://zenodo.org/records/15043668
