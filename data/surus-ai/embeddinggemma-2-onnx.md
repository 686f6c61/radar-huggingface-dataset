# surus-ai/embeddinggemma-2-onnx

## Resumen

EmbeddingGemma-2 ONNX (INT8) es una exportación preconvertida del modelo de embeddings de texto `google/embeddinggemma-2`, publicada por el usuario `surus-ai`. El objetivo es ofrecer inferencia en CPU sin depender de PyTorch ni de la librería sentence-transformers, usando únicamente `onnxruntime`, `tokenizers` y `numpy`. El modelo produce embeddings de 768 dimensiones y está pensado para tareas de recuperación semántica, búsqueda y similitud entre textos.

La relevancia de esta ficha radica en que elimina la fricción de despliegue: el repositorio incluye un único fichero ONNX de 261 MB cuantizado dinámicamente a INT8 y un tokenizer rápido de 31 MB, con una ventana de truncado de hasta 8192 tokens según el ejemplo de uso del autor. Según la model card, la similitud coseno entre la salida FP32 original y la INT8 se mantiene en 0,990-0,995, el ranking de búsqueda top-5 es idéntico y la latencia en CPU de 4 núcleos baja de 68 ms (torch) a 24 ms por consulta.

No se dispone de información sobre el número de parámetros, la arquitectura interna, los idiomas soportados ni los datos de entrenamiento del modelo base en la información proporcionada; esta ficha se limita a lo declarado por el autor de la exportación y a los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `google/embeddinggemma-2`, encoder de texto) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | truncado a 8192 tokens en el ejemplo de uso del autor (contexto nativo del modelo base no disponible) |
| Tipos de cuantizacion | INT8 dinámica (`model_q8.onnx`); el modelo base se distribuye presumiblemente en FP32/FP16 pero no se detalla |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`model_q8.onnx`, 261 MB) + `tokenizer.json` (31 MB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `google/embeddinggemma-2`. Por el pipeline declarado (`feature-extraction`) y el uso de `sentence-transformers` como etiqueta, se trata de un encoder de texto que genera embeddings densos de 768 dimensiones mediante pooling medio enmascarado sobre la última capa oculta y normalización L2, tal como muestra el código de ejemplo del autor.

El proceso de exportación descrito en la model card es el siguiente: se carga el encoder de texto del modelo original (con visión y audio deshabilitados), se exporta a ONNX mediante trazado TorchScript legacy con opset 17 y se aplica cuantización dinámica INT8 con `onnxruntime.quantization`. El script empleado es `export_onnx.py` del repositorio `surus-lat/benchy-agent`. No se aportan datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO, ya que corresponden al modelo base y no se incluyen en esta información.

## Capacidades

- Generación de embeddings de texto de 768 dimensiones para similitud semántica y recuperación.
- Búsqueda semántica y ranking de documentos mediante similitud coseno.
- Soporte de plantilla de prompt para consultas: `"task: search result | query: "` en el ejemplo del autor.
- Pooling medio enmascarado y normalización L2 integrados en el flujo de ejemplo.
- Inferencia en CPU sin PyTorch ni sentence-transformers (solo `onnxruntime`, `tokenizers`, `numpy`).
- Truncado configurable hasta 8192 tokens en el tokenizer de ejemplo.
- No se declaran capacidades de tool calling, agentes, visión, audio ni modo thinking; el modelo base tiene visión/audio deshabilitados en esta exportación.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar fragmentos de manuales y recuperar los más relevantes para una consulta en lenguaje natural, aprovechando el truncado a 8192 tokens para pasajes largos.
- Motor de recuperación en RAG sobre CPU: desplegar el modelo en servidores sin GPU para generar embeddings de chunks y consultas en pipelines de generación aumentada, con 24 ms por consulta en 4 núcleos según el autor.
- Deduplicación y clustering de textos: calcular embeddings de tickets, correos o artículos y agrupar por similitud coseno para detectar duplicados o temas recurrentes.
- Clasificación zero-shot por similitud: comparar el embedding de un texto con descripciones de categorías predefinidas para etiquetado sin entrenamiento adicional.
- Búsqueda en bases de conocimiento internas: integrar el modelo en servicios ligeros (contenedores sin torch) para búsqueda sobre wikis corporativas o bases de preguntas frecuentes.
- Filtrado y ranking en motores de recomendación de contenido: puntuar la afinidad entre un perfil de usuario y artículos mediante similitud de embeddings.
- Evaluación de calidad de respuestas: medir la similitud semántica entre una respuesta generada y una referencia en pipelines de evaluación automática.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB, etc.). Sí incluye métricas de calidad de la cuantización y latencia declaradas por el autor:

| Metrica | Valor declarado |
|---|---|
| Similitud coseno FP32 vs INT8 | 0,990-0,995 |
| Ranking de búsqueda top-5 | idéntico al pipeline original |
| Latencia por consulta (CPU, 4 nucleos, INT8) | 24 ms |
| Latencia por consulta (CPU, 4 nucleos, torch) | 68 ms |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM: no aplica para el fichero INT8 en CPU; el modelo ONNX ocupa 261 MB en disco y se ejecuta con `CPUExecutionProvider`.
- GPU: no se documenta soporte ni requisitos de GPU; el ejemplo usa exclusivamente CPU.
- Consumer GPU: no se indica compatibilidad con RTX 4090 u otras GPU de consumo en esta exportación.
- Despliegue: `onnxruntime` (Python) con `CPUExecutionProvider`; también puede integrarse en runtimes ONNX de otros lenguajes, aunque no se documenta.
- Latencia: 24 ms por consulta en CPU de 4 núcleos según el autor; no se aportan cifras de throughput (consultas por segundo) ni de rendimiento en GPU.
- Memoria RAM: no se especifica; el tamaño del fichero (261 MB) y del tokenizer (31 MB) da una cota inferior aproximada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparación rigurosa con alternativas. Se ofrece una comparación limitada a lo declarado:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| surus-ai/embeddinggemma-2-onnx (esta ficha) | no disponible | truncado 8192 en ejemplo | apache-2.0 | ONNX INT8 | 261 MB, inferencia CPU sin torch |
| google/embeddinggemma-2 (modelo base) | no disponible | no disponible | no disponible en esta informacion | no disponible | Referencia original; requiere torch/sentence-transformers |
| Alternativas de embeddings | no disponible | no disponible | no disponible | no disponible | No se aportan datos comparables en la informacion disponible |

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo base ni de la exportación.
- Riesgo de alucinación no aplicable directamente (es un modelo de embeddings, no generativo), pero los embeddings pueden producir similitudes engañosas en dominios fuera de distribución.
- Idiomas soportados no declarados; no se puede garantizar un rendimiento multilingüe sin evaluación propia.
- La cuantización INT8 introduce una pérdida de calidad medida en 0,990-0,995 de similitud coseno frente a FP32; para aplicaciones sensibles al ranking conviene validar con el corpus propio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-10-26); no hay evidencia de uso en producción.
- La exportación deshabilita visión y audio del modelo base, por lo que no debe esperarse capacidad multimodal.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `google/embeddinggemma-2`, no incluida en esta información.
- El truncado a 8192 tokens es una configuración del ejemplo del tokenizer, no necesariamente el contexto nativo del modelo; textos más largos se truncan.
- No se documenta el soporte de GPU ni el rendimiento en aceleradores, lo que limita su uso en escenarios de alto throughput.

## Enlaces

- Hugging Face: https://huggingface.co/surus-ai/embeddinggemma-2-onnx
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Repositorio del script de exportación: https://github.com/surus-lat/benchy-agent
