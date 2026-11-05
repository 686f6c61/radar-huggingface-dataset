# stevenmaschan/imdb-tokenizers

## Resumen

`stevenmaschan/imdb-tokenizers` es un conjunto de cinco tokenizadores de nivel de palabra y BPE (Byte Pair Encoding) para inglés, entrenados con la librería `tokenizers` de Hugging Face sobre las 50.000 reseñas no etiquetadas del split `unsupervised` del dataset `stanfordnlp/imdb`. No es un modelo de lenguaje: es un artefacto de preprocesado publicado como repositorio independiente para un proyecto universitario de PLN que compara clasificadores de sentimiento sobre IMDb.

El repositorio incluye un tokenizador de palabras completas con vocabulario de 32.000 entradas y cuatro tokenizadores BPE con vocabularios de 8.000, 16.000, 32.000 y 64.000 piezas. Todos comparten el sufijo `mf_2`, que indica que los tokens (en el caso de palabras) o las fusiones (en el caso de BPE) con menos de dos apariciones en el corpus no se incorporaron al vocabulario, lo que reduce el ruido de tokens hapax.

La relevancia de este artefacto es acotada: sirve como referencia reproducible de tokenización específica de dominio (reseñas cinematográficas en inglés) y permite comparar el efecto del tamaño de vocabulario y del esquema de segmentación en tareas de análisis de sentimiento. No debe confundirse con un modelo entrenado; no hay pesos neuronales ni pipeline de inferencia asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | tokenizadores (word-level y BPE) sobre la librería `tokenizers`; no es un modelo neuronal |
| Parametros totales | no disponible (no aplica: artefacto de tokenización) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no definida; depende del modelo que consuma el tokenizador) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | ficheros JSON de tokenizador (`word_vs_32000_mf_2.json`, `bpe_vs_8000_mf_2.json`, `bpe_vs_16000_mf_2.json`, `bpe_vs_32000_mf_2.json`, `bpe_vs_64000_mf_2.json`) |

## Arquitectura y entrenamiento

El repositorio contiene dos familias de tokenizadores. La primera es de nivel de palabra con vocabulario de 32.000 entradas: las palabras no vistas se mapean a `[UNK]`. La segunda es BPE con prefijo `##` para las piezas internas de una palabra, en cuatro tamaños de vocabulario (8.000, 16.000, 32.000 y 64.000). Todos se entrenaron con la librería `tokenizers` de Hugging Face sobre las 50.000 reseñas no etiquetadas del split `unsupervised` de `stanfordnlp/imdb`.

El pipeline de limpieza está integrado en cada tokenizador, de modo que se pueden pasar reseñas crudas directamente. Los pasos son: conversión de `<br />` en espacios; corrección de caracteres corruptos por decodificación Windows-1252 (`\x96`, `\x97`, `\x85`, `\x91`) a `-`, `...` y `'`; colapso de secuencias de dos o más guiones en ` - `; normalización de apóstrofos curvos (`’`) y agudos (`´`) a `'`; normalización Unicode NFKC; limitación de repeticiones de `!`, `?` y `.` a `!!`, `??` y `...`; minúsculas; y separación de palabras y puntuación con división de clíticos (`didn't` → `did` `n't`, `kubrick's` → `kubrick` `'s`).

El sufijo `mf_2` aplica un umbral de frecuencia mínima de 2: los tokens o fusiones con menos de dos apariciones no entran en el vocabulario. No se documenta el uso de normalización previa adicional, subword regularization ni técnicas de muestreo de subpalabras (BPE-dropout) en la información disponible.

## Capacidades

- Tokenización de texto en inglés a nivel de palabra con vocabulario de 32.000 entradas y token `[UNK]` para palabras fuera de vocabulario.
- Tokenización BPE con cuatro tamaños de vocabulario (8.000, 16.000, 32.000 y 64.000) y prefijo `##` para piezas internas.
- Limpieza de texto integrada: HTML, artefactos de codificación Windows-1252, normalización Unicode NFKC, colapso de puntuación repetida, minúsculas y separación de clíticos.
- Segmentación de contracciones y posesivos en inglés (`n't`, `'s`).
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio ni generación de texto: es un artefacto de preprocesado.
- No incluye cabecera de clasificación ni pesos; no realiza análisis de sentimiento por sí mismo.

## Casos de uso

- Preprocesado reproducible de reseñas de IMDb para experimentos académicos: permite alimentar clasificadores de sentimiento con una tokenización idéntica entre ejecuciones y comparar el efecto del tamaño de vocabulario (8k, 16k, 32k, 64k) sobre la accuracy.
- Comparación de esquemas de segmentación en PLN: el par word-level (32k) frente a BPE (32k) permite aislar el impacto del esquema de tokenización con el mismo tamaño de vocabulario en una tarea concreta.
- Construcción de baselines de clasificación de texto: al integrarse en un pipeline de `tokenizers` + modelo (por ejemplo, una regresión logística o un transformer pequeño), sirve como referencia de tokenización específica de dominio frente a tokenizadores generalistas como los de BERT o GPT-2.
- Análisis de vocabulario y cobertura léxica: el umbral `mf_2` y los distintos tamaños permiten estudiar la proporción de `[UNK]` y la distribución de frecuencias en un corpus de reseñas cinematográficas.
- Docencia y ejercicios de PLN: los cinco ficheros JSON son ligeros y autocontenidos, adecuados para prácticas donde se compare word-level frente a BPE sin depender de descargas de modelos grandes.
- Preprocesado de textos con ruido de codificación: el pipeline de limpieza interno (Windows-1252, NFKC, colapso de puntuación) es reutilizable para corpus heredados con artefactos similares.
- Prototipado de sistemas de análisis de opiniones sobre críticas de cine: como etapa previa a un clasificador o a un modelo de embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de accuracy, perplejidad, cobertura léxica ni comparaciones cuantitativas entre los cinco tokenizadores.

## Requisitos de hardware

- VRAM: no aplica; los tokenizadores son ficheros JSON y se ejecutan en CPU.
- GPU: no requiere GPU. Cualquier CPU sirve para la tokenización.
- Cabe en cualquier equipo: el fichero de mayor tamaño (BPE de 64.000 piezas) es de escala de megabytes.
- Despliegue: mediante la librería `tokenizers` de Hugging Face (`Tokenizer.from_file`) y descarga con `huggingface_hub.hf_hub_download`. No se integra con vLLM, llama.cpp, Ollama ni TGI, ya que no hay pesos de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y del tamaño de vocabulario, pero al ser tokenizadores BPE en Rust (vía `tokenizers`) el coste por documento es bajo.

## Comparativa con modelos similares

| Artefacto | Tipo | Vocabulario | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `stevenmaschan/imdb-tokenizers` (word) | word-level | 32.000 | en | no disponible | Hugging Face |
| `stevenmaschan/imdb-tokenizers` (BPE) | BPE | 8.000 / 16.000 / 32.000 / 64.000 | en | no disponible | Hugging Face |
| Tokenizador de BERT (`bert-base-uncased`) | WordPiece | 30.522 | multilingüe (en principalmente) | Apache 2.0 | Hugging Face |
| Tokenizador de GPT-2 | BPE byte-level | 50.257 | multilingüe (en principalmente) | MIT | Hugging Face |

La comparación es aproximada: los tokenizadores de BERT y GPT-2 son generalistas y no están entrenados sobre IMDb, mientras que los de este repositorio están especializados en reseñas cinematográficas. No se dispone de métricas comparativas de rendimiento downstream en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no clasifica sentimiento por sí mismo y no tiene pesos neuronales. Cualquier uso como "modelo" es un error de categoría.
- Solo inglés: el vocabulario y las reglas de limpieza están diseñados para reseñas en inglés; el rendimiento en otros idiomas no está documentado y previsiblemente será pobre.
- Licencia no especificada: la ausencia de licencia explícita impide asumir permisos de uso comercial; hay que contactar con el autor o tratar el artefacto como no reutilizable en producción.
- Sesgo de dominio: entrenado exclusivamente sobre IMDb, el vocabulario refleja el léxico de críticas de cine y no cubre vocabulario general, técnico o de otros dominios.
- Umbral `mf_2`: descarta tokens con menos de dos apariciones, lo que aumenta la tasa de `[UNK]` en textos con vocabulario poco frecuente o nombres propios.
- Sin mantenimiento documentado: 0 descargas y 0 likes en el momento de la consulta; es un artefacto de proyecto universitario sin garantías de soporte.
- Sin métricas publicadas: no hay evidencia cuantitativa de que estos tokenizadores mejoren a alternativas generalistas en la tarea de sentimiento.
- Riesgo de reproducibilidad: no se documentan la versión exacta de `tokenizers`, la semilla ni el orden de entrenamiento, lo que puede dificultar la réplica exacta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/stevenmaschan/imdb-tokenizers
- Dataset de entrenamiento: https://huggingface.co/datasets/stanfordnlp/imdb
- Librería `tokenizers`: https://github.com/huggingface/tokenizers
- Documentación de `tokenizers`: https://huggingface.co/docs/tokenizers
