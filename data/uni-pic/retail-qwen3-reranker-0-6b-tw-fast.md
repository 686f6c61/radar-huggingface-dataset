# UNI-PIC/retail-qwen3-reranker-0.6b-tw-fast

## Resumen

`retail-qwen3-reranker-0.6b-tw-fast` es un modelo de reranking (cross-encoder generativo) desarrollado por President Information Corp. (PIC) y Uni-President Information Philippines Corp. (UNI-PIPC), especializado en busqueda de productos de comercio electronico en chino tradicional de Taiwan. Se construye mediante fine-tuning completo sobre `Qwen/Qwen3-Reranker-0.6B` y actua como segunda etapa de un pipeline de recuperacion, por detras de un retriever denso como `UNI-PIC/retail-embeddinggemma-2-tw`.

Su innovacion principal es la reduccion del prompt: en lugar de envolver cada par (consulta, titulo) en una plantilla de aproximadamente 111 tokens, utiliza una plantilla de unos 41 tokens, y el modelo se reentrena para leer ese formato corto. El resultado es un throughput de aproximadamente 1,8 veces superior al reranker estandar del mismo tamano, con una calidad equivalente cuando la puntuacion se combina (blend) con la del retriever denso.

El modelo tiene 595.776.512 parametros (aproximadamente 0,6B) y mantiene el mismo tamano que su hermano estandar; lo que se reduce no es el modelo sino la longitud de la entrada. Esta pensado para despliegues de baja latencia en produccion, con licencia Apache 2.0 y solo 18 descargas en el momento de redactar esta ficha, lo que lo situa como un modelo de nicho muy especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only generativo (`Qwen3ForCausalLM`), variante de prompt corto ("System 1") |
| Parametros totales | 595.776.512 (aproximadamente 0,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (entrenamiento y evaluacion) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones publicadas; el repo contiene safetensors en bf16) |
| Idiomas soportados | Chino tradicional (zh-TW) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-Reranker-0.6B`, un cross-encoder generativo basado en `Qwen3ForCausalLM` que puntua pares (consulta, documento) calculando la log-odds de la respuesta `yes` frente a `no` en la ultima posicion. Sobre esa base se aplica un fine-tuning completo con una funcion de perdida de ranking listwise y una plantilla de prompt corta de aproximadamente 41 tokens por par, frente a los aproximadamente 111 tokens de la plantilla estandar. La secuencia maxima de entrenamiento y evaluacion es de 256 tokens.

Los datos de entrenamiento consisten en consultas reales de compradores, con productos candidatos evaluados por un juez LLM, e incluyen negativos duros (hard negatives) tambien calificados por juez procedentes de una pila de recuperacion. El modelo cubre el estilo de consulta taiwanes: palabras clave cortas de marca y tipo de producto, consultas mixtas chino-ingles y consultas descriptivas, con y sin etiquetas de palabra clave. No se documenta el numero exacto de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Reranking de pares (consulta, titulo de producto) en chino tradicional de Taiwan mediante puntuacion generativa yes/no.
- Segunda etapa de un pipeline de recuperacion de dos fases, recomendada sobre los 50 mejores candidatos de un retriever denso.
- Combinacion (blend) de la puntuacion del reranker con la del retriever para conservar la mayor parte de la ganancia del reranker estandar.
- Procesamiento de consultas cortas de marca y tipo de producto, consultas mixtas chino-ingles y consultas descriptivas.
- Inferencia de baja latencia: aproximadamente 1.691 pares por segundo en una H100 con bf16 y batch 64.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de ranking, no un asistente general.
- No dispone de capacidades de vision, audio ni modo de pensamiento extendido.

## Casos de uso

- Busqueda de productos en e-commerce taiwanes: se usa como segunda etapa tras el retriever denso, reordenando los 50 candidatos recuperados para cada consulta del comprador y mejorando la relevancia del top-k mostrado.
- Busqueda con consultas de marca y tipo de producto: el modelo esta entrenado especificamente con este estilo de consulta corta, frecuente en el comercio electronico de Taiwan, lo que permite ordenar resultados con alta precision.
- Consultas mixtas chino-ingles: adecuado para catalogos donde los titulos combinan terminos en chino tradicional con nombres de marca o tecnologia en ingles.
- Despliegue de baja latencia en produccion: con aproximadamente 34 busquedas por segundo por GPU (asumiendo 50 candidatos por busqueda), permite atender picos de trafico con menos GPUs que el reranker estandar.
- Reduccion de coste de infraestructura: al procesar aproximadamente un 44% menos de tiempo de reranking por busqueda, permite recortar el numero de GPUs necesarias para un mismo volumen de trafico.
- Sistemas de recomendacion y ordenacion de listados: la puntuacion del reranker puede integrarse en un ranking final combinado con senales del retriever para ordenar listados de productos en funcion de la consulta del usuario.
- Evaluacion de relevancia en pipelines de datos: puede emplearse para puntuar pares consulta-producto en la construccion de datasets de entrenamiento o en la validacion de calidad de un catalogo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Throughput (pares/segundo, H100, bf16, batch 64) | 1.691 (frente a 952 del reranker estandar) |
| Busquedas/segundo por GPU (50 candidatos por busqueda) | aproximadamente 34 (frente a aproximadamente 19 del estandar) |
| Reduccion de tiempo de reranking por busqueda | 44% |
| Ganancia retenida frente al reranker estandar (blend) | 87% a 96%, segun juez LLM y split |
| Longitud de prompt por par | aproximadamente 41 tokens (frente a aproximadamente 111 del estandar) |

Las cifras de throughput se midieron en una NVIDIA H100 con inferencia bf16 estandar de Hugging Face, batch 64 y sin optimizaciones de serving. No se han publicado resultados de benchmarks de ranking (NDCG, MRR, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en bf16 para los pesos (tamano del repo), mas memoria para activaciones y batches; con batch 64 y secuencias de 256 tokens el consumo adicional es moderado.
- GPU recomendadas: NVIDIA H100 para el throughput documentado; A100 y L40S son alternativas razonables para produccion.
- Cabe en GPU de consumo: si, en tarjetas con al menos 4-6 GB de VRAM (por ejemplo RTX 3060, RTX 4060, RTX 4090) en bf16 o cuantizado, aunque el throughput medido por el autor corresponde a H100.
- Opciones de despliegue: Hugging Face Transformers con bf16 (configuracion medida por el autor); vLLM, TGI o llama.cpp no estan documentados por el autor para este modelo.
- Latencia y throughput: aproximadamente 1.691 pares por segundo en H100 con bf16 y batch 64; aproximadamente 34 busquedas por segundo por GPU asumiendo 50 candidatos por busqueda.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `retail-qwen3-reranker-0.6b-tw-fast` | 0,6B | 256 tokens | Reranker generativo con prompt corto (aproximadamente 41 tokens), zh-TW retail | Apache 2.0 | Hugging Face |
| `UNI-PIC/retail-qwen3-reranker-0.6b-tw` | 0,6B | no disponible | Reranker generativo estandar (aproximadamente 111 tokens por par), zh-TW retail | Apache 2.0 | Hugging Face |
| `Qwen/Qwen3-Reranker-0.6B` | 0,6B | no disponible | Reranker generativo base multilingue | Apache 2.0 | Hugging Face |
| `UNI-PIC/retail-embeddinggemma-2-tw` | no disponible | no disponible | Retriever denso de primera etapa, zh-TW retail | no disponible | Hugging Face |

## Limitaciones y advertencias

- El reranker rapido por si solo es mas debil que el reranker estandar; el autor recomienda usarlo exclusivamente como segunda etapa combinada (blend) con la puntuacion del retriever, no como sustituto del retriever.
- Esta especializado en chino tradicional de Taiwan y en dominios de retail y e-commerce; su rendimiento fuera de ese idioma o dominio no esta documentado.
- La longitud de contexto es de solo 256 tokens, suficiente para titulos de producto pero no para documentos largos.
- Requiere usar la plantilla de prompt corta incluida en `rerank.py`; usar la plantilla estandar degradaria el rendimiento.
- Riesgo de alucinacion inherente a los rerankers generativos yes/no, aunque acotado por el formato de puntuacion.
- No se documentan sesgos conocidos, pero al entrenarse con consultas reales de compradores puede heredar sesgos de popularidad o de catalogo.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales documentadas.
- Modelo con muy poca adopcion (18 descargas, 0 likes) y publicado recientemente; no hay validacion independiente de sus resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UNI-PIC/retail-qwen3-reranker-0.6b-tw-fast
- Modelo hermano estandar: https://huggingface.co/UNI-PIC/retail-qwen3-reranker-0.6b-tw
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Retriever denso asociado: https://huggingface.co/UNI-PIC/retail-embeddinggemma-2-tw
- Pagina corporativa PIC: https://www.pic.net.tw/
- LinkedIn PIC: https://www.linkedin.com/company/president-information-corporation/
- Pagina corporativa UNI-PIPC: https://www.pic.net.ph/
- LinkedIn UNI-PIPC: https://www.linkedin.com/company/uni-pipc/
- Chat LumineOne AI: https://lumineai.pic.net.tw/
- Organizacion UNI-PIC en Hugging Face: https://huggingface.co/UNI-PIC
- GitHub del equipo de IA de PIC: https://github.com/pic-ai-team
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
