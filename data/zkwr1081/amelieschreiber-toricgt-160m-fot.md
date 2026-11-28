# zkwr1081/AmelieSchreiber-ToricGT-160M-FoT

## Resumen

ToricGT 160M FoT es un checkpoint de investigación publicado por el usuario zkwr1081 bajo la colección ToricGT de Amelie Schreiber. Se trata de una adaptación escalada en anchura (muP) del modelo base `openai/parameter-golf`, orientada a un objetivo de bits-per-byte (BPB) sobre FineWeb, pero con una capa adicional de estructura gráfica: tokenización ConvexTok-8192, tokenización de grafos estilo TokenGT, aplanado de salidas de grafo para puntuación BPB y razonamiento en espacio de embeddings con Forest-of-Thought y objetivos tipo GFlowNet.

El modelo no es un transformer convencional utilizable con `transformers`: requiere el codebase ToricGT (rama `toricblm`) para cargar los pesos y evaluar. Su interés es fundamentalmente de investigación: combina regularizadores matemáticos (atención tropical, embeddings tóricos, certificados BGG de categoría O, métricas de persistencia/Koszul, disentanglement GraphCG) con un flujo de datos biomédico y de grafos curados.

Con unos 169,7 M de parámetros generados, 9 capas, 12 cabezas de atención (6 KV) y longitud de secuencia 1024, es un modelo pequeño pensado para experimentación en razonamiento estructurado y auditoría matemática, no para producción general. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer adaptado (Parameter Golf) con tokenización de grafos TokenGT, atención tropical y regularizadores tóricos |
| Parametros totales | 169.698.927 (objetivo generado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens de secuencia |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints `.pt` (PyTorch), no safetensors ni GGUF |

Otros datos de la model card: run id `toricblm-mup-codex8192-biomed-full-<timestamp>`, transferencia muP base 512 / delta 768 / target 1536 con multiplicador de anchura 3.0, 9 capas, 12 cabezas / 6 KV, batch efectivo inicial de 196.608 tokens, tokenizador ConvexTok-8192 determinista (sin BPE), reserva biomédica/control de 512 tokens.

## Arquitectura y entrenamiento

La arquitectura parte del baseline OpenAI Parameter Golf y se escala en anchura mediante muP (base 512, delta 768, objetivo 1536, multiplicador 3.0). Sobre esa base se añaden cinco capas de estructura: (1) objetivo BPB sobre FineWeb como señal principal de puntuación; (2) tokenización ConvexTok representada como DAG de fronteras de bytes, con vocabulario fresco de 8192 y reserva biomédica/control; (3) entrada/salida de grafos estilo TokenGT con tokens de nodo, tokens de arista, estructura de extremos, buckets posicionales y características de fase tórica; (4) razonamiento en espacio de embeddings con Forest-of-Thought, recompensas GFlowNet, memoria de trayectorias y cabezas de recuperación analógica; y (5) auditorías matemáticas y regularizadores de bajo peso (atención tropical, embeddings tóricos, sondas de conos/vectores, certificados BGG categoría O, métricas Koszul/persistencia, álgebra conmutativa combinatoria, firmas derivadas y disentanglement GraphCG).

Los datos combinan shards ConvexTok-8192 exportados de FineWeb para el objetivo BPB, el split de entrenamiento completo de `AmelieSchreiber/toricgt-curated-splits` (4.633.582 filas, 117 shards Parquet) como flujo de grafos, y `AmelieSchreiber/codex5.5_ToT` (3.890 filas fuente materializadas en tres pasadas) como flujo tardío de árbol/bosque de pensamiento. A partir del paso 17.500 la mezcla tardía es 85% codex5.5_ToT / FoT. La validación se realiza sobre el flujo BPB de FineWeb. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto con objetivo BPB sobre dominio FineWeb.
- Procesamiento de entrada y salida en formato de grafo (TokenGT), incluyendo aplanado de salidas de grafo para puntuación.
- Razonamiento estructurado en espacio de embeddings con Forest-of-Thought y trayectorias ramificadas.
- Objetivos de exploración tipo GFlowNet y recuperación de memoria de trayectorias.
- Cabezas de recuperación analógica.
- Capacidades biomédicas potenciales por la reserva de tokens UniProt, PDB/AFDB/ESMFold, grafos moleculares, trayectorias atomísticas y estados celulares (declaradas como reserva, no como capacidad validada).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en tokenización alternativa: evaluar ConvexTok-8192 frente a BPE en tareas de modelado de lenguaje con métrica BPB, usando el checkpoint como referencia reproducible.
- Modelado de grafos biomédicos: experimentar con la reserva de tokens para proteínas, estructuras PDB/AFDB y grafos moleculares en tareas de representación, siempre con validación adicional.
- Estudio de razonamiento estructurado: analizar el comportamiento de Forest-of-Thought y objetivos GFlowNet en un modelo pequeño controlado (169 M de parámetros) para aislar efectos de la capa de estructura.
- Auditoría matemática de representaciones: usar los regularizadores tóricos, tropicales y de persistencia como banco de pruebas para métricas de interpretabilidad.
- Reproducción de experimentos muP: validar transferencia de anchura (base 512 → 1536) en un pipeline concreto con objetivo BPB.
- Benchmarking de tokenización de grafos: comparar TokenGT con alternativas en el mismo flujo de datos curados (`toricgt-curated-splits`).
- Docencia y experimentación con presupuesto de cómputo bajo: al ser un modelo de 169 M y contexto 1024, permite iterar en una sola GPU consumer para estudiar técnicas de estructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el objetivo BPB y la validación sobre FineWeb, pero no incluye cifras numéricas de MMLU, HumanEval, GSM8K ni BPB final.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Para 169,7 M de parámetros, una estimación orientativa en fp32 sería de ~0,7 GB de pesos, y en fp16/bf16 de ~0,35 GB; a ello hay que sumar activaciones y el codebase ToricGT, por lo que se recomienda al menos 8-16 GB para trabajar con holgura.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con ≥8 GB (RTX 3060/4060, RTX 4090, A100, H100) debería poder cargar el modelo; la limitación real es el codebase, no el tamaño.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB o superiores, aunque no está verificado por el autor.
- Opciones de despliegue: no es compatible con `transformers`, vLLM, llama.cpp, Ollama ni TGI de forma estándar. Requiere el repositorio ToricGT (rama `toricblm`) y el baseline Parameter Golf, con `PYTHONPATH=src:external/mup:amelie-iska/parameter-golf` y el script `scripts/evaluate_oai_competition_bpb.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ToricGT 160M FoT (este) | 169,7 M | 1024 | Transformer + TokenGT + FoT/GFlowNet + regularizadores tóricos | Apache 2.0 | Checkpoint `.pt` vía codebase ToricGT |
| openai/parameter-golf | no disponible | no disponible | Baseline OpenAI de referencia | no disponible | Repositorio OpenAI |
| GPT-2 small (referencia de tamaña similar) | 124 M | 1024 | Transformer decoder estándar | MIT (pesos) | `transformers`, ampliamente soportado |
| Modelos TokenGT de referencia | variable | variable | Graph transformer | variable | Repositorios de investigación |

La comparación directa con GPT-2 small es pertinente por tamaño y contexto, pero ToricGT añade capas de estructura que lo alejan del uso estándar. No se dispone de cifras de rendimiento comparables publicadas.

## Limitaciones y advertencias

- No es un modelo estándar de `transformers`: requiere el codebase ToricGT y el baseline Parameter Golf; no se puede cargar con `AutoModelForCausalLM`.
- Contexto limitado a 1024 tokens, insuficiente para muchas tareas de producción con documentos largos.
- Idiomas soportados no declarados; no hay garantía de calidad multilingüe.
- Riesgo de alucinación no evaluado; no hay benchmarks publicados.
- Sesgos desconocidos: no se documenta composición demográfica ni evaluación de sesgos.
- Capacidades biomédicas declaradas como reserva de tokens, no como funcionalidad validada; no usar en contextos clínicos sin validación externa.
- Los regularizadores matemáticos son de bajo peso y su efecto real sobre la calidad no está cuantificado en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la falta de benchmarks y de soporte estándar desaconseja su uso en producción sin evaluación propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin señales de adopción comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/zkwr1081/AmelieSchreiber-ToricGT-160M-FoT
- Página del proyecto: https://amelie-iska.github.io/ToricGT/
- Repositorio GitHub (rama toricblm): https://github.com/amelie-iska/ToricGT/tree/toricblm
- Colección Hugging Face ToricGT: https://huggingface.co/collections/AmelieSchreiber/toricgt
- Blog ToricBLM: https://huggingface.co/blog/AmelieSchreiber/toricblm
- Dataset de grafos curados: https://huggingface.co/datasets/AmelieSchreiber/toricgt-curated-splits
- Dataset codex5.5_ToT: https://huggingface.co/datasets/AmelieSchreiber/codex5.5_ToT
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Modelo base: https://huggingface.co/openai/parameter-golf
