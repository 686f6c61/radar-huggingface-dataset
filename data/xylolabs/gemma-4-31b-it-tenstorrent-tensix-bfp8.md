# Xylolabs/gemma-4-31B-it-Tenstorrent-Tensix-BFP8

## Resumen

Gemma 4 31B IT en formato BFP8 para Tenstorrent Tensix es una cuantización del checkpoint oficial `google/gemma-4-31B-it-qat-q4_0-unquantized`, publicada por Xylolabs. El objetivo no es otro que permitir la ejecución del modelo multimodal de Google sobre aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole) con un formato de coma flotante en bloque (`bfloat8_b`, BFP8) que el hardware Tensix procesa de forma nativa. Frente al checkpoint en bf16, el peso empaquetado baja de 61,39 GB a 33,938 GB, lo que lo hace viable en configuraciones de memoria más ajustadas sin renunciar a una fidelidad numérica alta.

El modelo conserva la arquitectura y las capacidades del Gemma 4 31B instruct original: es un modelo multimodal de entrada imagen-texto, con 32.682.375.020 parámetros reales según los tensores publicados, y mantiene en bf16 las partes sensibles a la precisión (embeddings, LM head atado, normalizaciones y la torre de visión), mientras que las proyecciones de atención y MLP se cuantizan a BFP8 mediante GPTQ sobre la rejilla del formato.

Su relevancia radica en dos factores. Primero, demuestra que es posible servir un modelo de 31B multimodal en NPUs de Tenstorrent con una degradación mínima respecto a bf16 (KL media de 0,00174 y top-1 del 98,67 % sobre 8.048 posiciones de texto en inglés y coreano). Segundo, ofrece una alternativa al ecosistema habitual de CUDA para despliegues en hardware especializado, con licencia Apache 2.0 y pesos en safetensors compatibles con `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Gemma 4; atención y MLP cuantizados a `bfloat8_b` (BFP8) sobre rejilla Tensix |
| Parametros totales | 32.682.375.020 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`bfloat8_b`) en proyecciones q, k, o, v y MLP gate/up/down; bf16 en LM head, embeddings, normas y torre de visión. Existe una variante BFP4 publicada por el mismo autor |
| Idiomas soportados | no disponible en la model card; la evaluación incluye texto en inglés y coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `quant4.json` que describe el formato por proyección) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint QAT de Google (`gemma-4-31B-it-qat-q4_0-unquantized`), que ya incorpora entrenamiento con cuantización consciente para Q4_0. Xylolabs aplica sobre él una cuantización GPTQ dirigida a la rejilla `bfloat8_b` de Tensix: las proyecciones de atención (q, k, o en 60 capas; v en 50 capas) y las tres proyecciones MLP (gate, up, down en 60 capas) se almacenan en BFP8, mientras que el resto de tensores (embedding, LM head atado, normas y los componentes de visión `embed_vision` y `vision_tower`) permanecen en bf16 sin modificar. El fichero `quant4.json` documenta el formato de cada proyección.

La innovación técnica está en el empaquetado para el hardware Tensix: los pesos se reorganizan para su carga directa en DRAM del dispositivo mediante `ttnn.as_tensor` con `TILE_LAYOUT`, y el repositorio incluye las herramientas `pack_tensix.py` y `verify_grid.py` (del proyecto `tensix-bfp-gptq`) para validar la rejilla y el round-trip a través de DRAM. La verificación se realizó con `ttnn 0.81.1` sobre `ttsim`, el simulador de Blackhole de Tenstorrent. No se detalla en la información disponible el volumen de tokens de entrenamiento ni la composición del dataset más allá de lo heredado del modelo base de Google.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`) y modo instruct.
- Procesamiento multimodal imagen-texto: el pipeline declarado es `image-text-to-text` y se conservan la torre de visión y el proyector en bf16.
- Razonamiento y respuesta a preguntas en formato multi-turno.
- Capacidades multilingües heredadas del modelo base; la evaluación de fidelidad incluye inglés y coreano.
- Compatibilidad con `transformers` mediante `AutoModelForCausalLM` y `AutoTokenizer`.
- Ejecución en aceleradores Tenstorrent Wormhole y Blackhole mediante kernels y runner propios (`tensix-kernels`, `tensix-runner`).
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en NPUs Tenstorrent: servir Gemma 4 31B sobre Wormhole o Blackhole aprovechando el formato BFP8 nativo del hardware, con un peso de 33,938 GB frente a los 61,39 GB en bf16, lo que reduce los requisitos de DRAM del acelerador.
- Inferencia multimodal en entornos con restricciones de memoria: al mantener la torre de visión en bf16 y las proyecciones en BFP8, se puede ejecutar descripción de imágenes y VQA en dispositivos Tensix con menor huella que la versión completa.
- Evaluación de fidelidad de cuantización: el par de scripts `pack_tensix.py` y `verify_grid.py` permite validar cada matriz contra el checkpoint original, útil en pipelines de control de calidad de modelos cuantizados antes de producción.
- Investigación en formatos de coma flotante en bloque: sirve como referencia reproducible para comparar BFP8 frente a Q4_0 en términos de KL y top-1 sobre un mismo checkpoint QAT.
- Asistente conversacional autoalojado: con licencia Apache 2.0 y pesos en safetensors, se puede integrar en servicios internos de chat multi-turno sin dependencia de APIs externas.
- Prototipado en simulación: la verificación con `ttsim` permite desarrollar y depurar kernels para Blackhole sin disponer del hardware físico.
- Sustitución de la variante BFP4: en dispositivos con más memoria disponible, esta versión BFP8 ofrece mayor fidelidad que la BFP4 del mismo autor para tareas sensibles a la precisión numérica.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (base `google/gemma-4-31B-it-qat-q4_0-unquantized`) | 61,39 | 0 | 100 |
| **Este modelo (BFP8)** | 33,938 | 0,00174 | 98,67 |
| Q4_0 (llama.cpp v0.9.0, sin importance matrix) | 17,651 | 0,01920 | 95,33 |

La evaluación cubre 8.048 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano) aplicando la plantilla de chat. El modelo BFP8 reduce la KL media a bf16 en un factor de 0,09 respecto a Q4_0 (0,00174 frente a 0,01920) y recupera 3,34 puntos de top-1 sobre Q4_0. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 33,938 GB de pesos empaquetados para Tensix; el repo completo ocupa 65,4 GB.
- Aceleradores objetivo: Tenstorrent Wormhole y Blackhole (NPU Tensix). Verificado con `ttnn 0.81.1` sobre `ttsim`, el simulador de Blackhole.
- GPU consumer: no se documenta soporte CUDA específico; la carga vía `transformers` con `device_map="auto"` requeriría memoria suficiente para los tensores en el dispositivo, pero no hay datos de rendimiento publicados en GPU.
- Opciones de despliegue: `transformers` (carga estándar), `ttnn` con `TILE_LAYOUT` y `DRAM_MEMORY_CONFIG` para Tensix, y el runner `tensix-runner v0.1.0` junto con `tensix-kernels v0.1.0`.
- Alternativa de menor memoria: variante BFP4 del mismo autor (`Xylolabs/gemma-4-31B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP4-GateUp`) para dispositivos con menos memoria.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Plataforma |
|---|---|---|---|---|---|
| **Este modelo (BFP8 Tensix)** | 32,68 B | no disponible | 33,938 GB (Tensix) | Apache 2.0 | Tenstorrent Wormhole/Blackhole, transformers |
| BFP4 Tensix (mismo autor) | 32,68 B | no disponible | no disponible | Apache 2.0 | Tenstorrent, para dispositivos con menos memoria |
| Q4_0 llama.cpp (referencia) | 32,68 B | no disponible | 17,651 GB | Apache 2.0 (heredada) | CPU/GPU vía llama.cpp |
| BF16 base (Google) | 32,68 B | no disponible | 61,39 GB | Apache 2.0 | GPU/CPU |

La comparación relevante es interna al mismo checkpoint: BFP8 ocupa casi el doble que Q4_0 (33,938 frente a 17,651 GB) pero mejora la KL media en un factor de 11 y el top-1 en 3,34 puntos. Frente a bf16, reduce el tamaño un 44,7 % con una pérdida de top-1 de 1,33 puntos. No se dispone de datos de benchmarks de tareas para comparar con otros modelos de 31B de la competencia.

## Limitaciones y advertencias

- La cuantización BFP8 introduce una degradación medible: top-1 del 98,67 % frente al 100 % del bf16, con KL media de 0,00174 sobre el conjunto evaluado.
- La evaluación de fidelidad se limita a 8.048 posiciones de inglés y coreano; no cubre otros idiomas ni tareas de razonamiento, código o visión.
- El soporte está orientado a hardware Tensix; el rendimiento en GPU o CPU no está documentado y puede no ser óptimo.
- La verificación en hardware se realizó sobre el simulador `ttsim`, no necesariamente en silicio Blackhole o Wormhole real.
- Riesgo de alucinación y sesgos: heredados del modelo base de Google; no se documentan análisis específicos en esta ficha.
- Longitud de contexto no documentada en la model card; conviene consultar la del modelo base antes de desplegar cargas con ventanas largas.
- La licencia Apache 2.0 se aplica según la card del modelo base, pero el repositorio original de Google no incluye fichero LICENSE; el autor añade el texto estándar y un NOTICE con los cambios.
- Los scripts `pack_tensix.py` y `verify_grid.py` se distribuyen sin cambios desde `tensix-bfp-gptq` en el commit `5c52065`; cualquier modificación local debe revalidarse con `verify_grid.py`.
- El modelo fue renombrado el 2026-11-27 desde BFP8; los pesos son idénticos, pero conviene fijar la revisión en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-31B-it-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Variante BFP4: https://huggingface.co/Xylolabs/gemma-4-31B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP4-GateUp
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
