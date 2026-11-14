# Xylolabs/gemma-4-12B-it-GGUF

## Resumen

Gemma 4 12B Unified GGUF text decoder es una exportación cuantizada en formato GGUF del modelo google/gemma-4-12B-it, publicada por Xylolabs. El modelo base es un transformer de 11.907.350.576 parámetros (aproximadamente 11,9 mil millones) desarrollado por Google, y esta versión preserva únicamente el decodificador de texto: se han omitido los codificadores de visión y audio del modelo Unified original. El resultado son cuatro ficheros GGUF listos para su uso con llama.cpp, con 667 tensores provenientes de las 48 capas del decodificador de texto, el tokenizer y la plantilla de chat original.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar localmente un modelo de ~12B con licencia Apache 2.0 y soporte de inglés y coreano, sin necesidad de infraestructura de GPU de centro de datos. Las cuantizaciones van desde Q3_K_M (6,087 GB) hasta Q5_K_M (8,547 GB), con métricas de divergencia KL y acuerdo top-1 medidas frente al pase BF16 de referencia, lo que permite elegir el compromiso entre tamaño y fidelidad de forma informada.

No se trata de un modelo nuevo entrenado por Xylolabs: la model card indica explícitamente que no se realizó ningún entrenamiento, calibración ni cuantización nueva para la publicación, sino que se reutilizan resultados de importance matrix existentes. El contexto original del modelo base no se ha modificado en los metadatos, aunque el ejemplo de uso limita la ventana a 2.048 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decodificador de texto de Gemma 4 Unified, 48 capas) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la ficha; los metadatos originales no se modifican, el ejemplo de llama.cpp usa 2.048 tokens y las evaluaciones usan 8.192 tokens |
| Tipos de cuantizacion | Q3_K_M (imat), IQ4_XS (imat), IQ4_XS, Q5_K_M |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

| Fichero | Tamano descarga (GB) | Bits medios por peso | Tipos de tensor |
|---|---:|---:|---|
| gemma-4-12B-it-Q3_K_M-imat.gguf | 6,087 | 4,079 | F32: 338, Q3_K: 192, Q4_K: 131, Q5_K: 5, Q6_K: 1 |
| gemma-4-12B-it-IQ4_XS-imat.gguf | 6,635 | 4,447 | F32: 338, IQ4_XS: 328, Q6_K: 1 |
| gemma-4-12B-it-IQ4_XS.gguf | 6,691 | 4,484 | F32: 338, IQ4_XS: 322, Q5_K: 6, Q6_K: 1 |
| gemma-4-12B-it-Q5_K_M.gguf | 8,547 | 5,732 | F32: 338, Q5_K: 284, Q6_K: 45 |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo decodificador con 48 capas de texto, según se desprende del recuento de tensores de la exportación. La matriz compartida de embedding/salida se almacena en Q6_K en los cuatro ficheros, y las normas y constantes RoPE conservan valores float32 (338 tensores F32 en cada variante), lo que eleva los bits medios por encima del nombre del preset. Esta decisión de precisión mixta es habitual en cuantizaciones de calidad y explica que, por ejemplo, Q3_K_M-imat tenga 4,079 bits medios en lugar de los ~3 bits nominales.

No hay información en la model card sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base usó RLHF o DPO. Xylolabs declara explícitamente que no se realizó entrenamiento, calibración ni cuantización nueva para esta publicación: los ficheros `-imat` conservan resultados de importance matrix existentes, y los nombres de calibración relativa son etiquetas de metadatos sin dataset asociado. La innovación técnica de esta ficha es, por tanto, la propia conversión y preservación de fidelidad, no una arquitectura novedosa.

## Capacidades

- Generación de texto conversacional en inglés y coreano, con plantilla de chat original preservada.
- Modo de razonamiento (thinking) configurable: el ejemplo de llama.cpp usa `--chat-template-kwargs '{"enable_thinking":false}'`, y las evaluaciones incluyen 7 rechecks con thinking activado.
- Compatible con endpoints (tag `endpoints_compatible`), lo que sugiere integración con infraestructuras de inferencia estándar.
- Uso mediante llama.cpp con `--jinja` para el renderizado de la plantilla de chat.
- Capacidades de visión y audio: no disponibles en esta exportación, ya que los codificadores correspondientes se han omitido.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local: con 6-8,5 GB de pesos, el modelo puede ejecutarse en una estación de trabajo con GPU de consumo para conversaciones multi-turno en inglés o coreano, usando la plantilla de chat original y `--jinja`.
- Prototipado de aplicaciones de razonamiento: el soporte de thinking mode permite alternar entre respuestas directas y cadenas de razonamiento, útil para validar pipelines de agentes antes de escalar a modelos mayores.
- Despliegue en entornos con restricciones de memoria: la variante Q3_K_M-imat (6,087 GB) es adecuada para hardware con VRAM limitada, aceptando una divergencia KL de 0,999 frente a BF16.
- Evaluación comparativa de cuantizaciones: las métricas KL y acuerdo top-1 publicadas permiten a un equipo elegir la variante según su tolerancia a la degradación, sin tener que medir por su cuenta.
- Generación de texto en coreano: uno de los dos idiomas declarados, con datos de evaluación que cubren texto plano y chat en inglés/coreano.
- Integración en pipelines de CI con llama.cpp: el ejemplo de CLI verificado con llama.cpp v0.9.0 sirve como test de humo reproducible para validar que un fichero descargado funciona antes de desplegarlo.

## Benchmarks y rendimiento

La model card no publica benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Los datos disponibles son métricas de fidelidad de cuantización frente al pase BF16 de referencia, medidas sobre 16 secuencias de 1.024 tokens (16.232 posiciones evaluadas) en inglés y coreano, texto plano y chat.

| Variante | KL media | KL / Q4_K_M | Acuerdo top-1 |
|---|---:|---:|---:|
| Q3_K_M-imat | 0,999333 | 1,134× | 68,10% |
| IQ4_XS-imat | 0,695671 | 0,789× | 73,42% |
| IQ4_XS | 0,983883 | 1,116× | 68,49% |
| Q5_K_M | 0,367732 | 0,417× | 80,96% |
| Q4_K_M (referencia actual) | 0,881231 | 1,000× | 69,79% |

Las cuatro variantes superan la puerta de respuestas relativas: 33/33 respuestas correctas más 7/7 rechecks con thinking activado, sin pérdidas contabilizadas ni respuestas rotas. El BF16 almacenado y el Q4_K_M actual también responden 33/33 más 7/7. Todas las ratios KL quedan por debajo de 1,5×. No se reportan datos de velocidad (throughput o latencia) en la información disponible.

## Requisitos de hardware

- VRAM estimada para pesos: 6,087 GB (Q3_K_M-imat), 6,635 GB (IQ4_XS-imat), 6,691 GB (IQ4_XS) y 8,547 GB (Q5_K_M), según los tamaños de descarga indicados.
- La model card indica que la exportación necesita unos 8,53 GB de memoria de dispositivo para la elección de pesos GGUF más grande, más espacio para la caché KV y los buffers.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, las variantes de 6-8,5 GB encajan en GPU de consumo con 12-16 GB de VRAM, pero no se confirma ningún modelo concreto.
- Despliegue: llama.cpp (verificado con v0.9.0 en el ejemplo de CLI). No se mencionan vLLM, TGI, Ollama ni otras opciones.
- Latencia y throughput: no disponibles; la model card declara explícitamente que la velocidad no se reporta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Xylolabs/gemma-4-12B-it-GGUF | 11,9B | no disponible | Apache 2.0 | GGUF | Solo decodificador de texto; 4 cuantizaciones |
| google/gemma-4-12B-it (base) | 11,9B | no disponible | Apache 2.0 | no disponible | Modelo Unified completo, incluye visión y audio |
| Otras cuantizaciones GGUF de Gemma 4 12B | 11,9B | no disponible | Apache 2.0 | GGUF | No se dispone de datos específicos en la información proporcionada |

No se dispone de información sobre modelos alternativos de la misma categoría con datos verificables en la documentación consultada, por lo que la comparativa se limita al modelo base y a la categoría genérica de cuantizaciones GGUF.

## Limitaciones y advertencias

- Esta exportación omite los codificadores de visión y audio: no es un modelo multimodal, a pesar de que el base se denomine "Unified".
- Solo soporta inglés y coreano según los metadatos; el rendimiento en castellano no está evaluado ni declarado.
- Las métricas de fidelidad se basan en 16 secuencias de 1.024 tokens y 33 respuestas cortas; la model card advierte que una integración real requiere su propia evaluación de tareas.
- No se reportan datos de velocidad, por lo que el rendimiento en producción debe medirse localmente.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; no hay sección de limitaciones del modelo base en esta ficha.
- La licencia Apache 2.0 se declara según la model card original de Google; el uso comercial está permitido bajo esos términos, pero se recomienda revisar el fichero LICENSE y NOTICE incluidos.
- El modelo se proporciona "as is", sin garantía ni respaldo del upstream (Google).
- Los ficheros `-imat` conservan results de importance matrix existentes; no se realizó calibración nueva, lo que limita la reproducibilidad del proceso de cuantización.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-12B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia Google Gemma: https://ai.google.dev/gemma/apache_2
- Repositorio de código llama.cpp: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Documentación GGUF con llama.cpp: https://huggingface.co/docs/hub/gguf-llamacpp
- Repositorio Xylolabs (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
