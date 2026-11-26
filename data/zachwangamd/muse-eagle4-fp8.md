# ZachWangAMD/Muse-EAGLE4-FP8

## Resumen

Muse-EAGLE4-FP8 es un modelo borrador (draft model) para decodificación especulativa de tipo EAGLE-4, publicado por ZachWangAMD. No es un modelo generativo autónomo: se acopla al modelo objetivo `amd/Muse-Spark-Open-816B-A42B-Quark-MXFP4` (816.000 millones de parámetros totales, 42.000 millones activos, cuantizado en MXFP4) y toma de él los embeddings de tokens, por lo que no puede generar texto por sí mismo.

Se trata de una versión A8W8 en FP8 del borrador original `amd/Muse-Spark-Open-EAGLE4` (revisión `79087bda`, epoch 6, cabeza stage-2 de rango 128), cuantizada con AMD Quark. El objetivo es reducir el coste de memoria y cómputo del borrador manteniendo prácticamente intacta la tasa de aceptación de tokens especulativos, lo que se traduce en un throughput de decodificación equivalente o ligeramente superior al del borrador en bf16.

El modelo tiene 2.755.887.104 parámetros (unos 2,76 mil millones) y un repositorio de 4,6 GB en safetensors. Su relevancia es operativa: en despliegues de inferencia especulativa sobre hardware AMD Instinct, sustituir el borrador bf16 por esta variante FP8 reduce el peso del draft a la mitad sin degradar la aceleración, según los datos publicados por el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de una capa decoder (draft EAGLE-4) con cabeza de predicción stage-2 de rango 128 |
| Parametros totales | 2.755.887.104 (2,76 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 E4M3 A8W8 (pesos per-tensor, activaciones per-tensor estáticas calibradas); `fc`, `lm_head`, `efficient_lm_head`, `efficient_lm_head_down_proj` y todas las normas en bf16 |
| Idiomas soportados | No disponible (heredados del modelo objetivo) |
| Licencia | Muse Model License (`muse-model-license`, con Usage Policy adicional) |
| Formato de pesos | safetensors (`model.safetensors`, 4,64 GB, sha256 `ec0649039f63ab1b37b7080c1963b4407cf14a76ba7af7fcb5b84a3d4491c484`) |

## Arquitectura y entrenamiento

El modelo es un borrador EAGLE-4, una arquitectura pensada para decodificación especulativa: predice varios tokens candidatos que el modelo objetivo verifica en paralelo. Consta de una única capa decoder con atención y MLP, más una cabeza de predicción stage-2 de rango 128 y dos cabezas de lenguaje (`lm_head` y `efficient_lm_head` con su proyección descendente). El borrador consume los estados ocultos del objetivo en las capas 1, 29 y 57, además de los embeddings de tokens que toma prestados del modelo objetivo.

El entrenamiento original corresponde a `amd/Muse-Spark-Open-EAGLE4` (epoch 6), no documentado en la información disponible. La contribución de esta ficha es la cuantización: se aplicó AMD Quark (commit `807bbe486d`, versión `0.15+807bbe486d`, API eager con `ModelQuantizer.quantize_model`, `freeze` y `export_safetensors`) sobre una reconstrucción en PyTorch puro del borrador que reproduce la salida de SGLang con un 0,72 % de error relativo. Se cuantizaron las 7 capas lineales del decoder (`midlayer.self_attn.{q,k,v,o}_proj` y `midlayer.mlp.{gate,up,down}_proj`) con FP8 E4M3 per-tensor en pesos y activaciones estáticas. La calibración usó 112 secuencias (184.101 tokens) de entradas reales del borrador, capturadas del objetivo servido con SGLang sobre prompts cualitativos de SPEED-Bench y sus completaciones greedy.

## Capacidades

- Predicción especulativa de tokens para acelerar la decodificación del modelo objetivo `amd/Muse-Spark-Open-816B-A42B-Quark-MXFP4`.
- Generación de árboles de candidatos EAGLE-4 (árbol de servicio 12/8/32 en los experimentos publicados).
- No genera texto de forma autónoma: depende de los embeddings y estados ocultos del objetivo.
- No soporta tool calling, function calling ni razonamiento multi-paso por sí mismo; esas capacidades pertenecen al modelo objetivo.
- Capacidades multilingües: no documentadas de forma independiente; dependen del objetivo.
- No dispone de modo thinking, visión ni audio propios.

## Casos de uso

- Aceleración de inferencia de un LLM de 816B en producción: desplegar este borrador junto al objetivo en SGLang con `--speculative-draft-model-quantization quark` para elevar el throughput de decodificación manteniendo la calidad del objetivo.
- Reducción de huella de memoria en nodos AMD Instinct: al ocupar 4,64 GB en FP8 frente al borrador bf16, libera VRAM/HBM para mayor batch o mayor longitud de contexto del objetivo.
- Servicio de chat de baja latencia: con TPOT de 4,21 ms y 234,8 tok/s a concurrencia 1 en 8× MI350X, adecuado para respuestas interactivas con objetivos de latencia estrictos.
- Despliegue multi-GPU con paralelismo tensor y de expertos (TP 4 / EP 4): el borrador se integra en la misma topología que el objetivo sin reconfigurar el clúster.
- Evaluación comparativa de cuantizaciones de borradores: sirve como referencia para medir el impacto de FP8 frente a bf16 en tasa de aceptación (5,18 vs 5,21) y throughput.
- Investigación en decodificación especulativa: permite reproducir experimentos EAGLE-4 con el harness `eagle-harness` 0.1.0 y los scripts de `repro/REPRODUCE.md`.

## Benchmarks y rendimiento

Resultados publicados por el autor en 8× AMD Instinct MI350X, TP 4 / EP 4, SGLang + EAGLE-4 harness, greedy, concurrencia 1, SPEED-Bench qualitative (110 prompts, hasta 4.096 tokens de salida), árbol de servicio EAGLE-4 12/8/32:

| Borrador | Longitud de aceptación | Salida (tok/s) | TPOT (ms) |
|---|---:|---:|---:|
| bf16 (`amd/Muse-Spark-Open-EAGLE4`) | 5,21 | 233,6 | 4,23 |
| FP8 (este modelo) | 5,18 | 234,8 | 4,21 |

En validación retenida de la calibración (16 secuencias, 28.916 tokens), el borrador FP8 elige el mismo token top-1 que el borrador bf16 en el 97,58 % de las posiciones, con un error relativo de salida del 4,6 %. Los resultados a 1K de entrada / 8K de salida con concurrencia de 4 a 256 quedan pendientes de publicar en `repro/results/`.

## Requisitos de hardware

- VRAM/HBM para el borrador: aproximadamente 4,64 GB en FP8 (tamaño del `model.safetensors`), frente al doble en la variante bf16.
- El borrador no es autónomo: requiere en memoria el modelo objetivo de 816B (42B activos) en MXFP4, lo que exige un nodo multi-GPU de gran capacidad.
- GPU validadas: 8× AMD Instinct MI350X con TP 4 / EP 4. No hay datos publicados de funcionamiento en GPUs de consumo (RTX 4090, etc.), que en cualquier caso no podrían alojar el objetivo.
- Despliegue: SGLang con el harness EAGLE-4 (`eagle-harness` 0.1.0) y el flag `--speculative-draft-model-quantization quark`. Se requiere aplicar el parche `repro/patches/eagle_harness-optional-params.patch` al loader del harness, porque un borrador cuantizado recibe los parámetros opcionales `k_scale`/`v_scale` de SGLang y el loader publicado los reporta como ausentes.
- Latencia y throughput medidos: TPOT 4,21 ms y 234,8 tok/s a concurrencia 1 en la configuración indicada.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-EAGLE4-FP8 (este) | 2,76 B | FP8 A8W8 | Borrador EAGLE-4 para objetivo Muse-Spark 816B | Muse Model License | Hugging Face |
| amd/Muse-Spark-Open-EAGLE4 | 2,76 B (estimado, misma arquitectura) | bf16 | Borrador EAGLE-4 para el mismo objetivo | Muse Model License | Hugging Face |
| amd/Muse-Spark-Open-816B-A42B-Quark-MXFP4 | 816 B totales / 42 B activos | MXFP4 | Modelo objetivo generativo | Muse Model License | Hugging Face |

No se dispone de datos sobre otros borradores EAGLE-4 comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: sin el objetivo `amd/Muse-Spark-Open-816B-A42B-Quark-MXFP4` no produce texto, ya que toma de él los embeddings de tokens.
- Acoplado a una revisión concreta del objetivo y del borrador original (`79087bda063c0c9aae63ca39f1a51791f64c19a2`); cambios en el objetivo pueden invalidar la calibración y degradar la aceptación.
- Requiere un parche no oficial del loader de `eagle-harness` 0.1.0; sin él, el borrador no carga en SGLang.
- La cuantización introduce un error relativo de salida del 4,6 % y una coincidencia top-1 del 97,58 % frente a bf16; en dominios fuera de la distribución de calibración (SPEED-Bench qualitative) este margen podría ampliarse.
- Sesgos y riesgo de alucinación: no evaluados de forma independiente para el borrador; hereda los del modelo objetivo.
- Idiomas soportados no documentados de forma explícita.
- Licencia Muse Model License con Usage Policy adicional; es necesario revisar `LICENSE.md` y `USE_POLICY.md` antes de cualquier uso comercial.
- Solo validado en AMD Instinct MI350X con ROCm y SGLang; no hay evidencia publicada en otras plataformas.
- Resultados a concurrencias altas (4 a 256) aún no publicados, por lo que el comportamiento en serving de producción a gran escala no está verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZachWangAMD/Muse-EAGLE4-FP8
- Modelo base (borrador original): https://huggingface.co/amd/Muse-Spark-Open-EAGLE4
- Modelo objetivo: https://huggingface.co/amd/Muse-Spark-Open-816B-A42B-Quark-MXFP4
- AMD Quark (herramienta de cuantización): https://github.com/amd/quark
- Licencia: `LICENSE.md` en el repositorio del modelo
- Usage Policy: `USE_POLICY.md` en el repositorio del modelo
- Reproducibilidad: `repro/REPRODUCE.md` y `repro/results/` en el repositorio del modelo
- Parche del harness: `repro/patches/eagle_harness-optional-params.patch` en el repositorio del modelo
