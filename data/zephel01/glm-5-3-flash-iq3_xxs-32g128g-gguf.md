# zephel01/GLM-5.3-Flash-IQ3_XXS-32G128G-GGUF

## Resumen

GLM-5.3-Flash-IQ3_XXS-32G128G-GGUF es una cuantización GGUF de tipo mixto del modelo zai-org/GLM-5.3-Flash, publicada por el usuario zephel01 bajo licencia MIT. Se trata de un modelo de arquitectura MoE (mixture of experts) con 320.759.404.382 parámetros totales, orientado a ejecución local en equipos de consumo con 32 GB de VRAM y 128 GB de RAM, combinando offload a CPU y lectura desde SSD mediante el motor Abyss del mismo autor.

La ficha no documenta la longitud de contexto, el número de parámetros activos ni los idiomas oficiales del modelo base; la model card solo declara inglés y japonés como idiomas de trabajo de la cuantización. El archivo ocupa 127,9 GB repartido en cuatro shards y emplea una mezcla de tipos de cuantización (IQ3_XXS en los expertos enrutados, IQ4_XS en capas concretas, Q5_K y Q4_K en proyecciones de atención y expertos densos, y bytes de UD-IQ2_XXS en router, embeddings y capa MTP).

La relevancia actual del modelo reside en su enfoque "quality first": conserva todos los expertos (sin poda), re-cuantiza con LDLQ a partir de UD-Q4_K_XL de unsloth y reporta un KL de 0,1367 frente a UD-Q4_K_XL, aproximadamente la mitad que UD-IQ2_XXS (0,2651). Está marcado como BETA y su autor solicita mediciones en hardware adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con capa NextN/MTP; detalles completos no disponibles |
| Parametros totales | 320.759.404.382 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla: IQ3_XXS (expertos enrutados gate/up, capas 3-44), IQ4_XS (down en capas 3-5, 11, 12, 42-44), Q5_K (attention output, attention q_b, dense/shared-expert down), Q4_K (otras proyecciones de atención, dense/shared-expert gate/up, proyección NextN), bytes de UD-IQ2_XXS (router, embeddings, output, resto de capa NextN/MTP); media de 3,13 bits por peso |
| Idiomas soportados | en, ja (según model card); lista oficial del modelo base no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (4 shards, 127,9 GB) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer de tipo MoE, según se deduce de la presencia de "expertos enrutados" (routed experts) y expertos densos/compartidos (dense/shared-expert) en el desglose de tipos de cuantización. La cuantización incluye además una capa NextN (Multi-Token Prediction, MTP), lo que sugiere decodificación especulativa integrada en el modelo base. No se dispone de información sobre el número de capas, dimensión oculta, número de expertos por capa ni parámetros activos.

El proceso de cuantización parte de UD-Q4_K_XL de unsloth y re-cuantiza los expertos con LDLQ, usando un volcado de Hessian sobre transcripciones de chat en la plantilla de GLM (inglés, código y japonés) junto con la imatrix de unsloth. Se preservan todos los expertos sin poda. No se documenta en la información disponible el volumen de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento de largo alcance y tareas de codificación, según la recomendación del autor para "trabajo cuidadoso" (long reasoning, hard coding).
- Soporte de japonés, con KL medido específicamente sobre texto japonés (0,145 frente a 0,240 de UD-IQ2_XXS).
- Capacidad multilingüe limitada a inglés y japonés según la model card; otros idiomas no documentados.
- Compatibilidad con endpoints tipo OpenAI (`endpoints_compatible`), incluyendo `/v1/chat/completions`.
- Capacidad de decodificación especulativa mediante la capa NextN/MTP (drafter), aunque las mediciones reportadas se hicieron con el drafter desactivado.
- No se documenta soporte explícito de tool calling, function calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Razonamiento de largo alcance en local: el modelo conserva todos los expertos y una calidad (KL 0,1367) cercana a la referencia Q4_K_XL, lo que lo hace adecuado para cadenas de razonamiento largas en un PC con 32 GB de VRAM y 128 GB de RAM.
- Codificación asistida de dificultad alta: el autor lo recomienda para "hard coding" y la cuantización se calibró con código en la Hessian, por lo que es apropiado para generación y revisión de código en local sin depender de la nube.
- Procesamiento de texto en japonés: el KL japonés de 0,145 (frente a 0,240 de UD-IQ2_XXS) lo sitúa como opción para tareas en japonés cuando se dispone de 128 GB de RAM.
- Despliegue en estación de trabajo con una sola GPU de 32 GB: mediante el motor Abyss, que mantiene los expertos más usados en VRAM y el resto en RAM, con lecturas desde SSD cuando no caben.
- Sustitución de API en flujos existentes: al exponer un endpoint compatible con OpenAI en `http://127.0.0.1:8082/v1/chat/completions`, puede integrarse en aplicaciones que ya consumen la API de OpenAI sin cambiar el cliente.
- Evaluación comparativa de cuantizaciones: sirve como referencia de alta calidad para comparar con S1 (94,1 GB) y UD-IQ2_XXS (101,8 GB) en la misma máquina y con la misma metodología KL.
- Prototipado de asistentes conversacionales multi-turno en local: el tag "conversational" y la calibración sobre transcripciones de chat en la plantilla de GLM lo orientan a este escenario, aunque la longitud de contexto no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos reportados son métricas de fidelidad de cuantización (KL) y de velocidad:

| Metrica | Q120d (este repo) | S1 (32G96G) | unsloth UD-IQ2_XXS |
|---|---:|---:|---:|
| Tamano de descarga | 127,9 GB | 94,1 GB | 101,8 GB |
| KL (10 secuencias) | 0,1367 | 0,2706 | 0,2651 |
| KL, japones | 0,145 | 0,280 | 0,240 |
| Mismo token top | 84,9% | 79,1% | 79,0% |

| Escenario de ejecucion | Velocidad |
|---|---:|
| RTX 5090 (32 GB) + 123 GB RAM, tier de 88,8 GB, sin drafter | 34,6 tok/s |
| Misma máquina con tier de 60 GB RAM (como en PC de 96 GB), sin drafter | 19,0 tok/s |

Hardware de medida: RTX 5090 (32 GB) sobre OCuLink PCIe Gen4 x4, Ryzen AI Max+ 395 (LPDDR5X), 123 GB de RAM, NVMe. Motor Abyss v1.3.129, iGPU desactivada, drafter desactivado.

## Requisitos de hardware

- VRAM estimada: 32 GB de VRAM para el tier de GPU; el resto del modelo (hasta 127,9 GB) se reparte entre RAM y SSD.
- RAM recomendada: 128 GB o más; con menos de 128 GB el autor recomienda usar S1 (94,1 GB).
- GPU objetivo: una GPU de 32 GB (RTX 5090, AI PRO R9700); también se menciona RTX PRO 6000 y GPUs de 24 GB como objetivo de medición, aunque con 24 GB el rendimiento no está garantizado.
- Configuración DGX Spark: existe una versión específica (GLM-5.3-Flash-DGX-Spark-GGUF, 94,1 GB) con los mismos archivos que 32G96G.
- Despliegue: motor Abyss (recomendado, con `./setup-deepseek.sh --model glm --quant 32G128G --download-model`); llama.cpp aún no verificado para este archivo según el autor.
- Throughput medido: 34,6 tok/s con tier de 88,8 GB de RAM en un PC de 123 GB; 19,0 tok/s con tier de 60 GB de RAM. La espera de SSD bajó a 1,4 ms por token en el primer caso.
- Almacenamiento: 127,9 GB para los cuatro shards; se recomienda SSD NVMe porque las lecturas desde disco dominan el tiempo por token cuando el modelo no cabe en VRAM+RAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | KL (10 seqs) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash-IQ3_XXS-32G128G (este) | 320,8 B totales | no disponible | 127,9 GB | 0,1367 | MIT | Hugging Face |
| GLM-5.3-Flash-IQ2_XS-32G96G (S1) | 320,8 B totales | no disponible | 94,1 GB | 0,2706 | MIT | Hugging Face |
| GLM-5.3-Flash-DGX-Spark-GGUF | 320,8 B totales | no disponible | 94,1 GB | no disponible | MIT | Hugging Face |
| unsloth UD-IQ2_XXS (referencia) | 320,8 B totales | no disponible | 101,8 GB | 0,2651 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Estado BETA: medido en un único PC y con el drafter desactivado; el autor advierte de que faltan comprobaciones de uso real y de que el archivo puede ser sustituido por una compilación mejor (cambiando el nombre de la carpeta).
- Sin benchmarks estándar publicados: no hay datos de MMLU, HumanEval, GSM8K ni similares, solo KL frente a Q4_K_XL.
- Comparaciones de KL no homogéneas: la model card advierte de que la tabla de S1 procede de una ejecución de 14 secuencias con sesgo del router en F32, mientras que Q120d no se ha re-ejecutado así; solo deben compararse filas dentro de la misma tabla.
- Riesgo de alucinación: inherente a los modelos de lenguaje, no cuantificado en la información disponible.
- Idiomas limitados: solo inglés y japonés declarados; el rendimiento en castellano u otros idiomas no está verificado.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Dependencia del motor Abyss: llama.cpp no está verificado para este archivo; el flujo de ejecución documentado requiere Abyss y su script de configuración.
- Rendimiento muy sensible a la RAM disponible: con menos de 128 GB el throughput cae a 19,0 tok/s o menos, y el autor recomienda la variante S1.
- Licencia MIT: permite uso comercial, pero el modelo base y sus pesos originales deben verificarse por separado; la model card no detalla restricciones adicionales del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/GLM-5.3-Flash-IQ3_XXS-32G128G-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Versión 32G96G (S1): https://huggingface.co/zephel01/GLM-5.3-Flash-IQ2_XS-32G96G-GGUF
- Versión DGX Spark: https://huggingface.co/zephel01/GLM-5.3-Flash-DGX-Spark-GGUF
- Motor Abyss: https://github.com/zephel01/Abyss
- Plantilla para reportar resultados: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+GLM-5.3-Flash+32G128G+Q120d+on+YOUR_GPU
