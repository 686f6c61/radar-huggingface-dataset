# Taykhoom/GENA-LM-t2t-bigbird-base

## Resumen

El modelo GENA-LM-t2t-bigbird-base es un port minimalista del checkpoint original `bigbird-base-t2t` de la familia GENA-LM, desarrollada por el AIRI Institute y reempaquetada por Taykhoom. Se trata de un modelo de lenguaje enmascarado (MLM) basado en la arquitectura BigBird, entrenado específicamente sobre secuencias largas de ADN humano, incluyendo el ensamblaje T2T y variantes de los proyectos 1000 Genomas y gnomAD. Su objetivo principal es proporcionar representaciones contextuales de fragmentos de ADN de hasta 4096 tokens BPE, equivalentes a unas 36.864 bases nucleotídicas, lo que permite modelar regiones genómicas mucho más largas que los modelos BERT convencionales.

La relevancia de este modelo radica en que combina la eficiencia de la atención dispersa por bloques de BigBird con un vocabulario BPE especializado en ADN, permitiendo tareas como la predicción de elementos reguladores, la clasificación de variantes o la generación de embeddings genómicos de alta calidad. Al estar disponible bajo licencia MIT y con pesos en formato safetensors, puede integrarse fácilmente en pipelines de investigación con `transformers` estándar, sin necesidad de código remoto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BigBird (block-sparse attention, block size 64, 3 random blocks) |
| Parametros totales | 113.993.984 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 4096 tokens BPE (~36.864 nucleotidos) |
| Tipos de cuantizacion | no disponible (pesos en fp32, formato safetensors) |
| Idiomas soportados | ADN (no idiomas naturales) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura BigBird estándar de `transformers` (`model_type=big_bird`), con 12 capas, 12 cabezas de atención, dimensión de embedding 768 y FFN de 3072 con activación GELU-new. Emplea codificación posicional absoluta aprendida y Post-LayerNorm con epsilon 1e-12. El vocabulario BPE de 32.000 tokens se entrenó exclusivamente sobre ADN humano, incluyendo los tokens especiales `[CLS]`, `[SEP]`, `[PAD]`, `[UNK]` y `[MASK]`. La atención es de tipo `original_full` para secuencias cortas y `block_sparse` para largas, siguiendo el comportamiento estándar de BigBird.

El preentrenamiento se realizó con el objetivo de modelado de lenguaje enmascarado (15% de tokens enmascarados, estilo BigBird) sobre el genoma humano T2T, enriquecido con SNPs de los proyectos 1000 Genomas y gnomAD. Se usaron 1.070.000 iteraciones con un batch de 256. La verificación de paridad indica que los pesos del port son bit-exactos respecto al checkpoint original para todos los niveles de representación y logits de MLM. No se ha reportado el uso de técnicas como RLHF o DPO, al tratarse de un modelo de representación.

## Capacidades

- Generación de embeddings de secuencias de ADN: produce vectores de 768 dimensiones por token y un embedding de secuencia a través del token `[CLS]`.
- Modelado de lenguaje enmascarado (MLM): predice nucleótidos o fragmentos enmascarados en una secuencia dada, útil para tareas de imputación o detección de variantes.
- Modelado de contexto largo: gracias a la atención BigBird, puede procesar hasta 36.864 nucleótidos en una sola pasada, superando la limitación de 512 tokens de BERT.
- Sin soporte de tool calling ni agentes: al ser un modelo encoder solo (no generativo), no admite funciones de tool calling ni razonamiento multi-paso.
- Multilingüismo: no aplica; es específico para ADN humano.
- No tiene modo de razonamiento, visión ni audio.

## Casos de uso

- Análisis de variantes genómicas: dado un fragmento de ADN con una variante (SNP), el modelo puede predecir el efecto de la mutación mediante MLM, comparando la probabilidad de la base original frente a la variante.
- Clasificación de regiones reguladoras: se puede afinar sobre datos de cromatina (p. ej., picos de ATAC-seq, ChIP-seq) para identificar promotores, potenciadores o regiones de unión de factores de transcripción, aprovechando el contexto largo para capturar interacciones distantes.
- Generación de embeddings de secuencias para aprendizaje supervisado: los embeddings de `[CLS]` o la media de tokens pueden alimentar clasificadores para predecir fenotipos, expresión génica o splicing, en pipelines de bioinformática.
- Análisis de regiones no codificantes: el contexto de 36 kb permite modelar intrones largos o elementos reguladores en regiones intergénicas, donde los modelos de ventana corta fallan.
- Detección de variantes patogénicas: combinando las predicciones de MLM con información de anotación funcional, se puede priorizar variantes candidatas en estudios de asociación genética.
- Pre-entrenamiento específico de dominio: el checkpoint puede servir como punto de partida para fine-tuning en tareas como predicción de estructura de cromatina, sitios de splicing o anotación de genes, reduciendo el coste computacional frente a entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas comparativas (MMLU, HumanEval, etc.) porque el modelo es específico de ADN y no se evalúa en tareas de lenguaje natural. La única verificación reportada es la paridad bit-exacta con el checkpoint original, con una diferencia máxima absoluta de 0.00 en logits y representaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: con 114M de parámetros en fp32, el modelo ocupa aproximadamente 456 MB de pesos. La activación para una secuencia de 4096 tokens con 12 cabezas y 768 de dimensión puede requerir entre 2 y 4 GB de VRAM según el batch size, por lo que cabe en GPUs de consumo como RTX 3060, RTX 4070 o superiores.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para inferencia en lotes pequeños; para fine-tuning con batch grande se recomienda 12 GB o más (RTX 3080, RTX 3090, A10, etc.).
- Si cabe en consumer GPU: sí, sin problemas en tarjetas de gama media y alta.
- Opciones de despliegue: al ser un modelo `transformers` estándar, puede ejecutarse con `pipelines` de Hugging Face, `vLLM` (aunque no es óptimo para MLM), `llama.cpp` (con conversión a GGUF, aunque no se proporciona), o directamente con PyTorch. No requiere `trust_remote_code`.
- Latencia y throughput: no se dispone de datos concretos; en una GPU moderna, la inferencia de una secuencia de 4096 tokens con batch 1 debería estar en el orden de decenas de milisegundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| GENA-LM-t2t-bigbird-base (este) | 113M | 4096 BPE (~36K nt) | MLM sobre T2T + SNP | MIT |
| GENA-LM-bert-base | 110M | 512 tokens | MLM sobre genoma humano | MIT |
| GENA-LM-t2t-sparse-bigbird-base | 110M | 4096 BPE | MLM T2T | MIT |
| DNABERT-2 (no incluido en la info) | 110M | 512 tokens | MLM sobre genoma humano | MIT |

La principal diferencia con los BERT base de la misma familia es la ventana de contexto: BigBird permite procesar secuencias 8 veces más largas que BERT base (4096 vs 512 tokens BPE). La versión `sparse-bigbird-base` usa atención dispersa más agresiva, pero este port mantiene la atención BigBird estándar. No hay datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena solo con ADN humano (T2T y SNP de poblaciones de los proyectos 1000 Genomas y gnomAD), por lo que no es adecuado para secuencias de otras especies sin fine-tuning.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; sin embargo, las predicciones de MLM pueden ser incorrectas en regiones con baja cobertura o variantes raras, por lo que no debe usarse como herramienta de diagnóstico sin validación experimental.
- Limitaciones de contexto: aunque la ventana es de 4096 BPE (~36K nt), no es suficiente para regiones genómicas completas; para análisis de cromosomas completos se requiere segmentación.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero se recomienda revisar la licencia del checkpoint original (MIT también, según la model card).
- Caveat importante para producción: el diagnóstico de `output_attentions` en modo block-sparse de `transformers` 4.57.6 no es fiable (no son probabilidades post-softmax válidas). No usar ese diagnóstico para interpretación de atención en secuencias largas.
- No soporta `sdpa` ni `flash_attention_2`; solo atención full o block-sparse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Taykhoom/GENA-LM-t2t-bigbird-base
- Checkpoint original: https://huggingface.co/AIRI-Institute/gena-lm-bigbird-base-t2t
- Colección GENA-LM: https://huggingface.co/collections/Taykhoom/gena-lm-6a8cec0862e11d4f81d059ab
- Repositorio GitHub del proyecto GENA-LM: https://github.com/AIRI-Institute/GENA_LM
- Publicación científica: Fishman et al., *Nucleic Acids Research*, 2025, DOI: 10.1093/nar/gkae1310
