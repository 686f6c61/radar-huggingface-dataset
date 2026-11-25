# Xylolabs/Qwen2.5-14B-GGUF

## Resumen

Xylolabs/Qwen2.5-14B-GGUF es una cuantización en formato GGUF del modelo base Qwen2.5-14B, publicada por Xylolabs para su ejecución con llama.cpp. El modelo original, desarrollado por Alibaba Qwen, es un transformer denso de 14.770.033.664 parámetros (aproximadamente 14,8 mil millones) entrenado sobre un corpus multilingüe y orientado a generación de texto. Esta release concreta no incluye el modelo instruct ni el chat template: se trata de los pesos del modelo base, pensados para continuación de texto y como punto de partida para fine-tuning o evaluación.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de 14B en hardware de consumo: el único fichero publicado, `Qwen2.5-14B-Q4_K_M.gguf`, ocupa 8.988 GB y, según la model card, cabe en una RTX 4090 o RTX 3090 de 24 GB con una ventana de contexto de 32K. El autor documenta además métricas de degradación por cuantización (KL divergence y top-1 frente a BF16), lo que permite valorar el coste de precisión de esta conversión concreta.

La licencia Apache 2.0 del modelo base se mantiene en esta redistribución, lo que facilita su uso comercial. No obstante, conviene subrayar que es un modelo base: no está alineado con instrucciones ni con diálogo, y el autor solo declara soporte para inglés y coreano en las etiquetas del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen2.5-14B) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32K en RTX 4090/3090 (24 GB); hasta 128K en GPU de 48 GB o más, según la tabla de hardware del autor |
| Tipos de cuantizacion | Q4_K_M (único fichero publicado) |
| Idiomas soportados | en, ko (según etiquetas del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Esta release es una conversión y cuantización del modelo base Qwen/Qwen2.5-14B, no un entrenamiento nuevo. La arquitectura subyacente es un transformer denso de aproximadamente 14,8 mil millones de parámetros; la model card de esta redistribución no detalla la composición del dataset original, el número de tokens de entrenamiento ni si hubo fases de RLHF o DPO, por lo que esos datos deben consultarse en la release original de Qwen. La innovación técnica documentada aquí es exclusivamente el proceso de cuantización: conversión de los pesos a GGUF y cuantización a Q4_K_M, verificada con el build de llama.cpp `cd959bae99ff4bed22bef2604f45241c09bbb8c8`.

El autor publica una tabla de degradación frente a BF16 medida con llama.cpp. Para Q4_K_M reporta una KL de 0,055209 en WikiText-2 con top-1 del 91,363 %, y una KL de 0,016457 en un conjunto held-out con top-1 del 94,147 %. Como referencia, el Q8_0 de llama.cpp alcanza KL 0,001566 y top-1 98,240 % en WikiText-2. Esto sitúa a esta cuantización en un compromiso razonable entre tamaño (8,988 GB) y fidelidad, aunque con una pérdida de precisión medible respecto a cuantizaciones de mayor bit-width.

## Capacidades

- Generación de texto por continuación de prefijo: el modelo es un base model, pensado para completar texto a partir de un prompt, no para seguir instrucciones.
- Razonamiento y conocimiento general heredados del modelo base Qwen2.5-14B (sin datos de benchmarks en esta release).
- Capacidad multilingüe limitada, según las etiquetas del repositorio, a inglés y coreano.
- Ejecución local con llama.cpp mediante `llama-completion` en modo no conversacional (`-no-cnv`).
- Compatible con endpoints (etiqueta `endpoints_compatible` del repositorio).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en esta release.
- No incluye chat template ni alineación instruct; no debe esperarse un comportamiento de asistente conversacional.

## Casos de uso

- Continuación de texto y generación creativa: usar `llama-completion` con un prefijo en `prompt.txt` para completar prosa, documentación o guiones; es el flujo exacto que documenta el autor.
- Evaluación de cuantizaciones en local: comparar la calidad de Q4_K_M frente a BF16 o frente a las cuantizaciones propias de llama.cpp usando las métricas KL y top-1 publicadas, como base para decidir el formato en un pipeline de despliegue.
- Base para fine-tuning: al ser un modelo base con licencia Apache 2.0, sirve como punto de partida para adaptaciones posteriores (por ejemplo, SFT sobre dominio propio), partiendo de los pesos originales o de esta conversión.
- Prototipado en estación de trabajo con GPU de consumo: con una RTX 4090 o 3090 de 24 GB se puede servir el modelo con 32K de contexto, suficiente para tareas de generación de documentos largos en local.
- Generación de texto en inglés y coreano: útil para pipelines de contenido en esos dos idiomas, que son los declarados en el repositorio.
- Despliegue en entornos con memoria unificada: la tabla del autor contempla Mac Studio (M5 Max/Ultra) y DGX Spark con 128 GB o más, permitiendo 128K de contexto en hardware de escritorio de gama alta.
- Experimentación con llama.cpp: validar integraciones, medir latencia y throughput en el build `cd959bae` o posterior antes de comprometerse con un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de cuantización frente a BF16, medidas con llama.cpp:

| Cuantizacion | Tamano | WikiText-2 KL | WikiText-2 top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|
| llama.cpp Q8_0 | 15,702 GB | 0,001566 | 98,240 % | 0,000701 | 98,559 % |
| llama.cpp Q6_K | 12,125 GB | 0,006503 | 96,725 % | 0,002581 | 97,382 % |
| llama.cpp Q5_K_M | 10,509 GB | 0,016084 | 95,216 % | 0,005369 | 96,324 % |
| Q4_K_M (esta release) | 8,988 GB | 0,055209 | 91,363 % | 0,016457 | 94,147 % |
| llama.cpp Q3_K_M | 7,339 GB | 0,168777 | 85,020 % | 0,060055 | 88,608 % |

## Requisitos de hardware

- VRAM estimada para inferencia: 8,988 GB de pesos en Q4_K_M; el autor aplica la regla de que el fichero, más la caché KV en f16 a ese contexto, más 2 GB de runtime debe quedar por debajo del 90 % de la memoria disponible.
- GPU recomendadas según el autor: RTX 4090 / RTX 3090 (24 GB) para 32K de contexto; RTX 5090 (32 GB) para 64K; RTX 6000 Ada, 2 x 24 GB, H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), DGX Spark (128 GB unificada), Mac Studio M5 Max (128 GB unificada), H200 (141 GB), B200 (192 GB), Mac Studio M5 Ultra (256/512 GB) y B300 (288 GB) para 128K de contexto.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 con 24 GB a 32K de contexto, y en RTX 5090 con 32 GB a 64K.
- Opciones de despliegue: llama.cpp (build `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior), con `llama-completion` para continuación de texto. El repositorio está etiquetado como compatible con endpoints. No se documentan otras opciones (vLLM, TGI, Ollama) en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen2.5-14B-GGUF (esta release) | 14,77 B | 32K en 24 GB; hasta 128K en 48 GB+ | GGUF Q4_K_M (8,988 GB) | Apache 2.0 | Hugging Face, 421 descargas |
| Qwen/Qwen2.5-14B (modelo base original) | 14,77 B | no disponible en esta informacion | safetensors (BF16) | Apache 2.0 | Hugging Face |
| Cuantizaciones oficiales de llama.cpp para Qwen2.5-14B | 14,77 B | dependiente del hardware | GGUF Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 | Apache 2.0 | llama.cpp / Hugging Face |

La comparación relevante es frente a las cuantizaciones propias de llama.cpp: esta release publica únicamente Q4_K_M, mientras que llama.cpp ofrece Q3_K_M, Q5_K_M, Q6_K y Q8_0, con las métricas de fidelidad recogidas en la tabla de benchmarks. No se dispone de datos para comparar con otros modelos de 14B de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base, no instruct: no sigue instrucciones ni mantiene diálogo de forma fiable; requiere prompts de continuación de texto.
- No incluye chat template; su uso como asistente conversacional no está soportado por esta release.
- Idiomas declarados limitados a inglés y coreano; el rendimiento en castellano no está documentado y no debería asumirse.
- Riesgo de alucinación inherente a un modelo base sin alineación; no se han publicado evaluaciones de sesgo ni de seguridad en esta release.
- La cuantización Q4_K_M introduce una degradación medible: KL de 0,055209 y top-1 del 91,363 % en WikiText-2 frente a BF16, con pérdida adicional en contextos largos.
- Solo se publica un fichero GGUF (Q4_K_M); no hay variantes de mayor o menor precisión en este repositorio.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar los términos de la release original de Qwen y citar el modelo base según indica el autor.
- La fecha de creación del repositorio (2026-11-15) y las referencias a hardware como RTX 5090, H200 o B300 deben tomarse como datos de la model card, no verificados de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-14B-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-14B
- Build de llama.cpp referenciado: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Licencia en el repositorio: https://huggingface.co/Xylolabs/Qwen2.5-14B-GGUF/blob/main/LICENSE
- Repositorio de Xylolabs citado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
