# TahaRauf/granite-embedding-reranker-english-r2-onnx-fp16

## Resumen

Este repositorio contiene una conversión a ONNX en precisión fp16 del modelo de reranking de IBM `ibm-granite/granite-embedding-reranker-english-r2`, un cross-encoder basado en ModernBERT con 149,6 millones de parámetros y licencia Apache 2.0. El modelo original resuelve la segunda fase del pipeline de recuperación de información: dado un par (consulta, pasaje), devuelve una puntuación de relevancia que permite reordenar los candidatos devueltos por un retriever de primera fase. La conversión la ha publicado el usuario TahaRauf y está pensada para su ejecución con ONNX Runtime en lugar de PyTorch.

El valor práctico de esta ficha es el formato: el modelo original se distribuye en pesos PyTorch (safetensors), mientras que aquí se ofrece un grafo ONNX único de 299.879.022 bytes con entradas y salidas en fp32 (`keep_io_types`) y pesos internos en fp16. Eso permite desplegar el reranker sin dependencias de PyTorch, en entornos donde ya existe ONNX Runtime, incluidos servicios en C++, C# o navegador, y con un consumo de memoria sustancialmente menor que el grafo fp32 equivalente.

Es relevante ahora porque IBM publicó la familia Granite Embedding R2 junto con el artículo arXiv:2508.21085, y el paso a formatos de inferencia ligeros es lo que determina si un reranker de 149,6 M de parámetros es viable en producción con presupuesto de latencia ajustado. No obstante, conviene señalar que este repositorio es una redistribución modificada, no afiliada ni respaldada por IBM, y que no incluye datos propios de evaluación de calidad de recuperación: solo mide la paridad numérica frente a la exportación fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en ModernBERT (transformer encoder bidireccional) |
| Parametros totales | 149,6 M (según la model card de la conversión) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | fp16 (esta conversión); el pipeline de conversión parte de un grafo ONNX fp32 exportado desde los pesos PyTorch |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`model_fp16.onnx`), tokenizador en `tokenizer.json` |
| Tamano del repositorio | 0,3 GB |
| Entradas del grafo | `input_ids` (int64, `[batch_size, sequence_length]`), `attention_mask` (int64, `[batch_size, sequence_length]`) |
| Salidas del grafo | `logits` (float32, `[batch_size, 1]`) |
| Pipeline declarado | text-ranking |
| Modelo base | ibm-granite/granite-embedding-reranker-english-r2 |
| Libreria | onnx |

## Arquitectura y entrenamiento

La arquitectura subyacente es ModernBERT en configuración cross-encoder: la consulta y el pasaje se tokenizan conjuntamente como una única secuencia y el modelo emite un logit escalar por par, que se interpreta como puntuación de relevancia (aplicando una sigmoide se obtiene un valor entre 0 y 1). A diferencia de un bi-encoder, no se generan embeddings reutilizables: cada par requiere una pasada completa, lo que da más precisión pero impide precalcular representaciones de los documentos. El autor de la conversión indica que el modelo tiene 149,6 M de parámetros.

Sobre el entrenamiento no hay información en los materiales proporcionados: no se detallan el número de tokens, la composición del dataset, ni si hubo etapas de ajuste con preferencias (RLHF/DPO) o destilación. Esos datos corresponden a la model card de IBM y al artículo arXiv:2508.21085, que son la referencia autorizada. Lo que sí documenta este repositorio es el procedimiento de conversión: los pesos PyTorch de IBM se exportaron a un grafo ONNX fp32 y después se convirtieron a fp16 con el conversor `float16` de ONNX Runtime, manteniendo entradas y salidas en fp32 mediante `keep_io_types`. No se reentrenó ni se ajustó ningún peso, y el `tokenizer.json` es el archivo de IBM sin modificar byte a byte.

## Capacidades

- Puntuación de relevancia por par (consulta, pasaje): devuelve un logit por fila del lote, convertible a probabilidad con una sigmoide.
- Reranking en pipelines de recuperación: reordena los N candidatos devueltos por un retriever de primera fase (BM25, búsqueda vectorial, híbrida).
- Procesamiento por lotes: la interfaz del grafo admite `batch_size` y `sequence_length` dinámicos en forma `[batch_size, sequence_length]`.
- Ejecución sin PyTorch: al ser un grafo ONNX, se puede servir con ONNX Runtime en Python, C++, C#, Java o JavaScript.
- Integración con el ecosistema de Hugging Face: el tokenizador incluido es el oficial de IBM, por lo que la tokenización es idéntica a la del modelo original.
- No genera texto: es un modelo de ranking, no un modelo generativo ni de chat.
- Sin soporte de tool calling, function calling ni razonamiento multi-paso: no aplica a su tarea.
- Monolingüe: entrenado y evaluado para inglés (`language: en`).
- No dispone de modo de pensamiento (thinking mode) ni capacidades de visión o audio.

## Casos de uso

- Reranking en un RAG de documentación técnica en inglés: se recuperan 50-100 fragmentos con un índice vectorial y se reordenan con este cross-encoder antes de construir el prompt; al ser un modelo de 149,6 M de parámetros, el coste por par es bajo y se puede aplicar a toda la lista de candidatos, no solo al top-10.
- Búsqueda semántica en bases de conocimiento internas: el reranker corrige los falsos positivos típicos de la similitud coseno entre embeddings, especialmente cuando la consulta contiene negaciones o matices que un bi-encoder no distingue.
- Moderación y deduplicación de contenido: puntuar la similitud entre un texto de referencia y una lista de candidatos para agrupar duplicados o detectar respuestas repetidas dentro de un corpus en inglés.
- Preordenación en motores de búsqueda de comercio electrónico: dado un catálogo en inglés, reordenar los resultados de un retriever léxico según la intención real de la consulta, con control del coste mediante lotes y truncado de longitud.
- Evaluación de sistemas de recuperación: usar las puntuaciones como señal automática para comparar configuraciones de chunking, modelos de embeddings o parámetros de búsqueda en un conjunto de validación.
- Filtrado previo en pipelines de anotación o curación de datasets: descartar pares (consulta, documento) poco relevantes antes de enviarlos a un modelo mayor y más caro, reduciendo el coste por muestra procesada.
- Servicio de inferencia embebido en aplicaciones de escritorio o edge: al estar en ONNX fp16 con 299,9 MB de pesos y sin dependencia de PyTorch, se puede empaquetar dentro de una aplicación local con ONNX Runtime y ejecutar en CPU.
- Componente de un pipeline de CI/CD de calidad de datos: verificar de forma automática que los pares pregunta-respuesta de un dataset en inglés superan un umbral de relevancia antes de publicarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio solo documenta la paridad numérica de esta conversión fp16 frente a la exportación fp32, medida el 22 de septiembre de 2026 sobre 200 pares consulta-pasaje agrupados en 20 grupos:

| Medida | Valor |
|---|---|
| Diferencia absoluta máxima de logits | 0,011 |
| Correlación de rangos de Spearman | 0,99994 |
| Desacuerdos en top-1 | 0 de 20 grupos |
| Inversiones de orden por pares | 2 de 900 |

Estas cifras describen la fidelidad de la conversión, no la calidad de recuperación. Para métricas de calidad del modelo (por ejemplo, sobre tareas de ranking o recuperación) hay que consultar la model card y el artículo de IBM, que no forman parte de la información proporcionada.

## Requisitos de hardware

- Tamaño de los pesos: 299.879.022 bytes (unos 300 MB) para `model_fp16.onnx`, más 3.583.486 bytes del tokenizador. El repositorio completo ocupa 0,3 GB.
- VRAM estimada: del orden de 0,6-1,5 GB en fp16 contando pesos y activaciones, en función del tamaño de lote y de la longitud de secuencia. Es una estimación a partir del recuento de parámetros y del tamaño del archivo, no una medición publicada.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en iGPU y en CPU. El cuello de botella real será el throughput, no la memoria.
- GPU de centro de datos (A100, H100, L40S) solo tienen sentido para servir muchas peticiones concurrentes o lotes grandes; para el modelo en sí están sobredimensionadas.
- Despliegue: ONNX Runtime (Python, C++, C#, Java, JavaScript), Hugging Face Optimum para exportación e integración, servidores de inferencia compatibles con grafos ONNX (por ejemplo, Triton Inference Server) y envoltorios HTTP propios sobre `onnxruntime.InferenceSession`.
- Latencia y throughput: no disponible. No hay cifras publicadas en la información proporcionada; habría que medirlas por hardware, tamaño de lote y longitud de secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (granite-embedding-reranker-english-r2 ONNX fp16) | 149,6 M | no disponible | apache-2.0 | ONNX fp16 | Cross-encoder ModernBERT, solo inglés; conversión de terceros |
| ibm-granite/granite-embedding-reranker-english-r2 (original) | 149,6 M | no disponible | apache-2.0 | safetensors (PyTorch) | Mismo modelo en formato original, mantenido por IBM |
| Rerankers cross-encoder multilingües de la familia BGE (por ejemplo, bge-reranker-v2-m3) | no disponible | no disponible | no disponible | safetensors | Referencia habitual en pipelines RAG; datos no verificados en la información proporcionada |
| Rerankers ligeros tipo MiniLM o mxbai-rerank | no disponible | no disponible | no disponible | safetensors, ONNX | Alternativas de menor tamaño y menor coste; datos no verificados en la información proporcionada |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada, por lo que no se puede establecer una jerarquía de calidad. La comparación relevante y verificable aquí es de formato y licencia: mismo modelo que el original de IBM, con licencia Apache 2.0 en ambos casos, pero distribuido como grafo ONNX fp16 en lugar de pesos PyTorch.

## Limitaciones y advertencias

- Modelo monolingüe en inglés (`language: en`); no se debe esperar un rendimiento fiable en castellano ni en otros idiomas.
- No es un modelo generativo: no produce texto ni respuestas, solo puntuaciones de relevancia. El riesgo de alucinación en el sentido habitual no aplica, pero sí el de puntuaciones mal calibradas si se usa fuera del dominio previsto.
- La longitud máxima de contexto no se especifica en la información proporcionada; hay que consultar la model card de IBM antes de fijar el truncado en producción.
- La cuantización a fp16 introduce un error pequeño pero medible: hasta 0,011 de diferencia absoluta en los logits y 2 inversiones de orden sobre 900 pares en la prueba de paridad. En listas muy ajustadas puede alterar el orden de candidatos casi empatados.
- Se trata de una redistribución modificada de un modelo de IBM, no afiliada ni respaldada por IBM. La atribución y la licencia Apache 2.0 se mantienen, y el repositorio no incluye archivo NOTICE.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos de copyright y licencia y de indicar los cambios. Aun así, conviene revisar los términos de la model card original por si IBM añade condiciones de uso aceptable adicionales.
- Al ser una conversión, la responsabilidad de validar la calidad en el dominio concreto recae en quien la despliega; el repositorio solo aporta la paridad numérica, no una evaluación de recuperación.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria amplia sobre su funcionamiento en producción.
- Conviene verificar la integridad de la descarga antes de usarla: `sha256sum model_fp16.onnx` debe devolver `b1a75200046b797987d16c96bb14c8959f4a4ec7c21ceb5e0d00227c84178695`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TahaRauf/granite-embedding-reranker-english-r2-onnx-fp16
- Modelo base de IBM: https://huggingface.co/ibm-granite/granite-embedding-reranker-english-r2
- Artículo de referencia: https://arxiv.org/abs/2508.21085
- Texto de la licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
