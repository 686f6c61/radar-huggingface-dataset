# twaggs88/Nemotron-3.5-Embed-8B-pulsar-k4

## Resumen

Nemotron-3.5-Embed-8B-pulsar-k4 es un contenedor de inferencia listo para servir del modelo de embeddings nvidia/Nemotron-3.5-Embed-8B-BF16, publicado por el desarrollador twaggs88. No se trata de un modelo nuevo, sino de una cuantización del trunk de texto del modelo original de NVIDIA a formato EXL3 de 4.0 bits por peso (bpw), empaquetada byte a byte en el contenedor del motor de inferencia pulsar, desarrollado por el mismo autor. El objetivo es ejecutar un embedder de 8B en GPUs de gama media con poca memoria, concretamente en una Quadro RTX 5000 con arquitectura Turing (sm_75) y 16 GB de VRAM.

El modelo base es un transformer de tipo Mistral 3 (la model card cita Ministral-3-8B-Instruct-2512 como ancestro con licencia Apache-2.0), adaptado por NVIDIA para generación de embeddings de recuperación con pooling de media y normalización L2. Esta versión cuantizada conserva los embeddings de tokens y las normas en BF16 tal como los distribuye NVIDIA, y solo cuantiza las capas lineales del decodificador (atención q/k/v/o y MLP gate/up/down). El resultado ocupa 4,5 GB en disco y unos 5,7 GB de VRAM, con vectores de 4096 dimensiones y una ventana de entrada de hasta 16.384 tokens.

Su relevancia actual es práctica: permite desplegar un embedder de 8B en hardware Turing antiguo junto a otros dos modelos del mismo ecosistema (Rerank-8B y Parse) dentro de un único proceso pulsar, consumiendo 12,6 GB de los 16 GB de la tarjeta. Está pensado para pipelines de recuperación densa (RAG) donde la calidad del embedding importa pero el presupuesto de VRAM es limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Mistral 3), adaptado a embeddings con pooling de media y normalización L2 |
| Parametros totales | 4.250.488.832 (según safetensors; el nombre comercial indica 8B, discrepancia no aclarada en la información disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens de entrada por texto |
| Tipos de cuantizacion | EXL3 4.0 bpw en capas lineales del decodificador; embeddings de tokens y normas en BF16 |
| Idiomas soportados | No disponible |
| Licencia | OpenMDW-1.1 (modelo base NVIDIA); el ancestro Ministral-3-8B-Instruct-2512 es Apache-2.0 |
| Formato de pesos | safetensors (contenedor pulsar) |
| Dimension del vector de salida | 4096 floats, longitud unitaria (L2 normalizado) |
| Tamano en disco | 4,5 GB |
| VRAM estimada | ~5,7 GB |
| Modelo base | nvidia/Nemotron-3.5-Embed-8B-BF16 |
| Herramienta de cuantización | exllamav3 1.6.4 (250 × 2048 filas de calibración, codebook `mul1`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder de la familia Mistral 3, reutilizado como modelo de embeddings mediante pooling de media sobre los tokens de entrada y normalización L2 posterior, replicando el comportamiento del modelo original de NVIDIA. Esta versión cuantizada no incluye la torre de visión ni el proyector multimodal del modelo base: es exclusivamente texto. Las capas lineales del decodificador (atención q/k/v/o y MLP gate/up/down) se cuantizaron a EXL3 4.0 bpw con exllamav3 1.6.4 usando 250 filas de calibración de 2048 tokens y el codebook `mul1`, y los pesos resultantes se reempaquetaron byte a byte en el contenedor de pulsar. Los embeddings de tokens y las normas se mantienen en BF16 tal como los distribuye NVIDIA.

No se dispone de información sobre el dataset de entrenamiento original de NVIDIA (número de tokens, composición, uso de RLHF/DPO) en los materiales proporcionados. La model card del autor se limita a documentar el proceso de cuantización y el empaquetado, e incluye un fichero `SHA256SUMS` que cubre todos los ficheros del repositorio. Tampoco se detalla ninguna innovación de decodificación especulativa ni mecanismo de atención lineal; el interés técnico está en el formato de cuantización y en la integración con el motor pulsar, que expone un endpoint compatible con la API de embeddings de OpenAI más el campo `input_type` de NVIDIA NIM.

## Capacidades

- Generación de embeddings de texto para recuperación densa, con vectores de 4096 dimensiones normalizados a longitud unitaria.
- Soporte de roles de entrada mediante `input_type`: `query` para preguntas y `passage` (por defecto) para documentos; el servidor escribe automáticamente el prefijo de rol, por lo que el texto no debe prefijarse manualmente.
- Entrada de hasta 16.384 tokens por texto, con opción `truncate: END` para conservar los primeros 16.384 tokens en lugar de rechazar la petición.
- Salida en formato base64 con floats f32 little-endian mediante `encoding_format: base64`.
- Servicio HTTP compatible con la forma de `POST /v1/embeddings` de OpenAI, ampliada con el campo `input_type` de NVIDIA NIM.
- Capacidad de ejecutarse en paralelo con otros modelos del ecosistema (Rerank-8B y Parse) dentro de un mismo proceso pulsar.
- No incluye capacidades multimodales: la torre de visión y el proyector del modelo base se han excluido explícitamente.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; el modelo es un extractor de características, no un generador de texto.

## Casos de uso

- Recuperación densa en pipelines RAG: el modelo genera embeddings de pasajes y consultas con roles diferenciados (`passage`/`query`), lo que permite indexar documentación corporativa y recuperar los fragmentos más relevantes para cada pregunta del usuario. Es adecuado porque el autor reporta hit@1 de 0,909 y MRR de 0,955 sobre 744 fragmentos de documentos propios.
- Búsqueda semántica en corpus de documentos largos: con 16.384 tokens de entrada por texto, permite indexar secciones enteras o contratos sin trocear agresivamente, reduciendo la pérdida de contexto que introduce el chunking fino.
- Despliegue en hardware Turing antiguo: al ocupar unos 5,7 GB de VRAM, cabe en una Quadro RTX 5000 de 16 GB junto a un reranker y un parser, lo que permite montar una pila completa de recuperación y reordenación en una sola GPU de gama media.
- Deduplicación y clustering de documentos: los embeddings normalizados de 4096 dimensiones sirven para calcular similitud coseno entre documentos y agrupar contenido duplicado o temáticamente próximo en tareas de curación de datos.
- Clasificación y enrutado por similitud: comparar el embedding de una consulta con embeddings de referencia de categorías permite enrutar tickets de soporte o peticiones a la cola adecuada sin entrenar un clasificador adicional.
- Evaluación de calidad de recuperación en entornos con restricciones de memoria: al mantener una fidelidad de coseno de 0,9926 frente al modelo BF16 original y una recuperación top-1 idéntica en la prueba del autor, sirve como sustituto del modelo completo en entornos de staging o en pruebas A/B de pipelines de búsqueda.
- Servicio de embeddings multi-tenant en una sola GPU: el endpoint HTTP compatible con OpenAI permite atender a varias aplicaciones internas desde un único proceso pulsar, compartiendo la tarjeta con los modelos de reranking y parsing.

## Benchmarks y rendimiento

Los datos publicados por el autor miden fidelidad de la cuantización y calidad de recuperación, no benchmarks académicos estándar (MMLU, HumanEval, GSM8K), que no están disponibles.

| Comparación | Peor coseno | Recuperación top-1 |
|---|---|---|
| Mismos pesos EXL3 en f32 sobre CPU (referencia del motor) | 0,99996 | 6 / 6 |
| Modelo BF16 original en f32 (coste de los pesos de 4 bits) | 0,9926 | 6 / 6 |

Medición sobre 31 entradas fijas (consultas y pasajes de 5 a 5.100 tokens).

| Embedder | hit@1 | hit@3 | MRR |
|---|---|---|---|
| Nemotron Embed-8B, fp16 original | 0,864 | 1,000 | 0,932 |
| Nemotron Embed-8B, EXL3 4.0 bpw (este contenedor) | 0,909 | 1,000 | 0,955 |

Medición sobre 22 preguntas y 744 fragmentos de documentos propios, solo recuperación densa. El autor advierte que 22 preguntas es un conjunto pequeño y que las dos filas de Nemotron difieren en una sola pregunta.

Rendimiento de inferencia: aproximadamente 1.100 tokens/s en batch sobre una RTX 5000 limitada a 125 W.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 5,7 GB según el autor.
- GPU validadas: Quadro RTX 5000 (Turing, sm_75). El autor indica que solo lo ha servido en Turing.
- Compilación: `make pulsar-server CUDA_ARCH=sm_75` para Turing, con la rama `dev` de pulsar (cualquier commit desde `5139ba62`).
- Cabe en GPUs de consumo con al menos 6-8 GB de VRAM, aunque no se han publicado pruebas en tarjetas consumer concretas (RTX 3060, 4060, 4090); la única referencia es la Quadro RTX 5000.
- Despliegue: exclusivamente mediante el motor pulsar (`pulsar-server -m /ruta/al/repo --host 0.0.0.0 --port 8400`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput: ~1.100 tokens/s en batch en una RTX 5000 a 125 W. No se publica latencia por petición ni throughput en GPUs más modernas.
- Uso conjunto: el autor ejecuta este contenedor junto a Rerank-8B y Parse en un único proceso pulsar, con 12,6 GB de los 16 GB de la tarjeta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Nemotron-3.5-Embed-8B-pulsar-k4 (este) | 4,25 B (según safetensors) | 16.384 tokens | 4096 | OpenMDW-1.1 | safetensors, motor pulsar |
| nvidia/Nemotron-3.5-Embed-8B-BF16 | 8 B (según nombre comercial) | 16.384 tokens | 4096 | OpenMDW-1.1 | safetensors BF16, ecosistema NVIDIA |
| Ministral-3-8B-Instruct-2512 (ancestro del base) | 8 B | No disponible | No aplica (modelo generativo) | Apache-2.0 | safetensors |
| twaggs88/Nemotron-3.5-Rerank-8B-pulsar-k4 (mismo ecosistema) | No disponible | No disponible | No aplica (reranker) | No disponible | safetensors, motor pulsar |

No se dispone de datos de benchmarks comparativos con otros embedders de la misma categoría (por ejemplo, modelos de 7-8B de otras familias) en la información proporcionada.

## Limitaciones y advertencias

- Solo texto: la torre de visión y el proyector multimodal del modelo base no están incluidos.
- Solo se ha validado en GPUs Turing (sm_75); el comportamiento en arquitecturas Ampere, Ada o Hopper no está documentado y requiere compilar pulsar con el `CUDA_ARCH` correspondiente.
- El motor pulsar es un proyecto del propio autor, con un único mantenedor y una rama `dev` como referencia; no hay garantías de soporte a largo plazo ni de compatibilidad con versiones futuras.
- La cuantización introduce una pérdida de fidelidad medible: el peor coseno frente al modelo BF16 original es 0,9926, no 1,0. Aunque la recuperación top-1 se mantiene en la prueba del autor, en dominios muy sensibles puede haber degradación.
- La evaluación de calidad se apoya en 22 preguntas y 744 fragmentos de un corpus privado; es una muestra pequeña y no reproducible externamente.
- Existe una discrepancia entre el nombre comercial (8B) y el recuento real de parámetros de safetensors (4,25 B) que la información disponible no aclara; conviene verificar el inventario de pesos antes de dimensionar el despliegue.
- No se documentan los idiomas soportados; se desconoce el comportamiento en castellano y en lenguas distintas del inglés.
- Riesgo de alucinación: no aplica directamente, ya que el modelo no genera texto, pero los embeddings pueden producir recuperaciones espurias en consultas ambiguas o fuera de dominio.
- Licencia OpenMDW-1.1: es una licencia de pesos abiertos de NVIDIA con condiciones propias; debe revisarse antes de uso comercial. El componente heredado de Ministral es Apache-2.0, y el fichero `NOTICE` detalla los cambios realizados.
- El texto no debe prefijarse manualmente con el rol (`query`/`passage`): el servidor lo añade, y hacerlo de forma manual degradaría la calidad de forma silenciosa.
- No hay endpoint de generación de texto ni soporte de tool calling; usarlo como si fuera un LLM es un error de uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/twaggs88/Nemotron-3.5-Embed-8B-pulsar-k4
- Modelo base en Hugging Face: https://huggingface.co/nvidia/Nemotron-3.5-Embed-8B-BF16
- Motor de inferencia pulsar: https://github.com/tylerwagler/pulsar
- Contenedor relacionado (reranker): https://huggingface.co/twaggs88/Nemotron-3.5-Rerank-8B-pulsar-k4
- Contenedor relacionado (parser): https://huggingface.co/twaggs88/Nemotron-3.5-Parse-pulsar-f16
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Ancestro del modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
