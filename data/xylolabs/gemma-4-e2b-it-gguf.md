# Xylolabs/gemma-4-E2B-it-GGUF

## Resumen

Gemma 4 E2B IT es un modelo de lenguaje de Google, aquí distribuido en formato GGUF por Xylolabs para su uso con llama.cpp en CUDA, Metal o CPU. Se trata de la variante "E2B" de la familia Gemma 4, con 4.647.450.147 parámetros totales según los pesos en safetensors del modelo base, y está afinado para instrucciones (IT), lo que lo hace adecuado para conversación y tareas guiadas por prompt.

Esta ficha cubre específicamente la cuantización GGUF publicada por Xylolabs, que ofrece siete archivos entre Q2_K (2,33 GB) y Q6_K (4,38 GB), generados con imatrix y con métricas de fidelidad frente a BF16 publicadas por el autor. La relevancia de esta publicación radica en que permite ejecutar un modelo de casi 4.650 millones de parámetros en GPU de consumo con pérdidas de calidad medibles y documentadas, algo poco habitual en cuantizaciones de terceros.

El modelo base es `google/gemma-4-E2B-it`, con licencia Apache 2.0 y soporte declarado de inglés y coreano. La model card no detalla arquitectura interna, longitud de contexto nativa ni composición del dataset de entrenamiento; los datos disponibles se limitan a los archivos, las métricas de cuantización y las instrucciones de ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4, familia de Google; detalles internos no publicados en la información disponible) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible |
| Longitud de contexto | 128K según la tabla de hardware del autor (no confirmado en la model card del modelo base) |
| Tipos de cuantizacion | Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, IQ3_M, Q2_K |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. La familia Gemma 4 de Google corresponde a transformers decoder-only, pero la model card de esta cuantización no detalla número de capas, dimensión oculta, mecanismos de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

Lo que sí está documentado es el proceso de cuantización: Xylolabs ha generado los GGUF con imatrix (matriz de importancia) y publica métricas de divergencia KL y precisión top-1 frente a BF16 sobre WikiText-2, un conjunto de chat y un conjunto held-out. Los archivos requieren llama.cpp release b12531 o posterior. El autor incluye una comparativa con cuantizaciones de Unsloth sobre el mismo modelo base, en la que sus Q4_K_M y Q5_K_M muestran menor KL que los equivalentes de Unsloth (0,025646 frente a 0,153658 en Q4_K_M sobre WikiText-2), lo que sugiere un pipeline de cuantización con imatrix más cuidado.

## Capacidades

- Generación de texto conversacional en inglés y coreano, con plantilla de chat integrada (requiere `--jinja` en llama.cpp).
- Modo thinking opcional: se puede desactivar con `--chat-template-kwargs '{"enable_thinking":false}'` para respuestas directas.
- Afinado para instrucciones (IT), orientado a seguir prompts y mantener conversaciones multi-turno.
- Compatible con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue tras una API compatible con OpenAI.
- Ejecución en CPU, CUDA y Metal mediante llama.cpp y `llama-server`.
- No se documentan capacidades de visión, audio, tool calling ni agentes en la información disponible.

## Casos de uso

- Asistente conversacional local en estación de trabajo: con Q4_K_M (3,11 GB) cabe en cualquier GPU de 8 GB o incluso en CPU con RAM suficiente, permitiendo un chatbot privado sin conexión externa.
- Despliegue en portátil con GPU de consumo: el archivo IQ4_XS (2,98 GB) mantiene un 94,66% de top-1 en held-out y deja margen de VRAM para contexto largo en tarjetas de 8-12 GB.
- Servicio de inferencia ligero con `llama-server`: al ser compatible con endpoints, se puede exponer una API HTTP para integrarla en aplicaciones internas con requisitos de latencia moderados.
- Procesamiento por lotes en CPU: los archivos Q2_K e IQ3_M (2,33-2,37 GB) permiten ejecutar el modelo en servidores sin GPU para tareas de clasificación, resumen o generación de borradores donde la calidad no sea crítica.
- Prototipado de aplicaciones en inglés y coreano: los dos idiomas declarados cubren casos de atención al cliente o generación de contenido para mercados coreano-parlantes.
- Evaluación comparativa de cuantizaciones: las métricas KL y top-1 publicadas permiten a un equipo elegir el archivo con el mejor compromiso tamaño/calidad para su hardware concreto antes de desplegar.
- Respuestas directas sin cadena de pensamiento: desactivando `enable_thinking` se obtienen salidas más cortas y rápidas, útil en interfaces de chat donde la latencia percibida importa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de cuantización frente a BF16:

| Cuantización | Tamaño | WikiText-2 KL | WikiText-2 top-1 | Chat KL | Chat top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q2_K | 2,325 GB | 0,110754 | 87,946% | 0,086295 | 91,814% | 0,112531 | 89,471% |
| IQ3_M | 2,373 GB | 0,099355 | 88,196% | 0,076995 | 92,255% | 0,099136 | 90,275% |
| IQ4_XS | 2,983 GB | 0,033687 | 93,103% | 0,024051 | 95,608% | 0,029111 | 94,657% |
| Q4_K_S | 3,044 GB | 0,029542 | 93,706% | 0,019518 | 96,284% | 0,024407 | 95,118% |
| Q4_K_M | 3,107 GB | 0,025646 | 94,147% | 0,016835 | 96,225% | 0,020722 | 95,569% |
| Q5_K_M | 3,356 GB | 0,014401 | 95,515% | 0,011227 | 97,118% | 0,013787 | 96,382% |
| Q6_K | 4,384 GB | 0,008152 | 96,760% | 0,005417 | 98,049% | 0,007210 | 97,422% |

El autor incluye además una comparativa con cuantizaciones de Unsloth del mismo modelo base, en la que sus archivos presentan sistemáticamente menor KL y mayor top-1 para tamaños equivalentes (por ejemplo, Q4_K_M propio: KL 0,025646 frente a Unsloth Q4_K_M: 0,153658 en WikiText-2).

## Requisitos de hardware

- VRAM estimada: entre 2,3 GB (Q2_K) y 4,4 GB (Q6_K) solo para los pesos; el contexto adicional consume VRAM proporcionalmente.
- GPU recomendadas por el autor: RTX 4090 y RTX 3090 (24 GB) con Q6_K y contexto de 128K; RTX 5090 (32 GB) con Q6_K y 128K; RTX 6000 Ada o 2 x 24 GB (48 GB) con Q6_K y 128K; H100 (80 GB) con Q6_K.
- Cabe en GPU de consumo: sí, desde tarjetas de 8 GB con Q4_K_M o IQ4_XS, y en CPU con RAM suficiente para los archivos de 2,3-4,4 GB.
- Opciones de despliegue: llama.cpp (release b12531 o posterior), con `llama-cli` y `llama-server`; soporte de CUDA (`-DGGML_CUDA=ON`) y Metal. No se documentan otras opciones como vLLM, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| Gemma 4 E2B IT (esta ficha, GGUF Xylolabs) | 4.647.450.147 | 128K (según tabla del autor) | Apache 2.0 | GGUF | Cuantizaciones con imatrix y métricas KL publicadas |
| Gemma 4 E2B IT (cuantizaciones Unsloth) | 4.647.450.147 | no disponible | Apache 2.0 | GGUF | Mismo modelo base; KL y top-1 inferiores según la comparativa del autor |
| Modelo base google/gemma-4-E2B-it | 4.647.450.147 | no disponible | Apache 2.0 | safetensors | Pesos BF16 originales, referencia de calidad |

No se dispone de información sobre otros modelos de tamaño y categoría comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Solo se declaran inglés y coreano; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Los archivos Q2_K e IQ3_M pierden calidad de forma notable (top-1 en held-out de 89,47% y 90,28% frente a 97,42% de Q6_K); no son recomendables para producción sensible a la precisión.
- No hay datos de benchmarks de tareas, por lo que no se puede evaluar su rendimiento en razonamiento, código o matemáticas a partir de la información disponible.
- El modo thinking está activado por defecto en la plantilla de chat; si no se desactiva, las respuestas pueden ser más largas y lentas de lo esperado.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan medidas específicas de mitigación.
- Sesgos: no documentados en la model card.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Google y de los pesos originales.
- Requiere llama.cpp b12531 o posterior; versiones anteriores pueden no cargar correctamente estos GGUF.
- El repositorio ocupa 21,6 GB, aunque cada archivo individual es mucho menor; hay que descargar solo el archivo necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia: https://huggingface.co/Xylolabs/gemma-4-E2B-it-GGUF/blob/main/LICENSE
- llama.cpp (commit referenciado): https://github.com/ggml-org/llama.cpp/tree/e4b620af19f02960dea7a3a81de7c5805aa3a333
- Repositorio de Xylolabs (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
