# webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic-GGUF

## Resumen

Qwen3.8-27B-Perplexing-Pegasus-Heretic-GGUF es la distribucion en formato GGUF de un modelo derivado de la familia Qwen3.8, publicada por el usuario webbrain-one. Se trata de una cuantizacion con importance matrix (`imatrix`) del checkpoint BF16 `webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic`, que a su vez es una version "abliterated" (orientada a eliminar rechazos) del modelo `AveLabs/Qwen3.8-27B-Perplexing-Pegasus`, construido sobre `Qwen/Qwen3.8-27B` y `perplexity-ai/pplx-decider-v1-27b`.

El modelo cuenta con 27.320.697.856 parametros totales (27,3 mil millones) y es multimodal de tipo image-text-to-text, con un proyector de vision separado (`mmproj` en F16). Incorpora pesos de Multi-Token Prediction (MTP) en la capa `blk.64`, que el autor preserva explicitamente en `Q8_0` durante la cuantizacion para no degradar la decodificacion especulativa.

Su relevancia radica en ofrecer una via de despliegue local en `llama.cpp` (y derivados como LM Studio u Ollama) de un modelo de 27B con vision, contexto amplio y comportamiento sin censura, bajo licencia Apache-2.0. El repo ocupa 185,3 GB e incluye desde BF16 dividido hasta cuantizaciones IQ3_XXS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8) con Multi-Token Prediction (MTP, capa `blk.64`); proyector de vision separado |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 32.768 tokens en el ejemplo de uso documentado (`-c 32768`); maximo nativo no disponible |
| Tipos de cuantizacion | BF16 (split), Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, IQ4_XS, IQ3_XXS; proyector de vision F16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con `mmproj` F16 para vision |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su pertenencia a la familia Qwen3.8 (transformer denso de 27B) y de la presencia de pesos de Multi-Token Prediction en la capa `blk.64`, una tecnica de decodificacion especulativa que permite proponer varios tokens por paso. El modelo es multimodal: el pipeline declarado es image-text-to-text y se distribuye un proyector de vision independiente en F16 (`mmproj-...-F16.gguf`, 0,86 GB) que debe cargarse con `--mmproj`.

El linaje es encadenado: `Qwen/Qwen3.8-27B` y `perplexity-ai/pplx-decider-v1-27b` dan lugar a `AveLabs/Qwen3.8-27B-Perplexing-Pegasus`, sobre el que se aplica un proceso de "abliteration" (Heretic, variante ARA) para eliminar comportamientos de rechazo. La model card reporta metricas de verificacion del checkpoint BF16: 0 de 8 sondas de rechazo rechazadas con `enable_thinking=False`, 100,0% de concordancia en decisiones tipadas frente al Pegasus original (30 sondas), distancia de variacion total media de 0,0192 y, en el septimo ensayo Heretic, 6 de 104 rechazos del clasificador (frente a 102 de 104) con divergencia KL de 0,0618. No se detalla el volumen de tokens de entrenamiento ni la composicion del dataset original.

La cuantizacion emplea una importance matrix calculada directamente sobre el checkpoint BF16 abliterated, con un corpus de calibracion multidominio (conocimiento general, razonamiento, codigo, formato de chat multimodal y prompts de decision tipada de `pplx-decider`).

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Comprension de imagenes (image-text-to-text) mediante el proyector de vision F16.
- Modo de razonamiento controlable: soporta `<think>` y el parametro `enable_thinking` en la plantilla de chat.
- Decisiones tipadas de un solo token (typed-decisions), heredadas de `pplx-decider`.
- Decodificacion especulativa mediante Multi-Token Prediction (MTP) preservada en las cuantizaciones.
- Generacion de codigo (el corpus de calibracion incluye codigo, aunque no se publican benchmarks).
- Comportamiento "uncensored"/abliterated: baja tasa de rechazos ante peticiones.
- Capacidades multilingues limitadas al ingles segun la metadata.

## Casos de uso

- Asistente conversacional local con vision: desplegado en `llama-server` con `--mmproj`, permite mantener dialogos multi-turno sobre imagenes y texto con hasta 32.768 tokens de contexto en el ejemplo documentado.
- Analisis de documentos escaneados o capturas: el modelo puede recibir una imagen y responder preguntas sobre su contenido, util para extraccion de informacion en entornos sin conexion.
- Generacion de codigo en local: con la cuantizacion Q4_K_M (15,84 GB) cabe en GPUs de 24 GB y permite autocompletado y refactorizacion sin enviar codigo a la nube.
- Clasificacion y enrutamiento con typed-decisions: el formato de decision de un solo token de `pplx-decider` sirve para construir clasificadores ligeros o routers de agentes con latencia baja.
- Investigacion sobre alineacion y abliteration: el modelo es util como objeto de estudio para medir efectos de la eliminacion de rechazos, con metricas de KL y sondas de rechazo documentadas.
- Despliegue en hardware heterogeneo: las cuantizaciones IQ3_XXS (11,09 GB) y Q3_K_M (13,00 GB) permiten offload parcial a CPU o GPUs de gama media con 12-16 GB de VRAM.
- Prototipado de agentes multimodales: la plantilla Jinja (`--jinja`) y la compatibilidad con endpoints permiten integrarlo en frameworks de agentes que necesiten entrada de imagen y texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas internas de verificacion del proceso de abliteration y cuantizacion:

| Metrica | Resultado |
|---|---|
| Sondas de rechazo rechazadas (`enable_thinking=False`) | 0 / 8 |
| Concordancia typed-decision vs Pegasus original (30 sondas) | 100,0% |
| Distancia de variacion total media | 0,0192 |
| Rechazos del clasificador Heretic (ensayo 7) | 6 / 104 (antes 102 / 104) |
| Divergencia KL (ensayo 7) | 0,0618 |

## Requisitos de hardware

- VRAM estimada segun cuantizacion: IQ3_XXS ~11,1 GB; Q3_K_M ~13,0 GB; IQ4_XS ~14,7 GB; Q4_K_M ~15,8 GB (recomendado por el autor para 24 GB de VRAM); Q5_K_M ~18,3 GB; Q6_K ~20,9 GB; Q8_0 ~27,1 GB; BF16 ~50,9 GB (dos fragmentos).
- Sumar ~0,86 GB del proyector de vision F16 si se usa entrada de imagen.
- GPUs recomendadas: el autor cita H100/B200/RTX PRO 6000 para BF16; para GGUF, RTX 4090 (24 GB) con Q4_K_M o Q5_K_M, y GPUs de 12-16 GB con IQ3_XXS o Q3_K_M.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M y en GPUs de 12 GB con cuantizaciones IQ3.
- Opciones de despliegue: `llama.cpp` (`llama-server`, `llama-cli`), LM Studio, Ollama; el autor menciona tambien variantes AutoRound INT4 y NVFP4 para vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Perplexing-Pegasus-Heretic-GGUF | 27,3 B | 32.768 en ejemplo documentado | Si (`mmproj` F16) | Apache-2.0 | Abliterated, MTP, GGUF imatrix |
| AveLabs/Qwen3.8-27B-Perplexing-Pegasus | no disponible | no disponible | Si (heredada) | no disponible | Modelo base sin abliteration |
| webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic (BF16) | 27,3 B | no disponible | Si | Apache-2.0 | Checkpoint de referencia en safetensors |
| Qwen/Qwen3.8-27B | 27,3 B (inferido) | no disponible | no disponible | no disponible | Modelo original de Qwen |

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de rechazos implica que puede generar contenido inapropiado, ofensivo o inseguro; requiere filtros externos en produccion.
- Idiomas: la metadata declara unicamente ingles; el rendimiento en castellano no esta verificado.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni benchmarks estandar.
- La cuantizacion a bits bajos (IQ3_XXS, Q3_K_M) puede degradar calidad; el autor preserva `blk.64` en Q8_0 pero no documenta perdida de perplexity por cuantizacion.
- El contexto documentado (32.768) es el del ejemplo de despliegue, no necesariamente el maximo nativo del modelo.
- Licencia Apache-2.0 permite uso comercial, pero el usuario es responsable del cumplimiento normativo, tal como indica el autor.
- Repo de 185,3 GB: requiere espacio en disco considerable incluso para descargar una sola cuantizacion.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic-GGUF
- Checkpoint BF16: https://huggingface.co/webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic
- Variante AutoRound INT4: https://huggingface.co/webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic-AutoRound-INT4
- Variante NVFP4: https://huggingface.co/webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic-NVFP4
- Modelo base AveLabs: https://huggingface.co/AveLabs/Qwen3.8-27B-Perplexing-Pegasus
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo pplx-decider: https://huggingface.co/perplexity-ai/pplx-decider-v1-27b
