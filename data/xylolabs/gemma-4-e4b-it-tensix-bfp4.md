# Xylolabs/gemma-4-E4B-it-Tensix-BFP4

## Resumen

Gemma 4 E4B IT Tensix BFP4 es una versión cuantizada del modelo multimodal google/gemma-4-E4B-it, desarrollada por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). La cuantización aplica formato block-floating-point de 4 bits (`bfloat4_b`, BFP4) mediante GPTQ con búsqueda de exponente por bloque, reduciendo el peso empaquetado de 15,04 GB en bf16 a 9,444 GB, lo que supone un ahorro de aproximadamente el 37 % de espacio.

El modelo conserva intactas en bf16 las partes sensibles: la LM head, el embedding, las normas, así como los componentes de visión (`vision_tower`, `embed_vision`) y audio (`audio_tower`, `embed_audio`). Solo las proyecciones de atención (q, o en 42 capas; k, v en 24 capas) y las del MLP (gate, up, down en 42 capas) se cuantizan a BFP4. El pipeline declarado es `any-to-any`, lo que refleja la naturaleza multimodal del modelo base.

La relevancia de esta ficha radica en que es una de las primeras distribuciones públicas de un modelo Gemma 4 cuantizado específicamente para el ecosistema Tenstorrent (tt-metal, ttnn, tt-forge), con verificación de fidelidad de cuantización publicada (KL medio a bf16 de 0,0970 frente a 0,1999 de Q4_K_M de llama.cpp) y herramientas de empaquetado y verificación liberadas bajo la misma licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la del modelo base google/gemma-4-E4B-it); no se detalla en la model card |
| Parametros totales | 8.667.245.130 (8,67 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en proyecciones de atención y MLP; bf16 en LM head, embedding, normas, vision_tower, embed_vision, audio_tower y embed_audio. Compatible también con empaquetado exacto en `ttnn.bfloat8_b` |
| Idiomas soportados | no disponible (la evaluación mencionada cubre inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 17,4 GB; 9,444 GB empaquetado para Tensix) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base más allá de los nombres de sus componentes (capas de atención, MLP, `vision_tower`, `audio_tower`, embeddings separados de visión y audio), lo que confirma que se trata de un transformer multimodal con torres de visión y audio. El proceso de cuantización sí está documentado: se aplica GPTQ con búsqueda de exponente por bloque sobre las proyecciones de atención y MLP, dejando el resto de tensores en bf16. El fichero `quant4.json` especifica el formato de cada proyección.

La innovación técnica destacable es el uso del formato block-floating-point `bfloat4_b` nativo de Tenstorrent, que permite empaquetar los pesos de forma que se carguen directamente en DRAM del dispositivo Tensix sin conversión adicional, y que además puede reempaquetarse de forma exacta en `ttnn.bfloat8_b`. Las herramientas `pack_tensix.py` y `verify_grid.py` (del repositorio tensix-bfp-gptq en el commit 5c52065) permiten verificar cada matriz mediante round-trip a torch y, opcionalmente, a través de DRAM del dispositivo. No se proporcionan datos sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO, ya que se trata de una cuantización, no de un entrenamiento desde cero.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base Gemma 4 E4B IT (variante instruction-tuned).
- Procesamiento de imagen y texto (`image-text-to-text`), con `vision_tower` y `embed_vision` en bf16.
- Procesamiento de audio, con `audio_tower` y `embed_audio` en bf16, lo que justifica el pipeline `any-to-any`.
- Soporte de plantilla de chat (`apply_chat_template`) para conversaciones multi-turno.
- Ejecución sobre aceleradores Tenstorrent Tensix (Wormhole, Blackhole) mediante ttnn, con kernels y runner propios (tensix-kernels v0.1.0, tensix-runner v0.1.0).
- Compatibilidad con `transformers` estándar (carga con `AutoModelForCausalLM` y `dtype="bfloat16"`), lo que permite usarlo también en GPU/CPU convencionales.
- Tool calling, function calling, modo thinking y otras capacidades específicas del modelo base: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en hardware Tenstorrent: el modelo está empaquetado para cargarse directamente en DRAM de NPUs Wormhole y Blackhole mediante ttnn, lo que permite servir inferencia multimodal en aceleradores de bajo consumo sin GPU NVIDIA.
- Evaluación de fidelidad de cuantización: investigadores pueden reproducir la comparación KL/top-1 frente a bf16 y Q4_K_M usando `verify_grid.py` y `pack_tensix.py`, útil para estudiar el impacto de BFP4 en modelos multimodales.
- Prototipado de asistentes multimodales en entornos con presupuesto de memoria ajustado: los 9,444 GB empaquetados frente a 15,04 GB en bf16 permiten alojar el modelo en dispositivos con menos DRAM.
- Investigación sobre formatos block-floating-point: el repo sirve como referencia práctica de cómo aplicar GPTQ con búsqueda de exponente por bloque a un transformer multimodal.
- Integración en pipelines de `transformers`: al cargarse con `AutoModelForCausalLM` y `device_map="auto"`, puede usarse en scripts estándar de generación y evaluación sin código específico de Tenstorrent.
- Benchmarking comparativo de cuantizaciones: la tabla de evaluación publicada (KL medio y top-1 sobre WikiText-2 y Wikipedia coreana) permite contrastar BFP4 frente a Q4_K_M en tareas de lenguaje reales.
- Reproducibilidad de cuantizaciones: el commit fijado (5c52065) y las versiones v0.1.0 de las herramientas permiten reconstruir el proceso de empaquetado de forma determinista.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL medio a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (google/gemma-4-E4B-it) | 15,04 | 0 | 100 |
| **Este modelo (BFP4)** | 9,444 | 0,09700 | 86,56 |
| Q4_K_M (llama.cpp) | 5,335 | 0,19989 | 81,05 |

Las métricas de KL y top-1 se calculan sobre 7.968 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia coreana), aplicando la plantilla de chat. Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 9,444 GB empaquetado para Tensix; 15,04 GB en bf16 para el modelo base; el repo completo ocupa 17,4 GB.
- GPU recomendadas: no se especifican en la model card. El destino principal son NPUs Tenstorrent Wormhole y Blackhole.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; con 8,67 mil millones de parámetros y pesos en bf16 (15 GB) requeriría GPUs de 24 GB o más (RTX 3090/4090) para carga completa en bf16, o cuantización adicional para GPUs menores. No hay datos publicados sobre este escenario.
- Opciones de despliegue: `transformers` (con `AutoModelForCausalLM` y `device_map="auto"`), ttnn/tt-metal en Tensix, tensix-runner v0.1.0. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano pesos | Licencia | Plataforma objetivo |
|---|---|---|---|---|---|
| **Gemma 4 E4B IT Tensix BFP4 (este)** | 8,67 B | no disponible | 9,444 GB (BFP4) | Apache 2.0 | Tenstorrent Tensix + transformers |
| google/gemma-4-E4B-it (bf16) | 8,67 B | no disponible | 15,04 GB | Apache 2.0 | GPU/CPU estándar |
| Gemma 4 E4B IT Q4_K_M (llama.cpp) | 8,67 B | no disponible | 5,335 GB | Apache 2.0 | CPU/GPU con llama.cpp |

La comparación se limita al mismo checkpoint en distintos formatos, ya que la información disponible no incluye otros modelos de la misma categoría con datos verificables. Frente a Q4_K_M, este modelo ocupa más espacio (9,444 GB frente a 5,335 GB) pero ofrece mejor fidelidad (KL 0,0970 frente a 0,1999; top-1 86,56 % frente a 81,05 %). Frente a bf16, reduce el tamaño un 37 % con una pérdida de top-1 de 13,44 puntos porcentuales.

## Limitaciones y advertencias

- La cuantización BFP4 introduce degradación medible: KL medio de 0,0970 y top-1 del 86,56 % frente a bf16, lo que puede afectar a tareas sensibles a la precisión numérica.
- Solo se cuantizan atención y MLP; el resto de tensores permanece en bf16, por lo que el ahorro de memoria es parcial.
- La evaluación se limita a inglés y coreano (7.968 posiciones); no hay datos sobre otros idiomas, y la lista de idiomas soportados no está publicada.
- No se publican benchmarks estándar (MMLU, HumanEval, GSM8G, etc.) ni datos de contexto máximo, tool calling o modo thinking.
- El modelo está optimizado para Tensix; el rendimiento en GPU/CPU convencionales no está documentado.
- La licencia es Apache 2.0, pero la model card advierte que el repositorio del modelo base no incluye fichero LICENSE, por lo que el texto estándar se incluye manualmente; conviene revisar el fichero NOTICE para los cambios respecto al original.
- Riesgo de sesgos y alucinaciones: no se documentan en la información disponible; al heredarse del modelo base, aplican los mismos caveats que en google/gemma-4-E4B-it.
- El modelo tiene 240 descargas y 0 likes, lo que indica una adopción muy temprana y poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E4B-it-Tensix-BFP4
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper Gemma 4 Technical Report: https://arxiv.org/abs/2607.02770
