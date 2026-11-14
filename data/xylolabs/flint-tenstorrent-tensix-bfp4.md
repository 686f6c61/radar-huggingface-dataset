# Xylolabs/flint-Tenstorrent-Tensix-BFP4

## Resumen

flint-Tenstorrent-Tensix-BFP4 es una exportación cuantizada del modelo RecursiveSI/flint, publicada por Xylolabs, orientada específicamente a la inferencia sobre aceleradores Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base es un transformer de tipo mezcla de expertos (MoE) con 39.785.287.456 parámetros totales, y esta versión sustituye las capas lineales por pesos en formato de coma flotante en bloque de 4 bits (`ttnn.bfloat4_b`, BFP4) obtenidos mediante GPTQ, manteniendo el resto de tensores (embeddings, router, LM head y normalizaciones) en bf16.

La relevancia del modelo radica en que demuestra un flujo de cuantización extremo (4,68 bits por peso de media) que reduce el peso del modelo de 79,57 GB a 23,30 GB, permitiendo desplegar un modelo de casi 40.000 millones de parámetros en memoria de dispositivo mucho más reducida. Está pensado para el stack de software de Tenstorrent (tt-metal, ttNN, tt-forge), no para GPU convencionales, y se distribuye con licencia Apache 2.0.

El checkpoint incluye herramientas de verificación bit a bit de las matrices empaquetadas y una evaluación de fidelidad frente a la referencia en bf16 mediante divergencia KL y top-1 sobre texto en inglés y coreano. La model card advierte que tt-transformers y tt-forge no se han probado con este checkpoint, lo que limita su madurez de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) |
| Parametros totales | 39.785.287.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso), GPTQ con busqueda de exponente por bloque; router y LM head en bf16 |
| Idiomas soportados | no disponible (evaluado en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con metadatos `quant4.json` e indice de shards) |

## Arquitectura y entrenamiento

El modelo base RecursiveSI/flint es un transformer de mezcla de expertos con 49 capas de atención y 47 capas con expertos enrutados más un experto compartido; las 2 capas MLP restantes son densas. La exportación de Xylolabs cuantiza las proyecciones q, k, v, o de atención, las proyecciones gate/up/down de las MLP densas y las de los expertos enrutados y compartido a BFP4, mientras que el router (47 capas), el LM head, los embeddings y las normalizaciones permanecen en bf16. El resultado es un peso medio de 4,68 bits por parámetro y 23,30 GB empaquetados.

El proceso de cuantización aplica GPTQ con una búsqueda de exponente por bloque (offsets -1 y 0, damping 0,1). Antes de cuantizar, algunas canales intermedios de los expertos se permutaron de forma conjunta (filas de gate/up y columnas correspondientes de down), de modo que la referencia bf16 utilizada para la evaluación es un checkpoint reordenado, no el original. La model card señala que la suma en precisión finita y el enrutamiento de expertos pueden cambiar con esa permutación. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional: la model card incluye un ejemplo de chat con plantilla de mensajes (`apply_chat_template`) y generación con `max_new_tokens`.
- Razonamiento: la prueba de respuestas documentada se realizó con "reasoning on" y un límite de 1.024 tokens nuevos, lo que sugiere soporte de modo de razonamiento.
- Capacidades multilingües: la evaluación de fidelidad cubre inglés y coreano (WikiText-2 y Wikipedia en coreano), aunque no se publica la lista oficial de idiomas.
- Compatibilidad con el ecosistema Transformers: carga mediante `AutoModelForCausalLM` y `AutoTokenizer`, con `device_map="auto"`.
- Despliegue en hardware Tenstorrent: pesos empaquetados para `ttnn.bfloat4_b` con layout TILE y memoria DRAM, verificables bit a bit con `pack_tensix.py` y `verify_grid.py`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Visión o audio: no disponible; el pipeline es text-generation.

## Casos de uso

- Inferencia en aceleradores Tenstorrent: el caso principal es ejecutar un modelo de ~40.000 millones de parámetros en NPUs Wormhole o Blackhole con solo 23,30 GB de memoria de dispositivo para los pesos, más KV cache y buffers, aprovechando el formato BFP4 nativo de ttNN.
- Investigación en cuantización extrema: sirve como referencia reproducible para estudiar el impacto de BFP4 con GPTQ en modelos MoE, con métricas de KL y top-1 frente a bf16 y frente a Q4_K_M de llama.cpp.
- Evaluación de fidelidad de checkpoints: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar que cada matriz empaquetada coincide bit a bit con la representación esperada, útil en pipelines de control de calidad de cuantizaciones.
- Despliegue con memoria limitada en host: cargando el checkpoint en bf16 con Transformers en CPU o GPU, el peso efectivo es de 23,30 GB en lugar de 79,57 GB, lo que facilita pruebas en máquinas con menos VRAM.
- Prototipado de asistentes conversacionales: el ejemplo de chat con plantilla y el modo de razonamiento permiten construir demostraciones de atención al cliente o asistentes multi-turno, siempre que se valide el comportamiento en el hardware objetivo.
- Benchmarking de stacks de software: comparar el rendimiento de tt-metal/ttNN frente a alternativas como llama.cpp con Q4_K_M (24,167 GB, KL 0,3039) para decidir la ruta de despliegue en producción.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) |
|---|---:|---:|---:|---:|
| BF16 reordenado (RecursiveSI/flint) | 16 | 79,57 | 0 | 100 |
| **flint-Tenstorrent-Tensix-BFP4** | 4,68 | 23,299 | 0,374 | 78,66 |
| Q4_K_M (llama.cpp) | 4,86 | 24,167 | 0,3039 | 80,58 |

Las métricas de KL y top-1 se calcularon sobre 16.320 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), con y sin plantilla de chat, medidas en CPU/GPU usando los valores bf16 del checkpoint cuantizado. El suelo de KL media entre las dos referencias bf16 es 0,0561. La KL media de este modelo es 1,23 veces la de Q4_K_M. En la prueba de respuestas documentada en CPU/GPU, tanto este checkpoint como su referencia bf16 reordenada acertaron 33 de 33 prompts fijos con razonamiento activado y límite de 1.024 tokens nuevos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria de dispositivo estimada: unos 23,30 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers.
- Hardware objetivo: NPUs Tenstorrent Tensix, arquitecturas Wormhole y Blackhole; verificado con ttnn 0.81.1 sobre ttsim (simulador de Blackhole).
- GPU consumer: no está pensado para GPU; la carga en bf16 con Transformers requiere aproximadamente 23,30 GB de memoria, lo que excede la mayoría de GPU consumer de 24 GB una vez añadidos KV cache y buffers.
- GPU de datacenter: no se documentan pruebas con A100, H100 ni RTX 4090; el quickstart nativo se verificó con Transformers 5.22.2 en CPU.
- Opciones de despliegue: tt-metal/ttNN (formato nativo BFP4), Transformers con `device_map="auto"` para el decodificador nativo; tt-transformers y tt-forge no se han ejecutado con este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits por peso | Tamano | KL vs BF16 | Licencia |
|---|---|---:|---:|---:|---:|---|
| flint-Tenstorrent-Tensix-BFP4 | 39,79 B | no disponible | 4,68 | 23,30 GB | 0,374 | Apache 2.0 |
| RecursiveSI/flint (bf16) | 39,79 B | no disponible | 16 | 79,57 GB | 0 | no disponible |
| Q4_K_M de flint (llama.cpp) | 39,79 B | no disponible | 4,86 | 24,17 GB | 0,3039 | Apache 2.0 (derivada) |

La comparativa se limita a las variantes del mismo modelo base, ya que la información proporcionada no incluye otros modelos de tamaño o tarea comparable. Frente a Q4_K_M, esta exportación ocupa algo menos de espacio (23,30 GB frente a 24,17 GB) pero presenta una KL media superior (0,374 frente a 0,3039) y un top-1 inferior (78,66 % frente a 80,58 %). Su ventaja es el formato nativo para Tensix; su desventaja, la menor fidelidad relativa y la falta de validación en tt-transformers y tt-forge.

## Limitaciones y advertencias

- Fidelidad limitada: la KL media de 0,374 y el top-1 de 78,66 % implican una degradación medible frente a bf16; la model card la considera aceptable (1,23 veces la de Q4_K_M) pero no es una cuantización sin pérdidas.
- Permutación de canales en expertos: la referencia bf16 usada para evaluar es un checkpoint reordenado, y la suma en precisión finita y el enrutamiento de expertos pueden cambiar respecto al modelo original.
- Madurez del stack: tt-transformers y tt-forge no se han probado con este checkpoint; solo se verificó con ttnn 0.81.1 sobre el simulador ttsim, no en hardware físico según la información disponible.
- Idiomas: no se publica la lista oficial de idiomas soportados; la evaluación se limita a inglés y coreano.
- Contexto: no se documenta la longitud máxima de contexto, lo que impide planificar despliegues con ventanas largas.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; debe evaluarse de forma independiente antes de uso en producción.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base RecursiveSI/flint, cuya licencia no se detalla en la información disponible.
- Benchmarks estándar ausentes: no hay resultados de MMLU, HumanEval ni GSM8K, por lo que la comparación con otros modelos se limita a métricas de fidelidad de cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/flint-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Referencia bf16 reordenada: https://huggingface.co/RecursiveSI/flint/tree/2a247be0c0aec895ccb0ac7ca92229ec6df37288
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/flint-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
