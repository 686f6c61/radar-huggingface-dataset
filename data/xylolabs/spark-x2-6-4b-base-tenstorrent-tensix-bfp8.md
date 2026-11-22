# Xylolabs/Spark-X2.6-4B-Base-Tenstorrent-Tensix-BFP8

## Resumen

Spark-X2.6-4B-Base-Tenstorrent-Tensix-BFP8 es una versión cuantizada del modelo base XHToken/Spark-X2.6-4B-Base, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura transformer del original con 4.447.623.680 parámetros totales, pero sustituye las proyecciones de atención y MLP por tensores en formato block-floating-point de 8 bits (`bfloat8_b`), mientras que el LM head, los embeddings y las capas de normalización permanecen en bf16.

La relevancia de esta ficha reside en que no se trata de una simple cuantización GPTQ convencional, sino de un empaquetado orientado al hardware de Tenstorrent mediante el stack `tt-metal`/`ttnn`. El resultado ocupa 4,685 GB empaquetado frente a los 8,22 GB en bf16, con una divergencia media de KL respecto al modelo bf16 de 0,0003, lo que supone 0,01 veces la de llama.cpp Q4_K_M. Es, por tanto, una opción pensada para desplegar el modelo base en aceleradores Tensix con pérdida de precisión muy contenida.

El modelo base subyacente es un modelo de lenguaje de 4B parámetros orientado a generación de texto, con soporte para inglés y chino, licencia Apache 2.0 y código de modelado propio (`configuration_spark.py`, `modeling_spark.py`) que requiere `trust_remote_code=True`. Esta variante no incluye fine-tuning de instrucciones: es un modelo base que continúa texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (código propio `spark2_5`, `modeling_spark.py`) |
| Parametros totales | 4.447.623.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`bfloat8_b`) en proyecciones de atención y MLP; bf16 en LM head, embeddings y norms |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (valores cuantizados almacenados como bf16; empaquetado Tensix de 4,685 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 4B parámetros del que no se detallan en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF o DPO. El código de modelado proviene sin cambios de XHToken/Spark-X2.6-4B-Base y está orientado a transformers 4.57.1; en transformers 5.x requiere dos adaptaciones documentadas (`_tied_weights_keys` como mapa y llamadas a `create_causal_mask`/`create_sliding_window_causal_mask` con `inputs_embeds`).

La innovación técnica de esta variante es el pipeline de cuantización `tensix-bfp-gptq`: las 36 capas cuantizan `mlp.gate_proj`, `mlp.up_proj`, `mlp.down_proj`, `attention.out_proj` y `q_k_v_proj` a `bfloat8_b` mediante GPTQ, mientras que el resto de tensores se mantienen en bf16. El fichero `quant4.json` documenta el formato de cada proyección. Una particularidad relevante es que las 36 matrices fusionadas `q_k_v_proj` se almacenan en el orden de filas del modelo base (que transformers ejecuta sin cambios) y solo caen sobre la rejilla BFP8 cuando las filas de cada cabeza q y k se reordenan al orden del dispositivo; por ello las herramientas `pack_tensix.py` y `verify_grid.py` reportan esas 36 matrices como fuera de rejilla, mientras que las otras 144 pasan la verificación tal cual se almacenan. El checkpoint no se ha probado con tt-transformers ni con tt-forge.

## Capacidades

- Generación de texto autoregresiva en inglés y chino.
- Continuación de texto: es un modelo base, no un modelo de instrucciones; el chat template del repo base se conserva pero no se ha ajustado para diálogo.
- Razonamiento y conocimiento general heredados del modelo base de 4B parámetros (sin datos de benchmarks disponibles).
- Ejecución en hardware Tensix mediante TT-NN, con empaquetado de pesos a `bfloat8_b` y `bfloat4_b` según `quant4.json`.
- Carga estándar en transformers con `trust_remote_code=True` y `dtype="bfloat16"`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Despliegue en aceleradores Tenstorrent Wormhole y Blackhole: el checkpoint está empaquetado para TT-NN y permite ejecutar el modelo de 4B en NPU Tensix con pesos BFP8 de 4,685 GB, reduciendo la huella de memoria frente a bf16.
- Servicio de generación de texto en inglés y chino: al ser un modelo base, encaja en tareas de continuación, redacción asistida y generación de borradores donde no se requiere seguir instrucciones complejas.
- Prototipado de pipelines de cuantización block-floating-point: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar que ningún valor cambia al empaquetar y comprobar la rejilla BFP8 con torch, útil para equipos que evalúan GPTQ sobre Tensix.
- Investigación en eficiencia de hardware: la comparación de KL frente a bf16 (0,0003) y frente a llama.cpp Q4_K_M permite estudiar el compromiso precisión/memoria en NPU frente a GPU.
- Fine-tuning posterior sobre el modelo base: al conservar la licencia Apache 2.0 y el código original, puede servir como punto de partida para adaptaciones de dominio antes de reempaquetar a BFP8.
- Evaluación comparativa de stacks de inferencia: permite contrastar transformers con `trust_remote_code` frente a la ruta nativa TT-NN en términos de fidelidad numérica y ocupación de DRAM.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación cuyo contenido aparece truncado en la información disponible (solo se muestran las columnas "Size (GB)" y "Mean"). El único dato numérico completo es la fidelidad de cuantización:

| Metrica | Valor |
|---|---|
| Tamano empaquetado para Tensix | 4,685 GB |
| Tamano en bf16 | 8,22 GB |
| KL media frente a bf16 | 0,0003 |
| KL media de llama.cpp Q4_K_M (referencia) | 0,03 (0,01 veces la del modelo, según el autor) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 4,685 GB de pesos empaquetados para Tensix; en carga estándar con transformers los ficheros se sirven como bf16 y el repositorio ocupa 8,9 GB, por lo que se recomienda al menos 10-12 GB de memoria para inferencia en bf16.
- GPU recomendadas: no disponible para la ruta Tensix (el destino son NPU Wormhole y Blackhole); para la ruta transformers, una GPU con 12-16 GB de VRAM es suficiente para el modelo en bf16.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4090) usando la ruta transformers; la ruta Tensix requiere hardware Tenstorrent.
- Opciones de despliegue: transformers 4.57.1 con `trust_remote_code=True`; TT-NN/`tt-metal` para Tensix con `tensix-runner v0.1.0` y `tensix-kernels v0.1.0`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-4B-Base-Tenstorrent-Tensix-BFP8 | 4,45B | no disponible | BFP8 (Tensix) | Apache 2.0 | Hugging Face |
| XHToken/Spark-X2.6-4B-Base (original) | 4,45B | no disponible | bf16 | Apache 2.0 | Hugging Face |
| llama.cpp Q4_K_M (referencia de cuantizacion citada) | no aplica | no aplica | 4 bits K-quant | no aplica | llama.cpp |

La comparación con modelos de la misma categoría (4B parámetros) no está disponible en la información proporcionada; el único contraste numérico publicado es la KL media frente a bf16 y frente a Q4_K_M.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones ni mantiene diálogo de forma fiable; el chat template se conserva pero no se ha ajustado.
- Riesgo de alucinación propio de un modelo de 4B sin datos de evaluación publicados; no se han publicado benchmarks que permitan acotar su calidad.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- Longitud de contexto no disponible, lo que impide planificar cargas con ventanas largas.
- Las 36 matrices `q_k_v_proj` no están en la rejilla BFP8 en el orden de filas almacenado; requieren reordenación al orden del dispositivo antes de ejecutarse en Tensix, y las herramientas de verificación las reportan como fuera de rejilla.
- El checkpoint no se ha probado con tt-transformers ni tt-forge, por lo que la integración con esos stacks no está validada.
- En transformers 5.x el código requiere dos modificaciones manuales; con la versión 4.57.1 funciona tal cual.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base subyacente y el código de modelado deben auditarse antes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Spark-X2.6-4B-Base-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B-Base
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Código en el commit referenciado: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Spark-X2.6-4B-Base-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
