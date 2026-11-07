# Yo-Purple/Meditor-2-3.4B-Universal

## Resumen

Meditor-2-3.4B-Universal es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Yo-Purple (Jedidiah Featherkile) y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de la versión estandarizada del modelo Meditor-2, que en su release original introducía una arquitectura jerárquica de dos niveles (HMoE) con enrutamiento personalizado. Esta versión "Universal" compila esa jerarquía en la topología estándar `Qwen2MoeForCausalLM` (`qwen2_moe`), eliminando la dependencia de código remoto (`trust_remote_code=False`) y permitiendo su ejecución nativa en Transformers, vLLM, Ollama, LM Studio y llama.cpp.

El modelo parte de SmolLM2-1.7B-Instruct (entrenado con 11 billones de tokens) y lo "upcyclea" a una arquitectura MoE con 3.411 millones de parámetros almacenados y aproximadamente 1.825 millones activos por token (ratio de cómputo activo del 53,52%). Incorpora un experto compartido "ancla" de 8.192 neuronas intermedias que preserva el conocimiento base, más 15 sub-expertos enrutados de 768 dimensiones cada uno, distribuidos en tres dominios: lógica y matemáticas, lenguaje natural y diálogo, y código y sistemas estructurados.

La relevancia de este modelo radica en su ventana de contexto declarada de 524.288 tokens (~500K) con RoPE theta de 130.000, su capacidad de tool calling (toolformer) y su diseño para caber en GPUs de consumo de 8 GB de VRAM en BF16 (~6,8 GB). El autor reporta una velocidad de generación de 55,5 tokens/s en una RTX 4060, lo que supone una mejora de 4,6× respecto al bucle forward en Python personalizado del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen2MoeForCausalLM` (`qwen2_moe`), transformer MoE con enrutamiento top-1 + experto compartido |
| Parametros totales | 3.411.003.392 (~3,41B) |
| Parametros activos | 1.825.507.328 (~1,83B); ratio de computo activo 53,52% |
| Longitud de contexto | 524.288 tokens (~500K), RoPE theta 130.000,0 |
| Tipos de cuantizacion | GGUF (repo incluye artefactos GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), GGUF |

Otras especificaciones: 24 capas transformer, 32 cabezas de atencion, 32 cabezas KV, dimension de cabeza 64, hidden size 2.048. Experto compartido con FFN de 8.192 neuronas intermedias; 15 sub-expertos enrutados de 768 neuronas cada uno (5 de matematicas, 5 de lenguaje, 5 de codigo). Precision BF16 (~6,8 GB). Tamano del repositorio: 38,5 GB.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture-of-Experts de dos niveles jerarquicos (HMoE) que el autor ha compilado en la topologia estandar `qwen2_moe`. En el diseno original, un router macroscopico de dominio dividia la cognicion en tres areas (logica/matematicas/razonamiento deductivo, lenguaje natural/dialogo/sintesis creativa, y codigo/sistemas estructurados/hechos tecnicos), y dentro de cada dominio un router microscopico seleccionaba entre 5 sub-expertos especializados. La version Universal compila ese arbol de enrutamiento en un router plano de 15 clases que, segun el autor, mantiene una concordancia del 98,4% o superior con las decisiones jerarquicas originales, preservando los 15 sub-expertos y el experto ancla compartido con fidelidad bit-exacta.

El entrenamiento parte de SmolLM2-1.7B-Instruct (11 billones de tokens de preentrenamiento) y del modelo intermedio Meditor-2-3.4B-A1.8B-HMoE. El experto compartido de 8.192 neuronas intermedias preserva el 100% de la capacidad fundacional de SmolLM2. El autor reporta que no se produce olvido catastrofico (mantiene 100% en ARC Science & Commonsense). No se detalla en la informacion disponible el numero de tokens de ajuste, la composicion exacta del dataset de entrenamiento ni si se emplearon tecnicas de RLHF o DPO. El modelo incorpora capacidades de tool calling (etiqueta toolformer) y razonamiento multi-paso.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Razonamiento logico, matematicas y razonamiento deductivo (sub-expertos 0-4).
- Sintesis de lenguaje natural, dialogo y creacion creativa (sub-expertos 5-9).
- Codigo, sistemas estructurados y hechos tecnicos (sub-expertos 10-14).
- Tool calling / function calling (toolformer) con ejecucion de operaciones aritmeticas mediante coprocesador AST seguro.
- Razonamiento multi-paso y capacidades orientadas a agentes.
- Ventana de contexto extendida de hasta 524.288 tokens.
- Formato de prompt estilo ChatML (`<|im_start|>` / `<|im_end|>`).
- Compatibilidad nativa con Transformers sin `trust_remote_code`, vLLM, Ollama, LM Studio y llama.cpp.

## Casos de uso

- Analisis de documentos largos: con 524.288 tokens de contexto, el modelo puede ingerir libros completos, expedientes o bases de codigo extensas en una sola pasada y responder preguntas sobre ellos sin necesidad de fragmentacion.
- Asistente de codigo en local: los sub-expertos especializados en codigo y sistemas estructurados permiten autocompletado, explicacion y refactorizacion en entornos con GPUs de consumo (RTX 4060 de 8 GB), integrándose en editores o pipelines de CI/CD mediante tool calling.
- Atencion al cliente automatizada: el enrutamiento por dominio de lenguaje natural y dialogo, junto con la ventana de contexto amplia, permite gestionar conversaciones multi-turno con historial extenso en ingles.
- Razonamiento matematico asistido: el modelo combina sub-expertos de matematicas con tool calling para delegar calculos a un coprocesador AST seguro, lo que el autor reporta como 100% de precision en aritmetica aumentada con herramientas.
- Despliegue en estaciones de trabajo sin GPU dedicada de gama alta: al caber en 8 GB de VRAM en BF16 y ofrecer artefactos GGUF, es viable en portatiles y equipos de consumo para prototipado e inferencia local.
- Servicio de inferencia de alto rendimiento: mediante `vllm serve` se expone un endpoint compatible con la API de OpenAI para integrar el modelo en aplicaciones existentes con throughput mejorado.
- Experimentacion en investigacion de MoE: su topologia estandar `qwen2_moe` y su naturaleza de upcycling desde SmolLM2 lo hacen util como banco de pruebas para estudiar enrutamiento de expertos y especializacion por dominio.

## Benchmarks y rendimiento

Resultados reportados por el autor, evaluados localmente en una NVIDIA GeForce RTX 4060 de 8 GB con PyTorch 2.6 y `trust_remote_code=False`:

| Benchmark / Dimension | SmolLM2 Base | Meditor-2 HMoE Baseline | Meditor-2 Universal | Notas |
|---|---|---|---|---|
| Perplexity de razonamiento (PPL) | 7,35 (Loss 1,9944) | 3,48 (Loss 1,2461) | 2,48 (Loss 0,9063) | Reduccion del 66,3% |
| ARC Science & Commonsense | 100,0% (12/12) | 100,0% (12/12) | 100,0% (12/12) | Sin olvido catastrofico |
| Precision aritmetica directa | 40,0% | 70,0% | 60,0% | Decodificacion autorregresiva |
| Aritmetica mental con herramientas | 100,0% | 100,0% | 100,0% | Coprocesador AST seguro |
| Latencia de prefill (256 tokens) | ~300 ms | 256,07 ms | 85,95 ms | 3,0× mas rapido |
| Velocidad media de generacion | ~11 tok/s | 12,08 tok/s | 55,51 tok/s | 4,6× mas rapido |
| VRAM activa | ~6,4 GB | 6,42 GB | 6,38 GB | Cabe en 8 GB GDDR6 |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada en BF16: ~6,8 GB de pesos; consumo activo reportado de 6,38 GB, por lo que cabe en GPUs de 8 GB.
- GPU recomendadas: RTX 4060 (validada por el autor), RTX 4070/4080/4090, A100, H100 para mayor throughput y contexto largo.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (RTX 3060 Ti, 4060, 4070, etc.) en BF16; con cuantizaciones GGUF podria reducirse aun mas el requisito, aunque no se detallan tamanos concretos.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`), vLLM (`vllm serve`), Ollama, LM Studio y llama.cpp (via GGUF).
- Latencia y throughput: prefill de 256 tokens en 85,95 ms y generacion de 55,51 tok/s en RTX 4060 segun el autor; no se dispone de datos para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Meditor-2-3.4B-Universal | 3,41B | 1,83B | 524.288 | Apache 2.0 | Hugging Face (safetensors, GGUF) |
| SmolLM2-1.7B-Instruct (base) | 1,7B | 1,7B | no disponible | Apache 2.0 | Hugging Face |
| Meditor-2-3.4B-A1.8B-HMoE (predecesor) | 3,41B | 1,83B | 524.288 | Apache 2.0 | Hugging Face (requiere `trust_remote_code`) |

No se dispone en la informacion proporcionada de datos de contexto ni de rendimiento de SmolLM2-1.7B-Instruct mas alla de los benchmarks comparativos incluidos en la tabla anterior. No se han identificado otras alternativas comparables en la busqueda web realizada.

## Limitaciones y advertencias

- El modelo solo declara soporte para ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea limitado.
- Riesgo de alucinacion inherente a modelos de este tamano (3,4B totales, 1,8B activos); no se han publicado evaluaciones de factualidad.
- Los benchmarks presentados por el autor son de evaluacion local en una unica GPU y con conjuntos de prueba muy reducidos (por ejemplo, ARC con 12 preguntas), por lo que su significancia estadistica es limitada.
- La ventana de contexto de 524.288 tokens es una especificacion declarada; no se aportan pruebas de rendimiento en contextos largos (long-context benchmarks).
- El modelo se distribuye con 0 descargas y 1 like en el momento de la consulta, y fue creado en noviembre de 2026; la validacion por parte de la comunidad es practicamente inexistente.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las obligaciones de atribucion y las condiciones heredadas del modelo base SmolLM2.
- El proceso de compilacion del enrutamiento jerarquico a un router plano de 15 clases reporta una concordancia del 98,4%, lo que implica que aproximadamente un 1,6% de las decisiones de enrutamiento pueden diferir del modelo original.
- No se documentan sesgos conocidos ni evaluaciones de seguridad o alineacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yo-Purple/Meditor-2-3.4B-Universal
- Modelo base (HMoE): https://huggingface.co/Yo-Purple/Meditor-2-3.4B-A1.8B-HMoE
- Perfil del autor: https://huggingface.co/Yo-Purple
