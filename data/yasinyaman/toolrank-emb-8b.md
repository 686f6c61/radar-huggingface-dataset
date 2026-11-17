# yasinyaman/toolrank-emb-8b

## Resumen

ToolRank-emb-8b (publicado internamente como callbus-emb-8b v0.2) es un modelo de embeddings de 8.190 millones de parámetros derivado de Qwen3-Embedding-8B mediante un ajuste fino con LoRA orientado específicamente a la recuperación de herramientas (tool retrieval) para agentes y servidores MCP. Lo desarrolla yasinyaman como backbone por defecto del proyecto CallBus, y su función es convertir una petición de un agente en un vector y ordenar por similitud el catálogo de herramientas disponibles, de modo que la herramienta correcta quede en las primeras posiciones.

El modelo conserva intacta la arquitectura del Qwen3-Embedding-8B original (transformer denso, pooling por último token, 4.096 dimensiones, textos de hasta 8.192 tokens) y solo modifica los pesos mediante un LoRA de rango 16 y alpha 32, con dropout 0,05, fusionado posteriormente en el checkpoint. El entrenamiento emplea 20.000 pares petición-herramienta extraídos de ToolRet-Training-20w con objetivo InfoNCE y temperatura 0,05.

Su relevancia radica en que mejora de forma medible la selección de herramientas en escenarios multi-herramienta: en ToolRet, el NDCG@10 pasa de 51,11 a 58,90, y en tareas que requieren tres herramientas sobre catálogos de GitHub y Stripe el NDCG@10 sube de 55,21 a 75,40. La licencia es Apache-2.0, aunque con la salvedad de que los datos de entrenamiento no declaran licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-Embedding-8B), pooling por último token |
| Parámetros totales | 8.188.515.328 |
| Parámetros activos | no disponible (modelo denso) |
| Longitud de contexto | 8.192 tokens por texto |
| Tipos de cuantización | bfloat16 (original), FP8 (vía vLLM), GGUF Q8_0 y Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16, 16,4 GB); GGUF en repo separado |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-Embedding-8B sin cambios estructurales: un transformer denso con tokenizador, pooling y configuración heredados del modelo base. La única modificación son los pesos, ajustados con un LoRA de rango 16, alpha 32 y dropout 0,05, fusionado en el checkpoint final. La salida son embeddings de 4.096 dimensiones normalizados en L2, generados mediante pooling del último token.

El entrenamiento usó 20.000 pares petición-herramienta muestreados de ToolRet-Training-20w (semilla 0), descartando 776 pares cuya petición coincidía con alguna de ToolRet, LiveMCPBench o MCP-Zero. El objetivo fue InfoNCE con negativos en el lote y temperatura 0,05, truncando peticiones a 256 tokens y herramientas a 768. Se realizó una época de 625 pasos, con micro-lote de 16 y 2 pasos de acumulación, tasa de aprendizaje 1e-4 y 50 pasos de calentamiento, durante 8,6 horas en una GB10. La selección del checkpoint se hizo sobre MCP-Zero, por lo que las cifras de ese conjunto no son de validación independiente. Antes del entrenamiento se verificó que los vectores del código de entrenamiento coincidían con los del modelo base servido (coseno medio 0,9999 sobre 8 textos de herramientas).

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación (pipeline sentence-similarity).
- Recuperación de herramientas para agentes: ordena catálogos de herramientas MCP y OpenAPI por relevancia respecto a una petición.
- Manejo de textos largos de hasta 8.192 tokens, suficiente para descripciones de herramientas con esquemas de entrada completos.
- Soporte de instrucción específica de tarea (`Instruct: Given an agent's request for a tool, retrieve the MCP tool that fulfills it.`).
- Buen rendimiento en peticiones que requieren varias herramientas encadenadas.
- Compatibilidad con Text Embeddings Inference y endpoints compatibles.
- No dispone de cabezas de clasificación propias: las cabezas v0.1 del proyecto, entrenadas sobre el modelo base, degradan el rendimiento entre 0,2 y 3,9 puntos.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de herramientas en agentes MCP: dado un catálogo de servidores y herramientas, el modelo convierte la petición del agente en un vector y devuelve las herramientas más cercanas, lo que permite seleccionar la herramienta correcta antes de invocar al LLM planificador.
- Construcción de índices de recuperación sobre catálogos grandes: con 44.453 herramientas y 7.961 consultas en ToolRet, el modelo mantiene un NDCG@10 de 58,90, lo que lo hace adecuado para índices vectoriales de miles de entradas.
- Pipelines de agentes multi-paso: en tareas que requieren dos o tres herramientas (catálogos de GitHub y Stripe), mejora el NDCG@10 de 71,04 a 82,95 y de 55,21 a 75,40 respectivamente, por lo que es útil cuando el agente debe encadenar varias llamadas.
- Segunda etapa de reordenación: combinado con Qwen3-Reranker-8B sobre el top 20, alcanza 59,36 en ToolRet y 91,94 de top-1 en MCP-Zero, lo que permite un pipeline de recuperación en dos fases con precisión alta.
- Despliegue en local sin GPU de 16 GB: la versión GGUF Q8_0 mantiene resultados equivalentes y Q4_K_M ocupa 5 GB con una pérdida de aproximadamente un punto de top-1 en peticiones cortas, lo que permite ejecutarlo en estaciones de trabajo modestas.
- Servicio de embeddings en producción con vLLM: el comando de servicio documentado con `--runner pooling --max-model-len 8192` y cuantización FP8 permite servir el modelo con latencia baja y resultados prácticamente idénticos (59,02 frente a 58,90 en ToolRet).
- Búsqueda semántica de APIs y funciones en documentación técnica: al aceptar descripciones JSON con `server`, `name`, `description` e `inputSchema`, puede indexar especificaciones OpenAPI y resolver consultas en lenguaje natural.

## Benchmarks y rendimiento

Resultados con instrucción, cada conjunto bajo su propio protocolo:

| Modelo | ToolRet NDCG@10 (micro / cat-macro) | LiveMCPBench NDCG@10 / Recall@5 | MCP-Zero top-1 (selección) |
|---|---:|---:|---:|
| Qwen3-Embedding-8B | 51,11 / 46,54 | 53,74 / 50,82 | 78,19 |
| Qwen3-Embedding-8B + cabezas callbus v0.1 | 54,03 / 47,13 | 53,95 / 53,03 | 79,87 |
| ToolRank-emb-8b | 58,90 / 54,36 | 55,74 / 52,06 | 88,57 |
| ToolRank-emb-8b en FP8 | 59,02 / 54,53 | 55,34 / 52,06 | 87,71 |
| ToolRank-emb-8b + cabezas v0.1 | 58,71 / 52,94 | 53,52 / 48,18 | 87,46 |

Detalle por tipo de tarea (NDCG@10, modelo base → ToolRank-emb-8b):

| Conjunto | Tipo | Base → ToolRank |
|---|---|---:|
| ToolRet | distribución de entrenamiento, muchas multi-herramienta | 51,11 → 58,90 |
| MCP-Zero top-1 | conjunto de selección, peticiones de dos líneas | 78,19 → 88,57 |
| LiveMCPBench | retenido, tareas multi-paso en lenguaje natural | 53,74 → 55,74 (no significativo, 94 tareas) |
| GitHub + Stripe, 800 tareas de dos herramientas | retenido | 71,04 → 82,95 |
| GitHub + Stripe, 498 tareas de tres herramientas | retenido | 55,21 → 75,40 |
| GitHub + Stripe, 1.000 peticiones de una herramienta | retenido | 92,99 → 92,49 |

Con segunda etapa de reordenación (Qwen3-Reranker-8B sobre el top 20): ToolRet 59,36 / 54,35, LiveMCPBench 61,24, MCP-Zero top-1 91,94.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 16,4 GB de pesos, más overhead de activaciones; se recomienda un mínimo de 20-24 GB.
- VRAM en FP8: aproximadamente 8-9 GB de pesos, con resultados equivalentes (59,02 frente a 58,90 en ToolRet).
- VRAM en GGUF Q8_0: en torno a 8-9 GB; Q4_K_M ocupa 5 GB.
- GPU recomendadas: A100, H100 o GB10 para bfloat16; RTX 4090 (24 GB) cabe en bfloat16 y con holgura en FP8.
- GPU de consumo: cabe en RTX 4090 y en tarjetas de 16 GB mediante GGUF Q8_0; Q4_K_M permite GPUs de 6-8 GB.
- Despliegue: vLLM con `--runner pooling --max-model-len 8192` (y `--quantization fp8` opcional), llama.cpp, Ollama (GGUF) y Text Embeddings Inference.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ToolRet NDCG@10 | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| ToolRank-emb-8b | 8,19 B | 8.192 | 58,90 | Apache-2.0 (datos sin licencia declarada) | Hugging Face, GGUF |
| Qwen3-Embedding-8B | 8,19 B | 8.192 | 51,11 | Apache-2.0 | Hugging Face |
| Qwen3-Embedding-8B + cabezas callbus v0.1 | 8,19 B | 8.192 | 54,03 | Apache-2.0 | Hugging Face |
| Qwen3-Reranker-8B (segunda etapa) | 8,19 B | no disponible | 59,36 en combinación | Apache-2.0 | Hugging Face |

La comparación directa con otros modelos de embeddings de propósito general (por ejemplo, de la familia BGE o E5) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La mejora se concentra en peticiones que requieren varias herramientas y en peticiones con la forma de los datos de entrenamiento; en peticiones de una sola herramienta en lenguaje llano el rendimiento es prácticamente igual al del modelo base (92,99 → 92,49).
- La selección del checkpoint se hizo sobre MCP-Zero, por lo que sus cifras no son de validación independiente.
- La mejora en LiveMCPBench (53,74 → 55,74) no es estadísticamente significativa con solo 94 tareas.
- Los datos de entrenamiento (ToolRet-Training-20w) no declaran licencia, y proceden de benchmarks anteriores con sus propios términos; los mantenedores publican los pesos asumiendo ese riesgo. Para procedencia limpia de datos recomiendan usar el modelo base.
- Las cabezas v0.1 del proyecto, entrenadas sobre el modelo base, degradan el rendimiento entre 0,2 y 3,9 puntos; no deben aplicarse sobre este modelo.
- El modelo está especializado en recuperación de herramientas; no es un modelo generativo y no debe usarse para generación de texto, razonamiento o código.
- No hay información sobre sesgos, riesgos de alucinación en el espacio de embeddings ni cobertura idiomática.
- El caché de embeddings del proyecto está indexado por el nombre servido; debe servirse con la versión en el nombre para no mezclar vectores de versiones distintas.
- El repositorio tiene 51 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yasinyaman/toolrank-emb-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Pesos GGUF: https://huggingface.co/yasinyaman/callbus-emb-8b-GGUF
- Repositorio del proyecto: https://github.com/yasinyaman/callbus
- Documentación y benchmarks: https://yaman.dev/callbus/
- Guía de ejecución local: https://yaman.dev/callbus/guides/local/
- Benchmarks del proyecto: https://yaman.dev/callbus/benchmarks/
- Dataset de entrenamiento: https://huggingface.co/datasets/mangopy/ToolRet-Training-20w
- Repositorio de ToolRet: https://github.com/mangopy/tool-retrieval-benchmark
