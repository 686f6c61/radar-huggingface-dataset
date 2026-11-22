# Xylolabs/granite-3.3-8b-base-Tenstorrent-Tensix-BFP4

## Resumen

Granite 3.3 8B Base for Tenstorrent Tensix (BFP4) es una versión cuantizada del modelo base `ibm-granite/granite-3.3-8b-base` de IBM, publicada por Xylolabs y optimizada específicamente para su ejecución sobre aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo entrenado desde cero, sino de un checkpoint derivado cuyo objetivo es reducir el peso en memoria y adaptar el formato numérico a las unidades de cómputo Tensix mediante cuantización de bloque en punto flotante (block floating point, BFP4).

El modelo conserva los 8.372.162.560 parámetros del original, pero cuantiza a `bfloat4_b` las proyecciones de atención (q, k, v, o) y de MLP (gate, up, down) en las 40 capas del transformer, mientras que el LM head, los embeddings, las normas y el resto de tensores permanecen en bf16. El resultado es un checkpoint de 4,886 GB empaquetado para Tensix frente a los 16,34 GB en bf16, con una degradación medida de 0,05429 de divergencia KL media respecto al modelo en bf16.

Su relevancia actual reside en que permite desplegar un modelo de 8B con licencia Apache 2.0 en hardware de Tenstorrent con una precisión cercana a la de una cuantización Q4_K_M de llama.cpp, pero en un formato nativo para las NPU Tensix. Es un modelo base sin plantilla de chat, orientado a continuación de texto, y su uso requiere las herramientas `ttnn`/`tt-metal` o, alternativamente, `transformers` con los pesos en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Granite 3.3 8B) |
| Parametros totales | 8.372.162.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en proyecciones de atencion y MLP; bf16 en LM head, embeddings y normas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (valores cuantizados almacenados como bf16; empaquetado BFP4 para Tensix) |

## Arquitectura y entrenamiento

El checkpoint deriva del transformer decoder-only de IBM Granite 3.3 8B, con 40 capas y 8.372 millones de parámetros. La modificación introducida por Xylolabs no es de entrenamiento sino de compresión: se aplica GPTQ con búsqueda de exponente por bloque para cuantizar a `bfloat4_b` las matrices de proyección de atención (q, k, v, o) y de MLP (gate, up, down) de las 40 capas. El LM head, los embeddings, las normas y el resto de tensores se mantienen en bf16. El archivo `quant4.json` documenta el formato de cada proyección.

El proceso de cuantización se realizó con la herramienta `tensix-bfp-gptq` (commit `5c52065`), que incluye `tools/pack_tensix.py` y `tools/verify_grid.py` para empaquetar y verificar que ningún valor cambia al pasar por TT-NN. La evaluación de precisión se hizo contra una pasada propia en bf16 del checkpoint base sobre 8.184 posiciones de texto en inglés y coreano, con una divergencia KL media de 0,05429 y un top-1 del 89,71 %, frente a 0,05298 y 89,06 % de Q4_K_M de llama.cpp v0.9.0. No se especifican en la información disponible los datos de entrenamiento originales del modelo base (número de tokens, composición del dataset, RLHF/DPO), por lo que se remite a la model card de IBM.

## Capacidades

- Generación de texto y continuación de secuencias: es un modelo base sin plantilla de chat, diseñado para completar texto a partir de un prefijo.
- Razonamiento y conocimiento general heredados del modelo base Granite 3.3 8B (no se detallan capacidades específicas en la información disponible).
- Capacidades multilingües limitadas al inglés según el campo `language` del repositorio, aunque la evaluación de cuantización incluyó texto en coreano.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo thinking.
- Ejecución nativa en NPU Tenstorrent Tensix (Wormhole, Blackhole) mediante `ttnn` y `tt-metal`.

## Casos de uso

- Inferencia en NPU Tenstorrent: el checkpoint está empaquetado en BFP4 para ejecutarse en Wormhole y Blackhole con `ttnn`, lo que permite aprovechar la aceleración Tensix con un modelo de 8B que ocupa 4,886 GB en lugar de 16,34 GB.
- Continuación de texto y generación de documentos: al ser un modelo base, encaja en tareas de autocompletado, redacción asistida y generación de borradores en inglés, con el tokenizador y la configuración de EOS originales.
- Evaluación de precisión de cuantizaciones: sirve como referencia para comparar BFP4 frente a Q4_K_M y bf16 en términos de divergencia KL y top-1, útil en investigación sobre formatos numéricos de bloque.
- Prototipado en hardware de bajo consumo: el tamaño reducido del checkpoint empaquetado facilita desplegar un 8B en entornos con memoria limitada sobre aceleradores Tensix.
- Fine-tuning o adaptación posterior: al mantener LM head, embeddings y normas en bf16, es posible partir de este checkpoint para ajustes con `transformers` cargando los pesos en bf16.
- Investigación en compilación y kernels: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar el empaquetado y el round-trip por DRAM del dispositivo, útil para desarrolladores de kernels TT-NN.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas de 28 |
|---|---:|---:|---:|---:|
| BF16 (ibm-granite/granite-3.3-8b-base) | 16,34 | 0 | 100 | 18 |
| Este modelo (BFP4) | 4,886 | 0,05429 | 89,71 | 20 |
| Q4_K_M (llama.cpp) | 4,943 | 0,05298 | 89,06 | 19 |

Las métricas de KL y top-1 cubren 8.184 posiciones de texto en inglés y coreano, evaluadas contra una pasada propia en bf16 del checkpoint base. Q4_K_M se generó con llama.cpp v0.9.0 (`cd959ba`) sin matriz de importancia. Las 28 respuestas corresponden a prompts de tipo completion en modo three-shot y greedy. El modelo supera el umbral de precisión de 1,5 veces la KL de Q4_K_M, con un factor de 1,02. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 4,886 GB empaquetado en BFP4 para Tensix; 16,34 GB si se carga en bf16 con `transformers`.
- GPU/aceleradores recomendados: NPU Tenstorrent Wormhole y Blackhole (formato nativo BFP4); en GPU convencionales se puede cargar en bf16 con `transformers` y `device_map="auto"`.
- Cabe en GPU de consumo: sí en bf16 en tarjetas con al menos 16-24 GB (por ejemplo, RTX 4090), y en el formato empaquetado BFP4 en aceleradores Tensix compatibles.
- Opciones de despliegue: `ttnn`/`tt-metal` para Tensix; `transformers` con `AutoModelForCausalLM` para bf16; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada. `tt-transformers` y `tt-forge` no se probaron con este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Granite 3.3 8B BFP4) | 8,37B | no disponible | 4,886 GB (BFP4) | Apache 2.0 | Hugging Face, orientado a Tensix |
| ibm-granite/granite-3.3-8b-base (bf16) | 8,37B | no disponible | 16,34 GB | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo base) | 8,37B | no disponible | 4,943 GB | Apache 2.0 | Generado con llama.cpp v0.9.0 |

La comparativa se limita al mismo checkpoint base en distintas precisiones, ya que la información disponible no incluye otros modelos de la misma categoría con datos verificables.

## Limitaciones y advertencias

- Es un modelo base sin plantilla de chat: no está alineado para diálogo ni instrucciones, solo para continuación de texto.
- Idioma declarado únicamente inglés; el rendimiento en otros idiomas no está garantizado pese a la evaluación parcial en coreano.
- Riesgo de alucinación inherente a un modelo base de 8B sin RLHF documentado en esta ficha.
- La cuantización BFP4 introduce una divergencia KL media de 0,05429 respecto a bf16, con una caída de top-1 al 89,71 %; puede afectar a tareas sensibles a la precisión numérica.
- El checkpoint está pensado para Tensix; `tt-transformers` y `tt-forge` no se probaron con él, por lo que la integración en esos stacks no está validada.
- El repositorio no incluye archivo LICENSE original del modelo base; se añade el texto estándar Apache 2.0 y un NOTICE con los cambios.
- No está afiliado ni respaldado por Tenstorrent.
- No se documentan sesgos específicos ni restricciones adicionales de uso comercial más allá de la licencia Apache 2.0.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/granite-3.3-8b-base-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/ibm-granite/granite-3.3-8b-base
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
