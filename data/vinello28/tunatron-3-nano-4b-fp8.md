# vinello28/Tunatron-3-Nano-4B-FP8

## Resumen

Tunatron-3-Nano-4B-FP8 es un modelo de lenguaje especializado en el triaje de hallazgos de análisis estático de seguridad (SAST), desarrollado por el usuario vinello28 como un ajuste fino del modelo base `unsloth/NVIDIA-Nemotron-3-Nano-4B`. El modelo recibe una regla CWE, un sink candidato y la porción de código hacia atrás (backward slice) que llega hasta ese sink, y decide si la vulnerabilidad es real, emitiendo un hallazgo JSON con un esquema fijo (`vulnerable`, `vex_status`, `severity`, `reasoning`, `suggested_fix`). Está pensado como ayuda al revisor humano, no como sustituto de un motor SAST ni de una revisión de seguridad.

El modelo base Nemotron 3 Nano 4B es un modelo híbrido de NVIDIA, podado y destilado a partir de Nemotron Nano 9B v2 mediante el framework Nemotron Elastic, con aproximadamente 3.973 millones de parámetros. Este repositorio concreto distribuye los pesos en formato FP8 (W8A8 con caché KV en FP8) generados con NVIDIA ModelOpt, además de las variantes BF16 y NVFP4 y el adaptador DoRA sin fusionar. El ajuste se realizó con DoRA sobre módulos de atención y MLP, con prompts y justificaciones en italiano, y cubre exclusivamente código en C, C++ y Python.

La relevancia del modelo radica en su especialización: en lugar de un LLM genérico, ofrece una tarea acotada y verificable (triaje de vulnerabilidades) con un esquema de salida estructurado, lo que facilita su integración en pipelines de seguridad. Su tamaño compacto (4B) y las variantes cuantizadas permiten desplegarlo en hardware relativamente modesto, aunque su licencia heredada del modelo base ("other") exige revisión antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (modelo base Nemotron 3 Nano 4B, familia `nemotron_h`), podada y destilada de Nemotron Nano 9B v2 |
| Parametros totales | 3.973.556.832 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrenamiento con longitud máxima de secuencia de 8192 tokens) |
| Tipos de cuantizacion | BF16, FP8 (W8A8 con caché KV FP8), NVFP4 (mixed precision); distribuidas en `model_bf16/`, `model_fp8/`, `model_nvfp4/` |
| Idiomas soportados | Italiano (prompts y justificaciones) e inglés; código en C, C++ y Python |
| Licencia | other (heredada del modelo base; consultar la model card del base) |
| Formato de pesos | safetensors (con `custom_code`); repo de 5,3 GB |

## Arquitectura y entrenamiento

El modelo parte de Nemotron 3 Nano 4B, un modelo híbrido de NVIDIA obtenido por poda y destilación desde Nemotron Nano 9B v2 con el framework Nemotron Elastic, lo que le permite heredar capacidades de razonamiento como modelo híbrido. Sobre esa base se aplicó un ajuste fino con DoRA (rank 64, alpha 64) limitado a módulos de atención y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `up_proj`, `down_proj`, `in_proj`), excluyendo explícitamente componentes de visión y de audio. El entrenamiento usó el optimizador `adamw_8bit`, learning rate 0,0002 con scheduler coseno y warmup ratio 0,03, 2 épocas, batch efectivo de 8 (8 × 1 de acumulación de gradientes), longitud máxima de secuencia de 8192 y semilla 3407. Se ejecutó en una NVIDIA RTX PRO 6000 Blackwell Server Edition (97.887 MiB) en 1 hora y 4 minutos, con una pérdida de entrenamiento final de 0,0435 (época 1,989) y de validación de 0,1949 (época 2).

El conjunto de datos de entrenamiento contiene 5.985 ejemplos (3.325 vulnerables y 2.660 no vulnerables), con validación de 402 y test de 3.266. Las fuentes de entrenamiento son secvuleval (2.553), primevul (1.492), juliet (1.125), cvefixes-python (419), codeql-tests (243) y pyvul (153); por lenguaje, 4.263 ejemplos en C, 1.084 en C++ y 638 en Python. Tanto los prompts como las justificaciones objetivo están redactados en italiano. El repositorio incluye además las variantes cuantizadas con NVIDIA ModelOpt: FP8 W8A8 con caché KV FP8 y NVFP4 para Tensor Cores de Blackwell.

## Capacidades

- Triaje de vulnerabilidades SAST: dado un CWE, un sink candidato y un backward slice numerado, determina si el sink es realmente vulnerable.
- Salida estructurada JSON con esquema fijo: `vulnerable`, `vex_status`, `severity`, `reasoning`, `suggested_fix`.
- Generación de justificación (`reasoning`) y propuesta de corrección (`suggested_fix`) en italiano.
- Análisis de código en C, C++ y Python.
- Decodificación guiada por JSON schema (utilizada en la evaluación).
- Modo de razonamiento híbrido heredado del modelo base (la evaluación se realizó con thinking desactivado).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a italiano e inglés según los tags del modelo.

## Casos de uso

- Triaje de alertas SAST en CI/CD: el modelo se integra como etapa posterior al motor SAST para descartar falsos positivos antes de abrir un ticket, recibiendo la regla CWE, el sink y el slice de código y devolviendo un JSON con la decisión y la severidad.
- Priorización de hallazgos en revisiones de seguridad: al emitir `severity` y `vex_status` estructurados, permite ordenar los hallazgos por impacto real y centrar el esfuerzo del equipo en los confirmados.
- Generación de propuestas de parche: el campo `suggested_fix` ofrece una corrección redactada en italiano que el revisor puede validar y adaptar, acelerando la remediación.
- Enriquecimiento de informes de vulnerabilidades: el `reasoning` en italiano sirve como justificación documentada para auditorías y para cumplir requisitos de trazabilidad en procesos de gestión de vulnerabilidades.
- Filtrado previo en pipelines de análisis de código propietario en C/C++/Python: con las variantes FP8 o NVFP4, el modelo cabe en GPUs de gama profesional y puede procesar lotes de candidatos con baja latencia (p50 de 1,25 s en FP8 bajo concurrencia 8).
- Asistencia a equipos de desarrollo: integrado en el IDE o en un bot de revisión de pull requests, puede señalar si un cambio introduce un flujo vulnerable y explicar por qué, siempre como ayuda y no como bloqueo automático.
- Evaluación comparativa de reglas SAST: al medir precisión y recall del modelo sobre un conjunto de hallazgos, se puede calibrar la agresividad de las reglas del motor SAST subyacente.

## Benchmarks y rendimiento

Evaluación sobre `data/test.jsonl` (200 ejemplos por formato, temperatura 0, decodificación guiada por JSON schema y thinking desactivado; la clase positiva es "vulnerable" y una salida inválida cuenta como "no vulnerable"):

| Formato | Precisión | Recall | F1 | FPR | Salidas inválidas |
|---|---|---|---|---|---|
| bf16 | 0,604 | 0,744 | 0,667 | 0,311 | 8 |
| fp8 | 0,632 | 0,769 | 0,694 | 0,287 | 9 |
| nvfp4 | 0,608 | 0,795 | 0,689 | 0,328 | 8 |

Eficiencia (una ejecución en NVIDIA RTX PRO 6000 Blackwell Server Edition, 97.887 MiB, vLLM 0.33.0, concurrencia 8):

| Formato | Latencia media (s) | p50 (s) | p95 (s) | Throughput (tok/s) | Pesos en VRAM (GiB) | VRAM pico (GB) | Disco (GB) |
|---|---|---|---|---|---|---|---|
| bf16 | 1,97 | 1,57 | 4,92 | 1011,6 | 7,5 | 77,0 | 8,0 |
| fp8 | 1,57 | 1,25 | 3,66 | 1294,9 | 5,0 | 79,7 | 5,3 |
| nvfp4 | 1,37 | 1,11 | 3,07 | 1543,7 | 3,4 | 77,5 | 3,6 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM de pesos: 7,5 GiB en BF16, 5,0 GiB en FP8 y 3,4 GiB en NVFP4.
- VRAM pico medida en la evaluación: 77,0 GB (BF16), 79,7 GB (FP8) y 77,5 GB (NVFP4), con una caché KV de entre 1,37 y 1,65 millones de tokens bajo la configuración de concurrencia empleada; el pico depende fuertemente de la concurrencia y de la longitud de contexto configurada, no solo del tamaño de los pesos.
- GPU utilizada en la evaluación: NVIDIA RTX PRO 6000 Blackwell Server Edition (97.887 MiB). NVFP4 requiere Tensor Cores Blackwell.
- Cabe en GPU de consumo por tamaño de pesos (una RTX 4090 de 24 GB aloja las variantes FP8 y NVFP4 con margen), aunque el pico de VRAM observado en la configuración de referencia supera con creces esa cifra; para uso en consumer hay que reducir concurrencia y caché KV.
- Despliegue: vLLM 0.33.0 es la opción validada en la model card; el modelo usa `custom_code` de transformers y requiere la librería `transformers` (versión de entrenamiento 5.17.0). Soporte en llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Throughput medido: 1011,6 tok/s (BF16), 1294,9 tok/s (FP8) y 1543,7 tok/s (NVFP4) bajo concurrencia 8.
- Latencia por petición bajo carga (concurrencia 8): p50 de 1,57 s (BF16), 1,25 s (FP8) y 1,11 s (NVFP4); p95 de 4,92 s, 3,66 s y 3,07 s respectivamente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tunatron-3-Nano-4B-FP8 | 3,97B | no disponible | Triaje SAST (C/C++/Python), salida JSON | other | Hugging Face (repo del autor) |
| NVIDIA-Nemotron-3-Nano-4B-FP8 | 4B (base) | no disponible | Propósito general, razonamiento híbrido, edge | no disponible en la información | Hugging Face (nvidia) |
| unsloth/NVIDIA-Nemotron-3-Nano-4B | 4B (base) | no disponible | Propósito general, cuantizaciones para fine-tuning | no disponible en la información | Hugging Face (unsloth) |

No se dispone de datos de benchmarks comparativos frente a otros modelos especializados en triaje SAST en la información proporcionada.

## Limitaciones y advertencias

- Está diseñado como ayuda al triaje para revisores humanos; no sustituye a un motor SAST ni a una revisión de seguridad.
- Espera el formato de prompt específico del proyecto (regla CWE, sink candidato y backward slice numerado); otros estilos de prompt no han sido evaluados.
- Entrenado y evaluado únicamente con funciones en C, C++ y Python de conjuntos públicos de vulnerabilidades; los resultados pueden no transferirse a otros lenguajes ni a código propietario.
- Tasa de falsos positivos relevante (FPR entre 0,287 y 0,328 según formato) y precisión moderada (0,604-0,632); un 4-4,5 % de salidas inválidas en la evaluación (contabilizadas como "no vulnerable").
- Riesgo de alucinación en el `reasoning` y en el `suggested_fix`: las justificaciones y parches deben validarse antes de aplicarse.
- Idiomas limitados a italiano e inglés; los prompts y justificaciones del sistema están en italiano, lo que puede ser una barrera para equipos hispanohablantes.
- Licencia "other" heredada del modelo base: es imprescindible revisar la model card de `unsloth/NVIDIA-Nemotron-3-Nano-4B` y de NVIDIA antes de cualquier uso comercial.
- El pico de VRAM medido en la configuración de referencia (≈77-80 GB) es muy superior al tamaño de los pesos; dimensionar el despliegue según concurrencia y longitud de contexto reales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vinello28/Tunatron-3-Nano-4B-FP8
- Modelo base (unsloth): https://huggingface.co/unsloth/NVIDIA-Nemotron-3-Nano-4B
- Nemotron 3 Nano 4B FP8 de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-FP8
- Blog de NVIDIA sobre Nemotron 3 Nano 4B: https://huggingface.co/blog/nvidia/nemotron-3-nano-4b
- Código de entrenamiento: https://github.com/BlockchainzGurus/tunatron.git (commit 04ca38edae3fd8c5066b314af09d098dc1d9e7f0)
