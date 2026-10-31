# trubisky/Swift-1.5-Flash-Next-Heretic-ReverseEngineer

## Resumen

Swift-1.5-Flash-Next-Heretic-ReverseEngineer es una cuantización GGUF del modelo Swift-1.5-Qwen3.8-Flash-Next-heretic, un modelo multimodal (texto e imagen a texto) basado en arquitectura MoE de la familia Qwen, con 176.943.899.520 parámetros totales. La versión base "heretic" es una variante abliterated (sin comportamiento de rechazo) desarrollada por jeffpeng3, que según el autor preserva a la vez la capacidad de razonamiento y la longitud de salida tras eliminar los refusals, algo habitualmente difícil de compatibilizar. Esta cuantización, creada por trubisky, está afinada específicamente para tareas de ingeniería inversa, programación y razonamiento espacial.

La relevancia de esta ficha radica en su metodología de cuantización: se trata de una receta dinámica mixta con matriz de importancia (imatrix) construida a medida, con categorías dedicadas a razonamiento en cadena, uso agéntico de herramientas y un dominio específico de ingeniería inversa (desensamblado x86-64/ARM64, crítica de decompilación de Ghidra, análisis de ELF/PE/Mach-O, etc.). Los pesos se distribuyen asignando más bits a las capas con mayor energía de activación, con el objetivo de ajustarse exactamente a 96 GB de VRAM en una configuración de 3× V100 de 32 GB bajo el motor Strata.

Es un modelo sin censura: el comportamiento de rechazo se ha eliminado deliberadamente, por lo que su uso conlleva responsabilidades legales y éticas para el usuario final.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basado en Qwen 3.8 (transformer, 48 capas), multimodal (image-text-to-text) |
| Parametros totales | 176.943.899.520 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la receta de cuantización asume prefill batching de 8192 tokens, pero no es el límite del modelo) |
| Tipos de cuantizacion | IQ4_NL (receta mixta personalizada, ~108,9 GB), IQ4_XS-plus (receta unsloth UD-IQ4_XS + KL step-ups, 94,7 GB), IQ3_S-85G (receta mixta clase IQ3_S, ~84,6 GB, 3,36 bpw de masa experta) |
| Idiomas soportados | inglés, chino (en, zh) |
| Licencia | swift-open-license-1.0 (tipo "other"; licencia base en el repositorio ukisai/Swift1.5-Qwen3.8-Flash-Next) |
| Formato de pesos | GGUF (shards multi-archivo), con pack de runtime Strata (dense.bin, index.txt, native_experts.txt, conversions.json, compat-bf16.json, tokenizer) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) de la línea Qwen 3.8 con 48 capas y aproximadamente 177 mil millones de parámetros totales, con capacidades de visión integradas (pipeline image-text-to-text, lo que implica un proyector de visión o `mmproj` aparte de los pesos de lenguaje). El número de expertos activos por token no está disponible en la información proporcionada.

Sobre el modelo base no se detallan datos de entrenamiento (tokens, composición del dataset, RLHF/DPO). Lo que sí está documentado es el proceso post-entrenamiento de abliteration ("heretic") realizado por jeffpeng3 en su versión v2, que elimina el comportamiento de rechazo intentando preservar razonamiento y longitud de salida, y la metodología de cuantización de trubisky: una receta dinámica inspirada en el Q4_K_XL de Unsloth y en datos públicos de ISTA-DASLab y AtomicChat, que asigna bits de forma no uniforme según auditorías de energía de activación. Las capas 36–47 (más las 5 primeras y picos intermedios en 15/20/23/30) reciben proyecciones down a casi 8 bits, y las capas 44–46 reciben proyecciones gate/up reforzadas por ser el pico de energía (8× frente a capas tempranas; la capa 47 es el tensor más caliente de la red, con 48× la energía de la capa 2).

La imatrix se construyó con 837 entradas y 399.876 tokens en formato nativo de chat de Qwen (`<|im_start|>`), fusionada con una matriz de AtomicChat tomada sobre el modelo base sin comprimir: 70 % de peso para la matriz propia donde hay datos y deslizamiento hacia 100 % AtomicChat en canales poco muestreados (la variante IQ3_S-85G usa una fusión 80/20).

## Capacidades

- Generación de texto y razonamiento: la imatrix dedica un 22,2 % del corpus a cadena de razonamiento (derivaciones paso a paso, autoverificación, backtracking) y un 4,5 % a "gotchas" (premisas falsas, negaciones).
- Código y diseño de software: 13,5 % del corpus a decisiones de diseño, revisión de código, planificación de APIs y refactorización.
- Ingeniería inversa (capacidad destacada de esta edición): desensamblado x86-64/ARM64, crítica de decompilados de Ghidra, formatos ELF/PE/Mach-O, anti-debug/anti-VM, deofuscación de cadenas, deflattening de CFG, devirtualización, tracing con LD_PRELOAD/Frida/eBPF, análisis de firmware y protocolos.
- Razonamiento matemático: 7,1 % del corpus a aritmética, álgebra, demostraciones y manipulación simbólica.
- Razonamiento espacial: 5,4 % dedicado a rejillas, transformaciones 2D/3D, coordenadas y empaquetado, orientado a entornos 3D.
- Uso agéntico: 12,4 % del corpus a cadenas de tool calling, bucles de edición de ficheros, recuperación de errores y function calling.
- Cumplimiento de instrucciones: 19,5 % a system prompts, adherencia a personas y formatos de salida estrictos.
- Visión: pipeline image-text-to-text, admite entrada de imagen (detalles del proyector no disponibles).
- Multilingüe: inglés y chino.
- Sin censura: responde directamente a consultas que el modelo base rechazaría (el 2 % del corpus es dominio herético de respuestas directas).

## Casos de uso

- Análisis de binarios y malware: el modelo puede criticar decompilados de Ghidra, identificar técnicas anti-debug/anti-VM y analizar estructuras internas de ELF/PE/Mach-O, gracias a la categoría específica de ingeniería inversa en la imatrix.
- Deofuscación y devirtualización: ayuda a deshacer ofuscación de cadenas, aplanamiento de grafos de control (CFG deflattening) y devirtualización de código protegido.
- Tracing dinámico: asistencia en el diseño de stacks de tracing con LD_PRELOAD, Frida o eBPF y en el análisis de protocolos de comunicación.
- Asistente de programación y revisión de código: la asignación de bits favorece las capas asociadas a tareas de código y diseño, siendo adecuado para revisión, refactorización y planificación de APIs en flujos de trabajo de desarrollo.
- Agentes con herramientas: soporte de cadenas de tool calling y bucles de edición de ficheros con recuperación de errores, útil en pipelines de automatización y agentes multi-paso.
- Razonamiento matemático y simbólico: resolución de problemas de álgebra y demostraciones trabajadas paso a paso.
- Trabajo en entornos 3D: razonamiento espacial para coordenadas, transformaciones 2D/3D y problemas de empaquetado.
- Despliegue en estaciones de trabajo multi-GPU: las variantes IQ4_XS-plus (94,7 GB) e IQ3_S-85G (84,6 GB) están pensadas para rigs de 3× V100 de 32 GB (96 GB de VRAM) con margen para el proyector de visión y KV streaming.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los pesos v2 "aguantaron bien bajo medición" respecto a la v1, pero no incluye números concretos de MMLU, HumanEval, GSM8K ni otras métricas.

## Requisitos de hardware

- IQ4_NL (~108,9 GB en 8 shards): no cabe en 96 GB de VRAM; requiere aproximadamente 128 GB de VRAM o descarga parcial a RAM/CPU offload.
- IQ4_XS-plus (94,7 GB en 6 shards): diseñado para caber exactamente en 96 GB de VRAM (3× V100 de 32 GB) con headroom para el mmproj, prefill batching de 8192 tokens y KV streaming.
- IQ3_S-85G (~84,6 GB en 8 shards): alternativa de menor precisión para el mismo rig de 96 GB, con más margen libre.
- GPUs recomendadas: V100 de 32 GB (caso de uso explícito del repo); por tamaño, alternativas serían A100/H100 de 80 GB en configuración multi-GPU (no confirmado por el autor).
- No cabe en GPUs de consumo individuales (ni siquiera una RTX 4090 de 24 GB); se necesitarían varias GPUs de consumo con tensor parallel o offload a CPU, con penalización de latencia.
- Despliegue: motor Strata (se incluye un pack de runtime precompilado, `strata-pack-heretic-v2-70g-fix.zip`, con dense.bin, index.txt, native_experts.txt, conversions.json y compat-bf16.json); al ser GGUF, en principio es compatible con llama.cpp y derivados como Ollama, aunque el repo está optimizado para Strata. No se menciona soporte de vLLM ni TGI para estos GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Cuantizacion destacada | Licencia | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Flash-Next-Heretic-ReverseEngineer (este) | 176,9 B (MoE) | Multimodal, abliterated | IQ4_NL / IQ4_XS-plus / IQ3_S-85G personalizadas | swift-open-license-1.0 | Afinado a ingeniería inversa; sin censura |
| Qwen3-235B-A22B (referencia de familia) | 235 B (MoE, ~22 B activos) | Texto | GGUF oficial (Q4_K_M, etc.) | Apache 2.0 | Mayor, con benchmarks publicados, pero censurado y sin afinado a RE |
| Llama 3.3 70B Instruct | 70 B (denso) | Texto | GGUF (~40 GB en Q4) | Llama Community License | Cabe en menos hardware, multimodalidad limitada |

La comparativa es orientativa: no hay datos de rendimiento publicados para este modelo que permitan una comparación numérica directa.

## Limitaciones y advertencias

- Modelo sin censura: el comportamiento de rechazo se ha eliminado deliberadamente. La imatrix incluye contenido de explotación de ELF, inyección de procesos contra EDR, parcheo de comprobaciones de licencia e ingeniería de protocolos C2. El usuario es el único responsable del uso y debe cumplir la ley aplicable y la licencia.
- Riesgo de alucinación: no evaluado públicamente; al tratarse de una variante abliterated, los mecanismos de alineación que también mitigaban ciertas salidas incorrectas pueden estar degradados.
- La abliteration puede degradar capacidades generales; el autor afirma que la v2 preserva razonamiento y longitud de salida, pero no hay benchmarks que lo verifiquen.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Requisitos de hardware muy elevados: mínimo ~95 GB de VRAM para las variantes más compactas; no viable en GPUs de consumo individuales.
- Licencia swift-open-license-1.0 de tipo "other": hay que revisar las condiciones exactas en el enlace de licencia antes de cualquier uso comercial; no se confirma permiso comercial explícito en la información disponible.
- El número de parámetros activos, la longitud de contexto máxima y los datos de entrenamiento del modelo base no están disponibles.
- La cuantización IQ3_S-85G usa una fusión de imatrix distinta (80/20), por lo que su calidad relativa puede diferir de las variantes IQ4.

## Enlaces

- Modelo cuantizado: https://huggingface.co/trubisky/Swift-1.5-Flash-Next-Heretic-ReverseEngineer
- Modelo base (heretic v2): https://huggingface.co/jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic
- Licencia: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next/blob/main/LICENSE
- Autor del quant (trubisky): https://huggingface.co/trubisky
- Colaborador (jeffpeng3): https://huggingface.co/jeffpeng3
