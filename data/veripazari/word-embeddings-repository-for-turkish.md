# veripazari/Word-Embeddings-Repository-for-Turkish

## Resumen

Word-Embeddings-Repository-for-Turkish es un repositorio de embeddings de palabras para el turco desarrollado originalmente por el colectivo Turkish-Word-Embeddings y archivado en Hugging Face por VeriPazarı. No es un modelo generativo ni un transformer de gran escala: se trata de un conjunto de utilidades, scripts y recursos (corpus, vectores y datasets de evaluación) para construir y evaluar embeddings estáticos y contextuales en turco. El proyecto se describe en el paper arXiv:2405.07778.

El objetivo del proyecto es cubrir la ausencia de recursos estandarizados de embeddings para el turco. Incluye implementaciones para Word2Vec, GloVe y FastText (embeddings estáticos), con planes de extender a métodos contextuales como BERT y ELMo. Cada método se aplica con distintos corpus y dimensiones, y se evalúa tanto de forma intrínseca (analogías y similitud) como extrínseca (análisis de sentimiento, NER y PoS tagging).

Es relevante para investigadores de PLN en lenguas túrquicas y para desarrolladores que necesiten representaciones léxicas ligeras sin depender de modelos neuronales grandes. El repositorio en Hugging Face tiene un tamaño de 0.0 GB y 0 descargas, lo que sugiere que el contenido pesado (vectores y corpus) reside en los releases de GitHub, no en el propio repo de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings de palabras estáticos (Word2Vec, GloVe, FastText); contextuales planificados (BERT, ELMo) |
| Parametros totales | no disponible (depende de la dimensión y del método; no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (embeddings de palabra, no modelo generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | no disponible (los releases de GitHub incluyen vectores y corpus; el repo de HF no contiene pesos) |

## Arquitectura y entrenamiento

El proyecto implementa métodos clásicos de embeddings de palabras. Word2Vec (arquitecturas CBOW y skip-gram, según las referencias arXiv:1310.4546 y arXiv:1301.3781), GloVe (basado en coocurrencia global) y FastText (que incorpora información de subpalabras, relevante para la morfología aglutinante del turco). Cada método se entrena sobre distintos corpus abiertos: Boun Web Corpus, HuaweiCorpus y Turkish CoNLL17 Corpus. Se contemplan variaciones de parámetros como el corpus y la dimensión del embedding.

El entrenamiento se realiza mediante scripts de Python y notebooks incluidos en el repositorio, con dependencias fijadas (gensim 4.3.1, py7zr 0.20.5, pandas 2.0.0, matplotlib 3.7.1, entre otras). La evaluación intrínseca emplea datasets de analogía sintáctica (Güngör et al., 29.364 instancias), analogía semántica (Kurt, 3.296 instancias), similitud sintáctica (WordSimTr, 140 pares) y similitud semántica (AnlamVer, 500 pares). La evaluación extrínseca cubre análisis de sentimiento, NER y PoS tagging con datasets turcos específicos. No se documenta uso de RLHF, DPO ni técnicas de alineación, ya que no es un modelo generativo.

## Capacidades

- Generación de embeddings de palabras estáticos para vocabulario turco mediante Word2Vec, GloVe y FastText.
- Representación de palabras con información subléxica (FastText), útil para palabras fuera de vocabulario y morfología aglutinante.
- Evaluación intrínseca de embeddings: tareas de analogía sintáctica y semántica, y similitud de pares de palabras.
- Evaluación extrínseca en tareas downstream: análisis de sentimiento, reconocimiento de entidades nombradas (NER) y etiquetado morfosintáctico (PoS tagging).
- Provisión de corpus abiertos en turco para entrenamiento (Boun Web Corpus, HuaweiCorpus, CoNLL17).
- Provisión de datasets de evaluación empaquetados para reproducibilidad.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje generativo.
- Capacidad multilingüe: no, exclusivamente turco.

## Casos de uso

- Investigación en PLN para turco: el repositorio permite reproducir experimentos de embeddings con distintos corpus y dimensiones, comparando Word2Vec, GloVe y FastText sobre las mismas tareas de evaluación.
- Análisis de similitud léxica en turco: uso de los vectores para calcular similitud entre palabras en aplicaciones de búsqueda semántica ligera o expansión de consultas, aprovechando los datasets WordSimTr y AnlamVer para calibrar.
- Clasificación de sentimiento en redes sociales y medios turcos: los embeddings sirven como capa de entrada para clasificadores supervisados, con datasets de entrenamiento y test ya definidos (Turkish Movie Dataset, Turkish Twitter Dataset, Turkish Sentiment Analysis Dataset).
- Reconocimiento de entidades nombradas en prensa turca: representaciones léxicas para alimentar modelos de NER sobre el corpus de periódicos nacionales anotado (28.468 frases de entrenamiento, 2.915 de test).
- Etiquetado PoS sobre UD BOUN Treebank: uso de los embeddings como features para taggers morfosintácticos en turco (8.782 frases de entrenamiento, 979 de test).
- Análisis de analogías morfológicas: estudio de la capacidad de FastText para capturar relaciones de sufijación y derivación en turco, gracias a la información de subpalabras.
- Baseline para comparación con modelos contextuales: servir como referencia clásica frente a BERT y ELMo en experimentos de PLN en turco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio describe las tareas y datasets de evaluación, pero no incluye en la información proporcionada cifras concretas de precisión, F1 ni correlaciones de similitud para los distintos métodos y configuraciones.

## Requisitos de hardware

- Al no ser un modelo generativo, no requiere VRAM de GPU para inferencia; los embeddings se cargan en memoria RAM.
- El consumo de RAM depende del vocabulario y de la dimensión del embedding; para vocabularios turcos grandes con dimensiones típicas (100-300) el uso es del orden de cientos de MB a pocos GB.
- CPU suficiente para cargar y consultar vectores; GPU no necesaria para uso en inferencia.
- El entrenamiento de embeddings con gensim es viable en CPU; corpus grandes pueden beneficiarse de más núcleos y RAM, pero no requieren GPU dedicada.
- Despliegue: scripts de Python con gensim; no aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles; para búsquedas de similitud sobre vocabulario completo se recomienda indexación vectorial (por ejemplo, FAISS) aunque no se documenta en el repositorio.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Word-Embeddings-Repository-for-Turkish | Embeddings estáticos (Word2Vec, GloVe, FastText) | Turco | no disponible | no aplica | MIT | Hugging Face + GitHub |
| fastText preentrenado turco (Facebook) | Embeddings estáticos | Turco y multilingüe | no disponible | no aplica | MIT | Disponible en fasttext.cc |
| BERTurk (dbmdz) | Transformer encoder | Turco | ~110M (base) | 512 tokens | MIT | Hugging Face |
| Turkish CoNLL17 vectors (NLPL) | Embeddings estáticos | Turco | no disponible | no aplica | no disponible | vectors.nlpl.eu |

La comparativa se limita a alternativas de la misma categoría (representaciones léxicas en turco) y a un encoder contextual de referencia. No se dispone de cifras comparativas de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona ni soporta tool calling; su uso se limita a representaciones léxicas.
- Los embeddings estáticos no capturan polisemia ni contexto; palabras con múltiples significados comparten un único vector.
- El repositorio de Hugging Face tiene 0.0 GB y 0 descargas; el contenido pesado (vectores, corpus) se distribuye mediante releases de GitHub, por lo que su disponibilidad depende de esos enlaces externos.
- El proyecto está archivado por VeriPazarı y no mantenido por los autores originales en Hugging Face; puede no recibir actualizaciones.
- Cobertura exclusiva del turco; no apto para otros idiomas.
- Los métodos contextuales (BERT, ELMo) están planificados pero no consta que estén implementados en la información disponible.
- Riesgo de sesgos presentes en los corpus de origen (prensa, redes sociales, web), que pueden reflejar sesgos sociales o de dominio.
- Aunque la licencia es MIT, conviene verificar las licencias de los corpus subyacentes (Boun, Huawei, CoNLL17) antes de uso comercial.
- No hay benchmarks publicados en la información disponible, lo que dificulta evaluar su calidad frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/veripazari/Word-Embeddings-Repository-for-Turkish
- Paper: https://arxiv.org/abs/2405.07778
- Repositorio original en GitHub: https://github.com/Turkish-Word-Embeddings/Word-Embeddings-Repository-for-Turkish
- Wiki del proyecto: https://github.com/Turkish-Word-Embeddings/Word-Embeddings-Repository-for-Turkish/wiki
- Release v1.0.0 (vectores, corpus y dataset de evaluación): https://github.com/Turkish-Word-Embeddings/Word-Embeddings-Repository-for-Turkish/releases/tag/v1.0.0
- VeriPazarı: https://veripazari.com.tr
- Boun Web Corpus: https://tulap.cmpe.boun.edu.tr/entities/corpus/c9f404aa-64da-4be5-a173-99b141bde7bd
- HuaweiCorpus: https://github.com/onurgu/linguistic-features-in-turkish-word-representations/releases/tag/v1.0
- Turkish CoNLL17 Corpus: http://vectors.nlpl.eu/repository/
- Word2Vec (arXiv:1310.4546): https://arxiv.org/abs/1310.4546
- Word2Vec (arXiv:1301.3781): https://arxiv.org/abs/1301.3781
- GloVe: https://nlp.stanford.edu/pubs/glove.pdf
- FastText (arXiv:1607.04606): https://arxiv.org/abs/1607.04606
- BERT (arXiv:1810.04805): https://arxiv.org/abs/1810.04805
- ELMo (arXiv:1802.05365): https://arxiv.org/abs/1802.05365
- UD BOUN Treebank (arXiv:2002.10416): https://arxiv.org/abs/2002.10416
- Dataset de analogía de Kurt: https://github.com/bunyamink/word-embedding-models/tree/master/datasets/analogy
- AnlamVer: https://aclanthology.org/C18-1323/
- Turkish National Newspapers con NER: https://aclanthology.org/C18-1177/
