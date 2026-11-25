# Xylolabs/Hy4-flash-GGUF

## Resumen

Hy4-flash es un modelo multimodal de tipo image-text-to-text desarrollado por Tencent, con 218.938.353.741 parámetros totales (aproximadamente 219B) y 12B parámetros activos según la model card del cuantizador, lo que indica una arquitectura de mezcla de expertos (MoE). El repositorio aqui descrito, Xylolabs/Hy4-flash-GGUF, no es el modelo original sino una colección de cuantizaciones GGUF publicadas por Xylolabs para su ejecución en llama.cpp sobre CUDA, Metal o CPU.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE multimodal de gran tamano en hardware local mediante cuantización agresiva, incluyendo formatos de 2 a 8 bits y una variante NVFP4 para GPUs NVIDIA Blackwell. El repositorio incluye además los proyectores de visión en BF16 y Q8_0, un fichero imatrix para cuantización con importancia y una tabla de precisión medida frente al modelo BF16 de referencia.

El modelo base soporta únicamente inglés y chino, se distribuye bajo la licencia Tencent Hy License y emplea una innovación denominada Engram table, almacenada como segundo fichero de cada cuantización y que puede mantenerse en RAM del sistema mediante opciones específicas de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (image-text-to-text); detalles completos de la arquitectura del modelo base no disponibles |
| Parametros totales | 218.938.353.741 (aprox. 219B) |
| Parametros activos | 12B (según model card del cuantizador) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de ejecucion usa `-c 8192`) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, NVFP4, Q4M-E5, Q4M-E4, IQ4_XS-E4, Q3_K_M-E4, IQ3_M-E4, IQ3_XXS-E4, IQ2_M-E4, IQ2_XXS-E4 |
| Idiomas soportados | en, zh |
| Licencia | tencent-hy-license (other) |
| Formato de pesos | GGUF (llama.cpp); proyectores de visión en BF16 y Q8_0; imatrix incluida |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de tipo mezcla de expertos con aproximadamente 219B parámetros totales y 12B activos, según los datos del repositorio de cuantización. La model card del cuantizador menciona un componente denominado Engram table, que se distribuye como segundo fichero de cada cuantización (en FP8 E4M3, Q5_0, IQ4_NL o MXFP4 según la variante) y que puede residir en RAM del sistema mientras llama.cpp lee únicamente las filas necesarias para cada prompt mediante `--override-tensor` y `--load-mode mmap --lazy-mode on`. También se cita un drafter de decodificación especulativa llamado DFly2, que no se incluye en este repositorio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La cuantización se ha realizado con una matriz de importancia (`Hy4-flash.imatrix.gguf`) y se ofrecen variantes con distintos formatos para la Engram table (sufijos `-E4` y `-E5`). El soporte de llama.cpp depende de un pull request no fusionado (PR #32517) en el momento de la publicación.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Procesamiento de imagen y texto conjuntamente (pipeline image-text-to-text), con proyectores de visión incluidos en BF16 y Q8_0.
- Razonamiento y respuesta a preguntas, evaluado en la model card mediante una prueba de cinco preguntas ("Answers") superada por todas las cuantizaciones.
- Ejecución local en llama.cpp sobre CUDA, Metal o CPU, con soporte de plantillas de chat mediante `--jinja`.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Asistencia conversacional multilingüe inglés-chino: el modelo puede mantener diálogos multi-turno en ambos idiomas, adecuado para productos dirigidos a mercados anglófonos y sinófonos.
- Análisis de documentos con imágenes: gracias al pipeline image-text-to-text y a los proyectores de visión incluidos, puede describir o extraer información de capturas, diagramas y fotografías acompañadas de instrucciones textuales.
- Despliegue en estaciones de trabajo con GPU única: las cuantizaciones Q4_K_M (161,2 GB) o IQ2_XXS-E4 (83,1 GB) permiten servir el modelo en entornos con memoria limitada, manteniendo una fidelidad razonable frente a BF16.
- Inferencia en GPUs NVIDIA Blackwell: la variante NVFP4 (154,9 GB) aprovecha los tensor cores FP4 de estas GPUs mediante llama.cpp.
- Evaluación de cuantizaciones: el repositorio incluye métricas de divergencia KL y acuerdo top-1 frente a BF16, útil para equipos que necesiten elegir el compromiso tamano-calidad adecuado.
- Investigación sobre MoE y decodificación especulativa: la arquitectura con Engram table y el drafter DFly2 (no incluido) son puntos de partida para estudiar optimizaciones de inferencia en modelos dispersos.
- Prototipado con llama-server: el binario `llama-server` acepta las mismas opciones que `llama-cli`, lo que facilita exponer el modelo como API compatible con endpoints.

## Benchmarks y rendimiento

La model card proporciona métricas de fidelidad de cuantización (divergencia KL media y acuerdo top-1 frente al modelo BF16) medidas con llama.cpp sobre WikiText-2, chat y texto reservado, además de una prueba de cinco preguntas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Cuantizacion | Tamano | KL WikiText-2 | top-1 | KL chat | top-1 | KL reservado | top-1 | Answers |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| BF16 (referencia) | 375,4 GB | 0,1152 | 89,8% | 0,1987 | 89,0% | 0,0818 | 91,7% | - |
| Q8_0 / E4M3 | 228,9 GB | 0,1450 | 88,3% | 0,2483 | 87,5% | 0,1051 | 90,3% | 5/5 |
| Q6_K / E4M3 | 193,3 GB | 0,1458 | 87,9% | 0,2486 | 87,2% | 0,0998 | 90,4% | 5/5 |
| Q5_K_M / E4M3 | 176,7 GB | 0,1664 | 87,5% | 0,2705 | 86,6% | 0,1127 | 89,5% | 5/5 |
| Q4_K_M / E4M3 | 161,2 GB | 0,2123 | 85,1% | 0,3205 | 85,3% | 0,1444 | 88,5% | 5/5 |
| NVFP4 / E4M3 | 154,9 GB | 0,2511 | 83,8% | 0,4033 | 83,3% | 0,1724 | 87,3% | 5/5 |
| Q4_K_M / Q5_0 | 141,4 GB | 0,2235 | 85,0% | 0,3586 | 85,1% | 0,1416 | 88,9% | 5/5 |
| Q4_K_M / IQ4_NL | 133,5 GB | 0,2333 | 85,0% | 0,3514 | 84,4% | 0,1556 | 88,3% | 5/5 |
| IQ4_XS / IQ4_NL | 122,6 GB | 0,2362 | 84,4% | 0,3671 | 84,3% | 0,1706 | 87,7% | 5/5 |
| Q3_K_M / IQ4_NL | 114,2 GB | 0,3393 | 81,0% | 0,5192 | 81,2% | 0,2446 | 84,8% | 5/5 |
| IQ3_M / IQ4_NL | 108,1 GB | 0,4028 | 79,4% | 0,5664 | 79,8% | 0,3105 | 82,8% | 5/5 |
| IQ3_XXS / IQ4_NL | 100,5 GB | 0,4698 | 77,3% | 0,6502 | 78,6% | 0,3389 | 81,4% | 5/5 |
| IQ2_M / IQ4_NL | 91,9 GB | 0,6412 | 73,3% | 0,8604 | 74,9% | 0,4699 | 78,2% | 5/5 |
| IQ2_XXS + IQ2_S / MXFP4 | 83,1 GB | 0,8349 | 69,3% | 1,1280 | 72,1% | 0,6276 | 75,1% | 5/5 |

La model card advierte de que el BF16 es el suelo de referencia: cualquier cambio de redondeo altera elecciones de expertos casi empatadas, por lo que Q8_0 y Q6_K se sitúan cerca de ese suelo.

## Requisitos de hardware

- VRAM estimada: desde 83,1 GB (IQ2_XXS-E4) hasta 228,9 GB (Q8_0), pasando por 161,2 GB (Q4_K_M) y 154,9 GB (NVFP4).
- La model card indica que un fichero cabe cuando su tamano más la caché KV en f16 para el contexto elegido más 2 GB de runtime queda por debajo del 90% de la memoria disponible.
- GPUs recomendadas: NVIDIA Blackwell para NVFP4 (tensor cores FP4); el resto de cuantizaciones requieren suficiente VRAM agregada para el tamano del fichero, lo que en la práctica implica múltiples GPUs o memoria unificada.
- En consumer GPU de 24 GB (RTX 4090 / RTX 3090) no cabe el modelo completo; la tabla de la model card se corta en la información disponible y solo menciona "offload" con contexto de 32K para esas GPUs, sin detallar la configuración.
- Opciones de despliegue: llama.cpp (rama del PR #32517) con `llama-cli` y `llama-server`; no se documentan vLLM, TGI ni Ollama en la información disponible.
- La Engram table puede mantenerse en RAM del sistema con `--override-tensor '^per_layer_token_embd\.weight$=CPU' --load-mode mmap --lazy-mode on`, reduciendo la VRAM necesaria a costa de latencia.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Hy4-flash (este repo, GGUF) | 219B / 12B | no disponible | en, zh | Tencent Hy License | GGUF |
| Hy4-flash (base, tencent/Hy4-flash) | 219B / 12B | no disponible | en, zh | Tencent Hy License | safetensors |
| AngelSlim Q4_K_M (referencia en la model card) | no disponible | no disponible | no disponible | no disponible | GGUF |
| AngelSlim Q3_K (referencia en la model card) | no disponible | no disponible | no disponible | no disponible | GGUF |

La model card incluye comparaciones de precisión frente a cuantizaciones AngelSlim (Q4_K_M de 168,3 GB con KL 0,2161 en WikiText-2; Q3_K de 155,4 GB con KL 0,2969; IQ2_AH de 135,0 GB con KL 0,7328), pero no se dispone de datos de arquitectura, contexto ni licencia de esos modelos. No se dispone de información sobre otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se documenta soporte de castellano ni de otras lenguas.
- Licencia Tencent Hy License: es necesario revisar sus términos para uso comercial, ya que no es una licencia permisiva estándar.
- El soporte en llama.cpp depende de un pull request no fusionado (#32517); actualizaciones del repositorio pueden romper la compatibilidad.
- Las cuantizaciones de 2 y 3 bits (IQ2_XXS, IQ2_M, IQ3_XXS, IQ3_M, Q3_K_M) muestran una degradación notable: el acuerdo top-1 cae hasta el 69,3% en WikiText-2 para IQ2_XXS frente al 89,8% de BF16.
- La model card advierte de que cambios de redondeo alteran elecciones de expertos casi empatadas, lo que introduce variabilidad en las respuestas incluso con cuantizaciones altas.
- El drafter de decodificación especulativa DFly2 no se incluye, por lo que no se aprovecha esa aceleración.
- No se han publicado en la información disponible datos sobre sesgos, tasas de alucinación ni evaluaciones de seguridad del modelo base.
- El repositorio ocupa 1277,8 GB en total, lo que exige planificación de almacenamiento incluso para descargar una sola cuantización.
- El ejemplo de ejecución usa un contexto de 8192 tokens; la longitud máxima de contexto del modelo base no está disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Hy4-flash-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia: https://huggingface.co/Xylolabs/Hy4-flash-GGUF/blob/main/LICENSE
- Pull request de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/32517
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio de Xylolabs (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
