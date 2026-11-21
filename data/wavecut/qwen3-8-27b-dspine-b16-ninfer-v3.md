# WaveCut/Qwen3.8-27B-DSpine-b16-NInfer-v3

## Resumen

Qwen3.8-27B-DSpine-b16-NInfer-v3 es un artefacto de decodificación especulativa, no un modelo autónomo. Lo publica el usuario WaveCut a partir del drafter DSpine que Tencent desarrolló para Qwen3.8-27B (bloque de 16 posiciones). Su función es proponer hasta 15 tokens por ronda que el modelo principal Qwen3.8-27B verifica después, de modo que la salida final sigue siendo la del modelo grande pero se acelera la decodificación.

El drafter emplea cinco capas de Qwen3 con ventana deslizante de 8.192 tokens, atención causal dentro del bloque y lectura de los estados ocultos del modelo en las capas 1, 16, 31, 46 y 61. Incorpora un puente de códigos de 1.024 dimensiones con rango 512 que inyecta información de la posición anterior tras cada capa, y un refinamiento serial sobre los 16 mejores candidatos de la cabeza. Tiene 2.025.912.064 parámetros y reutiliza el embedding de tokens y la cabeza de salida del modelo base.

El artefacto se distribuye en formato `.ninfer` (2.434.027.008 bytes, 2,27 GiB) con proyecciones en grupos de 8 bits de tamaño 32 y escalas FP16, y el puente de códigos en BF16. Solo es utilizable con NInfer-all (build de `master`, que incorpora DSpine desde el PR #341); NInfer estándar no puede leerlo. La relevancia actual reside en que ofrece aceleraciones de decodificación de hasta 5,2x sobre el modelo sin drafter en respuestas de código, con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DSpine drafter: 5 capas Qwen3 con ventana deslizante de 8.192 tokens, atención causal intra-bloque, puente de códigos (1.024 dim, rango 512) y refinamiento serial sobre 16 candidatos |
| Parámetros totales | 2.025.912.064 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de 8.192 tokens en el drafter; contexto del modelo servido configurable vía `--max-context` (probado hasta 262.144) |
| Tipos de cuantización | Q8 (grupos de 8 bits de tamaño 32 con escalas FP16) para proyecciones de capa y feature; BF16 para puente de códigos y tablas. Receta BF16 completa disponible (`dspine_bf16`, 4.056.043.008 bytes) pero no publicada en este repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (artefacto NInfer v3); checkpoint original en formato de Tencent Qwen3.8-27B-DSpine-b16 |

## Arquitectura y entrenamiento

DSpine (Zhang et al., "Draft in Parallel, Condition Through Depth: Adjacent Causal Injection for Speculative Decoding", arXiv 2609.36173) es un drafter de decodificación especulativa que genera un bloque de 16 posiciones en una sola pasada. Consta de cinco capas Qwen3 con ventana deslizante de 8.192 tokens y atención causal dentro del bloque. Lee los estados ocultos del modelo principal en las capas 1, 16, 31, 46 y 61, y tras cada capa un puente de códigos (códigos de 1.024 dimensiones, rango 512) escribe en cada posición un mensaje proveniente de la posición anterior. Un refinamiento serial sobre los 16 mejores candidatos de la cabeza encadena los borradores. El drafter no tiene embedding ni cabeza propios: toma prestados los del modelo Qwen3.8-27B.

El artefacto es una conversión del checkpoint de Tencent en la revisión `5f54174d301dbca65d9aa4448dc47e56732d9a12` mediante la receta `dspine_q8` de NInfer-all. No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición ni si hubo RLHF o DPO. La innovación técnica principal es la inyección causal adyacente combinada con el refinamiento serial, que permite proponer bloques de hasta 15 tokens con alta tasa de aceptación (hasta 8,38 tokens aceptados por ronda en código). La verificación de propuestas muestreadas se realiza por rejection sampling, como en DFlash2.

## Capacidades

- Aceleración de decodificación especulativa: propone hasta 15 tokens por ronda que el modelo Qwen3.8-27B verifica; la salida final es siempre la del modelo grande.
- Generación de bloques en una sola pasada con refinamiento serial de los 16 mejores candidatos.
- Compatibilidad con cualquier artefacto NInfer de Qwen3.8-27B del mismo ancho oculto, vocabulario y número de capas.
- Carga junto al artefacto oficial `groupwise-int` de Qwen3.8-27B o junto a variantes GSQ-RCO IQ3_S y fine-tunes del mismo tamaño y vocabulario (abliterated, HauhauCS, MXFP8-CRACK).
- Modo adaptativo (`--adaptive-mtp`): cada ronda propone `--draft-tokens` o la mitad.
- Selección de candidatos desde la cabeza de salida completa del modelo o desde la cabeza de propuesta del artefacto (`--lm-head-draft`).
- Verificación por rejection sampling en peticiones con muestreo.
- No soporta tool calling, agentes, visión ni audio por sí mismo; estas capacidades dependen del modelo principal.

## Casos de uso

- Servicio de inferencia de Qwen3.8-27B con latencia reducida: desplegar el drafter junto al artefacto oficial en `ninfer-serve` con `--spec dspine --draft-model` para elevar el throughput de decodificación de 90,7 a 473,4 tok/s en respuestas de código de 1.024 tokens (DSpine 15).
- Generación de código en producción: con `--draft-tokens 15` se obtiene la mayor aceleración en respuestas largas de código (8,38 tokens aceptados por ronda, 473,4 tok/s en la prueba de 1.024 tokens sobre RTX 5090), adecuado para asistentes de programación y pipelines de CI/CD que necesiten completar código rápidamente.
- Despliegue en una sola GPU consumer: el drafter ocupa 2,27 GiB adicionales en la primera GPU del modelo, más una tabla de 242,5 MiB derivada de la cabeza de salida y un anillo KV de 160 MiB con ventana de 8.192 tokens, lo que permite servir Qwen3.8-27B con aceleración en una RTX 5090.
- Servicio de chat conversacional: con `--draft-tokens 7` en prosa se mantiene una aceleración moderada (2,62 tokens aceptados por ronda, 172,9 tok/s frente a 90,4 sin drafter en la prueba de 1.024 tokens) con menor coste computacional que 15.
- Cargas concurrentes de razonamiento: con ocho peticiones de razonamiento simultáneas, 7 borradores rinden más que 15; combinado con `--adaptive-mtp` se ajusta dinámicamente el número de borradores por ronda.
- Evaluación de fine-tunes de Qwen3.8-27B: cargar el drafter junto a variantes abliterated, HauhauCS o MXFP8-CRACK del mismo tamaño y vocabulario para medir su aceptación (no medida por Tencent) y comparar latencias.
- Contextos largos: con ventana de 262.144 tokens y KV `rk4v4` o `rk8v4` el drafter sigue cabiendo en una RTX 5090, útil para tareas de análisis de documentos extensos donde la decodificación domina el tiempo total.

## Benchmarks y rendimiento

Mediciones sobre una RTX 5090 a 575 W por defecto, artefacto oficial `groupwise-int`, CLI con ventana de 16.384 tokens y KV `bf16`, thinking desactivado, una petición greedy por configuración. Se indica decodificación en tok/s con los tokens aceptados por ronda entre paréntesis.

| Respuesta | Sin drafter | MTP 3 | DFlash2 7 | DFlash2 15 | DSpine 7 | DSpine 11 | DSpine 15 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Python, 1.024 tokens | 90,7 | 251,8 (3,37) | 322,0 (4,55) | 405,1 (6,72) | 325,7 (4,92) | 421,5 (7,31) | 473,4 (8,38) |
| Inglés, 1.024 tokens | 90,4 | 182,7 (2,45) | 187,8 (2,67) | 163,4 (2,73) | 172,9 (2,62) | 149,3 (2,60) | 156,0 (2,76) |
| Código, 400 tokens | 90,3 | 232,3 (3,12) | 297,8 (4,20) | 292,7 (4,81) | 278,1 (4,20) | 251,1 (4,37) | 284,7 (4,99) |
| Prosa, 269 tokens | 90,3 | 185,2 (2,49) | 184,9 (2,61) | 150,4 | no disponible | no disponible | no disponible |

Comparación de la receta BF16 frente a Q8 en la misma sesión (RTX 5090, siete borradores): la receta BF16 mantuvo los mismos tokens por ronda pero decodificó un 9,1 % más lento en código (254,1 tok/s frente a 279,5) y un 7,8 % más lento en prosa (155,3 tok/s frente a 168,5), por lo que el repositorio solo incluye el fichero Q8.

Consumo de memoria adicional respecto a servir sin drafter (RTX 5090, ventana de 16.384 tokens, KV `bf16`, una petición): DSpine deja 2,7 GiB menos libres tras el arranque, frente a 2,5 GiB de DFlash2 y 0,8 GiB de MTP.

## Requisitos de hardware

- VRAM del drafter: 2,27 GiB de pesos en la primera GPU del modelo, más una tabla de 242,5 MiB (BF16, 512 × 248.320) derivada de la cabeza de salida al cargar, más un anillo KV por petición de 160 MiB con ventana de 8.192 tokens (80 MiB hasta 4.080 tokens, 40 MiB hasta 2.032).
- GPU probada: RTX 5090 a 575 W. No se han publicado mediciones en A100, H100 ni otras GPU.
- Cabe en GPU consumer: sí, la RTX 5090 es la única configuración medida; el coste adicional de 2,7 GiB sobre el modelo principal condiciona el encaje en GPU con menos VRAM.
- Contexto máximo: la ventana completa de 262.144 tokens cabe en una RTX 5090 con KV `rk4v4` o `rk8v4`.
- Despliegue: exclusivamente mediante NInfer-all (build de `master`, con DSpine desde el PR #341). NInfer estándar no puede leer drafters DSpine. Comando: `ninfer-serve models/qwen3_8_27b.ninfer --model-id qwen3.8-27b --max-context 32768 --spec dspine --draft-model models/Qwen3.8-27B-DSpine-b16-ninfer-v3.ninfer --draft-tokens 7`.
- Throughput medido: hasta 473,4 tok/s en código de 1.024 tokens con 15 borradores; 90,3-90,7 tok/s sin drafter.
- Requisito adicional: build de NInfer-all con la corrección de proyección BF16 del PR #346 (en `master`) para obtener los números con más de ocho borradores.

## Comparativa con modelos similares

| Drafter | Tipo | Tokens aceptados por ronda (código 1.024 tok) | Throughput máximo medido (tok/s) | Memoria adicional | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|---|
| DSpine b16 (este artefacto) | Bloque de 16 posiciones, 5 capas, puente de códigos | 8,38 (15 borradores) | 473,4 | 2,7 GiB | Apache 2.0 | Hugging Face, NInfer-all `master` |
| DFlash2 | Decodificación especulativa | 6,72 (15 borradores) | 405,1 | 2,5 GiB | no disponible | NInfer-all |
| MTP | Multi-token prediction | 3,37 (3 borradores) | 251,8 | 0,8 GiB | no disponible | NInfer-all |
| Sin drafter | — | — | 90,7 | 0 | — | — |

## Limitaciones y advertencias

- No es un modelo autónomo: sin el modelo Qwen3.8-27B junto al que se carga no genera respuestas propias.
- Solo funciona con NInfer-all compilado desde `master`; las builds estándar de NInfer no leen drafters DSpine.
- NInfer rechaza el drafter si el modelo tiene otro ancho oculto, vocabulario o número de capas.
- La aceptación sobre fine-tunes (abliterated, HauhauCS, MXFP8-CRACK) no está medida por Tencent; el rendimiento puede degradarse.
- El número óptimo de borradores depende de la carga: 15 rinde mejor en código largo y en una sola petición, 7 en prosa y con ocho peticiones de razonamiento concurrentes.
- En prosa la aceleración es modesta (2,62-2,76 tokens aceptados por ronda) y con 11 borradores el throughput baja a 149,3 tok/s, por debajo de MTP 3 (182,7 tok/s).
- El consumo adicional de 2,7 GiB de VRAM puede impedir el despliegue en GPU con poca memoria libre.
- No se dispone de información sobre sesgos, tasas de alucinación ni cobertura idiomática del drafter; hereda las características del modelo principal.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B y el checkpoint original de Tencent deben cumplir sus propias condiciones.
- El artefacto se publicó el 12 de noviembre de 2026 y se actualizó el 13 de noviembre de 2026; con 2.994 descargas y 2 likes, la validación comunitaria es limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WaveCut/Qwen3.8-27B-DSpine-b16-NInfer-v3
- Modelo base (drafter de Tencent): https://huggingface.co/tencent/Qwen3.8-27B-DSpine-b16
- Artefacto oficial de Qwen3.8-27B para NInfer: https://huggingface.co/neroued/Qwen3.8-27B-NInfer
- Variante GSQ-RCO IQ3_S: https://huggingface.co/WaveCut/Qwen3.8-27B-GSQ-RCO-IQ3_S-NInfer-v3
- Repositorio NInfer: https://github.com/Neroued/ninfer
- Repositorio NInfer-all: https://github.com/iamwavecut/ninfer-all
- Pull request de soporte DSpine: https://github.com/iamwavecut/ninfer-all/pull/341
- Pull request de corrección de proyección BF16: https://github.com/iamwavecut/ninfer-all/pull/346
- Paper DSpine: https://arxiv.org/abs/2609.36173
