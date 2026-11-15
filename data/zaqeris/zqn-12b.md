# ZAQERIS/ZQN-12B

## Resumen

ZQN-12B es un modelo de lenguaje causal bilingüe (árabe e inglés) desarrollado por ZAQERIS AI, un grupo de investigación independiente con sede en El Cairo. Se presenta como el segundo modelo de la familia ZQN, sucesor de ZAQERIS-AXIOM, y está entrenado desde cero por el propio grupo. A pesar de la denominación comercial "12B", el modelo cuenta con 15.546.031.104 parámetros físicos desplegados (13,21B en el backbone de 48 capas más 1,56B en embeddings y cabeza de salida, 0,75B de DVMU y 21,02M de LTBDD), con 6.673.532.772 parámetros en el checkpoint safetensors publicado.

Su propuesta principal es la compresión extrema mediante la técnica propietaria ZAQERIS M3-GPTQ (3,2484 bits por peso), que reduce el modelo a 6,479 GiB en disco y permite su ejecución en GPUs de consumo con 8 GB de VRAM. Incorpora innovaciones como un motor de deliberación dialéctica residual (LTBDD), corrección automática de errores tipográficos y emisión de llamadas a herramientas en formato XML estructurado.

Es relevante para desarrolladores que necesitan desplegar un modelo de razonamiento bilingüe en hardware limitado, aunque sus puntuaciones en benchmarks académicos son modestas y el autor lo describe explícitamente como un checkpoint temprano, no un modelo de frontera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (ZaqionDialecticForCausalLM), 48 capas, d_model=5120, intermediate_size=13824, 40 cabezas de consulta / 8 cabezas KV, head_dim=128 |
| Parametros totales | 15.546.031.104 (15,55B desplegados: 13,21B backbone + 1,56B embed/head + 0,75B DVMU + 21,02M LTBDD); 6.673.532.772 en safetensors |
| Parametros activos | No aplica (no es MoE en esta versión; el predecesor AXIOM era MoE disperso) |
| Longitud de contexto | 131.072 tokens nativo (128K); 262.144 tokens extendido vía YaRN (256K, m_scale=1,069315) |
| Tipos de cuantizacion | ZAQERIS M3-GPTQ (3x8b 8D RVQ + Block-Hadamard g=128 + OBQ salience 0,5% + Block-8 Cholesky + normalización por filas), 3,2484 bpw; embed_tokens INT8 con offload a CPU; adaptadores DVMU INT4 G64 |
| Idiomas soportados | Árabe (ar), inglés (en), multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (5 shards, 6.957.289.320 bytes / 6,479 GiB) |

## Arquitectura y entrenamiento

ZQN-12B es un transformer decoder-only causal con 48 capas, dimensión de modelo 5120, tamaño intermedio 13824 y un esquema de atención con 40 cabezas de consulta y 8 cabezas KV (GQA), con head_dim de 128. Sobre el backbone se añaden dos componentes auxiliares: `ZaqionDialecticDeliberationEngine` (LTBDD), un bloque de cuello de botella residual de 21,02M de parámetros situado antes de `lm_head`, y DVMU (0,75B de parámetros), con adaptadores cuantizados a INT4 G64. El tokenizador es externo, un BPE multilingüe de 152.064 tokens con tokens especiales `<｜User｜>`, `<｜Assistant｜>`, `` y `<｜end▁of▁sentence｜>`, reutilizado por compatibilidad.

El modelo fue entrenado desde cero por ZAQERIS AI, pero los corpus de preentrenamiento y SFT se mantienen estrictamente privados y no se distribuyen en el repositorio. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable es la cuantización M3-GPTQ, que combina cuantización vectorial residual de 8 dimensiones (RVQ), transformada de Block-Hadamard con grupo 128, selección de saliencia OBQ al 0,5% (0,4% en `lm_head`), descomposición de Cholesky por bloques de 8 y normalización por filas, alcanzando 3,2484 bpw con una similitud coseno media de 0,9731 y una perplejidad de calibración de 10,6807.

## Capacidades

- Generación de texto causal bilingüe (árabe e inglés) con razonamiento paso a paso mediante formato `<think>...</think>` y respuesta directa.
- Razonamiento matemático y generación de código, con puntuaciones modestas según los benchmarks del autor.
- Emisión de llamadas a herramientas en marcado XML estructurado (`<call .../>` y `<plan ...>`), parseables por un host externo o por el `ZaqionAgentToolbox` local.
- `ZaqionAgentToolbox` integrado con herramientas locales opcionales: `sh`, `linux_diag`, `read_file`, `write_file` y `search`; navegador, correo, búsqueda web y multimedia requieren un orquestador externo.
- `ZaqionSelfCorrectionEngine`: prenormalizador ligero basado en reglas y tabla de búsqueda (`COMMON_CORRECTIONS`, regla de sufijo `خ->ك`, rechazo de cadenas mash) para robustez ante errores tipográficos; validado 10/10 en su fichero de pruebas específico de 10 casos.
- `ZaqionDialecticDeliberationEngine` (LTBDD): bloque residual de deliberación previo a la cabeza de salida.
- Soporte de contexto largo nativo de 128K tokens, extensible a 256K mediante YaRN.
- Capacidad multilingüe declarada, aunque los idiomas principales son árabe e inglés.

## Casos de uso

- Despliegue en GPUs de consumo de 8 GB: el modelo está comprimido a 6,032 GiB de VRAM CUDA cargada y 6,614 GiB de pico en evaluación, con 25,47 tok/s medidos en una RTX 5060 Laptop, lo que permite ejecutar un modelo de 15,55B desplegados en hardware de gama media.
- Asistencia conversacional en árabe: el modelo soporta diálogo multi-turno con formato `<think>` y respuestas directas, adecuado para atención al cliente o asistentes en árabe con contexto largo de hasta 128K tokens.
- Automatización de tareas de sistema en local: mediante `ZaqionAgentToolbox` puede emitir llamadas estructuradas a `sh`, `linux_diag`, `read_file`, `write_file` y `search` para diagnósticos y operaciones de ficheros en entornos controlados.
- Generación de código asistida con tool calling: la emisión de `<call .../>` permite integrarlo en pipelines que parseen llamadas a funciones, aunque su HumanEval de 15,24% limita su uso a tareas sencillas o como componente auxiliar.
- Investigación en compresión de modelos: la técnica M3-GPTQ y los componentes DVMU/LTBDD son reproducibles y verificables con el notebook oficial, útil para estudiar cuantización extrema a 3,2484 bpw.
- Procesamiento de documentos largos en árabe e inglés: con 128K tokens nativos y 256K vía YaRN, puede resumir o extraer información de documentos extensos en ambos idiomas.
- Corrección y normalización de texto con errores tipográficos: el `ZaqionSelfCorrectionEngine` aplica reglas deterministas antes de la generación, útil en preprocesado de entradas ruidosas.

## Benchmarks y rendimiento

Resultados publicados por el autor para el checkpoint de referencia Stage-3 (40 capas). No se han publicado resultados completos del Stage-4 (48 capas) en la información disponible.

| Benchmark | ZQN-12B (Stage-3, 40 capas) | Tareas evaluadas |
|---|---|---|
| HumanEval | 15,24% | no disponible |
| GSM8K | 19,00% | 100 |
| MMLU | 45,50% | 200 |
| ARC-Challenge | 55,50% | 200 |
| Selección de herramientas | 58,33% (7/12) | 12 |

Datos adicionales de verificación del Stage-4 (48 capas): compresión a 3,2484 bpw con similitud coseno media de 0,9731, perplejidad de calibración de 10,6807, perplejidad en held-out de 35,5500 (frente a 43,6063 en Stage-3), throughput de 25,47 tok/s y emisión de etiquetas de herramienta de 2/5 en `live_eval_report.json`.

## Requisitos de hardware

- VRAM estimada: 6,032 GiB cargados en CUDA y 6,614 GiB de pico en evaluación con la cuantización M3-GPTQ; el autor verifica ejecución en GPUs de 8 GB.
- GPU recomendadas: RTX 5060 Laptop (8 GB) verificada por el autor; cualquier GPU con al menos 8 GB de VRAM debería ser suficiente para la versión cuantizada. Para la versión sin cuantizar de 15,55B desplegados se necesitaría hardware muy superior (no especificado en la información disponible).
- Cabe en GPU de consumo: sí, en GPUs de 8 GB como la RTX 5060 Laptop; el `embed_tokens` se descarga a CPU en INT8 y los adaptadores DVMU usan INT4 G64.
- Opciones de despliegue: librería `transformers` con código personalizado (`custom_code`); el autor proporciona un notebook de quickstart y verificación. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 25,47 tok/s con prefill de 1,373 s en una suite de 9 prompts (Stage-4) sobre RTX 5060 Laptop de 8 GB.

## Comparativa con modelos similares

No se han proporcionado en la información disponible datos de modelos comparables de la misma categoría (tamaño, contexto o tarea) para establecer una comparativa rigurosa. El predecesor de la propia familia, ZAQERIS-AXIOM (79,43B totales / 12,39B activos, MoE disperso de 36 capas, M3 a 3,16 bpp), es la única referencia interna citada, pero no se ofrecen sus resultados de benchmarks para comparar.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ZQN-12B | 15,55B desplegados (6,67B en safetensors) | 128K nativo / 256K YaRN | Apache 2.0 | Hugging Face |
| ZAQERIS-AXIOM (predecesor) | 79,43B totales / 12,39B activos (MoE) | no disponible | no disponible | no disponible |
| Alternativas de la categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint temprano: el propio autor lo describe como un modelo académico modesto, no un modelo de frontera; sus puntuaciones (HumanEval 15,24%, GSM8K 19,00%) limitan su uso en producción para código y matemáticas.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de tasas de alucinación en la información disponible.
- Sesgos conocidos: no se documentan en la información proporcionada; al estar entrenado con corpus privados no auditables, no es posible evaluar la composición ni los sesgos del dataset.
- Limitaciones de idioma: aunque se declara multilingüe, los idiomas principales son árabe e inglés; el rendimiento en otras lenguas no está documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el tokenizador es de propiedad externa y el autor advierte que no es suyo; conviene verificar la licencia del tokenizador original antes de un despliegue comercial.
- Emisión de herramientas limitada: solo 2/5 en emisión de etiquetas de herramienta en la evaluación en vivo del Stage-4, y 7/12 en selección de herramientas del Stage-3; la fiabilidad del tool calling es baja.
- Datos de entrenamiento privados: la imposibilidad de auditar los corpus de preentrenamiento y SFT impide verificar la procedencia de los datos y el cumplimiento normativo.
- Dependencia de código personalizado: requiere `trust_remote_code` y la implementación específica de `ZaqionDialecticForCausalLM`, lo que reduce la compatibilidad con ecosistemas de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZAQERIS/ZQN-12B
- Notebook de quickstart y verificación: https://huggingface.co/ZAQERIS/ZQN-12B/blob/main/notebooks/ZQN_12B_Official_Quickstart_and_Verification.ipynb
- Paper técnico de ZAQERIS M3-GPTQ: https://huggingface.co/ZAQERIS/ZQN-12B/blob/main/docs/papers/ZAQERIS_M3_GPTQ_PAPER.md
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
