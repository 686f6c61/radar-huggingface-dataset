# Xylolabs/flint-Tensix-BFP4

## Resumen

flint-Tensix-BFP4 es una versión cuantizada del modelo `RecursiveSI/flint`, publicada por Xylolabs y orientada específicamente a la ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole) mediante la pila de software `tt-metal`, `ttnn` y `tt-forge`. El modelo conserva la arquitectura del original (un transformer con mezcla de expertos, a juzgar por la presencia de expertos enrutados y un experto compartido en 47 capas) y aplica cuantización GPTQ a las capas lineales en el formato de coma flotante por bloques `ttnn.bfloat4_b`, con un promedio de 4,68 bits por peso.

La relevancia de esta ficha no está en el modelo base, sino en el formato: es un ejemplo de cuantización de bajo bit-width diseñada para el hardware de Tenstorrent, no para GPU convencional. El checkpoint empaquetado ocupa 23,30 GB frente a los 79,57 GB del BF16 de referencia, lo que lo hace viable en aceleradores con memoria limitada y en despliegues donde el ancho de banda de memoria es el cuello de botella.

No obstante, conviene subrayar que la evaluación publicada es limitada: mide fidelidad respecto a BF16 (KL medio y top-1) sobre 16.320 posiciones de texto en inglés y coreano, y una prueba de 33 preguntas fijas. No hay benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible, y la verificación en hardware Tensix se realizó sobre el simulador Blackhole (`ttsim`), no sobre silicio real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE): atención en 49 capas, MLP densa en 2 capas, expertos enrutados y experto compartido en 47 capas |
| Parámetros totales | 39.785.287.456 (39,8 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en capas lineales; router, LM head, embeddings y normas en bf16 |
| Idiomas soportados | no disponible en la model card (la evaluación cubre inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con metadatos `quant4.json` y `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

El modelo base `RecursiveSI/flint` es un transformer con mezcla de expertos: 49 capas de atención, 2 capas de MLP densa y 47 capas con expertos enrutados más un experto compartido. Esta versión no reentrena el modelo; aplica un pipeline de cuantización GPTQ sobre las proyecciones lineales (q, k, v, o de atención; gate, up y down de MLP; y gate, up, down de expertos enrutados y del experto compartido), manteniendo el router, el LM head, los embeddings y las normas en bf16. El resultado son 4,68 bits por peso de media y 23,30 GB empaquetados.

La innovación técnica principal es el uso del formato de coma flotante por bloques `bfloat4_b` de TT-NN, que almacena los pesos cuantizados como valores bf16 sobre una rejilla BFP4 con exponente por bloque. La cuantización se realizó con GPTQ y una búsqueda de exponente por bloque (offsets -1 y 0, damping 0,1). Antes de cuantizar, se permutaron canales intermedios de algunos expertos (filas de gate/up y columnas correspondientes de down), de modo que la referencia BF16 utilizada para medir la fidelidad es un checkpoint reordenado, no el original. El autor advierte que la suma en precisión finita y el enrutamiento de expertos pueden cambiar con esa permutación. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional: la model card incluye un ejemplo de chat con plantilla de conversación (`apply_chat_template`).
- Razonamiento: la prueba de respuesta documentada se ejecutó con razonamiento activado y un límite de 1.024 tokens nuevos, y el checkpoint respondió correctamente 33 de 33 prompts fijos.
- Capacidades multilingües: la evaluación de fidelidad cubre inglés y coreano (WikiText-2 y Wikipedia en coreano), aunque la lista oficial de idiomas no está publicada.
- Cuantización orientada a hardware: los pesos pueden cargarse directamente en TT-NN con `ttnn.as_tensor` en `bfloat4_b` y verificarse bit a bit.
- Compatibilidad con `transformers`: el checkpoint se carga con `AutoModelForCausalLM` en bf16 y `device_map="auto"`, verificado con Transformers 5.22.2 en CPU.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; la única evidencia es la prueba de razonamiento con 33 prompts.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso principal. El checkpoint está pensado para cargarse en Wormhole o Blackhole con TT-NN, empaquetando cada matriz en `bfloat4_b` y verificando que ningún valor cambia tras el round-trip. Es adecuado porque el formato y el empaquetado están alineados con la pila `tt-metal`/`ttnn`.
- Inferencia en memoria reducida: con 23,30 GB empaquetados frente a 79,57 GB en BF16, permite ejecutar un modelo de 39,8 mil millones de parámetros en aceleradores o nodos donde el BF16 no cabría. Útil para prototipos y entornos con DRAM limitada.
- Evaluación de fidelidad de cuantización: el repositorio incluye `pack_tensix.py` y `verify_grid.py`, que permiten comprobar matriz a matriz que la rejilla BFP4 se preserva. Sirve como banco de pruebas para pipelines de cuantización GPTQ sobre TT-NN.
- Chat conversacional de propósito general: el ejemplo de quickstart con plantilla de chat y el resultado de 33/33 respuestas correctas sugieren uso en asistentes de texto, siempre que se acepte la pérdida de fidelidad medida (top-1 del 78,66 % respecto a BF16).
- Investigación en formatos de bajo bit-width: comparar BFP4 (4,68 bits/peso, KL 0,374) con Q4_K_M de llama.cpp (4,86 bits/peso, KL 0,3039) permite estudiar el compromiso entre formato de hardware y calidad.
- Procesamiento de texto en inglés y coreano: la evaluación cubre ambos idiomas, por lo que es razonable para tareas de generación en esos idiomas, aunque no hay datos de calidad por tarea.
- Integración en pipelines de `transformers`: al cargarse con `AutoModelForCausalLM` en bf16, puede usarse como checkpoint de referencia en CPU/GPU para comparar contra la ejecución nativa en Tensix.

## Benchmarks y rendimiento

Los únicos datos publicados miden la fidelidad respecto al BF16 de referencia, no el rendimiento en tareas:

| Modelo | Bits por peso | Tamaño (GB) | KL medio a BF16 | Top-1 (%) |
|---|---:|---:|---:|---:|
| BF16 reordenado (RecursiveSI/flint) | 16 | 79,57 | 0 | 100 |
| flint-Tensix-BFP4 (este modelo) | 4,68 | 23,299 | 0,374 | 78,66 |
| Q4_K_M (llama.cpp) | 4,86 | 24,167 | 0,3039 | 80,58 |

El KL y el top-1 se midieron sobre 16.320 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en plantilla simple y en plantilla de chat, en CPU/GPU con los valores bf16 del checkpoint cuantizado. El suelo de KL medio entre las dos referencias BF16 es 0,0561, y el KL de este modelo es 1,23 veces el de Q4_K_M. En la prueba de respuesta documentada, tanto este checkpoint como su referencia BF16 reordenada acertaron 33 de 33 prompts fijos con razonamiento activado y un límite de 1.024 tokens nuevos.

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 23,30 GB para los pesos empaquetados en BFP4; el checkpoint completo en disco ocupa 79,6 GB.
- Aceleradores objetivo: Tenstorrent Wormhole y Blackhole (Tensix). La verificación se hizo con `ttnn` 0.81.1 sobre `ttsim`, el simulador de Blackhole, no sobre hardware real.
- GPU convencional: el checkpoint se puede cargar en bf16 con `transformers` y `device_map="auto"`, lo que requiere del orden de 80 GB de memoria para los pesos en bf16; no es un checkpoint pensado para GPU de consumo en ese formato.
- Opciones de despliegue: TT-NN (`ttnn.as_tensor` con `ttnn.bfloat4_b`), `tt-metal`, `tt-forge` y `tt-transformers`. El autor indica que `tt-transformers` y `tt-forge` no se ejecutaron con este checkpoint.
- Herramientas de verificación: `pack_tensix.py` (comprueba cada matriz, con opción `--device` para round-trip por DRAM) y `verify_grid.py` (verifica la rejilla solo con torch).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tamaño | KL a BF16 | Licencia |
|---|---|---:|---|---:|---:|---|
| flint-Tensix-BFP4 | 39,8 mil millones | no disponible | BFP4, 4,68 bits/peso | 23,30 GB | 0,374 | Apache 2.0 |
| RecursiveSI/flint (BF16) | 39,8 mil millones | no disponible | BF16 | 79,57 GB | 0 (referencia) | Apache 2.0 |
| Q4_K_M de flint (llama.cpp) | 39,8 mil millones | no disponible | Q4_K_M, 4,86 bits/peso | 24,17 GB | 0,3039 | Apache 2.0 |

La comparación relevante es interna al mismo modelo base: BFP4 para Tensix frente a Q4_K_M para llama.cpp. Q4_K_M obtiene mejor fidelidad (KL 0,3039 y top-1 80,58 %) con un tamaño ligeramente mayor, mientras que BFP4 está diseñado para el formato nativo de TT-NN y no para CPU/GPU. No se dispone de comparación con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce pérdida de fidelidad medible: KL medio de 0,374 y top-1 del 78,66 % respecto a BF16, con un KL 1,23 veces superior al de Q4_K_M.
- La referencia BF16 usada para la evaluación es un checkpoint reordenado con permutación de canales de expertos; la suma en precisión finita y el enrutamiento de expertos pueden diferir del checkpoint original.
- La verificación en Tensix se realizó sobre el simulador `ttsim`, no sobre hardware Wormhole o Blackhole real; el rendimiento en silicio no está documentado.
- `tt-transformers` y `tt-forge` no se probaron con este checkpoint.
- No hay datos publicados de benchmarks de tareas, sesgos, tasas de alucinación ni calidad por idioma más allá de la prueba de 33 prompts.
- La lista oficial de idiomas soportados no está disponible; la evaluación solo cubre inglés y coreano.
- La longitud de contexto no está documentada en la información disponible.
- Licencia Apache 2.0, que permite uso comercial, pero el autor distribuye el modelo "tal cual", sin garantía, y no está afiliado ni respaldado por Tenstorrent.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/flint-Tensix-BFP4
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Referencia BF16 reordenada: https://huggingface.co/RecursiveSI/flint/tree/2a247be0c0aec895ccb0ac7ca92229ec6df37288
- Repositorio de código `tensix-bfp-gptq`: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/flint-Tensix-BFP4/blob/main/LICENSE
