# Xylolabs/gemma-4-E4B-it-GGUF

## Resumen

Gemma 4 E4B IT GGUF es una colección de cuantizaciones en formato GGUF del modelo google/gemma-4-E4B-it, publicada por Xylolabs para su uso con llama.cpp sobre CUDA, Metal o CPU. El modelo base es un transformer de la familia Gemma 4 de Google, con 7.518.069.290 parámetros totales, afinado para instrucciones y orientado a generación de texto conversacional. Esta ficha se centra en la versión cuantizada, que es la que distribuye el repositorio.

El interés principal de esta publicación reside en la batería de cuantizaciones disponibles (desde Q6_K hasta Q2_K, incluyendo variantes IQ) y, sobre todo, en la tabla de fidelidad frente al modelo BF16 que acompaña a la model card: divergencia KL y acuerdo top-1 medidos con llama.cpp sobre WikiText-2, un conjunto de chat y un conjunto held-out. Esos datos permiten elegir el compromiso entre tamaño y degradación con criterio cuantitativo, algo poco habitual en publicaciones de cuantizaciones.

La licencia es Apache-2.0 según los metadatos del repositorio, y los idiomas declarados son inglés (en) y coreano (ko). El repositorio ocupa 38,5 GB e incluye también cuantizaciones de terceros (Unsloth y otras) a modo de comparación, además de las propias generadas con imatrix.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4; detalles internos no disponibles) |
| Parámetros totales | 7.518.069.290 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 8192`) |
| Tipos de cuantización | Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, IQ3_M, Q2_K (propias); Q8_0 y otras de terceros incluidas a modo comparativo |
| Idiomas soportados | inglés (en), coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base google/gemma-4-E4B-it más allá de que se trata de un transformer de la familia Gemma 4 con 7.518.069.290 parámetros totales. La model card del repositorio cuantizado no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones de atención o decodificación.

Lo que sí documenta el autor es el proceso de cuantización: las variantes propias se generaron con imatrix (según los tags del repositorio) y se evalúan frente al modelo BF16 mediante divergencia KL media y acuerdo top-1, medidos con llama.cpp sobre tres conjuntos: WikiText-2, un conjunto de chat y un conjunto held-out. La model card incluye además cuantizaciones de Unsloth y de otros autores con las mismas métricas, lo que permite comparar el impacto de cada esquema de cuantización sobre la fidelidad. Se recomienda llama.cpp release b12531 o posterior, y se menciona el flag `--chat-template-kwargs '{"enable_thinking":false}'` para desactivar el modo de razonamiento y obtener respuestas directas.

## Capacidades

- Generación de texto conversacional con plantilla de chat (soporte `--jinja` en llama.cpp).
- Modo de razonamiento o "thinking" activable por defecto, desactivable mediante `enable_thinking: false`.
- Conversación multi-turno mediante `llama-server` o `llama-cli`.
- Idiomas: inglés y coreano según los metadatos; no se declaran otros.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que facilita su integración tras una API compatible con OpenAI.
- Ejecución en CUDA, Metal y CPU a través de llama.cpp.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni matemáticas avanzadas.

## Casos de uso

- Despliegue local en estación de trabajo: con la cuantización Q4_K_M (4,98 GB) el modelo cabe en GPUs de consumo con 8 GB de VRAM, lo que permite ejecutar un modelo de 7,5 mil millones de parámetros en local sin depender de servicios en la nube.
- Servicio de chat ligero en CPU: la variante Q2_K (3,64 GB) o IQ3_M (3,72 GB) permite servir conversaciones en servidores sin GPU, aceptando la degradación de fidelidad documentada (KL de 0,117 y 0,102 respectivamente sobre WikiText-2).
- Evaluación de cuantizaciones: la tabla de KL y acuerdo top-1 frente a BF16 sirve para seleccionar el esquema adecuado en función de la tolerancia a la degradación; por ejemplo, Q4_K_M mantiene un 94,02 % de acuerdo top-1 en WikiText-2 frente al 86,63 % de Q2_K.
- Integración en pipelines con API compatible: gracias al tag `endpoints_compatible` y a `llama-server`, puede exponerse tras una interfaz estilo OpenAI para prototipos de asistentes conversacionales.
- Aplicaciones en inglés y coreano: al declarar ambos idiomas, encaja en productos bilingües para esos mercados, aunque no se aportan métricas por idioma.
- Prototipado de asistentes con razonamiento opcional: el flag `enable_thinking` permite alternar entre respuestas directas y respuestas con cadena de razonamiento según la latencia tolerada.
- Pruebas de calidad de cuantización en producción: comparar las variantes propias (imatrix) con las de Unsloth incluidas en la tabla permite decidir qué publicación usar para un mismo tamaño de archivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye métricas de fidelidad de cuantización frente a BF16, medidas con llama.cpp:

| Cuantización | Tamaño | WikiText-2 KL | WikiText-2 top-1 | Chat KL | Chat top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q6_K | 7,073 GB | 0,005638 | 96,961 % | 0,004307 | 98,108 % | 0,004469 | 97,549 % |
| Q5_K_M | 5,482 GB | 0,013250 | 95,319 % | 0,010749 | 96,578 % | 0,011395 | 96,255 % |
| Q4_K_M | 4,977 GB | 0,022757 | 94,020 % | 0,020117 | 95,412 % | 0,019967 | 95,020 % |
| Q4_K_S | 4,845 GB | 0,027684 | 93,275 % | 0,023422 | 95,078 % | 0,024669 | 94,627 % |
| IQ4_XS | 4,715 GB | 0,027604 | 93,299 % | 0,027729 | 94,676 % | 0,026384 | 94,304 % |
| Q3_K_M | 4,058 GB | 0,064535 | 89,745 % | 0,061062 | 91,863 % | 0,061970 | 91,382 % |
| IQ3_M | 3,717 GB | 0,101507 | 87,417 % | 0,086792 | 90,873 % | 0,104041 | 89,147 % |
| Q2_K | 3,643 GB | 0,116908 | 86,627 % | 0,097999 | 90,284 % | 0,114853 | 88,618 % |

Como referencia, la model card incluye también cuantizaciones de terceros con las mismas métricas; por ejemplo, Unsloth Q4_K_M (4,977 GB) obtiene KL de 0,099003 en WikiText-2 y 87,044 % de top-1, frente a los 0,022757 y 94,020 % de la Q4_K_M propia, y Unsloth Q5_K_M (5,482 GB) obtiene 0,032132 y 92,706 % frente a 0,013250 y 95,319 %. Estas cifras sugieren una fidelidad notablemente mayor de las cuantizaciones propias a igual tamaño de archivo, si bien proceden del propio autor y no de una evaluación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más overhead de contexto y caché KV. Con Q4_K_M (4,98 GB) se puede operar en torno a 6-7 GB de VRAM; con Q6_K (7,07 GB), en torno a 8-9 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q4_K_M o Q4_K_S; 12 GB o más para Q5_K_M y Q6_K con contexto amplio. Para mayor throughput, A100 o H100, aunque no se aportan cifras de rendimiento.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 con las cuantizaciones Q4 y Q5; las variantes Q2_K e IQ3_M (3,6-3,7 GB) caben en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp (versión b12531 o posterior) con `llama-cli` o `llama-server`; se indica compilación con `-DGGML_CUDA=ON` para NVIDIA y soporte de Metal en macOS. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La información disponible no incluye comparaciones con otros modelos de la misma categoría. La única comparación posible es entre las distintas cuantizaciones del mismo modelo, que se recoge en la tabla de benchmarks. No se dispone de datos de modelos alternativos de tamaño similar (por ejemplo, otros modelos de 7-8 mil millones de parámetros) para establecer una comparativa de parámetros, contexto o licencia.

| Alternativa | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al ser un modelo afinado para instrucciones, es esperable que herede los sesgos del corpus de entrenamiento del modelo base, pero no se aportan datos.
- Riesgo de alucinación: no se cuantifica en la información disponible.
- Idiomas: solo se declaran inglés y coreano; el rendimiento en castellano no está documentado y no debería asumirse.
- Licencia: Apache-2.0 según los metadatos del repositorio; conviene verificar el archivo LICENSE incluido antes de un uso comercial, ya que la model card enlaza a él.
- Fidelidad de cuantización: las variantes Q2_K e IQ3_M presentan una degradación apreciable (KL de 0,117 y 0,102 en WikiText-2, con top-1 del 86,6 % y 87,4 %); para producción conviene usar Q4_K_M o superior.
- Las métricas de fidelidad proceden del propio autor de la cuantización y no de una evaluación independiente.
- El modo de razonamiento está activado por defecto; en aplicaciones sensibles a latencia debe desactivarse explícitamente con `enable_thinking: false`.
- No se documentan capacidades de tool calling ni de agentes; no deben asumirse sin verificación empírica.
- La longitud de contexto no está especificada; el ejemplo de la model card usa 8192 tokens, pero no se confirma como máximo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E4B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Licencia: https://huggingface.co/Xylolabs/gemma-4-E4B-it-GGUF/blob/main/LICENSE
- llama.cpp (commit referenciado): https://github.com/ggml-org/llama.cpp/tree/e4b620af19f02960dea7a3a81de7c5805aa3a333
- Repositorio de Xylolabs (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
- Paper referenciado en los tags: arXiv:2607.02770 (no verificado en la información disponible)
