# thinkspread/Qwen3.6-35B-A3B-Q5K-IQ3XXS-GGUF

## Resumen

Qwen3.6-35B-A3B-Q5K-IQ3XXS-GGUF es una cuantización GGUF personalizada del modelo base Qwen3.6-35B-A3B de Qwen, publicada por el usuario thinkspread en HuggingFace. No es un modelo nuevo, sino un archivo de pesos optimizado para decodificación de un solo flujo en Macs con Apple Silicon de 24 GB de memoria unificada. Su propuesta de valor es concreta: decodifica aproximadamente un 19 % más rápido que el archivo UD-Q3_K_M de unsloth del que procede, con solo un 0,6 % de penalización en perplejidad.

El modelo base es un MoE (mixture of experts) de 34.660.610.688 parámetros totales de los que solo unos 3B se activan por token (según la nomenclatura A3B), lo que permite ejecutar un modelo de 35B en hardware de consumo. La cuantización aplica una mezcla selectiva: Q5_K/Q6_K para los tensores densos (atención, experto compartido, embeddings) y IQ3_XXS/IQ4_XS para los expertos enrutados, reduciendo la lectura por token de 2,46 GB a 1,90 GB.

Es relevante ahora porque los MoE grandes con pocos parámetros activos son el formato dominante para inferencia local, y esta ficha demuestra que ajustar la granularidad de cuantización por tipo de tensor puede mejorar el throughput sin degradar perceptiblemente la calidad. El archivo pesa 16,0 GB y es solo de texto, sin proyector de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con Gated DeltaNet y atención (híbrido), solo texto |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | ~3B por token (nomenclatura A3B; 8 de 256 expertos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K (output), Q6_K (atención, experto compartido, embeddings), IQ3_XXS (gate/up de expertos), IQ4_XS (down de expertos, Q6_K en capas 34, 38 y 39), router en F32 |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (16,0 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un MoE que combina proyecciones de atención y Gated DeltaNet (una capa recurrente lineal tipo delta-net con compuertas) como tensores densos, con 256 expertos enrutados de los que se leen 8 por token, más un experto compartido. Esta estructura explica la estrategia de cuantización: en un MoE con pocos expertos activos, los tensores densos dominan el ancho de banda por token (2,02 GB de los 2,46 GB originales), mientras que los expertos se leen de forma dispersa.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no hay datos disponibles en la información proporcionada. Respecto a la cuantización en sí: el autor partió del archivo UD-Q3_K_M de unsloth (con imatrix) y requantizó únicamente los tensores densos, copiando los expertos byte a byte. Experimentó con la receta usada para Qwen3.5 (todo denso en Q5_K), que costaba un 1,0 % de perplejidad en Qwen3.6 frente al 0,24 % en Qwen3.5, y determinó que la pérdida se reparte entre grupos de tensores. Subir atención, experto compartido y embeddings a Q6_K recupera aproximadamente el 40 % de esa pérdida añadiendo solo 52 MB por token, ya que el embedding solo lee una fila por token. Los expertos enrutados permanecen en IQ3_XXS (gate/up) e IQ4_XS (down), con el router en F32.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.6-35B-A3B (sin benchmarks especificos publicados en esta ficha).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada (el modelo base es conversacional; la ficha no lo detalla).
- Vision, audio u otras modalidades: no disponibles; el archivo es exclusivamente de texto y no incluye proyector de vision.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Chatbot local en Apple Silicon de 24 GB: el archivo está ajustado para que el working set quepa en la GPU unificada de un M5 Pro de 24 GB, con 95-96 tok/s de decodificación, suficiente para conversación fluida en tiempo real.
- Servidor LLM personal con API compatible: mediante tempo9 u llama-server se expone una API compatible con OpenAI/Anthropic, útil para integrar el modelo en editores de código, clientes de chat o automatizaciones locales sin depender de la nube.
- Procesamiento por lotes de documentos de texto: con ~3B de parámetros activos por token y decodificación a ~96 tok/s, es adecuado para resumir o clasificar grandes volúmenes de texto en local con coste energético bajo.
- Prototipado de aplicaciones sobre MoE: al ser un GGUF estándar de llama.cpp, permite probar el comportamiento de Qwen3.6-35B-A3B sin necesidad de GPUs de datacenter.
- Comparativa de cuantizaciones en investigación local: la ficha documenta una metodología reproducible (llama-quantize con reglas por tensor) útil para quien estudie el impacto de la cuantización mixta en perplejidad y velocidad.
- Asistente técnico offline: la perplejidad se midió sobre prosa técnica en inglés y el archivo mantiene calidad cercana al original, lo que lo hace adecuado para consultas técnicas en entornos sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor sí publicó mediciones propias de decodificación y perplejidad relativa (Apple M5 Pro de 24 GB, tempo9 1.2.1, generación greedy de 256 tokens, perplejidad sobre 24 fragmentos de 2048 tokens de prosa técnica en inglés; comparación solo relativa):

| Archivo | Lectura / token | Decode tok/s | PPL |
|---|---|---|---|
| unsloth UD-Q3_K_M (denso Q8_0) | 2,46 GB | 80,4–80,8 | 6,415 |
| denso Q6_K | 2,10 GB | 88,1–89,2 | 6,418 |
| **Este archivo** | **1,90 GB** | **95,5–96,1** | **6,452** |
| denso Q5_K (receta Qwen3.5) | 1,85 GB | 97,6–97,8 | 6,479 |
| denso Q4_K | 1,61 GB | — | 6,612 |

## Requisitos de hardware

- VRAM/memoria estimada: el archivo pesa 16,0 GB; está diseñado para caber en el working set de GPU de un Mac Apple Silicon de 24 GB de memoria unificada. Para GPUs NVIDIA discretas, se necesitaría una tarjeta con ~18-20 GB de VRAM libres más overhead de contexto (estimación no confirmada por el autor).
- GPU recomendadas: Apple M5 Pro de 24 GB (plataforma de las mediciones del autor). Para NVIDIA, una RTX 4090 (24 GB) debería alojarlo; no hay mediciones publicadas para otras plataformas.
- Consumer GPU: sí, cabe en una RTX 4090 o equivalente de 24 GB, y en Macs Apple Silicon de 24 GB; en tarjetas de 16 GB no cabe el archivo completo en VRAM (podría funcionar con offload parcial a CPU a costa de throughput).
- Despliegue: tempo9 (servidor local compatible con APIs de OpenAI/Anthropic) y llama.cpp (`llama-server -hf thinkspread/Qwen3.6-35B-A3B-Q5K-IQ3XXS-GGUF:Q5K_IQ3XXS -ngl 99 -fa on`). Al ser GGUF, también debería funcionar con Ollama y LM Studio, aunque no se menciona explícitamente.
- Latencia y throughput: 95,5–96,1 tok/s de decodificación en M5 Pro de 24 GB (generación greedy, prompt corto); lectura de 1,90 GB por token. No hay datos de time-to-first-token.

## Comparativa con modelos similares

Comparativa entre archivos GGUF del mismo modelo base y la variante anterior del mismo autor:

| Archivo | Tamano | Lectura/token | Decode tok/s (M5 Pro 24 GB) | PPL relativa | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Q5K-IQ3XXS (este) | 16,0 GB | 1,90 GB | 95,5–96,1 | 6,452 | Apache 2.0 |
| unsloth/Qwen3.6-35B-A3B-GGUF (UD-Q3_K_M) | no disponible | 2,46 GB | 80,4–80,8 | 6,415 | Apache 2.0 |
| thinkspread/Qwen3.5-35B-A3B-Q5K-IQ3XXS-GGUF | no disponible | 1,85 GB | 97,6–97,8 (variante Q5_K denso) | 6,479 (sobre Qwen3.6) | Apache 2.0 |

Frente a otros modelos de la categoría MoE ~35B-A3B (por ejemplo, Qwen3-30B-A3B u otros MoE ligeros de la competencia), no hay datos comparativos disponibles en la información proporcionada.

## Limitaciones y advertencias

- Solo texto: el archivo no incluye proyector de visión, por lo que no puede procesar imágenes aunque el modelo base lo soportara.
- Sesgos conocidos: no disponibles en la información proporcionada; hereda los del modelo base Qwen3.6-35B-A3B.
- Riesgo de alucinación: inherente a todo LLM; la cuantización agresiva de los expertos (IQ3_XXS) puede aumentar ligeramente el error, aunque la perplejidad medida solo sube un 0,6 % respecto al original.
- La perplejidad publicada es una comparación relativa sobre prosa técnica en inglés (24 fragmentos); no es un benchmark estandarizado ni garantiza rendimiento en otras tareas o idiomas.
- Idiomas soportados y longitud de contexto: no disponibles en la ficha; verificar en la model card del modelo base antes de uso en producción.
- La cuantización se optimizó para decodificación de un solo flujo (single-stream) en Apple Silicon; en servidores con muchos usuarios concurrentes o en GPUs NVIDIA el perfil de rendimiento puede ser distinto.
- Licencia Apache 2.0: permite uso comercial sin restricciones significativas, heredada del modelo base.
- Es una cuantización de terceros (thinkspread, 248 descargas, sin validación oficial de Qwen); para cargas críticas puede preferirse el archivo oficial de unsloth o los pesos originales.
- Requiere una versión de llama.cpp que soporte los tipos IQ3_XXS/IQ4_XS y las reglas de tensor-type usadas en su creación.

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/thinkspread/Qwen3.6-35B-A3B-Q5K-IQ3XXS-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- GGUF de unsloth (fuente de los expertos): https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF
- Variante anterior para Qwen3.5 del mismo autor: https://huggingface.co/thinkspread/Qwen3.5-35B-A3B-Q5K-IQ3XXS-GGUF
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Herramienta tempo9 mencionada en la ficha: https://github.com/thinkspread/tempo9
