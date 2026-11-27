# Xylolabs/Ministral-3-14B-Instruct-2512-GGUF

## Resumen
Ministral-3-14B-Instruct-2512-GGUF es una cuantización en formato GGUF del modelo mistralai/Ministral-3-14B-Instruct-2512-BF16, publicada por Xylolabs para su uso con llama.cpp sobre CUDA, Metal o CPU. El modelo base es un transformer denso de aproximadamente 13.506 millones de parámetros (13,5B) orientado a generación de texto y conversación, distribuido bajo licencia Apache 2.0. Esta versión concreta incluye únicamente el modelo de lenguaje y el tokenizer original con su plantilla de chat; la torre de visión del modelo base no está incluida, por lo que el resultado es estrictamente text-only.

El problema que resuelve esta ficha es práctico: permitir ejecutar un modelo de 13,5B en hardware de consumo y estaciones de trabajo mediante una única cuantización IQ4_XS generada con importance matrix (imat), que ocupa 7,411 GB y mantiene una divergencia KL frente a BF16 de 0,011683 en WikiText-2 y 0,011220 en un conjunto held-out, con un acuerdo top-1 del 94,529% y 94,784% respectivamente. Es relevante ahora porque ofrece un equilibrio medido entre tamaño en disco y fidelidad respecto al modelo original, con cifras de precisión publicadas frente a otras cuantizaciones del mismo modelo.

La ficha se centra en la versión GGUF de Xylolabs. Los datos de arquitectura interna, contexto máximo nativo y composición del entrenamiento del modelo base no están disponibles en la información proporcionada, por lo que se indican como no disponibles cuando corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles internos no disponibles); empaquetado GGUF para llama.cpp |
| Parametros totales | 13.506.073.600 (13,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible como valor nativo del modelo base; la model card documenta despliegues con 64K, 128K y 256K de contexto según memoria disponible |
| Tipos de cuantizacion | Una sola cuantización publicada en este repo: IQ4_XS con importance matrix (IQ4_XS-imat), 7,411 GB. La model card compara además Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_0, Q4_1, IQ4_NL, IQ4_XS, Q3_K_M, Q3_K_S, Q2_K, Q2_K_L, UD-Q8_K_XL, UD-Q6_K_XL, UD-Q5_K_XL, UD-Q4_K_XL, UD-Q3_K_XL, UD-Q2_K_XL, UD-IQ3_XXS, UD-IQ2_M y UD-IQ2_XXS de otros autores |
| Idiomas soportados | Inglés (en) y coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un archivo por cuantización; incluye tokenizer y plantilla de chat) |

## Arquitectura y entrenamiento
El modelo base es un transformer denso de 13,5B parámetros del que no se detallan en la información disponible ni el número de capas, ni las dimensiones de atención, ni si emplea mecanismos como atención lineal o decodificación especulativa. La model card del GGUF no documenta el proceso de entrenamiento del modelo original: no hay datos sobre volumen de tokens, composición del dataset ni uso de RLHF o DPO. Lo que sí se documenta es el proceso de cuantización: se generó una cuantización IQ4_XS utilizando una importance matrix (imat), y se publicaron métricas de fidelidad frente a BF16 sobre WikiText-2 y un conjunto held-out, con divergencia KL y acuerdo top-1. El repositorio incluye la plantilla de chat original, lo que permite usar el formato conversacional del modelo base a través de `--jinja` en llama.cpp.

La innovación técnica destacable de esta publicación no está en el modelo, sino en la metodología de evaluación de la cuantización: la model card ofrece una tabla comparativa extensa con decenas de cuantizaciones de distintos autores (llama.cpp, Unsloth y la propia IQ4_XS-imat), lo que permite elegir el archivo en función de la fidelidad y del presupuesto de memoria. La versión IQ4_XS-imat se sitúa, según esos datos, con una KL de 0,011683 y un top-1 de 94,529% en WikiText-2, ligeramente mejor que la IQ4_XS sin imat (KL 0,011853, top-1 94,397%) y peor que Q4_K_M de llama.cpp en KL (0,011679) aunque con top-1 superior (94,775% para Q4_K_M).

## Capacidades
- Generación de texto y conversación multi-turno, con plantilla de chat incluida en el archivo GGUF.
- Razonamiento y respuesta a instrucciones, al ser una variante Instruct del modelo base.
- Capacidades multilingües limitadas a inglés y coreano según los metadatos del repo.
- Ejecución local en llama.cpp sobre CUDA, Metal o CPU, con soporte de `llama-cli` y `llama-server`.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue como servidor compatible con la API de chat.
- No incluye visión: la torre de visión del modelo base fue eliminada en esta cuantización, por lo que es estrictamente text-only.
- No se documenta en la información disponible soporte explícito de tool calling, function calling, modo thinking ni capacidades de agente multi-paso.

## Casos de uso
- Asistente conversacional local: desplegar `llama-server` con la cuantización IQ4_XS-imat en una RTX 4090 o 3090 (24 GB) y servir conversaciones multi-turno con hasta 64K de contexto, aprovechando la plantilla de chat incluida y la fidelidad del 94,5% top-1 frente a BF16.
- Generación de texto en estaciones de trabajo sin GPU dedicada de gran memoria: usar llama.cpp en CPU o Metal con el archivo de 7,4 GB, adecuado para portátiles y equipos con 16 GB de RAM o más.
- Procesamiento de documentos largos en inglés o coreano: con 128K de contexto en configuraciones de 48 GB de VRAM (RTX 6000 Ada o 2 x 24 GB), el modelo puede resumir o extraer información de contratos, informes o hilos de soporte extensos.
- Prototipado rápido de aplicaciones de chat: el tag `endpoints_compatible` y el soporte de `llama-server` permiten exponer el modelo como API compatible y conectarlo a frontends existentes sin reentrenamiento.
- Evaluación comparativa de cuantizaciones: la tabla de precisión publicada permite seleccionar la variante adecuada según el compromiso entre tamaño (desde 4,057 GB en UD-IQ2_XXS hasta 17,117 GB en UD-Q8_K_XL) y fidelidad, útil para equipos que calibran despliegues.
- Inferencia en hardware Apple Silicon: con una Mac Studio M5 Max de 128 GB de memoria unificada, la model card documenta contexto de 256K, lo que habilita tareas de análisis de corpus largos en local.
- Entornos con requisitos de licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales sin las restricciones de licencias copyleft, siempre que se respeten las condiciones de atribución.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí publica métricas de fidelidad de cuantización frente a BF16, que se resumen a continuación para la variante de este repo y algunas alternativas relevantes:

| Cuantizacion | Tamano | WikiText-2 KL | WikiText-2 top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|
| IQ4_XS-imat (este repo) | 7,411 GB | 0,011683 | 94,529% | 0,011220 | 94,784% |
| Unsloth IQ4_XS | 7,432 GB | 0,011853 | 94,397% | 0,011744 | 94,892% |
| llama.cpp Q4_K_M | 8,239 GB | 0,011679 | 94,775% | 0,010556 | 95,049% |
| Unsloth Q4_K_M | 8,239 GB | 0,008789 | 95,456% | 0,007975 | 95,843% |
| llama.cpp Q8_0 | 14,359 GB | 0,000402 | 98,799% | 0,000447 | 98,775% |

## Requisitos de hardware
- VRAM estimada para inferencia: el archivo IQ4_XS-imat ocupa 7,411 GB; con overhead de contexto y caché KV, se recomienda al menos 10-12 GB de VRAM para contexto moderado.
- GPU recomendadas según la model card: RTX 4090 y RTX 3090 (24 GB) para 64K de contexto; RTX 5090 (32 GB) para 64K; RTX 6000 Ada o 2 x 24 GB (48 GB) para 128K; H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), DGX Spark (128 GB unificada) y Mac Studio M5 Max (128 GB unificada) para 256K.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y RTX 5090 con contexto de 64K; también en equipos Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (probado con el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8`), con `llama-cli` y `llama-server`; soporte de CUDA (`-DGGML_CUDA=ON`), Metal y CPU.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ministral-3-14B-Instruct-2512-GGUF (este) | 13,5B | Hasta 256K según hardware (documentado) | Apache 2.0 | GGUF (IQ4_XS-imat) | Text-only, en/ko, 7,4 GB |
| mistralai/Ministral-3-14B-Instruct-2512-BF16 | 13,5B | No disponible | Apache 2.0 | Safetensors BF16 | Modelo base, incluye torre de visión |
| Cuantizaciones Unsloth del mismo base (UD-Q4_K_XL, Q4_K_M, etc.) | 13,5B | No disponible | Apache 2.0 | GGUF | Alternativas con métricas de fidelidad comparables publicadas en la model card |
| llama.cpp Q4_K_M del mismo base | 13,5B | No disponible | Apache 2.0 | GGUF | 8,239 GB, KL 0,011679 en WikiText-2 |

No se dispone de información sobre otros modelos de la misma categoría (por ejemplo, alternativas de 13-14B de otros fabricantes) en la documentación proporcionada, por lo que la comparativa se limita a variantes del mismo modelo base.

## Limitaciones y advertencias
- No incluye visión: la torre de visión del modelo base fue eliminada, por lo que no puede procesar imágenes aunque el modelo original sí pudiera.
- Idiomas limitados: solo inglés y coreano según los metadatos; el rendimiento en castellano no está documentado y podría ser deficiente.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad para esta cuantización.
- Pérdida de fidelidad por cuantización: la IQ4_XS-imat presenta una KL de 0,011683 frente a BF16 en WikiText-2, lo que implica una degradación medible aunque moderada; para tareas sensibles a la precisión puede ser preferible Q8_0 o el modelo BF16.
- Sesgos conocidos: no documentados en la información disponible; deben asumirse los del modelo base, no evaluados aquí.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se deben conservar los avisos de licencia y atribución correspondientes.
- Dependencia de la versión de llama.cpp: la model card indica que se probó con un commit concreto; versiones distintas pueden requerir ajustes.
- El contexto máximo real depende de la memoria disponible y de la configuración de llama.cpp; los valores de 64K, 128K y 256K son escenarios documentados, no un límite nativo confirmado del modelo.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Ministral-3-14B-Instruct-2512-GGUF
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-BF16
- Licencia: https://huggingface.co/Xylolabs/Ministral-3-14B-Instruct-2512-GGUF/blob/main/LICENSE
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Gráfico de KL media: https://huggingface.co/Xylolabs/Ministral-3-14B-Instruct-2512-GGUF/resolve/main/accuracy-mean-kl.png
- Gráfico de acuerdo top-1: https://huggingface.co/Xylolabs/Ministral-3-14B-Instruct-2512-GGUF/resolve/main/accuracy-top1.png
