# yuekai/SGLang-EAGLE3-Qwen3-30B-A3B-Instruct-2507-SpecForge-Nex

## Resumen

Este repositorio contiene un checkpoint de decodificación especulativa EAGLE3 para el modelo Qwen/Qwen3-30B-A3B-Instruct-2507, distribuido como parte de la iniciativa SpecBundle Phase 1. El autor, yuekai, publica una copia parcheada del checkpoint original de lmsys (entrenado por el equipo Nex-AGI) que corrige un único campo de configuración: `max_position_embeddings` pasa de 2048 a 40960, el contexto máximo del modelo objetivo. Los pesos son byte-for-byte idénticos al original; el cambio solo afecta a la lectura del campo por parte de stacks de inferencia como vLLM, que de otro modo recortarían el caché RoPE del drafter y colapsarían la tasa de aceptación especulativa más allá de 2048 posiciones.

El modelo es un drafter auxiliar, no un modelo autónomo: no tiene tabla de embeddings propia y depende del modelo base Qwen3-30B-A3B-Instruct-2507 para compartir esa tabla. Con 183 millones de parámetros, su función es generar múltiples tokens candidatos en paralelo para acelerar la inferencia del modelo MoE de 30B (3B activos) mediante speculative decoding. Su relevancia radica en que permite desplegar Qwen3-30B-A3B con una latencia notablemente menor en entornos de producción, sin sacrificar calidad de generación, siempre que se use con SGLang u otro motor compatible con EAGLE3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EAGLE3 (drafter de decodificacion especulativa) |
| Parametros totales | 183.168.640 (segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 40960 (configurado en este fork; entrenado originalmente con 2048) |
| Tipos de cuantizacion | No especificados (pesos en safetensors, formato original) |
| Idiomas soportados | No disponible (depende del modelo base Qwen3-30B-A3B) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

EAGLE3 es un método de decodificación especulativa basado en una cabeza autoregresiva ligera que predice múltiples tokens futuros a partir de las representaciones ocultas del modelo objetivo. En este caso, el drafter se entrena sobre Qwen3-30B-A3B-Instruct-2507, un modelo MoE de Alibaba con 30B parámetros totales y 3B activos, arquitectura Qwen3MoE con Grouped-Query Attention (GQA). El entrenamiento del drafter se realizó con el dataset `mlabonne/open-perfectblend` bajo el framework SpecForge, según indica la model card del repositorio original de lmsys. No se proporcionan detalles sobre el número de tokens de entrenamiento ni sobre el uso de RLHF o DPO en esta información.

El drafter utiliza el prefijo de claves `midlayer.` en lugar del habitual `layers.0.`, y no registra `norm_before_residual` en su `config.json`. Estas particularidades requieren que el motor de inferencia (p. ej., SGLang) tenga soporte específico para esta familia de checkpoints. El fork de yuekai no altera el layout del checkpoint, solo el campo `max_position_embeddings`.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa: genera múltiples tokens candidatos que el modelo base verifica en paralelo, reduciendo la latencia por token.
- Compatible con SGLang (incluido en su documentación oficial para Qwen3) y potencialmente con otros motores que soporten EAGLE3 (p. ej., vLLM con parches específicos).
- No es un modelo de propósito general: no genera texto por sí mismo, sino que actúa como drafter para el modelo Qwen3-30B-A3B-Instruct-2507.
- Hereda el soporte multilingüe y las capacidades de razonamiento, código y matemáticas del modelo base, pero solo cuando se usa junto con él.
- Pensado para entornos de producción donde la latencia es crítica (serving, agentes multi-step, tool calling).

## Casos de uso

- Serving de Qwen3-30B-A3B en producción con SGLang: el drafter reduce la latencia de generación en hasta un factor significativo (los benchmarks del repo original reportan mejoras de throughput), permitiendo servir más peticiones concurrentes con la misma infraestructura.
- Agentes autónomos con razonamiento multi-step: la menor latencia por token hace viable el uso de cadenas de pensamiento largas y llamadas a herramientas en tiempo real, donde cada paso de razonamiento se beneficia de la generación especulativa.
- Asistentes de código en IDE: el modelo base es fuerte en generación de código; el drafter acelera la autocompletación de líneas y bloques, mejorando la experiencia de usuario en herramientas de desarrollo.
- Chatbots de atención al cliente con contexto largo: con el fix de `max_position_embeddings` a 40960, el drafter mantiene su tasa de aceptación en conversaciones de hasta 40K tokens, evitando la degradación que sufría con el valor original de 2048.
- Pipelines de generación de documentación técnica: procesamiento por lotes de textos largos donde la aceleración especulativa reduce el tiempo total de cómputo.
- Investigación en decodificación especulativa: este checkpoint sirve como referencia reproducible para estudiar el impacto de la configuración de RoPE en la tasa de aceptación de drafters EAGLE3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este fork específico. La model card remite al repositorio original de lmsys para los datos de entrenamiento, benchmarks y números de rendimiento. Se recomienda consultar [lmsys/SGLang-EAGLE3-Qwen3-30B-A3B-Instruct-2507-SpecForge-Nex](https://huggingface.co/lmsys/SGLang-EAGLE3-Qwen3-30B-A3B-Instruct-2507-SpecForge-Nex) para obtener métricas de tasa de aceptación, latencia y throughput. No se deben asumir valores concretos sin verificación.

## Requisitos de hardware

- El drafter en sí tiene solo 183M parámetros, por lo que ocupa aproximadamente 0.4 GB en memoria (FP16). Cabe en cualquier GPU consumer, incluso integradas.
- Sin embargo, para uso práctico se necesita ejecutar junto con el modelo base Qwen3-30B-A3B-Instruct-2507, que requiere al menos 16-20 GB de VRAM en cuantización (p. ej., AWQ o GPTQ) y 60+ GB en FP16.
- GPUs recomendadas para el conjunto completo: A100 (40/80 GB), H100, RTX 4090 (24 GB) con cuantización, o A10G (24 GB) para entornos cloud.
- El despliegue típico se realiza con SGLang, que tiene soporte nativo para EAGLE3 y gestiona el drafter junto al modelo base. También es posible usar vLLM con parches específicos, aunque la documentación oficial de SGLang es la referencia principal.
- La latencia y throughput dependen fuertemente del hardware y la configuración de tensor parallelism; no se proporcionan cifras concretas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| yuekai/SGLang-EAGLE3-Qwen3-30B-A3B-Instruct-2507-SpecForge-Nex (este) | 183M | 40960 (fix) | MIT | Drafter para Qwen3-30B-A3B |
| lmsys/SGLang-EAGLE3-Qwen3-30B-A3B-Instruct-2507-SpecForge-Nex (original) | 183M | 2048 (config) | MIT | Drafter para Qwen3-30B-A3B |
| SGLang-EAGLE3-Qwen3-235B-A22B-Instruct-2507-SpecForge-Meituan | no disponible | no disponible | no disponible | Drafter para Qwen3-235B-A22B |

No se dispone de comparativas de rendimiento entre drafters de distintos modelos en la información proporcionada. La única diferencia entre este fork y el original es el valor de `max_position_embeddings`; los pesos son idénticos. Existen otros drafters EAGLE3 para Qwen3 de diferentes tamaños (p. ej., el de 235B-A22B de Meituan), pero sin datos de benchmark que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base Qwen3-30B-A3B-Instruct-2507 y un motor compatible con EAGLE3 (SGLang recomendado). No puede usarse para generar texto por sí solo.
- No incluye tabla de embeddings propia; el motor debe compartir la del modelo base. Esto puede causar fallos en stacks que no tengan soporte específico.
- El prefijo de claves `midlayer.` y la ausencia de `norm_before_residual` en el config pueden requerir parches manuales en motores distintos de SGLang.
- El valor original de `max_position_embeddings` de 2048 (antes del fix) provocaba degradación de la tasa de aceptación más allá de esa longitud; este fork corrige el campo, pero no modifica los pesos, por lo que el drafter fue entrenado con secuencias de 2048 tokens y su rendimiento en contextos largos puede no ser óptimo.
- La licencia MIT permite uso comercial, pero el modelo base Qwen3-30B-A3B-Instruct-2507 tiene su propia licencia (Apache 2.0 según Alibaba), que debe verificarse para cumplimiento en producción.
- No hay información sobre sesgos o alucinaciones específicas del drafter; estas dependen del modelo base y de la configuración de despliegue.

## Enlaces

- Repositorio de este fork: https://huggingface.co/yuekai/SGLang-EAGLE3-Qwen3-30B-A3B-Instruct-2507-SpecForge-Nex
- Repositorio original (lmsys, con benchmarks y datos de entrenamiento): https://huggingface.co/lmsys/SGLang-EAGLE3-Qwen3-30B-A3B-Instruct-2507-SpecForge-Nex
- Documentación de SGLang para Qwen3 (incluye uso de EAGLE3): https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3
- Guía de despliegue de Qwen3-30B-A3B en SGLang (Ascend NPUs): https://docs.sglang.io/docs/hardware-platforms/ascend-npus/model-deployment/tutorials/qwen3_30b_a3b
- Implementación oficial de EAGLE-1/2/3 (GitHub): https://github.com/Yunhai-Hu/EAGLE-Qwen3
