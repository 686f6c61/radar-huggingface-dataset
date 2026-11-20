# syntriq/lupe-multilingual-reranker-small

## Resumen

Lupe Multilingual Reranker Small es un cross-encoder multilingue de 141 millones de parametros desarrollado por syntriq, disenado especificamente para la segunda etapa de recuperacion en sistemas de busqueda y RAG (retrieval-augmented generation). El modelo puntua pares consulta-pasaje y reordena los candidatos recuperados previamente por un modelo de embeddings o BM25, mejorando la precision del ranking final. Cubre 36 idiomas de entrenamiento y se evalua en 18 idiomas de MIRACL, con especial enfasis en aleman e ingles.

El modelo se construye sobre una arquitectura ModernBERT como cross-encoder y se destila a partir de un reranker abierto de mayor tamano (syntriq/lupe-german-reranker-small como modelo base). Su propuesta de valor es ofrecer, en la clase de 141M parametros, el mejor rendimiento en MIRACL y en los conjuntos alemanes segun la evaluacion del propio autor, con licencia Apache 2.0 y exportaciones ONNX listas para inferencia en CPU.

Es relevante ahora porque los pipelines RAG en produccion necesitan rerankers ligeros, multilingues y desplegables en CPU sin GPU dedicada, y este modelo apunta exactamente a ese hueco: 141M parametros, contexto de 512 tokens por par, cuantizacion int8 disponible y compatibilidad con el ecosistema sentence-transformers y text-embeddings-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en ModernBERT (transformer encoder) |
| Parametros totales | 140.641.921 (141M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens para consulta + pasaje (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | fp32 (PyTorch y ONNX) e int8 (cuantizacion dinamica ONNX, optimizada para AVX-512 VNNI) |
| Idiomas soportados | 36 idiomas de entrenamiento; evaluado en 18 idiomas MIRACL mas aleman e ingles: ar, bg, bn, ca, cs, da, de, el, en, es, fa, fi, fr, he, hi, hu, id, it, ja, ko, nl, no, pl, pt, ro, ru, sk, sv, sw, te, th, tr, uk, vi, yo, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) y ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: recibe un par (consulta, pasaje) y produce una puntuacion de relevancia, sin generar embeddings independientes. Se basa en ModernBERT, una arquitectura transformer encoder con atencion optimizada para secuencias de hasta 512 tokens, y se distribuye mediante la libreria sentence-transformers con la clase `CrossEncoder`. El modelo base declarado es syntriq/lupe-german-reranker-small, del que se destila, y el autor indica que se entreno sin datos personales reales.

Los datos de entrenamiento incluyen los conjuntos sentence-transformers/miracl, wikimedia/wikipedia, HuggingFaceFW/fineweb-2, HuggingFaceFW/finepdfs, PaDaS-Lab/webfaq-retrieval y cross-encoder/ettin-reranker-v1-data. No se especifica el numero total de tokens de entrenamiento ni si hubo fases de RLHF o DPO; al tratarse de un reranker, el entrenamiento tipico es supervisado con pares positivos y negativos. La innovacion destacable es la destilacion desde un reranker mayor manteniendo un tamano reducido, junto con la exportacion ONNX int8 con cuantizacion dinamica para despliegue en CPU.

## Capacidades

- Reranking de pares consulta-pasaje en 36 idiomas, con evaluacion en 18 idiomas MIRACL.
- Puntuacion de relevancia en el rango 0 a 1, apta para umbrales y ordenacion.
- Integracion nativa con sentence-transformers mediante `CrossEncoder` y el metodo `rank`.
- Exportacion ONNX para inferencia en CPU, incluida version int8 cuantizada.
- Compatibilidad con text-embeddings-inference y endpoints compatibles.
- No genera texto ni embeddings: su unica funcion es puntuar y reordenar.
- No dispone de tool calling, function calling ni capacidades de agente.
- No soporta vision, audio ni modo thinking.

## Casos de uso

- Segunda etapa en pipelines RAG: recuperar entre 50 y 200 candidatos con un modelo de embeddings o BM25 y reordenarlos con este cross-encoder para mejorar la precision del contexto entregado al LLM; su tamano de 141M permite ejecutarlo en CPU junto al generador.
- Busqueda empresarial multilingue: reordenar resultados en 36 idiomas con un unico modelo, evitando mantener un reranker por idioma; especialmente util en corpus con documentos en aleman, ingles, espanol, frances y arabe.
- Atencion al cliente sobre base documental: reordenar las respuestas candidatas de una FAQ o knowledge base antes de mostrarlas, usando el conjunto webfaq-retrieval presente en el entrenamiento como dominio afín.
- Busqueda en documentacion tecnica alemana: con nDCG@10 de 0.991 en GermanQuAD y 0.858 en GermanDPR segun el autor, es adecuado para portales de soporte y manuales en aleman.
- Filtrado de contexto para LLM con ventana limitada: al reordenar y seleccionar solo los pasajes mas relevantes, reduce el numero de tokens enviados al modelo generativo y el coste por consulta.
- Despliegue en entornos sin GPU: la version ONNX int8 permite servir el reranker en CPUs x86 con AVX-512 VNNI o en Apple Silicon, con 14,2 pares por segundo medidos en un Apple M5 a 512 tokens por par.
- Evaluacion y ajuste de sistemas de recuperacion: servir como referencia de ranking para medir la calidad de la primera etapa de recuperacion en experimentos de IR.

## Benchmarks y rendimiento

nDCG@10 segun la evaluacion del autor (hasta 200 consultas por conjunto, mismas consultas y harness para todos los modelos):

| Modelo | MIRACL media (18 idiomas) | MIRACL-de | MIRACL-en | NanoBEIR | GermanQuAD | GermanDPR | Parametros |
|---|---|---|---|---|---|---|---|
| syntriq/lupe-multilingual-reranker-small | 0.787 | 0.739 | 0.714 | 0.707 | 0.991 | 0.858 | 141M |
| Horizon-Labs/multilingual-reranker-small | 0.753 | 0.712 | 0.691 | 0.669 | 0.986 | 0.843 | 141M |
| cross-encoder/mmarco-mMiniLMv2-L12-H384-v1 | 0.736 | 0.701 | 0.656 | 0.638 | 0.925 | 0.804 | 118M |
| mixedbread-ai/mxbai-rerank-xsmall-v1 | 0.511 | 0.547 | 0.712 | 0.640 | 0.907 | 0.743 | 71M |
| jinaai/jina-reranker-v1-turbo-en | 0.354 | 0.307 | 0.613 | 0.653 | 0.768 | 0.624 | 38M |
| cross-encoder/ms-marco-MiniLM-L12-v2 | 0.307 | 0.302 | 0.660 | 0.665 | 0.844 | 0.592 | 33M |

Conjuntos completos MIRACL dev (todas las consultas): MIRACL-de 0.747 (221 consultas) y MIRACL-en 0.726 (705 consultas). Conjuntos alemanes completos: GermanQuAD 0.989 (2.204 consultas) y GermanDPR 0.870 (1.025 consultas).

Aceleracion medida en CPU Apple M5 (batch 32, 512 tokens por par): PyTorch fp32 19,2 pares/s; ONNX fp32 12,9 pares/s; ONNX int8 14,2 pares/s. El autor indica que en esa CPU ARM ONNX no es mas rapido que PyTorch y que no midio la velocidad int8 en x86.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,6 GB en fp32 (141M parametros), alrededor de 0,3 GB en int8; cabe en cualquier GPU consumer.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU con 2 GB o mas de VRAM es suficiente (RTX 3060, RTX 4090, A100, H100).
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas.
- Despliegue: sentence-transformers (PyTorch y backend ONNX), text-embeddings-inference y endpoints compatibles; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 19,2 pares/s en PyTorch fp32, 12,9 pares/s en ONNX fp32 y 14,2 pares/s en ONNX int8 sobre CPU Apple M5 con batch 32 y 512 tokens por par; no hay datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MIRACL media | Licencia | Formatos |
|---|---|---|---|---|---|
| syntriq/lupe-multilingual-reranker-small | 141M | 512 tokens | 0.787 | Apache 2.0 | safetensors, ONNX |
| Horizon-Labs/multilingual-reranker-small | 141M | no disponible | 0.753 | no disponible | no disponible |
| cross-encoder/mmarco-mMiniLMv2-L12-H384-v1 | 118M | no disponible | 0.736 | no disponible | no disponible |
| mixedbread-ai/mxbai-rerank-xsmall-v1 | 71M | no disponible | 0.511 | no disponible | no disponible |

Frente a Horizon-Labs/multilingual-reranker-small, de identico tamano, la ventaja es de 0,034 puntos en la media MIRACL. Frente a mmarco-mMiniLMv2, con 23M menos de parametros, la ventaja es de 0,051 puntos. En MIRACL-en la diferencia con mxbai-rerank-xsmall-v1 (0.714 frente a 0.712) es demasiado pequena para considerarla significativa, segun el propio autor.

## Limitaciones y advertencias

- Solo reranking: no produce embeddings ni genera texto; requiere una primera etapa de recuperacion.
- Longitud maxima de entrenamiento de 512 tokens por par consulta-pasaje; entradas mas largas son aceptadas por la arquitectura pero no fueron entrenadas ni probadas, por lo que conviene dividir documentos largos en pasajes.
- Evaluacion limitada a 200 consultas por conjunto y sin test de significancia; diferencias de milesimas no son concluyentes.
- La seleccion de checkpoints y de variantes de entrenamiento se hizo sobre un split de validacion propio, pero tambien considero los conjuntos publicos de evaluacion, lo que puede introducir sesgo optimista.
- Los datos de entrenamiento en ingles incluyen splits de entrenamiento de conjuntos cuyos splits de test forman parte de NanoBEIR (NQ, HotpotQA, FEVER, FiQA), lo que puede inflar los resultados en ese benchmark.
- Riesgo de alucinacion no aplica de forma directa al no generar texto, pero el modelo puede puntuar alto pasajes irrelevantes o contradictorios si comparten vocabulario con la consulta.
- No se documentan sesgos especificos ni evaluaciones de equidad.
- Licencia Apache 2.0: permite uso comercial con atribucion; no se especifican restricciones adicionales.
- La cuantizacion int8 introduce una diferencia maxima de puntuacion de 0,136 respecto a fp32 (Spearman 0.9973, coincidencia top-1 del 100% en la prueba del autor); conviene validar umbrales si se usa int8 en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syntriq/lupe-multilingual-reranker-small
- Modelo base: https://huggingface.co/syntriq/lupe-german-reranker-small
- Dataset MIRACL: https://huggingface.co/datasets/sentence-transformers/miracl
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FinePDFs: https://huggingface.co/datasets/HuggingFaceFW/finepdfs
- Dataset WebFAQ retrieval: https://huggingface.co/datasets/PaDaS-Lab/webfaq-retrieval
- Dataset Ettin reranker: https://huggingface.co/datasets/cross-encoder/ettin-reranker-v1-data
