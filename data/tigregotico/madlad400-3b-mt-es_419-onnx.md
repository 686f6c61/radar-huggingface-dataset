# TigreGotico/madlad400-3b-mt-es_419-onnx

## Resumen

`TigreGotico/madlad400-3b-mt-es_419-onnx` es la exportación a ONNX del modelo de traducción `Ugiat/madlad400-3b-mt-es_419`, un ajuste fino de `google/madlad400-3b-mt` orientado a la variante latinoamericana del español (`es_419`). El modelo resuelve traducción automática multilingüe hacia español latinoamericano, con la particularidad de que el tokenizador incorpora un token de destino propio (`<2es_419>`, id 256000) que no existe en el tokenizador original de MADLAD-400.

La relevancia de esta ficha no está en el modelo lingüístico en sí, sino en el formato: se distribuyen grafos ONNX en fp32 (19,74 GB) e int8 (4,94 GB) listos para `onnxruntime` vía `optimum`, lo que permite desplegar un modelo T5 de 3B parámetros en CPU sin depender de PyTorch. La exportación la firma un pipeline automatizado (Claude Opus 5.5 vía Claude Code) y la model card advierte explícitamente de que ninguna persona ha revisado la tarjeta.

Arquitectura transformer encoder-decoder tipo T5 (MADLAD-400), licencia Apache 2.0 heredada del modelo fuente, con paridad verificada de 10/10 en fp32 y 8/10 en int8 frente al checkpoint original en `transformers`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5, MADLAD-400) |
| Parámetros totales | 3B (heredado de madlad400-3b-mt) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | fp32 (grafos raíz) e int8 dinámica (`int8/`, QInt8 por grafo) |
| Idiomas soportados | `es` (español), `es_419` (español latinoamericano), multilingüe (heredado de MADLAD-400) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`.onnx` + `.onnx_data`), tokenizer SentencePiece (`spiece.model`) |

## Arquitectura y entrenamiento

El modelo subyacente es MADLAD-400-3B-MT, un transformer encoder-decoder de la familia T5 con 3B parámetros, entrenado por Google para traducción automática multilingüe a gran escala. Sobre esa base, Ugiat Technologies realizó un ajuste fino para producir `Ugiat/madlad400-3b-mt-es_419`, especializado en la variante latinoamericana del español. No se dispone en la información proporcionada de detalles sobre el dataset de ajuste fino, número de tokens, ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica de esta ficha es el proceso de exportación: se generaron tres grafos separados (encoder, decoder y decoder_with_past) con `optimum-cli export onnx --task text2text-generation-with-past --no-post-process`, manteniendo los dos grafos de decoder separados en lugar de fusionarlos en `decoder_model_merged.onnx`. Los pesos fuente están en bfloat16, pero `transformers` los carga como float32 y los grafos se exportaron en fp32. La cuantización int8 se aplicó por grafo con `onnxruntime.quantization.quantize_dynamic`, `weight_type=QuantType.QInt8` y `extra_options={"EnableSubgraph": True}`. Toolchain declarado: optimum 1.24.0, transformers 4.45.2, torch 2.4.1 (CPU), onnxruntime 1.31.1.

## Capacidades

- Traducción automática multilingüe hacia español latinoamericano mediante el prefijo `<2es_419>`.
- Traducción hacia español genérico mediante el prefijo `<2es>` del modelo base.
- El idioma origen no se etiqueta: se detecta implícitamente por el contenido de entrada.
- Generación de texto seq2seq estándar (encoder-decoder T5), con decodificación greedy, beam search y sampling configurables vía `generate()`.
- Inferencia en CPU mediante `onnxruntime` con `ORTModelForSeq2SeqLM` de `optimum`.
- Soporte de decodificación con caché (`decoder_with_past_model`) para acelerar la generación autoregresiva.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción de documentación técnica al español latinoamericano: el prefijo `<2es_419>` permite forzar la variante regional (por ejemplo "computadora" frente a "ordenador"), útil en equipos que publican documentación para LATAM.
- Localización de interfaces y textos de producto: el modelo traduce frases cortas con alta fidelidad, como demuestran los ejemplos de la model card ("My computer is very slow" → "Mi computadora es muy lenta").
- Despliegue en servidores sin GPU: los grafos int8 (4,94 GB en total) permiten servir traducción en CPU con `onnxruntime`, reduciendo coste de infraestructura frente a fp32 (19,74 GB).
- Pipelines de traducción por lotes: la separación en grafos encoder/decoder facilita el procesamiento por etapas y el reutilizo del encoder en escenarios con múltiples salidas.
- Traducción integrada en aplicaciones de escritorio o edge: el formato ONNX es portable a runtimes ligeros y no requiere el stack completo de PyTorch.
- Evaluación y benchmarking de cuantización: el repositorio incluye una comparativa fp32/int8 con paridad de tokens, útil como referencia para estudiar el impacto de la cuantización dinámica en modelos T5.
- Traducción de contenido editorial y marketing hacia español neutro o latinoamericano, con la salvedad de revisar el resultado por tratarse de un modelo de 3B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU, etc.) en la información disponible. La model card sí incluye una prueba de paridad sobre 10 frases con decodificación greedy (`num_beams=1`, `do_sample=False`, `max_new_tokens=128`), comparando los ids de tokens generados:

| Variante | Ids de tokens idénticos al checkpoint fuente |
|---|---|
| fp32 | 10/10 |
| int8 | 8/10 |

Ejemplos de traducción con `<2es_419>` (transformers = fp32):

| Entrada | Salida |
|---|---|
| Thanks, guys, you're the best! | Gracias, chicos, ¡son los mejores! |
| Have you finished your homework, kids? | ¿Han terminado sus tareas, niños? |
| My computer is very slow. | Mi computadora es muy lenta. |
| The parking lot is full. | El estacionamiento está lleno. |
| She parked the car in front of the supermarket and bought potatoes, peaches and peanuts. | Ella estacionó el auto frente al supermercado y compró papas, duraznos y maní. |

En la variante int8, la última frase se traduce como "Ella aparcó el coche frente al supermercado y compró papas, duraznos y cacahuetes", divergiendo del fp32 en léxico regional ("aparcó" frente a "estacionó", "cacahuetes" frente a "maní").

## Requisitos de hardware

- VRAM/RAM para fp32: 19,74 GB de grafos; requiere al menos ~20 GB de memoria disponible para cargar los tres modelos.
- VRAM/RAM para int8: 4,94 GB de grafos; viable en máquinas con 8 GB de RAM.
- GPU recomendadas: no especificadas en la información; al ser ONNX, puede ejecutarse con `onnxruntime-gpu` en A100, H100, RTX 4090, etc., pero no se documentan configuraciones ni rendimiento.
- Consumer GPU: la variante int8 (4,94 GB) cabe en GPUs de 8 GB o más; la fp32 (19,74 GB) requiere GPUs de 24 GB o más (RTX 3090/4090, A10, etc.) o ejecución en CPU.
- Opciones de despliegue: `optimum.onnxruntime.ORTModelForSeq2SeqLM` con `onnxruntime`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota operativa: los ficheros `.onnx_data` deben descargarse junto a su `.onnx` correspondiente; el grafo no carga sin ellos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Especialización |
|---|---|---|---|---|---|
| TigreGotico/madlad400-3b-mt-es_419-onnx | 3B | no disponible | ONNX (fp32/int8) | apache-2.0 | Traducción a español LATAM |
| Ugiat/madlad400-3b-mt-es_419 | 3B | no disponible | safetensors (bfloat16) | apache-2.0 | Traducción a español LATAM |
| google/madlad400-3b-mt | 3B | no disponible | safetensors | apache-2.0 | Traducción multilingüe general |
| google/madlad400-7b-mt | 7B | no disponible | safetensors | apache-2.0 | Traducción multilingüe general |

La ventaja diferencial de esta variante frente al checkpoint fuente es el formato ONNX int8, que reduce el peso de 19,74 GB a 4,94 GB y elimina la dependencia de PyTorch en inferencia. Frente a MADLAD-400 base, el ajuste fino añade el token `<2es_419>` para forzar la variante regional. No se dispone de datos de rendimiento comparativo (BLEU, COMET) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card advierte que la exportación la realizó un pipeline automatizado y que ninguna persona ha revisado la tarjeta; la calidad del proceso no está auditada manualmente.
- La paridad int8 es de 8/10, no de 10/10: dos de las diez frases de prueba generan tokens distintos al modelo fuente, con divergencias léxicas regionales ("aparcó"/"estacionó", "cacahuetes"/"maní").
- El tokenizador del repositorio es obligatorio: el tokenizador base de MADLAD-400 no conoce el token `<2es_419>`, por lo que usar otro tokenizador rompe la selección de idioma.
- El modelo está especializado en traducción; no se documentan capacidades de razonamiento, código, matemáticas ni tool calling.
- No se documenta la longitud de contexto soportada, lo que dificulta planificar el tamaño de los documentos a traducir.
- Riesgo de alucinación y de deriva regional inherente a un modelo de traducción de 3B; se recomienda revisión humana en contenido sensible.
- Licencia Apache 2.0 permite uso comercial, pero se hereda del modelo fuente y no se añaden garantías por parte del exportador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se documenta compatibilidad con runtimes distintos de `onnxruntime` ni con GPUs específicas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TigreGotico/madlad400-3b-mt-es_419-onnx
- Modelo fuente del ajuste fino: https://huggingface.co/Ugiat/madlad400-3b-mt-es_419
- Modelo base original: https://huggingface.co/google/madlad400-3b-mt
- Commit de exportación: `fe915ec4e516d4eb9f0972a5e06edb34a7224947`
- Paper de MADLAD-400: no disponible en la información proporcionada
- Blog o demo: no disponible en la información proporcionada
