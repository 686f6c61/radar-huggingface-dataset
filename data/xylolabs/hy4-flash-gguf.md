# Xylolabs/Hy4-flash-GGUF

## Resumen

Hy4-flash es un modelo multimodal de tipo image-text-to-text desarrollado por Tencent, con 218.938.353.741 parámetros totales (aproximadamente 219B) y 12B parámetros activos según la model card del cuantizador, lo que indica una arquitectura de mezcla de expertos (MoE). El repositorio analizado, Xylolabs/Hy4-flash-GGUF, no es el modelo original sino una colección de cuantizaciones GGUF preparadas por Xylolabs para su ejecución en llama.cpp sobre CUDA, Metal o CPU, sin el drafter de decodificación especulativa DFly2 del modelo base.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE multimodal de gran tamaño en hardware convencional mediante cuantización agresiva, con hasta once variantes de cuantización documentadas (desde Q8_0 hasta IQ2_XXS), incluyendo pares con tablas Engram reducidas y proyectores de visión opcionales. El repositorio incluye una matriz de importancia (imatrix) propia y datos de divergencia KL frente a BF16, lo que facilita evaluar la pérdida de calidad de cada cuantización antes de desplegarla.

El modelo base soporta inglés y chino, se distribuye bajo la Tencent Hy License 1.0 (licencia "other" con términos adicionales para operadores de Model-as-a-Service a gran escala) y requiere una compilación específica de llama.cpp (PR #32517) hasta que dicha integración se fusione en la rama principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) multimodal image-text-to-text; detalles de capas no disponibles |
| Parametros totales | 218.938.353.741 (aprox. 219B) |
| Parametros activos | 12B (según model card del cuantizador) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, IQ3_M, IQ3_XXS, Q2_K, IQ2_M; variantes con tablas Engram E4M3, Q5_0, IQ4_NL, MXFP4 y NVFP4; pares IQ2_XXS + IQ2_S |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Tencent Hy License, Version 1.0 (license: other, license_name: tencent-hy-license) |
| Formato de pesos | GGUF (shards divididos en dos archivos por cuantización, más mmproj opcional e imatrix) |

## Arquitectura y entrenamiento

La información disponible confirma que Hy4-flash es un modelo MoE multimodal con 219B parámetros totales y 12B activos, orientado a tareas image-text-to-text. La model card del repositorio cuantizado menciona explícitamente la existencia de "Engram tables" (tablas Engram) almacenadas en FP8 E4M3 en la variante por defecto, que pueden reducirse a Q5_0, IQ4_NL o MXFP4 en variantes específicas, y que el procedimiento de ejecución recomienda mantener en memoria de host mediante `--override-tensor` con carga mmap y lazy-mode. También se menciona un drafter de decodificación especulativa denominado DFly2 en el modelo base, que estas cuantizaciones GGUF no incluyen.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones de atención (attention linear, decodificación especulativa integrada en el GGUF, etc.) más allá de la referencia al drafter DFly2 del modelo original. El repositorio incluye una matriz de importancia (imatrix) generada por el cuantizador, empleada para calibrar las cuantizaciones de baja precisión.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Procesamiento multimodal image-text-to-text mediante el proyector de visión opcional (`mmproj-Hy4-flash-*.gguf`).
- Razonamiento y respuesta multi-turno (pipeline conversacional, tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere integración con servicios de inferencia estándar.
- Ejecución en llama.cpp con soporte de plantilla Jinja (`--jinja`), lo que habilita el formateo de chat y potencialmente tool calling si la plantilla del modelo base lo define (no confirmado en la información disponible).
- Capacidades de agente y multi-step reasoning: no confirmadas explícitamente en la información disponible.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Despliegue local de un modelo multimodal de gran tamaño en estaciones de trabajo con GPU consumer: las variantes IQ2_XXS + IQ2_S (83 GB) y Q3_K_M (114-122 GB) permiten ejecutar el modelo en configuraciones de 2-4 GPU de 24-48 GB, manteniendo las tablas Engram en RAM de host gracias a `--override-tensor`.
- Asistentes conversacionales bilingües inglés-chino: el modelo cubre ambos idiomas de forma nativa, adecuado para atención al cliente o soporte técnico en organizaciones con operaciones en ambos mercados.
- Procesamiento de documentos con imagen y texto: el proyector de visión opcional permite extraer información de capturas, diagramas o formularios escaneados y combinarla con texto en la misma conversación.
- Inferencia en CPU o Metal sin GPU dedicada: la compilación de llama.cpp del PR #32517 funciona en CUDA y Metal, y las cuantizaciones de menor tamaño (Q2_K, IQ2_M) permiten pruebas en equipos sin acelerador, aunque con latencia elevada.
- Evaluación comparativa de cuantizaciones en pipelines de investigación: la tabla de divergencia KL y top-1 frente a BF16 incluida en el repositorio permite seleccionar la cuantización con el mejor compromiso tamaño-calidad para un caso concreto antes de invertir en hardware.
- Servicios de inferencia autoalojados con llama-server: el servidor de llama.cpp acepta los mismos flags que la CLI, lo que facilita exponer el modelo como API compatible con endpoints en infraestructura propia.
- Experimentación con modelos MoE multimodales en investigación académica: al ser una cuantización abierta y ejecutable en hardware asequible, sirve para estudiar el comportamiento de MoE multimodales sin acceso a clústeres de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El repositorio incluye métricas de fidelidad de cuantización frente a BF16 medidas con llama.cpp (divergencia KL media y acuerdo top-1, menor KL es mejor):

| Cuantizacion | Tamano | WikiText-2 KL | Top-1 | Chat KL | Top-1 | Held-out KL | Top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q8_0 / E4M3 | 228,859 GB | 0,1450 | 88,343% | 0,2483 | 87,501% | 0,1051 | 90,333% |
| Q6_K / E4M3 | 193,251 GB | 0,1458 | 87,882% | 0,2486 | 87,179% | 0,0998 | 90,392% |
| Q5_K_M / E4M3 | 176,726 GB | 0,1664 | 87,500% | 0,2705 | 86,637% | 0,1127 | 89,500% |
| Q4_K_M / E4M3 | 161,174 GB | 0,2123 | 85,078% | 0,3205 | 85,339% | 0,1444 | 88,529% |
| Q4_K_S / E4M3 | 155,549 GB | 0,2202 | 84,946% | 0,3498 | 85,118% | 0,1489 | 88,157% |
| NVFP4 / E4M3 | 154,945 GB | 0,2991 | 82,598% | 0,4239 | 83,409% | 0,2000 | 86,363% |
| Q4_K_M / Q5_0 | 141,373 GB | 0,2235 | 85,025% | 0,3586 | 85,108% | 0,1416 | 88,863% |
| Q4_K_M / IQ4_NL | 133,453 GB | 0,2333 | 85,049% | 0,3514 | 84,424% | 0,1556 | 88,265% |
| Q3_K_M / Q5_0 | 122,140 GB | 0,3335 | 81,471% | 0,5141 | 81,498% | 0,2319 | 84,853% |
| Q3_K_M / IQ4_NL | 114,220 GB | 0,3393 | 80,966% | 0,5192 | 81,227% | 0,2446 | 84,833% |
| IQ2_XXS + IQ2_S / MXFP4 | 83,070 GB | 0,8349 | 69,314% | 1,1280 | 72,086% | 0,6276 | 75,059% |

Como referencia, el repositorio incluye también cuantizaciones de terceros (AngelSlim) para comparar: AngelSlim Q4_K_M (168,347 GB, KL WikiText-2 0,2161, top-1 85,059%), AngelSlim Q3_K (155,371 GB, KL 0,2969, top-1 82,392%) y AngelSlim IQ2_AH (134,996 GB, KL 0,7328, top-1 71,353%).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde 83 GB (IQ2_XXS + IQ2_S) hasta 229 GB (Q8_0). Las tablas Engram pueden residir en RAM de host con `--override-tensor '^per_layer_token_embd\.weight$=CPU'`, reduciendo la VRAM necesaria a costa de latencia.
- GPU recomendadas: configuraciones multi-GPU para las cuantizaciones grandes; para Q4_K_M / IQ4_NL (133 GB) se requieren al menos 6 GPU de 24 GB o 2-3 GPU de 48-80 GB. Las variantes IQ2 (83 GB) caben en 2 GPU de 48 GB o 4 de 24 GB.
- GPU consumer: no cabe en una única RTX 4090 (24 GB) en ninguna cuantización; las variantes IQ2_XXS + IQ2_S son las únicas viables en configuraciones de 3-4 GPU consumer de 24 GB, con rendimiento limitado.
- Opciones de despliegue: llama.cpp (PR #32517, commit `0a054d0b0`, o build parcheado de Tencent), con `llama-cli` y `llama-server`; soporte CUDA y Metal en la misma compilación. vLLM, TGI u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles. La carga mmap con lazy-mode reduce el consumo de memoria pero añade latencia de lectura de disco en el primer uso de cada prompt.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hy4-flash (Tencent) | 219B / 12B | no disponible | Tencent Hy License 1.0 | BF16 original, GGUF (esta ficha) | MoE multimodal en/zh |
| AngelSlim Q4_K_M (cuantización de Hy4-flash) | 219B / 12B | no disponible | Tencent Hy License 1.0 | GGUF | 168,347 GB, KL 0,2161, top-1 85,059% |
| AngelSlim Q3_K (cuantización de Hy4-flash) | 219B / 12B | no disponible | Tencent Hy License 1.0 | GGUF | 155,371 GB, KL 0,2969, top-1 82,392% |
| AngelSlim IQ2_AH (cuantización de Hy4-flash) | 219B / 12B | no disponible | Tencent Hy License 1.0 | GGUF | 134,996 GB, KL 0,7328, top-1 71,353% |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE multimodal de ~200B) en la documentación proporcionada.

## Limitaciones y advertencias

- Solo se soportan inglés y chino; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- La licencia Tencent Hy License 1.0 incluye términos adicionales para operadores de Model-as-a-Service a gran escala; es imprescindible revisar el archivo `LICENSE` antes de un uso comercial o de ofrecer el modelo como servicio.
- Las cuantizaciones de baja precisión (IQ2_XXS + IQ2_S, Q2_K) muestran una degradación notable: top-1 del 69,314% en WikiText-2 y KL de 0,8349 frente a BF16, lo que las hace inadecuadas para tareas que requieran alta fidelidad.
- Requiere una compilación específica de llama.cpp (PR #32517) no fusionada en la rama principal en el momento de la publicación; la estabilidad y el soporte a largo plazo de esa integración no están garantizados.
- El drafter de decodificación especulativa DFly2 del modelo base no está incluido en estas cuantizaciones, por lo que el rendimiento en latencia será inferior al del modelo original.
- El proyector de visión es opcional y debe descargarse por separado (`mmproj-Hy4-flash-*.gguf`); sin él, el modelo funciona solo como text-to-text.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; se recomienda evaluación propia antes de producción.
- El tamaño del repositorio (1.760,5 GB) implica una descarga considerable; conviene seleccionar únicamente los shards de la cuantización deseada.
- Longitud de contexto no disponible: no se puede planificar el uso en conversaciones largas o documentos extensos sin verificar este dato en la documentación del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Hy4-flash-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia: https://huggingface.co/Xylolabs/Hy4-flash-GGUF/blob/main/LICENSE
- Pull request de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/32517
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio de Xylolabs (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
