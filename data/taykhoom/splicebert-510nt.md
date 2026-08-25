# Taykhoom/SpliceBERT-510nt

## Resumen

SpliceBERT-510nt es un modelo de lenguaje de ARN basado en la arquitectura BERT, desarrollado por el grupo de investigación de Yuedong Yang (Chen et al., 2024) y portado a HuggingFace por Taykhoom. Se trata de un modelo especializado en el procesamiento de secuencias primarias de ARN de vertebrados, entrenado con masked language modeling (MLM) sobre más de dos millones de secuencias de 72 especies. Su propósito principal es la predicción de sitios de empalme (splicing) y la generación de representaciones (embeddings) de fragmentos de ARN de longitud fija.

El modelo se presenta como un port mínimo del checkpoint original `SpliceBERT.510nt` disponible en Zenodo, con verificación de paridad de representaciones ocultas frente al checkpoint original (diferencia máxima absoluta inferior a 1e-5). Con aproximadamente 19,5 millones de parámetros y una ventana de contexto fija de 510 nucleótidos, está pensado para tareas donde se dispone de ventanas exactas de 510 nt, como la predicción de sitios de empalme centrados en una posición concreta. Para secuencias de longitud variable, el autor recomienda usar la variante SpliceBERT-1024nt.

La relevancia de este modelo radica en su aplicación en biología computacional y genómica, donde los modelos de lenguaje preentrenados sobre ARN permiten extraer características útiles para tareas downstream como la anotación de genes, la detección de variantes de empalme y el estudio de regulación postranscripcional. Su licencia CC BY 4.0 facilita su uso tanto en investigación como en aplicaciones comerciales, siempre que se atribuya la fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT encoder (Post-LN, 6 capas, 16 cabezas de atencion, dimension de embedding 512, FFN 2048 con GELU) |
| Parametros totales | 19.452.938 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 510 nucleotidos (512 tokens incluyendo [CLS] y [SEP]; longitud fija de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo biologico, no linguistico; vocabulario de ARN: A, C, G, T, N) |
| Licencia | CC BY 4.0 (pesos); codigo fuente original BSD 3-Clause |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

SpliceBERT-510nt es un codificador BERT de 6 capas con 16 cabezas de atencion, dimension de embedding de 512 y una capa FFN oculta de 2048 unidades con activacion GELU. Emplea normalizacion LayerNorm post-residual (Post-LN) con epsilon 1e-12 y codificacion posicional absoluta aprendida. El vocabulario consta de 10 tokens: `[PAD]`, `[UNK]`, `[CLS]`, `[SEP]`, `[MASK]`, `N`, `A`, `C`, `G` y `T`. La entrada de uracilo (U) se normaliza a timina (T) durante la tokenizacion.

El entrenamiento se realizo con el objetivo de masked language modeling sobre mas de dos millones de secuencias primarias de ARN de 72 especies de vertebrados. Las secuencias se tokenizaron a nivel de nucleotido individual (con espacios entre tokens) y se fragmentaron en ventanas fijas de exactamente 510 nucleotidos. El checkpoint original se obtuvo del repositorio Zenodo (DOI: 10.5281/zenodo.7995778) y se porto a HuggingFace usando la libreria BERT-updated, que anade soporte para `attn_implementation="sdpa"` y `flash_attention_2"`, no presente en el codigo original. La verificacion de paridad confirma que las representaciones ocultas coinciden con el checkpoint original en los 7 niveles (embedding + 6 capas transformer) tanto con atencion eager como con sdpa.

Una particularidad importante es que los pesos del pooler (`pooler.dense`) no estan incluidos en el checkpoint original ni en el safetensors guardado. Si se usa `add_pooling_layer=True` (el valor por defecto), la capa pooler se asigna con pesos aleatorios, por lo que no se debe utilizar `pooler_output` sin un fine-tuning previo.

## Capacidades

- Generacion de representaciones contextuales de secuencias de ARN de longitud fija (510 nt), utiles como embeddings para tareas downstream.
- Prediccion de sitios de empalme (splice site prediction) mediante clasificacion a nivel de token sobre las 510 posiciones, excluyendo tokens especiales.
- Modelado de lenguaje enmascarado (MLM) sobre ARN, lo que permite fine-tuning para tareas de biologia computacional.
- Tokenizacion automatica de secuencias de ARN con normalizacion de U a T y manejo de tokens especiales.
- Compatible con el ecosistema HuggingFace Transformers, incluyendo backends de atencion sdpa y flash attention 2.
- Soporte para extraccion de embeddings por token y por secuencia (media de los embeddings de tokens).
- Capacidad de fine-tuning con convenciones estandar de HuggingFace para clasificacion de tokens o de secuencias.

## Casos de uso

- Prediccion de sitios de empalme: el modelo esta disenado especificamente para esta tarea. Se puede fine-tunear con una capa de clasificacion a nivel de token sobre las 510 posiciones, usando ventanas centradas en el sitio candidato. Su entrenamiento con ventanas fijas de 510 nt lo hace adecuado para este escenario exacto.
- Anotacion de genes en genomas de vertebrados: las representaciones generadas por el modelo pueden alimentar clasificadores que identifiquen exones, intrones y sitios de union, mejorando la precision de las anotaciones automaticas en especies sin datos experimentales.
- Estudio de variantes de empalme asociadas a enfermedades: dado un conjunto de variantes geneticas, se pueden extraer embeddings de las regiones flanqueantes (510 nt) y comparar las representaciones de secuencias wild-type y mutantes para detectar cambios potencialmente patogenicos en el empalme.
- Analisis de regulacion postranscripcional: los embeddings por token pueden utilizarse para identificar motivos de union de factores de splicing o elementos reguladores cis en secuencias de ARN, mediante analisis de atencion o clustering de representaciones.
- Generacion de caracteristicas para modelos de aprendizaje automatico en genomica: las representaciones de SpliceBERT pueden combinarse con otras caracteristicas (conservacion, estructura secundaria, etc.) en pipelines de prediccion de fenotipos o de expresion diferencial.
- Fine-tuning para tareas de clasificacion de secuencias de ARN: aunque el modelo esta pensado para ventanas fijas, se puede adaptar mediante fine-tuning para tareas como prediccion de modificaciones postranscripcionales o deteccion de elementos funcionales, siempre que se respete la longitud de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de rendimiento en tareas como prediccion de sitios de empalme, MMLU u otros benchmarks estandar. El articulo original de Chen et al. (2024) reporta resultados en Briefings in Bioinformatics, pero esos datos no estan incluidos en la informacion proporcionada. No se dispone de comparativas cuantitativas con otros modelos de ARN en este contexto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 19,5 millones de parametros y una longitud de secuencia de 512 tokens, el modelo es muy ligero. En precision FP32, el checkpoint ocupa aproximadamente 78 MB (19.452.938 parametros x 4 bytes). En FP16, unos 39 MB. Cabe en cualquier GPU moderna con mas de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una NVIDIA T4, GTX 1650 o incluso CPU sola son viables para inferencia. Para fine-tuning, una GPU con 4-8 GB de VRAM (RTX 3060, RTX 4060) es mas que suficiente.
- Cabe en consumer GPU: si, en practicamente cualquier GPU de consumo actual, incluidas las integradas de gama alta.
- Opciones de despliegue: al ser un modelo de Transformers estandar, se puede desplegar con vLLM, TGI, HuggingFace Inference Endpoints, o en local con la libreria transformers. Tambien es compatible con llama.cpp si se convierte a formato GGUF, aunque no hay conversiones publicadas.
- Latencia y throughput: no se han publicado mediciones especificas. Dado el tamano reducido, la inferencia en GPU es practicamente instantanea (del orden de milisegundos por secuencia). En CPU, una secuencia de 510 nt se procesa en decenas de milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Uso recomendado |
|---|---|---|---|---|---|
| SpliceBERT-510nt (este) | 19,5 M | 510 nt fijo | 72 vertebrados, >2M secuencias | CC BY 4.0 | Prediccion de empalme con ventanas fijas |
| SpliceBERT-1024nt | ~19,5 M (estimado) | 1024 nt variable | 72 vertebrados | CC BY 4.0 | Uso general, secuencias de longitud variable |
| SpliceBERT-human-510nt | ~19,5 M (estimado) | 510 nt fijo | Solo humano | CC BY 4.0 | Especifico de humano, ventanas fijas |
| DNABERT-2 (referencia) | ~117 M | 512 nt | Genomas multiples | MIT | Modelo de ADN, no ARN, con vocabulario de k-mers |

La comparativa se limita a las variantes de SpliceBERT disponibles en la coleccion del autor. No se dispone de datos de rendimiento comparativo publicados en la informacion proporcionada.

## Limitaciones y advertencias

- Longitud de entrada fija: el modelo fue entrenado exclusivamente con secuencias de exactamente 510 nucleotidos. Secuencias de otras longitudes no fueron validadas y pueden producir resultados incorrectos sin fine-tuning. Para secuencias de longitud variable, usar SpliceBERT-1024nt.
- Pooler no entrenado: los pesos del pooler no estan incluidos en el checkpoint. No usar `pooler_output` sin fine-tuning previo, ya que estaria inicializado aleatoriamente.
- Vocabulario limitado: solo acepta los nucleotidos A, C, G, T y N (con U normalizado a T). No maneja otros caracteres ambiguos de IUPAC (como R, Y, S, W, etc.) de forma nativa.
- Sesgo de especie: entrenado solo con secuencias de vertebrados (72 especies). Su rendimiento en ARN de otros taxones (plantas, bacterias, virus) puede ser suboptimo.
- Riesgo de alucinacion: como modelo de lenguaje enmascarado, puede generar predicciones de nucleotidos plausibles pero incorrectas en contextos biologicos. No debe usarse como unico criterio para decisiones clinicas o experimentales.
- Sin capacidad de generacion de secuencias: es un modelo encoder-only, no genera secuencias de ARN de forma autoregresiva.
- Licencia: los pesos estan bajo CC BY 4.0, lo que permite uso comercial con atribucion. El codigo original es BSD 3-Clause. Verificar los terminos de la licencia antes de redistribuir o modificar.
- Dependencia de codigo personalizado: el modelo requiere `trust_remote_code=True` en HuggingFace, lo que implica ejecutar codigo del repositorio remoto. Se recomienda auditar el codigo antes de usarlo en entornos de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Taykhoom/SpliceBERT-510nt
- Coleccion SpliceBERT: https://huggingface.co/collections/Taykhoom/splicebert-6a20b72e9bec05b79ce009aa
- Repositorio original en GitHub: https://github.com/biomed-AI/SpliceBERT
- Checkpoint original en Zenodo: https://doi.org/10.5281/zenodo.7995778
- Articulo cientifico (DOI): https://doi.org/10.1093/bib/bbae163
- Variante SpliceBERT-1024nt: https://huggingface.co/Taykhoom/SpliceBERT-1024nt
- Variante SpliceBERT-human-510nt: https://huggingface.co/Taykhoom/SpliceBERT-human-510nt
- Libreria BERT-updated: https://huggingface.co/Taykhoom/BERT-updated
