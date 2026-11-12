# Xylolabs/Qwen2.5-14B-Tensix-BFP4-GateUp

## Resumen

Xylolabs/Qwen2.5-14B-Tensix-BFP4-GateUp es una cuantizacion del modelo Qwen2.5-14B de Alibaba Qwen, publicada por Xylolabs y optimizada especificamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo, sino de un checkpoint derivado en el que las capas lineales del transformer original se han reempaquetado en los formatos de bloque flotante propios de TT-NN: `bfloat4_b` (BFP4) para las proyecciones gate y up del MLP, y `bfloat8_b` (BFP8) para atención y down_proj.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-14B, con 14.770.033.664 parametros totales y 48 capas. La quantizacion resultante promedia 7,45 bits por peso y ocupa 13,76 GB empaquetados, frente a los 29,54 GB del checkpoint BF16 original. Los tensores de embedding, LM head, normas y el resto de componentes permanecen en bf16, de modo que los ficheros safetensors son bf16 pero cada valor ya esta alineado a la rejilla BFP correspondiente, permitiendo que TT-NN los empaquete sin transformacion adicional.

Su relevancia es doble: por un lado, demuestra una via practica para llevar modelos de 14B a hardware de aceleracion no-GPU con perdida de calidad medida y acotada; por otro, publica una metodologia de evaluacion basada en KL y top-1 contra BF16 que permite comparar la fidelidad de la quantizacion con alternativas como Q4_K_M de llama.cpp. Es un checkpoint de continuacion de texto (no instruction-tuned) y esta pensado para despliegue en Tensix, no como sustituto general del modelo base en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), 48 capas |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-14B) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`) en MLP gate/up, BFP8 (`ttnn.bfloat8_b`) en atención q/k/v/o y MLP down; resto en bf16. Media de 7,45 bits por peso |
| Idiomas soportados | en (segun model card); calibracion con WikiText-2 y Wikipedia en coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores alineados a rejilla BFP) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-14B: un transformer decoder-only con atención multi-cabeza, RoPE y las innovaciones del bloque Qwen2 (RMSNorm, SwiGLU, QKV bias). Sobre ese modelo base, Xylolabs aplica un proceso de quantizacion post-entrenamiento especifico para el formato de bloque flotante de Tenstorrent. Las proyecciones gate y up del MLP (48 capas) se cuantizan a `bfloat4_b` mediante GPTQ con busqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las proyecciones de atención (q, k, v, o) y down_proj del MLP se cuantizan a `bfloat8_b` mediante redondeo al vecino mas cercano (round to nearest). Embedding, LM head, normas y tensores auxiliares permanecen en bf16.

No hay entrenamiento adicional ni fine-tuning: es una quantizacion post-entrenamiento. La innovacion tecnica principal es el empaquetado nativo en la rejilla BFP de TT-NN, que permite que el hardware Tensix consuma los pesos directamente sin conversion en tiempo de carga. El autor incluye scripts de verificacion (`pack_tensix.py`, `verify_grid.py`) que comprueban que ningun valor cambia al empaquetar en `ttnn.bfloat4_b` o `ttnn.bfloat8_b`, y que el mismo tensor tambien empaqueta exactamente en BFP8. Las pruebas se realizaron con ttnn 0.81.1 sobre ttsim (simulador de Blackhole), no sobre hardware fisico, y tt-transformers y tt-forge no se ejecutaron con este checkpoint.

## Capacidades

- Generacion de texto por continuacion (modelo preentrenado, no instruction-tuned); no sigue instrucciones de forma nativa.
- Razonamiento y conocimiento general heredados de Qwen2.5-14B en su version base.
- Generacion de codigo y matematicas en la medida en que lo soporta el checkpoint base sin ajuste instruccional.
- Capacidades multilingues limitadas por la model card a `en`; la calibracion incluyo texto coreano, pero el autor no declara soporte oficial de otros idiomas.
- No se documenta soporte de tool calling ni function calling en esta ficha.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta vision, audio ni modo thinking.
- Compatible con el tokenizer y la plantilla de chat del modelo base, aunque el modelo no esta ajustado para conversacion.

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole o Blackhole: el checkpoint esta empaquetado para que TT-NN lo cargue directamente en DRAM del dispositivo, reduciendo el peso de 29,54 GB a 13,76 GB y permitiendo servir Qwen2.5-14B en aceleradores no-GPU.
- Investigacion en quantizacion de bloque flotante: sirve como referencia reproducible para estudiar el impacto de BFP4 con GPTQ y busqueda de exponente por bloque frente a esquemas como Q4_K_M, usando las metricas de KL y top-1 publicadas.
- Continuacion de texto a gran escala en entornos con memoria limitada: al ocupar 13,76 GB empaquetados, cabe en dispositivos con DRAM moderada donde el BF16 no entra.
- Generacion de texto en pipelines de evaluacion comparativa: util para medir fidelidad de quantizaciones contra BF16 en tareas de continuacion con prompts cortos y few-shot.
- Base para fine-tuning posterior sobre Tensix: al conservar embedding, LM head y normas en bf16, permite adaptar el modelo a dominios concretos manteniendo el resto del cuerpo en BFP.
- Validacion de toolchains TT-NN: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar la integridad del empaquetado en pipelines de CI para hardware Tenstorrent.
- Prototipado de inferencia en simulador: al haberse probado en ttsim, sirve para desarrollar y depurar kernels TT-NN antes de disponer de hardware fisico.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen2.5-14B) | 16 | 29,54 | 0 | 100 | 27 de 28 | - |
| Este modelo | 7,45 | 13,756 | 0,08835 | 91,50 | 26 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,87 | 8,988 | 0,07985 | 91,31 | 26 de 28 | 0 |

Las metricas de KL y top-1 cubren 8.184 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano) como texto plano. Las respuestas corresponden a 28 prompts cortos con comprobacion automatica, en formato de continuacion y 3-shot. "Perdidas" indica respuestas correctas en BF16 pero incorrectas o rotas en el modelo evaluado. El Q4_K_M se genero desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. El autor fija como criterio de aceptacion un KL medio como maximo 1,5 veces el de Q4_K_M y como maximo una respuesta perdida adicional; el modelo cumple con 1,11 veces el KL de Q4_K_M y 0 perdidas frente a 0. No se midio velocidad en dispositivo.

## Requisitos de hardware

- VRAM/DRAM estimada para inferencia: 13,76 GB empaquetados en BFP (frente a 29,54 GB en BF16). El repo ocupa 29,5 GB porque los ficheros safetensors se almacenan en bf16.
- GPU recomendadas: no aplica de forma nativa; el checkpoint esta pensado para NPU Tensix de Tenstorrent (Wormhole, Blackhole). En GPU solo tendria sentido cargandolo como bf16, con el coste de memoria del modelo base.
- Cabe en consumer GPU: no de forma nativa en el formato BFP; como bf16 requeriria GPUs de 24 GB o mas con offload, o 32 GB o mas para comodidad.
- Opciones de despliegue: TT-NN (ttnn 0.81.1 probado en ttsim), con scripts `pack_tensix.py` y `verify_grid.py`. tt-transformers y tt-forge no se probaron con este checkpoint. Compatible con transformers (`AutoModelForCausalLM`) cargando en bf16.
- Latencia y throughput: no disponibles; el autor no midio velocidad en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits por peso | Tamano | Licencia | Plataforma |
|---|---|---|---|---|---|---|
| Xylolabs/Qwen2.5-14B-Tensix-BFP4-GateUp | 14,77B | no disponible | 7,45 | 13,76 GB | Apache 2.0 | Tensix (TT-NN) |
| Qwen/Qwen2.5-14B (BF16) | 14,77B | no disponible | 16 | 29,54 GB | Apache 2.0 | GPU/CPU |
| Qwen2.5-14B Q4_K_M (llama.cpp) | 14,77B | no disponible | 4,87 | 8,988 GB | Apache 2.0 | CPU/GPU (llama.cpp) |

La comparativa se limita a variantes del mismo modelo base porque la ficha no aporta datos de modelos de otros autores. Frente a Q4_K_M, este checkpoint usa mas bits (7,45 frente a 4,87) y ocupa mas espacio (13,76 frente a 8,99 GB), con un KL ligeramente superior (0,08835 frente a 0,07985) pero un top-1 marginalmente mejor (91,50 frente a 91,31). Su ventaja no es la compresion absoluta sino el empaquetado nativo para Tensix.

## Limitaciones y advertencias

- No es un modelo instruction-tuned: solo continua texto; no sigue instrucciones ni mantiene conversaciones de forma fiable sin ajuste adicional.
- La model card declara unicamente ingles como idioma soportado, aunque la calibracion incluyo coreano; el rendimiento en otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente al modelo base Qwen2.5-14B; la quantizacion anade una degradacion medida (KL 0,08835 frente a BF16) que puede amplificarse en tareas sensibles.
- No se probo en hardware Tensix fisico: las pruebas se hicieron en ttsim (simulador de Blackhole). El comportamiento real en Wormhole o Blackhole no esta verificado por el autor.
- tt-transformers y tt-forge no se ejecutaron con este checkpoint; el soporte en esos stacks no esta confirmado.
- No se midio latencia ni throughput en dispositivo; no hay datos de rendimiento en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el autor declara el modelo "as is", sin garantia, y no esta afiliado ni respaldado por Tenstorrent.
- El checkpoint depende del ecosistema TT-NN: fuera de Tensix pierde su ventaja de empaquetado y se comporta como un bf16 de 29,54 GB.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-14B-Tensix-BFP4-GateUp
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B
- Codigo de quantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper de Qwen2.5: https://arxiv.org/abs/2407.10671
- Blog de Qwen2.5: https://qwenlm.github.io
- Licencia: https://huggingface.co/Xylolabs/Qwen2.5-14B-Tensix-BFP4-GateUp/blob/main/LICENSE
