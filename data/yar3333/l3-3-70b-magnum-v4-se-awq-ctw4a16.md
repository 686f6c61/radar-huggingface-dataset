# yar3333/L3.3-70B-Magnum-v4-SE-AWQ-CTW4A16

## Resumen

L3.3-70B-Magnum-v4-SE-AWQ-CTW4A16 es una cuantizacion INT4 auto-producida del modelo Doctor-Shotgun/L3.3-70B-Magnum-v4-SE, un fine-tune orientado a roleplay sobre Llama 3.3 70B. El autor, yar3333, la genero porque no existia ninguna cuantizacion AWQ o GPTQ lista para usar de Magnum 70B en Hugging Face (solo habia GGUF, FP8, EXL2 y NVFP4). El objetivo concreto era poder ejecutar el modelo en vLLM sobre GPUs AMD RDNA3 (gfx1100), en concreto cuatro RX 7900 XTX.

El checkpoint usa el formato compressed-tensors pack-quantized W4A16: pesos int4 con group_size 128 y cuantizacion asimetrica, mientras que el `lm_head` y todos los embeddings se mantienen en bf16. El repositorio ocupa 39,8 GB repartidos en 5 shards y declara 70.553.706.496 parametros totales en safetensors. La licencia heredada es la Llama 3.3 Community License.

Su relevancia practica es doble: por un lado demuestra que un 70B en INT4 puede servir el contexto nativo completo de 128K en 96 GB de VRAM (4×24 GB), y por otro documenta un pipeline reproducible de cuantizacion con llm-compressor sobre hardware AMD, un terreno donde las recetas listas para usar escasean.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.3 70B), pesos cuantizados con compressed-tensors |
| Parametros totales | 70.553.706.496 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (128K, contexto nativo del modelo base) |
| Tipos de cuantizacion | INT4 W4A16, group_size 128, asimetrica; `lm_head` y embeddings en bf16 |
| Idiomas soportados | no disponible (el modelo base Llama 3.3 soporta oficialmente 8 idiomas, pero la model card no lo detalla) |
| Licencia | llama3.3 (Llama 3.3 Community License) |
| Formato de pesos | safetensors (compressed-tensors pack-quantized, 5 shards, 39,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.3 70B: un transformer decoder-only denso de 70B parametros. Sobre esa base, Doctor-Shotgun aplico un fine-tune orientado a roleplay (Magnum v4-SE). Esta ficha describe exclusivamente la cuantizacion, no el entrenamiento original del fine-tune, del que la informacion disponible no aporta detalles (tokens, composicion del dataset, RLHF/DPO: no disponible).

El proceso de cuantizacion se realizo con llm-compressor 0.14 combinando `AWQModifier(duo_scaling="both")` y `QuantizationModifier(scheme="W4A16_ASYM")`, con calibracion de 64 secuencias de 512 tokens extraidas de ultrachat_200k y partiendo de los pesos en bf16. Todo el pipeline (scripts, empaquetado reanudable, incidencias) se ejecuto en una maquina con 4×RX 7900 XTX. El resultado es un checkpoint pack-quantized que se carga en vLLM con `--quantization compressed-tensors`; en ROCm/gfx1100 requiere el backend de atencion `ROCM_SEGMENTED_ATTN`, mientras que en CUDA basta el backend por defecto.

## Capacidades

- Generacion de texto conversacional y narrativo, con enfasis en roleplay por el fine-tune del modelo base.
- Razonamiento y generacion de codigo heredados de Llama 3.3 70B (no verificados de forma especifica en esta cuantizacion).
- Contexto largo: hasta 131.072 tokens, verificado en carga y comprobado por capacidad hasta el maximo nativo.
- Capacidades multilingues: no documentadas en la model card; dependen del modelo base.
- Tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Roleplay y narrativa interactiva: el fine-tune Magnum v4-SE esta orientado a este escenario, y la cuantizacion INT4 permite servirlo en vLLM con contexto de hasta 128K tokens, suficiente para mantener historiales de conversacion muy largos sin truncar.
- Despliegue en hardware AMD consumer: con 4×RX 7900 XTX (96 GB) se obtiene el modelo completo con contexto nativo, un escenario que con el formato AWQ clasico via Triton rendia unos 9 tok/s frente a los ~50 tok/s de este checkpoint.
- Servicio de chat con prompts largos: el prefill medido de 401,5 tok/s y un TTFT de 6,71 s para 2.695 tokens de entrada lo hacen viable para conversaciones con documentos o contexto extenso adjunto.
- Prototipado e investigacion sobre cuantizacion: el repositorio documenta el pipeline completo con llm-compressor, util como referencia reproducible para cuantizar otros modelos 70B en W4A16 asimetrico.
- Evaluacion de modelos de roleplay en local: al caber en 4 GPUs de 24 GB, permite experimentar con un 70B fine-tuneado sin depender de APIs externas.
- Generacion de texto por lotes con contexto largo: con `--max-num-seqs 1` y 50 tok/s de generacion sostenida, encaja en tareas de sintesis de documentos largos donde prima la calidad sobre el throughput agregado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento son mediciones de inferencia del autor:

| Metrica | Valor |
|---|---|
| Entorno verificado | vLLM 0.32.0+rocm723, 4×RX 7900 XTX, TP=4 |
| max-model-len verificado | 16.384 (capacidad comprobada hasta 131.072) |
| TTFT, prompt corto (44 tok) | 2,07 s |
| Generacion, prompt corto | 50,9 tok/s |
| TTFT, prompt largo (2.695 tok) | 6,71 s |
| Prefill, prompt largo | 401,5 tok/s |
| Generacion, prompt largo | 50,1 tok/s |
| Presupuesto KV | ~12 GiB/GPU (~80 KiB/token/GPU) |

## Requisitos de hardware

- VRAM para inferencia: el checkpoint ocupa 39,8 GB en disco; con KV cache de ~12 GiB por GPU, el autor verifica el contexto completo de 128K en 96 GB totales (4×24 GB).
- GPUs recomendadas: 4×RX 7900 XTX (configuracion verificada, TP=4); en CUDA se puede usar el backend de atencion por defecto, aunque no hay verificacion publicada con GPUs NVIDIA concretas.
- GPU consumer: si, en 4×RX 7900 XTX. No cabe en una unica GPU consumer de 24 GB con contexto largo.
- Opciones de despliegue: vLLM >= 0.32 con `--quantization compressed-tensors` (unico motor verificado). Otros motores no estan documentados para este formato.
- Latencia y throughput: TTFT 2,07 s (44 tok) y 6,71 s (2.695 tok); generacion ~50 tok/s; prefill 401,5 tok/s. Como referencia, el AWQ clasico via Triton en la misma maquina rendia ~9 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| yar3333/L3.3-70B-Magnum-v4-SE-AWQ-CTW4A16 | 70,5B | 131.072 | compressed-tensors W4A16 | llama3.3 | Verificado en vLLM/ROCm, ~50 tok/s |
| Doctor-Shotgun/L3.3-70B-Magnum-v4-SE | 70B (no confirmado en la informacion) | no disponible | bf16 | llama3.3 (heredada) | Modelo base sin cuantizar |
| Cuantizaciones GGUF/FP8/EXL2/NVFP4 de Magnum 70B | no disponible | no disponible | GGUF, FP8, EXL2, NVFP4 | no disponible | Mencionadas por el autor como alternativas existentes en HF |

## Limitaciones y advertencias

- La cuantizacion INT4 puede degradar la calidad respecto al modelo en bf16; el autor no publica evaluaciones comparativas de calidad.
- El fine-tune esta orientado a roleplay, por lo que su comportamiento en tareas factuales o de codigo puede diferir del Llama 3.3 original.
- Riesgo de alucinacion inherente a los modelos generativos de 70B; no hay evaluaciones de fidelidad en la informacion disponible.
- Solo hay verificacion de despliegue en vLLM sobre ROCm/gfx1100; en CUDA el backend por defecto deberia funcionar, pero no esta verificado publicamente.
- La configuracion verificada usa `--max-num-seqs 1`, lo que limita el throughput concurrente.
- La licencia Llama 3.3 Community License impone restricciones de uso comercial y requiere cumplir sus terminos (incluida la politica de uso aceptable de Meta); conviene revisarla antes de produccion.
- La model card no documenta idiomas soportados, tool calling ni capacidades de agente; no deben asumirse.

## Enlaces

- Hugging Face: https://huggingface.co/yar3333/L3.3-70B-Magnum-v4-SE-AWQ-CTW4A16
- Modelo base (referenciado en la model card): https://huggingface.co/Doctor-Shotgun/L3.3-70B-Magnum-v4-SE
- Modelo base indicado en los metadatos: https://huggingface.co/DS-Archive/L3.3-70B-Magnum-v4-SE
- Licencia Llama 3.3: https://www.llama.com/llama3_3/license/
- llm-compressor: https://github.com/vllm-project/llm-compressor
- vLLM: https://github.com/vllm-project/vllm
