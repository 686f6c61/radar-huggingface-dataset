# Unkto/DeepSeek-V4-Flash-0731-DSpark-Drafter-IQ1M-IQ2XXS-GGUF

## Resumen

Este repositorio contiene el modelo **DSpark drafter** para **DeepSeek-V4-Flash-0731**, un modelo auxiliar de decodificación especulativa (speculative decoding) desarrollado por Unkto. Su propósito no es funcionar de forma independiente, sino acompañar al modelo objetivo bajo llama.cpp mediante el esquema `draft-dspark`, generando borradores de tokens que el modelo principal acepta o corrige. La propuesta clave es la cuantización selectiva: los 9 tensores de expertos enrutados (que suponen el 94% del tamaño total) se comprimen a 1-bit (IQ1_M) o 2-bit (IQ2_XXS), mientras que el resto de tensores (atención, auxiliares y expertos compartidos) se mantienen en alta precisión (Q8_0/F32/BF16).

El resultado es un drafter de aproximadamente 4,5-5,2 GiB, frente a los 10,9 GiB de la versión BF16 original, con una tasa de aceptación de drafts prácticamente idéntica (0,49-0,55 en IQ1_M). Esta reducción de tamaño libera VRAM suficiente para mantener residentes el modelo objetivo y su caché KV, lo que en la práctica mejora la velocidad de decodificación extremo a extremo. El modelo tiene 19.845.850.983 parámetros y se distribuye bajo licencia MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 256 expertos por capa en 3 capas, top-6 activos por token |
| Parametros totales | 19.845.850.983 (~19,85B) |
| Parametros activos | No disponible (solo se activan 6 de 256 expertos por capa y token) |
| Longitud de contexto | No disponible (depende del modelo objetivo DeepSeek-V4-Flash-0731) |
| Tipos de cuantizacion | Expertos enrutados: IQ1_M o IQ2_XXS; resto: Q8_0 / F32 / BF16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El drafter es un modelo MoE con 3 capas, cada una con 256 expertos enrutados de los cuales solo se activan 6 por token. El 94% del tamaño corresponde a los 9 tensores de expertos (gate, up y down por cada una de las 3 capas), mientras que los tensores de atención, auxiliares y expertos compartidos suman aproximadamente 0,6 GiB y se mantienen en alta precisión. La cuantización se realizó con `llama-quantize` usando requantización selectiva (`--allow-requantize`) y una matriz de importancia (imatrix) de los expertos enrutados obtenida del repositorio `antirez/deepseek-v4-gguf`. Los pesos fuente en BF16 provienen de `singulared/DeepSeek-V4-Flash-0731-DSpark-GGUF`.

La innovación técnica principal es que, al tratarse de un modelo de borrador, no necesita precisión completa: el modelo objetivo corrige cualquier error. Por ello, incluso con expertos a 1-bit, la tasa de aceptación de drafts apenas varía respecto al drafter BF16. El modelo requiere una compilación de llama.cpp que soporte el esquema GGUF `dflash` y la decodificación especulativa `draft-dspark`.

## Capacidades

- Decodificación especulativa para DeepSeek-V4-Flash-0731: genera borradores de hasta 5 tokens por paso que el modelo objetivo valida o rechaza.
- Tasa de aceptación de drafts de aproximadamente 0,49-0,55 con IQ1_M, con longitud media de borrador aceptado de 2,4-2,65 tokens.
- Reducción de tamaño de 2,4x frente al drafter BF16 original (4,46 GiB vs 10,9 GiB), lo que permite mantener el modelo objetivo y la caché KV en VRAM.
- Compatibilidad con llama.cpp mediante `--spec-type draft-dspark` y parámetros como `--spec-draft-n-max 5` y `--spec-draft-p-min 0.80`.
- No es un modelo autónomo: no puede generar texto por sí mismo, solo funciona como auxiliar del modelo objetivo.

## Casos de uso

- Inferencia local de DeepSeek-V4-Flash-0731 en hardware con VRAM limitada: el drafter cuantizado libera memoria suficiente para alojar el modelo principal y su caché KV, habilitando el uso en GPUs de consumo.
- Aceleración de decodificación en servidores de inferencia: con llama.cpp y `--spec-type draft-dspark`, se logra hasta 2x de velocidad de decodificación frente a la generación sin borrador, según las referencias de Unsloth.
- Despliegue de agentes de código locales: DeepSeek-V4-Flash-0731 se usa en herramientas como OpenCode para asistentes de programación; el drafter reduce la latencia en entornos interactivos.
- Aplicaciones de escritorio local-first: proyectos como DeepWiki utilizan este modelo para ejecutar DeepSeek V4 Flash en equipos de consumo, y el drafter compacto facilita el ajuste en memoria.
- Entornos de desarrollo con múltiples GPUs: el drafter puede ubicarse en una GPU separada del modelo objetivo, optimizando el balance de carga.
- Pruebas de decodificación especulativa en investigación: sirve como referencia para estudiar el impacto de la cuantización de expertos en modelos MoE auxiliares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que se trata de un modelo auxiliar y no de un modelo generativo independiente. Los datos de rendimiento disponibles se centran en la tasa de aceptación de drafts:

| Metrica | IQ1_M | BF16 (referencia) |
|---|---|---|
| Tasa de aceptacion de drafts | 0,49-0,55 | ~0,49-0,55 |
| Longitud media de borrador aceptado | 2,4-2,65 tokens | 2,4-2,65 tokens |
| Tamano del archivo | 4,46 GiB | 10,9 GiB |

Según la documentación de Unsloth, DeepSeek-V4-Flash-0731 (el modelo objetivo) alcanza 82,7% en Terminal Bench 2.1, 54,4% en DeepSWE y 54,2% en NL2Repo, con DSpark habilitado para GGUFs logrando hasta 2x de velocidad de decodificación.

## Requisitos de hardware

- VRAM estimada para el drafter: aproximadamente 4,5-5,2 GiB según la cuantización (IQ1_M: 4,46 GiB; IQ2_XXS: 5,16 GiB).
- El drafter cabe en GPUs de consumo como RTX 3060 (12 GB) o superiores, pero el modelo objetivo DeepSeek-V4-Flash-0731 requiere mucho más: el GGUF de 8-bit pesa 162 GB y el de 3-bit 103 GB, por lo que necesita sistemas con 110 GB de RAM o múltiples GPUs.
- GPUs recomendadas para el conjunto completo: A100, H100 o configuraciones multi-GPU (por ejemplo, 2x RTX 4090 con 48 GB combinados) para el modelo objetivo, dejando el drafter en una GPU secundaria.
- Opciones de despliegue: llama.cpp (llama-server o llama-cli) con soporte para `dflash` y `draft-dspark`. No es compatible con vLLM, Ollama o TGI en su configuración estándar, ya que requieren el esquema especulativo específico.
- Latencia y throughput estimados: no disponibles de forma cuantitativa; la documentación indica hasta 2x de mejora en velocidad de decodificación frente a la generación sin drafter.

## Comparativa con modelos similares

| Modelo | Tamano | Cuantizacion de expertos | Licencia | Uso |
|---|---|---|---|---|
| Unkto/DeepSeek-V4-Flash-0731-DSpark-Drafter-IQ1M-IQ2XXS-GGUF (este) | 4,46-5,16 GiB | IQ1_M / IQ2_XXS | MIT | Drafter para decodificacion especulativa |
| singulared/DeepSeek-V4-Flash-0731-DSpark-GGUF | 10,9 GiB | BF16 (fuente, precision completa) | MIT | Drafter en precision completa |
| Lynxpda/DeepSeek-V4-Flash-0731-DSpark-Drafter-Q2_K_S-GGUF | ~6,9 GiB | Q2_K_S (k-quant de 2 bits) | MIT | Drafter con cuantizacion uniforme |

La comparativa muestra que la propuesta de Unkto es la más compacta, con una reducción de tamaño de 2,4x frente a BF16 y de 1,3x frente a Q2_K_S, manteniendo una tasa de aceptación similar. La diferencia clave es la cuantización selectiva: solo los expertos enrutados se comprimen, preservando la precisión en los tensores críticos de atención y auxiliares.

## Limitaciones y advertencias

- No es un modelo autónomo: solo funciona como drafter junto a DeepSeek-V4-Flash-0731 bajo llama.cpp con `--spec-type draft-dspark`. No puede usarse para generación de texto directa.
- Requiere una compilación específica de llama.cpp que soporte el esquema GGUF `dflash` y la decodificación especulativa; no es compatible con otras herramientas de inferencia estándar.
- Depende del modelo objetivo: cualquier cambio en el checkpoint de DeepSeek-V4-Flash-0731 puede degradar la tasa de aceptación de drafts.
- La cuantización a 1-bit (IQ1_M) introduce ruido en los expertos enrutados; aunque la tasa de aceptación se mantiene, puede haber una ligera variación en la calidad de los borradores generados.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo, ya que no se han publicado evaluaciones de este tipo para el drafter.
- El modelo objetivo (DeepSeek-V4-Flash-0731) es extremadamente grande (162 GB en 8-bit), por lo que el drafter por sí solo no permite ejecutar el sistema completo en hardware de consumo sin una infraestructura adecuada.
- Los pesos se redistribuyen bajo los términos de la licencia MIT del modelo base, pero se recomienda verificar la compatibilidad de la licencia con el uso comercial previsto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Unkto/DeepSeek-V4-Flash-0731-DSpark-Drafter-IQ1M-IQ2XXS-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Matriz de importancia (imatrix): https://huggingface.co/antirez/deepseek-v4-gguf
- Fuente BF16 del drafter: https://huggingface.co/singulared/DeepSeek-V4-Flash-0731-DSpark-GGUF
- Variante Q2_K_S: https://huggingface.co/Lynxpda/DeepSeek-V4-Flash-0731-DSpark-Drafter-Q2_K_S-GGUF
- Otras referencias del drafter: https://huggingface.co/dev7a/DeepSeek-V4-Flash-0731-DSpark-Drafter-GGUF, https://huggingface.co/alessandrobologna/DeepSeek-V4-Flash-0731-DSpark-Drafter-GGUF, https://huggingface.co/GaelicThunder/DSpark-DeepSeek-V4-Flash-0731-drafter-dflash-GGUF
- Documentacion de Unsloth sobre DeepSeek-V4: https://unsloth.ai/docs/models/deepseek-v4
- Tutorial de despliegue con Unsloth Studio y OpenCode: https://www.datacamp.com/tutorial/run-deep-seek-v4-flash-0731
