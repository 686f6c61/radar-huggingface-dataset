# tfwnotops/Ternary-Bonsai-2-27B-Crystal

## Resumen

Ternary-Bonsai-2-27B-Crystal es un derivado del modelo Ternary Bonsai 2 27B de Prism ML, a su vez una cuantización ternaria de Qwen3.8-27B. El autor del paquete es tfwnotops, que publica este modelo bajo la librería MLX con pesos en safetensors y un total de 27.359.638.768 parámetros. La modificación respecto al modelo base no afecta a los pesos: lo que cambia es el mecanismo de atención de las 16 capas de atención completa del híbrido de Qwen3.8-27B, que sustituye la caché key-value en bf16 por un estado fijo denominado "crystallized attention".

El problema que aborda es el crecimiento lineal de la memoria de atención con la longitud de contexto. En lugar de almacenar claves y valores en bf16 para todos los tokens pasados, el modelo mantiene una ventana exacta de 1.024 tokens, un portador de decaimiento ajustado con cinco modos exponenciales y un índice de 4 bits del pasado, del que se leen exactamente los 32 tokens lejanos con mayor puntuación. El resultado es una reducción de la memoria de atención de 3,2 GB a 2,0 GB a 32k tokens, y hasta 469 MiB en modo de memoria constante con `--top0`.

La relevancia del modelo es doble: por un lado, demuestra que se puede recortar el coste de atención de un modelo de 27B sin reentrenar los pesos, con un coste medido de +0,0045 nat/token en libros no vistos a 32k tokens; por otro, introduce el concepto de "monorail", un grafo `.causal` que registra las rutas de cada petición y permite reutilizar prefijos ya computados, con aceleraciones de 5,5× en ficheros que crecen y de 2,3–2,9× en peticiones repetidas. Es el primer modelo de la línea de estado constante que después daría lugar a la Holographic Causal Graph Machine.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de atención causal (base Qwen3.8-27B) con crystallized attention en las 16 capas de atención completa |
| Parámetros totales | 27.359.638.768 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 262.000 tokens (heredada del modelo base) |
| Tipos de cuantización | Pesos ternarios {−1, 0, +1} en base rotada fija con escala FP16 por grupo de 128 pesos; índice de atención con claves int8 y valores int4, rotados con Hadamard |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (según el badge de la model card) |
| Formato de pesos | safetensors (librería MLX), grafo `.causal` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer causal con atención híbrida: la mayoría de capas usan un mecanismo lineal o recurrente y 16 capas mantienen atención completa. Sobre esa base, Prism ML aplicó una cuantización ternaria en la que cada peso del modelo de lenguaje se representa como {−1, 0, +1} en una base rotada fija, con una escala FP16 por grupo de 128 pesos. El autor de esta ficha no reentrena ni modifica los pesos: el paquete Crystal es byte-idéntico al pack de Prism ML y solo altera el estado de atención.

La innovación principal es la crystallized attention. Por cada cabeza, el modelo calcula atención exacta sobre los últimos 1.024 tokens y, más allá de esa ventana, mantiene una cola cristalizada compuesta por cinco modos exponenciales con semividas de un catálogo fijo (de 1 a 3.000 tokens) multiplicados por un término query–key de rango 8, todo ello como estado recurrente. Los 32 tokens lejanos con mayor puntuación en 4 bits se leen exactamente del índice, y la contribución del portador sobre ellos se resta de forma exacta. El modo `--top0` elimina el índice y deja solo la ventana y el estado, con 469 MiB para las 16 capas a cualquier longitud. Sobre todo ello se superpone el "monorail": un grafo `.causal` que vincula cada tensor, autentica cada fichero y registra las rutas del modelo con un punto de ruta cada 1.024 tokens, de modo que los prefijos conocidos se recorren en lugar de recalcularse.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.8-27B.
- Procesamiento de imágenes además de texto, según la documentación de Prism ML sobre el modelo base.
- Llamada a herramientas (tool calling / function calling), indicada en la documentación del modelo base.
- Contexto largo de hasta 262.000 tokens, con memoria de atención acotada gracias a la crystallized attention.
- Reutilización de rutas: las peticiones que repiten o extienden una anterior recorren la ruta registrada en el grafo `.causal` de forma bit-idéntica, en lugar de recomputar.
- Modo de memoria constante (`--top0`) para despliegues con restricciones severas de memoria.
- Razonamiento multi-paso y comportamiento de agente: no confirmado explícitamente en la información disponible más allá del soporte de tool calling del modelo base.

## Casos de uso

- Procesamiento de documentos largos en equipos Apple Silicon: con 262k tokens de contexto y una memoria de atención de 2,0 GB a 32k tokens, el modelo puede resumir o analizar libros, informes o expedientes completos en un Mac con MLX, sin necesidad de GPU dedicada.
- Edición de código a nivel de proyecto: la model card reporta 0,474 de líneas exactas en completado de código a nivel de proyecto (40 ítems, 32k tokens), prácticamente idéntico al 0,473 del modelo original, lo que lo hace adecuado para asistentes de código que necesitan ver múltiples ficheros a la vez.
- Recuperación de información en contextos largos: el modelo recupera correctamente claves de paso en 40 de 40 pruebas (10 profundidades × 4k–32k tokens), lo que lo habilita para tareas de "needle in a haystack" sobre corpus extensos.
- Pipelines de generación iterativa de ficheros: el monorail acelera 5,5× las peticiones que extienden un fichero que crece, lo que encaja con flujos de escritura incremental de código o documentación donde cada paso añade texto al anterior.
- Servicio de chat con caché de peticiones repetidas: las peticiones que repiten una anterior se sirven 2,3–2,9× más rápido al recorrer la ruta registrada de forma bit-idéntica, útil en sistemas con prompts de sistema largos y recurrentes.
- Despliegue en hardware de memoria limitada: con `--top0`, las 16 capas de atención ocupan 469 MiB a cualquier longitud, lo que permite contextos de 32k tokens en un Mac mini de 16 GB (según el modelo sucesor ConstantKV) y decode de 28,9 ms/token a 64k tokens.
- Análisis multimodal de documentos con texto e imágenes: al heredar la entrada de imágenes del modelo base, puede emplearse en tareas de extracción de información de capturas, diagramas o páginas escaneadas combinadas con texto largo.

## Benchmarks y rendimiento

Los datos disponibles son métricas internas del autor, no benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K). Se presentan tal cual, comparando el modelo original con Crystal:

| Métrica | Original (KV cache nativa) | Crystal (por defecto) | Crystal, memoria constante (`--top0`) |
|---|---:|---:|---:|
| Memoria de atención a 32k tokens | 3,2 GB | 2,0 GB | 469 MiB |
| Memoria de atención a 64k tokens | 6,3 GB | 3,5 GB | 469 MiB |
| Coste en libros no vistos, 32k tokens (nat/token) | referencia | +0,0045 | +0,116 |
| Líneas exactas, completado de código a nivel de proyecto (40 ítems, 32k) | 0,473 | 0,474 | no disponible |
| Claves de paso recuperadas (10 profundidades × 4k–32k) | 40/40 | 40/40 | no disponible |
| Decode a 4k / 32k / 64k tokens (ms/token) | 24,4 / 37,0 / 42,4 | 42,6 / 44,0 / 41,9 | 31,2 / 32,8 / 28,9 |
| Petición que repite o extiende una anterior | recalculada | ruta registrada, bit-idéntica: 5,5× más rápida (fichero creciente), 2,3–2,9× (petición repetida) | igual |

El coste de la cuantización ternaria de los pesos frente a bf16 Qwen3.8-27B es de 0,28 nat/token; la atención añade un 1–2 % de ese coste con el índice. Las mediciones de decode se realizaron en MLX sobre backend CUDA (NVIDIA RTX PRO 6000 Blackwell, batch 1, modelo completo).

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 8,6 GB en safetensors; el modelo completo en MLX requiere en torno a esa cifra más el estado de atención (2,0 GB a 32k tokens en modo por defecto, 469 MiB en modo `--top0`).
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (usada para las mediciones de decode); no se especifican otras GPU en la información disponible.
- Cabe en GPU de consumo: sí, según el tamaño del repo (8,6 GB) y la gestión de memoria de atención; el modelo sucesor ConstantKV reporta 32k tokens en un Mac mini de 16 GB, lo que sugiere que este modelo también es viable en equipos con 16 GB de memoria unificada.
- Opciones de despliegue: MLX (librería nativa del paquete); no se confirman vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: decode de 42,6 / 44,0 / 41,9 ms/token a 4k / 32k / 64k tokens en modo por defecto, y 31,2 / 32,8 / 28,9 ms/token en modo `--top0`, medidos en MLX sobre RTX PRO 6000 Blackwell con batch 1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria de atención a 32k | Coste vs. original | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|---|
| Ternary-Bonsai-2-27B (original) | 27,4B | 262k | 3,2 GB | referencia | no disponible | Hugging Face (Prism ML) |
| Ternary-Bonsai-2-27B-Crystal | 27,4B | 262k | 2,0 GB (469 MiB con `--top0`) | +0,0045 nat/token | Apache 2.0 | Hugging Face (tfwnotops) |
| Ternary-Bonsai-2-27B-ConstantKV (sucesor) | 27,4B | 262k | 1,18 GiB a cualquier longitud | +0,0084 nat/token a 32k | no disponible | Hugging Face (tfwnotops) |
| Qwen2.5-1.5B-Instruct-HCGM | 1,5B | no disponible | 14,4 MiB de estado constante | no aplica | no disponible | Hugging Face (tfwnotops) |

La comparativa con modelos de la misma categoría (27B, contexto largo) fuera de la familia Bonsai no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un derivado no oficial de Qwen3.8-27B y del pack ternario de Prism ML; el autor de la ficha no es el desarrollador original del modelo base.
- Los pesos ternarios introducen un coste medido de 0,28 nat/token frente a bf16 Qwen3.8-27B, por lo que la calidad es inferior a la del modelo sin cuantizar.
- El modo `--top0` de memoria constante eleva el coste a +0,116 nat/token en libros no vistos a 32k tokens, un deterioro sustancial respecto al modo por defecto.
- El índice de atención usa claves int8 y valores int4, lo que introduce pérdida de precisión en la recuperación de tokens lejanos, aunque las pruebas de claves de paso reportan 40/40.
- El decode en modo por defecto es más lento que la KV cache nativa a contextos cortos (42,6 frente a 24,4 ms/token a 4k), por lo que el beneficio aparece a partir de 32k tokens.
- La librería es MLX, orientada a Apple Silicon y backend CUDA experimental; no se confirma soporte para vLLM, llama.cpp, Ollama ni TGI, lo que limita el despliegue en infraestructura estándar de servidores.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos de este paquete; deben asumirse los del modelo base Qwen3.8-27B.
- La licencia Apache 2.0 aparece en el badge de la model card, pero el campo de licencia del repositorio figura como no disponible; conviene verificar el fichero LICENSE antes de un uso comercial.
- El modelo tiene 407 descargas y 2 likes en el momento de la consulta, con un ecosistema de validación externa muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tfwnotops/Ternary-Bonsai-2-27B-Crystal
- Fichero de licencia: https://huggingface.co/tfwnotops/Ternary-Bonsai-2-27B-Crystal/blob/main/LICENSE
- Modelo sucesor ConstantKV: https://huggingface.co/tfwnotops/Ternary-Bonsai-2-27B-ConstantKV
- Modelo HCGM: https://huggingface.co/tfwnotops/Qwen2.5-1.5B-Instruct-HCGM
- Documentación del modelo base Bonsai 2 27B: https://docs.prismml.com/models/bonsai-2-27b
- Repositorio mrail: https://github.com/DT-Foss/mrail
- Paper Crystallized Attention: https://doi.org/10.13140/RG.2.2.21299.18725
- Paper HCGM: https://doi.org/10.13140/RG.2.2.28206.68167
- Paper "No GPU, No KV Cache": https://doi.org/10.13140/RG.2.2.31562.12484
- Paper "Compute Once": https://doi.org/10.13140/RG.2.2.18140.35202
