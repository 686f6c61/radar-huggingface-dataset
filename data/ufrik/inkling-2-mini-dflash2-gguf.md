# ufrik/Inkling-2-Mini-Dflash2-GGUF

## Resumen

Inkling-2-Mini-DFlash2-Draft (GGUF) es un modelo borrador de decodificación especulativa (speculative decoding) para Inkling-2-Mini, empaquetado en formato GGUF por el usuario ufrik a partir de los pesos publicados por incoai. No es un modelo autónomo: carece de cabeza de vocabulario utilizable y solo funciona emparejado con el modelo objetivo Inkling-2-Mini. Su función es proponer tokens candidatos que el modelo grande verifica en paralelo, acelerando la generación sin alterar la distribución de salida.

El modelo implementa la arquitectura DFlash2, un esquema de borrador por difusión de bloques (block-diffusion draft) con 5 capas, dimensión de embedding de 2304 y bloques de 8 tokens. Lee los estados ocultos de las capas 6, 24, 42 y 48 del modelo objetivo y aplica un mecanismo de selección con rango 256 y top-k 16. Con 494.983.424 parámetros, el artefacto pesa aproximadamente 1 GB en BF16.

Su relevancia es práctica: es el primer borrador DFlash2 para Inkling que funciona bajo llama.cpp. Las builds estándar de llama.cpp abortan en el primer token con este modelo debido al padding del LM head del objetivo (vocabulario real 200058 frente a 201024 almacenados), por lo que el paquete incluye parches específicos en el runtime. En la configuración medida por el autor, eleva el throughput de decodificación de 26,2 tok/s (sin borrador) a 56,6 tok/s medios en un M3 Ultra.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DFlash2 (borrador por difusión de bloques para decodificación especulativa) |
| Parámetros totales | 494.983.424 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.048.576 tokens (ventana deslizante de 2048 en las 5 capas) |
| Tipos de cuantización | BF16 (fichero publicado); F32 en vectores de normalización y escala |
| Idiomas soportados | no disponible |
| Licencia | unknown (no especificada) |
| Formato de pesos | GGUF (81 tensores: 49 BF16 + 32 F32) |

## Arquitectura y entrenamiento

El modelo es un borrador DFlash2 con 5 capas, `block_count` 5 y `block_size` 8, lo que implica que genera candidatos en bloques de 8 tokens mediante difusión de bloques en lugar de decodificación autorregresiva token a token. La dimensión de embedding y de feed-forward es 2304 y 6912 respectivamente. Lee los estados ocultos de las capas 6, 24, 42 y 48 (indexadas desde 1) del modelo objetivo Inkling-2-Mini, con un selector de rango 256 y top-k 16, y convoluciones de kernel 2 con grupo 16. Usa RoPE con frecuencia base 10000 y epsilon de RMSNorm de 1e-6.

El autor del empaquetado no ha reentrenado ni ajustado nada: los pesos provienen íntegramente de incoai/Inkling-2-Mini-DFlash2, convertidos con `convert_hf_to_gguf.py` de llama.cpp (`c212d25ad`) en modo `--outtype bf16`. El repositorio original declara `model_type: qwen3` y clase `DFlash2DraftModel`, y no incluye tokenizador, por lo que el tokenizador del GGUF se hereda del objetivo (pre-tokenizador `inkling2`, modelo `gpt2`, 201024 tokens con padding). No se dispone de información sobre el dataset de entrenamiento del borrador ni sobre el uso de RLHF o DPO.

La innovación técnica relevante está en el runtime: el paquete requiere una build de llama.cpp con tres parches sobre `src/models/dflash.cpp` y `src/models/dflash2.cpp`, activados bajo `LLM_ARCH_INKLING2_LOOP`: (1) recorte del vocabulario a `valid_vocab × n_tokens` antes de `ggml_top_k`, para evitar ids en el rango de padding `[200058, 201024)`; (2) aplicación de la normalización RMS `tok_norm` del objetivo a los embeddings del borrador, que este no incorpora; (3) omisión del soft-capping final de logits, ya que Inkling no lo usa pese a declarar `final_logit_softcapping` 30.0. Por (2) y (3), el borrador es específico de Inkling y no debe apuntarse a otros objetivos.

## Capacidades

- Decodificación especulativa: propone hasta 7 tokens candidatos por paso (`--spec-draft-n-max 7`) que el modelo objetivo verifica en paralelo.
- Aceleración de inferencia: incrementa el throughput de decodificación del objetivo sin modificar la distribución de probabilidad de salida.
- Integración con llama.cpp: funciona con `llama-server` mediante `--spec-type draft-dflash2` y `--spec-draft-model`.
- Compatibilidad con el pipeline multimodal del objetivo: verificado junto al proyector de visión de Inkling-2-Mini.
- Soporte de contexto largo: declarado hasta 1.048.576 tokens, con atención de ventana deslizante de 2048.
- Plantilla de chat heredada del objetivo.
- No soporta generación autónoma, tool calling, agentes ni razonamiento multi-paso por sí mismo: delega todas esas capacidades en el modelo objetivo.

## Casos de uso

- Servicio de inferencia de Inkling-2-Mini con baja latencia: desplegar el objetivo junto a este borrador en `llama-server` para reducir el tiempo por token en aplicaciones interactivas de chat, aprovechando el incremento medido de 26,2 a 56,6 tok/s en M3 Ultra.
- Asistentes conversacionales multi-turno: el borrador acelera la decodificación manteniendo la ventana de contexto larga del objetivo, útil en sesiones prolongadas con historial extenso.
- Procesamiento de documentos con visión: combinado con el proyector `mmproj-BF16` del objetivo, acelera la generación de descripciones y respuestas sobre imágenes en pipelines de análisis documental.
- Generación de código en entornos de desarrollo local: en estaciones de trabajo Apple Silicon, permite respuestas de autocompletado más rápidas sobre el modelo objetivo sin hardware dedicado de datacenter.
- Evaluación comparativa de técnicas de decodificación especulativa: sirve como referencia reproducible para medir DFlash2 frente a DSpark u otros borradores sobre el mismo objetivo.
- Despliegue en Apple Silicon con memoria unificada: el tamaño de 1 GB del borrador se suma al objetivo cuantizado (Q8_K_XL) sin presión significativa de memoria, como demuestra la configuración verificada en 96 GB.
- Investigación en decodificación especulativa: el código de parcheo documentado permite estudiar el manejo de vocabularios con padding y la integración de normalizaciones del objetivo en borradores.

## Benchmarks y rendimiento

Rendimiento medido por el autor en la misma máquina (`sun`, M3 Ultra 96 GB), mismo servidor, `--temp 0`, 4 prompts × 2 repeticiones (se descarta el calentamiento), velocidad de decodificación según `timings.predicted_per_second` del servidor:

| Configuración | tok/s |
|---|---|
| Inkling-2-Mini + este borrador (`draft-dflash2`, n-max 7) | 56,6 de media (rango 37,9 – 74,6) |
| Inkling-2-Mini + borrador DSpark | 27,5 |
| Inkling-2-Mini sin borrador | 26,2 |

Advertencia del autor: las filas de DSpark y sin borrador se midieron con la build `b12588-mix` de Unsloth a contexto 32768 y 1 slot, mientras que la fila de 56,6 usa `c212d25ad` con parches, contexto 368640 y 3 slots. No constituyen una línea base controlada; debe remedirse la propia línea base sin borrador antes de citar un ratio de aceleración.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM adicional para el borrador: aproximadamente 1 GB en BF16 (955,7 MiB), sumado a la memoria del modelo objetivo.
- Configuración verificada: M3 Ultra con 96 GB de memoria unificada, sirviendo objetivo Q8_K_XL, proyector de visión BF16 y este borrador simultáneamente.
- GPU recomendadas: no hay datos publicados para GPU discretas; el autor solo documenta Apple Silicon. Cualquier GPU con memoria suficiente para el objetivo más 1 GB adicional podría alojarlo, pero no está verificado.
- Cabe en GPU de consumo: no verificado; depende del tamaño del objetivo, no del borrador.
- Opciones de despliegue: exclusivamente `llama-server` con una build de llama.cpp que incluya los parches de Inkling DFlash2 (`llama-inkling-dflash-work`, base `c212d25ad`). Las builds estándar, incluidas `b12588` y `b12675`, abortan en la primera completación.
- Parámetros de servicio verificados: `--spec-draft-n-max 7 --spec-draft-n-min 0 -c 368640 --parallel 3 -fa on -ngl 99 -ctk q8_0 -ctv q8_0 --jinja --reasoning on --temp 1.0 --top-p 1.0 --top-k 0 --min-p 0.0 --repeat-penalty 1.0`.
- Latencia y throughput: 56,6 tok/s de media en decodificación con la configuración anterior en M3 Ultra; sin datos de latencia de primera token ni de throughput en otras plataformas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-DFlash2-Draft (este) | Borrador DFlash2 | 494.983.424 | 1.048.576 | 56,6 tok/s (M3 Ultra, config. servida) | unknown | GGUF en HF |
| Borrador DSpark para Inkling-2-Mini | Borrador especulativo | no disponible | no disponible | 27,5 tok/s (build distinta, no controlado) | no disponible | mencionado por el autor |
| Inkling-2-Mini sin borrador | Modelo objetivo | no disponible | no disponible | 26,2 tok/s (build distinta, no controlado) | no disponible | HF (thinkingmachines/Inkling-2-Mini) |

No se dispone de datos para comparar con borradores de otras familias (por ejemplo, borradores EAGLE o Medusa) en el mismo objetivo, ni de especificaciones completas de los modelos alternativos.

## Limitaciones y advertencias

- No es un modelo autónomo: carece de cabeza de vocabulario utilizable y solo funciona emparejado con Inkling-2-Mini.
- Específico de Inkling: los parches de normalización de embeddings y de soft-capping lo atan al objetivo; apuntarlo a otros modelos produce resultados incorrectos.
- Requiere una build de llama.cpp parcheada; las builds estándar abortan con el error `get_sub_batch: failed to add token ... at index ...`. Esto complica el despliegue en producción y la actualización del runtime.
- Licencia `unknown`: no se especifican términos de uso comercial; debe consultarse el repositorio original de incoai antes de cualquier uso en producción.
- El repositorio original no incluye tokenizador; el GGUF hereda el del objetivo con padding de vocabulario, lo que exige el recorte documentado.
- Las cifras de rendimiento provienen de una única máquina (M3 Ultra) y de configuraciones no equivalentes entre filas; no deben extrapolarse sin remedición.
- Sin datos publicados sobre sesgos, tasa de alucinación o calidad multilingüe del borrador; estas propiedades dependen del modelo objetivo.
- Riesgo de deriva si el modelo objetivo o el runtime cambian: los parches están condicionados a `LLM_ARCH_INKLING2_LOOP` y a la versión `c212d25ad`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ufrik/Inkling-2-Mini-Dflash2-GGUF
- Modelo original del borrador: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Modelo objetivo: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Referencia SGLang del autor original: `sglang_inkling_dflash2.py` (incluido en el repositorio de incoai)
- llama.cpp (build base `c212d25ad` y parches DFlash2): no disponible como enlace directo en la información proporcionada
