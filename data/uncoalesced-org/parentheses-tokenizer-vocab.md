# uncoalesced-org/parentheses-tokenizer-vocab

## Resumen

`parentheses-tokenizer-vocab` es un vocabulario y tokenizador Byte-Pair Encoding (BPE) de 32.768 tokens, desarrollado por uncoalesced-org en el marco de Project Parentheses. No es un modelo de lenguaje: es un componente de tokenizacion disenado especificamente para lenguas dravidicas (kannada, tamil, telugu, malayalam) y para ingles, con el objetivo de reducir la fragmentacion de las escrituras indias en los pipelines de modelado de secuencias.

El problema que aborda es concreto: los tokenizadores byte-level convencionales (regex estilo GPT-2/GPT-4) dividen un akshara dravidico (consonante + virama + consonante conjunta + matra vocálica) en 3 a 5 tokens separados, lo que infla artificialmente la longitud de secuencia y diluye la memoria de estado en arquitecturas recurrentes. Este tokenizador aplica una regex personalizada que agrupa consonantes base, signos vocálicos y viramas en unidades atomicas antes de ejecutar las fusiones BPE.

La relevancia actual reside en su nicho: sirve como pieza de infraestructura para entrenar o ajustar modelos sobre lenguas dravidicas con una eficiencia de compresion notablemente superior a la de los tokenizadores multilingues de proposito general. Incluye ademas tokens especiales para etiquetas de idioma, modo de razonamiento (`<think>`) y delimitadores de turno conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE (byte-level con regex personalizada); no es un modelo transformer |
| Parametros totales | no disponible (no aplica: no es un modelo neuronal) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del modelo que lo utilice) |
| Tipos de cuantizacion | no disponible (no aplica a un tokenizador) |
| Idiomas soportados | kannada (kn), tamil (ta), telugu (te), malayalam (ml), ingles (en); incluye etiquetas para tcy, kff, kxv, nit, esg |
| Licencia | MIT |
| Formato de pesos | `tokenizer.json`, `tokenizer_config.json`, `vocab.json`, `merges.txt`, `special_tokens_map.json` |

## Arquitectura y entrenamiento

El componente es un tokenizador BPE con un vocabulario de 32.768 entradas y 32.256 reglas de fusion. Su innovacion principal es la regex previa a las fusiones, que agrupa consonantes base, signos vocálicos (matras), viramas y caracteres de ancho cero (U+200C, U+200D) en unidades atomicas antes de aplicar BPE. Esto contrasta con los esquemas byte-level convencionales, que tratan cada punto de codigo o byte de forma aislada.

No se dispone de informacion sobre el corpus de entrenamiento del tokenizador (numero de tokens, composicion del dataset ni proceso de construccion del vocabulario). El repositorio incluye tokens especiales para fin de texto (`<|endoftext|>`), relleno (`<|pad|>`), bloques de razonamiento (`<think>`, `</think>`), etiquetas de idioma (`<kan>`, `<tam>`, `<tel>`, `<mal>`, `<tcy>`, `<kff>`, `<kxv>`, `<nit>`, `<eng>`, `<esg>`) y delimitadores de turno (`<|system|>`, `<|user|>`, `<|assistant|>`).

## Capacidades

- Tokenizacion BPE de texto en kannada, tamil, telugu, malayalam e ingles.
- Compresion medida frente a la regex de GPT-4: 42 % menos tokens por byte en kannada; entre 38 % y 44 % de reduccion de longitud de secuencia en tamil, telugu y malayalam.
- Eficiencia en ingles comparable a los tokenizadores BPE estilo GPT.
- Soporte de etiquetas de idioma explicitas para diez codigos linguisticos.
- Soporte de delimitadores de turno para plantillas conversacionales (system/user/assistant).
- Soporte de tokens de modo de razonamiento (`<think>`, `</think>`).
- Compatible con la libreria `tokenizers` de Hugging Face (implementacion Rust) y con `AutoTokenizer` de Transformers.
- No realiza generacion, razonamiento, codigo, matematicas ni vision: es exclusivamente un componente de tokenizacion.

## Casos de uso

- Entrenamiento de modelos de lenguaje para lenguas dravidicas: usar este vocabulario al entrenar modelos desde cero o al adaptar un modelo existente reduce la longitud de secuencia entre un 38 % y un 44 %, lo que se traduce directamente en menos computo por documento y mayor cobertura efectiva dentro de la ventana de contexto.
- Modelos recurrentes o de estado (SSM/hibridos) sobre texto indico: la model card justifica el diseno por la dilution de memoria de estado recurrente; encaja en arquitecturas que procesan secuencias largas y se benefician de una tokenizacion mas compacta.
- Pipelines de traduccion automatica kannada/tamil/telugu/malayalam-ingles: la tokenizacion atomica de aksharas reduce la fragmentacion y facilita el alineamiento subword entre lenguas con escrituras distintas.
- Preprocesamiento de corpus multilingues para investigación: las etiquetas de idioma integradas permiten marcar el idioma por segmento dentro de un mismo flujo de tokens, util para modelos multilingues con control de idioma.
- Clasificacion y etiquetado de texto indico: al reducir el numero de tokens por documento, disminuye el coste de inferencia en tareas de clasificacion con ventanas fijas.
- Construccion de asistentes conversacionales para lenguas dravidicas: los tokens `<|system|>`, `<|user|>` y `<|assistant|>` permiten definir plantillas de chat directamente en el vocabulario, y `<think>`/`</think>` habilita formatos de razonamiento explicito.
- Analisis de frecuencias y estudios de fertilidad de tokenizacion: util como referencia para comparar la eficiencia de distintos esquemas de tokenizacion sobre escrituras brahmicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la compresion relativa frente a la regex de GPT-4:

| Idioma | Reduccion de tokens reportada |
|---|---|
| Kannada (kan) | 42 % menos tokens por byte |
| Tamil (tam) | 38 %-44 % de reduccion de longitud de secuencia |
| Telugu (tel) | 38 %-44 % de reduccion de longitud de secuencia |
| Malayalam (mal) | 38 %-44 % de reduccion de longitud de secuencia |
| Ingles (eng) | Eficiencia comparable a BPE estilo GPT |

No se especifica la metodologia exacta de medicion ni el corpus utilizado, por lo que estas cifras deben tratarse como declaraciones del autor no verificadas de forma independiente.

## Requisitos de hardware

- VRAM: no aplica; un tokenizador no requiere GPU.
- CPU: la implementacion Rust de `tokenizers` es la recomendada por rendimiento; el proceso es ligero y cabe en cualquier maquina.
- GPU recomendadas: no aplica al tokenizador en si; el hardware dependera del modelo que lo utilice.
- Despliegue: libreria `tokenizers` (Rust/Python), `AutoTokenizer` de Transformers, y cualquier runtime que consuma `tokenizer.json` (por ejemplo, servidores de inferencia que acepten tokenizadores de Hugging Face). No se documenta soporte nativo para llama.cpp, vLLM u Ollama mas alla de la conversion estandar de tokenizadores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Idiomas objetivo | Licencia | Notas |
|---|---|---|---|---|
| parentheses-tokenizer-vocab | 32.768 | Dravidicos + ingles | MIT | Regex atomica de aksharas; compresion declarada del 38 %-44 % |
| Tokenizador GPT-4 (cl100k_base) | ~100.000 | Multilingue general | Propietaria | Referencia de comparacion del autor; fragmenta aksharas en 3-5 tokens |
| Tokenizador Llama 3 | 128.256 | Multilingue general | Licencia Llama | Mayor cobertura pero sin tratamiento especifico de escrituras brahmicas |

No se dispone de comparaciones independientes con tokenizadores especializados en lenguas indicas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni resuelve tareas; solo convierte texto en tokens. Cualquier expectativa de capacidades cognitivas es erronea.
- Las cifras de compresion son declaraciones del autor sin metodologia publicada ni verificacion independiente.
- El vocabulario de 32.768 tokens es pequeno frente a los tokenizadores multilingues modernos (100.000-128.000), lo que puede penalizar la cobertura de ingles y de otras lenguas no dravidicas.
- Cobertura limitada a cinco idiomas principales; las etiquetas adicionales (tcy, kff, kxv, nit, esg) no implican necesariamente calidad de tokenizacion verificada para esas lenguas.
- Sin datos publicados sobre sesgos, tasas de fragmentacion en dominios especializados (codigo, matematicas, terminologia tecnica) ni comportamiento con texto mezclado de varias escrituras.
- Al ser un componente de investigacion con cero descargas y cero likes en el momento de la consulta, carece de validacion por parte de la comunidad.
- Licencia MIT: permite uso comercial y modificacion con atribucion; no obstante, la licencia del tokenizador no cubre los modelos que se entrenen con el.
- En produccion, conviene validar la fertilidad de tokenizacion sobre el corpus real antes de adoptarlo, ya que la ganancia depende del dominio y de la mezcla linguistica.

## Enlaces

- Hugging Face: https://huggingface.co/uncoalesced-org/parentheses-tokenizer-vocab
- Organizacion en Hugging Face: https://huggingface.co/uncoalesced-org
- Libreria `tokenizers` de Hugging Face: https://github.com/huggingface/tokenizers
- Documentacion de `AutoTokenizer`: https://huggingface.co/docs/transformers/main_classes/tokenizer
