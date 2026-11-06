# TigreGotico/IbRo-nllb-onnx

## Resumen

IbRo-nllb-onnx es una exportación a formato ONNX del modelo Transducens/IbRo-nllb, un ajuste fino completo de NLLB-200 1.3B realizado por el equipo Transducens de la Universitat d'Alacant para la tarea compartida WMT24 sobre traducción a lenguas de bajos recursos de España. El modelo original resuelve la traducción entre el español y lenguas como el asturiano, el aragonés, el aranés, el gallego, el catalán y el valenciano, un conjunto de pares lingüísticos escasamente cubiertos por los sistemas de traducción automática comerciales.

Esta versión ONNX, mantenida por TigreGotico, ofrece los grafos del encoder y del decoder (con y sin caché) en precisión fp32 e int8, listos para su uso con ONNX Runtime mediante la librería optimum. La cuantización int8 reduce el peso total de los grafos de 11,91 GB a 3,00 GB, lo que facilita el despliegue en entornos sin GPU de gama alta y en pipelines de inferencia en CPU.

La relevancia del modelo radica en su especialización: no es un traductor multilingüe genérico, sino un ajuste fino orientado a variedades lingüísticas minoritarias de la península ibérica, con tokens de idioma añadidos específicamente para aragonés, aranés y valenciano. La conversión a ONNX amplía su accesibilidad a stacks de producción que no dependen de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (M2M-100 / NLLB-200) |
| Parametros totales | 1.300 millones (modelo base NLLB-200 1.3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 e int8 (cuantización dinámica, per_channel=True, QInt8) |
| Idiomas soportados | es, ast, an, oc (aranés), gl, ca, val |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (grafos con datos externos `.onnx_data`), tokenizer en el directorio raíz |

## Arquitectura y entrenamiento

El modelo subyacente es un ajuste fino completo de NLLB-200 1.3B, la arquitectura transformer encoder-decoder de Meta AI para traducción automática multilingüe. El ajuste se realizó en el contexto de la tarea compartida WMT24 sobre traducción a lenguas de bajos recursos de España, organizada por el equipo Transducens de la Universitat d'Alacant. El modelo añade tres tokens de idioma nuevos respecto al vocabulario original de NLLB-200: `arg_Latn` (aragonés, id 256204), `arn_Latn` (aranés, id 256205) y `val_Latn` (valenciano, id 256206), situados tras el token `<mask>` (id 256203).

La exportación a ONNX se realizó con optimum-cli en la tarea `text2text-generation-with-past` y la opción `--no-post-process`, que mantiene separados los grafos del decoder y del decoder con caché (no existe `decoder_model_merged.onnx`). La cuantización int8 se aplicó por grafo con `onnxruntime.quantization.quantize_dynamic`, usando `weight_type=QuantType.QInt8`, `per_channel=True`, `reduce_range=False` y `EnableSubgraph=True`. El toolchain empleado fue optimum 1.24.0, transformers 4.45.2, torch 2.4.1 (CPU) y onnxruntime 1.31.1.

La verificación de paridad se realizó sobre 35 frases traducidas con decodificación greedy (`num_beams=1`, `do_sample=False`, `max_new_tokens=128`), comparando los ids de tokens generados por el checkpoint original en transformers (fp32), los grafos ONNX fp32 y los grafos ONNX int8. Los grafos fp32 reprodujeron los 35/35 ids idénticos; los int8, 31/35.

## Capacidades

- Traducción automática entre español y asturiano, aragonés, aranés, gallego, catalán y valenciano, en ambos sentidos según los pares declarados en la model card original.
- Traducción catalán ↔ aranés.
- Control explícito del idioma origen mediante `tokenizer.src_lang` y del idioma destino mediante `forced_bos_token_id`.
- Inferencia en CPU y GPU mediante ONNX Runtime, con variantes fp32 e int8.
- Generación de texto seq2seq con caché de decoder (`decoder_with_past_model`), lo que acelera la decodificación autorregresiva.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción de documentación administrativa al aragonés, aranés o asturiano: el modelo permite generar versiones en lenguas cooficiales o minoritarias de textos institucionales, usando el token de destino correspondiente y los grafos int8 para despliegue en servidores sin GPU dedicada.
- Localización de contenidos web y aplicaciones al catalán y al gallego: con 1.300 millones de parámetros y grafos ONNX de 3 GB en int8, puede integrarse en un servicio de traducción por lotes con ONNX Runtime en CPU.
- Subtitulado y traducción de medios audiovisuales entre español y catalán o gallego: el modelo seq2seq permite procesar segmentos de texto de forma independiente, y la caché de decoder reduce la latencia en secuencias largas.
- Preservación y difusión del aragonés y el aranés: al ser variedades con pocos recursos, el ajuste fino específico sobre NLLB-200 ofrece una alternativa open source para proyectos de digitalización y educación lingüística.
- Traducción bidireccional en herramientas de escritorio o aplicaciones móviles: la variante int8 (3,00 GB) puede ejecutarse con ONNX Runtime en equipos de gama media, aunque el tamaño sigue siendo elevado para dispositivos móviles.
- Investigación en traducción de bajas recursos: el modelo sirve como línea base reproducible para experimentos sobre variedades ibéricas, con paridad verificada frente al checkpoint original en transformers.
- Traducción catalán ↔ aranés para administraciones locales: par específico documentado en la model card original, útil para señalización y comunicaciones oficiales en la Val d'Aran.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU, etc.) en la información disponible. La model card solo documenta una prueba de paridad con el modelo original:

| Variante | Ids de token idénticos (35 frases) |
|---|---|
| fp32 ONNX vs. transformers fp32 | 35/35 |
| int8 ONNX vs. transformers fp32 | 31/35 |

La model card indica explícitamente que la paridad int8 se reporta a título informativo y no constituye un criterio de publicación.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 12 GB para los grafos fp32 completos (11,91 GB de pesos) y aproximadamente 3 GB para los grafos int8 (3,00 GB), más overhead de activaciones y del runtime.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU con 16 GB o más (RTX 4090, A100, H100) puede alojar la variante fp32; la variante int8 cabe en GPUs de 8-12 GB.
- Cabe en GPU de consumo: la variante int8 es viable en GPUs de consumo con 8 GB o más de VRAM; la fp32 requiere al menos 12-16 GB.
- Opciones de despliegue: ONNX Runtime mediante `optimum.onnxruntime.ORTModelForSeq2SeqLM`; también es posible usar ONNX Runtime directamente o servidores compatibles con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La presencia de `decoder_with_past_model` permite decodificación con caché, lo que reduce el coste por token generado frente a recalcular el decoder completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| TigreGotico/IbRo-nllb-onnx | 1.300 M | no disponible | es, ast, an, oc, gl, ca, val | apache-2.0 | ONNX (fp32, int8) |
| Transducens/IbRo-nllb | 1.300 M | no disponible | es, ast, an, oc, gl, ca, val | apache-2.0 | safetensors (transformers) |
| NLLB-200 1.3B (Meta) | 1.300 M | no disponible | 200 idiomas (sin tokens específicos para arg, arn, val) | CC-BY-NC 4.0 | safetensors |

La comparativa se limita a estos tres modelos porque la información disponible no incluye otros sistemas especializados en las mismas variedades lingüísticas. La diferencia principal frente a NLLB-200 original es la incorporación de tokens para aragonés, aranés y valenciano y el ajuste fino para los pares ibéricos; frente al checkpoint original de Transducens, esta versión cambia el formato a ONNX y añade cuantización int8.

## Limitaciones y advertencias

- La model card advierte que la conversión y la verificación fueron realizadas por un pipeline automatizado (Claude Opus 5.5 vía Claude Code) y que ninguna persona ha revisado la tarjeta del modelo.
- La paridad int8 no es perfecta: 31 de 35 frases coinciden con el modelo original en ids de token, por lo que pueden aparecer diferencias en la salida.
- El token `arn_Latn` usa el código ISO 639-3 `arn`, que en realidad corresponde al mapudungun; en este modelo significa aranés (occitano de la Val d'Aran). Esto puede causar confusión en herramientas que interpreten códigos ISO.
- Los tokens añadidos (`arg_Latn`, `arn_Latn`, `val_Latn`) no siguen el patrón `len(spm) + 1 + position` en `additional_special_tokens`; deben leerse de `added_tokens.json` o `tokenizer.json`.
- No existe `decoder_model_merged.onnx`; `from_pretrained` muestra un aviso y recurre a los grafos separados.
- Los archivos `.onnx_data` deben descargarse junto con su `.onnx` correspondiente; el grafo no carga sin ellos.
- El modelo está especializado en un conjunto reducido de variedades ibéricas; no es un traductor multilingüe general y su rendimiento fuera de esos pares no está documentado.
- No se documentan sesgos específicos, tasas de alucinación ni evaluaciones de calidad de traducción (BLEU, COMET) en la información disponible.
- La licencia apache-2.0 del modelo original se mantiene; la exportación a ONNX no altera la licencia, según indica la model card.
- El tamaño del repositorio (15,0 GB) y la necesidad de descargar pesos externos pueden complicar el despliegue en entornos con almacenamiento limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TigreGotico/IbRo-nllb-onnx
- Modelo base: https://huggingface.co/Transducens/IbRo-nllb
- Repositorio de optimum: https://github.com/huggingface/optimum
- ONNX Runtime: https://onnxruntime.ai/
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios adicionales ni demos.
