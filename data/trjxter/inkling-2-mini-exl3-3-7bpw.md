# trjxter/Inkling-2-Mini-EXL3-3.7bpw

## Resumen

Inkling-2-Mini-EXL3-3.7bpw es una cuantización de precisión mixta en formato EXL3 (codebook `mul1`, 3,697 bpw de media) del modelo `thinkingmachines/Inkling-2-Mini`, publicado por el usuario trjxter. El objetivo declarado es hacer viable la inferencia del modelo base en GPUs de 16 GB de VRAM, con contexto largo (120K tokens en GPU pura y 256K con offload parcial a CPU) y decodificación especulativa DSpark incluida en BF16. El checkpoint se ha construido y validado sobre ROCm en una AMD RX 7800 XT mediante el runtime EXL3-AMD.

El modelo base, publicado por Thinking Machines Lab el 20 de noviembre de 2026, es un transformer disperso de tipo Mixture-of-Experts (MoE) con arquitectura de capas en bucle (looped transformer) de 26.400 millones de parámetros totales. Solo 3.400 millones se activan por pasada, y el bucle de las 12 capas centrales eleva el cómputo efectivo a unos 5.400 millones de parámetros activos por token. Está diseñado para flujos de trabajo agénticos: uso de herramientas, búsqueda, razonamiento y contexto largo de hasta 1M de tokens.

La relevancia de esta ficha reside en que la cuantización reduce el peso del decodificador de texto a 12,23 GiB (más 0,59 GiB del drafter DSpark), con una fidelidad medida de 0,02560 de KLD medio frente al BF16 dequantizado y un 95,92 % de acuerdo top-1 (97,39 % en código). Es, por tanto, una opción práctica para desplegar un modelo MoE de 26,4B con contexto largo en hardware de consumo, a costa de renunciar al codificador de visión del checkpoint multimodal original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso con capas en bucle (looped transformer); 24 capas físicas y 48 pasadas lógicas |
| Parametros totales | 6.565.424.256 (checkpoint cuantizado); modelo base: 26,4B |
| Parametros activos | 3,4B por pasada; ~5,4B efectivos por token con el bucle (dato del modelo base) |
| Longitud de contexto | Hasta 1M tokens en el modelo base; 120K en GPU pura y 256K con offload de 2 capas a CPU en esta cuantización |
| Tipos de cuantizacion | EXL3 `mul1` de precisión mixta: 8 bpw en atención y `lm_head`, 3 bpw en expertos L0–11, 4 bpw en expertos L12–17, 3 bpw en cola L18–23; drafter DSpark en BF16 sin cuantizar |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3, 4 shards de texto) + `mtp.safetensors` (BF16) |

## Arquitectura y entrenamiento

El modelo base es un MoE de 128 expertos enrutados por capa con top-8 routing y `route_scale` de 8,0, activaciones SwiGLU con softcap (`gate_cap` 4,0, `up_cap` 25,0). La innovación estructural es el bucle: las capas 0–5 se ejecutan una vez, las 12 capas centrales (L6–17) se ejecutan tres veces con pesos compartidos y las capas 18–23 una vez, lo que añade aproximadamente 1.000 millones de parámetros de cómputo efectivo por pasada extra. La atención es híbrida: solo 4 capas físicas (L5, L11, L17, L23, equivalentes a 8 visitas lógicas globales más una capa global en DSpark) usan atención completa, mientras que las 40 capas lógicas restantes emplean atención de ventana deslizante de 1.024 tokens con anillos SWA, lo que mantiene un coste de VRAM de unos 0,34 GiB constante independientemente de la longitud de contexto. Con KV cache cuantizada AsterKV-5 o Q4, 120K de contexto ocupan unos 1,94 GiB y 256K unos 3,07 GiB.

Entre los mecanismos adicionales destacan las residuales de atención por bloques (6 capas por bloque), controladores de mensaje entre pasadas del bucle de rango 64, convoluciones causales cortas estáticas y dinámicas (kernel 4), clipping L2 de QK/Rel con log-scaling, sesgo de posición relativa dependiente de datos (`rel_extent` 1024) y attention sinks por token. El drafter DSpark es una cabeza de borrador multi-token de 3 capas en BF16 que consume estados ocultos de las capas [5, 23, 41, 48] y usa una cabeza de Markov de rango 256 para decodificación especulativa sin pérdida. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés con ventanas de contexto de hasta 120K tokens en GPU pura y 256K con offload parcial.
- Razonamiento multi-paso y resolución de tareas complejas, con benchmarks upstream de ARC-AGI v1 del 84,5 % y v2 del 49,3 %.
- Programación y tareas de ingeniería de software: SWE-bench Verified 79,2 %, SWE-bench Pro v2 Hard 77,9 %, SWE-bench Multilingual 73,7 %.
- Uso de herramientas y function calling, con MCP Atlas del 82,7 % y Terminal Bench v2.1 del 71,6 %.
- Búsqueda agéntica y navegación: DeepSearchQA 85,3 %, BrowseComp 79,0 %.
- Razonamiento sobre contexto largo: GraphWalks BFS a 256K del 69,7 %, LongBench v2 del 66,9 %, MRCR v2 (8 agujas, 256K–512K) del 46,4 %.
- Decodificación especulativa nativa mediante el drafter DSpark incluido, que acelera la generación sin degradar la distribución de salida.
- Capacidades multimodales de visión en el modelo base original, no incluidas en este checkpoint cuantizado (solo se empaqueta el decodificador de texto `model.llm`).

## Casos de uso

- Agente de programación en local: el modelo puede integrarse en un bucle agéntico que ejecute comandos de shell, edite ficheros y valide resultados, apoyándose en su 79,2 % en SWE-bench Verified y en el soporte de tool calling para operar sobre repositorios reales sin depender de la nube.
- Asistente de atención al cliente con historial largo: con 120K tokens de contexto en una GPU de 16 GB, puede mantener conversaciones multi-turno con documentación extensa adjunta y KV cache de solo 1,94 GiB, lo que permite desplegarlo en una estación de trabajo.
- Análisis de repositorios y bases de código completas: la ventana de 256K con offload permite cargar varios módulos y ficheros de configuración en una sola pasada para tareas de revisión, refactorización o generación de pruebas, con un 73,7 % en SWE-bench Multilingual.
- Búsqueda agéntica y respuesta sobre fuentes: con DeepSearchQA del 85,3 % y BrowseComp del 79,0 %, es adecuado para pipelines que consultan APIs, motores de búsqueda o bases documentales y sintetizan la respuesta con citas.
- Automatización de operaciones en terminal: Terminal Bench v2.1 del 71,6 % respalda su uso en agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos Linux, integrándose en scripts de CI/CD o tareas de mantenimiento.
- Extracción y razonamiento sobre documentos largos: con LongBench v2 del 66,9 % y GraphWalks BFS a 256K del 69,7 %, sirve para resumir contratos, informes técnicos o expedientes que superan ampliamente el contexto de modelos densos de tamaño similar.
- Prototipado en hardware AMD de consumo: al estar validado sobre ROCm en una RX 7800 XT con 61,2 tok/s a 8K y 56,1 tok/s a 120K, es una opción para desarrolladores que trabajan con GPUs AMD y quieren evitar depender de CUDA.

## Benchmarks y rendimiento

Los siguientes resultados los reporta Thinking Machines Lab para el modelo base `thinkingmachines/Inkling-2-Mini`. No se han vuelto a ejecutar de forma independiente sobre esta cuantización EXL3.

| Categoria | Benchmark | Inkling 2 Mini (upstream) |
|---|---|---|
| Codigo y SWE | SWE-bench Verified (solo bash) | 79,2 % |
| | SWE-bench Pro v2 (Hard) | 77,9 % |
| | SWE-bench Multilingual (solo bash) | 73,7 % |
| | Vibe Code Bench v1.1 | 77,9 % |
| | DeepSWE v1.1 | 48,2 % |
| | Terminal Bench v2.1 | 71,6 % |
| Busqueda agentica y herramientas | DeepSearchQA | 85,3 % |
| | MCP Atlas (publico) | 82,7 % |
| | BrowseComp | 79,0 % |
| Contexto largo y razonamiento | GraphWalks BFS (256K) | 69,7 % |
| | LongBench v2 | 66,9 % |
| | MRCR v2 (8 agujas, 256K–512K) | 46,4 % |
| | ARC-AGI v1 / v2 | 84,5 % / 49,3 % |
| | AA Index (v5.0) / Vals Index (v2.2) | 20,1 / 46,5 % |

Métricas de fidelidad y velocidad medidas por el autor de la cuantización:

| Metrica | Valor |
|---|---|
| KLD medio frente a BF16 dequantizado | 0,02560 |
| Acuerdo top-1 | 95,92 % (97,39 % en código) |
| Velocidad en RX 7800 XT (16 GB), 8K, GPU pura | 61,2 tok/s |
| Velocidad a 120K, GPU pura | 56,1 tok/s (prefill 826 tok/s) |
| Velocidad a 256K con offload de 2 capas | 32,7 tok/s (prefill 699 tok/s) |

## Requisitos de hardware

- VRAM para inferencia: 12,23 GiB de pesos EXL3 más 0,59 GiB del drafter DSpark, es decir, 12,82 GiB en total; con KV cache AsterKV-5 o Q4, 120K de contexto requieren unos 1,94 GiB y 256K unos 3,07 GiB, lo que deja margen en tarjetas de 16 GB.
- GPU recomendadas: AMD RX 7800 XT de 16 GB (validada por el autor); cualquier GPU AMD con 16 GB o más y soporte ROCm a través de EXL3-AMD. Para 256K sin offload se necesita más de 16 GB. El autor planea una variante de mayor tasa de bits (atención FP16, núcleo a 4 bpw y cola a 6 bpw) para GPUs de 24 GB o más.
- GPU de consumo: sí, cabe en tarjetas de 16 GB como la RX 7800 XT; en el segmento NVIDIA no hay validación reportada en la información disponible.
- Opciones de despliegue: runtime EXL3-AMD sobre ROCm (repositorio github.com/RishiJain905/EXL3-AMD) con la librería `exllamav3`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 61,2 tok/s a 8K, 56,1 tok/s a 120K con prefill de 826 tok/s y 32,7 tok/s a 256K con offload de 2 capas y prefill de 699 tok/s, medidos en RX 7800 XT.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Cualitativamente, la alternativa más directa es el propio modelo base `thinkingmachines/Inkling-2-Mini` en su formato original (NVFP4/MXFP8, unos 20 GB), que conserva el codificador de visión y mayor precisión numérica pero no cabe en 16 GB. Frente a modelos densos de tamaño similar, la ventaja de Inkling 2 Mini es su relación entre parámetros activos (3,4B por pasada) y rendimiento agéntico, junto con el contexto de hasta 1M tokens del modelo base.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-2-Mini-EXL3-3.7bpw | 6,57B en checkpoint (26,4B base) | 120K GPU pura / 256K con offload | Apache 2.0 | Hugging Face, runtime EXL3-AMD |
| thinkingmachines/Inkling-2-Mini | 26,4B (3,4B activos) | hasta 1M | Apache 2.0 | Hugging Face |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cuantización EXL3 a 3,697 bpw introduce una degradación medible: KLD medio de 0,02560 y un 4,08 % de desacuerdo top-1 global (2,61 % en código). Para tareas de alta precisión numérica conviene validar contra el modelo base.
- Solo se incluye el decodificador de texto; el codificador de visión del checkpoint multimodal original no está empaquetado, por lo que no hay capacidades de imagen en esta release.
- El modelo solo declara soporte de inglés; no se garantiza un rendimiento fiable en castellano u otros idiomas.
- El formato EXL3 requiere el runtime EXL3-AMD sobre ROCm; no es compatible con ecosistemas estándar como llama.cpp, Ollama o vLLM según la información disponible, lo que limita la portabilidad.
- Los benchmarks reportados corresponden al modelo base y no han sido reejecutados sobre esta cuantización, por lo que las cifras reales pueden diferir.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de búsqueda y razonamiento sobre contexto largo (MRCR v2 cae al 46,4 % en el rango 256K–512K), donde la recuperación de información distante es menos fiable.
- El rendimiento a 256K depende del offload de 2 capas a CPU, lo que reduce la velocidad a 32,7 tok/s y añade latencia frente a la inferencia pura en GPU.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene revisar los términos del modelo base y las dependencias del runtime EXL3-AMD antes de desplegar en producción.
- No se han publicado análisis de sesgos específicos para esta cuantización en la información disponible.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/trjxter/Inkling-2-Mini-EXL3-3.7bpw
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Runtime EXL3 para AMD (ROCm): https://github.com/RishiJain905/EXL3-AMD
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
