# xCloudinfo/xVITA-Rerank-300M-zhTW

## Resumen

xVITA-Rerank-300M-zhTW es un modelo de reordenamiento (cross-encoder reranker) desarrollado por la empresa taiwanesa xCloudinfo (云碩科技) para recuperación de información en chino tradicional. Forma parte de un sistema de búsqueda de dos etapas junto con el modelo de embeddings xVITA-Embed-300M-zhTW: el primer modelo recupera candidatos y este segundo modelo reordena los resultados para maximizar la precisión en la primera posición.

El modelo se basa en el modelo mmBERT-base de la Universidad Johns Hopkins, que utiliza la arquitectura ModernBERT con 307 millones de parámetros y una ventana de contexto de 8192 tokens. Su desarrollo surge de una restricción específica de la empresa: al trabajar con proyectos del sector público en Taiwán, no pueden utilizar modelos de origen chino (como los de BAAI o Alibaba), por lo que optaron por un modelo base con licencia MIT y origen académico claro.

La relevancia de este modelo radica en su enfoque en chino tradicional taiwanés, un área donde hay menos opciones disponibles. Los resultados publicados muestran mejoras significativas en recuperación de información en dominios como legislación, medicina y asuntos marítimos, con mejoras de hasta 20 puntos porcentuales en hit@1 y NDCG@10 en comparación con el uso exclusivo de embeddings.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en ModernBERT (mmBERT-base) |
| Parámetros totales | 307.531.009 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantización | No disponible (formato safetensors, compatible con bf16) |
| Idiomas soportados | Chino tradicional (optimizado), multilingüe (base mmBERT cubre 1800+ idiomas, sin verificación) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en la arquitectura ModernBERT, específicamente la variante mmBERT-base de la Universidad de Johns Hopkins. ModernBERT introduce mejoras sobre BERT tradicional como atención más eficiente y mayor longitud de contexto (8192 tokens). Al ser un cross-encoder, el modelo procesa el par (consulta, documento) simultáneamente, lo que permite capturar interacciones finas entre ambos textos.

El entrenamiento se realizó sobre un corpus propio de la empresa compuesto por tres líneas de datos: medicina taiwanesa (92.558 pares), conocimiento general y legislación de Taiwán (90.774 pares) y asuntos marítimos (69.526 pares). Tras la deduplicación, el conjunto final fue de 252.849 pares, de los cuales se muestrearon 60.000 para el entrenamiento. Se aplicó minería de negativos difíciles con 7 negativos por pregunta, extraídos por el modelo de embeddings xVITA-Embed-300M-zhTW, con un límite de similitud de 0.85. La función de pérdida fue BinaryCrossEntropyLoss, con 1 época, tamaño de lote efectivo de 32, tasa de aprendizaje de 2e-5, warmup de 0.1, precisión bf16 y longitud máxima de entrada de 768 tokens.

El entrenamiento se realizó en una GPU NVIDIA RTX 5090 (32 GB) en la plataforma interna xCloudFinetune Studio de la empresa, que gestiona tanto los datos como los procesos de entrenamiento, garantizando trazabilidad de cada dato.

## Capacidades

- Reordenamiento de documentos: el modelo puntúa pares (consulta, documento) para reordenar los resultados de recuperación.
- Búsqueda RAG de dos etapas: diseñado para ser utilizado después de un modelo de embeddings, mejorando la precisión de la primera posición.
- Multilingüe (base): aunque está optimizado para chino tradicional, la base mmBERT es multilingüe (más de 1800 idiomas), aunque la empresa no ha verificado su rendimiento en otros idiomas.
- Dominios específicos: entrenado en tres dominios (medicina, legislación taiwanesa, asuntos marítimos) con buen rendimiento en textos de estilo similar.
- Integración con sentence-transformers: compatible con la librería `sentence_transformers.cross_encoder.CrossEncoder`.
- Inferencia eficiente: al ser un modelo de 307M parámetros, es adecuado para despliegue en GPU de consumo.

## Casos de uso

- **Sistemas de atención al cliente en Taiwán**: el modelo puede reordenar respuestas en chatbots de atención al cliente que atienden consultas sobre servicios públicos, legislación o productos médicos, mejorando la precisión de la respuesta mostrada en primera posición.
- **Búsqueda jurídica en Taiwán**: para despachos de abogados o plataformas legales que necesitan recuperar artículos de leyes, reglamentos y jurisprudencia taiwanesa, el modelo reduce significativamente el tiempo de búsqueda al priorizar los documentos más relevantes.
- **Plataformas de salud y farmacia**: en aplicaciones de consulta sobre medicamentos, indicaciones o interacciones, el modelo puede reordenar los resultados de búsqueda para que los profesionales de la salud encuentren información correcta en el primer intento.
- **Sistemas de gestión documental en el sector marítimo**: para empresas navieras o de logística portuaria que necesitan consultar regulaciones marítimas, estándares de clasificación de buques o procedimientos operativos, el modelo mejora la recuperación de información en documentos técnicos.
- **Asistentes de conocimiento interno en empresas**: integrado en sistemas de búsqueda corporativa, el modelo puede reordenar resultados de bases de conocimiento internas (políticas, procedimientos, manuales) para que los empleados encuentren respuestas rápidamente.
- **Mejora de sistemas RAG en producción**: como componente de una arquitectura de generación aumentada por recuperación, el modelo puede ser desplegado en un servicio de reordenación que filtra los mejores candidatos antes de pasarlos al modelo generativo, reduciendo la carga computacional y mejorando la calidad de las respuestas.

## Benchmarks y rendimiento

Los resultados de rendimiento se publicaron en la model card, basados en evaluaciones internas con 500 preguntas por dominio y un pool de candidatos de aproximadamente 30.000 pasajes (top-20 candidatos, recuperador xVITA-Embed-300M-zhTW):

| Dominio | Métrica | Solo recuperador | Con xVITA-Rerank-300M-zhTW |
|---|---|---|---|
| Conocimiento general y legislación taiwanesa | hit@1 | 79.2% | **95.0%** |
| | NDCG@10 | 0.8756 | **0.9790** |
| Consultas médicas | hit@1 | 38.0% | **81.8%** |
| | NDCG@10 | 0.4822 | **0.9000** |
| Asuntos marítimos | hit@1 | 77.8% | **99.4%** |
| | NDCG@10 | 0.8288 | **0.9978** |

Validación interna (600 preguntas, pool de 59.959 documentos): hit@1 mejoró de 67.7% a 93.3%, NDCG@10 de 0.7425 a 0.9670 (+0.2245).

Es importante señalar que la model card advierte que estos números varían significativamente con el corpus. En DRCD (lectura comprensiva de Wikipedia en chino tradicional), el modelo no aporta mejora (−0.0011), ya que el recuperador ya alcanza hit@5 = 100%. Además, en el dominio médico, los números absolutos son optimistas porque existen múltiples respuestas válidas para una misma pregunta, aunque la comparación relativa sigue siendo válida.

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: con 307M parámetros y bf16, el modelo requiere aproximadamente 600 MB de VRAM para almacenamiento, pero con entradas de hasta 768 tokens y el overhead de la arquitectura cross-encoder, se recomienda al menos 2-4 GB de VRAM para inferencia en lote.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM es suficiente, incluyendo RTX 3060, RTX 4060, RTX 4090, A10, A100, etc. El entrenamiento se realizó en una RTX 5090 (32 GB).
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de consumo como las de la serie RTX 30/40/50.
- Opciones de despliegue: compatible con la librería sentence-transformers, que a su vez soporta servidores de inferencia como Hugging Face Text Embeddings Inference (TEI), vLLM (con soporte de cross-encoders), y llama.cpp (aunque no es el caso típico para cross-encoders). Se puede integrar fácilmente en aplicaciones Python.
- Latencia: para un par (consulta, documento) de hasta 768 tokens, la latencia en una RTX 4090 es de aproximadamente 10-20 ms por par, dependiendo del tamaño del lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialidad |
|---|---|---|---|---|
| xVITA-Rerank-300M-zhTW | 307M | 8192 | MIT | Chino tradicional, dominios de Taiwán |
| bge-reranker-v2-m3 | 568M | 8192 | MIT (con restricciones de uso) | Multilingüe (100+ idiomas), incluye chino |
| gte-multilingual-reranker | 568M | 8192 | MIT | Multilingüe, incluye chino |
| mxbai-rerank-v2 | 568M | 8192 | MIT | Multilingüe, basado en Qwen2 (origen chino) |

La ventaja principal de xVITA-Rerank-300M-zhTW es su origen claro y licencia MIT, lo que lo hace adecuado para proyectos gubernamentales en Taiwán que no permiten modelos de origen chino. En términos de rendimiento, la empresa publica resultados en dominios específicos que muestran mejoras significativas, pero no hay comparaciones directas con los otros modelos en los mismos corpus.

## Limitaciones y advertencias

- Sesgos y cobertura: el modelo está optimizado para chino tradicional taiwanés y no ha sido verificado para otros idiomas, aunque la base mmBERT es multilingüe.
- Generalización limitada: el rendimiento depende fuertemente del estilo del documento. La empresa informa que un modelo entrenado solo con datos de legislación generaliza bien a asuntos marítimos (97.4% hit@1) pero mal a consultas médicas (51.0%). Para dominios con estilo diferente, se recomienda fine-tuning adicional.
- Alucinación: como modelo de reordenamiento, no genera texto, pero puede asignar puntuaciones altas a documentos irrelevantes si el dominio no está bien representado en el entrenamiento.
- Contexto limitado a 768 tokens: aunque la base mmBERT soporta 8192 tokens, el entrenamiento se realizó con una longitud máxima de 768 tokens, lo que puede limitar la efectividad en documentos largos.
- Datos de entrenamiento específicos: el corpus de entrenamiento se compone de datos públicos de Taiwán, lo que puede no representar bien otros dialectos del chino o variantes regionales.
- Restricciones de uso comercial: la licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar los términos de la base mmBERT (MIT) y los datos de entrenamiento, que son propiedad de xCloudinfo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xCloudinfo/xVITA-Rerank-300M-zhTW
- Modelo de embeddings complementario: https://huggingface.co/xCloudinfo/xVITA-Embed-300M-zhTW
- Organización de xCloudinfo: https://huggingface.co/organizations/xCloudinfo/activity/all
- Modelo base mmBERT: https://huggingface.co/jhu-clsp/mmBERT-base
