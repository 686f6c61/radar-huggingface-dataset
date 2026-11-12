# Xylolabs/Qwen2.5-14B-Tensix-BFP8

## Resumen

Xylolabs/Qwen2.5-14B-Tensix-BFP8 es una versión cuantizada de Qwen/Qwen2.5-14B, el modelo de lenguaje de 14.770.033.664 parámetros desarrollado por el equipo Qwen de Alibaba. La particularidad de esta variante es que las capas lineales (proyecciones de atención q, k, v, o y las proyecciones MLP gate, up, down de las 48 capas del transformer) han sido cuantizadas a `ttnn.bfloat8_b` (BFP8, block floating point de 8 bits) mediante GPTQ, mientras que el resto de tensores (embeddings, LM head, normalizaciones) permanecen en bf16. El objetivo es producir pesos directamente consumibles por las NPU Tensix de Tenstorrent (Wormhole, Blackhole) a través de TT-NN, sin necesidad de repacking en tiempo de carga.

El modelo resuelve un problema de despliegue concreto: reducir el peso de 29,54 GB en BF16 a 17,154 GB empaquetados (9,29 bits por peso de media) manteniendo una fidelidad muy alta respecto al original, con una divergencia KL media de solo 0,00178 frente a BF16 y un 98,58 % de top-1 coincidente. Frente a una cuantización Q4_K_M de llama.cpp, la pérdida de fidelidad es aproximadamente 45 veces menor en términos de KL.

Es relevante ahora porque el ecosistema Tenstorrent está creciendo como alternativa de aceleración abierta y este checkpoint ofrece un formato nativo para su pila (`tt-metal`, `ttnn`, `tt-forge`). No obstante, conviene subrayar que el modelo se ha validado únicamente en el simulador `ttsim` de Blackhole con ttnn 0.81.1, no en hardware real, y que es el modelo preentrenado, no la variante instruction-tuned.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), 48 capas |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-14B) |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`) en capas lineales; bf16 en embeddings, LM head y normas; media de 9,29 bits por peso |
| Idiomas soportados | en (segun metadatos; el calibrado uso WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores ya en la rejilla BFP8), 17,154 GB empaquetados; repo de 29,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-14B: un transformer decoder-only denso de 48 capas con atención de múltiples cabezas y proyecciones MLP tipo SwiGLU. Esta variante no modifica la topología; solo cambia la representación numérica de los pesos. Las matrices de atención (q, k, v, o) y de MLP (gate, up, down) se cuantizan a `bfloat8_b`, un formato de bloque con exponente compartido por bloque que TT-NN empaqueta directamente. El resto de tensores se mantienen en bf16 idénticos al modelo base.

La cuantización se realizó con GPTQ sobre la rejilla bfloat8_b, preservando el exponente compartido de cada bloque tal como lo fija el empaquetador de TT-NN. La calibración empleó 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Los archivos resultantes son bf16, pero cada valor ya está en la rejilla BFP8, de modo que el empaquetado en TT-NN no altera ningún valor (el script `pack_tensix.py` lo verifica matriz a matriz). No se ha ejecutado `tt-transformers` ni `tt-forge` con este checkpoint, y las pruebas se hicieron sobre `ttsim`, el simulador de Blackhole, no sobre silicio.

## Capacidades

- Generación de texto autoregresiva en modo continuación (modelo preentrenado, sin ajuste por instrucciones).
- Razonamiento y conocimiento general heredados de Qwen2.5-14B (no evaluados de forma específica en esta ficha).
- Capacidad multilingüe del modelo base, aunque los metadatos declaran solo `en` y el calibrado incluyó coreano.
- No se documenta soporte de tool calling, function calling ni modo agente en la información disponible; al ser el checkpoint preentrenado, estas capacidades dependerían de un ajuste posterior.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking).
- El tokenizer conserva la plantilla de chat del modelo base, pero el modelo no está instruction-tuned.

## Casos de uso

- Despliegue en NPU Tenstorrent: el caso principal. Los pesos se cargan directamente en TT-NN sobre Wormhole o Blackhole sin repacking, lo que reduce el tiempo de arranque y el uso de DRAM del dispositivo (17,154 GB empaquetados frente a 29,54 GB en BF16).
- Investigación en cuantización de bloque: sirve como referencia reproducible de GPTQ sobre la rejilla bfloat8_b, con scripts de verificación (`pack_tensix.py`, `verify_grid.py`) para validar que ningún valor se altera al empaquetar.
- Generación de texto en bruto: continuación de documentos, completado de código o texto libre en pipelines donde no se requiere seguimiento de instrucciones.
- Evaluación de fidelidad de cuantizaciones: el modelo incluye métricas de KL y top-1 frente a BF16 y frente a Q4_K_M, útil como baseline para comparar otras técnicas de compresión.
- Prototipado en simulador: al haberse validado en `ttsim`, permite desarrollar y depurar kernels o pipelines para Tensix antes de disponer de hardware.
- Fine-tuning posterior: al ser un checkpoint preentrenado con licencia Apache 2.0, puede servir de base para ajuste supervisado o DPO orientado a instrucciones.
- Serving con TGI: los tags incluyen `text-generation-inference` y `endpoints_compatible`, por lo que puede desplegarse en infraestructura estándar de Hugging Face si se acepta el formato bf16/BFP8.

## Benchmarks y rendimiento

Los datos publicados miden fidelidad respecto a BF16, no calidad de tarea.

| Modelo | Bits por peso | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen2.5-14B) | 16 | 29,54 | 0 | 100 | 27 de 28 | - |
| Este modelo (BFP8) | 9,29 | 17,154 | 0,00178 | 98,58 | 27 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,87 | 8,988 | 0,07985 | 91,31 | 26 de 28 | 0 |

Las métricas de KL y top-1 cubren 8.184 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano). Las respuestas corresponden a 28 prompts cortos con comprobación automática, en formato de completado y con 3 ejemplos. El Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 sin importance matrix. No se midió velocidad en dispositivo.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: aproximadamente 17,2 GB para los pesos empaquetados en BFP8; en la práctica, cargar en transformers con `dtype="bfloat16"` requiere del orden de 30 GB más overhead de activaciones y caché KV.
- GPU recomendadas: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) puede alojar los pesos empaquetados pero el margen para contexto largo es ajustado.
- Cabe en GPU consumer de 24 GB solo con cuantización adicional o contextos cortos; no cabe en GPUs de 16 GB sin compresión extra.
- Despliegue: TT-NN sobre Tenstorrent Wormhole/Blackhole (objetivo principal), transformers, text-generation-inference; llama.cpp no consume directamente este formato BFP8.
- Latencia y throughput: no disponibles; no se midió velocidad en dispositivo y las pruebas se hicieron en simulador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen2.5-14B-Tensix-BFP8 | 14,77 B | no disponible | BFP8 (9,29 bits/peso) | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-14B | 14,77 B | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Qwen2.5-14B-Instruct | 14,77 B | no disponible | BF16 y GGUF | Apache 2.0 | Hugging Face |
| Q4_K_M del mismo checkpoint | 14,77 B | no disponible | 4,87 bits/peso | Apache 2.0 | generado localmente |

Frente a Qwen2.5-14B en BF16, esta variante reduce el tamaño un 42 % con una KL media de 0,00178. Frente a Q4_K_M, ocupa casi el doble pero conserva mucha más fidelidad (KL 45 veces menor, top-1 7,27 puntos superior). La diferencia clave es el destino: BFP8 está pensado para TT-NN, mientras que GGUF/Q4_K_M lo está para llama.cpp.

## Limitaciones y advertencias

- Es el modelo preentrenado, no instruction-tuned: no sigue instrucciones ni mantiene diálogos de forma fiable sin ajuste posterior.
- Validado solo en el simulador `ttsim` de Blackhole con ttnn 0.81.1; no se ha probado en hardware Tensix real.
- `tt-transformers` y `tt-forge` no se han ejecutado con este checkpoint.
- Los benchmarks miden fidelidad a BF16, no calidad de tarea; no hay datos de MMLU, HumanEval, GSM8K ni similares en esta ficha.
- El calibrado de GPTQ usó WikiText-2 y Wikipedia en coreano, lo que puede introducir sesgo hacia esos dominios.
- Los metadatos declaran solo inglés, aunque el modelo base es multilingüe; el rendimiento en otros idiomas no está verificado.
- Riesgo de alucinación inherente al modelo base, no mitigado por la cuantización.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara el modelo "as is", sin garantía, y no está afiliado ni respaldado por Tenstorrent.
- El formato BFP8 no es portable a otras pilas de inferencia sin conversión; no se puede usar directamente con llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-14B-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Paper de referencia (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
