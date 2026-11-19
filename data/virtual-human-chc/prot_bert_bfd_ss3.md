# virtual-human-chc/prot_bert_bfd_ss3

## Resumen

ProtBert-BFD-SS3 es un modelo de clasificación de tokens derivado de ProtBert-BFD, la familia de modelos BERT entrenados sobre secuencias de proteínas del proyecto ProtTrans (Rostlab, TUM), liderado por Ahmed Elnaggar. Este checkpoint concreto realiza predicción de estructura secundaria de proteínas por residuo en tres estados: hélice (`H`), hebra (`E`) y coil (`C`). El repositorio publicado por `virtual-human-chc` es un fork del repositorio original `Rostlab/prot_bert_bfd_ss3`.

El modelo parte de la base ProtBert-BFD, un transformer encoder tipo BERT preentrenado con objetivo de masked language modeling sobre la base de datos BFD (Big Fantastic Database), y añade una cabeza de clasificación de tokens afinada para la tarea de estructura secundaria. Cuenta con 418.924.611 parámetros y una ventana de contexto de 512 tokens, suficiente para cadenas proteicas de hasta aproximadamente 512 residuos (con margen para tokens especiales). Solo acepta aminoácidos en mayúscula y está pensado para inglés técnico/científico en el dominio de biología computacional.

Es relevante para pipelines de bioinformática porque la anotación de estructura secundaria es un paso habitual en la caracterización de proteínas, y disponer de un checkpoint compatible con `transformers` y con el pipeline `token-classification` permite integrarlo sin infraestructura adicional. La licencia Academic Free License v3.0 permite uso comercial con condiciones, lo que lo diferencia de checkpoints puramente académicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (ProtBert-BFD) con cabeza de clasificación de tokens |
| Parametros totales | 418.924.611 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT; no confirmado explícitamente en la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; cuantización no documentada por el autor) |
| Idiomas soportados | en (dominio: secuencias de proteínas, aminoácidos en mayúscula) |
| Licencia | afl-3.0 (Academic Free License v3.0) |
| Formato de pesos | safetensors (también pytorch y jax según tags) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT, sin tareas auxiliares como next-sentence prediction: la model card indica que solo se usó el objetivo principal de MLM durante el preentrenamiento de la base. El preentrenamiento de ProtBert-BFD se realizó sobre BFD (Big Fantastic Database), una base de datos de secuencias proteicas de gran escala, con tokenización a nivel de residuo (un token por aminoácido). Sobre esa base, este checkpoint incorpora una cabeza de clasificación de tokens entrenada para predecir estructura secundaria en tres clases.

El modelo trabaja exclusivamente con aminoácidos en mayúscula; la model card advierte que solo funciona con letras mayúsculas y que los caracteres no estándar (`U`, `Z`, `O`, `B`) deben sustituirse por `X` antes de la inferencia (como muestra el ejemplo oficial con `re.sub(r"[UZOB]", "X", sequence)`). No se documentan en la información disponible detalles sobre el dataset de afinado, número de tokens de entrenamiento de la tarea específica, ni uso de RLHF/DPO; tampoco se mencionan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Predicción de estructura secundaria de proteínas por residuo en tres estados: `H` (hélice), `E` (hebra) y `C` (coil).
- Salida con puntuación de confianza por residuo (`score`), además de índice, token y posiciones `start`/`end`.
- Procesamiento de secuencias proteicas en mayúscula, con normalización de residuos no estándar a `X`.
- Integración nativa con `transformers` mediante `AutoModelForTokenClassification`, `AutoTokenizer` y `TokenClassificationPipeline`.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible` según tags).
- Soporte de pesos en safetensors, pytorch y jax.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento multi-paso: es un modelo discriminativo de clasificación de tokens.

## Casos de uso

- Anotación de estructura secundaria en pipelines de bioinformática: dado un FASTA de proteínas, el modelo etiqueta cada residuo como `H`, `E` o `C`, alimentando análisis posteriores de plegamiento o comparación con estructuras experimentales (DSSP).
- Enriquecimiento de bases de datos proteicas: procesar lotes de secuencias con `TokenClassificationPipeline` para añadir anotaciones de estructura secundaria a registros existentes, usando la puntuación de confianza para filtrar predicciones dudosas.
- Filtrado previo en pipelines de predicción estructural: usar las etiquetas por residuo como señal rápida y barata antes de invocar modelos de estructura terciaria más costosos (AlphaFold u otros), reduciendo el cómputo en cribados masivos.
- Análisis de variantes y mutaciones: comparar la predicción de estructura secundaria entre secuencia wild-type y variantes para detectar cambios de estado (`H`→`C`, por ejemplo) que puedan indicar alteraciones funcionales.
- Docencia e investigación en microbiología: el modelo es ligero (418,9 M parámetros) y puede ejecutarse en una GPU consumer, lo que facilita experimentos reproducibles en entornos académicos con el ejemplo de inferencia oficial.
- Preprocesamiento para modelos de lenguaje proteico de mayor tamaño: generar características o etiquetas auxiliares que se concatenen a embeddings de ProtBert-BFD u otros modelos en tareas downstream (predicción de solubilidad, localización subcelular).
- Servicio interno de anotación vía API: al ser compatible con endpoints de `transformers`, puede desplegarse detrás de un servicio HTTP que reciba secuencias y devuelva las etiquetas por residuo con confianza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de accuracy de tres estados (Q3), ni comparaciones con otros modelos de estructura secundaria. El paper de ProtTrans (referenciado en la model card) contiene resultados de la familia, pero no se proporcionan cifras específicas para este checkpoint en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,7 GB solo para pesos (418,9 M parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, entre 2 y 4 GB según longitud de secuencia y batch.
- En fp16/bf16: aproximadamente 0,85 GB de pesos, con overhead adicional; cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) es suficiente; para lotes grandes o servicio concurrente, A100 o H100 aportan margen, aunque el modelo es pequeño para justificar estas GPUs por sí solo.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 4 GB de VRAM efectiva en fp32 con batches moderados.
- Opciones de despliegue: `transformers` (nativo), `TokenClassificationPipeline`, servidores de inferencia compatibles con `transformers` (TGI), exportación a ONNX para inferencia optimizada; vLLM y llama.cpp no están orientados a este tipo de modelo de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un encoder de 418,9 M parámetros con contexto de 512 tokens, la latencia por secuencia es del orden de milisegundos a decenas de milisegundos en GPU, pero no hay cifras publicadas que confirmar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| virtual-human-chc/prot_bert_bfd_ss3 | 418,9 M | 512 | Estructura secundaria 3 estados | afl-3.0 | Hugging Face (fork) |
| Rostlab/prot_bert_bfd_ss3 | no disponible en la informacion | 512 (heredado de BERT) | Estructura secundaria 3 estados | afl-3.0 (según repositorio original) | Hugging Face |
| Rostlab/prot_bert_bfd | no disponible en la informacion | 512 | MLM proteico (base) | afl-3.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo (Q3 accuracy) entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, tarea y licencia.

## Limitaciones y advertencias

- Solo acepta aminoácidos en mayúscula; secuencias en minúscula o con residuos no estándar sin normalizar producirán resultados incorrectos o errores.
- Los caracteres `U`, `Z`, `O` y `B` deben sustituirse por `X` antes de la inferencia, como indica la model card; no hacerlo degrada la predicción.
- Contexto limitado a 512 tokens: proteínas de más de aproximadamente 510 residuos requieren truncado o segmentación, con pérdida de contexto en los extremos.
- Modelo discriminativo de clasificación: no genera texto libre ni razona; no debe usarse como modelo conversacional o de agentes.
- Riesgo de alucinación no aplica en el sentido generativo, pero las predicciones pueden ser incorrectas en regiones de baja confianza; conviene usar el campo `score` para filtrar.
- Sesgos: no documentados en la información disponible; al entrenarse sobre BFD, la distribución de proteínas de ese corpus condiciona el rendimiento en familias poco representadas.
- Licencia AFL-3.0: permite uso comercial con condiciones (atribución y cumplimiento de la licencia); conviene revisar los términos antes de integrarlo en productos. El código derivado de ProtTrans se declara bajo MIT, mientras que los pesos preentrenados quedan bajo AFL-3.0.
- Es un fork de un repositorio original; la autoría científica corresponde a Elnaggar et al. (Rostlab, TUM), y la trazabilidad del checkpoint debe verificarse contra el repositorio `Rostlab/prot_bert_bfd_ss3`.
- No hay métricas publicadas para este checkpoint concreto, por lo que no se puede garantizar su equivalencia numérica con el original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/virtual-human-chc/prot_bert_bfd_ss3
- Repositorio original: https://huggingface.co/Rostlab/prot_bert_bfd_ss3
- Repositorio GitHub de ProtTrans: https://github.com/agemagician/ProtTrans
- Paper de ProtTrans (IEEE TPAMI): https://ieeexplore.ieee.org/document/9477085
- DOI de cita: https://doi.org/10.1109/TPAMI.2021.3095381
