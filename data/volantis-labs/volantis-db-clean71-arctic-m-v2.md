# volantis-labs/volantis-db-clean71-arctic-m-v2

## Resumen

Volantis-db-clean71-arctic-m-v2 es un paquete de runtime de embeddings de texto en dos torres asimétricas, publicado por volantis-labs para su motor de búsqueda vectorial e híbrida embebido volantis-db. No es un checkpoint convencional de `transformers` ni de `sentence-transformers`: los documentos se codifican con el modelo original Snowflake/snowflake-arctic-embed-m-v2.0 (305,4 M de parámetros, sin cambios), mientras que las consultas se codifican con clean71-v1, una torre de consulta pequeña de 71,2 M de parámetros destilada en el mismo espacio de 768 dimensiones. El objetivo es reducir la latencia de consulta en el Neural Engine de Apple manteniendo la calidad de recuperación.

La torre de consulta tiene 6 capas, anchura 512, FFN de 1536, vocabulario de 98.304 tokens, pooling CLS y una proyección aprendida de 512 a 768 dimensiones; se inicializó a partir de los pesos publicados de Arctic. La torre de documentos conserva la ventana de 8192 tokens de Arctic, mientras que la de consulta se limita a 96 tokens con el prefijo `query: `. La salida es de 768 dimensiones, normalizada L2, y la puntuación es el producto escalar (equivalente al coseno).

La relevancia actual del paquete es acotada pero clara: ofrece recuperación multilingüe (14 idiomas objetivo) con latencias de consulta de 1-2 ms p50 en un M3 Max, a costa de una pérdida del 0,87 % en la métrica primaria respecto a la torre de consulta anterior (S2B), que era mucho mayor. Está estrictamente limitado a macOS sobre Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos torres asimétricas de transformer encoder (torre de consulta destilada de 6 capas + torre de documentos Arctic-embed-m-v2.0) |
| Parametros totales | 376.569.600 (71.201.280 consulta + 305.368.320 documentos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Consulta: 96 tokens (incluye prefijo y tokens especiales); documentos: 8192 tokens |
| Tipos de cuantizacion | CoreML INT8 solo pesos, por canal, simétrico (torre de consulta, principal); MLX FP16 (consulta, fallback); MLX FP16 (documentos) |
| Idiomas soportados | en, es, fr, de, pt, it, ru, zh, ja, ko, hi, ar, id, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | `.zem` propietario de volantis-db (761.146.896 bytes), `.mlmodelc` compilado de CoreML (71.618.688 bytes), manifiesto `volantis-model.json` y `SHA256SUMS` |
| Dimension de embedding | 768, normalizado L2 |
| Puntuacion | Producto escalar (= coseno) |
| Plataforma | macOS sobre Apple Silicon exclusivamente (CoreML en Neural Engine para consultas, MLX en GPU para documentos) |
| Libreria | volantis-db |
| Modelo base | Snowflake/snowflake-arctic-embed-m-v2.0 (commit `95c2741480856aa9666782eb4afe11959938017f`) |
| Tamano del repo | 0,8 GB |

## Arquitectura y entrenamiento

El paquete implementa un esquema de recuperación asimétrica de dos torres. La torre de documentos es el modelo Arctic-embed-m-v2.0 sin modificar, con 305,4 M de parámetros y ventana de 8192 tokens, ejecutado en MLX FP16 sobre la GPU. La torre de consulta, clean71-v1, es un transformer de 6 capas con anchura 512, FFN de 1536, vocabulario de 98.304 tokens, pooling CLS y una proyección lineal aprendida de 512 a 768 dimensiones; se inicializó desde los pesos publicados de Arctic y se destiló para alinearse con el espacio de embeddings de la torre de documentos. Cada torre tiene su propio tokenizador y volantis-db se encarga de añadir el prefijo `query: ` y de trocear los documentos.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset de destilación ni si se emplearon técnicas de preferencia (RLHF/DPO); esos datos no están disponibles. Sí se documenta con precisión la cuantización: la torre de consulta se compila a CoreML con pesos INT8 por canal y simétricos, activaciones y salida en FP16, y todas las operaciones de cómputo se ejecutan en el Neural Engine (230 operaciones ANE, 12 en CPU). El paquete incluye verificación de integridad por tamaño y SHA-256 de cada fichero mediante un manifiesto de formato 1.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación de información (pipeline `sentence-similarity` y `feature-extraction`).
- Recuperación asimétrica: consultas cortas (hasta 96 tokens) contra documentos largos (hasta 8192 tokens).
- Búsqueda densa y búsqueda híbrida (la model card reporta métricas separadas para ambas modalidades en volantis-db).
- Cobertura multilingüe en 14 idiomas objetivo: inglés, español, francés, alemán, portugués, italiano, ruso, chino, japonés, coreano, hindi, árabe, indonesio y vietnamita.
- Ejecución acelerada en Apple Silicon: CoreML INT8 en el Neural Engine para consultas y MLX FP16 en la GPU para documentos.
- Verificación criptográfica de los artefactos descargados (manifiesto con tamaño y SHA-256).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica local en aplicaciones macOS: el paquete se integra en volantis-db para indexar documentos con la torre Arctic y consultar con la torre pequeña, aprovechando la ventana de 8192 tokens para fragmentos largos y la latencia de 1-2 ms por consulta en el Neural Engine.
- Recuperación aumentada para asistentes de escritorio: un asistente que corre íntegramente en un Mac puede indexar documentación técnica o notas del usuario y recuperar pasajes relevantes sin enviar datos a la nube, gracias a la ejecución local en ANE y GPU.
- Búsqueda híbrida en bases de conocimiento internas: volantis-db combina la pata densa con recuperación léxica; las métricas de la model card en FiQA, SciFact y NFCorpus muestran que la modalidad híbrida mantiene la calidad con la torre de consulta cuantizada.
- Búsqueda multilingüe en corpus europeos y asiáticos: con cobertura declarada para 14 idiomas, es adecuado para catálogos o documentación en español, francés, alemán, italiano, portugués, ruso, chino, japonés, coreano, hindi, árabe, indonesio y vietnamita, siempre que se acepten las regresiones documentadas en ruso, vietnamita, chino y hindi.
- Deduplicación y agrupamiento de documentos: los embeddings de 768 dimensiones normalizados L2 permiten calcular similitud por producto escalar para agrupar pasajes duplicados o casi duplicados en pipelines de ingesta.
- Filtrado y reordenación de candidatos en un pipeline de búsqueda en dos fases: la torre de consulta rápida permite generar y puntuar muchos candidatos con baja latencia, y la torre de documentos de mayor capacidad aporta la representación de referencia para los pasajes.
- Aplicaciones de escritorio con requisitos de privacidad: al no requerir red tras la primera descarga verificada, encaja en herramientas de gestión documental o correo que deban mantener el contenido en el dispositivo.

## Benchmarks y rendimiento

Métricas de calidad de la model card: media equitativa de BEIR inglés (4 tareas), MIRACL (10 idiomas objetivo) y Belebele (14 idiomas objetivo), nDCG@10 con MTEB 2.20.5. Los vectores de documento son los de Arctic sin cambios. "Original S2B" es la torre de consulta anterior, de mayor tamaño.

| Grupo | clean71-v1 | Original S2B |
|---|---:|---:|
| English4 (SciFact, NFCorpus, FiQA, TREC-COVID) | 0,558788 | 0,558020 |
| MIRACL10 | 0,573916 | 0,574632 |
| Belebele14 | 0,865348 | 0,882941 |
| **Macro primaria** | **0,666017** | **0,671864** |
| Las 37 unidades, con idiomas fuera del alcance | 0,610932 | 0,719872 |

Regresiones dentro del conjunto objetivo (Belebele, nDCG@10, clean71-v1 frente a S2B): ruso 0,852 vs 0,890; vietnamita 0,797 vs 0,833; chino 0,875 vs 0,901; hindi 0,787 vs 0,812. Fuera del conjunto objetivo las caídas son severas: persa en MIRACL 0,140 vs 0,536; persa en Belebele 0,296 vs 0,852; tailandés 0,083 vs 0,850; telugu 0,066 vs 0,783; bengalí 0,075 vs 0,777; finés 0,463 vs 0,762; neerlandés 0,643 vs 0,877.

Precisión de esta release frente a una referencia FP32 con torre de consulta CoreML FP16, medida en volantis-db sobre BEIR (Apple M3 Max), nDCG@10:

| Corpus | Pata | Referencia FP32 | Esta release | Cambio |
|---|---|---:|---:|---:|
| FiQA (648 q) | densa | 0,421072 | 0,420397 | -0,160 % |
| FiQA | híbrida | 0,284278 | 0,284463 | +0,065 % |
| SciFact (300 q) | densa | 0,697647 | 0,696895 | -0,108 % |
| SciFact | híbrida | 0,720797 | 0,720797 | 0,000 % |
| NFCorpus (323 q) | densa | 0,339128 | 0,340106 | +0,288 % |
| NFCorpus | híbrida | 0,339312 | 0,339146 | -0,049 % |

Latencia de consulta densa p50 con la torre CoreML: aproximadamente 1-2 ms con batch 1, tokenización incluida, en un host cargado. El fallback MLX FP16: aproximadamente 6-7 ms, con calidad dentro del 0,2 % de FP32. El paquete es un 49,7 % más pequeño que la release FP32 (832.765.584 frente a 1.656.816.265 bytes).

## Requisitos de hardware

- Plataforma: exclusivamente macOS sobre Apple Silicon (Neural Engine para consultas vía CoreML, GPU para documentos vía MLX). No hay soporte para CUDA, ROCm ni CPU x86.
- VRAM/unified memory: los pesos suman unos 0,8 GB en disco; en memoria, la torre de documentos en FP16 ocupa aproximadamente 610 MB y la torre de consulta CoreML INT8 unos 72 MB. No se especifica el pico de memoria durante la inferencia.
- GPU recomendadas: no aplica el catálogo NVIDIA (A100, H100, RTX 4090); el paquete está pensado para chips Apple M-series. La model card cita mediciones en un Apple M3 Max.
- Cabe en hardware de consumo: sí, en cualquier Mac con Apple Silicon; el límite práctico es la memoria unificada disponible, muy por encima de los ~0,7 GB de pesos.
- Opciones de despliegue: únicamente a través de volantis-db (crate `volantis-db-text` en Rust, con `TextStore::open_model`). No es compatible con vLLM, llama.cpp, Ollama, TGI ni sentence-transformers.
- Latencia y throughput: consulta densa p50 de 1-2 ms (CoreML INT8, batch 1, tokenización incluida) y 6-7 ms (fallback MLX FP16) en M3 Max. No se publican cifras de throughput para la torre de documentos ni para lotes mayores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| volantis-db-clean71-arctic-m-v2 | 376,6 M totales (71,2 M consulta + 305,4 M documentos) | 96 tokens consulta / 8192 documentos | 14 | Apache 2.0 | Solo volantis-db, solo macOS Apple Silicon |
| Snowflake/snowflake-arctic-embed-m-v2.0 | 305,4 M | 8192 tokens | Multilingüe (no detallado en la informacion disponible) | Apache 2.0 | transformers, sentence-transformers, MLX, entre otros |
| Torre de consulta original S2B (referencia interna) | No disponible | No disponible | 14 | No disponible | volantis-db |
| Alternativas de embeddings multilingües de tamano medio | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa disponible es contra la torre de consulta anterior S2B: clean71-v1 obtiene una macro primaria de 0,666017 frente a 0,671864 (-0,87 %) con un 69 % menos de parámetros de consulta. Frente al modelo base Arctic-embed-m-v2.0, la diferencia es que este paquete sustituye la torre de consulta por una destilada y cuantizada, manteniendo los vectores de documento idénticos. No se dispone de datos de benchmarks de otros modelos de embeddings en la información proporcionada.

## Limitaciones y advertencias

- Plataforma cerrada: solo funciona en macOS sobre Apple Silicon a través de volantis-db; no es un checkpoint de `transformers` ni de `sentence-transformers` y no puede cargarse con las herramientas habituales.
- Cobertura multilingüe desigual: hay regresiones reales dentro del conjunto objetivo (ruso, vietnamita, chino, hindi en Belebele) y caídas muy severas fuera de él (persa, tailandés, telugu, bengalí, finés, neerlandés). Para idiomas fuera del conjunto objetivo debe usarse otro modelo de consulta.
- Ventana de consulta muy corta: 96 tokens incluyendo el prefijo `query: ` y tokens especiales; las consultas largas se truncan y pueden perder información.
- Cuantización INT8 en la torre de consulta: aunque la pérdida medida es como máximo del 0,16 % en los corpus evaluados, la evaluación se limita a FiQA, SciFact y NFCorpus; no hay datos de degradación en otros dominios.
- Riesgo de alucinación no aplica en sentido generativo (el modelo no genera texto), pero sí existe riesgo de recuperación irrelevante o falsos positivos en la similitud, especialmente en idiomas no cubiertos.
- Sesgos: la model card no documenta evaluaciones de sesgo demográfico, geográfico o lingüístico; no disponible.
- Licencia Apache 2.0: permite uso comercial, pero el paquete depende de los términos del modelo base Arctic y del propio motor volantis-db, cuyas condiciones de uso no se detallan en la información disponible.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la model card indica que la revisión debe fijarse a un commit concreto y al hash del manifiesto (`123c6308e00f769c68498f9df60dfb9efc688f58c4ff2c4da266f978fcb215dc`); no hay historial de producción publicado.
- Verificación obligatoria de integridad: el manifiesto y `SHA256SUMS` deben comprobarse antes de usar los artefactos; un manifiesto manipulado invalidaría el conjunto verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/volantis-labs/volantis-db-clean71-arctic-m-v2
- Modelo base: https://huggingface.co/Snowflake/snowflake-arctic-embed-m-v2.0
- Repositorio de volantis-db: https://github.com/volantis-labs/volantis-db
- Resultados de búsqueda web no relacionados con el modelo: https://volantis.co/, https://www.volantis.com/, https://volantis.io/, https://volantissemi.ai/, https://lagardedenuit.com/wiki/index.php?title=Volantis
- Paper, blog o demo oficiales del modelo: no disponible en la información proporcionada.
