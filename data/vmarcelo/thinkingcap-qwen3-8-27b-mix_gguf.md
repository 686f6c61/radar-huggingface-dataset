# vmarcelo/ThinkingCap-Qwen3.8-27B-MIX_GGUF

## Resumen

ThinkingCap-Qwen3.8-27B-MIX_GGUF es una cuantización GGUF de precisión mixta del modelo bottlecapai/ThinkingCap-Qwen3.8-27B, un fine-tune de Qwen3.8-27B orientado a razonamiento con un menor consumo de tokens en la fase de pensamiento. La publicación corre a cargo de vmarcelo, que firma una receta por tensor (IQ4_XS-MIX) construida con llama.cpp a partir del GGUF f16 del autor original, empleando una importance matrix propia y overrides por capa.

El resultado es un fichero de 13,40 GB con 3,924 bits por peso (BPW), inferior al IQ4_XS uniforme publicado (15,48 GB, 4,25 BPW), lo que supone un ahorro de 2,08 GB. La arquitectura subyacente es híbrida con atención completa y lineal (GatedDeltaNet), y el modelo conserva la cabeza MTP embebida, de modo que la decodificación especulativa funciona sin un segundo fichero de draft.

Es relevante ahora porque demuestra que una asignación de bits por capa bien diseñada permite reducir el peso del modelo sin sacrificar los tensores sensibles, algo crítico en arquitecturas híbridas donde los estados SSM y las proyecciones de atención lineal son frágiles a la cuantización. El autor, además, marca esta publicación como reemplazada por una release posterior (Swift 1.5), por lo que la ficha debe leerse como referencia técnica de la receta más que como recomendación de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención completa y atención lineal (GatedDeltaNet) y cabeza MTP para decodificación especulativa |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Hasta 160K tokens según configuración de KV cache y MTP; máximo medido sin spill: 64K con Q8_0 y MTP activo, 96K con Q8_0 sin MTP, 96K con Q5_0/Q4_1 y MTP activo |
| Tipos de cuantizacion | IQ4_XS-MIX (receta mixta con IQ2_XXS, IQ3_XXS, IQ4_XS, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0 según tensor); file_type 30 (MOSTLY_IQ4_XS) |
| Idiomas soportados | Multilingüe (sin listado detallado de idiomas) |
| Licencia | Polyform Small Business License 1.0.0 (license: other) |
| Formato de pesos | GGUF (fichero principal de 13,40 GB a 3,924 BPW) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido: de los 65 bloques, solo 16 son de atención completa, mientras que el resto emplea atención lineal del tipo GatedDeltaNet, lo que reduce drásticamente el coste del KV cache (64 KiB por token en F16, 34 KiB en Q8_0, 21 KiB en Q5_0/Q4_1). Incorpora además una cabeza MTP (multi-token prediction) que actúa como draft para decodificación especulativa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La contribución técnica de esta publicación es la receta de cuantización. El feed-forward concentra el 62,6% de los parámetros, por lo que es la única zona con masa suficiente para financiar un fichero más pequeño: los bloques 0-15 usan IQ2_XXS/IQ2_XXS/IQ3_XXS, los bloques 16-51 IQ3_XXS/IQ3_XXS/IQ4_XS, los bloques 52-62 IQ4_XS/IQ4_XS/Q5_K y el bloque 63 Q4_K/Q6_K/Q6_K. Los tensores sensibles se protegen: ssm_alpha y ssm_beta en Q8_0, attn_gate en Q5_K, attn_k y attn_v en Q8_0, attn_output en Q5_K, output.weight en Q5_K, token_embd en Q3_K y el bloque MTP en Q6_K. La justificación es que los bloques iniciales son los más baratos en esta arquitectura, de modo que absorben los recortes más agresivos en lugar de recibir bits extra.

## Capacidades

- Generación de texto conversacional multi-turno con razonamiento extendido en modo thinking.
- Razonamiento con menor gasto de tokens que el modelo base, según la descripción del fine-tune ThinkingCap.
- Procesamiento de imagen y texto (pipeline image-text-to-text); requiere el fichero mmproj de BottleCap para visión.
- Decodificación especulativa mediante cabeza MTP embebida, sin fichero draft separado.
- Soporte multilingüe declarado, sin desglose de idiomas.
- Compatibilidad con endpoints (tag endpoints_compatible) y con el formato de chat Jinja de llama.cpp.
- No se documenta soporte explícito de tool calling ni de flujos de agentes en la información disponible.

## Casos de uso

- Razonamiento asistido en local con GPU de consumo: el fichero de 13,40 GB cabe en tarjetas de 16 GB con contexto de 32K-64K y decodificación especulativa activa, lo que permite ejecutar un modelo de 27B en hardware doméstico.
- Procesamiento de documentos largos con KV cache reducido: gracias a los 16 bloques de atención completa, 96K tokens de contexto con KV Q5_0/Q4_1 ocupan solo 382 MiB de spill, adecuado para análisis de contratos o informes extensos.
- Análisis de imágenes en local: combinado con el mmproj f16 de BottleCap, permite describir capturas, diagramas o documentos escaneados sin enviar datos a servicios externos.
- Servidor de inferencia ligero con llama-server: la configuración documentada (cont-batching, flash-attn, KV Q8_0) ofrece 965 t/s de prompt y 44 t/s de generación en una RX 9070 XT, suficiente para un pequeño equipo.
- Evaluación de recetas de cuantización: el fichero thinkingcap_iq4_types.txt y la importance matrix publicada permiten reproducir o auditar la asignación de bits por tensor en arquitecturas híbridas.
- Despliegue en entornos con requisitos de soberanía del dato: al ejecutarse íntegramente en local con Vulkan o CUDA, evita la exposición de prompts a terceros, condicionado a la licencia Polyform.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos medidos son de rendimiento de inferencia en una RX 9070 XT (RADV/Vulkan) con un prompt de ~22,5K tokens y este fichero exacto:

| KV cache | MTP | Contexto | Spill GTT | Prompt (t/s) | Generación (t/s) |
|---|---|--:|--:|--:|--:|
| Q8_0/Q8_0 | on | 32K | 254 MiB | 973,6 | 44,4 |
| Q8_0/Q8_0 | on | 48K | 283 MiB | 966,5 | 44,1 |
| Q8_0/Q8_0 | on | 64K | 315 MiB | 965,5 | 44,3 |
| Q8_0/Q8_0 | on | 80K | 914 MiB | 874,8 | 34,3 |
| Q8_0/Q8_0 | on | 96K | 1.624 MiB | 855,4 | 24,0 |
| Q8_0/Q8_0 | off | 96K | 192 MiB | 1.017,6 | 32,4 |
| Q5_0/Q4_1 | on | 64K | 318 MiB | 864,2 | 47,0 |
| Q5_0/Q4_1 | on | 96K | 382 MiB | 864,7 | 47,9 |
| Q5_0/Q4_1 | on | 128K | 1.169 MiB | 809,1 | 37,4 |
| Q5_0/Q4_1 | on | 160K | 2.016 MiB | 560,1 | 26,6 |
| Q5_0/Q4_1 | off | 160K | 256 MiB | 910,5 | 35,0 |

El autor señala que un spill de ~1 GB cuesta entre un 6% y un 9% de throughput de prompt y un 22% de generación, y que por encima de ~1,6 GB el rendimiento se desploma entre un 35% y un 46%. Desactivar MTP libera unos 1,2 GiB de VRAM (equivalente a ~27K de contexto Q8_0) y aumenta el contexto disponible cerca de un 50%, a cambio de perder aproximadamente un 27% de velocidad de generación.

## Requisitos de hardware

- VRAM estimada: el fichero pesa 13,40 GB; con KV Q8_0 y MTP activo, 64K de contexto añaden ~315 MiB de spill en una GPU de 16 GB, por lo que 16 GB es el mínimo práctico para esa configuración.
- GPU recomendadas: RX 9070 XT (16 GB, medida por el autor con RADV/Vulkan); para 27B en cuantización de 4 bits son adecuadas tarjetas de 24 GB o más (RTX 4090, RTX 3090, A100 40 GB, H100) si se busca contexto largo sin spill.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB con contexto de 32K-64K; en 24 GB permite 96K-128K con KV Q5_0/Q4_1.
- Opciones de despliegue: llama.cpp (llama-server) con Vulkan o CUDA; compatible con LM Studio y Hugging Face Hub según los metadatos incluidos. No se documenta soporte de vLLM ni TGI para este fichero GGUF.
- Latencia y throughput: 965 t/s de prompt y 44 t/s de generación a 64K con KV Q8_0 y MTP; 865 t/s y 48 t/s a 96K con KV Q5_0/Q4_1.
- Nota de configuración: greedy decoding puede entrar en bucle; debe mantenerse la temperatura recomendada en la model card del modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-27B-MIX_GGUF (esta ficha) | 27,3B | hasta 160K según KV | IQ4_XS-MIX, 3,924 BPW, 13,40 GB | Polyform Small Business 1.0.0 | Hugging Face, 1.085 descargas |
| ThinkingCap-Qwen3.8-27B IQ4_XS (BottleCap, referencia) | 27,3B | igual arquitectura base | IQ4_XS uniforme, 4,25 BPW, 15,48 GB | Polyform Small Business 1.0.0 | Hugging Face |
| Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF (release que reemplaza a esta) | 27,3B (base Qwen3.8-27B) | no disponible | GSQ-RCO GGUF | no disponible | Hugging Face |

La comparación directa de calidad con otros modelos de 27B no está disponible, ya que no se publican benchmarks en la información proporcionada.

## Limitaciones y advertencias

- Publicación marcada como reemplazada: el propio autor recomienda usar Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF en su lugar; esta página queda como archivo.
- Licencia Polyform Small Business 1.0.0: no es una licencia de código abierto; restringe el uso comercial a pequeñas empresas según sus términos, por lo que debe revisarse antes de cualquier despliegue en producción.
- Riesgo de bucle en decodificación greedy: es obligatorio mantener la temperatura recomendada por el modelo base.
- Spill silencioso de VRAM a memoria del sistema: por encima de ~1,6 GB de spill el rendimiento cae un 35%-46%, y el fallback no siempre se notifica de forma visible.
- La visión requiere un fichero mmproj externo (mmproj-ThinkingCap-Qwen3.8-27B-f16.gguf); sin él, el modelo solo procesa texto.
- No se documentan evaluaciones de sesgo, alucinación ni calidad multilingüe para esta cuantización; los recortes agresivos en los bloques 0-15 (IQ2_XXS) pueden degradar tareas sensibles a las primeras capas.
- El rendimiento medido corresponde a una única GPU (RX 9070 XT con RADV/Vulkan); no hay datos para CUDA ni para otros modelos de tarjeta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vmarcelo/ThinkingCap-Qwen3.8-27B-MIX_GGUF
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- GGUF f16 del autor original y mmproj: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B-GGUF
- Licencia: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B-GGUF/blob/main/LICENSE
- Release recomendada por el autor: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
