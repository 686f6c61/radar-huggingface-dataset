# YourHighnessLA/L0xRE-V2-27b-Low

## Resumen

L0xRE-V2-27b-Low es un conjunto de pesos cuantizados de segunda generación derivado de Qwen3.8-27B, desarrollado por YourHighnessLA. Su objetivo es ejecutar un modelo de clase 27B en una GPU de consumo con 12 GB de VRAM manteniendo una fidelidad alta respecto al modelo original en BF16. La versión V2 es un reajuste con mejor calibración y una mezcla reequilibrada de códigos de 2 y 3 bits, orientada a asistentes de programación locales y agentes de IA.

El modelo se distribuye como un único GGUF de 8,62 GB con todas las capas en GPU y emplea decodificación especulativa mediante un drafter DFlash2 derivado de Qwen3.8-27B cuantizado a Q4_K_M (1,14 GB). No es un GGUF estándar: requiere el runtime propietario L0xRE BeeLLama Low v0.1.5 o superior y no funciona con llama.cpp, Ollama, LM Studio ni Transformers de serie.

La relevancia de esta versión radica en la mejora medible de fidelidad frente a V1: la divergencia KLD contra el modelo BF16 cae un 24,2 % en el conjunto de validación, con reducciones del 33,7 % en código y del 35,8 % en trazas de agentes, manteniendo el mismo tamaño de archivo y la misma velocidad de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.8-27B), pesos cuantizados con mezcla de 2 y 3 bits |
| Parametros totales | 4.784.193.024 (según safetensors del repo); el autor lo comercializa como derivado de un modelo de 27B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el autor documenta prefill y decodificación a 90K de profundidad, lo que implica soporte de al menos 90K tokens) |
| Tipos de cuantizacion | Mezcla reequilibrada de códigos de 2 bits y 3 bits; drafter DFlash2 en Q4_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | other, qwen-research-terms-derivative (enlazada a la licencia de Qwen/Qwen3.8-27B) |
| Formato de pesos | GGUF (L0xRE-V2-27b-Low.gguf, 8,62 GB) + GGUF del drafter (Qwen3.8-27B-DFlash2-Q4_K_M.gguf, 1,14 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer decoder-only, y aplica una cuantización post-entrenamiento con una mezcla calibrada de códigos de 2 y 3 bits por capa. La V2 reajusta esa asignación y recalibra los parámetros de cuantización; el autor no detalla el número de tokens ni la composición del dataset de calibración, más allá de indicar que el conjunto de validación es el «quant-challenge golden set» público y que el holdout son 200 documentos congelados antes del ajuste y puntuados una sola vez.

La innovación principal es el uso de decodificación especulativa con un drafter DFlash2 de 1,14 GB derivado del mismo modelo base, que acelera la decodificación sin cambiar el coste computacional por paso. El autor reporta que la decodificación a 90K de profundidad depende de la tasa de aceptación del drafter y varía ampliamente entre ejecuciones. No se documenta RLHF, DPO ni fases de ajuste adicionales sobre los pesos originales.

## Capacidades

- Generación de texto conversacional con soporte de modo «thinking» (razonamiento explícito) y modo «thinking off».
- Razonamiento matemático y resolución de problemas, con presupuesto de razonamiento configurable (el autor cita esfuerzo «medium» con 8K de presupuesto).
- Generación y comprensión de código, incluida localización de bugs en tareas tipo SWE.
- Tool calling y function calling, validado en tareas de llamadas a herramientas del benchmark club-3090.
- Seguimiento de instrucciones y salida estructurada (structured output).
- Extracción de datos de documentos.
- Ejecución de tareas de agente multi-paso, incluidas tareas Hermes agent y de línea de comandos (CLI).
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- Asistente de programación local: el modelo cabe en 12 GB de VRAM y decodifica código a unos 78 tok/s en una RTX 3060, lo que permite autocompletado y generación de parches en un IDE sin enviar código a la nube.
- Agente de refactorización y corrección de bugs: las trazas de agente y SWE muestran la mayor mejora de V2 (KLD un 35,8 % menor), lo que lo hace adecuado para pipelines que localizan y corrigen fallos en repositorios.
- Automatización de tool calling: soporta llamadas a funciones y salida estructurada, por lo que puede integrarse como planificador en flujos que consultan APIs, bases de datos o sistemas internos.
- Extracción de datos de documentos: la tarea de data extraction está cubierta en el benchmark del autor; sirve para convertir documentos no estructurados en registros tabulares.
- Asistente conversacional con contexto largo: el autor mide prefill de 90K tokens a unos 480 tok/s y decodificación a esa profundidad a 61,3 tok/s, lo que permite conversaciones multi-turno sobre documentos extensos.
- Razonamiento con presupuesto controlado: el modo thinking con esfuerzo medio y 8K de presupuesto obtiene 127/133 (pass@1/pass@3) en el 8-pack N150, útil en tareas de análisis que requieren cadena de razonamiento sin latencia excesiva.
- Despliegue en estaciones de trabajo con GPU de gama media: al mantener todas las capas en GPU con 12 GB, encaja en equipos de desarrollo con RTX 3060/4070 sin necesidad de servidores dedicados.

## Benchmarks y rendimiento

Divergencia KLD contra Qwen3.8-27B en BF16 (menor es mejor), según el autor:

| Split | L0xRE-27b-Low (v1) | L0xRE-V2-27b-Low | Cambio |
|---|---:|---:|---:|
| Holdout, 200 docs: global | 0.1223 | 0.0928 | −24,2 % [−20,4, −26,9] |
| Holdout: media agéntica (código, tools, razonamiento, matemáticas) | 0.0701 | 0.0497 | −29,1 % |
| Holdout: código | 0.0752 | 0.0499 | −33,7 % |
| Holdout: trazas de agente y SWE | 0.0596 | 0.0383 | −35,8 % |
| Development, 116 docs: global | 0.1151 | 0.0833 | −27,7 % |

Benchmark club-3090 8-pack N150 (150 tareas):

| Modo | v1 | V2 |
|---|---:|---:|
| Thinking off, RTX 3060 | 119 | 121 |
| Thinking on, esfuerzo medio, 8K de presupuesto, ×2 (pass@1 / pass@3) | — | 127/133, 125/135 |

Velocidad en RTX 3060 12 GB, Linux nativo, drafter DFlash2:

| Métrica | V2 | Frente a v1 |
|---|---:|---:|
| Decodificación narrativa | ~45 tok/s | dentro del 2 % |
| Decodificación de código | ~78 tok/s | dentro del 2 % |
| Prefill de prompt de 10K | ~720 tok/s | dentro del 1 % |
| Prefill de prompt de 90K | ~480 tok/s | dentro del 1 % |
| Decodificación a 90K de profundidad (3 ejecuciones) | 61,3 tok/s | v1: 50,2 tok/s |

No se han publicado resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 12 GB para el modelo principal (8,62 GB) más el drafter (1,14 GB) y el overhead del runtime; el autor indica que todas las capas residen en GPU.
- GPU recomendada por el autor: RTX 3060 de 12 GB; el rendimiento medido corresponde a esa tarjeta.
- Cabe en GPU de consumo con 12 GB o más; no se documenta comportamiento en GPUs de 8 GB.
- Despliegue: exclusivamente mediante el runtime L0xRE BeeLLama Low v0.1.5 o superior. No es compatible con llama.cpp, Ollama, LM Studio ni Transformers.
- Latencia y throughput: ~45 tok/s en decodificación narrativa, ~78 tok/s en código, ~720 tok/s de prefill a 10K y ~480 tok/s a 90K en RTX 3060.
- El nombre de modelo en la API sigue siendo `L0xRE-27b-Low`, por lo que las configuraciones de cliente existentes siguen funcionando.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| L0xRE-V2-27b-Low | 4.784.193.024 (derivado de 27B) | ≥90K (documentado por el autor) | GGUF propietario | qwen-research-terms-derivative | L0xRE BeeLLama Low v0.1.5+ |
| L0xRE-27b-Low (v1) | mismo que V2 | ≥90K | GGUF propietario | qwen-research-terms-derivative | L0xRE BeeLLama Low (v0.1.4+ para v1) |
| Qwen3.8-27B (BF16) | 27B (nominal) | no disponible | safetensors | qwen-research-terms | Transformers, vLLM, TGI, llama.cpp |

Frente a v1, V2 mejora la fidelidad (KLD global −24,2 %) y el benchmark agéntico (121 frente a 119 en thinking off) con idéntico tamaño y velocidad. Frente al modelo base en BF16, V2 sacrifica precisión numérica a cambio de ejecutarse en 12 GB de VRAM, pero queda atado a un runtime no estándar. No se dispone de datos de benchmarks estándar para comparar con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Requiere el runtime propietario L0xRE BeeLLama Low v0.1.5 o superior; la extensión GGUF no implica compatibilidad con motores estándar.
- En v0.1.4 no se aceleran cuatro de las formas de proyección de V2, por lo que en esa versión hay que quedarse con el modelo v1.
- Solo soporta inglés según la model card.
- El autor reconoce un punto débil: prompts con thinking desactivado que conservan la instrucción de razonamiento xhigh con bloque think vacío, donde algunos documentos de chat y tool obtienen peor puntuación; el modo thinking-off de v0.1.5 no genera ese prompt.
- La licencia es derivada de los términos de investigación de Qwen; es necesario revisar las restricciones de uso comercial del modelo base antes de desplegarlo en producción.
- Al ser una cuantización agresiva (mezcla de 2 y 3 bits), existe riesgo de degradación en tareas fuera del conjunto de calibración y de mayor tasa de alucinación que el modelo BF16.
- La decodificación a gran profundidad de contexto varía ampliamente entre ejecuciones por la tasa de aceptación del drafter.
- No se han publicado evaluaciones independientes ni resultados en benchmarks estándar; las cifras proceden del propio autor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YourHighnessLA/L0xRE-V2-27b-Low
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Runtime L0xRE BeeLLama Low: https://github.com/seanyourhighness/L0xRE-BeeLLama-Low
- Release del runtime v0.1.5: https://github.com/seanyourhighness/L0xRE-BeeLLama-Low/releases/tag/l0xre-v0.1.5
- Instrucciones de instalación: https://github.com/seanyourhighness/L0xRE-BeeLLama-Low#install
- Modelo v1: https://huggingface.co/YourHighnessLA/L0xRE-27b-Low
- Dataset quant-challenge golden set: https://huggingface.co/datasets/StillDeadcode/qwen3.8-27b-quant-challenge
- Benchmark club-3090: https://github.com/club-3090
