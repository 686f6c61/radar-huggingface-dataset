# Xylolabs/Qwen2.5-14B-Instruct-Tensix-BFP4-Down8

## Resumen

Xylolabs/Qwen2.5-14B-Instruct-Tensix-BFP4-Down8 es una cuantización del modelo Qwen2.5-14B-Instruct de Alibaba Qwen, publicada por Xylolabs y orientada específicamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura transformer decoder-only del original (14.770.033.664 parámetros) y sustituye las capas lineales por formatos de coma flotante por bloques propios del stack TT-NN: `ttnn.bfloat4_b` (BFP4) para las proyecciones de atención y las proyecciones gate/up del MLP, y `ttnn.bfloat8_b` (BFP8) para la proyección down del MLP.

El interés principal es de despliegue en hardware: el checkpoint empaquetado ocupa 12,25 GB de memoria de dispositivo para los pesos del modelo de lenguaje, frente a los 29,54 GB del BF16 original, con un promedio de 6,63 bits por peso. Esto permite ejecutar un modelo de 14B en aceleradores Tensix con un presupuesto de memoria notablemente menor, manteniendo los pesos cuantizados almacenados como valores bf16 sobre la rejilla BFP, de modo que TT-NN los empaqueta sin alterar sus valores.

La relevancia es doble: por un lado, es un ejemplo de cuantización consciente del formato de hardware (BFP4/BFP8) en lugar de los habituales GGUF/AWQ/GPTQ para GPU; por otro, incluye una evaluación de fidelidad respecto a BF16 (KL y top-1) frente a una referencia Q4_K_M de llama.cpp. La licencia es Apache 2.0, igual que el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), capas lineales cuantizadas a formatos BFP de TT-NN |
| Parámetros totales | 14.770.033.664 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen2.5-14B-Instruct; no se especifica en la model card) |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en atención q/k/v/o y MLP gate/up; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en MLP down; bf16 en LM head, embeddings y norms; media de 6,63 bits/peso |
| Idiomas soportados | en (según la model card; el modelo base Qwen2.5 es multilingüe, pero esta ficha declara solo inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (más `quant4.json` con el formato por proyección y `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-14B-Instruct: un transformer decoder-only denso de 48 capas con atención multi-cabeza con RoPE, MLP con activación SwiGLU y pesos en bf16. Sobre esa base, Xylolabs aplica un proceso de cuantización por bloques adaptado al formato nativo de TT-NN. Las proyecciones q, k, v, o y gate/up del MLP se cuantizan a `bfloat4_b` mediante GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. La proyección down del MLP se cuantiza a `bfloat8_b` con redondeo al más cercano (round to nearest). El LM head, los embeddings, las normas y el resto de tensores permanecen en bf16.

La innovación técnica clave es que las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP4 o BFP8, de forma que el empaquetado en TT-NN no modifica sus valores; el repositorio incluye scripts (`pack_tensix.py`, `verify_grid.py`) para verificar el round-trip exacto de cada matriz, tanto en torch como a través de DRAM del dispositivo. La verificación se realizó con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent. No se detalla la composición completa del dataset de entrenamiento original ni si hubo RLHF/DPO en esta exportación (se hereda del modelo base Qwen2.5-14B-Instruct, que no se describe en la model card).

## Capacidades

- Generación de texto conversacional y de instrucciones, heredadas de Qwen2.5-14B-Instruct.
- Razonamiento, matemáticas y generación de código, según las capacidades del modelo base (no se documentan evaluaciones específicas en esta ficha).
- Formato de chat mediante `apply_chat_template` con roles system/user/assistant.
- Inferencia en hardware Tensix (Wormhole, Blackhole) a través de TT-NN, con empaquetado directo de pesos BFP4/BFP8.
- Ejecución también en transformers estándar con `dtype="bfloat16"` y `device_map="auto"`.
- Capacidades multilingües del modelo base no declaradas explícitamente; la model card solo lista inglés.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en esta exportación.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint está pensado para cargarse en NPU Wormhole o Blackhole mediante TT-NN, aprovechando el empaquetado nativo de BFP4/BFP8 y reduciendo el peso en memoria de dispositivo a 12,25 GB.
- Servicio de chat con presupuesto de memoria ajustado: al ocupar 12,25 GB los pesos, queda margen para KV cache y buffers en tarjetas con memoria limitada, lo que permite servir un modelo de 14B en un único acelerador Tensix.
- Validación de pipelines de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar que cada matriz se empaqueta sin pérdida de valores, útil para equipos que integran cuantización BFP en sus propias herramientas.
- Investigación en cuantización por bloques: la comparación publicada frente a Q4_K_M (KL media de 0,13698 frente a 0,0923; top-1 de 88,59 % frente a 90,34 %) sirve como referencia para estudiar el compromiso entre formato de hardware y fidelidad al modelo BF16.
- Evaluación de fidelidad en inglés y coreano: el conjunto de evaluación cubre 16.104 posiciones de WikiText-2 test y Wikipedia en coreano, tanto en texto plano como con plantilla de chat, útil para medir degradación multilingüe.
- Prototipado en simulador: la verificación con ttsim (simulador de Blackhole) permite desarrollar y depurar integraciones TT-NN sin disponer de hardware físico.
- Generación de texto general en transformers: el quickstart con `AutoModelForCausalLM` permite usar el checkpoint en entornos estándar con GPUs convencionales, aunque sin la ventaja de memoria del empaquetado BFP.

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamaño (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen2.5-14B-Instruct) | 16 | 29,54 | 0 | 100 | 31 de 33 | - |
| Este modelo (BFP4 Down8) | 6,63 | 12,246 | 0,13698 | 88,59 | 32 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,87 | 8,988 | 0,0923 | 90,34 | 31 de 33 | 1 |

KL y top-1 se calculan sobre 16.104 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con plantilla de chat. Las 33 respuestas son prompts cortos con comprobación automática; "perdidas" indica respuestas correctas en BF16 pero incorrectas o rotas en el modelo cuantizado (los empates cercanos no se cuentan). Q4_K_M se generó del mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. El criterio de aceptación de Xylolabs era una KL media como máximo 1,5 veces la de Q4_K_M y como máximo una respuesta perdida más; el resultado es 1,48 veces la KL de Q4_K_M y 0 respuestas perdidas frente a 1. Estos números miden cercanía a BF16, no calidad de tarea; no se reporta velocidad.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 12,25 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole.
- Verificación realizada con ttnn 0.81.1 sobre ttsim (simulador de Blackhole); no se probó en hardware físico según la model card.
- Ejecución alternativa en GPUs convencionales mediante transformers con `dtype="bfloat16"` y `device_map="auto"`; el tamaño del repo es de 29,5 GB.
- Opciones de despliegue: TT-NN (tt-metal) para Tensix; transformers para GPU/CPU. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles; la model card indica explícitamente que no se reporta velocidad.
- tt-transformers y tt-forge no se ejecutaron con este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Bits/peso | Tamaño (GB) | Contexto | Licencia | Hardware objetivo |
|---|---|---:|---:|---|---|---|
| Este modelo (BFP4 Down8) | 14,77 B | 6,63 | 12,246 | no disponible | Apache 2.0 | Tensix (Wormhole, Blackhole) |
| Qwen2.5-14B-Instruct BF16 | 14,77 B | 16 | 29,54 | no disponible | Apache 2.0 | GPU/CPU genéricos |
| Q4_K_M (llama.cpp, mismo checkpoint) | 14,77 B | 4,87 | 8,988 | no disponible | Apache 2.0 | CPU/GPU con llama.cpp |

La comparación con Q4_K_M es la más directa porque procede del mismo checkpoint y se evaluó con la misma metodología. Q4_K_M ocupa menos memoria (8,988 GB frente a 12,246 GB) y obtiene mejor KL (0,0923 frente a 0,13698) y top-1 (90,34 % frente a 88,59 %), pero pierde una respuesta de 33 frente a ninguna del modelo BFP. La ventaja del modelo BFP4/BFP8 es el empaquetado nativo en TT-NN para hardware Tensix, no la eficiencia de compresión.

## Limitaciones y advertencias

- La model card declara únicamente inglés como idioma soportado, aunque el modelo base es multilingüe; el comportamiento en otros idiomas no está garantizado por esta exportación.
- Los benchmarks publicados miden fidelidad a BF16 (KL y top-1), no calidad de tarea; no hay evaluaciones de MMLU, HumanEval, GSM8K ni similares en la información disponible.
- No se reportan latencia ni throughput; el rendimiento real en hardware Tensix físico no está validado (solo en simulador ttsim).
- tt-transformers y tt-forge no se probaron con este checkpoint, por lo que la integración con esos stacks no está verificada.
- El checkpoint está diseñado para TT-NN; usarlo en transformers estándar no aprovecha el empaquetado BFP y requiere cargar los pesos en bf16.
- No se documenta soporte de tool calling, agentes, visión ni audio en esta exportación.
- Riesgo de alucinación y sesgos heredados del modelo base Qwen2.5-14B-Instruct, no evaluados en esta ficha.
- Licencia Apache 2.0 permite uso comercial, pero se distribuye "as is", sin garantía; Xylolabs no está afiliado ni respaldado por Tenstorrent.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-Tensix-BFP4-Down8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Licencia: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-Tensix-BFP4-Down8/blob/main/LICENSE
