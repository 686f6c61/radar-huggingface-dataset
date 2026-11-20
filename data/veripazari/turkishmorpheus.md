# veripazari/TurkishMorpheus

## Resumen

Morpheus (publicado en Hugging Face como `veripazari/TurkishMorpheus`) es un tokenizador neuronal con conciencia morfológica y un modelo de embeddings de palabras para turco, un idioma aglutinante en el que el contenido semántico se empaqueta en cadenas de sufijos. Lo desarrolla originalmente `lonewolf-rd` y la plataforma VeriPazarı lo archiva y redistribuye con documentación traducida al turco. Resuelve el problema de que BPE y WordPiece segmentan palabras turcas en subtokens estadísticamente convenientes pero lingüísticamente incoherentes: Morpheus produce segmentaciones alineadas con morfemas (por ejemplo, `evlerimizdekiler → ev | leri | miz | deki | ler`) y, en el mismo paso hacia delante, genera embeddings estructurados con fuerte agrupación por familia de raíces.

El modelo combina supervisión morfológica no supervisada (Morfessor) con objetivos auto-supervisados: skip-gram con muestreo negativo, aprendizaje contrastivo de familia de raíces y modelado de lenguaje enmascarado. Es un tokenizador totalmente reversible sobre texto turco crudo (mayúsculas, puntuación, espacios, código y emoji incluidos) y, según la model card, el único entre los tokenizadores reversibles cuyas unidades son morfemas.

La relevancia actual es doble: por un lado ofrece una alternativa interpretable y morfológicamente fiel a los tokenizadores byte-level BPE para pipelines de PLN en turco; por otro, entrega embeddings de 320 dimensiones que superan a BGE-M3 y BERTurk en recuperación por familia de raíces. El repositorio de Hugging Face figura con 0 GB y 0 descargas en el momento de la consulta, y la integración en un LLM turco completo se anuncia como trabajo futuro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador neuronal con segmentación morfológica (Morfessor + objetivos auto-supervisados) y cabecera de embeddings de palabras |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo generativo de secuencias) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos cuantizados) |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | no disponible (tamaño del tokenizador: 29,6 MB; dimensión de embedding: 320) |

## Arquitectura y entrenamiento

Morpheus no es un transformer generativo sino un componente de preprocesado y representación léxica. La segmentación se aprende combinando el algoritmo Morfessor (supervisión morfológica no supervisada) con tres objetivos auto-supervisados: skip-gram con muestreo negativo, aprendizaje contrastivo entre raíces de la misma familia y modelado de lenguaje enmascarado. El resultado es una segmentación que respeta la frontera entre raíz y sufijos y que además es reversible a nivel de byte, con mecanismo de respaldo para preservar la superficie original del texto.

El corpus de entrenamiento se recopiló con la herramienta CorpusCollector del mismo autor; la model card no especifica el número de tokens ni la composición exacta del dataset. El tokenizador se evaluó con un modelo GPT de 58M parámetros entrenado durante 10.000 pasos con una única semilla, y los requisitos de entrenamiento indican Python ≥ 3.13 y GPU CUDA (probado en A100 de 80 GB, con reducción de `batch_size` en GPUs menores). La innovación destacable es la doble salida: el mismo paso hacia delante que segmenta produce un embedding estructurado por familia de raíces.

## Capacidades

- Segmentación morfológica interpretable de palabras turcas con etiquetas de morfema (raíz, plural, posesivo, locativo, relativo).
- Tokenización totalmente reversible sobre texto crudo: preserva mayúsculas, puntuación, espacios, código y emoji.
- Generación de embeddings de palabras de 320 dimensiones con agrupación por familia de raíces.
- Recuperación por familia de raíces (root-family retrieval) sobre 120 familias doradas.
- Manejo robusto de raíces poco frecuentes: segmentación completa del 70 % frente al 10 % de byte-level BPE.
- Cobertura de un vocabulario de 50K (según el identificador `Morpheus-TR-50K` referenciado en la model card).
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de visión o audio: no es un modelo generativo.

## Casos de uso

- Preprocesado de pipelines de PLN en turco: sustituir BPE o WordPiece por Morpheus para obtener unidades morfológicamente alineadas antes de alimentar un modelo de lenguaje o un clasificador.
- Búsqueda léxica y recuperación de información: usar los embeddings de 320 dimensiones para agrupar y recuperar palabras por familia de raíces, con una MAP de 0,89 en el conjunto de 120 familias doradas.
- Análisis morfológico y etiquetado lingüístico: la salida etiquetada por morfema sirve para tareas de análisis morfológico, lematización y construcción de recursos léxicos.
- Normalización reversible de corpus: al preservar exactamente la superficie original, es adecuado para anonimización, auditoría y pipelines que exigen reconstruir el texto de entrada sin pérdida.
- Sistemas de corrección y sugerencia ortográfica: la segmentación raíz-sufijo facilita detectar y corregir sufijos mal formados en turco.
- Investigación en tokenización morfológica: sirve como línea base reproducible (con scripts de benchmark incluidos en `src/benchmarker/results/`) para comparar estrategias de segmentación en lenguas aglutinantes.
- Deduplicación y clustering de vocabulario: los embeddings por familia de raíces permiten agrupar variantes flexivas de una misma raíz en índices o bases de datos léxicas.

## Benchmarks y rendimiento

Datos publicados en la model card (modelo GPT de 58M, 10.000 pasos, una semilla, mismo corpus):

| Metrica | Morpheus | Byte-level BPE |
|---|---|---|
| MorphScore macro-F1 (UD gold) | 0,61 | 0,44 |
| Segmentación completa de raíces raras | 70 % | 10 % |
| Tokens puros TR-MMLU (únicos) | 57,1 % | 32,1 % |
| BPC (menor es mejor) | 1,451 | 1,411 |
| Caracteres por token | 3,81 | 4,97 |
| Generación (caracteres/s, batch 1) | 474 | 874 |
| Tamaño del tokenizador | 29,6 MB | 4,6 MB |

| Metrica | Morpheus | BGE-M3 | BERTurk |
|---|---|---|---|
| MAP en recuperación por familia de raíces (120 familias) | 0,89 | 0,72 | 0,38 |

| Tokenizador | Palabras flexionadas (30.204) | Líneas de corpus crudo (5.000) | Conjunto de énfasis (14) |
|---|---|---|---|
| Morpheus | 100 % | 100 % | 14/14 |
| Byte-level BPE (estilo GPT-2) | 100 % | 100 % | 14/14 |
| BPE / Unigram (SentencePiece, `nmt_nfkc`) | 100 % | 98,7 % | 7/14 |
| WordPiece (sensible a mayúsculas) | 100 % | 24,2 % | 3/14 |
| TurkishTokenizer (basado en reglas) | 95,4 % | 0 % | 0/14 |

## Requisitos de hardware

- Inferencia: no requiere GPU; el tokenizador ocupa 29,6 MB y la generación de embeddings de 320 dimensiones es ligera.
- Entrenamiento: GPU CUDA recomendada; probado en A100 de 80 GB, con reducción de `batch_size` en GPUs menores.
- GPU de consumo: no hay datos publicados sobre modelos concretos; el tamaño del tokenizador permite ejecutarlo en CPU sin problema.
- Despliegue: instalación como paquete Python (`pip install -e .`) y ejecución del pipeline de seis etapas con `python -m src.run_pipeline --stage all`.
- Latencia y throughput: 474 caracteres/s en generación con batch 1 en el modelo GPT de 58M asociado; no se publican cifras de throughput del tokenizador aislado.
- vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo generativo con pesos transformer.

## Comparativa con modelos similares

| Modelo | Tipo | Unidades | Reversible | Embeddings | Licencia |
|---|---|---|---|---|---|
| Morpheus | Tokenizador neuronal + embeddings | Morfemas | Sí | Sí (320 dim) | MIT |
| Byte-level BPE (GPT-2) | Tokenizador subword | Bytes | Sí | No | MIT |
| SentencePiece BPE/Unigram | Tokenizador subword | Subpalabras | Parcial (98,7 % en crudo) | No | Apache 2.0 |
| WordPiece | Tokenizador subword | Subpalabras | No (24,2 % en crudo) | No | Apache 2.0 |
| TurkishTokenizer | Tokenizador basado en reglas | Palabras/superficie | No (0 % en crudo) | No | no disponible |

En la comparación de embeddings, Morpheus (MAP 0,89) supera a BGE-M3 (0,72) y BERTurk (0,38) en recuperación por familia de raíces, si bien estos últimos son modelos de embedding de propósito general y no están especializados en morfología turca.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- Secuencias un 30 % más largas que byte-level BPE (1,90 frente a 1,56 tokens por palabra), lo que encarece la inferencia en pipelines posteriores.
- BPC un 2,8 % peor que byte-level BPE en el test controlado de 58M parámetros; con presupuesto igual de tokens, el modelo ve un 23 % menos de texto.
- Tokenizador más pesado: 29,6 MB frente a 4,6 MB de byte-level BPE.
- Generación más lenta en el modelo asociado: 474 frente a 874 caracteres/s.
- Cobertura limitada al turco; no se han publicado evaluaciones en otros idiomas.
- Integración en un LLM turco completo pendiente, según la propia model card (trabajo futuro).
- Riesgo de sesgos del corpus no caracterizado: la model card no detalla la composición ni la procedencia de los datos de entrenamiento.
- Licencia MIT permite uso comercial, pero el repositorio de Hugging Face figura con 0 GB y 0 descargas, por lo que la disponibilidad efectiva de artefactos debe verificarse antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/veripazari/TurkishMorpheus
- Repositorio original: https://github.com/lonewolf-rd/TurkishMorpheus
- Modelo original en Hugging Face: https://huggingface.co/lonewolflab/Morpheus-TR-50K
- Paper (arXiv): https://arxiv.org/abs/2606.18717
- Herramienta CorpusCollector: https://github.com/lonewolf-rd/CorpusCollector
- Plataforma VeriPazarı: https://veripazari.com.tr
