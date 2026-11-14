# Xylolabs/Qwen3-4B-Base-Tenstorrent-Tensix-BFP8

## Resumen

Qwen3-4B-Base-Tenstorrent-Tensix-BFP8 es una exportación cuantizada del modelo Qwen3-4B-Base de Alibaba Qwen, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura transformer del original, con 4.411.424.256 parámetros totales, pero cuantiza sus capas lineales a `ttnn.bfloat8_b` (BFP8, block floating point de 8 bits) mediante GPTQ, de forma que TT-NN puede empaquetar las matrices sin alterar sus valores. El resultado ocupa 4,64 GB en memoria de dispositivo para los pesos del modelo de lenguaje, frente a los 8,04 GB del BF16.

La relevancia de esta ficha no está en la calidad del modelo base, sino en el formato de despliegue: es un artefacto pensado para ejecutarse sobre hardware de Tenstorrent, no sobre GPU convencional. Las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP8, lo que permite una verificación bit a bit del empaquetado. La calibración de GPTQ se realizó sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano.

Es importante subrayar que se trata del modelo *base*, no ajustado a instrucciones: continúa texto y no sigue instrucciones. La model card indica además que tt-transformers y tt-forge no se probaron con este checkpoint, y que la validación se hizo con ttnn 0.81.1 sobre ttsim (simulador Blackhole). La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3), capas lineales cuantizadas a BFP8 para Tensix |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso en matrices; 9,23 bits por peso de media); existe version BFP4 del mismo autor |
| Idiomas soportados | no disponible (calibracion en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 8,8 GB); empaquetado destino BFP8 en TT-NN |

## Arquitectura y entrenamiento

El modelo base Qwen3-4B-Base es un transformer denso de 4.411 millones de parámetros, descrito en el Qwen3 Technical Report (arXiv:2505.09388). Esta exportación no reentrena el modelo: aplica GPTQ sobre la rejilla bfloat8_b a las proyecciones de atención (q, k, v, o) y a las del MLP (gate, up, down) en las 36 capas, mientras que la LM head (atada al embedding), el embedding, las normas y el resto de tensores permanecen en bf16. El resultado es una media de 9,23 bits por peso y 4,64 GB empaquetados.

La innovación técnica está en el formato: las matrices cuantizadas se almacenan como valores bf16 situados exactamente sobre la rejilla BFP8, de modo que el empaquetador de TT-NN las lee sin modificar sus valores. El repositorio incluye `quant4.json`, que lista el formato de cada proyección, y scripts (`pack_tensix.py`, `verify_grid.py`) para comprobar el empaquetado matriz a matriz y el round-trip por DRAM del dispositivo. La calibración de GPTQ usó 65.536 tokens de WikiText-2 y Wikipedia en coreano. No se documenta en la información disponible ningún proceso de RLHF o DPO adicional sobre esta exportación.

## Capacidades

- Generación de texto y continuación de texto: es un modelo base, sin ajuste a instrucciones.
- Razonamiento y conocimiento general heredados del Qwen3-4B-Base original.
- Generación de código y matemáticas: capacidades del modelo base, no evaluadas específicamente en esta exportación.
- Soporte de tool calling / function calling: no disponible (el modelo base no está ajustado para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; la calibración incluyó inglés y coreano.
- Capacidad especial: despliegue nativo en NPU Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado BFP8 verificado bit a bit.
- El tokenizador conserva la plantilla de chat del modelo base, pero el modelo no está entrenado para seguirla.

## Casos de uso

- Despliegue en hardware Tenstorrent: ejecutar inferencia de un LLM de 4B en NPU Wormhole o Blackhole usando TT-NN, aprovechando el empaquetado BFP8 directo sin conversión en tiempo de carga.
- Investigación en cuantización block floating point: usar el checkpoint y `verify_grid.py` para estudiar el impacto de BFP8 frente a BF16 y Q4_K_M en la fidelidad de las matrices.
- Prototipado en simulador: validar pipelines con ttsim (simulador Blackhole) antes de disponer de hardware físico, como hizo el autor con ttnn 0.81.1.
- Generación de texto en dominios de inglés y coreano: la calibración cubre ambos idiomas, lo que lo hace adecuado para tareas de continuación de texto en esos idiomas.
- Base para fine-tuning posterior: al ser un modelo base con licencia Apache 2.0, puede servir de punto de partida para ajustes específicos de dominio antes de reempaquetar a BFP8.
- Evaluación comparativa de formatos: comparar esta exportación con la versión BFP4 del mismo autor para medir el compromiso entre memoria (4,64 GB frente a menos) y fidelidad respecto a BF16.
- Docencia y experimentación con hardware alternativo: ilustrar el flujo completo de cuantización GPTQ sobre una rejilla de punto flotante por bloques y su verificación.

## Benchmarks y rendimiento

Los datos publicados miden la fidelidad respecto a BF16, no la calidad en tareas. No se reportan cifras de velocidad.

| Modelo | Bits por peso | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen3-4B-Base) | 16 | 8,04 | 0 | 100 | 28 de 28 | - |
| Este modelo (BFP8) | 9,23 | 4,639 | 0,00126 | 98,34 | 28 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,96 | 2,497 | 0,04793 | 89,65 | 28 de 28 | 0 |

La KL y el top-1 se calculan sobre 8.184 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano). Las respuestas corresponden a 28 prompts cortos con comprobación automática, en formato de completado y con 3 ejemplos. El umbral declarado por el autor exige una KL media de como máximo 1,5 veces la de Q4_K_M y como máximo una respuesta perdida adicional; este modelo cumple con 0,03 veces la KL de Q4_K_M y 0 respuestas perdidas.

## Requisitos de hardware

- VRAM/memoria de dispositivo estimada: unos 4,64 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent (Wormhole, Blackhole). No está pensado para GPU convencional.
- GPU de consumo: no aplica; para GPUs se usaría el modelo base BF16 o una cuantización GGUF estándar.
- Alternativa en dispositivos con menos memoria: la versión BFP4 del mismo autor (Xylolabs/Qwen3-4B-Base-Tensix-BFP4).
- Opciones de despliegue: TT-NN (ttnn 0.81.1 verificado sobre ttsim). tt-transformers y tt-forge no se probaron con este checkpoint.
- Latencia y throughput: no disponibles; la model card indica explícitamente que no se reportan cifras de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BFP8) | 4,41 B | no disponible | safetensors + BFP8 para Tensix | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B-Base (BF16) | 4,41 B | no disponible | safetensors bf16 | Apache 2.0 | Hugging Face |
| Xylolabs/Qwen3-4B-Base-Tensix-BFP4 | 4,41 B | no disponible | safetensors + BFP4 para Tensix | Apache 2.0 | Hugging Face |
| Q4_K_M (llama.cpp) | 4,41 B | no disponible | GGUF | Apache 2.0 | Generado por el autor |

La comparación relevante es de fidelidad y memoria: BFP8 retiene un top-1 del 98,34 % frente a BF16 con 4,64 GB, mientras que Q4_K_M ocupa 2,50 GB con un top-1 del 89,65 %. No hay datos de rendimiento en tareas que permitan comparar calidad real de generación.

## Limitaciones y advertencias

- Es un modelo base, no ajustado a instrucciones: no sigue instrucciones ni mantiene diálogos de forma fiable.
- No se han evaluado sesgos; el modelo hereda los del Qwen3-4B-Base original, no documentados en esta información.
- Riesgo de alucinación propio de un modelo base de 4B; sin datos específicos publicados.
- Idiomas soportados no documentados; la calibración solo cubre inglés y coreano.
- Longitud de contexto no disponible en la información proporcionada.
- Dependencia de hardware: requiere NPU Tensix; el flujo en GPU convencional no es el objetivo del artefacto.
- tt-transformers y tt-forge no se probaron con este checkpoint; la validación se hizo sobre simulador (ttsim), no sobre silicio físico según la model card.
- La licencia Apache 2.0 permite uso comercial, pero el autor declara el software "as is", sin garantía, y no está afiliado ni respaldado por Tenstorrent.
- Las métricas publicadas miden fidelidad a BF16, no calidad en tareas; no deben interpretarse como rendimiento de generación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-Base-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Versión BFP4: https://huggingface.co/Xylolabs/Qwen3-4B-Base-Tensix-BFP4
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Qwen3 Technical Report: https://arxiv.org/abs/2505.09388
