# torinriley/nfcorpus-finetuned-minilm

## Resumen

`torinriley/nfcorpus-finetuned-minilm` es un modelo de embeddings de frases obtenido mediante ajuste fino (*fine-tuning*) del conocido `sentence-transformers/all-MiniLM-L6-v2` sobre el corpus NFCorpus del benchmark BEIR, un conjunto de datos de recuperación de información en el dominio médico y nutricional. Lo desarrolla el autor independiente torinriley como parte de un estudio de dos fases sobre ganancias de fine-tuning frente a líneas base y sobre un benchmark de índices ANN (VecStream) realizado con los embeddings reales del modelo.

El modelo conserva la arquitectura del base: un transformer tipo BERT destilado con 22.713.216 parámetros (22,7 M), pesos en formato safetensors y licencia Apache 2.0. Su función es la extracción de características y la similitud semántica orientada a recuperación (*retrieval*), con salida de embeddings normalizables para búsqueda por producto escalar.

Su relevancia es acotada y muy específica: no pretende ser un modelo de propósito general, sino un caso de estudio reproducible en el que se cuantifica de forma honesta cuánto aporta un ajuste fino pequeño en dominio médico (7.253 pares de entrenamiento, 3 épocas) sobre el modelo base en cero disparo. Los resultados publicados muestran una mejora modesta pero consistente (NDCG@10 de 0.319 a 0.332), lo que lo convierte en una referencia útil para quien quiera juzgar el coste/beneficio de afinar un MiniLM para un nicho concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM destilado) |
| Parametros totales | 22.713.216 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `sentence-transformers/all-MiniLM-L6-v2`, un encoder transformer de tipo BERT destilado de 22,7 M de parametros disenado para generar embeddings de frase. Sobre esa base se realizo un ajuste fino por aprendizaje contrastivo con la funcion de perdida `MultipleNegativesRankingLoss` (contraste con negativos en lote, estilo InfoNCE), implementada a traves de la libreria `sentence-transformers`.

Los datos de entrenamiento proceden de los *qrels* de entrenamiento de NFCorpus: se muestrearon hasta 3 pares positivos (consulta, documento relevante) por consulta con semilla 1234, para evitar sobrerrepresentar consultas con muchas anotaciones, sumando un total de 7.253 pares. El entrenamiento fue de 3 epocas con tamano de lote 32 y los hiperparametros por defecto de `sentence-transformers`; tardo 404 segundos de reloj en CPU y termino con una perdida de entrenamiento final de 2.576. No se aplico mineria de negativos duros, ni barrido de hiperparametros, ni multiples semillas: es explicitamente una primera iteracion, no un resultado optimizado. La evaluacion se hizo sobre el *test split* de NFCorpus (323 consultas) excluido del ajuste.

## Capacidades

- Generacion de embeddings de texto para frases, consultas y documentos.
- Similitud semantica entre textos mediante producto escalar de embeddings normalizados.
- Recuperacion de informacion (*retrieval*) en dominio medico y nutricional, con optimizacion especifica para NFCorpus.
- Extraccion de caracteristicas (*feature-extraction*) compatible con la libreria `sentence-transformers`.
- Compatibilidad con *text-embeddings-inference* y *endpoints* de Hugging Face.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta *tool calling*, *function calling* ni flujos de agente multi-paso.
- Capacidad multilingue: solo ingles.

## Casos de uso

- Recuperacion semantica en el dominio medico y nutricional: el modelo esta afinado especificamente sobre NFCorpus, por lo que es adecuado para indexar y recuperar documentos de nutricion clinica (por ejemplo, evidencia sobre dieta y colesterol, consumo de nutrientes o recomendaciones alimentarias) mediante busqueda por similitud vectorial.
- Busqueda de respuestas sobre articulos cientificos de nutricion: dado que el corpus de entrenamiento son documentos biomedicos, puede usarse para construir motores de busqueda interna sobre bibliotecas de literatura medica, devolviendo los pasajes mas relevantes para una consulta en lenguaje natural.
- Deduplicacion y agrupamiento de documentos medicos: al generar embeddings normalizados, permite agrupar por similitud coseno documentos con contenido redundante dentro de un archivo de publicaciones de nutricion.
- Clasificacion y enrutado por similitud: asignar consultas entrantes a categorias predefinidas comparando el embedding de la consulta con embeddings de prototipos de cada categoria, util en triaje documental.
- Benchmark y evaluacion de indices ANN: el autor uso este modelo para generar embeddings reales con los que probar el indice VecStream, por lo que sirve como banco de pruebas reproducible de pipelines de recuperacion vectorial.
- Base para experimentos de fine-tuning en dominio: dado su tamano reducido y su licencia permisiva, es util como punto de partida para investigar ganancias de ajuste fino en otros corpus, siguiendo la metodologia documentada en el informe del autor.
- Validacion de pipelines de evaluacion: el modelo base reproduce en cero disparo los numeros publicados de NFCorpus en BEIR/MTEB (~0.317 de NDCG@10), lo que permite usarlo como control para verificar que una tuberia de evaluacion de recuperacion funciona correctamente.

## Benchmarks y rendimiento

Resultados sobre el *test split* de NFCorpus (323 consultas, excluidas del ajuste fino), tal como los publica el autor:

| Metodo | Recall@10 | Recall@100 | NDCG@10 | NDCG@100 |
|---|---|---|---|---|
| TF-IDF (linea base lexica) | 0.141 | 0.234 | 0.291 | 0.255 |
| Modelo base, cero disparo | 0.159 | 0.315 | 0.319 | 0.302 |
| Este modelo | 0.164 | 0.350 | 0.332 | 0.327 |

La mejora sobre el modelo base en cero disparo es de +4,1 % relativo en NDCG@10 y +11,2 % relativo en Recall@100. El autor senala que la mejora es modesta porque el ajuste fino tambien lo es, y que el baseline cero disparo reproduce los valores publicados de `all-MiniLM-L6-v2` en NFCorpus (~0.317 de NDCG@10) dentro de la varianza normal entre ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 45 MB en FP16 y 90 MB en FP32 solo para los pesos; el pico de memoria en ejecucion depende del tamano de lote y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo es tan pequeno que no requiere aceleradores de gama alta. Funciona correctamente en GPU de consumo y tambien en CPU.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en hardware de gama baja.
- Opciones de despliegue: `sentence-transformers`, *text-embeddings-inference*, Hugging Face *endpoints*, y cualquier servidor de embeddings compatible con modelos BERT pequenos. El entrenamiento reportado se hizo en CPU en 404 segundos, lo que indica que la inferencia tambien es viable sin GPU.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | NDCG@10 en NFCorpus | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nfcorpus-finetuned-minilm | 22,7 M | no disponible | 0.332 | Apache 2.0 | Hugging Face |
| all-MiniLM-L6-v2 (base) | 22,7 M | no disponible | 0.319 (cero disparo) | Apache 2.0 | Hugging Face |
| Otras alternativas de la misma categoria (p. ej. `intfloat/e5-small-v2`, `BAAI/bge-small-en`) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento de los modelos alternativos de la misma categoria en la informacion proporcionada. La comparacion mas significativa y respaldada por datos es la del propio modelo frente a su base `all-MiniLM-L6-v2`, donde se observa la mejora en dominio.

## Limitaciones y advertencias

- Ajustado y evaluado en un unico dominio (NFCorpus/medico) con un unico modelo base y una unica semilla: el resultado es una estimacion puntual y no una afirmacion generalizable sobre ganancias de fine-tuning en otros dominios.
- Solo se usaron negativos en lote (in-batch negatives); no hubo mineria de negativos duros, lo que limita la calidad del ajuste.
- No se evaluo en cero disparo sobre otros conjuntos de BEIR, por lo que no se puede afirmar generalizacion entre dominios.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no genera texto; su riesgo es el de recuperar documentos poco relevantes o mal ordenados fuera de su dominio de entrenamiento.
- Sesgos conocidos: no disponibles en la informacion proporcionada; el rendimiento esta sesgado hacia el vocabulario y las convenciones del corpus NFCorpus en ingles.
- Limitacion de idioma: solo ingles; no se garantiza un comportamiento correcto en castellano ni en otras lenguas.
- Restricciones de licencia: Apache 2.0, permisiva para uso comercial, siempre que se conserve el aviso de licencia y atribucion.
- Caveat para produccion: por ser una primera iteracion sin barrido de hiperparametros ni multiples semillas, conviene tratarlo como modelo experimental antes de llevarlo a un sistema en produccion; para dominios distintos de NFCorpus se recomienda reajustar o usar un modelo mas generico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torinriley/nfcorpus-finetuned-minilm
- Dataset NFCorpus (BEIR): https://huggingface.co/datasets/BeIR/nfcorpus
- Modelo base `all-MiniLM-L6-v2`: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Repositorio del estudio (embed-retrieval): https://github.com/torinriley/hf-research/tree/main/embed-retrieval
- Informe completo (REPORT.md): https://github.com/torinriley/hf-research/blob/main/embed-retrieval/REPORT.md
