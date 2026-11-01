# TiaoFeng/Spark-X2.6-4B-EAGLE3-Chinese-retrain

## Resumen

Spark-X2.6-4B-EAGLE3-Chinese-retrain es una cabeza de borrador (draft head) EAGLE-3 reentrenada por TiaoFeng para acelerar la decodificación especulativa del modelo objetivo [XHToken/Spark-X2.6-4B](https://huggingface.co/XHToken/Spark-X2.6-4B), un modelo de 4B parámetros. No es un modelo conversacional autónomo: su función es predecir tokens que el modelo objetivo verifica, reduciendo la latencia de decodificación en cargas de trabajo de lenguaje natural, especialmente en chino e inglés (traducción, resumen, organización de documentos y chat).

Es la tercera etapa (S3) de un reentrenamiento progresivo: S2a reconstruyó el vocabulario de borrador para chino (32K), S2b lo amplió a 48K tokens y alineó el objetivo de entrenamiento con la salida NLP del propio modelo, y S3 añade el canal de respuesta (sin thinking), documentos cortos que el sampler descartaba y documentos que superan la ventana de extracción de 16k. El resultado es una tasa media de aceptación de borrador de 0,495 en una matriz de 48 prompts NLP, frente a 0,460 de S2b y 0,344 de S2a. Se distribuye en formato GGUF para su uso directo con llama.cpp, lo que lo hace relevante para despliegues locales de bajo coste que buscan aceleración sin pérdida de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabeza de borrador EAGLE-3 (14 tensores, arquitectura `spark2_5` en llama.cpp) |
| Parametros totales | 259,2M (versión 48K); 218M (versión legacy 32K) |
| Parametros activos | no disponible (no aplica: no es un modelo generativo autónomo) |
| Longitud de contexto | Depende del modelo objetivo (probado hasta 131.072 tokens con el target) |
| Tipos de cuantizacion | Q8_0 (recomendado), bf16 (referencia) |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con `d2t` embebido en cada fichero) |

## Arquitectura y entrenamiento

El modelo es una cabeza EAGLE-3: un pequeño módulo de borrador que, en cada paso, predice el siguiente token del modelo objetivo a partir de sus estados ocultos, permitiendo a llama.cpp verificar varios tokens en paralelo. Mantiene la misma arquitectura de 14 tensores de la versión original (v8, `VitreousCut/Spark-X2.6-4B-EAGLE3`) y se entrena mediante warm-start por etapas: S2a se reentrenó desde v8 con un vocabulario de borrador chino de 32K, S2b amplió a 48K (32.000 filas de `lm_head` procedentes de S2a y 16.000 nuevas para inglés/ASCII) y S3 parte de S2b arrastrando todos los tensores.

Los datos de entrenamiento combinan instrucciones y corpus en chino e inglés: `m-a-p/COIG-CQIA`, `YeungNLP/firefly-train-1.1M` y `wikimedia/wikipedia`. La característica clave de S3 es el uso de los propios estados ocultos del modelo objetivo como características de entrada, generados con la build `SC117/Spark-X2.6-4B-abliterated-FIT-GGUF` en Q6_K. La innovación destacable es el entrenamiento sobre el canal de respuesta (sin thinking), que aporta la mayor ganancia individual (+0,076 de aceptación), junto con la inclusión de documentos cortos y de contexto largo que las ventanas de muestreo previas descartaban. El `d2t` (mapeo de vocabulario de borrador a vocabulario objetivo) va embebido en cada GGUF.

## Capacidades

- Decodificación especulativa EAGLE-3 como draft head para Spark-X2.6-4B en llama.cpp (`--spec-type draft-eagle3`).
- Aceleración de tareas NLP en chino e inglés: chat, traducción zh↔en, resumen (zh→zh y en→zh) y organización de documentos.
- Aceptación media de primer token borrador (p0) de 0,495 en la matriz NLP de 48 prompts; 0,638 en traducción chino→inglés.
- Cobertura del top-1 del modelo objetivo del 0,979–0,995 con el vocabulario de 48K.
- Aceleración medida de 1,15x–1,35x en decodificación de extremo a extremo, sin ralentizar nunca el decode.
- No es un modelo generativo por sí mismo: no produce texto útil sin el modelo objetivo.

## Casos de uso

- **Chat local en chino acelerado**: sirve borradores durante conversaciones multi-turno con Spark-X2.6-4B, logrando 1,06x de mejora en respuestas de 128 tokens y mayor en respuestas largas.
- **Traducción chino↔inglés por lotes**: es la carga donde más rinde (0,638 de aceptación zh→en y 1,17–1,30x de velocidad), ideal para traducir grandes volúmenes de documentación técnica.
- **Resumen de documentos largos**: acelera la generación de resúmenes zh→zh y en→zh, aunque el rendimiento decae con contexto de 16k–32k.
- **Organización y estructuración de documentos**: tareas de reorganización de texto con 0,532 de aceptación, adecuada para pipelines de limpieza de corpus.
- **Servidores de inferencia locales con llama.cpp**: se integra en `llama-server` con una sola flag (`-md`), sin cambios de código en la aplicación.
- **Despliegues en hardware de consumo**: el borrador pesa solo 268 MiB en Q8_0, por lo que puede combinarse con el target 4B cuantizado en GPUs de gama media.
- **A/B testing y re-cuantización**: el fichero bf16 de 500 MiB permite comparar versiones o generar cuantizaciones alternativas.

## Benchmarks y rendimiento

Resultados publicados por el autor (matriz NLP de 48 prompts, target a `temperature = 1.0`, draft greedy, vía `llama-server` con `--spec-draft-n-max 1`; p0 = proporción de primeros tokens borrador aceptados):

| Workload | S2a (32K) | S2b (48K) | S3 (48K) |
|---|---:|---:|---:|
| chat | 0,276 | 0,304 | 0,380 |
| traducción chino→inglés | 0,449 | 0,601 | 0,638 |
| traducción inglés→chino | 0,325 | 0,480 | 0,530 |
| resumen chino (zh→zh) | 0,333 | 0,469 | 0,479 |
| resumen inglés (en→zh) | 0,277 | 0,424 | 0,453 |
| organización de documentos | 0,421 | 0,516 | 0,532 |
| contexto largo | 0,298 | 0,395 | 0,419 |
| **media** | **0,344** | **0,460** | **0,495** |

Sondas adicionales:

| Sonda | S2b | S3 |
|---|---:|---:|
| p0, replay offline PyTorch (greedy, 128 tokens) | 0,457 | 0,502 |
| canal de respuesta (sin thinking) | 0,385 | 0,462 |
| p0 a 2k / 8k / 16k / 32k de contexto | 0,484 / 0,406 / 0,281 / 0,219 | 0,594 / 0,422 / 0,375 / 0,250 |

Velocidad de extremo a extremo (con y sin `-md`, mismo target):

| Escenario | Ganancia |
|---|---:|
| decode, todas las cargas y longitudes (incluido 13–14k de contexto) | 1,15x–1,35x |
| chat, respuestas de 128 tokens | 1,06x |
| traducción / resumen / organización, 128 tokens | 1,17x–1,30x |
| 13–14k de contexto, 128 tokens | 0,92x |
| 13–14k de contexto, 512 tokens | 1,06x |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), lo cual es esperable al tratarse de un draft head y no de un modelo generativo evaluable de forma independiente.

## Requisitos de hardware

- VRAM del borrador: 268 MiB en Q8_0 (259,2M parámetros) o 500 MiB en bf16; la VRAM total dependerá del modelo objetivo Spark-X2.6-4B (en Q6_K, unos 3 GB según la build de referencia) más la KV cache.
- Al ser un GGUF de menos de 300 MiB, cabe con holgura en GPUs de consumo (RTX 3060, RTX 4060 Ti, RTX 4090, etc.) junto al target 4B cuantizado; también es viable en CPU, aunque la aceleración dependerá del target.
- Despliegue exclusivamente vía llama.cpp (probado con 0.7.0-dev); **requiere el parche de una línea `t_layer_inp` para la arquitectura `spark2_5`**, disponible en el repositorio v8, sin el cual el draft aborta con un `GGML_ASSERT`.
- Comando de referencia probado a contexto 131.072 con KV cache f16:

```bash
llama-server -m Spark-X2.6-4B-abliterated-FIT-REFERENCE-3G-Q6_K.gguf \
    -md spark-eagle3-s3-48k-q8.gguf \
    --spec-type draft-eagle3 --spec-draft-n-max 1 \
    -c 131072 -ctk f16 -ctv f16 -ngl 99 --parallel 1 -fa on
```

- `--spec-draft-n-max 1` es deliberado: el segundo paso de draft solo acepta 0,11 frente al ~0,29 necesario para compensar el pase extra.
- Coste fijo: el procesamiento del prompt es ~28% más lento a 14k de contexto (unos pocos puntos a contexto corto); el punto de equilibrio a 14k es de ~280 tokens generados, y de decenas de tokens a contexto corto. Prompts muy largos con respuestas muy cortas son el único patrón que pierde.

## Comparativa con modelos similares

| Modelo | Rol | Parámetros | Vocabulario draft | Aceptación media | Licencia |
|---|---|---|---|---|---|
| TiaoFeng/Spark-X2.6-4B-EAGLE3-Chinese-retrain (S3, 48K) | Draft head EAGLE-3 para Spark-X2.6-4B | 259,2M | 48.000 | 0,495 | Apache 2.0 |
| Versión S2b (mismo repo, legacy) | Draft head EAGLE-3 | 259,2M | 48.000 | 0,460 | Apache 2.0 |
| VitreousCut/Spark-X2.6-4B-EAGLE3 (v8) | Draft head EAGLE-3 original | no disponible | no disponible | no disponible | no disponible |

El propio repo incluye la versión S2a de 32K (218M, aceptación 0,344) como referencia histórica. No se conocen draft heads EAGLE-3 comparables de terceros para el mismo modelo objetivo en la información disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: solo acelera a Spark-X2.6-4B y no produce salida útil por sí mismo.
- El contexto largo sigue siendo el punto débil: a 16k la aceptación cae a ~0,375 y a 32k a 0,250; el extremo de 32k "sigue débil" según el autor.
- La versión de 48K y la de 32K no son intercambiables (vocabulario y `d2t` distintos).
- Requiere un parche no oficial de una línea en llama.cpp (`t_layer_inp` para `spark2_5`); sin él, el draft falla. Puede romperse con futuras versiones de llama.cpp.
- El procesamiento del prompt es ~28% más lento a 14k de contexto; prompts muy largos con respuestas muy cortas degradan el rendimiento global.
- `--spec-draft-sampling probabilistic` no cambia la aceptación salvo que se pase también `--no-spec-draft-backend-sampling` (el sampler del backend es top-k); conviene verificar la configuración.
- La build de referencia usada para entrenar y verificar es un modelo abliterated (`SC117/Spark-X2.6-4B-abliterated-FIT-GGUF`); el comportamiento con otras builds del target puede diferir.
- No hay información sobre sesgos del draft head en sí; los sesgos del output provienen del modelo objetivo.
- Las métricas de aceptación provienen de una matriz propia de 48 prompts del autor; los resultados en otras cargas (por ejemplo, código o matemáticas) no están documentados.

## Enlaces

- Modelo: https://huggingface.co/TiaoFeng/Spark-X2.6-4B-EAGLE3-Chinese-retrain
- Modelo objetivo: https://huggingface.co/XHToken/Spark-X2.6-4B
- Draft head original (v8, peso padre original): https://huggingface.co/VitreousCut/Spark-X2.6-4B-EAGLE3
- Build de referencia del target (abliterated, Q6_K): https://huggingface.co/SC117/Spark-X2.6-4B-abliterated-FIT-GGUF
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/m-a-p/COIG-CQIA
  - https://huggingface.co/datasets/YeungNLP/firefly-train-1.1M
  - https://huggingface.co/datasets/wikimedia/wikipedia
- Paper, demo y repositorio de código: no disponibles
