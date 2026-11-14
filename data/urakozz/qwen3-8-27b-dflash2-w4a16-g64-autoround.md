# urakozz/Qwen3.8-27B-DFlash2-W4A16-g64-AutoRound

## Resumen

Este repositorio contiene una cuantización a 4 bits del modelo borrador (draft model) DFlash 2 de `z-lab/Qwen3.8-27B-DFlash2`, publicada por el usuario urakozz. No se trata de un modelo de lenguaje autónomo, sino de un componente auxiliar para decodificación especulativa que acompaña al modelo objetivo `Qwen/Qwen3.8-27B`. El borrador propone varios tokens por paso y el modelo objetivo los verifica, de modo que la decodificación especulativa se mantiene sin pérdida: la cuantización solo altera cuántos tokens se aceptan por iteración, nunca la salida final.

El artefacto pesa 1,22 GB frente a los 3,85 GB del original en bf16, con 383.619.840 parámetros almacenados en safetensors. La cuantización se ha realizado con AutoRound 0.17.0 en esquema W4A16, grupo de 64 y simétrico, empaquetada como GPTQ (`auto_round:auto_gptq`). El modelo está pensado específicamente para el motor de inferencia `intel-arc-inference-server` sobre tarjetas Intel Arc Pro B70 (Battlemage, Xe2), y su calibración se ha hecho contra la versión int4 del modelo objetivo, de forma que el borrador se ajusta a las representaciones que verá en producción.

La relevancia de esta ficha es acotada: es un checkpoint de nicho, con cero descargas y cero likes en el momento de la consulta, sin tasas de aceptación medidas y sin soporte confirmado en SGLang o vLLM. Resulta útil para quien despliegue el stack concreto de Intel Arc descrito por el autor, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo borrador de decodificación especulativa DFlash 2 (bloques no causales, atención con convolución y selector de candidatos); no disponible el detalle completo de capas |
| Parametros totales | 383.619.840 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como valor propio; el motor del autor reporta unos 246k tokens de contexto sirviendo borrador y objetivo juntos con caché KV en int8 |
| Tipos de cuantizacion | W4A16, grupo 64, simétrico, empaquetado GPTQ (int4 en pesos lineales, activaciones en 16 bits); escalas fp16, qzeros `0x77777777`, sin act-order |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers); empaquetado `auto_gptq` |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa, no un transformer generativo estándar. Según la model card, opera con un forward de bloque no causal (tamaño de bloque 8) y contiene componentes propios de DFlash 2: proyecciones lineales `q/k/v/o_proj` y `gate/up/down_proj` por capa, capas `attention_conv` y `mlp_conv` con `kernel_projection` y `base_kernel`, y un `candidate_selector` con `hidden_projection` y codebooks. En total se cuantizan 47 capas lineales; las normas (`hidden_norm`, `norm`, `input/post_attention_layernorm`, `q_norm`, `k_norm`), los `base_kernel` de las convoluciones y los codebooks del selector se conservan bit a bit en la precisión original.

La cuantización se hizo con AutoRound 0.17.0: 200 iteraciones de ajuste, 128 muestras, batch 8, learning rate 5e-3, tuning min-max activado y semilla 42. La calibración ejecuta el propio forward de bloque del borrador (32 bloques por muestra, 2304 filas de contexto) alimentado con los estados ocultos del objetivo int4 en las capas 5, 19, 33, 47 y 61. Los datos de calibración son 69 peticiones de sesiones grabadas de codificación agéntica (opencode), con una sesión separada reservada como conjunto de validación. El autor verificó que todas las lineales listadas están empaquetadas y que los tensores preservados son idénticos al original. No se documentan datos de entrenamiento del modelo base ni si hubo RLHF o DPO, ya que este repositorio solo contiene la receta de cuantización.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa junto a `Qwen/Qwen3.8-27B`; no genera texto de forma autónoma.
- Decodificación sin pérdida: el modelo objetivo verifica cada token propuesto, por lo que la cuantización del borrador no altera la salida.
- Reducción del tráfico de memoria por pasada de borrador a menos de un tercio de los bytes del borrador bf16, factor relevante porque la pasada de borrador está limitada por ancho de banda en la tarjeta.
- Integración prevista con el motor `intel-arc-inference-server` mediante `--spec dflash --draft-model`, con kernels Level Zero/OpenCL propios.
- No dispone de soporte documentado de tool calling, agentes, visión, audio ni modo de razonamiento extendido; esas capacidades residirían en el modelo objetivo, no en el borrador.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Aceleración de inferencia en Intel Arc Pro B70: el borrador se sirve junto al objetivo int4 en una sola tarjeta de 32 GB, con unos 246k tokens de contexto si la caché KV está en int8; es el escenario para el que fue diseñado.
- Despliegue en dos tarjetas: con el borrador en la segunda tarjeta y el objetivo en la primera, útil cuando no se quiere repartir la caché KV del objetivo.
- Servicio de codificación agéntica: la calibración proviene de sesiones de opencode, de modo que el borrador está ajustado a las distribuciones de tokens típicas de asistentes de código con tool calling.
- Evaluación de decodificación especulativa cuantizada: sirve para medir tasas de aceptación de un borrador int4 frente a uno bf16 sobre el mismo objetivo, aunque el autor aún no ha publicado esas mediciones.
- Investigación en compresión de borradores: el par de checkpoints (bf16 e int4) permite estudiar el impacto de W4A16 en la aceptación sin tocar la calidad de salida.
- Prototipado sobre hardware Intel: para equipos que ya operan Battlemage y quieren probar decodificación especulativa sin cambiar de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las tasas de aceptación sirviendo con este borrador no se han medido todavía y que la carga en SGLang o en el soporte DFlash de vLLM no está probada.

## Requisitos de hardware

- VRAM del borrador: 1,22 GB en disco; en memoria, el peso int4 más escalas y metadatos, del orden de 1,3-1,5 GB, más las activaciones del forward de bloque. No disponible una cifra oficial de VRAM.
- Escenario de referencia del autor: una Intel Arc Pro B70 (Battlemage, Xe2) de 32 GB alojando objetivo int4 y borrador, con unos 246k tokens de contexto y caché KV int8; alternativa en dos tarjetas.
- GPU compatibles: el motor del autor está escrito para Intel Arc Pro B70; no hay soporte documentado para A100, H100 ni RTX 4090 con este checkpoint empaquetado.
- GPU de consumo: no disponible; no se ha validado en GPUs de consumo.
- Despliegue: `intel-arc-inference-server` (soporte del checkpoint empaquetado en curso; hasta entonces el motor sirve el original bf16 cuantizado a int8 al cargar). Carga en SGLang y vLLM sin probar. No hay indicios de conversión a GGUF ni de uso con llama.cpp u Ollama.
- Latencia y throughput: no disponibles; el autor solo afirma que el borrador int4 mueve menos de un tercio de los bytes por pasada que el bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Tamano | Contexto | Licencia | Estado |
|---|---|---|---|---|---|---|
| urakozz/Qwen3.8-27B-DFlash2-W4A16-g64-AutoRound | 383,6 M | int4 W4A16 g64 | 1,22 GB | No disponible (motor: ~246k con objetivo) | Apache 2.0 | Publicado, aceptación sin medir |
| z-lab/Qwen3.8-27B-DFlash2 (base) | 383,6 M | bf16 | 3,85 GB | No disponible | No disponible | Original del que deriva |
| urakozz/Qwen3.8-27B-W4A16-g64-AutoRound-GPTQ | No disponible | int4 W4A16 g64 | No disponible | No disponible | No disponible | Modelo objetivo con el que se sirve |

No se dispone de datos de rendimiento comparativo entre estas variantes; la única diferencia cuantificada es el tamaño (1,22 GB frente a 3,85 GB).

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: requiere un servidor de decodificación especulativa que aporte el embedding y la cabeza del objetivo, además de los estados ocultos de los que parte el borrador.
- Las tasas de aceptación con este checkpoint no se han medido; el beneficio real en latencia es una incógnita.
- El soporte del empaquetado en `intel-arc-inference-server` está en curso; hasta que llegue, el motor usa el original bf16 cuantizado a int8 al cargar.
- Carga en SGLang y vLLM sin probar; no hay conversión a GGUF ni soporte documentado en llama.cpp u Ollama.
- La calibración usa 69 peticiones de sesiones de codificación agéntica, un conjunto pequeño y de dominio estrecho; el comportamiento fuera de ese dominio no está caracterizado.
- Idiomas soportados no disponibles.
- Riesgo de alucinación y sesgos: no aplica directamente al borrador, ya que el objetivo verifica cada token; cualquier sesgo provendría del modelo objetivo.
- Licencia Apache 2.0, permisiva para uso comercial, pero conviene verificar la licencia del modelo base y del objetivo antes de un despliegue en producción.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/urakozz/Qwen3.8-27B-DFlash2-W4A16-g64-AutoRound
- Modelo base (borrador bf16): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Objetivo int4 usado en la calibración: https://huggingface.co/urakozz/Qwen3.8-27B-W4A16-g64-AutoRound-GPTQ
- Motor de inferencia del autor: https://github.com/urakozz/intel-arc-inference-server
- AutoRound: https://github.com/intel/auto-round
