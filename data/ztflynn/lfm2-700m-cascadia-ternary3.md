# ZTFlynn/LFM2-700M-Cascadia-ternary3

## Resumen

ZTFlynn/LFM2-700M-Cascadia-ternary3 es un paquete de compresión extrema del modelo LFM2-700M de Liquid AI, desarrollado por ZTFlynn mediante la técnica Cascadia. Cascadia combina una superficie spline (B-spline) ajustada a cada matriz de pesos con tablas de búsqueda (lookup tables) por banda y un codebook k-means sobre los residuos, logrando reducir el checkpoint original de 1,42 GB a 495 MB (factor 3,01x) a 0,60 bytes por peso. El resultado es un modelo ejecutable en CPU mediante un runtime C minimalista cuyas únicas dependencias son libc, libm y libgomp.

Este modelo resuelve el problema del despliegue de LLMs en dispositivos con recursos muy limitados (edge, móviles, laptops modestas) sin necesidad de GPU. Su relevancia actual radica en que demuestra una ruta de compresión alternativa a las cuantizaciones clásicas (GGUF, GPTQ) que preserva la estructura de los pesos mediante un manifold spline, y lo hace con una pérdida de calidad cuantificada y acotada. El paquete está pensado para inferencia batch-1 en CPU, con generación greedy o muestreo controlado por semilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrida: 16 bloques, GQA 24q/8kv, gated short convolutions |
| Parametros totales | Aproximadamente 700M (modelo base LFM2-700M; desglose: 642M lineales + 101M embedding) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base LFM2-700M soporta hasta 32k segun documentacion de Liquid AI, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Cascadia ternary-3 (0,60 bytes/peso, 5,31 bits/peso con outliers exactos) |
| Idiomas soportados | Ingles |
| Licencia | lfm-open-license (ver enlace en la seccion de enlaces) |
| Formato de pesos | Formato Cascadia: `weights.bin` (493 MB), `manifest.json`, `aux.bin`, `tokenizer.bin` |

## Arquitectura y entrenamiento

El modelo base LFM2-700M es un transformer hibrido desarrollado por Liquid AI, disenado para despliegue on-device. Su arquitectura combina convoluciones cortas con gating (short convolutions) con un numero reducido de bloques de atencion de query grouping (GQA), lo que acelera prefill y decode en CPU. El paquete Cascadia no anade entrenamiento adicional; es una compresion post-hoc del checkpoint bf16 original.

El metodo Cascadia ajusta una superficie B-spline a cada matriz de pesos para capturar su estructura a gran escala. Cada peso se asigna a una de 32 bandas segun su valor spline, y se aprende un codebook k-means por banda sobre los residuos. El 0,5% de los errores mas grandes se conservan exactos en f32. Los indices del codebook se empaquetan en base 3 (5 trits por byte). La reconstruccion se realiza como `W = spline(j,c) + codebook[band][index]` dentro del matvec, sin construir nunca la matriz densa. El embedding atado (que tambien actua como lm_head) usa un codebook global de 81 entradas para minimizar el error que llega a los logits.

## Capacidades

- Generacion de texto en ingles con decodificacion greedy o muestreo (temperatura, top-k, top-p) reproducible por semilla.
- Ejecucion en CPU pura mediante runtime C de Cascadia, sin dependencias mas alla de libc, libm y libgomp.
- Inferencia batch-1, adecuada para workloads de edge y procesamiento por lotes.
- Detencion automatica en el token `<|im_end|>`.
- No soporta tool calling, agentes, vision ni audio (es un modelo base comprimido, sin capa de instrucciones).

## Casos de uso

- Inferencia en dispositivos embebidos: el paquete de 495 MB cabe en la RAM de una Raspberry Pi 4 (2 GB) o similares, permitiendo generar texto localmente sin conexion.
- Prototipado rapido en CPU: al no requerir GPU, se puede integrar en pipelines de desarrollo donde el hardware acelerado no esta disponible.
- Generacion de texto en aplicaciones de escritorio ligeras: por ejemplo, un asistente de redaccion que funcione en un portatil con 4 GB de RAM.
- Procesamiento por lotes en servidores CPU-only: para tareas de clasificacion o extraccion de texto donde el rendimiento por token es menos critico que la memoria.
- Educacion e investigacion en compresion de modelos: el paquete incluye metricas de fidelidad y perplexity detalladas, util para estudiar el equilibrio entre compresion y calidad.
- Despliegue en entornos con restricciones de licencia o red: al ser un paquete autocontenido, se puede distribuir sin depender de servicios externos.

## Benchmarks y rendimiento

La model card reporta perplexity sobre 16.352 tokens pareados de FineWeb-Edu en 31 ventanas independientes de 512 tokens, comparando el modelo original bf16 con el paquete comprimido:

| Modelo | Perplexity |
|---|---:|
| LiquidAI/LFM2-700M (bf16) | 136,44 |
| ZTFlynn/LFM2-700M-Cascadia-ternary3 | 153,51 |
| **Incremento** | **+12,51%** (IC 95% [1,0917x, 1,1567x], t = +7,92) |

Ademas, se reporta la fidelidad de reconstruccion medida sobre el 100% de los tensores:

| Metrica | Valor |
|---|---:|
| Error L2 relativo vs checkpoint bf16 | 0,0547 |
| Ganancia sistematica (1,0000 = fiel) | 0,9993 |
| Error L2 por clase: linear (642M params) | 0,0579 |
| Error L2 por clase: embedding (101M params) | 0,0276 |

No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta en CPU. La memoria RAM necesaria es aproximadamente 1 GB (495 MB de pesos + overhead del runtime).
- CPU recomendada: cualquier x86-64 o ARM64 con soporte para OpenMP (libgomp). Se ha probado en entornos de escritorio y se espera que funcione en SBC como Raspberry Pi.
- GPU: no necesaria, aunque si se dispone de una, el runtime no la aprovecha (solo CPU).
- Opciones de despliegue: runtime C de Cascadia (compilado con CMake) o integracion Python via `cascadia.load_compressed` (requiere ademas el modelo base en transformers).
- Latencia y throughput: no se proporcionan mediciones especificas. Dado el tamano (700M params) y la arquitectura hibrida, se espera un throughput de decenas de tokens por segundo en CPUs modernas, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Compresion | Perplexity (FineWeb-Edu) | Licencia | Formato |
|---|---|---|---|---|---|---|
| LiquidAI/LFM2-700M (bf16) | ~700M | 32k (segun doc. oficial) | Original | 136,44 | lfm-open-license | transformers/safetensors |
| ZTFlynn/LFM2-700M-Cascadia-ternary3 | ~700M | No disponible | 3,01x (495 MB) | 153,51 | lfm-open-license | Cascadia (runtime C) |
| Otros modelos comprimidos de tamano similar (p.ej. Qwen2.5-0.5B-GGUF) | ~500M | 32k | Variable (GGUF Q4) | No comparable (otro corpus) | Apache 2.0 | GGUF |

La comparacion directa con otros modelos comprimidos no es posible porque los benchmarks se han medido sobre corpus distintos. La unica comparacion rigurosa es contra el modelo original, que se muestra en la tabla.

## Limitaciones y advertencias

- El paquete solo se ejecuta bajo el runtime C de Cascadia, no es un checkpoint de `transformers` directamente. Requiere compilar el runtime y cargar el paquete con la API especifica.
- La generacion esta limitada a batch-1 y a decodificacion greedy o muestreo basico; no hay beam search.
- La perdida de calidad es significativa: +12,5% de perplexity respecto al original, concentrada principalmente en el embedding atado.
- El modelo solo soporta ingles; no hay capacidad multilingue.
- La licencia lfm-open-license (de Liquid AI) puede tener restricciones para uso comercial; se debe revisar el texto completo de la licencia.
- No se han realizado evaluaciones de sesgos o alucinaciones especificas para este paquete comprimido.
- El modelo base LFM2-700M no incluye capa de instrucciones (no es un modelo chat), por lo que no es adecuado para tareas de dialog o seguimiento de instrucciones complejas sin un fine-tuning previo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZTFlynn/LFM2-700M-Cascadia-ternary3
- Repositorio del runtime Cascadia: https://github.com/EntroMorphic/cassie
- Documentacion del formato de paquete: https://github.com/EntroMorphic/cassie/blob/main/docs/package_format.md
- Modelo base LFM2-700M: https://huggingface.co/LiquidAI/LFM2-700M
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2-700M/blob/main/LICENSE
- Technical report de LFM2 (arXiv): https://arxiv.org/abs/2511.23404
- Blog de Liquid AI sobre LFM2: https://www.liquid.ai/blog/liquid-foundation-models-v2-our-second-series-of-generative-ai-models
- Inspiracion del metodo: https://huggingface.co/Magneato/deepseek-r1-qwen-7b-lutc
