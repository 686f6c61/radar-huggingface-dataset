# Xylolabs/Qwen2.5-7B-Instruct-1M-Tensix-BFP4-MLP

## Resumen

Este checkpoint es una versión cuantizada de `Qwen/Qwen2.5-7B-Instruct-1M`, el modelo instructivo de Qwen con ventana de contexto extensible hasta 1 millón de tokens. La cuantización no está pensada para GPUs convencionales, sino para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole), que consumen pesos en formatos de coma flotante por bloques (`ttnn.bfloat4_b` y `ttnn.bfloat8_b`). El trabajo lo firma Xylolabs, un tercero no afiliado a Tenstorrent, mediante su herramienta `tensix-bfp-gptq`.

La particularidad técnica es que las capas lineales de atención se cuantizan a BFP8 (8,5 bits por peso) con redondeo al más cercano, mientras que las proyecciones MLP (gate, up, down) se cuantizan a BFP4 (4,5 bits por peso) con GPTQ y búsqueda de exponente por bloque. El resultado es un promedio de 6,58 bits por peso y un peso empaquetado de 6,26 GB, frente a los 15,23 GB del modelo base en BF16. Los tensores se guardan en bf16 pero con todos los valores ya situados en la rejilla BFP4/BFP8, de modo que TT-NN los empaqueta sin transformación adicional.

Es relevante ahora porque abre la puerta a ejecutar un modelo de 7B con contexto de 1M en hardware de aceleración abierta de Tenstorrent, un segmento con poca oferta de pesos pre-cuantizados en formatos nativos. La contrapartida es que el checkpoint se ha validado únicamente en `ttsim`, el simulador Blackhole de Tenstorrent con `ttnn` 0.81.1, y no en silicio real; además, `tt-transformers` y `tt-forge` no se han probado con estos pesos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), pesos cuantizados para Tensix (BFP4/BFP8) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1M tokens (heredada del modelo base Qwen2.5-7B-Instruct-1M) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en MLP; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en atención; resto en bf16. Media 6,58 bits/peso |
| Idiomas soportados | en (declarado en la model card); el base Qwen2.5 cubre más idiomas, pero este checkpoint solo declara inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (valores ya en rejilla BFP4/BFP8, almacenados en bf16); índice `model.safetensors.index.json` y mapa `quant4.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct-1M: un transformer decoder-only con 28 capas, atención con RoPE y ventana de contexto extendida hasta 1M tokens mediante las técnicas de extensión de Qwen (YaRN y ajuste fino específico para contexto largo). Sobre esa base, Xylolabs aplica un esquema de cuantización híbrido orientado al layout de TT-NN: las proyecciones q, k, v y o de las 28 capas pasan a `bfloat8_b` con redondeo al más cercano, y las proyecciones gate, up y down del MLP pasan a `bfloat4_b` mediante GPTQ con búsqueda de exponente por bloque. El resto de tensores (embeddings, LM head, normas y demás) se mantienen en bf16 como en el modelo original.

La calibración de GPTQ se realizó sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano, lo que explica que la evaluación de fidelidad incluya texto en inglés y coreano. No se documenta un proceso de RLHF o DPO propio de este checkpoint: el ajuste instructivo proviene del modelo base de Qwen. La innovación destacable no es el algoritmo de cuantización en sí, sino el formato de destino: pesos ya alineados a la rejilla de coma flotante por bloques de Tensix, verificables con `verify_grid.py` (solo con torch) y `pack_tensix.py` (que empaqueta cada matriz y comprueba que ningún valor cambia, opcionalmente con ida y vuelta por DRAM del dispositivo).

## Capacidades

- Generación de texto conversacional con plantilla de chat de Qwen (`apply_chat_template`).
- Razonamiento y respuesta a instrucciones heredados de Qwen2.5-7B-Instruct.
- Manejo de contextos muy largos (hasta 1M tokens) gracias a la variante 1M del modelo base.
- Generación de código y matemáticas a nivel del modelo base (no se aportan métricas propias en este checkpoint).
- Tool calling y function calling: capacidad del modelo base, no verificada en este checkpoint cuantizado.
- Capacidades multilingües del base Qwen2.5, aunque la model card solo declara inglés y la calibración incluye coreano.
- No incluye visión, audio ni modo de razonamiento explícito (thinking) en la información disponible.

## Casos de uso

- Despliegue en NPU Tensix: el caso natural es ejecutar el modelo en Wormhole o Blackhole con TT-NN, donde el checkpoint se empaqueta directamente sin recuantizar; el peso de 6,26 GB encaja mejor en la memoria del dispositivo que los 15,23 GB en BF16.
- Procesamiento de documentos largos: con contexto de hasta 1M tokens, se puede resumir o extraer información de contratos, informes o repositorios completos en una sola pasada, siempre que el backend soporte la ventana extendida.
- Asistente conversacional multi-turno: la plantilla de chat de Qwen y la fidelidad medida (91,41 % de top-1 frente a BF16) permiten usar el modelo en diálogos de atención al cliente donde la latencia y el coste de memoria importan.
- Generación de código en pipelines internos: el modelo base cubre generación y explicación de código; en este formato resulta adecuado para entornos con aceleradores Tenstorrent y sin GPUs dedicadas.
- Evaluación y validación de cuantización: los scripts `verify_grid.py` y `pack_tensix.py` permiten comprobar la integridad de la rejilla BFP antes de integrar el checkpoint en un pipeline de despliegue.
- Investigación en formatos de coma flotante por bloques: sirve como referencia reproducible para estudiar el impacto de BFP4 en MLP frente a BFP8 en atención, con métricas de KL y top-1 publicadas.
- Prototipado en simulador: al haberse validado en `ttsim`, es útil para desarrollar kernels o grafos TT-NN antes de disponer de hardware físico.

## Benchmarks y rendimiento

Los datos publicados miden fidelidad respecto a BF16, no calidad de tarea:

| Modelo | Bits/peso | Tamano (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen2.5-7B-Instruct-1M) | 16 | 15,23 | 0 | 100 | 30 de 33 | - |
| Este modelo (BFP4 MLP / BFP8 attn) | 6,58 | 6,262 | 0,03451 | 91,41 | 28 de 33 | 1 |
| Q4_K_M (llama.cpp) | 4,91 | 4,683 | 0,03061 | 91,63 | 31 de 33 | 0 |

El KL y el top-1 se calculan sobre 16.184 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia coreana), en formato plano y con plantilla de chat. Las 33 respuestas son prompts cortos con verificación automática; "perdidas" cuenta respuestas correctas en BF16 que aquí fallan o se rompen. El criterio del autor era no superar 1,5 veces el KL de Q4_K_M y no perder más de una respuesta adicional; se cumple con 1,13 veces el KL y una respuesta perdida. No se midió velocidad en dispositivo.

## Requisitos de hardware

- VRAM/peso empaquetado: 6,26 GB en el formato BFP4/BFP8; el repo ocupa 15,2 GB por incluir los tensores en bf16 y artefactos auxiliares.
- GPU convencionales: el checkpoint está pensado para Tensix; en GPU habría que recuantizar o usar los tensores bf16, lo que anula la ventaja de tamaño.
- Hardware objetivo: NPU Tenstorrent Wormhole y Blackhole.
- Validación: `ttnn` 0.81.1 sobre `ttsim` (simulador Blackhole); no probado en hardware real.
- Despliegue: TT-NN (`ttnn.as_tensor` con `bfloat4_b`/`bfloat8_b`, `TILE_LAYOUT`, `DRAM_MEMORY_CONFIG`); `tt-transformers` y `tt-forge` no se han ejecutado con este checkpoint.
- Inferencia en transformers: posible cargando en bfloat16 con `device_map="auto"`, pero sin aprovechar el formato Tensix.
- Latencia y throughput: no disponibles (no se midió velocidad en dispositivo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits/peso | Tamano | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| Este checkpoint (BFP4 MLP / BFP8 attn) | 7,6B | 1M | 6,58 | 6,26 GB | Apache 2.0 | Tensix (validado en simulador) |
| Qwen2.5-7B-Instruct-1M (BF16) | 7,6B | 1M | 16 | 15,23 GB | Apache 2.0 | GPU/CPU |
| Q4_K_M del mismo checkpoint (llama.cpp) | 7,6B | 1M | 4,91 | 4,68 GB | Apache 2.0 | CPU/GPU vía llama.cpp |

La comparación relevante es de fidelidad y formato: Q4_K_M logra un KL ligeramente menor (0,03061 frente a 0,03451) y conserva una respuesta más, pero no es un formato nativo de Tensix. Este checkpoint sacrifica algo de fidelidad para obtener pesos directamente empaquetables en TT-NN con 6,58 bits/peso.

## Limitaciones y advertencias

- No validado en hardware Tensix real: solo en `ttsim` con `ttnn` 0.81.1; el comportamiento en Wormhole o Blackhole no está confirmado.
- `tt-transformers` y `tt-forge` no se han probado con este checkpoint.
- La evaluación mide cercanía a BF16 (KL y top-1), no calidad de tarea; no hay resultados de MMLU, HumanEval o GSM8K para este checkpoint.
- Pérdida de fidelidad: una respuesta de 33 se pierde frente a BF16, y el top-1 baja al 91,41 %.
- Idiomas: la model card declara solo inglés; el multilingüismo del base no está verificado aquí.
- Riesgo de alucinación y sesgos: heredados del modelo base Qwen2.5-7B-Instruct-1M, no evaluados en esta cuantización.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara el modelo "as is", sin garantía, y no afiliado ni respaldado por Tenstorrent.
- El repo de 15,2 GB incluye tensores en bf16 además del peso empaquetado de 6,26 GB; hay que seleccionar el formato adecuado al desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-7B-Instruct-1M-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-1M
- Repositorio de código `tensix-bfp-gptq`: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2501.15383): https://arxiv.org/abs/2501.15383
