# ttindall/Qwen3.5-9B-MTP-Sidecar-GGUF

## Resumen

Qwen3.5-9B-MTP-Sidecar-GGUF es un artefacto auxiliar publicado por el usuario ttindall que recupera la cabeza de prediccion multi-token (MTP) del modelo oficial Qwen/Qwen3.5-9B y la empaqueta como un GGUF independiente de 2,4 GB. No es un modelo completo, sino un "sidecar" o modelo borrador que se carga junto a cualquier GGUF de Qwen3.5-9B en llama.cpp para habilitar decodificacion especulativa con `--spec-type draft-mtp`. El problema que resuelve es concreto: la mayoria de las cuantizaciones populares de Qwen3.5-9B (variantes abliterated, uncensored y los quants estandar de Unsloth) descartan la capa MTP durante la conversion, por lo que pierden la capacidad de decodificacion especulativa nativa.

El autor reutiliza unicamente pesos del lanzamiento oficial de Qwen (Apache-2.0) y anade su propio trabajo de extraccion, script y mediciones. El repositorio incluye 18 tensores: la capa MTP (`blk.32.*`), el embedding, la normalizacion final y la cabeza de salida, todo copiado tal cual desde un GGUF Q8_0 del modelo oficial. El sidecar ocupa unos 2,4 GB de VRAM adicionales junto al modelo objetivo.

La relevancia es practica: permite recuperar entre un 32% y un 42% de velocidad de decodificacion en una RTX 4090 sobre variantes abliterated que de otro modo no tendrian decodificacion especulativa, sin modificar los pesos del modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sidecar MTP para transformer Qwen3.5 (18 tensores: capa MTP `blk.32.*`, embedding, norm final y cabeza de salida) |
| Parametros totales | 2.277.532.160 (sidecar); el modelo base Qwen3.5-9B tiene 9B nominales |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica al sidecar; en las pruebas se uso contexto de 8.192 tokens |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El sidecar no es un modelo entrenado de forma independiente: es una extraccion de la cabeza MTP que Qwen incluye en su lanzamiento oficial de Qwen3.5-9B. La cabeza MTP es una capa adicional que predice varios tokens futuros a la vez, lo que permite a llama.cpp verificar varios tokens candidatos en una sola pasada del modelo objetivo y aceptar los que coinciden. El proceso de construccion fue: conversion de los safetensors oficiales en BF16 a GGUF con `convert_hf_to_gguf.py` (que preserva la capa MTP), cuantizacion a Q8_0 con `llama-quantize` y extraccion selectiva de los 18 tensores relevantes mediante el script `mtp_sidecar.py`, que rechaza cualquier fuente sin capa MTP.

El sidecar funciona con cualquier cuantizacion o fine-tune de Qwen3.5-9B que conserve el tokenizador y el tamano oculto de Qwen. Las tasas de aceptacion de borradores medidas oscilan entre el 48,9% y el 55,0% segun la variante abliterated, ligeramente inferiores a lo esperable en el modelo original porque la cabeza se entreno sobre los pesos sin abliterar. No se dispone de informacion sobre datos de entrenamiento, RLHF o DPO del modelo base en la informacion proporcionada.

## Capacidades

- Decodificacion especulativa mediante MTP en llama.cpp con `--spec-type draft-mtp`.
- Compatibilidad con cualquier GGUF de Qwen3.5-9B que mantenga tokenizador y hidden size de Qwen.
- Funciona sobre llama.cpp estandar (probado en el commit 2cbe0ec); builds anteriores pueden no reconocer `--spec-type draft-mtp`.
- Aceleracion de generacion de texto en el modelo objetivo; el sidecar en si no genera respuestas de forma autonoma.
- No aporta tool calling, vision, audio ni capacidades multimodales propias: estas dependen del modelo objetivo.
- No aporta capacidades multilingues propias: heredadas del modelo objetivo.

## Casos de uso

- Acelerar inferencia de variantes abliterated: cargar el sidecar junto a un GGUF abliterated de Qwen3.5-9B para recuperar velocidad de decodificacion perdida por la ausencia de capa MTP, con ganancias medidas de +32% a +42% en RTX 4090.
- Servicio de chat de baja latencia en produccion: usar `llama-server` con el sidecar para reducir el tiempo por token en respuestas conversacionales, manteniendo contexto de 8.192 tokens y cache K/V en q8_0.
- Recuperar decodificacion especulativa en quants de Unsloth: los quants estandar de Unsloth no incluyen la capa MTP; el sidecar la aporta sin recompilar ni recuantizar el modelo.
- Evaluacion comparativa de tecnicas de aceleracion: usar el sidecar como referencia para medir el impacto de la decodificacion especulativa MTP frente a otras tecnicas (draft models separados, lookahead) sobre el mismo modelo objetivo.
- Despliegue unificado multi-variante: un unico sidecar sirve para todas las cuantizaciones y fine-tunes de Qwen3.5-9B con el mismo tokenizador, simplificando el inventario de artefactos en un servidor de inferencia.
- Prototipado en una sola GPU consumer: con 2,4 GB adicionales de VRAM, un usuario con RTX 4090 puede habilitar decodificacion especulativa sin desplegar un segundo modelo borrador completo.

## Benchmarks y rendimiento

Mediciones del autor en una RTX 4090, llama.cpp commit 2cbe0ec, cada objetivo en su Q4_K_M publicado, contexto de 8.192, K/V en q8_0, 60 prompts ordinarios, thinking desactivado, 384 tokens por prompt. Velocidad de decodificacion mediana:

| Modelo objetivo | Sin sidecar | Con sidecar | Ganancia | Borradores aceptados |
|---|---|---|---|---|
| HauhauCS Qwen3.5-9B Uncensored Aggressive | 138,6 tok/s | 196,5 tok/s | +42% | 55,0% |
| Huihui Qwen3.5-9B abliterated (mradermacher) | 138,7 tok/s | 190,6 tok/s | +37% | 53,0% |
| lukey03 Qwen3.5-9B abliterated | 138,9 tok/s | 182,8 tok/s | +32% | 48,9% |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM adicional: aproximadamente 2,4 GB para el sidecar Q8_0, sumados a la VRAM del modelo objetivo.
- GPU probada: RTX 4090 (una unidad, commit 2cbe0ec de llama.cpp).
- Cabe en GPU consumer: si, siempre que queden unos 2,4 GB libres tras cargar el modelo objetivo; una RTX 4090 con un Q4_K_M de 9B es el escenario medido.
- Despliegue: llama.cpp (`llama-server`) con flags `-md`, `-ngld all`, `--spec-type draft-mtp`, `--spec-draft-n-max 3`, `--spec-draft-p-min 0`, `-fa on`, `-ctk q8_0`, `-ctv q8_0`, `--jinja`.
- Throughput medido: 182,8 a 196,5 tok/s de decodificacion mediana con el sidecar, frente a 138,6 a 138,9 tok/s sin el, segun el modelo objetivo.
- No se dispone de datos de latencia ni throughput para otras GPU (A100, H100, etc.) en la informacion proporcionada.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto | Ganancia de velocidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ttindall Qwen3.5-9B-MTP-Sidecar-GGUF | Sidecar MTP (Q8_0) | 2.277.532.160 | no aplica | +32% a +42% (RTX 4090) | Apache-2.0 | Hugging Face |
| Qwen3.5-9B original con MTP incluido | Modelo completo | 9B nominales | no disponible | decodificacion especulativa nativa | Apache-2.0 | Hugging Face |
| Quants Unsloth de Qwen3.5-9B | Modelo cuantizado | 9B nominales | no disponible | sin MTP (no soporta decodificacion especulativa) | Apache-2.0 | Hugging Face |
| Variantes abliterated (HauhauCS, Huihui, lukey03) | Modelo cuantizado | 9B nominales | no disponible | sin MTP por defecto; con sidecar +32% a +42% | Apache-2.0 (segun autor) | Hugging Face |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere un GGUF de Qwen3.5-9B como modelo objetivo; por si solo no genera texto.
- Solo se publica en Q8_0; no hay variantes en otras cuantizaciones.
- Las tasas de aceptacion de borradores son inferiores en modelos abliterated (48,9%-55,0%) que en el modelo original, porque la cabeza MTP se entreno sobre pesos sin abliterar.
- Requiere llama.cpp con soporte de `--spec-type draft-mtp` (probado en commit 2cbe0ec); builds antiguos pueden no reconocer la opcion.
- Si el GGUF objetivo ya incluye capa MTP (`qwen35.nextn_predict_layers = 1` en metadatos), el sidecar es innecesario.
- Las mediciones proceden de una unica GPU (RTX 4090), un unico commit de llama.cpp y 60 prompts; los resultados pueden variar con otra tarjeta, cuantizacion o distribucion de prompts.
- No se dispone de informacion sobre sesgos, alucinacion o comportamiento multilingue especifico del sidecar; estos dependen del modelo objetivo.
- El autor no re-aloja pesos de terceros: los pesos del sidecar son del lanzamiento oficial de Qwen (Apache-2.0); los modelos objetivo de la tabla pertenecen a sus respectivos uploaders.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/ttindall/Qwen3.5-9B-MTP-Sidecar-GGUF
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.5-9B
- HauhauCS Qwen3.5-9B Uncensored Aggressive: https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Huihui Qwen3.5-9B abliterated (mradermacher): https://huggingface.co/mradermacher/Huihui-Qwen3.5-9B-abliterated-GGUF
- lukey03 Qwen3.5-9B abliterated: https://huggingface.co/lukey03/Qwen3.5-9B-abliterated-GGUF
- Script de extraccion: `mtp_sidecar.py` incluido en el repositorio del modelo
