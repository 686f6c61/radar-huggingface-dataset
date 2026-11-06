# TigreGotico/madlad400-3b-mt-es_ES-onnx

## Resumen

`TigreGotico/madlad400-3b-mt-es_ES-onnx` es una exportación a ONNX del modelo de traducción `Ugiat/madlad400-3b-mt-es_ES`, un ajuste fino de `google/madlad400-3b-mt` realizado por Ugiat Technologies. El objetivo del modelo es la traducción automática multilingüe hacia el castellano tal y como se escribe en España, con un énfasis explícito en variantes léxicas peninsulares (por ejemplo, "ordenador" frente a "computadora", "móvil" frente a "celular", "piso" frente a "apartamento"). La exportación la firma TigreGotico mediante un pipeline automatizado, e incluye grafos en fp32 e int8 listos para `onnxruntime`.

Arquitectónicamente es un transformer encoder-decoder de tipo T5 con aproximadamente 3.000 millones de parámetros, la misma familia que MADLAD-400, que cubre más de 400 idiomas. El repositorio pesa 24,7 GB en total: 19,74 GB en fp32 y 4,94 GB en int8. La licencia es Apache 2.0, heredada del modelo fuente.

La relevancia práctica está en que ofrece una alternativa de traducción a castellano de España ejecutable sin PyTorch, con `optimum` y `onnxruntime`, lo que simplifica el despliegue en entornos de producción ligeros y permite cuantización int8 con una pérdida de calidad controlada (6 de cada 10 frases idénticas token a token respecto al modelo original en fp32, según la model card).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 (MADLAD-400) |
| Parametros totales | Aproximadamente 3.000 millones (modelo base `google/madlad400-3b-mt`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | fp32 (grafos raiz) e int8 dinamico (`onnxruntime.quantization.quantize_dynamic`, `QuantType.QInt8`) |
| Idiomas soportados | Entrada multilingue (MADLAD-400, mas de 400 idiomas); salida en castellano de Espana (`<2es_ES>`) y `<2es>` |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`.onnx` + `.onnx_data`), tokenizer SentencePiece (`spiece.model`) |

## Arquitectura y entrenamiento

El modelo es un T5 encoder-decoder de aproximadamente 3.000 millones de parámetros, derivado de `google/madlad400-3b-mt`, que a su vez se entrena sobre datos multilingües masivos con más de 400 idiomas. El ajuste fino de Ugiat Technologies especializa la salida hacia el castellano de España, e introduce nuevos tags de destino (`<2es_ES>`, con id 256000 en el tokenizer de este repositorio) que no existen en el tokenizer original de MADLAD-400. La model card indica que el tag genérico `<2es>` también produce castellano peninsular con este ajuste.

La exportación a ONNX se realizó con `optimum-cli export onnx --task text2text-generation-with-past --no-post-process`, lo que mantiene separados los grafos `decoder_model` y `decoder_with_past_model` (no hay `decoder_model_merged.onnx`). Los pesos fuente están en bfloat16, pero `transformers` los carga como float32 y los grafos se exportaron en fp32. La cuantización int8 se aplicó por grafo con cuantización dinámica y `EnableSubgraph=True`. Toolchain declarado: optimum 1.24.0, transformers 4.45.2, torch 2.4.1 (CPU) y onnxruntime 1.31.1. No se documenta en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el ajuste fino.

## Capacidades

- Traducción automática multilingüe hacia castellano de España, con control explícito del destino mediante el prefijo `<2es_ES>` (o `<2es>`).
- Normalización de variantes léxicas peninsulares: la model card muestra ejemplos con "ordenador", "móvil", "piso" y "vuestras/vuestros" frente a equivalentes latinoamericanos.
- Traducción bidireccional en la práctica: cualquier idioma de origen soportado por MADLAD-400 hacia castellano; el idioma de origen no se etiqueta.
- Generación de texto condicionada por prompt, con decodificación greedy (`num_beams=1`, `do_sample=False`) validada en la model card.
- Ejecución sin PyTorch mediante `optimum.onnxruntime.ORTModelForSeq2SeqLM` y `onnxruntime`.
- Soporte de cuantización int8 por grafo para reducir el peso total de 19,74 GB a 4,94 GB.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción de documentación técnica al castellano de España: el modelo acepta entradas en inglés u otros idiomas y produce salida con terminología peninsular ("ordenador", "móvil"), lo que reduce la postedición manual en manuales y guías.
- Localización de interfaces de producto para el mercado español: integrado en un pipeline de CI/CD, traduce cadenas de recursos (JSON, YAML, gettext) al castellano peninsular antes de publicar la release.
- Atención al cliente multilingüe: traducción en tiempo real de tickets y correos entrantes al castellano, con despliegue en `onnxruntime` sobre CPU o GPU modesta gracias a la variante int8 de 4,94 GB.
- Subtitulado y doblaje: traducción de guiones y subtítulos al castellano de España con coherencia léxica peninsular, adecuada para plataformas que distinguen español de España y español de Latinoamérica.
- Traducción jurídica y administrativa: conversión de contratos y comunicaciones oficiales al castellano peninsular, con revisión humana posterior dado el riesgo de alucinación inherente a los modelos generativos.
- Investigación en traducción automática: modelo de referencia para estudiar el efecto de tags de variante dialectal (`<2es_ES>` frente a `<2es>`) y para evaluar la degradación de la cuantización int8 frente a fp32 con el mismo grafo ONNX.
- Despliegue en entornos sin PyTorch: servicios en contenedores ligeros que solo admiten `onnxruntime`, por ejemplo funciones serverless o appliances con dependencias mínimas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU, COMET) en la información disponible. La model card únicamente documenta una prueba de paridad con el modelo fuente sobre 10 frases, con decodificación greedy y `max_new_tokens=128`, comparando los ids de token generados:

| Variante | Ids de token idénticos al modelo fuente en `transformers` (fp32) |
|---|---|
| ONNX fp32 | 10/10 |
| ONNX int8 | 6/10 |

La model card advierte explícitamente que el resultado int8 es informativo y no constituye un criterio de liberación. En el ejemplo cualitativo con `<2es>` y la frase "Kids, put on your jackets, it's cold outside", el modelo int8 produce "ponedos las chaquetas" frente a "poned las chaquetas" del fp32, lo que ilustra el tipo de error que introduce la cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 20 GB solo para los pesos (19,74 GB de grafos), más overhead de activaciones y KV cache; se recomienda GPU con 24 GB o más.
- VRAM estimada para inferencia en int8: en torno a 5 GB para los pesos (4,94 GB), más overhead; cabe en GPUs consumer de 8 GB o 12 GB.
- GPU recomendadas: A100 40/80 GB o H100 para fp32 con concurrencia; RTX 4090 (24 GB) para fp32 en una sola tarjeta; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 en int8.
- Ejecución en CPU: viable con int8 mediante `onnxruntime`, aunque la latencia será notablemente superior a la de GPU para secuencias largas.
- Opciones de despliegue: `optimum.onnxruntime.ORTModelForSeq2SeqLM`, `onnxruntime` directamente, `onnxruntime-genai` o servidores compatibles con ONNX. `llama.cpp` y `Ollama` no aplican porque el formato es ONNX y la arquitectura es encoder-decoder T5.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| `TigreGotico/madlad400-3b-mt-es_ES-onnx` (este) | ~3.000 M | No disponible | Traduccion a castellano de Espana, export ONNX | Apache 2.0 | ONNX fp32 / int8 |
| `Ugiat/madlad400-3b-mt-es_ES` (fuente) | ~3.000 M | No disponible | Traduccion a castellano de Espana | Apache 2.0 | safetensors (bfloat16) |
| `google/madlad400-3b-mt` | ~3.000 M | No disponible | Traduccion multilingue general (400+ idiomas) | Apache 2.0 | safetensors |
| `facebook/nllb-200-3.3B` | ~3.300 M | No disponible | Traduccion multilingue (200 idiomas) | CC-BY-NC 4.0 (no comercial) | safetensors |

La diferencia principal frente al modelo fuente es el formato (ONNX con variante int8) y la ausencia de PyTorch en el grafo de inferencia. Frente a MADLAD-400 original, este ajuste prioriza el castellano peninsular mediante tags dedicados. Frente a NLLB-200, la licencia Apache 2.0 permite uso comercial sin las restricciones de CC-BY-NC.

## Limitaciones y advertencias

- La model card indica que la exportación la generó un pipeline automatizado (Claude Opus 5.5 vía Claude Code) y que ninguna persona ha revisado la tarjeta; conviene validar el comportamiento antes de usarlo en producción.
- La paridad int8 con el modelo fuente es de 6/10 frases idénticas token a token; errores como "ponedos" en lugar de "poned" aparecen en los ejemplos documentados.
- Riesgo de alucinación inherente a los modelos generativos: puede omitir, añadir o reformular contenido, especialmente en textos largos o con terminología especializada.
- El tag `<2es_ES>` (id 256000) solo existe en el tokenizer de este repositorio; usar el tokenizer original de MADLAD-400 producirá resultados incorrectos.
- Los grafos `.onnx` de más de 2 GB requieren descargar también su `.onnx_data` asociado; sin ese fichero el grafo no carga.
- No hay `decoder_model_merged.onnx`; `from_pretrained` avisa y recurre a los grafos separados, lo que puede afectar a integraciones que esperen el grafo fusionado.
- No se documentan sesgos específicos, cobertura idiomática de origen distinta de la de MADLAD-400 ni límites de longitud de contexto; no disponibles en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda conservar la atribución a Ugiat Technologies y a Google por el modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TigreGotico/madlad400-3b-mt-es_ES-onnx
- Modelo fuente del ajuste fino: https://huggingface.co/Ugiat/madlad400-3b-mt-es_ES
- Modelo base original: https://huggingface.co/google/madlad400-3b-mt
- Commit de exportación: `3f26e1d6d13938675047f3fad49b28f8c1ba2c9a` (en el repositorio `Ugiat/madlad400-3b-mt-es_ES`)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
