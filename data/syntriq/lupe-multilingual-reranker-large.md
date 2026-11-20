# syntriq/lupe-multilingual-reranker-large

## Resumen

Lupe Multilingual Reranker Large es un cross-encoder multilingue de 568 millones de parametros disenado especificamente para la segunda fase de recuperacion en pipelines de busqueda y RAG: reordenar por relevancia un conjunto de pasajes candidatos previamente recuperados. Lo desarrolla syntriq y parte de `BAAI/bge-reranker-v2-m3`, sobre el que se ha aplicado un entrenamiento adicional mediante destilacion desde un reranker abierto de mayor tamano, segun indica el autor. Emplea una arquitectura XLM-RoBERTa adaptada a ranking de pares consulta-pasaje, con salida de una unica puntuacion de relevancia entre 0 y 1.

El modelo cubre 35 idiomas (entre ellos espanol, aleman, ingles, arabe, chino, japones, hindi y swahili) y esta pensado para sustituir directamente a `bge-reranker-v2-m3` en arquitecturas de recuperacion en dos etapas. Su relevancia practica radica en que mejora al modelo base en todos los conjuntos evaluados por el autor y lidera la media de MIRACL entre los modelos comparados, manteniendo el mismo coste computacional que el original (568M parametros, contexto de 512 tokens por par).

La publicacion incluye exportaciones ONNX en fp32 e int8 (cuantizacion dinamica AVX-512 VNNI) para inferencia en CPU, con verificacion de equivalencia frente a PyTorch. La licencia es Apache 2.0 y los pesos estan en safetensors y ONNX. El modelo no genera texto ni embeddings: solo puntua pares consulta-pasaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa (transformer encoder) |
| Parametros totales | 567.755.777 (568M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens por par consulta+pasaje (entrada maxima de entrenamiento; entradas mas largas se aceptan pero se truncan) |
| Tipos de cuantizacion | ONNX fp32, ONNX int8 (cuantizacion dinamica, optimizada para AVX-512 VNNI); pesos PyTorch fp32 |
| Idiomas soportados | 35: ar, bg, bn, ca, cs, da, de, el, en, es, fa, fi, fr, he, hi, hu, id, it, ja, ko, nl, no, pl, pt, ro, ru, sk, sv, sw, te, th, tr, uk, vi, yo, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8) |
| Modelo base | BAAI/bge-reranker-v2-m3 |
| Libreria | sentence-transformers (CrossEncoder) |
| Tamano del repositorio | 5,1 GB |
| Pipeline | text-ranking |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: recibe concatenados la consulta y un pasaje y produce una puntuacion escalar de relevancia mediante la cabeza de clasificacion del encoder XLM-RoBERTa. A diferencia de los bi-encoders, no genera embeddings reutilizables, por lo que su uso esta restringido a la fase de reordenacion sobre candidatos ya recuperados. La longitud maxima de entrada durante el entrenamiento fue de 512 tokens para la suma de consulta y pasaje.

El entrenamiento parte de `BAAI/bge-reranker-v2-m3` y se continua mediante destilacion desde un reranker abierto de mayor tamano, segun la model card, sin emplear datos personales reales. Los datos declarados incluyen `sentence-transformers/miracl`, `wikimedia/wikipedia`, `HuggingFaceFW/fineweb-2`, `HuggingFaceFW/finepdfs`, `PaDaS-Lab/webfaq-retrieval` y `cross-encoder/ettin-reranker-v1-data`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO (no aplicables de forma habitual en cross-encoders de ranking). La model card advierte que los datos de entrenamiento en ingles incluyen splits de entrenamiento de datasets cuyos splits de test forman parte de NanoBEIR (NQ, HotpotQA, FEVER, FiQA), lo que introduce una caveat de contaminacion en esa evaluacion concreta.

Como innovacion destacable, el repositorio incluye exportaciones ONNX verificadas: el autor reporta una diferencia absoluta maxima de puntuacion de 5,7e-06 (Spearman 1.0000, 100% de acuerdo en top-1) para ONNX fp32 y de 0,117 (Spearman 0.9947, 100% de acuerdo en top-1) para ONNX int8, sobre 100 pares consulta-pasaje (50 en aleman, 50 en ingles) y 20 listas de ranking de 16 pasajes.

## Capacidades

- Reordenacion de pasajes por relevancia en 35 idiomas, con salida de puntuacion continua entre 0 y 1.
- Evaluacion de pares consulta-pasaje en una sola pasada (cross-encoder), adecuada como segunda etapa tras recuperacion con embeddings o BM25.
- Rendimiento destacado en aleman e ingles segun la evaluacion del autor, y cobertura multilingue amplia (incluye arabe, bengali, telugu, tailandes, yoruba, etc.).
- Inferencia en CPU mediante ONNX fp32 e int8, con equivalencia verificada frente a PyTorch.
- Compatibilidad con `sentence-transformers` (`CrossEncoder`), con `text-embeddings-inference` y con endpoints compatibles, segun los tags del repositorio.
- No soporta generacion de texto, tool calling, razonamiento multi-paso ni agentes: es exclusivamente un modelo de ranking.
- No produce embeddings; no puede usarse como modelo de recuperacion de primera etapa.

## Casos de uso

- RAG sobre documentacion corporativa multilingue: recuperar entre 50 y 200 candidatos con un bi-encoder o BM25 y reordenarlos con este modelo antes de pasarlos al LLM generador; su cobertura de 35 idiomas permite un unico reranker para corpus en varios idiomas.
- Busqueda empresarial en aleman e ingles: el modelo lidera MIRACL-de (0,794) y MIRACL-en (0,767) en la evaluacion del autor, lo que lo hace adecuado para motores de busqueda interna en organizaciones con documentacion en ambos idiomas.
- Atencion al cliente con base de conocimiento: reordenar respuestas candidatas de una FAQ o base de articulos (`PaDaS-Lab/webfaq-retrieval` figura entre los datasets de entrenamiento) antes de componer la respuesta final.
- Despliegue en CPU sin GPU: las exportaciones ONNX int8 permiten servir el reranker en infraestructura CPU; el autor reporta 4,3 pares por segundo en un Apple M5 con batch 32 y 512 tokens por par, con la advertencia de que en esa CPU ARM ONNX no supera a PyTorch.
- Filtrado de resultados en buscadores academicos o de noticias: reordenar los primeros 100 resultados de un motor léxico para mejorar la precision en la primera pagina.
- Pipelines de compliance y e-discovery multilingue: priorizar documentos relevantes en 35 idiomas antes de la revision humana, con licencia Apache 2.0 que facilita el uso comercial.
- Sustitucion directa de `bge-reranker-v2-m3`: misma huella de parametros (568M) y misma interfaz de `CrossEncoder`, por lo que la migracion no requiere cambios de infraestructura.

## Benchmarks y rendimiento

nDCG@10, hasta 200 consultas por conjunto, mismo arnes de evaluacion para todos los modelos (segun la model card):

| Modelo | MIRACL media (18 idiomas) | MIRACL-de | MIRACL-en | NanoBEIR | GermanQuAD | GermanDPR | Parametros |
|---|---|---|---|---|---|---|---|
| syntriq/lupe-multilingual-reranker-large | 0.829 | 0.794 | 0.767 | 0.712 | 0.990 | 0.868 | 568M |
| BAAI/bge-reranker-v2-m3 | 0.821 | 0.774 | 0.748 | 0.694 | 0.989 | 0.863 | 568M |
| Qwen/Qwen3-Reranker-0.6B | 0.790 | 0.766 | 0.709 | no medido | 0.990 | 0.852 | 596M |
| mixedbread-ai/mxbai-rerank-large-v2 | no medido | 0.702 | 0.730 | 0.731 | 0.990 | 0.876 | 1,54B |

Notas de la model card: los valores de MIRACL-de y MIRACL-en de mxbai-rerank-large-v2 provienen del log de la misma ejecucion; su media MIRACL no se midio porque hindi no termino. En los conjuntos completos de MIRACL dev, el autor solo reporta `bge-reranker-v2-m3` como referencia (MIRACL-de 0,780 con 221 consultas; MIRACL-en 0,748 con 705 consultas); este modelo no se ejecuto sobre los conjuntos completos. El autor advierte que con 200 consultas por conjunto y sin test de significacion, diferencias de pocas milesimas no son concluyentes, y que la seleccion de checkpoints y variantes se hizo teniendo en cuenta estos conjuntos publicos.

Rendimiento de inferencia en CPU (Apple M5, batch 32, 512 tokens por par):

| Backend | Pares por segundo |
|---|---|
| PyTorch fp32 | 4,3 |
| ONNX fp32 | 3,2 |
| ONNX int8 | 4,3 |

El autor no midio la velocidad de ONNX int8 en CPUs x86 con AVX-512 VNNI, para las que esta optimizado el fichero cuantizado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 2,3 GB solo para pesos (568M parametros), mas activaciones; con batch pequeno y 512 tokens por par, un presupuesto de 4-6 GB de VRAM es realista.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp32 con batches moderados (RTX 3060/4060, RTX 4090, A100, H100). El modelo es pequeno para su categoria y no requiere GPUs de datacenter.
- Cabe en GPU de consumo: si, en tarjetas desde 8 GB; con cuantizacion int8 el peso baja a aproximadamente 0,6 GB y puede ejecutarse en CPU.
- Opciones de despliegue: `sentence-transformers` (`CrossEncoder`), ONNX Runtime (CPU, `CPUExecutionProvider`), `text-embeddings-inference` y endpoints compatibles segun los tags del repositorio. No se mencionan integraciones especificas con vLLM, llama.cpp u Ollama en la informacion disponible (son motores orientados a modelos generativos, no a cross-encoders).
- Throughput medido: 4,3 pares por segundo en PyTorch fp32 y en ONNX int8 sobre Apple M5 (batch 32, 512 tokens por par); 3,2 pares por segundo en ONNX fp32. No hay datos de latencia o throughput en GPU en la informacion disponible.

## Comparativa con modelos similares

| Criterio | lupe-multilingual-reranker-large | bge-reranker-v2-m3 | Qwen3-Reranker-0.6B | mxbai-rerank-large-v2 |
|---|---|---|---|---|
| Parametros | 568M | 568M | 596M | 1,54B |
| Contexto por par | 512 tokens | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |
| MIRACL media | 0.829 | 0.821 | 0.790 | no medido |
| MIRACL-de | 0.794 | 0.774 | 0.766 | 0.702 |
| MIRACL-en | 0.767 | 0.748 | 0.709 | 0.730 |
| NanoBEIR | 0.712 | 0.694 | no medido | 0.731 |
| GermanDPR | 0.868 | 0.863 | 0.852 | 0.876 |
| Licencia | Apache 2.0 | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |
| Exportacion ONNX | si (fp32 e int8) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

El modelo supera a su base en todos los conjuntos medidos y queda por delante de Qwen3-Reranker-0.6B en MIRACL y GermanDPR. Frente a mxbai-rerank-large-v2, casi tres veces mayor, pierde en NanoBEIR (0,712 frente a 0,731) y GermanDPR (0,868 frente a 0,876), empata en GermanQuAD (0,990) y gana en MIRACL-de y MIRACL-en. La comparacion con mxbai en MIRACL esta incompleta porque su media no se midio.

## Limitaciones y advertencias

- Solo reordena: no genera embeddings ni texto; requiere un recuperador de primera etapa (bi-encoder o BM25) que aporte entre 50 y 200 candidatos.
- Entrada maxima de 512 tokens para consulta mas pasaje; entradas mas largas se aceptan pero se truncan, lo que puede degradar la puntuacion en pasajes largos.
- Evaluacion con hasta 200 consultas por conjunto y sin test de significacion: las diferencias de pocas milesimas frente a `bge-reranker-v2-m3` no deben interpretarse como mejoras robustas.
- Contaminacion potencial en NanoBEIR: los datos de entrenamiento en ingles incluyen splits de entrenamiento de datasets cuyos splits de test forman parte de NanoBEIR (NQ, HotpotQA, FEVER, FiQA).
- Seleccion de checkpoints y variantes realizada con conocimiento de los conjuntos publicos de evaluacion, lo que puede inflar ligeramente los resultados reportados.
- El modelo no se ejecuto sobre los conjuntos completos de MIRACL dev; la comparacion con la referencia completa solo esta disponible para `bge-reranker-v2-m3`.
- Riesgo de sesgo linguistico: el rendimiento se ha validado de forma mas exhaustiva en aleman e ingles; para los 33 idiomas restantes no se aportan resultados por idioma en la informacion disponible.
- Riesgo de alucinacion no aplicable en sentido estricto (no genera texto), pero si de puntuaciones erroneas en dominios alejados de los datos de entrenamiento (web, FAQ, Wikipedia, MIRACL).
- La velocidad de ONNX int8 solo se midio en CPU ARM; en x86 con AVX-512 VNNI el autor no aporta cifras.
- Licencia Apache 2.0: permite uso comercial y modificacion, con las obligaciones habituales de atribucion y aviso de licencia.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad sobre los resultados declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syntriq/lupe-multilingual-reranker-large
- Modelo base: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Dataset MIRACL: https://huggingface.co/datasets/sentence-transformers/miracl
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FinePDFs: https://huggingface.co/datasets/HuggingFaceFW/finepdfs
- Dataset WebFAQ retrieval: https://huggingface.co/datasets/PaDaS-Lab/webfaq-retrieval
- Dataset Ettin reranker v1: https://huggingface.co/datasets/cross-encoder/ettin-reranker-v1-data
- Modelo comparable Qwen3-Reranker-0.6B: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Modelo comparable mxbai-rerank-large-v2: https://huggingface.co/mixedbread-ai/mxbai-rerank-large-v2
- Paper de referencia de MIRACL: https://arxiv.org/abs/2210.09984
- Documentacion de sentence-transformers CrossEncoder: https://www.sbert.net/docs/pretrained_cross-encoders.html
