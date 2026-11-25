# stew675/Qwen3.8-Flash-Next-5bpw-mtp4-GGUF

## Resumen

Qwen3.8-Flash-Next-5bpw-mtp4-GGUF es una cuantizacion GGUF de tipo "custom mixture" del modelo base Qwen/Qwen3.8-Flash-Next (179.551.050.368 parametros), publicada por el usuario stew675. No se trata de un modelo entrenado desde cero, sino de una receta de cuantizacion guiada por imatrix, disenada especificamente para hardware AMD RDNA: APUs Strix Halo con memoria unificada (gfx1151, 128 GiB) y GPUs Radeon AI Pro R9700 (gfx1201, 32 GiB cada una). El objetivo declarado no es batir un record de bits por peso, sino lograr un equilibrio entre perplejidad y throughput en hardware que los usuarios tienen realmente.

El modelo base emplea una arquitectura denominada `qwen4exp` en la model card: 48 capas mas una capa MTP (multi-token prediction), hidden size de 2560, 512 expertos con 10 activos y una longitud de contexto de 262.144 tokens. La cuantizacion resultante ocupa 93,24 GiB (91,47 GiB de backbone mas 1,77 GiB de cabeza MTP) con un promedio efectivo de 4,461 bits por peso, lo que permite mantener el modelo completo mas una cache KV de hasta 200k tokens residente en una APU de 128 GiB.

La relevancia actual reside en su enfoque de cuantizacion de primera generacion (partiendo de los pesos BF16 oficiales, nunca de un requantizado ajeno), el uso de una imatrix de 926 tensores y 50 x 8192 tokens, y la inclusion de una cabeza MTP integrada que evita tener que cargar un modelo draft separado para decodificacion especulativa. La licencia es qwen-community-1.0, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4exp` (transformer con MoE, SSM/attention aux y capa MTP) |
| Parametros totales | 179.551.050.368 (179,6 B) |
| Parametros activos | 10 expertos activos de 512 (numero de parametros activos no disponible) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Mixta: IQ4_XS, IQ4_NL, Q4_0, Q5_0, Q8_0, Q4_K, Q6_K, BF16, F32 |
| Idiomas soportados | en (segun la model card) |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (2 archivos, split a 52G) |
| Tamano del repo | 100,7 GB (modelo: 93,24 GiB) |
| Bits por peso efectivos | 4,461 global / 4,445 excluyendo PLE |
| Capas | 48 + 1 capa MTP (`blk.48`) |
| Hidden size | 2560 |
| Expertos | 512 totales, 10 activos |
| Perplejidad (wikitext-2, -c 2048) | 4,092 |
| Perplejidad (harness 512-ctx/580-chunk) | 4,685 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es `qwen4exp`, que combina capas transformer con mezcla de expertos (MoE) de grano fino (512 expertos, 10 activos por token), componentes SSM y de atencion auxiliares, y "hyper-connection mixers" (`hc_*`). Incluye ademas una capa de prediccion multi-token (MTP) integrada en el propio modelo como `blk.48`, lo que habilita decodificacion especulativa sin necesidad de un modelo draft externo. El hidden size es de 2560 y el contexto nativo alcanza los 262.144 tokens.

No se dispone de informacion sobre el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, si hubo RLHF/DPO) en la informacion proporcionada. Lo que si se detalla es el proceso de cuantizacion: se convirtio el modelo oficial a GGUF BF16, se aplico `llama-quantize --pure` con tipo base IQ4_NL guiado por una imatrix de AesSedai (926 tensores, 50 x 8192 tokens) y una receta de 29 reglas por tensor, y se injerto la cabeza MTP de 32 tensores procedente de la version Q4_K_M de unsloth (verificada byte a byte). La innovacion tecnica destacable es la asignacion de bits por sensibilidad: los expertos enrutados (44,9% de los parametros) reciben 4 bits, mientras que los pesos auxiliares (mezcladores de hyper-conexion, SSM y atencion) reciben 5-8 bits por ser aproximadamente 10³ veces mas sensibles segun la imatrix.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-turno, con contexto nativo de 262.144 tokens.
- Decodificacion especulativa nativa mediante la cabeza MTP integrada, sin modelo draft externo.
- Soporte de arquitectura MoE con 512 expertos y 10 activos, orientado a eficiencia computacional.
- Capacidades multilingues limitadas: la model card solo declara ingles (`en`).
- Integracion con `llama.cpp` mediante el patch set llama-cpp-rdna-boosts, que aporta soporte BF16 KV nativo, MTP adaptativo y cache multinivel de expertos MoE.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Capacidades de tool calling, agentes o vision: no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia local en APU Strix Halo: el modelo completo (93,24 GiB) mas una cache KV de hasta 200k tokens cabe en los 128 GiB de memoria unificada de una APU gfx1151, permitiendo ejecutar un modelo de 179,6 B en un equipo de sobremesa sin GPU discreta.
- Despliegue en estaciones con Radeon AI Pro R9700: en una configuracion de una a tres tarjetas (32 GiB cada una) con 64-96 GiB de RAM de sistema, los expertos pueden transmitirse desde memoria host, habilitando inferencia de gran modelo en hardware RDNA profesional.
- Procesamiento de documentos largos: con 262.144 tokens de contexto, el modelo puede ingerir libros completos, bases de codigo o expedientes extensos en una sola pasada sin chunking.
- Asistentes conversacionales de contexto extendido: la ventana de 200k tokens de cache KV residente permite mantener historiales de conversacion muy largos con baja latencia gracias a la cabeza MTP.
- Evaluacion e investigacion de cuantizacion: el repositorio incluye la receta de 29 reglas por tensor y la imatrix, lo que lo convierte en referencia reproducible para estudiar el impacto de la asignacion de bits por sensibilidad en modelos MoE.
- Prototipado de decodificacion especulativa: al llevar la cabeza MTP integrada, sirve para medir la tasa de aceptacion del draft y el speedup en `llama.cpp` sin infraestructura adicional.
- Fine-tuning o experimentacion con modelos de gran escala en hardware AMD: al estar en GGUF y ser compatible con `llama.cpp`, se integra en flujos de trabajo ya existentes en el ecosistema RDNA.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Perplejidad wikitext-2 | 4,092 | `-c 2048`, KV bf16, flash-attn on, Strix Halo APU, ROCm 7.14 |
| Perplejidad wikitext-2 | 4,685 | harness 512-ctx / 580 chunks |
| Perplejidad con imatrix debil | 4,19 | misma receta, imatrix de menor calidad (referencia comparativa del autor) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo reporta perplejidad y comparaciones internas de la receta de cuantizacion.

## Requisitos de hardware

- VRAM/memoria estimada: 93,24 GiB para el modelo completo, mas cache KV y buffers de computo (el autor reserva unos 30 GiB adicionales para KV y computo en la APU de 128 GiB).
- APU recomendada: Strix Halo con 128 GiB de memoria unificada (gfx1151). En esta plataforma el `-ncmoe` no libera memoria, por lo que el modelo debe residir completo.
- GPU recomendadas: una o varias Radeon AI Pro R9700 (gfx1201, 32 GiB cada una) con 64-96 GiB de RAM de sistema; en este caso los expertos pueden transmitirse desde memoria host.
- GPU de consumo: no cabe en GPUs consumer convencionales (RTX 4090 con 24 GiB, etc.) dado el tamano de 93 GiB; requiere hardware profesional o APU de gran memoria.
- Opciones de despliegue: `llama.cpp` con el patch set llama-cpp-rdna-boosts (obligatorio para las optimizaciones RDNA descritas); compatible con el ecosistema GGUF estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada (el autor menciona un objetivo de "alto throughput" pero no publica cifras de tokens por segundo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| stew675/Qwen3.8-Flash-Next-5bpw-mtp4-GGUF | 179,6 B (MoE, 10 activos) | 262.144 | GGUF mixto 4,46 bpw | qwen-community-1.0 | Optimizado para RDNA; MTP integrado; PPL 4,092 |
| Qwen/Qwen3.8-Flash-Next (base) | 179,6 B | 262.144 | safetensors BF16 | qwen-community-1.0 | Pesos originales sin cuantizar; referencia de calidad |
| AesSedai/Qwen3.8-Flash-Next-GGUF | 179,6 B | 262.144 | GGUF | qwen-community-1.0 | Fuente de la imatrix usada en esta receta |
| unsloth/Qwen3.8-Flash-Next-GGUF | 179,6 B | 262.144 | GGUF (incluye MTP Q4_K_M) | qwen-community-1.0 | Fuente de la cabeza MTP injertada |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la informacion proporcionada; la comparacion se limita a formato, licencia y origen de los pesos.

## Limitaciones y advertencias

- La model card solo declara soporte de ingles (`en`); el rendimiento en castellano u otros idiomas no esta documentado y puede degradarse.
- La cuantizacion a 4,46 bpw introduce perdida de calidad respecto al BF16 original; la perplejidad reportada (4,092) es del GGUF cuantizado, no del modelo base.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia qwen-community-1.0: es una licencia comunitaria con posibles restricciones para uso comercial; debe revisarse el texto completo antes de desplegar en produccion.
- El modelo esta disenado y optimizado para hardware AMD RDNA (gfx1151/gfx1201); las optimizaciones descritas dependen del patch set llama-cpp-rdna-boosts y no se garantizan en otras plataformas.
- El nombre del repositorio menciona "5bpw" pero el valor real medido es 4,461 bpw; el autor lo advierte explicitamente para evitar confusiones.
- Limitaciones estructurales de la cuantizacion: `ffn_down_exps` (dimension de reduccion 640) no admite K-quants y el PLE (ancho 160) no admite IQ4_XS.
- El repositorio tiene muy poca traccion (348 descargas, 1 like) y fue creado en noviembre de 2026; no hay validacion independiente de la receta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/stew675/Qwen3.8-Flash-Next-5bpw-mtp4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Patch set llama-cpp-rdna-boosts: https://github.com/stew675/llama-cpp-rdna-boosts
- Imatrix de AesSedai: https://huggingface.co/AesSedai/Qwen3.8-Flash-Next-GGUF
- GGUF de unsloth (fuente de la cabeza MTP): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Receta detallada: `RECIPE.md` dentro del repositorio
