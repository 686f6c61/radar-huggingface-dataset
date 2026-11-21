# VaidhyaMegha/Shoonya

## Resumen

Shoonya es una familia de modelos de lenguaje compactos entrenados desde cero por VaidhyaMegha Private Limited / Samyama Research, orientados a generación de código y consultas de grafos. El checkpoint principal documentado, Shoonya-Code-350M (312.062.976 parámetros exactos), se presenta como una alternativa de bajo coste computacional a modelos de 350M-400M entrenados con volúmenes de datos tres o cuatro órdenes de magnitud mayores. La propuesta central es la eficiencia de muestras: entrenado sobre aproximadamente 226,6M de tokens verificados por AST, compilador y grafo, el modelo reporta resultados en MBPP-Sanitized y HumanEval por encima de PolyCoder-400M, CodeGen-350M-mono y SmolLM2-360M.

La arquitectura es un transformer decoder-only con Pre-RMSNorm, Grouped-Query Attention (16 cabezas de consulta y 4 de clave/valor, con compartición cross-layer 2:1), RoPE con half-split y theta de 10.000, y FFN SwiGLU de dimensión 4.096 sobre 20 capas con d_model de 1.024. Incorpora un tokenizador específico de código de 50.264 entradas que añade tokens atómicos de indentación y sentinelas FIM, y descompone los embeddings atados en factores de rango 256 para reducir un 74,5% los parámetros de vocabulario.

Su relevancia actual reside en dos frentes: por un lado, el énfasis en instrumentación mecanicista (certificados espectrales basados en matrices aleatorias, HTSR y rango efectivo de Von Neumann) como alternativa al seguimiento exclusivo de la pérdida de entropía cruzada; por otro, el soporte nativo de OpenCypher con verificación de esquema y ejecución sobre grafos de propiedades, lo que lo sitúa en un nicho poco cubierto por modelos compactos. La licencia es Apache 2.0 y los pesos se distribuyen en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Pre-RMSNorm, GQA (16/4, cross-layer 2:1), RoPE half-split (theta 10.000), SwiGLU |
| Parametros totales | 312.062.976 (variante 350M); familia de 17M a 317M, con hoja de ruta hacia 1.3B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens nativos; extrapolación a 8.192 con Dynamic-NTK/YaRN |
| Tipos de cuantizacion | BF16 e INT8 documentados en la model card; no se detallan otros formatos |
| Idiomas soportados | Inglés y código (Python, Rust, OpenCypher) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, ~595 MiB por checkpoint de 350M); también se mencionan artefactos ONNX y PyTorch en los tags |

## Arquitectura y entrenamiento

El modelo es un transformer denso decoder-only de 20 capas con dimensión de modelo 1.024 y FFN de 4.096. Usa Grouped-Query Attention con 16 cabezas de consulta y 4 de clave/valor, y compartición cross-layer de KV en proporción 2:1, lo que reduce el uso de memoria de la caché. Los embeddings están atados y factorizados en rango 256, lo que rebaja los parámetros de vocabulario de 51,5M a 13,1M y dedica el 95,9% de los pesos a las capas de razonamiento SwiGLU. El tokenizador, de 50.264 entradas, parte de GPT-2 BPE (50.257 tokens) y añade cuatro sentinelas FIM/pad y tres tokens atómicos de indentación (`<|indent_4|>`, `<|indent_8|>`, `<|indent_12|>`), que según el autor comprimen el Python indentado un 37,9% y eliminan los `IndentationError` fuera de distribución (0 de 421 casos en MBPP + HumanEval).

El entrenamiento se realizó desde cero sobre aproximadamente 226,6M de tokens de preentrenamiento verificados por AST, compilador y grafo (unos 0,26B contando contexto largo y post-entrenamiento). El post-entrenamiento combina RL guiado por ejecución (`Step-GRPO`) con adaptadores LoRA especializados por dominio fusionados en una base singular compartida mediante `KnOTS` y `TIES`, además de RLVR multimodal positivo. La instrumentación incluye seguimiento de exponentes de auto-regularización de cola pesada (HTSR α), rango efectivo de Von Neumann y diversidad de cabezas vía divergencia Jensen-Shannon, calculados con SVD aleatorizada (Halko-Martinsson-Tropp) y Jacobi cíclico en Rust. El autor reporta 20/20 capas sin colapso, HTSR α medio de 2,006 y eRank medio del 78,0%. También se documenta decodificación con pausa y reanudación mediante `<|search_query|>`/`<|search_result|>` con KV incremental sin recómputo, y verificación estática de esquema OpenCypher.

## Capacidades

- Generación de código en Python y Rust, con compilación nativa verificada en Rust (`rustc --test`).
- Generación y ejecución de consultas OpenCypher sobre grafos de propiedades (Samyama), con verificación de esquema estática y alta validez sintáctica (99-100% reportado).
- Relleno de código en medio (FIM) mediante sentinelas dedicadas.
- Manejo de indentación sensible mediante tokens atómicos, orientado a Python.
- Razonamiento multi-paso con búsqueda activa: pausa y reanudación con `<|search_query|>`/`<|search_result|>` y gating por entropía de Shannon (FLARE).
- Búsqueda con tiempo de cómputo adicional (Search-TTC) para mejorar pass@k.
- Capacidades multilingües limitadas a inglés y código; no se documentan otros idiomas naturales.
- No se documenta soporte de tool calling genérico, visión ni audio.

## Casos de uso

- Generación de consultas OpenCypher en producción: el modelo traduce lenguaje natural a consultas Cypher con verificación de esquema y ejecución sobre un grafo de propiedades, lo que encaja en asistentes de exploración de datos conectados donde la validez sintáctica es crítica.
- Autocompletado de código en IDE: con contexto de 2.048 tokens y tokens FIM, puede rellenar fragmentos de Python y Rust en el editor, con la ventaja de eliminar errores de indentación en Python.
- Generación de tests en Rust: el modelo compila de forma nativa con `rustc --test`, lo que permite generar y validar pruebas unitarias dentro de un pipeline de CI/CD sin intervención manual.
- Enrutamiento de lenguaje natural a consultas de grafo en asistentes empresariales: la variante v0.9.3-Clean-EnterpriseNLQ está orientada a NLQ (natural language query) sobre esquemas de grafo, adecuada para interfaces de consulta para usuarios no técnicos.
- Servicio de bajo coste en CPU: con 26,1 tok/s en BF16 y 37,5 tok/s en INT8 a 8 hilos, es viable para despliegues en entornos sin GPU, como herramientas internas o servicios edge.
- Investigación en interpretabilidad mecanicista: los certificados espectrales y las métricas HTSR/eRank publicadas permiten estudiar la dinámica de entrenamiento de modelos pequeños con trazabilidad reproducible.
- Prototipado de agentes de código con grounding activo: el mecanismo de pausa y reanudación con búsqueda permite construir agentes que consulten fuentes externas durante la generación sin recómputo de KV.

## Benchmarks y rendimiento

| Benchmark | Shoonya-Code-350M | Referencia citada |
|---|---|---|
| MBPP-Sanitized (greedy) | 28,0% (72/257) | — |
| MBPP-Sanitized (Search-TTC) | 28,4% (73/257) | — |
| MBPP-Sanitized (pass@2) | 31,9% | — |
| OpenAI HumanEval (greedy) | 15,2% | — |
| OpenAI HumanEval (Search-TTC) | 17,1%-18,3% (28-30/164) | — |
| Rust `rustc --test` v1 | 25,0%-33,3% | — |
| Rustc-64 compile | hasta 73,4% | — |
| Samyama OpenCypher (t=0, v1) | 25,0% | — |
| Cypher-100 | 4,0%-5,0% | — |
| Validez sintáctica OpenCypher | 99%-100% | — |
| IndentationError fuera de distribución | 0/421 (0,0%) | — |

El autor afirma superar a PolyCoder-400M (39B tokens), CodeGen-350M-mono (264B tokens) y SmolLM2-360M (4.000B tokens) en MBPP-Sanitized y HumanEval, pero no se proporcionan en la información disponible las cifras concretas de esos modelos para una comparación lado a lado. Tampoco se detallan resultados de MMLU, GSM8K ni otros benchmarks de razonamiento general.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint BF16 de 350M ocupa ~595 MiB en disco; en memoria, con overhead de activaciones y caché KV, cabe holgadamente en GPUs de 2-4 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también A100/H100 para despliegues por lotes, aunque el modelo está claramente optimizado para entornos modestos.
- Cabe en GPU consumer: sí, en todas las gamas actuales, incluidas GPUs integradas con suficiente memoria compartida.
- Despliegue: PyTorch nativo y ONNX según los tags; no se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Rendimiento en CPU: 26,1 tok/s en BF16 y 37,5 tok/s en INT8 con 8 hilos.
- Latencia OpenCypher: TTFT reducido de 7,54 s a 0,55 s (13,68x) con bloques KV paginados copy-on-write por tenant y esquema.
- Memoria KV a 8K: 80 MiB en BF16 y 40 MiB en INT8 con compartición cross-layer 2:1, una reducción del 87,5% y 93,75% respectivamente frente a MHA estándar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Notas |
|---|---|---|---|---|---|
| Shoonya-Code-350M | 312M | 2.048 (8.192 con YaRN) | ~0,26B | Apache 2.0 | Soporte nativo de OpenCypher y Rust; instrumentación espectral |
| PolyCoder-400M | ~400M | 2.048 | 39B | MIT (según información pública) | Referencia citada por el autor; sin soporte de grafos |
| CodeGen-350M-mono | ~350M | 2.048 | 264B | Apache 2.0 (según información pública) | Referencia citada por el autor; solo Python |
| SmolLM2-360M | ~360M | 8.192 | 4.000B | Apache 2.0 (según información pública) | Referencia citada por el autor; modelo generalista |

Los datos de licencia y contexto de los modelos comparados provienen de información pública general y no de la model card de Shoonya; deben verificarse en sus respectivas fichas. Las cifras de rendimiento comparativo no están disponibles en la información proporcionada más allá de la afirmación cualitativa del autor de superarlos en MBPP-Sanitized y HumanEval.

## Limitaciones y advertencias

- El tamaño (312M parámetros) limita la profundidad de razonamiento y la generalización fuera de los dominios entrenados (Python, Rust, OpenCypher); no es adecuado para tareas generales de conocimiento.
- El contexto nativo es de solo 2.048 tokens; la extrapolación a 8.192 depende de Dynamic-NTK/YaRN y puede degradar la calidad.
- Los resultados de benchmarks son autoinformados por el autor y no se han replicado de forma independiente en la información disponible; además, las cifras de MBPP-Sanitized y HumanEval son modestas en términos absolutos (28% y 15,2% greedy).
- El soporte de idiomas naturales se limita al inglés; no se documenta castellano ni otros idiomas.
- Riesgo de alucinación en identificadores e importaciones: el autor reporta una reducción del 98,2% con las técnicas de grounding, pero persiste en escenarios fuera de distribución.
- No se documenta soporte de tool calling genérico ni de function calling estándar, lo que limita su integración en frameworks de agentes convencionales.
- La licencia Apache 2.0 permite uso comercial, pero el autor menciona filtros de contaminación de benchmarks y variantes "Clean" que conviene verificar antes de desplegar en producción.
- La familia se describe como en evolución (hoja de ruta hacia 1.3B); las variantes y nombres de checkpoint cambian con frecuencia, lo que exige fijar versiones concretas en producción.

## Enlaces

- Hugging Face: https://huggingface.co/VaidhyaMegha/Shoonya
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
