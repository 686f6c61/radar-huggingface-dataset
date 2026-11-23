# volantis-labs/volantis-db-v98-e5-small

## Resumen

volantis-db-v98-e5-small es un modelo de embeddings de texto en dos torres (two-tower) publicado por volantis-labs para su uso dentro de Volantis DB, un motor de recuperación vectorial. No es un modelo generativo: su única función es producir vectores de 384 dimensiones, L2-normalizados, cuya similitud se calcula mediante producto escalar. La torre de consulta es un modelo propio (`v98-8-r1`, 52.142.592 parámetros) y la torre de documento reutiliza `intfloat/multilingual-e5-small` (117.505.920 parámetros), de modo que el par está diseñado para emparejar consultas cortas con pasajes largos.

La relevancia del modelo es acotada y muy específica: se distribuye exclusivamente en formato MLX para Apple Silicon, no incluye modelo Core ML y no publica pipeline en Hugging Face. Su interés práctico radica en que permite montar un sistema de recuperación multilingüe (14 idiomas objetivo) sobre hardware de Apple sin salir del ecosistema MLX, con un único artefacto de 347.613.712 bytes que Volantis DB verifica por tamaño y SHA-256.

El modelo llega con una model card inusualmente honesta: documenta explícitamente las pérdidas de calidad frente a usar e5 como torre de consulta, con caídas de hasta 0,763 nDCG@10 en tailandés y 0,752 en bengalí. Es, por tanto, un componente de infraestructura para un motor concreto, no un embedding generalista de propósito abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Two-tower (bi-encoder) derivada de BERT; torre de consulta propia y torre de documento `intfloat/multilingual-e5-small` |
| Parametros totales | Torre de consulta: 52.142.592; torre de documento: 117.505.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Consulta: 96 tokens (incluye prefijo y tokens especiales); documento: 512 tokens |
| Tipos de cuantizacion | No disponible (pesos en FP16; sin variantes GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | en, es, fr, de, pt, it, ru, zh, ja, ko, hi, ar, id, vi |
| Licencia | MIT |
| Formato de pesos | `.zem` (artefacto propio de Volantis DB, 347.613.712 bytes); pesos fuente FP16 y safetensors FP32 referenciados por SHA-256 |
| Dimension de embedding | 384 (L2-normalizada en ambas torres) |
| Pooling | Media y posterior normalización L2 |
| Prefijos | `query: ` en la torre de consulta; `passage: ` en la torre de documento |
| Funcion de score | Producto escalar de los dos vectores |
| Runtime | MLX, exclusivamente en Apple Silicon; `query_coreml` es null en `volantis-model.json` |
| Tamano del repo | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura es un bi-encoder asimétrico de dos torres. La torre de consulta, `v98-8-r1`, tiene 52.142.592 parámetros y deriva de la familia BERT; la cifra excluye el pooler no utilizado (148.224 parámetros copiados de e5). La torre de documento es `intfloat/multilingual-e5-small` en la revisión `614241f622f53c4eeff9890bdc4f31cfecc418b3`, con 117.505.920 parámetros. Ambas torres aplican pooling por media seguido de normalización L2 y devuelven 384 dimensiones, y la puntuación final es el producto escalar entre consulta y documento. Los límites de tokens (96 para consulta, 512 para documento) incluyen el prefijo y los dos tokens especiales; las consultas que exceden el límite se truncan y los documentos largos se fragmentan en trozos.

La información disponible no detalla el corpus de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables en un modelo de embeddings). Tampoco se describe la función de pérdida ni la estrategia de negativos. Lo que sí se publica son las huellas SHA-256 de los pesos fuente en FP32: `37e3a9507801e63e515a3d4d56897b3d86b05212f8b9d33bfe7c9c68a435eaec` para la torre de consulta y `1a55775f53449dac10a2bcbc312469fac40b96d53198c407081a831f81c98477` para la de documento. Volantis DB abre el modelo por repositorio, commit completo de 40 caracteres y SHA-256 del manifiesto (`bc60376c0cddb821120a70aa17bc9f3c553726843dccfbefbc5664beda8fb941`), verificando tamaño y hash de cada fichero.

## Capacidades

- Generación de embeddings de texto para recuperación densa: 384 dimensiones L2-normalizadas, puntuadas por producto escalar.
- Recuperación asimétrica consulta-documento: consultas cortas (hasta 96 tokens) contra pasajes de hasta 512 tokens.
- Cobertura multilingüe en 14 idiomas objetivo: inglés, español, francés, alemán, portugués, italiano, ruso, chino, japonés, coreano, hindi, árabe, indonesio y vietnamita.
- Integración nativa con Volantis DB mediante manifiesto verificado criptográficamente.
- Ejecución en Apple Silicon a través de MLX.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, visión ni audio: es un modelo de embeddings, no un modelo de lenguaje generativo.

## Casos de uso

- Búsqueda semántica sobre documentación técnica en Apple Silicon: se indexan los pasajes con la torre de documento (512 tokens por fragmento) y se consulta con la torre de consulta en MLX, sin necesidad de GPU dedicada. Adecuado cuando el equipo de desarrollo trabaja íntegramente en macOS.
- Recuperación multilingüe en aplicaciones de soporte: con 14 idiomas objetivo y nDCG@10 de 0,919 en español y 0,905 en francés sobre BelebeleRetrieval, permite que una consulta en castellano recupere pasajes en otros idiomas del catálogo con pérdidas mínimas respecto al techo de e5.
- Base de conocimiento interna con verificación de integridad: el manifiesto y los SHA-256 por fichero permiten desplegar el índice en entornos donde se exige cadena de custodia del artefacto, algo poco habitual en modelos de embeddings.
- Prototipado rápido de RAG en local: al ocupar 0,3 GB y ejecutarse en MLX, cabe en un MacBook sin GPU externa, lo que facilita iterar sobre pipelines de recuperación antes de mover el sistema a producción.
- Filtrado y deduplicación de corpus multilingües: la similitud por producto escalar sobre vectores normalizados permite agrupar documentos cercanos en 14 idiomas con un coste de inferencia bajo.
- Enrutamiento de consultas hacia índices especializados: la torre de consulta, con solo 52 millones de parámetros y 96 tokens de ventana, es lo bastante ligera para clasificar o dirigir consultas entrantes antes de lanzar la recuperación completa.
- Búsqueda en catálogos científicos o médicos en inglés: con nDCG@10 de 0,646 en SciFact, 0,725 en TRECCOVID y 0,307 en NFCorpus, cubre recuperación de literatura especializada dentro de los rangos documentados.

## Benchmarks y rendimiento

Los datos publicados corresponden a nDCG@10 y recall@100 del par completo, comparados con el mismo par usando e5 como torre de consulta (techo de referencia). Fuente: `PAIR.json` del pack de origen.

| Grupo | Tareas | nDCG@10 | Techo nDCG@10 | Recall@100 | Techo recall@100 |
|---|---|---|---|---|---|
| english | 4 | 0,499 | 0,511 | 0,488 | 0,495 |
| miracl_supported | 10 | 0,562 | 0,565 | 0,956 | 0,956 |
| belebele_supported | 14 | 0,903 | 0,913 | 0,992 | 0,994 |
| miracl_all_11 | 11 | 0,528 | 0,563 | 0,917 | 0,956 |
| all_previous_tasks | 37 | 0,633 | 0,741 | 0,856 | 0,922 |
| primary_macro | - | 0,655 | 0,663 | 0,812 | 0,815 |

Resultados por tarea con mayor pérdida frente al techo:

| Tarea | Subconjunto | Split | nDCG@10 | Techo | Delta |
|---|---|---|---|---|---|
| BelebeleRetrieval | tha_Thai-tha_Thai | test | 0,113 | 0,876 | -0,763 |
| BelebeleRetrieval | ben_Beng-ben_Beng | test | 0,087 | 0,838 | -0,752 |
| BelebeleRetrieval | tel_Telu-tel_Telu | test | 0,106 | 0,777 | -0,671 |
| BelebeleRetrieval | pes_Arab-pes_Arab | test | 0,522 | 0,919 | -0,397 |
| MIRACLRetrievalHardNegatives | fa | dev | 0,195 | 0,542 | -0,346 |
| BelebeleRetrieval | swh_Latn-swh_Latn | test | 0,507 | 0,829 | -0,322 |
| BelebeleRetrieval | fin_Latn-fin_Latn | test | 0,615 | 0,884 | -0,269 |
| BelebeleRetrieval | nld_Latn-nld_Latn | test | 0,764 | 0,929 | -0,165 |
| BelebeleRetrieval | yor_Latn-yor_Latn | test | 0,267 | 0,325 | -0,059 |
| SciFact | default | test | 0,646 | 0,677 | -0,031 |
| BelebeleRetrieval | zho_Hans-zho_Hans | test | 0,903 | 0,926 | -0,023 |
| BelebeleRetrieval | arb_Arab-arb_Arab | test | 0,869 | 0,885 | -0,016 |
| BelebeleRetrieval | rus_Cyrl-rus_Cyrl | test | 0,908 | 0,922 | -0,015 |
| BelebeleRetrieval | fra_Latn-fra_Latn | test | 0,905 | 0,919 | -0,014 |
| BelebeleRetrieval | jpn_Jpan-jpn_Jpan | test | 0,905 | 0,918 | -0,012 |
| FiQA2018 | default | test | 0,319 | 0,331 | -0,012 |
| BelebeleRetrieval | deu_Latn-deu_Latn | test | 0,914 | 0,925 | -0,011 |
| MIRACLRetrievalHardNegatives | ko | dev | 0,610 | 0,620 | -0,010 |
| BelebeleRetrieval | eng_Latn-eng_Latn | test | 0,940 | 0,948 | -0,009 |
| BelebeleRetrieval | spa_Latn-spa_Latn | test | 0,919 | 0,927 | -0,008 |
| BelebeleRetrieval | hin_Deva-hin_Deva | test | 0,853 | 0,861 | -0,008 |
| BelebeleRetrieval | ita_Latn-ita_Latn | test | 0,915 | 0,923 | -0,008 |
| MIRACLRetrievalHardNegatives | fr | dev | 0,485 | 0,492 | -0,008 |
| MIRACLRetrievalHardNegatives | zh | dev | 0,476 | 0,484 | -0,007 |
| BelebeleRetrieval | ind_Latn-ind_Latn | test | 0,908 | 0,915 | -0,007 |
| MIRACLRetrievalHardNegatives | hi | dev | 0,553 | 0,559 | -0,006 |
| BelebeleRetrieval | por_Latn-por_Latn | test | 0,900 | 0,906 | -0,006 |
| BelebeleRetrieval | kor_Hang-kor_Hang | test | 0,900 | 0,905 | -0,005 |
| NFCorpus | default | test | 0,307 | 0,310 | -0,003 |
| MIRACLRetrievalHardNegatives | ru | dev | 0,597 | 0,600 | -0,003 |
| MIRACLRetrievalHardNegatives | es | dev | 0,528 | 0,530 | -0,002 |
| MIRACLRetrievalHardNegatives | ar | dev | 0,723 | 0,724 | -0,001 |
| BelebeleRetrieval | vie_Latn-vie_Latn | test | 0,908 | 0,909 | -0,001 |
| TRECCOVID | default | test | 0,725 | 0,726 | -0,001 |

No se han publicado datos de latencia ni throughput en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido convencional; el artefacto completo ocupa 347.613.712 bytes (unos 0,33 GB) y los pesos se sirven en FP16. La torre de consulta (52 millones de parámetros) ronda los 0,1 GB en FP16 y la de documento (117 millones) unos 0,24 GB.
- GPU recomendadas: el modelo está restringido a Apple Silicon mediante MLX; no se documenta soporte para A100, H100 ni RTX 4090.
- Cabe en cualquier Mac con Apple Silicon: el tamaño del artefacto es inferior a 0,5 GB, por lo que la memoria unificada no es un cuello de botella.
- Opciones de despliegue: MLX es el único runtime soportado. No hay pesos GGUF, por lo que llama.cpp y Ollama no son aplicables; tampoco se documenta integración con vLLM ni TGI. El consumo previsto es a través de Volantis DB, que abre el modelo por repositorio, commit y SHA-256 del manifiesto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Runtime / formato | Notas |
|---|---|---|---|---|---|---|
| volantis-db-v98-e5-small | 52,1 M (consulta) + 117,5 M (documento) | 96 / 512 tokens | 14 | MIT | MLX, `.zem` | Par asimétrico; techo de referencia = e5 como torre de consulta |
| intfloat/multilingual-e5-small | 117,5 M | 512 tokens | ~100 (multilingüe amplio) | MIT | safetensors, amplio soporte (PyTorch, ONNX, etc.) | Base de la torre de documento; sirve como torre de consulta con mejor calidad en idiomas no objetivo |
| intfloat/multilingual-e5-base | No disponible en la información proporcionada | No disponible | No disponible | MIT | safetensors | Alternativa de mayor tamaño de la misma familia; sin datos de benchmark en esta ficha |

La comparación cuantitativa disponible se limita al propio techo de e5: en el grupo `all_previous_tasks` (37 tareas), este par obtiene 0,633 nDCG@10 frente a 0,741 con e5 como torre de consulta, y 0,856 frente a 0,922 en recall@100. En `primary_macro` la diferencia se reduce a 0,655 frente a 0,663.

## Limitaciones y advertencias

- Degradación severa fuera de los 14 idiomas objetivo: tailandés (0,113 frente a 0,876), bengalí (0,087 frente a 0,838), telugu (0,106 frente a 0,777), persa (0,522 frente a 0,919), finlandés (0,615 frente a 0,884), neerlandés (0,764 frente a 0,929), suajili (0,507 frente a 0,829) y yoruba (0,267 frente a 0,325). No debe desplegarse como solución multilingüe general.
- Ventana de consulta muy corta: 96 tokens incluyendo prefijo y tokens especiales. Las consultas más largas se truncan sin aviso, lo que puede eliminar información relevante en búsquedas formuladas como párrafos.
- Fragmentación obligatoria de documentos: los pasajes de más de 512 tokens se dividen en trozos, con la consiguiente pérdida de contexto entre fragmentos.
- Dependencia total de MLX y Apple Silicon: no hay pesos portables ni modelo Core ML (`query_coreml` es null). El despliegue en Linux, Windows o GPUs NVIDIA no está soportado.
- Formato propietario: los pesos se distribuyen como `.zem`, un artefacto de Volantis DB. No hay safetensors ni GGUF publicados en el repositorio, aunque la model card referencia hashes de pesos fuente en FP32.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base `intfloat/multilingual-e5-small` en su propio repositorio, ya que la torre de documento procede de él.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de recuperación espuria; el modelo devuelve similitudes, no verificaciones de veracidad.
- Sesgos: la información disponible no documenta evaluación de sesgos. Al heredar la torre de documento de e5, es previsible que arrastre los sesgos de su corpus, pero no se aportan datos.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado en Hugging Face. No hay evidencia de uso en producción fuera de Volantis DB.
- Sin datos de latencia ni throughput publicados, lo que impide dimensionar un despliegue a priori.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/volantis-labs/volantis-db-v98-e5-small
- Modelo base de la torre de documento: https://huggingface.co/intfloat/multilingual-e5-small
- Revisión del modelo base usada: `614241f622f53c4eeff9890bdc4f31cfecc418b3`
- Paper de la familia E5 (referencia del modelo base): https://arxiv.org/abs/2212.03533
- Repositorio oficial de E5: https://github.com/microsoft/unilm/tree/master/e5
- MLX (runtime de Apple): https://github.com/ml-explore/mlx
- No se han encontrado en la información proporcionada enlaces a demo, blog del autor, repositorio de Volantis DB ni paper del modelo.
