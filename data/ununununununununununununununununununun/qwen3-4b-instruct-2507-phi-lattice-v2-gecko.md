# ununununununununununununununununununun/qwen3-4b-instruct-2507-phi-lattice-v2-gecko

## Resumen
`qwen3-4b-instruct-2507-phi-lattice-v2-gecko` es un archivo cuantizado a 4 bits del modelo `Qwen/Qwen3-4B-Instruct-2507` de Alibaba Qwen, publicado por el usuario `ununununununununununununununununununun`. No es un modelo entrenado desde cero ni un fine-tuning: es una compresión del checkpoint original mediante un método propietario denominado "phi-lattice" en su variante "gecko", que empaqueta las 252 capas lineales de los 36 bloques del transformer en nibbles `uint8` de 4 bits con escalas `fp16` por grupo (`group_size=64`).

La relevancia del artefacto es que reduce el peso de 7.671,6 MiB en BF16 a 2.583,2 MiB (2,97×), manteniendo las métricas downstream dentro de un margen estadísticamente indistinguible de `Q4_K_M` de llama.cpp, el estándar de facto de la cuantización a 4 bits. El autor publica además una variante por defecto con "cashback embeddings" que baja a 2.235 MiB reparando la pérdida de calidad de la cuantización del embedding mediante dos flujos residuales.

El modelo base Qwen3-4B-Instruct-2507 es un transformer denso de 4.000 millones de parámetros con contexto largo y modo instruct, orientado a conversación, razonamiento y código. La licencia del artefacto es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), 36 bloques, 252 capas lineales cuantizadas |
| Parametros totales | 4.000 millones (modelo base Qwen3-4B-Instruct-2507) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits empaquetado (nibbles `uint8` + escalas `fp16`, `group_size=64`); embeddings y RMSNorm en `bfloat16`; variante con cashback embeddings en dos flujos de 4 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `transformers`; archivo `.pt` empaquetado (`qwen3_4b_phi_gecko_v2_packed_4bit.pt`, `qwen3_4b_phi_v2_cashback_packed_4bit.pt`) |

## Arquitectura y entrenamiento
El modelo subyacente es un transformer decoder-only denso de Qwen3 con 36 bloques. El artefacto no introduce cambios arquitectónicos: sustituye los pesos de las 252 capas lineales por una representación de 4 bits con escalas por grupo de 64 elementos, manteniendo embeddings y RMSNorm en `bfloat16` (398 tensores en total, carga `strict=True` con 0 claves ausentes). El 12,52 % de los pesos lineales cuantizados son ceros exactos.

La innovación del método "gecko" es una pasada de cuantización que aplica una métrica espectral con `alpha=0.5` sobre bloques de 64, en el mismo layout que la variante `phi-lattice v2`. Según el autor, esta pasada reduce la penalización de perplejidad de la cuantización un 26,3 % (de 14,72 a 14,05 frente a la línea base BF16 de 12,17) con un SNR de pesos de 19,25 dB frente a 19,63 dB de la variante plana. La cuantización completa tarda 198 s en una GPU L4 para las 252 capas.

La variante por defecto ("cashback embeddings") añade un segundo flujo de 4 bits para el embedding de tokens, de modo que la suma desempaquetada reconstruye el embedding BF16 con 39,28 dB de SQNR (de 742 a 394 MiB). Un único flujo de 4 bits sin el residual rompe el modelo (PPL de 7,395 a 7,712). No se documenta el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la información proporcionada.

## Capacidades
- Generación de texto conversacional y modo instruct, heredados de Qwen3-4B-Instruct-2507.
- Razonamiento y matemáticas: GSM8K con 85,06 % de `exact_match` estricto, prácticamente idéntico al BF16 (85,90 %).
- Conocimiento general: MMLU del 69,02 % (grupo, 14.042 ítems).
- Seguimiento de instrucciones: IFEval con 46,95 % estricto a nivel de prompt y 61,03 % a nivel de instrucción.
- Comprensión lectora y sentido común: HellaSwag con 51,04 % `acc` y 67,36 % `acc_norm`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso
- Despliegue en GPU de consumo: con 2.583,2 MiB (o 2.235 MiB en la variante cashback), el archivo cabe en GPUs de 8 GB o menos, permitiendo servir Qwen3-4B-Instruct-2507 en estaciones de trabajo sin GPU de datacenter.
- Evaluación comparativa de cuantizadores: el autor publica los JSON de `lm-eval` y un benchmark paralelo de `Q4_K_M`, lo que permite reproducir la comparación entre el códec phi-lattice y llama.cpp con el mismo motor de evaluación.
- Investigación en compresión de pesos: el método gecko (métrica espectral, `alpha=0.5`, bloques de 64) y la técnica de cashback embeddings son reproducibles y sirven como línea base para estudiar cuantización de 4 bits con preservación de SNR.
- Fine-tuning ligero sobre el archivo empaquetado: la carga `strict=True` con 0 claves ausentes facilita adaptar el modelo a dominios concretos partiendo de la representación comprimida, con menor huella de memoria que el checkpoint BF16.
- Prototipado de asistentes conversacionales: el modelo base está orientado a instrucciones y conversación, por lo que el archivo sirve para validar flujos de chat multi-turno en entornos con VRAM limitada.
- Inferencia en pipelines de CI: el tamaño reducido y la licencia Apache 2.0 permiten incluirlo en pruebas automatizadas de calidad de generación sin aprovisionar GPUs grandes.

## Benchmarks y rendimiento

| Tarea | Métrica | BF16 base | phi-lattice v2 (plano) | v2-gecko (este repo) | Q4_K_M (llama.cpp) |
|---|---|---:|---:|---:|---:|
| MMLU (14.042) | acc (grupo) | 70,63 % | 68,06 % | 69,02 % | 69,40 % |
| GSM8K (1.319) | exact_match estricto | 85,90 % | 83,93 % | 85,06 % | 84,84 % |
| GSM8K (1.319) | exact_match flexible | 83,85 % | 17,59 % | 21,83 % | 21,08 % |
| HellaSwag (10.042) | acc | 52,56 % | 50,64 % | 51,04 % | 52,23 % |
| HellaSwag (10.042) | acc_norm | 69,05 % | 67,19 % | 67,36 % | 68,39 % |
| IFEval (541) | prompt_level_strict | 57,86 % | 45,47 % | 46,95 % | — |
| IFEval (541) | inst_level_strict | 69,18 % | 60,07 % | 61,03 % | — |
| IFEval (541) | prompt_level_loose | 64,14 % | 51,39 % | 55,64 % | — |
| IFEval (541) | inst_level_loose | 74,10 % | 64,87 % | 67,87 % | — |

Fidelidad de pesos y perplejidad (6 textos retenidos, BF16):

| Checkpoint | SQNR de pesos | PPL 6 textos | Archivo |
|---|---:|---:|---|
| BF16 Qwen3-4B-Instruct-2507 | — | 12,17 | base |
| phi-lattice v2 (control plano) | 19,63 dB | 14,72 | 4 bits empaquetado |
| v2-gecko (este archivo) | 19,25 dB | 14,05 | 4 bits empaquetado (2.583,2 MiB) |

Con cashback embeddings (por defecto): HellaSwag `acc` 51,10 %, `acc_norm` 67,39 %, MMLU 68,92 % ± 0,37. El autor indica que la comparación con `Q4_K_M` es un empate estadístico (todas las diferencias ≤ 1,6σ).

## Requisitos de hardware
- VRAM estimada: 2.583,2 MiB para el archivo gecko y 2.235 MiB para la variante cashback; con overhead de runtime, un presupuesto de 4-6 GB de VRAM es suficiente.
- GPU recomendadas: L4 (usada por el autor para cuantizar y evaluar), A100, H100 para servir en producción; RTX 4090 y GPUs de 8 GB o más para inferencia local.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más de VRAM.
- Opciones de despliegue: `transformers` (formato nativo del archivo `.pt`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato empaquetado.
- Latencia y throughput: cuantización en 198 s en L4 (252 capas); evaluación MMLU 473,7 s, HellaSwag 749,1 s y GSM8K 2.760,9 s en L4 con batch 8 y el mismo motor HF. El autor señala que `Q4_K_M` tarda un 41 % más en GSM8K por generar respuestas más largas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | GSM8K estricto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| v2-gecko (este repo) | 4.000 M | no disponible | 69,02 % | 85,06 % | Apache 2.0 | Hugging Face |
| Qwen3-4B-Instruct-2507 Q4_K_M | 4.000 M | no disponible | 69,40 % | 84,84 % | Apache 2.0 | Hugging Face (unsloth) |
| Qwen3-4B-Instruct-2507 BF16 | 4.000 M | no disponible | 70,63 % | 85,90 % | Apache 2.0 | Hugging Face |
| phi-lattice v2 (control plano) | 4.000 M | no disponible | 68,06 % | 83,93 % | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias
- El colapso de `flexible-extract` en GSM8K (de 83,85 % en BF16 a 21,83 %) afecta a todas las variantes de 4 bits, incluido `Q4_K_M`; es un efecto del códec, no del método gecko, pero degrada la extracción numérica en respuestas generadas.
- IFEval cae de forma notable frente al BF16 (de 57,86 % a 46,95 % en estricto a nivel de prompt); el seguimiento de instrucciones es el punto más débil de la cuantización.
- Un único flujo de 4 bits para el embedding sin el residual cashback rompe el modelo (PPL de 7,395 a 7,712); es obligatorio usar la variante de dos flujos si se opta por la compresión del embedding.
- El formato de pesos es un `.pt` empaquetado propio, no safetensors ni GGUF; la integración se limita a `transformers` y no se documenta compatibilidad con motores de inferencia habituales.
- No se publican datos sobre sesgos, riesgo de alucinación ni comportamiento multilingüe del modelo base en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero el artefacto es una cuantización de terceros; conviene verificar la procedencia y el `sha256` del archivo antes de desplegarlo.
- El autor advierte que la variante cashback no ha vuelto a ejecutar GSM8K ni IFEval; las cifras de esas tareas para el archivo por defecto son extrapolaciones, no medidas.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/ununununununununununununununununununun/qwen3-4b-instruct-2507-phi-lattice-v2-gecko)
- [Benchmark Q4_K_M de referencia](https://huggingface.co/ununununununununununununununununununun/qwen3-4b-instruct-2507-q4km-bench)
- [Modelo base Qwen/Qwen3-4B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507)
- [GGUF Q4_K_M de unsloth](https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-GGUF)
