# TelperionAI/Qwen3.8-27B-FP8-block-AWQ

## Resumen

TelperionAI/Qwen3.8-27B-FP8-block-AWQ es una cuantización FP8 block-scaled del modelo Qwen/Qwen3.8-27B, desarrollada por TelperionAI. El checkpoint aplica un pre-paso de suavizado AWQ (activation-aware weight quantization) sobre los pesos BF16 antes de la cuantización FP8 con bloques de `[128, 128]` y activaciones dinámicas, manteniendo el mismo formato y las mismas 882 módulos excluidos que el release FP8 oficial de Qwen. El resultado es un modelo de aproximadamente 30 GB que funciona como drop-in para vLLM y alcanza 8.656 tokens por segundo en una B300 con tensor parallelism de 2.

La relevancia de este modelo radica en que el suavizado AWQ reduce el daño real de la cuantización en un 45% respecto al FP8 oficial de Qwen: el disagreement confiado frente al modelo BF16 base baja del 1,45% al 0,79%, con una significancia estadística de z = +9,80. Esto lo convierte en una opción atractiva para despliegues en producción donde se necesita alta velocidad de inferencia sin sacrificar fidelidad. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para entornos vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención por grupos (GQA), 64 capas, hidden size 5.120, 24 cabezas de consulta y 4 de clave/valor |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 block-scaled `[128, 128]` con AWQ smoothing y activaciones dinámicas; el autor publica además variantes INT4-AWQ-GPTQ, NVFP4 y EXL3 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B es un transformer denso con atención por grupos (GQA), 64 capas, dimensión oculta de 5.120, 24 cabezas de consulta y 4 cabezas de clave/valor. No se trata de una arquitectura MoE ni híbrida. La cuantización aquí descrita es un proceso post-entrenamiento: primero se aplica un suavizado AWQ sobre los pesos BF16, que es una transformación que preserva la función (pliega `1/s` en la normalización precedente y `s` en la dimensión de entrada del siguiente lineal), calibrada con 256 secuencias. Después se cuantizan los pesos a FP8 con bloques de `[128, 128]` y activaciones dinámicas por grupo, excluyendo los mismos 882 módulos que excluye Qwen (router y `shared_expert_gate`, cuyas dimensiones no son divisibles por 128). La etapa FP8 no requiere calibración adicional, ya que las escalas de peso se derivan del propio tensor y las activaciones se escalan en tiempo de ejecución.

La innovación clave es el uso de AWQ a 8 bits. AWQ corrige outliers de activación, que son una propiedad del modelo y no del cuantizador, por lo que la corrección se transfiere entre formatos. Medido sobre este modelo, el AWQ reduce el disagreement confiado del 1,45% al 0,79% en FP8 block, y también mejora otras cuantizaciones como NVFP4 (del 3,97% al 2,69%) o un trellis de 4 bits (del 3,08% al 2,40%). GPTQ y AutoRound no transfieren de esta manera porque su compensación de error está ligada a decisiones de redondeo específicas de una rejilla concreta.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-27B, aunque la documentación de esta cuantización no detalla capacidades específicas.
- Inferencia de alta velocidad: diseñado para vLLM, alcanza 8.656 tokens por segundo en una B300 con TP=2, lo que lo hace adecuado para servicios en tiempo real.
- Fidelidad de cuantización: el disagreement confiado frente al BF16 es del 0,79%, el más bajo entre las variantes comparadas por el autor, con un 0,08% de disagreement "certain".
- Compatibilidad con vLLM: es drop-in para vLLM, sin necesidad de re-cuantización ni pasos adicionales.
- Soporte de tool calling, agentes y multilingüismo: no documentado en la model card; se asume que son los del modelo base, pero no se confirma en esta ficha.

## Casos de uso

- Despliegue de asistentes conversacionales en producción: gracias a su compatibilidad directa con vLLM y su alta velocidad (8.656 tok/s en B300 con TP=2), puede servir chatbots interactivos con baja latencia y alta concurrencia.
- Inferencia en entornos con memoria limitada: con ~30 GB de pesos, cabe en una GPU de 40 GB (A100, H100) o en dos de 24 GB con tensor parallelism, permitiendo ejecutar un modelo de 27 B en hardware de gama media-alta.
- Procesamiento por lotes de generación de texto: su alto throughput lo hace adecuado para tareas de generación masiva, como redacción de informes, resúmenes o contenido estructurado.
- Sustitución del FP8 oficial de Qwen: al ofrecer menor pérdida de calidad (0,79% vs 1,45% de disagreement confiado) con el mismo formato y tamaño, puede reemplazar al checkpoint FP8 de Qwen en pipelines existentes sin cambios de código.
- Evaluación de calidad de cuantización: el autor proporciona una metodología detallada de medición (disagreement por buckets de confianza), útil para equipos que necesitan validar la fidelidad de sus despliegues cuantizados.
- Investigación sobre cuantización: el enfoque de AWQ smoothing previo a FP8 block puede servir como referencia para experimentos con otros modelos o formatos, dado que demuestra transferibilidad entre cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor presenta una tabla de calidad de cuantización frente al modelo BF16 base, medida sobre 231 documentos y 142.727 posiciones de token puntuadas. Las columnas representan tasas de disagreement con el BF16, divididas por el margen de confianza del modelo base (top1−top2 logprob): `near-tie` (< 0,5), `moderate` (0,5–2), `confident` (2–5) y `certain` (> 5). Solo `confident` y `certain` se consideran daño real. `divmed` es la mediana del índice de token en el que la generación greedy libre diverge del base.

| build | tamaño | top-1 ↑ | near-tie ↓ | moderate ↓ | confident ↓ | certain ↓ | divmed ↑ | tok/s |
|---|---|---|---|---|---|---|---|---|
| **Este modelo (FP8 block + AWQ)** | 30 GB | 96,22% | 22,83% | 3,76% | **0,79%** | **0,08%** | 51 | **8.656** |
| TelperionAI INT4-AWQ-GPTQ | 25,1 GB | **96,30%** | **22,29%** | 3,52% | 0,93% | 0,09% | 48 | 4.617 |
| TelperionAI EXL3 6,5 bpw + AWQ | 23,0 GB | 97,10% | 17,03% | 2,41% | 1,23% | 0,15% | 59 | — |
| TelperionAI EXL3 5,5 bpw + AWQ | 20,0 GB | 96,12% | 22,81% | 3,52% | 1,34% | 0,16% | 55 | — |
| Qwen FP8 (mismo formato, sin AWQ) | 30 GB | 96,15% | 22,70% | 3,48% | 1,45% | **0,08%** | 47 | 8.711 |
| TelperionAI NVFP4 | 24,7 GB | 93,62% | 32,25% | 8,59% | 1,85% | 0,16% | 29 | 10.521 |
| RadixArk NVFP4 | 24,7 GB | 90,23% | 43,80% | 14,49% | 3,29% | 0,70% | 11 | 11.436 |
| unsloth NVFP4 | 24,7 GB | 91,75% | 40,12% | 10,32% | 3,91% | 0,25% | 19 | 11.069 |
| Inferact NVFP4 | 20,1 GB | 84,11% | 52,01% | 25,70% | 10,39% | 2,27% | 7 | 11.457 |

Las filas EXL3 no tienen `tok/s` comparable porque se ejecutan en exllamav3, no en vLLM. La significancia estadística se evaluó con McNemar pareado sobre n = 33.812 posiciones: este modelo supera a TelperionAI NVFP4 (z = +14,80), a Qwen FP8 (z = +9,80), a EXL3 5,5 bpw (z = +9,14), a EXL3 6,5 bpw (z = +7,43) y a INT4-AWQ-GPTQ (z = +2,46). También empata el mejor valor de `certain` del campo (0,08%).

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa ~30 GB en FP8. Para inferencia con contexto moderado se recomienda una GPU con al menos 40 GB de VRAM, o dos GPUs de 24 GB con tensor parallelism (TP=2).
- GPUs recomendadas: B300 (medida del autor, 8.656 tok/s con TP=2), A100 40 GB, H100 80 GB, o dos RTX 4090/RTX 6000 Ada en configuración TP=2.
- Compatibilidad con GPUs de consumo: no cabe en una sola GPU de 24 GB (p. ej., RTX 4090) sin cuantización adicional; se necesitaría TP=2 o una variante más pequeña (INT4, NVFP4).
- Opciones de despliegue: vLLM (soporte nativo, drop-in), también puede usarse con otros motores que soporten FP8 block-scaled, aunque no se documentan.
- Latencia y throughput: 8.656 tok/s en B300 con TP=2; en hardware inferior el throughput será menor, pero no se proporcionan datos adicionales.

## Comparativa con modelos similares

La siguiente tabla compara este modelo con otras cuantizaciones del mismo modelo base Qwen3.8-27B, según los datos del autor. Todas comparten licencia Apache 2.0 y formato safetensors.

| Modelo | Tamaño | Cuantización | Confident disagreement ↓ | Certain disagreement ↓ | tok/s (B300 TP=2) |
|---|---|---|---|---|---|
| **Este modelo (FP8 block + AWQ)** | 30 GB | FP8 block `[128,128]` + AWQ | **0,79%** | **0,08%** | 8.656 |
| Qwen FP8 (oficial) | 30 GB | FP8 block `[128,128]` | 1,45% | **0,08%** | 8.711 |
| TelperionAI INT4-AWQ-GPTQ | 25,1 GB | INT4 AWQ + GPTQ | 0,93% | 0,09% | 4.617 |
| TelperionAI NVFP4 | 24,7 GB | NVFP4 + AWQ + GPTQ | 1,85% | 0,16% | 10.521 |
| TelperionAI EXL3 6,5 bpw + AWQ | 23,0 GB | EXL3 6,5 bpw + AWQ | 1,23% | 0,15% | — |

Este modelo ofrece el mejor equilibrio entre fidelidad (menor disagreement confiado) y velocidad, aunque el NVFP4 es más rápido pero con mayor pérdida de calidad. El INT4 es más pequeño pero más lento y con peor fidelidad que el FP8+AWQ.

## Limitaciones y advertencias

- Pérdida de precisión inherente a la cuantización: aunque el AWQ reduce el daño, el modelo no es idéntico al BF16 base; el disagreement confiado es del 0,79% y el "certain" del 0,08%.
- Los módulos excluidos (router y `shared_expert_gate`) no se cuantizan, por lo que el ahorro de memoria no es uniforme en toda la red.
- No se documentan sesgos específicos de esta cuantización; los sesgos del modelo base Qwen3.8-27B no se detallan en la model card.
- Riesgo de alucinación: no se aborda en la documentación; es un riesgo inherente al modelo base.
- Limitaciones de contexto e idiomas: no disponibles en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen/Qwen3.8-27B.
- Para producción, se recomienda validar el comportamiento en el caso de uso específico, dado que las métricas de disagreement se basan en un conjunto de evaluación propio del autor y no en benchmarks estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TelperionAI/Qwen3.8-27B-FP8-block-AWQ
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante INT4-AWQ-GPTQ: https://huggingface.co/TelperionAI/Qwen3.8-27B-INT4-AWQ-GPTQ
- Variante NVFP4-AWQ-GPTQ: https://huggingface.co/TelperionAI/Qwen3.8-27B-NVFP4-AWQ-GPTQ
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Visor de arquitectura (hfviewer): https://hfviewer.com/TelperionAI/Qwen3.8-27B-INT4-AWQ-GPTQ-gdn4
- Entrada en LLM Explorer: https://llm-explorer.com/model/TelperionAI%2FQwen3.8-27B-NVFP4-AWQ-GPTQ,7sti5ZDCLMFpd7O9iPnnBQ
