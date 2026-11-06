# TigreGotico/madlad400-3b-mt-ast-an-oc_aranes-onnx

## Resumen

`madlad400-3b-mt-ast-an-oc_aranes-onnx` es la exportación a ONNX del modelo `Ugiat/madlad400-3b-mt-ast-an-oc_aranes`, un ajuste fino de `google/madlad400-3b-mt` orientado a la traducción automática hacia asturiano, aragonés y aranés (la variedad del occitano hablada en la Val d'Aran). El modelo base MADLAD-400 es un transformer encoder-decoder de tipo T5 con 3.000 millones de parámetros, entrenado por Google sobre datos multilingües a gran escala. El ajuste fino de Ugiat Technologies añade vocabulario y etiquetas de destino específicas para estas tres lenguas minoritarias, que el tokenizador original de MADLAD-400 no cubre adecuadamente.

La versión que nos ocupa, publicada por TigreGotico, no introduce cambios en los pesos: es una conversión de formato para su uso con ONNX Runtime a través de la librería `optimum`. Se ofrecen dos variantes: grafos en fp32 (19,74 GB en total) y grafos cuantizados dinámicamente a int8 (4,94 GB en total). Esta segunda variante reduce el peso del modelo aproximadamente a una cuarta parte, a costa de una pérdida notable de fidelidad respecto al modelo original.

El interés de esta ficha radica en dos factores. Por un lado, cubre un nicho poco atendido: la traducción automática de calidad hacia lenguas románicas minoritarias de la península ibérica y el sur de Francia. Por otro, la disponibilidad de grafos ONNX int8 facilita el despliegue en entornos sin GPU o con recursos limitados, algo relevante para proyectos de digitalización lingüística con presupuestos ajustados. La model card advierte explícitamente de que la conversión fue automatizada y no ha sido revisada por una persona.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia T5, MADLAD-400) |
| Parametros totales | 3.000 millones (aproximado, heredado de madlad400-3b-mt) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | fp32 (grafos originales) e int8 (cuantizacion dinamica de pesos con `QuantType.QInt8`) |
| Idiomas soportados | ast (asturiano), an (aragonés), oc (occitano), es (español), ca (catalán), en (inglés), fr (francés), multilingual; etiqueta especifica `<2oc_aranes>` para el aranés |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (grafos `.onnx` con ficheros `.onnx_data` asociados) |

## Arquitectura y entrenamiento

El modelo subyacente es MADLAD-400, un transformer encoder-decoder de la familia T5 con 3.000 millones de parámetros. La arquitectura sigue el esquema estándar de T5: encoder bidireccional y decoder autorregresivo, con atención completa en ambas partes y sin mecanismos de atención lineal ni decodificación especulativa. El ajuste fino de Ugiat Technologies parte de `google/madlad400-3b-mt` e introduce tres etiquetas de destino nuevas en el tokenizador SentencePiece: `<2oc_aranes>` (aranés, id 256000), `<2ast>` (asturiano, id 256001) y `<2an>` (aragonés, reaprovechando la etiqueta del modelo base pero reentrenada). Estas piezas no existen en el tokenizador original de MADLAD-400, por lo que es imprescindible usar el tokenizador de este repositorio y no el del modelo base.

La información disponible no detalla la composición del corpus de ajuste fino, el número de tokens utilizados ni si hubo fases de RLHF o DPO. Tampoco se documenta el proceso de entrenamiento más allá de la existencia del checkpoint ajustado. La exportación a ONNX se realizó con `optimum-cli export onnx --task text2text-generation-with-past --no-post-process`, lo que mantiene separados los grafos `decoder_model` y `decoder_with_past_model` en lugar de fusionarlos en un `decoder_model_merged.onnx`. Los pesos originales están en bfloat16, pero los grafos exportados son fp32. La cuantización int8 se aplicó grafo a grafo con `onnxruntime.quantization.quantize_dynamic`, con `EnableSubgraph: True` para cubrir también los subgrafos internos.

## Capacidades

- Traducción automática multilingüe hacia asturiano, aragonés y aranés desde cualquier lengua de origen, sin etiqueta de idioma fuente (solo se etiqueta el destino).
- Traducción hacia occitano estándar mediante la etiqueta `<2oc>`, heredada del modelo base.
- Traducción entre las lenguas principales cubiertas por MADLAD-400 (español, catalán, inglés, francés, entre otras), aunque el ajuste fino está orientado a las tres lenguas minoritarias.
- Generación de texto condicionada a una etiqueta de destino `<2xx>`, siguiendo el esquema de MADLAD-400.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento extendido.
- Capacidad multilingüe limitada al subconjunto de lenguas cubiertas por el tokenizador y el ajuste fino; no es un modelo generalista de propósito abierto.

## Casos de uso

- Traducción de documentación administrativa al aranés: el modelo permite generar versiones en aranés de comunicados, formularios y avisos municipales a partir de originales en catalán o español, usando la etiqueta `<2oc_aranes>`. Es adecuado porque cubre una variedad lingüística que los traductores comerciales rara vez soportan.
- Localización de software al asturiano: con la etiqueta `<2ast>` se pueden traducir cadenas de interfaz, mensajes de error y textos de ayuda desde el inglés o el español, integrándolo en un pipeline de localización que consuma los grafos ONNX int8 en servidores sin GPU.
- Digitalización de prensa local en aragonés: traducción de noticias y comunicados desde el español para medios que publican en aragonés, usando `<2an>`. El modelo está específicamente ajustado para esta lengua, lo que reduce la necesidad de posedición.
- Subtitulado y doblaje de contenido audiovisual: traducción de guiones y subtítulos hacia las tres lenguas objetivo, con la posibilidad de ejecutar el modelo en local (int8) para evitar enviar material sensible a servicios en la nube.
- Investigación en lingüística computacional: evaluación de la calidad de traducción automática en lenguas de bajos recursos, comparando el comportamiento del modelo base MADLAD-400 con el ajuste fino y con la variante int8.
- Despliegue en entornos con recursos limitados: los grafos int8 (4,94 GB en total) permiten ejecutar el modelo en máquinas con 8-16 GB de RAM sin GPU, algo inviable con los grafos fp32 (19,74 GB). Es adecuado para prototipos, demos y proyectos comunitarios con presupuesto reducido.
- Traducción de correspondencia y atención ciudadana: integración en un servicio de atención en lenguas cooficiales, traduciendo consultas y respuestas entre español, catalán, asturiano, aragonés y aranés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU, etc.) en la información disponible. La model card solo reporta una prueba de paridad con el modelo fuente sobre 20 frases, comparando los ids de token generados con decodificación greedy (`num_beams=1`, `do_sample=False`, `max_new_tokens=128`):

| Variante | Ids de token idénticos al modelo fuente |
|---|---|
| fp32 | 20/20 |
| int8 | 7/20 |

La variante int8, por tanto, diverge del modelo fuente en 13 de 20 frases a nivel de token, aunque algunas diferencias son de elección léxica menor (por ejemplo, "ficheru" frente a "artículu", o "comprar" frente a "mercar"). La model card indica explícitamente que la paridad int8 se ofrece a título informativo y no constituye un criterio de publicación.

## Requisitos de hardware

- VRAM estimada para fp32: en torno a 20 GB solo para los pesos, más el espacio para activaciones y caché KV; se recomienda un mínimo de 24-32 GB de VRAM para inferencia cómoda.
- VRAM estimada para int8: en torno a 5 GB para los pesos, más overhead; un mínimo de 8 GB de VRAM es razonable, y puede ejecutarse en CPU con 8-16 GB de RAM.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para fp32; RTX 4090 (24 GB), RTX 4080 (16 GB) o RTX 3090 (24 GB) para int8.
- Cabe en GPU de consumo: sí, la variante int8 cabe en RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070 (12 GB) y superiores. La variante fp32 no cabe en GPU de consumo de 24 GB con margen suficiente.
- Opciones de despliegue: ONNX Runtime mediante `optimum.onnxruntime.ORTModelForSeq2SeqLM`; también es posible servir los grafos con Triton Inference Server o con `onnxruntime-genai` si se adapta el pipeline. No se documenta soporte directo en vLLM, llama.cpp, Ollama ni TGI para este repositorio ONNX concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas objetivo | Licencia | Formato |
|---|---|---|---|---|---|
| `TigreGotico/madlad400-3b-mt-ast-an-oc_aranes-onnx` (este) | 3.000 M | no disponible | ast, an, oc, aranés, es, ca, en, fr | apache-2.0 | ONNX fp32 / int8 |
| `Ugiat/madlad400-3b-mt-ast-an-oc_aranes` | 3.000 M | no disponible | ast, an, oc, aranés, es, ca, en, fr | apache-2.0 | safetensors (bfloat16) |
| `google/madlad400-3b-mt` | 3.000 M | no disponible | 400+ lenguas (incluye ast, an, oc) | apache-2.0 | safetensors |
| `facebook/nllb-200-3.3B` | 3.300 M | 512 tokens | 200 lenguas (incluye ast, oc; aragonés no disponible) | CC-BY-NC-4.0 | safetensors |

El modelo base MADLAD-400 cubre asturiano y occitano, pero su rendimiento en estas lenguas es inferior al de un ajuste específico, y no dispone de etiqueta para aranés. NLLB-200 incluye asturiano y occitano, pero no aragonés ni aranés, y su licencia CC-BY-NC-4.0 restringe el uso comercial. La ventaja principal de este repositorio frente a ambos es la disponibilidad de grafos ONNX int8 listos para desplegar y la cobertura específica del aranés.

## Limitaciones y advertencias

- La conversión a ONNX y la cuantización int8 fueron realizadas por un pipeline automatizado (Claude Opus 5.5 vía Claude Code) y la model card indica explícitamente que ninguna persona ha revisado la ficha. La calidad de la exportación no está auditada de forma independiente.
- La variante int8 solo reproduce los ids de token del modelo fuente en 7 de 20 frases de prueba, lo que implica divergencias frecuentes en la salida. No se recomienda para producción sin una evaluación propia sobre el dominio objetivo.
- El tokenizador del repositorio es obligatorio: el tokenizador de MADLAD-400 no conoce las etiquetas `<2oc_aranes>` ni `<2ast>`, y usarlo produciría resultados incorrectos o degradados.
- El modelo está ajustado específicamente para traducción hacia asturiano, aragonés y aranés; su rendimiento en otras direcciones o lenguas no está documentado y probablemente sea inferior al del modelo base.
- No se documentan sesgos conocidos, pero al ser un ajuste fino sobre un corpus no descrito, existe riesgo de sesgos de dominio (vocabulario administrativo, registro formal) y de infrarrepresentación de variedades dialectales dentro de cada lengua.
- Riesgo de alucinación en traducción: como todo modelo generativo, puede producir contenido no presente en el original, especialmente en frases largas o con terminología especializada.
- La licencia apache-2.0 permite uso comercial, pero se hereda del modelo fuente; conviene verificar las condiciones de `google/madlad400-3b-mt` y del ajuste fino de Ugiat Technologies antes de un despliegue comercial.
- No se documenta la longitud máxima de contexto soportada; MADLAD-400 se entrenó con secuencias de hasta 256 tokens aproximadamente, pero este dato no se confirma en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TigreGotico/madlad400-3b-mt-ast-an-oc_aranes-onnx
- Modelo fuente (ajuste fino): https://huggingface.co/Ugiat/madlad400-3b-mt-ast-an-oc_aranes
- Modelo base original: https://huggingface.co/google/madlad400-3b-mt
- Paper de MADLAD-400: no disponible en la información proporcionada
- Repositorio de `optimum`: no disponible en la información proporcionada
- Documentación de ONNX Runtime: no disponible en la información proporcionada
