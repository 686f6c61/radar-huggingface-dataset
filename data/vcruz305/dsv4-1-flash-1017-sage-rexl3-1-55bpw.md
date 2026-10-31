# vcruz305/DSV4.1-Flash-1017-SAGE-REXL3-1.55bpw

## Resumen

DeepSeek-V4.1-Flash-1017 — SAGE REXL3 1.55 bpw es una cuantización de la comunidad del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017, publicada por el usuario vcruz305 en Hugging Face. El pack utiliza el formato EXL3/REXL3 (trellis) cargable con la librería ExLlamaV3, y aplica un método propio de cuantización de precisión mixta llamado SAGE, que asigna distintos valores de compresión (`K` de EXL3) a cada tensor de expertos, leyéndose dichos valores directamente de cada tensor trellis durante la carga.

El objetivo del pack es permitir ejecutar un modelo MoE de más de 256.000 millones de parámetros totales en un único dispositivo de memoria unificada de clase 128 GB, con una huella residente de aproximadamente 108,5 GiB en modo texto y 109,4 GiB en modo VLM. La calidad de la cuantización se ha medido de forma exhaustiva frente a la versión oficial mixta FP8/FP4 de DeepSeek, obteniendo un 93,95% de acuerdo Top-1 y un 99,53% de acuerdo Top-5 a nivel de token, con una divergencia KL media de 0,1058 sobre el vocabulario completo de 129.280 tokens.

El modelo base es multimodal (pipeline image-text-to-text) y conversacional, con licencia MIT tanto en el original como en esta derivación, lo que lo hace especialmente relevante para despliegues locales de alto rendimiento sin restricciones de uso comercial. El repositorio tiene 17 shards de safetensors y un tamaño total de 320,3 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (deepseek_v41), multimodal (image-text-to-text) |
| Parámetros totales | 256.622.688.722 (dato real de safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el pack de evaluación incluye secuencias de 17.408 tokens, lo que sugiere soporte de contexto largo, pero no se publica la cifra oficial) |
| Tipos de cuantización | EXL3/REXL3 1,55 bpw con precisión mixta SAGE (valores K variables por tensor trellis); modelo base en FP8/FP4 mixto |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (17 shards, EXL3/REXL3 trellis), requiere ExLlamaV3 |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-V4.1-Flash-1017, es un modelo de mezcla de expertos (MoE) de la familia DeepSeek, con capacidades multimodales de entrada imagen-texto y salida texto. Sobre su entrenamiento (número de tokens, composición del dataset, RLHF/DPO) no se ha publicado información en la model card de este pack, por lo que esos datos no están disponibles aquí.

La innovación principal de este repositorio no está en la arquitectura del modelo sino en la cuantización: SAGE es un método de precisión mixta para EXL3 en el que cada tensor trellis utiliza un valor de compresión `K` distinto, optimizado por tensor, y los kernels de ExLlamaV3 leen el `K` de cada tensor al cargar. Esto permite alcanzar una tasa media de 1,55 bits por peso manteniendo una fidelidad muy alta frente a la referencia oficial FP8/FP4: la medición se realizó con divergencia KL float64 sobre el vocabulario completo (129.280 tokens) en secuencias held-out, incluyendo un split de contexto largo de 17.408 tokens (`long17k`), con resultados especialmente sólidos en código (98,91% Top-1) y razonamiento (95,86% Top-1).

## Capacidades

- Generación de texto conversacional (pipeline tag: conversational).
- Comprensión multimodal imagen-texto a texto (pipeline tag: image-text-to-text); la huella residente en modo VLM (~109,4 GiB) confirma que el pack incluye los componentes de visión.
- Generación y comprensión de código: es la categoría con mejor fidelidad de cuantización (99,53% Top-1 en respuestas, KL medio de 0,0054).
- Razonamiento: categoría con el segundo mejor acuerdo (95,86% Top-1, KL medio 0,0370).
- Matemáticas: acuerdo Top-1 del 94,38% con la referencia oficial.
- Manejo de contexto largo: la evaluación `long17k` verifica la calidad en secuencias de 17.408 tokens con un acuerdo Top-1 del 92,18%.
- Soporte de tool calling, agentes y modo thinking: no disponible en la información proporcionada (depende del modelo base, cuya documentación no está incluida en la model card).

## Casos de uso

- Ejecución local en estaciones de trabajo con memoria unificada de 128 GB: el pack está dimensionado específicamente para caber íntegramente en GPU en dispositivos como Mac Studio de 128 GB o plataformas equivalentes de memoria unificada, evitando el offloading a CPU y sus penalizaciones de latencia.
- Asistentes de código locales y privados: la fidelidad casi perfecta en la categoría de código (99,53% Top-1 en respuestas, KL medio de 0,0054) lo hace adecuado para autocompletado, revisión y refactorización de código sin enviar el repositorio a la nube.
- Razonamiento y análisis técnico: el buen acuerdo en la categoría de razonamiento (95,86% Top-1) permite usarlo para análisis de documentos técnicos y cadenas de razonamiento multi-paso.
- Procesamiento de documentos largos: la evaluación a 17.408 tokens con ΔPPL negativo (-0,1466 respecto al profesor) indica que la cuantización degrada incluso menos que la referencia en contexto largo, útil para resumen y consulta de documentos extensos.
- Aplicaciones multimodales on-premise: al conservar el componente VLM (~109,4 GiB), puede emplearse en flujos de descripción de imágenes, OCR asistido y análisis visual donde la privacidad de los datos es crítica.
- Investigación en cuantización: la publicación detallada de métricas KL por categoría y split convierte el pack en una referencia útil para comparar métodos de cuantización de precisión mixta en modelos MoE grandes.
- Chatbots autoalojados con licencia MIT: al no existir restricciones de licencia, puede integrarse en productos comerciales sin obligaciones de atribución más allá de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Lo que sí se publica es una evaluación de fidelidad de la cuantización frente a la versión oficial FP8/FP4 del modelo base, con divergencia KL float64 sobre el vocabulario completo (129.280 tokens) y acuerdo de tokens en secuencias held-out:

| Evaluación | Tokens | Top-1 Agreement | Top-5 Agreement | KL media | KL p50 | Profesor PPL | Estudiante PPL | ΔPPL |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| e2e_eval (Assistant Turn) | 21.458 | 93,95% | 99,53% | 0,1058 | 0,000163 | 1,8575 | 1,8653 | +0,0078 |
| e2e_eval (All Tokens) | 32.760 | 91,87% | 98,48% | 0,2083 | 0,000276 | 2,3394 | 2,2861 | -0,0533 |
| e2e_eval — code (Answer Only) | 3.605 | 99,53% | 100,00% | 0,0054 | 0,000001 | 1,0918 | 1,0751 | -0,0167 |
| e2e_eval — reasoning (Assistant Turn) | 5.174 | 95,86% | 99,83% | 0,0370 | 0,000455 | 1,8935 | 1,8927 | -0,0008 |
| e2e_eval — math (Assistant Turn) | 4.434 | 94,38% | 99,59% | 0,0718 | 0,000398 | 2,0755 | 2,0063 | -0,0692 |
| e2e_eval — general (Assistant Turn) | 7.264 | 89,19% | 99,08% | 0,2317 | 0,001288 | 2,1814 | 2,2891 | +0,1077 |
| long17k (17.408 tok, All Tokens) | 17.407 | 91,38% | 98,60% | 0,2477 | 0,000205 | 2,3168 | 2,1702 | -0,1466 |
| wiki1100 (Answer Only) | 718 | 91,09% | 99,03% | 0,1998 | 0,000572 | 1,3835 | 1,4765 | +0,0930 |

## Requisitos de hardware

- Huella residente en GPU: ~108,5 GiB en modo texto y ~109,4 GiB en modo VLM; el pack está diseñado para dispositivos de memoria unificada de clase 128 GB.
- En GPUs convencionales con VRAM discreta (RTX 4090 de 24 GB, RTX 5090 de 32 GB, A100 de 80 GB) no cabe en una sola unidad; sería necesario multi-GPU (por ejemplo, 2x A100/H100 de 80 GB) o soporte de memoria unificada.
- Alternativa realista: Apple Silicon (Mac Studio M3 Ultra de 128 GB o superior) u otras plataformas de memoria unificada, donde el modelo se ejecuta residente en GPU vía ExLlamaV3 (según la model card, el pack es cargable por ExLlamaV3).
- Framework de inferencia: ExLlamaV3 (https://github.com/turboderp-org/exllamav3); no es un pack GGUF, por lo que llama.cpp, Ollama, vLLM y TGI no son aplicables directamente.
- Latencia y throughput: no disponible en la información proporcionada.
- Espacio en disco: 320,3 GB de repositorio (17 shards safetensors más índice).

## Comparativa con modelos similares

| Modelo | Parámetros totales | Cuantización | Huella residente | Formato | Licencia |
|---|---|---|---|---|---|
| Este pack (DSV4.1-Flash-1017 SAGE REXL3 1.55 bpw) | 256.622.688.722 | EXL3/REXL3 1,55 bpw (SAGE mixed-K) | ~108,5 GiB (texto) | safetensors (ExLlamaV3) | MIT |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (oficial) | no disponible | FP8/FP4 mixto nativo | no disponible | no disponible | MIT (según tags del derivado) |
| Alternativas comparables de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: al tratarse de un modelo base de la serie DeepSeek V4.1-Flash con fecha reciente, no se dispone en la información proporcionada de alternativas con specs verificables; no se publican datos comparables y no se inventan cifras.

## Limitaciones y advertencias

- Cuantización agresiva: a 1,55 bpw, la categoría "general" muestra el mayor desvío (KL medio 0,2317, Top-1 del 89,19% y ΔPPL de +0,1077), por lo que en tareas de generación general puede haber divergencias perceptibles respecto a la versión oficial.
- Riesgo de alucinación: inherente a cualquier LLM; además, una cuantización extrema puede acentuar desviaciones en tokens de baja probabilidad, aunque la medición del pack (KL p50 muy baja, del orden de 0,0001-0,002) sugiere que la mayoría de tokens son prácticamente idénticos a la referencia.
- Requisito de hardware muy elevado: solo es viable en dispositivos de ~128 GB de memoria unificada o multi-GPU de gama datacenter; no es accesible para GPUs de consumo.
- Compatibilidad de software limitada: requiere ExLlamaV3 con soporte REXL3; no funciona con stacks estándar como vLLM, TGI o llama.cpp.
- Datos incompletos del modelo base: parámetros activos, longitud de contexto oficial, idiomas soportados y detalles de entrenamiento no están disponibles en la model card; conviene consultar la ficha oficial de deepseek-ai/DeepSeek-V4.1-Flash-1017 antes de producción.
- Licencia: MIT, sin restricciones conocidas para uso comercial, pero el pack es una cuantización de terceros (vcruz305) con 0 descargas registradas en el momento de la ficha, sin historial de adopción ni auditoría comunitaria.
- Sesgos conocidos: no disponible en la información proporcionada.

## Enlaces

- Ficha del pack cuantizado: https://huggingface.co/vcruz305/DSV4.1-Flash-1017-SAGE-REXL3-1.55bpw
- Modelo base oficial: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Autor de la cuantización: https://huggingface.co/vcruz305
- Librería ExLlamaV3: https://github.com/turboderp-org/exllamav3
