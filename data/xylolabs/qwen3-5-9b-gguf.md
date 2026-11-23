# Xylolabs/Qwen3.5-9B-GGUF

## Resumen

Xylolabs/Qwen3.5-9B-GGUF es una conversión a formato GGUF del modelo Qwen3.5-9B desarrollado por Alibaba Qwen, publicada por Xylolabs para su uso con llama.cpp. El repositorio contiene únicamente el archivo `Qwen3.5-9B-Q4_K_M.gguf` (5,780 GB), una cuantización de 4 bits del modelo de texto original. Con 9.197.093.888 parámetros totales, está pensado para inferencia local en hardware de consumo y estaciones de trabajo.

La relevancia de esta conversión radica en su arquitectura híbrida de atención: solo 8 de sus 32 capas emplean atención completa (4 cabezas KV, tamaño de cabeza 256), mientras que el resto mantiene un estado fijo reducido. Esto permite manejar contextos de hasta 256K tokens con un coste de caché KV muy contenido, algo poco habitual en modelos de esta escala. El archivo incluye además el módulo de predicción multi-token (multi-token prediction).

La licencia Apache 2.0 facilita el uso comercial, y el modelo declara soporte para inglés y coreano. El autor de la conversión no está afiliado a Alibaba Qwen, y la model card advierte de que se trata de una cuantización de pesos, no de un modelo entrenado por Xylolabs.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención completa en 8 de 32 capas y estado fijo en el resto; incluye módulo de predicción multi-token |
| Parámetros totales | 9.197.093.888 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 256K tokens (según tabla de hardware de la model card) |
| Tipos de cuantización | Q4_K_M (único archivo publicado); la model card incluye métricas comparativas de otros formatos (Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K_M, IQ3_XXS, Q2_K) |
| Idiomas soportados | inglés (en), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura transformer con un esquema de atención híbrido: de las 32 capas, solo 8 usan atención completa con 4 cabezas KV y tamaño de cabeza 256; las 24 restantes conservan un estado fijo pequeño en lugar de una caché KV completa. Esta combinación reduce drásticamente el consumo de memoria asociado al contexto largo y permite alcanzar ventanas de 256K tokens en GPUs de 24 GB. El archivo GGUF incorpora el módulo de predicción multi-token del modelo original.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base, ya que la model card de esta conversión no los detalla. La model card sí documenta el proceso de conversión y cuantización: los pesos se transformaron a GGUF y se cuantizaron a Q4_K_M, con un archivo NOTICE que atribuye la autoría del modelo fuente a su titular de derechos.

## Capacidades

- Generación de texto conversacional en inglés y coreano.
- Razonamiento multi-turno con ventanas de contexto de hasta 256K tokens.
- Inferencia local mediante llama.cpp con soporte de plantillas Jinja (`--jinja`).
- Compatible con endpoints (etiqueta `endpoints_compatible` en el repositorio).
- Predicción multi-token integrada en el archivo GGUF.
- No se documentan capacidades de visión, audio, tool calling ni agentes en la información disponible.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede mantener diálogos multi-turno extensos gracias a su ventana de 256K tokens, ejecutándose íntegramente en una RTX 4090 o RTX 3090 de 24 GB con el archivo Q4_K_M.
- Procesamiento de documentos largos: resumen y extracción de información sobre contratos, informes o bases de código que superen los 100K tokens, aprovechando la atención híbrida para mantener el coste de memoria bajo.
- Despliegue en estaciones de trabajo sin GPU dedicada de gama alta: con 5,8 GB de pesos, cabe en Mac Studio con memoria unificada y en configuraciones con dos GPUs de 24 GB repartiendo capas.
- Prototipado e investigación: al ser una cuantización Apache 2.0, sirve para experimentar con modelos de 9B en entornos académicos sin restricciones de licencia.
- Aplicaciones en coreano e inglés: traducción, redacción y atención al cliente bilingüe limitada a esos dos idiomas.
- Inferencia en entornos con requisitos de privacidad: al ejecutarse con llama.cpp de forma local, los datos no salen del equipo, adecuado para sectores regulados.
- Evaluación comparativa de cuantizaciones: la model card publica métricas de divergencia KL y acuerdo top-1 frente a BF16, útil para decidir qué formato usar en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye métricas de fidelidad de la cuantización frente a BF16, medidas con llama.cpp:

| Cuantización | Tamaño | KL WikiText-2 | Top-1 WikiText-2 | KL held-out | Top-1 held-out |
|---|---:|---:|---:|---:|---:|
| Q8_0 (llama.cpp) | 9,786 GB | 0,001778 | 98,461% | 0,000961 | 98,539% |
| Q6_K (Unsloth) | 7,458 GB | 0,003474 | 97,402% | 0,002531 | 97,490% |
| Q5_K_M (Unsloth) | 6,578 GB | 0,007391 | 96,534% | 0,005321 | 96,461% |
| **Q4_K_M (este repo)** | **5,780 GB** | **0,039493** | **91,426%** | **0,035054** | **91,775%** |
| IQ4_XS (Unsloth) | 5,169 GB | 0,024093 | 92,961% | 0,023098 | 92,814% |
| Q3_K_M (llama.cpp) | 4,738 GB | 0,127403 | 84,235% | 0,114989 | 85,225% |

El Q4_K_M de este repositorio muestra una divergencia KL de 0,039493 y un acuerdo top-1 del 91,426% en WikiText-2, inferior a otras cuantizaciones de tamaño similar como IQ4_XS de Unsloth (KL 0,024093, top-1 92,961%). Los datos de la model card permiten esta comparación directa entre formatos.

## Requisitos de hardware

- VRAM estimada: 5,8 GB para los pesos en Q4_K_M; hay que sumar la caché KV en f16 para el contexto deseado y unos 2 GB de sobrecarga del runtime. La model card indica que la suma debe caber en el 90% de la memoria disponible.
- GPU recomendadas: RTX 4090, RTX 3090 (24 GB) y RTX 5090 (32 GB) con contexto de 256K según la tabla del autor; también RTX 6000 Ada (48 GB), H100 (80 GB), H200 (141 GB), B200 (192 GB) y B300 (288 GB).
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 con 24 GB, alcanzando 256K de contexto según la model card.
- Memoria unificada: Mac Studio M5 Max y M5 Ultra (128-512 GB) y DGX Spark (128 GB) soportan 256K de contexto.
- Despliegue: llama.cpp (build enlazado en la model card o posterior) mediante `llama-cli -m Qwen3.5-9B-Q4_K_M.gguf --jinja`. No se documentan otras opciones como vLLM, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.5-9B-GGUF (Q4_K_M) | 9,2B | 256K | GGUF | Apache 2.0 | KL WikiText-2 0,039493; top-1 91,426% |
| Qwen/Qwen3.5-9B (BF16) | 9,2B | 256K | safetensors | Apache 2.0 | Modelo base de referencia; sin métricas de tarea publicadas en esta ficha |
| Cuantizaciones Unsloth del mismo modelo (Q4_K_M) | 9,2B | 256K | GGUF | Apache 2.0 | 5,681 GB; KL 0,017267; top-1 94,142% |
| Cuantizaciones Unsloth del mismo modelo (IQ4_XS) | 9,2B | 256K | GGUF | Apache 2.0 | 5,169 GB; KL 0,024093; top-1 92,961% |

No se dispone de información sobre otros modelos de 9B comparables (por ejemplo, de otras familias) en los datos proporcionados.

## Limitaciones y advertencias

- Solo se publica un archivo Q4_K_M; no hay variantes de mayor precisión en este repositorio, y el Q4_K_M muestra una fidelidad inferior a otras cuantizaciones de 4 bits según las métricas del propio autor.
- Idiomas limitados a inglés y coreano; el rendimiento en castellano no está documentado.
- No se documentan capacidades de tool calling, agentes, visión o audio; no deben asumirse.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay evaluaciones de fiabilidad publicadas en esta ficha.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la conversión (Xylolabs) no está afiliado a Alibaba Qwen; conviene revisar el archivo NOTICE y la licencia del modelo base.
- Requiere un build de llama.cpp igual o posterior al enlazado en la model card; versiones anteriores pueden no cargar el módulo de predicción multi-token.
- El contexto de 256K depende del hardware y de la caché KV; en configuraciones con menos memoria hay que reducirlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia: https://huggingface.co/Xylolabs/Qwen3.5-9B-GGUF/blob/main/LICENSE
- Build de llama.cpp recomendado: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
