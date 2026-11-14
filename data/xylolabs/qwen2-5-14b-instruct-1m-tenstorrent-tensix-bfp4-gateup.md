# Xylolabs/Qwen2.5-14B-Instruct-1M-Tenstorrent-Tensix-BFP4-GateUp

## Resumen

Este repositorio contiene una cuantización de Qwen2.5-14B-Instruct-1M, el modelo instructivo de 14.700 millones de parámetros desarrollado por Alibaba Qwen, adaptada específicamente para su ejecución en las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). La conversión la firma Xylolabs, que publica el checkpoint junto con el código de empaquetado `tensix-bfp-gptq`. El modelo base Qwen2.5-14B-Instruct-1M destaca por su ventana de contexto de un millón de tokens, lo que lo sitúa entre los modelos densos de tamaño medio con mayor alcance contextual del ecosistema abierto.

La particularidad de este checkpoint no es el modelo en sí, sino el formato: las capas lineales se han cuantizado a los tipos de bloque flotante nativos de TT-NN, `ttnn.bfloat4_b` (BFP4) y `ttnn.bfloat8_b` (BFP8), de modo que el hardware Tensix los empaqueta directamente sin conversión adicional. Las proyecciones MLP gate/up usan BFP4 con GPTQ, mientras que atención y MLP down usan BFP8 con redondeo al más cercano. El resultado son 7,45 bits por peso de media y 13,76 GB empaquetados, frente a los 29,54 GB del checkpoint BF16 original.

Es relevante ahora porque los modelos de contexto largo son caros de servir y las alternativas de aceleración heterogénea (más allá de GPU) empiezan a materializarse. Este export demuestra que es posible comprimir un modelo de 14B a menos de la mitad de su huella con una pérdida de fidelidad respecto a BF16 (KL medio de 0,0785) comparable a la de una cuantización GGUF Q4_K_M, pero conservando el formato nativo de una NPU concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 1.000.000 tokens (heredada de Qwen2.5-14B-Instruct-1M) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`) en MLP gate/up; BFP8 (`ttnn.bfloat8_b`) en atención q/k/v/o y MLP down; bf16 en embeddings, LM head y normas |
| Idiomas soportados | en (según la model card; el modelo base es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (almacenados como valores bf16 sobre la rejilla BFP4/BFP8) |
| Bits por peso (media) | 7,45 |
| Tamano empaquetado | 13,76 GB (pesos del modelo de lenguaje) |
| Memoria de dispositivo requerida | ~13,76 GB para pesos, más KV cache y buffers |
| Hardware objetivo | Tenstorrent Tensix (Wormhole, Blackhole) |
| Libreria | transformers, TT-NN (`ttnn`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-14B-Instruct-1M, un transformer decoder-only denso de 48 capas con atención completa estándar y RoPE, entrenado por Alibaba Qwen. Sobre él se aplicó un post-entrenamiento instructivo (SFT más optimización por preferencias, según la práctica habitual de la familia Qwen2.5) y una extensión de contexto hasta un millón de tokens. Los detalles exactos del corpus de preentrenamiento del modelo base (número de tokens, composición del dataset, proporción de datos sintéticos) no están disponibles en la información proporcionada.

La innovación técnica de este checkpoint es puramente de compresión y despliegue. Las matrices MLP gate y up se cuantizaron con GPTQ y búsqueda de exponente por bloque, calibrando sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano; las matrices de atención y MLP down usaron redondeo al más cercano a BFP8. Los tensores cuantizados se guardan como valores bf16 situados sobre la rejilla BFP4 o BFP8, de forma que TT-NN los empaqueta sin alterar sus valores; el autor incluye `pack_tensix.py` y `verify_grid.py` para comprobar el round-trip exacto contra la rejilla con torch y con el simulador ttsim de Blackhole. El checkpoint se validó con `ttnn` 0.81.1 sobre ttsim, pero ni tt-transformers ni tt-forge se han ejecutado con él.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con plantilla de chat compatible con `apply_chat_template`.
- Razonamiento de contexto largo: la ventana de un millón de tokens del modelo base permite procesar documentos extensos, bases de código completas o historiales de conversación muy largos.
- Capacidades heredadas de Qwen2.5-14B-Instruct: generación de código, matemáticas, instrucciones estructuradas y tool calling, aunque la model card de este export no las documenta explícitamente ni las valida tras la cuantización.
- Multilingüismo: la model card declara solo `en` para este export, pese a que el modelo base de Qwen2.5 es multilingüe; el calibrado de GPTQ incluyó texto coreano, pero no se reportan evaluaciones de calidad por idioma.
- Inferencia en NPU Tensix: ejecución nativa en Wormhole y Blackhole mediante TT-NN, con pesos que se empaquetan directamente en DRAM del dispositivo.

## Casos de uso

- Despliegue en hardware Tenstorrent: servir el modelo en una NPU Wormhole o Blackhole aprovechando el empaquetado nativo BFP4/BFP8, evitando la conversión en tiempo de carga y reduciendo la huella a 13,76 GB de DRAM de dispositivo.
- Procesamiento de documentos largos: análisis de contratos, informes o expedientes que superan la ventana de modelos de 128K, usando el contexto de un millón de tokens para resumir, extraer cláusulas o responder preguntas sobre el documento completo.
- Asistencia sobre bases de código: revisión de repositorios enteros o generación de parches con contexto de múltiples ficheros, adecuado por la combinación de tamaño medio (14B) y ventana de 1M.
- Atención al cliente multi-turno: gestión de conversaciones con historial extenso sin truncado, manteniendo coherencia en sesiones de decenas de miles de tokens.
- Investigación en cuantización de bajo nivel de bits: el checkpoint sirve como referencia reproducible para estudiar el efecto de BFP4 con GPTQ frente a BFP8 y frente a GGUF Q4_K_M, con métricas de KL y top-1 publicadas.
- Evaluación de pilas de inferencia para NPU: banco de pruebas para validar TT-NN, ttsim y futuras integraciones de tt-transformers/tt-forge con un modelo instructivo de 14B y contexto largo.
- Prototipado de agentes con contexto largo: pipelines que acumulan observaciones y trazas de herramientas durante muchas iteraciones, donde el coste del contexto es el cuello de botella.

## Benchmarks y rendimiento

Los datos publicados miden la fidelidad respecto a BF16, no la calidad de tarea. La tabla siguiente reproduce la evaluación del autor:

| Modelo | Bits por peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen2.5-14B-Instruct-1M) | 16 | 29,54 | 0 | 100 | 31 de 33 | - |
| Este modelo (BFP4/BFP8) | 7,45 | 13,756 | 0,07850 | 91,29 | 32 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,87 | 8,988 | 0,07403 | 90,14 | 31 de 33 | 0 |

KL y top-1 se calculan sobre 16.184 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia coreana), en formato plano y con plantilla de chat. Las 33 respuestas corresponden a prompts cortos con comprobación automática. El criterio de aceptación del autor era un KL medio como máximo 1,5 veces el de Q4_K_M y como máximo una respuesta perdida adicional; el checkpoint cumple con 1,06 veces el KL y cero respuestas perdidas. No se publican resultados de MMLU, HumanEval, GSM8K ni latencias o throughput.

## Requisitos de hardware

- VRAM/DRAM: aproximadamente 13,76 GB solo para los pesos del modelo de lenguaje en el dispositivo Tensix, más espacio para KV cache y buffers. Con contexto de un millón de tokens, la KV cache crece de forma significativa y debe dimensionarse aparte.
- GPU: no es el objetivo del checkpoint. En GPU, el checkpoint puede cargarse con `transformers` en bfloat16 (`dtype="bfloat16"`, `device_map="auto"`), pero los pesos se expanden a bf16 y la huella se aproxima a la del modelo base (unos 29,5 GB), por lo que requiere GPUs de 40 GB o más (A100 40/80 GB, H100) o reparto multi-GPU.
- NPU: Tensix Wormhole y Blackhole, mediante TT-NN. Validado con `ttnn` 0.81.1 sobre el simulador ttsim de Blackhole; no se han ejecutado tt-transformers ni tt-forge con este checkpoint.
- GPU de consumo: no cabe en tarjetas de 24 GB en bf16 sin cuantización adicional; para equipos de consumo la ruta natural es una cuantización GGUF del modelo base con llama.cpp.
- Opciones de despliegue: TT-NN en Tensix (ruta principal), `transformers` en GPU/CPU, y llama.cpp u Ollama con una cuantización GGUF derivada del modelo base, no de este checkpoint.
- Latencia y throughput: no disponibles. El autor indica explícitamente que no reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Xylolabs) | 14,77B | 1M | BFP4/BFP8 Tensix, 7,45 bits/peso | Apache 2.0 | Hugging Face, 48 descargas |
| Qwen2.5-14B-Instruct-1M (base) | 14,77B | 1M | BF16, 16 bits/peso | Apache 2.0 | Hugging Face, oficial de Qwen |
| Qwen2.5-14B-Instruct-1M en Q4_K_M (llama.cpp) | 14,77B | 1M | GGUF Q4_K_M, 4,87 bits/peso | Apache 2.0 | Derivado, reproducible con llama.cpp v0.9.0 |
| Qwen2.5-14B-Instruct (sin extensión 1M) | 14,77B | 32K (ampliable) | BF16 y múltiples GGUF/AWQ | Apache 2.0 | Hugging Face, oficial de Qwen |

La comparación relevante es de compromiso entre fidelidad, tamaño y portabilidad: este checkpoint ocupa más que Q4_K_M (13,76 frente a 8,99 GB) y tiene un KL ligeramente peor (0,0785 frente a 0,0740), pero es el único de los tres que se empaqueta de forma nativa en NPU Tensix. Frente al BF16 base, reduce la huella a menos de la mitad con cero respuestas perdidas en la batería de 33 prompts.

## Limitaciones y advertencias

- Las métricas publicadas miden proximidad a BF16 (KL y top-1), no calidad de tarea; no hay evaluaciones de MMLU, HumanEval, GSM8K ni de tool calling tras la cuantización.
- La model card declara únicamente inglés, aunque el calibrado usó texto coreano; el rendimiento multilingüe tras la cuantización no está medido.
- El checkpoint está validado solo con `ttnn` 0.81.1 sobre el simulador ttsim; no se ha ejecutado en silicio real ni con tt-transformers o tt-forge, por lo que el rendimiento en hardware físico es desconocido.
- El contexto de un millón de tokens implica una KV cache muy grande; la cifra de 13,76 GB cubre solo los pesos y no garantiza que quepa en una configuración de dispositivo concreta.
- Riesgo de alucinación y sesgos del modelo base Qwen2.5-14B-Instruct-1M, no reevaluados en este export; la cuantización agresiva a 4,5 bits en MLP gate/up puede amplificar errores en tareas sensibles a la precisión numérica.
- En GPU, cargar este checkpoint con `transformers` expande los pesos a bf16, con lo que se pierde la ventaja de tamaño y se necesita hardware de 40 GB o más.
- Licencia Apache 2.0, igual que el modelo base, sin restricciones adicionales conocidas para uso comercial; el autor incluye un fichero `NOTICE` con los cambios. Las descargas son muy bajas (48), lo que implica poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-1M-Tenstorrent-Tensix-BFP4-GateUp
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct-1M
- Código de cuantización y empaquetado: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags (arXiv:2501.15383): https://arxiv.org/abs/2501.15383
