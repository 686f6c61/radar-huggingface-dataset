# Ttimms/KAT-Coder-V2.5-Dev-REAP-50-GGUF

## Resumen

KAT-Coder-V2.5-Dev-REAP-50-GGUF es una cuantizacion en formato GGUF del modelo KAT-Coder-V2.5-Dev de Kwaipilot, tras aplicarle una poda de expertos REAP del 50% (de 256 a 128 expertos) y eliminar la torre de vision y 333 tensores no entrenados. El resultado es un modelo hibrido Gated-DeltaNet + MoE de aproximadamente 18.540 millones de parametros totales, con unos 3.000 millones de parametros activos por token, orientado a generacion de codigo y flujos de trabajo agenticos. La ficha la publica Ttimms, que actua como cuantizador, no como autor del modelo original.

La relevancia practica del artefacto esta en el binomio tamano-rendimiento: al reducir el numero de expertos, el modelo cabe en GPU de consumo con cuantizaciones Q4_K_M (11,4 GB) y Q5_K_M (13,3 GB), y mantiene cifras de calidad notables en tareas de codigo (HumanEval+ en torno al 89-90% y MBPP+ en torno al 90,5% segun las mediciones del autor sobre la variante NVFP4A16, no sobre los GGUF). El repositorio incluye cuatro niveles de cuantizacion (Q4_K_M, Q5_K_M, Q6_K y Q8_0) y datos de rendimiento medidos en una RTX 5070 Ti de 16 GB.

La licencia Apache-2.0, heredada del modelo base, facilita el uso comercial. Conviene tener presente que el modelo base es una version "Dev", que el idioma declarado es unicamente ingles y que la arquitectura `qwen35moe` requiere una version reciente de llama.cpp; Ollama aun no la soporta segun la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Gated-DeltaNet + MoE (etiquetada `qwen35moe` en llama.cpp), derivada de Qwen3.5 MoE |
| Parametros totales | 18.543.997.568 (~18,5B) |
| Parametros activos | ~3B por token (MoE con 128 expertos tras la poda) |
| Longitud de contexto | Hasta 32.768 tokens verificados en la configuracion de referencia; no se documenta el maximo nativo del modelo base |
| Tipos de cuantizacion | GGUF: Q4_K_M (11,4 GB), Q5_K_M (13,3 GB), Q6_K (15,3 GB), Q8_0 (19,7 GB); existen tambien NVFP4A16, NVFP4-W4A4 y GPTQ en otros repositorios del mismo autor |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | Apache-2.0 (heredada de Kwaipilot/KAT-Coder-V2.5-Dev) |
| Formato de pesos | GGUF (llama.cpp); el fuente podado esta en bf16 safetensors |

## Arquitectura y entrenamiento

El modelo original es un transformer MoE hibrido con capas Gated-DeltaNet (mecanismo de atencion lineal con estado recurrente) combinado con capas de mezcla de expertos. Partia de 256 expertos y aproximadamente 69 GB en bf16. La intervencion de Ttimms aplica REAP (expert pruning guiado por la relevancia de las activaciones, del repositorio CerebrasResearch/reap) con un 50% de poda, reduciendo a 128 expertos, e incorpora una correccion de renormalizacion del router para compensar la perdida de masa de probabilidad. Ademas se elimina la torre de vision y 333 tensores no entrenados, y se descarta la cabeza MTP (multi-token prediction), lo que implica que no hay decodificacion especulativa en esta variante.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las fases de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada. La cuantizacion NVFP4A16 del autor es weight-only y data-free, con un tiempo de ejecucion reportado de 82 segundos. La conversion a GGUF se realiza con `convert_hf_to_gguf.py --no-mtp` a partir del fuente bf16 podado.

## Capacidades

- Generacion de codigo en multiples lenguajes, con enfasis en tareas de completado y sintesis a partir de instrucciones.
- Razonamiento agentico de multiples pasos (etiqueta `agentic-coding` en el repositorio), orientado a edicion de repositorios y resolucion de issues.
- Modo de pensamiento (thinking) activado por defecto en la plantilla de chat; se puede desactivar con `chat_template_kwargs: {"enable_thinking": false}`.
- Formato conversacional con plantilla Jinja compatible con `--jinja` en llama.cpp.
- Soporte de tool calling y function calling: no se documenta explicitamente en la model card, por lo que debe validarse en despliegue.
- Capacidades de vision: eliminadas en esta variante (torre de vision suprimida).
- Multilingue: limitado al ingles declarado.
- Inferencia en CPU y Apple Silicon viable gracias a los ~3B parametros activos.

## Casos de uso

- Asistente de codigo en estacion de trabajo local: con Q4_K_M (11,4 GB) el modelo cabe en una GPU de 16 GB y ofrece 181-184 tok/s de decodificacion en vacio, suficiente para autocompletado interactivo y chat en IDE sin depender de la nube.
- Resolucion de issues y parches sobre repositorios: la cifra reportada de 52,0% en SWE-bench Verified (medida sobre la variante NVFP4A16) lo situa como candidato para pipelines de reparacion automatica de errores y generacion de pull requests.
- Agente de CI/CD para generacion de tests: su rendimiento en HumanEval+ y MBPP+ (en torno al 89-90%) permite generar suites de pruebas unitarias a partir de funciones existentes y validarlas en el propio pipeline.
- Procesamiento de contexto largo en revision de codigo: con 32K tokens de ventana y prefill de ~4,7K tok/s, puede analizar ficheros completos o diffs extensos en una sola pasada, manteniendo 152 tok/s de decodificacion a 24K tokens de contexto.
- Despliegue en hardware modesto o sin GPU: al tener ~3B parametros activos, la inferencia en CPU o Apple Silicon es rapida para su tamano, lo que habilita entornos de desarrollo sin acelerador dedicado.
- Servicio interno de generacion de codigo con requisitos de licencia laxa: la licencia Apache-2.0 permite integracion en productos comerciales sin obligaciones de apertura, siempre que se respeten las condiciones de la licencia del modelo base.
- Prototipado de agentes con razonamiento multi-paso: el modo thinking por defecto facilita tareas de planificacion y descomposicion, y puede desactivarse para respuestas directas de baja latencia.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre la variante NVFP4A16 (no sobre los GGUF), decodificacion greedy y modo instruct:

| Benchmark | Resultado |
|---|---|
| HumanEval+ | ~89,0% (grafico) / ~90% (texto) |
| MBPP+ | ~90,5% (grafico) / ~90% (texto) |
| SWE-bench Verified | 52,0% |

El propio autor advierte que son extracciones unicas en greedy y que el arnes de evaluacion tiene una dispersion medida de 1,85 a 4,27 puntos porcentuales por tarea (fecha 2026-09-05), por lo que las diferencias pequenas no deben interpretarse como significativas. No se han publicado resultados de benchmarks especificos para los ficheros GGUF en la informacion disponible.

Rendimiento de inferencia medido el 2026-09-24 sobre `kat-reap50-Q4_K_M.gguf` en RTX 5070 Ti (16.303 MiB), Ryzen 5 7600, WSL2 y llama.cpp commit `3173a56`:

| Metrica | Resultado |
|---|---|
| Decodificacion, contexto vacio (T = 0 / 0,6 / 1,0) | 181,0 / 183,6 / 183,5 tok/s |
| Decodificacion a ~24K tokens de contexto (T = 0,6) | 151,9 tok/s |
| Prefill de prompt de ~24K tokens | ~4,7K tok/s (~5 s) |
| VRAM pico a 32K de contexto con KV q8_0 | 12.873 MiB de 16.303 MiB (incluye 1,3-1,9 GB del escritorio) |

## Requisitos de hardware

- VRAM estimada para inferencia: ~11,4 GB (Q4_K_M), ~13,3 GB (Q5_K_M), ~15,3 GB (Q6_K) y ~19,7 GB (Q8_0) solo para pesos; hay que sumar la cache KV, que con 32K de contexto y tipo q8_0 llevo el pico total a 12.873 MiB en la medicion de referencia.
- GPU recomendadas: RTX 5070 Ti (16 GB) verificada; cualquier GPU con 16 GB o mas (RTX 4080/4090, RTX 5080/5090, A100, H100) permite cuantizaciones superiores y mayor contexto. Q8_0 requiere mas de 16 GB o descarga parcial a CPU.
- Cabe en GPU de consumo: si, Q4_K_M y Q5_K_M en tarjetas de 16 GB; Q6_K queda muy justo en 16 GB.
- Opciones de despliegue: llama.cpp (`llama-server -m <fichero>.gguf -ngl 99`), LM Studio, koboldcpp, Jan y text-generation-webui. Ollama queda pendiente de que su llama.cpp incluya la arquitectura `qwen35moe`. La variante NVFP4A16 esta pensada para vLLM.
- Latencia y throughput: 181-184 tok/s de decodificacion en vacio y 152 tok/s a 24K de contexto en la configuracion medida; prefill de ~4,7K tok/s. Sin cabeza MTP, no hay decodificacion especulativa.
- Requiere una version reciente de llama.cpp (arquitectura hibrida `qwen35moe`); verificado con compilacion desde fuente.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| KAT-Coder-V2.5-Dev-REAP-50 (este) | ~18,5B | ~3B | 32K verificado | Apache-2.0 | Poda REAP 50%, sin vision ni MTP, GGUF |
| Kwaipilot/KAT-Coder-V2.5-Dev (base) | no disponible | no disponible | no disponible | Apache-2.0 | 256 expertos, ~69 GB bf16, incluye vision |
| Ttimms/KAT-Coder-V2.5-Dev-REAP-50-NVFP4A16 | ~18,5B | ~3B | no disponible | Apache-2.0 | Misma poda, cuantizacion FP4 para vLLM |
| Ttimms/KAT-Coder-V2.5-Dev-REAP-50-bf16 | ~18,5B | ~3B | no disponible | Apache-2.0 | Fuente podado en bf16 para re-cuantizar |

No se dispone de datos de benchmarks del modelo base ni de modelos comparables de otros autores en la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento entre familias.

## Limitaciones y advertencias

- La poda del 50% de expertos degrada la calidad respecto al modelo base; no se publican mediciones comparativas base frente a podado en la informacion disponible.
- Los benchmarks citados corresponden a la variante NVFP4A16 y a extracciones unicas en greedy, con dispersion de 1,85-4,27 pp por tarea; no deben extrapolarse sin cautela a los GGUF ni a diferencias pequenas.
- Modelo etiquetado como "Dev": puede no ser una version estable de produccion del autor original.
- Idioma limitado al ingles declarado; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Sin torre de vision: no admite entradas de imagen pese a que el modelo base pudiera incluirlas.
- Sin cabeza MTP: no hay decodificacion especulativa, lo que limita el throughput maximo alcanzable.
- Riesgo de alucinacion en codigo: como todo modelo generativo, puede producir APIs inexistentes o dependencias inventadas; requiere validacion en CI.
- Sesgos no documentados: no se publica informacion sobre sesgos del modelo base ni sobre la composicion de su dataset.
- Licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar el fichero LICENSE del repositorio original por si hubiera condiciones adicionales.
- Dependencia de version: requiere llama.cpp reciente; versiones antiguas u Ollama pueden fallar al cargar la arquitectura `qwen35moe`.
- Las cifras de rendimiento provienen de una unica maquina y una unica compilacion; deben tomarse como referencia, no como garantia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Ttimms/KAT-Coder-V2.5-Dev-REAP-50-GGUF
- Fuente podado en bf16: https://huggingface.co/Ttimms/KAT-Coder-V2.5-Dev-REAP-50-bf16
- Variante NVFP4A16 para vLLM: https://huggingface.co/Ttimms/KAT-Coder-V2.5-Dev-REAP-50-NVFP4A16
- Modelo base: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Licencia del modelo base: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev/blob/main/LICENSE
- Pipeline y benchmarks: https://github.com/t-timms/kat-coder-nvfp4
- REAP (Cerebras Research): https://github.com/CerebrasResearch/reap
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai/
- koboldcpp: https://github.com/LostRuins/koboldcpp
- Jan: https://jan.ai/
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
