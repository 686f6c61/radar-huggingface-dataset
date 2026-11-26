# veripazari/hecemen-tokenizer-unigram-128k

## Resumen

Hecemen Tokenizer Unigram 128k es un tokenizador de SentencePiece basado en el algoritmo Unigram, disenado especificamente para el turco y publicado por el autor mursideaki bajo el paraguas del proyecto Hecemen. No es un modelo de lenguaje: es el componente de tokenizacion que se situa delante de un modelo y determina como se fragmenta el texto turco antes de entrar en la red. Su relevancia radica en que el turco es una lengua aglutinante con morfologia muy productiva, y los tokenizadores multilingues genericos (entrenados sobre corpus dominados por el ingles) fragmentan las palabras turcas en exceso, inflando el numero de tokens y encareciendo la inferencia.

El vocabulario es de 128.000 entradas, con cobertura de caracteres completa (1.0) sobre el alfabeto turco y byte fallback activado, de modo que ningun caracter queda fuera del vocabulario. Se entreno sobre aproximadamente 1 GB de texto turco curado, combinando lenguaje general con terminologia de dominios como derecho, medicina, deporte, tecnologia y educacion, con el objetivo declarado de preservar unidades lexicas completas siempre que sea posible.

El repositorio de Hugging Face es un espejo archivistico mantenido por VeriPazari, que ha traducido la documentacion al turco conservando licencia, metadatos y atribucion al autor original. La licencia es MIT, lo que permite uso comercial sin restricciones practicas. Con cero descargas y cero likes en el momento de la consulta, es un artefacto muy reciente y practicamente sin validacion externa por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador SentencePiece con algoritmo Unigram (no es un modelo neuronal) |
| Parametros totales | no disponible (no aplica: no es un modelo de lenguaje) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (no aplica a un tokenizador; depende del modelo que lo use) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | Modelo SentencePiece (`.model`), descargable via `hf_hub_download` |

Parametros adicionales del tokenizador:

| Parametro | Valor |
|---|---|
| Tamano de vocabulario | 128.000 |
| Normalizacion | nmt_nfkc_cf |
| Byte fallback | Activado (True) |
| Cobertura de caracteres | 1.0 |
| Corpus de entrenamiento | ~1 GB de texto turco (noticias, libros, web, derecho, medicina) |
| Variante hermana | hecemen-tokenizer-bpe-96k (BPE, 96k) |
| Tamano del repo | 0.0 GB (solo artefactos del tokenizador) |

## Arquitectura y entrenamiento

El tokenizador sigue el modelo probabilistico Unigram de SentencePiece: aprende una distribucion sobre subpalabras y segmenta cada texto eligiendo la combinacion de piezas de maxima verosimilitud bajo esa distribucion, en lugar de aplicar fusiones greedy como hace BPE. Frente a BPE, Unigram tiende a producir segmentaciones mas cercanas a las fronteras morfologicas cuando el corpus de entrenamiento es coherente con la lengua objetivo, que es precisamente la hipotesis de diseno de Hecemen.

El entrenamiento se realizo sobre aproximadamente 1 GB de texto turco curado, con mezcla de genero general y terminologia especializada de cinco dominios (derecho, medicina, deporte, tecnologia y educacion). Se fijo cobertura de caracteres a 1.0 para garantizar que todo el alfabeto turco (incluidas c, g, i, o, s, u con diacriticos) queda representado, y se activo byte fallback para que cualquier caracter fuera de vocabulario se codifique a nivel de byte en lugar de producir `<unk>`. La normalizacion aplicada es `nmt_nfkc_cf`, que combina normalizacion NFKC con plegado de mayusculas, habitual en pipelines de traduccion automatica. No se documenta el numero exacto de tokens de entrenamiento ni si se aplicaron etapas de poda o regularizacion especificas del algoritmo Unigram.

## Capacidades

- Segmentacion de texto turco en subpalabras con preservacion prioritaria de unidades lexicas completas.
- Codificacion y decodificacion reversibles mediante `encode_as_pieces`, `encode_as_ids` y las funciones de decodificacion de SentencePiece.
- Manejo de cualquier caracter Unicode gracias a byte fallback, sin producir tokens desconocidos.
- Cobertura completa del alfabeto turco, incluidos los caracteres con diacriticos especificos de la lengua.
- Eficiencia de tokenizacion superior a la de tokenizadores multilingues genericos: en el ejemplo publicado, 9 tokens frente a 19 de Gemma 7B para la misma frase, una reduccion del 52 %.
- Generalizacion a vocabulario de dominios especializados (derecho, medicina, deporte, tecnologia, educacion) por la composicion del corpus.
- No soporta tool calling, agentes, vision, audio ni razonamiento: es exclusivamente un componente de preprocesado.

## Casos de uso

- Entrenamiento de modelos de lenguaje en turco desde cero: usar Hecemen como tokenizador del corpus reduce el numero de tokens por documento, lo que se traduce directamente en menor coste computacional por epoch y en secuencias mas cortas para un mismo texto.
- Adaptacion de modelos multilingues existentes al turco: si se dispone de recursos para reentrenar los embeddings de entrada y la cabeza de salida, sustituir el tokenizador original por Hecemen puede reducir la longitud media de secuencia en turco y mejorar el throughput en inferencia.
- Fine-tuning de modelos de clasificacion de texto turco (analisis de sentimiento, deteccion de temas, moderacion): un tokenizador que preserva mejor las unidades lexicas suele producir representaciones mas informativas por token, util cuando el presupuesto de contexto es limitado.
- Busqueda y recuperacion de informacion (RAG) sobre corpus turcos: la tokenizacion afecta al troceado de documentos y a la construccion de indices; un vocabulario ajustado al turco reduce la fragmentacion de terminos y mejora la coherencia de los chunks.
- Procesamiento de documentos legales y medicos en turco: el corpus incluye terminologia de ambos dominios, lo que reduce la fragmentacion de terminos tecnicos que los tokenizadores genericos suelen partir en varios subtokens.
- Investigacion en morfologia computacional del turco: permite comparar empiricamente segmentaciones Unigram frente a BPE (variante hermana de 96k) sobre el mismo corpus, como base para estudios de alineamiento entre subtokens y morfemas.
- Preprocesado en pipelines de traduccion automatica turco-espanol u otros pares: la normalizacion `nmt_nfkc_cf` y el byte fallback simplifican el tratamiento de texto ruidoso procedente de web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo aportado por el autor es la comparacion de eficiencia de tokenizacion sobre una frase de ejemplo:

| Tokenizador | Tokens para "Kitapçılıktan kazandığı parayla yeni bir dükkan açtı." |
|---|---|
| Gemma 7B (multilingue) | 19 |
| Hecemen BPE 96k | 10 |
| Hecemen Unigram 128k | 9 |

Se menciona ademas un segundo ejemplo en el que Gemma 7B produce 27 tokens frente a 10 de Hecemen Unigram para una frase turca compleja, aunque no se reproduce el texto de la frase ni se especifica el modelo Gemma exacto utilizado como referencia.

## Requisitos de hardware

- VRAM para inferencia: no aplica en sentido estricto; el tokenizador es un artefacto de SentencePiece de pocos megabytes que se carga en memoria principal (CPU) y no requiere GPU.
- GPU recomendadas: no aplica. La tokenizacion se ejecuta en CPU; en pipelines de inferencia conviene ubicarla en el mismo proceso que el modelo para evitar latencia de serializacion, pero no consume VRAM reseñable.
- Compatibilidad con GPU de consumo: irrelevante para el tokenizador; la VRAM la determina el modelo de lenguaje al que se acople.
- Opciones de despliegue: `sentencepiece` en Python (via `SentencePieceProcessor`), `transformers` mediante `LlamaTokenizer` o `T5Tokenizer` apuntando al fichero `.model`, y `tokenizers`/`sentencepiece` en C++ para integraciones de alto rendimiento. No hay soporte GGUF ni formato de pesos neuronal.
- Latencia y throughput: no disponible. La ganancia esperada es indirecta: al producir menos tokens por texto, reduce el coste de prefill y decodificacion del modelo que lo utilice, pero no se han publicado mediciones de latencia end-to-end.

## Comparativa con modelos similares

| Tokenizador | Algoritmo | Vocabulario | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hecemen Unigram 128k | Unigram (SentencePiece) | 128.000 | Turco | MIT | Hugging Face (espejo VeriPazari) |
| Hecemen BPE 96k | BPE | 96.000 | Turco | no disponible en la informacion | Hugging Face (mursideaki) |
| Tokenizador de Gemma 7B | SentencePiece (BPE) | no disponible | Multilingue | Gemma Terms of Use | Hugging Face (Google) |

La comparacion con el tokenizador de Gemma 7B es la unica que el autor aporta con datos, y se limita al recuento de tokens sobre frases de ejemplo. No hay comparaciones con otros tokenizadores especificos de turco (por ejemplo, variantes de BERTurk o de modelos turcos de la familia TurkishLM), ni evaluaciones de cobertura morfologica o de impacto en metricas downstream.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no puede usarse por si solo para tareas de NLP; requiere acoplarlo a un modelo entrenado con ese mismo vocabulario o reentrenar los embeddings correspondientes.
- Un tokenizador nuevo no es intercambiable sin mas: sustituir el tokenizador de un modelo preentrenado invalida los embeddings de entrada y la cabeza de salida, por lo que el cambio exige reentrenamiento o fine-tuning adicional.
- Validacion practicamente nula por la comunidad: cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados ni evaluaciones independientes.
- El ejemplo de eficiencia se limita a una o dos frases; no hay evidencia de que la reduccion del 52 % se mantenga sobre corpus completos ni en todos los dominios.
- Sesgo de dominio: el corpus de entrenamiento (~1 GB) inclina la distribucion hacia noticias, libros, derecho y medicina; el rendimiento en jerga informal, redes sociales o dialectos puede ser peor y no esta documentado.
- Riesgo de sobreajuste al corpus: con 128.000 entradas sobre solo 1 GB de texto, parte del vocabulario puede corresponder a formas poco frecuentes o especificas del corpus, lo que reduce la generalizacion fuera de dominio.
- La normalizacion `nmt_nfkc_cf` aplica plegado de mayusculas, lo que puede ser inadecuado para tareas que dependen de la capitalizacion (por ejemplo, reconocimiento de entidades nombradas o distincion de nombres propios).
- Monolingue: no cubre otros idiomas, por lo que no sirve para pipelines multilingues sin un tokenizador complementario.
- Documentacion solo en turco: la model card original y el espejo estan redactados integramente en turco, lo que dificulta la evaluacion por parte de equipos no turcoparlantes.
- Licencia MIT: permite uso comercial y modificacion sin restricciones practicas, pero conviene conservar la atribucion a mursideaki y verificar que el espejo de VeriPazari mantiene los terminos originales.

## Enlaces

- Repositorio Hugging Face (espejo VeriPazari): https://huggingface.co/veripazari/hecemen-tokenizer-unigram-128k
- Repositorio original del autor: https://huggingface.co/mursideaki/hecemen-tokenizer-unigram-128k
- Variante BPE 96k: https://huggingface.co/mursideaki/hecemen-tokenizer-bpe-96k
- Plataforma VeriPazari: https://veripazari.com.tr
- Imagen de comparacion con Gemma 7B: https://huggingface.co/veripazari/hecemen-tokenizer-unigram-128k/resolve/main/images/gemma_comparison.png
- Imagen de tokenizacion Hecemen Unigram: https://huggingface.co/veripazari/hecemen-tokenizer-unigram-128k/resolve/main/images/hecemen_unigram.png
