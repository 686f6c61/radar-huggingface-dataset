# touati-kamel/darja-tokenizer-50m

## Resumen

Darja-Tokenizer-50M es un tokenizador byte-level BPE entrenado desde cero por touati-kamel sobre el Algerian Darja Corpus, un corpus de dariya argelina (الدارجة الجزائرية / dziri). No es un modelo de lenguaje: es un componente de tokenizacion publicado como artefacto independiente con pipeline `feature-extraction`, pensado como tokenizador oficial del modelo Darja-GPT-50M. Su vocabulario es de 24.000 tokens y su proposito es resolver la fragmentacion excesiva que los tokenizadores multilingues genericos (LLaMA-3, Qwen2.5, Mistral) aplican al arabe dialectal magrebi.

El problema que aborda es triple: sobre-tokenizacion de prefijos coloquiales (غادي, رانا, ما...ش) y raices verbales dialectales, desperdicio de ventana de contexto (en un presupuesto de 1.024 tokens apenas caben unas 400 palabras con tokenizadores genericos) y gestion del code-switching arabe-latin (arabizi con digitos 3, 7, 9 y prestamos franceses). Al ser byte-level BPE, modela bytes UTF-8 en bruto y garantiza cero tokens desconocidos en enunciados de script mixto.

Es relevante ahora porque demuestra que tokenizadores especializados en dialectos de bajos recursos pueden igualar o superar a tokenizadores dedicados de dariya con vocabularios mucho mayores (DarijaBERT con 80.000 tokens, DziriBERT con 50.000) usando solo 24.000 entradas, y superar en eficiencia a tokenizadores de LLMs arabes de gran escala en un 12-13 % de fertilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-level BPE (Byte-Pair Encoding a nivel de byte) |
| Parametros totales | no disponible (es un tokenizador, no un modelo neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (el tokenizador no define contexto; la model card menciona un presupuesto de referencia de 1.024 tokens) |
| Tipos de cuantizacion | no aplica (artefacto de tokenizacion) |
| Idiomas soportados | ar (arabe, con foco en dariya argelina); arabizi latino y code-switching frances/ingles por construccion byte-level |
| Licencia | apache-2.0 |
| Formato de pesos | tokenizer de `transformers` (fast tokenizer; ficheros vocab/merges y `tokenizer.json`) |

## Arquitectura y entrenamiento

El tokenizador emplea byte-level BPE, una variante de BPE que opera sobre la representacion en bytes UTF-8 del texto en lugar de sobre caracteres Unicode. Esta eleccion tiene dos consecuencias tecnicas: elimina por completo la posibilidad de tokens `<unk>` (cualquier secuencia de bytes es representable) y modela de forma nativa el script mixto arabe/arabizi sin necesidad de normalizacion previa. El vocabulario final es de 24.000 tokens e incluye tokens especiales y etiquetas de control de dominio (`<cooking>`, `<general>`, `<podcast>`, `<sports>`, `<story>`, `<tech>`), que la model card justifica como parte de la logica de merging y del control de dominio.

El entrenamiento se realizo sobre el Algerian Darja Corpus (dataset `touati-kamel/algerian-darja-corpus`). La model card documenta un pipeline de entrenamiento y procesamiento de fronteras automatizado via `TemplateProcessing`, pero no detalla el numero exacto de tokens de entrenamiento ni la composicion porcentual del corpus. No se documentan fases de RLHF, DPO ni ajuste supervisado, lo cual es coherente con la naturaleza del artefacto.

## Capacidades

- Tokenizacion eficiente de dariya argelina en script arabe, con fertilidad de 1,431 tokens por palabra en el benchmark interno.
- Cobertura de arabizi (transliteracion latina con digitos 3, 7, 9) sin tokens desconocidos.
- Manejo nativo de code-switching arabe-frances-ingles en el mismo enunciado.
- Cero tasa de `<unk>` (0,00 %) gracias al esquema byte-level.
- Etiquetas de control de dominio para condicionar la tokenizacion por registro (`<cooking>`, `<tech>`, etc.).
- Compatibilidad con la libreria `transformers` como fast tokenizer y con `endpoints_compatible`.
- No ofrece generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni capacidades de agente: es exclusivamente un tokenizador.

## Casos de uso

- Entrenamiento de LLMs compactos en dariya: usar el tokenizador como capa de entrada de Darja-GPT-50M o de cualquier modelo causal de menos de 100M parametros, aprovechando la reduccion de longitud de secuencia para aumentar el horizonte efectivo de atencion en presupuestos de contexto pequenos.
- Preprocesado de corpus dialectales magrebies: normalizar y tokenizar grandes volumenes de texto argelino procedente de redes sociales, foros y transcripciones antes de alimentar pipelines de clasificacion o clustering.
- Sistemas de moderacion de contenido en argelino: al no fragmentar prefijos coloquiales ni arabizi, los clasificadores basados en este tokenizador reciben representaciones mas compactas y estables para detectar discurso toxico en registro informal.
- Busqueda y recuperacion de informacion dialectal: indexar documentos en dariya con un tokenizador de baja fertilidad reduce el tamano del indice invertido y mejora la precision de coincidencias en terminos coloquiales que los tokenizadores MSA parten en caracteres sueltos.
- Analisis de sentimiento en atencion al cliente argelina: tokenizar conversaciones multi-turno que mezclan arabe, arabizi y frances para alimentar modelos de clasificacion de quejas y solicitudes en centros de soporte locales.
- Investigacion en tokenizacion multilingue: servir como baseline dialectal en estudios comparativos de fertilidad, dado que la model card publica un benchmark controlado sobre 30 tokenizadores con intervalos de confianza al 95 %.
- Construccion de datasets paralelos arabe-dariya: la tokenizacion byte-level sin `<unk>` facilita el alineamiento a nivel de subword entre variantes MSA y dialectal.

## Benchmarks y rendimiento

Benchmark de fertilidad publicado en la model card: 200 documentos estrictamente reservados (341.424 palabras, 1.855.532 caracteres) sobre seis dominios, texto bruto sin etiquetas ni tokens especiales.

| Tokenizador | Familia | Vocab | Fertilidad (menor mejor) | Bytes/token | UNK % | Tokens adicionales vs. Darja-Tokenizer |
|---|---|---|---|---|---|---|
| Darja-Tokenizer-50M (este) | Byte-level BPE | 24.000 | 1,431 | 6,80 | 0,00 % | baseline |
| SI2M-Lab/DarijaBERT | WordPiece (dariya) | 80.000 | 1,427 | 6,81 | 0,00 % | -0,3 % [-1,1 %, +0,6 %] |
| alger-ia/dziribert | WordPiece (dziri) | 50.000 | 1,429 | 6,80 | 0,00 % | -0,1 % [-1,1 %, +0,8 %] |
| UBC-NLP/MARBERT | WordPiece (dialectos arabes) | 100.000 | 1,440 | 6,75 | 0,06 % | +0,6 % [-0,7 %, +1,8 %] |
| inceptionai/jais-family-590m | BPE (arabe/ingles) | 84.992 | 1,639 | 5,93 | 0,00 % | +12,7 % [+11,3 %, +14,0 %] |
| ALLaM-AI/ALLaM-7B-Instruct | BPE (LLM arabe) | 64.000 | 1,651 | 5,89 | 0,00 % | +13,3 % [+11,9 %, +14,6 %] |
| CAMeL-Lab/camelbert | WordPiece (mixto arabe) | 30.000 | 1,658 | 5,87 | 0,31 % | +13,7 % [+12,4 %, +14,8 %] |
| aubmindlab/arabertv2 | WordPiece (arabe) | 64.000 | 1,756 | 5,54 | 0,54 % | +18,5 % [+17,7 %, +19,4 %] |
| aubmindlab/aragpt2-base | BPE (LM causal arabe) | 64.000 | 1,774 | 5,48 | 0,00 % | +19,4 % [+17,2 %, +21,4 %] |
| bigscience/bloom-560m | Byte-level BPE (multilingue) | 250.680 | 1,799 | 5,41 | 0,00 % | +20,4 % [+19,3 %, +21,5 %] |
| FacebookAI/xlm-roberta-base | SentencePiece (multilingue) | 250.002 | 1,961 | 4,96 | 0,00 % | +27,0 % [+26,1 %, +28,0 %] |
| facebook/mbart-large-50 | SentencePiece (multilingue) | 250.054 | 1,961 | 4,96 | 0,00 % | +27,0 % [+26,1 %, +28,0 %] |
| mistralai/Mistral-Nemo-Base-2407 | Tekken (multilingue) | 131.072 | 1,990 | 4,89 | 0,00 % | +28,1 % [+27,0 %, +29,1 %] |
| openai/gpt-oss-20b | Byte-level BPE | 200.019 | 2,040 | 4,77 | 0,00 % | +29 % (intervalo truncado en la fuente) |

Lectura de los datos: el tokenizador no supera de forma estadisticamente significativa a DarijaBERT ni a DziriBERT (los intervalos cruzan cero), pero iguala su eficiencia con un vocabulario entre 2 y 3,3 veces menor, lo que reduce el coste de la capa de embedding en modelos compactos. Frente a tokenizadores de LLMs arabes de gran escala y multilingues genericos, la mejora es significativa y crece hasta el 28-29 % en tokenizadores multilingues de vocabulario muy grande.

## Requisitos de hardware

- El tokenizador en si no requiere GPU: la tokenizacion es una operacion de CPU y consume del orden de megabytes en RAM.
- VRAM para inferencia: no aplica al tokenizador; depende del modelo que lo utilice. La model card referencia Darja-GPT-50M, un modelo de aproximadamente 50M parametros, que en fp16 ocupa unos 100 MB y en int8 unos 50 MB de pesos.
- GPU recomendadas: cualquier GPU consumer sirve para el modelo companion de 50M (GTX 1650, RTX 3060, RTX 4090); para entrenamiento de modelos mayores con este tokenizador se recomienda A100 o H100.
- Cabe en GPU consumer: si, con holgura, incluso en GPUs de gama baja o en CPU.
- Opciones de despliegue: `transformers` (fast tokenizer), `tokenizers` de Hugging Face, y despliegue del modelo companion via vLLM, llama.cpp u Ollama segun el formato de pesos disponible.
- Latencia y throughput: no disponibles para el tokenizador; el benchmark reporta solo fertilidad y bytes por token, no velocidad de codificacion.

## Comparativa con modelos similares

| Tokenizador | Tipo | Vocab | Fertilidad en dariya | UNK % | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Darja-Tokenizer-50M | Byte-level BPE | 24.000 | 1,431 | 0,00 % | Apache 2.0 | Hugging Face |
| SI2M-Lab/DarijaBERT | WordPiece | 80.000 | 1,427 | 0,00 % | no disponible en la informacion proporcionada | Hugging Face |
| alger-ia/dziribert | WordPiece | 50.000 | 1,429 | 0,00 % | no disponible en la informacion proporcionada | Hugging Face |
| UBC-NLP/MARBERT | WordPiece | 100.000 | 1,440 | 0,06 % | no disponible en la informacion proporcionada | Hugging Face |
| Qwen2.5 (tokenizador) | BPE multilingue | no disponible | reduccion del 39,2 % citada en la model card a favor del tokenizador Darja | no disponible | no disponible en la informacion proporcionada | Hugging Face |

La ventaja diferencial de este tokenizador no es la fertilidad bruta, que empata con los tokenizadores dedicados a dariya, sino la combinacion de vocabulario pequeno, cero UNK y compatibilidad nativa con arabizi y code-switching.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no responde a prompts; usarlo como tal produce resultados invalidos.
- El benchmark de fertilidad es interno y autopublicado por el autor; no se han publicado evaluaciones externas independientes.
- El vocabulario de 24.000 tokens puede penalizar en tareas multilingues generales o en arabe estandar formal (MSA), donde tokenizadores de mayor vocabulario tienen mejor cobertura.
- El rendimiento esta medido exclusivamente sobre dariya argelina; la generalizacion a otras variedades magrebies (marroqui, tunecina) no esta documentada.
- Las etiquetas de control de dominio deben gestionarse explicitamente en produccion; un uso incorrecto puede introducir tokens especiales no deseados en las secuencias.
- Riesgo de sesgo: el corpus de entrenamiento proviene de fuentes dialectales no especificadas en detalle, por lo que pueden persistir sesgos de dominio, registro y origen geografico.
- Licencia Apache 2.0: permite uso comercial con atribucion y sin restricciones copyleft, pero conviene verificar la licencia del modelo companion Darja-GPT-50M antes de desplegarlo en produccion.
- El artefacto tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria.
- No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre la composicion del dataset, lo que dificulta auditar posibles contaminaciones.

## Enlaces

- Tokenizador en Hugging Face: https://huggingface.co/touati-kamel/darja-tokenizer-50m
- Dataset de entrenamiento: https://huggingface.co/datasets/touati-kamel/algerian-darja-corpus
- Modelo companion Darja-GPT-50M: https://huggingface.co/touati-kamel/darja-gpt-50m
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Tokenizador DarijaBERT: https://huggingface.co/SI2M-Lab/DarijaBERT
- Tokenizador DziriBERT: https://huggingface.co/alger-ia/dziribert
- Tokenizador MARBERT: https://huggingface.co/UBC-NLP/MARBERT
