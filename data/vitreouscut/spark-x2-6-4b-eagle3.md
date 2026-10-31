# VitreousCut/Spark-X2.6-4B-EAGLE3

## Resumen

Spark-X2.6-4B-EAGLE3 es una cabecera de borrador (draft head) EAGLE-3 de una sola capa, con 218 millones de parametros, entrenada por el usuario VitreousCut para acelerar la inferencia del modelo XHToken/Spark-X2.6-4B mediante decodificacion especulativa. No es un modelo conversacional por si mismo: propone tokens que el modelo objetivo de 4B verifica, de modo que la salida es identica a la que produceria el modelo base, pero con un throughput notablemente mayor. El autor lo entreno desde cero porque no existia ninguna cabecera EAGLE-3 publica para la familia Spark.

La version actual (v8) se entreno sobre un corpus mixto de codigo, prosa y conversacion (21,96M de tokens) con destilacion sobre el argmax del verificador y la tecnica de "training-time test" de EAGLE-3. Los resultados publicados muestran aceleraciones de hasta 2,57x en prosa cuando el objetivo se ejecuta en CPU, y 2,04x cuando esta en VRAM. Es relevante para despliegues locales de Spark-X2.6-4B con llama.cpp, especialmente en hardware modesto donde el verificador es lento.

El modelo se distribuye en formato GGUF (422 MB en bf16) y safetensors (834 MB en fp32) bajo licencia Apache-2.0. Requiere un parche de una linea en llama.cpp (version 0.7.0-dev, commit `f5027fb`) para exponer las entradas de capa de la arquitectura `spark2_5`, ya que sin el el runtime aborta con un fallo de asercion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EAGLE-3, 1 capa de decodificador (draft head) |
| Parametros totales | 218,4M (dominados por el vocabulario de borrador de 32k) |
| Parametros activos | no disponible (no es un MoE; es un modelo denso de 1 capa) |
| Longitud de contexto | depende del modelo objetivo; la propia cabecera cuesta ~0,5 GiB con 4k de contexto |
| Tipos de cuantizacion | bf16 (GGUF), fp32 (safetensors) |
| Idiomas soportados | ingles (corpus de entrenamiento); el modelo objetivo es Spark-X2.6-4B |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |

Datos adicionales de la cabecera:

| Parametro | Valor |
|---|---|
| Modelo base | XHToken/Spark-X2.6-4B (Apache-2.0) |
| Capas objetivo fusionadas | 2, 18, 33 |
| Tamano oculto | 2560 |
| Atencion | 16 cabezas / 4 KV, head_dim 256, RoPE theta 1e6 |
| Vocabulario de borrador | 32.000 con mapas `d2t` / `t2d` |
| Version | v8 (version actual) |

## Arquitectura y entrenamiento

La cabecera sigue el esquema EAGLE-3: una unica capa de decodificador que consume las entradas de tres capas del modelo objetivo (en este caso las capas 2, 18 y 33) junto con el token retroalimentado, y propone tokens que el modelo de 4B verifica en paralelo. El vocabulario de borrador es de 32.000 tokens con mapas `d2t`/`t2d` hacia el vocabulario completo del objetivo (131.072). Nota practica: en los safetensors, `d2t` se guarda como deltas; `convert_hf_to_gguf.py` anade `arange` para recuperar los ids absolutos, y exportar ids absolutos directamente falla con el error `EAGLE-3 d2t target ids out of range for target vocab size 131072`.

El entrenamiento uso 21,96M de tokens en un epoch (5.362 pasos, batch 4 x 1024): 10M de codigo Python de repositorios (codeparrot-clean), 3M de instruccion-a-codigo (Magicoder), 2M de prosa (WikiText-103) y 7M de conversacion (UltraChat-200k, 32% de los segmentos). Se ejecuto en una sola RTX 3090 a 300 W con el objetivo congelado en bf16. La funcion de perdida combina cross-entropy contra el argmax del propio objetivo (no contra el corpus), un termino 0,5 · MSE sobre el estado prenorm retroalimentado, y una CE de profundidad 1 procedente del training-time test. Tres decisiones fueron clave: relabelar sobre el verificador (subio la aceptacion en prosa de 0,49 a 0,81), el training-time test (la cabecera aprende a recuperarse de sus propios borradores, subiendo la aceptacion depth-1 de 0,50 a 0,70) y los datos conversacionales con la plantilla de Spark (mejoro la aceptacion en formato chat de 0,299 a 0,325).

## Capacidades

- Proposicion de tokens para decodificacion especulativa EAGLE-3 sobre Spark-X2.6-4B; no genera texto de forma autonoma.
- Garantia de salida identica al modelo objetivo: el verificador acepta o rechaza los borradores, por lo que la calidad no cambia.
- Mejor rendimiento en prosa en texto plano (p0 = 0,920 en WikiText, dominio de entrenamiento).
- Aceptacion moderada en prompts mixtos (p0 = 0,464) y en codigo Python (p0 = 0,415).
- Aceptacion mas baja en formato chat con thinking activado (p0 = 0,325; 0,377 con thinking desactivado), por ausencia de trazas de razonamiento en el corpus.
- Compatible con llama.cpp mediante el flag `--spec-type draft-eagle3` (requiere el parche incluido en el repo).
- Sin capacidades de vision, audio ni tool calling propias; hereda las del modelo objetivo Spark-X2.6-4B.

## Casos de uso

- Aceleracion de inferencia local en CPU: con el objetivo Q8 en CPU (5,79 tok/s) y la cabecera en GPU, se obtiene 2,57x en prosa, util para servidores sin GPU potente que sirven texto largo.
- Servidores llama.cpp con GPU modesta: con el objetivo en VRAM (~140 tok/s) la ganancia es 2,04x en prosa; util para reducir latencia en despliegues de un solo usuario.
- Chatbots locales con Spark-X2.6-4B: la cabecera aporta 1,24x-1,06x en formato chat (con n=1), mejora modesta pero real sin alterar las respuestas.
- Generacion de texto largo tipo prosa o documentacion: es el dominio donde la aceptacion es mas alta y la aceleracion maxima.
- Experimentacion con decodificacion especulativa: al incluir el parche, los mapas d2t/t2d y notas de entrenamiento detalladas, sirve como referencia practica para construir draft heads propias.
- Ahorro de VRAM en despliegues hibridos: la cabecera cuesta ~0,5 GiB con 4k de contexto, lo que permite mantener el objetivo en CPU y solo la cabecera en GPU.

## Benchmarks y rendimiento

Aceptacion de profundidad 0 (greedy, generaciones de 96 tokens, objetivo en VRAM):

| Tipo de prompt | p0 |
|---|---:|
| Prosa WikiText (in-domain) | 0,920 |
| 12 prompts mixtos, texto plano | 0,464 |
| 12 prompts mixtos, plantilla chat (thinking on) | 0,325 |
| 3 prompts de codigo Python | 0,415 |

Throughput (single RTX 3090 + i7-6700K, n=3 salvo indicacion):

| Colocacion | Prosa | Mixto | Formato chat | Codigo |
|---|---:|---:|---:|---:|
| Objetivo Q8 en CPU (5,79 tok/s), cabecera en GPU | 2,57x | 1,48x (n=1) | 1,24x (n=1) | – |
| Objetivo Q8 en VRAM (~140 tok/s), cabecera en GPU | 2,04x | 1,18x (n=1) | 1,06x (n=1) | 1,08x (n=1) |

Con n=1 y objetivo en CPU: 1,88x en prosa y 1,48x en prompts mixtos. No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K; al ser un draft head, la calidad de salida es identica a la del modelo objetivo por construccion.

## Requisitos de hardware

- VRAM para la cabecera: ~0,5 GiB incluyendo 4k de contexto (peso GGUF bf16 de 422 MB).
- VRAM total depende del modelo objetivo Spark-X2.6-4B y su cuantizacion (no disponible en la informacion proporcionada).
- Entrenamiento se realizo en una sola RTX 3090; para inferencia, una GPU consumer moderna (RTX 3090, 4090 o similar) es suficiente para alojar la cabecera y, opcionalmente, el objetivo.
- Si el objetivo de 4B no cabe en VRAM, puede dejarse en CPU y subir solo la cabecera a GPU (`--ngl 0 --ngld 99`); esta configuracion es donde se logra la mayor aceleracion (2,57x en prosa).
- Despliegue: llama.cpp (probado contra 0.7.0-dev, commit `f5027fb`, aplicando el parche `llama.cpp-spark2_5-layer-inputs.patch` incluido en el repo). No se menciona soporte para vLLM, TGI u Ollama.
- Ajuste de `--spec-draft-n-max`: 3 para prosa, 1 para codigo (aceptacion depth-1 ~0,15); evitar 2 con el objetivo en CPU por un artefacto del codigo (pase de ~350 ms frente a ~182 ms con n=1 y ~217 ms con n=3).
- Latencia: con el objetivo en VRAM, un token cuesta ~7 ms, por lo que el coste fijo por pase del borrador reduce la ganancia relativa.

## Comparativa con modelos similares

| | Spark-X2.6-4B-EAGLE3 (v8) | Draft head publica EAGLE-3 para Qwen3-4B | Draft head EAGLE-3 tipica (generica) |
|---|---|---|---|
| Parametros | 218M | no disponible | no disponible |
| Modelo objetivo | Spark-X2.6-4B | Qwen3-4B | variable |
| Aceptacion p0 en prompts mixtos/codigo | 0,46 / 0,415 | 0,53–0,64 | no disponible |
| Aceptacion p0 in-domain (prosa) | 0,920 | no disponible | no disponible |
| Licencia | Apache-2.0 | no disponible | no disponible |
| Disponibilidad | GGUF y safetensors en HuggingFace | publica | variable |

La unica referencia cuantitativa publicada por el autor es una cabecera EAGLE-3 publica para Qwen3-4B, que logra 0,53–0,64 en los mismos conjuntos de prompts mixtos y de codigo, frente a 0,46/0,415 de esta cabecera; el autor reconoce que su modelo rinde peor fuera de dominio.

## Limitaciones y advertencias

- Rendimiento debil fuera de dominio: 0,92 de aceptacion en WikiText frente a 0,46 en prompts mixtos; una cabecera publica para Qwen3-4B supera a esta en los mismos conjuntos.
- El formato chat es el punto mas debil (p0 = 0,325 con thinking activado): el corpus no incluye trazas de razonamiento, por lo que la aceptacion en thinking mode es inferior a la de thinking desactivado.
- El codigo es el dominio mas flojo: con p1 ≈ 0,15 solo `n_max 1` resulta util; la diferencia de p0 en codigo entre versiones (0,415 frente a 0,437) esta dentro del ruido de una evaluacion de 3 prompts y se considera no resuelta.
- Requiere aplicar un parche manual a llama.cpp (`src/models/spark2_5.cpp`) y recompilar; sin el, el runtime aborta con `GGML_ASSERT(t_layer_inp[il] != nullptr)`.
- Artefacto de rendimiento conocido: `n_max 2` con el objetivo en CPU rinde peor que 1 y que 3 en llama.cpp 0.7.0-dev; evitar ese valor en esa configuracion.
- Al cargar los safetensors manualmente, `d2t` viene como deltas; exportar ids absolutos produce un error de rango.
- Sin riesgos de alucinacion propios (la salida la verifica el modelo objetivo), pero hereda todos los sesgos y limitaciones de Spark-X2.6-4B, sobre los que no se aporta informacion.
- Licencia Apache-2.0, sin restricciones para uso comercial.
- Proyecto comunitario de un autor individual, con metricas evaluadas en conjuntos muy pequenos de prompts (3-12), por lo que las cifras deben tomarse como orientativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VitreousCut/Spark-X2.6-4B-EAGLE3
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B

No se han encontrado enlaces adicionales (papers, blogs o demos) en la informacion disponible.
