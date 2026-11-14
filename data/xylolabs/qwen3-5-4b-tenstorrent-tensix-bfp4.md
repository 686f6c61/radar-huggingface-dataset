# Xylolabs/Qwen3.5-4B-Tenstorrent-Tensix-BFP4

## Resumen

Qwen3.5-4B-Tenstorrent-Tensix-BFP4 es una exportación cuantizada del modelo multimodal Qwen/Qwen3.5-4B, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo mantiene la arquitectura original de Qwen3.5-4B, pero cuantiza las capas lineales a formato block-floating-point BFP4 (`ttnn.bfloat4_b`) mediante GPTQ, de forma que TT-NN puede empaquetarlas directamente sin alterar sus valores.

El checkpoint real contiene 5.295.564.288 parámetros en formato safetensors (el nombre "4B" del modelo base no refleja el total real, que incluye el bloque MTP y el codificador visual). Solo se ha cuantizado y evaluado el modelo de lenguaje; el bloque `mtp` y el módulo `visual` permanecen en bf16 sin cambios. El resultado son 3,28 GB empaquetados con una media de 6,24 bits por peso.

La relevancia de esta ficha radica en que es un ejemplo de cuantización hardware-aware para aceleradores no-GPU: no se distribuye como GGUF para llama.cpp, sino como pesos safetensors que se empaquetan directamente en memoria DRAM de la NPU Tensix. La licencia Apache-2.0 facilita su uso comercial, aunque el soporte de tooling (tt-transformers, tt-forge) es todavía incompleto para esta arquitectura.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de Qwen3.5 (atención + Gated DeltaNet), con bloque MTP y codificador visual; cuantización BFP4 de capas lineales |
| Parámetros totales | 5.295.564.288 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en capas lineales; bf16 en LM head, embeddings, norms y tensores `mtp`/`visual`; float32 en `linear_attn.A_log` y `linear_attn.norm.weight`; media de 6,24 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (empaquetables a `ttnn.bfloat4_b` y `ttnn.bfloat8_b`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida que combina capas de atención clásica con capas Gated DeltaNet (atención lineal con estado recurrente). En este checkpoint se distinguen 8 capas de atención (proyecciones q, k, v, o), 24 capas Gated DeltaNet (proyecciones q, k, v, z, a, b y output) y 32 capas MLP (gate, up, down), todas ellas cuantizadas a BFP4. El LM head está atado al embedding, y se conservan en bf16 tanto el embedding como las normas y el bloque MTP, además del codificador visual.

La cuantización se realizó con GPTQ y una búsqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. El proceso almacena las matrices cuantizadas como valores bf16 sobre la retícula BFP4, de modo que TT-NN las empaqueta sin modificar sus valores; el script `pack_tensix.py` verifica que ninguna matriz cambia tras el empaquetado y `verify_grid.py` valida la retícula solo con torch. No se dispone de información sobre el número de tokens de preentrenamiento del modelo base ni sobre si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto conversacional y razonamiento de propósito general, heredadas del modelo base Qwen3.5-4B.
- Procesamiento image-text-to-text: el pipeline declarado es `image-text-to-text` y el módulo `visual` se conserva en bf16, por lo que el checkpoint mantiene la capacidad multimodal del modelo original.
- Soporte de plantilla de chat (`apply_chat_template`) con roles de sistema, usuario y asistente.
- Bloque MTP (multi-token prediction) conservado en bf16, lo que permite decodificación especulativa si el runtime lo soporta.
- Capacidades multilingües: no disponibles en la información proporcionada (la calibración incluyó coreano, pero no se documentan los idiomas soportados).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en NPU Tenstorrent Blackhole: el checkpoint está pensado para ejecutarse en aceleradores Tensix mediante tt-metal y TT-NN, con un consumo de 3,28 GB de memoria de dispositivo solo para los pesos del modelo de lenguaje, más KV cache y buffers. Es adecuado cuando se quiere evitar depender de GPU NVIDIA.
- Inferencia de bajo consumo en Wormhole: al empaquetar los pesos en BFP4, el modelo cabe en configuraciones de memoria reducidas de las tarjetas Tensix, lo que permite servir un modelo de 5.295 millones de parámetros en hardware de borde con NPU dedicada.
- Prototipado multimodal en hardware alternativo: al conservar el módulo `visual` en bf16 y el pipeline `image-text-to-text`, sirve para validar flujos de imagen y texto sobre la pila tt-metal sin recurrir a CUDA.
- Evaluación de cuantización hardware-aware: investigadores que estudien el impacto de BFP4 frente a BF16 pueden usar este checkpoint junto con el BF16 original para medir divergencia KL (0,04447 de media) y acierto top-1 (89,58 %).
- Integración en pipelines de transformers: la quickstart con `AutoModelForCausalLM` y `AutoTokenizer` permite cargar el modelo en CPU/GPU con `dtype="bfloat16"` para pruebas funcionales antes de portarlo a la NPU.
- Investigación en decodificación especulativa: el bloque MTP conservado en bf16 permite experimentar con multi-token prediction sobre la arquitectura Qwen3.5, siempre que el runtime lo exponga.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la evaluación de cuantización del modelo de lenguaje, comparando con el BF16 original y con una cuantización Q4_K_M de llama.cpp:

| Modelo | Bits por peso | Tamaño (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3.5-4B) | 16 | 8,41 | 0 | 100 | 36 de 40 | - |
| **Este modelo (BFP4)** | 6,24 | 3,281 | 0,04447 | 89,58 | 33 de 40 | 1 |
| Q4_K_M (llama.cpp) | 5,13 | 2,783 | 0,03981 | 89,79 | 37 de 40 (dato truncado en la fuente) | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria de dispositivo: aproximadamente 3,28 GB para los pesos del modelo de lenguaje empaquetados en BFP4, más espacio para KV cache y buffers.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole. Verificado con ttnn 0.81.1 sobre el simulador ttsim (Blackhole).
- GPU consumer: el checkpoint puede cargarse en transformers con `dtype="bfloat16"` y `device_map="auto"`, pero no está optimizado para GPU; el formato de pesos es safetensors estándar, no GGUF.
- Despliegue: tt-metal (demo Qwen3.5/3.6 en la rama v0.81.1, con `MESH_DEVICE=P150`), TT-NN para empaquetado, y transformers para carga genérica. tt-forge (tt-xla) no se ha probado con este checkpoint. tt-transformers no soporta esta arquitectura.
- Latencia y throughput: no disponibles en la información proporcionada. Solo se ha construido y empaquetado las capas 0 a 3 en el demo de tt-metal; no se realizó una ejecución completa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Qwen3.5-4B-Tenstorrent-Tensix-BFP4** | 5.295.564.288 | no disponible | BFP4 (6,24 bits/peso), 3,28 GB | Apache-2.0 | Hugging Face, 70 descargas |
| Qwen/Qwen3.5-4B (BF16) | 5.295.564.288 (según checkpoint) | no disponible | BF16, 8,41 GB | Apache-2.0 | Hugging Face |
| Qwen3.5-4B Q4_K_M (llama.cpp) | no disponible | no disponible | Q4_K_M (5,13 bits/peso), 2,783 GB | Apache-2.0 (derivada) | Distribución comunitaria vía llama.cpp |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de rendimiento frente a otros modelos de tamaño similar. La diferencia clave es el destino de hardware: BFP4 para NPU Tensix frente a BF16 para GPU/CPU y Q4_K_M para CPU/GPU vía llama.cpp.

## Limitaciones y advertencias

- Solo se ha cuantizado y evaluado el modelo de lenguaje; el bloque `mtp` y el módulo `visual` no han sido evaluados tras la conversión.
- El demo de tt-metal solo construyó las capas 0 a 3 del checkpoint; no se ha probado una ejecución completa en hardware Tensix.
- tt-transformers no soporta esta arquitectura y tt-forge (tt-xla) no se ha probado con este checkpoint.
- El LM head y el bloque MTP se recuantizan a bfloat8_b/bfloat4_b en el demo de tt-metal, lo que introduce una divergencia adicional respecto al checkpoint publicado.
- La cuantización BFP4 produce una divergencia medible frente a BF16: KL medio de 0,04447 y 33 de 40 respuestas correctas frente a 36 de 40 en BF16, con una respuesta perdida.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni idiomas soportados en la información proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-4B y sus condiciones deben verificarse por separado.
- El nombre "4B" del modelo base no coincide con los 5.295.564.288 parámetros reales del checkpoint, lo que puede inducir a error al dimensionar hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-4B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Demo Qwen3.5/3.6 en tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/blackhole/qwen36
- Licencia: https://huggingface.co/Xylolabs/Qwen3.5-4B-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
