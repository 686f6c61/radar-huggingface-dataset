# Ttimms/KAT-Coder-V2.5-Dev-REAP-50-NVFP4A16

## Resumen

KAT-Coder-V2.5-Dev-REAP-50-NVFP4A16 es una versión optimizada del modelo de codificación agéntica KAT-Coder-V2.5-Dev, desarrollada por Ttimms. El modelo original, creado por Kwaipilot, es un MoE basado en Qwen3.5-35B-A3B que alcanza 69,40% en SWE-bench Verified. Esta variante aplica poda de expertos REAP al 50% y cuantización NVFP4A16 (pesos en FP4 de 4 bits, activaciones en bf16) para reducir el tamaño de 69,3 GB a 12,45 GiB, lo que permite su ejecución en GPUs de consumo con 16 GB de VRAM.

El resultado es un asistente de codificación agéntico que se sirve mediante vLLM en hardware Blackwell (SM120) y mantiene un rendimiento competitivo en benchmarks de código: 89,0% en HumanEval+ y 52,0% en SWE-bench Verified bajo un scaffold de agente bash-only. El modelo conserva la licencia Apache 2.0 del base, lo que facilita su uso comercial y académico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.5-35B-A3B, podada con REAP al 50% |
| Parametros totales | 18.543.997.568 (18,5B) |
| Parametros activos | no disponible (el modelo base Qwen3.5-35B-A3B tiene 3B activos; tras la poda no se ha publicado el dato) |
| Longitud de contexto | 49.000 tokens (configuracion del scaffold validado; el modelo base soporta mas, pero este checkpoint se evaluo a 49K) |
| Tipos de cuantizacion | NVFP4A16 (pesos en FP4 de 4 bits, activaciones en bf16); tambien existe variante W4A4 y GGUF |
| Idiomas soportados | no disponible (hereda del modelo base, pero no se publica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con vLLM y Transformers) |

Nota: el tamano del repositorio es 26,8 GB (incluye otros archivos), pero el checkpoint cuantizado ocupa 12,45 GiB.

## Arquitectura y entrenamiento

El modelo parte de Kwaipilot/KAT-Coder-V2.5-Dev, un MoE con arquitectura qwen3_5_moe entrenado con RL para uso agentico en entornos sandbox (segun el articulo de HackerNoon). Ttimms aplica poda de expertos REAP (elimina el 50% de los expertos) con calibracion sobre el dataset evol-codealpaca-v1 y semilla 42, seguida de cuantizacion NVFP4A16 weight-only (sin datos de calibracion). Ademas se elimina la torre de vision (cuyos pesos no estaban entrenados) y se aplica una correccion de renormalizacion del router, contribuida upstream al proyecto.

El checkpoint resultante se sirve con vLLM usando el kernel Marlin NVFP4, que decodifica los pesos de 4 bits y calcula en bf16, evitando aritmetica FP4. No se han publicado detalles sobre el numero total de tokens de entrenamiento ni la composicion completa del dataset; el unico dataset mencionado es evol-codealpaca-v1, usado para la calibracion de la poda.

## Capacidades

- Generacion de codigo y razonamiento: alto rendimiento en HumanEval+ (89,0%) y MBPP+ (90,5%) en configuracion greedy con framing instructivo.
- Agente de codificacion: resuelve issues de SWE-bench Verified mediante el scaffold bash-only de mini-swe-agent, con 52,0% de resolucion (26/50 instancias).
- Tool calling: soporte implicito a traves del scaffold de agente; no se documenta una API publica de function calling.
- Contexto largo: hasta 49.000 tokens en la configuracion validada, suficiente para repositorios medianos.
- Conversacional: pipeline text-generation, apto para chat tecnico y asistencia en tiempo real.
- Sin vision: la torre de vision fue eliminada, por lo que no procesa imagenes.

## Casos de uso

- Asistente de programacion local en IDE: con 16 GB de VRAM, el modelo se ejecuta en una RTX 5070 Ti y puede integrarse en extensiones de VS Code para autocompletar, explicar y refactorizar codigo sin enviar datos a la nube, garantizando privacidad.
- Agente autonomo de resolucion de issues: usando el scaffold mini-swe-agent, el modelo recibe un issue de GitHub, navega el repositorio, genera un parche y ejecuta tests, como demuestra su resultado en SWE-bench Verified.
- Generacion de tests unitarios: con su alto MBPP+, puede generar casos de prueba para funciones y modulos, integrandose en pipelines de CI para aumentar la cobertura.
- Revision de codigo automatizada: su entrenamiento agentico le permite analizar pull requests, detectar errores logicos y sugerir correcciones de forma autonoma.
- Chat tecnico y documentacion: su capacidad conversacional permite usarlo como copiloto para redactar documentacion, explicar fragmentos de codigo o responder preguntas sobre APIs.
- Prototipado rapido en entornos limitados: en maquinas sin GPU de datacenter, ofrece generacion de codigo de calidad suficiente para esbozar soluciones antes de refinarlas con modelos mayores.

## Benchmarks y rendimiento

| Benchmark | Resultado | Intervalo de confianza | Notas |
|---|---|---|---|
| SWE-bench Verified | 52,0% (26/50) | no publicado | Con mini-swe-agent bash-only, contexto 49K, step limit 65 |
| HumanEval+ | 89,0% | [83,3, 92,9] | Greedy, instruct framing |
| MBPP+ | 90,5% | [87,1, 93,0] | Greedy, instruct framing |
| Throughput | 149,5 tok/s (mediana, n=5) | — | 512 in / 256 out, batch 1, CUDA graphs |

Comparativa con el modelo base sin podar: Kwaipilot/KAT-Coder-V2.5-Dev logra 69,40% en SWE-bench Verified (segun el articulo de HackerNoon), frente al 52,0% de esta version podada y cuantizada. La perdida es notable, pero el tamano se reduce de 69,3 GB a 12,45 GiB.

## Requisitos de hardware

- VRAM minima: 12,45 GiB para el checkpoint, mas la KV cache; cabe en 16 GB de VRAM.
- GPU recomendada: RTX 5070 Ti (SM120, Blackwell). Requiere compute capability 12.0 para el kernel NVFP4.
- Sin CPU offload: carga completa en GPU con CUDA graphs, 28,9 segundos de tiempo de carga.
- Despliegue: vLLM (recomendado), tambien servible mediante FriendliAI; no se documenta soporte para llama.cpp u Ollama.
- Latencia: 149,5 tok/s de mediana en la configuracion de benchmark, adecuado para uso interactivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KAT-Coder-V2.5-Dev-REAP-50-NVFP4A16 | 18,5B (MoE podado) | 49K | 52,0% | Apache 2.0 | Hugging Face |
| Kwaipilot/KAT-Coder-V2.5-Dev (base) | 35B (MoE, 3B activos) | no publicado | 69,40% | Apache 2.0 | Hugging Face |
| Devstral Small (2512) | no publicado | no publicado | 56,4% (mismo scaffold) | no publicado | no publicado |

Nota: Devstral Small se menciona en la model card como referencia bajo el mismo scaffold, pero no se publican sus parametros ni licencia.

## Limitaciones y advertencias

- La poda al 50% de expertos reduce el rendimiento en SWE-bench Verified (52,0% vs 69,40% del base).
- El contexto maximo validado es 49K tokens; instancias que requieran mas contexto fallan (17/50 en la evaluacion).
- La cuantizacion NVFP4 requiere hardware Blackwell (SM120); no funciona en GPUs Ampere o anteriores sin soporte especifico.
- No se han publicado idiomas soportados; se asume que hereda del base Qwen, pero no es oficial.
- La torre de vision fue eliminada, por lo que no procesa imagenes.
- La configuracion del scaffold (kat_overrides_sota.yaml) es especifica para reproducir los resultados; cambios en sampling pueden degradar la puntuacion (se documento un regreso a 48,0% con presence_penalty/top_k).

## Enlaces

- Hugging Face: https://huggingface.co/Ttimms/KAT-Coder-V2.5-Dev-REAP-50-NVFP4A16
- GitHub del proyecto: https://github.com/t-timms/kat-coder-nvfp4
- Articulo sobre el modelo base: https://hackernoon.com/kat-coder-v25-dev-an-open-agentic-coding-model
- Paper REAP (Half the Experts, All the Code): https://arxiv.org/html/2607.16721
- Variante W4A4: https://huggingface.co/Ttimms/KAT-Coder-V2.5-Dev-REAP-50-NVFP4-W4A4
- Variante GGUF: https://huggingface.co/Ttimms/KAT-Coder-V2.5-Dev-REAP-50-GGUF
