# Xylolabs/gemma-4-12B-it-GGUF

## Resumen

Gemma 4 12B Unified GGUF es una colección de cuatro cuantizaciones GGUF del modelo `google/gemma-4-12B-it`, publicadas por Xylolabs como referencia de precisión para sus propios exports de Tenstorrent Tensix. El repositorio no entrena ni modifica el modelo: convierte el checkpoint bf16 original a formatos Q3_K_M-imat, IQ4_XS, IQ4_XS-imat y Q5_K_M mediante la herramienta `quantize` de llama.cpp, preservando 667 tensores de las 48 capas del decodificador de texto, el tokenizer y la plantilla de chat original.

La relevancia de esta publicación es doble. Por un lado, ofrece al ecosistema llama.cpp una referencia cuantizada verificada del Gemma 4 12B instruct, con métricas de divergencia (KL medio y acuerdo top-1) frente al bf16 almacenado. Por otro, sirve como banco de pruebas reproducible para comparar la fidelidad de las cuantizaciones GGUF estándar contra implementaciones alternativas sobre hardware no-GPU.

El modelo base tiene 11.907.350.576 parámetros (aproximadamente 11,9B) y una arquitectura híbrida de atención con 48 capas, de las cuales 8 usan atención completa y 40 emplean una ventana deslizante de 1.024 tokens. Las cuantizaciones ocupan entre 6,087 GB y 8,547 GB, lo que permite ejecutarlo en GPUs de consumo de 24 GB con contexto muy amplio. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 Unified), atención híbrida: 8 capas full attention + 40 capas sliding window 1.024 tokens |
| Parametros totales | 11.907.350.576 (11,9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 256K segun la tabla de hardware del autor; metadatos originales sin modificar |
| Tipos de cuantizacion | Q3_K_M-imat, IQ4_XS, IQ4_XS-imat, Q5_K_M |
| Idiomas soportados | Inglés (en), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-12B-it` es un transformer decoder-only de 11,9B parámetros con una configuración de atención híbrida poco habitual: de las 48 capas del decodificador de texto, 8 mantienen atención completa (1 KV head, tamaño de cabeza 512) y 40 aplican una ventana deslizante de 1.024 tokens. Esta combinación reduce el coste del KV cache en contextos largos, ya que solo una fracción de las capas acumula estado de atención completo.

Esta publicación concreta no incluye entrenamiento ni fine-tuning: Xylolabs parte del checkpoint bf16 de Google y aplica la herramienta `quantize` de llama.cpp. Los archivos `-imat` conservan matrices de importancia preexistentes (los nombres de calibración son solo etiquetas de metadatos; no se incluye dataset de calibración). En las cuatro variantes, la matriz compartida de embedding/output se almacena en Q6_K y las normas y constantes RoPE se mantienen en float32, lo que eleva el número medio de bits por encima del preset nominal. Los encoders de visión y audio del modelo base se omiten: solo se preserva el decodificador de texto.

## Capacidades

- Generación de texto conversacional en inglés y coreano con plantilla de chat original preservada.
- Modo de razonamiento (thinking mode) activable o desactivable mediante `--chat-template-kwargs '{"enable_thinking":true/false}'`.
- Ejecución local en CPU y GPU mediante llama.cpp, sin dependencias de frameworks de deep learning.
- Compatible con endpoints (tag `endpoints_compatible`) para despliegue como servicio de generación.
- Al omitirse los encoders de visión y audio, las cuantizaciones son exclusivamente texto: no procesan imágenes ni audio.
- Soporte de cuantizaciones con y sin importance matrix para ajustar el compromiso precisión/memoria.

## Casos de uso

- Inferencia local en GPU de consumo: con 8,547 GB (Q5_K_M) cabe en una RTX 4090 o RTX 3090 de 24 GB dejando espacio para el KV cache y alcanzando contextos de hasta 256K según la tabla del autor, útil para asistentes personales y prototipado sin cloud.
- Validación de pipelines de cuantización: los datos de KL medio y acuerdo top-1 frente a bf16 permiten usar estos archivos como referencia para verificar conversiones propias o comparar backends alternativos (por ejemplo, Tensix frente a llama.cpp).
- Despliegue en entornos con memoria limitada: la variante Q3_K_M-imat (6,087 GB) permite ejecutar un modelo de 11,9B en GPUs de 12-16 GB, a costa de un KL medio de 0,999 y un acuerdo top-1 del 68,10%.
- Atención al cliente multilingüe inglés-coreano: el modelo conserva la plantilla de chat instructiva y soporta conversaciones multi-turno con contexto largo gracias a las capas de atención completa combinadas con sliding window.
- Generación de texto por lotes en servidores sin GPU dedicada: llama.cpp permite ejecución en CPU con los mismos GGUF, adecuado para tareas de clasificación, resumen o extracción en pipelines offline.
- Pruebas de regresión de calidad: el conjunto de 33 respuestas más 7 rechecks con thinking activado documentado por el autor sirve como banco de pruebas reproducible para detectar degradaciones al cambiar de cuantización o de versión de llama.cpp.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (divergencia frente al bf16 almacenado, 16 secuencias de 1.024 tokens, 16.232 posiciones evaluadas en inglés y coreano):

| Cuantizacion | KL medio | KL / Q4_K_M | Acuerdo top-1 | Respuestas correctas |
|---|---:|---:|---:|---|
| Q3_K_M-imat | 0,999333 | 1,134x | 68,10% | 33/33 + 7/7 thinking |
| IQ4_XS-imat | 0,695671 | 0,789x | 73,42% | 33/33 + 7/7 thinking |
| IQ4_XS | 0,983883 | 1,116x | 68,49% | 33/33 + 7/7 thinking |
| Q5_K_M | 0,367732 | 0,417x | 80,96% | 33/33 + 7/7 thinking |
| Q4_K_M (referencia actual) | 0,881231 | 1,000x | 69,79% | 33/33 + 7/7 thinking |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: tamaño del archivo + KV cache en f16 al contexto elegido + aproximadamente 2 GB de overhead de runtime, todo ello por debajo del 90% de la memoria disponible. Las 40 capas con sliding window añaden un cache fijo de unos 0,3 GB.
- GPUs de consumo: RTX 4090 y RTX 3090 (24 GB) ejecutan Q5_K_M con contexto de hasta 256K; RTX 5090 (32 GB) idem.
- GPUs profesionales: RTX 6000 Ada o 2 x 24 GB (48 GB) y H100 (80 GB) soportan Q5_K_M a 256K; en configuraciones de dos tarjetas es necesario repartir capas entre ellas. RTX PRO 6000 Blackwell (96 GB) también listada por el autor.
- Despliegue: llama.cpp (versión verificada v0.9.0 en el ejemplo de la model card); el tag `endpoints_compatible` sugiere compatibilidad con servidores de endpoints basados en llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---:|---|---|---|
| Gemma 4 12B it GGUF (Xylolabs) | 11,9B | hasta 256K segun hardware | GGUF (4 cuantizaciones) | Apache 2.0 | Solo decodificador de texto; KL y top-1 medidos frente a bf16 |
| Gemma 4 12B it (base, google) | 11,9B | no disponible | safetensors bf16 | Apache 2.0 | Incluye encoders de visión y audio; requiere ~24 GB en bf16 |
| Q4_K_M del mismo modelo | 11,9B | hasta 256K segun hardware | GGUF | Apache 2.0 | Referencia interna del autor: KL 0,881231, top-1 69,79% |

No se dispone de datos de benchmarks estándar para comparar el rendimiento absoluto con otras familias de modelos de tamaño similar.

## Limitaciones y advertencias

- Solo texto: los encoders de visión y audio del modelo base se han eliminado, por lo que estas cuantizaciones no admiten entradas multimodales.
- Idiomas limitados a inglés y coreano según los metadatos; el rendimiento en castellano no está documentado y no debería asumirse.
- Riesgo de alucinación inherente al modelo base; las cuantizaciones de baja precisión (Q3_K_M-imat, IQ4_XS) degradan el acuerdo top-1 hasta el 68%, lo que puede aumentar errores en tareas sensibles.
- Las matrices de importancia de los archivos `-imat` proceden de calibraciones previas no incluidas; su reproducibilidad exacta no está garantizada.
- El ejemplo de la model card limita explícitamente el contexto a 2.048 tokens con `-c 2048`; el contexto de 256K depende de la memoria disponible y debe configurarse manualmente.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar los términos del modelo base de Google y las políticas de uso aceptable asociadas.
- No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K) que permitan evaluar capacidades absolutas; las métricas disponibles miden solo fidelidad de cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-12B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Documentación GGUF en llama.cpp: https://huggingface.co/docs/hub/gguf-llamacpp
- Código llama.cpp (commit referenciado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio Tensix de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Licencia: https://huggingface.co/Xylolabs/gemma-4-12B-it-GGUF/blob/main/LICENSE
