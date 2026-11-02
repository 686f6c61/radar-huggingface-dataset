# ThakiCloud/Thaki-HW-27B-v0.1

## Resumen

Thaki-HW-27B-v0.1 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.8-27B, desarrollado por ThakiCloud y orientado a diseno de hardware, concretamente a la generacion de RTL en Verilog. Se trata de un checkpoint de investigacion (research preview) que parte de la arquitectura, tokenizador, codificador de vision y plantilla de chat del modelo base sin modificarlos; el unico cambio es la fusion de un LoRA de rango 8 sobre las capas lineales del modelo de lenguaje, en pesos bf16.

El modelo resuelve el problema de asistir en tareas de especificacion-a-RTL (spec-to-RTL) dentro de flujos de diseno electronico (EDA). Su relevancia es metodologica: el autor publica de forma transparente un resultado negativo, ya que no se encontro una mejora estadisticamente significativa frente al modelo base en VerilogEval ni en RTLLM, e incluso no se descarta una regresion en RTLLM. Por ello se presenta como material para investigacion y experimentacion, no como sustituto del modelo base en produccion.

Cuenta con 27.781.427.952 parametros totales (dato real de safetensors), un tamano de repositorio de 55,6 GB y una licencia Apache-2.0 heredada del base. Los idiomas declarados son ingles y coreano. No es un modelo MoE, por lo que no procede distinguir parametros activos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), heredada de Qwen3.8-27B; el fine-tune es un LoRA fusionado sobre el modelo de lenguaje |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la evaluacion usa hasta 65.536 tokens de salida) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el autor no documenta cuantizaciones) |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.8-27B: un transformer multimodal con codificador de vision y proyecciones de atencion lineal, segun los tags del repositorio (qwen3_5, image-text-to-text). El ajuste fino no altera la arquitectura, el tokenizador, el codificador de vision ni la plantilla de chat; unicamente se fusiona un LoRA de rango 8 (alpha 16) aplicado a todas las capas lineales del modelo de lenguaje, incluidas las proyecciones de atencion lineal, con el codificador de vision congelado. El entrenamiento uso lr 5e-5 constante, 1 epoca, batch 1, longitud maxima 2.048, 1.317 pasos de optimizador (lr x pasos ~ 0,066) y una fusion en fp32 sobre los pesos bf16, verificada contra el modelo LoRA sin fusionar (max |Δ| de logits fp32 <= 1e-2; tensores no objetivo identicos bit a bit).

Los datos de entrenamiento constan de 1.000 filas de especificacion a RTL. Las semillas son modulos Verilog de ESCAD/OpenRTLSet con licencia permisiva por fila (mit: 723, apache-2.0: 205, bsd-3-clause: 41, bsd-2-clause: 25, cc0-1.0: 6), con descripciones generadas por un LLM a partir del RTL fuente (no son especificaciones independientes). El codigo objetivo lo genero el propio Qwen3.8-27B en modo no-thinking (4-8 muestras por semilla) y solo se conservo si Yosys demostraba equivalencia acotada con el RTL fuente (sat -seq 50 -set-init-zero para secuencial, SAT para combinacional). Se aplicaron filtros de lista blanca SPDX, eliminacion de repositorios generadores, lint de Verilator con modulo top unico, descontaminacion contra VerilogEval, RTLLM, HWE-Bench, AcceleratorBench y un benchmark interno sellado, y deduplicacion. Se anadieron 317 filas de replay de codigo general (OpenCodeInstruct CC-BY-4.0 y subconjunto permisivo de CommitPackFT). El formato de entrenamiento son turnos de chat en modo no-thinking (enable_thinking=false), sin trazas de razonamiento; el comportamiento en modo thinking se hereda del base.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones, heredadas del modelo base Qwen3.8-27B.
- Generacion de codigo Verilog RTL a partir de especificaciones en lenguaje natural (spec-to-RTL), con interfaz de modulo fijada.
- Razonamiento en modo thinking heredado del base (no entrenado en este checkpoint), con hasta 65.536 tokens de salida en la evaluacion.
- Capacidades multimodales de entrada imagen-texto, heredadas del base (codificador de vision sin modificar).
- Codificacion general en Python, segun el conjunto de evaluacion HumanEval+MBPP.
- Soporte multilingue limitado a ingles y coreano.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigacion sobre ajuste fino en dominios de EDA: sirve como checkpoint de referencia para estudiar si el self-distillation con verificacion formal de equivalencia aporta mejoras medibles en spec-to-RTL; el propio autor documenta el resultado nulo.
- Generacion asistida de modulos Verilog de un solo modulo: util para prototipar bloques combinacionales o secuenciales simples a partir de una descripcion textual, con la salvedad de que el base rinde igual o mejor.
- Evaluacion comparativa de tecnicas de curacion de datos: el repositorio documenta el pipeline de filtrado (SPDX, Yosys, Verilator, descontaminacion), reutilizable para construir datasets RTL con trazabilidad de licencias.
- Experimentacion academica sobre regresion catastral en fine-tunes pequenos: el caso RTLLM (Δ -4,27 pp, IC 95% [-12,82, +4,27]) es un ejemplo publicado de como un piloto de 1.000 filas puede no generalizar.
- Docencia en flujos EDA con LLM: permite ilustrar el uso de Yosys y Verilator como verificadores en el bucle de generacion de datos.
- Analisis de licencias en datasets de codigo: el filtrado por fila con lista blanca SPDX y la eliminacion de repositorios generadores sirven de plantilla para auditorias de compliance.
- No se recomienda su uso en produccion de diseno de hardware; para ello el autor indica preferir el modelo base.

## Benchmarks y rendimiento

Evaluacion con el mismo arnes para base y v0.1: modo thinking activado, maximo 65.536 tokens de salida, vLLM 0.29 en bf16, muestreo de model card (T=1,0, top_p=0,95, top_k=20), bootstrap pareado por tarea (B=10.000, semilla 20261003), IC al 95%.

| Benchmark | base (correct/n, tasa) | v0.1 (correct/n, tasa) | Δ | IC 95% | Clasificacion |
|---|---|---|---|---|---|
| VerilogEval v2 spec-to-RTL (156 tareas, k=3) | 119,67/156 (0,767) | 121,00/156 (0,776) | +0,85 pp | [-2,99, +4,70] | criterios de release cumplidos, mejora no demostrada |
| RTLLM (39 tareas discriminantes, k=3) | 31,67/39 (0,812) | 30,00/39 (0,769) | -4,27 pp | [-12,82, +4,27] | criterios de release cumplidos, mejora no demostrada |
| HumanEval+MBPP (661, 1 muestra) | 649,00/661 (0,982) | 649,00/661 (0,982) | +0,00 pp | [-1,06, +1,06] | criterios de release cumplidos, mejora no demostrada |

Tasa de compilacion como metrica de referencia: Δ +2,14 pp en VerilogEval y -8,55 pp en RTLLM. Una tarea de VerilogEval pesa 0,64 pp, una de RTLLM 2,56 pp y un item de codigo 0,15 pp. El benchmark de codigo esta practicamente en techo para el base (0,98), por lo que solo puede detectar caidas. Se trata de una unica ejecucion de entrenamiento; el ruido de reentrenamiento no se ha medido.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 55,6 GB solo para pesos, mas overhead de activaciones y cache KV; se requiere al menos una GPU de 80 GB para contexto corto.
- VRAM estimada en cuantizaciones de 8 bits o 4 bits: no disponible; el autor no publica versiones cuantizadas ni cifras de VRAM.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para bf16; el modelo no cabe en GPUs de consumo de 24 GB (RTX 4090) ni de 48 GB en bf16 sin cuantizacion, que no esta documentada.
- Despliegue: el autor evaluo con vLLM 0.29 en bf16; al ser compatible con transformers y safetensors, es desplegable con TGI u otros servidores compatibles, aunque no se documentan recetas para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Almacenamiento: el repositorio ocupa 55,6 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento RTL | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thaki-HW-27B-v0.1 | 27,78 B | no disponible | VerilogEval 0,776; RTLLM 0,769 | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.8-27B (base) | 27 B (aprox.) | no disponible | VerilogEval 0,767; RTLLM 0,812 | Apache-2.0 (segun el autor) | HuggingFace |
| Otros fine-tunes RTL de ~27 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa relevante es contra su propio modelo base: el fine-tune no supera al base en ningun benchmark con significacion estadistica y podria retroceder en RTLLM. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Piloto pequeno: 1.000 filas y una sola ejecucion de entrenamiento; el ruido de reentrenamiento no se ha medido.
- Familias FIFO (5 ejemplos) y datapath de aceleradores (10 ejemplos) escasamente representadas; el comprobador de equivalencia no modela memorias ni latches, por lo que esas familias estan infrarrepresentadas.
- Los benchmarks cubren spec-to-RTL de un solo modulo y codigo Python general; no se evalua ingenieria a nivel de repositorio.
- El self-distillation agudiza lo que el base ya resuelve; no anade capacidades nuevas.
- Auditoria posterior al release: una simulacion diferencial independiente de los 1.000 ejemplos observo discrepancias en 27 ejemplos y no pudo decidir en 244; la tasa real de errores funcionales en los datos de entrenamiento no esta establecida, y el modelo no se reentreno.
- Riesgo de alucinacion en RTL: la equivalencia acotada con un RTL de referencia no prueba correccion funcional frente a una especificacion.
- Idiomas limitados a ingles y coreano; el rendimiento en castellano no esta documentado.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero el autor recomienda explicitamente el modelo base para produccion.
- No se han publicado cifras de cuantizacion, latencia ni throughput, lo que dificulta planificar despliegues.

## Enlaces

- HuggingFace: https://huggingface.co/ThakiCloud/Thaki-HW-27B-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de ingenieria (ingles): https://thakicloud.com/tech-blog/en/llmops/thaki-hw-27b-verilog-rtl-finetune/
- Blog de ingenieria (coreano): https://thakicloud.com/tech-blog/ko/llmops/thaki-hw-27b-verilog-rtl-finetune/
- Dataset de semillas: https://huggingface.co/datasets/ESCAD/OpenRTLSet
- Descripciones verificadas: https://huggingface.co/datasets/theepicflyer/openrtlset-permissive-verified
