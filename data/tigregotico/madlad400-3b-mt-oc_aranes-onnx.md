# TigreGotico/madlad400-3b-mt-oc_aranes-onnx

## Resumen

El modelo `TigreGotico/madlad400-3b-mt-oc_aranes-onnx` es una exportación a formato ONNX del modelo de traducción `Ugiat/madlad400-3b-mt-oc_aranes`, un ajuste fino de `google/madlad400-3b-mt` realizado por Ugiat Technologies. El objetivo del modelo es la traducción automática hacia y desde el aranés, la variedad del occitano que se habla en el Val d'Aran (Cataluña), una lengua minoritaria con recursos digitales muy escasos. Se distribuye en dos variantes: grafos en fp32 (19,74 GB en total) y grafos cuantizados a int8 (4,94 GB en total), lo que permite desplegarlo en entornos con menos memoria.

La arquitectura subyacente es la de MADLAD-400, un transformer encoder-decoder de tipo T5 con aproximadamente 3.000 millones de parámetros. La exportación a ONNX la ha realizado TigreGotico mediante un pipeline automatizado con `optimum-cli`, manteniendo la licencia Apache 2.0 del modelo original. La relevancia de esta ficha radica en que combina dos elementos poco habituales: cobertura de una lengua minoritaria (aranés) y un formato de despliegue (ONNX Runtime) orientado a producción, con verificación de paridad frente al modelo original en `transformers`.

La model card advierte explícitamente que la conversión y la verificación fueron realizadas por un pipeline automatizado (Claude Opus 5.5 vía Claude Code) y que ninguna persona ha revisado la tarjeta. Esta ficha se limita a los datos publicados en dicha tarjeta y en los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5, familia MADLAD-400) |
| Parametros totales | 3B (aproximadamente 3.000 millones, según el nombre del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp32 (grafos completos) e int8 (cuantización dinámica de pesos, `QuantType.QInt8`) |
| Idiomas soportados | oc (occitano), oc_aranes (aranés), ca (catalán), es (español), en (inglés), fr (francés), multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos `.onnx` con pesos externos `.onnx_data`), tokenizer SentencePiece (`spiece.model`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `google/madlad400-3b-mt`, que emplea la arquitectura T5 con atención encoder-decoder estándar. MADLAD-400 se entrenó originalmente sobre un corpus multilingüe masivo (miles de millones de tokens en más de 400 idiomas), y el ajuste fino de Ugiat Technologies especializa el modelo para el aranés y lenguas vecinas. No se dispone en la información proporcionada de detalles sobre el volumen de datos del ajuste fino, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica de esta variante concreta reside en la exportación a ONNX. Se generaron grafos separados para encoder, decoder y decoder con caché (`decoder_with_past_model`), usando `--no-post-process` para evitar la fusión en un único `decoder_model_merged.onnx`; en consecuencia, `from_pretrained` muestra un aviso y recurre a los grafos separados. La cuantización int8 se aplicó por grafo con `onnxruntime.quantization.quantize_dynamic` y `EnableSubgraph: True`. El toolchain utilizado fue optimum 1.24.0, transformers 4.45.2, torch 2.4.1 (CPU) y onnxruntime 1.31.1. Los pesos originales están en bfloat16 y la exportación los carga como float32.

## Capacidades

- Traducción automática multilingüe con etiquetas de idioma destino con formato `<2xx>` (por ejemplo, `<2oc_aranes>` para aranés, `<2ca>` para catalán).
- Traducción hacia aranés desde inglés y otras lenguas, y desde aranés hacia catalán y otras lenguas, según los ejemplos de la model card.
- Traducción entre lenguas románicas vecinas (catalán, occitano estándar, español, francés) e inglés.
- Generación de texto condicionada por prefijo de idioma, siguiendo el esquema de MADLAD-400.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada a los idiomas declarados en los metadatos; no se garantiza cobertura de otros idiomas de MADLAD-400.

## Casos de uso

- Traducción de documentación administrativa al aranés: el modelo permite convertir textos oficiales del catalán o el español al aranés con una etiqueta `<2oc_aranes>`, útil para ayuntamientos y entidades del Val d'Aran que necesitan cumplir con la oficialidad de la lengua.
- Localización de interfaces y aplicaciones móviles: integrado vía ONNX Runtime en un backend de traducción, puede generar cadenas en aranés a partir de inglés o catalán, con la variante int8 para reducir el consumo de memoria en servidores modestos.
- Subtitulado y doblaje de contenido audiovisual: traducción de guiones y subtítulos entre catalán, occitano y aranés, aprovechando la coherencia terminológica que muestra en los ejemplos de la model card.
- Preservación digital de lengua minoritaria: generación de corpus paralelos y material didáctico en aranés para escuelas y proyectos de documentación lingüística.
- Traducción en atención al ciudadano: despliegue en un servicio de chat o correo que traduzca consultas entre aranés y catalán/castellano, con la variante fp32 si se prioriza la fidelidad frente al modelo original.
- Investigación en traducción de lenguas de bajos recursos: punto de partida para experimentos de ajuste fino, evaluación o destilación sobre aranés, con grafos ONNX que facilitan la reproducibilidad en CPU.
- Integración en pipelines de CI/CD de localización: el formato ONNX y la separación encoder/decoder permiten automatizar la traducción de ficheros de recursos (`.po`, `.json`) en flujos de integración continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU, etc.) en la información disponible. La model card únicamente reporta una prueba de paridad con el modelo original en `transformers`, comparando los ids de tokens generados con decodificación greedy (`num_beams=1`, `do_sample=False`, `max_new_tokens=128`) sobre 10 frases:

| Variante | Ids de tokens idénticos al modelo original |
|---|---|
| fp32 | 10/10 |
| int8 | 4/10 |

La model card indica que int8 se reporta a título informativo y no constituye un criterio de publicación. En los ejemplos cualitativos, int8 produce traducciones plausibles pero con diferencias léxicas y algún error semántico (por ejemplo, traduce "s'ha mort" como "s'ha aturat" en catalán).

## Requisitos de hardware

- VRAM estimada para fp32: en torno a 20 GB solo para los pesos de los grafos; se recomienda al menos 24 GB de VRAM para inferencia con margen.
- VRAM estimada para int8: en torno a 5 GB para los pesos; viable en GPUs de 8 GB o más.
- GPU recomendadas: A100 (40/80 GB) o H100 para fp32 con throughput alto; RTX 4090 (24 GB) para fp32 ajustado; RTX 3060/4060 (8-12 GB) o inferencia en CPU para int8.
- Cabe en GPU de consumo: sí, la variante int8 en GPUs de 8 GB o más; la fp32 requiere al menos 24 GB.
- Opciones de despliegue: ONNX Runtime a través de `optimum.onnxruntime.ORTModelForSeq2SeqLM`; también es posible servir los grafos con servidores compatibles con ONNX, aunque no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| TigreGotico/madlad400-3b-mt-oc_aranes-onnx | 3B | No disponible | oc, oc_aranes, ca, es, en, fr | Apache 2.0 | ONNX (fp32/int8) |
| Ugiat/madlad400-3b-mt-oc_aranes | 3B | No disponible | oc, oc_aranes, ca, es, en, fr | Apache 2.0 | Safetensors (bfloat16) |
| google/madlad400-3b-mt | 3B | No disponible | Más de 400 idiomas | Apache 2.0 | Safetensors |
| google/madlad400-7b-mt | 7B | No disponible | Más de 400 idiomas | Apache 2.0 | Safetensors |

La comparativa se limita a la familia MADLAD-400 porque no se dispone de datos de benchmarks que permitan contrastar el rendimiento con otros sistemas de traducción especializados en aranés u occitano. El modelo base de 7B ofrece mayor capacidad pero no está especializado en aranés y requiere más recursos.

## Limitaciones y advertencias

- La model card no ha sido revisada por una persona; la conversión y la verificación las realizó un pipeline automatizado, por lo que pueden existir errores no detectados.
- La variante int8 solo coincide con el modelo original en 4 de 10 frases de prueba; puede introducir cambios léxicos y errores semánticos, como se observa en los ejemplos de traducción al catalán.
- Riesgo de alucinación y de traducciones plausibles pero incorrectas, especialmente en terminología especializada o frases ambiguas.
- El tokenizer del repositorio es imprescindible: las etiquetas `<2oc_aranes>` son piezas SentencePiece propias que el tokenizer base de MADLAD-400 no reconoce. `<2oc>` produce occitano estándar y `<2arn>` corresponde a mapudungun, no a aranés.
- La longitud de contexto no está documentada; no se debe asumir la ventana nativa de MADLAD-400 sin verificación.
- Cobertura lingüística limitada a los idiomas declarados; el rendimiento fuera de ellos no está garantizado.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar los avisos de atribución a Ugiat Technologies y Google.
- El repositorio pesa 24,7 GB; los ficheros `.onnx_data` deben descargarse junto con su `.onnx` correspondiente, ya que el grafo no carga sin ellos.
- No hay `decoder_model_merged.onnx`; algunas herramientas que esperan ese fichero pueden requerir configuración adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TigreGotico/madlad400-3b-mt-oc_aranes-onnx
- Modelo base del ajuste fino: https://huggingface.co/Ugiat/madlad400-3b-mt-oc_aranes
- Modelo original de Google: https://huggingface.co/google/madlad400-3b-mt
- Paper de MADLAD-400: no disponible en la información proporcionada
- Repositorio de Optimum: no disponible en la información proporcionada
- Demos: no disponibles en la información proporcionada
