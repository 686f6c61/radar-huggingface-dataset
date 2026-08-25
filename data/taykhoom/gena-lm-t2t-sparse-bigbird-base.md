# Taykhoom/GENA-LM-t2t-sparse-bigbird-base

## Resumen

GENA-LM-t2t-sparse-bigbird-base es un port minimalista en HuggingFace de la variante bigbird-base-sparse-t2t de GENA-LM, un modelo de lenguaje enmascarado (MLM) basado en la arquitectura BigBird con atención block-sparse, diseñado para trabajar con secuencias largas de ADN humano. El modelo original fue desarrollado por el Instituto AIRI y este port lo publica el usuario Taykhoom, con la particularidad de que implementa las ecuaciones matemáticas de la atención block-sparse en PyTorch puro, sin depender del kernel Triton/DeepSpeed original que no es compatible con GPU Hopper (sm90).

El modelo tiene 114 millones de parámetros, 12 capas y 768 dimensiones de embedding, con una ventana de contexto de hasta 4096 tokens BPE (equivalentes a aproximadamente 36 864 nucleótidos), lo que permite procesar regiones genómicas completas en una sola pasada. Se entrenó con el objetivo de MLM con un 15 % de tokens enmascarados sobre el genoma humano T2T, enriquecido con variantes de 1000 Genomes y gnomAD, durante 800 000 iteraciones con un batch de 256. Su licencia MIT y su implementación sin dependencias exóticas lo hacen especialmente atractivo para integrar en pipelines de genómica computacional que necesiten embeddings de secuencias largas de ADN con recursos de hardware moderados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pre-LayerNorm BERT con BigBird block-sparse attention |
| Parámetros totales | 114 994 752 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens BPE (≈36 864 nucleótidos) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo biológico para secuencias de ADN) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de BERT con normalización pre-LayerNorm y una capa de LayerNorm final adicional. La atención es de tipo BigBird block-sparse, con un tamaño de bloque de 64, 2 bloques globales, 3 bloques de ventana deslizante y 3 bloques aleatorios por cabeza. Esta configuración reduce la complejidad computacional frente a la atención densa, permitiendo manejar secuencias de 4096 tokens con un coste razonable. La tokenización es de tipo byte-pair (BPE) con un vocabulario de 32 000 unidades entrenadas sobre ADN, que incluye los tokens especiales `[CLS]`, `[SEP]`, `[PAD]`, `[UNK]` y `[MASK]`.

El preentrenamiento se realizó con el objetivo de MLM enmascarando el 15% de los tokens, siguiendo la metodología del artículo de BigBird. El conjunto de datos fue el genoma humano T2T (telómero a telómero) enriquecido con variantes de los proyectos 1000 Genomes y gnomAD. Se ejecutaron 800 000 iteraciones con un tamaño de batch de 256. La principal innovación de este port es que evalúa las ecuaciones matemáticas de la atención block-sparse en PyTorch puro, consumiendo directamente el layout de bloques del checkpoint original (`master_layout`), lo que elimina la dependencia de DeepSpeed y permite ejecutar el modelo en cualquier GPU moderna, incluida la arquitectura Hopper. Para secuencias cortas (menos de 256 tokens), el layout es completamente denso y el modelo se comporta como un BERT estándar.

## Capacidades

- Generación de representaciones (embeddings) de secuencias de ADN de hasta 36 864 nucleótidos de longitud en una sola pasada.
- Modelado de lenguaje enmascarado (fill-mask): puede predecir nucleótidos o k-mers enmascarados en una secuencia, útil para tareas de imputación genética.
- Extracción de embeddings a nivel de token y de secuencia (token CLS) para tareas de clasificación, regresión o búsqueda de similitud.
- Soporte de atención block-sparse eficiente en PyTorch puro, sin dependencias de kernels exóticos.
- Compatible con el backend SDPA (PyTorch 2.0+) para una atención enmascarada fusionada y más rápida.
- No soporta Flash Attention 2 (lanzará un error explícito si se solicita, porque no puede expresar el máscara arbitraria por bloque).
- Verificación de paridad bit-exacta con el modelo original para secuencias cortas (diferencia máxima absoluta = 0.00 en todos los niveles de representación y logits de MLM).

## Casos de uso

- Análisis de variantes genéticas: dado un segmento de ADN con una variante de interés (SNP, indel), el modelo puede generar representaciones contextuales que ayuden a predecir el efecto funcional de la mutación, por ejemplo, clasificando si una variante es patogénica o benigna.
- Imputación de regiones genómicas: el modelo puede rellenar nucleótidos enmascarados en secuencias parcialmente conocidas, lo que resulta útil para reconstruir regiones con baja cobertura de secuenciación.
- Clasificación de elementos reguladores: los embeddings de secuencias de regiones promotoras o potenciadoras pueden servir de entrada a clasificadores supervisados para identificar elementos reguladores activos o inactivos.
- Búsqueda de similitud en bases de datos genómicas: los embeddings de CLS pueden indexarse y compararse para encontrar regiones ortólogas o secuencias con funciones similares en genomas de referencia.
- Análisis de metagenómica: aunque el modelo está entrenado en ADN humano, puede adaptarse con fine-tuning para clasificar fragmentos de secuencias metagenómicas y asignarlos a especies o funciones.
- Fine-tuning para predicción de estructura o función: el modelo sirve como base preentrenada para tareas de predicción de estructuras de cromatina, sitios de unión de factores de transcripción o elementos de histonas, usando las representaciones de tokens como entrada a cabezas de clasificación específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original de AIRI no incluye métricas comparativas en la documentación accesible, y este port no añade datos adicionales de rendimiento en tareas de referencia como MMLU o HumanEval, que no son aplicables a un modelo biológico de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifica oficialmente, pero para un modelo de 114M de parámetros en fp32, el peso en memoria es de aproximadamente 460 MB. Con una secuencia de 4096 tokens, el uso de memoria puede superar los 2 GB en GPU, dependiendo del tamaño de batch. En cuantización fp16, el peso se reduce a unos 230 MB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar la inferencia en modo denso para secuencias cortas. Para secuencias largas (4096 tokens), se recomienda una GPU con 8 GB o más, como la RTX 3060, RTX 3070 o superiores. La implementación en PyTorch puro permite ejecutarse también en GPU de gama de entrada.
- Capacidad en GPU de consumo: sí, el modelo cabe en GPU de consumo como la RTX 3060 (12 GB) o RTX 4060 (8 GB) incluso con batch moderado.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede desplegarse con HuggingFace Transformers, con el backend SDPA para aceleración. No se menciona soporte para vLLM, llama.cpp u Ollama, pero al ser de tipo encoder, se puede servir mediante los endpoints de inferencia de Hugging Face o con frameworks como FastAPI para integraciones personalizadas.
- Latencia y throughput: no se dispone de datos publicados. Para un modelo de este tamaño, se espera una latencia de decenas de milisegundos por secuencia de 512 tokens en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| GENA-LM-t2t-sparse-bigbird-base (este modelo) | 114 M | 4096 tokens | BigBird block-sparse | MIT |
| GENA-LM-bert-base | 110 M | 512 tokens | BERT | MIT |
| GENA-LM-t2t-bert-base | 110 M | 512 tokens | BERT | MIT |
| GENA-LM-t2t-bigbird-base | 110 M | 4096 tokens | BigBird (dense) | MIT |

La principal diferencia con los modelos BERT de la misma familia es la longitud de contexto: mientras que los BERT se limitan a 512 tokens, este modelo puede procesar 4096 tokens (36 864 nucleótidos) gracias a la atención block-sparse. Frente a la variante bigbird-base (no sparse), este port es una reimplementación en PyTorch puro que evita la dependencia de DeepSpeed, lo que lo hace más portable y fácil de desplegar en entornos modernos.

## Limitaciones y advertencias

- No se ha evaluado su rendimiento en tareas de predicción funcional o clasificación de variantes, por lo que los resultados de fine-tuning pueden variar.
- El modelo se entrenó exclusivamente con ADN humano (T2T con SNPs de 1000Genomes y gnomAD); su capacidad de generalización a otras especies o a ADN no humano es limitada y puede producir resultados poco fiables.
- La implementación block-sparse en PyTorch puro no tiene paridad de ejecución con el kernel Triton original (que no puede ejecutarse en GPU Hopper). Para secuencias cortas se verifica la paridad bit-exacta, pero para secuencias largas la paridad es matemática, no de ejecución exacta con el kernel heredado.
- No soporta Flash Attention 2, lo que limita la aceleración en GPUs modernas que solo ofrecen este backend.
- El modelo es un modelo de máscara (MLM) y no generativo: no puede generar secuencias de ADN de forma autónoma, solo completar tokens enmascarados.
- La licencia MIT permite uso comercial sin restricciones, pero no hay garantía de exactitud biológica para aplicaciones clínicas.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/Taykhoom/GENA-LM-t2t-sparse-bigbird-base
- Modelo original de AIRI: https://huggingface.co/AIRI-Institute/gena-lm-bigbird-base-sparse-t2t
- Colección GENA-LM: https://huggingface.co/collections/Taykhoom/gena-lm-6a8cec0862e11d4f81d059ab
- Repositorio GitHub de GENA-LM: https://github.com/AIRI-Institute/GENA_LM
