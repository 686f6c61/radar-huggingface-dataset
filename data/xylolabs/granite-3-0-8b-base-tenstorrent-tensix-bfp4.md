# Xylolabs/granite-3.0-8b-base-Tenstorrent-Tensix-BFP4

## Resumen

Granite 3.0 8B Base para Tenstorrent Tensix es una versión cuantizada del modelo base `ibm-granite/granite-3.0-8b-base` de IBM, adaptada específicamente para ejecutarse en aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole) mediante el stack `tt-metal`/`ttnn`. La desarrolla Xylolabs y emplea un esquema de cuantización de bloque en coma flotante (block floating point) de 4 bits, denotado `bfloat4_b` o BFP4, aplicado a las proyecciones de atención y MLP de las 40 capas del transformer.

El modelo resuelve un problema muy concreto: permitir desplegar un LLM de 8.000 millones de parámetros en hardware Tensix con un peso empaquetado de 4,886 GB frente a los 16,34 GB en bf16, manteniendo una fidelidad numérica razonable respecto al checkpoint original. La cuantización se realizó con GPTQ y una búsqueda de exponentes por bloque, y se valida contra una referencia de llama.cpp Q4_K_M.

Es relevante para quienes trabajan con hardware alternativo a GPU y necesitan ejecutar modelos abiertos en NPUs. Se distribuye bajo licencia Apache 2.0, con pesos en safetensors y compatibilidad declarada con `transformers`, aunque el rendimiento óptimo requiere el runner y los kernels propios de Xylolabs para Tensix.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: IBM Granite 3.0 8B) |
| Parametros totales | 8.372.162.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en proyecciones q, k, v, o, gate, up, down; embeddings y normas en float32; LM head y norma final en bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (empaquetado Tensix de 4,886 GB; el repo contiene los valores cuantizados como bf16, 17,1 GB) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `ibm-granite/granite-3.0-8b-base`, un transformer decoder-only de 8.000 millones de parámetros con 40 capas. Sobre esa base, Xylolabs aplica cuantización GPTQ con búsqueda de exponente por bloque para producir tensores en formato `bfloat4_b` (BFP4). Las proyecciones cuantizadas son las de atención (q, k, v, o) y las de MLP (gate, up, down) en las 40 capas. El LM head, los embeddings y las normas se mantienen en precisión superior: el embedding de entrada y las normas por capa conservan los valores float32 del checkpoint base, y la norma final y el LM head quedan en bf16. El fichero `quant4.json` documenta el formato de cada proyección.

No se detalla en la información disponible el volumen de tokens de entrenamiento ni la composición del dataset del modelo base, ni si hubo fases de RLHF o DPO. La innovación técnica principal es el propio esquema de cuantización de bloque en coma flotante orientado al hardware Tensix, junto con las herramientas de empaquetado y verificación (`pack_tensix.py` y `verify_grid.py`) que comprueban que ningún valor cambia al empaquetar para TT-NN. El modelo se distribuye como base preentrenada, sin plantilla de chat, por lo que su uso natural es la continuación de texto.

## Capacidades

- Generación de texto y continuación de secuencias en inglés, al ser un modelo base preentrenado.
- Razonamiento y conocimiento general heredados del checkpoint Granite 3.0 8B Base.
- Ejecución en NPUs Tenstorrent Tensix (Wormhole, Blackhole) mediante `ttnn` y `tt-metal`.
- Compatibilidad con `transformers` para carga estándar en bf16 con `AutoModelForCausalLM`.
- Cuantización BFP4 verificable: herramientas de empaquetado y validación incluidas en el repositorio.
- No dispone de plantilla de chat ni de ajuste por instrucciones en esta variante.
- Soporte de tool calling, function calling, agentes o modo thinking: no disponible en la información proporcionada (el modelo base sin ajuste no los incorpora de serie).
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Inferencia en NPUs Tenstorrent: desplegar un LLM de 8B en Wormhole o Blackhole aprovechando el empaquetado BFP4 de 4,886 GB, reduciendo la huella de memoria frente a bf16 y permitiendo ejecutar el modelo en aceleradores con DRAM limitada.
- Prototipado de pipelines de cuantización: usar `pack_tensix.py` y `verify_grid.py` como referencia para validar que el empaquetado a TT-NN no altera valores, útil para equipos que preparan otros modelos para Tensix.
- Investigación en formatos de bloque: el esquema BFP4 con exponente por bloque sirve como banco de pruebas para estudiar el compromiso entre tamaño y fidelidad (KL media de 0,05162 frente a bf16) en comparación con Q4_K_M.
- Generación de texto y completado en inglés: al ser un modelo base sin plantilla de chat, encaja en tareas de continuación, generación de borradores y experimentos de prompting few-shot.
- Evaluación comparativa de hardware: medir latencia y throughput de un 8B cuantizado en Tensix frente a GPU, usando el mismo checkpoint base como referencia de calidad.
- Base para ajuste fino posterior: al conservar la estructura y el tokenizador originales, puede servir de punto de partida para fine-tuning en tareas específicas, aunque la cuantización BFP4 limita la precisión de los pesos.
- Docencia y experimentación con hardware alternativo: entorno de bajo coste relativo para estudiar el despliegue de LLMs en NPUs sin depender de GPU de gama alta.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas de 28 |
|---|---:|---:|---:|---:|
| BF16 (ibm-granite/granite-3.0-8b-base) | 16,34 | 0 | 100 | 19 |
| Este modelo (BFP4) | 4,886 | 0,05162 | 90,37 | 19 |
| Q4_K_M (llama.cpp) | 4,943 | 0,04580 | 90,37 | 21 |

Las métricas de KL y top-1 cubren 8.184 posiciones de texto en inglés y coreano, evaluadas contra una pasada bf16 propia del checkpoint base. Q4_K_M se generó con llama.cpp v0.9.0 (`cd959ba`) sin matriz de importancia. Las 28 respuestas corresponden a prompts de tipo completion en modo three-shot con decodificación greedy. El modelo supera el control de precisión de cuantización: su KL es 1,13 veces la de Q4_K_M, por debajo del límite de 1,5 veces.

## Requisitos de hardware

- VRAM/DRAM estimada: 4,886 GB empaquetado para Tensix; en carga bf16 vía `transformers` el repo ocupa 17,1 GB, por lo que se necesita al menos esa cantidad de memoria más overhead.
- GPU recomendadas para carga estándar: no se especifican; un modelo de 8B en bf16 requiere del orden de 16-17 GB de VRAM, lo que encaja en A100 40/80 GB, H100 y RTX 4090 (24 GB).
- Hardware objetivo: NPUs Tenstorrent Tensix Wormhole y Blackhole con `tt-metal`/`ttnn`.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) para bf16; en GPUs de 16 GB requeriría cuantización adicional no incluida en este repo.
- Opciones de despliegue: `transformers` (bf16), `ttnn` con kernels y runner de Xylolabs (`tensix-kernels v0.1.0`, `tensix-runner v0.1.0`). `tt-transformers` y `tt-forge` no se probaron con este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Granite 3.0 8B BFP4) | 8,37 B | no disponible | BFP4, 4,886 GB | Apache 2.0 | Optimizado para Tensix; KL 0,05162 |
| ibm-granite/granite-3.0-8b-base (BF16) | 8,37 B | no disponible | bf16, 16,34 GB | Apache 2.0 | Referencia de calidad, top-1 100 % |
| Q4_K_M (llama.cpp) sobre el mismo base | 8,37 B | no disponible | 4,943 GB | Apache 2.0 | KL 0,04580; 21/28 respuestas correctas |
| Llama 3.1 8B | 8,03 B | no disponible | varios | Llama 3.1 Community | Alternativa de tamano similar, no evaluada aquí |

## Limitaciones y advertencias

- Modelo base preentrenado: no sigue instrucciones ni dispone de plantilla de chat; no debe usarse directamente como asistente conversacional.
- Solo inglés declarado; el benchmark incluye texto coreano, pero el soporte multilingüe no está garantizado.
- Riesgo de alucinación inherente a un modelo base de 8B sin ajuste por preferencias.
- La cuantización BFP4 introduce degradación medible: top-1 del 90,37 % frente al 100 % en bf16 y KL media de 0,05162.
- El rendimiento óptimo depende de kernels y runner específicos de Tensix; `tt-transformers` y `tt-forge` no se validaron con este checkpoint.
- El repositorio no incluye fichero LICENSE original del modelo base; se añade el texto estándar Apache 2.0 y un NOTICE con los cambios.
- Uso comercial permitido por Apache 2.0, pero conviene revisar las condiciones del modelo base de IBM y las dependencias de Xylolabs.
- No afiliado a IBM ni a Tenstorrent según la model card.
- Fecha de creación del repositorio (2026-11-22) y cero descargas: ecosistema y validación comunitaria muy limitados.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/granite-3.0-8b-base-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/ibm-granite/granite-3.0-8b-base
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Código en commit concreto: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
