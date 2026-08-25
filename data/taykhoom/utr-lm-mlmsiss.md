# Taykhoom/UTR-LM-MLMSISS

## Resumen

UTR-LM-MLMSISS es un modelo de lenguaje para ARN específico de regiones 5' UTR (regiones no traducidas del extremo 5' del ARN mensajero), desarrollado originalmente por Yanyi Chu et al. en el artículo "A 5' UTR language model for decoding untranslated regions of mRNA and function predictions" (Nature Machine Intelligence, 2024). Este checkpoint concreto es un port mínimo a HuggingFace de la variante que combina tres objetivos de entrenamiento: enmascaramiento de lenguaje (MLM), regresión de energía mínima libre (MFE) y predicción de estructura secundaria por token. El port ha sido realizado por Taykhoom Dalal, estudiante de doctorado en biología computacional en Memorial Sloan Kettering / Cornell.

El modelo sigue la arquitectura ESM2 (un Transformer pre-LN con atención de producto escalar), con 6 capas, 16 cabezas de atención, dimensión de embedding de 128 y una ventana de contexto de 1024 tokens (1022 nucleótidos más los tokens especiales `<cls>` y `<eos>`). Con solo 1,2 millones de parámetros, es un modelo extremadamente ligero diseñado para tareas de biología computacional, no para generación de texto general. Su relevancia actual radica en que permite obtener representaciones vectoriales (embeddings) de secuencias de ARN de forma eficiente y reproducible, con verificación bit-exacta de paridad frente a los pesos originales del artículo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer pre-LN estilo ESM2 con FFN GELU |
| Parametros totales | 1.207.970 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (1022 nucleotidos + `<cls>` / `<eos>`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biologico, alfabeto A/G/C/T) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Transformer con normalización previa (pre-LN) y capa de avance con activación GELU, siguiendo el diseño de ESM2. Usa codificación posicional rotatoria (RoPE) con base 10000, normalización por capas (LayerNorm) y un vocabulario de 10 tokens: `<pad>`, `<eos>`, `<unk>`, `A`, `G`, `C`, `T`, `<cls>`, `<mask>` y `<sep>`. La atención es de producto escalar (eager), aunque el port soporta implementaciones alternativas como SDPA (PyTorch 2.0+) y Flash Attention 2.

El entrenamiento combinó tres objetivos: enmascaramiento de lenguaje (MLM), regresión de energía mínima libre (MFE) y predicción de estructura secundaria por token en tres clases (no apareado, tallo, bucle). Los datos de preentrenamiento incluyen secuencias 5' UTR endógenas de cinco especies (humano, ratón, pez cebra, *Drosophila* y levadura) junto con la biblioteca sintética aleatoria de 5' UTR de Cao et al. El checkpoint seleccionado es el `ESM2SISS_FS4.1_fiveSpeciesCao_6layers_16heads_128embedsize_4096batchToks_lr1e-05_supervisedweight1.0_structureweight1.0_MLMLossMin_epoch93.pkl`, que corresponde a la versión especificada en el artículo original para la tarea de regresión de carga ribosomal media (MRL). El port conserva la columna vertebral y la cabeza MLM, pero omite las cabezas auxiliares de MFE y estructura secundaria.

## Capacidades

- Generacion de embeddings de secuencias de ARN: produce representaciones vectoriales de 128 dimensiones por token, con la opcion de usar el embedding del token `<cls>` para tareas a nivel de secuencia.
- Modelado de lenguaje enmascarado (MLM): puede predecir nucleotidos enmascarados en una secuencia, util para tareas de imputacion o analisis de conservacion.
- Extraccion de representaciones intermedias: permite obtener estados ocultos de cualquier capa (6 capas en total), lo que facilita el analisis de caracteristicas aprendidas en distintos niveles de abstraccion.
- Fine-tuning para tareas de regresion y clasificacion: sigue las convenciones estandar de HuggingFace y puede adaptarse con cualquier entrenador compatible, usando el embedding CLS como entrada a una cabeza de prediccion.
- Compatibilidad con backends de atencion acelerada: soporta SDPA y Flash Attention 2 para reducir el consumo de memoria y acelerar la inferencia.
- Capacidades multilingues: no aplica, al ser un modelo biologico con un alfabeto de 4 letras (A, G, C, T).

## Casos de uso

- Prediccion de carga ribosomal media (MRL): el checkpoint FS4.1 fue seleccionado especificamente para esta tarea de regresion en los scripts de evaluacion del articulo original. Se puede fine-tunear el modelo con datos de ribosome profiling para predecir la eficiencia de traduccion de una secuencia 5' UTR.
- Analisis de estabilidad del ARNm: la energia minima libre (MFE) es un objetivo auxiliar del preentrenamiento, por lo que las representaciones aprendidas codifican informacion sobre la estabilidad estructural. Un modelo fine-tuneado puede estimar la estabilidad relativa de distintas variantes de UTR.
- Diseno de UTRs sinteticas: dado un conjunto de secuencias candidatas, el modelo puede generar embeddings que permitan filtrar o clasificar variantes con propiedades deseables (alta traduccion, alta estabilidad) antes de la validacion experimental.
- Clasificacion de secuencias reguladoras: las representaciones CLS pueden alimentar clasificadores para distinguir UTRs con actividad reguladora conocida (por ejemplo, presencia de motivos de union a proteinas) frente a secuencias de control.
- Imputacion de nucleotidos faltantes: gracias a la cabeza MLM, el modelo puede predecir bases enmascaradas en secuencias parcialmente secuenciadas, lo que resulta util en pipelines de curado de datos genomicos.
- Estudio de variantes patogenicas: en contextos clinicos, se puede fine-tunear el modelo para predecir el impacto funcional de variantes en regiones 5' UTR, ayudando a priorizar variantes de significado incierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo original de UTR-LM (Chu et al., 2024) reporta evaluaciones en tareas downstream como prediccion de MRL, eficiencia de traduccion (TE) y estabilidad del ARNm, pero los numeros concretos no estan incluidos en la documentacion del port. Se recomienda consultar el articulo de Nature Machine Intelligence para obtener las metricas detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32, dado el tamano de 1,2 millones de parametros. Con cuantizacion o precision bfloat16, el consumo es aun menor.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente. Incluso una GPU integrada o una CPU pueden ejecutar el modelo sin problemas de latencia apreciable.
- Compatibilidad con hardware de consumo: si, el modelo cabe en cualquier GPU de consumo (GTX 1050, RTX 2060, etc.) y tambien en entornos sin GPU.
- Opciones de despliegue: se puede cargar con la libreria `transformers` de HuggingFace, usando `AutoModel` o `AutoModelForMaskedLM`. Tambien es compatible con backends de atencion acelerada (SDPA, Flash Attention 2) y con herramientas de serializacion como ONNX si se desea exportar.
- Latencia y throughput: no se han publicado mediciones oficiales, pero dado el tamano del modelo, la inferencia en CPU deberia completarse en milisegundos para secuencias de hasta 1024 tokens.

## Comparativa con modelos similares

| Modelo | Objetivo de preentrenamiento | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UTR-LM-MLMSISS (este) | MLM + MFE + estructura secundaria | 1,2 M | 1024 | GPL-3.0 | HuggingFace |
| UTR-LM-MLM | Solo MLM | 1,2 M | 1024 | GPL-3.0 | HuggingFace |
| UTR-LM-MLMSI | MLM + regresion MFE | 1,2 M | 1024 | GPL-3.0 | HuggingFace |
| UTR-LM-MLMSS | MLM + estructura secundaria | 1,2 M | 1024 | GPL-3.0 | HuggingFace |

Los tres modelos de la coleccion UTR-LM comparten la misma arquitectura y tamano, diferenciandose unicamente en los objetivos auxiliares de preentrenamiento. La variante MLMSISS esta recomendada por el autor para tareas de MRL, mientras que MLMSI se recomienda para tareas de eficiencia de traduccion (TE) y estabilidad (EL). No se dispone de comparativas con otros modelos de ARN como RNA-FM o DNABERT-2 en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo fue preentrenado exclusivamente con secuencias 5' UTR de cinco especies (humano, raton, pez cebra, *Drosophila* y levadura) y una biblioteca sintetica. Su capacidad de generalizacion a otras especies o tipos de ARN (ARNt, ARNr, lncRNA) no esta garantizada.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede producir predicciones plausibles pero incorrectas, especialmente en tareas de imputacion de nucleotidos o en la generacion de secuencias sinteticas. Se recomienda validar experimentalmente cualquier prediccion.
- Limitaciones de contexto: la ventana maxima es de 1022 nucleotidos, por lo que secuencias mas largas deben truncarse o dividirse, lo que puede perder informacion contextual relevante.
- Limitaciones de idioma: el modelo usa un alfabeto ADN (A/G/C/T). Las secuencias de ARN deben convertir la uracila (U) a timina (T) antes de la tokenizacion; una U literal se mapea a `<unk>`, lo que degrada la calidad de las representaciones.
- Restricciones de licencia: la licencia GPL-3.0 implica que cualquier obra derivada debe distribuirse bajo la misma licencia. Esto puede ser incompatible con proyectos de codigo cerrado o con uso comercial propietario.
- Cabezas auxiliares omitidas: el port no incluye las cabezas de prediccion de MFE ni de estructura secundaria, por lo que estas capacidades solo estan disponibles a traves de las representaciones intermedias, no como salidas directas del modelo.
- Verificacion de paridad: aunque se ha verificado la paridad bit-exacta de los pesos, el comportamiento en tareas downstream puede variar ligeramente debido a diferencias en la implementacion de la atencion (por ejemplo, con SDPA o Flash Attention).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Taykhoom/UTR-LM-MLMSISS
- Coleccion UTR-LM en HuggingFace: https://huggingface.co/collections/Taykhoom/utr-lm-6a173a96ae7c070c3a84ebb4
- Repositorio original en GitHub: https://github.com/a96123155/UTR-LM
- Articulo en Nature Machine Intelligence: https://www.nature.com/articles/s42256-024-00823-9
- PDF del articulo: https://www.nature.com/articles/s42256-024-00823-9.pdf
- Perfil de GitHub del autor del port: https://github.com/TaykhoomDalal
