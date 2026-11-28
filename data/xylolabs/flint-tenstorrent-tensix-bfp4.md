# Xylolabs/flint-Tenstorrent-Tensix-BFP4

## Resumen

flint-Tenstorrent-Tensix-BFP4 es una versión cuantizada del modelo base RecursiveSI/flint, publicada por Xylolabs para su ejecución sobre aceleradores NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura y el comportamiento del original, pero sustituye los pesos de atención, MLP y expertos (enrutados y compartidos) por tensores en formato block floating point de 4 bits (bfloat4_b, abreviado BFP4), manteniendo el resto de componentes en bf16. Con 39.785.287.456 parámetros totales y un repositorio de 79,6 GB, el paquete cuantizado ocupa 23,299 GB empaquetado.

La relevancia de esta ficha radica en que es una de las pocas publicaciones que ofrece pesos preparados específicamente para el ecosistema tt-metal/ttnn de Tenstorrent, con scripts de empaquetado y verificación incluidos. El autor reporta una divergencia media de KL de 0,374 frente al modelo en BF16 sobre 16.320 posiciones de texto en inglés y coreano, y respuestas correctas en 33 de 33 prompts fijos de evaluación, lo que sitúa la pérdida de calidad por debajo del umbral declarado (1,5 veces la referencia Q4_K_M de llama.cpp, cuyo KL es 0,3039).

La licencia Apache 2.0 y la disponibilidad de los scripts `pack_tensix.py` y `verify_grid.py` facilitan su integración en pipelines de inferencia sobre hardware Tenstorrent, aunque la información pública sobre el modelo base (idiomas, contexto, datos de entrenamiento) es limitada y no está incluida en la model card de esta versión cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de RecursiveSI/flint; detalles no disponibles) |
| Parametros totales | 39.785.287.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (bfloat4_b) en atención, MLP y expertos enrutados/compartidos; resto en bf16; referencia Q4_K_M disponible para comparación |
| Idiomas soportados | no disponible (la evaluación de KL cubre inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (carpeta `bfp4/`), con `quant4.json` e índice de safetensors |

## Arquitectura y entrenamiento

El modelo base RecursiveSI/flint es un transformer de 39.785 millones de parámetros del que no se detallan en esta model card ni la composición del dataset de entrenamiento, ni el número de tokens, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card de la versión cuantizada se limita a describir el proceso de cuantización y el empaquetado para Tensix, por lo que los detalles arquitectónicos internos (número de capas, dimensiones ocultas, tipo de atención) no están disponibles en la información proporcionada.

La innovación técnica principal de esta publicación es el esquema de cuantización block floating point de 4 bits (bfloat4_b) aplicado selectivamente a las matrices de atención, MLP y expertos, mientras que el resto de tensores permanece en bf16. El repositorio incluye un fichero `quant4.json` que describe el formato por capa y submódulo, y scripts de empaquetado (`pack_tensix.py`) y verificación (`verify_grid.py`) que permiten comprobar el round-trip de los valores empaquetados contra los tensores originales. La evaluación de calidad se realiza mediante divergencia KL sobre 16.320 posiciones de WikiText-2 y Wikipedia en coreano, en texto plano y con plantilla de chat, con un límite de 1,5 veces el KL de la referencia Q4_K_M.

## Capacidades

- Generación de texto autoregresiva con plantilla de chat (el ejemplo de la model card usa `apply_chat_template` con roles user/assistant).
- Inferencia sobre NPU Tensix mediante ttnn, con conversión directa de tensores a `ttnn.bfloat4_b` y layout TILE.
- Ejecución en Transformers 5.22.2 o superior con `dtype="bfloat16"` y `device_map="auto"` para el quickstart en GPU/CPU.
- Soporte de empaquetado y verificación de matrices individuales mediante los scripts incluidos.
- Capacidades multilingües: la evaluación de KL incluye inglés y coreano, aunque no se declara una lista oficial de idiomas.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Despliegue en aceleradores Tenstorrent Wormhole y Blackhole: el paquete `bfp4/` está pensado para cargarse directamente en ttnn, reduciendo el peso de 79,57 GB a 23,299 GB y permitiendo ejecutar el modelo en NPUs con memoria DRAM limitada.
- Sustitución de la referencia BF16 en entornos de producción con restricciones de memoria: la divergencia KL de 0,374 y las 33/33 respuestas correctas en prompts fijos lo hacen adecuado para tareas de generación de texto general donde no se requiera fidelidad bit a bit.
- Evaluación comparativa de cuantizaciones: el repositorio incluye la referencia Q4_K_M (24,167 GB, KL 0,3039) para comparar el impacto de BFP4 frente a esquemas de llama.cpp en el mismo conjunto de evaluación.
- Investigación en cuantización block floating point: los scripts `pack_tensix.py` y `verify_grid.py` permiten reproducir el empaquetado y verificar la integridad de los tensores, útil para estudiar el efecto de BFP4 en modelos de ~40B.
- Integración en pipelines de Transformers: el quickstart con `AutoModelForCausalLM` y `AutoTokenizer` permite usar el modelo en flujos existentes de Hugging Face sin cambios mayores, siempre que se use Transformers 5.22.2 o superior.
- Prototipado de asistentes conversacionales: el uso de plantilla de chat en el ejemplo oficial facilita construir demos multi-turno sobre el modelo cuantizado.
- Benchmarking de hardware Tenstorrent: al estar empaquetado para Tensix, sirve como carga de trabajo representativa para medir throughput y latencia en Wormhole/Blackhole.

## Benchmarks y rendimiento

| Modelo / formato | Tamano empaquetado (GB) | KL medio vs BF16 | Respuestas correctas (33 prompts) |
|---|---|---|---|
| flint BFP4 (este modelo) | 23,299 | 0,374 | 33/33 |
| flint BF16 (referencia) | 79,57 | 0 | no disponible |
| flint Q4_K_M (llama.cpp) | 24,167 | 0,3039 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de calidad son la divergencia KL y el recuento de respuestas correctas sobre 33 prompts fijos.

## Requisitos de hardware

- VRAM/DRAM estimada: 23,299 GB para los pesos BFP4 empaquetados; el quickstart en Transformers carga el modelo con `dtype="bfloat16"` y `device_map="auto"`, por lo que en GPU se requiere memoria suficiente para la representación en bf16 o para la conversión parcial.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, una A100 80 GB o H100 80 GB permiten cargar el modelo en bf16, mientras que GPUs de 24 GB no son suficientes para los pesos completos.
- NPU objetivo: Tenstorrent Wormhole y Blackhole (Tensix), con carga vía ttnn y memoria DRAM.
- ¿Cabe en GPU de consumo? No para los pesos completos en bf16; el paquete BFP4 de 23,3 GB queda por encima de los 24 GB solo en el límite, por lo que no se garantiza en RTX 4090 sin técnicas adicionales.
- Opciones de despliegue: Transformers 5.22.2+, ttnn/tt-metal para Tensix, scripts `pack_tensix.py` y `verify_grid.py`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flint-Tenstorrent-Tensix-BFP4 | 39,79B | no disponible | BFP4, 23,299 GB | Apache 2.0 | Hugging Face |
| RecursiveSI/flint (BF16) | 39,79B | no disponible | BF16, 79,57 GB | Apache 2.0 | Hugging Face |
| flint Q4_K_M (llama.cpp) | 39,79B | no disponible | Q4_K_M, 24,167 GB | Apache 2.0 | Referencia en la model card |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización BFP4 introduce una divergencia media de KL de 0,374 frente a BF16, superior al 0,3039 de Q4_K_M; aunque dentro del umbral declarado, implica mayor pérdida de fidelidad que la referencia de llama.cpp.
- La evaluación de calidad se limita a 16.320 posiciones de inglés y coreano y a 33 prompts fijos, por lo que no cubre dominios especializados, código ni matemáticas.
- No se documentan sesgos conocidos ni evaluaciones de seguridad del modelo base ni de la versión cuantizada.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones específicas de factualidad.
- La lista de idiomas soportados no está disponible; solo se confirma evaluación en inglés y coreano.
- El soporte está orientado a hardware Tenstorrent; en GPU el quickstart requiere Transformers 5.22.2 o superior y memoria suficiente para bf16.
- La licencia Apache 2.0 permite uso comercial, pero cada carpeta incluye su propio `LICENSE` y `NOTICE`, que deben revisarse.
- El modelo fue renombrado el 2026-11-27 (antes flint-Tenstorrent-Tensix-BFP4) y los ficheros se movieron a `bfp4/`; scripts o rutas antiguas pueden fallar.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/flint-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/flint-Tenstorrent-Tensix/blob/main/LICENSE
- Referencia BF16 del modelo base (commit): https://huggingface.co/RecursiveSI/flint/tree/2a247be0c0aec895ccb0ac7ca92229ec6df37288
