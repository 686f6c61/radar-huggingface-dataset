# Venastine-Research/Xing4.0-29B-A4B-GGUF

## Resumen

Xing4.0-29B-A4B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) perteneciente a la serie Xing, anteriormente conocida como TeleChat, y desarrollado por China Telecom Artificial Intelligence Technology Co., Ltd. Combina 29B parametros totales con solo 4B activos por token y soporta de forma nativa una ventana de contexto de 256K tokens, extensible hasta 512K, lo que lo situa en la categoria de modelos orientados a agentes y tareas de ingenieria de contexto largo.

Esta ficha concreta corresponde a `Venastine-Research/Xing4.0-29B-A4B-GGUF`, una cuantizacion en formato GGUF del modelo base `XingChen-AGI/Xing4.0-29B-A4B`, publicada por el usuario Venastine-Research bajo licencia Apache 2.0. El repositorio ocupa 222,7 GB y acumula 8.851 descargas y 23 likes desde su publicacion en septiembre de 2026, lo que indica un uso relevante para despliegue en hardware de gama alta o en entornos con aceleracion por CPU/GPU mixta.

Su relevancia tecnica se apoya en tres ejes: es el primer modelo de esta escala entrenado integramente sobre la plataforma Ascend NPU con el framework MindSpore, incorpora la arquitectura mHC + MLA + MTP con atencion MLA y 64 expertos enrutados (4 activos por token mas 1 experto compartido), y declara resultados competitivos en tareas de agentes, codigo y razonamiento matematico frente a alternativas como Gemma4-26B-A4B y Qwen3.6-35B-A3B. El dato de parametros verificable en safetensors asciende a 31.215.031.088, superior a los 29B nominales que indica el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion MLA y componentes mHC + MTP |
| Parametros totales | 29B nominales; 31.215.031.088 reales en safetensors |
| Parametros activos | 4B por token |
| Longitud de contexto | 256K tokens, extensible a 512K |
| Tipos de cuantizacion | GGUF (el repositorio contiene archivos GGUF; los tipos concretos de cuantizacion no estan detallados en la informacion disponible) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base |
| Numero de capas | 40 |
| Hidden size | 3584 |
| Tamano intermedio FFN denso | 9216 |
| Tamano intermedio por experto | 1024 |
| Expertos enrutados | 64 |
| Expertos activos por token | 4 |
| Expertos compartidos | 1 |
| Modelo base | XingChen-AGI/Xing4.0-29B-A4B |
| Tamano del repositorio | 222,7 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con capilaridad MoE de tipo disperso: 40 capas, hidden size de 3584, 64 expertos enrutados con tamano intermedio de 1024 cada uno, 4 expertos activos por token y un unico experto compartido, sobre una FFN densa de 9216. La atencion es de tipo MLA (Multi-head Latent Attention), lo que reduce el coste de la cache KV en contextos largos de hasta 256K tokens, y el diseno se completa con los componentes mHC y MTP, orientados a la coherencia de tareas y a la ejecucion de cadenas de razonamiento de varios pasos. El modelo declara soporte nativo para planificacion multi-paso, tool calling y ejecucion de cadenas de razonamiento en contextos extensos.

El entrenamiento se realizo integramente sobre la plataforma Ascend NPU (clusters Ascend 910C) con MindSpore y MindFormers, incluyendo adaptacion de operadores fusionados en Ascend C para mHC. Segun la documentacion del autor, la optimizacion multinivel (comunicacion MoE afinada, recomputacion selectiva y fusion automatica grafo-operador DVM) elevo el throughput de entrenamiento aproximadamente un 96% respecto al rendimiento sin optimizar. No se especifican en el material disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional con plantilla de chat y modo de pensamiento activable mediante `enable_thinking`.
- Razonamiento matematico, con un resultado declarado de 90,00 en AIME2026.
- Razonamiento complejo y de multiples pasos, evaluado en AA.LCR con 61,00.
- Generacion y edicion de codigo: 75,00 en SWE-bench Verified y 66,00 en SWE-bench Multilingual.
- Ejecucion de tareas en terminal y entornos de linea de comandos: 57,50 en Terminal-Bench 2.1.
- Tool calling y function calling como parte del diseno orientado a agentes.
- Comportamiento agentico en frameworks externos, con adaptacion de formato para OpenCode, Claude Code, OpenClaw y Hermes.
- Investigacion profunda o deep research, con 60,80 en DeepresearchBII.
- Seguimiento de instrucciones: 69,67 en IFBench.
- Interaccion con herramientas y dialogos de agente: 64,63 en Tau3-Bench y 76,55 en Claw-Eval.
- Soporte de contexto largo de 256K tokens, relevante para repositorios completos o documentacion extensa.
- Ajuste fino adicional soportado mediante LLaMA-Factory y MindFormers para dominios verticales.
- Capacidades multimodales (vision o audio): no disponible.

## Casos de uso

- Agentes de codigo autonomo: el modelo puede resolver issues de repositorios reales integrandose en arneses tipo SWE-agent con ventanas de hasta 210K tokens, lo que permite cargar el arbol de ficheros y el historial de cambios sin truncar contexto.
- Automatizacion de terminal y DevOps: con 57,50 en Terminal-Bench 2.1 y soporte de tool calling, es adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en pipelines de CI/CD.
- Asistencia a la programacion multilingue: los 66,00 puntos en SWE-bench Multilingual lo hacen util para equipos que trabajan con bases de codigo en varios lenguajes de programacion simultaneamente.
- Atencion al cliente automatizada: su ventana de 256K tokens permite mantener conversaciones multi-turno con historial extenso y documentacion de producto adjunta sin perder coherencia.
- Revision de contratos y auditoria documental: el autor indica adaptabilidad mediante fine-tuning ligero para auditoria de contratos y comprension de tablas, con lo que se puede especializar sobre corpus propietarios.
- Busqueda y sintesis de informacion (deep research): con 60,80 en DeepresearchBII, es apropiado para agentes que combinan busqueda web, lectura de fuentes y generacion de informes estructurados.
- Clasificacion de intenciones y QA sobre base de conocimiento: el modelo esta disenado para ajuste fino de bajo coste en dominios verticales, lo que reduce el esfuerzo de adaptacion en asistentes internos.
- Razonamiento matematico asistido: con 90,00 en AIME2026, puede emplearse en tutoria automatizada, verificacion de calculos o generacion de problemas resueltos paso a paso.
- Integracion en asistentes de IDE compatibles con Claude Code u OpenCode: la alineacion de formato declarada por el autor facilita su uso como backend en herramientas de desarrollo existentes.

## Benchmarks y rendimiento

| Benchmark | Xing4.0-29B-A4B | Gemma4-26B-A4B | Qwen3.6-35B-A3B |
|---|---|---|---|
| IFBench | 69,67 | 72,67 | 65,50 |
| AIME2026 | 90,00 | 88,30 | 92,70 |
| AA.LCR | 61,00 | 66,00 | 62,00 |
| Tau3-Bench | 64,63 | 58,90 | 67,20 |
| Claw-Eval | 76,55 | 71,49 | 74,54 |
| SWE-bench Verified | 75,00 | 53,00 | 76,00 |
| Terminal-Bench 2.1 | 57,50 | 30,00 | 51,50 |
| SWE-bench Multilingual | 66,00 | 51,00 | 67,20 |
| DeepresearchBII | 60,80 | 39,30 | 59,70 |

Condiciones de evaluacion declaradas por el autor: SWE-bench Verified y SWE-bench Multilingual con el arnes SWE-agent, temperature 1,0, top_p 0,95, repetition_penalty 1,05 y ventana de 210K; Terminal-Bench 2.1 con terminus-2, temperature 0,8, max_tokens 64K, timeout de 24 horas y media de 3 ejecuciones; Claw-Eval con el arnes oficial, max_tokens 16384, ventana de 256K y media de 3 ejecuciones; Tau3-Bench con el arnes oficial y temperature 0,8.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en precision completa requiere del orden de 62 GB. En formato GGUF, una cuantizacion de 8 bits se situaria en torno a 31-34 GB, una de 4 bits en torno a 18-20 GB y una de 2-3 bits por debajo de 13 GB. Estas cifras son estimaciones derivadas del numero de parametros (31,2B) y no estan confirmadas por el autor.
- GPU recomendadas: para precision completa o cuantizaciones altas, A100 80 GB, H100 80 GB o Ascend 910C. Para cuantizaciones de 4 bits, una RTX 4090 con 24 GB puede ser suficiente si se limita la ventana de contexto y el numero de expertos activos.
- Compatibilidad con GPU de consumo: probable en cuantizaciones de 4 bits sobre RTX 4090, RTX 3090 o RTX 5090, con contexto reducido. Para aprovechar los 256K tokens completos se necesita cache KV y memoria muy superiores a las de una GPU de consumo.
- Opciones de despliegue: el repositorio GGUF habilita llama.cpp y, por extension, servidores compatibles con GGUF. El modelo base soporta vLLM, SGLang y KTransformers, ademas de la via MindSpore/MindFormers para hardware Ascend. El autor menciona compatibilidad con endpoints OpenAI.
- Ajuste fino: LLaMA-Factory y MindFormers son las herramientas indicadas por el autor.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Terminal-Bench 2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Xing4.0-29B-A4B | 29B (4B activos) | 256K (extensible a 512K) | 75,00 | 57,50 | Apache 2.0 | Pesos abiertos, GGUF y safetensors |
| Gemma4-26B-A4B | 26B (4B activos) | no disponible | 53,00 | 30,00 | no disponible | no disponible |
| Qwen3.6-35B-A3B | 35B (3B activos) | no disponible | 76,00 | 51,50 | no disponible | no disponible |
| Huihui-Xing4.0-29B-A4B-abliterated | 31B | no disponible | no disponible | no disponible | no disponible | Derivado del mismo modelo base |

Frente a Gemma4-26B-A4B, Xing4.0-29B-A4B obtiene mejores resultados en siete de las nueve pruebas declaradas, con una diferencia especialmente amplia en Terminal-Bench 2.1 (57,50 frente a 30,00) y en SWE-bench Verified (75,00 frente a 53,00). Frente a Qwen3.6-35B-A3B el balance es mas ajustado: Xing4.0 gana en Terminal-Bench 2.1, Claw-Eval, DeepresearchBII e IFBench, mientras que Qwen3.6 supera en AIME2026, Tau3-Bench y SWE-bench Multilingual, y empata practicamente en SWE-bench Verified. No se dispone de datos de contexto ni de licencia de los modelos comparados mas alla de lo indicado por el autor.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. El autor no publica analisis de sesgo, toxicidad ni evaluaciones de equidad.
- Riesgo de alucinacion: no cuantificado. Al ser un modelo entrenado para razonamiento y uso agentico con tool calling, puede generar llamadas a herramientas inexistentes o argumentos invalidos si el esquema no se valida externamente.
- Idiomas soportados: no hay listado oficial en la informacion disponible. La ascendencia TeleChat sugiere buen rendimiento en chino e ingles, pero no esta confirmado para esta revision.
- Longitud de contexto: los 256K tokens nativos y la extension a 512K exigen una gestion cuidadosa de la cache KV. En cuantizaciones GGUF de baja precision, el contexto efectivo puede degradarse mucho antes de alcanzar el limite nominal.
- Precaucion sobre la cuantizacion: los resultados de benchmark publicados corresponden al modelo base, no necesariamente a los archivos GGUF de este repositorio. La perdida de calidad por cuantizacion no esta documentada por el autor de la cuantizacion.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion, pero conviene revisar si la cuantizacion anade condiciones adicionales, ya que este repositorio es de un tercero distinto del desarrollador original.
- Fecha de creacion y actualizacion: el repositorio figura creado el 17 de septiembre de 2026 y actualizado el 28 de septiembre de 2026, con una unica revision conocida. La vigilancia de futuras actualizaciones es recomendable antes de fijar una version en produccion.
- Entrenamiento sobre Ascend NPU: el ecosistema de referencia del autor gira en torno a MindSpore y MindFormers, por lo que el soporte en GPUs convencionales depende de adaptaciones de terceros (vLLM, SGLang, llama.cpp) y puede no alcanzar la misma madurez.
- Evaluacion propia: todos los resultados de benchmark proceden del autor del modelo. No se han identificado replicaciones independientes en la informacion disponible.

## Enlaces

- Repositorio HuggingFace de la cuantizacion GGUF: https://huggingface.co/Venastine-Research/Xing4.0-29B-A4B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Repositorio GitHub del modelo: https://github.com/XingChen-AGI/Xing4.0-29B-A4B
- Repositorio previo de la serie (TeleChat): https://github.com/Tele-AI/TeleChat3
- Paper referenciado (arXiv 2512.24157): https://arxiv.org/abs/2512.24157
- Paper referenciado (arXiv 2507.18013): https://arxiv.org/abs/2507.18013
- vLLM: https://github.com/vllm-project/vllm
- SGLang: https://github.com/sgl-project/sglang
- KTransformers: https://github.com/kvcache-ai/ktransformers
- Arnes de Claw-Eval: https://github.com/claw-eval/claw-eval
- Arnes de Tau-Bench: https://github.com/sierra-research/tau-bench
- Modelo derivado abliterated: https://huggingface.co/huihui-ai/Huihui-Xing4.0-29B-A4B-abliterated
