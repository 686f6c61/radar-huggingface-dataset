# WaveCut/Qwen3.8-27B-DSpine-b16-NInfer-v3

## Resumen

Qwen3.8-27B-DSpine-b16-NInfer-v3 es un artefacto de decodificación especulativa (speculative decoding) publicado por WaveCut para el motor de inferencia NInfer. No se trata de un modelo de lenguaje autónomo, sino de un *drafter* o modelo borrador derivado del DSpine drafter de Tencent para Qwen3.8-27B. Su función es proponer bloques de hasta 16 tokens que el modelo principal Qwen3.8-27B verifica después, de modo que la respuesta final sigue siendo la del modelo grande, pero se acelera la decodificación.

El artefacto implementa la técnica DSpine (Zhang et al., "Draft in Parallel, Condition Through Depth: Adjacent Causal Injection for Speculative Decoding", arXiv 2609.36173), que redacta un bloque de 16 posiciones en una sola pasada mediante cinco capas Qwen3 con ventana deslizante de 8.192 tokens y un *code bridge* que inyecta información de la posición anterior en cada posición del bloque. El drafter tiene 2.025.912.064 parámetros y reutiliza el embedding de tokens y la cabeza de salida del modelo base.

Este repositorio concreto contiene únicamente los pesos convertidos al formato `.ninfer` v3 (2,27 GiB), con proyecciones de capa y características en grupos de 8 bits de 32 elementos con escalas FP16, y el *code bridge* en BF16. Es relevante para quien despliegue Qwen3.8-27B con NInfer-all y quiera acelerar la decodificación sin cambiar la distribución de salida del modelo principal, a costa de memoria adicional en GPU y de un soporte de software todavía no integrado en la rama estable de NInfer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpine drafter: 5 capas Qwen3 con ventana deslizante de 8.192 tokens, inyección causal adyacente y code bridge (códigos de 1.024 dimensiones, rango 512) |
| Parametros totales | 2.025.912.064 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens de ventana deslizante en el drafter; el modelo principal admite hasta 262.144 tokens |
| Tipos de cuantizacion | Q8 por grupos de 32 con escalas FP16 (proyecciones) y BF16 (code bridge y tablas); receta alternativa `dspine_bf16` no incluida en el repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` v3 (2.434.027.008 bytes, 2,27 GiB) |

## Arquitectura y entrenamiento

El drafter sigue la arquitectura DSpine descrita en arXiv 2609.36173. Consta de cinco capas Qwen3 con una ventana deslizante de 8.192 tokens y atención causal dentro del bloque de 16 posiciones. Lee los estados ocultos del modelo principal en las capas 1, 16, 31, 46 y 61. Tras cada capa, un *code bridge* de 1.024 dimensiones y rango 512 escribe en cada posición un mensaje proveniente de la posición anterior, y un refinamiento serial sobre los 16 mejores candidatos de la cabeza encadena los borradores. El drafter no dispone de embedding ni de cabeza de salida propios: toma prestados los del modelo Qwen3.8-27B.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados ni si hubo fases de RLHF o DPO en la información proporcionada. El artefacto de este repositorio es una conversión del checkpoint de Tencent en la revisión `5f54174d301dbca65d9aa4448dc47e56732d9a12` mediante la receta `dspine_q8` del conversor de NInfer-all. La innovación técnica destacable es la redacción en paralelo de un bloque completo de 16 posiciones en una sola pasada, con inyección causal adyacente entre posiciones y verificación por rechazo en peticiones con muestreo (equivalente a DFlash2).

## Capacidades

- Decodificación especulativa: propone hasta 15 tokens por ronda (configurable con `--draft-tokens`, de 1 a 15) que el modelo Qwen3.8-27B verifica.
- Generación de texto acelerada: acelera la decodificación del modelo principal sin alterar la distribución de salida, ya que cada token aceptado es una elección del modelo verificado.
- Soporte de muestreo: en peticiones con muestreo, la propuesta se verifica por *rejection sampling*, de modo que la respuesta mantiene la distribución del modelo principal.
- Compatibilidad con múltiples artefactos de Qwen3.8-27B: carga junto al artefacto oficial `groupwise-int`, el GSQ-RCO IQ3_S y fine-tunes del mismo tamaño y vocabulario (abliterated, HauhauCS, MXFP8-CRACK).
- Reutilización de caché de prefijo: en la medición proporcionada, un segundo turno reutilizó 148 de sus 168 tokens de prompt.
- Concurrencia: soporta varias peticiones simultáneas a través de `ninfer-serve` (cuatro peticiones concurrentes medidas).
- No soporta `--lm-head-draft`, ya que el drafter lee la cabeza de salida completa del modelo.

## Casos de uso

- Aceleración de inferencia de Qwen3.8-27B en producción: desplegar el modelo principal con `--spec dspine --draft-model` para reducir la latencia de decodificación en tareas de generación de código, donde se midió un incremento de 90,8 a 279,5 tok/s con siete borradores.
- Servicio de chat interactivo: con `ninfer-serve` y varias peticiones concurrentes, el drafter mantiene tiempos de respuesta de 1,45 a 1,72 s en cuatro peticiones simultáneas de 120 a 151 tokens, adecuado para interfaces conversacionales.
- Generación de código en pipelines de CI/CD: la mayor tasa de aceptación en código (4,20 tokens por ronda con siete borradores) lo hace idóneo para tareas de autocompletado y generación de parches donde el texto es altamente predecible.
- Asistentes de documentación técnica: la reutilización de caché de prefijo en turnos sucesivos reduce el coste de prompts largos en conversaciones multi-turno.
- Evaluación de técnicas de decodificación especulativa: sirve como referencia reproducible para comparar DSpine frente a DFlash2 y MTP en el mismo hardware y artefacto base.
- Despliegue con ventanas de contexto largas: el drafter ocupa 160 MiB de caché KV a su ventana de 8.192 tokens, y la ventana completa de 262.144 tokens del modelo principal cabe con KV `rk4v4` y `rk8v4` en una RTX 5090.

## Benchmarks y rendimiento

Mediciones en una RTX 5090 a 575 W, artefacto oficial `groupwise-int`, CLI con ventana de 16.384 tokens y KV `bf16`, thinking desactivado, una petición greedy de hasta 400 tokens. Se indica la velocidad de decodificación en tok/s y, entre paréntesis, los tokens aceptados por ronda.

| Respuesta | Sin borradores | MTP 3 | DFlash2 7 | DSpine 3 | DSpine 5 | DSpine 7 | DSpine 15 |
|---|---:|---:|---:|---:|---:|---:|---:|
| código, 400 tokens | 90,8 | 232,9 (3,12) | 298,9 (4,20) | 216,6 (3,07) | 257,9 (3,76) | 279,5 (4,20) | 252,3 (4,99) |
| prosa, 252 a 269 tokens | 90,6 | 185,8 (2,49) | 185,6 (2,61) | 161,2 (2,28) | 167,3 (2,44) | 168,5 (2,54) | 130,1 (2,56) |

Con siete borradores, DSpine alcanza 3,08 veces la velocidad de decodificación simple en código y 1,86 veces en prosa. DFlash2 con siete borradores sigue siendo más rápido en esta tarjeta (3,29 y 2,05 veces), y MTP con tres borradores es más rápido en prosa. Una respuesta de prosa con muestreo (temperatura 0,7, semilla 1) decodificó 90,5 tok/s sin borradores, 210,2 con DFlash2 7 y 171,7 con DSpine 7. La receta `dspine_bf16` mantuvo los mismos tokens por ronda pero decodificó un 9,1 % y un 7,8 % más lento (254,1 y 155,3 tok/s frente a 279,5 y 168,5).

## Requisitos de hardware

- VRAM del drafter: 2,27 GiB de pesos en la primera GPU del modelo, más una tabla de 242,5 MiB derivada de la cabeza de salida al cargar (BF16, 512 × 248.320) y una caché KV propia por petición de 160 MiB a su ventana de 8.192 tokens (40 MiB hasta 2.032 tokens, 80 MiB hasta 4.080).
- Impacto medido: con el artefacto oficial en una RTX 5090 (ventana de 16.384 tokens, KV `bf16`, una petición), dejó 2,7 GiB menos de memoria libre tras el arranque que sin drafter (DFlash2: 2,5 GiB; MTP: 0,8 GiB).
- GPU recomendadas: RTX 5090 (medida); no se han publicado mediciones en A100, H100 u otras GPU.
- Cabe en GPU de consumo: sí, al menos en RTX 5090, siempre que el modelo principal de 27B también quepa.
- Opciones de despliegue: NInfer-all con soporte de DSpine (compilado desde el PR #341 de iamwavecut/ninfer-all hasta su fusión, o desde `master` después); las builds estándar de NInfer no pueden leerlo. El despliegue se realiza con `ninfer-serve` y los parámetros `--spec dspine --draft-model PATH --draft-tokens N`.
- Latencia y throughput: ver la tabla de benchmarks; siete borradores es la configuración óptima medida.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Tokens por ronda (código) | tok/s en código (RTX 5090) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| DSpine b16 (este artefacto) | Drafter especulativo | 2.025.912.064 | 4,20 con 7 borradores | 279,5 | Apache 2.0 | Hugging Face (NInfer v3) |
| DFlash2 | Drafter especulativo | no disponible | 4,20 con 7 borradores | 298,9 | no disponible | NInfer |
| MTP | Drafter especulativo | no disponible | 3,12 con 3 borradores | 232,9 | no disponible | NInfer |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere Qwen3.8-27B y NInfer-all; no genera respuestas por sí solo.
- NInfer rechaza el drafter junto a un modelo con distinto ancho oculto, vocabulario o número de capas.
- Las builds estándar de NInfer no pueden leer drafters DSpine; es necesario compilar NInfer-all desde el PR #341 o desde `master` tras su fusión.
- La aceptación del drafter sobre fine-tunes (abliterated, HauhauCS, MXFP8-CRACK) no está medida; Tencent lo construyó para el modelo base.
- El ancho de la verificación altera los resultados en coma flotante, por lo que una respuesta greedy puede diferir de la decodificación sin drafter.
- En prosa, DSpine es más lento que DFlash2 y que MTP con tres borradores; su ventaja se concentra en código.
- No se dispone de información sobre sesgos, riesgo de alucinación o limitaciones idiomáticas del drafter, ya que hereda las del modelo principal.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B y el motor NInfer tienen sus propias condiciones que deben verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WaveCut/Qwen3.8-27B-DSpine-b16-NInfer-v3
- Modelo base (drafter de Tencent): https://huggingface.co/tencent/Qwen3.8-27B-DSpine-b16
- Artefacto oficial de Qwen3.8-27B para NInfer: https://huggingface.co/neroued/Qwen3.8-27B-NInfer
- Artefacto GSQ-RCO IQ3_S: https://huggingface.co/WaveCut/Qwen3.8-27B-GSQ-RCO-IQ3_S-NInfer-v3
- Motor NInfer: https://github.com/Neroued/ninfer
- NInfer-all: https://github.com/iamwavecut/ninfer-all
- Pull request #341 de NInfer-all: https://github.com/iamwavecut/ninfer-all/pull/341
- Paper DSpine: https://arxiv.org/abs/2609.36173
