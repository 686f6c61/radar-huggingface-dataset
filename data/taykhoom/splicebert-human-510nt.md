# Taykhoom/SpliceBERT-human-510nt

## Resumen

SpliceBERT-human-510nt es un port minimalista del modelo SpliceBERT, un modelo de lenguaje de ARN basado en la arquitectura BERT, desarrollado originalmente por Chen et al. y convertido a HuggingFace por Taykhoom. Este variante concreto se entrenó con masked language modeling (MLM) sobre fragmentos de longitud fija de 510 nucleótidos (nt) procedentes de secuencias de ARN mensajero humano. El objetivo principal del modelo es aprender representaciones de secuencias de ARN que resulten útiles para tareas de predicción de splicing, un proceso biológico fundamental en la regulación génica.

El modelo emplea un encoder BERT post-LayerNorm con 6 capas, 16 cabezas de atención, dimensión de embedding de 512 y un vocabulario de solo 10 tokens (nucleótidos y tokens especiales). Con aproximadamente 19,5 millones de parámetros, es un modelo ligero que puede ejecutarse en hardware modesto. Su relevancia actual radica en que ofrece una alternativa específica para humano frente a los modelos multi-especie de SpliceBERT, con potencial mejora en tareas de splicing humano, aunque con la limitación de estar entrenado exclusivamente con secuencias de longitud fija de 510 nt.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT encoder (Post-LN) |
| Parametros totales | 19.452.938 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 510 nt (512 tokens, longitud fija) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | CC BY 4.0 (pesos); código original BSD 3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de un encoder BERT con normalización post-residual (Post-LN), 6 capas transformer, 16 cabezas de atención, dimensión de embedding de 512 y una capa FFN oculta de 2048 unidades con activación GELU. El vocabulario se compone de 10 tokens: `[PAD]`, `[UNK]`, `[CLS]`, `[SEP]`, `[MASK]` y los cinco nucleótidos `N`, `A`, `C`, `G`, `T` (la uracilo `U` se normaliza a `T`). El posicionamiento es absoluto aprendido y la normalización usa LayerNorm con epsilon de 1e-12.

El entrenamiento se realizó con el objetivo de masked language modeling sobre secuencias de ARN primario humano, tokenizadas a nivel de nucleótido individual con espacios, y fragmentadas en ventanas fijas de 510 nt. El checkpoint original proviene de Zenodo (doi:10.5281/zenodo.7995778) y fue verificado con una diferencia absoluta máxima inferior a 1e-5 en las representaciones ocultas frente al original, tanto con atención eager como con sdpa. El port añade soporte para `attn_implementation="sdpa"` y `"flash_attention_2"` mediante la librería BERT-updated, algo no presente en el código original.

## Capacidades

- Generación de embeddings de secuencias de ARN: produce representaciones vectoriales de 512 dimensiones por token, útiles como características para tareas posteriores.
- Predicción de splicing: mediante fine-tuning con clasificación a nivel de token sobre las 510 posiciones (excluyendo tokens especiales), puede predecir sitios de splicing.
- Masked language modeling: el pipeline declarado es `fill-mask`, permitiendo predecir nucleótidos enmascarados en secuencias de ARN.
- Sin soporte de tool calling, agentes, visión, audio ni razonamiento multi-paso: es un modelo puramente biológico de secuencias.
- Capacidad multilingüe: no aplica; el modelo opera exclusivamente sobre el alfabeto de nucleótidos.

## Casos de uso

- Predicción de sitios de splicing en genes humanos: el modelo puede fine-tuning con clasificación token-level sobre las 510 posiciones para identificar sitios donadores y aceptores de splicing, aprovechando su entrenamiento específico en secuencias humanas.
- Análisis de variantes genéticas que afectan al splicing: al comparar embeddings de secuencias con y sin variantes, se pueden detectar cambios que alteren la regulación del splicing, relevante en estudios de enfermedades genéticas.
- Generación de características para modelos de aprendizaje automático en biología del ARN: los embeddings de 512 dimensiones pueden alimentar clasificadores o regresores para tareas como predicción de estabilidad de ARN o interacción con proteínas.
- Estudios de regulación de splicing específicos de humano: al estar entrenado solo con datos humanos, puede ofrecer mayor precisión que modelos multi-especie en contextos donde la variabilidad entre especies introduce ruido.
- Investigación biomédica sobre enfermedades relacionadas con splicing aberrante: permite explorar cómo mutaciones en regiones intrónicas o exónicas afectan al procesamiento del ARN.
- Comparación con modelos multi-especie: sirve como referencia para evaluar si la especialización en humano mejora el rendimiento en tareas concretas frente a SpliceBERT-510nt o SpliceBERT-1024nt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o similares, dado que se trata de un modelo biológico especializado. La verificación de paridad confirma que las representaciones ocultas coinciden con el checkpoint original, pero no hay datos cuantitativos de rendimiento en tareas de splicing.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32, dado el tamaño de 19,5 millones de parámetros; con cuantización podría reducirse aún más, aunque no se documentan formatos cuantizados.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente; también puede ejecutarse en CPU sin problemas para inferencia puntual.
- Compatibilidad con GPU de consumo: sí, incluyendo RTX 3060, RTX 4090 y similares; incluso en hardware integrado es viable.
- Opciones de despliegue: transformers con PyTorch, soporte para atención sdpa y flash_attention_2; puede integrarse en pipelines de HuggingFace o en servidores con vLLM, aunque al ser un modelo pequeño no requiere infraestructura especializada.
- Latencia y throughput: no se han publicado mediciones, pero por el tamaño del modelo se espera una latencia de milisegundos por secuencia en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Contexto | Datos de entrenamiento | Parámetros | Licencia |
|---|---|---|---|---|
| SpliceBERT-human-510nt (este) | 510 nt fijos | Solo humano | ~19,5 M | CC BY 4.0 |
| SpliceBERT-510nt | 510 nt fijos | 72 vertebrados | ~19,5 M (estimado) | CC BY 4.0 |
| SpliceBERT-1024nt | 1024 nt variable | 72 vertebrados | no disponible | CC BY 4.0 |

La variante humana puede superar a la multi-especie en tareas de splicing específicas de humano, según indica la model card, pero no se aportan datos cuantitativos. SpliceBERT-1024nt es la opción recomendada para secuencias de longitud variable o para generalización entre especies.

## Limitaciones y advertencias

- Longitud de secuencia fija: el modelo fue entrenado exactamente con 510 nt (excluyendo tokens especiales); secuencias de otras longitudes no fueron validadas y pueden producir resultados incorrectos sin fine-tuning.
- Pooler no entrenado: los pesos de `pooler.dense` no están incluidos en el checkpoint; `pooler_output` no debe usarse sin fine-tuning previo.
- Especialización en humano: al entrenarse solo con secuencias humanas, no generaliza bien a otras especies; para aplicaciones multi-especie se recomienda usar SpliceBERT-1024nt.
- Vocabulario limitado: solo maneja nucleótidos canónicos (A, C, G, T, N); no soporta modificaciones de ARN ni alfabetos extendidos.
- Riesgo de alucinación: como modelo MLM, puede predecir nucleótidos plausibles pero incorrectos en posiciones enmascaradas; no debe usarse para anotación automática sin validación experimental.
- Licencia: los pesos están bajo CC BY 4.0, que permite uso comercial con atribución; el código original es BSD 3-Clause, pero el port en HuggingFace puede tener condiciones adicionales derivadas de la librería BERT-updated.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Taykhoom/SpliceBERT-human-510nt
- Colección SpliceBERT: https://huggingface.co/collections/Taykhoom/splicebert-6a20b72e9bec05b79ce009aa
- Repositorio original en GitHub: https://github.com/biomed-AI/SpliceBERT
- Checkpoint original en Zenodo: https://doi.org/10.5281/zenodo.7995778
- Paper de referencia: Chen et al., Briefings in Bioinformatics, 2024, doi:10.1093/bib/bbae163
- Port alternativo en multimolecule: https://huggingface.co/multimolecule/splicebert-human.510nt
