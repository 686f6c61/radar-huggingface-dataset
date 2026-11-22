# tardellirs/brazembed-pt-br-sts

## Resumen

brazembed-pt-br-sts es un modelo de embeddings de frases especializado en similitud semantica (STS) para portugues de Brasil. Lo desarrolla tardellirs como uno de los cuatro expertos que componen la familia BrazEmbed-PT-BR, y se construye sobre BERTimbau (neuralmind/bert-base-portuguese-cased), el BERT brasileño de 110M de parametros preentrenado por NeuralMind sobre el corpus brWaC. El modelo resuelve una tarea concreta: generar representaciones vectoriales de 768 dimensiones que permitan puntuar la similitud semantica entre pares de frases y detectar duplicados.

La relevancia del modelo reside en su especializacion. Frente a un embedding generalista, este experto se ha afinado exclusivamente con objetivos de similitud (CoSENT) sobre pares de frases en portugues, lo que lo hace adecuado para tareas de deduplicacion, ranking por similitud y evaluacion de parafrasis. La familia completa incluye expertos para clasificacion/clustering, clasificacion de pares/NLI y retrieval/reranking, y un modelo fusionado generalista (brazembed-pt-br) que integra los cuatro.

Arquitectonicamente es un transformer BERT-base encoder-only de 108.923.136 parametros, con embeddings de 768 dimensiones, mean pooling y una longitud maxima de 128 tokens. Se distribuye bajo licencia MIT en formato safetensors y se carga directamente con sentence-transformers, sin necesidad de prefijos de instruccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT base, BERTimbau) |
| Parametros totales | 108.923.136 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; compatible con cuantizacion estandar via herramientas de despliegue) |
| Idiomas soportados | Portugues (pt), con enfasis en portugues de Brasil (pt-BR) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con sentence-transformers y text-embeddings-inference) |

## Arquitectura y entrenamiento

El modelo parte de BERTimbau base, un transformer encoder-only de 12 capas y 768 dimensiones de hidden state preentrenado con masked language modeling sobre brWaC. El entrenamiento se realizo en dos etapas. En la primera, BERTimbau se afino completamente con InfoNCE simetrico in-batch sobre 3.633 pares query-passage en portugues generados con Gemini, cubriendo dominios medico, legal, enciclopedico y web; este encoder de etapa 1 es comun a los cuatro expertos de la familia. En la segunda etapa, este experto concreto se entreno con un adaptador LoRA de rango 16 usando la perdida CoSENT (escala 20) sobre 14.739 pares de frases: STSb traducido automaticamente (5.749), train de ASSIN2 (6.500) y train de ASSIN (2.500), con puntuaciones normalizadas a 0-1.

Los pesos de cuatro semillas del adaptador LoRA se combinaron mediante un weight soup uniforme y se fusionaron en el modelo completo, de modo que se carga como un SentenceTransformer estandar sin adaptadores separados. Durante la auditoria se detectaron y eliminaron diez pares del test de ASSIN2 que habian filtrado al conjunto de entrenamiento por colisiones de traduccion. El entrenamiento se ejecuto en GPUs A10G en junio de 2026.

## Capacidades

- Generacion de embeddings de frases de 768 dimensiones con mean pooling, sin prefijo de instruccion.
- Puntuacion de similitud semantica entre pares de frases en portugues.
- Deteccion de duplicados y near-duplicates en textos en portugues de Brasil.
- Evaluacion de parafrasis y equivalencia semantica.
- Busqueda semantica por similitud (adecuada para conjuntos pequenos o como componente de ranking).
- Soporte de normalizacion de embeddings (normalize_embeddings=True) para usar similitud coseno.
- Integracion con text-embeddings-inference y endpoints compatibles.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de embeddings, no generativo.
- No dispone de capacidades de vision, audio ni modo thinking.

## Casos de uso

- Deduplicacion de registros: dado un catalogo de productos, articulos o tickets en portugues, se codifican las descripciones y se detectan pares con similitud coseno alta para fusionar o marcar duplicados. El modelo esta afinado especificamente para esta tarea.
- Deteccion de parafrasis en moderacion de contenido: comparar preguntas o respuestas de usuarios para identificar formulaciones equivalentes y agruparlas antes de aplicar politicas.
- Clustering de feedback de clientes: agrupar resenas o encuestas por similitud semantica para descubrir temas recurrentes, aunque para clustering puro el autor recomienda el experto brazembed-pt-br-clfclu.
- Ranking de candidatos en busqueda interna: reordenar resultados de un motor lexico (BM25) recalculando la similitud semantica entre la consulta y cada documento, como etapa de reranking ligera.
- Evaluacion de calidad de traduccion o resumen: medir la similitud entre el texto de referencia y la salida generada para detectar desviaciones semanticas en pipelines de evaluacion automatica.
- Construccion de indices vectoriales para RAG en portugues: generar embeddings de chunks de documentacion y almacenarlos en una base vectorial; para la recuperacion principal el autor recomienda el experto brazembed-pt-br-retrieval, pero este modelo sirve para la fase de similitud y verificacion.
- Filtrado de pares en anotacion de datos: pre-seleccionar pares de frases candidatos a etiquetar por similitud, reduciendo el coste de anotacion manual en proyectos de NLP en portugues.

## Benchmarks y rendimiento

| Benchmark | Tarea | Resultado |
|---|---|---|
| MTEB-BR (version de desarrollo, 16 tareas) | STS (ASSIN), media de categoria | 0.776 |

El autor advierte que el desarrollo itero contra esa version del benchmark sin split de validacion reservado, por lo que las cifras conllevan cierto optimismo de seleccion. Ademas, el modelo usa los splits de train de ASSIN y ASSIN2, por lo que sus puntuaciones en los splits de test de ASSIN estan en distribucion. El leaderboard publico MTEB-BR (por, v1) de 21 tareas evalua el modelo fusionado brazembed-pt-br (MTEB-BR 57.5), no este experto individual. No se han publicado resultados de benchmarks especificos de este experto en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 para los 109M de parametros; menos de 0,3 GB en fp16 o int8.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el modelo se entreno en A10G, pero para inferencia basta una T4, L4 o incluso CPU.
- Cabe en GPU de consumo: si, en cualquier RTX (incluso series GTX 10xx) y en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: sentence-transformers (nativo), text-embeddings-inference (tag text-embeddings-inference en el repo), ONNX Runtime y llama.cpp no aplica (no es modelo generativo); compatible con endpoints de Hugging Face.
- Latencia y throughput: no se han publicado cifras concretas; con 128 tokens de contexto y 109M de parametros, el throughput esperado es alto (miles de frases por segundo en GPU moderna), aunque no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Enfoque |
|---|---|---|---|---|---|
| brazembed-pt-br-sts | 109M | 128 | 768 | MIT | Experto STS en pt-BR |
| brazembed-pt-br (fusion) | no disponible | no disponible | no disponible | MIT | Generalista, MTEB-BR 57.5 |
| BERTimbau (base) | 110M | 512 | 768 | MIT | MLM, no es embedding de frases por si solo |
| multilingual-e5-base | 278M | 512 | 768 | MIT | Embeddings multilingues generalistas |

La comparacion con multilingual-e5-base es orientativa: no se dispone de resultados de este modelo en MTEB-BR en la informacion proporcionada, por lo que no se puede afirmar una superioridad o inferioridad numerica. Frente a BERTimbau base, la diferencia clave es que este modelo ya esta convertido en encoder de frases mediante InfoNCE y afinado con CoSENT, mientras que BERTimbau requiere pooling y afinado adicional para tareas de similitud.

## Limitaciones y advertencias

- Ventana de contexto muy corta (128 tokens): textos mas largos deben truncarse o dividirse en fragmentos, lo que puede perder contexto semantico.
- Especializado en STS: para clasificacion, clustering puro o retrieval principal el autor recomienda usar los otros expertos de la familia; usarlo fuera de su dominio degrada el rendimiento.
- Sesgos: al derivar de BERTimbau entrenado sobre brWaC (texto web), puede heredar sesgos de ese corpus; no se documentan evaluaciones de sesgo en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la similitud coseno puede dar puntuaciones altas a pares lexicamente similares con significado distinto; conviene calibrar umbrales por dominio.
- Cobertura limitada a portugues: no soporta otros idiomas de forma fiable.
- Resultados de evaluacion con optimismo de seleccion: las cifras de la version de desarrollo de MTEB-BR no provienen de un split reservado.
- Fuga de datos corregida parcialmente: aunque se eliminaron diez pares filtrados, el uso de los splits de train de ASSIN/ASSIN2 implica que las puntuaciones en sus tests estan en distribucion y no son comparables con modelos que no los usan.
- Licencia MIT: permite uso comercial sin restricciones, pero conviene verificar las licencias de los datos de entrenamiento subyacentes (STSb traducido, ASSIN, ASSIN2) si se redistribuye el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tardellirs/brazembed-pt-br-sts
- Modelo fusion generalista: https://huggingface.co/tardellirs/brazembed-pt-br
- Experto clasificacion/clustering: https://huggingface.co/tardellirs/brazembed-pt-br-clfclu
- Experto clasificacion de pares/NLI: https://huggingface.co/tardellirs/brazembed-pt-br-pairclf
- Experto retrieval/reranking: https://huggingface.co/tardellirs/brazembed-pt-br-retrieval
- Repositorio con route.py: https://github.com/tardellirs/brazembed-pt-br/blob/main/route.py
- Leaderboard MTEB-BR: https://huggingface.co/spaces/MTEB-BR/leaderboard
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Paper MTEB-BR: arXiv:2607.04581
