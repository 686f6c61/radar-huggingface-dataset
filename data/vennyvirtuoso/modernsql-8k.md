# vennyvirtuoso/modernsql-8k

## Resumen

modernsql-8k es un bi-encoder de recuperación semántica especializado en esquemas SQL y DDL para pipelines de Text-to-SQL con arquitectura RAG. Lo desarrolla el usuario vennyvirtuoso y se construye mediante fine-tuning del checkpoint base answerdotai/ModernBERT-base, un transformer encoder bidireccional de 149 millones de parámetros con contexto nativo de 8.192 tokens. El modelo no genera SQL: su función es mapear preguntas en lenguaje natural y definiciones de tablas (sentencias CREATE TABLE) a un espacio vectorial común, de modo que un sistema posterior pueda seleccionar las tablas relevantes antes de invocar a un LLM generador.

El problema que aborda es el enrutamiento de tablas en bases de datos empresariales grandes, donde el esquema completo no cabe en el contexto del modelo generador y es necesario recuperar solo las tablas pertinentes. La propuesta es un recuperador ligero (149M parámetros, 0,6 GB de repositorio) con latencia declarada de 35,83 ms por esquema y throughput de 2.215 consultas por segundo en GPU, pensado para microservicios de baja latencia.

Es relevante ahora por la combinación de contexto largo (8.192 tokens, suficiente para DDL extensos), licencia Apache 2.0 y compatibilidad con transformers y sentence-transformers. No obstante, los resultados publicados por el propio autor son muy bajos en términos absolutos (Top-1 del 1,50 %), por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (ModernBERT), bi-encoder con pooling medio y normalización L2 |
| Parámetros totales | 149.014.272 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (FlashAttention-2 bidireccional) |
| Tipos de cuantización | No disponible (entrenado en bfloat16/fp16; el repo contiene safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un encoder transformer bidireccional con atención FlashAttention-2 y RoPE que sustituye a los BERT clásicos en tareas de recuperación y clasificación. Sobre esa base se aplica un fine-tuning como bi-encoder: cada texto (consulta o esquema DDL) se codifica de forma independiente, se aplica pooling medio enmascarado sobre los estados ocultos y se normaliza el vector resultante, de modo que la similitud coseno entre embeddings aproxima la relevancia consulta-tabla. El uso de prefijos distintos ("query: " y "schema: ") separa ambos dominios en el espacio latente.

El entrenamiento se realizó sobre un corpus descrito como «Enterprise Multi-Domain Text-to-SQL Schema & DDL Retrieval Corpus (10K Schema-Enforced Pairs)», con 10.000 pares consulta-esquema, en precisión mixta (bfloat16/fp16). La model card no detalla la función de pérdida, el número de tokens vistos, la composición del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un bi-encoder de recuperación). El autor declara evaluación sobre splits disjuntos por grupo para evitar fuga de datos, pero no publica la metodología de partición.

## Capacidades

- Recuperación semántica de tablas y esquemas DDL a partir de preguntas en lenguaje natural.
- Similitud entre frases (sentence-similarity) mediante embeddings normalizados y producto escalar.
- Procesamiento de DDL largos: contexto nativo de 8.192 tokens, adecuado para sentencias CREATE TABLE extensas o lotes de definiciones.
- Integración como recuperador en pipelines RAG de Text-to-SQL: selecciona tablas candidatas antes de la generación.
- Compatibilidad con transformers, sentence-transformers, peft y accelerate.
- Inferencia en bfloat16/fp16 con device_map automático.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking: es exclusivamente un encoder de extracción de características.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Enrutamiento de tablas en bases de datos empresariales: dado un catálogo con cientos de tablas, el modelo indexa cada DDL y recupera las candidatas para una pregunta; el LLM generador recibe solo ese subconjunto, reduciendo contexto y coste.
- Pipeline RAG de Text-to-SQL: se precalculan embeddings de todos los esquemas y se consulta en milisegundos por pregunta; el throughput declarado de 2.215 consultas/s en GPU permite atender picos de tráfico en un microservicio.
- Asistentes de análisis de datos (BI conversacional): el recuperador identifica las tablas de ventas, clientes o inventario relevantes antes de que el modelo generador construya la consulta SQL.
- Desambiguación de esquemas con nombres crípticos: al comparar semánticamente la pregunta con los comentarios y nombres de columnas del DDL, ayuda a elegir entre tablas homónimas de distintos dominios.
- Indexación de documentación de datos: además de DDL, puede indexar descripciones de tablas y diccionarios de datos para búsqueda semántica interna.
- Filtrado previo en herramientas de autocompletado SQL: sugiere tablas mientras el analista escribe una consulta, con latencia compatible con interfaces interactivas.
- Evaluación offline de catálogos: comparar la similitud entre preguntas históricas y el esquema para detectar tablas huérfanas o mal documentadas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de test retenido:

| Métrica | Fine-tuned | Baseline zero-shot | Ganancia absoluta |
|---|---|---|---|
| Top-1 accuracy (recuperación de esquema) | 1,50 % | 0,80 % | +0,70 % |
| Top-5 accuracy | 6,80 % | 5,20 % | +1,60 % |
| MRR@10 | 0,0416 | 0,0270 | +0,0146 |
| Contexto nativo | 8.192 tokens | — | — |
| Throughput en lote (GPU) | 2.215,1 consultas/s | — | — |
| Latencia de embedding por esquema | 35,83 ms | — | — |

Los valores absolutos son muy bajos: un Top-1 del 1,50 % implica que en más del 98 % de los casos la tabla correcta no es la primera. La ganancia frente al baseline es real pero modesta, y el autor no especifica el tamaño del conjunto de candidatos ni la métrica exacta de evaluación, lo que limita la comparabilidad.

## Requisitos de hardware

- VRAM estimada: en bfloat16, unos 0,3 GB de pesos; en fp32, unos 0,6 GB. Con activaciones para secuencias de 8.192 tokens, el consumo puede situarse en el rango de 2-4 GB, aunque el autor no publica mediciones.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en todas las GPU modernas con 8 GB o más.
- Despliegue: transformers (AutoModel/AutoTokenizer), sentence-transformers, accelerate con device_map="auto"; también es viable exportarlo a ONNX o usar llama.cpp/TGI solo si se convierte a los formatos soportados, algo no documentado por el autor.
- Latencia y throughput: 35,83 ms por esquema y 2.215 consultas/s en evaluación por lotes en GPU, según la model card; no se especifica la GPU empleada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| modernsql-8k | 149M | 8.192 | Recuperación de esquemas SQL (bi-encoder) | Apache 2.0 |
| answerdotai/ModernBERT-base | 149M | 8.192 | Encoder generalista | Apache 2.0 |
| BGE-base-en-v1.5 | 109M | 512 | Embeddings generalistas | MIT |
| Sentence-transformers/all-MiniLM-L6-v2 | 22M | 256 | Embeddings generalistas | Apache 2.0 |

No se dispone de comparativas publicadas frente a recuperadores específicos de esquemas SQL; la comparación con ModernBERT-base se limita a la tabla de benchmarks anterior (Top-1 1,50 % frente a 0,80 % zero-shot).

## Limitaciones y advertencias

- Rendimiento absoluto muy bajo: Top-1 del 1,50 % y MRR@10 de 0,0416 hacen inviable su uso como único mecanismo de enrutamiento en producción sin un filtrado o reranking adicional.
- El autor no documenta el tamaño del conjunto de candidatos ni las condiciones exactas de evaluación, lo que impide reproducir los números.
- Riesgo de alucinación de relevancia: al ser un bi-encoder, puede asignar alta similitud a tablas con vocabulario parecido pero semánticamente incorrectas.
- Idiomas no declarados: no hay garantía de funcionamiento fuera del inglés, idioma presumible del corpus de entrenamiento.
- El dataset referenciado ("Enterprise") no está descrito en detalle; se desconoce su composición, dominio y posibles sesgos.
- No es un generador de SQL: requiere un LLM adicional para producir las consultas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación de la comunidad.
- El repositorio ocupa 0,6 GB, coherente con pesos en fp32; conviene convertir a bfloat16 para reducir memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vennyvirtuoso/modernsql-8k
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset referenciado: https://huggingface.co/datasets/Enterprise
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
