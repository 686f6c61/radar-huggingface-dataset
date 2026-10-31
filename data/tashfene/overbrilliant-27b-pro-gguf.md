# tashfene/Overbrilliant-27B-Pro-GGUF

## Resumen

Overbrilliant-27B-Pro es una cuantización GGUF del modelo Qwen3.8-27B de Qwen, creada por Tashfeen Ahmed (usuario tashfene) para ejecutar un modelo de 27 mil millones de parámetros en GPUs de 16 GB y Macs de 24 GB o más. Parte de la cuantización dinámica UD-Q2_K_XL de unsloth (2,9 bits aprox.) y aplica dos innovaciones: la sustitución de los 144 tensores de proyección de las 48 capas recurrentes Gated DeltaNet por versiones Q5_K/Q6_K cuantizadas desde bf16 con matriz de importancia, y un LoRA de rango 64 entrenado por destilación on-policy desde el modelo bf16 original ("healing"). El resultado pesa 12,0 GB y, según el autor, supera al original en bf16 en tool calling (BFCL v3: 90,0 % frente a 86,2 %) y queda a la par en código difícil (LiveCodeBench).

Su relevancia radica en que demuestra una metodología de cuantización selectiva: en arquitecturas híbridas transformer + lineal (Gated DeltaNet), las capas de memoria recurrente son especialmente sensibles a la cuantización agresiva, y protegerlas con mayor precisión restaura el rendimiento en razonamiento largo. Además conserva la capa de predicción multi-token (MTP) del modelo base, lo que permite decodificación especulativa sin modelo draft externo y duplica la velocidad de generación en hardware compatible con CUDA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 16 capas de atención + 48 capas Gated DeltaNet (recurrente lineal), con capa MTP integrada |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (arquitectura densa, no MoE) |
| Longitud de contexto | hasta 64k (recomendado 32k en GPUs de 16 GB; 14,6 GiB medidos a 32k) |
| Tipos de cuantizacion | Base UD-Q2_K_XL (~2,9 bits) con capas Gated DeltaNet protegidas en Q5_K/Q6_K; KV cache cuantizable a q8_0 (y q4_0 en la edición Air) |
| Idiomas soportados | Inglés (etiquetado oficialmente; el modelo base Qwen es multilingüe, pero no hay datos específicos para esta cuantización) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (pesos base de 11,0 GiB + LoRA de corrección de 0,17 GiB, rango 64) |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-27B, emplea una arquitectura híbrida que combina 16 capas convencionales de atención con 48 capas Gated DeltaNet, una variante de capa recurrente de estado fijo (tipo SSM/attention lineal) cuyo estado no crece con la longitud del contexto, lo que reduce drásticamente el coste de memoria del KV cache: solo las 16 capas de atención generan cache dependiente del contexto. El modelo incorpora además una capa de predicción multi-token (MTP) que permite decodificación especulativa a profundidad 3 sin modelo draft externo.

El proceso de creación de esta cuantización tiene tres pasos documentados: (1) se parte de la cuantización dinámica UD-Q2_K_XL de unsloth como punto de inicio; (2) se reemplazan los 144 tensores de proyección de las 48 capas Gated DeltaNet (attn_qkv, attn_gate, ssm_out) por versiones Q5_K/Q6_K cuantizadas desde bf16 usando la matriz de importancia de unsloth, dejando el resto de tensores idénticos byte a byte al punto de partida; (3) se entrena un LoRA de rango 64 sobre las capas feed-forward mediante destilación on-policy desde el modelo bf16 sobre las salidas propias del modelo cuantizado. Según el autor, el LoRA corrige principalmente el tool calling, mientras que la protección de las capas recurrentes restaura el razonamiento largo, y solo la combinación de ambas técnicas recupera el rendimiento en problemas difíciles. No hay datos sobre el número de tokens de entrenamiento del LoRA ni sobre la composición del dataset.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Programación: paridad con el modelo bf16 en HumanEval+ (92,7) y ligera caída en LiveCodeBench (57,5 frente a 60,9), con diferencia estadísticamente no significativa (p = 0,46).
- Tool calling / function calling: 90,0 % en BFCL v3, superior al original bf16 (86,2 %), con significancia estadística (p < 0,001, test de McNemar pareado).
- Razonamiento en contextos largos: las capas Gated DeltaNet protegidas preservan la memoria recurrente, el punto débil típico de las cuantizaciones agresivas.
- Decodificación especulativa mediante la capa MTP integrada (profundidad 3), sin necesidad de modelo draft separado.
- Soporte para plantillas de chat Jinja en llama.cpp (--jinja).
- Compatible con endpoints estándar (endpoints_compatible) e imatrix.

## Casos de uso

- Agentes con tool calling en local: con 90,0 % en BFCL v3, es adecuado para pipelines de agentes que invocan funciones (búsqueda, APIs, ejecución de código) sin depender de servicios en la nube, ejecutándose íntegramente en una GPU de 16 GB.
- Asistente de programación en local: HumanEval+ de 92,7 y LiveCodeBench de 57,5 permiten autocompletado, refactorización y resolución de problemas de LeetCode-style en entornos sin acceso a APIs de pago.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para revisión de pull requests, generación de tests o análisis estático asistido, con latencias de ~32,7 tokens/s en hardware de consumo con MTP.
- Procesamiento de documentos largos: a 32k de contexto con KV cache en q8_0 cabe en 14,6 GiB, suficiente para resumir o consultar contratos, informes o bases de código medianas.
- Despliegue en estaciones de trabajo sin servidor: en Macs de 24 GB+ funciona a 32k–64k de contexto sin GPU dedicada, útil para desarrolladores con Apple Silicon.
- Chatbots multi-turno eficientes: el estado fijo de las 48 capas Gated DeltaNet hace que el consumo de memoria crezca poco con el contexto, ideal para conversaciones largas en hardware limitado.
- Investigación en cuantización: el método "proteger la memoria recurrente + healing con LoRA" es replicable y está documentado, útil como referencia para cuantizar otros modelos híbridos.

## Benchmarks y rendimiento

Datos publicados por el autor (BFCL v3 sobre un subconjunto de 600 tareas con checker AST propio, no el harness oficial; LiveCodeBench sobre 200 problemas a 8k):

| Modelo | Tamaño | BFCL v3 | LiveCodeBench (200, 8k) | HumanEval+ / MBPP+ |
|---|---|---|---|---|
| Qwen3.8-27B bf16 (original) | 54,7 GB | 86,2 | 60,9 | 92,1 / 78,3 |
| unsloth UD-Q2_K_XL (punto de partida) | 9,8 GB | 87,2 | 55,0 | 90,2 / 77,0 |
| **Overbrilliant-27B-Pro** | **12,0 GB** | **90,0** | **57,5** | **92,7 / 75,4** |
| Overbrilliant-27B-Air | 9,5 GB | 89,0 | 57,5 | — |

Datos adicionales: sobre 334 problemas pareados de LiveCodeBench, la diferencia frente al bf16 es de −3,0 ± 2,0 (p ≈ 0,17), la mitad de la brecha de las cuantizaciones estándar. Velocidad: 32,7 tokens/s en un AMD Ryzen AI Max (Strix Halo) con MTP a profundidad 3, aproximadamente el doble que sin MTP. No se han publicado resultados de MMLU, GSM8K u otros benchmarks de conocimiento y matemáticas.

## Requisitos de hardware

- Memoria medida (Pro, con MTP y KV cache q8_0): ~13,7 GiB a 8k, ~14,0 GiB a 16k, 14,6 GiB a 32k, 15,9 GiB a 64k.
- GPUs de 16 GB recomendadas: RTX 4080, RTX 5070 Ti, RX 7800 XT (hasta 32k de contexto; a 64k apenas queda margen).
- Macs de 24 GB o más: 32k–64k de contexto; en Metal no hay ganancia de MTP, por lo que conviene omitir los flags especulativos.
- GPUs de 12 GB: la edición Air (9,9–10,2 GiB calculados a 16k–32k), no esta versión Pro.
- GPUs de 8 GB o menos: insuficientes para un modelo de 27B.
- Despliegue: llama.cpp (llama-server con --lora, -fa on, -ctk/-ctv q8_0 y --spec-type draft-mtp). No hay instrucciones para vLLM, TGI u Ollama; al requerir un LoRA GGUF adjunto y capas Gated DeltaNet, llama.cpp es el runtime documentado.
- Throughput: 32,7 tokens/s con decodificación especulativa MTP (profundidad 3) en AMD Ryzen AI Max (Strix Halo), ~2× frente a la decodificación sin MTP.

## Comparativa con modelos similares

| Modelo | Tamaño | Contexto | BFCL v3 | LiveCodeBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B bf16 (original) | 54,7 GB | no disponible | 86,2 | 60,9 | Apache-2.0 | HuggingFace (Qwen/Qwen3.8-27B) |
| unsloth UD-Q2_K_XL de Qwen3.8-27B | 9,8 GB | no disponible | 87,2 | 55,0 | Apache-2.0 | HuggingFace (unsloth) |
| Overbrilliant-27B-Pro | 12,0 GB | hasta 64k (32k recomendado) | 90,0 | 57,5 | Apache-2.0 | HuggingFace (tashfene) |
| Overbrilliant-27B-Air | 9,5 GB | hasta 32k (64k al límite en Mac de 16 GB) | 89,0 | 57,5 | Apache-2.0 | HuggingFace (tashfene) |

La comparación más relevante es con la cuantización estándar de unsloth de la que parte: Overbrilliant-27B-Pro añade ~2,2 GB a cambio de +2,8 puntos en BFCL v3 y +2,5 en LiveCodeBench, además de la protección de la memoria recurrente para contextos largos. Frente al bf16 original, ofrece un ahorro de ~42 GB de memoria con paridad estadística en código y mejora en tool calling.

## Limitaciones y advertencias

- Los benchmarks del autor se basan en una sola ejecución greedy por problema; la ausencia de diferencia significativa no prueba igualdad con el bf16.
- BFCL v3 se midió sobre un subconjunto de 600 tareas con un checker AST propio, no con el harness oficial, por lo que la cifra de 90,0 % no es directamente comparable con resultados de terceros.
- Las mediciones de memoria usaron el modelo draft MTP externo; la ruta MTP integrada consume menos memoria de lo indicado.
- El modelo está etiquetado solo en inglés; el rendimiento en castellano u otros idiomas no está evaluado en la documentación.
- En Apple Metal la decodificación especulativa MTP no aporta ganancia de velocidad, por lo que parte del atractivo de rendimiento se pierde en Mac.
- A 64k de contexto en una GPU de 16 GB apenas queda margen (15,9 GiB medidos), con riesgo de agotamiento de VRAM en uso real.
- Riesgo de alucinación: no evaluado específicamente en la documentación; al ser una cuantización agresiva (~2,9 bits base), debe asumirse al menos el del modelo base.
- Licencia Apache-2.0: sin restricciones para uso comercial.
- Proyecto de un autor independiente con 272 descargas y 1 like en el momento de la ficha: madurez comunitaria limitada y posible falta de mantenimiento a largo plazo.

## Enlaces

- Ficha del modelo: https://huggingface.co/tashfene/Overbrilliant-27B-Pro-GGUF
- Edición Air (hermana, para 16 GB Mac): https://huggingface.co/tashfene/Overbrilliant-27B-Air-GGUF
- Modelo base: Qwen/Qwen3.8-27B (referenciado en la model card; https://huggingface.co/Qwen/Qwen3.8-27B)
- Cuantización de partida de unsloth: https://huggingface.co/unsloth
- No se han encontrado enlaces a paper, repositorio de código o demo adicional en la información disponible.
