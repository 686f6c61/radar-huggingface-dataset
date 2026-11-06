# vinello28/Tunatron-3-Nano-4B-BF16

## Resumen

Tunatron-3-Nano-4B-BF16 es un ajuste fino del modelo compacto NVIDIA-Nemotron-3-Nano-4B (distribuido por unsloth) especializado en la triaje de hallazgos de SAST (static application security testing). Dado un identificador de debilidad CWE, un sink candidato y la rebanada de código hacia atrás que lo alcanza, el modelo decide si el sink es realmente vulnerable y devuelve un hallazgo en JSON con un esquema fijo (`vulnerable`, `vex_status`, `severity`, `reasoning`, `suggested_fix`). Lo desarrolla el usuario vinello28 y se publica con licencia "other" heredada del modelo base.

El interés práctico reside en reducir el ruido de las herramientas SAST: en lugar de que un revisor humano descarte manualmente cada alerta, el modelo aplica un razonamiento guiado por la regla CWE sobre el flujo de datos y emite una decisión estructurada con severidad y una propuesta de corrección. El prompt de sistema y los campos de razonamiento están en italiano; los lenguajes de código soportados son C, C++ y Python.

El modelo base emplea una arquitectura híbrida Mamba-Transformer (Nemotron-H) con aproximadamente 4.000 millones de parámetros, lo que permite desplegarlo en GPUs de gama alta para consumo o en servidores con cuantización FP8/NVFP4. El ajuste se realizó con DoRA sobre módulos de atención y MLP, con 5.985 ejemplos de entrenamiento y una ventana máxima de 8.192 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-Transformer (Nemotron-H), transformer con capas de mezcla Mamba/atención |
| Parametros totales | 3.973.556.832 (≈4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (longitud máxima de secuencia usada en entrenamiento; el contexto nativo del modelo base no se especifica en la información disponible) |
| Tipos de cuantizacion | BF16 (completo), FP8 W8A8 con KV cache FP8 (NVIDIA ModelOpt), NVFP4 (NVIDIA ModelOpt, para Tensor Cores Blackwell) |
| Idiomas soportados | Italiano (prompt de sistema y racional), inglés (tags del modelo); código en C, C++ y Python |
| Licencia | other (ver model card del modelo base) |
| Formato de pesos | safetensors (transformers); carpetas `model_bf16/`, `model_fp8/`, `model_nvfp4/` y `adapter/` (DoRA sin fusionar) |

## Arquitectura y entrenamiento

El modelo base NVIDIA-Nemotron-3-Nano-4B es un modelo híbrido Mamba-Transformer de la familia Nemotron-H, orientado a eficiencia y precisión en un conjunto acotado de capacidades. Sobre él se aplicó un ajuste fino con DoRA de rango 64 y alpha 64, dirigido a módulos de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`), MLP (`up_proj`, `down_proj`) y `in_proj`, excluyendo explícitamente módulos de visión, códecs de audio y tokenizadores acústicos o semánticos. El optimizador fue AdamW de 8 bits con learning rate 2e-4, programación coseno, warmup del 3%, 2 épocas, batch efectivo de 8 y semilla 3407. El entrenamiento se ejecutó en una NVIDIA RTX PRO 6000 Blackwell Server Edition (97.887 MiB) durante 1 hora y 4 minutos, con una pérdida de entrenamiento final de 0,0435 (época 1,989) y una pérdida de validación de 0,1949 (época 2).

Los datos de entrenamiento constan de 5.985 ejemplos (3.325 vulnerables y 2.660 no vulnerables), con validación de 402 ejemplos y test de 3.266. Las fuentes de entrenamiento son secvuleval (2.553), primevul (1.492), juliet (1.125), cvefixes-python (419), codeql-tests (243) y pyvul (153); por lenguaje, 4.263 ejemplos en C, 1.084 en C++ y 638 en Python. Los prompts y el racional objetivo están redactados en italiano. No se especifica en la información disponible si hubo RLHF o DPO adicionales sobre el ajuste supervisado.

## Capacidades

- Triaje de vulnerabilidades SAST: clasifica un sink candidato como vulnerable o no vulnerable a partir de una regla CWE y una rebanada de código numerada.
- Salida estructurada en JSON con esquema fijo: `vulnerable`, `vex_status`, `severity`, `reasoning` y `suggested_fix`.
- Razonamiento justificado en italiano, con explicación del flujo de datos que lleva al sink y propuesta de corrección.
- Análisis de código en C, C++ y Python.
- Generación de texto conversacional y respuesta a instrucciones (pipeline `text-generation`).
- Compatibilidad con endpoints (tag `endpoints_compatible`) y decodificación guiada por esquema JSON.
- Modo de pensamiento desactivable: la evaluación se realizó con "thinking disabled"; el modelo base Nemotron 3 Nano soporta modo de razonamiento, aunque su comportamiento concreto tras el ajuste no está documentado en la información disponible.
- No se documentan capacidades de tool calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Triaje automatizado de alertas SAST en pipelines de CI/CD: el modelo recibe la regla CWE, el sink y la rebanada hacia atrás generada por la herramienta y emite un JSON que permite filtrar falsos positivos antes de que lleguen al revisor humano.
- Priorización por severidad: el campo `severity` del JSON permite ordenar la cola de hallazgos y asignar esfuerzo de revisión a los casos de mayor riesgo.
- Generación de propuestas de parche: el campo `suggested_fix` sirve como punto de partida para el desarrollador, que revisa y valida la corrección sugerida.
- Enriquecimiento de informes VEX: el campo `vex_status` puede alimentar flujos de gestión de vulnerabilidades y documentación de exposición de componentes.
- Revisión de código en C y C++ de sistemas embebidos o infraestructura: el modelo está entrenado mayoritariamente con ejemplos de C (4.263 de 5.985) y C++ (1.084), lo que encaja con bases de código de bajo nivel.
- Análisis de repositorios Python en auditorías internas: los 638 ejemplos de Python y las fuentes cvefixes-python y pyvul permiten aplicar el modelo a proyectos de este lenguaje.
- Formación de equipos de seguridad: el racional en italiano y la justificación del flujo de datos sirven como material didáctico sobre cómo se explota una debilidad concreta.

## Benchmarks y rendimiento

Evaluación sobre `data/test.jsonl` (200 ejemplos por formato), con temperatura 0, decodificación guiada por esquema JSON y thinking desactivado. La clase positiva es "vulnerable"; una salida inválida cuenta como "no vulnerable".

| Formato | Precision | Recall | F1 | FPR | Salidas inválidas | Ejemplos |
|---|---|---|---|---|---|---|
| bf16 | 0,604 | 0,744 | 0,667 | 0,311 | 8 | 200 |
| fp8 | 0,632 | 0,769 | 0,694 | 0,287 | 9 | 200 |
| nvfp4 | 0,608 | 0,795 | 0,689 | 0,328 | 8 | 200 |

Rendimiento y eficiencia (una ejecución en NVIDIA RTX PRO 6000 Blackwell Server Edition, 97.887 MiB, vLLM 0.33.0, concurrencia 8):

| Formato | Latencia media (s) | p50 (s) | p95 (s) | Throughput (tok/s) | Pesos en VRAM (GiB) | KV cache (tokens) | VRAM pico (GB) | Disco (GB) |
|---|---|---|---|---|---|---|---|---|
| bf16 | 1,97 | 1,57 | 4,92 | 1.011,6 | 7,5 | 1.373.828 | 77,0 | 8,0 |
| fp8 | 1,57 | 1,25 | 3,66 | 1.294,9 | 5,0 | 1.650.153 | 79,7 | 5,3 |
| nvfp4 | 1,37 | 1,11 | 3,07 | 1.543,7 | 3,4 | 1.453.624 | 77,5 | 3,6 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: los pesos en BF16 ocupan 7,5 GiB; en FP8, 5,0 GiB; en NVFP4, 3,4 GiB. La VRAM pico medida bajo carga con concurrencia 8 fue de 77,0 GB (bf16), 79,7 GB (fp8) y 77,5 GB (nvfp4), dominada por la KV cache con más de 1,3 millones de tokens en vuelo.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell Server Edition (la usada en las pruebas). Para NVFP4 se requieren Tensor Cores Blackwell; FP8 requiere soporte de FP8 en la GPU (por ejemplo, H100 o L40S).
- GPU de consumo: los pesos BF16 (7,5 GiB) caben en GPUs de consumo con 12-16 GB de VRAM, como una RTX 4090 o RTX 4080, si se limita la concurrencia y la longitud de contexto. Las versiones FP8 y NVFP4 reducen aún más el espacio de pesos, pero requieren hardware compatible.
- Opciones de despliegue: vLLM 0.33.0 (usado en la evaluación), transformers con `custom_code` (arquitectura `nemotron_h`), y cuantizaciones generadas con NVIDIA ModelOpt. No se documenta soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 1,97 s de latencia media y 1.011,6 tok/s en BF16; 1,57 s y 1.294,9 tok/s en FP8; 1,37 s y 1.543,7 tok/s en NVFP4, con concurrencia 8.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tunatron-3-Nano-4B-BF16 | ≈4B | 8.192 (entrenamiento) | Triaje SAST (C, C++, Python) | other | Hugging Face (vinello28) |
| NVIDIA-Nemotron-3-Nano-4B | ≈4B | No disponible en la información | Propósito general, agéntico | No disponible en la información | Hugging Face (nvidia, unsloth) |
| Modelos SAST genéricos | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con otras alternativas de triaje SAST en la información proporcionada.

## Limitaciones y advertencias

- Herramienta de apoyo al triaje para revisores humanos; no sustituye a un motor SAST ni a una revisión de seguridad completa.
- Espera el formato de prompt específico del proyecto (regla CWE, sink candidato y rebanada hacia atrás numerada); otros estilos de prompt no han sido evaluados.
- Entrenado y evaluado con funciones en C, C++ y Python de conjuntos públicos de vulnerabilidades; los resultados pueden no transferirse a otros lenguajes ni a código propietario.
- Tasa de falsos positivos del 28,7%-32,8% según el formato, y entre 8 y 9 salidas inválidas de 200 en la evaluación; una salida inválida se contabiliza como "no vulnerable".
- Riesgo de alucinación en el racional y en la corrección sugerida: el campo `suggested_fix` debe validarse antes de aplicarse.
- Idiomas: el prompt de sistema y los campos de razonamiento están en italiano; el soporte de otros idiomas de interacción no está documentado.
- Licencia "other" heredada del modelo base: es necesario revisar la model card de NVIDIA-Nemotron-3-Nano-4B para conocer las restricciones de uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 6 de noviembre de 2026; no hay validación externa de la comunidad.
- La VRAM pico medida (≈77-80 GB) se debe a la concurrencia y al tamaño de la KV cache; en despliegues con menor concurrencia el consumo será mucho menor, pero no se documentan cifras para esos escenarios.

## Enlaces

- [Modelo en Hugging Face: vinello28/Tunatron-3-Nano-4B-BF16](https://huggingface.co/vinello28/Tunatron-3-Nano-4B-BF16)
- [Modelo base: nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16)
- [Modelo base (unsloth): unsloth/NVIDIA-Nemotron-3-Nano-4B](https://huggingface.co/unsloth/NVIDIA-Nemotron-3-Nano-4B)
- [Blog de NVIDIA: Nemotron 3 Nano 4B](https://huggingface.co/blog/nvidia/nemotron-3-nano-4b)
- [Paper Nemotron-H: A Family of Accurate and Efficient Hybrid Mamba-Transformer Models](https://huggingface.co/papers?q=Nemotron-H)
- [Paper Nemotron-CC: Transforming Common Crawl into a Refined Long-Horizon Pretraining Dataset](https://huggingface.co/papers?q=Nemotron-CC)
- [Código de entrenamiento: BlockchainzGurus/tunatron](https://github.com/BlockchainzGurus/tunatron.git)
