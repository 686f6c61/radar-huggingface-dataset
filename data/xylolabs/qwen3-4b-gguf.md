# Xylolabs/Qwen3-4B-GGUF

## Resumen

Xylolabs/Qwen3-4B-GGUF es una colección de cuantizaciones en formato GGUF del modelo Qwen/Qwen3-4B, publicada por Xylolabs para su uso con llama.cpp en CUDA, Metal o CPU. El modelo base es un transformer denso de 4.022.468.096 parámetros (aproximadamente 4B) desarrollado por el equipo Qwen de Alibaba, y esta ficha cubre específicamente los pesos cuantizados distribuidos por Xylolabs, no el modelo original.

La relevancia de esta publicación radica en que ofrece cuantizaciones verificadas con métricas de fidelidad respecto a BF16 (divergencia KL y acuerdo top-1 sobre WikiText-2 y un conjunto held-out), lo que permite a los desarrolladores elegir el equilibrio adecuado entre tamaño en disco y pérdida de calidad. El repositorio incluye tres ficheros: Q5_K_M (2,890 GB), IQ4_XS (2,286 GB) e IQ4_XS-imat (2,271 GB), este último generado con importance matrix.

El modelo está pensado para despliegues de generación de texto en entornos con recursos limitados, desde GPUs de consumo hasta estaciones de trabajo con memoria unificada. La licencia Apache 2.0 del modelo base se mantiene en esta redistribución, lo que facilita su uso comercial. La model card documenta el contexto de 32K para los ficheros recomendados y proporciona una tabla de correspondencia entre hardware y fichero recomendado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32K (según tabla de hardware de la model card) |
| Tipos de cuantizacion | Q5_K_M, IQ4_XS, IQ4_XS-imat |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3-4B es un transformer denso de aproximadamente 4B parámetros. Esta publicación no aporta información sobre la composición del dataset de entrenamiento, el número de tokens, ni sobre si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación; esos detalles corresponden a la model card original de Qwen/Qwen3-4B, que no se incluye en la información proporcionada.

La contribución técnica de Xylolabs se limita al proceso de conversión a GGUF y cuantización. Destaca la generación de una variante IQ4_XS con importance matrix (imat), que según la tabla de precisión del autor obtiene una divergencia KL media de 0,058079 sobre WikiText-2 y 0,052823 en held-out, con un acuerdo top-1 del 90,539% y 90,931% respectivamente, mejorando ligeramente a la variante IQ4_XS sin imat en el conjunto held-out. Las conversiones se validaron con el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` de llama.cpp.

## Capacidades

- Generación de texto conversacional y de propósito general, heredadas del modelo base Qwen3-4B.
- Razonamiento y matemáticas: capacidades propias de la familia Qwen3, aunque no se documentan resultados numéricos en esta publicación.
- Generación de código: no se detalla en la model card de esta cuantización; debe consultarse la del modelo base.
- Soporte de tool calling / function calling: no documentado en esta publicación.
- Soporte de agentes y razonamiento multi-paso: no documentado en esta publicación.
- Capacidades multilingües: la model card declara inglés (en) y coreano (ko) como idiomas soportados.
- Modo thinking: no documentado en esta publicación.
- Visión y audio: no soportados (modelo de texto).

## Casos de uso

- Despliegue en GPU de consumo: con el fichero IQ4_XS (2,286 GB) el modelo cabe holgadamente en GPUs de 8-12 GB de VRAM junto con la caché KV para contextos moderados, lo que permite ejecutar un modelo de 4B en equipos de gama media.
- Asistente conversacional local: la variante Q5_K_M ofrece una fidelidad del 94,554% top-1 respecto a BF16 en WikiText-2, adecuada para chatbots de escritorio que requieren buena calidad sin depender de la nube.
- Procesamiento por lotes en CPU: al ser GGUF compatible con llama.cpp en CPU, puede integrarse en pipelines de generación de texto donde no hay GPU disponible, aceptando la penalización de latencia a cambio de un despliegue sencillo.
- Prototipado rápido con llama-server: el binario `llama-server` acepta los mismos flags que `llama-cli`, lo que permite levantar un endpoint HTTP compatible con OpenAI para pruebas de integración.
- Evaluación de cuantizaciones: la tabla de precisión incluida permite comparar el compromiso tamaño/calidad entre Q5_K_M, IQ4_XS e IQ4_XS-imat antes de elegir un fichero para producción.
- Inferencia en estaciones de trabajo con memoria unificada: la model card documenta compatibilidad con DGX Spark (128 GB unificados) y Mac Studio M5 Max/Ultra, lo que facilita ejecutar el modelo con contexto de 32K en hardware Apple Silicon o sistemas unificados.
- Filtrado y clasificación de texto en coreano e inglés: dado el soporte declarado de ambos idiomas, puede emplearse en tareas de extracción o resumen en esos dos mercados lingüísticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye métricas de fidelidad de cuantización frente a BF16:

| Cuantizacion | Tamano | WikiText-2 KL | WikiText-2 top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|
| Q5_K_M (Xylolabs) | 2,890 GB | 0,019311 | 94,554% | 0,018949 | 95,039% |
| IQ4_XS (Xylolabs) | 2,286 GB | 0,073782 | 89,804% | 0,067601 | 89,324% |
| IQ4_XS-imat (Xylolabs) | 2,271 GB | 0,058079 | 90,539% | 0,052823 | 90,931% |
| Unsloth Q5_K_M (referencia) | 2,890 GB | 0,013304 | 95,353% | 0,013275 | 95,333% |
| Unsloth IQ4_XS (referencia) | 2,271 GB | 0,059435 | 90,770% | 0,055952 | 90,608% |
| llama.cpp Q4_K_M (referencia) | 2,497 GB | 0,066769 | 90,407% | 0,061367 | 90,520% |

## Requisitos de hardware

- VRAM estimada: el fichero Q5_K_M ocupa 2,890 GB y el IQ4_XS 2,286 GB; a ello hay que sumar la caché KV para el contexto deseado (la model card recomienda 32K en GPUs de 24 GB o más).
- GPU recomendadas según la model card: RTX 4090 / RTX 3090 (24 GB), RTX 5090 (32 GB), RTX 6000 Ada o 2 x 24 GB (48 GB), H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), H200 (141 GB), B200 (192 GB), B300 (288 GB).
- Cabe en GPU de consumo: sí, con el fichero IQ4_XS (2,286 GB) en GPUs de 8 GB o más; con Q5_K_M en GPUs de 12 GB o más para contextos moderados.
- Memoria unificada: documentado para DGX Spark (128 GB), Mac Studio M5 Max (128 GB) y Mac Studio M5 Ultra (256 GB y 512 GB).
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`) en CUDA, Metal o CPU. No se documentan otros runners en esta publicación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|
| Xylolabs/Qwen3-4B-GGUF | 4,02B | 32K | Apache 2.0 | GGUF (Q5_K_M, IQ4_XS, IQ4_XS-imat) | Cuantizaciones con métricas de fidelidad publicadas |
| Qwen/Qwen3-4B | 4,02B | no disponible en esta ficha | Apache 2.0 | safetensors | Modelo base original; referencia de calidad BF16 |
| Unsloth Qwen3-4B GGUF (referenciado en la tabla) | 4,02B | no disponible | Apache 2.0 | GGUF (Q8_0, Q6_K, Q5_K_M, Q4_K_M, etc.) | Mayor variedad de cuantizaciones; mejor KL en Q5_K_M según la tabla del autor |
| llama.cpp Qwen3-4B GGUF (referenciado en la tabla) | 4,02B | no disponible | Apache 2.0 | GGUF (Q8_0, Q6_K, Q4_K_M, Q3_K_M) | Cuantizaciones estándar de llama.cpp; KL superior a las de Xylolabs en Q5_K_M y Q4_K_M |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en esta publicación; deben consultarse en la model card del modelo base Qwen3-4B.
- Riesgo de alucinación: inherente a los modelos de lenguaje de 4B parámetros; no se aportan evaluaciones específicas en esta cuantización.
- Pérdida de calidad por cuantización: IQ4_XS sin imat cae al 89,324% de acuerdo top-1 en held-out frente a BF16, y Q5_K_M al 95,039%; para tareas sensibles a la precisión conviene usar Q5_K_M o cuantizaciones mayores.
- Limitaciones de idioma: solo se declaran inglés y coreano; el rendimiento en castellano no está garantizado ni documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse el fichero LICENSE incluido y respetarse las condiciones del modelo base.
- Contexto: la model card asocia 32K de contexto a los ficheros recomendados en GPUs de 24 GB o más; en hardware más limitado el contexto práctico será menor.
- Compatibilidad: las cuantizaciones se validaron con un commit concreto de llama.cpp (`cd959bae99ff4bed22bef2604f45241c09bbb8c8`); versiones muy distintas pueden presentar diferencias de comportamiento.
- Repositorio con 0 likes y 1.511 descargas en el momento de la consulta: no hay evidencia de adopción amplia ni de validación independiente de las métricas publicadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Licencia: https://huggingface.co/Xylolabs/Qwen3-4B-GGUF/blob/main/LICENSE
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Gráfico de divergencia KL: https://huggingface.co/Xylolabs/Qwen3-4B-GGUF/resolve/main/accuracy-mean-kl.png
- Gráfico de acuerdo top-1: https://huggingface.co/Xylolabs/Qwen3-4B-GGUF/resolve/main/accuracy-top1.png
