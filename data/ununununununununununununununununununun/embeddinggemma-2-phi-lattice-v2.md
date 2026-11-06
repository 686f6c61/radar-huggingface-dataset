# ununununununununununununununununununun/embeddinggemma-2-phi-lattice-v2

## Resumen

embeddinggemma-2-phi-lattice-v2 es un checkpoint derivado de google/embeddinggemma-2, un modelo de embeddings de texto orientado a recuperacion de informacion y similitud semantica. Lo publica el usuario ununununununununununununununununununun y no procede de Google: se trata de un ajuste post-entrenamiento que aplica una pasada de "cristalizacion" denominada phi-lattice v2 sobre los pesos lineales y convolucionales del modelo base, manteniendo la tabla de embeddings de tokens y las proyecciones de alineacion en su precision original.

El checkpoint conserva la ruta de carga estandar de SentenceTransformer y AutoModel, con pesos almacenados en bfloat16 y un total de 744.371.512 parametros. La propuesta tecnica es una cuantizacion estructurada sin datos (data-free) que combina una rejilla de 4 bits con una poda de aproximadamente el 24,8 % de los pesos, buscando reducir el coste de almacenamiento y computo sin degradar la calidad de recuperacion del modelo base.

Es relevante ahora porque los modelos de embeddings se despliegan a gran escala en sistemas de busqueda y RAG, donde el coste por vector y la latencia de indexacion importan tanto como la calidad. Este tipo de derivados permite evaluar si una cuantizacion agresiva mantiene el Recall@1 y la coherencia coseno respecto al baseline BF16, algo que el autor documenta con una comparativa de doce pares consulta-documento en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia EmbeddingGemma 2) con cabecera Matryoshka de 512 a 768 dimensiones |
| Parametros totales | 744.371.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos lineales y convolucionales en rejilla de 4 bits con poda del 24,80 % (phi-lattice v2); tabla de embeddings y proyecciones en precision original; inferencia en bfloat16 o float32 |
| Idiomas soportados | no disponible (la evaluacion del autor usa solo ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers y sentence-transformers) |

## Arquitectura y entrenamiento

El modelo base es un encoder de la familia EmbeddingGemma 2, disenado para producir embeddings de frase y documento con cabecera Matryoshka, lo que permite truncar la representacion a 768, 512, 256 o 128 dimensiones sin reentrenar. Sobre esa base, el autor aplica phi-lattice v2, una pasada de cuantizacion data-free que "cristaliza" los pesos lineales y convolucionales en una rejilla de 4 bits y aplica poda estructurada. La tabla de embeddings de tokens y las proyecciones de alineacion (incluida la cabecera de 512 a 768 y los proyectores de vision y audio) se mantienen en su precision original para preservar la fidelidad de la representacion.

No se documenta el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; el proceso descrito es de compresion post-entrenamiento, no de reentrenamiento supervisado. La innovacion declarada es la mejora de la relacion senal-ruido de cuantizacion (SQNR) frente a una cuantizacion uniforme de 4 bits: 21,07 dB frente a 19,18 dB, con una tasa de poda del 24,80 % frente al 0 % de la cuantizacion uniforme.

## Capacidades

- Generacion de embeddings de texto para similitud semantica y recuperacion de informacion (pipeline feature-extraction).
- Soporte de prefijos de tarea del modelo base, como SearchQuery y Document, para consultas y pasajes.
- Representaciones Matryoshka truncables a 768, 512, 256 y 128 dimensiones.
- Integracion directa con SentenceTransformer y AutoModel de transformers.
- Compatibilidad declarada con endpoints de HuggingFace (tag endpoints_compatible).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo exclusivamente de embeddings.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Busqueda semantica en produccion: el modelo genera vectores de consulta y de documento con prefijos dedicados (SearchQuery y Document), lo que permite indexar un corpus y recuperar pasajes por similitud coseno con Recall@1 de 1.000 en la evaluacion del autor.
- RAG sobre documentacion tecnica: al mantener la coherencia coseno en 0,9867 a 768 dimensiones y 0,9920 a 128 dimensiones, se puede truncar el vector a 128 dimensiones para reducir el tamano del indice vectorial sin perder recuperacion en la muestra evaluada.
- Deduplicacion y agrupamiento de textos: los embeddings permiten calcular similitud entre pares de documentos para detectar duplicados o agrupar contenido por tema en pipelines de ingesta.
- Clasificacion y filtrado por similitud: comparar la representacion de un texto con prototipos de categoria para enrutar tickets, correos o articulos hacia la cola adecuada.
- Cache semantica de respuestas: almacenar embeddings de preguntas frecuentes y resolver consultas nuevas por vecindad coseno antes de invocar un LLM generativo, reduciendo coste y latencia.
- Evaluacion de calidad de retrieval: servir como checkpoint de referencia comprimido para comparar el impacto de la cuantizacion frente al baseline BF16 en un banco de pruebas propio.

## Benchmarks y rendimiento

Los datos disponibles provienen de la comparativa del autor sobre doce pares consulta-documento en ingles, con prefijos de retrieval de la model card. Cosine es la concordancia media con el embedding del baseline en cada anchura Matryoshka; Margin es el coseno del documento emparejado menos la media de coseno con el resto.

| Metodo | SQNR 4-bit | Dispersion | Cosine 768 | Cosine 512 | Cosine 256 | Cosine 128 | Recall@1 | Margin |
|---|---|---|---|---|---|---|---|---|
| Baseline (BF16) | Referencia | 0,00 % | 1,0000 | 1,0000 | 1,0000 | 1,0000 | 1,000 | 0,2628 |
| Uniforme 4-bit | 19,18 dB | 0,00 % | 0,9819 | 0,9825 | 0,9842 | 0,9887 | 1,000 | 0,2722 |
| phi-lattice v1 | 19,28 dB | 22,41 % | 0,9864 | 0,9868 | 0,9881 | 0,9911 | 1,000 | 0,2594 |
| phi-lattice v2 (este repo) | 21,07 dB | 24,80 % | 0,9867 | 0,9872 | 0,9884 | 0,9920 | 1,000 | 0,2593 |

No se han publicado resultados de benchmarks estandar (MMLU, MTEB, BEIR) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 744 millones de parametros, en bfloat16 el checkpoint ocupa aproximadamente 1,5 GB, coherente con el tamano del repo; en float32 se situa en torno a 3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM efectiva para bfloat16, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual con soporte de bfloat16.
- Opciones de despliegue: sentence-transformers y transformers como rutas nativas; vLLM y TGI para servir a traves de endpoints compatibles; llama.cpp y Ollama no estan documentados para este checkpoint.
- Latencia y throughput estimados: no disponibles.
- Nota de precision: el autor advierte que float16 queda fuera del rango de activaciones de EmbeddingGemma 2; debe usarse bfloat16 o float32.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| embeddinggemma-2-phi-lattice-v2 | 744.371.512 | no disponible | Embeddings con cuantizacion 4-bit y poda | apache-2.0 | HuggingFace |
| google/embeddinggemma-2 (baseline) | no disponible | no disponible | Embeddings en BF16 | no disponible | HuggingFace |
| Cuantizacion uniforme 4-bit del baseline | no disponible | no disponible | Embeddings con cuantizacion uniforme | no disponible | Referencia interna del autor |

La comparativa se limita a las variantes documentadas por el autor; no se dispone de datos de modelos de embeddings de terceros con los que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- La evaluacion se reduce a doce pares consulta-documento en ingles; no hay evidencia de comportamiento en otros idiomas ni en corpus de mayor escala.
- El Margin del checkpoint (0,2593) es ligeramente inferior al del baseline (0,2628), lo que sugiere una separacion marginalmente menor entre documentos relevantes e irrelevantes.
- La cuantizacion y la poda introducen una perdida de fidelidad respecto al baseline: la concordancia coseno maxima es 0,9920 incluso en la anchura mas pequena.
- El autor no documenta sesgos conocidos, tasas de alucinacion ni limitaciones de contexto; al ser un modelo de embeddings, no genera texto y el riesgo de alucinacion se traslada al sistema que consuma los vectores.
- Licencia apache-2.0 declarada, pero conviene verificar las condiciones del modelo base google/embeddinggemma-2 antes de un uso comercial.
- El checkpoint tiene cero descargas y cero likes en el momento de la consulta, y fue creado en noviembre de 2026; no cuenta con validacion independiente.
- No debe usarse float16 en inferencia segun la advertencia del autor.

## Enlaces

- HuggingFace: https://huggingface.co/ununununununununununununununununununun/embeddinggemma-2-phi-lattice-v2
- Modelo base: https://huggingface.co/google/embeddinggemma-2
