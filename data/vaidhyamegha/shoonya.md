# VaidhyaMegha/Shoonya

## Resumen

Shoonya es una familia de modelos de lenguaje compactos para generacion de codigo y consultas de grafos, desarrollada desde cero por VaidhyaMegha Private Limited / Samyama Research. La familia abarca variantes de 17M a 317M parametros, con una version de 1.3B en desarrollo. Todos los checkpoints se entrenan y auditan con tecnicas de interpretabilidad mecanistica basadas en espectros de valores singulares de matrices aleatorias (HTSR, eRank) y aprendizaje por refuerzo guiado por ejecucion (Step-GRPO).

El modelo insignia, Shoonya-Code-350M, tiene 312.062.976 parametros exactos y se entrena con solo 226,6M de tokens de preentrenamiento verificados por AST, compilador y grafo (unos 0,26B en total incluyendo contexto largo y post-entrenamiento). A pesar de este volumen reducido, el autor reporta que supera a PolyCoder-400M (39B tokens), CodeGen-350M-mono (264B tokens) y SmolLM2-360M (4.000B tokens) en MBPP-Sanitized y HumanEval, con soporte nativo para Python, Rust y OpenCypher de Samyama.

La relevancia actual reside en su enfoque de eficiencia extrema en datos, su instrumentacion espectral de capas y su arquitectura optimizada para servir consultas de grafos con KV cache paginado y comparticion de KV entre capas (2:1 XKV), lo que reduce el uso de RAM en contexto de 8K en un 87,5%. La licencia es Apache 2.0 y los pesos estan disponibles en formato safetensors BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Pre-RMSNorm, GQA, RoPE half-split y SwiGLU |
| Parametros totales | 312.062.976 (Shoonya-Code-350M); 1.065.086.976 (Shoonya-Code-1.3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (350M); 8.192 tokens con YaRN/Dynamic-NTK (1.3B) |
| Tipos de cuantizacion | BF16 e INT8 mencionados en la model card; no se detallan otros formatos |
| Idiomas soportados | Ingles y codigo (Python, Rust, OpenCypher) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); repositorio incluye tambien ONNX y PyTorch |

## Arquitectura y entrenamiento

Shoonya emplea un transformer decoder-only con Pre-RMSNorm, Grouped-Query Attention (16 cabezas de query y 4 de key/value, con comparticion 2:1 entre capas), RoPE half-split con theta de 10.000 y capas FFN SwiGLU. El tokenizador CodeTokenizer tiene un vocabulario de 50.264 tokens: 50.257 tokens BPE de GPT-2, cuatro sentinelas FIM/pad (50257-50260) y tres tokens atomicos de indentacion (50261-50263). Las embeddings estan atadas y factorizadas en rango 256 (350M) o 512 (1.3B), lo que reduce los parametros de vocabulario un 74,5% (de 51,5M a 13,1M), dedicando el 95,9% de los pesos a las 20 capas de razonamiento SwiGLU.

El entrenamiento se realizo desde cero sobre 226,6M de tokens verificados por AST, compilador y grafo, con decontaminacion SHA-256 estricta. El post-entrenamiento incluye RL guiado por ejecucion (Step-GRPO) con adaptadores LoRA fusionados en una base singular compartida (KnOTS + TIES), que segun el autor reduce un 98,2% los identificadores o imports alucinados. Tambien incorpora pausa y reanudacion con KV incremental cero-recomputo mediante tokens `<|search_query|>` y `<|search_result|>`, gating por entropia de Shannon (FLARE) y verificacion estatica de esquema OpenCypher. La auditoria espectral usa SVD aleatorizado Halko-Martinsson-Tropp y Cyclic Jacobi en Rust (4,75 ms a 2.048x2.048), con resultados reportados de HTSR alpha medio de 2,006 y eRank medio del 78,0% en 20/20 capas sin colapso.

## Capacidades

- Generacion de codigo en Python, Rust y consultas OpenCypher de Samyama.
- Relleno de codigo en medio (FIM) mediante sentinelas dedicados en el tokenizador.
- Manejo atomico de indentacion con tokens `<|indent_4|>`, `<|indent_8|>` e `<|indent_12|>`, que elimina errores de indentacion fuera de distribucion (0/421 reportados).
- Compilacion nativa de Rust verificada con `rustc --test` (25,0%-33,3% en v1, hasta 73,4% en Rustc-64).
- Ejecucion de OpenCypher sobre grafos de propiedades Samyama con validacion de sintaxis del 99%-100%.
- Grounding activo con busqueda pausable y reanudable (`<|search_query|>` / `<|search_result|>`) sin recomputo de KV.
- Gating por entropia para decidir cuando activar la busqueda (FLARE).
- Contexto extendido a 8.192 tokens en la variante 1.3B mediante YaRN y Dynamic-NTK.
- Capacidades multilingues limitadas a ingles y codigo; no se reportan otras lenguas.
- No se menciona soporte de tool calling generico, vision, audio ni modo thinking explicito.

## Casos de uso

- Generacion de codigo Python en produccion: el modelo puede completar funciones y rellenar codigo en medio gracias a los sentinelas FIM, con una tasa reportada de 28,0% greedy en MBPP-Sanitized, adecuado para autocompletado en editores y pipelines de CI/CD donde se requiera un modelo ligero.
- Compilacion y generacion de Rust: con verificacion nativa mediante `rustc --test` y tasas de compilacion de hasta 33,3% en v1, puede integrarse en flujos de generacion de crates o tests unitarios con validacion automatica por compilador.
- Consultas a grafos de propiedades: la validacion estatica de esquema OpenCypher y la sintaxis valida del 99%-100% permiten usar el modelo para traducir lenguaje natural a consultas Cypher en plataformas de analisis de grafos, con ejecucion verificada en Samyama (16,7% en t=0, hasta 33,3% con N=4).
- Servicio multi-tenant de NLQ sobre grafos: el KV cache paginado con Copy-on-Write por `(tenant_id, schema_sha256)` y PAGE_TOKENS=16 reduce el TTFT de 7,54 s a 0,55 s (13,68x) con cero deriva de tokens, adecuado para plataformas SaaS de consulta de grafos.
- Despliegue en CPU de bajo coste: con 26,1 tok/s en BF16 y 37,5 tok/s en INT8 a 8 hilos, el modelo puede servir en entornos sin GPU para tareas de autocompletado o validacion de consultas.
- Investigacion en interpretabilidad mecanistica: la instrumentacion espectral (HTSR, eRank, diversidad Jensen-Shannon) y el codigo de auditoria en Rust permiten estudiar dinamicas de entrenamiento y colapso de capas en modelos pequenos.
- Prototipado de asistentes de codigo con contexto largo: la variante 1.3B con 8.192 tokens y comparticion KV 2:1 (reduccion del 87,5% en RAM BF16 a 80 MiB) facilita el despliegue en GPUs de consumo con ventanas de contexto amplias.
- Educacion y experimentacion: al ser from-scratch, con licencia Apache 2.0 y pesos safetensors, sirve como base reproducible para estudiar tecnicas de eficiencia en datos y RL guiado por ejecucion.

## Benchmarks y rendimiento

| Benchmark | Shoonya-Code-350M | Referencia citada |
|---|---|---|
| MBPP-Sanitized (greedy) | 28,0% (72/257) | PolyCoder-400M, CodeGen-350M-mono, SmolLM2-360M (superados) |
| MBPP-Sanitized (Search-TTC) | 28,4% (73/257) | No disponible |
| MBPP-Sanitized (pass@2) | 31,9% | No disponible |
| OpenAI HumanEval (greedy) | 15,2% | No disponible |
| OpenAI HumanEval (Search-TTC) | 17,1%-18,3% (28-30/164) | No disponible |
| Rust `rustc --test` v1 | 25,0%-33,3% | No disponible |
| Rustc-64 compile | hasta 73,4% | No disponible |
| Samyama OpenCypher (t=0, v1) | 25,0% | No disponible |
| Cypher-100 | 4,0%-5,0% | No disponible |
| Sintaxis OpenCypher valida | 99%-100% | No disponible |
| IndentationError fuera de distribucion | 0/421 (0,0%) | No disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint 350M en BF16 ocupa 595,4 MiB (unos 0,6 GB); en INT8 aproximadamente la mitad. El checkpoint 1.3B en BF16 ocupa 2.031,5 MiB (unos 2 GB).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para el 350M en BF16; el 1.3B requiere al menos 4 GB. Se mencionan A100, H100 y RTX 4090 como opciones sobredimensionadas para este tamano, pero no se detallan pruebas especificas.
- Cabe en GPU de consumo: si, en GTX 1650, RTX 3050, RTX 4060 y superiores para el 350M; el 1.3B cabe en RTX 3060 o superior.
- Opciones de despliegue: la model card menciona servicio nativo en CPU con 8 hilos y decodificacion BF16/INT8; no se confirma soporte explicito de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: 26,1 tok/s en BF16 y 37,5 tok/s en INT8 con 8 hilos de CPU; TTFT de 0,55 s para OpenCypher con KV paginado (frente a 7,54 s sin paginacion). No se reportan cifras de throughput en GPU.
- Reduccion de memoria: la comparticion KV 2:1 reduce la RAM de KV a 8K en un 87,5% (80 MiB en BF16) y un 93,75% (40 MiB en INT8) frente a MHA estandar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens de entrenamiento | MBPP-Sanitized | Licencia |
|---|---|---|---|---|---|
| Shoonya-Code-350M | 312M | 2.048 | ~0,26B | 28,0% greedy | Apache 2.0 |
| PolyCoder-400M | 400M | 2.048 | 39B | Superado por Shoonya (sin cifra) | MIT |
| CodeGen-350M-mono | 350M | 2.048 | 264B | Superado por Shoonya (sin cifra) | Apache 2.0 |
| SmolLM2-360M | 360M | 8.192 | 4.000B | Superado por Shoonya (sin cifra) | Apache 2.0 |

Los datos de comparacion provienen de la model card del autor; no se dispone de cifras independientes de los modelos de referencia en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos; al entrenarse principalmente con codigo en ingles, puede reflejar sesgos de los corpus de Python y Rust.
- Riesgo de alucinacion: el autor reporta una reduccion del 98,2% en identificadores o imports alucinados tras el RL, pero persiste riesgo en generacion de codigo y consultas OpenCypher, con tasas de exito bajas en Cypher-100 (4,0%-5,0%).
- Limitaciones de contexto: el 350M tiene solo 2.048 tokens de contexto; el 1.3B alcanza 8.192 con YaRN/Dynamic-NTK, lo que puede degradar la calidad fuera de la ventana nativa.
- Limitaciones de idioma: solo ingles y codigo; no hay soporte documentado de castellano ni otras lenguas naturales.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card indica "0% NC-SA" en los checkpoints, lo que sugiere que se evito material no comercial; conviene verificar la procedencia de los datos de entrenamiento.
- Caveats para produccion: las cifras de benchmarks son autocertificadas por el autor y no se han verificado de forma independiente; el rendimiento en Rust y OpenCypher es bajo en terminos absolutos (16,7%-33,3% en ejecucion), por lo que se recomienda validacion por compilador o ejecucion en pipelines.
- Madurez: la familia esta en desarrollo (versiones v0.9.x y v2.0), con una variante 1.3B reciente; la API y los checkpoints pueden cambiar.
- Soporte de tooling: no se confirma integracion con vLLM, llama.cpp u otros motores estandar, lo que puede limitar el despliegue en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/VaidhyaMegha/Shoonya
- Repositorio del modelo (safetensors, ONNX, PyTorch): incluido en el repositorio de Hugging Face
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
