# Steven10429/Qwen3.8-27B-UD-IQ4_XS-MLX-mtp

## Resumen

Este repositorio no es un modelo de lenguaje completo, sino la cabeza de prediccion multi-token (MTP) de Qwen3.8-27B empaquetada como drafter independiente para decodificacion especulativa. El autor, Steven10429, la ha extraido de los tensores `blk.64` / `nextn.*` de la cuantizacion `UD-IQ4_XS` publicada por Unsloth para Qwen3.8-27B y la ha convertido al formato de drafter `qwen3_5_mtp` que consume mlx-vlm. Su funcion es acelerar la generacion del checkpoint principal `Steven10429/Qwen3.8-27B-UD-IQ4_XS-MLX` sin alterar la salida.

El artefacto ocupa 0,35 GB y contiene 424.699.392 parametros reales segun los safetensors. Reutiliza `embed_tokens` y `lm_head` del modelo objetivo, de modo que no puede emplearse de forma autonoma: necesita el checkpoint principal cargado junto a el. En decodificacion greedy la salida es identica token a token a la del modelo sin drafter, y el beneficio se concentra en texto estructurado (codigo y matematicas) mas que en prosa libre.

La relevancia practica esta en el ahorro de computo en equipos Apple Silicon: con 24 GB de RAM unificada, el autor mide entre 1,18x y 1,96x de velocidad segun el tipo de prompt, con un incremento de memoria de aproximadamente 1,4 GB al cargar ambos modelos. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de prediccion multi-token (MTP) sobre una capa de decodificador de atencion completa; tipo de modelo MLX `qwen3_5_mtp` |
| Parametros totales | 424.699.392 (~0,42 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine de 6 bits y 8 bits (group size 64) para las matrices MTP; normas en bf16; etiquetado global como 8-bit |
| Idiomas soportados | no disponible (el drafter reutiliza `embed_tokens` y `lm_head` del modelo objetivo, por lo que hereda sus idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El drafter no se ha entrenado de cero: se ha convertido y recuantizado a partir de los tensores MTP ya presentes en el checkpoint original. La fuente concreta son `blk.64.nextn.{eh_proj,enorm,hnorm,shared_head_norm}` mas una capa completa de decodificador de atencion. Unsloth conservo esos tensores en Q6_K / Q8_0 para su GGUF `UD-IQ4_XS`, y la conversion los mapea a MLX affine de 6 y 8 bits con group size 64; las normas permanecen en bf16. No fueron necesarios cambios de layout mas alla del renombrado: las normas GGUF ya se almacenan como `1 + w`, igual que en MLX, y `eh_proj` concatena `[embedding, hidden]` en el mismo orden que `mtp.fc` en HuggingFace, sin permutacion de cabeza.

La validacion se hizo contra los tensores `mtp.*` oficiales en bf16 de `Qwen/Qwen3.8-27B`, descargados por rangos para no necesitar el checkpoint completo de 54 GB. Cada matriz queda dentro de un error relativo de 0,05: la cuantizacion Q6_K de Unsloth aporta aproximadamente 0,018 y la recuantizacion MLX unos 0,023 en cuadratura. Las normas coinciden exactamente salvo por el redondeo bf16. En los tres prompts de prueba, la salida especulativa en modo greedy fue identica token a token a la decodificacion plana. El conversor empleado es `conversion/gguf2mlx.py` con la opcion `--mtp-out`, y las estadisticas por tensor estan en `conversion_stats.json`.

Conviene subrayar que el repositorio existe como carpeta separada por una razon tecnica: cuando un checkpoint de la familia Qwen3.5 contiene claves `mtp.*`, mlx-vlm asume que no ha sido saneado y vuelve a sumar `+1` a las normas, lo que romperia el modelo si el MTP viajara dentro del checkpoint principal. La convencion de mlx-vlm (`mlx_vlm.convert --mtp`, `mlx_vlm.split_mtp`) es precisamente un directorio `<modelo>-mtp` con `model_type: qwen3_5_mtp`.

## Capacidades

- No genera texto por si solo: actua como drafter especulativo dentro de un bucle de decodificacion y requiere el checkpoint principal `Steven10429/Qwen3.8-27B-UD-IQ4_XS-MLX`.
- Produce predicciones multi-token consistentes en modo greedy: la salida final es identica token a token a la del modelo objetivo sin drafter.
- Acelera de forma desigual segun el tipo de contenido: maxima ganancia en texto estructurado (codigo Python y problemas matematicos) y minima en prosa libre.
- Reutiliza `embed_tokens` y `lm_head` del modelo objetivo, por lo que su vocabulario e idiomas son los de dicho checkpoint.
- Funciona con tamano de bloque 3 (dos tokens propuestos por ronda) en la configuracion medida por el autor.
- No soporta tool calling, agentes, vision ni audio por si mismo; esas capacidades, en su caso, pertenecen al modelo principal.
- Compatible unicamente con el runtime mlx-vlm; segun la model card, mlx-lm no implementa soporte de drafter MTP.

## Casos de uso

- Aceleracion de inferencia local en Mac: cargando el checkpoint principal mas este drafter en mlx-vlm, se obtiene entre 1,18x y 1,96x de velocidad en Apple Silicon, lo que hace viable la generacion interactiva en un equipo de 24 GB de RAM.
- Generacion de codigo en el puesto de desarrollo: es el escenario con mayor tasa de aceptacion de borradores (93,3 %) y un speedup de 1,72x, adecuado para autocompletado o refactorizacion asistida sobre Python.
- Resolucion de problemas matematicos paso a paso: registra la mejor combinacion medida (27,7 tok/s frente a 14,1 tok/s, 1,96x, 94,9 % de borradores aceptados), apropiado para asistentes de razonamiento aritmetico.
- Despliegue de asistentes conversacionales en memoria unificada: la carga conjunta pico es de 17,6 GB, solo 1,4 GB por encima del modelo sin drafter, lo que permite mantener el sistema en un portatil de gama alta.
- Servicio de documentacion tecnica y salidas estructuradas (JSON, YAML, SQL): al tratarse de texto con patrones repetitivos y predecibles, el drafter tiende al rango alto de aceptacion descrito para codigo y matematicas.
- Investigacion sobre decodificacion especulativa: sirve como caso reproducible de extraccion de una cabeza MTP nativa y su empaquetado como drafter MLX, con estadisticas de conversion publicadas.
- Reduccion de coste computacional en lotes de generacion sobre hardware Apple: el incremento de velocidad se traduce directamente en menos tiempo de GPU/ANE por token sin degradar la salida en greedy.
- Prosa libre y escritura creativa: es el caso menos favorable (16,8 tok/s frente a 14,3 tok/s, 1,18x, 47,1 % de aceptacion), por lo que el uso del drafter aporta poco frente a la decodificacion estandar.

## Benchmarks y rendimiento

Datos aportados por el autor, medidos en un Mac con Apple Silicon y 24 GB de RAM, con mlx-vlm 0.7.4 / mlx 0.32.3, tamano de bloque 3 (dos tokens propuestos por ronda), 256 tokens nuevos y decodificacion greedy.

| Prompt | Baseline (tok/s) | Con drafter MTP (tok/s) | Speedup | Borradores aceptados |
|---|---:|---:|---:|---:|
| Problema matematico | 14,1 | 27,7 | 1,96x | 94,9 % |
| Funcion Python | 14,4 | 24,8 | 1,72x | 93,3 % |
| Prosa libre en chino | 14,3 | 16,8 | 1,18x | 47,1 % |

Memoria pico: 17,6 GB con ambos modelos cargados, unos 1,4 GB mas que sin el drafter.

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este drafter, lo cual es esperable dado que no es un modelo generativo autonomo.

## Requisitos de hardware

- Memoria: el drafter ocupa 0,35 GB, pero el escenario real exige cargar el modelo principal. La medicion del autor da una memoria pico de 17,6 GB con ambos cargados.
- Equipo validado: Mac Apple Silicon con 24 GB de RAM unificada.
- Encaje en hardware de consumo: si, en equipos Apple Silicon con memoria unificada suficiente (los 24 GB del caso medido dejan margen); no aplica a GPU NVIDIA, ya que el formato y el runtime son MLX.
- GPU recomendadas: no disponible para CUDA; el artefacto esta orientado a Apple Silicon (Metal / memoria unificada).
- Despliegue: mlx-vlm (version 0.7.4 o superior en la prueba). El autor indica que mlx-lm no soporta drafter MTP. Opciones como vLLM, llama.cpp, Ollama o TGI no estan contempladas para este artefacto.
- Invocacion por linea de comandos: `mlx_vlm generate --model <principal> --draft-model <este repo> --draft-kind mtp`.
- Rendimiento: entre 16,8 y 27,7 tok/s segun el tipo de prompt, con una tasa de aceptacion de borradores entre el 47,1 % y el 94,9 %.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de otros drafters MTP comparables en la informacion proporcionada. La comparacion posible es contra el propio modelo objetivo sin decodificacion especulativa:

| Configuracion | Parametros adicionales | Memoria pico | Velocidad (matematicas) | Salida |
|---|---:|---:|---:|---|
| Qwen3.8-27B UD-IQ4_XS MLX (sin drafter) | 0 | ~16,2 GB | 14,1 tok/s | referencia |
| Qwen3.8-27B UD-IQ4_XS MLX + este drafter MTP | 424,7 M | 17,6 GB | 27,7 tok/s | identica en greedy |

Frente a otras tecnicas de decodificacion especulativa (modelos borrador independientes, cabezas tipo EAGLE o Medusa), no hay cifras disponibles en la informacion facilitada que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- No es autonomo: sin el checkpoint `Steven10429/Qwen3.8-27B-UD-IQ4_XS-MLX` no produce generacion util, porque depende de sus `embed_tokens` y `lm_head`.
- Dependencia de runtime: solo funciona con mlx-vlm; mlx-lm carece de soporte para drafter MTP, segun la propia model card.
- Plataforma restringida: validado en Apple Silicon; no hay datos de funcionamiento en CUDA ni en otras pilas de inferencia.
- Ganancia dependiente del dominio: en prosa libre la mejora cae a 1,18x con solo un 47,1 % de aceptacion, por lo que en ese escenario el beneficio es marginal.
- Garantia de identidad limitada al modo greedy: la verificacion token a token se realizo con temperatura 0; no hay datos publicados sobre comportamiento con muestreo estocastico.
- Error de cuantizacion acumulado: aunque acotado (0,05 relativo maximo por matriz), existe una perdida respecto a los tensores bf16 oficiales, con contribuciones de 0,018 (Q6_K de Unsloth) y 0,023 (recuantizacion MLX).
- Datos de contexto e idiomas no declarados para el drafter, y el repositorio no incluye informacion sobre sesgos o alucinacion, que corresponderian al modelo base.
- Adopcion nula: 0 descargas y 0 likes, sin validacion externa independiente del autor; conviene tratar las cifras de rendimiento como una medicion unica no replicada.
- Licencia: Apache-2.0 permite uso comercial, pero al derivar de Qwen3.8-27B y del GGUF de Unsloth, conviene verificar el cumplimiento de las condiciones de esos artefactos aguas arriba.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Steven10429/Qwen3.8-27B-UD-IQ4_XS-MLX-mtp
- Checkpoint principal requerido: https://huggingface.co/Steven10429/Qwen3.8-27B-UD-IQ4_XS-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF de origen (Unsloth UD-IQ4_XS): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Runtime de decodificacion especulativa mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Conversor incluido en el repositorio: `conversion/gguf2mlx.py`
- Estadisticas de conversion: `conversion_stats.json`
- Paper o publicacion tecnica: no disponible
