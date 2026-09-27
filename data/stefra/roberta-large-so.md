# stefra/roberta-large-so

## Resumen

`stefra/roberta-large-so` es un encoder basado en la familia RoBERTa y ajustado con una técnica que el autor denomina «statement tuning» multi-dominio. No es un modelo generativo: dado un texto de referencia (el *estado*, por ejemplo una reseña o una frase) y uno o varios *statements* (afirmaciones sobre ese estado), devuelve la probabilidad de que cada statement sea verdadero. El modelo se presenta como un proxy rápido para operadores semánticos del tipo `sem_filter`, es decir, para filtrar o etiquetar conjuntos de textos con una condición expresada en lenguaje natural.

El repositorio incluye el backbone RoBERTa ya ajustado, una cabeza binaria verdadero/falso (`head.safetensors`), el código del modelo (`modeling_sysoneso.py`) que se carga con `AutoModel` y `trust_remote_code=True`, el tokenizer y un informe de métricas por fuente (`eval_report.json`). La model card describe dos métodos de uso principales: `predict`, que devuelve probabilidades, y `filter`, que devuelve valores booleanos por texto. Una innovación destacable es el uso de una máscara de atención bidireccional por bloques: varios statements comparten la misma secuencia de estado pero se puntúan de forma independiente, de modo que el resultado de cada statement es idéntico al que se obtendría evaluándolo aislado.

El interés de la ficha es acotado: se trata de un modelo recién publicado, con cero descargas y cero «likes» en el momento de la consulta, licencia no declarada y sin idiomas soportados declarados. Aun así, las métricas que aporta el autor sobre fuentes de validación y sobre tareas no vistas (held-out) son detalladas y permiten evaluar su utilidad como clasificador cross-encoder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional de la familia RoBERTa mas una cabeza de clasificacion verdadero/falso |
| Parametros totales | no disponible con certeza; el nombre indica un encoder «large» (~355 M), pero el campo `base_model` apunta a `FacebookAI/roberta-base` (~125 M). El tamano del repositorio (1,4 GB) es mas consistente con un encoder de ~355 M en fp32 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card (el backbone es RoBERTa, cuyo limite habitual es de 512 tokens) |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos en float32 (y se carga en float16 sobre GPU segun la model card) |
| Idiomas soportados | no disponible; los conjuntos de evaluacion son mayoritariamente en ingles (MNLI, SNLI, SQuAD, QQP, etc.) y `massive` es multilingue |
| Licencia | no disponible |
| Formato de pesos | safetensors (`head.safetensors`) y formato transformers para el backbone en `backbone/`; configuracion en `config.json` |
| Libreria | PyTorch, via `transformers` (`AutoModel` con `trust_remote_code=True`) |
| Pipeline | zero-shot-classification |
| Modelo base | `FacebookAI/roberta-base` (segun los tags del repositorio) |
| Tamano del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un encoder RoBERTa (transformer bidireccional con tokenizacion byte-level BPE) preentrenado por Facebook AI y despues ajustado con la tecnica de «statement tuning» multi-dominio del autor. Sobre el encoder se anade una cabeza que produce una probabilidad de veracidad por statement. La model card indica que los statements comparten el estado dentro de la misma secuencia, pero una mascara de atencion bidireccional a bloques los mantiene independientes, de forma que el puntaje de un statement no se contamina por los demas statements presentes en la misma entrada. Esta propiedad es la que permite procesar por lotes varias afirmaciones y varios textos sin alterar los resultados individuales.

El ajuste se realizo sobre multiples fuentes de dominios distintos. Las fuentes declaradas en la validacion incluyen `dpr`, `massive`, `mintaka`, `mnli`, `piqa`, `qasc`, `qqp`, `race`, `samsum`, `sciq`, `snli`, `squad`, `tweet_offensive`, `winogrande` y `yelp_polarity`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; dado que no es un modelo generativo, lo mas probable es que el ajuste sea puramente supervisado, aunque este extremo no se confirma en la model card.

## Capacidades

- Clasificacion binaria verdadero/falso de afirmaciones (statements) condicionadas a un texto de estado.
- Clasificacion zero-shot: el statement se expresa libremente en lenguaje natural sin reentrenamiento.
- API `predict`, que devuelve una probabilidad por statement; admite un unico texto con un statement, un texto con varios statements, o varios textos con un statement.
- API `filter`, que devuelve `True`/`False` por cada texto, orientada a filtrado por lotes.
- Procesamiento por lotes de varios textos y varios statements en una sola llamada.
- Carga sobre GPU en float16 de forma automatica (configurable con `device=` y `dtype=`).
- Compatibilidad con el paquete `st_encoder` mediante `StatementScorer.from_pretrained`.
- No dispone de generacion de texto, tool calling, function calling, capacidades de agente, vision ni audio.

## Casos de uso

- Filtrado semantico por lotes (`sem_filter`): dado un conjunto de textos y una condicion expresada como statement (por ejemplo, «esta resena es negativa»), el modelo devuelve la probabilidad o el booleano por elemento, permitiendo construir pipelines de filtrado rapido sin un LLM generativo.
- Moderacion de contenido: usando statements como «el texto es ofensivo» el modelo puede etiquetar comentarios; en la fuente `tweet_offensive` de validacion obtiene 0,784 de accuracy y 0,781 de F1.
- Analisis de sentimiento: con statements del tipo «la resena es negativa» o «el texto expresa tristeza»; en `yelp_polarity` alcanza 0,971 de accuracy y en `emotion` (held-out) 0,718.
- Verificacion de respuestas en pipelines RAG: dado un fragmento recuperado y una afirmacion generada, el modelo estima si el contexto respalda la afirmacion; en `squad` obtiene 0,932 de accuracy y en `dpr` 0,864.
- Inferencia de lenguaje natural (NLI): determinar si una hipotesis se sigue de una premisa, con 0,892 de accuracy en `mnli`, 0,914 en `snli` y 0,904 de F1 en `mintaka`.
- Evaluacion de fidelidad de resumenes: comprobar si frases concretas son coherentes con el texto fuente; en `samsum` alcanza 0,992 de accuracy y 0,007 de ECE, lo que indica alta calibracion en ese dominio.
- Clasificacion tematica de noticias: con statements sobre la categoria del texto, aunque el rendimiento cae en tareas no vistas (`ag_news`: 0,804 de accuracy, 0,155 de ECE).
- Filtrado de candidatos en recuperacion de informacion: descartar pasajes irrelevantes antes de pasarlos a un modelo generativo, reduciendo coste computacional.

## Benchmarks y rendimiento

Resultados de validacion sobre las fuentes de entrenamiento (extraidos de `eval_report.json` segun la model card):

| Fuente | n | Accuracy | F1 | ROC-AUC | Brier | ECE |
|---|---|---|---|---|---|---|
| dpr | 264 | 0,864 | 0,865 | 0,921 | 0,125 | 0,117 |
| massive | 900 | 0,956 | 0,955 | 0,995 | 0,033 | 0,025 |
| mintaka | 450 | 0,922 | 0,904 | 0,972 | 0,064 | 0,040 |
| mnli | 695 | 0,892 | 0,886 | 0,959 | 0,086 | 0,071 |
| piqa | 395 | 0,580 | 0,603 | 0,593 | 0,249 | 0,046 |
| qasc | 744 | 0,888 | 0,863 | 0,944 | 0,092 | 0,059 |
| qqp | 518 | 0,882 | 0,839 | 0,958 | 0,086 | 0,059 |
| race | 879 | 0,769 | 0,775 | 0,848 | 0,169 | 0,095 |
| samsum | 900 | 0,992 | 0,992 | 0,997 | 0,007 | 0,007 |
| sciq | 522 | 0,849 | 0,802 | 0,934 | 0,108 | 0,075 |
| snli | 708 | 0,914 | 0,908 | 0,979 | 0,067 | 0,052 |
| squad | 849 | 0,932 | 0,933 | 0,982 | 0,058 | 0,046 |
| tweet_offensive | 900 | 0,784 | 0,781 | 0,869 | 0,164 | 0,124 |
| winogrande | 600 | 0,877 | 0,879 | 0,928 | 0,108 | 0,089 |
| yelp_polarity | 900 | 0,971 | 0,971 | 0,998 | 0,026 | 0,026 |
| **ALL** | 10224 | 0,883 | 0,877 | 0,958 | 0,089 | 0,055 |

Resultados held-out, sobre tareas que no aparecen en el entrenamiento:

| Fuente | n | Accuracy | F1 | ROC-AUC | Brier | ECE |
|---|---|---|---|---|---|---|
| ag_news | 3000 | 0,804 | 0,790 | 0,887 | 0,170 | 0,155 |
| emotion | 3000 | 0,718 | 0,679 | 0,811 | 0,237 | 0,213 |
| **ALL** | 6000 | 0,761 | 0,736 | 0,853 | 0,203 | 0,183 |

No se dispone de resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque el modelo no es generativo y el autor no los publica.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,4 GB, lo que corresponde aproximadamente a un encoder de ~355 M de parametros en fp32. En fp32 la inferencia requiere del orden de 1,4-1,5 GB; en fp16, alrededor de 0,7-0,8 GB; y en int8, en torno a 0,4 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente. Se puede ejecutar en RTX 3060, RTX 4060, RTX 4090, A100 o H100 sin problemas; estas ultimas solo tendrian sentido para inferencia por lotes a gran escala.
- Si cabe en GPU de consumo: si, con holgura, en practicamente cualquier GPU de consumo con 4 GB o mas (GTX 1650, RTX 3050, RTX 3060, RTX 4090). Tambien es viable en CPU para volumenes moderados.
- Opciones de despliegue: `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`, que es el metodo documentado. El backbone en `backbone/` esta en formato transformers y podria exportarse a otros runtimes, pero la model card no documenta despliegue con vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo esas herramientas no son el encuadre habitual.
- Latencia y throughput: no disponibles. La model card solo indica que sobre GPU se carga en float16 y que se puede ajustar el dispositivo y el tipo de dato.

## Comparativa con modelos similares

No se dispone de comparativas publicadas especificas para este modelo. Como referencia de categoria se pueden considerar los siguientes encoders, aunque no hay datos de rendimiento comparables en la informacion disponible:

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| stefra/roberta-large-so | Encoder + cabeza de veracidad | no disponible (~125 M o ~355 M) | no disponible | no disponible | Ajustado para `sem_filter` y clasificacion zero-shot de statements |
| FacebookAI/roberta-base | Encoder MLM | ~125 M | 512 | MIT | Modelo base declarado; preentrenado con enmascaramiento sobre 160 GB de texto ingles |
| FacebookAI/roberta-large | Encoder MLM | ~355 M | 512 | MIT | Version grande de RoBERTa, coherente con el nombre del modelo |
| zeromodels/roberta_large | Encoder MLM | ~355 M | 512 | no disponible | Conversion a Keras 3 del RoBERTa-large original |

No se han publicado comparaciones directas de `roberta-large-so` con alternativas de la misma tarea (por ejemplo, cross-encoders de NLI o de filtrado semantico) en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, solo una probabilidad de veracidad por statement; no soporta tool calling ni flujos de agente.
- Discrepancia en el tamano: el nombre indica «large» (~355 M) mientras que el tag `base_model` apunta a `roberta-base` (~125 M). Conviene verificar los parametros reales antes de dimensionar el despliegue.
- Rendimiento desigual por dominio: en `piqa` la accuracy es de 0,580, practicamente a nivel de azar, muy por debajo del resto de fuentes. En tareas held-out baja a 0,761 de accuracy global (`ag_news` 0,804 y `emotion` 0,718).
- Calibracion degradada fuera de dominio: el ECE sube a 0,155 en `ag_news` y 0,213 en `emotion`, frente a 0,055 en validacion, por lo que las probabilidades no deben tomarse como calibradas en tareas nuevas.
- Idiomas no declarados: los conjuntos de evaluacion son mayoritariamente en ingles; no hay garantia de calidad en castellano ni en otras lenguas.
- Licencia no declarada: al no especificarse licencia, existe incertidumbre juridica para uso comercial, que deberia resolverse contactando con el autor.
- Modelo practicamente sin adopcion: cero descargas y cero «likes» en el momento de la consulta, sin validacion externa independiente de las metricas del propio autor.
- La mascara de atencion por bloques hace que los statements sean independientes entre si: el modelo no puede razonar sobre relaciones logicas entre varios statements presentes en la misma llamada.
- Fecha de creacion inusualmente futura en los metadatos (2026-09-27), lo que puede indicar metadatos inconsistentes o generados de forma automatica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stefra/roberta-large-so
- Modelo base declarado (`FacebookAI/roberta-base`): https://huggingface.co/FacebookAI/roberta-base
- `FacebookAI/roberta-large`: https://huggingface.co/FacebookAI/roberta-large
- Vision general de RoBERTa-large en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/roberta-large-facebookai
- Conversion a Keras 3 del RoBERTa-large (zeromodels): https://huggingface.co/zeromodels/roberta_large
- Ficha de roberta-large en The Applied: https://theapplied.co/models/facebookai-roberta-large
- Catalogo de roberta-large en Microsoft Foundry: https://ai.azure.com/catalog/models/roberta-large
