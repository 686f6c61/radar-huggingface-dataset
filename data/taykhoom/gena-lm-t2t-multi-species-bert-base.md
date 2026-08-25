# Taykhoom/GENA-LM-t2t-multi-species-bert-base

## Resumen

GENA-LM-t2t-multi-species-bert-base es un port minimalista en HuggingFace de la variante `bert-base-t2t-multi` de la familia GENA-LM, desarrollada originalmente por el AIRI Institute. Se trata de un modelo de lenguaje enmascarado (MLM) basado en la arquitectura BERT, diseñado para procesar secuencias largas de ADN humano y de múltiples especies. El modelo emplea tokenización BPE en lugar de k-mers, lo que permite representar el genoma de forma más compacta y capturar dependencias de mayor alcance. Con 110 millones de parámetros y una ventana de contexto de 512 tokens (aproximadamente 4.608 nucleótidos), este modelo es una opción ligera y eficiente para tareas de análisis genómico, como la predicción de efectos de variantes o la clasificación de regiones reguladoras.

Este port mantiene una paridad bit-exacta con los pesos originales en el backend `eager`, y añade soporte para backends de atención acelerada (`sdpa` y `flash_attention_2`), lo que facilita su integración en pipelines de producción. Su licencia MIT permite su uso comercial sin restricciones, y su tamaño compacto lo hace ejecutable en GPUs de consumo. La relevancia de este modelo radica en su capacidad para trabajar con genomas completos de múltiples especies, incluyendo el genoma humano T2T, y en su adaptación a longitudes de secuencia mayores que los modelos previos como DNABERT o Nucleotide Transformer.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pre-LayerNorm BERT (sin capa final de LayerNorm) |
| Parámetros totales | 110.650.880 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens BPE (~4.608 nucleótidos) |
| Tipos de cuantización | No disponible (pesos en safetensors; se puede cuantizar a FP16, BF16, INT8, etc.) |
| Idiomas soportados | No aplica (modelo de secuencias de ADN, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura BERT con 12 capas, 12 cabezas de atención, dimensión de embedding de 768 y FFN de 3.072 unidades con activación GELU. Utiliza codificación posicional aprendida absoluta y normalización pre-LayerNorm (con eps=1e-12). La capa de salida no incluye LayerNorm final, y los embeddings de entrada y el decodificador MLM están atados.

El entrenamiento se realizó con el objetivo de masked language modeling (MLM), enmascarando el 15% de los tokens siguiendo el esquema de BigBird. Los datos incluyen el genoma humano T2T (Telomere-to-Telomere) y genomas de múltiples especies de ENSEMBL release 108, aumentados con SNPs de gnomAD. Se ejecutaron 1.925.000 iteraciones con un tamaño de batch de 256 y secuencias de 512 tokens. El vocabulario BPE está entrenado sobre ADN y contiene 32.000 tokens, incluyendo los tokens especiales `[CLS]`, `[SEP]`, `[PAD]`, `[UNK]` y `[MASK]`. El modelo no incluye el head NSP ni el pooler original, ya que este port se centra en la generación de embeddings y logits MLM.

## Capacidades

- Generación de embeddings contextuales de secuencias de ADN: el modelo produce representaciones vectoriales para cada token y para la secuencia completa mediante el token `[CLS]` o pooling de posiciones no padding.
- Predicción de tokens enmascarados: puede predecir la probabilidad de nucleótidos en posiciones enmascaradas, útil para tareas de imputación o evaluación de variantes.
- Fine-tuning para tareas específicas: se puede adaptar a clasificación de secuencias, regresión o etiquetado de tokens mediante cabezas adicionales.
- Soporte de backends de atención eficientes: compatible con `sdpa` y `flash_attention_2` para acelerar la inferencia en secuencias largas.
- Capacidad de procesamiento multiespecie: entrenado con genomas de múltiples organismos, lo que permite su aplicación a datos no humanos.
- Sin capacidades de tool calling, agentes o razonamiento multi-paso: es un modelo puramente de representación de secuencias, no generativo.

## Casos de uso

- Análisis de variantes genéticas: el modelo puede predecir el impacto de variantes de un solo nucleótido (SNP) mediante la comparación de la probabilidad de la secuencia original y la mutada, ayudando a priorizar variantes funcionales.
- Imputación de regiones genómicas: al predecir tokens enmascarados, se pueden rellenar regiones de baja calidad en datos de secuenciación, mejorando la integridad de los análisis.
- Clasificación de regiones regulatorias: con un head de clasificación sobre el embedding `[CLS]`, se pueden identificar promotores, enhancers o sitios de unión a factores de transcripción en secuencias de múltiples especies.
- Predicción de efectos de mutaciones en proteínas: aunque el modelo es de ADN, se puede aplicar a regiones codificantes para estimar la patogenicidad de variantes en genes.
- Análisis comparativo entre especies: al estar entrenado en múltiples genomas, se puede usar para alinear o comparar regiones homólogas y estudiar conservación evolutiva.
- Generación de embeddings para bases de datos genómicas: se pueden precalcular embeddings de regiones genómicas y usarlos como características en modelos de aprendizaje automático para tareas como predicción de splicing o anotación de elementos funcionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no incluye métricas de rendimiento en tareas como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje natural ni de razonamiento. Su evaluación se centra en tareas de genómica (como predicción de variantes, clasificación de regiones), para las que no se proporcionan datos en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: con 110 millones de parámetros, el modelo ocupa aproximadamente 440 MB en FP32, 220 MB en FP16 y 110 MB en INT8. La memoria adicional para activaciones es mínima para secuencias de hasta 512 tokens.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1060, RTX 3060 o superiores pueden ejecutar el modelo sin problemas. También funciona en CPU, aunque con mayor latencia.
- Compatibilidad con GPUs de consumo: sí, es ligero y cabe en cualquier GPU moderna de consumo (por ejemplo, RTX 3060, RTX 4060).
- Opciones de despliegue: se puede servir mediante la biblioteca `transformers` de HuggingFace, con backends `sdpa` o `flash_attention_2` para acelerar. No es compatible con vLLM ni llama.cpp, ya que no es un modelo generativo.
- Latencia y throughput: no se proporcionan datos específicos. En una GPU RTX 3060, la inferencia de un batch de 32 secuencias de 512 tokens debería completarse en menos de 100 ms, pero no hay cifras oficiales.

## Comparativa con modelos similares

La siguiente tabla compara este modelo con otras variantes de GENA-LM disponibles en HuggingFace:

| Modelo | Parámetros | Capas | Dimensión | Contexto (tokens) | Notas |
|---|---|---|---|---|---|
| GENA-LM-t2t-multi-species-bert-base | 110M | 12 | 768 | 512 | Este modelo; entrenado en genomas multi-especie |
| GENA-LM-bert-base | 110M | 12 | 768 | 512 | Pre-entrenado solo en humano |
| GENA-LM-t2t-bert-base | 110M | 12 | 768 | 512 | Entrenado con genoma humano T2T |
| GENA-LM-t2t-lastln-base | 110M | 12 | 768 | 512 | Incluye capa final de LayerNorm |
| GENA-LM-t2t-bert-large | 336M | 24 | 1024 | 512 | Versión grande |
| GENA-LM-t2t-bigbird-base | 110M | 12 | 768 | 4096 | BigBird, contexto más largo |
| GENA-LM-t2t-sparse-bigbird-base | 110M | 12 | 768 | 4096 | Atención dispersa |

No se dispone de comparaciones con modelos externos como DNABERT o Nucleotide Transformer en términos de rendimiento, ya que no se han publicado benchmarks en la información proporcionada.

## Limitaciones y advertencias

- Sesgos poblacionales: el entrenamiento se realizó principalmente con genomas humanos (T2T) y de especies de ENSEMBL, lo que puede introducir sesgos hacia poblaciones representadas en esos datos. Se recomienda validar en poblaciones diversas.
- Riesgo de alucinación: al ser un modelo de MLM, las predicciones de tokens enmascarados no son deterministas y pueden producir secuencias no reales, por lo que no debe usarse para llamadas clínicas sin validación.
- Limitación de contexto: la ventana de 512 tokens (~4.6 kb) es corta para regiones genómicas largas; para secuencias mayores se necesitan modelos como las variantes BigBird.
- No apto para diagnóstico clínico: aunque es útil para investigación, no está validado para uso médico directo.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el código de este port incluye `trust_remote_code`, lo que implica que el usuario debe revisar el código personalizado antes de usarlo.
- Dependencia del código custom: al ser un port con `custom_code`, requiere activar `trust_remote_code=True` en HuggingFace, lo que implica una revisión de seguridad del código.
- No soporta generación de texto: no es un modelo generativo, solo de encoding y MLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Taykhoom/GENA-LM-t2t-multi-species-bert-base
- Colección GENA-LM (port): https://huggingface.co/collections/Taykhoom/gena-lm-6a8cec0862e11d4f81d059ab
- Repositorio original AIRI Institute: https://huggingface.co/AIRI-Institute/gena-lm-bert-base-t2t-multi
- Código fuente en GitHub: https://github.com/AIRI-Institute/GENA_LM
- Paper científico: https://academic.oup.com/nar/article/53/2/gkae1310/7954523
