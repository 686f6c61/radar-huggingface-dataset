# Trivnpk/Qwen-Compiler-Mind-4B

## Resumen

Qwen-Compiler-Mind-4B v3.2.3 (Clean Reset Edition) es un ajuste fino (SFT) del modelo Qwen3ForCausalLM de 4.411 millones de parametros, publicado por el usuario Trivnpk en Hugging Face. El modelo esta orientado a razonamiento tecnico, ingenieria de sistemas, logica formal y depuracion de codigo multi-turno, con un enfasis explicito en la "higiene" de la generacion (terminacion limpia con `<|im_end|>` y ausencia de plantillas obsoletas o alucinaciones de tipo stub).

La version v3.2.3 reinicia la linea de fine-tuning volviendo al checkpoint base `0ebb9b2418` (v1.0 A100 Clean Base) para eliminar ocho generaciones de deriva acumulada por `merge_and_unload()`, sobreajuste de plantillas y fugas de tokens EOS. El entrenamiento se realizo con LoRA de una sola etapa (r=16, alpha=32, lr=8e-5, 1.5 epocas) sobre un curriculum de 3.200 muestras con enmascaramiento de perdida solo en el turno del asistente.

El modelo se distribuye en safetensors y en tres cuantizaciones GGUF (Q8_0, Q6_K, Q4_K_M) compiladas con CMake AVX2/SIMD, lo que permite despliegue tanto en servidores A100 como en CPU de portatil o dispositivos de baja memoria. La licencia es Apache 2.0 y los idiomas declarados son vietnamita e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3ForCausalLM) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k (segun tag `128k-context`; no verificado en model card) |
| Tipos de cuantizacion | Q8_0 (~4.48 GB), Q6_K (~3.46 GB), Q4_K_M (~2.59 GB) |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3ForCausalLM (transformer decoder-only denso) y se ajusta mediante SFT de una sola etapa con LoRA: rango 16, `lora_alpha=32`, learning rate `8e-5`, 1.5 epocas, schedule coseno, batch efectivo de 32 y evaluacion cada 15 pasos (mejor `eval_loss = 0.4170` en el checkpoint 135). El anclaje es el commit `0ebb9b2418` (v1.0 A100 Clean Base), lo que elimina la deriva acumulada de las versiones v2.0 a v3.2.2.

El curriculum `qwen_v3_2_3_curriculum.json` contiene 3.200 muestras (2.880 de entrenamiento y 320 de evaluacion estratificada): 600 de conversacion rapida en vietnamita y Q&A tecnico corto, 900 de codigo orientado a accion e ingenieria de sistemas (sin placeholders stub ni plantillas `SystemsUnit`), 800 de informatica formal, logica y razonamiento STEM (sin fuga del split `test` de MMLU), 820 de aritmetica GSM8K y razonamiento simbolico, y 80 dialogos multi-turno (2-3 turnos) de depuracion de codigo y autocorreccion. El enmascaramiento de perdida se aplica solo al turno del asistente (`train_on_prompt=False`), con `labels = -100` hasta el ultimo `<|im_start|>assistant\n` y terminacion verificada con `<|im_end|>` (token 151645) en las 3.200 muestras. El entrenamiento se valido en una NVIDIA A100-SXM4-80GB.

## Capacidades

- Generacion de texto conversacional en vietnamita e ingles.
- Razonamiento tecnico y de ingenieria de sistemas (compiladores, logica formal, STEM).
- Generacion de codigo orientado a accion, sin stubs ni placeholders.
- Razonamiento aritmetico y simbolico (curriculum GSM8K).
- Depuracion de codigo multi-turno con autocorreccion (2-3 turnos).
- Terminacion limpia de turnos con `<|im_end|>` (higiene EOS verificada 3/3).
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Asistencia a ingenieria de compiladores: el modelo puede razonar sobre construcciones formales y generar codigo de sistemas sin plantillas stub, adecuado para tareas de analisis estatico o generacion de parsers.
- Depuracion iterativa de codigo: los 80 dialogos multi-turno del curriculum permiten mantener conversaciones de 2-3 turnos para diagnosticar y corregir errores paso a paso.
- Razonamiento logico y STEM: el bloque de 800 muestras de logica formal e informatica teorica lo hace util para resolver problemas de demostracion y verificacion.
- Aritmetica y razonamiento simbolico: el bloque GSM8K (820 muestras) lo orienta a problemas matematicos de varios pasos con chain-of-thought.
- Atencion tecnica en vietnamita: el bloque de 600 muestras conversacionales rapidas en vietnamita permite Q&A tecnico de baja latencia en ese idioma.
- Despliegue en edge y portatiles: las cuantizaciones Q6_K (~3.46 GB) y Q4_K_M (~2.59 GB) permiten ejecucion en CPU de portatil o GPU integrada mediante Ollama o llama.cpp.
- Evaluacion de higiene de generacion: util como referencia para pipelines que necesitan terminacion EOS fiable y ausencia de fugas de plantilla.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados en NVIDIA A100:

| Benchmark | v3.2.2 | v3.2.3 | Notas |
|---|---|---|---|
| Behavioral & EOS Hygiene Probe | Fallo (`<lim_end>`, fugas) | 3/3 (100%) | EOS limpio (151645) |
| Open-Ended VN HumanEval (10 tareas) | 6/10 estricto (60.0%) | 8/10 estricto (80.0%), 10/10 higiene | Sin firmas en ingles ni limpieza regex |
| HumanEval (Pass@1, 50 tareas) | 40/50 (80.0%) | 43/50 (86.0%) | Maximo historico (+6.0%) |
| GSM8K (CoT batched, 100 tareas) | 72/100 (72.0%) | 75/100 (75.0%) | +3.0% pese a sustituir 80 muestras |
| MMLU (College CS & Formal Logic, 101 tareas) | 57/101 (56.44%) con fuga del split `test` | 51/101 (50.50%) | Puntuacion honesta sin fuga |

## Requisitos de hardware

- VRAM estimada: ~4.5 GB para Q8_0, ~3.5 GB para Q6_K, ~2.6 GB para Q4_K_M (tamanos de fichero GGUF; la VRAM real depende de la ventana de contexto y del backend).
- GPU recomendadas: NVIDIA A100-SXM4-80GB (validacion oficial del entrenamiento); cualquier GPU con al menos 6-8 GB de VRAM para Q8_0 en contexto corto.
- Cabe en GPU consumer: si, en tarjetas con 6-8 GB o mas (por ejemplo RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB) usando Q4_K_M o Q6_K.
- Opciones de despliegue: Ollama (Modelfile incluido en la model card), llama.cpp (GGUF compilado con CMake AVX2/SIMD, `-DGGML_CUDA=OFF`), safetensors para frameworks compatibles con Qwen3ForCausalLM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen-Compiler-Mind-4B v3.2.3 | 4.411 M | 128k (tag) | 86.0% (Pass@1) | 75.0% | Apache 2.0 | HF (safetensors + GGUF) |
| Qwen3-4B (base) | ~4 M | no disponible | no disponible | no disponible | Apache 2.0 | HF |
| Modelos de 4B comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros para establecer una comparativa rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Idiomas limitados a vietnamita e ingles; el castellano no esta declarado como soportado y el rendimiento en el mismo no esta verificado.
- Riesgo de alucinacion en tareas fuera del curriculum de entrenamiento (3.200 muestras), especialmente en dominios no cubiertos por los bloques de codigo, logica y STEM.
- La puntuacion MMLU honesta (50.50%) es inferior a la de la version v3.2.2 (56.44%), que estaba contaminada por fuga del split `test`; no debe compararse directamente con resultados de terceros sin verificar la ausencia de fuga.
- El contexto de 128k solo aparece como tag; no se documenta en la model card ni se verifica experimentalmente, por lo que debe tratarse con cautela en produccion.
- El modelo base declarado en Hugging Face coincide con el propio ID (`Trivnpk/Qwen-Compiler-Mind-4B`), lo que sugiere una cadena de fine-tuning sobre si misma; conviene auditar la procedencia antes de uso comercial.
- El repo ocupa 273.6 GB, muy superior al peso de los pesos en safetensors, probablemente por checkpoints intermedios; la descarga completa puede ser costosa.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre calidad ni sobre sesgos; no se documentan evaluaciones de sesgo.
- El enfasis en "higiene EOS" y "cero fugas" es una afirmacion del autor basada en 3.200 muestras; no hay validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Trivnpk/Qwen-Compiler-Mind-4B
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos.
