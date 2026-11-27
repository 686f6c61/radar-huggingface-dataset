# Xylolabs/Phi-4-mini-reasoning-Tenstorrent-Tensix-BFP4

## Resumen

Phi-4-mini-reasoning-Tenstorrent-Tensix-BFP4 es una cuantización del modelo microsoft/Phi-4-mini-reasoning (4.450.618.368 parámetros) realizada por Xylolabs, orientada específicamente a la ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). No se trata de una cuantización genérica para GPU, sino de un empaquetado en el formato de bloque de coma flotante propietario de Tenstorrent (BFP4 y BFP8), pensado para que las matrices encajen directamente en la memoria DRAM de los NPU Tensix mediante TT-NN.

La distribución de precisión es mixta: las proyecciones MLP de las 32 capas se cuantizan a `bfloat4_b` (BFP4) mediante GPTQ con búsqueda de exponente por bloque, mientras que las proyecciones de atención (q, k, v, o) se cuantizan a `bfloat8_b` (BFP8) por redondeo al más cercano. El embedding, el LM head (atado al embedding), las normas y el resto de tensores permanecen en bf16. El resultado es un paquete de 3,444 GB frente a los 7,67 GB del modelo base en bf16.

La relevancia de esta ficha es doble: por un lado, documenta el primer empaquetado público conocido de un modelo de razonamiento compacto para el ecosistema Tenstorrent; por otro, sirve como referencia de evaluación de cuantización extrema en 4 bits con formato de bloque, comparada directamente contra llama.cpp Q4_K_M sobre las mismas posiciones de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Phi-4-mini-reasoning); cuantización de bloque BFP para Tensix |
| Parametros totales | 4.450.618.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en MLP gate/up/down; BFP8 (`bfloat8_b`) en atención q/k/v/o; bf16 en embedding, LM head, normas y resto |
| Idiomas soportados | en (inglés) |
| Licencia | MIT (modelo base y cuantización); scripts `pack_tensix.py` y `verify_grid.py` bajo Apache-2.0 |
| Formato de pesos | safetensors (packed para Tensix), indexado con `model.safetensors.index.json` y metadatos de formato en `quant4.json` |

## Arquitectura y entrenamiento

El modelo subyacente es microsoft/Phi-4-mini-reasoning, un transformer decoder-only de aproximadamente 4,45 mil millones de parámetros con 32 capas, orientado a tareas de razonamiento. Esta ficha no documenta el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO); esa información corresponde a la model card de Microsoft y no se incluye en la información proporcionada.

La innovación técnica de esta versión es el pipeline de cuantización `tensix-bfp-gptq` v0.1.0: las matrices MLP se cuantizan con GPTQ y una búsqueda de exponente por bloque para el formato de bloque de 4 bits de Tensix, mientras que las matrices de atención usan redondeo al más cercano en BFP8. Las 224 matrices cuantizadas pasaron la comprobación de rejilla (`verify_grid.py`), y la comprobación de empaquetado TT-NN sobre ttsim cubrió las capas 0 y 1 con coincidencia exacta de valores. El runner (`tensix-runner` v0.1.0) y los kernels (`tensix-kernels` v0.1.0) se publican por separado.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredadas del modelo base Phi-4-mini-reasoning.
- Razonamiento matemático y resolución de problemas estructurados (capacidad del modelo base; no se aportan benchmarks específicos en esta ficha).
- Conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- Ejecución en transformers con `dtype="bfloat16"` y `device_map="auto"`, además de ejecución nativa en Tensix vía TT-NN.
- Empaquetado y verificación de matrices individuales con `pack_tensix.py` (incluye round-trip por DRAM del dispositivo con `--device`).
- Capacidades multilingües: limitadas a inglés según el campo `language` del modelo.
- No se documentan en la información disponible capacidades de tool calling, function calling, visión, audio ni modo thinking explícito.

## Casos de uso

- Despliegue en hardware Tenstorrent Wormhole o Blackhole: el paquete de 3,444 GB encaja en la DRAM de los NPU Tensix y permite servir el modelo sin GPU, usando `tensix-runner` como runtime.
- Investigación en cuantización de bloque: el repositorio incluye `quant4.json`, `verify_grid.py` y `pack_tensix.py`, lo que permite reproducir y auditar la cuantización BFP4/BFP8 matriz a matriz.
- Evaluación comparativa de formatos: la model card publica KL media y top-1 frente a bf16 y frente a llama.cpp Q4_K_M sobre 16.192 posiciones, útil para estudiar el impacto de la cuantización de bloque frente a la cuantización K-quant.
- Prototipado de razonamiento en entornos con presupuesto de memoria reducido: con 3,444 GB empaquetados, el modelo es viable en dispositivos de borde con NPU Tensix donde un bf16 de 7,67 GB no cabría.
- Validación de pipelines TT-Forge/TT-Metal: sirve como caso de prueba real de empaquetado TT-NN, con comprobaciones de rejilla y de round-trip por DRAM documentadas.
- Fine-tuning o adaptación posterior sobre el modelo base: al mantener embedding, LM head y normas en bf16, el checkpoint es compatible con transformers para cargas en bf16 y puede servir de punto de partida antes de reempaquetar para Tensix.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (microsoft/Phi-4-mini-reasoning) | 7,67 | 0 | 100 |
| **Este modelo (BFP4 MLP / BFP8 atención)** | 3,444 | 1,162884 | 57,82 |
| Q4_K_M (llama.cpp) | 2,486 | 1,147011 | 56,09 |

Las métricas de KL y top-1 se calculan sobre 16.192 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con plantilla de chat. Cada fila se puntúa contra la misma pasada BF16 sobre las mismas posiciones. Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM: 3,444 GB empaquetados para Tensix; 7,67 GB si se carga en bf16 con transformers.
- Aceleradores objetivo: Tenstorrent Wormhole y Blackhole (Tensix NPU), con TT-NN, TT-Metal y TT-Forge.
- GPU consumer: no se documenta soporte específico; la carga en transformers en bf16 requiere aproximadamente 9 GB de memoria, por lo que cabría en GPUs con 12 GB o más, pero el formato BFP no está pensado para GPU.
- Despliegue: `tensix-runner` v0.1.0 y `tensix-kernels` v0.1.0 para Tensix; transformers para carga en bf16; no se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones soportadas para este paquete.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Phi-4-mini-reasoning Tensix BFP4) | 4,45 B | no disponible | BFP4/BFP8, 3,444 GB | MIT | Hugging Face (184 descargas) |
| microsoft/Phi-4-mini-reasoning (bf16) | 4,45 B | no disponible | bf16, 7,67 GB | MIT | Hugging Face (modelo base) |
| Q4_K_M de llama.cpp sobre el mismo checkpoint | 4,45 B | no disponible | GGUF K-quant, 2,486 GB | MIT | Generado localmente con llama.cpp v0.9.0 |

La comparativa se limita a variantes de cuantización del mismo checkpoint, ya que la información proporcionada no incluye otros modelos de razonamiento comparables. En precisión, este paquete queda a 1,01 veces la KL de Q4_K_M (1,1629 frente a 1,1470) ocupando un 38,6 % más de espacio (3,444 GB frente a 2,486 GB), pero con un top-1 superior (57,82 % frente a 56,09 %).

## Limitaciones y advertencias

- El paquete está diseñado para Tensix; no es un artefacto portable a GPU ni a llama.cpp sin reconversión.
- Idiomas: solo inglés declarado; la evaluación incluye coreano, pero el soporte multilingüe no está garantizado.
- La cuantización BFP4 en MLP introduce una degradación medible: top-1 del 57,82 % frente al 100 % del bf16 en las posiciones evaluadas.
- La verificación TT-NN sobre dispositivo solo cubrió las capas 0 y 1; el resto se validó con comprobación de rejilla en torch, no con round-trip completo por DRAM.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de seguridad en la información proporcionada; deben consultarse en la model card del modelo base.
- La licencia MIT permite uso comercial, pero los scripts `pack_tensix.py` y `verify_grid.py` son Apache-2.0 y las modificaciones se detallan en `NOTICE`.
- El repositorio tiene 0 likes y 184 descargas, con dos actualizaciones de metadatos (renombrado y corrección del método de cuantización BFP8); conviene fijar una revisión concreta en producción.
- No se dispone de datos de latencia, throughput ni consumo energético en Tensix.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Phi-4-mini-reasoning-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-reasoning
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Phi-4-mini-reasoning-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
